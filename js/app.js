
const periods=[["last10","Últimos 10",10,.50],["last5","Últimos 5",5,.20],["condition5","Últimos 5 condición",5,.30]];
const metrics=[
["gf","GF"],["ga","GA"],["xg","xG"],["xga","xGA"],
["shots","Tiros"],["sot","Tiros al arco"],["sa","Tiros recibidos"],
["sota","Tiros al arco recibidos"],["bc","Ocasiones claras"],["bca","Ocasiones concedidas"]
];
const markets=[
["GANADORES","home","Local"],["GANADORES","draw","Empate"],["GANADORES","away","Visitante"],
["GANADORES","homeDnb","Local sin empate (DNB)"],["GANADORES","awayDnb","Visitante sin empate (DNB)"],
["GANADORES","homeOrDraw","Local o Empate (1X)"],["GANADORES","awayOrDraw","Visitante o Empate (X2)"],
["GOLES","over15","Over 1.5"],["GOLES","under15","Under 1.5"],
["GOLES","over25","Over 2.5"],["GOLES","under25","Under 2.5"],
["GOLES","over35","Over 3.5"],["GOLES","under35","Under 3.5"],
["GOLES","home05","Local Over 0.5"],["GOLES","home15","Local Over 1.5"],
["GOLES","away05","Visitante Over 0.5"],["GOLES","away15","Visitante Over 1.5"],
["AMBOS MARCAN","bttsYes","BTTS Sí"],["AMBOS MARCAN","bttsNo","BTTS No"]
];

function parseQuickMatchLine(line){
 const cleaned=line.trim().replace(/(\d),(\d)/g,'$1.$2').replace(/;/g,' ');const t=cleaned.split(/\s+/).filter(Boolean);if(t.length<12)return null;
 const p=Number(String(t[0]).replace(/^P/i,'')),cond=String(t[1]).toUpperCase();if(!Number.isFinite(p)||!['L','V'].includes(cond))return null;
 const nums=t.slice(2,12).map(Number);if(nums.some(x=>!Number.isFinite(x)))return null;
 return {p,cond,gf:nums[0],ga:nums[1],xg:nums[2],xga:nums[3],shots:nums[4],sot:nums[5],sa:nums[6],sota:nums[7],bc:nums[8],bca:nums[9]};
}
function sumQuickRows(rows){const out={};for(const [k] of metrics)out[k]=rows.reduce((a,r)=>a+Number(r[k]||0),0);return out}
function fillPeriod(side,period,obj){for(const [k] of metrics){const el=document.querySelector(`[data-team="${side}"][data-period="${period}"][data-key="${k}"]`);if(el)el.value=(['xg','xga'].includes(k)?Number(obj[k]).toFixed(2):String(Math.round(obj[k])));}}
function applyQuickMatches(side){
 const raw=document.getElementById('quick-'+side)?.value||'',rows=raw.split(/\n/).map(parseQuickMatchLine).filter(Boolean).sort((a,b)=>a.p-b.p);
 if(rows.length<10)return alert('Se necesitan al menos P1–P10 válidos.');
 const last10=rows.filter(r=>r.p<=10).slice(0,10),last5=rows.filter(r=>r.p<=5).slice(0,5),need=side==='home'?'L':'V',condition=rows.filter(r=>r.cond===need).slice(0,5);
 if(last10.length<10||last5.length<5)return alert('Faltan partidos para Últimos 10 o Últimos 5.');
 if(condition.length<5)return alert(`Faltan partidos ${need} para completar los 5 de condición. Añade P11/P12 si hace falta.`);
 fillPeriod(side,'last10',sumQuickRows(last10));fillPeriod(side,'last5',sumQuickRows(last5));fillPeriod(side,'condition5',sumQuickRows(condition));queueDraftSave();
}
function calcRestFromDate(side){const d=document.querySelector(`[data-team="${side}"][data-key="lastMatchDate"]`)?.value,match=document.getElementById('date')?.value;if(!d||!match)return;const days=Math.max(0,Math.round((new Date(match+'T12:00:00')-new Date(d+'T12:00:00'))/86400000));const el=document.querySelector(`[data-team="${side}"][data-key="restCurrent"]`);if(el)el.value=days;queueDraftSave();}
function normOddsKey(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').replace(/,/g,'.')}
function applyQuickOdds(){
 const raw=document.getElementById('quickOdds')?.value||'';const map={'1':'home','x':'draw','2':'away','1dnb':'homeDnb','dnb1':'homeDnb','2dnb':'awayDnb','dnb2':'awayDnb','1x':'homeOrDraw','x2':'awayOrDraw','o1.5':'over15','over1.5':'over15','u1.5':'under15','under1.5':'under15','o2.5':'over25','over2.5':'over25','u2.5':'under25','under2.5':'under25','o3.5':'over35','over3.5':'over35','u3.5':'under35','under3.5':'under35','localo0.5':'home05','localover0.5':'home05','localo1.5':'home15','localover1.5':'home15','visitanteo0.5':'away05','visitanteover0.5':'away05','visitanteo1.5':'away15','visitanteover1.5':'away15','bttssi':'bttsYes','bttsyes':'bttsYes','bttsno':'bttsNo'};
 let n=0;for(const line of raw.split(/\n/)){const m=line.match(/^\s*(.+?)\s*[:=]\s*([0-9]+(?:[.,][0-9]+)?)\s*$/);if(!m)continue;const key=map[normOddsKey(m[1])],val=Number(m[2].replace(',','.'));if(!key||!Number.isFinite(val))continue;const el=document.querySelector(`[data-odd="${key}"]`);if(el){el.value=val.toFixed(2);n++;}}
 queueDraftSave();if(!n)alert('No reconocí cuotas. Usa etiquetas como 1, X, 2, 1X, X2, O2.5, U2.5, BTTS Sí.');
}

function build(){
let tc=document.getElementById("teamCards"); tc.innerHTML="";
for(const [side,title] of [["home","🏠 Local"],["away","✈️ Visitante"]]){
const conditionLabel=side==="home"?"Últimos 5 en casa":"Últimos 5 fuera";
let h=`<div class="card"><h2>${title}</h2>
<div class="note" style="margin-bottom:10px"><b>⚡ Pegado rápido P1–Pn</b><br><span class="small">Formato: P# L/V GF GA xG xGA Tiros TirosArco TirosRec TirosArcoRec Ocasiones OcasionesConc. P1 = más reciente. Puedes incluir P11/P12 para completar la condición.</span><textarea id="quick-${side}" placeholder="P1 L 1 0 1.45 0.80 14 5 9 3 3 1
P2 V 0 1 0.90 1.20 10 3 12 4 2 2"></textarea><button type="button" class="secondary" style="margin-top:6px" onclick="applyQuickMatches('${side}')">Calcular Últ.10 / 5 / condición</button></div>
<table><tr><th>Métrica</th><th>Últimos 10<br><span class="muted">50% · n=10</span></th><th>Últimos 5<br><span class="muted">20% · n=5</span></th><th>${conditionLabel}<br><span class="muted">30% · n=5</span></th></tr>`;
for(const [k,l] of metrics){
h+=`<tr><td>${l}</td>${periods.map(p=>`<td><input data-team="${side}" data-period="${p[0]}" data-key="${k}" type="number" step=".01"></td>`).join("")}</tr>`;
}
h+=`</table>
<div class="grid" style="margin-top:10px">
<label>Días de descanso<input data-team="${side}" data-key="restCurrent" type="number" min="0" step="1" placeholder="Ej.: 7"></label>
<label>Fecha último partido <span class="muted">(opcional)</span><input data-team="${side}" data-key="lastMatchDate" type="date" onchange="calcRestFromDate('${side}')"></label>
</div>
<p class="small muted">Totales acumulados en cada ventana. Puedes escribir el descanso o calcularlo desde la fecha del último partido.</p></div>`;
tc.innerHTML+=h;
}
document.getElementById("odds").innerHTML=`
${markets.map(x=>`<div class="grid" style="margin:6px 0"><label class="full">${x[0]} · ${x[2]}<input data-odd="${x[1]}" type="number" min="1.01" step=".01" placeholder="Cuota"></label></div>`).join("")}
<div class="card" style="box-shadow:none;background:#f2f2f2">
<h3 style="margin:0 0 8px">HÁNDICAP · 1X2 europeo</h3>
<p class="small muted" style="margin-top:0">Sin hándicap asiático. En cada línea hay tres resultados: <b>1 · X · 2</b>. No existe PUSH. <b>Las cuotas vacías se ignoran por completo.</b></p>
<div class="card" style="box-shadow:none;background:#fff;margin:8px 0">
<b>Local +1 / Visitante -1</b>
<div class="grid" style="margin-top:6px">
<label>1 · Local +1<input data-eh-line="1" data-eh-outcome="home" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
<label>X · Empate +1<input data-eh-line="1" data-eh-outcome="draw" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
<label class="full">2 · Visitante -1<input data-eh-line="1" data-eh-outcome="away" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
</div></div>
<div class="card" style="box-shadow:none;background:#fff;margin:8px 0">
<b>Local -1 / Visitante +1</b>
<div class="grid" style="margin-top:6px">
<label>1 · Local -1<input data-eh-line="-1" data-eh-outcome="home" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
<label>X · Empate -1<input data-eh-line="-1" data-eh-outcome="draw" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
<label class="full">2 · Visitante +1<input data-eh-line="-1" data-eh-outcome="away" type="number" min="1.01" step=".01" placeholder="Cuota"></label>
</div></div>
<p class="small muted">Ejemplo: Local +1 con marcador real 0–1 produce 1–1 ajustado; gana <b>X</b> y la selección <b>1 · Local +1</b> pierde.</p>
</div>`;
renderAbsenceCards();
}
function syncAhLine(){}
build();
document.getElementById("date").value=new Date().toISOString().slice(0,10);

function renderAbsenceCards(){
const wrap=document.getElementById("absenceCards"); wrap.innerHTML="";
for(const [side,title] of [["home","🏠 Local"],["away","✈️ Visitante"]]){
wrap.innerHTML+=`<div class="card" style="box-shadow:none;background:#fff"><h3 style="margin:0 0 8px">${title}</h3><div class="grid"><label>Impacto ataque 0–100<input id="${side}AbsAtt" class="abs-aggregate" data-side="${side}" data-kind="att" type="number" min="0" max="100" step="1" value="0"></label><label>Impacto defensa 0–100<input id="${side}AbsDef" class="abs-aggregate" data-side="${side}" data-kind="def" type="number" min="0" max="100" step="1" value="0"></label></div><div id="${side}AbsSummary" class="small muted" style="margin-top:7px">Impacto general confirmado del equipo.</div></div>`;
}
document.querySelectorAll('.abs-aggregate').forEach(el=>el.addEventListener('input',queueDraftSave));
}
function clampImpact(v){return Math.max(0,Math.min(100,Number(v)||0))}
function getAbsenceImpact(side){return {att:clampImpact(document.getElementById(side+'AbsAtt')?.value),def:clampImpact(document.getElementById(side+'AbsDef')?.value)}}
function getAbsences(side){const x=getAbsenceImpact(side);return [{name:'Impacto agregado',status:'confirmed',att:x.att,def:x.def,aggregate:true}]}
function cappedImpact(arr,key){
 const agg=(arr||[]).find(x=>x?.aggregate);if(agg)return clampImpact(agg[key]);
 // Compatibilidad con backups anteriores jugador por jugador.
 const vals=(arr||[]).map(x=>clampImpact(x?.[key])).filter(v=>v>0).sort((a,b)=>b-a);
 if(!vals.length)return 0;const primary=vals[0];if(primary>=100)return 100;
 const secondary=vals.slice(1).reduce((sum,v)=>sum+v,0),breadth=1-Math.exp(-secondary/400);
 return Math.min(100,primary+(100-primary)*breadth);
}
function setAggregateAbsence(side,att,def){const a=document.getElementById(side+'AbsAtt'),d=document.getElementById(side+'AbsDef');if(a)a.value=Math.round(clampImpact(att));if(d)d.value=Math.round(clampImpact(def));}
function aggregateLegacyAbsences(rows){return {att:cappedImpact(rows||[], 'att'),def:cappedImpact(rows||[], 'def')}}

function getTeam(side){
let d={}; for(const p of periods){d[p[0]]={};for(const [k] of metrics){
let el=document.querySelector(`[data-team="${side}"][data-period="${p[0]}"][data-key="${k}"]`);
d[p[0]][k]=el&&el.value!==""?+el.value:null;
}}
const restEl=document.querySelector(`[data-team="${side}"][data-key="restCurrent"]`);
d.restCurrent=restEl&&restEl.value!==""?+restEl.value:null;
const dateEl=document.querySelector(`[data-team="${side}"][data-key="lastMatchDate"]`);d.lastMatchDate=dateEl?.value||null;
return d;
}
function perMatch(d,period,k){
const v=d?.[period]?.[k]; if(v==null)return null;
const n=periods.find(x=>x[0]===period)?.[2]||1;
return v/n;
}
function weightedPerMatch(d,k){
let arr=periods.map(p=>({period:p[0],n:p[2],w:p[3],v:d?.[p[0]]?.[k]})).filter(x=>x.v!=null);
if(!arr.length)return null;
const ws=arr.reduce((s,x)=>s+x.w,0);
return arr.reduce((s,x)=>s+(x.w/ws)*(x.v/x.n),0);
}
function currentRest(d){return d?.restCurrent==null?7:d.restCurrent}
function shrink(raw,alpha=.65){return 1+alpha*(raw-1)}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function expGoals(h,a,avg,absH,absA,opts={}){
const hXG=weightedPerMatch(h,"xg"),hGF=weightedPerMatch(h,"gf"),hXGA=weightedPerMatch(h,"xga"),hGA=weightedPerMatch(h,"ga");
const aXG=weightedPerMatch(a,"xg"),aGF=weightedPerMatch(a,"gf"),aXGA=weightedPerMatch(a,"xga"),aGA=weightedPerMatch(a,"ga");
const isCup=opts.mode==="cup";
const avgH=isCup?clamp(Number(opts.homeLeagueAvg)||avg,.50,3.50):avg;
const avgA=isCup?clamp(Number(opts.awayLeagueAvg)||avg,.50,3.50):avg;
function attack(xg,gf,base){let vals=[xg,gf].filter(v=>v!=null);if(!vals.length)return {raw:1,shrunk:1,source:"default"};let raw=vals.length===2?.7*(vals[0]/base)+.3*(vals[1]/base):vals[0]/base;return {raw,shrunk:shrink(raw),source:vals.length===2?"70% xG / 30% GF":"available metric"}}
function defense(xga,ga,base){let vals=[xga,ga].filter(v=>v!=null);if(!vals.length)return {raw:1,shrunk:1,source:"default"};let raw=vals.length===2?.7*(vals[0]/base)+.3*(vals[1]/base):vals[0]/base;return {raw,shrunk:shrink(raw),source:vals.length===2?"70% xGA / 30% GA":"available metric"}}
const Hatt=attack(hXG,hGF,avgH),Aatt=attack(aXG,aGF,avgA),Hdef=defense(hXGA,hGA,avgH),Adef=defense(aXGA,aGA,avgA);
const restH=currentRest(h),restA=currentRest(a);
const homeVenue=1.08,awayVenue=.96;
const restHF=1+clamp(restH-7,-3,3)*.01,restAF=1+clamp(restA-7,-3,3)*.01;
const absenceHAtt=1-.085*(absH.att/100),absenceAAtt=1-.085*(absA.att/100);
const absenceHDef=1+.085*(absH.def/100),absenceADef=1+.085*(absA.def/100);
// V1.7.1: regularización del λ. La defensa rival y la localía siguen influyendo,
// pero ya no pueden multiplicar sin límite práctico un ataque propio mediocre.
const ownAttackH=avgH*Hatt.shrunk;
const ownAttackA=avgA*Aatt.shrunk;
const structuralH=ownAttackH*Adef.shrunk*homeVenue;
const structuralA=ownAttackA*Hdef.shrunk*awayVenue;
const lambdaRegularization=.55;
const regularizedH=ownAttackH+lambdaRegularization*(structuralH-ownAttackH);
const regularizedA=ownAttackA+lambdaRegularization*(structuralA-ownAttackA);
// V1.7.1 · Solo Copas: índice interliga = 70% fuerza de liga + 30% nivel relativo del equipo.
// El ajuste es simétrico, moderado y limitado a ±12%; en Liga queda exactamente en 1.000.
const parsedHLS=Number(opts.homeLeagueStrength),parsedALS=Number(opts.awayLeagueStrength),parsedHTS=Number(opts.homeTeamStrength),parsedATS=Number(opts.awayTeamStrength);
const leagueStrengthH=isCup?clamp(Number.isFinite(parsedHLS)?parsedHLS:50,0,100):50;
const leagueStrengthA=isCup?clamp(Number.isFinite(parsedALS)?parsedALS:50,0,100):50;
const teamStrengthH=isCup?clamp(Number.isFinite(parsedHTS)?parsedHTS:50,0,100):50;
const teamStrengthA=isCup?clamp(Number.isFinite(parsedATS)?parsedATS:50,0,100):50;
const interIndexH=.70*leagueStrengthH+.30*teamStrengthH;
const interIndexA=.70*leagueStrengthA+.30*teamStrengthA;
const interDiff=isCup?interIndexH-interIndexA:0;
const interAdj=clamp(interDiff*.0035,-.12,.12);
const interFactorH=1+interAdj,interFactorA=1-interAdj;
const interleagueH=regularizedH*interFactorH,interleagueA=regularizedA*interFactorA;
// V1.7.1 · Contexto eliminatoria: solo la VUELTA altera λ. El equipo que va perdiendo
// recibe +4% de urgencia si necesita 1 gol y +8% si necesita 2 o más. No se premia al líder
// con una reducción artificial: se mantiene en 1.000 para no sobreajustar el contragolpe.
let aggregateFactorH=1,aggregateFactorA=1,aggregateDeficitH=0,aggregateDeficitA=0;
const cc=opts.cupContext||null;
if(isCup&&cc?.leg==="second"){
  const gh=Number(cc.aggHome)||0,ga=Number(cc.aggAway)||0;
  aggregateDeficitH=Math.max(0,ga-gh); aggregateDeficitA=Math.max(0,gh-ga);
  aggregateFactorH=aggregateDeficitH>=2?1.08:aggregateDeficitH===1?1.04:1;
  aggregateFactorA=aggregateDeficitA>=2?1.08:aggregateDeficitA===1?1.04:1;
}
const tacticalH=interleagueH*aggregateFactorH,tacticalA=interleagueA*aggregateFactorA;
// V1.8.0 · las dos vías de bajas (ataque propio + defensa rival) se combinan con tope,
// evitando amplificar dos veces un mismo contexto de ausencias.
const absenceComboH=clamp(absenceHAtt*absenceADef,.88,1.12);
const absenceComboA=clamp(absenceAAtt*absenceHDef,.88,1.12);
const finalH=clamp(tacticalH*absenceComboH*restHF,.20,3.50);
const finalA=clamp(tacticalA*absenceComboA*restAF,.20,3.50);
return {hl:finalH,al:finalA,diag:{Hatt,Aatt,Hdef,Adef,restH,restA,homeVenue,awayVenue,restHF,restAF,absenceHAtt,absenceAAtt,absenceHDef,absenceADef,absenceComboH,absenceComboA,ownAttackH,ownAttackA,structuralH,structuralA,regularizedH,regularizedA,lambdaRegularization,leagueStrengthH,leagueStrengthA,teamStrengthH,teamStrengthA,interIndexH,interIndexA,interDiff,interFactorH,interFactorA,interleagueH,interleagueA,aggregateFactorH,aggregateFactorA,aggregateDeficitH,aggregateDeficitA,tacticalH,tacticalA,mode:isCup?"cup":"league",avgH,avgA,cupContext:opts.cupContext||null,baseH:structuralH,baseA:structuralA}};
}
function pois(k,l){return Math.exp(-l)*Math.pow(l,k)/factorial(k)}
function factorial(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function scoreMatrix(hl,al){
let m=[];for(let h=0;h<=10;h++)for(let a=0;a<=10;a++)m.push([h,a,pois(h,hl)*pois(a,al)]);
return m;
}
function probs(hl,al){
let m=scoreMatrix(hl,al);
let p={home:0,draw:0,away:0,bttsYes:0};
m.forEach(([h,a,v])=>{if(h>a)p.home+=v;else if(h===a)p.draw+=v;else p.away+=v;if(h&&a)p.bttsYes+=v});
p.bttsNo=1-p.bttsYes;
for(let [k,t] of [["15",2],["25",3],["35",4]]){p["over"+k]=m.filter(x=>x[0]+x[1]>=t).reduce((s,x)=>s+x[2],0);p["under"+k]=1-p["over"+k]}
let nd=1-p.draw;p.homeDnb=p.home/nd;p.awayDnb=p.away/nd;
p.homeOrDraw=p.home+p.draw;p.awayOrDraw=p.away+p.draw;
p.home05=1-pois(0,hl);p.home15=1-(pois(0,hl)+pois(1,hl));
p.away05=1-pois(0,al);p.away15=1-(pois(0,al)+pois(1,al));
return p;
}
function europeanHandicapProbs(hl,al,line){
 const m=scoreMatrix(hl,al);
 let home=0,draw=0,away=0;
 for(const [h,a,v] of m){
   const adjH=h+Number(line||0);
   if(adjH>a)home+=v; else if(adjH===a)draw+=v; else away+=v;
 }
 return {home,draw,away};
}
function europeanHandicapStats(hl,al,line,outcome,odds){
 const p=europeanHandicapProbs(hl,al,line)[outcome]||0;
 const fair=p>0?1/p:999,imp=1/odds,edge=p-imp,ev=p*odds-1;
 return {p,fair,imp,edge,ev};
}
function europeanHandicapSensitivity(line,outcome,odds,hl,al){
 const factors=[.93,1.07],evs=[];
 for(const fh of factors)for(const fa of factors){
   const p=europeanHandicapProbs(hl*fh,al*fa,line)[outcome]||0;
   evs.push(p*odds-1);
 }
 return robustnessFromEVs(evs);
}
function europeanHandicapLabel(line,outcome){
 const n=Number(line||0),homeLine=n,awayLine=-n;
 const fmt=x=>x>0?`+${x}`:`${x}`;
 if(outcome==='home')return `H1X2 · Local ${fmt(homeLine)}`;
 if(outcome==='away')return `H1X2 · Visitante ${fmt(awayLine)}`;
 return `H1X2 · Empate (${fmt(homeLine)} Local / ${fmt(awayLine)} Visitante)`;
}
function dnbStats(hl,al,side,odds){
 const p=probs(hl,al);
 const win=side==="home"?p.home:p.away;
 const push=p.draw;
 const loss=side==="home"?p.away:p.home;
 const fair=win>0?(1-push)/win:999;
 const impliedWin=(1-push)/odds;
 const edge=win-impliedWin;
 const ev=win*odds+push-1;
 return {win,push,loss,fair,edge,ev};
}
function dnbSensitivity(side,odds,hl,al){
 const factors=[.93,1.07],evs=[];
 for(const fh of factors)for(const fa of factors)evs.push(dnbStats(hl*fh,al*fa,side,odds).ev);
 return robustnessFromEVs(evs);
}
function worstEVRankScore(w){return clamp((w+.05)/.20*100,0,100)}
function probabilityRankScore(p){return clamp((Number(p)||0)*100,0,100)}
function optionalOddsValue(el){
 const raw=String(el?.value??"").trim();
 if(raw==="")return null;
 const n=Number(raw);
 return Number.isFinite(n)&&n>=1.35?n:null;
}
function equivalentMarketKey(row){
 const k=String(row?.market||"");
 if(k==="homeOrDraw")return "EQ_1X_HOME";
 if(k==="awayOrDraw")return "EQ_X2_AWAY";
 if(row?.isEuropeanHandicap&&Number(row.ehLine)===1&&row.ehOutcome==="home")return "EQ_1X_HOME";
 if(row?.isEuropeanHandicap&&Number(row.ehLine)===-1&&row.ehOutcome==="away")return "EQ_X2_AWAY";
 return null;
}
function applyEquivalentMarketPricing(rows){
 const groups=new Map();
 for(const row of rows){const key=equivalentMarketKey(row);if(!key)continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 for(const [key,group] of groups){
   if(group.length<2)continue;
   const ordered=group.slice().sort((a,b)=>{
     const od=Number(b.odds||0)-Number(a.odds||0);if(Math.abs(od)>1e-9)return od;
     const aSimple=["homeOrDraw","awayOrDraw"].includes(String(a.market));
     const bSimple=["homeOrDraw","awayOrDraw"].includes(String(b.market));
     return Number(bSimple)-Number(aSimple);
   });
   const best=ordered[0];best.equivalentGroup=key;best.equivalentBest=true;
   for(const row of ordered.slice(1)){
     row.equivalentGroup=key;row.equivalentSuppressed=true;row.selectorEligible=false;
     row.selectorReason=`Mercado equivalente a ${marketLabel(best.market)}; se prioriza mejor cuota ${Number(best.odds).toFixed(2)}`;
   }
 }
}
function directionalMarketSide(row){
 const k=String(row.market||"");
 if(k.startsWith("H1X2 · Local")||["home","homeDnb","homeOrDraw"].includes(k))return "home";
 if(k.startsWith("H1X2 · Visitante")||["away","awayDnb","awayOrDraw"].includes(k))return "away";
 return null;
}
function lambdaContradiction(row,opts={}){
 const side=directionalMarketSide(row),hl=Number(opts.hl),al=Number(opts.al);
 if(!side||!Number.isFinite(hl)||!Number.isFinite(al))return {gap:0,penalty:0,opposes:false};
 const gap=Math.abs(hl-al),fav=hl>al?"home":al>hl?"away":null,opposes=!!fav&&side!==fav;
 if(!opposes||gap<.20)return {gap,penalty:0,opposes};
 // V1.8.0: una cuota/EV alto no puede borrar por sí solo una señal fuerte del λ.
 const penalty=clamp((gap-.20)*22,0,18);
 return {gap,penalty,opposes};
}
function rankingScore(row,opts={}){
 // V1.8.0: Score base + penalización explícita si el pick direccional contradice un λ claro.
 const base=clamp(.30*row.robustness+.25*worstEVRankScore(row.worstEV)+.20*(row.selectorConf??row.conf)+.15*row.vs+.10*probabilityRankScore(row.p),0,100);
 const c=lambdaContradiction(row,opts);row.lambdaContradiction=c;
 return clamp(base-c.penalty,0,100);
}
function marketCategory(row){
 const k=String(row.market||"");
 if(k.startsWith("H1X2 ·"))return "HANDICAP";
 if(["home","draw","away","homeDnb","awayDnb","homeOrDraw","awayOrDraw"].includes(k))return "GANADORES";
 if(["bttsYes","bttsNo"].includes(k))return "AMBOS MARCAN";
 return "GOLES";
}
function categoryLabel(cat){return ({GANADORES:"🏆 GANADORES",GOLES:"⚽ GOLES",HANDICAP:"🛡️ HÁNDICAP","AMBOS MARCAN":"🔁 AMBOS MARCAN"})[cat]||cat}
function selectorMarketDivergence(row){
 const marketP=Math.max(Number(row.imp)||0,0.0001);
 return (Number(row.p)||0)/marketP;
}
function selectorEligibility(row,opts={}){
 const ratio=selectorMarketDivergence(row),p=Number(row.p)||0,rob=Number(row.robustness)||0,worst=Number(row.worstEV)||0;
 const conf=Math.max(0,(Number(row.conf)||0)-((opts.matchMode==="cup"&&opts.cupLeg==="first")?5:0));
 row.selectorConf=conf;
 if(row.baseDecision!=="VALUE BET"&&row.dec!=="VALUE BET")return {ok:false,ratio,reason:"No supera filtros base"};
 if(ratio>2.50)return {ok:false,ratio,reason:"Divergencia extrema modelo/mercado (>2.50x)"};
 if(ratio>1.35 && !(conf>=85&&rob>=85&&worst>=.08))return {ok:false,ratio,reason:"Divergencia >35%: máximo WATCH; no puede ser Top General"};
 if(ratio>1.25 && !(conf>=80&&rob>=80&&worst>=.05))return {ok:false,ratio,reason:"Divergencia 25–35%: exige Conf≥80, Rob≥80 y EV peor≥5%"};
 const lc=lambdaContradiction(row,opts);
 if(lc.opposes&&lc.gap>=.70 && !(conf>=85&&rob>=85&&worst>=.08&&p>=.58))return {ok:false,ratio,reason:`Contradice λ por ${lc.gap.toFixed(2)}: exige Conf≥85, Rob≥85, EV peor≥8% y P≥58%`};
 if(lc.opposes&&lc.gap>=.45 && !(conf>=80&&rob>=80&&worst>=.06&&p>=.55))return {ok:false,ratio,reason:`Contradice λ por ${lc.gap.toFixed(2)}: exige Conf≥80, Rob≥80, EV peor≥6% y P≥55%`};
 return {ok:true,ratio,reason:(opts.matchMode==="cup"&&opts.cupLeg==="first")?"Elegible · Copa ida: Conf selector -5":(lc.opposes&&lc.penalty>0?`Elegible · penalización λ -${lc.penalty.toFixed(1)}`:"Elegible")};
}
function topGeneralQuality(row){
 const ratio=Number(row.marketDivergence)||selectorMarketDivergence(row);
 if(ratio>1.35)return {ok:false,reason:"Divergencia >35%: no puede ser TOP GENERAL"};
 const score=Number(row.rankScore)||0,conf=Number(row.selectorConf??row.conf)||0,rob=Number(row.robustness)||0,worst=Number(row.worstEV)||0;
 if(score<70)return {ok:false,reason:"Score < 70"};
 if(conf<75)return {ok:false,reason:"Confianza < 75"};
 if(rob<65)return {ok:false,reason:"Robustez < 65"};
 if(!(worst>0))return {ok:false,reason:"EV peor no es positivo"};
 return {ok:true,reason:"Cumple mínimos TOP GENERAL"};
}
function rankRows(rows,opts={}){
 // V1.8.0: primero elegibilidad dura; luego Score. Cada categoría siempre muestra su mejor candidato relativo.
 rows.forEach(r=>{
   r.category=marketCategory(r);r.baseDecision=r.dec;
   const sel=selectorEligibility(r,opts);r.marketDivergence=sel.ratio;r.selectorReason=sel.reason;r.selectorEligible=sel.ok;
   r.rankScore=rankingScore(r,opts);r.categoryTop=false;r.topGeneral=false;
   delete r.equivalentGroup;delete r.equivalentBest;delete r.equivalentSuppressed;
 });
 // V1.8.0: 1X ≡ H1X2 Local +1 y X2 ≡ H1X2 Visitante +1. Solo la mejor cuota puede competir como recomendación.
 applyEquivalentMarketPricing(rows);
 const cats=["GANADORES","GOLES","HANDICAP","AMBOS MARCAN"];
 const categoryWinners=[];
 for(const cat of cats){
   const group=rows.filter(r=>r.category===cat);
   if(!group.length)continue;
   const ordered=group.slice().sort((a,b)=>b.rankScore-a.rankScore||b.worstEV-a.worstEV||b.robustness-a.robustness);
   const eligible=ordered.filter(r=>r.selectorEligible);
   // Un solo VALUE BET por categoría. Los demás conservan WATCH/NO BET según su diagnóstico base.
   group.forEach(r=>{
     if(r.baseDecision==="VALUE BET")r.dec="WATCH";
     else r.dec=r.baseDecision||r.dec;
   });
   const top=eligible.length?eligible[0]:ordered[0];
   top.categoryTop=true;
   if(eligible.length){
     top.dec="VALUE BET";
     top.selectorReason=`TOP ${cat}: elegible y mayor Selector Score de la categoría`;
     categoryWinners.push(top);
   }else{
     // Mejor candidato informativo, sin forzar recomendación.
     if(top.baseDecision==="VALUE BET")top.dec="WATCH";
     else top.dec=top.baseDecision||"NO BET";
     top.selectorReason=`Mejor candidato relativo · ${top.selectorReason||"no supera filtros"}`;
   }
 }
 if(categoryWinners.length){
   // V1.8.0: un TOP GENERAL no es obligatorio. Además de ser VALUE BET elegible,
   // debe superar mínimos absolutos de calidad para evitar picks marginales por descarte.
   const qualified=categoryWinners.filter(r=>{const q=topGeneralQuality(r);r.topGeneralQuality=q;return q.ok});
   if(qualified.length){
     const general=qualified.slice().sort((a,b)=>b.rankScore-a.rankScore||b.worstEV-a.worstEV||b.robustness-a.robustness)[0];
     general.topGeneral=true;general.selectorReason+=" · ⭐ TOP PICK GENERAL";
   }else{
     categoryWinners.forEach(r=>{r.topGeneralQuality=r.topGeneralQuality||topGeneralQuality(r)});
   }
 }
 const tier=x=>x.topGeneral?4:x.dec==="VALUE BET"?3:x.categoryTop?2:x.dec==="WATCH"?1:0;
 rows.sort((a,b)=>tier(b)-tier(a)||((cats.indexOf(a.category)-cats.indexOf(b.category)))||(b.rankScore-a.rankScore));
 return rows;
}
function score(p,o,metrics){
let imp=1/o,ed=p-imp,e=p*o-1;
let vs=clamp(50+180*e+70*ed,0,100);
const robustness=metrics.robustness;
const dataConf=metrics.dataConf;
const certainty=50+50*Math.abs(2*p-1);
const edgeStrength=clamp(Math.abs(ed)/.15*100,0,100);
const conf=clamp(.50*dataConf+.25*robustness+.15*certainty+.10*edgeStrength,25,95);
let dec=e>=.07&&ed>=.03&&conf>=65&&robustness>=55&&metrics.worstEV>0?"VALUE BET":(e>=.03&&ed>=.02&&conf>=50&&robustness>=40?"WATCH":"NO BET");
return {p,imp,fair:1/p,ed,e,vs,conf,robustness,worstEV:metrics.worstEV,bestEV:metrics.bestEV,baseEV:e,dec};
}
function confidenceScore(h,a,absH,absA){
let relevant=["gf","ga","xg","xga","shots","sot","sa","sota","bc","bca"],count=0,total=0;
for(const side of [h,a])for(const p of periods)for(const k of relevant){total++;if(side?.[p[0]]?.[k]!=null)count++}
const completeness=total?count/total:0;
const xgRecent=([h,a].filter(t=>t.last10?.xg!=null&&t.last10?.xga!=null&&t.last5?.xg!=null&&t.last5?.xga!=null).length/2);
const conditionKnown=([h,a].filter(t=>t.condition5?.xg!=null&&t.condition5?.xga!=null).length/2);
const restKnown=([h,a].filter(t=>t.restCurrent!=null).length/2);
const sourceKnown=document.getElementById("dataSource")?.value.trim()?1:0;
const absenceKnown=([absH,absA].filter(x=>x.length>0).length/2);
function consistency(t){
 const pairs=[["xg","gf"],["xga","ga"]].map(([x,g])=>{
   const xv=weightedPerMatch(t,x),gv=weightedPerMatch(t,g);
   if(xv==null||gv==null||xv<=0)return null;
   return Math.abs(gv-xv)/xv;
 }).filter(v=>v!=null);
 if(!pairs.length)return .5;
 const avgDiff=pairs.reduce((s,v)=>s+v,0)/pairs.length;
 return clamp(1-avgDiff,0,1);
}
const consistencyAvg=(consistency(h)+consistency(a))/2;
return clamp(30+30*completeness+10*xgRecent+8*conditionKnown+5*restKnown+4*sourceKnown+3*absenceKnown+10*consistencyAvg,25,95);
}
function robustnessFromEVs(evs){
 const worst=Math.min(...evs),best=Math.max(...evs),range=best-worst;
 const worstScore=clamp((worst+.05)/.20*100,0,100);
 const rangeScore=clamp(100-180*range,0,100);
 const signScore=worst>0?100:(worst>-0.03?50:0);
 const robustness=clamp(.50*worstScore+.30*rangeScore+.20*signScore,0,100);
 return {worstEV:worst,bestEV:best,robustness};
}
function marketSensitivity(key,odds,hl,al){
  const factors=[.93,1.07],evs=[];
  for(const fh of factors) for(const fa of factors){
    const pp=probs(hl*fh,al*fa)[key];
    evs.push(pp*odds-1);
  }
  return robustnessFromEVs(evs);
}
function scorePushMarket(stats,odds,metrics,label){
 const e=stats.ev,ed=stats.edge,robustness=metrics.robustness,dataConf=metrics.dataConf;
 const vs=clamp(50+180*e+70*ed,0,100);
 const certainty=50+50*Math.abs(2*stats.win-1);
 const edgeStrength=clamp(Math.abs(ed)/.15*100,0,100);
 const conf=clamp(.50*dataConf+.25*robustness+.15*certainty+.10*edgeStrength,25,95);
 const dec=e>=.07&&ed>=.03&&conf>=65&&robustness>=55&&metrics.worstEV>0?"VALUE BET":(e>=.03&&ed>=.02&&conf>=50&&robustness>=40?"WATCH":"NO BET");
 return {p:stats.win,push:stats.push,loss:stats.loss,imp:(1-stats.push)/odds,fair:stats.fair,ed,e,vs,conf,robustness,worstEV:metrics.worstEV,bestEV:metrics.bestEV,baseEV:e,dec,market:label,odds,isDnb:true};
}
function wplPct(row){
 const w=Number(row?.p||0),p=Number(row?.push||0),l=Number(row?.loss??Math.max(0,1-w-p));
 return `W ${(w*100).toFixed(1)}% · P ${(p*100).toFixed(1)}% · L ${(l*100).toFixed(1)}%`;
}
function pushMarketAuditHTML(rows){
 const relevant=(rows||[]).filter(x=>x.isDnb);
 if(!relevant.length)return '';
 return `<div class="push-audit"><div class="push-audit-title">🧮 Auditoría WIN / PUSH / LOSS</div><div class="small muted" style="margin-bottom:7px">En DNB, <b>Prob.</b> muestra P(WIN). La cuota justa incorpora P(PUSH): <b>(1 − PUSH) / WIN</b>. EV = <b>WIN × cuota + PUSH − 1</b>.</div><div class="push-audit-grid">`+relevant.map(x=>`<div class="push-audit-row"><b>${marketLabel(x.market)}</b><br>${wplPct(x)}<br>Justa ${Number(x.fair).toFixed(2)} · EV ${(Number(x.e)*100).toFixed(1)}%</div>`).join('')+`</div></div>`;
}
function marketLabel(key){const m=markets.find(x=>x[1]===key);return m?m[2]:key}
function loadDB(){return JSON.parse(localStorage.getItem("valuePickDB")||"[]")}
function saveDB(x){localStorage.setItem("valuePickDB",JSON.stringify(x))}
const DRAFT_KEY="soyJordanDraftV1_6";
let draftTimer=null;
let editingRecordId=null;
function toggleAggregate(){const second=document.getElementById("cupLeg")?.value==="second";["aggHomeWrap","aggAwayWrap"].forEach(id=>document.getElementById(id)?.classList.toggle("hidden",!second));}
function toggleMatchMode(){const cup=document.getElementById("matchMode")?.value==="cup";document.getElementById("cupFields")?.classList.toggle("hidden",!cup);document.getElementById("leagueAvgWrap")?.classList.toggle("hidden",cup);toggleAggregate();}
function collectFormState(){
  return {
    date:document.getElementById("date")?.value||"", league:document.getElementById("league")?.value||"",
    season:document.getElementById("season")?.value||"", leagueAvg:document.getElementById("leagueAvg")?.value||"", matchMode:document.getElementById("matchMode")?.value||"league", homeLeagueAvg:document.getElementById("homeLeagueAvg")?.value||"", awayLeagueAvg:document.getElementById("awayLeagueAvg")?.value||"", homeLeagueStrength:document.getElementById("homeLeagueStrength")?.value||"50", awayLeagueStrength:document.getElementById("awayLeagueStrength")?.value||"50", homeTeamStrength:document.getElementById("homeTeamStrength")?.value||"50", awayTeamStrength:document.getElementById("awayTeamStrength")?.value||"50", cupStage:document.getElementById("cupStage")?.value||"", cupLeg:document.getElementById("cupLeg")?.value||"single", aggHome:document.getElementById("aggHome")?.value||"0", aggAway:document.getElementById("aggAway")?.value||"0",
    home:document.getElementById("home")?.value||"", away:document.getElementById("away")?.value||"",
    notes:document.getElementById("notes")?.value||"", dataSource:document.getElementById("dataSource")?.value||"", teams:{home:getTeam("home"),away:getTeam("away")},
    absences:{home:getAbsences("home"),away:getAbsences("away")}, absenceImpactInput:{home:getAbsenceImpact("home"),away:getAbsenceImpact("away")}, quickMatches:{home:document.getElementById("quick-home")?.value||"",away:document.getElementById("quick-away")?.value||""}, quickOdds:document.getElementById("quickOdds")?.value||"",
    odds:Object.fromEntries([...document.querySelectorAll("[data-odd]")].map(el=>[el.dataset.odd,el.value])), eh:Object.fromEntries([...document.querySelectorAll("[data-eh-line]")].map(el=>[`${el.dataset.ehLine}_${el.dataset.ehOutcome}`,el.value]))
  };
}
function saveDraftNow(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(collectFormState()));setDraftStatus("💾 Borrador guardado automáticamente")}catch(e){}}
function queueDraftSave(){clearTimeout(draftTimer);draftTimer=setTimeout(saveDraftNow,120)}
function setDraftStatus(text){let el=document.getElementById("draftStatus");if(el)el.textContent=text}
function hasDraft(){try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null");return !!d && !!(d.home||d.away||d.league||d.notes||Object.values(d.odds||{}).some(Boolean)||Object.values(d.eh||{}).some(Boolean))}catch(e){return false}}
function restoreDraft(){
  try{
    const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null"); if(!d)return;
    const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!==undefined)el.value=v||""};
    ["date","league","season","leagueAvg","matchMode","homeLeagueAvg","awayLeagueAvg","homeLeagueStrength","awayLeagueStrength","homeTeamStrength","awayTeamStrength","cupStage","cupLeg","aggHome","aggAway","dataSource","home","away","notes"].forEach(k=>set(k,d[k])); toggleMatchMode(); toggleAggregate();
    if(d.teams){for(const side of ["home","away"]){for(const p of periods){for(const [k] of metrics){const el=document.querySelector(`[data-team="${side}"][data-period="${p[0]}"][data-key="${k}"]`);if(el&&d.teams[side]?.[p[0]]?.[k]!=null)el.value=d.teams[side][p[0]][k];}}const r=document.querySelector(`[data-team="${side}"][data-key="restCurrent"]`);if(r&&d.teams[side]?.restCurrent!=null)r.value=d.teams[side].restCurrent;const lm=document.querySelector(`[data-team="${side}"][data-key="lastMatchDate"]`);if(lm&&d.teams[side]?.lastMatchDate)lm.value=d.teams[side].lastMatchDate;}}
    if(d.absenceImpactInput){for(const side of ["home","away"])setAggregateAbsence(side,d.absenceImpactInput[side]?.att||0,d.absenceImpactInput[side]?.def||0);}else if(d.absences){for(const side of ["home","away"]){const x=aggregateLegacyAbsences(d.absences[side]||[]);setAggregateAbsence(side,x.att,x.def);}}
    if(d.quickMatches){for(const side of ["home","away"]){const q=document.getElementById('quick-'+side);if(q)q.value=d.quickMatches[side]||'';}}if(document.getElementById('quickOdds'))document.getElementById('quickOdds').value=d.quickOdds||'';
    if(d.odds)Object.entries(d.odds).forEach(([k,v])=>{const el=document.querySelector(`[data-odd="${k}"]`);if(el)el.value=v||""});
    if(d.eh){document.querySelectorAll("[data-eh-line]").forEach(el=>{const k=`${el.dataset.ehLine}_${el.dataset.ehOutcome}`;if(d.eh[k]!=null)el.value=d.eh[k]||"";});}
    setDraftStatus("💾 Borrador recuperado automáticamente");
  }catch(e){console.warn("No se pudo recuperar borrador",e)}
}
function clearDraft(){localStorage.removeItem(DRAFT_KEY);setDraftStatus("Borrador eliminado")}
function resetFormToBlank(){document.getElementById("form").reset();document.getElementById("date").value=new Date().toISOString().slice(0,10);document.getElementById("leagueAvg").value="1.35";document.getElementById("matchMode").value="league";["homeLeagueStrength","awayLeagueStrength","homeTeamStrength","awayTeamStrength"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="50"});toggleMatchMode();renderAbsenceCards();clearDraft();setDraftStatus("Nuevo análisis listo")}

document.getElementById("form").addEventListener("submit",e=>{
e.preventDefault();
const oddsValues=Object.fromEntries([...document.querySelectorAll("[data-odd]")].map(el=>[el.dataset.odd,el.value]));
const ehValues=Object.fromEntries([...document.querySelectorAll("[data-eh-line]")].map(el=>[`${el.dataset.ehLine}_${el.dataset.ehOutcome}`,el.value]));
const hasStandardOdds=[...document.querySelectorAll("[data-odd]")].some(el=>optionalOddsValue(el)!=null);
const hasEuropeanOdds=[...document.querySelectorAll("[data-eh-line]")].some(el=>optionalOddsValue(el)!=null);
if(!hasStandardOdds&&!hasEuropeanOdds){alert("Introduce al menos una cuota antes de analizar y guardar.");return;}
let home=document.getElementById("home").value,away=document.getElementById("away").value,hd=getTeam("home"),ad=getTeam("away");
let absH=getAbsences("home"),absA=getAbsences("away"),absHS={att:cappedImpact(absH,"att"),def:cappedImpact(absH,"def")},absAS={att:cappedImpact(absA,"att"),def:cappedImpact(absA,"def")};
const matchMode=document.getElementById("matchMode").value;
const cupContext={stage:document.getElementById("cupStage").value,leg:document.getElementById("cupLeg").value,aggHome:+document.getElementById("aggHome").value||0,aggAway:+document.getElementById("aggAway").value||0};
let eg=expGoals(hd,ad,+document.getElementById("leagueAvg").value||1.35,absHS,absAS,{mode:matchMode,homeLeagueAvg:+document.getElementById("homeLeagueAvg").value||1.35,awayLeagueAvg:+document.getElementById("awayLeagueAvg").value||1.35,homeLeagueStrength:Number(document.getElementById("homeLeagueStrength").value),awayLeagueStrength:Number(document.getElementById("awayLeagueStrength").value),homeTeamStrength:Number(document.getElementById("homeTeamStrength").value),awayTeamStrength:Number(document.getElementById("awayTeamStrength").value),cupContext}),hl=eg.hl,al=eg.al,ps=probs(hl,al),dataConf=confidenceScore(hd,ad,absH,absA),rows=[];
document.querySelectorAll("[data-odd]").forEach(el=>{
 const odds=optionalOddsValue(el);if(odds==null)return;
 const key=el.dataset.odd;
 if(ps[key]==null)return;
 if(key==="homeDnb"||key==="awayDnb"){
   const side=key==="homeDnb"?"home":"away",st=dnbStats(hl,al,side,odds),sm=dnbSensitivity(side,odds,hl,al);
   rows.push({...scorePushMarket(st,odds,{...sm,dataConf},key),market:key,odds});
 }else{
   const sm=marketSensitivity(key,odds,hl,al),sc=score(ps[key],odds,{...sm,dataConf});rows.push({...sc,market:key,odds});
 }
});
document.querySelectorAll("[data-eh-line]").forEach(el=>{
 const odds=optionalOddsValue(el);if(odds==null)return;
 const line=Number(el.dataset.ehLine),outcome=el.dataset.ehOutcome;
 const st=europeanHandicapStats(hl,al,line,outcome,odds),sm=europeanHandicapSensitivity(line,outcome,odds,hl,al);
 const label=europeanHandicapLabel(line,outcome);
 const sc=score(st.p,odds,{...sm,dataConf});
 rows.push({...sc,market:label,odds,isEuropeanHandicap:true,ehLine:line,ehOutcome:outcome});
});
rankRows(rows,{matchMode,cupLeg:cupContext.leg,hl,al});
let rec={id:editingRecordId||Date.now(),date:document.getElementById("date").value,league:document.getElementById("league").value,season:document.getElementById("season").value,leagueAvg:+document.getElementById("leagueAvg").value||1.35,matchMode,homeLeagueAvg:+document.getElementById("homeLeagueAvg").value||1.35,awayLeagueAvg:+document.getElementById("awayLeagueAvg").value||1.35,homeLeagueStrength:Number(document.getElementById("homeLeagueStrength").value),awayLeagueStrength:Number(document.getElementById("awayLeagueStrength").value),homeTeamStrength:Number(document.getElementById("homeTeamStrength").value),awayTeamStrength:Number(document.getElementById("awayTeamStrength").value),cupContext,home,away,hl,al,rows,result:null,notes:document.getElementById("notes").value,dataSource:document.getElementById("dataSource").value,absenceImpact:{home:absHS,away:absAS},absences:{home:absH,away:absA},teams:{home:hd,away:ad},odds:oddsValues,eh:ehValues,diagnostics:eg.diag,dataConfidence:dataConf,version:"1.8.0"};
let db=loadDB();
if(editingRecordId){const idx=db.findIndex(x=>x.id===editingRecordId);if(idx>=0)db[idx]=rec;else db.unshift(rec);}else db.unshift(rec);
saveDB(db);editingRecordId=null;clearDraft();renderResult(rec);resetFormToBlank();show("analysis");
});
function renderResult(r){
let d=r.diagnostics;
let h=`<div class="card result-capture-card"><div class="result-head"><h2>🎯 Resultado V1.8.0</h2><button type="button" class="download-result-btn" onclick="downloadResultCapture()">📸 Descargar resultado</button></div>
<div class="note" style="margin-bottom:10px"><b>Modo:</b> ${r.matchMode==="cup"?"🏆 Copas / Interliga":"⚽ Liga"}${r.matchMode==="cup"?` · Promedios liga: ${Number(r.homeLeagueAvg).toFixed(2)} / ${Number(r.awayLeagueAvg).toFixed(2)} · Índice interliga: ${(d.interIndexH??50).toFixed(1)} / ${(d.interIndexA??50).toFixed(1)} · ${r.cupContext?.stage||""} · ${r.cupContext?.leg||""}`:""}</div>
<div class="summary">
<div class="box"><b>${r.home}</b><br>λ goles: <b>${r.hl.toFixed(2)}</b><br>Ausencia ataque: ${r.absenceImpact.home.att.toFixed(0)}/100<br>Ausencia defensa: ${r.absenceImpact.home.def.toFixed(0)}/100</div>
<div class="box"><b>${r.away}</b><br>λ goles: <b>${r.al.toFixed(2)}</b><br>Ausencia ataque: ${r.absenceImpact.away.att.toFixed(0)}/100<br>Ausencia defensa: ${r.absenceImpact.away.def.toFixed(0)}/100</div>
</div>
<p class="small muted">Confianza de datos: <b>${r.dataConfidence.toFixed(0)}/95</b>. Esta métrica evalúa completitud, muestras recientes y consistencia xG/GF; no equivale a probabilidad de acierto.</p>
<div class="diag"><b>🔎 Diagnóstico del λ</b><table>
<tr><th>Componente</th><th>Local</th><th>Visitante</th></tr>
<tr><td>Ataque bruto</td><td>${d.Hatt.raw.toFixed(2)}</td><td>${d.Aatt.raw.toFixed(2)}</td></tr>
<tr><td>Ataque ajustado</td><td>${d.Hatt.shrunk.toFixed(2)}</td><td>${d.Aatt.shrunk.toFixed(2)}</td></tr>
<tr><td>Debilidad defensiva bruta</td><td>${d.Hdef.raw.toFixed(2)}</td><td>${d.Adef.raw.toFixed(2)}</td></tr>
<tr><td>Debilidad defensiva ajustada</td><td>${d.Hdef.shrunk.toFixed(2)}</td><td>${d.Adef.shrunk.toFixed(2)}</td></tr>
<tr><td>λ estructural</td><td>${(d.structuralH??d.baseH).toFixed(2)}</td><td>${(d.structuralA??d.baseA).toFixed(2)}</td></tr>
<tr><td>λ regularizado</td><td>${(d.regularizedH??d.baseH).toFixed(2)}</td><td>${(d.regularizedA??d.baseA).toFixed(2)}</td></tr>
${r.matchMode==="cup"?`<tr><td>Índice interliga (70/30)</td><td>${(d.interIndexH??50).toFixed(1)}</td><td>${(d.interIndexA??50).toFixed(1)}</td></tr><tr><td>Ajuste fuerza interliga</td><td>${(d.interFactorH??1).toFixed(3)}</td><td>${(d.interFactorA??1).toFixed(3)}</td></tr><tr><td>λ tras fuerza interliga</td><td>${(d.interleagueH??d.regularizedH).toFixed(2)}</td><td>${(d.interleagueA??d.regularizedA).toFixed(2)}</td></tr><tr><td>Ajuste global / urgencia</td><td>${(d.aggregateFactorH??1).toFixed(3)}</td><td>${(d.aggregateFactorA??1).toFixed(3)}</td></tr>`:""}
<tr><td>Ajuste ataque por ausencias</td><td>${d.absenceHAtt.toFixed(3)}</td><td>${d.absenceAAtt.toFixed(3)}</td></tr>
<tr><td>Ajuste defensa rival por ausencias</td><td>${d.absenceADef.toFixed(3)}</td><td>${d.absenceHDef.toFixed(3)}</td></tr>
<tr><td>Ajuste descanso</td><td>${d.restHF.toFixed(3)}</td><td>${d.restAF.toFixed(3)}</td></tr>
<tr><td><b>λ final</b></td><td><b>${r.hl.toFixed(2)}</b></td><td><b>${r.al.toFixed(2)}</b></td></tr>
</table></div>
<p class="small muted">El motor λ V1.7.1 usa 70% xG/xGA y 30% GF/GA dentro de cada ventana disponible, pondera Últimos 10/Últimos 5/condición en 50%/30%/20%, redistribuye pesos si faltan datos y aplica regresión. En Liga conserva la ruta V1.6.4. En Copas añade, después de la regularización 55%, un ajuste interliga moderado (70% fuerza de liga + 30% nivel del equipo; máximo ±12%) y, solo en vueltas, un ajuste de urgencia por el marcador global (+4% / +8% al ataque del equipo que necesita 1 / 2+ goles).</p>
<div class="note" style="margin-top:10px"><b>Selector V1.8.0:</b> separa GANADORES, GOLES, HÁNDICAP y AMBOS MARCAN. Primero aplica la puerta de elegibilidad y después usa el Selector Score: <b>30% Robustez + 25% EV peor + 20% Confianza + 15% Value + 10% Probabilidad</b>. Cuotas <b>&lt;1.35 se ignoran</b>; desde 1.35 todos los mercados se juzgan con las mismas reglas. Las divergencias con mercado endurecen requisitos y una divergencia &gt;35% no puede ser Top General. Además, los picks direccionales que contradicen una diferencia clara de λ reciben penalización y, con brechas fuertes, requisitos extra de confianza/robustez/EV. Para ser TOP GENERAL además exige Score≥70, Confianza≥75, Robustez≥65 y EV peor positivo; si nadie cumple, muestra NO BET. Los mercados equivalentes 1X/H1X2 Local +1 y X2/H1X2 Visitante +1 compiten como un solo evento y se prioriza la mejor cuota. En Copa ida la confianza de selección recibe -5 sin modificar λ. Si una categoría no tiene VALUE BET, igualmente muestra su mejor candidato relativo como WATCH o NO BET.</div>${pushMarketAuditHTML(r.rows)}`;
const general=(r.rows||[]).find(x=>x.topGeneral);
if(general)h+=`<div class="card" style="margin-top:12px;border:2px solid #166534;background:#f4fbf6"><h3 style="margin:0 0 6px">⭐ TOP PICK GENERAL</h3><div style="font-size:20px;font-weight:800">${marketLabel(general.market)}</div><div class="small" style="margin-top:5px">${categoryLabel(general.category)} · Score ${Number(general.rankScore||0).toFixed(0)} · Prob. ${(Number(general.p||0)*100).toFixed(1)}% · EV ${(Number(general.e||0)*100).toFixed(1)}% · EV peor ${(Number(general.worstEV||0)*100).toFixed(1)}%</div><div style="margin-top:7px;font-weight:800;color:#166534">VALUE BET</div></div>`;
else h+=`<div class="card" style="margin-top:12px;border:2px solid #9a6700;background:#fff8e6"><h3 style="margin:0 0 6px">⭐ TOP PICK GENERAL</h3><div style="font-size:22px;font-weight:900">NO BET</div><div class="small" style="margin-top:5px">Ningún VALUE BET elegible alcanza los mínimos del Top General: Score ≥70 · Confianza ≥75 · Robustez ≥65 · EV peor positivo.</div></div>`;
const cats=["GANADORES","GOLES","HANDICAP","AMBOS MARCAN"];
for(const cat of cats){const group=(r.rows||[]).filter(x=>(x.category||marketCategory(x))===cat);if(!group.length)continue;h+=`<div class="card" style="margin-top:12px;box-shadow:none;border:1px solid #ddd"><h3 style="margin-top:0">${categoryLabel(cat)}</h3>`;
const top=group.find(x=>x.categoryTop);if(top)h+=`<div class="note" style="margin-bottom:8px"><b>${top.topGeneral?"⭐ TOP PICK GENERAL · ":""}Mejor de categoría:</b> ${marketLabel(top.market)} · Score ${Number(top.rankScore||0).toFixed(0)} · ${top.dec}<div class="small" style="margin-top:4px">${top.selectorReason||""}</div></div>`;
h+=`<div class="result-grid"><table><tr><th>Pick</th><th>Prob.</th><th>Justa</th><th>Cuota</th><th>Edge</th><th>EV</th><th>Value</th><th>Conf.</th><th>Rob.</th><th>EV peor</th><th>Score</th><th></th></tr>`;
for(const x of group){const extra=x.isDnb?`<span class="wpl-mini">${wplPct(x)}</span>`:'';h+=`<tr class="${x.dec==='VALUE BET'?'good':x.dec==='WATCH'?'watch':'bad'}"><td>${x.topGeneral?'⭐ ':''}${marketLabel(x.market)}${extra}</td><td>${(x.p*100).toFixed(1)}%</td><td>${x.fair.toFixed(2)}</td><td>${x.odds.toFixed(2)}</td><td>${(x.ed*100).toFixed(1)}%</td><td>${(x.e*100).toFixed(1)}%</td><td>${x.vs.toFixed(0)}</td><td>${x.conf.toFixed(0)}</td><td>${x.robustness.toFixed(0)}</td><td>${(x.worstEV*100).toFixed(1)}%</td><td>${Number(x.rankScore||0).toFixed(0)}</td><td><b>${x.dec}</b></td></tr>`}h+=`</table></div></div>`}
h+="</div>";document.getElementById("result").innerHTML=h;
}
function show(id){["analysis","history","backup"].forEach(x=>document.getElementById(x).classList.toggle("hidden",x!==id));if(id==="history")renderHistory()}
function renderHistory(){
let db=loadDB(),settled=db.filter(x=>x.result),wins=settled.filter(x=>x.result==="win").length,loss=settled.filter(x=>x.result==="loss").length,pnl=settled.reduce((s,x)=>s+(x.pnl||0),0),stake=settled.length;
document.getElementById("stats").innerHTML=`<span class="metric">Análisis: ${db.length}</span><span class="metric">Liquidados: ${settled.length}</span><span class="metric">Aciertos: ${wins}</span><span class="metric">Fallos: ${loss}</span><span class="metric">PnL: ${pnl.toFixed(2)}u</span><span class="metric">ROI: ${stake?(pnl/stake*100).toFixed(2):"0.00"}%</span>`;
let h="<table><tr><th>Fecha</th><th>Partido</th><th>Mejor pick</th><th>Cuota</th><th>EV</th><th>Estado</th><th></th></tr>";
db.forEach(r=>{let x=r.rows&&r.rows[0];h+=`<tr class="history-row" onclick="openHistoryDetail(${r.id})"><td>${r.date}</td><td><b>${r.home}</b> vs <b>${r.away}</b></td><td>${x?marketLabel(x.market):"-"}</td><td>${x?x.odds.toFixed(2):"-"}</td><td>${x?(x.e*100).toFixed(1)+"%":"-"}</td><td>${r.result||"Pendiente"}</td><td><button type="button" class="dangerBtn" onclick="event.stopPropagation();deleteRecord(${r.id})">🗑️</button> ${x?`<button type="button" onclick="event.stopPropagation();settle(${r.id})">Liquidar</button>`:""}</td></tr>`});
h+="</table>";document.getElementById("historyTable").innerHTML=h||"<p class='muted'>Todavía no hay análisis guardados.</p>";
}
function fmt(v){return v==null||v===""?"—":(typeof v==="number"?v.toFixed(2):v)}
function teamDetailTable(t,side){
 const cond=side==="home"?"Últimos 5 casa":"Últimos 5 fuera";
 let h=`<table><tr><th>Métrica</th><th>Últimos 10</th><th>Últimos 5</th><th>${cond}</th></tr>`;
 for(const [k,l] of metrics)h+=`<tr><td>${l}</td><td>${fmt(t?.last10?.[k])}</td><td>${fmt(t?.last5?.[k])}</td><td>${fmt(t?.condition5?.[k])}</td></tr>`;
 h+=`<tr><td>Días descanso</td><td colspan="3">${fmt(t?.restCurrent)}</td></tr>`;
 return h+'</table>';
}
function absDetail(arr){if(!arr?.length)return '<p class="muted">Sin ausencias registradas.</p>';let h='<table><tr><th>Jugador</th><th>Estado</th><th>Ataque</th><th>Defensa</th></tr>';arr.forEach(x=>h+=`<tr><td>${x.name||'—'}</td><td>${x.status==='confirmed'?'Confirmada':x.status==='doubt'?'Duda':'Disponible'}</td><td>${fmt(x.att)}</td><td>${fmt(x.def)}</td></tr>`);return h+'</table>'}
function oddsDetail(r){let h='<table><tr><th>Mercado</th><th>Cuota</th><th>Prob.</th><th>EV</th><th>Decisión</th></tr>';(r.rows||[]).forEach(x=>h+=`<tr class="${x.dec==='VALUE BET'?'good':x.dec==='WATCH'?'watch':'bad'}"><td>${marketLabel(x.market)}</td><td>${x.odds.toFixed(2)}</td><td>${(x.p*100).toFixed(1)}%</td><td>${(x.e*100).toFixed(1)}%</td><td>${x.dec}</td></tr>`);return h+'</table>'}
function openHistoryDetail(id){
 const r=loadDB().find(x=>x.id===id);if(!r)return;
 document.getElementById('historyList').classList.add('hidden');const box=document.getElementById('historyDetail');box.classList.remove('hidden');
 const d=r.diagnostics||{};
 box.innerHTML=`<div class="card"><div class="detail-head"><div><h2 style="margin:0">📊 ${r.home} vs ${r.away}</h2><div class="muted">${r.date} · ${r.league||''} · ${r.season||''}</div>${r.preMatchLocked?'<span class="locked-badge">🔒 PREPARTIDO BLOQUEADO</span>':''}</div><div class="actions"><button type="button" onclick="downloadHistoryCapture(${r.id})">📸 Captura</button><button class="secondary" onclick="closeHistoryDetail()">← Volver</button></div></div>
 <div class="detail-section"><h3>Resultado del modelo</h3><div class="summary"><div class="box"><b>${r.home}</b><br>λ: <b>${r.hl.toFixed(2)}</b><br>Ausencia ataque: ${r.absenceImpact?.home?.att?.toFixed(0)||0}/100<br>Ausencia defensa: ${r.absenceImpact?.home?.def?.toFixed(0)||0}/100</div><div class="box"><b>${r.away}</b><br>λ: <b>${r.al.toFixed(2)}</b><br>Ausencia ataque: ${r.absenceImpact?.away?.att?.toFixed(0)||0}/100<br>Ausencia defensa: ${r.absenceImpact?.away?.def?.toFixed(0)||0}/100</div></div><p class="small muted">Confianza de datos: <b>${(r.dataConfidence||0).toFixed(0)}/95</b></p></div>
 <div class="detail-section"><h3>📋 Datos guardados — ${r.home}</h3>${teamDetailTable(r.teams?.home,"home")}</div>
 <div class="detail-section"><h3>📋 Datos guardados — ${r.away}</h3>${teamDetailTable(r.teams?.away,"away")}</div>
 <div class="detail-section"><h3>🩹 Ausencias</h3><b>${r.home}</b>${absDetail(r.absences?.home)}<b>${r.away}</b>${absDetail(r.absences?.away)}</div>
 <div class="detail-section"><h3>🔎 Diagnóstico</h3><table><tr><th>Componente</th><th>${r.home}</th><th>${r.away}</th></tr><tr><td>Ataque bruto</td><td>${fmt(d.Hatt?.raw)}</td><td>${fmt(d.Aatt?.raw)}</td></tr><tr><td>Ataque ajustado</td><td>${fmt(d.Hatt?.shrunk)}</td><td>${fmt(d.Aatt?.shrunk)}</td></tr><tr><td>Defensa bruta</td><td>${fmt(d.Hdef?.raw)}</td><td>${fmt(d.Adef?.raw)}</td></tr><tr><td>Defensa ajustada</td><td>${fmt(d.Hdef?.shrunk)}</td><td>${fmt(d.Adef?.shrunk)}</td></tr><tr><td>λ estructural</td><td>${fmt(d.structuralH??d.baseH)}</td><td>${fmt(d.structuralA??d.baseA)}</td></tr><tr><td>λ regularizado</td><td>${fmt(d.regularizedH??d.baseH)}</td><td>${fmt(d.regularizedA??d.baseA)}</td></tr><tr><td>λ final</td><td><b>${r.hl.toFixed(2)}</b></td><td><b>${r.al.toFixed(2)}</b></td></tr></table></div>
 <div class="detail-section"><h3>💰 Cuotas y mercados</h3>${oddsDetail(r)}</div>
 <div class="detail-section"><h3>🔎 Fuente de datos</h3><div class="note">${r.dataSource||'No registrada.'}</div></div><div class="detail-section"><h3>📝 Notas</h3><div class="note">${r.notes||'Sin notas.'}</div></div>
 <div class="actions" style="margin-top:12px"><button type="button" onclick="loadRecordIntoForm(${r.id})">✏️ Cargar en formulario</button>${r.rows?.length?`<button type="button" class="secondary" onclick="settle(${r.id})">Liquidar pick principal</button>`:''}<button type="button" class="dangerBtn" onclick="deleteRecord(${r.id})">🗑️ Borrar este partido</button></div>
 </div>`;
}
function closeHistoryDetail(){document.getElementById('historyDetail').classList.add('hidden');document.getElementById('historyList').classList.remove('hidden')}
function loadRecordIntoForm(id){
 const r=loadDB().find(x=>x.id===id);if(!r)return;
 editingRecordId=r.id;
 const savedOdds=r.odds||Object.fromEntries((r.rows||[]).map(x=>[x.market,x.odds]));
 const d={date:r.date,league:r.league,season:r.season,leagueAvg:r.leagueAvg||'',matchMode:r.matchMode||'league',homeLeagueAvg:r.homeLeagueAvg||r.leagueAvg||'',awayLeagueAvg:r.awayLeagueAvg||r.leagueAvg||'',homeLeagueStrength:r.homeLeagueStrength??50,awayLeagueStrength:r.awayLeagueStrength??50,homeTeamStrength:r.homeTeamStrength??50,awayTeamStrength:r.awayTeamStrength??50,cupStage:r.cupContext?.stage||'Playoff',cupLeg:r.cupContext?.leg||'single',aggHome:r.cupContext?.aggHome||0,aggAway:r.cupContext?.aggAway||0,dataSource:r.dataSource||'',home:r.home,away:r.away,notes:r.notes||'',teams:r.teams,absences:r.absences,absenceImpactInput:r.absenceImpact||null,odds:savedOdds,eh:r.eh||null};
 localStorage.setItem(DRAFT_KEY,JSON.stringify(d));
 document.getElementById('result').innerHTML='';
 closeHistoryDetail();show('analysis');restoreDraft();setDraftStatus('✏️ Análisis cargado: cuotas y datos recuperados. Puedes editar y volver a analizar.');
}
function settle(id){let db=loadDB(),r=db.find(x=>x.id===id);if(!r||!r.rows||!r.rows.length)return;let x=r.rows[0],res=prompt("Resultado: WIN, LOSS o PUSH","WIN");if(!res)return;res=res.toLowerCase();if(!["win","loss","push"].includes(res))return alert("Resultado inválido");r.result=res;r.pnl=res==="win"?x.odds-1:res==="loss"?-1:0;saveDB(db);renderHistory();openHistoryDetail(id)}
function deleteRecord(id){
 const db=loadDB(),r=db.find(x=>x.id===id);if(!r)return;
 const linkedBets=betsForAnalysis(id),linkedComboLegs=loadCombos().reduce((n,c)=>n+(c.legs||[]).filter(l=>l.analysisId===id&&!l.voidedByAnalysisDelete).length,0);
 const extra=`\n\nTambién se borrarán ${linkedBets.length} apuesta(s) individual(es) vinculada(s).${linkedComboLegs?`\n${linkedComboLegs} selección(es) de combinadas quedarán ANULADAS (cuota 1.00) y se recalcularán.`:""}`;
 if(!confirm(`¿Borrar del historial "${r.home} vs ${r.away}"?${extra}\n\nEsta acción no se puede deshacer.`))return;
 // Borrar apuestas individuales del mismo análisis para evitar registros huérfanos.
 saveBets(loadBets().filter(b=>b.analysisId!==id));
 // En combinadas no borramos la combinada completa: anulamos/desvinculamos únicamente la selección del partido.
 const combos=loadCombos();let comboChanged=false;
 combos.forEach(c=>{
   let touched=false;
   (c.legs||[]).forEach(l=>{if(l.analysisId===id&&!l.voidedByAnalysisDelete){l.voidedByAnalysisDelete=true;l.voidedAt=new Date().toISOString();l.voidReason="Análisis eliminado del historial";touched=true}});
   if(touched){c.status="pending";c.pnl=0;c.legResults=null;delete c.settledAt;delete c.effectiveOdds;c.recalculatedAfterDelete=true;comboChanged=true}
 });
 if(comboChanged)saveCombos(combos);
 saveDB(db.filter(x=>x.id!==id));
 if(comboChanged)syncCombosFromAudits();
 closeHistoryDetail();renderHistory();renderBetHistory();renderCombos();
}
function clearCurrentForm(){if(confirm("¿Limpiar todos los datos del formulario?")){resetFormToBlank();document.getElementById("result").innerHTML="";editingRecordId=null}}
function exportData(){let b=new Blob([JSON.stringify(loadDB(),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="SoyJordan_Picks_V1_8_0_Backup_Legacy.json";a.click();document.getElementById("dataMsg").textContent="Backup V1.8.0 exportado."}
function importData(e){let f=e.target.files[0];if(!f)return;let rd=new FileReader();rd.onload=()=>{try{let incoming=JSON.parse(rd.result);if(!Array.isArray(incoming))throw Error();const current=loadDB();const byId=new Map(current.map(x=>[String(x.id),x]));let added=0,updated=0;incoming.forEach(x=>{if(!x||x.id==null)return;const key=String(x.id);if(byId.has(key))updated++;else added++;byId.set(key,x)});const merged=[...byId.values()].sort((a,b)=>(Number(b.id)||0)-(Number(a.id)||0));saveDB(merged);document.getElementById("dataMsg").textContent=`Backup importado: ${added} nuevos, ${updated} actualizados. Total en historial: ${merged.length}.`;document.getElementById("importFile").value="";show("history");renderHistory()}catch{document.getElementById("dataMsg").textContent="Archivo no válido.";document.getElementById("importFile").value=""}};rd.readAsText(f)}
function clearAll(){if(confirm("¿Borrar todo el historial de este iPhone?")){localStorage.removeItem("valuePickDB");renderHistory();document.getElementById("dataMsg").textContent="Historial borrado."}}
document.getElementById("form").addEventListener("input",()=>{document.getElementById("result").innerHTML="";queueDraftSave()});
document.getElementById("form").addEventListener("change",()=>{document.getElementById("result").innerHTML="";queueDraftSave()});
window.addEventListener("beforeunload",saveDraftNow);
setTimeout(()=>{if(hasDraft())restoreDraft();else saveDraftNow()},250);

// ==================== V1.6.1 · BANK / APUESTAS / COMBINADAS ====================
const BANK_KEY="sjBankV161", BETS_KEY="sjBetsV161", COMBOS_KEY="sjCombosV161";
let comboBuilder=[];

function money(v){
  const n=Number(v)||0;
  return "$"+Math.round(n).toLocaleString("es-CO");
}
function loadBank(){
  try{return JSON.parse(localStorage.getItem(BANK_KEY))||{initial:0,adjustments:[]}}catch{return {initial:0,adjustments:[]}}
}
function saveBank(b){localStorage.setItem(BANK_KEY,JSON.stringify(b));renderBank()}
function loadBets(){try{return JSON.parse(localStorage.getItem(BETS_KEY))||[]}catch{return []}}
function saveBets(x){localStorage.setItem(BETS_KEY,JSON.stringify(x));renderBank()}
function isFreeBet(b){return b?.betType==="freebet"||b?.isFreeBet===true}
function calcBetPnl(b,outcome){
  const stake=Number(b?.stake)||0,odds=Number(b?.odds)||1;
  if(outcome==="win")return stake*Math.max(0,odds-1);
  if(outcome==="loss")return isFreeBet(b)?0:-stake;
  return 0;
}
function loadCombos(){try{return JSON.parse(localStorage.getItem(COMBOS_KEY))||[]}catch{return []}}
function saveCombos(x){localStorage.setItem(COMBOS_KEY,JSON.stringify(x));renderBank()}

function financeSummary(){
  const bank=loadBank(),bets=loadBets(),combos=loadCombos();
  const adj=(bank.adjustments||[]).reduce((s,x)=>s+(Number(x.amount)||0),0);
  const betPnl=bets.reduce((s,x)=>s+(x.status!=="pending"?(Number(x.pnl)||0):0),0);
  const comboPnl=combos.reduce((s,x)=>s+(x.status!=="pending"?(Number(x.pnl)||0):0),0);
  const pending=bets.filter(x=>x.status==="pending"&&!isFreeBet(x)).reduce((s,x)=>s+(Number(x.stake)||0),0)
    +combos.filter(x=>x.status==="pending").reduce((s,x)=>s+(Number(x.stake)||0),0);
  const current=(Number(bank.initial)||0)+adj+betPnl+comboPnl;
  return {initial:Number(bank.initial)||0,adj,betPnl,comboPnl,pnl:betPnl+comboPnl,current,pending,available:current-pending};
}
function renderBank(){
  const s=financeSummary();
  const a=document.getElementById("bankInitialDisplay"),b=document.getElementById("bankCurrentDisplay"),c=document.getElementById("bankPendingDisplay"),d=document.getElementById("bankAvailableDisplay"),p=document.getElementById("bankPnlText");
  if(a)a.textContent=money(s.initial);if(b)b.textContent=money(s.current);if(c)c.textContent=money(s.pending);if(d)d.textContent=money(s.available);
  if(p){p.textContent=`P&L realizado: ${money(s.pnl)}`;p.className="small "+(s.pnl>=0?"money-positive":"money-negative")}
}
function setInitialBank(){
  const b=loadBank(),v=prompt("Bank inicial:",String(b.initial||0));if(v===null)return;
  const n=Number(String(v).replace(/[^\d.-]/g,""));if(!Number.isFinite(n)||n<0)return alert("Valor inválido.");
  b.initial=n;saveBank(b);
}
function adjustBank(){
  const raw=prompt("Escribe el ajuste. Positivo = ingreso; negativo = retiro.\nEj.: 50000 o -20000","0");if(raw===null)return;
  const n=Number(String(raw).replace(/[^\d.-]/g,""));if(!Number.isFinite(n)||n===0)return alert("Valor inválido.");
  const note=prompt("Nota del ajuste (opcional):","")||"";
  const b=loadBank();b.adjustments=b.adjustments||[];b.adjustments.push({id:Date.now(),amount:n,note,date:new Date().toISOString()});saveBank(b);
}

function analysisPickOptions(r){
  return (r.rows||[]).map((x,i)=>({index:i,label:marketLabel(x.market),odds:Number(x.odds)||0,ev:Number(x.e)||0,decision:x.dec||""}));
}
function registerBet(analysisId){
  const r=loadDB().find(x=>x.id===analysisId);if(!r||!r.rows?.length)return alert("No hay picks disponibles.");
  const options=analysisPickOptions(r);
  const text=options.map((x,i)=>`${i+1}. ${x.label} @ ${x.odds.toFixed(2)} · EV ${(x.ev*100).toFixed(1)}% · ${x.decision}`).join("\n");
  const sel=prompt("Selecciona el número del pick que realmente apostaste:\n\n"+text,"1");if(sel===null)return;
  const idx=Number(sel)-1;if(!Number.isInteger(idx)||idx<0||idx>=options.length)return alert("Selección inválida.");
  const pick=options[idx];
  const stakeRaw=prompt("Monto apostado:", "50000");if(stakeRaw===null)return;
  const stake=Number(String(stakeRaw).replace(/[^\d.-]/g,""));if(!Number.isFinite(stake)||stake<=0)return alert("Monto inválido.");
  const oddsRaw=prompt("Cuota realmente tomada:",pick.odds.toFixed(2));if(oddsRaw===null)return;
  const odds=Number(oddsRaw);if(!Number.isFinite(odds)||odds<=1)return alert("Cuota inválida.");
  const unitRaw=prompt("Valor de 1 unidad (opcional, deja 0 si no usas unidades):","0");if(unitRaw===null)return;
  const unit=Number(String(unitRaw).replace(/[^\d.-]/g,""))||0;
  const bets=loadBets();
  bets.unshift({id:Date.now(),analysisId:r.id,date:r.date,home:r.home,away:r.away,market:r.rows[idx].market,label:pick.label,odds,stake,units:unit>0?stake/unit:null,status:"pending",pnl:0,source:"user",createdAt:new Date().toISOString()});
  saveBets(bets);renderHistory();openHistoryDetail(r.id);
}
function settleBet(betId){
  const bets=loadBets(),b=bets.find(x=>x.id===betId);if(!b)return;
  const res=(prompt("Resultado de la apuesta: WIN, LOSS o PUSH",b.status==="pending"?"WIN":b.status.toUpperCase())||"").trim().toLowerCase();
  if(!["win","loss","push"].includes(res))return alert("Resultado inválido.");
  b.status=res;b.pnl=calcBetPnl(b,res);b.settledAt=new Date().toISOString();
  saveBets(bets);renderHistory();openHistoryDetail(b.analysisId);
}
function deleteBet(betId){
  const bets=loadBets(),b=bets.find(x=>x.id===betId);if(!b)return;
  if(!confirm(`¿Eliminar esta apuesta?\n\n${b.label} · ${b.home} vs ${b.away} @ ${Number(b.odds).toFixed(2)}\n\nSe quitará del historial y el bank se recalculará automáticamente. El análisis del partido NO se borrará.`))return;
  const analysisId=b.analysisId;
  saveBets(bets.filter(x=>x.id!==betId));

  // Si era la apuesta bloqueada del partido, quitamos solo el vínculo con esa apuesta.
  // El pronóstico prepartido permanece bloqueado e intacto y se puede registrar una apuesta correcta después.
  const db=loadDB(),r=db.find(x=>x.id===analysisId);
  if(r&&Number(r.lockedBetId)===Number(betId)){
    delete r.lockedBetId;delete r.lockedMarket;
    saveDB(db);
  }

  // Si la misma selección está dentro de una combinada PENDIENTE, retirar solo esa pata.
  // No alteramos combinadas ya liquidadas para no reescribir el historial financiero cerrado.
  const combos=loadCombos();let comboChanged=false;
  combos.forEach(c=>{
    if(c.status!=="pending"||!Array.isArray(c.legs))return;
    const before=c.legs.length;
    c.legs=c.legs.filter(l=>!(Number(l.analysisId)===Number(analysisId)&&String(l.market)===String(b.market)));
    if(c.legs.length!==before){
      comboChanged=true;
      c.originalOdds=comboOdds(c.legs);
      c.legResults=null;
      c.effectiveOdds=null;
      c.editedAfterBetDelete=true;
    }
  });
  if(comboChanged)saveCombos(combos);

  renderHistory();renderBetHistory();renderCombos();renderBank();
  if(analysisId&&document.getElementById("historyDetail")&&!document.getElementById("historyDetail").classList.contains("hidden"))openHistoryDetail(analysisId);
}
function betsForAnalysis(id){return loadBets().filter(x=>x.analysisId===id)}
function betStatusLabel(s){return s==="win"?"GANADA":s==="loss"?"PERDIDA":s==="push"?"NULA / PUSH":"PENDIENTE"}
function betDetailHtml(id){
  const bets=betsForAnalysis(id);
  if(!bets.length)return '<p class="muted">No hay apuestas reales registradas para este análisis.</p>';
  return bets.map(b=>`<div class="bet-card"><b>${b.label}</b> @ ${b.odds.toFixed(2)} ${isFreeBet(b)?'<span class="status-chip watch">🎁 FREEBET</span>':''}<br>
    Stake: <b>${money(b.stake)}</b>${isFreeBet(b)?' promocional':''}${b.units!=null?` · ${b.units.toFixed(2)}u`:""}<br>
    Estado: <span class="bet-status status-${b.status}">${betStatusLabel(b.status)}</span><br>
    P&L: <span class="${b.pnl>=0?"money-positive":"money-negative"}">${money(b.pnl||0)}</span>
    <div class="actions" style="margin-top:7px"><button type="button" onclick="settleBet(${b.id})">Liquidar / editar</button><button type="button" class="dangerBtn" onclick="deleteBet(${b.id})">🗑️</button></div>
  </div>`).join("");
}

// ---------- COMBINADAS ----------
function refreshComboAnalysisOptions(){
  const sel=document.getElementById("comboAnalysisSelect");if(!sel)return;
  const db=loadDB();
  sel.innerHTML=db.length?db.map(r=>`<option value="${r.id}">${r.date||""} · ${r.home} vs ${r.away}</option>`).join(""):'<option value="">Sin análisis</option>';
  refreshComboPickOptions();
}
function refreshComboPickOptions(){
  const a=Number(document.getElementById("comboAnalysisSelect")?.value),sel=document.getElementById("comboPickSelect");if(!sel)return;
  const r=loadDB().find(x=>x.id===a);
  if(!r){sel.innerHTML='<option value="">Sin picks</option>';return}

  // V1.8.0 build 1800: en combinadas se muestran TODOS los picks guardados
  // del análisis, no solo el Top Pick / VALUE BET. Se agrupan por categoría
  // para que en iPhone sea fácil comprobar que no falta ningún mercado.
  const rows=(r.rows||[]).map((x,i)=>({x,i})).filter(({x})=>Number.isFinite(Number(x.odds))&&Number(x.odds)>1);
  if(!rows.length){sel.innerHTML='<option value="">Sin picks con cuota</option>';return}
  const order=["GANADORES","GOLES","HANDICAP","AMBOS MARCAN"];
  const groups=new Map(order.map(k=>[k,[]]));
  rows.forEach(o=>{const cat=o.x.category||marketCategory(o.x);if(!groups.has(cat))groups.set(cat,[]);groups.get(cat).push(o)});
  const optionHtml=({x,i})=>{
    const ev=Number.isFinite(Number(x.e))?(Number(x.e)*100).toFixed(1)+"% EV":"EV —";
    const dec=x.dec?` · ${x.dec}`:"";
    return `<option value="${i}">${marketLabel(x.market)} @ ${Number(x.odds).toFixed(2)} · ${ev}${dec}</option>`;
  };
  sel.innerHTML=[...groups.entries()].filter(([,arr])=>arr.length).map(([cat,arr])=>`<optgroup label="${categoryLabel(cat)} (${arr.length})">${arr.map(optionHtml).join("")}</optgroup>`).join("");
  const count=document.getElementById("comboPickCount");if(count)count.textContent=`${rows.length} picks disponibles en este partido`;
}
function addComboLeg(){
  const analysisId=Number(document.getElementById("comboAnalysisSelect")?.value),rowIndex=Number(document.getElementById("comboPickSelect")?.value);
  const r=loadDB().find(x=>x.id===analysisId),x=r?.rows?.[rowIndex];if(!r||!x)return alert("Selecciona un pick.");
  if(comboBuilder.some(l=>l.analysisId===analysisId&&l.rowIndex===rowIndex))return alert("Ese pick ya está en la combinada.");
  comboBuilder.push({analysisId,rowIndex,date:r.date,home:r.home,away:r.away,market:x.market,label:marketLabel(x.market),odds:Number(x.odds)});
  renderComboBuilder();
}
function removeComboLeg(i){comboBuilder.splice(i,1);renderComboBuilder()}
function comboOdds(legs){return legs.reduce((p,x)=>p*(Number(x.odds)||1),1)}
function renderComboBuilder(){
  const box=document.getElementById("comboBuilderLegs");if(!box)return;
  box.innerHTML=comboBuilder.length?comboBuilder.map((l,i)=>`<div class="combo-leg"><span><b>${l.label}</b> · ${l.home} vs ${l.away} @ ${l.odds.toFixed(2)}</span><button type="button" class="dangerBtn" onclick="removeComboLeg(${i})">×</button></div>`).join(""):'<p class="muted">Todavía no agregaste selecciones.</p>';
  const theoretical=comboOdds(comboBuilder),house=Number(document.getElementById("comboHouseOdds")?.value)||0,stake=Number(document.getElementById("comboStake")?.value)||0;
  const used=house>=1?house:theoretical;
  const o=document.getElementById("comboCombinedOdds"),h=document.getElementById("comboHouseOddsDisplay"),ret=document.getElementById("comboPotentialReturn");
  if(o)o.textContent=theoretical.toFixed(2);
  if(h)h.textContent=house>=1?house.toFixed(2):"—";
  if(ret)ret.textContent=money(stake*used);
}
function clearComboBuilder(){comboBuilder=[];if(document.getElementById("comboStake"))document.getElementById("comboStake").value="";if(document.getElementById("comboHouseOdds"))document.getElementById("comboHouseOdds").value="";if(document.getElementById("comboName"))document.getElementById("comboName").value="";renderComboBuilder()}
function saveCombo(){
  if(comboBuilder.length<2)return alert("Una combinada necesita al menos 2 selecciones.");
  const stake=Number(document.getElementById("comboStake")?.value)||0;if(stake<=0)return alert("Introduce el monto apostado.");
  const houseOdds=Number(document.getElementById("comboHouseOdds")?.value)||0;if(houseOdds<1)return alert("Introduce la cuota total real que muestra la casa de apuestas.");
  const name=document.getElementById("comboName")?.value.trim()||`Combinada ${new Date().toLocaleDateString("es-CO")}`;
  const theoreticalOdds=comboOdds(comboBuilder);
  const c={id:Date.now(),name,legs:JSON.parse(JSON.stringify(comboBuilder)),originalOdds:theoreticalOdds,theoreticalOdds,houseOdds,stake,status:"pending",pnl:0,createdAt:new Date().toISOString()};
  const combos=loadCombos();combos.unshift(c);saveCombos(combos);clearComboBuilder();renderCombos();
}
function settleCombo(id){
  const combos=loadCombos(),c=combos.find(x=>x.id===id);if(!c)return;
  let hasLoss=false,allPush=true,effectiveOdds=1,statuses=[];
  for(const leg of c.legs){
    const raw=leg.voidedByAnalysisDelete?"push":(prompt(`Resultado de:\n${leg.label} · ${leg.home} vs ${leg.away}\n\nWIN / LOSS / PUSH`,"WIN")||"").trim().toLowerCase();
    if(!["win","loss","push"].includes(raw))return alert("Liquidación cancelada: resultado inválido.");
    statuses.push(raw);
    if(raw==="loss")hasLoss=true;
    if(raw==="win"){allPush=false;effectiveOdds*=Number(leg.odds)||1}
  }
  c.legResults=statuses;
  if(hasLoss){
    c.status="loss";c.pnl=-c.stake;c.effectiveOdds=0;
  }else if(allPush){
    c.status="push";c.pnl=0;c.effectiveOdds=1;
  }else{
    const hasPush=statuses.includes("push");
    let settledOdds;
    if(hasPush){
      const suggested=effectiveOdds.toFixed(2);
      const entered=Number(prompt(`Hay una selección PUSH.\nIntroduce la cuota efectiva final liquidada por la casa:`,suggested));
      if(!Number.isFinite(entered)||entered<1)return alert("Liquidación cancelada: cuota efectiva inválida.");
      settledOdds=entered;
    }else{
      settledOdds=Number(c.houseOdds)||Number(c.originalOdds)||effectiveOdds;
    }
    c.effectiveOdds=settledOdds;c.status="win";c.pnl=c.stake*(settledOdds-1);
  }
  c.settledAt=new Date().toISOString();saveCombos(combos);renderCombos();
}
function editComboOdds(id){
  const combos=loadCombos(),c=combos.find(x=>x.id===id);if(!c)return;
  const current=Number(c.houseOdds||c.effectiveOdds||c.originalOdds||1);
  const raw=prompt("Cuota total REAL de la casa:",current.toFixed(2));
  if(raw===null)return;
  const houseOdds=Number(raw);
  if(!Number.isFinite(houseOdds)||houseOdds<1)return alert("Cuota inválida.");
  c.houseOdds=houseOdds;
  // Si ya ganó sin PUSH, la cuota efectiva debe ser la cuota real de la casa.
  if(c.status==="win"){
    const hasPush=Array.isArray(c.legResults)&&c.legResults.includes("push");
    if(hasPush){
      const effRaw=prompt("Esta combinada tuvo PUSH. Introduce la cuota EFECTIVA final liquidada por la casa:",Number(c.effectiveOdds||houseOdds).toFixed(2));
      if(effRaw===null)return;
      const eff=Number(effRaw);if(!Number.isFinite(eff)||eff<1)return alert("Cuota efectiva inválida.");
      c.effectiveOdds=eff;
    }else{
      c.effectiveOdds=houseOdds;
    }
    c.pnl=Number(c.stake||0)*(Number(c.effectiveOdds)-1);
  }else if(c.status==="push"){
    c.effectiveOdds=1;c.pnl=0;
  }else if(c.status==="loss"){
    c.pnl=-Number(c.stake||0);
  }
  c.editedAt=new Date().toISOString();
  saveCombos(combos);renderCombos();
}
function deleteCombo(id){if(!confirm("¿Borrar esta combinada?"))return;saveCombos(loadCombos().filter(x=>x.id!==id));renderCombos()}
function renderCombos(){
  refreshComboAnalysisOptions();renderComboBuilder();
  const combos=loadCombos(),list=document.getElementById("comboList"),stats=document.getElementById("comboStats");if(!list||!stats)return;
  const settled=combos.filter(x=>x.status!=="pending"),pnl=settled.reduce((s,x)=>s+(Number(x.pnl)||0),0),staked=settled.reduce((s,x)=>s+(Number(x.stake)||0),0);
  stats.innerHTML=`<span class="metric">Combinadas: ${combos.length}</span><span class="metric">P&L: ${money(pnl)}</span><span class="metric">ROI: ${staked?(pnl/staked*100).toFixed(1):"0.0"}%</span>`;
  list.innerHTML=combos.length?combos.map(c=>`<div class="combo-card"><b>${c.name}</b><br>
    ${c.legs.map((l,i)=>`${i+1}. ${l.label} · ${l.home} vs ${l.away} @ ${l.voidedByAnalysisDelete?"1.00 (ANULADA)":l.odds.toFixed(2)}${c.legResults?` — ${betStatusLabel(c.legResults[i])}`:""}`).join("<br>")}
    <hr><b>Teórica:</b> ${Number(c.theoreticalOdds||c.originalOdds||1).toFixed(2)} · <b>Casa:</b> ${Number(c.houseOdds||c.originalOdds||1).toFixed(2)}${c.status!=="pending"&&c.effectiveOdds?` · <b>Efectiva:</b> ${Number(c.effectiveOdds).toFixed(2)}`:""} · <b>Stake:</b> ${money(c.stake)}<br>
    Estado: <span class="bet-status status-${c.status}">${betStatusLabel(c.status)}</span> · P&L: <span class="${c.pnl>=0?"money-positive":"money-negative"}">${money(c.pnl||0)}</span>
    <div class="actions" style="margin-top:7px"><button type="button" class="secondary" onclick="editComboOdds(${c.id})">✏️ Editar cuota casa</button>${c.status==="pending"?`<button type="button" onclick="settleCombo(${c.id})">Liquidar combinada</button>`:`<button type="button" class="secondary" onclick="settleCombo(${c.id})">Editar liquidación</button>`}<button type="button" class="dangerBtn" onclick="deleteCombo(${c.id})">🗑️</button></div>
  </div>`).join(""):'<p class="muted">Todavía no hay combinadas guardadas.</p>';
  renderBank();
}

// ---------- OVERRIDES V1.6.1 ----------
function show(id){
  ["analysis","history","betHistory","combos","backup"].forEach(x=>document.getElementById(x)?.classList.toggle("hidden",x!==id));
  if(id==="history")renderHistory();
  if(id==="betHistory")renderBetHistory();
  if(id==="combos")renderCombos();
}
function renderHistory(){
  const db=loadDB(),bets=loadBets();
  const settled=bets.filter(x=>x.status!=="pending"),wins=settled.filter(x=>x.status==="win").length,loss=settled.filter(x=>x.status==="loss").length,push=settled.filter(x=>x.status==="push").length;
  const pnl=settled.reduce((s,x)=>s+(Number(x.pnl)||0),0),staked=settled.reduce((s,x)=>s+(Number(x.stake)||0),0),hit=(wins+loss)?wins/(wins+loss)*100:0;
  document.getElementById("stats").innerHTML=`<span class="metric">Análisis: ${db.length}</span><span class="metric">Apuestas: ${bets.length}</span><span class="metric">Ganadas: ${wins}</span><span class="metric">Perdidas: ${loss}</span><span class="metric">Nulas: ${push}</span><span class="metric">Acierto: ${hit.toFixed(1)}%</span><span class="metric">P&L: ${money(pnl)}</span><span class="metric">ROI: ${staked?(pnl/staked*100).toFixed(1):"0.0"}%</span>`;
  let h="<table><tr><th>Fecha</th><th>Partido</th><th>Mejor pick</th><th>Cuota</th><th>EV</th><th>Apuestas</th><th></th></tr>";
  db.forEach(r=>{const x=r.rows&&r.rows[0],rb=betsForAnalysis(r.id);h+=`<tr class="history-row" onclick="openHistoryDetail(${r.id})"><td>${r.date}</td><td><b>${r.home}</b> vs <b>${r.away}</b></td><td>${x?marketLabel(x.market):"-"}</td><td>${x?Number(x.odds).toFixed(2):"-"}</td><td>${x?(Number(x.e)*100).toFixed(1)+"%":"-"}</td><td>${rb.length}</td><td><button type="button" onclick="event.stopPropagation();registerBet(${r.id})">+ Apuesta</button> <button type="button" class="dangerBtn" onclick="event.stopPropagation();deleteRecord(${r.id})">🗑️</button></td></tr>`});
  document.getElementById("historyTable").innerHTML=h+"</table>";
  renderBank();
}
const _openHistoryDetailV16=openHistoryDetail;
openHistoryDetail=function(id){
  _openHistoryDetailV16(id);
  const box=document.getElementById("historyDetail");
  const card=box?.querySelector(".card");if(!card)return;
  const actions=card.querySelector(".actions");
  const betting=document.createElement("div");betting.className="detail-section";
  betting.innerHTML=`<h3>🎟️ Apuestas reales</h3>${betDetailHtml(id)}<button type="button" onclick="registerBet(${id})">+ Registrar apuesta sobre un pick</button>`;
  if(actions)card.insertBefore(betting,actions);else card.appendChild(betting);
  // Oculta el viejo botón de liquidar pick principal para evitar doble contabilidad.
  [...card.querySelectorAll("button")].filter(b=>b.textContent.includes("Liquidar pick principal")).forEach(b=>b.style.display="none");
}
settle=function(id){registerBet(id)};

function exportData(){
  const payload={format:"SoyJordan Picks Backup",version:"1.8.0",exportedAt:new Date().toISOString(),analyses:loadDB(),bets:loadBets(),combos:loadCombos(),bank:loadBank()};
  const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="SoyJordan_Picks_V1_8_0_Backup.json";a.click();document.getElementById("dataMsg").textContent="Backup V1.8.0 exportado.";
}
function importData(e){
  const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{
    const incoming=JSON.parse(rd.result);
    // Compatibilidad: backups antiguos eran solo un array de análisis.
    const analyses=Array.isArray(incoming)?incoming:(incoming.analyses||[]);
    if(!Array.isArray(analyses))throw Error();
    const current=loadDB(),byId=new Map(current.map(x=>[String(x.id),x]));analyses.forEach(x=>{if(x?.id!=null)byId.set(String(x.id),x)});saveDB([...byId.values()].sort((a,b)=>(Number(b.id)||0)-(Number(a.id)||0)));
    if(!Array.isArray(incoming)){
      if(Array.isArray(incoming.bets)){const m=new Map(loadBets().map(x=>[String(x.id),x]));incoming.bets.forEach(x=>x?.id!=null&&m.set(String(x.id),x));saveBets([...m.values()])}
      if(Array.isArray(incoming.combos)){const m=new Map(loadCombos().map(x=>[String(x.id),x]));incoming.combos.forEach(x=>x?.id!=null&&m.set(String(x.id),x));saveCombos([...m.values()])}
      if(incoming.bank&&typeof incoming.bank==="object")saveBank(incoming.bank);
    }
    document.getElementById("dataMsg").textContent=`Backup importado. Análisis: ${loadDB().length} · Apuestas: ${loadBets().length} · Combinadas: ${loadCombos().length}.`;
    document.getElementById("importFile").value="";renderBank();show("history");
  }catch{document.getElementById("dataMsg").textContent="Archivo no válido.";document.getElementById("importFile").value=""}};
  rd.readAsText(f);
}
function syncCombosFromAudits(){
  const combos=loadCombos(),db=loadDB();let changed=0;
  combos.forEach(c=>{
    if(c.status!=="pending")return;
    const statuses=c.legs.map(leg=>{
      if(leg.voidedByAnalysisDelete)return "push";
      const r=db.find(x=>x.id===leg.analysisId);if(!r?.realResult)return null;
      const row=(r.rows||[])[leg.rowIndex]||(r.rows||[]).find(x=>String(x.market)===String(leg.market));
      if(!row)return null;
      return evaluateMarketOutcome(row,r,Number(r.realResult.homeGoals),Number(r.realResult.awayGoals));
    });
    c.legResults=statuses;
    if(statuses.some(x=>x==="loss")){c.status="loss";c.pnl=-Number(c.stake||0);c.settledAt=new Date().toISOString();c.autoSettled=true;changed++;return}
    if(statuses.some(x=>x==null))return;
    const wins=statuses.filter(x=>x==="win");
    if(statuses.includes("push")){
      // La casa puede recalcular correlaciones de forma distinta tras un PUSH.
      // Se deja pendiente para introducir la cuota efectiva real de liquidación.
      c.needsEffectiveOdds=true;return;
    }
    if(!wins.length){c.status="push";c.pnl=0;c.effectiveOdds=1}
    else{
      const settledOdds=Number(c.houseOdds)||Number(c.originalOdds)||1;
      c.effectiveOdds=settledOdds;c.status="win";c.pnl=Number(c.stake||0)*(settledOdds-1);
    }
    c.settledAt=new Date().toISOString();c.autoSettled=true;changed++;
  });
  if(changed)saveCombos(combos);
  return changed;
}
function perfStats(items){
  const settled=items.filter(x=>x.status&&x.status!=="pending"),wins=settled.filter(x=>x.status==="win").length,loss=settled.filter(x=>x.status==="loss").length,push=settled.filter(x=>x.status==="push").length;
  const pnl=settled.reduce((s,x)=>s+(Number(x.pnl)||0),0);
  const cash=settled.filter(x=>!isFreeBet(x)),promo=settled.filter(x=>isFreeBet(x));
  const staked=cash.reduce((s,x)=>s+(Number(x.stake)||0),0),cashPnl=cash.reduce((s,x)=>s+(Number(x.pnl)||0),0),promoPnl=promo.reduce((s,x)=>s+(Number(x.pnl)||0),0),hit=(wins+loss)?wins/(wins+loss)*100:0;
  return {count:items.length,settled:settled.length,wins,loss,push,pnl,staked,cashPnl,promoPnl,promoCount:promo.length,hit,roi:staked?cashPnl/staked*100:0};
}
function renderBetHistory(){
  const db=loadDB(),bets=loadBets(),combos=loadCombos();
  const user=perfStats(bets),combo=perfStats(combos),financial=perfStats([...bets,...combos]),audit=auditPortfolioSummary(db);
  const stats=document.getElementById("betHistoryStats"),table=document.getElementById("betHistoryTable");if(!stats||!table)return;
  stats.innerHTML=`<div class="summary">
    <div class="box"><b>⭐ Top Pick App</b><br>W/L/P ${audit.wins}/${audit.loss}/${audit.push}<br><span class="small">Acierto ${audit.hit.toFixed(1)}%</span></div>
    <div class="box"><b>👤 Apuestas tuyas</b><br>W/L/P ${user.wins}/${user.loss}/${user.push}<br><span class="small">P&L ${money(user.pnl)} · ROI dinero real ${user.roi.toFixed(1)}%${user.promoCount?`<br>🎁 Bonos: ${user.promoCount} · Ganancia ${money(user.promoPnl)}`:""}</span></div>
    <div class="box"><b>🔗 Combinadas</b><br>W/L/P ${combo.wins}/${combo.loss}/${combo.push}<br><span class="small">P&L ${money(combo.pnl)} · ROI ${combo.roi.toFixed(1)}%</span></div>
    <div class="box"><b>💰 Consolidado real</b><br>${financial.settled} liquidadas<br><span class="small">P&L ${money(financial.pnl)} · ROI/Yield ${financial.roi.toFixed(1)}%</span></div>
  </div>`;
  const appRows=db.filter(r=>r.realResult&&getTopGeneral(r)).map(r=>{const a=auditMetrics(r),t=a?.top;return {ts:r.realResult.recordedAt||r.date,type:"⭐ APP",match:`${r.home} vs ${r.away}`,pick:t?marketLabel(t.market):"—",odds:t?Number(t.odds):null,status:a?.topOutcome||"pending",pnl:null,stake:null}});
  const userRows=bets.map(b=>({ts:b.settledAt||b.createdAt||b.date,type:isFreeBet(b)?"🎁 FREEBET":(b.isLockedChoice?"👤 ELEGIDA":"👤 APUESTA"),match:`${b.home} vs ${b.away}`,pick:b.label,odds:Number(b.odds),status:b.status,pnl:Number(b.pnl)||0,stake:Number(b.stake)||0,betId:b.id,isFreeBet:isFreeBet(b)}));
  const comboRows=combos.map(c=>({ts:c.settledAt||c.createdAt,type:"🔗 COMBINADA",match:c.name,pick:`${c.legs.length} selecciones`,odds:Number(c.effectiveOdds||c.houseOdds||c.originalOdds),status:c.status,pnl:Number(c.pnl)||0,stake:Number(c.stake)||0}));
  const rows=[...appRows,...userRows,...comboRows].sort((a,b)=>new Date(b.ts||0)-new Date(a.ts||0));
  table.innerHTML=rows.length?`<div class="history-cards">${rows.map(x=>`<div class="history-card"><div class="history-card-top"><div><div class="history-date">${x.type}</div><div class="history-match">${x.match}</div></div><span class="bet-status status-${x.status}">${betStatusLabel(x.status)}</span></div><div class="history-pick"><div><small>PICK</small><br><b>${x.pick}</b></div><div style="text-align:right"><small>CUOTA</small><br><b>${x.odds?x.odds.toFixed(2):"—"}</b></div></div>${x.stake!=null?`<div class="small muted">Stake ${money(x.stake)}${x.isFreeBet?' (FreeBet)':''} · P&L <span class="${x.pnl>=0?"money-positive":"money-negative"}">${money(x.pnl)}</span></div>${x.betId!=null?`<div class="actions" style="margin-top:8px"><button type="button" class="dangerBtn" onclick="deleteBet(${x.betId})">🗑️ Eliminar apuesta</button></div>`:""}`:`<div class="small muted">Evaluación virtual del Top Pick; no afecta el bank.</div>`}</div>`).join("")}</div>`:'<p class="muted">Todavía no hay resultados de apuestas.</p>';
}

function clearAll(){
  if(confirm("¿Borrar análisis, apuestas, combinadas y datos del bank de este iPhone?")){
    localStorage.removeItem("valuePickDB");localStorage.removeItem(BETS_KEY);localStorage.removeItem(COMBOS_KEY);localStorage.removeItem(BANK_KEY);
    renderBank();renderHistory();document.getElementById("dataMsg").textContent="Todos los datos fueron borrados.";
  }
}
setTimeout(()=>{renderBank();refreshComboAnalysisOptions();},300);


// ==================== V1.8.0 · UX / CAPTURA / BLOQUEO ====================
let betModalState={analysisId:null,rowIndex:0};
function openBetModal(analysisId){
  const r=loadDB().find(x=>x.id===analysisId);if(!r||!r.rows?.length)return alert("No hay picks disponibles.");
  betModalState={analysisId,rowIndex:0};
  document.getElementById("betModalTitle").textContent=`${r.home} vs ${r.away}`;
  document.getElementById("betPickGrid").innerHTML=(r.rows||[]).map((x,i)=>{
    const cls=x.dec==="VALUE BET"?"good":x.dec==="WATCH"?"watch":"bad";
    return `<div class="pick-option ${cls} ${i===0?'selected':''}" onclick="selectBetPick(${i})" data-pick-index="${i}"><div class="pick-option-row"><div><div class="pick-name">${marketLabel(x.market)}</div><div class="mini">${x.dec||''}</div></div><div class="pick-metric"><div class="mini">Prob.</div><b>${(Number(x.p)*100).toFixed(1)}%</b></div><div class="pick-metric"><div class="mini">EV</div><b>${(Number(x.e)*100).toFixed(1)}%</b></div><div class="pick-metric"><div class="mini">Conf.</div><b>${Number(x.conf||0).toFixed(0)}</b></div><div><div class="mini">Cuota</div><b>${Number(x.odds).toFixed(2)}</b></div></div></div>`;
  }).join("");
  document.getElementById("betOddsInput").value=Number(r.rows[0].odds).toFixed(2);
  const typeEl=document.getElementById("betStakeType");if(typeEl)typeEl.value="cash";
  document.getElementById("betModal").classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeBetModal(){document.getElementById("betModal").classList.add("hidden");document.body.style.overflow=""}
function selectBetPick(i){
  betModalState.rowIndex=i;document.querySelectorAll("#betPickGrid .pick-option").forEach((el,n)=>el.classList.toggle("selected",n===i));
  const r=loadDB().find(x=>x.id===betModalState.analysisId);if(r?.rows?.[i])document.getElementById("betOddsInput").value=Number(r.rows[i].odds).toFixed(2);
}
function confirmBetFromModal(){
  const r=loadDB().find(x=>x.id===betModalState.analysisId),idx=betModalState.rowIndex;if(!r||!r.rows?.[idx])return;
  const row=r.rows[idx],stake=Number(document.getElementById("betStakeInput").value),odds=Number(document.getElementById("betOddsInput").value),unit=Number(document.getElementById("betUnitInput").value)||0,betType=document.getElementById("betStakeType")?.value||"cash";
  if(!Number.isFinite(stake)||stake<=0)return alert("Monto inválido.");if(!Number.isFinite(odds)||odds<=1)return alert("Cuota inválida.");
  const pick=analysisPickOptions(r)[idx],bets=loadBets();
  bets.unshift({id:Date.now(),analysisId:r.id,date:r.date,home:r.home,away:r.away,market:row.market,label:pick.label,odds,stake,betType,isFreeBet:betType==="freebet",units:unit>0?stake/unit:null,status:"pending",pnl:0,source:"user",isLockedChoice:true,createdAt:new Date().toISOString(),preMatchSnapshot:{modelVersion:r.version||"1.6",lambdaHome:r.hl,lambdaAway:r.al,prob:row.p,ev:row.e,confidence:row.conf,robustness:row.robustness,worstEV:row.worstEV,decision:row.dec}});
  bets.forEach((b,i)=>{if(i>0&&b.analysisId===r.id)b.isLockedChoice=false});
  saveBets(bets);
  const db=loadDB(),rec=db.find(x=>x.id===r.id);if(rec){rec.preMatchLocked=true;rec.lockedAt=new Date().toISOString();rec.lockedBetId=bets[0].id;rec.lockedMarket=row.market;saveDB(db)}
  closeBetModal();renderHistory();openHistoryDetail(r.id);
}
registerBet=openBetModal;

const _loadRecordIntoFormV162=loadRecordIntoForm;
loadRecordIntoForm=function(id){
  const r=loadDB().find(x=>x.id===id);if(!r)return;
  if(!r.preMatchLocked)return _loadRecordIntoFormV162(id);
  // V1.7.1: un registro prepartido bloqueado se conserva intacto,
  // pero sus datos pueden reutilizarse como una COPIA editable para pruebas/reanálisis.
  editingRecordId=null;
  const savedOdds=r.odds||Object.fromEntries((r.rows||[]).map(x=>[x.market,x.odds]));
  const copiedNote=[r.notes||'',`Copia editable de registro prepartido bloqueado #${r.id}. El original permanece intacto.`].filter(Boolean).join('\n');
  const d={date:r.date,league:r.league,season:r.season,leagueAvg:r.leagueAvg||'',matchMode:r.matchMode||'league',homeLeagueAvg:r.homeLeagueAvg||r.leagueAvg||'',awayLeagueAvg:r.awayLeagueAvg||r.leagueAvg||'',homeLeagueStrength:r.homeLeagueStrength??50,awayLeagueStrength:r.awayLeagueStrength??50,homeTeamStrength:r.homeTeamStrength??50,awayTeamStrength:r.awayTeamStrength??50,cupStage:r.cupContext?.stage||'Playoff',cupLeg:r.cupContext?.leg||'single',aggHome:r.cupContext?.aggHome||0,aggAway:r.cupContext?.aggAway||0,dataSource:r.dataSource||'',home:r.home,away:r.away,notes:copiedNote,teams:r.teams,absences:r.absences,absenceImpactInput:r.absenceImpact||null,odds:savedOdds,eh:r.eh||null};
  localStorage.setItem(DRAFT_KEY,JSON.stringify(d));
  document.getElementById('result').innerHTML='';
  closeHistoryDetail();show('analysis');restoreDraft();
  setDraftStatus('🧪 Copia editable cargada. El registro prepartido original sigue bloqueado e intacto; al analizar y guardar se creará un registro nuevo.');
};

function renderHistory(){
  const db=loadDB(),bets=loadBets();
  const settled=bets.filter(x=>x.status!=="pending"),wins=settled.filter(x=>x.status==="win").length,loss=settled.filter(x=>x.status==="loss").length,push=settled.filter(x=>x.status==="push").length;
  const pnl=settled.reduce((s,x)=>s+(Number(x.pnl)||0),0),staked=settled.reduce((s,x)=>s+(Number(x.stake)||0),0),hit=(wins+loss)?wins/(wins+loss)*100:0;
  document.getElementById("stats").innerHTML=`<span class="metric">Análisis: ${db.length}</span><span class="metric">Apuestas: ${bets.length}</span><span class="metric">Ganadas: ${wins}</span><span class="metric">Perdidas: ${loss}</span><span class="metric">Nulas: ${push}</span><span class="metric">Acierto: ${hit.toFixed(1)}%</span><span class="metric">P&L: ${money(pnl)}</span><span class="metric">ROI: ${staked?(pnl/staked*100).toFixed(1):"0.0"}%</span>`;
  const html=db.map(r=>{const x=getTopGeneral(r),rb=betsForAnalysis(r.id),pending=rb.filter(b=>b.status==="pending").length;return `<div class="history-card" onclick="openHistoryDetail(${r.id})"><div class="history-card-top"><div><div class="history-date">${r.date||''} · ${r.league||''}</div><div class="history-match">${r.home} <span class="muted">vs</span> ${r.away}</div></div><div>${r.preMatchLocked?'<span class="status-chip locked">🔒 BLOQUEADO</span>':pending?'<span class="status-chip pending">PENDIENTE</span>':''}</div></div>${x?`<div class="history-pick"><div><small>MEJOR PICK DEL MODELO</small><br><b>${marketLabel(x.market)}</b></div><div style="text-align:right"><small>Cuota · EV</small><br><b>${Number(x.odds).toFixed(2)} · ${(Number(x.e)*100).toFixed(1)}%</b></div></div>`:`<div class="history-pick"><div><small>TOP GENERAL</small><br><b>NO BET</b></div><div style="text-align:right"><small>Filtro V1.8.0</small><br><b>Sin candidato suficiente</b></div></div>`}<div class="history-card-actions"><button type="button" onclick="event.stopPropagation();openBetModal(${r.id})">+ Registrar apuesta</button><button type="button" class="secondary" onclick="event.stopPropagation();downloadHistoryCapture(${r.id})">📸 Captura</button><button type="button" class="dangerBtn" onclick="event.stopPropagation();deleteRecord(${r.id})">🗑️</button></div>${rb.length?`<div class="small muted" style="margin-top:6px">${rb.length} apuesta(s) registrada(s) · ${pending} pendiente(s)</div>`:''}</div>`}).join("");
  document.getElementById("historyTable").innerHTML=`<div class="history-cards">${html||'<p class="muted">Todavía no hay análisis guardados.</p>'}</div>`;renderBank();
}

const _renderBankV162=renderBank;
renderBank=function(){_renderBankV162();const s=financeSummary(),p=document.getElementById("bankPnlCompact");if(p){p.textContent=money(s.pnl);p.className=s.pnl>=0?"money-positive":"money-negative"}}

function ensureCapturePreview(){
  let m=document.getElementById('capturePreviewModal');if(m)return m;
  m=document.createElement('div');m.id='capturePreviewModal';m.className='modal';m.style.display='none';
  m.innerHTML=`<div class="modal-sheet" style="max-width:720px"><div class="detail-head"><div><h2 style="margin:0">📸 Captura generada</h2><div class="small muted">En iPhone pulsa “Compartir / Guardar” y luego “Guardar imagen” o “Guardar en Archivos”.</div></div><button class="secondary" type="button" onclick="closeCapturePreview()">✕</button></div><div style="max-height:62vh;overflow:auto;background:#eee;border-radius:12px;padding:8px"><img id="capturePreviewImg" style="display:block;width:100%;height:auto;border-radius:8px" alt="Captura SoyJordan Picks"></div><div class="actions" style="margin-top:10px"><button id="captureShareBtn" type="button">📤 Compartir / Guardar</button><button id="captureDownloadBtn" class="secondary" type="button">⬇️ Descargar PNG</button></div></div>`;
  document.body.appendChild(m);return m;
}
function closeCapturePreview(){const m=document.getElementById('capturePreviewModal');if(m)m.style.display='none'}
function dataUrlToBlob(dataUrl){
  const parts=dataUrl.split(','),meta=parts[0]||'',b64=parts[1]||'';
  const mime=(meta.match(/data:([^;]+)/)||[])[1]||'image/png';
  const bin=atob(b64),len=bin.length,arr=new Uint8Array(len);
  for(let i=0;i<len;i++)arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:mime});
}
function showCapturePreview(dataUrl,filename){
  const m=ensureCapturePreview(),img=m.querySelector('#capturePreviewImg'),share=m.querySelector('#captureShareBtn'),down=m.querySelector('#captureDownloadBtn');
  img.src=dataUrl;m.style.display='flex';

  share.onclick=async()=>{
    try{
      const blob=dataUrlToBlob(dataUrl);
      let file=null;
      try{file=new File([blob],filename,{type:'image/png'})}catch(e){}
      if(file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
        await navigator.share({files:[file],title:'SoyJordan Picks'});
      }else{
        const w=window.open();
        if(w){w.document.write(`<title>${filename}</title><img src="${dataUrl}" style="max-width:100%;height:auto">`);w.document.close();}
        else location.href=dataUrl;
      }
    }catch(e){
      console.error('share capture',e);
      const w=window.open();
      if(w){w.document.write(`<title>${filename}</title><img src="${dataUrl}" style="max-width:100%;height:auto">`);w.document.close();}
    }
  };

  down.onclick=()=>{
    try{
      const a=document.createElement('a');
      a.href=dataUrl;a.download=filename;a.rel='noopener';
      document.body.appendChild(a);a.click();a.remove();
    }catch(e){
      console.error('download capture',e);
      const w=window.open();
      if(w){w.document.write(`<title>${filename}</title><img src="${dataUrl}" style="max-width:100%;height:auto">`);w.document.close();}
    }
  };
}
function roundRect(ctx,x,y,w,h,r,fill,stroke){
  r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}
}
function fitText(ctx,text,maxWidth){text=String(text??'');if(ctx.measureText(text).width<=maxWidth)return text;let t=text;while(t.length>2&&ctx.measureText(t+'…').width>maxWidth)t=t.slice(0,-1);return t+'…'}
function drawText(ctx,text,x,y,size=26,weight='400',color='#111',align='left'){
  ctx.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(text??''),x,y)
}
function captureRecord(){
  const db=loadDB();
  // Prefer the record whose result is currently displayed; fall back to latest.
  const home=(document.getElementById('home')?.value||'').trim(),away=(document.getElementById('away')?.value||'').trim();
  return db.find(r=>r.home===home&&r.away===away)||db[0]||null;
}
async function buildResultCanvas(r){
  if(!r)throw new Error('No record');

  // 1080px keeps the full audit table readable while remaining safe on iPhone.
  const W=1080, pad=34, content=W-pad*2;
  const rows=(r.rows||[]).slice();

  // Dynamic layout. Previous capture underestimated the real vertical space
  // and could cut the last markets/footer.
  const brandH=92, matchH=92, summaryH=154, confH=54;
  const diagRowH=50, diagRows=10, diagH=88+diagRows*diagRowH;
  const auditH=r.realResult?174:0;
  const noteH=126, tableHeaderH=56, tableRowH=60;
  const topGeneralH=108, catTitleH=48, catTopH=52;
  const captureCats=["GANADORES","GOLES","HANDICAP","AMBOS MARCAN"];
  const captureGroups=captureCats.map(cat=>({cat,rows:rows.filter(x=>(x.category||marketCategory(x))===cat)})).filter(g=>g.rows.length);
  const generalPick=rows.find(x=>x.topGeneral);
  const categoryExtra=captureGroups.reduce((sum,g)=>sum+catTitleH+tableHeaderH+(g.rows.some(x=>x.categoryTop)?catTopH:0)+18,0);
  const footerH=74;
  const gaps=24+22+28+24+26+28+(r.realResult?24:0); // spacing between major blocks
  const H=36+brandH+matchH+summaryH+confH+auditH+diagH+noteH+topGeneralH+20+categoryExtra+(rows.length*tableRowH)+footerH+gaps;

  const canvas=document.createElement('canvas');
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas 2D no disponible');

  ctx.fillStyle='#f6f7f8'; ctx.fillRect(0,0,W,H);
  let y=36;

  // ---------- Brand ----------
  roundRect(ctx,pad,y,content,brandH,24,'#0b0b0c');
  drawText(ctx,'🎯',pad+24,y+58,40,'700','#fff');
  drawText(ctx,'SOYJORDAN PICKS',pad+84,y+40,29,'800','#fff');
  drawText(ctx,'ANÁLISIS DE VALOR',pad+84,y+67,15,'700','#b9bcc1');
  drawText(ctx,'V1.8.0',W-pad-24,y+55,21,'700','#fff','right');
  y+=brandH+24;

  // ---------- Match ----------
  drawText(ctx,`${r.home}  vs  ${r.away}`,pad,y+34,37,'800','#0b0b0c');
  drawText(ctx,`${r.date||''}${r.league?' · '+r.league:''}${r.season?' · '+r.season:''}`,pad,y+66,18,'500','#666');
  y+=matchH;

  // ---------- Team summary ----------
  const gap=18,bw=(content-gap)/2;
  roundRect(ctx,pad,y,bw,summaryH,20,'#fff','#c7c9cc');
  roundRect(ctx,pad+bw+gap,y,bw,summaryH,20,'#fff','#c7c9cc');

  const homeAbsAtt=Number(r.absenceImpact?.home?.att ?? 0);
  const homeAbsDef=Number(r.absenceImpact?.home?.def ?? 0);
  const awayAbsAtt=Number(r.absenceImpact?.away?.att ?? 0);
  const awayAbsDef=Number(r.absenceImpact?.away?.def ?? 0);

  drawText(ctx,r.home,pad+22,y+37,25,'800');
  drawText(ctx,`λ goles: ${Number(r.hl||0).toFixed(2)}`,pad+22,y+73,24,'700');
  drawText(ctx,`Ausencia ataque: ${homeAbsAtt.toFixed(0)}/100`,pad+22,y+105,18,'500');
  drawText(ctx,`Ausencia defensa: ${homeAbsDef.toFixed(0)}/100`,pad+22,y+132,18,'500');

  const x2=pad+bw+gap+22;
  drawText(ctx,r.away,x2,y+37,25,'800');
  drawText(ctx,`λ goles: ${Number(r.al||0).toFixed(2)}`,x2,y+73,24,'700');
  drawText(ctx,`Ausencia ataque: ${awayAbsAtt.toFixed(0)}/100`,x2,y+105,18,'500');
  drawText(ctx,`Ausencia defensa: ${awayAbsDef.toFixed(0)}/100`,x2,y+132,18,'500');
  y+=summaryH+22;

  // ---------- Data confidence ----------
  drawText(ctx,`Confianza de datos: ${Number(r.dataConfidence||0).toFixed(0)}/95`,pad,y+29,24,'700');
  y+=confH;

  // ---------- Post-match audit (only after a real result is registered) ----------
  if(r.realResult){
    const rr=r.realResult, top=(r.rows||[]).find(x=>x.topGeneral)||(r.rows||[])[0], topOutcome=top?evaluateMarketOutcome(top,r,rr.homeGoals,rr.awayGoals):null;
    roundRect(ctx,pad,y,content,auditH,18,'#fff','#111');
    drawText(ctx,'✅ Auditoría postpartido',pad+20,y+36,25,'800');
    drawText(ctx,`${r.home}  ${rr.homeGoals} - ${rr.awayGoals}  ${r.away}`,pad+20,y+73,27,'800','#111');
    const resultLabel=topOutcome?auditOutcomeLabel(topOutcome):'—';
    drawText(ctx,`Mejor pick prepartido: ${top?marketLabel(top.market):'—'}  ·  ${resultLabel}`,pad+20,y+105,17,'700',topOutcome==='win'?'#166534':topOutcome==='loss'?'#a82424':'#555');
    const hasXg=rr.homeXg!==null&&rr.homeXg!==undefined&&rr.homeXg!==''&&rr.awayXg!==null&&rr.awayXg!==undefined&&rr.awayXg!==''&&Number.isFinite(Number(rr.homeXg))&&Number.isFinite(Number(rr.awayXg));
    const targetH=hasXg?Number(rr.homeXg):Number(rr.homeGoals),targetA=hasXg?Number(rr.awayXg):Number(rr.awayGoals);
    const maeH=Math.abs(targetH-Number(r.hl||0)),maeA=Math.abs(targetA-Number(r.al||0));
    drawText(ctx,`λ previsto ${Number(r.hl||0).toFixed(2)} - ${Number(r.al||0).toFixed(2)}  ·  Error abs. λ vs ${hasXg?'xG':'goles'} ${maeH.toFixed(2)} / ${maeA.toFixed(2)}`,pad+20,y+134,16,'600','#444');
    const rxg=hasXg?`xG real ${Number(rr.homeXg).toFixed(2)} - ${Number(rr.awayXg).toFixed(2)}`:'xG real: no registrado (error λ usa goles como respaldo)';
    drawText(ctx,rxg,pad+20,y+160,15,'500','#666');
    y+=auditH+24;
  }

  // ---------- Full λ diagnostic ----------
  const d=r.diagnostics||{};
  roundRect(ctx,pad,y,content,diagH,20,'#fff','#9ea2a8');
  drawText(ctx,'🔎 Diagnóstico del λ',pad+22,y+40,27,'800');

  const labels=[
    'Ataque bruto',
    'Ataque ajustado',
    'Debilidad defensiva bruta',
    'Debilidad defensiva ajustada',
    'λ estructural',
    'λ regularizado',
    'Ajuste ataque por ausencias',
    'Ajuste defensa rival por ausencias',
    'Ajuste descanso',
    'λ final'
  ];

  // Exact keys used by the V1.6 motor.
  const vals=[
    [d.Hatt?.raw,d.Aatt?.raw,2],
    [d.Hatt?.shrunk,d.Aatt?.shrunk,2],
    [d.Hdef?.raw,d.Adef?.raw,2],
    [d.Hdef?.shrunk,d.Adef?.shrunk,2],
    [d.structuralH??d.baseH,d.structuralA??d.baseA,2],
    [d.regularizedH??d.baseH,d.regularizedA??d.baseA,2],
    [d.absenceHAtt,d.absenceAAtt,3],
    [d.absenceADef,d.absenceHDef,3],
    [d.restHF,d.restAF,3],
    [r.hl,r.al,2]
  ];

  let ry=y+72;
  drawText(ctx,'Componente',pad+22,ry,17,'800');
  const diagLocalX=W-pad-235, diagAwayX=W-pad-92;
  drawText(ctx,'Local',diagLocalX,ry,16,'800','#111','right');
  drawText(ctx,'Visitante',diagAwayX,ry,16,'800','#111','right');

  for(let i=0;i<labels.length;i++){
    const yy=ry+14+i*diagRowH;
    ctx.strokeStyle='#d8dade';
    ctx.beginPath();ctx.moveTo(pad+18,yy);ctx.lineTo(W-pad-18,yy);ctx.stroke();

    const bold=i===8?'800':'500';
    drawText(ctx,labels[i],pad+22,yy+31,17,bold);

    const hv=vals[i][0], av=vals[i][1], digits=vals[i][2];
    const hf=Number.isFinite(Number(hv))?Number(hv).toFixed(digits):'—';
    const af=Number.isFinite(Number(av))?Number(av).toFixed(digits):'—';
    drawText(ctx,hf,diagLocalX,yy+31,16,i===8?'800':'600','#111','right');
    drawText(ctx,af,diagAwayX,yy+31,16,i===8?'800':'600','#111','right');
  }
  y+=diagH+28;

  // ---------- Audit legend ----------
  roundRect(ctx,pad,y,content,noteH,16,'#fff','#d2d5d9');
  drawText(ctx,'Conf. = confianza del modelo · Robustez = estabilidad ante variaciones de λ',pad+20,y+30,16,'700');
  drawText(ctx,'EV peor = peor EV en los escenarios de sensibilidad del modelo.',pad+20,y+57,15,'500','#333');
  drawText(ctx,'H1X2 europeo: sin PUSH. DNB mantiene PUSH; cuota justa = (1−PUSH)/WIN.',pad+20,y+84,14,'600','#444');
  drawText(ctx,'Top general = VALUE BET elegible + mínimos Score 70 / Conf. 75 / Rob. 65 / EV peor > 0; si no, NO BET.',pad+20,y+109,14,'500','#666');
  y+=noteH+26;

  // ---------- TOP PICK GENERAL ----------
  if(generalPick){
    roundRect(ctx,pad,y,content,topGeneralH,18,'#f4fbf6','#166534');
    drawText(ctx,'⭐ TOP PICK GENERAL',pad+20,y+32,23,'800','#166534');
    drawText(ctx,marketLabel(generalPick.market),pad+20,y+63,25,'800','#111');
    drawText(ctx,`${categoryLabel(generalPick.category)} · Score ${Number(generalPick.rankScore||0).toFixed(0)} · Prob. ${(Number(generalPick.p||0)*100).toFixed(1)}% · EV ${(Number(generalPick.e||0)*100).toFixed(1)}% · EV peor ${(Number(generalPick.worstEV||0)*100).toFixed(1)}%`,pad+20,y+91,15,'600','#444');
  }else{
    roundRect(ctx,pad,y,content,topGeneralH,18,'#fff8e6','#9a6700');
    drawText(ctx,'⭐ TOP PICK GENERAL',pad+20,y+32,23,'800','#9a6700');
    drawText(ctx,'NO BET',pad+20,y+65,27,'900','#111');
    drawText(ctx,'Ningún candidato supera Score 70 · Conf. 75 · Rob. 65 · EV peor positivo.',pad+20,y+93,15,'600','#555');
  }
  y+=topGeneralH+20;

  // ---------- Markets grouped by category ----------
  // 11 columns: Pick, Prob., Justa, Cuota, Edge, EV, Value, Conf., Rob., EV peor, Decisión
  const widths=[230,82,82,82,82,82,76,72,72,92,106];
  const xs=[0];
  for(const w of widths) xs.push(xs[xs.length-1]+w);
  const scale=content/xs[xs.length-1];
  const px=xs.map(v=>v*scale);
  const heads=['Pick','Prob.','Justa','Cuota','Edge','EV','Value','Conf.','Rob.','EV peor','Decisión'];

  for(const group of captureGroups){
    drawText(ctx,categoryLabel(group.cat),pad,y+31,24,'800','#111');
    y+=catTitleH;
    const catTop=group.rows.find(x=>x.categoryTop);
    if(catTop){
      const topBg='#eef7f1';
      const topStroke='#7eaa8b';
      roundRect(ctx,pad,y,content,catTopH,12,topBg,topStroke);
      drawText(ctx,`Mejor de categoría: ${marketLabel(catTop.market)} · Score ${Number(catTop.rankScore||0).toFixed(0)} · ${catTop.dec}`,pad+15,y+33,16,'800','#174f2a');
      y+=catTopH+8;
    }
    roundRect(ctx,pad,y,content,tableHeaderH,14,'#111');
    for(let i=0;i<heads.length;i++) drawText(ctx,heads[i],pad+px[i]+7,y+35,14,'800','#fff');
    y+=tableHeaderH;

    for(const row of group.rows){
      const dec=row.dec||'';
      const bg=dec==='VALUE BET'?'#166534':dec==='WATCH'?'#9a5a08':'#a82424';
      ctx.fillStyle=bg;ctx.fillRect(pad,y,content,tableRowH);
      const valsRow=[
        `${row.topGeneral?'⭐ ':''}${marketLabel(row.market)}`,
        `${(Number(row.p||0)*100).toFixed(1)}%`,
        Number(row.fair||0).toFixed(2),
        Number(row.odds||0).toFixed(2),
        `${(Number(row.ed||0)*100).toFixed(1)}%`,
        `${(Number(row.e||0)*100).toFixed(1)}%`,
        Number(row.vs||0).toFixed(0),
        Number(row.conf||0).toFixed(0),
        Number(row.robustness||0).toFixed(0),
        `${(Number(row.worstEV||0)*100).toFixed(1)}%`,
        dec
      ];
      for(let i=0;i<valsRow.length;i++){
        const colW=px[i+1]-px[i],fontSize=i===0?14:(i===10?12:13);
        ctx.font=`700 ${fontSize}px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif`;
        const text=fitText(ctx,valsRow[i],Math.max(44,colW-12));
        drawText(ctx,text,pad+px[i]+7,y+(i===0&&row.isDnb?25:36),fontSize,'700','#fff');
        if(i===0&&row.isDnb){
          ctx.font=`600 10px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif`;
          drawText(ctx,fitText(ctx,wplPct(row),Math.max(44,colW-12)),pad+px[i]+7,y+45,10,'600','#fff');
        }
      }
      y+=tableRowH;
    }
    y+=18;
  }

  // ---------- Footer ----------
  y+=26;
  drawText(ctx,'Motor λ: V1.7.1 · Selector jerárquico: V1.8.0',W/2,y+18,15,'600','#555','center');
  drawText(ctx,`Generado ${new Date().toLocaleString('es-CO')} · SoyJordan Picks`,W/2,y+44,15,'500','#777','center');

  return canvas;
}
function canvasToDataUrlSafe(canvas){
  // Safari/iOS is substantially more reliable with toDataURL than canvas.toBlob
  // inside an installed PWA. No external library, fetch(), ObjectURL or CORS involved.
  try{
    const dataUrl=canvas.toDataURL('image/png');
    if(!dataUrl||!dataUrl.startsWith('data:image/png'))throw new Error('Canvas no produjo una imagen PNG válida');
    return dataUrl;
  }catch(e){
    throw new Error('Canvas→PNG: '+(e?.message||e));
  }
}
async function downloadResultCapture(){
  try{
    const r=captureRecord();
    if(!r)return alert('No hay un análisis guardado para capturar. Primero pulsa “Analizar y guardar”.');
    const canvas=await buildResultCanvas(r);
    const dataUrl=canvasToDataUrlSafe(canvas);
    const safe=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');
    showCapturePreview(dataUrl,`SoyJordan_${safe(r.home)}_vs_${safe(r.away)}_V1791.png`);
  }catch(e){
    console.error('CAPTURE_RESULT_ERROR',e);
    alert('No se pudo generar la captura.\n\nDetalle técnico: '+(e?.message||e));
  }
}
async function downloadHistoryCapture(id){
  try{
    const r=loadDB().find(x=>x.id===id);
    if(!r)return alert('No se encontró el análisis guardado.');
    const canvas=await buildResultCanvas(r);
    const dataUrl=canvasToDataUrlSafe(canvas);
    const safe=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');
    showCapturePreview(dataUrl,`SoyJordan_${safe(r.home)}_vs_${safe(r.away)}_${safe(r.date||'')}_V1631.png`);
  }catch(e){
    console.error('CAPTURE_HISTORY_ERROR',e);
    alert('No se pudo generar la captura.\n\nDetalle técnico: '+(e?.message||e));
  }
}


// ==================== V1.8.0 · AUDITORÍA POSTPARTIDO ====================
function auditOutcomeLabel(s){
  return s==="win"?"GANADA":s==="loss"?"PERDIDA":s==="push"?"NULA / PUSH":"NO EVALUABLE";
}
function auditOutcomeClass(s){
  return s==="win"?"audit-win":s==="loss"?"audit-loss":s==="push"?"audit-push":"audit-pending";
}
function parseEuropeanHandicapMarket(row){
  if(row?.isEuropeanHandicap&&Number.isFinite(Number(row.ehLine))&&row.ehOutcome)return {line:Number(row.ehLine),outcome:String(row.ehOutcome)};
  return null;
}
function evaluateMarketOutcome(row,r,hg,ag){
  hg=Number(hg);ag=Number(ag);
  if(!Number.isFinite(hg)||!Number.isFinite(ag))return null;
  const k=String(row?.market||"");
  if(row?.isEuropeanHandicap||k.startsWith("H1X2")){
    const eh=parseEuropeanHandicapMarket(row);if(!eh)return null;
    const adjH=hg+eh.line;
    const result=adjH>ag?"home":adjH===ag?"draw":"away";
    return result===eh.outcome?"win":"loss";
  }
  const total=hg+ag;
  switch(k){
    case "home": return hg>ag?"win":"loss";
    case "draw": return hg===ag?"win":"loss";
    case "away": return ag>hg?"win":"loss";
    case "homeDnb": return hg>ag?"win":hg===ag?"push":"loss";
    case "awayDnb": return ag>hg?"win":hg===ag?"push":"loss";
    case "homeOrDraw": return hg>=ag?"win":"loss";
    case "awayOrDraw": return ag>=hg?"win":"loss";
    case "over15": return total>1.5?"win":"loss";
    case "under15": return total<1.5?"win":"loss";
    case "over25": return total>2.5?"win":"loss";
    case "under25": return total<2.5?"win":"loss";
    case "over35": return total>3.5?"win":"loss";
    case "under35": return total<3.5?"win":"loss";
    case "bttsYes": return hg>0&&ag>0?"win":"loss";
    case "bttsNo": return !(hg>0&&ag>0)?"win":"loss";
    case "home05": return hg>0.5?"win":"loss";
    case "home15": return hg>1.5?"win":"loss";
    case "away05": return ag>0.5?"win":"loss";
    case "away15": return ag>1.5?"win":"loss";
    case "cornersOver85": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c>8.5?"win":"loss"):null;}
    case "cornersUnder85": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c<8.5?"win":"loss"):null;}
    case "cornersOver95": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c>9.5?"win":"loss"):null;}
    case "cornersUnder95": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c<9.5?"win":"loss"):null;}
    case "cornersOver105": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c>10.5?"win":"loss"):null;}
    case "cornersUnder105": {const c=Number(r.realResult?.homeCorners)+Number(r.realResult?.awayCorners);return Number.isFinite(c)?(c<10.5?"win":"loss"):null;}
    case "homeCornersOver35": return Number.isFinite(Number(r.realResult?.homeCorners))?(Number(r.realResult.homeCorners)>3.5?"win":"loss"):null;
    case "homeCornersOver45": return Number.isFinite(Number(r.realResult?.homeCorners))?(Number(r.realResult.homeCorners)>4.5?"win":"loss"):null;
    case "awayCornersOver35": return Number.isFinite(Number(r.realResult?.awayCorners))?(Number(r.realResult.awayCorners)>3.5?"win":"loss"):null;
    case "awayCornersOver45": return Number.isFinite(Number(r.realResult?.awayCorners))?(Number(r.realResult.awayCorners)>4.5?"win":"loss"):null;
    default:return null;
  }
}
function getTopGeneral(r){return (r?.rows||[]).find(x=>x.topGeneral)||null}
function auditMetrics(r){
  const rr=r?.realResult;if(!rr)return null;
  const hg=Number(rr.homeGoals),ag=Number(rr.awayGoals),top=getTopGeneral(r);
  const topOutcome=top?evaluateMarketOutcome(top,r,hg,ag):null;
  const hasXg=rr.homeXg!==null&&rr.homeXg!==undefined&&rr.homeXg!==''&&rr.awayXg!==null&&rr.awayXg!==undefined&&rr.awayXg!==''&&Number.isFinite(Number(rr.homeXg))&&Number.isFinite(Number(rr.awayXg));
  const targetH=hasXg?Number(rr.homeXg):hg,targetA=hasXg?Number(rr.awayXg):ag;
  return {
    hg,ag,top,topOutcome,hasXg,errorBasis:hasXg?"xG":"goles",
    lambdaHomeError:Math.abs(targetH-Number(r.hl||0)),
    lambdaAwayError:Math.abs(targetA-Number(r.al||0)),
    lambdaTotalError:Math.abs((targetH+targetA)-(Number(r.hl||0)+Number(r.al||0)))
  };
}
function ensureAuditModal(){
  let m=document.getElementById("auditResultModal");if(m)return m;
  m=document.createElement("div");m.id="auditResultModal";m.className="modal hidden";
  m.innerHTML=`<div class="modal-sheet" style="max-width:620px">
    <div class="detail-head"><div><h2 style="margin:0">✅ Registrar resultado real</h2><div id="auditMatchLabel" class="small muted"></div></div><button type="button" class="secondary" onclick="closeAuditModal()">✕</button></div>
    <div class="grid" style="margin-top:12px">
      <label>Goles local<input id="auditHomeGoals" type="number" min="0" step="1" inputmode="numeric"></label>
      <label>Goles visitante<input id="auditAwayGoals" type="number" min="0" step="1" inputmode="numeric"></label>
      <label>xG real local <span class="muted">(opcional)</span><input id="auditHomeXg" type="text" inputmode="decimal" autocomplete="off" placeholder="Ej. 2.51 o 2,51"></label>
      <label>xG real visitante <span class="muted">(opcional)</span><input id="auditAwayXg" type="text" inputmode="decimal" autocomplete="off" placeholder="Ej. 0.41 o 0,41"></label>
      <label class="full">Nota postpartido <span class="muted">(opcional)</span><textarea id="auditNotes" rows="3" placeholder="Ej.: Atlético dominó 5-0 en ocasiones claras."></textarea></label>
    </div>
    <div class="note" style="margin-top:10px">El resultado real se guarda como <b>auditoría postpartido</b>. No modifica los λ, probabilidades, EV ni el análisis prepartido.</div>
    <div class="actions" style="margin-top:10px"><button type="button" onclick="saveRealResult()">Guardar auditoría</button><button type="button" class="secondary" onclick="closeAuditModal()">Cancelar</button></div>
  </div>`;
  document.body.appendChild(m);return m;
}
let auditAnalysisId=null;
function openAuditModal(id){
  const r=loadDB().find(x=>x.id===id);if(!r)return;
  auditAnalysisId=id;const m=ensureAuditModal(),rr=r.realResult||{};
  document.getElementById("auditMatchLabel").textContent=`${r.home} vs ${r.away} · ${r.date||""}`;
  document.getElementById("auditHomeGoals").value=rr.homeGoals??"";
  document.getElementById("auditAwayGoals").value=rr.awayGoals??"";
  document.getElementById("auditHomeXg").value=rr.homeXg??"";
  document.getElementById("auditAwayXg").value=rr.awayXg??"";
  document.getElementById("auditNotes").value=rr.notes||"";
  m.classList.remove("hidden");m.style.display="flex";document.body.style.overflow="hidden";
}
function closeAuditModal(){
  const m=document.getElementById("auditResultModal");if(m){m.classList.add("hidden");m.style.display="none"}document.body.style.overflow="";
}
function settlePendingBetsFromRealResult(r){
  const rr=r.realResult,bets=loadBets();let changed=0;
  bets.forEach(b=>{
    if(b.analysisId!==r.id||b.status!=="pending")return;
    const row=(r.rows||[]).find(x=>String(x.market)===String(b.market));
    if(!row)return;
    const outcome=evaluateMarketOutcome(row,r,rr.homeGoals,rr.awayGoals);
    if(!outcome)return;
    b.status=outcome;
    b.pnl=calcBetPnl(b,outcome);
    b.settledAt=new Date().toISOString();b.settledFromAudit=true;changed++;
  });
  if(changed)saveBets(bets);
  return changed;
}
function settleLockedBetFromRealResult(r){
  if(!r?.lockedBetId||!r.realResult)return 0;
  const bets=loadBets(),b=bets.find(x=>x.id===r.lockedBetId);if(!b||b.status!=="pending")return 0;
  const row=(r.rows||[]).find(x=>String(x.market)===String(b.market));if(!row)return 0;
  const outcome=evaluateMarketOutcome(row,r,Number(r.realResult.homeGoals),Number(r.realResult.awayGoals));if(!outcome)return 0;
  b.status=outcome;b.pnl=calcBetPnl(b,outcome);
  b.settledAt=new Date().toISOString();b.settledFromAudit=true;b.settledAsLockedChoice=true;saveBets(bets);return 1;
}
function saveRealResult(){
  const hg=Number(document.getElementById("auditHomeGoals").value),ag=Number(document.getElementById("auditAwayGoals").value);
  if(!Number.isInteger(hg)||hg<0||!Number.isInteger(ag)||ag<0)return alert("Introduce un marcador válido con goles enteros.");
  const hxRaw=document.getElementById("auditHomeXg").value,axRaw=document.getElementById("auditAwayXg").value;
  const parseDecimal=v=>{
    let t=String(v??"").trim().replace(/\s+/g,"");
    if(t==="")return null;
    // iPhone/es-CO may enter comma as decimal separator.
    if(t.includes(",")&&!t.includes("."))t=t.replace(",",".");
    else if(t.includes(",")&&t.includes("."))t=t.replace(/,/g,"");
    return Number(t);
  };
  const hx=parseDecimal(hxRaw),ax=parseDecimal(axRaw);
  if((hx!==null&&(!Number.isFinite(hx)||hx<0))||(ax!==null&&(!Number.isFinite(ax)||ax<0)))return alert("Los xG reales deben ser números válidos o quedar vacíos.");
  const db=loadDB(),r=db.find(x=>x.id===auditAnalysisId);if(!r)return;
  r.realResult={homeGoals:hg,awayGoals:ag,homeXg:hx,awayXg:ax,notes:document.getElementById("auditNotes").value.trim(),recordedAt:new Date().toISOString()};
  r.auditVersion="1.8.0";
  saveDB(db);closeAuditModal();

  const lockedChanged=settleLockedBetFromRealResult(r);
  const pending=betsForAnalysis(r.id).filter(b=>b.status==="pending").length;
  if(pending&&confirm(`Resultado guardado.${lockedChanged?"\n\nTu apuesta bloqueada fue liquidada automáticamente.":""}\n\nQuedan ${pending} apuesta(s) adicional(es) pendientes. ¿Quieres liquidarlas también según el marcador ${hg}-${ag}?`)){
    const changed=settlePendingBetsFromRealResult(r);
    if(changed)alert(`${changed} apuesta(s) adicional(es) liquidada(s) automáticamente.`);
  }
  const combosChanged=syncCombosFromAudits();
  if(combosChanged)renderCombos();
  renderHistory();renderBetHistory();openHistoryDetail(r.id);
}
function removeRealResult(id){
  const db=loadDB(),r=db.find(x=>x.id===id);if(!r?.realResult)return;
  if(!confirm("¿Eliminar la auditoría postpartido? El análisis prepartido y las apuestas registradas se conservarán."))return;
  delete r.realResult;delete r.auditVersion;saveDB(db);renderHistory();openHistoryDetail(id);
}
function auditDetailHtml(r){
  const a=auditMetrics(r);
  if(!a)return `<div class="audit-card"><div class="detail-head"><div><h3 style="margin:0">✅ Auditoría postpartido</h3><div class="small muted">Todavía no se registró el marcador real.</div></div></div><div class="audit-actions"><button type="button" onclick="openAuditModal(${r.id})">Registrar resultado real</button></div></div>`;
  const rr=r.realResult,topLabel=a.top?marketLabel(a.top.market):"NO BET",locked=loadBets().find(b=>b.id===r.lockedBetId),lockedLabel=locked?`${locked.label} · ${betStatusLabel(locked.status)}`:"No registrada";
  const xgLine=(rr.homeXg!=null&&rr.awayXg!=null)?`${Number(rr.homeXg).toFixed(2)} - ${Number(rr.awayXg).toFixed(2)}`:"No registrado";
  return `<div class="audit-card">
    <div class="detail-head"><div><h3 style="margin:0">✅ Auditoría postpartido</h3><div class="small muted">El pronóstico prepartido permanece bloqueado e intacto.</div></div><span class="audit-outcome ${auditOutcomeClass(a.topOutcome)}">${auditOutcomeLabel(a.topOutcome)}</span></div>
    <div class="audit-score"><div class="audit-team">${r.home}</div><div class="audit-score-main">${a.hg} - ${a.ag}</div><div class="audit-team">${r.away}</div></div>
    <div class="audit-grid">
      <div class="audit-stat"><small>Mejor pick prepartido</small><b>${topLabel}</b></div>
      <div class="audit-stat"><small>Resultado del Top Pick app</small><b>${auditOutcomeLabel(a.topOutcome)}</b></div>
      <div class="audit-stat"><small>Tu apuesta bloqueada</small><b>${lockedLabel}</b></div>
      <div class="audit-stat"><small>λ previsto</small><b>${Number(r.hl).toFixed(2)} - ${Number(r.al).toFixed(2)}</b></div>
      <div class="audit-stat"><small>Goles reales</small><b>${a.hg} - ${a.ag}</b></div>
      <div class="audit-stat"><small>Error abs. λ vs ${a.errorBasis} local / visitante</small><b>${a.lambdaHomeError.toFixed(2)} / ${a.lambdaAwayError.toFixed(2)}</b></div>
      <div class="audit-stat"><small>Error λ total vs ${a.errorBasis}</small><b>${a.lambdaTotalError.toFixed(2)}</b></div>
      <div class="audit-stat"><small>xG real</small><b>${xgLine}</b></div>
      <div class="audit-stat"><small>Registrado</small><b>${new Date(rr.recordedAt).toLocaleString("es-CO")}</b></div>
    </div>
    ${rr.notes?`<div class="note" style="margin-top:9px">${rr.notes}</div>`:""}
    <div class="audit-actions"><button type="button" onclick="openAuditModal(${r.id})">✏️ Editar resultado</button><button type="button" class="secondary" onclick="downloadHistoryCapture(${r.id})">📸 Captura con auditoría</button><button type="button" class="dangerBtn" onclick="removeRealResult(${r.id})">Eliminar auditoría</button></div>
  </div>`;
}
function auditPortfolioSummary(db){
  const audited=db.filter(r=>r.realResult),outcomes=audited.map(r=>auditMetrics(r)?.topOutcome).filter(Boolean);
  const wins=outcomes.filter(x=>x==="win").length,loss=outcomes.filter(x=>x==="loss").length,push=outcomes.filter(x=>x==="push").length;
  const decided=wins+loss,hit=decided?wins/decided*100:0;
  const withXg=audited.map(r=>auditMetrics(r)).filter(a=>a?.hasXg);
  const lambdaMae=withXg.length?withXg.reduce((s,a)=>s+(a.lambdaHomeError+a.lambdaAwayError)/2,0)/withXg.length:null;
  return {audited,wins,loss,push,hit,lambdaMae,lambdaMaeN:withXg.length};
}

// Preserve current V1.7.1 history-detail behavior, then append audit.
const _openHistoryDetailV1631=openHistoryDetail;
openHistoryDetail=function(id){
  _openHistoryDetailV1631(id);
  const r=loadDB().find(x=>x.id===id),box=document.getElementById("historyDetail"),card=box?.querySelector(".card");
  if(!r||!card)return;
  const betting=[...card.querySelectorAll(".detail-section")].find(x=>x.querySelector("h3")?.textContent.includes("Apuestas reales"));
  const holder=document.createElement("div");holder.innerHTML=auditDetailHtml(r);
  if(betting)betting.before(holder.firstElementChild);else{
    const actions=card.querySelector(".actions");if(actions)card.insertBefore(holder.firstElementChild,actions);else card.appendChild(holder.firstElementChild);
  }
};

// Final history renderer with both betting performance and post-match model audit.
renderHistory=function(){
  const db=loadDB(),bets=loadBets(),combos=loadCombos(),audit=auditPortfolioSummary(db);
  const settled=bets.filter(x=>x.status!=="pending"),wins=settled.filter(x=>x.status==="win").length,loss=settled.filter(x=>x.status==="loss").length,push=settled.filter(x=>x.status==="push").length;
  const pnl=settled.reduce((s,x)=>s+(Number(x.pnl)||0),0),staked=settled.reduce((s,x)=>s+(Number(x.stake)||0),0),hit=(wins+loss)?wins/(wins+loss)*100:0,allPerf=perfStats([...bets,...combos]);
  document.getElementById("stats").innerHTML=
    `<span class="metric">Análisis: ${db.length}</span><span class="metric">Auditados: ${audit.audited.length}</span><span class="metric">Top pick W/L/P: ${audit.wins}/${audit.loss}/${audit.push}</span><span class="metric">Acierto top pick: ${audit.hit.toFixed(1)}%</span><span class="metric">MAE λ vs xG: ${audit.lambdaMae==null?"—":audit.lambdaMae.toFixed(2)}${audit.lambdaMaeN?` (n=${audit.lambdaMaeN})`:""}</span>`+
    `<span class="metric">Apuestas individuales: ${bets.length}</span><span class="metric">W/L/P usuario: ${wins}/${loss}/${push}</span><span class="metric">Acierto real: ${hit.toFixed(1)}%</span><span class="metric">Combinadas: ${combos.length}</span><span class="metric">P&L consolidado: ${money(allPerf.pnl)}</span><span class="metric">ROI/Yield: ${allPerf.roi.toFixed(1)}%</span>`;
  const cards=db.map(r=>{
    const x=getTopGeneral(r),rb=betsForAnalysis(r.id),pending=rb.filter(b=>b.status==="pending").length,a=auditMetrics(r);
    const auditBadge=a?`<span class="status-chip ${a.topOutcome==="win"?"audit-win":a.topOutcome==="loss"?"audit-loss":"locked"}">✅ ${a.hg}-${a.ag} · ${auditOutcomeLabel(a.topOutcome)}</span>`:"";
    const lockBadge=r.preMatchLocked?'<span class="status-chip locked">🔒 BLOQUEADO</span>':pending?'<span class="status-chip pending">PENDIENTE</span>':'';
    return `<div class="history-card" onclick="openHistoryDetail(${r.id})">
      <div class="history-card-top"><div><div class="history-date">${r.date||''} · ${r.league||''}</div><div class="history-match">${r.home} <span class="muted">vs</span> ${r.away}</div></div><div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">${auditBadge}${lockBadge}</div></div>
      ${x?`<div class="history-pick"><div><small>MEJOR PICK DEL MODELO</small><br><b>${marketLabel(x.market)}</b></div><div style="text-align:right"><small>Cuota · EV</small><br><b>${Number(x.odds).toFixed(2)} · ${(Number(x.e)*100).toFixed(1)}%</b></div></div>`:`<div class="history-pick"><div><small>TOP GENERAL</small><br><b>NO BET</b></div><div style="text-align:right"><small>Filtro V1.8.0</small><br><b>Sin candidato suficiente</b></div></div>`}
      <div class="history-card-actions"><button type="button" onclick="event.stopPropagation();openAuditModal(${r.id})">${r.realResult?'✏️ Resultado':'✅ Registrar resultado'}</button><button type="button" onclick="event.stopPropagation();openBetModal(${r.id})">+ Apuesta</button><button type="button" class="secondary" onclick="event.stopPropagation();downloadHistoryCapture(${r.id})">📸 Captura</button><button type="button" class="dangerBtn" onclick="event.stopPropagation();deleteRecord(${r.id})">🗑️</button></div>
      ${rb.length?`<div class="small muted" style="margin-top:6px">${rb.length} apuesta(s) registrada(s) · ${pending} pendiente(s)</div>`:''}
    </div>`;
  }).join("");
  document.getElementById("historyTable").innerHTML=`<div class="history-cards">${cards||'<p class="muted">Todavía no hay análisis guardados.</p>'}</div>`;
  renderBank();
};



function migrateLegacyAsianRowsToEuropean(){
  const key="sjp_h1x2_migration_1770";
  if(localStorage.getItem(key)==="done")return;
  const db=loadDB(),bets=loadBets(),combos=loadCombos();let changed=false;
  const mapLegacy=(text)=>{
    const m=String(text||"").match(/^AH\s*·\s*(Local|Visitante)\s*([+-]?\d+(?:\.\d+)?)$/i);
    if(!m)return null;
    const side=/local/i.test(m[1])?"home":"away",oldLine=Number(m[2]);
    const homeLine=side==="home"?oldLine:-oldLine,outcome=side;
    return {line:homeLine,outcome,label:europeanHandicapLabel(homeLine,outcome)};
  };
  db.forEach(r=>{
    let recordChanged=false;
    (r.rows||[]).forEach((row,i)=>{
      const mapped=mapLegacy(row.market);if(!mapped)return;
      const odds=Number(row.odds),st=europeanHandicapStats(Number(r.hl),Number(r.al),mapped.line,mapped.outcome,odds),sm=europeanHandicapSensitivity(mapped.line,mapped.outcome,odds,Number(r.hl),Number(r.al));
      const sc=score(st.p,odds,{...sm,dataConf:Number(r.dataConfidence)||75});
      r.rows[i]={...row,...sc,market:mapped.label,odds,isEuropeanHandicap:true,ehLine:mapped.line,ehOutcome:mapped.outcome};
      delete r.rows[i].isAsian;delete r.rows[i].push;delete r.rows[i].loss;
      recordChanged=true;changed=true;
    });
    if(recordChanged){
      (r.rows||[]).forEach(x=>{delete x.topGeneral;delete x.categoryTop;});
      rankRows(r.rows,{matchMode:r.matchMode||"league",cupLeg:r.cupContext?.leg||"single",hl:Number(r.hl),al:Number(r.al)});
      r.version="1.8.0";
      if(r.ah&&!r.eh){
        r.eh={};
        const a=r.ah;
        if(a.home_1)r.eh["1_home"]=a.home_1;
        if(a.home_-1)r.eh["-1_home"]=a.home_-1;
        if(a.away_1)r.eh["-1_away"]=a.away_1;
        if(a.away_-1)r.eh["1_away"]=a.away_-1;
      }
      delete r.ah;
      (bets||[]).forEach(b=>{
        if(b.analysisId!==r.id)return;
        const mapped=mapLegacy(b.market);if(mapped){b.market=mapped.label;b.label=mapped.label;changed=true;}
        if(r.realResult){
          const row=(r.rows||[]).find(x=>String(x.market)===String(b.market));
          if(row){const outcome=evaluateMarketOutcome(row,r,r.realResult.homeGoals,r.realResult.awayGoals);if(outcome){b.status=outcome;b.pnl=calcBetPnl(b,outcome);b.settledAt=new Date().toISOString();b.settledFromMigration1770=true;}}
        }
      });
      (combos||[]).forEach(c=>{
        let touches=false;
        (c.legs||[]).forEach(l=>{if(l.analysisId!==r.id)return;const mapped=mapLegacy(l.market);if(mapped){l.market=mapped.label;l.label=mapped.label;touches=true;changed=true;}});
        if(touches){c.status="pending";c.pnl=0;delete c.settledAt;delete c.effectiveOdds;}
      });
    }
  });
  if(changed){saveDB(db);saveBets(bets);saveCombos(combos);syncCombosFromAudits();renderBank();}
  localStorage.setItem(key,"done");
}
migrateLegacyAsianRowsToEuropean();

if("serviceWorker"in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js?ver=1.8.0-build1800").catch(()=>{});



(function(){
const test={
 meta:{date:"2026-08-15",league:"Liga de Prueba",season:"2026/27",leagueAvg:"1.50",dataSource:"Datos ficticios",home:"Atlético Aurora",away:"Deportivo Central",notes:"PRUEBA V1.8.0 build 1800 — datos ficticios."},
 home:{last10:{gf:15,ga:9,xg:16.4,xga:10.2,shots:138,sot:49,sa:102,sota:32,bc:27,bca:18},last5:{gf:8,ga:5,xg:8.7,xga:5.8,shots:72,sot:27,sa:51,sota:16,bc:15,bca:9},condition5:{gf:9,ga:4,xg:9.1,xga:5.2,shots:75,sot:29,sa:48,sota:15,bc:16,bca:8},restCurrent:7},
 away:{last10:{gf:12,ga:14,xg:13.1,xga:15.3,shots:121,sot:41,sa:133,sota:45,bc:22,bca:28},last5:{gf:7,ga:8,xg:7.2,xga:8.4,shots:63,sot:21,sa:69,sota:24,bc:12,bca:15},condition5:{gf:5,ga:9,xg:6.4,xga:9.0,shots:58,sot:19,sa:72,sota:26,bc:10,bca:17},restCurrent:6},
 odds:{home:2.20,draw:3.20,away:3.40,homeDnb:1.65,awayDnb:2.10,homeOrDraw:1.30,awayOrDraw:1.62,over15:1.30,under15:3.40,over25:1.85,under25:1.90,over35:3.10,under35:1.35,home05:1.25,home15:2.05,away05:1.35,away15:2.70,bttsYes:1.80,bttsNo:1.95}
};
function setV(el,v){if(!el)return;el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))}
function loadTest(){
 for(const [k,v] of Object.entries(test.meta))setV(document.getElementById(k),v);
 for(const side of ["home","away"]){
  for(const p of periods)for(const [k] of metrics)setV(document.querySelector(`[data-team="${side}"][data-period="${p[0]}"][data-key="${k}"]`),test[side][p[0]][k]);
  setV(document.querySelector(`[data-team="${side}"][data-key="restCurrent"]`),test[side].restCurrent);
 }
 for(const [k,v] of Object.entries(test.odds))setV(document.querySelector(`[data-odd="${k}"]`),v);
 setV(document.querySelector(`[data-eh-line="1"][data-eh-outcome="home"]`),"1.88");setV(document.querySelector(`[data-eh-line="1"][data-eh-outcome="draw"]`),"4.40");setV(document.querySelector(`[data-eh-line="1"][data-eh-outcome="away"]`),"7.25");setV(document.querySelector(`[data-eh-line="-1"][data-eh-outcome="home"]`),"3.10");setV(document.querySelector(`[data-eh-line="-1"][data-eh-outcome="draw"]`),"3.60");setV(document.querySelector(`[data-eh-line="-1"][data-eh-outcome="away"]`),"1.75");
 document.getElementById("vp-test-status").textContent="✅ Prueba V1.8.0 build 1800 cargada (incluye 1X y X2).";
}
document.getElementById("vp-load-test").addEventListener("click",loadTest);
document.getElementById("vp-clear-test").addEventListener("click",()=>{clearCurrentForm();document.getElementById("vp-test-status").textContent="Formulario limpio.";});
})();


// ==================== V1.8.0 · STAKE / BAJAS / FILTROS / COMBINADAS ====================
function roundStakeUnits(v){return Math.round(Math.max(0,v)*20)/20}
function recommendedStake(row,isTopGeneral=false){
  if(!row||!['WATCH','VALUE BET'].includes(String(row.dec||'')))return {units:0,amount:0,kelly:0};
  const odds=Number(row.odds)||0,worst=Number(row.worstEV)||0,conf=clamp(Number(row.conf)||0,0,100),rob=clamp(Number(row.robustness)||0,0,100);
  if(odds<=1||worst<=0)return {units:0,amount:0,kelly:0};
  // Kelly inferido desde EV peor: f* = EV/(cuota-1). Usamos 1/4 Kelly y ajustes de calidad.
  const fullKelly=clamp(worst/Math.max(.01,odds-1),0,.20);
  const quality=(conf/100)*(rob/100);
  const oddsPenalty=odds<=2?1:clamp(1-.12*(odds-2),.55,1);
  const decisionMult=row.dec==='WATCH'?.55:1;
  const topMult=isTopGeneral?1.15:1;
  let units=fullKelly*.25*quality*oddsPenalty*decisionMult*topMult*100;
  const cap=isTopGeneral?2:(row.dec==='WATCH'?.75:1.5);
  units=roundStakeUnits(Math.min(cap,units));
  if(units>0&&units<.10)units=.10;
  const bank=Math.max(0,Number(financeSummary()?.current)||Number(loadBank()?.initial)||0),unitValue=bank*.01;
  return {units,amount:unitValue*units,kelly:fullKelly,unitValue};
}
function stakeLabel(row,isTop=false){
  const s=recommendedStake(row,isTop);
  if(!s.units)return '0.00u · NO APOSTAR';
  return `${s.units.toFixed(2)}u${s.amount>0?` · ${money(s.amount)}`:''}`;
}
function enhanceStakeDisplay(r){
  const result=document.getElementById('result');if(!result)return;
  const general=(r.rows||[]).find(x=>x.topGeneral);
  if(general){
    const cards=[...result.querySelectorAll('.card')];const card=cards.find(c=>c.textContent.includes('TOP PICK GENERAL'));
    if(card&&!card.querySelector('.stake-reco')){const d=document.createElement('div');d.className='stake-reco';d.innerHTML=`<b>Stake recomendado:</b> ${stakeLabel(general,true)}<br><span>¼ Kelly conservador sobre EV peor, ajustado por Confianza, Robustez y penalización de cuota alta. 1u = 1% del bank.</span>`;card.appendChild(d)}
  }
  const cats=['GANADORES','GOLES','HANDICAP','AMBOS MARCAN'];
  const tables=[...result.querySelectorAll('.result-grid table')];
  cats.forEach((cat,ti)=>{
    const group=(r.rows||[]).filter(x=>(x.category||marketCategory(x))===cat);const table=tables[ti];if(!table||!group.length)return;
    const hr=table.querySelector('tr');if(hr&&!hr.querySelector('.stake-col')){const th=document.createElement('th');th.className='stake-col';th.textContent='Stake';hr.appendChild(th)}
    [...table.querySelectorAll('tr')].slice(1).forEach((tr,i)=>{const x=group[i];if(!x)return;let td=tr.querySelector('.stake-col');if(!td){td=document.createElement('td');td.className='stake-col';tr.appendChild(td)}td.innerHTML=`<b>${stakeLabel(x,!!x.topGeneral)}</b>`});
  });
}
const __renderResult1800=renderResult;
renderResult=function(r){__renderResult1800(r);enhanceStakeDisplay(r)};

// Calibración avanzada de bajas. Los valores crudos siguen siendo 0-100, pero el impacto efectivo
// considera titularidad/participación, peso táctico, cobertura del reemplazo y certeza de la baja.
function absenceCalibration(side){
  const val=(suffix,def)=>clamp(Number(document.getElementById(side+suffix)?.value ?? def),0,100);
  return {participation:val('AbsParticipation',100),tactical:val('AbsTactical',100),replacement:val('AbsReplacement',0),certainty:val('AbsCertainty',100)};
}
function calibratedAbsenceValue(raw,c){
  raw=clampImpact(raw);
  const saturated=raw<=70?raw:70+(raw-70)*.75; // rendimientos decrecientes en impactos extremos
  const participation=.65+.35*(c.participation/100);
  const tactical=.75+.25*(c.tactical/100);
  const replacement=1-.45*(c.replacement/100);
  const certainty=.70+.30*(c.certainty/100);
  return clampImpact(saturated*participation*tactical*replacement*certainty);
}
renderAbsenceCards=function(){
  const wrap=document.getElementById('absenceCards');if(!wrap)return;wrap.innerHTML='';
  for(const [side,title] of [['home','🏠 Local'],['away','✈️ Visitante']]){
    wrap.innerHTML+=`<div class="card absence-cal-card"><h3>${title}</h3><div class="grid"><label>Impacto bruto ataque 0–100<input id="${side}AbsAtt" class="abs-aggregate" type="number" min="0" max="100" step="1" value="0"></label><label>Impacto bruto defensa 0–100<input id="${side}AbsDef" class="abs-aggregate" type="number" min="0" max="100" step="1" value="0"></label><label>Participación / titularidad<input id="${side}AbsParticipation" class="abs-calibration" type="number" min="0" max="100" value="100"></label><label>Peso táctico<input id="${side}AbsTactical" class="abs-calibration" type="number" min="0" max="100" value="100"></label><label>Calidad del reemplazo<input id="${side}AbsReplacement" class="abs-calibration" type="number" min="0" max="100" value="0"></label><label>Certeza de la baja<input id="${side}AbsCertainty" class="abs-calibration" type="number" min="0" max="100" value="100"></label></div><div id="${side}AbsSummary" class="absence-summary"></div></div>`;
  }
  const update=()=>{for(const side of ['home','away']){const x=getAbsenceImpact(side),el=document.getElementById(side+'AbsSummary');if(el)el.innerHTML=`Impacto efectivo calibrado: <b>Ataque ${x.att.toFixed(0)}/100 · Defensa ${x.def.toFixed(0)}/100</b> <span>(${x.rawAtt.toFixed(0)}/${x.rawDef.toFixed(0)} bruto)</span>`}queueDraftSave()};
  document.querySelectorAll('.abs-aggregate,.abs-calibration').forEach(el=>el.addEventListener('input',update));update();
};
getAbsenceImpact=function(side){
  const rawAtt=clampImpact(document.getElementById(side+'AbsAtt')?.value),rawDef=clampImpact(document.getElementById(side+'AbsDef')?.value),cal=absenceCalibration(side);
  return {att:calibratedAbsenceValue(rawAtt,cal),def:calibratedAbsenceValue(rawDef,cal),rawAtt,rawDef,calibration:cal};
};
const __collectFormState1800=collectFormState;
collectFormState=function(){const d=__collectFormState1800();d.absenceRawInput={};d.absenceCalibration={};for(const side of ['home','away']){const x=getAbsenceImpact(side);d.absenceRawInput[side]={att:x.rawAtt,def:x.rawDef};d.absenceCalibration[side]=x.calibration}return d};
const __restoreDraft1800=restoreDraft;
restoreDraft=function(){__restoreDraft1800();try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(!d)return;for(const side of ['home','away']){if(d.absenceRawInput?.[side])setAggregateAbsence(side,d.absenceRawInput[side].att,d.absenceRawInput[side].def);const c=d.absenceCalibration?.[side];if(c){for(const [suf,key] of [['AbsParticipation','participation'],['AbsTactical','tactical'],['AbsReplacement','replacement'],['AbsCertainty','certainty']]){const el=document.getElementById(side+suf);if(el)el.value=c[key]}}}document.querySelector('.abs-calibration')?.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}};

// 5 filtros de apuestas.
let betHistoryFilter='all';
function applyBetHistoryFilter(filter=betHistoryFilter){
  betHistoryFilter=filter;document.querySelectorAll('.bet-filter').forEach(b=>{const active=b.dataset.betFilter===filter;b.classList.toggle('active',active);b.classList.toggle('secondary',!active)});
  document.querySelectorAll('#betHistoryTable .history-card').forEach(card=>{const s=['win','loss','push','pending'].find(x=>card.querySelector('.status-'+x));card.classList.toggle('filter-hidden',filter!=='all'&&s!==filter)});
}
const __renderBetHistory1800=renderBetHistory;
renderBetHistory=function(){__renderBetHistory1800();applyBetHistoryFilter()};

// Crear combinadas directamente desde el mismo historial donde se registra una apuesta sencilla.
function addToComboFromHistory(analysisId){
  const r=loadDB().find(x=>x.id===analysisId);if(!r||!r.rows?.length)return alert('No hay picks disponibles.');
  const opts=analysisPickOptions(r),text=opts.map((x,i)=>`${i+1}. ${x.label} @ ${x.odds.toFixed(2)} · ${x.decision}`).join('\n');
  const raw=prompt('Selecciona el pick para agregar a la combinada:\n\n'+text,'1');if(raw===null)return;const i=Number(raw)-1;if(!Number.isInteger(i)||!r.rows[i])return alert('Selección inválida.');
  const x=r.rows[i];if(comboBuilder.some(l=>l.analysisId===analysisId&&l.rowIndex===i))return alert('Ese pick ya está en la combinada.');
  comboBuilder.push({analysisId,rowIndex:i,date:r.date,home:r.home,away:r.away,market:x.market,label:marketLabel(x.market),odds:Number(x.odds)});show('combos');renderCombos();
}
const __renderHistory1800=renderHistory;
renderHistory=function(){
  __renderHistory1800();const db=loadDB(),cards=[...document.querySelectorAll('#historyTable .history-card')];
  cards.forEach((card,i)=>{const r=db[i];if(!r)return;const actions=card.querySelector('.history-card-actions');if(actions&&!actions.querySelector('.combo-from-history')){const b=document.createElement('button');b.type='button';b.className='secondary combo-from-history';b.textContent='+ Combinada';b.addEventListener('click',e=>{e.stopPropagation();addToComboFromHistory(r.id)});actions.insertBefore(b,actions.children[1]||null)}});
};

// FreeBet también en combinadas y bank consistente.
const __saveCombo1800=saveCombo;
saveCombo=function(){
  if(comboBuilder.length<2)return alert('Una combinada necesita al menos 2 selecciones.');
  const stake=Number(document.getElementById('comboStake')?.value)||0;if(stake<=0)return alert('Introduce el monto apostado.');
  const houseOdds=Number(document.getElementById('comboHouseOdds')?.value)||0;if(houseOdds<1)return alert('Introduce la cuota total real que muestra la casa de apuestas.');
  const name=document.getElementById('comboName')?.value.trim()||`Combinada ${new Date().toLocaleDateString('es-CO')}`,betType=document.getElementById('comboStakeType')?.value||'cash',theoreticalOdds=comboOdds(comboBuilder);
  const c={id:Date.now(),name,legs:JSON.parse(JSON.stringify(comboBuilder)),originalOdds:theoreticalOdds,theoreticalOdds,houseOdds,stake,betType,isFreeBet:betType==='freebet',status:'pending',pnl:0,createdAt:new Date().toISOString()};
  const combos=loadCombos();combos.unshift(c);saveCombos(combos);clearComboBuilder();renderCombos();
};
settleCombo=function(id){
  const combos=loadCombos(),c=combos.find(x=>x.id===id);if(!c)return;let hasLoss=false,allPush=true,effectiveOdds=1,statuses=[];
  for(const leg of c.legs){const raw=leg.voidedByAnalysisDelete?'push':(prompt(`Resultado de:\n${leg.label} · ${leg.home} vs ${leg.away}\n\nWIN / LOSS / PUSH`,'WIN')||'').trim().toLowerCase();if(!['win','loss','push'].includes(raw))return alert('Liquidación cancelada: resultado inválido.');statuses.push(raw);if(raw==='loss')hasLoss=true;if(raw==='win'){allPush=false;effectiveOdds*=Number(leg.odds)||1}}
  c.legResults=statuses;
  if(hasLoss){c.status='loss';c.pnl=isFreeBet(c)?0:-c.stake;c.effectiveOdds=0}else if(allPush){c.status='push';c.pnl=0;c.effectiveOdds=1}else{const hasPush=statuses.includes('push');let settledOdds;if(hasPush){const entered=Number(prompt('Hay una selección PUSH.\nIntroduce la cuota efectiva final liquidada por la casa:',effectiveOdds.toFixed(2)));if(!Number.isFinite(entered)||entered<1)return alert('Liquidación cancelada: cuota efectiva inválida.');settledOdds=entered}else settledOdds=Number(c.houseOdds)||Number(c.originalOdds)||effectiveOdds;c.effectiveOdds=settledOdds;c.status='win';c.pnl=c.stake*(settledOdds-1)}
  c.settledAt=new Date().toISOString();saveCombos(combos);renderCombos();
};
financeSummary=function(){
  const bank=loadBank(),bets=loadBets(),combos=loadCombos(),adj=(bank.adjustments||[]).reduce((s,x)=>s+(Number(x.amount)||0),0);
  const betPnl=bets.reduce((s,x)=>s+(x.status!=='pending'?(Number(x.pnl)||0):0),0),comboPnl=combos.reduce((s,x)=>s+(x.status!=='pending'?(Number(x.pnl)||0):0),0);
  const pending=bets.filter(x=>x.status==='pending'&&!isFreeBet(x)).reduce((s,x)=>s+(Number(x.stake)||0),0)+combos.filter(x=>x.status==='pending'&&!isFreeBet(x)).reduce((s,x)=>s+(Number(x.stake)||0),0);
  const current=(Number(bank.initial)||0)+adj+betPnl+comboPnl;return {initial:Number(bank.initial)||0,adj,betPnl,comboPnl,pnl:betPnl+comboPnl,current,pending,available:current-pending};
};
const __renderCombos1800=renderCombos;
renderCombos=function(){__renderCombos1800();document.querySelectorAll('#comboList .combo-card').forEach((card,i)=>{const c=loadCombos()[i];if(c&&isFreeBet(c)&&!card.querySelector('.freebet-chip')){const chip=document.createElement('span');chip.className='freebet-chip';chip.textContent='🎁 FREEBET';card.prepend(chip)}})};

function bindV1800StaticEvents(){
  document.querySelectorAll('.bet-filter').forEach(b=>b.addEventListener('click',()=>applyBetHistoryFilter(b.dataset.betFilter)));
  const type=document.getElementById('comboStakeType');if(type)type.addEventListener('change',renderComboBuilder);
}
renderAbsenceCards();bindV1800StaticEvents();renderBank();



// Static event bindings extracted from index.html
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelector('[data-v1800-event=\"v1800-static-1\"]')?.addEventListener('click',function(event){ setInitialBank() });
  document.querySelector('[data-v1800-event=\"v1800-static-2\"]')?.addEventListener('click',function(event){ adjustBank() });
  document.querySelector('[data-v1800-event=\"v1800-static-3\"]')?.addEventListener('click',function(event){ show('analysis') });
  document.querySelector('[data-v1800-event=\"v1800-static-4\"]')?.addEventListener('click',function(event){ show('history') });
  document.querySelector('[data-v1800-event=\"v1800-static-5\"]')?.addEventListener('click',function(event){ show('betHistory') });
  document.querySelector('[data-v1800-event=\"v1800-static-6\"]')?.addEventListener('click',function(event){ show('combos') });
  document.querySelector('[data-v1800-event=\"v1800-static-7\"]')?.addEventListener('click',function(event){ show('backup') });
  document.querySelector('[data-v1800-event=\"v1800-static-8\"]')?.addEventListener('change',function(event){ toggleMatchMode() });
  document.querySelector('[data-v1800-event=\"v1800-static-9\"]')?.addEventListener('change',function(event){ toggleAggregate() });
  document.querySelector('[data-v1800-event=\"v1800-static-10\"]')?.addEventListener('click',function(event){ clearCurrentForm() });
  document.querySelector('[data-v1800-event=\"v1800-static-11\"]')?.addEventListener('change',function(event){ refreshComboPickOptions() });
  document.querySelector('[data-v1800-event=\"v1800-static-12\"]')?.addEventListener('click',function(event){ addComboLeg() });
  document.querySelector('[data-v1800-event=\"v1800-static-13\"]')?.addEventListener('click',function(event){ clearComboBuilder() });
  document.querySelector('[data-v1800-event=\"v1800-static-14\"]')?.addEventListener('input',function(event){ renderComboBuilder() });
  document.querySelector('[data-v1800-event=\"v1800-static-15\"]')?.addEventListener('input',function(event){ renderComboBuilder() });
  document.querySelector('[data-v1800-event=\"v1800-static-16\"]')?.addEventListener('click',function(event){ saveCombo() });
  document.querySelector('[data-v1800-event=\"v1800-static-17\"]')?.addEventListener('click',function(event){ exportData() });
  document.querySelector('[data-v1800-event=\"v1800-static-18\"]')?.addEventListener('change',function(event){ importData(event) });
  document.querySelector('[data-v1800-event=\"v1800-static-19\"]')?.addEventListener('click',function(event){ document.getElementById('importFile').click() });
  document.querySelector('[data-v1800-event=\"v1800-static-20\"]')?.addEventListener('click',function(event){ clearAll() });
  document.querySelector('[data-v1800-event=\"v1800-static-21\"]')?.addEventListener('click',function(event){ closeBetModal() });
  document.querySelector('[data-v1800-event=\"v1800-static-22\"]')?.addEventListener('click',function(event){ closeBetModal() });
  document.querySelector('[data-v1800-event=\"v1800-static-23\"]')?.addEventListener('click',function(event){ confirmBetFromModal() });
});