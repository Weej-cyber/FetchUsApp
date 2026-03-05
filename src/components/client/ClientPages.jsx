import { useNavigate } from 'react-router-dom'
import OriginalClientBook from './Book'
import OriginalClientDogs from './Dogs'
import OriginalClientProfile from './Profile'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', gold: '#D4A843', teal: '#2D9B8A', charcoal: '#2D3436' }

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[{ label: 'Home', path: '/client', icon: '🏠' }, { label: 'Book', path: '/client/book', icon: '📅' }, { label: 'My Dogs', path: '/client/dogs', icon: '🐶' }, { label: 'Profile', path: '/client/profile', icon: '👤' }].map(item => (
        <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px' }}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function ClientBook() {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh' }}>
      <OriginalClientBook />
      <BottomNav />
    </div>
  )
}

export function ClientDogs() {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh' }}>
      <OriginalClientDogs />
      <BottomNav />
    </div>
  )
}

export function ClientProfile() {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh' }}>
      <OriginalClientProfile />
      <BottomNav />
    </div>
  )
}
