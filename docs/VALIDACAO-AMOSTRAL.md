# Validação — tamanho amostral 1.8.0

Atualização 18/10/2026: sobrevivência em recipientes com tempos exatos, dois grupos balanceados e correlação dos resíduos de martingale (Gangnon–Kosorok). Resultados com poucos recipientes são identificados como preliminares após diagnóstico de inflação do erro tipo I. Ver [CICLO-9-SOBREVIVENCIA-AGRUPADA.md](CICLO-9-SOBREVIVENCIA-AGRUPADA.md). 42 referências numéricas, 24.000 ensaios simulados e 637 testes. Sem porte GPL; README preservado.

Atualização 18/10/2026: comparação de duas CL50 independentes por Wald/Fisher, binomial ou beta-binomial com ICC conhecido. Ver [CICLO-8-COMPARACAO-CL50.md](CICLO-8-COMPARACAO-CL50.md). Reutilização MIT; sem código GPL incorporado. 40 referências numéricas independentes e diagnóstico por simulação.

Atualização 18/10/2026: comparação bilateral de duas sobrevivências independentes, Freedman via lifelines MIT ou Schoenfeld explícito. Conversão de duração para eventos exponencial, censura administrativa e inclusão uniforme. Freedman desigual bloqueado após simulação. Ver [CICLO-7-SOBREVIVENCIA.md](CICLO-7-SOBREVIVENCIA.md). Fonte, licença, 42 referências numéricas e diagnóstico por simulação incluídos.

Atualização 18/10/2026: LT50 por precisão com lognormal/log-logística, indivíduos independentes, visitas fixas, morte em intervalo e censura administrativa. Ver [CICLO-6-LT50.md](CICLO-6-LT50.md). jStat MIT reutilizado; lifelines MIT inspecionado sem incorporação. 24 referências numéricas independentes. Os registros anteriores continuam documentando CL50 e demais rotas.

Atualização 18/10/2026: precisão da CL50 em tempo fixo por logit/probit, binomial ou beta-binomial com ICC conhecido. Ver [CICLO-5-CL50.md](CICLO-5-CL50.md) e [CL50-PROVENIENCIA.json](CL50-PROVENIENCIA.json). Novas distribuições reutilizam o jStat MIT já incluído; nenhuma rotina GPL foi incorporada. 41 referências numéricas independentes e quatro cenários simulados. Os registros abaixo documentam também ciclos anteriores.

## Quarto ciclo — resultado atual

**334 testes automatizados aprovados**, incluindo os percursos anteriores. Os novos testes cobrem cálculos, hipóteses/covariâncias, contagens, perdas, campos condicionais, persistência e integração confirmada ao planejamento.

- **34 dimensionamentos** com SciPy 1.17.0 e projeções matriciais independentes em NumPy; igualdade de inteiros, totais e GL; tolerância absoluta do poder 2×10⁻⁷ e de λ 10⁻⁸.
- **14 verificações de dados simulados**, 100.000 experimentos por verificação, semente 20261016. Estatísticas calculadas dos dados observados para medidas repetidas e conjuntos; nível sob H0 e poder sob H1. Critério: quatro erros-padrão Monte Carlo mais 1/100.000.
- Quatro tamanhos publicados do Stata reproduzidos: 114, 3 e 27 por grupo para as três hipóteses do mesmo exemplo, e 20 unidades no exemplo de um grupo. Saída publicada do Superpower: λ=18,75 e poder 96,91634% conferidos. R/Stata não foram executados localmente; são referências publicadas, diferenciadas do SciPy/NumPy efetivamente executado.
- **57 telas geradas** verificadas estruturalmente: IDs, rótulos, referências ARIA, disclosures, links e importações locais. Ajuda recolhida e ausência de quadro lateral, link de métodos/limites e texto pronto preservadas.

Scripts, parâmetros, equações e limitações em [CICLO-4-DEPENDENCIA.md](CICLO-4-DEPENDENCIA.md). A inspeção visual em navegador real ou celular físico continua pendente.

## Terceiro ciclo — registro da versão 1.2.0

**276 testes automatizados aprovados**. Preserva os percursos anteriores e acrescenta 29 casos numéricos de parcelas subdivididas e várias unidades por tratamento e bloco, verificados com SciPy 1.17.0. Inteiros, totais e GL devem coincidir; tolerância absoluta do poder 2×10⁻⁷ e de λ 10⁻⁸. O script `tests/generate-structured-reference.py` gera os registros em `tests/structured-reference.json` de forma independente do JavaScript.

Também passaram **10 verificações de ANOVA por simulação dos dados**, com 100.000 experimentos por verificação e semente 20261015: nível sob H0 e poder sob H1 para A/B/interação e os dois modelos de blocos. A tolerância é quatro erros-padrão Monte Carlo mais uma observação/100.000. Não se confunde essa validação com dimensionamento por simulação em produção.

**42 telas geradas** foram verificadas estruturalmente: IDs únicos, rótulos, referências ARIA, disclosures, links e importações locais. Eventos com DOM simulado conferem campos condicionais, recuperação de parâmetros, bloqueio de subamostras e confirmação da aplicação ao plano. Não houve teste visual em navegador real/celular físico. Modelos, equações, proveniência e limites em [CICLO-3-ESTRUTURAS.md](CICLO-3-ESTRUTURAS.md).

Revisão da interface — fase 1: **171 testes aprovados**, incluindo os 153 abaixo e 18 novos. Registro em [FASE-1-INTERFACE.md](FASE-1-INTERFACE.md). O motor foi preservado; o resumo copiável da entrega original foi retirado da interface. A verificação visual em navegador real continua pendente.

## Segundo ciclo — registro da versão 1.1.0

**227 testes aprovados**. Novas referências: 12 valores críticos e 23 tamanhos/poderes contra SciPy 1.17.0, além de estados de interface, integração e execução do módulo de worker. Escopo, tolerâncias, limitações e exemplos em [CICLO-2-COMPARACOES.md](CICLO-2-COMPARACOES.md). Não houve teste visual em navegador real.

## Registro original da versão 1.0.0

153 testes automatizados passaram em 15/10/2026. Incluem regressão dos percursos anteriores, cálculos, campos, armazenamento e integração. A verificação de interface usou renderização e eventos com DOM simulado. Não houve inspeção visual em navegador real nem teste em aparelho celular nesta entrega; o CSS preserva a identidade existente e contém regras responsivas. Recomenda-se testar a publicação no celular antes de divulgar à turma.

## Referências numéricas

1. **SciPy 1.17.0**, distribuições `scipy.stats.ncf`, `nct`, `f`, `t`, `norm` (as não centrais usam implementações numéricas independentes, baseadas em Boost). Não é uma chamada do próprio código JavaScript em outro invólucro.
2. **OpenEpi original**, scripts `SSMean.js`, `SSCohort.js`, `SSPropor.js` da cópia baixada em 15/10/2026, identificados pelos hashes documentados. Executados em ambiente VM com captura das tabelas originais, sem alterar seus cálculos.
3. Equações de planejamento implementadas separadamente em Python, com SciPy nos quantis/distribuições e NumPy na decomposição dos efeitos fatoriais.

Documentação das distribuições: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ncf.html e https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.nct.html.

## Casos e tolerâncias

- **17 probabilidades de poder**: 11 F não centrais e seis t pareados. Tolerância absoluta de poder <2×10⁻⁶. Graus de liberdade de 1 até 999.998; não centralidades F até 1.000; valores de α de 0,0001 a 0,05 nos fixtures. Inclui ambas as caudas do pareado, uma cauda, grande n, pequenos graus de liberdade e poder próximo de 1.
- **32 tamanhos amostrais completos**: exigem igualdade exata dos inteiros por nível, total analisável e total inicial; quando há poder calculado, tolerância <2×10⁻⁶. Cobrem todos os 11 métodos, alocação desigual 0,5/2/2,3, direções negativas, correlação intrapar, efeitos pequenos, população finita, perdas e três termos fatoriais.
- **11 casos do OpenEpi original**: dez com recomendação comparada e um bloqueado pela triagem de baixa contagem esperada. Tolerância permitida de até uma unidade por grupo nos casos comparáveis, por diferenças entre constantes/ANorm originais e quantis jStat. O exemplo Rosner reproduziu 152 unidades em cada grupo.
- Um caso de Fleiss que o OpenEpi calcula, com baixa contagem esperada, é recusado deliberadamente pelo Ensaio; o teste confirma essa recusa, em vez de afirmar equivalência de recomendação.
- Testes de direção: poder e variabilidade maiores aumentam n; diferença ou margem maiores reduzem n, mantendo os outros parâmetros.
- Rejeições: campos vazios, não números, separadores ambíguos, grupos fracionários, efeito nulo, sinal incompatível, interação nula, proporções extremas incompatíveis com aproximação, população insuficiente após perdas e ausência de solução no intervalo de busca.
- A rotina F inicialmente não convergiu em quatro casos de referência com não centralidade elevada. A soma foi corrigida para pesos relativos com controle de cauda geométrica; esses mesmos casos permanecem na suíte e passam.

As tolerâncias descrevem os casos executados, não uma certificação de erro máximo uniforme em todo o espaço de parâmetros. Fora do domínio validado, o módulo deve falhar explicitamente e não extrapolar com uma aproximação escondida.

## Exemplos reproduzidos

| Situação, α=5% e poder=80% quando aplicáveis | Quantidade analisável |
|---|---|
| Média, DP=8, margem=2, confiança=95% | 62 unidades |
| Proporção=50%, margem=5 pontos, confiança=95% | 385 unidades |
| Duas médias, Δ=5, DP1=DP2=8, alocação igual | 41 por grupo (aproximação normal) |
| Pareado, Δ=5, DPdif=8, bilateral | 23 pares; poder 81,7107% |
| ANOVA, médias 10/12/15, DP=8 | 50 por tratamento; total 150 |
| DBC, médias 10/12/15, DP residual=4 | 14 blocos; total 42 |
| Mesmo DBC com 10% de perda de blocos | 16 blocos inicialmente; total 48 |
| Conglomerados, p=50%, margem=5 pontos, m=20, ICC=0,05 | 38 conglomerados; 760 observações vinculadas |

## Integração e interface

- Abertura direta sem planejamento.
- Importação do plano em duas etapas, com prévia e confirmação; nenhuma diferença ou variabilidade presumida.
- Confirmação obrigatória para aplicar; cópia do estado anterior preservada até a aplicação.
- DBC modifica número de blocos e uma unidade por tratamento/bloco; DIC não recebe um número calculado para blocos.
- Fatorial verifica ambos os níveis, cruzamento completo e ausência de blocos.
- Razões desiguais não são convertidas em replicação igual.
- Subamostras, datas, equipamentos e múltiplos níveis não são declarados independentes.
- Plano alterado e versão antiga bloqueiam transferência; editar parâmetros invalida o resultado visível.
- Vírgula decimal, mensagens de erro focadas, resumo copiável e restauração de parâmetros sem reutilizar resultados antigos.
- Regressão: testes existentes de planejamento, análise, exemplos fixos, glossário, escape de texto e ajudas expansíveis continuam passando.

## Como executar

Somente para manutenção do código; o usuário do site não instala nada.

```sh
node --test tests/*.test.mjs
python3 tests/generate-reference.py
node tests/record-openepi-reference.mjs /caminho/OpenEpi/SampleSize
```

Os fixtures de referência ficam no repositório. `generate-reference.py` requer SciPy/NumPy para regerá-los; não é necessário para rodar os testes JavaScript ou publicar o site. Os cálculos do navegador não acessam OpenEpi, SciPy, WebPower ou qualquer serviço remoto.
