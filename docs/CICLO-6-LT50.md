# Ciclo 6 — precisão da LT50 com avaliações em horários fixos

Motor 1.5.0. Entrada: **Tamanho amostral → Calcular diretamente → Planejar acompanhamento até um evento → Planejar a precisão de uma LT50**.

## Escopo

Dimensiona uma única condição, para estimar a mediana do tempo até a morte com precisão multiplicativa definida. Modelos lognormal ou log-logístico, dois parâmetros estimados conjuntamente. Não calcula poder de comparação de tratamentos, log-rank ou Cox; não ajusta dados coletados.

Cada indivíduo precisa ser uma unidade independente, acompanhado desde o tempo zero, nos mesmos horários fixos, sem entrada tardia, reposição ou amostragem destrutiva. Compartilhar um recipiente tratado pode gerar dependência: essa opção é reconhecida e bloqueada, sem substituir recipientes por organismos nem aplicar um DEFF genérico a sobrevivência.

Duas mortalidades **acumuladas esperadas**, em tempos crescentes, definem a curva de planejamento. O usuário informa os horários reais e a precisão. Por exemplo: 20% mortos até 24 h, 80% até 96 h, avaliações em 24;48;72;96;120;144;168 h. As previsões vêm de literatura ou piloto, não de importação ou análise de dados.

## Censura e informação

Um indivíduo produz uma única categoria: morte no intervalo (t anterior, t atual], ou sobrevivência além do último horário. Não são várias respostas binárias independentes. O primeiro intervalo começa em zero. Quem permanece vivo no fim é censurado à direita e contribui com informação. A morte não é atribuída exatamente ao horário em que foi constatada.

Defina θ=ln(LT50), b>0 e η=b[ln(t)−θ]. Para lognormal, F(t)=Φ(η), equivalente a ln(T) normal com média θ e desvio 1/b. Para log-logística, F(t)=expit(η).

As probabilidades são q₁=F(t₁), qⱼ=F(tⱼ)−F(tⱼ₋₁), e q final=1−F(t último). A matriz por indivíduo é I=Σ [(∇q)(∇q)ᵀ/q], incluindo θ e b. Diferenças de sobrevivência são usadas nas caudas para reduzir cancelamento numérico. A soma das probabilidades e a estabilidade da matriz são verificadas.

Com V=[I⁻¹]θθ e fator máximo f, N=teto[z²V/ln(f)²], respeitando o mínimo computacional de dois indivíduos. O fator efetivo é exp[z sqrt(V/N)]. É uma aproximação log-Wald local; não é garantia da largura ou cobertura do intervalo futuro. A forma da curva é parâmetro auxiliar, não conhecida no ajuste futuro.

Mais visitas podem refinar os intervalos e aumentar informação sem gerar novos indivíduos. A duração precisa abranger a mediana prevista: primeira visita antes e última depois. Esta versão recusa dimensionar mediana extrapolada para além do acompanhamento.

## Resultado e perdas

Apresenta indivíduos independentes para uma condição, inclusão inicial, LT50 esperada, limites planejados, probabilidades de cada intervalo e proporções esperadas de mortos/vivos. As quantidades de eventos e sobreviventes são **valores esperados**, não metas nem contagens obrigatórias.

Perdas: teto[N/(1−p)] para indivíduos inteiramente sem informação. Não conte mortos nem vivos censurados como perdas. Essa inflação não representa abandonos informativos ou um modelo de horários de abandono.

Exemplo fictício acima, lognormal, confiança 95%, fator máximo 1,20:

- LT50 esperada: 48 h.
- 86 indivíduos independentes numa condição.
- Limites planejados aproximados: 40,0081–57,5883 h.
- Até 168 h: aproximadamente 80,486 eventos e 5,514 sobreviventes esperados.
- Com 10% inteiramente sem informação: 96 indivíduos inicialmente.

O mesmo cenário log-logístico requer 91 indivíduos. São modelos diferentes, não opções intercambiáveis para escolher o menor resultado.

## Limites e integração

Não cobre agrupamento em recipientes, dependência entre indivíduos, comparação entre curvas, riscos competitivos, fração que nunca apresenta o evento, mortalidade por causas distintas, observação contínua exata, horários diferentes entre indivíduos, entrada tardia ou abandonos informativos. Nessas situações é preciso outro modelo, eventualmente por simulação.

Faixa numérica: 3–30 horários positivos distintos, 10⁻⁹–10⁹ nas unidades informadas; mortalidades de referência entre 1% e 99%; b entre 0,05 e 20; probabilidades dos intervalos maiores que 10⁻¹²; confiança 80%–99,9%; fator de precisão 1,05–2; perdas até 90%; inclusão até dez milhões. Matriz singular ou instável é recusada. Poucos eventos/indivíduos geram alerta, não certificação automática de validade.

Transferência para planejamento bloqueada: o modelo atual do planejamento não registra evento, intervalos e censura, e o total não deve virar repetições por tratamento. Parâmetros anteriores do motor 1.4.0 são recuperáveis, mas resultados antigos precisam ser recalculados. Mesmas chaves de armazenamento, estética e textos dos módulos anteriores. README não foi alterado.

## Código aberto e referências

- **jStat 1.9.6, MIT**, commit `72f367f6dbd45c2d903053ee3f9981489912cad4`, arquivo já distribuído `sample-size/vendor/jstat.mjs`: reutilizados `normal.inv`, `normal.cdf` e `normal.pdf`. Nenhum novo pacote de execução.
- **lifelines 0.30.0, MIT**: código efetivamente inspecionado, `LogNormalFitter` e `LogLogisticFitter`, incluindo funções de sobrevivência/risco acumulado. Não é uma calculadora pronta desta precisão prospectiva; nenhum código do pacote foi portado ou incorporado. A referência dos modelos foi utilizada; matriz multinomial e arredondamento são implementação própria, não porte de uma rotina de dimensionamento existente.
- NIST/SEMATECH e-Handbook, Lognormal: https://www.itl.nist.gov/div898/handbook/apr/section1/apr164.htm
- NIST, planejamento de testes lognormais: https://www.itl.nist.gov/div898/handbook/apr/section3/apr312.htm . O plano NIST de aceitação com forma conhecida **não foi usado como se fosse** este cálculo; serve como contexto de modelos e censura.
- Modelos e censura: https://lifelines.readthedocs.io/en/stable/fitters/univariate/LogLogisticFitter.html e https://lifelines.readthedocs.io/en/latest/fitters/univariate/LogNormalFitter.html . A documentação online pode exibir versão posterior à fonte auditada.

## Validação

24 cenários em `tests/lifetime-reference.json`, gerados por `tests/generate-lifetime-reference.py` com SciPy 1.17.0. Referência independente usa distribuições `lognorm`/`fisk`, localização e log-escala/log-forma, diferenças finitas de cinco pontos e inversão NumPy. O navegador usa derivadas analíticas em θ/b. Quantidades inteiras coincidem exatamente; parâmetros contínuos usam tolerância relativa 2×10⁻⁶. Variam modelo, calendário, confiança, perdas, precisão e unidade de tempo.

Testes cobrem censura, soma das probabilidades, ampliação/refinamento do calendário, contagem independente, bloqueio de recipientes, extrapolação e dados inválidos. Diagnóstico adicional de amostra finita em `tests/simulate-lifetime.py`: tempos de evento são gerados e depois agrupados nos intervalos previstos; ajustes usam verossimilhança multinomial. Resultados, semente e erros Monte Carlo estão em `tests/lifetime-simulation.json`. Em 400 ensaios por modelo, coberturas de 95,25% (lognormal) e 94,25% (log-logística), com erros Monte Carlo de 1,06 e 1,16 ponto percentual; zero falhas de convergência nesses cenários. Otimização Nelder–Mead da verossimilhança dos intervalos. Não é garantia de precisão em qualquer cenário.

453 testes automatizados passaram. Sem inspeção visual em navegador nesta entrega. Sem alteração no README e sem necessidade de servidor, SAS, R ou Python para usar o cálculo no site.
