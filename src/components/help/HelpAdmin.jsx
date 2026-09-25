import { useNavigate } from 'react-router-dom'

function Section({ color, title, items }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 24 }}>
      <div style={{ background: color, color: 'white', fontWeight: 800, fontSize: 26, padding: '14px 22px' }}>{title}</div>
      <div style={{ padding: '8px 22px 10px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: '15px 0', borderBottom: i < items.length - 1 ? '2px solid #F0F0F0' : 'none' }}>
            <div style={{ fontSize: 23, fontWeight: 800, color: '#182B4A', marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: 20, color: '#2D3436', lineHeight: 1.45 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HelpAdmin() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px', fontFamily: 'Nunito, sans-serif' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 18px', fontSize: 18, fontWeight: 700, color: '#636e72', cursor: 'pointer', marginBottom: 20 }}>
        ← Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#182B4A', marginBottom: 4 }}>Admin Portal Guide</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#2D3436' }}>Everything the admin side of FetchUs can do</div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 24, fontSize: 22, lineHeight: 1.45 }}>
        This covers every screen and button in the Admin Portal — a reference any time you want a reminder of how something works.
      </div>

      <Section color="#182B4A" title="Home" items={[
        { name: 'At-a-glance stats', desc: 'Walks today, pending requests, pending boardings, active clients, and walkers — all in one place.' },
        { name: 'View As', desc: 'Preview the app exactly as a Walker or Pet Parent would see it. Tap "Back to Admin" to return.' },
        { name: 'Recent Activity', desc: 'A running feed of the latest walk requests and status changes.' },
        { name: 'Colored tiles', desc: 'Quick shortcuts to the Requests, People, Schedule, and Tools tabs.' },
      ]} />

      <Section color="#A14B5C" title="Requests" items={[
        { name: 'Set Up a Recurring Walk', desc: 'Book the same walk on repeating days each week for a client, all in one go.' },
        { name: 'Walk Requests', desc: 'New requests show as Pending — Decline them or Assign a Walker. Once assigned, you can Reassign or Cancel it.' },
        { name: 'Boarding Requests', desc: 'Same idea as walks: Decline or Assign a walker for pending requests; Cancel an assigned boarding if needed.' },
        { name: 'Resolved requests', desc: 'Past/handled requests are tucked under a "Show resolved" link so the active list stays short and clear.' },
      ]} />

      <Section color="#3F7A52" title="People" items={[
        { name: 'Client & Walker list', desc: 'See everyone using FetchUs at a glance.' },
        { name: '+ Add Walker', desc: 'Sends a walker an invite link so they can set up their own account.' },
        { name: '+ Add Pet Parent', desc: "Creates a client's account immediately — no waiting on them to register. Double-check the email, confirm, and their sign-in email is sent automatically." },
        { name: 'View a client', desc: 'Opens their profile, dogs, and walk/boarding history. Tap "Edit Client Profile" to change their details, second contact, and dogs in one form, including adding or removing a dog. Removing a dog cancels its upcoming walks, boardings, and recurring walks. You can also book a walk for them right from this screen.' },
        { name: 'Deactivate / Reactivate', desc: "Move someone who's no longer active out of the main list. Fully reversible any time." },
      ]} />

      <Section color="#A8552F" title="Schedule" items={[
        { name: 'Upcoming walks', desc: 'Every walk on the calendar, soonest first.' },
        { name: '+ Add Walk', desc: 'Book a walk directly: pick the client, their dog, a walker (or leave it unassigned for now), then the date and time.' },
        { name: 'Cancel', desc: 'Removes a walk from the active schedule while keeping the record on file — nothing is ever truly deleted.' },
      ]} />

      <Section color="#636e72" title="Tools" items={[
        { name: 'Invoices', desc: 'Pick a client and date range to pull in walks/boardings, fill in prices, Preview before anything saves, then Finalize to lock in a real invoice number and download the PDF.' },
        { name: 'Client Report', desc: 'Pick a client and date range to generate a PDF summary of their activity.' },
        { name: 'Broadcast Message', desc: 'Send one message to every active client at once — useful for weather closures or announcements.' },
      ]} />

      <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 700, color: '#2D3436', marginTop: 8 }}>
        Questions about anything here? Just ask Nancy.
      </div>
    </div>
  )
}
