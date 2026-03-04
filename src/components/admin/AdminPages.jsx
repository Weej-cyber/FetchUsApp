import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const colors = { indigo: '#5B4B8A', cream: '#FAF8F3', gold: '#D4A843', teal: '#2D9B8A', charcoal: '#2D3436' }

function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', boxShadow: '0 -4px 16px rgba(45,52,54,0.15)', maxWidth: '430px', margin: '0 auto' }}>
      {[{ label: 'Dashboard', path: '/admin', icon: '📊' }, { label: 'Messaging', path: '/admin/requests', icon: '📋' }, { label: 'Schedule', path: '/admin/schedule', icon: '📅' }, { label: 'Clients', path: '/admin/clients', icon: '👥' }].map(item => (
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
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Messaging</h1>
      </div>
      <div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center', paddingTop: '60px', color: '#636e72' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <p style={{ fontWeight: 600 }}>No messages yet</p>
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
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'client' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return }
    setSaving(true)
    setError(null)
    try {
      const { error: signUpError } = await supabase.auth.signInWithOtp({ email: form.email.trim() })
      if (signUpError) throw signUpError
      await supabase.from('users').upsert({
        email: form.email.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role
      }, { onConflict: 'email' })
      setSuccess(`Magic link sent to ${form.email}`)
      setForm({ name: '', email: '', phone: '', role: 'client' })
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const roleColor = (role) => role === 'admin' ? colors.indigo : role === 'walker' ? colors.teal : colors.gold

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', maxWidth: '430px', margin: '0 auto', fontFamily: 'Nunito' }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.indigo}, #7B6BA8)`, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Clients & Walkers</h1>
          <button onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', paddingBottom: '100px' }}>

        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
            {success}
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(45,52,54,0.08)' }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: colors.charcoal }}>Add New User</h3>
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@email.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '555-000-0000' }
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Nunito', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: colors.charcoal, marginBottom: '4px' }}>Role</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['client', 'walker'].map(r => (
                  <button key={r} onClick={() => setForm({ ...form, role: r })} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `2px solid ${form.role === r ? colors.indigo : '#e5e7eb'}`, background: form.role === r ? colors.indigo : 'white', color: form.role === r ? 'white' : colors.charcoal, fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: saving ? '#a5b4fc' : `linear-gradient(135deg, ${colors.indigo}, #4F46E5)`, color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Nunito', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Sending invite...' : 'Add & Send Magic Link'}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🐾</div>
            <p style={{ fontWeight: 600 }}>Loading...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: '#636e72' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
            <p style={{ fontWeight: 600 }}>No users yet. Add your first client or walker.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(u => (
              <div key={u.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor(u.role)}, ${roleColor(u.role)}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: colors.charcoal, fontSize: '0.95rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{u.email}</div>
                  {u.phone && <div style={{ fontSize: '0.8rem', color: '#636e72' }}>{u.phone}</div>}
                </div>
                <span style={{ background: roleColor(u.role), color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>{u.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
