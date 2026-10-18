# Tamanho amostral no Ensaio — versão 1.5.0

Atualização 18/10/2026: LT50 por precisão com lognormal/log-logística, indivíduos independentes, visitas fixas, morte em intervalo e censura administrativa. Ver [CICLO-6-LT50.md](CICLO-6-LT50.md). jStat MIT reutilizado; lifelines MIT inspecionado sem incorporação. 24 referências numéricas independentes. Os registros anteriores continuam documentando CL50 e demais rotas.

Atualização 18/10/2026: precisão da CL50 em tempo fixo por logit/probit, binomial ou beta-binomial com ICC conhecido. Ver [CICLO-5-CL50.md](CICLO-5-CL50.md) e [CL50-PROVENIENCIA.json](CL50-PROVENIENCIA.json). Novas distribuições reutilizam o jStat MIT já incluído; nenhuma rotina GPL foi incorporada. 41 referências numéricas independentes e quatro cenários simulados. Os registros abaixo documentam também ciclos anteriores.

Quarto ciclo: medidas repetidas e comparação de médias entre conjuntos iguais estão disponíveis; ver [CICLO-4-DEPENDENCIA.md](CICLO-4-DEPENDENCIA.md).

Terceiro ciclo: parcelas subdivididas clássicas em DBC e várias unidades por tratamento e bloco estão disponíveis; ver [CICLO-3-ESTRUTURAS.md](CICLO-3-ESTRUTURAS.md).

Revisão de interface da fase 1: ver [FASE-1-INTERFACE.md](FASE-1-INTERFACE.md). No segundo ciclo, o motor foi ampliado para 1.1.0; ver [CICLO-2-COMPARACOES.md](CICLO-2-COMPARACOES.md). Os resultados dos métodos anteriores foram preservados, e os resultados aplicados sob a versão antiga precisam ser recalculados. O resumo copiável citado no registro da entrega original foi retirado da interface por solicitação do responsável pelo projeto; exemplos e ajustes avançados passaram a ser opcionais e recolhidos.

Implementação de 15/10/2026, baseada no site existente no commit `860ed312a95ab359fe82f9d530a60ad2b00068a7`. O módulo executa no navegador, sem servidor, conta paga ou importação de dados. Nenhum cálculo de teste sobre dados coletados foi acrescentado. Os valores digitados são hipóteses de planejamento.

## Métodos disponíveis e o que contam

| Objetivo | Método e parâmetros | Quantidade calculada | Limites principais |
|---|---|---|---|
| Estimar média | Aproximação normal, DP e margem absoluta; confiança editável | Unidades amostrais | DP de planejamento tratado como conhecido; não garante largura de IC t com DP amostral |
| Estimar proporção | Aproximação normal de Cochran, porcentagem e margem em pontos percentuais | Unidades amostrais | Amostragem aleatória simples; não é intervalo binomial exato |
| Duas médias independentes | Aproximação normal do OpenEpi/Rosner; diferença, dois DPs ou d com DP comum; razão n2/n1 | n1, n2 e total | Não é poder exato de Welch; alerta para n < 30 em algum grupo |
| Duas médias pareadas | t não central, ou F equivalente na hipótese bilateral | Pares completos | Diferenças normais, pares independentes; DP das diferenças ou dois DPs e correlação |
| Duas proporções independentes | Fleiss, sem correção de continuidade; p1, p2, razão | n1, n2 e total | Aproximação normal; não dimensiona Fisher, McNemar ou proporções agrupadas |
| ANOVA de um fator | F não central, f ou médias esperadas e DP residual | Unidades por tratamento e total | Teste global, grupos iguais, efeitos fixos; não assegura poder para cada comparação de Tukey |
| Dois fatores cruzados | F não central do termo A, B ou A×B | Unidades por combinação ou blocos completos, e total | Completo, balanceado, fatores fixos, mesmo nível de aplicação; com ou sem blocos completos aditivos; sem parcelas subdivididas |
| DBC completo | F não central do efeito de tratamentos em modelo aditivo | Número de blocos e total de unidades | Uma unidade por tratamento e bloco, blocos independentes; DP residual após blocos; sem interação tratamento×bloco |
| Dunnett | Valor crítico t multivariado e poder marginal por t/F não central | Unidades por tratamento ou blocos completos | Bilateral, 2–10 tratamentos, mesma variância residual e alocação igual; testemunha incluída no total |
| Tukey | Amplitude estudentizada e poder marginal de um par por t/F não central | Unidades por tratamento ou blocos completos | Poder por comparação, não de todos os pares; grupos iguais e resposta contínua normal |
| Contraste planejado | Pesos que somam zero, diferença relevante, DP e t/F não central | Unidades por tratamento ou blocos completos | Uma comparação definida antes da coleta; Bonferroni adicional explícito quando pertinente |
| Parcelas subdivididas em DBC | F não central de A, B ou A×B, com erros separados | Blocos, parcelas principais e subparcelas | Modelo balanceado normal clássico; A na parcela, B na subparcela; uma subparcela por nível de B |
| Várias unidades por tratamento e bloco | F não central, modelo aditivo ou com componente aleatório tratamento × bloco | Blocos com quantidade por célula fixa | Um fator, aplicações separadas, composição igual em todos os blocos; teste global |
| Medidas repetidas | F não central para grupo/tempo/interação sob simetria composta; contraste sob CS ou AR(1) | Unidades acompanhadas por grupo, total de unidades e registros | Dados completos, grupos iguais e DP comum; AR(1) só para um contraste e intervalos iguais |
| Tratamentos aplicados a conjuntos | ANOVA/t das médias de conjuntos normais com ICC comum | Conjuntos por tratamento, total independente e observações internas | Conjuntos e grupos iguais, resposta contínua; sem medidas repetidas ou respostas binomiais |
| Correlação | Aproximação z de Fisher | Unidades com as duas variáveis | Pearson, H0: ρ = 0, normalidade bivariada; não Spearman ou correlação parcial |
| Regressão linear | F não central, f² ou R² completo e reduzido | Unidades com todas as variáveis | Modelo fixo, erros normais independentes e homocedásticos; coeficientes excluem intercepto |
| Proporção em conglomerados | Cochran + DEFF de Kish | Conglomerados iguais e observações dentro deles | Estimação descritiva, pesos iguais; não ensaio randomizado por conglomerados; alerta com menos de 30 conjuntos |

“Exato sob o modelo” qualifica a distribuição de poder dos testes normais, avaliada numericamente. Não significa ausência de erro de planejamento, exatidão dos parâmetros fornecidos ou garantia de resultado significativo. As rotas normais e de Fisher são explicitamente aproximadas; não há dimensionamento por simulação em produção. O terceiro ciclo usa simulação de dados apenas na validação independente dos modelos.

## Equações e convenções

Notação: Φ⁻¹ é o quantil normal; α é a significância por hipótese; 1−β é o poder; e é a margem; σ é DP; r é n2/n1. Nas rotas bilaterais zα = Φ⁻¹(1−α/2); nas unilaterais zα = Φ⁻¹(1−α). zβ = Φ⁻¹(1−β).

- Média: n0 = z²σ²/e². Proporção: n0 = z²p(1−p)/e², usando p e e em frações.
- População finita, apenas nas duas estimações simples: n = N n0/(N−1+n0), com amostragem aleatória simples sem reposição. Não significa que um experimento com poucos vasos disponíveis tenha direito a essa redução.
- Duas médias: n1 = teto[(σ1² + σ2²/r)(zα+zβ)²/Δ²]; n2 = teto[r n1]. Reaproveita o bloco aritmético do OpenEpi; substitui tabelas de quantis arredondados por quantis jStat e admite uma cauda explicitamente.
- Pareado: d_z = Δ/σ_d. Se necessário, σ_d² = σ1² + σ2² − 2ρσ1σ2. Poder por t não central com gl = n−1 e não centralidade √n |d_z|; duas caudas incluem ambas as regiões de rejeição. A hipótese unilateral precisa corresponder ao sinal da diferença.
- Duas proporções: p̄ = (p1+r p2)/(1+r); n1* = [zα√((1+r)p̄(1−p̄)) + zβ√(r p1(1−p1)+p2(1−p2))]²/[r(p1−p2)²]. n1 = teto(n1*), n2 = teto(r n1*). Convenção Fleiss do OpenEpi, sem correção de continuidade.
- ANOVA: k tratamentos, R unidades por tratamento, N = kR; gl1 = k−1; gl2 = N−k; λ = Nf²; f² = média[(μj−μ̄)²]/σ². Não usa desvio-padrão amostral das k médias (divisor k−1).
- Fatorial a×b: R unidades por célula sem blocos, ou R blocos completos; N = abR; gl2 = ab(R−1) sem blocos ou (ab−1)(R−1) em DBC aditivo. gl1 = a−1 para A, b−1 para B, (a−1)(b−1) para A×B. Para A e B, f usa médias marginais; para interação usa μij−μi·−μ·j+μ··. λ = Nf². O modelo completo inclui a interação também quando se dimensiona um efeito principal. Médias diferentes podem ter interação exatamente zero; nesse caso nenhum n é fabricado.
- DBC: k tratamentos e B blocos; N = kB; gl1 = k−1; gl2 = (k−1)(B−1); λ = Nf²; f baseado na variação residual do modelo aditivo. Busca B, nunca converte n independente em número de unidades dentro do bloco.
- Correlação: n = teto[3 + ((zα+zβ)/atanh(|ρ|))²]. É a aproximação simples de Fisher, sem a correção de viés utilizada por algumas outras rotinas. Não é numericamente idêntica a `pwr.r.test`.
- Regressão: p coeficientes preditores no modelo completo, q testados; gl1=q; gl2=N−p−1; f²=(R²completo−R²reduzido)/(1−R²completo); λ=Nf². Essa é a convenção com não centralidade Nf² (também denominada “regular” em WebPower), não a convenção alternativa (q+gl2+1)f² de algumas funções Cohen. Não foi portado código do WebPower.
- Conglomerados: DEFF=1+(m−1)ICC; K=teto[n0 DEFF/m], com m igual em todos os conglomerados; total=Km. Não recebe correção finita. K é o número de unidades de amostragem independentes entre si; Km são observações vinculadas, não Km repetições independentes.

Os testes F usam a cauda superior do teste do efeito, sem uma escolha artificial entre “bilateral/unilateral”. Para duas médias, dois percentuais, pareamento e correlação, a direção é editável, com sinal verificado. A diferença é condição 2 menos condição 1.

## Famílias de hipóteses, perdas e arredondamento

Significância inicial 5%, poder 80%, confiança 95% e perdas 0%, todos identificados e editáveis. Nenhum efeito, variabilidade, correlação ou ICC é preenchido silenciosamente. Os exemplos fictícios são carregados somente por botão que informa a substituição dos campos.

Se houver m hipóteses primárias, usa-se α_família/m (Bonferroni). O poder solicitado é do efeito dimensionado sob esse limiar, não a probabilidade de detectar todos os efeitos. Há rotas próprias para Dunnett, Tukey e um contraste planejado, descritas no ciclo 2. Dunnett e Tukey já usam ajuste familiar; não recebem Bonferroni adicional. O poder é por comparação, não a probabilidade conjunta de rejeitar todas ou pelo menos uma hipótese.

A busca trabalha com inteiros: pelo menos duas unidades por célula, dois pares ou dois blocos; regressão começa em N=p+3; correlação exige N≥4. Todas as fórmulas fechadas arredondam para cima. Após arredondar, apresentam-se os grupos efetivamente obtidos. F, t e as novas comparações têm poder recalculado na composição analisável; as fórmulas normais não exibem um suposto poder exato pós-arredondamento.

Para perdas p, a inclusão inicial é teto[n/(1−p)]. Aplica-se separadamente aos grupos ou células. No DBC, inclusive no fatorial ou nas novas comparações em DBC, amplia blocos inteiros. No pareado, amplia pares completos. Na estimação por conglomerados, amplia conglomerados inteiros; m permanece o tamanho analisável. Perdas em unidades isoladas dentro de blocos ou conglomerados não são representadas por esse ajuste. Não é método de tratamento de dados ausentes nem garantia de completar n.

## Limites e falhas explícitas

- Entradas com vírgula ou ponto decimal, sem separadores de milhar. Campos vazios, infinitos, efeitos nulos e contagens fracionárias não geram resultados.
- Poder permitido 50–99,9%; confiança 80–99,9%; significância familiar 0,1–20%; até 100 hipóteses; perdas 0–90%; razões n2/n1 de 0,1 a 10.
- ANOVA/DBC: até 20 tratamentos; fatorial: até 10 níveis por fator; regressão: até 100 coeficientes. |dz|≤5; f≤2; f²≤4; |ρ|≤0,99; ICC 0–0,99.
- Porcentagens esperadas estritamente internas: 0,01–99,99%. A aproximação é bloqueada se houver menos de 10 sucessos ou insucessos esperados em algum grupo; conglomerados usam a quantidade efetiva Km/DEFF nessa triagem. É uma regra conservadora de uso, não prova de cobertura ou adequação. Não há troca silenciosa para teste exato.
- Distribuição F: λ≤5.000. Série de Poisson centrada no modo, pesos relativos normalizados e limite superior geométrico para massa truncada relativa <2×10⁻¹²; máximo de 10.000 iterações. Não central t unilateral limitado a não centralidade ≤20. Valores inválidos ou falha de convergência resultam em mensagem, não em um n inventado.
- Busca inteira por expansão e bisseção, limitada a 1 milhão de unidades no nível buscado; F balanceado limita o total a 1 milhão. Fórmulas fechadas têm teto de 10 milhões analisáveis. O planejamento existente aceita apenas até 10.000 por campo; resultados maiores permanecem independentes, sem truncamento.
- A representatividade depende da seleção da amostra; a validade causal e experimental depende do desenho. A calculadora não certifica essas propriedades.

## Integração e persistência

A nova entrada “Tamanho amostral” funciona sem planejamento. “Usar meu planejamento” primeiro mostra as informações que serão aproveitadas e pede confirmação; não supõe o tipo de resposta quando ele não está codificado. O campo de quantidade tem “Preciso calcular essa quantidade”.

Antes de aplicar, a interface mostra o valor anterior e o novo, exige confirmação de correspondência entre resposta, modelo e unidade, e reconfere a impressão digital de todas as respostas. Alocação desigual, números de tratamentos incompatíveis, subamostras, avaliações repetidas, blocos incorretos e modelos não representados impedem a transferência. Um conjunto tratado pode ser unidade experimental; ele não é convertido em indivíduos. As novas comparações permitem o DBC completo com confirmação da estrutura; a rejeição de tamanhos desiguais aplica-se quando a rota não os representa.

Na rota de várias unidades por tratamento e bloco, a prévia modifica `blockCount` e `replicates` para a composição escolhida, sem presumir que sejam subamostras. Parcelas subdivididas podem aproveitar os níveis dos fatores, mas não transferem resultados para o planejamento: faltam campos para os dois níveis de aplicação.

DBC compatível de uma unidade por célula, inclusive no fatorial e nas novas comparações, modifica `blockCount` e fixa explicitamente `replicates=1`; outras rotas compatíveis modificam apenas `replicates`. Se a avaliação ainda não estiver definida na etapa de quantidade, isso aparece no aviso e na confirmação. Alterações posteriores tornam a associação com o cálculo desatualizada.

Medidas repetidas compatíveis atualizam unidades por tratamento e preservam datas. Conjuntos compatíveis atualizam conjuntos por tratamento e indivíduos iniciais por conjunto, com prévia dos dois campos. Não se transferem números se houver blocos, estrutura combinada, datas ou tamanhos incompatíveis. Casos específicos em `CICLO-4-DEPENDENCIA.md`.

Parâmetros ficam em `ensaio-sample-v1`, com versão; o resultado não é reutilizado ao reabrir o navegador. A aplicação confirmada registra método, versão, parâmetros, resultado, data e impressão digital em `ensaio-sample-applied-v1`. O planejamento exibe aviso se a versão ou suas respostas mudarem.

## Ainda não implementado

Medidas repetidas com covariância geral, dados incompletos ou modelos mistos gerais; comparação de porcentagens/contagens em conglomerados; conglomerados desiguais/ponderados; conjuntos acompanhados em várias datas; parcelas subsubdivididas e outros modelos hierárquicos; blocos incompletos ou desbalanceados; várias unidades por célula com dois fatores; poder conjunto de comparações; testes não paramétricos; sobrevivência; modelos generalizados. Essas opções aparecem como ainda não calculadas, com o que falta especificar. Não são substituídas por testes independentes.

## Arquitetura e expansão

- `sample-size/engine.mjs`: validação de entradas, equações e resultados.
- `sample-size/numeric.mjs`: distribuições e busca inteira com limites explícitos.
- `sample-size/methods.mjs`: catálogo, limitações, referências e versão.
- `sample-size/integration.mjs`: correspondência, prévia e aplicação ao planejamento.
- `sample-size/ui.mjs`: escolhas progressivas, explicações, cenários e prévia da integração.
- `sample-size/dependence.mjs`: medidas repetidas e comparação de médias em conjuntos iguais, com contagens de cada nível.
- `sample-size/structured.mjs`: parcelas subdivididas e várias unidades por tratamento e bloco, com modelo explícito.
- `sample-size/comparisons.mjs`: Dunnett, Tukey, contraste planejado e organização balanceada.
- `sample-size/multiple-numeric.mjs`: distribuições/quantis das famílias e poder de comparação.
- `sample-size/calculation-jobs.mjs` e `calculation-worker.mjs`: execução das comparações fora da thread da interface, sem servidor.
- `sample-size/vendor/`: código aberto local; sem CDN.
- `sample-size/licenses/`: avisos de terceiros.

Adicionar um método exige: contrato de parâmetros/unidades, referência metodológica, licença auditada se houver reaproveitamento, fixtures independentes e regra própria de integração. Uma simulação futura poderá usar Web Workers no navegador quando apropriado; servidor não foi incluído nem pressuposto.
