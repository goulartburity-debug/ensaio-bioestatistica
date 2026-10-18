# Ciclo 9 — sobrevivência agrupada (cálculo 1.8.0)

## O que está disponível

Tamanho amostral → Planejar acompanhamento até um evento → Comparar sobrevivência em recipientes.

Pré-dimensionamento de dois grupos balanceados de recipientes sorteados inteiros, independentes entre si, com igual quantidade analisável de organismos. O cálculo separa recipientes de organismos e inclui perdas de recipientes inteiros. Não executa análise de dados coletados. Mantém as demais rotas e o README.

Requer tempos de evento registrados, início simultâneo, censura administrativa comum à direita, marginais exponenciais e riscos proporcionais marginais. Medianas informadas são populacionais; não são medianas condicionais à fragilidade de um recipiente. Não inclui contágio, tamanhos diferentes, alocação desigual, blocos ou pares. Mortalidade observada apenas em visitas é censura intervalar e permanece indisponível nesta rota — atribuir o evento ao horário da visita não resolve isso.

## Método e parâmetro de dependência

Implementação da especialização de Gangnon & Kosorok (2004), seção 4, para atribuição de conglomerados inteiros. D é a probabilidade média de evento prevista pelas duas marginais exponenciais no encerramento; m é o tamanho comum do recipiente. O fator de agrupamento é 1+(m−1)ρ, sendo ρ a correlação dos resíduos de martingale sob H0 no acompanhamento planejado. Não é o ICC de mortalidade final, a correlação dos tempos, tau de Kendall ou a variância de um modelo de fragilidade.

O programa calcula a informação de eventos ajustada por esse fator e busca o menor inteiro de recipientes por grupo que atinja o poder normal aproximado. A conversão de medianas para eventos é uma hipótese paramétrica explícita. Há ajuste de Bonferroni quando o usuário informa mais de uma hipótese na família. A análise correspondente é log-rank com variância robusta por recipiente; log-rank comum que ignora os recipientes não corresponde ao dimensionamento.

ρ deve vir de estudo comparável ou de simulação compatível com a dependência e a censura. O artigo descreve sua investigação por resíduos de Cox sem efeito de tratamento. Sua incerteza não é propagada neste cálculo. Nenhum ρ é presumido: campos abrem vazios. Valores 0,05/0,10/0,20 nos cenários são hipóteses didáticas e não estimativas ou recomendações.

Busca de 2 a um milhão de recipientes por grupo, 2–100 organismos por recipiente, ρ de 0,001 a 0,5 e HR de 0,5 a 2, diferente de 1. Há limite de dez milhões de organismos iniciais. Falha de solução produz mensagem, sem truncar n. Perdas dividem cada quantidade por 1−p e arredondam para cima, preservando grupos inteiros. Vivos censurados e mortos não são perdas. Perdas internas não são dimensionadas.

## Resultado preliminar com poucos recipientes

O diagnóstico encontrou inflação do erro tipo I com poucos recipientes. Por isso, quando a fórmula resulta em menos de 30 recipientes por grupo, a interface mostra, antes da quantidade, **“Estimativa preliminar”** e informa que não se trata de recomendação final. Não há inflação automática para chegar a 30. Esse é um critério de triagem do software, não um limiar estatístico universal nem comprovação de validade acima dele. A simulação específica e eventuais correções da análise continuam necessárias. Não foi inventada uma correção t ou transplantada correção de outro modelo.

Exemplo fictício: medianas 48 e 72 horas, seguimento comum 168 horas, 10 organismos por recipiente e ρ=0,10. α bilateral 5%, poder 80%. A fórmula fornece 22 recipientes por grupo, 44 recipientes e 440 organismos; poder aproximado 81,47%. Com perdas inteiras de 10%: 25 por grupo, 50 recipientes iniciais e 500 organismos. A saída é explicitamente preliminar. Isso não dimensiona o bioensaio avaliado somente a cada 24 horas.

## Código aberto e fontes

Reutilização efetiva: jStat 1.9.6 MIT (`normal.cdf`, `normal.inv`), `integerSearch` e `eventProbability` dos módulos MIT existentes do CoDel-Stat. A rotina de combinação é uma implementação das equações publicadas, não uma calculadora externa portada. Avisos e licenças existentes preservados.

Foram inspecionados `DESCRIPTION` e `R/frailtyDesign.R` do frailtypack 3.8.1, funções `SFM.power`/`SFM.ssize`. O pacote é GPL ≥2 e usa outra análise, com fragilidade, simulação/informação e rotinas compiladas. Não se copiou ou portou seu código. CRTSize 1.2 (GPL ≥2) não oferece a rota de sobrevivência em sua lista de métodos; não foi incorporado. Não há servidor, execução de R, serviço remoto ou dependência paga.

Referência principal: Gangnon RE & Kosorok MR (2004), *Sample-size formula for clustered survival data using weighted log-rank statistics*. Biometrika 91:263–275. DOI https://doi.org/10.1093/biomet/91.2.263. Texto dos autores: https://rgangnon.org/publication/gangnon-2004/gangnon-2004.pdf.

Contexto das limitações: Wang X, Turner EL & Li F (2023), *Improving sandwich variance estimation for marginal Cox analysis of cluster randomized trials*. DOI https://doi.org/10.1002/bimj.202200113. Não se afirma que o método de correção desse artigo foi implementado.

## Verificação e limites

42 referências numéricas SciPy 1.17.0: solução fechada com arredondamento comparada à busca inteira JavaScript. Inteiros idênticos; tolerância relativa/mista de 2×10⁻⁷ nos valores contínuos. Incluem efeito pequeno, HR nos limites, alta confiança/poder, Bonferroni, correlação e tamanho do recipiente nos limites, seguimento longo/curto, perdas e reescala do tempo. Validação de monotonicidade, minimalidade e mensagens de incompatibilidade. Scripts e dados em `tests/cluster-survival-*` e `tests/generate-cluster-survival-reference.py`.

Simulação independente: seis cenários de 4.000 ensaios cada (24.000 ensaios com pares alternativa/H0), marginais exponenciais e cópula de sobrevivência Clayton. O parâmetro da cópula foi calibrado numericamente para a correlação residual sob H0, por quadratura Gauss–Legendre de 64 pontos; não foi igualado ao ICC bruto. Em cada ensaio, a variância empírica do log-rank é construída somando os resíduos ponderados por recipiente, com riscos basais estimados separadamente nos grupos (teorema 2 da referência). Falhas contam como não rejeições; não ocorreram falhas. Essa simulação é um diagnóstico de uma estrutura de dependência, não prova para todas as distribuições.

| Cenário | Recipientes/grupo | Poder previsto | Poder observado | Rejeição sob H0 (α nominal 5%) |
|---|---:|---:|---:|---:|
| Exemplo, ρ=0,10 | 22 | 81,47% | 82,73% | 6,48% |
| Exemplo, ρ=0,20 | 32 | 80,97% | 81,28% | 5,43% |
| Dois organismos, ρ=0,20 | 67 | 80,07% | 80,15% | 5,68% |
| Mediana 2=96 h | 8 | 81,52% | 82,13% | 10,03% |
| Seguimento 48 h | 42 | 80,28% | 80,25% | 5,08% |
| Mediana 2=40 h | 97 | 80,15% | 80,15% | 5,83% |

Erro-padrão Monte Carlo do poder perto de 0,6 ponto percentual; sob H0 perto de 0,35 ponto. Os resultados não autorizam afirmar controle exato do erro tipo I, inclusive nos cenários maiores. Há aproximação local e incerteza de simulação.

Suíte completa: 637 testes passaram. Interface verificada por testes de módulo/DOM simulado: seleção seguida de confirmação, campos vazios, contagens por nível, aviso preliminar destacado, cenários, bloqueio de visitas intervalares e preservação do planejamento. Não houve inspeção visual em navegador.

## Integração e pendências

O planejamento existente não representa a censura e a correlação residual. Por isso a quantidade não é transferida automaticamente nem convertida em repetições genéricas. Entradas são armazenadas com método e versão 1.8.0; entradas antigas podem ser recuperadas, mas resultados precisam ser recalculados.

Permanecem para métodos próprios: sobrevivência agrupada com censura intervalar, pequenos números de recipientes com inferência calibrada, dependência por fragilidade paramétrica, grupos/tamanhos desiguais e perdas internas. Este ciclo não transforma todas essas estruturas em um único cálculo.
