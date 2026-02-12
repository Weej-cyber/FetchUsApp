import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'
import Button from '../shared/Button'

// Demo data to show when database is empty
const DEMO_WALKS = [
  {
    id: 'demo-1',
    duration: 30,
    status: 'in-progress',
    dog_names: 'Max',
    walker_name: 'Mike',
    scheduled_time: 'Today 2:00 PM',
    started_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    duration: 30,
    status: 'confirmed',
    dog_names: 'Max',
    walker_name: 'Mike',
    scheduled_time: 'Tomorrow 2:00 PM',
    started_at: null,
    completed_at: null
  },
  {
    id: 'demo-3',
    duration: 60,
    status: 'pending',
    dog_names: 'Max & Bella',
    walker_name: 'Pending assignment',
    scheduled_time: 'Friday 10:00 AM',
    started_at: null,
    completed_at: null
  }
]

const DEMO_DOGS = [
  { id: 'demo-dog-1', name: 'Max', breed: 'Golden Retriever' },
  { id: 'demo-dog-2', name: 'Bella', breed: 'Labrador' }
]

export default function ClientHome() {
  const navigate = useNavigate()
  const [walks, setWalks] = useState([])
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  async function fetchData() {
    try {
      // Fetch walks
      const { data: walksData } = await supabase
        .from('walks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      // Fetch dogs
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
      
      // Use demo data if database is empty
      if ((!walksData || walksData.length === 0) && (!dogsData || dogsData.length === 0)) {
        setDemoMode(true)
        setWalks(DEMO_WALKS)
        setDogs(DEMO_DOGS)
      } else {
        setWalks(walksData || [])
        setDogs(dogsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to demo data on error
      setDemoMode(true)
      setWalks(DEMO_WALKS)
      setDogs(DEMO_DOGS)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="p-5 animate-fade-in">
        <div className="text-center py-12 text-charcoal-light">
          Loading...
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-5 pb-24 animate-fade-in space-y-6">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-gold/20 border-2 border-gold/40 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold text-charcoal">
            📱 Demo Mode - Showing sample data
          </p>
        </div>
      )}
      
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
        <p className="text-charcoal-light">Ready to book a walk for your pup?</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center cursor-pointer" onClick={() => navigate('/client/book')}>
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-indigo/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h4 className="font-bold text-sm">Book Walk</h4>
        </Card>
        
        <Card className="text-center cursor-pointer" onClick={() => navigate('/client/dogs')}>
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gold/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <h4 className="font-bold text-sm">My Dogs</h4>
        </Card>
      </div>
      
      {/* Active Walk */}
      {walks.some(w => w.status === 'in-progress' || w.started_at) && (
        <div>
          <h3 className="text-lg font-bold mb-3">Active Walk</h3>
          <Card className="bg-gradient-to-br from-indigo/10 to-indigo/5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold">{walks.find(w => w.status === 'in-progress' || w.started_at)?.dog_names}</h4>
                <p className="text-sm text-charcoal-light">{walks.find(w => w.status === 'in-progress' || w.started_at)?.duration} min walk</p>
              </div>
              <span className="status-badge status-in-progress">In Progress</span>
            </div>
            <p className="text-sm mb-3 text-charcoal-light">
              Walker: {walks.find(w => w.status === 'in-progress' || w.started_at)?.walker_name}
            </p>
            <Button onClick={() => navigate('/client/dogs')} className="w-full">
              Track Live
            </Button>
          </Card>
        </div>
      )}
      
      {/* Upcoming Walks */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Upcoming</h3>
          <span className="text-sm text-indigo font-semibold cursor-pointer">See All</span>
        </div>
        {walks.length === 0 ? (
          <Card>
            <p className="text-center text-charcoal-light py-4">
              No upcoming walks scheduled
            </p>
            <Button onClick={() => navigate('/client/book')}>
              Book Your First Walk
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {walks.filter(w => w.status !== 'in-progress' && !w.started_at).slice(0, 2).map(walk => (
              <Card key={walk.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">{walk.scheduled_time || 'Scheduled'}</h4>
                    <p className="text-sm text-charcoal-light mt-1">
                      {walk.duration}-min Walk
                    </p>
                    <p className="text-sm text-charcoal-light">
                      {walk.dog_names} • {walk.walker_name}
                    </p>
                  </div>
                  <span className={`status-badge ${
                    walk.status === 'confirmed' ? 'status-confirmed' : 
                    walk.status === 'pending' ? 'status-pending' : 
                    'status-completed'
                  }`}>
                    {walk.status === 'confirmed' ? 'Confirmed' : 
                     walk.status === 'pending' ? 'Pending' : 
                     'Completed'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* My Dogs Summary */}
      {dogs.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">My Dogs</h3>
          <div className="grid grid-cols-2 gap-3">
            {dogs.slice(0, 4).map(dog => (
              <Card key={dog.id} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-cream-dark flex items-center justify-center">
                  <span className="text-2xl">🐕</span>
                </div>
                <h4 className="font-bold text-sm">{dog.name}</h4>
                <p className="text-xs text-charcoal-light">{dog.breed || 'Mixed'}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
