import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nettoOppervlakte, offerteTotaal, scopeOverzicht, werkvolgorde} from '../docs/lib/rekenregels.mjs';
test('area preserves centimeter inputs and subtracts openings', () => {
  assert.deepEqual(nettoOppervlakte({vlakken:[{lengte:'4,25',hoogte:'2,60'}],openingen:[{lengte:'0.90',hoogte:'2.10'}]}), {brutoM2:11.05,openingenM2:1.89,nettoM2:9.16});
});
test('invalid dimensions cannot produce plausible quantities', () => {
  for (const lengte of ['-1','1.000,00','NaN','1.001','Infinity',null]) assert.throws(() => nettoOppervlakte({vlakken:[{lengte,hoogte:2}]}));
  assert.throws(() => nettoOppervlakte({vlakken:[{lengte:1,hoogte:1}],openingen:[{lengte:2,hoogte:2}]}));
});
test('VAT uses user supplied per-line rates and integer cents', () => {
  const r=offerteTotaal({regels:[{omschrijving:'A',netto:'100',btwPercentage:'9'},{omschrijving:'B',netto:'100',btwPercentage:'21'}]});
  assert.equal(r.nettoCent,20000);assert.equal(r.btwCent,3000);assert.equal(r.brutoCent,23000);
});
test('half cent rounds up, missing rate is never guessed', () => {
  assert.equal(offerteTotaal({regels:[{omschrijving:'A',netto:'0.05',btwPercentage:'10'}]}).btwCent,1);
  for(const row of [{netto:'1.005',btwPercentage:21},{netto:100},{netto:100,btwPercentage:101},{netto:'.05',btwPercentage:10}]) assert.throws(()=>offerteTotaal({regels:[{omschrijving:'A',...row}]}));
});
test('scope keeps exclusions and unresolved tasks separate',()=>{
  const r=scopeOverzicht({taken:[{ruimte:'Keuken',taak:'Vloer',status:'inbegrepen'},{ruimte:'Keuken',taak:'Oven',status:'bespreken'},{ruimte:'Hal',taak:'Puin',status:'uitgesloten'}]});
  assert.deepEqual(Object.values(r).map(x=>x.length),[1,1,1]);
  assert.throws(()=>scopeOverzicht({taken:[{ruimte:'Hal',taak:'Vloer',status:'klaar'}]}));
  assert.throws(()=>scopeOverzicht({taken:[{ruimte:'Hal',taak:'Vloer',status:'inbegrepen'},{ruimte:'hal',taak:'vloer',status:'bespreken'}]}));
});
test('dependency order satisfies user supplied relations',()=>{
  const r=werkvolgorde({stappen:[{id:'Controle',na:['Werk']},{id:'Werk',na:['Afspraak']},{id:'Afspraak',na:[]}]});
  assert.deepEqual(r.volgorde,['Afspraak','Werk','Controle']);
});
test('dependency mistakes are rejected instead of silently omitted',()=>{
  for(const stappen of [[{id:'A',na:['B']}],[{id:'A',na:['A']}],[{id:'A',na:['B']},{id:'B',na:['A']}],[{id:'A'},{id:'A'}]])assert.throws(()=>werkvolgorde({stappen}));
});
