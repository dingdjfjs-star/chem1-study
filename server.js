// 高一化学必修一学习站 · 静态服务器（免依赖）
// 端口 8945；监听 0.0.0.0，手机与电脑同一 WiFi 即可访问
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const root = __dirname, port = process.env.PORT || 8945;
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.pdf': 'application/pdf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end('403'); }
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 找不到页面：' + p); }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(b);
  });
}).listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('  高一化学必修一学习站 已启动');
  console.log('  电脑访问：  http://localhost:' + port);
  const seen = {};
  for (const k in os.networkInterfaces()) {
    for (const it of os.networkInterfaces()[k]) {
      if (it.family === 'IPv4' && !it.internal && !seen[it.address]) {
        seen[it.address] = 1;
        console.log('  手机访问：  http://' + it.address + ':' + port + '   （需同一 WiFi）');
      }
    }
  }
  console.log('');
});
