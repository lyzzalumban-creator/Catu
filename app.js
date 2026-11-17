'use strict';
/* ============ util ============ */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let _n=0;const uid=()=>'i'+Date.now().toString(36)+(_n++).toString(36)+Math.random().toString(36).slice(2,5);
const LS_KEY='kantong.v1';
const safeStorage=(()=>{const mem={};let ok=false;try{localStorage.setItem('__t','1');localStorage.removeItem('__t');ok=true}catch(e){}
  return{get(k){try{return ok?localStorage.getItem(k):(k in mem?mem[k]:null)}catch(e){return k in mem?mem[k]:null}},
         set(k,v){try{if(ok){localStorage.setItem(k,v);return}}catch(e){}mem[k]=v}}})();
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseD=s=>{const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])};
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return ymd(d)};
const MON=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MONS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const DAYS=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const fmtDate=s=>{const d=parseD(s);return d.getDate()+' '+MONS[d.getMonth()]+' '+d.getFullYear()};
const relDate=s=>{const t=today();if(s===t)return'Hari ini';if(s===addDays(t,-1))return'Kemarin';const d=parseD(s);return DAYS[d.getDay()]+', '+fmtDate(s)};
const nf=new Intl.NumberFormat('id-ID');
const rp=n=>(n<0?'−':'')+'Rp '+nf.format(Math.abs(Math.round(n)));
const money=n=>(S&&S.settings.privacy)?'Rp ••••••':rp(n);
/* KANTONG: angka berubah bergulir (naik = hijau, turun = jingga) */
const NP={};
const mv=(k,n)=>'data-k="'+k+'" data-v="'+Math.round(n||0)+'"';
function rollTo(el,k,v,still){
  if(el._r&&NP[k]===v)return;
  if(el._r){cancelAnimationFrame(el._r);el._r=0}
  const p=NP[k];NP[k]=v;
  const fin=()=>{el.textContent=money(v);el.classList.remove('up','dn','rl')};
  if(still||p===undefined||p===v||(S&&S.settings.privacy)||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){fin();return}
  el.classList.remove('up','dn');void el.offsetWidth;el.classList.add('rl',v>p?'up':'dn');
  const dur=Math.min(1500,900+Math.log10(Math.abs(v-p)+10)*90),T0=performance.now();
  let ds=[],len=-1;
  const f=now=>{
    const x=Math.min(1,(now-T0)/dur),e=1-Math.pow(1-x,3);
    const str=money(x>=1?v:p+(v-p)*e);
    if(str.length!==len){len=str.length;el.innerHTML=str.split('').map(c=>'<i>'+c+'</i>').join('');ds=[...el.children]}
    for(let n=0;n<len;n++){const d=ds[n];
      if(d.textContent!==str[n]){d.textContent=str[n];d._t=now}
      d.classList.toggle('bl',x<1&&/\d/.test(str[n])&&now-(d._t||0)<150)}
    if(x<1)el._r=requestAnimationFrame(f);
    else{ds.forEach(d=>d.classList.remove('bl'));el._r=0;setTimeout(()=>{if(!el._r)fin()},650)}
  };
  el._r=requestAnimationFrame(f);
}
function rollAll(){document.querySelectorAll('[data-k]').forEach(el=>rollTo(el,el.dataset.k,+el.dataset.v))}
const num=v=>parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10)||0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sum=o=>{let s=0;for(const k in o)s+=o[k];return s};
const hsh=s=>{let h=7;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};

/* ============ bentuk ekspresif ============ */
const PAL=[['#283918','#DFFAC6'],['#233718','#C6F7AB'],['#1E3517','#A9F390'],['#1A3316','#88EE77'],['#163115','#63E95D'],['#142F16','#45E350'],['#132D18','#2DDC4C'],['#132B1A','#24C752'],['#12291B','#21AB57'],['#11271C','#1E8F57'],['#39181D','#FCCFD5'],['#37181B','#FAB4BC'],['#35171A','#F799A3'],['#331619','#F47F89'],['#311517','#F0656F'],['#2F1416','#EC4B55'],['#2D1315','#E8323A'],['#2B1313','#E21B21'],['#291212','#C6191C'],['#271111','#AB1717']];
const SHAPES=['cookie9','clover4','cookie6','sunny','squircle','cookie4','circle','cookie12'];
const SHP={};
function shapePath(k){
  if(SHP[k])return SHP[k];
  const cfg={circle:[1,0,0],cookie4:[4,.11,45],cookie6:[6,.085,0],cookie9:[9,.065,0],cookie12:[12,.045,0],clover4:[4,.2,45],sunny:[8,.055,0]}[k]||[1,0,0];
  let d='';const N=144;
  for(let i=0;i<N;i++){
    const t=i/N*Math.PI*2;let x,y;
    if(k==='squircle'){const c=Math.cos(t),s=Math.sin(t);x=50+48*Math.sign(c)*Math.pow(Math.abs(c),.5);y=50+48*Math.sign(s)*Math.pow(Math.abs(s),.5)}
    else{const r=48/(1+cfg[1])*(1+cfg[1]*Math.cos(cfg[0]*(t-cfg[2]*Math.PI/180)));x=50+r*Math.cos(t);y=50+r*Math.sin(t)}
    d+=(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);
  }
  return SHP[k]=d+'Z';
}
const shapeIconC=(content,c,oc,shape,size)=>`<span class="shi" style="--sz:${size}px;--c:${c};--oc:${oc}"><svg class="shp" viewBox="0 0 100 100" aria-hidden="true"><path d="${shapePath('squircle')}"/></svg><b>${content}</b></span>`;
const shapeIcon=(content,col,shape,size)=>{const p=PAL[((col%PAL.length)+PAL.length)%PAL.length];return shapeIconC(content,p[0],p[1],shape,size)};
const catCol=c=>c&&c.col!=null?+c.col:hsh(c?c.id:'x')%PAL.length;
const catShape=c=>SHAPES[hsh((c?c.id:'x')+'s')%SHAPES.length];
/* stiker kategori: latar = jenis (hijau pemasukan, merah pengeluaran), cincin tipis = warna pilihan sendiri */
const TYPE_BG={inc:'#1E4A24',exp:'#52201F'},TYPE_FG={inc:'#A8F552',exp:'#FF8A8A'};
const catHex=c=>c&&hexOk(c.color)?c.color:PAL[catCol(c)%PAL.length][1];
const ringFit=h=>{const n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,L=(.2126*r+.7152*g+.0722*b)/255;if(L>=.38)return h;const m=Math.min(.6,(.38-L)*1.6+.15),f=x=>Math.round(x+(255-x)*m).toString(16).padStart(2,'0');return'#'+f(r)+f(g)+f(b)};
/* latar tonal: warna kategori dibaurkan ke permukaan gelap supaya ikon tidak menyilaukan */
const catTone=h=>{const n=parseInt(h.slice(1),16),m=.26,f=(x,b)=>Math.round(b+(x-b)*m).toString(16).padStart(2,'0');return'#'+f(n>>16&255,20)+f(n>>8&255,20)+f(n&255,24)};
const stkBadge=()=>!!(S&&S.settings&&S.settings.stk==='badge');
/* warna latar + cincin untuk stiker (dua gaya: 'bg' = latar jenis + cincin pilihan, 'badge' = warna kategori + lencana panah) */
const stkVars=c=>{const t=c&&c.t==='inc'?'inc':'exp';return stkBadge()?[catHex(c),'transparent']:[TYPE_BG[t],ringFit(catHex(c))]};
const BDG_UP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5 20 18H4z"/></svg>',BDG_DN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18.5 4 6h16z"/></svg>';
const catIconX=(content,c,size)=>{const t=c&&c.t==='inc'?'inc':'exp';
  if(stkBadge())return`<span class="shi bd rg" style="--sz:${size}px;--c:${catTone(catHex(c))};--oc:${catHex(c)};--rc:${ringFit(catHex(c))}"><svg class="shp" viewBox="0 0 100 100" aria-hidden="true"><path d="${shapePath('squircle')}"/></svg><b>${content}</b><i class="bdg ${t}">${t==='inc'?BDG_UP:BDG_DN}</i></span>`;
  return`<span class="shi rg" style="--sz:${size}px;--c:${TYPE_BG[t]};--oc:${TYPE_FG[t]};--rc:${ringFit(catHex(c))}"><svg class="shp" viewBox="0 0 100 100" aria-hidden="true"><path d="${shapePath('squircle')}"/></svg><b>${content}</b></span>`};
const catIcon=(c,size)=>catIconX(c?esc(c.icon):'📦',c,size);
/* warna sub-kategori (opsional, c.sc[nama]); kosong = ikut warna kategori */
const subC=(c,sn)=>c&&sn&&c.sc&&/^#[0-9a-f]{6}$/i.test(c.sc[sn]||'')?Object.assign({},c,{color:c.sc[sn]}):c;
const txIcon=(c,t,size)=>{const cs=subC(c,t.sub);return c&&t.sub&&c.si&&c.si[t.sub]?catIconX(esc(c.si[t.sub]),cs,size):catIconX(c?esc(c.icon):'📦',cs,size)};
const hexOk=h=>/^#[0-9a-f]{6}$/i.test(h||'');
function darkTint(h){const n=parseInt(h.slice(1),16),f=x=>Math.round(x*.22+10).toString(16).padStart(2,'0');return'#'+f(n>>16&255)+f(n>>8&255)+f(n&255)}
const colIcon=(ch,hex,shape,size)=>shapeIconC(ch,darkTint(hex),hex,shape,size);
const COLS=['#A8F552','#5BE49B','#2DD4BF','#38BDF8','#3B82F6','#818CF8','#A78BFA','#E879F9','#F472B6','#FB7185','#F87171','#FB923C','#FBBF24','#FDE047','#D4D4D8'];
const hsl2hex=(h,sa,l)=>{sa/=100;l/=100;const k=n=>(n+h/30)%12,a=sa*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase()};
const hexHue=h=>{const n=parseInt(h.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;const x=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return(x*60+360)%360};
const hexInk=h=>{const n=parseInt(h.slice(1),16);return((n>>16&255)*.299+(n>>8&255)*.587+(n&255)*.114)>150?'#141416':'#fff'};
/* pemilih warna: pratinjau + tiga slider (rona, kejenuhan, kecerahan) + kode hex + 50 warna siap pakai */
const hex2hsl=h=>{const n=parseInt(h.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/2;
  const sa=d===0?0:d/(1-Math.abs(2*l-1));return[Math.round(hexHue(h)),Math.round(sa*100),Math.round(l*100)]};
/* kolom warna menerima: #RRGGBB, RRGGBB, #abc, rgb(r,g,b) / "r g b", hsl(h,s,l), dan nama warna (Indonesia atau Inggris) */
const COLOR_NAMES={'merah':'#EF4444','red':'#EF4444','oranye':'#FB923C','jingga':'#FB923C','orange':'#FB923C','kuning':'#FBBF24','yellow':'#FBBF24','lime':'#A8F552','hijau muda':'#A8F552','hijau':'#22C55E','green':'#22C55E','mint':'#5BE49B','toska':'#2DD4BF','teal':'#2DD4BF','biru muda':'#38BDF8','cyan':'#38BDF8','biru':'#3B82F6','blue':'#3B82F6','biru tua':'#1E3A8A','navy':'#1E3A8A','nila':'#818CF8','indigo':'#818CF8','ungu':'#A78BFA','purple':'#A78BFA','violet':'#A78BFA','magenta':'#E879F9','pink':'#F472B6','merah muda':'#F472B6','marun':'#7F1D1D','maroon':'#7F1D1D','cokelat':'#A16207','coklat':'#A16207','brown':'#A16207','krem':'#D6B88A','emas':'#D4AF37','gold':'#D4AF37','perak':'#A1A1AA','silver':'#A1A1AA','abu':'#71717A','abu-abu':'#71717A','gray':'#71717A','grey':'#71717A','hitam':'#27272A','black':'#27272A','putih':'#FAFAFA','white':'#FAFAFA','zaitun':'#4D7C0F','olive':'#4D7C0F'};
const COLOR_HINTS=['Merah','Oranye','Kuning','Lime','Hijau','Mint','Toska','Biru muda','Biru','Biru tua','Nila','Ungu','Magenta','Pink','Marun','Cokelat','Krem','Emas','Perak','Abu-abu','Hitam','Putih','Zaitun'];
function parseColor(t){
  const v=String(t||'').trim().toLowerCase().replace(/\s+/g,' ');if(!v)return null;
  if(COLOR_NAMES[v])return COLOR_NAMES[v];
  let m=v.match(/^#?([0-9a-f]{6})$/);if(m)return'#'+m[1].toUpperCase();
  m=v.match(/^#?([0-9a-f]{3})$/);if(m)return'#'+m[1].split('').map(x=>x+x).join('').toUpperCase();
  m=v.match(/^(?:rgb\s*\(?)?\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*\)?$/);
  if(m){const a=[m[1],m[2],m[3]].map(Number);if(a.every(n=>n<=255))return'#'+a.map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}
  m=v.match(/^hsl\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?\s*\)$/);if(m)return hsl2hex(+m[1]%360,Math.min(100,+m[2]),Math.min(100,+m[3]));
  return null}
const HP_HUES=[2,25,46,75,140,172,200,228,265,325];
const CAT_AUTO=[2,205,46,145,265,25,172,325,228,75];
const HP_TONES=[[75,82],[85,60],[78,47],[65,32]];
const HP_NEUTRAL=['#FAFAFA','#D4D4D8','#A1A1AA','#71717A','#3F3F46','#D6B88A','#A16207','#78350F','#4D7C0F','#1E3A8A'];
const HP_GRID=HP_TONES.reduce((a,t)=>a.concat(HP_HUES.map(h=>hsl2hex(h,t[0],t[1]))),[]).concat(HP_NEUTRAL);
const HP_LMIN=8,HP_LMAX=94;
function colorField(cur){
  const hex=hexOk(cur)?cur.toUpperCase():COLS[0],hsl=hex2hsl(hex);
  const pos={h:hsl[0]/360,s:hsl[1]/100,l:(hsl[2]-HP_LMIN)/(HP_LMAX-HP_LMIN)},nowv={h:hsl[0],s:hsl[1],l:hsl[2]},mx={h:360,s:100,l:HP_LMAX},mn={h:0,s:0,l:HP_LMIN};
  const sl=(k,lab,cls)=>`<div class="hp-row"><label>${lab}</label><div class="hp-sl ${cls}" data-sk="${k}" role="slider" aria-label="${lab}" aria-valuemin="${mn[k]}" aria-valuemax="${mx[k]}" aria-valuenow="${nowv[k]}"><i class="hp-th" style="left:${(clamp(pos[k],0,1)*100).toFixed(2)}%;background:${hex}"></i></div></div>`;
  return`<div class="f"><span>Warna</span><div class="hp" data-hex="${hex}" data-h="${hsl[0]}" data-s="${hsl[1]}" data-l="${hsl[2]}" style="--hh:${hsl[0]};--ss:${hsl[1]}%;--ll:${hsl[2]}%">
    <div class="hp-top"><button type="button" class="hp-pv" data-action="hpcopy" style="background:${hex};color:${hexInk(hex)}" aria-label="Salin kode warna"><b style="color:${hexInk(hex)}">${hex}</b><span class="hp-cp">Salin</span></button><input class="hp-hx" value="${hex}" maxlength="30" list="hp_nm" placeholder="Kode atau nama" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Kode atau nama warna" data-input="hphex"><datalist id="hp_nm">${COLOR_HINTS.map(n=>`<option value="${n}">`).join('')}</datalist></div>
    <small class="hp-tip">Ketik kode warna atau namanya, misalnya merah.</small>
    <div class="hp-pre">${HP_GRID.map(c=>`<button type="button" class="hp-s ${hex===c?'on':''}" style="background:${c}" data-action="pcol" data-arg="${c}" aria-label="Warna ${c}"></button>`).join('')}</div>
    <button type="button" class="hp-tg" data-action="hptog" aria-expanded="false">Atur manual<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="hp-adv"><div class="hp-adv-in">${sl('h','Rona','hue')}${sl('s','Kejenuhan','sat')}${sl('l','Kecerahan','lig')}</div></div>
  </div><input type="hidden" name="color" value="${esc(cur||'')}"></div>`;
}
/* terapkan keadaan HSL di dataset ke semua bagian pemilih */
function hpApply(root,from){
  const h=+root.dataset.h,sa=+root.dataset.s,l=+root.dataset.l,hex=root.dataset.xh||hsl2hex(h,sa,l);
  root.dataset.hex=hex;root.style.setProperty('--hh',h);root.style.setProperty('--ss',sa+'%');root.style.setProperty('--ll',l+'%');
  const pv=root.querySelector('.hp-pv'),b=pv.querySelector('b');pv.style.background=hex;b.textContent=hex;b.style.color=hexInk(hex);
  const pos={h:h/360,s:sa/100,l:(l-HP_LMIN)/(HP_LMAX-HP_LMIN)};
  root.querySelectorAll('.hp-sl').forEach(el=>{const k=el.dataset.sk,t=el.querySelector('.hp-th');t.style.left=(clamp(pos[k],0,1)*100).toFixed(2)+'%';t.style.background=hex;
    el.setAttribute('aria-valuenow',k==='h'?h:k==='s'?sa:l);el.setAttribute('aria-valuemin',k==='l'?HP_LMIN:0);el.setAttribute('aria-valuemax',k==='h'?360:k==='s'?100:HP_LMAX)});
  const hx=root.querySelector('.hp-hx');if(hx&&from!=='hex')hx.value=hex;
  root.querySelectorAll('.hp-s').forEach(x=>x.classList.toggle('on',x.dataset.arg===hex));
  const hid=root.parentElement.querySelector('[name=color]');if(hid)hid.value=hex;
  document.querySelectorAll('#subEd .sub-row').forEach(subSync);
  if($('#catPrev'))updateCatPrev();
}
function hpSet(root,hex,from){hex=hex.toUpperCase();const v=hex2hsl(hex);root.dataset.h=v[0];root.dataset.s=v[1];root.dataset.l=v[2];root.dataset.xh=hex;hpApply(root,from)}
let HPD=null;
const hpMove=e=>{if(!HPD)return;const r=HPD.getBoundingClientRect(),p=clamp((e.clientX-r.left)/r.width,0,1),k=HPD.dataset.sk,root=HPD.closest('.hp');
  delete root.dataset.xh;root.dataset[k]=k==='h'?Math.round(p*360):k==='s'?Math.round(p*100):Math.round(HP_LMIN+p*(HP_LMAX-HP_LMIN));hpApply(root)};
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.hp-sl');if(!t)return;HPD=t;e.preventDefault();hpMove(e)});
document.addEventListener('pointermove',e=>{if(HPD){e.preventDefault();hpMove(e)}},{passive:false});
document.addEventListener('pointerup',()=>{HPD=null});document.addEventListener('pointercancel',()=>{HPD=null});
/* dompet: hanya garis menyala berwarna (tanpa huruf/foto) */
const accIcon=(a,size)=>{const c=a?walCol(a):'#7C7C88',q=a?purOf(a):null;return`<i class="acc-bar${q?' pu':''}" style="--c:${c};${q?`--pc:${purCol(q)};`:''}--h:${Math.round((size||40)*.9)}px;--w:${(size||40)>=56?5:4}px" aria-hidden="true"></i>`};

/* ============ ikon garis ============ */
const sv=(p,w)=>`<svg width="${w||20}" height="${w||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={
 eye:sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
 eyeOff:sv('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
 x:sv('<path d="M6 6l12 12M18 6L6 18"/>',18),
 back:sv('<path d="M15 5l-7 7 7 7"/>',18),
 fwd:sv('<path d="M9 5l7 7-7 7"/>',18),
 down:sv('<path d="M6 9l6 6 6-6"/>',14),
 plus:sv('<path d="M12 5v14M5 12h14"/>'),
 swap:sv('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),
 card:sv('<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6 15h4"/>'),
 bolt:sv('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
 visa:'<svg viewBox="0 0 64 22" width="50" height="18"><text x="0" y="17" font-family="Georgia,serif" font-style="italic" font-weight="800" font-size="21" fill="currentColor" letter-spacing="1">VISA</text></svg>',
 mc:'<svg viewBox="0 0 40 24" width="42" height="25"><circle cx="15" cy="12" r="10" fill="#EB5757" opacity=".92"/><circle cx="25" cy="12" r="10" fill="#F2A33A" opacity=".88"/></svg>'
};

/* ============ data & akuntansi ============ */
let S=null,D={bal:{},debt:{}};
const ui={view:'home',wlSel:'',range:30,sheet:null,flow:null,pay:null,gest:null,xfer:null,form:null,backup:null,accd:null,amt:{expr:''},
  mutN:40,mutF:'all',mutDay:{},mutSel:'',calFull:false,anSel:'',anDrawn:'',mg:'wallet',sync:'local',an:{y:new Date().getFullYear(),m:new Date().getMonth(),type:'exp'}};

function effect(t,bal,debt,sg){
  const a=t.amt*sg;
  switch(t.t){
    case'exp':if(t.acc in bal)bal[t.acc]-=a;else if(t.acc in debt)debt[t.acc]+=a;break;
    case'inc':if(t.acc in bal)bal[t.acc]+=a;break;
    case'pay':if(t.acc in bal)bal[t.acc]-=a;if(t.to in debt)debt[t.to]-=a;break;
    case'xfer':if(t.acc in bal)bal[t.acc]-=a;if(t.to in bal)bal[t.to]+=a;break;
    case'gcard':if(t.acc in debt)debt[t.acc]+=a;break;
    case'gin':if(t.acc in bal)bal[t.acc]+=a;break;
    case'gfee':break;
  }
}
function initBD(){const bal={},debt={};S.wallets.forEach(w=>bal[w.id]=w.open||0);S.cards.forEach(c=>debt[c.id]=0);return{bal,debt}}
function recalc(){const o=initBD();S.tx.forEach(t=>effect(t,o.bal,o.debt,1));D=o}
function series(){
  const txs=S.tx.map((t,i)=>({t,i})).sort((a,b)=>a.t.d<b.t.d?-1:a.t.d>b.t.d?1:a.i-b.i).map(x=>x.t);
  const o=initBD(),end=today();let start=txs.length&&txs[0].d<end?txs[0].d:addDays(end,-1);
  const out=[];let i=0;
  for(let d=start;d<=end;d=addDays(d,1)){
    while(i<txs.length&&txs[i].d<=d){effect(txs[i],o.bal,o.debt,1);i++}
    out.push({d,a:sum(o.bal),l:sum(o.debt)});
  }
  if(out.length<2)out.unshift({d:addDays(end,-1),a:out[0].a,l:out[0].l});
  return out;
}
function cardInfo(c){
  const pool=c.pool?S.pools.find(p=>p.id===c.pool):null;
  const mine=D.debt[c.id]||0;let limit=pool?pool.limit:(c.limit||0),other=0;
  if(pool)S.cards.forEach(k=>{if(k.pool===pool.id&&k.id!==c.id)other+=D.debt[k.id]||0});
  return{pool:pool||null,limit,mine,other,used:mine+other,remain:limit-mine-other};
}
const accById=id=>S.wallets.find(x=>x.id===id)||S.cards.find(x=>x.id===id)||null;
/* nama dompet kembar (mis. 'Darurat' di dua bank) otomatis ditampilkan sebagai 'Darurat · Bank' */
const wLbl=w=>{const k=(w.name||'').trim().toLowerCase();if(!S.wallets.some(x=>x!==w&&(x.name||'').trim().toLowerCase()===k))return w.name;const g=S.groups.find(x=>x.id===w.g);return g?w.name+' · '+g.name:w.name};
/* fungsi dompet: 'both' (semua), 'trx' (hanya pemasukan/pengeluaran), 'xfer' (hanya transfer) */
const wUse=w=>w&&(w.use==='trx'||w.use==='xfer')?w.use:'both';
const canTrx=w=>wUse(w)!=='xfer',canXfer=w=>wUse(w)!=='trx';
const USE_LBL={both:'Semua',trx:'Transaksi saja',xfer:'Transfer saja'};
const accName=id=>{const a=accById(id);return a?(S.wallets.includes(a)?wLbl(a):a.name):''};
const isCard=id=>S.cards.some(c=>c.id===id);
function defaultCats(){return[
 {id:'c_makan',t:'exp',name:'Makan',icon:'🍜',col:5,subs:['Sarapan','Makan siang','Makan malam','Kopi & jajan']},
 {id:'c_belanja',t:'exp',name:'Belanja',icon:'🛒',col:4,subs:['Kebutuhan harian','Pakaian','Online']},
 {id:'c_transport',t:'exp',name:'Transport',icon:'🚌',col:2,subs:['Bensin','Ojek online','Parkir']},
 {id:'c_tagihan',t:'exp',name:'Tagihan',icon:'💡',col:6,subs:['Listrik','Internet','Pulsa']},
 {id:'c_rumah',t:'exp',name:'Rumah',icon:'🏠',col:1,subs:['Sewa','Perabot']},
 {id:'c_hiburan',t:'exp',name:'Hiburan',icon:'🎮',col:3,subs:['Streaming','Game','Nonton']},
 {id:'c_sehat',t:'exp',name:'Kesehatan',icon:'💊',col:7,subs:['Obat','Dokter']},
 {id:'c_didik',t:'exp',name:'Pendidikan',icon:'📚',col:9,subs:[]},
 {id:'c_sosial',t:'exp',name:'Sosial',icon:'🎁',col:8,subs:['Hadiah','Donasi']},
 {id:'c_admin',t:'exp',name:'Admin',icon:'🧾',col:0,subs:['Biaya admin','Gestun','Bunga']},
 {id:'c_lain',t:'exp',name:'Lainnya',icon:'📦',col:9,subs:[]},
 {id:'i_gaji',t:'inc',name:'Gaji',icon:'💼',col:0,subs:[]},
 {id:'i_bonus',t:'inc',name:'Bonus',icon:'🎯',col:6,subs:[]},
 {id:'i_usaha',t:'inc',name:'Usaha',icon:'🏪',col:1,subs:[]},
 {id:'i_invest',t:'inc',name:'Investasi',icon:'📈',col:8,subs:[]},
 {id:'i_lain',t:'inc',name:'Lainnya',icon:'✨',col:3,subs:[]}
]}
function adminCatId(){
  let c=S.cats.find(x=>x.id==='c_admin')||S.cats.find(x=>x.t==='exp'&&x.name.toLowerCase()==='admin');
  if(!c){c={id:'c_admin',t:'exp',name:'Admin',icon:'🧾',col:0,subs:['Biaya admin','Gestun','Bunga']};S.cats.push(c)}
  return c.id;
}
function gestunTx(d,cardId,walletId,nom,fee,scheme,note){
  const link=uid(),cardAmt=scheme==='A'?nom:nom+fee,inAmt=scheme==='A'?nom-fee:nom;
  return[
    {id:uid(),d,t:'gcard',acc:cardId,amt:cardAmt,link,sch:scheme,note:note||'',cat:'',sub:''},
    {id:uid(),d,t:'gin',acc:walletId,amt:inAmt,link,sch:scheme,note:note||'',cat:'',sub:''},
    {id:uid(),d,t:'gfee',acc:'',amt:fee,link,sch:scheme,note:note||'',cat:adminCatId(),sub:'Gestun'}
  ];
}
const BLK_IDS=['chart','actions','cards','wallets','budget','tx'];
/* ============ koleksi maskot ============
   Karakter rancangan sendiri, dibuat dengan bola-dan-mata yang sama
   (bentuk badan + warna + gaya mata). Dibuka lewat "bungkus" acak:
   1 bungkus gratis tiap hari, ditambah 1 bungkus tiap 5 catatan. */
const MK_RAIN=['#FDA4AF','#FDE68A','#86EFAC','#7DD3FC','#C4B5FD','#F9A8D4'];
const MK=[
 {id:'kubus',name:'Kubus',rar:0,shape:'Cube',fill:'#A8F552',ink:'#0B1400',glow:'rgba(168,245,82,.4)',eyes:'Slant',eyeScale:1.4},
 {id:'bola',name:'Bola',rar:0,shape:'Ball',grad:['#BAE6FD','#38BDF8'],ink:'#06263A',glow:'rgba(56,189,248,.4)',eyes:'Dots',eyeScale:1.25},
 {id:'kapsul',name:'Kapsul',rar:0,shape:'Pill',grad:['#FDBA74','#F97316'],ink:'#2A1200',glow:'rgba(249,115,22,.4)',eyes:'Slant',eyeScale:1.4},
 {id:'koin',name:'Koin',rar:2,shape:'Ball',grad:['#FEF3C7','#FBBF24','#B45309'],ink:'#3B2300',glow:'rgba(251,191,36,.5)',eyes:'Dots',eyeScale:1.2},
 {id:'permata',name:'Permata',rar:2,shape:'Hexagon',grad:['#E9D5FF','#8B5CF6','#C026D3'],ink:'#FFFFFF',glow:'rgba(139,92,246,.55)',eyes:'Slant',eyeScale:1.3},
 {id:'bintang',name:'Bintang',rar:3,shape:'Star',grad:MK_RAIN,holo:1,ink:'#1B1030',glow:'rgba(255,255,255,.45)',eyes:'Dots',eyeScale:1.05},
 {id:'pelangi',name:'Pelangi',rar:3,shape:'Ball',grad:MK_RAIN.slice().reverse(),holo:1,ink:'#1B1030',glow:'rgba(255,255,255,.45)',eyes:'Squares',eyeScale:1.2},
 {id:'kantong',name:'Kantong',rar:0,shape:'Pocket',grad:['#93C5FD','#3B82F6'],ink:'#0B1B3A',glow:'rgba(59,130,246,.4)',eyes:'Dots',eyeScale:1.2},
 {id:'amplop',name:'Amplop',rar:0,shape:'Envelope',grad:['#FEF9C3','#FACC15'],ink:'#3B2A00',glow:'rgba(250,204,21,.4)',eyes:'Tall',eyeScale:1.3},
 {id:'celengan',name:'Celengan',rar:0,shape:'Piggy',grad:['#FBCFE8','#F472B6'],ink:'#3A0A22',glow:'rgba(244,114,182,.4)',eyes:'Tiny',eyeScale:1.5},
 {id:'tunas',name:'Tunas',rar:0,shape:'Sprout',grad:['#BBF7D0','#22C55E'],ink:'#052E16',glow:'rgba(34,197,94,.4)',eyes:'Dots',eyeScale:1.15},
 {id:'kartu',name:'Kartu',rar:0,shape:'Slab',grad:['#C7D2FE','#6366F1'],ink:'#0F1040',glow:'rgba(99,102,241,.4)',eyes:'Slant',eyeScale:1.3},
 {id:'tas',name:'Tas',rar:0,shape:'Bag',grad:['#FECACA','#EF4444'],ink:'#3A0A0A',glow:'rgba(239,68,68,.4)',eyes:'Big',eyeScale:1},
 {id:'brankas',name:'Brankas',rar:2,shape:'Safe',grad:['#F3F4F6','#9CA3AF'],ink:'#111827',glow:'rgba(156,163,175,.45)',eyes:'Squares',eyeScale:1.2},
 {id:'dompet',name:'Dompet',rar:2,shape:'Wallet',grad:['#FED7AA','#C2410C'],ink:'#2A1000',glow:'rgba(194,65,12,.4)',eyes:'Sleepy',eyeScale:1.4},
 {id:'kunci',name:'Kunci',rar:2,shape:'Key',grad:['#FEF3C7','#F59E0B'],ink:'#3B2300',glow:'rgba(245,158,11,.5)',eyes:'Tiny',eyeScale:1.6},
 {id:'jam',name:'Jam',rar:1,shape:'Clock',grad:['#A7F3D0','#10B981'],ink:'#022C22',glow:'rgba(16,185,129,.4)',eyes:'Big',eyeScale:1},
 {id:'lonceng',name:'Lonceng',rar:1,shape:'Bell',grad:['#FEF08A','#EAB308'],ink:'#3B2F00',glow:'rgba(234,179,8,.45)',eyes:'Dots',eyeScale:1.2},
 {id:'toples',name:'Toples',rar:1,shape:'Jar',grad:['#CFFAFE','#06B6D4'],ink:'#042F3A',glow:'rgba(6,182,212,.4)',eyes:'Squares',eyeScale:1.2},
 {id:'buku',name:'Buku',rar:1,shape:'Book',grad:['#F5D0FE','#C026D3'],ink:'#2E0A33',glow:'rgba(192,38,211,.4)',eyes:'Slant',eyeScale:1.3},
 {id:'mahkota',name:'Mahkota',rar:1,shape:'Crown',grad:['#FECDD3','#E11D48'],ink:'#3A0414',glow:'rgba(225,29,72,.4)',eyes:'Tiny',eyeScale:1.5},
 {id:'roket',name:'Roket',rar:1,shape:'Rocket',grad:['#E0F2FE','#60A5FA'],ink:'#0B1B3A',glow:'rgba(96,165,250,.45)',eyes:'Tall',eyeScale:1.2},
 {id:'gembok',name:'Gembok',rar:1,shape:'Padlock',grad:['#CBD5E1','#475569'],ink:'#FFFFFF',glow:'rgba(100,116,139,.45)',eyes:'Sleepy',eyeScale:1.4},
 {id:'awan',name:'Awan',rar:3,shape:'Cloud',grad:MK_RAIN,holo:1,ink:'#1B1030',glow:'rgba(255,255,255,.45)',eyes:'Sleepy',eyeScale:1.3}
];
/* urut menurut kelangkaan: Umum, Langka, Holo (urutan asli dipertahankan di dalam tiap golongan) */
MK.sort((a,b)=>a.rar-b.rar);
const MK_RAR=['Umum','Tidak umum','Langka','Holo'];
const MK_RC=['#A1A1AB','#86EFAC','#8FD0FF','#F9A8D4'];
const mkChip=r=>`<span class="mk-r${r===3?' holo':''}" style="--rc:${MK_RC[r]}"><i></i>${MK_RAR[r]}</span>`;
const MK_GIFT='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1.5"/><path d="M12 8v13M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7M7.5 8a2.5 2.5 0 010-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 010 5"/></svg>';
/* UJI COBA: true = bungkus tanpa batas. Ganti jadi false untuk memakai aturan asli (1 per hari + 1 per 5 catatan). */
const MK_FREE=true;
let mkN=0;
function mascotArt(c,size,locked){
  const n='mk'+(mkN++),base=EYT_STYLES[c.eyes]||EYT_STYLES.Slant,sc=c.eyeScale||1.4,w=base.w*sc,h=base.h*sc,r=base.r*sc,g=EYT_GAP*Math.max(1,sc*.8)*EYT_R;
  const d=EYT_SHAPES[c.shape]||EYT_SHAPES.Ball;
  const defs=c.grad?`<linearGradient id="${n}" x1="0" y1="0" x2="1" y2="1">${c.grad.map((col,i)=>`<stop offset="${Math.round(i/(c.grad.length-1)*100)}%" stop-color="${col}"/>`).join('')}</linearGradient>`:'';
  if(locked)return`<svg class="mk-art" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><path d="${d}" fill="#1D1D23"/><text x="50" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="#3A3A44" font-family="sans-serif">?</text></svg>`;
  const eye=x=>`<rect x="${(x-w/2).toFixed(2)}" y="${(50-h/2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${Math.min(r,w/2,h/2).toFixed(2)}" fill="${c.ink}"/>`;
  return`<svg class="mk-art ${c.holo?'holo':''}" viewBox="0 0 100 100" width="${size}" height="${size}" style="--eyt-glow:${c.glow}" aria-hidden="true"><defs>${defs}</defs><path d="${d}" fill="${c.grad?`url(#${n})`:c.fill}"/>${eye(50-g)}${eye(50+g)}</svg>`;
}
function mkPacks(){
  /* bonus dihitung dari catatan BARU yang disimpan (pack.added), bukan dari
     jumlah transaksi: data lama tidak langsung jadi puluhan bungkus, dan
     hapus-lalu-catat-lagi tidak bisa dipakai untuk menambah bungkus. */
  if(MK_FREE)return{daily:0,bonus:0,n:1,next:0,free:true};
  const st=S.settings,daily=st.pack.day!==today()?1:0,bonus=Math.max(0,Math.floor(st.pack.added/5)-st.pack.used);
  return{daily,bonus,n:daily+bonus,next:5-(st.pack.added%5)};
}
function mkOpen(){
  const P=mkPacks(),st=S.settings;if(!P.n)return null;
  if(!P.free){if(P.daily)st.pack.day=today();else st.pack.used++}
  const r=Math.random()*100,rar=r<5?3:r<22?2:r<50?1:0,pool=MK.filter(c=>c.rar===rar),c=pool[Math.floor(Math.random()*pool.length)];
  const isNew=!st.owned.includes(c.id);if(isNew)st.owned.push(c.id);
  persist();return{c,isNew};
}
function packArt(){
  const zig=(x0,x1,y,dy,n)=>{const w=(x1-x0)/n;return Array.from({length:n},(_,i)=>`L${(x0+w*(i+1)).toFixed(1)} ${i%2?y:y+dy}`).join(' ')};
  const zigR=(x0,x1,y,dy,n)=>{const w=(x1-x0)/n;return Array.from({length:n},(_,i)=>`L${(x1-w*(i+1)).toFixed(1)} ${i%2?y:y+dy}`).join(' ')};
  const top=`M16 13 ${zig(16,104,13,-6,8)} L104 38 L16 38 Z`;
  const body=`M16 38 L104 38 L104 156 ${zigR(16,104,156,6,8)} L16 156 Z`;
  const ribs=Array.from({length:15},(_,i)=>`<rect x="${(20+i*5.6).toFixed(1)}" y="12" width="1.4" height="24" fill="#000" opacity=".22"/>`).join('');
  const spark=(x,y,r)=>`<path d="M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z" fill="#E4FFB8"/>`;
  return`<svg class="mk-pack" viewBox="0 0 120 172" width="138" aria-hidden="true"><defs>
<linearGradient id="pkg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B5718"/><stop offset=".55" stop-color="#16240A"/><stop offset="1" stop-color="#0A1004"/></linearGradient>
<linearGradient id="pkt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9FB7D"/><stop offset="1" stop-color="#6FBF1F"/></linearGradient>
<linearGradient id="pks" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="pkl"><stop offset="0" stop-color="#F4FFD6"/><stop offset=".45" stop-color="#A8F552" stop-opacity=".8"/><stop offset="1" stop-color="#A8F552" stop-opacity="0"/></radialGradient>
<radialGradient id="pke"><stop offset="0" stop-color="#A8F552" stop-opacity=".35"/><stop offset="1" stop-color="#A8F552" stop-opacity="0"/></radialGradient>
<clipPath id="pkc"><path d="${body}"/></clipPath></defs>
<g class="pk-all">
<g class="pk-body"><path d="${body}" fill="url(#pkg)" stroke="rgba(168,245,82,.6)" stroke-width="1.2" stroke-linejoin="round"/>
<g clip-path="url(#pkc)"><circle cx="60" cy="96" r="44" fill="url(#pke)"/><path class="pk-sheen" d="M22 38 L52 38 L30 156 L0 156 Z" fill="url(#pks)"/></g>
<circle cx="60" cy="96" r="30" fill="none" stroke="rgba(168,245,82,.3)" stroke-width="1" stroke-dasharray="2 4"/>
<rect x="43" y="79" width="34" height="34" rx="11" fill="#A8F552"/><rect x="51" y="90" width="5.5" height="12" rx="2.75" fill="#0B1400"/><rect x="63.5" y="90" width="5.5" height="12" rx="2.75" fill="#0B1400"/>
${spark(26,70,5)}${spark(95,118,4)}${spark(92,62,3)}
<text x="60" y="58" text-anchor="middle" font-size="10" font-weight="800" fill="#A8F552" letter-spacing="3.2" font-family="sans-serif">TEMAN</text>
<text x="60" y="144" text-anchor="middle" font-size="7.5" font-weight="700" fill="#D9F5B4" fill-opacity=".75" letter-spacing="1.6" font-family="sans-serif">BUNGKUS ACAK</text></g>
<g class="pk-top"><path d="${top}" fill="url(#pkt)" stroke="rgba(11,20,0,.35)" stroke-width="1" stroke-linejoin="round"/>${ribs}<path d="M16 38 L104 38" stroke="rgba(11,20,0,.45)" stroke-width="1" stroke-dasharray="3 2.5"/></g>
<ellipse class="pk-light" cx="60" cy="38" rx="58" ry="22" fill="url(#pkl)"/></g></svg>`;
}
function koleksiHTML(){
  const st=S.settings,M=ui.mk||{phase:'idle'},cur=MK.find(c=>c.id===st.mascotChar)||MK[0],P=mkPacks();
  let stage='';
  if(M.phase==='tearing')stage=`<div class="mk-hero tear"><div class="mk-packw">${packArt()}</div><div class="mk-sub">Membuka bungkus…</div></div>`;
  else if(M.phase==='reveal'&&M.res){const c=M.res.c;
    stage=`<div class="mk-hero reveal" style="--mk-glow:${c.glow};--rc:${MK_RC[c.rar]}"><i class="mk-rays"></i><div class="mk-pop">${mascotArt(c,112)}</div><div class="mk-name">${c.name}</div>${mkChip(c.rar)}<span class="mk-tag${M.res.isNew?' new':''}">${M.res.isNew?'Karakter baru!':'Sudah punya, coba lagi nanti'}</span><div class="mk-btns"><button class="btn acc" data-action="mk-use" data-id="${c.id}">Pakai ${c.name}</button><button class="btn" data-action="mk-done">Selesai</button></div></div>`}
  else stage=`<div class="mk-hero" style="--mk-glow:${cur.glow}"><div class="mk-float">${mascotArt(cur,104)}</div><div class="mk-name">${cur.name}</div>${mkChip(cur.rar)}
    <button class="btn acc mk-cta" data-action="mk-open" ${P.n?'':'disabled'}>${P.n?MK_GIFT:''}${P.free?'Buka bungkus':P.n?`Buka bungkus (${P.n})`:'Bungkus habis'}</button>
    <div class="mk-sub">${P.free?'Mode uji coba: bungkus tanpa batas.':P.n?(P.daily?'Bungkus harian siap dibuka.':'Bungkus dari catatanmu siap dibuka.'):`Bungkus harian lagi besok, atau ${P.next} catatan lagi.`}</div></div>`;
  const tile=c=>{const own=st.owned.includes(c.id);
    return`<button class="mk-c ${own?'':'lock'} ${st.mascotChar===c.id?'on':''}" ${own?`data-action="mk-use" data-id="${c.id}" aria-pressed="${st.mascotChar===c.id}"`:'disabled'} aria-label="${own?c.name:'Belum dimiliki, '+MK_RAR[c.rar]}">${mascotArt(c,52,!own)}<b>${own?c.name:'???'}</b></button>`};
  const groups=MK_RAR.map((n,r)=>{const L=MK.filter(c=>c.rar===r);if(!L.length)return'';const o=L.filter(c=>st.owned.includes(c.id)).length;
    return`<div class="mk-gh" style="--rc:${MK_RC[r]}"><i class="${r===3?'holo':''}"></i>${n}<em>${o}/${L.length}</em></div><div class="mk-grid">${L.map(tile).join('')}</div>`}).join('');
  const pct=Math.round(st.owned.length/MK.length*100);
  return`<div class="sh-h"><h3>Koleksi teman</h3>${closeBtn}</div>${stage}<div class="mk-prog"><div class="mk-prog-t"><span>Terkumpul</span><span><b>${st.owned.length}</b> dari ${MK.length}</span></div><div class="mk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${MK.length}" aria-valuenow="${st.owned.length}"><i style="width:${pct}%"></i></div></div>${groups}`;
}
function mkTop(){const p=$('#panel');if(p)p.scrollTop=0}
function openKoleksi(){ui.mk={phase:'idle'};ui.sheet='koleksi';renderSheet()}

function normalize(s){
  s.settings=s.settings||{};const st=s.settings;st.privacy=!!st.privacy;
  const lay=Array.isArray(st.layout)?st.layout.filter(b=>b&&BLK_IDS.includes(b.id)):[];
  BLK_IDS.forEach((id,i)=>{if(!lay.find(b=>b.id===id))lay.splice(Math.min(i,lay.length),0,{id,on:true})});
  st.layout=lay;st.collapsed=st.collapsed||{};st.anCollapsed=st.anCollapsed||{};
  st.wl=['neon','blue','graphite','rose','leather'].includes(st.wl)?st.wl:'neon';st.wlMode=st.wlMode==='remain'?'remain':'debt';st.mascot=['on','small','off'].includes(st.mascot)?st.mascot:'on';st.cardView=['stack','col','car'].includes(st.cardView==='fan'?'col':st.cardView)?(st.cardView==='fan'?'col':st.cardView):'wallet';
  st.owned=(Array.isArray(st.owned)?st.owned:[]).filter(id=>MK.some(c=>c.id===id));if(!st.owned.includes('kubus'))st.owned.unshift('kubus');
  st.mascotChar=st.owned.includes(st.mascotChar)?st.mascotChar:'kubus';st.stk=st.stk==='bg'?'bg':'badge';
  st.pack=st.pack&&typeof st.pack==='object'?{day:String(st.pack.day||''),added:Math.max(0,+st.pack.added||0),used:Math.max(0,+st.pack.used||0)}:{day:'',added:0,used:0};
  ['groups','wallets','pools','cards','cats','tx','recur','purs'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]});
  s.purs=s.purs.filter(x=>x&&x.id&&String(x.name||'').trim());
  /* peruntukan lama (teks bebas di w.p) dijadikan daftar peruntukan bernama + warna */
  s.wallets.forEach(w=>{const t=String(w.p||'').trim();delete w.p;if(!t||w.pu)return;
    let q=s.purs.find(x=>x.name.trim().toLowerCase()===t.toLowerCase());
    if(!q){q={id:'pu'+Math.random().toString(36).slice(2,9),name:t,color:COLS[(s.purs.length*3+1)%COLS.length]};s.purs.push(q)}
    w.pu=q.id});
  s.wallets.forEach(w=>{if(w.pu&&!s.purs.some(x=>x.id===w.pu))w.pu='';if(w.use!=='trx'&&w.use!=='xfer')delete w.use});
  s.recur=s.recur.filter(r=>r&&r.id&&(r.t==='exp'||r.t==='inc')&&+r.amt>0);s.recur.forEach(r=>{r.day=Math.min(31,Math.max(1,Math.round(+r.day)||1));r.amt=Math.round(+r.amt);r.last=/^\d{4}-\d{2}$/.test(r.last||'')?r.last:today().slice(0,7)});
  s.cats.forEach(c=>{if(c.budget!=null)c.budget=+c.budget>0?Math.round(+c.budget):0});
  s.cats.forEach(c=>{if(c.sc&&typeof c.sc==='object'){Object.keys(c.sc).forEach(k=>{if(!hexOk(c.sc[k])||!(c.subs||[]).includes(k))delete c.sc[k]})}else delete c.sc});
  /* kategori tanpa warna sama sekali (tanpa pilihan lama): beri warna awal yang tersebar; yang punya pilihan lama dibiarkan */
  s.cats.forEach((c,i)=>{if(hexOk(c.color)||c.col!=null)return;c.color=hsl2hex(CAT_AUTO[i%CAT_AUTO.length],82,i<CAT_AUTO.length?60:48)});
  s.cards.forEach(c=>{if(c.minPct==null)c.minPct=10;if(!c.wallet||!s.wallets.some(w=>w.id===c.wallet))c.wallet=''});
  {const g=st.gd&&typeof st.gd==='object'?st.gd:{};st.gd={cid:String(g.cid||GD_CID).trim().slice(0,200),on:!!g.on,ok:!!g.ok,last:+g.last>0?+g.last:0,fileId:String(g.fileId||''),err:String(g.err||'').slice(0,240)}}
  st.bkBase=+st.bkBase>0?+st.bkBase:Date.now();st.lastBackup=+st.lastBackup>0?+st.lastBackup:0;st.bkSnooze=+st.bkSnooze>0?+st.bkSnooze:0;
  st.gestun=st.gestun===undefined?true:!!st.gestun;st.calendar=st.calendar===undefined?true:!!st.calendar;st.sigOn=st.sigOn===undefined?true:!!st.sigOn;st.sigMin=+st.sigMin>0?Math.round(+st.sigMin):5000000;
  s.updated=s.updated||0;return s;
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function makeSample(){
  const R=mulberry32(7),pick=a=>a[Math.floor(R()*a.length)],rr=(a,b,st)=>Math.round((a+R()*(b-a))/st)*st;
  const s={v:1,updated:0,settings:{privacy:false,layout:[],collapsed:{},anCollapsed:{}},
    groups:[{id:'g1',name:'Kas & Bank'},{id:'g2',name:'E-Wallet'}],
    wallets:[{id:'w1',g:'g1',name:'Tunai',note:'Dompet harian',open:600000},{id:'w2',g:'g1',name:'Bank Utama',note:'Gaji & tagihan rutin',open:4200000},{id:'w3',g:'g1',name:'Bank Digital',note:'Dana darurat',open:1500000},{id:'w4',g:'g2',name:'E-Wallet A',note:'Transport & jajan',open:200000},{id:'w5',g:'g2',name:'E-Wallet B',note:'QRIS & pulsa',open:120000}],
    pools:[{id:'p1',name:'Plafon Bank Utama',limit:25000000}],
    cards:[
      {id:'k1',name:'Everyday',bank:'Bank Utama',last4:'4821',net:'visa',theme:'obsidian',pool:'p1',wallet:'w2',limit:0,cut:20,due:8,minPct:10,bg:null,contrast:40},
      {id:'k2',name:'Platinum',bank:'Bank Utama',last4:'7305',net:'mc',theme:'silver',pool:'p1',wallet:'w2',limit:0,cut:20,due:8,minPct:10,bg:null,contrast:40},
      {id:'k3',name:'Gold Plus',bank:'Bank Kedua',last4:'1190',net:'visa',theme:'aurora',pool:'',wallet:'w3',limit:12000000,cut:12,due:28,minPct:10,bg:null,contrast:40}],
    cats:defaultCats(),tx:[]};
  S=s;normalize(s);
  const bal={},debt={};s.wallets.forEach(w=>bal[w.id]=w.open);s.cards.forEach(c=>debt[c.id]=0);
  const add=(d,t,acc,amt,cat,sub,note,extra)=>{const x=Object.assign({id:uid(),d,t,acc,amt,cat:cat||'',sub:sub||'',note:note||''},extra||{});effect(x,bal,debt,1);s.tx.push(x);return x};
  const poolUsed=()=>debt.k1+debt.k2;
  const spend=(d,amt,cat,sub,note)=>{
    const cash=['w1','w4','w5','w3'].filter(id=>bal[id]>=amt);
    if(bal.w2-amt>3000000)cash.push('w2');
    let acc=null;
    if(cash.length&&R()<.7)acc=pick(cash);
    else{const cs=[];if(poolUsed()+amt<24000000)cs.push('k1','k2');if(debt.k3+amt<11000000)cs.push('k3');acc=cs.length?pick(cs):(cash[0]||null)}
    if(acc)add(d,'exp',acc,amt,cat,sub,note);
  };
  let d=addDays(today(),-179);
  for(let i=0;i<180;i++,d=addDays(d,1)){
    const dt=parseD(d),dom=dt.getDate(),dow=dt.getDay();
    if(dom===25)add(d,'inc','w2',9000000,'i_gaji','','Gaji bulanan');
    if(dom===26&&bal.w2>1000000)add(d,'xfer','w2',500000,'','','Isi saldo',{to:'w4'});
    if(dom===27&&bal.w2>1000000)add(d,'xfer','w2',400000,'','','Tarik tunai',{to:'w1'});
    if(dom===1)add(d,'exp','w2',1500000,'c_rumah','Sewa','Sewa kamar');
    if(dom===3&&bal.w2>800000)add(d,'exp','w2',350000,'c_tagihan','Internet','');
    if(dom===15)spend(d,100000,'c_tagihan','Pulsa','');
    if(dom===12)add(d,'exp','k1',54000,'c_hiburan','Streaming','Langganan');
    if(dom===5)[['k1','w2'],['k2','w2'],['k3','w3']].forEach(p=>{const amt=debt[p[0]];if(amt>0){const from=[p[1],'w2'].find(x=>bal[x]>=amt);if(from)add(d,'pay',from,amt,'','','Bayar tagihan',{to:p[0]})}});
    if(i===105){gestunTx(d,'k3','w3',3000000,90000,'A','Dana darurat').forEach(x=>{effect(x,bal,debt,1);s.tx.push(x)})}
    if(R()<.92)spend(d,rr(15000,70000,500),'c_makan',pick(['Sarapan','Makan siang','Makan malam','Kopi & jajan']),'');
    if(R()<.35)spend(d,rr(12000,45000,500),'c_makan','Kopi & jajan','');
    if(dow===0||dow===3)spend(d,rr(40000,90000,5000),'c_transport','Bensin','');
    if(R()<.22)spend(d,rr(60000,380000,5000),'c_belanja',pick(['Kebutuhan harian','Pakaian','Online']),'');
    if(R()<.06)spend(d,rr(25000,200000,5000),'c_sehat',pick(['Obat','Dokter']),'');
    if(R()<.07)spend(d,rr(50000,180000,5000),'c_hiburan',pick(['Game','Nonton']),'');
    if(R()<.03){const c=pick(['k1','k2']),big=rr(1200000,2800000,50000);if(poolUsed()+big<24000000)add(d,'exp',c,big,'c_belanja','Online','Elektronik')}
    if(R()<.05)add(d,'inc',pick(['w3','w4']),rr(250000,900000,10000),'i_usaha','','Proyek sampingan');
  }
  return s;
}

/* ============ penyimpanan (lokal + online) ============ */
const remote={doc:null,ready:false,timer:0};
function setSync(k){
  if(typeof gdAuto==='function'&&gdAuto()&&!/^gd/.test(k))return;   /* saat Drive aktif, pil hanya menampilkan status Drive */
  ui.sync=k;const el=$('#sync');if(!el)return;
  el.className='sync s-'+k;
  el.querySelector('em').textContent={local:'Lokal',online:'Online',saving:'Menyimpan…',err:'Gagal sinkron',gdok:'Drive',gdsave:'Drive…',gdneed:'Masuk Drive',gderr:'Gagal Drive'}[k]||k;
}
function persist(){
  S.updated=Date.now();
  try{safeStorage.set(LS_KEY,JSON.stringify(S))}catch(e){}
  if(typeof gdSchedule==='function')gdSchedule();
  if(remote.ready){clearTimeout(remote.timer);setSync('saving');remote.timer=setTimeout(pushRemote,900)}
}
async function pushRemote(){try{await remote.doc.set({json:JSON.stringify(S),updated:S.updated});setSync('online')}catch(e){setSync('err')}}
async function initRemote(){
  try{
    if(!(window.claude&&window.claude.use))return;
    const found=(async()=>{
      const db=await claude.use('db'),user=await claude.use('user');
      if(!db||!user)return null;
      const id=typeof user.id==='function'?await user.id():user.id;
      return id?{db,id}:null;
    })();
    const r=await Promise.race([found,new Promise(res=>setTimeout(()=>res('to'),10000))]);
    if(!r||r==='to'){setSync('local');return}
    remote.doc=r.db.collection('data/users/'+r.id).doc('kantong');
    const snap=await remote.doc.get();
    const ex=typeof snap.exists==='function'?snap.exists():snap.exists;
    let data=null;if(ex)data=typeof snap.data==='function'?snap.data():snap.data;
    remote.ready=true;
    if(data&&data.json){
      let rs=null;try{rs=normalize(JSON.parse(data.json))}catch(e){}
      if(rs&&(rs.updated||0)>=(S.updated||0)){
        S=rs;try{safeStorage.set(LS_KEY,JSON.stringify(S))}catch(e){}
        render();setSync('online');return;
      }
    }
    setSync('saving');await pushRemote();
  }catch(e){setSync('local')}
}

/* ============ render ============ */
const VIEWS={};

/* ══ Eye tracker ═══════════════════════════════════════════
   Dari komponen "Eye tracker" Bencho, lisensi MIT
   (bencho.dev/licence). Diterjemahkan dari React ke JS biasa
   karena KANTONG satu file tanpa React; rumus dan komentar asli
   dipertahankan. Tambahan KANTONG ditandai "KANTONG:".

   A ball with two eyes that watches your cursor, wherever it is
   on the page.

   ── THE EYES ARE ON THE BALL, NOT IN FRONT OF IT ───────────
   The easy version slides two shapes toward the pointer, and it
   reads as stickers on a disc. Here each eye is a point on the
   sphere's surface: looking left turns the ball, so an eye
   travels along the curve, and the one heading for the rim
   moves less and narrows as it turns away from you while the
   other swings wide. That foreshortening is the whole trick —
   it is what makes a flat circle read as something round.

   One turn (yaw and pitch) is the state, sprung toward where
   the pointer is; both eyes are read off it, so they can never
   disagree. It relaxes back to facing you when the pointer
   leaves the window, and it blinks on its own now and then.

   Written straight to the DOM every frame, never through state:
   a pointer move is not a render. */

/* Read once, the way the wheel and the pill nav do. A
   preference, not a live input. */
const eytStill=()=>!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const EYT_R=50; /* the ball's radius, in the 100-unit viewBox */

/* ── the eyes: a style, and where they rest ─────────────────
   Every style is two rounded rectangles, the same size as each
   other — the difference between styles is only their width,
   height and corner — so they all ride the same sphere and
   blink the same way. Any difference in SIZE between the two is
   depth, worked out from the turn, never drawn in. */
const EYT_STYLES={Slant:{w:9,h:15,r:4.5},Dots:{w:11,h:11,r:5.5},Squares:{w:12,h:12,r:3.5},Sleepy:{w:13,h:7,r:3.5},Tall:{w:7,h:17,r:3.5},Tiny:{w:7,h:7,r:3.5},Big:{w:14,h:14,r:7}};
/* half the gap between the eyes, as a fraction of the radius */
const EYT_GAP=0.19;
/* how far a look to a corner tilts the pair, in degrees at the
   rim — a glance up and right leans them back, like the logo */
const EYT_TILT=64;

/* ── it talks back when you poke it ─────────────────────────
   A press on the toy opens a little chat bubble off its lower
   right, types one short line into it a letter at a time, holds
   it to be read, and folds it away. Never the same line twice
   running.
   KANTONG: kalimatnya bahasa Indonesia, sebagian membaca data
   (saldo, tagihan, catatan hari ini) dan ikut mode privasi. */
function eytLines(){
  const L=['Hai, aku lihat kamu.','Boop.','Geli, tahu!','Jangan colek terus.','Aku jagain kantongmu.','Lagi? Oke deh.','Pelan-pelan, yang penting konsisten.','Catat sekarang, lupa nanti.','Aku nggak ngintip, janji.','Naik turun itu wajar.','Satu catatan kecil hari ini sudah cukup.','Hmm, menarik.'];
  const h=new Date().getHours();
  L.push(h<11?'Selamat pagi!':h<15?'Sudah makan siang?':h<19?'Sore, jangan lupa istirahat.':'Malam, catatan hari ini sudah lengkap?');
  try{
    const bal=S.wallets.reduce((a,w)=>a+(D.bal[w.id]||0),0),debt=S.cards.reduce((a,c)=>a+(D.debt[c.id]||0),0);
    L.push('Saldomu '+money(bal)+'.');
    if(debt>0)L.push('Tagihan kartu '+money(debt)+'.');
    if(!S.tx.some(t=>t.d===today()))L.push('Belum catat apa-apa hari ini.');
    else L.push('Rajin nyatat, mantap!');
  }catch(e){}
  return L;
}
const EYT_TINTS=['#3b5bff','#179c52','#e0307f'];
const EYT_KEY_MS=38, EYT_HOLD_MS=1500;

/* ── the body ───────────────────────────────────────────────
   The eyes are worked out on a sphere whatever the body is, so
   the turn reads the same on every shape; the body is only the
   outline they are clipped to. The cube is a soft square. */
const EYT_SHAPES={
  Ball:'M50 0 A50 50 0 1 1 49.99 0 Z',
  Cube:'M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z',
  Pill:'M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z',
  /* heksagon dengan sudut lunak, dari sumber Bencho */
  Hexagon:'M59.53 8.50 L81.18 21.00 Q90.70 26.50 90.70 37.50 L90.70 62.50 Q90.70 73.50 81.18 79.00 L59.53 91.50 Q50.00 97.00 40.47 91.50 L18.82 79.00 Q9.30 73.50 9.30 62.50 L9.30 37.50 Q9.30 26.50 18.82 21.00 L40.47 8.50 Q50.00 3.00 59.53 8.50 Z',
  /* KANTONG: bintang empat sudut yang gemuk, tengahnya cukup lebar untuk dua mata */
  Star:'M50 4 C60 30 70 40 96 50 C70 60 60 70 50 96 C40 70 30 60 4 50 C30 40 40 30 50 4 Z',
  /* KANTONG: sepuluh siluet baru bertema uang; beberapa sub-jalur bertumpuk jadi satu badan */
  Pocket:'M16 12 H84 Q92 12 92 20 V50 Q92 74 50 94 Q8 74 8 50 V20 Q8 12 16 12 Z',
  Envelope:'M12 20 L50 44 L88 20 Q95 17 95 25 V75 Q95 83 87 83 H13 Q5 83 5 75 V25 Q5 17 12 20 Z',
  Piggy:'M6 58 A44 36 0 1 1 94 58 A44 36 0 1 1 6 58 Z M22 36 L26 10 Q27 6 31 8 L46 24 Z M54 24 L69 8 Q73 6 74 10 L78 36 Z',
  Sprout:'M16 62 A34 34 0 1 1 84 62 A34 34 0 1 1 16 62 Z M50 34 Q22 30 22 10 Q46 8 50 30 Z M50 30 Q54 8 78 10 Q78 30 50 34 Z',
  Slab:'M18 22 H92 Q97 22 95 28 L87 72 Q86 78 80 78 H8 Q3 78 5 72 L13 28 Q14 22 18 22 Z',
  Safe:'M20 12 H80 A10 10 0 0 1 90 22 V74 A10 10 0 0 1 80 84 H20 A10 10 0 0 1 10 74 V22 A10 10 0 0 1 20 12 Z M23 82 H33 A3 3 0 0 1 36 85 V89 A3 3 0 0 1 33 92 H23 A3 3 0 0 1 20 89 V85 A3 3 0 0 1 23 82 Z M67 82 H77 A3 3 0 0 1 80 85 V89 A3 3 0 0 1 77 92 H67 A3 3 0 0 1 64 89 V85 A3 3 0 0 1 67 82 Z M5 28 H9 A3 3 0 0 1 12 31 V37 A3 3 0 0 1 9 40 H5 A3 3 0 0 1 2 37 V31 A3 3 0 0 1 5 28 Z M5 56 H9 A3 3 0 0 1 12 59 V65 A3 3 0 0 1 9 68 H5 A3 3 0 0 1 2 65 V59 A3 3 0 0 1 5 56 Z',
  Wallet:'M20 20 H74 A14 14 0 0 1 88 34 V70 A14 14 0 0 1 74 84 H20 A14 14 0 0 1 6 70 V34 A14 14 0 0 1 20 20 Z M88 42 H88 A8 8 0 0 1 96 50 V56 A8 8 0 0 1 88 64 H88 A8 8 0 0 1 80 56 V50 A8 8 0 0 1 88 42 Z',
  Key:'M18 38 A32 32 0 1 1 82 38 A32 32 0 1 1 18 38 Z M46 56 H54 A6 6 0 0 1 60 62 V88 A6 6 0 0 1 54 94 H46 A6 6 0 0 1 40 88 V62 A6 6 0 0 1 46 56 Z M61 72 H69 A3 3 0 0 1 72 75 V77 A3 3 0 0 1 69 80 H61 A3 3 0 0 1 58 77 V75 A3 3 0 0 1 61 72 Z M61 84 H65 A3 3 0 0 1 68 87 V89 A3 3 0 0 1 65 92 H61 A3 3 0 0 1 58 89 V87 A3 3 0 0 1 61 84 Z',
  Bag:'M20 28 H80 Q84 28 85 33 L92 84 Q93 92 85 92 H15 Q7 92 8 84 L15 33 Q16 28 20 28 Z M35 14 H35 A5 5 0 0 1 40 19 V27 A5 5 0 0 1 35 32 H35 A5 5 0 0 1 30 27 V19 A5 5 0 0 1 35 14 Z M65 14 H65 A5 5 0 0 1 70 19 V27 A5 5 0 0 1 65 32 H65 A5 5 0 0 1 60 27 V19 A5 5 0 0 1 65 14 Z',
  Clock:'M12 56 A38 38 0 1 1 88 56 A38 38 0 1 1 12 56 Z M12 24 A12 12 0 1 1 36 24 A12 12 0 1 1 12 24 Z M64 24 A12 12 0 1 1 88 24 A12 12 0 1 1 64 24 Z',
  Bell:'M50 8 Q84 8 84 50 L92 76 Q94 82 88 82 H12 Q6 82 8 76 L16 50 Q16 8 50 8 Z M40 84 A10 10 0 1 1 60 84 A10 10 0 1 1 40 84 Z',
  Jar:'M27 8 H73 A5 5 0 0 1 78 13 V19 A5 5 0 0 1 73 24 H27 A5 5 0 0 1 22 19 V13 A5 5 0 0 1 27 8 Z M30 20 H70 A16 16 0 0 1 86 36 V76 A16 16 0 0 1 70 92 H30 A16 16 0 0 1 14 76 V36 A16 16 0 0 1 30 20 Z',
  Book:'M22 10 H82 A8 8 0 0 1 90 18 V82 A8 8 0 0 1 82 90 H22 A8 8 0 0 1 14 82 V18 A8 8 0 0 1 22 10 Z M12 14 H14 A4 4 0 0 1 18 18 V82 A4 4 0 0 1 14 86 H12 A4 4 0 0 1 8 82 V18 A4 4 0 0 1 12 14 Z',
  Crown:'M8 84 L4 28 L30 52 L50 14 L70 52 L96 28 L92 84 Q92 90 86 90 H14 Q8 90 8 84 Z',
  Rocket:'M50 4 Q74 28 72 64 L72 76 H28 L28 64 Q26 28 50 4 Z M28 56 L28 76 L10 82 Z M72 56 L90 82 L72 76 Z',
  Padlock:'M26 40 H74 A12 12 0 0 1 86 52 V80 A12 12 0 0 1 74 92 H26 A12 12 0 0 1 14 80 V52 A12 12 0 0 1 26 40 Z M28 42 V30 A22 22 0 0 1 72 30 V42 Z',
  Cloud:'M8 58 A22 22 0 1 1 52 58 A22 22 0 1 1 8 58 Z M28 42 A26 26 0 1 1 80 42 A26 26 0 1 1 28 42 Z M56 58 A20 20 0 1 1 96 58 A20 20 0 1 1 56 58 Z M29 54 H75 A15 15 0 0 1 90 69 V69 A15 15 0 0 1 75 84 H29 A15 15 0 0 1 14 69 V69 A15 15 0 0 1 29 54 Z'
};

const eytClamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let eytN=0;

function mountWatcher(host,o){
  o=Object.assign({follow:60,bounce:30,size:44,shape:'Cube',eyes:'Slant',eyeScale:1.4},o||{});
  const still=eytStill(),ns='http://www.w3.org/2000/svg',clip='eyt-clip-'+(eytN++);
  const base=EYT_STYLES[o.eyes]||EYT_STYLES.Slant;
  let eye={w:base.w*o.eyeScale,h:base.h*o.eyeScale,r:base.r*o.eyeScale};
  const body=EYT_SHAPES[o.shape]||EYT_SHAPES.Ball;
  host.innerHTML=`<div class="eyt" style="--eyt-size:${eytClamp(o.size,16,180)}px" role="img" aria-label="Teman penniq, bisa dicolek">
    <svg class="eyt-ball" viewBox="0 0 100 100" data-poke="true"><defs><linearGradient id="${clip}-g" x1="0" y1="0" x2="1" y2="1"></linearGradient><clipPath id="${clip}"><path d="${body}"/></clipPath></defs>
    <path class="eyt-body" d="${body}"/><g clip-path="url(#${clip})">${[0,1].map(()=>`<g><rect class="eyt-eye" x="${-eye.w/2}" y="${-eye.h/2}" width="${eye.w}" height="${eye.h}" rx="${eye.r}"/><path class="eyt-brow" d="M${(-eye.w*.5).toFixed(2)} 0 Q0 ${(-eye.h*.1).toFixed(2)} ${(eye.w*.5).toFixed(2)} 0"/><path class="eyt-hap" d="M${(-eye.w*.58).toFixed(2)} ${(eye.h*.16).toFixed(2)} Q0 ${(-eye.h*.4).toFixed(2)} ${(eye.w*.58).toFixed(2)} ${(eye.h*.16).toFixed(2)}"/></g>`).join('')}</g></svg>
    <span class="eyt-say" aria-live="polite"><span class="eyt-txt"></span><span class="eyt-caret"></span></span></div>`;
  const el=host.firstElementChild,ball=el.querySelector('.eyt-ball'),say=el.querySelector('.eyt-say'),txt=el.querySelector('.eyt-txt');
  const eyes=[...el.querySelectorAll('.eyt-ball g[clip-path] > g')];
  const bodyP=el.querySelector('.eyt-body'),clipP=el.querySelector('clipPath path'),gradE=el.querySelector('linearGradient');
  /* KANTONG: ganti karakter tanpa membuat ulang (tanpa pendengar ganda):
     bentuk badan, warna/gradasi, warna mata, gaya mata. */
  function skin(c){
    const b=EYT_STYLES[c.eyes]||EYT_STYLES.Slant,sc=c.eyeScale||1.4;
    o.eyeScale=sc;eye={w:b.w*sc,h:b.h*sc,r:b.r*sc};
    const d=EYT_SHAPES[c.shape]||EYT_SHAPES.Ball;
    bodyP.setAttribute('d',d);clipP.setAttribute('d',d);
    if(c.grad){gradE.innerHTML=c.grad.map((col,i)=>`<stop offset="${Math.round(i/(c.grad.length-1)*100)}%" stop-color="${col}"/>`).join('');bodyP.style.fill=`url(#${clip}-g)`}
    else bodyP.style.fill=c.fill;
    bodyP.classList.toggle('holo',!!c.holo);
    el.style.setProperty('--fill-on',c.ink);el.style.setProperty('--eyt-glow',c.glow);
    eyes.forEach(g=>{
      g.children[1].setAttribute('d',`M${(-eye.w*.5).toFixed(2)} 0 Q0 ${(-eye.h*.1).toFixed(2)} ${(eye.w*.5).toFixed(2)} 0`);
      g.lastElementChild.setAttribute('d',`M${(-eye.w*.58).toFixed(2)} ${(eye.h*.16).toFixed(2)} Q0 ${(-eye.h*.4).toFixed(2)} ${(eye.w*.58).toFixed(2)} ${(eye.h*.16).toFixed(2)}`);
    });
  }
  /* tahan maskot ~0,5 detik = buka koleksi; tap biasa tetap bicara */
  let lpT=0,lp=false;
  ball.addEventListener('pointerdown',()=>{lp=false;clearTimeout(lpT);lpT=setTimeout(()=>{lp=true;try{navigator.vibrate&&navigator.vibrate(15)}catch(x){}openKoleksi()},520)});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>ball.addEventListener(ev,()=>clearTimeout(lpT)));
  ball.addEventListener('contextmenu',e=>e.preventDefault());

  /* poke: a turn counter cancels a line still being typed */
  let turn=0,lastLine=-1;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  /* satu fungsi untuk semua kalimat: ketik huruf demi huruf,
     tahan supaya terbaca, lalu lipat. Kalimat baru memotong yang lama. */
  async function speak(line,tint,hold){
    const mine=++turn;
    say.style.setProperty('--tint',tint||EYT_TINTS[Math.floor(Math.random()*EYT_TINTS.length)]);
    txt.textContent='';say.setAttribute('data-on','');
    for(let k=1;k<=line.length;k++){await wait(EYT_KEY_MS+Math.random()*30);if(mine!==turn)return;txt.textContent=line.slice(0,k)}
    await wait(hold||EYT_HOLD_MS);if(mine!==turn)return;
    say.removeAttribute('data-on');
  }
  ball.addEventListener('click',e=>{
    e.stopPropagation();if(lp){lp=false;return}
    const lines=eytLines();
    const pool=lines.map((_,i)=>i).filter(i=>i!==lastLine);
    const i=pool[Math.floor(Math.random()*pool.length)];lastLine=i;
    speak(lines[i]);
  });

  /* ── KANTONG: suasana hati ───────────────────────────────
     Senang = mata berubah jadi lengkung ^ ^ dan bola melompat
     kecil. `mood.v` mengejar `mood.t` dengan mulus. happy(ms)
     menahan senangnya ms milidetik; dipanggil berulang saat
     grafik digeser naik, jadi lompatnya hanya sekali di awal. */
  const mood={v:0,t:0,vq:0,q:0};let calmT=0,held=false,calmQ=0;
  window.mascot={
    happy(ms,line){
      const was=mood.t;mood.t=1;mood.q=0;
      if(!was&&!still){ball.classList.remove('hop');void ball.getBoundingClientRect();ball.classList.add('hop')}
      clearTimeout(calmT);calmT=setTimeout(()=>{held=false;mood.t=0},ms||800);
      if(line){held=true;speak(line,'#179c52',Math.max(600,(ms||800)-line.length*45))}
    },
    /* penasaran: mata sedikit lebih besar, satu alis naik. Sengaja
       tanpa gelembung dan tanpa nada sedih: grafik turun itu biasa. */
    curious(ms){mood.t=0;mood.q=1;clearTimeout(calmQ);calmQ=setTimeout(()=>{mood.q=0},ms||600)},
    calm(){clearTimeout(calmQ);mood.q=0;if(held)return;clearTimeout(calmT);mood.t=0},
    say(line,hold){speak(line,'#6a5cff',hold||2200)},
    skin
  };

  /* where the face is on the ball (fractions of the radius),
     its speed, and where it is heading — one spring on a point,
     read as a turn when the eyes are drawn */
  const t={x:0,y:0,vx:0,vy:0,tx:0,ty:0};
  let raf=0,prev=0,blink=0,nextBlink=performance.now()+2200;

  let dt0=1;
  const draw=now=>{
    /* a blink is 160ms down and up, as a squash on each eye */
    let lid=1;
    if(now>nextBlink){blink=now;nextBlink=now+2600+Math.random()*3200}
    const since=now-blink;
    if(since<160)lid=1-0.9*Math.sin((since/160)*Math.PI);
    mood.v+=(mood.t-mood.v)*Math.min(1,0.22*dt0);mood.vq+=(mood.q-mood.vq)*Math.min(1,0.2*dt0);
    /* KANTONG: mode privasi = maskot memejamkan mata */
    if(S&&S.settings&&S.settings.privacy)lid=0.12;

    /* the turn that brings the front of the ball to the face's
       spot: yaw about the vertical, pitch about the horizontal */
    const as=v=>Math.asin(eytClamp(v,-0.92,0.92));
    const yaw=as(t.x),pitch=-as(t.y);
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    /* the pair leans with a diagonal look and stands level on
       the axes: up-right and down-left lean one way, the other
       two the other, nothing straight on */
    const tilt=EYT_TILT*t.x*t.y;
    /* bigger eyes stand a little further apart */
    const g0=EYT_GAP*Math.max(1,o.eyeScale*0.8);

    [-g0,g0].forEach((x0,i)=>{
      const g=eyes[i];if(!g)return;
      /* the eye as a point on the unit sphere, either side of
         the front, turned with the ball */
      const z0=Math.sqrt(1-x0*x0);
      const x1=x0*cy+z0*sy,z1=-x0*sy+z0*cy;
      const y2=-z1*sp,z2=z1*cp;
      /* depth: the eye nearer the rim is further from you, so it
         is smaller all over and narrower still across the turn */
      const near=eytClamp(z2,0,1),k=0.45+0.55*near,sx=k*(0.7+0.3*near);
      /* ── the size is written as a size, never as a scale ──
         A scale stretches the corner with the shape: an eye
         narrowed for depth or squashed by a blink had elliptical
         corners, rounder on one side than the other. Writing the
         width and height directly keeps every corner the same
         radius, clamped so it never exceeds half a side. */
      const ex=1+0.16*mood.vq;
      const w=eye.w*sx*ex,h=Math.max(0.6,eye.h*k*lid*ex);
      const rect=g.firstElementChild,brow=g.children[1],hap=g.lastElementChild,m=mood.v,q=mood.vq;
      hap.setAttribute('transform','scale('+(sx).toFixed(3)+' '+k.toFixed(3)+')');hap.style.opacity=m<0.02?'0':m.toFixed(2);rect.style.opacity=(1-m).toFixed(2);
      /* alis: hanya naik atau datar, tidak pernah miring ke bawah
         (miring terbaca marah atau sedih). Penasaran = satu alis
         terangkat lebih tinggi; senang = keduanya naik tipis. */
      const bo=Math.max(m*0.95,q);
      brow.style.opacity=bo<0.03?'0':bo.toFixed(2);
      const lift=2.6*m+(i===0?6.5:2.2)*q;
      brow.setAttribute('transform','translate(0 '+(-h/2-3.4*k-lift*k).toFixed(2)+') scale('+(sx*ex).toFixed(3)+' 1)');

      rect.setAttribute('x',(-w/2).toFixed(2));rect.setAttribute('y',(-h/2).toFixed(2));
      rect.setAttribute('width',w.toFixed(2));rect.setAttribute('height',h.toFixed(2));
      rect.setAttribute('rx',Math.min(eye.r,w/2,h/2).toFixed(2));
      g.setAttribute('transform',`translate(${(50+x1*EYT_R).toFixed(2)} ${(50+y2*EYT_R).toFixed(2)}) rotate(${tilt.toFixed(2)})`);
      g.style.opacity=z2<0.05?'0':'1';
    });
  };

  /* ── it only runs while it can be seen ───────────────────
     Off screen or in a background tab the loop stops; it starts
     again the moment the ball comes back into view */
  let seen=true;
  const tick=now=>{
    if(!seen||document.hidden){raf=0;prev=0;return}
    /* Frames, not milliseconds: dt is in sixtieths of a second,
       so a dropped frame decays the same energy as the two it
       replaced */
    const dt=prev?Math.min(2.5,(now-prev)/16.67):1;prev=now;dt0=dt;
    if(still){t.x=t.tx;t.y=t.ty}
    else{
      /* one spring for both axes; Bounce loosens the damping */
      const k=0.06,d=0.34-(eytClamp(o.bounce,0,100)/100)*0.22;
      t.vx+=((t.tx-t.x)*k-t.vx*d)*dt;t.vy+=((t.ty-t.y)*k-t.vy*d)*dt;
      t.x+=t.vx*dt;t.y+=t.vy*dt;
    }
    draw(now);raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  const resume=()=>{if(!raf&&seen&&!document.hidden)raf=requestAnimationFrame(tick)};
  new IntersectionObserver(([e])=>{seen=e.isIntersecting;resume()}).observe(el);
  document.addEventListener('visibilitychange',resume);

  /* ── the face goes where you are ──────────────────────────
     A spot out along the pointer's direction, further the
     further away you are — so on top of it the face is dead
     centre, and off in a corner it is out by that corner's
     rim, turned, one eye smaller and the pair leaning.
     KANTONG: di HP tidak ada kursor, jadi ia menoleh ke tempat
     jarimu menyentuh layar (pointerdown) dan ke mouse bila ada,
     diukur terhadap seluruh layar, lalu kembali menatapmu. */
  let back=0,glance=0;
  const aim=e=>{
    const r=el.getBoundingClientRect();
    const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    const d=Math.hypot(dx,dy)||1;
    const reach=Math.max(60,Math.min(innerWidth,innerHeight)*0.28);
    /* KANTONG: batas toleh dikecilkan, dan ke bawah lebih kecil lagi:
       jari hampir selalu jauh di bawah maskot, jadi tanpa ini matanya
       menempel di sudut kanan bawah. */
    const far=Math.min(0.5,Math.tanh(d/reach)*(eytClamp(o.follow,0,100)/100)*1.1);
    t.tx=(dx/d)*far;t.ty=(dy/d)*far*(dy>0?0.4:0.7);
    clearTimeout(back);back=setTimeout(rest,e.pointerType==='mouse'?4000:1600);
    clearTimeout(glance);glance=setTimeout(look,5000);
  };
  const rest=()=>{t.tx=0;t.ty=0};
  /* ── idle: straight ahead, and now and then a glance ──────
     Every 5 seconds without input it looks off in a random
     direction, holds it for a moment, and comes back to centre. */
  const look=()=>{
    const a=Math.random()*Math.PI*2,far=0.35+Math.random()*0.2;
    t.tx=Math.cos(a)*far;t.ty=Math.sin(a)*far*(Math.sin(a)>0?0.5:0.8);
    glance=setTimeout(()=>{rest();glance=setTimeout(look,5000-900)},900);
  };
  glance=setTimeout(look,5000);
  addEventListener('pointerdown',aim,{passive:true});
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||(e.buttons&1))aim(e)},{passive:true});
  document.documentElement.addEventListener('pointerleave',rest);
  return el;
}

function applyMascot(){
  const m=S.settings.mascot,h=$('#mascot'),e=h&&h.querySelector('.eyt');if(!h)return;
  h.style.display=m==='off'?'none':'';
  const cid=S.settings.mascotChar;if(window.mascot&&mascot.cur!==cid){mascot.skin(MK.find(c=>c.id===cid)||MK[0]);mascot.cur=cid}
  if(e)e.style.setProperty('--eyt-size',(m==='small'?28:44)+'px');
}
/* animasi tak berujung (gelombang, kartu melayang, hologram) berhenti saat keluar layar atau tab di latar belakang, hemat baterai */
const APZ=window.IntersectionObserver?new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('apz',!e.isIntersecting))):null;
function watchAnims(){if(APZ)document.querySelectorAll('.wanim,.car-float,.eyt-body.holo,.mk-art.holo').forEach(e=>APZ.observe(e))}
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('hid',document.hidden));
function render(){
  const y=window.scrollY;
  recalc();
  const d=new Date();
  if(!$('#mascot').firstChild)mountWatcher($('#mascot'),{size:44});
  applyMascot();
  $('#brand').innerHTML=`<b>penniq</b><small>${DAYS[d.getDay()]}, ${d.getDate()} ${MONS[d.getMonth()]}</small>`;
  $('#view').innerHTML=VIEWS[ui.view]();
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===ui.view));
  {const dk=$('#dock');if(dk){const hide=!(ui.view==='home'||ui.view==='mut');dk.classList.toggle('nofab',hide);if(hide)dk.classList.remove('fab-open')}}
  if(ui.view==='mut'){const tb=$('#mtabs'),a=tb&&tb.querySelector('.mm.on');if(a)tb.scrollLeft=a.offsetLeft-tb.clientWidth/2+a.offsetWidth/2}
  $('#eyeBtn').innerHTML=S.settings.privacy?IC.eyeOff:IC.eye;
  if(ui.view==='home')drawChart();
  if(ui.view==='an')drawAn();
  if(ui.view==='manage'&&ui.mg==='wallet')drawPareto();
  if(ui.view==='manage'&&ui.mg==='card')kuInit();
  rollAll();
  if(window.colInit)colInit();
  if(window.carInit)carInit();
  watchAnims();
  window.scrollTo(0,y);
}
function toast(m){const t=$('#snack');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2200)}
let armed=null,armT=0;
function confirmTap(btn,key){
  if(armed===key){armed=null;clearTimeout(armT);return true}
  armed=key;btn.dataset.orig=btn.textContent;btn.textContent='Ketuk lagi untuk hapus';btn.classList.add('armed');
  clearTimeout(armT);armT=setTimeout(()=>{armed=null;if(btn.isConnected){btn.textContent=btn.dataset.orig;btn.classList.remove('armed')}},3000);
  return false;
}
function nextOcc(day){
  const t=new Date();t.setHours(0,0,0,0);
  const mk=(y,m)=>new Date(y,m,Math.min(day,new Date(y,m+1,0).getDate()));
  let d=mk(t.getFullYear(),t.getMonth());if(d<t)d=mk(t.getFullYear(),t.getMonth()+1);return d;
}
const daysTo=d=>{const t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/864e5)};

/* ---- kartu visual ---- */
/* Kilau saat kartu berganti: kartu baru "menyala" putih lalu berbutir dan mereda. */
function cardFlash(id,delay){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  setTimeout(()=>{
    const hits=[...document.querySelectorAll('[data-id="'+id+'"]')].map(e=>e.querySelector('.cc')).filter(Boolean);
    hits.forEach(cc=>{
      cc.querySelectorAll('.cc-fl').forEach(x=>x.remove());
      const f=document.createElement('i');f.className='cc-fl';f.setAttribute('aria-hidden','true');
      cc.appendChild(f);cc.classList.remove('blink');void cc.offsetWidth;cc.classList.add('blink');
      setTimeout(()=>{f.remove();cc.classList.remove('blink')},900);
    });
  },delay||0);
}
function cardHTML(c,debtOv){
  const debt=debtOv!=null?debtOv:(D.debt[c.id]||0),hasImg=!!c.bg;
  const ov=hasImg?`<div class="cc-img" style="background-image:url('${c.bg}')"></div><div class="cc-ov" style="opacity:${(0.08+clamp(c.contrast==null?40:c.contrast,0,100)/100*0.72).toFixed(2)}"></div>`:'';
  const due=c.due?nextOcc(c.due):null;
  return`<div class="cc th-${esc(c.theme||'obsidian')} ${hasImg?'has-img':''}">${ov}<div class="cc-in">
    <div class="cc-top"><div><div class="cc-name">${esc(c.name||'Kartu')}</div><div class="cc-bank">${esc(c.bank||'')}</div></div><div>${c.net==='mc'?IC.mc:IC.visa}</div></div>
    <div class="cc-id">${c.net==='mc'?IC.mc:IC.visa}<span class="cc-dots"><i></i><i></i><i></i><i></i></span><b>${esc(c.last4||'0000')}</b></div>
    <div class="cc-mid"><div class="chip-ic"></div><div class="cc-num">•••• ${esc(c.last4||'0000')}</div></div>
    <div class="cc-bot"><div><small>Tagihan</small><b ${mv('cd:'+c.id,debt)}>${money(debt)}</b></div><div class="r"><small>Jatuh tempo</small><b>${due?due.getDate()+' '+MONS[due.getMonth()]:'–'}</b></div></div>
  </div></div>`;
}
let wvN=0;
function waveBar(p1,p2,hot){
  const W=320,H=14,y=7,A=2.4,WL=18,G=7,x1=W*p1/100,x2=W*(p1+p2)/100;
  const wave=(a,b)=>{let d='';for(let x=a;x<=b+.01;x+=2)d+=(x===a?'M':'L')+x.toFixed(1)+' '+(y+A*Math.sin(2*Math.PI*x/WL)).toFixed(2);return d};
  const id='wv'+(wvN++);let s=`<svg class="wbar" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  const ts=x2>1?x2+G:0;
  if(ts<W-8)s+=`<line class="wt" x1="${(ts+2).toFixed(1)}" y1="${y}" x2="${W-8}" y2="${y}"/><circle class="wdot" cx="${W-2}" cy="${y}" r="2"/>`;
  if(x1>1)s+=`<clipPath id="${id}"><rect x="-4" y="0" width="${(x1+4).toFixed(1)}" height="${H}"/></clipPath><g clip-path="url(#${id})"><path class="w1 wanim ${hot?'hot':''}" d="${wave(-WL*2,x1+WL)}"/></g>`;
  if(x2-x1>G+2)s+=`<path class="w2" d="${wave(x1+G,x2)}"/>`;
  return s+'</svg>';
}

/* ---- beranda ---- */
const RANGES=[[7,'7H'],[30,'1B'],[90,'3B'],[180,'6B'],[365,'1T'],[-1,'YTD'],[0,'Semua']];
function blkChart(){
  return`<section class="blk">
    <div class="hero-top"><span class="lbl">Kekayaan bersih</span><button class="eye-s" data-action="privacy" aria-label="Sembunyikan nominal">${S.settings.privacy?IC.eyeOff:IC.eye}</button></div>
    <div class="nw num" id="nwVal">–</div>
    <div class="hero-meta"><span class="dpill" id="nwDelta"></span><span class="lbl" id="nwDate"></span></div>
    <div class="chart-wrap"><canvas id="chart" aria-label="Grafik kekayaan bersih"></canvas></div>
    <div class="bgroup rng sub" role="group" aria-label="Rentang waktu">${RANGES.map(r=>`<button class="${ui.range===r[0]?'on':''}" data-action="range" data-arg="${r[0]}">${r[1]}</button>`).join('')}</div>
    <div class="split sub"><div class="tile"><span>Total aset</span><b id="asetVal">–</b></div><div class="tile"><span>Tagihan kartu kredit</span><b class="neg" id="lbVal">–</b></div></div>
  </section>`;
}
const gestOn=()=>S.settings.gestun!==false;
const calOn=()=>S.settings.calendar!==false;
function blkActions(){
  const a=[['open-xfer','Transfer',IC.swap,2,'clover4'],['qpay','Bayar',IC.card,3,'cookie6']];if(gestOn())a.push(['qgest','Gestun',IC.bolt,5,'sunny']);
  return`<section class="blk acts" style="grid-template-columns:repeat(${a.length},1fr)">${a.map(x=>`<button class="act" data-action="${x[0]}">${x[3]<0?shapeIconC(x[2],'var(--acc)','var(--acc-ink)',x[4],60):shapeIcon(x[2],x[3],x[4],60)}<span>${x[1]}</span></button>`).join('')}</section>`;
}
/* Pengukur limit: garis-garis tegak berwarna hijau→merah, penanda ideal 30% (terinspirasi kartu "Opt-In Rate"). */
function limitBlock(c){
  const ci=cardInfo(c),lim=ci.limit||0,N=48,IDEAL=30;
  const pm=lim?clamp(ci.mine/lim*100,0,100):0,pt=lim?clamp(ci.used/lim*100,0,100):0;
  const raw=lim?ci.used/lim*100:0,pct=raw>0&&raw<10?(Math.round(raw*10)/10).toString().replace('.',','):Math.round(raw);
  const tone=raw<=IDEAL?'ok':raw<=70?'mid':'hi';
  const msg=!lim?'Limit belum diisi':raw>100?'Melebihi limit':raw<=IDEAL?'Di bawah ideal '+IDEAL+'%':'Di atas ideal '+IDEAL+'%';
  let ticks='';
  for(let i=0;i<N;i++){
    const f=i/(N-1)*100,on=f<pt-.001||(i===0&&pt>0),mine=f<pm-.001||(i===0&&pm>0);
    const hue=Math.round(130-130*(i/(N-1)));
    ticks+=`<i class="${on?(mine?'on':'on o'):''}" style="--i:${i};--h:${hue}"></i>`;
  }
  const due=c.due?nextOcc(c.due):null,dn=due?daysTo(due):null,hasDue=due&&ci.mine>0;
  return`<div class="lim lg"><div class="lg-top"><div class="lg-pct ${tone}"><span>${lim?pct:0}</span><small>%</small><em>terpakai</em></div>
    <div class="lg-rem"><span>Sisa limit</span><b class="num ${ci.remain<0?'neg':''}" ${mv('cr:'+c.id,ci.remain)}>${money(ci.remain)}</b></div></div>
    <div class="lg-st"><span class="lg-pill ${tone}">${msg}</span>${lim?`<span class="lg-amt num ${hasDue?'hd':''}"><span class="lg-df">dari ${money(lim)}</span>${hasDue?`<span class="lg-ds ${dn<=3?'soon':''}">Jatuh tempo ${due.getDate()+' '+MONS[due.getMonth()]} · ${dn===0?'hari ini':dn+' hari'}</span>`:''}</span>`:''}</div>
    <div class="lg-g" role="img" aria-label="Limit terpakai ${pct} persen"><div class="lg-ticks">${ticks}</div><b class="lg-mk" style="left:${IDEAL}%"></b></div>
    <div class="lg-stats"><div><span>Tagihan</span><b class="num">${money(ci.mine)}</b></div>
      <div><span>Jatuh tempo</span><b class="${hasDue&&dn<=3?'soon':''}">${hasDue?due.getDate()+' '+MONS[due.getMonth()]:'–'}</b>${hasDue?`<small>${dn===0?'hari ini':dn+' hari lagi'}</small>`:''}</div>
      ${ci.pool?`<div><span>Kartu segrup</span><b class="num">${money(ci.other)}</b><small>${esc(ci.pool.name)}</small></div>`:`<div><span>Limit sendiri</span><b class="num">${money(ci.limit)}</b></div>`}</div></div>`;
}
const WL_COLORS={neon:'Hijau neon',blue:'Biru',graphite:'Grafit',rose:'Mawar',leather:'Kulit'};
function totalRemain(){
  let t=0;
  S.pools.forEach(p=>{const cs=S.cards.filter(c=>c.pool===p.id);if(cs.length)t+=p.limit-cs.reduce((a,c)=>a+(D.debt[c.id]||0),0)});
  S.cards.forEach(c=>{if(!c.pool||!S.pools.some(p=>p.id===c.pool))t+=(c.limit||0)-(D.debt[c.id]||0)});
  return t;
}
function wlDetailHTML(id){
  const c=S.cards.find(x=>x.id===id);if(!c)return'';
  const ci=cardInfo(c);
  return`<div class="wl-dh"><span class="lm"><b>${esc(c.name)} ••${esc(c.last4)}</b><small>${esc(c.bank||'')}${ci.pool?' · '+esc(ci.pool.name):''}</small></span><button class="tbtn" data-action="open-accd" data-id="${c.id}">Riwayat</button></div>
    ${limitBlock(c)}
    <div class="bgroup"><button class="fill" data-action="swipe" data-id="${c.id}">+ Gesek</button><button class="tonal" data-action="open-pay" data-id="${c.id}">Bayar</button>${gestOn()?`<button class="tonal" data-action="open-gest" data-id="${c.id}">Gestun</button>`:''}</div>
    ${S.cards.length>1&&S.settings.cardView==='wallet'?`<div class="chips" style="margin-top:8px">${S.cards.map(k=>`<button class="chip ${k.id===id?'on':''}" data-action="wl-pick" data-id="${k.id}">${esc(k.name)}</button>`).join('')}</div>`:''}`;
}
const cswSlot=k=>{k=Math.min(k,3);return`translate3d(${k*14}%,${-k*14}%,${-k*45}px) skewY(5deg)`};
function cswOrder(){
  const ids=S.cards.map(c=>c.id);let o=(ui.cswO||[]).filter(i=>ids.includes(i));
  ids.forEach(i=>{if(!o.includes(i))o.push(i)});ui.cswO=o;return o;
}
function blkStack(){
  const n=S.cards.length,o=cswOrder();
  const cards=S.cards.map(c=>{const k=o.indexOf(c.id);
    return`<div class="csw-card" data-id="${c.id}" ${k===0?'data-front':''} style="z-index:${n-k};--t:${cswSlot(k)}" aria-label="Kartu ${esc(c.name)}">${cardHTML(c)}</div>`}).join('');
  return`<section class="blk"><div class="blk-h"><h2>Kartu kredit<small>${n}</small></h2><button class="tbtn" data-action="fnew" data-arg="card">+ Kartu</button></div>
    <div class="csw" id="csw"><div class="csw-stage">${cards}</div></div>
    ${n>1?`<div class="csw-hint">${IC.swap.replace('width="20" height="20"','width="13" height="13"')} Ketuk atau lempar kartu depan</div>`:''}
    <div class="wl-detail" id="wlDetail">${wlDetailHTML(o[0])}</div></section>`;
}
/* kartu depan pindah ke belakang; semua kartu kembali ke slotnya (tidak ada
   seretan yang tertinggal), lalu rincian di bawah mengikuti kartu depan */
function cswApply(say){
  const root=$('#csw');if(!root)return;const o=ui.cswO,n=o.length;
  root.querySelectorAll('.csw-card').forEach(el=>{const k=o.indexOf(el.dataset.id);
    el.style.transition='';el.style.transform='';el.style.zIndex=n-k;el.style.setProperty('--t',cswSlot(k));
    if(k===0)el.setAttribute('data-front','');else el.removeAttribute('data-front')});
  const d=$('#wlDetail');if(d){d.innerHTML=wlDetailHTML(o[0]);rollAll()}
  if(say)cardFlash(o[0],120);
  const c=S.cards.find(x=>x.id===o[0]);
  if(say&&c&&c.bg){const t=(c.net==='mc'?'Mastercard':'Visa')+' •• '+(c.last4||'0000');
    if(window.mascot&&S.settings.mascot!=='off')mascot.say(t);else toast(t)}
}
function cswSwap(){const o=cswOrder();ui.cswO=[...o.slice(1),o[0]];cswApply(true)}
function cswFront(id){const o=cswOrder();ui.cswO=[id,...o.filter(x=>x!==id)];cswApply(true)}
(function(){
  let drag=null,unhook=()=>{};
  const slot0=cswSlot(0),rub=d=>160*Math.tanh(d/160);
  const settle=()=>document.querySelectorAll('.csw-card').forEach(el=>{el.style.transition='';el.style.transform=''});
  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest('.csw-card[data-front]');
    if(!el||drag||(e.button!==undefined&&e.button!==0))return;
    drag={pid:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,t:performance.now()};
    el.style.transition='none';
    const mv=ev=>{
      if(!drag||ev.pointerId!==drag.pid)return;
      drag.dx=ev.clientX-drag.x;drag.dy=ev.clientY-drag.y;
      const x=rub(drag.dx),y=rub(drag.dy);
      el.style.transform=slot0+' translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+(x*0.05).toFixed(2)+'deg)';
    };
    const up=ev=>{
      if(!drag||ev.pointerId!==drag.pid)return;
      const d=drag;drag=null;unhook();
      const far=Math.hypot(d.dx,d.dy),quick=far/Math.max(1,performance.now()-d.t)>0.6;
      /* ditekan, atau diseret cukup jauh/cepat: ke belakang */
      if(ev.type!=='pointercancel'&&(far<6||far>70||(quick&&far>24))){cswSwap();return}
      /* belum cukup jauh: kembali ke slot depan */
      settle();
    };
    window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
    unhook=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);unhook=()=>{}};
  });
})();

/* ══ Kolom: kartu naik dari bawah lewat kolom salinan yang buram ═══════
   (terinspirasi Motion Column, horizonx.so). Semua kartu berbaris di satu
   kolom tegak; `pos` naik tanpa batas dan tiap kartu ditaruh di (i - pos).
   Yang di tengah tajam dan penuh; makin jauh makin buram, pudar dan kecil,
   dan saat bergerak ia ikut meregang dan mengabur sesuai kecepatan. Tepi
   atas dan bawah kolom memudar dengan topeng. */
(function(){
  const DW=330,MAXC=8,PITCH=.8,PULLX=40;
  const clp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v)),mod=(a,n)=>((a%n)+n)%n;
  const still=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  let K=null;
  const list=()=>S.cards.slice(0,MAXC);
  const idAt=p=>{const l=list();return l.length?l[mod(Math.round(p),l.length)].id:''};

  window.blkCol=function(){
    const l=list();
    const cards=l.map(c=>`<div class="col-card" data-id="${c.id}"><div class="col-face"><div class="stk-in">${cardHTML(c)}</div></div></div>`).join('');
    const cur=l.some(c=>c.id===ui.colId)?ui.colId:l[0].id;ui.colId=cur;
    return`<section class="blk"><div class="blk-h"><h2>Kartu kredit<small>${S.cards.length}</small></h2><button class="tbtn" data-action="fnew" data-arg="card">+ Kartu</button></div>
      <div class="col-wrap" id="colw"><div class="col" id="col" tabindex="0" role="group" aria-label="Kartu kredit, geser atau ketuk untuk ganti">${cards}</div></div>
      <div class="csw-hint">${IC.swap.replace('width="20" height="20"','width="13" height="13"')} Ketuk atau geser untuk ganti kartu</div>
      <div class="wl-detail" id="wlDetail">${wlDetailHTML(cur)}</div></section>`;
  };

  function detail(id){const d=$('#wlDetail');if(d){d.innerHTML=wlDetailHTML(id);rollAll()}}
  function say(id){
    const c=S.cards.find(x=>x.id===id);
    if(c&&c.bg){const t=(c.net==='mc'?'Mastercard':'Visa')+' •• '+(c.last4||'0000');
      if(window.mascot&&S.settings.mascot!=='off')mascot.say(t);else toast(t)}
  }
  function paint(){
    const s=K,N=s.N,speed=Math.min(2,Math.abs(s.vel)*14);
    for(let i=0;i<N;i++){
      let d=mod(i-s.pos+N/2,N)-N/2;const a=Math.abs(d);
      let op=a<=1?1-a*.55:Math.max(0,.45-(a-1)*.45);
      if(N===2&&a>.85)op*=clp((1-a)/.15,0,1);
      const sc=1-Math.min(a,2)*.05,bl=Math.min(8,a*2.2+speed*5);
      const el=s.els[i];
      el.style.transform='translateY('+(d*s.CH*PITCH).toFixed(2)+'px) scale('+sc.toFixed(4)+','+(sc*(1+speed*.06)).toFixed(4)+')';
      el.style.opacity=op.toFixed(3);
      el.style.filter=bl>.25?'blur('+bl.toFixed(2)+'px)':'none';
      el.style.zIndex=100-Math.round(a*10);
      el.style.pointerEvents=a<1.5&&op>.05?'auto':'none';
    }
  }
  function kick(){
    const s=K;if(s.raf)return;let prev=0;
    const tick=t=>{
      const dt=prev?clp((t-prev)/16.67,0,2.5):1;prev=t;
      s.vel+=(s.tgt-s.pos)*.075*dt;s.vel*=Math.pow(.8,dt);s.pos+=s.vel*dt;
      if(Math.abs(s.tgt-s.pos)<.0015&&Math.abs(s.vel)<.0015){s.pos=s.tgt;s.vel=0;paint();s.raf=0;return}
      paint();s.raf=requestAnimationFrame(tick);
    };
    s.raf=requestAnimationFrame(tick);
  }
  function go(delta){
    const s=K;if(!s||!delta||s.N<2)return;
    s.tgt=Math.round(s.tgt)+delta;
    const id=idAt(s.tgt);ui.colId=id;detail(id);say(id);cardFlash(id,150);
    if(still()){s.pos=s.tgt;s.vel=0;paint()}else kick();
  }
  window.colGo=function(id){
    const s=K;if(!s)return;const l=list(),idx=l.findIndex(c=>c.id===id);if(idx<0)return;
    let d=idx-mod(Math.round(s.tgt),s.N);if(d>s.N/2)d-=s.N;if(d<-s.N/2)d+=s.N;go(d);
  };
  window.colInit=function(){
    const root=$('#col');
    if(K){cancelAnimationFrame(K.raf);K=null}
    if(!root)return;
    const l=list(),N=l.length;if(N<2)return;
    const wrap=$('#colw'),w=wrap.clientWidth||340;
    const CW=clp(w-72,200,262),CH=CW*208.1/330,H=Math.round(CH*1.5);
    root.style.width=w+'px';root.style.height=H+'px';
    const els=[...root.querySelectorAll('.col-card')];
    els.forEach(el=>{
      el.style.cssText+=';left:'+((w-CW)/2)+'px;top:'+((H-CH)/2)+'px;width:'+CW+'px;height:'+CH+'px';
      el.firstElementChild.firstElementChild.style.transform='scale('+(CW/DW).toFixed(4)+')';
    });
    const start=Math.max(0,l.findIndex(c=>c.id===ui.colId));
    K={root,N,els,CW,CH,pos:start,tgt:start,vel:0,raf:0,down:null};
    paint();
    root.addEventListener('pointerdown',e=>{K.down={x:e.clientX,y:e.clientY,t:e.target.closest('.col-card')}});
    const up=e=>{
      const s=K,dn=s&&s.down;if(!dn)return;s.down=null;
      const dx=e.clientX-dn.x,dy=e.clientY-dn.y;
      if(Math.abs(dx)>PULLX&&Math.abs(dx)>Math.abs(dy)){go(dx<0?1:-1);return}
      if(Math.abs(dx)<10&&Math.abs(dy)<10&&dn.t){
        const i=s.els.indexOf(dn.t);let d=mod(i-s.tgt+s.N/2,s.N)-s.N/2;
        go(Math.abs(d)<.5?1:Math.round(d));
      }
    };
    root.addEventListener('pointerup',up);
    root.addEventListener('pointercancel',()=>{if(K)K.down=null});
    root.addEventListener('keydown',e=>{
      const d=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:(e.key==='ArrowUp'||e.key==='ArrowLeft')?-1:0;
      if(d){e.preventDefault();go(d)}
    });
  };
})();

/* ══ Putar: port vanilla dari Carousel (Bencho, MIT) ═════════════
   `turn` naik-turun tanpa batas dan sudutnya adalah (i - turn) * langkah.
   TIDAK PERNAH diambil modulo: membungkusnya ke 0..360 akan mengirim kartu
   lewat jalan panjang begitu melewati sambungan, satu-satunya bug yang bisa
   terlihat di susunan ini. Kartunya ditaruh langsung ke node (satu render per
   pointermove membuat cincin tertinggal dari jari), dan fungsi posisinya satu
   saja, dibaca oleh gambar pertama dan oleh geseran. */
(function(){
  const CW=230,CH=145,DW=330,STAGE_W=420,STAGE_H=236,ORBIT=128,DEPTH=100,LEAN=38,PULL=140,TOSS=150,MOST=2,BASE=620,FLOAT=15,SINK=50,MAXC=8;
  const ANGLE=[-4.2,2.6,-1.4,3.8,1.7,-2.9,3.1,-0.8],PERIOD=[4.7,5.9,6.7,5.3,7.1,6.1];
  const clp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v)),mixn=(a,b,t)=>a+(b-a)*t,mod=(a,n)=>((a%n)+n)%n,outq=t=>1-Math.pow(1-t,4);
  const still=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  let C=null;
  const list=()=>S.cards.slice(0,MAXC);
  const frontId=t=>{const l=list();return l.length?l[mod(Math.round(t),l.length)].id:''};
  function spot(i,turn,N){
    const th=(i-turn)*(Math.PI*2/N),f=(Math.cos(th)+1)/2;
    return{x:Math.sin(th)*ORBIT,y:-(1-f)*LEAN,s:mixn(1-clp(DEPTH,0,150)/200,1,f),z:Math.round(f*100)};
  }
  window.blkCar=function(){
    const l=list(),N=l.length,t0=ui.carTurn||0;
    const slots=l.map((c,i)=>`<div class="car-slot" data-i="${i}" style="width:${CW}px;height:${CH}px"><div class="car-float" style="animation-duration:${PERIOD[i%PERIOD.length]}s;--lift:${(FLOAT/100*16).toFixed(2)}px;--sway:${(FLOAT/100*1.4).toFixed(2)}deg"><div class="car-card"><div class="stk-in" style="transform:scale(${(CW/DW).toFixed(4)})">${cardHTML(c)}</div></div></div></div>`).join('');
    return`<section class="blk"><div class="blk-h"><h2>Kartu kredit<small>${S.cards.length}</small></h2><button class="tbtn" data-action="fnew" data-arg="card">+ Kartu</button></div>
      <div class="car-wrap" id="carw"><div class="car" id="car" style="width:${STAGE_W}px;height:${STAGE_H}px"><div class="car-track" role="group" aria-roledescription="carousel" aria-label="Putaran kartu" tabindex="0" data-held="false">${slots}</div></div></div>
      <div class="csw-hint">${IC.swap.replace('width="20" height="20"','width="13" height="13"')} Geser ke samping untuk memutar</div>
      <div class="wl-detail" id="wlDetail">${wlDetailHTML(frontId(t0))}</div></section>`;
  };
  function paint(){
    const c=C;c.slots.forEach((el,i)=>{const sp=spot(i,c.turn,c.N);
      el.style.transform='translate(-50%, -50%) translate('+sp.x.toFixed(2)+'px, '+sp.y.toFixed(2)+'px) rotate('+ANGLE[i%ANGLE.length]+'deg) scale('+sp.s.toFixed(4)+')';
      el.style.zIndex=sp.z});
  }
  function shown(to){
    const id=frontId(to);if(!id||id===C.shownId)return;C.shownId=id;cardFlash(id,140);
    const d=$('#wlDetail');if(d){d.innerHTML=wlDetailHTML(id);rollAll()}
    const c=S.cards.find(x=>x.id===id);
    if(c&&c.bg){const t=(c.net==='mc'?'Mastercard':'Visa')+' •• '+(c.last4||'0000');
      if(window.mascot&&S.settings.mascot!=='off')mascot.say(t);else toast(t)}
  }
  function glide(to){
    const c=C;cancelAnimationFrame(c.raf);
    const from=c.turn;ui.carTurn=to;shown(to);
    if(still()||from===to){c.turn=to;paint();return}
    const ms=BASE*(1.6-.5*1.2),t0=performance.now();
    const tick=now=>{const p=Math.min(1,(now-t0)/ms);c.turn=mixn(from,to,outq(p));paint();if(p<1)c.raf=requestAnimationFrame(tick)};
    c.raf=requestAnimationFrame(tick);
  }
  window.carGo=function(id){
    const c=C;if(!c)return;const l=list(),i=l.findIndex(x=>x.id===id);if(i<0)return;
    let d=mod(i-Math.round(c.turn)+c.N/2,c.N)-c.N/2;d=Math.round(d);glide(Math.round(c.turn)+d);
  };
  window.carInit=function(){
    const root=$('#car');
    if(C){cancelAnimationFrame(C.raf);C=null}
    if(!root)return;
    const N=list().length,track=root.firstElementChild;
    C={root,track,N,turn:ui.carTurn||0,raf:0,drag:null,slots:[...root.querySelectorAll('.car-slot')],shownId:frontId(ui.carTurn||0),k:1};
    const wrap=$('#carw'),w=wrap.clientWidth||STAGE_W,k=Math.min(1,w/STAGE_W);C.k=k;
    root.style.transformOrigin='0 0';root.style.transform='scale('+k.toFixed(4)+')';root.style.marginLeft=Math.max(0,(w-STAGE_W*k)/2)+'px';wrap.style.height=Math.ceil(STAGE_H*k)+'px';
    paint();
    const me=C;
    track.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      cancelAnimationFrame(me.raf);
      me.drag={x0:e.clientX,t0:me.turn,last:e.clientX,t:e.timeStamp,vx:0,moved:false,tgt:e.target};
      track.setAttribute('data-held','true');
      try{track.setPointerCapture(e.pointerId)}catch(x){}
    });
    track.addEventListener('pointermove',e=>{
      const g=me.drag;
      if(!g){
        /* tekan di bawah penunjuk: titik yang ditunjuk tenggelam, sisi jauhnya naik */
        if(e.pointerType!=='mouse')return;
        const card=e.target.closest&&e.target.closest('.car-slot'),f=card&&card.querySelector('.car-card');
        me.slots.forEach(sl=>{const cc=sl.querySelector('.car-card');if(cc!==f)cc.style.transform=''});
        if(f&&Number(card.style.zIndex)>=99){
          const b=f.getBoundingClientRect(),nx=clp((e.clientX-b.left)/b.width*2-1,-1,1),ny=clp((e.clientY-b.top)/b.height*2-1,-1,1),mx=SINK/100*13;
          f.style.transform='translateZ(-5px) rotateX('+(-ny*mx).toFixed(2)+'deg) rotateY('+(nx*mx).toFixed(2)+'deg)';
        }
        return;
      }
      const dx=(e.clientX-g.x0)/me.k;
      if(!g.moved&&Math.abs(dx)>3){g.moved=true;me.slots.forEach(sl=>{sl.querySelector('.car-card').style.transform=''})}
      const dt=Math.max(1,e.timeStamp-g.t);
      g.vx=(g.vx+(e.clientX-g.last)/me.k/dt)/2;g.last=e.clientX;g.t=e.timeStamp;
      /* sem elástico, porque não há fim: o arrasto é um-para-um */
      me.turn=g.t0-dx/PULL;paint();
    });
    track.addEventListener('pointerout',e=>{
      if(me.drag||e.pointerType!=='mouse')return;
      const to=e.relatedTarget;if(to&&track.contains(to))return;
      me.slots.forEach(sl=>{sl.querySelector('.car-card').style.transform=''});
    });
    const up=e=>{
      const g=me.drag;if(!g)return;me.drag=null;track.setAttribute('data-held','false');
      if(!g.moved&&e.type!=='pointercancel'){
        /* ketuk kartu di samping: bawa ke depan */
        const sl=g.tgt&&g.tgt.closest&&g.tgt.closest('.car-slot');
        if(sl&&Number(sl.style.zIndex)<99){carGo(list()[Number(sl.dataset.i)].id);return}
        glide(Math.round(me.turn));return;
      }
      /* kemana ia berhenti kalau terus bergerak, dibatasi agar lemparan keras
         tidak memutar cincin melebihi yang bisa diikuti mata */
      const carry=clp(-g.vx*TOSS/PULL,-MOST,MOST);
      glide(Math.round(me.turn+carry));
    };
    track.addEventListener('pointerup',up);track.addEventListener('pointercancel',up);
    track.addEventListener('keydown',e=>{
      const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();glide(Math.round(me.turn)+d);
    });
  };
})();
function blkCards(){
  if(ui.wlSel&&!S.cards.some(c=>c.id===ui.wlSel))ui.wlSel='';
  if(S.settings.cardView==='car'&&S.cards.length>1)return blkCar();
  if(S.settings.cardView==='col'&&S.cards.length>1)return blkCol();
  if(S.settings.cardView==='stack'&&S.cards.length)return blkStack();
  const n=S.cards.length,mode=S.settings.wlMode,theme=S.settings.wl||'neon',st=n?clamp(Math.floor(120/n),30,42):40;
  const cards=S.cards.map((c,i)=>{const on=ui.wlSel===c.id;
    return`<button class="wc ${on?'sel':''}" style="--i:${i}" data-action="wl-sel" data-id="${c.id}" aria-label="${on?'Masukkan':'Tarik'} kartu ${esc(c.name)}">${cardHTML(c)}</button>`}).join('');
  const swapI=IC.swap.replace('width="20" height="20"','width="13" height="13"');
  const pocket=n?`<button class="wl-pocket" data-action="wl-mode" aria-label="Ganti ringkasan dompet"><i class="sn l"></i><i class="sn r"></i><small>${mode==='debt'?'Total tagihan':'Total sisa limit'}</small><b class="num">${money(mode==='debt'?sum(D.debt):totalRemain())}</b><span class="hint">${swapI} Ketuk untuk ganti</span></button>`
    :`<div class="wl-pocket"><i class="sn l"></i><i class="sn r"></i><small>Belum ada kartu</small><button class="pbtn" data-action="fnew" data-arg="card" style="margin-top:8px">+ Kartu</button></div>`;
  return`<section class="blk"><div class="blk-h"><h2>Kartu kredit<small>${n}</small></h2><button class="tbtn" data-action="fnew" data-arg="card">+ Kartu</button></div>
    <div class="wl wk-${theme} ${ui.wlSel?'open':''}" id="wl" style="--n:${n};--st:${st}px"><div class="wl-stage"><div class="wl-back"></div>${cards}${pocket}</div>
    <div class="wl-detail" id="wlDetail" ${ui.wlSel?'':'hidden'}>${ui.wlSel?wlDetailHTML(ui.wlSel):''}</div></div></section>`;
}
function applyWl(){
  const w=$('#wl');if(!w){render();return}
  w.classList.toggle('open',!!ui.wlSel);
  w.querySelectorAll('.wc').forEach(b=>{const on=b.dataset.id===ui.wlSel,c=S.cards.find(x=>x.id===b.dataset.id);b.classList.toggle('sel',on);b.setAttribute('aria-label',(on?'Masukkan kartu ':'Tarik kartu ')+(c?c.name:''))});
  const d=$('#wlDetail');d.innerHTML=ui.wlSel?wlDetailHTML(ui.wlSel):'';d.hidden=!ui.wlSel;
  if(ui.wlSel)cardFlash(ui.wlSel,60);
}
const chev=open=>`<span class="chev ${open?'o':''}">${IC.down}</span>`;
function walletRow(w){const g=S.groups.find(x=>x.id===w.g);return`<button class="lrow" data-action="open-accd" data-id="${w.id}">${accIcon(w,40)}<span class="lm"><b>${esc(w.name)}</b><small>${esc(w.note||(g?g.name:''))}</small></span><span class="lr"><b>${money(D.bal[w.id]||0)}</b></span></button>`}
const grpCol=g=>g.color||PAL[hsh(g.id+'g')%PAL.length][1];
const walCol=w=>w.color||PAL[hsh(w.id)%PAL.length][1];
function wgRow(w,i){
  const b=D.bal[w.id]||0;
  return`<div class="wg-r" style="--c:${walCol(w)};--d:${i*40}ms"><button class="wg-m" data-action="open-accd" data-id="${w.id}"><i class="wg-bar${purOf(w)?' pu':''}"${purOf(w)?` style="--pc:${purCol(purOf(w))}" title="Peruntukan: ${esc(purOf(w).name)}"`:''}></i><span class="lm"><b>${esc(wLbl(w))}</b><small>${esc(w.note||'Ketuk untuk detail')}${wUse(w)!=='both'?' · '+USE_LBL[wUse(w)]:''}</small></span><b class="wg-amt ${b<0?'neg':''}" ${mv('wb:'+w.id,b)}>${money(b)}</b></button><button class="wg-add" data-action="open-acc" data-id="${w.id}" aria-label="Catat di ${esc(w.name)}">${IC.plus||'+'}</button></div>`;
}
const ring=(f,c)=>{const R=15,C=2*Math.PI*R,l=Math.max(.001,Math.min(1,f))*C;return`<span class="wg-ring"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/><circle cx="20" cy="20" r="${R}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${l.toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 20 20)"/></svg></span>`};
function blkWallets(){
  const anyOpen=S.groups.some(g=>!S.settings.collapsed[g.id]);
  const total=S.wallets.reduce((a,w)=>a+(D.bal[w.id]||0),0);
  const gs=S.groups.map(g=>{const ws=S.wallets.filter(w=>w.g===g.id);return{g,ws,tot:ws.reduce((a,w)=>a+(D.bal[w.id]||0),0)}});
  const pos=gs.reduce((a,x)=>a+Math.max(0,x.tot),0)||1;
  const seg=gs.filter(x=>x.tot>0).sort((a,b)=>b.tot-a.tot).map(x=>`<i style="flex:${x.tot};background:${grpCol(x.g)};--c:${grpCol(x.g)}" data-n="${esc(x.g.name)}" data-p="${(Math.round(x.tot/pos*1000)/10).toString().replace('.',',')}%" data-v="${esc(money(x.tot))}"></i>`).join('');
  const body=gs.map(({g,ws,tot})=>{const open=!S.settings.collapsed[g.id];
    return`<div class="wg ${open?'open':''}" style="--gc:${grpCol(g)}" id="wg-${g.id}"><button class="wg-h" data-action="tg" data-id="${g.id}" aria-expanded="${open}">${ring(Math.max(0,tot)/pos,grpCol(g))}<span class="wg-n">${esc(g.name)}<small>${ws.length} dompet · ${Math.round(Math.max(0,tot)/pos*100)}%</small></span><b class="wg-t" ${mv('gt:'+g.id,tot)}>${money(tot)}</b>${chev(open)}</button>
      <div class="wg-b"><div class="wg-in">${ws.map(wgRow).join('')||`<button class="wg-empty" data-action="fnew" data-arg="wallet">+ Tambah dompet</button>`}</div></div></div>`}).join('');
  return`<section class="blk"><div class="blk-h"><h2>Dompet & akun</h2><button class="tbtn" data-action="tgall">${anyOpen?'Tutup semua':'Buka semua'}</button></div>
    <div class="wsum ws3"><span class="ws2-k">Total saldo</span><b class="num ws2-v" ${mv('wt',total)}>${money(total)}</b>
      ${seg?`<div class="ws3-bar">${seg}</div>`:''}</div>
    ${body||'<p class="empty">Belum ada kelompok akun.</p>'}</section>`;
}
function sortedTx(){return S.tx.slice().reverse().sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0)}
const SYS={pay:['💳',2,'cookie6'],xfer:['⇄',3,'clover4'],gcard:['⚡',5,'sunny'],gin:['⚡',8,'sunny'],gfee:['🧾',0,'squircle']};
function txRow(t,ctx){
  const cat=S.cats.find(c=>c.id===t.cat),an=accName(t.acc);
  let ico,title='',meta='',sign='',cls='';
  switch(t.t){
    case'exp':ico=txIcon(cat,t,42);title=cat?cat.name+(t.sub?' · '+t.sub:''):'Tanpa kategori';sign='−';break;
    case'inc':ico=txIcon(cat,t,42);title=cat?cat.name+(t.sub?' · '+t.sub:''):'Tanpa kategori';sign='+';cls='pos';break;
    case'pay':title='Bayar kartu';meta=an+' → '+accName(t.to);break;
    case'xfer':title='Transfer';meta=an+' → '+accName(t.to);break;
    case'gcard':title='Gestun · tarik limit';sign='+';cls='warnc';break;
    case'gin':title='Gestun · dana masuk';sign='+';cls='pos';break;
    case'gfee':title='Gestun · biaya admin';sign='−';break;
  }
  if(!ico){const s=SYS[t.t];ico=shapeIcon(s[0],s[1],s[2],42)}
  if(!meta)meta=[t.t==='gfee'||(ctx&&t.acc===ctx)?'':an,t.note].filter(Boolean).join(' · ');
  return`<button class="lrow" data-action="tx-open" data-id="${t.id}">${ico}<span class="lm"><b>${esc(title)}</b><small>${esc(meta)}</small></span><span class="lr"><b class="${cls}">${sign}${money(t.amt)}</b>${t.sg?stampSVG(t.d,false,t.t,t.id):''}</span></button>`;
}
function txList(list,ctx){
  let h='',last='';
  list.forEach(t=>{if(t.d!==last){last=t.d;h+=`<div class="dh">${esc(relDate(t.d))}</div>`}h+=txRow(t,ctx)});
  return h||'<p class="empty">Belum ada transaksi.</p>';
}
/* ---- beranda: kartu anggaran "amplop" dengan air yang naik seiring pengeluaran ---- */
function blkBudget(){
  const M=catMonth('exp'),seen=ui.bwSeen||(ui.bwSeen={});
  const bs=S.cats.filter(c=>c.t==='exp'&&+c.budget>0).map(c=>({c,b:+c.budget,u:M.cats[c.id]||0})).map(x=>({...x,f:x.u/x.b})).sort((a,b)=>b.f-a.f);
  const head=`<div class="blk-h"><h2>Anggaran<small>${bs.length}</small></h2><button class="tbtn" data-action="fnew" data-arg="bud">+ Anggaran</button></div>`;
  if(!bs.length)return`<section class="blk">${head}<div class="surface bt-empty"><b>Belum ada anggaran</b><small>Beri batas bulanan per kategori. Kartunya terisi air saat pengeluaran bertambah.</small><button class="pbtn" data-action="fnew" data-arg="bud">+ Buat anggaran</button></div></section>`;
  const tile=({c,b,u,f})=>{
    const tone=f>=1?'neg':f>=.8?'warn':'ok',pct=Math.round(Math.min(1,f)*1000)/10,left=b-u,prev=seen[c.id];
    const rise=prev!==pct;seen[c.id]=pct;
    return`<button class="bt ${tone}" data-action="fedit" data-arg="bud" data-id="${esc(c.id)}" style="--lv:${pct};--from:${prev==null?0:prev}" aria-label="${esc(c.name)}: terpakai ${Math.round(f*100)} persen, ${left>=0?'sisa':'melebihi'} ${esc(money(Math.abs(left)))}">
      <i class="bw ${rise?'rise':''}" aria-hidden="true"></i>
      <span class="bt-h">${catIcon(c,36)}<em class="bt-p">${Math.round(f*100)}%</em></span>
      <b class="bt-n">${esc(c.name)}</b><span class="bt-v num">${left>=0?money(left):'−'+money(-left)}</span><small>${left>=0?'sisa dari '+money(b):'melebihi anggaran'}</small></button>`;
  };
  const tb=bs.reduce((a,x)=>a+x.b,0),tu=bs.reduce((a,x)=>a+x.u,0);
  return`<section class="blk">${head}<div class="bgrid">${bs.map(tile).join('')}</div><p class="bt-sum">Terpakai <b class="num">${money(tu)}</b> dari <b class="num">${money(tb)}</b> bulan ini</p></section>`;
}
function blkTx(){return`<section class="blk"><div class="blk-h"><h2>Mutasi terbaru</h2><button class="tbtn" data-action="nav" data-arg="mut">Semua</button></div><div class="surface">${txList(sortedTx().slice(0,10))}</div></section>`}
/* ---- transaksi berulang dan rencana (jatuh tempo kartu, tagihan berulang) ---- */
const monShift=(m,n)=>{const d=new Date(+m.slice(0,4),+m.slice(5)-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const recDate=(r,m)=>{const dim=new Date(+m.slice(0,4),+m.slice(5),0).getDate();return m+'-'+pad(Math.min(r.day,dim))};
/* buat transaksi untuk bulan-bulan yang tanggalnya sudah lewat sejak terakhir dibuat */
function runRecur(){
  let n=0;const td=today(),cur=td.slice(0,7);
  (S.recur||[]).forEach(r=>{let m=monShift(r.last,1),guard=0;
    while(m<=cur&&guard++<240){const d=recDate(r,m);if(d>td)break;S.tx.push({id:uid(),d,t:r.t,acc:r.acc,amt:r.amt,cat:r.cat||'',sub:r.sub||'',note:r.note||'',rec:r.id});r.last=m;m=monShift(m,1);n++}});
  return n;
}
/* rencana pada satu tanggal: jatuh tempo kartu (tagihan yang berjalan) dan tagihan berulang yang belum dibuat */
function planFor(ds){
  const out=[],td=today();
  S.cards.forEach(c=>{if(!c.due||(D.debt[c.id]||0)<=0)return;const d=nextOcc(c.due);if(d&&ymd(d)===ds)out.push({k:'due',c,amt:D.debt[c.id]})});
  if(ds>td)(S.recur||[]).forEach(r=>{const m=ds.slice(0,7);if(m>r.last&&recDate(r,m)===ds)out.push({k:'rec',r,amt:r.amt})});
  return out;
}
function dueNudge(){
  const rows=S.cards.map(c=>{const debt=D.debt[c.id]||0;if(!c.due||debt<=0)return null;const dn=daysTo(nextOcc(c.due));return dn<=5?{c,debt,dn}:null}).filter(Boolean).sort((a,b)=>a.dn-b.dn);
  if(!rows.length)return'';
  return`<section class="blk nudge due" role="status">${rows.map(x=>`<div class="nd-r"><div class="nd-t"><b>${esc(x.c.name)} jatuh tempo ${x.dn<=0?'hari ini':x.dn+' hari lagi'}</b><small>Tagihan ${money(x.debt)}</small></div><button class="pbtn" data-action="open-pay" data-id="${x.c.id}">Bayar</button></div>`).join('')}</section>`;
}
/* ---- Google Drive: cadangan otomatis ke folder tersembunyi milik aplikasi (appDataFolder) ----
   Token hanya di memori. Data lokal selalu menang: tidak ada pemulihan otomatis yang menimpa data. */
const GD={tok:'',exp:0,t:0,busy:false,newer:false,msg:'',act:''};
const GD_BUILD='gd-redirect-2';
const gdLogGet=()=>{try{return JSON.parse(safeStorage.get('penniq.gdlog')||'[]')}catch(e){return[]}};
function gdLog(m){const a=gdLogGet();a.push({t:Date.now(),m:String(m).slice(0,140)});try{safeStorage.set('penniq.gdlog',JSON.stringify(a.slice(-25)))}catch(e){}}
const authErr=m=>Object.assign(new Error(m),{auth:true});
const GD_CID='243479656515-c8a6tp0mhmhvc6erm9ga0054asrsv1n5.apps.googleusercontent.com';   /* Client ID bukan rahasia; bisa diganti di Atur */
const GD_FILE='penniq-cadangan.json',GD_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const gdAuto=()=>{const g=S&&S.settings&&S.settings.gd;return!!(g&&g.on&&g.cid)};
const gdSave=()=>{try{safeStorage.set(LS_KEY,JSON.stringify(S))}catch(e){}};
const gdFail=e=>{gdLog('GALAT: '+e.message);GD.msg=e.message;S.settings.gd.err=e.message;gdSave();setSync(e.auth?'gdneed':'gderr')};
const gdClear=()=>{GD.msg='';S.settings.gd.err='';gdSave()};
function gdLoad(){return new Promise((res,rej)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return res();
  const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.async=true;sc.onload=()=>res();sc.onerror=()=>rej(new Error('Tidak bisa memuat Google. Cek koneksi.'));document.head.appendChild(sc)})}
/* interactive=true: boleh membuka jendela login Google (hanya dari ketukan); false: coba diam-diam */
function gdToken(interactive){
  return new Promise(async(res,rej)=>{
    if(GD.tok&&Date.now()<GD.exp-60000)return res(GD.tok);
    const g=S.settings.gd;if(!g.cid)return rej(new Error('Isi Client ID dulu'));
    if(interactive){gdRedirect();return}   /* pindah halaman: promise ini sengaja tidak selesai */
    try{await gdLoad()}catch(e){return rej(e)}
    try{
      const tc=google.accounts.oauth2.initTokenClient({client_id:g.cid,scope:GD_SCOPE,
        callback:r=>{if(r.error)return rej(authErr((r.error==='access_denied'?'Izin ditolak oleh Google':'Google menolak login')+' ('+r.error+(r.error_description?': '+String(r.error_description).slice(0,100):'')+')'));
          if(google.accounts.oauth2.hasGrantedAllScopes&&!google.accounts.oauth2.hasGrantedAllScopes(r,GD_SCOPE))return rej(authErr('Akses ke Google Drive belum diizinkan. Ulangi login dan centang kotak akses Drive di layar izin.'));
          GD.tok=r.access_token;GD.exp=Date.now()+(+r.expires_in||3600)*1000;if(!g.ok){g.ok=true;gdSave()}res(GD.tok)},
        error_callback:e=>rej(authErr(e&&e.type==='popup_closed'?'Jendela login tertutup sebelum selesai (popup_closed)':'Login Google gagal ('+((e&&e.type)||'tidak diketahui')+')'))});
      tc.requestAccessToken({prompt:'none'});
    }catch(e){rej(e)}
  });
}
/* Login pengalihan halaman penuh (lebih andal di browser HP daripada jendela pop-up). Alamat kembali harus terdaftar di Google Cloud. */
function gdRedirectUri(){return location.origin+location.pathname.replace(/index\.html$/,'')}
function gdRedirect(){
  const g=S.settings.gd,st=uid()+Math.random().toString(36).slice(2,10);
  try{safeStorage.set('pq.gds',JSON.stringify({st,act:GD.act||'login',t:Date.now()}))}catch(e){}
  gdLog('mengalihkan ke Google (tindakan: '+(GD.act||'login')+')');
  const q={client_id:g.cid,redirect_uri:gdRedirectUri(),response_type:'token',scope:GD_SCOPE,include_granted_scopes:'true',state:st};
  if(!g.ok)q.prompt='consent';
  toast('Mengalihkan ke Google…');
  setTimeout(()=>{location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams(q).toString()},180);
}
/* dipanggil saat boot: baca hasil login dari alamat (#access_token=...), cek state, bersihkan alamat. Mengembalikan tindakan yang harus dilanjutkan, atau ''. */
function gdHandleReturn(){
  const h=location.hash;if(!/[#&](access_token|error)=/.test(h)||!/state=/.test(h))return'';
  const pr=new URLSearchParams(h.replace(/^#/,''));
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  let sv=null;try{sv=JSON.parse(safeStorage.get('pq.gds')||'null');safeStorage.set('pq.gds','')}catch(e){}
  if(!sv||!sv.st){gdFail(authErr('Balasan Google diterima, tetapi catatan permintaan login hilang (mungkin halaman dibuka di tab lain). Coba masuk lagi.'));return'err'}
  if(Date.now()-(sv.t||0)>15*60*1000){gdFail(authErr('Login Google berlangsung terlalu lama (lebih dari 15 menit). Coba masuk lagi.'));return'err'}
  if(pr.get('state')!==sv.st){gdFail(authErr('Balasan Google tidak cocok dengan permintaan login (state berbeda). Coba masuk lagi.'));return'err'}
  const g=S.settings.gd,act=sv.act||'login';
  if(pr.get('error')){gdLog('kembali dari Google: error='+pr.get('error'));gdFail(authErr((pr.get('error')==='access_denied'?'Izin ditolak oleh Google':'Google menolak login')+' ('+pr.get('error')+')'));return'err'}
  if(!(pr.get('scope')||'').includes('drive.appdata')){gdLog('kembali dari Google: scope tidak memuat drive.appdata');gdFail(authErr('Akses ke Google Drive belum diizinkan. Ulangi login dan centang kotak akses Drive di layar izin.'));return'err'}
  GD.tok=pr.get('access_token');GD.exp=Date.now()+(+pr.get('expires_in')||3600)*1000;g.ok=true;g.on=true;gdSave();gdLog('kembali dari Google: izin diterima (berlaku '+Math.round((+pr.get('expires_in')||3600)/60)+' menit)');
  return act;
}
/* setelah kembali dari Google: tampilkan Atur dan lanjutkan tindakan yang tertunda */
async function gdAfterReturn(act){
  ui.view='set';render();window.scrollTo(0,0);
  if(act==='err'){setSync('gdneed');toast(GD.msg||S.settings.gd.err||'Login Google gagal');return}
  if(act==='restore'){setSync('gdok');toast('Masuk berhasil. Ketuk Pulihkan sekali lagi.');return}
  setSync('gdsave');
  try{await gdUpload(true);setSync('gdok');gdClear();render();toast(act==='now'?'Tercadangkan ke Drive':'Terhubung ke Google Drive')}
  catch(e){gdFail(e);toast(e.message);render()}
}
async function gdFetch(url,opt,interactive){
  const t=await gdToken(interactive);
  const r=await fetch(url,Object.assign({},opt,{headers:Object.assign({Authorization:'Bearer '+t},(opt&&opt.headers)||{})}));
  if(r.status===401){GD.tok='';throw authErr('Sesi Google berakhir')}
  if(!r.ok){let m='';try{const j=await r.json();m=(j&&j.error&&(j.error.message||j.error.status))||''}catch(x){}throw new Error('Drive menolak ('+r.status+')'+(m?': '+String(m).slice(0,120):'')+(r.status===403?'. Cek Drive API aktif dan scope drive.appdata di Google Cloud':''))}
  return r;
}
async function gdFind(interactive){
  const r=await gdFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+encodeURIComponent("name='"+GD_FILE+"'")+'&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc',{},interactive);
  return((await r.json()).files||[])[0]||null;
}
async function gdUpload(interactive){
  const g=S.settings.gd;let id=g.fileId;
  if(!id){const f=await gdFind(interactive);id=f?f.id:''}
  g.last=Date.now();S.settings.lastBackup=g.last;const json=JSON.stringify(S);
  if(id){await gdFetch('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body:json},interactive)}
  else{const b='kcl'+Date.now().toString(36);
    const body='--'+b+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name:GD_FILE,parents:['appDataFolder']})+'\r\n--'+b+'\r\nContent-Type: application/json\r\n\r\n'+json+'\r\n--'+b+'--';
    const r=await gdFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body},interactive);id=(await r.json()).id}
  g.fileId=id;GD.newer=false;gdSave();gdLog('unggah berhasil');
}
async function gdRun(){
  if(!gdAuto()||GD.busy)return;GD.busy=true;setSync('gdsave');
  try{await gdUpload(false);setSync('gdok');gdClear()}catch(e){gdFail(e)}
  finally{GD.busy=false;if(ui.view==='set'&&!ui.sheet)render()}
}
/* dipanggil dari persist(): kirim setelah jeda supaya tidak tiap ketukan */
function gdSchedule(){if(!gdAuto())return;clearTimeout(GD.t);setSync('gdsave');GD.t=setTimeout(gdRun,6000)}
/* saat aplikasi dibuka: coba masuk diam-diam, beri tahu bila cadangan Drive lebih baru, kirim bila data lokal lebih baru */
async function gdBoot(){
  if(!gdAuto())return;setSync('gdneed');gdLog('aplikasi dibuka, mencoba masuk diam-diam');
  try{
    const f=await gdFind(false);setSync('gdok');gdLog('masuk diam-diam berhasil');
    if(f&&Date.parse(f.modifiedTime)>(S.settings.gd.last||0)+60000&&Date.parse(f.modifiedTime)>(S.updated||0)+60000){GD.newer=true;if(ui.view==='home')render()}
    else if(!f||(S.updated||0)>(S.settings.gd.last||0)+1000)gdSchedule();
  }catch(e){gdFail(e)}
}
async function gdLogin(){
  const g=S.settings.gd;if(!g.cid)return toast('Isi Client ID dulu');
  GD.act='login';gdRedirect();
}
async function gdRestore(){
  GD.act='restore';
  try{
    const f=await gdFind(true);if(!f)return toast('Belum ada cadangan di Drive');
    const r=await gdFetch('https://www.googleapis.com/drive/v3/files/'+f.id+'?alt=media',{},true);
    const o=await r.json();if(!o||!Array.isArray(o.wallets))return toast('File cadangan tidak valid');
    const keep=S.settings.gd,priv=S.settings.privacy;S=normalize(o);S.settings.gd=Object.assign({},keep,{fileId:f.id,last:Date.now()});S.settings.privacy=priv;GD.newer=false;
    closeSheet();commit('Dipulihkan dari Google Drive');
  }catch(e){toast(e.message)}
}
const gdLastTxt=ts=>{const d=new Date(ts);return ymd(d)===today()?'hari ini '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace(':','.'):bkAgo(ts).toLowerCase()};
const gdStatusTxt=()=>{const g=S.settings.gd,e=GD.msg||g.err;if(e)return'<span class="gd-err">'+esc(e)+'</span>';if(!g.on)return'Otomatis ke Drive Anda. Belum tersambung';return'Aktif'+(g.last?' · Terakhir: '+gdLastTxt(g.last):'')};
function gdNudge(){
  if(!GD.newer)return'';
  return`<section class="blk nudge" role="status"><div class="nd-t"><b>Cadangan di Drive lebih baru</b><small>Mungkin dari perangkat lain. Pulihkan untuk memakainya.</small></div><div class="nd-b"><button class="pbtn" data-action="gd-restore">Pulihkan</button><button class="tbtn" data-action="gd-skip">Abaikan</button></div></section>`;
}
/* meter anggaran per kategori: normal <80%, kuning 80-99%, merah >=100% */
function budMeter(r,type){
  const b=type==='exp'&&r.cat?+r.cat.budget||0:0;if(!(b>0))return'';
  const f=r.total/b,cls=f>=1?'over':f>=.8?'warn':'ok',left=b-r.total;
  return`<div class="bud ${cls}"><div class="bud-t"><span>Anggaran</span><span class="num">${money(r.total)} / ${money(b)}</span></div><div class="bud-b"><i style="width:${Math.min(100,f*100).toFixed(1)}%"></i></div><small>${left>=0?'Sisa '+money(left):'Melebihi '+money(-left)}</small></div>`;
}
/* ---- cadangan file, ekspor CSV, dan pengingat ---- */
const dlFile=(name,text,mime)=>{const b=new Blob([text],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)};
function bkFile(){S.settings.lastBackup=Date.now();dlFile('penniq-cadangan-'+today()+'.json',JSON.stringify(S),'application/json');persist();toast('Cadangan diunduh')}
const TXLBL={exp:'Pengeluaran',inc:'Pemasukan',xfer:'Transfer',pay:'Bayar kartu',gcard:'Gestun: tarik limit',gin:'Gestun: dana masuk',gfee:'Gestun: biaya admin'};
function csvExport(){
  const q=v=>{v=String(v==null?'':v);return/[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const rows=[['Tanggal','Jenis','Akun','Ke akun','Kategori','Subkategori','Jumlah','Catatan']];
  S.tx.slice().sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0).forEach(t=>{const c=S.cats.find(x=>x.id===t.cat);
    rows.push([t.d,TXLBL[t.t]||t.t,t.acc?accName(t.acc):'',t.to?accName(t.to):'',c?c.name:'',t.sub||'',Math.round(t.amt),t.note||''])});
  dlFile('penniq-transaksi-'+today()+'.csv','\ufeff'+rows.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  toast(rows.length-1+' transaksi diekspor');
}
const bkAgo=ts=>{if(!ts)return'Belum pernah';const d=Math.floor((Date.now()-ts)/864e5);return d<1?'Hari ini':d+' hari lalu'};
function bkNudge(){
  const st=S.settings;if(S.tx.length<5||(typeof gdAuto==='function'&&gdAuto()))return'';
  const last=Math.max(st.lastBackup,st.bkBase),days=Math.floor((Date.now()-last)/864e5);
  if(days<7||Date.now()<st.bkSnooze)return'';
  return`<section class="blk nudge" role="status"><div class="nd-t"><b>${st.lastBackup?'Terakhir dicadangkan '+days+' hari lalu':'Data belum pernah dicadangkan'}</b><small>Simpan salinan supaya aman kalau data HP terhapus.</small></div><div class="nd-b"><button class="pbtn" data-action="bk-file">Cadangkan</button><button class="tbtn" data-action="bk-snooze">Nanti</button></div></section>`;
}
VIEWS.home=function(){
  const b={chart:blkChart,actions:blkActions,cards:blkCards,wallets:blkWallets,budget:blkBudget,tx:blkTx};
  return gdNudge()+dueNudge()+bkNudge()+S.settings.layout.filter(x=>x.on).map(x=>b[x.id]()).join('')||'<p class="empty">Semua blok disembunyikan. Atur di menu Atur, bagian Susunan Beranda.</p>';
};
const MUTF=[['all','Semua'],['exp','Keluar'],['inc','Masuk'],['card','Kartu'],['xfer','Transfer'],['gest','Gestun']];
function mutFilter(t){const f=ui.mutF;if(f==='all')return true;if(f==='exp')return t.t==='exp'||t.t==='gfee';if(f==='inc')return t.t==='inc';
  if(f==='card')return isCard(t.acc)||t.t==='pay';if(f==='xfer')return t.t==='xfer';if(f==='gest')return!!t.link;return true}
/* ---- halaman Transaksi: tab bulan, ringkasan bulan, kelompok per hari ---- */
const MONF=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const accCol=id=>{const a=accById(id);return a?(a.color||PAL[hsh(a.id)%PAL.length][1]):'#8a8f98'};
const accChip=id=>{const n=accName(id);return n?`<i class="tchip" style="--c:${accCol(id)}">${esc(n)}</i>`:''};
function mutMonth(){return ui.mutM||today().slice(0,7)}
function mutMatch(t,q){
  if(!q)return true;const cat=S.cats.find(c=>c.id===t.cat);
  return normalize2([t.note,t.sub,cat&&cat.name,accName(t.acc),accName(t.to),String(t.amt)].join(' ')).includes(normalize2(q));
}
const normalize2=x=>String(x||'').toLowerCase();
function txRow2(t){
  const cat=S.cats.find(c=>c.id===t.cat);let ico,title,chips='',amt='',cls='';
  const catTxt=cat?cat.name+(t.sub?' · '+t.sub:''):'Tanpa kategori';
  switch(t.t){
    case'exp':case'inc':ico=txIcon(cat,t,42);title=t.note||catTxt;
      chips=accChip(t.acc)+(t.note?`<i class="tchip cat">${esc(catTxt)}</i>`:'')+(t.rec?'<i class="tchip cat">↻ Berulang</i>':'');
      cls=t.t==='inc'?'pos':'neg';amt=(t.t==='inc'?'+':'−')+money(t.amt);break;
    case'pay':case'xfer':
      title=t.t==='pay'?'Bayar kartu':'Transfer';chips=accChip(t.acc)+'<span class="tarr">→</span>'+accChip(t.to);
      cls='mid';amt=`<span class="arr">⇄</span>${money(t.amt)}`;break;
    case'gcard':title='Gestun · tarik limit';chips=accChip(t.acc);cls='warnc';amt='+'+money(t.amt);break;
    case'gin':title='Gestun · dana masuk';chips=accChip(t.acc);cls='pos';amt='+'+money(t.amt);break;
    default:title='Gestun · biaya admin';cls='neg';amt='−'+money(t.amt);
  }
  if(!ico){const sy=SYS[t.t];ico=shapeIcon(sy[0],sy[1],sy[2],42)}
  return`<button class="lrow tr2" data-action="tx-open" data-id="${t.id}">${ico}<span class="lm"><b>${esc(title)}</b><span class="tchips">${chips}</span></span><span class="lr"><b class="${cls}">${amt}</b>${t.sg?stampSVG(t.d,false,t.t,t.id):''}</span></button>`;
}
function mutBody(){
  const m=mutMonth(),q=(ui.mutQ||'').trim();
  const mon=sortedTx().filter(t=>t.d.slice(0,7)===m);
  let out=0,inn=0;mon.forEach(t=>{if(t.t==='exp'||t.t==='gfee')out+=t.amt;else if(t.t==='inc')inn+=t.amt});
  const l=mon.filter(mutFilter).filter(t=>mutMatch(t,q));
  const sum=`<div class="msum"><div><small>Keluar</small><b class="neg">${money(out)}</b></div><div><small>Masuk</small><b class="pos">${money(inn)}</b></div><div><small>Selisih</small><b class="${inn-out<0?'neg':'pos'}">${inn-out<0?'−':'+'}${money(Math.abs(inn-out))}</b></div></div>`;
  /* kalender: bawaan ringkas (7 hari terakhir, satu baris); ketuk bar untuk membuka seluruh bulan. Tiap tanggal menampilkan selisih (masuk − keluar). */
  const lall=sortedTx().filter(mutFilter).filter(t=>mutMatch(t,q)),filtering=!!q||ui.mutF!=='all';
  const byD={};lall.forEach(t=>{const o=byD[t.d]||(byD[t.d]={net:0,n:0});o.n++;if(t.t==='exp'||t.t==='gfee')o.net-=t.amt;else if(t.t==='inc')o.net+=t.amt});
  const cmp=v=>{const a=Math.abs(v);let t;if(a>=1e6){t=(a/1e6).toFixed(a>=1e7?0:1).replace('.0','').replace('.',',')+'jt'}else if(a>=1e3){t=Math.round(a/1e3)+'rb'}else t=String(a);return(v<0?'−':'+')+t};
  const WD=['Min','Sen','Sel','Rab','Kam','Jum','Sab'],cy=+m.slice(0,4),cm=+m.slice(5)-1,tdy=today(),curM=tdy.slice(0,7),full=!!ui.calFull;
  const planNet=pl=>pl.reduce((a,x)=>x.k==='rec'?a+(x.r.t==='inc'?x.amt:-x.amt):a,0);
  const cell=(ds,wd)=>{const o=byD[ds],pl=filtering?[]:planFor(ds),dd=parseD(ds).getDate(),isT=ds===tdy,on=ui.mutSel===ds,has=!!o||pl.length>0;
    let amt='';
    if(o)amt=o.net===0?'<em class="ca z">•</em>':`<em class="ca ${o.net>0?'p':'n'}">${S.settings.privacy?'•••':cmp(o.net)}</em>`;
    else if(pl.length){const pn=planNet(pl);amt=`<em class="ca pl">${pl.some(x=>x.k==='due')&&!pn?'Tempo':S.settings.privacy?'•••':cmp(pn)}</em>`}
    const inner=`${wd?`<span class="cwd">${WD[parseD(ds).getDay()]}</span>`:''}<span class="cn ${isT?'t':''}">${dd}</span>${amt}`;
    return has?`<button class="cd has ${on?'sel':''} ${pl.length&&o?'plan':''}" data-action="mutcal" data-arg="${ds}" aria-label="${dd} ${MON[parseD(ds).getMonth()]}${o?', '+o.n+' transaksi':''}${pl.length?', '+pl.length+' rencana':''}">${inner}</button>`:`<i class="cd">${inner}</i>`};
  let head,body;
  if(full){
    const first=new Date(cy,cm,1).getDay(),dim=new Date(cy,cm+1,0).getDate();
    let cells='';for(let i=0;i<first;i++)cells+='<i class="cd e"></i>';for(let d=1;d<=dim;d++)cells+=cell(m+'-'+pad(d),false);
    head=`<button class="chd" data-action="calfull" aria-expanded="true"><span class="dt"><b>${MON[cm]} ${cy}</b><small>Selisih per tanggal · ketuk untuk meringkas</small></span>${chev(true)}</button>`;
    body=`<div class="cw">${WD.map(x=>`<span>${x}</span>`).join('')}</div><div class="cg">${cells}</div>`;
  }else{
    const anchor=m===curM?tdy:m<curM?m+'-'+pad(new Date(cy,cm+1,0).getDate()):m+'-07';
    const days=[];for(let i=6;i>=0;i--)days.push(addDays(anchor,-i));
    const wnet=days.reduce((a,d)=>a+(byD[d]?byD[d].net:0),0),rg=d=>parseD(d).getDate()+' '+MONS[parseD(d).getMonth()];
    const ttl=m===curM?'7 hari terakhir':m<curM?'Minggu terakhir bulan ini':'Minggu pertama bulan ini';
    head=`<button class="chd" data-action="calfull" aria-expanded="false"><span class="dt"><b>${ttl}</b><small>${rg(days[0])} – ${rg(days[6])}</small></span><span class="dtn ${wnet<0?'neg':wnet>0?'pos':''}">${wnet<0?'−':wnet>0?'+':''}${money(Math.abs(wnet))}</span>${chev(false)}</button>`;
    body=`<div class="cg">${days.map(d=>cell(d,true)).join('')}</div>`;
  }
  const cal=`<div class="mcal ${full?'cm-f':'cm-s'}">${head}${body}</div>`;
  let panel='';
  if(calOn()&&ui.mutSel){const o=byD[ui.mutSel],pl=filtering?[]:planFor(ui.mutSel);
    if(o||pl.length){
      const prow=x=>{if(x.k==='due'){const mn=Math.round(x.amt*(x.c.minPct==null?10:x.c.minPct)/100/1000)*1000;
          return`<div class="plr"><i class="pld"></i><span class="lm"><b>Jatuh tempo ${esc(x.c.name)} ••${esc(x.c.last4)}</b><small>Tagihan · minimum ${money(mn)}</small></span><span class="lr"><b>${money(x.amt)}</b></span></div>`}
        const c=S.cats.find(y=>y.id===x.r.cat);return`<div class="plr"><i class="pld"></i><span class="lm"><b>${esc((c?c.name:'Tanpa kategori')+(x.r.note?' · '+x.r.note:''))}</b><small>Rencana berulang · ${esc(accName(x.r.acc))}</small></span><span class="lr"><b class="${x.r.t==='inc'?'pos':'neg'}">${x.r.t==='inc'?'+':'−'}${money(x.amt)}</b></span></div>`};
      const rows=(pl.length?`<div class="pl-h">Rencana</div>${pl.map(prow).join('')}`:'')+(o?`${pl.length?'<div class="pl-h">Transaksi</div>':''}${lall.filter(t=>t.d===ui.mutSel).map(txRow2).join('')}`:'');
      const sub=[o?o.n+' transaksi':'',pl.length?pl.length+' rencana':''].filter(Boolean).join(' · ');
      panel=`<div class="cpanel"><div class="cph"><span class="dt"><b>${esc(relDate(ui.mutSel))}</b><small>${sub}</small></span>${o?`<span class="dtn ${o.net<0?'neg':o.net>0?'pos':''}">${o.net<0?'−':o.net>0?'+':''}${money(Math.abs(o.net))}</span>`:''}<button class="ibtn sm" data-action="mutcalx" aria-label="Tutup riwayat tanggal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>${rows}</div>`}}
  /* hari ini terbuka, hari sebelumnya tertutup; saat mencari/memfilter semua terbuka. Ringkasan hari tetap terlihat di header. */
  const td=today();
  let h='',last='',buf='',net=0,cnt=0,di=0,dout=0;
  const flush=()=>{if(!last)return;const ov=ui.mutDay[last],open=ov!==undefined?ov:(filtering||last===td);
    const parts=[`<span class="dsp">${cnt} transaksi</span>`];/* rincian masuk/keluar hanya bila keduanya ada; kalau cuma satu, angkanya sudah di kanan */
    if(di>0&&dout>0)parts.push(`<span class="dsp">Masuk <span class="pos">${money(di)}</span></span>`);if(di>0&&dout>0)parts.push(`<span class="dsp">Keluar <span class="neg">${money(dout)}</span></span>`);
    h+=`<div class="md ${open?'open':''}" data-d="${last}"><button class="dh3" data-action="mutday" data-arg="${last}" aria-expanded="${open}"><span class="dt"><b>${esc(relDate(last))}</b><small>${parts.join('')}</small></span><span class="dtn">${net<0?'−':net>0?'+':''}${money(Math.abs(net))}</span>${chev(open)}</button><div class="md-b"><div class="md-in">${buf}</div></div></div>`;buf='';net=0;cnt=0;di=0;dout=0};
  l.forEach(t=>{if(t.d!==last){flush();last=t.d}buf+=txRow2(t);cnt++;if(t.t==='exp'||t.t==='gfee'){net-=t.amt;dout+=t.amt}else if(t.t==='inc'){net+=t.amt;di+=t.amt}});flush();
  const empty=`<p class="empty">${q?'Tidak ada transaksi yang cocok.':'Belum ada transaksi di '+MONF[+m.slice(5)-1]+'.'}</p>`;
  return sum+(calOn()?cal+`<div class="cpw ${panel?'open':''}"><div class="cpi">${panel}</div></div>`:'')+`<div class="surface">${h||empty}</div>`;
}
const RM=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
/* perbarui panel tanggal dan penanda pilihan tanpa menggambar ulang kalender: panel membuka/menutup dengan gerak pegas */
function calSync(){
  const wrap=$('.cpw'),b=$('#mutBody');if(!wrap||!b){if(b)b.innerHTML=mutBody();return}
  const tmp=document.createElement('div');tmp.innerHTML=mutBody();
  const inner=wrap.querySelector('.cpi'),html=tmp.querySelector('.cpi').innerHTML,open=!!ui.mutSel&&!!html.trim();
  clearTimeout(wrap._t);
  if(open){inner.innerHTML=html;wrap.classList.add('open')}
  else{wrap.classList.remove('open');wrap._t=setTimeout(()=>{if(!wrap.classList.contains('open'))inner.innerHTML=''},540)}
  document.querySelectorAll('.cd.sel').forEach(e=>e.classList.remove('sel'));
  if(ui.mutSel){const c=document.querySelector('.cd.has[data-arg="'+ui.mutSel+'"]');if(c)c.classList.add('sel')}
  if(open)setTimeout(()=>wrap.scrollIntoView({behavior:RM()?'auto':'smooth',block:'nearest'}),60);
}
VIEWS.mut=function(){
  const cur=today().slice(0,7),m=mutMonth(),mi=k=>+k.slice(0,4)*12+ +k.slice(5)-1,mk=n=>Math.floor(n/12)+'-'+String(n%12+1).padStart(2,'0');
  /* deret bulan tanpa putus: dari bulan transaksi tertua sampai 3 bulan setelah bulan ini (atau 2 setelah bulan terpilih) */
  const all=S.tx.map(t=>mi(t.d.slice(0,7)));
  const a=Math.min(mi(cur),mi(m)-2,...all),z=Math.max(mi(cur)+3,mi(m)+2),months=[];
  for(let n=a;n<=z;n++)months.push(mk(n));
  return`<section class="blk"><div class="blk-h"><h2 style="flex:1">Transaksi</h2><button class="ibtn sm ${ui.mutS?'on':''}" data-action="muts" aria-label="Cari transaksi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button></div>
    ${ui.mutS?`<input id="mutq" class="mutq" data-input="mutq" placeholder="Cari catatan, kategori, dompet, nominal" value="${esc(ui.mutQ||'')}" autocomplete="off">`:''}
    <div class="mtabs" id="mtabs">${months.map(k=>`<button class="mm ${k===m?'on':''}" data-action="mutm" data-arg="${k}"><span>${MONS[+k.slice(5)-1]}</span><small>${k.slice(0,4)}</small></button>`).join('')}</div>
    <div class="chips" style="margin:2px 0 12px">${MUTF.filter(f=>f[0]!=='gest'||gestOn()||ui.mutF==='gest').map(f=>`<button class="chip ${ui.mutF===f[0]?'on':''}" data-action="mutf" data-arg="${f[0]}">${f[1]}</button>`).join('')}</div>
    <div id="mutBody">${mutBody()}</div></section>`;
};

/* ---- grafik kekayaan ---- */
let CH=null;
function drawChart(){
  const cv=$('#chart');if(!cv)return;
  const all=series(),pts=ui.range===0?all:ui.range===-1?(all.filter(p=>p.d>=new Date().getFullYear()+'-01-01').length>1?all.filter(p=>p.d>=new Date().getFullYear()+'-01-01'):all.slice(-2)):all.slice(-(ui.range+1)),n=pts.length;
  const w=cv.parentElement.clientWidth||340,h=236,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';
  const vals=pts.map(p=>p.a-p.l);let mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
  if(mx-mn<1){mx+=1;mn-=1}const pd=(mx-mn)*.14;mn-=pd;mx+=pd;
  const priv=S.settings.privacy,L=priv?22:52,R=22,top=18,bot=30;
  const xs=pts.map((_,i)=>L+(n>1?i/(n-1):0)*(w-L-R));
  const ys=vals.map(v=>top+(mx-v)/(mx-mn)*(h-top-bot));
  const layer=document.createElement('canvas');layer.width=Math.round(w*dpr);layer.height=Math.round(h*dpr);
  const g=layer.getContext('2d');g.scale(dpr,dpr);
  const up=vals[n-1]>=vals[0],col=up?'168,245,82':'255,107,107',hex=up?'#A8F552':'#FF6B6B';
  const short=v=>{const a=Math.abs(v),sg=v<0?'−':'';const f=(x,u)=>sg+(x>=100?Math.round(x):x.toFixed(1).replace(/\.0$/,'')).toString().replace('.',',')+u;
    return a>=1e9?f(a/1e9,' M'):a>=1e6?f(a/1e6,' jt'):a>=1e3?f(a/1e3,' rb'):sg+Math.round(a)};
  g.font='500 10.5px '+getComputedStyle(document.body).fontFamily;g.textBaseline='middle';
  /* dashed grid + y labels */
  const GN=4;g.lineWidth=1;
  for(let k=0;k<=GN;k++){const y=top+(h-top-bot)*k/GN+.5,v=mx-(mx-mn)*k/GN;
    g.strokeStyle='rgba(255,255,255,.10)';g.setLineDash([5,6]);g.beginPath();g.moveTo(L,y);g.lineTo(w-R,y);g.stroke();g.setLineDash([]);
    if(!priv){g.fillStyle='rgba(255,255,255,.42)';g.textAlign='right';g.fillText(short(v),L-10,y)}}
  /* x labels */
  g.fillStyle='rgba(255,255,255,.42)';g.textBaseline='alphabetic';
  const XN=Math.min(5,n);
  for(let k=0;k<XN;k++){const i=Math.round(k*(n-1)/Math.max(1,XN-1)),d=parseD(pts[i].d);
    g.textAlign=k===0?'left':k===XN-1?'right':'center';
    g.fillText(d.getDate()+' '+MONS[d.getMonth()],k===0?xs[i]-8:k===XN-1?xs[i]+8:xs[i],h-9)}
  /* smooth line (midpoint quadratic) */
  const path=()=>{g.moveTo(xs[0],ys[0]);
    if(n<3){for(let i=1;i<n;i++)g.lineTo(xs[i],ys[i])}
    else{for(let i=1;i<n-1;i++)g.quadraticCurveTo(xs[i],ys[i],(xs[i]+xs[i+1])/2,(ys[i]+ys[i+1])/2);g.lineTo(xs[n-1],ys[n-1])}};
  /* latar bercahaya mengikuti bentuk garis: memudar ke bawah */
  const yb=h-bot,ymin=Math.min.apply(null,ys);
  const ag=g.createLinearGradient(0,ymin,0,yb);ag.addColorStop(0,`rgba(${col},.20)`);ag.addColorStop(.6,`rgba(${col},.06)`);ag.addColorStop(1,`rgba(${col},0)`);
  g.beginPath();path();g.lineTo(xs[n-1],yb);g.lineTo(xs[0],yb);g.closePath();g.fillStyle=ag;g.fill();
  g.lineJoin='round';g.lineCap='round';g.lineWidth=2.5;g.strokeStyle=hex;
  g.shadowColor=`rgba(${col},.45)`;g.shadowBlur=10;
  g.beginPath();path();g.stroke();g.shadowBlur=0;
  /* marker: first + highest */
  let hi=0;vals.forEach((v,i)=>{if(v>vals[hi])hi=i});
  const dot=(i)=>{const x=xs[i],y=ys[i];g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(x,y+1.5,9,0,7);g.fill();g.fillStyle=hex;g.beginPath();g.arc(x,y,8,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x,y,5.2,0,7);g.fill()};
  dot(0);if(hi!==0&&hi!==n-1)dot(hi);
  CH={cv,pts,xs,ys,vals,w,h,dpr,layer,n,scrub:false,hex,col,L,R,top,bot};
  const idxAt=e=>{const r=cv.getBoundingClientRect();return clamp(Math.round((e.clientX-r.left-L)/(w-L-R)*(n-1)),0,n-1)};
  cv.onpointerdown=e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}CH.scrub=true;const i=idxAt(e);paintChart(i);setReadout(i,true)};
  cv.onpointermove=e=>{if(!CH.scrub&&e.pointerType!=='mouse')return;const i=idxAt(e);paintChart(i);setReadout(i,true)};
  cv.onpointerup=cv.onpointercancel=cv.onpointerleave=()=>{CH.scrub=false;paintChart(n-1);setReadout(n-1,false)};
  paintChart(n-1);setReadout(n-1,false);
}
function paintChart(i){
  const c=CH,ctx=c.cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.cv.width,c.cv.height);
  ctx.drawImage(c.layer,0,0);ctx.scale(c.dpr,c.dpr);
  const x=c.xs[i],y=c.ys[i];
  if(i!==c.n-1||c.scrub){ctx.strokeStyle=c.hex;ctx.globalAlpha=.7;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,c.top-6);ctx.lineTo(x,c.h-c.bot+2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(x,y+1.5,9.5,0,7);ctx.fill();
  ctx.fillStyle=c.hex;ctx.beginPath();ctx.arc(x,y,8.5,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,5.4,0,7);ctx.fill();
}
function setReadout(i,scrub){
  if(!CH)return;const p=CH.pts[i],v=CH.vals[i],first=CH.vals[0],dl=v-first;
  const set=(id,t)=>{const el=$(id);if(el)el.textContent=t};
  const num=(id,k,val)=>{const el=$(id);if(!el)return;if(scrub){if(el._r){cancelAnimationFrame(el._r);el._r=0;el.classList.remove('up','dn')}el.textContent=money(val)}else rollTo(el,k,val)};
  num('#nwVal','nw',v);num('#asetVal','na',p.a);num('#lbVal','nl',p.l);
  const pct=first>0?(Math.abs(dl)/first*100):null,lab={7:'7 hari terakhir',30:'1 bulan terakhir',90:'3 bulan terakhir',180:'6 bulan terakhir',365:'1 tahun terakhir','-1':'Tahun ini',0:'Sejak awal'}[ui.range];
  const el=$('#nwDelta');if(el){el.className='dpill '+(dl>=0?'':'down');el.textContent=(dl>=0?'▲ ':'▼ ')+money(Math.abs(dl))+(pct!==null&&!S.settings.privacy?' · '+pct.toFixed(1).replace('.',',')+'%':'')}
  set('#nwDate',scrub?fmtDate(p.d):lab);
  /* KANTONG: digeser ke bagian yang sedang naik = maskot senang */
  if(window.mascot){if(scrub){const j=Math.max(0,i-Math.max(1,Math.round(CH.vals.length*0.04)));if(v>CH.vals[j])mascot.happy(500);else if(dl>=0)mascot.curious(600);else mascot.calm()}}
}

/* ---- analitik ---- */
const isExpT=t=>t.t==='exp'||t.t==='gfee',isIncT=t=>t.t==='inc';
/* donat: cincin tipis bertepi bulat; kategori <3% (atau di luar 6 teratas) digabung jadi "Lainnya".
   Tiap segmen punya lingkaran sentuh yang lebih lebar supaya mudah diketuk. */
let AN=null;
const AN_OTHER='#5B5B66';
function anSegs(rows,total){
  let big=rows.filter((r,i)=>i<6&&total&&r.total/total>=.03),rest=rows.filter(r=>!big.includes(r));
  if(rest.length===1){big.push(rest[0]);rest=[]}
  big.sort((a,b)=>b.total-a.total);
  const segs=big.map(r=>({k:r.k,name:r.cat?r.cat.name:'Tanpa kategori',total:r.total,color:r.color}));
  rest.forEach(r=>{r.color=AN_OTHER;r.og=1});
  if(rest.length)segs.push({k:'_o',name:'Lainnya',total:rest.reduce((a,r)=>a+r.total,0),color:AN_OTHER});
  return segs;
}
const anPct=(v,t)=>{if(!t)return'0%';const p=v/t*100;return p<1?'<1%':Math.round(p)+'%'};
function donut(segs,total,draw){
  const R=76,SW=12,GAP=3,C=2*Math.PI*R;let out=`<circle cx="100" cy="100" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="${SW}"/>`;
  if(total&&segs.length===1){
    out+=`<circle class="dseg" data-c="${esc(segs[0].k)}" cx="100" cy="100" r="${R}" fill="none" stroke="${segs[0].color}" stroke-width="${SW}" style="--i:0"/>`;
    out+=`<circle class="dhit" data-action="ansel" data-arg="${esc(segs[0].k)}" cx="100" cy="100" r="${R}" fill="none" stroke="transparent" stroke-width="30"/>`;
  }else if(total){
    let a=0,hits='';
    segs.forEach((g,i)=>{const len=g.total/total*C,dash=Math.max(.01,len-SW-GAP),off=-(a+SW/2+GAP/2);
      out+=`<circle class="dseg" data-c="${esc(g.k)}" cx="100" cy="100" r="${R}" fill="none" stroke="${g.color}" stroke-width="${SW}" stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" style="--i:${i};--d:${dash.toFixed(2)}"/>`;
      hits+=`<circle class="dhit" data-action="ansel" data-arg="${esc(g.k)}" cx="100" cy="100" r="${R}" fill="none" stroke="transparent" stroke-width="30" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-a).toFixed(2)}"/>`;
      a+=len});
    out+=hits;
  }
  return`<svg viewBox="0 0 200 200" class="donut ${draw?'draw':''}" aria-hidden="true">${out}</svg>`;
}
function anCenterB(g){return`<span class="dcb-n"><i style="background:${g.color}"></i>${esc(g.name)} · ${anPct(g.total,AN.total)}</span><b class="num">${money(g.total)}</b><small>dari ${money(AN.total)}</small>`}
/* pilih segmen: perbarui kelas dan teks tengah saja, tanpa menggambar ulang */
const anAllLabel=()=>{const b=document.querySelector('[data-action="tgcall"]');if(b)b.textContent=document.querySelector('.grp[data-ck].open')?'Tutup semua':'Buka semua'};
function anSelSync(){
  const w=$('.dn-w');if(!w||!AN)return;const k=ui.anSel,g=AN.segs.find(x=>x.k===k);
  w.classList.toggle('has-sel',!!g);
  w.querySelectorAll('.dseg').forEach(e=>e.classList.toggle('on',!!g&&e.dataset.c===k));
  document.querySelectorAll('.lg2').forEach(e=>e.classList.toggle('on',!!g&&e.dataset.c===k));
  if(g)w.querySelector('.dc-b').innerHTML=anCenterB(g);
  document.querySelectorAll('.grp[data-ck]').forEach(e=>e.classList.toggle('on',!!g&&(e.dataset.ck===k||(k==='_o'&&!!e.dataset.og))));
}
/* ---- laporan: grafik arus kas (masuk vs keluar) ---- */
const AR=[[30,'1 Bln'],[90,'3 Bln'],[180,'6 Bln'],[365,'1 Thn'],[0,'Semua']];
const shortRp=v=>{const a=Math.abs(v),sg=v<0?'−':'';const f=(x,u)=>sg+(x>=100?Math.round(x):x.toFixed(1).replace(/\.0$/,'')).toString().replace('.',',')+u;
  return a>=1e9?f(a/1e9,' M'):a>=1e6?f(a/1e6,' jt'):a>=1e3?f(a/1e3,' rb'):sg+Math.round(a)};
function anBuckets(r){
  const T=today(),now=new Date(),B=[];
  const dl=s=>{const d=parseD(s);return d.getDate()+' '+MONS[d.getMonth()]};
  const days=(n,step)=>{for(let k=n-1;k>=0;k--){const to=addDays(T,-step*k),from=addDays(to,-(step-1));B.push({from,to,lab:dl(to),full:step===1?fmtDate(to):dl(from)+' – '+dl(to),inc:0,ex:0})}};
  const months=n=>{for(let i=n-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),e=new Date(d.getFullYear(),d.getMonth()+1,0);
    B.push({from:ymd(d),to:ymd(e),lab:MONS[d.getMonth()]+(n>12?" '"+String(d.getFullYear()).slice(2):''),full:MON[d.getMonth()]+' '+d.getFullYear(),inc:0,ex:0})}};
  if(r===30)days(10,3);else if(r===90)days(13,7);else if(r===180)months(6);else if(r===365)months(12);
  else{
    let first=T;S.tx.forEach(t=>{if((isExpT(t)||isIncT(t))&&t.d<first)first=t.d});
    const f=parseD(first),mc=(now.getFullYear()-f.getFullYear())*12+now.getMonth()-f.getMonth()+1;
    if(mc<4){const dd=Math.round((parseD(T)-f)/864e5)+1;days(clamp(Math.ceil(dd/7)+1,4,26),7)}else months(Math.min(mc,60));
  }
  S.tx.forEach(t=>{const e=isExpT(t),i=isIncT(t);if(!e&&!i)return;const b=B.find(x=>t.d>=x.from&&t.d<=x.to);if(b){if(e)b.ex+=t.amt;else b.inc+=t.amt}});
  return B;
}
let AC=null;
function anFlowBlk(){
  if(ui.arange==null)ui.arange=90;
  return`<section class="blk"><div class="blk-h"><h2>Arus kas</h2><div class="legend" style="margin:0"><span><b style="background:var(--acc)"></b>Masuk</span><span><b style="background:var(--neg)"></b>Keluar</span></div></div>
    <div class="surface" style="padding:16px 0 14px">
      <div style="padding:0 16px"><small id="anLab" class="lbl"></small>
        <div style="display:grid;grid-template-columns:repeat(3,auto);justify-content:space-between;gap:8px;margin-top:6px;white-space:nowrap"><div><small class="lbl">Masuk</small><br><b id="anI" style="color:var(--acc);font-size:14px"></b></div><div><small class="lbl">Keluar</small><br><b id="anE" style="color:var(--neg);font-size:14px"></b></div><div><small class="lbl">Selisih</small><br><b id="anN" style="font-size:14px"></b></div></div></div>
      <div class="chart-wrap" style="margin:12px 0 0;height:230px"><canvas id="achart" aria-label="Grafik arus kas"></canvas></div>
      <div class="bgroup rng" role="group" aria-label="Rentang waktu" style="margin:6px 16px 0">${AR.map(r=>`<button class="${ui.arange===r[0]?'on':''}" data-action="arange" data-arg="${r[0]}">${r[1]}</button>`).join('')}</div>
    </div></section>`;
}
function drawAn(){
  const cv=$('#achart');if(!cv)return;
  const B=anBuckets(ui.arange),n=B.length,priv=S.settings.privacy;
  const w=cv.parentElement.clientWidth||340,h=230,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';
  const L=priv?20:50,R=22,top=14,bot=28,pw=w-L-R,ph=h-top-bot;
  let mx=Math.max(1,...B.map(b=>Math.max(b.inc,b.ex)))*1.08;
  const raw=mx/4,mag=Math.pow(10,Math.floor(Math.log10(raw))),nz=[1,2,2.5,5,10].find(k=>raw<=k*mag)*mag;mx=nz*4;
  const xs=B.map((_,i)=>L+(n>1?i/(n-1):.5)*pw),yv=v=>top+(1-v/mx)*ph;
  const layer=document.createElement('canvas');layer.width=Math.round(w*dpr);layer.height=Math.round(h*dpr);
  const g=layer.getContext('2d');g.scale(dpr,dpr);
  const GREEN='#A8F552',PINK='#FF6B6B';
  g.font='500 10.5px '+getComputedStyle(document.body).fontFamily;g.lineWidth=1;
  for(let k=0;k<=4;k++){const y=top+ph*k/4+.5;g.strokeStyle='rgba(255,255,255,.10)';g.setLineDash([5,6]);g.beginPath();g.moveTo(L,y);g.lineTo(w-R,y);g.stroke();g.setLineDash([]);
    if(!priv){g.fillStyle='rgba(255,255,255,.42)';g.textAlign='right';g.textBaseline='middle';g.fillText(shortRp(mx-mx*k/4),L-10,y)}}
  g.fillStyle='rgba(255,255,255,.42)';g.textBaseline='alphabetic';
  const XN=n<=7?n:5;
  for(let k=0;k<XN;k++){const i=n<=7?k:Math.round(k*(n-1)/(XN-1));g.textAlign=i===0?'left':i===n-1?'right':'center';g.fillText(B[i].lab,i===0?xs[i]-8:i===n-1?xs[i]+8:xs[i],h-8)}
  /* kurva mulus yang tepat melewati tiap titik (monoton, tidak melenceng di bawah 0) */
  const path=key=>{const ys=B.map(b=>yv(b[key]));g.moveTo(xs[0],ys[0]);if(n<3){for(let i=1;i<n;i++)g.lineTo(xs[i],ys[i]);return}
    const dx=[],dy=[],m=[];for(let i=0;i<n-1;i++){dx[i]=xs[i+1]-xs[i];dy[i]=(ys[i+1]-ys[i])/dx[i]}
    m[0]=dy[0];m[n-1]=dy[n-2];for(let i=1;i<n-1;i++)m[i]=dy[i-1]*dy[i]<=0?0:(dy[i-1]+dy[i])/2;
    for(let i=0;i<n-1;i++){if(dy[i]===0){m[i]=0;m[i+1]=0;continue}const a=m[i]/dy[i],b=m[i+1]/dy[i],q=a*a+b*b;if(q>9){const t=3/Math.sqrt(q);m[i]=t*a*dy[i];m[i+1]=t*b*dy[i]}}
    for(let i=0;i<n-1;i++)g.bezierCurveTo(xs[i]+dx[i]/3,ys[i]+m[i]*dx[i]/3,xs[i+1]-dx[i]/3,ys[i+1]-m[i+1]*dx[i]/3,xs[i+1],ys[i+1])};
  /* isi di bawah garis masuk */
  const yb=top+ph,ag=g.createLinearGradient(0,top,0,yb);ag.addColorStop(0,'rgba(168,245,82,.22)');ag.addColorStop(1,'rgba(168,245,82,0)');
  g.beginPath();path('inc');g.lineTo(xs[n-1],yb);g.lineTo(xs[0],yb);g.closePath();g.fillStyle=ag;g.fill();
  g.lineJoin='round';g.lineCap='round';g.lineWidth=2.4;
  g.strokeStyle=PINK;g.setLineDash([2,6]);g.beginPath();path('ex');g.stroke();g.setLineDash([]);
  g.strokeStyle=GREEN;g.shadowColor='rgba(168,245,82,.4)';g.shadowBlur=9;g.beginPath();path('inc');g.stroke();g.shadowBlur=0;
  const ring=(x,y,c,r)=>{g.fillStyle='#0B0B0D';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=c;g.lineWidth=2.2;g.beginPath();g.arc(x,y,r,0,7);g.stroke()};
  const dr=n>14?3.2:4.6;B.forEach((b,i)=>{ring(xs[i],yv(b.ex),PINK,dr);ring(xs[i],yv(b.inc),GREEN,dr)});
  AC={cv,B,xs,yv,w,h,dpr,layer,n,L,R,top,ph,scrub:false,ring,GREEN,PINK};
  const idxAt=e=>{const r=cv.getBoundingClientRect();return clamp(Math.round((e.clientX-r.left-L)/pw*(n-1)),0,n-1)};
  cv.onpointerdown=e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}AC.scrub=true;const i=idxAt(e);paintAn(i);anRead(i)};
  cv.onpointermove=e=>{if(!AC.scrub&&e.pointerType!=='mouse')return;const i=idxAt(e);paintAn(i);anRead(i)};
  cv.onpointerup=cv.onpointercancel=cv.onpointerleave=()=>{AC.scrub=false;paintAn(-1);anRead(-1)};
  paintAn(-1);anRead(-1);
}
function paintAn(i){
  const c=AC,ctx=c.cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.cv.width,c.cv.height);ctx.drawImage(c.layer,0,0);
  if(i<0)return;ctx.scale(c.dpr,c.dpr);const x=c.xs[i],b=c.B[i];
  ctx.strokeStyle=c.GREEN;ctx.globalAlpha=.8;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,c.top-4);ctx.lineTo(x,c.top+c.ph);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  c.ring(x,c.yv(b.ex),c.PINK,6.5);c.ring(x,c.yv(b.inc),c.GREEN,6.5);
}
function anRead(i){
  if(!AC)return;const B=AC.B,set=(id,t)=>{const el=$(id);if(el)el.textContent=t};
  const b=i<0?{inc:B.reduce((a,x)=>a+x.inc,0),ex:B.reduce((a,x)=>a+x.ex,0),full:'Total '+({30:'1 bulan',90:'3 bulan',180:'6 bulan',365:'1 tahun',0:'semua waktu'}[ui.arange])+' terakhir'.replace(' terakhir',ui.arange===0?'':' terakhir')}:B[i];
  const full=[b.inc,b.ex,b.inc-b.ex].map((v,k)=>(k===2&&v>=0?'+':'')+money(v)).join('').length,cp=!S.settings.privacy&&full*7.9+24>AC.w-32;
  const fm=v=>{const f=money(v);return cp?(v<0?'−':'')+'Rp '+shortRp(Math.abs(v)):f};
  set('#anLab',b.full);set('#anI',fm(b.inc));set('#anE',fm(b.ex));
  const d=b.inc-b.ex,el=$('#anN');if(el){el.textContent=(d>=0?'+':'')+fm(d);el.style.color=d>=0?'var(--acc)':'#FF6B6B'}
}
const CATPAL=[[352,86,64],[28,92,60],[44,94,58],[96,62,56],[160,60,48],[190,78,52],[214,88,66],[262,82,72],[292,66,66],[326,78,66]];
const rampCol=(type,i,n)=>{const p=CATPAL[i%CATPAL.length],r=Math.floor(i/CATPAL.length),l=Math.max(34,p[2]-r*12);return'hsl('+p[0]+' '+p[1]+'% '+l+'%)'};
const priv=()=>!!S.settings.privacy;
const cpRp=v=>Math.abs(v)>=1e7?(v<0?'−':'')+'Rp '+shortRp(Math.abs(v)):money(v);
VIEWS.an=function(){
  const A=ui.an,key=A.y+'-'+pad(A.m+1);
  const pm=new Date(A.y,A.m-1,1),pkey=pm.getFullYear()+'-'+pad(pm.getMonth()+1);
  const mrows=S.tx.filter(t=>t.d.startsWith(key)),prows=S.tx.filter(t=>t.d.startsWith(pkey));
  const ex=mrows.filter(isExpT).reduce((a,t)=>a+t.amt,0),inc=mrows.filter(isIncT).reduce((a,t)=>a+t.amt,0);
  const f=A.type==='exp'?isExpT:isIncT;
  const list=mrows.filter(f),total=list.reduce((a,t)=>a+t.amt,0),ptot=prows.filter(f).reduce((a,t)=>a+t.amt,0);
  const map={};
  list.forEach(t=>{const k=t.cat||'_';const o=map[k]||(map[k]={total:0,subs:{}});o.total+=t.amt;const sn=t.sub||'Umum';o.subs[sn]=(o.subs[sn]||0)+t.amt});
  const rows=Object.keys(map).map(k=>{const cat=S.cats.find(c=>c.id===k);return{k,cat,color:'',...map[k]}}).sort((a,b)=>b.total-a.total);
  rows.forEach((r,i)=>r.color=r.cat&&hexOk(r.cat.color)?ringFit(r.cat.color):rampCol(A.type,i,rows.length));
  const segs=anSegs(rows,total),dkey=key+A.type,draw=ui.anDrawn!==dkey;ui.anDrawn=dkey;
  if(ui.anSel&&!segs.some(g=>g.k===ui.anSel))ui.anSel='';
  AN={segs,total};const selG=segs.find(g=>g.k===ui.anSel),totTxt=money(total);
  const mx=rows.length?rows[0].total:1,anyOpen=rows.some(r=>!S.settings.anCollapsed[r.k]),dl=total-ptot;
  const now=new Date(),isCur=A.y===now.getFullYear()&&A.m===now.getMonth(),days=isCur?now.getDate():new Date(A.y,A.m+1,0).getDate();
  const dtxt=ptot>0?`${dl>=0?'Naik':'Turun'} ${money(Math.abs(dl))} dari ${MON[pm.getMonth()]}`:'Belum ada data bulan sebelumnya';
  return`${anFlowBlk()}<section class="blk ${draw?'an-draw':''}">
    <div class="mnav"><button class="ibtn sm" data-action="anprev" aria-label="Bulan sebelumnya">${IC.back}</button><b>${MON[A.m]} ${A.y}</b><button class="ibtn sm" data-action="annext" aria-label="Bulan berikutnya">${IC.fwd}</button></div>
    <div class="seg2 ${A.type==='inc'?'r':''}" role="group" aria-label="Jenis"><span class="seg2-t"></span><button class="${A.type==='exp'?'on':''}" data-action="antype" data-arg="exp" data-t="exp">Pengeluaran</button><button class="${A.type==='inc'?'on':''}" data-action="antype" data-arg="inc" data-t="inc">Pemasukan</button></div>
    <div class="surface an-card"><div class="dn-w ${selG?'has-sel':''}">${donut(segs,total,draw)}<div class="donut-c"><div class="dc-a"><small>Total ${A.type==='exp'?'keluar':'masuk'}</small><b class="num" ${totTxt.length>13?'style="font-size:17px" ':''}${mv('dt:'+A.type,total)}>${totTxt}</b><small>${rows.length} kategori</small></div><div class="dc-b">${selG?anCenterB(selG):''}</div></div></div>
    <p class="dchip ${ptot>0?((dl>=0)===(A.type==='exp')?'bad':'good'):''}">${ptot>0?`<i>${dl>=0?'▲':'▼'}</i>`:''}${esc(dtxt)}</p>
    ${segs.length?`<div class="lg2-w">${segs.map(g=>`<button class="lg2 ${selG&&selG.k===g.k?'on':''}" data-action="ansel" data-arg="${esc(g.k)}" data-c="${esc(g.k)}" aria-pressed="${!!selG&&selG.k===g.k}"><i style="background:${g.color}"></i>${esc(g.name)}<b>${anPct(g.total,total)}</b></button>`).join('')}</div>`:''}</div>
    <div class="stats"><div class="st"><span>Masuk</span><b class="pos" ${mv('si',inc)}>${priv()?money(inc):cpRp(inc)}</b></div><div class="st"><span>Keluar</span><b class="neg" ${mv('sx',ex)}>${priv()?money(ex):cpRp(ex)}</b></div><div class="st"><span>Rata-rata/hari</span><b>${priv()?money(ex/days):cpRp(ex/days)}</b></div></div>
  </section>
  <section class="blk"><div class="blk-h"><h2>Per kategori</h2><button class="tbtn" data-action="tgcall">${anyOpen?'Tutup semua':'Buka semua'}</button></div><div class="surface">
    ${rows.map(r=>{const open=!S.settings.anCollapsed[r.k],pc=total?Math.round(r.total/total*100):0,on=!!selG&&(selG.k===r.k||(selG.k==='_o'&&r.og));
      return`<div class="grp ${open?'open':''} ${on?'on':''}" data-ck="${esc(r.k)}" ${r.og?'data-og="1" ':''}style="--rc:${r.color}"><button class="cat-h" data-action="tgc" data-id="${esc(r.k)}" aria-expanded="${open}"><div class="cat-l">${catIcon(r.cat,38)}<span class="lm"><b>${r.cat?esc(r.cat.name):'Tanpa kategori'}</b></span><span class="p">${pc}%</span><span class="lr"><b>${money(r.total)}</b></span>${chev(open)}</div><div class="pbar"><i style="width:${total?(r.total/total*100).toFixed(1):0}%;background:${r.color}"></i></div></button>${budMeter(r,A.type)}
      <div class="sub-w"><div class="sub-in">${Object.keys(r.subs).sort((a,b)=>r.subs[b]-r.subs[a]).map(sn=>`<div class="sub-r"><span>${esc(sn)}</span><span class="num">${money(r.subs[sn])}</span></div>`).join('')}${A.type==='exp'&&r.cat?`<button class="tbtn bud-set" data-action="fedit" data-arg="cat" data-id="${esc(r.cat.id)}">${r.cat.budget>0?'Anggaran '+money(+r.cat.budget)+' · Ubah':'+ Anggaran'}</button>`:''}<div style="height:8px"></div></div></div></div>`}).join('')||'<p class="empty">Belum ada data di bulan ini.</p>'}
  </div></section>`;
};

/* ---- kelola ---- */
const EMPTY_MG={wallet:'Belum ada dompet. Buat dompet untuk rekening bank, e-wallet, atau tunai.',cat:'Belum ada kategori.',rec:'Belum ada transaksi berulang. Contohnya gaji, cicilan, atau langganan bulanan.',group:'Belum ada kelompok. Kelompokkan dompet per bank, misalnya BCA atau Jago.',pur:'Belum ada peruntukan. Buat satu, misalnya Darurat atau Tabungan, lalu pilih di formulir dompet.',card:'Belum ada kartu kredit. Tambah kartu untuk memantau limit dan tagihan.'};
const MG=[['wallet','Dompet'],['cat','Kategori'],['rec','Berulang'],['group','Kelompok'],['pur','Peruntukan'],['card','Kartu & limit']];
/* urutan yang bisa diubah: dompet (dalam satu kelompok), kelompok, kategori (dalam satu jenis) */
const SORTABLE=['wallet','group','cat'];
function peerIds(kind,id){const col=S[FK[kind]]||[],o=col.find(x=>x.id===id);if(!o)return[];
  return col.filter(x=>kind==='wallet'?x.g===o.g:kind==='cat'?x.t===o.t:true).map(x=>x.id)}
const mrow=(kind,id,ico,a,b,c)=>{
  if(ui.mgSort&&SORTABLE.includes(kind)){const ps=peerIds(kind,id),i=ps.indexOf(id);
    return`<div class="lrow srt" data-sid="${id}">${ico}<span class="lm"><b>${a}</b>${b?`<small>${b}</small>`:''}</span><span class="srt-b"><button type="button" class="mini-b" data-action="mvup" data-arg="${kind}" data-id="${id}" ${i<=0?'disabled':''} aria-label="Naikkan ${esc(String(a).replace(/<[^>]*>/g,''))}">↑</button><button type="button" class="mini-b" data-action="mvdn" data-arg="${kind}" data-id="${id}" ${i>=ps.length-1?'disabled':''} aria-label="Turunkan ${esc(String(a).replace(/<[^>]*>/g,''))}">↓</button></span></div>`}
  return`<button class="lrow" data-action="fedit" data-arg="${kind}" data-id="${id}">${ico}<span class="lm"><b>${a}</b>${b?`<small>${b}</small>`:''}</span>${c?`<span class="lr"><b>${c}</b></span>`:''}</button>`};
/* gerakkan satu langkah, dengan animasi pegas pada baris yang bergeser */
function mvItem(kind,id,dir){
  const col=S[FK[kind]],ps=peerIds(kind,id),i=ps.indexOf(id),j=i+dir;if(i<0||j<0||j>=ps.length)return;
  const a=col.findIndex(x=>x.id===id),b=col.findIndex(x=>x.id===ps[j]);
  const before={};document.querySelectorAll('[data-sid]').forEach(e=>{before[e.dataset.sid]=e.getBoundingClientRect().top});
  [col[a],col[b]]=[col[b],col[a]];persist();render();
  if(RM())return;
  document.querySelectorAll('[data-sid]').forEach(e=>{const d=before[e.dataset.sid];if(d==null)return;const dy=d-e.getBoundingClientRect().top;if(!dy)return;
    e.style.transition='none';e.style.transform='translateY('+dy+'px)';void e.offsetHeight;e.style.transition='transform .5s var(--spring)';e.style.transform='';
    setTimeout(()=>{e.style.transition=''},560)});
}

/* ---- kelola > dompet: grafik Pareto (dompet mana yang menyimpan sebagian besar uang) ---- */
let PC=null;
function parData(){
  let w=S.wallets.map(x=>({n:wLbl(x),v:D.bal[x.id]||0,c:walCol(x),pc:(q=>q?purCol(q):null)(purOf(x))})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  if(w.length>8){const rest=w.slice(7);w=w.slice(0,7);w.push({n:'Lainnya',v:rest.reduce((a,x)=>a+x.v,0),multi:rest.length})}
  const tot=w.reduce((a,x)=>a+x.v,0);let c=0;w.forEach(x=>{x.pre=c/tot;c+=x.v;x.cum=c/tot});
  return{w,tot};
}
function paretoBlk(){
  const d=parData();if(d.w.length<2)return'';
  return`<div class="surface" style="padding:16px 0 14px;margin-bottom:12px">
    <div style="padding:0 16px"><b id="prT" style="font-size:15px"></b><br><small id="prS" class="lbl"></small></div>
    <div class="chart-wrap" style="margin:8px 0 0;height:160px"><canvas id="pchart" aria-label="Grafik Pareto saldo dompet"></canvas></div>
    <div class="legend" style="padding:0 16px;margin-top:6px"><span><b style="background:#fff"></b>Dalam 80%</span><span><b style="background:rgba(255,255,255,.35)"></b>Redup: sisa</span><span><b style="background:#fff"></b>Kumulatif</span></div>
  </div>`;
}
function drawPareto(){
  const cv=$('#pchart');if(!cv)return;
  const {w:W,tot}=parData(),n=W.length,priv=S.settings.privacy;
  const w=cv.parentElement.clientWidth||340,dpr=Math.min(window.devicePixelRatio||1,2);
  const L=priv?16:46,R=40,top=12,pw=w-L-R,bw=pw/n,ff='500 10.5px '+getComputedStyle(document.body).fontFamily;
  const h=150,bot=14,ph=h-top-bot;
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';cv.parentElement.style.height=(h-10)+'px';
  let mx=W[0].v*1.12;const raw=mx/4,mag=Math.pow(10,Math.floor(Math.log10(raw))),nz=[1,2,2.5,5,10].find(k=>raw<=k*mag)*mag;mx=nz*4;
  const layer=document.createElement('canvas');layer.width=Math.round(w*dpr);layer.height=Math.round(h*dpr);
  const g=layer.getContext('2d');g.scale(dpr,dpr);g.font=ff;
  const GREEN='#A8F552',DIM='#3E5A25',cx=i=>L+bw*(i+.5),yb=v=>top+(1-v/mx)*ph,yp=f=>top+(1-f)*ph;
  for(let k=0;k<=4;k++){const y=top+ph*k/4+.5;g.strokeStyle='rgba(255,255,255,.09)';g.lineWidth=1;g.beginPath();g.moveTo(L,y);g.lineTo(w-R,y);g.stroke();
    g.fillStyle='rgba(255,255,255,.4)';g.textBaseline='middle';
    if(!priv){g.textAlign='right';g.fillText(shortRp(mx-mx*k/4),L-8,y)}
    g.textAlign='left';g.fillText(Math.round(100-25*k)+'%',w-R+8,y)}
  /* garis 80% */
  const y80=yp(.8)+.5;g.strokeStyle='rgba(255,255,255,.45)';g.setLineDash([4,4]);g.beginPath();g.moveTo(L,y80);g.lineTo(w-R,y80);g.stroke();g.setLineDash([]);
  g.fillStyle='rgba(255,255,255,.6)';g.textAlign='right';g.textBaseline='bottom';g.fillText('80%',w-R-2,y80-3);
  const rr=(x,y,bwid,bh,r)=>{r=Math.min(r,bwid/2,bh);g.beginPath();g.moveTo(x,y+bh);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.lineTo(x+bwid-r,y);g.quadraticCurveTo(x+bwid,y,x+bwid,y+r);g.lineTo(x+bwid,y+bh);g.closePath()};
  const bwid=Math.min(bw*.62,46);
  W.forEach((b,i)=>{const y=Math.min(yb(b.v),top+ph-4),on=b.pre<.8;
    const col=b.c||'#9AA0A6';
    g.save();g.globalAlpha=on?1:.5;g.shadowColor=col+'73';g.shadowBlur=10;
    const bx=cx(i)-bwid/2,bh=top+ph-y;rr(bx,y,bwid,bh,6);
    if(b.pc&&bh>10){g.fillStyle='#0B0B0D';g.fill();g.shadowBlur=0;g.save();g.clip();const t=Math.max(5,bh*.34);g.fillStyle=b.pc;g.fillRect(bx,y,bwid,t-1);g.fillStyle=col;g.fillRect(bx,y+t+1,bwid,bh);g.restore();g.shadowBlur=10;g.fillStyle='rgba(0,0,0,0)'}
    else{g.fillStyle=col;g.fill()}g.restore()});
  /* garis kumulatif */
  g.strokeStyle='#fff';g.lineWidth=1.6;g.lineJoin='round';g.beginPath();W.forEach((b,i)=>{i?g.lineTo(cx(i),yp(b.cum)):g.moveTo(cx(i),yp(b.cum))});g.stroke();
  const dot=(i,r)=>{g.fillStyle='#0B0B0D';g.beginPath();g.arc(cx(i),yp(W[i].cum),r,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=1.8;g.beginPath();g.arc(cx(i),yp(W[i].cum),r,0,7);g.stroke()};
  W.forEach((_,i)=>dot(i,3.4));
  PC={cv,W,tot,w,h,dpr,layer,n,L,R,bw,cx,yp,top,ph,dot};
  const idxAt=e=>{const r=cv.getBoundingClientRect();return clamp(Math.floor((e.clientX-r.left-L)/bw),0,n-1)};
  cv.onpointerdown=cv.onpointermove=e=>{if(e.type==='pointermove'&&!(e.buttons||e.pointerType==='touch'&&PC.on))return;PC.on=true;const i=idxAt(e);paintPareto(i);parRead(i)};
  cv.onpointerup=cv.onpointercancel=cv.onpointerleave=()=>{PC.on=false;paintPareto(-1);parRead(-1)};
  paintPareto(-1);parRead(-1);
}
function paintPareto(i){
  const c=PC,ctx=c.cv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.cv.width,c.cv.height);ctx.drawImage(c.layer,0,0);
  if(i<0)return;ctx.scale(c.dpr,c.dpr);ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(c.L+c.bw*i,c.top,c.bw,c.ph);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(c.cx(i),c.yp(c.W[i].cum),5.2,0,7);ctx.fill();
}
function parRead(i){
  if(!PC)return;const set=(id,t)=>{const el=$(id);if(el)el.textContent=t},W=PC.W;
  if(i<0){const k=W.findIndex(b=>b.cum>=.8)+1;set('#prT',k+' dari '+W.length+' dompet menyimpan '+Math.round(W[k-1].cum*100)+'% uangmu');set('#prS','Total saldo '+money(PC.tot)+' · ketuk batang untuk detail')}
  else{const b=W[i];set('#prT',b.n+(b.multi?' ('+b.multi+' dompet)':'')+' · '+money(b.v));set('#prS',Math.round(b.v/PC.tot*100)+'% dari total · kumulatif '+Math.round(b.cum*100)+'%')}
}

/* ---- kelola > kartu & limit: dasbor + daftar per grup limit ---- */
const KU_N=40,KU_SAFE=.3;
const kuCls=f=>f<=KU_SAFE?'g':f<=.8?'o':'r';
function usageSlider(used,limit){
  if(!(limit>0))return`<div class="kd-leg"><span>Belum ada limit kartu</span></div>`;
  const f0=Math.max(0,Math.min(1,used/limit)),k=Math.round(f0*KU_N)/KU_N;
  const bars=Array.from({length:KU_N},(_,i)=>{const h=26+74*Math.pow((i+1)/KU_N,1.5),lit=(i+.5)/KU_N<=f0&&f0>0;return`<i class="${lit?'on ':''}${kuCls((i+1)/KU_N)}" style="height:${h.toFixed(0)}%"></i>`}).join('');
  return`<div class="ku" data-limit="${limit}" data-f0="${f0.toFixed(9)}">
    <div class="ku-tr" role="slider" aria-label="Simulasi pemakaian limit" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(f0*100)}">
      <div class="ku-pill ${kuCls(f0)}" style="left:clamp(46px,${(k*100).toFixed(2)}%,calc(100% - 46px))"></div>
      <div class="ku-bars">${bars}</div>
      <div class="ku-base"><i class="ku-safe" style="left:${KU_SAFE*100}%"></i><i class="ku-dot ${kuCls(f0)}" style="left:${(k*100).toFixed(2)}%"></i></div>
    </div>
    <div class="ku-ax"><span>${money(0)}</span><span>Batas aman ${Math.round(KU_SAFE*100)}%</span><span>${money(limit)}</span></div>
    <div class="ku-cap"><b></b><button type="button" class="ku-rs" data-action="kureset" hidden>Pemakaian nyata</button></div>
  </div>`;
}
function kuSet(root,f,moved){
  const lim=+root.dataset.limit,k=Math.max(0,Math.min(1,Math.round(f*KU_N)/KU_N)),fx=moved?k:Math.max(0,Math.min(1,f)),v=fx*lim,c=kuCls(fx);
  root.querySelectorAll('.ku-bars i').forEach((b,i)=>b.classList.toggle('on',k>0&&(i+.5)/KU_N<=k));
  const pill=root.querySelector('.ku-pill'),dot=root.querySelector('.ku-dot');
  dot.style.left=(k*100).toFixed(2)+'%';pill.style.left='clamp(46px,'+(k*100).toFixed(2)+'%,calc(100% - 46px))';pill.className='ku-pill '+c;dot.className='ku-dot '+c;
  pill.textContent=v>0?cpRp(v):money(0);
  const sa=lim*KU_SAFE,d=v-sa,cap=root.querySelector('.ku-cap b');
  cap.className=c;cap.textContent=v<=0?'Belum ada pemakaian':(d<=0?cpRp(-d)+' masih di bawah batas aman':cpRp(d)+' di atas batas aman')+' · '+(fx>0&&fx<.01?'<1':Math.round(fx*100))+'% limit';
  const rs=root.querySelector('.ku-rs');if(rs)rs.hidden=!moved;
  root.querySelector('.ku-tr').setAttribute('aria-valuenow',Math.round(k*100));
}
function kuInit(){document.querySelectorAll('.ku').forEach(r=>{if(!r.dataset.ini){r.dataset.ini=1;kuSet(r,+r.dataset.f0,false)}})}
(function(){let D=null;
  const mv=e=>{if(!D)return;const r=D.getBoundingClientRect();kuSet(D.closest('.ku'),(e.clientX-r.left)/r.width,true)};
  document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.ku-tr');if(!t)return;D=t;try{t.setPointerCapture(e.pointerId)}catch(x){}mv(e)});
  document.addEventListener('pointermove',mv);
  ['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,()=>{D=null}));
})();
function cardDash(){
  const gs=[];
  S.pools.forEach(p=>{const cs=S.cards.filter(c=>c.pool===p.id);gs.push({id:p.id,name:p.name,limit:p.limit||0,used:cs.reduce((a,c)=>a+(D.debt[c.id]||0),0),n:cs.length,pool:true})});
  S.cards.filter(c=>!S.pools.some(p=>p.id===c.pool)).forEach(c=>gs.push({id:c.id,name:c.name+' ••'+c.last4,limit:c.limit||0,used:D.debt[c.id]||0,n:1}));
  const limit=gs.reduce((a,g)=>a+g.limit,0),used=gs.reduce((a,g)=>a+g.used,0),pc=limit>0?used/limit*100:0;
  const tone=v=>v>80?'#FF6B6B':v>50?'#FBBF24':'var(--acc)';
  const rows=gs.slice().sort((a,b)=>b.used-a.used).map(g=>{const v=g.limit>0?Math.min(100,g.used/g.limit*100):0;
    return`<div class="kd-r"><div class="kd-rh"><b>${esc(g.name)}</b><span>${money(g.used)} <em>/ ${money(g.limit)}</em></span></div><div class="kd-rb"><i style="width:${Math.max(v,g.used>0?3:0).toFixed(1)}%;background:${tone(v)}"></i></div></div>`}).join('');
  return`<div class="surface kd"><span class="ws2-k">Total tagihan</span><b class="num ws2-v" style="font-size:26px">${money(used)}</b>
    ${usageSlider(used,limit)}
    ${rows?`<div class="kd-rows">${rows}</div>`:''}</div>`;
}
function cardList(){
  const row=(c,sub)=>mrow('card',c.id,shapeIcon(IC.card,hsh(c.id)%10,'cookie6',40),esc(c.name)+' ••'+esc(c.last4),(cardWallet(c)?'Dompet: '+esc(accName(cardWallet(c))):'Belum ada dompet')+(sub?' · '+sub:''),money(D.debt[c.id]||0));
  let h='';
  S.pools.forEach(p=>{const cs=S.cards.filter(c=>c.pool===p.id),u=cs.reduce((a,c)=>a+(D.debt[c.id]||0),0);
    h+=`<div class="kg"><button class="kg-h" data-action="fedit" data-arg="pool" data-id="${p.id}"><span><b>${esc(p.name)}</b><small>Limit bersama ${money(p.limit)} · terpakai ${money(u)}</small></span><span class="kg-e">Ubah</span></button>${cs.map(c=>row(c,'')).join('')||'<p class="empty" style="margin:6px 0 10px">Belum ada kartu di grup ini.</p>'}</div>`});
  const solo=S.cards.filter(c=>!S.pools.some(p=>p.id===c.pool));
  if(solo.length)h+=`<div class="kg"><div class="kg-h plain"><span><b>Limit sendiri</b><small>Kartu tanpa grup limit</small></span></div>${solo.map(c=>row(c,'Limit '+money(c.limit))).join('')}</div>`;
  return h;
}

/* ---- kelola > berulang: dasbor beban bulanan + jatuh tempo terdekat ---- */
function recDash(){
  if(!S.recur.length)return'';
  const ex=S.recur.filter(r=>r.t==='exp'),inc=S.recur.filter(r=>r.t==='inc'),sum=a=>a.reduce((x,r)=>x+r.amt,0),E=sum(ex),I=sum(inc),net=I-E;
  const nxt=S.recur.map(r=>{const d=parseD(recDate(r,monShift(r.last,1)));return{r,d,n:daysTo(d)}}).sort((a,b)=>a.d-b.d).slice(0,3);
  const left=ex.reduce((a,r)=>a+(recDate(r,monShift(r.last,1)).slice(0,7)===today().slice(0,7)?r.amt:0),0);
  const byCat={};ex.forEach(r=>{byCat[r.cat||'']=(byCat[r.cat||'']||0)+r.amt});
  const cats=Object.keys(byCat).sort((a,b)=>byCat[b]-byCat[a]).slice(0,5);
  const when=n=>n<=0?'hari ini':n===1?'besok':n+' hari lagi';
  return`<div class="surface kd dsh"><span class="ws2-k">Pengeluaran berulang / bulan</span><b class="num ws2-v" style="font-size:26px">${money(E)}</b>
    ${E+I>0?`<div class="dsh-split" aria-hidden="true"><i style="width:${(E/(E+I)*100).toFixed(1)}%;background:#FF6B6B"></i><i style="flex:1;background:var(--acc)"></i></div>`:''}
    <div class="dsh-s"><div><span class="ws2-k">Pemasukan</span><b class="in">${money(I)}</b></div><div><span class="ws2-k">Selisih</span><b class="${net<0?'out':'in'}">${net<0?'−':'+'}${money(Math.abs(net))}</b></div></div>
    ${left>0?`<div class="kd-leg" style="margin-top:12px"><span>Masih akan terpotong bulan ini</span><b>${money(left)}</b></div>`:''}
    <div class="dsh-next">${nxt.map(x=>{const c=S.cats.find(y=>y.id===x.r.cat);return`<div class="dsh-n"><span>${esc(c?c.name:'Tanpa kategori')}${x.r.note?' · '+esc(x.r.note):''}<em>${fmtDate(ymd(x.d)).slice(0,-5)} · ${when(x.n)}</em></span><b>${x.r.t==='inc'?'+':'−'}${money(x.r.amt)}</b></div>`}).join('')}</div>
    ${cats.length>=2?`<div class="kd-rows">${cats.map(k=>{const c=S.cats.find(y=>y.id===k),v=E?byCat[k]/E*100:0;return`<div class="kd-r"><div class="kd-rh"><b>${esc(c?c.name:'Tanpa kategori')}</b><span>${money(byCat[k])} <em>/ ${Math.round(v)}%</em></span></div><div class="kd-rb"><i style="width:${Math.max(v,3).toFixed(1)}%;background:var(--acc)"></i></div></div>`}).join('')}</div>`:''}</div>`;
}

/* ---- kelola > kelompok: dasbor saldo per kelompok ---- */
function grpBal(g){return S.wallets.filter(w=>w.g===g.id).reduce((a,w)=>a+(D.bal[w.id]||0),0)}
function groupDash(){
  if(!S.groups.length)return'';
  const rows=S.groups.map(g=>({g,v:grpBal(g),n:S.wallets.filter(w=>w.g===g.id).length})).sort((a,b)=>b.v-a.v);
  const tot=rows.reduce((a,r)=>a+r.v,0),pos=rows.reduce((a,r)=>a+Math.max(0,r.v),0);
  return`<div class="surface kd dsh"><span class="ws2-k">Total saldo semua kelompok</span><b class="num ws2-v" style="font-size:26px">${money(tot)}</b>
    ${pos>0?`<div class="dsh-split" aria-hidden="true">${rows.filter(r=>r.v>0).map(r=>`<i style="width:${(r.v/pos*100).toFixed(1)}%;background:${grpCol(r.g)}"></i>`).join('')}</div>`:''}
    <div class="kd-rows">${rows.map(r=>{const v=pos>0?Math.max(0,r.v)/pos*100:0;return`<button type="button" class="kd-r kd-b" data-action="fedit" data-arg="group" data-id="${esc(r.g.id)}"><div class="kd-rh"><b><i class="pu-dot" style="background:${grpCol(r.g)};--pc:${grpCol(r.g)}"></i>${esc(r.g.name)}</b><span>${money(r.v)} <em>/ ${Math.round(v)}%</em></span></div><div class="kd-rb"><i style="width:${Math.max(v,r.v>0?3:0).toFixed(1)}%;background:${grpCol(r.g)}"></i></div><small class="lbl" style="display:block;margin-top:6px">${r.n} dompet</small></button>`}).join('')}</div><p class="kd-hint">Ketuk baris untuk mengubah</p></div>`;
}

/* ---- kelola > kategori: dasbor bulan ini per kategori dan sub-kategori ---- */
function catMonth(t){
  const key=today().slice(0,7),cats={},subs={};let tot=0;
  S.tx.forEach(x=>{if(x.d.slice(0,7)!==key||!(t==='exp'?isExpT(x):isIncT(x))||!x.cat)return;
    cats[x.cat]=(cats[x.cat]||0)+x.amt;tot+=x.amt;const k=x.cat+'\u0001'+(x.sub||'');subs[k]=(subs[k]||0)+x.amt});
  return{cats,subs,tot};
}
function catDash(){
  const t=ui.ct||'exp',M=catMonth(t),tn=S.cats.filter(c=>c.t===t).length,sn=S.cats.filter(c=>c.t===t).reduce((a,c)=>a+c.subs.length,0);
  const rows=Object.keys(M.cats).sort((a,b)=>M.cats[b]-M.cats[a]),subs=Object.keys(M.subs).sort((a,b)=>M.subs[b]-M.subs[a]).slice(0,5);
  const bar=(v,c)=>`<div class="kd-rb"><i style="width:${Math.max(M.tot?v/M.tot*100:0,3).toFixed(1)}%;background:${c}"></i></div>`;
  const cc=id=>{const c=S.cats.find(x=>x.id===id);return{c,n:c?c.name:'Tanpa kategori',clr:ringFit(catHex(c))}};
  const open=!!ui.cdSub;
  return`<div class="seg2 ${t==='inc'?'r':''}" role="group" aria-label="Jenis" style="margin-bottom:12px"><span class="seg2-t"></span><button class="${t==='exp'?'on':''}" data-action="cttype" data-arg="exp" data-t="exp">Pengeluaran</button><button class="${t==='inc'?'on':''}" data-action="cttype" data-arg="inc" data-t="inc">Pemasukan</button></div>
  <div class="surface kd dsh cp"><span class="ws2-k">${t==='inc'?'Pemasukan':'Pengeluaran'} ${MON[new Date().getMonth()]} · ${tn} kategori · ${sn} sub</span><b class="num ws2-v" style="font-size:24px">${money(M.tot)}</b>
    ${M.tot>0?`<div class="dsh-split" aria-hidden="true">${rows.map(k=>`<i style="width:${(M.cats[k]/M.tot*100).toFixed(1)}%;background:${cc(k).clr}"></i>`).join('')}</div>`:''}
    ${rows.length?`<div class="kd-rows">${rows.slice(0,3).map(k=>{const o=cc(k);return`<div class="kd-r"><div class="kd-rh"><b>${esc(o.n)}</b><span>${money(M.cats[k])} <em>/ ${Math.round(M.cats[k]/M.tot*100)}%</em></span></div>${bar(M.cats[k],o.clr)}</div>`}).join('')}</div>
    ${subs.length?`<button type="button" class="xp-tg ${open?'open':''}" data-action="xptog" aria-expanded="${open}">Sub-kategori teratas<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="xp ${open?'open':''}"><div class="xp-in"><div class="kd-rows" style="margin-top:2px">${subs.map(k=>{const[id,sb]=k.split('\u0001'),o=cc(id);return`<div class="kd-r"><div class="kd-rh"><b><span class="dsh-ic">${o.c?catIconX(esc((o.c.si&&o.c.si[sb])||o.c.icon||'📦'),subC(o.c,sb),22):''}</span>${esc(o.n)} › ${sb?esc(sb):'Tanpa sub'}</b><span>${money(M.subs[k])} <em>/ ${Math.round(M.subs[k]/M.tot*100)}%</em></span></div>${bar(M.subs[k],o.clr)}</div>`}).join('')}</div></div></div>`:''}`:'<p class="empty" style="margin:12px 0 4px">Belum ada transaksi berkategori bulan ini.</p>'}</div>`;
}

/* ---- peruntukan: daftar bernama + warna, dipakai lintas bank ---- */
const purOf=w=>w&&w.pu?S.purs.find(x=>x.id===w.pu):null;
const purCol=q=>q&&hexOk(q.color)?q.color:COLS[(q?hsh(q.id):0)%COLS.length];
const purNext=()=>{const used=new Set(S.purs.map(x=>(x.color||'').toUpperCase()));return COLS.find(c=>!used.has(c))||COLS[S.purs.length%COLS.length]};
function purData(){
  const rows=S.purs.map(q=>({q,n:q.name,v:0,tg:0,ws:[],banks:new Set()})),none={q:null,n:'Tanpa peruntukan',v:0,tg:0,ws:[],banks:new Set()};
  S.wallets.forEach(w=>{const o=rows.find(r=>r.q&&r.q.id===w.pu)||none;
    o.v+=D.bal[w.id]||0;o.tg+=w.tg||0;o.ws.push(w);const g=S.groups.find(x=>x.id===w.g);if(g)o.banks.add(g.name)});
  rows.sort((a,b)=>b.v-a.v);if(none.ws.length)rows.push(none);return rows;
}
function purDash(){
  if(!S.purs.length)return'';
  const rows=purData(),tot=rows.reduce((a,r)=>a+r.v,0),pos=rows.reduce((a,r)=>a+Math.max(0,r.v),0);
  const clr=r=>r.q?purCol(r.q):'#6B7280';
  return`<div class="surface kd dsh" style="margin-bottom:12px"><span class="ws2-k">Saldo per peruntukan</span><b class="num ws2-v" style="font-size:26px">${money(tot)}</b>
    ${pos>0?`<div class="dsh-split" aria-hidden="true">${rows.map(r=>r.v>0?`<i style="width:${(r.v/pos*100).toFixed(1)}%;background:${clr(r)}"></i>`:'').join('')}</div>`:''}
    <div class="kd-rows">${rows.map(r=>{const hasT=r.tg>0,v=hasT?Math.min(100,Math.max(0,r.v)/r.tg*100):(pos>0?Math.max(0,r.v)/pos*100:0),done=hasT&&r.v>=r.tg;
      return`<${r.q?'button type="button" class="kd-r kd-b" data-action="fedit" data-arg="pur" data-id="'+esc(r.q.id)+'"':'div class="kd-r"'}><div class="kd-rh"><b><i class="pu-dot" style="background:${clr(r)};--pc:${clr(r)}"></i>${esc(r.n)}</b><span>${money(r.v)} <em>${hasT?'/ '+money(r.tg):'/ '+Math.round(v)+'%'}</em></span></div><div class="kd-rb"><i style="width:${Math.max(v,r.v>0?3:0).toFixed(1)}%;background:${clr(r)}"></i></div>
      <small class="lbl" style="display:block;margin-top:6px">${hasT?(done?'Target tercapai · ':Math.round(v)+'% dari target · '):''}${r.ws.length?[...r.banks].map(esc).join(', ')+' · '+r.ws.length+' dompet':'Belum ada dompet'}</small></${r.q?'button':'div'}>`}).join('')}</div><p class="kd-hint">Ketuk baris untuk mengubah</p></div>`;
}
VIEWS.manage=function(){
  if(ui.mg==='pool')ui.mg='card';
  const k=ui.mg;let rows='';
  if(k==='group')rows=S.groups.map(g=>mrow('group',g.id,colIcon(esc(g.name.charAt(0).toUpperCase()),grpCol(g),'squircle',40),esc(g.name),S.wallets.filter(w=>w.g===g.id).length+' dompet',money(grpBal(g)))).join('');
  if(k==='wallet'){const wr=w=>{const g=S.groups.find(x=>x.id===w.g);/* nama kelompok sudah jadi judul bagian, jadi baris memakai keterangan dompet */
      return mrow('wallet',w.id,accIcon(w,40),esc(w.name),[w.note?esc(w.note):'',purOf(w)?`<span class="pu-chip" style="--pc:${purCol(purOf(w))}"><i></i>${esc(purOf(w).name)}</span>`:'',wUse(w)!=='both'?esc(USE_LBL[wUse(w)]):''].filter(Boolean).join(' · '),money(D.bal[w.id]||0))};
    const known=S.groups.map(g=>{const ws=S.wallets.filter(w=>w.g===g.id);return ws.length?`<div class="dh">${esc(g.name)}</div>${ws.map(wr).join('')}`:''}).join(''),lost=S.wallets.filter(w=>!S.groups.some(g=>g.id===w.g));
    rows=known+(lost.length?`<div class="dh">Tanpa kelompok</div>${lost.map(wr).join('')}`:'')}
  if(k==='card')rows=cardList();
  if(k==='pur')rows=purData().filter(r=>r.q).map(r=>mrow('pur',r.q.id,colIcon(esc(r.q.name.charAt(0).toUpperCase()),purCol(r.q),'squircle',40),esc(r.q.name),r.ws.length+' dompet'+(r.banks.size?' · '+[...r.banks].map(esc).join(', '):''),money(r.v))).join('');
  if(k==='rec')rows=S.recur.map(r=>{const c=S.cats.find(x=>x.id===r.cat);return mrow('rec',r.id,catIcon(c,40),esc((c?c.name:'Tanpa kategori')+(r.note?' · '+r.note:'')),'Tiap tanggal '+r.day+' · '+esc(accName(r.acc)),(r.t==='inc'?'+':'−')+money(r.amt))}).join('');
  if(k==='cat'){const sec=t=>{const M=catMonth(t);return S.cats.filter(c=>c.t===t).map(c=>mrow('cat',c.id,catIcon(c,34),esc(c.name),c.subs.length?esc(c.subs.join(', ')):'Tanpa sub-kategori',M.cats[c.id]?money(M.cats[c.id]):'')).join('')};
    rows=`<div class="dh">Pengeluaran</div>${sec('exp')}<div class="dh">Pemasukan</div>${sec('inc')}`}
  const lbl=MG.find(x=>x[0]===k)[1],srt=!!ui.mgSort&&SORTABLE.includes(k);
  const sortHint={wallet:'Ketuk ↑ ↓ untuk memindahkan dompet dalam kelompoknya. Urutan ini dipakai di beranda dan pilihan dompet.',group:'Ketuk ↑ ↓ untuk memindahkan kelompok. Urutan ini dipakai di beranda.',cat:'Ketuk ↑ ↓ untuk memindahkan kategori dalam jenisnya. Urutan ini dipakai di pilihan kategori.'}[k];
  return`<section class="blk"><div class="blk-h"><h2>Kelola</h2><span class="bh-r">${SORTABLE.includes(k)?`<button class="tbtn" data-action="mgsort" aria-pressed="${srt}">${srt?'Selesai':'Urutkan'}</button>`:''}<button class="tbtn" data-action="fnew" data-arg="${k==='card'?'card':k}">+ ${k==='card'?'Kartu':lbl}</button></span></div>
    <div class="chips fit g3" style="margin-bottom:12px">${MG.map(m=>`<button class="chip ${k===m[0]?'on':''}" data-action="mgtab" data-arg="${m[0]}">${m[1]}</button>`).join('')}</div>
    ${srt?`<p class="kd-hint" style="margin:0 2px 10px">${sortHint}</p>`:''}${k==='wallet'&&!srt?paretoBlk():''}${k==='pur'?purDash():''}${k==='rec'?recDash():''}${k==='cat'&&!srt?catDash():''}${k==='group'&&!srt?groupDash():''}${k==='card'?cardDash()+'<div class="blk-h" style="margin-top:18px"><h2 style="font-size:16px">Kartu per grup</h2><button class="tbtn" data-action="fnew" data-arg="pool">+ Grup limit</button></div>':''}${(k==='group'&&S.groups.length&&!srt)||(k==='pur'&&S.purs.length)?'':`<div class="surface ${k==='cat'?'cl':''}">${rows||`<p class="empty">${EMPTY_MG[k]||'Belum ada.'}</p>`}</div>`}</section>`;
};

/* ---- atur ---- */
const BLK_NAME={chart:'Grafik kekayaan',actions:'Tombol cepat',cards:'Kartu kredit',wallets:'Dompet',budget:'Anggaran',tx:'Mutasi terbaru'};
VIEWS.set=function(){
  const L=S.settings.layout;
  const lay=L.map((b,i)=>`<div class="lay"><span class="n ${b.on?'':'off'}">${BLK_NAME[b.id]}</span><button class="mini-b" data-action="lup" data-id="${b.id}" ${i===0?'disabled':''} aria-label="Naikkan">↑</button><button class="mini-b" data-action="ldown" data-id="${b.id}" ${i===L.length-1?'disabled':''} aria-label="Turunkan">↓</button><button class="sw-t ${b.on?'on':''}" data-action="lon" data-id="${b.id}" role="switch" aria-checked="${b.on}" aria-label="Tampilkan ${BLK_NAME[b.id]}"></button></div>`).join('');
  const st={local:'Tersimpan di perangkat ini.',online:'Tersimpan online ke akun kamu.',saving:'Sedang menyimpan…',err:'Sinkron gagal. Data tetap aman di perangkat.',gdok:'Tersimpan di perangkat dan tercadangkan ke Google Drive.',gdsave:'Tersimpan di perangkat. Cadangan Drive sedang dikirim…',gdneed:'Tersimpan di perangkat. Cadangan Drive menunggu Anda masuk lagi.',gderr:'Tersimpan di perangkat. Cadangan Drive gagal, data tetap aman.'}[ui.sync]||'Tersimpan di perangkat ini.';
  return`<section class="blk"><div class="blk-h"><h2>Susunan Beranda</h2></div><div class="surface">${lay}</div></section>
   <section class="blk"><div class="blk-h"><h2>Tampilan</h2></div><div class="surface">
     ${pwaRow()}
     <div class="setrow"><div><b>Menu Gestun</b><small>Tampilkan tombol Gestun di Beranda dan kartu</small></div><button class="sw-t ${gestOn()?'on':''}" data-action="gestun-tog" role="switch" aria-checked="${gestOn()}" aria-label="Menu Gestun"></button></div>
     <div class="setrow"><div><b>Kalender di Riwayat</b><small>Kalender per tanggal di tab Transaksi, ketuk tanggal untuk lihat riwayatnya</small></div><button class="sw-t ${calOn()?'on':''}" data-action="cal-tog" role="switch" aria-checked="${calOn()}" aria-label="Kalender di Riwayat"></button></div>
     <div class="setrow"><div><b>Mode privasi</b><small>Sembunyikan semua nominal</small></div><button class="sw-t ${S.settings.privacy?'on':''}" data-action="privacy" role="switch" aria-checked="${S.settings.privacy}" aria-label="Mode privasi"></button></div>
     <div class="setrow" style="display:block"><div><b>Gaya stiker kategori</b><small>Cara jenis pemasukan dan pengeluaran ditandai</small></div><div class="bgroup" role="group">${[['badge','Lencana panah'],['bg','Latar jenis']].map(m=>`<button class="${S.settings.stk===m[0]?'on':''}" data-action="stkstyle" data-arg="${m[0]}">${m[1]}</button>`).join('')}</div>
       <div class="stk-prev" aria-label="Contoh">${[S.cats.find(c=>c.t==='exp'),S.cats.find(c=>c.t==='inc')].filter(Boolean).map(c=>catIcon(c,46)).join('')}<span class="t">${S.settings.stk==='badge'?'Warna kategori + panah ▲▼ di pojok':'Latar hijau/merah + cincin warna pilihan'}</span></div></div>
     <div class="setrow" style="display:block"><div><b>Tampilan kartu</b><small>Cara kartu kredit ditampilkan di beranda</small></div><div class="bgroup" role="group">${[['wallet','Dompet'],['stack','Tumpukan'],['col','Kolom'],['car','Putar']].map(m=>`<button class="${S.settings.cardView===m[0]?'on':''}" data-action="cardview" data-arg="${m[0]}">${m[1]}</button>`).join('')}</div></div>
     ${(S.settings.cardView==='wallet'||(S.settings.cardView==='col'&&S.cards.length<2)||(S.settings.cardView==='car'&&S.cards.length<2)||(S.settings.cardView==='stack'&&!S.cards.length))?`<div class="setrow" style="display:block"><div><b>Warna dompet kartu</b><small>Dompet tempat kartu kredit menyembul di Beranda</small></div><div class="sw-row" style="margin-top:12px">${Object.keys(WL_COLORS).map(k=>`<button class="sw sw-${k} ${S.settings.wl===k?'on':''}" data-action="wlcolor" data-arg="${k}" aria-label="${WL_COLORS[k]}"></button>`).join('')}</div></div>`:''}
     <div class="setrow" style="display:block"><div><b>Teman</b><small>Si mata di pojok kiri atas</small></div><div class="bgroup" role="group">${[['on','Normal'],['small','Kecil'],['off','Mati']].map(m=>`<button class="${S.settings.mascot===m[0]?'on':''}" data-action="mascotset" data-arg="${m[0]}">${m[1]}</button>`).join('')}</div><button class="mk-entry" data-action="mk-sheet" aria-label="Buka koleksi teman"><span class="mk-th">${mascotArt(MK.find(c=>c.id===S.settings.mascotChar)||MK[0],38)}</span><span><b>Koleksi teman</b><small>${(MK.find(c=>c.id===S.settings.mascotChar)||MK[0]).name} dipakai · ${S.settings.owned.length} dari ${MK.length} terkumpul</small></span><i class="go">${IC.fwd}</i></button></div></div></section>
   <section class="blk"><div class="blk-h"><h2>Cap &amp; tanda tangan</h2></div><div class="surface">
     <div class="setrow"><div><b>Tanda tangan transaksi besar</b><small>Transaksi besar ditandatangani dulu, lalu dapat cap</small></div><button class="sw-t ${S.settings.sigOn?'on':''}" data-action="sigtoggle" role="switch" aria-checked="${S.settings.sigOn}" aria-label="Tanda tangan transaksi besar"></button></div>
     ${S.settings.sigOn?`<div class="setrow" style="display:block"><div><b>Batas minimal</b><small>Dari nominal ini, transaksi minta tanda tangan</small></div>
       <div class="sigmin" style="margin-top:12px"><span style="color:var(--mute);font-weight:650">Rp</span><input id="sigMin" inputmode="numeric" data-input="sigmin" value="${nf.format(S.settings.sigMin)}" aria-label="Batas minimal tanda tangan"></div>
       <div class="sigpre">${[1e6,5e6,10e6,25e6,50e6].map(v=>`<button class="${S.settings.sigMin===v?'on':''}" data-action="sigpre" data-arg="${v}">${v>=1e6?(v/1e6)+' jt':v}</button>`).join('')}</div>
       <button class="btn acc" style="margin-top:14px" data-action="sigdemo">Coba tanda tangan</button></div>`:''}
   </div></section>
   <section class="blk"><div class="blk-h"><h2>Data</h2></div><div class="surface">
     <div class="setrow"><div><b>Penyimpanan</b><small>${st}</small></div></div>
     <div class="setrow"><div><b>Cadangan Google Drive</b><small>${gdStatusTxt()}</small></div>${S.settings.gd.on?`<button class="sw-t on" data-action="gd-off" role="switch" aria-checked="true" aria-label="Matikan cadangan otomatis"></button>`:`<button class="pbtn" data-action="gd-login" aria-label="Masuk dengan Google">Masuk</button>`}</div>
     ${S.settings.gd.on?`<div class="gd-btns"><button class="pbtn" data-action="gd-now">Cadangkan</button><button class="pbtn" data-action="gd-restore-btn">Pulihkan</button>${ui.sync==='gdneed'?'<button class="pbtn" data-action="gd-login">Masuk lagi</button>':''}</div>`:''}
     <div class="setrow"><div><b>Cadangkan sekarang</b><small>Unduh file cadangan · ${esc(bkAgo(S.settings.lastBackup))}</small></div><button class="pbtn" data-action="bk-file">Unduh</button></div>
     <div class="setrow"><div><b>Ekspor CSV</b><small>Semua transaksi untuk Excel atau Sheets</small></div><button class="pbtn" data-action="csv">Ekspor</button></div>
     <div class="setrow"><div><b>Ekspor JSON</b><small>Salin seluruh data sebagai cadangan</small></div><button class="pbtn" data-action="bk-export">Ekspor</button></div>
     <div class="setrow"><div><b>Impor JSON</b><small>Ganti data dengan cadangan</small></div><button class="pbtn" data-action="bk-import">Impor</button></div>
     <div class="setrow"><div><b>Muat data contoh</b><small>180 hari transaksi contoh</small></div><button class="pbtn" data-action="sample">Muat</button></div>
     <div class="setrow"><div><b>Hapus semua data</b><small>Kosongkan dompet, kartu, dan transaksi</small></div><button class="pbtn dz" data-action="wipe">Hapus</button></div>
   </div></section>`;
};

/* ============ sheet ============ */
function closeSheet(){
  const was=ui.sheet;ui.sheet=null;ui.flow=ui.pay=ui.gest=ui.xfer=ui.form=ui.backup=ui.accd=ui.mk=null;
  const el=$('#sheet');
  if(was&&el&&!el.hidden&&!RM()){clearTimeout(el._t);el.classList.add('out');document.body.classList.remove('lock');
    el._t=setTimeout(()=>{el.classList.remove('out');if(!ui.sheet){el.hidden=true;el.innerHTML=''}},240)}
  else renderSheet();
}

function vtabPlay(from,to){
  const t=document.getElementById('vtab');if(!t||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
  const i=t.querySelector('.vt-i');if(!i||!i.animate)return;
  const W=t.clientWidth,H=t.clientHeight,d=H-6,wp=W/2-3,L=from==='exp'?3:W/2,R=to==='exp'?3:W/2;
  const mid={left:(W-d)/2+'px',width:d+'px',top:(3+11)+'px',bottom:(3-11)+'px'};
  const pill=l=>({left:l+'px',width:wp+'px',top:'3px',bottom:'3px'});
  i.animate([pill(L),mid,pill(R)].map((k,n)=>({...k,offset:n/2,easing:'cubic-bezier(.45,0,.55,1)'})),{duration:560});
  t.style.overflow='visible';
}

/* pilih sub-kategori: kartu popup kedua di atas kartu kategori */
function subPop(){
  const f=ui.flow;if(ui.sheet!=='flow'||!f||f.step!==2||!f.openCat)return'';
  const c=S.cats.find(x=>x.id===f.openCat);if(!c||!c.subs.length)return'';
  const cur=f.cat===c.id?f.sub:null;
  const tile=(label,val,ico)=>`<button class="cat ${cur===val?'on':''}" data-action="fsub" data-arg="${esc(val)}">${ico}<span>${esc(label)}</span></button>`;
  return`<div class="ov ov2" data-action="fsubclose"></div><div class="panel2" id="panel2"><div class="handle"><i></i></div>
    <div class="sh-h"><div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">${catIcon(c,40)}<h3 style="font-size:18px">Pilih sub-kategori<small style="display:block;font-size:12.5px;color:var(--mute);font-weight:500;margin-top:2px">${esc(c.name)}</small></h3></div><button class="ibtn sm" data-action="fsubclose" aria-label="Tutup">${IC.x}</button></div>
    <div class="grid4">${tile('Tanpa sub','',catIconX('⊘',c,60))}${c.subs.map(sn=>tile(sn,sn,catIconX(esc((c.si&&c.si[sn])||c.icon||'📦'),subC(c,sn),60))).join('')}</div></div>`;
}
function renderSheet(){
  const el=$('#sheet');
  if(ui.sheet){clearTimeout(el._t);}
  if(!ui.sheet){el.hidden=true;el.innerHTML='';el.classList.remove('out');document.body.classList.remove('lock');return}
  const fresh=el.hidden||el.classList.contains('out');el.classList.remove('out');
  const inner={flow:flowHTML,pay:payHTML,gest:gestHTML,xfer:xferHTML,form:formHTML,txd:txdHTML,backup:backupHTML,accd:accdHTML,koleksi:koleksiHTML}[ui.sheet]();
  const st=fresh?0:($('#panel')||{}).scrollTop||0;
  el.innerHTML=`<div class="ov" data-action="sheet-close"></div><div class="panel" id="panel" style="${fresh?'':'animation:none'}"><div class="handle" id="handle"><i></i></div>${inner}</div>${subPop()}`;
  el.hidden=false;document.body.classList.add('lock');$('#panel').scrollTop=st;
  if($('#dExpr'))updateAmt();
  if(ui.sheet==='form'&&ui.form.kind==='card')updateCardPrev();
  bindDrag();
  rollAll();
}
function bindDrag(){
  const h=$('#handle'),p=$('#panel');if(!h)return;let y0=null,dy=0;
  h.onpointerdown=e=>{y0=e.clientY;dy=0;try{h.setPointerCapture(e.pointerId)}catch(x){}p.style.transition='none'};
  h.onpointermove=e=>{if(y0==null)return;dy=Math.max(0,e.clientY-y0);p.style.transform='translateY('+dy+'px)'};
  h.onpointerup=h.onpointercancel=()=>{if(y0==null)return;y0=null;if(dy>90)closeSheet();else{p.style.transition='transform .4s var(--spring)';p.style.transform=''}};
}
const closeBtn=`<button class="ibtn sm" data-action="sheet-close" aria-label="Tutup">${IC.x}</button>`;
const backBtn=`<button class="ibtn sm" data-action="fback" aria-label="Kembali">${IC.back}</button>`;

/* ---- numpad bersama ---- */
const KEYROWS=[['7','8','9','÷'],['4','5','6','×'],['1','2','3','-'],['000','0','bs','+']];
const amtDisp=()=>`<div class="disp"><span class="cur">Rp</span><span class="expr num" id="dExpr">0</span><button class="bsb" data-action="key" data-arg="bs" aria-label="Hapus (tahan untuk kosongkan)"><svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true"><path d="M8.6 1.5h13.4a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8.6a2 2 0 0 1-1.5-.7L1.4 11a2 2 0 0 1 0-2.6L7.1 2.2a2 2 0 0 1 1.5-.7Z" fill="currentColor"/><path d="m12.5 7 5 5m0-5-5 5" stroke="var(--s1)" stroke-width="2" stroke-linecap="round"/></svg></button><span class="res num" id="dRes"></span></div><div class="warn" id="dWarn"></div>`;
function numpad(saveAct,label){
  const kb=(k,t,c)=>`<button class="k ${c||''}" data-action="key" data-arg="${k}" aria-label="${k==='-'?'kurang':k==='='?'sama dengan':k}">${t||k}</button>`;
  const nums=['1','2','3','4','5','6','7','8','9','=','0','000'].map(k=>k==='='?kb('=','=','eq'):kb(k)).join('');
  const ops=kb('÷','÷','op')+kb('×','×','op')+kb('-','−','op')+kb('+','+','op');
  return`<div class="pad"><div class="pad-n">${nums}</div><div class="pad-o">${ops}</div></div><button class="svb" data-action="${saveAct}" data-lbl="${label||'Simpan'}">${label||'Simpan'}</button>`;
}
function evalExpr(e){
  const tk=String(e).match(/\d+|[+\-×÷]/g)||[];
  while(tk.length&&/[+\-×÷]/.test(tk[tk.length-1]))tk.pop();
  if(!tk.length)return 0;
  const a=[+tk[0]];
  for(let i=1;i<tk.length;i+=2){const op=tk[i],v=+tk[i+1];
    if(op==='×')a[a.length-1]*=v;else if(op==='÷')a[a.length-1]=v?a[a.length-1]/v:0;else a.push(op==='-'?-v:v)}
  return Math.round(a.reduce((x,y)=>x+y,0));
}
function pressKey(o,k){
  let e=o.expr;const OPS='+-×÷';
  if(k==='bs')e=e.slice(0,-1);
  else if(k==='c')e='';
  else if(k==='='){const v=evalExpr(e);e=v>0?String(v):''}
  else if(OPS.includes(k)){if(!e)return;e=OPS.includes(e.slice(-1))?e.slice(0,-1)+k:e+k}
  else{
    const last=e.split(/[+\-×÷]/).pop();
    if(last.length+k.length>12)return;
    if(k==='000'&&(last===''||last==='0'))return;
    if(last==='0')e=k==='0'?e:e.slice(0,-1)+k;else e+=k;
  }
  o.expr=e;
}
const amtVal=()=>evalExpr(ui.amt.expr);
/* pilihan nominal sekali ketuk (di bawah layar angka) */
const QA=[50000,100000,500000,1000000],qaLbl=v=>v>=1e6?(v/1e6)+' jt':(v/1e3)+' rb';
const quickAmts=extra=>`<div class="chips qa">${extra||''}${QA.map(v=>`<button type="button" class="chip" data-action="q-amt" data-arg="${v}">${qaLbl(v)}</button>`).join('')}</div>`;
function updateAmt(){
  const e=ui.amt.expr,de=$('#dExpr');if(!de)return;
  de.textContent=e?e.replace(/\d+/g,m=>nf.format(+m)).replace(/-/g,'−'):'0';
  const v=amtVal();
  /* tombol simpan ikut menampilkan nominal yang akan dicatat */
  const sv=document.querySelector('#sheet .svb');if(sv&&sv.dataset.lbl)sv.textContent=v>0?sv.dataset.lbl+' · '+money(v):sv.dataset.lbl;
  $('#dRes').textContent=/[+\-×÷]/.test(e)?'= '+rp(v):'';
  let msg='';
  if(ui.sheet==='flow')msg=limitWarn(v);
  else if(ui.sheet==='pay'){const debt=Math.max(0,D.debt[ui.pay.card]||0),bal=D.bal[ui.pay.from]||0;if(v>debt&&v>0)msg='Melebihi tagihan '+rp(debt)+'.';if(v>bal)msg+=(msg?' ':'')+'Saldo '+accName(ui.pay.from)+' cuma '+rp(bal)+'.'}
  else if(ui.sheet==='xfer'){const bal=D.bal[ui.xfer.from]||0;if(v>bal)msg='Saldo '+accName(ui.xfer.from)+' cuma '+rp(bal)+'.';if(ui.xfer.from===ui.xfer.to)msg='Pilih dompet tujuan yang berbeda.'}
  else if(ui.sheet==='gest'){updateGest();return}
  $('#dWarn').textContent=msg;
}

/* ---- input cepat 3 langkah ---- */
function toggleFab(force){
  const d=document.getElementById('dock'),b=document.getElementById('fabBd'),f=document.getElementById('fabBtn');if(!d)return;
  const on=typeof force==='boolean'?force:!d.classList.contains('fab-open');
  d.classList.toggle('fab-open',on);if(b)b.classList.toggle('on',on);if(f)f.setAttribute('aria-expanded',on?'true':'false');
}
function openNew(o){
  o=o||{};
  ui.flow={mode:'new',step:1,type:'exp',acc:'',cat:'',sub:'',openCat:'',date:today(),note:'',id:null,ret:0};ui.amt={expr:''};
  if(o.type==='inc')ui.flow.type='inc';
  if(o.acc){ui.flow.acc=o.acc;ui.flow.step=2}
  ui.sheet='flow';renderSheet();
}
function openEdit(id){
  const t=S.tx.find(x=>x.id===id);if(!t)return;
  if(t.t==='exp'||t.t==='inc'){
    ui.flow={mode:'edit',step:3,type:t.t,acc:t.acc,cat:t.cat,sub:t.sub||'',openCat:'',date:t.d,note:t.note||'',id:t.id,ret:0};ui.amt={expr:String(t.amt)};
    ui.sheet='flow';
  }else{ui.accd=null;ui.flow={id:t.id};ui.sheet='txd'}
  renderSheet();
}
function flowHTML(){const f=ui.flow;return f.step===1?flowStep1():f.step===2?flowStep2():flowStep3()}
function pickAcc(id,act,on,dis,sub){const a=accById(id);return`<button class="pk ${on?'on':''}" data-action="${act}" data-id="${id}" ${dis?'disabled':''}>${isCard(id)?shapeIcon(IC.card,hsh(id)%10,'cookie6',38):accIcon(a,38)}<span class="lm"><b>${esc(a.name)}</b>${isCard(id)?`<small>•• ${esc(a.last4)}</small>`:''}</span><span class="lr"><b>${sub}</b></span></button>`}
function flowStep1(){
  const f=ui.flow,exp=f.type==='exp';
  let h=`<div class="sh-h"><h3>${f.mode==='edit'?'Ganti akun':'Catat transaksi'}</h3>${f.ret?backBtn:''}${closeBtn}</div>`;
  if(f.mode==='new')h+=`<div class="vtab" id="vtab" data-t="${exp?'exp':'inc'}" role="group"><i class="vt-i" aria-hidden="true"></i><button class="${exp?'on':''}" data-action="ftype" data-arg="exp">Pengeluaran</button><button class="${!exp?'on':''}" data-action="ftype" data-arg="inc">Pemasukan</button></div>`;
  S.groups.forEach(g=>{const ws=S.wallets.filter(w=>w.g===g.id&&(canTrx(w)||w.id===f.acc));if(!ws.length)return;
    h+=`<div class="pk-g">${esc(g.name)}</div>`+ws.map(w=>pickAcc(w.id,'facc',f.acc===w.id,false,money(D.bal[w.id]||0))).join('')});
  if(S.cards.length)h+='<div class="pk-g">Kartu kredit</div>'+S.cards.map(c=>pickAcc(c.id,'facc',f.acc===c.id,!exp,'Sisa '+money(cardInfo(c).remain))).join('');
  if(!S.wallets.length&&!S.cards.length)h+='<p class="empty">Belum ada dompet atau kartu. Tambah dulu di Kelola.</p>';
  else if(!S.wallets.some(canTrx)&&!S.cards.length)h+='<p class="empty">Belum ada dompet untuk transaksi. Ubah "Fungsi dompet" di Kelola → Dompet.</p>';
  return h;
}
function flowStep2(){
  const f=ui.flow,cats=S.cats.filter(c=>c.t===f.type),sel=cats.find(c=>c.id===f.openCat);
  let h=`<div class="sh-h">${backBtn}<h3>Pilih kategori</h3>${closeBtn}</div><div class="grid4">${cats.map(c=>`<button class="cat ${(f.openCat||f.cat)===c.id?'on':''}" data-action="fcat" data-id="${c.id}">${catIconX(c.icon?esc(c.icon):'📦',c,64)}<span>${esc(c.name)}</span></button>`).join('')}</div>`;
  if(!cats.length)h+='<p class="empty">Belum ada kategori. Tambah di Kelola.</p>';
  return h;
}
function flowStep3(){
  const f=ui.flow,c=S.cats.find(x=>x.id===f.cat),a=accById(f.acc);
  return`<div class="sh-h">${f.mode==='edit'?'':backBtn}<h3>${f.mode==='edit'?'Ubah transaksi':f.type==='exp'?'Pengeluaran':'Pemasukan'}</h3>${closeBtn}</div>
  <div class="sel2"><button data-action="fjump" data-arg="1">${a?(isCard(a.id)?shapeIcon(IC.card,hsh(a.id)%10,'cookie6',28):accIcon(a,28)):''}<span>${esc(a?a.name:'Pilih akun')}</span></button><button data-action="fjump" data-arg="2">${c?catIcon(c,28):''}<span>${c?esc(c.name)+(f.sub?' · '+esc(f.sub):''):'Pilih kategori'}</span></button></div>
  ${amtDisp()}${quickAmts()}
  <div class="row2"><input id="f_date" type="date" data-input="fdate" value="${esc(f.date)}" aria-label="Tanggal"><input id="f_note" type="text" data-input="fnote" placeholder="Catatan (opsional)" value="${esc(f.note)}" aria-label="Catatan"></div>
  ${f.mode==='edit'?'':`<div class="rep-row"><span><b>Ulangi tiap bulan</b><small>Catat otomatis di tanggal yang sama tiap bulan</small></span><button type="button" class="sw-t ${f.rep?'on':''}" data-action="frep" role="switch" aria-checked="${!!f.rep}" aria-label="Ulangi tiap bulan"></button></div>`}
  ${numpad('fsave')}
  ${f.mode==='edit'?`<button class="btn dz" data-action="tx-del" data-id="${f.id}">Hapus transaksi</button>`:''}`;
}
function limitWarn(amt){
  const f=ui.flow,c=S.cards.find(x=>x.id===f.acc);if(!c||f.type!=='exp'||amt<=0)return'';
  const ci=cardInfo(c);let remain=ci.remain;
  if(f.mode==='edit'){const o=S.tx.find(t=>t.id===f.id);if(o&&o.acc===f.acc&&o.t==='exp')remain+=o.amt}
  const nm=ci.pool?ci.pool.name:'kartu ini';
  if(amt>remain)return`Melebihi sisa limit ${nm}: sisa ${rp(remain)}.`;
  if(ci.limit&&(remain-amt)/ci.limit<.1)return`Sisa limit ${nm} setelah ini tinggal ${rp(remain-amt)}.`;
  return'';
}

/* ---- pilihan dompet/kartu horizontal ---- */
const walletChips=(act,cur,except)=>`<div class="chips">${S.wallets.filter(w=>w.id!==except).map(w=>`<button class="chip tall ${w.id===cur?'on':''}" data-action="${act}" data-id="${w.id}">${esc(wLbl(w))}<small>${money(D.bal[w.id]||0)}</small></button>`).join('')||'<span class="lbl">Belum ada dompet</span>'}</div>`;
const cardChips=(act,cur)=>S.cards.length>1?`<div class="chips" style="margin-bottom:10px">${S.cards.map(c=>`<button class="chip ${c.id===cur?'on':''}" data-action="${act}" data-id="${c.id}">${esc(c.name)} ••${esc(c.last4)}</button>`).join('')}</div>`:'';

/* ---- bayar kartu ---- */
/* dompet yang terhubung ke kartu: pembayaran dan dana gestun hanya lewat dompet ini */
const cardWallet=c=>{const w=c&&c.wallet?S.wallets.find(x=>x.id===c.wallet):null;return w?w.id:''};
const linkedRow=(label,id)=>{const w=accById(id);return`<div class="pk-g" style="margin-top:6px">${label}</div><div class="mini"><span class="mini-w">${w?accIcon(w,32):''}<span class="lm"><b>${esc(accName(id))}</b><small>Terhubung ke kartu</small></span></span><b class="num">${money(D.bal[id]||0)}</b></div>`};
const unlinkedHint='<p class="hint">Kartu ini belum punya dompet terhubung. Atur di Kelola → Kartu → Ubah supaya otomatis.</p>';
const richest=()=>{const w=S.wallets.slice().sort((a,b)=>(D.bal[b.id]||0)-(D.bal[a.id]||0))[0];return w?w.id:''};
const richestX=()=>{const w=S.wallets.filter(canXfer).sort((a,b)=>(D.bal[b.id]||0)-(D.bal[a.id]||0))[0];return w?w.id:''};
function openPay(cardId){ui.pay={card:cardId,from:cardWallet(S.cards.find(x=>x.id===cardId))||richest(),date:today()};ui.amt={expr:''};ui.sheet='pay';renderSheet()}
function payHTML(){
  const P=ui.pay,c=S.cards.find(x=>x.id===P.card);if(!c)return'';const mp=c.minPct==null?10:c.minPct;
  return`<div class="sh-h"><h3>Bayar kartu</h3>${closeBtn}</div>${cardChips('p-card',P.card)}
  <div class="mini"><span>${esc(c.name)} <span class="mute">••${esc(c.last4)}</span></span><b class="num neg">${money(D.debt[c.id]||0)}</b></div>
  ${cardWallet(c)?linkedRow('Bayar dari',cardWallet(c)):`<div class="pk-g" style="margin-top:6px">Bayar dari</div>${walletChips('p-from',P.from)}${unlinkedHint}`}
  <div class="chips" style="margin-top:12px"><button class="chip" data-action="p-full">Lunas</button><button class="chip" data-action="p-min">Minimum ${mp}%</button></div>
  ${amtDisp()}
  <div class="row2" style="grid-template-columns:1fr"><input id="p_date" type="date" data-input="p-date" value="${esc(P.date)}" aria-label="Tanggal"></div>
  ${numpad('p-save','Bayar')}`;
}

/* ---- transfer ---- */
/* Tampilan transfer terinspirasi Asset swap (Bencho, MIT): dua keping, panah di
   sambungannya membalik arah (label Dari/Ke bertukar, dompetnya tetap), dan
   menekan dompet membuat kepingnya tumbuh jadi daftar pilihan. */
function xSync(){const X=ui.xfer;X.from=X.slots[X.up?1:0];X.to=X.slots[X.up?0:1]}
function openXfer(from){
  const fw=S.wallets.find(w=>w.id===from),f=fw&&canXfer(fw)?from:richestX(),to=(S.wallets.find(w=>w.id!==f&&canXfer(w))||{}).id||'';
  ui.xfer={slots:[f,to],up:false,turns:0,pick:null,from:f,to,date:today(),note:''};ui.amt={expr:''};ui.sheet='xfer';renderSheet();
}
function xferFace(i){
  const X=ui.xfer,id=X.slots[i],a=accById(id),payer=X.up?1:0;if(!a)return'';
  return`<span class="xs-l">${i===payer?'Dari':'Ke'}</span><span class="xs-n">${esc(a.name)}</span><span class="xs-s num">Saldo ${money(D.bal[id]||0)}</span><button type="button" class="xs-coin" data-action="x-open" data-arg="${i}" aria-label="Ganti dompet ${esc(a.name)}">${accIcon(a,24)}<span>Ganti</span></button>`;
}
function xferHTML(){
  const X=ui.xfer;
  const slab=i=>`<div class="xs-c" data-i="${i}"><div class="xs-face" id="xsf${i}" style="${i===0?'top:0':'bottom:0'}">${xferFace(i)}</div><div class="xs-pick" id="xsp${i}"></div></div>`;
  return`<div class="sh-h"><h3>Transfer</h3>${closeBtn}</div>
  <div class="xs" id="xs">${slab(0)}${slab(1)}<button type="button" class="xs-flip" data-action="x-flip" aria-label="Balik arah transfer"><svg id="xsArrow" style="transform:rotate(${X.turns*180}deg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button></div>
  ${amtDisp()}${quickAmts('<button type="button" class="chip" data-action="q-all">Semua saldo</button>')}
  <div class="row2"><input type="date" id="x_date" data-input="x-date" value="${esc(X.date)}" aria-label="Tanggal"><input id="x_note" data-input="x-note" placeholder="Catatan (opsional)" value="${esc(X.note)}" aria-label="Catatan"></div>
  ${numpad('x-save','Transfer')}`;
}
function xFaces(){[0,1].forEach(i=>{const e=document.getElementById('xsf'+i);if(e)e.innerHTML=xferFace(i)})}
function xClose(){
  const X=ui.xfer,xs=document.getElementById('xs');if(!X||X.pick===null||!xs)return;
  X.pick=null;xs.classList.remove('pk');xs.querySelectorAll('.xs-c').forEach(c=>c.classList.remove('on','sq'));
}

/* ---- gestun ---- */
function openGest(cardId){
  if(!gestOn())return toast('Menu Gestun nonaktif. Aktifkan di Atur');
  const w=S.wallets.find(x=>x.id===cardWallet(S.cards.find(c=>c.id===cardId)))||S.wallets.find(x=>/bank/i.test(x.name||''))||S.wallets[0];
  ui.gest={card:cardId,wallet:w?w.id:'',feeMode:'pct',feeVal:'',scheme:'A',date:today()};ui.amt={expr:''};ui.sheet='gest';renderSheet();
}
function gestCalc(){
  const G=ui.gest,nom=amtVal(),fv=parseFloat(String(G.feeVal).replace(',','.'))||0;
  const fee=G.feeMode==='pct'?Math.round(nom*fv/100):Math.round(fv);
  return{nom,fee,cardAmt:G.scheme==='A'?nom:nom+fee,inAmt:G.scheme==='A'?nom-fee:nom};
}
function gestHTML(){
  const G=ui.gest,c=S.cards.find(x=>x.id===G.card);if(!c)return'';
  return`<div class="sh-h"><h3>Gestun</h3>${closeBtn}</div>${cardChips('g-card',G.card)}
  <div class="mini"><span>${esc(c.name)} <span class="mute">••${esc(c.last4)}</span></span><span class="num">Sisa <b>${money(cardInfo(c).remain)}</b></span></div>
  <div class="pk-g" style="margin-top:6px">Skema</div>
  <button class="opt ${G.scheme==='A'?'on':''}" data-action="g-scheme" data-arg="A"><b>A · Potong cair</b><small>Tagihan naik sebesar nominal, dana cair dipotong fee.</small></button>
  <button class="opt ${G.scheme==='B'?'on':''}" data-action="g-scheme" data-arg="B"><b>B · Terima bersih</b><small>Dana cair utuh, fee ditambahkan ke tagihan.</small></button>
  <div class="pk-g">Fee</div>
  <div class="fee-row"><input id="g_fee" data-input="g-fee" inputmode="decimal" placeholder="${G.feeMode==='pct'?'Contoh: 3':'Contoh: 50000'}" value="${esc(G.feeVal)}" aria-label="Nilai fee"><div class="bgroup"><button class="${G.feeMode==='pct'?'on':''}" data-action="g-mode" data-arg="pct">%</button><button class="${G.feeMode==='rp'?'on':''}" data-action="g-mode" data-arg="rp">Rp</button></div></div>
  ${cardWallet(c)?linkedRow('Dana cair ke',cardWallet(c)):`<div class="pk-g">Dana cair ke</div>${walletChips('g-wallet',G.wallet)}${unlinkedHint}`}
  <div class="pk-g">Nominal gestun</div>
  ${amtDisp()}${quickAmts()}<div class="prev" id="gprev"></div>
  <div class="row2" style="grid-template-columns:1fr"><input id="g_date" type="date" data-input="g-date" value="${esc(G.date)}" aria-label="Tanggal"></div>
  ${numpad('g-save')}`;
}
function updateGest(){
  const G=ui.gest,c=S.cards.find(x=>x.id===G.card),r=gestCalc(),p=$('#gprev');if(!p||!c)return;
  const sg=(v,sgn,cls)=>v?`<b class="num ${cls}">${sgn}${rp(v)}</b>`:`<b class="num mute">${rp(0)}</b>`;
  p.innerHTML=`<div class="pr"><span>Tagihan ${esc(c.name)}</span>${sg(r.cardAmt,'+','warnc')}</div><div class="pr"><span>Saldo ${esc(accName(G.wallet))}</span>${sg(r.inAmt,'+','pos')}</div><div class="pr"><span>Biaya admin (Admin · Gestun)</span>${sg(r.fee,'','')}</div><div class="pr t"><span>Kekayaan bersih</span>${sg(r.fee,'−','neg')}</div>`;
  const rem=cardInfo(c).remain;let m='';
  if(r.cardAmt>rem)m=`Melebihi sisa limit: sisa ${rp(rem)}.`;
  if(r.nom>0&&r.inAmt<=0)m='Fee lebih besar dari nominal.';
  $('#dWarn').textContent=m;
}

/* ---- detail akun ---- */
function accdHTML(){
  const id=ui.accd.id,a=accById(id);if(!a)return'';
  const card=isCard(id),list=sortedTx().filter(t=>t.acc===id||t.to===id).slice(0,40);
  let head,acts;
  if(card){
    head=`<div class="cprev" style="width:100%">${cardHTML(a)}</div>`;
    acts=`<div class="bgroup" style="margin-bottom:6px"><button class="fill" data-action="swipe" data-id="${id}">+ Gesek</button><button class="tonal" data-action="open-pay" data-id="${id}">Bayar</button>${gestOn()?`<button class="tonal" data-action="open-gest" data-id="${id}">Gestun</button>`:''}<button class="tonal" data-action="fedit" data-arg="card" data-id="${id}">Ubah</button></div>${limitBlock(a)}`;
  }else{
    const g=S.groups.find(x=>x.id===a.g);
    head=`<div class="accd-h" style="--c:${walCol(a)}">${colIcon(esc((a.name||'?').charAt(0).toUpperCase()),walCol(a),'squircle',52)}<div class="accd-t"><b>${esc(a.name)}</b><small>${esc([g?g.name:'',a.note].filter(Boolean).join(' · '))}</small></div><div class="big num" ${mv('s:ab:'+id,D.bal[id]||0)}>${money(D.bal[id]||0)}</div></div>`;
    acts=`<div class="bgroup">${canTrx(a)?`<button class="fill" data-action="open-acc" data-id="${id}">+ Catat</button>`:''}${canXfer(a)?`<button class="${canTrx(a)?'tonal':'fill'}" data-action="open-xfer" data-id="${id}">Transfer</button>`:''}<button class="tonal" data-action="fedit" data-arg="wallet" data-id="${id}">Ubah</button></div>`;
  }
  return`<div class="sh-h"><h3>${card?'Detail kartu':'Detail dompet'}</h3>${closeBtn}</div>${head}${acts}<div class="pk-g" style="margin-top:20px">Riwayat</div>${txList(list,id)}`;
}

/* ---- detail transaksi sistem ---- */
function txdHTML(){
  const t=S.tx.find(x=>x.id===ui.flow.id);if(!t)return'';
  const grp=t.link?S.tx.filter(x=>x.link===t.link):[t];
  const ttl=t.t==='pay'?'Pembayaran kartu':t.t==='xfer'?'Transfer':'Gestun · skema '+(t.sch||'A');
  return`<div class="sh-h"><h3>${ttl}</h3>${closeBtn}</div>
  <div class="prev">${grp.map(x=>{const l={pay:'Bayar',xfer:'Transfer',gcard:'Tagihan kartu',gin:'Dana masuk',gfee:'Biaya admin'}[x.t];return`<div class="pr"><span>${l}${x.acc?' · '+esc(accName(x.acc)):''}${x.to?' → '+esc(accName(x.to)):''}</span><b class="num">${rp(x.amt)}</b></div>`}).join('')}<div class="pr t"><span>Tanggal</span><b>${esc(fmtDate(t.d))}</b></div>${grp.some(x=>x.sg)?`<div class="stamp-row">${stampSVG(t.d,true,t.t,t.id)}</div>`:''}${t.note?`<div class="pr"><span>Catatan</span><span>${esc(t.note)}</span></div>`:''}</div>
  <p class="hint">Untuk mengubahnya, hapus lalu catat ulang.</p>
  <button class="btn dz" data-action="tx-del" data-id="${t.id}">${t.link?'Hapus gestun (3 catatan)':'Hapus catatan ini'}</button>`;
}

/* ---- form kelola ---- */
const FK={group:'groups',wallet:'wallets',pool:'pools',card:'cards',cat:'cats',rec:'recur',pur:'purs',bud:'cats'};
const FT={group:'kelompok akun',wallet:'dompet',pool:'grup limit',card:'kartu kredit',cat:'kategori',rec:'transaksi berulang',pur:'peruntukan',bud:'anggaran'};
const THEMES={obsidian:'Obsidian',silver:'Perak',gold:'Emas',emerald:'Zamrud',aurora:'Aurora',midnight:'Malam',rose:'Mawar'};
const fld=(label,inner,hint)=>`<label class="f"><span>${label}</span>${inner}${hint?`<small>${hint}</small>`:''}</label>`;
const inp=(name,v,extra)=>`<input id="f_${name}" name="${name}" value="${esc(v)}" ${extra||''}>`;
/* pemilih buatan sendiri (menggantikan <select> bawaan HP): tombol + daftar geser dari bawah */
const PS_CH='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const psel=(name,groups,v,extra)=>{
  const all=groups.reduce((a,g)=>a.concat(g[1]),[]),cur=all.find(o=>String(o[0])===String(v))||all[0]||['',''];
  return`<div class="ps" data-o="${esc(JSON.stringify(groups))}"><input type="hidden" id="f_${name}" name="${name}" value="${esc(cur[0])}" ${extra||''}><button type="button" class="ps-b" data-action="psopen" aria-haspopup="listbox"><span class="ps-l">${cur[2]?`<i class="ps-d" style="--c:${esc(cur[2])}"></i>`:''}<span>${esc(cur[1])}</span></span>${PS_CH}</button></div>`;
};
const sel=(name,opts,v,extra)=>psel(name,[[null,opts]],v,extra);
let PP=null;
function ppClose(now){
  const m=$('#pp');if(!m)return;
  if(PP&&PP.btn)PP.btn.classList.remove('open');
  const done=()=>{m.remove();if(PP&&PP.btn)try{PP.btn.focus({preventScroll:true})}catch(x){}PP=null};
  if(now||RM())return done();
  m.classList.add('out');setTimeout(done,240);
}
function psOpen(el){
  if($('#pp'))return;
  const w=el.closest('.ps'),inp=w.querySelector('input'),groups=JSON.parse(w.dataset.o),t=w.parentElement.querySelector(':scope>span'),title=t?t.textContent:'Pilih';
  const row=o=>`<button type="button" class="pp-r ${String(o[0])===inp.value?'on':''} ${String(o[1]).charAt(0)==='+'?'add':''}" role="option" aria-selected="${String(o[0])===inp.value}" data-action="pspick" data-v="${esc(o[0])}" data-l="${esc(o[1])}" data-c="${esc(o[2]||'')}">${o[2]?`<i class="ps-d" style="--c:${esc(o[2])}"></i>`:''}<span class="pp-x">${esc(o[1])}</span><i class="rd"></i></button>`;
  const m=document.createElement('div');m.className='pp';m.id='pp';
  m.innerHTML=`<div class="pp-ov" data-action="ppclose"></div><div class="pp-p" role="listbox" aria-label="${esc(title)}"><div class="pp-grab"></div><div class="pp-t">${esc(title)}</div><div class="pp-list">${groups.map(g=>(g[0]?`<div class="pp-g">${esc(g[0])}</div>`:'')+g[1].map(row).join('')).join('')}</div></div>`;
  document.body.appendChild(m);PP={wrap:w,inp,btn:el};el.classList.add('open');
  const on=m.querySelector('.pp-r.on')||m.querySelector('.pp-r');if(on){on.scrollIntoView({block:'center'});try{on.focus({preventScroll:true})}catch(x){}}
}
function psPick(el){
  if(!PP)return;const {inp,btn}=PP,c=el.dataset.c;
  inp.value=el.dataset.v;
  btn.querySelector('.ps-l').innerHTML=(c?`<i class="ps-d" style="--c:${esc(c)}"></i>`:'')+'<span>'+esc(el.dataset.l)+'</span>';
  inp.dispatchEvent(new Event('change',{bubbles:true}));ppClose();
}
function openForm(kind,id){
  const o=id?S[FK[kind]].find(x=>x.id===id):null;
  ui.accd=null;ui.form={kind,id:id||null,bg:o&&o.bg?o.bg:null};ui.sheet='form';renderSheet();
}
const subRow=(c,name,orig)=>{const sh=((c.sc||{})[orig])||'',v=stkVars(sh?Object.assign({},c,{color:sh}):c);
  return`<div class="sub-row" style="--sbg:${v[0]};--srg:${v[1]}"><input class="sub-ic" maxlength="4" value="${esc(((c.si||{})[orig]||''))}" placeholder="${esc(c.icon||'📦')}" aria-label="Ikon sub-kategori" inputmode="text"><button type="button" class="sub-cb${sh?' set':''}" data-action="subcol" data-hex="${sh}" style="--c:${sh||catHex(c)}" aria-label="Warna sub-kategori" aria-expanded="false"><i></i></button><input class="sub-nm" value="${esc(name)}" data-orig="${esc(orig||'')}" placeholder="Nama sub-kategori" maxlength="30"><button type="button" class="sub-x" data-action="subdel" aria-label="Hapus sub-kategori">×</button></div>`};
const subPal=cur=>`<div class="sub-pal" role="group" aria-label="Pilih warna sub-kategori"><button type="button" class="sp-f${cur?'':' on'}" data-action="subpick" data-arg="" aria-label="Ikut warna kategori">Ikut kategori</button>${COLS.map(h=>`<button type="button" class="sp-c${h===cur?' on':''}" style="background:${h}" data-action="subpick" data-arg="${h}" aria-label="Warna ${h}"></button>`).join('')}</div>`;
const subEditor=o=>{const c=o||{icon:'📦',t:'exp',subs:[],si:{},color:COLS[S.cats.length%COLS.length]};return`<div class="f"><span>Sub-kategori</span><div class="subed" id="subEd" style="--sbg:${stkVars(c)[0]};--srg:${stkVars(c)[1]}">${c.subs.map(n=>subRow(c,n,n)).join('')}</div><button type="button" class="sub-add" data-action="subadd">+ Tambah sub-kategori</button><small class="sub-hint">Ikon dan warna yang kosong ikut kategori.</small></div>`};
function formHTML(){
  const F=ui.form,k=F.kind,o=F.id?S[FK[k]].find(x=>x.id===F.id):null;
  let b='';
  if(k==='rec'){const accs=S.wallets.filter(w=>canTrx(w)||(o&&o.acc===w.id)).map(w=>[w.id,wLbl(w)]).concat(S.cards.map(c=>[c.id,c.name+' ••'+c.last4+' (kartu)']));
    const catOpt=t=>S.cats.filter(c=>c.t===t).map(c=>[c.id,c.name]);
    b=fld('Kategori',psel('cat',[[null,[['','Pilih kategori…']]],['Pengeluaran',catOpt('exp')],['Pemasukan',catOpt('inc')]],o?o.cat:''))+
      fld('Akun',sel('acc',[['','Pilih akun…']].concat(accs),o?o.acc:''))+
      fld('Jumlah (Rp)',inp('amt',o?nf.format(o.amt):'','data-input="money" inputmode="numeric" placeholder="0"'))+
      fld('Tanggal tiap bulan',inp('day',o?o.day:today().slice(8),'inputmode="numeric" maxlength="2"'),'Bulan yang lebih pendek memakai tanggal terakhir bulan itu.')+
      fld('Catatan',inp('note',o&&o.note?o.note:'','placeholder="Contoh: Gaji, Netflix, Cicilan" maxlength="40"'));}
  if(k==='bud'){const free=S.cats.filter(c=>c.t==='exp'&&!(+c.budget>0));
    b=fld('Kategori',o?`<input value="${esc(o.name)}" disabled><input type="hidden" name="cat" value="${esc(o.id)}">`:psel('cat',[[null,[['','Pilih kategori…']].concat(free.map(c=>[c.id,c.name]))]],''))+fld('Anggaran per bulan (Rp)',inp('amt',o&&o.budget?nf.format(o.budget):'','data-input="money" inputmode="numeric" placeholder="0"'),'Kartu di beranda terisi air seiring pengeluaran bulan ini.')}
  if(k==='pur')b=fld('Nama',inp('name',o?o.name:'','placeholder="Contoh: Darurat" maxlength="24"'))+colorField(o?purCol(o):purNext());
  if(k==='group')b=fld('Nama',inp('name',o?o.name:'','placeholder="Contoh: Kas & Bank"'))+colorField(o?grpCol(o):COLS[0]);
  if(k==='wallet')b=fld('Nama',inp('name',o?o.name:'','placeholder="Contoh: Dompet harian"'))+fld('Keterangan',inp('note',o&&o.note?o.note:'','placeholder="Contoh: Transport & jajan" maxlength="40"'))+colorField(o?walCol(o):COLS[3])+fld('Kelompok',sel('g',S.groups.map(g=>[g.id,g.name,grpCol(g)]),o?o.g:(S.groups[0]||{}).id))+fld('Fungsi dompet',sel('use',[['both','Semua'],['trx','Hanya transaksi'],['xfer','Hanya transfer']],o?wUse(o):'both'),'Menentukan dompet ini muncul di pilihan mana saat mencatat.')+fld('Peruntukan',sel('pu',[['','Tanpa peruntukan']].concat(S.purs.map(q=>[q.id,q.name,purCol(q)]),[['__new','+ Peruntukan baru…']]),o&&o.pu?o.pu:'','data-input="pusel"')+inp('pun','','maxlength="24" placeholder="Nama peruntukan baru" hidden style="margin-top:8px"'),'Dompet dengan peruntukan sama dijumlahkan di dasbor.')+fld('Target (Rp)',inp('tg',o&&o.tg?nf.format(o.tg):'','data-input="money" inputmode="numeric" placeholder="Opsional"'),'Isi kalau kantong ini punya tujuan saldo.')+fld('Saldo awal (Rp)',inp('open',o&&o.open?nf.format(o.open):'','data-input="money" inputmode="numeric" placeholder="0"'),'Saldo sebelum transaksi pertama yang dicatat.');
  if(k==='pool')b=fld('Nama',inp('name',o?o.name:'','placeholder="Contoh: Plafon Bank"'))+fld('Limit bersama (Rp)',inp('limit',o?nf.format(o.limit):'','data-input="money" inputmode="numeric" placeholder="0"'),'Dipakai bersama oleh kartu-kartu dalam grup ini.');
  if(k==='cat'){
    const init=o||{id:'new',icon:'📦',t:'exp',color:COLS[S.cats.length%COLS.length]};
    b=`<div class="cf-r1"><div class="catprev" id="catPrev">${catIcon(init,56)}</div>${fld('Nama',inp('name',o?o.name:''))}</div>`+
      `<div class="cf-r2">${fld('Jenis',o?`<input value="${o.t==='exp'?'Pengeluaran':'Pemasukan'}" disabled><input type="hidden" name="t" value="${o.t}">`:sel('t',[['exp','Pengeluaran'],['inc','Pemasukan']],'exp','data-input="catprev"'))}${fld('Ikon (emoji)',inp('icon',o?o.icon:'📦','maxlength="4" data-input="catprev"'))}</div>`+
      colorField(catHex(init))+
      (!o||o.t==='exp'?fld('Anggaran bulanan (Rp)',inp('budget',o&&o.budget?nf.format(o.budget):'','data-input="money" inputmode="numeric" placeholder="Tanpa batas"'),'Batas pengeluaran per bulan.'):'')+
      subEditor(o);
  }
  if(k==='card'){
    const c=o||{name:'',bank:'',last4:'',net:'visa',theme:'obsidian',pool:'',wallet:'',limit:0,cut:20,due:5,minPct:10,bg:null,contrast:40};
    b=`<div class="cprev" id="cardPrev"></div>`+
      fld('Nama kartu',inp('name',c.name,'data-input="cprev"'))+fld('Bank',inp('bank',c.bank,'data-input="cprev"'))+
      `<div class="row2" style="grid-template-columns:1fr 1fr;margin:0">${fld('4 digit terakhir',inp('last4',c.last4,'maxlength="4" inputmode="numeric" data-input="cprev"'))}${fld('Jaringan',sel('net',[['visa','Visa'],['mc','Mastercard']],c.net,'data-input="cprev"'))}</div>`+
      `<div class="f"><span>Tema</span><div class="sw-row">${Object.keys(THEMES).map(t=>`<button type="button" class="sw th-${t} ${t===(c.theme||'obsidian')?'on':''}" data-action="ctheme" data-arg="${t}" aria-label="Tema ${THEMES[t]}"></button>`).join('')}</div><input type="hidden" name="theme" value="${esc(c.theme||'obsidian')}"></div>`+
      fld('Dompet terhubung',sel('wallet',[['','Pilih dompet…']].concat(S.wallets.map(w=>[w.id,wLbl(w)+' · '+rp(D.bal[w.id]||0)])),c.wallet||''),'Kartu ini hanya dibayar dari dompet ini, dan dana gestun cair ke sini.')+
      fld('Grup limit',sel('pool',[['','Tanpa grup (limit sendiri)']].concat(S.pools.map(p=>[p.id,p.name+' · '+rp(p.limit)])),c.pool||''))+
      fld('Limit sendiri (Rp)',inp('limit',c.limit?nf.format(c.limit):'','data-input="money" inputmode="numeric" placeholder="0"'),'Dipakai bila kartu tidak masuk grup limit.')+
      `<div class="row2" style="grid-template-columns:1fr 1fr 1fr;margin:0">${fld('Tgl cetak',inp('cut',c.cut||'','inputmode="numeric" maxlength="2"'))}${fld('Jatuh tempo',inp('due',c.due||'','inputmode="numeric" maxlength="2"'))}${fld('Min. bayar %',inp('minPct',c.minPct==null?10:c.minPct,'inputmode="numeric" maxlength="3"'))}</div>`+
      fld('Foto latar kartu',`<input id="f_bgfile" type="file" accept="image/*" data-input="bgfile">`,'Foto dikecilkan otomatis agar ringan.')+
      `<button class="pbtn" style="margin:-4px 0 14px" data-action="rmbg">Hapus foto latar</button>`+
      fld('Kontras teks (gelapkan foto)',`<input id="f_contrast" name="contrast" type="range" min="0" max="100" value="${c.contrast==null?40:c.contrast}" data-input="cprev">`);
  }
  return`<div class="sh-h"><h3>${F.id?'Ubah ':'Tambah '}${FT[k]}</h3>${closeBtn}</div>${b}<button class="btn acc" data-action="fsaveform">Simpan</button>${F.id?`<button class="btn dz" data-action="fdelform">Hapus</button>`:''}`;
}
const fv=n=>{const el=$('#panel [name="'+n+'"]');return el?el.value.trim():''};
function cardFromForm(){
  const F=ui.form,o=F.id?S.cards.find(x=>x.id===F.id):null;
  return Object.assign({},o||{},{name:fv('name')||'Kartu',bank:fv('bank'),last4:(fv('last4')||'0000').replace(/\D/g,'').padStart(4,'0').slice(-4),net:fv('net')||'visa',theme:fv('theme')||'obsidian',pool:fv('pool'),wallet:fv('wallet'),limit:num(fv('limit')),cut:clamp(num(fv('cut'))||1,1,31),due:clamp(num(fv('due'))||1,1,31),minPct:clamp(num(fv('minPct')),0,100),bg:F.bg,contrast:+fv('contrast')});
}
function updateCardPrev(){const p=$('#cardPrev');if(p)p.innerHTML=cardHTML(cardFromForm(),ui.form.id?undefined:1250000)}
function updateCatPrev(){const p=$('#catPrev');if(!p)return;const o=ui.form.id?S.cats.find(x=>x.id===ui.form.id):null;const t=o?o.t:(fv('t')||'exp'),cc={id:ui.form.id||'new',icon:fv('icon')||'📦',t,color:fv('color')};p.innerHTML=catIcon(cc,56);const e=$('#subEd');if(e){const v=stkVars(cc);e.style.setProperty('--sbg',v[0]);e.style.setProperty('--srg',v[1])}}
function saveForm(){
  const F=ui.form,k=F.kind,col=S[FK[k]],o=F.id?col.find(x=>x.id===F.id):null;
  let rec;
  if(k==='bud'){const c=S.cats.find(x=>x.id===(o?o.id:fv('cat'))),a=num(fv('amt'));if(!c)return toast('Pilih kategori dulu');if(!(a>0))return toast('Isi jumlah anggaran');c.budget=a;closeSheet();commit('Tersimpan');return}
  if(k==='group'){const n=fv('name');if(!n)return toast('Isi nama dulu');rec={name:n,color:hexOk(fv('color'))?fv('color'):undefined}}
  if(k==='wallet'){const n=fv('name');if(!n)return toast('Isi nama dulu');if(!fv('g'))return toast('Buat kelompok akun dulu');rec={name:n,note:(fv('note')||'').trim(),color:hexOk(fv('color'))?fv('color'):undefined,g:fv('g'),pu:fv('pu'),use:(['trx','xfer'].includes(fv('use'))?fv('use'):undefined),tg:num(fv('tg'))||0,open:num(fv('open'))};
    if(rec.pu==='__new'){const pn=(fv('pun')||'').trim();if(!pn)return toast('Isi nama peruntukan baru');
      let q=S.purs.find(x=>x.name.trim().toLowerCase()===pn.toLowerCase());if(!q){q={id:uid(),name:pn,color:purNext()};S.purs.push(q)}rec.pu=q.id}}
  if(k==='pur'){const n=fv('name');if(!n)return toast('Isi nama dulu');if(S.purs.some(x=>x.id!==F.id&&x.name.trim().toLowerCase()===n.toLowerCase()))return toast('Nama peruntukan sudah ada');
    rec={name:n,color:hexOk(fv('color'))?fv('color'):purNext()}}
  if(k==='pool'){const n=fv('name');if(!n)return toast('Isi nama dulu');rec={name:n,limit:num(fv('limit'))}}
  if(k==='cat'){const n=fv('name');if(!n)return toast('Isi nama dulu');rec={name:n,t:o?o.t:fv('t'),icon:fv('icon')||'📦',color:hexOk(fv('color'))?fv('color'):undefined,subs:[],si:{},sc:{},budget:(o?o.t:fv('t'))==='exp'?num(fv('budget')):0};
    const seen={},ren={};
    document.querySelectorAll('#panel .sub-row').forEach(r=>{const nm=r.querySelector('.sub-nm'),ic=r.querySelector('.sub-ic');const n=nm.value.trim();if(!n||seen[n.toLowerCase()])return;seen[n.toLowerCase()]=1;rec.subs.push(n);const cb=r.querySelector('.sub-cb');if(cb&&hexOk(cb.dataset.hex))rec.sc[n]=cb.dataset.hex;const e=[...ic.value.trim()].slice(0,2).join('');if(e)rec.si[n]=e;const og=nm.dataset.orig;if(og&&og!==n)ren[og]=n});
    if(o&&Object.keys(ren).length)S.tx.forEach(t=>{if(t.cat===o.id&&t.sub&&ren[t.sub])t.sub=ren[t.sub]})}
  if(k==='card'){rec=cardFromForm();if(S.wallets.length&&!rec.wallet)return toast('Pilih dompet terhubung dulu')}
  if(k==='rec'){const c=S.cats.find(x=>x.id===fv('cat')),acc=fv('acc'),amt=num(fv('amt')),day=clamp(num(fv('day'))||1,1,31);
    if(!c)return toast('Pilih kategori');if(!acc)return toast('Pilih akun');if(!(amt>0))return toast('Isi jumlah dulu');
    if(c.t==='inc'&&isCard(acc))return toast('Pemasukan tidak bisa masuk ke kartu kredit');
    rec={t:c.t,acc,cat:c.id,sub:'',amt,day,note:fv('note'),last:o?o.last:(day>+today().slice(8)?monShift(today().slice(0,7),-1):today().slice(0,7))}}
  if(o)Object.assign(o,rec);else col.push(Object.assign({id:uid()},rec));
  closeSheet();commit('Tersimpan');
}
function deleteForm(btn){
  const F=ui.form,k=F.kind,id=F.id;
  if(k==='group'&&S.wallets.some(w=>w.g===id))return toast('Pindahkan atau hapus dompet di kelompok ini dulu');
  if(k==='wallet'&&S.tx.some(t=>t.acc===id||t.to===id))return toast('Dompet ini masih punya transaksi');
  if(k==='wallet'&&S.cards.some(c=>c.wallet===id))return toast('Dompet ini terhubung ke kartu kredit. Ganti dompet kartunya dulu');
  if(k==='card'&&S.tx.some(t=>t.acc===id||t.to===id))return toast('Kartu ini masih punya transaksi');
  if(k==='pool'&&S.cards.some(c=>c.pool===id))return toast('Masih ada kartu di grup limit ini');
  if(k==='cat'&&S.tx.some(t=>t.cat===id))return toast('Kategori ini masih dipakai transaksi');
  if(!confirmTap(btn,'form'+id))return;
  if(k==='bud'){const c=S.cats.find(x=>x.id===id);if(c)c.budget=0;closeSheet();commit('Anggaran dihapus');return}
  if(k==='pur')S.wallets.forEach(w=>{if(w.pu===id)w.pu=''});
  S[FK[k]]=S[FK[k]].filter(x=>x.id!==id);closeSheet();commit('Dihapus');
}
function loadImage(file){
  const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{
    const mx=720,sc=Math.min(1,mx/Math.max(im.width,im.height)),cv=document.createElement('canvas');
    cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
    ui.form.bg=cv.toDataURL('image/jpeg',.72);updateCardPrev();toast('Foto dipasang');
  };im.onerror=()=>toast('Foto tidak bisa dibaca');im.src=r.result};
  r.readAsDataURL(file);
}

/* ---- cadangan ---- */
function backupHTML(){
  if(ui.backup.mode==='export')return`<div class="sh-h"><h3>Ekspor JSON</h3>${closeBtn}</div><p class="hint">Salin teks ini dan simpan di tempat aman, misalnya catatan atau email ke diri sendiri.</p><textarea id="bk_text" readonly>${esc(JSON.stringify(S))}</textarea><button class="btn acc" style="margin-top:10px" data-action="bk-copy">Salin ke papan klip</button>`;
  return`<div class="sh-h"><h3>Impor JSON</h3>${closeBtn}</div><p class="hint">Tempel cadangan atau pilih file .json. Data saat ini akan diganti.</p><input type="file" accept=".json,application/json" data-input="bk-file" style="margin-bottom:10px"><textarea id="bk_text" placeholder="Tempel JSON di sini"></textarea><button class="btn acc" style="margin-top:10px" data-action="bk-apply">Terapkan impor</button>`;
}

/* ============ aksi (delegasi klik tunggal) ============ */
function commit(msg){if(SIG_PASS){if(SIG_N0!=null)S.tx.slice(SIG_N0).forEach(t=>{t.sg=1});if(SIG_ED){const e=S.tx.find(x=>x.id===SIG_ED);if(e)e.sg=1}}recalc();persist();render();if(ui.sheet)renderSheet();if(msg)toast(msg)}
function goNext(){const f=ui.flow;if(f.ret){f.step=f.ret;f.ret=0}else f.step=3}
/* ══ Tanda tangan ═════════════════════════════════════════
   Diporting dari komponen "Signature pad" milik Bencho
   (MIT — bencho.dev/licence), dari React ke JavaScript biasa.

   Tanda tangan di garis. Tinta menipis saat pena bergerak cepat
   dan menggenang saat melambat, seperti mata pena sungguhan —
   itulah yang membuat coretan terbaca sebagai tanda tangan, bukan
   sekadar jejak jari.

   ── LALU IA MINGGIR ─────────────────────────────────────
   Diam sebentar setelah goresan terakhir dan kartu melipat diri
   menjadi pil kecil bertuliskan Tertanda — seluruh kartunya
   mengecil ke dalam konfirmasi, bukan baris tulisan kecil di
   bawah tanda tangan. Tekan pil untuk tanda tangan ulang.

   ── HAPUS = MEMUTAR BALIK ───────────────────────────────
   Hapus tidak menyapu bersih. Tinta ditarik kembali, titik
   terakhir dulu, sampai sentuhan pertama — tanda tangan diambil
   kembali dengan urutan saat ia diberikan.

   ── SVG, BUKAN CANVAS ───────────────────────────────────
   Setiap ruas adalah kurva pendek dengan lebarnya sendiri. SVG
   tajam di skala apa pun dan tintanya currentColor. */

/* pena terangkat: tinta melunak SOFT_MS kemudian, dan kartu
   melipat pada FOLD_MS bila pena belum kembali. Goresan baru di
   antaranya mengembalikan tinta ke kekuatan penuh */
const SIG={SOFT:220,FOLD:1500,W:300,H:180,LINE_Y:128,INSET:28,PILL_W:124,PILL_H:40};
const sigClamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sigEase=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;

/* satu goresan sebagai potongan kuadratik pendek melalui titik
   tengah, masing-masing selebar pena di titik itu */
function sigPieces(s,upto){
  const n=Math.min(s.length,upto);if(n<=0)return'';
  if(n===1||s.length===1)return`<circle cx="${s[0].x}" cy="${s[0].y}" r="${s[0].w/2}" fill="currentColor"/>`;
  let out='';
  for(let i=1;i<n;i++){
    const a=s[i-1],b=s[i];
    const st=i===1?a:{x:(s[i-2].x+a.x)/2,y:(s[i-2].y+a.y)/2};
    const en=i===s.length-1?b:{x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    out+=`<path d="M${st.x.toFixed(1)} ${st.y.toFixed(1)}Q${a.x.toFixed(1)} ${a.y.toFixed(1)} ${en.x.toFixed(1)} ${en.y.toFixed(1)}" stroke-width="${((a.w+b.w)/2).toFixed(2)}"/>`;
  }
  return out;
}

function mountSig(host,o){
  o=o||{};const {SOFT,FOLD,W,H,LINE_Y,INSET,PILL_W,PILL_H}=SIG;
  const pen=o.pen==null?55:o.pen,smooth=o.smooth==null?50:o.smooth,rewind=o.rewind==null?50:o.rewind,corner=o.corner==null?22:o.corner;
  host.innerHTML=`<div class="sig-frame" style="width:${W}px;height:${H}px"><div class="sig" data-ink="Black" style="width:${W}px;height:${H}px">
    <div class="sig-face"><span class="sig-line" style="top:${LINE_Y}px;left:${INSET}px;right:${INSET}px" aria-hidden="true"></span><span class="sig-hint" aria-hidden="true">Tanda tangan di sini</span>
    <svg class="sig-ink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Pad tanda tangan kosong"></svg></div>
    <button type="button" class="sig-clear" tabindex="-1">Hapus</button><span class="sig-said" aria-live="polite"></span></div></div>`;
  const frame=host.querySelector('.sig-frame'),padEl=host.querySelector('.sig'),svg=host.querySelector('.sig-ink'),clr=host.querySelector('.sig-clear'),said=host.querySelector('.sig-said');
  let strokes=[],cut=null,signed=false,settled=false,down=false,last={x:0,y:0,t:0,w:0},later=0,fold=0,raf=0;
  const total=()=>strokes.reduce((n,s)=>n+s.length,0);
  const widths=()=>{const p=sigClamp(pen,0,100)/100;return{thin:.8+p*2,thick:2.2+p*5}};
  const local=e=>{const r=padEl.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
  const r=sigClamp(corner,0,28),inner=Math.max(0,r-10*Math.min(1,r/20));
  function paint(){
    let html='',left=cut==null?Infinity:cut;
    strokes.forEach((s,i)=>{if(left<=0)return;html+=sigPieces(s,left);left-=s.length});
    svg.innerHTML=html;
    const inked=total()>0,rew=cut!==null,live=inked&&!rew&&!signed&&!settled;
    padEl.toggleAttribute('data-inked',live);padEl.toggleAttribute('data-settled',settled||signed);padEl.toggleAttribute('data-signed',signed);
    padEl.style.width=(signed?PILL_W:W)+'px';padEl.style.height=(signed?PILL_H:H)+'px';frame.style.height=(signed?PILL_H:H)+'px';
    padEl.style.setProperty('--r',signed?PILL_H/2+'px':r+'px');padEl.style.setProperty('--inner',Math.min(14,inner)+'px');
    clr.tabIndex=live?0:-1;svg.setAttribute('aria-label',inked?'Tanda tangan':'Pad tanda tangan kosong');
  }
  function showPill(on){
    said.innerHTML=on?`<button type="button" class="sig-pill" aria-label="Tertanda. Tanda tangan ulang"><svg class="sig-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>Tertanda</button>`:'';
    if(on)said.firstChild.addEventListener('pointerdown',e=>e.stopPropagation()),said.firstChild.addEventListener('click',again);
  }
  /* si pil ditekan: tinta hilang selagi tak terlihat, kartu terbuka kembali kosong */
  function again(){strokes=[];signed=false;settled=false;showPill(false);paint();o.onReopen&&o.onReopen()}
  padEl.addEventListener('pointerdown',e=>{
    if(cut!==null||signed)return;
    try{padEl.setPointerCapture(e.pointerId)}catch(x){}
    down=true;clearTimeout(later);clearTimeout(fold);signed=false;
    /* pena kembali sebelum sempat melipat: tinta ikut kembali */
    settled=false;
    const p=local(e),{thin,thick}=widths(),w=(thin+thick)/2;
    last={x:p.x,y:p.y,t:performance.now(),w};strokes.push([{x:p.x,y:p.y,w}]);paint();
  });
  padEl.addEventListener('pointermove',e=>{
    if(!down)return;const raw=local(e),l=last;
    /* penghalusan: pena mengikuti tangan dengan jeda */
    const k=1-(sigClamp(smooth,0,100)/100)*.75,x=l.x+(raw.x-l.x)*k,y=l.y+(raw.y-l.y)*k,d=Math.hypot(x-l.x,y-l.y);
    if(d<.8)return;
    const t=performance.now(),v=d/Math.max(1,t-l.t),{thin,thick}=widths();
    /* cepat = tipis, lambat = menggenang; lebarnya sendiri juga
       diperhalus, supaya satu bingkai cepat tidak membuat takik */
    const target=thick-(thick-thin)*sigClamp(v/1.6,0,1),w=l.w+(target-l.w)*.35;
    last={x,y,t,w};strokes[strokes.length-1].push({x,y,w});paint();
  });
  const up=e=>{
    try{padEl.releasePointerCapture(e.pointerId)}catch(x){}
    if(!down)return;down=false;clearTimeout(later);clearTimeout(fold);
    fold=setTimeout(()=>{if(!down&&strokes.length){settled=true;paint()}},SOFT);
    later=setTimeout(()=>{
      /* jeda setelah goresan terakhir itulah yang disebut menandatangani:
         tinta yang melunak mengecil saat kartu melipat jadi pil */
      if(!down&&strokes.length){signed=true;showPill(true);paint();try{navigator.vibrate&&navigator.vibrate(14)}catch(x){}o.onSigned&&o.onSigned()}
    },FOLD);
  };
  padEl.addEventListener('pointerup',up);padEl.addEventListener('pointercancel',up);
  padEl.addEventListener('contextmenu',e=>e.preventDefault());
  clr.addEventListener('pointerdown',e=>e.stopPropagation());
  clr.addEventListener('click',()=>{
    const n=total();if(!n||cut!==null)return;
    clearTimeout(later);clearTimeout(fold);signed=false;settled=false;showPill(false);
    const per=2+((100-sigClamp(rewind,0,100))/100)*8,dur=sigClamp(n*per,350,2400),t0=performance.now();
    const step=t=>{const k=Math.min(1,(t-t0)/dur);cut=Math.round(n*(1-sigEase(k)));paint();if(k<1){raf=requestAnimationFrame(step);return}strokes=[];cut=null;paint()};
    raf=requestAnimationFrame(step);
  });
  paint();
  return{destroy(){clearTimeout(later);clearTimeout(fold);cancelAnimationFrame(raf)}};
}

/* ── penjaga transaksi besar ───────────────────────────── */
let SIG_PASS=false,SIGM=null,SIGT=0,SIG_N0=null,SIG_ED=null;
/* si maskot ikut senang begitu kartu selesai melipat jadi "Tertanda" */
function sigCheer(){if(!window.mascot)return;const L=['Sah! Tanda tangan diterima.','Resmi nih, sudah tertanda!','Mantap, tanda tangannya keren!','Tertanda! Tinggal dicatat.'];mascot.happy(3000,L[Math.floor(Math.random()*L.length)])}
/* cap tanda tangan — bentuknya menurut jenis transaksi, jadi sekilas terbaca:
   pengeluaran = cap pos bulat bergelombang, pemasukan = perangko bergerigi,
   transfer = oval dengan dua panah, bayar tagihan = kotak LUNAS, gestun = segi enam petir.
   Kemiringan tiap cap sedikit berbeda (diambil dari id transaksi), seperti dicap tangan. */
const SG_MON=['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
const SG_KIND={exp:'exp',inc:'inc',xfer:'xfer',pay:'pay',gcard:'gest',gin:'gest',gfee:'gest'};
function stampSVG(d,big,type,id){
  const [y,m,dd]=String(d||'').split('-'),mo=SG_MON[(+m||1)-1]||'',day=String(+dd||''),kind=SG_KIND[type]||'exp';
  const wave=(ys,x1)=>ys.map(yy=>`<path d="M0 ${yy}Q4 ${yy-3.2} 8 ${yy}T16 ${yy}T24 ${yy}${x1>24?'T32 '+yy:''}"/>`).join('');
  const T=(x,yy,fs,t,w)=>`<text x="${x}" y="${yy}" font-size="${fs}"${w?` font-weight="${w}"`:''}>${t}</text>`;
  let g='';
  if(kind==='exp')g=`<g stroke-width="1.1">${wave([4.5,9.5,14.5,19.5],32)}</g><circle cx="46" cy="14" r="12.6" stroke-width="1.4"/><circle cx="46" cy="14" r="10" stroke-width=".8"/><g fill="currentColor" stroke="none">${T(46,14.4,7.6,day,800)}${T(46,18.6,3.9,mo,700)}${T(46,22,3.1,y,700)}</g>`;
  else if(kind==='inc')g=`<g stroke-width="1.1">${wave([8,14,20],24)}</g><rect x="31" y="1.6" width="31" height="24.8" rx="1" stroke-width="2.2" stroke-dasharray="1.1 1.7"/><rect x="34" y="4.6" width="25" height="18.8" stroke-width=".8"/><g fill="currentColor" stroke="none">${T(46.5,14.2,7.6,day,800)}${T(46.5,18.6,3.9,mo,700)}${T(46.5,21.8,3.1,y,700)}</g>`;
  else if(kind==='xfer')g=`<g stroke-width="1.1" stroke-dasharray="4 2.4"><path d="M0 9H24"/><path d="M0 14H22"/><path d="M0 19H24"/></g><ellipse cx="46" cy="14" rx="17" ry="12.3" stroke-width="1.4"/><ellipse cx="46" cy="14" rx="14.5" ry="9.8" stroke-width=".8"/><g stroke-width="1.3" stroke-linejoin="round"><path d="M39 8.4h14m-3-2.6 3 2.6-3 2.6"/><path d="M53 12.4H39m3-2.6-3 2.6 3 2.6"/></g><g fill="currentColor" stroke="none">${T(46,18.4,4.6,day+' '+mo,800)}${T(46,21.4,3,y,700)}</g>`;
  else if(kind==='pay')g=`<g stroke-width="1.1">${wave([8,14,20],16)}</g><rect x="23" y="2.6" width="39" height="22.8" rx="2.2" stroke-width="1.5"/><rect x="25.4" y="5" width="34.2" height="18" rx="1" stroke-width=".7"/><g fill="currentColor" stroke="none">${T(42.5,14.6,8.6,'LUNAS',800).replace('<text','<text letter-spacing=".5"')}${T(42.5,20.4,3.8,day+' '+mo+' '+y,700)}</g>`;
  else g=`<g stroke-width="1.1" stroke-dasharray="4 2.4"><path d="M0 9H24"/><path d="M0 14H22"/><path d="M0 19H24"/></g><path d="M52.3 3.1H39.7L33.4 14l6.3 10.9h12.6L58.6 14Z" stroke-width="1.4" stroke-linejoin="round"/><path d="M50.2 5.7H41.8L37.6 14l4.2 8.3h8.4l4.2-8.3Z" stroke-width=".8" stroke-linejoin="round"/><path d="M43.9 8.4 40.4 15h2.6L41.9 19.8 46.3 12.9h-2.6Z" fill="currentColor" stroke="none"/><g fill="currentColor" stroke="none">${T(52,15.4,7.4,day,800)}${T(52,19.6,3.8,mo,700)}</g>`;
  const rot=((hsh(String(id||d)+'s')%13)-9);
  return`<span class="stamp k-${kind}${big?' big':''}" style="rotate:${rot}deg" title="Ditandatangani" role="img" aria-label="Cap tanda tangan ${esc(day+' '+mo+' '+(y||''))}"><svg viewBox="0 0 64 28" fill="none" stroke="currentColor" stroke-linecap="round" font-family="inherit" text-anchor="middle">${g}</svg></span>`;
}
const SG_ICON='<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
function sigGate(amt,redo){
  if(SIG_PASS)return false;
  if(!S.settings.sigOn||!(amt>=S.settings.sigMin))return false;
  askSign(amt,()=>{
    /* transaksi yang lahir dari tanda tangan ini diberi lencana pena (lihat commit) */
    SIG_N0=S.tx.length;SIG_ED=ui.flow&&ui.flow.mode==='edit'?ui.flow.id:null;
    sigCheer();
    SIG_PASS=true;try{redo()}finally{SIG_PASS=false;SIG_N0=null;SIG_ED=null}
  });
  return true;
}
function askSign(amt,done,demo){
  closeSign();
  const el=document.createElement('div');el.className='sigov';el.id='sigov';
  el.innerHTML=`<div class="sigdim" data-action="sigcancel"></div><div class="sigcard"><div class="sh-h"><h3>${demo?'Coba tanda tangan':'Tanda tangan'}</h3><button class="ibtn sm" data-action="sigcancel" aria-label="Batal">${IC.x}</button></div>${demo?'':`<div class="sigamt num">${money(amt)}</div>`}<div id="sigmount" class="sigmount"></div></div>`;
  document.body.appendChild(el);
  SIGM=mountSig(el.querySelector('#sigmount'),{
    /* tertanda: tahan sebentar supaya pil terbaca, lalu kartu turun dengan mulus */
    onSigned(){clearTimeout(SIGT);SIGT=setTimeout(()=>{el.classList.add('out');SIGT=setTimeout(()=>{closeSign();if(done)done();else sigCheer()},300)},1150)},
    onReopen(){clearTimeout(SIGT);el.classList.remove('out')}
  });
}
function closeSign(){clearTimeout(SIGT);if(SIGM){SIGM.destroy();SIGM=null}const e=document.getElementById('sigov');if(e)e.remove()}

function xCheer(fw,tw,amt){
  const c=MK.find(m=>m.id===S.settings.mascotChar)||MK[0],d=EYT_SHAPES[c.shape]||EYT_SHAPES.Ball,n='xc'+(mkN++);
  const base=EYT_STYLES[c.eyes]||EYT_STYLES.Slant,sc=c.eyeScale||1.4,w=base.w*sc,h=base.h*sc,g=EYT_GAP*Math.max(1,sc*.8)*EYT_R;
  const defs=c.grad?`<linearGradient id="${n}" x1="0" y1="0" x2="1" y2="1">${c.grad.map((col,i)=>`<stop offset="${Math.round(i/(c.grad.length-1)*100)}%" stop-color="${col}"/>`).join('')}</linearGradient>`:'';
  const hap=x=>`<path d="M${(x-w*.58).toFixed(1)} ${(50+h*.16).toFixed(1)} Q${x} ${(50-h*.4).toFixed(1)} ${(x+w*.58).toFixed(1)} ${(50+h*.16).toFixed(1)}" fill="none" stroke="${c.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const fc=walCol(fw),tc=walCol(tw),bar=(x,col,cls)=>`<g class="${cls}"><rect x="${x}" y="42" width="14" height="64" rx="7" fill="${col}" style="filter:drop-shadow(0 0 8px ${col})"/></g>`;
  const el=document.createElement('div');el.className='xch';el.setAttribute('role','status');
  el.innerHTML=`<div class="xch-in"><svg class="mkv" viewBox="0 0 176 132" aria-hidden="true"><defs>${defs}</defs>
    <g class="mk"><g transform="translate(48 34) scale(.8)"><path d="${d}" fill="${c.grad?`url(#${n})`:c.fill}"/>${hap(50-g)}${hap(50+g)}</g>
    ${bar(28,fc,'bl')}${bar(134,tc,'br')}</svg>
    <b class="xch-h">Transfer berhasil!</b><div class="xch-a num">${money(amt)}</div>
    <div class="xch-c"><div class="xch-k"><span><small>Dari</small><b>${esc(wLbl(fw))}</b></span>${accIcon(fw,22)}</div>
    <i class="xch-ar" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m0 0 6-6m-6 6-6-6"/></svg></i>
    <div class="xch-k"><span><small>Ke</small><b>${esc(wLbl(tw))}</b></span>${accIcon(tw,22)}</div></div>
    <i class="xch-t" aria-hidden="true"></i></div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.classList.add('out'),2300);setTimeout(()=>el.remove(),2800);
}
const subT=()=>{const o=ui.form&&ui.form.id?S.cats.find(x=>x.id===ui.form.id):null;return o?o.t:(($('#panel [name=t]')||{}).value||'exp')};
/* samakan titik warna + latar ikon baris sub dengan pilihannya (atau warna kategori bila kosong) */
function subSync(r){const b=r.querySelector('.sub-cb'),f=($('#panel [name=color]')||{}).value,o=ui.form&&ui.form.id?S.cats.find(x=>x.id===ui.form.id):null,
  base=hexOk(f)?f:(o?catHex(o):'#A8F552'),hx=hexOk(b.dataset.hex)?b.dataset.hex:'',v=stkVars({t:subT(),color:hx||base});
  b.style.setProperty('--c',hx||base);r.style.setProperty('--sbg',v[0]);r.style.setProperty('--srg',v[1])}
function xPanel(i){
  const X=ui.xfer,payer=X.up?1:0,all=S.wallets.filter(w=>canXfer(w)||X.slots.includes(w.id));
  const gs=S.groups.filter(g=>all.some(w=>w.g===g.id));
  if(!gs.some(g=>g.id===X.gf))X.gf=gs.length?gs[0].id:null;
  const rows=all.filter(w=>gs.length<2||w.g===X.gf).map(w=>`<button type="button" class="xs-row" data-action="x-pick" data-id="${w.id}">${accIcon(w,28)}<span class="xs-rn">${esc(wLbl(w))}</span><span class="xs-rb num">${money(D.bal[w.id]||0)}</span>${X.slots[i]===w.id?'<svg class="xs-ok" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>':''}</button>`).join('');
  const chips=gs.length>1?`<div class="xs-gs" role="tablist">${gs.map(g=>`<button type="button" class="xs-g${g.id===X.gf?' on':''}" role="tab" aria-selected="${g.id===X.gf}" data-action="x-grp" data-arg="${g.id}">${esc(g.name)}</button>`).join('')}</div>`:'';
  document.getElementById('xsp'+i).innerHTML=`<div class="xs-ph"><span>${i===payer?'Dari':'Ke'}</span><button type="button" class="xs-x" data-action="x-close" aria-label="Tutup">✕</button></div>${chips}<div class="xs-list">${rows}</div>`;
}
const A={
  psopen:el=>psOpen(el),ppclose:()=>ppClose(),pspick:el=>psPick(el),
  sigtoggle(){S.settings.sigOn=!S.settings.sigOn;persist();render()},
  sigpre(el,arg){S.settings.sigMin=+arg;persist();render()},
  sigdemo(){askSign(S.settings.sigMin,null,true)},
  sigcancel(){closeSign()},
  nav(el,arg){const ch=ui.view!==arg;ui.view=arg;ui.mgSort=false;if(arg==='home')ui.bwSeen={};if(arg==='an')ui.anDrawn='';if(ui.sheet)closeSheet();render();window.scrollTo(0,0);if(ch&&!RM()){const v=$('#view');v.classList.remove('vin');void v.offsetWidth;v.classList.add('vin');clearTimeout(v._t);v._t=setTimeout(()=>v.classList.remove('vin'),360)}},
  'sync-tap'(){if(gdAuto())gdLogin();else if(S.settings.gd.cid)toast('Aktifkan cadangan Drive di Atur');else{ui.view='set';render();window.scrollTo(0,0)}},
  'gd-login'(){gdLogin()},
  'gd-now'(){GD.act='now';setSync('gdsave');gdUpload(true).then(()=>{setSync('gdok');gdClear();render();toast('Tercadangkan ke Drive')}).catch(e=>{gdFail(e);toast(e.message);render()})},
  'gd-restore-btn'(el){if(!confirmTap(el,'gdr')){toast('Ketuk lagi untuk memulihkan: data di HP akan diganti');return}gdRestore()},
  'gd-restore'(el){if(!confirmTap(el,'gdr2')){toast('Ketuk lagi untuk memulihkan: data di HP akan diganti');return}gdRestore()},
  'gd-skip'(){GD.newer=false;render()},
  'gd-off'(){S.settings.gd.on=false;clearTimeout(GD.t);persist();setSync('local');render();toast('Cadangan Drive dimatikan')},
  'bk-file'(){bkFile();render()},
  'bk-snooze'(){S.settings.bkSnooze=Date.now()+3*864e5;persist();render()},
  csv(){csvExport()},
  'gestun-tog'(){S.settings.gestun=!gestOn();if(!S.settings.gestun&&ui.mutF==='gest')ui.mutF='all';persist();render();if(ui.sheet)renderSheet()},
  privacy(){S.settings.privacy=!S.settings.privacy;persist();render();if(ui.sheet)renderSheet()},
  range(el,arg){ui.range=+arg;render()},
  arange(el,arg){ui.arange=+arg;render()},
  tg(el,arg,id){S.settings.collapsed[id]=!S.settings.collapsed[id];persist();const n=document.getElementById('wg-'+id);if(n){const o=!S.settings.collapsed[id];n.classList.toggle('open',o);n.querySelector('.wg-h').setAttribute('aria-expanded',o);const c=n.querySelector('.chev');if(c)c.classList.toggle('o',o);const any=S.groups.some(g=>!S.settings.collapsed[g.id]);document.querySelectorAll('[data-action="tgall"]').forEach(b=>b.textContent=any?'Tutup semua':'Buka semua')}else render()},
  tgall(el){const any=S.groups.some(g=>!S.settings.collapsed[g.id]);S.groups.forEach(g=>{S.settings.collapsed[g.id]=any;const n=document.getElementById('wg-'+g.id);if(n){n.classList.toggle('open',!any);const c=n.querySelector('.chev');if(c)c.classList.toggle('o',!any)}});persist();if(el)el.textContent=any?'Buka semua':'Tutup semua'},
  tgc(el,arg,id){
    S.settings.anCollapsed[id]=!S.settings.anCollapsed[id];const open=!S.settings.anCollapsed[id],g=el.closest('.grp');
    if(g){g.classList.toggle('open',open);el.setAttribute('aria-expanded',open);const c=el.querySelector('.chev');if(c)c.classList.toggle('o',open)}
    persist();anAllLabel();
  },
  tgcall(){
    const gs=[...document.querySelectorAll('.grp[data-ck]')],any=gs.some(g=>g.classList.contains('open'));
    gs.forEach(g=>{const k=g.dataset.ck;S.settings.anCollapsed[k]=any;g.classList.toggle('open',!any);const b=g.querySelector('.cat-h');if(b)b.setAttribute('aria-expanded',!any);const c=g.querySelector('.chev');if(c)c.classList.toggle('o',!any)});
    persist();anAllLabel();
  },
  anprev(){const a=ui.an;a.m--;if(a.m<0){a.m=11;a.y--}ui.anSel='';render()},
  annext(){const a=ui.an;a.m++;if(a.m>11){a.m=0;a.y++}ui.anSel='';render()},
  cttype(el,arg){ui.ct=arg;render()},
  antype(el,arg){
    if(ui.an.type===arg)return;const g=el.closest('.seg2'),go=()=>{ui.an.type=arg;ui.anSel='';render()};
    if(!g||RM())return go();
    g.classList.toggle('r',arg==='inc');g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===arg));
    clearTimeout(ui._antm);ui._antm=setTimeout(go,240);
  },
  ansel(el,arg){ui.anSel=ui.anSel===arg?'':arg;anSelSync()},
  mutmore(){ui.mutN+=40;render()},
  mutf(el,arg){ui.mutF=arg;ui.mutN=40;ui.mutDay={};render()},
  mutcal(el,arg){ui.mutSel=ui.mutSel===arg?'':arg;calSync()},
  calfull(){
    const old=$('.mcal'),b=$('#mutBody');ui.calFull=!ui.calFull;
    if(!old||!b||RM())return b?b.innerHTML=mutBody():0;
    const h0=old.offsetHeight,tmp=document.createElement('div');tmp.innerHTML=mutBody();const neu=tmp.querySelector('.mcal');
    old.style.transition='none';old.style.height='';old.style.overflow='hidden';
    old.className=neu.className+' cm-swap';old.innerHTML=neu.innerHTML;
    const h1=old.offsetHeight;old.style.height=h0+'px';void old.offsetHeight;
    old.style.transition=h1<h0?'height .4s var(--emph)':'height .5s var(--spring)';old.style.height=h1+'px';
    clearTimeout(old._t);old._t=setTimeout(()=>{old.style.transition=old.style.height=old.style.overflow='';old.classList.remove('cm-swap')},560);
  },
  mutcalx(){ui.mutSel='';calSync()},
  'cal-tog'(){S.settings.calendar=!calOn();ui.mutSel='';persist();render();if(ui.sheet)renderSheet()},
  mutday(el,arg){const m=el.closest('.md');if(!m)return;const o=!m.classList.contains('open');m.classList.toggle('open',o);el.setAttribute('aria-expanded',o);const c=el.querySelector('.chev');if(c)c.classList.toggle('o',o);ui.mutDay[arg]=o},
  mutm(el,arg){
    const old=mutMonth();if(old===arg)return;
    const tb0=$('#mtabs'),sl=tb0?tb0.scrollLeft:0;
    ui.mutM=arg;ui.mutSel='';render();
    const tb=$('#mtabs'),a=tb&&tb.querySelector('.mm.on'),bd=$('#mutBody');
    if(tb&&a){const to=tb.scrollLeft;tb.scrollLeft=sl;tb.scrollTo({left:to,behavior:'smooth'})}
    if(bd){bd.classList.add(arg>old?'sl-in-r':'sl-in-l');setTimeout(()=>bd.classList.remove('sl-in-r','sl-in-l'),500)}
  },
  muts(){ui.mutS=!ui.mutS;if(!ui.mutS)ui.mutQ='';render();if(ui.mutS){const i=$('#mutq');if(i)i.focus()}},
  mgtab(el,arg){ui.mg=arg;ui.mgSort=false;render()},
  mgsort(){ui.mgSort=!ui.mgSort;render()},
  mvup(el,arg,id){mvItem(arg,id,-1)},
  mvdn(el,arg,id){mvItem(arg,id,1)},
  'sheet-close'(){closeSheet()},
  'open-new'(){openNew()},
  'fab'(){toggleFab()},
  'fab-go'(el,arg){toggleFab(false);if(arg==='xfer')A['open-xfer'](null,null,undefined);else openNew({type:arg})},
  'open-acc'(el,arg,id){const w=S.wallets.find(x=>x.id===id);if(w&&!canTrx(w)){A['open-xfer'](null,null,id);return}openNew({acc:id})},
  'open-accd'(el,arg,id){ui.accd={id};ui.sheet='accd';renderSheet()},
  'wl-sel'(el,arg,id){ui.wlSel=ui.wlSel===id?'':id;applyWl();
    const c=ui.wlSel&&S.cards.find(x=>x.id===ui.wlSel);
    if(c&&c.bg){const t=(c.net==='mc'?'Mastercard':'Visa')+' •• '+(c.last4||'0000');
      if(window.mascot&&S.settings.mascot!=='off')mascot.say(t);else toast(t)}},
  'wl-pick'(el,arg,id){if(S.settings.cardView==='car'&&window.carGo&&$('#car')){carGo(id);return}if(S.settings.cardView==='col'&&window.colGo&&$('#col')){colGo(id);return}if(S.settings.cardView==='stack'){cswFront(id);return}ui.wlSel=id;applyWl()},
  pwainst(){if(!PWA_EV)return;const e=PWA_EV;e.prompt();e.userChoice.then(r=>{PWA_EV=null;if(r&&r.outcome==='accepted')toast('Memasang aplikasi…');render()}).catch(()=>{})},
  stkstyle(el,arg){S.settings.stk=arg==='badge'?'badge':'bg';persist();render()},
  cardview(el,arg){S.settings.cardView=['stack','col','car'].includes(arg)?arg:'wallet';ui.wlSel='';persist();render()},
  'wl-mode'(){S.settings.wlMode=S.settings.wlMode==='debt'?'remain':'debt';persist();render()},
  'mk-sheet'(){openKoleksi()},
  'mk-open'(){
    if(!ui.mk||ui.mk.phase!=='idle')return;
    const res=mkOpen();if(!res)return toast('Belum ada bungkus');
    ui.mk={phase:'tearing',res};renderSheet();mkTop();
    setTimeout(()=>{if(ui.sheet==='koleksi'&&ui.mk){ui.mk.phase='reveal';renderSheet();mkTop();if(window.mascot)mascot.happy(900)}},1500);
  },
  'mk-done'(){ui.mk={phase:'idle'};renderSheet();mkTop()},
  'mk-use'(el,arg,id){
    if(!S.settings.owned.includes(id))return;
    S.settings.mascotChar=id;persist();applyMascot();
    if(ui.mk)ui.mk={phase:'idle'};renderSheet();mkTop();
    const c=MK.find(x=>x.id===id);if(window.mascot&&c)mascot.happy(1600,'Halo, aku '+c.name+'!');
  },
  mascotset(el,arg){S.settings.mascot=arg;persist();applyMascot();render()},
  wlcolor(el,arg){S.settings.wl=arg;persist();render()},
  'open-xfer'(el,arg,id){if(S.wallets.filter(canXfer).length<2)return toast(S.wallets.length<2?'Butuh minimal 2 dompet':'Butuh minimal 2 dompet yang boleh transfer');openXfer(id)},
  qpay(){if(!S.cards.length)return toast('Belum ada kartu kredit');openPay(S.cards[0].id)},
  qgest(){if(!gestOn())return toast('Menu Gestun nonaktif. Aktifkan di Atur');if(!S.cards.length)return toast('Belum ada kartu kredit');openGest(S.cards[0].id)},
  swipe(el,arg,id){openNew({acc:id})},
  ftype(el,arg){const f=ui.flow,from=f.type;f.type=arg;f.cat='';f.sub='';f.openCat='';if(arg==='inc'&&isCard(f.acc))f.acc='';renderSheet();if(from!==arg)vtabPlay(from,arg)},
  facc(el,arg,id){const f=ui.flow;f.acc=id;if(f.ret){f.step=f.ret;f.ret=0}else f.step=2;renderSheet()},
  fcat(el,arg,id){
    const f=ui.flow,c=S.cats.find(x=>x.id===id);if(!c)return;
    if(c.subs.length)f.openCat=id;else{f.cat=id;f.sub='';f.openCat='';goNext()}
    renderSheet();
  },
  fsub(el,arg){const f=ui.flow;f.cat=f.openCat||f.cat;f.sub=arg||'';f.openCat='';goNext();renderSheet()},
  fsubclose(){ui.flow.openCat='';renderSheet()},
  fback(){const f=ui.flow;if(f.ret){f.step=f.ret;f.ret=0}else f.step=Math.max(1,f.step-1);f.openCat='';renderSheet()},
  fjump(el,arg){const f=ui.flow;f.ret=3;f.step=+arg;renderSheet()},
  key(el,arg){pressKey(ui.amt,arg);updateAmt()},
  fsave(){
    const f=ui.flow,amt=amtVal();
    if(!(amt>0))return toast('Isi nominal dulu');
    if(!f.acc){f.step=1;renderSheet();return toast('Pilih dompet atau kartu')}
    if(!f.cat){f.step=2;renderSheet();return toast('Pilih kategori')}
    const d=f.date||today(),note=f.note.trim(),edit=f.mode==='edit';
    {const oldT=edit?S.tx.find(x=>x.id===f.id):null;if((!edit||(oldT&&oldT.amt!==amt))&&sigGate(amt,()=>A.fsave()))return}
    if(edit){const t=S.tx.find(x=>x.id===f.id);if(t)Object.assign(t,{d,acc:f.acc,cat:f.cat,sub:f.sub,note,amt})}
    else{S.tx.push({id:uid(),d,t:f.type,acc:f.acc,cat:f.cat,sub:f.sub,note,amt});
      if(f.rep)S.recur.push({id:uid(),t:f.type,acc:f.acc,cat:f.cat,sub:f.sub,amt,day:+d.slice(8),note,last:d.slice(0,7)})}
    const gotInc=!edit&&f.type==='inc';
    if(!edit)S.settings.pack.added++;
    closeSheet();commit(edit?'Transaksi diperbarui':'Tersimpan');
    if(gotInc&&window.mascot){const L=['Yeay, ada pemasukan!','Mantap, kantong makin gemuk!','Asyik, nambah nih!'];mascot.happy(2800,L[Math.floor(Math.random()*L.length)])}
  },
  'tx-open'(el,arg,id){openEdit(id)},
  'tx-del'(el,arg,id){
    if(!confirmTap(el,'tx'+id))return;
    const t=S.tx.find(x=>x.id===id);if(!t)return;
    S.tx=S.tx.filter(x=>t.link?x.link!==t.link:x.id!==id);closeSheet();commit('Transaksi dihapus');
  },
  'open-pay'(el,arg,id){openPay(id)},
  'p-card'(el,arg,id){ui.pay.card=id;const lw=cardWallet(S.cards.find(x=>x.id===id));if(lw)ui.pay.from=lw;renderSheet()},
  'p-from'(el,arg,id){ui.pay.from=id;renderSheet()},
  'q-amt'(el,arg){ui.amt.expr=String(+arg||'');updateAmt()},
  'q-all'(){const v=Math.max(0,Math.round(D.bal[ui.xfer.from]||0));ui.amt.expr=v?String(v):'';updateAmt()},
  'p-full'(){const v=Math.max(0,D.debt[ui.pay.card]||0);ui.amt.expr=v?String(v):'';updateAmt()},
  'p-min'(){const c=S.cards.find(x=>x.id===ui.pay.card),mp=c&&c.minPct!=null?c.minPct:10,v=Math.round(Math.max(0,D.debt[ui.pay.card]||0)*mp/100/1000)*1000;ui.amt.expr=v?String(v):'';updateAmt()},
  'p-save'(){
    const P=ui.pay,amt=amtVal();if(!(amt>0))return toast('Isi nominal dulu');{const lw=cardWallet(S.cards.find(x=>x.id===P.card));if(lw)P.from=lw}if(!P.from)return toast('Pilih dompet');
    if(sigGate(amt,()=>A['p-save']()))return;
    S.tx.push({id:uid(),d:P.date||today(),t:'pay',acc:P.from,to:P.card,amt,cat:'',sub:'',note:'Bayar tagihan'});
    closeSheet();commit('Pembayaran tersimpan');
  },
  'x-flip'(){
    const X=ui.xfer,xs=document.getElementById('xs');if(!X||X.pick!==null)return;
    X.up=!X.up;X.turns++;xSync();
    const ar=document.getElementById('xsArrow');if(ar)ar.style.transform='rotate('+(X.turns*180)+'deg)';
    if(xs){xs.classList.add('swp');setTimeout(()=>{xFaces();xs.classList.remove('swp')},140)}else xFaces();
    updateAmt();
  },
  'x-open'(el,arg){
    const X=ui.xfer,xs=document.getElementById('xs'),i=+arg;if(!X||!xs||X.pick!==null)return;
    X.pick=i;const cur=S.wallets.find(w=>w.id===X.slots[i]);X.gf=cur?cur.g:null;
    xPanel(i);
    xs.classList.add('pk');
    xs.querySelectorAll('.xs-c').forEach(c=>c.classList.add(+c.dataset.i===i?'on':'sq'));
  },
  'x-grp'(el,arg){const X=ui.xfer;if(!X||X.pick===null)return;X.gf=arg;xPanel(X.pick)},
  'x-close'(){xClose()},
  'x-pick'(el,arg,id){
    const X=ui.xfer;if(!X||X.pick===null)return;
    const slot=X.pick,other=1-slot;
    if(X.slots[other]===id)X.slots[other]=X.slots[slot];
    X.slots[slot]=id;xSync();xFaces();xClose();updateAmt();
  },
  'x-save'(){
    const X=ui.xfer,amt=amtVal();if(!(amt>0))return toast('Isi nominal dulu');
    xSync();if(!X.from||!X.to||X.from===X.to)return toast('Pilih dompet asal dan tujuan yang berbeda');
    if(sigGate(amt,()=>A['x-save']()))return;
    S.tx.push({id:uid(),d:X.date||today(),t:'xfer',acc:X.from,to:X.to,amt,cat:'',sub:'',note:X.note.trim()});
    const fw=S.wallets.find(w=>w.id===X.from),tw=S.wallets.find(w=>w.id===X.to);
    closeSheet();commit(window.mascot&&S.settings.mascot!=='off'?'':'Transfer tersimpan');
    if(window.mascot&&S.settings.mascot!=='off'){
      mascot.happy(2500,'Beres!');
      if(fw&&tw)xCheer(fw,tw,amt);
    }
  },
  'open-gest'(el,arg,id){openGest(id)},
  'g-card'(el,arg,id){ui.gest.card=id;const lw=cardWallet(S.cards.find(x=>x.id===id));if(lw)ui.gest.wallet=lw;renderSheet()},
  'g-wallet'(el,arg,id){ui.gest.wallet=id;renderSheet()},
  'g-mode'(el,arg){ui.gest.feeMode=arg;renderSheet()},
  'g-scheme'(el,arg){ui.gest.scheme=arg;renderSheet()},
  'g-save'(){
    const G=ui.gest,r=gestCalc();
    if(!(r.nom>0))return toast('Isi nominal dulu');
    if(r.fee<0||r.inAmt<=0)return toast('Fee tidak valid');
    {const lw=cardWallet(S.cards.find(x=>x.id===G.card));if(lw)G.wallet=lw}
    if(!G.wallet)return toast('Pilih dompet tujuan');
    if(sigGate(r.nom,()=>A['g-save']()))return;
    gestunTx(G.date||today(),G.card,G.wallet,r.nom,r.fee,G.scheme,'').forEach(x=>S.tx.push(x));
    closeSheet();commit('Gestun tersimpan');
  },
  fnew(el,arg){openForm(arg)},
  frep(){ui.flow.rep=!ui.flow.rep;renderSheet()},
  fedit(el,arg,id){openForm(arg,id)},
  fsaveform(){saveForm()},
  fdelform(el){deleteForm(el)},
  ctheme(el,arg){const h=$('#panel [name=theme]');if(h)h.value=arg;el.parentElement.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b===el));updateCardPrev()},
  xptog(el){ui.cdSub=!ui.cdSub;el.classList.toggle('open',ui.cdSub);el.setAttribute('aria-expanded',ui.cdSub);const b=el.nextElementSibling;if(b)b.classList.toggle('open',ui.cdSub)},
  hptog(el){const r=el.closest('.hp'),o=r.classList.toggle('open');el.setAttribute('aria-expanded',o)},
  hpcopy(el){const hex=el.closest('.hp').dataset.hex;try{navigator.clipboard.writeText(hex).then(()=>toast('Kode '+hex+' disalin'),()=>toast('Salin manual: '+hex))}catch(e){toast('Salin manual: '+hex)}},
  pcol(el,arg){hpSet(el.closest('.hp'),arg)},
  kureset(el){const r=el.closest('.ku');kuSet(r,+r.dataset.f0,false)},
  subadd(){const ed=$('#subEd');if(!ed)return;const o=ui.form&&ui.form.id?S.cats.find(x=>x.id===ui.form.id):null;const ic=($('#panel [name=icon]')||{}).value||(o&&o.icon)||'📦';const fc=($('#panel [name=color]')||{}).value;ed.insertAdjacentHTML('beforeend',subRow({icon:ic.trim()||'📦',si:{},t:subT(),color:hexOk(fc)?fc:(o&&o.color)||undefined,col:o?o.col:undefined,id:o?o.id:'x'},'',''));const n=ed.lastElementChild.querySelector('.sub-nm');n&&n.focus()},
  subdel(el){const r=el.closest('.sub-row');if(r){const n=r.nextElementSibling;if(n&&n.classList.contains('sub-pal'))n.remove();r.remove()}},
  subcol(el){const r=el.closest('.sub-row'),n=r.nextElementSibling,open=n&&n.classList.contains('sub-pal');
    document.querySelectorAll('#subEd .sub-pal').forEach(x=>{const b=x.previousElementSibling&&x.previousElementSibling.querySelector('.sub-cb');if(b)b.setAttribute('aria-expanded','false');x.remove()});
    if(open)return;r.insertAdjacentHTML('afterend',subPal(el.dataset.hex));el.setAttribute('aria-expanded','true')},
  subpick(el,arg){const pal=el.closest('.sub-pal'),r=pal&&pal.previousElementSibling;if(!r)return;
    const b=r.querySelector('.sub-cb');b.dataset.hex=arg||'';b.classList.toggle('set',!!arg);b.setAttribute('aria-expanded','false');subSync(r);pal.remove()},
  ccol(el,arg){const h=$('#panel [name=col]');if(h)h.value=arg;el.parentElement.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b===el));updateCatPrev()},
  rmbg(){ui.form.bg=null;const f=$('#f_bgfile');if(f)f.value='';updateCardPrev()},
  lup(el,arg,id){const L=S.settings.layout,i=L.findIndex(b=>b.id===id);if(i>0){[L[i-1],L[i]]=[L[i],L[i-1]];persist();render()}},
  ldown(el,arg,id){const L=S.settings.layout,i=L.findIndex(b=>b.id===id);if(i>=0&&i<L.length-1){[L[i+1],L[i]]=[L[i],L[i+1]];persist();render()}},
  lon(el,arg,id){const b=S.settings.layout.find(x=>x.id===id);if(b){b.on=!b.on;persist();render()}},
  'bk-export'(){ui.backup={mode:'export'};ui.sheet='backup';renderSheet()},
  'bk-import'(){ui.backup={mode:'import'};ui.sheet='backup';renderSheet()},
  'bk-copy'(){
    const ta=$('#bk_text');ta.select();
    const ok=()=>toast('Tersalin'),fail=()=>{try{document.execCommand('copy')?ok():toast('Pilih teks lalu salin manual')}catch(e){toast('Pilih teks lalu salin manual')}};
    try{navigator.clipboard.writeText(ta.value).then(ok,fail)}catch(e){fail()}
  },
  'bk-apply'(el){
    if(!confirmTap(el,'bkapply'))return;
    try{
      const o=JSON.parse($('#bk_text').value);
      if(!o||!Array.isArray(o.wallets)||!Array.isArray(o.tx)||!Array.isArray(o.cats))throw new Error('format');
      S=normalize(o);closeSheet();commit('Data diimpor');
    }catch(e){toast('JSON tidak valid')}
  },
  sample(el){if(!confirmTap(el,'sample'))return;const old=S.settings.privacy;S=makeSample();S.settings.privacy=old;closeSheet();commit('Data contoh dimuat')},
  wipe(el){
    if(!confirmTap(el,'wipe'))return;
    S=normalize({settings:{privacy:S.settings.privacy},groups:[{id:uid(),name:'Kas & Bank'}],wallets:[],pools:[],cards:[],cats:defaultCats(),tx:[]});
    closeSheet();commit('Semua data dihapus');
  }
};
(function(){let t=null,fired=false;
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button[data-arg="bs"]');if(!b)return;fired=false;t=setTimeout(()=>{fired=true;pressKey(ui.amt,'c');updateAmt()},550)});
  const off=()=>{clearTimeout(t)};['pointerup','pointercancel','pointerleave'].forEach(n=>document.addEventListener(n,off,true));
  document.addEventListener('click',e=>{if(fired&&e.target.closest&&e.target.closest('button[data-arg="bs"]')){e.stopImmediatePropagation();e.preventDefault();fired=false}},true);
})();
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');if(!el)return;
  const fn=A[el.dataset.action];if(fn)fn(el,el.dataset.arg,el.dataset.id);
});
function onInput(e){
  const el=e.target,h=el.dataset&&el.dataset.input;if(!h)return;
  if(h==='hphex'){const v=parseColor(el.value),root=el.closest('.hp');if(v){hpSet(root,v,'hex');if(e.type==='change')el.value=v}else if(e.type==='change')el.value=root.dataset.hex}
  else if(h==='pusel'){const n=$('#f_pun');if(n){n.hidden=el.value!=='__new';if(!n.hidden)n.focus()}}
  else if(h==='money'){const n=num(el.value);el.value=n?nf.format(n):''}
  else if(h==='mutq'){ui.mutQ=el.value;ui.mutDay={};const b=$('#mutBody');if(b)b.innerHTML=mutBody()}
  else if(h==='sigmin'){const n=num(el.value);el.value=n?nf.format(n):'';if(n>0){S.settings.sigMin=n;persist();document.querySelectorAll('.sigpre button').forEach(b=>b.classList.toggle('on',+b.dataset.arg===n))}}
  else if(h==='fnote')ui.flow.note=el.value;
  else if(h==='fdate')ui.flow.date=el.value;
  else if(h==='p-date')ui.pay.date=el.value;
  else if(h==='x-date')ui.xfer.date=el.value;
  else if(h==='x-note')ui.xfer.note=el.value;
  else if(h==='g-fee'){ui.gest.feeVal=el.value;updateGest()}
  else if(h==='g-date')ui.gest.date=el.value;
  else if(h==='cprev')updateCardPrev();
  else if(h==='catprev')updateCatPrev();
  else if(h==='pickcol'){const v=el.value,hd=$('#panel [name=color]');if(hd)hd.value=v;const pk=el.closest('.sw-pick');pk.style.setProperty('--pc',v);pk.parentElement.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b===pk))}
  else if(h==='bgfile'&&e.type==='change'&&el.files&&el.files[0])loadImage(el.files[0]);
  else if(h==='bk-file'&&e.type==='change'&&el.files&&el.files[0]){const r=new FileReader();r.onload=()=>{$('#bk_text').value=String(r.result)};r.readAsText(el.files[0])}
}
document.addEventListener('input',onInput);
document.addEventListener('change',onInput);
/* tombol + menyingkir saat scroll turun, muncul lagi saat scroll naik */
{let ly=0;window.addEventListener('scroll',()=>{const y=window.scrollY,dk=document.getElementById('dock');if(!dk)return;const dy=y-ly;
  if(y<8||dy<-6)dk.classList.remove('fab-away');else if(dy>6&&y>60)dk.classList.add('fab-away');ly=y},{passive:true})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.getElementById('dock')&&document.getElementById('dock').classList.contains('fab-open'))toggleFab(false);else if($('#pp'))ppClose();else if(ui.sheet)closeSheet()}});
let rzT=0;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(ui.view==='home')drawChart();if(ui.view==='an')drawAn();if(ui.view==='manage'&&ui.mg==='wallet')drawPareto()},150)});

/* ============ mulai ============ */
(function boot(){
  let loaded=null;
  try{const raw=safeStorage.get(LS_KEY);if(raw)loaded=JSON.parse(raw)}catch(e){}
  S=normalize(loaded&&Array.isArray(loaded.wallets)?loaded:makeSample());
  recalc();if(runRecur())persist();
  const back=gdHandleReturn();
  render();setSync('local');initRemote();
  if(back)gdAfterReturn(back);else gdBoot();
})();

/* tahan lama pada batang Total saldo -> info persen & uang */
(function(){let T=null,tip=null,bar=null,tm=null;
  const hide=()=>{clearTimeout(tm);tm=null;if(tip){tip.remove();tip=null}if(bar){bar.classList.remove('lp');bar.querySelectorAll('.hot').forEach(i=>i.classList.remove('hot'));bar=null}T=null};
  const show=seg=>{if(tip)tip.remove();bar=seg.parentElement;bar.classList.add('lp');bar.querySelectorAll('.hot').forEach(i=>i.classList.remove('hot'));seg.classList.add('hot');
    tip=document.createElement('div');tip.className='seg-tip';tip.innerHTML='<small></small><b></b>';
    tip.firstChild.textContent=seg.dataset.n;tip.lastChild.textContent=seg.dataset.v;const em=document.createElement('em');em.textContent=seg.dataset.p;tip.lastChild.appendChild(em);document.body.appendChild(tip);
    const r=seg.getBoundingClientRect(),w=tip.offsetWidth,cx=Math.max(w/2+10,Math.min(innerWidth-w/2-10,r.left+r.width/2));tip.style.left=cx+'px';tip.style.top=(r.top-8)+'px'};
  document.addEventListener('pointerdown',e=>{const sg=e.target.closest&&e.target.closest('.ws3-bar i');if(!sg)return;T={x:e.clientX,y:e.clientY};clearTimeout(tm);tm=setTimeout(()=>{show(sg);try{navigator.vibrate&&navigator.vibrate(12)}catch(x){}},320)});
  document.addEventListener('pointermove',e=>{if(!T)return;if(tip){const el=document.elementFromPoint(e.clientX,e.clientY);const sg=el&&el.closest&&el.closest('.ws3-bar i');if(sg&&!sg.classList.contains('hot'))show(sg)}else if(Math.abs(e.clientX-T.x)>10||Math.abs(e.clientY-T.y)>10){clearTimeout(tm);T=null}});
  ['pointerup','pointercancel','scroll'].forEach(n=>addEventListener(n,hide,true));
  document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.ws3-bar'))e.preventDefault()});
})();
/* ganti hari: kalau halaman dibiarkan terbuka melewati tengah malam, tampilan (kalender 7 hari, label Hari ini) ikut maju */
{let day=today();const tick=()=>{const t=today();if(t===day)return;day=t;if(!ui.sheet){recalc();if(runRecur())persist();render()}};
  setInterval(tick,30000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tick()})}
/* pembaruan otomatis: saat dibuka (atau kembali ke aplikasi), cek versi terbaru di server (index.html, app.css, app.js); kalau beda, muat ulang.
   Hanya menyimpan sidik jari versi di kunci 'catu.ver'; data keuangan ('kantong.v1') tidak disentuh. */
(function(){
  if(!/^https?:$/.test(location.protocol))return;
  let busy=false,lastCheck=0;
  const hash=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return String(h>>>0)};
  async function check(){
    if(busy||Date.now()-lastCheck<30000)return;busy=true;lastCheck=Date.now();
    try{
      /* sidik jari = index.html + app.css + app.js. app.css/app.js diambil dengan cache:'reload' (tanpa query)
         supaya salinan di cache HTTP browser ikut diperbarui sebelum halaman dimuat ulang. */
      const rs=await Promise.all([
        fetch(location.pathname+'?_='+Date.now(),{cache:'no-store'}),
        fetch(new URL('app.css',location.href),{cache:'reload'}),
        fetch(new URL('app.js',location.href),{cache:'reload'})]);
      if(!rs.every(r=>r.ok))return;
      const h=hash((await Promise.all(rs.map(r=>r.text()))).join('\u0000'));let old=null;
      try{old=localStorage.getItem('catu.ver')}catch(e){}
      try{localStorage.setItem('catu.ver',h)}catch(e){}
      if(old&&old!==h&&!(typeof ui!=='undefined'&&ui.sheet)){
        const u=new URL(location.href);u.searchParams.set('v',h);location.replace(u.toString());
      }
    }catch(e){}finally{busy=false}
  }
  check();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();

/* ---- pasang sebagai aplikasi layar penuh (PWA) ---- */
let PWA_EV=null;
const pwaMode=()=>{try{return matchMedia('(display-mode: fullscreen)').matches?'layar penuh':(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)?'standalone':matchMedia('(display-mode: minimal-ui)').matches?'minimal-ui':'browser'}catch(e){return'browser'}};
const pwaApp=()=>{try{return matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();PWA_EV=e;if(ui.view==='set')render()});
window.addEventListener('appinstalled',()=>{PWA_EV=null;toast('Aplikasi terpasang');if(ui.view==='set')render()});
function pwaRow(){
  const ok=pwaApp(),inner=ok?`<span class="pwa-ok">Sedang berjalan sebagai aplikasi</span><small class="pwa-h" style="margin-top:4px">Mode tampilan: <b>${pwaMode()}</b>${pwaMode()==='layar penuh'?' (bilah status disembunyikan; hapus lalu pasang ulang aplikasi untuk memakai manifest terbaru)':''}</small>`
    :PWA_EV?`<button class="pbtn" data-action="pwainst">Pasang aplikasi</button>`
    :`<small class="pwa-h">Di Chrome: menu ⋮ → <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</small>`;
  return`<div class="setrow" style="display:block"><div><b>Aplikasi layar penuh</b><small>Tanpa bilah alamat browser, seperti aplikasi biasa</small></div><div style="margin-top:10px">${inner}</div></div>`;
}
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
