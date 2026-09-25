import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { COLORS as C } from '../../theme'

// Shared dog pieces used by the Client portal and the Admin client profile:
// DogFields (the inputs), saveDog (photo upload + insert/update), removeDog,
// and the standalone DogForm card the Client portal uses.

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }
const inputStyle = { width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '9px 11px', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'white' }
const cardStyle = { background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(45,52,54,0.08)', marginBottom: 12 }

const pawIcon = (color, size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="7" cy="7" r="2.6"/><circle cx="13.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="10" r="2.4"/><ellipse cx="12" cy="16" rx="6" ry="5"/></svg>
)
const checkIcon = (color, size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const warningIcon = (color, size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
)

// Editable state for one dog: form values, a newly picked photo file, and its preview.
export function dogDraft(dog) {
  return {
    id: dog?.id || null,
    form: {
      name: dog?.name || '', breed: dog?.breed || '', age: dog?.age ?? '',
      behavioral_notes: dog?.behavioral_notes || '', medical_needs: dog?.medical_needs || '', photo_url: dog?.photo_url || '',
    },
    photoFile: null,
    preview: dog?.photo_url || null,
  }
}

export function DogFields({ draft, onChange }) {
  const { form, preview } = draft
  const set = (field, value) => onChange({ ...draft, form: { ...form, [field]: value } })
  function pickPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    onChange({ ...draft, photoFile: file, preview: URL.createObjectURL(file) })
  }
  return (
    <>
      <div style={{ marginBottom: 14, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0EDE5', overflow: 'hidden', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
          {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pawIcon(C.indigo, 26)}
        </div>
        <label style={{ display: 'inline-block', background: '#F0EDE5', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, color: C.indigo, cursor: 'pointer' }}>
          {preview ? 'Change Photo' : '+ Add Photo'}
          <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Max" />
        </div>
        <div>
          <label style={labelStyle}>Breed</label>
          <input style={inputStyle} value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="Golden Retriever" />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Age (years)</label>
        <input type="number" min="0" max="25" style={{ ...inputStyle, width: '50%' }} value={form.age} onChange={e => set('age', e.target.value)} placeholder="3" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Behavioral Notes</label>
        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.behavioral_notes} onChange={e => set('behavioral_notes', e.target.value)} placeholder="Friendly, pulls on leash, scared of thunder..." />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Medical Needs</label>
        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.medical_needs} onChange={e => set('medical_needs', e.target.value)} placeholder="Allergies, medications, vet instructions..." />
      </div>
    </>
  )
}

// Uploads a newly picked photo (if any), then inserts or updates the dog. Returns an error or null.
export async function saveDog(clientId, draft) {
  const { form, photoFile } = draft
  let photo_url = form.photo_url || null
  if (photoFile) {
    const ext = photoFile.name.split('.').pop()
    const path = `${clientId}/${Date.now()}.${ext}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dog-photos')
      .upload(path, photoFile, { upsert: true })
    if (uploadError) {
      console.error('Photo upload failed:', uploadError.message)
    } else if (uploadData) {
      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(path)
      photo_url = urlData?.publicUrl || null
    }
  }
  const payload = { name: form.name.trim(), breed: form.breed.trim() || null, age: form.age !== '' ? parseInt(form.age) : null, behavioral_notes: form.behavioral_notes.trim() || null, medical_needs: form.medical_needs.trim() || null, client_id: clientId, photo_url }
  const { error } = draft.id
    ? await supabase.from('dogs').update(payload).eq('id', draft.id)
    : await supabase.from('dogs').insert(payload)
  return error || null
}

// "Removing" a dog deactivates it (the record stays for walk history and
// invoices) and cancels its upcoming walks, boardings, and recurring walks.
export async function removeDog(dogId) {
  const { error } = await supabase.rpc('deactivate_dog', { p_dog_id: dogId })
  return error || null
}

export const REMOVE_WARNING = 'Its upcoming walks, boardings, and recurring walks will be canceled. Past walks and invoices keep its name.'

export const removeBtnStyle = { width: '100%', background: 'white', border: '2px solid #991B1B', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#991B1B', cursor: 'pointer' }

export default function DogForm({ clientId, dog, onSaved, onCancel }) {
  const [draft, setDraft] = useState(() => dogDraft(dog))
  const [savingDog, setSavingDog] = useState(false)
  const [dogSaved, setDogSaved] = useState(false)
  const [dogError, setDogError] = useState(null)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const nameMissing = !draft.form.name.trim()

  async function handleSave() {
    if (nameMissing) return
    setSavingDog(true)
    setDogError(null)
    try {
      const error = await saveDog(clientId, draft)
      if (error) throw error
      setSavingDog(false)
      setDogSaved(true)
      setTimeout(() => { setDogSaved(false); onSaved() }, 1200)
    } catch (err) {
      console.error('Save dog failed:', err)
      setSavingDog(false)
      setDogError('Could not save. Please check your connection and try again.')
    }
  }

  async function handleRemove() {
    setSavingDog(true)
    setDogError(null)
    const error = await removeDog(dog.id)
    setSavingDog(false)
    if (error) {
      console.error('Remove dog failed:', error)
      setConfirmingRemove(false)
      setDogError('Could not remove. Please check your connection and try again.')
      return
    }
    onSaved()
  }

  if (confirmingRemove) {
    return (
      <div style={{ ...cardStyle, borderLeft: '4px solid #991B1B' }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#991B1B', marginBottom: 8 }}>Remove {dog.name}?</div>
        <div style={{ fontSize: '0.9rem', color: C.charcoal, marginBottom: 16 }}>{REMOVE_WARNING}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRemove} disabled={savingDog} style={{ flex: 1, background: '#991B1B', color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            {savingDog ? 'Removing...' : 'Yes, Remove Dog'}
          </button>
          <button onClick={() => setConfirmingRemove(false)} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
            Keep Dog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...cardStyle, borderLeft: `4px solid ${C.indigo}` }}>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: C.indigo, marginBottom: 16 }}>
        {dog ? `Edit ${dog.name}` : 'Add a Dog'}
      </div>
      <DogFields draft={draft} onChange={setDraft} />
      {dogSaved && (
        <div style={{ background: '#D1FAE5', border: '2px solid #10B981', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{checkIcon('#065F46', 20)}</span>
          <span style={{ fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>Saved successfully!</span>
        </div>
      )}
      {dogError && (
        <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{warningIcon('#991B1B', 20)}</span>
          <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>{dogError}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleSave} disabled={savingDog || nameMissing} style={{ flex: 1, background: nameMissing ? '#636e72' : (dogSaved ? C.teal : C.indigo), color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
          {dogSaved ? 'Saved!' : savingDog ? 'Saving...' : dog ? 'Save Changes' : 'Add Dog'}
        </button>
        <button onClick={onCancel} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '11px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.light, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
      {dog && (
        <button onClick={() => setConfirmingRemove(true)} disabled={savingDog} style={{ ...removeBtnStyle, marginTop: 12 }}>
          Remove Dog
        </button>
      )}
    </div>
  )
}
