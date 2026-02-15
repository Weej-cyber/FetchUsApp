import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'
import Button from '../shared/Button'

const DEMO_DOGS = [
  {
    id: 'demo-dog-1',
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    behavioral_notes: 'Friendly with other dogs. Loves treats!',
    medical_needs: null
  },
  {
    id: 'demo-dog-2',
    name: 'Bella',
    breed: 'Labrador',
    age: 2,
    behavioral_notes: 'Very energetic. Needs long walks.',
    medical_needs: 'Allergic to chicken'
  }
]

export default function ClientDogs() {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  
  useEffect(() => {
    fetchDogs()
  }, [])
  
  async function fetchDogs() {
    try {
      // Check if demo mode is forced via URL
      const urlParams = new URLSearchParams(window.location.search)
      const forcedDemo = urlParams.get('demo') === 'true'
      
      if (forcedDemo) {
        setDemoMode(true)
        setDogs(DEMO_DOGS)
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from('dogs')
        .select('*')
        .order('name')
      
      if (!data || data.length === 0) {
        setDemoMode(true)
        setDogs(DEMO_DOGS)
      } else {
        setDogs(data)
      }
    } catch (error) {
      console.error('Error fetching dogs:', error)
      setDemoMode(true)
      setDogs(DEMO_DOGS)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="p-5 animate-fade-in">
        <div className="text-center py-12 text-charcoal-light">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="p-5 pb-24 animate-fade-in">
      {demoMode && (
        <div className="bg-gold/20 border-2 border-gold/40 rounded-xl p-3 text-center mb-4">
          <p className="text-sm font-semibold text-charcoal">
            📱 Demo Mode - Showing sample data
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Dogs</h2>
        <button className="text-indigo font-bold">+ Add Dog</button>
      </div>
      
      {dogs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="font-bold mb-2">No dogs yet</h3>
            <p className="text-charcoal-light mb-4">Add your first pup to get started</p>
            <Button>Add Dog</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {dogs.map(dog => (
            <Card key={dog.id}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center text-3xl flex-shrink-0">
                  🐕
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{dog.name}</h3>
                  <p className="text-charcoal-light text-sm">
                    {dog.breed || 'Mixed breed'} {dog.age ? `• ${dog.age} years old` : ''}
                  </p>
                  {dog.behavioral_notes && (
                    <p className="text-sm mt-2 text-charcoal-light">
                      <span className="font-semibold">Notes:</span> {dog.behavioral_notes}
                    </p>
                  )}
                  {dog.medical_needs && (
                    <div className="mt-2 p-2 bg-gold/10 rounded-lg text-sm">
                      <span className="font-semibold">⚕️ Medical:</span> {dog.medical_needs}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
