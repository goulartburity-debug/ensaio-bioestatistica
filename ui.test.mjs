import test from 'node:test';import assert from 'node:assert/strict';
const events={},storage=new Map(),nodes=new Map();const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',focus(){}});return nodes.get(key);};
globalThis.document={querySelector:node,querySelectorAll:()=>[],addEventListener:(t,h)=>events[t]=h};globalThis.window={scrollTo(){}};globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
await import('../app.mjs');const html=()=>node('#app').innerHTML;const click=(act,id)=>events.click({target:{closest:s=>s==='[data-act]'?{dataset:{act,id}}:null}});const choose=(key,value)=>events.click({target:{closest:s=>s==='[data-choice]'?{dataset:{choice:key,value}}:null}});const input=(key,value)=>events.input({target:{dataset:{key},value}});
test('Percurso DIC encadeado chega ao resultado sem blocos ou exportação',()=>{assert.match(html(),/<h1>CoDel-Stat<\/h1>/);click('new-plan');input('response','Altura em cm');choose('purpose','assigned');click('next');choose('factorCount','one');input('factorA','Adubação');input('levelsA','3');click('next');choose('unitKind','individual');input('unit','vaso');click('next');choose('environment','similar');click('next');assert.doesNotMatch(html(),/data-key="blockCount"/);input('replicates','4');click('next');choose('measurement','once');click('next');assert.match(html(),/Vou sortear entre as unidades/);assert.doesNotMatch(html(),/Vou sortear dentro/);choose('allocation','yes');click('next');assert.match(html(),/DIC —/);assert.match(html(),/12 unidades no total/);assert.doesNotMatch(html(),/data-act="(?:export|print|shuffle)/);assert.doesNotMatch(html(),/Significância \/ poder/);});
test('Exemplos fixos não alteram respostas nem mostram edição',()=>{const saved=storage.get('ensaio-guide-v2');click('examples');click('lesson','dbc');assert.match(html(),/48 observações/);assert.match(html(),/Bloco 3/);assert.doesNotMatch(html(),/data-key|data-choice/);assert.equal(storage.get('ensaio-guide-v2'),saved);click('wizard');assert.match(html(),/Resumo do planejamento/);});
test('Glossário ampliado e referências disponíveis',()=>{click('glossary');assert.match(html(),/Na prática:/);assert.match(html(),/Pseudorreplicação/);click('about');assert.match(html(),/Referências de apoio/);assert.match(html(),/doi.org/);});
test('Texto do usuário é escapado',()=>{input('question','<img src=x onerror=alert(1)>');click('result');assert.ok(!html().includes('<img src=x'));assert.match(html(),/&lt;img/);});
const analysisChoose=(key,value)=>events.click({target:{closest:s=>s==='[data-analysis-choice]'?{dataset:{analysisChoice:key,value}}:null}});
test('Módulo independente chega a Welch sem alterar o planejamento',()=>{const old=storage.get('ensaio-guide-v2');click('analysis-reset');assert.match(html(),/descobrir com os dados/);analysisChoose('goal','compare');click('analysis-next');analysisChoose('response','numeric');click('analysis-next');analysisChoose('structure','independent');click('analysis-next');analysisChoose('groups','two');click('analysis-next');analysisChoose('diagnostics','adequate');click('analysis-next');assert.match(html(),/Teste t de Welch/);assert.match(html(),/Referências para este caminho/);assert.doesNotMatch(html(),/data-act="(?:export|print|shuffle)/);assert.equal(storage.get('ensaio-guide-v2'),old);});
test('Ao trocar a estrutura, caminho pareado oferece t pareado e não Welch',()=>{click('analysis-review');click('analysis-next');click('analysis-next');analysisChoose('structure','linked');click('analysis-next');analysisChoose('groups','two');click('analysis-next');assert.match(html(),/diferenças dentro dos pares/);analysisChoose('diagnostics','adequate');click('analysis-next');assert.match(html(),/Teste t pareado/);assert.doesNotMatch(html(),/Teste t de Welch/);});
test('Respostas incompletas não viram recomendação definitiva',()=>{click('analysis-reset');click('analysis-result');assert.match(html(),/Escolhas pendentes/);assert.match(html(),/Ainda falta uma escolha/);});

test('Ajuda aberta continua aberta após escolher, sem abrir ajuda de outra pergunta',()=>{
 click('analysis-reset');
 let current={dataset:{helpId:'analysis-goal--'},open:true};
 const nextHelp={dataset:{helpId:'analysis-goal--'},open:false};
 document.querySelectorAll=selector=>selector.includes('[open]')?[current]:[nextHelp];
 analysisChoose('goal','compare');assert.equal(nextHelp.open,true);
 current=nextHelp;const different={dataset:{helpId:'analysis-response--'},open:false};
 document.querySelectorAll=selector=>selector.includes('[open]')?[current]:[different];
 click('analysis-next');assert.equal(different.open,false);
 document.querySelectorAll=()=>[];
});

test('Navegação principal expõe tamanho amostral sem exigir planejamento',()=>{
 click('sample');assert.match(html(),/Quantas unidades preciso/);assert.match(html(),/Calcular diretamente/);
 click('sample-direct');click('sample-category','estimate');click('sample-method','mean');
 assert.match(html(),/Margem de erro desejada/);assert.match(html(),/data-sample="sd"/);
 click('wizard');assert.match(html(),/Resumo do planejamento/);
});
