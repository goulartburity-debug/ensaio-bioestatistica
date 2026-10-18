import {calculateLC50} from './dose-response.mjs';
import {jStat} from './vendor/jstat.mjs';
import {integerSearch} from './numeric.mjs';
import {methods,VERSION} from './methods.mjs';
export function compareCurvePower(n1,n2,v1,v2,logRatio,alpha){
 const delta=Math.abs(logRatio)/Math.sqrt(v1/n1+v2/n2),critical=jStat.normal.inv(1-alpha/2,0,1);
 return Math.max(0,Math.min(1,jStat.normal.cdf(delta-critical,0,1)+jStat.normal.cdf(-delta-critical,0,1)));
}
export function calculateDoseComparison(s,{number}){
 if(s.lcCompareStructure!=='independent')throw Error('Esta rota exige duas curvas independentes, sem organismos/recipientes compartilhados, pareamento ou blocos. Se incluídos, os controles são separados por curva.');
 if(s.sides!=='two')throw Error('A comparação de CL50 desta versão é bilateral.');
 const num=(k,label,min,max,int=false)=>number(s[k],label,min,max,int);
 // Reuse the validated curve design, stopping before any single-curve size is computed.
 const design={...s,lcPrecision:'20',confidence:'95',loss:'0'};
 const curve1=calculateLC50(design,{number,informationOnly:true});
 const second={...design,lcC1:s.lc2C1,lcC2:s.lc2C2,lcP1:s.lc2P1,lcP2:s.lc2P2,lcDoses:s.lc2Doses,lcM:s.lc2M,lcICC:s.lc2ICC};
 const curve2=calculateLC50(second,{number,informationOnly:true});
 const logRatio=Math.log(curve2.lc50)-Math.log(curve1.lc50),ratio=Math.exp(logRatio);
 if(Math.abs(logRatio)<1e-6)throw Error('As duas CL50 esperadas são iguais ou praticamente iguais. Defina a menor diferença relevante antes de dimensionar a comparação.');
 const allocation=num('lcCompareAllocation','alocação por concentração, curva 2 / curva 1',.25,4),familyAlpha=num('alpha','significância da família (%)',.1,20),hypotheses=num('comparisons','hipóteses na família',1,100,true),alpha=familyAlpha/100/hypotheses,target=num('power','poder (%)',50,99.9)/100,loss=num('loss','perdas de unidades inteiras (%)',0,90)/100;
 const n2=n=>Math.ceil(allocation*n),powerAt=n=>compareCurvePower(n,n2(n),curve1.varianceOne,curve2.varianceOne,logRatio,alpha);
 const solved=integerSearch(powerAt,target,2,1000000),r1=solved.n,r2=n2(r1),conditions1=curve1.doses.length+curve1.control,conditions2=curve2.doses.length+curve2.control;
 const total1=r1*conditions1,total2=r2*conditions2,total=total1+total2,initial1=Math.ceil(r1/(1-loss)),initial2=Math.ceil(r2/(1-loss)),initialTotal=initial1*conditions1+initial2*conditions2;
 if(!Number.isSafeInteger(total)||initialTotal>1e7)throw Error('A inclusão excede dez milhões de unidades. Nenhum resultado utilizável foi recomendado.');
 const variance=curve1.varianceOne/r1+curve2.varianceOne/r2,z=jStat.normal.inv(1-alpha/2,0,1),factor=Math.exp(z*Math.sqrt(variance)),ratioInterval=[ratio/factor,ratio*factor],meta=methods.lcCompare;
 const kind=s.lcUnit==='container'?'recipientes independentes':'indivíduos tratados separadamente';
 const warnings=[meta.limits,'O poder é uma aproximação normal de Wald para log(CL50₂/CL50₁), com informação esperada sob as curvas alternativas. Não é poder exato, análise dos dados ou garantia de diferença significativa.','Os limites da razão são planejados em torno do efeito esperado, não intervalos estimados com dados. Não usamos sobreposição de intervalos individuais como teste.'];
 if(s.lcUnit==='container')warnings.push('Cada curva usa beta-binomial com seu ICC fixado para planejar. A incerteza de estimar a dispersão no ensaio não está incluída. Não substitua ICC desconhecido por zero.');
 if(r1<3||r2<3||r1*curve1.doses.length<30||r2*curve2.doses.length<30)warnings.push('Poucas unidades em pelo menos uma curva: a aproximação pode ser imprecisa, com separação ou falhas de ajuste. Confirme a composição por simulação.');
 if(Math.abs(curve1.slope-curve2.slope)>1e-6)warnings.push('As inclinações esperadas diferem. A razão apresentada compara CL50 especificamente; não representa potência relativa constante em outras porcentagens de mortalidade.');
 if(!curve1.control)warnings.push('Não foram incluídos controles. A hipótese de mortalidade de fundo nula não será verificada diretamente por esta composição.');
 const params={'Hipótese':'H0: CL50 da curva 2 / CL50 da curva 1 = 1, bilateral','Modelo':s.lcLink==='probit'?'Probit':'Logit','Distribuição':s.lcUnit==='container'?'Beta-binomial, ICC conhecido por curva':'Binomial, indivíduos independentes','Tempo fixo':String(s.lcTime).slice(0,80),'CL50 esperada curva 1':curve1.lc50,'CL50 esperada curva 2':curve2.lc50,'Razão esperada CL50₂/CL50₁':ratio,'Inclinação curva 1':curve1.slope,'Inclinação curva 2':curve2.slope,'Concentrações curva 1':curve1.doses.join('; '),'Concentrações curva 2':curve2.doses.join('; '),'Referências curva 1':`${s.lcC1}: ${s.lcP1}%; ${s.lcC2}: ${s.lcP2}%`,'Referências curva 2':`${s.lc2C1}: ${s.lc2P1}%; ${s.lc2C2}: ${s.lc2P2}%`,'Indivíduos por unidade, curva 1':curve1.m,'Indivíduos por unidade, curva 2':curve2.m,'ICC curva 1':curve1.rho,'ICC curva 2':curve2.rho,'Controle por curva':curve1.control?'Separados, mesma quantidade por condição':'Não incluído','Alocação por concentração, curva 2 / curva 1':allocation,'Alocação efetiva após arredondamento':r2/r1,'Significância da família (%)':familyAlpha,'Hipóteses na família (Bonferroni)':hypotheses,'Significância por hipótese (%)':alpha*100,'Poder desejado (%)':target*100,'Perdas de unidades inteiras (%)':loss*100};
 return {version:VERSION,method:'lcCompare',params,n:r1,total,initialTotal,units:[{label:`${kind} por concentração na curva 1`,n:r1},{label:`${kind} por concentração na curva 2`,n:r2}],initialUnits:[{label:'Unidades iniciais por concentração na curva 1',n:initial1},{label:'Unidades iniciais por concentração na curva 2',n:initial2}],level:'unidades independentes por concentração e curva',power:solved.power,blocks:null,clusters:s.lcUnit==='container'?total:null,composition:`Curva 1: ${r1} × ${conditions1} condições = ${total1} unidades. Curva 2: ${r2} × ${conditions2} condições = ${total2} unidades. Total: ${total} unidades independentes e ${total1*curve1.m+total2*curve2.m} indivíduos. Inicial com perdas: ${initialTotal} unidades.`,type:meta.type,warnings,source:meta.source,ref:meta.ref,url:meta.url,inputs:{...s},ratio,ratioInterval,variance,curve1,curve2,individuals:total1*curve1.m+total2*curve2.m,initialIndividuals:initial1*conditions1*curve1.m+initial2*conditions2*curve2.m};
}
