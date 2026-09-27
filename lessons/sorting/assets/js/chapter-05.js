/* ==========================================================================
   CHAPTER 05: ASYMPTOTIC ANALYSIS OF log2(n!) & THE OMEGA(n log n) LOWER BOUND
   Scientific demonstration logic:
   - High-precision calculation of exact n! (BigInt) and exact log2(n!)
   - Elementary bound, integral bound, and Stirling approximation comparison
   - Real-time asymptotic growth metrics and percentage error analysis
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

  // 3. Initialize Stirling & Lower Bound Lab
  initStirlingLab();
});

function initStirlingLab() {
  const sliderN = document.getElementById("stirling-slider-n");
  const labelN = document.getElementById("stirling-val-n");
  const metricExactPerms = document.getElementById("metric-exact-perms");
  const metricExactBits = document.getElementById("metric-exact-bits");
  const metricElementaryBound = document.getElementById("metric-elementary-bound");
  const metricIntegralBound = document.getElementById("metric-integral-bound");
  const metricStirlingApprox = document.getElementById("metric-stirling-approx");
  const metricStirlingError = document.getElementById("metric-stirling-error");

  if (!sliderN) return;

  // Precomputed exact factorials for 1..50 using BigInt
  function computeFactorialBigInt(n) {
    let res = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
      res *= i;
    }
    return res;
  }

  // Exact log2(n!) = sum_{k=1}^n log2(k)
  function computeExactLog2Factorial(n) {
    let sum = 0;
    for (let k = 1; k <= n; k++) {
      sum += Math.log2(k);
    }
    return sum;
  }

  function updateCalculations() {
    const n = parseInt(sliderN.value, 10);
    if (labelN) labelN.textContent = n;

    // 1. Exact Factorial
    const factBig = computeFactorialBigInt(n);
    let factStr = factBig.toString();
    if (factStr.length > 16) {
      const exp = factStr.length - 1;
      const lead = factStr.slice(0, 5);
      factStr = `${lead[0]}.${lead.slice(1)} × 10^${exp}`;
    }
    if (metricExactPerms) metricExactPerms.textContent = factStr;

    // 2. Exact log2(n!)
    const exactBits = computeExactLog2Factorial(n);
    const ceilBits = Math.ceil(exactBits);
    if (metricExactBits) {
      metricExactBits.innerHTML = `${ceilBits} <span style="font-size:11px; font-weight:normal; color:var(--ink-secondary);">(${exactBits.toFixed(3)} bits)</span>`;
    }

    // 3. Elementary Bound: (n/2) * log2(n/2)
    const elemBits = (n / 2) * Math.log2(n / 2);
    if (metricElementaryBound) {
      metricElementaryBound.textContent = `${elemBits.toFixed(2)} bits`;
    }

    // 4. Integral Lower Bound: (n ln n - n + 1) / ln 2
    const intBits = (n * Math.log(n) - n + 1) / Math.LN2;
    if (metricIntegralBound) {
      metricIntegralBound.textContent = `${intBits.toFixed(2)} bits`;
    }

    // 5. Stirling Approximation:
    // log2(n!) approx n log2(n) - n log2(e) + 0.5 log2(2 pi n)
    const log2e = Math.LOG2E;
    const stirlingBits = n * Math.log2(n) - n * log2e + 0.5 * Math.log2(2 * Math.PI * n);
    if (metricStirlingApprox) {
      metricStirlingApprox.textContent = `${stirlingBits.toFixed(3)} bits`;
    }

    // 6. Percentage Error of Stirling vs Exact log2(n!)
    const errorPct = Math.abs(stirlingBits - exactBits) / exactBits * 100;
    if (metricStirlingError) {
      metricStirlingError.textContent = `${errorPct.toFixed(4)}% error`;
    }
  }

  sliderN.addEventListener("input", updateCalculations);
  updateCalculations();
}

