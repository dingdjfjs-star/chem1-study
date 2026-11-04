// app.js 接入必修二预习区（幂等补丁）
const fs = require('fs');
const p = __dirname + '\\..\\js\\app.js';
let t = fs.readFileSync(p, 'utf8');
let log = [];
function rep(a, b, name) {
  if (t.indexOf(a) < 0) { log.push('跳过(已应用或未找到): ' + name); return; }
  t = t.split(a).join(b);
  log.push('已应用: ' + name);
}
rep('鲁科版 高中化学 必修第一册 · 三章考点全掌握', '鲁科版 高中化学 必修一二 · 上学期考点＋下学期预习', '副标题');
rep('三章知识点 <small>点章进入</small>', '六章知识点 <small>第4~6章＝必修第二册·下学期预习</small>', '首页小节标题');
rep("'<div class=\"sec-title\" style=\"color:' + c.color + '\">' + c.no + ' ' + c.title + '</div>'",
    "'<div class=\"sec-title\" style=\"color:' + c.color + '\">' + c.no + ' ' + c.title + (c.phase === '二' ? '（下学期预习）' : '') + '</div>'", '章列表标记');
rep("<h3>' + c.title + '</h3><p>' + c.tagline",
    "<h3>' + (c.phase === '二' ? '<span class=\"note-tag\">下学期预习</span> ' : '') + c.title + '</h3><p>' + c.tagline", '首页章卡标签');
fs.writeFileSync(p, t, 'utf8');
console.log(log.join('\n'));
