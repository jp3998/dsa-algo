/* ============================================================================
   lesson.js — page behaviour shared by every lesson.
   No dependencies beyond the vendored KaTeX. Runs on DOMContentLoaded.
   ========================================================================= */

(function () {
  'use strict';

  /* ---- 1. Math --------------------------------------------------------- */

  function renderMath() {
    if (typeof window.renderMathInElement !== 'function') return;
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      // Never rewrite what the reader is meant to read literally.
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
      throwOnError: false
    });
  }

  /* ---- 2. Sidenotes ---------------------------------------------------- */
  /* Number refs and notes in document order, and wire the narrow-viewport
     tap-to-expand behaviour. */

  function initSidenotes() {
    var refs = document.querySelectorAll('.sidenote-ref');
    var notes = document.querySelectorAll('.sidenote');

    refs.forEach(function (ref, i) {
      var n = String(i + 1);
      ref.setAttribute('data-num', n);
      ref.setAttribute('role', 'button');
      ref.setAttribute('aria-expanded', 'false');
      ref.setAttribute('aria-label', 'Sidenote ' + n);
      if (!ref.hasAttribute('tabindex')) ref.setAttribute('tabindex', '0');

      var note = notes[i];
      if (!note) return;

      note.setAttribute('data-num', n);
      if (!note.id) note.id = 'sidenote-' + n;
      ref.setAttribute('aria-controls', note.id);

      function toggle() {
        var open = note.classList.toggle('is-open');
        ref.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      ref.addEventListener('click', toggle);
      ref.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });

    notes.forEach(function (note, i) {
      if (!note.hasAttribute('data-num')) note.setAttribute('data-num', String(i + 1));
    });
  }

  /* ---- 3. Section anchors ---------------------------------------------- */
  /* Give every body section heading a quiet self-link, so a reader can point
     someone at a specific step of the argument. */

  function initAnchors() {
    document.querySelectorAll('.lesson-body > section[id] > h2').forEach(function (h) {
      var id = h.parentElement.id;
      var a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + id;
      a.setAttribute('aria-label', 'Link to this section');
      a.textContent = '#';
      h.appendChild(a);
    });
  }

  /* ---- 4. Exercises ---------------------------------------------------- */
  /* Nothing clever: <details> already works. We only make sure an answer that
     contains math gets typeset before it is first revealed, since KaTeX has
     already run over the whole body by then anyway. Kept as a hook. */

  function initExercises() {
    document.querySelectorAll('details.q').forEach(function (d, i) {
      if (!d.id) d.id = 'q' + (i + 1);
    });
  }

  /* ---- 5. Motion preference -------------------------------------------- */

  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  window.LESSON = {
    get reduceMotion() { return reduceMotion.matches; }
  };

  /* ---- 6. Go ----------------------------------------------------------- */

  function init() {
    renderMath();
    initSidenotes();
    initAnchors();
    initExercises();
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
