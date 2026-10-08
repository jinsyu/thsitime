// 이번 생은 — 도감풍 일러스트 (200×140 좌표계)
'use strict';
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// 200×140 좌표계의 도감풍 일러스트. 선은 currentColor, 몸은 --art-fill(종별 색).
const S = 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const SL = 'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"';
const F = 'fill="var(--art-fill)"';
const A = 'fill="var(--art-accent)"';
const N = 'fill="none"';
const K = 'fill="currentColor"';
const TINT = { bee: '--c-farm', krill: '--you', chicken: '--surface', cow: '--surface', pig: '--pink', earthworm: '--pink', sparrow: '--c-soil', human: '--c-sky', mouse: '--c-city', bat: '--c-city', mosquito: '--c-city' };
const tintOf = id => TINT[id] || '--c-' + SPECIES[id].hab;

function tube(d, outer, inner) {
  return `<path d="${d}" ${N} stroke="currentColor" stroke-width="${outer}" stroke-linecap="round"/><path d="${d}" ${N} stroke="var(--art-fill)" stroke-width="${inner}" stroke-linecap="round"/>`;
}
function fish(top, bot, extra) {
  const fy = 37.5 + 0.5 * top + 1;
  return `<path d="M150 75 L182 54 L174 75 L182 96Z" ${F} ${S}/>
    <path d="M90 ${fy + 1} Q100 ${fy - 14} 118 ${fy + 3}" ${F} ${S}/>
    <path d="M100 ${150 - fy - 1} Q108 ${150 - fy + 10} 120 ${150 - fy - 2}" ${F} ${S}/>
    <path d="M36 75 Q90 ${top} 152 75 Q90 ${bot} 36 75Z" ${F} ${S}/>
    <path d="M66 ${75 - (75 - top) * 0.22} Q73 75 66 ${75 + (bot - 75) * 0.22}" ${SL}/>
    <circle cx="52" cy="72" r="3.6" ${K}/>${extra || ''}`;
}
const ART = {
  nematode: () => tube('M28 88 C52 58 74 118 100 88 S146 58 172 82', 12, 7.5) + `<circle cx="172" cy="82" r="1.8" ${K}/>`,
  earthworm: () => {
    const d = 'M22 94 C50 50 80 122 110 86 S160 52 180 78';
    return tube(d, 20, 15) + `<path d="${d}" ${N} stroke="currentColor" stroke-width="15" stroke-dasharray="1.5 8" opacity=".25"/><path d="${d}" ${N} stroke="currentColor" stroke-width="15" stroke-dasharray="0 150 18 600" opacity=".22"/><circle cx="178" cy="76" r="2" ${K}/>`;
  },
  copepod: () => `<path d="M88 50 C48 30 26 36 10 46" ${SL}/><path d="M112 50 C152 30 174 36 190 46" ${SL}/>
    <path d="M84 70 L70 80 M84 80 L70 90 M116 70 L130 80 M116 80 L130 90" ${SL}/>
    <path d="M100 99 V118 M100 118 L91 132 M100 118 L109 132" ${N} ${S}/>
    <ellipse cx="100" cy="72" rx="17" ry="27" ${F} ${S}/>
    <path d="M86 66 H114 M85 78 H115 M88 89 H112" ${N} stroke="currentColor" stroke-width="1.2" opacity=".45"/>
    <circle cx="100" cy="53" r="3.6" ${A}/>`,
  ant: () => `<path d="M90 80 L72 94 L64 112 M94 82 L90 102 L84 120 M98 80 L112 96 L120 114" ${SL} opacity=".35" transform="translate(6 -2)"/>
    <path d="M84 78 L66 92 L58 110 M88 80 L84 100 L78 118 M92 78 L106 94 L114 112" ${SL}/>
    <path d="M52 64 L44 48 L30 44" ${SL}/><path d="M47 77 L40 82" ${SL}/>
    <ellipse cx="130" cy="78" rx="25" ry="17" ${F} ${S}/>
    <circle cx="104" cy="76" r="4.5" ${F} ${S}/>
    <ellipse cx="86" cy="74" rx="15" ry="9" ${F} ${S}/>
    <circle cx="58" cy="72" r="12.5" ${F} ${S}/><circle cx="54" cy="69" r="2.2" ${K}/>`,
  mosquito: () => `<ellipse cx="110" cy="52" rx="32" ry="9" transform="rotate(-18 110 52)" ${F} fill-opacity=".4" ${S}/>
    <path d="M80 82 Q70 100 50 128 M90 84 Q92 104 84 130 M100 84 Q112 102 120 130 M106 82 Q130 96 160 122" ${N} stroke="currentColor" stroke-width="1.4"/>
    <ellipse cx="122" cy="77" rx="34" ry="6.5" transform="rotate(-8 122 77)" ${F} ${S}/>
    <ellipse cx="84" cy="78" rx="12" ry="9" ${F} ${S}/>
    <path d="M60 86 L26 102 M62 78 L50 64" ${SL}/>
    <circle cx="66" cy="82" r="7" ${F} ${S}/><circle cx="64" cy="80" r="2.3" ${K}/>`,
  mayfly: () => `<path d="M140 92 Q170 86 196 64 M140 92 Q170 94 196 92 M140 92 Q170 102 196 120" ${N} stroke="currentColor" stroke-width="1.3"/>
    <path d="M88 80 L96 18 L132 30 L112 82 Z" ${F} fill-opacity=".4" ${S}/>
    <path d="M97 22 L100 80 M112 27 L106 80 M124 30 L110 80" ${N} stroke="currentColor" stroke-width="1" opacity=".5"/>
    <path d="M70 84 L60 104 M84 85 L82 106 M98 87 L104 106" ${SL}/>
    ${tube('M58 80 Q100 76 142 92', 10, 6)}
    <circle cx="54" cy="79" r="7.5" ${F} ${S}/><circle cx="51" cy="77" r="2.2" ${K}/>`,
  bee: () => `<ellipse cx="96" cy="54" rx="19" ry="11" transform="rotate(-25 96 54)" fill="var(--surface)" fill-opacity=".75" ${S}/>
    <ellipse cx="120" cy="51" rx="16" ry="9" transform="rotate(15 120 51)" fill="var(--surface)" fill-opacity=".75" ${S}/>
    <path d="M96 98 L90 114 M108 99 L106 116 M120 97 L126 112" ${SL}/>
    <ellipse cx="108" cy="80" rx="30" ry="20" ${F} ${S}/>
    <path d="M100 62 V98 M116 62 V98" ${N} stroke="currentColor" stroke-width="6"/>
    <path d="M138 78 L150 81 L138 85Z" ${K}/>
    <path d="M66 68 Q60 52 52 50 M72 66 Q72 52 66 46" ${SL}/>
    <circle cx="72" cy="78" r="13" ${F} ${S}/><ellipse cx="67" cy="75" rx="3" ry="4.5" ${K}/>`,
  krill: () => `<path d="M44 66 Q20 40 4 36 M46 64 Q30 30 16 20" ${N} stroke="currentColor" stroke-width="1.4"/>
    <path d="M70 84 L66 104 M84 86 L82 106 M98 86 L98 106 M112 86 L114 104 M126 84 L130 100" ${SL}/>
    <path d="M166 82 L184 72 L190 90 L172 93Z" ${F} ${S}/>
    <path d="M38 72 Q60 50 110 56 Q150 62 168 84 Q150 76 120 82 Q80 90 50 86 Q36 82 38 72Z" ${F} ${S}/>
    <path d="M98 57 Q103 70 98 86 M118 60 Q122 72 119 82 M136 66 Q140 74 138 80" ${N} stroke="currentColor" stroke-width="1.1" opacity=".5"/>
    <circle cx="48" cy="70" r="5" ${K}/>`,
  anchovy: () => fish(54, 96, `<path d="M52 76 Q100 73 148 75" ${N} stroke="var(--surface)" stroke-width="3" opacity=".9"/>`),
  cod: () => fish(38, 112, `<path d="M40 80 L36 94" ${SL}/><g ${K} opacity=".25"><circle cx="96" cy="62" r="2.5"/><circle cx="112" cy="70" r="2.5"/><circle cx="128" cy="64" r="2.5"/><circle cx="104" cy="84" r="2.5"/><circle cx="124" cy="82" r="2.5"/></g>`),
  salmon: () => fish(44, 106, `<path d="M36 75 Q30 84 42 85" ${N} ${S}/><g ${K} opacity=".45"><circle cx="100" cy="60" r="2"/><circle cx="114" cy="64" r="2"/><circle cx="128" cy="63" r="2"/><circle cx="140" cy="70" r="2"/><circle cx="92" cy="66" r="2"/></g>`),
  farmsalmon: () => `<g opacity=".3" stroke="currentColor" stroke-width="1"><path d="M8 20 H192 M8 48 H192 M8 76 H192 M8 104 H192 M8 132 H192 M28 8 V136 M64 8 V136 M100 8 V136 M136 8 V136 M172 8 V136"/></g>` + fish(44, 106, `<g ${K} opacity=".45"><circle cx="100" cy="60" r="2"/><circle cx="114" cy="64" r="2"/><circle cx="128" cy="63" r="2"/></g>`),
  sparrow: () => `<path d="M128 86 L168 98 L162 110 L124 96Z" ${F} ${S}/>
    <path d="M94 104 L90 122 M106 104 L108 122 M84 122 H96 M102 122 H114" ${N} ${S}/>
    <ellipse cx="100" cy="84" rx="34" ry="24" ${F} ${S}/>
    <path d="M90 74 Q120 64 138 88 Q112 98 92 88Z" ${K} fill-opacity=".2" ${S}/>
    <circle cx="70" cy="62" r="17" ${F} ${S}/>
    <circle cx="64" cy="68" r="5" ${K} opacity=".55"/>
    <path d="M54 59 L41 64 L54 69Z" ${K}/><circle cx="65" cy="57" r="2.6" ${K}/>`,
  chicken: () => `<path d="M130 76 Q146 40 164 50 Q162 64 152 70 Q174 62 172 82 Q156 90 136 94Z" ${F} ${S}/>
    <path d="M92 112 L90 130 M108 112 L110 130 M82 130 H96 M104 130 H118" ${N} ${S}/>
    <ellipse cx="102" cy="90" rx="38" ry="26" ${F} ${S}/>
    <path d="M92 84 Q116 74 132 92 Q112 104 94 96Z" ${N} ${S} opacity=".6"/>
    <circle cx="63" cy="42" r="5" ${A}/><circle cx="70" cy="38" r="5.5" ${A}/><circle cx="77" cy="42" r="5" ${A}/>
    <path d="M60 52 Q62 70 80 78 L86 66 Q84 52 76 46Z" ${F} ${S}/>
    <circle cx="70" cy="56" r="15" ${F} ${S}/>
    <ellipse cx="58" cy="70" rx="4" ry="6.5" ${A}/>
    <path d="M56 54 L45 59 L56 63Z" fill="var(--c-farm)" ${S}/><circle cx="67" cy="53" r="2.4" ${K}/>`,
  mouse: () => `<path d="M140 92 Q168 120 192 96" ${N} ${S}/>
    <path d="M86 106 L84 114 M124 106 L126 114" ${N} ${S}/>
    <ellipse cx="108" cy="86" rx="36" ry="24" ${F} ${S}/>
    <ellipse cx="66" cy="84" rx="22" ry="16" ${F} ${S}/>
    <circle cx="76" cy="64" r="12" ${F} ${S}/><circle cx="76" cy="64" r="6" fill="var(--pink)"/>
    <circle cx="58" cy="80" r="2.6" ${K}/><circle cx="44" cy="86" r="3" fill="var(--pink)" ${S}/>
    <path d="M48 86 L28 80 M48 88 L28 90 M48 90 L30 98" ${N} stroke="currentColor" stroke-width="1" opacity=".6"/>`,
  bat: () => `<path d="M100 72 Q74 54 34 50 Q46 72 24 88 Q50 82 58 102 Q74 86 96 94 Z" ${F} ${S}/>
    <path d="M100 72 Q126 54 166 50 Q154 72 176 88 Q150 82 142 102 Q126 86 104 94 Z" ${F} ${S}/>
    <path d="M98 74 L44 66 M98 78 L58 96 M102 74 L156 66 M102 78 L142 96" ${N} stroke="currentColor" stroke-width="1" opacity=".4"/>
    <path d="M91 66 L90 50 L97 62Z M109 66 L110 50 L103 62Z" ${F} ${S}/>
    <ellipse cx="100" cy="80" rx="11" ry="18" ${F} ${S}/>
    <circle cx="96" cy="69" r="1.8" ${K}/><circle cx="104" cy="69" r="1.8" ${K}/>`,
  cow: () => `<path d="M74 102 V128 M88 102 V128 M128 102 V128 M142 102 V128" ${N} stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <path d="M156 70 Q168 92 160 110" ${N} ${S}/>
    <rect x="62" y="58" width="98" height="48" rx="20" ${F} ${S}/>
    <path d="M94 60 Q106 70 102 86 Q90 88 86 76 Q86 64 94 60Z M130 76 Q142 72 148 84 Q140 96 128 92 Q122 84 130 76Z" ${K} fill-opacity=".75"/>
    <path d="M38 48 Q30 34 22 36 M56 48 Q64 34 72 36" ${N} ${S}/>
    <ellipse cx="68" cy="54" rx="9" ry="4.5" ${F} ${S}/>
    <rect x="30" y="46" width="34" height="38" rx="14" ${F} ${S}/>
    <rect x="27" y="70" width="32" height="19" rx="9.5" fill="var(--pink)" ${S}/>
    <circle cx="36" cy="79" r="1.8" ${K}/><circle cx="48" cy="79" r="1.8" ${K}/><circle cx="42" cy="60" r="2.4" ${K}/>`,
  pig: () => `<path d="M82 104 V122 M98 106 V124 M124 106 V124 M140 102 V120" ${N} stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <path d="M152 76 q10 -8 12 2 q2 8 -6 6 q-6 -4 2 -10" ${N} ${S}/>
    <ellipse cx="110" cy="82" rx="44" ry="28" ${F} ${S}/>
    <circle cx="66" cy="78" r="22" ${F} ${S}/>
    <path d="M60 58 L66 42 L80 56Z" ${F} ${S}/>
    <ellipse cx="45" cy="84" rx="8" ry="10.5" ${F} ${S}/>
    <circle cx="45" cy="80" r="1.8" ${K}/><circle cx="45" cy="88" r="1.8" ${K}/>
    <circle cx="60" cy="72" r="2.4" ${K}/><path d="M52 98 Q58 102 64 98" ${SL}/>`,
  whale: () => `<path d="M163 74 L190 56 L182 74 L192 92Z" ${F} ${S}/>
    <path d="M25 75 Q60 45 140 68 L166 74 Q120 100 60 97 Q30 93 25 75Z" ${F} ${S}/>
    <path d="M40 86 Q64 94 92 96 M44 90 Q66 97 90 99" ${N} stroke="currentColor" stroke-width="1" opacity=".45"/>
    <path d="M74 92 Q84 122 116 130 Q102 112 94 94Z" ${F} ${S}/>
    <circle cx="46" cy="79" r="2.6" ${K}/>`,
  human: () => `${tube('M92 100 L88 130 M108 100 L112 130', 10, 6)}${tube('M84 64 L70 94 M116 64 L130 94', 9, 5)}
    <path d="M82 60 Q100 52 118 60 L114 102 H86 Z" ${F} ${S}/>
    <circle cx="100" cy="38" r="15" fill="var(--pink)" ${S}/>
    <path d="M86 34 Q90 20 104 22 Q114 24 115 34 Q106 28 98 30 Q92 30 86 34Z" ${K} opacity=".8"/>
    <circle cx="95" cy="39" r="1.8" ${K}/><circle cx="105" cy="39" r="1.8" ${K}/><path d="M95 45 Q100 48 105 45" ${SL}/>`,
};
const SINGLE_EGG = ['chicken', 'sparrow'];
function eggArt(id) {
  if (SINGLE_EGG.includes(id)) return `<ellipse cx="100" cy="78" rx="24" ry="30" fill="var(--surface)" ${S}/><path d="M84 70 Q88 62 94 60" ${SL} opacity=".35"/>`;
  if (id === 'earthworm') return `<path d="M76 80 Q100 46 124 80 Q100 114 76 80Z" ${F} ${S}/><path d="M70 80 H76 M124 80 H130" ${S}/>`;
  if (id === 'farmsalmon') return `<g opacity=".3" stroke="currentColor" stroke-width="1"><path d="M8 40 H192 M8 120 H192"/></g>` + eggCluster();
  return eggCluster();
}
function eggCluster() {
  const pts = [[86, 78], [100, 72], [114, 78], [92, 92], [108, 92], [100, 84], [122, 90], [78, 90], [100, 100]];
  return pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="var(--surface)" fill-opacity=".9" stroke="currentColor" stroke-width="1.4"/><circle cx="${x + 1}" cy="${y + 1}" r="2.6" ${F}/>`).join('');
}

// 장면 배경: viewBox -70..270 (가로 340) 기준
const BACK = {
  soil: `<rect x="-80" y="-10" width="360" height="160" fill="var(--c-soil)" opacity=".12"/>
    <path d="M-80 30 Q0 22 80 32 T280 28" fill="none" stroke="var(--c-soil)" stroke-width="1.2" opacity=".35"/>
    <path d="M-80 118 Q20 110 110 120 T280 114" fill="none" stroke="var(--c-soil)" stroke-width="1.2" opacity=".35"/>
    <g fill="var(--c-soil)" opacity=".32"><circle cx="-52" cy="22" r="7"/><circle cx="-30" cy="96" r="11"/><circle cx="18" cy="22" r="5"/><circle cx="182" cy="26" r="9"/><circle cx="236" cy="70" r="12"/><circle cx="30" cy="128" r="9"/><circle cx="168" cy="126" r="7"/><circle cx="124" cy="12" r="4"/><circle cx="252" cy="128" r="6"/><circle cx="-62" cy="132" r="5"/></g>
    <path d="M-40 0 Q-30 30 -44 60 M244 0 Q234 26 250 50" fill="none" stroke="var(--c-soil)" stroke-width="1.6" opacity=".4"/>`,
  sea: `<rect x="-80" y="-10" width="360" height="160" fill="var(--c-sea)" opacity=".10"/>
    <path d="M-80 12 Q-55 4 -30 12 T20 12 T70 12 T120 12 T170 12 T220 12 T270 12" fill="none" stroke="var(--c-sea)" stroke-width="2" opacity=".5"/>
    <g fill="none" stroke="var(--c-sea)" stroke-width="1.4"><circle class="bub" cx="-40" cy="132" r="3"/><circle class="bub" style="animation-delay:-2s" cx="226" cy="136" r="4"/><circle class="bub" style="animation-delay:-3.5s" cx="190" cy="130" r="2.5"/><circle class="bub" style="animation-delay:-1s" cx="-12" cy="138" r="2"/><circle class="bub" style="animation-delay:-4.2s" cx="250" cy="134" r="2"/></g>
    <g fill="var(--c-sea)" opacity=".18"><path d="M-80 140 Q-60 120 -50 140Z"/><path d="M240 140 Q252 112 266 140Z"/></g>`,
  sky: `<rect x="-80" y="-10" width="360" height="160" fill="var(--c-sky)" opacity=".10"/>
    <g class="drift" fill="var(--surface)" stroke="var(--c-sky)" stroke-width="1.4"><path d="M-46 36 q4 -14 20 -10 q8 -12 22 -2 q14 -2 12 12 Z"/><path d="M190 24 q4 -10 16 -8 q6 -8 16 0 q10 0 8 8 Z"/></g>
    <g fill="none" stroke="var(--c-sky)" stroke-width="1.4" opacity=".6"><path d="M-70 128 Q-40 112 -10 128 M210 128 Q240 110 270 128"/></g>`,
  farm: `<rect x="-80" y="-10" width="360" height="160" fill="var(--c-farm)" opacity=".10"/>
    <g stroke="var(--c-farm)" stroke-width="2.2" opacity=".6" stroke-linecap="round"><path d="M-80 114 H280 M-80 128 H280"/><path d="M-60 104 V140 M-20 104 V140 M220 104 V140 M260 104 V140"/></g>
    <path d="M-70 60 L-50 44 L-30 60 V96 H-70Z" fill="none" stroke="var(--c-farm)" stroke-width="1.6" opacity=".55"/>`,
  city: `<rect x="-80" y="-10" width="360" height="160" fill="var(--c-city)" opacity=".08"/>
    <g fill="var(--c-city)" opacity=".2"><rect x="-80" y="88" width="24" height="52"/><rect x="-52" y="66" width="20" height="74"/><rect x="-28" y="100" width="16" height="40"/><rect x="214" y="80" width="22" height="60"/><rect x="240" y="58" width="26" height="82"/></g>
    <g fill="var(--surface)" opacity=".7"><rect x="-46" y="74" width="4" height="5"/><rect x="-46" y="88" width="4" height="5"/><rect x="246" y="66" width="4" height="5"/><rect x="256" y="80" width="4" height="5"/></g>`,
};

function art(id, o = {}) {
  const sp = SPECIES[id];
  const key = o.art || 'adult';
  const isEgg = key === 'egg' && id !== 'human';
  const body = isEgg ? eggArt(id) : ART[id]();
  let k = 1;
  if (key === 'young') k = o.k || 0.72;
  const vb = o.scene ? '-70 0 340 140' : '0 0 200 140';
  const bg = o.scene ? BACK[sp.hab] : '';
  const cls = (o.still ? '' : 'bob') + (key === 'old' ? ' old' : '');
  const par = o.scene ? ' preserveAspectRatio="xMidYMid slice"' : '';
  return `<svg viewBox="${vb}"${par} role="img" aria-label="${esc(sp.name)}${isEgg ? ' 알' : ''} 그림" style="--art-fill: var(${tintOf(id)})">${bg}<g transform="translate(100 78) scale(${k.toFixed(2)}) translate(-100 -78)"><g class="${cls}">${body}</g></g></svg>`;
}
