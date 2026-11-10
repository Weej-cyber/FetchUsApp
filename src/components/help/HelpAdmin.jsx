import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS as C } from '../../theme'

// Task-based guide for the Admin side. Every button name below was checked
// against the real Admin screens. Groups open one at a time and each task
// opens on tap, so nobody has to scroll a long page.
const GROUPS = [
  {
    id: 'daily',
    title: 'Every day',
    tasks: [
      {
        title: 'See what needs my attention',
        steps: [
          'Open the Admin app. You start on Home.',
          'Look at the cards. Pending Requests and Pending Boardings are new requests waiting for you.',
          'Tap a card to see those requests.',
          'Tap Walks Today to see today\'s walks.',
        ],
        note: 'Recent Activity, lower on Home, lists what just happened.',
      },
      {
        title: 'Answer a new walk or boarding request',
        steps: [
          'Tap Requests at the bottom.',
          'Find the request marked Pending.',
          'To say no, tap Decline.',
          'To say yes, tap Edit, choose the walker under Walker, then tap Save Changes.',
        ],
        note: 'Saving with a walker picked assigns it. The client and the walker are told automatically. Clients get a text only if they have agreed to texts.',
      },
      {
        title: 'Close out a walk that never got finished',
        steps: [
          'Tap Tools at the bottom, then find Reconciliation.',
          'Choose a Start Date and an End Date.',
          'Tap Run Reconciliation.',
          'Each walk or boarding listed was never closed out. Tap Edit on it.',
          'Change Status to Completed (or Cancelled if it never happened), then tap Save Changes.',
        ],
        note: 'Run this before you make invoices so nothing slips through.',
      },
    ],
  },
  {
    id: 'clients',
    title: 'Clients',
    tasks: [
      {
        title: 'Add a new pet parent',
        steps: [
          'Tap People at the bottom, then tap + Add Pet Parent.',
          'Type their name and email. Add their phone and address if you have them.',
          'Leave the text box checked if they agreed to text updates. Uncheck it if they did not.',
          'Tap Review & Create.',
          'Check that the email is spelled right, then tap Yes, Create This Client.',
        ],
        note: 'Their account is ready right away and their sign-in email is sent automatically. There is nothing for you to send.',
      },
      {
        title: 'Fix a client\'s information',
        steps: [
          'Tap People, find the client, and tap View.',
          'Tap Edit Client Profile.',
          'Change what needs changing: Name, Phone, Address, Access Notes, or Login Email.',
          'Tap Save.',
          'If you changed the Login Email, a box shows the new address. Check it, then tap Yes, Save Changes.',
        ],
        note: 'The login email is how they sign in, so make sure it is spelled exactly right.',
      },
      {
        title: 'Add or change a second contact',
        steps: [
          'Tap People, find the client, and tap View.',
          'Tap Edit Client Profile and go down to Second Contact.',
          'Fill in the Name, Phone, and Email (the email is optional).',
          'Check the box only if that person agreed to texts.',
          'Tap Save.',
        ],
      },
      {
        title: 'Add or remove a client\'s dog',
        steps: [
          'Tap People, find the client, and tap View.',
          'Tap Edit Client Profile and go down to the dogs.',
          'To add a dog, tap + Add Dog and fill in the details. To take one off, tap Remove Dog (tap Undo if you change your mind).',
          'Tap Save.',
        ],
      },
      {
        title: 'Find a client, dog, or walk',
        steps: [
          'Tap Home at the bottom.',
          'Tap the search bar at the top: "Search by dog, client, or date..."',
          'Type a dog name, a client name, or a date.',
        ],
      },
      {
        title: 'Remove a client or walker, or bring them back',
        steps: [
          'Tap People and find the person.',
          'Tap Delete next to their name and confirm. Their account is turned off, not erased.',
          'To bring someone back, tap View Deactivated at the top of People, then tap Reactivate next to their name.',
        ],
        note: 'Delete never erases anyone. Their history stays, and you can reactivate them any time.',
      },
    ],
  },
  {
    id: 'booking',
    title: 'Booking',
    tasks: [
      {
        title: 'Book a walk for a client',
        steps: [
          'Tap Schedule at the bottom, then tap + Add Walk.',
          'Choose the Client, then the Dog.',
          'Choose the Service Type, the Date, and the Time Slot.',
          'Pick a walker under Assign Walker, or leave it Unassigned.',
          'Tap Add Walk.',
        ],
      },
      {
        title: 'Set up a repeating walk',
        steps: [
          'Tap Requests at the bottom and find Recurring Walks.',
          'Tap Set Up Recurring Walk.',
          'Choose the Client and Dog, the Service Type, and the Days of the Week.',
          'Choose the Time, the Start Date, and the Number of Weeks.',
          'Pick a walker under Assign Walker, then tap Confirm.',
        ],
      },
      {
        title: 'Change a walk or switch the walker',
        steps: [
          'Find the walk under Requests, or under Schedule.',
          'Tap Edit.',
          'Change the Walker, Date, Time Slot, or whatever needs changing.',
          'Tap Save Changes.',
        ],
      },
      {
        title: 'Cancel a walk or boarding',
        steps: [
          'Find it under Requests, or under Schedule.',
          'Tap Cancel and confirm.',
        ],
        note: 'It leaves the schedule but stays on record. Nothing is erased.',
      },
      {
        title: 'Book a walk from a client\'s page',
        steps: [
          'Tap People, find the client, and tap View.',
          'Tap Book a Walk for (their name) at the top.',
          'Fill in the form and confirm.',
        ],
      },
    ],
  },
  {
    id: 'walkers',
    title: 'Walkers',
    tasks: [
      {
        title: 'Add a new walker',
        steps: [
          'Tap People at the bottom, then tap + Add Walker.',
          'Type their name, email, and phone.',
          'Tap Send Magic Link.',
          'The walker gets a link by email. When they tap it and sign in, their account is set up.',
        ],
        note: 'Walkers set up their own account from that link. That is different from adding a pet parent.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    tasks: [
      {
        title: 'Make an invoice',
        steps: [
          'Tap Tools at the bottom and find Invoices.',
          'Choose the client and a start and end date, then tap Load Walks & Boardings.',
          'Type a price for each line. Tap + Add Custom Line Item for anything extra.',
          'Tap Preview PDF to look it over. Nothing is saved yet.',
          'When it is right, tap Finalize Invoice. This gives it a real invoice number and saves it.',
        ],
        note: 'Past invoices are listed below, each with a button to download it again.',
      },
      {
        title: 'Find walks that never got closed out',
        steps: [
          'Tap Tools and find Reconciliation.',
          'Choose the dates and tap Run Reconciliation.',
          'Fix each item with Edit, as described under "Every day."',
        ],
      },
      {
        title: 'Make a report for one client',
        steps: [
          'Tap Tools and find Client Report.',
          'Choose the client and the dates, then tap Run Report.',
          'Use the export button that appears with the results.',
        ],
      },
    ],
  },
  {
    id: 'texts',
    title: 'Texts and announcements',
    tasks: [
      {
        title: 'Check that clients are getting texts',
        steps: [
          'Tap Tools and find Text Messages.',
          'The top line shows how many texts went out this past week.',
          'Needs attention lists any client whose text did not go out, and why.',
          'Tap Sent or All to see the full list. Tap Show more to see more.',
        ],
      },
      {
        title: 'Send an announcement to every client',
        steps: [
          'Tap Tools and find the message box.',
          'Type your message.',
          'Tap Send to All Clients.',
        ],
        note: 'Use it for weather closures or schedule changes. It goes to every client who has agreed to texts.',
      },
    ],
  },
  {
    id: 'wrong',
    title: 'If something looks wrong',
    tasks: [
      {
        title: 'A client says they are not getting texts',
        steps: [
          'Tap Tools, then Text Messages, then Needs attention.',
          'Find the client. The line tells you why.',
          'If it says the client has not agreed to texts, ask them to turn on text updates in the Profile tab of their own account, or ask Clarence.',
          'If it says there is no phone number, tap People, find the client, tap View, tap Edit Client Profile, add the phone number, and tap Save.',
        ],
      },
      {
        title: 'A client cannot sign in',
        steps: [
          'Tap People, find the client, and tap View.',
          'Check the Login email shown there. It must be exactly the email they type in.',
          'If it is wrong, tap Edit Client Profile, fix the Login Email, and tap Save. Confirm the new address when asked.',
          'Tell them to enter their email on the sign-in page and tap the link that arrives.',
        ],
      },
      {
        title: 'A walk is stuck on "In Progress"',
        steps: [
          'The walker did not tap Complete Walk. The client does not get the finished text until they do.',
          'Ask the walker to tap Complete Walk in their app.',
          'If that cannot be done, tap Tools, Reconciliation, run it, and tap Edit on the walk.',
          'Change Status to Completed and tap Save Changes.',
        ],
      },
    ],
  },
]

function Task({ task, open, onToggle }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(45,52,54,0.07)', marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{ width: '100%', minHeight: 56, background: 'white', border: 'none', padding: '14px 18px', textAlign: 'left', fontFamily: 'inherit', fontSize: 22, fontWeight: 800, color: C.indigo, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
      >
        <span>{task.title}</span>
        <span style={{ fontSize: 26 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <ol style={{ margin: 0, paddingLeft: 30 }}>
            {task.steps.map((s, i) => (
              <li key={i} style={{ fontSize: 20, lineHeight: 1.5, color: C.charcoal, marginBottom: 10 }}>{s}</li>
            ))}
          </ol>
          {task.note && (
            <div style={{ background: C.greenBg, color: C.green, borderRadius: 10, padding: '12px 14px', fontSize: 20, lineHeight: 1.45, fontWeight: 700, marginTop: 6 }}>
              Good to know: {task.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HelpAdmin() {
  const navigate = useNavigate()
  const [groupId, setGroupId] = useState(null)
  const [openTask, setOpenTask] = useState(null)
  const group = GROUPS.find(g => g.id === groupId)

  const backBtn = { background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '12px 20px', minHeight: 48, fontSize: 18, fontWeight: 700, color: C.muted, cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px', fontFamily: 'Nunito, sans-serif' }}>
      {group ? (
        <button onClick={() => { setGroupId(null); setOpenTask(null) }} style={backBtn}>← All topics</button>
      ) : (
        <button onClick={() => navigate(-1)} style={backBtn}>← Back</button>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.indigo, marginBottom: 4 }}>{group ? group.title : 'Admin Guide'}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.charcoal }}>{group ? 'Tap a job to see the steps' : 'Pick the kind of job you need help with'}</div>
      </div>

      {group ? (
        group.tasks.map((t, i) => (
          <Task key={t.title} task={t} open={openTask === i} onToggle={() => setOpenTask(openTask === i ? null : i)} />
        ))
      ) : (
        GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => setGroupId(g.id)}
            style={{ width: '100%', minHeight: 64, background: C.indigo, color: 'white', border: 'none', borderRadius: 14, padding: '16px 20px', marginBottom: 12, textAlign: 'left', fontFamily: 'inherit', fontSize: 24, fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
          >
            <span>{g.title}</span>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{g.tasks.length} {g.tasks.length === 1 ? 'job' : 'jobs'}</span>
          </button>
        ))
      )}
    </div>
  )
}
