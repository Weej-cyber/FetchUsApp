import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'
import Button from '../shared/Button'

export default function WalkerDashboard() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchTodayWalks()
  }, [])
  
  async function fetchTodayWalks() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('walks')
        .select('*')
        .gte('created_at', today)
        .order('started_at', { ascending: true })
      
      setWalks(data || [])
    } catch (error) {
      console.error('Error fetching walks:', error)
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
      <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-box">
          <h3>{walks.length}</h3>
          <p>Total Walks</p>
        </div>
        <div className="stat-box">
          <h3>{walks.filter(w => w.completed_at).length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-box">
          <h3>{walks.filter(w => !w.completed_at).length}</h3>
          <p>Remaining</p>
        </div>
      </div>
      
      {/* Walks List */}
      {walks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-bold mb-2">No walks scheduled today</h3>
            <p className="text-charcoal-light">Enjoy your day off!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {walks.map(walk => (
            <Card key={walk.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold">Walk #{walk.id.slice(0, 8)}</h4>
                  <p className="text-sm text-charcoal-light">
                    {walk.started_at ? new Date(walk.started_at).toLocaleTimeString() : 'Not started'}
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
              
              {walk.duration && (
                <p className="text-sm mb-3">Duration: {walk.duration} minutes</p>
              )}
              
              {!walk.completed_at && (
                <div className="flex gap-2">
                  {!walk.started_at ? (
                    <Button variant="success" className="flex-1">
                      Start Walk
                    </Button>
                  ) : (
                    <Button variant="secondary" className="flex-1">
                      End Walk
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
