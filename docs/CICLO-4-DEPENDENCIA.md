# Quarto ciclo — medidas repetidas e tratamentos aplicados a conjuntos

Motor 1.3.0, 15/10/2026. A calculadora passa de 16 a 18 rotas. Base funcional: pacote do terceiro ciclo, motor 1.2.0. A conferência do repositório remoto no commit `1feddbd045ba180f8445af916e76e0618780b8e3` encontrou arquivos novos na raiz e versões antigas de homônimos nas subpastas; a implementação preserva a estrutura funcional dos diretórios do pacote anterior. Não altera a publicação nem remove arquivos remotos.

## O que foi entregue

- **Medidas repetidas**, nas mesmas unidades independentes: testes globais de tempo, grupos ou interação grupo × tempo sob simetria composta; um contraste previamente definido entre avaliações sob simetria composta ou AR(1).
- **Tratamentos atribuídos a conjuntos inteiros**: dimensionamento das médias de respostas contínuas, analisadas pelas médias de conjuntos independentes de tamanho igual, com ICC comum. Dois tratamentos correspondem ao t bilateral; mais tratamentos, ao teste global F.

As rotas não executam análise de dados coletados. São cálculos analíticos de planejamento no navegador, sem servidor ou serviço externo. Efeitos, variâncias, correlações e ICC são parâmetros de planejamento tratados como valores verdadeiros; a incerteza de sua estimação não é incorporada automaticamente. Exemplos são fictícios e só são preenchidos por ação explícita.

## Medidas repetidas — testes globais

Considere g grupos, n unidades por grupo, t avaliações, N=gn unidades independentes e médias de planejamento μij. Todos os grupos têm n unidades e a mesma matriz de covariância. Sob simetria composta:

Σ = σ²[(1−ρ)I + ρ11′].

σ é o DP marginal entre unidades do mesmo grupo e avaliação, não o DP das mudanças. O mesmo σ vale para as datas e grupos; a correlação ρ é a mesma para todo par de avaliações da mesma unidade. Exige −1/(t−1) < ρ < 1; o domínio computacional exclui uma faixa de 10⁻⁸ acima do limite inferior e limita |ρ| a 0,99. Essa matriz satisfaz esfericidade; não se introduz uma correção Greenhouse–Geisser arbitrária.

Sejam ri as médias de cada grupo ao longo das datas, cj as médias das datas sobre os grupos e M a média geral:

| Pergunta | GL numerador | GL denominador | Não centralidade λ |
|---|---:|---:|---|
| Grupos: diferença na média ao longo das datas | g−1 | N−g | nt Σ(ri−M)² / [σ²(1+(t−1)ρ)] |
| Tempo: mudança média, reunindo os grupos | t−1 | (N−g)(t−1) | N Σ(cj−M)² / [σ²(1−ρ)] |
| Interação: trajetórias diferentes entre grupos | (g−1)(t−1) | (N−g)(t−1) | n Σ(μij−ri−cj+M)² / [σ²(1−ρ)] |

Com um grupo, apenas tempo ou um contraste são definidos. O poder é a cauda superior da F não central no quantil F central 1−α. A diferença entre os três objetivos é explícita: mudar ao longo do tempo não demonstra que um tratamento muda mais que outro, e médias diferentes não implicam interação.

O teste entre grupos equivale à ANOVA das médias temporais de cada unidade. Os testes intraunidade usam projeções ortogonais no espaço dos contrastes entre avaliações; sob a covariância especificada, o erro desse espaço é esférico. A correlação maior pode aumentar o poder intraunidade e reduzir o poder entre grupos, mantendo médias e DP marginal constantes. Não se promete um benefício universal de mais correlação ou de mais datas.

## Um contraste entre avaliações — CS ou AR(1)

Uma comparação definida antes da coleta pode usar pesos c que somam zero. A opção inicial é última avaliação menos a primeira, c=(−1,0,…,0,1); pesos personalizados também são aceitos.

- Mudança esperada no grupo i: di = Σj cj μij.
- Variância da mudança de uma unidade: v = c′Σc.
- Um grupo: H0:d1=0; GL1=1, GL2=n−1, λ=n d1²/v. Equivale ao teste t bilateral da mudança individual.
- Vários grupos: H0:d1=…=dg; GL1=g−1, GL2=g(n−1), λ=n Σ(di−d̄)²/v. Para dois grupos, compara suas mudanças médias; não é o teste global da interação completa.

Na simetria composta, Σ tem a forma acima. Em **AR(1)**, Σjk=σ²ρ^|j−k|, com intervalos iguais entre avaliações e |ρ|≤0,99. A matriz é comum aos grupos e usa o mesmo DP marginal em todas as datas. Correlações negativas alternam sinal conforme a distância, sem invalidar a matriz AR(1) neste domínio.

AR(1) está disponível nesta versão somente para o contraste. Não se usa a F global de tempo/interação de CS com uma correlação AR(1) inserida no mesmo lugar. Matrizes gerais, heterocedasticidade, correções gerais de não esfericidade e modelos mistos completos continuam fora de escopo.

O contraste reduz cada vetor de avaliações a uma resposta normal escalar por unidade; o teste usa sua variância estimada, por isso o t/F normal correspondente é exato sob o modelo, sem aproximar pela normal padrão. Avaliações com peso zero não acrescentam diretamente sinal ao contraste. Ter três datas com pesos −1,0,1 não significa que a data intermediária triplica a replicação.

## Conjuntos tratados — modelo e contagem

Modelo de resposta contínua: Y_ilh = μi + u_il + e_ilh, com i tratamento, l conjunto e h indivíduo. Componentes independentes, u_il~N(0,σC²), e_ilh~N(0,σE²). Conjuntos independentes; mesmo tamanho analisável m, mesmas variâncias e mesma ICC em todos os tratamentos.

σ²=σC²+σE² é a variância marginal dos indivíduos dentro do tratamento, e ICC=σC²/σ². A média de um conjunto tem variância:

Vc = σ²[ICC+(1−ICC)/m] = σ²[1+(m−1)ICC]/m.

Com g tratamentos e K conjuntos por tratamento, a análise planejada é ANOVA das **médias dos conjuntos**, com:

- GL1=g−1; GL2=g(K−1).
- λ=K Σ(μi−μ̄)²/Vc.
- Para dois tratamentos e diferença Δ, λ=KΔ²/(2Vc): equivale ao t bilateral com GL=2K−2 e não centralidade t Δ√[K/(2Vc)].

O cálculo busca K com m fixo. O total independente é gK conjuntos; gKm são observações vinculadas. O DP informado é marginal entre indivíduos do mesmo tratamento, incluindo a variação entre conjuntos, e não o DP das médias dos conjuntos.

O cálculo utiliza a distribuição finita dos testes dessa análise, não apenas a multiplicação de um n individual pelo efeito de desenho. Mesmo com ICC=0, o denominador continua sendo o da análise escolhida das médias de conjuntos, sem trocar silenciosamente para graus de liberdade de indivíduos. Não se afirma que essa análise seja a única possível para todo ensaio agrupado.

Conjuntos muito pequenos em número recebem aviso sobre as hipóteses de normalidade das médias, variância comum e randomização; não se aplica um corte universal que certifique validade. A quantidade calculada não garante representatividade nem resultado significativo. Se o tratamento é aplicado separadamente aos indivíduos, a interface encerra essa rota e orienta escolher a estrutura de aplicação correspondente.

A rota não representa mortalidade binomial, CL50/LT50, sobrevivência, contagens, tamanhos desiguais, blocos, tratamentos em mais níveis de atribuição ou conjuntos acompanhados em várias datas. Não combina ICC e correlação temporal em um único número.

## Perdas e restrições

- **Repetidas:** n inicial = teto[n/(1−p)], por grupo, para manter n unidades com acompanhamento completo. O número de datas não muda. Perda de algumas datas, MMRM, imputação e outras estratégias não são representadas por esse ajuste.
- **Conjuntos inteiros:** K inicial = teto[K/(1−pC)], por tratamento.
- **Indivíduos dentro dos conjuntos mantidos:** m inicial = teto[m/(1−pI)], separado de pC. Total inicial = g × K inicial × m inicial. O poder usa os tamanhos analisáveis K e m. Perdas aleatórias podem gerar m desiguais, que o cálculo balanceado não modela nem garante evitar.

Até 10 grupos; 3–12 avaliações em repetidas; 2–10.000 indivíduos por conjunto; ICC de 0 a 0,99; pelo menos duas unidades por grupo ou dois conjuntos por tratamento. Busca limitada a um milhão de unidades independentes/conjuntos no total e, para agrupamentos, a dez milhões de observações analisáveis. Mantém o limite numérico da F não central λ≤5.000. Efeitos nulos, ausência de solução e entradas incompatíveis resultam em mensagem, sem tamanho fabricado. Campos do planejamento não recebem valores acima de 10.000 nem truncamentos.

Significância e poder continuam editáveis nas opções recolhidas, com valores iniciais identificados. O número de hipóteses permite Bonferroni explícito; o poder permanece o da hipótese escolhida sob esse limiar, não a probabilidade de detectar todos os efeitos. Novas rotas são balanceadas e bilaterais/tipo F; hipóteses unilaterais e alocação desigual não são convertidas automaticamente.

## Interface, integração e persistência

A apresentação em coluna única foi mantida, com ajuda recolhida, exemplos fictícios opcionais e explicações junto aos campos. Não foi adicionado quadro lateral, link de métodos/limites no formulário ou texto pronto para metodologia.

- Em repetidas, um grupo não oferece interação/grupo. AR(1) oferece apenas contraste. Covariância desconhecida encerra os campos de cálculo e explica o que falta; não assume avaliações independentes.
- Em conjuntos, dois tratamentos pedem a diferença relevante; três ou mais pedem médias. Perdas internas e de conjuntos são campos distintos.
- Cenários variam apenas correlação ou ICC em ±0,10, mantendo os demais parâmetros. Valores fora do domínio exibem mensagem na linha correspondente. Eles não estimam a correlação/ICC do estudo.
- Resultados registram `counts` e `initialCounts`, distinguindo unidades, datas/registros, conjuntos e indivíduos. As versões antigas não são restauradas como resultados atuais; entradas 1.0.0/1.1.0/1.2.0 podem ser retomadas para recálculo.
- Planejamento repetido compatível: um fator entre grupos, unidades individuais, sem blocos, mesmas datas e acompanhamento das mesmas unidades. Copia grupos/datas e pede hipótese e covariância; aplicação confirmada modifica apenas unidades por tratamento, preservando datas.
- Planejamento de conjuntos compatível: um fator, conjunto como unidade, observações internas registradas, sem blocos e tamanhos correspondentes. Copia tratamentos/m, pede confirmação da aplicação ao conjunto, DP e ICC. A prévia exibe conjuntos iniciais por tratamento e indivíduos iniciais por conjunto. Só altera após confirmação explícita.
- Estruturas combinadas, subamostras mais datas, números incompatíveis, equipamento/multinível, mudança posterior de plano e versão antiga impedem transferência. Um grupo único acompanhado funciona independentemente; o planejamento atual não representa esse caso como um experimento com dois ou mais tratamentos.

Fingerprint do plano, versão 1.3.0, parâmetros e resultado continuam registrados no navegador ao aplicar. Um resultado calculado antes de editar o plano não pode ser transferido silenciosamente. As rotas anteriores mantêm seu comportamento e seus números.

## Código aberto e método

Foi auditado e aproveitado **Superpower 0.2.4.1, MIT**, especificamente centramento, λ e GL de `power_oneway_within.R`, para um grupo e tempo sob CS. Porte em `vendor/superpower-within.mjs`; original R preservado em `tests/reference-source/`; licença integral e autoria incluídas. Avaliação de distribuição usa o motor F não central já validado, em vez de `pf/qf`; não é substituição por aproximação normal.

Modelos multigrupo, contrastes e conjuntos são implementações do Ensaio a partir das equações do modelo normal, com jStat 1.9.6 (MIT) e a F não central existente. CRTSize e longpower foram auditados, mas não incorporados: suas rotinas R e hipóteses não foram anunciadas como executadas no navegador. Identificadores, funções, hashes, adaptações e licenças em [CODIGO-ABERTO.md](CODIGO-ABERTO.md).

## Validação independente

- **34 dimensionamentos** com SciPy 1.17.0, `f.isf` e `ncf.sf`; projeções de Helmert/álgebra matricial NumPy para efeitos repetidos e variância c′Σc para contrastes. Não importa código JavaScript. Igualdade de n, totais analisáveis e iniciais, GL; tolerância absoluta de poder 2×10⁻⁷ e de λ 10⁻⁸. Confere que um tamanho a menos falha no alvo quando o resultado supera o mínimo de dois.
- Cobertura: grupo/tempo/interação, um/três grupos, três/quatro datas, correlações negativas válidas, CS/AR(1), contraste comum/pesos, efeito pequeno, poder 90%, α=1%, Bonferroni, fronteira de dois, ICC zero/alta, mais indivíduos, dez tratamentos e perdas nos dois níveis.
- **14 verificações por dados simulados**, 100.000 experimentos por verificação, semente 20261016. Normais multivariadas para observações repetidas e componentes aleatórios por conjunto mais erros por indivíduo para agrupamentos. As estatísticas vêm das somas de quadrados observadas, não de amostragem da própria F não central. Cobrem nível de 5% sob H0 e poder sob H1 para os três efeitos repetidos, contrastes CS/AR(1), conjuntos de dois/três tratamentos.
- Critério Monte Carlo: erro inferior a quatro erros-padrão Monte Carlo mais 1/100.000; não é uma certificação uniforme em todo o domínio. Script reproduzível `tests/generate-dependence-reference.py`, saídas em `tests/dependence-reference.json`.
- **Referências publicadas do Stata:** médias (145,135,130;145,130,120), σ=15, ρ=0,7, α=5%, poder 80%: 114/grupo para grupo; 3/grupo para tempo; 27/grupo para interação. Um grupo, médias (26,4;25,6;21), variância 77 e ρ=0,6: 20 unidades. Os quatro inteiros coincidiram.
- **Referência publicada do Superpower:** um grupo, 20 unidades, três condições, σ=1, ρ=0,8, f=0,25; λ=18,75, poder publicado 96,91634%. Porte confere dentro de 0,00001 ponto percentual. A reprodução usa médias simétricas exatas ±√(3f²/2),0; a ordem não afeta o teste global.
- Stata e R não foram executados no ambiente. Suas saídas publicadas são verificações externas adicionais; os cálculos e simulações SciPy/NumPy foram efetivamente executados. Não se alega portar Stata ou toda a funcionalidade de Superpower.
- Testes de integração verificam contagens por grupo versus total, registros vinculados, perdas, preservação de datas, prévia/consentimento, versão e mudanças de plano. Campos condicionais, persistência, mensagens e ausência dos recursos retirados também são verificados.

O total de testes e a verificação estrutural de HTML estão em [VALIDACAO-AMOSTRAL.md](VALIDACAO-AMOSTRAL.md). Não houve inspeção visual em navegador real ou celular físico: a ferramenta de navegador exigida pelo ambiente não estava disponível. DOM simulado e HTML estrutural não são apresentados como validação visual.

## Referências

- Muller, K. E.; LaVange, L. M.; Ramey, S. L.; Ramey, C. T. (1992). *Power calculations for general linear multivariate models including repeated measures applications*. JASA 87:1209–1226. https://doi.org/10.1080/01621459.1992.10476281
- Park, I.; Schutz, R. W. (1999). *“Quick and Easy” Formulae for Approximating Statistical Power in Repeated Measures ANOVA*. Measurement in Physical Education and Exercise Science 3:249–270. https://doi.org/10.1207/s15327841mpee0304_5
- Lakens, D.; Caldwell, A. R. (2021). *Simulation-Based Power Analysis for Factorial Analysis of Variance Designs*. Advances in Methods and Practices in Psychological Science. https://doi.org/10.1177/2515245920951503
- Superpower Book, [capítulo 4, tabela 4.7](https://aaroncaldwell.us/SuperpowerBook/repeated-measures-anova.html).
- StataCorp, documentação oficial [power repeated](https://www.stata.com/manuals/pss-2powerrepeated.pdf), exemplos 1 e 3–5, métodos e fórmulas. Consultada para conferir resultados, sem incorporação de código proprietário.
- Donner, A.; Klar, N. (2000). *Design and Analysis of Cluster Randomization Trials in Health Research*. Arnold.
- Rutterford, C.; Copas, A.; Eldridge, S. (2015). *Methods for sample size determination in cluster randomized trials*. International Journal of Epidemiology 44:1051–1067. https://doi.org/10.1093/ije/dyv113
