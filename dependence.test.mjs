import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {calculate} from '../sample-size/engine.mjs';import {defaults,VERSION} from '../sample-size/methods.mjs';import {examples} from '../sample-size/guidance.mjs';
import {superpowerWithin} from '../sample-size/vendor/superpower-within.mjs';import {fPower} from '../sample-size/numeric.mjs';import {repeatedCovariance} from '../sample-size/dependence.mjs';
import {blank,describe} from '../guide.mjs';import {fromPlan,fingerprint,transferProposal,applyProposal} from '../sample-size/integration.mjs';
const reference=JSON.parse(fs.readFileSync(new URL('./dependence-reference.json',import.meta.url)));
const calc=s=>calculate({...defaults(),...s});const rm=s=>calc({method:'repeated',...examples.repeated,...s});const cl=s=>calc({method:'clusterTrial',...examples.clusterTrial,...s});
for(const c of reference.fixtures)test('SciPy/matrix projection: '+c.name,()=>{
 const r=calc(c.inputs);assert.equal(r.n,c.n);assert.equal(r.total,c.total);assert.equal(r.initialUnits[0].n,c.initial);assert.equal(r.initialTotal,c.initialTotal);assert.equal(r.dfNumerator,c.df1);assert.equal(r.dfResidual,c.df2);
 assert.ok(Math.abs(r.params['Não centralidade λ']-c.ncp)<1e-8);assert.ok(Math.abs(r.power-c.power)<2e-7,`${r.power} vs ${c.power}`);
 if(c.previousPower!==null)assert.ok(c.previousPower<Number(c.inputs.power||80)/100);
});
test('Saídas publicadas do Stata: hipóteses diferentes têm tamanhos diferentes',()=>{
 const means='145;135;130;145;130;120';for(const [effect,n] of [['group',114],['time',3],['interaction',27]])assert.equal(rm({means,sd:'15',rho:'0.7',rmEffect:effect}).n,n);
 assert.equal(rm({rmGroups:'1',rmEffect:'time',means:'26.4;25.6;21',sd:String(Math.sqrt(77))}).n,20);
});
test('Porte MIT confere com saída publicada do Superpower e conserva o original identificado',()=>{
 const m=Math.sqrt(3*.25**2/2);const d=superpowerWithin([-m,0,m],20,1,.8);assert.equal(d.df1,2);assert.equal(d.df2,38);assert.ok(Math.abs(d.lambda-18.75)<1e-12);assert.ok(Math.abs(100*fPower(d.df1,d.df2,d.lambda,.05)-96.91634)<.00001);
 const original=fs.readFileSync(new URL('./reference-source/power_oneway_within.R',import.meta.url));assert.equal(crypto.createHash('sha256').update(original).digest('hex'),'f0757d727e8a6e2a1482af3ef481a1a3a4c5c84046840a8f35a212cc51c58d2c');
});
test('AR1 só calcula um contraste; não finge esfericidade no teste global',()=>{
 assert.throws(()=>rm({rmCovariance:'ar1',rmEffect:'time'}),/apenas para um contraste/);
 assert.throws(()=>rm({rmCovariance:'other'}),/Outras estruturas/);
 assert.equal(repeatedCovariance(3,2,.5,'ar1')[0][2],1);assert.equal(repeatedCovariance(3,2,.5,'cs')[0][2],2);
});
test('Hipóteses e matrizes precisam ser compatíveis',()=>{
 assert.throws(()=>rm({rmGroups:'1',means:'10;12;14'}),/Um único grupo/);
 assert.throws(()=>rm({rho:'-0.5'}),/matriz de covariância válida/);assert.throws(()=>rm({rmOccasions:'2'}),/número de avaliações/);
 assert.throws(()=>rm({means:'1;2;3'}),/exatamente 6/);assert.throws(()=>rm({rmEffect:''}),/Escolha um efeito/);
 assert.throws(()=>rm({rmEffect:'interaction',means:'10;12;14;12;14;16'}),/efeito escolhido é zero/);
 assert.throws(()=>rm({rmEffect:'group',means:'10;12;14;14;12;10'}),/efeito escolhido é zero/);
});
test('Um contraste válido equivale ao t da mudança; pesos e variância preservam escala',()=>{
 const s={rmGroups:'1',rmCovariance:'cs',rmEffect:'contrast',means:'10;12;14',rho:'0.6'};const r=rm(s);const paired=calc({method:'paired',delta:'4',sd:String(4*Math.sqrt(2*(1-.6)))});assert.equal(r.n,paired.n);assert.ok(Math.abs(r.power-paired.power)<1e-10);
 const scaled=rm({...s,rmContrast:'custom',rmWeights:'-2;0;2'});assert.equal(scaled.n,r.n);assert.ok(Math.abs(scaled.power-r.power)<1e-12);
 assert.throws(()=>rm({...s,rmContrast:'custom',rmWeights:'1;1;1'}),/somar zero/);assert.throws(()=>rm({...s,rmContrast:'custom',rmWeights:'-1;1'}),/3 pesos/);
});
test('Correlação pode ter efeitos opostos nas hipóteses; não há benefício universal',()=>{
 assert.ok(rm({rmEffect:'interaction',rho:'0.8'}).n<rm({rmEffect:'interaction',rho:'0.2'}).n);
 assert.ok(rm({rmEffect:'group',rho:'0.8'}).n>rm({rmEffect:'group',rho:'0.2'}).n);
 assert.ok(rm({power:'90'}).n>rm().n);assert.ok(rm({sd:'8'}).n>rm().n);assert.ok(cl({icc:'0.5'}).n>cl({icc:'0'}).n);
});
test('Contagem repetida conserva unidades e registros; perdas ampliam unidades completas',()=>{
 const r=rm({loss:'10'});assert.equal(r.n,17);assert.equal(r.total,34);assert.equal(r.counts.records,102);assert.equal(r.initialUnits[0].n,19);assert.equal(r.initialCounts.units,38);assert.equal(r.initialCounts.records,114);assert.equal(r.initialTotal,38);
 assert.match(r.warnings.join(' '),/acompanhamento completo/);
});
test('Conjuntos, indivíduos e duas perdas são registrados em níveis diferentes',()=>{
 const r=cl({loss:'10',withinLoss:'20'});assert.equal(r.n,7);assert.equal(r.clusters,14);assert.equal(r.total,140);assert.equal(r.initialUnits[0].n,8);assert.equal(r.initialCounts.individualsPerCluster,13);assert.equal(r.initialCounts.clusters,16);assert.equal(r.initialTotal,208);assert.equal(r.dfResidual,12);
 assert.match(r.composition,/não todos os indivíduos/);assert.match(r.warnings.join(' '),/tamanhos desiguais/);
});
test('ICC zero não transforma graus de liberdade de conjuntos nos de indivíduos',()=>{
 const r=cl({icc:'0'});assert.equal(r.dfResidual,2*(r.n-1));assert.ok(r.dfResidual<r.total-2);
 assert.throws(()=>cl({clusterAllocation:'individual'}),/conjunto inteiro/);assert.throws(()=>cl({icc:''}),/ICC/);assert.throws(()=>cl({icc:'1'}),/ICC/);assert.throws(()=>cl({clusterSize:'1'}),/indivíduos por conjunto/);
 assert.throws(()=>cl({groups:'3',means:'10;10;10'}),/efeito escolhido é zero/);assert.throws(()=>cl({ratio:'2'}),/grupos balanceados/);
});
test('Vírgulas decimais não mudam resultado e aproximações não são aplicadas silenciosamente',()=>{
 assert.equal(rm({rho:'0,6',sd:'4,0'}).n,rm().n);assert.equal(cl({icc:'0,05',withinLoss:'12,5'}).n,cl().n);
 assert.throws(()=>rm({sides:'greater'}),/contraste bilateral/);assert.throws(()=>rm({scale:'standard'}),/unidades reais/);
 assert.throws(()=>cl({delta:'0.0001'}),/Nenhuma solução/);
});
const plan=s=>({...blank(),purpose:'assigned',response:'Altura',factorCount:'one',levelsA:'2',factorA:'adubação',unitKind:'individual',unit:'vaso',environment:'similar',measurement:'time',times:'3',replicates:'4',allocation:'yes',...s});
test('Integração de acompanhamento transfere unidades, preserva datas e exige confirmação',()=>{
 const p=plan(),seed=fromPlan(p);assert.equal(seed.method,'repeated');assert.equal(seed.rmGroups,'2');assert.equal(seed.rmOccasions,'3');assert.equal(seed.rho,'');assert.equal(seed.rmCovariance,'');
 const r=rm({loss:'10'}),prop=transferProposal(p,r,fingerprint(p));assert.ok(prop.ok);assert.deepEqual(prop.changes,[{key:'replicates',label:'Unidades acompanhadas por tratamento',before:'4',after:'19'}]);assert.throws(()=>applyProposal(p,r,fingerprint(p),false),/Confirme/);
 const next=applyProposal(p,r,fingerprint(p),true);assert.equal(next.replicates,'19');assert.equal(next.times,'3');assert.equal(describe(next).total,38);assert.equal(describe(next).records,114);assert.equal(p.replicates,'4');
});
test('Integração de conjuntos exige nível de aplicação e atualiza contagens iniciais exibidas',()=>{
 const p=plan({unitKind:'group',unit:'gaiola',measurement:'sub',observations:'10',times:''}),seed=fromPlan(p);assert.equal(seed.method,'clusterTrial');assert.equal(seed.groups,'2');assert.equal(seed.clusterSize,'10');assert.equal(seed.icc,'');assert.equal(seed.clusterAllocation,'');
 const r=cl({loss:'10',withinLoss:'20'}),prop=transferProposal(p,r,fingerprint(p));assert.ok(prop.ok);assert.equal(prop.changes[0].after,'8');assert.equal(prop.changes[1].after,'13');const next=applyProposal(p,r,fingerprint(p),true);assert.equal(next.unitKind,'group');assert.equal(describe(next).total,16);assert.equal(describe(next).records,208);
});
test('Blocos, subamostras combinadas com datas, níveis e resultados desatualizados são recusados',()=>{
 for(const patch of [{environment:'blocks'},{unitKind:'group'},{measurement:'both'},{times:'4'},{levelsA:'3'},{factorCount:'two'}]){const p=plan(patch);assert.equal(transferProposal(p,rm(),fingerprint(p)).ok,false);}
 const p=plan({unitKind:'group',unit:'gaiola',measurement:'sub',observations:'9'});assert.equal(transferProposal(p,cl(),fingerprint(p)).ok,false);
 const q=plan();assert.equal(transferProposal({...q,times:'4'},rm(),fingerprint(q)).ok,false);assert.equal(transferProposal(q,{...rm(),version:'1.2.0'},fingerprint(q)).ok,false);assert.equal(rm().version,VERSION);
});
test('Simulações independentes conferem rejeições a partir dos dados gerados',()=>{
 assert.equal(reference.simulationsPerCheck,100000);assert.equal(reference.simulationChecks.length,14);
 for(const c of reference.simulationChecks)assert.ok(Math.abs(c.observed-c.expected)<4*c.mcse+1/100000);
});
