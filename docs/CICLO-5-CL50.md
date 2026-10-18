# Ciclo 5 — planejamento por precisão da CL50 (motor 1.4.0)

## Disponível

Nova entrada em **Tamanho amostral → Calcular diretamente → Planejar uma curva de concentração–resposta → Planejar a precisão de uma CL50**. Cada escolha continua exigindo Avançar. O cálculo é prospectivo: não importa dados, não ajusta mortalidades coletadas e não executa testes. Os outros textos didáticos e o visual foram preservados.

Dois modelos crescentes em log natural da concentração: logit e probit. O usuário prevê mortalidades em duas concentrações, no mesmo tempo fixo, com base em literatura ou piloto. A partir delas, são obtidas a inclinação e a CL50 esperadas. A inclinação **será estimada juntamente com a CL50 na análise futura**: a informação usada aqui inclui os dois parâmetros; ela não é tratada como conhecida no ajuste.

- Cada indivíduo recebe a aplicação separadamente: distribuição binomial.
- Cada recipiente recebe a aplicação e contém vários organismos: distribuição beta-binomial; mesmo número analisável por recipiente e ICC comum **fixado para planejar**. A incerteza de estimar o ICC no experimento não está incluída.
- Alocação igual entre concentrações positivas; controle zero opcional com a mesma quantidade por condição. Recipientes independentes entre si.
- Uma avaliação binária em tempo fixo. Mortes são desfechos; não são perdas.
- Limites inferior e superior da curva fixos em 0% e 100%. Se a hipótese de mortalidade de fundo nula não for adequada, o cálculo é bloqueado. Não há ajuste de Abbott nem estimação de mortalidade de fundo.

Não escolhe automaticamente as concentrações nem o melhor modelo. A lista deve ter 3–12 concentrações positivas distintas, em ordem, abrangendo a CL50 prevista. O usuário escolhe concentrações e precisão; a ferramenta dimensiona repetições dessa composição, sem afirmar que ela é ótima.

## O que significa precisão

Com CL50 esperada de 2 e fator solicitado 1,20, o alvo é um intervalo aproximadamente entre **2/1,20 = 1,667 e 2×1,20 = 2,4**. Isso não corresponde a ±20% simétricos na escala original, margem em pontos percentuais nem poder para comparar tratamentos.

O fator efetivo após arredondamento e os limites planejados são mostrados. São medidas de precisão **assintóticas locais**, baseadas na curva esperada; não são um intervalo de confiança calculado com dados nem garantias da largura ou cobertura futuras.

## Equações implementadas

Defina θ = ln(CL50), x = ln(c) − θ e η = b x. Para logit, p(c) = expit(η); para probit, p(c) = Φ(η). Duas probabilidades previstas definem b = [g(p2) − g(p1)] / ln(c2/c1) e θ = ln(c1) − g(p1)/b.

Com m organismos por unidade e ICC ρ conhecido, Y segue beta-binomial com parâmetros a = p(1/ρ − 1), d = (1−p)(1/ρ − 1). A informação de p por recipiente é a soma finita E[(∂ ln P(Y)/∂p)²] sobre Y=0,…,m. O score é avaliado por somas de recíprocos equivalentes às diferenças de funções digama. Não se usa um simples multiplicador DEFF no lugar da informação beta-binomial.

No caso binomial independente, a informação de p é m/[p(1−p)], com m=1 na rota individual. A derivada de p em relação a η é p(1−p) para logit ou φ(η) para probit. A derivada de η em relação a (θ,b) é (−b,x).

A matriz por uma unidade em cada concentração é a soma dos produtos externos ponderados. Se V = [I⁻¹]θθ, então r = teto[z² V / ln(fator)²]. A matriz inclui inclinação como parâmetro auxiliar; sua estabilidade é verificada. Com r unidades por concentração, o fator planejado é exp[z sqrt(V/r)]. O número inicial por condição é teto[r/(1−perdas)].

Controle zero não entra no logaritmo nem acrescenta informação à curva com mortalidade de fundo fixada em zero. Suas unidades entram no total e servem para verificar essa hipótese no ensaio.

## Exemplo reproduzível

Exemplo fictício: logit; concentrações 0,5; 1; 2; 4; 8; mortalidades previstas de 20% na concentração 1 e 80% na concentração 4; avaliação em 72 h; dez organismos por recipiente; ICC 0,05; confiança de 95%; fator máximo 1,20.

- CL50 esperada: 2; inclinação por ln(c): 2.
- Necessário: **7 recipientes por concentração**, mais 7 no controle: **42 recipientes / 420 organismos**.
- Fator após arredondamento: aproximadamente 1,18458; limites planejados aproximadamente 1,68836–2,36916.
- Perdas de recipientes inteiros de 10%: **8 por condição; 48 recipientes / 480 organismos** inicialmente.

Os números exemplificam as hipóteses informadas; não são uma recomendação universal para bioensaios.

## Validação e limites

41 cenários independentes em `tests/dose-response-reference.json`, reproduzíveis por `tests/generate-dose-response-reference.py` com SciPy 1.17.0. A referência usa coordenadas intercepto/inclinação e método delta, diferentemente da parametrização θ/inclinação do navegador. O score beta-binomial de referência é obtido por diferenças finitas de cinco pontos do logpmf do SciPy, não pelas somas usadas no JavaScript.

Quantidade inteira e totais: concordância exata. Valores contínuos: tolerância relativa 2×10⁻⁶. Casos: logit/probit, indivíduos/recipientes, m=10 ou 100, ICC 0,001–0,5, confiança, perdas, ausência de controle e mudança de escala da concentração. Conferidos monotonicidade esperada, cálculo multiplicativo, bloqueios e integração.

Diagnóstico de amostras finitas: quatro cenários, 600 ensaios simulados por cenário, semente 20261018 (`tests/simulate-dose-response.py`, resultados em `dose-response-simulation.json`). Contagens foram simuladas e modelos ajustados com SciPy; ICC foi mantido conhecido. Coberturas incluindo ajustes que falharam: 95,67%, 94,83%, 93,33% e 95,00%, com erros Monte Carlo de aproximadamente 0,8–1,0 ponto percentual. Falhas de ajuste: 7, 1, 9 e 3 em 600, respectivamente. Esses resultados são diagnósticos ilustrativos, não validação de toda configuração nem garantia de cobertura de 95%.

As rotinas verificam matriz singular/instável e domínio numérico. Não há busca iterativa: a informação escala linearmente com r; o arredondamento determina o menor inteiro para o alvo dessa aproximação. Recusa probabilidades previstas fora de 0,00001–0,99999, concentrações fora de 10⁻⁹–10⁹, inclinação fora de 0,05–20, mais de 100 organismos por recipiente, ICC fora de 0,001–0,5 na rota de recipientes e inclusão de mais de dez milhões de unidades. Poucas unidades e escassez esperada de mortes/sobreviventes geram alertas. Não se presume que mais organismos em um recipiente substituam recipientes independentes.

Sem LT50, censura/sobrevivência, múltiplas curvas ou razão de CL50; sem mortalidade de fundo estimada, dispersão estimada, blocos ou dependência entre recipientes. **Essas são próximas extensões, não cálculos silenciosamente aproximados por esta rota.**

O planejamento atual não registra doses numéricas, tempo binário nem ICC: transferência automática é bloqueada e explicada. A versão 1.4.0 recupera parâmetros de 1.3.0, mas resultados antigos precisam ser recalculados. Não foram alteradas chaves de armazenamento.

## Referências e código aberto

- O’Brien, T. E.; Silcox, J. (2021). *Efficient experimental design for dose response modelling*. Journal of Applied Statistics 48:2864–2888. https://doi.org/10.1080/02664763.2021.1880556
- *Optimal experimental design for predator–prey functional response experiments* (2018). Journal of the Royal Society Interface 15:20180186. Informação beta-binomial desenvolvida no apêndice. https://doi.org/10.1098/rsif.2018.0186
- jStat 1.9.6 (MIT), commit `72f367f6dbd45c2d903053ee3f9981489912cad4`: reutilizados `normal.inv`, `normal.cdf`, `normal.pdf` e `gammaln` do arquivo já distribuído `sample-size/vendor/jstat.mjs`. Sem novo código de terceiros incorporado.
- `drc` 4.0-0 (GPL-2), `DoseFinding` 1.4-2 (GPL-3), `drda` 2.0.5 (MIT) e `statsmodels` v0.14.6 (BSD-3-Clause) foram inspecionados; nenhum código deles foi incorporado. `drc::ED` estima doses de ajustes existentes; `DoseFinding::optDesign` não é uma calculadora pronta desta precisão; `drda` trabalha com resposta contínua; `statsmodels::GLM.information/hessian_factor` fornece referência da informação GLM, mas não foi portado.
- Fórmulas específicas, matriz, score e arredondamento de `sample-size/dose-response.mjs`: implementação própria a partir dos modelos; não um porte disfarçado dos pacotes GPL. Auditoria e hashes em `CL50-PROVENIENCIA.json`.

Sem dependência de servidor, R, Python, SAS ou serviços pagos no navegador. Python é usado apenas nas verificações reproduzíveis, fora do site. Sem inspeção visual em navegador nesta entrega.
