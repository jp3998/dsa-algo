/* ==========================================================================
   CHAPTER 03: PERMUTATIONS, COMBINATORICS, AND UNCERTAINTY
   Scientific demonstration logic:
   - Permutation space generator (S_3 and S_4)
   - Real-time entropy / uncertainty metric: H = log2(|Remaining|)
   - Interactive inequality constraints filtering the suspect permutations
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize KaTeX auto-render
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  // 2. Analytical problem solution toggle
  document.querySelectorAll(".proof-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const solution = document.getElementById(targetId);
      if (solution) {
        solution.classList.toggle("revealed");
        btn.textContent = solution.classList.contains("revealed")
          ? "Hide Analytical Derivation"
          : "Display Analytical Derivation";
      }
    });
  });

  // 3. Initialize Permutation Explorer
  initPermutationExplorer();
});

function initPermutationExplorer() {
  const container = document.getElementById("permutation-grid");
  const countRemainingEl = document.getElementById("metric-remaining-perms");
  const entropyEl = document.getElementById("metric-entropy-bits");
  const percentEliminatedEl = document.getElementById("metric-eliminated-pct");
  const feedbackEl = document.getElementById("constraint-feedback-desc");

  // All 24 permutations of [0, 1, 2, 3] representing elements [x0, x1, x2, x3]
  const allPerms = [];
  function generatePermutations(arr, current = []) {
    if (arr.length === 0) {
      allPerms.push(current);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      generatePermutations([...arr.slice(0, i), ...arr.slice(i + 1)], [...current, arr[i]]);
    }
  }
  generatePermutations([0, 1, 2, 3]);

  // Active constraints: array of objects { smaller: i, larger: j }
  let activeConstraints = [];

  function evaluatePermutations() {
    if (!container) return;

    let validCount = 0;
    container.innerHTML = "";

    allPerms.forEach((p, idx) => {
      // Check if permutation p satisfies all active constraints
      // In permutation p, p[k] is the element at position k.
      // So element i precedes element j iff indexOf(i) < indexOf(j).
      let consistent = true;
      for (const c of activeConstraints) {
        const posSmall = p.indexOf(c.smaller);
        const posLarge = p.indexOf(c.larger);
        if (posSmall > posLarge) {
          consistent = false;
          break;
        }
      }

      if (consistent) validCount++;

      const card = document.createElement("div");
      card.className = `sci-cell ${consistent ? "" : "static-ref"}`;
      card.style.width = "110px";
      card.style.height = "42px";
      card.style.fontSize = "13px";
      card.style.opacity = consistent ? "1" : "0.2";
      card.style.border = consistent ? "1.5px solid var(--ink-primary)" : "1px dashed var(--border-rule)";
      card.innerHTML = `<span style="font-family:var(--font-mono);">[${p.map(x => "x" + x).join(", ")}]</span>`;
      container.appendChild(card);
    });

    // Update metrics
    const total = allPerms.length;
    const eliminated = total - validCount;
    const pct = ((eliminated / total) * 100).toFixed(1);
    const entropy = validCount > 0 ? (Math.log2(validCount)).toFixed(2) : "0.00";

    if (countRemainingEl) countRemainingEl.textContent = `${validCount} of ${total}`;
    if (percentEliminatedEl) percentEliminatedEl.textContent = `${pct}% eliminated`;
    if (entropyEl) entropyEl.textContent = `${entropy} bits`;

    if (feedbackEl) {
      if (activeConstraints.length === 0) {
        feedbackEl.innerHTML = "No constraints applied. Maximum uncertainty: all $4! = 24$ permutations are possible.";
      } else {
        const constraintStrs = activeConstraints.map(c => `x_{${c.smaller}} < x_{${c.larger}}`).join(", ");
        feedbackEl.innerHTML = `Active constraints: $${constraintStrs}$. Remaining candidate set size: <strong>${validCount}</strong>. Uncertainty: <strong>${entropy} bits</strong>.`;
      }
      if (window.renderMathInElement) {
        renderMathInElement(feedbackEl, { delimiters: [{ left: "$", right: "$", display: false }] });
      }
    }
  }

  // Pre-configured constraint buttons
  const btnC1 = document.getElementById("btn-apply-c1");
  const btnC2 = document.getElementById("btn-apply-c2");
  const btnC3 = document.getElementById("btn-apply-c3");
  const btnC4 = document.getElementById("btn-apply-c4");
  const btnReset = document.getElementById("btn-reset-constraints");

  if (btnC1) {
    btnC1.addEventListener("click", () => {
      // Add x0 < x1
      if (!activeConstraints.some(c => c.smaller === 0 && c.larger === 1)) {
        activeConstraints.push({ smaller: 0, larger: 1 });
      }
      evaluatePermutations();
    });
  }

  if (btnC2) {
    btnC2.addEventListener("click", () => {
      // Add x1 < x2
      if (!activeConstraints.some(c => c.smaller === 1 && c.larger === 2)) {
        activeConstraints.push({ smaller: 1, larger: 2 });
      }
      evaluatePermutations();
    });
  }

  if (btnC3) {
    btnC3.addEventListener("click", () => {
      // Add x2 < x3
      if (!activeConstraints.some(c => c.smaller === 2 && c.larger === 3)) {
        activeConstraints.push({ smaller: 2, larger: 3 });
      }
      evaluatePermutations();
    });
  }

  if (btnC4) {
    btnC4.addEventListener("click", () => {
      // Add x3 is smallest: x3 < x0, x3 < x1, x3 < x2
      activeConstraints = [
        { smaller: 3, larger: 0 },
        { smaller: 3, larger: 1 },
        { smaller: 3, larger: 2 }
      ];
      evaluatePermutations();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      activeConstraints = [];
      evaluatePermutations();
    });
  }

  evaluatePermutations();
}

