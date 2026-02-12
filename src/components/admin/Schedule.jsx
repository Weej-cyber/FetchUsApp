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
        .select('*')
        .order('created_at', { ascending: false })
      
      setWalks(data || [])
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
        <button className="text-indigo font-bold">+ Add Walk</button>
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
                  <h4 className="font-bold">Walk #{walk.id.slice(0, 8)}</h4>
                  <p className="text-sm text-charcoal-light">
                    {walk.started_at 
                      ? new Date(walk.started_at).toLocaleString()
                      : new Date(walk.created_at).toLocaleDateString()
                    }
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
              
              {walk.walker_id && (
                <p className="text-sm text-charcoal-light">
                  Walker ID: {walk.walker_id.slice(0, 8)}
                </p>
              )}
              
              {walk.duration && (
                <p className="text-sm text-charcoal-light">
                  Duration: {walk.duration} minutes
                </p>
              )}
              
              {walk.notes && (
                <p className="text-sm mt-2 p-2 bg-cream-dark rounded-lg">
                  {walk.notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
