import test from 'node:test';import assert from 'node:assert/strict';
import {createSampleModule} from '../sample-size/ui.mjs';import {blank} from '../guide.mjs';import {defaults} from '../sample-size/methods.mjs';
const store=new Map();let confirmed=false;
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
globalThis.document={querySelector:q=>q==='#sample-confirm'?{checked:confirmed}:{innerHTML:'',focus(){},scrollIntoView(){}}};
function harness(patch={}){
 let p={...blank(),purpose:'assigned',response:'Altura',factorCount:'one',levelsA:'2',unitKind:'individual',unit:'vaso',environment:'similar',measurement:'time',times:'3',replicates:'4',...patch};
 const app=createSampleModule({getPlan:()=>p,setPlan:v=>p=v,render(){},navigate(){}});
 return {app,html:()=>app.render(),plan:()=>p,click:(act,id)=>app.click({target:{closest:()=>({dataset:{act:'sample-'+act,id}})}}),input:(key,value,tagName='INPUT')=>app.input({target:{dataset:{sample:key},value,tagName}})};
}
test('Duas novas rotas aparecem por objetivo, sem campos científicos preenchidos silenciosamente',async()=>{
 store.clear();const h=harness();await h.click('direct');await h.click('category','structured');await h.click('continue-category');assert.match(h.html(),/mesmas unidades em várias datas/);assert.match(h.html(),/tratamento aplicado ao conjunto/);
 await h.click('method','repeated');await h.click('continue-method');assert.match(h.html(),/data-sample="rho"[^>]*value=""/);assert.match(h.html(),/data-sample="sd"[^>]*value=""/);assert.doesNotMatch(h.html(),/<details[^>]* open|sample-summary|sample-copy|TAMANHO-AMOSTRAL\.md|<aside/);
});
test('Um grupo não oferece interação, e AR1 só oferece contraste',async()=>{
 store.clear();const h=harness();await h.click('method','repeated');await h.click('continue-method');await h.click('example');h.input('rmGroups','1','SELECT');assert.doesNotMatch(h.html(),/<option value="interaction"|<option value="group"/);
 h.input('rmCovariance','ar1','SELECT');assert.match(h.html(),/data-sample="rmContrast"/);assert.doesNotMatch(h.html(),/<option value="time"/);
 h.input('rmContrast','custom','SELECT');assert.match(h.html(),/data-sample="rmWeights"/);
});
test('Covariância desconhecida encerra as perguntas numéricas e não oferece cálculo',async()=>{
 store.clear();const h=harness();await h.click('method','repeated');await h.click('continue-method');h.input('rmCovariance','other','SELECT');assert.match(h.html(),/Precisamos de uma estrutura de covariância/);assert.doesNotMatch(h.html(),/data-act="sample-calculate"|data-sample="power"|data-sample="rho"/);
});
test('Resultado de acompanhamento distingue unidades e registros e aplica apenas após confirmar',async()=>{
 store.clear();const h=harness();await h.click('method','repeated');await h.click('continue-method');await h.click('example');h.input('loss','10');await h.click('calculate');assert.match(h.html(),/17 unidades por grupo/);assert.match(h.html(),/34 unidades acompanhadas/);assert.match(h.html(),/102 registros vinculados/);assert.match(h.html(),/38 unidades acompanhadas e 114 registros/);assert.equal(h.plan().replicates,'4');
 await h.click('preview');assert.match(h.html(),/Unidades acompanhadas por tratamento/);confirmed=true;await h.click('apply');assert.equal(h.plan().replicates,'19');assert.equal(h.plan().times,'3');
});
test('Conjuntos têm perdas internas e externas separadas e não viram indivíduos independentes',async()=>{
 store.clear();const h=harness({unitKind:'group',unit:'gaiola',measurement:'sub',observations:'10',times:''});await h.click('method','clusterTrial');await h.click('continue-method');await h.click('example');assert.match(h.html(),/data-sample="delta"/);assert.doesNotMatch(h.html(),/data-sample="means"/);
 h.input('loss','10');h.input('withinLoss','20');await h.click('calculate');assert.match(h.html(),/7 conjuntos por tratamento/);assert.match(h.html(),/14 conjuntos/);assert.match(h.html(),/140 observações vinculadas/);assert.match(h.html(),/16 conjuntos no total, com 13 indivíduos/);assert.match(h.html(),/208 observações previstas/);
 await h.click('preview');assert.match(h.html(),/Indivíduos iniciais dentro de cada conjunto/);confirmed=true;await h.click('apply');assert.equal(h.plan().replicates,'8');assert.equal(h.plan().observations,'13');
});
test('Mais grupos pedem médias; aplicação individual não oferece cálculo de conjunto',async()=>{
 store.clear();const h=harness();await h.click('method','clusterTrial');await h.click('continue-method');await h.click('example');h.input('groups','3','SELECT');assert.match(h.html(),/data-sample="means"/);assert.doesNotMatch(h.html(),/data-sample="delta"/);
 h.input('clusterAllocation','individual','SELECT');assert.match(h.html(),/A unidade de aplicação é outra/);assert.doesNotMatch(h.html(),/data-act="sample-calculate"|data-sample="icc"/);
});
test('Planejamento é aproveitado com prévia, sem presumir covariância ou ICC',async()=>{
 store.clear();const h=harness();await h.click('plan');assert.match(h.html(),/2 grupos e 3 datas foram copiados/);await h.click('seed');assert.match(h.html(),/mesmas unidades em várias datas/);assert.match(h.html(),/data-sample="rho"[^>]*value=""/);
 const q=harness({unitKind:'group',unit:'gaiola',measurement:'sub',observations:'10',times:''});await q.click('plan');assert.match(q.html(),/2 tratamentos e 10 observações/);await q.click('seed');assert.match(q.html(),/data-sample="icc"[^>]*value=""/);
});
test('Valores 1.2.0 são recuperáveis sem reutilizar resultado antigo',async()=>{
 store.clear();store.set('ensaio-sample-v1',JSON.stringify({version:'1.2.0',inputs:{...defaults(),method:'splitplot',a:'2',b:'3',sdSub:'4'}}));const h=harness();assert.match(h.html(),/valores anteriores/);await h.click('resume');assert.match(h.html(),/data-sample="sdSub"[^>]*value="4"/);assert.doesNotMatch(h.html(),/aria-label="Resultado do tamanho amostral"/);
});
