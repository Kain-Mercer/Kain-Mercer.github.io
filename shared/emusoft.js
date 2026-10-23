/* EmuSoft back room: one small save shared by every game on this site.
   A game calls EmuSoft.unlock('id') when the player reaches a milestone.
   The front page reads the same save to let the player decorate the room.
   Every call is safe: if storage is blocked, nothing happens and the game carries on. */
(function () {
  if (window.EmuSoft) return;
  var KEY = 'emusoft.room';

  var GAMES = {
    up:   {name: 'Underpass',      color: '#ff4d6d'},
    up2:  {name: 'Underpass 2',    color: '#9b8cff'},
    aca:  {name: 'Across Country', color: '#e8a33d'},
    cos:  {name: 'Across Cosmos',  color: '#36f1cd'},
    room: {name: 'The room',       color: '#c9ccd4'}
  };

  // hint: shown on locked items in the room's tray
  var ITEMS = {
    'up.mara':      {game: 'up',   name: 'I ❤ Mara poster',          hint: 'Find Mara'},
    'up.shard':     {game: 'up',   name: 'Helios shard',                  hint: 'Get the shard out of Sector 9'},
    'up.blade':     {game: 'up',   name: "Nakamura's blade",              hint: 'Win on the bridge'},
    'up2.neon':     {game: 'up2',  name: 'UP2 neon sign',                 hint: 'Start a run'},
    'up2.helmet':   {game: 'up2',  name: 'Breacher helmet',               hint: 'Meet Mara again'},
    'up2.marquee':  {game: 'up2',  name: 'CONTINUE? light box',           hint: 'Finish the game'},
    'aca.sign':     {game: 'aca',  name: 'Kangaroo road sign',            hint: 'Reach your first stop'},
    'aca.pet':      {game: 'aca',  name: 'Pet bed',                       hint: 'Pick up a friend on the road'},
    'aca.rig':      {game: 'aca',  name: 'Rig model',                     hint: 'Finish a delivery'},
    'cos.cat':      {game: 'cos',  name: 'Commander plush',               hint: 'Pet the ship cat'},
    'cos.chart':    {game: 'cos',  name: 'Alpha Centauri star chart',     hint: 'Reach your first waypoint'},
    'cos.newdawn':  {game: 'cos',  name: 'New Dawn model',                hint: 'Reach Alpha Centauri'},
    'room.plaque':  {game: 'room', name: 'Hi-score plaque',               hint: 'Find the room'},
    'room.lava':    {game: 'room', name: 'Lava lamp',                     hint: 'Fill 5 spots'},
    'room.minicab': {game: 'room', name: 'Mini cabinet',                  hint: 'Earn an item in all four games'}
  };

  function blank() { return {v: 1, items: {}, variant: {}, layout: {}, seen: {}, found: false}; }

  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!d || typeof d !== 'object') d = blank();
    var b = blank();
    for (var k in b) if (!(k in d) || typeof d[k] !== typeof b[k]) d[k] = b[k];
    return d;
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
  }

  // ---- toast: a small pixel card that slides in, in whatever page it is called from ----
  var queue = [], showing = false;
  function toast(title, line, color) {
    queue.push([title, line, color || '#6ef0ff']);
    if (!showing) next();
  }
  function next() {
    var t = queue.shift();
    if (!t || !document.body) { showing = false; return; }
    showing = true;
    var el = document.createElement('div');
    el.setAttribute('role', 'status');
    // On phones the card slides up from the bottom, so it doesn't cover the top of pop-ups.
    var low = window.innerWidth < 600, hide = low ? 'translate(-50%,140%)' : 'translate(-50%,-140%)';
    el.style.cssText = 'position:fixed;left:50%;' + (low ? 'bottom:14px;' : 'top:14px;') + 'z-index:2147483647;transform:' + hide + ';' +
      'transition:transform .35s cubic-bezier(.2,.8,.3,1.2);pointer-events:none;max-width:calc(100vw - 24px);' +
      'background:#06080d;color:#e8e6df;border:2px solid ' + t[2] + ';box-shadow:3px 3px 0 #000,0 0 16px ' + t[2] + '66;' +
      'padding:9px 12px 10px;font:10px/1.6 "Press Start 2P",ui-monospace,monospace;letter-spacing:.5px;text-align:center';
    var a = document.createElement('div');
    a.style.cssText = 'color:' + t[2] + ';font-size:9px;margin-bottom:5px';
    a.textContent = t[0];
    var b = document.createElement('div');
    b.textContent = t[1];
    el.appendChild(a); el.appendChild(b);
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transform = 'translate(-50%,0)'; }); });
    setTimeout(function () { el.style.transform = hide; }, 3200);
    setTimeout(function () { el.remove(); next(); }, 3700);
  }

  // Record an item. Returns true the first time. opts.variant (e.g. 'cat') picks a look;
  // opts.quiet skips the toast.
  function unlock(id, opts) {
    opts = opts || {};
    var it = ITEMS[id];
    if (!it) return false;
    var d = load();
    if (opts.variant && !d.variant[id]) d.variant[id] = String(opts.variant);
    if (d.items[id]) { save(d); return false; }
    d.items[id] = Date.now();
    if (!save(d)) return false;
    if (!opts.quiet) toast('NEW ITEM FOR THE BACK ROOM', it.name, GAMES[it.game].color);
    return true;
  }

  function has(id) { return !!load().items[id]; }
  function owned() { return Object.keys(load().items).filter(function (k) { return ITEMS[k]; }); }

  window.EmuSoft = {
    KEY: KEY, GAMES: GAMES, ITEMS: ITEMS,
    load: load, save: save, unlock: unlock, has: has, owned: owned, toast: toast
  };
})();
