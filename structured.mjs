// Ensaio: balanced normal-model equations; no R package code is incorporated.
// Distribution evaluation reuses numeric.mjs and jStat (MIT).
// Sources and the derivation are recorded in docs/CICLO-3-ESTRUTURAS.md.
import {fPower,integerSearch} from './numeric.mjs';
export const isStructured=method=>['splitplot','replicatedBlocks'].includes(method);
const mean=x=>x.reduce((sum,v)=>sum+v,0)/x.length;
const ss=x=>x.reduce((sum,v)=>sum+v*v,0);
export function planStructured(s,{number,meansList,put,alpha,target}){
 if(s.scale!=='real')throw Error('Esta rota usa médias e componentes de variância em unidades reais, não um efeito padronizado genérico.');
 if(s.sides!=='two'||Number(s.ratio.replace(',','.'))!==1)throw Error('Esta rota usa um teste F global e composição balanceada; direção unilateral e alocação desigual não são representadas.');
 let perBlock,df1,dfAt,lambdaAt,composition,details={},warnings=[],meaning;
 if(s.method==='splitplot'){
  const a=put('Níveis de A, aplicado às parcelas principais',number(s.a,'níveis de A',2,10,true)),b=put('Níveis de B, aplicado às subparcelas',number(s.b,'níveis de B',2,10,true));
  if(!['A','B','AB'].includes(s.effect))throw Error('Escolha o fator A, B ou a interação A × B.');
  const values=meansList(s.means,a*b),avg=mean(values),rows=Array.from({length:a},(_,i)=>mean(values.slice(i*b,(i+1)*b))),cols=Array.from({length:b},(_,j)=>mean(rows.map((_,i)=>values[i*b+j])));
  put('Médias esperadas, A1B1; A1B2; …; A2B1; …',s.means);
  const sdSub=put('DP residual das subparcelas (componente σS)',number(s.sdSub,'DP residual das subparcelas',1e-9,1e9));
  let variance=sdSub*sdSub;
  if(s.effect==='A'){
   if(s.splitVarianceMode==='components'){
    const sdWhole=put('DP do componente compartilhado pela parcela (σW)',number(s.sdWhole,'DP do componente de parcela',0,1e9));
    variance+=b*sdWhole*sdWhole;
   }else if(s.splitVarianceMode==='means'){
    const sdMean=put('DP residual das médias de parcelas principais',number(s.sdWholeMean,'DP residual das médias de parcelas',1e-9,1e9));
    if(sdMean*sdMean<sdSub*sdSub/b*(1-1e-10))throw Error('O DP das médias de parcelas é incompatível: sua variância precisa ser pelo menos σS²/b neste modelo. Não informe a raiz de um quadrado médio sem verificar a escala.');
    variance=b*sdMean*sdMean;
   }else throw Error('Escolha como informar a variabilidade das parcelas principais.');
   df1=a-1;dfAt=r=>(a-1)*(r-1);lambdaAt=r=>r*b*ss(rows.map(x=>x-avg))/variance;
  }else{
   df1=s.effect==='B'?b-1:(a-1)*(b-1);dfAt=r=>a*(r-1)*(b-1);
   const signal=s.effect==='B'?a*ss(cols.map(x=>x-avg)):ss(values.map((v,i)=>v-rows[Math.floor(i/b)]-cols[i%b]+avg));
   lambdaAt=r=>r*signal/variance;
  }
  perBlock=a*b;
  put('Efeito dimensionado',s.effect==='A'?'A: fator da parcela principal':s.effect==='B'?'B: fator da subparcela':'Interação A × B');
  put('Denominador do teste F',s.effect==='A'?'Erro A: bloco × A':'Erro B: resíduo das subparcelas');
  put('Variância do denominador na escala dos quadrados médios',variance);
  details={a,b};
  meaning='O poder é do teste global do efeito escolhido. Não dimensiona comparações de Tukey/Dunnett, efeitos simples ou a detecção conjunta de A, B e interação.';
  composition=r=>`${r} blocos × ${a} parcelas principais × ${b} subparcelas = ${r*a} parcelas principais e ${r*a*b} subparcelas. Para A, as unidades de aplicação são as parcelas principais; as subparcelas da mesma parcela permanecem vinculadas.`;
 }else{
  const k=put('Tratamentos',number(s.groups,'número de tratamentos',2,20,true));
  if(s.cellKind!=='independent')throw Error('Esta rota exige unidades que recebam o tratamento separadamente, com sorteio dentro do bloco. Indivíduos de uma parcela tratada em conjunto são subamostras: use a parcela como unidade e dimensione blocos, sem multiplicar repetições.');
  const m=put('Unidades por tratamento em cada bloco',number(s.unitsPerCell,'unidades por tratamento e bloco',2,1000,true));
  const values=meansList(s.means,k),avg=mean(values),signal=ss(values.map(v=>v-avg));
  const sd=put('DP residual entre unidades (σE)',number(s.sd,'DP residual entre unidades',1e-9,1e9));
  put('Médias esperadas dos tratamentos',s.means);
  df1=k-1;
  if(s.blockModel==='additive'){
   put('Modelo','Aditivo: o efeito de cada tratamento não varia entre blocos');
   dfAt=r=>k*r*m-k-r+1;lambdaAt=r=>r*m*signal/(sd*sd);
   put('Denominador do teste F','Resíduo do modelo aditivo (inclui a ausência de interação)');
  }else if(s.blockModel==='interaction'){
   const sdCell=put('DP do componente tratamento × bloco (σTB)',number(s.sdCell,'DP do componente tratamento × bloco',0,1e9));
   put('Modelo','Blocos aleatórios com componente tratamento × bloco independente');
   dfAt=r=>(k-1)*(r-1);lambdaAt=r=>r*m*signal/(sd*sd+m*sdCell*sdCell);
   put('Denominador do teste F','Interação tratamento × bloco; não o erro entre unidades da mesma célula');
  }else throw Error('Escolha o modelo de blocos. Não presumimos que a interação tratamento × bloco seja nula.');
  perBlock=k*m;details={groups:k,unitsPerCell:m};
  meaning='O poder se refere ao teste global de igualdade das médias dos tratamentos, sob o modelo de blocos escolhido. Não é poder para cada comparação entre tratamentos.';
  composition=r=>`${r} blocos × ${k} tratamentos × ${m} unidades tratadas separadamente = ${r*perBlock} unidades experimentais; ${r*m} por tratamento. A estrutura dos blocos permanece no modelo.`;
 }
 const signalAtTwo=lambdaAt(2);
 if(!Number.isFinite(signalAtTwo)||signalAtTwo<1e-12)throw Error('O efeito escolhido é zero ou pequeno demais para esta faixa numérica. Revise as médias; um fatorial com médias diferentes pode ter interação nula.');
 const max=Math.floor(1000000/perBlock);
 if(max<2)throw Error('A composição excede o limite de um milhão de unidades desta rota.');
 const powerAt=r=>fPower(df1,dfAt(r),lambdaAt(r),alpha);
 const solution=integerSearch(powerAt,target,2,max),n=solution.n;
 put('GL do numerador',df1);put('GL do denominador do efeito escolhido',dfAt(n));put('Não centralidade λ do teste F',lambdaAt(n));
 put('Organização','Blocos completos, composição balanceada, fatores fixos e erros normais');
 return {n,total:n*perBlock,blocks:n,power:solution.power,units:[{label:'Blocos completos',n}],level:'blocos completos',composition:composition(n),dfResidual:dfAt(n),dfNumerator:df1,powerMeaning:meaning,warnings,perBlock,counts:s.method==='splitplot'?{blocks:n,wholePlots:n*details.a,subplots:n*perBlock,wholePlotsPerLevelA:n,subplotsPerCombination:n}:{blocks:n,unitsPerTreatment:n*details.unitsPerCell,units:n*perBlock},...details};
}
