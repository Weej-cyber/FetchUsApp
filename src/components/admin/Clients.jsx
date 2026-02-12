import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'

export default function AdminClients() {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchClients()
  }, [])
  
  async function fetchClients() {
    try {
      // For now, show dogs as a proxy for clients
      const { data } = await supabase
        .from('dogs')
        .select('*')
        .order('name')
      
      setDogs(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button className="text-indigo font-bold">+ Add Client</button>
      </div>
      
      {dogs.length === 0 ? (
        <Card>
          <p className="text-center text-charcoal-light py-8">No clients registered yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogs.map(dog => (
            <Card key={dog.id}>
              <h4 className="font-bold mb-1">{dog.name}'s Owner</h4>
              <p className="text-sm text-charcoal-light">
                Dog: {dog.name} • {dog.breed || 'Mixed'}
              </p>
              {dog.behavioral_notes && (
                <p className="text-xs mt-2 text-charcoal-light">
                  Notes: {dog.behavioral_notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
