# 福鼎少年学化学 · 鲁科版高中化学必修第一册

给福鼎高一学生做的化学必修一交互式学习站。**教材版本已查实：宁德市（含福鼎）高中化学使用鲁科版（山东科学技术出版社 2019 版）必修第一册**，目录按电子课本网逐页扫描核对（3 章 9 节），与人教版结构不同（物质的量在第 1 章；钠、氯是"研究物质性质"的案例；无周期律/化学键章节）。

**已上线：https://dingdjfjs-star.github.io/chem1-study/ · 仓库：https://github.com/dingdjfjs-star/chem1-study**（异地分享直接发链接；单文件版直链：https://dingdjfjs-star.github.io/chem1-study/手机单文件版.html ）

**更新线上**：改完内容跑 `node tools\build-single.js`，再执行：
`node ~/.agents/skills/github-pages-deploy/scripts/deploy-pages.js --source "E:\zcode\玩\高一化学必修一" --repo chem1-study --use-stored-credential --message "更新说明"`
（本站 Pages 用 **GitHub Actions 构建**——legacy 构建器曾卡死报错，.github/workflows/deploy.yml 已配置，勿改回 legacy）

## 里面有什么

| 模块 | 内容 |
|---|---|
| 知识点 | 必修一 3 章 9 节 ＋ 必修二 3 章 9 节（下学期预习区）共 40 张知识点卡：**71 条化学方程式独立成块渲染**（条件标注在箭头上、可逆号 ⇌、电离式）、"老班长敲黑板"易错提醒、记忆口诀、7 个"拓展视野"加分盒，高频考点标星 |
| 福鼎限定 | 8 张本地案例卡：台风后含氯消毒剂防疫（桑美）、84+洁厕灵生成氯气、早餐铺膨松剂、自来水余氯、晨雾丁达尔效应、沙埕港渔船防锈、补铁剂配维C、酸雨与茶山、白茶园施肥单、盐水配制 |
| 图解 | 11 幅交互 SVG（新增前 20 号元素周期表、化学键电子式）：物质的量"桥梁图"、氧化还原"升失氧降得还"、物质分类树、钠家族/氯家族转化图、铁三角、硫价态图、氮循环、丁达尔效应 |
| 随堂练 | 62 道选择题：即时判分+解析，答错自动进错题本 |
| 刷卷 | 2 套宁德市期末质检（福建学考）体例模拟卷：25 选择×2 + 综合题（含方程式书写），选择题自动批改，综合题对照参考答案自评 |
| 错题/成就 | 错题本（答对重做自动移出）+ 10 枚成就 |
| 质量保证 | `node test\test.js` **1214 项断言全绿**，核心是**方程式自动配平校验器**（元素守恒+电荷守恒，扫描全部 eq 块和全站文本中的方程式——上线前抓出并修正过一处 2HBr→2HCl 真笔误） |

## 结构

```
index.html          入口（含方程式渲染样式）
css/style.css       纸墨手账风样式
js/data-ch1..3.js   必修一三章数据 + 题库（方程式全部用 eq 块）
js/data-b2.js       必修第二册三章预习数据（ch4~ch6，phase 标记）
js/data-exams.js    2 套宁德体例模拟卷
js/diagrams.js      11 幅交互 SVG（新增前 20 号元素周期表、化学键电子式） 图解
js/app.js           hash 路由 / 答题 / 进度 / 错题本 / 成就（复用地理站架构）
tools/build-single.js  生成"手机单文件版.html"
test/test.js        数据自检 + 方程式自动配平/电荷守恒校验器（1214 项断言）
手机单文件版.html    离线单文件版（176KB）
.github/workflows/  GitHub Actions Pages 部署
```

## 教材版本依据

- 宁德市高一化学＝鲁科版：电子课本网宁德市教材版本页（http://www.dzkbw.com/city/fujian_ningdeshi）
- 鲁科版必修第一册目录（第1章 认识化学科学／第2章 元素与物质世界／第3章 物质的性质与转化）：http://www.dzkbw.com/books/lkb/huaxue/pgzbxd1c
- 教材版本因地区而异，若学校确认用其他版本，改动 js/data-ch*.js 即可适配

## 数据约定

- 知识点卡 blocks：`p / ul / kv / table / tip / memo / ext / fuding / dgm / eq`
- **eq 块格式**：`['eq', 条件, 左边, 右边]`——条件为 '点燃/Δ/可逆/⇌/=/电离/…'，null 表示无条件直箭头
- 进度存 `localStorage['geo1v1']`
