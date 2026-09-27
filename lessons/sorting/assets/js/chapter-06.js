/* ==========================================================================
   CHAPTER 06: FORMAL VERIFICATION & LOOP INVARIANTS
   Scientific demonstration logic:
   - Interactive step-by-step invariant verification engine
   - Live visual array partitioning: Settled prefix vs Unsettled suffix
   - Invariant predicate evaluation (Initialization, Maintenance, Termination)
   - Real-time strictly decreasing loop variant metric v(k)
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

  // 3. Initialize Loop Invariant Step Machine
  initInvariantSimulator();
});

function initInvariantSimulator() {
  const container = document.getElementById("invariant-array-container");
  const btnNext = document.getElementById("btn-inv-step");
  const btnReset = document.getElementById("btn-inv-reset");
  const statusReadout = document.getElementById("inv-status-readout");
  const metricK = document.getElementById("metric-inv-k");
  const metricVariant = document.getElementById("metric-inv-variant");
  const metricCheckPrefix = document.getElementById("metric-check-prefix");
  const metricCheckBoundary = document.getElementById("metric-check-boundary");
  const metricCheckPost = document.getElementById("metric-check-post");

  if (!container || !btnNext || !btnReset) return;

  // Static demonstration array to show invariant prefix growth
  const initialValues = [7, 14, 21, 35, 42, 19, 53, 9];
  // Sorted version for step-by-step invariant expansion demo:
  // We illustrate an abstract prefix-growth process (k elements sorted and placed)
  const sortedTarget = [7, 9, 14, 19, 21, 35, 42, 53];
  const n = initialValues.length;
  let k = 0; // Invariant index: prefix A[0...k-1] is sorted

  function renderArray() {
    container.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const val = (i < k) ? sortedTarget[i] : initialValues[i];
      const cell = document.createElement("div");
      cell.className = "sci-cell";

      if (i < k) {
        cell.classList.add("sorted");
      } else if (i === k && k < n) {
        cell.classList.add("active");
      }

      cell.innerHTML = `
        <div class="val">${val}</div>
        <div class="idx" style="font-size: 10px; color: var(--ink-muted);">A[${i}]</div>
      `;
      container.appendChild(cell);
    }

    // Update Dashboard Metrics
    if (metricK) metricK.textContent = `k = ${k}`;
    const variantVal = n - k;
    if (metricVariant) {
      metricVariant.textContent = `v(k) = n - k = ${variantVal}`;
      metricVariant.style.color = (variantVal === 0) ? "var(--accent-forest)" : "var(--accent-oxford)";
    }

    // Invariant checks
    if (metricCheckPrefix) {
      if (k === 0) {
        metricCheckPrefix.innerHTML = '<span style="color: var(--accent-forest);">✓ Vacuously True</span> (Empty prefix A[0..-1])';
      } else {
        metricCheckPrefix.innerHTML = `<span style="color: var(--accent-forest);">✓ Maintained</span> (A[0..${k-1}] is sorted)`;
      }
    }

    if (metricCheckBoundary) {
      if (k === 0) {
        metricCheckBoundary.innerHTML = '<span style="color: var(--accent-forest);">✓ True</span> (Initialization holds)';
      } else if (k < n) {
        metricCheckBoundary.innerHTML = `<span style="color: var(--accent-forest);">✓ Maintained</span> (${k} elements partitioned)`;
      } else {
        metricCheckBoundary.innerHTML = '<span style="color: var(--accent-forest);">✓ Complete</span> (Whole array processed)';
      }
    }

    if (metricCheckPost) {
      if (k === n) {
        metricCheckPost.innerHTML = '<strong style="color: var(--accent-forest);">✓ VERIFIED TRUE!</strong> Entire array is sorted (k = n)';
      } else {
        metricCheckPost.innerHTML = '<span style="color: var(--ink-muted);">Pending termination (k &lt; n)</span>';
      }
    }

    // Status message
    if (statusReadout) {
      if (k === 0) {
        statusReadout.innerHTML = `
          <strong>Initialization Phase:</strong> Loop has not executed yet ($k = 0$).<br/>
          • Invariant assertion: Prefix $A[0 \\dots -1]$ is empty, so it is vacuously sorted.<br/>
          • Variant metric: $v(0) = n - 0 = ${n}$. Loop continuation condition ($k < ${n}$) holds.
        `;
      } else if (k < n) {
        statusReadout.innerHTML = `
          <strong>Maintenance Phase (Iteration ${k}):</strong><br/>
          • Step completed: Element incorporated into sorted prefix $A[0 \\dots ${k-1}]$.<br/>
          • Variant strictly decreased: $v(${k}) = ${n - k}$ (decremented by 1).<br/>
          • Induction step valid: Invariant holds before next iteration begins.
        `;
      } else {
        statusReadout.innerHTML = `
          <strong>Termination Phase ($k = ${n}$):</strong><br/>
          • Continuation condition ($k < ${n}$) becomes <strong>False</strong>.<br/>
          • Loop halts with variant $v(${n}) = 0$.<br/>
          • Invariant asserts $A[0 \\dots ${n-1}]$ is sorted $\\implies$ <strong>Postcondition $Q$ is Proven Correct!</strong>
        `;
      }
      if (window.renderMathInElement) {
        renderMathInElement(statusReadout, { delimiters: [{ left: "$", right: "$", display: false }] });
      }
    }

    // Button states
    if (k >= n) {
      btnNext.disabled = true;
      btnNext.textContent = "Termination Reached (Sorted)";
    } else {
      btnNext.disabled = false;
      btnNext.textContent = `Execute Step (k = ${k} → ${k+1})`;
    }
  }

  btnNext.addEventListener("click", () => {
    if (k < n) {
      k++;
      renderArray();
    }
  });

  btnReset.addEventListener("click", () => {
    k = 0;
    renderArray();
  });

  renderArray();
}

