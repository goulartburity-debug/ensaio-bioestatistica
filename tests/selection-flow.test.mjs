import test from 'node:test';import assert from 'node:assert/strict';
import {createSampleModule} from '../sample-size/ui.mjs';import {blank} from '../guide.mjs';
import {analysisWizard} from '../analysis-ui.mjs';import {emptyAnalysis} from '../analysis.mjs';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};globalThis.document={querySelector:()=>null};
let html='';const m=createSampleModule({getPlan:blank,setPlan(){},navigate(){},render:()=>{html=m.render()}});
const click=(action,id)=>m.click({target:{closest:()=>({dataset:{act:'sample-'+action,id}})}});
test('Objetivo só é confirmado por Avançar; escolher card não troca de etapa',async()=>{
 await click('direct');assert.match(html,/data-act="sample-continue-category" disabled/);
 await click('continue-category');assert.doesNotMatch(html,/data-act="sample-method"/);
 await click('category','compare');assert.match(html,/class="choice selected" data-act="sample-category"/);assert.doesNotMatch(html,/data-act="sample-method"/);
 await click('continue-category');assert.match(html,/data-act="sample-method"/);assert.match(html,/data-act="sample-continue-method" disabled/);
});
test('Método marcado permanece visível até confirmação explícita e tem radio',async()=>{
 await click('continue-method');assert.doesNotMatch(html,/id="sample-form-title"/);
 await click('method','means');assert.match(html,/class="choice selected" data-act="sample-method" data-id="means" aria-pressed="true"><i class="radio"/);
 assert.doesNotMatch(html,/id="sample-form-title"/);await click('continue-method');assert.match(html,/id="sample-form-title"/);
});
test('Análises: continuar bloqueado antes da escolha',()=>{
 const s=emptyAnalysis();assert.match(analysisWizard(s,0),/data-act="analysis-next" disabled/);
 s.goal='compare';assert.doesNotMatch(analysisWizard(s,0),/data-act="analysis-next" disabled/);
});
