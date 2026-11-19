// ---------- SEZIONE LAVORO: viste, fogli e azioni (stile e componenti del Budget) ----------
const LAV_VIEWS=['lavoro','calendario','ferie','lavaltro','lavpar','lavvoci','lavrilev','lavbuste'];
const LAV_ICON={
  brief:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  cal:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  sun:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  plane:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  doc:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
  clock:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  wallet:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/></svg>'
};
const GG=['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
const oreF=h=>{if(PRIV())return MASK;const v=Math.round((+h||0)*100)/100;return NF.format(v).replace(/,00$/,'')+' h'};
const NF1=v=>PRIV()?MASK:(Math.round(v*10)/10).toLocaleString('it-IT');
const oreN=h=>{const v=Math.round((+h||0)*100)/100;return NF.format(v).replace(/,00$/,'')};
function sezione(v){v=v||S.view;if(v==='stallo')return 'stallo';if(LAV_VIEWS.includes(v))return 'lavoro';return 'budget'}
function lavM(anno=S.anno,mese=S.mese){return lavMese(S.D,anno,mese,today())}
function giornoLabel(iso){const d=lDate(iso);return GG[d.getDay()]+' '+d.getDate()+' '+MESI[d.getMonth()]}
function nextMonth(a,m){return m===12?[a+1,1]:[a,m+1]}
function trasfNome(k){const t=LAV_TRASF.find(x=>x[0]===k);return t?t[1]:''}

// ---------- barra in basso, diversa per sezione ----------
function tabsHtml(sez){
  const a=(v,ic,t)=>`<a href="#${v}" data-v="${v}">${ic}<span>${t}</span></a>`;
  if(sez==='lavoro')return a('lavoro',LAV_ICON.brief,'Lavoro')+a('calendario',LAV_ICON.cal,'Calendario')+`<button class="fab" type="button" data-act="lavfab" aria-label="Registra la giornata di oggi">${ICON.plus}</button>`+a('ferie',LAV_ICON.sun,'Ferie e ROL')+a('lavaltro',ICON.more,'Altro');
  return a('home',ICON.home,'Home')+a('dashboard',ICON.dash,'Dashboard')+`<button class="fab" id="fab" type="button" data-act="fab" aria-label="Nuovo movimento: uscita, entrata o prevista">${ICON.plus}</button>`+a('registro',ICON.list,'Registro')+a('altro',ICON.more,'Altro');
}
let _tabsSez=null;
function renderTabs(){const sez=sezione();const nav=document.querySelector('.tabs');if(!nav)return;nav.hidden=sez==='stallo';
  if(sez!==_tabsSez&&sez!=='stallo'){nav.querySelector('.in').innerHTML=tabsHtml(sez);_tabsSez=sez}
  const cur=sez==='lavoro'?({lavpar:'lavaltro',lavvoci:'lavaltro',lavrilev:'lavaltro',lavbuste:'lavaltro'}[S.view]||S.view):tabOf(S.view);
  nav.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current',a.dataset.v===cur?'page':'false'))}

// ---------- STALLO ----------
function vStallo(){
  const t=today(),oi=isoToday();const g=lavGiorno(S.D,oi,oi);const lm=lavMese(S.D,t.getFullYear(),t.getMonth()+1,t);
  const [na,nm]=nextMonth(t.getFullYear(),t.getMonth()+1);
  let riga,sub;
  if(g.trasf){riga='In trasferta · '+trasfNome(g.trasf);sub=g.daCompilare?'Ore da completare':'Indennità '+eur(+g.p[g.trasf]||0)+' al giorno'}
  else if(g.tipo!=='lavoro'&&g.tipo!=='riposo'){riga=(LAV_TIPI.find(x=>x[0]===g.tipo)||[0,g.tipo])[1]+' oggi';sub=g.assOre?oreF(g.assOre):''}
  else if(g.fonte==='timbr'){riga='In sede dalle '+g.entrata;sub=g.stato==='incorso'?'Uscita prevista '+g.uscita+' · straordinario '+oreF(g.s30+g.s40+g.s50+g.s70):'Uscito alle '+g.uscita+' · straordinario '+oreF(g.s30+g.s40+g.s50+g.s70)}
  else if(g.tg!=='feriale'){riga=g.fest?'Oggi è festa · '+g.fest:'Oggi è '+GG[t.getDay()].toLowerCase();sub='Se lavori, registralo dal +'}
  else {riga='Orario standard '+g.p.entrata+'–'+g.p.uscita;sub='Straordinario previsto '+oreF(g.s30+g.s40+g.s50+g.s70)}
  const lav=`<a class="st-card" href="#lavoro" aria-label="Apri la sezione Lavoro"><span class="st-dir">${ICON.prev}<span>Lavoro</span></span>
    <span class="st-row"><span class="st-ic">${LAV_ICON.pin}</span><span><b>${esc(riga)}</b><small>${esc(sub)}</small></span></span>
    <span class="st-big"><span class="muted small">Busta di ${MESI[t.getMonth()]} stimata</span><span class="num">${bigEur(lm.busta.netto)}</span><span class="muted small">Accredito 9 ${MESI[nm-1]} · ${oreF(lm.s30+lm.s40+lm.s50+lm.s70)} di straordinario</span></span></a>`;
  let bud;
  if(!cats().length)bud=`<a class="st-card" href="#home"><span class="st-dir r"><span>Personale</span>${ICON.next}</span><span class="st-row"><span class="st-ic">${LAV_ICON.wallet}</span><span><b>Configura il budget</b><small>Categorie e prime spese</small></span></span></a>`;
  else{const y=computeYear(S.D,t.getFullYear(),t),m=y.mesi[t.getMonth()];const dim=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(),left=dim-t.getDate()+1;
    bud=`<a class="st-card" href="#home" aria-label="Apri la sezione Personale"><span class="st-dir r"><span>Personale</span>${ICON.next}</span>
    <span class="st-row"><span class="st-ic">${LAV_ICON.wallet}</span><span><b>${m.saldo<0?'Sei oltre di '+eur(-m.saldo):'Ti restano '+eur(m.saldo)}</b><small>${MESI[t.getMonth()]} · ${m.saldo>0?eur(m.saldo/left)+' al giorno per '+left+' '+(left===1?'giorno':'giorni'):'spese sopra la disponibilità'}</small></span></span>
    <span class="st-big"><span class="muted small">Avanzo cumulato</span><span class="num ${m.avanzo<0?'neg':'pos'}">${bigEur(m.avanzo,true)}</span><span class="muted small">${avanzoDa(y,t.getMonth())} ${t.getFullYear()}</span></span></a>`}
  return `<div class="st-top"><p class="eyebrow">${GG[t.getDay()]} ${t.getDate()} ${MESI[t.getMonth()]}</p><h1 class="st-h">Ciao ${esc(APP_NOME.split(' ')[0])}</h1></div>${syncBanner()}${lav}${bud}
   <div class="st-hint" aria-hidden="true"><span>${ICON.prev} scorri a destra</span><span class="dots"><i></i><i class="on"></i><i></i></span><span>scorri a sinistra ${ICON.next}</span></div>`;
}
function bigEur(v,segno){if(PRIV())return MASK+'<small> €</small>';const a=Math.abs(v);return (segno?(v>0?'+':v<0?'−':''):(v<0?'−':''))+Math.trunc(a).toLocaleString('it-IT')+'<small>,'+NF.format(a).split(',')[1]+' €</small>'}

// ---------- LAVORO · HOME ----------
function lavHd(){
  const modeIcon=S.mode==='dark'?ICON.moon:S.mode==='light'?ICON.sun:ICON.auto;
  return `<div class="hh"><a class="hh-av" href="#stallo" aria-label="Torna alla scelta Lavoro o Personale">${APP_INIZIALI}</a><div class="hh-m"><button class="ghost" data-act="mprev" aria-label="Mese precedente" ${S.mese<=1?'disabled':''}>${ICON.prev}</button><button class="ml" data-act="pickyear" aria-label="${MESI[S.mese-1]} ${S.anno}, tocca per cambiare anno">${MESI[S.mese-1]} ${S.anno}</button><button class="ghost" data-act="mnext" aria-label="Mese successivo" ${S.mese>=12?'disabled':''}>${ICON.next}</button></div><button class="icon-btn" data-act="priv" aria-pressed="${S.priv}" aria-label="${S.priv?'Mostra gli importi':'Nascondi gli importi'}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${S.priv?'<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>':'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'}</svg></button><button class="icon-btn" data-act="mode" aria-label="Tema">${modeIcon}</button></div>`;
}
function stipConf(anno,mese){return S.D.stipendi.find(x=>x.anno===anno&&x.mese===mese&&x.stato==='confermato')}
function vLavoro(){
  const m=lavM(),b=m.busta,conf=stipConf(S.anno,S.mese);const [na,nm]=nextMonth(S.anno,S.mese);
  const st=monthState(S.anno,S.mese,today());
  const pct=m.lavorativi?Math.min(1,m.lavorati/m.lavorativi):0,C=2*Math.PI*112;
  const netto=conf?+conf.netto:b.netto,v=Math.abs(netto),int=PRIV()?MASK:Math.trunc(v).toLocaleString('it-IT'),dec=PRIV()?'':NF.format(v).split(',')[1];
  const lbl=conf?'Netto in busta':'Netto stimato';
  const rate=`Busta di ${MESI[S.mese-1]} · accredito 9 ${MB[nm-1]}${na!==S.anno?' '+na:''}`;
  const hero=`<section class="hh-hero"><div class="hero-ring"><svg viewBox="0 0 236 236" role="img" aria-label="Giorni lavorati ${m.lavorati} su ${m.lavorativi}"><circle cx="118" cy="118" r="112" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="118" cy="118" r="112" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(pct*C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 118 118)"/></svg><div class="hero-c"><span class="lbl">${lbl}</span><span class="big num" style="--len:${int.length+2}">${int}<small>${dec?','+dec:''} €</small></span><span class="rate">${rate}</span></div></div><p class="hero-note">Giorni lavorati <strong class="num">${m.lavorati}</strong> su <strong class="num">${m.lavorativi}</strong> · lordo <strong class="num">${eur(conf&&conf.lordo?+conf.lordo:b.lordo)}</strong></p></section>`;
  const i=p=>`<span class="qi">${p}</span>`;
  const qa=`<nav class="qa" aria-label="Azioni rapide"><button data-act="lavgiorno" data-k="${isoToday()}">${i(LAV_ICON.clock)}Oggi</button><button data-act="lavtrasf">${i(LAV_ICON.plane)}Trasferta</button><a href="#ferie">${i(LAV_ICON.sun.replace(/24/g,'22'))}Ferie e ROL</a><button data-act="lavbusta" data-k="${S.anno}-${S.mese}">${i(LAV_ICON.doc)}Verifica busta</button></nav>`;
  const row=(l,sub,v,c,act)=>`<${act?`button data-act="${act}"`:'div'} class="krow"><span class="kl"><span>${l}</span><small>${sub}</small></span><span class="kv num ${c||''}">${v}</span></${act?'button':'div'}>`;
  const oreTot=m.s30+m.s40+m.s50+m.s70,orePrev=m.prev.s30+m.prev.s40+m.prev.s50+m.prev.s70;
  const fas=[['30',m.s30],['40',m.s40],['50',m.s50],['70',m.s70]].filter(x=>x[1]>0).map(x=>oreN(x[1])+' h al +'+x[0]+'%').join(' · ')||'Nessuna ora';
  const nTr=Object.values(m.trasf).reduce((a,x)=>a+x,0);
  const banner=m.daCompilare?`<button class="sync-banner warn" data-act="lavcompila">${m.daCompilare} ${m.daCompilare===1?'giornata':'giornate'} di trasferta senza ore: completale</button>`:'';
  return lavHd()+syncBanner()+banner+hero+qa+`<section class="card klist" aria-label="Il mese">`+
    row('Straordinari',fas,sgn(b.straord),'','lavcal')+
    (st==='chiuso'?row('Premi e altre voci',m.voci.length?m.voci.map(v=>esc(v.descrizione)).join(', '):'Nessuna',sgn(b.premi-b.tratt),'','lavvoci'):row('Di cui previsti',orePrev?oreF(orePrev)+' sui giorni che mancano':'Nessun giorno ancora da fare',orePrev?'≈ '+oreF(orePrev):'—','muted','lavcal'))+
    row('Trasferte',nTr?Object.entries(m.trasf).filter(x=>x[1]).map(x=>x[1]+' '+trasfNome(x[0])).join(' · '):'Nessuna a '+MESI[S.mese-1],sgn(b.trasf),'','lavtrasf')+
    row('Mensa',m.mensa+' pasti × '+eur(m.p.mensa),b.mensa?'−'+eur(b.mensa):eur(0))+
    row('Tasse e contributi','IRPEF, INPS, Cometa'+(b.addiz?', addizionali':''),'−'+eur(r2(b.irpef+b.ivs+b.cigs+b.cometa+b.addiz)),'','lavdett')+
   `</section>`;
}
// ---------- CALENDARIO ----------
function vCalendario(){
  const m=lavM(),oi=isoToday();const first=lDate(lIso(S.anno,S.mese,1)).getDay();const off=(first+6)%7;
  let cells='';for(let i=0;i<off;i++)cells+='<span class="cd vuoto"></span>';
  m.giorni.forEach(g=>{const d=+g.iso.slice(8);const ore=g.s30+g.s40+g.s50+g.s70;let tag='',cls='';
    if(g.tipo==='ferie')tag='Ferie';else if(g.tipo==='rol')tag='ROL';else if(g.tipo==='permesso')tag='Perm.';else if(g.tipo==='malattia')tag='Mal.';else if(g.tipo==='congedo')tag='Cong.';else if(g.tipo==='festivo')tag='Fest.';
    else if(g.trasf)tag=(trasfNome(g.trasf).split(' ')[0]==='IT'?'IT':trasfNome(g.trasf).split(' ')[0]).slice(0,5)+(g.daCompilare?' ?':'');
    else if(ore)tag='+'+oreN(ore);else if(g.tipo==='lavoro'&&g.tg==='feriale')tag='—';
    if(g.stato==='previsto'||g.stato==='daconf')cls+=' prev';if(g.fest||g.tg==='festivo')cls+=' fest';if(g.iso===oi)cls+=' oggi';if(g.trasf)cls+=' tr';if(g.daCompilare)cls+=' warn';
    cells+=`<button class="cd${cls}" data-act="lavgiorno" data-k="${g.iso}" aria-label="${giornoLabel(g.iso)}${tag?', '+tag:''}"><b>${d}</b><i>${esc(tag)}</i></button>`});
  const leg=`<p class="note">Tratteggiati: giorni non ancora fatti o senza dati, contati con l'orario standard (${m.p.entrata}–${m.p.uscita}, pausa ${m.p.pausa} min). Tocca un giorno per registrarlo o correggerlo.</p>`;
  const lista=m.giorni.filter(g=>g.tipo!=='riposo'&&!(g.stato==='previsto')).slice().reverse().map(g=>{const ore=g.s30+g.s40+g.s50+g.s70;const sub=g.tipo!=='lavoro'?(LAV_TIPI.find(x=>x[0]===g.tipo)||[0,g.tipo])[1]+(g.assOre?' · '+oreF(g.assOre):''):(g.trasf?trasfNome(g.trasf)+' · ':'')+(g.entrata&&!g.manuale&&!g.trasf?g.entrata+'–'+(g.uscita||'…'):g.manuale?'Ore a mano':'')+(g.stato==='daconf'?' · da confermare':g.fonte==='timbr'?' · rilevata':'');
    return `<button class="item ${g.stato==='daconf'?'is-prev':''}" data-act="lavgiorno" data-k="${g.iso}"><span class="badge db"><b>${+g.iso.slice(8)}</b><i>${MB[S.mese-1]}</i></span><span class="grow"><span class="t">${GG[lDate(g.iso).getDay()]}</span><span class="s">${esc(sub)}</span></span><span class="amt">${ore?'+'+oreF(ore):''}</span></button>`}).join('');
  return header('Calendario',{month:true,badge:false})+`<section class="card cal"><div class="cal-h">${['Lu','Ma','Me','Gi','Ve','Sa','Do'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-g">${cells}</div>${leg}</section>`+
    (lista?`<section class="card tight"><div class="list">${lista}</div></section>`:'');
}
// ---------- FERIE E ROL ----------
function feriePiani(){
  const oi=isoToday(),t=today();const rec=(S.D.ore||[]).filter(r=>['ferie','rol','permesso'].includes(r.tipo)&&r.id.slice(0,7)>=oi.slice(0,7)).sort((a,b)=>a.id<b.id?-1:1);
  const out=[];rec.forEach(r=>{const l=out[out.length-1];const prevD=l?new Date(lDate(l.al).getTime()):null;
    let cont=false;if(l&&l.tipo===r.tipo){const d=lDate(l.al);for(let k=1;k<6;k++){d.setDate(d.getDate()+1);const iso=lIso(d.getFullYear(),d.getMonth()+1,d.getDate());if(iso===r.id){cont=true;break}if(lTipoG(iso)==='feriale')break}}
    const h=+r.oreass||8;if(cont){l.al=r.id;l.gg++;l.ore+=h;l.ids.push(r.id)}else out.push({tipo:r.tipo,dal:r.id,al:r.id,gg:1,ore:h,ids:[r.id]})});
  return out}
function vFerie(){
  const t=today(),a=t.getFullYear(),mm=t.getMonth()+1;const s=lavSaldi(S.D,a,mm,t),fine=lavSaldi(S.D,a,12,t);
  const tiles=s?`<div class="tiles"><div class="tile hero"><span class="t-l">Ferie a fine ${MESI[mm-1]}</span><span class="t-v num">${oreF(s.ferie)}</span><span class="t-n">${NF1(s.ferie/8)} gg · Dic ${Math.round(fine.ferie)} h</span></div><div class="tile"><span class="t-l">ROL a fine ${MESI[mm-1]}</span><span class="t-v num">${oreF(s.rol)}</span><span class="t-n">${NF1(s.rol/8)} gg · Dic ${Math.round(fine.rol)} h</span></div></div><p class="note">Dalla busta di ${MESI[s.ref.mese-1]} ${s.ref.anno}, più ${oreN(lavPar(S.D,a,mm).feriemese)} h di ferie e ${oreN(lavPar(S.D,a,mm).rolmese)} h di ROL maturati ogni mese, meno i giorni segnati qui.</p>`
    :`<section class="card"><p class="note">Mancano i saldi: inseriscili da Verifica busta con i valori dell'ultima busta paga.</p></section>`;
  const P=feriePiani();const ab=lFasce('2026-11-16',lavPar(S.D,a,mm).entrata,lavPar(S.D,a,mm).uscita,lavPar(S.D,a,mm).pausa,lavPar(S.D,a,mm));
  const nomi={ferie:'Ferie',rol:'ROL',permesso:'Permesso'};
  const lista=P.map(p=>{const d1=lDate(p.dal),d2=lDate(p.al);const per=p.dal===p.al?`${GG[d1.getDay()]} ${d1.getDate()} ${MESI[d1.getMonth()]}`:`${d1.getDate()}${d1.getMonth()!==d2.getMonth()?' '+MB[d1.getMonth()]:''} – ${d2.getDate()} ${MESI[d2.getMonth()]}`;
    return `<button class="item ${p.dal>isoToday()?'is-prev':''}" data-act="lavferieedit" data-k="${p.ids.join(',')}"><span class="badge db"><b>${d1.getDate()}</b><i>${MB[d1.getMonth()]}</i></span><span class="grow"><span class="t">${nomi[p.tipo]} · ${per}</span><span class="s">${p.gg} ${p.gg===1?'giorno':'giorni'} · ${oreF(p.ore)}</span></span><span class="amt">−${oreF(p.ore)}</span></button>`}).join('')||'<p class="empty">Nessun giorno pianificato.</p>';
  // effetto sulla stima: straordinario e mensa abituali che non ci saranno
  const eff={};P.forEach(p=>p.ids.forEach(id=>{const k=id.slice(0,7);if(id<=isoToday())return;(eff[k]=eff[k]||{gg:0})[ 'gg']++}));
  const effR=Object.keys(eff).sort().map(k=>{const [y,mo]=k.split('-').map(Number);const p=lavPar(S.D,y,mo);const h=eff[k].gg*(ab.s30+ab.s40);const e=r2(eff[k].gg*(ab.s30*p.paga*1.3+ab.s40*p.paga*1.4));
    return `<div class="item"><span class="grow"><span class="t">${MESI[mo-1]}${y!==a?' '+y:''}</span><span class="s">${eff[k].gg} ${eff[k].gg===1?'giorno':'giorni'} senza straordinario abituale e mensa</span></span><span class="amt">−${oreF(h)}<span class="s" style="display:block;font-weight:500">−${eur(e)} lordi</span></span></div>`}).join('');
  return header('Lavoro',{month:false,badge:false,h:'Ferie e ROL'})+tiles+`<section class="card"><div class="row-head"><h2>Pianificate</h2><button class="link" data-act="lavferieadd">+ Aggiungi</button></div><div class="list">${lista}</div></section>`+
    (effR?`<section class="card"><h2>Effetto sulla stima</h2><div class="list">${effR}</div></section>`:'');
}
// ---------- ALTRO (Lavoro) ----------
function vLavAltro(){
  const link=(k,t,sub)=>`<a class="item" href="#${k}" style="color:inherit;text-decoration:none"><span class="grow"><span class="t">${t}</span><span class="s">${sub}</span></span><span class="chev">${ICON.chev}</span></a>`;
  const az=(act,t,sub)=>`<button class="item" data-act="${act}"><span class="grow"><span class="t">${t}</span><span class="s">${sub}</span></span><span class="chev">${ICON.chev}</span></button>`;
  const gruppo=(tit,righe)=>`<p class="sec-title">${tit}</p><section class="card tight menu"><div class="list">${righe.join('')}</div></section>`;
  const p=lavPar(S.D,S.anno,S.mese);
  return header('Lavoro',{month:false,badge:false,h:'Altro'})+
    gruppo('Busta paga',[link('lavbuste','Verifica buste '+S.anno,'Stima e busta vera a confronto, ore pagate, saldi ferie e ROL'),link('lavvoci','Premi e altre voci','Premio obiettivi, una tantum, festività non goduta, congedi'),link('lavpar','Parametri della busta','Paga oraria, mensa, trasferte, contributi, addizionali')])+
    gruppo('Presenze',[link('lavrilev','Rilevamento automatico','Comandi rapidi: arrivo e uscita dalla sede'),az('lavsede','Sede di lavoro',p.sedelat?'Posizione salvata · tocca per aggiornarla da qui':'Non impostata: tocca quando sei in officina')])+
    gruppo('App',[link('stallo','Schermata iniziale','Scelta tra Lavoro e Personale'),link('home','Personale','Entrate, spese e budget del mese')]);
}
function vLavBuste(){
  const oggi=today();const righe=[];for(let mo=12;mo>=1;mo--){const st=monthState(S.anno,mo,oggi);if(st==='futuro')continue;
    const m=lavMese(S.D,S.anno,mo,oggi),c=stipConf(S.anno,mo);const s=(S.D.saldi||[]).find(x=>x.anno===S.anno&&x.mese===mo);
    const d=c?r2(+c.netto-m.busta.netto):null;
    righe.push(`<button class="item" data-act="lavbusta" data-k="${S.anno}-${mo}"><span class="badge db"><b>${MB[mo-1]}</b></span><span class="grow"><span class="t">${MESI[mo-1]}</span><span class="s">Stima ${eur(m.busta.netto)}${c?' · busta '+eur(+c.netto):' · busta non inserita'}${s?' · ore in busta segnate':''}</span></span><span class="amt ${d==null?'':d<0?'neg':'pos'}">${d==null?'—':sgn(d)}</span></button>`)}
  return header('Lavoro',{month:false,badge:false,h:'Verifica buste'})+`<p class="note">Differenza tra il netto della busta e la stima dell'app (che usa le ore registrate e i premi inseriti). Tocca un mese per inserire la busta vera.</p><section class="card tight"><div class="list">${righe.join('')||'<p class="empty">Nessun mese.</p>'}</div></section>`;
}
function vLavVoci(){
  const v=(S.D.voci||[]).filter(x=>x.anno===S.anno).sort((a,b)=>b.mese-a.mese||a.descrizione.localeCompare(b.descrizione));
  const lista=v.map(x=>`<button class="item" data-act="lavvoce" data-id="${esc(x.id)}"><span class="badge db"><b>${MB[x.mese-1]}</b></span><span class="grow"><span class="t">${esc(x.descrizione)}</span><span class="s">Busta di ${MESI[x.mese-1]}${lavBool(x.noinps)?' · senza contributi INPS':''}</span></span><span class="amt ${x.importo<0?'neg':''}">${sgn(x.importo)}</span></button>`).join('')||'<p class="empty">Nessuna voce nel '+S.anno+'.</p>';
  return header('Lavoro',{month:false,badge:false,h:'Premi e altre voci'})+`<section class="card"><div class="row-head"><h2>${S.anno}</h2><button class="link" data-act="lavvoce">+ Aggiungi</button></div><p class="note">Importi lordi in busta: positivi per premi e una tantum, negativi per trattenute prima delle tasse (es. assenza).</p><div class="list">${lista}</div></section>`;
}
const LAV_PAR_LBL=[['paga','Paga oraria','€/h','Retribuzione mensile ÷ 173'],['premio','Premio produzione mensile','€',''],['minimo','Minimo contrattuale','€','Base del contributo Cometa'],['mensa','Mensa','€ al pasto','Trattenuta in busta'],['indmensa','Indennità mensa','€/mese',''],
  ['itg','Trasferta IT giorno','€/giorno',''],['itn','Trasferta IT notte','€/giorno',''],['eu','Trasferta EU','€/giorno',''],['extra','Trasferta Extra EU','€/giorno',''],['rischio','Trasferta paesi a rischio','€/giorno',''],['esenteest','Trasferta estero esente','€/giorno','Senza tasse né contributi (vitto e alloggio pagati)'],
  ['ivs','Contributo IVS','%',''],['cigs','Contributo CIGS','%',''],['cometa','Fondo Cometa','% del minimo',''],['addiz','Addizionali regionale e comunale','€/mese',''],['addizmesi','Mesi delle addizionali','es. 1-11',''],['ivsaggsoglia','Soglia IVS aggiuntivo 1%','€/mese','Oltre questo imponibile INPS'],
  ['entrata','Entrata standard','hh:mm',''],['uscita','Uscita standard','hh:mm',''],['pausa','Pausa abituale','minuti','Dalle 12:15'],['arrot','Arrotondamento straordinario','minuti','Per difetto'],['feriemese','Ferie maturate','ore/mese',''],['rolmese','ROL maturati','ore/mese','']];
function vLavPar(){
  const p=lavPar(S.D,S.anno,S.mese);
  const righe=LAV_PAR_LBL.map(([k,l,u,n])=>{const v=p[k];const txt=typeof v==='number'?NF.format(v).replace(/,00$/,'').replace(/(,\d*?)0+$/,'$1'):esc(v);return `<button class="item" data-act="lavparedit" data-k="${k}"><span class="grow"><span class="t">${l}</span><span class="s">${u}${n?' · '+n:''}</span></span><span class="amt">${PRIV()&&['paga','minimo'].includes(k)?MASK:txt}</span></button>`}).join('');
  return header('Parametri',{month:true,badge:false})+`<p class="note">Valori validi a ${MESI[S.mese-1]} ${S.anno}. Se cambiano (aumento, nuovo livello) modificali dal mese giusto: i mesi prima restano com'erano.</p><section class="card tight"><div class="list">${righe}</div></section>`;
}
function rilevUrl(ev){if(!SYNC.api)return '';const u=SYNC.api.url;return u+(u.includes('?')?'&':'?')+'key='+encodeURIComponent(SYNC.api.key)+'&timbra='+ev}
function vLavRilev(){
  const tb=(S.D.timbrature||[]).slice().sort((a,b)=>a.id<b.id?1:-1).slice(0,8);
  const passi=[['Apri Comandi rapidi','Sull\'iPhone apri l\'app Comandi rapidi, scheda <b>Automazione</b>, poi <b>+</b> (o «Nuova automazione»).'],
    ['Scegli «Arrivo»','Tocca <b>Arrivo</b>, poi <b>Posizione › Scegli</b> e cerca «Via Borgomanero 44, Paruzzaro». Riduci il cerchio al minimo (circa 100 m) e tocca <b>Fine</b>. Lascia «Qualsiasi ora».'],
    ['Esegui subito','Seleziona <b>Esegui immediatamente</b> (e disattiva «Notifica quando eseguito» se non la vuoi), poi <b>Avanti</b> › <b>Nuova automazione vuota</b>.'],
    ['Aggiungi l\'azione','Cerca l\'azione <b>Ottieni contenuti dell\'URL</b>. Al posto di «URL» incolla l\'indirizzo per l\'<b>arrivo</b> che copi qui sotto. Tocca <b>Fine</b>.'],
    ['Ripeti per l\'uscita','Crea un\'altra automazione uguale scegliendo l\'opzione di <b>uscita</b> dal luogo (la voce accanto ad Arrivo) invece di Arrivo, e incolla l\'indirizzo per l\'<b>uscita</b>.'],
    ['Consenti la posizione','In Impostazioni › Privacy › Localizzazione › Comandi rapidi scegli <b>Sempre</b> e lascia attiva la <b>Posizione esatta</b>.']];
  const step=passi.map((s,i)=>`<li><b class="n">${i+1}</b><span><b>${s[0]}</b><span class="small muted">${s[1]}</span></span></li>`).join('');
  return header('Lavoro',{month:false,badge:false,h:'Rilevamento automatico'})+
   `<section class="card"><p class="note">L'iPhone avvisa Comandi rapidi quando entri o esci dal cerchio intorno all'officina: l'orario finisce nel tuo Google Sheet e l'app lo usa come entrata e uscita della giornata (sempre modificabili). Gli indirizzi contengono la tua chiave: incollali solo in Comandi rapidi.</p><ol class="passi">${step}</ol>
   <div class="actions"><button class="pill-btn soft" data-act="lavcopia" data-k="arrivo">Copia indirizzo arrivo</button><button class="pill-btn soft" data-act="lavcopia" data-k="uscita">Copia indirizzo uscita</button></div>
   <p class="note">Prova: tocca un indirizzo nel campo URL dell'automazione e premi ▶︎ in basso; deve rispondere con {"ok":true,…}. Poi cancella la prova dalla lista qui sotto (tienila premuta nel foglio Timbrature) se non serve.</p></section>`+
   `<section class="card"><h2>Ultime rilevazioni</h2><div class="list">${tb.map(x=>`<div class="item"><span class="badge db"><b>${+x.data.slice(8)}</b><i>${MB[+x.data.slice(5,7)-1]}</i></span><span class="grow"><span class="t">${x.evento==='arrivo'?'Arrivo in sede':'Uscita dalla sede'}</span><span class="s">${esc(x.data)}</span></span><span class="amt">${esc(x.ora)}</span></div>`).join('')||'<p class="empty">Nessuna rilevazione ancora.</p>'}</div></section>`;
}

// ---------- FOGLIO: GIORNATA ----------
function sheetGiorno(iso){
  const g=lavGiorno(S.D,iso,isoToday());const p=g.p;let tipo=g.tipo==='riposo'?'lavoro':g.tipo,trasf=g.trasf||'',mensa=g.rec?g.mensa:(g.tg==='feriale'&&!g.trasf);
  let man=g.manuale&&!g.trasf,f={s30:g.s30,s40:g.s40,s50:g.s50,s70:g.s70};
  const tb=(S.D.timbrature||[]).filter(x=>x.data===iso).sort((a,b)=>String(a.ora).localeCompare(String(b.ora)));
  const rilA=tb.find(x=>x.evento==='arrivo'),rilU=tb.filter(x=>x.evento==='uscita').pop();
  const ent=g.entrata||(g.tg==='feriale'?p.entrata:''),usc=g.uscita||(g.tg==='feriale'?p.uscita:''),pau=g.pausa??(g.tg==='feriale'?p.pausa:0);
  const tipi=LAV_TIPI.map(([k,l])=>`<button type="button" data-tipo="${k}" aria-pressed="${k===tipo}">${l}</button>`).join('');
  const trs=[['','Nessuna']].concat(LAV_TRASF.map(x=>[x[0],x[1]])).map(([k,l])=>`<button type="button" data-tr="${k}" aria-pressed="${k===trasf}">${l}</button>`).join('');
  const fx=(k,n,sub)=>`<div class="fx" data-fx="${k}"><span class="fx-l"><b>${n}</b><small>${sub}</small></span><span class="fx-st"><button type="button" data-d="-1" aria-label="Togli un quarto d'ora a ${n}">−</button><span class="num" data-v></span><button type="button" data-d="1" aria-label="Aggiungi un quarto d'ora a ${n}">+</button></span><span class="fx-e num" data-e></span></div>`;
  const html=`<div class="catpick" data-g="tipo">${tipi}</div>
   <div data-sez="lavoro">
    <div class="tri" data-sez="orari"><div class="field"><label for="g-e">Entrata</label><input id="g-e" type="time" value="${esc(ent)}">${rilA?`<span class="det">${LAV_ICON.pin.replace(/20/g,'13')} rilevata ${esc(rilA.ora)}</span>`:''}</div><div class="field"><label for="g-u">Uscita</label><input id="g-u" type="time" value="${esc(usc)}">${rilU?`<span class="det">${LAV_ICON.pin.replace(/20/g,'13')} rilevata ${esc(rilU.ora)}</span>`:''}</div><div class="field"><label for="g-p">Pausa (min)</label><input id="g-p" inputmode="numeric" value="${pau}"><span class="det">dalle ${esc(p.pausainizio)}</span></div></div>
    <div class="tri two" data-sez="extra"><div class="field"><label for="g-x">${g.tg==='feriale'?'Ore oltre le 8':'Ore lavorate'}</label><input id="g-x" inputmode="decimal" value="${g.extra!=null?inp(g.extra):''}" placeholder="es. 2,5"></div><div class="field"><label for="g-n">Di cui dalle 22 alle 6</label><input id="g-n" inputmode="decimal" value="${g.notte?inp(g.notte):''}" placeholder="0"></div></div>
    <section class="card fxc"><div class="row-head"><h2>Ore della giornata</h2><span class="chip acc" data-stato></span></div>
     <div class="fx base"><span class="fx-l"><b>Ordinarie</b><small data-ordsub></small></span><span class="fx-e num" data-ord></span></div>
     ${fx('s30','+30%','Feriale fino a 10 h')}${fx('s40','+40%','Feriale oltre le 10 h')}${fx('s50','+50%','Sabato, prime 8 h')}${fx('s70','+70%','Notte 22–06, sabato oltre 8 h, festivi')}
     <p class="note" data-nota></p><button type="button" class="link" data-ricalc hidden>Ricalcola dagli orari</button></section>
    <div class="field"><label>Trasferta</label><div class="catpick" data-g="tr">${trs}</div></div>
    <button type="button" class="switch" role="switch" data-mensa aria-checked="${mensa}"><span class="sw-t"><b>Mensa</b><span class="small muted">Trattenuta ${eur(p.mensa)}</span></span><span class="sw-k"></span></button>
   </div>
   <div data-sez="assenza"><div class="field"><label for="g-a">Ore</label><input id="g-a" inputmode="decimal" value="${inp(g.assOre||(g.tg==='feriale'?8:0))}"></div><p class="note">Per ferie, ROL e permessi indica le ore usate (8 per un giorno intero).</p></div>
   <div class="tot"><span class="muted">Giornata</span><b class="num" data-tot></b></div>
   <div class="actions">${g.rec?'<button type="button" class="pill-btn danger" data-del>Ripristina standard</button>':''}<button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet(giornoLabel(iso)+(g.fest?' · '+g.fest:''),html,(el,close)=>{
    const $=q=>el.querySelector(q);
    const calc=()=>{if(tipo!=='lavoro')return {s30:0,s40:0,s50:0,s70:0,ord:0};
      if(trasf){const x=lFasceExtra(iso,num($('#g-x').value)||0,num($('#g-n').value)||0);return Object.assign(x,{ord:g.tg==='feriale'?8:0})}
      if(man)return Object.assign({},f,{ord:g.tg==='feriale'?8:0});
      return lFasce(iso,$('#g-e').value,$('#g-u').value,num($('#g-p').value)||0,p)};
    const draw=()=>{const ass=['ferie','rol','permesso'].includes(tipo)||(tipo!=='lavoro');
      $('[data-sez="lavoro"]').hidden=tipo!=='lavoro';$('[data-sez="assenza"]').hidden=tipo==='lavoro';
      $('[data-sez="orari"]').hidden=!!trasf||man&&false;$('[data-sez="extra"]').hidden=!trasf;
      const c=calc();if(!man||trasf)f={s30:c.s30,s40:c.s40,s50:c.s50,s70:c.s70};
      el.querySelectorAll('[data-fx]').forEach(r=>{const k=r.dataset.fx;r.querySelector('[data-v]').textContent=oreN(f[k]);r.querySelector('[data-e]').textContent=f[k]?eur(r2(f[k]*p.paga*(1+(+k.slice(1))/100))):'—';r.classList.toggle('on',f[k]>0);r.querySelectorAll('button').forEach(b=>b.disabled=!!trasf)});
      $('[data-ord]').textContent=oreN(c.ord||0)+' h';$('[data-ordsub]').textContent=g.tg==='feriale'?'Orario '+p.entrata+'–'+p.uscita:(g.tg==='sabato'?'Sabato: tutto straordinario':'Festivo: tutto straordinario');
      $('[data-stato]').textContent=trasf?'TRASFERTA':man?'CORRETTE A MANO':'CALCOLATE';$('[data-ricalc]').hidden=!man||!!trasf;
      $('[data-nota]').textContent=trasf?'In trasferta indica le ore oltre le 8 (il viaggio conta come lavoro): le divido io nelle fasce.':man?'Hai corretto le ore: non le ricalcolo più dagli orari.':'Le ore si dividono da sole in base all\'orario. Con − e + le correggi a mano.';
      const ore=f.s30*1.3+f.s40*1.4+f.s50*1.5+f.s70*1.7;const tot=tipo==='lavoro'?r2(ore*p.paga+(trasf?+p[trasf]:0)-(mensa?p.mensa:0)):0;
      $('[data-tot]').textContent=tipo==='lavoro'?sgn(tot)+' lordi':oreF(num($('#g-a').value)||0)+' di '+(LAV_TIPI.find(x=>x[0]===tipo)||[0,''])[1].toLowerCase()};
    el.querySelectorAll('[data-tipo]').forEach(b=>b.onclick=()=>{tipo=b.dataset.tipo;el.querySelectorAll('[data-tipo]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
    el.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{trasf=b.dataset.tr;el.querySelectorAll('[data-tr]').forEach(x=>x.setAttribute('aria-pressed',x===b));if(trasf){mensa=false;$('[data-mensa]').setAttribute('aria-checked','false')}draw()});
    el.querySelectorAll('[data-fx] [data-d]').forEach(b=>b.onclick=()=>{const k=b.closest('[data-fx]').dataset.fx;man=true;f[k]=Math.max(0,r2(f[k]+ +b.dataset.d*0.25));draw()});
    $('[data-ricalc]').onclick=()=>{man=false;draw()};
    $('[data-mensa]').onclick=()=>{mensa=!mensa;$('[data-mensa]').setAttribute('aria-checked',mensa);draw()};
    ['#g-e','#g-u','#g-p','#g-x','#g-n','#g-a'].forEach(q=>$(q).addEventListener('input',draw));
    if($('[data-del]'))$('[data-del]').onclick=async()=>{close();await del('ore/'+iso);toast('Giornata riportata all\'orario standard')};
    $('[data-save]').onclick=async()=>{
      const row={tipo,entrata:null,uscita:null,pausa:null,s30:null,s40:null,s50:null,s70:null,manuale:false,trasferta:null,mensa:false,extra:null,notte:null,oreass:null,stima:false,nota:g.rec&&g.rec.nota||''};
      if(tipo==='lavoro'){row.mensa=mensa;row.trasferta=trasf||null;
        if(trasf){const x=num($('#g-x').value);row.extra=isNaN(x)?null:x;row.notte=num($('#g-n').value)||0;if(row.extra==null){toast('Inserisci le ore oltre le 8 (anche 0)');return}}
        else{row.entrata=$('#g-e').value||null;row.uscita=$('#g-u').value||null;row.pausa=num($('#g-p').value)||0;if(man){row.manuale=true;Object.assign(row,f)}else if(!row.entrata||!row.uscita){toast('Inserisci entrata e uscita');return}}}
      else{const a=num($('#g-a').value);row.oreass=isNaN(a)?8:a}
      close();await put('ore/'+iso,row);toast('Giornata salvata')};
    draw()});
}
// ---------- FOGLIO: TRASFERTA ----------
function sheetTrasferta(opt={}){
  const oi=isoToday();let tipo=opt.tipo||'itn';
  const opts=LAV_TRASF.map(([k,l,s])=>`<button type="button" class="opt" data-t="${k}" aria-pressed="${k===tipo}"><span class="rd"></span><span class="grow"><b>${l}</b><small>${s} · ${eur(+lavPar(S.D,S.anno,S.mese)[k])} al giorno</small></span></button>`).join('');
  const html=`${opt.km?`<p class="note big">Sei a <b>${opt.km} km</b> dalla sede (Paruzzaro). Sei in trasferta?</p>`:''}<div class="opts">${opts}</div>
   <div class="tri two"><div class="field"><label for="t-d">Dal</label><input id="t-d" type="date" value="${opt.dal||oi}"></div><div class="field"><label for="t-r">Rientro previsto</label><input id="t-r" type="date" value="${opt.al||oi}"></div></div>
   <p class="note" data-r></p>
   <div class="choice"><button type="button" class="pill-btn" data-ok>Sì, sono in trasferta</button>${opt.km?'<button type="button" class="pill-btn soft" data-no>No, non sono in trasferta</button>':''}</div>`;
  openSheet(opt.km?'Non sei in sede':'Trasferta',html,(el,close)=>{const $=q=>el.querySelector(q);
    const giorni=()=>{const d=$('#t-d').value,r=$('#t-r').value;if(!d||!r||r<d)return [];const out=[];const x=lDate(d);while(true){const iso=lIso(x.getFullYear(),x.getMonth()+1,x.getDate());if(iso>r)break;out.push(iso);x.setDate(x.getDate()+1)}return out};
    const tipoG=(iso,arr)=>tipo==='itn'&&iso===arr[arr.length-1]?'itg':tipo; // rientro di una trasferta in Italia con notte = IT giorno
    const draw=()=>{const gs=giorni();if(!gs.length){$('[data-r]').textContent='Il rientro non può venire prima della partenza.';return}
      const c={};gs.forEach(i=>{const t=tipoG(i,gs);c[t]=(c[t]||0)+1});const tot=gs.reduce((a,i)=>a+ +lavPar(S.D,+i.slice(0,4),+i.slice(5,7))[tipoG(i,gs)],0);
      $('[data-r]').textContent=`${Object.entries(c).map(([k,n])=>n+' × '+trasfNome(k)).join(' + ')} = ${eur(tot)}. È una stima: ogni giorno ti chiedo le ore oltre le 8 e al rientro la confermi o la correggi.`};
    el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tipo=b.dataset.t;el.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()});
    ['#t-d','#t-r'].forEach(q=>$(q).addEventListener('change',draw));
    if($('[data-no]'))$('[data-no]').onclick=()=>{try{localStorage.setItem('lav-noask',oi)}catch(e){}close()};
    $('[data-ok]').onclick=async()=>{const gs=giorni();if(!gs.length){toast('Scegli date valide');return}
      const ops=gs.map(iso=>{const r=(S.D.ore||[]).find(x=>x.id===iso);return {iso,row:{tipo:'lavoro',trasferta:tipoG(iso,gs),mensa:false,manuale:false,extra:r&&r.trasferta&&r.extra!=null?r.extra:null,notte:r&&r.notte||null,stima:iso>oi,nota:'trasferta'}}});
      close();try{localStorage.setItem('lav-noask',oi)}catch(e){}
      await batch(async()=>{for(const o of ops)await put('ore/'+o.iso,o.row)});toast('Trasferta registrata: '+gs.length+' '+(gs.length===1?'giorno':'giorni'))};
    draw()});
}
// giornate di trasferta passate senza ore
function sheetCompila(){
  const oi=isoToday();const gs=(S.D.ore||[]).filter(r=>r.trasferta&&r.extra==null&&!lavBool(r.manuale)&&r.id<oi).sort((a,b)=>a.id<b.id?-1:1);
  if(!gs.length){toast('Nessuna giornata da completare');return}
  const html=`<p class="note">Per ogni giorno indica le ore oltre le 8 (sabato e festivi: tutte le ore lavorate). Il viaggio conta come lavoro.</p>`+gs.map(r=>`<div class="tri two cmp"><div class="field"><label for="c-${r.id}">${giornoLabel(r.id)} · ${trasfNome(r.trasferta)}</label><input id="c-${r.id}" data-id="${r.id}" inputmode="decimal" placeholder="Ore oltre le 8"></div><div class="field"><label for="n-${r.id}">di cui notturne</label><input id="n-${r.id}" inputmode="decimal" placeholder="0"></div></div>`).join('')+
    `<div class="actions"><button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet('Ore di trasferta',html,(el,close)=>{el.querySelector('[data-save]').onclick=async()=>{const rows=[];
    el.querySelectorAll('[data-id]').forEach(i=>{const v=num(i.value);if(isNaN(v))return;const r=(S.D.ore||[]).find(x=>x.id===i.dataset.id);rows.push([r.id,Object.assign({},r,{extra:v,notte:num(el.querySelector('#n-'+r.id).value)||0,stima:false})])});
    if(!rows.length){toast('Scrivi almeno un valore');return}close();await batch(async()=>{for(const [id,r] of rows){const d=Object.assign({},r);delete d.id;await put('ore/'+id,d)}});toast('Ore di trasferta salvate')}});
}
// ---------- FOGLIO: FERIE / ROL ----------
function sheetFerie(ids){
  const oi=isoToday();const recs=ids?ids.map(id=>(S.D.ore||[]).find(x=>x.id===id)).filter(Boolean):[];let tipo=recs[0]?recs[0].tipo:'ferie';
  const dal=recs[0]?recs[0].id:oi,al=recs.length?recs[recs.length-1].id:oi,ore=recs[0]&&recs[0].oreass?+recs[0].oreass:8;
  const html=`<div class="catpick">${[['ferie','Ferie'],['rol','ROL'],['permesso','Permesso']].map(([k,l])=>`<button type="button" data-t="${k}" aria-pressed="${k===tipo}">${l}</button>`).join('')}</div>
   <div class="tri two"><div class="field"><label for="f-d">Dal</label><input id="f-d" type="date" value="${dal}"></div><div class="field"><label for="f-a">Al</label><input id="f-a" type="date" value="${al}"></div></div>
   <div class="field"><label for="f-o">Ore al giorno</label><input id="f-o" inputmode="decimal" value="${inp(ore)}"></div><p class="note" data-r></p>
   <div class="actions">${recs.length?'<button type="button" class="pill-btn danger" data-del>Elimina</button>':''}<button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet(recs.length?'Modifica':'Ferie e ROL',html,(el,close)=>{const $=q=>el.querySelector(q);
    const giorni=()=>{const d=$('#f-d').value,a=$('#f-a').value;if(!d||!a||a<d)return [];const out=[];const x=lDate(d);while(true){const iso=lIso(x.getFullYear(),x.getMonth()+1,x.getDate());if(iso>a)break;if(lTipoG(iso)==='feriale')out.push(iso);x.setDate(x.getDate()+1)}return out};
    const draw=()=>{const g=giorni();$('[data-r]').textContent=g.length?`${g.length} ${g.length===1?'giorno lavorativo':'giorni lavorativi'} (esclusi sabati, domeniche e festivi) · ${oreN(g.length*(num($('#f-o').value)||0))} h`:'Scegli date valide.'};
    el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tipo=b.dataset.t;el.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
    ['#f-d','#f-a','#f-o'].forEach(q=>$(q).addEventListener('input',draw));
    if($('[data-del]'))$('[data-del]').onclick=async()=>{close();await batch(async()=>{for(const r of recs)await del('ore/'+r.id)});toast('Eliminate')};
    $('[data-save]').onclick=async()=>{const g=giorni();if(!g.length){toast('Scegli date valide');return}const h=num($('#f-o').value);
      close();await batch(async()=>{for(const r of recs)if(!g.includes(r.id))await del('ore/'+r.id);for(const iso of g)await put('ore/'+iso,{tipo,oreass:isNaN(h)?8:h,manuale:false,mensa:false,stima:iso>oi,nota:''})});toast('Salvate '+g.length+' giornate')};
    draw()});
}
// ---------- FOGLIO: BUSTA VERA ----------
function sheetBusta(anno,mese){
  const m=lavMese(S.D,anno,mese,today()),c=S.D.stipendi.find(x=>x.anno===anno&&x.mese===mese);const s=(S.D.saldi||[]).find(x=>x.anno===anno&&x.mese===mese)||{};
  const f=k=>m[k];const r=(k,l)=>`<div class="fx"><span class="fx-l"><b>${l}</b><small>Registrate ${oreN(f(k))} h</small></span><input class="bx" id="b-${k}" inputmode="decimal" value="${s[k+'b']!=null?inp(s[k+'b']):''}" placeholder="in busta"><span class="fx-e num" data-d="${k}"></span></div>`;
  const html=`<div class="tri two"><div class="field"><label for="b-n">Netto del mese</label><input id="b-n" inputmode="decimal" value="${c&&c.stato==='confermato'?inp(c.netto):''}" placeholder="Stima ${inp(m.busta.netto)}"></div><div class="field"><label for="b-l">Totale competenze</label><input id="b-l" inputmode="decimal" value="${c&&c.lordo!=null&&c.stato==='confermato'?inp(c.lordo):''}" placeholder="Stima ${inp(m.busta.lordo)}"></div></div>
   <section class="card fxc"><div class="row-head"><h2>Ore pagate in busta</h2></div>${r('s30','+30% (S1)')}${r('s40','+40%')}${r('s50','+50% (S2)')}${r('s70','+70%')}<p class="note" data-m></p></section>
   <div class="tri two"><div class="field"><label for="b-f">Saldo ferie (ore)</label><input id="b-f" inputmode="decimal" value="${s.ferie!=null?inp(s.ferie):''}"></div><div class="field"><label for="b-r">Saldo ROL/PAR (ore)</label><input id="b-r" inputmode="decimal" value="${s.rol!=null?inp(s.rol):''}"></div></div>
   <p class="note">Il netto entra nella sezione Personale come stipendio di ${MESI[mese-1]} (confermato). I saldi sono quelli in fondo alla busta (colonna Saldo).</p>
   <div class="actions"><button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet('Busta di '+MESI[mese-1]+' '+anno,html,(el,close)=>{const $=q=>el.querySelector(q);
    const draw=()=>{let mis=0,eu=0;['s30','s40','s50','s70'].forEach(k=>{const v=num($('#b-'+k).value);const d=isNaN(v)?null:r2(f(k)-v);el.querySelector(`[data-d="${k}"]`).textContent=d==null?'':(d>0?'−'+oreN(d)+' h':d<0?'+'+oreN(-d)+' h':'ok');if(d>0){mis+=d;eu+=d*m.p.paga*(1+(+k.slice(1))/100)}});
      const ob=r2((m.voci||[]).filter(v=>/obiettivi/i.test(String(v.descrizione||''))).reduce((a,v)=>a+ +v.importo,0));
      $('[data-m]').textContent=mis>0?`Ore fuori busta: ${oreN(mis)} h, circa ${eur(r2(eu))} lordi.`+(ob?` Premio obiettivi in busta ${eur(ob)}: ${Math.abs(ob-eu)<1?'torna':(ob>eu?'+':'−')+eur(r2(Math.abs(ob-eu)))+(ob>eu?' a tuo favore':' da chiedere')}.`:' Se l\'azienda le paga come Premio obiettivi, aggiungilo tra i Premi di questo mese.'):'Inserisci le ore indicate in busta (S1 = 30%, S2 = 50%…) per vedere se manca qualcosa.'};
    el.querySelectorAll('.bx').forEach(i=>i.addEventListener('input',draw));
    $('[data-save]').onclick=async()=>{const n=num($('#b-n').value),l=num($('#b-l').value);const sv={anno,mese,ferie:null,rol:null};let any=false;
      ['s30','s40','s50','s70'].forEach(k=>{const v=num($('#b-'+k).value);sv[k+'b']=isNaN(v)?null:v;if(!isNaN(v))any=true});const fe=num($('#b-f').value),ro=num($('#b-r').value);if(!isNaN(fe)){sv.ferie=fe;any=true}if(!isNaN(ro)){sv.rol=ro;any=true}
      close();await batch(async()=>{if(!isNaN(n))await put('stipendi/'+anno+'-'+pad(mese),{anno,mese,netto:r2(n),lordo:isNaN(l)?null:r2(l),stato:'confermato'});if(any)await put('saldi/'+anno+'-'+pad(mese),sv)});toast('Busta salvata')};
    draw()});
}
function sheetVoce(id){
  const v=id?(S.D.voci||[]).find(x=>x.id===id):null;
  const html=`<div class="field"><label for="v-m">Busta di</label><select id="v-m">${MESI.map((n,i)=>`<option value="${i+1}" ${(v?v.mese:S.mese)===i+1?'selected':''}>${n} ${S.anno}</option>`).join('')}</select></div>
   <div class="field"><label for="v-d">Descrizione</label><input id="v-d" value="${esc(v?v.descrizione:'')}" placeholder="es. Premio obiettivi"></div>
   <div class="field"><label for="v-i">Importo lordo (€)</label><input id="v-i" inputmode="decimal" value="${v?inp(v.importo):''}" placeholder="negativo per una trattenuta"></div>
   <button type="button" class="switch" role="switch" data-ni aria-checked="${v?lavBool(v.noinps):false}"><span class="sw-t"><b>Senza contributi INPS</b><span class="small muted">Solo per voci pagate dall'INPS (es. congedo c/Inps)</span></span><span class="sw-k"></span></button>
   <div class="actions">${v?'<button type="button" class="pill-btn danger" data-del>Elimina</button>':''}<button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet(v?'Modifica voce':'Nuova voce',html,(el,close)=>{const $=q=>el.querySelector(q);let ni=v?lavBool(v.noinps):false;
    $('[data-ni]').onclick=()=>{ni=!ni;$('[data-ni]').setAttribute('aria-checked',ni)};
    if($('[data-del]'))$('[data-del]').onclick=async()=>{close();await del('voci/'+v.id);toast('Voce eliminata')};
    $('[data-save]').onclick=async()=>{const i=num($('#v-i').value),d=$('#v-d').value.trim();if(isNaN(i)||!d){toast('Scrivi descrizione e importo');return}const mm=+$('#v-m').value;
      close();await put('voci/'+(v?v.id:S.anno+'-'+pad(mm)+'-'+newId()),{anno:S.anno,mese:mm,descrizione:d,importo:r2(i),noinps:ni});toast('Voce salvata')}});
}
function sheetPar(k){
  const L=LAV_PAR_LBL.find(x=>x[0]===k);const p=lavPar(S.D,S.anno,S.mese);const txt=typeof p[k]==='number'?String(p[k]).replace('.',','):String(p[k]??'');
  const html=`<div class="field"><label for="p-v">${L[1]} (${L[2]})</label><input id="p-v" value="${esc(txt)}" ${typeof p[k]==='number'?'inputmode="decimal"':''}></div>
   <div class="field"><label for="p-d">Valido da</label><select id="p-d">${(()=>{let o='';for(let a=S.anno-1;a<=S.anno+1;a++)for(let mm=1;mm<=12;mm++)o+=`<option value="${a}-${pad(mm)}" ${a===S.anno&&mm===S.mese?'selected':''}>${MESI[mm-1]} ${a}</option>`;return o})()}</select></div>
   <p class="note">Vale da quel mese in poi, finché non lo cambi di nuovo.${k==='paga'?' Le tariffe dello straordinario si aggiornano da sole:':''}</p>${k==='paga'?'<section class="card klist" data-tar></section>':''}<div class="actions"><button type="button" class="pill-btn" data-save>Salva</button></div>`;
  openSheet(L[1],html,(el,close)=>{
    if(k==='paga'){const tar=()=>{const v=num(el.querySelector('#p-v').value);el.querySelector('[data-tar]').innerHTML=[30,40,50,70].map(x=>`<div class="krow"><span class="kl"><span>+${x}%</span></span><span class="kv num">${isNaN(v)?'—':eur(r2(v*(1+x/100)))+'/h'}</span></div>`).join('')};el.querySelector('#p-v').addEventListener('input',tar);tar()}
el.querySelector('[data-save]').onclick=async()=>{let v=el.querySelector('#p-v').value.trim();const dal=el.querySelector('#p-d').value;
    if(LAV_NUM.includes(k)){v=num(v);if(isNaN(v)){toast('Valore non valido');return}}else if(['entrata','uscita'].includes(k)&&!/^\d{1,2}:\d{2}$/.test(v)){toast('Scrivi l\'orario come 08:00');return}
    close();await put('lavoro/'+dal+'-'+k,{dal,[k]:v});toast('Parametro salvato')}});
}
function sheetDettBusta(){
  const m=lavM(),b=m.busta;const r=(l,v,c)=>`<div class="krow"><span class="kl"><span>${l}</span></span><span class="kv num ${c||''}">${v}</span></div>`;
  openSheet('Busta di '+MESI[S.mese-1]+' stimata',`<section class="card klist">${r('Retribuzione (173 h)',eur(b.base))}${r('Straordinari',eur(b.straord))}${r('Trasferte',eur(b.trasf))}${r('Premio produzione + indennità mensa',eur(r2(b.premio+b.indmensa)))}${b.premi?r('Premi e altre voci',eur(b.premi)):''}${b.tratt?r('Trattenute prima delle tasse','−'+eur(b.tratt)):''}${r('<b>Totale competenze</b>','<b>'+eur(b.lordo)+'</b>')}
    ${b.obiettivi?r('Premio obiettivi in busta','già nelle ore','muted'):''}${b.esente?r('Di cui trasferte esenti',eur(b.esente),'muted'):''}${r('INPS (IVS + CIGS'+(b.ivsagg?' + IVS agg. 1%':'')+')','−'+eur(r2(b.ivs+b.ivsagg+b.cigs)))}${r('Fondo Cometa','−'+eur(b.cometa))}${r('IRPEF su '+eur(b.imp),'−'+eur(b.irpef))}${b.addiz?r('Addizionali','−'+eur(b.addiz)):''}${r('Mensa','−'+eur(b.mensa))}${r('<b>Netto</b>','<b>'+eur(b.netto)+'</b>')}</section>
    <p class="note">IRPEF a scaglioni mensili 23% / 33% / 43% come nelle tue buste 2026, senza detrazioni. A Dicembre il conguaglio di fine anno può cambiare il netto.</p>`,null);
}
// ---------- posizione: sede e domanda sulla trasferta ----------
function distKm(a,b,c,d){const R=6371,t=x=>x*Math.PI/180;const dl=t(c-a),dn=t(d-b);const h=Math.sin(dl/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function posizione(){return new Promise((res,rej)=>{if(!navigator.geolocation){rej(new Error('Posizione non disponibile'));return}navigator.geolocation.getCurrentPosition(p=>res(p.coords),e=>rej(e),{enableHighAccuracy:true,timeout:15000,maximumAge:120000})})}
async function impostaSede(){toast('Cerco la posizione…');try{const c=await posizione();const dal='2000-01';await batch(async()=>{await put('lavoro/sede-lat',{dal,sedelat:r2(c.latitude*1e4)/1e4});await put('lavoro/sede-lon',{dal,sedelon:r2(c.longitude*1e4)/1e4})});toast('Sede salvata in questa posizione')}catch(e){toast('Non riesco a leggere la posizione: consentila a Safari')}}
let _askDone=false;
async function chiediTrasferta(){
  if(_askDone||!S.ready||!SYNC.api)return;_askDone=true;const t=today(),oi=isoToday();if(t.getDay()===0)return;
  try{if(localStorage.getItem('lav-noask')===oi)return}catch(e){}
  const oggi=lavGiorno(S.D,oi,oi);
  // prima: giornate di trasferta passate senza ore
  if((S.D.ore||[]).some(r=>r.trasferta&&r.extra==null&&!lavBool(r.manuale)&&r.id<oi)){setTimeout(()=>{if(!document.querySelector('.sheet'))sheetCompila()},700);return}
  if(oggi.trasf||oggi.tipo!=='lavoro'&&oggi.tipo!=='riposo'||oggi.fonte==='timbr')return;
  const p=oggi.p;if(!p.sedelat||!p.sedelon)return;
  try{const c=await posizione();const km=distKm(p.sedelat,p.sedelon,c.latitude,c.longitude);if(km>5&&!document.querySelector('.sheet'))sheetTrasferta({km:Math.round(km)})}catch(e){}
}
// ---------- azioni ----------
function lavAct(a,id,k){
  switch(a){
    case 'lavfab':sheetGiorno(isoToday());return true;
    case 'lavgiorno':sheetGiorno(k||isoToday());return true;
    case 'lavtrasf':sheetTrasferta();return true;
    case 'lavcompila':sheetCompila();return true;
    case 'lavferieadd':sheetFerie(null);return true;
    case 'lavferieedit':sheetFerie(k.split(','));return true;
    case 'lavbusta':{const [y,m]=k.split('-').map(Number);sheetBusta(y,m);return true}
    case 'lavvoce':sheetVoce(id||null);return true;
    case 'lavparedit':sheetPar(k);return true;
    case 'lavdett':sheetDettBusta();return true;
    case 'lavcal':location.hash='#calendario';return true;
    case 'lavvoci':location.hash='#lavvoci';return true;
    case 'lavsede':impostaSede();return true;
    case 'lavcopia':{const u=rilevUrl(k);if(!u){toast('Collega prima i dati');return true}navigator.clipboard.writeText(u).then(()=>toast('Indirizzo per '+(k==='arrivo'?"l'arrivo":"l'uscita")+' copiato')).catch(()=>toast('Non riesco a copiare: tieni premuto e copia a mano'));return true}
  }
  return false;
}
// ---------- swipe tra le sezioni (stallo ↔ Lavoro ↔ Personale) ----------
(function(){
  let t=null;const EDGE=28;const v=()=>document.getElementById('view');
  document.addEventListener('touchstart',e=>{t=null;if(e.touches.length!==1||!S.ready||sheetClose)return;const x=e.touches[0].clientX,w=window.innerWidth,sez=sezione();
    if(sez==='stallo'||(sez==='budget'&&x<EDGE)||(sez==='lavoro'&&x>w-EDGE))t={x,y:e.touches[0].clientY,sez,lock:null,dx:0}},{passive:true,capture:true});
  document.addEventListener('touchmove',e=>{if(!t)return;const dx=e.touches[0].clientX-t.x,dy=e.touches[0].clientY-t.y;
    if(t.lock===null){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;t.lock=Math.abs(dx)>Math.abs(dy)*1.1?'x':'y'}if(t.lock!=='x')return;
    const ok=t.sez==='stallo'||(t.sez==='budget'&&dx>0)||(t.sez==='lavoro'&&dx<0);if(!ok)return;e.preventDefault();e.stopPropagation();t.dx=dx;const el=v();el.style.transition='none';el.style.transform=`translateX(${dx}px)`;el.style.opacity=String(1-Math.min(.6,Math.abs(dx)/600))},{passive:false,capture:true});
  const end=()=>{if(!t)return;const s=t;t=null;const el=v();if(s.lock!=='x'){return}
    const go=Math.abs(s.dx)>window.innerWidth*0.22;const dest=!go?null:s.sez==='stallo'?(s.dx>0?'lavoro':'home'):'stallo';
    el.style.transition='transform .25s ease, opacity .25s ease';
    if(!dest){el.style.transform='';el.style.opacity='';setTimeout(()=>{el.style.transition=''},260);return}
    el.style.transform=`translateX(${s.dx>0?'100%':'-100%'})`;el.style.opacity='0';
    setTimeout(()=>{if(dest==='lavoro'||dest==='home'){const t2=today();S.anno=t2.getFullYear();S.mese=t2.getMonth()+1}location.hash='#'+dest;el.style.transition='none';el.style.transform=`translateX(${s.dx>0?'-30%':'30%'})`;el.style.opacity='0';
      requestAnimationFrame(()=>{el.style.transition='transform .25s ease, opacity .25s ease';el.style.transform='';el.style.opacity='';setTimeout(()=>{el.style.transition=''},260)})},230)};
  document.addEventListener('touchend',end,{passive:true,capture:true});document.addEventListener('touchcancel',()=>{t=null},{passive:true,capture:true});
})();
