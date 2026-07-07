import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import Card from '../shared/Card'
import Button from '../shared/Button'

const DEMO_WALKS = [
  {
    id: 'demo-walk-1',
    duration: 30,
    status: 'confirmed',
    dog_names: 'Max',
    client_name: 'Sarah Johnson',
    address: '123 Oak Street',
    scheduled_time: '10:00 AM',
    started_at: null,
    completed_at: null
  },
  {
    id: 'demo-walk-2',
    duration: 45,
    status: 'confirmed',
    dog_names: 'Bella & Max',
    client_name: 'Sarah Johnson',
    address: '123 Oak Street',
    scheduled_time: '2:00 PM',
    started_at: null,
    completed_at: null
  },
  {
    id: 'demo-walk-3',
    duration: 30,
    status: 'confirmed',
    dog_names: 'Charlie',
    client_name: 'Mike Davis',
    address: '456 Pine Avenue',
    scheduled_time: '4:30 PM',
    started_at: null,
    completed_at: null
  }
]

export default function WalkerDashboard() {
  const { user } = useAuth()
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchTodayWalks()
  }, [])

  async function fetchTodayWalks() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const forcedDemo = urlParams.get('demo') === 'true'

      if (forcedDemo) {
        setDemoMode(true)
        setWalks(DEMO_WALKS)
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('walks')
        .select('*')
        .gte('created_at', today)
        .order('started_at', { ascending: true })

      if (!data || data.length === 0) {
        setDemoMode(true)
        setWalks(DEMO_WALKS)
      } else {
        setWalks(data)
      }
    } catch (error) {
      console.error('Error fetching walks:', error)
      setDemoMode(true)
      setWalks(DEMO_WALKS)
    } finally {
      setLoading(false)
    }
  }

  async function sendSmsNotification(walkId, eventType) {
    try {
      await supabase.functions.invoke('send-sms', {
        body: { walk_id: walkId, event_type: eventType },
      })
    } catch (err) {
      console.error('SMS notification failed:', err)
      // Don't block the walk action if SMS fails
    }
  }

  async function handleStartWalk(walkId) {
    if (demoMode) return
    setActionLoading(prev => ({ ...prev, [walkId]: 'starting' }))
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('walks')
        .update({ started_at: now, status: 'in_progress' })
        .eq('id', walkId)

      if (error) throw error

      // Update local state immediately
      setWalks(prev => prev.map(w => w.id === walkId ? { ...w, started_at: now, status: 'in_progress' } : w))

      // Send SMS notification
      await sendSmsNotification(walkId, 'walk_started')

    } catch (err) {
      console.error('Error starting walk:', err)
      alert('Failed to start walk. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [walkId]: null }))
    }
  }

  async function handleEndWalk(walkId) {
    if (demoMode) return
    setActionLoading(prev => ({ ...prev, [walkId]: 'ending' }))
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('walks')
        .update({ completed_at: now, status: 'completed' })
        .eq('id', walkId)

      if (error) throw error

      // Update local state immediately
      setWalks(prev => prev.map(w => w.id === walkId ? { ...w, completed_at: now, status: 'completed' } : w))

      // Send SMS notification
      await sendSmsNotification(walkId, 'walk_completed')

    } catch (err) {
      console.error('Error ending walk:', err)
      alert('Failed to end walk. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [walkId]: null }))
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
                  <h4 className="font-bold">{walk.scheduled_time || 'Walk'}</h4>
                  <p className="text-sm text-charcoal-light">{walk.dog_names}</p>
                  <p className="text-sm text-charcoal-light">{walk.client_name}</p>
                </div>
                <span className={`status-badge ${
                  walk.completed_at ? 'status-completed' :
                  walk.started_at ? 'status-in-progress' :
                  'status-confirmed'
                }`}>
                  {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                </span>
              </div>

              <div className="text-sm mb-3 text-charcoal-light">
                <p>📍 {walk.address}</p>
                <p>⏱️ {walk.duration} minutes</p>
              </div>

              {!walk.completed_at && (
                <div className="flex gap-2">
                  {!walk.started_at ? (
                    <Button
                      className="flex-1 bg-teal text-white"
                      onClick={() => handleStartWalk(walk.id)}
                      disabled={!!actionLoading[walk.id]}
                    >
                      {actionLoading[walk.id] === 'starting' ? 'Starting...' : 'Start Walk'}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-charcoal-light text-white"
                      onClick={() => handleEndWalk(walk.id)}
                      disabled={!!actionLoading[walk.id]}
                    >
                      {actionLoading[walk.id] === 'ending' ? 'Ending...' : 'End Walk'}
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
