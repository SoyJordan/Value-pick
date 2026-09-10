// SoyJordan Picks V2.5.0 · build 2500
// Capa evolutiva: fuerza estructural, oposición, confirmación, tendencia,
// de-vig, calibración probabilística, Brier, CLV, riesgo financiero y stake Kelly fraccionado.
(function(){
'use strict';

const V2500={
  version:'2.5.0',build:2500,
  weights:{last10:.50,last5:.30,condition5:.20},
  teamLevelLeague:{slope:.0015,cap:.06,strongBoost:.55},
  cupStructure:{leagueWeight:.70,teamWeight:.30,slope:.0045,cap:.18,strongBoost:.55},
  opposition:{neutral:50,slope:.002,capLow:.90,capHigh:1.10},
  confirmation:{capLow:.94,capHigh:1.06},
  trend:{capLow:.97,capHigh:1.03},
  leagueVenue:{capLow:.96,capHigh:1.04},
  kellyFraction:.25,stakeMaxPct:.015
};
window.SJP_V2500_PARAMS=V2500;

function num(v,fallback=null){const n=Number(v);return Number.isFinite(n)?n:fallback}
function pctFactor(x){return `${((Number(x)||1)-1)*100>=0?'+':''}${(((Number(x)||1)-1)*100).toFixed(1)}%`}
function avg(vals){const a=vals.filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function std(vals){const m=avg(vals);if(m==null||vals.length<2)return 0;return Math.sqrt(vals.reduce((s,x)=>s+(x-m)**2,0)/vals.length)}
function safeDiv(a,b,f=0){return Number.isFinite(a)&&Number.isFinite(b)&&b!==0?a/b:f}
function statusLabel(f){if(f>=1.015)return 'Confirmada';if(f<=.985)return 'Contradictoria';return 'Neutral'}
function trendLabel(f){if(f>=1.01)return 'Mejorando';if(f<=.99)return 'Empeorando';return 'Estable'}

// --- UI: campos nuevos sin romper la estructura existente ---
function injectFields(){
  const grid=document.querySelector('#analysis .card .grid');
  if(!grid||document.getElementById('homeOppLast10'))return;
  const marker=document.getElementById('dataSource')?.closest('label');
  const wrap=document.createElement('div');wrap.className='full';
  wrap.innerHTML=`<div class="note v2500-context"><b>🧠 Contexto estructural V2.5</b><div class="grid" style="margin-top:8px">
    <label>Nivel LOCAL dentro de su liga (0–100)<input id="homeTeamStrengthLeague" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Nivel VISITANTE dentro de su liga (0–100)<input id="awayTeamStrengthLeague" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales LOCAL · Últ.10<input id="homeOppLast10" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales VISITANTE · Últ.10<input id="awayOppLast10" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales LOCAL · Últ.5<input id="homeOppLast5" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales VISITANTE · Últ.5<input id="awayOppLast5" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales LOCAL · condición<input id="homeOppCondition" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Fuerza rivales VISITANTE · condición<input id="awayOppCondition" type="number" min="0" max="100" step="1" value="50"></label>
    <label>Goles prom. LOCAL de la liga <span class="muted">(opcional)</span><input id="leagueHomeGoalsAvg" type="number" step=".01" min=".1" placeholder="Ej. 1.52"></label>
    <label>Goles prom. VISITANTE de la liga <span class="muted">(opcional)</span><input id="leagueAwayGoalsAvg" type="number" step=".01" min=".1" placeholder="Ej. 1.18"></label>
    <label>xG prom. LOCAL de la liga <span class="muted">(opcional)</span><input id="leagueHomeXgAvg" type="number" step=".01" min=".1" placeholder="Opcional"></label>
    <label>xG prom. VISITANTE de la liga <span class="muted">(opcional)</span><input id="leagueAwayXgAvg" type="number" step=".01" min=".1" placeholder="Opcional"></label>
  </div><div class="small muted" style="margin-top:7px">Nivel Equipo no entra al 50/30/20. Oposición usa 50/30/20. Los ajustes son contextuales, pequeños y con caps centralizados.</div></div>`;
  if(marker)grid.insertBefore(wrap,marker);else grid.appendChild(wrap);
  wrap.querySelectorAll('input').forEach(x=>x.addEventListener('input',()=>window.queueDraftSave?.()));
  // En Copa se sincronizan los niveles comunes con los campos interliga existentes.
  const hs=document.getElementById('homeTeamStrength'),as=document.getElementById('awayTeamStrength'),hsl=document.getElementById('homeTeamStrengthLeague'),asl=document.getElementById('awayTeamStrengthLeague');
  hsl?.addEventListener('input',()=>{if(hs)hs.value=hsl.value});asl?.addEventListener('input',()=>{if(as)as.value=asl.value});
  hs?.addEventListener('input',()=>{if(hsl)hsl.value=hs.value});as?.addEventListener('input',()=>{if(asl)asl.value=as.value});
}

// --- Equipo: añade fuerza de oposición al objeto ya existente ---
const oldGetTeam=window.getTeam;
window.getTeam=function(side){
  const d=oldGetTeam(side);
  d.opposition={
    last10:num(document.getElementById(side+'OppLast10')?.value,50),
    last5:num(document.getElementById(side+'OppLast5')?.value,50),
    condition5:num(document.getElementById(side+'OppCondition')?.value,50)
  };
  return d;
};

function weightedOpp(d){
  const vals=[['last10',.50],['last5',.30],['condition5',.20]].map(([k,w])=>({v:num(d?.opposition?.[k],null),w})).filter(x=>x.v!=null);
  if(!vals.length)return 50;const ws=vals.reduce((s,x)=>s+x.w,0);return vals.reduce((s,x)=>s+x.v*x.w/ws,0);
}
function oppositionFactors(d){
  const s=clamp(weightedOpp(d),0,100),delta=s-V2500.opposition.neutral;
  return {strength:s,attack:clamp(1+delta*V2500.opposition.slope,V2500.opposition.capLow,V2500.opposition.capHigh),defWeakness:clamp(1-delta*V2500.opposition.slope,V2500.opposition.capLow,V2500.opposition.capHigh)};
}
function windowPM(d,p,k){return perMatch(d,p,k)}
function offensiveConfirmation(d,base){
  const xg=weightedPerMatch(d,'xg');if(xg==null)return {factor:1,status:'Neutral',support:null};
  const support=avg([safeDiv(weightedPerMatch(d,'shots'),12,null),safeDiv(weightedPerMatch(d,'sot'),4.2,null),safeDiv(weightedPerMatch(d,'bc'),2.2,null)]);
  if(support==null)return {factor:1,status:'Neutral',support:null};
  const xr=clamp(xg/Math.max(.5,base),.35,2.5),sd=support-1,xd=xr-1;
  let signal=0;if(xd*sd>0)signal=Math.sign(xd)*Math.min(.06,Math.abs(xd*sd)*.09);else if(Math.abs(xd)>.18&&Math.sign(xd)!==Math.sign(sd))signal=-Math.sign(xd)*Math.min(.06,Math.abs(xd-sd)*.035);
  const factor=clamp(1+signal,V2500.confirmation.capLow,V2500.confirmation.capHigh);return {factor,status:statusLabel(factor),support};
}
function defensiveConfirmation(d,base){
  const xga=weightedPerMatch(d,'xga');if(xga==null)return {factor:1,status:'Neutral',support:null};
  const support=avg([safeDiv(weightedPerMatch(d,'sa'),12,null),safeDiv(weightedPerMatch(d,'sota'),4.2,null),safeDiv(weightedPerMatch(d,'bca'),2.2,null)]);
  if(support==null)return {factor:1,status:'Neutral',support:null};
  const xr=clamp(xga/Math.max(.5,base),.35,2.5),sd=support-1,xd=xr-1;
  let signal=0;if(xd*sd>0)signal=Math.sign(xd)*Math.min(.06,Math.abs(xd*sd)*.09);else if(Math.abs(xd)>.18&&Math.sign(xd)!==Math.sign(sd))signal=-Math.sign(xd)*Math.min(.06,Math.abs(xd-sd)*.035);
  const factor=clamp(1+signal,V2500.confirmation.capLow,V2500.confirmation.capHigh);return {factor,status:statusLabel(factor),support};
}
function trendFactors(d){
  const ratio=(k,invert=false)=>{const a=windowPM(d,'last5',k),b=windowPM(d,'last10',k);if(a==null||b==null||b<=.05)return null;const r=clamp(a/b,.65,1.35);return invert?2-r:r};
  const off=avg([ratio('xg'),ratio('gf'),ratio('sot'),ratio('bc')]);
  const def=avg([ratio('xga',true),ratio('ga',true),ratio('sota',true),ratio('bca',true)]);
  const toFactor=v=>v==null?1:clamp(1+(v-1)*.10,V2500.trend.capLow,V2500.trend.capHigh);
  return {offFactor:toFactor(off),defFactor:toFactor(def),globalFactor:toFactor(avg([off,def])),label:trendLabel(toFactor(avg([off,def])))};
}
function leagueVenueFactors(opts,avgBase){
  let hg=num(opts.leagueHomeGoalsAvg,null),ag=num(opts.leagueAwayGoalsAvg,null),hx=num(opts.leagueHomeXgAvg,null),ax=num(opts.leagueAwayXgAvg,null);
  const home=avg([hg,hx]),away=avg([ag,ax]);
  if(home==null||away==null||home<=0||away<=0)return {home:1.08,away:.96,source:'FALLBACK'};
  const mean=(home+away)/2||avgBase;const rawH=Math.sqrt(home/mean),rawA=Math.sqrt(away/mean);
  return {home:clamp(1+(rawH-1)*.5,V2500.leagueVenue.capLow,V2500.leagueVenue.capHigh),away:clamp(1+(rawA-1)*.5,V2500.leagueVenue.capLow,V2500.leagueVenue.capHigh),source:'LEAGUE_DATA'};
}

// --- Motor λ V2.5 ---
window.expGoals=function(h,a,avgBase,absH,absA,opts={}){
  const hXG=weightedPerMatch(h,'xg'),hGF=weightedPerMatch(h,'gf'),hXGA=weightedPerMatch(h,'xga'),hGA=weightedPerMatch(h,'ga');
  const aXG=weightedPerMatch(a,'xg'),aGF=weightedPerMatch(a,'gf'),aXGA=weightedPerMatch(a,'xga'),aGA=weightedPerMatch(a,'ga');
  const isCup=opts.mode==='cup';const avgH=isCup?clamp(num(opts.homeLeagueAvg,avgBase),.50,3.50):avgBase;const avgA=isCup?clamp(num(opts.awayLeagueAvg,avgBase),.50,3.50):avgBase;
  function attack(xg,gf,base){const vals=[xg,gf].filter(v=>v!=null);if(!vals.length)return {raw:1,shrunk:1,source:'default'};const raw=vals.length===2?.7*(vals[0]/base)+.3*(vals[1]/base):vals[0]/base;return {raw,shrunk:shrink(raw),source:vals.length===2?'70% xG / 30% GF':'available metric'}}
  function defense(xga,ga,base){const vals=[xga,ga].filter(v=>v!=null);if(!vals.length)return {raw:1,shrunk:1,source:'default'};const raw=vals.length===2?.7*(vals[0]/base)+.3*(vals[1]/base):vals[0]/base;return {raw,shrunk:shrink(raw),source:vals.length===2?'70% xGA / 30% GA':'available metric'}}
  const Hatt=attack(hXG,hGF,avgH),Aatt=attack(aXG,aGF,avgA),Hdef=defense(hXGA,hGA,avgH),Adef=defense(aXGA,aGA,avgA);
  const oppH=oppositionFactors(h),oppA=oppositionFactors(a),confOffH=offensiveConfirmation(h,avgH),confOffA=offensiveConfirmation(a,avgA),confDefH=defensiveConfirmation(h,avgH),confDefA=defensiveConfirmation(a,avgA),trendH=trendFactors(h),trendA=trendFactors(a);
  const oppHAtt=Hatt.shrunk*oppH.attack,oppAAtt=Aatt.shrunk*oppA.attack,oppHDef=Hdef.shrunk*oppH.defWeakness,oppADef=Adef.shrunk*oppA.defWeakness;
  const confirmFactorH=clamp(1+.5*(confOffH.factor-1)+.5*(confDefA.factor-1),.94,1.06),confirmFactorA=clamp(1+.5*(confOffA.factor-1)+.5*(confDefH.factor-1),.94,1.06);
  const venue=leagueVenueFactors(opts,avgBase),homeVenue=venue.home,awayVenue=venue.away;
  const ownAttackH=avgH*oppHAtt*confirmFactorH,ownAttackA=avgA*oppAAtt*confirmFactorA;
  const structuralH=ownAttackH*oppADef*homeVenue,structuralA=ownAttackA*oppHDef*awayVenue;
  const lambdaRegularization=.55,regularizedH=ownAttackH+lambdaRegularization*(structuralH-ownAttackH),regularizedA=ownAttackA+lambdaRegularization*(structuralA-ownAttackA);
  const teamStrengthH=clamp(num(opts.homeTeamStrength,50),0,100),teamStrengthA=clamp(num(opts.awayTeamStrength,50),0,100),teamDiff=teamStrengthH-teamStrengthA;
  let leagueStrengthH=50,leagueStrengthA=50,interIndexH=teamStrengthH,interIndexA=teamStrengthA,interDiff=teamDiff,levelFactorH=1,levelFactorA=1,levelSource=isCup?'CUP_INTERLEAGUE':'LEAGUE_TEAM';
  if(isCup){
    leagueStrengthH=clamp(num(opts.homeLeagueStrength,50),0,100);leagueStrengthA=clamp(num(opts.awayLeagueStrength,50),0,100);
    interIndexH=V2500.cupStructure.leagueWeight*leagueStrengthH+V2500.cupStructure.teamWeight*teamStrengthH;interIndexA=V2500.cupStructure.leagueWeight*leagueStrengthA+V2500.cupStructure.teamWeight*teamStrengthA;interDiff=interIndexH-interIndexA;
    const adj=clamp(interDiff*V2500.cupStructure.slope,-V2500.cupStructure.cap,V2500.cupStructure.cap);
    if(adj>=0){levelFactorH=1+adj*V2500.cupStructure.strongBoost;levelFactorA=1-adj}else{levelFactorH=1+adj;levelFactorA=1-adj*V2500.cupStructure.strongBoost}
  }else{
    const adj=clamp(teamDiff*V2500.teamLevelLeague.slope,-V2500.teamLevelLeague.cap,V2500.teamLevelLeague.cap);
    if(adj>=0){levelFactorH=1+adj*V2500.teamLevelLeague.strongBoost;levelFactorA=1-adj}else{levelFactorH=1+adj;levelFactorA=1-adj*V2500.teamLevelLeague.strongBoost}
  }
  const levelH=regularizedH*levelFactorH,levelA=regularizedA*levelFactorA;
  let aggregateFactorH=1,aggregateFactorA=1,aggregateDeficitH=0,aggregateDeficitA=0;const cc=opts.cupContext||null;
  if(isCup&&cc?.leg==='second'){const gh=num(cc.aggHome,0),ga=num(cc.aggAway,0);aggregateDeficitH=Math.max(0,ga-gh);aggregateDeficitA=Math.max(0,gh-ga);aggregateFactorH=aggregateDeficitH>=2?1.08:aggregateDeficitH===1?1.04:1;aggregateFactorA=aggregateDeficitA>=2?1.08:aggregateDeficitA===1?1.04:1}
  const trendFactorH=clamp(1+.5*(trendH.offFactor-1)+.5*(trendA.defFactor-1),.97,1.03),trendFactorA=clamp(1+.5*(trendA.offFactor-1)+.5*(trendH.defFactor-1),.97,1.03);
  const tacticalH=levelH*aggregateFactorH*trendFactorH,tacticalA=levelA*aggregateFactorA*trendFactorA;
  const restH=currentRest(h),restA=currentRest(a),restHF=1+clamp(restH-7,-3,3)*.01,restAF=1+clamp(restA-7,-3,3)*.01;
  const absenceHAtt=1-.085*(absH.att/100),absenceAAtt=1-.085*(absA.att/100),absenceHDef=1+.085*(absH.def/100),absenceADef=1+.085*(absA.def/100),absenceComboH=clamp(absenceHAtt*absenceADef,.88,1.12),absenceComboA=clamp(absenceAAtt*absenceHDef,.88,1.12);
  const finalH=clamp(tacticalH*absenceComboH*restHF,.20,3.50),finalA=clamp(tacticalA*absenceComboA*restAF,.20,3.50);
  const diag={Hatt,Aatt,Hdef,Adef,avgH,avgA,ownAttackH,ownAttackA,structuralH,structuralA,baseH:structuralH,baseA:structuralA,regularizedH,regularizedA,lambdaRegularization,
    oppH,oppA,confOffH,confOffA,confDefH,confDefA,confirmFactorH,confirmFactorA,homeVenue,awayVenue,venueSource:venue.source,
    leagueStrengthH,leagueStrengthA,teamStrengthH,teamStrengthA,teamDiff,interIndexH,interIndexA,interDiff,interFactorH:levelFactorH,interFactorA:levelFactorA,levelFactorH,levelFactorA,levelSource,interleagueH:levelH,interleagueA:levelA,
    trendH,trendA,trendFactorH,trendFactorA,aggregateFactorH,aggregateFactorA,aggregateDeficitH,aggregateDeficitA,tacticalH,tacticalA,
    restH,restA,restHF,restAF,absenceHAtt,absenceAAtt,absenceHDef,absenceADef,absenceComboH,absenceComboA,mode:isCup?'cup':'league',cupContext:cc,v2500:true};
  window.__SJP_V2500_LAST_DIAG=diag;return {hl:finalH,al:finalA,diag};
};

// Confianza: confirma/penaliza levemente contradicciones, sin convertir tiros en un segundo xG.
const oldConfidence=window.confidenceScore;
window.confidenceScore=function(){let c=oldConfidence.apply(this,arguments),d=window.__SJP_V2500_LAST_DIAG;if(!d)return c;const fs=[d.confirmFactorH,d.confirmFactorA];const contradiction=fs.filter(x=>x<=.985).length,confirmation=fs.filter(x=>x>=1.015).length;return clamp(c-contradiction*2+confirmation*0.5,25,95)};

// --- De-vig ---
function annotateFair(rows){
  const byKey=Object.fromEntries(rows.map(r=>[String(r.market),r]));
  const groups=[['home','draw','away'],['over15','under15'],['over25','under25'],['over35','under35'],['bttsYes','bttsNo'],['home05','homeU05'],['home15','homeU15'],['home25','homeU25'],['away05','awayU05'],['away15','awayU15'],['away25','awayU25']];
  for(const g of groups){const rr=g.map(k=>byKey[k]).filter(Boolean);if(rr.length!==g.length)continue;const s=rr.reduce((z,r)=>z+1/Number(r.odds),0);if(!(s>0))continue;rr.forEach(r=>{r.rawImplied=1/Number(r.odds);r.marketFairProb=r.rawImplied/s;r.marketFairEdge=(Number(r.p)||0)-r.marketFairProb;r.marketOverround=s-1})}
}
const oldRankRows=window.rankRows;
window.rankRows=function(rows,opts={}){annotateFair(rows);return oldRankRows(rows,opts)};

// --- Fiabilidad histórica dinámica con shrinkage ---
const STATIC_REL={away15:.70,bttsYes:.95,away05:.90,over25:1.08,awayDnb:1.08,homeDnb:1.05,awayOrDraw:1.05,homeOrDraw:1.05};
function marketReliabilityDetails(k){
  const bets=loadBets().filter(b=>b.status!=='pending'&&String(b.market)===String(k));const decided=bets.filter(b=>['win','loss'].includes(b.status));const n=decided.length,staticMult=STATIC_REL[String(k)]??1;
  if(n<20)return {score:50,n,source:'STATIC',multiplier:staticMult};
  const hit=decided.filter(b=>b.status==='win').length/n;const probs=decided.map(b=>num(b.preMatchSnapshot?.prob,null)).filter(x=>x!=null);const actual=decided.filter(b=>num(b.preMatchSnapshot?.prob,null)!=null);const calib=actual.length?1-Math.min(1,Math.abs(avg(actual.map(b=>b.preMatchSnapshot.prob))-actual.filter(b=>b.status==='win').length/actual.length)/.20):.5;
  const brier=actual.length?avg(actual.map(b=>(num(b.preMatchSnapshot.prob,0)-(b.status==='win'?1:0))**2)):null;const brierScore=brier==null?.5:clamp(1-brier/.35,0,1);
  const cash=decided.filter(b=>!isFreeBet(b)),stake=cash.reduce((s,b)=>s+num(b.stake,0),0),roi=stake?cash.reduce((s,b)=>s+num(b.pnl,0),0)/stake:0,roiScore=clamp(.5+roi,0,1);
  const clvs=decided.map(b=>b.clv).filter(Number.isFinite),clvScore=clvs.length?clamp(.5+avg(clvs)*2,0,1):.5;
  const raw=100*(.30*calib+.25*brierScore+.20*roiScore+.15*clvScore+.10*clamp(hit/.65,0,1));const strength=n<50?.25:n<100?.50:.75;const score=50+(raw-50)*strength;const histMult=clamp(.85+(score/100)*.23,.85,1.08);const blend=n<50?.25:n<100?.50:.75;
  return {score,n,source:n>=100?'HISTORICAL':'BLENDED',multiplier:staticMult*(1-blend)+histMult*blend,hit,roi,brier,calibration:calib,clv:clvs.length?avg(clvs):null};
}
window.marketReliabilityDetails=marketReliabilityDetails;
window.historicalMarketReliability=function(k){return marketReliabilityDetails(k).multiplier};

// --- Stake: Kelly fraccionado + calidad + caps; Top General no fuerza stake ---
window.recommendedStake=function(row,isTopGeneral=false){
  if(!row||row.dec!=='VALUE BET'||row.selectorEligible===false)return {units:0,amount:0,mode:row?.dec==='WATCH'?'watch-only':'no-bet',tier:'NO BET',fullKelly:0,fractionalKelly:0,stakePct:0,reason:'No supera elegibilidad'};
  const p=clamp(num(row.p,0),0,1),odds=num(row.odds,0),b=odds-1,q=1-p;if(b<=0)return {units:0,amount:0,mode:'no-bet',tier:'NO BET',fullKelly:0,fractionalKelly:0,stakePct:0,reason:'Cuota inválida'};
  const fullKelly=Math.max(0,(b*p-q)/b),fractionalKelly=fullKelly*V2500.kellyFraction;
  const worst=num(row.worstEV,0),rob=num(row.robustness,0)/100,conf=num(row.selectorConf??row.conf,0)/100,score=num(row.rankScore,0)/100,rel=marketReliabilityDetails(row.market),sampleFactor=rel.n<20?.75:rel.n<50?.85:rel.n<100?.93:1;
  const quality=clamp(.30*rob+.25*conf+.25*score+.20*clamp((worst+.02)/.18,0,1),0,1);let stakePct=fractionalKelly*quality*sampleFactor;
  let cap=.005;if(worst>=.04&&rob>=.70&&conf>=.72)cap=.0075;if(worst>=.07&&rob>=.78&&conf>=.78&&score>=.78)cap=.010;if(worst>=.10&&rob>=.85&&conf>=.85&&score>=.85)cap=.0125;if(worst>=.14&&rob>=.90&&conf>=.90&&score>=.90&&rel.score>=55)cap=.015;
  if(num(row.marketDivergence,1)>1.35)cap=Math.min(cap,.0075);if(num(row.odds,0)>=3)cap=Math.min(cap,.0075);if(rel.multiplier<.90)cap=Math.min(cap,.005);const fx=financeSummary?.();const exposurePct=fx&&num(fx.current,0)>0?num(fx.pending,0)/num(fx.current,1):0;if(exposurePct>=.10)cap=Math.min(cap,.005);else if(exposurePct>=.05)cap=Math.min(cap,.0075);stakePct=Math.min(stakePct,cap,V2500.stakeMaxPct);if(stakePct<.0025)return {units:0,amount:0,mode:'no-bet',tier:'NO BET',fullKelly,fractionalKelly,stakePct:0,reason:'Ventaja insuficiente después de caps'};
  const bank=Math.max(0,num(financeSummary()?.current,0)||num(loadBank()?.initial,0)),amount=bank*stakePct,units=stakePct*100;return {units,amount,unitValue:bank*.01,mode:'bet',tier:stakePct>=.0125?'EXCEPCIONAL':stakePct>=.01?'MUY SÓLIDA':stakePct>=.0075?'SÓLIDA':'PEQUEÑA',fullKelly,fractionalKelly,stakePct,reason:stakePct+1e-9<Math.min(fractionalKelly,V2500.stakeMaxPct)?`Cap aplicado ${(cap*100).toFixed(2)}%`:'Kelly fraccionado'};
};
window.stakeLabel=function(row,isTop=false){const s=recommendedStake(row,isTop);if(s.mode==='watch-only')return 'SEGUIMIENTO';if(s.mode==='no-bet'||!s.stakePct)return '—';return `${(s.stakePct*100).toFixed(2)}% · ${money(s.amount)}`};

// --- CLV y refresco transaccional al liquidar ---
window.settleBet=function(betId){
  const bets=loadBets(),b=bets.find(x=>x.id===betId);if(!b)return;const res=(prompt('Resultado de la apuesta: WIN, LOSS o PUSH',b.status==='pending'?'WIN':b.status.toUpperCase())||'').trim().toLowerCase();if(!['win','loss','push'].includes(res))return alert('Resultado inválido.');
  const closeRaw=prompt('Cuota de cierre (opcional). Déjala vacía si no la tienes:',b.closingOdds?Number(b.closingOdds).toFixed(2):'');if(closeRaw!==null&&String(closeRaw).trim()!==''){const co=Number(String(closeRaw).replace(',','.'));if(!Number.isFinite(co)||co<=1)return alert('Cuota de cierre inválida.');b.closingOdds=co;b.clv=Number(b.odds)/co-1}else if(closeRaw!==null&&String(closeRaw).trim()===''){delete b.closingOdds;delete b.clv}
  b.status=res;b.pnl=calcBetPnl(b,res);b.settledAt=new Date().toISOString();saveBets(bets);renderHistory();renderBetHistory();renderCalibration();renderBank();openHistoryDetail(b.analysisId);
};

// Snapshot: enriquecer toda apuesta nueva sin alterar la lógica de bloqueo.
const oldSaveBets=window.saveBets;
window.saveBets=function(arr){
  (arr||[]).forEach(b=>{if(!b.preMatchSnapshot&&b.analysisId){const r=loadDB().find(x=>String(x.id)===String(b.analysisId)),row=r?.rows?.find(x=>String(x.market)===String(b.market));if(r&&row)b.preMatchSnapshot={modelVersion:r.version||'2.5.0',lambdaHome:r.hl,lambdaAway:r.al,prob:row.p,ev:row.e,confidence:row.conf,robustness:row.robustness,worstEV:row.worstEV,decision:row.dec,score:row.rankScore,marketFairProb:row.marketFairProb??null}}});
  oldSaveBets(arr);
};

// --- Métricas de calibración y riesgo ---
function joinedSettled(){const db=loadDB();return loadBets().filter(b=>b.status!=='pending').map(b=>({...b,analysis:db.find(r=>String(r.id)===String(b.analysisId))}));}
function calibrationRows(items,keyFn){const m=new Map();items.forEach(b=>{const p=num(b.preMatchSnapshot?.prob,null);if(p==null||!['win','loss'].includes(b.status))return;const k=keyFn(b,p);if(!m.has(k))m.set(k,[]);m.get(k).push(b)});return [...m.entries()].map(([k,a])=>{const ps=a.map(b=>num(b.preMatchSnapshot.prob,0)),pred=avg(ps),real=a.filter(b=>b.status==='win').length/a.length,diff=real-pred,pnl=a.reduce((s,b)=>s+num(b.pnl,0),0),stake=a.filter(b=>!isFreeBet(b)).reduce((s,b)=>s+num(b.stake,0),0),brier=avg(a.map(b=>(num(b.preMatchSnapshot.prob,0)-(b.status==='win'?1:0))**2));return {k,n:a.length,pred,real,diff,pnl,roi:stake?pnl/stake:0,brier,state:diff<-.05?'Sobreconfianza':diff>.05?'Infraconfianza':'Bien calibrado'}})}
function probBucket(p){const v=p*100;if(v<55)return '50–55%';if(v<60)return '55–60%';if(v<65)return '60–65%';if(v<70)return '65–70%';if(v<75)return '70–75%';if(v<80)return '75–80%';return '80%+'}
function calibrationTable(title,rows){return `<div class="card calibration-sub"><h3>${title}</h3>${rows.length?`<div class="table-scroll"><table><tr><th>Grupo</th><th>N</th><th>Pred.</th><th>Real</th><th>Error</th><th>Brier</th><th>ROI</th><th>Estado</th></tr>${rows.map(x=>`<tr><td><b>${x.k}</b></td><td>${x.n}</td><td>${(x.pred*100).toFixed(1)}%</td><td>${(x.real*100).toFixed(1)}%</td><td>${x.diff>=0?'+':''}${(x.diff*100).toFixed(1)} pp</td><td>${x.brier.toFixed(3)}</td><td>${(x.roi*100).toFixed(1)}%</td><td>${x.state}</td></tr>`).join('')}</table></div>`:'<p class="muted">Muestra insuficiente.</p>'}</div>`}
function riskMetrics(){
  const bank=loadBank(),items=[...loadBets().map(x=>({...x,type:'bet'})),...loadCombos().map(x=>({...x,type:'combo'}))].filter(x=>x.status!=='pending').sort((a,b)=>new Date(a.settledAt||a.createdAt||0)-new Date(b.settledAt||b.createdAt||0));let equity=num(bank.initial,0),peak=equity,maxDD=0,currentDD=0;for(const x of items){equity+=num(x.pnl,0);peak=Math.max(peak,equity);const dd=peak>0?(peak-equity)/peak:0;maxDD=Math.max(maxDD,dd);currentDD=dd}
  const settled=loadBets().filter(b=>b.status!=='pending'&&!isFreeBet(b)),grossWin=settled.filter(b=>num(b.pnl,0)>0).reduce((s,b)=>s+num(b.pnl,0),0),grossLoss=Math.abs(settled.filter(b=>num(b.pnl,0)<0).reduce((s,b)=>s+num(b.pnl,0),0)),pf=grossLoss?grossWin/grossLoss:null;
  let maxW=0,maxL=0,cw=0,cl=0;for(const b of loadBets().filter(b=>['win','loss'].includes(b.status)).sort((a,b)=>new Date(a.settledAt||0)-new Date(b.settledAt||0))){if(b.status==='win'){cw++;cl=0}else{cl++;cw=0}maxW=Math.max(maxW,cw);maxL=Math.max(maxL,cl)}
  const seq=loadBets().filter(b=>['win','loss'].includes(b.status)).sort((a,b)=>new Date(b.settledAt||0)-new Date(a.settledAt||0)),cur=seq.length?(seq[0].status==='win'?`${seq.findIndex(x=>x.status!=='win')<0?seq.length:seq.findIndex(x=>x.status!=='win')} W`:`${seq.findIndex(x=>x.status!=='loss')<0?seq.length:seq.findIndex(x=>x.status!=='loss')} L`):'—';const rets=settled.filter(b=>num(b.stake,0)>0).map(b=>num(b.pnl,0)/num(b.stake,1));return {currentDD,maxDD,pf,maxW,maxL,cur,vol:std(rets)};
}
function exposureMetrics(){const f=financeSummary(),bank=Math.max(1,num(f.current,0)),pending=loadBets().filter(b=>b.status==='pending'&&!isFreeBet(b)),by=new Map();pending.forEach(b=>by.set(String(b.analysisId),(by.get(String(b.analysisId))||0)+1));return {money:num(f.pending,0),pct:num(f.pending,0)/bank,count:pending.length+loadCombos().filter(c=>c.status==='pending'&&!isFreeBet(c)).length,correlated:[...by.values()].filter(n=>n>1).length}}
window.renderCalibration=function(){
  const items=joinedSettled(),decided=items.filter(b=>['win','loss'].includes(b.status)&&num(b.preMatchSnapshot?.prob,null)!=null),cash=items.filter(b=>!isFreeBet(b)),stake=cash.reduce((s,b)=>s+num(b.stake,0),0),pnl=cash.reduce((s,b)=>s+num(b.pnl,0),0),brier=decided.length?avg(decided.map(b=>(num(b.preMatchSnapshot.prob,0)-(b.status==='win'?1:0))**2)):null,clvs=items.map(b=>b.clv).filter(Number.isFinite),risk=riskMetrics(),exp=exposureMetrics();
  const sum=document.getElementById('calibrationSummary'),tables=document.getElementById('calibrationTables');if(!sum||!tables)return;
  sum.innerHTML=`<div class="summary"><div class="box">Liquidadas<br><b>${items.length}</b></div><div class="box">Brier global<br><b>${brier==null?'—':brier.toFixed(3)}</b></div><div class="box">ROI cash<br><b>${stake?(pnl/stake*100).toFixed(1):'0.0'}%</b></div><div class="box">CLV medio<br><b>${clvs.length?(avg(clvs)*100).toFixed(1)+'%':'—'}</b><br><span class="small">${clvs.length?((clvs.filter(x=>x>0).length/clvs.length)*100).toFixed(0)+'% positivo':'sin cierres'}</span></div></div>
  <div class="summary"><div class="box">Drawdown actual<br><b>${(risk.currentDD*100).toFixed(1)}%</b></div><div class="box">Drawdown máximo<br><b>${(risk.maxDD*100).toFixed(1)}%</b></div><div class="box">Profit Factor<br><b>${risk.pf==null?'—':risk.pf.toFixed(2)}</b></div><div class="box">Volatilidad/apuesta<br><b>${(risk.vol*100).toFixed(1)}%</b></div></div>
  <div class="summary"><div class="box">Racha máx W/L<br><b>${risk.maxW}/${risk.maxL}</b></div><div class="box">Racha actual<br><b>${risk.cur}</b></div><div class="box">Exposición<br><b>${money(exp.money)} · ${(exp.pct*100).toFixed(1)}%</b></div><div class="box">Abiertas / correladas<br><b>${exp.count} / ${exp.correlated}</b></div></div>`;
  const buckets=calibrationRows(decided,(b,p)=>probBucket(p)).sort((a,b)=>parseInt(a.k)-parseInt(b.k)),markets=calibrationRows(decided,b=>marketLabel(b.market)),leagues=calibrationRows(decided,b=>b.analysis?.league||'Sin liga'),modes=calibrationRows(decided,b=>b.analysis?.matchMode==='cup'?'Copa/Interliga':'Liga');
  const relMarkets=[...new Set(items.map(b=>b.market))].map(k=>({k:marketLabel(k),...marketReliabilityDetails(k)}));const clvGroup=(keyFn)=>{const m=new Map();items.filter(b=>Number.isFinite(b.clv)).forEach(b=>{const k=keyFn(b);if(!m.has(k))m.set(k,[]);m.get(k).push(b.clv)});return [...m.entries()].map(([k,a])=>({k,n:a.length,mean:avg(a),pos:a.filter(x=>x>0).length/a.length}))};const clvMarkets=clvGroup(b=>marketLabel(b.market)),clvLeagues=clvGroup(b=>b.analysis?.league||'Sin liga');const clvTable=(title,rows)=>`<div class="card calibration-sub"><h3>${title}</h3>${rows.length?`<div class="table-scroll"><table><tr><th>Grupo</th><th>N</th><th>CLV medio</th><th>CLV +</th></tr>${rows.map(x=>`<tr><td>${x.k}</td><td>${x.n}</td><td>${(x.mean*100).toFixed(1)}%</td><td>${(x.pos*100).toFixed(0)}%</td></tr>`).join('')}</table></div>`:'<p class="muted">Sin cuotas de cierre.</p>'}</div>`;
  tables.innerHTML=calibrationTable('🎯 Calibración de probabilidades',buckets)+calibrationTable('Por mercado',markets)+calibrationTable('Por liga',leagues.filter(x=>x.n>=5))+calibrationTable('Por modo',modes)+clvTable('📉 CLV por mercado',clvMarkets)+clvTable('📉 CLV por liga',clvLeagues)+`<div class="card calibration-sub"><h3>📚 Fiabilidad dinámica de mercado</h3><div class="table-scroll"><table><tr><th>Mercado</th><th>N</th><th>Score</th><th>Fuente</th><th>Multiplicador</th></tr>${relMarkets.map(x=>`<tr><td>${x.k}</td><td>${x.n}</td><td>${x.score.toFixed(0)}</td><td>${x.source}</td><td>${x.multiplier.toFixed(3)}</td></tr>`).join('')}</table></div><p class="small muted">N&lt;20 usa STATIC; después se mezcla progresivamente con HISTORICAL. ROI, Brier, calibración y CLV no se confunden entre sí.</p></div>`;
};

// Detalle financiero adicional en historial de apuestas.
const oldRenderBetHistory=window.renderBetHistory;
window.renderBetHistory=function(){oldRenderBetHistory();const risk=riskMetrics(),exp=exposureMetrics(),s=document.getElementById('betHistoryStats');if(s)s.insertAdjacentHTML('beforeend',`<div class="note" style="margin-top:10px"><b>Riesgo V2.5:</b> DD máx ${(risk.maxDD*100).toFixed(1)}% · Profit Factor ${risk.pf==null?'—':risk.pf.toFixed(2)} · Exposición ${money(exp.money)} (${(exp.pct*100).toFixed(1)}%) · ${exp.correlated?`⚠️ ${exp.correlated} partido(s) con riesgo correlacionado`:'Sin exposición correlacionada detectada'}</div>`);};

// --- Persistencia de campos nuevos y compatibilidad de backups ---
const oldCollect=window.collectFormState;
window.collectFormState=function(){const d=oldCollect();d.v2500={homeTeamStrength:num(document.getElementById('homeTeamStrengthLeague')?.value,50),awayTeamStrength:num(document.getElementById('awayTeamStrengthLeague')?.value,50),homeOppLast10:num(document.getElementById('homeOppLast10')?.value,50),homeOppLast5:num(document.getElementById('homeOppLast5')?.value,50),homeOppCondition:num(document.getElementById('homeOppCondition')?.value,50),awayOppLast10:num(document.getElementById('awayOppLast10')?.value,50),awayOppLast5:num(document.getElementById('awayOppLast5')?.value,50),awayOppCondition:num(document.getElementById('awayOppCondition')?.value,50),leagueHomeGoalsAvg:document.getElementById('leagueHomeGoalsAvg')?.value||'',leagueAwayGoalsAvg:document.getElementById('leagueAwayGoalsAvg')?.value||'',leagueHomeXgAvg:document.getElementById('leagueHomeXgAvg')?.value||'',leagueAwayXgAvg:document.getElementById('leagueAwayXgAvg')?.value||''};return d};
const oldRestore=window.restoreDraft;
window.restoreDraft=function(){oldRestore();try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null')?.v2500||{};for(const [id,k] of [['homeTeamStrengthLeague','homeTeamStrength'],['awayTeamStrengthLeague','awayTeamStrength'],['homeOppLast10','homeOppLast10'],['homeOppLast5','homeOppLast5'],['homeOppCondition','homeOppCondition'],['awayOppLast10','awayOppLast10'],['awayOppLast5','awayOppLast5'],['awayOppCondition','awayOppCondition'],['leagueHomeGoalsAvg','leagueHomeGoalsAvg'],['leagueAwayGoalsAvg','leagueAwayGoalsAvg'],['leagueHomeXgAvg','leagueHomeXgAvg'],['leagueAwayXgAvg','leagueAwayXgAvg']]){const el=document.getElementById(id);if(el&&d[k]!==undefined)el.value=d[k]}}catch(e){}};

// Enriquecer registros nuevos en saveDB antes de resetear formulario.
const oldSaveDB=window.saveDB;
window.saveDB=function(db){
  (db||[]).forEach(r=>{if(r?.diagnostics?.v2500&&!r.v2500){r.version='2.5.0';r.build=2500;r.v2500={weights:V2500.weights,teamStrength:{home:r.diagnostics.teamStrengthH,away:r.diagnostics.teamStrengthA},opposition:{home:r.diagnostics.oppH?.strength,away:r.diagnostics.oppA?.strength},leagueVenue:{home:r.diagnostics.homeVenue,away:r.diagnostics.awayVenue,source:r.diagnostics.venueSource,homeGoalsAvg:document.getElementById('leagueHomeGoalsAvg')?.value||'',awayGoalsAvg:document.getElementById('leagueAwayGoalsAvg')?.value||'',homeXgAvg:document.getElementById('leagueHomeXgAvg')?.value||'',awayXgAvg:document.getElementById('leagueAwayXgAvg')?.value||''}}}});oldSaveDB(db);
};

// Resultado: añade auditoría detallada sin borrar el render actual.
const oldRenderResult=window.renderResult;
window.renderResult=function(r){oldRenderResult(r);const d=r.diagnostics;if(!d?.v2500)return;const result=document.getElementById('result'),card=result?.querySelector('.result-capture-card');if(!card)return;const div=document.createElement('div');div.className='diag v2500-diagnostic';div.innerHTML=`<b>🧭 Trazabilidad V2.5 · build 2500</b><table><tr><th>Factor</th><th>Local</th><th>Visitante</th></tr>
<tr><td>Fuerza rivales ponderada</td><td>${d.oppH.strength.toFixed(1)}/100</td><td>${d.oppA.strength.toFixed(1)}/100</td></tr>
<tr><td>Ajuste oposición ataque</td><td>${pctFactor(d.oppH.attack)}</td><td>${pctFactor(d.oppA.attack)}</td></tr>
<tr><td>Ajuste oposición defensa</td><td>${pctFactor(d.oppH.defWeakness)}</td><td>${pctFactor(d.oppA.defWeakness)}</td></tr>
<tr><td>Confirmación tiros/SOT/ocasiones</td><td>${statusLabel(d.confirmFactorH)} · ${pctFactor(d.confirmFactorH)}</td><td>${statusLabel(d.confirmFactorA)} · ${pctFactor(d.confirmFactorA)}</td></tr>
<tr><td>Nivel equipo</td><td>${d.teamStrengthH.toFixed(0)}/100</td><td>${d.teamStrengthA.toFixed(0)}/100</td></tr>
<tr><td>Brecha estructural</td><td colspan="2">${d.interDiff>=0?'+':''}${d.interDiff.toFixed(1)} hacia Local · fuente ${d.levelSource}</td></tr>
<tr><td>Ajuste nivel</td><td>${pctFactor(d.levelFactorH)}</td><td>${pctFactor(d.levelFactorA)}</td></tr>
<tr><td>Localía competición</td><td>${pctFactor(d.homeVenue)}</td><td>${pctFactor(d.awayVenue)} · ${d.venueSource}</td></tr>
<tr><td>Tendencia</td><td>${d.trendH.label} · ${pctFactor(d.trendFactorH)}</td><td>${d.trendA.label} · ${pctFactor(d.trendFactorA)}</td></tr>
<tr><td>Bajas combinadas</td><td>${pctFactor(d.absenceComboH)}</td><td>${pctFactor(d.absenceComboA)}</td></tr>
<tr><td>Descanso</td><td>${pctFactor(d.restHF)}</td><td>${pctFactor(d.restAF)}</td></tr>
<tr><td><b>λ final</b></td><td><b>${Number(r.hl).toFixed(2)}</b></td><td><b>${Number(r.al).toFixed(2)}</b></td></tr></table>
<p class="small muted">Caps activos: oposición 0.90–1.10; confirmación 0.94–1.06; tendencia 0.97–1.03; Nivel Equipo Liga ±6%; estructura Copa hasta ±18% con castigo asimétrico al lado estructuralmente inferior.</p>`;const oldDiag=card.querySelector('.diag');if(oldDiag)oldDiag.after(div);else card.appendChild(div);
 // Enriquecer tabla de picks con de-vig mediante bloque compacto.
 const fairRows=(r.rows||[]).filter(x=>Number.isFinite(x.marketFairProb));if(fairRows.length){const f=document.createElement('div');f.className='note';f.style.marginTop='10px';f.innerHTML=`<b>🏷️ Mercado sin margen (de-vig)</b><div class="small" style="margin-top:5px">${fairRows.slice(0,12).map(x=>`${marketLabel(x.market)}: Modelo ${(x.p*100).toFixed(1)}% · Impl. ${(x.rawImplied*100).toFixed(1)}% · Fair ${(x.marketFairProb*100).toFixed(1)}% · Edge fair ${x.marketFairEdge>=0?'+':''}${(x.marketFairEdge*100).toFixed(1)} pp`).join('<br>')}</div>`;card.appendChild(f)}
 const general=(r.rows||[]).find(x=>x.topGeneral);if(general){const s=recommendedStake(general,true),st=card.querySelector('.stake-reco');if(st)st.innerHTML=`<b>💰 STAKE V2.5: ${stakeLabel(general,true)}</b><br><span>Kelly completo ${(s.fullKelly*100).toFixed(1)}% · Kelly 25% ${(s.fractionalKelly*100).toFixed(1)}% · ${s.reason}. Ser Top General no aumenta el stake por sí solo.</span>`}
};


// Cargar análisis antiguos/nuevos al formulario conservando defaults seguros.
const oldLoadRecord=window.loadRecordIntoForm;
if(typeof oldLoadRecord==='function')window.loadRecordIntoForm=function(id){oldLoadRecord(id);const r=loadDB().find(x=>String(x.id)===String(id));if(!r)return;const d=r.diagnostics||{},v=r.v2500||{};const set=(id,val)=>{const el=document.getElementById(id);if(el&&val!==undefined&&val!==null)el.value=val};set('homeTeamStrengthLeague',d.teamStrengthH??v.teamStrength?.home??r.homeTeamStrength??50);set('awayTeamStrengthLeague',d.teamStrengthA??v.teamStrength?.away??r.awayTeamStrength??50);set('homeOppLast10',r.teams?.home?.opposition?.last10??50);set('homeOppLast5',r.teams?.home?.opposition?.last5??50);set('homeOppCondition',r.teams?.home?.opposition?.condition5??50);set('awayOppLast10',r.teams?.away?.opposition?.last10??50);set('awayOppLast5',r.teams?.away?.opposition?.last5??50);set('awayOppCondition',r.teams?.away?.opposition?.condition5??50);set('leagueHomeGoalsAvg',v.leagueVenue?.homeGoalsAvg??'');set('leagueAwayGoalsAvg',v.leagueVenue?.awayGoalsAvg??'');set('leagueHomeXgAvg',v.leagueVenue?.homeXgAvg??'');set('leagueAwayXgAvg',v.leagueVenue?.awayXgAvg??'');queueDraftSave?.()};

// Export V2.5, import sigue siendo compatible con array legacy y objeto V2.0.
window.exportData=function(){const payload={format:'SoyJordan Picks Backup',version:'2.5.0',build:2500,exportedAt:new Date().toISOString(),analyses:loadDB(),bets:loadBets(),combos:loadCombos(),bank:loadBank(),params:V2500};const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='SoyJordan_Picks_V2_5_0_build2500_Backup.json';a.click();const msg=document.getElementById('dataMsg');if(msg)msg.textContent='Backup V2.5.0 build 2500 exportado.'};

function init(){injectFields();const bm=document.getElementById('buildMarker');if(bm)bm.textContent='build 2500';document.title='SoyJordan Picks V2.5.0';const brand=document.querySelector('.brand-copy .muted');if(brand)brand.textContent='V2.5.0 · Fuerza estructural · Calibración probabilística · Riesgo profesional';document.getElementById('openCalibration')?.addEventListener('click',()=>setTimeout(renderCalibration,0));setTimeout(()=>{renderCalibration();renderBetHistory();},0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
