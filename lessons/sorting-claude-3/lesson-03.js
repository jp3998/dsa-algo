(function (root) {
  'use strict';

  /* Port of Python's sorted(set(a)) for integer lists.
     s = set(a) keeps the first of equal values; sorted() then orders by <. */
  function sortedSet(a) {
    var seen = new Set();
    var s = [];
    for (var i = 0; i < a.length; i++) {
      var key = a[i] === 0 ? 0 : a[i];      // -0 and 0 are the same integer
      if (!seen.has(key)) { seen.add(key); s.push(key); }
    }
    return s.sort(function (x, y) { return x < y ? -1 : (y < x ? 1 : 0); });
  }

  function show(list) { return '<code>[' + list.join(', ') + ']</code>'; }

  function checkSetInput(text) {
    var res = root.Course.parseArray(text, { maxN: 8, integers: true, allowEmpty: true });
    if (!res.ok) return { ok: false, html: res.error };
    var a = res.values.map(function (v) { return v === 0 ? 0 : v; });
    var out = sortedSet(a);
    var k = a.length - out.length;
    if (k > 0) {
      return {
        ok: true,
        html: 'That breaks it. <code>sorted(set(a))</code> returns ' + show(out) + ', which has ' + k +
          (k === 1 ? ' fewer element' : ' fewer elements') + ' than your input, because <code>set</code> kept only one copy ' +
          'of each repeated value. The output is in order, but it isn’t a permutation of the input: condition 2 fails.'
      };
    }
    return {
      ok: false,
      html: 'On this input <code>sorted(set(a))</code> returns ' + show(out) + ', which is exactly the sorted arrangement: ' +
        'with every value distinct, <code>set</code> has nothing to remove. Think about what <code>set</code> does to a value ' +
        'that appears more than once.'
    };
  }

  var L03 = { sortedSet: sortedSet, checkSetInput: checkSetInput };
  if (typeof module !== 'undefined' && module.exports) module.exports = L03;
  else root.L03 = L03;
})(typeof window !== 'undefined' ? window : globalThis);
