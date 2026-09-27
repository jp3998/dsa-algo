/* ==========================================================================
   CHAPTER 01: THE FORMAL SPECIFICATION OF SORTING
   Scientific demonstration logic:
   - Permutation bijection and monotonic order verification
   - Intransitive tournament cycle analysis
   - Stability of multi-attribute records
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

  // 3. Lab 1: Verification of Monotonicity & Multiset Conservation
  initOrderAndPermutationVerifier();

  // 4. Lab 2: Intransitive Tournament Cycle
  initIntransitivityDemo();

  // 5. Lab 3: Stability Verification of Equivalent Keys
  initStabilityVerifier();
});

/* ==========================================================================
   FIGURE 1.1: MONOTONICITY & MULTISET CONSERVATION
   ========================================================================== */
function initOrderAndPermutationVerifier() {
  const inputSequence = [
    { id: 0, val: 17 },
    { id: 1, val: 4 },
    { id: 2, val: 29 },
    { id: 3, val: 4 },
    { id: 4, val: 11 }
  ];

  let currentArray = [...inputSequence];
  let activeIndex = null;

  const originalContainer = document.getElementById("ref-array-row");
  const interactiveContainer = document.getElementById("interactive-array-row");
  const tagOrder = document.getElementById("tag-order-status");
  const tagMultiset = document.getElementById("tag-multiset-status");
  const descOrder = document.getElementById("desc-order-status");
  const descMultiset = document.getElementById("desc-multiset-status");

  function renderRows() {
    // Reference row (static)
    if (originalContainer && originalContainer.children.length === 0) {
      inputSequence.forEach((item, idx) => {
        const cell = document.createElement("div");
        cell.className = "sci-cell static-ref";
        cell.innerHTML = `
          <span class="sci-cell-val">${item.val}</span>
          <span class="sci-cell-sub">A[${idx}]</span>
        `;
        originalContainer.appendChild(cell);
      });
    }

    // Interactive candidate row
    if (!interactiveContainer) return;
    interactiveContainer.innerHTML = "";
    currentArray.forEach((item, idx) => {
      const cell = document.createElement("div");
      cell.className = `sci-cell ${activeIndex === idx ? "selected" : ""}`;
      cell.innerHTML = `
        <span class="sci-cell-val">${item.val}</span>
        <span class="sci-cell-sub">B[${idx}]</span>
      `;
      cell.addEventListener("click", () => {
        if (activeIndex === null) {
          activeIndex = idx;
        } else if (activeIndex === idx) {
          activeIndex = null;
        } else {
          // Perform transposition
          const tmp = currentArray[activeIndex];
          currentArray[activeIndex] = currentArray[idx];
          currentArray[idx] = tmp;
          activeIndex = null;
        }
        renderRows();
      });
      interactiveContainer.appendChild(cell);
    });

    evaluateFormalConditions();
  }

  function evaluateFormalConditions() {
    // Condition 1: Monotonicity (B[i] <= B[i+1])
    let isMonotonic = true;
    let failIdx = -1;
    for (let i = 0; i < currentArray.length - 1; i++) {
      if (currentArray[i].val > currentArray[i + 1].val) {
        isMonotonic = false;
        failIdx = i;
        break;
      }
    }

    // Condition 2: Multiset Equivalence
    const refFrequencies = {};
    inputSequence.forEach((x) => (refFrequencies[x.val] = (refFrequencies[x.val] || 0) + 1));
    const currFrequencies = {};
    currentArray.forEach((x) => (currFrequencies[x.val] = (currFrequencies[x.val] || 0) + 1));

    let isMultisetEqual = true;
    for (const k in refFrequencies) {
      if (refFrequencies[k] !== currFrequencies[k]) {
        isMultisetEqual = false;
        break;
      }
    }
    for (const k in currFrequencies) {
      if (refFrequencies[k] !== currFrequencies[k]) {
        isMultisetEqual = false;
        break;
      }
    }

    // Update readout table
    if (tagOrder && descOrder) {
      if (isMonotonic) {
        tagOrder.className = "status-tag pass";
        tagOrder.textContent = "Satisfied";
        descOrder.textContent = "Monotonic non-decreasing order holds for all indices i in [0, n-2].";
      } else {
        tagOrder.className = "status-tag fail";
        tagOrder.textContent = "Violated";
        descOrder.textContent = `Order violation at index ${failIdx}: B[${failIdx}] = ${currentArray[failIdx].val} > B[${failIdx + 1}] = ${currentArray[failIdx + 1].val}.`;
      }
    }

    if (tagMultiset && descMultiset) {
      if (isMultisetEqual) {
        tagMultiset.className = "status-tag pass";
        tagMultiset.textContent = "Satisfied";
        descMultiset.textContent = "Candidate sequence is a valid bijective permutation π of the input multiset.";
      } else {
        tagMultiset.className = "status-tag fail";
        tagMultiset.textContent = "Violated";
        descMultiset.textContent = "Multiset conservation failed: element frequencies deviate from input sequence A.";
      }
    }
  }

  // Button handlers
  const btnShuffle = document.getElementById("btn-shuffle");
  const btnSort = document.getElementById("btn-sort");
  const btnCorrupt = document.getElementById("btn-corrupt");

  if (btnShuffle) {
    btnShuffle.addEventListener("click", () => {
      currentArray = [...inputSequence].sort(() => Math.random() - 0.5);
      activeIndex = null;
      renderRows();
    });
  }

  if (btnSort) {
    btnSort.addEventListener("click", () => {
      currentArray = [...inputSequence].sort((a, b) => a.val - b.val);
      activeIndex = null;
      renderRows();
    });
  }

  if (btnCorrupt) {
    btnCorrupt.addEventListener("click", () => {
      // Replace an element with 99, violating conservation
      currentArray = [{ id: 99, val: 99 }, ...inputSequence.slice(1)].sort((a, b) => a.val - b.val);
      activeIndex = null;
      renderRows();
    });
  }

  renderRows();
}

/* ==========================================================================
   FIGURE 1.2: INTRANSITIVE TOURNAMENTS
   ========================================================================== */
function initIntransitivityDemo() {
  const container = document.getElementById("cycle-nodes-container");
  const analysisOutput = document.getElementById("cycle-analysis-output");
  if (!container) return;

  const vertices = [
    { name: "Element X", beats: "Element Y" },
    { name: "Element Y", beats: "Element Z" },
    { name: "Element Z", beats: "Element X" }
  ];

  let arrangement = [0, 1, 2];

  function renderCycle() {
    container.innerHTML = "";
    arrangement.forEach((vIdx, pos) => {
      const v = vertices[vIdx];
      const el = document.createElement("div");
      el.className = "cycle-node";
      el.innerHTML = `<span>Position ${pos}: <strong>${v.name}</strong></span>`;
      el.addEventListener("click", () => {
        arrangement.push(arrangement.shift());
        renderCycle();
      });
      container.appendChild(el);
    });

    const v0 = vertices[arrangement[0]];
    const v1 = vertices[arrangement[1]];
    const v2 = vertices[arrangement[2]];

    if (analysisOutput) {
      analysisOutput.innerHTML = `
        <strong>Relation Evaluation:</strong><br/>
        1. ${v0.name} $\\succ$ ${v1.name} (Valid: ${v0.beats === v1.name})<br/>
        2. ${v1.name} $\\succ$ ${v2.name} (Valid: ${v1.beats === v2.name})<br/>
        3. Transitivity would require ${v0.name} $\\succ$ ${v2.name}, but the relation specifies ${v2.name} $\\succ$ ${v0.name}.<br/>
        <em>Conclusion:</em> The relation contains a directed 3-cycle ($C_3$). No linear order / topological sort exists on an intransitive tournament graph.
      `;
      if (window.renderMathInElement) {
        renderMathInElement(analysisOutput, { delimiters: [{ left: "$", right: "$", display: false }] });
      }
    }
  }

  renderCycle();
}

/* ==========================================================================
   FIGURE 1.3: STABILITY OF MULTI-ATTRIBUTE RECORDS
   ========================================================================== */
function initStabilityVerifier() {
  const container = document.getElementById("stability-deck-container");
  const toggleBtn = document.getElementById("btn-toggle-stability");
  const readout = document.getElementById("stability-formal-readout");

  if (!container || !toggleBtn) return;

  let isStable = true;

  function renderStability() {
    container.innerHTML = "";

    const items = isStable
      ? [
          { key: 3, id: "R_3", tag: "α", cls: "tag-alpha" },
          { key: 7, id: "R_1", tag: "α", cls: "tag-alpha" },
          { key: 7, id: "R_4", tag: "β", cls: "tag-beta" },
          { key: 12, id: "R_2", tag: "α", cls: "tag-alpha" }
        ]
      : [
          { key: 3, id: "R_3", tag: "α", cls: "tag-alpha" },
          { key: 7, id: "R_4", tag: "β", cls: "tag-beta" },
          { key: 7, id: "R_1", tag: "α", cls: "tag-alpha" },
          { key: 12, id: "R_2", tag: "α", cls: "tag-alpha" }
        ];

    items.forEach((rec) => {
      const box = document.createElement("div");
      box.className = "record-cell";
      box.innerHTML = `
        <span class="record-key">${rec.key}</span>
        <span class="record-id">${rec.id}</span>
        <span class="record-badge ${rec.cls}">Key: ${rec.key} (${rec.tag})</span>
      `;
      container.appendChild(box);
    });

    if (readout) {
      if (isStable) {
        readout.innerHTML = `
          <strong>Status: Stable Permutation ($\pi_{stable}$)</strong><br/>
          In the original input, $R_1$ appeared before $R_4$ ($\text{Key}(R_1) = \text{Key}(R_4) = 7$, with $\text{idx}(R_1) = 1 < \text{idx}(R_4) = 3$).<br/>
          In the sorted output, $\pi^{-1}(1) < \pi^{-1}(3)$ is preserved. Relative order of equivalent keys is strictly invariant.
        `;
      } else {
        readout.innerHTML = `
          <strong>Status: Unstable Permutation ($\pi_{unstable}$)</strong><br/>
          Although keys satisfy $3 \\le 7 \\le 7 \\le 12$, record $R_4$ was transposed ahead of $R_1$, violating $\\pi^{-1}(1) < \\pi^{-1}(3)$.<br/>
          <em>Implication:</em> Any prior grouping on secondary attributes has been corrupted.
        `;
      }
      if (window.renderMathInElement) {
        renderMathInElement(readout, { delimiters: [{ left: "$", right: "$", display: false }] });
      }
    }
  }

  toggleBtn.addEventListener("click", () => {
    isStable = !isStable;
    toggleBtn.textContent = isStable ? "Display Unstable Permutation Output" : "Display Stable Permutation Output";
    renderStability();
  });

  renderStability();
}
