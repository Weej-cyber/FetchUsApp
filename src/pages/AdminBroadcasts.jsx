import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const logoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80'%3E%3Cg%3E%3Cellipse cx='25' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 25 25)'/%3E%3Cellipse cx='45' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 45 25)'/%3E%3Cellipse cx='25' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 25 50)'/%3E%3Cellipse cx='45' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 45 50)'/%3E%3Ccircle cx='35' cy='38' r='16' fill='%235B4B8A'/%3E%3Cellipse cx='75' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 75 25)'/%3E%3Cellipse cx='95' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 95 25)'/%3E%3Cellipse cx='75' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 75 50)'/%3E%3Cellipse cx='95' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 95 50)'/%3E%3Ccircle cx='85' cy='38' r='16' fill='%234A9F9F'/%3E%3C/g%3E%3Ctext x='115' y='55' font-family='Caveat' font-size='48' font-weight='600' fill='%235B4B8A'%3EFetchUs%3C/text%3E%3C/svg%3E`

export default function AdminBroadcasts({ onLogout }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [messageText, setMessageText] = useState('')
  const [recipientType, setRecipientType] = useState('all')

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      const { data } = await supabase
        .from('broadcast_messages')
        .select(`
          *,
          sender:users!broadcast_messages_sent_by_fkey(name)
        `)
        .order('sent_at', { ascending: false })
        .limit(10)

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    
    try {
      // Get admin user ID (using the test admin)
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@fetchus.com')
        .single()

      if (!adminUser) {
        alert('Admin user not found')
        return
      }

      const { error } = await supabase
        .from('broadcast_messages')
        .insert([{
          title,
          message_text: messageText,
          recipient_type: recipientType,
          sent_by: adminUser.id
        }])

      if (error) throw error

      // Clear form
      setTitle('')
      setMessageText('')
      setRecipientType('all')
      setShowForm(false)

      // Reload messages
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  if (loading) {
    return (
      <div className="screen">
        <div className="header">
          <div className="header-branding">
            <img src={logoSvg} alt="FetchUs" className="header-logo" />
          </div>
        </div>
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--charcoal-light)' }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="header">
        <div className="header-branding">
          <img src={logoSvg} alt="FetchUs" className="header-logo" />
          <span className="header-role">Admin</span>
        </div>
        <div className="header-icon" onClick={onLogout}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>

      <div className="screen">
        <div className="section-header">
          <h2>Broadcast Messages</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Message title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Send to</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                >
                  <option value="all">Everyone</option>
                  <option value="clients">Clients only</option>
                  <option value="walkers">Walkers only</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Message
              </button>
            </form>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>No messages yet</h3>
            <p>Send your first broadcast message</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className="card">
              <div className="card-header">
                <h4>{message.title}</h4>
                <span className="badge badge-confirmed">
                  {message.recipient_type}
                </span>
              </div>
              <p>{message.message_text}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--charcoal-light)', marginTop: '12px' }}>
                Sent by {message.sender?.name || 'Unknown'} • {new Date(message.sent_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Schedule</span>
        </button>
        <button className="nav-item active">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          <span>Messages</span>
        </button>
        <button className="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Clients</span>
        </button>
      </div>
    </>
  )
}
