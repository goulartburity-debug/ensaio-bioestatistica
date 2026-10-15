import test from 'node:test';
import assert from 'node:assert/strict';
import {createSampleModule} from '../sample-size/ui.mjs';
import {calculate} from '../sample-size/engine.mjs';
import {blank} from '../guide.mjs';
import {defaults,VERSION} from '../sample-size/methods.mjs';

const storage=new Map(),nodes=new Map();let confirmed=false;
globalThis.localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
globalThis.document={querySelector:key=>{
 if(key==='#sample-confirm')return {checked:confirmed};
 if(!nodes.has(key))nodes.set(key,{innerHTML:'',focus(){},scrollIntoView(){}});
 return nodes.get(key);
}};
function harness(options={}){
 let html='',p={...blank(),purpose:'assigned',response:'Altura',unitKind:'individual',unit:'vaso',factorCount:'one',levelsA:'4',environment:'similar',measurement:'once',replicates:'4'};
 const app=createSampleModule({getPlan:()=>p,setPlan:value=>{p=value;},render:()=>{html=app.render();},navigate:()=>{html=app.render();},...options});
 return {app,html:()=>html||app.render(),plan:()=>p,setPlan:value=>{p=value;},click:(act,id)=>app.click({target:{closest:()=>({dataset:{act:'sample-'+act,id}})}}),input:(key,value,tagName='INPUT')=>app.input({target:{dataset:{sample:key},value,tagName}})};
}

test('Escolha pelo objetivo expõe Dunnett, Tukey e contraste sem voltar a mostrar texto pronto',async()=>{
 storage.clear();const h=harness();await h.click('direct');await h.click('category','compare');
 assert.match(h.html(),/testemunha \(Dunnett\)/);assert.match(h.html(),/tratamentos \(Tukey\)/);assert.match(h.html(),/comparação específica/);
 await h.click('method','dunnett');assert.match(h.html(),/contando a testemunha/);
 assert.match(h.html(),/O poder será calculado por comparação/);
 assert.doesNotMatch(h.html(),/sample-summary|sample-copy|TAMANHO-AMOSTRAL\.md|<aside/);
 assert.match(h.html(),/data-sample="delta"[^>]*value=""/);
 assert.doesNotMatch(h.html(),/<details[^>]* open/);
});

test('Resultado apresenta quantidade, poder marginal e cenários sob demanda sem alterar o plano',async()=>{
 storage.clear();const h=harness();await h.click('method','dunnett');await h.click('example');await h.click('calculate');
 assert.match(h.html(),/53 por tratamento/);assert.match(h.html(),/212 unidades experimentais/);
 assert.match(h.html(),/Não é a probabilidade de detectar todas/);assert.match(h.html(),/Comparar estes cenários/);
 assert.equal(h.plan().replicates,'4');
 await h.click('scenarios');assert.match(h.html(),/Diferença/);assert.match(h.html(),/Total de unidades/);
 assert.doesNotMatch(h.html(),/Comparar estes cenários/);
 await h.click('preview');confirmed=true;await h.click('apply');
 assert.equal(h.plan().replicates,'53');
 const record=JSON.parse(storage.get('ensaio-sample-applied-v1'));assert.equal(record.version,VERSION);assert.equal(record.method,'dunnett');assert.ok(record.params['GL do resíduo']);
});

test('Diferença percentual exige referência e não mantém um campo absoluto concorrente',async()=>{
 storage.clear();const h=harness();await h.click('method','tukey');await h.click('example');
 h.input('differenceMode','percent','SELECT');
 assert.doesNotMatch(h.html(),/data-sample="delta"/);
 assert.match(h.html(),/data-sample="referenceMean"/);assert.match(h.html(),/não é margem de erro/);
 h.input('referenceMean','20');h.input('deltaPercent','25');await h.click('calculate');
 assert.match(h.html(),/61 por tratamento/);
 h.input('referenceMean','');await h.click('calculate');assert.match(h.html(),/média de referência/);
 assert.doesNotMatch(h.html(),/61 por tratamento/);
});

test('Modelo em blocos e mínimo de GL permanecem visíveis quando escolhidos',async()=>{
 storage.clear();const h=harness();await h.click('method','contrast');await h.click('example');
 h.input('design','blocks','SELECT');h.input('minResidualDf','15');h.input('loss','10');await h.click('calculate');
 assert.match(h.html(),/mínimo adicional de GL: 15/);
 assert.match(h.html(),/Desvio-padrão residual após considerar os blocos/);
 assert.match(h.html(),/blocos completos/);assert.match(h.html(),/GL do resíduo/);
 assert.doesNotMatch(h.html(),/estabilidade garantida|mínimo obrigatório|reprova o artigo/);
});

test('Respostas antigas de 1.0.0 são preservadas, mas um resultado antigo não é reutilizado',async()=>{
 storage.clear();storage.set('ensaio-sample-v1',JSON.stringify({version:'1.0.0',inputs:{...defaults(),method:'means',delta:'7',sd1:'8',sd2:'8'}}));
 const h=harness();assert.match(h.html(),/valores anteriores estão salvos/);assert.match(h.html(),/Recalcule/);
 assert.doesNotMatch(h.html(),/aria-label="Resultado do tamanho amostral"/);
 await h.click('resume');assert.match(h.html(),/data-sample="delta"[^>]*value="7"/);
 assert.doesNotMatch(h.html(),/aria-label="Resultado do tamanho amostral"/);
});

test('Editar enquanto calcula descarta a resposta antiga e reabilita o formulário',async()=>{
 storage.clear();let finish;
 const h=harness({compute:inputs=>new Promise(resolve=>{finish=()=>resolve(calculate(inputs));})});
 await h.click('method','dunnett');await h.click('example');
 const pending=h.click('calculate');assert.match(h.html(),/Calculando…/);assert.match(h.html(),/disabled aria-busy="true"/);
 h.input('delta','6');assert.doesNotMatch(h.html(),/disabled aria-busy/);
 finish();await pending;assert.doesNotMatch(h.html(),/53 por tratamento|aria-label="Resultado do tamanho amostral"/);
});

test('Plano alterado durante o trabalho numérico bloqueia aplicação do resultado',async()=>{
 storage.clear();let finish;
 const h=harness({compute:inputs=>new Promise(resolve=>{finish=()=>resolve(calculate(inputs));})});
 await h.click('method','dunnett');await h.click('example');const pending=h.click('calculate');
 h.setPlan({...h.plan(),replicates:'9'});finish();await pending;
 assert.match(h.html(),/O planejamento mudou desde o cálculo/);
 assert.doesNotMatch(h.html(),/Revisar o que será atualizado/);
});
