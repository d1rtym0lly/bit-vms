/* ——— движок книги ——— */
(() => {
const {h} = U;
const KEY = 'bit-i-sluchai-v1';
let S = {book:'tv', i:0, done:{}, pred:{}, solved:{}, exam:'2026-12-25', step:{}, seen:{}};
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)||'{}')); } catch(e){}
// настройки для концентрации: пошаговый режим по умолчанию включён
S.ui = Object.assign({steps:true, calm:false, big:false, ruler:false, timer:25}, S.ui||{});
let stepNavApi = null;
const applyUI = () => { const r = document.documentElement.classList; r.toggle('calm', S.ui.calm); r.toggle('bigtext', S.ui.big); r.toggle('ruler', S.ui.ruler); };
applyUI();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };

// в сборке может быть одна книга или обе
const KEYS = Object.keys(BOOKS).filter(k => BOOKS[k].lessons.length);
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII'];
// главы раскладываются по частям в порядке, заданном книгой
for (const k of KEYS){
  const B = BOOKS[k];
  if (!B.parts) { B.parts = [{t:B.sub, ids:B.lessons.map(L=>L.id)}]; }
  const order = B.parts.flatMap(p=>p.ids);
  B.lessons = order.map(id => B.lessons.find(L=>L.id===id)).filter(Boolean);
  B.parts.forEach((p,pi) => p.ids.forEach(id => { const L = B.lessons.find(x=>x.id===id); if (L){ L.part = p.t; L.partNo = pi; } }));
}
const m = /^#(tv|vms)-(\d+)$/.exec(location.hash);
if (m && KEYS.includes(m[1])){ S.book = m[1]; S.i = +m[2]; }
if (!KEYS.includes(S.book)){ S.book = KEYS[0]; S.i = 0; }
S.i = Math.min(S.i, BOOKS[S.book].lessons.length);

const pL = document.getElementById('pL'), pR = document.getElementById('pR'), leaf = document.getElementById('leaf');
let draw = null;

const stampSVG = (n, fresh) => {
  const id = 'arc'+Math.random().toString(36).slice(2,7);
  return `<svg class="stamp${fresh?' new':''}" viewBox="0 0 100 100" aria-label="Штамп: зачтено">
    <defs><path id="${id}" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="600" fill="currentColor" letter-spacing="1.6"><textPath href="#${id}">ЗАЧТЕНО ✦ ГЛАВА ${n} ✦ ЗАЧТЕНО ✦</textPath></text>
    <text x="50" y="60" text-anchor="middle" font-family="Alegreya, serif" font-weight="800" font-size="30" fill="currentColor">${n}</text></svg>`;
};
const medalSVG = (lvl) => {
  const rays = Array.from({length:16},(_,i)=>{ const a=i*Math.PI/8, r1=30, r2=i%2?36:38; return `<line x1="${38+r1*Math.cos(a)}" y1="${38+r1*Math.sin(a)}" x2="${38+r2*Math.cos(a)}" y2="${38+r2*Math.sin(a)}"/>`; }).join('');
  const stars = Array.from({length:5},(_,i)=>`<text x="${18+i*10}" y="58" font-size="9" text-anchor="middle" fill="${i<=lvl?'var(--foil)':'var(--edge)'}">★</text>`).join('');
  return `<svg viewBox="0 0 76 76" aria-hidden="true"><g stroke="var(--foil)" stroke-width="2" stroke-linecap="round">${rays}</g>
    <circle cx="38" cy="38" r="27" fill="var(--paper)" stroke="var(--foil)" stroke-width="2.5"/><circle cx="38" cy="38" r="22" fill="none" stroke="var(--foil)" stroke-width="1"/>
    <text x="38" y="45" text-anchor="middle" font-family="Alegreya, serif" font-weight="800" font-size="22" fill="var(--ink)">${ROMAN[lvl]}</text>${stars}</svg>`;
};

const doneCount = k => BOOKS[k].lessons.filter(L => S.done[L.id]).length;
const solvedCount = L => (L.more||[]).filter((_,j)=>S.solved[L.id+'-'+j]).length;
const updCounts = () => { for (const k of KEYS){ const e = document.getElementById('cnt-'+k); if (e) e.textContent = `${doneCount(k)}/${BOOKS[k].lessons.length}`; } updRank(); };

/* опыт и ранги: всё считается из сохранённого прогресса */
const XP_STAMP = 30, XP_TASK = 10, XP_PRED = 5;
const xpOf = k => BOOKS[k].lessons.reduce((s,L)=> s + (S.done[L.id]?XP_STAMP:0) + (S.pred[L.id]===L.predict.a?XP_PRED:0) + solvedCount(L)*XP_TASK, 0);
const xpMax = k => BOOKS[k].lessons.reduce((s,L)=> s + XP_STAMP + XP_PRED + (L.more||[]).length*XP_TASK, 0);
const STEPS = [0, .12, .3, .55, .8];
const rankOf = k => { const x = xpOf(k), mx = xpMax(k); let i = 0; STEPS.forEach((t,j)=>{ if (x >= t*mx) i = j; });
  return {i, name:BOOKS[k].ranks[i], next:BOOKS[k].ranks[i+1], need: i<4 ? Math.ceil(STEPS[i+1]*mx) - x : 0, x, mx}; };
function updRank(){
  const r = rankOf(S.book);
  document.getElementById('rank').innerHTML = `<span class="rk-l">Ранг</span> <b>${r.name}</b>
    <span class="rk-bar" role="img" aria-label="${r.x} из ${r.mx} очков опыта"><i style="width:${Math.round(r.x/r.mx*100)}%"></i></span>
    <span class="rk-xp">${r.x} XP${r.next ? ` · до «${r.next}» ${r.need}` : ''}</span>`;
  const B = BOOKS[S.book];
  document.getElementById('barProg').style.width = (doneCount(S.book)/B.lessons.length*100)+'%';
}
const toasts = document.getElementById('toasts');
function toast(html, kind){
  const t = h('div',{class:'toast '+(kind||''), html}); toasts.append(t);
  setTimeout(()=>t.classList.add('out'), kind==='rankup' ? 4200 : 2600); setTimeout(()=>t.remove(), kind==='rankup' ? 4700 : 3100);
}
// оборачивает изменение прогресса: показывает полученный опыт и новый ранг
function gain(why, mutate){
  const k = S.book, x0 = xpOf(k), r0 = rankOf(k).i;
  mutate(); save();
  const d = xpOf(k) - x0, r = rankOf(k);
  if (d > 0) toast(`<b>+${d} XP</b> ${why}`);
  if (r.i > r0) toast(`<span class="tk">Новый ранг</span><b>${r.name}</b>`, 'rankup');
  updCounts();
}
const nextUnstamped = B => { const i = B.lessons.findIndex(L => !S.done[L.id]); return i < 0 ? 1 : i+1; };
const chips = L => h('span',{class:'chips'}, h('span',{class:'chip-st'+(S.done[L.id]?' on':''),title:S.done[L.id]?'штамп получен':'нет штампа'},'✦'),
  ...(L.more||[]).map((_,j)=>h('span',{class:'dot'+(S.solved[L.id+'-'+j]?' on':'')})));

function renderCover(B){
  draw = null; stepNavApi = null; pR.hidden = false;
  const r = rankOf(B.key), nTasks = B.lessons.reduce((s,L)=>s+1+(L.more||[]).length,0);
  const cont = nextUnstamped(B);
  const steps = ['Включи таймер фокуса на 15–25 минут и убери телефон.','Иди по шагам главы: на экране всегда один короткий кусок и кнопка «Дальше».','Предскажи ответ до проверки — так мозг включается.','Подвигай рисунок в опыте, потом реши задачу на штамп.','Закончи «Итогами» и «Вопросами к экзамену». Опыт поднимает ранг.'];
  const art = h('div',{class:'cover-art'});
  pL.replaceChildren(
    h('div',{class:'runhead'}, h('span',{}, KEYS.length>1 ? 'Книга '+(B.key==='tv'?'первая':'вторая') : 'Интерактивный учебник'), h('span',{},'подготовка к сессии')),
    h('div',{class:'cover reveal'},
      h('div',{class:'eyebrow'}, `${B.lessons.length} глав · ${B.parts.length} частей · ${nTasks} задач с проверкой`),
      h('h1',{}, B.name),
      h('p',{class:'sub'}, B.sub),
      h('div',{class:'rule'}),
      h('div',{class:'medal'}, h('div',{html:medalSVG(r.i)}),
        h('div',{}, h('div',{class:'mt'},'Твой ранг'), h('div',{class:'mn2'}, r.name),
          h('span',{class:'rk-bar'}, h('i',{style:`width:${Math.round(r.x/r.mx*100)}%`})),
          h('div',{class:'mx'}, `${r.x} из ${r.mx} XP${r.next ? ` · до «${r.next}» ещё ${r.need}` : ' · высший ранг'}`))),
      h('div',{class:'row'}, U.btn(S.done[B.lessons[0].id] ? `Продолжить: глава ${cont}` : 'Начать с главы 1', ()=>go(B.key,cont,1),'pri'), U.btn('Шпаргалка', openSheet), U.btn('Тренажёр', openQuiz), U.btn('Режим концентрации', openFocus)),
      B.cover ? art : null,
      h('p',{class:'theory'}, B.src+'.'),
      h('h3',{},'Как работать с книгой'),
      h('ol',{class:'steps'}, steps.map(s=>h('li',{},s))),
      h('p',{class:'theory'}, `За штамп главы — ${XP_STAMP} XP, за каждую дополнительную задачу — ${XP_TASK}, за верное предсказание — ${XP_PRED}. Ранги: «${B.ranks.join('» → «')}».`)
    ),
    h('div',{class:'folio'},'i')
  );
  if (B.cover) draw = B.cover(art) || null;
  let n = 0;
  pR.replaceChildren(
    h('div',{class:'runhead'}, h('span',{},'Карта курса'), h('span',{}, `${doneCount(B.key)} из ${B.lessons.length} штампов`)),
    ...B.parts.map((p,pi) => {
      const Ls = B.lessons.filter(L=>L.partNo===pi), d = Ls.filter(L=>S.done[L.id]).length;
      return h('div',{class:'partblk reveal',style:`animation-delay:${pi*60}ms`},
        h('div',{class:'parthead'}, h('span',{class:'pr'}, ROMAN[pi]), h('span',{class:'pt'}, p.t), h('span',{class:'pc'}, `${d}/${Ls.length}`)),
        h('div',{class:'pbar'}, h('i',{style:`width:${d/Ls.length*100}%`})),
        h('ul',{class:'toclist'}, Ls.map(L => { const i = ++n; return h('li',{}, h('button',{type:'button',onclick:()=>go(B.key,i,1)},
          h('span',{class:'n'}, String(i)), h('span',{}, L.title, h('br'), h('span',{class:'s'}, L.src)), chips(L))); })));
    }),
    planner(B),
    h('div',{class:'folio'},'ii')
  );
}
function plural(n,a,b,c){ n=Math.abs(n)%100; const d=n%10; if (n>10&&n<20) return c; if (d>1&&d<5) return b; if (d===1) return a; return c; }

/* ——— планировщик подготовки ———
   Оценка времени главы: чтение теории (~250 знаков в минуту для учебного текста), опыт, предсказание с разбором,
   задача на штамп, по 6 минут на каждую дополнительную задачу и 5 минут на итоги и вопросы. */
const plainLen = html => html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').length;
const estFull = L => Math.round(plainLen(L.theory + (L.flap||'') + (L.hook?L.hook.html:''))/250 + 12 + 6 + 8 + (L.more||[]).length*6 + (L.qs?5:0));
const estLeft = L => S.done[L.id] ? ((L.more||[]).length - solvedCount(L))*6 : estFull(L) - solvedCount(L)*6;
const hm = m => { m = Math.round(m); const hh = Math.floor(m/60), mm = m%60; return hh ? `${hh} ч${mm?' '+mm+' мин':''}` : `${mm} мин`; };
const ddmm = d => d.toLocaleDateString('ru-RU',{weekday:'short',day:'2-digit',month:'2-digit'});
const WEEK = {7:[0,1,2,3,4,5,6],6:[1,2,3,4,5,6],5:[1,2,3,4,5],4:[1,2,4,5],3:[1,3,5]};
function planner(B){
  const P = S.plan = S.plan || {}; const p = P[B.key] = Object.assign({exam:S.exam||'2026-12-25', mode:'min', minutes:60, chapters:1, days:6, review:3}, P[B.key]||{});
  const box = h('div',{class:'exam planner'});
  const ctl = (id, label, min, max, step, key, fmt) => U.slider(id, label, min, max, step, p[key], fmt, v => { p[key] = v; save(); calc(); });
  const dateIn = h('input',{type:'date',class:'txt',id:'pl-exam-'+B.key,value:p.exam});
  dateIn.addEventListener('change', () => { if (dateIn.value){ p.exam = dateIn.value; save(); calc(); } });
  const bMin = U.btn('в минутах', ()=>{ p.mode='min'; save(); sync(); calc(); }), bCh = U.btn('в главах', ()=>{ p.mode='ch'; save(); sync(); calc(); });
  const sMin = ctl('pl-min-'+B.key,'могу в день',15,300,15,'minutes',v=>hm(v));
  const sCh = ctl('pl-ch-'+B.key,'глав в день',0.5,5,0.5,'chapters',v=>String(v).replace('.',','));
  const sDays = ctl('pl-days-'+B.key,'дней в неделю',3,7,1,'days',v=>v);
  const sRev = ctl('pl-rev-'+B.key,'дней на повторение',0,7,1,'review',v=>v);
  const sync = () => { bMin.setAttribute('aria-pressed', p.mode==='min'); bCh.setAttribute('aria-pressed', p.mode==='ch'); sMin.hidden = p.mode!=='min'; sCh.hidden = p.mode!=='ch'; };
  const out = h('div',{class:'pl-out'}), plan = h('div',{class:'pl-plan'});
  box.append(h('div',{class:'lbl'},'План подготовки'),
    h('label',{for:'pl-exam-'+B.key},'Дата экзамена:', dateIn),
    h('div',{class:'row'}, h('span',{style:'color:var(--ink-soft);font-size:14px'},'Сколько могу учить:'), bMin, bCh),
    h('div',{class:'ctls'}, sMin, sCh, sDays, sRev), out, plan);
  sync();
  function calc(){
    const left = B.lessons.map((L,i)=>({L, i:i+1, m:estLeft(L)})).filter(x=>x.m>0);
    const total = left.reduce((s,x)=>s+x.m,0), avg = B.lessons.reduce((s,L)=>s+estFull(L),0)/B.lessons.length;
    const today = new Date(); today.setHours(0,0,0,0);
    const exam = new Date(p.exam+'T00:00'), days = Math.round((exam - today)/864e5);
    const studyEnd = new Date(exam); studyEnd.setDate(studyEnd.getDate() - p.review);
    const wk = WEEK[p.days];
    const dayList = []; for (const d = new Date(today); d < studyEnd; d.setDate(d.getDate()+1)) if (wk.includes(d.getDay())) dayList.push(new Date(d));
    const cap = p.mode==='min' ? p.minutes : p.chapters*avg;
    const need = Math.ceil(total / Math.max(1, cap));                       // учебных дней при твоём темпе
    const minPerDay = dayList.length ? Math.ceil(total / dayList.length / 5)*5 : Infinity;
    // дата окончания при твоём темпе (считая только учебные дни недели)
    let fin = null; { let c = 0; for (const d = new Date(today); c < need && c < 2000; d.setDate(d.getDate()+1)) if (wk.includes(d.getDay())) { c++; fin = new Date(d); } }
    const ok = !total || (fin && fin < studyEnd);
    const spare = fin ? Math.round((studyEnd - fin)/864e5) - 1 : 0;
    if (!total){ out.innerHTML = `<div class="pl-verdict ok">Все главы пройдены. До экзамена ${days} ${plural(days,'день','дня','дней')} — гоняй тренажёр и шпаргалку.</div>`; plan.replaceChildren(); return; }
    out.innerHTML = `
      <div class="pl-grid">
        <div><span>Осталось</span><b>${hm(total)}</b><small>${left.length} ${plural(left.length,'глава','главы','глав')}, ≈ ${hm(avg)} на главу</small></div>
        <div><span>До экзамена</span><b>${days>0?days+' '+plural(days,'день','дня','дней'):'—'}</b><small>учебных дней до повторения: ${dayList.length}</small></div>
        <div><span>Твой темп</span><b>${hm(cap)} / день</b><small>займёт ${need} ${plural(need,'учебный день','учебных дня','учебных дней')} · это ${Math.max(1,Math.round(cap/25))} ${plural(Math.max(1,Math.round(cap/25)),'сессия','сессии','сессий')} по 25 мин</small></div>
        <div><span>Нужно минимум</span><b>${isFinite(minPerDay)?hm(minPerDay)+' / день':'—'}</b><small>${isFinite(minPerDay)?'≈ '+(minPerDay/avg).toFixed(1).replace('.',',')+' главы в день':'дата экзамена уже прошла'}</small></div>
      </div>
      <div class="pl-verdict ${ok?'ok':'no'}">${days<=0 ? 'Поставь дату экзамена в будущем.' : ok
        ? `Успеваешь: закончишь ${fin.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}${spare>0?`, запас ${spare} ${plural(spare,'день','дня','дней')}`:''}, затем ${p.review} ${plural(p.review,'день','дня','дней')} повторения.`
        : `Не успеваешь: при таком темпе закончишь ${fin?fin.toLocaleDateString('ru-RU',{day:'numeric',month:'long'}):'слишком поздно'}. Занимайся хотя бы ${hm(minPerDay)} в день${p.days<7?' или добавь дни в неделю':''}.`}</div>`;
    // раскладка глав по дням: главы целиком, длинная глава может перейти на следующий день
    const rows = []; let q = left.map(x=>({...x})), di = 0;
    const dayCap = ok ? cap : Math.max(cap, minPerDay);
    while (q.length && di < dayList.length + 60){
      const d = dayList[di] || (() => { const t = new Date(dayList[dayList.length-1]||today); t.setDate(t.getDate()+(di-dayList.length+1)); return t; })();
      let room = dayCap, items = [];
      while (q.length && room > 0){ const x = q[0], take = Math.min(x.m, room); const begun = x.m < estLeft(x.L); items.push(`гл. ${x.i}${take<x.m ? (begun?' (продолжить)':' (начать)') : (begun?' (закончить)':'')}`); x.m -= take; room -= take; if (x.m<=0) q.shift(); }
      rows.push([d, items, dayCap-room]); di++;
    }
    const tbl = h('table',{}, h('tr',{}, h('th',{},'День'), h('th',{},'Что учить'), h('th',{},'Время')),
      rows.map(([d,it,m],k)=>h('tr',{class:k>=8?'more-row':''}, h('td',{}, ddmm(d)), h('td',{}, it.join(', ')), h('td',{}, hm(m)))));
    if (p.review) tbl.append(h('tr',{}, h('td',{}, '+'+p.review+' дн.'), h('td',{}, 'повторение: шпаргалка, вопросы к экзамену, тренажёр'), h('td',{}, '—')));
    const showAll = rows.length > 8 ? U.btn(`Показать весь план (${rows.length} дней)`, ()=>{ tbl.classList.add('all'); showAll.remove(); }) : null;
    plan.replaceChildren(h('div',{class:'tbl'}, tbl), showAll);
  }
  calc();
  return box;
}

function renderLesson(B, i){
  const L = B.lessons[i-1];
  const stepMode = !!S.ui.steps;
  const pred = S.pred[L.id];
  const flapBody = h('div',{class:'flapbody',hidden:true});
  const flapBtn = h('button',{class:'flapbtn',type:'button','aria-expanded':'false'},
    h('b',{},'Подними клапан'), h('span',{},'разбор и ответ — сначала сделай предсказание'));
  const opts = h('div',{class:'opts',role:'radiogroup'});
  const mark = () => {
    const p = S.pred[L.id];
    [...opts.children].forEach((el,j)=>{ el.classList.toggle('ok', p!=null && j===L.predict.a); el.classList.toggle('no', p===j && j!==L.predict.a); });
  };
  L.predict.opts.forEach((o,j)=>{
    const r = h('input',{type:'radio',name:'pr-'+L.id,id:`pr-${L.id}-${j}`,checked:pred===j});
    r.addEventListener('change', ()=>{ gain('за верное предсказание', ()=>{ S.pred[L.id]=j; }); mark(); openFlap(true); });
    opts.append(h('label',{class:'opt',for:`pr-${L.id}-${j}`}, r, h('span',{html:o})));
  });
  const openFlap = (force) => {
    const open = force===true ? true : flapBtn.getAttribute('aria-expanded')!=='true';
    flapBtn.setAttribute('aria-expanded', open);
    flapBody.hidden = !open;
    if (open && !flapBody.childElementCount){
      const p = S.pred[L.id];
      flapBody.append(
        h('p',{html: p==null ? `<b>Ответ:</b> ${L.predict.opts[L.predict.a]}.` : (p===L.predict.a ? '<b style="color:var(--good)">Верно.</b> ' : `<b style="color:var(--bad)">Не совсем.</b> Правильно: ${L.predict.opts[L.predict.a]}. `)+' '+L.predict.why}),
        h('div',{class:'theory',html:L.flap})
      );
    }
  };
  flapBtn.addEventListener('click', openFlap);
  mark();

  // смысловые блоки главы
  const hookEl = L.hook ? h('aside',{class:'hook reveal',style:'animation-delay:80ms'}, h('div',{class:'hk-eye'}, L.hook.eye), h('h3',{}, L.hook.title), h('div',{html:L.hook.html})) : null;
  const chunks = L.theory.split(/(?=<h3>)/).map(s=>s.trim()).filter(Boolean);
  const theoryEls = chunks.map(c=>h('div',{class:'theory',html:c}));
  const predictEl = h('div',{class:'predict'}, h('div',{class:'lbl'},'Предскажи'), h('p',{html:L.predict.q}), opts);
  const sumEl = L.sum ? h('div',{class:'sum'}, h('div',{class:'lbl'},'Итоги главы'), h('ul',{}, L.sum.map(s=>h('li',{html:s})))) : null;
  const qsEl = L.qs ? h('div',{class:'examq'}, h('div',{class:'lbl'},'Вопросы к экзамену'),
    L.qs.map(([q,a])=>h('details',{}, h('summary',{html:q}), h('div',{class:'ans',html:a})))) : null;

  const fig = h('div',{class:'fig'});
  const input = h('input',{class:'txt',id:'ans-'+L.id,autocomplete:'off',placeholder:L.ch.ph||'ответ','aria-label':'Ответ'});
  const fb = h('p',{class:'fb',role:'status'});
  const slot = h('div',{class:'stampslot'});
  if (S.done[L.id]){ slot.innerHTML = stampSVG(i); fb.className='fb ok'; fb.innerHTML = 'Зачтено. Ответ: '+L.ch.ans; }
  const form = h('form',{}, input, h('button',{class:'btn pri',type:'submit'},'Проверить'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!input.value.trim()){ fb.className='fb no'; fb.textContent='Впиши ответ в поле.'; return; }
    if (L.ch.check(input.value)){
      fb.className='fb ok'; fb.innerHTML = 'Верно! Ответ: '+L.ch.ans+'.';
      if (!S.done[L.id]){ gain('и штамп главы '+i, ()=>{ S.done[L.id]=true; }); slot.innerHTML = stampSVG(i,true); }
    } else { fb.className='fb no'; fb.textContent = L.ch.wrong || 'Пока не сходится. Проверь вычисления или открой подсказку.'; }
  });
  const capEl = h('p',{class:'cap',html:`<b>РИС. ${i}.</b> ${L.figCap}`}), tryEl = h('p',{class:'try',html:'✎ '+L.try});
  const chEl = h('div',{class:'challenge'}, slot, h('div',{class:'lbl'},'Задача на штамп'), h('p',{html:L.ch.q}), form, fb,
    L.ch.hint ? h('details',{class:'hint'}, h('summary',{},'подсказка'), h('div',{html:L.ch.hint})) : null);
  const moreEl = L.more ? renderMore(L) : null;

  // шаги главы: по одному смысловому куску за раз
  const steps = [];
  if (hookEl) steps.push({t:'История', sub:L.hook.title, min:2, els:[hookEl]});
  theoryEls.forEach((el,k)=>{ const t3 = el.querySelector('h3');
    steps.push({t: theoryEls.length>1 ? `Теория ${k+1}/${theoryEls.length}` : 'Теория', sub: t3 ? t3.textContent.replace('§','').trim() : 'главное', min: Math.max(1, Math.round(plainLen(el.innerHTML)/250)+1), els:[el]}); });
  steps.push({t:'Предскажи', sub:'ответь до проверки', min:2, els:[predictEl, flapBtn, flapBody]});
  steps.push({t:'Опыт', sub:'интерактивный рисунок', min:8, els:[fig, capEl, tryEl], right:true});
  steps.push({t:'Задачи', sub:'штамп и доп. задачи', min:8+(L.more||[]).length*6, els:[chEl, moreEl].filter(Boolean), right:true});
  if (sumEl || qsEl) steps.push({t:'Итоги', sub:'итоги и вопросы к экзамену', min:5, els:[sumEl, qsEl].filter(Boolean)});

  const leftEls = steps.filter(s=>!s.right).flatMap(s=>s.els), rightEls = steps.filter(s=>s.right).flatMap(s=>s.els);
  const stepBar = stepMode ? h('div',{class:'stepbar',role:'tablist','aria-label':'Шаги главы'}) : null;
  const stepHead = stepMode ? h('div',{class:'stephead'}) : null;
  const stepNav = stepMode ? h('div',{class:'stepnav'}) : null;
  pL.replaceChildren(
    h('div',{class:'runhead'}, h('span',{}, `${B.name} · часть ${ROMAN[L.partNo]}`), h('span',{}, L.src)),
    h('div',{class:'opener reveal'}, h('span',{class:'bignum','aria-hidden':'true'}, String(i)),
      h('div',{class:'part-lbl'}, `Глава ${i} · ${L.part}`), h('h2',{}, L.title)),
    stepBar, stepHead, ...leftEls,
    h('div',{class:'folio'}, String(i*2))
  );
  pR.replaceChildren(h('div',{class:'runhead'}, h('span',{},'Опыт'), h('span',{}, 'рис. '+i)), ...rightEls, h('div',{class:'folio'}, String(i*2+1)));
  if (pred!=null) openFlap(true);
  draw = L.fig(fig) || null;

  if (!stepMode){ pR.hidden = false; if (draw) requestAnimationFrame(()=>draw()); return; }

  // пошаговый режим
  S.step = S.step || {}; S.seen = S.seen || {};
  const total = steps.reduce((s,x)=>s+x.min,0);
  let cur = Math.min(S.step[L.id]||0, steps.length-1);
  const show = (k, scroll) => {
    cur = k; S.step[L.id] = k; S.seen[L.id] = Math.max(S.seen[L.id]||0, k); save();
    steps.forEach((s,j)=>s.els.forEach(el=>{ el.hidden = j!==k; }));
    if (!flapBody.childElementCount || flapBtn.getAttribute('aria-expanded')!=='true') flapBody.hidden = true;
    const st = steps[k], left = steps.slice(k).reduce((s,x)=>s+x.min,0);
    pR.hidden = !st.right;
    stepBar.replaceChildren(...steps.map((s,j)=>h('button',{type:'button',role:'tab','aria-selected':j===k,class:'sp'+(j===k?' cur':j<=(S.seen[L.id]||0)?' done':''),onclick:()=>show(j,true)},
      h('b',{}, j<k||(j<=(S.seen[L.id]||0)&&j!==k) ? '✓' : String(j+1)), ' '+s.t)));
    stepHead.innerHTML = `<span>Шаг ${k+1} из ${steps.length} · ≈ ${st.min} мин</span><b>${st.t}${st.sub?': '+st.sub:''}</b><i style="width:${(k+1)/steps.length*100}%"></i><small>до конца главы ≈ ${left} мин из ${total}</small>`;
    const last = k === steps.length-1, nextCh = i < B.lessons.length;
    const speak = ('speechSynthesis' in window) ? U.btn('🔊 Слушать', ()=>{
      try { if (speechSynthesis.speaking){ speechSynthesis.cancel(); return; }
        const u = new SpeechSynthesisUtterance(st.els.map(e=>e.innerText).join('. ').replace(/\s+/g,' ').slice(0,4000)); u.lang = 'ru-RU'; u.rate = 1; speechSynthesis.speak(u); } catch(e){} }) : null;
    stepNav.replaceChildren(
      U.btn('← Назад', ()=> k ? show(k-1,true) : (i>1 ? go(B.key,i-1,-1) : go(B.key,0,-1)), 'big'),
      h('span',{class:'sn-mid'}, speak),
      U.btn(last ? (nextCh ? 'Следующая глава →' : 'К обложке →') : 'Дальше →', ()=> !last ? show(k+1,true) : go(B.key, nextCh ? i+1 : 0, 1), 'pri big'));
    (st.right ? pR : pL).insertBefore(stepNav, (st.right ? pR : pL).querySelector('.folio'));
    if (st.right && draw) requestAnimationFrame(()=>draw());
    if (scroll){ try { speechSynthesis && speechSynthesis.cancel(); } catch(e){} stepBar.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'}); }
    stepBar.querySelector('.cur')?.scrollIntoView({block:'nearest', inline:'center'});
  };
  stepNavApi = { next: ()=> cur < steps.length-1 ? (show(cur+1,true), true) : false, prev: ()=> cur > 0 ? (show(cur-1,true), true) : false };
  show(cur, false);
}

function renderMore(L){
  return h('div',{class:'more'}, h('div',{class:'lbl'}, BOOKS[S.book].moreTitle), L.more.map((P,j)=>{
    const key = L.id+'-'+j;
    const num = h('span',{class:'mn'+(S.solved[key]?' done':'')}, '№ '+P.n);
    const inp = h('input',{class:'txt',id:'m-'+key,autocomplete:'off',placeholder:P.ph||'ответ','aria-label':'Ответ к задаче '+P.n});
    const fb = h('p',{class:'fb',role:'status'});
    if (S.solved[key]){ fb.className='fb ok'; fb.innerHTML='Решено. Ответ: '+P.ans; }
    const f = h('form',{}, inp, h('button',{class:'btn',type:'submit'},'Проверить'));
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!inp.value.trim()){ fb.className='fb no'; fb.textContent='Впиши ответ в поле.'; return; }
      if (P.check(inp.value)){ fb.className='fb ok'; fb.innerHTML='Верно! Ответ: '+P.ans+'.'; gain('за задачу № '+P.n, ()=>{ S.solved[key]=true; }); num.classList.add('done'); }
      else { fb.className='fb no'; fb.textContent='Пока не сходится. Проверь вычисления или открой подсказку.'; }
    });
    return h('div',{class:'mq'}, h('p',{}, num, ' ', h('span',{html:P.q})), f, fb,
      P.hint ? h('details',{class:'hint'}, h('summary',{},'подсказка'), h('div',{html:P.hint})) : null);
  }));
}

function render(){
  const B = BOOKS[S.book];
  const bookEl = document.getElementById('book');
  bookEl.dataset.book = S.book;
  bookEl.classList.toggle('stepmode', !!S.ui.steps && S.i>0);
  for (const k of KEYS){ const e = document.getElementById('sp-'+k); if (e) e.setAttribute('aria-pressed', k===S.book); }
  if (S.i===0) renderCover(B); else renderLesson(B, S.i);
  const L = B.lessons[S.i-1];
  document.getElementById('bTitle').innerHTML = S.i ? `<small>${S.i}/${B.lessons.length}</small>${L.title}` : `<small>${B.name}</small>Обложка и карта курса`;
  document.getElementById('bPrev').disabled = S.i===0;
  document.getElementById('bNext').disabled = S.i>=B.lessons.length;
  updCounts();
  try { history.replaceState(null,'','#'+S.book+'-'+S.i); } catch(e){}
}

let busy = false;
function go(book, i, dir){
  if (busy) return;
  if (book===S.book && i===S.i) return;
  closeToc();
  const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches && innerWidth>900 && !S.ui.steps && !S.ui.calm;
  S.book = book; S.i = i; save();
  if (!animate){ render(); window.scrollTo({top:0}); return; }
  busy = true;
  leaf.className = 'leaf ' + (dir<0 ? 'back' : 'fwd');
  setTimeout(()=>{ render(); window.scrollTo({top:0, behavior:'smooth'}); }, 300);
  setTimeout(()=>{ leaf.className='leaf'; busy=false; }, 640);
}

/* оглавление */
const toc = document.getElementById('toc'), tocPanel = document.getElementById('tocPanel');
function openToc(){
  tocPanel.replaceChildren(U.btn('Закрыть', closeToc, 'close'), h('h3',{style:'margin-top:0'},'Оглавление'),
    ...KEYS.map(k => { const B = BOOKS[k]; let n = 0; return h('div',{},
      h('h3',{}, B.name+' — '+B.sub),
      h('ul',{class:'toclist'}, h('li',{}, h('button',{type:'button',onclick:()=>go(k,0,-1)}, h('span',{class:'n'},'·'), h('span',{},'Обложка и карта курса'), h('span',{})))),
      ...B.parts.map((p,pi)=>h('div',{}, h('div',{class:'part-lbl',style:'margin:12px 0 2px'}, `Часть ${ROMAN[pi]} · ${p.t}`),
        h('ul',{class:'toclist'}, B.lessons.filter(L=>L.partNo===pi).map(L=>{ const i = ++n; return h('li',{}, h('button',{type:'button',onclick:()=>go(k,i,1)}, h('span',{class:'n'},String(i)), h('span',{},L.title), chips(L))); }))))); }));
  toc.hidden = false; tocPanel.querySelector('button').focus();
}
function closeToc(){ toc.hidden = true; }
toc.addEventListener('click', e => { if (e.target===toc) closeToc(); });

/* шпаргалка: все формулы и итоги глав текущей книги */
const sheet = document.getElementById('sheet'), sheetIn = document.getElementById('sheetIn');
function openSheet(){
  const B = BOOKS[S.book];
  const search = h('input',{class:'txt',id:'sheetQ',type:'search',placeholder:'поиск по шпаргалке','aria-label':'Поиск по шпаргалке',style:'width:min(280px,100%)'});
  const cols = h('div',{class:'cols'});
  let n = 0;
  B.parts.forEach((p,pi)=>{
    cols.append(h('div',{class:'ph'}, `Часть ${ROMAN[pi]} · ${p.t}`));
    B.lessons.filter(L=>L.partNo===pi).forEach(L=>{
      const i = ++n, tmp = document.createElement('div'); tmp.innerHTML = L.theory;
      const it = h('div',{class:'item'}, h('h3',{}, h('span',{}, i+'.'), ' '+L.title));
      tmp.querySelectorAll('.f').forEach(f=>it.append(f));
      if (L.sum) it.append(h('ul',{}, L.sum.map(s=>h('li',{html:s}))));
      it.append(U.btn('Открыть главу', ()=>{ sheet.hidden = true; go(S.book, i, 1); }));
      cols.append(it);
    });
  });
  search.addEventListener('input', () => { const q = search.value.trim().toLowerCase();
    cols.querySelectorAll('.item').forEach(it => it.hidden = q && !it.textContent.toLowerCase().includes(q)); });
  sheetIn.replaceChildren(h('header',{}, h('h2',{}, `Шпаргалка · ${B.name}`), h('div',{class:'row'}, search, U.btn('Закрыть', ()=>sheet.hidden=true,'pri'))), cols);
  sheet.hidden = false; sheet.scrollTop = 0; search.focus();
}

/* тренажёр: случайные вопросы «предскажи» и вопросы к экзамену */
const quiz = document.getElementById('quiz'), card = document.getElementById('quizCard');
let Q = null;
function openQuiz(){
  const all = KEYS.flatMap(k => BOOKS[k].lessons.map((L,i)=>({k,i:i+1,L})));
  for (let i=all.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [all[i],all[j]]=[all[j],all[i]]; }
  Q = {items:all.slice(0,10), n:0, score:0};
  quiz.hidden = false; showQ();
}
function showQ(){
  if (Q.n>=Q.items.length){
    card.replaceChildren(h('div',{class:'meta'},'Итог'), h('h2',{}, `${Q.score} из ${Q.items.length}`),
      h('p',{}, Q.score>=8 ? 'Отлично, так держать до экзамена.' : 'Вернись к главам, где ошибся: разбор под клапаном, итоги — в конце главы.'),
      h('div',{class:'row'}, U.btn('Ещё 10', openQuiz,'pri'), U.btn('Закрыть', ()=>quiz.hidden=true)));
    card.querySelector('button').focus(); return;
  }
  const {k,i,L} = Q.items[Q.n];
  const fb = h('div',{class:'flapbody',hidden:true});
  const opts = h('div',{class:'opts'});
  let answered = false;
  L.predict.opts.forEach((o,j)=>{
    const b = h('button',{type:'button',class:'opt',style:'border:1px solid var(--edge);background:var(--paper);text-align:left',html:o});
    b.addEventListener('click', ()=>{
      if (answered) return; answered = true;
      if (j===L.predict.a) Q.score++;
      [...opts.children].forEach((el,t)=>{ el.classList.toggle('ok',t===L.predict.a); el.classList.toggle('no',t===j&&j!==L.predict.a); });
      fb.innerHTML = L.predict.why; fb.hidden = false; next.hidden = false; next.focus();
    });
    opts.append(b);
  });
  const next = U.btn(Q.n===Q.items.length-1?'Итог':'Дальше', ()=>{Q.n++; showQ();}, 'pri'); next.hidden = true;
  card.replaceChildren(
    h('div',{class:'meta'}, `Вопрос ${Q.n+1} из ${Q.items.length} · ${BOOKS[k].name}, гл. ${i} «${L.title}»`),
    h('p',{html:L.predict.q, style:'font-size:18px'}), opts, fb,
    h('div',{class:'row',style:'margin-top:12px;justify-content:space-between'}, U.btn('Закрыть', ()=>quiz.hidden=true), next));
  opts.querySelector('button').focus();
}
quiz.addEventListener('click', e => { if (e.target===quiz) quiz.hidden=true; });
document.addEventListener('keydown', e => {
  if (e.key==='Escape'){ closeToc(); quiz.hidden = true; sheet.hidden = true; focusDlg.hidden = true; }
  if (e.target.matches('input,select,textarea') || !toc.hidden || !quiz.hidden || !sheet.hidden || !focusDlg.hidden) return;
  if (e.key==='ArrowRight'){ if (stepNavApi && stepNavApi.next()) return; if (S.i<BOOKS[S.book].lessons.length) go(S.book,S.i+1,1); }
  if (e.key==='ArrowLeft'){ if (stepNavApi && stepNavApi.prev()) return; if (S.i>0) go(S.book,S.i-1,-1); }
});

/* режим концентрации: настройки и таймер фокуса */
const focusDlg = document.getElementById('focus'), focusCard = document.getElementById('focusCard'), chip = document.getElementById('timerChip');
const T = {mode:null, end:0, iv:0};
const BREAK = {10:2, 15:3, 25:5, 45:10};
function beep(){ try { const c = new (window.AudioContext||window.webkitAudioContext)(); [0,.25].forEach(t=>{ const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 660; g.gain.value = .05; o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+.15); }); } catch(e){} }
function timerStart(mode, min){
  clearInterval(T.iv); T.mode = mode; T.end = Date.now() + min*60000;
  const tick = () => { const s = Math.max(0, Math.round((T.end-Date.now())/1000));
    chip.hidden = false; chip.className = 'timerchip '+mode;
    chip.innerHTML = `<b>${mode==='focus'?'Фокус':'Перерыв'}</b> ${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')} <button type="button" aria-label="Остановить таймер">✕</button>`;
    chip.querySelector('button').onclick = timerStop;
    if (!s){ clearInterval(T.iv); beep();
      if (mode==='focus'){ toast(`<b>Сессия окончена!</b> Перерыв ${BREAK[S.ui.timer]||5} мин: встань, попей воды, не открывай ленту.`, 'rankup'); timerStart('break', BREAK[S.ui.timer]||5); }
      else { toast('<b>Перерыв окончен.</b> Готов к следующей сессии? Нажми таймер ещё раз.'); timerStop(); } } };
  tick(); T.iv = setInterval(tick, 1000);
}
function timerStop(){ clearInterval(T.iv); T.mode = null; chip.hidden = true; }
function openFocus(){
  const row = (key, title, desc) => { const id = 'ui-'+key, cb = h('input',{type:'checkbox',id,checked:!!S.ui[key]});
    cb.addEventListener('change', ()=>{ S.ui[key] = cb.checked; save(); applyUI(); render(); });
    return h('label',{class:'fopt',for:id}, cb, h('span',{}, h('b',{},title), h('small',{},desc))); };
  focusCard.replaceChildren(
    h('div',{class:'meta'},'Настройки для концентрации'), h('h2',{style:'margin:4px 0 12px'},'Режим фокуса'),
    row('steps','Пошаговый режим','Глава разбита на короткие шаги: на экране один кусок и кнопка «Дальше». Стрелки ← → листают шаги.'),
    row('calm','Спокойное оформление','Без текстур, наклонов, анимаций и декоративных цифр — меньше отвлекает.'),
    row('big','Крупный текст','Шрифт больше, строки свободнее.'),
    row('ruler','Линейка чтения','Абзац под курсором остаётся ярким, остальной текст приглушается.'),
    h('h3',{},'Таймер фокуса'),
    h('p',{style:'margin:0 0 8px;color:var(--ink-soft);font-size:14px'},'Короткие сессии с перерывами держат внимание лучше, чем час подряд. После сессии таймер сам предложит перерыв.'),
    h('div',{class:'row'}, ...[10,15,25,45].map(m=>{ const b = U.btn(m+' мин', ()=>{ S.ui.timer = m; save(); timerStart('focus', m); focusDlg.hidden = true; }, S.ui.timer===m?'pri':''); return b; }),
      T.mode ? U.btn('Остановить', ()=>{ timerStop(); openFocus(); }) : null),
    h('div',{class:'row',style:'margin-top:16px;justify-content:flex-end'}, U.btn('Готово', ()=>focusDlg.hidden=true,'pri')));
  focusDlg.hidden = false; focusCard.querySelector('input').focus();
}
focusDlg.addEventListener('click', e => { if (e.target===focusDlg) focusDlg.hidden = true; });

/* тема */
function applyTheme(){ if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; draw && draw(); }
document.getElementById('bTheme').onclick = () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  S.theme = dark ? 'light' : 'dark'; save(); applyTheme();
};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>draw && draw());
applyTheme();

document.getElementById('bMenu').onclick = openToc;
document.getElementById('bQuiz').onclick = openQuiz;
document.getElementById('bSheet').onclick = openSheet;
document.getElementById('bFocus').onclick = () => T.mode ? openFocus() : openFocus();
document.getElementById('bPrev').onclick = () => go(S.book, S.i-1, -1);
document.getElementById('bNext').onclick = () => go(S.book, S.i+1, 1);
if (KEYS.length > 1) document.getElementById('spines').append(...KEYS.map(k =>
  h('button',{class:'spine',id:'sp-'+k,type:'button','aria-pressed':'false',onclick:()=>go(k,0,k==='vms'?1:-1)}, BOOKS[k].name.toUpperCase()+' ', h('small',{id:'cnt-'+k}))));
else { const B = BOOKS[KEYS[0]]; document.getElementById('brand').innerHTML = `${B.name} <i>· ${B.sub.toLowerCase()}</i>`; }

addEventListener('hashchange', () => { const m = /^#(tv|vms)-(\d+)$/.exec(location.hash); if (m && KEYS.includes(m[1])) go(m[1], Math.min(+m[2], BOOKS[m[1]].lessons.length), 1); });
let raf = 0;
new ResizeObserver(()=>{ cancelAnimationFrame(raf); raf = requestAnimationFrame(()=>draw && draw()); }).observe(pR);
document.fonts && document.fonts.ready.then(()=>draw && draw());
render();
})();
