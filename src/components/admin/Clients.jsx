import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      const { data } = await supabase
        .from('clients')
        .select(`
          id,
          address,
          user:user_id (
            name,
            email,
            phone,
            sms_consent
          ),
          dogs (
            id,
            name,
            breed
          )
        `)
        .order('created_at', { ascending: false })

      setClients(data || [])
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
        <span className="text-sm text-charcoal-light">{clients.length} total</span>
      </div>

      {clients.length === 0 ? (
        <Card>
          <p className="text-center text-charcoal-light py-8">No clients registered yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <Card key={client.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">{client.user?.name || 'Unnamed Client'}</h4>
                  <p className="text-sm text-charcoal-light">{client.user?.email}</p>
                </div>
                {client.user?.sms_consent && (
                  <span className="status-badge status-confirmed">SMS ✓</span>
                )}
              </div>
              {client.user?.phone && (
                <p className="text-sm text-charcoal-light">📞 {client.user.phone}</p>
              )}
              {client.address && (
                <p className="text-sm text-charcoal-light">📍 {client.address}</p>
              )}
              {client.dogs && client.dogs.length > 0 && (
                <p className="text-sm text-charcoal-light mt-1">
                  🐕 {client.dogs.map(d => d.name).join(', ')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
