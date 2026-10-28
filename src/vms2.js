/* Книга «Бит», продолжение: главы по Зубкову (гл. 2, 4, 5, 10), защита лабораторных, части, итоги и вопросы к экзамену */
(() => {
const {h, fr} = U;
const add = L => BOOKS.vms.lessons.push(L);
const hx = (v, w) => (v>>>0).toString(16).toUpperCase().padStart(w||0,'0');
const bin = (v, w) => (v>>>0).toString(2).padStart(w,'0').slice(-w);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const P = (n, q, check, ans, hint, ph) => ({n, q, check, ans, hint, ph});
const dec = t => s => U.near(s, t, 0);
const hexEq = v => s => U.hex(s) === v;
// число из поля: 0x.., ..h — hex, иначе десятичное (можно отрицательное)
const parseVal = s => { s = String(s).trim(); if (/^(0x[0-9a-f]+|[0-9][0-9a-f]*h)$/i.test(s)) return U.hex(s); const v = U.num(s); return isFinite(v) ? Math.round(v) : NaN; };
const parity = v => { let c = 0; for (let i=0;i<8;i++) c += (v>>i)&1; return c%2===0 ? 1 : 0; };
const bits8 = v => `<span class="mono">${bin(v,8).slice(0,4)} ${bin(v,8).slice(4)}</span>`;

/* 11. Числа с плавающей запятой */
add({
  id:'vms11', title:'Числа с плавающей запятой: IEEE 754 и FPU', src:'Зубков, 2.4; практ. №1',
  theory:`<p>Целые числа хранятся с <b>фиксированной</b> запятой. Для дробных и очень больших чисел используют <b>плавающую</b> запятую: число записывают как мантиссу и порядок, как в «научной» записи 6,02·10²³, только по основанию 2.</p>
  <div class="f">X = (−1)<sup>S</sup> · 1,M · 2<sup>E − смещение</sup><small>S — знак, E — смещённый порядок, M — дробная часть нормализованной мантиссы; ведущая единица «скрыта» и не хранится</small></div>
  <div class="tbl"><table><tr><th>Формат (Зубков: типы FPU)</th><th>Бит</th><th>Знак</th><th>Порядок</th><th>Мантисса</th><th>Смещение</th></tr>
  <tr><td>одинарная точность (dd, float)</td><td>32</td><td>1</td><td>8</td><td>23</td><td>127</td></tr>
  <tr><td>двойная точность (dq, double)</td><td>64</td><td>1</td><td>11</td><td>52</td><td>1023</td></tr>
  <tr><td>расширенная (dt, 80 бит FPU)</td><td>80</td><td>1</td><td>15</td><td>64 (единица явная)</td><td>16383</td></tr></table></div>
  <h3>Как перевести число в single</h3>
  <ol><li>Перевести в двоичную систему: 6,5 = 110,1₂.</li><li>Нормализовать: 1,101₂·2².</li><li>Порядок + смещение: 2 + 127 = 129 = 10000001₂.</li><li>Мантисса — биты после запятой: 101000…0.</li><li>Знак: 0 для «+», 1 для «−». −6,5 → 1 10000001 10100…0 = C0D00000h.</li></ol>
  <p>Особые значения: E = 0 и M = 0 — ноль (бывает +0 и −0); E = все единицы и M = 0 — ±∞; E = все единицы и M ≠ 0 — NaN («не число»). Числа с E = 0 и M ≠ 0 — денормализованные.</p>
  <p><b>Сопроцессор FPU</b> (8087 у 8086, встроен с 80486) работает со стеком из восьми 80-битных регистров ST(0)…ST(7): <code>fld</code> загружает число в стек, <code>fadd</code>, <code>fmul</code>, <code>fdiv</code> считают, <code>fstp</code> выгружает.</p>`,
  predict:{q:'Сколько бит отводится под порядок в формате одинарной точности (32 бита)?', opts:['7','8','11'], a:1,
    why:'1 бит знака + 8 бит порядка + 23 бита мантиссы = 32. В double порядок занимает 11 бит, мантисса — 52.'},
  flap:`<p><b>−6,5 в формате single.</b> 6,5 = 110,1₂ = 1,101₂·2². Порядок 2 + 127 = 129 = 1000 0001₂. Мантисса 101 0000 0000 0000 0000 0000.</p>
  <p>Склеиваем: 1 | 1000 0001 | 1010 0000 … → 1100 0000 1101 0000 0000 … = <b>C0D00000h</b>.</p>
  <p><b>Обратно:</b> 41200000h = 0 | 1000 0010 | 010 0… → порядок 130 − 127 = 3, мантисса 1,01₂ = 1,25; 1,25·2³ = <b>10</b>.</p>`,
  figCap:'32 бита числа одинарной точности. Знак — фиолетовый, порядок — синий, мантисса — чёрный. Биты можно щёлкать.',
  try:'Впиши 0,1 — увидишь бесконечную двоичную дробь, обрезанную до 23 бит, и ошибку округления.',
  ch:{q:'Запишите число −6,5 в формате одинарной точности (hex, 8 цифр).', ph:'например 3F800000', check:hexEq(0xC0D00000), ans:'C0D00000h', hint:'6,5 = 1,101₂·2²; порядок 129.'},
  fig(el){
    const dv = new DataView(new ArrayBuffer(4));
    const inp = h('input',{class:'txt',id:'vms11-x',value:'-6.5',style:'width:10em','aria-label':'Число'});
    const bitsBox = h('div',{class:'row',style:'gap:2px'}), out = h('div',{class:'readout'});
    let u = 0;
    const fromText = () => { const v = U.num(inp.value); if (isFinite(v)){ dv.setFloat32(0, v); u = dv.getUint32(0); } draw(); };
    inp.addEventListener('input', fromText);
    el.append(h('div',{class:'row'}, h('label',{for:'vms11-x'},'Число:'), inp, ...['1','0,1','−6,5','1e30','−0'].map(t=>U.btn(t,()=>{ inp.value = t.replace('−','-').replace(',','.'); fromText(); }))), bitsBox, out);
    function draw(){
      bitsBox.replaceChildren(...Array.from({length:32},(_,i)=>{ const b = (u>>>(31-i))&1, col = i===0?'var(--stamp)':i<9?'var(--pen)':'var(--ink)';
        const bt = h('button',{type:'button',class:'btn','aria-label':'бит '+(31-i),style:`width:20px;padding:3px 0;box-shadow:none;font:600 12px var(--f-mono);border-color:${col};color:${b?'var(--paper)':col};background:${b?col:'var(--paper)'};${i===1||i===9?'margin-left:6px':''}`},String(b));
        bt.onclick = () => { u = (u ^ (1<<(31-i)))>>>0; dv.setUint32(0,u); inp.value = String(dv.getFloat32(0)); draw(); }; return bt; }));
      dv.setUint32(0,u); const v = dv.getFloat32(0), s = u>>>31, e = (u>>>23)&255, m = u & 0x7FFFFF;
      const want = U.num(inp.value);
      const kind = e===255 ? (m ? 'NaN' : (s?'−∞':'+∞')) : e===0 ? (m ? 'денормализованное' : (s?'−0':'+0')) : 'нормализованное';
      out.innerHTML = `hex: <b>${hx(u,8)}h</b> · знак ${s} · порядок ${bin(e,8)} = ${e}${e&&e<255?` → 2<sup>${e-127}</sup>`:''} · ${kind}<br>мантисса 1,${bin(m,23).replace(/0+$/,'')||'0'}₂ = ${(1+m/2**23).toPrecision(9)}<br>хранится: <span class="hot">${v}</span>${isFinite(want)&&want!==v&&isFinite(v)?` · ошибка округления ${(v-want).toExponential(2)}`:''}`;
    }
    fromText();
    return null;
  }
});

/* 12. Архитектура ЭВМ */
add({
  id:'vms12', title:'Архитектура ЭВМ: процессор, память, шины', src:'Зубков, гл. 1–2; курс ВМиС',
  theory:`<p>Почти все компьютеры построены по <b>принципам фон Неймана</b> (1945):</p>
  <ul><li><b>двоичное кодирование</b> — и данные, и команды записаны в двоичном коде;</li><li><b>программное управление</b> — программа — последовательность команд, выполняемых процессором по порядку;</li><li><b>однородность памяти</b> — команды и данные хранятся в одной памяти, и различить их можно только по способу использования;</li><li><b>адресность</b> — память состоит из пронумерованных ячеек, к любой можно обратиться по адресу.</li></ul>
  <p>В <b>гарвардской архитектуре</b> память команд и данных разделена (так устроены многие микроконтроллеры и кэши процессоров).</p>
  <h3>Состав ЭВМ</h3>
  <p><b>Процессор</b>: арифметико-логическое устройство (АЛУ) считает, устройство управления (УУ) выбирает и расшифровывает команды, регистры хранят операнды. <b>Память</b>: ОЗУ, ПЗУ (BIOS). <b>Устройства ввода-вывода</b> подключены через порты и контроллеры. Всё связано <b>шинами</b>:</p>
  <div class="tbl"><table><tr><th>Шина</th><th>Что передаёт</th><th>У 8086</th></tr>
  <tr><td>адреса</td><td>номер ячейки или порта</td><td>20 линий → 2²⁰ = 1 МБ</td></tr>
  <tr><td>данных</td><td>сами данные и коды команд</td><td>16 бит</td></tr>
  <tr><td>управления</td><td>сигналы чтения, записи, прерываний, тактирования</td><td>RD, WR, M/IO, INTR…</td></tr></table></div>
  <h3>Цикл выполнения команды</h3>
  <ol><li><b>Выборка</b>: адрес из CS:IP — на шину адреса, код команды — по шине данных в процессор.</li><li><b>Декодирование</b>: УУ определяет операцию и операнды; IP увеличивается на длину команды.</li><li><b>Выборка операндов</b> из регистров или памяти.</li><li><b>Исполнение</b> в АЛУ, установка флагов.</li><li><b>Запись результата</b>.</li></ol>
  <p>В 8086 этим занимаются два блока: <b>BIU</b> (шинный интерфейс) заранее подкачивает команды в <b>очередь из 6 байт</b>, а <b>EU</b> (исполнительный блок) их выполняет — первый шаг к конвейеру.</p>
  <h3>Иерархия памяти</h3>
  <p>Регистры (доли наносекунды, байты) → кэш L1/L2/L3 (единицы нс, КБ–МБ) → ОЗУ (десятки нс, ГБ) → SSD/HDD (микро- и миллисекунды, ТБ). Чем ближе к процессору, тем быстрее, дороже и меньше. Кэш работает благодаря <b>локальности</b>: программы часто обращаются к тем же и соседним адресам.</p>`,
  predict:{q:'Сколько памяти может адресовать процессор с 20-разрядной шиной адреса?', opts:['64 КБ','1 МБ','16 МБ'], a:1,
    why:'2²⁰ = 1 048 576 байт = 1 МБ. Поэтому у 8086 адрес и считается как сегмент·16 + смещение: 16-битным регистрам нужно получить 20 бит.'},
  flap:`<p><b>Объём адресуемой памяти</b> = 2<sup>разрядность шины адреса</sup>: 8086 — 2²⁰ = 1 МБ; 80286 — 2²⁴ = 16 МБ; 80386 — 2³² = 4 ГБ.</p>
  <p><b>Разрядность шины данных</b> определяет, сколько бит передаётся за одно обращение: у 8086 — 16, у 8088 (IBM PC) — 8, хотя внутри он тоже 16-битный.</p>
  <p>На рисунке справа — учебная машина: прогони программу по шагам и следи, какая шина работает в каждой фазе.</p>`,
  figCap:'Учебная ЭВМ. Каждый щелчок «Шаг» — одна фаза цикла. Светится шина, по которой идут данные.',
  try:'Пройди программу до HLT: в ячейке 8 должна появиться сумма 25 + 17.',
  ch:{q:'У процессора 80286 шина адреса 24-разрядная. Сколько мегабайт памяти он может адресовать?', check:dec(16), ans:'16 МБ', hint:'2²⁴ байт = 2⁴·2²⁰.'},
  fig(el){
    const PROG = [['LOAD',6],['ADD',7],['STORE',8],['HLT',0]];
    let st;
    const reset = () => { st = {mem:[...PROG.map(p=>p[0]+' '+(p[0]==='HLT'?'':p[1])), '', '', 25, 17, 0], ip:0, ir:'—', acc:0, ph:0, bus:'', note:'Нажми «Шаг»: начнём с выборки первой команды.', halt:false}; draw(); };
    const step = () => {
      if (st.halt) return;
      const [op, a] = PROG[st.ip] || ['HLT',0];
      if (st.ph===0){ st.bus='addr'; st.note=`Выборка: IP = ${st.ip} → шина адреса, память отдаёт код команды.`; st.ph=1; }
      else if (st.ph===1){ st.bus='data'; st.ir = op+(op==='HLT'?'':' '+a); st.note=`Код «${st.ir}» по шине данных попал в регистр команд. IP = IP + 1.`; st.ip++; st.ph=2; }
      else if (st.ph===2){ st.bus='ctrl'; st.note=`Декодирование: УУ видит операцию ${op}${op==='HLT'?'':' с адресом '+a}.`; st.ph = op==='HLT' ? 4 : 3; }
      else if (st.ph===3){
        if (op==='LOAD'){ st.acc = st.mem[a]; st.bus='data'; st.note=`Исполнение: ячейка ${a} (${st.mem[a]}) по шине данных → аккумулятор.`; }
        if (op==='ADD'){ st.acc += st.mem[a]; st.bus='alu'; st.note=`Исполнение: АЛУ складывает аккумулятор с ячейкой ${a}: результат ${st.acc}.`; }
        if (op==='STORE'){ st.mem[a] = st.acc; st.bus='data'; st.note=`Запись: аккумулятор (${st.acc}) по шине данных → ячейка ${a}.`; }
        st.ph = 0;
      } else { st.halt = true; st.bus=''; st.note='HLT: процессор остановлен. В ячейке 8 — сумма.'; }
      draw();
    };
    el.append(h('div',{class:'row'}, U.btn('Шаг ▶', step, 'pri'), U.btn('Сначала', reset)));
    const cv = U.canvas(el, w=>w<420?.95:.62), out = h('div',{class:'readout'}); el.append(out);
    function draw(){
      if (!st) return;
      const {g,W,H} = cv.fit(), c = U.col(), narrow = W < 420;
      const box = (x,y,w,hh,t,glow) => { g.save(); if (glow){ g.shadowColor=c.glow; g.shadowBlur=14; } g.fillStyle=c.paper; g.fillRect(x,y,w,hh); g.strokeStyle=glow?c.glow:c.ink; g.lineWidth=glow?2.5:1.4; g.strokeRect(x,y,w,hh); g.restore(); U.text(g,t,x+6,y+15,{size:11,color:c.soft,kind:'mono'}); };
      const cpuW = narrow ? W-20 : W*.42, cx = 10, cy = 10, cpuH = narrow ? H*.38 : H-60;
      box(cx,cy,cpuW,cpuH,'ПРОЦЕССОР');
      const reg = (i,name,val,glow) => { const y = cy+26+i*((cpuH-36)/4); box(cx+10,y,cpuW-20,(cpuH-36)/4-8,name,glow); U.text(g,String(val),cx+cpuW-18,y+(cpuH-36)/8+2,{size:15,align:'right',kind:'mono',w:600}); };
      reg(0,'IP — счётчик команд',st.ip,st.bus==='addr'); reg(1,'регистр команд',st.ir,st.ph===2||st.bus==='ctrl'); reg(2,'АЛУ',st.bus==='alu'?'+':'',st.bus==='alu'); reg(3,'аккумулятор',st.acc,st.bus==='data'&&st.ph===0);
      const mx = narrow ? 10 : W*.62, my = narrow ? cy+cpuH+50 : 10, mw = narrow ? W-20 : W*.38-10, mh = narrow ? H-my-8 : H-20, rh = mh/9;
      box(mx,my,mw,mh,'ПАМЯТЬ');
      st.mem.forEach((v,i)=>{ const y = my+20+i*rh*0.98, hot = (i===st.ip-(st.ph===2||st.ph===3?1:0) && st.bus==='addr') || ((PROG[st.ip-1]||[])[1]===i && st.ph===0 && st.bus==='data');
        if (hot){ g.fillStyle = c.wash; g.fillRect(mx+2,y,mw-4,rh-2); }
        U.text(g,String(i),mx+8,y+rh*.65,{size:11,color:c.soft,kind:'mono'}); U.text(g,String(v),mx+30,y+rh*.65,{size:13,kind:'mono',w:i>=6?600:400,color:i>=6?c.stamp:c.ink}); });
      const busY = narrow ? [cy+cpuH+12, cy+cpuH+24, cy+cpuH+36] : [H*.3, H*.5, H*.7];
      [['шина адреса','addr'],['шина данных','data'],['шина управления','ctrl']].forEach(([t,k],i)=>{ const on = st.bus===k || (k==='data'&&st.bus==='alu'&&false);
        g.save(); if (on){ g.shadowColor=c.glow; g.shadowBlur=12; } g.strokeStyle = on ? c.glow : c.edge; g.lineWidth = on ? 4 : 2.5;
        g.beginPath(); if (narrow){ g.moveTo(20,busY[i]); g.lineTo(W-20,busY[i]); } else { g.moveTo(cx+cpuW,busY[i]); g.lineTo(mx,busY[i]); } g.stroke(); g.restore();
        U.text(g,t,narrow?W/2:(cx+cpuW+mx)/2,busY[i]-6,{size:10,align:'center',color:on?c.ink:c.soft,kind:'mono'}); });
      out.innerHTML = esc(st.note);
    }
    reset();
    return draw;
  }
});

/* 13. Пересылка, арифметика, флаги */
add({
  id:'vms13', title:'Пересылка и арифметика. Флаги процессора', src:'Зубков, 2.1.4, 2.3.1–2.3.3',
  theory:`<p><b>MOV приёмник, источник</b> копирует данные. Ограничения: нельзя «память ← память», нельзя записать константу прямо в сегментный регистр (только через регистр общего назначения: <code>mov ax,dseg / mov ds,ax</code>), нельзя менять CS командой mov, размеры операндов должны совпадать. Ещё: <code>xchg</code> — обмен, <code>lea</code> — загрузить адрес (смещение), <code>push</code>/<code>pop</code> — стек.</p>
  <div class="tbl"><table><tr><th>Команда</th><th>Действие</th></tr>
  <tr><td><code>add / adc</code></td><td>сложение / с переносом: a + b + CF</td></tr>
  <tr><td><code>sub / sbb</code></td><td>вычитание / с заёмом: a − b − CF</td></tr>
  <tr><td><code>inc / dec</code></td><td>±1, флаг CF <b>не меняют</b></td></tr>
  <tr><td><code>neg</code></td><td>смена знака (дополнительный код)</td></tr>
  <tr><td><code>cmp a,b</code></td><td>вычитание без записи результата — только флаги</td></tr>
  <tr><td><code>mul / imul src</code></td><td>беззнаковое / знаковое: AX = AL·src (байт), DX:AX = AX·src (слово)</td></tr>
  <tr><td><code>div / idiv src</code></td><td>AL = AX / src, AH = остаток (байт); AX = DX:AX / src, DX = остаток (слово)</td></tr>
  <tr><td><code>cbw / cwd</code></td><td>расширить знак: AL → AX, AX → DX:AX</td></tr>
  <tr><td><code>daa / das, aaa…</code></td><td>десятичная коррекция для BCD</td></tr></table></div>
  <h3>Регистр флагов</h3>
  <div class="tbl"><table><tr><th>Флаг</th><th>Когда равен 1</th></tr>
  <tr><td>CF перенос</td><td>беззнаковый результат не поместился (перенос или заём из старшего бита)</td></tr>
  <tr><td>ZF ноль</td><td>результат равен 0</td></tr>
  <tr><td>SF знак</td><td>старший бит результата 1 (отрицательный в доп. коде)</td></tr>
  <tr><td>OF переполнение</td><td>знаковый результат не поместился: + и + дали −, или − и − дали +</td></tr>
  <tr><td>PF чётность</td><td>в младшем байте результата чётное число единиц</td></tr>
  <tr><td>AF вспомогательный перенос</td><td>перенос из бита 3 в бит 4 (для BCD)</td></tr>
  <tr><td>DF, IF, TF</td><td>управляющие: направление строк, разрешение прерываний, пошаговый режим</td></tr></table></div>
  <p>Деление на 0 или слишком большое частное вызывает <b>прерывание 0</b> («Divide overflow»).</p>`,
  predict:{q:'<code>mov al,0FFh / add al,1</code>. Что будет с флагами CF и ZF?', opts:['CF = 0, ZF = 0','CF = 1, ZF = 1','CF = 0, ZF = 1'], a:1,
    why:'FFh + 1 = 100h: в байт помещается 00h (ZF = 1), а единица ушла переносом (CF = 1). Для знаковых чисел это −1 + 1 = 0 — переполнения нет, OF = 0.'},
  flap:`<p><b>7Fh + 1.</b> 0111 1111 + 1 = 1000 0000 = 80h. Беззнаково 127 + 1 = 128 — всё верно, CF = 0. Знаково 127 + 1 = −128 — неверно, <b>OF = 1</b>. SF = 1, ZF = 0.</p>
  <p><b>mov ax,1000 / mov bl,10 / div bl.</b> AL = 1000 / 10 = 100 (64h), AH = 0. А <code>div bl</code> при AX = 3000 даст частное 300 &gt; 255 — прерывание 0.</p>
  <p><b>Правило:</b> CF следит за беззнаковыми числами, OF — за знаковыми. Процессор считает одинаково, а смысл выбирает программист.</p>`,
  figCap:'8-битное АЛУ. Выбери операцию и операнды — увидишь результат и все флаги с объяснением.',
  try:'Сложи 7Fh и 1: CF = 0, но OF = 1. Потом FFh и 1: наоборот.',
  ch:{q:'<code>mov al,7Fh / add al,1</code>. Чему равен флаг OF?', check:dec(1), ans:'1 — 127 + 1 вышло за диапазон знакового байта', hint:'Сложили два положительных, а старший бит результата стал 1.'},
  fig(el){
    const OPS = ['ADD','ADC','SUB','SBB','CMP','INC','DEC','NEG','MUL','DIV'];
    let op = 0, A = '7Fh', B = '1', cin = 0;
    const ia = h('input',{class:'txt',id:'vms13-a',value:A,style:'width:6em','aria-label':'AL'}), ib = h('input',{class:'txt',id:'vms13-b',value:B,style:'width:6em','aria-label':'второй операнд'});
    const bc = U.btn('CF до = 0', ()=>{ cin ^= 1; draw(); });
    [ia,ib].forEach(i=>i.addEventListener('input',()=>draw()));
    el.append(h('div',{class:'row'}, U.select('vms13-op', OPS, v=>{op=v; draw();}), h('label',{for:'vms13-a'},'AL ='), ia, h('label',{for:'vms13-b'},'src ='), ib, bc));
    const out = h('div',{class:'readout',style:'font-size:14.5px'}); el.append(out);
    function draw(){
      bc.textContent = 'CF до = '+cin; bc.setAttribute('aria-pressed', !!cin);
      const a = parseVal(ia.value), b = parseVal(ib.value), o = OPS[op];
      if (!isFinite(a) || a<-128 || a>255 || ((!['INC','DEC','NEG'].includes(o)) && (!isFinite(b) || b<-128 || b>255))){ out.innerHTML = '<span class="bad">Операнды — байты: от −128 до 255, можно в hex (7Fh, 0x80).</span>'; return; }
      const x = a & 255, y = (b & 255) || 0;
      let r, F = {}, txt = '';
      if (o==='MUL'){ const p = x*y; F.CF = F.OF = p>255?1:0; out.innerHTML = `AX = AL·src = ${x}·${y} = <b>${p}</b> = ${hx(p,4)}h<br>AH = ${hx(p>>8,2)}h · AL = ${hx(p&255,2)}h · CF = OF = ${F.CF} ${F.CF?'(старшая половина не ноль)':''}<br><span style="color:var(--ink-soft)">остальные флаги после MUL не определены</span>`; return; }
      if (o==='DIV'){ const ax = a & 0xFFFF; if (!y){ out.innerHTML = '<span class="bad">Деление на 0 → прерывание INT 0 («Divide overflow»)</span>'; return; }
        const q = Math.floor(ax/y), m = ax%y; out.innerHTML = q>255 ? `<span class="bad">AX/src = ${ax}/${y} = ${q} &gt; 255 — частное не влезает в AL → INT 0</span>` : `AX = ${ax} (здесь AL трактуем как AX) · AL = частное <b>${q}</b> · AH = остаток <b>${m}</b>`; return; }
      if (['ADD','ADC','INC'].includes(o)){ const yy = o==='INC'?1:y, c0 = o==='ADC'?cin:0; const s = x+yy+c0; r = s & 255;
        F.CF = o==='INC' ? cin : (s>255?1:0); F.OF = ((x^r)&(yy^r)&0x80)?1:0; F.AF = ((x^yy^r)&0x10)?1:0; txt = `${hx(x,2)}h + ${hx(yy,2)}h${c0?' + CF':''}`; }
      else { const yy = o==='DEC'?1:(o==='NEG'?x:y), xx = o==='NEG'?0:x, c0 = o==='SBB'?cin:0; const d = xx-yy-c0; r = d & 255;
        F.CF = o==='DEC' ? cin : o==='NEG' ? (x?1:0) : (d<0?1:0); F.OF = ((xx^yy)&(xx^r)&0x80)?1:0; F.AF = ((xx^yy^r)&0x10)?1:0; txt = o==='NEG' ? `0 − ${hx(x,2)}h` : `${hx(xx,2)}h − ${hx(yy,2)}h${c0?' − CF':''}`; }
      F.ZF = r===0?1:0; F.SF = r>>7; F.PF = parity(r);
      const sg = v => v>127 ? v-256 : v;
      const why = {CF: o==='INC'||o==='DEC' ? 'не меняется' : F.CF ? 'перенос/заём из старшего бита' : 'беззнаковый результат верный', ZF: F.ZF?'результат 0':'не ноль', SF: F.SF?'старший бит 1':'старший бит 0', OF: F.OF?'знаковое переполнение!':'знаковый результат верный', PF: F.PF?'чётное число единиц':'нечётное число единиц', AF: F.AF?'перенос из бита 3':'—'};
      out.innerHTML = `${txt} = ${bits8(r)} = <b>${hx(r,2)}h</b>${o==='CMP'?' <span style="color:var(--ink-soft)">(результат не записывается)</span>':''}<br>без знака: ${r} · со знаком: ${sg(r)}<br>`+
        Object.keys(why).map(k=>`${k} = <span class="${F[k]?'hot':''}">${F[k]}</span> <span style="color:var(--ink-soft)">${why[k]}</span>`).join('<br>');
    }
    draw();
    return null;
  }
});

/* 14. Логика и сдвиги */
add({
  id:'vms14', title:'Логические операции, сдвиги и маски', src:'Зубков, 2.3.4–2.3.6',
  theory:`<div class="tbl"><table><tr><th>Команда</th><th>Что делает с битами</th><th>Типичное применение</th></tr>
  <tr><td><code>and</code></td><td>1, только если оба бита 1</td><td><b>сбросить</b> биты маской с нулями: <code>and al,0Fh</code></td></tr>
  <tr><td><code>or</code></td><td>1, если хотя бы один 1</td><td><b>установить</b> биты: <code>or al,80h</code></td></tr>
  <tr><td><code>xor</code></td><td>1, если биты разные</td><td><b>инвертировать</b> биты; <code>xor ax,ax</code> — обнулить</td></tr>
  <tr><td><code>not</code></td><td>инвертирует все биты</td><td>обратный код</td></tr>
  <tr><td><code>test</code></td><td>and без записи результата</td><td>проверить бит: <code>test al,1 / jnz нечётное</code></td></tr></table></div>
  <p>Логические команды сбрасывают CF и OF в 0 и выставляют ZF, SF, PF по результату.</p>
  <h3>Сдвиги</h3>
  <div class="tbl"><table><tr><th>Команда</th><th>Как</th><th>Смысл</th></tr>
  <tr><td><code>shl / sal</code></td><td>влево, справа входит 0, старший бит → CF</td><td>умножение на 2ⁿ</td></tr>
  <tr><td><code>shr</code></td><td>вправо, слева входит 0, младший бит → CF</td><td>беззнаковое деление на 2ⁿ</td></tr>
  <tr><td><code>sar</code></td><td>вправо, слева повторяется знаковый бит</td><td>знаковое деление на 2ⁿ</td></tr>
  <tr><td><code>rol / ror</code></td><td>циклически: выпавший бит входит с другой стороны и копируется в CF</td><td>перестановка битов</td></tr>
  <tr><td><code>rcl / rcr</code></td><td>циклически через CF (9 бит по кругу)</td><td>сдвиг многобайтных чисел</td></tr></table></div>
  <p>У 8086 счётчик сдвига — 1 или регистр CL: <code>mov cl,3 / shl ax,cl</code>. Операции над отдельными битами (с 80386): <code>bt, bts, btr, btc</code>.</p>`,
  predict:{q:'AL = 81h. После <code>shl al,1</code> чему равны AL и CF?', opts:['AL = 02h, CF = 1','AL = 03h, CF = 0','AL = 40h, CF = 1'], a:0,
    why:'1000 0001 сдвигаем влево: старшая единица уходит в CF, справа входит 0 → 0000 0010 = 02h.'},
  flap:`<p><b>AL = B4h, and al,0Fh.</b> 1011 0100 AND 0000 1111 = 0000 0100 = <b>04h</b> — остаётся младшая тетрада.</p>
  <p><b>Знаковое деление:</b> AL = 96h (−106). <code>sar al,1</code>: 1001 0110 → 1100 1011 = CBh = −53. А <code>shr</code> дал бы 4Bh = 75 — неверно для отрицательного.</p>
  <p><b>Быстрое умножение на 10:</b> x·10 = x·8 + x·2 = (x shl 3) + (x shl 1).</p>`,
  figCap:'Регистр AL до и после операции. Выпавший бит уходит во флаг CF.',
  try:'Возьми AL = 96h и сравни SHR и SAR: только SAR честно делит отрицательное число.',
  ch:{q:'AL = B4h. Чему станет равен AL после <code>and al,0Fh</code>? (hex)', ph:'например 1Ah', check:hexEq(0x04), ans:'04h', hint:'Маска 0Fh оставляет только младшие 4 бита.'},
  fig(el){
    const OPS = ['AND','OR','XOR','NOT','TEST','SHL','SHR','SAR','ROL','ROR','RCL','RCR'];
    let op = 5, cin = 0;
    const ia = h('input',{class:'txt',id:'vms14-a',value:'81h',style:'width:6em','aria-label':'AL'}), im = h('input',{class:'txt',id:'vms14-m',value:'0Fh',style:'width:6em','aria-label':'маска'});
    const sn = U.slider('vms14-n','сдвиг на',1,7,1,1,null,()=>draw());
    const bc = U.btn('CF до = 0', ()=>{ cin ^= 1; draw(); });
    [ia,im].forEach(i=>i.addEventListener('input',()=>draw()));
    el.append(h('div',{class:'row'}, U.select('vms14-op', OPS, v=>{op=v; draw();}), h('label',{for:'vms14-a'},'AL ='), ia, h('label',{for:'vms14-m'},'маска ='), im, bc), h('div',{class:'ctls'}, sn));
    const cv = U.canvas(el, .34), out = h('div',{class:'readout'}); el.append(out);
    el.querySelector('#vms14-op').value = String(op);
    let lastR = 0, lastA = 0, lastCF = 0;
    function calc(){
      const a = parseVal(ia.value) & 255, m = parseVal(im.value) & 255, o = OPS[op], n = sn.get();
      let v = a, cf = cin;
      if (o==='AND'||o==='TEST'){ v = a & m; cf = 0; } else if (o==='OR'){ v = a | m; cf = 0; } else if (o==='XOR'){ v = a ^ m; cf = 0; } else if (o==='NOT'){ v = ~a & 255; }
      else for (let i=0;i<n;i++){
        if (o==='SHL'){ cf = v>>7; v = (v<<1)&255; } else if (o==='SHR'){ cf = v&1; v >>= 1; } else if (o==='SAR'){ cf = v&1; v = (v>>1)|(v&0x80); }
        else if (o==='ROL'){ cf = v>>7; v = ((v<<1)|cf)&255; } else if (o==='ROR'){ cf = v&1; v = (v>>1)|(cf<<7); }
        else if (o==='RCL'){ const nc = v>>7; v = ((v<<1)|cf)&255; cf = nc; } else if (o==='RCR'){ const nc = v&1; v = (v>>1)|(cf<<7); cf = nc; } }
      return {a, v, cf, o, m};
    }
    function draw(){
      bc.textContent = 'CF до = '+cin; bc.setAttribute('aria-pressed', !!cin);
      if (!isFinite(parseVal(ia.value))){ out.innerHTML = '<span class="bad">AL — число от 0 до 255 или hex (81h).</span>'; return; }
      const {a, v, cf, o, m} = calc(), {g,W,H} = cv.fit(), c = U.col(), cw = Math.min((W-80)/8, 34), x0 = (W-cw*8)/2 - 20;
      const row = (y, val, label, hot) => { U.text(g,label,x0-8,y+cw*.62,{size:12,align:'right',color:c.soft,kind:'mono'});
        for (let i=0;i<8;i++){ const b = (val>>(7-i))&1; g.fillStyle = b ? (hot?c.pen:c.ink) : c.paper; g.fillRect(x0+i*cw,y,cw-3,cw-3); g.strokeStyle=c.ink; g.lineWidth=1.2; g.strokeRect(x0+i*cw,y,cw-3,cw-3);
          U.text(g,b,x0+i*cw+cw/2-1.5,y+cw*.62,{size:14,align:'center',kind:'mono',w:600,color:b?c.paper:c.ink}); } };
      row(6, a, 'до'); row(H-cw-4, o==='TEST'?a:v, o==='TEST'?'AL не изменился':'после', true);
      const cfx = x0+8*cw+16, cfy = H/2-cw/2; g.save(); g.shadowColor=c.glow; g.shadowBlur = cf?12:0; g.fillStyle = cf?c.glow:c.paper; g.fillRect(cfx,cfy,cw,cw); g.restore(); g.strokeStyle=c.ink; g.strokeRect(cfx,cfy,cw,cw);
      U.text(g,cf,cfx+cw/2,cfy+cw*.66,{size:15,align:'center',kind:'mono',w:600}); U.text(g,'CF',cfx+cw/2,cfy-4,{size:11,align:'center',color:c.soft,kind:'mono'});
      const sg = x => x>127 ? x-256 : x, logic = ['AND','OR','XOR','TEST'].includes(o);
      out.innerHTML = `${o} ${logic?`AL, ${hx(m,2)}h`:o==='NOT'?'AL':`AL, ${sn.get()}`}: ${hx(a,2)}h → <b>${hx(o==='TEST'?a:v,2)}h</b>${o==='TEST'?` (результат ${hx(v,2)}h идёт только во флаги)`:''}<br>без знака ${a} → ${o==='TEST'?a:v} · со знаком ${sg(a)} → ${sg(o==='TEST'?a:v)} · CF = ${cf} · ZF = ${v?0:1}`;
    }
    draw();
    return draw;
  }
});

/* 15. Переходы, циклы, стек, процедуры */
add({
  id:'vms15', title:'Переходы, циклы, стек и процедуры', src:'Зубков, 2.1.3, 2.3.7, 5.1–5.2',
  theory:`<p><code>jmp метка</code> — безусловный переход: короткий (±127 байт), ближний (в пределах сегмента, меняет IP) и дальний (меняет CS и IP). Условные переходы смотрят на флаги, поэтому перед ними обычно стоит <code>cmp</code> или <code>test</code>.</p>
  <div class="tbl"><table><tr><th>Условие</th><th>Без знака</th><th>Со знаком</th><th>Флаги</th></tr>
  <tr><td>равно / не равно</td><td colspan="2"><code>je (jz)</code> / <code>jne (jnz)</code></td><td>ZF = 1 / ZF = 0</td></tr>
  <tr><td>больше</td><td><code>ja</code></td><td><code>jg</code></td><td>CF = 0 и ZF = 0 / ZF = 0 и SF = OF</td></tr>
  <tr><td>больше или равно</td><td><code>jae (jnc)</code></td><td><code>jge</code></td><td>CF = 0 / SF = OF</td></tr>
  <tr><td>меньше</td><td><code>jb (jc)</code></td><td><code>jl</code></td><td>CF = 1 / SF ≠ OF</td></tr>
  <tr><td>меньше или равно</td><td><code>jbe</code></td><td><code>jle</code></td><td>CF = 1 или ZF = 1 / ZF = 1 или SF ≠ OF</td></tr></table></div>
  <p>Запомни: <b>a</b>bove / <b>b</b>elow — для беззнаковых, <b>g</b>reater / <b>l</b>ess — для знаковых. Ещё: <code>js, jns, jo, jno, jp, jcxz</code>.</p>
  <h3>Циклы</h3>
  <p><code>loop метка</code>: CX = CX − 1, и если CX ≠ 0 — переход. Если перед циклом CX = 0, тело выполнится 65 536 раз! Защита — <code>jcxz</code> перед циклом. Варианты: <code>loope/loopz</code>, <code>loopne/loopnz</code> учитывают ещё и ZF.</p>
  <h3>Стек</h3>
  <p>Стек — область памяти SS:SP, растущая <b>вниз</b>. <code>push x</code>: SP = SP − 2, затем слово записывается по SS:SP. <code>pop x</code>: слово читается, затем SP = SP + 2. Принцип LIFO: последним положил — первым достал.</p>
  <h3>Процедуры</h3>
  <p><code>call proc</code> кладёт в стек адрес возврата (ближний — IP, дальний — CS и IP) и переходит; <code>ret</code> снимает его и возвращается. <code>ret n</code> дополнительно убирает n байт параметров. Параметры передают через регистры, через стек или глобальные переменные. Стандартный пролог:</p>
  <pre class="asm">proc1  proc near
       push bp
       mov  bp,sp          ; [bp+2] — адрес возврата
       mov  ax,[bp+4]      ; первый параметр (последний положенный)
       ...
       pop  bp
       ret  2              ; убрать один параметр-слово
proc1  endp</pre>
  <p>Локальные переменные выделяют, уменьшая SP: <code>sub sp,4</code>, и адресуют как [bp−2], [bp−4]. С 80186 есть <code>enter</code> и <code>leave</code>.</p>`,
  predict:{q:'AL = 0FFh, BL = 1, затем <code>cmp al,bl</code>. Какие переходы сработают?', opts:['JA и JG','JA, но не JG','JG, но не JA'], a:1,
    why:'Без знака FFh = 255 &gt; 1 — JA сработает. Со знаком FFh = −1 &lt; 1 — JG не сработает. Одни и те же биты, разный смысл.'},
  flap:`<p><b>SP = 0100h, затем push ax, push bx, call proc (ближний).</b> Каждое действие уменьшает SP на 2: 00FEh, 00FCh, 00FAh. Ответ: <b>00FAh</b>.</p>
  <p><b>Параметр перед call.</b> После <code>push bp / mov bp,sp</code>: [bp] — старый BP, [bp+2] — адрес возврата, [bp+4] — параметр.</p>
  <p><b>Ловушка с loop.</b> mov cx,0 / m: … / loop m — первым делом CX станет FFFFh, и цикл пройдёт 65 536 раз.</p>`,
  figCap:'Сверху — какие переходы сработают после CMP. Снизу — стек: кнопки кладут и снимают слова, SP двигается вниз.',
  try:'Сравни FFh и 01h: беззнаковые и знаковые переходы разойдутся.',
  ch:{q:'SP = 0100h. Выполнили <code>push ax</code>, <code>push bx</code>, затем ближний <code>call proc</code>. Чему равен SP внутри процедуры? (hex)', ph:'например 00F0h', check:hexEq(0xFA), ans:'00FAh', hint:'Каждое слово в стеке уменьшает SP на 2.'},
  fig(el){
    const ia = h('input',{class:'txt',id:'vms15-a',value:'0FFh',style:'width:6em','aria-label':'первый операнд'}), ib = h('input',{class:'txt',id:'vms15-b',value:'1',style:'width:6em','aria-label':'второй операнд'});
    [ia,ib].forEach(i=>i.addEventListener('input',()=>draw()));
    const jt = h('div',{class:'readout'});
    let stack = [], sp = 0x100, n = 0;
    const st = h('div',{class:'readout'});
    const push = (what, val) => { sp -= 2; stack.push([sp, what, val]); draw(); };
    const pop = what => { if (!stack.length){ st.dataset.err = 'Стек пуст — pop прочитал бы мусор.'; draw(); return; } stack.pop(); sp += 2; draw(); };
    el.append(h('div',{class:'row'}, h('span',{},'cmp'), ia, h('span',{},','), ib), jt,
      h('div',{class:'row'}, U.btn('push ax', ()=>push('ax', 0x1234)), U.btn('push bx', ()=>push('bx', 0xABCD)), U.btn('call proc', ()=>push('адрес возврата (IP)', 0x0110)), U.btn('pop / ret', pop), U.btn('Сброс', ()=>{ stack=[]; sp=0x100; delete st.dataset.err; draw(); })), st);
    function draw(){
      const a = parseVal(ia.value), b = parseVal(ib.value);
      if (!isFinite(a)||!isFinite(b)) jt.innerHTML = '<span class="bad">Операнды — байты (0…255, −128…127 или hex).</span>';
      else { const x = a&255, y = b&255, d = x-y, r = d&255, CF = d<0?1:0, ZF = r?0:1, SF = r>>7, OF = ((x^y)&(x^r)&0x80)?1:0, sg = v=>v>127?v-256:v;
        const J = [['JE / JZ',ZF],['JNE',!ZF],['JA',!CF&&!ZF],['JAE / JNC',!CF],['JB / JC',CF],['JBE',CF||ZF],['JG',!ZF&&SF===OF],['JGE',SF===OF],['JL',SF!==OF],['JLE',ZF||SF!==OF]];
        jt.innerHTML = `${hx(x,2)}h − ${hx(y,2)}h → CF=${CF} ZF=${ZF} SF=${SF} OF=${OF} · без знака ${x} vs ${y} · со знаком ${sg(x)} vs ${sg(y)}<br>` + J.map(([n,ok])=>`<span class="${ok?'good':'bad'}">${n} ${ok?'✓':'✗'}</span>`).join(' · '); }
      st.innerHTML = `SP = <b>${hx(sp,4)}h</b>${st.dataset.err?` · <span class="bad">${st.dataset.err}</span>`:''}<br>` + (stack.length ? stack.slice().reverse().map(([adr,w,v],i)=>`SS:${hx(adr,4)} │ ${hx(v,4)}h ← ${w}${i===0?' <span class="hot">← вершина (SP)</span>':''}`).join('<br>') : '<span style="color:var(--ink-soft)">стек пуст, вершина в SS:0100</span>');
      delete st.dataset.err;
    }
    draw();
    return null;
  }
});

/* 16. Прерывания */
const VEC = {0:'деление на 0 (исключение)',1:'пошаговый режим (TF = 1)',2:'NMI — немаскируемое',3:'точка останова (int 3, отладчик)',4:'переполнение (into)',5:'Print Screen',8:'таймер, IRQ 0 — 18,2 раза в секунду',9:'клавиатура, IRQ 1',0x0B:'COM2, IRQ 3',0x0C:'COM1, IRQ 4',0x0E:'дисковод, IRQ 6',0x0F:'LPT1, IRQ 7',0x10:'BIOS: видео',0x11:'BIOS: список оборудования',0x12:'BIOS: размер памяти',0x13:'BIOS: диски',0x14:'BIOS: последовательный порт',0x16:'BIOS: клавиатура',0x17:'BIOS: принтер',0x19:'перезагрузка',0x1A:'BIOS: часы и таймер',0x1C:'пользовательский таймер (вызывается из int 8)',0x20:'DOS: завершить программу (COM)',0x21:'DOS: все функции DOS',0x27:'DOS: остаться резидентной',0x29:'DOS: быстрый вывод символа',0x2F:'мультиплексное прерывание',0x33:'драйвер мыши',0x70:'часы реального времени, IRQ 8'};
add({
  id:'vms16', title:'Прерывания: таблица векторов, обработчики, резиденты', src:'Зубков, 4.7, 5.8–5.9',
  theory:`<p><b>Прерывание</b> — сигнал, по которому процессор приостанавливает текущую программу, выполняет <b>обработчик</b> и возвращается обратно. Виды:</p>
  <ul><li><b>аппаратные</b> — от устройств (таймер, клавиатура, диск) через линии IRQ и контроллер прерываний 8259; маскируемые флагом IF;</li>
  <li><b>программные</b> — команда <code>int n</code> (сервисы BIOS и DOS: int 10h, int 21h);</li>
  <li><b>исключения</b> — от самого процессора: int 0 — деление на ноль, int 1 — пошаговый режим, int 3 — точка останова, int 4 — переполнение (<code>into</code>).</li></ul>
  <h3>Таблица векторов</h3>
  <div class="f">адрес вектора n = 0000 : (n · 4)<small>в реальном режиме таблица занимает 0000:0000–0000:03FF — 256 векторов по 4 байта (сначала смещение, потом сегмент обработчика), всего 1024 байта</small></div>
  <h3>Что делает процессор по int n</h3>
  <ol><li>кладёт в стек регистр флагов;</li><li>сбрасывает IF и TF (новые маскируемые прерывания запрещены);</li><li>кладёт в стек CS и IP;</li><li>загружает CS:IP из вектора n·4.</li></ol>
  <p>Обработчик заканчивается <code>iret</code>: он снимает IP, CS и флаги. Аппаратный обработчик должен ещё сообщить контроллеру о конце обработки: <code>mov al,20h / out 20h,al</code> (EOI). <code>cli</code> / <code>sti</code> запрещают и разрешают маскируемые прерывания.</p>
  <h3>Перехват и резидентные программы</h3>
  <p>Перехват: прочитать старый вектор (int 21h, AH = 35h → ES:BX), записать свой (AH = 25h, DS:DX), в своём обработчике при необходимости вызвать старый. <b>Резидентная</b> (TSR) программа остаётся в памяти после завершения: int 21h, AH = 31h (DX — размер в параграфах) или int 27h. Так работали драйверы мыши, русификаторы, часы на экране.</p>`,
  predict:{q:'По какому адресу лежит вектор прерывания int 21h?', opts:['0000:0021','0000:0084','0021:0000'], a:1,
    why:'21h · 4 = 84h. Вектор — четыре байта: смещение обработчика по 0000:0084 и сегмент по 0000:0086.'},
  flap:`<p><b>int 9 (клавиатура):</b> 9·4 = 36 = 24h → 0000:0024.</p>
  <p><b>Порядок в стеке</b> после int: [SP] — IP, [SP+2] — CS, [SP+4] — флаги. Поэтому iret снимает их в обратном порядке.</p>
  <p><b>Таблица векторов</b>: 256·4 = 1024 байта = 400h, адреса 0000:0000–0000:03FF.</p>`,
  figCap:'Введи номер прерывания — увидишь адрес его вектора и назначение. Кнопка «Шаг» показывает, что процессор делает при int.',
  try:'Найди вектор int 8 (таймер) и пройди все шаги вызова.',
  ch:{q:'По какому смещению в сегменте 0000 лежит вектор прерывания int 9 (клавиатура)? (hex)', ph:'например 0040h', check:hexEq(0x24), ans:'0024h', hint:'Номер · 4.'},
  fig(el){
    const inp = h('input',{class:'txt',id:'vms16-n',value:'21h',style:'width:6em','aria-label':'Номер прерывания'});
    const info = h('div',{class:'readout'}); let k = 0;
    const stepsBox = h('div',{class:'readout'});
    inp.addEventListener('input',()=>{ k = 0; draw(); });
    el.append(h('div',{class:'row'}, h('label',{for:'vms16-n'},'int'), inp, U.btn('Шаг вызова ▶', ()=>{ k = Math.min(k+1, 6); draw(); }, 'pri'), U.btn('Сначала', ()=>{ k = 0; draw(); })), info, stepsBox);
    function draw(){
      const n = U.hex(inp.value);
      if (!isFinite(n) || n>255){ info.innerHTML = '<span class="bad">Номер — hex от 00 до FF (например 21h).</span>'; return; }
      info.innerHTML = `вектор int ${hx(n,2)}h: <b>0000:${hx(n*4,4)}</b> (смещение) и 0000:${hx(n*4+2,4)} (сегмент)<br>назначение: <span class="hot">${VEC[n]||'свободен или зарезервирован'}</span>`;
      const S = [['до вызова','SP = 0100, IF = 1, CS:IP = 1000:0050'],['push FLAGS','SS:00FE ← флаги'],['IF = 0, TF = 0','маскируемые прерывания запрещены'],['push CS','SS:00FC ← 1000'],['push IP','SS:00FA ← 0052 (адрес следующей команды)'],[`CS:IP ← [0000:${hx(n*4,4)}]`,'процессор прыгает в обработчик'],['iret в конце','снимает IP, CS, FLAGS → возврат в программу']];
      stepsBox.innerHTML = S.map(([a,b],i)=>`<span style="${i===k?'color:var(--glow);font-weight:600':i<k?'':'color:var(--ink-soft)'}">${i<k?'✓':i===k?'▶':'·'} ${a} — ${b}</span>`).join('<br>');
    }
    draw();
    return null;
  }
});

/* 17. Порты, устройства, файлы */
const NOTES = [['до',261.63],['до♯',277.18],['ре',293.66],['ре♯',311.13],['ми',329.63],['фа',349.23],['фа♯',369.99],['соль',392],['соль♯',415.3],['ля',440],['ля♯',466.16],['си',493.88],['до²',523.25]];
const SCAN = {Escape:0x01,Digit1:0x02,Digit2:0x03,Digit3:0x04,Digit4:0x05,Digit5:0x06,Digit6:0x07,Digit7:0x08,Digit8:0x09,Digit9:0x0A,Digit0:0x0B,Minus:0x0C,Equal:0x0D,Backspace:0x0E,Tab:0x0F,KeyQ:0x10,KeyW:0x11,KeyE:0x12,KeyR:0x13,KeyT:0x14,KeyY:0x15,KeyU:0x16,KeyI:0x17,KeyO:0x18,KeyP:0x19,BracketLeft:0x1A,BracketRight:0x1B,Enter:0x1C,ControlLeft:0x1D,KeyA:0x1E,KeyS:0x1F,KeyD:0x20,KeyF:0x21,KeyG:0x22,KeyH:0x23,KeyJ:0x24,KeyK:0x25,KeyL:0x26,Semicolon:0x27,Quote:0x28,Backquote:0x29,ShiftLeft:0x2A,Backslash:0x2B,KeyZ:0x2C,KeyX:0x2D,KeyC:0x2E,KeyV:0x2F,KeyB:0x30,KeyN:0x31,KeyM:0x32,Comma:0x33,Period:0x34,Slash:0x35,ShiftRight:0x36,AltLeft:0x38,Space:0x39,CapsLock:0x3A,F1:0x3B,F2:0x3C,F3:0x3D,F4:0x3E,F5:0x3F,F6:0x40,F7:0x41,F8:0x42,F9:0x43,F10:0x44,ArrowUp:0x48,ArrowLeft:0x4B,ArrowRight:0x4D,ArrowDown:0x50};
add({
  id:'vms17', title:'Порты ввода-вывода, таймер, клавиатура, файлы', src:'Зубков, 4.4, 4.7–4.8, 5.10',
  theory:`<p>Устройства подключены к процессору через <b>порты</b> — отдельное адресное пространство 0…FFFFh. <code>in al,порт</code> читает, <code>out порт,al</code> пишет; если номер порта больше 255, его кладут в DX: <code>mov dx,3F8h / in al,dx</code>.</p>
  <div class="tbl"><table><tr><th>Порты</th><th>Устройство</th></tr>
  <tr><td>20h–21h</td><td>контроллер прерываний 8259 (EOI: out 20h, 20h)</td></tr>
  <tr><td>40h–43h</td><td>таймер 8253/8254: каналы 0 (системные часы), 1, 2 (динамик), 43h — управление</td></tr>
  <tr><td>60h, 61h</td><td>данные клавиатуры (скан-коды) и управление динамиком</td></tr>
  <tr><td>70h–71h</td><td>CMOS и часы реального времени</td></tr>
  <tr><td>3F8h, 2F8h · 378h</td><td>COM1, COM2 · LPT1</td></tr>
  <tr><td>3C0h–3DFh</td><td>видеоадаптер VGA</td></tr></table></div>
  <h3>Таймер и звук</h3>
  <div class="f">делитель = ${fr('1 193 180','частота, Гц')}<small>на таймер подаётся 1 193 180 Гц; канал 0 с делителем 65 536 даёт 18,2 прерывания int 8 в секунду</small></div>
  <pre class="asm">mov al,0B6h      ; канал 2, режим 3 (меандр)
out 43h,al
mov ax,делитель
out 42h,al       ; младший байт
mov al,ah
out 42h,al       ; старший байт
in  al,61h
or  al,3         ; включить динамик (биты 0 и 1)
out 61h,al</pre>
  <h3>Клавиатура</h3>
  <p>При нажатии клавиатура посылает в порт 60h <b>скан-код нажатия</b>, при отпускании — <b>код отпускания</b> = скан-код + 80h, и вызывает int 9. BIOS переводит их в коды символов и кладёт в буфер. Чтение: int 16h, AH = 0 — ждать клавишу (AL — ASCII, AH — скан-код), AH = 1 — проверить буфер (ZF = 1, если пусто). DOS: int 21h, AH = 01h (с эхом), 07h/08h (без эха), 0Ah (строка). Мышь — int 33h (AX = 0 — инициализация, 1 — показать курсор, 3 — координаты и кнопки).</p>
  <h3>Файлы через DOS (int 21h)</h3>
  <div class="tbl"><table><tr><th>AH</th><th>Функция</th></tr>
  <tr><td>3Ch</td><td>создать файл (DS:DX — имя ASCIIZ, CX — атрибуты) → AX = дескриптор</td></tr>
  <tr><td>3Dh</td><td>открыть (AL: 0 — чтение, 1 — запись, 2 — оба)</td></tr>
  <tr><td>3Fh / 40h</td><td>чтение / запись: BX — дескриптор, CX — байт, DS:DX — буфер</td></tr>
  <tr><td>3Eh</td><td>закрыть</td></tr>
  <tr><td>41h · 42h</td><td>удалить · переместить указатель (lseek)</td></tr></table></div>
  <p>Ошибка — CF = 1, в AX код ошибки. Стандартные дескрипторы: 0 — клавиатура, 1 — экран, 2 — ошибки.</p>`,
  predict:{q:'Сколько раз в секунду вызывается прерывание таймера int 8?', opts:['≈ 1000','≈ 18,2','ровно 60'], a:1,
    why:'1 193 180 / 65 536 ≈ 18,2 Гц. Поэтому в DOS время измерялось «тиками» по 55 мс.'},
  flap:`<p><b>Нота ля, 440 Гц:</b> 1 193 180 / 440 ≈ 2711,8 → делитель <b>2712</b> (A98h).</p>
  <p><b>Скан-коды:</b> клавиша A — 1Eh, её отпускание — 1Eh + 80h = <b>9Eh</b>.</p>
  <p><b>Открыть файл для чтения:</b> mov ah,3Dh / mov al,0 / lea dx,fname / int 21h / jc ошибка / mov handle,ax.</p>`,
  figCap:'Клавиатура пианино: каждая клавиша показывает делитель таймера и звучит через динамик компьютера. Ниже — нажми любую клавишу и увидишь её скан-коды.',
  try:'Сыграй «ля» и сравни делитель с расчётом. Потом нажми клавишу A в поле ниже.',
  ch:{q:'Какой делитель нужно загрузить в канал 2 таймера, чтобы динамик зазвучал нотой ля (440 Гц)? (десятичное, округлите)', check:s=>U.near(s,2712,1), ans:'2712 (1 193 180 / 440 ≈ 2711,8)', hint:'Делитель = 1 193 180 / частота.'},
  fig(el){
    let ctx = null;
    const out = h('div',{class:'readout'}), keys = h('div',{class:'row',style:'gap:3px'});
    NOTES.forEach(([n,f])=>{ const black = n.includes('♯');
      const b = h('button',{type:'button','aria-label':'нота '+n,style:`width:${black?30:40}px;height:${black?70:96}px;border:1.5px solid var(--ink);border-radius:0 0 5px 5px;cursor:pointer;background:${black?'var(--ink)':'var(--paper)'};color:${black?'var(--paper)':'var(--ink)'};font:600 11px var(--f-mono);display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px`},n);
      b.onclick = () => { const d = Math.round(1193180/f), real = 1193180/d;
        try { ctx = ctx || new (window.AudioContext||window.webkitAudioContext)(); const o = ctx.createOscillator(), gn = ctx.createGain(); o.type='square'; o.frequency.value = real; gn.gain.value = .06; o.connect(gn).connect(ctx.destination); o.start(); gn.gain.setTargetAtTime(0, ctx.currentTime+.25, .05); o.stop(ctx.currentTime+.45); } catch(e){}
        out.innerHTML = `нота ${n}: ${f} Гц → делитель 1 193 180 / ${f} = <b>${d}</b> = ${hx(d,4)}h · реальная частота ${real.toFixed(2)} Гц<br><code>mov ax,${d} / out 42h,al / mov al,ah / out 42h,al</code>`; };
      keys.append(b); });
    const kin = h('input',{class:'txt',id:'vms17-k',placeholder:'нажми здесь любую клавишу','aria-label':'Поле для проверки скан-кода',style:'width:100%',readonly:true});
    const kout = h('div',{class:'readout'},'Скан-код появится здесь.');
    kin.addEventListener('keydown', e => { const sc = SCAN[e.code]; if (e.code!=='Tab') e.preventDefault();
      kout.innerHTML = sc!=null ? `клавиша <b>${esc(e.key===' '?'Space':e.key)}</b>: нажатие <b>${hx(sc,2)}h</b>, отпускание <span class="hot">${hx(sc|0x80,2)}h</span>` : `для клавиши ${esc(e.code)} скан-кода нет в учебной таблице`; });
    el.append(keys, out, kin, kout);
    out.innerHTML = 'Нажми клавишу пианино (звук включится после щелчка).';
    return null;
  }
});

/* 18. Защищённый режим */
add({
  id:'vms18', title:'Защищённый режим: селекторы, дескрипторы, страницы', src:'Зубков, гл. 6, 10',
  theory:`<p>Начиная с 80286, у процессоров Intel есть <b>защищённый режим</b>: память больше 1 МБ (у 80386 — 4 ГБ), защита программ друг от друга, многозадачность, виртуальная память. В реальном режиме процессор оказывается после включения, как 8086.</p>
  <h3>Селектор и дескриптор</h3>
  <p>Сегментный регистр хранит не адрес, а <b>селектор</b> — номер записи в таблице дескрипторов:</p>
  <div class="f">селектор = индекс (13 бит) | TI (1 бит) | RPL (2 бита)<small>TI = 0 — глобальная таблица GDT, 1 — локальная LDT; RPL — запрашиваемый уровень привилегий; адрес дескриптора = база таблицы + индекс · 8</small></div>
  <p><b>Дескриптор</b> (8 байт) описывает сегмент: 32-битная <b>база</b>, 20-битный <b>предел</b> (размер; с битом G = 1 — в страницах по 4 КБ, до 4 ГБ), тип (код, данные, системный), права (чтение, запись), <b>DPL</b> — уровень привилегий, бит присутствия P. Линейный адрес = база сегмента + смещение.</p>
  <h3>Уровни привилегий</h3>
  <p>Четыре кольца: 0 — ядро ОС, 3 — пользовательские программы (1 и 2 почти не используются). Код с меньшими правами не может обратиться к данным и коду с большими: процессор генерирует исключение общей защиты (#GP, 13).</p>
  <h3>Страничная адресация (80386+)</h3>
  <div class="f">линейный адрес = каталог (10 бит) | таблица (10 бит) | смещение (12 бит)<small>CR3 указывает на каталог страниц; каждая таблица описывает 1024 страницы по 4 КБ. Отсутствующая страница вызывает исключение #PF — так работает подкачка с диска</small></div>
  <h3>Вход и прерывания</h3>
  <p>Перейти в защищённый режим: подготовить GDT, загрузить <code>lgdt</code>, запретить прерывания, установить бит <b>PE</b> в регистре CR0, сделать дальний переход, чтобы загрузить селектор кода. Вместо таблицы векторов работает <b>IDT</b> — таблица дескрипторов прерываний (8 байт на шлюз), её загружает <code>lidt</code>.</p>
  <p>Ещё режимы: <b>V86</b> — задача реального режима внутри защищённого (окно DOS в Windows 9x), <b>нереальный</b> — реальный режим с 4-гигабайтными пределами сегментов. В DOS 32-битные программы работали через <b>DOS-расширители</b> по интерфейсам VCPI и DPMI.</p>`,
  predict:{q:'Сколько уровней привилегий в защищённом режиме x86?', opts:['2','4','8'], a:1,
    why:'Кольца 0–3: 0 — самый привилегированный (ядро), 3 — пользовательский. Windows и Linux используют в основном 0 и 3.'},
  flap:`<p><b>Селектор 001Bh</b> = 0000 0000 0001 1011: RPL = 11 = 3, TI = 0 (GDT), индекс = 0000000000011 = <b>3</b>. Дескриптор лежит по адресу база GDT + 3·8 = база + 18h.</p>
  <p><b>Линейный адрес 00403004h</b> = 0000 0000 01 | 00 0000 0011 | 0000 0000 0100: каталог 1, таблица 3, смещение 4.</p>`,
  figCap:'Слева — разбор селектора на поля. Справа — разбор линейного адреса на каталог, таблицу и смещение.',
  try:'Введи селектор 0010h (обычный код ядра) и 0023h (данные пользователя).',
  ch:{q:'Селектор равен 001Bh. Найдите индекс дескриптора в таблице.', check:dec(3), ans:'3 (RPL = 3, TI = 0 — GDT)', hint:'Отбрось младшие 3 бита: индекс = селектор >> 3.'},
  fig(el){
    const is = h('input',{class:'txt',id:'vms18-s',value:'001Bh',style:'width:7em','aria-label':'селектор'}), ig = h('input',{class:'txt',id:'vms18-g',value:'00010000h',style:'width:9em','aria-label':'база GDT'});
    const il = h('input',{class:'txt',id:'vms18-l',value:'00403004h',style:'width:9em','aria-label':'линейный адрес'});
    const o1 = h('div',{class:'readout'}), o2 = h('div',{class:'readout'});
    [is,ig,il].forEach(i=>i.addEventListener('input',()=>draw()));
    el.append(h('div',{class:'row'}, h('label',{for:'vms18-s'},'селектор'), is, h('label',{for:'vms18-g'},'база GDT'), ig), o1, h('div',{class:'row'}, h('label',{for:'vms18-l'},'линейный адрес'), il), o2);
    function draw(){
      const s = U.hex(is.value), gb = U.hex(ig.value), la = U.hex(il.value);
      if (!isFinite(s)||s>0xFFFF) o1.innerHTML = '<span class="bad">Селектор — 16 бит в hex.</span>';
      else { const b = bin(s,16); o1.innerHTML = `<span style="color:var(--pen)">${b.slice(0,13)}</span> <span style="color:var(--glow)">${b[13]}</span> <span style="color:var(--stamp)">${b.slice(14)}</span><br>индекс = <b>${s>>3}</b> · TI = ${(s>>2)&1} (${(s>>2)&1?'LDT':'GDT'}) · RPL = ${s&3} (кольцо ${s&3})${isFinite(gb)?`<br>дескриптор: ${hx(gb,8)}h + ${s>>3}·8 = <span class="hot">${hx(gb+(s>>3)*8,8)}h</span>`:''}`; }
      if (!isFinite(la)||la>0xFFFFFFFF) o2.innerHTML = '<span class="bad">Линейный адрес — 32 бита в hex.</span>';
      else { const b = bin(la,32); o2.innerHTML = `<span style="color:var(--pen)">${b.slice(0,10)}</span> <span style="color:var(--stamp)">${b.slice(10,20)}</span> <span>${b.slice(20)}</span><br>каталог = <b>${la>>>22}</b> · таблица = <b>${(la>>>12)&0x3FF}</b> · смещение в странице = <b>${hx(la&0xFFF,3)}h</b>`; }
    }
    draw();
    return null;
  }
});

/* 19. Защита лабораторных 1–4 */
const LABQ = [
  [1,'Чем файл отличается от каталога?','Файл — именованная область данных на диске. Каталог — особый файл со списком имён файлов и подкаталогов и сведениями о них.'],
  [1,'Каков формат имени файла в DOS?','8.3: до 8 символов имени и до 3 символов расширения через точку; без пробелов и символов * ? / \\ : < > |.'],
  [1,'Что означают символы * и ? в масках?','* — любое число любых символов, ? — ровно один символ (в конце имени — один или ни одного).'],
  [1,'Как удалить каталог, в котором есть файлы?','Сначала удалить файлы (DEL KAT\\*.*), затем RD KAT — RD удаляет только пустой каталог.'],
  [1,'Как в DOSBox подключить папку и перейти на диск?','mount c C:\\TASM, затем C:.'],
  [1,'Какие функциональные клавиши NC вы использовали?','F3 — просмотр, F4 — редактирование, F5 — копирование, F6 — перенос/переименование, F7 — создать каталог, F8 — удалить; Ctrl+F3…F6 — сортировка по имени, расширению, времени, размеру.'],
  [1,'Как работает CHOICE и чему равен ERRORLEVEL?','CHOICE /C:символы ждёт нажатия одной из клавиш списка; ERRORLEVEL = порядковый номер клавиши в списке.'],
  [1,'Почему проверки IF ERRORLEVEL ставят по убыванию?','IF ERRORLEVEL n истинно при коде ≥ n, поэтому проверка на 1 перехватила бы все варианты.'],
  [1,'Чем CALL отличается от простого запуска BAT-файла?','После CALL выполнение возвращается в вызвавший пакетный файл, а без CALL управление не возвращается.'],
  [2,'Из каких сегментов состоит программа на ассемблере?','Сегмент кода, данных и стека (в EXE — отдельные; в COM всё в одном сегменте).'],
  [2,'Что делает директива ASSUME?','Сообщает ассемблеру, какой сегментный регистр с каким сегментом связан; сами регистры она не загружает.'],
  [2,'Зачем в начале EXE-программы mov ax,DSEG / mov ds,ax?','DOS при запуске записывает в DS адрес PSP, а не сегмента данных; константу нельзя записать в DS напрямую — только через регистр общего назначения.'],
  [2,'Что такое PSP и какого он размера?','Префикс программного сегмента — 256 байт (100h), создаётся DOS перед программой: командная строка, адрес возврата, служебные поля.'],
  [2,'Чем COM-программа отличается от EXE?','COM — один сегмент до 64 КБ, без заголовка, начинается с ORG 100h, CS = DS = SS = ES; EXE — несколько сегментов, есть заголовок с таблицей настроек.'],
  [2,'Какие этапы проходит программа от исходного текста до запуска?','tasm (ассемблирование: .asm → .obj), tlink (компоновка: .obj → .exe, с /t → .com), запуск; отладка в TD (F7 — шаг).'],
  [2,'Что делают функции 09h, 01h и 4Ch прерывания 21h?','09h — вывод строки DS:DX до символа $; 01h — ввод символа с эхом в AL; 4Ch — завершение программы с кодом AL.'],
  [2,'Как найти физический адрес сегмента?','Сегментный адрес · 16 (сдвиг на одну hex-цифру влево) + смещение.'],
  [3,'Как преобразовать введённую цифру из ASCII в число?','Вычесть код символа «0» (30h): sub al,\'0\'.'],
  [3,'Как из цифр собирается многозначное число?','число = число·10 + очередная цифра, до нажатия Enter (код 13).'],
  [3,'Зачем при выводе числа используется стек?','Деление на 10 даёт цифры с конца; PUSH/POP (LIFO) выводят их в правильном порядке.'],
  [3,'Почему перед div si обнуляют DX?','div si делит 32-битное DX:AX; мусор в DX исказит результат или вызовет переполнение деления.'],
  [3,'Как очистить экран и поставить курсор?','int 10h: AX = 0600h, BH — атрибут, CX = 0000h, DX = 184Fh — очистка; AH = 02h, BH = 0, DH — строка, DL — столбец — курсор.'],
  [3,'Где находится переменная num?','Она первая в сегменте данных, поэтому её адрес DS:0000.'],
  [3,'Какое наибольшее число вводится в 16-битный регистр?','65535; больше — «заворачивается» по модулю 65536 без сообщения.'],
  [4,'Как установить видеорежим VGA и SVGA?','VGA: AH = 00h, AL = номер, int 10h (13h — 320×200×256). SVGA (VESA): AX = 4F02h, BX = номер режима, int 10h; успех — AX = 004Fh.'],
  [4,'Почему некоторые режимы не устанавливаются?','Не хватает видеопамяти (кадр = ширина·высота·байт на точку) или видеокарта/эмулятор не поддерживает режим; 4F02h возвращает AX ≠ 004Fh.'],
  [4,'Как вывести цветной текст в графическом режиме?','int 10h, AH = 09h: AL — символ, BL — цвет, CX = 1; курсор двигать функцией 02h.'],
  [4,'Чем атрибут текстового режима отличается от цвета в графическом?','В тексте байт атрибута: мигание, фон, яркость, цвет символа. В графике BL — номер цвета точек символа (бит 7 — XOR).'],
  [4,'Сколько памяти нужно для кадра 640×480 при 256 цветах?','640·480·1 = 307 200 байт ≈ 300 КБ — 5 окон по 64 КБ.']
];
add({
  id:'vms19', title:'Защита лабораторных 1–4: вопросы и ответы', src:'Лабораторные работы 1–4',
  theory:`<p>На экзамене по ВМиС часто спрашивают по лабораторным: что делает каждая команда, почему программа написана именно так, что было бы, если… Эта глава собирает всё, что нужно для защиты, в одном месте.</p>
  <h3>Лаба 1. DOS, файлы, пакетные файлы</h3>
  <p>Имена 8.3, дерево каталогов, команды DIR, CD, MD, RD, COPY, MOVE, DEL, REN, TYPE; маски * и ?; Norton Commander и его клавиши; пакетный файл с CHOICE, IF ERRORLEVEL, IF EXIST, CALL. Подробно — главы 5 и 6.</p>
  <h3>Лаба 2. Структура программы</h3>
  <p>Сегменты, ASSUME, загрузка DS, вывод строки int 21h/09h, COM и EXE, PSP, tasm → tlink → td, адреса и размеры сегментов. Подробно — глава 12.</p>
  <h3>Лаба 3. Ввод и вывод чисел</h3>
  <p>ASCII-коды цифр, число = число·10 + цифра, MUL и DIV, стек для вывода, int 10h для очистки экрана и курсора, рамка из псевдографики. Подробно — главы 13 и 16.</p>
  <h3>Лаба 4. Видеорежимы</h3>
  <p>int 10h, AH = 00h для VGA и AX = 4F02h для VESA, проверка AX = 004Fh, объём кадра и видеопамять, вывод цветного текста в графике, перебор режимов массивом и процедурой. Подробно — главы 16 и 17.</p>
  <div class="f">mess db 'Privet',0Dh,0Ah,'$' &nbsp;→&nbsp; 6 + 3 = 9 байт<small>0Dh — возврат каретки, 0Ah — перевод строки, '$' — конец строки для функции 09h</small></div>`,
  predict:{q:'Какой командой из файла privet.asm получают объектный файл?', opts:['tlink privet','tasm privet','td privet'], a:1,
    why:'tasm ассемблирует .asm → .obj; tlink компонует .obj → .exe (или .com с ключом /t); td — отладчик.'},
  flap:`<p>Работай с карточками справа: отвечай вслух, потом открывай ответ. «Знаю» убирает карточку из колоды, «Повторить» отправляет её в конец. Фильтр по номеру лабы помогает готовиться к конкретной защите.</p>
  <p>Перед экзаменом пройди колоду целиком дважды: в первый раз отмечай честно, во второй — только то, что осталось.</p>`,
  figCap:`Колода из ${LABQ.length} карточек по лабораторным 1–4. Прогресс сохраняется в браузере.`,
  try:'Выбери лабу, отвечай вслух и только потом открывай ответ.',
  ch:{q:'Сколько байт занимает строка <code>mess db \'Privet\',0Dh,0Ah,\'$\'</code>?', check:dec(9), ans:'9', hint:'6 букв + 0Dh + 0Ah + $.'},
  fig(el){
    const KEYK = 'bit-labcards-v1'; let known = {};
    try { known = JSON.parse(localStorage.getItem(KEYK)||'{}'); } catch(e){}
    const save = () => { try { localStorage.setItem(KEYK, JSON.stringify(known)); } catch(e){} };
    let lab = 0, deck = [], open = false;
    const build = () => { deck = LABQ.map((q,i)=>({q,i})).filter(x=>(!lab||x.q[0]===lab) && !known[x.i]); open = false; draw(); };
    const card = h('div',{style:'min-height:170px;padding:18px;border:1.5px solid var(--ink);border-radius:6px;background:var(--paper-2);box-shadow:4px 4px 0 var(--stamp-wash);display:grid;gap:10px;align-content:start'});
    const stat = h('div',{class:'readout'});
    el.append(h('div',{class:'row'}, U.select('vms19-lab',['все лабы','лаба 1','лаба 2','лаба 3','лаба 4'], v=>{lab=v; build();}),
      U.btn('Начать заново', ()=>{ for (const x of LABQ.map((q,i)=>({q,i}))) if (!lab||x.q[0]===lab) delete known[x.i]; save(); build(); })), card, stat);
    function draw(){
      const total = LABQ.filter(q=>!lab||q[0]===lab).length, done = total - deck.length;
      stat.innerHTML = `знаю: <b>${done}</b> из ${total}${deck.length?` · осталось ${deck.length}`:''}`;
      if (!deck.length){ card.replaceChildren(h('div',{class:'lbl'},'Колода пройдена!'), h('p',{style:'margin:0'},'Все карточки этой лабы отмечены как известные. «Начать заново» вернёт их.')); return; }
      const {q} = deck[0];
      const ans = h('p',{style:'margin:0;font-size:15px',hidden:!open}, q[2]);
      card.replaceChildren(h('div',{class:'part-lbl'},'Лаба '+q[0]), h('div',{style:'font:700 19px/1.3 var(--f-display)'}, q[1]), ans,
        open ? h('div',{class:'row'}, U.btn('Знаю ✓', ()=>{ known[deck[0].i] = 1; save(); deck.shift(); open = false; draw(); },'pri'), U.btn('Повторить', ()=>{ deck.push(deck.shift()); open = false; draw(); }))
             : U.btn('Показать ответ', ()=>{ open = true; draw(); }));
    }
    build();
    return null;
  }
});

/* Дополнительные задачи */
const MORE = {
  vms11:[P('Зубков, 2.4','Какое число записано в формате single как 41200000h?',dec(10),'10','Порядок 130 − 127 = 3, мантисса 1,01₂.'),P('Зубков, 2.4','Запишите 0,75 в формате single (hex).',hexEq(0x3F400000),'3F400000h','0,75 = 1,1₂·2⁻¹; порядок 126.','8 hex-цифр'),P('Зубков, 2.4','Сколько байт занимает число расширенной точности FPU (dt)?',dec(10),'10 (80 бит)','80 бит / 8.')],
  vms12:[P('курс ВМиС','Сколько гигабайт адресует 32-разрядная шина адреса?',dec(4),'4 ГБ','2³² = 4·2³⁰.'),P('курс ВМиС','Какой разрядности шина данных у 8086?',dec(16),'16 бит','Сколько бит процессор передаёт за одно обращение к памяти?'),P('курс ВМиС','Сколько байт в очереди команд 8086?',dec(6),'6 байт','Её заполняет блок BIU.')],
  vms13:[P('Зубков, 2.3.2','AX = 1000, BL = 10, выполнили <code>div bl</code>. Чему равен AL?',dec(100),'100 (AH = 0)','div bl: AL = AX / BL.'),P('Зубков, 2.3.2','AL = 200, BL = 2, выполнили <code>mul bl</code>. Чему равен AX?',dec(400),'400 (190h), CF = OF = 1','Произведение байтов — слово в AX.'),P('Зубков, 2.3.2','AL = F0h. Что окажется в AX после <code>cbw</code>? (hex)',hexEq(0xFFF0),'FFF0h — знак расширен','Старший бит AL = 1 → AH = FFh.')],
  vms14:[P('Зубков, 2.3.5','AL = 96h. Чему равен AL после <code>sar al,1</code>? (hex)',hexEq(0xCB),'CBh (−106 / 2 = −53)','SAR повторяет знаковый бит.'),P('Зубков, 2.3.5','AL = 85h. Чему равен AL после <code>rol al,1</code>? (hex)',hexEq(0x0B),'0Bh, CF = 1','Старший бит переходит в младший.'),P('Зубков, 2.3.4','Какой маской через <code>or</code> установить в AL биты 0 и 7? (hex)',hexEq(0x81),'81h','1000 0001.')],
  vms15:[P('Зубков, 2.3.7','AX = 5, BX = −3 (FFFDh), <code>cmp ax,bx</code>. Сработает ли <code>jl</code>? (да/нет)',s=>/^\s*нет([\s,.!]|$)/i.test(s),'нет: со знаком 5 &gt; −3','JL — знаковое «меньше».','да или нет'),P('Зубков, 2.3.7','<code>mov cx,0</code>, затем цикл с <code>loop</code>. Сколько раз выполнится тело?',dec(65536),'65 536','loop сначала уменьшает CX: 0 − 1 = FFFFh.'),P('Зубков, 5.2','Параметр положили в стек перед ближним call. После <code>push bp / mov bp,sp</code> он лежит по адресу [bp + ?]',dec(4),'[bp+4]','[bp] — старый BP, [bp+2] — адрес возврата.')],
  vms16:[P('Зубков, 5.8','Сколько байт занимает таблица векторов прерываний реального режима?',dec(1024),'1024 (256 · 4)','256 векторов по 4 байта.'),P('Зубков, 5.8','Какое прерывание вызывает деление на ноль? (номер)',dec(0),'0 (int 0)','Это исключение процессора.'),P('Зубков, 5.8','Какая функция int 21h (AH = ?) устанавливает вектор прерывания? (hex)',hexEq(0x25),'25h (а 35h — читает)','DS:DX — новый обработчик, AL — номер.')],
  vms17:[P('Зубков, 4.4','Скан-код клавиши A — 1Eh. Какой код придёт в порт 60h при её отпускании? (hex)',hexEq(0x9E),'9Eh','Код отпускания = код нажатия + 80h.'),P('Зубков, 4.8','Какая функция int 21h открывает существующий файл? (AH, hex)',hexEq(0x3D),'3Dh','3Ch создаёт, 3Dh открывает.'),P('Зубков, 5.10','Какой порт читают, чтобы получить скан-код клавиатуры? (hex)',hexEq(0x60),'60h','Порт данных клавиатуры.')],
  vms18:[P('Зубков, гл. 10','Сколько байт занимает дескриптор сегмента?',dec(8),'8','Индекс умножают на это число.'),P('Зубков, гл. 10','Сколько байт в странице при страничной адресации 80386?',dec(4096),'4096 (4 КБ)','Смещение в странице — 12 бит.'),P('Зубков, гл. 10','Линейный адрес 00403004h. Какой индекс в таблице страниц (средние 10 бит)?',dec(3),'3 (каталог 1, смещение 4)','(адрес >> 12) & 3FFh.')],
  vms19:[P('Лаба 2','Какую функцию int 21h (AH, hex) вызывают для вывода строки до символа $?',hexEq(0x09),'09h','DS:DX — адрес строки.'),P('Лаба 3','Какой ASCII-код (десятичный) у клавиши Enter?',dec(13),'13 (0Dh)','Его и сравнивают в цикле ввода.'),P('Лаба 4','Номер VGA-режима 320×200, 256 цветов (hex)?',hexEq(0x13),'13h','Самый популярный игровой режим.')]
};
for (const L of BOOKS.vms.lessons) if (MORE[L.id]) L.more = MORE[L.id];

/* Истории для новых глав */
const HOOK = {
  vms11:{eye:'Ариан-5, 4 июня 1996 года', title:'Ракета, которую погубило преобразование числа', html:`<p>Через 37 секунд после старта европейская ракета Ариан-5 сошла с курса и самоуничтожилась. Причина — одна строка кода: 64-битное число с плавающей запятой (горизонтальная скорость) преобразовали в 16-битное целое со знаком. Число оказалось больше 32 767.</p><p class="big">Переполнение → отказ навигации</p><p>Код перенесли с Ариан-4, где скорость была меньше. Форматы чисел — не скучная теория, а вопрос, долетит ли ракета.</p>`},
  vms12:{eye:'Джон фон Нейман, 1945', title:'Программа, которая лежит в памяти', html:`<p>Первый электронный компьютер ENIAC перепрограммировали, перетыкая кабели и щёлкая переключателями, — это занимало дни. В «Первом проекте отчёта об EDVAC» фон Нейман описал другую идею: хранить программу в той же памяти, что и данные.</p><p class="big">Команды = числа в памяти</p><p>Так устроены почти все компьютеры с тех пор, включая твой ноутбук и телефон.</p>`},
  vms13:{eye:'Intel Pentium, 1994', title:'Ошибка деления за 475 миллионов долларов', html:`<p>Профессор Томас Найсли заметил, что новый Pentium иногда неверно делит числа с плавающей запятой: в таблице, по которой процессор подбирал цифры частного, не хватало пяти значений.</p><p class="big">4195835 / 3145727 ≈ 1,33373…, а не 1,33382…</p><p>Intel пришлось бесплатно заменять процессоры: убыток составил 475 миллионов долларов. С тех пор арифметику процессоров проверяют формальными методами.</p>`},
  vms14:{eye:'Трюк программистов', title:'Обмен без третьей переменной', html:`<p>Как поменять местами AX и BX без временного регистра? Тремя XOR:</p><p class="big">xor ax,bx · xor bx,ax · xor ax,bx</p><p>А <code>xor ax,ax</code> обнуляет регистр короче, чем <code>mov ax,0</code>: 2 байта против 3. Поэтому компиляторы до сих пор так пишут. Логические команды — это маленькие фокусы над битами.</p>`},
  vms15:{eye:'Эдсгер Дейкстра, 1968', title:'«Оператор goto считается вредным»', html:`<p>Дейкстра призвал отказаться от goto в языках высокого уровня в пользу if, while и процедур. Но процессор устроен иначе: у него есть только переходы.</p><p class="big">if, for, while → cmp + jcc</p><p>Любой цикл и любое ветвление, которые ты пишешь на Си или Паскале, компилятор превращает в сравнения и условные переходы из этой главы.</p>`},
  vms16:{eye:'Turbo Pascal, конец 1990-х', title:'Runtime error 200 на быстрых процессорах', html:`<p>Старые программы на Turbo Pascal стали падать с ошибкой «Runtime error 200» на процессорах быстрее примерно 200 МГц. Модуль CRT при запуске измерял скорость компьютера для процедуры Delay, и счётчик оказывался слишком большим — частное деления не помещалось в регистр.</p><p class="big">int 0 — «деление на ноль»</p><p>Процессор вызывал исключение 0, хотя на ноль никто не делил. Прерывания — это не только клавиатура и таймер, но и аварии.</p>`},
  vms17:{eye:'IBM PC, 1981', title:'Откуда взялась частота 1 193 180 Гц', html:`<p>Странное число не случайно. Кварц на плате IBM PC работал на 14,31818 МГц — это в 4 раза больше частоты цветовой поднесущей телевизора NTSC, такие кварцы были дешёвыми.</p><p class="big">14 318 180 / 12 = 1 193 180 Гц</p><p>Таймер получил частоту кварца, делённую на 12. На этом таймере держались системные часы, музыка из динамика и даже задержки в играх.</p>`},
  vms18:{eye:'DOOM, 1993', title:'Как DOS-игра получила 4 ГБ памяти', html:`<p>DOS работала в реальном режиме с её 640 КБ. Но DOOM требовал больше. Он запускался через DOS-расширитель DOS/4GW, который переводил процессор в защищённый режим и давал игре плоскую 32-битную память.</p><p class="big">селекторы вместо сегментов</p><p>Защищённый режим — то, на чём работают все современные ОС: Windows, Linux, macOS.</p>`},
  vms19:{eye:'Совет к экзамену', title:'Лабы — твоя самая сильная сторона', html:`<p>Ты сам набирал эти программы, сам ловил ошибки в TD и сам смотрел, как DOSBox ругается на неподдерживаемые режимы. На экзамене это превращается в уверенные ответы: «я делал, и вот почему так».</p><p class="big">${LABQ.length} вопросов — по ним спросят</p><p>Пройди колоду карточек справа, а за подробностями возвращайся в главы про DOS, структуру программы, ввод-вывод и видеорежимы.</p>`}
};
for (const L of BOOKS.vms.lessons) if (HOOK[L.id]) L.hook = HOOK[L.id];

/* Итоги и вопросы к экзамену для всех глав «Бита» (с вопросами по лабораторным) */
const SUM = {
  vms1:['Позиционная система: вес цифры = основание в степени номера разряда.','В десятичную — по развёрнутой форме Σaᵢqⁱ.','Из десятичной: целую часть делить на q (остатки снизу вверх), дробную умножать на q (целые части сверху вниз).','Конечная десятичная дробь может стать бесконечной двоичной (0,1).'],
  vms2:['2 ↔ 8 — триадами, 2 ↔ 16 — тетрадами, от запятой в обе стороны.','Нули дописывают слева от целой части и справа от дробной.','BCD: каждая десятичная цифра — тетрада 0000…1001; байт хранит 0…99.','Двоичное сложение: 1 + 1 = 10 (пишем 0, переносим 1).'],
  vms3:['Положительные числа во всех кодах одинаковы.','Обратный код: инверсия модуля; дополнительный: обратный + 1.','Байт в доп. коде: −128…127; −1 = FFh.','Из доп. кода: вычесть 1, инвертировать, поставить минус.','CF — перенос (беззнаковые), OF — переполнение (знаковые).'],
  vms4:['Имя 8.3; полное имя — путь от корня.','RD удаляет только пустой каталог.','* — любые символы, ? — один символ.','DOSBox: mount c C:\\TASM, затем C:.','NC: F5 копия, F6 перенос, F7 каталог, F8 удаление; Ctrl+F3…F6 — сортировка.'],
  vms5:['ERRORLEVEL после CHOICE — номер клавиши в списке /C.','IF ERRORLEVEL n — это «≥ n», проверки по убыванию.','CALL — вызов с возвратом; GOTO — переход к :метке.','@ECHO OFF скрывает вывод команд.'],
  vms6:['Сегменты кода, данных, стека; ASSUME связывает их с регистрами.','DS загружают через регистр: mov ax,dseg / mov ds,ax.','PSP — 256 байт; COM начинается с ORG 100h.','tasm → .obj → tlink → .exe (/t → .com) → td.','int 21h: 09h — строка до $, 01h — символ, 4Ch — выход.'],
  vms7:['AX, BX, CX, DX делятся на H и L; SI, DI — индексы; SP, BP — стек; CS, DS, SS, ES — сегменты.','Физический адрес = сегмент·16 + смещение, 20 бит, 1 МБ.','Один адрес — много пар сегмент:смещение.','Способы адресации: регистровая, непосредственная, прямая, косвенная, по базе, индексная, базово-индексная.'],
  vms8:['Цифра = ASCII − 30h; Enter = 0Dh.','Ввод: число = число·10 + цифра.','Вывод: div 10, остатки в стек, затем pop.','div si делит DX:AX — DX обнуляют.','16-битный регистр «заворачивается» после 65535.'],
  vms9:['Текстовый режим: B800:0000, 2 байта на символ.','Атрибут: мигание | фон RGB | яркость | символ RGB.','int 10h: 00h режим, 02h курсор, 06h очистка, 09h символ с атрибутом.','Экран 80×25 = 4000 байт.'],
  vms10:['VGA: AH = 00h; SVGA: AX = 4F02h, BX = номер.','Успех VESA — AX = 004Fh.','Кадр = W·H·байт на точку; окно 64 КБ в A000h.','13h — 320×200×256 = 64 000 байт, ровно в сегмент.'],
  vms11:['X = (−1)ˢ·1,M·2<sup>E−смещение</sup>; единица мантиссы скрыта.','single: 1 + 8 + 23, смещение 127; double: 1 + 11 + 52, смещение 1023.','Особые значения: ±0, ±∞, NaN, денормализованные.','FPU: стек из восьми 80-битных регистров ST(0)…ST(7).'],
  vms12:['Принципы фон Неймана: двоичность, программное управление, однородность памяти, адресность.','Шины: адреса (сколько памяти), данных (сколько бит за раз), управления.','Цикл: выборка → декодирование → операнды → исполнение → запись.','8086: BIU + EU, очередь 6 байт; иерархия памяти от регистров до диска.'],
  vms13:['mov: нельзя память ← память и константу в сегментный регистр.','inc/dec не меняют CF; cmp — вычитание без записи.','mul/div: байт — AX, слово — DX:AX.','CF — беззнаковый перенос, OF — знаковое переполнение, ZF, SF, PF, AF.','Деление на 0 и переполнение частного → int 0.'],
  vms14:['and — сбросить биты, or — установить, xor — инвертировать, test — проверить.','shl = ×2, shr = беззнаковое /2, sar = знаковое /2.','rol/ror — по кругу, rcl/rcr — по кругу через CF.','Логические команды обнуляют CF и OF.'],
  vms15:['ja/jb — беззнаковые, jg/jl — знаковые.','loop: CX − 1 и переход при CX ≠ 0; при CX = 0 — 65 536 раз.','push: SP − 2; pop: SP + 2; стек растёт вниз.','call кладёт адрес возврата; ret его снимает; параметры — [bp+4]…'],
  vms16:['Аппаратные (IRQ, 8259), программные (int n), исключения (0, 1, 3, 4).','Вектор n — по адресу 0000:n·4, 4 байта: смещение и сегмент.','int: push FLAGS, IF = TF = 0, push CS, push IP, переход; iret — обратно.','EOI: out 20h,20h; перехват — 35h/25h; резидент — 31h или int 27h.'],
  vms17:['in/out; порт &gt; 255 — через DX.','Таймер 1 193 180 Гц; делитель = 1 193 180/f; int 8 — 18,2 раза в секунду.','Скан-код отпускания = нажатия + 80h; порт 60h.','Файлы int 21h: 3Ch создать, 3Dh открыть, 3Fh читать, 40h писать, 3Eh закрыть; ошибка — CF = 1.'],
  vms18:['Селектор = индекс | TI | RPL; дескриптор 8 байт в GDT/LDT.','Дескриптор: база, предел, права, DPL.','Кольца 0–3; нарушение — исключение #GP.','Страницы 4 КБ: каталог | таблица | смещение (10 | 10 | 12 бит); CR3.','Вход: lgdt, бит PE в CR0, дальний переход; прерывания — через IDT.'],
  vms19:['Лаба 1 — DOS, маски, BAT-файлы с CHOICE.','Лаба 2 — сегменты, PSP, COM и EXE, tasm/tlink/td.','Лаба 3 — ASCII, ввод и вывод числа, стек.','Лаба 4 — видеорежимы VGA/VESA, объём кадра, цветной текст.']
};
const QS = {
  vms1:[['Чем позиционная система отличается от непозиционной?','В позиционной значение цифры зависит от её места (разряда), в непозиционной (римской) — нет.'],['Как перевести дробную часть из десятичной системы в двоичную?','Умножать на 2, записывая целые части результатов сверху вниз, пока дробь не станет нулём или не наберётся нужная точность.']],
  vms2:[['Почему перевод между 2, 8 и 16 делается группами?','Потому что 8 = 2³ и 16 = 2⁴: каждая восьмеричная цифра соответствует ровно трём битам, шестнадцатеричная — четырём.'],['Что такое двоично-десятичный код и где он применяется?','Каждая десятичная цифра кодируется 4 битами; используется в калькуляторах, индикаторах, часах реального времени CMOS.']],
  vms3:[['Зачем нужен дополнительный код?','Чтобы вычитание выполнялось сложением, а у нуля было одно представление.'],['Как найти дополнительный код отрицательного числа?','Записать модуль в двоичном коде нужной разрядности, инвертировать все биты и прибавить 1.']],
  vms4:[['Каков порядок выполнения лабы 1 в командной строке?','MD — создать каталоги, REN/MOVE — переименовать, RD — удалить пустой, COPY CON или ECHO > — создать файлы, COPY/MOVE — перенести, TYPE — показать, DIR с маской — найти.'],['Почему RD не удаляет каталог с файлами?','Защита от случайной потери данных: каталог должен быть пустым.']],
  vms5:[['Как в основном BAT-файле проверить существование файла?','IF NOT EXIST nf1.bat GOTO nofile — и вывести сообщение в блоке :nofile.'],['Опишите блок-схему CHOICE /C.','Вывести подсказку → ждать клавишу → если её нет в списке /C — сигнал и снова ждать → иначе ERRORLEVEL = номер клавиши → конец.']],
  vms6:[['Как определить начальные адреса сегментов в лабе 2?','В TD посмотреть DS при старте — это сегмент PSP; SSEG = PSP + 10h, следующие сегменты идут по порядку в тексте, каждый с границы параграфа.'],['Почему COM-программа завершается ret?','В начале PSP стоит команда int 20h, а в стеке при запуске лежит 0000h — ret передаёт управление на неё.']],
  vms7:[['Зачем 8086 сегментная адресация?','Регистры 16-битные (64 КБ), а шина адреса 20-битная (1 МБ): адрес собирают из сегмента·16 и смещения.'],['Перечислите способы адресации.','Регистровая, непосредственная, прямая, косвенная регистровая, по базе со смещением, индексная, базово-индексная.']],
  vms8:[['Как работает фрагмент «ввод числа» в лабе 3?','В цикле: int 21h/01h → если Enter — выход; иначе AL − \'0\', DI = DI·10 + цифра.'],['Как работает фрагмент «вывод числа»?','Делим AX на 10, остаток + \'0\' кладём в стек и считаем цифры в CX, пока AX ≠ 0; затем pop и int 21h/02h в цикле loop.']],
  vms9:[['Как устроен байт атрибута?','Бит 7 — мигание, биты 6–4 — цвет фона, бит 3 — яркость, биты 2–0 — цвет символа.'],['Чем отличаются функции 09h и 0Eh int 10h?','09h выводит символ с атрибутом и не двигает курсор; 0Eh — телетайп: двигает курсор и обрабатывает управляющие символы.']],
  vms10:[['Как программа лабы 4 перебирает режимы?','Номера режимов в массиве dw; в цикле — 4F02h, проверка AX = 004Fh, вывод текста процедурой, ожидание клавиши, следующий.'],['Почему режим 13h удобен?','Кадр 64 000 байт помещается в один сегмент A000h, один байт на точку, адрес = y·320 + x.']],
  vms11:[['Как устроено число одинарной точности?','1 бит знака, 8 бит смещённого порядка (смещение 127), 23 бита мантиссы со скрытой единицей.'],['Почему 0,1 + 0,2 ≠ 0,3 в компьютере?','0,1 и 0,2 — бесконечные двоичные дроби, хранятся с округлением; ошибки складываются.']],
  vms12:[['Перечислите принципы фон Неймана.','Двоичное кодирование, программное управление, однородность памяти, адресность.'],['Опишите цикл выполнения команды.','Выборка команды по CS:IP, декодирование, выборка операндов, исполнение в АЛУ, запись результата; IP указывает на следующую команду.'],['Какие шины есть в ЭВМ?','Адреса, данных и управления.']],
  vms13:[['Какие флаги устанавливает команда add?','CF, ZF, SF, OF, PF, AF — по результату.'],['Чем отличаются mul и imul, div и idiv?','mul/div работают с беззнаковыми числами, imul/idiv — со знаковыми.']],
  vms14:[['Как проверить, чётно ли число в AL?','test al,1 / jz чётное — младший бит 0.'],['Чем shr отличается от sar?','shr вдвигает 0 слева (беззнаковое деление), sar повторяет знаковый бит (знаковое деление).']],
  vms15:[['Чем ja отличается от jg?','ja — «выше» для беззнаковых (CF = 0, ZF = 0), jg — «больше» для знаковых (ZF = 0, SF = OF).'],['Что происходит со стеком при call и ret?','call кладёт адрес возврата (IP или CS:IP) и SP уменьшается; ret снимает его и SP увеличивается.']],
  vms16:[['Где расположена таблица векторов и как найти вектор?','0000:0000–0000:03FF; вектор n — по адресу n·4.'],['Что делает процессор при выполнении int n?','push FLAGS, сброс IF и TF, push CS, push IP, загрузка CS:IP из таблицы векторов.'],['Что такое резидентная программа?','Программа, которая после завершения остаётся в памяти (int 21h/31h или int 27h), обычно перехватив прерывание.']],
  vms17:[['Как вывести звук через динамик?','Задать делитель частоты каналу 2 таймера (порты 43h, 42h) и включить биты 0 и 1 порта 61h.'],['Как прочитать файл средствами DOS?','3Dh — открыть (AX = дескриптор), 3Fh — читать (BX, CX, DS:DX), 3Eh — закрыть; проверять CF.']],
  vms18:[['Чем защищённый режим отличается от реального?','Адрес задаёт селектор и дескриптор, доступно до 4 ГБ, есть защита по уровням привилегий, многозадачность и страничная память.'],['Как перейти в защищённый режим?','Подготовить GDT, lgdt, запретить прерывания, установить бит PE в CR0, выполнить дальний переход.']],
  vms19:[['Что спросят по лабе 2?','Структуру программы, назначение ASSUME, загрузку DS, PSP, разницу COM и EXE, этапы tasm/tlink/td, адреса сегментов.'],['Что спросят по лабе 4?','Как установить режимы VGA и VESA, как проверить успех, почему режим не ставится, как вывести цветной текст.']]
};
for (const L of BOOKS.vms.lessons){ if (SUM[L.id]) L.sum = SUM[L.id]; if (QS[L.id]) L.qs = QS[L.id]; }

/* Части книги */
BOOKS.vms.parts = [
  {t:'Информация и числа', ids:['vms1','vms2','vms3','vms11']},
  {t:'Командная строка DOS — лаба 1', ids:['vms4','vms5']},
  {t:'Архитектура и процессор 8086', ids:['vms12','vms7','vms13','vms14','vms15']},
  {t:'Программы для DOS — лабы 2–3', ids:['vms6','vms8','vms16','vms17']},
  {t:'Экран — лабы 3–4', ids:['vms9','vms10']},
  {t:'Защищённый режим и защита лаб', ids:['vms18','vms19']}
];
})();
