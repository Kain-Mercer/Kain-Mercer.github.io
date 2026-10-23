/* Back room decorations: the spots you can fill, and every item's pixel art.
   All coordinates are art pixels in the 384x216 room. Items are drawn in code
   so they can be redrawn and animated easily. */
(function () {
  // ---- the spots ----
  // kind: wall (centre x,y), hang (centre x,y, string from the ceiling at top),
  // top (sits on a surface: centre x, bottom y), floor (same as top).
  // w,h: the biggest item that fits. shade: how dark that corner of the room is.
  var SLOTS = [
    {id: 'wall-cab-left',  kind: 'wall', x: 141, y: 85,  w: 30, h: 24, shade: .22, label: 'wall left of the cabinet'},
    {id: 'wall-cab-top',   kind: 'wall', x: 192, y: 34,  w: 44, h: 16, shade: .2,  label: 'wall above the cabinet'},
    {id: 'wall-right',     kind: 'wall', x: 306, y: 64,  w: 20, h: 34, shade: .3,  label: 'wall by the cobweb'},
    {id: 'wall-fusebox',   kind: 'wall', x: 243, y: 90,  w: 34, h: 26, shade: .25, label: 'wall above the boombox'},
    {id: 'wall-left',      kind: 'wall', x: 80,  y: 62,  w: 16, h: 36, shade: .35, label: 'wall by the curtain'},
    {id: 'hang-right',     kind: 'hang', x: 272, y: 29,  w: 26, h: 12, top: 15, shade: .3, label: 'ceiling, right'},
    {id: 'hang-left',      kind: 'hang', x: 110, y: 30,  w: 26, h: 12, top: 15, shade: .3, label: 'ceiling, left'},
    {id: 'top-whitebox',   kind: 'top',  x: 293, y: 136, w: 22, h: 20, shade: .2,  label: 'on the white box'},
    {id: 'top-monitor',    kind: 'top',  x: 137, y: 112, w: 26, h: 16, shade: .2,  label: 'on the old monitor'},
    {id: 'top-table',      kind: 'top',  x: 128, y: 181, w: 28, h: 18, shade: .05, label: 'on the table'},
    {id: 'floor-right',    kind: 'floor', x: 247, y: 196, w: 28, h: 30, shade: .3, label: 'floor by the TV'},
    {id: 'floor-corner',   kind: 'floor', x: 309, y: 194, w: 24, h: 34, shade: .35, label: 'floor in the corner'},
    {id: 'floor-cab',      kind: 'floor', x: 217, y: 176, w: 20, h: 30, shade: .3, label: 'floor beside the cabinet'}
  ];

  // ---- drawing helpers ----
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  // rows of characters; '.' or ' ' is see-through
  function map(c, ox, oy, rows, pal) {
    for (var j = 0; j < rows.length; j++)
      for (var i = 0; i < rows[j].length; i++) {
        var ch = rows[j][i];
        if (ch !== '.' && ch !== ' ' && pal[ch]) rect(c, ox + i, oy + j, 1, 1, pal[ch]);
      }
  }
  // 3x5 pixel font
  var FONT = {
    A: '010101111101101', C: '011100100100011', E: '111100110100111', I: '111010010010111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', R: '110101110101101',
    T: '111010010010010', U: '101101101101111', '?': '110001010000010', '.': '000000000000010',
    '0': '111101101101111', '3': '111001011001111', '4': '101101111001001', '7': '111001010010010',
    '9': '111101111001111', ' ': '000000000000000'
  };
  function text(c, s, x, y, col) {
    c.fillStyle = col;
    for (var i = 0; i < s.length; i++) {
      var b = FONT[s[i]] || FONT[' '];
      var w = s[i] === '.' ? 1 : 3, sx = s[i] === '.' ? 1 : 0;
      for (var j = 0; j < 15; j++) if (b[j] === '1' && (j % 3) >= sx && (j % 3) < sx + w) c.fillRect(x + (j % 3) - sx, y + (j / 3 | 0), 1, 1);
      x += w + 1;
    }
  }
  function blink(t, period, on) { return (t % period) < on; }

  // ---- the items ----
  // draw(c, t, v): the item itself, darkened by the room's light afterwards.
  // emit(c, t, v): parts that glow (neon, screens), drawn after the shading.
  // glow: [x, y, radius, rgb] soft light around the item.
  var ITEMS = {};

  ITEMS['up.mara'] = {kind: 'wall', w: 18, h: 24,
    draw: function (c) {
      rect(c, 1, 1, 17, 23, 'rgba(0,0,0,.45)');               // shadow on the wall
      rect(c, 0, 0, 17, 23, '#d9d2c3');
      rect(c, 0, 22, 17, 1, '#b5ad9c'); rect(c, 16, 0, 1, 23, '#c4bcab');
      rect(c, 0, 0, 3, 2, 'rgba(232,222,160,.85)'); rect(c, 14, 0, 3, 2, 'rgba(232,222,160,.85)');
      map(c, 3, 4, ['kkk', '.k.', '.k.', '.k.', '.k.', 'kkk'], {k: '#17171c'});
      map(c, 8, 4, ['.rr.rr.', 'rhrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], {r: '#d8263a', h: '#ff8a96'});
      text(c, 'MARA', 1, 13, '#17171c');
      rect(c, 3, 19, 11, 1, '#d8263a');
    }};

  ITEMS['up.shard'] = {kind: 'top', w: 11, h: 16, glow: [5, 6, 13, '255,77,109'],
    draw: function (c) {
      map(c, 0, 0, [
        '....ggg....', '...g...g...', '..g.....g..', '..g.....g..', '.g.......g.', '.g.......g.',
        '.g.......g.', '.g.......g.', '.g.......g.', '.g.......g.', '.g.......g.', '.g.......g.',
        'ddddddddddd', 'dmmmmmmmmmd', 'dmmmmmmmmmd', '.ddddddddd.'], {g: 'rgba(170,215,230,.55)', d: '#23262e', m: '#4a4f5c'});
      rect(c, 2, 2, 1, 4, 'rgba(255,255,255,.35)');
    },
    emit: function (c, t) {
      var b = Math.sin(t / 500) > 0 ? 0 : 1;
      map(c, 3, 2 + b, ['..R..', '.RSR.', '.RSR.', 'RRSRR', '.RSR.', '.RSR.', '..R..'], {R: '#ff4d6d', S: '#ffd0d8'});
      rect(c, 3, 12, 5, 1, 'rgba(255,77,109,.5)');
    }};

  ITEMS['up.blade'] = {kind: 'wall', w: 32, h: 9,
    draw: function (c) {
      rect(c, 7, 6, 2, 3, '#2e3138'); rect(c, 25, 6, 2, 3, '#2e3138');
      rect(c, 7, 6, 2, 1, '#555a66'); rect(c, 25, 6, 2, 1, '#555a66');
      rect(c, 0, 3, 2, 1, '#e4e8ee'); rect(c, 1, 4, 21, 1, '#d0d5dd'); rect(c, 3, 5, 19, 1, '#7d828e');
      rect(c, 22, 2, 2, 6, '#b8923e'); rect(c, 22, 2, 1, 6, '#e0c070');
      for (var x = 24; x < 32; x++) { rect(c, x, 4, 1, 2, '#2a1a1e'); if (x % 2) rect(c, x, 4 + (x % 4 === 1 ? 0 : 1), 1, 1, '#9a2a3a'); }
    },
    emit: function (c, t) {
      var a = .45 + .3 * Math.sin(t / 700);
      rect(c, 2, 3, 19, 1, 'rgba(255,77,109,' + a.toFixed(2) + ')');
    }};

  ITEMS['up2.neon'] = {kind: 'wall', w: 23, h: 13, glow: [11, 6, 18, '155,140,255'],
    draw: function (c) {
      rect(c, 0, 0, 23, 13, '#1b1528'); rect(c, 0, 0, 23, 1, '#3a2f5c'); rect(c, 0, 12, 23, 1, '#120e1c');
      rect(c, 1, 1, 1, 1, '#6a6a78'); rect(c, 21, 1, 1, 1, '#6a6a78'); rect(c, 1, 11, 1, 1, '#6a6a78'); rect(c, 21, 11, 1, 1, '#6a6a78');
    },
    emit: function (c, t) {
      var on = '#e2dcff', off = '#3d335e';
      var dead = (t % 9000) > 8400 && blink(t, 160, 80);         // the 2 buzzes now and then
      [[2, 2, 1, 7], [2, 8, 4, 1], [5, 2, 1, 7], [8, 2, 1, 7], [8, 2, 4, 1], [11, 2, 1, 4], [8, 5, 4, 1]]
        .forEach(function (r) { rect(c, r[0] + 1, r[1] + 1, r[2], r[3], on); });
      [[14, 2, 5, 1], [18, 2, 1, 4], [14, 5, 5, 1], [14, 5, 1, 4], [14, 8, 5, 1]]
        .forEach(function (r) { rect(c, r[0] + 1, r[1] + 1, r[2], r[3], dead ? off : on); });
    }};

  ITEMS['up2.helmet'] = {kind: 'top', w: 14, h: 11, glow: [7, 6, 9, '155,140,255'],
    draw: function (c) {
      map(c, 0, 0, [
        '....hhhhhh....', '..hhllllllhh..', '.hllllllllllh.', '.hlllllllllllh', 'hhhhhhhhhhhhhh',
        'h............h', 'h............h', 'hh..........hh', '.hhhhhhhhhhhh.', '.hmhhhhhhhhmh.', '.hh........hh.'],
        {h: '#2a2e36', l: '#3f4552', m: '#6e7482'});
    },
    emit: function (c, t) {
      rect(c, 1, 5, 12, 2, '#9b8cff'); rect(c, 2, 5, 9, 1, '#ddd6ff');
      var x = 2 + ((t / 140 | 0) % 10); rect(c, x, 6, 1, 1, '#ffffff');
    }};

  ITEMS['up2.marquee'] = {kind: 'wall', w: 40, h: 11, glow: [20, 5, 26, '155,140,255'],
    draw: function (c) {
      rect(c, 0, 0, 40, 11, '#15121f'); rect(c, 0, 0, 40, 1, '#2e2846'); rect(c, 1, 1, 38, 9, '#241a40');
    },
    emit: function (c, t) {
      var s = blink(t, 1000, 600) ? 'CONTINUE?' : 'CONTINUE ';
      text(c, s, 3, 3, '#ece6ff');
      var k = (t / 180 | 0) % 3;
      for (var x = 1; x < 39; x += 3) { var on = ((x / 3 | 0) % 3) === k; rect(c, x, 0, 1, 1, on ? '#ffd27a' : '#4a3a20'); rect(c, 39 - x, 10, 1, 1, on ? '#ffd27a' : '#4a3a20'); }
    }};

  ITEMS['aca.sign'] = {kind: 'wall', w: 15, h: 15,
    draw: function (c) {
      for (var y = 0; y < 15; y++) {
        var half = 7 - Math.abs(y - 7);
        rect(c, 7 - half, y, half * 2 + 1, 1, '#17171a');
        if (half > 0) rect(c, 8 - half, y, half * 2 - 1, 1, '#e3b22e');
      }
      rect(c, 7, 1, 1, 1, '#f4d36a');
      map(c, 3, 3, [
        '......k..', '......kkk', '.....kkk.', '...kkkk..', '..kkkkk..', '.k.kkkk..', 'k....kk..', '.....k.kk'], {k: '#17171a'});
    }};

  ITEMS['aca.pet'] = {kind: 'floor', w: 22, h: 13,
    draw: function (c, t, v) {
      var bed = ['..rrrrrrrrrrrrrrrrrr..', '.rrssssssssssssssssrr.', 'rrssssssssssssssssssrr', 'rrrrrrrrrrrrrrrrrrrrrr', '.qqqqqqqqqqqqqqqqqqqq.'];
      map(c, 0, 8, bed, {r: '#8a3a28', s: '#c9935a', q: '#5e2618'});
      var asleep = (t % 11000) > 7000;
      if (v === 'cat') {
        var br = asleep && blink(t, 1600, 800) ? 1 : 0;
        map(c, 4, 4 - br, [
          '..........g.g', '.gdgdgdg.ggggg', 'gggggggggg' + (asleep ? 'd' : 'e') + 'ggg', 'gdgdgdgggggggl', '.lllllllllll..'],
          {g: '#7c7e86', d: '#4c4e56', l: '#b0b2b8', e: '#c8e05a'});
        if (br) rect(c, 4, 7, 14, 1, '#7c7e86');
        var tail = blink(t, 2400, 300) ? 3 : 4;
        rect(c, 2, tail, 2, 1, '#7c7e86'); rect(c, 3, tail + 1, 1, 2, '#7c7e86');
      } else {
        var wag = !asleep && blink(t, 500, 250);
        map(c, 3, 2, [
          '............k.k.', '............kkk.', '...kkkkkkkkkk' + (asleep ? 'k' : 'e') + 'kn', '..kkkkkkkkkkkwww', '.kkkkkkkkkkkkww.', '.kwwkkkkkkwwww..'],
          {k: '#94522a', w: '#dcae78', e: '#1a1010', n: '#1a1010'});
        if (wag) { rect(c, 2, 4, 1, 1, '#94522a'); rect(c, 1, 3, 1, 1, '#94522a'); }
        else { rect(c, 2, 6, 1, 1, '#94522a'); rect(c, 1, 7, 1, 1, '#94522a'); }
      }
      if (asleep) {
        var p = ((t % 11000) - 7000) / 4000, zy = 2 - (p * 6 | 0);
        if (zy > -3) map(c, 18, Math.max(0, zy + 2), ['zzz', '.z.', 'zzz'], {z: 'rgba(230,236,240,.7)'});
      }
    }};

  ITEMS['aca.rig'] = {kind: 'top', w: 27, h: 9,
    draw: function (c) {
      map(c, 0, 0, [
        '.....................rrrr..',
        'oooooooooooooooooo..rrwwwr.',
        'oOOOOOOOOOOOOOOOOo..rrwwwr.',
        'oOOOOddOOOOOOOOOOo.rrrrrrrr',
        'oOOOOOOOOOOOOOOOOo.rrrrrrry',
        'oooooooooooooooooommmmmmmmm',
        '..bb.bb.......bb.bb.bb..bb.',
        '..bh.bh.......bh.bh.bh..bh.',
        '...........................'],
        {o: '#b8761e', O: '#e8a33d', d: '#8a5614', r: '#b33a2c', w: '#9fd4e8', m: '#9aa0aa', y: '#ffe08a', b: '#141414', h: '#5a5a5a'});
    }};

  ITEMS['cos.cat'] = {kind: 'top', w: 10, h: 9,
    draw: function (c, t) {
      var flick = blink(t, 3000, 200);
      map(c, 0, 0, [
        'g.....g...', 'gg...gg...', 'ggggggg...', 'gegggeg...', 'ggglggg...', '.ggggg...' + (flick ? 'g' : '.'),
        'gdgdgdg..g', 'ggggggggg' + (flick ? '.' : 'g'), '.gg.gg....'],
        {g: '#8e9098', d: '#5a5c64', l: '#e09aa8', e: '#141418'});
    }};

  ITEMS['cos.chart'] = {kind: 'wall', w: 18, h: 22,
    draw: function (c) {
      rect(c, 1, 1, 18, 22, 'rgba(0,0,0,.45)');
      rect(c, 0, 0, 18, 22, '#2a3a60'); rect(c, 1, 1, 16, 20, '#0b1330');
      [[3, 3], [9, 2], [15, 7], [6, 9], [11, 12], [2, 13], [15, 14], [8, 6]].forEach(function (p) { rect(c, p[0], p[1], 1, 1, '#5a6a90'); });
    },
    emit: function (c, t) {
      for (var i = 0; i < 9; i++) if (((i + (t / 400 | 0)) % 3) === 0) rect(c, 4 + i, 13 - i, 1, 1, '#36f1cd');
      rect(c, 3, 14, 2, 2, '#ffd040');
      rect(c, 13, 3, 2, 2, '#fff6d8'); rect(c, 15, 2, 1, 1, '#ffe8a0');
      text(c, '4.37', 3, 16, '#36f1cd');
    }};

  ITEMS['cos.newdawn'] = {kind: 'hang', w: 22, h: 7, glow: [0, 3, 8, '54,241,205'],
    sway: true,
    draw: function (c) {
      map(c, 0, 0, [
        '......aaaa............', '....aabbbbaaa.........', '..daabbbbbbbbbaaaee...',
        '..dbbbffbbffbbbbbbeeg.', '..daabbbbbbbbbaaaee...', '....aabbbbaaa.........', '......aaaa............'],
        {a: '#7e8698', b: '#c4cbd6', d: '#2c8a78', e: '#5e6678', f: '#1d2a3a', g: '#ffc878'});
    },
    emit: function (c, t) {
      var f = blink(t, 240, 120) ? '#36f1cd' : '#9ffbe8';
      rect(c, 0, 2, 2, 3, f); rect(c, 1, 3, 1, 1, '#ffffff');
      rect(c, 6, 3, 1, 1, '#9ff'); rect(c, 10, 3, 1, 1, '#9ff');
    }};

  ITEMS['room.plaque'] = {kind: 'wall', w: 29, h: 11,
    draw: function (c) {
      rect(c, 1, 1, 29, 11, 'rgba(0,0,0,.45)');
      rect(c, 0, 0, 29, 11, '#4a2a14'); rect(c, 1, 1, 27, 9, '#6e4426');
      rect(c, 2, 2, 25, 7, '#b8923e'); rect(c, 2, 2, 25, 1, '#ecd07a');
      text(c, '990000', 3, 3, '#3a2408');
    }};

  ITEMS['room.lava'] = {kind: 'top', w: 7, h: 17, glow: [3, 7, 12, '255,122,48'],
    draw: function (c) {
      map(c, 0, 0, [
        '..mmm..', '..mMm..', '.......', '.......', '.......', '.......', '.......', '.......', '.......', '.......', '.......',
        '..mmm..', '.mmMmm.', '.mmMmm.', 'mmmMmmm', 'mmmMmmm', 'mmmmmmm'], {m: '#7a6a48', M: '#b8a070'});
    },
    emit: function (c, t) {
      var rows = [3, 3, 5, 5, 5, 5, 5, 5, 3];
      for (var j = 0; j < rows.length; j++) rect(c, 3 - (rows[j] >> 1), 2 + j, rows[j], 1, '#ff6a2a');
      var b1 = 2 + Math.round(4 + 4 * Math.sin(t / 1300)), b2 = 2 + Math.round(4 + 4 * Math.sin(t / 1700 + 2));
      rect(c, 2, b1, 2, 2, '#ffd040'); rect(c, 3, b2, 2, 1, '#ffb030');
      rect(c, 2, 10, 3, 1, '#ffd040');
    }};

  ITEMS['room.minicab'] = {kind: 'floor', w: 18, h: 28, glow: [9, 12, 16, '255,90,170'],
    draw: function (c) {
      map(c, 0, 0, [
        '.pppppppppppppppp.', 'pPPPPPPPPPPPPPPPPp', 'pk..............kp', 'pk..............kp', 'pk..............kp', 'pPPPPPPPPPPPPPPPPp',
        'pk..............kp', 'pk..............kp', 'pk..............kp', 'pk..............kp', 'pk..............kp', 'pk..............kp',
        'pk..............kp', 'pk..............kp', 'pk..............kp', 'pk..............kp', 'pPPPPPPPPPPPPPPPPp', 'ppccccccccccccccpp',
        'pcccccccccccccccc.', 'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp',
        'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp', 'pPPPPPPPPPPPPPPPPp', 'pppppppppppppppppp'],
        {p: '#5a1838', P: '#a02c62', k: '#14080e', c: '#2a2a32'});
      rect(c, 4, 18, 1, 1, '#e03040'); rect(c, 4, 17, 1, 1, '#9a9aa4');
      rect(c, 9, 18, 1, 1, '#36f1cd'); rect(c, 11, 18, 1, 1, '#ffd040'); rect(c, 13, 18, 1, 1, '#9b8cff');
    },
    emit: function (c, t) {
      rect(c, 2, 2, 14, 3, '#ff7ab8'); for (var i = 0; i < 4; i++) rect(c, 3 + i * 4, 3, 2, 1, blink(t + i * 200, 800, 400) ? '#ffffff' : '#ffc0dc');
      rect(c, 2, 6, 14, 10, '#12061c');
      var f = (t / 400 | 0) % 2, x = 3 + ((t / 200 | 0) % 10);
      map(c, x > 7 ? 14 - x : x + 1, 7, f ? ['.p.p.', 'ppppp', 'p.p.p'] : ['p...p', 'ppppp', '.p.p.'], {p: '#7dff7a'});
      rect(c, 3 + ((t / 90 | 0) % 12), 13, 1, 1, '#ffffff');
      rect(c, 7, 23, 4, 2, blink(t, 900, 450) ? '#ff9a30' : '#7a3a10');
    }};

  // ---- the crate that gives the secret away, and the toolbox that stays after ----
  var CRATE = {x: 217, y: 176, w: 15, h: 18,
    draw: function (c, t) {
      map(c, 0, 7, [
        'ooooooooooooooo', 'oCCCCCCtCCCCCCo', 'oCCCCCCtCCCCCCo', 'oCCCCCCtCCCCCCo', 'oddddddtddddddo',
        'oCCCCCCCCCCCCCo', 'oCCCCCCCCCCCCCo', 'oCCCCCCCCCCCCCo', 'oCCCCCCCCCCCCCo', 'ooooooooooooooo', '.qqqqqqqqqqqqq.'],
        {o: '#6a4a26', C: '#a07848', d: '#86603a', t: '#d8c890', q: 'rgba(0,0,0,.5)'});
    },
    emit: function (c, t) {
      var b = Math.round(Math.sin(t / 260));
      rect(c, 6, 0 + b, 3, 4, '#ffb040'); rect(c, 7, 0 + b, 1, 4, '#ffe0a0'); rect(c, 6, 5 + b, 3, 1, '#ffb040');
    }};
  var TOOLBOX = {x: 97, y: 200, w: 12, h: 8,
    draw: function (c) {
      map(c, 0, 0, ['...hhhhhh...', '...h....h...', 'rrrrrrrrrrrr', 'RRRRRRRRRRRR', 'rrrrrkkrrrrr', 'rrrrrrrrrrrr', 'rrrrrrrrrrrr', '.qqqqqqqqqq.'],
        {h: '#6a6e78', r: '#a82828', R: '#d24a3a', k: '#c9ccd4', q: 'rgba(0,0,0,.5)'});
    }};

  // ---- rendering ----
  var scratch = document.createElement('canvas'), sc = scratch.getContext('2d');
  // top-left corner of an item placed in a slot
  function place(slot, it) {
    if (slot.kind === 'top' || slot.kind === 'floor') return [Math.round(slot.x - it.w / 2), slot.y - it.h];
    return [Math.round(slot.x - it.w / 2), Math.round(slot.y - it.h / 2)];
  }
  function fits(it, slot) { return it && slot && it.kind === slot.kind && it.w <= slot.w && it.h <= slot.h; }

  // draw one sprite at x,y: base, darkened to match the room, then its glowing parts and a soft light
  function sprite(g, it, x, y, t, v, dark) {
    scratch.width = it.w + 2; scratch.height = it.h + 2;
    sc.clearRect(0, 0, scratch.width, scratch.height);
    it.draw(sc, t, v);
    if (dark > 0) {
      sc.globalCompositeOperation = 'source-atop';
      sc.fillStyle = 'rgba(4,6,12,' + dark.toFixed(2) + ')';
      sc.fillRect(0, 0, scratch.width, scratch.height);
      sc.globalCompositeOperation = 'source-over';
    }
    if (it.emit) it.emit(sc, t, v);
    g.drawImage(scratch, x, y);
    if (it.glow) {
      var gl = it.glow, cx = x + gl[0] + .5, cy = y + gl[1] + .5;
      var grad = g.createRadialGradient(cx, cy, 0, cx, cy, gl[2]);
      grad.addColorStop(0, 'rgba(' + gl[3] + ',.22)'); grad.addColorStop(1, 'rgba(' + gl[3] + ',0)');
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = grad; g.fillRect(cx - gl[2], cy - gl[2], gl[2] * 2, gl[2] * 2);
      g.globalCompositeOperation = 'source-over';
    }
  }

  // draw every placed item. layout: {slotId: itemId}; variants: {itemId: 'cat'}; lamp: 0..1 bulb brightness
  function drawLayout(g, layout, variants, t, lamp) {
    var extra = (1 - (lamp == null ? 1 : lamp)) * .35;
    SLOTS.forEach(function (s) {
      var id = layout[s.id], it = ITEMS[id];
      if (!fits(it, s)) return;
      var p = place(s, it);
      if (s.kind === 'hang') {
        var sway = it.sway ? Math.round(Math.sin(t / 1400)) : 0;
        p[0] += sway;
        g.fillStyle = 'rgba(90,92,104,.9)';
        g.fillRect(s.x, s.top, 1, p[1] - s.top + 1);
      }
      sprite(g, it, p[0], p[1], t, variants && variants[id], s.shade + extra);
    });
  }

  window.RoomArt = {
    SLOTS: SLOTS, ITEMS: ITEMS, CRATE: CRATE, TOOLBOX: TOOLBOX,
    fits: fits, place: place, sprite: sprite, drawLayout: drawLayout
  };
})();
