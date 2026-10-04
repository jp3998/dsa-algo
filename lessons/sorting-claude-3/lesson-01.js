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
    if (!ok) return { ok: false, html: 'An arrangement of the tasks lists each of a, b, c and d exactly once, so type four letters with no repeats and nothing else.' };
    if (s === 'dabc') return { ok: false, html: 'That’s the example from the reveal above, so it doesn’t count here. There are exactly two others; see if you can find one.' };
    if (isSortedBy(xs, taskBefore)) {
      return { ok: false, html: 'This arrangement is valid: a and b both come before c, and b comes before d, so no pair at all is out of order, and the neighbour test is right to pass it. You’re looking for one that is invalid and still passes.' };
    }
    for (var i = 0; i < xs.length - 1; i++) {
      if (taskBefore(xs[i + 1], xs[i])) {
        return { ok: false, html: 'The neighbour test already catches this one: <b>' + xs[i] + '</b> and <b>' + xs[i + 1] + '</b> are neighbours and ' + xs[i + 1] + ' ≺ ' + xs[i] + '. It is invalid, but a trap needs its broken pair hidden: the two items must stand apart, with no neighbour pair out of order.' };
      }
    }
    for (var a = 0; a < xs.length; a++) {
      for (var b = a + 1; b < xs.length; b++) {
        if (taskBefore(xs[b], xs[a])) {
          return { ok: true, html: 'That’s a trap. No neighbour pair is out of order, so the neighbour test passes it, yet ' + xs[b] + ' ≺ ' + xs[a] + ' is required and ' + xs[a] + ' stands earlier: an out-of-order pair whose two items never touch. The three arrangements like this are dabc, bcda and cdab.' };
        }
      }
    }
    return { ok: false, html: 'The checker could not classify that arrangement.' };
  }

  /* Order exercises: the shared component explains a kept false step (data-why) but gives one generic
     message for a true step out of place or excluded. This adds the step's own reason, from
     data-order (out of place) or data-true (excluded although true), after the component's message. */
  function explainOrderSteps(ex) {
    var btn = ex.querySelector('.ex-actions .btn.primary');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var api = ex.courseApi, li = ex.querySelector('.ex-steps > li.flag');
      if (!api || !api.live || !li || ex.getAttribute('data-solved') === '1') return;
      if ((parseInt(li.getAttribute('data-pos'), 10) || 0) === 0) return;
      var why = li.classList.contains('excl') ? li.getAttribute('data-true') : li.getAttribute('data-order');
      if (!why) return;
      var span = document.createElement('span');
      span.className = 'step-why';
      span.textContent = ' ' + why;
      api.live.appendChild(span);
    });
  }

  var L01 = { isSortedBy: isSortedBy, isSortedNeighbours: isSortedNeighbours, countSorted: countSorted, permutations: permutations, taskBefore: taskBefore, checkNeighbourTrap: checkNeighbourTrap };

  if (typeof module !== 'undefined' && module.exports) module.exports = L01;
  else root.L01 = L01;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var po = document.getElementById('l1-ex-proof-order');
      if (po) explainOrderSteps(po);
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
