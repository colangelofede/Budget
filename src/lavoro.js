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
function lHm(m){m=Math.round(+m||0);return lpad(Math.floor(m/60))+':'+lpad(m%60)}
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
// Fasce di una giornata da segmenti in minuti {s,e,via,pausa} (0–1440: le ore dopo mezzanotte contano sul giorno dopo).
// Regole: 22–06 sempre +70%; le ordinarie (8 h nei feriali) si prendono solo dalle ore di giorno, in ordine di orario;
// feriale: poi 2 h +30% e oltre +40%; sabato: prime 8 h di giorno +50%, poi +70%; domenica e festivi tutto +70%. Viaggio = lavoro.
// Arrotondamento come la timbratura: inizio al quarto d'ora successivo, fine al quarto d'ora precedente;
// in sede (feriale) un anticipo sull'orario standard conta solo se è di almeno 30 minuti (7:44 → 8:00, 7:29 → 7:30).
function lArrotonda(segs,p,tg,sede){const a=Math.max(1,+p.arrot||15),std=lMin(p.entrata)??480;
  return (segs||[]).map(g=>{let s=g.s;if(sede&&!g.via&&tg==='feriale'&&s<std&&std-s<30)s=std;else s=Math.ceil(s/a)*a;
    const e=Math.floor(g.e/a)*a;return Object.assign({},g,{s,e})}).filter(g=>g.e>g.s)}
function lFasceSeg(iso,segs,p,sede){
  const tg=lTipoG(iso);const z={ord:0,s30:0,s40:0,s50:0,s70:0,lav:0,via:0,conta:[]};if(!segs||!segs.length)return z;
  segs=lArrotonda(segs,p,tg,sede!==false);if(!segs.length)return z;
  const ps=lMin(p.pausainizio)??735;const fl=new Uint8Array(1440);
  // pausa: lavoro dalle pausainizio; viaggio dalle pausainizio se il viaggio la comprende, altrimenti a metà viaggio
  segs.forEach(g=>{const pz=+g.pausa||0,w0=!g.via||(g.s<=ps&&ps<g.e)?ps:Math.floor((g.s+g.e-pz)/2),a=Math.max(0,g.s),b=Math.min(1440,g.e);for(let t=a;t<b;t++){if(pz&&t>=w0&&t<w0+pz)continue;fl[t]=g.via?2:1}});
  const m={ord:0,s30:0,s40:0,s50:0,s70:0};let w=0,lav=0,via=0;
  for(let t=0;t<1440;t++){if(!fl[t])continue;if(fl[t]===2)via++;else lav++;const night=t>=1320||t<360;
    if(tg==='feriale'){if(night)m.s70++;else{if(w<480)m.ord++;else if(w-480<120)m.s30++;else m.s40++;w++}}
    else if(tg==='sabato'){if(night)m.s70++;else{if(w<480)m.s50++;else m.s70++;w++}}
    else m.s70++}
  const a=Math.max(1,+p.arrot||1),f=x=>Math.floor(x/a)*a/60;
  return {ord:m.ord/60,s30:f(m.s30),s40:f(m.s40),s50:f(m.s50),s70:f(m.s70),lav:lav/60,via:via/60,conta:segs};
}
// segmento da due orari: se la fine è prima dell'inizio passa la mezzanotte (e > 1440)
function lSeg(a,b,via,pausa){const s=lMin(a),e=lMin(b);if(s==null||e==null||s===e)return null;return {s,e:e<s?e+1440:e,via:!!via,pausa:+pausa||0}}
// "07:00-10:00/30;21:00-03:30" → [[partenza, arrivo, pausa]]
// viaggio ancora aperto ("07:00-", dal pulsante Parto): arrivo vuoto, non conta finché non arrivi
function lViaggi(str){return String(str||'').split(/[;,]/).map(x=>x.match(/(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})?(?:\s*\/\s*(\d+))?/)).filter(Boolean).map(m=>[m[1].replace('.',':'),m[2]?m[2].replace('.',':'):'',+m[3]||0])}
// segmenti propri di una riga del foglio Ore (lavoro + viaggi), con le parti oltre mezzanotte
function lSegRiga(r,p,tg){const out=[];if(!r||(r.tipo&&r.tipo!=='lavoro')||lavBool(r.manuale))return out;
  if(r.entrata&&r.uscita){const x=lSeg(r.entrata,r.uscita,false,r.pausa==null||r.pausa===''?(tg==='feriale'?p.pausa:0):r.pausa);if(x)out.push(x)}
  lViaggi(r.viaggi).forEach(([a,b,pz])=>{const x=lSeg(a,b,true,pz);if(x)out.push(x)});return out}
// parti dopo mezzanotte del giorno prima
function lRiporto(D,iso){const d=lDate(iso);d.setDate(d.getDate()-1);const pi=lIso(d.getFullYear(),d.getMonth()+1,d.getDate());
  const r=((D&&D.ore)||[]).find(x=>x.id===pi);if(!r)return [];const pp=lavPar(D,d.getFullYear(),d.getMonth()+1);
  return lSegRiga(r,pp,lTipoG(pi)).filter(x=>x.e>1440).map(x=>({s:0,e:x.e-1440,via:x.via,pausa:0}))}
function lFasce(iso,entrata,uscita,pausa,p,sede){const x=lSeg(entrata,uscita,false,pausa);return lFasceSeg(iso,x?[x]:[],p,sede)}
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
    g.viaggi=r.viaggi||'';
    if(g.manuale){g.s30=+r.s30||0;g.s40=+r.s40||0;g.s50=+r.s50||0;g.s70=+r.s70||0;g.ord=tg==='feriale'?8:0;return g}
    // orari di lavoro + viaggi del giorno + parti dopo mezzanotte del giorno prima
    const own=lSegRiga(r,p,tg),rip=lRiporto(D,iso);g.riporto=rip;
    if(own.length||rip.length)Object.assign(g,lFasceSeg(iso,own.concat(rip),p,!g.trasf));
    else if(g.trasf&&g.extra!=null){Object.assign(g,lFasceExtra(iso,g.extra,g.notte));g.ord=tg==='feriale'?8:0}
    if(g.trasf&&!own.length&&g.extra==null)g.daCompilare=!futuro&&!oggi;
    return g;
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
  const t={s30:0,s40:0,s50:0,s70:0,mensa:0,trasf:{itg:0,itn:0,eu:0,extra:0,rischio:0},lavorati:0,lavorativi:0,via:0,prev:{s30:0,s40:0,s50:0,s70:0,mensa:0},daConf:0,daCompilare:0,ferie:0,rol:0};
  for(let g=1;g<=lDim(anno,mese);g++){const iso=lIso(anno,mese,g);const x=lavGiorno(D,iso,oi);giorni.push(x);
    if(x.tg==='feriale')t.lavorativi++;
    if(x.tipo==='ferie')t.ferie+=x.assOre;if(x.tipo==='rol')t.rol+=x.assOre;
    if(x.tipo!=='lavoro')continue;
    const prevista=x.stato==='previsto'||x.stato==='oggi';
    ['s30','s40','s50','s70'].forEach(k=>{t[k]+=x[k];if(prevista)t.prev[k]+=x[k]});t.via+=x.via||0;
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
if(typeof module!=='undefined')module.exports={lFasceSeg,lSeg,lViaggi,lRiporto,lavGiorno,lavMese,lavBusta,lavPar,lFasce,lFasceExtra,lFestivi,lTipoG,lavSaldi,stimaNettoLav,LAV_PAR0};
