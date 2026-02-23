import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const colors = {
  indigo: '#5B4B8A',
  cream: '#FAF8F3',
  gold: '#D4A843',
  teal: '#2D9B8A',
  charcoal: '#2D3436',
}

function BottomNav() {
  const navigate = useNavigate()
  const items = [
    { label: 'Home', path: '/client', icon: '🏠' },
    { label: 'Book', path: '/client/book', icon: '📅' },
    { label: 'My Dogs', path: '/client/dogs', icon: '🐶' },
    { label: 'Profile', path: '/client/profile', icon: '👤' },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {items.map(item => (
        <button key={item.path} onClick={() => navigate(item.path)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px' }}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Nunito', fontWeight: 600, color: colors.charcoal }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function ClientBook() {
  const services = [
    { name: 'Walk 5-10 min', price: '$8' },
    { name: 'Walk 15 min', price: '$15' },
    { name: 'Walk 30 min', price: '$23' },
    { name: 'Walk 45 min', price: '$35' },
    { name: 'Walk 60 min', price: '$40' },
    { name: 'Boarding', price: '$65/night' },
    { name: 'Pickup/Drop-off', price: 'from $15' },
    { name: 'Appointment Transport', price: '$15' },
  ]
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Book a Service</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Select a service to get started</p>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <h2 style={{ fontSize: '1rem', color: colors.charcoal, marginBottom: '16px', fontWeight: 700 }}>Services</h2>
        {services.map(s => (
          <div key={s.name} style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, color: colors.charcoal }}>{s.name}</span>
            <span style={{ fontWeight: 800, color: colors.indigo }}>{s.price}</span>
          </div>
        ))}
        <p style={{ fontSize: '0.8rem', color: '#636e72', textAlign: 'center', marginTop: '16px' }}>+$5 for evenings, weekends & holidays</p>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', marginTop: '16px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#636e72', fontWeight: 600 }}>💜 Venmo: @FetchUs-PetCare</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#636e72', fontWeight: 600 }}>💚 Zelle: payments@fetchus.com</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#636e72', fontWeight: 600 }}>💵 Cash accepted</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export function ClientDogs() {
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>My Dogs</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Manage dog profiles</p>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center' }}>
        <div style={{ paddingTop: '40px', color: '#636e72' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐶</div>
          <p style={{ fontWeight: 600, marginBottom: '24px' }}>No dogs added yet</p>
          <button style={{ padding: '14px 32px', borderRadius: '12px', background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, color: 'white', border: 'none', fontFamily: 'Nunito', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            + Add a Dog
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export function ClientProfile() {
  const { signOut } = useAuth()
  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>My Profile</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', color: colors.charcoal, fontSize: '1rem' }}>Payment Methods</h3>
          <p style={{ margin: '0 0 8px', color: '#636e72', fontSize: '0.9rem' }}>💜 Venmo: @FetchUs-PetCare</p>
          <p style={{ margin: '0 0 8px', color: '#636e72', fontSize: '0.9rem' }}>💚 Zelle: payments@fetchus.com</p>
          <p style={{ margin: 0, color: '#636e72', fontSize: '0.9rem' }}>💵 Cash accepted</p>
        </div>
        <button onClick={signOut} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', color: colors.indigo, border: `2px solid ${colors.indigo}`, fontFamily: 'Nunito', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
