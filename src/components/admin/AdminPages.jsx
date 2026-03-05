import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', gold: '#D4A843', teal: '#2D9B8A', charcoal: '#2D3436' }

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[
        { label: 'Dashboard', path: '/admin', icon: '📊' },
        { label: 'Requests', path: '/admin/requests', icon: '📋' },
        { label: 'Schedule', path: '/admin/schedule', icon: '📅' },
        { label: 'Clients', path: '/admin/clients', icon: '👥' }
      ].map(item => (
        <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 12px' }}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function AdminDashboard() {
  const { signOut } = useAuth()
  const stats = [
    { label: 'Walks Today', value: '0', icon: '🐾' },
    { label: 'Pending', value: '0', icon: '📋' },
    { label: 'Clients', value: '0', icon: '👥' },
    { label: 'Walkers', value: '2', icon: '🦺' },
  ]
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>FetchUs Admin</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Business Dashboard</p>
          </div>
          <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', fontFamily: 'Nunito', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: colors.indigo }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#636e72', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export function AdminRequests() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchMessages() }, [])

  async function fetchMessages() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError('Could not load messages. The broadcast_messages table may not exist yet in Supabase.')
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  async function sendBroadcast() {
    if (!newMessage.trim()) return
    setSending(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase
      .from('broadcast_messages')
      .insert([{ message: newMessage.trim(), sender_id: 'admin', status: 'sent' }])
    if (error) {
      setError('Failed to send: ' + error.message)
    } else {
      setSuccess('Broadcast sent successfully!')
      setNewMessage('')
      fetchMessages()
    }
    setSending(false)
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Broadcast Messages</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
            {success}
          </div>
        )}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
          <h3 style={{ margin: '0 0 12px', fontWeight: 800, color: colors.charcoal }}>Send Broadcast Message</h3>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to all clients..."
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontFamily: 'Nunito', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
            rows={4}
          />
          <button onClick={sendBroadcast} disabled={sending || !newMessage.trim()} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: sending || !newMessage.trim() ? '#a5b4fc' : `linear-gradient(135deg, ${colors.indigo}, #4F46E5)`, color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Nunito', cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer' }}>
            {sending ? 'Sending...' : 'Send to All Clients'}
          </button>
        </div>
        <h3 style={{ fontWeight: 800, color: colors.charcoal, marginBottom: '12px' }}>Recent Messages</h3>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '20px', color: '#636e72' }}><p style={{ fontWeight: 600 }}>Loading...</p></div>
        ) : messages.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#636e72', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
            <p style={{ fontWeight: 600 }}>No messages sent yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#636e72' }}>{new Date(msg.created_at).toLocaleString()}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.teal, background: '#d1fae5', padding: '2px 8px', borderRadius: '20px' }}>{msg.status}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: colors.charcoal }}>{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

export function AdminSchedule() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ client_name: '', dog_names: '', address: '', scheduled_date: '', scheduled_time: '', duration: '30', notes: '' })

  useEffect(() => {
    fetchSchedule()
    fetchClients()
  }, [])

  async function fetchSchedule() {
    setLoading(true)
    const { data, error } = await supabase.from('walks').select('*').order('created_at', { ascending: false })
    if (error) {
      setError('Could not load schedule. The walks table may not exist yet in Supabase.')
    } else {
      setWalks(data || [])
    }
    setLoading(false)
  }

  async function fetchClients() {
    const { data } = await supabase.from('users').select('name, email').eq('role', 'client')
    if (data) setClients(data)
  }

  async function handleAddWalk() {
    if (!form.client_name.trim() || !form.scheduled_date || !form.scheduled_time) {
      setError('Client name, date and time are required')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('walks').insert([{
      client_name: form.client_name.trim(),
      dog_names: form.dog_names.trim(),
      address: form.address.trim(),
      scheduled_time: form.scheduled_time,
      duration: parseInt(form.duration),
      notes: form.notes.trim(),
      created_at: new Date(`${form.scheduled_date}T${form.scheduled_time}`).toISOString()
    }])
    if (error) {
      setError('Failed to schedule walk: ' + error.message)
    } else {
      setSuccess('Walk scheduled successfully!')
      setForm({ client_name: '', dog_names: '', address: '', scheduled_date: '', scheduled_time: '', duration: '30', notes: '' })
      setShowForm(false)
      fetchSchedule()
    }
    setSaving(false)
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Schedule</h1>
          <button onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {showForm ? 'Cancel' : '+ Add Walk'}
          </button>
        </div>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
            {success}
          </div>
        )}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: colors.charcoal }}>Schedule a Walk</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Client Name</label>
              {clients.length > 0 ? (
                <select value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.email} value={c.name}>{c.name}</option>)}
                </select>
              ) : (
                <input type="text" placeholder="Client name" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} />
              )}
            </div>
            {[
              { key: 'dog_names', label: 'Dog Name(s)', placeholder: 'Max, Bella' },
              { key: 'address', label: 'Address', placeholder: '123 Main St' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>{field.label}</label>
                <input type="text" placeholder={field.placeholder} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Date</label>
                <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Time</label>
                <input type="time" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Duration</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['15', '30', '45', '60'].map(d => (
                  <button key={d} onClick={() => setForm({ ...form, duration: d })} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: `2px solid ${form.duration === d ? colors.indigo : '#e5e7eb'}`, background: form.duration === d ? colors.indigo : 'white', color: form.duration === d ? 'white' : colors.charcoal, fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb', resize: 'none' }} rows={3} />
            </div>
            <button onClick={handleAddWalk} disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: saving ? '#a5b4fc' : `linear-gradient(135deg, ${colors.indigo}, #4F46E5)`, color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Nunito', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Scheduling...' : 'Schedule Walk'}
            </button>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}><p style={{ fontWeight: 600 }}>Loading...</p></div>
        ) : walks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#636e72', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
            <p style={{ fontWeight: 600 }}>No walks scheduled yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {walks.map(walk => (
              <div key={walk.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: colors.charcoal }}>{walk.client_name || 'Walk'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{walk.dog_names}</div>
                    <div style={{ fontSize: '0.8rem', color: '#636e72' }}>
                      {walk.scheduled_time ? `${new Date(walk.created_at).toLocaleDateString()} at ${walk.scheduled_time}` : new Date(walk.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', alignSelf: 'flex-start', background: walk.completed_at ? '#d1fae5' : walk.started_at ? '#fef9c3' : '#e0e7ff', color: walk.completed_at ? '#065f46' : walk.started_at ? '#92400e' : '#3730a3' }}>
                    {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                  </span>
                </div>
                {walk.duration && <div style={{ fontSize: '0.8rem', color: '#636e72' }}>⏱️ {walk.duration} min</div>}
                {walk.address && <div style={{ fontSize: '0.8rem', color: '#636e72' }}>📍 {walk.address}</div>}
                {walk.notes && <div style=
