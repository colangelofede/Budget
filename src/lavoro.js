// Motore della sezione Lavoro: giornate, fasce di straordinario, trasferte, busta stimata, ferie e ROL.
// Regole (CONTESTO-APP-BUDGET.md): orario lun–ven 08:00–17:15, pausa 12:15–13:30; straordinario feriale +30% fino a 10 h,
// +40% oltre; sabato +50% prime 8 h, poi +70%; domenica e festivi +70%; 22:00–06:00 sempre +70%.
// Busta del mese M = ore del mese M, accredito il 9 del mese M+1.
// [chiave, nome, descrizione, sigla per il calendario]
const LAV_TRASF=[['itg','IT giorno','In Italia, rientro a casa in giornata','IT'],['itn','IT notte','In Italia, almeno una notte fuori','IT N'],['eu','EU','Unione Europea, almeno una notte','EU'],['extra','Australia/Americhe','Australia, Nord e Sud America, almeno una notte','AME'],['rischio','Extra EU','Tutti gli altri paesi fuori dall\'UE, almeno una notte','EXTRA']];
const LAV_TIPI=[['lavoro','Lavoro'],['ferie','Ferie'],['rol','ROL'],['permesso','Permesso'],['malattia','Malattia'],['congedo','Congedo'],['festivo','Festivo']];
// Parametri della busta (dalla busta di Settembre 2026). Una riga del foglio "Lavoro" vale dal mese "dal" in poi.
const LAV_PAR0={dal:'2000-01',paga:20.66717,minimo:2370.33,premio:37.18,mensa:2.72,indmensa:1.34,cometa:1.2,ivs:9.19,cigs:0.3,
  addiz:144.14,addizmesi:'1-11',esenteit:0,esenteest:25.82,ivsagg:1,ivsaggsoglia:4685,arrot:15,itg:22,itn:39,eu:49,extra:65,rischio:75,feriemese:14,rolmese:8.66667,
  entrata:'08:00',uscita:'17:15',pausa:30,pausainizio:'12:15',sedelat:null,sedelon:null,raggio:1};
const LAV_NUM=['esenteit','esenteest','ivsagg','ivsaggsoglia','paga','minimo','premio','mensa','indmensa','cometa','ivs','cigs','addiz','arrot','itg','itn','eu','extra','rischio','feriemese','rolmese','pausa','sedelat','sedelon','raggio'];
// Scaglioni IRPEF mensili 2026 (23% fino a 28.000, 33% fino a 50.000, 43% oltre), verificati sulle buste Lug–Set 2026
const LAV_IRPEF=[[28000/12,.23],[50000/12,.33],[Infinity,.43]];

function lr2(x){return Math.round((x+Number.EPSILON)*100)/100}
function lpad(n){return String(n).padStart(2,'0')}
function lIso(y,m,g){return y+'-'+lpad(m)+'-'+lpad(g)}
function lDate(iso){const [y,m,g]=iso.split('-').map(Number);return new Date(y,m-1,g)}
function lDim(y,m){return new Date(y,m,0).getDate()}
function lMin(t){if(t==null||t==='')return null;const m=String(t).match(/^(\d{1,2})[:.,](\d{2})/);if(!m)return null;return +m[1]*60+ +m[2]}
function lHHMM(min){min=((min%1440)+1440)%1440;return lpad(Math.floor(min/60))+':'+lpad(min%60)}
function lYm(y,m){return y+'-'+lpad(m)}
// Pasqua (gregoriana)
function lPasqua(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);const mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
const _fest={};
// Festivi nazionali + San Francesco (dal 2026) + patrono di Paruzzaro (San Siro, 9 dicembre)
function lFestivi(y){if(_fest[y])return _fest[y];const s={};const add=(m,g,n)=>{s[lIso(y,m,g)]=n};
  add(1,1,'Capodanno');add(1,6,'Epifania');add(4,25,'Liberazione');add(5,1,'Festa del lavoro');add(6,2,'Festa della Repubblica');add(8,15,'Ferragosto');
  if(y>=2026)add(10,4,'San Francesco');add(11,1,'Ognissanti');add(12,8,'Immacolata');add(12,9,'San Siro, patrono');add(12,25,'Natale');add(12,26,'Santo Stefano');
  const p=lPasqua(y),pm=new Date(p.getFullYear(),p.getMonth(),p.getDate()+1);add(p.getMonth()+1,p.getDate(),'Pasqua');add(pm.getMonth()+1,pm.getDate(),'Lunedì dell\'Angelo');
  return _fest[y]=s}
function lFestivo(iso){return lFestivi(+iso.slice(0,4))[iso]||null}
// 'feriale' | 'sabato' | 'festivo'
function lTipoG(iso){const d=lDate(iso),w=d.getDay();if(w===0||lFestivo(iso))return 'festivo';if(w===6)return 'sabato';return 'feriale'}

// parametri validi per il mese
function lavPar(D,anno,mese){const ym=lYm(anno,mese);const rows=((D&&D.lavoro)||[]).filter(r=>r.dal&&r.dal<=ym).sort((a,b)=>a.dal<b.dal?-1:1);
  const p=Object.assign({},LAV_PAR0);rows.forEach(r=>{Object.keys(r).forEach(k=>{if(k==='id'||k==='dal')return;const v=r[k];if(v===null||v===undefined||v==='')return;p[k]=LAV_NUM.includes(k)?+v:v})});return p}
function lAddizMese(p,mese){const s=String(p.addizmesi||'');return s.split(/[,;\s]+/).filter(Boolean).some(t=>{const r=t.split('-').map(Number);return r.length===2?mese>=r[0]&&mese<=r[1]:mese===r[0]})}

// Divide le ore lavorate nelle fasce, minuto per minuto. Ritorna ore decimali.
function lFasce(iso,entrata,uscita,pausa,p){
  const E=lMin(entrata),U0=lMin(uscita);const z={ord:0,s30:0,s40:0,s50:0,s70:0,lav:0};if(E==null||U0==null)return z;
  let U=U0;if(U<=E)U+=1440;const tg=lTipoG(iso);const ps=lMin(p.pausainizio)??735,pe=ps+(+pausa||0);
  const m={ord:0,s30:0,s40:0,s50:0,s70:0};let w=0;
  for(let t=E;t<U;t++){if(pausa&&t>=ps&&t<pe)continue;const tod=t%1440,night=tod>=1320||tod<360;
    if(tg==='feriale'){if(w<480)m.ord++;else{const k=w-480;if(night)m.s70++;else if(k<120)m.s30++;else m.s40++}}
    else if(tg==='sabato'){if(night||w>=480)m.s70++;else m.s50++}
    else m.s70++;
    w++}
  const a=Math.max(1,+p.arrot||1),fl=x=>Math.floor(x/a)*a/60;
  return {ord:m.ord/60,s30:fl(m.s30),s40:fl(m.s40),s50:fl(m.s50),s70:fl(m.s70),lav:w/60};
}
// Straordinario inserito a numero (trasferta): ore oltre le 8 (feriale) o ore lavorate (sabato/festivi), di cui notturne
function lFasceExtra(iso,ore,notte){const tg=lTipoG(iso);ore=Math.max(0,+ore||0);notte=Math.min(ore,Math.max(0,+notte||0));const d=ore-notte;
  if(tg==='feriale')return {s30:Math.min(2,d),s40:Math.max(0,d-2),s50:0,s70:notte};
  if(tg==='sabato')return {s30:0,s40:0,s50:Math.min(8,d),s70:notte+Math.max(0,d-8)};
  return {s30:0,s40:0,s50:0,s70:ore}}

const lavBool=v=>v===true||String(v).toUpperCase()==='TRUE';
// Giornata effettiva: registrata, oppure ricostruita da timbrature o abitudine
function lavGiorno(D,iso,oggiIso){
  const p=lavPar(D,+iso.slice(0,4),+iso.slice(5,7));const r=((D&&D.ore)||[]).find(x=>x.id===iso);const tg=lTipoG(iso);const fest=lFestivo(iso);
  const futuro=iso>oggiIso,oggi=iso===oggiIso;
  const g={iso,tg,fest,p,rec:r||null,tipo:'lavoro',entrata:null,uscita:null,pausa:null,trasf:null,mensa:false,s30:0,s40:0,s50:0,s70:0,ord:0,stato:'',fonte:'',daCompilare:false,assOre:0,manuale:false};
  if(r){
    g.tipo=r.tipo||'lavoro';g.trasf=r.trasferta||null;g.mensa=lavBool(r.mensa);g.manuale=lavBool(r.manuale);g.entrata=r.entrata||null;g.uscita=r.uscita||null;g.pausa=r.pausa==null||r.pausa===''?null:+r.pausa;
    g.stato=lavBool(r.stima)?'stima':'ok';g.fonte='rec';g.assOre=+r.oreass||0;g.extra=r.extra==null||r.extra===''?null:+r.extra;g.notte=+r.notte||0;
    if(g.tipo!=='lavoro'){g.assOre=g.assOre||(tg==='feriale'?8:0);return g}
    if(g.manuale||g.trasf){
      if(g.trasf&&!g.manuale){if(g.extra==null){g.daCompilare=!futuro&&!oggi}else Object.assign(g,lFasceExtra(iso,g.extra,g.notte))}
      else{g.s30=+r.s30||0;g.s40=+r.s40||0;g.s50=+r.s50||0;g.s70=+r.s70||0}
      g.ord=tg==='feriale'?8:0;return g}
    const f=lFasce(iso,g.entrata,g.uscita,g.pausa??(tg==='feriale'?p.pausa:0),p);Object.assign(g,f);if(tg!=='feriale')g.ord=0;return g;
  }
  // timbrature del giorno (Comandi rapidi)
  const tb=((D&&D.timbrature)||[]).filter(x=>x.data===iso).sort((a,b)=>String(a.ora).localeCompare(String(b.ora)));
  const arr=tb.filter(x=>x.evento==='arrivo'),usc=tb.filter(x=>x.evento==='uscita');
  if(arr.length){g.entrata=String(arr[0].ora).slice(0,5);g.fonte='timbr';
    const ul=usc.filter(x=>String(x.ora)>String(arr[0].ora)).pop();g.uscita=ul?String(ul.ora).slice(0,5):(tg==='feriale'?p.uscita:null);
    g.stato=ul?'rilevata':'incorso';g.pausa=tg==='feriale'?p.pausa:0;g.mensa=tg==='feriale';
    if(g.uscita)Object.assign(g,lFasce(iso,g.entrata,g.uscita,g.pausa,p));if(tg!=='feriale')g.ord=0;return g}
  if(tg!=='feriale'){g.tipo='riposo';return g}
  // feriale senza dati: abitudine (passato = da confermare, futuro = previsto)
  g.entrata=p.entrata;g.uscita=p.uscita;g.pausa=p.pausa;g.mensa=true;g.fonte='abitudine';g.stato=futuro?'previsto':oggi?'oggi':'daconf';
  Object.assign(g,lFasce(iso,g.entrata,g.uscita,g.pausa,p));return g;
}
function lavOggiIso(oggi){return lIso(oggi.getFullYear(),oggi.getMonth()+1,oggi.getDate())}
// Riepilogo del mese e busta stimata
function lavMese(D,anno,mese,oggi){
  const oi=lavOggiIso(oggi||new Date());const p=lavPar(D,anno,mese);const giorni=[];
  const t={s30:0,s40:0,s50:0,s70:0,mensa:0,trasf:{itg:0,itn:0,eu:0,extra:0,rischio:0},lavorati:0,lavorativi:0,prev:{s30:0,s40:0,s50:0,s70:0,mensa:0},daConf:0,daCompilare:0,ferie:0,rol:0};
  for(let g=1;g<=lDim(anno,mese);g++){const iso=lIso(anno,mese,g);const x=lavGiorno(D,iso,oi);giorni.push(x);
    if(x.tg==='feriale')t.lavorativi++;
    if(x.tipo==='ferie')t.ferie+=x.assOre;if(x.tipo==='rol')t.rol+=x.assOre;
    if(x.tipo!=='lavoro')continue;
    const prevista=x.stato==='previsto'||x.stato==='oggi';
    ['s30','s40','s50','s70'].forEach(k=>{t[k]+=x[k];if(prevista)t.prev[k]+=x[k]});
    if(x.mensa){t.mensa++;if(prevista)t.prev.mensa++}
    if(x.trasf&&t.trasf[x.trasf]!=null)t.trasf[x.trasf]++;
    if(!prevista&&(x.ord>0||x.s30+x.s40+x.s50+x.s70>0||x.trasf))t.lavorati++;
    if(x.stato==='daconf')t.daConf++;if(x.daCompilare)t.daCompilare++}
  const voci=((D&&D.voci)||[]).filter(v=>+v.anno===anno&&+v.mese===mese);
  const b=lavBusta(p,t,voci,mese,{stima:true});
  return Object.assign({anno,mese,p,giorni,voci},t,{busta:b});
}
// Premio obiettivi = ore oltre quelle rappresentabili in busta: nella stima (opt.stima) è già contato nelle ore lavorate
function lObiettivi(v){return /obiettivi/i.test(String(v.descrizione||''))}
function lavBusta(p,t,voci,mese,opt){
  opt=opt||{};const ore=t.s30+t.s40+t.s50+t.s70;
  const straord=lr2(t.s30*p.paga*1.3)+lr2(t.s40*p.paga*1.4)+lr2(t.s50*p.paga*1.5)+lr2(t.s70*p.paga*1.7);
  const trasf=Object.keys(t.trasf).reduce((a,k)=>a+t.trasf[k]*(+p[k]||0),0);
  // parte esente delle trasferte: Italia fino a esenteit al giorno, estero fino a esenteest (vitto e alloggio forniti)
  const esente=lr2(Object.keys(t.trasf).reduce((a,k)=>{const lim=(k==='itg'||k==='itn')?p.esenteit:p.esenteest;return a+t.trasf[k]*Math.min(+p[k]||0,+lim||0)},0));
  const obiettivi=voci.filter(v=>+v.importo>0&&lObiettivi(v)).reduce((a,v)=>a+ +v.importo,0);
  const vv=opt.stima?voci.filter(v=>!lObiettivi(v)):voci;
  const premi=vv.filter(v=>+v.importo>0).reduce((a,v)=>a+ +v.importo,0),tratt=vv.filter(v=>+v.importo<0).reduce((a,v)=>a- +v.importo,0);
  const noinps=vv.filter(v=>+v.importo>0&&lavBool(v.noinps)).reduce((a,v)=>a+ +v.importo,0);
  const base=lr2(p.paga*173);
  const comp=lr2(base+straord+trasf+p.premio+p.indmensa+premi);
  const inps=Math.round(comp-tratt-noinps-esente);const ivs=lr2(inps*p.ivs/100),cigs=lr2(inps*p.cigs/100),cometa=lr2(p.minimo*p.cometa/100);
  const ivsagg=lr2(Math.max(0,inps-(+p.ivsaggsoglia||Infinity))*(+p.ivsagg||0)/100);
  const imp=lr2(comp-tratt-esente-ivs-ivsagg-cigs-cometa);let irpef=0,prev=0;LAV_IRPEF.forEach(([lim,al])=>{if(imp>prev)irpef+=(Math.min(imp,lim)-prev)*al;prev=lim});irpef=lr2(irpef);
  const addiz=lAddizMese(p,mese)?+p.addiz||0:0,mensa=lr2(t.mensa*p.mensa);
  const netto=lr2(comp-tratt-ivs-ivsagg-cigs-cometa-irpef-addiz-mensa);
  return {base,straord:lr2(straord),trasf:lr2(trasf),esente,premio:p.premio,indmensa:p.indmensa,premi:lr2(premi),obiettivi:lr2(obiettivi),tratt:lr2(tratt),lordo:comp,inps,ivs,ivsagg,cigs,cometa,imp,irpef,addiz,mensa,netto,ore};
}
// Netto stimato per il Budget (calc.js): solo dai mesi in cui l'app tiene le ore
function lavPrimoMese(D){const o=((D&&D.ore)||[]).map(x=>x.id).filter(Boolean).sort();return o.length?o[0].slice(0,7):null}
function stimaNettoLav(D,anno,mese,oggi){const pm=lavPrimoMese(D);if(!pm)return null;oggi=oggi||new Date();
  const cur=lYm(oggi.getFullYear(),oggi.getMonth()+1),ym=lYm(anno,mese);if(ym<pm)return null;if(anno>oggi.getFullYear()+1)return null;
  const m=lavMese(D,anno,mese,oggi);return {netto:m.busta.netto,lordo:m.busta.lordo}}
// Ferie e ROL: saldo dall'ultima busta + maturazione − goduti/pianificati dopo
function lavSaldi(D,anno,mese,oggi){
  const s=((D&&D.saldi)||[]).filter(x=>x.ferie!=null&&x.rol!=null).slice().sort((a,b)=>(a.anno*100+ +a.mese)-(b.anno*100+ +b.mese));
  const ref=s.filter(x=>x.anno*100+ +x.mese<=anno*100+mese).pop()||s[0];if(!ref)return null;
  const oi=lavOggiIso(oggi||new Date());let fe=+ref.ferie,ro=+ref.rol;let y=+ref.anno,m=+ref.mese;
  while(y*100+m<anno*100+mese){m++;if(m>12){m=1;y++}const p=lavPar(D,y,m);fe+=p.feriemese;ro+=p.rolmese;
    for(let g=1;g<=lDim(y,m);g++){const x=lavGiorno(D,lIso(y,m,g),oi);if(x.tipo==='ferie')fe-=x.assOre;if(x.tipo==='rol')ro-=x.assOre}}
  return {ferie:lr2(fe),rol:lr2(ro),ref}
}
if(typeof module!=='undefined')module.exports={lavGiorno,lavMese,lavBusta,lavPar,lFasce,lFasceExtra,lFestivi,lTipoG,lavSaldi,stimaNettoLav,LAV_PAR0};
