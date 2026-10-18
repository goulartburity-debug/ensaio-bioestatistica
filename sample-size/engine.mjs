import {calculateLT50} from './lifetime.mjs';
import {calculateLC50} from './dose-response.mjs';
import {isDependent,planDependence} from './dependence.mjs';
import {isStructured,planStructured} from './structured.mjs';
import {normalQuantile,fPower,pairedPower,integerSearch} from './numeric.mjs';
import {openEpiMeans} from './vendor/openepi-means.mjs';
import {methods,VERSION} from './methods.mjs';
import {isComparison,isBlocked,planComparison,residualDf} from './comparisons.mjs';
export function number(value,label,min=-Infinity,max=Infinity,integer=false){
 const s=String(value??'').trim();
 if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s))throw Error(`Informe ${label} como número (aceitamos vírgula decimal, sem separador de milhar).`);
 const n=Number(s.replace(',','.'));
 if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))throw Error(`${label}: use ${integer?'um inteiro':'um valor'} entre ${min} e ${max}.`);
 return n;
}
const positive=(v,l,max=1e9)=>number(v,l,1e-9,max);
const mean=x=>x.reduce((a,b)=>a+b,0)/x.length;
export function meansList(value,size){const parts=String(value).trim().split(/[;\n]+/).map(s=>s.trim());if(parts.length!==size)throw Error(`Informe exatamente ${size} médias esperadas, separadas por ponto e vírgula.`);return parts.map(v=>number(v,'cada média esperada',-1e9,1e9));}
function direction(s,diff){if(!['two','greater','less'].includes(s.sides))throw Error('Selecione a hipótese bilateral ou uma direção unilateral.');if(s.sides==='greater'&&diff<=0||s.sides==='less'&&diff>=0)throw Error('A direção unilateral não corresponde ao sinal da diferença ou correlação esperada.');}
function fEffect(s,kind,k,a,b){
 if(s.scale==='standard')return positive(s.f,'efeito f',2);
 const sd=positive(s.sd,kind==='blocks'?'desvio-padrão residual após considerar blocos':'desvio-padrão residual');
 const values=meansList(s.means,k),avg=mean(values);let deviations=values.map(v=>v-avg);
 if(kind==='factorial'){
  const rows=Array.from({length:a},(_,i)=>mean(values.slice(i*b,(i+1)*b))),cols=Array.from({length:b},(_,j)=>mean(Array.from({length:a},(_,i)=>values[i*b+j])));
  deviations=values.map((v,index)=>s.effect==='A'?rows[Math.floor(index/b)]-avg:s.effect==='B'?cols[index%b]-avg:v-rows[Math.floor(index/b)]-cols[index%b]+avg);
 }
 const f=Math.sqrt(mean(deviations.map(v=>v*v)))/sd;
 if(!(f>=1e-6&&f<=2))throw Error('O efeito escolhido é zero, muito pequeno ou supera a faixa validada (0 < f ≤ 2). Revise as médias e o desvio-padrão. Médias diferentes podem ter interação nula.');
 return f;
}
export function calculate(s){
 if(s.method==='lt50')return calculateLT50(s,{number});
 if(s.method==='lc50')return calculateLC50(s,{number});
 const meta=Object.hasOwn(methods,s.method)?methods[s.method]:null;if(!meta)throw Error('Escolha um método disponível.');
 const method=s.method,estimate=['mean','proportion','cluster'].includes(method),loss=number(s.loss,'perdas (%)',0,90)/100;
 const params={},warnings=[],units=[];let n,total,power=null,level='unidades',type=meta.type,blocks=null,clusters=null,composition='',raw=null,details={};
 const put=(key,value)=>{params[key]=value;return value;};
 const confidence=estimate?put('Confiança (%)',number(s.confidence,'confiança (%)',80,99.9)):null;
 let alpha,target,za,zb;
 if(!estimate){const comparisons=put('Hipóteses na família (Bonferroni)',number(s.comparisons,'número de hipóteses',1,100,true));alpha=number(s.alpha,'significância da família (%)',0.1,20)/100/comparisons;put('Significância da família (%)',Number(s.alpha.replace(',','.')));put('Significância por hipótese (%)',alpha*100);target=put('Poder desejado (%)',number(s.power,'poder (%)',50,99.9))/100;zb=normalQuantile(target);if(['means','paired','proportions','correlation'].includes(method)){direction(s,1*(s.sides==='less'?-1:1));put('Hipótese',s.sides==='two'?'Bilateral':s.sides==='greater'?'Unilateral: maior que zero':'Unilateral: menor que zero');za=normalQuantile(1-alpha/(s.sides==='two'?2:1));}else put('Hipótese',isComparison(method)?'Comparação bilateral das médias ou do contraste':'Teste F do efeito informado (cauda superior)');}
 const z=estimate?normalQuantile((1+confidence/100)/2):null;
 if(isComparison(method)){
  const planned=planComparison(s,{alpha,target,number,put});
  ({n,total,power,level,blocks,composition}=planned);units.push(...planned.units);warnings.push(...planned.warnings);
  details={dfResidual:planned.dfResidual,powerOnlyN:planned.powerOnlyN,minResidualDf:planned.minResidualDf,critical:planned.critical,powerMeaning:planned.powerMeaning,contrastWeights:planned.weights};
 }
 if(isDependent(method)){
  const planned=planDependence(s,{number,meansList,put,alpha,target,loss});
  ({n,total,power,level,clusters,composition}=planned);units.push(...planned.units);warnings.push(...planned.warnings);
  const {warnings:ignoredWarnings,units:ignoredUnits,...dependent}=planned;details={...dependent};
 }
 if(isStructured(method)){
  const planned=planStructured(s,{number,meansList,put,alpha,target});
  ({n,total,power,level,blocks,composition}=planned);units.push(...planned.units);warnings.push(...planned.warnings);
  const {warnings:ignoredWarnings,units:ignoredUnits,...structure}=planned;details={...structure};
 }
 if(['mean','proportion','cluster'].includes(method)){
  const margin=put(method==='mean'?'Margem de erro (unidade da resposta)':'Margem de erro (pontos percentuais)',positive(s.margin,'margem de erro',method==='mean'?1e9:99));
  let variance;
  if(method==='mean'){const sd=put('Desvio-padrão esperado',positive(s.sd,'desvio-padrão esperado'));variance=sd*sd;raw=z*z*variance/(margin*margin);}
  else {const p=put('Porcentagem esperada (%)',number(s.p,'porcentagem esperada (%)',0.01,99.99))/100;variance=p*(1-p);raw=z*z*variance/(margin/100)**2;}
  if(method!=='cluster'&&s.population==='finite'){const N=put('População finita',number(s.populationN,'tamanho da população',2,1e9,true));raw=N*raw/(N-1+raw);warnings.push('Correção finita somente para amostragem aleatória simples, sem reposição, da população informada.');}
  if(method==='cluster'){
   const m=put('Indivíduos por conglomerado',number(s.clusterSize,'tamanho de cada conglomerado',2,10000,true)),icc=put('ICC',number(s.icc,'correlação intraclasse (ICC)',0,0.99));
   const deff=put('Efeito de desenho (DEFF)',1+(m-1)*icc);clusters=Math.max(2,Math.ceil(raw*deff/m));n=clusters;level='conglomerados';units.push({label:'Conglomerados',n});total=clusters*m;composition=`${clusters} conglomerados × ${m} indivíduos = ${total} observações vinculadas.`;
   if(clusters<30)warnings.push('Menos de 30 conglomerados: a aproximação pode ser frágil. Este cálculo não inclui correção por poucos conglomerados.');
   const effective=total/deff,p=Number(s.p.replace(',','.'))/100;if(Math.min(effective*p,effective*(1-p))<10)throw Error('A frequência esperada é muito próxima dos limites para esta aproximação. É necessário dimensionamento específico para a proporção e o desenho; nenhum n foi recomendado.');
  }else{n=Math.max(2,Math.ceil(raw));total=n;units.push({label:'Unidades na amostra',n});if(method==='proportion'){const p=Number(s.p.replace(',','.'))/100;if(Math.min(n*p,n*(1-p))<10)throw Error('Com esses parâmetros, a aproximação normal tem menos de 10 sucessos ou insucessos esperados. Use um método específico para proporções raras; nenhum n foi recomendado.');}}
 }
 if(method==='means'){
  let sd1,sd2,delta;
  if(s.scale==='standard'){const d=put('Efeito padronizado d (grupo 2 − grupo 1)',number(s.d,'efeito d',-5,5));if(!d)throw Error('O efeito não pode ser zero.');delta=d;sd1=sd2=1;warnings.push('A opção d pressupõe o mesmo desvio-padrão nos dois grupos.');}
  else{delta=put('Diferença (média 2 − média 1)',number(s.delta,'diferença mínima relevante',-1e9,1e9));if(!delta)throw Error('A diferença não pode ser zero.');sd1=put('Desvio-padrão do grupo 1',positive(s.sd1,'desvio-padrão do grupo 1'));sd2=put('Desvio-padrão do grupo 2',positive(s.sd2,'desvio-padrão do grupo 2'));}
  direction(s,delta);const ratio=put('Razão planejada n2/n1',number(s.ratio,'razão n2/n1',0.1,10));
  const sizes=openEpiMeans(sd1,sd2,ratio,Math.abs(delta),za,zb);n=Math.max(2,sizes[0]);const n2=Math.max(2,Math.ceil(n*ratio));units.push({label:'Grupo 1',n},{label:'Grupo 2',n:n2});total=n+n2;put('Razão após arredondamento',n2/n);if(Math.min(n,n2)<30)warnings.push('Um grupo tem menos de 30 unidades: a aproximação normal pode subdimensionar a comparação t, sobretudo com variâncias diferentes. Considere uma rotina específica para a análise final.');
 }
 if(method==='proportions'){
  const p1=put('Porcentagem no grupo 1 (%)',number(s.p1,'porcentagem no grupo 1',0.01,99.99))/100,p2=put('Porcentagem no grupo 2 (%)',number(s.p2,'porcentagem no grupo 2',0.01,99.99))/100;
  const difference=p2-p1;if(difference===0)throw Error('As porcentagens esperadas precisam ser diferentes.');direction(s,difference);
  const ratio=put('Razão planejada n2/n1',number(s.ratio,'razão n2/n1',0.1,10)),pooled=(p1+ratio*p2)/(1+ratio);
  raw=(za*Math.sqrt((1+ratio)*pooled*(1-pooled))+zb*Math.sqrt(ratio*p1*(1-p1)+p2*(1-p2)))**2/(ratio*difference*difference);
  n=Math.max(2,Math.ceil(raw));const n2=Math.max(2,Math.ceil(raw*ratio));units.push({label:'Grupo 1',n},{label:'Grupo 2',n:n2});total=n+n2;put('Razão após arredondamento',n2/n);
  if(Math.min(n*p1,n*(1-p1),n2*p2,n2*(1-p2))<10)throw Error('A aproximação tem menos de 10 sucessos ou insucessos esperados em um grupo. É necessário um cálculo binomial específico; nenhum n foi recomendado.');
 }
 if(method==='paired'){
  let d;
  if(s.scale==='standard'){d=put('Efeito dz (diferença/DP das diferenças)',number(s.d,'efeito dz',-5,5));direction(s,d);d=Math.abs(d);}
  else{const delta=put('Diferença (depois − antes ou condição 2 − 1)',number(s.delta,'diferença mínima relevante',-1e9,1e9));direction(s,delta);let sd;
   if(s.pairScale==='correlation'){const sd1=put('DP na primeira condição',positive(s.sd1,'DP na primeira condição')),sd2=put('DP na segunda condição',positive(s.sd2,'DP na segunda condição')),rho=put('Correlação entre as duas medidas',number(s.rho,'correlação entre medidas',-0.99,0.99));sd=Math.sqrt(sd1*sd1+sd2*sd2-2*rho*sd1*sd2);}else sd=positive(s.sd,'DP das diferenças');
   put('DP das diferenças',sd);d=Math.abs(delta)/sd;
  }
  if(!(d>=1e-6&&d<=5))throw Error('Use uma diferença não nula; a faixa validada é 0 < |dz| ≤ 5.');put('|dz| usado',d);
  const solution=integerSearch(n=>pairedPower(n,d,alpha,s.sides==='two'?'two':'one'),target,2);n=solution.n;power=solution.power;total=n;level='pares completos';units.push({label:'Pares completos',n});composition=`${n} pares independentes entre si. Na mesma pessoa antes/depois: ${n} pessoas e ${2*n} medidas. Em pares de pessoas diferentes: ${2*n} pessoas.`;
 }
 if(['anova','factorial','blocks'].includes(method)){
  let k,a,b,df1;
  if(method==='factorial'){a=put('Níveis de A',number(s.a,'níveis de A',2,10,true));b=put('Níveis de B',number(s.b,'níveis de B',2,10,true));k=a*b;if(!['A','B','AB'].includes(s.effect))throw Error('Escolha efeito A, B ou interação.');df1=s.effect==='A'?a-1:s.effect==='B'?b-1:(a-1)*(b-1);put('Efeito dimensionado',s.effect==='AB'?'Interação A × B':s.effect);}
  else{k=put('Tratamentos',number(s.groups,'número de tratamentos',method==='anova'?3:2,20,true));df1=k-1;}
  const f=put('Efeito f do termo escolhido',fEffect(s,method,k,a,b));if(s.scale!=='standard'){put('Médias esperadas',s.means);put('DP residual esperado',Number(s.sd.replace(',','.')));}
  if(method==='factorial'&&!['independent','blocks'].includes(s.design))throw Error('Escolha o fatorial sem blocos ou em blocos completos.');
  const blocked=isBlocked(s),fn=r=>fPower(df1,residualDf(k,r,blocked),k*r*f*f,alpha),solution=integerSearch(fn,target,2,Math.floor(1000000/k));n=solution.n;power=solution.power;total=k*n;
  details.dfResidual=residualDf(k,n,blocked);put('GL do resíduo',details.dfResidual);
  if(method==='factorial')put('Organização',blocked?'Blocos completos aditivos, uma unidade por combinação e bloco':'Fatorial completo sem blocos');
  if(blocked){blocks=n;level='blocos completos';units.push({label:'Blocos completos',n});composition=`${n} blocos × ${k} ${method==='factorial'?'combinações':'tratamentos'} × 1 unidade = ${total} unidades experimentais. São ${n} unidades por ${method==='factorial'?'combinação':'tratamento'}, uma em cada bloco.`;}
  else{units.push({label:method==='factorial'?'Por combinação':'Por tratamento',n});level=method==='factorial'?'unidades por combinação':'unidades por tratamento';composition=`${k} ${method==='factorial'?'combinações':'tratamentos'} × ${n} unidades = ${total} unidades experimentais.`;}
 }
 if(method==='correlation'){
  const r=put('Correlação esperada ρ',number(s.r,'correlação esperada',-0.99,0.99));if(r===0)throw Error('A correlação esperada não pode ser zero nesta comparação com H0: ρ = 0.');direction(s,r);raw=3+((za+zb)/Math.atanh(Math.abs(r)))**2;n=Math.max(4,Math.ceil(raw));total=n;units.push({label:'Unidades com ambas as variáveis',n});if(n<30)warnings.push('Amostra pequena: a aproximação de Fisher pode ser imprecisa.');
 }
 if(method==='regression'){
  const p=put('Coeficientes preditores no modelo completo',number(s.predictors,'número de coeficientes preditores',1,100,true)),q=put('Coeficientes testados em conjunto',number(s.tested,'coeficientes testados',1,p,true));let f2;
  if(s.effectMode==='f2')f2=positive(s.f2,'efeito f²',4);else{const full=put('R² do modelo completo',number(s.r2full,'R² completo',0,0.99)),reduced=put('R² do modelo reduzido',number(s.r2reduced,'R² reduzido',0,0.99));if(full<=reduced)throw Error('O R² completo precisa ser maior que o R² reduzido.');if(q===p&&reduced!==0)throw Error('Quando todos os preditores são testados, o modelo reduzido tem apenas intercepto e R² = 0.');f2=(full-reduced)/(1-full);if(f2>4)throw Error('f² supera a faixa validada (até 4).');}
  put('Efeito f²',f2);const solution=integerSearch(n=>fPower(q,n-p-1,n*f2,alpha),target,p+3);n=solution.n;total=n;power=solution.power;units.push({label:'Unidades com todas as variáveis',n});
 }
 if(!Number.isSafeInteger(total)||total>10000000||total<2)throw Error('O total excede a faixa permitida (até 10 milhões). Revise as hipóteses; não foi produzido um resultado utilizável.');
 const initialUnits=units.map(x=>({...x,n:Math.ceil(x.n/(1-loss))}));let initialTotal;
 if(isDependent(method))initialTotal=details.initialTotal;
 else if(isStructured(method))initialTotal=initialUnits[0].n*details.perBlock;
 else if(method==='blocks'||method==='anova'||isComparison(method))initialTotal=initialUnits[0].n*Number(s.groups);
 else if(method==='factorial')initialTotal=initialUnits[0].n*Number(s.a)*Number(s.b);
 else if(method==='cluster')initialTotal=initialUnits[0].n*Number(s.clusterSize);
 else initialTotal=initialUnits.reduce((sum,x)=>sum+x.n,0);
 if(s.population==='finite'&&['mean','proportion'].includes(method)&&initialTotal>Number(s.populationN))throw Error('O ajuste para perdas excede a população disponível. Revise a precisão ou a previsão de perdas.');
 if(isStructured(method)){const r=initialUnits[0].n;details.initialCounts=method==='splitplot'?{blocks:r,wholePlots:r*details.a,subplots:initialTotal,wholePlotsPerLevelA:r,subplotsPerCombination:r}:{blocks:r,unitsPerTreatment:r*details.unitsPerCell,units:initialTotal};}
 put('Perdas previstas (%)',loss*100);
 if(loss>0)warnings.push(method==='repeated'?'Perdas ajustadas em unidades com acompanhamento completo. Ausência de apenas algumas datas requer outro modelo de planejamento.':method==='clusterTrial'?'Perdas ajustadas em conjuntos inteiros por tratamento; perdas internas são informadas separadamente.':(isBlocked(s)||isStructured(method))?'Perdas ajustadas no nível de blocos inteiros. Perdas isoladas dentro de blocos exigem outro planejamento.':method==='cluster'?'Perdas ajustadas no nível de conglomerados inteiros; m é o número analisável dentro de cada um.':method==='paired'?'Perdas ajustadas no nível de pares completos; perder uma medida pode tornar o par incompleto.':'Ajuste aplicado por grupo ou combinação, preservando a organização planejada.');
 warnings.push(meta.limits);
 return {version:VERSION,method,params,n,total,initialTotal,units,initialUnits,level,power,blocks,clusters,composition,type,warnings,source:meta.source,ref:meta.ref,url:meta.url,raw,inputs:{...s},...details};
}
export function summary(r){if(r.method==='lt50')return `Precisão da LT50. ${r.composition} ${Object.entries(r.params).map(([k,v])=>`${k}: ${v}`).join('; ')}. Não é poder de comparação de sobrevivência. ${r.warnings.join(' ')} Fonte: ${r.source}; versão ${r.version}.`;if(r.method==='lc50')return `Precisão da CL50. ${r.composition} Parâmetros: ${Object.entries(r.params).map(([k,v])=>`${k}: ${v}`).join('; ')}. Aproximação por informação de Fisher, não poder de teste. ${r.warnings.join(' ')} Fonte: ${r.source}. Versão ${r.version}.`;return `${methods[r.method].name}. Método: ${r.type}. Parâmetros: ${Object.entries(r.params).map(([k,v])=>`${k}: ${v}`).join('; ')}. Necessário analisável: ${r.units.map(x=>`${x.n} ${x.label.toLowerCase()}`).join('; ')}; total ${r.total}${r.method==='cluster'?' observações vinculadas, não independentes':r.method==='paired'?' pares':r.method==='clusterTrial'?' observações vinculadas':isStructured(r.method)?' unidades nos níveis descritos abaixo':' unidades independentes sob o modelo'}. Inclusão inicial: ${r.initialUnits.map(x=>`${x.n} ${x.label.toLowerCase()}`).join('; ')}; total ${r.initialTotal}. ${r.composition} ${r.power===null?'Poder não recalculado após arredondamento nesta aproximação.':`Poder na composição analisável: ${(100*r.power).toFixed(2)}%.`} Limitações: ${r.warnings.join(' ')} Fonte: ${r.source} ${r.ref} ${r.url}. CoDel-Stat — cálculo v${r.version}. O tamanho não garante representatividade, significância ou validade do estudo.`;}
