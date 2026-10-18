# Ciclo 7 — comparar duas curvas de sobrevivência

Motor 1.6.0. Entrada: **Tamanho amostral → Calcular diretamente → Planejar acompanhamento até um evento → Comparar sobrevivência em dois grupos independentes**.

## Escopo e parâmetros

Dimensionamento prospectivo, sem importação nem análise de dados coletados. Teste bilateral para diferença entre duas sobrevivências, sob riscos proporcionais. Os indivíduos devem ser independentes e os tempos de evento registrados, com censura à direita. A opção de organismos vinculados em recipientes ou morte conhecida apenas entre visitas é reconhecida e bloqueada. A hipótese de riscos proporcionais deve ser confirmada; curvas que cruzam ou efeitos tardios precisam de outro cálculo.

O usuário informa a mediana esperada do grupo 1 e a mediana do grupo 2, ou HR do grupo 2 em relação ao 1. HR não é probabilidade de morrer. **Nesta rota**, a conversão de medianas e duração em probabilidades de evento presume tempos exponenciais: λ₁=ln(2)/mediana₁, λ₂=HR×λ₁, mediana₂=mediana₁/HR.

Inclusão uniforme durante A unidades de tempo e encerramento comum A+F, em que F é o acompanhamento após a última inclusão. Com A=0, todos começam juntos e são acompanhados por F. Aumentar A mantendo F fixo também aumenta a duração total; isso não deve ser confundido com prolongar a inclusão mantendo encerramento fixo.

Probabilidade de evento: P(evento)=1−exp(−λF)[1−exp(−λA)]/(λA). Para A=0, usa-se 1−exp(−λF). A implementação usa expm1 para estabilidade; a referência integra a probabilidade sobre o tempo de inclusão com scipy.integrate.quad.

## Duas aproximações explícitas

### Freedman / lifelines, somente grupos iguais

Porte de **lifelines 0.30.0**, arquivo `lifelines/statistics.py`, funções `sample_size_necessary_under_cph` e `power_under_cph`. MIT, Copyright (c) 2017 Cameron Davidson-Pilon; licença completa em `sample-size/licenses/lifelines-MIT.txt`. Código adaptado em `sample-size/vendor/lifelines-logrank.mjs`. Quantis/CDF do SciPy foram substituídos pelos equivalentes jStat; a equação foi preservada.

Com k=N₂/N₁, h=HR e zα=z(1−α/2), a rotina usa D=(1/k)[(kh+1)/(h−1)]²(zα+zβ)². N₁=teto[D/(kp₂+p₁)] e N₂=teto[Dk/(kp₂+p₁)]. O poder usa Φ[sqrt(k D esperado)|h−1|/(kh+1)−zα], com a alocação efetiva após arredondamento.

**Isso não é a fórmula log(HR) de Schoenfeld.** As funções originais aceitam alocação desigual, mas esse uso foi bloqueado na interface/engine desta entrega após diagnóstico por simulação: no cenário de medianas 48/72, alocação 2:1 e seguimento 168, a rotina previa cerca de 80,15%, mas o log-rank simulado apresentou 76,85% (6.000 ensaios; erro Monte Carlo ~0,54 ponto percentual). O registro está em `tests/freedman-allocation-diagnostic.json`. Comparar resultados numéricos com uma biblioteca não bastou para autorizar esse uso.

### Schoenfeld, grupos iguais ou desiguais

Alternativa escolhida explicitamente pelo usuário, não substituição silenciosa. Implementação própria da equação publicada: D=(zα+zβ)²/[q(1−q)ln(HR)²], com q=k/(1+k). A conversão D→N usa as mesmas probabilidades de evento. Poder aproximado: Φ[sqrt(D esperado q efetivo(1−q efetivo))|ln(HR)|−zα]. Não é porte de código GPL.

As duas aproximações usam a cauda principal da alternativa normal, com teste bilateral definido pelo crítico z(1−α/2), como nas fórmulas usuais de dimensionamento. Não são poder exato para qualquer amostra. O modelo e a distribuição dos conjuntos em risco podem produzir desvios.

Nos dois casos, arredondamento por grupo, mínimo computacional de dois indivíduos por grupo e recomputação do poder aproximado. Se a alocação inteira reduzir o poder abaixo do alvo, incrementam-se grupos até atingir o alvo dessa aproximação (máximo 1.000 ajustes; caso contrário, erro explícito). Os totais e a alocação efetiva são exibidos.

## Saídas e perdas

Indivíduos analisáveis e inclusão inicial em cada grupo; total; probabilidades de evento; eventos-alvo aproximados e eventos esperados; hipótese, modelo e parâmetros; poder aproximado após arredondamento; cenários de duração.

O alvo de eventos é contínuo na aproximação. Não é contado como indivíduos nem arredondado antes de reproduzir a fórmula original. Eventos observados no estudo real são inteiros e aleatórios; o total esperado não é garantia de observação desse número.

Vivos no fim são censurados e já estão incluídos. Mortes são desfechos, não perdas. Inflação opcional teto[N grupo/(1−p)] é aplicada a cada grupo para indivíduos totalmente sem informação. Não dimensiona abandono informativo ou distribuição de tempos de abandono. Bonferroni opcional divide α pela quantidade de hipóteses na família; não transforma esta rota em teste global de vários tratamentos.

Exemplo fictício: medianas 48 e 72 horas, todos começam juntos, seguimento 168 horas, grupos iguais, poder 80%, α bilateral 5%, Freedman. Resultado: **115 indivíduos por grupo (230 total)**, aproximadamente 197,016 eventos esperados e poder aproximado de 80,158%. Isso não é uma recomendação universal para bioensaios.

## Limites e integração

Não cobre agrupamento em recipientes, vários grupos, riscos competitivos, censura intervalar, riscos não proporcionais, testes ponderados ou parâmetros com covariáveis. Alocação 0,25–4, HR 0,2–5 diferente de 1, significância/poder no domínio validado do formulário, duração positiva e inclusão inicial até dez milhões. Pequenas quantidades esperadas de eventos ou efeitos grandes geram alertas. Freedman desigual é bloqueado; a alternativa requer escolha explícita de Schoenfeld.

Planejamento atual não registra duração, entrada, evento e censura: transferência automática bloqueada. Não se substituem repetições por eventos nem se perde uma alocação desigual na transferência. Versão 1.5.0 é recuperável como parâmetros; resultados antigos exigem recálculo. README, identidade visual e explicações dos módulos anteriores foram preservados.

## Proveniência e validação

- Lifelines 0.30.0 MIT: código efetivamente portado e dois originais preservados em `tests/reference-source/lifelines-cph.py`, com autoria e licença. O original foi extraído sem alterar os corpos das funções; apenas imports e aviso foram acrescentados para execução independente. Essa referência usa SciPy, não JavaScript.
- jStat 1.9.6 MIT já incluído: normal.inv e normal.cdf.
- Metadados, hashes e adaptações em `SOBREVIVENCIA-PROVENIENCIA.json`. Nenhum código R GPL incorporado. O pacote R powerSurvEpi citado na documentação do lifelines não foi portado.
- Freedman LS (1982), *Tables of the number of patients required in clinical trials using the logrank test*, Statistics in Medicine 1:121–129. https://doi.org/10.1002/sim.4780010204
- Schoenfeld DA (1983), *Sample-size formula for the proportional-hazards regression model*, Biometrics 39:499–503. https://doi.org/10.2307/2531021
- Documentação: https://lifelines.readthedocs.io/en/latest/lifelines.statistics.html . A documentação online pode apresentar versão posterior à fonte auditada.

42 cenários em `tests/survival-reference.json`, reproduzíveis por `generate-survival-reference.py` com SciPy 1.17.0: HR abaixo/acima de 1 e próximo de 1, alocação desigual, entrada, acompanhamento, multiplicidade, poder, perdas e unidade de tempo. O porte Freedman é comparado às funções originais em todas as alocações, mesmo nas não habilitadas. Quantidades inteiras coincidem exatamente; valores contínuos tolerância relativa 10⁻⁷. Schoenfeld tem referência independente pela equação com SciPy e validação de comportamento por simulação.

Diagnóstico de log-rank: quatro cenários, 6.000 ensaios cada, semente 20261018. Tempos exponenciais e entradas uniformes simulados individualmente; censura administrativa; teste de log-rank bilateral independente, sem usar a fórmula de poder para produzir rejeições. Resultados em `tests/survival-simulation.json`. Poderes simulados da composição habilitada: 80,47% (Freedman igual), 81,82% (Schoenfeld 2:1), 81,52% (Freedman com inclusão) e 83,32% (Freedman com HR 0,5). Erros Monte Carlo próximos de 0,5 ponto percentual. Esses resultados ilustram os desvios da aproximação; não garantem poder em qualquer configuração.

512 testes automatizados passaram. Sem revisão visual em navegador nesta entrega. Nenhum servidor ou serviço pago necessário; Python é usado apenas nas verificações externas ao site.
