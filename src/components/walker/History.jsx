import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'

export default function WalkerHistory() {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchHistory()
  }, [])
  
  async function fetchHistory() {
    try {
      const { data } = await supabase
        .from('walks')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(20)
      
      setWalks(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
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
      <h2 className="text-2xl font-bold mb-6">Walk History</h2>
      
      {walks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-charcoal-light">No completed walks yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {walks.map(walk => (
            <Card key={walk.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">Walk #{walk.id.slice(0, 8)}</h4>
                  <p className="text-sm text-charcoal-light">
                    {new Date(walk.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="status-badge status-completed">Completed</span>
              </div>
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
