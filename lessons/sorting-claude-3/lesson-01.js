(function (root) {
  'use strict';

  /* Faithful ports of Listing 1 (same names, control flow and order of operations). */
  function isSortedBy(xs, before) {
    var n = xs.length;
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        if (before(xs[j], xs[i])) {
          return false;
        }
      }
    }
    return true;
  }

  function isSortedNeighbours(xs, before) {
    for (var i = 0; i < xs.length - 1; i++) {
      if (before(xs[i + 1], xs[i])) {
        return false;
      }
    }
    return true;
  }

  /* itertools.permutations order: lexicographic by input position. */
  function permutations(items) {
    var out = [];
    var n = items.length;
    var used = new Array(n).fill(false);
    var cur = [];
    (function rec() {
      if (cur.length === n) { out.push(cur.slice()); return; }
      for (var k = 0; k < n; k++) {
        if (used[k]) continue;
        used[k] = true; cur.push(items[k]);
        rec();
        cur.pop(); used[k] = false;
      }
    })();
    return out;
  }

  function countSorted(items, before) {
    var total = 0;
    var perms = permutations(Array.prototype.slice.call(items));
    for (var k = 0; k < perms.length; k++) {
      if (isSortedBy(perms[k], before)) total += 1;
    }
    return total;
  }

  /* The tasks of request (C): a < c, b < c, b < d (already transitively closed). */
  var needs = { ac: true, bc: true, bd: true };
  function taskBefore(x, y) { return needs[x + y] === true; }

  function checkNeighbourTrap(raw) {
    var s = String(raw == null ? '' : raw).replace(/[\s,]+/g, '').toLowerCase();
    var xs = s.split('');
    var ok = xs.length === 4 && xs.slice().sort().join('') === 'abcd';
    if (!ok) return { ok: false, html: 'Use each of a, b, c, d exactly once.' };
    if (s === 'dabc') return { ok: false, html: 'That’s the example above. There are two others; find one.' };
    if (isSortedBy(xs, taskBefore)) {
      return { ok: false, html: 'This arrangement is valid: no pair at all is out of order. You need one that is invalid but has no out-of-order neighbours.' };
    }
    for (var i = 0; i < xs.length - 1; i++) {
      if (taskBefore(xs[i + 1], xs[i])) {
        return { ok: false, html: 'The neighbour test already catches this one: <b>' + xs[i] + '</b> and <b>' + xs[i + 1] + '</b> are neighbours and ' + xs[i + 1] + ' ≺ ' + xs[i] + '.' };
      }
    }
    for (var a = 0; a < xs.length; a++) {
      for (var b = a + 1; b < xs.length; b++) {
        if (taskBefore(xs[b], xs[a])) {
          return { ok: true, html: 'No neighbour pair is out of order, yet ' + xs[b] + ' ≺ ' + xs[a] + ' with ' + xs[a] + ' earlier. The three such arrangements are dabc, bcda and cdab.' };
        }
      }
    }
    return { ok: false, html: 'The checker could not classify that arrangement.' };
  }

  var L01 = { isSortedBy: isSortedBy, isSortedNeighbours: isSortedNeighbours, countSorted: countSorted, permutations: permutations, taskBefore: taskBefore, checkNeighbourTrap: checkNeighbourTrap };

  if (typeof module !== 'undefined' && module.exports) module.exports = L01;
  else root.L01 = L01;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!root.Course || !root.Course.PosetView) return;
      var f2 = document.getElementById('pv-tasks');
      if (f2) {
        new root.Course.PosetView(f2, { labels: ['a', 'b', 'c', 'd'], relations: [[0, 2], [1, 2], [1, 3]], interactive: false, showCount: true, showExtensions: 24 });
      }
      var f3 = document.getElementById('pv-playground');
      if (f3) {
        new root.Course.PosetView(f3, { labels: ['a', 'b', 'c', 'd', 'e'], relations: [], interactive: true, showCount: true, showExtensions: 24 });
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
