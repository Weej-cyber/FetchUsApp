import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TIME_SLOTS = ['9:30 AM', '11:30 AM', '1:30 PM', '3:30 PM']
const SERVICE_TYPES = ['30-min Walk', '60-min Walk', 'Drop-In Visit', 'Boarding']

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }
const inputStyle = { width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 12px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'white' }

export default function Book() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ service_type: '30-min Walk', dog_id: '', preferred_date: '', preferred_time: '', notes: '' })
  const [dogs, setDogs] = useState([])
  const [clientId, setClientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadClientAndDogs() }, [])

  async function loadClientAndDogs() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single()
    if (client) {
      setClientId(client.id)
      const { data: dogList } = await supabase.from('dogs').select('id, name, breed').eq('client_id', client.id).order('name')
      if (dogList) setDogs(dogList)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.preferred_date || !form.preferred_time) { setError('Please select a date and time.'); return }
    setSubmitting(true)
    setError(null)
    const { error: insertError } = await supabase.from('walk_requests').insert({
      client_id: clientId, dog_id: form.dog_id || null, service_type: form.service_type,
      preferred_date: form.preferred_date, preferred_time: form.preferred_time, notes: form.notes || null, status: 'pending',
    })
    setSubmitting(false)
    if (insertError) { setError('Something went wrong. Please try again.'); console.error(insertError) }
    else setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🐾</div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#5B4B8A', marginBottom: 8 }}>Request Sent!</h2>
        <p style={{ color: '#636e72', marginBottom: 8 }}>We'll text you to confirm all the details.</p>
        <p style={{ color: '#b2bec3', fontSize: '0.85rem', marginBottom: 32 }}>
          {form.service_type} on {new Date(form.preferred_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {form.preferred_time}
        </p>
        <button onClick={() => navigate('/client')} style={{ background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    )
  }

  if (loading) return <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', fontFamily: 'Nunito, sans-serif', textAlign: 'center', color: '#b2bec3' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 100px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#5B4B8A', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Back</button>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#2D3436', margin: 0 }}>Book a Walk</h1>
        <p style={{ color: '#636e72', fontSize: '0.85rem', margin: '4px 0 0' }}>We'll text you to confirm.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12 }}>
          <label style={labelStyle}>Service Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SERVICE_TYPES.map(type => (
              <button key={type} type="button" onClick={() => setForm({ ...form, service_type: type })} style={{ border: form.service_type === type ? '2px solid #5B4B8A' : '2px solid #E0E0E0', background: form.service_type === type ? '#F3F0FF' : 'white', color: form.service_type === type ? '#5B4B8A' : '#636e72', borderRadius: 8, padding: '10px 6px', fontSize: '0.85rem', fontWeight: form.service_type === type ? 700 : 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {dogs.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12 }}>
            <label style={labelStyle}>Which Dog?</label>
            <select style={inputStyle} value={form.dog_id} onChange={e => setForm({ ...form, dog_id: e.target.value })}>
              <option value="">Select a dog...</option>
              {dogs.map(dog => <option key={dog.id} value={dog.id}>{dog.name}{dog.breed ? ` (${dog.breed})` : ''}</option>)}
            </select>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Preferred Date</label>
            <input type="date" style={inputStyle} value={form.preferred_date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, preferred_date: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Preferred Time</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => setForm({ ...form, preferred_time: slot })} style={{ border: form.preferred_time === slot ? '2px solid #2D9B8A' : '2px solid #E0E0E0', background: form.preferred_time === slot ? '#ECFDF5' : 'white', color: form.preferred_time === slot ? '#065F46' : '#636e72', borderRadius: 8, padding: '10px', fontSize: '0.88rem', fontWeight: form.preferred_time === slot ? 700 : 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 20 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Gate code, where to find the leash, etc." />
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={submitting || !form.preferred_date || !form.preferred_time} style={{ width: '100%', background: '#5B4B8A', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: (!form.preferred_date || !form.preferred_time) ? 0.5 : 1, fontFamily: 'inherit' }}>
          {submitting ? 'Sending Request...' : 'Send Request 🐾'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#b2bec3', marginTop: 10 }}>We'll text you to confirm all the details.</p>
      </form>
    </div>
  )
}
