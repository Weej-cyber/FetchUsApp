import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { COLORS as C } from '../../theme'
import PortalHeader from '../shared/PortalHeader'

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
    <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: C.charcoal, margin: '28px 0 12px', borderBottom: `2px solid ${C.teal}`, paddingBottom: 8 }}>
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
          <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: '50%', background: '#EEF3F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
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
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0EDE5', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, color: C.indigo, cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {photoPreview ? 'Change Photo' : 'Add Photo'}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        </div>

        {completeError && (
          <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>{completeError}</span>
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: saving ? '#b2bec3' : C.charcoal, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1.05rem', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : 'Complete Walk'}
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
  const [phoneRequired, setPhoneRequired] = useState(false)
  const [gatePhone, setGatePhone] = useState('')
  const [gateConsent, setGateConsent] = useState(false)
  const [gateSubmitting, setGateSubmitting] = useState(false)
  const [gateError, setGateError] = useState(null)

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

    const [{ data: todayData }, { data: weekData }, { data: historyData }, { data: activeData }, { data: boardingData }, { data: myUser }] = await Promise.all([
      supabase.from('walk_requests').select('*, dogs(name), clients(id, user_id, users(name, phone, sms_consent))').eq('assigned_walker_id', user.id).eq('preferred_date', today).in('status', ['assigned', 'confirmed', 'in_progress']).order('preferred_time', { ascending: true }),
      supabase.from('walk_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).gte('preferred_date', tomorrowStr).in('status', ['assigned', 'confirmed']).order('preferred_date', { ascending: true }).order('preferred_time', { ascending: true }),
      supabase.from('walks').select('*').eq('walker_id', user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(5),
      supabase.from('walks').select('*').eq('walker_id', user.id).is('completed_at', null).not('started_at', 'is', null).limit(1),
      supabase.from('boarding_requests').select('*, dogs(name), clients(users(name))').eq('assigned_walker_id', user.id).in('status', ['assigned', 'confirmed']).order('check_in_date', { ascending: true }),
      supabase.from('users').select('phone, sms_consent').eq('id', user.id).single(),
    ])

    setPhoneRequired(!myUser?.phone || !myUser.phone.trim())
    setTodayWalks(todayData || [])
    setWeekWalks(weekData || [])
    setHistory(historyData || [])
    setBoardings(boardingData || [])
    if (activeData?.length > 0) setActiveWalk(activeData[0])
    else setActiveWalk(null)
    setLoading(false)
  }

  async function submitGate() {
    setGateError(null)
    if (!gatePhone.trim()) { setGateError('A phone number is required.'); return }
    setGateSubmitting(true)
    const { error } = await supabase.from('users').update({
      phone: gatePhone,
      sms_consent: gateConsent,
      ...(gateConsent ? { sms_consent_at: new Date().toISOString() } : {}),
    }).eq('id', user.id)
    if (error) {
      console.error('Save phone failed:', error)
      setGateSubmitting(false)
      setGateError('Could not save. Please check your connection and try again.')
      return
    }
    setGateSubmitting(false)
    setPhoneRequired(false)
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill={C.teal} style={{ margin: '0 auto 12px', display: 'block' }}><circle cx="7" cy="7" r="2.6"/><circle cx="13.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="10" r="2.4"/><ellipse cx="12" cy="16" rx="6" ry="5"/></svg>
          <p style={{ color: C.teal, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (phoneRequired) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 14, padding: '24px 20px', boxShadow: '0 2px 10px rgba(45,52,54,0.08)', maxWidth: 420, width: '100%' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: C.teal, marginBottom: 6, textAlign: 'center' }}>One Quick Thing</div>
          <p style={{ fontSize: '0.9rem', color: C.light, textAlign: 'center', marginBottom: 20 }}>
            A phone number is required before you can use FetchUs. This is how you'll be notified about walk assignments.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.light, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Phone Number</label>
            <input type="tel" style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '9px 11px', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box' }} value={gatePhone} onChange={e => setGatePhone(e.target.value)} placeholder="(555) 123-4567" autoFocus />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 18, cursor: 'pointer' }}>
            <input type="checkbox" checked={gateConsent} onChange={e => setGateConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: '0.82rem', color: C.charcoal }}>I agree to receive text messages from FetchUs about my walk assignments. Message and data rates may apply. Reply STOP to opt out.</span>
          </label>
          {gateError && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 14, fontWeight: 600 }}>{gateError}</div>}
          <button onClick={submitGate} disabled={gateSubmitting || !gatePhone.trim()} style={{ width: '100%', background: C.teal, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: !gatePhone.trim() ? 0.5 : 1 }}>
            {gateSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '0 0 48px', fontFamily: 'Nunito, sans-serif', background: C.cream, minHeight: '100vh' }}>

      {dbRole && (
        <div style={{ background: '#182B4A', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: 700, opacity: 0.85 }}>Viewing as Walker</span>
          <button onClick={() => { setRole('admin'); navigate('/admin') }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 14px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ← Back to Admin
          </button>
        </div>
      )}

      <PortalHeader
        variant="banner"
        background={`linear-gradient(135deg, ${C.teal}, #3DB89A)`}
        title="My Walks"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        onSignOut={signOut}
      />

      <div style={{ padding: '8px 20px 0' }}>

        <SectionHeader title="Today" />
        {todayWalks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 15l2 2 4-4"/></svg>
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
              <span style={{ background: '#E3EAF2', color: '#1F3A5F', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{req.service_type}</span>
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
