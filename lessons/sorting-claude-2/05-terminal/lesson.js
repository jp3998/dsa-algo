/* lesson.js — wires content.md's exact exercise text to the generic
   components for lesson-03.html. */
(function () {
  'use strict';
  var SC = window.SC;
  var ui = SC.ui;
  var el = ui.el;

  function byId(id) { return document.getElementById(id); }

  function appendReveal(root, text) {
    var d = el('div', { class: 'feedback good', style: 'margin-top:0.5rem; background:#f4f2ea; border-color: var(--rule-strong); color: var(--text);' }, text);
    // reveal text is explanatory, not a verdict — strip the good/bad tint, keep the frame
    d.style.background = '#f4f2ea';
    d.style.color = 'var(--text)';
    root.appendChild(d);
    ui.renderMath(d);
  }

  document.addEventListener('DOMContentLoaded', function () {

    // ---------------- prereq check ----------------
    ui.mountNumeric(byId('p1-controls'), {
      answer: '7',
      correct: 'Right: one comparison per adjacent pair, and transitivity does the rest.',
      wrong: [
        { value: '28', message: 'That’s $\\binom{8}{2}$, every pair. You only need the adjacent pairs; transitivity covers the others. Revisit Lesson 1, §2.' },
        { value: '8', message: 'Off by one: 8 elements have 7 adjacent pairs.' }
      ],
      generic: 'Not quite. Think about which pairs you actually need to compare. Revisit Lesson 1, §2.'
    });

    ui.mountMC(byId('p2-controls'), {
      options: [
        { letter: 'a', text: 'fewer comparisons.', correct: false, feedback: 'That’s the intuition this lesson is about, but repeated selection can’t use it. To be sure an element is the smallest remaining, it must compare it with every remaining element, whatever the input looks like. Revisit Lesson 2.' },
        { letter: 'b', text: 'the same number of comparisons.', correct: true, feedback: 'Right. The count is $n(n-1)/2$ regardless of the input. That rigidity is what this lesson tries to escape.' },
        { letter: 'c', text: 'more comparisons.', correct: false, feedback: 'No: the count doesn’t depend on the input at all. Revisit Lesson 2.' }
      ]
    });

    // ---------------- predict-inversions (gates Figure 1 + facts) ----------------
    var gateInversions = ui.makeGate(byId('gate-after-predict-inversions'));
    var predictInvRoot = byId('predict-inversions-controls');
    ui.mountPredict(predictInvRoot, gateInversions, 'numeric', {
      answer: '5',
      correct: 'Exactly right.',
      wrong: [
        { value: '10', message: 'That’s the number of pairs, $\\binom{5}{2}$. Only some of them are out of order.' },
        { value: '4', message: 'Close. One pair is easy to miss: check $(3, 2)$.' }
      ],
      generic: 'Not quite. Go through each element and count the smaller elements to its right.',
      onCommit: function () {
        appendReveal(predictInvRoot, 'Five: $(4,1)$, $(4,3)$, $(4,2)$, $(3,2)$ and $(5,2)$. Each is a pair of values where the larger one comes first. The diagram below draws them.');
      }
    });

    // ---------------- predict-swap (gates Lemma 1 + proof) ----------------
    var gateSwap = ui.makeGate(byId('gate-after-predict-swap'));
    ui.mountPredict(byId('predict-swap-controls'), gateSwap, 'mc', {
      options: [
        { letter: 'a', text: 'Exactly one.', correct: true, feedback: 'Right. And the proof shows why it can never be more.' },
        { letter: 'b', text: 'At least one, sometimes more.', correct: false, feedback: 'It feels as if moving a large element rightward could fix several pairs at once. But check which pairs actually change their relative order.' },
        { letter: 'c', text: 'It depends on the other elements.', correct: false, feedback: 'The other elements matter less than you’d think: relative to the swapped pair, each of them stays on the same side.' },
        { letter: 'd', text: 'One, but it may create new ones.', correct: false, feedback: 'Only the swapped pair changes order. It goes from inverted to not inverted, and nothing else changes.' }
      ]
    });

    // ---------------- predict-total-swaps (gates the stepper) ----------------
    var gateStepper = ui.makeGate(byId('gate-after-predict-total-swaps'));
    ui.mountPredict(byId('predict-total-swaps-controls'), gateStepper, 'numeric', {
      answer: '5',
      correct: 'Five: exactly $I(a)$, as Lemma 1 promised. Every swap removed an inversion.',
      wrong: [],
      generic: 'Not quite. Count, for each element, how many larger elements stand to its left, and add those up. The trace below lets you check.'
    });

    // ---------------- Figure 1 ----------------
    ui.mountInversionDiagram(byId('inversion-diagram-root'));

    // ---------------- Figure 2 + Listing 1 (built lazily is unnecessary — cheap) ----------------
    ui.mountStepperAndListing(byId('stepper-root'), byId('listing-root'));

    // ---------------- Figure 3 ----------------
    ui.mountCostPlot(byId('cost-plot-root'));

    // ---------------- Figure 4 ----------------
    ui.mountKnowledgeView(byId('knowledge-view-root'));

    // ---------------- Checkpoint ----------------
    var attempted = { 1: false, 2: false, 3: false, 4: false };
    var ledgerGate = ui.makeGate(byId('gate-ledger-next'));
    var progressEl = byId('checkpoint-progress');
    var gapsEl = byId('checkpoint-gaps');

    function updateProgress() {
      var c = [1, 2, 3, 4].filter(function (n) { return attempted[n]; }).length;
      progressEl.firstChild.textContent = 'Attempted: ' + c + ' of 4. ';
    }

    function revealLedger(withGaps) {
      ledgerGate.reveal();
      if (withGaps) {
        var missing = [1, 2, 3, 4].filter(function (n) { return !attempted[n]; });
        if (missing.length) {
          gapsEl.innerHTML = '<p class="gaps-note"><strong style="color:var(--orange)">NOTE:</strong> you pressed “continue anyway” before attempting Q' +
            missing.join(', Q') + '. Recorded as ' + (missing.length > 1 ? 'gaps' : 'a gap') + ' in this lesson’s ledger.</p>';
        }
      }
    }

    function markAttempted(n) {
      if (attempted[n]) return;
      attempted[n] = true;
      updateProgress();
      if ([1, 2, 3, 4].every(function (k) { return attempted[k]; })) revealLedger(false);
    }

    byId('checkpoint-continue').addEventListener('click', function () { revealLedger(true); });

    ui.mountMC(byId('q1-controls'), {
      options: [
        { letter: 'a', text: '4.', correct: false, feedback: 'That’s $n-1$, as if each element needed a single move. But the 1 alone must travel four positions, the 2 three, and so on. Count inversions instead.' },
        { letter: 'b', text: '5.', correct: false, feedback: 'One swap per element isn’t enough: a swap moves just two elements, one position each.' },
        { letter: 'c', text: '10.', correct: true, feedback: 'Right: $I = \\binom{5}{2} = 10$, and Theorem 1 says no adjacent-swap algorithm can do better.' },
        { letter: 'd', text: '20.', correct: false, feedback: 'That counts every pair twice, in both orders. An inversion is a pair of positions $i < j$.' }
      ],
      onCommit: function () { markAttempted(1); }
    });

    ui.mountNumeric(byId('q2-controls'), {
      answer: '8',
      correct: 'Right: $I + (n-1) - 1 = 5 + 4 - 1 = 8$. The first key, 1, reaches the front, so its loop ends on `j > 0` without a comparison.',
      wrong: [
        { value: '5', message: 'That’s the number of swaps, $I(a)$. Add the final false test that ends each insertion, except for a key that reaches the front.' },
        { value: '9', message: 'Almost. The key 1 reaches position 0, so its loop ends on `j > 0` without comparing.' },
        { value: '10', message: 'That’s $\\binom{5}{2}$, the count for repeated selection. Insertion sort adapts to the input.' }
      ],
      generic: 'Not quite. Step through Figure 2 with the Example preset and watch the comparison counter.',
      onCommit: function () { markAttempted(2); }
    });

    ui.mountMC(byId('q3-controls'), {
      options: [
        { letter: 'a', text: 'Every sorting algorithm needs $\\Omega(n^2)$ time in the worst case.', correct: false, feedback: 'That would be a bound on the <em>problem</em>. Theorem 1 covers only algorithms that move elements between neighbours.' },
        { letter: 'b', text: 'Nothing about algorithms that can move an element far in one step.', correct: true, feedback: 'Right. It’s a bound on a class of algorithms. Whether sorting itself needs $n^2$ work is still an open question for us.' },
        { letter: 'c', text: 'Every sorting algorithm needs $\\Omega(n^2)$ comparisons.', correct: false, feedback: 'Theorem 1 counts swaps, not comparisons, and it covers only one class of algorithms.' },
        { letter: 'd', text: 'Insertion sort needs $\\Omega(n^2)$ swaps on every input.', correct: false, feedback: 'Not on every input: on sorted input it makes $0$ swaps. The bound is about the worst case, and, as §5 showed, the average case.' }
      ],
      onCommit: function () { markAttempted(3); }
    });

    // ---------------- Q4: find the bug ----------------
    (function () {
      var root = byId('q4-controls');
      var listingWrap = el('div', { class: 'listing' });
      root.appendChild(listingWrap);
      var feedback = el('div', { class: 'feedback', hidden: true });
      root.appendChild(feedback);
      var runWrap = el('div', { hidden: true });
      root.appendChild(runWrap);

      var FINE = {
        3: 'That’s fine. $a[0:1]$ is already sorted, so the first element to insert is $a[1]$.',
        5: 'That’s fine. The key starts at position $i$.',
        7: 'That’s fine. Python evaluates the right-hand side before assigning, so the tuple swap is safe.',
        8: 'That’s fine. Decrementing $j$ is what moves the key left.'
      };
      var GENERIC_FINE = 'That line is fine. Look at the loop condition.';
      var bugLine = SC.PY.buggy.bugLine;
      var found = false;

      var listing = ui.renderCodeListing(listingWrap, SC.PY.buggy.highlighted, {
        clickable: true,
        onLineClick: function (n, lineEl) {
          markAttempted(4);
          listing.lineEls.forEach(function (l) { l.classList.remove('line-wrong'); });
          feedback.hidden = false;
          if (n === bugLine) {
            found = true;
            lineEl.classList.add('line-correct');
            feedback.className = 'feedback good';
            feedback.innerHTML = '<span class="mark">✓</span><span class="msg">Right. When $j = 0$, <code>a[j - 1]</code> is <code>a[-1]</code>. In Python that isn’t an error: it’s the <em>last</em> element. The loop can then swap the first element with the last one.</span>';
            runWrap.hidden = false;
            if (!runWrap.firstChild) {
              var btn = el('button', { class: 'tbtn', type: 'button' }, '[Run the buggy version on [2, 1]]');
              var out = el('div', { class: 'status-line' });
              btn.addEventListener('click', function () {
                var result = SC.buggyInsertion([2, 1]);
                out.textContent = 'returns [' + result.join(', ') + ']: not sorted.';
              });
              runWrap.appendChild(btn);
              runWrap.appendChild(out);
            }
          } else {
            lineEl.classList.add('line-wrong');
            feedback.className = 'feedback bad';
            var msg = FINE[n] || GENERIC_FINE;
            feedback.innerHTML = '<span class="mark">✗</span><span class="msg">' + msg + '</span>';
          }
          ui.renderMath(feedback);
        }
      });
    })();

    updateProgress();

    // ---------------- reveal=1: open every gate + expand "Going deeper" ----------------
    if (SC.REVEAL) {
      document.querySelectorAll('details.disclosure').forEach(function (d) { d.open = true; });
    }

    // ---------------- KaTeX: render all the static math on the page ----------------
    ui.renderMath(document.body);
  });
})();
