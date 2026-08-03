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
    clearInterval(intervalRef.current)

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

    await supabase.from('walks').update({
      completed_at: new Date().toISOString(),
      duration: Math.floor(seconds / 60),
      notes: notes || null,
      photo_url,
    }).eq('id', walk.id)

    if (walk.walk_request_id) {
      await supabase.from('walk_requests').update({
        status: 'completed',
        notes: notes || null,
      }).eq('id', walk.walk_request_id)
    }

    if (walk.client_user_id) {
      await supabase.from('notifications').insert({
        user_id: walk.client_user_id,
        type: 'walk_complete',
        message: `${walk.dog_name || 'Your dog'}'s walk is complete!${notes ? ` Walker note: ${notes}` : ''}`,
        status: 'pending',
      })
    }
    // Send SMS notification for walk complete
    try {
      await supabase.functions.invoke('send-sms-direct', {
        body: {
          client_id: walk.client_id,
          walker_name: 'Your walker',
          dog_name: walk.dog_name || 'your dog',
          event_type: 'walk_completed',
        }
      })
    } catch (e) { console.error('SMS complete error:', e) }

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
  const [history, setHistory] = useState([])

  useEffect(() => { if (user?.id) fetchAll() }, [user?.id])

  async function fetchAll() {
    setLoading(true)
    if (!user?.id) { setLoading(false); return }

    const today = new Date().toISOString().split('T')[0]
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i + 1)
      return d.toISOString().split('T')[0]
    })

    const [{ data: todayData }, { data: weekData }, { data: historyData }, { data: activeData }] = await Promise.all([
      supabase.from('walk_requests').select('*, dogs(name), clients(id, user_id, users(name, phone, sms_consent))').eq('assigned_walker_id', user.id).eq('preferred_date', today).in('status', ['assigned', 'confirmed', 'in_progress']).order('preferred_time', { ascending: true }),
      supabase.from('walk_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).in('preferred_date', days).in('status', ['assigned', 'confirmed']).order('preferred_date', { ascending: true }).order('preferred_time', { ascending: true }),
      supabase.from('walks').select('*').eq('walker_id', user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(5),
      supabase.from('walks').select('*').eq('walker_id', user.id).is('completed_at', null).not('started_at', 'is', null).limit(1),
    ])

    setTodayWalks(todayData || [])
    setWeekWalks(weekData || [])
    setHistory(historyData || [])
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
      // Send SMS notification using client_id -- edge function looks up phone via SECURITY DEFINER
      try {
        await supabase.functions.invoke('send-sms-direct', {
          body: {
            client_id: req.client_id,
            walker_name: user?.name || 'Your walker',
            dog_name: req.dogs?.name || 'your dog',
            event_type: 'walk_started',
          }
        })
      } catch (e) { console.error('SMS error:', e) }
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
            Nothing scheduled this week
          </div>
        ) : weekWalks.map(w => (
          <div key={w.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.07)', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.charcoal }}>{formatDate(w.preferred_date)} at {w.preferred_time}</div>
            <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 2 }}>{w.dogs?.name ?? '—'} · {w.clients?.users?.name ?? '—'} · {w.service_type}</div>
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
