import {jStat} from './vendor/jstat.mjs';
export const normalQuantile=p=>jStat.normal.inv(p,0,1);
export function probability(p){if(!Number.isFinite(p)||p< -1e-7||p>1+1e-7)throw Error('O cálculo numérico não convergiu com precisão suficiente. Revise os parâmetros.');return Math.max(0,Math.min(1,p));}
// Noncentral F is a Poisson mixture of incomplete beta functions. Summing outwards
// from the Poisson mode avoids underflow at lambda/2; omitted mass <= 2e-11.
// This is an original implementation of the distribution identity, not a port of R.
export function noncentralFSF(x,df1,df2,lambda){
 if(!(x>0&&df1>0&&df2>0&&lambda>=0&&lambda<=5000))throw Error('Parâmetros fora do domínio numérico validado da distribuição F.');
 const z=df2/(df2+df1*x),a=df1/2,b=df2/2,mu=lambda/2;
 if(mu===0)return probability(jStat.ibeta(z,b,a));
 const mode=Math.floor(mu);
 // Relative weights avoid loss of precision in exp(-mu + k log(mu) - log(k!)).
 let mass=1,sum=jStat.ibeta(z,b,a+mode),wl=1,wr=1;
 for(let d=1;d<10000;d++){
  if(d<=mode){wl*= (mode-d+1)/mu;mass+=wl;sum+=wl*jStat.ibeta(z,b,a+mode-d);}
  wr*=mu/(mode+d);mass+=wr;sum+=wr*jStat.ibeta(z,b,a+mode+d);
  const leftRatio=d<mode?(mode-d)/mu:0,rightRatio=mu/(mode+d+1);
  const omitted=wl*leftRatio/(1-leftRatio)+wr*rightRatio/(1-rightRatio);
  if(d>10&&omitted/mass<2e-12)return probability(sum/mass);
 }
 throw Error('A série da distribuição F não convergiu. Nenhum tamanho foi recomendado.');
}
export function fPower(df1,df2,lambda,alpha){
 const critical=jStat.centralF.inv(1-alpha,df1,df2);
 if(!Number.isFinite(critical))throw Error('Não foi possível obter o valor crítico F.');
 return noncentralFSF(critical,df1,df2,lambda);
}
export function pairedPower(n,d,alpha,sides){
 const df=n-1,critical=jStat.studentt.inv(1-alpha/(sides==='two'?2:1),df),nc=Math.sqrt(n)*d;
 if(nc>20)throw Error('Parâmetros fora da faixa validada do cálculo t não central (não centralidade até 20).');
 if(sides==='two')return noncentralFSF(critical*critical,1,df,nc*nc);
 return probability(1-jStat.noncentralt.cdf(critical,df,nc));
}
export function integerSearch(fn,target,min=2,max=1000000){
 let low=min,high=min,v=fn(high);
 if(v>=target)return {n:high,power:v};
 while(v<target&&high<max){low=high+1;high=Math.min(max,high*2);v=fn(high);}
 if(v<target)throw Error(`Nenhuma solução até ${max.toLocaleString('pt-BR')} unidades no nível dimensionado. O guia não extrapola esse limite.`);
 while(low<high){const mid=Math.floor((low+high)/2);if(fn(mid)>=target)high=mid;else low=mid+1;}
 return {n:high,power:fn(high)};
}
