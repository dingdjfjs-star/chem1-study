// 更新 README 与 AGENTS 计数（一次性）
const fs = require('fs');
let r = fs.readFileSync(__dirname + '\\..\\README.md', 'utf8');
r = r.split('3 章 9 节 26 张知识点卡').join('必修一 3 章 9 节 ＋ 必修二 3 章 9 节（下学期预习区）共 40 张知识点卡');
r = r.split('**60 条化学方程式独立成块渲染**').join('**71 条化学方程式独立成块渲染**');
r = r.split('10 张本地案例卡').join('9 张本地案例卡');
r = r.split('9 幅交互 SVG').join('11 幅交互 SVG（新增前 20 号元素周期表、化学键电子式）');
r = r.split('59 道选择题').join('94 道选择题');
r = r.split('9 个"拓展视野"加分盒').join('9 个"拓展视野"加分盒');
r = r.split('test/test.js        数据自检 + 方程式自动配平/电荷守恒校验器').join('test/test.js        数据自检 + 方程式自动配平/电荷守恒校验器（1214 项断言）');
r = r.split('js/data-ch1..3.js   三章知识点数据 + 随堂练题库（方程式全部用 eq 块）').join('js/data-ch1..3.js   必修一三章数据 + 题库（方程式全部用 eq 块）\njs/data-b2.js       必修第二册三章预习数据（ch4~ch6，phase 标记）');
r = r.split('**867 项断言全绿**').join('**1214 项断言全绿**');
fs.writeFileSync(__dirname + '\\..\\README.md', r, 'utf8');

let a = fs.readFileSync('E:/zcode/AGENTS.md', 'utf8');
a = a.split('3 章 9 节**（物质的量在第1章、钠氯是研究方法案例、无周期律化学键——与人教版结构不同，目录经电子课本网扫描核对）').join('3 章 9 节**（物质的量在第1章、钠氯是研究方法案例——与人教版结构不同，目录经电子课本网扫描核对；**必修第二册亦为 3 章**：原子结构元素周期律/化学键化学反应规律/简单的有机化合物，已作"下学期预习区"补入，全站 6 章 18 节）');
a = a.split('26 张知识点卡（**60 条化学方程式独立 eq 块**，条件标在箭头上）').join('40 张知识点卡（**71 条化学方程式独立 eq 块**，条件标在箭头上）');
a = a.split('+ 9 幅交互 SVG（物质的量桥梁/氧化还原/物质分类树/钠家族/氯家族/铁三角/硫价态/氮循环/丁达尔）+ 随堂练 62 题').join('+ 11 幅交互 SVG（物质的量桥梁/氧化还原/物质分类树/钠家族/氯家族/铁三角/硫价态/氮循环/丁达尔/前20号周期表/化学键电子式）+ 随堂练 94 题');
a = a.split('test/test.js 867 项断言全绿').join('test/test.js 1214 项断言全绿');
fs.writeFileSync('E:/zcode/AGENTS.md', a, 'utf8');
console.log('README 与 AGENTS 计数已更新');
