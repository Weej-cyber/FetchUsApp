import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'

export default function AdminSchedule() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  async function fetchSchedule() {
    try {
      const { data } = await supabase
        .from('walks')
        .select(`
          id,
          started_at,
          completed_at,
          status,
          duration,
          created_at,
          walker:walker_id (
            name,
            email
          ),
          booking:booking_id (
            preferred_date,
            preferred_time,
            service_type,
            dog_ids,
            client:client_id (
              address,
              user:user_id (
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (!data) { setWalks([]); return }

      // Look up dog names
      const allDogIds = [...new Set(data.flatMap(w => w.booking?.dog_ids || []))]
      let dogMap = {}
      if (allDogIds.length > 0) {
        const { data: dogs } = await supabase.from('dogs').select('id, name').in('id', allDogIds)
        if (dogs) dogs.forEach(d => { dogMap[d.id] = d.name })
      }

      const normalized = data.map(w => ({
        ...w,
        dog_names: (w.booking?.dog_ids || []).map(id => dogMap[id]).filter(Boolean).join(', ') || null,
        client_name: w.booking?.client?.user?.name || null,
        walker_name: w.walker?.name || w.walker?.email || null,
        preferred_date: w.booking?.preferred_date || null,
        preferred_time: w.booking?.preferred_time || null,
        service_type: w.booking?.service_type || null,
      }))

      setWalks(normalized)
    } catch (error) {
      console.error('Error fetching schedule:', error)
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
        <h2 className="text-2xl font-bold">Schedule</h2>
        <span className="text-sm text-charcoal-light">{walks.length} walks</span>
      </div>

      {walks.length === 0 ? (
        <Card>
          <p className="text-center text-charcoal-light py-8">No walks scheduled</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {walks.map(walk => (
            <Card key={walk.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">
                    {walk.client_name || 'Client'}{walk.dog_names ? ` · ${walk.dog_names}` : ''}
                  </h4>
                  <p className="text-sm text-charcoal-light">
                    {walk.preferred_date
                      ? new Date(walk.preferred_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : new Date(walk.created_at).toLocaleDateString()
                    }
                    {walk.preferred_time ? ` at ${walk.preferred_time}` : ''}
                  </p>
                </div>
                <span className={`status-badge ${
                  walk.completed_at ? 'status-completed' :
                  walk.started_at ? 'status-in-progress' :
                  'status-confirmed'
                }`}>
                  {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                </span>
              </div>
              {walk.walker_name && (
                <p className="text-sm text-charcoal-light">🦮 Walker: {walk.walker_name}</p>
              )}
              {walk.service_type && (
                <p className="text-sm text-charcoal-light">⏱️ {walk.service_type}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
