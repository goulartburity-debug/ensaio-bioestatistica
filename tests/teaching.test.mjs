import test from 'node:test';
import assert from 'node:assert/strict';
import {teachingBefore,teachingAfter} from '../teaching.mjs';
import {analysisWizard} from '../analysis-ui.mjs';
import {emptyAnalysis,analysisKeys} from '../analysis.mjs';
test('A ajuda do pareado examina diferenças e a dos blocos preserva o modelo',()=>{
 const paired=teachingBefore('analysis','diagnostics',{structure:'linked',groups:'two'});
 assert.match(paired,/\+3 e \+1/);assert.match(paired,/diferenças, não a de cada coluna/);
 const blocked=teachingBefore('analysis','diagnostics',{structure:'blocks'});
 assert.match(blocked,/modelo com tratamento e bloco/);
 assert.doesNotMatch(blocked,/Ana passou/);
});
test('A ajuda muda com a pergunta, sem tratar observação como aplicação de tratamento',()=>{
 const existing=teachingBefore('plan','unit',{purpose:'existing'});
 assert.match(existing,/não vai atribuir tratamentos/);
 assert.doesNotMatch(existing,/menor parte do estudo que pode receber/);
 const qty=teachingBefore('plan','quantity',{environment:'blocks'});
 assert.match(qty,/campo abaixo recebe 1/);assert.match(qty,/9 vasos/);
 const related=teachingBefore('analysis','structure',{goal:'relate'});
 assert.match(related,/par de variáveis/);assert.doesNotMatch(related,/gera dez pares/);
});
test('Diagnóstico desconhecido explica continuação provisória junto à escolha',()=>{
 const s={...emptyAnalysis(),goal:'compare',response:'numeric',structure:'independent',groups:'two',diagnostics:'unknown'};
 const html=analysisWizard(s,analysisKeys(s).indexOf('diagnostics'));
 assert.match(html,/Um exemplo para decidir/);assert.match(html,/Entender melhor esta escolha/);
 assert.match(html,/Você receberá um caminho provisório/);assert.match(html,/role="status"/);
});
test('Nenhum texto ou atributo da ajuda permite injetar HTML com estado persistido',()=>{
 const html=teachingBefore('analysis','structure',{structure:'"><img src=x onerror=alert(1)>'});
 assert.doesNotMatch(html,/<img/);assert.match(html,/&quot;&gt;&lt;img/);
 assert.equal(teachingAfter('plan','measurement',{}),'');
});
