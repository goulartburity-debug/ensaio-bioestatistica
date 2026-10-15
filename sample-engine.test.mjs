import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculate,number,summary} from '../sample-size/engine.mjs';import {defaults} from '../sample-size/methods.mjs';
const calc=p=>calculate({...defaults(),...p});
const fixture=JSON.parse(fs.readFileSync(new URL('./sample-reference.json',import.meta.url)));
for(const {input,expected} of fixture.cases)test('Tamanho contra referência independente: '+JSON.stringify(input),()=>{const r=calc(input);assert.equal(r.n,expected.n);assert.equal(r.total,expected.total);assert.equal(r.initialTotal,expected.initialTotal);assert.deepEqual(r.units.map(u=>u.n),expected.units);if(expected.power!==null)assert.ok(Math.abs(r.power-expected.power)<2e-6);assert.ok(summary(r).includes(r.version));});
test('Maior poder e DP aumentam n; maior efeito e margem reduzem n',()=>{
 const base={method:'means',delta:'5',sd1:'8',sd2:'8'};assert.ok(calc({...base,power:'90'}).n>calc(base).n);assert.ok(calc({...base,sd1:'12'}).n>calc(base).n);assert.ok(calc({...base,delta:'6'}).n<calc(base).n);
 assert.ok(calc({method:'mean',sd:'8',margin:'3'}).n<calc({method:'mean',sd:'8',margin:'2'}).n);
 const a={method:'anova',groups:'4',scale:'standard',f:'0.2'};assert.ok(calc({...a,power:'90'}).n>calc(a).n);assert.ok(calc({...a,f:'0.3'}).n<calc(a).n);
});
test('Vírgula decimal é aceita; branco, NaN, infinito, ambiguidade e frações de grupos rejeitados',()=>{assert.equal(number('0,5','x'),.5);assert.equal(calc({method:'paired',scale:'standard',d:'0,5'}).n,34);for(const bad of ['', 'NaN','Infinity','1.000,2','1e3'])assert.throws(()=>number(bad,'x'));assert.throws(()=>calc({method:'anova',groups:'3.5',scale:'standard',f:'0.25'}));});
test('Direção contrária, efeito nulo e limites binomiais não geram recomendação',()=>{
 assert.throws(()=>calc({method:'means',delta:'-5',sd1:'8',sd2:'8',sides:'greater'}),/direção/);
 assert.throws(()=>calc({method:'correlation',r:'0'}),/zero/);
 assert.throws(()=>calc({method:'proportion',p:'0.01',margin:'5'}),/aproximação normal/);
 assert.throws(()=>calc({method:'proportions',p1:'0.01',p2:'20'}),/aproximação/);
 assert.throws(()=>calc({method:'factorial',a:'2',b:'2',means:'10;12;14;16',sd:'4',effect:'AB'}),/efeito escolhido é zero/);
});
test('DBC dimensiona blocos e perdas de blocos inteiros; não n por bloco',()=>{const r=calc({method:'blocks',groups:'3',means:'10;12;15',sd:'4',loss:'10'});assert.equal(r.blocks,14);assert.equal(r.initialUnits[0].n,16);assert.equal(r.total,42);assert.equal(r.initialTotal,48);assert.match(r.warnings.join(' '),/blocos inteiros/);});
test('Conglomerados separam conjuntos e observações e alertam poucos conjuntos',()=>{const r=calc({method:'cluster',p:'50',margin:'5',clusterSize:'20',icc:'0.05'});assert.equal(r.clusters,38);assert.equal(r.total,760);assert.match(summary(r),/não independentes/);});
test('População finita apenas em estimação; perda que excede população é bloqueada',()=>{const r=calc({method:'means',delta:'5',sd1:'8',sd2:'8',population:'finite',populationN:'10'});assert.equal(r.n,41);assert.throws(()=>calc({method:'proportion',p:'50',margin:'0.1',population:'finite',populationN:'50',loss:'10'}),/excede a população/);});
