/* ============================================================
   Theme 03 — "Explorable essay" — engine + components
   ============================================================ */
(function(){
"use strict";

var SC = window.SC = {};

/* ---------------- utilities ---------------- */

function mulberry32(seed){
  var t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    var r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
SC.mulberry32 = mulberry32;

function shuffle(arr, rng){
  var a = arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j = Math.floor(rng()*(i+1));
    var t=a[i]; a[i]=a[j]; a[j]=t;
  }
  return a;
}
SC.shuffle = shuffle;

function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
SC.prefersReducedMotion = prefersReducedMotion;

function harmonic(n){ var h=0; for(var k=1;k<=n;k++) h+=1/k; return h; }
SC.harmonic = harmonic;

function parseArrayInput(str, min, max){
  var raw = String(str||'').trim();
  if(!raw) return {ok:false, error:'Enter some numbers first.'};
  var toks = raw.split(/[\s,]+/).filter(function(s){ return s.length; });
  var nums = [];
  for(var i=0;i<toks.length;i++){
    if(!/^-?\d+$/.test(toks[i])) return {ok:false, error:'Use whole numbers only, separated by commas or spaces.'};
    nums.push(parseInt(toks[i],10));
  }
  if(nums.length < min || nums.length > max) return {ok:false, error:'Enter between '+min+' and '+max+' integers.'};
  var seen = {};
  for(var k=0;k<nums.length;k++){
    if(seen[nums[k]]) return {ok:false, error:'All the numbers must be distinct.'};
    seen[nums[k]] = true;
  }
  return {ok:true, arr: nums};
}
SC.parseArrayInput = parseArrayInput;

function invCount(a){
  var c=0;
  for(var i=0;i<a.length;i++) for(var j=i+1;j<a.length;j++) if(a[i]>a[j]) c++;
  return c;
}
SC.invCount = invCount;

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function toCode(msg){
  // convert `...` spans to <code>, text is otherwise plain
  return escapeHtml(msg).replace(/`([^`]+)`/g, '<code>$1</code>');
}
SC.toCode = toCode;

/* ---------------- gating ---------------- */

SC.openGate = function(id){
  if(!id) return;
  var el = document.getElementById(id);
  if(el) el.classList.add('open');
};

/* ---------------- Python listings ---------------- */

var CLEAN_LINES = [
  'def insertion_sort(a):',
  '    n = len(a)',
  '    for i in range(1, n):',
  '        # invariant: a[0:i] is sorted',
  '        j = i',
  '        while j > 0 and a[j - 1] > a[j]:',
  '            a[j - 1], a[j] = a[j], a[j - 1]  # one inversion fewer',
  '            j -= 1',
  '    return a'
];
var BUGGY_LINES = [
  'def insertion_sort(a):',
  '    n = len(a)',
  '    for i in range(1, n):',
  '        # invariant: a[0:i] is sorted',
  '        j = i',
  '        while j >= 0 and a[j - 1] > a[j]:',
  '            a[j - 1], a[j] = a[j], a[j - 1]',
  '            j -= 1',
  '    return a'
];
SC.PY = {
  insertion: { code: CLEAN_LINES.join('\n'), lines: CLEAN_LINES },
  buggy: { code: BUGGY_LINES.join('\n'), lines: BUGGY_LINES, bugLine: 6 }
};

function highlightPyLine(line){
  var re = /(#.*$)|(\b(?:def|for|in|while|return|and)\b)|(\b\d+\b)|([a-zA-Z_]\w*)(?=\()/g;
  var out = '', last = 0, m;
  while((m = re.exec(line))){
    out += escapeHtml(line.slice(last, m.index));
    if(m[1]) out += '<span class="code-com">'+escapeHtml(m[1])+'</span>';
    else if(m[2]) out += '<span class="code-kw">'+escapeHtml(m[2])+'</span>';
    else if(m[3]) out += '<span class="code-num">'+escapeHtml(m[3])+'</span>';
    else if(m[4]) out += '<span class="code-fn">'+escapeHtml(m[4])+'</span>';
    last = re.lastIndex;
  }
  out += escapeHtml(line.slice(last));
  return out || '&nbsp;';
}

function buildListing(containerEl, lines, opts){
  opts = opts || {};
  containerEl.innerHTML = '';
  lines.forEach(function(line, idx){
    var row = document.createElement('div');
    row.className = 'code-line';
    row.setAttribute('data-line', String(idx+1));
    if(opts.clickable) row.classList.add('bugline');
    var ln = document.createElement('span');
    ln.className = 'code-ln';
    ln.textContent = String(idx+1);
    var code = document.createElement('span');
    code.innerHTML = highlightPyLine(line);
    row.appendChild(ln);
    row.appendChild(code);
    if(opts.clickable){
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      row.addEventListener('click', function(){ opts.onClick(idx+1, row); });
      row.addEventListener('keydown', function(e){
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); opts.onClick(idx+1, row); }
      });
    }
    containerEl.appendChild(row);
  });
}
SC.buildListing = buildListing;

function highlightLine(containerEl, lineNo){
  var rows = containerEl.querySelectorAll('.code-line');
  rows.forEach(function(r){
    r.classList.toggle('hl', Number(r.getAttribute('data-line')) === lineNo);
  });
}
SC.highlightLine = highlightLine;

/* ---------------- insertion-sort engine ---------------- */

function regionsFor(phase, i, keyIdx, n){
  var regions = new Array(n);
  for(var idx=0; idx<n; idx++){
    if(phase === 'start'){
      regions[idx] = idx === 0 ? 'sorted' : 'rest';
    } else if(phase === 'outer'){
      regions[idx] = idx < i ? 'sorted' : (idx === i ? 'key' : 'rest');
    } else if(phase === 'inner'){
      if(idx > i) regions[idx] = 'rest';
      else if(idx === keyIdx) regions[idx] = 'key';
      else regions[idx] = 'sorted';
    } else { // done
      regions[idx] = 'sorted';
    }
  }
  return regions;
}

function genSteps(initial){
  var a = initial.slice();
  var n = a.length;
  var comparisons = 0, swaps = 0;
  var steps = [];

  steps.push({
    kind:'start', line:2, i:null, j:null, array:a.slice(),
    comparisons:comparisons, swaps:swaps, inversions: invCount(a),
    message: 'n = '+n+'. The prefix a[0:1] = ['+a[0]+'] is sorted on its own.',
    regions: regionsFor('start', null, null, n)
  });

  for(var i=1;i<n;i++){
    var j = i;
    steps.push({
      kind:'outer', line:3, i:i, j:j, array:a.slice(),
      comparisons:comparisons, swaps:swaps, inversions: invCount(a),
      message: 'i = '+i+': insert the key a['+i+'] = '+a[i]+' into the sorted prefix a[0:'+i+'].',
      regions: regionsFor('outer', i, j, n)
    });
    var going = true;
    while(going){
      if(j > 0){
        comparisons++;
        var left = a[j-1], right = a[j];
        var isGreater = left > right;
        steps.push({
          kind:'compare', line:6, i:i, j:j, array:a.slice(),
          comparisons:comparisons, swaps:swaps, inversions: invCount(a),
          compareIdx:[j-1,j],
          message: isGreater
            ? 'Is a['+(j-1)+'] = '+left+' > a['+j+'] = '+right+'? Yes, so swap.'
            : 'Is a['+(j-1)+'] = '+left+' > a['+j+'] = '+right+'? No, so the key is in place.',
          regions: regionsFor('inner', i, j, n)
        });
        if(isGreater){
          var tmp=a[j-1]; a[j-1]=a[j]; a[j]=tmp;
          swaps++;
          var invLeft = invCount(a);
          steps.push({
            kind:'swap', line:7, i:i, j:j, array:a.slice(),
            comparisons:comparisons, swaps:swaps, inversions: invLeft,
            swapIdx:[j-1,j],
            message: 'Swap them: one inversion fewer ('+invLeft+' left).',
            regions: regionsFor('inner', i, j-1, n)
          });
          j -= 1;
          steps.push({
            kind:'dec', line:8, i:i, j:j, array:a.slice(),
            comparisons:comparisons, swaps:swaps, inversions: invCount(a),
            message: 'j = '+j+'.',
            regions: regionsFor('inner', i, j, n)
          });
        } else {
          going = false;
        }
      } else {
        steps.push({
          kind:'front', line:6, i:i, j:j, array:a.slice(),
          comparisons:comparisons, swaps:swaps, inversions: invCount(a),
          message: 'j = 0: the key reached the front, so `j > 0` is false and there’s no comparison.',
          regions: regionsFor('inner', i, j, n)
        });
        going = false;
      }
    }
  }

  steps.push({
    kind:'done', line:9, i:n, j:null, array:a.slice(),
    comparisons:comparisons, swaps:swaps, inversions: invCount(a),
    message: 'Done: '+comparisons+' comparisons, '+swaps+' swaps, '+invCount(a)+' inversions left.',
    regions: regionsFor('done', n, null, n)
  });

  return steps;
}
SC.genSteps = genSteps;

function countComparisons(initial){
  var a = initial.slice();
  var comparisons=0, swaps=0;
  for(var i=1;i<a.length;i++){
    var j=i;
    while(j>0){
      comparisons++;
      if(a[j-1] > a[j]){ var t=a[j-1]; a[j-1]=a[j]; a[j]=t; swaps++; j--; }
      else break;
    }
  }
  return {comparisons:comparisons, swaps:swaps};
}
SC.countComparisons = countComparisons;

function pyGet(a, idx){ return idx>=0 ? a[idx] : a[a.length+idx]; }

function buggyInsertion(input){
  var a = input.slice();
  var n = a.length;
  for(var i=1;i<n;i++){
    var j=i;
    while(j>=0 && pyGet(a,j-1) > a[j]){
      var leftIdx = j-1>=0 ? j-1 : a.length-1;
      var t=a[leftIdx]; a[leftIdx]=a[j]; a[j]=t;
      j -= 1;
    }
  }
  return a;
}
SC.buggyInsertion = buggyInsertion;

/* ============================================================
   Term linking: wrap "sorted prefix", "key", "inversion(s)"
   ============================================================ */

function wrapTerms(){
  var scopes = document.querySelectorAll('.term-scope');
  var re = /(sorted prefix)|(\bkey\b)|(\binversions?\b)/g;
  var SKIP = {SCRIPT:1,STYLE:1,CODE:1,PRE:1,BUTTON:1,INPUT:1,SELECT:1,TEXTAREA:1,SVG:1,H2:1,H3:1,FIGCAPTION:1};

  scopes.forEach(function(scope){
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentElement;
        while(p && p !== scope){
          if(SKIP[p.tagName] || p.hasAttribute('data-no-terms') || p.classList.contains('term')) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        if(p === null) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var textNodes = [];
    var n;
    while((n = walker.nextNode())) textNodes.push(n);

    textNodes.forEach(function(node){
      var text = node.nodeValue;
      re.lastIndex = 0;
      if(!re.test(text)) return;
      re.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0, m;
      while((m = re.exec(text))){
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var span = document.createElement('span');
        if(m[1]){ span.className = 'term term-prefix'; }
        else if(m[2]){ span.className = 'term term-key'; }
        else { span.className = 'term term-inversion'; }
        span.textContent = m[0];
        span.setAttribute('tabindex','0');
        frag.appendChild(span);
        last = re.lastIndex;
      }
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  });

  // hover / focus -> highlight relevant figure
  document.querySelectorAll('.term').forEach(function(t){
    var targetId = t.classList.contains('term-inversion') ? 'fig1' : 'fig2';
    var cls = t.classList.contains('term-prefix') ? 'hl-prefix' : (t.classList.contains('term-key') ? 'hl-key' : 'hl-inversions');
    function on(){ var f=document.getElementById(targetId); if(f) f.classList.add(cls); }
    function off(){ var f=document.getElementById(targetId); if(f) f.classList.remove(cls); }
    t.addEventListener('mouseenter', on);
    t.addEventListener('mouseleave', off);
    t.addEventListener('focus', on);
    t.addEventListener('blur', off);
  });
}

/* ============================================================
   Generic predict / question helpers
   ============================================================ */

function wireFeedbackBox(fbBox, key){
  var variants = fbBox.querySelectorAll('.fb-variant');
  var any = false;
  variants.forEach(function(v){
    var show = v.getAttribute('data-match') === key;
    v.style.display = show ? 'block' : 'none';
    if(show) any = true;
  });
  if(!any){
    variants.forEach(function(v){ v.style.display = v.getAttribute('data-match')==='generic' ? 'block' : 'none'; });
  }
  fbBox.classList.add('show');
}

function setupNumeric(rootId, opts){
  opts = opts || {};
  var root = document.getElementById(rootId);
  if(!root) return;
  var input = root.querySelector('.q-input');
  var btn = root.querySelector('.q-check');
  var fb = root.querySelector('.feedback');
  var reveal = root.querySelector('[data-fb-reveal]');
  var skip = root.querySelector('.gate-skip');

  function commit(){
    var raw = input.value.trim();
    if(raw === '' || !/^-?\d+$/.test(raw)) return;
    var correct = Number(raw) === opts.answer;
    fb.classList.remove('fb-correct','fb-wrong');
    fb.classList.add(correct ? 'fb-correct' : 'fb-wrong');
    wireFeedbackBox(fb, correct ? 'correct' : raw);
    if(reveal) reveal.style.display = '';
    if(opts.gateId) SC.openGate(opts.gateId);
    if(opts.onCommit) opts.onCommit(correct);
  }
  if(btn) btn.addEventListener('click', commit);
  if(input) input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
  if(skip) skip.addEventListener('click', function(){
    if(opts.gateId) SC.openGate(opts.gateId);
    if(reveal) reveal.style.display = '';
    if(opts.onCommit) opts.onCommit(null);
  });
}
SC.setupNumeric = setupNumeric;

function setupMC(rootId, opts){
  opts = opts || {};
  var root = document.getElementById(rootId);
  if(!root) return;
  var btns = root.querySelectorAll('.mc-opt');
  var skip = root.querySelector('.gate-skip');

  btns.forEach(function(b){
    b.addEventListener('click', function(){
      btns.forEach(function(x){ x.classList.remove('correct','wrong'); x.setAttribute('aria-pressed','false'); });
      var correct = b.getAttribute('data-correct') === 'true';
      b.classList.add(correct ? 'correct' : 'wrong');
      b.setAttribute('aria-pressed','true');
      var fb = root.querySelector('.feedback[data-for="'+b.getAttribute('data-opt')+'"]');
      root.querySelectorAll('.feedback[data-for]').forEach(function(f){ f.classList.remove('show','fb-correct','fb-wrong'); });
      if(fb){
        fb.classList.add('show', correct ? 'fb-correct':'fb-wrong');
      }
      if(opts.gateId) SC.openGate(opts.gateId);
      if(opts.onCommit) opts.onCommit(correct);
    });
  });
  if(skip) skip.addEventListener('click', function(){
    if(opts.gateId) SC.openGate(opts.gateId);
    if(opts.onCommit) opts.onCommit(null);
  });
}
SC.setupMC = setupMC;

/* ============================================================
   Figure 1 — inversion diagram
   ============================================================ */

function initFig1(){
  var root = document.getElementById('fig1');
  if(!root) return;
  var svg = document.getElementById('fig1-svg');
  var countEl = document.getElementById('fig1-count');
  var hintEl = document.getElementById('fig1-hint');
  var errEl = document.getElementById('fig1-error');
  var input = document.getElementById('fig1-input');

  var state = { array: [4,1,3,5,2] };
  var rng = mulberry32(Date.now() & 0xffffffff);

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs){
    var e = document.createElementNS(NS, tag);
    for(var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function render(){
    var a = state.array;
    var n = a.length;
    var cw = 50, gap = 14;
    var totalW = n*cw + (n-1)*gap;
    var baseY = 118;
    var cellH = 50;
    var pairs = [];
    for(var i=0;i<n;i++) for(var j=i+1;j<n;j++) if(a[i]>a[j]) pairs.push([i,j]);
    var maxSpan = pairs.reduce(function(m,p){ return Math.max(m, p[1]-p[0]); }, 1);
    var archSpace = Math.max(60, maxSpan*26);
    var h = baseY + archSpace + 10;

    svg.setAttribute('viewBox', '0 0 '+Math.max(totalW+20,280)+' '+h);
    svg.innerHTML = '';
    svg.style.width = '100%';
    svg.style.height = 'auto';

    function cx(idx){ return 10 + idx*(cw+gap) + cw/2; }

    pairs.forEach(function(p, pi){
      var span = p[1]-p[0];
      var peak = baseY - 18 - span*22;
      var x1 = cx(p[0]), x2 = cx(p[1]);
      var d = 'M '+x1+' '+(baseY-6)+' Q '+((x1+x2)/2)+' '+peak+' '+x2+' '+(baseY-6);
      var path = el('path', {d:d, class:'inv-arc', tabindex:'0', role:'button',
        'aria-label':'inversion '+a[p[0]]+' and '+a[p[1]]});
      path.addEventListener('mouseenter', function(){ activate(p, path); });
      path.addEventListener('mouseleave', deactivate);
      path.addEventListener('focus', function(){ activate(p, path); });
      path.addEventListener('blur', deactivate);
      path.addEventListener('click', function(){ activate(p, path); });
      svg.appendChild(path);
    });

    var cellRects = [];
    for(var idx=0; idx<n; idx++){
      var x = 10 + idx*(cw+gap);
      var rect = el('rect', {x:x, y:baseY, width:cw, height:cellH, rx:6, ry:6, class:'inv-cell-rect'});
      var text = el('text', {x:x+cw/2, y:baseY+cellH/2+5, 'text-anchor':'middle', class:'inv-cell-label'});
      text.textContent = a[idx];
      svg.appendChild(rect);
      svg.appendChild(text);
      cellRects.push(rect);
    }

    function activate(p, pathEl){
      svg.querySelectorAll('.inv-arc').forEach(function(ar){ ar.classList.remove('active'); });
      if(pathEl) pathEl.classList.add('active');
      cellRects.forEach(function(r,i2){ r.classList.toggle('active', i2===p[0]||i2===p[1]); });
      hintEl.innerHTML = '<b>('+a[p[0]]+', '+a[p[1]]+')</b>: '+a[p[0]]+' comes first but is larger.';
    }
    function deactivate(){
      svg.querySelectorAll('.inv-arc').forEach(function(ar){ ar.classList.remove('active'); });
      cellRects.forEach(function(r){ r.classList.remove('active'); });
      hintEl.innerHTML = '&nbsp;';
    }

    countEl.textContent = pairs.length;
  }

  function setArray(arr){ state.array = arr; render(); }

  document.getElementById('fig1-apply').addEventListener('click', function(){
    var res = parseArrayInput(input.value, 2, 10);
    if(!res.ok){ errEl.textContent = res.error; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    setArray(res.arr);
  });
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('fig1-apply').click(); } });

  document.getElementById('fig1-shuffle').addEventListener('click', function(){
    rng = mulberry32((Date.now()^Math.floor(Math.random()*1e9))&0xffffffff);
    setArray(shuffle(state.array, rng));
  });
  document.getElementById('fig1-reverse').addEventListener('click', function(){
    setArray(state.array.slice().reverse());
  });
  document.getElementById('fig1-sort').addEventListener('click', function(){
    setArray(state.array.slice().sort(function(a,b){return a-b;}));
  });

  render();
}

/* ============================================================
   Figure 2 — stepper, tied to Listing 1
   ============================================================ */

function initFig2(){
  var root = document.getElementById('fig2');
  if(!root) return;
  var cellsEl = document.getElementById('fig2-cells');
  var varsEl = document.getElementById('fig2-vars');
  var msgEl = document.getElementById('fig2-message');
  var cmpEl = document.getElementById('fig2-comparisons');
  var swpEl = document.getElementById('fig2-swaps');
  var invEl = document.getElementById('fig2-inversions');
  var scrub = document.getElementById('fig2-scrub');
  var playBtn = document.getElementById('fig2-play');
  var backBtn = document.getElementById('fig2-back');
  var fwdBtn = document.getElementById('fig2-fwd');
  var resetBtn = document.getElementById('fig2-reset');
  var speedSel = document.getElementById('fig2-speed');
  var errEl = document.getElementById('fig2-error');
  var customInput = document.getElementById('fig2-custom');

  var listingEl = document.getElementById('listing1-code');
  buildListing(listingEl, SC.PY.insertion.lines, {clickable:false});

  var SPEEDS = {slow:1200, normal:700, fast:300};
  var st = { steps: [], idx: 0, playing:false, timer:null, array:[4,1,3,5,2] };

  function cellSize(){ return 52+8; }

  function renderCells(step){
    var arr = step.array;
    if(cellsEl.children.length !== arr.length){
      cellsEl.innerHTML = '';
      for(var k=0;k<arr.length;k++){
        var c = document.createElement('div');
        c.className = 'step-cell';
        cellsEl.appendChild(c);
      }
    }
    for(var i=0;i<arr.length;i++){
      var cell = cellsEl.children[i];
      cell.textContent = arr[i];
      cell.setAttribute('data-region', step.regions[i]);
      cell.classList.remove('cmp');
      cell.setAttribute('data-idx', i);
      var tagEl = cell.querySelector('.tag-mini');
      if(step.regions[i]==='key'){
        if(!tagEl){ tagEl=document.createElement('span'); tagEl.className='tag-mini'; cell.appendChild(tagEl); }
        tagEl.textContent='key';
      } else if(tagEl){ tagEl.remove(); }
    }
    if(step.compareIdx){
      step.compareIdx.forEach(function(ix){ cellsEl.children[ix].classList.add('cmp'); });
    }
  }

  function animateSwap(step, after){
    if(prefersReducedMotion()){ after(); return; }
    var a = step.swapIdx[0], b = step.swapIdx[1];
    var cellA = cellsEl.children[a], cellB = cellsEl.children[b];
    if(!cellA || !cellB){ after(); return; }
    var delta = cellA.getBoundingClientRect().width + 8;
    cellA.style.transition = 'transform '+300+'ms ease-in-out';
    cellB.style.transition = 'transform '+300+'ms ease-in-out';
    cellA.style.transform = 'translateX('+delta+'px)';
    cellB.style.transform = 'translateX(-'+delta+'px)';
    setTimeout(function(){
      cellA.style.transition = '';
      cellB.style.transition = '';
      cellA.style.transform = '';
      cellB.style.transform = '';
      after();
    }, 300);
  }

  function render(skipAnim){
    var step = st.steps[st.idx];
    var prev = st.steps[st.idx-1];
    var doAnim = !skipAnim && prev && step.kind === 'swap';
    function paint(){
      renderCells(step);
      varsEl.textContent = 'i = '+(step.i===null?'—':step.i)+' · j = '+(step.j===null?'—':step.j);
      msgEl.innerHTML = toCode(step.message);
      cmpEl.textContent = step.comparisons;
      swpEl.textContent = step.swaps;
      invEl.textContent = step.inversions;
      scrub.value = st.idx;
      highlightLine(listingEl, step.line);
    }
    if(doAnim){ renderCells(prev); animateSwap(step, paint); }
    else paint();
  }

  function goto(idx, skipAnim){
    st.idx = Math.max(0, Math.min(st.steps.length-1, idx));
    render(skipAnim);
  }

  function stop(){
    st.playing = false;
    clearInterval(st.timer);
    playBtn.textContent = '▶ Play';
  }

  function play(){
    if(st.idx >= st.steps.length-1) st.idx = 0;
    st.playing = true;
    playBtn.textContent = '⏸ Pause';
    clearInterval(st.timer);
    var ms = SPEEDS[speedSel.value] || 700;
    st.timer = setInterval(function(){
      if(st.idx >= st.steps.length-1){ stop(); return; }
      st.idx++;
      render(false);
    }, ms);
  }

  function setArray(arr){
    stop();
    st.array = arr;
    st.steps = genSteps(arr);
    scrub.max = st.steps.length-1;
    goto(0, true);
  }

  playBtn.addEventListener('click', function(){ st.playing ? stop() : play(); });
  backBtn.addEventListener('click', function(){ stop(); goto(st.idx-1); });
  fwdBtn.addEventListener('click', function(){ stop(); goto(st.idx+1); });
  resetBtn.addEventListener('click', function(){ stop(); goto(0, true); });
  scrub.addEventListener('input', function(){ stop(); goto(Number(scrub.value), true); });
  speedSel.addEventListener('change', function(){ if(st.playing){ stop(); play(); } });

  root.querySelectorAll('.preset-btn').forEach(function(b){
    b.addEventListener('click', function(){
      root.querySelectorAll('.preset-btn').forEach(function(x){ x.classList.remove('active'); });
      b.classList.add('active');
      var preset = b.getAttribute('data-preset');
      var rng = mulberry32((Date.now()^Math.floor(Math.random()*1e9))&0xffffffff);
      var arr;
      if(preset==='example') arr=[4,1,3,5,2];
      else if(preset==='random') arr=shuffle([1,2,3,4,5,6,7,8], rng);
      else if(preset==='sorted') arr=[1,2,3,4,5,6,7,8];
      else if(preset==='reversed') arr=[8,7,6,5,4,3,2,1];
      else { // nearly sorted
        arr=[1,2,3,4,5,6,7,8];
        for(var s=0;s<2;s++){ var p=Math.floor(rng()*7); var t=arr[p]; arr[p]=arr[p+1]; arr[p+1]=t; }
      }
      errEl.style.display='none';
      setArray(arr);
    });
  });

  document.getElementById('fig2-apply').addEventListener('click', function(){
    var res = parseArrayInput(customInput.value, 2, 12);
    if(!res.ok){ errEl.textContent = res.error; errEl.style.display=''; return; }
    errEl.style.display='none';
    root.querySelectorAll('.preset-btn').forEach(function(x){ x.classList.remove('active'); });
    setArray(res.arr);
  });
  customInput.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('fig2-apply').click(); } });

  document.addEventListener('keydown', function(e){
    var tag = document.activeElement && document.activeElement.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
    if(!root.closest) return;
    if(e.key===' '){ e.preventDefault(); st.playing?stop():play(); }
    else if(e.key==='ArrowRight'){ e.preventDefault(); stop(); goto(st.idx+1); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); stop(); goto(st.idx-1); }
  });

  document.getElementById('listing1-copy').addEventListener('click', function(){
    var ta = document.createElement('textarea');
    ta.value = SC.PY.insertion.code;
    ta.style.position='fixed'; ta.style.left='-9999px';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    var copyBtn = document.getElementById('listing1-copy');
    var old = copyBtn.textContent;
    copyBtn.textContent = 'Copied';
    setTimeout(function(){ copyBtn.textContent = old; }, 1200);
  });

  root.querySelector('[data-preset="example"]').classList.add('active');
  setArray([4,1,3,5,2]);
}

/* ============================================================
   Figure 3 — cost plot
   ============================================================ */

function initFig3(){
  var root = document.getElementById('fig3');
  if(!root) return;
  var svg = document.getElementById('fig3-svg');
  var readout = document.getElementById('fig3-readout');
  var resampleBtn = document.getElementById('fig3-resample');

  var NS='http://www.w3.org/2000/svg';
  function el(tag, attrs){ var e=document.createElementNS(NS,tag); for(var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  var ns = []; for(var n=2;n<=40;n+=2) ns.push(n);
  var W=660, H=340, padL=46, padR=14, padT=14, padB=34;
  var plotW = W-padL-padR, plotH = H-padT-padB;
  var yMax = 40*39/2; // worst case at n=40

  function xScale(n){ return padL + (n-2)/(40-2)*plotW; }
  function yScale(v){ return padT + plotH - (v/yMax)*plotH; }

  var seed = 20260101;
  var data = [];

  function sample(){
    var rng = mulberry32(seed);
    data = ns.map(function(n){
      var sum=0, min=Infinity, max=-Infinity;
      for(var s=0;s<200;s++){
        var arr = shuffle(Array.from({length:n}, function(_,i){return i+1;}), rng);
        var c = countComparisons(arr).comparisons;
        sum += c; if(c<min) min=c; if(c>max) max=c;
      }
      return { n:n, mean: sum/200, min:min, max:max };
    });
  }

  function render(){
    svg.innerHTML = '';
    var narrow = window.innerWidth < 480;

    // gridlines
    var gridStep = 150;
    for(var gv=0; gv<=yMax; gv+=gridStep){
      var gy = yScale(gv);
      svg.appendChild(el('line', {x1:padL,x2:W-padR,y1:gy,y2:gy,class:'plot-grid'}));
      var gt = el('text', {x:padL-8, y:gy+4, 'text-anchor':'end', class:'plot-tick'});
      gt.textContent = gv;
      svg.appendChild(gt);
    }
    svg.appendChild(el('line', {x1:padL,x2:padL,y1:padT,y2:H-padB, class:'plot-axis-line'}));
    svg.appendChild(el('line', {x1:padL,x2:W-padR,y1:H-padB,y2:H-padB, class:'plot-axis-line'}));

    ns.forEach(function(n, i){
      if(narrow && n % 8 !== 0 && n!==2 && n!==40) return;
      var tx = el('text', {x:xScale(n), y:H-padB+16, 'text-anchor':'middle', class:'plot-tick'});
      tx.textContent = n;
      svg.appendChild(tx);
    });

    function curvePath(fn){
      var d='';
      for(var i=0;i<=76;i++){
        var n = 2 + i*(38/76);
        var x=xScale(n), y=yScale(fn(n));
        d += (i===0?'M':'L')+x.toFixed(1)+' '+y.toFixed(1)+' ';
      }
      return d;
    }
    var bestFn = function(n){ return n-1; };
    var avgFn = function(n){ return n*(n-1)/4 + n - harmonic(n); };
    var worstFn = function(n){ return n*(n-1)/2; };

    svg.appendChild(el('path', {d:curvePath(bestFn), class:'plot-curve plot-curve-best'}));
    svg.appendChild(el('path', {d:curvePath(avgFn), class:'plot-curve plot-curve-avg'}));
    svg.appendChild(el('path', {d:curvePath(worstFn), class:'plot-curve plot-curve-worst'}));

    function label(text, val, cls){
      var t = el('text', {x:W-padR+2, y:yScale(val)+4, class:'plot-label '+cls});
      t.textContent = text;
      svg.appendChild(t);
    }
    label('worst', worstFn(40), 'plot-curve-worst');
    label('average', avgFn(40), 'plot-curve-avg');
    label('best', bestFn(40), 'plot-curve-best');

    data.forEach(function(d){
      var x = xScale(d.n);
      svg.appendChild(el('line', {x1:x,x2:x,y1:yScale(d.min),y2:yScale(d.max), class:'plot-range'}));
      var dot = el('circle', {cx:x, cy:yScale(d.mean), r:3.4, class:'plot-dot', tabindex:'0', role:'button',
        'aria-label':'n = '+d.n+' mean '+d.mean.toFixed(1)});
      function show(){
        readout.textContent = 'n = '+d.n+': mean '+d.mean.toFixed(1)+' (min '+d.min+', max '+d.max+')';
      }
      dot.addEventListener('mouseenter', show);
      dot.addEventListener('focus', show);
      dot.addEventListener('click', show);
      svg.appendChild(dot);
    });
  }

  resampleBtn.addEventListener('click', function(){
    seed = (Date.now() ^ Math.floor(Math.random()*1e9)) >>> 0;
    sample();
    render();
  });

  sample();
  render();
}

/* ============================================================
   Figure 4 — knowledge view (Hasse diagram)
   ============================================================ */

function initFig4(){
  var root = document.getElementById('fig4');
  if(!root) return;
  var svg = document.getElementById('fig4-svg');
  var slider = document.getElementById('fig4-slider');
  var prevBtn = document.getElementById('fig4-prev');
  var nextBtn = document.getElementById('fig4-next');
  var readout = document.getElementById('fig4-readout');
  var stats = document.getElementById('fig4-stats');

  var VALUES = [1,2,3,4,5];
  var RELATIONS = [[1,4],[3,4],[1,3],[4,5],[2,5],[2,4],[2,3],[1,2]];
  var INPUT_ARR = [4,1,3,5,2];
  var POS = {}; INPUT_ARR.forEach(function(v,i){ POS[v]=i; });

  var PERMS = (function(){
    var res=[];
    function permute(arr, acc){
      if(!arr.length){ res.push(acc); return; }
      for(var i=0;i<arr.length;i++){
        var rest = arr.slice(0,i).concat(arr.slice(i+1));
        permute(rest, acc.concat([arr[i]]));
      }
    }
    permute(VALUES, []);
    return res;
  })();

  function countExtensions(k){
    var edges = RELATIONS.slice(0,k);
    var c=0;
    PERMS.forEach(function(p){
      var ok=true;
      for(var e=0;e<edges.length;e++){
        if(p.indexOf(edges[e][0]) > p.indexOf(edges[e][1])){ ok=false; break; }
      }
      if(ok) c++;
    });
    return c;
  }

  function closureAndReduction(k){
    var edges = RELATIONS.slice(0,k);
    var reach = {};
    VALUES.forEach(function(x){ reach[x]={}; VALUES.forEach(function(y){ reach[x][y]=false; }); });
    edges.forEach(function(e){ reach[e[0]][e[1]] = true; });
    VALUES.forEach(function(m){ VALUES.forEach(function(x){ VALUES.forEach(function(y){
      if(reach[x][m] && reach[m][y]) reach[x][y]=true;
    }); }); });
    var reduction = [];
    VALUES.forEach(function(x){ VALUES.forEach(function(y){
      if(!reach[x][y]) return;
      var redundant = VALUES.some(function(z){ return z!==x && z!==y && reach[x][z] && reach[z][y]; });
      if(!redundant) reduction.push([x,y]);
    }); });
    return { reach:reach, reduction:reduction };
  }

  function levels(reduction){
    var lvl = {}; VALUES.forEach(function(v){ lvl[v]=0; });
    var changed = true, guard=0;
    while(changed && guard<50){
      changed=false; guard++;
      reduction.forEach(function(e){
        var want = lvl[e[0]]+1;
        if(want > lvl[e[1]]){ lvl[e[1]] = want; changed = true; }
      });
    }
    return lvl;
  }

  var states = [];
  for(var k=0;k<=8;k++){
    var cr = closureAndReduction(k);
    states.push({ k:k, reduction:cr.reduction, levels:levels(cr.reduction), count:countExtensions(k) });
  }

  var W=660, H=300;
  var NS='http://www.w3.org/2000/svg';
  function el(tag, attrs){ var e=document.createElementNS(NS,tag); for(var kk in attrs) e.setAttribute(kk, attrs[kk]); return e; }

  function layout(state){
    var byLevel = {};
    VALUES.forEach(function(v){
      var l = state.levels[v];
      (byLevel[l] = byLevel[l] || []).push(v);
    });
    Object.keys(byLevel).forEach(function(l){ byLevel[l].sort(function(a,b){ return POS[a]-POS[b]; }); });
    var maxLevel = Math.max.apply(null, VALUES.map(function(v){ return state.levels[v]; }));
    var pos = {};
    Object.keys(byLevel).forEach(function(l){
      var row = byLevel[l];
      row.forEach(function(v, i){
        var x = (i+1) * (W/(row.length+1));
        var y = H - 40 - (l/(maxLevel||1)) * (H-80);
        pos[v] = {x:x, y:y};
      });
    });
    return pos;
  }

  var nodeEls = {}, edgeEls = {};
  VALUES.forEach(function(v){
    var g = el('g', {class:'hasse-node'});
    var c = el('circle', {r:18, cx:0, cy:0});
    var t = el('text', {x:0, y:5, 'text-anchor':'middle'});
    t.textContent = v;
    g.appendChild(c); g.appendChild(t);
    svg.appendChild(g);
    nodeEls[v] = g;
  });

  function edgeKey(e){ return e[0]+'-'+e[1]; }

  function render(k, prevK){
    var state = states[k];
    var pos = layout(state);
    VALUES.forEach(function(v){
      nodeEls[v].style.transform = 'translate('+pos[v].x+'px,'+pos[v].y+'px)';
    });

    var curKeys = {};
    state.reduction.forEach(function(e){ curKeys[edgeKey(e)] = e; });

    Object.keys(edgeEls).forEach(function(key){
      if(!curKeys[key]){ edgeEls[key].remove(); delete edgeEls[key]; }
    });

    var prevReduction = prevK!=null ? states[prevK].reduction : [];
    var prevKeys = {}; prevReduction.forEach(function(e){ prevKeys[edgeKey(e)] = true; });

    state.reduction.forEach(function(e){
      var key = edgeKey(e);
      var p1 = pos[e[0]], p2 = pos[e[1]];
      var d = 'M '+p1.x+' '+p1.y+' L '+p2.x+' '+p2.y;
      var isNew = !prevKeys[key] && prevK != null;
      if(!edgeEls[key]){
        var path = el('path', {d:d, class:'hasse-edge'});
        svg.insertBefore(path, svg.firstChild);
        edgeEls[key] = path;
      } else {
        edgeEls[key].setAttribute('d', d);
      }
      edgeEls[key].classList.toggle('new', isNew);
      if(isNew){
        setTimeout((function(pathEl){ return function(){ pathEl.classList.remove('new'); }; })(edgeEls[key]), 1400);
      }
    });

    var bits = state.count>0 ? (Math.log2(state.count)) : 0;
    var txt = '';
    if(k>0){
      var rel = RELATIONS[k-1];
      var prevCount = states[k-1].count;
      txt += 'compared '+rel[0]+' and '+rel[1]+': '+rel[0]+' &lt; '+rel[1]+' · orderings still possible: '+prevCount+' → '+state.count;
    } else {
      txt += 'No comparisons made yet · orderings still possible: '+state.count;
    }
    readout.innerHTML = txt;
    stats.innerHTML = '<span>after comparison '+k+' of 8</span><span>orderings possible: <b>'+state.count+'</b></span><span>bits remaining: <b>'+bits.toFixed(2)+'</b></span>';
    slider.value = k;
  }

  var curK = 0;
  render(0, null);

  function go(nk){
    nk = Math.max(0, Math.min(8, nk));
    var pk = curK;
    curK = nk;
    render(nk, pk);
  }

  prevBtn.addEventListener('click', function(){ go(curK-1); });
  nextBtn.addEventListener('click', function(){ go(curK+1); });
  slider.addEventListener('input', function(){ go(Number(slider.value)); });
}

/* ============================================================
   Checkpoint
   ============================================================ */

function initCheckpoint(){
  var root = document.getElementById('checkpoint');
  if(!root) return;
  var progressEl = document.getElementById('cp-progress');
  var continueBtn = document.getElementById('cp-continue');
  var gapsNote = document.getElementById('cp-gaps-note');
  var total = 4;
  var attempted = {};

  function mark(id){
    attempted[id] = true;
    update();
  }
  function update(){
    var n = Object.keys(attempted).length;
    progressEl.textContent = n+' of '+total+' questions attempted.';
    if(n >= total) reveal([]);
  }
  function reveal(skipped){
    SC.openGate('gate-ledger');
    if(skipped && skipped.length){
      gapsNote.innerHTML = 'Continuing with gaps: skipped '+skipped.join(', ')+'.';
      gapsNote.classList.add('show');
    } else {
      gapsNote.classList.remove('show');
    }
    continueBtn.disabled = true;
  }

  setupMC('cp-q1', { onCommit: function(){ mark('Q1'); } });
  setupNumeric('cp-q2', { answer: 8, onCommit: function(){ mark('Q2'); } });
  setupMC('cp-q3', { onCommit: function(){ mark('Q3'); } });

  // Q4: find the bug
  var q4root = document.getElementById('cp-q4');
  var buggyBox = document.getElementById('cp-q4-code');
  var q4fb = document.getElementById('cp-q4-feedback');
  buildListing(buggyBox, SC.PY.buggy.lines, {
    clickable: true,
    onClick: function(lineNo, row){
      mark('Q4');
      q4root.querySelectorAll('.code-line').forEach(function(r){ r.classList.remove('hl'); });
      row.classList.add('hl');
      q4fb.querySelectorAll('.fb-variant').forEach(function(v){
        v.style.display = (Number(v.getAttribute('data-match')) === lineNo) ? 'block' : 'none';
      });
      var correct = lineNo === SC.PY.buggy.bugLine;
      q4fb.classList.add('show');
      q4fb.classList.toggle('fb-correct', correct);
      q4fb.classList.toggle('fb-wrong', !correct);
      var runBtn = document.getElementById('cp-q4-run');
      if(correct){ runBtn.style.display=''; }
    }
  });
  document.getElementById('cp-q4-run').addEventListener('click', function(){
    var out = buggyInsertion([2,1]);
    document.getElementById('cp-q4-output').textContent = 'returns ['+out.join(', ')+']: not sorted.';
    document.getElementById('cp-q4-output').style.display='';
  });

  continueBtn.addEventListener('click', function(){
    var all = ['Q1','Q2','Q3','Q4'];
    var skipped = all.filter(function(q){ return !attempted[q]; });
    reveal(skipped);
  });

  update();
}

/* ============================================================
   Prereq check + predict-first blocks
   ============================================================ */

function initPrereqAndPredicts(){
  setupNumeric('prereq-p1', { answer: 7 });
  setupMC('prereq-p2', {});

  setupNumeric('predict-inversions', { answer: 5, gateId: 'gate-inversions' });
  setupMC('predict-swap', { gateId: 'gate-lemma1' });
  setupNumeric('predict-total-swaps', { answer: 5, gateId: 'gate-stepper' });
}

/* ============================================================
   boot
   ============================================================ */

function fitDisplayMath(){
  document.querySelectorAll('.katex-display').forEach(function(el){
    el.style.fontSize = '';
    var guard = 0;
    while(el.scrollWidth > el.clientWidth + 1 && guard < 12){
      var current = parseFloat(window.getComputedStyle(el).fontSize);
      el.style.fontSize = Math.max(current - 1, 11) + 'px';
      guard++;
      if(current <= 11) break;
    }
  });
}
SC.fitDisplayMath = fitDisplayMath;

document.addEventListener('DOMContentLoaded', function(){
  wrapTerms();
  initFig1();
  initFig2();
  initFig3();
  initFig4();
  initCheckpoint();
  initPrereqAndPredicts();

  if(window.renderMathInElement){
    window.renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      ignoredTags: ['script','noscript','style','textarea','pre','code']
    });
  }

  var params = new URLSearchParams(window.location.search);
  if(params.get('reveal') === '1'){
    document.querySelectorAll('.gated').forEach(function(g){ g.classList.add('open'); });
    document.querySelectorAll('details').forEach(function(d){ d.open = true; });
  }

  setTimeout(fitDisplayMath, 50);
  window.addEventListener('resize', fitDisplayMath);
});

})();
