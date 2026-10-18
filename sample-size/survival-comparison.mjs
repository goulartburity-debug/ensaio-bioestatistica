import {jStat} from './vendor/jstat.mjs';
import {lifelinesSize,lifelinesPower} from './vendor/lifelines-logrank.mjs';
import {methods,VERSION} from './methods.mjs';
export function eventProbability(rate,entry,follow){
 const x=rate*entry,entrySurvival=x===0?1:-Math.expm1(-x)/x;
 return -Math.expm1(-rate*follow)+Math.exp(-rate*follow)*(1-entrySurvival);
}
export function calculateSurvival(s,{number}){
 const num=(k,label,min,max,int=false)=>number(s[k],label,min,max,int),meta=methods.survival;
 if(s.survUnit!=='individual')throw Error('Esta rota exige indivíduos independentes em dois grupos. Organismos vinculados em recipientes precisam de um modelo de sobrevivência com agrupamento.');
 if(s.survObservation!=='exact')throw Error('Esta rota pressupõe tempos de evento registrados e censura à direita. Mortes conhecidas apenas entre visitas exigem cálculo para censura intervalar; não serão tratadas como tempos exatos.');
 if(s.survPH!=='yes')throw Error('Esta aproximação exige riscos proporcionais. Curvas que cruzam ou efeitos que mudam ao longo do tempo precisam de outro planejamento.');
 if(!['medians','hr'].includes(s.survEffect))throw Error('Escolha como informar o efeito esperado.');
 const medianCon=num('survMedianCon','mediana esperada no grupo 1',1e-9,1e9);
 const hr=s.survEffect==='medians'?medianCon/num('survMedianExp','mediana esperada no grupo 2',1e-9,1e9):num('survHR','hazard ratio do grupo 2 em relação ao 1',.2,5);
 if(!(hr>=.2&&hr<=5)||Math.abs(hr-1)<1e-6)throw Error('Informe HR entre 0,2 e 5, diferente de 1. Medianas iguais não definem um efeito a detectar.');
 const ratio=num('survRatio','alocação grupo 2 / grupo 1',.25,4),entry=num('survEntry','duração da inclusão',0,1e9),follow=num('survFollow','acompanhamento após a última inclusão',1e-9,1e9);
 if(s.sides!=='two')throw Error('A comparação de sobrevivência desta versão é bilateral.');
 const familyAlpha=num('alpha','significância da família (%)',.1,20),comparisons=num('comparisons','hipóteses na família',1,100,true),alpha=familyAlpha/100/comparisons,target=num('power','poder (%)',50,99.9)/100,loss=num('loss','indivíduos completamente sem informação (%)',0,90)/100;
 const rateCon=Math.LN2/medianCon,rateExp=hr*rateCon,pCon=eventProbability(rateCon,entry,follow),pExp=eventProbability(rateExp,entry,follow);
 if(!(pCon>=1e-6&&pCon<=1&&pExp>=1e-6&&pExp<=1))throw Error('A duração prevê eventos insuficientes para esta faixa numérica. Revise o acompanhamento e as medianas.');
 if(!['freedman','schoenfeld'].includes(s.survApprox))throw Error('Escolha Freedman ou Schoenfeld.');
 if(s.survApprox==='freedman'&&Math.abs(ratio-1)>1e-12)throw Error('Freedman com grupos desiguais não está habilitado: a validação por simulação mostrou subdimensionamento. Selecione explicitamente Schoenfeld para alocação desigual.');
 const za=jStat.normal.inv(1-alpha/2,0,1),zb=jStat.normal.inv(target,0,1),q=ratio/(1+ratio);
 const eventTarget=(za+zb)**2/(q*(1-q)*Math.log(hr)**2);
 const rawCon=eventTarget/(pCon+ratio*pExp);
 const source=s.survApprox==='freedman'?lifelinesSize(target,ratio,pExp,pCon,hr,alpha):{nCon:Math.ceil(rawCon),nExp:Math.ceil(ratio*rawCon),events:eventTarget};
 const approxPower=(ne,nc)=>{if(s.survApprox==='freedman')return lifelinesPower(ne,nc,pExp,pCon,hr,alpha);const actualQ=ne/(ne+nc),D=ne*pExp+nc*pCon;return jStat.normal.cdf(Math.sqrt(D*actualQ*(1-actualQ))*Math.abs(Math.log(hr))-za,0,1);};
 let nCon=Math.max(2,source.nCon),nExp=Math.max(2,source.nExp),power=approxPower(nExp,nCon),iterations=0;
 while(power+1e-12<target){if(++iterations>1000)throw Error('O ajuste inteiro de alocação não convergiu. Nenhum tamanho recomendado.');nCon++;nExp=Math.max(nExp,Math.ceil(nCon*ratio));power=approxPower(nExp,nCon);}
 const total=nCon+nExp,initialCon=Math.ceil(nCon/(1-loss)),initialExp=Math.ceil(nExp/(1-loss)),initialTotal=initialCon+initialExp;
 if(!Number.isSafeInteger(total)||initialTotal>1e7)throw Error('O tamanho inicial excede dez milhões de indivíduos. Nenhuma quantidade utilizável foi produzida.');
 const expectedCon=nCon*pCon,expectedExp=nExp*pExp,expectedEvents=expectedCon+expectedExp;
 const warnings=[meta.limits,'O poder exibido usa uma aproximação assintótica de eventos sob riscos proporcionais; não é poder exato nem garantia de atingir a quantidade de eventos. A censura e a alocação no conjunto em risco podem alterar o desempenho real.','Vivos no encerramento são censurados e já estão considerados. Mortes são o desfecho, não perdas a excluir.'];
 if(expectedEvents<30||Math.min(expectedCon,expectedExp)<10)warnings.push('Poucos eventos esperados: o dimensionamento assintótico pode ser frágil. Confirme com simulação ou planejamento específico.');
 if(hr<.5||hr>2)warnings.push('Efeito grande: aproximações de log-rank podem divergir mais. Use diagnóstico por simulação para a composição concreta.');
 if(loss)warnings.push('Ajuste por perdas aplicado separadamente aos grupos, para indivíduos inteiramente sem informação. Não representa abandono informativo nem distribuições de tempos de abandono.');
 const params={'Aproximação selecionada':s.survApprox==='freedman'?'Freedman (lifelines), grupos iguais':'Schoenfeld, log(HR)', 'Hipótese':'Duas curvas de sobrevivência, bilateral','Modelo para eventos e censura':'Exponencial, inclusão uniforme e encerramento comum','Mediana esperada grupo 1':medianCon,'Mediana esperada grupo 2':medianCon/hr,'HR grupo 2 / grupo 1':hr,'Unidade de tempo':String(s.survTimeUnit||'').trim()||'Mesma unidade dos tempos','Duração da inclusão':entry,'Acompanhamento após última inclusão':follow,'Duração total':entry+follow,'Alocação solicitada grupo 2 / grupo 1':ratio,'Alocação após arredondamento':nExp/nCon,'Probabilidade de evento grupo 1 (%)':100*pCon,'Probabilidade de evento grupo 2 (%)':100*pExp,'Eventos-alvo aproximados (não arredondados)':source.events,'Eventos esperados grupo 1':expectedCon,'Eventos esperados grupo 2':expectedExp,'Significância da família (%)':familyAlpha,'Hipóteses na família (Bonferroni)':comparisons,'Significância por hipótese (%)':100*alpha,'Poder desejado (%)':100*target,'Perdas completas previstas (%)':100*loss};
 return {version:VERSION,method:'survival',params,n:nCon,total,initialTotal,units:[{label:'Indivíduos independentes no grupo 1',n:nCon},{label:'Indivíduos independentes no grupo 2',n:nExp}],initialUnits:[{label:'Indivíduos iniciais no grupo 1',n:initialCon},{label:'Indivíduos iniciais no grupo 2',n:initialExp}],level:'indivíduos independentes',power,blocks:null,clusters:null,composition:`Dois grupos: ${nCon} + ${nExp} = ${total} indivíduos independentes; inclusão inicial ${initialCon} + ${initialExp} = ${initialTotal}. Eventos esperados até o encerramento: ${expectedEvents.toFixed(2)}.`,type:s.survApprox==='freedman'?'Aproximação de Freedman via lifelines':'Aproximação de Schoenfeld por log(HR)',warnings,source:s.survApprox==='freedman'?meta.source:'Equações de Schoenfeld (1983), implementação do CoDel-Stat; quantis/CDF jStat 1.9.6 (MIT). Não é porte da rotina Freedman.',ref:s.survApprox==='freedman'?meta.ref:'Schoenfeld DA (1983). Sample-size formula for the proportional-hazards regression model. Biometrics 39:499–503. DOI 10.2307/2531021.',url:s.survApprox==='freedman'?meta.url:'https://doi.org/10.2307/2531021',inputs:{...s},hr,pCon,pExp,eventTarget:source.events,expectedEvents,roundingIterations:iterations};
}
