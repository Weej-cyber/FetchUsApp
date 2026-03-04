import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', gold: '#D4A843', teal: '#2D9B8A', charcoal: '#2D3436' }

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[{ label: 'Dashboard', path: '/admin', icon: '📊' }, { label: 'Requests', path: '/admin/requests', icon: '📋' }, { label: 'Schedule', path: '/admin/schedule', icon: '📅' }, { label: 'Clients', path: '/admin/clients', icon: '👥' }].map(item => (
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
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Booking Requests</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <p style={{ fontWeight: 600 }}>No pending requests</p>
      </div>
      <BottomNav />
    </div>
  )
}

export function AdminSchedule() {
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Schedule</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
        <p style={{ fontWeight: 600 }}>No walks scheduled</p>
      </div>
      <BottomNav />
    </div>
  )
}

export function AdminClients() {
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Clients</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
        <p style={{ fontWeight: 600 }}>No clients yet</p>
      </div>
      <BottomNav />
    </div>
  )
}
