import {jStat} from './vendor/jstat.mjs';
import {integerSearch} from './numeric.mjs';
import {familyCritical,contrastPower} from './multiple-numeric.mjs';

export const comparisonMethods=['dunnett','tukey','contrast'];
export function isComparison(method){return comparisonMethods.includes(method);}
export function isBlocked(s){return s.method==='blocks'||(['factorial',...comparisonMethods].includes(s.method)&&s.design==='blocks');}
export const residualDf=(groups,n,blocked)=>blocked?(groups-1)*(n-1):groups*(n-1);

export function planComparison(s,{alpha,target,number,put}){
 const k=put('Tratamentos, incluindo a testemunha quando houver',number(s.groups,'número de tratamentos',2,10,true));
 if(!['independent','blocks'].includes(s.design))throw Error('Escolha grupos independentes ou blocos completos.');
 if(s.sides!=='two')throw Error('As novas comparações desta versão são bilaterais. Não foi aplicada uma hipótese unilateral silenciosamente.');
 if(s.method!=='contrast'&&Number(s.comparisons.replace(',','.'))!==1)throw Error('Dunnett e Tukey já ajustam a família de comparações. Use 1 no campo de famílias/hipóteses adicionais.');
 if(s.ratio!=='1'&&Number(s.ratio.replace(',','.'))!==1)throw Error('Estas comparações exigem a mesma quantidade em todos os tratamentos. Alocação desigual ainda não está disponível nesta rota.');
 const blocked=isBlocked(s),sd=put(blocked?'DP residual após considerar blocos':'Desvio-padrão residual',number(s.sd,'desvio-padrão residual',1e-9,1e9));
 put('Organização',blocked?'Blocos completos: uma unidade por tratamento em cada bloco':'Grupos independentes balanceados');
 let delta;
 if(s.differenceMode==='percent'){
  const baseline=put('Média de referência para a diferença percentual',number(s.referenceMean,'média de referência',1e-9,1e9));
  const percent=put('Diferença percentual relativa (%)',number(s.deltaPercent,'diferença percentual',1e-9,10000));
  delta=baseline*percent/100;
 }else if(s.differenceMode==='absolute')delta=number(s.delta,'tamanho da diferença relevante',1e-9,1e9);
 else throw Error('Escolha diferença em unidades reais ou percentual relativo.');
 if(!Number.isFinite(delta)||delta>1e9)throw Error('A diferença calculada excede a faixa permitida.');
 put(s.method==='contrast'?'Tamanho relevante do contraste':'Diferença mínima relevante entre duas médias',delta);

 let weights=null,varianceFactor=2;
 if(s.method==='contrast'){
  if(s.contrastType==='control-average')weights=Array.from({length:k},(_,i)=>i===0?-1:1/(k-1));
  else if(s.contrastType==='pair'){
   const first=number(s.contrastFirst,'primeiro tratamento',1,k,true),second=number(s.contrastSecond,'segundo tratamento',1,k,true);
   if(first===second)throw Error('Escolha dois tratamentos diferentes para a comparação planejada.');
   weights=Array.from({length:k},(_,i)=>i===first-1?-1:i===second-1?1:0);
  }else if(s.contrastType==='custom'){
   const pieces=String(s.weights).trim().split(/[;\n]+/).map(x=>x.trim());
   if(pieces.length!==k)throw Error(`Informe ${k} pesos, um por tratamento, separados por ponto e vírgula.`);
   weights=pieces.map(x=>number(x,'cada peso do contraste',-100,100));
   const absolute=weights.reduce((sum,x)=>sum+Math.abs(x),0);
   if(!(absolute>0)||Math.abs(weights.reduce((sum,x)=>sum+x,0))>1e-9*Math.max(1,absolute))throw Error('Os pesos do contraste precisam somar zero e não podem ser todos nulos.');
  }else throw Error('Escolha qual comparação foi planejada.');
  varianceFactor=weights.reduce((sum,x)=>sum+x*x,0);
  put('Pesos do contraste (T1; T2; …)',weights.map(x=>Number(x.toPrecision(12))).join('; '));
  put('Família dimensionada','Um contraste bilateral definido antes da coleta');
 }else{
  put('Número de comparações na família',s.method==='dunnett'?k-1:k*(k-1)/2);
  put('Família dimensionada',s.method==='dunnett'?'Cada tratamento contra T1 (testemunha)':'Todos os pares de tratamentos');
 }
 const minimum=put('Mínimo adicional de GL residuais (0 = não imposto)',number(s.minResidualDf,'mínimo adicional de graus de liberdade',0,10000,true));
 const critAt=n=>{
  const df=residualDf(k,n,blocked);
  return s.method==='contrast'?jStat.studentt.inv(1-alpha/2,df):familyCritical(s.method,k,df,alpha)/(s.method==='tukey'?Math.SQRT2:1);
 };
 const powerAt=n=>contrastPower(residualDf(k,n,blocked),critAt(n),delta*Math.sqrt(n)/(sd*Math.sqrt(varianceFactor)));
 const max=Math.floor(1000000/k),byPower=integerSearch(powerAt,target,2,max);
 const minN=minimum?Math.max(2,1+Math.ceil(minimum/(blocked?k-1:k))):2;
 if(minN>max)throw Error('A restrição de graus de liberdade excede o limite de unidades desta rota.');
 const n=Math.max(byPower.n,minN),power=powerAt(n),df=residualDf(k,n,blocked),critical=critAt(n);
 if(n>2&&n===byPower.n&&powerAt(n-1)>=target+2e-7)throw Error('A busca inteira não isolou o menor tamanho. Revise os parâmetros; nenhum resultado foi recomendado.');
 put('Poder dimensionado','Por comparação com o efeito informado; não é poder para detectar todas ou pelo menos uma');
 put('GL do resíduo',df);
 put('Valor crítico t usado',critical);
 if(s.method==='tukey')put('Valor crítico q de Tukey',critical*Math.SQRT2);
 put('Quantidade por tratamento ou blocos somente pelo poder',byPower.n);
 put('CV da estimativa de variância residual sob normalidade (%)',100*Math.sqrt(2/df));
 const meaning=s.method==='contrast'
  ? 'O poder se refere ao contraste definido antes da coleta. Se houver outras hipóteses, a família precisa ser especificada.'
  : `O poder se refere a uma comparação com diferença de ${delta.toLocaleString('pt-BR')} unidades, já usando o ajuste ${s.method==='dunnett'?'de Dunnett contra a testemunha':'de Tukey para todos os pares'}. Não é a probabilidade de detectar todas as diferenças ou pelo menos uma delas.`;
 return {n,total:k*n,power,groups:k,weights,dfResidual:df,powerOnlyN:byPower.n,minResidualDf:minimum,critical,powerMeaning:meaning,
  level:blocked?'blocos completos':'unidades por tratamento',blocks:blocked?n:null,
  units:[{label:blocked?'Blocos completos':'Por tratamento',n}],
  composition:blocked?`${n} blocos × ${k} tratamentos × 1 unidade = ${k*n} unidades experimentais. São ${n} unidades por tratamento.`:`${k} tratamentos × ${n} unidades = ${k*n} unidades experimentais.`,
  warnings:[...(n>byPower.n?['A quantidade foi ampliada por uma restrição de graus de liberdade escolhida por você. Esse corte não certifica a validade do estudo.']:[])]};
}
