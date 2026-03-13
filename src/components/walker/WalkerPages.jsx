import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const C = {
  teal: '#2D9B8A', cream: '#FAF8F3', charcoal: '#2D3436',
  light: '#636e72', indigo: '#5B4B8A', gold: '#D4A843',
}

const DEMO_TODAY = [
  { id: 'demo-t1', preferred_time: '9:30 AM', service_type: '30-min Walk', dogs: { name: 'Max' }, clients: { users: { name: 'Sarah Johnson' } }, status: 'assigned', client_user_id: 'demo-client-1' },
  { id: 'demo-t2', preferred_time: '1:30 PM', service_type: '60-min Walk', dogs: { name: 'Bella' }, clients: { users: { name: 'Mike Davis' } }, status: 'assigned', client_user_id: 'demo-client-2' },
]

const DEMO_WEEK = [
  { id: 'demo-w1', preferred_date: '', preferred_time: '10:00 AM', service_type: '30-min Walk', dogs: { name: 'Charlie' }, clients: { users: { name: 'Amy Chen' } } },
  { id: 'demo-w2', preferred_date: '', preferred_time: '2:00 PM', service_type: 'Drop-In Visit', dogs: { name: 'Luna' }, clients: { users: { name: 'Tom Baker' } } },
]

const DEMO_HISTORY = [
  { id: 'demo-h1', completed_at: new Date(Date.now() - 86400000).toISOString(), duration: 32, notes: 'Max did great today. Very energetic on the trail.' },
  { id: 'demo-h2', completed_at: new Date(Date.now() - 172800000).toISOString(), duration: 28, notes: null },
]

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function SectionHeader({ title }) {
  return (
    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: C.charcoal, margin: '28px 0 12px', borderBottom: `2px solid ${C.teal}`, paddingBottom: 8 }}>
      {title}
    </h2>
  )
}

function ActiveWalkScreen({ walk, onComplete, demoMode }) {
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (walk.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(walk.started_at)) / 1000)
      setSeconds(elapsed)
    }
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [walk.started_at])

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleComplete() {
    setSaving(true)
    clearInterval(intervalRef.current)

    if (!demoMode) {
      await supabase.from('walks').update({
        completed_at: new Date().toISOString(),
        duration: Math.floor(seconds / 60),
        notes: notes || null,
      }).eq('id', walk.id)

      if (walk.client_user_id) {
        await supabase.from('notifications').insert({
          user_id: walk.client_user_id,
          type: 'walk_complete',
          message: `${walk.dog_name || 'Your dog'}'s walk is complete!${notes ? ` Walker note: ${notes}` : ''}`,
          status: 'pending',
        })
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => onComplete(), 1500)
  }

  if (saved) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: C.teal }}>Walk Complete!</div>
          <div style={{ fontSize: '0.88rem', color: C.light, marginTop: 6 }}>Client has been notified.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.teal}, #3DB89A)`, padding: '50px 24px 32px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, opacity: 0.85, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Walk In Progress</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{formatTimer(seconds)}</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 8 }}>{walk.dog_name || 'Walk'}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 4 }}>{walk.client_name}</div>
      </div>

      <div style={{ padding: '24px 20px 48px' }}>
        <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 12px rgba(45,52,54,0.08)', marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.light, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Walk Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(sent to client on complete)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did the walk go? Any observations about the dog..."
            rows={4}
            style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 12px', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 12px rgba(45,52,54,0.08)', marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.light, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Photo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          {photoPreview && (
            <div style={{ marginBottom: 10 }}>
              <img src={photoPreview} alt="walk" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
            </div>
          )}
          <label style={{ display: 'inline-block', background: '#F0EDE5', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, color: C.indigo, cursor: 'pointer' }}>
            {photoPreview ? '📷 Change Photo' : '📷 Add Photo'}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        </div>

        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: saving ? '#b2bec3' : C.charcoal, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.05rem', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : '✓ Complete Walk'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#b2bec3', marginTop: 10 }}>Note and photo will be sent to the client.</p>
      </div>
    </div>
  )
}

export function WalkerDashboard() {
  const { signOut, user } = useAuth()
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeWalk, setActiveWalk] = useState(null)
  const [todayWalks, setTodayWalks] = useState([])
  const [weekWalks, setWeekWalks] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      if (!user?.id) {
        setDemoMode(true)
        setTodayWalks(DEMO_TODAY)
        setWeekWalks(DEMO_WEEK.map((w, i) => ({ ...w, preferred_date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0] })))
        setHistory(DEMO_HISTORY)
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i + 1)
        return d.toISOString().split('T')[0]
      })

      const [{ data: todayData }, { data: weekData }, { data: historyData }, { data: activeData }] = await Promise.all([
        supabase.from('walk_requests').select('*, dogs(name), clients(id, user_id, users(name))').eq('assigned_walker_id', user.id).eq('preferred_date', today).in('status', ['assigned', 'confirmed']).order('preferred_time', { ascending: true }),
        supabase.from('walk_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).in('preferred_date', days).in('status', ['assigned', 'confirmed']).order('preferred_date', { ascending: true }).order('preferred_time', { ascending: true }),
        supabase.from('walks').select('*').eq('walker_id', user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(5),
        supabase.from('walks').select('*').eq('walker_id', user.id).is('completed_at', null).not('started_at', 'is', null).limit(1),
      ])

      setTodayWalks(todayData || [])
      setWeekWalks(weekData || [])
      setHistory(historyData || [])
      if (activeData?.length > 0) setActiveWalk(activeData[0])
      else setActiveWalk(null)

    } catch (err) {
      console.error(err)
      setDemoMode(true)
      setTodayWalks(DEMO_TODAY)
      setHistory(DEMO_HISTORY)
    } finally {
      setLoading(false)
    }
  }

  async function startWalk(req) {
    if (demoMode) {
      setActiveWalk({
        id: 'demo-active',
        started_at: new Date().toISOString(),
        dog_name: req.dogs?.name,
        client_name: req.clients?.users?.name,
        client_user_id: req.client_user_id || null,
      })
      return
    }
    const { data: walk } = await supabase.from('walks').insert({
      walker_id: user.id,
      booking_id: null,
      started_at: new Date().toISOString(),
      notes: null,
    }).select().single()
    await supabase.from('walk_requests').update({ status: 'confirmed' }).eq('id', req.id)
    if (walk) {
      setActiveWalk({
        ...walk,
        dog_name: req.dogs?.name,
        client_name: req.clients?.users?.name,
        client_user_id: req.clients?.user_id || null,
      })
    }
  }

  if (activeWalk) {
    return <ActiveWalkScreen walk={activeWalk} demoMode={demoMode} onComplete={() => { setActiveWalk(null); fetchAll() }} />
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🐾</div>
          <p style={{ color: C.teal, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '0 0 48px', fontFamily: 'Nunito, sans-serif', background: C.cream, minHeight: '100vh' }}>

      <div style={{ background: `linear-gradient(135deg, ${C.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>My Walks</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.88rem' }}>
              {demoMode ? 'Demo Mode' : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 20px 0' }}>

        <SectionHeader title="Today" />
        {todayWalks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(45,52,54
