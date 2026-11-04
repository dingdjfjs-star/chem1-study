/* 数据自检：node test\test.js
   重点：化学方程式自动配平校验（元素守恒 + 电荷守恒） */
global.window = {};
var fs = require('fs'), path = require('path');
['diagrams', 'data-ch1', 'data-ch2', 'data-ch3', 'data-exams'].forEach(function (f) {
  eval(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'));
});
var DB = window.DB;
var pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) pass++;
  else { fail++; console.log('  ✗ FAIL: ' + msg); }
}

/* ===== 方程式解析器 ===== */
var SUB = { '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4, '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9 };
var SUPVAL = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
function cleanSide(s) {
  return s
    .replace(/[（(][^()（）]*[\u4e00-\u9fa5][^()（）]*[）)]/g, '')   // 中文注记（浓）（熔融）（胶体）
    .replace(/[（(]\s*[gslaq]\s*[）)]/g, '')                        // 状态符号 (g)(s)(l)(aq)
    .replace(/[↑↓]/g, '')
    .trim();
}
// 解析一侧 → { elems:{}, charge:Number } 或 null（无法解析）
function parseSide(str) {
  str = cleanSide(str);
  if (!str) return null;
  var tokens = str.split('+');
  var elems = {}, charge = 0;
  for (var t = 0; t < tokens.length; t++) {
    var tok = tokens[t].trim();
    if (!tok) return null;
    var i = 0, coef = '';
    while (i < tok.length && tok[i] >= '0' && tok[i] <= '9') { coef += tok[i]; i++; }
    var mult = coef ? parseInt(coef, 10) : 1;
    var body = tok.slice(i);
    if (!body) return null;
    // 末尾电荷（上标串：¹²³ 与 U+2070-207F 上标区；不含 U+2080+ 下标区）
    var ch = 0;
    var m = body.match(/([\u00b2\u00b3\u00b9\u2070-\u207f]+)$/);
    if (m) {
      body = body.slice(0, body.length - m[1].length);
      if (!body) return null;
      var plus = 0, minus = 0, num = '';
      for (var c = 0; c < m[1].length; c++) {
        var sc = m[1][c];
        if (sc === '\u207a') plus++;
        else if (sc === '\u207b') minus++;
        else num += SUPVAL[sc];
      }
      if (plus + minus !== 1) return null;
      var nv = num ? parseInt(num, 10) : 1;
      ch = plus ? nv : -nv;
    }
    charge += ch * mult;
    // 组成（括号嵌套）
    var te = {}, stack = [te], k = 0;
    while (k < body.length) {
      var chx = body[k];
      if (chx === '(') { stack.push({}); k++; }
      else if (chx === ')') {
        k++;
        var num2 = '';
        while (k < body.length && SUB[body[k]] !== undefined) { num2 += SUB[body[k]]; k++; }
        var mult2 = num2 ? parseInt(num2, 10) : 1;
        if (stack.length < 2) return null;
        var done = stack.pop(), parent = stack[stack.length - 1];
        for (var el in done) parent[el] = (parent[el] || 0) + done[el] * mult2;
      } else if (chx === '·') { k++; }   // 水合/加合点
      else if (chx >= 'A' && chx <= 'Z') {
        var name = chx; k++;
        while (k < body.length && body[k] >= 'a' && body[k] <= 'z') { name += body[k]; k++; }
        var num3 = '';
        while (k < body.length && SUB[body[k]] !== undefined) { num3 += SUB[body[k]]; k++; }
        var cnt = num3 ? parseInt(num3, 10) : 1;
        var top = stack[stack.length - 1];
        top[name] = (top[name] || 0) + cnt;
      } else return null;
    }
    if (stack.length !== 1) return null;
    for (var e2 in te) elems[e2] = (elems[e2] || 0) + te[e2] * mult;
  }
  return { elems: elems, charge: charge };
}
function cmpSide(a, b) {
  if (!a || !b) return null;
  var keys = {};
  for (var k in a.elems) keys[k] = 1;
  for (var k2 in b.elems) keys[k2] = 1;
  for (var k3 in keys) {
    if ((a.elems[k3] || 0) !== (b.elems[k3] || 0)) return '元素 ' + k3 + ' 不守恒（左' + (a.elems[k3] || 0) + ' 右' + (b.elems[k3] || 0) + '）';
  }
  if (a.charge !== b.charge) return '电荷不守恒（左 ' + a.charge + ' 右 ' + b.charge + '）';
  return null;
}
function checkEquation(left, right, where) {
  var L = parseSide(left), R = parseSide(right);
  if (!L) return where + ' 左侧无法解析：' + left;
  if (!R) return where + ' 右侧无法解析：' + right;
  var bad = cmpSide(L, R);
  return bad ? where + ' 配平错误：' + left + ' = ' + right + ' → ' + bad : null;
}
/* 文本扫描：提取 "A + B = C" 候选并校验（带过滤，防截断误报） */
var CLS = 'A-Za-z0-9\u2080-\u2089()\u00b2\u00b3\u00b9\u2070-\u207f\u207a-\u207e· ';
var EQ_SCAN = new RegExp('([' + CLS + ']*\\+[' + CLS.replace(' = ', ' ') + '+ ]*)=([A-Za-z0-9\u2080-\u2089()\u00b2\u00b3\u00b9\u2070-\u207f\u207a-\u207e·+ ↑↓]*)', 'g');
function isCJK(c) { return c && /[\u4e00-\u9fa5]/.test(c); }
function scanText(text, where, errs) {
  if (typeof text !== 'string') return;
  var t = text.replace(/=([^=\d\n]{1,6})=/g, '=');   // 去掉 =Δ= =高温= 这类条件
  t = t.replace(/\u21cc/g, '=');
  var m;
  EQ_SCAN.lastIndex = 0;
  while ((m = EQ_SCAN.exec(t)) !== null) {
    var L = m[1].trim(), R = m[2].trim();
    if (L.indexOf('+') < 0) continue;                       // 只查带 "+" 的
    if (!/[\u2080-\u2089\u207a-\u207e\u00b2\u00b3\u00b9]/.test(L + R)) continue;  // 必须含下标/电荷
    if (/[\u00b2\u00b3\u00b9\u2070-\u207f\u2080-\u2089]/.test(L[0] || '')) continue; // 左起不得是上/下标（截断）
    var before = t[m.index - 1], after = t[m.index + m[0].length];
    if (isCJK(before) || isCJK(after)) continue;            // 疑似中文句子里截断的片段
    if (/[\u00b2\u00b3\u00b9\u2070-\u207f\u2080-\u2089]/.test(after || '')) continue; // 右侧被截断（后面还有上/下标）
    var err = checkEquation(L, R, where);
    if (err) errs.push(err);
  }
}

console.log('== 1. 章节结构 ==');
ok(DB.chapters.length === 3, '应有3章，实际' + DB.chapters.length);
var secCount = DB.chapters.reduce(function (n, c) { return n + c.sections.length; }, 0);
ok(secCount === 9, '应有9节，实际' + secCount);
DB.chapters.forEach(function (c) {
  ok(!!c.id && !!c.no && !!c.title && !!c.color && !!c.intro && !!c.tagline, '章字段完整 ' + c.id);
  c.sections.forEach(function (s) {
    ok(!!s.id && !!s.no && !!s.title && !!s.lead && s.points.length >= 2 && s.quiz.length >= 4, '节字段完整 ' + s.id);
    s.points.forEach(function (p) {
      ok(!!p.id && !!p.title && p.blocks.length >= 1, '知识点卡完整 ' + p.id);
      p.blocks.forEach(function (b) { ok(!!b && !!b[0], '块完整 ' + p.id); });
    });
  });
});

console.log('== 2. 随堂练题库 ==');
var qids = {};
DB.questions.forEach(function (q) {
  qids[q.id] = 1;
  ok(!!q.stem && q.stem.length >= 4, '题干完整 ' + q.id);
  ok(q.opts && q.opts.length === 4, '四选项 ' + q.id);
  ok(typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3, '答案下标合法 ' + q.id);
  ok(!!q.exp && q.exp.length >= 5 && q.exp.indexOf('？') < 0 && q.exp.indexOf('？这里') < 0, '解析完整无草稿 ' + q.id);
  ok(!!q.sec && !!q.tag, '节/标签齐全 ' + q.id);
  ok(/[\u4e00-\u9fa5]/.test(q.exp), '解析为中文 ' + q.id);
});
DB.chapters.forEach(function (c) { c.sections.forEach(function (s) {
  s.quiz.forEach(function (qid) { ok(!!qids[qid], '随堂练id存在 ' + s.id + ' → ' + qid); });
  ok(s.quiz.length === DB.questions.filter(function (q) { return q.sec === s.id; }).length, '节练习数=该节题目数 ' + s.id);
}); });

console.log('== 3. 图解注册 ==');
var needDgm = ['mole-bridge', 'redox-map', 'class-tree', 'na-family', 'cl-family', 'iron-triangle', 'sulfur-states', 'nitrogen-cycle', 'colloid'];
needDgm.forEach(function (d) { ok(!!DB.diagrams[d], '图解已注册 ' + d); });
DB.chapters.forEach(function (c) { c.sections.forEach(function (s) { s.points.forEach(function (p) {
  p.blocks.forEach(function (b) { if (b[0] === 'dgm') ok(!!DB.diagrams[b[1]], '引用图解存在 ' + b[1]); });
}); }); });

console.log('== 4. 方程式 eq 块校验（元素守恒+电荷守恒）==');
var eqCount = 0;
DB.chapters.forEach(function (c) { c.sections.forEach(function (s) { s.points.forEach(function (p) {
  p.blocks.forEach(function (b) {
    if (b[0] === 'eq') {
      eqCount++;
      var err = checkEquation(b[2], b[3], p.id);
      ok(!err, err || 'eq 配平 ' + b[2] + ' = ' + b[3]);
      ok(typeof b[1] === 'string' || b[1] === null, 'eq 条件字段合法 ' + p.id);
    }
  });
}); }); });
ok(eqCount >= 25, 'eq 块数量≥25，实际' + eqCount);

console.log('== 5. 全站文本方程式扫描（试卷+解析+卡片）==');
var scanErrs = [];
function scanObj(o, where) {
  if (typeof o === 'string') scanText(o, where, scanErrs);
  else if (Array.isArray(o)) o.forEach(function (x, i) { scanObj(x, where + '[' + i + ']'); });
  else if (o && typeof o === 'object') for (var k in o) { if (k === 'opts') continue; scanObj(o[k], where + '.' + k); } // opts 是故意写错的选项，不扫
}
DB.chapters.forEach(function (c) { scanObj(c, c.id); });
DB.questions.forEach(function (q) { scanObj(q, q.id); });
DB.exams.forEach(function (ex) { scanObj(ex, ex.id); });
scanErrs.forEach(function (e) { ok(false, e); });
ok(true, '文本方程式扫描完成（发现 ' + scanErrs.length + ' 处配平问题）');

console.log('== 6. 试卷 ==');
ok(DB.exams.length === 2, '应有2套卷子');
DB.exams.forEach(function (ex) {
  var n = 0;
  ex.mcq.forEach(function (g) { g.qs.forEach(function (q) {
    n++;
    ok(!!q.stem && q.opts.length === 4 && typeof q.ans === 'number' && !!q.exp && q.exp.indexOf('？') < 0, '卷题完整无草稿 ' + ex.id);
  }); });
  ok(n === 25, ex.title.slice(0, 16) + ' 选择题25题，实际' + n);
  ok(ex.essay.length === 3, ex.id + ' 综合题3道');
  ex.essay.forEach(function (es) {
    ok(es.qs.length >= 3 && es.ans.length >= 3, ex.id + ' 综合' + es.no + ' 问答与答案齐全');
    ok(es.qs.length === es.ans.length, ex.id + ' 综合' + es.no + ' 问数=答案数');
  });
  ok(!!ex.note && !!ex.meta, ex.id + ' 说明齐全');
});

console.log('== 7. 福鼎元素与拓展 ==');
var fuding = 0, ext = 0;
DB.chapters.forEach(function (c) { c.sections.forEach(function (s) { s.points.forEach(function (p) {
  p.blocks.forEach(function (b) {
    if (b[0] === 'fuding') { fuding++; ok(b[1][0] && b[1][1] && b[1][1].length > 20, '福鼎卡内容完整 ' + p.id); }
    if (b[0] === 'ext') ext++;
    if (b[0] === 'tip' || b[0] === 'memo') ok(!!b[1] && b[1].length > 5, '提示卡完整');
  });
}); }); });
ok(fuding >= 8, '福鼎限定卡≥8，实际' + fuding);
ok(ext >= 5, '拓展视野盒≥5，实际' + ext);

console.log('');
console.log('结果：' + pass + ' 通过，' + fail + ' 失败');
process.exit(fail ? 1 : 0);
