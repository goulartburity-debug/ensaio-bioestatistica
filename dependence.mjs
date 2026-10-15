// Balanced Gaussian models; see docs/CICLO-4-DEPENDENCIA.md for derivations.
import {fPower,integerSearch} from './numeric.mjs';
import {superpowerWithin} from './vendor/superpower-within.mjs';
export const isDependent=method=>['repeated','clusterTrial'].includes(method);
const mean=x=>x.reduce((sum,v)=>sum+v,0)/x.length;
const ss=x=>x.reduce((sum,v)=>sum+v*v,0);
export function repeatedCovariance(t,sd,rho,kind){
 return Array.from({length:t},(_,i)=>Array.from({length:t},(_,j)=>sd*sd*(i===j?1:kind==='cs'?rho:rho**Math.abs(i-j))));
}
function contrastWeights(s,t,number){
 if(s.rmContrast==='first-last')return Array.from({length:t},(_,i)=>i===0?-1:i===t-1?1:0);
 if(s.rmContrast!=='custom')throw Error('Escolha uma comparação entre as avaliações.');
 const parts=String(s.rmWeights).trim().split(/[;\n]+/);
 if(parts.length!==t)throw Error(`Informe ${t} pesos, um por avaliação, separados por ponto e vírgula.`);
 const weights=parts.map(x=>number(x,'cada peso entre avaliações',-100,100));
 if(!weights.some(x=>x!==0)||Math.abs(weights.reduce((a,b)=>a+b,0))>1e-9*Math.max(1,weights.reduce((a,b)=>a+Math.abs(b),0)))throw Error('Os pesos entre avaliações precisam somar zero e não podem ser todos nulos.');
 return weights;
}
export function planDependence(s,{number,meansList,put,alpha,target,loss}){
 if(s.scale!=='real'||s.sides!=='two'||Number(s.ratio.replace(',','.'))!==1)throw Error('Estas rotas usam parâmetros em unidades reais, grupos balanceados e teste F ou contraste bilateral. Não foi aplicada uma aproximação para alocação desigual.');
 const sd=put('DP marginal esperado da resposta',number(s.sd,'desvio-padrão marginal esperado',1e-9,1e9));
 let groups,df1,dfAt,lambdaAt,max,meaning,composition,details={},initialSize=null,initialFactor;
 if(s.method==='repeated'){
  groups=put('Grupos independentes',number(s.rmGroups,'número de grupos independentes',1,10,true));
  const t=put('Avaliações nas mesmas unidades',number(s.rmOccasions,'número de avaliações',3,12,true));
  if(!['cs','ar1'].includes(s.rmCovariance))throw Error('Selecione simetria composta ou AR(1) para um contraste planejado. Outras estruturas de covariância ainda não são calculadas.');
  const rho=put(s.rmCovariance==='cs'?'Correlação comum entre avaliações':'Correlação entre avaliações vizinhas (AR1)',number(s.rho,'correlação entre avaliações',-0.99,0.99));
  if(s.rmCovariance==='cs'&&rho<=-1/(t-1)+1e-8)throw Error(`A correlação comum precisa ser maior que −1/(t−1) = ${(-1/(t-1)).toLocaleString('pt-BR')} para uma matriz de covariância válida.`);
  if(!['time','group','interaction','contrast'].includes(s.rmEffect)||groups===1&&['group','interaction'].includes(s.rmEffect))throw Error('Escolha um efeito compatível com a quantidade de grupos. Um único grupo permite tempo ou um contraste entre avaliações.');
  if(s.rmCovariance==='ar1'&&s.rmEffect!=='contrast')throw Error('AR(1) está disponível apenas para um contraste planejado entre avaliações. O teste global de tempo/interação exige outro cálculo; não aplicamos a fórmula de simetria composta.');
  const values=meansList(s.means,groups*t),rows=Array.from({length:groups},(_,i)=>values.slice(i*t,(i+1)*t)),rowMeans=rows.map(mean),cols=Array.from({length:t},(_,j)=>mean(rows.map(row=>row[j]))),avg=mean(values);
  put('Médias esperadas, grupo 1 em todas as datas; grupo 2; …',s.means);put('Covariância planejada',s.rmCovariance==='cs'?'Simetria composta: mesmo DP e mesma correlação para todo par':'AR(1): mesmo DP, intervalos iguais e correlação ρ^distância');
  if(s.rmEffect==='contrast'){
   const weights=contrastWeights(s,t,number),cov=repeatedCovariance(t,sd,rho,s.rmCovariance);
   const variance=weights.reduce((sum,w,i)=>sum+w*weights.reduce((v,wj,j)=>v+wj*cov[i][j],0),0);
   if(!(variance>1e-12&&Number.isFinite(variance)))throw Error('A variância do contraste é nula ou pequena demais para esta faixa numérica.');
   const effects=rows.map(row=>row.reduce((sum,v,j)=>sum+v*weights[j],0)),center=mean(effects);
   df1=groups===1?1:groups-1;dfAt=n=>groups===1?n-1:groups*(n-1);
   lambdaAt=n=>n*(groups===1?effects[0]**2:ss(effects.map(x=>x-center)))/variance;
   put('Pesos entre avaliações',weights.join('; '));put('Variância do contraste por unidade',variance);put('Contraste esperado por grupo',effects.join('; '));
   meaning=groups===1?'O poder é de um contraste bilateral entre avaliações, definido antes da coleta. Não é um teste global de toda a trajetória.':'O poder é do teste global que compara o contraste entre os grupos. Para dois grupos e contraste final − inicial, compara as mudanças médias. Não é o teste global de toda a interação grupo × tempo.';
   details.contrastWeights=weights;
  }else if(s.rmEffect==='group'){
   df1=groups-1;dfAt=n=>groups*(n-1);lambdaAt=n=>n*t*ss(rowMeans.map(v=>v-avg))/(sd*sd*(1+(t-1)*rho));
   meaning='O poder é da diferença entre grupos nas médias de todas as avaliações. Não garante diferenças em cada data nem trajetórias diferentes.';
  }else{
   df1=s.rmEffect==='time'?t-1:(groups-1)*(t-1);dfAt=n=>groups*(n-1)*(t-1);
   const signal=s.rmEffect==='time'?groups*ss(cols.map(v=>v-avg)):ss(values.map((v,i)=>v-rowMeans[Math.floor(i/t)]-cols[i%t]+avg));
   lambdaAt=n=>n*signal/(sd*sd*(1-rho));
   if(groups===1){const sourceAt=n=>superpowerWithin(values,n,sd,rho);df1=sourceAt(2).df1;dfAt=n=>sourceAt(n).df2;lambdaAt=n=>sourceAt(n).lambda;}
   meaning=s.rmEffect==='time'?'O poder é da mudança média ao longo das avaliações, reunindo os grupos quando houver mais de um. Não testa se um tratamento muda mais que outro.':'O poder é da interação grupo × tempo: diferenças entre as trajetórias. Não é poder para cada grupo, data ou comparação de médias.';
  }
  put('Hipótese dimensionada',({time:'Tempo: mudança média',group:'Grupos: média ao longo das avaliações',interaction:'Interação grupo × tempo',contrast:'Contraste planejado entre avaliações'})[s.rmEffect]);
  max=Math.floor(1000000/groups);initialFactor=groups;details={...details,occasions:t};
  composition=n=>`${groups} ${groups===1?'grupo':'grupos'} × ${n} unidades independentes = ${groups*n} unidades acompanhadas; ${t} avaliações por unidade = ${groups*n*t} registros vinculados. Avaliar a mesma unidade várias vezes não aumenta o número de unidades independentes.`;
 }else{
  if(s.clusterAllocation!=='group')throw Error('Esta rota exige que o tratamento seja sorteado e aplicado ao conjunto inteiro. Se cada indivíduo recebe o tratamento separadamente, escolha a estrutura correspondente a essa aplicação.');
  groups=put('Tratamentos ou grupos',number(s.groups,'número de tratamentos',2,10,true));
  const m=put('Indivíduos analisáveis por conjunto',number(s.clusterSize,'indivíduos por conjunto',2,10000,true));
  const icc=put('ICC da resposta dentro do conjunto',number(s.icc,'ICC',0,0.99));
  let values;
  if(groups===2){const delta=put('Diferença mínima relevante entre médias',number(s.delta,'diferença mínima relevante',1e-9,1e9));values=[0,delta];}
  else{values=meansList(s.means,groups);put('Médias esperadas dos tratamentos',s.means);}
  const avg=mean(values),variance=sd*sd*(icc+(1-icc)/m);
  put('Variância da média de um conjunto',variance);put('Efeito de desenho',1+(m-1)*icc);put('Análise planejada','ANOVA das médias dos conjuntos; com dois grupos equivale ao t bilateral com variância comum');
  df1=groups-1;dfAt=k=>groups*(k-1);lambdaAt=k=>k*ss(values.map(v=>v-avg))/variance;
  max=Math.min(Math.floor(1000000/groups),Math.floor(10000000/(groups*m)));details.clusterSize=m;
  const withinLoss=put('Perdas previstas dentro dos conjuntos (%)',number(s.withinLoss,'perdas de indivíduos dentro dos conjuntos (%)',0,90))/100;
  initialSize=Math.ceil(m/(1-withinLoss));initialFactor=groups*initialSize;
  composition=k=>`${groups} tratamentos × ${k} conjuntos independentes = ${groups*k} conjuntos; ${m} indivíduos por conjunto = ${groups*k*m} observações vinculadas. Os conjuntos, e não todos os indivíduos, são as unidades de atribuição dos tratamentos.`;
  meaning=groups===2?'O poder é da diferença entre duas médias, analisando as médias dos conjuntos independentes. Não é um cálculo para duas porcentagens de mortalidade.':'O poder é do teste global das médias entre tratamentos usando os conjuntos como unidades independentes. Não é poder para cada comparação de Tukey/Dunnett.';
 }
 const signal=lambdaAt(2);
 if(!(Number.isFinite(signal)&&signal>=1e-12))throw Error('O efeito escolhido é zero ou pequeno demais para esta faixa. '+(s.method==='repeated'?'Revise as médias e a pergunta: trajetórias diferentes podem ter a mesma média, e médias diferentes podem ter interação nula.':'Informe uma diferença relevante não nula ou médias de tratamentos que sejam diferentes.'));
 const solution=integerSearch(n=>fPower(df1,dfAt(n),lambdaAt(n),alpha),target,2,max),n=solution.n,initial=Math.ceil(n/(1-loss));
 put('GL do numerador',df1);put('GL do denominador',dfAt(n));put('Não centralidade λ',lambdaAt(n));
 const repeated=s.method==='repeated',total=repeated?groups*n:groups*n*details.clusterSize;
 const counts=repeated?{groups,unitsPerGroup:n,units:groups*n,occasions:details.occasions,records:groups*n*details.occasions}:{groups,clustersPerGroup:n,clusters:groups*n,individualsPerCluster:details.clusterSize,observations:total};
 const initialCounts=repeated?{...counts,unitsPerGroup:initial,units:groups*initial,records:groups*initial*details.occasions}:{...counts,clustersPerGroup:initial,clusters:groups*initial,individualsPerCluster:initialSize,observations:initial*initialFactor};
 const warnings=[];
 if(!repeated&&n<5)warnings.push('Poucos conjuntos por tratamento: o poder calculado pressupõe médias dos conjuntos normais e variância comum. Essa quantidade não demonstra adequação do modelo nem validade da randomização.');
 if(!repeated&&Number(s.withinLoss.replace(',','.'))>0)warnings.push('O ajuste interno prevê a quantidade inicial para manter m indivíduos analisáveis em cada conjunto. Perdas aleatórias podem produzir tamanhos desiguais, não representados por este cálculo balanceado.');
 return {n,total,initialTotal:initial*initialFactor,units:[{label:repeated?(groups===1?'Unidades acompanhadas':'Unidades por grupo'):'Conjuntos por tratamento',n}],initialUnits:[{label:repeated?(groups===1?'Unidades acompanhadas':'Unidades por grupo'):'Conjuntos por tratamento',n:initial}],level:repeated?'unidades por grupo':'conjuntos por tratamento',power:solution.power,clusters:repeated?null:groups*n,composition:composition(n),powerMeaning:meaning,dfResidual:dfAt(n),dfNumerator:df1,counts,initialCounts,warnings,groups,...details};
}
