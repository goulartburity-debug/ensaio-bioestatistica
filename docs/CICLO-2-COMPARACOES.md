# Segundo ciclo — comparações e fatorial em blocos

Motor de cálculo 1.1.0, em 15/10/2026. Base publicada: `3bdfe648b8465bc1e5f3ed5834d2bad5a079e9a0`. Esta ampliação mantém a interface da fase 1 e acrescenta três rotas, chegando a 14. Não inclui importação de dados ou análise de resultados coletados.

## Disponível

| Caminho | Hipótese dimensionada | Quantidade |
|---|---|---|
| Dunnett | Uma comparação tratamento × testemunha com a diferença informada, usando o ajuste da família de k−1 comparações | Unidades por tratamento, incluindo a testemunha; ou blocos completos |
| Tukey | Um par com a diferença informada, usando o ajuste de todos os k(k−1)/2 pares | Unidades por tratamento; ou blocos completos |
| Contraste planejado | Uma combinação linear de médias definida antes da coleta | Unidades por tratamento; ou blocos completos |
| Fatorial em DBC | Efeito principal A, B ou interação A×B no modelo completo com blocos aditivos | Blocos completos, uma unidade de cada combinação por bloco |

As três comparações admitem 2 a 10 tratamentos, grupos iguais, resposta contínua normal, variância residual comum e hipóteses bilaterais. Nas rotas com blocos, os blocos são completos e independentes entre si, sem interação tratamento × bloco no modelo. O desvio-padrão informado deve ser residual após considerar os blocos. Não se converte um n de grupos independentes em n por bloco.

O fatorial em blocos mantém os limites de até 10 níveis por fator do fatorial anterior, sem blocos incompletos, parcelas subdivididas, efeitos aleatórios de tratamentos ou vários níveis de atribuição.

## Significado do poder

O critério implementado é **poder marginal por comparação com o efeito informado**. O ajuste da família inteira entra no valor crítico; o poder se refere a um contraste/par. Se cada diferença realmente tiver pelo menos o tamanho informado, cada comparação correspondente terá ao menos o poder planejado sob o modelo, respeitados os limites numéricos.

Isso não é a probabilidade de detectar todas as diferenças verdadeiras nem a probabilidade de detectar pelo menos uma. Essas duas definições de poder conjunto continuam explicitamente não implementadas. Não se usa um cálculo global de ANOVA ou um limiar de DMS como substituto para poder de Tukey/Dunnett.

O teste global de ANOVA anterior continua disponível. Não se exige que ele seja significativo antes de executar as comparações dimensionadas aqui; as famílias de testes são especificadas diretamente. Um procedimento que condicione as comparações a uma ANOVA prévia exige outro cálculo de poder.

## Equações

Sejam k tratamentos, r unidades por tratamento (ou r blocos), σ o desvio-padrão residual e Δ o tamanho da diferença relevante.

- DIC/modelo de um fator balanceado: ν = k(r−1).
- DBC completo aditivo: ν = (k−1)(r−1).
- Comparação de duas médias: λ = Δ sqrt[r/(2σ²)]. O poder bilateral é P(|t(ν,λ)| > c). A avaliação usa a identidade exata t²(ν,λ) ~ F(1,ν,λ²), incluindo as duas caudas; não aproxima o t por uma normal.
- Tukey: q é o quantil 1−α da amplitude estudentizada com k médias e ν graus de liberdade. O limiar na escala t é c = q/sqrt(2).
- Dunnett balanceado: as k−1 comparações contra o mesmo controle têm correlação 0,5. Com Z0,…,Z(k−1) normais padrão independentes e S = sqrt[χ²(ν)/ν], calcula-se o c que satisfaz P(max_i |(Zi−Z0)/(sqrt(2)S)| ≤ c) = 1−α. A probabilidade é integrada condicionalmente em Z0 e S; não é Bonferroni nem um teste t sem ajuste.
- Contraste: C = Σ ci μi, Σ ci = 0; Var(Ĉ) = σ² Σ ci²/r; λ = Δ sqrt(r)/(σ sqrt[Σ ci²]). Há predefinições para dois tratamentos e para a testemunha versus a média dos demais, além de pesos personalizados. Escalar os pesos exige escalar Δ na mesma proporção. Todos os tratamentos informados entram no total e nos graus de liberdade, inclusive os de peso zero.
- Para um contraste, o campo de hipóteses na família aplica Bonferroni explícito. Dunnett e Tukey já recebem α familiar diretamente; a interface não acrescenta Bonferroni e o motor rejeita uma configuração adicional incompatível.
- Fatorial em DBC: k = ab; N = abr; ν = (ab−1)(r−1). O numerador tem a−1, b−1 ou (a−1)(b−1) graus de liberdade, conforme o efeito. λ = Nf², com a decomposição das médias já usada no fatorial anterior e σ residual após blocos. A troca de graus de liberdade só é válida para esse modelo/estrutura específicos.

## Integração numérica e limites

O núcleo de CDF da amplitude estudentizada é adaptado de SciPy 1.17.0 (BSD-3-Clause). A densidade de S é avaliada em logaritmos e a integração usa y = sqrt(2ν)(S−1). Quadratura de Gauss–Legendre, regras de ordens 64/96 e, se necessário, 160; divergência acima de 2×10⁻⁷ entre as regras finais resulta em falha explícita. O quantil é delimitado e refinado até erro de CDF menor que 3×10⁻⁸. A integração de S verifica sua massa antes da normalização numérica.

A integração normal é truncada em ±9 e a variável y em [max(−12,−sqrt(2ν)),12]. Os intervalos capturam as caudas relevantes no domínio validado; os testes de referência verificam o comportamento, sem alegar uma prova uniforme de erro em todo o domínio. Não se usa uma aproximação assintótica de graus de liberdade infinitos. Para k=2, usa-se a identidade com o t bilateral.

A busca de tamanho é inteira, com no mínimo duas unidades por tratamento/blocos e no máximo um milhão de unidades no total. Recalcula o quantil e os graus de liberdade em cada candidato. A rotina F não central continua limitada a λ²≤5.000; configurações além do domínio ou que não convergem são recusadas, sem uma recomendação fabricada.

Esses limites são numéricos e de escopo. Não representam uma regra de quantas repetições bastam em qualquer pesquisa.

## Diferença relativa e graus de liberdade

É possível informar Δ em unidades reais ou como percentual relativo de uma média de referência explícita e positiva: Δ = média × percentual/100. Ex.: 25% de 20 cm = 5 cm. Isso não transforma a rota em cálculo de proporções/mortalidade e não corresponde a pontos percentuais ou margem de erro.

Os graus de liberdade residuais são registrados no resultado. Nas novas comparações existe uma restrição adicional opcional, inicialmente zero (desativada), para estudos com requisito específico justificado. O mínimo não é fixado em 12/15 nem apresentado como exigência universal de periódicos ou certificado de estabilidade. Quando a restrição amplia r, o resultado distingue a quantidade obtida só pelo poder da quantidade recomendada após a restrição.

Também se registra o CV teórico da estimativa da variância residual sob normalidade: sqrt(2/ν). Ele descreve incerteza do estimador, não um diagnóstico de normalidade nem um limiar universal de validade.

Perdas: teto[n/(1−p)], por tratamento em grupos independentes ou por blocos inteiros em DBC. Perder subparcelas, indivíduos dentro de um conjunto ou unidades isoladas dentro de blocos não é representado pelo ajuste de blocos inteiros.

## Interface e persistência

- Escolha pelo objetivo: testemunha, todos os pares ou comparação específica.
- Campos essenciais: organização, quantidade de tratamentos, diferença e variabilidade. Pesos aparecem apenas no contraste personalizado; percentual relativo exige uma média de referência.
- Ajustes de poder, significância, perdas e restrição de GL ficam recolhidos. Valores escolhidos continuam visíveis no resumo de opções.
- Sem quadro lateral, link de métodos/limites no formulário ou texto pronto para metodologia.
- Cenários para as comparações são calculados somente quando solicitados, variando Δ em ±20%.
- Integração numérica executada em Web Worker, mantendo a interface responsiva. Há fallback para ambientes sem Worker; nesse caso o trabalho usa a thread principal. Erros e limite de tempo não geram resultado.
- Mudança de parâmetros durante um cálculo invalida a resposta pendente; mudança de planejamento bloqueia sua transferência.
- Prévia e confirmação continuam obrigatórias. DBC atualiza blocos e mantém uma unidade de cada tratamento/combinação por bloco. Subamostras, datas, vários níveis e estruturas incompatíveis bloqueiam transferência.
- Parâmetros 1.0.0 são recuperáveis por “Retomar meus valores”, mas resultados antigos não são restaurados como atuais. Aplicações anteriores exigem recálculo após a mudança para 1.1.0.

## Código aberto

SciPy 1.17.0, BSD-3-Clause: núcleo de integração em `sample-size/vendor/scipy-range.mjs`, com avisos preservados. jStat 1.9.6 e OpenEpi permanecem sob MIT. Os trechos não utilizados de Tukey no jStat que identificavam transcrição de R foram omitidos; o cálculo novo não depende dessas rotinas. Nenhum código GPL de pwrss, WebPower ou outro pacote R foi incorporado. Proveniência, funções, adaptações, hashes e licenças estão em [CODIGO-ABERTO.md](CODIGO-ABERTO.md).

## Validação executada

**227 testes aprovados**, incluindo regressão dos percursos anteriores, números, integração, estados de interface e worker. Referências novas em `tests/comparison-reference.json`; geração reproduzível em `tests/generate-comparison-reference.py`.

- **12 valores críticos**: Tukey comparado com `scipy.stats.studentized_range.ppf`; Dunnett com integração independente por `scipy.integrate.quad` e `scipy.special.roots_hermitenorm`, além de conferência por `scipy.stats.multivariate_t.cdf` (QMC independente). Tolerância de 3×10⁻⁶ na escala t; conferência da probabilidade multivariada com tolerância de 3×10⁻⁶. Cobrem k de 3 a 10, ν de 2 a 1.000 e α de 0,001 a 0,20.
- **23 tamanhos/poderes**: igualdade dos inteiros por nível, total analisável, inicial e GL; tolerância absoluta de poder de 3×10⁻⁶. Incluem pares k=2, 6 grupos, efeito menor, poder 90%, significância 1%, percentuais relativos, perda de blocos, mínimo opcional de GL, pesos escalados, Bonferroni e os três termos do fatorial em blocos.
- O SciPy 1.17.0 retornou NaN em uma cauda de `nct.cdf` para uma comparação de poder quase 1. O gerador independente registra a alternativa exata por `scipy.stats.ncf.sf` nessa situação. Valores não finitos não são aceitos no JSON de referência.
- Verificações de direção: maior poder/variabilidade aumenta n; maior diferença reduz n; Tukey versus Dunnett no cenário comparável; blocos versus sem blocos com o mesmo σ residual.
- Duas médias com k=2: identidade de Dunnett/Tukey com o t bilateral; invariância do contraste ao escalar pesos e Δ conjuntamente.
- Rejeições: pesos incompatíveis, contraste nulo, pares iguais, referência ausente ou não positiva, alocação desigual, hipótese unilateral não implementada, ausência de solução, falha de domínio e versão antiga.
- Estruturas: transferência por tratamento versus por blocos, presença da testemunha, níveis dos dois fatores, preservação do plano até confirmação, subamostras e datas.
- Validação estrutural de 36 telas geradas: IDs únicos, rótulos, referências ARIA, disclosures e links locais; importações locais de módulos resolvidas.
- Worker real sob Node: contrato de mensagens do mesmo módulo usado no navegador, incluindo cenários e erro de operação. Eventos com DOM simulado verificam descarte de cálculo antigo ao editar parâmetros e bloqueio se o plano muda durante o cálculo.

Uma varredura exploratória adicional de 120 combinações de valores críticos (k=2/3/5/10, diferentes GL até 500.000 e α=0,001/0,05/0,20) não apresentou falha de convergência. Não é uma validação independente de todos os pontos nem certificação uniforme de erro.

Não houve inspeção visual em navegador real nem teste em celular físico: a ferramenta de navegador exigida neste ambiente não estava disponível. Validação estrutural das telas geradas e testes de módulo não são apresentados como teste visual.

## Continua fora do escopo

Poder conjunto (todas/pelo menos uma diferença); Tukey–Kramer/alocação desigual; comparações unilaterais nas rotas novas; heterocedasticidade/Welch nas comparações múltiplas; mortalidade binomial e contagens; CL50/LT50; sobrevivência; medidas repetidas; ensaios por conglomerados; parcelas subdivididas; blocos incompletos ou várias unidades por combinação e bloco. Essas situações exigem modelo e validação próprios.

Referências: [NIST — Tukey](https://www.itl.nist.gov/div898/handbook/prc/section4/prc471.htm), [NIST — contrastes](https://www.itl.nist.gov/div898/handbook/prc/section4/prc436.htm), [SciPy — Dunnett](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.dunnett.html), [SciPy — amplitude estudentizada](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.studentized_range.html), [PASS — definições de poder para múltiplas comparações](https://www.ncss.com/wp-content/themes/ncss/pdf/Procedures/PASS/Multiple_Comparisons_of_Treatments_vs_a_Control-Simulation.pdf). A documentação do PASS foi consultada; seu código proprietário não foi incorporado.
