import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'
import Button from '../shared/Button'

export default function AdminRequests() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchMessages()
  }, [])
  
  async function fetchMessages() {
    try {
      const { data } = await supabase
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function sendBroadcast() {
    if (!newMessage.trim()) return
    
    try {
      const { error } = await supabase
        .from('broadcast_messages')
        .insert([
          { message: newMessage, sender_id: 'admin', status: 'sent' }
        ])
      
      if (!error) {
        setNewMessage('')
        fetchMessages()
        alert('Broadcast message sent!')
      }
    } catch (error) {
      console.error('Error sending broadcast:', error)
      alert('Failed to send message')
    }
  }
  
  if (loading) {
    return (
      <div className="p-5 animate-fade-in">
        <div className="text-center py-12 text-charcoal-light">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="p-5 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Broadcast Messages</h2>
      
      {/* Send Broadcast */}
      <Card className="mb-6">
        <h3 className="font-bold mb-3">Send Broadcast Message</h3>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message to all clients..."
          className="w-full p-3 rounded-lg border-2 border-cream-dark focus:border-indigo outline-none resize-none mb-3"
          rows="4"
        />
        <Button onClick={sendBroadcast} className="w-full">
          Send to All Clients
        </Button>
      </Card>
      
      {/* Message History */}
      <h3 className="text-lg font-bold mb-3">Recent Messages</h3>
      {messages.length === 0 ? (
        <Card>
          <p className="text-center text-charcoal-light py-4">No messages sent yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <Card key={msg.id}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-charcoal-light">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
                <span className="status-badge status-confirmed">{msg.status}</span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
