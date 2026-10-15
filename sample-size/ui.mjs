import {methods,pendingMethods,defaults,VERSION} from './methods.mjs';
import {calculate} from './engine.mjs';
import {fromPlan,fingerprint,transferProposal,applyProposal} from './integration.mjs';
import {guidance,examples} from './guidance.mjs';
import {isComparison,isBlocked} from './comparisons.mjs';
import {runCalculation,runScenarios} from './calculation-jobs.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>typeof v==='number'?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:5}).format(v):esc(v);
const button=(label,action,primary=false,extra='')=>`<button type="button" class="btn${primary?' primary':''}" data-act="sample-${action}" ${extra}>${label}</button>`;
const panel=(title,body)=>`<section class="result-panel"><h3>${title}</h3>${body}</section>`;
const disclosure=(id,title,body)=>`<details class="sample-details" data-help-id="sample-${id}"><summary>${title}</summary><div class="sample-details-body">${body}</div></details>`;
const precision=['mean','proportion','cluster'];
const countText=s=>s.method==='factorial'&&isBlocked(s)?'Conte blocos completos, cada um com uma unidade de todas as combinações dos dois fatores.':guidance[s.method].count;
const categories=[
 ['estimate','Estimar uma média ou porcentagem','Ex.: descobrir a altura média ou a porcentagem de germinação.'],
 ['compare','Comparar tratamentos ou condições','Ex.: comparar adubações ou medidas antes e depois.'],
 ['relate','Investigar uma relação','Ex.: estudar a relação entre altura e massa das plantas.'],
 ['structured','Calcular para uma estrutura específica','Experimentos em blocos, dois fatores ou amostras em conjuntos.']
];

function field(s,k,label,help,placeholder='',type='number'){
 const input=type==='area'?`<textarea id="ss-${k}" data-sample="${k}" aria-describedby="ss-help-${k}" rows="3" placeholder="${esc(placeholder)}">${esc(s[k])}</textarea>`:`<input id="ss-${k}" data-sample="${k}" type="text" ${type==='number'?'inputmode="decimal"':''} value="${esc(s[k])}" placeholder="${esc(placeholder)}" aria-describedby="ss-help-${k}" autocomplete="off">`;
 return `<div class="field sample-field"><label for="ss-${k}">${label}</label>${input}<p id="ss-help-${k}" class="sample-hint">${help}</p></div>`;
}
function select(s,k,label,options,help=''){
 return `<div class="field sample-field"><label for="ss-${k}">${label}</label><select id="ss-${k}" data-sample="${k}"${help?` aria-describedby="ss-help-${k}"`:''}>${options.map(([v,t])=>`<option value="${v}" ${s[k]===v?'selected':''}>${t}</option>`).join('')}</select>${help?`<p class="sample-hint" id="ss-help-${k}">${help}</p>`:''}</div>`;
}
function parameters(s){
 const m=s.method;let h='';
 if(m==='factorial'||isComparison(m))h+=select(s,'design','Como os tratamentos serão organizados?',[['independent','Sem blocos: unidades independentes'],['blocks','Em blocos completos']],'Em blocos, cada bloco terá uma unidade de cada tratamento ou combinação.');
 if(isComparison(m)){
  h+=field(s,'groups',m==='dunnett'?'Quantos tratamentos, contando a testemunha?':'Quantos tratamentos haverá no estudo?','Todos terão a mesma quantidade de unidades. Nesta rota, de 2 a 10 tratamentos.','Ex.: 4');
  if(m==='contrast'){
   h+=select(s,'contrastType','Qual comparação você definiu antes da coleta?',[['control-average','A testemunha (T1) com a média dos demais'],['pair','Dois tratamentos específicos'],['custom','Uma combinação definida por pesos']]);
   if(s.contrastType==='pair')h+=`<div class="form-row">${field(s,'contrastFirst','Primeiro tratamento','Use o número do tratamento na sua lista.','Ex.: 1')}${field(s,'contrastSecond','Segundo tratamento','Precisa ser diferente do primeiro.','Ex.: 2')}</div>`;
   if(s.contrastType==='custom')h+=field(s,'weights','Pesos do contraste, na ordem dos tratamentos','Devem somar zero. Ex.: −1; 0,5; 0,5 compara a média de T2 e T3 com T1. Use o sinal de menos do teclado ao preencher.','Ex.: -1; 0,5; 0,5','area');
  }
  if(s.differenceMode==='absolute')h+=field(s,'delta',m==='contrast'?'Diferença relevante para a comparação planejada':'Diferença mínima relevante entre duas médias','Informe o tamanho da diferença, em unidades reais. Ex.: 5 cm, em qualquer direção.','Ex.: 5');
  h+=disclosure('relative-difference-'+m,s.differenceMode==='percent'?'Entrada atual: diferença percentual relativa':'Quero informar essa diferença em porcentagem',select(s,'differenceMode','Como informar a diferença?',[['absolute','Em unidades reais, como cm ou gramas'],['percent','Em porcentagem de uma média de referência']],'Diferença relativa não é margem de erro nem pontos percentuais.')+(s.differenceMode==='percent'?field(s,'referenceMean','Média de referência, maior que zero','Ex.: altura de 20 cm. Não é tamanho da população.','Ex.: 20')+field(s,'deltaPercent','Diferença relativa (%)','Ex.: 25% de uma referência de 20 cm corresponde a 5 cm. Esta não é uma rota para porcentagens de mortalidade.','Ex.: 25'):''));
  h+=field(s,'sd',isBlocked(s)?'Desvio-padrão residual após considerar os blocos':'Desvio-padrão residual esperado',isBlocked(s)?'Use a variação que permanece após considerar tratamentos e blocos.':'Variação entre unidades do mesmo tratamento. Não informe o erro-padrão da média.','Ex.: 8');
 }
 if(['means','paired','anova','blocks','factorial'].includes(m))h+=disclosure(`effect-entry-${m}`,s.scale==='standard'?'Entrada atual: tamanho de efeito padronizado':'Já tenho um tamanho de efeito padronizado',select(s,'scale','Como informar o efeito?',[['real','Em unidades reais, como centímetros'],['standard','Com um tamanho de efeito padronizado']],'Use a opção padronizada se esse valor já estiver definido para o modelo do seu estudo.'));
 if(['means','paired'].includes(m)){
  if(s.scale==='standard')h+=field(s,'d',m==='paired'?'Tamanho de efeito dz':'Tamanho de efeito d',m==='paired'?'Diferença dividida pelo desvio-padrão das diferenças dentro dos pares.':'Diferença entre médias dividida pelo desvio-padrão comum. Pressupõe variâncias iguais.','Ex.: 0,5');
  else{
   h+=field(s,'delta','Diferença mínima relevante','Qual mudança vale a pena detectar? Ex.: 5 cm de aumento. Para redução, use −5. A diferença é condição 2 menos condição 1.','Ex.: 5');
   if(m==='paired')h+=select(s,'pairScale','Qual informação de variação você tem?',[['difference','Desvio-padrão das mudanças dentro dos pares'],['correlation','Desvios-padrão das duas medidas e correlação']]);
   if(m==='paired'&&s.pairScale==='difference')h+=field(s,'sd','Desvio-padrão das diferenças','Primeiro calcule a mudança em cada par. Este valor descreve quanto essas mudanças variam entre os pares.','Ex.: 8');
   else{
    h+=`<div class="form-row">${field(s,'sd1',m==='paired'?'Desvio-padrão da primeira medida':'Desvio-padrão no grupo 1','Variação entre unidades. Use a mesma unidade da diferença, como cm.','Ex.: 8')}${field(s,'sd2',m==='paired'?'Desvio-padrão da segunda medida':'Desvio-padrão no grupo 2','Pode ser igual ao primeiro, se houver base para essa suposição.','Ex.: 8')}</div>`;
    if(m==='paired')h+=field(s,'rho','Correlação entre as duas medidas','Quanto as medidas do mesmo par se relacionam. Procure esse valor em dados anteriores ou em um piloto.','Ex.: 0,5');
   }
  }
 }
 if(m==='mean')h+=field(s,'sd','Desvio-padrão esperado','Indica quanto os valores variam entre as unidades. Ex.: altura com desvio-padrão de 8 cm.','Ex.: 8');
 if(['proportion','cluster'].includes(m)){
  h+=field(s,'p','Porcentagem esperada (%)','Ex.: 60 significa que você espera encontrar a característica em 60% das unidades.','Ex.: 50');
  h+=disclosure(`unknown-percentage-${m}`,'Não tenho uma porcentagem de referência',`<p>Você pode usar 50%. Nessa aproximação, esse valor exige a maior amostra para a mesma margem e confiança. É um cenário de planejamento, não uma estimativa da sua população.</p>${button('Usar o cenário de 50%','conservative')}`);
 }
 if(precision.includes(m))h+=field(s,'margin',m==='mean'?'Margem de erro desejada':'Margem de erro em pontos percentuais',m==='mean'?'Ex.: margem de 2 cm significa estimar a média com cerca de 2 cm para mais ou para menos.':'Ex.: 50% com margem de 5 pontos corresponde a aproximadamente 45%–55%.','Ex.: '+(m==='mean'?'2':'5'));
 if(m==='proportions')h+=`<div class="form-row">${field(s,'p1','Porcentagem esperada no grupo 1 (%)','Ex.: 60% de germinação no tratamento de referência.','Ex.: 60')}${field(s,'p2','Porcentagem esperada no grupo 2 (%)','Ex.: 75% de germinação com o outro tratamento.','Ex.: 75')}</div>`;
 if(['anova','blocks'].includes(m))h+=field(s,'groups','Quantos tratamentos serão comparados?',m==='blocks'?'Cada bloco terá uma unidade de cada tratamento.':'Ex.: três tipos de adubação, com a mesma quantidade de unidades em cada um.','Ex.: 3');
 if(m==='factorial')h+=`<div class="form-row">${field(s,'a','Quantas opções no fator A?','Ex.: duas variedades.','Ex.: 2')}${field(s,'b','Quantas opções no fator B?','Ex.: três adubações.','Ex.: 3')}</div>`+select(s,'effect','O que você quer investigar principalmente?',[['A','O efeito do fator A'],['B','O efeito do fator B'],['AB','Se o efeito de um fator depende do outro (interação)']],'Ex.: uma adubação pode funcionar melhor em uma variedade do que em outra.');
 if(['anova','factorial','blocks'].includes(m)){
  if(s.scale==='standard')h+=field(s,'f','Tamanho de efeito f','Use o f do efeito escolhido. No fatorial, o f da interação pode ser diferente do f dos efeitos principais.','Ex.: 0,25');
  else h+=field(s,'means',m==='factorial'?'Médias esperadas das combinações':'Médias esperadas dos tratamentos',m==='factorial'?'Separe por ponto e vírgula: primeiro todas as combinações de A1 com B, depois A2 com B. Ex.: A1B1; A1B2; A2B1; A2B2.':'Uma média por tratamento, separada por ponto e vírgula. Ex.: 10; 12; 15 cm.','Ex.: '+(m==='factorial'?'10; 12; 14; 10; 14; 18':'10; 12; 15'),'area')+field(s,'sd',isBlocked(s)?'Desvio-padrão residual após considerar os blocos':'Desvio-padrão residual esperado',isBlocked(s)?'Variação que sobra depois de considerar tratamentos e blocos. Procure o valor em um estudo semelhante ou piloto.':'Variação entre unidades que recebem a mesma condição. Não é o desvio-padrão das médias acima.','Ex.: '+(m==='anova'?'8':'4'));
 }
 if(m==='correlation')h+=field(s,'r','Correlação que interessa detectar','Ex.: 0,3 para associação positiva ou −0,3 para negativa. O cálculo compara esse valor com correlação zero.','Ex.: 0,3');
 if(m==='regression'){
  h+=`<div class="form-row">${field(s,'predictors','Quantos coeficientes explicativos haverá?','Não conte a constante do modelo. Uma variável numérica costuma usar um coeficiente; um fator com três categorias usa dois.','Ex.: 3')}${field(s,'tested','Quantos deles você quer testar?','Para avaliar o conjunto inteiro, repita a quantidade ao lado. Para uma parte, conte apenas os coeficientes dessa parte.','Ex.: 2')}</div>`+select(s,'effectMode','Que informação de estudos anteriores você tem?',[['r2','Quanto cada modelo explica (R²)'],['f2','Um tamanho de efeito f² já definido']]);
  if(s.effectMode==='f2')h+=field(s,'f2','Tamanho de efeito f²','Mede a contribuição do conjunto testado. Não é o mesmo valor que f ou R².','Ex.: 0,15');
  else h+=`<div class="form-row">${field(s,'r2full','R² esperado com todos os coeficientes','Ex.: 0,25 corresponde a 25% da variação explicada.','Ex.: 0,25')}${field(s,'r2reduced','R² esperado sem os coeficientes testados','Se você vai testar todos, informe 0. Caso contrário, use o R² do modelo que mantém apenas os demais.','Ex.: 0,10')}</div>`;
 }
 if(m==='cluster')h+=`<div class="form-row">${field(s,'clusterSize','Indivíduos por conjunto','O mesmo número de indivíduos em cada turma, lote ou parcela.','Ex.: 20')}${field(s,'icc','Semelhança dentro dos conjuntos (ICC)','De 0 a 0,99. Procure uma estimativa para a mesma resposta em estudos semelhantes.','Ex.: 0,05')}</div>`;
 return h;
}

function settingsSummary(s){
 const estimate=precision.includes(s.method);
 const headline=estimate?`Confiança: ${esc(s.confidence)}%`:`Poder: ${esc(s.power)}% · Significância: ${esc(s.alpha)}%`;
 const special=[];
 if(isComparison(s.method)&&Number(s.minResidualDf)>0)special.push(`mínimo adicional de GL: ${esc(s.minResidualDf)}`);
 if(!estimate&&s.comparisons!=='1')special.push(`${esc(s.comparisons)} hipóteses`);
 if(['means','proportions'].includes(s.method)&&s.ratio!=='1')special.push(`alocação ${esc(s.ratio)}:1`);
 if(['means','paired','proportions','correlation'].includes(s.method)&&s.sides!=='two')special.push('hipótese unilateral');
 if(['mean','proportion'].includes(s.method)&&s.population==='finite')special.push(`população finita: ${esc(s.populationN)}`);
 return `<span>${headline} · Perdas: ${esc(s.loss)}%</span>${special.length?`<small>${special.join(' · ')}</small>`:''}`;
}
function settings(s){
 const estimate=precision.includes(s.method);
 let h='<p>Os valores iniciais são usuais e podem ser alterados abaixo. Eles não estimam a diferença ou a variabilidade do seu estudo.</p>';
 if(estimate)h+=field(s,'confidence','Nível de confiança (%)','95% descreve a cobertura dos intervalos em repetições da amostragem pelo mesmo procedimento.','95');
 else h+=`<div class="form-row">${field(s,'power','Poder estatístico desejado (%)','Se o efeito informado existir, é a chance planejada de detectá-lo. O valor inicial é 80%.','80')}${field(s,'alpha','Nível de significância da família (%)','Limite planejado para falsos positivos. O valor inicial é 5%.','5')}</div>`;
 if(['means','paired','proportions','correlation'].includes(s.method))h+=select(s,'sides','Em quais direções você quer detectar o efeito?',[['two','Aumento ou redução (bilateral)'],['greater','Apenas aumento / associação positiva'],['less','Apenas redução / associação negativa']],'Defina antes da coleta. Em comparações, a diferença é condição 2 menos condição 1.');
 if(['means','proportions'].includes(s.method))h+=field(s,'ratio','Tamanho do grupo 2 em relação ao grupo 1','1 significa grupos iguais. Com 2, haverá cerca de duas unidades no grupo 2 para cada uma no grupo 1.','1');
 if(['mean','proportion'].includes(s.method)){
  h+=select(s,'population','A população tem um tamanho conhecido?',[['large','Não definido ou suficientemente grande'],['finite','Sim, e haverá sorteio sem reposição']],'A correção vale para amostragem aleatória simples. Não é uma redução por haver poucos vasos ou recursos disponíveis.');
  if(s.population==='finite')h+=field(s,'populationN','Quantidade total na população','Ex.: os 500 estudantes que formam a população do levantamento.','Ex.: 500');
 }
 if(!estimate&&!['dunnett','tukey'].includes(s.method))h+=field(s,'comparisons','Quantas hipóteses fazem parte da mesma família?','O inicial é 1. Acima disso, usamos Bonferroni. O poder é da hipótese escolhida, não o poder para detectar todos os efeitos.','1');
 if(['dunnett','tukey'].includes(s.method))h+='<p>O ajuste de comparações múltiplas já está incluído. O poder é por comparação com o efeito informado; esta versão não calcula poder para detectar todas as diferenças ou pelo menos uma.</p>';
 if(isComparison(s.method))h+=disclosure('residual-constraint','Meu protocolo exige um mínimo de graus de liberdade',field(s,'minResidualDf','Mínimo adicional de GL residuais (opcional)','0 não impõe mínimo. Use outro valor apenas com justificativa para o seu estudo. Não existe aqui um corte universal de validade.','0'));
 h+=field(s,'loss','Perdas previstas (%)',isBlocked(s)?'Aqui o ajuste prevê perda de blocos inteiros, mantendo todos os tratamentos em cada bloco.':s.method==='cluster'?'Aqui o ajuste prevê perda de conjuntos inteiros. O número de indivíduos por conjunto continua sendo o analisável.':s.method==='paired'?'Preveja pares que ficarão incompletos. O ajuste amplia a quantidade inicial de pares.':'Ex.: 10 significa prever que 10% das unidades incluídas não poderão ser analisadas.','0');
 return `<div class="sample-defaults" id="sample-settings-live">${settingsSummary(s)}</div>${disclosure('settings-'+s.method,estimate?'Ajustar confiança, perdas e outras opções':'Ajustar poder, significância, perdas e outras opções',h)}`;
}

function scenarios(s,rows=null,busy=false){
 if(isComparison(s.method))return disclosure('scenarios','E se eu mudar a diferença relevante?',`<p>Comparamos diferenças 20% menores e maiores, mantendo os outros valores iguais. Os cenários não alteram seu planejamento.</p>${rows?`<div class="sample-table-wrap"><table class="sample-table"><thead><tr><th>Diferença ${s.differenceMode==='percent'?'relativa (%)':''}</th><th>Quantidade analisável</th><th>Total de unidades</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${fmt(row.value)}</td>${row.error?`<td colspan="2">${esc(row.error)}</td>`:`<td>${row.result.units.map(u=>`${fmt(u.n)} ${esc(u.label.toLowerCase())}`).join('; ')}</td><td>${fmt(row.result.total)}</td>`}</tr>`).join('')}</tbody></table></div>`:button('Comparar estes cenários','scenarios',false,busy?'disabled':'')}`);

 let key,label;
 if(precision.includes(s.method)){key='margin';label='Margem de erro';}
 else if(['means','paired'].includes(s.method)){key=s.scale==='standard'?'d':'delta';label='Diferença / efeito';}
 else if(['anova','factorial','blocks'].includes(s.method)){key=s.scale==='standard'?'f':'sd';label=key==='sd'?'Desvio-padrão residual':'Efeito f';}
 else if(s.method==='correlation'){key='r';label='Correlação';}
 else{key='power';label='Poder (%)';}
 const base=Number(String(s[key]).replace(',','.'));if(!Number.isFinite(base))return '';
 const variants=key==='power'?[base-5,base,base+5]:[base*.8,base,base*1.2];
 return disclosure('scenarios','E se eu mudar esse valor?',`<p>Variamos apenas ${esc(label.toLowerCase())}. As outras informações continuam iguais.</p><div class="sample-table-wrap"><table class="sample-table"><thead><tr><th>${label}</th><th>Quantidade analisável</th><th>Total</th></tr></thead><tbody>${variants.map(v=>{try{const r=calculate({...s,[key]:String(v)});return `<tr><td>${fmt(v)}${v===base?' (atual)':''}</td><td>${r.units.map(u=>`${fmt(u.n)} ${esc(u.label.toLowerCase())}`).join('; ')}</td><td>${fmt(r.total)}${s.method==='paired'?' pares':s.method==='cluster'?' observações':''}</td></tr>`;}catch(error){return `<tr><td>${fmt(v)}</td><td colspan="2">${esc(error.message)}</td></tr>`;}}).join('')}</tbody></table></div>`);
}
function resultView(r,s,plan,snapshot,preview,scenarioRows=null,busy=false){
 if(!r)return '';
 const proposal=transferProposal(plan,r,snapshot);
 const quantity=units=>units.map(u=>`${fmt(u.n)} ${esc(u.label.toLowerCase())}`).join(' + ');
 const loss=Number(s.loss.replace(',','.'));
 const warnings=r.warnings.filter(w=>w!==methods[r.method].limits);
 const lossNote=loss>0?`<div class="sample-loss-result"><h3>Para começar, prevendo ${fmt(loss)}% de perdas</h3><p><strong>${quantity(r.initialUnits)}</strong>${(['anova','factorial','blocks'].includes(r.method)||isComparison(r.method))?` · ${fmt(r.initialTotal)} unidades no total`:''}.</p><p>Esse é o tamanho inicial. A quantidade acima precisa permanecer analisável ao final.</p></div>`:'';
 const integration=proposal.ok?`<section class="sample-integration"><h3>Usar no meu planejamento</h3><p>${esc(proposal.reason)}</p>${preview?`<div class="sample-table-wrap"><table class="sample-table"><thead><tr><th>Campo</th><th>Atual</th><th>Após aplicar</th></tr></thead><tbody>${proposal.changes.map(c=>`<tr><td>${esc(c.label)}</td><td>${esc(c.before||'Não preenchido')}</td><td>${esc(c.after)}</td></tr>`).join('')}</tbody></table></div><label class="sample-check"><input type="checkbox" id="sample-confirm"> Confirmo que a resposta, o modelo e a unidade do meu planejamento correspondem a este cálculo.</label>${button('Confirmar e aplicar ao planejamento','apply',true)}`:button('Revisar o que será atualizado','preview',true)}</section>`:disclosure('integration','Sobre a ligação com meu planejamento',`<p>${esc(proposal.reason)}</p>`);
 return `<section class="sample-result" aria-label="Resultado do tamanho amostral"><div class="result-lead"><span class="pill">Quantidade necessária · ${r.type.startsWith('Exato')?'cálculo sob o modelo informado':'aproximação'}</span><h2>${quantity(r.units)}</h2><p>${esc(r.composition||`Total: ${fmt(r.total)} unidades.`)}</p></div><p class="sample-interpretation">Essa é a quantidade analisável calculada com os valores que você informou. ${esc(countText(s))}</p>${r.powerMeaning?`<p class="sample-power-meaning">${esc(r.powerMeaning)}</p>`:''}${lossNote}${warnings.length?`<div class="sample-warning" role="note"><strong>Atenção para este resultado</strong><ul>${warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}${integration}${scenarios(s,scenarioRows,busy)}${disclosure('calculation-details','Conferir o cálculo e os cuidados',`<h3>${esc(methods[r.method].name)}</h3><p>${esc(r.type)}.</p>${r.power!==null?`<p>Poder na composição analisável: <strong>${fmt(r.power*100)}%</strong>.</p>`:'<p>O poder não é recalculado após o arredondamento nesta aproximação.</p>'}<dl class="sample-params">${Object.entries(r.params).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${fmt(v)}</dd></div>`).join('')}</dl><p>${esc(methods[r.method].limits)}</p><p>O ajuste para perdas divide a quantidade necessária por 1 menos a proporção de perdas e arredonda para cima, no nível adequado ao delineamento.</p><p>Essa quantidade não garante representatividade, resultado significativo ou validade do estudo.</p>`)}${disclosure('sources','Referência e origem do cálculo',`<p>${esc(r.source)}</p><p>${esc(r.ref)}</p><a class="source-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Consultar referência ↗</a><a href="docs/CODIGO-ABERTO.md" target="_blank" rel="noopener noreferrer">Código aberto e licenças</a><p class="sample-hint">Versão do cálculo: ${VERSION}.</p>`)}</section>`;
}
function coverage(){return disclosure('coverage','Não encontrei meu tipo de estudo',`<p>Estas situações ainda precisam de um cálculo próprio no Ensaio.</p>${pendingMethods.map(([t,d])=>`<div class="sample-pending"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join('')}`);}

export function createSampleModule({getPlan,setPlan,render,navigate,compute=runCalculation,computeScenarios=runScenarios}){
 let s=defaults(),result=null,snapshot='',error='',notice='',preview=false,seed=null,scenarioRows=null,busy=false,jobNumber=0;
 try{
  const saved=JSON.parse(localStorage.getItem('ensaio-sample-v1')||'null');
  if([VERSION,'1.0.0'].includes(saved?.version)&&saved.inputs){for(const k of Object.keys(defaults()))if(typeof saved.inputs[k]==='string')s[k]=saved.inputs[k].slice(0,3000);s.stage='start';notice='Seus valores anteriores estão salvos. Recalcule para obter um resultado atualizado.';}
  else if(saved)notice='A versão do cálculo mudou. Recalcule antes de usar um resultado anterior.';
 }catch{}
 const persist=()=>{try{localStorage.setItem('ensaio-sample-v1',JSON.stringify({version:VERSION,inputs:s}));}catch{}};
 function usePlan(){seed=fromPlan(getPlan());notice='Confira quais informações serão trazidas para a calculadora.';s.stage='start';navigate('sample');}
 function renderView(){
  const heading=`<div class="page-heading sample-heading"><div><p class="eyebrow">Antes da coleta · tamanho amostral</p><h1>Quantas unidades preciso?</h1><p>${s.stage==='form'?'Informe o que espera encontrar. A quantidade será calculada para esse objetivo.':'Comece pelo que você quer descobrir na pesquisa.'}</p></div>${s.stage!=='start'?button('Trocar objetivo','home'):''}</div>`;
  const banners=`${notice?`<div class="example-note" role="status">${esc(notice)}</div>`:''}${error?`<p class="errors" role="alert" id="sample-error" tabindex="-1">${esc(error)}</p>`:''}`;
  if(s.stage==='start')return `<div class="sample-page">${heading}${banners}${seed?panel('Informações que serão aproveitadas',`<p>${esc(seed.contextNote)}</p><p>${seed.method?esc(methods[seed.method].name):'Você escolherá o tipo de resposta'}${seed.groups?` · ${esc(seed.groups)} tratamentos`:''}${seed.a?` · ${esc(seed.a)} opções em A e ${esc(seed.b)} em B`:''}.</p><p>Os valores de efeito e variabilidade ainda precisarão ser informados. O planejamento só muda se você aplicar um resultado.</p><div class="result-actions">${button('Confirmar e usar esta estrutura','seed',true)}${button('Cancelar','cancel-seed')}</div>`):''}<div class="sample-entry-grid">${panel('Calcular diretamente','<p>Escolha seu objetivo, mesmo sem ter preenchido um planejamento.</p>'+button('Escolher meu objetivo','direct',true))}${panel('Usar meu planejamento','<p>Aproveite a estrutura que já registrou e complete os valores que faltam.</p>'+button('Revisar meu planejamento','plan'))}</div>${Object.hasOwn(methods,s.method)?`<p class="sample-resume">${button('Retomar meus valores','resume')}</p>`:''}${coverage()}</div>`;
  if(s.stage==='choose')return `<div class="sample-page">${heading}${banners}<div class="sample-category-grid">${categories.map(([id,title,desc])=>`<button type="button" class="entry-card ${s.category===id?'sample-active':''}" data-act="sample-category" data-id="${id}" aria-pressed="${s.category===id}"><h3>${title}</h3><p>${desc}</p></button>`).join('')}</div>${s.category?`<section class="result-panel"><h2>Qual situação descreve sua pergunta?</h2><div class="choices">${Object.entries(methods).filter(([,m])=>m.category===s.category).map(([id,m])=>`<button type="button" class="choice" data-act="sample-method" data-id="${id}"><span><strong>${esc(m.name)}</strong><small>${esc(guidance[id].question)}</small></span></button>`).join('')}</div></section>`:''}${coverage()}</div>`;
  const meta=Object.hasOwn(methods,s.method)?methods[s.method]:null;if(!meta){s.stage='choose';return renderView();}
  const help=guidance[s.method];
  return `<div class="sample-page sample-form-page">${heading}${banners}${s.contextNote?`<div class="example-note">${esc(s.contextNote)}</div>`:''}<section class="question-card sample-form-card" aria-labelledby="sample-form-title"><div class="sample-form-intro"><p class="eyebrow">Seu objetivo</p><h2 id="sample-form-title">${esc(meta.name)}</h2><p>${esc(help.idea)}</p>${isComparison(s.method)?'<p class="sample-hint">O poder será calculado por comparação, e não para detectar todas as diferenças ao mesmo tempo.</p>':''}</div>${disclosure('example-'+s.method,'Ver um exemplo antes de preencher',`<p>${esc(help.question)}</p><p>${esc(help.example)}</p><p>Valores fictícios para aprender; não são uma recomendação para sua pesquisa.</p>${button('Preencher com estes valores fictícios','example')}`)}${parameters(s)}${disclosure('unknown-'+s.method,'Como conseguir os valores pedidos?',`<p>${esc(help.find)}</p>${['mean','means','paired','anova','blocks','factorial'].includes(s.method)?'<p>Desvio-padrão e erro-padrão são diferentes. Se uma publicação informa erro-padrão de uma média simples e o número de unidades independentes, o desvio-padrão pode ser obtido por EP × √n. Essa conversão não vale automaticamente para erros-padrão de modelos ajustados.</p>':''}<p>${esc(help.care)}</p><p>Se ainda houver incerteza, use valores plausíveis de literatura ou piloto e compare cenários após calcular. Não escolha os valores apenas para conseguir uma amostra menor.</p>`)}<div class="sample-count-note"><strong>O que entra na contagem?</strong><p>${s.unitName?`No seu planejamento: <strong>${esc(s.unitName)}</strong>. `:''}${esc(countText(s))}</p></div>${settings(s)}<div class="sample-submit">${button(busy?'Calculando…':'Calcular tamanho amostral','calculate',true,busy?'disabled aria-busy="true"':'')}<p class="sample-hint">Os valores são hipóteses de planejamento. O resultado aparece abaixo.</p></div></section><div id="sample-results">${resultView(result,s,getPlan(),snapshot,preview,scenarioRows,busy)}</div></div>`;
 }
 async function click(e){
  const el=e.target.closest('[data-act]');if(!el||!el.dataset.act.startsWith('sample-'))return false;
  const a=el.dataset.act.slice(7),request=++jobNumber;error='';notice='';busy=false;
  if(a==='plan'){usePlan();return true;}
  if(a==='home'){s.stage='start';seed=null;}
  if(a==='resume'&&Object.hasOwn(methods,s.method)){s.stage='form';result=null;scenarioRows=null;preview=false;notice='Valores recuperados. Recalcule antes de usar a quantidade.';}
  if(a==='cancel-seed')seed=null;
  if(a==='seed'&&seed){s=seed;s.stage=s.method?'form':'choose';seed=null;result=null;preview=false;}
  if(a==='direct'){s.stage='choose';seed=null;}
  if(a==='category'){s.category=el.dataset.id;s.stage='choose';}
  if(a==='method'){
   if(!Object.hasOwn(methods,el.dataset.id))return true;
   const {contextNote,unitName,groups,a,b,design}=s;
   s={...defaults(),contextNote,unitName,groups,a,b,design,method:el.dataset.id,category:methods[el.dataset.id].category,stage:'form'};
   result=null;preview=false;
  }
  if(a==='example'){const {method}=s;s={...defaults(),method,category:methods[method].category,stage:'form',...examples[method]};result=null;preview=false;notice='Exemplo fictício preenchido. Troque os valores antes de planejar sua pesquisa.';}
  if(a==='conservative'&&['proportion','cluster'].includes(s.method)){s.p='50';result=null;preview=false;notice='Cenário de 50% escolhido. Você ainda pode alterar essa porcentagem.';}
  if(a==='calculate'||a==='scenarios'){
   const inputs={...s},inputState=JSON.stringify(s),planState=fingerprint(getPlan());
   busy=true;if(a==='calculate'){result=null;scenarioRows=null;preview=false;}
   render();
   try{
    const value=await (a==='scenarios'?computeScenarios(inputs):compute(inputs));
    if(request!==jobNumber||JSON.stringify(s)!==inputState)return true;
    if(a==='scenarios')scenarioRows=value;else{result=value;snapshot=planState;}
   }catch(err){if(request!==jobNumber)return true;if(a==='calculate')result=null;error=err.message;}
   busy=false;
  }
  if(a==='preview')preview=true;
  if(a==='apply'){
   try{
    const next=applyProposal(getPlan(),result,snapshot,document.querySelector('#sample-confirm')?.checked===true);setPlan(next);
    try{localStorage.setItem('ensaio-sample-applied-v1',JSON.stringify({version:VERSION,method:result.method,params:result.params,result,planFingerprint:fingerprint(next),appliedAt:new Date().toISOString()}));}catch{}
    notice='Quantidade aplicada após sua confirmação.';preview=false;snapshot=fingerprint(next);navigate('wizard');return true;
   }catch(err){error=err.message;}
  }
  persist();render();
  if(error)document.querySelector('#sample-error')?.focus();else if(a==='calculate')document.querySelector('#sample-results')?.scrollIntoView?.({behavior:'smooth',block:'start'});
  return true;
 }
 function input(e){
  const k=e.target.dataset?.sample;if(!k||!Object.hasOwn(defaults(),k))return false;
  const wasBusy=busy;jobNumber++;busy=false;scenarioRows=null;s[k]=e.target.value.slice(0,3000);result=null;preview=false;error='';notice='';persist();
  if(e.target.tagName==='SELECT'||wasBusy){render();document.querySelector(`#ss-${k}`)?.focus();}
  else{
   const target=document.querySelector('#sample-results');if(target)target.innerHTML='<p class="sample-edit-note" role="status">Parâmetros alterados. Calcule novamente para atualizar o resultado.</p>';
   const settingText=document.querySelector('#sample-settings-live');if(settingText)settingText.innerHTML=settingsSummary(s);
  }
  return true;
 }
 function audit(){try{const a=JSON.parse(localStorage.getItem('ensaio-sample-applied-v1')||'null');if(!a)return '';return `<p class="sample-audit">${a.version===VERSION&&a.planFingerprint===fingerprint(getPlan())?'Quantidade aplicada pela calculadora. Parâmetros e versão foram registrados neste navegador.':'O planejamento ou a versão do cálculo mudou. Recalcule antes de reutilizar a quantidade.'}</p>`;}catch{return '';}}
 return {render:renderView,click,input,usePlan,audit};
}
