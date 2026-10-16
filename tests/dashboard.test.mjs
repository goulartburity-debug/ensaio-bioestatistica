import test from 'node:test';import assert from 'node:assert/strict';
import {blank} from '../guide.mjs';
const events={},nodes=new Map(),classes=[];
const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',focus(){},classList:{add:c=>classes.push(c)}});return nodes.get(k);};
const storage=new Map([['ensaio-guide-v2',JSON.stringify({study:{...blank(),purpose:'assigned',response:'Pontuação',question:'<estudo>',factorCount:'one',factorA:'Método',levelsA:'3'}})]]);
globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
globalThis.document={querySelector:node,querySelectorAll:()=>[],addEventListener:(t,h)=>events[t]=h};globalThis.window={scrollTo(){}};
await import('../app.mjs');
const html=()=>node('#app').innerHTML;
const click=act=>events.click({target:{closest:q=>q==='[data-act]'?{dataset:{act}}:null}});
test('Resumo salvo é o primeiro elemento e fluxo mantém quatro ferramentas em ordem',()=>{
 assert.match(html(),/<main[^>]*><section class="dashboard-resume"/);assert.match(html(),/&lt;estudo&gt;/);
 assert.match(html(),/2 de 7/);assert.match(html(),/Ainda não definidas/);assert.match(html(),/Selecione a etapa da sua pesquisa/);
 const order=[...html().matchAll(/class="entry-card" data-act="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(order,['examples','new-plan','sample','analysis']);
 assert.ok(classes.includes('route-enter'));
});
test('Retomada abre a primeira pergunta pendente; selecionar não reinicia entrada de rota',()=>{
 click('resume-plan');assert.match(html(),/Quem recebe cada condição/);assert.match(html(),/3 de 7/);
 const before=classes.length;
 events.click({target:{closest:q=>q==='[data-choice]'?{dataset:{choice:'unitKind',value:'individual'}}:null}});
 assert.equal(classes.length,before);
});
