import {defaults,VERSION} from './methods.mjs';
import {blank} from '../guide.mjs';
import {isComparison,isBlocked} from './comparisons.mjs';
export const fingerprint=plan=>JSON.stringify(Object.fromEntries(Object.keys(blank()).sort().map(k=>[k,String(plan[k]??'')])));
export function fromPlan(plan){
 const d=defaults();d.stage='choose';d.unitName=plan.unit||'';d.contextNote=`Planejamento consultado: ${plan.unit||'unidade ainda não definida'}; ${plan.response||'resposta ainda não definida'}. Quantidade atual: ${plan.replicates||'não informada'}. Nenhum valor foi alterado. Confirme abaixo o tipo de resposta e a estrutura.`;
 if(plan.unitKind==='multilevel'&&plan.factorCount==='two'&&plan.cross==='yes'&&plan.environment==='blocks'&&plan.complete==='yes'&&!['sub','time','both','unknown'].includes(plan.measurement)){
  d.category='structured';d.method='splitplot';d.a=plan.levelsA;d.b=plan.levelsB;
  d.contextNote+=' Os níveis dos fatores foram copiados, mas o planejamento não registra qual fator atua na parcela principal. Confirme A na parcela e B na subparcela; se estiverem invertidos, troque os níveis e a ordem das médias. O resultado ficará independente, sem preencher automaticamente essa estrutura ainda incompleta.';
  return d;
 }
 if(plan.unitKind==='multilevel'||plan.unitKind==='equipment'||['sub','time','both','unknown'].includes(plan.measurement)){d.category='structured';d.contextNote+=' Esta estrutura exige conferir dependência e nível de aplicação. Não foi selecionado um cálculo de grupos independentes.';return d;}
 d.design=plan.environment==='blocks'?'blocks':'independent';
 if(plan.factorCount==='two'){d.category='structured';d.method=plan.cross==='yes'&&(plan.environment==='similar'||plan.environment==='blocks'&&plan.complete==='yes'&&(!plan.replicates||plan.replicates==='1'))?'factorial':'';d.a=plan.levelsA;d.b=plan.levelsB;}
 else if(plan.environment==='blocks'){d.category='structured';d.method=plan.complete==='yes'&&(!plan.replicates||plan.replicates==='1')?'blocks':'';d.groups=plan.levelsA;if(plan.factorCount==='one'&&plan.complete==='yes'&&Number(plan.replicates)>1){d.method='replicatedBlocks';d.unitsPerCell=plan.replicates;d.contextNote+=' A quantidade por tratamento e bloco foi copiada. Confirme se são aplicações separadas e escolha o modelo de blocos; essas informações não serão presumidas.';}}
 else if(Number(plan.levelsA)>=2){d.category='compare';d.groups=plan.levelsA;/* Response type is not encoded in the existing plan: user must choose. */}
 return d;
}
export function transferProposal(plan,result,snapshot){
 const fail=reason=>({ok:false,reason,changes:[]});
 if(!result||result.version!==VERSION)return fail('Calcule novamente com a versão atual antes de transferir.');
 if(snapshot!==fingerprint(plan))return fail('O planejamento mudou desde o cálculo. Use “Usar meu planejamento” e recalcule; o resultado anterior não será transferido.');
 if(plan.purpose!=='assigned')return fail('A transferência automática está disponível apenas para um experimento com condições atribuídas. O resultado pode ser consultado separadamente.');
 if(result.method==='splitplot')return fail('O planejamento atual ainda não registra os dois níveis de aplicação nem qual fator atua em cada um. Use os blocos, parcelas e subparcelas descritos no resultado para detalhar o projeto; não transferimos esse total para um único campo de repetições.');
 if(!['individual','group'].includes(plan.unitKind)||!plan.unit?.trim())return fail('Defina primeiro a unidade experimental no planejamento. Equipamentos e aplicações em vários níveis precisam de dimensionamento próprio.');
 if(plan.measurement&&plan.measurement!=='once')return fail('O planejamento contém subamostras, avaliações repetidas ou uma avaliação ainda indefinida. Não vamos converter observações vinculadas em repetições. Defina uma resposta por unidade e um modelo compatível antes de transferir.');
 const changes=[],r=result,method=r.method,input=r.inputs,initial=r.initialUnits[0].n;
 if(method==='replicatedBlocks'){
  if(plan.environment!=='blocks'||plan.complete!=='yes'||plan.factorCount!=='one'||Number(plan.levelsA)!==Number(input.groups))return fail('Este cálculo exige um fator, blocos completos e o mesmo número de tratamentos do planejamento.');
  changes.push({key:'blockCount',label:'Número de blocos',before:plan.blockCount,after:String(initial)},{key:'replicates',label:'Unidades tratadas separadamente por tratamento em cada bloco',before:plan.replicates,after:String(r.unitsPerCell)});
 }else if(isBlocked(input)){
  if(plan.environment!=='blocks'||plan.complete!=='yes'||plan.replicates&&Number(plan.replicates)!==1)return fail('Este cálculo requer DBC completo e uma unidade por tratamento ou combinação dentro de cada bloco.');
  if(method==='factorial'){
   if(plan.factorCount!=='two'||plan.cross!=='yes'||Number(plan.levelsA)!==Number(input.a)||Number(plan.levelsB)!==Number(input.b))return fail('O fatorial em blocos deve ter os mesmos níveis de A e B e todas as combinações em cada bloco.');
  }else if(plan.factorCount!=='one'||Number(plan.levelsA)!==Number(input.groups))return fail('Este cálculo requer DBC completo, um fator e o mesmo número de tratamentos.');
  changes.push({key:'blockCount',label:'Número de blocos',before:plan.blockCount,after:String(initial)},{key:'replicates',label:'Unidades de cada tratamento dentro de cada bloco',before:plan.replicates,after:'1'});
 }else{
  if(plan.environment!=='similar')return fail('Este cálculo sem blocos não pode preencher um planejamento com blocos ou ambiente indefinido.');
  if(method==='factorial'){
   if(plan.factorCount!=='two'||plan.cross!=='yes'||Number(plan.levelsA)!==Number(input.a)||Number(plan.levelsB)!==Number(input.b))return fail('O fatorial deve ter os mesmos níveis de A e B, todas as combinações e nenhum bloco.');
  }else if(['means','proportions','anova'].includes(method)||isComparison(method)){
   const groups=method==='anova'||isComparison(method)?Number(input.groups):2;
   if(plan.factorCount!=='one'||Number(plan.levelsA)!==groups)return fail('O número de tratamentos ou fatores do planejamento não corresponde ao cálculo.');
   if(['means','proportions'].includes(method)&&Number(input.ratio.replace(',','.'))!==1)return fail('A calculadora admite alocação desigual, mas o planejamento atual usa uma quantidade igual por tratamento. A transferência foi bloqueada.');
  }else return fail('O planejamento atual não representa diretamente este resultado. Pares, estimação, correlação, regressão e conglomerados permanecem como cálculos independentes.');
  changes.push({key:'replicates',label:method==='factorial'?'Unidades por combinação':'Unidades por tratamento',before:plan.replicates,after:String(initial)});
 }
 if(changes.some(c=>Number(c.after)>10000))return fail('O resultado ultrapassa o limite de 10.000 do campo do planejamento. Use o resumo separado; o valor não será truncado.');
 return {ok:true,changes,reason:`Será aplicada a quantidade inicial, já ajustada às perdas informadas. ${plan.unitKind==='group'?'Cada unidade calculada corresponde ao conjunto tratado, não aos indivíduos dentro dele. ':''}${!plan.measurement?'A forma de avaliação ainda não foi preenchida: confirme que o cálculo corresponde a uma resposta por unidade experimental. ':''}O cálculo pressupõe a estrutura e o tipo de resposta descritos no resultado.`,snapshot};
}
export function applyProposal(plan,result,snapshot,confirmed){const proposal=transferProposal(plan,result,snapshot);if(!confirmed)throw Error('Confirme a correspondência do cálculo com a resposta e a unidade experimental.');if(!proposal.ok)throw Error(proposal.reason);const next={...plan};for(const change of proposal.changes)next[change.key]=change.after;return next;}
