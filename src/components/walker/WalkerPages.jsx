import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', teal: '#2D9B8A', charcoal: '#2D3436', gold: '#D4A843' }

const DEMO_WALKS = [
  { id: 'demo-walk-1', duration: 30, dog_names: 'Max', client_name: 'Sarah Johnson', address: '123 Oak Street', scheduled_time: '10:00 AM', started_at: null, completed_at: null },
  { id: 'demo-walk-2', duration: 45, dog_names: 'Bella & Max', client_name: 'Sarah Johnson', address: '123 Oak Street', scheduled_time: '2:00 PM', started_at: null, completed_at: null },
  { id: 'demo-walk-3', duration: 30, dog_names: 'Charlie', client_name: 'Mike Davis', address: '456 Pine Avenue', scheduled_time: '4:30 PM', started_at: null, completed_at: null }
]

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[{ label: 'Today', path: '/walker', icon: '🐾' }, { label: 'History', path: '/walker/history', icon: '📋' }].map(item => (
        <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 24px' }}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function WalkerDashboard() {
  const { signOut } = useAuth()
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => { fetchTodayWalks() }, [])

  async function fetchTodayWalks() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('demo') === 'true') {
        setDemoMode(true); setWalks(DEMO_WALKS); setLoading(false); return
      }
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('walks').select('*').gte('created_at', today).order('started_at', { ascending: true })
      if (!data || data.length === 0) { setDemoMode(true); setWalks(DEMO_WALKS) }
      else setWalks(data)
    } catch (error) {
      console.error('Error fetching walks:', error)
      setDemoMode(true); setWalks(DEMO_WALKS)
    } finally {
      setLoading(false)
    }
  }

  async function startWalk(walkId) {
    if (walkId.startsWith('demo')) { alert('Demo mode - connect to database to use this feature'); return }
    await supabase.from('walks').update({ started_at: new Date().toISOString() }).eq('id', walkId)
    fetchTodayWalks()
  }

  async function endWalk(walkId) {
    if (walkId.startsWith('demo')) { alert('Demo mode - connect to database to use this feature'); return }
    await supabase.from('walks').update({ completed_at: new Date().toISOString() }).eq('id', walkId)
    fetchTodayWalks()
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
        {demoMode && (
          <div style={{ background: '#fef9c3', border: '2px solid #fde68a', borderRadius: '12px', padding: '10px 16px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>📱 Demo Mode - Showing sample data</p>
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}>
            <p style={{ fontWeight: 600 }}>Loading...</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Total', value: walks.length },
                { label: 'Completed', value: walks.filter(w => w.completed_at).length },
                { label: 'Remaining', value: walks.filter(w => !w.completed_at).length }
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
                {walks.map(walk => (
                  <div key={walk.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: colors.charcoal }}>{walk.scheduled_time || 'Walk'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{walk.dog_names}</div>
                        <div style={{ fontSize: '0.85rem', color: '#636e72' }}>{walk.client_name}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: walk.completed_at ? '#d1fae5' : walk.started_at ? '#fef9c3' : '#e0e7ff', color: walk.completed_at ? '#065f46' : walk.started_at ? '#92400e' : '#3730a3' }}>
                        {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#636e72', marginBottom: '12px' }}>
                      <div>📍 {walk.address}</div>
                      <div>⏱️ {walk.duration} minutes</div>
                    </div>
                    {!walk.completed_at && (
                      !walk.started_at ? (
                        <button onClick={() => startWalk(walk.id)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                          Start Walk
                        </button>
                      ) : (
                        <button onClick={() => endWalk(walk.id)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${colors.charcoal}, #636e72)`, color: 'white', fontFamily: 'Nunito', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                          End Walk
                        </button>
                      )
                    )}
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
