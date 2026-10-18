import {jStat} from './vendor/jstat.mjs';
import {methods,VERSION} from './methods.mjs';
// Expected Fisher information for a binomial/beta-binomial mean; ICC is fixed.
export function meanInformation(p,m,rho){
 if(rho===0||m===1)return m/(p*(1-p));
 const t=1/rho-1,a=p*t,b=(1-p)*t;
 const logs=[],scores=[];
 for(let y=0;y<=m;y++){
  logs.push(jStat.gammaln(m+1)-jStat.gammaln(y+1)-jStat.gammaln(m-y+1)+jStat.gammaln(y+a)+jStat.gammaln(m-y+b)-jStat.gammaln(m+t)-jStat.gammaln(a)-jStat.gammaln(b)+jStat.gammaln(t));
  let score=0;for(let k=0;k<y;k++)score+=1/(a+k);for(let k=0;k<m-y;k++)score-=1/(b+k);scores.push(t*score);
 }
 const max=Math.max(...logs),mass=logs.map(v=>Math.exp(v-max)),sum=mass.reduce((a,b)=>a+b,0);
 const normalizer=Math.exp(max)*sum;
 if(!Number.isFinite(normalizer)||Math.abs(normalizer-1)>1e-7)throw Error('A distribuição beta-binomial não convergiu na faixa numérica permitida.');
 return mass.reduce((v,w,i)=>v+w/sum*scores[i]**2,0);
}
export function calculateLC50(s,{number}){
 const num=(k,label,min,max,int=false)=>number(s[k],label,min,max,int),meta=methods.lc50;
 if(s.lcAssumption!=='zero')throw Error('Esta rota exige mortalidade de fundo nula e limite superior de 100%. Se isso não for plausível, é necessário outro modelo.');
 if(!['logit','probit'].includes(s.lcLink))throw Error('Escolha logit ou probit.');
 if(!['individual','container'].includes(s.lcUnit))throw Error('Informe se cada indivíduo recebe separadamente ou se o recipiente inteiro é tratado.');
 if(!String(s.lcTime||'').trim())throw Error('Informe o tempo fixo da avaliação, por exemplo 72 h.');
 const m=s.lcUnit==='individual'?1:num('lcM','indivíduos analisáveis por recipiente',2,100,true);
 const rho=s.lcUnit==='individual'?0:num('lcICC','ICC entre indivíduos do recipiente',0.001,0.5);
 const c1=num('lcC1','primeira concentração de referência',1e-9,1e9),c2=num('lcC2','segunda concentração de referência',1e-9,1e9);
 const p1=num('lcP1','mortalidade esperada na primeira concentração (%)',1,99)/100,p2=num('lcP2','mortalidade esperada na segunda concentração (%)',1,99)/100;
 if(!(c2>c1&&p2>p1))throw Error('Use concentrações crescentes com mortalidades esperadas também crescentes.');
 const inverse=p=>s.lcLink==='logit'?Math.log(p/(1-p)):jStat.normal.inv(p,0,1);
 const slope=(inverse(p2)-inverse(p1))/Math.log(c2/c1),theta=Math.log(c1)-inverse(p1)/slope,lc50=Math.exp(theta);
 if(!(slope>=0.05&&slope<=20&&lc50>=1e-9&&lc50<=1e9))throw Error('Curva esperada fora da faixa validada. Revise as concentrações e mortalidades.');
 const parts=String(s.lcDoses||'').trim().split(/[;\n]+/).map(v=>v.trim());
 if(parts.length<3||parts.length>12)throw Error('Informe de 3 a 12 concentrações positivas, separadas por ponto e vírgula. O controle zero é informado à parte.');
 const doses=parts.map(v=>number(v,'cada concentração',1e-9,1e9));
 if(doses.some((d,i)=>i&&d<=doses[i-1]))throw Error('Liste concentrações distintas em ordem crescente.');
 if(!(doses[0]<lc50&&doses.at(-1)>lc50))throw Error('As concentrações precisam abranger a CL50 esperada: inclua valores abaixo e acima dela.');
 if(!['yes','no'].includes(s.lcControl))throw Error('Defina se haverá controle zero separado.');
 const control=s.lcControl==='yes'?1:0,confidence=num('confidence','confiança (%)',80,99.9),relative=num('lcPrecision','fator de precisão (%)',5,100),loss=num('loss','perdas de unidades inteiras (%)',0,90)/100;
 const z=jStat.normal.inv((1+confidence/100)/2,0,1),h=Math.log1p(relative/100);
 let a=0,b=0,d=0;
 const predictions=doses.map(concentration=>{
  const x=Math.log(concentration)-theta,eta=slope*x,p=s.lcLink==='logit'?1/(1+Math.exp(-eta)):jStat.normal.cdf(eta,0,1);
  if(p<1e-5||p>1-1e-5)throw Error('Há concentração com mortalidade prevista praticamente 0% ou 100%. A faixa desta rotina requer probabilidades entre 0,001% e 99,999%.');
  const derivative=s.lcLink==='logit'?p*(1-p):jStat.normal.pdf(eta,0,1),w=meanInformation(p,m,rho)*derivative**2;
  a+=w*slope*slope;b-=w*slope*x;d+=w*x*x;
  return {concentration,probability:p};
 });
 const det=a*d-b*b;
 if(!(det>1e-10*a*d&&Number.isFinite(det)))throw Error('A matriz de informação é singular ou instável. Amplie a faixa útil de concentrações.');
 const varianceOne=d/det,raw=z*z*varianceOne/(h*h),r=Math.max(1,Math.ceil(raw)),initialR=Math.ceil(r/(1-loss)),groups=doses.length+control,total=r*groups,initialTotal=initialR*groups;
 if(!Number.isSafeInteger(total)||initialTotal>1e7)throw Error('A precisão solicitada exige mais de 10 milhões de unidades; não foi produzido um tamanho utilizável.');
 const actualHalf=z*Math.sqrt(varianceOne/r),factor=Math.exp(actualHalf),lower=lc50/factor,upper=lc50*factor;
 const label=s.lcUnit==='individual'?'Indivíduos tratados separadamente por concentração':'Recipientes independentes por concentração';
 const warnings=[meta.limits,'O intervalo mostrado é a largura assintótica planejada em torno da CL50 esperada, não um intervalo de confiança calculado com dados nem uma garantia da largura futura.'];
 if(r<3||r*doses.length<30)warnings.push('Poucas unidades independentes: a aproximação de informação de Fisher pode ser imprecisa e o ajuste real pode falhar por separação. Confirme por simulação antes de adotar essa composição.');
 if(s.lcUnit==='container')warnings.push('Beta-binomial com ICC comum e tratado como conhecido. Estimar a dispersão no ensaio acrescenta incerteza; esta rota não garante a precisão quando o ICC é estimado. Não substitua ICC desconhecido por zero.');
 if(!control)warnings.push('Nenhuma unidade de controle foi incluída. Isso impede verificar diretamente a hipótese de mortalidade de fundo nula neste ensaio.');
 const expectedDeaths=r*m*predictions.reduce((v,p)=>v+p.probability,0),expectedSurvivors=r*m*predictions.reduce((v,p)=>v+1-p.probability,0);
 if(Math.min(expectedDeaths,expectedSurvivors)<10)warnings.push('Há menos de 10 mortes ou sobreviventes esperados no conjunto das concentrações positivas. A aproximação assintótica é frágil.');
 const params={'Objetivo':'Precisão da CL50, sem teste de hipótese','Modelo':s.lcLink==='logit'?'Logit em log natural da concentração':'Probit em log natural da concentração','Distribuição':s.lcUnit==='individual'?'Binomial':'Beta-binomial com ICC conhecido','Tempo fixo da avaliação':String(s.lcTime).slice(0,80),'Concentrações positivas':doses.join('; '),'Referência 1':`${c1}: ${100*p1}%`,'Referência 2':`${c2}: ${100*p2}%`,'CL50 esperada':lc50,'Inclinação por log natural':slope,'Indivíduos por unidade':m,'ICC de planejamento':rho,'Confiança (%)':confidence,'Fator máximo solicitado':1+relative/100,'Controle zero separado':control?'Sim, mesmo número de unidades':'Não','Perdas previstas (%)':loss*100,'Limite inferior planejado':lower,'Limite superior planejado':upper,'Fator após arredondamento':factor};
 const composition=`${doses.length} concentrações positivas${control?' + controle zero':''}; ${r} ${s.lcUnit==='individual'?'indivíduos':'recipientes'} independentes em cada condição. Total: ${total} unidades independentes e ${total*m} indivíduos. Inclusão inicial: ${initialR} por condição, ${initialTotal} unidades e ${initialTotal*m} indivíduos.`;
 return {version:VERSION,method:'lc50',params,n:r,total,initialTotal,units:[{label,n:r}],initialUnits:[{label,n:initialR}],level:'unidades por concentração',power:null,blocks:null,clusters:s.lcUnit==='container'?total:null,composition,type:meta.type,warnings,source:meta.source,ref:meta.ref,url:meta.url,inputs:{...s},raw,lc50,slope,varianceOne,factor,plannedInterval:[lower,upper],individuals:total*m,initialIndividuals:initialTotal*m,predictions,controlIncluded:!!control};
}
