# Ciclo 8 — comparação de duas CL50 (1.7.0)

## Disponível

Nova opção em Tamanho amostral → Dose–resposta: comparar CL50 de duas curvas independentes. Não ajusta dados coletados. Cada curva tem sua grade de concentrações e dois pontos esperados de mortalidade, provenientes de literatura ou piloto. As duas curvas usam o mesmo tempo, unidade de concentração e ligação logit/probit. As inclinações são estimadas separadamente.

Há planejamento binomial para indivíduos tratados separadamente e beta-binomial para recipientes independentes de tamanho fixo, com ICC conhecido por curva. Cada curva pode ter quantidade de indivíduos por recipiente e ICC diferentes. Permite alocação desigual por concentração entre curvas, correção de Bonferroni e perdas de unidades inteiras. Controles separados entram na contagem, mas não na informação quando a mortalidade de fundo é fixada em zero.

## Método e limitações

Para cada curva, o motor reutiliza a informação esperada de Fisher do módulo de CL50, interrompendo antes do dimensionamento de precisão. A matriz conjunta é bloco-diagonal. Se V1 e V2 são as variâncias de log(CL50) com uma unidade por concentração, então Var(log(CL50₂/CL50₁)) = V1/r1 + V2/r2. Busca-se o menor inteiro r1 ≥ 2 com r2 = teto(alocação × r1) e poder bilateral Φ(δ − z) + Φ(−δ − z), δ = |log(razão)| / erro-padrão. O limite da busca é um milhão de unidades por concentração na curva 1; a inclusão total não pode ultrapassar dez milhões. Falhas de solução produzem mensagem, não um resultado truncado.

A alternativa é uma razão de CL50 diferente de 1. Não usa sobreposição de intervalos individuais como teste. Com inclinações diferentes, essa razão não representa potência relativa constante para outras porcentagens. Os limites exibidos são planejados em torno da razão esperada, não intervalos estimados com dados. O cálculo é assintótico, não exato nem garantia de significância. ICC é considerado conhecido; sua estimação e incerteza não estão incluídas.

Não suporta mortalidade de fundo estimada, Abbott, controles compartilhados, pares, blocos, curvas correlacionadas, comparação global de curvas, equivalência ou não inferioridade. Não transfere números automaticamente ao planejamento: ele não representa duas grades de concentrações com parâmetros diferentes. Sobrevivência agrupada continua pendente em ciclo próprio.

## Exemplo verificável

Logit; 20% e 80% previstos nas concentrações 1 e 4 para a curva 1 e 1,25 e 5 para a curva 2. Cinco concentrações em cada grade: 0,5;1;2;4;8 e 0,625;1,25;2,5;5;10. Dez organismos/recipiente, ICC 0,05 em ambas, controles separados, alocação 1, poder 80%, α bilateral 5%.

CL50 esperadas 2 e 2,5; razão 1,25. Resultado: 17 recipientes por concentração ou controle em cada curva, 204 recipientes e 2.040 organismos. Poder aproximado 81,1971%. Com 10% de perdas: 19 por condição, 228 recipientes iniciais. O arredondamento ocorre separadamente por curva e concentração.

## Origem e licenças

Reaproveitamento direto: `sample-size/dose-response.mjs` (CoDel-Stat, MIT), informação binomial/beta-binomial previamente validada, e jStat 1.9.6 (MIT), funções normal e log-gama e utilitários existentes. O novo módulo combina as variâncias e faz a busca inteira, sem copiar uma calculadora externa.

O pacote drc e sua documentação EDcomp foram consultados para comparação de doses efetivas e método delta; drc é GPL-2 e nenhum código seu foi incorporado ou portado. A validação em Python é uma implementação independente com NumPy/SciPy; não é dependência do navegador. Avisos e licenças existentes permanecem preservados.

Referências metodológicas: Dinse & Umbach (2012), *Parameterizing Dose-Response Models to Estimate Relative Potency Functions Directly*, DOI https://doi.org/10.1093/toxsci/kfs209; O’Brien & Silcox (2021), *Efficient experimental design for dose response modelling*, DOI https://doi.org/10.1080/02664763.2021.1880556; informação beta-binomial: DOI https://doi.org/10.1098/rsif.2018.0186. Esses trabalhos fundamentam informação, doses efetivas e potência relativa; não são apresentados como fornecedores desta rotina completa de dimensionamento com inclinações separadas.

## Verificação reproduzível

`python tests/generate-dose-comparison-reference.py`: 40 cenários SciPy 1.17.0. A referência usa coordenadas intercepto/inclinação e derivada beta-binomial por diferenças finitas de cinco pontos, distintas das coordenadas e score analítico do navegador. Abrange logit/probit, binomial/beta-binomial, inclinações diferentes, alocação 0,5/1/2, ICC/tamanhos distintos, efeito próximo de 1, razão abaixo de 1, perdas, significância familiar e grades de tamanhos diferentes. Inteiros devem coincidir exatamente; tolerância relativa 2×10⁻⁶ nos valores contínuos. Testes verificam ainda minimalidade, monotonicidade, entradas incompatíveis e integração sem sobrescrita.

`python tests/simulate-dose-comparison.py`: quatro diagnósticos de 600 ensaios, ajuste separado por máxima verossimilhança com Nelder–Mead e teste Wald com informação na estimativa. Falhas contam como não rejeições no poder incondicional. Resultados em `tests/dose-comparison-simulation.json`. Isso não valida universalmente pequenos ensaios nem substitui simulação específica do projeto.

Resultados do diagnóstico (600 ensaios por cenário; nenhuma falha de ajuste):

| Ligação e unidade | Alocação 2/1 | Poder planejado | Poder observado | Erro-padrão Monte Carlo |
|---|---:|---:|---:|---:|
| Logit, indivíduos | 1 | 80,07% | 79,33% | 1,65 p.p. |
| Probit, indivíduos | 2 | 80,22% | 79,50% | 1,65 p.p. |
| Logit, recipientes | 1 | 81,20% | 78,00% | 1,69 p.p. |
| Probit, recipientes | 0,5 | 82,37% | 81,17% | 1,60 p.p. |

As diferenças ficaram dentro de aproximadamente dois erros-padrão Monte Carlo, mas o cenário logit com recipientes ilustra que o poder real pode ficar abaixo de 80%. Não foi aplicada uma inflação arbitrária para esconder essa diferença; o resultado permanece identificado como assintótico. Para decisões finais, recomenda-se simular os parâmetros e o procedimento de ajuste específicos do projeto, incluindo a estimação do ICC se prevista.

A suíte completa passou em 569 testes. A interface foi verificada por testes de módulo e DOM simulado, incluindo confirmação antes de avançar, campos inicialmente vazios e bloqueio de curvas vinculadas. Não houve inspeção visual em navegador nesta entrega. Layout e demais textos existentes preservados; README não foi alterado.
