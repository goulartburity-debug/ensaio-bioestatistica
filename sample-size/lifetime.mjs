import {jStat} from './vendor/jstat.mjs';
import {methods,VERSION} from './methods.mjs';
// A cohort contributes one multinomial outcome per independent individual,
// not a new Bernoulli observation at each scheduled inspection.
export function intervalInformation(times,theta,beta,model){
 let a=0,b=0,d=0,previous={F:0,survival:1,g:[0,0]},intervals=[];
 for(let i=0;i<=times.length;i++){
  let current;
  if(i===times.length)current={F:1,survival:0,g:[0,0]};
  else{
   const x=Math.log(times[i])-theta,eta=beta*x;
   const F=model==='lognormal'?jStat.normal.cdf(eta,0,1):1/(1+Math.exp(-eta));
   const survival=model==='lognormal'?jStat.normal.cdf(-eta,0,1):1/(1+Math.exp(eta));
   const f=model==='lognormal'?jStat.normal.pdf(eta,0,1):F*survival;
   current={F,survival,g:[-beta*f,x*f]};
  }
  const probability=previous.F>.5?previous.survival-current.survival:current.F-previous.F;
  if(!(probability>1e-12&&Number.isFinite(probability)))throw Error('Há intervalo de avaliação com probabilidade praticamente nula. Revise horários e curva; o cálculo não é numericamente seguro nessa composição.');
  const g=current.g.map((v,j)=>v-previous.g[j]);a+=g[0]**2/probability;b+=g[0]*g[1]/probability;d+=g[1]**2/probability;
  intervals.push({from:i?times[i-1]:0,to:i===times.length?null:times[i],probability});previous=current;
 }
 const determinant=a*d-b*b;
 if(!(determinant>1e-10*a*d&&Number.isFinite(determinant)))throw Error('Horários insuficientes para separar mediana e forma: matriz de informação singular ou instável.');
 const mass=intervals.reduce((v,x)=>v+x.probability,0);if(Math.abs(mass-1)>1e-8)throw Error('As probabilidades dos intervalos não somam um.');
 return {varianceOne:d/determinant,intervals};
}
export function calculateLT50(s,{number}){
 const num=(key,label,min,max,int=false)=>number(s[key],label,min,max,int);
 if(s.ltUnit!=='individual')throw Error('Esta rota exige indivíduos independentes. Organismos acompanhados dentro de recipientes tratados em conjunto exigem um modelo de sobrevivência com agrupamento; não serão contados como indivíduos independentes.');
 if(!['lognormal','loglogistic'].includes(s.ltModel))throw Error('Escolha lognormal ou log-logística.');
 if(s.ltFollow!=='cohort')throw Error('Esta rota acompanha os mesmos indivíduos desde o início, sem reposição, entrada tardia ou amostragem destrutiva.');
 const t1=num('ltT1','primeiro tempo de referência',1e-9,1e9),t2=num('ltT2','segundo tempo de referência',1e-9,1e9),p1=num('ltP1','mortalidade acumulada esperada no primeiro tempo (%)',1,99)/100,p2=num('ltP2','mortalidade acumulada esperada no segundo tempo (%)',1,99)/100;
 if(!(t2>t1&&p2>p1))throw Error('Os tempos e as mortalidades acumuladas esperadas precisam ser crescentes.');
 const inverse=p=>s.ltModel==='lognormal'?jStat.normal.inv(p,0,1):Math.log(p/(1-p));
 const beta=(inverse(p2)-inverse(p1))/Math.log(t2/t1),theta=Math.log(t1)-inverse(p1)/beta,lt50=Math.exp(theta);
 if(!(beta>=.05&&beta<=20&&lt50>=1e-9&&lt50<=1e9))throw Error('Forma ou LT50 fora da faixa validada. Revise as previsões.');
 const parts=String(s.ltTimes||'').trim().split(/[;\n]+/).map(x=>x.trim());
 if(parts.length<3||parts.length>30)throw Error('Informe entre 3 e 30 horários positivos de avaliação, separados por ponto e vírgula. O início zero já está incluído.');
 const times=parts.map(v=>number(v,'cada horário de avaliação',1e-9,1e9));
 if(times.some((v,i)=>i&&v<=times[i-1]))throw Error('Os horários precisam ser distintos e estar em ordem crescente.');
 if(!(times[0]<lt50&&times.at(-1)>lt50))throw Error('O acompanhamento precisa abranger a LT50 prevista: comece antes e termine depois dela. Esta versão não dimensiona uma mediana extrapolada para além do acompanhamento.');
 const confidence=num('confidence','confiança (%)',80,99.9),precision=num('ltPrecision','fator de precisão (%)',5,100),loss=num('loss','perdas completas de indivíduos (%)',0,90)/100;
 const z=jStat.normal.inv((1+confidence/100)/2,0,1),{varianceOne,intervals}=intervalInformation(times,theta,beta,s.ltModel);
 const raw=z*z*varianceOne/Math.log1p(precision/100)**2,n=Math.max(2,Math.ceil(raw)),initialTotal=Math.ceil(n/(1-loss));
 if(!Number.isSafeInteger(n)||initialTotal>1e7)throw Error('O tamanho inicial excede dez milhões de indivíduos. Nenhuma quantidade utilizável foi produzida.');
 const factor=Math.exp(z*Math.sqrt(varianceOne/n)),plannedInterval=[lt50/factor,lt50*factor],survival=intervals.at(-1).probability,meta=methods.lt50;
 const warnings=[meta.limits,'Os limites exibidos são uma largura log-Wald planejada em torno da LT50 esperada. Não são intervalos estimados a partir de dados nem garantem a precisão futura.','Indivíduos vivos no último horário são censurados à direita, contribuem ao cálculo e não são perdas. Mortes identificadas entre visitas são censuradas no intervalo; não foram tratadas como ocorridas exatamente no horário da visita.'];
 if(n<40||n*(1-survival)<10)warnings.push('Poucos indivíduos ou eventos esperados: a aproximação assintótica pode ser imprecisa e ajustes reais podem falhar. Confirme por simulação antes de adotar essa composição.');
 if(loss)warnings.push('A inflação por perdas supõe ausência completa de informação de uma fração dos indivíduos. Não dimensiona abandonos informativos, horários de abandono ou perdas dependentes do tratamento.');
 const params={'Objetivo':'Precisão da LT50 de uma única condição','Modelo':s.ltModel==='lognormal'?'Lognormal':'Log-logística','Unidade de tempo':String(s.ltTimeUnit||'').trim()||'Mesma unidade dos horários','Referência 1':`${t1}: ${p1*100}% acumulados`,'Referência 2':`${t2}: ${p2*100}% acumulados`,'Horários de avaliação':times.join('; '),'LT50 esperada':lt50,'Forma b em log(t)':beta,...(s.ltModel==='lognormal'?{'Sigma de log(t)':1/beta}:{}),'Confiança (%)':confidence,'Fator máximo solicitado':1+precision/100,'Fator após arredondamento':factor,'Proporção esperada viva ao final (%)':100*survival,'Eventos esperados até o fim':n*(1-survival),'Perdas completas previstas (%)':loss*100};
 return {version:VERSION,method:'lt50',params,n,total:n,initialTotal,units:[{label:'Indivíduos independentes acompanhados em uma condição',n}],initialUnits:[{label:'Indivíduos iniciais em uma condição',n:initialTotal}],level:'indivíduos independentes',power:null,blocks:null,clusters:null,composition:`Uma condição: ${n} indivíduos independentes acompanhados nos mesmos ${times.length} horários. Inclusão inicial: ${initialTotal}. As avaliações repetidas não multiplicam a amostra.`,type:meta.type,warnings,source:meta.source,ref:meta.ref,url:meta.url,inputs:{...s},raw,lt50,beta,varianceOne,factor,plannedInterval,intervals,expectedEvents:n*(1-survival),expectedSurvivors:n*survival};
}
