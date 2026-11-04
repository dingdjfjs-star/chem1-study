/* 生成单文件版：把 css/js 全部内联进一个 html，微信/QQ 直接发文件也能用 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 内联主样式（保留 index.html 里 eq 方程式的附加样式块）
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="css\/style.css">/, () => '<style>\n' + css + '\n</style>');

// 按原顺序内联脚本
const scripts = ['diagrams', 'data-ch1', 'data-ch2', 'data-ch3', 'data-exams', 'app'];
const parts = scripts.map(function (name) {
  const code = fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8')
    .replace(/<\/script/gi, '<\\/script');
  return '<script>\n' + code + '\n</script>';
});
html = html.replace(/<script src="js\/[\w.-]+\.js"><\/script>\s*/g, '');
html = html.replace('</body>', parts.join('\n') + '\n</body>');
html = html.replace('<title>福鼎少年学化学 · 鲁科版必修第一册</title>', '<title>福鼎少年学化学 · 必修一（单文件版）</title>');

const out = path.join(root, '手机单文件版.html');
fs.writeFileSync(out, html, 'utf8');
console.log('已生成:', out, '大小:', (fs.statSync(out).size / 1024).toFixed(0) + 'KB');
