import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const colors = {
  indigo: '#5B4B8A',
  cream: '#FAF8F3',
  teal: '#2D9B8A',
  charcoal: '#2D3436',
}

function BottomNav() {
  const navigate = useNavigate()
  const items = [
    { label: 'Today', path: '/walker', icon: '🐾' },
    { label: 'History', path: '/walker/history', icon: '📋' },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {items.map(item => (
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
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐾</div>
        <p style={{ fontWeight: 600 }}>No walks assigned today</p>
      </div>
      <BottomNav />
    </div>
  )
}

export function WalkerHistory() {
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.teal}, #3DB89A)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Walk History</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <p style={{ fontWeight: 600 }}>No completed walks yet</p>
      </div>
      <BottomNav />
    </div>
  )
}
