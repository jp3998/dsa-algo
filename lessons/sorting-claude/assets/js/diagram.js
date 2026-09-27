/* ============================================================================
   diagram.js — SVG drawing helpers for conceptual figures.

   Everything reads its colours from the CSS custom properties in lesson.css,
   so the palette lives in exactly one place. Nothing here hard-codes a colour.

   Exposes a single global: D
   ========================================================================= */

(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var markerSeq = 0;

  /* ---- colours --------------------------------------------------------- */

  var _c = null;

  function colors() {
    if (_c) return _c;
    var s = getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var got = s.getPropertyValue(name).trim();
      return got || fallback;
    }
    _c = {
      ink:       v('--ink', '#1C1B19'),
      inkSoft:   v('--ink-soft', '#4A4843'),
      inkFaint:  v('--ink-faint', '#8A867C'),
      rule:      v('--rule', '#DDD8CB'),
      ruleStrong:v('--rule-strong', '#C4BDAC'),
      paper:     v('--paper', '#FDFCF9'),
      paperSunk: v('--paper-sunk', '#F5F3EC'),
      active:    v('--active', '#B4553C'),
      activeWash:v('--active-wash', '#F6E6E0'),
      settled:   v('--settled', '#3E6B54'),
      settledWash: v('--settled-wash', '#E2EDE6'),
      discarded: v('--discarded', '#9A96A8'),
      discardedWash: v('--discarded-wash', '#EFEEF2'),
      accent:    v('--accent', '#2E5C8A'),
      accentWash:v('--accent-wash', '#E5ECF4'),
      serif:     v('--serif', 'Georgia, serif'),
      mono:      v('--mono', 'monospace'),
      sans:      v('--sans', 'system-ui, sans-serif')
    };
    return _c;
  }

  /* A state name maps to a stroke colour and a fill wash. */
  function stateColors(state) {
    var c = colors();
    switch (state) {
      case 'active':    return { line: c.active,    fill: c.activeWash,    text: c.ink };
      case 'settled':   return { line: c.settled,   fill: c.settledWash,   text: c.ink };
      case 'discarded': return { line: c.discarded, fill: c.discardedWash, text: c.inkFaint };
      case 'accent':    return { line: c.accent,    fill: c.accentWash,    text: c.ink };
      case 'ghost':     return { line: c.rule,      fill: 'none',          text: c.inkFaint };
      default:          return { line: c.ruleStrong, fill: c.paper,        text: c.ink };
    }
  }

  /* ---- element creation ------------------------------------------------ */

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] === null || attrs[k] === undefined) continue;
        n.setAttribute(k, String(attrs[k]));
      }
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  /* Create an SVG canvas inside `mount`, scaling to the container width.
     Width/height define the coordinate system, not the rendered size. */
  function svg(mount, w, h, opts) {
    opts = opts || {};
    if (typeof mount === 'string') mount = document.querySelector(mount);
    if (!mount) return null;

    var root = el('svg', {
      viewBox: '0 0 ' + w + ' ' + h,
      width: '100%',
      role: opts.label ? 'img' : 'presentation',
      'aria-label': opts.label || null,
      'font-family': colors().serif
    });
    root.style.maxWidth = (opts.maxWidth || w) + 'px';
    root.style.display = 'block';
    root.style.margin = opts.center === false ? '0' : '0 auto';

    mount.appendChild(root);
    root._defs = el('defs', null, root);
    return root;
  }

  /* ---- primitives ------------------------------------------------------ */

  /* A labelled element box — the recurring visual for "one item". */
  function box(parent, o) {
    var c = colors();
    var sc = stateColors(o.state);
    var w = o.w || 46, h = o.h || 46;
    var g = el('g', { class: 'd-box' }, parent);

    el('rect', {
      x: o.x, y: o.y, width: w, height: h, rx: o.rx === undefined ? 4 : o.rx,
      fill: o.fill || sc.fill,
      stroke: sc.line,
      'stroke-width': o.strokeWidth || 1.4,
      'stroke-dasharray': o.dashed ? '4 3' : null
    }, g);

    if (o.label !== undefined && o.label !== null && o.label !== '') {
      el('text', {
        x: o.x + w / 2,
        y: o.y + h / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': o.fontSize || 18,
        'font-weight': o.bold ? 600 : 400,
        fill: o.textColor || sc.text
      }, g).textContent = o.label;
    }

    if (o.sub) {
      el('text', {
        x: o.x + w / 2,
        y: o.y + h + 15,
        'text-anchor': 'middle',
        'font-size': o.subSize || 11,
        'font-family': c.sans,
        fill: c.inkFaint
      }, g).textContent = o.sub;
    }

    if (o.above) {
      el('text', {
        x: o.x + w / 2,
        y: o.y - 9,
        'text-anchor': 'middle',
        'font-size': o.aboveSize || 11,
        'font-family': c.sans,
        fill: o.aboveColor || c.inkFaint
      }, g).textContent = o.above;
    }

    return g;
  }

  /* A row of boxes. Returns the array of group elements. */
  function row(parent, o) {
    var items = o.items || [];
    var w = o.w || 46, h = o.h || 46, gap = o.gap === undefined ? 10 : o.gap;
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var spec = (typeof it === 'object' && it !== null) ? it : { label: it };
      out.push(box(parent, {
        x: o.x + i * (w + gap),
        y: o.y,
        w: w, h: h,
        label: spec.label,
        state: spec.state || o.state,
        sub: spec.sub,
        above: spec.above,
        aboveColor: spec.aboveColor,
        dashed: spec.dashed,
        fontSize: o.fontSize,
        bold: spec.bold
      }));
    }
    return out;
  }

  function rowWidth(n, w, gap) {
    w = w || 46; gap = gap === undefined ? 10 : gap;
    return n * w + (n - 1) * gap;
  }

  /* An arrow. `curve` bows the line; positive bows one way, negative the other. */
  function arrow(parent, o) {
    var sc = stateColors(o.state);
    var line = o.color || sc.line;
    var id = 'ah' + (++markerSeq);
    var root = parent.ownerSVGElement || parent;
    var defs = root._defs || el('defs', null, root);

    if (o.head !== false) {
      var m = el('marker', {
        id: id, viewBox: '0 0 10 10', refX: 8.5, refY: 5,
        markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse'
      }, defs);
      el('path', { d: 'M 0 1 L 9 5 L 0 9 z', fill: line }, m);
    }

    var d;
    if (o.curve) {
      var mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2;
      var dx = o.x2 - o.x1, dy = o.y2 - o.y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var cx = mx - (dy / len) * o.curve;
      var cy = my + (dx / len) * o.curve;
      d = 'M ' + o.x1 + ' ' + o.y1 + ' Q ' + cx + ' ' + cy + ' ' + o.x2 + ' ' + o.y2;
    } else {
      d = 'M ' + o.x1 + ' ' + o.y1 + ' L ' + o.x2 + ' ' + o.y2;
    }

    return el('path', {
      d: d,
      fill: 'none',
      stroke: line,
      'stroke-width': o.width || 1.4,
      'stroke-dasharray': o.dashed ? '4 3' : null,
      'stroke-linecap': 'round',
      'marker-end': o.head === false ? null : 'url(#' + id + ')'
    }, parent);
  }

  function line(parent, o) {
    var sc = stateColors(o.state);
    return el('line', {
      x1: o.x1, y1: o.y1, x2: o.x2, y2: o.y2,
      stroke: o.color || sc.line,
      'stroke-width': o.width || 1.2,
      'stroke-dasharray': o.dashed ? '4 3' : null,
      'stroke-linecap': 'round'
    }, parent);
  }

  /* Text. `kind` picks a typographic role rather than raw styling. */
  function text(parent, o) {
    var c = colors();
    var kind = o.kind || 'body';
    var conf = {
      body:    { size: 14, family: c.serif, fill: c.ink,      weight: 400, spacing: null, upper: false },
      soft:    { size: 13, family: c.serif, fill: c.inkSoft,  weight: 400, spacing: null, upper: false },
      label:   { size: 10.5, family: c.sans, fill: c.inkFaint, weight: 600, spacing: '0.1em', upper: true },
      caption: { size: 12, family: c.sans,  fill: c.inkFaint, weight: 400, spacing: null, upper: false },
      big:     { size: 20, family: c.serif, fill: c.ink,      weight: 600, spacing: null, upper: false },
      mono:    { size: 13, family: c.mono,  fill: c.inkSoft,  weight: 400, spacing: null, upper: false }
    }[kind];

    var fill = o.color || (o.state ? stateColors(o.state).line : conf.fill);

    var t = el('text', {
      x: o.x, y: o.y,
      'text-anchor': o.anchor || 'start',
      'dominant-baseline': o.baseline || null,
      'font-size': o.size || conf.size,
      'font-family': conf.family,
      'font-weight': o.weight || conf.weight,
      'font-style': o.italic ? 'italic' : null,
      'letter-spacing': conf.spacing,
      fill: fill
    }, parent);

    t.textContent = conf.upper && o.text ? String(o.text).toUpperCase() : o.text;
    return t;
  }

  /* Multi-line text block, since SVG will not wrap for us. */
  function lines(parent, o) {
    var g = el('g', null, parent);
    var lh = o.lineHeight || 17;
    (o.text || []).forEach(function (s, i) {
      text(g, {
        x: o.x, y: o.y + i * lh, text: s,
        anchor: o.anchor, kind: o.kind, state: o.state,
        color: o.color, size: o.size, italic: o.italic
      });
    });
    return g;
  }

  /* A soft band behind a range — used to show "this region is settled". */
  function band(parent, o) {
    var sc = stateColors(o.state);
    var g = el('g', null, parent);
    el('rect', {
      x: o.x, y: o.y, width: o.w, height: o.h,
      rx: o.rx === undefined ? 5 : o.rx,
      fill: o.fill || sc.fill,
      stroke: o.stroke === false ? null : sc.line,
      'stroke-width': 1,
      'stroke-dasharray': o.dashed === false ? null : '5 3'
    }, g);
    if (o.label) {
      text(g, {
        x: o.x + o.w / 2, y: o.y - 8, text: o.label,
        anchor: 'middle', kind: 'label', color: sc.line
      });
    }
    return g;
  }

  /* A cross drawn over something that fails. */
  function cross(parent, o) {
    var c = colors();
    var s = o.size || 9;
    var g = el('g', null, parent);
    var col = o.color || c.active;
    el('line', { x1: o.x - s, y1: o.y - s, x2: o.x + s, y2: o.y + s,
      stroke: col, 'stroke-width': o.width || 2, 'stroke-linecap': 'round' }, g);
    el('line', { x1: o.x + s, y1: o.y - s, x2: o.x - s, y2: o.y + s,
      stroke: col, 'stroke-width': o.width || 2, 'stroke-linecap': 'round' }, g);
    return g;
  }

  function check(parent, o) {
    var c = colors();
    var s = o.size || 9;
    return el('path', {
      d: 'M ' + (o.x - s) + ' ' + o.y + ' L ' + (o.x - s * 0.2) + ' ' + (o.y + s * 0.75) +
         ' L ' + (o.x + s) + ' ' + (o.y - s * 0.8),
      fill: 'none',
      stroke: o.color || c.settled,
      'stroke-width': o.width || 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, parent);
  }

  function group(parent, attrs) { return el('g', attrs, parent); }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  global.D = {
    NS: NS,
    svg: svg,
    el: el,
    group: group,
    box: box,
    row: row,
    rowWidth: rowWidth,
    arrow: arrow,
    line: line,
    text: text,
    lines: lines,
    band: band,
    cross: cross,
    check: check,
    clear: clear,
    colors: colors,
    stateColors: stateColors
  };
})(window);
