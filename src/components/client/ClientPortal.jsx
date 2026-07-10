import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const C = {
  indigo: '#5B4B8A', teal: '#2D9B8A', gold: '#D4A843',
  cream: '#FAF8F3', charcoal: '#2D3436', light: '#636e72',
  redBg: '#FEE2E2', red: '#991B1B', greenBg: '#D1FAE5', green: '#065F46',
  yellowBg: '#FEF9C3', yellow: '#92400E', purpleBg: '#E0E7FF', purple: '#3730A3',
}

const SERVICE_TYPES = ['30-min Walk', '60-min Walk', 'Drop-In Visit', 'Boarding']
const TIME_SLOTS = ['9:30 AM', '11:30 AM', '1:30 PM', '3:30 PM']

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }
const inputStyle = { width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '9px 11px', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'white' }
const cardStyle = { background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(45,52,54,0.08)', marginBottom: 12 }

function SectionHeader({ title, color = C.indigo }) {
  return (
    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.15rem', fontWeight: 700, color, margin: '28px 0 14px', borderBottom: `2px solid ${color}`, paddingBottom: 8 }}>
      {title}
    </h2>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:   { bg: C.yellowBg, text: C.yellow, label: 'Pending' },
    assigned:  { bg: C.greenBg, text: C.green, label: 'Confirmed' },
    confirmed: { bg: C.purpleBg, text: C.purple, label: 'In Progress' },
    completed: { bg: '#F0F0F0', text: C.light, label: 'Completed' },
    declined:  { bg: C.redBg, text: C.red, label: 'Declined' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.text, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function ClientPortal() {
  const { dbRole, setRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [clientId, setClientId] = useState(null)

  const [dogs, setDogs] = useState([])
  const [showAddDog, setShowAddDog] = useState(false)
  const [editingDog, setEditingDog] = useState(null)
  const [dogForm, setDogForm] = useState({ name: '', breed: '', age: '', behavioral_notes: '', medical_needs: '', photo_url: '' })
  const dogPhotoFileRef = useRef(null)
  const [dogPhotoPreview, setDogPhotoPreview] = useState(null)
  const [savingDog, setSavingDog] = useState(false)
  const [dogSaved, setDogSaved] = useState(false)

  const [showBook, setShowBook] = useState(false)
  const [bookForm, setBookForm] = useState({ service_type: '30-min Walk', dog_id: '', preferred_date: '', preferred_time: '', notes: '' })
  const [bookSubmitting, setBookSubmitting] = useState(false)
  const [bookSubmitted, setBookSubmitted] = useState(false)
  const [bookError, setBookError] = useState(null)

  const [walks, setWalks] = useState([])

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', access_instructions: '', sms_consent: false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [consentError, setConsentError] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    setLoadError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadError('Not signed in.'); setLoading(false); return }

    const { data: userData } = await supabase.from('users').select('name, email, phone, sms_consent').eq('id', user.id).single()
    const { data: clientData } = await supabase.from('clients').select('id, address, access_instructions').eq('user_id', user.id).maybeSingle()

    if (clientData) {
      setClientId(clientData.id)
      setProfile({ name: userData?.name || '', email: userData?.email || user.email || '', phone: userData?.phone || '', address: clientData.address || '', access_instructions: clientData.access_instructions || '', sms_consent: userData?.sms_consent || false })
      const { data: dogList } = await supabase.from('dogs').select('*').eq('client_id', clientData.id).order('name')
      setDogs(dogList || [])
      const { data: walkList } = await supabase.from('walk_requests').select('*, dogs(name)').eq('client_id', clientData.id).order('preferred_date', { ascending: false }).limit(10)
      setWalks(walkList || [])
    } else {
      setProfile({ name: userData?.name || '', email: userData?.email || user.email || '', phone: userData?.phone || '', address: '', access_instructions: '', sms_consent: userData?.sms_consent || false })
    }
    setLoading(false)
  }

  function openAddDog() {
    setEditingDog(null)
    setDogForm({ name: '', breed: '', age: '', behavioral_notes: '', medical_needs: '', photo_url: '' })
    dogPhotoFileRef.current = null
    setDogPhotoPreview(null)
    setShowAddDog(true)
  }

  function openEditDog(dog) {
    setEditingDog(dog)
    setDogForm({ name: dog.name || '', breed: dog.breed || '', age: dog.age || '', behavioral_notes: dog.behavioral_notes || '', medical_needs: dog.medical_needs || '', photo_url: dog.photo_url || '' })
    dogPhotoFileRef.current = null
    setDogPhotoPreview(dog.photo_url || null)
    setShowAddDog(true)
  }

  function handleDogPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    dogPhotoFileRef.current = file
    setDogPhotoPreview(URL.createObjectURL(file))
  }

  async function saveDog() {
    if (!dogForm.name.trim()) return
    setSavingDog(true)

    let photo_url = dogForm.photo_url || null
    const photoFile = dogPhotoFileRef.current
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${clientId}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(path, photoFile, { upsert: true })
      if (uploadError) {
        console.error('Photo upload failed:', uploadError.message)
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('dog-photos')
          .getPublicUrl(path)
        photo_url = urlData?.publicUrl || null
      }
    }

    const payload = { name: dogForm.name.trim(), breed: dogForm.breed.trim() || null, age: dogForm.age ? parseInt(dogForm.age) : null, behavioral_notes: dogForm.behavioral_notes.trim() || null, medical_needs: dogForm.medical_needs.trim() || null, client_id: clientId, photo_url }
    if (editingDog) {
      await supabase.from('dogs').update(payload).eq('id', editingDog.id)
    } else {
      await supabase.from('dogs').insert(payload)
    }
    dogPhotoFileRef.current = null
    setSavingDog(false)
    setDogSaved(true)
    setTimeout(() => { setDogSaved(false); setShowAddDog(false) }, 1200)
    loadAll()
  }

  async function submitBook() {
    if (!bookForm.preferred_date || !bookForm.preferred_time) { setBookError('Please select a date and time.'); return }
    if (!clientId) { setBookError('Profile not loaded. Please refresh.'); return }
    setBookSubmitting(true)
    setBookError(null)
    const { error } = await supabase.from('walk_requests').insert({
      client_id: clientId, dog_id: bookForm.dog_id || null,
      service_type: bookForm.service_type, preferred_date: bookForm.preferred_date,
      preferred_time: bookForm.preferred_time, notes: bookForm.notes || null, status: 'pending',
    })
    if (error) { setBookError('Something went wrong. Please try again.'); setBookSubmitting(false); return }
    setBookSubmitting(false)
    setBookSubmitted(true)
    setTimeout(() => { setBookSubmitted(false); setShowBook(false); setBookForm({ service_type: '30-min Walk', dog_id: '', preferred_date: '', preferred_time: '', notes: '' }); loadAll() }, 2500)
  }

  async function saveProfile() {
    setConsentError(null)
    if (profile.phone.trim() && !profile.sms_consent) {
      setConsentError('You must check the SMS consent box to save a phone number.')
      return
    }
    setSavingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const consentChanged = profile.phone.trim() && profile.sms_consent
      await supabase.from('users').update({
        name: profile.name,
        phone: profile.phone,
        sms_consent: profile.sms_consent,
        ...(consentChanged ? { sms_consent_at: new Date().toISOString() } : {})
      }).eq('id', user.id)
      if (clientId) {
        await supabase.from('clients').update({ address: profile.address, access_instructions: profile.access_instructions }).eq('id', clientId)
      }
    }
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const upcomingWalks = walks.filter(w => w.status !== 'completed' && w.status !== 'declined')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🐾</div>
          <p style={{ color: C.indigo, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
          <p style={{ color: C.red, fontWeight: 600 }}>{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 60px', fontFamily: 'Nunito, sans-serif', background: C.cream, minHeight: '100vh' }}>

      {dbRole && (
        <div style={{ background: '#5B4B8A', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: 700, opacity: 0.85 }}>Viewing as Client</span>
          <button onClick={() => { setRole('admin'); navigate('/admin') }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 14px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ← Back to Admin
          </button>
        </div>
      )}

      <div style={{ background: `linear-gradient(135deg, ${C.gold}, #E8B84B)`, borderRadius: 16, padding: '22px 24px', marginBottom: 8, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: 6 }}>{profile.name || 'Pet Parent'}</div>
            <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>
              {upcomingWalks.length > 0
                ? `Next walk: ${formatDate(upcomingWalks[0].preferred_date)} at ${upcomingWalks[0].preferred_time}`
                : 'No upcoming walks scheduled'}
            </div>
          </div>
          <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            Sign Out
          </button>
        </div>
      </div>

      <SectionHeader title="🐕 My Dogs" color={C.indigo} />

      {dogs.map(dog => (
        <div key={dog.id} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => openEditDog(dog)}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0EDE5', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              {dog.photo_url ? <img src={dog.photo_url} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🐕'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: C.charcoal }}>{dog.name}</div>
              <div style={{ fontSize: '0.83rem', color: C.light, marginTop: 2 }}>
                {dog.breed || 'Mixed breed'}{dog.age ? ` · ${dog.age} yrs` : ''}
              </div>
              {dog.behavioral_notes && <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 4 }}>{dog.behavioral_notes}</div>}
              {dog.medical_needs && (
                <div style={{ marginTop: 6, background: '#FEF9C3', borderRadius: 6, padding: '4px 8px', fontSize: '0.8rem', color: C.yellow, fontWeight: 600 }}>
                  ⚕️ {dog.medical_needs}
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: C.light, paddingTop: 2 }}>tap to edit</div>
          </div>
        </div>
      ))}

      {dogs.length === 0 && !showAddDog && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🐾</div>
          <p style={{ fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>No dogs added yet</p>
          <p style={{ fontSize: '0.85rem', color: C.light }}>Add your first pup to get started</p>
        </div>
      )}

      {showAddDog ? (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.indigo}` }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: C.indigo, marginBottom: 16 }}>
            {editingDog ? `Edit ${editingDog.name}` : 'Add a Dog'}
          </div>
          <div style={{ marginBottom: 14, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0EDE5', overflow: 'hidden', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
              {dogPhotoPreview ? <img src={dogPhotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🐕'}
            </div>
            <label style={{ display: 'inline-block', background: '#F0EDE5', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, color: C.indigo, cursor: 'pointer' }}>
              {dogPhotoPreview ? 'Change Photo' : '+ Add Photo'}
              <input type="file" accept="image/*" onChange={handleDogPhoto} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={dogForm.name} onChange={e => setDogForm({ ...dogForm, name: e.target.value })} placeholder="Max" />
            </div>
            <div>
              <label style={labelStyle}>Breed</label>
              <input style={inputStyle} value={dogForm.breed} onChange={e => setDogForm({ ...dogForm, breed: e.target.value })} placeholder="Golden Retriever" />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Age (years)</label>
            <input type="number" min="0" max="25" style={{ ...inputStyle, width: '50%' }} value={dogForm.age} onChange={e => setDogForm({ ...dogForm, age: e.target.value })} placeholder="3" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Behavioral Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={dogForm.behavioral_notes} onChange={e => setDogForm({ ...dogForm, behavioral_notes: e.target.value })} placeholder="Friendly, pulls on leash, scared of thunder..." />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Medical Needs</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={dogForm.medical_needs} onChange={e => setDogForm({ ...dogForm, medical_needs: e.target.value })} placeholder="Allergies, medications, vet instructions..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveDog} disabled={savingDog || !dogForm.name.trim()} style={{ flex: 1, background: dogSaved ? C.teal : C.indigo, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: !dogForm.name.trim() ? 0.5 : 1 }}>
              {dogSaved ? '✓ Saved!' : savingDog ? 'Saving...' : editingDog ? 'Save Changes' : 'Add Dog'}
            </button>
            <button onClick={() => setShowAddDog(false)} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={openAddDog} style={{ width: '100%', background: 'white', border: `2px dashed ${C.indigo}`, borderRadius: 12, padding: '12px', color: C.indigo, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: 4 }}>
          + Add Dog
        </button>
      )}

      <SectionHeader title="📅 Book a Walk" color={C.teal} />

      {!showBook ? (
        <button onClick={() => setShowBook(true)} style={{ width: '100%', background: C.teal, border: 'none', borderRadius: 12, padding: '14px', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: 4 }}>
          Book a Walk
        </button>
      ) : bookSubmitted ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🐾</div>
          <div style={{ fontWeight: 800, color: C.teal, fontSize: '1.1rem', marginBottom: 6 }}>Request Sent!</div>
          <div style={{ fontSize: '0.85rem', color: C.light }}>
            {bookForm.service_type} on {formatDate(bookForm.preferred_date)} at {bookForm.preferred_time}
          </div>
          <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 4 }}>We will text you to confirm.</div>
        </div>
      ) : (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.teal}` }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: C.teal, marginBottom: 16 }}>New Walk Request</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Service Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SERVICE_TYPES.map(type => (
                <button key={type} type="button" onClick={() => setBookForm({ ...bookForm, service_type: type })}
                  style={{ border: bookForm.service_type === type ? `2px solid ${C.teal}` : '2px solid #E0E0E0', background: bookForm.service_type === type ? '#ECFDF5' : 'white', color: bookForm.service_type === type ? C.green : C.light, borderRadius: 8, padding: '9px 6px', fontSize: '0.85rem', fontWeight: bookForm.service_type === type ? 700 : 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          {dogs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Which Dog?</label>
              <select style={inputStyle} value={bookForm.dog_id} onChange={e => setBookForm({ ...bookForm, dog_id: e.target.value })}>
                <option value="">Select a dog...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name}{d.breed ? ` (${d.breed})` : ''}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Preferred Date</label>
            <input type="date" style={inputStyle} value={bookForm.preferred_date} min={new Date().toISOString().split('T')[0]} onChange={e => setBookForm({ ...bookForm, preferred_date: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Preferred Time</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => setBookForm({ ...bookForm, preferred_time: slot })}
                  style={{ border: bookForm.preferred_time === slot ? `2px solid ${C.teal}` : '2px solid #E0E0E0', background: bookForm.preferred_time === slot ? '#ECFDF5' : 'white', color: bookForm.preferred_time === slot ? C.green : C.light, borderRadius: 8, padding: '9px', fontSize: '0.85rem', fontWeight: bookForm.preferred_time === slot ? 700 : 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} placeholder="Gate code, where to find the leash, etc." />
          </div>
          {bookError && <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 12 }}>{bookError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitBook} disabled={bookSubmitting || !bookForm.preferred_date || !bookForm.preferred_time}
              style={{ flex: 1, background: C.teal, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: (!bookForm.preferred_date || !bookForm.preferred_time) ? 0.5 : 1 }}>
              {bookSubmitting ? 'Sending...' : 'Send Request 🐾'}
            </button>
            <button onClick={() => { setShowBook(false); setBookError(null) }} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <SectionHeader title="🦮 My Walks" color={C.indigo} />

      {walks.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '28px 20px', color: C.light }}>
          <p style={{ fontWeight: 600 }}>No walk requests yet</p>
          <p style={{ fontSize: '0.84rem', marginTop: 4 }}>Book your first walk above</p>
        </div>
      ) : (
        walks.map(walk => (
          <div key={walk.id} style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.charcoal }}>{walk.service_type}</div>
                <div style={{ fontSize: '0.83rem', color: C.light, marginTop: 2 }}>
                  {walk.dogs?.name && `${walk.dogs.name} · `}{formatDate(walk.preferred_date)} at {walk.preferred_time}
                </div>
              </div>
              <StatusBadge status={walk.status} />
            </div>
            {walk.notes && walk.status === 'completed' && (
              <div style={{ background: C.cream, borderRadius: 8, padding: '8px 10px', fontSize: '0.82rem', color: C.charcoal, marginTop: 6 }}>
                <span style={{ fontWeight: 700 }}>Walker note: </span>{walk.notes}
              </div>
            )}
          </div>
        ))
      )}

      <SectionHeader title="👤 My Profile" color={C.indigo} />

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="(555) 123-4567" />
          </div>
        </div>
        <div style={{ marginBottom: 10, background: '#FFF8E1', border: '1.5px solid #F0C040', borderRadius: 10, padding: 12 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.sms_consent}
              onChange={e => { setProfile({ ...profile, sms_consent: e.target.checked }); setConsentError(null) }}
              style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, accentColor: '#92400E' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
              I agree to receive SMS notifications about my dog walk bookings, including walk confirmations, walker en route, walk start, and walk completion alerts. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. A phone number cannot be saved without checking this box.
            </span>
          </label>
          {consentError && (
            <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: 8, fontWeight: 600 }}>{consentError}</div>
          )}
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Email</label>
          <input style={{ ...inputStyle, background: '#F5F5F5', color: C.light }} value={profile.email} readOnly />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Service Address</label>
          <input style={inputStyle} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="123 Main Street" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Home Access Instructions</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={profile.access_instructions} onChange={e => setProfile({ ...profile, access_instructions: e.target.value })} placeholder="Gate code, key location, entrance instructions..." />
        </div>
        <button onClick={saveProfile} disabled={savingProfile} style={{ width: '100%', background: profileSaved ? C.teal : C.indigo, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          {profileSaved ? '✓ Profile Saved!' : savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

    </div>
  )
}
