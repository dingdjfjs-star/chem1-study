/* 福鼎少年学化学 · 应用逻辑 */
(function () {
  var DB = window.DB;
  var $app = document.getElementById('app');
  var LS = 'geo1v1';
  var P = { done: {}, q: {}, days: {}, fuding: {}, exam: {}, wrongCleared: 0, seen: 0 };
  try { var raw = localStorage.getItem(LS); if (raw) { var o = JSON.parse(raw); for (var k in P) if (o[k] !== undefined) P[k] = o[k]; } } catch (e) { }

  function save() { try { localStorage.setItem(LS, JSON.stringify(P)); } catch (e) { } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  P.days[today()] = 1;

  /* ---------- 索引 ---------- */
  var SEC = {}, CH = {};
  DB.chapters.forEach(function (c) {
    CH[c.id] = c;
    c.sections.forEach(function (s) { SEC[s.id] = s; s.ch = c.id; });
  });
  var Q = {};
  DB.questions.forEach(function (q) { Q[q.id] = q; });
  /* 试卷题索引（错题本用）：ex_<卷id>_<题号> → 题目 */
  var EXQ = {};
  DB.exams.forEach(function (ex) {
    var no = 0;
    ex.mcq.forEach(function (g) { g.qs.forEach(function (q) { no++; q._from = ex.title; EXQ['ex_' + ex.id + '_' + no] = q; }); });
  });
  var allSections = [];
  DB.chapters.forEach(function (c) { c.sections.forEach(function (s) { allSections.push(s.id); }); });

  /* ---------- 成就 ---------- */
  var BADGES = [
    { id: 'b1', ic: '启', t: '启程', d: '学完第一个知识点', chk: function () { return Object.keys(P.done).length >= 1; } },
    { id: 'b2', ic: '科', t: '走进化学科学', d: '第一章全部学完', chk: function () { return chDone('ch1'); } },
    { id: 'b3', ic: '素', t: '元素与物质世界', d: '第二章全部学完', chk: function () { return chDone('ch2'); } },
    { id: 'b4', ic: '转', t: '性质与转化', d: '第三章全部学完', chk: function () { return chDone('ch3'); } },
    { id: 'b5', ic: '十', t: '初试锋芒', d: '随堂练累计答对10题', chk: function () { return totalRight() >= 10; } },
    { id: 'b6', ic: '百', t: '百炼成钢', d: '随堂练累计答对50题', chk: function () { return totalRight() >= 50; } },
    { id: 'b7', ic: '卷', t: '卷面首胜', d: '完成一整套试卷', chk: function () { return Object.keys(P.exam).length >= 1; } },
    { id: 'b8', ic: '猎', t: '错题猎人', d: '把错题本清空一次', chk: function () { return !!P.wrongCleared; } },
    { id: 'b9', ic: '鼎', t: '福鼎化学通', d: '点开全部福鼎限定卡', chk: function () { return fudingTotal() > 0 && Object.keys(P.fuding).length >= fudingTotal(); } },
    { id: 'b10', ic: '七', t: '七日之约', d: '累计学习7天', chk: function () { return Object.keys(P.days).length >= 7; } }
  ];
  function chDone(cid) { var c = CH[cid]; return c && c.sections.every(function (s) { return P.done[s.id]; }); }
  function totalRight() { var n = 0; for (var k in P.q) n += P.q[k].r || 0; return n; }
  function fudingTotal() {
    var n = 0;
    DB.chapters.forEach(function (c) { c.sections.forEach(function (s) { s.points.forEach(function (p) { p.blocks.forEach(function (b) { if (b[0] === 'fuding') n++; }); }); }); });
    return n;
  }
  function wrongIds() { var r = []; for (var k in P.q) if (P.q[k].last === 'w') r.push(k); return r; }
  function checkBadges() {
    var got = [];
    BADGES.forEach(function (b) { if (!P['bg_' + b.id] && b.chk()) { P['bg_' + b.id] = 1; got.push(b); } });
    save();
    got.forEach(function (b, i) { setTimeout(function () { toast('🎉 获得成就「' + b.t + '」'); }, i * 500); });
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'new-badge-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }

  /* ---------- 工具 ---------- */
  function h(html) { $app.innerHTML = html; window.scrollTo(0, 0); syncTab(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function topbar(title, sub, back) {
    return '<div class="topbar">' + (back ? '<a class="back" href="' + back + '">‹</a>' : '') +
      '<div class="seal kai">化</div><h1 class="kai">' + title + '<small>' + (sub || '') + '</small></h1></div>';
  }
  function syncTab() {
    var cur = location.hash || '#/';
    var qi = cur.indexOf('?'); if (qi >= 0) cur = cur.slice(0, qi);
    var seg = (cur.replace(/^#\/?/, '').split('/')[0] || 'home');
    var map = { home: '#/', chapters: '#/chapters', ch: '#/chapters', sec: '#/chapters', exams: '#/exams', exam: '#/exams', wrong: '#/wrong', badges: '#/badges' };
    var href = map[seg] || '#/';
    document.querySelectorAll('#tabbar a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === href);
    });
    var w = wrongIds().length;
    var dot = document.getElementById('wrong-dot'); if (dot) dot.hidden = w === 0;
  }
  window.addEventListener('hashchange', route);

  /* ---------- 首页 ---------- */
  function ring(pct, col) {
    var r = 30, c = 2 * Math.PI * r;
    return '<svg class="progress-ring" width="76" height="76" viewBox="0 0 76 76">' +
      '<circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#e6dcc4" stroke-width="9"/>' +
      '<circle cx="38" cy="38" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '<text x="38" y="43" text-anchor="middle" font-size="16" font-weight="700" fill="#322c26" transform="rotate(90 38 38)">' + pct + '%</text></svg>';
  }
  function vHome() {
    var learned = allSections.filter(function (s) { return P.done[s]; }).length;
    var pct = Math.round(learned / allSections.length * 100);
    var att = 0, right = 0; for (var k in P.q) { att += P.q[k].n; right += P.q[k].r; }
    var acc = att ? Math.round(right / att * 100) : null;
    var w = wrongIds().length;
    var next = allSections.filter(function (s) { return !P.done[s]; })[0];
    var nextSec = SEC[next];
    var nextCh = nextSec ? CH[nextSec.ch] : null;
    var html = topbar('福鼎少年学化学', '鲁科版 高中化学 必修一二 · 上学期考点＋下学期预习');
    html += '<div class="hero"><div class="h-row"><div class="ring">' + ring(pct, 'var(--red)') + '</div><div style="flex:1;min-width:0">' +
      '<h2>学习进度</h2><p class="sub">已学 ' + learned + ' / ' + allSections.length + ' 节 · 随堂练答对 ' + right + ' 题</p>' +
      '<div class="stats"><span class="st">正确率 <b>' + (acc === null ? '—' : acc + '%') + '</b></span>' +
      '<span class="st">错题 <b>' + w + '</b></span><span class="st">成就 <b>' + Object.keys(P).filter(function (k) { return k.indexOf('bg_') === 0; }).length + '/' + BADGES.length + '</b></span></div>' +
      (nextSec ? '<div class="tip">下一节：<b>' + nextCh.no + ' ' + nextSec.title + '</b>　<a href="#/sec/' + nextSec.id + '" style="color:var(--red)">去学 →</a></div>' : '<div class="tip">六章全部学完，了不起！去刷卷巩固吧。</div>') +
      '</div></div></div>';
    html += '<div class="quick">' +
      '<a href="' + (nextSec ? '#/sec/' + nextSec.id : '#/chapters') + '"><i>读</i><b>继续学习</b></a>' +
      '<a href="#/exams"><i>卷</i><b>刷卷</b></a>' +
      '<a href="#/wrong"><i>错</i><b>错题本</b></a>' +
      '<a href="#/badges"><i>奖</i><b>成就</b></a></div>';
    html += '<div class="sec-title">六章知识点 <small>第4~6章＝必修第二册·下学期预习</small></div><div class="ch-grid">';
    DB.chapters.forEach(function (c) {
      var d = c.sections.filter(function (s) { return P.done[s.id]; }).length;
      var p = Math.round(d / c.sections.length * 100);
      html += '<a class="chcard" href="#/ch/' + c.id + '"><div class="no" style="background:' + c.color + '"><b>' + c.no.replace('第', '').replace('章', '') + '</b><span>章</span></div>' +
        '<div class="info"><h3>' + (c.phase === '二' ? '<span class="note-tag">下学期预习</span> ' : '') + c.title + '</h3><p>' + c.tagline + '</p>' +
        '<div class="bar"><i style="width:' + p + '%;background:' + c.color + '"></i></div><div class="pct">' + p + '%</div></div></a>';
    });
    html += '</div>';
    html += '<div class="foot">为福鼎的化学少年而作 · 学好化学，守护生活</div>';
    h(html);
  }

  /* ---------- 章列表 / 章页 ---------- */
  function vChapters() {
    var html = topbar('知识点', '六章 · ' + allSections.length + '节', '#/');
    DB.chapters.forEach(function (c) {
      html += '<div class="sec-title" style="color:' + c.color + '">' + c.no + ' ' + c.title + (c.phase === '二' ? '（下学期预习）' : '') + '</div>';
      c.sections.forEach(function (s) {
        var qn = s.quiz.length, qr = 0;
        s.quiz.forEach(function (qid) { if (P.q[qid] && P.q[qid].last === 'r') qr++; });
        html += '<a class="sec-item" href="#/sec/' + s.id + '" style="text-decoration:none">' +
          '<div class="idx" style="background:' + c.color + '">' + s.no.replace('第一节', '一').replace('第二节', '二').replace('第三节', '三').replace('第四节', '四') + '</div>' +
          '<div class="bd"><h3>' + s.title + '</h3><div class="lead">' + s.lead + '</div>' +
          '<div class="meta"><span>' + s.points.length + '个知识点</span><span>练习 ' + s.quiz.length + '题</span>' +
          (P.done[s.id] ? '<b class="ok">✓ 已学</b>' : '') + (qn && qr === qn ? '<b class="ok">✓ 练习全对</b>' : '') + '</div></div></a>';
      });
    });
    html += '<div class="foot">跟着教材走，一章别落下</div>';
    h(html);
  }
  function vChapter(cid) {
    var c = CH[cid]; if (!c) return vHome();
    var html = topbar(c.no + ' · ' + c.title, c.tagline, '#/chapters');
    html += '<div class="ch-head"><span class="tag">' + c.no + '</span><h2 class="kai">' + c.title + '</h2><p>' + c.intro + '</p></div>';
    c.sections.forEach(function (s) {
      html += '<a class="sec-item" href="#/sec/' + s.id + '" style="text-decoration:none">' +
        '<div class="idx" style="background:' + c.color + '">' + s.no.replace('第一节', '一').replace('第二节', '二').replace('第三节', '三').replace('第四节', '四') + '</div>' +
        '<div class="bd"><h3>' + s.title + '</h3><div class="lead">' + s.lead + '</div>' +
        '<div class="meta"><span>' + s.points.length + '个知识点</span><span>' + s.quiz.length + '道随堂练</span>' + (P.done[s.id] ? '<b class="ok">✓ 已学</b>' : '') + '</div></div></a>';
    });
    html += '<div class="foot">' + c.tagline + '</div>';
    h(html);
  }

  /* ---------- 节页（知识点卡） ---------- */
  function renderBlocks(p, el) {
    var html = '';
    p.blocks.forEach(function (b) {
      var t = b[0];
      if (t === 'p') html += '<p>' + b[1] + '</p>';
      else if (t === 'ul') html += '<ul>' + b[1].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
      else if (t === 'kv') html += '<table class="kv">' + b[1].map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
      else if (t === 'table') html += '<table class="kv"><tr>' + b[1].head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr>' +
        b[1].rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      else if (t === 'tip') html += '<div class="box tip"><span class="bt">老班长敲黑板 · 易错</span>' + b[1] + '</div>';
      else if (t === 'memo') html += '<div class="box memo"><span class="bt">记忆口诀</span>' + b[1] + '</div>';
      else if (t === 'ext') html += '<div class="box ext"><span class="bt">拓展视野 · 加分项</span>' + b[1] + '</div>';
      else if (t === 'note') html += '<div class="box" style="background:var(--paper2)">' + b[1] + '</div>';
      else if (t === 'eq') html += '<div class="eqline">' + b[2] + ' ' + (b[1] === '=' ? ' = ' : (b[1] === '⇌' ? ' ⇌ ' : '<span class="rxn">' + (b[1] && b[1] !== '可逆' ? '<i>' + b[1] + '</i>' : '') + (b[1] === '可逆' ? '⇌' : '→') + '</span>')) + ' ' + b[3] + '</div>';
      else if (t === 'fuding') {
        var key = p.id + '#' + b[1][0];
        var open = !!P.fuding[key];
        html += '<div class="box fuding" data-fuding="' + esc(key) + '" style="cursor:pointer">' +
          '<span class="bt">福鼎限定 · ' + b[1][0] + (open ? '' : '（点开看看）') + '</span>' +
          '<div class="fd-bd" style="' + (open ? '' : 'display:none') + '">' + b[1][1] + '</div></div>';
      }
      else if (t === 'dgm') html += '<div class="dgm" id="dgm-' + b[1] + '"></div><div style="font-size:12.5px;color:var(--ink2);text-align:center;margin:-4px 0 10px">' + (b[2] || '') + '</div>';
    });
    el.innerHTML = html;
    Array.prototype.slice.call(el.querySelectorAll('[data-fuding]')).forEach(function (n) {
      n.onclick = function () {
        var bd = n.querySelector('.fd-bd');
        var opening = bd.style.display === 'none';
        bd.style.display = opening ? '' : 'none';
        var key = n.getAttribute('data-fuding');
        if (opening) { P.fuding[key] = 1; save(); checkBadges(); }
      };
    });
    Array.prototype.slice.call(el.querySelectorAll('.dgm')).forEach(function (d) {
      var id = d.id.replace('dgm-', '');
      var dg = DB.diagrams[id];
      if (dg) d.appendChild(buildDgm(id));
    });
  }
  function buildDgm(id) {
    var dg = DB.diagrams[id];
    var box = document.createElement('div');
    box.innerHTML = '<div style="padding:8px 8px 0;text-align:center;font-family:KaiTi,楷体,serif;font-size:13.5px;color:var(--ink2)">▸ ' + dg.title + '</div>';
    var inner = document.createElement('div');
    box.appendChild(inner);
    try { dg.build(inner); } catch (e) { inner.innerHTML = '<div class="cap">图解加载失败：' + esc(e.message) + '</div>'; }
    return box;
  }
  function vSection(sid) {
    var s = SEC[sid]; if (!s) return vHome();
    var c = CH[s.ch];
    var html = topbar(s.no + ' · ' + s.title, c.no + ' · ' + c.title, '#/ch/' + c.id);
    html += '<div class="ch-head"><span class="tag" style="background:' + c.color + '">' + c.no + ' · ' + s.no + '</span><h2 class="kai">' + s.title + '</h2><p>' + s.lead + '</p></div>';
    s.points.forEach(function (p) {
      html += '<div class="pcard">' + (p.key ? '<span class="key-star">高频考点</span>' : '') + '<h3>' + p.title + '</h3><div class="pb"></div></div>';
    });
    html += '<div class="center" style="margin:18px 0 8px">' +
      '<button class="btn red" id="markdone" style="' + (P.done[s.id] ? 'display:none' : '') + '">这节我学完了 ✓</button>' +
      (P.done[s.id] ? '<div class="mut">✓ 已标记学完</div>' : '') + '</div>';
    html += '<div id="quiz-area"></div><div class="foot">' + c.title + ' · ' + s.title + '</div>';
    h(html);
    var cards = $app.querySelectorAll('.pcard');
    s.points.forEach(function (p, i) {
      var pb = cards[i].querySelector('.pb');
      renderBlocks(p, pb);
    });
    var md = document.getElementById('markdone');
    if (md) md.onclick = function () { P.done[s.id] = 1; save(); checkBadges(); vSection(sid); };
    mountQuiz(s);
  }

  /* ---------- 随堂练 ---------- */
  function mountQuiz(s) {
    var area = document.getElementById('quiz-area');
    var allRight = s.quiz.every(function (q) { return P.q[q] && P.q[q].last === 'r'; });
    var html = '<div class="sec-title">随堂练 <small>' + s.quiz.length + '题 · 答完自动记入错题本</small></div>' +
      '<div class="quizcard center" style="padding:22px 16px">' +
      '<div class="kai" style="font-size:19px;margin-bottom:6px">' + s.title + ' · 小测验</div>' +
      '<p class="mut">' + (allRight ? '✓ 你已全部答对，可以再刷一遍巩固。' : '每题答完立即看解析，答错的自动进错题本。') + '</p>' +
      '<button class="btn red" id="qstart">开始练习</button></div>';
    area.innerHTML = html;
    document.getElementById('qstart').onclick = function () { runQuiz(s); };
  }
  function runQuiz(s) {
    var area = document.getElementById('quiz-area');
    var ids = s.quiz.slice(), i = 0, firstRight = 0;
    function record(qid, ok) {
      var r = P.q[qid] = P.q[qid] || { n: 0, r: 0, last: null };
      r.n++; if (ok) { r.r++; r.last = 'r'; } else { r.last = 'w'; }
      save();
    }
    function draw() {
      if (i >= ids.length) {
        var rate = Math.round(firstRight / ids.length * 100);
        var msg = rate === 100 ? '全对！这节稳了。' : rate >= 80 ? '不错！错的那几题去错题本里再过一遍。' : rate >= 60 ? '有基础，把解析读一遍再回来重做。' : '别灰心，回到上面的知识点卡里再读一遍，马上再来。';
        area.innerHTML = '<div class="quizcard result">' +
          '<div class="big">' + firstRight + '<span style="font-size:22px">/' + ids.length + '</span></div>' +
          '<div class="sub">正确率 ' + rate + '%</div><div class="msg">' + msg + '</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap">' +
          '<button class="btn ghost" id="qretry">再练一遍</button><a class="btn" href="#/ch/' + s.ch + '">返回章节</a></div></div>';
        document.getElementById('qretry').onclick = function () { runQuiz(s); };
        checkBadges(); syncTab();
        return;
      }
      var q = Q[ids[i]];
      var html = '<div class="quizcard"><div class="qno">随堂练 · 第 <b>' + (i + 1) + '</b> / ' + ids.length + ' 题' +
        (q.tag ? '　<span class="note-tag">' + q.tag + '</span>' : '') + '</div>' +
        '<div class="qstem">' + q.stem + '</div><div class="opts">';
      q.opts.forEach(function (o, j) {
        html += '<div class="opt" data-j="' + j + '"><span class="abc">' + 'ABCD'[j] + '</span><span>' + o + '</span></div>';
      });
      html += '</div><div id="qexp"></div><div class="qnav">' +
        '<button class="btn" id="qnext" disabled>下一题 →</button></div></div>';
      area.innerHTML = html;
      var answered = false;
      area.querySelectorAll('.opt').forEach(function (n) {
        n.onclick = function () {
          if (answered) return; answered = true;
          var j = +n.getAttribute('data-j'), ok = j === q.ans;
          if (ok) firstRight++;
          record(q.id, ok);
          area.querySelectorAll('.opt').forEach(function (m) {
            var mj = +m.getAttribute('data-j');
            if (mj === q.ans) m.classList.add('right');
            else if (mj === j) m.classList.add('wrong');
            else m.classList.add('dim');
          });
          document.getElementById('qexp').innerHTML = '<div class="exp"><b>' + (ok ? '答对了！' : '答错了。') + '</b>' + q.exp + '</div>';
          var nb = document.getElementById('qnext'); nb.disabled = false;
          if (i === ids.length - 1) nb.textContent = '看成绩 →';
          nb.onclick = function () { i++; draw(); };
          checkBadges(); syncTab();
        };
      });
    }
    draw();
  }

  /* ---------- 试卷 ---------- */
  function vExams() {
    var html = topbar('刷卷', '真题 + 宁德质检体例模拟卷', '#/');
    html += '<div class="ch-head"><span class="tag">考试中心</span><h2 class="kai">两套卷子</h2><p>按宁德市期末质检（福建学考）体例编写、结合福鼎生活情境的化学模拟卷。选择题自动批改并计入错题本，综合题（含化学方程式书写）对照参考答案自评。学考真题可向老师要当年卷，用本站章节知识点对照复习。</p></div>';
    DB.exams.forEach(function (ex) {
      var total = 0; ex.mcq.forEach(function (g) { total += g.qs.length; });
      var rec = P.exam[ex.id];
      html += '<div class="examcard"><span class="kind" style="background:' + ex.color + '">' + ex.kind + '</span>' +
        '<h3>' + ex.title + '</h3><div class="meta">' + ex.meta + '</div>' +
        (rec ? '<div class="best">上次成绩：选择题 ' + rec.best + ' / ' + total + ' 题（' + Math.round(rec.best / total * 100) + '分制参考：' + rec.best * 2 + '分）</div>' : '') +
        '<a class="btn red" href="#/exam/' + ex.id + '">开始作答</a></div>';
    });
    html += '<div class="foot">做卷子贵在"错题搞懂"，不在数量</div>';
    h(html);
  }
  function vExam(eid) {
    var ex = DB.exams.filter(function (x) { return x.id === eid; })[0]; if (!ex) return vExams();
    var flat = [];
    ex.mcq.forEach(function (g, gi) { g.qs.forEach(function (q, qi) { flat.push({ g: g, q: q, no: flat.length + 1, gStart: qi === 0 }); }); });
    var st = { i: 0, answers: {} };
    var total = flat.length;
    function draw() {
      var it = flat[st.i];
      var html = topbar(ex.kind + ' · 作答中', ex.title.replace(/·.*/, ''), '#/exams');
      html += '<div class="qno" style="margin:4px 2px 8px">选择题 第 <b>' + (st.i + 1) + '</b> / ' + total + ' 题</div>';
      if (it.gStart && it.g.note) html += '<div class="qnote">' + it.g.note + (it.g.badge ? '　<span class="note-tag">' + it.g.badge + '</span>' : '') + '</div>';
      html += '<div class="quizcard"><div class="qno"><b>' + it.no + '.</b></div><div class="qstem">' + it.q.stem + '</div><div class="opts">';
      it.q.opts.forEach(function (o, j) {
        html += '<div class="opt' + (st.answers[it.no] === j ? ' sel' : '') + '" data-j="' + j + '"><span class="abc">' + 'ABCD'[j] + '</span><span>' + o + '</span></div>';
      });
      html += '</div></div><div class="qnav">' +
        '<button class="btn ghost" id="eprev"' + (st.i === 0 ? ' disabled' : '') + '>← 上一题</button>' +
        '<button class="btn" id="enext">' + (st.i === total - 1 ? '交卷看成绩' : '下一题 →') + '</button></div>';
      html += '<div class="foot">已答 ' + Object.keys(st.answers).length + ' / ' + total + ' 题（可先跳过，最后再回来改）</div>';
      h(html);
      $app.querySelectorAll('.opt').forEach(function (n) {
        n.onclick = function () { st.answers[it.no] = +n.getAttribute('data-j'); draw(); };
      });
      document.getElementById('eprev').onclick = function () { if (st.i > 0) { st.i--; draw(); } };
      document.getElementById('enext').onclick = function () {
        if (st.i < total - 1) { st.i++; draw(); } else { finish(); }
      };
    }
    function finish() {
      var correct = 0, wrongList = [];
      flat.forEach(function (it) {
        var a = st.answers[it.no];
        if (a === it.q.ans) correct++;
        else { wrongList.push(it); if (a !== undefined) { var r = P.q['ex_' + ex.id + '_' + it.no] = P.q['ex_' + ex.id + '_' + it.no] || { n: 0, r: 0, last: null }; r.n++; r.last = 'w'; } }
      });
      save();
      P.exam[ex.id] = P.exam[ex.id] || { best: 0 };
      if (correct > P.exam[ex.id].best) P.exam[ex.id].best = correct;
      save();
      var html = topbar('成绩单', ex.title, '#/exams');
      html += '<div class="quizcard result"><div class="big">' + correct + '<span style="font-size:22px">/' + total + '</span></div>' +
        '<div class="sub">选择题正确率 ' + Math.round(correct / total * 100) + '%（满分卷面换算：' + correct * 2 + ' / ' + total * 2 + ' 分）</div>' +
        '<div class="msg">' + (correct / total >= 0.9 ? '这份卷子拿下了，期末就这个状态！' : correct / total >= 0.75 ? '稳中有升，错题看解析后重做一遍。' : correct / total >= 0.6 ? '及格线上，把错题对应的知识点回炉一遍再战。' : '别慌，先把对应章节的知识点卡过一遍，再来刷。') + '</div>' +
        '<div style="margin-top:12px"><a class="btn" href="#/wrong">错题都收进错题本了 →</a></div></div>';
      if (wrongList.length) {
        html += '<div class="sec-title">本次错题 <small>' + wrongList.length + '题 · 点开看解析</small></div>';
        wrongList.forEach(function (it) {
          html += '<div class="examcard"><h3>' + it.no + '. ' + it.q.stem.replace(/\n/g, '<br>') + '</h3>' +
            '<div class="meta">你的答案：' + (st.answers[it.no] !== undefined ? 'ABCD'[st.answers[it.no]] : '未作答') + ' · 正确答案：<b style="color:var(--red)">' + 'ABCD'[it.q.ans] + '</b></div>' +
            '<div class="exp">' + it.q.exp + '</div></div>';
        });
      }
      html += '<div class="sec-title">非选择题（综合题）<small>先自己写，再对照参考答案自评</small></div>';
      ex.essay.forEach(function (es) {
        html += '<div class="essay' + (P['es_' + ex.id + '_' + es.no] ? ' marked' : '') + '" id="essay-' + es.no + '">' +
          '<span class="en kai">' + es.no + '.（' + es.score + '分）</span>' +
          (es.badge ? ' <span class="note-tag">' + es.badge + '</span>' : '') +
          (es.dgm ? '<div class="dgm" id="dgm-' + es.dgm + '"></div>' : '') +
          '<div class="estem">' + es.stem + '</div>' +
          '<div class="eqs">' + es.qs.map(function (x) { return esc(x); }).join('<br>') + '</div>' +
          '<button class="btn ghost" style="margin-top:10px" data-ans="' + es.no + '">看参考答案</button>' +
          '<div class="ans"><b>参考答案（' + es.score + '分）</b><ol>' + es.ans.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol></div>' +
          '<div class="selfmark"><button class="btn" data-mk="1">✓ 基本掌握</button><button class="btn ghost" data-mk="0">✗ 还不会</button></div></div>';
      });
      html += '<div class="center" style="margin:16px 0"><a class="btn red" href="#/exams">返回卷子列表</a></div>';
      h(html);
      // 图解（真题重绘图）
      ex.essay.forEach(function (es) {
        if (es.dgm) {
          var d = document.getElementById('dgm-' + es.dgm);
          if (d) d.appendChild(buildDgm(es.dgm));
        }
      });
      $app.querySelectorAll('[data-ans]').forEach(function (b) {
        b.onclick = function () {
          var n = b.closest('.essay');
          n.querySelector('.ans').style.display = 'block'; b.style.display = 'none';
        };
      });
      $app.querySelectorAll('[data-mk]').forEach(function (b) {
        b.onclick = function () {
          var n = b.closest('.essay');
          n.classList.add('marked');
          P['es_' + ex.id + '_' + n.id.replace('essay-', '')] = b.getAttribute('data-mk') === '1';
          save();
          toast(b.getAttribute('data-mk') === '1' ? '记下了：这题掌握 ✓' : '已加入"还不会"，建议过两天再看一遍');
        };
      });
      checkBadges(); syncTab();
    }
    draw();
  }

  /* ---------- 错题本 ---------- */
  function vWrong() {
    var ids = wrongIds();
    var html = topbar('错题本', '答对重做即可移出', '#/');
    if (!ids.length) {
      html += '<div class="empty"><i>空</i>错题本是空的——<br>要么你很稳，要么你还没开始练。<br><a class="btn red" style="margin-top:14px" href="#/chapters">去做题</a></div>';
      h(html); return;
    }
    html += '<div class="ch-head"><span class="tag" style="background:var(--red)">错题</span><h2 class="kai">' + ids.length + ' 道题等你收拾</h2><p>点开题目重做，答对即自动移出错题本。</p></div>';
    ids.forEach(function (qid, idx) {
      var q = Q[qid] || EXQ[qid]; if (!q) return;
      var from = q._from || (SEC[q.sec] ? SEC[q.sec].title : '');
      var optsHtml = q.opts.map(function (o, j) { return '<div class="opt" data-j="' + j + '" data-q="' + esc(qid) + '"><span class="abc">' + 'ABCD'[j] + '</span><span>' + o + '</span></div>'; }).join('');
      html += '<div class="examcard" id="wq-' + idx + '"><h3 style="font-size:15.5px">' + esc(q.stem) + '</h3>' +
        '<div class="meta">来自：' + from + (q.tag ? ' · ' + q.tag : '') + '</div>' +
        '<div style="display:none" class="wq-body">' + optsHtml + '<div class="wq-exp"></div></div>' +
        '<button class="btn ghost" style="margin-top:10px" data-open="' + idx + '">重做此题</button></div>';
    });
    html += '<div class="center" style="margin:14px 0"><button class="btn ghost" id="wclear">清空错题本</button></div>';
    h(html);
    $app.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () {
        var card = document.getElementById('wq-' + b.getAttribute('data-open'));
        var body = card.querySelector('.wq-body'); body.style.display = ''; b.style.display = 'none';
        var qid = card.querySelector('.opt').getAttribute('data-q');
        var q = Q[qid] || EXQ[qid];
        card.querySelectorAll('.opt').forEach(function (n) {
          n.onclick = function () {
            var j = +n.getAttribute('data-j'), ok = j === q.ans;
            card.querySelectorAll('.opt').forEach(function (m) {
              var mj = +m.getAttribute('data-j');
              if (mj === q.ans) m.classList.add('right'); else if (mj === j) m.classList.add('wrong'); else m.classList.add('dim');
            });
            card.querySelector('.wq-exp').innerHTML = '<div class="exp"><b>' + (ok ? '答对了，移出错题本 ✓' : '还是错了。') + '</b>' + q.exp + '</div>';
            if (ok) {
              P.q[qid].last = 'r'; save(); syncTab();
              setTimeout(function () { vWrong(); }, 900);
            }
          };
        });
      };
    });
    document.getElementById('wclear').onclick = function () {
      if (!confirm('确定清空错题本吗？（建议先把题都重做一遍）')) return;
      ids.forEach(function (qid) { if (P.q[qid]) P.q[qid].last = 'r'; });
      P.wrongCleared = 1; save(); checkBadges(); vWrong();
    };
  }

  /* ---------- 成就 ---------- */
  function vBadges() {
    var html = topbar('成就', '学习路上捡的"勋章"', '#/');
    html += '<div class="ch-head"><span class="tag" style="background:var(--gold)">成就</span><h2 class="kai">成就墙</h2><p>学完章节、答题、清错题、点开福鼎限定卡……都会解锁成就。</p></div><div class="badge-grid">';
    BADGES.forEach(function (b) {
      var got = !!P['bg_' + b.id];
      html += '<div class="badge' + (got ? ' got' : '') + '"><div class="ic">' + b.ic + '</div><h4>' + b.t + '</h4><p>' + b.d + '</p></div>';
    });
    html += '</div><div class="foot">攒成就，攒的是真本事</div>';
    h(html);
  }

  /* ---------- 路由 ---------- */
  function route() {
    var hash = location.hash || '#/';
    var qIdx = hash.indexOf('?');
    if (qIdx >= 0) hash = hash.slice(0, qIdx); // 兼容带查询参数的地址
    var parts = hash.replace(/^#\//, '').split('/');
    checkBadges();
    if (parts[0] === '' || parts[0] === undefined) return vHome();
    if (parts[0] === 'chapters') return vChapters();
    if (parts[0] === 'ch' && parts[1]) return vChapter(parts[1]);
    if (parts[0] === 'sec' && parts[1]) return vSection(parts[1]);
    if (parts[0] === 'exams') return vExams();
    if (parts[0] === 'exam' && parts[1]) return vExam(parts[1]);
    if (parts[0] === 'wrong') return vWrong();
    if (parts[0] === 'badges') return vBadges();
    vHome();
  }
  save();
  route();
})();
