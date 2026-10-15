import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate} from '../sample-size/engine.mjs';
import {defaults,VERSION} from '../sample-size/methods.mjs';
import {examples} from '../sample-size/guidance.mjs';
import {blank} from '../guide.mjs';
import {fromPlan,fingerprint,transferProposal,applyProposal} from '../sample-size/integration.mjs';
const reference=JSON.parse(fs.readFileSync(new URL('./structured-reference.json',import.meta.url)));
const calc=s=>calculate({...defaults(),...s});
const split=changes=>calc({method:'splitplot',...examples.splitplot,...changes});
const reps=changes=>calc({method:'replicatedBlocks',...examples.replicatedBlocks,...changes});
for(const c of reference.fixtures)test('Reference SciPy: '+c.name,()=>{
 const r=calc(c.inputs);assert.equal(r.n,c.n);assert.equal(r.total,c.total);assert.equal(r.blocks,c.n);assert.equal(r.initialUnits[0].n,c.initial);assert.equal(r.initialTotal,c.initialTotal);
 assert.equal(r.dfNumerator,c.df1);assert.equal(r.dfResidual,c.df2);
 assert.ok(Math.abs(r.params['Não centralidade λ do teste F']-c.ncp)<1e-8);
 assert.ok(Math.abs(r.power-c.power)<2e-7,`${r.power} vs ${c.power}`);
 assert.ok(r.power>=Number(c.inputs.power||80)/100);if(c.previousPower!==null)assert.ok(c.previousPower<Number(c.inputs.power||80)/100);
});

test('Composição de parcelas subdivididas distingue os níveis e perdas inteiras',()=>{
 const r=split({loss:'10'});assert.deepEqual(r.counts,{blocks:17,wholePlots:34,subplots:102,wholePlotsPerLevelA:17,subplotsPerCombination:17});assert.deepEqual(r.initialCounts,{blocks:19,wholePlots:38,subplots:114,wholePlotsPerLevelA:19,subplotsPerCombination:19});assert.equal(r.initialTotal,114);assert.match(r.composition,/subparcelas da mesma parcela permanecem vinculadas/);
});
test('B e interação cancelam o componente compartilhado da parcela, mas A não',()=>{
 for(const effect of ['B','AB']){assert.equal(split({effect,sdWhole:'1'}).power,split({effect,sdWhole:'100'}).power);assert.equal(split({effect,sdWhole:''}).n,split({effect,sdWhole:'100'}).n);}
 assert.ok(split({effect:'A',sdWhole:'6'}).n>split({effect:'A',sdWhole:'1'}).n);
});
test('Maior variabilidade e poder elevam blocos; efeito maior reduz quantidade',()=>{
 assert.ok(split({power:'90'}).n>split().n);assert.ok(split({sdSub:'8'}).n>split().n);
 assert.ok(split({means:'10;12;14;18;20;22'}).n<split().n);
 assert.ok(reps({blockModel:'interaction',sdCell:'4'}).n>reps({blockModel:'interaction',sdCell:'2'}).n);
 assert.ok(reps({sd:'8'}).n>reps().n);assert.ok(reps({power:'90'}).n>reps().n);
});
test('Duas escalas de variância de parcela são equivalentes e combinações incompatíveis falham',()=>{
 const r=split({splitVarianceMode:'means',sdWholeMean:String(Math.sqrt(9+16/3))});assert.equal(r.n,split().n);assert.ok(Math.abs(r.power-split().power)<1e-12);
 assert.throws(()=>split({splitVarianceMode:'means',sdWholeMean:'1'}),/incompatível/);
 assert.throws(()=>split({sdWhole:''}),/DP do componente/);assert.throws(()=>split({sdSub:'0'}),/DP residual/);
});
test('Ausência de efeito, número de médias e valores fora do domínio não fabricam tamanho',()=>{
 assert.throws(()=>split({effect:'AB',means:'10;12;14;12;14;16'}),/efeito escolhido é zero/);
 assert.throws(()=>split({means:'10;12'}),/exatamente 6/);assert.throws(()=>split({sdWhole:'-1'}),/DP do componente/);
 assert.throws(()=>split({sdSub:'0.00000001',effect:'B'}),/domínio numérico/);
 assert.throws(()=>split({scale:'standard'}),/unidades reais/);
 assert.throws(()=>split({means:'0;0;0;0.00001;0.00001;0.00001'}),/Nenhuma solução/);
 assert.throws(()=>split({sides:'greater'}),/teste F global/);assert.throws(()=>reps({ratio:'2'}),/composição balanceada/);
 assert.throws(()=>reps({unitsPerCell:'1'}),/unidades por tratamento e bloco/);
});
test('Vírgula decimal é aceita nos componentes sem alterar o cálculo',()=>{assert.equal(split({sdSub:'4,0',sdWhole:'3,0'}).n,split().n);assert.equal(reps({sd:'4,0'}).n,reps().n);});

test('Modelo e aplicação são escolhas obrigatórias; subamostras não viram repetições',()=>{
 assert.throws(()=>reps({cellKind:''}),/tratamento separadamente/);assert.throws(()=>reps({cellKind:'subsamples'}),/subamostras/);
 assert.throws(()=>reps({blockModel:''}),/Escolha o modelo/);assert.throws(()=>reps({blockModel:'interaction',sdCell:''}),/componente tratamento/);
 const r=reps({blockModel:'interaction',sdCell:'2'});assert.equal(r.dfResidual,(3-1)*(r.n-1));assert.equal(r.total,r.n*3*2);
 const a=reps();assert.equal(a.dfResidual,a.total-a.n-3+1);assert.equal(a.counts.unitsPerTreatment,a.n*2);
});
const plan=changes=>({...blank(),purpose:'assigned',response:'Altura',factorCount:'one',factorA:'adubação',levelsA:'3',unitKind:'individual',unit:'vaso',environment:'blocks',complete:'yes',blockCount:'4',replicates:'2',measurement:'once',allocation:'yes',...changes});
test('Planejamento aproveita várias unidades sem presumir aplicação ou modelo',()=>{
 const p=plan(),seed=fromPlan(p);assert.equal(seed.method,'replicatedBlocks');assert.equal(seed.unitsPerCell,'2');assert.equal(seed.cellKind,'');assert.equal(seed.blockModel,'');assert.equal(p.blockCount,'4');
 const r=reps({loss:'10'}),proposal=transferProposal(p,r,fingerprint(p));assert.ok(proposal.ok);assert.equal(proposal.changes.length,2);assert.equal(proposal.changes[0].after,'8');assert.equal(proposal.changes[1].after,'2');
 assert.throws(()=>applyProposal(p,r,fingerprint(p),false),/Confirme/);
 const next=applyProposal(p,r,fingerprint(p),true);assert.equal(next.blockCount,'8');assert.equal(next.replicates,'2');assert.equal(next.levelsA,'3');assert.equal(p.blockCount,'4');
});
test('Mudança explícita de composição aparece na prévia e não sobrescreve antes de confirmar',()=>{
 const p=plan(),r=reps({unitsPerCell:'3'}),prop=transferProposal(p,r,fingerprint(p));assert.ok(prop.ok);assert.deepEqual(prop.changes[1],{key:'replicates',label:'Unidades tratadas separadamente por tratamento em cada bloco',before:'2',after:'3'});assert.equal(p.replicates,'2');
});
test('Estruturas incompatíveis e versões antigas bloqueiam transferência',()=>{
 const r=reps();for(const changes of [{levelsA:'4'},{environment:'similar'},{complete:'no'},{factorCount:'two'},{measurement:'sub'},{measurement:'time'},{unitKind:'multilevel'}]){const p=plan(changes);assert.equal(transferProposal(p,r,fingerprint(p)).ok,false);}
 const p=plan();assert.equal(transferProposal({...p,blockCount:'5'},r,fingerprint(p)).ok,false);assert.equal(transferProposal(p,{...r,version:'1.1.0'},fingerprint(p)).ok,false);assert.equal(r.version,VERSION);
});
test('Parcelas subdivididas podem trazer níveis, mas não preencher um único campo de repetições',()=>{
 const p=plan({unitKind:'multilevel',factorCount:'two',levelsA:'2',levelsB:'3',cross:'yes'}),seed=fromPlan(p);assert.equal(seed.method,'splitplot');assert.equal(seed.a,'2');assert.equal(seed.b,'3');assert.match(seed.contextNote,/Confirme A na parcela/);
 assert.equal(transferProposal(p,split(),fingerprint(p)).ok,false);assert.match(transferProposal(p,split(),fingerprint(p)).reason,/dois níveis/);
});
test('Referências por simulação validam erros e poder a partir das somas de quadrados',()=>{
 assert.equal(reference.simulationChecks.length,10);assert.equal(reference.simulationsPerCheck,100000);
 for(const c of reference.simulationChecks)assert.ok(Math.abs(c.observed-c.expected)<4*c.mcse+1/100000);
});
