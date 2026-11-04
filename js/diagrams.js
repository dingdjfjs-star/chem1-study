/* 化学图解库 · 手绘风 SVG 交互
   每个图解注册为 DB.diagrams[id] = { title, w, h, build(el) } */
(function () {
  var DB = window.DB = window.DB || {};
  var D = DB.diagrams = {};
  var INK = '#3a332b';

  function base(el, svg, btns, cap) {
    var h = '<div class="dgm-wrap">' + svg + '</div>';
    if (btns && btns.length) {
      h += '<div class="dgm-btns">' + btns.map(function (b) {
        return '<button data-act="' + b.act + '"' + (b.on ? ' class="on"' : '') + '>' + b.t + '</button>';
      }).join('') + '</div>';
    }
    h += '<div class="cap">' + cap + '</div>';
    el.innerHTML = h;
    el.$ = function (s) { return el.querySelector(s); };
    el.$$ = function (s) { return Array.prototype.slice.call(el.querySelectorAll(s)); };
  }
  function setCap(el, t) { var c = el.querySelector('.cap'); if (c) c.innerHTML = t; }
  function markBtn(el, act) {
    el.$$('.dgm-btns button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-act') === act); });
  }
  function box(x, y, w, hgt, txt, fill, fs) {
    return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hgt + '" rx="9" fill="' + (fill || '#fbf6e8') + '" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + hgt / 2 + 5.5) + '" text-anchor="middle" class="lg" font-size="' + (fs || 15) + '">' + txt + '</text></g>';
  }
  function arrow(x1, y1, x2, y2, col, id, label, labDx, labDy) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="3" marker-end="url(#' + id + ')" class="tap" data-cap="' + (label || '') + '">' +
      (label ? '' : '') + '</line>';
  }
  function defsMk(id, col) {
    return '<defs><marker id="' + id + '" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="' + (col || INK) + '"/></marker></defs>';
  }

  /* ========== 1. 物质的量"桥梁" ========== */
  D['mole-bridge'] = { title: '物质的量 n：连接微观与宏观的桥梁', w: 720, h: 380, build: function (el) {
    var s = defsMk('mb1') + defsMk('mb1r', '#b5432f');
    s += '<circle cx="360" cy="190" r="58" fill="#e2a93b" stroke="' + INK + '" stroke-width="2"/>' +
      '<text x="360" y="182" text-anchor="middle" class="lg" font-size="22" font-weight="700">n</text>' +
      '<text x="360" y="208" text-anchor="middle" class="lg" font-size="13">物质的量(mol)</text>';
    var node = function (x, y, t1, t2) {
      return '<g class="tap" data-cap="' + t1 + '"><rect x="' + (x - 82) + '" y="' + (y - 34) + '" width="164" height="68" rx="11" fill="#fbf6e8" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<text x="' + x + '" y="' + (y - 6) + '" text-anchor="middle" class="lg" font-size="17">' + t1 + '</text>' +
        '<text x="' + x + '" y="' + (y + 20) + '" text-anchor="middle" class="lg" font-size="12.5" fill="#6b6154">' + t2 + '</text></g>';
    };
    s += node(120, 78, '微粒数 N', '个（分子/原子/离子…）');
    s += node(600, 78, '质量 m', 'g');
    s += node(120, 302, '气体体积 V', 'L（标准状况）');
    s += node(600, 302, '物质的量浓度 c', 'mol/L（溶液）');
    s += arrow(214, 96, 306, 152, INK, 'mb1', null);
    s += arrow(506, 96, 414, 152, INK, 'mb1');
    s += arrow(214, 286, 306, 230, INK, 'mb1');
    s += arrow(506, 286, 414, 230, INK, 'mb1');
    s += '<text x="248" y="112" class="lg" font-size="13" fill="#b5432f">×Nₐ(6.02×10²³/mol)</text>';
    s += '<text x="392" y="112" text-anchor="end" class="lg" font-size="13" fill="#b5432f">÷M(g/mol)</text>';
    s += '<text x="248" y="270" class="lg" font-size="13" fill="#b5432f">÷Vm(22.4L/mol)</text>';
    s += '<text x="392" y="270" text-anchor="end" class="lg" font-size="13" fill="#b5432f">×c(mol/L)…见下</text>';
    var svg = '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], 'n 居中当"桥"：<b>n = N/Nₐ = m/M = V/Vm</b>（标况气体）。点四个框看每条路怎么算。注意：c＝n/V 里的 V 是<b>溶液</b>体积，别和气体体积混。');
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () {
      var k = nd.getAttribute('data-cap');
      var caps = {
        '微粒数 N': '<b>微粒数 N</b>：n = N/Nₐ。Nₐ≈6.02×10²³/mol。反过来 N = n·Nₐ。例：1 mol 水含 6.02×10²³ 个水分子、2×6.02×10²³ 个氢原子。',
        '质量 m': '<b>质量 m</b>：n = m/M。M 数值上等于相对分子/原子质量，单位 g/mol。例：M(H₂O)=18 g/mol，9 g 水就是 0.5 mol。',
        '气体体积 V': '<b>气体体积 V（标准状况）</b>：n = V/Vm，Vm≈22.4 L/mol。三个前提缺一不可：<b>气体＋标准状况（0℃、101kPa）</b>。水在标况是液体，不能套 22.4！',
        '物质的量浓度 c': '<b>物质的量浓度 c</b>：c = n/V，V 指<b>溶液</b>的体积（L）。1 mol NaCl 溶成 1 L 溶液，c=1 mol/L。'
      };
      setCap(el, caps[k]);
    }; });
  } };

  /* ========== 2. 氧化还原总览 ========== */
  D['redox-map'] = { title: '氧化还原：升失氧、降得还', w: 720, h: 400, build: function (el) {
    var s = defsMk('rm1', '#b5432f') + defsMk('rm1b', '#41679c');
    // 上：核心口诀
    s += '<g class="tap" data-cap="up"><rect x="30" y="30" width="310" height="120" rx="13" fill="#fbeee9" stroke="#c9836f" stroke-width="1.6"/>' +
      '<text x="185" y="66" text-anchor="middle" class="lg" font-size="17" fill="#b5432f" font-weight="700">化合价升高 · 失电子</text>' +
      '<text x="185" y="98" text-anchor="middle" class="lg" font-size="16" fill="#b5432f">被氧化 · 作还原剂</text>' +
      '<text x="185" y="128" text-anchor="middle" class="lg" font-size="13" fill="#6d3a2c">例：Fe → Fe²⁺ + 2e⁻（升）</text></g>';
    s += '<g class="tap" data-cap="down"><rect x="380" y="30" width="310" height="120" rx="13" fill="#e8eef5" stroke="#7a94b5" stroke-width="1.6"/>' +
      '<text x="535" y="66" text-anchor="middle" class="lg" font-size="17" fill="#41679c" font-weight="700">化合价降低 · 得电子</text>' +
      '<text x="535" y="98" text-anchor="middle" class="lg" font-size="16" fill="#41679c">被还原 · 作氧化剂</text>' +
      '<text x="535" y="128" text-anchor="middle" class="lg" font-size="13" fill="#33505f">例：Cu²⁺ + 2e⁻ → Cu（降）</text></g>';
    // 中间反应
    s += '<g class="tap" data-cap="ex"><rect x="150" y="170" width="420" height="56" rx="11" fill="#fdf6e8" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<text x="360" y="205" text-anchor="middle" class="lg" font-size="16">Fe + CuSO₄ = FeSO₄ + Cu</text></g>';
    s += '<line x1="230" y1="152" x2="230" y2="168" stroke="#b5432f" stroke-width="3" marker-end="url(#rm1)"/><text x="238" y="166" class="lg" font-size="12" fill="#b5432f">失2e⁻</text>';
    s += '<line x1="490" y1="152" x2="490" y2="168" stroke="#41679c" stroke-width="3" marker-end="url(#rm1b)"/><text x="498" y="166" class="lg" font-size="12" fill="#41679c">得2e⁻</text>';
    // 下：四大反应类型关系
    s += '<g class="tap" data-cap="types"><rect x="30" y="248" width="660" height="130" rx="13" fill="#eef0e2" stroke="#8aa86a" stroke-width="1.6"/>' +
      '<text x="360" y="278" text-anchor="middle" class="lg" font-size="15" font-weight="700">四大基本反应类型 与 氧化还原的关系</text>' +
      '<text x="360" y="308" text-anchor="middle" class="lg" font-size="13.5">置换反应——<b>全部</b>是氧化还原反应</text>' +
      '<text x="360" y="334" text-anchor="middle" class="lg" font-size="13.5">化合、分解反应——<b>部分</b>是（有单质参加/生成的多半是）</text>' +
      '<text x="360" y="360" text-anchor="middle" class="lg" font-size="13.5">复分解反应——<b>一定不是</b>（没有化合价变化）</text></g>';
    var svg = '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '氧化还原的本质是<b>电子转移</b>，特征是<b>化合价升降</b>。口诀：「升失氧、降得还，剂性相反」（升、失、被氧化→还原剂）。点三个区域看细节。');
    var caps = {
      up: '<b>升、失、氧</b>：化合价升高→失去电子→被氧化→这一物质是<b>还原剂</b>（它把电子给了别人）。活泼金属、C、H₂、CO、KI 等是常见还原剂。',
      down: '<b>降、得、还</b>：化合价降低→得到电子→被还原→这一物质是<b>氧化剂</b>。O₂、Cl₂、浓硫酸、HNO₃、KMnO₄、Fe³⁺ 等是常见氧化剂。',
      ex: '看 Fe + CuSO₄：Fe 从 0 升到 +2（失电子，还原剂，被氧化）；Cu²⁺ 从 +2 降到 0（得电子，氧化剂，被还原）。硫酸根"看戏"，化合价没变。',
      types: '四大反应类型是"按形式"分，氧化还原是"按本质"分，两套分类可以交叉：<b>置换一定属于氧化还原；复分解一定不属于</b>；有单质参加的化合、有单质生成的分解通常是氧化还原。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 3. 物质分类树 ========== */
  D['class-tree'] = { title: '物质分类树（含电解质分支）', w: 720, h: 420, build: function (el) {
    var s = defsMk('ct1');
    function node(x, y, w, txt, cap, fill) {
      return '<g class="tap" data-cap="' + cap + '"><rect x="' + (x - w / 2) + '" y="' + y + '" width="' + w + '" height="40" rx="9" fill="' + (fill || '#fbf6e8') + '" stroke="' + INK + '" stroke-width="1.5"/>' +
        '<text x="' + x + '" y="' + (y + 26) + '" text-anchor="middle" class="lg" font-size="14.5">' + txt + '</text></g>';
    }
    function line(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/>'; }
    s += node(360, 16, 180, '物质', 'matter', '#e2a93b33');
    s += line(360, 56, 190, 96) + line(360, 56, 530, 96);
    s += node(190, 96, 160, '混合物', 'mix'); s += node(530, 96, 160, '纯净物', 'pure');
    s += line(190, 136, 120, 176) + line(190, 136, 262, 176);
    s += node(120, 176, 150, '溶液（NaCl水）', 'mix'); s += node(262, 176, 150, '胶体（Fe(OH)₃胶体）', 'colloid');
    s += line(530, 136, 400, 216) + line(530, 136, 530, 216) + line(530, 136, 645, 216);
    s += node(400, 216, 130, '单质', 'pure'); s += node(530, 216, 130, '酸/碱/盐', 'elec'); s += node(645, 216, 130, '氧化物', 'oxide');
    s += line(530, 256, 425, 296) + line(530, 256, 635, 296);
    s += node(425, 296, 180, '电解质（能导电的化合物）', 'elec'); s += node(645, 296, 150, '非电解质', 'nonelec');
    s += line(425, 336, 340, 372) + line(425, 336, 510, 372);
    s += node(340, 372, 210, '强电解质：强酸/强碱/大多数盐', 'elec', '#eef3e4'); s += node(510, 372, 210, '弱电解质：弱酸/弱碱/H₂O', 'elec', '#fdf6e8');
    s += '<text x="645" y="356" text-anchor="middle" class="lg" font-size="12" fill="#6b6154">CO₂、SO₂、NH₃、</text>';
    s += '<text x="645" y="374" text-anchor="middle" class="lg" font-size="12" fill="#6b6154">蔗糖、酒精等</text>';
    s += '<text x="645" y="392" text-anchor="middle" class="lg" font-size="12" fill="#6b6154">（本身不电离）</text>';
    var svg = '<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '点节点看说明。最大陷阱：<b>CO₂、SO₂、NH₃ 是非电解质</b>——它们的水溶液能导电，是因为生成了 H₂CO₃ 等电解质，不是它们自己电离！');
    var caps = {
      matter: '<b>物质</b>：先按"是否一种物质"分成混合物与纯净物。冰水混合物只含 H₂O 一种物质，是<b>纯净物</b>！',
      mix: '<b>混合物</b>：由两种或以上物质组成。溶液、胶体、浊液是三种分散系。空气、盐酸、合金都是混合物。',
      pure: '<b>纯净物</b>：一种物质组成。单质（同种元素）与化合物（不同种元素）。同素异形体混合（如 O₂ 和 O₃ 混在一起）是混合物！',
      colloid: '<b>胶体</b>：分散质粒子直径 1-100nm 的分散系。最稳的鉴别法是<b>丁达尔效应</b>。Fe(OH)₃ 胶体：向沸水滴加饱和 FeCl₃ 溶液，继续加热至红褐色——<b>不能久沸、不搅拌、不写"沉淀"符号</b>。',
      elec: '<b>电解质</b>：<b>在水溶液里或熔融状态下能导电的化合物</b>。酸、碱、盐、金属氧化物（如 CaO）、H₂O 都是。导电的必须是"化合物自身电离"。',
      nonelec: '<b>非电解质</b>：在水溶液和熔融状态下都不导电的化合物：CO₂、SO₂、NH₃、蔗糖、酒精。<b>单质（Cu、Cl₂）和混合物（盐酸）既不是电解质也不是非电解质</b>——这是每年必挖的坑。',
      oxide: '<b>氧化物</b>：两种元素组成、其中一种是氧。酸性氧化物（CO₂、SO₂，多数非金属）、碱性氧化物（Na₂O、CaO，金属）、特殊：Na₂O₂ 是过氧化物，Al₂O₃ 两性（高中拓展）。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 4. 钠及其化合物转化 ========== */
  D['na-family'] = { title: '钠家族转化图', w: 720, h: 380, build: function (el) {
    var s = defsMk('nf1', '#b5432f') + defsMk('nf1b', '#41679c');
    s += box(40, 40, 110, 44, 'Na', '#fbeee9', 18);
    s += box(290, 40, 150, 44, 'Na₂O / Na₂O₂', '#fbf6e8', 15);
    s += box(540, 40, 130, 44, 'NaOH', '#eef3e4', 18);
    s += box(290, 170, 150, 44, 'Na₂CO₃', '#fdf6e8', 17);
    s += box(540, 170, 130, 44, 'NaHCO₃', '#fdf6e8', 16);
    s += '<line x1="150" y1="62" x2="284" y2="62" stroke="' + INK + '" stroke-width="3" marker-end="url(#nf1b)" class="tap" data-cap="o2"/>' +
      '<text x="215" y="52" text-anchor="middle" class="lg" font-size="12">O₂（常温→Na₂O 点燃→Na₂O₂）</text>';
    s += '<line x1="440" y1="62" x2="534" y2="62" stroke="' + INK + '" stroke-width="3" marker-end="url(#nf1b)" class="tap" data-cap="h2o"/>' +
      '<text x="487" y="52" text-anchor="middle" class="lg" font-size="12">+H₂O（Na₂O₂）</text>';
    s += '<line x1="150" y1="84" x2="284" y2="184" stroke="#b5432f" stroke-width="3" marker-end="url(#nf1)" class="tap" data-cap="water"/>' +
      '<text x="180" y="150" class="lg" font-size="12" fill="#b5432f">+H₂O（剧烈）</text>';
    s += '<line x1="580" y1="84" x2="470" y2="168" stroke="#b5432f" stroke-width="3" marker-end="url(#nf1)" class="tap" data-cap="co2"/>' +
      '<text x="560" y="140" class="lg" font-size="12" fill="#b5432f">+CO₂+H₂O</text>';
    s += '<line x1="448" y1="186" x2="534" y2="186" stroke="#41679c" stroke-width="3" marker-end="url(#nf1b)" class="tap" data-cap="hcl"/>' +
      '<text x="491" y="176" text-anchor="middle" class="lg" font-size="12">+CO₂+H₂O</text>';
    s += '<line x1="534" y1="206" x2="448" y2="206" stroke="#41679c" stroke-width="3" marker-end="url(#nf1b)" class="tap" data-cap="heat"/>' +
      '<text x="491" y="224" text-anchor="middle" class="lg" font-size="12">Δ(受热分解)</text>';
    s += '<line x1="365" y1="214" x2="365" y2="272" stroke="#b5432f" stroke-width="3" marker-end="url(#nf1)" class="tap" data-cap="hclb"/>' +
      '<text x="378" y="250" class="lg" font-size="12" fill="#b5432f">+HCl</text>';
    s += box(290, 280, 150, 44, 'CO₂ ↑ + H₂O + NaCl', '#eef0e2', 13);
    var svg = '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '点箭头看反应和方程式。记住"三角关系"：<b>Na₂CO₃ ⇌ NaHCO₃</b>（加 CO₂+H₂O 向右；加热向左）——膨松剂微项目、鉴别题全考它。');
    var caps = {
      o2: '钠在空气中<b>缓慢氧化</b>变暗生成白色 Na₂O；在空气中<b>点燃</b>剧烈燃烧、发出黄色火焰，生成<b>淡黄色 Na₂O₂</b>（过氧化钠，氧为-1价）。',
      h2o: '过氧化钠与水：<b>2Na₂O₂ + 2H₂O = 4NaOH + O₂↑</b>。供氧剂（潜艇、消防呼吸面具）！与 CO₂：<b>2Na₂O₂ + 2CO₂ = 2Na₂CO₃ + O₂</b>。',
      water: '钠与水（浮熔游响红）：浮（密度比水小）、熔（熔点低）、游、响、红（滴酚酞变红）。<b>2Na + 2H₂O = 2NaOH + H₂↑</b>。钠着火<b>不能用水扑</b>，用干沙盖！',
      co2: 'NaOH 吸收 CO₂：2NaOH + CO₂ = Na₂CO₃ + H₂O（NaOH 变质就是这个原理，密封保存）。',
      hcl: '向饱和碳酸钠溶液中通 CO₂：<b>Na₂CO₃ + CO₂ + H₂O = 2NaHCO₃↓</b>（析出白色晶体——因为碳酸氢钠溶解度更小）。',
      heat: '<b>2NaHCO₃ =Δ= Na₂CO₃ + H₂O + CO₂↑</b>——碳酸氢钠不稳定，受热易分解。这也是"鉴别两者"的方法（加热有气体的是 NaHCO₃），膨松剂产气原理。',
      hclb: '与盐酸：碳酸钠<b>逐滴加盐酸</b>先 Na₂CO₃+HCl=NaHCO₃+NaCl、后产生气体；碳酸氢钠一加就冒泡（反应更快）。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 5. 氯家族转化 ========== */
  D['cl-family'] = { title: '氯家族转化图', w: 720, h: 380, build: function (el) {
    var s = defsMk('cf1', '#b5432f') + defsMk('cf1b', '#41679c');
    s += box(40, 40, 110, 44, 'Cl₂', '#e8eef5', 19);
    s += box(300, 40, 130, 44, 'HCl → 盐酸盐', '#fbf6e8', 14);
    s += box(550, 40, 130, 44, 'AgCl↓ 白', '#eef0e2', 14);
    s += box(300, 160, 130, 44, 'HClO', '#fbeee9', 17);
    s += box(550, 160, 130, 44, '漂白粉 Ca(ClO)₂', '#fbf6e8', 12);
    s += box(300, 280, 130, 44, 'NaClO（84消毒液）', '#fbf6e8', 11.5);
    s += '<line x1="150" y1="62" x2="294" y2="62" stroke="' + INK + '" stroke-width="3" marker-end="url(#cf1b)" class="tap" data-cap="h2"/>' +
      '<text x="222" y="52" text-anchor="middle" class="lg" font-size="12">+H₂ 点燃</text>';
    s += '<line x1="430" y1="62" x2="544" y2="62" stroke="' + INK + '" stroke-width="3" marker-end="url(#cf1b)" class="tap" data-cap="ag"/>' +
      '<text x="487" y="52" text-anchor="middle" class="lg" font-size="12">+AgNO₃(稀HNO₃)</text>';
    s += '<line x1="150" y1="84" x2="294" y2="176" stroke="#b5432f" stroke-width="3" marker-end="url(#cf1)" class="tap" data-cap="water"/>' +
      '<text x="168" y="146" class="lg" font-size="12" fill="#b5432f">+H₂O（可逆）</text>';
    s += '<line x1="430" y1="182" x2="544" y2="182" stroke="#b5432f" stroke-width="0" /><line x1="430" y1="182" x2="544" y2="182" stroke="' + INK + '" stroke-width="0"/>' +
      '<line x1="150" y1="96" x2="544" y2="176" stroke="' + INK + '" stroke-width="3" marker-end="url(#cf1b)" class="tap" data-cap="lime"/>' +
      '<text x="330" y="120" class="lg" font-size="12">+石灰乳 Ca(OH)₂</text>';
    s += '<line x1="150" y1="96" x2="294" y2="296" stroke="' + INK + '" stroke-width="3" marker-end="url(#cf1b)" class="tap" data-cap="naoh"/>' +
      '<text x="176" y="240" class="lg" font-size="12">+2NaOH</text>';
    s += '<line x1="430" y1="302" x2="544" y2="196" stroke="#41679c" stroke-width="3" marker-end="url(#cf1b)" class="tap" data-cap="bleach"/>' +
      '<text x="520" y="262" text-anchor="end" class="lg" font-size="12" fill="#41679c">漂白同源</text>';
    var svg = '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '氯气黄绿色、有毒（闻气体的正确姿势：用手轻扇！）。漂白"一家人"：HClO 是真凶，漂白粉、84 消毒液都靠它起效。点箭头看反应。');
    var caps = {
      h2: 'H₂ 在 Cl₂ 中燃烧：安静燃烧、<b>苍白色火焰</b>、瓶口白雾——生成的 HCl 溶于水即盐酸。也说明燃烧不一定需要氧气！',
      ag: '<b>Cl⁻ 的检验</b>：先加稀硝酸酸化（排除 CO₃²⁻等干扰），再加 AgNO₃ 溶液，产生<b>不溶于稀硝酸的白色沉淀 AgCl</b>。',
      water: 'Cl₂ + H₂O ⇌ HCl + HClO（可逆）。氯水"三分子四离子"：含 Cl₂、HClO、H₂O 与 H⁺、Cl⁻、ClO⁻、OH⁻。起漂白作用的是 <b>HClO</b>（不是 Cl₂！干燥氯气不漂白）。',
      lime: '工业制漂白粉：<b>2Cl₂ + 2Ca(OH)₂ = Ca(ClO)₂ + CaCl₂ + 2H₂O</b>。有效成分 Ca(ClO)₂。漂白原理：Ca(ClO)₂ + CO₂ + H₂O = CaCO₃↓ + 2HClO。',
      naoh: '<b>Cl₂ + 2NaOH = NaCl + NaClO + H₂O</b>——84 消毒液（NaClO）的制法，也是实验室吸收尾气 Cl₂ 的方法。NaOH 过量很关键。',
      bleach: '漂白类用品失效原因：<b>2HClO =光照= 2HCl + O₂↑</b>——次氯酸见光分解，所以要避光密封保存。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 6. 铁三角 ========== */
  D['iron-triangle'] = { title: '铁三角：Fe、Fe²⁺、Fe³⁺', w: 720, h: 380, build: function (el) {
    var s = defsMk('it1', '#b5432f') + defsMk('it1b', '#41679c');
    s += box(70, 150, 110, 46, 'Fe', '#fbf6e8', 19);
    s += box(305, 40, 120, 46, 'Fe²⁺（浅绿）', '#eef0e2', 15);
    s += box(540, 150, 120, 46, 'Fe³⁺（黄）', '#fbeee9', 16);
    // Fe→Fe²⁺
    s += '<line x1="120" y1="148" x2="300" y2="70" stroke="#41679c" stroke-width="3" marker-end="url(#it1b)" class="tap" data-cap="weakox"/>' +
      '<text x="150" y="94" class="lg" font-size="12.5" fill="#41679c">弱氧化剂（H⁺、Cu²⁺、S）</text>';
    // Fe²⁺→Fe³⁺
    s += '<line x1="425" y1="60" x2="535" y2="148" stroke="#b5432f" stroke-width="3" marker-end="url(#it1)" class="tap" data-cap="stroox"/>' +
      '<text x="500" y="86" class="lg" font-size="12.5" fill="#b5432f">强氧化剂（Cl₂、HNO₃、H₂O₂）</text>';
    // Fe³⁺→Fe²⁺
    s += '<line x1="535" y1="196" x2="425" y2="82" stroke="#41679c" stroke-width="3" marker-end="url(#it1b)" class="tap" data-cap="redu"/>' +
      '<text x="600" y="120" class="lg" font-size="12.5" fill="#41679c">还原剂（Fe、Cu、KI）</text>';
    // Fe²⁺→Fe
    s += '<line x1="300" y1="92" x2="130" y2="172" stroke="#b5432f" stroke-width="3" marker-end="url(#it1)" class="tap" data-cap="metal"/>' +
      '<text x="96" y="250" class="lg" font-size="12.5" fill="#b5432f">活泼金属（Zn、Al）置换</text>';
    // Fe³⁺→Fe（长弧）
    s += '<path d="M 600 196 Q 620 300 200 300 Q 120 300 100 200" fill="none" stroke="#41679c" stroke-width="3" marker-end="url(#it1b)" class="tap" data-cap="metal2"/>';
    // 检验标注
    s += '<text x="360" y="150" text-anchor="middle" class="lg" font-size="12.5" fill="#6b6154">检验：KSCN 变红的是 Fe³⁺</text>';
    s += '<text x="360" y="330" text-anchor="middle" class="lg" font-size="12.5" fill="#6b6154">Fe³⁺+3SCN⁻→红色；Fe²⁺先加KSCN不变红、再加氯水变红</text>';
    var svg = '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '铁的核心是"三价态互转"：遇强氧化剂升到 +3，遇弱氧化剂停在 +2；Fe³⁺ 遇还原剂可降回 +2 或到 0。点箭头看反应。');
    var caps = {
      weakox: 'Fe + 2HCl = FeCl₂ + H₂↑（铁与非氧化性酸生成<b>亚铁盐</b>）；Fe + Cu²⁺ = Fe²⁺ + Cu（湿法炼铜思想）。',
      stroox: '铁在 Cl₂ 中燃烧（无论量多少，直接到 +3）：<b>2Fe + 3Cl₂ =点燃= 2FeCl₃</b>，棕褐色烟。',
      redu: '<b>2FeCl₃ + Fe = 3FeCl₂</b>（加铁屑保 Fe²⁺ 溶液的常用手段）；Cu + 2FeCl₃ = CuCl₂ + 2FeCl₂（FeCl₃ 腐蚀铜箔）。',
      metal: 'Fe²⁺ 加活泼金属（如 Zn）可置换出铁。',
      metal2: 'Fe³⁺ 被足量活泼金属直接还原到 Fe 单质（如铝热反应思想、加足量 Zn）。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 7. 硫的价态转化 ========== */
  D['sulfur-states'] = { title: '硫的价态转化（-2 → 0 → +4 → +6）', w: 720, h: 360, build: function (el) {
    var s = defsMk('ss1', '#b5432f') + defsMk('ss1b', '#41679c');
    function state(x, y, title, sub, fill) {
      return '<g class="tap" data-cap="' + title + '"><circle cx="' + x + '" cy="' + y + '" r="46" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<text x="' + x + '" y="' + (y - 4) + '" text-anchor="middle" class="lg" font-size="16" font-weight="700">' + title + '</text>' +
        '<text x="' + x + '" y="' + (y + 20) + '" text-anchor="middle" class="lg" font-size="12.5">' + sub + '</text></g>';
    }
    s += state(120, 120, '-2价', 'H₂S、硫化物', '#eef0e2');
    s += state(280, 70, '0价', 'S（淡黄固体）', '#fdf6e8');
    s += state(450, 120, '+4价', 'SO₂、H₂SO₃', '#fbeee9');
    s += state(620, 70, '+6价', 'H₂SO₄（浓/稀）', '#e8eef5');
    s += '<line x1="162" y1="96" x2="238" y2="78" stroke="#b5432f" stroke-width="3" marker-end="url(#ss1)" class="tap" data-cap="s0"/><text x="200" y="70" text-anchor="middle" class="lg" font-size="11.5" fill="#b5432f">氧化(升)</text>';
    s += '<line x1="322" y1="86" x2="408" y2="104" stroke="#b5432f" stroke-width="3" marker-end="url(#ss1)" class="tap" data-cap="s4"/><text x="365" y="78" text-anchor="middle" class="lg" font-size="11.5" fill="#b5432f">氧化(升)</text>';
    s += '<line x1="492" y1="104" x2="578" y2="86" stroke="#b5432f" stroke-width="3" marker-end="url(#ss1)" class="tap" data-cap="s6"/><text x="535" y="80" text-anchor="middle" class="lg" font-size="11.5" fill="#b5432f">氧化(升)</text>';
    s += '<line x1="578" y1="116" x2="492" y2="134" stroke="#41679c" stroke-width="3" marker-end="url(#ss1b)" class="tap" data-cap="s6d"/><text x="535" y="152" text-anchor="middle" class="lg" font-size="11.5" fill="#41679c">还原(降)</text>';
    s += '<line x1="408" y1="136" x2="322" y2="118" stroke="#41679c" stroke-width="3" marker-end="url(#ss1b)" class="tap" data-cap="s4d"/><text x="365" y="146" text-anchor="middle" class="lg" font-size="11.5" fill="#41679c">还原(降)</text>';
    s += '<text x="360" y="230" text-anchor="middle" class="lg" font-size="13.5">最高价只有氧化性（浓硫酸），最低价只有还原性（H₂S），中间价态兼有（SO₂）</text>';
    s += '<text x="360" y="262" text-anchor="middle" class="lg" font-size="13.5" fill="#6b6154">S + O₂ =点燃= SO₂（蓝色火焰）　·　SO₂ 漂白品红，加热恢复（可逆、暂时的）</text>';
    s += '<text x="360" y="294" text-anchor="middle" class="lg" font-size="13.5" fill="#6b6154">SO₂ + H₂O ⇌ H₂SO₃　·　浓硫酸：吸水性、脱水性、强氧化性</text>';
    s += '<text x="360" y="326" text-anchor="middle" class="lg" font-size="13.5" fill="#6b6154">Cu + 2H₂SO₄(浓) =Δ= CuSO₄ + SO₂↑ + 2H₂O</text>';
    var svg = '<svg viewBox="0 0 720 360" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '价态规律是 sulfur 章的主线：升价被氧化、降价被还原。点圆圈看每种价态的代表物。');
    var caps = {
      '-2价': '最低价，<b>只有还原性</b>。H₂S 臭鸡蛋气味；硫化物沉淀多为黑色（如 CuS、PbS）。燃放鞭炮中的硫燃烧其实到 0/+4 价。',
      '0价': '<b>硫单质</b>：淡黄色固体、质脆。既可被氧化（到 +4）也可被还原（到 -2）——中间价态，"能上能下"。S+O₂=点燃=SO₂（空气中淡蓝色火焰）。',
      '+4价': '<b>SO₂</b>：有毒、刺激性气味、密度比空气大；<b>酸性氧化物</b>（SO₂+2NaOH=Na₂SO₃+H₂O）；<b>漂白性</b>（与有色物化合，不稳定、加热恢复——与 HClO 漂白机理不同！）；也有还原性（易被 O₂/卤素氧化）。',
      '+6价': '<b>硫酸</b>：稀硫酸只有酸性（H⁺）；<b>浓硫酸三大特性</b>：吸水性（干燥剂）、脱水性（把 H、O 按 2:1 夺走使纸碳化）、强氧化性（与 Cu、C 反应；常温下使 Fe、Al <b>钝化</b>——可用铁罐运浓硫酸）。',
      s6d: '浓→稀 或 被还原：Cu + 2H₂SO₄(浓) =Δ= CuSO₄ + SO₂↑ + 2H₂O。',
      s4d: 'SO₂ + Br₂ + 2H₂O = H₂SO₄ + 2HBr（SO₂ 使溴水褪色，体现还原性）。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 8. 氮循环转化 ========== */
  D['nitrogen-cycle'] = { title: '氮的循环与转化', w: 720, h: 380, build: function (el) {
    var s = defsMk('nc1', '#b5432f') + defsMk('nc1b', '#41679c');
    s += box(40, 150, 110, 46, 'N₂', '#eef0e2', 19);
    s += box(250, 40, 130, 46, 'NO（无色）', '#fbf6e8', 15);
    s += box(460, 40, 130, 46, 'NO₂（红棕）', '#fbeee9', 15);
    s += box(600, 150, 100, 46, 'HNO₃', '#e8eef5', 17);
    s += box(250, 260, 130, 46, 'NH₃ / 铵盐', '#eef3e4', 15);
    s += box(460, 260, 130, 46, '硝酸盐（氮肥）', '#eef3e4', 13);
    s += '<line x1="150" y1="158" x2="244" y2="72" stroke="' + INK + '" stroke-width="3" marker-end="url(#nc1b)" class="tap" data-cap="no"/>' +
      '<text x="150" y="104" class="lg" font-size="12">放电/O₂</text>';
    s += '<line x1="380" y1="62" x2="454" y2="62" stroke="#b5432f" stroke-width="3" marker-end="url(#nc1)" class="tap" data-cap="no2"/>' +
      '<text x="417" y="52" text-anchor="middle" class="lg" font-size="12" fill="#b5432f">+O₂</text>';
    s += '<line x1="560" y1="86" x2="632" y2="146" stroke="#b5432f" stroke-width="3" marker-end="url(#nc1)" class="tap" data-cap="hno3"/>' +
      '<text x="640" y="110" class="lg" font-size="12" fill="#b5432f">+H₂O</text>';
    s += '<line x1="150" y1="188" x2="244" y2="272" stroke="' + INK + '" stroke-width="3" marker-end="url(#nc1b)" class="tap" data-cap="nh3"/>' +
      '<text x="140" y="250" class="lg" font-size="12">+H₂(合成氨)</text>';
    s += '<line x1="380" y1="282" x2="454" y2="282" stroke="' + INK + '" stroke-width="3" marker-end="url(#nc1b)" class="tap" data-cap="salt"/>' +
      '<text x="417" y="272" text-anchor="middle" class="lg" font-size="12">+酸</text>';
    s += '<line x1="525" y1="256" x2="620" y2="200" stroke="#41679c" stroke-width="3" marker-end="url(#nc1b)" class="tap" data-cap="plant"/>' +
      '<text x="620" y="240" text-anchor="end" class="lg" font-size="12" fill="#41679c">被植物吸收</text>';
    var svg = '<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '氮气"性格稳定"（N≡N 三键很难断），所以氮的固定（把游离态变成化合态）是大事：自然固氮（放电、豆科植物根瘤菌）与人工合成氨。点箭头看转化。');
    var caps = {
      no: '<b>N₂ + O₂ =放电或高温= 2NO</b>（汽车引擎、雷雨中发生）。NO 无色、不溶水、有毒（与血红蛋白结合）；遇 O₂ 立即变红棕：<b>2NO + O₂ = 2NO₂</b>——NO 只能用排水法收集。',
      no2: 'NO₂ 红棕色、刺激性气味、有毒。<b>3NO₂ + H₂O = 2HNO₃ + NO</b>（工业制硝酸的核心，NO 循环再利用）。与水反应是雷雨发庄稼的第一步。',
      hno3: '<b>硝酸</b>：强酸性＋强氧化性。浓硝酸与 Cu：<b>Cu + 4HNO₃(浓) = Cu(NO₃)₂ + 2NO₂↑ + 2H₂O</b>；稀硝酸：<b>3Cu + 8HNO₃(稀) = 3Cu(NO₃)₂ + 2NO↑ + 4H₂O</b>。常温下浓硝酸使 Fe、Al <b>钝化</b>；见光分解，保棕色瓶。',
      nh3: '<b>合成氨</b>：N₂ + 3H₂ ⇌(高温高压、催化剂) 2NH₃（可逆反应！）。NH₃ 极易溶于水（1:700，喷泉实验）、与 HCl 相遇白烟（NH₃ + HCl = NH₄Cl）。',
      salt: '铵盐受热易分解：<b>NH₄Cl =Δ= NH₃↑ + HCl↑</b>。<b>NH₄⁺ 检验</b>：加 NaOH 溶液加热，湿润的红色石蕊试纸变蓝。铵态氮肥不能与草木灰（碱性）混用！',
      plant: '硝酸盐被植物根系吸收合成蛋白质——氮循环回到生命。人类活动排放过多 NOx 会造成雾霾与光化学烟雾（微项目：汽车限行的合理性）。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 9. 丁达尔效应 ========== */
  D['colloid'] = { title: '丁达尔效应：一束光辨胶体', w: 720, h: 320, build: function (el) {
    var s = defsMk('col1');
    function beaker(x, y, w, hgt, fill, label, beam, beamCol) {
      var t = '<g class="tap" data-cap="' + label + '"><path d="M ' + x + ' ' + y + ' L ' + x + ' ' + (y + hgt) + ' Q ' + (x + w / 2) + ' ' + (y + hgt + 14) + ' ' + (x + w) + ' ' + (y + hgt) + ' L ' + (x + w) + ' ' + y + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.6"/>';
      if (beam) t += '<rect x="' + (x - 26) + '" y="' + (y + hgt / 2 - 4) + '" width="' + (w / 2 + 26) + '" height="8" fill="' + beamCol + '" opacity=".65"/>';
      t += '<text x="' + (x + w / 2) + '" y="' + (y + hgt + 42) + '" text-anchor="middle" class="lg" font-size="14">' + label + '</text></g>';
      return t;
    }
    s += '<rect x="0" y="0" width="720" height="250" fill="#20242c"/>';
    s += beaker(90, 60, 150, 130, '#f2efe6', 'CuSO₄ 溶液（无光路）', true, '#ffffff22');
    s += beaker(300, 60, 150, 130, '#d9887a', 'Fe(OH)₃ 胶体（有光路）', true, '#ffffffaa');
    s += beaker(510, 60, 150, 130, '#c9b98a', '泥水浊液（下沉）', false, '');
    s += '<text x="165" y="232" text-anchor="middle" class="lg" font-size="12.5" fill="#aab">无通路，光穿过不"留痕"</text>';
    s += '<text x="375" y="232" text-anchor="middle" class="lg" font-size="12.5" fill="#fff">一条明亮"通路"＝丁达尔效应</text>';
    s += '<text x="585" y="232" text-anchor="middle" class="lg" font-size="12.5" fill="#aab">静置分层，谈不上分散均匀</text>';
    s += '<text x="360" y="296" text-anchor="middle" class="lg" font-size="14">制备 Fe(OH)₃ 胶体：向<b>沸水</b>中滴加饱和 FeCl₃ 溶液，继续加热至液体呈<b>红褐色</b>即停（不可久煮搅拌，也不写↓）</text>';
    var svg = '<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '胶体（1-100nm）介于溶液与浊液之间。点三只烧杯看区别；生活里"晨雾中的车灯光路""放映厅的光柱"都是丁达尔效应。');
    var caps = {
      'CuSO₄ 溶液（无光路）': '<b>溶液</b>：分散质＜1nm，能透过滤纸与半透膜，均一稳定——光通过没有可见通路。',
      'Fe(OH)₃ 胶体（有光路）': '<b>胶体</b>：分散质 1-100nm，能透过滤纸、<b>不能透过半透膜</b>（渗析提纯）。对光有散射→丁达尔效应，是最简便的鉴别方法。注意：胶体不带电、是"胶体粒子"带电！',
      '泥水浊液（下沉）': '<b>浊液</b>：分散质＞100nm，静置下沉或分层，不稳定，不能透过滤纸。'
    };
    el.$$('[data-cap]').forEach(function (nd) { nd.onclick = function () { setCap(el, caps[nd.getAttribute('data-cap')]); }; });
  } };

  /* ========== 10. 前 20 号元素速览 ========== */
  D['periodic-mini'] = { title: '前 20 号元素速览', w: 720, h: 400, build: function (el) {
    var s = '<text x="24" y="34" class="lg" font-size="14">点一格看原子的小档案（核电荷数＝质子数＝原子序数）</text>';
    var els = [
      { z: 1, sym: 'H', name: '氢', outer: 1, kind: '非金属', col: 1, row: 1 },
      { z: 2, sym: 'He', name: '氦', outer: 2, kind: '稀有气体', col: 8, row: 1 },
      { z: 3, sym: 'Li', name: '锂', outer: 1, kind: '金属', col: 1, row: 2 },
      { z: 4, sym: 'Be', name: '铍', outer: 2, kind: '金属', col: 2, row: 2 },
      { z: 5, sym: 'B', name: '硼', outer: 3, kind: '非金属', col: 3, row: 2 },
      { z: 6, sym: 'C', name: '碳', outer: 4, kind: '非金属', col: 4, row: 2 },
      { z: 7, sym: 'N', name: '氮', outer: 5, kind: '非金属', col: 5, row: 2 },
      { z: 8, sym: 'O', name: '氧', outer: 6, kind: '非金属', col: 6, row: 2 },
      { z: 9, sym: 'F', name: '氟', outer: 7, kind: '非金属', col: 7, row: 2 },
      { z: 10, sym: 'Ne', name: '氖', outer: 8, kind: '稀有气体', col: 8, row: 2 },
      { z: 11, sym: 'Na', name: '钠', outer: 1, kind: '金属', col: 1, row: 3 },
      { z: 12, sym: 'Mg', name: '镁', outer: 2, kind: '金属', col: 2, row: 3 },
      { z: 13, sym: 'Al', name: '铝', outer: 3, kind: '金属', col: 3, row: 3 },
      { z: 14, sym: 'Si', name: '硅', outer: 4, kind: '非金属', col: 4, row: 3 },
      { z: 15, sym: 'P', name: '磷', outer: 5, kind: '非金属', col: 5, row: 3 },
      { z: 16, sym: 'S', name: '硫', outer: 6, kind: '非金属', col: 6, row: 3 },
      { z: 17, sym: 'Cl', name: '氯', outer: 7, kind: '非金属', col: 7, row: 3 },
      { z: 18, sym: 'Ar', name: '氩', outer: 8, kind: '稀有气体', col: 8, row: 3 },
      { z: 19, sym: 'K', name: '钾', outer: 1, kind: '金属', col: 1, row: 4 },
      { z: 20, sym: 'Ca', name: '钙', outer: 2, kind: '金属', col: 2, row: 4 }
    ];
    var fillByKind = { '金属': '#fbeee9', '非金属': '#e8eef5', '稀有气体': '#eef3e4' };
    els.forEach(function (e2) {
      var x = 26 + (e2.col - 1) * 84, y = 54 + (e2.row - 1) * 86;
      s += '<g class="tap" data-cap="' + e2.sym + '"><rect x="' + x + '" y="' + y + '" width="76" height="76" rx="10" fill="' + fillByKind[e2.kind] + '" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<text x="' + (x + 8) + '" y="' + (y + 20) + '" class="lg" font-size="12" fill="#6b6154">' + e2.z + '</text>' +
        '<text x="' + (x + 38) + '" y="' + (y + 44) + '" text-anchor="middle" class="lg" font-size="21" font-weight="700">' + e2.sym + '</text>' +
        '<text x="' + (x + 38) + '" y="' + (y + 66) + '" text-anchor="middle" class="lg" font-size="12">' + e2.name + ' · ' + e2.outer + '</text></g>';
    });
    s += '<text x="26" y="394" class="lg" font-size="13" fill="#6b6154">色块：粉=金属　蓝=非金属　绿=稀有气体　· 格内数字=最外层电子数</text>';
    var svg = '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '前 20 号元素是必修阶段的主角。规律预告（本章后面细讲）：同一行从左到右金属性减弱、非金属性增强；同一列化学性质相似（最外层电子数相同）。');
    var caps = {};
    els.forEach(function (e2) {
      caps[e2.sym] = '<b>' + e2.name + '（' + e2.sym + '）</b>：核电荷数（质子数）' + e2.z + '，最外层 ' + e2.outer + ' 个电子，' + e2.kind +
        (e2.kind === '金属' ? '。最外层电子少（≤3），容易<b>失去</b>电子——作还原剂' : e2.kind === '稀有气体' ? '。最外层已满（He 为 2、其余为 8），结构稳定，一般不反应' : e2.outer >= 4 && e2.outer <= 6 ? '。容易<b>共用</b>电子对形成共价键' : '。最外层电子多（≥7），容易<b>得到</b>电子——作氧化剂');
    });
    el.$$('[data-cap]').forEach(function (n) { n.onclick = function () { setCap(el, caps[n.getAttribute('data-cap')]); }; });
  } };

  /* ========== 11. 化学键与电子式 ========== */
  D['bond-types'] = { title: '化学键与电子式', w: 720, h: 400, build: function (el) {
    var s = '<rect x="20" y="30" width="330" height="180" rx="13" fill="#fbeee9" stroke="#c9836f" stroke-width="1.6" class="tap" data-cap="ionic"/>' +
      '<text x="185" y="60" text-anchor="middle" class="lg" font-size="16" font-weight="700" fill="#b5432f">离子键（阴、阳离子间）</text>' +
      '<text x="185" y="100" text-anchor="middle" class="lg" font-size="16">Na × + ·Cl: → Na⁺[ :Cl: ]⁻</text>' +
      '<text x="185" y="132" text-anchor="middle" class="lg" font-size="13.5" fill="#6d3a2c">活泼金属 + 活泼非金属（NaCl、CaO、NaOH）</text>' +
      '<text x="185" y="160" text-anchor="middle" class="lg" font-size="13.5" fill="#6d3a2c">阴、阳离子间的静电作用</text>' +
      '<text x="185" y="190" text-anchor="middle" class="lg" font-size="12.5" fill="#6d3a2c">电子式：阳离子写符号，阴离子加 [ ] 和电荷</text>' +
      '<rect x="370" y="30" width="330" height="180" rx="13" fill="#e8eef5" stroke="#7a94b5" stroke-width="1.6" class="tap" data-cap="covalent"/>' +
      '<text x="535" y="60" text-anchor="middle" class="lg" font-size="16" font-weight="700" fill="#41679c">共价键（共用电子对）</text>' +
      '<text x="535" y="100" text-anchor="middle" class="lg" font-size="16">H × + ·Cl: → H ×Cl:</text>' +
      '<text x="535" y="132" text-anchor="middle" class="lg" font-size="13.5" fill="#33505f">非金属原子之间（HCl、H₂O、CO₂、N₂）</text>' +
      '<text x="535" y="160" text-anchor="middle" class="lg" font-size="13.5" fill="#33505f">N₂ 三对共用：:N⋮⋮N:　CO₂：:O::C::O:</text>' +
      '<text x="535" y="190" text-anchor="middle" class="lg" font-size="12.5" fill="#33505f">共价化合物的电子式不加 [ ] 和电荷</text>';
    s += '<text x="360" y="244" text-anchor="middle" class="lg" font-size="15" font-weight="700">离子化合物 vs 共价化合物（按"含什么键"分）</text>';
    s += '<text x="360" y="276" text-anchor="middle" class="lg" font-size="13.5">含离子键＝离子化合物：活泼金属的盐/氧化物/碱、<b>铵盐（NH₄Cl 也是离子化合物！）</b></text>';
    s += '<text x="360" y="304" text-anchor="middle" class="lg" font-size="13.5">只含共价键＝共价化合物：HCl、H₂O、CO₂、酒精等多数有机物</text>';
    s += '<text x="360" y="332" text-anchor="middle" class="lg" font-size="13.5" fill="#b5432f">易错：全由非金属组成也可能是离子化合物（铵盐）；含金属离子的化合物里也可能有共价键（NaOH 中 O—H）</text>';
    s += '<text x="360" y="366" text-anchor="middle" class="lg" font-size="13" fill="#6b6154">化合物类型由"化学键"决定，与"是否含金属元素"不能画等号</text>';
    var svg = '<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
    base(el, svg, [], '化学键分两大类：离子键（得失电子成离子）与共价键（共用电子对）。点两块色板看电子式写法与易错点。');
    var caps = {
      ionic: '<b>离子键</b>：阴、阳离子间的静电作用。形成于活泼金属（ⅠA、ⅡA）与活泼非金属之间。电子式写法：阳离子只写符号（Na⁺、Mg²⁺），阴离子加方括号与电荷（[ :Cl: ]⁻、[ :O:H ]⁻）。',
      covalent: '<b>共价键</b>：原子间共用电子对。非金属原子之间。电子式不加括号不加电荷；注意 N₂（三对共用）、CO₂（两对双键）的写法。'
    };
    el.$$('[data-cap]').forEach(function (n) { n.onclick = function () { setCap(el, caps[n.getAttribute('data-cap')]); }; });
  } };
})();
