import test from 'node:test';import assert from 'node:assert/strict';import {blank} from '../guide.mjs';
const storage=new Map([['ensaio-guide-v2',JSON.stringify({study:{...blank(),response:'Pontuação',question:'Meu ensaio'}})],['ensaio-sample-applied-v1','registro'],['ensaio-analysis-v1','{}']]);
const events={},nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',focus(){},classList:{add(){}}});return nodes.get(k)};
globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
globalThis.document={querySelector:node,querySelectorAll:()=>[],addEventListener:(t,h)=>events[t]=h};globalThis.window={scrollTo(){}};
await import('../app.mjs');const html=()=>node('#app').innerHTML;const click=act=>events.click({target:{closest:q=>q==='[data-act]'?{dataset:{act}}:null}});
test('Cabeçalho único tem logo e sete destinos; não há barra lateral',()=>{
 assert.match(html(),/<header class="app-header">/);assert.match(html(),/class="header-logo"/);assert.doesNotMatch(html(),/class="sidebar"|class="mobile-nav"|toggle-menu|Revisar planejamento/);
 assert.equal((html().match(/aria-current="page"/g)||[]).length,1);assert.match(html(),/Esquecer estes dados/);
});
test('Excluir pede confirmação e cancelar preserva planejamento e registro aplicado',()=>{
 const before=storage.get('ensaio-guide-v2');click('clear-plan');assert.match(html(),/Esquecer estes dados\?/);assert.equal(storage.get('ensaio-guide-v2'),before);click('cancel');assert.equal(storage.get('ensaio-guide-v2'),before);assert.equal(storage.get('ensaio-sample-applied-v1'),'registro');
});
test('Confirmar exclusão limpa só o planejamento e seu registro de aplicação',()=>{
 click('clear-plan');click('confirm');assert.doesNotMatch(html(),/class="dashboard-resume"/);assert.equal(storage.has('ensaio-sample-applied-v1'),false);assert.equal(storage.get('ensaio-analysis-v1'),'{}');assert.ok(Object.values(JSON.parse(storage.get('ensaio-guide-v2')).study).every(v=>!v));
 assert.match(html(),/class="welcome-baseline"/);assert.match(html(),/class="welcome-graphic"/);
});
