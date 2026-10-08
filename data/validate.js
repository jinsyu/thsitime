// 사용법: node data/validate.js data/nematode.js [data/ant.js ...]
const fs = require('fs');
const vm = require('vm');
let bad = 0;
const HABS = ['soil', 'sea', 'sky', 'farm', 'city'];
const ARTS = ['egg', 'young', 'adult', 'old'];
for (const f of process.argv.slice(2)) {
  const out = [];
  const ctx = { registerSpecies: s => out.push(s) };
  try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log(`✗ ${f}: 문법 오류 ${e.message}`); bad++; continue; }
  if (out.length !== 1) { console.log(`✗ ${f}: registerSpecies 호출이 ${out.length}번`); bad++; continue; }
  const s = out[0], errs = [], warn = [];
  for (const k of ['id', 'name', 'sci', 'hab', 'size', 'sizeMm', 'natural', 'ageUnit', 'cohort', 'intro', 'facts', 'stages', 'question', 'endNatural']) if (s[k] == null) errs.push(`필드 없음: ${k}`);
  if (s.id !== 'human' && !s.encounter) errs.push('encounter 없음');
  if (!HABS.includes(s.hab)) errs.push('hab 값 오류');
  if (/[()]/.test(s.name || '')) errs.push('name 에 괄호 금지 (role 사용)');
  if (!Array.isArray(s.facts) || s.facts.length !== 3) errs.push('facts 는 3개');
  let choices = 0, events = 0, full = 1;
  (s.stages || []).forEach((st, i) => {
    const at = `stages[${i}]`;
    for (const k of ['name', 'art', 'days', 's', 'mood', 'events', 'dangers', 'choices', 'causes']) if (st[k] == null) errs.push(`${at}.${k} 없음`);
    if (!ARTS.includes(st.art)) errs.push(`${at}.art 값 오류`);
    if (!(st.s > 0 && st.s <= 1)) errs.push(`${at}.s 범위 오류`);
    full *= st.s || 0;
    const n = (st.events || []).length; events += n;
    if (n < 8 || n > 14) warn.push(`${at}.events ${n}개 (8~12 권장)`);
    if ((st.dangers || []).length < 2) warn.push(`${at}.dangers 2개 이상 권장`);
    if ((st.causes || []).length < 2) errs.push(`${at}.causes 2개 이상`);
    (st.choices || []).forEach(c => { choices++; if (!c.q || !c.opts || c.opts.length < 2) errs.push(`${at} choice 형식 오류`); (c.opts || []).forEach(o => { if (!o.t || !o.r) errs.push(`${at} choice opt 에 t/r 없음`); }); });
    (st.events || []).forEach((e, j) => { if (!e.t) errs.push(`${at}.events[${j}].t 없음`); if (e.t && e.t.length > 70) warn.push(`${at}.events[${j}] 문장이 김 (${e.t.length}자)`); });
  });
  if (s.id !== 'human' && (choices < 2 || choices > 4)) warn.push(`선택지 총 ${choices}개 (2~4 권장)`);
  if (s.question && !(s.question.at >= 0 && s.question.at < (s.stages || []).length)) errs.push('question.at 범위 오류');
  const ok = errs.length === 0;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${s.id}: 단계 ${(s.stages || []).length}, 사건 ${events}, 선택 ${choices}, 끝까지 살 확률 ${(full * 100).toFixed(3)}%`);
  errs.forEach(e => console.log('   오류: ' + e));
  warn.forEach(e => console.log('   주의: ' + e));
}
process.exit(bad ? 1 : 0);
