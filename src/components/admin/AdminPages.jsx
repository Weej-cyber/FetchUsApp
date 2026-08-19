import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Home, ClipboardList, Users, Calendar, Wrench } from 'lucide-react'

// Looks up active users holding a given role via user_roles, so multi-role
// users (e.g. an admin who is also a walker or client) are included alongside
// single-role users. Pass select fields matching what the caller needs.
async function getUsersByRole(role, fields = 'id, name, email, phone, created_at') {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`users!inner(${fields})`)
    .eq('role', role)
    .eq('users.is_active', true)
  if (error) {
    console.error(`Failed to load users with role ${role}:`, error.message)
    return { data: null, error }
  }
  const users = (data ?? []).map(r => r.users).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return { data: users, error: null }
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function StatCard({ label, value, color = '#5B4B8A' }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#636e72', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#5B4B8A', margin: 0 }}>{title}</h2>
      {action}
    </div>
  )
}

function EmptyState({ message }) {
  return <div style={{ textAlign: 'center', padding: '24px 0', color: '#b2bec3', fontSize: '0.88rem' }}>{message}</div>
}

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }
const inputStyle = { width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 10px', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'white' }
const saveBtnStyle = { background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }
const cancelBtnStyle = { background: 'white', color: '#636e72', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }

function WalkRequestCard({ req, walkers, onDecline, onAssign }) {
  const [selectedWalker, setSelectedWalker] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [showAssign, setShowAssign] = useState(false)

  const statusColors = {
    pending:   { bg: '#FEF9C3', text: '#92400E' },
    assigned:  { bg: '#D1FAE5', text: '#065F46' },
    declined:  { bg: '#FEE2E2', text: '#991B1B' },
    confirmed: { bg: '#E0E7FF', text: '#3730A3' },
  }
  const sc = statusColors[req.status] || statusColors.pending

  async function handleAssign() {
    if (!selectedWalker) return
    setAssigning(true)
    await onAssign(req.id, selectedWalker)
    setAssigning(false)
    setShowAssign(false)
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12, borderLeft: '4px solid #5B4B8A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3436' }}>{req.dogs?.name ?? 'Unknown dog'} — {req.service_type}</div>
          <div style={{ fontSize: '0.83rem', color: '#636e72', marginTop: 2 }}>{formatDate(req.preferred_date)} at {req.preferred_time}</div>
          <div style={{ fontSize: '0.8rem', color: '#b2bec3', marginTop: 2 }}>{req.clients?.users?.name ?? 'Unknown client'} · {timeAgo(req.created_at)}</div>
        </div>
        <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{req.status}</span>
      </div>
      {req.notes && <div style={{ fontSize: '0.82rem', color: '#636e72', background: '#FAF8F3', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>"{req.notes}"</div>}
      {req.walks?.[0]?.photo_url && (
        <img src={req.walks[0].photo_url} alt="Walk photo" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
      )}
      {req.assigned_walker_id && <div style={{ fontSize: '0.8rem', color: '#2D9B8A', fontWeight: 600, marginBottom: 8 }}>Assigned to: {walkers.find(w => w.id === req.assigned_walker_id)?.name ?? 'Unknown'}</div>}
      {req.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <button onClick={() => onDecline(req.id)} style={{ background: 'white', border: '1.5px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Decline</button>
          <button onClick={() => setShowAssign(!showAssign)} style={{ background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Assign Walker</button>
        </div>
      )}
      {showAssign && req.status === 'pending' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedWalker} onChange={e => setSelectedWalker(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #DDD6FE', padding: '6px 10px', fontSize: '0.85rem', flex: 1, minWidth: 140, background: 'white' }}>
            <option value="">Select walker...</option>
            {walkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button onClick={handleAssign} disabled={!selectedWalker || assigning} style={{ background: '#2D9B8A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: !selectedWalker ? 0.5 : 1 }}>
            {assigning ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  )
}

function BoardingRequestCard({ req, walkers, onDecline, onAssign }) {
  const [selectedWalker, setSelectedWalker] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [showAssign, setShowAssign] = useState(false)

  const statusColors = {
    pending:   { bg: '#FEF9C3', text: '#92400E' },
    assigned:  { bg: '#D1FAE5', text: '#065F46' },
    declined:  { bg: '#FEE2E2', text: '#991B1B' },
    confirmed: { bg: '#E0E7FF', text: '#3730A3' },
  }
  const sc = statusColors[req.status] || statusColors.pending

  async function handleAssign() {
    if (!selectedWalker) return
    setAssigning(true)
    await onAssign(req.id, selectedWalker)
    setAssigning(false)
    setShowAssign(false)
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12, borderLeft: '4px solid #D4A843' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3436' }}>{req.dogs?.name ?? 'Unknown dog'} — Boarding</div>
          <div style={{ fontSize: '0.83rem', color: '#636e72', marginTop: 2 }}>{formatDate(req.check_in_date)} → {formatDate(req.check_out_date)}</div>
          <div style={{ fontSize: '0.8rem', color: '#b2bec3', marginTop: 2 }}>{req.clients?.users?.name ?? 'Unknown client'} · {timeAgo(req.created_at)}</div>
        </div>
        <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{req.status}</span>
      </div>
      {req.notes && <div style={{ fontSize: '0.82rem', color: '#636e72', background: '#FAF8F3', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>"{req.notes}"</div>}
      {req.assigned_walker_id && <div style={{ fontSize: '0.8rem', color: '#2D9B8A', fontWeight: 600, marginBottom: 8 }}>Assigned to: {walkers.find(w => w.id === req.assigned_walker_id)?.name ?? 'Unknown'}</div>}
      {req.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <button onClick={() => onDecline(req.id)} style={{ background: 'white', border: '1.5px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Decline</button>
          <button onClick={() => setShowAssign(!showAssign)} style={{ background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Assign Walker</button>
        </div>
      )}
      {showAssign && req.status === 'pending' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedWalker} onChange={e => setSelectedWalker(e.target.value)} style={{ borderRadius: 8, border: '1.5px solid #DDD6FE', padding: '6px 10px', fontSize: '0.85rem', flex: 1, minWidth: 140, background: 'white' }}>
            <option value="">Select walker...</option>
            {walkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button onClick={handleAssign} disabled={!selectedWalker || assigning} style={{ background: '#2D9B8A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: !selectedWalker ? 0.5 : 1 }}>
            {assigning ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  )
}

function BroadcastPanel() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    const { data } = await supabase.from('notifications').select('*').eq('type', 'broadcast').order('created_at', { ascending: false }).limit(10)
    if (data) setHistory(data)
  }

  async function sendBroadcast() {
    if (!message.trim()) return
    setSending(true)
    const { data: clients } = await getUsersByRole('client', 'id, phone')
    const withPhone = clients?.filter(c => c.phone) ?? []
    if (withPhone.length) {
      await supabase.from('notifications').insert(withPhone.map(c => ({ user_id: c.id, type: 'broadcast', message: message.trim(), phone: c.phone, status: 'pending' })))
    }
    setSending(false)
    setSent(true)
    setMessage('')
    setTimeout(() => setSent(false), 3000)
    loadHistory()
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginTop: 16 }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3436', marginBottom: 10 }}>Broadcast Message</div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message all clients..." rows={3} style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '10px 12px', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: '0.78rem', color: '#b2bec3' }}>{message.length} chars</span>
        <button onClick={sendBroadcast} disabled={!message.trim() || sending} style={{ background: sent ? '#2D9B8A' : '#5B4B8A', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: !message.trim() ? 0.5 : 1 }}>
          {sending ? 'Sending...' : sent ? 'Sent!' : 'Send to All Clients'}
        </button>
      </div>
      {history.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid #F0EDE5', paddingTop: 14 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Recent Broadcasts</div>
          {history.map(h => (
            <div key={h.id} style={{ fontSize: '0.82rem', color: '#636e72', padding: '6px 0', borderBottom: '1px solid #F0EDE5' }}>
              <span style={{ color: '#2D3436' }}>{h.message}</span>
              <span style={{ color: '#b2bec3', marginLeft: 8 }}>· {timeAgo(h.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScheduleSection({ walkers }) {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ walker_id: '', service_type: '30-min Walk', preferred_date: '', preferred_time: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadWalks() }, [])

  async function loadWalks() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('walk_requests').select('*, dogs(name), clients(users(name)), assigned_walker:users!assigned_walker_id(name)').in('status', ['assigned', 'confirmed']).gte('preferred_date', today).order('preferred_date', { ascending: true }).order('preferred_time', { ascending: true }).limit(30)
    if (data) setWalks(data)
    setLoading(false)
  }

  async function handleAddWalk(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('bookings').insert({ walker_id: form.walker_id || null, dog_ids: [], service_type: form.service_type, preferred_date: form.preferred_date, preferred_time: form.preferred_time, status: 'confirmed', notes: form.notes || null })
    setSaving(false)
    setShowAddForm(false)
    setForm({ walker_id: '', service_type: '30-min Walk', preferred_date: '', preferred_time: '', notes: '' })
    loadWalks()
  }

  return (
    <div>
      <SectionHeader title="Schedule" action={<button onClick={() => setShowAddForm(!showAddForm)} style={saveBtnStyle}>+ Add Walk</button>} />
      {showAddForm && (
        <form onSubmit={handleAddWalk} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 16, borderLeft: '4px solid #2D9B8A' }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: '#2D3436' }}>Add Walk</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelStyle}>Service Type</label>
              <select style={inputStyle} value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} required>
                <option>30-min Walk</option><option>60-min Walk</option><option>Drop-In Visit</option><option>Boarding</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assign Walker</label>
              <select style={inputStyle} value={form.walker_id} onChange={e => setForm({ ...form, walker_id: e.target.value })}>
                <option value="">Unassigned</option>
                {walkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.preferred_date} onChange={e => setForm({ ...form, preferred_date: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Time Slot</label>
              <select style={inputStyle} value={form.preferred_time} onChange={e => setForm({ ...form, preferred_time: e.target.value })} required>
                <option value="">Select...</option><option>9:30 AM</option><option>11:30 AM</option><option>1:30 PM</option><option>3:30 PM</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={saving} style={saveBtnStyle}>{saving ? 'Saving...' : 'Add Walk'}</button>
          </div>
        </form>
      )}
      {loading ? <EmptyState message="Loading schedule..." />
        : walks.length === 0 ? <EmptyState message="No upcoming walks scheduled." />
        : walks.map(w => (
          <div key={w.id} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.06)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>{w.dogs?.name ?? '—'} — {w.service_type}</div>
              <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: 2 }}>{formatDate(w.preferred_date)} · {w.preferred_time}</div>
              <div style={{ fontSize: '0.78rem', color: '#b2bec3', marginTop: 1 }}>Owner: {w.clients?.users?.name ?? '—'} · Walker: {w.assigned_walker?.name ?? 'Unassigned'}</div>
            </div>
            <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{w.status}</span>
          </div>
        ))
      }
    </div>
  )
}

function ReadOnlyStatusBadge({ status }) {
  const map = {
    pending:   { bg: '#FEF9C3', text: '#92400E', label: 'Pending' },
    assigned:  { bg: '#D1FAE5', text: '#065F46', label: 'Confirmed' },
    confirmed: { bg: '#E0E7FF', text: '#3730A3', label: 'In Progress' },
    completed: { bg: '#F0F0F0', text: '#636e72', label: 'Completed' },
    declined:  { bg: '#FEE2E2', text: '#991B1B', label: 'Declined' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.text, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

function ClientReadOnlyView({ userId, onBack }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [dogs, setDogs] = useState([])
  const [walks, setWalks] = useState([])
  const [boardings, setBoardings] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: clientRow } = await supabase.from('clients').select('id, address, access_instructions, user_id, users(name, email, phone, sms_consent)').eq('user_id', userId).single()
      setProfile(clientRow)
      const clientId = clientRow?.id
      if (!clientId) { setLoading(false); return }
      const { data: dogList } = await supabase.from('dogs').select('*').eq('client_id', clientId)
      setDogs(dogList || [])
      const { data: walkList } = await supabase.from('walk_requests').select('*, dogs(name)').eq('client_id', clientId).order('preferred_date', { ascending: false })
      setWalks(walkList || [])
      const { data: boardingList } = await supabase.from('boarding_requests').select('*, dogs(name)').eq('client_id', clientId).order('check_in_date', { ascending: false })
      setBoardings(boardingList || [])
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <EmptyState message="Loading client view..." />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#5B4B8A', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>← Back to People</button>
      </div>
      <div style={{ background: '#FFF8E7', border: '2px solid #D4A843', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
        👁 Viewing as {profile?.users?.name ?? 'this client'} — Read-only. No changes can be made from here.
      </div>

      <SectionHeader title="Profile" />
      <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2D3436', marginBottom: 6 }}>{profile?.users?.name}</div>
        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{profile?.users?.email}</div>
        {profile?.users?.phone && <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{profile.users.phone} {profile.users.sms_consent ? '(SMS consent on)' : '(SMS consent off)'}</div>}
        {profile?.address && <div style={{ fontSize: '0.85rem', color: '#636e72', marginTop: 6 }}>{profile.address}</div>}
        {profile?.access_instructions && <div style={{ fontSize: '0.85rem', color: '#636e72', marginTop: 4 }}><span style={{ fontWeight: 700 }}>Access notes: </span>{profile.access_instructions}</div>}
      </div>

      <SectionHeader title={`Dogs (${dogs.length})`} />
      {dogs.length === 0 ? <EmptyState message="No dogs on file." /> : dogs.map(d => (
        <div key={d.id} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12, display: 'flex', gap: 14 }}>
          {d.photo_url && (
            <img src={d.photo_url} alt={d.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#2D3436' }}>{d.name}{d.breed ? ` — ${d.breed}` : ''}</div>
            {d.behavioral_notes && <div style={{ fontSize: '0.82rem', color: '#636e72', marginTop: 4 }}><span style={{ fontWeight: 700 }}>Behavioral: </span>{d.behavioral_notes}</div>}
            {d.medical_needs && <div style={{ fontSize: '0.82rem', color: '#636e72', marginTop: 4 }}><span style={{ fontWeight: 700 }}>Medical: </span>{d.medical_needs}</div>}
          </div>
        </div>
      ))}

      <SectionHeader title={`Walk Requests (${walks.length})`} />
      {walks.length === 0 ? <EmptyState message="No walk requests." /> : walks.map(w => (
        <div key={w.id} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#2D3436' }}>{w.service_type}</div>
              <div style={{ fontSize: '0.83rem', color: '#636e72', marginTop: 2 }}>{w.dogs?.name && `${w.dogs.name} · `}{formatDate(w.preferred_date)} at {w.preferred_time}</div>
            </div>
            <ReadOnlyStatusBadge status={w.status} />
          </div>
        </div>
      ))}

      <SectionHeader title={`Boarding Requests (${boardings.length})`} />
      {boardings.length === 0 ? <EmptyState message="No boarding requests." /> : boardings.map(b => (
        <div key={b.id} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#2D3436' }}>{b.dogs?.name ? `${b.dogs.name}'s Boarding` : 'Boarding'}</div>
              <div style={{ fontSize: '0.83rem', color: '#636e72', marginTop: 2 }}>{formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</div>
            </div>
            <ReadOnlyStatusBadge status={b.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function RecurringWalkSection() {
  const [clients, setClients] = useState([])
  const [walkers, setWalkers] = useState([])
  const [dogs, setDogs] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ client_user_id: '', dog_id: '', service_type: '30-min Walk', preferred_time: '9:30 AM', days: [], start_date: '', weeks: 4, walker_id: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: c } = await getUsersByRole('client', 'id, name')
      setClients(c || [])
      const { data: w } = await getUsersByRole('walker', 'id, name')
      setWalkers(w || [])
    }
    load()
  }, [])

  useEffect(() => {
    async function loadDogs() {
      if (!form.client_user_id) { setDogs([]); return }
      const { data: clientRow } = await supabase.from('clients').select('id').eq('user_id', form.client_user_id).single()
      if (!clientRow) { setDogs([]); return }
      const { data: dogList } = await supabase.from('dogs').select('id, name').eq('client_id', clientRow.id)
      setDogs(dogList || [])
    }
    loadDogs()
  }, [form.client_user_id])

  async function submit() {
    setError(null)
    if (!form.client_user_id) { setError('Please select a client.'); return }
    if (form.days.length === 0) { setError('Please select at least one day of the week.'); return }
    if (!form.start_date) { setError('Please select a start date.'); return }
    setSubmitting(true)

    try {
      const { data: clientRow, error: clientErr } = await supabase.from('clients').select('id').eq('user_id', form.client_user_id).single()
      if (clientErr || !clientRow) throw new Error('Could not find this client.')

      const { error: rpcErr } = await supabase.rpc('create_recurring_walk', {
        p_client_id: clientRow.id, p_dog_id: form.dog_id || null,
        p_service_type: form.service_type, p_preferred_time: form.preferred_time,
        p_days_of_week: form.days, p_start_date: form.start_date, p_weeks: form.weeks,
        p_assigned_walker_id: form.walker_id || null, p_notes: form.notes || null,
      })
      if (rpcErr) throw rpcErr

      setSubmitting(false)
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setOpen(false); setForm({ client_user_id: '', dog_id: '', service_type: '30-min Walk', preferred_time: '9:30 AM', days: [], start_date: '', weeks: 4, walker_id: '', notes: '' }) }, 2000)
    } catch (err) {
      console.error('Recurring walk setup failed:', err)
      setSubmitting(false)
      setError('Could not set this up. Please try again.')
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="🔁 Recurring Walks" />
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ width: '100%', background: '#2D9B8A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          Set Up Recurring Walk
        </button>
      ) : submitted ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#2D9B8A' }}>Recurring walk set up for the next {form.weeks} weeks.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', borderLeft: '4px solid #2D9B8A' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Client</label>
            <select style={inputStyle} value={form.client_user_id} onChange={e => setForm({ ...form, client_user_id: e.target.value, dog_id: '' })}>
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {dogs.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Dog</label>
              <select style={inputStyle} value={form.dog_id} onChange={e => setForm({ ...form, dog_id: e.target.value })}>
                <option value="">Select a dog...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Service Type</label>
              <select style={inputStyle} value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}>
                <option>30-min Walk</option><option>60-min Walk</option><option>Drop-In Visit</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assign Walker</label>
              <select style={inputStyle} value={form.walker_id} onChange={e => setForm({ ...form, walker_id: e.target.value })}>
                <option value="">Unassigned</option>
                {walkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Days of the Week</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {WEEKDAY_LABELS.map((label, i) => {
                const selected = form.days.includes(i)
                return (
                  <button key={i} type="button"
                    onClick={() => setForm({ ...form, days: selected ? form.days.filter(d => d !== i) : [...form.days, i] })}
                    style={{ padding: '7px 11px', borderRadius: 8, border: selected ? '1.5px solid #2D9B8A' : '1.5px solid #E0E0E0', background: selected ? '#2D9B8A' : 'white', color: selected ? 'white' : '#2D3436', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Time</label>
              <select style={inputStyle} value={form.preferred_time} onChange={e => setForm({ ...form, preferred_time: e.target.value })}>
                {['9:30 AM', '11:30 AM', '1:30 PM', '3:30 PM'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" style={inputStyle} value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Number of Weeks</label>
            <input type="number" min={1} max={52} style={inputStyle} value={form.weeks} onChange={e => setForm({ ...form, weeks: Math.max(1, Math.min(52, parseInt(e.target.value) || 1)) })} />
          </div>
          {error && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 12, fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submit} disabled={submitting} style={{ flex: 1, background: '#2D9B8A', color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {submitting ? 'Setting up...' : 'Confirm'}
            </button>
            <button onClick={() => { setOpen(false); setError(null) }} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#636e72', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientReportSection() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [running, setRunning] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    async function loadClients() {
      const { data } = await getUsersByRole('client', 'id, name, email')
      setClients(data || [])
    }
    loadClients()
  }, [])

  async function runReport() {
    setReportError(null)
    if (!selectedClient) { setReportError('Please select a client.'); return }
    if (!startDate || !endDate) { setReportError('Please select a start and end date.'); return }
    if (endDate < startDate) { setReportError('End date must be after start date.'); return }
    setRunning(true)

    try {
      const { data: clientRow, error: clientErr } = await supabase.from('clients').select('id').eq('user_id', selectedClient).single()
      if (clientErr || !clientRow) throw new Error('Could not find this client\'s account.')

      const { data: walks, error: walkErr } = await supabase.from('walk_requests')
        .select('id, service_type, status, preferred_date, dogs(name)')
        .eq('client_id', clientRow.id)
        .gte('preferred_date', startDate)
        .lte('preferred_date', endDate)
        .order('preferred_date', { ascending: true })
      if (walkErr) throw walkErr

      const { data: boardings, error: boardErr } = await supabase.from('boarding_requests')
        .select('id, status, check_in_date, check_out_date, dogs(name)')
        .eq('client_id', clientRow.id)
        .gte('check_in_date', startDate)
        .lte('check_out_date', endDate)
        .order('check_in_date', { ascending: true })
      if (boardErr) throw boardErr

      const walksByType = {}
      for (const w of (walks || [])) {
        walksByType[w.service_type] = (walksByType[w.service_type] || 0) + 1
      }
      const totalNights = (boardings || []).reduce((sum, b) => {
        const nights = (new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24)
        return sum + nights
      }, 0)

      setReport({
        clientName: clients.find(c => c.id === selectedClient)?.name || 'Client',
        walks: walks || [],
        boardings: boardings || [],
        walksByType,
        totalNights,
      })
    } catch (err) {
      console.error('Report failed:', err)
      setReportError('Could not run this report. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  function exportReport() {
    if (!report) return
    const lines = []
    lines.push(`FetchUs Client Report`)
    lines.push(`Client: ${report.clientName}`)
    lines.push(`Date range: ${formatDate(startDate)} - ${formatDate(endDate)}`)
    lines.push('')
    lines.push(`WALKS (${report.walks.length} total)`)
    if (Object.keys(report.walksByType).length === 0) {
      lines.push('  None in this range.')
    } else {
      for (const [type, count] of Object.entries(report.walksByType)) {
        lines.push(`  ${type}: ${count}`)
      }
    }
    lines.push('')
    lines.push(`BOARDING (${report.boardings.length} stay${report.boardings.length !== 1 ? 's' : ''}, ${report.totalNights} night${report.totalNights !== 1 ? 's' : ''} total)`)
    if (report.boardings.length === 0) {
      lines.push('  None in this range.')
    } else {
      for (const b of report.boardings) {
        lines.push(`  ${b.dogs?.name ? b.dogs.name + ' - ' : ''}${formatDate(b.check_in_date)} to ${formatDate(b.check_out_date)} (${b.status})`)
      }
    }
    lines.push('')
    lines.push(`Generated ${new Date().toLocaleString('en-US')}`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeClient = report.clientName.replace(/[^a-z0-9]/gi, '_')
    a.href = url
    a.download = `FetchUs_${safeClient}_${startDate}_to_${endDate}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader title="📋 Client Report" />
      <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Client</label>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={inputStyle}>
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" style={inputStyle} value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        {reportError && (
          <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontWeight: 700, color: '#991B1B', fontSize: '0.85rem' }}>{reportError}</div>
        )}
        <button onClick={runReport} disabled={running} style={{ width: '100%', background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          {running ? 'Running...' : 'Run Report'}
        </button>
      </div>

      {report && (
        <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#2D3436' }}>{report.clientName}</div>
              <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{formatDate(startDate)} — {formatDate(endDate)}</div>
            </div>
            <button onClick={exportReport} style={{ background: '#2D9B8A', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ⬇ Export
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, marginTop: 14 }}>Walks ({report.walks.length})</div>
          {Object.keys(report.walksByType).length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#b2bec3', marginBottom: 16 }}>No walks in this range.</div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {Object.entries(report.walksByType).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid #F1F1F1' }}>
                  <span>{type}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Boarding ({report.boardings.length} stay{report.boardings.length !== 1 ? 's' : ''}, {report.totalNights} night{report.totalNights !== 1 ? 's' : ''})</div>
          {report.boardings.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#b2bec3' }}>No boarding in this range.</div>
          ) : (
            report.boardings.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid #F1F1F1' }}>
                <span>{b.dogs?.name ? `${b.dogs.name} — ` : ''}{formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{b.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ClientsAndWalkersSection() {
  const [viewingClientId, setViewingClientId] = useState(null)
  const [clients, setClients] = useState([])
  const [walkers, setWalkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingRole, setAddingRole] = useState('client')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [addError, setAddError] = useState('')
  const [search, setSearch] = useState('')
  const [showDeactivated, setShowDeactivated] = useState(false)
  const [deactivated, setDeactivated] = useState([])
  const [loadingDeactivated, setLoadingDeactivated] = useState(false)

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    const channel = supabase
      .channel('admin-people')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => loadAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: c }, { data: w }] = await Promise.all([
      getUsersByRole('client'),
      getUsersByRole('walker'),
    ])
    if (c) setClients(c)
    if (w) setWalkers(w)
    setLoading(false)
  }

  function openAddForm(role) {
    setAddingRole(role)
    setShowAddForm(true)
    setMagicLinkSent(false)
    setAddError('')
    setForm({ name: '', email: '', phone: '' })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id)
    if (error) {
      window.alert('Could not delete this user: ' + error.message)
      return
    }
    loadAll()
  }

  async function loadDeactivated() {
    setLoadingDeactivated(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, role')
      .eq('is_active', false)
      .order('name')
    setDeactivated(data || [])
    setLoadingDeactivated(false)
  }

  function toggleDeactivated() {
    const next = !showDeactivated
    setShowDeactivated(next)
    if (next) loadDeactivated()
  }

  async function handleReactivate(id) {
    const { error } = await supabase.from('users').update({ is_active: true }).eq('id', id)
    if (error) {
      window.alert('Could not reactivate this user: ' + error.message)
      return
    }
    loadDeactivated()
    loadAll()
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    setAddError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'https://fetchus.vercel.app',
        data: { name: form.name, phone: form.phone, role: addingRole }
      }
    })
    setSaving(false)
    if (error) {
      setAddError(error.message)
      return
    }
    setMagicLinkSent(true)
    setForm({ name: '', email: '', phone: '' })
    setTimeout(() => { setMagicLinkSent(false); setShowAddForm(false) }, 3000)
    loadAll()
  }

  const borderColor = addingRole === 'walker' ? '#2D9B8A' : '#D4A843'
  const filteredClients = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredWalkers = walkers.filter(w => w.name?.toLowerCase().includes(search.toLowerCase()) || w.email?.toLowerCase().includes(search.toLowerCase()))

  if (viewingClientId) {
    return <ClientReadOnlyView userId={viewingClientId} onBack={() => setViewingClientId(null)} />
  }

  return (
    <div>
      <SectionHeader title="Clients & Walkers" action={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleDeactivated} style={{ ...saveBtnStyle, background: showDeactivated ? '#636e72' : '#B2BEC3', color: '#2D3436' }}>
            {showDeactivated ? 'Hide Deactivated' : 'View Deactivated'}
          </button>
          <button onClick={() => openAddForm('walker')} style={{ ...saveBtnStyle, background: '#2D9B8A' }}>+ Add Walker</button>
          <button onClick={() => openAddForm('client')} style={saveBtnStyle}>+ Add Pet Parent</button>
        </div>
      } />

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 16, borderLeft: `4px solid ${borderColor}` }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: '#2D3436' }}>
            {magicLinkSent ? '✓ Magic link sent!' : `Add ${addingRole === 'walker' ? 'Walker' : 'Client'}`}
          </div>
          {!magicLinkSent && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@email.com" required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Phone (optional)</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...saveBtnStyle, background: borderColor }}>{saving ? 'Sending...' : 'Send Magic Link'}</button>
              </div>
              {addError && <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#991B1B', background: '#FEE2E2', borderRadius: 6, padding: '7px 12px' }}>{addError}</div>}
            </>
          )}
        </form>
      )}

      {showDeactivated && (
        <div style={{ background: '#FFF8E7', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 16, borderLeft: '4px solid #D4A843' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#2D3436', fontSize: '0.9rem' }}>
            Deactivated Accounts ({deactivated.length})
          </div>
          {loadingDeactivated ? <EmptyState message="Loading..." /> : (
            deactivated.length === 0
              ? <EmptyState message="No deactivated accounts." />
              : deactivated.map(u => (
                <div key={u.id} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>{u.name || '(no name)'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#F1F1F1', color: '#636e72', borderRadius: 12, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{u.role}</span>
                    <button onClick={() => handleReactivate(u.id)} style={{ background: 'none', border: 'none', color: '#2D9B8A', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Reactivate</button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pet parents and walkers..." style={{ ...inputStyle, marginBottom: 16, width: '100%', boxSizing: 'border-box' }} />

      {loading ? <EmptyState message="Loading..." /> : (
        <>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Walkers ({filteredWalkers.length})
          </div>
          {filteredWalkers.length === 0
            ? <EmptyState message="No walkers yet." />
            : filteredWalkers.map(w => (
              <div key={w.id} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.06)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #2D9B8A' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>{w.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{w.email}</div>
                  {w.phone && <div style={{ fontSize: '0.78rem', color: '#b2bec3' }}>{w.phone}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 12, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 }}>Walker</span>
                  <button onClick={() => handleDelete(w.id)} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            ))
          }

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, marginTop: 20 }}>
            Clients ({filteredClients.length})
          </div>
          {filteredClients.length === 0
            ? <EmptyState message="No pet parents yet." />
            : filteredClients.map(c => (
              <div key={c.id} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.06)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{c.email}</div>
                  {c.phone && <div style={{ fontSize: '0.78rem', color: '#b2bec3' }}>{c.phone}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#b2bec3' }}>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <button onClick={() => setViewingClientId(c.id)} style={{ background: 'none', border: '1.5px solid #5B4B8A', color: '#5B4B8A', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}>View</button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            ))
          }
        </>
      )}
    </div>
  )
}

export default function AdminPortal() {
  const { signOut, setRole } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [stats, setStats] = useState({ walksToday: null, pending: null, clients: null, walkers: null, pendingBoardings: null })
  const [requests, setRequests] = useState([])
  const [boardings, setBoardings] = useState([])
  const [walkers, setWalkers] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingBoardings, setLoadingBoardings] = useState(true)
  const [activity, setActivity] = useState([])

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    const channel = supabase
      .channel('admin-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'walk_requests' }, () => { loadStats(); loadRequests() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boarding_requests' }, () => { loadStats(); loadBoardings() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadAll() {
    await Promise.all([loadStats(), loadRequests(), loadBoardings(), loadWalkers(), loadActivity()])
  }

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0]
    const [{ count: walksToday }, { count: pending }, { count: pendingBoardings }, { data: clientList }, { data: walkerList }] = await Promise.all([
      supabase.from('walk_requests').select('*, clients!inner(users!inner(is_active))', { count: 'exact', head: true }).eq('preferred_date', today).in('status', ['assigned', 'confirmed']).eq('clients.users.is_active', true),
      supabase.from('walk_requests').select('*, clients!inner(users!inner(is_active))', { count: 'exact', head: true }).eq('status', 'pending').eq('clients.users.is_active', true),
      supabase.from('boarding_requests').select('*, clients!inner(users!inner(is_active))', { count: 'exact', head: true }).eq('status', 'pending').eq('clients.users.is_active', true),
      getUsersByRole('client', 'id'),
      getUsersByRole('walker', 'id'),
    ])
    setStats({ walksToday, pending, pendingBoardings, clients: clientList?.length ?? 0, walkers: walkerList?.length ?? 0 })
  }

  async function loadRequests() {
    setLoadingRequests(true)
    const { data } = await supabase.from('walk_requests').select('*, dogs(name), walks(photo_url), clients!inner(user_id, users!inner(name, is_active))').eq('clients.users.is_active', true).order('created_at', { ascending: false }).limit(20)
    if (data) setRequests(data)
    setLoadingRequests(false)
  }

  async function loadBoardings() {
    setLoadingBoardings(true)
    const { data } = await supabase.from('boarding_requests').select('*, dogs(name), clients!inner(user_id, users!inner(name, is_active))').eq('clients.users.is_active', true).order('created_at', { ascending: false }).limit(20)
    if (data) setBoardings(data)
    setLoadingBoardings(false)
  }

  async function loadWalkers() {
    const { data } = await getUsersByRole('walker', 'id, name')
    if (data) setWalkers(data)
  }

  async function loadActivity() {
    const { data: recentClients } = await getUsersByRole('client', 'name, created_at')
    const newClients = (recentClients ?? []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)
    const { data: recentRequests } = await supabase.from('walk_requests').select('id, service_type, created_at, status, dogs(name), clients!inner(users!inner(is_active))').eq('clients.users.is_active', true).order('created_at', { ascending: false }).limit(3)
    const feed = [
      ...(newClients ?? []).map(c => ({ label: `New pet parent: ${c.name}`, ts: c.created_at })),
      ...(recentRequests ?? []).map(r => ({ label: `Walk request: ${r.dogs?.name ?? '?'} (${r.service_type}) — ${r.status}`, ts: r.created_at })),
    ].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 6)
    setActivity(feed)
  }

  async function handleDecline(id) {
    await supabase.from('walk_requests').update({ status: 'declined' }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' } : r))
    loadStats()
  }

  async function handleAssign(id, walkerId) {
    await supabase.from('walk_requests').update({ status: 'assigned', assigned_walker_id: walkerId }).eq('id', id)
    // The client and the assigned walker are both notified automatically by
    // a database trigger on walk_requests.
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'assigned', assigned_walker_id: walkerId } : r))
    loadStats()
  }

  async function handleDeclineBoarding(id) {
    await supabase.from('boarding_requests').update({ status: 'declined' }).eq('id', id)
    setBoardings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b))
    loadStats()
  }

  async function handleAssignBoarding(id, walkerId) {
    await supabase.from('boarding_requests').update({ status: 'assigned', assigned_walker_id: walkerId }).eq('id', id)
    // The client and the assigned walker are both notified automatically by
    // a database trigger on boarding_requests.
    setBoardings(prev => prev.map(b => b.id === id ? { ...b, status: 'assigned', assigned_walker_id: walkerId } : b))
    loadStats()
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const otherRequests = requests.filter(r => r.status !== 'pending')
  const pendingBoardings = boardings.filter(b => b.status === 'pending')
  const otherBoardings = boardings.filter(b => b.status !== 'pending')

  const urgentItems = [
    ...pendingRequests.map(r => ({ kind: 'walk', id: r.id, label: `${r.dogs?.name ?? 'Unknown dog'} — ${r.service_type}`, sub: `${formatDate(r.preferred_date)} at ${r.preferred_time}`, ts: r.created_at })),
    ...pendingBoardings.map(b => ({ kind: 'boarding', id: b.id, label: `${b.dogs?.name ?? 'Unknown dog'} — Boarding`, sub: `${formatDate(b.check_in_date)} → ${formatDate(b.check_out_date)}`, ts: b.created_at })),
  ].sort((a, b) => new Date(b.ts) - new Date(a.ts))

  const TABS = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'requests', label: 'Requests', Icon: ClipboardList, badge: pendingRequests.length + pendingBoardings.length },
    { id: 'people', label: 'People', Icon: Users },
    { id: 'schedule', label: 'Schedule', Icon: Calendar },
    { id: 'tools', label: 'Tools', Icon: Wrench },
  ]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 90px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#5B4B8A', margin: 0 }}>Admin Portal</h1>
          <p style={{ color: '#636e72', fontSize: '0.85rem', margin: '4px 0 0' }}>FetchUs Pet Care</p>
        </div>
        <button onClick={signOut} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#636e72', cursor: 'pointer' }}>Sign Out</button>
      </div>

      <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '10px 14px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5B4B8A', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>View as</span>
        {[
          { role: 'admin', label: 'Admin', color: '#5B4B8A', path: '/admin' },
          { role: 'walker', label: 'Walker', color: '#2D9B8A', path: '/walker' },
          { role: 'client', label: 'Pet Parent', color: '#D4A843', path: '/client' },
        ].map(r => (
          <button
            key={r.role}
            onClick={() => { setRole(r.role); navigate(r.path) }}
            style={{ padding: '5px 14px', borderRadius: 20, border: 'none', background: r.color, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { id: 'requests', label: 'Requests', Icon: ClipboardList, color: '#5B4B8A', badge: pendingRequests.length + pendingBoardings.length },
              { id: 'people', label: 'People', Icon: Users, color: '#2D9B8A' },
              { id: 'schedule', label: 'Schedule', Icon: Calendar, color: '#D4A843' },
              { id: 'tools', label: 'Tools', Icon: Wrench, color: '#636e72' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
                  background: item.color, border: 'none', borderRadius: 16, padding: '18px 16px', height: 92,
                  cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,52,54,0.15)',
                }}
              >
                <item.Icon size={28} color="white" strokeWidth={2.2} />
                <span style={{ color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.05rem' }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#DC2626', color: 'white', borderRadius: 12, fontSize: '0.8rem', fontWeight: 800, padding: '2px 9px', minWidth: 22, textAlign: 'center' }}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            <StatCard label="Walks Today" value={stats.walksToday} color="#5B4B8A" />
            <StatCard label="Pending Requests" value={stats.pending} color="#D4A843" />
            <StatCard label="Pending Boardings" value={stats.pendingBoardings} color="#D4A843" />
            <StatCard label="Active Clients" value={stats.clients} color="#2D9B8A" />
            <StatCard label="Walkers" value={stats.walkers} color="#636e72" />
          </div>

          {urgentItems.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHeader title="Needs Your Attention" />
              <div style={{ background: 'white', borderRadius: 12, padding: '4px 0', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
                {urgentItems.slice(0, 4).map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < Math.min(urgentItems.length, 4) - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2D3436' }}>{item.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#636e72', marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <span style={{ background: '#FEF9C3', color: '#92400E', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Pending</span>
                  </div>
                ))}
              </div>
              {urgentItems.length > 4 && (
                <button onClick={() => setActiveTab('requests')} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#5B4B8A', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: '6px' }}>
                  View all {urgentItems.length} in Requests →
                </button>
              )}
            </div>
          )}

          {activity.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionHeader title="Recent Activity" />
              <div style={{ background: 'white', borderRadius: 12, padding: '4px 0', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
                {activity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < activity.length - 1 ? '1px solid #F0EDE5' : 'none' }}>
                    <span style={{ fontSize: '0.85rem', color: '#2D3436' }}>{a.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#b2bec3', whiteSpace: 'nowrap', marginLeft: 8 }}>{timeAgo(a.ts)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <>
          <RecurringWalkSection />
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Walk Requests
              {pendingRequests.length > 0 && (
                <span style={{ background: '#FEF9C3', color: '#92400E', borderRadius: 12, padding: '1px 7px', marginLeft: 6, fontSize: '0.75rem' }}>{pendingRequests.length} pending</span>
              )}
            </div>
            {loadingRequests ? <EmptyState message="Loading requests..." />
              : requests.length === 0 ? <EmptyState message="No walk requests yet." />
              : (
                <>
                  {pendingRequests.map(r => <WalkRequestCard key={r.id} req={r} walkers={walkers} onDecline={handleDecline} onAssign={handleAssign} />)}
                  {otherRequests.length > 0 && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ fontSize: '0.82rem', color: '#636e72', cursor: 'pointer', userSelect: 'none', marginBottom: 8 }}>
                        Show {otherRequests.length} resolved request{otherRequests.length > 1 ? 's' : ''}
                      </summary>
                      {otherRequests.map(r => <WalkRequestCard key={r.id} req={r} walkers={walkers} onDecline={handleDecline} onAssign={handleAssign} />)}
                    </details>
                  )}
                </>
              )
            }
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Boarding Requests
              {pendingBoardings.length > 0 && (
                <span style={{ background: '#FEF9C3', color: '#92400E', borderRadius: 12, padding: '1px 7px', marginLeft: 6, fontSize: '0.75rem' }}>{pendingBoardings.length} pending</span>
              )}
            </div>
            {loadingBoardings ? <EmptyState message="Loading boarding requests..." />
              : boardings.length === 0 ? <EmptyState message="No boarding requests yet." />
              : (
                <>
                  {pendingBoardings.map(b => <BoardingRequestCard key={b.id} req={b} walkers={walkers} onDecline={handleDeclineBoarding} onAssign={handleAssignBoarding} />)}
                  {otherBoardings.length > 0 && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ fontSize: '0.82rem', color: '#636e72', cursor: 'pointer', userSelect: 'none', marginBottom: 8 }}>
                        Show {otherBoardings.length} resolved boarding{otherBoardings.length > 1 ? 's' : ''}
                      </summary>
                      {otherBoardings.map(b => <BoardingRequestCard key={b.id} req={b} walkers={walkers} onDecline={handleDeclineBoarding} onAssign={handleAssignBoarding} />)}
                    </details>
                  )}
                </>
              )
            }
          </div>
        </>
      )}

      {activeTab === 'people' && (
        <div style={{ marginBottom: 32 }}>
          <ClientsAndWalkersSection />
        </div>
      )}

      {activeTab === 'schedule' && (
        <div style={{ marginBottom: 32 }}>
          <ScheduleSection walkers={walkers} />
        </div>
      )}

      {activeTab === 'tools' && (
        <>
          <ClientReportSection />
          <div style={{ marginBottom: 32 }}>
            <BroadcastPanel />
          </div>
        </>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E8E4DA', display: 'flex', justifyContent: 'space-around', padding: '8px 4px', zIndex: 50 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', position: 'relative',
              color: activeTab === tab.id ? '#5B4B8A' : '#b2bec3',
              fontFamily: 'Nunito, sans-serif', fontWeight: activeTab === tab.id ? 800 : 600, fontSize: '0.7rem',
            }}
          >
            <tab.Icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            {tab.label}
            {tab.badge > 0 && (
              <span style={{ position: 'absolute', top: -2, right: 0, background: '#DC2626', color: 'white', borderRadius: 10, fontSize: '0.62rem', fontWeight: 800, padding: '1px 5px', minWidth: 14, textAlign: 'center' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
