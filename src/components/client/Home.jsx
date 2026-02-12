import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'
import Button from '../shared/Button'

export default function ClientHome() {
  const navigate = useNavigate()
  const [walks, setWalks] = useState([])
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  
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
      
      setWalks(walksData || [])
      setDogs(dogsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
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
      
      {/* Upcoming Walks */}
      <div>
        <h3 className="text-lg font-bold mb-3">Upcoming Walks</h3>
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
            {walks.slice(0, 2).map(walk => (
              <Card key={walk.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">Walk #{walk.id.slice(0, 8)}</h4>
                    <p className="text-sm text-charcoal-light">
                      {walk.started_at ? new Date(walk.started_at).toLocaleDateString() : 'Scheduled'}
                    </p>
                  </div>
                  <span className={`status-badge ${walk.completed_at ? 'status-completed' : walk.started_at ? 'status-in-progress' : 'status-confirmed'}`}>
                    {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                  </span>
                </div>
                {walk.duration && (
                  <p className="text-sm text-charcoal-light">Duration: {walk.duration} minutes</p>
                )}
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
