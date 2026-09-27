/* ==========================================================================
   CHAPTER 07: DERIVATION OF BUBBLE SORT
   Scientific demonstration logic:
   - Micro-step execution of Bubble Sort (comparing, swapping, advancing j, advancing i)
   - Real-time inversion counter: sum_{i < j} [A[i] > A[j]]
   - Live visual partitioning: Unsorted prefix vs Settled sorted suffix
   - Early-exit adaptive flag monitoring
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

  // 3. Initialize Interactive Bubble Sort Inspector
  initBubbleSortLab();
});

function initBubbleSortLab() {
  const container = document.getElementById("bubble-array-container");
  const btnStep = document.getElementById("btn-bubble-step");
  const btnPass = document.getElementById("btn-bubble-pass");
  const btnReset = document.getElementById("btn-bubble-reset");
  const readout = document.getElementById("bubble-status-readout");

  const metricComp = document.getElementById("metric-bubble-comp");
  const metricSwaps = document.getElementById("metric-bubble-swaps");
  const metricInversions = document.getElementById("metric-bubble-inv");
  const metricSuffix = document.getElementById("metric-bubble-suffix");
  const metricFlag = document.getElementById("metric-bubble-flag");

  if (!container || !btnStep || !btnReset) return;

  const initialArray = [42, 17, 85, 23, 9, 54, 31];
  let arr = [...initialArray];
  const n = arr.length;

  let i = 0; // Outer pass: i largest elements settled at A[n-i...n-1]
  let j = 0; // Inner index: comparing arr[j] and arr[j+1]
  let comparisons = 0;
  let swaps = 0;
  let passHadSwap = false;
  let isDone = false;
  let subState = "COMPARE"; // "COMPARE" -> "SWAPPED_OR_NOT"

  function countInversions(a) {
    let inv = 0;
    for (let p = 0; p < a.length; p++) {
      for (let q = p + 1; q < a.length; q++) {
        if (a[p] > a[q]) inv++;
      }
    }
    return inv;
  }

  function render(activeJ = -1, justSwapped = false) {
    container.innerHTML = "";
    const settledStart = n - i;

    for (let idx = 0; idx < n; idx++) {
      const cell = document.createElement("div");
      cell.className = "sci-cell";

      if (idx >= settledStart || isDone) {
        cell.classList.add("sorted");
      } else if (idx === activeJ || idx === activeJ + 1) {
        cell.classList.add("active");
        if (justSwapped) {
          cell.style.borderColor = "var(--accent-crimson)";
        }
      }

      cell.innerHTML = `
        <div class="val">${arr[idx]}</div>
        <div class="idx" style="font-size: 10px; color: var(--ink-muted);">A[${idx}]</div>
      `;
      container.appendChild(cell);
    }

    // Update Metrics
    if (metricComp) metricComp.textContent = comparisons;
    if (metricSwaps) metricSwaps.textContent = swaps;
    const invCount = countInversions(arr);
    if (metricInversions) {
      metricInversions.textContent = `${invCount} remaining`;
      metricInversions.style.color = (invCount === 0) ? "var(--accent-forest)" : "var(--accent-crimson)";
    }
    if (metricSuffix) {
      const settledCount = isDone ? n : i;
      metricSuffix.textContent = `${settledCount} elements (A[${n - settledCount}..${n-1}])`;
    }
    if (metricFlag) {
      if (isDone && !passHadSwap && i < n - 1) {
        metricFlag.innerHTML = '<span style="color:var(--accent-forest); font-weight:700;">TRUE (Early Exit Triggered!)</span>';
      } else {
        metricFlag.textContent = passHadSwap ? "Swaps occurred this pass" : "No swaps yet this pass";
      }
    }

    if (btnStep) {
      btnStep.disabled = isDone;
      btnStep.textContent = isDone ? "Array Fully Sorted" : "Execute Next Micro-Step";
    }
    if (btnPass) {
      btnPass.disabled = isDone;
    }
  }

  function step() {
    if (isDone) return;

    const limit = n - i - 1; // Last index j can compare: j and j+1 <= n-i-1

    if (subState === "COMPARE") {
      comparisons++;
      if (arr[j] > arr[j + 1]) {
        // Must swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swaps++;
        passHadSwap = true;

        if (readout) {
          readout.innerHTML = `
            <strong>Inversion Detected:</strong> $A[${j}] = ${arr[j+1]} > A[${j+1}] = ${arr[j]}$.<br/>
            • <strong>Action:</strong> Performed adjacent swap. Inversion count decreased by 1!<br/>
            • Active element <code>${arr[j+1]}</code> is bubbled to position $A[${j+1}]$.
          `;
        }
        render(j, true);
        subState = "ADVANCE";
      } else {
        // No swap needed
        if (readout) {
          readout.innerHTML = `
            <strong>Order Invariant Satisfied:</strong> $A[${j}] = ${arr[j]} \\le A[${j+1}] = ${arr[j+1]}$.<br/>
            • <strong>Action:</strong> No swap needed. Adjacent pair is in correct relative order.<br/>
            • Active hand advances without mutation.
          `;
        }
        render(j, false);
        subState = "ADVANCE";
      }
    } else {
      // ADVANCE to next j or next pass
      j++;
      if (j >= limit) {
        // Pass completed!
        i++;
        if (!passHadSwap || i >= n - 1) {
          isDone = true;
          if (readout) {
            readout.innerHTML = `
              <strong>Sorting Terminated:</strong><br/>
              • ${!passHadSwap ? "<strong>Early-Exit Optimization:</strong> Full pass completed with 0 swaps! Array is already in perfect order." : `All ${n-1} passes completed.`}<br/>
              • Inversion count is 0 $\\implies$ <strong>Postcondition Satisfied!</strong>
            `;
          }
          render();
          return;
        } else {
          // Start new pass
          j = 0;
          passHadSwap = false;
          if (readout) {
            readout.innerHTML = `
              <strong>Pass ${i} Complete:</strong> Element $A[${n-i}]$ is now permanently settled in its final sorted position.<br/>
              • Starting Pass ${i + 1} on unsorted prefix $A[0 \\dots ${n - i - 1}]$.
            `;
          }
        }
      }
      subState = "COMPARE";
      render(j, false);
    }

    if (window.renderMathInElement && readout) {
      renderMathInElement(readout, { delimiters: [{ left: "$", right: "$", display: false }] });
    }
  }

  function completePass() {
    if (isDone) return;
    const currentPass = i;
    while (!isDone && i === currentPass) {
      step();
    }
  }

  function reset() {
    arr = [...initialArray];
    i = 0;
    j = 0;
    comparisons = 0;
    swaps = 0;
    passHadSwap = false;
    isDone = false;
    subState = "COMPARE";
    if (readout) {
      readout.innerHTML = `
        <strong>Initialization:</strong> Array has ${countInversions(arr)} inversions. Unsorted prefix spans $A[0 \\dots ${n-1}]$.<br/>
        Click "Execute Next Micro-Step" to trace comparisons and adjacent transpositions.
      `;
      if (window.renderMathInElement) {
        renderMathInElement(readout, { delimiters: [{ left: "$", right: "$", display: false }] });
      }
    }
    render();
  }

  btnStep.addEventListener("click", step);
  btnPass.addEventListener("click", completePass);
  btnReset.addEventListener("click", reset);

  reset();
}

