import test from 'node:test';
import assert from 'node:assert/strict';
import {createSampleModule} from '../sample-size/ui.mjs';
import {blank} from '../guide.mjs';
import {defaults} from '../sample-size/methods.mjs';
const store=new Map();let confirmed=false;
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
globalThis.document={querySelector:q=>q==='#sample-confirm'?{checked:confirmed}:{innerHTML:'',focus(){},scrollIntoView(){}}};
function harness(changes={}){
 let p={...blank(),purpose:'assigned',response:'Altura',unitKind:'individual',unit:'vaso',factorCount:'one',levelsA:'3',environment:'blocks',complete:'yes',blockCount:'4',replicates:'2',measurement:'once',...changes};
 const app=createSampleModule({getPlan:()=>p,setPlan:x=>p=x,render(){},navigate(){}});
 return {app,html:()=>app.render(),plan:()=>p,click:(act,id)=>app.click({target:{closest:()=>({dataset:{act:'sample-'+act,id}})}}),input:(k,v,tag='INPUT')=>app.input({target:{dataset:{sample:k},value:v,tagName:tag}})};
}
test('Estruturas aparecem pelo objetivo e mantêm ajuda recolhida e sem texto pronto',async()=>{
 store.clear();const h=harness();await h.click('direct');await h.click('category','structured');assert.match(h.html(),/parcelas subdivididas/);assert.match(h.html(),/Várias unidades/);
 await h.click('method','splitplot');h.input('effect','A','SELECT');assert.match(h.html(),/data-sample="sdWhole"[^>]*value=""/);assert.doesNotMatch(h.html(),/<details[^>]* open|<aside|sample-summary|sample-copy|TAMANHO-AMOSTRAL\.md/);
});
test('Campo de parcela aparece somente para A; escala de médias tem seu próprio campo',async()=>{
 store.clear();const h=harness();await h.click('method','splitplot');await h.click('example');h.input('effect','B','SELECT');assert.doesNotMatch(h.html(),/data-sample="sdWhole"/);assert.match(h.html(),/Por isso não pedimos σW/);
 await h.click('calculate');assert.match(h.html(),/5 blocos completos/);assert.match(h.html(),/10 parcelas principais e 30 subparcelas/);
 h.input('effect','A','SELECT');h.input('splitVarianceMode','means','SELECT');assert.match(h.html(),/data-sample="sdWholeMean"/);assert.doesNotMatch(h.html(),/data-sample="sdWhole"/);
 h.input('sdWholeMean','1');await h.click('calculate');assert.match(h.html(),/DP das médias de parcelas é incompatível/);
});
test('Resultado de parcelas separa níveis iniciais e impede aplicar total como repetições',async()=>{
 store.clear();const h=harness();await h.click('method','splitplot');await h.click('example');h.input('loss','10');await h.click('calculate');
 assert.match(h.html(),/17 blocos completos/);assert.match(h.html(),/34 parcelas principais e 102 subparcelas/);assert.match(h.html(),/38 parcelas principais e 114 subparcelas/);
 assert.match(h.html(),/não registra os dois níveis/);assert.doesNotMatch(h.html(),/Revisar o que será atualizado/);assert.equal(h.plan().blockCount,'4');
});
test('Subamostras fecham o formulário de repetições e não geram resultado',async()=>{
 store.clear();const h=harness();await h.click('method','replicatedBlocks');h.input('cellKind','subsamples','SELECT');assert.match(h.html(),/Não conte os indivíduos internos como repetições/);assert.doesNotMatch(h.html(),/data-sample="unitsPerCell"|data-act="sample-calculate"|data-sample="power"/);
 await h.click('calculate');assert.match(h.html(),/são subamostras/);assert.doesNotMatch(h.html(),/aria-label="Resultado do tamanho amostral"/);
});
test('Modelo com interação pede componente próprio e resultado mantém os blocos',async()=>{
 store.clear();const h=harness();await h.click('method','replicatedBlocks');await h.click('example');assert.doesNotMatch(h.html(),/data-sample="sdCell"/);
 h.input('blockModel','interaction','SELECT');assert.match(h.html(),/data-sample="sdCell"[^>]*value=""/);h.input('sdCell','2');await h.click('calculate');assert.match(h.html(),/11 blocos completos/);assert.match(h.html(),/66 unidades experimentais/);
 await h.click('preview');assert.match(h.html(),/Unidades tratadas separadamente/);assert.equal(h.plan().blockCount,'4');confirmed=true;await h.click('apply');assert.equal(h.plan().blockCount,'11');assert.equal(h.plan().replicates,'2');
});
test('Parâmetros 1.1.0 são recuperados sem restaurar resultados antigos',async()=>{
 store.clear();store.set('ensaio-sample-v1',JSON.stringify({version:'1.1.0',inputs:{...defaults(),method:'dunnett',groups:'4',delta:'5',sd:'8'}}));
 const h=harness();assert.match(h.html(),/valores anteriores/);await h.click('resume');assert.match(h.html(),/value="5"/);assert.doesNotMatch(h.html(),/aria-label="Resultado do tamanho amostral"/);
});
