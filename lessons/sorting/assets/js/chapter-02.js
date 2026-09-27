/* ==========================================================================
   CHAPTER 02: WHAT DOES AN ALGORITHM ACTUALLY KNOW?
   Scientific demonstration logic:
   - Poset state space representation
   - Transitive deduction engine (computing transitive closure)
   - Redundancy detector (queries with zero information gain)
   - Linear extensions counter (measuring remaining uncertainty)
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

  // 3. Initialize Interactive Poset Lab
  initPosetLab();
});

/* ==========================================================================
   FIGURE 2.1: THE KNOWLEDGE POSET & TRANSITIVE DEDUCTION ENGINE
   ========================================================================== */
function initPosetLab() {
  // 4 elements with hidden true values:
  // x_0 = 14, x_1 = 4, x_2 = 29, x_3 = 9
  // True sorted order: x_1 (4) < x_3 (9) < x_0 (14) < x_2 (29)
  const elements = [
    { id: 0, label: "x₀", trueVal: 14 },
    { id: 1, label: "x₁", trueVal: 4 },
    { id: 2, label: "x₂", trueVal: 29 },
    { id: 3, label: "x₃", trueVal: 9 }
  ];

  // Adjacency matrix for known relations: direct[i][j] = true iff i < j was directly queried
  let direct = Array.from({ length: 4 }, () => Array(4).fill(false));
  let closure = Array.from({ length: 4 }, () => Array(4).fill(false));

  let selectedFirst = null;
  let comparisonCount = 0;
  let directFactsCount = 0;
  let deducedFactsCount = 0;

  const nodesContainer = document.getElementById("poset-nodes-container");
  const relationsList = document.getElementById("known-relations-list");
  const compCountEl = document.getElementById("metric-comparison-count");
  const directFactsEl = document.getElementById("metric-direct-facts");
  const deducedFactsEl = document.getElementById("metric-deduced-facts");
  const linearExtCountEl = document.getElementById("metric-linear-ext");
  const queryFeedbackEl = document.getElementById("query-feedback-msg");

  function computeTransitiveClosure() {
    closure = direct.map((row) => [...row]);
    // Warshall's algorithm
    for (let k = 0; k < 4; k++) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (closure[i][k] && closure[k][j]) {
            closure[i][j] = true;
          }
        }
      }
    }

    // Count direct vs deduced
    let dCount = 0;
    let totalKnown = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (direct[i][j]) dCount++;
        if (closure[i][j]) totalKnown++;
      }
    }
    directFactsCount = dCount;
    deducedFactsCount = totalKnown - dCount;
  }

  // Generate all 24 permutations of [0, 1, 2, 3] and filter by closure
  function countLinearExtensions() {
    const perms = [];
    function permute(arr, current = []) {
      if (arr.length === 0) {
        perms.push(current);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        permute([...arr.slice(0, i), ...arr.slice(i + 1)], [...current, arr[i]]);
      }
    }
    permute([0, 1, 2, 3]);

    // Check consistency: for each pair (i, j), if closure[i][j] is true,
    // then i must appear before j in the permutation
    let validCount = 0;
    perms.forEach((p) => {
      let consistent = true;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (closure[i][j]) {
            const posI = p.indexOf(i);
            const posJ = p.indexOf(j);
            if (posI > posJ) {
              consistent = false;
              break;
            }
          }
        }
        if (!consistent) break;
      }
      if (consistent) validCount++;
    });

    return validCount;
  }

  function render() {
    computeTransitiveClosure();
    const remainingExtensions = countLinearExtensions();

    // Render nodes
    if (nodesContainer) {
      nodesContainer.innerHTML = "";
      elements.forEach((el) => {
        const btn = document.createElement("div");
        btn.className = `sci-cell ${selectedFirst === el.id ? "selected" : ""}`;
        btn.innerHTML = `
          <span class="sci-cell-val">${el.label}</span>
          <span class="sci-cell-sub">Select</span>
        `;
        btn.addEventListener("click", () => handleNodeClick(el.id));
        nodesContainer.appendChild(btn);
    }

    // Render live SVG graph
    const svgEl = document.getElementById("poset-graph-svg");
    if (svgEl) {
      const coords = [
        { x: 90, y: 65 },
        { x: 230, y: 65 },
        { x: 370, y: 65 },
        { x: 510, y: 65 }
      ];

      let svgHtml = `
        <defs>
          <marker id="arrow-direct" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#111827" />
          </marker>
          <marker id="arrow-deduced" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e3a8a" />
          </marker>
        </defs>
      `;

      // Draw arrows
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (closure[i][j]) {
            const isDirect = direct[i][j];
            const p1 = coords[i];
            const p2 = coords[j];
            const dist = Math.abs(i - j);

            if (dist === 1) {
              // Straight or slightly curved
              const dir = p1.x < p2.x ? 1 : -1;
              const startX = p1.x + dir * 18;
              const endX = p2.x - dir * 18;
              svgHtml += `
                <path d="M ${startX} ${p1.y} L ${endX} ${p2.y}" 
                      fill="none" 
                      stroke="${isDirect ? "#111827" : "#1e3a8a"}" 
                      stroke-width="${isDirect ? "1.8" : "1.4"}" 
                      ${isDirect ? "" : "stroke-dasharray='4,3'"} 
                      marker-end="url(#${isDirect ? "arrow-direct" : "arrow-deduced"})" />
              `;
            } else {
              // Arch over top or under bottom
              const dir = p1.x < p2.x ? 1 : -1;
              const startX = p1.x;
              const endX = p2.x;
              const archY = dir > 0 ? (dist === 2 ? 22 : 10) : (dist === 2 ? 108 : 120);
              svgHtml += `
                <path d="M ${startX} ${p1.y - 14} Q ${(p1.x + p2.x) / 2} ${archY}, ${endX} ${p2.y - 14}" 
                      fill="none" 
                      stroke="${isDirect ? "#111827" : "#1e3a8a"}" 
                      stroke-width="${isDirect ? "1.8" : "1.4"}" 
                      ${isDirect ? "" : "stroke-dasharray='4,3'"} 
                      marker-end="url(#${isDirect ? "arrow-direct" : "arrow-deduced"})" />
              `;
            }
          }
        }
      }

      // Draw vertices over arrows
      elements.forEach((el, idx) => {
        const p = coords[idx];
        const isSel = selectedFirst === el.id;
        svgHtml += `
          <g style="cursor:pointer;" onclick="window.triggerPosetClick(${el.id})">
            <circle cx="${p.x}" cy="${p.y}" r="17" 
                    fill="${isSel ? "#eff6ff" : "#ffffff"}" 
                    stroke="${isSel ? "#1e3a8a" : "#111827"}" 
                    stroke-width="${isSel ? "2.5" : "1.4"}" />
            <text x="${p.x}" y="${p.y + 5}" 
                  font-family="var(--font-mono)" 
                  font-size="12.5" 
                  font-weight="700" 
                  fill="${isSel ? "#1e3a8a" : "#111827"}" 
                  text-anchor="middle">${el.label}</text>
          </g>
        `;
      });

      svgEl.innerHTML = svgHtml;
    }

    // Render relations list
    if (relationsList) {
      relationsList.innerHTML = "";
      let hasAny = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (closure[i][j]) {
            hasAny = true;
            const li = document.createElement("li");
            const isDirect = direct[i][j];
            li.style.marginBottom = "4px";
            li.innerHTML = isDirect
              ? `<strong>${elements[i].label} &lt; ${elements[j].label}</strong> <span style="color:var(--ink-muted);font-size:12px;">(directly compared)</span>`
              : `<span style="color:var(--accent-oxford);font-weight:600;">${elements[i].label} &lt; ${elements[j].label}</span> <span style="color:var(--accent-oxford);font-size:12px;">(deduced by transitivity)</span>`;
            relationsList.appendChild(li);
          }
        }
      }
      if (!hasAny) {
        relationsList.innerHTML = "<li style='color:var(--ink-muted);'>No comparisons performed yet. State is an antichain (zero order information).</li>";
      }
    }

    // Update metrics
    if (compCountEl) compCountEl.textContent = comparisonCount;
    if (directFactsEl) directFactsEl.textContent = directFactsCount;
    if (deducedFactsEl) deducedFactsEl.textContent = deducedFactsCount;
    if (linearExtCountEl) {
      linearExtCountEl.textContent = `${remainingExtensions} of 24 suspects`;
      if (remainingExtensions === 1) {
        linearExtCountEl.innerHTML = `<span style="color:var(--accent-forest);font-weight:700;">1 of 24 (Completely Sorted!)</span>`;
      }
    }
  }

  function handleNodeClick(id) {
    if (selectedFirst === null) {
      selectedFirst = id;
      if (queryFeedbackEl) {
        queryFeedbackEl.innerHTML = `Selected <strong>${elements[id].label}</strong>. Now click a second element to compare.`;
      }
      render();
    } else if (selectedFirst === id) {
      selectedFirst = null;
      if (queryFeedbackEl) {
        queryFeedbackEl.innerHTML = `Selection cleared. Click any element to begin a comparison.`;
      }
      render();
    } else {
      executeComparison(selectedFirst, id);
      selectedFirst = null;
      render();
    }
  }

  window.triggerPosetClick = handleNodeClick;

  function executeComparison(i, j) {
    comparisonCount++;

    // Check if relationship was already known via transitive closure
    const alreadyKnown = closure[i][j] || closure[j][i];
    const trueSmaller = elements[i].trueVal < elements[j].trueVal ? i : j;
    const trueLarger = elements[i].trueVal < elements[j].trueVal ? j : i;

    if (alreadyKnown) {
      if (queryFeedbackEl) {
        queryFeedbackEl.className = "formal-env remark";
        queryFeedbackEl.innerHTML = `
          <strong>Redundant Query!</strong> The relation <em>${elements[trueSmaller].label} &lt; ${elements[trueLarger].label}</em> was <strong>already known via transitivity</strong>.<br/>
          This comparison spent 1 operation but provided <strong>0 bits of new information</strong>. Remaining consistent permutations unchanged.
        `;
      }
      return;
    }

    // Record direct knowledge
    direct[trueSmaller][trueLarger] = true;

    // Check how many linear extensions were eliminated
    const beforeCount = countLinearExtensions();
    computeTransitiveClosure();
    const afterCount = countLinearExtensions();
    const eliminated = beforeCount - afterCount;

    if (queryFeedbackEl) {
      queryFeedbackEl.className = "formal-env remark";
      queryFeedbackEl.innerHTML = `
        <strong>Oracle Answer:</strong> <em>${elements[trueSmaller].label} &lt; ${elements[trueLarger].label}</em>.<br/>
        This comparison eliminated <strong>${eliminated}</strong> inconsistent permutations.
      `;
    }
  }

  // Buttons
  const btnReset = document.getElementById("btn-reset-poset");
  const btnSmartStep = document.getElementById("btn-smart-step");

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      direct = Array.from({ length: 4 }, () => Array(4).fill(false));
      closure = Array.from({ length: 4 }, () => Array(4).fill(false));
      selectedFirst = null;
      comparisonCount = 0;
      directFactsCount = 0;
      deducedFactsCount = 0;
      if (queryFeedbackEl) {
        queryFeedbackEl.innerHTML = `Poset reset to antichain. Click two elements to compare them.`;
      }
      render();
    });
  }

  if (btnSmartStep) {
    btnSmartStep.addEventListener("click", () => {
      // Find an uncompared pair that cuts the remaining linear extensions as evenly as possible
      let bestPair = null;
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (!closure[i][j] && !closure[j][i]) {
            bestPair = [i, j];
            break;
          }
        }
        if (bestPair) break;
      }

      if (bestPair) {
        executeComparison(bestPair[0], bestPair[1]);
        render();
      } else {
        if (queryFeedbackEl) {
          queryFeedbackEl.innerHTML = `<strong>Array is already totally ordered!</strong> All pairs are known.`;
        }
      }
    });
  }

  render();
}

