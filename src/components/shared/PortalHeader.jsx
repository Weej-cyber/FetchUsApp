// Shared top header for the three role portals (Admin, Walker, Client).
// This is the ONLY header layout in the app -- every portal calls it with
// the same structure (logo, optional eyebrow, title, subtitle, sign out).
// There is no variant prop and no per-portal color banner on purpose:
// that's what used to make each portal's header look different. If a
// portal needs its own color identity, do it elsewhere on the page --
// not in this header.
export default function PortalHeader({
  eyebrow,   // optional small label above the title
  title,
  subtitle,
  onSignOut,
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 16, paddingTop: 4 }}>
      <button onClick={onSignOut} style={{ position: 'absolute', top: 0, right: 0, background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#636e72', cursor: 'pointer' }}>
        Sign Out
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ background: '#B3E0FD', borderRadius: 12, padding: '6px 14px', boxShadow: '0 1px 4px rgba(45,52,54,0.08)' }}>
          <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 72, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        {eyebrow && (
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '6px 0 0' }}>{eyebrow}</div>
        )}
        <h1 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#182B4A', margin: '4px 0 0' }}>{title}</h1>
        <p style={{ color: '#636e72', fontSize: '0.82rem', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
    </div>
  )
}
