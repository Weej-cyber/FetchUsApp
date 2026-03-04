import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithMagicLink(email)
    if (error) {
      setError('Something went wrong. Check the email and try again.')
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #5B4B8A, #7B6BA8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>🐾</div>
          <h1 style={{ fontFamily: 'Nunito', fontSize: '2rem', fontWeight: 800, color: '#5B4B8A', margin: '0 0 8px' }}>FetchUs</h1>
          <p style={{ fontFamily: 'Nunito', color: '#636e72', fontSize: '1rem', margin: 0 }}>Pet Care Services</p>
        </div>
        {!sent ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(91,75,138,0.12)' }}>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '1.3rem', color: '#2D3436', marginBottom: '8px' }}>Sign In</h2>
            <p style={{ fontFamily: 'Nunito', color: '#636e72', fontSize: '0.9rem', marginBottom: '24px' }}>Enter your email and we'll send you a sign-in link.</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #e0e0e0', fontFamily: 'Nunito', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            {error && <p style={{ color: '#e17055', fontFamily: 'Nunito', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: loading || !email ? '#ccc' : 'linear-gradient(135deg, #5B4B8A, #7B6BA8)', color: 'white', fontFamily: 'Nunito', fontSize: '1rem', fontWeight: 700, cursor: loading || !email ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send Sign-In Link'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(91,75,138,0.12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '1.3rem', color: '#2D3436', marginBottom: '8px' }}>Check Your Email</h2>
            <p style={{ fontFamily: 'Nunito', color: '#636e72', fontSize: '0.95rem', lineHeight: 1.5 }}>We sent a sign-in link to <strong>{email}</strong>. Tap the link to sign in.</p>
            <button onClick={() => setSent(false)} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#5B4B8A', fontFamily: 'Nunito', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
