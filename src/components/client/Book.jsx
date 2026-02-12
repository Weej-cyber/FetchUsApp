import { useState } from 'react'
import Card from '../shared/Card'
import Button from '../shared/Button'

export default function ClientBook() {
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    notes: ''
  })
  
  const services = [
    { value: 'walk-15', label: 'Walk: 15 min', price: '$15' },
    { value: 'walk-30', label: 'Walk: 30 min', price: '$23' },
    { value: 'walk-45', label: 'Walk: 45 min', price: '$35' },
    { value: 'walk-60', label: 'Walk: 60 min', price: '$40' }
  ]
  
  const timeSlots = [
    '9:30 - 11:30',
    '11:30 - 1:30',
    '1:30 - 3:30',
    '3:30 - 5:00'
  ]
  
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Booking request submitted! (Demo mode - connect to Supabase to save)')
  }
  
  return (
    <div className="p-5 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Book a Walk</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Type */}
        <Card>
          <label className="block mb-2 font-bold">Service Type</label>
          <div className="space-y-2">
            {services.map(service => (
              <label key={service.value} className="flex items-center justify-between p-3 rounded-lg hover:bg-cream cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="service"
                    value={service.value}
                    checked={formData.service === service.value}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-4 h-4 accent-indigo"
                  />
                  <span>{service.label}</span>
                </div>
                <span className="font-bold text-indigo">{service.price}</span>
              </label>
            ))}
          </div>
        </Card>
        
        {/* Date */}
        <Card>
          <label className="block mb-2 font-bold">Preferred Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-3 rounded-lg border-2 border-cream-dark focus:border-indigo outline-none"
          />
        </Card>
        
        {/* Time Slot */}
        <Card>
          <label className="block mb-2 font-bold">Preferred Time</label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => setFormData({...formData, time: slot})}
                className={`p-3 rounded-lg font-semibold transition-all ${
                  formData.time === slot
                    ? 'bg-indigo text-white'
                    : 'bg-cream-dark hover:bg-cream'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </Card>
        
        {/* Notes */}
        <Card>
          <label className="block mb-2 font-bold">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Any special instructions or notes..."
            className="w-full p-3 rounded-lg border-2 border-cream-dark focus:border-indigo outline-none resize-none"
            rows="4"
          />
        </Card>
        
        <Button type="submit" className="w-full">
          Request Booking
        </Button>
        
        <p className="text-sm text-charcoal-light text-center">
          We'll text you to confirm all the details!
        </p>
      </form>
    </div>
  )
}
