// SoyJordan Picks V2.0 · UI, combinadas flotantes y calibración histórica.
(function(){
  'use strict';

  const statusIcon=s=>s==='win'?'✅':s==='loss'?'❌':s==='push'?'🟡':'⏳';

  // -------- Navegación V2 --------
  const baseShow=show;
  show=function(id){
    ['analysis','history','betHistory','calibration','backup'].forEach(x=>document.getElementById(x)?.classList.toggle('hidden',x!==id));
    if(id==='history'){renderHistory();renderCombos();}
    if(id==='betHistory')renderBetHistory();
    if(id==='calibration')renderCalibration();
  };
  document.getElementById('openCalibration')?.addEventListener('click',()=>show('calibration'));

  // -------- Combinada flotante --------
  function addLegDirect(r,rowIndex){
    const x=r?.rows?.[rowIndex]; if(!r||!x)return;
    if(comboBuilder.some(l=>l.analysisId===r.id&&l.market===x.market))return alert('Ese pick ya está en la combinada.');
    comboBuilder.push({analysisId:r.id,rowIndex,date:r.date,home:r.home,away:r.away,market:x.market,label:marketLabel(x.market),odds:Number(x.odds),decision:x.dec,prob:Number(x.p),ev:Number(x.e),worstEV:Number(x.worstEV)});
    renderComboBuilder(); renderComboFloat();
  }
  window.addLegDirect=addLegDirect;

  function renderComboFloat(){
    const box=document.getElementById('comboFloat'),legs=document.getElementById('comboFloatLegs'),od=document.getElementById('comboFloatOdds');
    if(!box||!legs||!od)return;
    box.classList.toggle('hidden',comboBuilder.length===0);
    legs.innerHTML=comboBuilder.map((l,i)=>`<div class="combo-float-leg"><div><b>${l.label}</b><small>${l.home} vs ${l.away} · @${Number(l.odds).toFixed(2)}${l.decision?` · ${l.decision}`:''}</small></div><button type="button" class="dangerBtn" data-rm-leg="${i}">×</button></div>`).join('');
    od.textContent=comboOdds(comboBuilder).toFixed(2);
    legs.querySelectorAll('[data-rm-leg]').forEach(b=>b.addEventListener('click',()=>{removeComboLeg(Number(b.dataset.rmLeg));renderComboFloat();}));
  }
  const oldRenderComboBuilder=renderComboBuilder;
  renderComboBuilder=function(){oldRenderComboBuilder();renderComboFloat();};
  document.getElementById('comboFloatClose')?.addEventListener('click',()=>document.getElementById('comboFloat')?.classList.add('hidden'));
  document.getElementById('comboFloatOpenHistory')?.addEventListener('click',()=>show('history'));

  // Agrega botón + Combinada directamente a cada mercado visible del resultado.
  function decorateResult(r){
    const root=document.getElementById('result'); if(!root||!r?.rows)return;
    if((r.rows||[]).some(x=>x.dataOutlier)){const warn=document.createElement('div');warn.className='note outlier-warning';warn.innerHTML='<b>⚠️ DATO EXTREMO V2:</b> revisa los insumos del λ. La alerta limita el stake premium.';root.prepend(warn);}
    const trs=[...root.querySelectorAll('table tr')].slice(1);
    trs.forEach(tr=>{
      const td=tr.querySelector('td'); if(!td||td.querySelector('.add-combo-inline'))return;
      const txt=td.textContent.replace('⭐','').trim();
      const idx=r.rows.findIndex(x=>marketLabel(x.market)===txt || txt.startsWith(marketLabel(x.market)));
      if(idx<0)return;
      const b=document.createElement('button'); b.type='button'; b.className='secondary add-combo-inline'; b.textContent='+ Combinada';
      b.addEventListener('click',e=>{e.stopPropagation();addLegDirect(r,idx);}); td.appendChild(b);
    });
  }
  const oldRenderResult=renderResult;
  renderResult=function(r){oldRenderResult(r);decorateResult(r);};

  // Historial: selector modal simple, mostrando TODAS las cuotas >1.00, incluso <1.35.
  addToComboFromHistory=function(analysisId){
    const r=loadDB().find(x=>x.id===analysisId); if(!r)return;
    const rows=(r.rows||[]).map((x,i)=>({x,i})).filter(o=>Number(o.x.odds)>1);
    if(!rows.length)return alert('No hay mercados con cuota guardada.');
    const modal=document.createElement('div'); modal.className='modal';
    modal.innerHTML=`<div class="modal-backdrop"></div><div class="modal-sheet combo-picker"><div class="modal-head"><div><div class="eyebrow">COMBINADA V2</div><h2>${r.home} vs ${r.away}</h2></div><button class="icon-btn secondary" type="button">✕</button></div><div class="combo-picker-list">${rows.map(({x,i})=>`<button type="button" class="combo-pick-option" data-i="${i}"><span><b>${marketLabel(x.market)}</b><small>${x.dec||'—'} · P ${(Number(x.p)*100).toFixed(1)}% · EV ${(Number(x.e)*100).toFixed(1)}%</small></span><strong>@${Number(x.odds).toFixed(2)}</strong></button>`).join('')}</div></div>`;
    document.body.appendChild(modal);
    const close=()=>modal.remove(); modal.querySelector('.modal-backdrop').onclick=close; modal.querySelector('.icon-btn').onclick=close;
    modal.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{addLegDirect(r,Number(b.dataset.i));close();});
  };

  // -------- Estado por pata en combinadas --------
  const oldRenderCombos=renderCombos;
  renderCombos=function(){
    oldRenderCombos();
    document.querySelectorAll('#comboList .combo-card').forEach((card,ci)=>{
      const c=loadCombos()[ci]; if(!c)return;
      if(Array.isArray(c.legResults)){
        const summary=document.createElement('div'); summary.className='combo-leg-summary';
        const wins=c.legResults.filter(x=>x==='win').length, losses=c.legResults.filter(x=>x==='loss').length, pushes=c.legResults.filter(x=>x==='push').length;
        summary.innerHTML=`<b>Patas:</b> ${wins} ✅ · ${losses} ❌ · ${pushes} 🟡`;
        card.insertBefore(summary,card.querySelector('hr'));
      }
    });
    renderComboFloat();
  };

  // -------- Calibración histórica --------
  function bucketOdds(o){return o<1.50?'<1.50':o<1.80?'1.50–1.79':o<2.20?'1.80–2.19':o<3?'2.20–2.99':'3.00+';}
  function groupStats(items,keyFn){
    const m=new Map();
    items.forEach(b=>{const k=keyFn(b); if(!m.has(k))m.set(k,[]);m.get(k).push(b)});
    return [...m.entries()].map(([k,a])=>{const win=a.filter(x=>x.status==='win').length,loss=a.filter(x=>x.status==='loss').length,push=a.filter(x=>x.status==='push').length,stake=a.filter(x=>!isFreeBet(x)).reduce((s,x)=>s+(Number(x.stake)||0),0),pnl=a.filter(x=>!isFreeBet(x)).reduce((s,x)=>s+(Number(x.pnl)||0),0);return {k,n:a.length,win,loss,push,hit:(win+loss)?win/(win+loss)*100:0,roi:stake?pnl/stake*100:0};}).sort((a,b)=>b.n-a.n);
  }
  function statsTable(title,rows){return `<div class="cal-block"><h3>${title}</h3><div class="table-scroll"><table><tr><th>Grupo</th><th>N</th><th>W</th><th>L</th><th>Push</th><th>Acierto</th><th>ROI</th></tr>${rows.map(x=>`<tr><td><b>${x.k}</b></td><td>${x.n}</td><td>${x.win}</td><td>${x.loss}</td><td>${x.push}</td><td>${x.hit.toFixed(1)}%</td><td class="${x.roi>=0?'money-positive':'money-negative'}">${x.roi.toFixed(1)}%</td></tr>`).join('')}</table></div></div>`;}
  function renderCalibration(){
    const bets=loadBets().filter(x=>x.status!=='pending'); const cash=bets.filter(x=>!isFreeBet(x));
    const stake=cash.reduce((s,x)=>s+(Number(x.stake)||0),0),pnl=cash.reduce((s,x)=>s+(Number(x.pnl)||0),0),wins=bets.filter(x=>x.status==='win').length,loss=bets.filter(x=>x.status==='loss').length;
    const sum=document.getElementById('calibrationSummary'),tables=document.getElementById('calibrationTables'); if(!sum||!tables)return;
    sum.innerHTML=`<div class="summary"><div class="box">Liquidadas<br><b>${bets.length}</b></div><div class="box">Acierto<br><b>${wins+loss?(wins/(wins+loss)*100).toFixed(1):'0.0'}%</b></div><div class="box">ROI cash<br><b>${stake?(pnl/stake*100).toFixed(1):'0.0'}%</b></div><div class="box">P/L cash<br><b>${money(pnl)}</b></div></div>`;
    tables.innerHTML=statsTable('Por mercado',groupStats(bets,b=>marketLabel(b.market)))+statsTable('Por cuota',groupStats(bets,b=>bucketOdds(Number(b.odds)||0)))+statsTable('Por decisión prepartido',groupStats(bets,b=>b.preMatchSnapshot?.decision||'Sin dato'))+statsTable('Por stake (u)',groupStats(bets,b=>b.units!=null?`${Math.round(Number(b.units))}u`:'Sin dato'));
  }
  window.renderCalibration=renderCalibration;

  // Mejora visual de estado en combinadas después de liquidar por auditoría o manual.
  const oldSettleCombo=settleCombo;
  settleCombo=function(id){oldSettleCombo(id);renderCombos();renderBetHistory();};

  document.addEventListener('DOMContentLoaded',()=>{renderComboFloat();});
})();
