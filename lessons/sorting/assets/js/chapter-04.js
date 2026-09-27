/* ==========================================================================
   CHAPTER 04: COMPARISONS AS INFORMATION & THE DECISION TREE MODEL
   Scientific demonstration logic:
   - Complete binary decision tree for n = 3 elements
   - Dynamic path tracing based on user input values [a, b, c]
   - Node-by-node state tracking of remaining permutations
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

  // 3. Initialize Decision Tree Lab
  initDecisionTreeLab();
});

function initDecisionTreeLab() {
  // Decision tree structure for n=3 sorting [a, b, c]
  // Root: compare a : b
  // Node 1 (if a < b): compare b : c
  //   Node 1L (if b < c): leaf [a, b, c]
  //   Node 1R (if b > c): compare a : c
  //     Node 1RL (if a < c): leaf [a, c, b]
  //     Node 1RR (if a > c): leaf [c, a, b]
  // Node 2 (if a > b): compare a : c
  //   Node 2L (if a < c): leaf [b, a, c]
  //   Node 2R (if a > c): compare b : c
  //     Node 2RL (if b < c): leaf [b, c, a]
  //     Node 2RR (if b > c): leaf [c, b, a]

  let aVal = 14;
  let bVal = 5;
  let cVal = 23;

  const inputA = document.getElementById("tree-input-a");
  const inputB = document.getElementById("tree-input-b");
  const inputC = document.getElementById("tree-input-c");
  const btnRunTree = document.getElementById("btn-run-tree");
  const btnShuffleInputs = document.getElementById("btn-shuffle-tree");
  const pathReadout = document.getElementById("tree-path-readout");

  function highlightEdge(edgeId, labelId) {
    const edge = document.getElementById(edgeId);
    if (edge) edge.classList.add("active-edge");
    const label = document.getElementById(labelId);
    if (label) label.classList.add("active-label");
  }

  function evaluatePath() {
    aVal = parseFloat(inputA.value) || 0;
    bVal = parseFloat(inputB.value) || 0;
    cVal = parseFloat(inputC.value) || 0;

    // Reset visual highlights
    document.querySelectorAll(".tree-node").forEach((node) => {
      node.classList.remove("active-path", "active-leaf");
    });
    document.querySelectorAll(".tree-svg-edge").forEach((el) => {
      el.classList.remove("active-edge");
    });
    document.querySelectorAll(".tree-edge-label").forEach((el) => {
      el.classList.remove("active-label");
    });

    const path = [];
    let comparisonsDone = 0;

    // Step 1: Compare a : b (Root)
    const root = document.getElementById("node-root");
    if (root) root.classList.add("active-path");
    comparisonsDone++;

    if (aVal < bVal) {
      path.push("a < b");
      highlightEdge("edge-root-bc", "label-root-bc");

      // Step 2: Compare b : c
      const nodeB_C = document.getElementById("node-bc-left");
      if (nodeB_C) nodeB_C.classList.add("active-path");
      comparisonsDone++;

      if (bVal < cVal) {
        path.push("b < c");
        highlightEdge("edge-bc-abc", "label-bc-abc");

        // Leaf: [a, b, c]
        const leaf = document.getElementById("leaf-abc");
        if (leaf) leaf.classList.add("active-leaf");
        finalizePath(path, "[a, b, c]", comparisonsDone);
      } else {
        path.push("b > c");
        highlightEdge("edge-bc-ac", "label-bc-ac");

        // Step 3: Compare a : c
        const nodeA_C = document.getElementById("node-ac-left");
        if (nodeA_C) nodeA_C.classList.add("active-path");
        comparisonsDone++;

        if (aVal < cVal) {
          path.push("a < c");
          highlightEdge("edge-acleft-acb", "label-acleft-acb");

          // Leaf: [a, c, b]
          const leaf = document.getElementById("leaf-acb");
          if (leaf) leaf.classList.add("active-leaf");
          finalizePath(path, "[a, c, b]", comparisonsDone);
        } else {
          path.push("a > c");
          highlightEdge("edge-acleft-cab", "label-acleft-cab");

          // Leaf: [c, a, b]
          const leaf = document.getElementById("leaf-cab");
          if (leaf) leaf.classList.add("active-leaf");
          finalizePath(path, "[c, a, b]", comparisonsDone);
        }
      }
    } else {
      path.push("a > b");
      highlightEdge("edge-root-ac", "label-root-ac");

      // Step 2: Compare a : c
      const nodeA_C = document.getElementById("node-ac-right");
      if (nodeA_C) nodeA_C.classList.add("active-path");
      comparisonsDone++;

      if (aVal < cVal) {
        path.push("a < c");
        highlightEdge("edge-ac-bac", "label-ac-bac");

        // Leaf: [b, a, c]
        const leaf = document.getElementById("leaf-bac");
        if (leaf) leaf.classList.add("active-leaf");
        finalizePath(path, "[b, a, c]", comparisonsDone);
      } else {
        path.push("a > c");
        highlightEdge("edge-ac-bc", "label-ac-bc");

        // Step 3: Compare b : c
        const nodeB_C = document.getElementById("node-bc-right");
        if (nodeB_C) nodeB_C.classList.add("active-path");
        comparisonsDone++;

        if (bVal < cVal) {
          path.push("b < c");
          highlightEdge("edge-bcright-bca", "label-bcright-bca");

          // Leaf: [b, c, a]
          const leaf = document.getElementById("leaf-bca");
          if (leaf) leaf.classList.add("active-leaf");
          finalizePath(path, "[b, c, a]", comparisonsDone);
        } else {
          path.push("b > c");
          highlightEdge("edge-bcright-cba", "label-bcright-cba");

          // Leaf: [c, b, a]
          const leaf = document.getElementById("leaf-cba");
          if (leaf) leaf.classList.add("active-leaf");
          finalizePath(path, "[c, b, a]", comparisonsDone);
        }
      }
    }
  }

  function finalizePath(path, result, comparisons) {
    if (!pathReadout) return;
    pathReadout.innerHTML = `
      <strong>Path Trace:</strong> Root (${path[0]}) $\\longrightarrow$ (${path[1]}) ${path[2] ? `$\\longrightarrow$ (${path[2]}) ` : ""}$\\longrightarrow$ <strong>Leaf ${result}</strong>.<br/>
      <strong>Comparisons Performed:</strong> ${comparisons} (out of tree height $h = 3$).<br/>
      <strong>Final Sorted Array:</strong> <code>${result.replace("a", aVal).replace("b", bVal).replace("c", cVal)}</code>.
    `;
    if (window.renderMathInElement) {
      renderMathInElement(pathReadout, { delimiters: [{ left: "$", right: "$", display: false }] });
    }
  }

  if (btnRunTree) {
    btnRunTree.addEventListener("click", evaluatePath);
  }

  if (btnShuffleInputs) {
    btnShuffleInputs.addEventListener("click", () => {
      const vals = [Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1];
      inputA.value = vals[0];
      inputB.value = vals[1];
      inputC.value = vals[2];
      evaluatePath();
    });
  }

  evaluatePath();
}

