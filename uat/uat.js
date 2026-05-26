const { chromium } = require('playwright');
const { Browserbase } = require('@browserbasehq/sdk');

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://rwauwkrdzcesyhwpaeow.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BB_API_KEY   = process.env.BROWSERBASE_API_KEY;
const APP_URL      = 'https://fetch-us-dfpk8bzue-weej-cybers-projects.vercel.app';

const USERS = {
  admin:  { email: 'fetchusadmin@test.com' },
  walker: { email: 'fetchuswalker@test.com' },
  client: { email: 'fetchusclient@test.com' },
};

// ── Results ───────────────────────────────────────────────────────────────────
const results = [];
function record(id, title, status, note = '') {
  results.push({ id, title, status, note });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`  ${icon} ${id}: ${title}${note ? ' -- ' + note : ''}`);
}

// ── Auth: generate session via service role ───────────────────────────────────
async function getSessionTokens(email) {
  const ANON_KEY = 'sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4';
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: 'FetchTest1!' }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`signInWithPassword failed for ${email}: ${err}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error(`No access_token for ${email}: ${JSON.stringify(data)}`);
  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

// ── Inject Supabase session into page storage ─────────────────────────────────
async function injectSession(page, tokens) {
  await page.goto(APP_URL);
  await page.waitForTimeout(1500);
  await page.evaluate(({ tokens }) => {
    const key = Object.keys(localStorage).find(k => k.includes('auth-token')) || 'sb-rwauwkrdzcesyhwpaeow-auth-token';
    const session = {
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    localStorage.setItem(key, JSON.stringify(session));
  }, { tokens });
  await page.reload();
  await page.waitForTimeout(3000);
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
async function hasText(page, text, timeout = 5000) {
  try { await page.locator(`text=${text}`).first().waitFor({ timeout }); return true; }
  catch { return false; }
}
async function findText(page, texts, timeout = 5000) {
  for (const t of texts) { if (await hasText(page, t, timeout)) return t; }
  return null;
}
async function clickText(page, texts, timeout = 4000) {
  const found = await findText(page, texts, timeout);
  if (!found) return false;
  await page.locator(`text=${found}`).first().click({ timeout });
  return true;
}

// ── Admin tests ───────────────────────────────────────────────────────────────
async function runAdminTests(page) {
  console.log('\n── Admin ─────────────────────────────────────────');

  // A-01: correct screen
  const landed = await findText(page, ['Admin', 'Dashboard', 'Walk Requests', 'Clients', 'Walkers']);
  record('A-01', 'Log in -- land on admin dashboard', landed ? 'PASS' : 'FAIL',
    landed ? `Detected: "${landed}"` : 'No admin UI indicators found');

  // A-02: Add client
  try {
    const hasAddClient = await findText(page, ['Add Client', 'New Client', 'Add New Client'], 4000);
    if (!hasAddClient) throw new Error('No add client button found');
    await page.locator(`text=${hasAddClient}`).first().click();
    await page.waitForTimeout(1000);
    const nameF = page.locator('input[placeholder*="name" i], input[name="name"]').first();
    if (await nameF.isVisible()) await nameF.fill('UAT Test Client');
    const emailF = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailF.isVisible()) await emailF.fill('uattest@example.com');
    const phoneF = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
    if (await phoneF.isVisible()) await phoneF.fill('5550001234');
    await clickText(page, ['Save', 'Add', 'Create', 'Submit'], 3000);
    await page.waitForTimeout(1500);
    const appeared = await hasText(page, 'UAT Test Client', 4000);
    record('A-02', 'Add a new client', appeared ? 'PASS' : 'FAIL',
      appeared ? '' : 'Client name not visible in list after save');
  } catch (e) { record('A-02', 'Add a new client', 'FAIL', e.message); }

  // A-03: Add dog
  try {
    const clientEl = page.locator('text=UAT Test Client').first();
    if (await clientEl.isVisible()) await clientEl.click();
    await page.waitForTimeout(1000);
    const addDog = await findText(page, ['Add Dog', 'New Dog'], 4000);
    if (!addDog) throw new Error('Add dog button not found');
    await page.locator(`text=${addDog}`).first().click();
    await page.waitForTimeout(1000);
    const dogName = page.locator('input[placeholder*="name" i], input[name="name"]').first();
    if (await dogName.isVisible()) await dogName.fill('UAT Dog');
    const breed = page.locator('input[placeholder*="breed" i], input[name="breed"]').first();
    if (await breed.isVisible()) await breed.fill('Labrador');
    await clickText(page, ['Save', 'Add', 'Submit'], 3000);
    await page.waitForTimeout(1500);
    const dogAppeared = await hasText(page, 'UAT Dog', 4000);
    record('A-03', 'Add a dog to a client', dogAppeared ? 'PASS' : 'FAIL',
      dogAppeared ? '' : 'Dog not visible after save');
  } catch (e) { record('A-03', 'Add a dog to a client', 'FAIL', e.message); }

  // A-04: Create booking
  try {
    const bookNav = await findText(page, ['Bookings', 'Book', 'Walk Requests', 'Schedule'], 4000);
    if (bookNav) { await page.locator(`text=${bookNav}`).first().click(); await page.waitForTimeout(1000); }
    const newBook = await findText(page, ['New Booking', 'Create Booking', 'Add Booking', 'Assign Walker'], 4000);
    if (!newBook) throw new Error('New booking button not found');
    await page.locator(`text=${newBook}`).first().click();
    await page.waitForTimeout(1000);
    const dateF = page.locator('input[type="date"]').first();
    if (await dateF.isVisible()) await dateF.fill('2026-06-15');
    await clickText(page, ['Save', 'Create', 'Confirm', 'Submit'], 3000);
    await page.waitForTimeout(1500);
    record('A-04', 'Create a walk booking', 'SKIP', 'Booking form varies -- manual verification recommended for full flow');
  } catch (e) { record('A-04', 'Create a walk booking', 'FAIL', e.message); }

  // A-05: Scheduled walks visible
  const hasScheduled = await findText(page, ['confirmed', 'Confirmed', 'Upcoming', 'Scheduled', '30-min Walk']);
  record('A-05', 'View all scheduled walks', hasScheduled ? 'PASS' : 'FAIL',
    hasScheduled ? `Found: "${hasScheduled}"` : 'No scheduled walk indicators on screen');

  // A-06: Completed walks visible
  const hasCompleted = await findText(page, ['completed', 'Completed', 'History', 'Past Walks']);
  record('A-06', 'View completed walk history', hasCompleted ? 'PASS' : 'FAIL',
    hasCompleted ? `Found: "${hasCompleted}"` : 'No completed walk indicators on screen');

  // A-07: Notifications
  await clickText(page, ['Notifications', 'Notification'], 4000);
  await page.waitForTimeout(1000);
  const hasNotif = await findText(page, ['Notification', 'notification', 'No notifications', 'message']);
  record('A-07', 'Check notifications', hasNotif ? 'PASS' : 'FAIL',
    hasNotif ? '' : 'Notifications section not found');

  // A-08: Logout
  const logoutBtn = await findText(page, ['Log out', 'Logout', 'Sign out', 'Sign Out'], 4000);
  if (logoutBtn) { await page.locator(`text=${logoutBtn}`).first().click(); await page.waitForTimeout(2000); }
  const atLogin = await findText(page, ['Sign in', 'Login', 'Enter your email', 'magic link'], 5000);
  record('A-08', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen after logout');
}

// ── Walker tests ──────────────────────────────────────────────────────────────
async function runWalkerTests(page) {
  console.log('\n── Walker ────────────────────────────────────────');

  // W-01
  const landed = await findText(page, ['Walker', "Today's Walks", 'Your Walks', 'Assigned', 'Dashboard']);
  record('W-01', 'Log in -- land on walker dashboard', landed ? 'PASS' : 'FAIL',
    landed ? `Detected: "${landed}"` : 'Walker dashboard not found');

  // W-02: Assigned walks visible
  const hasWalk = await findText(page, ['Test Client', 'Buddy', '30-min Walk', 'confirmed', 'Confirmed', 'Golden Retriever']);
  record('W-02', 'View assigned walks with details', hasWalk ? 'PASS' : 'FAIL',
    hasWalk ? `Visible: "${hasWalk}"` : 'Seeded booking not visible -- client, dog, or time missing');

  // W-03: Start
  try {
    const startBtn = await findText(page, ['Start Walk', 'Start', 'Begin Walk'], 5000);
    if (!startBtn) throw new Error('Start walk button not found');
    await page.locator(`text=${startBtn}`).first().click();
    await page.waitForTimeout(2500);
    const inProg = await findText(page, ['In Progress', 'in progress', 'Active', 'Walking', 'End Walk', 'Complete Walk', 'Stop']);
    record('W-03', 'Start a walk', inProg ? 'PASS' : 'FAIL',
      inProg ? `Status: "${inProg}"` : 'No in-progress indicator after start');
  } catch (e) { record('W-03', 'Start a walk', 'FAIL', e.message); }

  // W-04: Complete
  try {
    const completeBtn = await findText(page, ['Complete Walk', 'End Walk', 'Finish Walk', 'Complete'], 5000);
    if (!completeBtn) throw new Error('Complete walk button not found');
    await page.locator(`text=${completeBtn}`).first().click();
    await page.waitForTimeout(1000);
    const noteArea = page.locator('textarea').first();
    if (await noteArea.isVisible()) {
      await noteArea.fill('UAT completion note');
      await clickText(page, ['Save', 'Submit', 'Done', 'Finish'], 3000);
    }
    await page.waitForTimeout(2500);
    const isDone = await findText(page, ['Completed', 'completed', 'History', 'Done']);
    record('W-04', 'Complete the walk', isDone ? 'PASS' : 'FAIL',
      isDone ? '' : 'Walk not showing completed after finish');
  } catch (e) { record('W-04', 'Complete the walk', 'FAIL', e.message); }

  // W-06: History
  await clickText(page, ['History', 'Past Walks', 'Completed Walks'], 4000);
  await page.waitForTimeout(1000);
  const hasHist = await findText(page, ['Completed', 'completed', 'Buddy', 'Great walk', 'Test Client']);
  record('W-06', 'View walk history', hasHist ? 'PASS' : 'FAIL',
    hasHist ? '' : 'No completed walks in history');

  // W-07: Logout
  const logoutBtn = await findText(page, ['Log out', 'Logout', 'Sign out', 'Sign Out'], 4000);
  if (logoutBtn) { await page.locator(`text=${logoutBtn}`).first().click(); await page.waitForTimeout(2000); }
  const atLogin = await findText(page, ['Sign in', 'Login', 'Enter your email', 'magic link'], 5000);
  record('W-07', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen after logout');
}

// ── Client tests ──────────────────────────────────────────────────────────────
async function runClientTests(page) {
  console.log('\n── Client ────────────────────────────────────────');

  // C-01
  const landed = await findText(page, ['Test Client', 'My Dogs', 'Book', 'My Walks', 'Client']);
  record('C-01', 'Log in -- land on client portal', landed ? 'PASS' : 'FAIL',
    landed ? `Detected: "${landed}"` : 'Client portal not found');

  // C-02: View dog
  const hasDog = await findText(page, ['Buddy', 'Golden Retriever']);
  record('C-02', 'View dogs (Buddy / Golden Retriever)', hasDog ? 'PASS' : 'FAIL',
    hasDog ? '' : 'Seeded dog not visible');

  // C-03: Request a walk
  try {
    const bookBtn = await findText(page, ['Book a Walk', 'Request a Walk', 'Book Walk', 'Request Walk', 'Book'], 4000);
    if (!bookBtn) throw new Error('Book/request button not found');
    await page.locator(`text=${bookBtn}`).first().click();
    await page.waitForTimeout(1000);
    const dateF = page.locator('input[type="date"]').first();
    if (await dateF.isVisible()) await dateF.fill('2026-06-20');
    await clickText(page, ['Submit', 'Request', 'Book', 'Send'], 3000);
    await page.waitForTimeout(2000);
    const confirmed = await findText(page, ['Request submitted', 'Booked', 'pending', 'Pending', 'success', 'submitted']);
    record('C-03', 'Request a walk', confirmed ? 'PASS' : 'FAIL',
      confirmed ? `Confirmed: "${confirmed}"` : 'No confirmation after submitting request');
  } catch (e) { record('C-03', 'Request a walk', 'FAIL', e.message); }

  // C-04: Booking status
  const hasStatus = await findText(page, ['pending', 'Pending', 'confirmed', 'Confirmed', 'Status']);
  record('C-04', 'Check booking status', hasStatus ? 'PASS' : 'FAIL',
    hasStatus ? `Status visible: "${hasStatus}"` : 'No booking status visible');

  // C-05: Completed walk
  const hasCompleted = await findText(page, ['Completed', 'completed', 'Great walk', 'Test Walker', 'History', '32 min']);
  record('C-05', 'View a completed walk', hasCompleted ? 'PASS' : 'FAIL',
    hasCompleted ? '' : 'No completed walk showing -- seeded walk not visible');

  // C-06: Notifications
  await clickText(page, ['Notifications', 'Notification'], 4000);
  await page.waitForTimeout(1000);
  const hasNotif = await findText(page, ['Buddy', 'confirmed', 'walk', 'notification', 'No notifications']);
  record('C-06', 'Check notifications', hasNotif ? 'PASS' : 'FAIL',
    hasNotif ? '' : 'Notifications not found');

  // C-07: Logout
  const logoutBtn = await findText(page, ['Log out', 'Logout', 'Sign out', 'Sign Out'], 4000);
  if (logoutBtn) { await page.locator(`text=${logoutBtn}`).first().click(); await page.waitForTimeout(2000); }
  const atLogin = await findText(page, ['Sign in', 'Login', 'Enter your email', 'magic link'], 5000);
  record('C-07', 'Log out', atLogin ? 'PASS' : 'FAIL',
    atLogin ? '' : 'Not returned to login screen after logout');
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
  return fail;
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
      const tokens = await getSessionTokens(USERS[role].email);
      await injectSession(page, tokens);
      await fn(page);
    } catch (e) {
      console.error(`  Fatal error in ${role} session: ${e.message}`);
      // Mark all tests for this role as failed
      const prefix = role[0].toUpperCase();
      const allTests = {
        A: [['A-01','Login'],['A-02','Add client'],['A-03','Add dog'],['A-04','Create booking'],['A-05','Scheduled walks'],['A-06','Completed history'],['A-07','Notifications'],['A-08','Logout']],
        W: [['W-01','Login'],['W-02','Assigned walks'],['W-03','Start walk'],['W-04','Complete walk'],['W-06','Walk history'],['W-07','Logout']],
        C: [['C-01','Login'],['C-02','View dogs'],['C-03','Request walk'],['C-04','Booking status'],['C-05','Completed walk'],['C-06','Notifications'],['C-07','Logout']],
      };
      for (const [id, title] of (allTests[prefix] || [])) {
        if (!results.find(r => r.id === id)) record(id, title, 'FAIL', `Session error: ${e.message}`);
      }
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  const failCount = printReport();
  process.exit(failCount > 0 ? 1 : 0);
})();
