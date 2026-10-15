import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate} from '../sample-size/engine.mjs';
import {defaults,VERSION} from '../sample-size/methods.mjs';
import {familyCritical,familyCDF,contrastPower} from '../sample-size/multiple-numeric.mjs';
import {fromPlan,fingerprint,transferProposal,applyProposal} from '../sample-size/integration.mjs';
import {blank} from '../guide.mjs';

const reference=JSON.parse(readFileSync(new URL('./comparison-reference.json',import.meta.url)));
const calc=extra=>calculate({...defaults(),...extra});
for(const row of reference.criticalCases){
 test(`Valor crítico contra SciPy: ${row.method}, k=${row.k}, GL=${row.df}, alfa=${row.alpha}`,()=>{
  const critical=familyCritical(row.method,row.k,row.df,row.alpha);
  const tCritical=critical/(row.method==='tukey'?Math.SQRT2:1);
  assert.ok(Math.abs(tCritical-row.critical)<3e-6,`${tCritical} vs ${row.critical}`);
  assert.ok(Math.abs(familyCDF(row.method,critical,row.k,row.df)-(1-row.alpha))<2e-7);
  if(row.independentMvtCDF)assert.ok(Math.abs(row.independentMvtCDF-(1-row.alpha))<3e-6);
 });
}
for(const row of reference.cases){
 test(`Tamanho, poder e perdas contra SciPy: ${JSON.stringify(row.input)}`,()=>{
  const result=calc(row.input),expected=row.expected;
  assert.equal(result.n,expected.n);assert.equal(result.total,expected.total);
  assert.equal(result.initialUnits[0].n,expected.initial);assert.equal(result.initialTotal,expected.initialTotal);
  assert.equal(result.dfResidual,expected.dfResidual);
  assert.ok(Math.abs(result.power-expected.power)<3e-6,`${result.power} vs ${expected.power}`);
  if(result.critical)assert.ok(Math.abs(result.critical-expected.critical)<3e-6);
 });
}

test('Poder aumenta com n; poder/variabilidade maiores ampliam n; efeito maior reduz n',()=>{
 const base={method:'dunnett',groups:'4',delta:'5',sd:'8'};
 const r=calc(base);
 assert.ok(calc({...base,power:'90'}).n>r.n);
 assert.ok(calc({...base,sd:'10'}).n>r.n);
 assert.ok(calc({...base,delta:'6'}).n<r.n);
 assert.ok(calc({...base,method:'tukey'}).n>=r.n);
 assert.ok(calc({...base,design:'blocks'}).n>=r.n);
});

test('Com dois tratamentos, Dunnett e Tukey coincidem com o mesmo t bilateral',()=>{
 const base={groups:'2',delta:'5',sd:'8'};
 const a=calc({...base,method:'dunnett'}),b=calc({...base,method:'tukey'}),c=calc({...base,method:'contrast',contrastType:'pair'});
 assert.equal(a.n,b.n);assert.equal(a.n,c.n);assert.ok(Math.abs(a.power-c.power)<1e-10);
});

test('Ajuste de família não é substituído por t sem ajuste nem por um limiar de DMS',()=>{
 const base={groups:'4',delta:'5',sd:'8'};
 assert.ok(calc({...base,method:'tukey'}).n>calc({...base,method:'contrast',contrastType:'pair'}).n);
 for(const method of ['dunnett','tukey'])assert.match(calc({...base,method}).powerMeaning,/Não é a probabilidade de detectar todas/);
});

test('Contrastes aceitam vírgula, respeitam a escala dos pesos e rejeitam definições incompatíveis',()=>{
 const base={method:'contrast',groups:'3',delta:'5',sd:'8',contrastType:'custom'};
 const a=calc({...base,weights:'-1;0,5;0,5'}),b=calc({...base,weights:'-2;1;1',delta:'10'});
 assert.equal(a.n,b.n);assert.ok(Math.abs(a.power-b.power)<1e-10);
 assert.throws(()=>calc({...base,weights:'1;1;1'}),/somar zero/);
 assert.throws(()=>calc({...base,weights:'0;0;0'}),/nulos/);
 assert.throws(()=>calc({...base,weights:'-1;1'}),/3 pesos/);
 assert.throws(()=>calc({...base,contrastType:'pair',contrastFirst:'1',contrastSecond:'1'}),/diferentes/);
});

test('Percentual relativo exige referência explícita e corresponde à diferença absoluta',()=>{
 const base={method:'tukey',groups:'4',delta:'5',sd:'8'};
 const abs=calc(base),relative=calc({...base,delta:'',differenceMode:'percent',referenceMean:'20',deltaPercent:'25'});
 assert.equal(abs.n,relative.n);assert.equal(relative.params['Diferença mínima relevante entre duas médias'],5);
 assert.throws(()=>calc({...base,differenceMode:'percent',referenceMean:'',deltaPercent:'25'}),/média de referência/);
 assert.throws(()=>calc({...base,differenceMode:'percent',referenceMean:'0',deltaPercent:'25'}),/média de referência/);
});

test('Restrição de GL é adicional e explícita, sem invalidar automaticamente amostra pequena',()=>{
 const base={method:'contrast',groups:'3',delta:'20',sd:'1'};
 const free=calc(base),constrained=calc({...base,minResidualDf:'15'});
 assert.equal(free.n,2);assert.equal(free.dfResidual,3);
 assert.equal(constrained.n,6);assert.equal(constrained.dfResidual,15);
 assert.equal(constrained.powerOnlyN,2);
 assert.match(constrained.warnings.join(' '),/não certifica a validade/);
 assert.equal(constrained.params['CV da estimativa de variância residual sob normalidade (%)'],100*Math.sqrt(2/15));
});

test('Entradas sem método implementado são recusadas, sem troca silenciosa de modelo',()=>{
 const base={method:'dunnett',groups:'4',delta:'5',sd:'8'};
 assert.throws(()=>calc({...base,ratio:'2'}),/mesma quantidade/);
 assert.throws(()=>calc({...base,sides:'greater'}),/bilaterais/);
 assert.throws(()=>calc({...base,comparisons:'2'}),/já ajustam/);
 assert.throws(()=>calc({...base,groups:'11'}),/tratamentos/);
 assert.throws(()=>calc({...base,delta:'0'}),/diferença/);
 assert.throws(()=>calc({...base,design:'split-plot'}),/Escolha grupos/);
 assert.throws(()=>calc({...base,delta:'0.000001'}),/Nenhuma solução/);
 assert.throws(()=>familyCritical('tukey',4,0,.05),/graus de liberdade/);
 assert.throws(()=>familyCritical('tukey',4,10,.0001),/significância/);
 assert.throws(()=>contrastPower(10,2,100),/domínio numérico/);
});

const plan=extra=>({...blank(),purpose:'assigned',response:'Altura',unit:'vaso',unitKind:'individual',factorCount:'one',levelsA:'4',factorA:'adubação',environment:'similar',measurement:'once',replicates:'4',...extra});
test('Aplicação de comparação independente transfere n por tratamento e preserva a estrutura',()=>{
 const p=plan({}),r=calc({method:'dunnett',groups:'4',delta:'5',sd:'8',loss:'10'});
 assert.ok(transferProposal(p,r,fingerprint(p)).ok);
 const next=applyProposal(p,r,fingerprint(p),true);
 assert.equal(next.replicates,String(r.initialUnits[0].n));assert.equal(next.environment,'similar');assert.equal(next.levelsA,'4');
 assert.throws(()=>applyProposal(p,r,fingerprint(p),false),/Confirme/);
});

test('DBC transfere blocos inteiros, incluindo a testemunha, sem virar n por bloco',()=>{
 const p=plan({environment:'blocks',complete:'yes',replicates:'1',blockCount:'3'});
 const r=calc({method:'dunnett',design:'blocks',groups:'4',delta:'5',sd:'8',loss:'10'});
 const next=applyProposal(p,r,fingerprint(p),true);
 assert.equal(next.blockCount,String(r.initialUnits[0].n));assert.equal(next.replicates,'1');
 assert.equal(r.initialTotal,Number(next.blockCount)*4);
 for(const change of [{replicates:'2'},{complete:'no'},{levelsA:'3'},{measurement:'sub'},{measurement:'time'},{unitKind:'multilevel'}]){
  const changed={...p,...change};assert.equal(transferProposal(changed,r,fingerprint(changed)).ok,false);
 }
});

test('Fatorial em DBC importa e aplica apenas estrutura completa com mesmos fatores',()=>{
 const p=plan({factorCount:'two',levelsA:'2',factorB:'adubação',levelsB:'3',cross:'yes',environment:'blocks',complete:'yes',replicates:'1',blockCount:'3'});
 const seed=fromPlan(p);assert.equal(seed.method,'factorial');assert.equal(seed.design,'blocks');assert.equal(seed.sd,'');
 const r=calc({method:'factorial',design:'blocks',a:'2',b:'3',effect:'AB',means:'10;12;14;10;14;18',sd:'4',loss:'10'});
 const next=applyProposal(p,r,fingerprint(p),true);assert.equal(next.blockCount,String(r.initialUnits[0].n));assert.equal(next.replicates,'1');
 assert.equal(r.dfResidual,5*(r.n-1));assert.equal(r.total,6*r.n);assert.equal(r.initialTotal,6*r.initialUnits[0].n);
 const wrong={...p,levelsB:'4'};assert.equal(transferProposal(wrong,r,fingerprint(wrong)).ok,false);
 assert.equal(transferProposal({...p,blockCount:'9'},r,fingerprint(p)).ok,false);
 const stale={...r,version:'1.0.0'};assert.equal(transferProposal(p,stale,fingerprint(p)).ok,false);
 assert.equal(VERSION,'1.3.0');
});
