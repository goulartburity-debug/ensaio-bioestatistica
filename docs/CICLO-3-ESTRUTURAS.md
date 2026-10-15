# Terceiro ciclo — parcelas subdivididas e unidades dentro de blocos

Motor 1.2.0, 15/10/2026. Base: commit publicado `20d62fb50fd54595df8f55caa060ecbbf92adb3c`, conferido como idêntico ao pacote do segundo ciclo. A calculadora passa de 14 a 16 rotas. Mantém os cálculos e a interface anteriores, sem execução de testes sobre dados coletados, importação, servidor, serviço pago ou texto pronto de metodologia.

## Escopo entregue

1. **Parcelas subdivididas clássicas em blocos completos:** dois fatores fixos, A aplicado à parcela principal e B às subparcelas. Uma parcela de cada nível de A por bloco; uma subparcela de cada nível de B em cada parcela. Dimensiona o teste global de A, B ou A×B, com os erros próprios de cada estrato.
2. **Várias unidades de cada tratamento por bloco:** um fator fixo, blocos completos e composição balanceada. O usuário fixa m unidades por tratamento e bloco, e a calculadora dimensiona o número de blocos. Exige aplicações separadas de tratamento e escolha explícita entre modelo aditivo e modelo com componente aleatório tratamento × bloco.

Ambas usam respostas contínuas e erros normais homocedásticos dentro dos componentes. Não dimensionam Tukey/Dunnett nessas estruturas, comparações simples, poder conjunto de múltiplos efeitos, blocos incompletos, unidades desiguais por célula ou respostas binomiais. A significância familiar e o número de hipóteses podem definir Bonferroni explícito; o poder continua sendo da hipótese escolhida.

## Parcelas subdivididas: modelo e equações

Modelo: Y_hij = μ + bloco_h + A_i + u_hi + B_j + (AB)_ij + e_hij. Os componentes u_hi são independentes N(0, σW²), compartilhados pelas subparcelas da parcela hi. Os erros e_hij são independentes N(0, σS²), também independentes dos componentes de parcela e dos blocos. Não há componentes adicionais bloco × B, bloco × A × B ou correlação temporal/espacial residual.

Sejam r blocos, a níveis de A, b níveis de B, μij as médias de planejamento, A_i = μi·−μ··, B_j = μ·j−μ·· e I_ij = μij−μi·−μ·j+μ··:

| Teste | GL numerador | GL denominador | Não centralidade λ |
|---|---:|---:|---|
| A | a−1 | (r−1)(a−1) | rb Σ A_i² / (σS²+bσW²) |
| B | b−1 | a(r−1)(b−1) | ra Σ B_j² / σS² |
| A×B | (a−1)(b−1) | a(r−1)(b−1) | r Σ I_ij² / σS² |

Poder = P[F não central(GL1,GL2,λ) > F central⁻¹(1−α;GL1,GL2)]. As não centralidades são derivadas da covariância do modelo e das somas de quadrados ortogonais da ANOVA; os graus de liberdade e os denominadores seguem a tabela acadêmica indicada abaixo. Não se utiliza o erro de um fatorial simples para A.

**Escalas da variabilidade:** σW é o DP do componente aleatório compartilhado pela parcela, não a raiz do QM do erro A. Para facilitar o uso de resultados em outra escala, a interface também aceita o DP residual das médias das parcelas, sM, com sM² = σW² + σS²/b. Nesse caso o denominador de A usa b sM². A entrada exige sM² ≥ σS²/b, à tolerância numérica de 10⁻¹⁰ relativa. Não se adiciona a variância da subparcela duas vezes.

Para B e A×B, o componente compartilhado pela parcela cancela nos contrastes dentro dela; σW não é pedido nem registrado como se fosse zero. A quantidade necessária para cada efeito depende das diferenças e dos respectivos erros. Não se promete que o fator da subparcela sempre terá maior poder.

**Contagem:** r blocos, ra parcelas principais e rab subparcelas; r parcelas por nível de A e r subparcelas por combinação A×B. O total rab não representa rab aplicações independentes de A. Esses números também ficam registrados separadamente no resultado (`counts` e `initialCounts`).

## Várias unidades por tratamento e bloco

Sejam k tratamentos, r blocos e m≥2 unidades tratadas separadamente de cada tratamento por bloco. N = rkm, com rm unidades por tratamento. As médias esperadas são μi, τi = μi−μ̄. O m fica fixo durante a busca; o resultado não é uma otimização simultânea de blocos e tamanho de bloco.

**Modelo aditivo:** Y_hit = μ + bloco_h + τ_i + e_hit; erros independentes N(0,σE²). O efeito do tratamento não varia entre blocos.

- GL1 = k−1; GL2 = rkm−r−k+1.
- λ = rm Στi²/σE².
- O teste usa o resíduo do modelo aditivo. A ausência de interação tratamento × bloco é uma hipótese substantiva, não uma escolha automática.

**Modelo com interação aleatória:** Y_hit = μ + bloco_h + τ_i + v_hi + e_hit. Blocos são aleatórios; v_hi são componentes independentes N(0,σTB²), e e_hit são independentes N(0,σE²), independentes entre componentes. O teste dos tratamentos usa o quadrado médio tratamento × bloco, não o erro entre unidades da mesma célula.

- GL1 = k−1; GL2 = (r−1)(k−1).
- λ = rm Στi²/(σE²+mσTB²).
- Mais unidades na mesma célula reduzem a parte σE²/m da variância da média, mas não eliminam σTB²; não substituem indefinidamente novos blocos.
- σTB=0 é aceito como fronteira; o denominador continua sendo o da análise escolhida, sem juntar erros automaticamente para ganhar graus de liberdade.

O efeito geral de bloco cancela nos testes balanceados de tratamentos e não precisa de uma estimativa de variância para estas fórmulas. Isso não dispensa o bloco no desenho ou no modelo. Aplicações separadas não significam ausência de toda correlação marginal quando há componentes comuns de bloco/célula.

**Subamostras:** se o usuário informa tratamento aplicado ao conjunto inteiro, o cálculo é bloqueado e explica que o conjunto é a unidade. Não se calcula um tamanho multiplicando plantas, insetos ou avaliações internas. Essa situação pode ser planejada por respostas agregadas de unidades tratadas, mas esta versão não inventa o DP agregado nem uma ICC para preencher outro cálculo.

## Interface e integração

- Novas opções na categoria de estruturas específicas, com exemplos fictícios carregados apenas por ação explícita.
- Explicações curtas junto aos campos; ajudas e parâmetros avançados recolhidos. Mantida a apresentação em coluna única, responsiva, sem quadro lateral, link de métodos/limites no formulário ou texto copiável de metodologia.
- Em parcelas subdivididas, o campo de componente de parcela aparece apenas para A. Os níveis e as médias são identificados como A na parcela e B na subparcela.
- Em blocos com várias unidades, forma de aplicação e modelo começam sem seleção. O componente σTB só aparece para o modelo que o utiliza.
- Cenários mantêm os outros parâmetros constantes e variam um DP em ±20%; são comparações de sensibilidade, não estimativas de variância. Para A, variam σW ou o DP das médias, conforme a escala; para B/interação, σS; na outra rota, σE. Cenários incompatíveis apresentam erro, sem recomendação.
- “Usar meu planejamento” aproveita tratamentos e m quando o plano tem um fator e várias unidades por tratamento em blocos completos. Não presume aplicação independente nem modelo aditivo.
- Aplicação ao planejamento mostra a quantidade de blocos anterior/nova e m anterior/novo. Exige confirmação e verifica se o plano continua idêntico ao consultado. Preserva tratamentos, fatores e estrutura. Subamostras, datas, níveis incompatíveis e outros desenhos bloqueiam a transferência.
- Para parcelas subdivididas, os níveis podem ser copiados de um plano com dois fatores cruzados em vários níveis de aplicação e blocos completos. É obrigatório conferir A/B: o plano não registra qual ocupa cada nível. **O resultado não é transferido automaticamente**, pois o planejamento ainda possui apenas um campo de unidade/replicações e não descreve a hierarquia. Não se transforma rab em repetições independentes.
- Versão 1.2.0 registrada com os parâmetros e resultados aplicados. Entradas 1.0.0/1.1.0 podem ser retomadas; resultados antigos exigem recálculo. Mudanças de parâmetros ou plano invalidam a aplicação pendente, como antes.

## Perdas, limites e execução

Ajuste opcional: r inicial = teto[r/(1−p)], aplicado a blocos completos. As contagens de parcelas/subparcelas ou unidades são recalculadas para esses blocos inteiros. Perdas isoladas dentro do bloco não são representadas por esse ajuste.

Busca inteira com pelo menos dois blocos, máximo de um milhão de subparcelas/unidades analisáveis. Parcelas subdivididas: 2–10 níveis por fator. Blocos com várias unidades: 2–20 tratamentos e 2–1.000 unidades por célula. Não centralidade limitada ao domínio anterior da F (λ≤5.000). Efeito nulo, valores incompatíveis, ausência de solução e falha numérica não produzem recomendação. Aceita vírgula decimal; não recebe tamanho de efeito padronizado genérico nestas duas rotas.

Código em `sample-size/structured.mjs`, separado da interface e da integração. Reutiliza o motor numérico anterior; a busca dessas duas rotas é suficientemente curta nos casos testados para execução direta no navegador. O Worker das comparações múltiplas anteriores foi mantido. Nenhuma dependência remota de execução foi adicionada.

## Validação

- SciPy 1.17.0, `scipy.stats.f.isf` e `scipy.stats.ncf.sf`: **29 casos de dimensionamento**, com igualdade de blocos, total analisável, quantidade inicial e total inicial, GL e λ. Tolerância absoluta do poder: 2×10⁻⁷; de λ: 10⁻⁸. Verifica também que um bloco a menos não atinge o alvo, exceto quando já se está no mínimo de dois blocos.
- Inclui A/B/interação, fronteira σW=0, entrada por DP das médias, efeito menor e amostra maior, mínimo de dois blocos, poder 90%, α=1%, Bonferroni, perdas, 3×2, dois e vinte tratamentos, m=2/3/5 e componente tratamento × bloco nulo/positivo.
- **10 verificações por ANOVA simulada diretamente dos dados**, 100.000 experimentos por verificação, semente 20261015. Cálculo das somas de quadrados da ANOVA em NumPy, sem usar a fórmula de λ para obter a estatística simulada. Cobrem o nível de 5% sob H0 e o poder sob H1 para A, B, interação e os dois modelos de blocos.
- Critério Monte Carlo: diferença entre proporção de rejeições e poder teórico inferior a quatro erros-padrão Monte Carlo mais 1/100.000. Não é uma garantia uniforme de erro em todos os parâmetros.
- Script reproduzível: `tests/generate-structured-reference.py`; saídas, parâmetros e versão em `tests/structured-reference.json`. A simulação é apenas validação; a recomendação do site é analítica sob o modelo normal informado.
- Testes adicionais: relações monotônicas, equivalência das escalas de parcela, cancelamento de σW para B/interação, unidades versus subamostras, entradas inválidas, domínios, ausência de solução, preservação/atualização do planejamento, persistência e campos condicionais.

A contagem final de testes e a validação estrutural da interface estão registradas em `VALIDACAO-AMOSTRAL.md`. Não houve inspeção visual em navegador real ou celular físico, pois a ferramenta de navegador exigida no ambiente não estava disponível. Os testes de DOM simulado e de HTML não são apresentados como teste visual.

## Proveniência e referências

As novas equações são implementação do Ensaio a partir de modelos e tabelas ANOVA acadêmicos. Reutilizam o motor de F não central já validado e jStat 1.9.6 (MIT). Não foi incorporado novo código de terceiros; a licença do código novo é MIT. Os componentes MIT/BSD anteriores permanecem com seus avisos. Auditoria de candidatos R, versões e licenças em `CODIGO-ABERTO.md`.

- Montgomery, D. C. *Design and Analysis of Experiments*, 8ª ed. Wiley, 2012: blocos, modelos mistos e parcelas subdivididas.
- Zhang, H. Purdue University, STAT514. [Split-Plot Designs](https://www.stat.purdue.edu/~zhanghao/STAT514/Lecture_Notes/LectureNotes20-Split-plot-Designs-.html): modelo, tabela ANOVA e somas de quadrados.
- Zhang, H. Purdue University, STAT514. [Complete Block Designs](https://www.stat.purdue.edu/~zhanghao/STAT514/Lecture_Notes/LectureNotes13-Complete-Block-Design-.html): modelo aditivo e várias unidades por célula.
- Craig, B. Purdue University. [Blocking Designs, notas 11](https://www.stat.purdue.edu/~bacraig/notes1/topic11.pdf): blocos aleatórios e “RCBD with Replication”, pp. 7–8. As fórmulas para o modelo com interação aleatória desta entrega decorrem dos quadrados médios esperados desse modelo; não se confundem com interação fixa e teste contra erro puro.
