/* Книга «Бит»: вычислительные машины и системы — по практической №1, лабам 1–4 и Зубкову */
(() => {
const {h} = U;
const add = L => BOOKS.vms.lessons.push(L);
const DIG = '0123456789ABCDEF';
const hx = (v, w) => (v>>>0).toString(16).toUpperCase().padStart(w||0,'0');
const bin = (v, w) => (v>>>0).toString(2).padStart(w,'0').slice(-w);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const normNum = s => { s = String(s).trim().toUpperCase().replace(/\s/g,'').replace('.',',').replace(/[₀-₉]+$/,''); if (s.includes(',')) s = s.replace(/0+$/,'').replace(/,$/,''); return s; };

/* 1. Системы счисления: перевод */
add({
  id:'vms1', title:'Системы счисления: перевод чисел', src:'Практ. №1, п. 3.2–3.4',
  theory:`<p>В <b>позиционной</b> системе вес цифры зависит от её позиции. Основание q — количество цифр: в двоичной 0 и 1, в восьмеричной 0…7, в шестнадцатеричной 0…9, A…F. Римская система — <b>непозиционная</b>.</p>
  <div class="f">A<sub>q</sub> = a<sub>n−1</sub>q<sup>n−1</sup> + … + a₁q + a₀ + a<sub>−1</sub>q<sup>−1</sup> + … + a<sub>−m</sub>q<sup>−m</sup><small>развёрнутая форма — по ней переводят из любой системы в десятичную</small></div>
  <p><b>Из десятичной в q:</b> целую и дробную части переводят отдельно.</p>
  <ul><li><b>Целая часть</b> — делим на q с остатком, пока частное не станет 0. Остатки читаем <b>снизу вверх</b>.</li>
  <li><b>Дробная часть</b> — умножаем на q, отделяя целые части, пока дробь не станет 0 или не наберём нужную точность. Целые части читаем <b>сверху вниз</b>.</li></ul>
  <div class="f">1001,1101₂ = 1·2³ + 0 + 0 + 1·2⁰ + 1·2⁻¹ + 1·2⁻² + 0 + 1·2⁻⁴ = 9,8125₁₀</div>`,
  predict:{q:'Сколько двоичных разрядов в записи числа 405₁₀?', opts:['8','9','10'], a:1,
    why:'2⁸ = 256 ≤ 405 &lt; 512 = 2⁹, значит нужно 9 разрядов: 405₁₀ = 110010101₂. Число разрядов = (наибольшая степень двойки, не превосходящая число) + 1.'},
  flap:`<p><b>568,125₁₀ → восьмеричная.</b> Целая: 568 : 8 = 71 ост. 0; 71 : 8 = 8 ост. 7; 8 : 8 = 1 ост. 0; 1 : 8 = 0 ост. 1. Снизу вверх: 1070.</p>
  <p>Дробная: 0,125·8 = <b>1</b>,0 — дробь кончилась. Итого <b>1070,1₈</b>.</p>
  <p><b>Проверка:</b> 1·8³ + 0 + 7·8 + 0 + 1·8⁻¹ = 512 + 56 + 0,125 = 568,125 ✓.</p>
  <p><b>Быстро упорядочить</b> 55₇, 55₁₆, 55₈: 5·7 + 5 = 40; 5·16 + 5 = 85; 5·8 + 5 = 45. По убыванию: 55₁₆, 55₈, 55₇.</p>`,
  figCap:'Деление «уголком» для целой части и умножение столбиком для дробной. Светятся цифры ответа в порядке чтения.',
  try:'Впиши 405 и основание 2 — получится пример из практической: 110010101₂.',
  ch:{q:'Переведите число 568,125₁₀ в восьмеричную систему счисления.', ph:'например 123,4', check:s=>normNum(s)==='1070,1', ans:'1070,1₈', hint:'Целую часть дели на 8, дробную умножай на 8. Подсмотри на рисунке.'},
  fig(el){
    const inp = h('input',{class:'txt',id:'vms1-x',value:'405',style:'width:9em','aria-label':'Десятичное число'});
    const sq = U.slider('vms1-q','основание q',2,16,1,2,null,()=>draw());
    inp.addEventListener('input',()=>draw());
    el.append(h('div',{class:'row'}, h('label',{for:'vms1-x'},'Число₁₀:'), inp), h('div',{class:'ctls'}, sq));
    const box = h('div',{class:'readout',style:'font-size:14px'}); el.append(box);
    function draw(){
      const q = sq.get(), raw = inp.value.trim().replace('.',',');
      if (!/^\d{1,15}(,\d{0,10})?$/.test(raw)){ box.innerHTML = '<span class="bad">Впиши неотрицательное десятичное число, например 568,125</span>'; return; }
      const [ip, fp=''] = raw.split(',');
      let n = Number(ip), rows = [], res = '';
      if (n===0){ res = '0'; rows.push(`0 : ${q} = 0, ост. <span class="hot">0</span>`); }
      while (n>0){ const qt = Math.floor(n/q), r = n%q; rows.push(`${String(n).padStart(15,' ').trimStart()} : ${q} = ${qt}, ост. <span class="hot">${DIG[r]}</span>`); res = DIG[r]+res; n = qt; }
      let fr = Number('0.'+(fp||'0')), frows = [], fres = '';
      for (let i=0;i<10 && fr>1e-12;i++){ const p = fr*q, d = Math.floor(p+1e-12); frows.push(`${U.fmt(fr,6).replace(/0+$/,'')} · ${q} = <span class="hot">${DIG[d]}</span>${U.fmt(p-d,6).slice(1).replace(/0+$/,'').replace(/,$/,'')}`); fres += DIG[d]; fr = p-d; if (Math.abs(fr)<1e-9) break; }
      const ans = res + (fres ? ','+fres : '');
      const terms = res.split('').map((d,i)=>`${parseInt(d,16)}·${q}<sup>${res.length-1-i}</sup>`).join(' + ');
      box.innerHTML = `<div><b>Целая часть</b> — делим, остатки снизу вверх ↑</div>${rows.map(r=>'&nbsp;&nbsp;'+r).join('<br>')}`+
        (frows.length?`<div style="margin-top:8px"><b>Дробная часть</b> — умножаем, целые сверху вниз ↓</div>${frows.map(r=>'&nbsp;&nbsp;'+r).join('<br>')}${fr>1e-9?'<br>&nbsp;&nbsp;… (обрезано до 10 знаков)':''}`:'')+
        `<div style="margin-top:10px;font-size:18px">${raw}₁₀ = <span class="hot">${ans}</span><sub>${q}</sub></div><div style="color:var(--ink-soft);margin-top:4px">проверка: ${terms} = ${ip}</div>`;
    }
    return draw;
  }
});

/* 2. Триады, тетрады, BCD */
add({
  id:'vms2', title:'Двоичная, восьмеричная, шестнадцатеричная. Двоично-десятичный код', src:'Практ. №1, п. 3.4–3.6',
  theory:`<p>Так как 8 = 2³ и 16 = 2⁴, перевод между 2, 8 и 16 делается <b>группами</b>, без деления:</p>
  <ul><li>2 → 8: разбить на <b>триады</b> (по 3 бита) от запятой влево и вправо, недостающие разряды дополнить нулями;</li>
  <li>2 → 16: разбить на <b>тетрады</b> (по 4 бита);</li><li>обратно — каждую цифру заменить её триадой или тетрадой.</li></ul>
  <div class="tbl"><table><tr><th>16</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td></tr>
  <tr><th>2</th>${[...Array(16)].map((_,i)=>`<td class="mono">${bin(i,4)}</td>`).join('')}</tr></table></div>
  <p><b>Двоичная арифметика:</b> 0+0 = 0, 0+1 = 1, 1+1 = 10 (пишем 0, перенос 1). 1·1 = 1, остальные произведения 0.</p>
  <h3>Двоично-десятичный код (BCD, 8421)</h3>
  <p>Каждая <b>десятичная цифра</b> кодируется отдельной тетрадой 0000…1001. Удобно для вывода на индикаторы (калькуляторы, кассы). В байт помещаются две цифры: значения 0…99.</p>
  <div class="f">0011 0111<sub>2-10</sub> = 37₁₀, &nbsp; но 1000 0011 0010 0111 как BCD = 8327, а как двоичное = 33575</div>`,
  predict:{q:'Какое наибольшее число помещается в один байт в двоично-десятичном коде?', opts:['99','255','127'], a:0,
    why:'В байте две тетрады, каждая хранит одну десятичную цифру 0…9. Наибольшее значение 1001 1001 = 99. Комбинации 1010…1111 в BCD запрещены.'},
  flap:`<p><b>10010111,100011₂ → 16.</b> Целая часть: 1001 0111 → 9 7. Дробная: 1000 11<u>00</u> — дополняем нулями <b>справа</b> → 8 C.</p>
  <p>Ответ: <b>97,8C₁₆</b>. В восьмеричную: 010 010 111,100 011 → 227,43₈.</p>
  <p><b>Ловушка:</b> в дробной части нули добавляют только справа, в целой — только слева. Иначе значение меняется.</p>`,
  figCap:'Двоичная строка, разбитая на группы. Под каждой группой — её цифра. Ниже — то же число в BCD.',
  try:'Впиши 10010111,100011 и переключай группировку 3 ↔ 4.',
  ch:{q:'Переведите число 10010111,100011₂ в шестнадцатеричную систему.', ph:'например 1F,A', check:s=>normNum(s)==='97,8C', ans:'97,8C₁₆', hint:'Тетрады от запятой: влево 1001 0111, вправо 1000 1100.'},
  fig(el){
    let grp = 4;
    const inp = h('input',{class:'txt',id:'vms2-b',value:'10010111,100011',style:'width:14em','aria-label':'Двоичное число'});
    const b3 = U.btn('по 3 → ₈',()=>{grp=3; draw();}), b4 = U.btn('по 4 → ₁₆',()=>{grp=4; draw();});
    const dec = h('input',{class:'txt',id:'vms2-d',value:'8327',style:'width:8em','aria-label':'Десятичное число для BCD'});
    inp.addEventListener('input',()=>draw()); dec.addEventListener('input',()=>draw());
    const grpBox = h('div',{class:'readout',style:'font-size:18px;line-height:1.3'});
    const bcdBox = h('div',{class:'readout'});
    el.append(h('div',{class:'row'}, h('label',{for:'vms2-b'},'Число₂:'), inp, b3, b4), grpBox,
      h('div',{class:'row'}, h('label',{for:'vms2-d'},'Число₁₀ для BCD:'), dec), bcdBox);
    const cell = (bits, d, pad) => `<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 4px;padding:2px 4px;border-bottom:2px solid var(--pen)"><span>${bits.split('').map((b,i)=>pad.includes(i)?`<span style="color:var(--ink-soft)">${b}</span>`:b).join('')}</span><span class="hot" style="font-size:16px">${d}</span></span>`;
    function draw(){
      b3.setAttribute('aria-pressed',grp===3); b4.setAttribute('aria-pressed',grp===4);
      const raw = inp.value.trim().replace('.',',');
      if (!/^[01]+(,[01]*)?$/.test(raw)) grpBox.innerHTML = '<span class="bad">Только 0 и 1 и, если нужно, запятая.</span>';
      else {
        let [ip, fp=''] = raw.split(','); const padL = (grp - ip.length%grp)%grp, padR = (grp - fp.length%grp)%grp;
        const I = '0'.repeat(padL)+ip, F = fp+'0'.repeat(padR);
        let html = '', out = '';
        for (let i=0;i<I.length;i+=grp){ const b = I.slice(i,i+grp), d = DIG[parseInt(b,2)], pad = i===0 ? [...Array(padL).keys()] : []; html += cell(b,d,pad); out += d; }
        if (F){ html += '<span style="font-size:22px;margin:0 2px">,</span>'; out += ','; for (let i=0;i<F.length;i+=grp){ const b = F.slice(i,i+grp), d = DIG[parseInt(b,2)], pad = i+grp>=F.length ? [...Array(padR).keys()].map(k=>grp-1-k) : []; html += cell(b,d,pad); out += d; } }
        grpBox.innerHTML = html + `<div style="font-size:15px;margin-top:8px">= <b>${out}</b><sub>${grp===3?8:16}</sub> <span style="color:var(--ink-soft)">(серые нули — дополненные)</span></div>`;
      }
      const d = dec.value.trim();
      if (!/^\d{1,8}$/.test(d)){ bcdBox.innerHTML = '<span class="bad">Целое десятичное до 8 цифр.</span>'; return; }
      const bits = d.split('').map(c=>bin(+c,4));
      bcdBox.innerHTML = `BCD: ${d.split('').map((c,i)=>`<span title="${c}">${bits[i]}</span>`).join(' ')}<br>${d.split('').map((c,i)=>`<span style="display:inline-block;width:4ch;text-align:center;margin-right:1ch" class="hot">${c}</span>`).join('')}<br>те же биты как двоичное число: <b>${parseInt(bits.join(''),2)}</b>₁₀ · как обычное двоичное ${d}₁₀ = ${(+d).toString(2)}₂`;
    }
    return draw;
  }
});

/* 3. Прямой, обратный, дополнительный код */
add({
  id:'vms3', title:'Прямой, обратный и дополнительный коды', src:'Практ. №1, п. 3.7',
  theory:`<p>Целое число хранится в 1, 2, 4 или 8 байтах. Старший бит — <b>знаковый</b>: 0 — число неотрицательное, 1 — отрицательное. Положительные числа во всех трёх кодах записываются одинаково.</p>
  <ul><li><b>Прямой код:</b> знак + модуль. −3 → 1000 0011.</li>
  <li><b>Обратный код</b> отрицательного: модуль в n разрядах, затем инвертировать все биты. −35 → 0010 0011 → 1101 1100.</li>
  <li><b>Дополнительный код:</b> обратный + 1. −562 в 2 байтах → 1111 1101 1100 1110.</li></ul>
  <p>Зачем: в дополнительном коде вычитание заменяется обычным сложением, а у нуля одна запись. Именно его использует процессор 8086.</p>
  <div class="f">диапазон n-битного доп. кода: −2<sup>n−1</sup> … 2<sup>n−1</sup> − 1 &nbsp; (байт: −128…127)</div>
  <p><b>Обратно из доп. кода:</b> если старший бит 1 — вычесть 1, инвертировать, перевести и поставить минус.</p>
  <p>При сложении перенос из знакового разряда отбрасывается (флаг <b>CF</b>). Если результат вышел за диапазон — <b>переполнение</b> (флаг <b>OF</b>): сложили два числа одного знака, а знак суммы другой.</p>`,
  predict:{q:'Как выглядит −1 в дополнительном коде (1 байт)?', opts:['1000 0001','1111 1110','1111 1111'], a:2,
    why:'1 = 0000 0001 → инверсия 1111 1110 → +1 = 1111 1111. Проверка: 1111 1111 + 0000 0001 = 1 0000 0000, перенос отбрасываем, остаётся 0.'},
  flap:`<p><b>Доп. код 10101101 → десятичное.</b> Старший бит 1 — число отрицательное. 10101101 − 1 = 10101100. Инвертируем: 01010011 = 64 + 16 + 2 + 1 = 83. Ответ: <b>−83</b>.</p>
  <p><b>Обратный код 11100111</b> (задача 17): инвертируем → 00011000 = 24, ответ −24.</p>
  <p><b>Доп. код −24</b> (задача 19): 24 = 00011000 → 11100111 → +1 = <b>11101000</b>.</p>`,
  figCap:'Сверху — число и три его кода, биты можно щёлкать. Снизу — сложение двух байтов в дополнительном коде с переносами и флагами.',
  try:'Щёлкни биты так, чтобы получилось 10101101, и посмотри, какое это число.',
  ch:{q:'Дополнительный код числа X имеет значение 10101101. Найдите X в десятичной системе.', check:s=>U.near(s.replace('−','-'),-83,0), ans:'−83', hint:'Вычти 1, инвертируй, переведи, поставь минус.'},
  fig(el){
    let x = -35, a = 100, b = 50;
    const sx = U.slider('vms3-x','X',-128,127,1,x,v=>String(v).replace('-','−'),v=>{x=v; draw();});
    const bits = h('div',{class:'row',style:'gap:4px;font-family:var(--f-mono)'});
    const btns = [...Array(8)].map((_,i)=>{ const bt = h('button',{type:'button',class:'btn',style:'width:34px;padding:5px 0;box-shadow:none','aria-label':'бит '+(7-i)}); bt.onclick = () => { let v = (x & 0xFF) ^ (1<<(7-i)); x = v>127 ? v-256 : v; sx.set(x); draw(); }; return bt; });
    bits.append(h('span',{style:'margin-right:6px;color:var(--ink-soft)'},'доп. код:'), ...btns);
    const codes = h('div',{class:'readout'});
    const sa = U.slider('vms3-a','A',-128,127,1,a,v=>String(v).replace('-','−'),v=>{a=v; draw();});
    const sb = U.slider('vms3-b','B',-128,127,1,b,v=>String(v).replace('-','−'),v=>{b=v; draw();});
    const sum = h('div',{class:'readout',style:'font-size:15px;line-height:1.5'});
    el.append(h('div',{class:'ctls'}, sx), bits, codes, h('h3',{style:'margin:8px 0 0'},'Сложение A + B в доп. коде'), h('div',{class:'ctls'}, sa, sb), sum);
    const sp = s => `<span style="color:var(--stamp);font-weight:600">${s[0]}</span>${s.slice(1,4)} ${s.slice(4)}`;
    function draw(){
      const u = x & 0xFF;
      btns.forEach((bt,i)=>{ const on = (u>>(7-i))&1; bt.textContent = on; bt.setAttribute('aria-pressed', !!on); });
      const abs = Math.abs(x);
      const pr = x===-128 ? '— (|−128| не влезает в 7 бит)' : sp((x<0?'1':'0')+bin(abs,7));
      const ob = x===-128 ? '—' : x<0 ? sp(bin(~abs & 0xFF,8)) + ` <span style="color:var(--ink-soft)">← инверсия ${bin(abs,8)}</span>` : sp(bin(x,8));
      codes.innerHTML = `X = <b>${String(x).replace('-','−')}</b>₁₀ = ${hx(u,2)}h<br>прямой&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${pr}<br>обратный&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${ob}<br>дополнительный <span class="hot">${bin(u,8).slice(0,4)} ${bin(u,8).slice(4)}</span>${x<0&&x>-128?' <span style="color:var(--ink-soft)">← обратный + 1</span>':''}`;
      const A = a & 0xFF, B = b & 0xFF, S = A+B, r = S & 0xFF, cf = S>255, rs = r>127?r-256:r, of = (a+b)>127 || (a+b)<-128;
      let carry = '', c = 0; const cs = [];
      for (let i=0;i<8;i++){ const s = ((A>>i)&1)+((B>>i)&1)+c; c = s>1?1:0; cs.unshift(c); }
      carry = cs.map(v=>v?'1':'·').join('');
      sum.innerHTML = `<span style="color:var(--ink-soft)">переносы  ${carry}</span><br>&nbsp;&nbsp;A = ${bin(A,8)}  (${String(a).replace('-','−')})<br>+ B = ${bin(B,8)}  (${String(b).replace('-','−')})<br>────────────────<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hot">${bin(r,8)}</span>  = ${String(rs).replace('-','−')}<br>CF = ${cf?1:0} ${cf?'(перенос отброшен)':''} · OF = <span class="${of?'bad':'good'}">${of?1:0}</span> ${of?'— переполнение: правильный ответ '+(a+b)+' не влезает в байт':'— результат верный'}`;
    }
    return draw;
  }
});

/* 4. DOS: файлы, каталоги, маски */
const T0 = '27.10.26  12:00';
const mkFS = () => ({dir:true, kids:{
  'TASM.EXE':{size:129266}, 'TLINK.EXE':{size:53414}, 'TD.EXE':{size:543776},
  'NC':{dir:true,kids:{'NC.EXE':{size:121082}}},
  'LAB':{dir:true,kids:{'F1.BAT':{size:25,text:'@echo off\r\necho Это файл номер 1'}, 'F2.BAT':{size:25,text:'@echo off\r\necho Это файл номер 2'}, 'F3.BAT':{size:25,text:'@echo off\r\necho Это файл номер 3'},
    'PRIVET.ASM':{size:612,text:".model tiny\r\n.code\r\norg 100h\r\nstart: mov ah,09\r\n mov dx,offset mess\r\n int 21h\r\n ret\r\nmess db 'Privet',0Dh,0Ah,'$'\r\nend start"}, 'README.TXT':{size:48,text:'Lab 1: files, directories, masks * and ?'}, 'NOTES':{size:12,text:'no extension'}}}}});
// маска DOS: ? в конце части — один символ или ни одного; всё после * в части игнорируется
const dosMatch = (mask, name) => {
  const m = mask.toUpperCase(), d = m.lastIndexOf('.'); const N = name.toUpperCase(), nd = N.lastIndexOf('.');
  const [mn, me] = d<0 ? [m,'*'] : [m.slice(0,d), m.slice(d+1)]; const [fn, fe] = nd<0 ? [N,''] : [N.slice(0,nd), N.slice(nd+1)];
  const part = p => { const s = p.indexOf('*'); if (s>=0) p = p.slice(0,s+1); const t = (/\?+$/.exec(p)||[''])[0].length; const body = p.slice(0,p.length-t);
    return new RegExp('^'+body.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'.?'.repeat(t)+'$'); };
  return part(mn).test(fn) && part(me).test(fe);
};
const valid83 = n => /^[A-Z0-9_$~!#%&'(){}@^`-]{1,8}(\.[A-Z0-9_$~!#%&'(){}@^`-]{0,3})?$/.test(n.toUpperCase());
add({
  id:'vms4', title:'DOS: файлы, каталоги, маски * и ?', src:'Лаб. работа 1',
  theory:`<p><b>Файл</b> — именованная область на диске. Имя в DOS — <b>8.3</b>: до 8 символов имени и до 3 символов расширения (BAT, EXE, COM, TXT, ASM). Каталоги образуют дерево с корнем <code>C:\\</code>; полное имя файла — путь: <code>C:\\LAB\\F1.BAT</code>.</p>
  <div class="tbl"><table><tr><th>Команда</th><th>Что делает</th></tr>
  <tr><td><code>DIR [маска]</code></td><td>содержимое каталога; <code>/P</code> — постранично, <code>/W</code> — в ширину</td></tr>
  <tr><td><code>CD имя</code>, <code>CD ..</code>, <code>CD \\</code></td><td>сменить каталог: вниз, на уровень вверх, в корень</td></tr>
  <tr><td><code>MD имя</code> / <code>RD имя</code></td><td>создать / удалить <b>пустой</b> каталог</td></tr>
  <tr><td><code>COPY откуда куда</code></td><td>копировать; <code>COPY CON файл</code> — набрать текст, конец — Ctrl+Z</td></tr>
  <tr><td><code>MOVE</code>, <code>REN старое новое</code></td><td>переместить, переименовать</td></tr>
  <tr><td><code>DEL маска</code>, <code>TYPE файл</code>, <code>CLS</code></td><td>удалить, показать текст, очистить экран</td></tr></table></div>
  <p><b>Маски:</b> <code>*</code> — любое число любых символов, <code>?</code> — один символ (в конце имени — один или ни одного). <code>*.BAT</code> — все пакетные файлы, <code>F?.BAT</code> — F1.BAT, F2.BAT…</p>
  <p><b>DOSBox:</b> <code>mount c C:\\TASM</code>, затем <code>C:</code>. <b>Norton Commander:</b> F3 — просмотр, F4 — правка, F5 — копия, F6 — перенос/переименование, F7 — каталог, F8 — удаление; сортировка Ctrl+F3 по имени, Ctrl+F4 по расширению, Ctrl+F5 по времени, Ctrl+F6 по размеру.</p>`,
  predict:{q:'В каталоге KAT1 лежат два файла. Что сделает команда <code>RD KAT1</code>?', opts:['Удалит каталог вместе с файлами','Откажется: каталог должен быть пустым','Удалит только файлы'], a:1,
    why:'RD удаляет только пустой каталог и выдаёт ошибку. Сначала <code>DEL KAT1\\*.*</code>, затем <code>RD KAT1</code>. (В поздних версиях DOS для удаления с содержимым есть DELTREE.)'},
  flap:`<p><b>Порядок лабы в командной строке:</b></p>
  <pre class="asm">MD K1
MD K2
MD K3
REN K3 KAT3        &lt;- в DOS 6 каталог переименовывают через MOVE K3 KAT3
RD K2
ECHO Privet &gt; K1\\A.TXT
COPY CON K1\\B      &lt;- файл без расширения, текст, Ctrl+Z
COPY \\LAB\\README.TXT K1
MOVE K1\\A.TXT KAT3
TYPE K1\\B
DIR \\*.BAT /S       &lt;- поиск по маске во всех подкаталогах</pre>
  <p><b>Причуда масок DOS:</b> всё, что стоит в имени после <code>*</code>, игнорируется. <code>*1.BAT</code> найдёт и F2.BAT — это видно в тренажёре.</p>`,
  figCap:'Учебная командная строка DOS (эмуляция в браузере). Работают DIR, CD, MD, RD, COPY, MOVE, DEL, REN, TYPE, ECHO … &gt; файл, CLS, HELP.',
  try:'Набери <code>DIR *.BAT</code>, потом <code>MD K1</code>, <code>COPY F?.BAT K1</code> и <code>DIR K1</code>.',
  ch:{q:'В каталоге лежат F1.BAT, F2.BAT, F3.BAT, NF1.BAT, NF2.BAT, NF3.BAT, MAIN.BAT, NF1.TXT и NOTES. Впишите маску, которая выберет ровно NF1.BAT, NF2.BAT и NF3.BAT.', ph:'маска',
    check:s=>{ const names=['F1.BAT','F2.BAT','F3.BAT','NF1.BAT','NF2.BAT','NF3.BAT','MAIN.BAT','NF1.TXT','NOTES'], want='NF1.BAT,NF2.BAT,NF3.BAT'; return names.filter(n=>dosMatch(s.trim(),n)).join(',')===want; },
    ans:'NF?.BAT (подходит и NF*.BAT)', wrong:'Маска выбирает не те файлы. Проверь её командой DIR в тренажёре.', hint:'Имя начинается с NF, дальше один символ, расширение BAT.'},
  fig(el){
    let fs = mkFS(), cwd = ['LAB'], lines = [];
    const scr = h('div',{class:'readout',style:'height:300px;overflow:auto;white-space:pre;font-size:13px;line-height:1.45',role:'log','aria-label':'Экран DOS'});
    const inp = h('input',{class:'txt',id:'vms4-cmd',autocomplete:'off',spellcheck:'false',style:'flex:1 1 200px','aria-label':'Команда DOS'});
    const form = h('form',{class:'row'}, h('label',{for:'vms4-cmd',class:'mono',id:'vms4-pr'},'C:\\LAB>'), inp, h('button',{class:'btn pri',type:'submit'},'Enter'));
    el.append(scr, form, h('div',{class:'row'}, ...['DIR','DIR *.BAT','DIR ?1.*','MD K1','COPY F?.BAT K1','RD K1','TYPE F1.BAT'].map(c=>U.btn(c,()=>{ run(c); }))), h('div',{class:'row'}, U.btn('Сбросить диск',()=>{ fs=mkFS(); cwd=['LAB']; lines=[]; run('DIR'); })));
    const prompt = () => 'C:\\'+cwd.join('\\')+'>';
    const node = path => { let n = fs; for (const p of path){ n = n.kids[p]; if (!n || !n.dir) return null; } return n; };
    const resolve = arg => { // путь к каталогу
      let p = arg.startsWith('\\') ? [] : [...cwd]; for (const s of arg.split('\\').filter(Boolean)){ if (s==='..') p.pop(); else if (s!=='.') p.push(s.toUpperCase()); } return p; };
    const split = arg => { const i = arg.lastIndexOf('\\'); return i<0 ? [cwd, arg] : [resolve(arg.slice(0,i)||'\\'), arg.slice(i+1)]; };
    const out = s => lines.push(...String(s).split('\n'));
    const fmtDir = (n, path, mask) => {
      out(' Volume in drive C has no label'); out(' Directory of C:\\'+path.join('\\')); out('');
      if (path.length && dosMatch(mask,'.')) { out('.            <DIR>        '+T0); out('..           <DIR>        '+T0); }
      let f=0, b=0;
      for (const [k,v] of Object.entries(n.kids)){ if (!dosMatch(mask,k)) continue; const d=k.lastIndexOf('.'), nm = d<0?k:k.slice(0,d), ex = d<0?'':k.slice(d+1);
        out(nm.padEnd(9)+ex.padEnd(4)+(v.dir?'<DIR>       ':String(v.size).padStart(10)+'  ')+T0); if (!v.dir){ f++; b+=v.size; } }
      out(`${String(f).padStart(8)} file(s) ${String(b).padStart(10)} bytes`); };
    function run(cmd){
      out(prompt()+cmd);
      const [c0, ...rest] = cmd.trim().split(/\s+/); const c = (c0||'').toUpperCase(), args = rest.filter(a=>!/^\/[A-Z]$/i.test(a));
      const cur = node(cwd);
      try {
        if (!c) {}
        else if (c==='CLS') lines = [];
        else if (c==='HELP') out('DIR CD MD RD COPY MOVE DEL REN TYPE ECHO CLS VER');
        else if (c==='VER') out('MS-DOS Version 6.22 (эмуляция для учёбы)');
        else if (c==='DIR'){ const a = args[0]||'*.*', p = resolve(a), n = node(p); if (n) fmtDir(n, p, '*.*'); else { const [dp, m] = split(a); const dn = node(dp); if (!dn) out('Path not found'); else { const any = Object.keys(dn.kids).some(k=>dosMatch(m,k)); if (!any) out('File not found'); else fmtDir(dn, dp, m); } } }
        else if (c==='CD'||c==='CHDIR'){ if (!args[0]) out('C:\\'+cwd.join('\\')); else { const p = resolve(args[0]); if (node(p)) cwd = p; else out('Invalid directory'); } }
        else if (c==='MD'||c==='MKDIR'){ const [dp, nm] = split(args[0]||''); const dn = node(dp); const N = nm.toUpperCase(); if (!dn || !N || !valid83(N) || dn.kids[N]) out('Unable to create directory'); else dn.kids[N] = {dir:true,kids:{}}; }
        else if (c==='RD'||c==='RMDIR'){ const p = resolve(args[0]||''); const n = node(p); if (!n || !p.length || Object.keys(n.kids).length || p.join('\\')===cwd.join('\\')) out('Invalid path, not directory,\nor directory not empty'); else delete node(p.slice(0,-1)).kids[p[p.length-1]]; }
        else if (c==='COPY'||c==='MOVE'){
          if (args.length<2){ out('Required parameter missing'); }
          else { const [sp, m] = split(args[0]); const sn = node(sp); const files = sn ? Object.keys(sn.kids).filter(k=>!sn.kids[k].dir && dosMatch(m,k)) : [];
            if (!files.length) out('File not found - '+args[0].toUpperCase());
            else { const dpath = resolve(args[1]); const dn = node(dpath); let n = 0;
              for (const f of files){ let tn, tname; if (dn){ tn = dn; tname = f; } else { const [tp, tm] = split(args[1]); tn = node(tp); tname = tm.toUpperCase(); if (!tn || !valid83(tname)) { out('Invalid destination'); break; } }
                tn.kids[tname] = {...sn.kids[f]}; if (c==='MOVE' && !(tn===sn && tname===f)) delete sn.kids[f]; n++; if (c==='COPY') out(f); else out('C:\\'+sp.join('\\')+'\\'+f+' => ...[ok]'); }
              if (c==='COPY') out(`${String(n).padStart(9)} file(s) copied`); } } }
        else if (c==='DEL'||c==='ERASE'){ const [dp, m] = split(args[0]||''); const dn = node(dp); const fl = dn ? Object.keys(dn.kids).filter(k=>!dn.kids[k].dir && dosMatch(m,k)) : []; if (!fl.length) out('File not found'); else fl.forEach(k=>delete dn.kids[k]); }
        else if (c==='REN'||c==='RENAME'){ const [dp, m] = split(args[0]||''); const dn = node(dp); const N = (args[1]||'').toUpperCase(); const k = dn && Object.keys(dn.kids).find(k=>k===m.toUpperCase()); if (!k || !valid83(N) || dn.kids[N]) out('Duplicate file name or file not found'); else { dn.kids[N] = dn.kids[k]; delete dn.kids[k]; } }
        else if (c==='TYPE'){ const [dp, m] = split(args[0]||''); const dn = node(dp); const f = dn && dn.kids[m.toUpperCase()]; if (!f || f.dir) out('File not found - '+(args[0]||'').toUpperCase()); else out(f.text||'(двоичный файл — на экране был бы мусор)'); }
        else if (c==='ECHO'){ const t = cmd.trim().slice(4).trim(); const gt = t.indexOf('>'); if (gt<0) out(t||'ECHO is on'); else { const txt = t.slice(0,gt).trim(), [dp, nm] = split(t.slice(gt+1).trim()); const dn = node(dp), N = nm.toUpperCase(); if (!dn||!valid83(N)) out('File creation error'); else dn.kids[N] = {size:txt.length+2,text:txt}; } }
        else if (/^[A-Z]:$/.test(c)) out(c==='C:'?'':'Invalid drive specification');
        else out('Bad command or file name');
      } catch(e){ out('Bad command or file name'); }
      out('');
      if (lines.length>400) lines = lines.slice(-400);
      scr.textContent = lines.join('\n'); scr.scrollTop = scr.scrollHeight;
      document.getElementById('vms4-pr').textContent = prompt();
    }
    form.addEventListener('submit', e => { e.preventDefault(); run(inp.value); inp.value=''; inp.focus(); });
    run('DIR');
    return null;
  }
});

/* 5. Пакетные файлы: CHOICE, IF ERRORLEVEL */
add({
  id:'vms5', title:'Пакетные файлы: CHOICE и IF ERRORLEVEL', src:'Лаб. работа 1, пакетные файлы',
  theory:`<p><b>Пакетный файл</b> (.BAT) — текстовый файл с командами DOS, которые выполняются по очереди.</p>
  <div class="tbl"><table><tr><th>Команда</th><th>Смысл</th></tr>
  <tr><td><code>@ECHO OFF</code></td><td>не печатать сами команды; <code>@</code> скрывает и эту строку</td></tr>
  <tr><td><code>ECHO текст</code>, <code>REM</code>, <code>PAUSE</code></td><td>вывод, комментарий, ждать клавишу</td></tr>
  <tr><td><code>:метка</code>, <code>GOTO метка</code></td><td>переход</td></tr>
  <tr><td><code>CALL файл.bat</code></td><td>выполнить другой BAT и вернуться</td></tr>
  <tr><td><code>IF [NOT] EXIST файл команда</code></td><td>проверка существования</td></tr>
  <tr><td><code>CHOICE /C:символы текст</code></td><td>ждать нажатия одной из клавиш; <code>/N</code> — не показывать [символы], <code>/T:символ,сек</code> — ответ по умолчанию</td></tr>
  <tr><td><code>IF ERRORLEVEL n команда</code></td><td>условие истинно, если код возврата <b>≥ n</b></td></tr></table></div>
  <p>CHOICE возвращает в ERRORLEVEL <b>порядковый номер</b> нажатой клавиши в списке /C: для <code>/C:123</code> клавиша «2» даёт 2, для <code>/C:ABC</code> клавиша «C» даёт 3.</p>
  <p>Так как IF ERRORLEVEL проверяет «больше или равно», проверки ставят <b>по убыванию</b>: сначала 3, потом 2, потом 1.</p>`,
  predict:{q:'Когда срабатывает <code>IF ERRORLEVEL 2 GOTO N2</code>?', opts:['Когда код возврата ровно 2','Когда код возврата 2 и больше','Когда код возврата 2 и меньше'], a:1,
    why:'IF ERRORLEVEL n истинно при ERRORLEVEL ≥ n. Если поставить проверку на 1 первой, она «съест» все варианты. Переключи порядок на рисунке и увидишь.'},
  flap:`<p><b>Блок-схема CHOICE с ключом /C</b> (её просят нарисовать в отчёте):</p>
  <div style="display:grid;gap:4px;justify-items:center;font-size:14px;text-align:center">
   <div style="border:1.5px solid var(--ink);border-radius:999px;padding:4px 14px">Начало</div><div>↓</div>
   <div style="border:1.5px solid var(--ink);padding:4px 10px">Вывести текст и список [1,2,3]?</div><div>↓</div>
   <div style="border:1.5px solid var(--ink);padding:4px 10px">Ждать нажатия клавиши K</div><div>↓</div>
   <div style="border:1.5px solid var(--ink);padding:6px 14px;transform:skewX(-12deg)">K есть в списке /C?</div>
   <div>нет → звуковой сигнал, снова ждать K &nbsp;·&nbsp; да ↓</div>
   <div style="border:1.5px solid var(--ink);padding:4px 10px">ERRORLEVEL = номер K в списке</div><div>↓</div>
   <div style="border:1.5px solid var(--ink);border-radius:999px;padding:4px 14px">Конец</div></div>
  <p style="margin-top:10px">Текст основного файла — на рисунке справа. Файлы f1–f3.bat: <code>@echo off</code> и <code>echo Это файл номер 1</code>.</p>`,
  figCap:'Основной пакетный файл лабы. Подсвечены строки, которые выполнились при нажатой клавише.',
  try:'Нажми 3 при порядке «по возрастанию»: запустится не тот файл.',
  ch:{q:'Команда <code>CHOICE /C:ABCD</code>, пользователь нажал C. Чему равен ERRORLEVEL?', check:s=>U.near(s,3,0), ans:'3', hint:'ERRORLEVEL — порядковый номер клавиши в списке после /C:.'},
  fig(el){
    let asc = false, noF2 = false, key = null;
    const body = () => [
      '@echo off','copy f1.bat nf1.bat > nul','copy f2.bat nf2.bat > nul','copy f3.bat nf3.bat > nul',
      'echo 1 - nf1   2 - nf2   3 - nf3','choice /c:123 Ваш выбор',
      ...(asc ? ['if errorlevel 1 goto n1','if errorlevel 2 goto n2','if errorlevel 3 goto n3'] : ['if errorlevel 3 goto n3','if errorlevel 2 goto n2','if errorlevel 1 goto n1']),
      ':n1','if not exist nf1.bat goto nofile','call nf1.bat','goto end',
      ':n2','if not exist nf2.bat goto nofile','call nf2.bat','goto end',
      ':n3','if not exist nf3.bat goto nofile','call nf3.bat','goto end',
      ':nofile','echo Файл не найден!',':end'];
    const code = h('pre',{class:'asm',style:'max-height:none'}), scr = h('div',{class:'readout',style:'white-space:pre;min-height:5.5em'});
    const bo = U.btn('порядок: по убыванию',()=>{asc=!asc; draw();}), bf = U.btn('f2.bat есть',()=>{noF2=!noF2; draw();});
    el.append(h('div',{class:'row'}, h('span',{},'Нажать:'), ...['1','2','3'].map(k=>U.btn(k,()=>{key=k; draw();},'pri')), bo, bf), code, scr);
    function draw(){
      bo.textContent = asc ? 'порядок: по возрастанию (ошибка)' : 'порядок: по убыванию'; bo.setAttribute('aria-pressed',asc);
      bf.textContent = noF2 ? 'f2.bat отсутствует' : 'f2.bat есть'; bf.setAttribute('aria-pressed',noF2);
      const L = body(), lab = {}; L.forEach((l,i)=>{ if (l.startsWith(':')) lab[l.slice(1)] = i; });
      const files = new Set(['f1.bat','f3.bat', ...(noF2?[]:['f2.bat'])]), ran = new Set(), out = [];
      let el2 = 0, pc = 0, steps = 0;
      if (key) while (pc<L.length && steps++<100){
        const l = L[pc], w = l.split(/\s+/); ran.add(pc); pc++;
        if (w[0]==='copy'){ if (files.has(w[1])) files.add(w[2]); }
        else if (w[0]==='echo') out.push(l.slice(5));
        else if (w[0]==='choice'){ out.push('Ваш выбор[1,2,3]?'+key); el2 = '123'.indexOf(key)+1; }
        else if (w[0]==='if' && w[1]==='errorlevel'){ if (el2>=+w[2]) pc = lab[w[4]]; }
        else if (w[0]==='if' && w[1]==='not'){ if (!files.has(w[3])) pc = lab[w[5]]; }
        else if (w[0]==='call'){ out.push('Это файл номер '+w[1][2]); }
        else if (w[0]==='goto') pc = lab[w[1]];
      }
      code.innerHTML = L.map((l,i)=>`<span style="display:block;${ran.has(i)?'background:var(--pen-wash);border-left:3px solid var(--glow);margin-left:-12px;padding-left:9px':''}">${esc(l)}</span>`).join('');
      scr.textContent = key ? `C:\\LAB>MAIN.BAT\n${out.join('\n')}\n\nERRORLEVEL = ${el2}` : 'Нажми 1, 2 или 3 — как пользователь в CHOICE.';
    }
    return draw;
  }
});

/* 6. Структура программы, сегменты, PSP */
add({
  id:'vms6', title:'Программа на ассемблере: сегменты, PSP, EXE и COM', src:'Лаб. работа 2',
  theory:`<p>Программа для DOS делится на <b>сегменты</b>: кода, данных, стека. Директивы: <code>имя SEGMENT … имя ENDS</code>, <code>ASSUME cs:…, ds:…, ss:…</code> (какой сегментный регистр с каким сегментом связан), <code>END метка</code> — конец текста и точка входа.</p>
  <p>Цепочка сборки: <code>.ASM</code> → <code>tasm</code> → <code>.OBJ</code> → <code>tlink</code> → <code>.EXE</code> (или <code>tlink /t</code> → <code>.COM</code>) → отладка <code>td</code> (F7 — шаг).</p>
  <div class="tbl"><table><tr><th></th><th>EXE</th><th>COM</th></tr>
  <tr><td>Размер</td><td>больше 64 КБ можно</td><td>всё в одном сегменте ≤ 64 КБ</td></tr>
  <tr><td>Сегменты</td><td>отдельные CS, DS, SS</td><td>CS = DS = SS = ES</td></tr>
  <tr><td>Начало</td><td>нужно загрузить DS: <code>mov ax,DSEG / mov ds,ax</code></td><td><code>ORG 100h</code></td></tr>
  <tr><td>Заголовок файла</td><td>есть (таблица настроек)</td><td>нет — точная копия памяти</td></tr>
  <tr><td>Выход</td><td><code>mov ah,4Ch / int 21h</code></td><td><code>ret</code> или <code>int 20h</code></td></tr></table></div>
  <p><b>PSP</b> (префикс программного сегмента) — 256 байт (100h), которые DOS ставит перед программой: командная строка, адрес возврата и т. п. При запуске EXE регистры DS и ES указывают на PSP.</p>
  <p><b>INT 21h:</b> AH = 09h — вывод строки DS:DX до символа <code>'$'</code>; AH = 01h — ввод символа с эхом в AL; AH = 4Ch — завершение.</p>`,
  predict:{q:'Зачем в COM-программе пишут <code>ORG 100h</code>?', opts:['Первые 256 байт сегмента занимает PSP','Так быстрее работает процессор','100h — адрес видеопамяти'], a:0,
    why:'COM загружается в один сегмент сразу после PSP, который занимает смещения 0000–00FFh. Первая команда программы лежит по смещению 0100h, и ассемблер должен считать адреса меток от него.'},
  flap:`<p><b>Как заполнить таблицу п. 11 лабы.</b> Запусти <code>td privet.exe</code> и посмотри DS в начале — это сегмент PSP (P). Сегменты идут в том порядке, в каком написаны в тексте, каждый с границы параграфа (16 байт):</p>
  <ul><li>PSP: P:0000–P:00FF, 256 байт;</li><li>SSEG: P + 10h, размер стека (256 байт = 10h параграфов);</li><li>DSEG: SSEG + 10h, 'Privet',0Dh,0Ah,'$' = 9 байт;</li><li>CSEG: DSEG + 1, код 14h = 20 байт.</li></ul>
  <p>Физический адрес = сегмент·16 + смещение. При P = 1000h: SSEG = 1010h, DSEG = 1020h, <b>CSEG = 1021h</b>.</p>
  <p>Смещение переменной видно в TD или в листинге (<code>tasm /l</code>).</p>`,
  figCap:'Карта памяти после загрузки программы из лабы (вариант 1 — EXE, вариант 3 — COM). Высота блоков условная.',
  try:'Впиши в поле PSP значение DS, которое показал тебе TD, и сразу получишь таблицу для отчёта.',
  ch:{q:'Программа — вариант 1 из лабы 2 (стек 256 байт, сообщение «Privet»). PSP загружен в сегмент 1000h. Чему равен сегментный адрес CSEG?', ph:'например 1A2Bh', check:s=>U.hex(s)===0x1021, ans:'1021h',
    hint:'PSP занимает 10h параграфов, стек ещё 10h, данные (9 байт) — 1 параграф.'},
  fig(el){
    let com = false;
    const psp = h('input',{class:'txt',id:'vms6-psp',value:'1000',style:'width:6em','aria-label':'Сегмент PSP, hex'});
    const msg = h('input',{class:'txt',id:'vms6-msg',value:'Privet',style:'width:12em','aria-label':'Текст сообщения'});
    const ss = U.slider('vms6-st','стек, байт',16,1024,16,256,null,()=>draw());
    const be = U.btn('EXE (вар. 1)',()=>{com=false; draw();}), bc = U.btn('COM (вар. 3)',()=>{com=true; draw();});
    psp.addEventListener('input',()=>draw()); msg.addEventListener('input',()=>draw());
    el.append(h('div',{class:'row'}, be, bc), h('div',{class:'row'}, h('label',{for:'vms6-psp'},'PSP (hex):'), psp, h('label',{for:'vms6-msg'},'mess:'), msg), h('div',{class:'ctls'}, ss));
    const cv = U.canvas(el, .5);
    const tb = h('div',{class:'tbl'}); el.append(tb);
    function draw(){
      be.setAttribute('aria-pressed',!com); bc.setAttribute('aria-pressed',com);
      const P = U.hex(psp.value), c = U.col(), {g,W,H} = cv.fit();
      if (!isFinite(P) || P>0xFFFF){ tb.innerHTML = '<p style="color:var(--bad)">Сегмент PSP — шестнадцатеричное число до FFFF.</p>'; return; }
      const mlen = msg.value.length+3, st = ss.get(), ph = (s,o) => hx(s*16+o,5)+'h';
      let rows;
      if (!com){
        const S = P+0x10, D = S+Math.ceil(st/16), Cs = D+Math.ceil(mlen/16);
        rows = [['PSP',P,0,256],['SSEG (стек)',S,0,st],['DSEG (данные)',D,0,mlen],['CSEG (код)',Cs,0,20]];
      } else {
        const code = 12;
        rows = [['PSP',P,0,256],['код',P,0x100,code],['mess',P,0x100+code,mlen],['свободно',P,0x100+code+mlen,0xFFFE-(0x100+code+mlen)-64],['стек ↓ (SP = FFFEh)',P,0xFFFE-64,64]];
      }
      tb.innerHTML = `<table><tr><th>Блок</th><th>Начало seg:off</th><th>Конец</th><th>Физ. начало</th><th>Физ. конец</th><th>Размер</th></tr>${rows.map(([n,s,o,z])=>`<tr><td>${n}</td><td class="mono">${hx(s,4)}:${hx(o,4)}</td><td class="mono">${hx(s,4)}:${hx(o+z-1,4)}</td><td class="mono">${ph(s,o)}</td><td class="mono">${ph(s,o+z-1)}</td><td class="mono">${z} (${hx(z)}h)</td></tr>`).join('')}</table>`;
      // полоса памяти
      const x0 = 70, x1 = W-20, y = 30, hh = H-60, tot = rows.length;
      const wts = rows.map(r=>r[0]==='свободно'?3:Math.max(1,Math.log2(r[3]+2)-2)), sw = wts.reduce((a,b)=>a+b,0);
      let cx = x0; U.text(g,'адреса растут →',x0,y-10,{size:11,color:c.soft});
      rows.forEach((r,i)=>{ const w = (x1-x0)*wts[i]/sw;
        g.fillStyle = r[0]==='свободно' ? c.paper : r[0].startsWith('PSP') ? c.swash : i%2 ? U.hatch(g,c.pen,6) : c.wash;
        g.fillRect(cx,y,w,hh*.55); g.strokeStyle=c.ink; g.lineWidth=1.3; g.strokeRect(cx,y,w,hh*.55);
        if (r[0]==='свободно'){ g.strokeStyle=c.soft; g.beginPath(); for (let k=0;k<6;k++){ g.moveTo(cx+w/2-6,y+k*hh*.09); g.lineTo(cx+w/2+6,y+(k+.5)*hh*.09); } g.stroke(); }
        g.save(); g.translate(cx+w/2,y+hh*.55/2); if (w<70) g.rotate(-Math.PI/2); U.text(g,r[0].split(' ')[0],0,4,{size:12,align:'center',w:600}); g.restore();
        U.text(g,hx(r[1],4)+':'+hx(r[2],4),cx+2,y+hh*.55+14+(i%2)*14,{size:10,kind:'mono',color:c.soft});
        cx += w; });
      U.text(g, com ? 'CS = DS = SS = ES = '+hx(P,4)+'h' : `CS = ${hx(rows[3][1],4)}h, SS = ${hx(rows[1][1],4)}h, DS → сначала PSP, после mov ds,ax = ${hx(rows[2][1],4)}h`, x0, H-6, {size:12, kind:'mono', color:c.pen});
    }
    return draw;
  }
});

/* 7. Регистры и адресация */
add({
  id:'vms7', title:'Регистры 8086 и адрес «сегмент:смещение»', src:'Зубков, гл. 2; лабы 2–3',
  theory:`<div class="tbl"><table><tr><th>Группа</th><th>Регистры</th><th>Типичная роль</th></tr>
  <tr><td>Общего назначения (16 бит, делятся на H и L)</td><td>AX, BX, CX, DX</td><td>AX — аккумулятор (MUL, DIV, INT); BX — база; CX — счётчик (LOOP); DX — данные, старшая часть при MUL/DIV, номер порта</td></tr>
  <tr><td>Индексные</td><td>SI, DI</td><td>источник и приёмник в строковых командах, индексы</td></tr>
  <tr><td>Указатели</td><td>SP, BP, IP</td><td>вершина стека, база кадра, адрес следующей команды</td></tr>
  <tr><td>Сегментные</td><td>CS, DS, SS, ES</td><td>код, данные, стек, дополнительный</td></tr>
  <tr><td>Флаги</td><td>CF ZF SF OF PF AF DF IF TF</td><td>перенос, ноль, знак, переполнение, чётность…</td></tr></table></div>
  <p>Шина адреса 8086 — 20 бит (1 МБ), а регистры 16-битные. Поэтому адрес задаётся парой <b>сегмент:смещение</b>:</p>
  <div class="f">физический адрес = сегмент · 16 + смещение<small>то есть сегмент сдвигается на одну шестнадцатеричную цифру влево; сегмент начинается с границы параграфа (16 байт) и не длиннее 64 КБ</small></div>
  <p><b>Способы адресации:</b> регистровая <code>mov ax,bx</code>; непосредственная <code>mov ax,5</code>; прямая <code>mov ax,num</code>; косвенная <code>mov al,[bx]</code>; по базе <code>[bx+4]</code>; индексная <code>[si+mess]</code>; базово-индексная <code>[bx+si+2]</code>.</p>`,
  predict:{q:'Какой физический адрес у пары 1234:0010?', opts:['12350h','12440h','1244h'], a:0,
    why:'1234h · 16 = 12340h, плюс 0010h = 12350h. Ошибка «12440h» — сдвинули смещение вместо сегмента.'},
  flap:`<p><b>B800:00A0.</b> B800h·16 = B8000h; + 00A0h = <b>B80A0h</b>. Это начало третьей строки текстового экрана: каждая строка 80 символов × 2 байта = 160 = A0h байт.</p>
  <p>Один и тот же физический адрес можно записать многими парами: B80A:0000, B800:00A0, B7FA:0100 — всё это B80A0h.</p>`,
  figCap:'Слева — регистр AX, разрезанный на AH и AL. Справа — сложение «сегмент со сдвигом + смещение».',
  try:'Впиши AX = 4C00 — это AH = 4Ch, функция завершения программы.',
  ch:{q:'Найдите физический адрес для пары B800:00A0 (ответ в hex).', ph:'например 12345h', check:s=>U.hex(s)===0xB80A0, ans:'B80A0h', hint:'B800h·16 = B8000h.'},
  fig(el){
    const ax = h('input',{class:'txt',id:'vms7-ax',value:'0941',style:'width:6em','aria-label':'AX hex'});
    const sg = h('input',{class:'txt',id:'vms7-sg',value:'1234',style:'width:6em','aria-label':'Сегмент hex'});
    const of = h('input',{class:'txt',id:'vms7-of',value:'0010',style:'width:6em','aria-label':'Смещение hex'});
    [ax,sg,of].forEach(i=>i.addEventListener('input',()=>draw()));
    const r1 = h('div',{class:'readout',style:'font-size:15px'}), r2 = h('div',{class:'readout',style:'font-size:16px;white-space:pre'});
    el.append(h('div',{class:'row'}, h('label',{for:'vms7-ax'},'AX ='), ax, h('span',{},'h')), r1,
      h('div',{class:'row'}, h('label',{for:'vms7-sg'},'сегмент'), sg, h('label',{for:'vms7-of'},'смещение'), of), r2);
    function draw(){
      const A = U.hex(ax.value);
      if (!isFinite(A) || A>0xFFFF) r1.innerHTML = '<span class="bad">AX — до FFFF.</span>';
      else { const b = bin(A,16); r1.innerHTML = `<span style="color:var(--stamp)">AH = ${hx(A>>8,2)}h</span> │ <span style="color:var(--pen)">AL = ${hx(A&255,2)}h</span><br><span style="color:var(--stamp)">${b.slice(0,4)} ${b.slice(4,8)}</span> │ <span style="color:var(--pen)">${b.slice(8,12)} ${b.slice(12)}</span><br>AX = ${A}₁₀ · AL как символ: «${A&255?esc(String.fromCharCode(A&255)):'∅'}»${(A>>8)===0x09?' · AH = 09h — вывод строки':''}${(A>>8)===0x4C?' · AH = 4Ch — завершение программы':''}${(A>>8)===0x01?' · AH = 01h — ввод символа':''}`; }
      const S = U.hex(sg.value), O = U.hex(of.value);
      if (!isFinite(S)||!isFinite(O)||S>0xFFFF||O>0xFFFF){ r2.innerHTML = '<span class="bad">Сегмент и смещение — hex до FFFF.</span>'; return; }
      const P = S*16+O, alt = [];
      for (const k of [1,0x10,0x100]){ if (O>=16*k) alt.push(`${hx(S+k,4)}:${hx(O-16*k,4)}`); else if (S>=k && O+16*k<=0xFFFF) alt.push(`${hx(S-k,4)}:${hx(O+16*k,4)}`); }
      r2.innerHTML = `  ${hx(S,4)}<span style="color:var(--ink-soft)">0</span>   ← сегмент · 16\n+  ${hx(O,4)}   ← смещение\n────────\n  <span class="hot">${hx(P & 0xFFFFF,5)}h</span>${P>0xFFFFF?'  (за 1 МБ — перенос теряется, «заворот» адреса)':''}\n\n<span style="color:var(--ink-soft);font-size:13px">тот же адрес: ${alt.join(', ')}</span>`;
    }
    return draw;
  }
});

/* 8. Ввод и вывод числа (лаба 3) */
add({
  id:'vms8', title:'Ввод и вывод числа: ASCII, MUL, DIV и стек', src:'Лаб. работа 3',
  theory:`<p>С клавиатуры приходят не цифры, а их <b>ASCII-коды</b>: '0' = 30h = 48, …, '9' = 39h = 57; Enter = 0Dh = 13. Набрали 1234 — в программу попадёт 31h 32h 33h 34h.</p>
  <p><b>Ввод числа:</b> для каждой клавиши цифра = код − '0', число = число·10 + цифра. На Enter — стоп.</p>
  <p><b>Вывод числа:</b> делим на 10, остатки — цифры справа налево. Чтобы напечатать их в правильном порядке, кладём в <b>стек</b> (PUSH), а потом достаём (POP): стек работает по принципу «последним пришёл — первым ушёл».</p>
  <div class="tbl"><table><tr><th>Команда</th><th>Что делает (16 бит)</th></tr>
  <tr><td><code>mul si</code></td><td>DX:AX = AX · SI</td></tr>
  <tr><td><code>div si</code></td><td>AX = DX:AX / SI, DX = остаток. Поэтому DX перед делением обнуляют</td></tr>
  <tr><td><code>cmp a,b</code> + <code>jz/jnz/jg…</code></td><td>сравнить (вычесть без записи) и перейти по флагам</td></tr>
  <tr><td><code>loop метка</code></td><td>CX = CX − 1; если CX ≠ 0 — переход</td></tr>
  <tr><td><code>int 10h</code>, AH = 06h / 02h</td><td>прокрутка (очистка) окна / курсор в DH:DL</td></tr></table></div>`,
  predict:{q:'Пользователь нажал клавишу «7». Что окажется в AL после <code>mov ah,01h / int 21h</code>?', opts:['07h','37h','70h'], a:1,
    why:'Функция 01h возвращает ASCII-код символа. Код «7» = 30h + 7 = 37h = 55. Поэтому дальше идёт sub al,\'0\'.'},
  flap:`<p><b>Пропущенные строки заготовки:</b></p>
  <pre class="asm">  mov ax,dan        ; загружаем начало сегмента данных
  mov ds,ax         ; (в DS нельзя напрямую записать константу)
  ...
  mov ah,01h        ; задержка до нажатия клавиши
  int 21h
  mov ah,4ch        ; завершение программы
  int 21h</pre>
  <p><b>Адрес num (п. 3.4):</b> num — первая переменная сегмента dan, её смещение 0000h, полный адрес DS:0000.</p>
  <p><b>Рамка псевдографикой (CP866):</b> ╔ C9h, ═ CDh, ╗ BBh, ║ BAh, ╚ C8h, ╝ BCh. Например, верх: <code>mov dl,0C9h / mov ah,02h / int 21h</code>, затем в цикле CDh.</p>
  <p><b>Ловушка:</b> 16-битный DI вмещает максимум 65535. Ввели 70000 — получится 70000 − 65536 = 4464, флагов никто не проверяет.</p>`,
  figCap:'Пошаговый прогон фрагментов «ввод числа» и «вывод числа» из лабы. Светится выполняемая строка, справа — регистры и стек.',
  try:'Нажимай «Шаг» и следи, как DI растёт: 1 → 12 → 123 → 1234.',
  ch:{q:'Пользователь ввёл 70000 и нажал Enter. Какое число окажется в переменной num (dw)?', check:s=>U.near(s,4464,0), ans:'4464', hint:'Регистр 16-битный: всё, что больше 65535, «заворачивается». Проверь на рисунке.'},
  fig(el){
    const CODE = [['in','@aa: mov ah,01h'],['in','     int 21h        ; AL = код клавиши'],['cmp','     cmp al,13'],['cmp','     jz  a1'],['sub','     sub al,\'0\''],['sub','     xor ah,ah'],['sub','     mov cx,ax'],['mul','     mov ax,di'],['mul','     mul si         ; DX:AX = AX·10'],['add','     add ax,cx'],['add','     mov di,ax'],['add','     jmp @aa'],['num','a1:  mov num,di'],['init','     mov ax,num / mov cx,0'],['div','a:   mov dx,0'],['div','     div si'],['push','     add dx,\'0\''],['push','     push dx'],['push','     inc cx'],['chk','     cmp ax,0'],['chk','     jnz a'],['pop','aa:  pop dx'],['pop','     mov ah,02h / int 21h'],['pop','     loop aa']];
    const inp = h('input',{class:'txt',id:'vms8-in',value:'1234',style:'width:8em','aria-label':'Что вводит пользователь'});
    let steps = [], k = 0;
    const build = () => {
      const s = inp.value.replace(/\D/g,'').slice(0,7) || '0'; steps = []; let di = 0, typed = '';
      const R = (o) => ({AL:'—',DI:di,AX:'—',DX:'—',CX:'—',num:'?',stack:[],scr:typed, ...o});
      for (const ch of s){
        const al = ch.charCodeAt(0); typed += ch;
        steps.push({tag:'in', note:`Нажата «${ch}»: AL = ${hx(al,2)}h = ${al}`, ...R({AL:hx(al,2)+'h'})});
        steps.push({tag:'cmp', note:`AL ≠ 13 — это не Enter, продолжаем`, ...R({AL:hx(al,2)+'h'})});
        const d = al-48; steps.push({tag:'sub', note:`AL − '0' = ${al} − 48 = ${d}, CX = ${d}`, ...R({AL:hx(d,2)+'h',CX:d})});
        const p = di*10, lo = p & 0xFFFF, hi = p>>>16; steps.push({tag:'mul', note:`AX = DI·10 = ${di}·10 = ${p}${hi?` → не влезло: DX = ${hi}, AX = ${lo}`:''}`, ...R({AX:lo,DX:hi,CX:d})});
        di = (lo+d) & 0xFFFF; steps.push({tag:'add', note:`AX + CX = ${lo} + ${d}${lo+d>0xFFFF?' (перенос потерян)':''} → DI = ${di}`, ...R({AX:di,CX:d})});
      }
      typed += '↵';
      steps.push({tag:'cmp', note:'Нажат Enter: AL = 0Dh = 13 → jz a1', ...R({AL:'0Dh'})});
      steps.push({tag:'num', note:`num = DI = ${di}`, ...R({num:di})});
      let ax = di, cx = 0; const st = [];
      steps.push({tag:'init', note:`Вывод: AX = num = ${ax}, CX = 0`, ...R({num:di,AX:ax,CX:0})});
      do { const q = Math.floor(ax/10), r = ax%10;
        steps.push({tag:'div', note:`DX:AX / 10 → AX = ${q}, остаток DX = ${r}`, ...R({num:di,AX:q,DX:r,CX:cx,stack:[...st]})});
        ax = q; st.push(String(r)); cx++;
        steps.push({tag:'push', note:`DX + '0' = ${hx(48+r,2)}h («${r}») → в стек, CX = ${cx}`, ...R({num:di,AX:ax,DX:hx(48+r,2)+'h',CX:cx,stack:[...st]})});
        steps.push({tag:'chk', note: ax ? `AX = ${ax} ≠ 0 → снова делим` : 'AX = 0 → все цифры в стеке', ...R({num:di,AX:ax,CX:cx,stack:[...st]})});
      } while (ax);
      let shown = '';
      while (st.length){ const c = st.pop(); shown += c; cx--;
        steps.push({tag:'pop', note:`POP → «${c}» на экран, CX = ${cx}${cx?'':' → loop закончен'}`, ...R({num:di,AX:0,DX:hx(48+(+c),2)+'h',CX:cx,stack:[...st],out:shown})}); }
      k = 0;
    };
    const code = h('pre',{class:'asm',style:'font-size:12px'}), regs = h('div',{class:'readout'});
    el.append(h('div',{class:'row'}, h('label',{for:'vms8-in'},'Ввод:'), inp, U.btn('Шаг ▶',()=>{ if (k<steps.length-1) k++; draw(); },'pri'), U.btn('В конец',()=>{ k=steps.length-1; draw(); }), U.btn('Сначала',()=>{ k=0; draw(); })), code, regs);
    inp.addEventListener('input',()=>{ build(); draw(); });
    build();
    function draw(){
      const s = steps[k];
      code.innerHTML = CODE.map(([t,l])=>`<span style="display:block;${t===s.tag?'background:var(--pen-wash);border-left:3px solid var(--glow);margin-left:-12px;padding-left:9px;font-weight:600':''}">${esc(l)}</span>`).join('');
      const stack = s.stack.length ? s.stack.slice().reverse().map((v,i)=>`<span style="display:inline-block;border:1.5px solid var(--ink);padding:0 8px;margin-right:4px;${i===0?'border-color:var(--glow)':''}">${v}</span>`).join('') : '<span style="color:var(--ink-soft)">пуст</span>';
      regs.innerHTML = `<div style="margin-bottom:6px">Шаг ${k+1}/${steps.length}: <b>${s.note}</b></div>AL = ${s.AL} · CX = ${s.CX} · DI = <span class="hot">${s.DI}</span> · AX = ${s.AX} · DX = ${s.DX} · num = ${s.num}<br>стек (вершина слева): ${stack}<br>экран: ${esc(s.scr)}${s.out?'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hot">'+s.out+'</span>':''}`;
    }
    return draw;
  }
});

/* 9. Атрибут символа */
const CGA = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];
const CN = ['чёрный','синий','зелёный','бирюзовый','красный','фиолетовый','коричневый','светло-серый','тёмно-серый','голубой','светло-зелёный','светло-бирюзовый','светло-красный','розовый','жёлтый','белый'];
add({
  id:'vms9', title:'Текстовый режим и INT 10h: атрибут символа', src:'Лаб. работы 3–4',
  theory:`<p>Текстовый режим 80×25: видеопамять с адреса <b>B800:0000</b>, на каждую позицию 2 байта — код символа и <b>атрибут</b>.</p>
  <div class="f" style="font-family:var(--f-mono);font-style:normal;font-size:15px">бит 7 &nbsp;│ 6 5 4 &nbsp;│ 3 &nbsp;│ 2 1 0<br>мигание │ фон RGB │ яркость │ символ RGB</div>
  <div class="tbl"><table><tr><th>INT 10h, AH</th><th>Функция</th></tr>
  <tr><td>00h</td><td>установить видеорежим (AL = номер; 03h — текст 80×25)</td></tr>
  <tr><td>02h / 03h</td><td>установить / прочитать курсор: BH — страница, DH — строка, DL — столбец</td></tr>
  <tr><td>06h / 07h</td><td>прокрутка окна вверх / вниз; AL = 0 — очистка, BH — атрибут, CX и DX — углы</td></tr>
  <tr><td>09h</td><td>символ AL с атрибутом BL, CX раз; курсор <b>не</b> двигает</td></tr>
  <tr><td>0Ah / 0Eh</td><td>символ без атрибута / телетайп (с продвижением курсора)</td></tr>
  <tr><td>13h</td><td>вывод строки ES:BP длиной CX</td></tr></table></div>
  <p>В графическом режиме BL — это <b>цвет</b> точек символа; если бит 7 = 1, цвет накладывается через XOR. <code>INT 29h</code> — быстрый вывод символа AL (есть в лабе 4).</p>`,
  predict:{q:'Атрибут 1Eh — это…', opts:['жёлтый текст на синем фоне','синий текст на жёлтом фоне','мигающий красный текст'], a:0,
    why:'1Eh = 0001 1110: мигания нет, фон 001 — синий, яркость 1 и цвет 110 — вместе 1110 = 14, жёлтый. Старшая тетрада — фон, младшая — текст.'},
  flap:`<p><b>Для лабы 4:</b> группа и ФИО — зелёным, дата и место рождения — красным. В текстовом режиме: <code>mov bl,0Ah</code> (светло-зелёный на чёрном) и <code>mov bl,0Ch</code> (светло-красный). В графическом режиме BL — просто номер цвета: 2 или 0Ah — зелёный, 4 или 0Ch — красный.</p>
  <pre class="asm">  mov ah,09h      ; символ с атрибутом
  mov al,'A'
  mov bh,0        ; страница
  mov bl,0Ah      ; светло-зелёный на чёрном
  mov cx,1        ; один раз
  int 10h</pre>
  <p>Атрибут <b>0F0h</b> из лабы 4 = 1111 0000: мигание, белый (светло-серый) фон, чёрный символ — «мигающая инверсия».</p>`,
  figCap:'Байт атрибута. Щёлкай биты или палитру — экран внизу покажет, как это выглядело бы на мониторе.',
  try:'Собери атрибут для зелёного текста на чёрном фоне и посмотри на hex.',
  ch:{q:'Какой байт атрибута даёт светло-зелёный текст на чёрном фоне без мигания? (hex)', ph:'например 1Eh', check:s=>U.hex(s)===0x0A, ans:'0Ah', hint:'Фон чёрный = 000, яркость 1, зелёный = 010.'},
  fig(el){
    let at = 0x1E;
    const names = ['мигание','фон R','фон G','фон B','яркость','R','G','B'];
    const bits = h('div',{class:'row',style:'gap:4px'});
    const btns = names.map((n,i)=>{ const b = h('button',{type:'button',class:'btn',style:'width:56px;padding:4px 0;box-shadow:none;font-size:12px;line-height:1.2'}); b.onclick = () => { at ^= 1<<(7-i); draw(); }; return b; });
    bits.append(...btns);
    const fg = h('div',{class:'row',style:'gap:3px'}), bg = h('div',{class:'row',style:'gap:3px'});
    CGA.forEach((c,i)=>fg.append(h('button',{type:'button',title:CN[i],'aria-label':'текст: '+CN[i],style:`width:24px;height:24px;border:1.5px solid var(--ink);background:${c};cursor:pointer`,onclick:()=>{ at = (at&0xF0)|i; draw(); }})));
    CGA.slice(0,8).forEach((c,i)=>bg.append(h('button',{type:'button',title:CN[i],'aria-label':'фон: '+CN[i],style:`width:24px;height:24px;border:1.5px solid var(--ink);background:${c};cursor:pointer`,onclick:()=>{ at = (at&0x8F)|(i<<4); draw(); }})));
    const scr = h('div',{style:'background:#000;padding:14px;border-radius:8px;font:16px/1.5 var(--f-mono);border:10px solid #2b2b2b;overflow-x:auto;white-space:pre'});
    const info = h('div',{class:'readout'});
    el.append(bits, h('div',{class:'row'}, h('span',{style:'width:4.5em;color:var(--ink-soft)'},'текст'), fg), h('div',{class:'row'}, h('span',{style:'width:4.5em;color:var(--ink-soft)'},'фон'), bg), scr, info);
    function draw(){
      btns.forEach((b,i)=>{ const on = (at>>(7-i))&1; b.innerHTML = `${on}<br>${names[i]}`; b.setAttribute('aria-pressed',!!on); });
      const f = at&15, b = (at>>4)&7, bl = at>>7;
      scr.innerHTML = `<span style="color:#AAAAAA">C:\\TASM&gt;lab4.com</span>\n<span class="${bl?'blink':''}" style="color:${CGA[f]};background:${CGA[b]}"> Группа ИВТ-21  Иванов Иван Иванович </span>\n<span style="color:#AAAAAA">_</span>`;
      info.innerHTML = `атрибут = ${bin(at,8).slice(0,4)} ${bin(at,8).slice(4)} = <span class="hot">${hx(at,2)}h</span><br>текст: ${CN[f]} (${f}) · фон: ${CN[b]} (${b})${bl?' · <b>мигает</b>':''}<br><code>mov bl,${at>0x9F?'0':''}${hx(at,2)}h</code>`;
    }
    return draw;
  }
});

/* 10. Видеорежимы VGA и SVGA */
const MODES = [
  [640,480,'2','VGA',0x11],[640,480,'16','VGA',0x12],[320,200,'256','VGA',0x13],
  [640,480,'16','SVGA',null],[800,600,'16','SVGA',0x102],[1024,768,'16','SVGA',0x104],[1280,1024,'16','SVGA',0x106],
  [640,480,'256','SVGA',0x101],[800,600,'256','SVGA',0x103],[1024,768,'256','SVGA',0x105],[1280,1024,'256','SVGA',0x107],
  [640,480,'32K','SVGA',0x110],[800,600,'32K','SVGA',0x113],[1024,768,'32K','SVGA',0x116],[1280,1024,'32K','SVGA',0x119],
  [640,480,'64K','SVGA',0x111],[800,600,'64K','SVGA',0x114],[1024,768,'64K','SVGA',0x117],[1280,1024,'64K','SVGA',0x11A],
  [640,480,'16M','SVGA',0x112],[800,600,'16M','SVGA',0x115],[1024,768,'16M','SVGA',0x118],[1280,1024,'16M','SVGA',0x11B]];
const BPP = {'2':1,'16':4,'256':8,'32K':16,'64K':16,'16M':24};
add({
  id:'vms10', title:'Графические видеорежимы VGA и SVGA (VESA)', src:'Лаб. работа 4; Зубков, гл. 5',
  theory:`<p><b>VGA</b>-режимы включаются функцией BIOS <code>INT 10h, AH = 00h</code>: 11h — 640×480, 2 цвета; 12h — 640×480, 16 цветов; 13h — 320×200, 256 цветов. Текст — режим 03h.</p>
  <p>Режимы <b>SVGA</b> стандартизованы VESA: <code>AX = 4F02h</code>, <code>BX</code> = номер режима (100h и выше). Ровно это делает код из лабы: <code>mov ah,4Fh / mov al,02 / mov bx,116h</code>. Если режим установлен, BIOS возвращает <b>AX = 004Fh</b> — это и надо проверять, чтобы объяснить «нереализуемые» режимы.</p>
  <div class="f">объём кадра = ширина × высота × бит на точку / 8<small>2 цвета — 1 бит, 16 — 4, 256 — 8, 32K — 15 (хранится 16), 64K — 16, 16M — 24 (часто хранится как 32)</small></div>
  <p>Реальный режим видит видеопамять через <b>окно</b> 64 КБ по адресу A000:0000. Большой кадр приходится переключать по банкам (функция VESA 4F05h). Если кадр больше всей памяти видеокарты, режим не установится.</p>
  <p>Стандартного VESA-номера для 640×480×16 нет — это обычный VGA-режим 12h.</p>`,
  predict:{q:'Сколько видеопамяти нужно для кадра 1024×768 при 64K цветов?', opts:['около 768 КБ','около 1,5 МБ','около 3 МБ'], a:1,
    why:'64K цветов = 2¹⁶, то есть 2 байта на точку. 1024·768·2 = 1 572 864 байта = 1,5 МБ = 24 окна по 64 КБ.'},
  flap:`<p><b>Почему часть режимов «не идёт» (п. 8 лабы).</b> В DOSBox по умолчанию эмулируется S3 с 2 МБ видеопамяти. Режимы, которым нужно больше (например, 1280×1024×64K = 2,5 МБ, 1024×768×16M = 2,25–3 МБ), функция 4F02h отклоняет: AX ≠ 004Fh, экран не меняется. Рекомендация: увеличить память в настройках эмулятора (параметр <code>vmemsize</code> в dosbox.conf, если версия его поддерживает) или выбрать режим с меньшим разрешением или числом цветов.</p>
  <p><b>Перебор режимов массивом, циклом и процедурой (п. 5, 7 лабы):</b></p>
  <pre class="asm">.model tiny
.code
org 100h
start:  mov si, offset modes
next:   mov bx, [si]
        cmp bx, 0FFFFh        ; конец списка
        je  done
        mov ax, 4F02h         ; VESA: установить режим BX
        int 10h
        cmp ax, 004Fh         ; 004Fh = режим установлен
        jne skip
        mov dh, 5
        mov di, offset line1
        mov bl, 0Ah           ; зелёный
        call print
        mov dh, 7
        mov di, offset line2
        mov bl, 0Ch           ; красный
        call print
        mov ah, 0             ; ждём клавишу
        int 16h
skip:   add si, 2
        jmp next
done:   mov ax, 0003h         ; вернуть текстовый режим
        int 10h
        ret

print   proc                  ; DS:DI — строка до '$', DH — строка, BL — цвет
        mov dl, 2
        mov bh, 0
        mov cx, 1
p1:     mov ah, 02h           ; курсор в DH:DL
        int 10h
        mov al, [di]
        cmp al, '$'
        je  p2
        mov ah, 09h           ; символ AL цветом BL
        int 10h
        inc di
        inc dl
        jmp p1
p2:     ret
print   endp

modes dw 0011h,0012h,0013h,0102h,0104h,0106h
      dw 0101h,0103h,0105h,0107h,0110h,0113h,0116h,0119h
      dw 0111h,0114h,0117h,011Ah,0112h,0115h,0118h,011Bh,0FFFFh
line1 db 'Gruppa XXXX  Familiya Imya Otchestvo$'
line2 db '01.01.2005  g. Gorod$'
end start</pre>
  <p>Строки — латиницей: в графическом режиме BIOS рисует символы своим шрифтом, где русских букв может не быть.</p>`,
  figCap:'Выбранный режим в масштабе относительно 1280×1024. Справа — сколько памяти нужно и сколько окон по 64 КБ это занимает.',
  try:'Пройди по столбцу 1280×1024: на 64K и 16M цветов кадр уже не помещается в 2 МБ.',
  ch:{q:'Какой номер VESA у режима 800×600, 256 цветов? (hex)', ph:'например 1ABh', check:s=>U.hex(s)===0x103, ans:'103h', hint:'Посмотри в таблице на рисунке.'},
  fig(el){
    let sel = 13;
    const tbl = h('div',{class:'tbl',style:'max-height:260px;overflow:auto'});
    const cv = U.canvas(el, .5);
    const info = h('div',{class:'readout'}), code = h('pre',{class:'asm'});
    el.append(info, code, tbl);
    function draw(){
      const [w,hh,cols,kind,num] = MODES[sel], bpp = BPP[cols], bytes = w*hh*bpp/8, win = Math.ceil(bytes/65536), c = U.col();
      tbl.innerHTML = `<table><tr><th>Режим</th><th>Цвета</th><th>Карта</th><th>Номер</th><th>Память</th></tr>${MODES.map(([a,b,cl,k,n],i)=>{ const by = a*b*BPP[cl]/8; return `<tr style="cursor:pointer;${i===sel?'background:var(--pen-wash);font-weight:600':''}" data-i="${i}" tabindex="0"><td>${a}×${b}</td><td>${cl}</td><td>${k}</td><td class="mono">${n==null?'—':hx(n,n>255?3:2)+'h'}</td><td class="mono" style="color:${by>2*1048576?'var(--bad)':'inherit'}">${by>=1048576?U.fmt(by/1048576,2)+' МБ':Math.round(by/1024)+' КБ'}</td></tr>`; }).join('')}</table>`;
      tbl.querySelectorAll('tr[data-i]').forEach(tr=>{ const f = ()=>{ sel = +tr.dataset.i; draw(); }; tr.onclick = f; tr.onkeydown = e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); f(); } }; });
      const {g,W,H} = cv.fit(), s = Math.min((W*.55)/1280, (H-20)/1024);
      g.strokeStyle = c.soft; g.setLineDash([4,4]); g.lineWidth=1; g.strokeRect(10,10,1280*s,1024*s); g.setLineDash([]);
      U.text(g,'1280×1024',12+1280*s-4,24,{size:10,align:'right',color:c.soft,kind:'mono'});
      g.save(); g.shadowColor = c.glow; g.shadowBlur = 12; g.fillStyle = U.hatch(g,c.pen,Math.max(3,8-bpp/4)); g.fillRect(10,10,w*s,hh*s); g.restore();
      g.strokeStyle = c.ink; g.lineWidth = 2; g.strokeRect(10,10,w*s,hh*s);
      U.text(g,`${w}×${hh}`,16,28,{size:14,w:600});
      // окна по 64 КБ
      const gx = 30+1280*s, gw = W-gx-10, per = Math.max(1,Math.ceil(Math.sqrt(48))), cs = Math.min(gw/8, 16);
      U.text(g,'окна по 64 КБ:',gx,20,{size:11,color:c.soft});
      const lim = 32; // 2 МБ
      for (let i=0;i<Math.max(win,lim);i++){ const x = gx+(i%8)*cs, y = 28+Math.floor(i/8)*cs; if (y+cs>H) break;
        g.strokeStyle = i<lim ? c.edge : c.bad; g.lineWidth=1; g.strokeRect(x,y,cs-2,cs-2);
        if (i<win){ g.fillStyle = i<lim ? c.pen : c.bad; g.fillRect(x+1,y+1,cs-4,cs-4); } }
      const ok2 = bytes<=2*1048576;
      info.innerHTML = `${w}×${hh}, ${cols} цветов, ${kind} → ${bpp} бит на точку<br>кадр = ${w}·${hh}·${bpp}/8 = <b>${bytes.toLocaleString('ru-RU')}</b> байт ≈ ${bytes>=1048576?U.fmt(bytes/1048576,2)+' МБ':Math.round(bytes/1024)+' КБ'} = <span class="hot">${win} окон по 64 КБ</span><br>в 256 КБ стандартной VGA: ${bytes<=262144?'<span class="good">да</span>':'<span class="bad">нет</span>'} · в 2 МБ (DOSBox по умолчанию): ${ok2?'<span class="good">да</span>':'<span class="bad">нет — 4F02h вернёт ошибку</span>'}`;
      code.textContent = num==null ? '; стандартного VESA-номера нет — используйте VGA 12h\n    mov ax, 0012h\n    int 10h' : num<0x100 ? `    mov ah, 00h      ; BIOS: установить видеорежим\n    mov al, ${hx(num,2)}h\n    int 10h` : `    mov ax, 4F02h    ; VESA: установить режим\n    mov bx, ${hx(num,3)}h\n    int 10h\n    cmp ax, 004Fh    ; 004Fh — успех`;
    }
    return draw;
  }
});

/* Дополнительные задачи: практическая №1 (раздел 4 и индивидуальные задания) и лабы 1–4 */
const P = (n, q, check, ans, hint, ph) => ({n, q, check, ans, hint, ph});
const dec = t => s => U.near(s.replace('−','-'), t, 0);
const hexEq = v => s => U.hex(s) === v;
const bits = b => s => s.replace(/\s/g,'') === b;
const flat = s => s.trim().toLowerCase().replace(/\s+/g,' ');
const MORE = {
  vms1: [
    P('пр. 4.1','Переведите число F0A9₁₆ в десятичную систему.', dec(61609), '61609', 'F·16³ + 0·16² + A·16 + 9 = 15·4096 + 160 + 9.'),
    P('пр. 4.16','Число 135ₓ из системы с основанием x перевели в десятичную и получили 59₁₀. Найдите основание x.', dec(6), 'x = 6', 'x² + 3x + 5 = 59.'),
    P('пр. 4.12','В какой системе счисления выполнено действие 127 + 2 = 131?', dec(8), 'в восьмеричной', 'Запиши обе части в развёрнутой форме с основанием q и реши уравнение. Или заметь: 7 + 2 дало «1 и перенос».')],
  vms2: [
    P('пр. 4.10','Запишите число 1110010111₂ в шестнадцатеричной системе.', s=>normNum(s)==='397', '397₁₆ (и 1627₈)', 'Тетрады от правого края: 11 | 1001 | 0111.'),
    P('пр. 4.6','Найдите сумму 505C₁₆ + 5A6₁₆ в шестнадцатеричной системе.', hexEq(0x5602), '5602₁₆', 'Складывай столбиком справа: C + 6 = 18 = 12₁₆, пиши 2, перенос 1.'),
    P('Зад. 3, в. 1','Переведите 585₁₀ в двоично-десятичный код.', s=>s.replace(/\s/g,'').replace(/^0+/,'')==='10110000101', '0101 1000 0101', 'Каждую десятичную цифру замени её тетрадой: 5 → 0101, 8 → 1000.', 'тетрады через пробел')],
  vms3: [
    P('пр. 4.17','Обратный код числа X имеет значение 11100111. Найдите X в десятичной системе.', dec(-24), '−24', 'Старший бит 1 — число отрицательное. Для обратного кода просто инвертируй все биты.'),
    P('Зад. 5, в. 1','Запишите дополнительный код числа −34 в однобайтном формате.', bits('11011110'), '11011110', '34 = 00100010 → инверсия → +1.', '8 бит'),
    P('Зад. 6, в. 1','Дополнительный код целого числа — 10011000. Запишите число в десятичной системе.', dec(-104), '−104', 'Вычти 1, инвертируй, переведи, поставь минус.')],
  vms4: [
    P('Лаб. 1','В каталоге лежат F1.BAT, F2.BAT, NF1.BAT, A1.TXT, 1.TXT, B12.DOC. Сколько файлов покажет команда <code>DIR ?1.*</code>?', s=>U.near(s, ['F1.BAT','F2.BAT','NF1.BAT','A1.TXT','1.TXT','B12.DOC'].filter(n=>dosMatch('?1.*',n)).length, 0), '2 (F1.BAT и A1.TXT)', '? в середине имени — ровно один символ, потом обязательно «1» и конец имени.'),
    P('Лаб. 1','Какой командой в DOSBox подключить папку C:\\TASM как диск C:?', s=>/^mount c:? c:\\tasm\\?$/.test(flat(s)), '<code>mount c C:\\TASM</code>', 'Команда DOSBox: mount, буква диска, путь.', 'команда'),
    P('Лаб. 1','Какой комбинацией клавиш в Norton Commander отсортировать панель по размеру файлов?', s=>/^ctrl\s*[-+]?\s*f6$/.test(flat(s)), 'Ctrl+F6', 'Ctrl+F3 — по имени, Ctrl+F4 — по расширению, Ctrl+F5 — по времени…', 'например Ctrl+F1')],
  vms5: [
    P('Лаб. 1','В основном файле проверки идут по возрастанию: <code>if errorlevel 1 goto n1</code>, потом 2, потом 3. Пользователь нажал «3» в <code>choice /c:123</code>. Какой по номеру файл nfK.bat запустится?', dec(1), 'nf1.bat — проверка на 1 сработала первой, ведь 3 ≥ 1', 'IF ERRORLEVEL n истинно при коде ≥ n.'),
    P('Лаб. 1','Какой командой запустить nf2.bat из основного файла так, чтобы после него выполнение основного файла продолжилось?', s=>/^call nf2(\.bat)?$/.test(flat(s)), '<code>call nf2.bat</code>', 'Если просто написать имя BAT-файла, управление в основной файл не вернётся.', 'команда'),
    P('Лаб. 1','Какой символ в начале строки пакетного файла запрещает выводить на экран саму эту команду?', s=>s.trim()==='@', '@', 'Его ставят перед echo off.', 'символ')],
  vms6: [
    P('Лаб. 2','Сколько байт занимает PSP? (в десятичной системе)', dec(256), '256 байт = 100h', 'Вспомни, зачем в COM-файле ORG 100h.'),
    P('Лаб. 2','Какой командой собрать COM-файл из privet.obj?', s=>/^tlink(\s*\/[xt])*\s*\/t(\s*\/[xt])*\s+privet(\.obj)?$/.test(flat(s)), '<code>tlink /t privet</code> (в методичке <code>tlink /x /t privet</code>)', 'Та же программа, что делает EXE, но с ключом.', 'команда'),
    P('Лаб. 2','В варианте 3 (COM) команды до строки mess занимают 12 байт. По какому смещению лежит mess? (hex)', hexEq(0x10C), '010Ch', 'Код начинается с 0100h.', 'например 0123h')],
  vms7: [
    P('Зубков, гл. 2','AX = 4C00h. Чему равен AH? (hex)', hexEq(0x4C), '4Ch — функция завершения программы', 'AH — старший байт AX.'),
    P('Зубков, гл. 2','Найдите физический адрес пары 0040:006C. (hex)', hexEq(0x46C), '0046Ch — там BIOS хранит счётчик таймера', '0040h·16 + 006Ch.'),
    P('Зубков, гл. 2','Сегментный регистр содержит 1000h. Какое нужно смещение, чтобы обратиться к физическому адресу 12345h? (hex)', hexEq(0x2345), '2345h', '12345h − 1000h·16.')],
  vms8: [
    P('Лаб. 3','Какой ASCII-код у символа «9»? (hex)', hexEq(0x39), '39h = 57', '«0» = 30h, коды цифр идут подряд.'),
    P('Лаб. 3','DX = 0, AX = 1234, SI = 10. Что окажется в DX после <code>div si</code>?', dec(4), '4 — остаток, AX = 123', 'DIV кладёт частное в AX, остаток в DX.'),
    P('Лаб. 3','Каким кодом (CP866) выводится левый верхний угол двойной рамки ╔? (hex)', hexEq(0xC9), 'C9h', 'Двойные линии: ═ CDh, ║ BAh, углы C9h, BBh, C8h, BCh.')],
  vms9: [
    P('Лаб. 3–4','Байт атрибута: мигающий белый (яркий) текст на красном фоне. (hex)', hexEq(0xCF), 'CFh = 1 100 1111', 'Бит 7 — мигание, биты 6–4 — фон (красный = 100), младшая тетрада — белый = 1111.'),
    P('Лаб. 3–4','Сколько байт видеопамяти занимает один экран текстового режима 80×25?', dec(4000), '4000', 'На каждую позицию 2 байта: символ и атрибут.'),
    P('Лаб. 3–4','По какому смещению от B800:0000 лежит код символа в строке 2, столбце 5 (счёт с нуля)? (hex)', hexEq(0x14A), '014Ah = 330', '(строка·80 + столбец)·2.')],
  vms10: [
    P('Лаб. 4','Какой номер VESA у режима 1280×1024, 256 цветов? (hex)', hexEq(0x107), '107h', 'Смотри таблицу режимов на рисунке.'),
    P('Лаб. 4','Сколько окон по 64 КБ нужно, чтобы покрыть кадр 800×600 при 256 цветах?', dec(8), '8 (кадр 480 000 байт)', '800·600·1 байт / 65 536, округлить вверх.'),
    P('Лаб. 4','Какое значение вернёт BIOS в AX, если функция VESA 4F02h успешно установила режим? (hex)', hexEq(0x4F), '004Fh', 'AL = 4Fh — функция поддерживается, AH = 00h — успешно.')]
};
for (const L of BOOKS.vms.lessons) L.more = MORE[L.id];

/* Истории, с которых начинается каждая глава */
const HOOK = {
  vms1:{eye:'Проверь прямо сейчас', title:'Почему 0,1 + 0,2 ≠ 0,3',
    html:`<p>Твой браузер только что сложил два числа:</p><p class="big">0.1 + 0.2 = ${0.1+0.2}</p>
    <p>Это не ошибка JavaScript, так считает почти любой язык. В двоичной системе 0,1 — бесконечная дробь 0,000110011001100…₂, и компьютер хранит её с округлением. Перевод дробной части умножением на 2 из этой главы показывает, откуда берётся бесконечный хвост.</p>`},
  vms2:{eye:'Шестнадцатеричная вокруг тебя', title:'Цвет #FF8800 — это три байта',
    html:`<p><span class="swatch" style="background:#FF8800"></span>Каждый цвет на сайтах записан в шестнадцатеричной системе: FF = 255 красного, 88 = 136 зелёного, 00 синего. Две hex-цифры — ровно один байт, две тетрады.</p>
    <p class="big">#FF8800 = 255, 136, 0</p>
    <p>А часы реального времени на материнской плате ПК (CMOS) по умолчанию хранят время в двоично-десятичном коде: 23 часа лежат там как 0010 0011.</p>`},
  vms3:{eye:'Pac-Man, уровень 256', title:'Игру сломал один переполненный байт',
    html:`<p>В Pac-Man (1980) номер уровня хранится в одном байте. На 256-м уровне счётчик переполняется, и правая половина экрана превращается в мешанину символов. Пройти этот уровень невозможно.</p>
    <p>В 2015 году американская авиаслужба FAA предупредила, что генераторы Boeing 787 могут отключиться после 248 дней непрерывной работы: 32-битный знаковый счётчик сотых долей секунды переполняется.</p>
    <p class="big">2³¹ / 100 / 86 400 ≈ 248,6 дня</p><p>Дополнительный код и флаг OF из этой главы — ровно про это.</p>`},
  vms4:{eye:'Откуда взялось «C:»', title:'Куда делись диски A: и B:?',
    html:`<p>Первые IBM PC загружались с дискет, и буквы A: и B: достались двум дисководам. Жёсткий диск появился позже и получил первую свободную букву.</p>
    <p class="big">C: — третья буква по наследству</p>
    <p>Так осталось и в Windows. Имена 8.3 тоже живы: короткое имя папки Program Files выглядит как <code>PROGRA~1</code>, и Windows до сих пор создаёт такие имена для старых программ.</p>`},
  vms5:{eye:'AUTOEXEC.BAT', title:'Пакетный файл, который запускался при каждом включении',
    html:`<p>При загрузке DOS сама выполняла файл AUTOEXEC.BAT. В него прописывали драйвер мыши, пути к программам и стартовое меню: «1 — Norton Commander, 2 — игры, 3 — выход».</p>
    <p class="big">CHOICE + IF ERRORLEVEL = меню 90-х</p>
    <p>Меню из лабы 1 — ровно такое же. Если перепутать порядок проверок ERRORLEVEL, любая клавиша запустит первый пункт. Это видно на рисунке справа.</p>`},
  vms6:{eye:'Наследство CP/M', title:'Почему COM-программа начинается с 100h',
    html:`<p>Формат COM достался DOS от CP/M — операционной системы 1970-х. В CP/M программы загружались с адреса 0100h, а первые 256 байт занимала служебная область.</p>
    <p class="big">ORG 100h — привет из 1974 года</p>
    <p>DOS сохранила этот порядок, чтобы старые программы было проще переносить. Так появились PSP и строчка ORG 100h в твоей лабе 2.</p>`},
  vms7:{eye:'640 КБ и линия A20', title:'Адрес, который выходит за мегабайт',
    html:`<p>Сегмент:смещение даёт 20-битный адрес, то есть 1 МБ памяти. Но посчитай самый большой адрес:</p>
    <p class="big">FFFF:FFFF = FFFF0h + FFFFh = 10FFEFh</p>
    <p>Это на 65 520 байт дальше мегабайта. На 8086 такой адрес «заворачивался» в начало памяти, и некоторые программы на это рассчитывали. Поэтому в IBM AT добавили переключатель 21-й адресной линии — знаменитый A20 gate. А программам из всего мегабайта доставались 640 КБ: выше лежали видеопамять (A000h, B800h) и BIOS.</p>`},
  vms8:{eye:'ASCII, 1963', title:'Таблица, в которой продуман каждый бит',
    html:`<p>Цифры в ASCII начинаются с 30h, поэтому младшая тетрада кода — это сама цифра: «7» = 37h. Отсюда трюк <code>sub al,'0'</code> из лабы 3.</p>
    <p class="big">'A' = 41h, 'a' = 61h</p>
    <p>Заглавная и строчная буквы отличаются одним битом (20h). Регистр меняется одной командой <code>xor al,20h</code>. Таблицу проектировали так, чтобы процессору было удобно.</p>`},
  vms9:{eye:'Текстовый режим', title:'Как в 80×25 рисовали целые интерфейсы',
    html:`<p>Norton Commander, Turbo Pascal и сотни программ DOS рисовали окна, рамки и тени одними символами псевдографики и атрибутами цвета. Весь экран — 4000 байт по адресу B800:0000.</p>
    <p class="big">80 × 25 × 2 = 4000 байт</p>
    <p>Программы писали в эту память напрямую, в обход BIOS: так было в разы быстрее. А бит мигания можно переключить в «яркий фон» функцией INT 10h, AX = 1003h и получить 16 цветов фона.</p>`},
  vms10:{eye:'Режим 13h', title:'Почему игры 90-х любили 320×200',
    html:`<p>320 × 200 точек по одному байту — это 64 000 байт. Кадр целиком помещается в один сегмент A000h, и банки переключать не нужно. Адрес точки считается одной формулой.</p>
    <p class="big">адрес = y · 320 + x</p>
    <p>Поэтому множество игр начала 90-х работали в режиме 13h или его вариантах. А пиксели там не квадратные: на мониторе 4:3 каждая точка в 1,2 раза выше, чем шире.</p>`}
};
for (const L of BOOKS.vms.lessons) L.hook = HOOK[L.id];

/* Обложка: экран DOSBox, на котором собирается программа из лабы 2 */
BOOKS.vms.cover = el => {
  const S = [
    ['Z:\\>','mount c c:\\tasm'], ['','Drive C is mounted as local directory c:\\tasm\\\n'],
    ['Z:\\>','c:'],
    ['C:\\>','tasm privet'], ['','Turbo Assembler  Version 4.1  Copyright (c) 1988, 1996 Borland International\n\nAssembling file:   privet.ASM\nError messages:    None\nWarning messages:  None\nPasses:            1\n'],
    ['C:\\>','tlink privet'], ['','Turbo Link  Version 7.1.30.1. Copyright (c) 1987, 1996 Borland International\n'],
    ['C:\\>','privet'], ['','Privet\n']];
  const full = S.map(([p,t]) => p ? p+t+'\n' : t).join('') + 'C:\\>';
  const pre = h('pre',{class:'crt','aria-label':'Экран DOSBox: сборка и запуск программы из лабы 2'});
  pre.style.minHeight = (full.split('\n').length + .5)*1.45 + 'em';
  el.append(pre, h('p',{class:'cap'},'Так выглядит лаба 2 в DOSBox: монтирование, tasm, tlink, запуск.'));
  const cursor = '<span class="cur">&nbsp;</span>';
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches){ pre.innerHTML = esc(full) + cursor; return null; }
  let shown = '', i = 0, j = -1;
  const tick = () => {
    if (!el.isConnected) return;
    if (i >= S.length){ pre.innerHTML = esc(shown + 'C:\\>') + cursor; return; }
    const [p, t] = S[i];
    if (!p){ shown += t; i++; pre.innerHTML = esc(shown) + cursor; return setTimeout(tick, 380); }
    if (j < 0){ shown += p; j = 0; pre.innerHTML = esc(shown) + cursor; return setTimeout(tick, 500); }
    if (j < t.length){ shown += t[j++]; pre.innerHTML = esc(shown) + cursor; return setTimeout(tick, 55 + Math.random()*70); }
    shown += '\n'; i++; j = -1; pre.innerHTML = esc(shown) + cursor; setTimeout(tick, 260);
  };
  setTimeout(tick, 400);
  return null;
};
})();
