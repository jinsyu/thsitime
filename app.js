// 이번 생은 — 엔진
(() => {
'use strict';

/* ================= 데이터 ================= */
// 무리 단위 확률. count: 살아 있는 개체 수(추정), mass: 생물량(Gt C, Bar-On 2018 근사), home: 사람 곁 모드
const GROUPS = [
  { id: 'nematode', name: '선충', phylum: '선형동물문', count: 4.4e20, mass: 0.02, home: 0, members: ['nematode'], ref: 'van den Hoogen et al. 2019 (토양 선충)' },
  { id: 'copepod', name: '요각류', phylum: '절지동물문', count: 1e20, mass: 0.6, home: 0, members: ['copepod'], ref: '추정 범위가 매우 넓음' },
  { id: 'insect', name: '곤충', phylum: '절지동물문', count: 1e19, mass: 0.2, home: 0, members: ['ant', 'mosquito', 'mayfly', 'bee'], ref: '약 1,000경 마리 (자주 인용되는 추정)' },
  { id: 'worm', name: '지렁이류', phylum: '환형동물문', count: 1e15, mass: 0.2, home: 0, members: ['earthworm'], ref: '목업용 가정값' },
  { id: 'krill', name: '남극 크릴', phylum: '절지동물문', count: 5e14, mass: 0.05, home: 0, members: ['krill'], ref: '약 500조 마리' },
  { id: 'fish', name: '야생 물고기', phylum: '척삭동물문', count: 1e13, mass: 0.7, home: 0, members: ['anchovy', 'cod', 'salmon'], ref: '1조~1,000조 사이로 추정' },
  { id: 'wildmammal', name: '야생 포유류', phylum: '척삭동물문', count: 1.3e11, mass: 0.003, home: 0, members: ['mouse', 'bat'], ref: 'Greenspoon et al. 2023 근사' },
  { id: 'bird', name: '야생 새', phylum: '척삭동물문', count: 5e10, mass: 0.002, home: 0, members: ['sparrow'], ref: 'Callaghan et al. 2021: 약 500억 마리' },
  { id: 'farmfish', name: '양식 물고기', phylum: '척삭동물문', count: 4e10, mass: 0.01, home: 4e10, members: ['farmsalmon'], ref: 'FAO 기반 가정값' },
  { id: 'chicken', name: '닭', phylum: '척삭동물문', count: 2.6e10, mass: 0.005, home: 2.6e10, members: ['chicken'], ref: 'FAO: 약 260억 마리' },
  { id: 'human', name: '사람', phylum: '척삭동물문', count: 8.2e9, mass: 0.06, home: 8.2e9, members: ['human'], ref: 'UN 세계인구전망: 약 82억 명' },
  { id: 'cattle', name: '소', phylum: '척삭동물문', count: 1.5e9, mass: 0.06, home: 1.5e9, members: ['cow'], ref: 'FAO: 약 15억 마리' },
  { id: 'pig', name: '돼지', phylum: '척삭동물문', count: 1e9, mass: 0.02, home: 1e9, members: ['pig'], ref: 'FAO: 약 10억 마리' },
  { id: 'whale', name: '혹등고래', phylum: '척삭동물문', count: 8e4, mass: 0.004, home: 0, members: ['whale'], ref: '해양 포유류 생물량을 대표' },
];
GROUPS.forEach(g => { g.even = g.members.length; });

const MODES = [
  { id: 'even', name: '골고루', key: 'even', desc: '20종이 모두 같은 확률로 나와요. 여러 생명을 만나 보기 좋아요.' },
  { id: 'count', name: '머릿수', key: 'count', desc: '살아 있는 개체 수에 비례해요. 진짜 지구와 같지만, 거의 선충이 나와요.' },
  { id: 'mass', name: '무게', key: 'mass', desc: '몸무게(생물량)에 비례해요. 바다의 작은 생물과 물고기가 많이 나와요.' },
  { id: 'home', name: '사람 곁', key: 'home', desc: '사람과 사람이 기르는 동물 중에서만 뽑아요.' },
];
const MODE_BY = Object.fromEntries(MODES.map(m => [m.id, m]));
const HAB = { soil: '흙 속', sea: '물속', sky: '하늘과 숲', farm: '농장', city: '사람 사는 곳' };
const ORDER = ['nematode', 'copepod', 'earthworm', 'ant', 'mosquito', 'mayfly', 'bee', 'krill', 'anchovy', 'cod', 'salmon', 'farmsalmon', 'sparrow', 'chicken', 'mouse', 'bat', 'cow', 'pig', 'whale', 'human'];

// 사람: 출생아 수(백만 명/년), 5세 미만 사망률, 기대수명 — 근사치
const COUNTRIES = [
  { n: '인도', b: 23, u5: 0.029, le: 72 }, { n: '중국', b: 9, u5: 0.007, le: 78 },
  { n: '나이지리아', b: 8, u5: 0.107, le: 54 }, { n: '파키스탄', b: 6.2, u5: 0.06, le: 67 },
  { n: '인도네시아', b: 4.5, u5: 0.021, le: 71 }, { n: '콩고민주공화국', b: 4.2, u5: 0.075, le: 61 },
  { n: '에티오피아', b: 3.9, u5: 0.047, le: 67 }, { n: '미국', b: 3.6, u5: 0.006, le: 79 },
  { n: '방글라데시', b: 3, u5: 0.029, le: 73 }, { n: '브라질', b: 2.5, u5: 0.014, le: 76 },
  { n: '이집트', b: 2.1, u5: 0.019, le: 71 }, { n: '필리핀', b: 2, u5: 0.026, le: 72 },
  { n: '멕시코', b: 1.8, u5: 0.013, le: 75 }, { n: '베트남', b: 1.4, u5: 0.02, le: 74 },
  { n: '탄자니아', b: 2.3, u5: 0.047, le: 66 }, { n: '케냐', b: 1.5, u5: 0.04, le: 63 },
  { n: '독일', b: 0.7, u5: 0.004, le: 81 }, { n: '일본', b: 0.73, u5: 0.002, le: 84 },
  { n: '한국', b: 0.23, u5: 0.003, le: 84 }, { n: '프랑스', b: 0.68, u5: 0.004, le: 82 },
];
COUNTRIES.forEach(c => { c.inc = c.u5 >= 0.04 ? 'low' : c.le >= 79 ? 'high' : 'mid'; });

/* ================= 유틸 ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sp = id => window.SPECIES[id];
const UNITS = [[1e20, '해'], [1e16, '경'], [1e12, '조'], [1e8, '억'], [1e4, '만']];
function koBig(n) {
  for (const [u, k] of UNITS) if (n >= u) {
    const v = n / u;
    return (v >= 10 ? Math.round(v).toLocaleString('ko-KR') : (Math.round(v * 10) / 10).toString()) + k;
  }
  return Math.round(n).toLocaleString('ko-KR');
}
function probText(p) {
  if (p <= 0) return '0';
  if (p >= 0.995) return '100%';
  if (p >= 0.01) return (p * 100).toFixed(p >= 0.1 ? 0 : 1) + '%';
  return koBig(1 / p) + ' 분의 1';
}
function ro(word) {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xAC00 || c > 0xD7A3) return word + '로';
  const j = (c - 0xAC00) % 28;
  return word + (j === 0 || j === 8 ? '로' : '으로');
}
function eul(word) { // 을/를
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xAC00 || c > 0xD7A3) return word + '을';
  return word + ((c - 0xAC00) % 28 === 0 ? '를' : '을');
}
const fullName = s => s.role ? `${s.name} · ${s.role}` : s.name;
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function ageText(s, days, short) {
  if (s.id === 'human') return `${Math.floor(days / 365)}살`;
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}시간${short ? '' : '째'}`;
  if (days < 60) return `${Math.floor(days) + (short ? 0 : 1)}일${short ? '' : '째'}`;
  if (days < 730) return `${Math.max(2, Math.floor(days / 30.4))}개월${short ? '' : '째'}`;
  return `${Math.floor(days / 365)}년${short ? '' : '째'}`;
}
function livedText(s, days) {
  if (s.id === 'human') return `${Math.floor(days / 365)}년`;
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}시간`;
  if (days < 60) return `${Math.max(1, Math.round(days))}일`;
  if (days < 730) return `${Math.round(days / 30.4)}개월`;
  const y = Math.floor(days / 365), m = Math.round((days - y * 365) / 30.4);
  return m >= 1 && y < 10 ? `${y}년 ${m}개월` : `${y}년`;
}

/* ================= 저장 ================= */
const KEY = 'ibeon-saeng-v2';
function load() { try { return Object.assign({ seen: {}, met: {}, records: [] }, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return { seen: {}, met: {}, records: [] }; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* 저장 불가 */ } }
const store = load();

/* ================= 확률 ================= */
let mode = MODES[0];
const totalOf = m => GROUPS.reduce((a, g) => a + g[m.key], 0);
const groupOf = id => GROUPS.find(g => g.members.includes(id));
function speciesProb(id, m) { const g = groupOf(id); return g[m.key] / totalOf(m) / g.members.length; }
function drawOne(m) {
  const key = m.key, total = totalOf(m);
  let r = Math.random() * total, g = GROUPS[0];
  for (const x of GROUPS) { if (x[key] <= 0) continue; r -= x[key]; if (r <= 0) { g = x; break; } }
  const phylumW = GROUPS.filter(x => x.phylum === g.phylum).reduce((a, x) => a + x[key], 0);
  return { group: g, id: pick(g.members), pPhylum: phylumW / total, pGroup: g[key] / phylumW, pAll: g[key] / total / g.members.length };
}

/* ================= 화면 전환 ================= */
function show(id) {
  ['#v-landing', '#v-draw', '#v-life', '#v-end'].forEach(v => { $(v).hidden = v !== id; });
  window.scrollTo(0, 0);
}
function setHabitat(h) { document.documentElement.style.setProperty('--habitat', h ? `var(--${h})` : 'var(--bg)'); }

/* ================= 랜딩 ================= */
function renderModes() {
  $('#modes').innerHTML = MODES.map(m => {
    const total = totalOf(m);
    const groups = GROUPS.filter(g => g[m.key] > 0);
    const segs = groups.map(g => {
      const w = g[m.key] / total * 100;
      return w > 0.25 ? `<span style="width:${w}%;background:var(--c-${sp(g.members[0]).hab})" title="${g.name} ${w.toFixed(1)}%"></span>` : '';
    }).join('');
    const top = groups.slice().sort((a, b) => b[m.key] - a[m.key]).slice(0, 3).map(g => g.name).join(' · ');
    return `<button class="mode" data-mode="${m.id}" aria-pressed="${m === mode}">
      <span class="name">${m.name}${m === mode ? '<span class="chip">선택됨</span>' : ''}</span>
      <span class="desc">${m.desc}</span>
      <span class="bar-mini" aria-hidden="true">${segs}</span>
      <span class="h">${m.id === 'even' ? '20종 각각 5%' : '주로 ' + top}</span>
      <span class="h">사람일 확률 <b>${probText(speciesProb('human', m))}</b></span>
    </button>`;
  }).join('');
  document.querySelectorAll('.mode').forEach(b => b.addEventListener('click', () => {
    mode = MODE_BY[b.dataset.mode]; renderModes(); renderDex();
    $('#cta-mode').textContent = `${mode.name} 기준 · 한 생 약 3~6분`;
  }));
}

function renderLadder() {
  const rows = GROUPS.slice().sort((a, b) => b.count - a.count);
  const W = 760, L = 150, R = 700, rowH = 34, top = 34, H = top + rows.length * rowH + 12;
  const X = n => L + (Math.log10(n) - 4) / (21 - 4) * (R - L);
  const ticks = [[1e4, '1만'], [1e8, '1억'], [1e12, '1조'], [1e16, '1경'], [1e20, '1해']];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="지구 동물 무리별 개체 수, 로그 눈금">`;
  ticks.forEach(([v, t]) => { s += `<line x1="${X(v)}" x2="${X(v)}" y1="${top - 8}" y2="${H - 8}" stroke="var(--line)" stroke-width="1"/><text x="${X(v)}" y="${top - 16}" text-anchor="middle" font-size="12" fill="var(--muted)" font-family="var(--f-mono)">${t}</text>`; });
  rows.forEach((g, i) => {
    const y = top + i * rowH, cy = y + rowH / 2, hab = sp(g.members[0]).hab, me = g.id === 'human';
    const icon = ART[g.members[0]]();
    s += `<g style="--art-fill: var(${tintOf(g.members[0])})" color="var(--ink)"><g transform="translate(6 ${cy - 11}) scale(0.16)">${icon}</g></g>`;
    s += `<text x="44" y="${cy + 5}" font-size="14" fill="var(--ink)" font-weight="${me ? 700 : 400}" font-family="var(--f-body)">${g.name}</text>`;
    s += `<rect x="${L}" y="${cy - 7}" width="${Math.max(2, X(g.count) - L)}" height="14" rx="4" fill="${me ? 'var(--you)' : `var(--c-${hab})`}" opacity="${me ? 1 : 0.75}"/>`;
    s += `<text x="${X(g.count) + 8}" y="${cy + 4}" font-size="12" fill="${me ? 'var(--ink)' : 'var(--muted)'}" font-family="var(--f-mono)">${koBig(g.count)}</text>`;
  });
  $('#ladder-chart').innerHTML = s + '</svg>';
}

function renderDex() {
  let n = 0;
  $('#dex-grid').innerHTML = ORDER.map(id => {
    const s = sp(id), seen = store.seen[id] || 0, met = store.met[id];
    if (seen) n++;
    const p = speciesProb(id, mode);
    return `<div class="card ${seen ? '' : 'locked'} ${id === 'human' ? 'human' : ''}">
      <div class="art">${art(id, { still: true })}</div>
      <span class="cn"><span class="dot" style="background:var(--c-${s.hab})"></span>${seen || met ? s.name : '???'}</span>
      <span class="cp">${p > 0 ? probText(p) : '이 기준에선 0'}${seen ? ` · ${seen}번 삶` : ''}${met && !seen ? ' · 만난 적 있음' : ''}</span>
      ${seen ? `<span class="fact">${s.facts[0]}</span>` : `<span class="fact">${HAB[s.hab]}</span>`}
    </div>`;
  }).join('');
  $('#dex-count').textContent = `${n} / ${ORDER.length}`;
}

function renderData() {
  $('#data-rows').innerHTML = GROUPS.slice().sort((a, b) => b.count - a.count).map(g =>
    `<tr><td>${g.name}</td><td class="n">${koBig(g.count)}</td><td class="n">${g.mass}</td><td class="muted">${g.ref}</td></tr>`).join('');
}

const EXAMPLES = [
  { id: 'cod', who: '대구 · 9일', t: '형제가 백만 마리였대요. 저는 열흘도 못 살았어요.' },
  { id: 'human', who: '사람 · 나이지리아 · 61년', t: '사람이 나왔을 때 화면을 한참 봤어요.' },
  { id: 'nematode', who: '선충 · 19일', t: '흙 한 줌에 수천 마리라니. 흙을 그냥 못 밟겠어요.' },
  { id: 'chicken', who: '닭 · 6주', t: '원래 10년을 산다는 걸 처음 알았어요.' },
];
function renderNotes() {
  const mine = store.records.filter(r => r.w || r.a).slice(0, 2).map(r => ({ id: r.id, who: `${sp(r.id).name} · ${r.lived} · 내 기록`, t: r.w || r.a, mine: true }));
  $('#notes').innerHTML = mine.concat(EXAMPLES).slice(0, 4).map(e =>
    `<div class="note"><span class="who"><span class="dot" style="background:${e.mine ? 'var(--you)' : `var(--c-${sp(e.id).hab})`}"></span>${esc(e.who)}${e.mine ? '' : ' · 예시'}</span><span>${esc(e.t)}</span></div>`).join('');
}

// 캐러셀
let carI = 0;
function tickCarousel() {
  const id = ORDER[carI % ORDER.length]; carI++;
  $('#car-art').innerHTML = art(id, { scene: true });
  $('#car-art').style.background = `var(--${sp(id).hab})`;
  $('#car-name').textContent = fullName(sp(id));
  $('#car-pr').textContent = `진짜 확률 ${probText(speciesProb(id, MODE_BY.count))}`;
}

// 생명의 강
const river = { dots: [], t: 0 };
function initRiver() {
  const list = [];
  for (let i = 0; i < 130; i++) list.push({ h: sp(drawOne(MODES[i % 4]).id).hab, mine: false });
  store.records.forEach(r => list.push({ h: sp(r.id) ? sp(r.id).hab : 'soil', mine: true }));
  river.dots = list.map(d => ({ ...d, x: Math.random(), y: Math.random(), v: rnd(0.012, 0.03), r: d.mine ? 5 : rnd(2, 4.2), ph: Math.random() * 6.28 }));
}
function drawRiver(dt) {
  const c = $('#river-canvas'); if (!c) return;
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
  if (!w) return;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  river.t += dt;
  const cols = {}; for (const k in HAB) cols[k] = cssVar('--c-' + k);
  const you = cssVar('--you');
  for (const d of river.dots) {
    d.x += d.v * dt * 0.6; if (d.x > 1.02) d.x = -0.02;
    const y = 18 + d.y * (h - 36) + Math.sin(river.t * 0.8 + d.ph + d.x * 6) * 6;
    ctx.beginPath(); ctx.arc(d.x * w, y, d.r, 0, 6.283);
    ctx.fillStyle = d.mine ? you : cols[d.h]; ctx.globalAlpha = d.mine ? 1 : 0.7; ctx.fill();
  }
  ctx.globalAlpha = 1;
}
const t0 = performance.now();
function tickCounter() {
  const s = (performance.now() - t0) / 1000;
  $('#cnt-human').textContent = Math.floor(s * 4.2).toLocaleString('ko-KR') + '명';
  $('#cnt-chick').textContent = Math.floor(s * 2400).toLocaleString('ko-KR') + '마리';
  $('#cnt-insect').textContent = s < 1 ? '0마리' : '약 ' + koBig(s * 3.9e12) + ' 마리';
}

/* ================= 추첨 ================= */
let life = null;
function startDraw(force) {
  let d = drawOne(mode);
  if (typeof force === 'string') { const g = groupOf(force); d = { group: g, id: force, pPhylum: 1, pGroup: 1, pAll: speciesProb(force, mode) }; }
  const s = sp(d.id);
  cancelAnimationFrame(raf); $('#sheet-host').innerHTML = '';
  life = makeLife(d);
  show('#v-draw'); setHabitat(null);
  $('#draw-mode').textContent = `${mode.name} 기준으로 뽑는 중`;
  const steps = [
    ['계', '동물계', '100%'],
    ['문', d.group.phylum, probText(d.pPhylum)],
    ['무리', d.group.name, '그중 ' + probText(d.pGroup)],
    ['대표종', fullName(s), d.group.members.length > 1 ? `${d.group.members.length}종 중 하나` : '—'],
  ];
  $('#steps').innerHTML = steps.map((x, i) => `<div class="step ${i === 3 ? 'final' : ''}"><span class="lv">${x[0]}</span><span class="v" data-v="${esc(x[1])}"></span><span class="p">${x[2]}</span></div>`).join('');
  const L = life, st0 = L.stages[0];
  const rv = $('#reveal'); rv.classList.add('wait');
  rv.innerHTML = `<div class="art">${art(d.id, { scene: true, art: st0.art, k: L.kAt(0) })}</div>
    <div class="body">
      <span class="label">출생 기록</span>
      <h2 class="title">이번 생은 ${ro(s.name)} 태어났어요</h2>
      <span class="sci">${esc(s.sci)}${s.role ? ' · ' + esc(s.role) : ''}</span>
      <div class="facts">
        <div><span class="label">태어난 곳</span><span class="fv">${L.country ? L.country.n : HAB[s.hab]}</span></div>
        <div><span class="label">${L.country ? '기대수명' : '크기'}</span><span class="fv">${L.country ? `약 ${L.country.le}년` : esc(s.size)}</span></div>
        <div><span class="label">${esc(s.cohort.label)}</span><span class="fv mono">${s.cohort.n.toLocaleString('ko-KR')}${s.cohort.unit}</span></div>
        <div><span class="label">끝까지 살 확률</span><span class="fv mono">${probText(L.fullSurvive)}</span></div>
      </div>
      <p class="muted" style="font-size:15px">이 기준에서 ${ro(s.name)} 태어날 확률은 <b class="mono">${probText(d.pAll)}</b>.${mode.id !== 'count' ? ` 진짜 지구의 머릿수로 뽑았다면 <b class="mono">${probText(speciesProb(d.id, MODE_BY.count))}</b>였어요.` : ''} 자연 수명은 ${esc(s.natural)}.</p>
      <div class="start-row"><button class="btn" id="live">삶 시작</button><button class="btn ghost" id="redraw">다시 뽑기</button></div>
    </div>`;
  rv.querySelector('.art').style.background = 'var(--bg)';
  const els = [...document.querySelectorAll('.step')];
  els.forEach((el, i) => setTimeout(() => {
    el.classList.add('on');
    const v = el.querySelector('.v'); v.textContent = v.dataset.v;
  }, 300 + i * 700));
  setTimeout(() => {
    rv.classList.remove('wait'); setHabitat(s.hab);
    rv.querySelector('.art').style.background = `var(--${s.hab})`;
    $('#live').addEventListener('click', startLife);
    $('#redraw').addEventListener('click', startDraw);
  }, 300 + 4 * 700);
}

/* ================= 일생 ================= */
function humanS(c, i) {
  const k = 80 - c.le;
  return [1 - c.u5, 1 - (c.u5 * 0.12 + 0.002), 1 - (c.u5 * 0.08 + 0.003), clamp(0.985 - k * 0.0035, 0.9, 0.992), clamp(0.93 - k * 0.012, 0.55, 0.97), clamp(0.62 - k * 0.02, 0.2, 0.75), 1][i];
}
function makeLife(d) {
  const s = sp(d.id);
  let country = null;
  if (d.id === 'human') {
    const tot = COUNTRIES.reduce((a, c) => a + c.b, 0);
    let r = Math.random() * tot * 1.6; // 표에 없는 나라 몫: 비슷한 비율로 다시 뽑는다
    r = r % tot;
    country = COUNTRIES[0];
    for (const c of COUNTRIES) { r -= c.b; if (r <= 0) { country = c; break; } }
  }
  const stages = s.stages.map((st, i) => ({ ...st, s: country ? humanS(country, i) : st.s }));
  const L = {
    d, id: d.id, sp: s, country, stages, mode,
    fullSurvive: stages.reduce((a, st) => a * st.s, 1),
    stats: { e: Math.round(rnd(52, 68)), s: Math.round(rnd(52, 68)), b: Math.round(rnd(42, 58)), v: Math.round(rnd(52, 68)) },
    si: 0, t: 0, qi: 0, script: [], dieAt: -1, cause: '', journey: [], asked: false, answer: '', died: false, done: false, dayAt: 0, sibs: [],
    kAt(i) {
      const st = this.stages[i];
      if (st.art !== 'young') return 1;
      if (this.id === 'human') return [0.55, 0.7, 0.85][i] || 0.85;
      return 0.72;
    },
  };
  return L;
}
const BEAT = 3.2;
let speed = 1, playing = true, auto = false, waiting = false, raf = 0, last = 0;

function statLabels() { return life.id === 'human' ? { e: '건강', s: '안전', b: '가족', v: '생활' } : { e: '에너지', s: '안전', b: '다음 세대', v: '환경' }; }
function renderStats() {
  const L = statLabels();
  $('#stats').innerHTML = ['e', 's', 'b', 'v'].map(k =>
    `<div class="stat ${life.stats[k] < 30 ? 'low' : ''}"><span>${L[k]}</span><span class="track"><span class="fill" style="width:${life.stats[k]}%"></span></span><span class="val">${life.stats[k]}</span></div>`).join('');
}
function bump(fx) { if (!fx) return; for (const k in fx) if (k in life.stats) life.stats[k] = clamp(Math.round(life.stats[k] + fx[k]), 0, 100); renderStats(); }
function condOk(c) {
  if (!c) return true;
  const m = /^\s*([esbv])\s*([<>])\s*(\d+)\s*$/.exec(c);
  if (!m) return true;
  return m[2] === '<' ? life.stats[m[1]] < +m[3] : life.stats[m[1]] > +m[3];
}
function survivalP(base) {
  if (base >= 1) return 1;
  const odds = base / (1 - base) * Math.exp((life.stats.s - 50) / 50 * 0.5 + (life.stats.e - 50) / 50 * 0.3);
  return odds / (1 + odds);
}
function fillC(t) { return life.country ? t.replace(/\{c\}/g, life.country.n) : t; }

function buildScript(i) {
  const L = life, st = L.stages[i], items = [];
  items.push({ k: 'mood', t: st.mood });
  for (const e of st.events) {
    if (e.inc && L.country && e.inc !== L.country.inc) continue;
    if (e.p != null && Math.random() > e.p) continue;
    if (!condOk(e.if)) continue;
    items.push({ k: 'ev', t: e.t, fx: e.fx, m: e.m });
  }
  if (st.dangers && st.dangers.length && Math.random() < 0.65) {
    const pos = 2 + Math.floor(Math.random() * Math.max(1, items.length - 2));
    items.splice(pos, 0, { k: 'danger', ...pick(st.dangers) });
  }
  if (L.id === 'human' && i >= 3 && i <= 5 && Math.random() < 0.85) {
    const others = ORDER.filter(x => x !== 'human' && sp(x).encounter);
    const o = pick(others);
    items.splice(2 + Math.floor(Math.random() * Math.max(1, items.length - 2)), 0, { k: 'meet', t: sp(o).encounter, who: o });
  }
  (st.choices || []).forEach(c => {
    const pos = clamp(Math.round(c.at * items.length), 1, items.length);
    items.splice(pos, 0, { k: 'choice', c });
  });
  if (L.sp.question && L.sp.question.at === i) items.splice(Math.max(1, items.length - 1), 0, { k: 'ask' });
  // 이 단계에서 삶이 끝나는지 미리 정한다
  L.dieAt = -1;
  if (Math.random() >= survivalP(st.s)) {
    const evIdx = items.map((x, j) => (x.k === 'ev' || x.k === 'danger') ? j : -1).filter(j => j > 0);
    L.dieAt = evIdx.length ? pick(evIdx) : items.length - 1;
    L.cause = pick(st.causes);
  }
  return items;
}

function startLife() {
  const L = life, s = L.sp;
  show('#v-life'); setHabitat(s.hab);
  $('#b-name').textContent = L.country ? `사람 · ${L.country.n}` : fullName(s);
  $('#b-art').innerHTML = art(L.id, { still: true });
  $('#sib-label').textContent = s.cohort.label;
  $('#trail').innerHTML = ''; $('#now').textContent = ''; $('#now').className = 'now'; $('#sheet-host').innerHTML = '';
  $('#tl').innerHTML = L.stages.map(() => '<span class="seg"><i></i></span>').join('');
  $('#tl-labels').innerHTML = L.stages.map(st => `<span title="${esc(st.name)}">${esc(st.name)}</span>`).join('');
  const wrap = $('#stage-wrap');
  wrap.classList.toggle('lens', s.sizeMm < 3);
  wrap.classList.remove('gone');
  $('#ruler').innerHTML = `<i></i><span>${esc(s.size)}</span>`;
  const n = Math.min(s.cohort.n, 240);
  L.sibs = Array.from({ length: n }, (_, i) => ({ alive: true, fade: 1, you: i === 0 }));
  renderStats();
  journey('m', fillC(L.country ? `${L.country.n}에서 태어났어요.` : s.intro), 0, '탄생');
  say(L.country ? `${L.country.n}에서 사람으로 태어났어요. 같은 순간 지구에서 아기가 4명쯤 함께 태어났어요.` : s.intro, 'sys');
  setStage(0);
  playing = true; waiting = false; updatePlay();
  last = performance.now();
  cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
}
function setStage(i) {
  const L = life, s = L.sp, st = L.stages[i];
  L.si = i; L.t = 0; L.qi = 0; L.script = buildScript(i);
  L.stageStart = L.stages.slice(0, i).reduce((a, x) => a + x.days, 0);
  const lensTxt = s.sizeMm < 3 ? '현미경으로 본 모습' : s.sizeMm < 60 ? '돋보기로 본 모습' : s.sizeMm > 5000 ? '실제보다 아주 작게' : '';
  $('#stage-tag').innerHTML = `<span class="chip"><span class="dot" style="background:var(--c-${s.hab})"></span>${HAB[s.hab]}</span><span class="chip">${i + 1}/${L.stages.length} · ${esc(st.name)}</span>${lensTxt ? `<span class="chip">${lensTxt}</span>` : ''}`;
  $('#stage-art').innerHTML = art(L.id, { scene: true, art: st.art, k: L.kAt(i) });
  if (i > 0) journey('stage', st.name, L.stageStart);
}
function say(t, cls) { const el = $('#now'); el.textContent = fillC(t); el.className = 'now' + (cls ? ' ' + cls : ''); }
function trail(t, cls) {
  const box = $('#trail');
  const row = document.createElement('div');
  row.className = 'row' + (cls ? ' ' + cls : '');
  row.innerHTML = `<span class="t">${ageText(life.sp, dayNow(), true)}</span>${esc(fillC(t))}`;
  box.prepend(row);
  while (box.children.length > 7) box.removeChild(box.lastChild);
}
function journey(kind, t, day, label) { life.journey.push({ kind, t: fillC(t), day: day == null ? dayNow() : day, label }); }
function dayNow() {
  const L = life, st = L.stages[L.si];
  return (L.stageStart || 0) + st.days * Math.min(1, L.t / (Math.max(1, L.script.length) * BEAT));
}

function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if ($('#v-life').hidden) return;
  if (playing && !waiting && !life.done) step(dt * speed);
  drawSibs();
  raf = requestAnimationFrame(loop);
}
function step(dt) {
  const L = life;
  L.t += dt;
  const len = L.script.length;
  while (L.qi < len && L.t >= (L.qi + 0.35) * BEAT) {
    const it = L.script[L.qi];
    if (L.qi === L.dieAt) { L.dayAt = dayNow(); die(false); return; }
    L.qi++;
    if (!showItem(it)) return; // 멈춤이 필요한 항목
  }
  $('#b-age').textContent = ageText(L.sp, dayNow());
  const frac = Math.min(1, L.t / (len * BEAT));
  document.querySelectorAll('#tl .seg i').forEach((el, i) => { el.style.width = i < L.si ? '100%' : i === L.si ? (frac * 100) + '%' : '0'; });
  if (L.t >= len * BEAT) {
    cullSibs(L.stages[L.si].s);
    if (L.si + 1 >= L.stages.length) { L.dayAt = dayNow(); die(true); return; }
    setStage(L.si + 1);
  }
}
function showItem(it) {
  const L = life;
  if (it.k === 'mood') { say(it.t, 'sys'); trail(it.t); return true; }
  if (it.k === 'ev') {
    say(it.t); bump(it.fx); trail(it.t, it.m ? 'm' : '');
    if (it.m) journey('m', it.t, null, it.m);
    return true;
  }
  if (it.k === 'danger') { say(it.t, 'danger'); bump(it.fx); trail(it.t, 'd'); journey('d', it.t, null, '아찔한 순간'); return true; }
  if (it.k === 'meet') {
    say(it.t); trail(it.t, 'm'); journey('m', it.t, null, `${sp(it.who).name}${sp(it.who).name.endsWith('이') ? '' : ''} 만남`);
    store.met[it.who] = 1; save();
    return true;
  }
  if (it.k === 'choice') { askChoice(it.c); return false; }
  if (it.k === 'ask') { askQuestion(false); return false; }
  return true;
}
function sheet(html) { $('#sheet-host').innerHTML = `<div class="sheet" role="dialog" aria-modal="false">${html}</div>`; return $('#sheet-host .sheet'); }
function askChoice(c) {
  waiting = true;
  const box = sheet(`<span class="label">선택 · ${ageText(life.sp, dayNow())}</span><span class="q">${esc(fillC(c.q))}</span><div class="opts">${c.opts.map((o, i) => `<button data-i="${i}">${esc(o.t)}</button>`).join('')}</div>`);
  const choose = i => {
    const o = c.opts[i]; $('#sheet-host').innerHTML = '';
    bump(o.fx); say(o.r); trail(`${o.t} — ${o.r}`, 'c');
    journey('c', `${o.t}. ${o.r}`, null, o.m || '선택');
    waiting = false;
  };
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
  box.querySelector('button').focus({ preventScroll: true });
  if (auto) setTimeout(() => { if ($('#sheet-host .sheet')) choose(Math.floor(Math.random() * c.opts.length)); }, 1600 / speed);
}
function askQuestion(atEnd) {
  waiting = true; life.asked = true;
  const box = sheet(`<span class="label">잠시 멈춤</span><span class="q">${esc(life.sp.question.q)}</span>
    <label class="muted" for="q-in" style="font-size:14px">한 줄 남기기 (선택)</label>
    <textarea id="q-in" maxlength="120" placeholder="떠오르는 대로 적어 보세요"></textarea>
    <div class="start-row"><button class="btn" id="q-ok">남기고 계속</button><button class="btn ghost" id="q-skip">넘어가기</button></div>`);
  const done = keep => {
    if (keep) life.answer = $('#q-in').value.trim();
    $('#sheet-host').innerHTML = ''; waiting = false;
    if (atEnd) finish();
  };
  $('#q-ok').addEventListener('click', () => done(true));
  $('#q-skip').addEventListener('click', () => done(false));
  if (auto && !atEnd) setTimeout(() => { if (box.isConnected) done(false); }, 3000 / speed);
}
function cullSibs(s) {
  const L = life;
  L.sibs.forEach(x => { if (!x.you && x.alive && Math.random() > s) x.alive = false; });
  const alive = L.sibs.filter(x => x.alive).length, total = L.sp.cohort.n, u = L.sp.cohort.unit;
  const cum = L.stages.slice(0, L.si + 1).reduce((a, st) => a * st.s, 1);
  $('#sib-note').textContent = total > L.sibs.length
    ? `${total.toLocaleString('ko-KR')}${u} 중 ${L.sibs.length}${u}만 표시. 전체로는 약 ${koBig(Math.max(1, total * cum))}${u}가 남았어요.`
    : `${L.sibs.length}${u} 중 ${alive}${u}가 아직 살아 있어요.`;
}
function drawSibs() {
  const c = $('#sib'); if (!c || $('#v-life').hidden || !life) return;
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
  if (!w) return;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const n = life.sibs.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * w / h))), rows = Math.ceil(n / cols);
  const cell = Math.min(w / cols, h / rows), r = Math.max(1.5, Math.min(cell * 0.32, 16));
  const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
  const ink = cssVar('--ink'), line = cssVar('--line'), you = cssVar('--you'), hab = cssVar('--c-' + life.sp.hab);
  life.sibs.forEach((x, i) => {
    x.fade += ((x.alive ? 1 : 0) - x.fade) * 0.06;
    const cx = ox + (i % cols + 0.5) * cell, cy = oy + (Math.floor(i / cols) + 0.5) * cell;
    ctx.beginPath(); ctx.arc(cx, cy, x.you ? r * 1.35 : r, 0, 6.283);
    if (x.you) { ctx.fillStyle = life.died ? ink : you; ctx.globalAlpha = 1; }
    else { ctx.fillStyle = x.fade > 0.5 ? hab : line; ctx.globalAlpha = 0.25 + 0.75 * x.fade; }
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
function die(natural) {
  const L = life;
  L.done = true; L.died = !natural;
  if (!natural) L.sibs[0].alive = false;
  cullSibs(natural ? 1 : L.stages[L.si].s);
  const msg = natural ? L.sp.endNatural : L.cause;
  say(msg, natural ? 'sys' : 'danger'); trail(msg, 'd');
  journey('end', msg, L.dayAt, '삶의 끝');
  $('#stage-wrap').classList.add('gone');
  setTimeout(() => { if (!L.asked) askQuestion(true); else finish(); }, 2200);
}

/* ================= 생명 기록 ================= */
function curveSvg() {
  const L = life, n = L.stages.length;
  const W = 520, H = 230, l = 44, r = 506, t = 26, b = 180;
  const X = x => l + x / n * (r - l), Y = p => b - p * (b - t);
  let cum = 1; const pts = [[0, 1]];
  L.stages.forEach((st, i) => { cum *= st.s; pts.push([i + 1, cum]); });
  const youX = L.si + (L.died ? Math.min(0.95, (L.dayAt - L.stageStart) / L.stages[L.si].days) : 1);
  const youP = pts[L.si][1] - (pts[L.si][1] - pts[L.si + 1][1]) * (youX - L.si);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="같은 순간 태어난 형제들의 생존 곡선">`;
  [0, 0.5, 1].forEach(p => { s += `<line x1="${l}" x2="${r}" y1="${Y(p)}" y2="${Y(p)}" stroke="var(--line)"/><text x="${l - 8}" y="${Y(p) + 4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--f-mono)">${p * 100}%</text>`; });
  L.stages.forEach((st, i) => { s += `<text x="${(X(i) + X(i + 1)) / 2}" y="${b + 18}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(st.name.length > 6 ? st.name.slice(0, 6) + '…' : st.name)}</text>`; });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  s += `<path d="${path} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)}Z" fill="var(--c-${L.sp.hab})" opacity=".14"/>`;
  s += `<path d="${path}" fill="none" stroke="var(--c-${L.sp.hab})" stroke-width="2.2" stroke-linejoin="round"/>`;
  pts.forEach(p => { s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3" fill="var(--c-${L.sp.hab})"/>`; });
  s += `<line x1="${X(youX)}" x2="${X(youX)}" y1="${t - 6}" y2="${b}" stroke="var(--you)" stroke-dasharray="3 4"/>`;
  s += `<circle cx="${X(youX)}" cy="${Y(youP)}" r="6" fill="var(--you)" stroke="var(--surface)" stroke-width="2"/>`;
  s += `<text x="${clamp(X(youX), l + 20, r - 20)}" y="${t - 10}" text-anchor="middle" font-size="12" fill="var(--ink)" font-weight="700">나</text>`;
  s += `<text x="${r}" y="${b + 40}" text-anchor="end" font-size="12" fill="var(--muted)">끝까지 사는 비율 ${probText(pts[n][1])}</text>`;
  return s + '</svg>';
}
function finish() {
  const L = life, s = L.sp;
  const name = L.country ? `사람` : s.name;
  const lived = livedText(s, L.dayAt);
  store.seen[L.id] = (store.seen[L.id] || 0) + 1;
  store.records.unshift({ id: L.id, days: L.dayAt, lived, mode: L.mode.id, a: L.answer, t: Date.now() });
  store.records = store.records.slice(0, 30);
  save();
  show('#v-end'); setHabitat(s.hab);
  const dexN = ORDER.filter(id => store.seen[id]).length;
  const rows = L.journey.map(j => j.kind === 'stage'
    ? `<div class="row stage"><span class="t">${ageText(s, j.day, true)}</span><span>— ${esc(j.t)} —</span></div>`
    : `<div class="row ${j.kind}"><span class="t">${j.day < 0.001 ? '탄생' : ageText(s, j.day, true)}</span><span>${j.label ? `<b>${esc(j.label)}</b> · ` : ''}${esc(j.t)}</span></div>`).join('');
  $('#end').innerHTML = `
    <div class="share">
      <div class="art">${art(L.id, { still: true, art: L.stages[L.si].art, k: L.kAt(L.si) })}</div>
      <div class="txt">
        <span class="k">이번 생은 · 생명 기록</span>
        <span class="big">이번 생은 ${ro(name)} 태어나${L.country ? ` ${L.country.n}에서` : ''} ${eul(lived)} 살았어요.</span>
        ${L.answer ? `<span class="quote">“${esc(L.answer)}”</span>` : ''}
        <div class="row"><span>${L.mode.name} 기준 ${probText(L.d.pAll)} · 진짜 확률 ${probText(speciesProb(L.id, MODE_BY.count))}</span><span>${esc(L.stages[L.si].name)}</span></div>
      </div>
    </div>
    <div class="end-grid">
      <div>
        <span class="label">삶의 궤적</span>
        <div class="journey">${rows}</div>
      </div>
      <div>
        <div class="panel curve">
          <span class="label">같은 순간 태어난 ${L.id === 'human' ? '아기' : '형제'}들의 생존 곡선</span>
          ${curveSvg()}
          <span class="muted" style="font-size:13px">${L.fullSurvive < 0.05 ? '대부분 아주 어릴 때 삶을 마쳐요. 이런 모양을 Ⅲ형 생존 곡선이라고 해요.' : L.fullSurvive > 0.4 ? '대부분 오래 살아요. 이런 모양을 Ⅰ형 생존 곡선이라고 해요.' : '삶의 모든 시기에 조금씩 줄어들어요.'}</span>
        </div>
        <div class="panel">
          <span class="label">${esc(s.name)}에 대해</span>
          <ul class="factlist">${s.facts.map(f => `<li>${esc(f)}</li>`).join('')}<li>자연 수명: ${esc(s.natural)}</li></ul>
        </div>
        <div class="panel">
          <label class="label" for="last-word">이 생명에게 한마디</label>
          <textarea id="last-word" maxlength="120" placeholder="예: 짧았지만 수고했어"></textarea>
          <div class="start-row"><button class="btn" id="again">다시 태어나기</button><button class="btn ghost" id="home">처음으로</button></div>
          <span class="muted" style="font-size:13px">도감 ${dexN} / ${ORDER.length} · 기록은 이 기기에만 남아요.</span>
        </div>
      </div>
    </div>`;
  const keep = () => { const w = $('#last-word').value.trim(); if (w && store.records[0]) { store.records[0].w = w; save(); } };
  $('#again').addEventListener('click', () => { keep(); cancelAnimationFrame(raf); startDraw(); });
  $('#home').addEventListener('click', () => { keep(); goHome(); });
}
function goHome() {
  cancelAnimationFrame(raf); setHabitat(null);
  renderDex(); renderNotes(); initRiver();
  show('#v-landing');
}

/* ================= 컨트롤 ================= */
function updatePlay() { const b = $('#b-play'); b.textContent = playing ? '❚❚' : '▶'; b.setAttribute('aria-label', playing ? '멈추기' : '이어 하기'); }
$('#b-play').addEventListener('click', () => { playing = !playing; updatePlay(); });
document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
  speed = +b.dataset.speed;
  document.querySelectorAll('[data-speed]').forEach(x => x.setAttribute('aria-pressed', x === b));
}));
$('#b-auto').addEventListener('click', e => { auto = !auto; e.currentTarget.setAttribute('aria-pressed', auto); });
$('#go').addEventListener('click', startDraw);
$('#go-hero').addEventListener('click', startDraw);
document.addEventListener('keydown', e => {
  if ($('#v-life').hidden || e.target.closest('textarea, input')) return;
  if (e.code === 'Space') { e.preventDefault(); playing = !playing; updatePlay(); }
});

/* ================= 시작 ================= */
const missing = ORDER.filter(id => !sp(id));
if (missing.length) { document.body.insertAdjacentHTML('afterbegin', `<p style="padding:16px">데이터를 불러오지 못했어요: ${missing.join(', ')}</p>`); return; }
$('#human-odds').textContent = probText(speciesProb('human', MODE_BY.count));
renderModes(); renderLadder(); renderDex(); renderData(); renderNotes(); initRiver(); tickCarousel();
setInterval(() => { if (!$('#v-landing').hidden) tickCarousel(); }, 3000);
let lt = performance.now();
(function landingLoop(now) {
  const dt = Math.min(0.1, ((now || lt) - lt) / 1000); lt = now || lt;
  if (!$('#v-landing').hidden) { tickCounter(); drawRiver(dt); }
  requestAnimationFrame(landingLoop);
})();
// 개발용: 브라우저 콘솔에서 테스트할 수 있게
window.__ibeon = { startDraw, setMode: id => { mode = MODE_BY[id]; }, get life() { return life; } };
})();
