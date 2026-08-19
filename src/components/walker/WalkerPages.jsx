import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const C = {
  teal: '#2D9B8A', cream: '#FAF8F3', charcoal: '#2D3436',
  light: '#636e72', indigo: '#5B4B8A', gold: '#D4A843',
}

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

function ActiveWalkScreen({ walk, onComplete }) {
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [completeError, setCompleteError] = useState(null)
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
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleComplete() {
    setSaving(true)
    setCompleteError(null)
    clearInterval(intervalRef.current)

    try {
      let photo_url = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${walk.id}/${Date.now()}.${ext}`
        const { data: uploadData } = await supabase.storage
          .from('walk-photos')
          .upload(path, photoFile, { upsert: true })
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('walk-photos')
            .getPublicUrl(path)
          photo_url = urlData?.publicUrl || null
        }
      }

      const { error: walkError } = await supabase.from('walks').update({
        completed_at: new Date().toISOString(),
        duration: Math.floor(seconds / 60),
        notes: notes || null,
        photo_url,
      }).eq('id', walk.id)
      if (walkError) throw walkError

      if (walk.walk_request_id) {
        const { error: reqError } = await supabase.from('walk_requests').update({
          status: 'completed',
          notes: notes || null,
        }).eq('id', walk.walk_request_id)
        if (reqError) throw reqError
      }

      // The client is notified automatically by a database trigger on the
      // walks table (fires when completed_at is set).

      setSaving(false)
      setSaved(true)
      setTimeout(() => onComplete(), 1500)
    } catch (err) {
      console.error('Complete walk failed:', err)
      setSaving(false)
      setCompleteError('Could not save this walk. Please check your connection and try again.')
    }
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
            Walk Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(sent to pet parent on complete)</span>
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

        {completeError && (
          <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>{completeError}</span>
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: saving ? '#b2bec3' : C.charcoal, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.05rem', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : '✓ Complete Walk'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#b2bec3', marginTop: 10 }}>Note and photo will be sent to the pet parent.</p>
      </div>
    </div>
  )
}

export function WalkerDashboard() {
  const { signOut, user, dbRole, setRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeWalk, setActiveWalk] = useState(null)
  const [todayWalks, setTodayWalks] = useState([])
  const [weekWalks, setWeekWalks] = useState([])
  const [boardings, setBoardings] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => { if (user?.id) fetchAll() }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`walker-requests-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'walk_requests', filter: `assigned_walker_id=eq.${user.id}` }, () => fetchAll(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boarding_requests', filter: `assigned_walker_id=eq.${user.id}` }, () => fetchAll(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'walks', filter: `walker_id=eq.${user.id}` }, () => fetchAll(true))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  async function fetchAll(silent = false) {
    if (!silent) setLoading(true)
    if (!user?.id) { setLoading(false); return }

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const [{ data: todayData }, { data: weekData }, { data: historyData }, { data: activeData }, { data: boardingData }] = await Promise.all([
      supabase.from('walk_requests').select('*, dogs(name), clients(id, user_id, users(name, phone, sms_consent))').eq('assigned_walker_id', user.id).eq('preferred_date', today).in('status', ['assigned', 'confirmed', 'in_progress']).order('preferred_time', { ascending: true }),
      supabase.from('walk_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).gte('preferred_date', tomorrowStr).in('status', ['assigned', 'confirmed']).order('preferred_date', { ascending: true }).order('preferred_time', { ascending: true }),
      supabase.from('walks').select('*').eq('walker_id', user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(5),
      supabase.from('walks').select('*').eq('walker_id', user.id).is('completed_at', null).not('started_at', 'is', null).limit(1),
      supabase.from('boarding_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).in('status', ['assigned', 'confirmed']).order('check_in_date', { ascending: true }),
    ])

    setTodayWalks(todayData || [])
    setWeekWalks(weekData || [])
    setHistory(historyData || [])
    setBoardings(boardingData || [])
    if (activeData?.length > 0) setActiveWalk(activeData[0])
    else setActiveWalk(null)
    setLoading(false)
  }

  async function startWalk(req) {
    const { data: walk } = await supabase.from('walks').insert({
      walker_id: user.id,
      booking_id: null,
      walk_request_id: req.id,
      started_at: new Date().toISOString(),
      notes: null,
    }).select().single()
    await supabase.from('walk_requests').update({ status: 'in_progress' }).eq('id', req.id)
    if (walk) {
      setActiveWalk({
        ...walk,
        dog_name: req.dogs?.name,
        client_name: req.clients?.users?.name,
        client_id: req.client_id || null,
        client_user_id: req.clients?.user_id || null,
        client_phone: req.clients?.users?.phone || null,
        sms_consent: req.clients?.users?.sms_consent || false,
      })
      // The client is notified automatically by a database trigger on the
      // walks table (fires when started_at is set).
    }
  }

  if (activeWalk) {
    return <ActiveWalkScreen walk={activeWalk} onComplete={() => { setActiveWalk(null); fetchAll() }} />
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

      {dbRole && (
        <div style={{ background: '#5B4B8A', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: 700, opacity: 0.85 }}>Viewing as Walker</span>
          <button onClick={() => { setRole('admin'); navigate('/admin') }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 14px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ← Back to Admin
          </button>
        </div>
      )}

      <div style={{ background: `linear-gradient(135deg, ${C.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>My Walks</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.88rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            <p style={{ fontWeight: 700, color: C.charcoal, margin: 0 }}>No walks today</p>
          </div>
        ) : todayWalks.map(req => (
          <div key={req.id} style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(45,52,54,0.08)', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: C.charcoal }}>{req.preferred_time}</div>
                <div style={{ fontSize: '0.88rem', color: C.light, marginTop: 2 }}>{req.dogs?.name ?? '—'}</div>
                <div style={{ fontSize: '0.83rem', color: C.light }}>{req.clients?.users?.name ?? '—'}</div>
              </div>
              <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{req.service_type}</span>
            </div>
            <button onClick={() => startWalk(req)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.teal}, #3DB89A)`, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              Start Walk
            </button>
          </div>
        ))}

        <SectionHeader title="Coming Up" />
        {weekWalks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', color: C.light, fontSize: '0.88rem', boxShadow: '0 1px 4px rgba(45,52,54,0.05)' }}>
            Nothing scheduled yet
          </div>
        ) : weekWalks.map(w => (
          <div key={w.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.07)', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.charcoal }}>{formatDate(w.preferred_date)} at {w.preferred_time}</div>
            <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 2 }}>{w.dogs?.name ?? '—'} · {w.clients?.users?.name ?? '—'} · {w.service_type}</div>
          </div>
        ))}

        <SectionHeader title="Boarding" />
        {boardings.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', color: C.light, fontSize: '0.88rem', boxShadow: '0 1px 4px rgba(45,52,54,0.05)' }}>
            No boarding assignments
          </div>
        ) : boardings.map(b => (
          <div key={b.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.07)', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.charcoal }}>{formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</div>
            <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 2 }}>{b.dogs?.name ?? '—'} · {b.clients?.users?.name ?? '—'}</div>
            {b.notes && <div style={{ fontSize: '0.82rem', color: C.charcoal, background: C.cream, borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>"{b.notes}"</div>}
          </div>
        ))}

        <SectionHeader title="Recent" />
        {history.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', color: C.light, fontSize: '0.88rem', boxShadow: '0 1px 4px rgba(45,52,54,0.05)' }}>
            No completed walks yet
          </div>
        ) : history.map(walk => (
          <div key={walk.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.07)', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: '0.85rem', color: C.charcoal, fontWeight: 700 }}>{new Date(walk.completed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 9px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 700 }}>Completed</span>
            </div>
            {walk.duration && <div style={{ fontSize: '0.8rem', color: C.light }}>{walk.duration} min</div>}
            {walk.notes && <div style={{ fontSize: '0.8rem', color: C.light, marginTop: 4, padding: '6px 8px', background: C.cream, borderRadius: 6 }}>{walk.notes}</div>}
          </div>
        ))}

      </div>
    </div>
  )
}
