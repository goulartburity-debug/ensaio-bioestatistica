import test from 'node:test';
import assert from 'node:assert/strict';
import {createSampleModule} from '../sample-size/ui.mjs';
import {calculate} from '../sample-size/engine.mjs';
import {defaults,methods,VERSION} from '../sample-size/methods.mjs';
import {examples,guidance} from '../sample-size/guidance.mjs';
import {blank} from '../guide.mjs';

const store=new Map(),nodes=new Map();
globalThis.localStorage={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)};
globalThis.document={querySelector:key=>{
 if(!nodes.has(key))nodes.set(key,{innerHTML:'',focus(){},scrollIntoView(){}});
 return nodes.get(key);
}};
function harness(){
 let html='',plan=blank();
 const app=createSampleModule({getPlan:()=>plan,setPlan:value=>{plan=value;},render:()=>{html=app.render();},navigate:()=>{html=app.render();}});
 return {
  app,html:()=>html||app.render(),plan:()=>plan,
  click:(act,id)=>app.click({target:{closest:()=>({dataset:{act:'sample-'+act,id}})}}),
  input:(key,value,tagName='INPUT')=>app.input({target:{dataset:{sample:key},value,tagName}})
 };
}

test('Formulário e resultado não oferecem quadro lateral, link de métodos ou texto pronto',async()=>{
 store.clear();const h=harness();await h.click('method','means');
 assert.doesNotMatch(h.html(),/<aside|sample-layout|sample-summary|sample-copy|TAMANHO-AMOSTRAL\.md/);
 assert.doesNotMatch(h.html(),/Resposta contínua, erros normais|Carregar exemplo fictício \(substitui/);
 await h.click('example');await h.click('calculate');
 assert.match(h.html(),/41 grupo 1/);assert.match(h.html(),/Total: 82 unidades/);
 assert.doesNotMatch(h.html(),/sample-summary|sample-copy|Resumo para registrar|TAMANHO-AMOSTRAL\.md/);
 assert.match(h.html(),/https:\/\/www\.openepi\.com\/SampleSize\/SSMean\.htm/);
});

test('Ajustes ficam recolhidos e valores atuais são explícitos, inclusive após edição',async()=>{
 store.clear();const h=harness();await h.click('method','means');
 assert.match(h.html(),/Poder: 80% · Significância: 5% · Perdas: 0%/);
 assert.match(h.html(),/<details class="sample-details" data-help-id="sample-settings-means">/);
 assert.doesNotMatch(h.html(),/<details[^>]*\sopen(?:\s|>)/);
 h.input('power','90');h.input('loss','10');
 assert.match(nodes.get('#sample-settings-live').innerHTML,/Poder: 90%.*Perdas: 10%/);
 h.input('ratio','2');h.input('sides','greater','SELECT');
 assert.match(h.html(),/alocação 2:1/);assert.match(h.html(),/hipótese unilateral/);
});

test('Nenhum efeito ou variabilidade é presumido; 50% exige ação e preserva os outros campos',async()=>{
 store.clear();const h=harness();await h.click('method','proportion');
 assert.match(h.html(),/data-sample="p"[^>]*value=""/);
 assert.doesNotMatch(h.html(),/data-sample="p"[^>]*value="50"/);
 h.input('margin','3,5');await h.click('conservative');
 assert.match(h.html(),/data-sample="p"[^>]*value="50"/);
 assert.match(h.html(),/data-sample="margin"[^>]*value="3,5"/);
 assert.match(h.html(),/não uma estimativa da sua população/);
});

for(const id of Object.keys(methods)){
 test(`Rota ${id}: exemplo continua calculável e ajuda corresponde à unidade`,async()=>{
  store.clear();const h=harness();await h.click('method',id);
  assert.match(h.html(),/Como conseguir os valores pedidos/);
  assert.ok(h.html().includes(guidance[id].idea));
  await h.click('example');await h.click('calculate');
  const expected=calculate({...defaults(),method:id,...examples[id]});
  assert.match(h.html(),/aria-label="Resultado do tamanho amostral"/);
  assert.ok(h.html().includes(new Intl.NumberFormat('pt-BR').format(expected.units[0].n)));
  assert.equal(h.plan().replicates,'');
 });
}

test('DBC exibe blocos analisáveis e iniciais; não atribui redução automática ao bloqueamento',async()=>{
 store.clear();const h=harness();await h.click('method','blocks');await h.click('example');h.input('loss','10');await h.click('calculate');
 assert.match(h.html(),/14 blocos completos/);assert.match(h.html(),/16 blocos completos/);
 assert.match(h.html(),/42 unidades experimentais/);assert.match(h.html(),/48 unidades no total/);
 assert.match(h.html(),/escolher blocos não reduz a amostra automaticamente/);
});

test('Conglomerados distinguem conjuntos e observações e informam todos os parâmetros do exemplo',async()=>{
 store.clear();const h=harness();await h.click('method','cluster');await h.click('example');await h.click('calculate');
 assert.match(h.html(),/38 conglomerados/);assert.match(h.html(),/760 observações vinculadas/);
 assert.match(h.html(),/margem de 5 pontos, confiança de 95%/);
 assert.match(h.html(),/não compara tratamentos/);
});

test('Rotas alternativas preservam efeito padronizado, correlação intrapar e população finita',async()=>{
 store.clear();const h=harness();await h.click('method','paired');h.input('scale','standard','SELECT');h.input('d','0,5');await h.click('calculate');
 assert.match(h.html(),/34 pares completos/);
 h.input('scale','real','SELECT');h.input('pairScale','correlation','SELECT');
 h.input('delta','5');h.input('sd1','8');h.input('sd2','8');h.input('rho','0,5');await h.click('calculate');
 assert.match(h.html(),/23 pares completos/);
 await h.click('method','proportion');await h.click('example');h.input('population','finite','SELECT');h.input('populationN','1000');await h.click('calculate');
 assert.match(h.html(),/278 unidades na amostra/);assert.match(h.html(),/população finita: 1000/);
});

test('A versão do motor e resultados não são modificados pela revisão de interface',()=>{
 assert.equal(VERSION,'1.0.0');
 assert.equal(calculate({...defaults(),method:'proportion',...examples.proportion}).n,385);
 assert.equal(calculate({...defaults(),method:'anova',...examples.anova}).n,50);
 assert.equal(calculate({...defaults(),method:'blocks',...examples.blocks}).n,14);
});
