import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

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
    const { data } = await supabase.from('notifications').select('*').eq
