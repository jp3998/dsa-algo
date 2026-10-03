(function () {
  "use strict";

  var TAGS = [
    { key: "proof", label: "proof", meaning: "a guarantee, valid under the stated assumptions." },
    { key: "proofsketch", label: "proof sketch", meaning: "the key steps of a proof; details omitted." },
    { key: "intuition", label: "intuition", meaning: "a reason to expect something; not a guarantee." },
    { key: "empirical", label: "empirical", meaning: "measured on particular inputs; can change with them." },
    { key: "heuristic", label: "heuristic", meaning: "a design choice that usually helps; no guarantee." },
  ];

  var LESSONS = [
    [0, "What does it mean for things to be in order?", "Relations, orders, and what exactly the sorting problem asks."],
    [1, "How many questions does it take to be sure?", "Checking an order, finding an extreme, and why knowing an answer differs from proving it."],
    [2, "What happens if we repeatedly take the smallest?", "A first complete strategy, its exact cost, and the information it throws away."],
    [3, "How far is an array from sorted, and what does a local fix buy?", "Measuring disorder, and the price of repairing it one neighbour at a time."],
    [4, "Is knowing the order the same as moving into it?", "Separating the cost of learning from the cost of rearranging."],
    [5, "Is there a floor under every comparison-based method?", "Counting what any algorithm must learn, whatever it does."],
    [6, "Can elements travel far without giving up local repair?", "Long-range moves, and an honest mix of theory and experiment."],
    [7, "What if we split the problem by position?", "Combining solved halves, and where the logarithm comes from."],
    [8, "What if we split it by value instead?", "Randomness, expectation, and a worst case that must be guarded against."],
    [9, "How much order do we actually need?", "When a full sort is more work than the question requires."],
    [10, "Can we keep what we have already learned?", "Maintaining partial knowledge cheaply."],
    [11, "Three roads to $n \\log n$: what actually differs?", "Same growth rate, different ideas."],
    [12, "What if keys are more than opaque objects?", "Changing the model, and why \"linear time\" always comes with conditions."],
    [13, "How much uncertainty does the input really carry?", "Duplicates, presortedness, and how Python's own sort exploits them."],
    [14, "What lies beyond a single total order?", "Partial orders, chains and antichains."],
    [15, "What changes outside the idealised machine?", "Memory hierarchies, disks, and comparisons fixed in advance."],
    [16, "What is the shape of the whole?", "Building the complete mental model."],
  ];

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ---- tag legend ----
  var legend = document.getElementById("tag-legend");
  TAGS.forEach(function (t) {
    var row = el("div", "tag-legend-row");
    var tag = el("span", "tag tag-" + t.key);
    tag.textContent = t.label;
    var meaning = el("span", "meaning");
    meaning.textContent = t.meaning;
    row.appendChild(tag);
    row.appendChild(meaning);
    legend.appendChild(row);
  });

  // ---- lesson list ----
  var list = document.getElementById("lesson-list");
  LESSONS.forEach(function (l) {
    var num = l[0], title = l[1], line = l[2];
    var available = num === 3;
    var row = el("div", "lesson-row " + (available ? "available" : "pending"));

    var numEl = el("div", "lesson-num");
    numEl.textContent = String(num).padStart(2, "0");

    var mid = el("div", "");
    var titleEl;
    if (available) {
      titleEl = document.createElement("a");
      titleEl.href = "lesson-03.html";
      titleEl.className = "lesson-title plain";
    } else {
      titleEl = el("div", "lesson-title");
    }
    titleEl.innerHTML = title;
    var lineEl = el("div", "lesson-line");
    lineEl.innerHTML = line;
    mid.appendChild(titleEl);
    mid.appendChild(lineEl);

    var status = el("div", "lesson-status " + (available ? "available" : "pending"));
    status.textContent = available ? "Available" : "Not yet written";

    row.appendChild(numEl);
    row.appendChild(mid);
    row.appendChild(status);
    list.appendChild(row);
  });

  // KaTeX render
  document.addEventListener("DOMContentLoaded", function () {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } catch (e) {
      /* no-op */
    }
  });
  if (document.readyState !== "loading") {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } catch (e) {}
  }
})();
