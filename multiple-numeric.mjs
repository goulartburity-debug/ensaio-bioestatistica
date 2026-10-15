import {jStat} from './vendor/jstat.mjs';
import {probability,noncentralFSF} from './numeric.mjs';
import {sdLogDensity,normalRangeTerm} from './vendor/scipy-range.mjs';

const Phi=x=>jStat.normal.cdf(x,0,1);
const phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
const rules=new Map(),mixes=new Map(),criticals=new Map();
function remember(map,key,value){if(map.size>800)map.clear();map.set(key,value);return value;}

// Gauss-Legendre rule from the defining Legendre recurrence. This generic
// quadrature/root search is Ensaio code, not a port of R's ptukey/qtukey.
function gaussLegendre(order,lo,hi){
 const key=[order,lo,hi].join(':');if(rules.has(key))return rules.get(key);
 const nodes=[],half=(hi-lo)/2,mid=(hi+lo)/2;
 for(let i=1;i<=Math.ceil(order/2);i++){
  let x=Math.cos(Math.PI*(i-.25)/(order+.5)),derivative=0,converged=false;
  for(let it=0;it<50;it++){
   let p0=1,p1=x;
   for(let j=2;j<=order;j++){const next=((2*j-1)*x*p1-(j-1)*p0)/j;p0=p1;p1=next;}
   derivative=order*(x*p1-p0)/(x*x-1);
   const next=x-p1/derivative;
   if(Math.abs(next-x)<3e-15){x=next;converged=true;break;}x=next;
  }
  if(!converged)throw Error('A quadratura numérica não convergiu. Nenhuma quantidade foi recomendada.');
  const weight=half*2/((1-x*x)*derivative*derivative);
  nodes.push({x:mid-half*x,w:weight});
  if(nodes.length<order)nodes.push({x:mid+half*x,w:weight});
 }
 return remember(rules,key,nodes);
}

function sdMixture(df,order){
 const key=df+':'+order;if(mixes.has(key))return mixes.get(key);
 const scale=Math.sqrt(2*df),lo=Math.max(-12,-scale);
 const nodes=gaussLegendre(order,lo,12).map(({x,w})=>{
  const s=1+x/scale;
  return {s,w:w*Math.exp(sdLogDensity(s,df,jStat.gammaln))/scale};
 });
 const mass=nodes.reduce((sum,node)=>sum+node.w,0);
 if(!Number.isFinite(mass)||Math.abs(mass-1)>2e-5)throw Error('A integração da variância residual não atingiu precisão suficiente.');
 // Renormalization only removes quadrature roundoff and discarded tails.
 return remember(mixes,key,nodes.map(node=>({...node,w:node.w/mass})));
}

function cdfAt(method,c,k,df,order){
 const normal=gaussLegendre(order,-9,9).map(({x,w})=>({z:x,w:w*phi(x),phi:phi(x)}));
 let total=0;
 for(const {s,w} of sdMixture(df,order)){
  let conditional=0;
  if(method==='tukey'){
   for(const node of normal)conditional+=normalRangeTerm(c,k,s,node.z,node.w,Phi);
  }else{
   const width=c*Math.SQRT2*s;
   for(const node of normal)conditional+=node.w*Math.pow(Math.max(0,Phi(node.z+width)-Phi(node.z-width)),k-1);
  }
  total+=w*conditional;
 }
 return probability(total);
}

function checkDomain(k,df){
 if(!Number.isInteger(k)||k<2||k>10||!Number.isInteger(df)||df<1||df>1000000)throw Error('Comparações disponíveis para 2 a 10 tratamentos e de 1 a 1 milhão de graus de liberdade residuais.');
}
export function familyCDF(method,c,k,df){
 checkDomain(k,df);if(!['dunnett','tukey'].includes(method)||!(c>=0&&Number.isFinite(c)))throw Error('Distribuição ou valor crítico inválido.');
 if(k===2){const t=method==='tukey'?c/Math.SQRT2:c;return probability(2*jStat.studentt.cdf(t,df)-1);}
 const first=cdfAt(method,c,k,df,64),second=cdfAt(method,c,k,df,96);
 if(Math.abs(first-second)<2e-7)return second;
 const third=cdfAt(method,c,k,df,160);
 if(Math.abs(second-third)>2e-7)throw Error('A distribuição das comparações não convergiu com a precisão necessária.');
 return third;
}

export function familyCritical(method,k,df,alpha){
 checkDomain(k,df);if(!(alpha>=.001&&alpha<=.2))throw Error('Nas comparações múltiplas, use significância familiar de 0,1% a 20%.');
 const key=[method,k,df,alpha].join(':');if(criticals.has(key))return criticals.get(key);
 if(k===2)return remember(criticals,key,jStat.studentt.inv(1-alpha/2,df)*(method==='tukey'?Math.SQRT2:1));
 const target=1-alpha;
 let lo=0,hi=method==='tukey'?8:6;
 while(cdfAt(method,hi,k,df,64)<target&&hi<512)hi*=2;
 if(hi>=512)throw Error('Não foi possível delimitar o valor crítico das comparações.');
 for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(cdfAt(method,mid,k,df,64)<target)lo=mid;else hi=mid;}
 let result=(lo+hi)/2;
 // Refine the quantile on the converged CDF, rather than trusting a
 // coarse rule or silently returning an infinite-df approximation.
 for(let i=0;i<8;i++){
  const value=familyCDF(method,result,k,df),error=value-target;
  if(Math.abs(error)<3e-8)return remember(criticals,key,result);
  const h=Math.max(1e-4,result*1e-4);
  const derivative=(familyCDF(method,result+h,k,df)-familyCDF(method,Math.max(0,result-h),k,df))/(2*h);
  if(!(derivative>0))break;
  result=Math.max(result/2,Math.min(result*2,result-error/derivative));
 }
 throw Error('A busca do valor crítico não convergiu; nenhum tamanho foi recomendado.');
}

export function contrastPower(df,critical,noncentrality){
 if(!(df>=1&&critical>0&&noncentrality>=0))throw Error('Parâmetros inválidos para o poder da comparação.');
 return noncentralFSF(critical*critical,1,df,noncentrality*noncentrality);
}

// Export the ported kernel for independent checks/provenance. In cdfAt the
// same factorization folds phi(z) into quadrature weights for performance.
export {normalRangeTerm};
