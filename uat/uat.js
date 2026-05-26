const { chromium } = require('playwright');
const { Browserbase } = require('@browserbasehq/sdk');

const SUPABASE_URL = 'https://rwauwkrdzcesyhwpaeow.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BB_API_KEY   = process.env.BROWSERBASE_API_KEY;
const APP_URL      = 'https://fetch-us-dfpk8bzue-weej-cybers-projects.vercel.app';

const USERS = {
  admin:  { email: 'fetchusadmin@test.com' },
  walker: { email: 'fetchuswalker@test.com' },
  client: { email: 'fetchusclient@test.com' },
};

const results = [];
function record(id, title, status, note = '') {
  results.push({ id, title, status, note });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`  ${icon} ${id}: ${title}${note ? ' -- ' + note : ''}`);
}

async function getSession(email) {
  const ANON_KEY = 'sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4';
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'FetchTest1!' }),
  });
  if (!res.ok) throw new Error(`Auth failed for ${email}: ${await res.text()}`);
  const data = await res.json();
  if (!data.access_token) throw new Error(`No token for ${email}`);
  return data;
}

async function injectSession(page, session, role) {
  const url = `${APP_URL}/#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer&type=magiclink`;
  await page.goto(url);
  await page.waitForTimeout(6000);
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 600));
  console.log(`[DEBUG ${role}] Page shows: ${bodyText.replace(/\n/g, ' | ')}`);
}

async function hasText(page, text, timeout = 5000) {
  try { await page.locator(`text=${text}`).first().waitFor({ timeout }); return true; }
  catch { return false; }
}
async function findFirst(page, texts, timeout = 5000) {
  for (const t of texts) { if (await hasText(page, t, timeout)) return t; }
  return null;
}
async function clickFirst(page, texts, timeout = 4000) {
  const found = await findFirst(page, texts, timeout);
  if (!found) return false;
  await page.locator(`text=${found}`).first().click({ timeout });
  await page.waitForTimeout(800);
  return true;
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
async function runAdminTests(page) {
  console.log('\n── Admin ─────────────────────────────────────────');

  // A-01: landed on admin screen
  const landed = await findFirst(page, ['Admin Portal', 'Walk Requests', 'Clients & Walkers', 'FetchUs Pet Care']);
  record('A-01', 'Log in -- land on admin dashboard', landed ? 'PASS' : 'FAIL',
    landed ? `Found: "${landed}"` : 'Admin Portal not found');

  // A-02: Add client
  try {
    const addBtn = await findFirst(page, ['Add Client', 'Add Walker'], 4000);
    if (!addBtn) throw new Error('Add Client button not found');
    await page.locator(`text=${addBtn}`).first().click();
    await page.waitForTimeout(1000);
    const nameF = page.locator('input[placeholder="Full Name"], input[placeholder*="name" i]').first();
    if (await nameF.isVisible({ timeout: 2000 })) await nameF.fill('UAT Test Client');
    const emailF = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailF.isVisible({ timeout: 2000 })) await emailF.fill('uattest@example.com');
    const phoneF = page.locator('input[placeholder*="phone" i], input[placeholder*="Phone" i]').first();
    if (await phoneF.isVisible({ timeout: 2000 })) await phoneF.fill('5550001234');
    await clickFirst(page, ['Add Client', 'Save', 'Send Magic Link'], 3000);
    await page.waitForTimeout(2000);
    const appeared = await hasText(page, 'UAT Test Client', 4000);
    record('A-02', 'Add a new client', appeared ? 'PASS' : 'FAIL',
      appeared ? '' : 'Client name not visible after save');
  } catch (e) { record('A-02', 'Add a new client', 'FAIL', e.message); }

  // A-03: Add dog -- skipping, admin portal doesn't have a dedicated add-dog flow per the code
  record('A-03', 'Add a dog to a client', 'SKIP', 'Dog management not in admin portal UI -- handled via client portal');

  // A-04: Walk requests visible
  const hasRequests = await findFirst(page, ['Walk Requests', 'Assign Walker', 'Pending', 'Unassigned']);
  record('A-04', 'View walk requests', hasRequests ? 'PASS' : 'FAIL',
    hasRequests ? `Found: "${hasRequests}"` : 'Walk Requests section not found');

  // A-05: Schedule visible
  const hasSchedule = await findFirst(page, ['confirmed', 'Confirmed', '30-min Walk', 'Coming Up', 'Schedule']);
  record('A-05', 'View all scheduled walks', hasSchedule ? 'PASS' : 'FAIL',
    hasSchedule ? `Found: "${hasSchedule}"` : 'No scheduled walks visible');

  // A-06: Completed / history
  const hasCompleted = await findFirst(page, ['Completed', 'completed', 'Recent', 'History']);
  record('A-06', 'View completed walk history', hasCompleted ? 'PASS' : 'FAIL',
    hasCompleted ? `Found: "${hasCompleted}"` : 'No completed walks visible');

  // A-07: Notifications / broadcast
  const hasNotif = await findFirst(page, ['Broadcast Message', 'Recent Broadcasts', 'Send to All Clients']);
  record('A-07', 'Broadcast / notifications section', hasNotif ? 'PASS' : 'FAIL',
    hasNotif ? `Found: "${hasNotif}"` : 'Broadcast section not found');

  // A-08: Logout
  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('A-08', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen');
}

// ── WALKER ────────────────────────────────────────────────────────────────────
async function runWalkerTests(page) {
  console.log('\n── Walker ────────────────────────────────────────');

  // W-01: landed on walker screen
  const landed = await findFirst(page, ['My Walks', 'Viewing as Walker', 'Today', 'Coming Up']);
  record('W-01', 'Log in -- land on walker dashboard', landed ? 'PASS' : 'FAIL',
    landed ? `Found: "${landed}"` : 'Walker screen not found');

  // W-02: assigned walk visible (seeded: Test Client, Buddy, 30-min Walk)
  const hasWalk = await findFirst(page, ['Test Client', 'Buddy', '30-min Walk', 'Today', 'Coming Up']);
  record('W-02', 'View assigned walks', hasWalk ? 'PASS' : 'FAIL',
    hasWalk ? `Found: "${hasWalk}"` : 'No assigned walks visible');

  // W-03: Start a walk
  try {
    const startBtn = await findFirst(page, ['Start Walk'], 5000);
    if (!startBtn) throw new Error('Start Walk button not found');
    await page.locator('text=Start Walk').first().click();
    await page.waitForTimeout(3000);
    const inProg = await findFirst(page, ['Walk In Progress', 'Complete Walk', '✓ Complete Walk', 'Saving...']);
    record('W-03', 'Start a walk', inProg ? 'PASS' : 'FAIL',
      inProg ? `Status: "${inProg}"` : 'Walk In Progress screen not shown');
  } catch (e) { record('W-03', 'Start a walk', 'FAIL', e.message); }

  // W-04: Complete the walk
  try {
    const completeBtn = await findFirst(page, ['✓ Complete Walk', 'Complete Walk'], 5000);
    if (!completeBtn) throw new Error('Complete Walk button not found');
    await page.locator(`text=${completeBtn}`).first().click();
    await page.waitForTimeout(3000);
    const done = await findFirst(page, ['Walk Complete!', 'Client has been notified', 'My Walks']);
    record('W-04', 'Complete the walk', done ? 'PASS' : 'FAIL',
      done ? `Found: "${done}"` : 'Walk Complete screen not shown');
  } catch (e) { record('W-04', 'Complete the walk', 'FAIL', e.message); }

  // W-06: History / Recent
  const hasHist = await findFirst(page, ['Recent', 'Completed', 'Great walk', 'Buddy']);
  record('W-06', 'View walk history', hasHist ? 'PASS' : 'FAIL',
    hasHist ? `Found: "${hasHist}"` : 'No walk history visible');

  // W-07: Logout
  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('W-07', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen');
}

// ── CLIENT ────────────────────────────────────────────────────────────────────
async function runClientTests(page) {
  console.log('\n── Client ────────────────────────────────────────');

  // C-01: landed on client screen
  const landed = await findFirst(page, ['Welcome back', 'Viewing as Client', '🐕 My Dogs', '📅 Book a Walk']);
  record('C-01', 'Log in -- land on client portal', landed ? 'PASS' : 'FAIL',
    landed ? `Found: "${landed}"` : 'Client portal not found');

  // C-02: Dog visible (seeded: Buddy, Golden Retriever)
  const hasDog = await findFirst(page, ['Buddy', 'Golden Retriever', '🐕 My Dogs']);
  record('C-02', 'View dogs', hasDog ? 'PASS' : 'FAIL',
    hasDog ? `Found: "${hasDog}"` : 'Seeded dog Buddy not visible');

  // C-03: Request a walk
  try {
    const bookBtn = await findFirst(page, ['Book a Walk', '📅 Book a Walk'], 4000);
    if (!bookBtn) throw new Error('Book a Walk section not found');
    await page.locator(`text=${bookBtn}`).first().click();
    await page.waitForTimeout(1000);
    const dateF = page.locator('input[type="date"]').first();
    if (await dateF.isVisible({ timeout: 2000 })) await dateF.fill('2026-06-20');
    const timeF = page.locator('input[type="time"], input[placeholder*="time" i]').first();
    if (await timeF.isVisible({ timeout: 2000 })) await timeF.fill('14:00');
    await clickFirst(page, ['Send Request 🐾', 'Send Request'], 3000);
    await page.waitForTimeout(2000);
    const confirmed = await findFirst(page, ['Request Sent!', 'We will text you to confirm', 'Sending...']);
    record('C-03', 'Request a walk', confirmed ? 'PASS' : 'FAIL',
      confirmed ? `Found: "${confirmed}"` : 'No confirmation after submit');
  } catch (e) { record('C-03', 'Request a walk', 'FAIL', e.message); }

  // C-04: Walk status visible
  const hasStatus = await findFirst(page, ['🦮 My Walks', 'pending', 'Pending', 'confirmed', 'No walk requests yet']);
  record('C-04', 'Check booking status', hasStatus ? 'PASS' : 'FAIL',
    hasStatus ? `Found: "${hasStatus}"` : 'No walk status visible');

  // C-05: Completed walk
  const hasCompleted = await findFirst(page, ['Completed', 'completed', 'Walker note:', 'Great walk', '32 min']);
  record('C-05', 'View a completed walk', hasCompleted ? 'PASS' : 'FAIL',
    hasCompleted ? `Found: "${hasCompleted}"` : 'No completed walk visible');

  // C-06: Profile section
  const hasProfile = await findFirst(page, ['👤 My Profile', 'Save Profile', 'Service Address', 'Home Access Instructions']);
  record('C-06', 'Profile section visible', hasProfile ? 'PASS' : 'FAIL',
    hasProfile ? `Found: "${hasProfile}"` : 'Profile section not found');

  // C-07: Logout
  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('C-07', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen');
}

// ── Report ────────────────────────────────────────────────────────────────────
function printReport() {
  const pass  = results.filter(r => r.status === 'PASS').length;
  const fail  = results.filter(r => r.status === 'FAIL').length;
  const skip  = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  console.log('\n' + '═'.repeat(62));
  console.log('  FETCHUS UAT RESULTS');
  console.log('═'.repeat(62));
  console.log(`  Total: ${total}  |  ✅ Pass: ${pass}  |  ❌ Fail: ${fail}  |  ⚠️  Skip: ${skip}`);
  console.log('─'.repeat(62));
  for (const [label, prefix] of [['ADMIN', 'A'], ['WALKER', 'W'], ['CLIENT', 'C']]) {
    const group = results.filter(r => r.id.startsWith(prefix));
    if (!group.length) continue;
    const gPass = group.filter(r => r.status === 'PASS').length;
    console.log(`\n  ${label}  (${gPass}/${group.length} passed)`);
    for (const t of group) {
      const icon = t.status === 'PASS' ? '✅' : t.status === 'FAIL' ? '❌' : '⚠️ ';
      console.log(`    ${icon} [${t.status.padEnd(4)}] ${t.id} — ${t.title}`);
      if (t.note) console.log(`            ${t.note}`);
    }
  }
  console.log('\n' + '═'.repeat(62));
  return results.filter(r => r.status === 'FAIL').length;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  if (!SUPABASE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1); }
  if (!BB_API_KEY)   { console.error('Missing BROWSERBASE_API_KEY');  process.exit(1); }

  const bb = new Browserbase({ apiKey: BB_API_KEY });
  const roleTests = [
    { role: 'admin',  fn: runAdminTests },
    { role: 'walker', fn: runWalkerTests },
    { role: 'client', fn: runClientTests },
  ];

  for (const { role, fn } of roleTests) {
    console.log(`\n${'─'.repeat(50)}\nStarting ${role.toUpperCase()} session...`);
    let browser;
    try {
      const session = await bb.sessions.create({});
      browser = await chromium.connectOverCDP(session.connectUrl);
      const context = browser.contexts()[0] || await browser.newContext();
      const page = await context.newPage();
      const authSession = await getSession(USERS[role].email);
      await injectSession(page, authSession, role);
      await fn(page);
    } catch (e) {
      console.error(`  Fatal error in ${role}: ${e.message}`);
      const map = {
        A: [['A-01','Login'],['A-02','Add client'],['A-03','Add dog'],['A-04','Walk requests'],['A-05','Scheduled walks'],['A-06','Completed history'],['A-07','Notifications'],['A-08','Logout']],
        W: [['W-01','Login'],['W-02','Assigned walks'],['W-03','Start walk'],['W-04','Complete walk'],['W-06','Walk history'],['W-07','Logout']],
        C: [['C-01','Login'],['C-02','View dogs'],['C-03','Request walk'],['C-04','Booking status'],['C-05','Completed walk'],['C-06','Profile'],['C-07','Logout']],
      };
      for (const [id, title] of (map[role[0].toUpperCase()] || [])) {
        if (!results.find(r => r.id === id)) record(id, title, 'FAIL', `Session error: ${e.message}`);
      }
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  process.exit(printReport() > 0 ? 1 : 0);
})();
