// Reads an "[Across Country score]" issue from the workflow event and adds the run to
// across-country-australia-leaderboard/scores.json. Writes the reply for the issue to
// $RESULT_FILE as {ok, message}. Everything in the issue is player input, so it is only
// ever parsed here, never passed to a shell.
import fs from 'node:fs';

const BOARD = 'across-country-australia-leaderboard/scores.json';
const ROUTE_KM = 8526;                       // Dampier to Borroloola, TOTAL_DISTANCE in the game
const MIN_DAYS = Math.ceil(ROUTE_KM / (110 * 13)); // 110 km/h, 6am to 7pm, every day
const VEHICLES = { hatchback: 'Hatchback', suv: 'SUV', van: 'Van', bus: 'Bus' };
const KEYS = ['v', 'run', 'name', 'company', 'vehicle', 'days', 'km', 'streak', 'items', 'tows', 'naps'];

// Same hash as lbHash() in the game. Keep the two in step.
function lbHash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

const clean = (s, max) => String(s).replace(/[\u0000-\u001f\u007f<>`*_\[\]|\\]/g, '').trim().slice(0, max);
const isCount = (n, max) => Number.isInteger(n) && n >= 0 && n <= max;

function parse(issue) {
  const m = /```json\s*([\s\S]*?)```/.exec(issue.body || '');
  if (!m) return { error: "I couldn't find the run block. Submit again from the arrival screen in the game." };
  let run;
  try { run = JSON.parse(m[1]); } catch { return { error: "The run block isn't valid. Submit again from the arrival screen without editing it." }; }
  if (!run || typeof run !== 'object' || run.v !== 1) return { error: 'This run is from an unknown game version.' };
  if (typeof run.run !== 'string' || !/^[a-z0-9]{6,32}$/.test(run.run)) return { error: 'The run id is missing.' };
  if (typeof run.name !== 'string' || typeof run.company !== 'string') return { error: 'The driver name is missing.' };
  if (run.check !== lbHash('acau|' + KEYS.map(k => run[k]).join('|'))) {
    return { error: "The run block doesn't match its check code, so it looks edited. Submit again from the game." };
  }
  if (!VEHICLES[run.vehicle]) return { error: 'Unknown rig.' };
  if (run.km !== ROUTE_KM) return { error: 'That route length doesn\'t match the Classic delivery.' };
  if (!Number.isInteger(run.days) || run.days < MIN_DAYS || run.days > 5000) {
    return { error: `${run.days} days isn't possible on this route (the fastest is ${MIN_DAYS}).` };
  }
  for (const k of ['streak', 'items', 'tows', 'naps']) {
    if (!isCount(run[k], 100000)) return { error: `The ${k} number isn't valid.` };
  }
  if (run.streak > run.days) return { error: "The sleep streak can't be longer than the trip." };
  return { run };
}

function main() {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const issue = event.issue;
  const login = issue.user.login;
  const out = r => fs.writeFileSync(process.env.RESULT_FILE, JSON.stringify(r));

  const { run, error } = parse(issue);
  if (error) return out({ ok: false, message: error });

  const board = fs.existsSync(BOARD) ? JSON.parse(fs.readFileSync(BOARD, 'utf8')) : { entries: [] };
  if (board.entries.some(e => e.run === run.run && e.login !== login)) {
    return out({ ok: false, message: 'This run is already on the board under another account.' });
  }

  const entry = {
    login,
    name: clean(run.name, 24) || 'Driver',
    company: clean(run.company, 40),
    vehicle: run.vehicle,
    days: run.days,
    streak: run.streak,
    items: run.items,
    tows: run.tows,
    naps: run.naps,
    run: run.run,
    issue: issue.number,
    date: issue.created_at.slice(0, 10),
  };

  // One entry per GitHub account: keep its best (fewest days, earliest wins a tie).
  const prev = board.entries.find(e => e.login === login);
  let message;
  if (prev && prev.days <= entry.days) {
    return out({ ok: true, message: `Thanks! Your best of **${prev.days} days** is still on the board, so this run wasn't added.` });
  }
  board.entries = board.entries.filter(e => e.login !== login);
  board.entries.push(entry);
  board.entries.sort((a, b) => a.days - b.days || a.issue - b.issue);
  board.updated = new Date().toISOString();
  fs.writeFileSync(BOARD, JSON.stringify(board, null, 1) + '\n');

  const rank = board.entries.indexOf(entry) + 1;
  message = prev
    ? `New personal best! **${entry.days} days** (was ${prev.days}). You're **#${rank}** on the board.`
    : `Added! **${entry.days} days** puts you at **#${rank}** on the board.`;
  out({ ok: true, message: message + '\n\nhttps://kain-mercer.github.io/across-country-australia-leaderboard/' });
}

main();
