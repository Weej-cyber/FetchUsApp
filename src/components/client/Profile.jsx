import Card from '../shared/Card'

export default function ClientProfile() {
  return (
    <div className="p-5 pb-24 animate-fade-in space-y-4">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      {/* Account Info */}
      <Card>
        <h3 className="font-bold mb-3">Account Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-charcoal-light">Name</label>
            <p className="font-semibold">Pet Parent</p>
          </div>
          <div>
            <label className="text-sm text-charcoal-light">Email</label>
            <p className="font-semibold">client@fetchus.com</p>
          </div>
          <div>
            <label className="text-sm text-charcoal-light">Phone</label>
            <p className="font-semibold">(555) 123-4567</p>
          </div>
        </div>
      </Card>
      
      {/* Address */}
      <Card>
        <h3 className="font-bold mb-3">Service Address</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-charcoal-light">Address</label>
            <p className="font-semibold">123 Main Street</p>
          </div>
          <div>
            <label className="text-sm text-charcoal-light">Access Instructions</label>
            <p className="text-sm">Gate code: 1234. Please use side entrance.</p>
          </div>
        </div>
      </Card>
      
      {/* Emergency Contact */}
      <Card>
        <h3 className="font-bold mb-3">Emergency Contact</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-charcoal-light">Name</label>
            <p className="font-semibold">Emergency Contact</p>
          </div>
          <div>
            <label className="text-sm text-charcoal-light">Phone</label>
            <p className="font-semibold">(555) 987-6543</p>
          </div>
        </div>
      </Card>
      
      {/* Payment Info */}
      <Card>
        <h3 className="font-bold mb-3">Payment Methods</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold">Venmo:</span> @FetchUs-PetCare</p>
          <p><span className="font-semibold">Zelle:</span> payments@fetchus.com</p>
          <p><span className="font-semibold">Cash:</span> Accepted</p>
        </div>
      </Card>
    </div>
  )
}
