import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', gold: '#D4A843', teal: '#2D9B8A', charcoal: '#2D3436' }

export default function ClientHome() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 32px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Welcome!</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>FetchUs Pet Care</p>
          </div>
          <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', fontFamily: 'Nunito', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <button onClick={() => navigate('/client/book')} style={{ width: '100%', padding: '18px', borderRadius: '16px', background: `linear-gradient(135deg, ${colors.gold}, #E8B84B)`, color: 'white', border: 'none', fontFamily: 'Nunito', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', marginBottom: '24px', boxShadow: '0 4px 16px rgba(212,168,67,0.4)' }}>
          🐾 Book a Walk
        </button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
          <h3 style={{ margin: '0 0 12px', color: colors.charcoal, fontSize: '1rem' }}>Upcoming Walks</h3>
          <p style={{ margin: 0, color: '#636e72', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No upcoming walks</p>
        </div>
      </div>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
        {[{ label: 'Home', path: '/client', icon: '🏠' }, { label: 'Book', path: '/client/book', icon: '📅' }, { label: 'My Dogs', path: '/client/dogs', icon: '🐶' }, { label: 'Profile', path: '/client/profile', icon: '👤' }].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px' }}>
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
