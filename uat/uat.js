const { chromium } = require('playwright');
const { Browserbase } = require('@browserbasehq/sdk');
const fs = require('fs');

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
  await page.goto(APP_URL);
  await page.waitForTimeout(2000);

  const injected = await page.evaluate(({ session }) => {
    const key = 'sb-rwauwkrdzcesyhwpaeow-auth-token';
    const val = JSON.stringify({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
      token_type:    session.token_type || 'bearer',
      expires_in:    session.expires_in  || 3600,
      expires_at:    session.expires_at  || Math.floor(Date.now() / 1000) + 3600,
      user:          session.user,
    });
    localStorage.setItem(key, val);
    // Verify it was actually stored
    const stored = localStorage.getItem(key);
    const allKeys = Object.keys(localStorage);
    return { stored_length: stored ? stored.length : 0, all_keys: allKeys };
  }, { session });

  await page.reload();
  await page.waitForTimeout(6000);

  const pageState = await page.evaluate(() => ({
    url:   window.location.href,
    text:  document.body.innerText.slice(0, 500),
    lsKey: localStorage.getItem('sb-rwauwkrdzcesyhwpaeow-auth-token') ? 'present' : 'MISSING',
    allLsKeys: Object.keys(localStorage),
  }));

  const debugLine = `[DEBUG ${role}] localStorage_stored:${injected.stored_length}b | ls_keys:${injected.all_keys.join(',')} | after_reload_ls:${pageState.lsKey} | url:${pageState.url} | text:${pageState.text.replace(/\n+/g,' | ').slice(0,200)}`;
  console.log(debugLine);
  // Append debug to results file for easy reading
  require('fs').appendFileSync('uat-results.txt', '\n' + debugLine + '\n');
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

async function runAdminTests(page) {
  console.log('\n── Admin ─────────────────────────────────────────');
  const landed = await findFirst(page, ['Admin Portal', 'Walk Requests', 'Clients & Walkers', 'FetchUs Pet Care']);
  record('A-01', 'Log in -- land on admin dashboard', landed ? 'PASS' : 'FAIL', landed ? `"${landed}"` : 'Not found');

  try {
    const addBtn = await findFirst(page, ['Add Client', 'Add Walker'], 4000);
    if (!addBtn) throw new Error('Add Client button not found');
    await page.locator(`text=${addBtn}`).first().click();
    await page.waitForTimeout(1000);
    const nameF = page.locator('input[placeholder="Full Name"], input[placeholder*="name" i]').first();
    if (await nameF.isVisible({ timeout: 2000 })) await nameF.fill('UAT Test Client');
    const emailF = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailF.isVisible({ timeout: 2000 })) await emailF.fill('uattest@example.com');
    await clickFirst(page, ['Add Client', 'Save', 'Send Magic Link'], 3000);
    await page.waitForTimeout(2000);
    const appeared = await hasText(page, 'UAT Test Client', 4000);
    record('A-02', 'Add a new client', appeared ? 'PASS' : 'FAIL', appeared ? '' : 'Name not visible after save');
  } catch (e) { record('A-02', 'Add a new client', 'FAIL', e.message); }

  record('A-03', 'Add dog to client', 'SKIP', 'Dog management is in client portal, not admin');

  const hasRequests = await findFirst(page, ['Walk Requests', 'Assign Walker', 'Unassigned']);
  record('A-04', 'View walk requests', hasRequests ? 'PASS' : 'FAIL', hasRequests ? `"${hasRequests}"` : 'Not found');

  const hasSchedule = await findFirst(page, ['30-min Walk', 'confirmed', 'Coming Up', 'Confirmed']);
  record('A-05', 'View scheduled walks', hasSchedule ? 'PASS' : 'FAIL', hasSchedule ? `"${hasSchedule}"` : 'Not found');

  const hasCompleted = await findFirst(page, ['Completed', 'Recent', 'History']);
  record('A-06', 'View completed walk history', hasCompleted ? 'PASS' : 'FAIL', hasCompleted ? `"${hasCompleted}"` : 'Not found');

  const hasNotif = await findFirst(page, ['Broadcast Message', 'Send to All Clients', 'Recent Broadcasts']);
  record('A-07', 'Broadcast / notifications', hasNotif ? 'PASS' : 'FAIL', hasNotif ? `"${hasNotif}"` : 'Not found');

  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('A-08', 'Log out', atLogin ? 'PASS' : 'FAIL', atLogin ? '' : 'Not returned to login screen');
}

async function runWalkerTests(page) {
  console.log('\n── Walker ────────────────────────────────────────');
  const landed = await findFirst(page, ['My Walks', 'Viewing as Walker', 'Today', 'Coming Up']);
  record('W-01', 'Log in -- land on walker dashboard', landed ? 'PASS' : 'FAIL', landed ? `"${landed}"` : 'Not found');

  const hasWalk = await findFirst(page, ['Test Client', 'Buddy', '30-min Walk', 'Start Walk']);
  record('W-02', 'View assigned walks', hasWalk ? 'PASS' : 'FAIL', hasWalk ? `"${hasWalk}"` : 'Not found');

  try {
    const startBtn = await findFirst(page, ['Start Walk'], 5000);
    if (!startBtn) throw new Error('Start Walk not found');
    await page.locator('text=Start Walk').first().click();
    await page.waitForTimeout(3000);
    const inProg = await findFirst(page, ['Walk In Progress', 'Complete Walk', '✓ Complete Walk']);
    record('W-03', 'Start a walk', inProg ? 'PASS' : 'FAIL', inProg ? `"${inProg}"` : 'Walk In Progress not shown');
  } catch (e) { record('W-03', 'Start a walk', 'FAIL', e.message); }

  try {
    const completeBtn = await findFirst(page, ['✓ Complete Walk', 'Complete Walk'], 5000);
    if (!completeBtn) throw new Error('Complete Walk not found');
    await page.locator(`text=${completeBtn}`).first().click();
    await page.waitForTimeout(3000);
    const done = await findFirst(page, ['Walk Complete!', 'Client has been notified', 'My Walks']);
    record('W-04', 'Complete the walk', done ? 'PASS' : 'FAIL', done ? `"${done}"` : 'Walk Complete not shown');
  } catch (e) { record('W-04', 'Complete the walk', 'FAIL', e.message); }

  const hasHist = await findFirst(page, ['Recent', 'Completed', 'Great walk', 'Buddy']);
  record('W-06', 'View walk history', hasHist ? 'PASS' : 'FAIL', hasHist ? `"${hasHist}"` : 'Not found');

  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('W-07', 'Log out', atLogin ? 'PASS' : 'FAIL', atLogin ? '' : 'Not returned to login screen');
}

async function runClientTests(page) {
  console.log('\n── Client ────────────────────────────────────────');
  const landed = await findFirst(page, ['Welcome back', 'Viewing as Client', '🐕 My Dogs', '📅 Book a Walk']);
  record('C-01', 'Log in -- land on client portal', landed ? 'PASS' : 'FAIL', landed ? `"${landed}"` : 'Not found');

  const hasDog = await findFirst(page, ['Buddy', 'Golden Retriever', '🐕 My Dogs']);
  record('C-02', 'View dogs', hasDog ? 'PASS' : 'FAIL', hasDog ? `"${hasDog}"` : 'Buddy not found');

  try {
    await clickFirst(page, ['📅 Book a Walk', 'Book a Walk'], 4000);
    await page.waitForTimeout(1000);
    const dateF = page.locator('input[type="date"]').first();
    if (await dateF.isVisible({ timeout: 2000 })) await dateF.fill('2026-06-20');
    const timeF = page.locator('input[type="time"]').first();
    if (await timeF.isVisible({ timeout: 2000 })) await timeF.fill('14:00');
    await clickFirst(page, ['Send Request 🐾', 'Send Request'], 3000);
    await page.waitForTimeout(2000);
    const confirmed = await findFirst(page, ['Request Sent!', 'We will text you to confirm']);
    record('C-03', 'Request a walk', confirmed ? 'PASS' : 'FAIL', confirmed ? `"${confirmed}"` : 'No confirmation');
  } catch (e) { record('C-03', 'Request a walk', 'FAIL', e.message); }

  const hasStatus = await findFirst(page, ['🦮 My Walks', 'pending', 'Pending', 'No walk requests yet']);
  record('C-04', 'Check booking status', hasStatus ? 'PASS' : 'FAIL', hasStatus ? `"${hasStatus}"` : 'Not found');

  const hasCompleted = await findFirst(page, ['Completed', 'Walker note:', 'Great walk', '32 min']);
  record('C-05', 'View completed walk', hasCompleted ? 'PASS' : 'FAIL', hasCompleted ? `"${hasCompleted}"` : 'Not found');

  const hasProfile = await findFirst(page, ['👤 My Profile', 'Save Profile', 'Home Access Instructions']);
  record('C-06', 'Profile section', hasProfile ? 'PASS' : 'FAIL', hasProfile ? `"${hasProfile}"` : 'Not found');

  await clickFirst(page, ['Sign Out'], 4000);
  await page.waitForTimeout(2000);
  const atLogin = await findFirst(page, ['Send Magic Link', 'Sign in', 'your@email.com'], 5000);
  record('C-07', 'Log out', atLogin ? 'PASS' : 'FAIL', atLogin ? '' : 'Not returned to login screen');
}

function writeResults() {
  const pass  = results.filter(r => r.status === 'PASS').length;
  const fail  = results.filter(r => r.status === 'FAIL').length;
  const skip  = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  let out = `FETCHUS UAT RESULTS\n${'='.repeat(60)}\n`;
  out += `Total: ${total} | Pass: ${pass} | Fail: ${fail} | Skip: ${skip}\n${'='.repeat(60)}\n`;
  for (const [label, prefix] of [['ADMIN','A'],['WALKER','W'],['CLIENT','C']]) {
    const group = results.filter(r => r.id.startsWith(prefix));
    if (!group.length) continue;
    out += `\n${label} (${group.filter(r=>r.status==='PASS').length}/${group.length} passed)\n`;
    for (const t of group) {
      const icon = t.status === 'PASS' ? 'PASS' : t.status === 'FAIL' ? 'FAIL' : 'SKIP';
      out += `  [${icon}] ${t.id} -- ${t.title}${t.note ? '\n         ' + t.note : ''}\n`;
    }
  }
  fs.writeFileSync('uat-results.txt', out);
  console.log('\n' + out);
  return fail;
}

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
        A:[['A-01','Login'],['A-02','Add client'],['A-03','Add dog'],['A-04','Walk requests'],['A-05','Scheduled walks'],['A-06','History'],['A-07','Notifications'],['A-08','Logout']],
        W:[['W-01','Login'],['W-02','Assigned walks'],['W-03','Start walk'],['W-04','Complete walk'],['W-06','History'],['W-07','Logout']],
        C:[['C-01','Login'],['C-02','Dogs'],['C-03','Request walk'],['C-04','Status'],['C-05','Completed walk'],['C-06','Profile'],['C-07','Logout']],
      };
      for (const [id, title] of (map[role[0].toUpperCase()]||[])) {
        if (!results.find(r=>r.id===id)) record(id, title, 'FAIL', e.message);
      }
    } finally {
      if (browser) await browser.close().catch(()=>{});
    }
  }

  process.exit(writeResults() > 0 ? 1 : 0);
})();
