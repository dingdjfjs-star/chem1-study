// 修复 essay26(4) 石灰水足量/少量配对错误 + diagrams typo（一次性）
const fs = require('fs');
let t = fs.readFileSync(__dirname + '\\..\\js\\data-exams.js', 'utf8');
const a1 = '（4）2HCO₃⁻ + Ca²⁺ + 2OH⁻ = CaCO₃↓ + CO₃²⁻ + 2H₂O（石灰水足量，按 Ca(OH)₂ 比例电离出 Ca²⁺ 与 2OH⁻）';
if (t.indexOf(a1) < 0) { console.log('essay 锚点未找到'); process.exit(1); }
t = t.replace(a1, '（4）HCO₃⁻ + Ca²⁺ + OH⁻ = CaCO₃↓ + H₂O（石灰水足量即 Ca(OH)₂ 过量；若石灰水少量则写 2HCO₃⁻ + Ca²⁺ + 2OH⁻ = CaCO₃↓ + CO₃²⁻ + 2H₂O）');
fs.writeFileSync(__dirname + '\\..\\js\\data-exams.js', t, 'utf8');
let d = fs.readFileSync(__dirname + '\\..\\js\\diagrams.js', 'utf8');
if (d.indexOf('拓拓展') >= 0) d = d.split('拓拓展').join('拓展');
fs.writeFileSync(__dirname + '\\..\\js\\diagrams.js', d, 'utf8');
console.log('essay26(4) 与 typo 已修复');
