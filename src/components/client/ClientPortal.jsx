import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { COLORS as C } from '../../theme'
import PortalHeader from '../shared/PortalHeader'

const SERVICE_TYPES = ['30-min Walk', '60-min Walk', 'Drop-In Visit']
const TIME_SLOTS = ['9:30 AM', '11:30 AM', '1:30 PM', '3:30 PM']

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }
const inputStyle = { width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '9px 11px', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'white' }
const cardStyle = { background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(45,52,54,0.08)', marginBottom: 12 }

function SectionHeader({ title, icon, color = C.indigo }) {
  return (
    <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.15rem', fontWeight: 700, color, margin: '28px 0 14px', borderBottom: `2px solid ${color}`, paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}
      {title}
    </h2>
  )
}

const Icon = {
  paw: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="7" cy="7" r="2.6"/><circle cx="13.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="10" r="2.4"/><ellipse cx="12" cy="16" rx="6" ry="5"/></svg>
  ),
  calendar: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  repeat: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
  ),
  home: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  route: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4H9a4 4 0 0 1-4-4v-1"/></svg>
  ),
  person: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  check: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  warning: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  phone: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  ),
  medical: (color, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  eye: (color, size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  document: (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  ),
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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const [dogError, setDogError] = useState(null)

  const [showBook, setShowBook] = useState(false)
  const [bookForm, setBookForm] = useState({ service_type: '30-min Walk', dog_id: '', preferred_date: '', preferred_time: '', notes: '' })
  const [bookSubmitting, setBookSubmitting] = useState(false)
  const [bookSubmitted, setBookSubmitted] = useState(false)
  const [bookError, setBookError] = useState(null)

  const [showRecurring, setShowRecurring] = useState(false)
  const [recurringForm, setRecurringForm] = useState({ service_type: '30-min Walk', dog_id: '', preferred_time: '', start_date: '', weeks: 4, days: [], notes: '' })
  const [recurringSubmitting, setRecurringSubmitting] = useState(false)
  const [recurringSubmitted, setRecurringSubmitted] = useState(false)
  const [recurringError, setRecurringError] = useState(null)

  const [walks, setWalks] = useState([])

  const [showBoard, setShowBoard] = useState(false)
  const [boardForm, setBoardForm] = useState({ dog_id: '', check_in_date: '', check_out_date: '', notes: '' })
  const [boardSubmitting, setBoardSubmitting] = useState(false)
  const [boardSubmitted, setBoardSubmitted] = useState(false)
  const [boardError, setBoardError] = useState(null)
  const [boardings, setBoardings] = useState([])

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', access_instructions: '', sms_consent: false })
  const [phoneRequired, setPhoneRequired] = useState(false)
  const [gateSubmitting, setGateSubmitting] = useState(false)
  const [gateError, setGateError] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [consentError, setConsentError] = useState(null)

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (!clientId) return
    async function refreshRequests() {
      const { data: walkList } = await supabase.from('walk_requests').select('*, dogs(name)').eq('client_id', clientId).order('preferred_date', { ascending: false }).limit(10)
      setWalks(walkList || [])
      const { data: boardingList } = await supabase.from('boarding_requests').select('*, dogs(name)').eq('client_id', clientId).order('check_in_date', { ascending: false }).limit(10)
      setBoardings(boardingList || [])
    }
    const channel = supabase
      .channel(`client-requests-${clientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'walk_requests', filter: `client_id=eq.${clientId}` }, refreshRequests)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boarding_requests', filter: `client_id=eq.${clientId}` }, refreshRequests)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId])

  async function loadAll() {
    setLoading(true)
    setLoadError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadError('Not signed in.'); setLoading(false); return }

    const { data: userData } = await supabase.from('users').select('name, email, phone, sms_consent').eq('id', user.id).single()
    const { data: clientData } = await supabase.from('clients').select('id, address, access_instructions').eq('user_id', user.id).maybeSingle()
    setPhoneRequired(!userData?.phone || !userData.phone.trim())

    if (clientData) {
      setClientId(clientData.id)
      setProfile({ name: userData?.name || '', email: userData?.email || user.email || '', phone: userData?.phone || '', address: clientData.address || '', access_instructions: clientData.access_instructions || '', sms_consent: userData?.sms_consent || false })
      const { data: dogList } = await supabase.from('dogs').select('*').eq('client_id', clientData.id).order('name')
      setDogs(dogList || [])
      const { data: walkList } = await supabase.from('walk_requests').select('*, dogs(name), walks(photo_url, duration)').eq('client_id', clientData.id).order('preferred_date', { ascending: false }).limit(10)
      setWalks(walkList || [])
      const { data: boardingList } = await supabase.from('boarding_requests').select('*, dogs(name)').eq('client_id', clientData.id).order('check_in_date', { ascending: false }).limit(10)
      setBoardings(boardingList || [])
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
    setDogError(null)

    try {
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
      const { error } = editingDog
        ? await supabase.from('dogs').update(payload).eq('id', editingDog.id)
        : await supabase.from('dogs').insert(payload)

      if (error) throw error

      dogPhotoFileRef.current = null
      setSavingDog(false)
      setDogSaved(true)
      setTimeout(() => { setDogSaved(false); setShowAddDog(false) }, 1200)
      loadAll()
    } catch (err) {
      console.error('Save dog failed:', err)
      setSavingDog(false)
      setDogError('Could not save. Please check your connection and try again.')
    }
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
    // Admins are notified automatically by a database trigger on walk_requests.
    setTimeout(() => { setBookSubmitted(false); setShowBook(false); setBookForm({ service_type: '30-min Walk', dog_id: '', preferred_date: '', preferred_time: '', notes: '' }); loadAll() }, 2500)
  }

  async function submitRecurring() {
    setRecurringError(null)
    if (recurringForm.days.length === 0) { setRecurringError('Please select at least one day of the week.'); return }
    if (!recurringForm.preferred_time) { setRecurringError('Please select a time.'); return }
    if (!recurringForm.start_date) { setRecurringError('Please select a start date.'); return }
    if (!clientId) { setRecurringError('Profile not loaded. Please refresh.'); return }
    setRecurringSubmitting(true)

    try {
      const { error: rpcErr } = await supabase.rpc('create_recurring_walk', {
        p_client_id: clientId, p_dog_id: recurringForm.dog_id || null,
        p_service_type: recurringForm.service_type, p_preferred_time: recurringForm.preferred_time,
        p_days_of_week: recurringForm.days, p_start_date: recurringForm.start_date,
        p_weeks: recurringForm.weeks, p_assigned_walker_id: null,
        p_notes: recurringForm.notes || null,
      })
      if (rpcErr) throw rpcErr

      setRecurringSubmitting(false)
      setRecurringSubmitted(true)
      setTimeout(() => { setRecurringSubmitted(false); setShowRecurring(false); setRecurringForm({ service_type: '30-min Walk', dog_id: '', preferred_time: '', start_date: '', weeks: 4, days: [], notes: '' }); loadAll() }, 2200)
    } catch (err) {
      console.error('Recurring walk setup failed:', err)
      setRecurringSubmitting(false)
      setRecurringError('Could not set this up. Please try again.')
    }
  }

  async function submitBoard() {
    if (!boardForm.check_in_date || !boardForm.check_out_date) { setBoardError('Please select check-in and check-out dates.'); return }
    if (boardForm.check_out_date <= boardForm.check_in_date) { setBoardError('Check-out date must be after check-in date.'); return }
    if (!clientId) { setBoardError('Profile not loaded. Please refresh.'); return }
    setBoardSubmitting(true)
    setBoardError(null)
    const { error } = await supabase.from('boarding_requests').insert({
      client_id: clientId, dog_id: boardForm.dog_id || null,
      check_in_date: boardForm.check_in_date, check_out_date: boardForm.check_out_date,
      notes: boardForm.notes || null, status: 'pending',
    })
    if (error) { setBoardError('Something went wrong. Please try again.'); setBoardSubmitting(false); return }
    setBoardSubmitting(false)
    setBoardSubmitted(true)
    // Admins are notified automatically by a database trigger on boarding_requests.
    setTimeout(() => { setBoardSubmitted(false); setShowBoard(false); setBoardForm({ dog_id: '', check_in_date: '', check_out_date: '', notes: '' }); loadAll() }, 2500)
  }

  async function submitGate() {
    setGateError(null)
    if (!profile.phone.trim()) { setGateError('A phone number is required.'); return }
    setGateSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const { error } = await supabase.from('users').update({
        phone: profile.phone,
        sms_consent: profile.sms_consent,
        ...(profile.sms_consent ? { sms_consent_at: new Date().toISOString() } : {}),
      }).eq('id', user.id)
      if (error) throw error
      setPhoneRequired(false)
    } catch (err) {
      console.error('Save phone failed:', err)
      setGateSubmitting(false)
      setGateError('Could not save. Please check your connection and try again.')
    }
  }

  async function saveProfile() {
    setConsentError(null)
    if (!profile.phone.trim()) {
      setConsentError('A phone number is required to save your profile.')
      return
    }
    setSavingProfile(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const consentChanged = profile.phone.trim() && profile.sms_consent
      const { error: userError } = await supabase.from('users').update({
        name: profile.name,
        phone: profile.phone,
        sms_consent: profile.sms_consent,
        ...(consentChanged ? { sms_consent_at: new Date().toISOString() } : {})
      }).eq('id', user.id)
      if (userError) throw userError

      if (clientId) {
        const { error: clientError } = await supabase.from('clients').update({ address: profile.address, access_instructions: profile.access_instructions }).eq('id', clientId)
        if (clientError) throw clientError
      }

      setSavingProfile(false)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      console.error('Save profile failed:', err)
      setSavingProfile(false)
      setConsentError('Could not save. Please check your connection and try again.')
    }
  }

  const upcomingWalks = walks.filter(w => w.status !== 'completed' && w.status !== 'declined')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{Icon.paw(C.indigo, 32)}</div>
          <p style={{ color: C.indigo, fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{Icon.warning(C.red, 32)}</div>
          <p style={{ color: C.red, fontWeight: 600 }}>{loadError}</p>
        </div>
      </div>
    )
  }

  if (phoneRequired) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.cream, fontFamily: 'Nunito, sans-serif', padding: 20 }}>
        <div style={{ ...cardStyle, maxWidth: 420, width: '100%' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{Icon.phone(C.indigo, 32)}</div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: C.indigo, marginBottom: 6, textAlign: 'center' }}>One Quick Thing</div>
          <p style={{ fontSize: '0.9rem', color: C.light, textAlign: 'center', marginBottom: 20 }}>
            A phone number is required before you can use FetchUs. This is how we let you know about your walks and boarding.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Phone Number</label>
            <input type="tel" style={inputStyle} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="(555) 123-4567" autoFocus />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 18, cursor: 'pointer' }}>
            <input type="checkbox" checked={profile.sms_consent} onChange={e => setProfile({ ...profile, sms_consent: e.target.checked })} style={{ marginTop: 3 }} />
            <span style={{ fontSize: '0.82rem', color: C.charcoal }}>I agree to receive text messages from FetchUs about my walks and boarding. Message and data rates may apply. Reply STOP to opt out.</span>
          </label>
          {gateError && <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 14 }}>{gateError}</div>}
          <button onClick={submitGate} disabled={gateSubmitting || !profile.phone.trim()} style={{ width: '100%', background: C.indigo, color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: !profile.phone.trim() ? 0.5 : 1 }}>
            {gateSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 60px', fontFamily: 'Nunito, sans-serif', background: C.cream, minHeight: '100vh' }}>

      {dbRole && (
        <div style={{ background: '#182B4A', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: 700, opacity: 0.85 }}>Viewing as Client</span>
          <button onClick={() => { setRole('admin'); navigate('/admin') }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 14px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
            ← Back to Admin
          </button>
        </div>
      )}

      <PortalHeader
        variant="card"
        background={`linear-gradient(135deg, ${C.gold}, #E8B84B)`}
        eyebrow="Welcome back"
        title={profile.name || 'Pet Parent'}
        subtitle={upcomingWalks.length > 0
          ? `Next walk: ${formatDate(upcomingWalks[0].preferred_date)} at ${upcomingWalks[0].preferred_time}`
          : 'No upcoming walks scheduled'}
        onSignOut={signOut}
      />

      <SectionHeader title="My Dogs" icon={Icon.paw(C.indigo)} color={C.indigo} />

      {dogs.map(dog => (
        <div key={dog.id} style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => openEditDog(dog)}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0EDE5', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              {dog.photo_url ? <img src={dog.photo_url} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : Icon.paw(C.indigo, 26)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: C.charcoal }}>{dog.name}</div>
              <div style={{ fontSize: '0.83rem', color: C.light, marginTop: 2 }}>
                {dog.breed || 'Mixed breed'}{dog.age ? ` · ${dog.age} yrs` : ''}
              </div>
              {dog.behavioral_notes && <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 4 }}>{dog.behavioral_notes}</div>}
              {dog.medical_needs && (
                <div style={{ marginTop: 6, background: '#FEF9C3', borderRadius: 6, padding: '4px 8px', fontSize: '0.8rem', color: C.yellow, fontWeight: 600 }}>
                  {Icon.medical(C.yellow, 13)} {dog.medical_needs}
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: C.light, paddingTop: 2 }}>tap to edit</div>
          </div>
        </div>
      ))}

      {dogs.length === 0 && !showAddDog && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{Icon.paw(C.light, 44)}</div>
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
              {dogPhotoPreview ? <img src={dogPhotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : Icon.paw(C.indigo, 26)}
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
          {dogSaved && (
            <div style={{ background: '#D1FAE5', border: '2px solid #10B981', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{Icon.check('#065F46', 20)}</span>
              <span style={{ fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>Saved successfully!</span>
            </div>
          )}
          {dogError && (
            <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{Icon.warning('#991B1B', 20)}</span>
              <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>{dogError}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveDog} disabled={savingDog || !dogForm.name.trim()} style={{ flex: 1, background: dogSaved ? C.teal : C.indigo, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: !dogForm.name.trim() ? 0.5 : 1 }}>
              {dogSaved ? 'Saved!' : savingDog ? 'Saving...' : editingDog ? 'Save Changes' : 'Add Dog'}
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

      <SectionHeader title="Book a Walk" icon={Icon.calendar(C.teal)} color={C.teal} />

      {!showBook ? (
        <button onClick={() => setShowBook(true)} style={{ width: '100%', background: C.teal, border: 'none', borderRadius: 12, padding: '14px', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: 4 }}>
          Book a Walk
        </button>
      ) : bookSubmitted ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{Icon.check(C.teal, 36)}</div>
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
              {bookSubmitting ? 'Sending...' : 'Send Request'}
            </button>
            <button onClick={() => { setShowBook(false); setBookError(null) }} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <SectionHeader title="Set Up a Recurring Walk" icon={Icon.repeat(C.teal)} color={C.teal} />

      {!showRecurring ? (
        <button onClick={() => setShowRecurring(true)} style={{ width: '100%', background: C.teal, border: 'none', borderRadius: 12, padding: '14px', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: 4 }}>
          Set Up Recurring Walk
        </button>
      ) : recurringSubmitted ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{Icon.repeat(C.light, 40)}</div>
          <div style={{ fontWeight: 800, color: C.teal, fontSize: '1.1rem', marginBottom: 6 }}>Recurring Walk Set Up!</div>
          <div style={{ fontSize: '0.85rem', color: C.light }}>Your walks have been requested for the next {recurringForm.weeks} weeks.</div>
        </div>
      ) : (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.teal}` }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: C.teal, marginBottom: 16 }}>New Recurring Walk</div>
          {dogs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Which Dog?</label>
              <select style={inputStyle} value={recurringForm.dog_id} onChange={e => setRecurringForm({ ...recurringForm, dog_id: e.target.value })}>
                <option value="">Select a dog...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Service</label>
            <select style={inputStyle} value={recurringForm.service_type} onChange={e => setRecurringForm({ ...recurringForm, service_type: e.target.value })}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Days of the Week</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {WEEKDAY_LABELS.map((label, i) => {
                const selected = recurringForm.days.includes(i)
                return (
                  <button key={i} type="button"
                    onClick={() => setRecurringForm({ ...recurringForm, days: selected ? recurringForm.days.filter(d => d !== i) : [...recurringForm.days, i] })}
                    style={{ padding: '8px 12px', borderRadius: 8, border: selected ? `1.5px solid ${C.teal}` : '1.5px solid #E0E0E0', background: selected ? C.teal : 'white', color: selected ? 'white' : C.charcoal, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Time</label>
            <select style={inputStyle} value={recurringForm.preferred_time} onChange={e => setRecurringForm({ ...recurringForm, preferred_time: e.target.value })}>
              <option value="">Select a time...</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" style={inputStyle} value={recurringForm.start_date} min={new Date().toISOString().split('T')[0]} onChange={e => setRecurringForm({ ...recurringForm, start_date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Number of Weeks</label>
              <input type="number" min={1} max={52} style={inputStyle} value={recurringForm.weeks} onChange={e => setRecurringForm({ ...recurringForm, weeks: Math.max(1, Math.min(52, parseInt(e.target.value) || 1)) })} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={recurringForm.notes} onChange={e => setRecurringForm({ ...recurringForm, notes: e.target.value })} />
          </div>
          {recurringError && <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 12 }}>{recurringError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitRecurring} disabled={recurringSubmitting} style={{ flex: 1, background: C.teal, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {recurringSubmitting ? 'Setting up...' : 'Confirm Recurring Walk'}
            </button>
            <button onClick={() => { setShowRecurring(false); setRecurringError(null) }} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <SectionHeader title="Book Boarding" icon={Icon.home(C.gold)} color={C.gold} />

      {!showBoard ? (
        <button onClick={() => setShowBoard(true)} style={{ width: '100%', background: C.gold, border: 'none', borderRadius: 12, padding: '14px', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: 4 }}>
          Request Boarding
        </button>
      ) : boardSubmitted ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{Icon.check(C.gold, 36)}</div>
          <div style={{ fontWeight: 800, color: C.gold, fontSize: '1.1rem', marginBottom: 6 }}>Request Sent!</div>
          <div style={{ fontSize: '0.85rem', color: C.light }}>
            {formatDate(boardForm.check_in_date)} to {formatDate(boardForm.check_out_date)}
          </div>
          <div style={{ fontSize: '0.82rem', color: C.light, marginTop: 4 }}>We will text you to confirm.</div>
        </div>
      ) : (
        <div style={{ ...cardStyle, borderLeft: `4px solid ${C.gold}` }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: C.gold, marginBottom: 16 }}>New Boarding Request</div>
          {dogs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Which Dog?</label>
              <select style={inputStyle} value={boardForm.dog_id} onChange={e => setBoardForm({ ...boardForm, dog_id: e.target.value })}>
                <option value="">Select a dog...</option>
                {dogs.map(d => <option key={d.id} value={d.id}>{d.name}{d.breed ? ` (${d.breed})` : ''}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Check-In Date</label>
              <input type="date" style={inputStyle} value={boardForm.check_in_date} min={new Date().toISOString().split('T')[0]} onChange={e => setBoardForm({ ...boardForm, check_in_date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Check-Out Date</label>
              <input type="date" style={inputStyle} value={boardForm.check_out_date} min={boardForm.check_in_date || new Date().toISOString().split('T')[0]} onChange={e => setBoardForm({ ...boardForm, check_out_date: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={boardForm.notes} onChange={e => setBoardForm({ ...boardForm, notes: e.target.value })} placeholder="Feeding schedule, medications, routine..." />
          </div>
          {boardError && <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '9px 12px', fontSize: '0.84rem', marginBottom: 12 }}>{boardError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submitBoard} disabled={boardSubmitting || !boardForm.check_in_date || !boardForm.check_out_date}
              style={{ flex: 1, background: C.gold, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', opacity: (!boardForm.check_in_date || !boardForm.check_out_date) ? 0.5 : 1 }}>
              {boardSubmitting ? 'Sending...' : 'Send Request'}
            </button>
            <button onClick={() => { setShowBoard(false); setBoardError(null) }} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {boardings.length > 0 && (
        <>
          <SectionHeader title="My Boarding Requests" icon={Icon.home(C.gold)} color={C.gold} />
          {boardings.map(b => (
            <div key={b.id} style={{ ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>{b.dogs?.name ? `${b.dogs.name}'s Boarding` : 'Boarding'}</div>
                  <div style={{ fontSize: '0.83rem', color: C.light, marginTop: 2 }}>
                    {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </>
      )}

      <SectionHeader title="My Walks" icon={Icon.route(C.indigo)} color={C.indigo} />

      {walks.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '28px 20px', color: C.light }}>
          <p style={{ fontWeight: 600 }}>No walk requests yet</p>
          <p style={{ fontSize: '0.84rem', marginTop: 4 }}>Book your first walk above</p>
        </div>
      ) : (
        walks.map(walk => {
          const walkRecord = walk.walks?.[0]
          return (
          <div key={walk.id} style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.charcoal }}>{walk.service_type}</div>
                <div style={{ fontSize: '0.83rem', color: C.light, marginTop: 2 }}>
                  {walk.dogs?.name && `${walk.dogs.name} · `}{formatDate(walk.preferred_date)} at {walk.preferred_time}
                  {walkRecord?.duration && ` · ${walkRecord.duration} min`}
                </div>
              </div>
              <StatusBadge status={walk.status} />
            </div>
            {walk.notes && walk.status === 'completed' && (
              <div style={{ background: C.cream, borderRadius: 8, padding: '8px 10px', fontSize: '0.82rem', color: C.charcoal, marginTop: 6 }}>
                <span style={{ fontWeight: 700 }}>Walker note: </span>{walk.notes}
              </div>
            )}
            {walkRecord?.photo_url && (
              <img src={walkRecord.photo_url} alt="Walk photo" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginTop: 8 }} />
            )}
          </div>
          )
        })
      )}

      <SectionHeader title="My Profile" icon={Icon.person(C.indigo)} color={C.indigo} />

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
        {profileSaved && (
          <div style={{ background: '#D1FAE5', border: '2px solid #10B981', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{Icon.check('#065F46', 20)}</span>
            <span style={{ fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>Profile saved successfully!</span>
          </div>
        )}
        {consentError && (
          <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{Icon.warning('#991B1B', 20)}</span>
            <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>{consentError}</span>
          </div>
        )}
        <button onClick={saveProfile} disabled={savingProfile} style={{ width: '100%', background: profileSaved ? C.teal : C.indigo, color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          {profileSaved ? 'Profile Saved!' : savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

    </div>
  )
}
