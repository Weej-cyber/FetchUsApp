import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', teal: '#2D9B8A', charcoal: '#2D3436', gold: '#D4A843' }

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[{ label: 'Today', path: '/walker', icon: '🐾' }, { label: 'Schedule', path: '/walker/schedule', icon: '📅' }, { label: 'History', path: '/walker/history', icon: '📋' }].map(item => (
        <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 16px' }}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function ActiveWalkScreen({ walk, onComplete }) {
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (walk.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(walk.started_at)) / 1000)
      setSeconds(elapsed)
    }
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [walk.started_at])

  async function handleComplete() {
    setSaving(true)
    clearInterval(intervalRef.current)
    await supabase.from('walks').update({
      completed_at: new Date().toISOString(),
      duration: Math.floor(seconds / 60),
      notes: notes || null,
    }).eq('id', walk.id)
    setSaving(false)
    onComplete()
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, padding: '50px 24px 32px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Walk In Progress</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{formatTimer(seconds)}</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 8 }}>{walk.dog_names || walk.dogs?.name || 'Walk'}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 4 }}>{walk.client_name || walk.clients?.users?.name}</div>
      </div>
      <div style={{ padding: '24px', paddingBottom: '40px' }}>
        <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 2px 12px rgba(45,52,54,0.08)', marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Walk Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How is the walk going? Any observations about the dog..."
            rows={5}
            style={{ width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 12px', fontSize: '0.9rem', fontFamily: 'Nunito', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: saving ? '#b2bec3' : `linear-gradient(135deg, ${colors.charcoal}, #636e72)`, color: 'white', fontFamily: 'Nunito', fontWeight: 800, fontSize: '1.05rem', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving...' : '✓ Complete Walk'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#b2bec3', marginTop: 12 }}>Notes will be saved when you complete the walk.</p>
      </div>
    </div>
  )
}

export function WalkerDashboard() {
  const { signOut, user } = useAuth()
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeWalk, setActiveWalk] = useState(null)

  useEffect(() => { fetchTodayWalks() }, [])

  async function fetchTodayWalks() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: requests } = await supabase
        .from('walk_requests')
        .select('*, dogs(name), clients(users(name))')
        .eq('assigned_walker_id', user?.id ?? '')
        .eq('preferred_date', today)
        .in('status', ['assigned', 'confirmed'])
        .order('preferred_time', { ascending: true })

      const { data: activeWalks } = await supabase
        .from('walks')
        .select('*')
        .eq('walker_id', user?.id ?? '')
        .is('completed_at', null)
        .not('started_at', 'is', null)
        .limit(1)

      if (activeWalks?.length > 0) setActiveWalk(activeWalks[0])
      else setActiveWalk(null)

      setWalks(requests || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function startWalk(req) {
    const { data: walk } = await supabase.from('walks').insert({
      walker_id: user.id,
      booking_id: null,
      started_at: new Date().toISOString(),
      notes: null,
    }).select().single()
    await supabase.from('walk_requests').update({ status: 'confirmed' }).eq('id', req.id)
    if (walk) setActiveWalk({ ...walk, dog_names: req.dogs?.name, client_name: req.clients?.users?.name })
  }

  if (activeWalk) {
    return <ActiveWalkScreen walk={activeWalk} onComplete={() => { setActiveWalk(null); fetchTodayWalks() }} />
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Today's Walks</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Your schedule</p>
          </div>
          <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', fontFamily: 'Nunito', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}><p style={{ fontWeight: 600 }}>Loading...</p></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Total', value: walks.length },
                { label: 'Completed', value: walks.filter(w => w.status === 'completed').length },
                { label: 'Remaining', value: walks.filter(w => w.status !== 'completed').length }
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(45,52,54,0.08)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.teal }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#636e72', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {walks.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <p style={{ fontWeight: 700, color: colors.charcoal }}>No walks scheduled today</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {walks.map(req => (
                  <div key={req.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: colors.charcoal }}>{req.preferred_time}</div>
                        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{req.dogs?.name ?? '—'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{req.clients?.users?.name ?? '—'}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#e0e7ff', color: '#3730a3' }}>{req.service_type}</span>
                    </div>
                    <button
                      onClick={() => startWalk(req)}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      Start Walk
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

export function WalkerSchedule() {
  const { user } = useAuth()
  const [weekData, setWeekData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchWeekSchedule() }, [])

  async function fetchWeekSchedule() {
    setLoading(true)
    const today = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d.toISOString().split('T')[0])
    }
    const { data } = await supabase
      .from('walk_requests')
      .select('*, dogs(name), clients(users(name))')
      .eq('assigned_walker_id', user?.id ?? '')
      .in('preferred_date', days)
      .in('status', ['assigned', 'confirmed'])
      .order('preferred_date', { ascending: true })
      .order('preferred_time', { ascending: true })

    setWeekData(days.map(date => ({
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      walks: (data || []).filter(w => w.preferred_date === date),
    })))
    setLoading(false)
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>This Week</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Your upcoming walks</p>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}><p style={{ fontWeight: 600 }}>Loading...</p></div>
        ) : weekData.map(day => (
          <div key={day.date} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: colors.charcoal }}>{day.label}</div>
              <span style={{ background: day.walks.length > 0 ? '#E0E7FF' : '#F5F5F5', color: day.walks.length > 0 ? '#3730A3' : '#b2bec3', borderRadius: 12, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                {day.walks.length} walk{day.walks.length !== 1 ? 's' : ''}
              </span>
            </div>
            {day.walks.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', color: '#b2bec3', fontSize: '0.85rem', boxShadow: '0 1px 4px rgba(45,52,54,0.05)' }}>No walks</div>
            ) : day.walks.map(w => (
              <div key={w.id} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 6px rgba(45,52,54,0.07)', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: colors.charcoal }}>{w.preferred_time} — {w.dogs?.name ?? '—'}</div>
                <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: 2 }}>{w.clients?.users?.name ?? '—'} · {w.service_type}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}

export function WalkerHistory() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    try {
      const { data } = await supabase.from('walks').select('*').not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(20)
      setWalks(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Walk History</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}><p style={{ fontWeight: 600 }}>Loading...</p></div>
        ) : walks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#636e72', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <p style={{ fontWeight: 600 }}>No completed walks yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {walks.map(walk => (
              <div key={walk.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: colors.charcoal }}>Walk #{walk.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{new Date(walk.completed_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#d1fae5', color: '#065f46' }}>Completed</span>
                </div>
                {walk.duration && <div style={{ fontSize: '0.8rem', color: '#636e72' }}>Duration: {walk.duration} minutes</div>}
                {walk.notes && <div style={{ fontSize: '0.8rem', color: '#636e72', marginTop: '6px', padding: '8px', background: colors.cream, borderRadius: '8px' }}>{walk.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
