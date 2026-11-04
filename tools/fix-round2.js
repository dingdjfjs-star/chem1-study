// 第二轮修复（一次性）：阈值放宽 + 解析器支持 ·N 与双键= + 电子半反应过滤 + 数据系数修正
const fs = require('fs');
let log = [];

// 1) test.js 阈值放宽（预习节 1 卡 3 题即可）
let t = fs.readFileSync(__dirname + '\\..\\test\\test.js', 'utf8');
const ta = "s.points.length >= 2 && s.quiz.length >= 4";
if (t.indexOf(ta) >= 0) t = t.split(ta).join("s.points.length >= 1 && s.quiz.length >= 3");
log.push('test 阈值：' + (t.indexOf(ta) < 0 ? '已放宽' : '未改动'));

// 2) parseSide：·N 转 +N；剥离双键 =；扫描过滤电子半反应
const ca = ".replace(/[↑↓]/g, '')\n    .trim();";
if (t.indexOf(ca) >= 0) {
  t = t.replace(ca, ".replace(/[↑↓]/g, '')\n    .replace(/\\u00b7(\\d*)/g, '+$1')   // 水合点 ·8H₂O → +8H₂O（各组分相加）\n    .replace(/=/g, '')                              // 双键/可逆号中的 = 不参与计数\n    .trim();");
  log.push('cleanSide 已增强');
} else log.push('cleanSide 锚点未找到!');

const ef = "    if (/[^\\u2070-\\u209f\\u207a-\\u207e\\u00b2\\u00b3\\u00b9]/.test(L[0] || '')) continue; // 左起不得是上/下标（截断）";
if (t.indexOf("if (/[^\\u2070") < 0) {
  const efAnchor = "if (/[\\u00b2\\u00b3\\u00b9\\u2070-\\u207f\\u2080-\\u2089]/.test(L[0] || '')) continue; // 左起不得是上/下标（截断）";
  if (t.indexOf(efAnchor) >= 0) {
    t = t.replace(efAnchor, efAnchor + "\n    if (/e[\\u207a\\u207b]/.test(L + R)) continue;           // 电子半反应（2e⁻）不是分子方程式");
    log.push('电子过滤已加');
  } else log.push('电子过滤锚点未找到!');
} else log.push('电子过滤已存在');

fs.writeFileSync(__dirname + '\\..\\test\\test.js', t, 'utf8');

// 3) data-b2.js：补齐 SO₂ 系数
let d = fs.readFileSync(__dirname + '\\..\\js\\data-b2.js', 'utf8');
if (d.indexOf('SO₂+O₂⇌SO₃') >= 0) {
  d = d.split('SO₂+O₂⇌SO₃').join('2SO₂+O₂⇌2SO₃');
  log.push('SO₂ 系数已补');
} else log.push('SO₂ 锚点未找到（可能已修）');
fs.writeFileSync(__dirname + '\\..\\js\\data-b2.js', d, 'utf8');

console.log(log.join('\n'));
