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

export default function HelpClient() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px', fontFamily: 'Nunito, sans-serif' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '10px 18px', fontSize: 18, fontWeight: 700, color: '#636e72', cursor: 'pointer', marginBottom: 20 }}>
        ← Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#182B4A', marginBottom: 4 }}>Your FetchUs Guide</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#2D3436' }}>Everything you can do in your account</div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 24, fontSize: 22, lineHeight: 1.45 }}>
        A reference for what's inside your account — come back to this any time you want a reminder of how something works.
      </div>

      <Section color="#A14B5C" title="Dogs" items={[
        { name: 'My Dogs', desc: 'See all your pets on file, with their photo and details.' },
        { name: '+ Add Dog', desc: "Add a new dog's name, breed, age, and any behavioral or medical notes your walker should know." },
      ]} />

      <Section color="#2D9B8A" title="Book" items={[
        { name: 'Book a Walk', desc: 'Request a one-time walk — pick your dog, the service type, and a date and time.' },
        { name: 'Set Up a Recurring Walk', desc: 'Book the same walk on repeating days each week, all in one go, instead of booking each one separately.' },
        { name: 'Book Boarding', desc: 'Request overnight boarding — pick your dog and the check-in and check-out dates.' },
      ]} />

      <Section color="#3F7A52" title="Activity" items={[
        { name: 'My Boarding Requests', desc: 'See the status of any boarding request — pending, confirmed, or completed.' },
        { name: 'My Walks', desc: "See the status of every walk. Once a walk is completed, you'll see any note your walker left, and a photo if they added one." },
      ]} />

      <Section color="#182B4A" title="Profile" items={[
        { name: 'Your info', desc: 'Update your contact info, address, and a backup contact person.' },
        { name: 'Sign Out', desc: 'Signs you out of your account on this device.' },
      ]} />

      <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 700, color: '#2D3436', marginTop: 8 }}>
        Questions? Just reach out to Nancy directly.
      </div>
    </div>
  )
}
