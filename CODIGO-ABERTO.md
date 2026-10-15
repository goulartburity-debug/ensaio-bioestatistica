# Código aberto, proveniência e licenças — tamanho amostral v1.3.0

Auditoria realizada em 15/10/2026. Esta documentação distingue código efetivamente distribuído, bibliotecas numéricas, fórmulas implementadas a partir da literatura e ferramentas apenas consultadas. A licença do módulo não altera automaticamente a titularidade dos materiais didáticos preexistentes.

## Código efetivamente utilizado

### jStat

- Projeto: https://github.com/jstat/jstat
- Versão declarada no `package.json`: 1.9.6.
- Commit fixado: `72f367f6dbd45c2d903053ee3f9981489912cad4`.
- Origem: `dist/jstat.js`; destino: `sample-size/vendor/jstat.mjs`.
- Licença: MIT; copyright (c) 2013 jStat, texto integral em `sample-size/licenses/jstat-MIT.txt` e no próprio módulo.
- Adaptação inicial: remoção do invólucro UMD e adição de `export {jStat}`. No ciclo 2 foram omitidas as implementações não utilizadas de `tukeyWprob`, `tukeyQinv`, `tukey.cdf` e `tukey.inv`, que o próprio código identifica como transcrições de rotinas de R. O cálculo novo de Tukey usa o núcleo SciPy descrito abaixo. As funções usadas anteriormente e as demais partes da biblioteca foram preservadas. Distribuição local, sem CDN.
- Funções usadas: `normal.inv`, `centralF.inv`, `studentt.inv`, `noncentralt.cdf`, `ibeta` e suas dependências internas.
- Uso: quantis de todos os métodos; t pareado unilateral; beta incompleta na avaliação própria da F não central; quantis F e t nos modelos normais.
- A série própria da F usa uma identidade de mistura Poisson–beta, com soma centrada no modo. Não é uma rotina de R traduzida. Foi validada contra SciPy/Boost. A distribuição t não central do jStat é usada somente na faixa de não centralidade até 20; o guia rejeita parâmetros além da faixa em vez de confiar no comportamento da biblioteca em toda a reta.

### OpenEpi

- Projeto: https://www.openepi.com/
- Download: https://www.openepi.com/Downloads/OpenEpi.zip — cópia obtida em 15/10/2026.
- Não há identificador de commit imutável no arquivo publicado; a identidade da rotina é fixada por SHA-256.
- Arquivo utilizado: `OpenEpi/SampleSize/SSMean.js`, função `CalcPower`, bloco “Sample size Calculation”.
- SHA-256 do arquivo original: `4596fc810d0436928ae2d92cc5017229a0909885c08a8fb616c5ff6cabe63de7`.
- Destino: `sample-size/vendor/openepi-means.mjs`, função `openEpiMeans`.
- Autores estatísticos indicados no arquivo: Minn M. Soe e Kevin M. Sullivan, Emory University. Aviso do projeto: copyright (c) 2003, 2008 Andrew G. Dean e Kevin M. Sullivan.
- Licença das partes originais: MIT, confirmada em https://www.openepi.com/BriefDoc/Licensing.htm; texto integral preservado em `sample-size/licenses/OpenEpi-MIT.txt` e referência no código adaptado.
- Adaptações: a função recebe valores já validados; devolve n1/n2 em vez de produzir uma tabela HTML; os quantis são calculados por jStat, em vez das constantes arredondadas da interface antiga. A estrutura da equação e os arredondamentos de n1 seguido de n2 foram preservados.
- Método: aproximação normal para duas médias de Rosner; DPs distintos e alocação desigual permitidos. A extensão unilateral é explícita: muda o quantil crítico para a cauda especificada. Não é anunciada como cálculo exato de Welch.
- Não foram copiados o framework de interface legado, `Norm`, `ANorm`, rotinas de John C. Pezzullo, nem outros componentes embutidos. Os arquivos `SSPropor.js` e `SSCohort.js` informam origem em Pezzullo; suas licenças componentes não foram presumidas como MIT apenas porque estavam no pacote. Eles serviram somente à comparação de resultados.

### SciPy 1.17.0 — código incorporado no segundo ciclo

- Projeto: https://github.com/scipy/scipy ; tag `v1.17.0`.
- Arquivo de origem: [`scipy/stats/_stats.pyx`](https://github.com/scipy/scipy/blob/v1.17.0/scipy/stats/_stats.pyx).
- SHA-256 do arquivo original examinado: `de1368dab08c654cce5a321fb47a590b9dc415336a61defd97e4c34be484f7dc`.
- Funções aproveitadas: núcleo de `_studentized_range_cdf_logconst`, `_studentized_range_cdf` e a fatoração normal em `_studentized_range_cdf_asymptotic`. O cálculo final continua integrando os graus de liberdade finitos; não foi adotada a aproximação de graus de liberdade infinitos.
- Destino: `sample-size/vendor/scipy-range.mjs`, funções `sdLogDensity` e `normalRangeTerm`, utilizadas em `multiple-numeric.mjs`.
- Licença: BSD-3-Clause, copyright (c) 2001–2002 Enthought, Inc. 2003, SciPy Developers. Texto integral em `sample-size/licenses/scipy-BSD-3-Clause.txt`.
- Adaptações: Cython → JavaScript; fatoração das densidades normal e qui; mudança de variável `y = sqrt(2*df)*(s−1)`; integração por quadratura de Gauss–Legendre e busca de quantil do Ensaio, em vez do integrador adaptativo do SciPy. As quantidades são comparadas com as rotinas originais, sem substituir silenciosamente a distribuição por uma normal.
- Dunnett: também foi examinado `_params_dunnett`/`_pvalue_dunnett` em [`scipy/stats/_multicomp.py`](https://github.com/scipy/scipy/blob/v1.17.0/scipy/stats/_multicomp.py), SHA-256 `8cf3185c8d0d0ebeb7e94c82c67b282a1d40b32cfcfa480b34e4bba832fc0be8`. O modelo e a correlação das comparações foram usados como referência; não foi portado o integrador QMC multivariado. O Ensaio integra a representação condicional válida para o caso balanceado, com a densidade de mistura reaproveitada acima.
- Referências: documentação `scipy.stats.studentized_range`, Batista et al. (2017), DOI 10.1590/1413-70542017414047716; Dunnett (1955), JASA 50:1096–1121.
- A verificação independente usa SciPy 1.17.0, `studentized_range`, `multivariate_t`, `nct` e `ncf`, além de uma integração adaptativa em Python. Essa verificação não é dependência do navegador.

### Superpower 0.2.4.1 — porte restrito no quarto ciclo

- Projeto: https://github.com/cran/Superpower ; versão CRAN 0.2.4.1; commit `4beaaf9fff3fba59b380a04dae180840e8a24c5e`.
- Origem: [`R/power_oneway_within.R`](https://github.com/cran/Superpower/blob/4beaaf9fff3fba59b380a04dae180840e8a24c5e/R/power_oneway_within.R), função `power_oneway_within`. SHA-256 original: `f0757d727e8a6e2a1482af3ef481a1a3a4c5c84046840a8f35a212cc51c58d2c`.
- Licença: `MIT + file LICENSE` em DESCRIPTION; LICENSE identifica YEAR 2021 e COPYRIGHT HOLDER Daniel Lakens and Aaron R. Caldwell. Não é GPL. Texto integral MIT e autoria preservados em `sample-size/licenses/Superpower-MIT.txt`.
- Destino: `sample-size/vendor/superpower-within.mjs`, função `superpowerWithin`. Porte do centramento das médias, λ e graus de liberdade para um grupo e um fator intraunidade com simetria composta. Omite os objetos de desenho e os indicadores de efeito não usados. A avaliação `pf/qf` usa a F não central/quantil já validada do Ensaio; não a aproxima por uma normal.
- Escopo reaproveitado: somente teste de tempo em um grupo. As fórmulas multigrupo e de contrastes são implementação do Ensaio a partir do modelo normal, identificadas separadamente. Não se declara que todo o módulo de medidas repetidas veio do Superpower.
- Original R preservado, sem alterações, em `tests/reference-source/power_oneway_within.R`; hash conferido nos testes. O arquivo se submete à licença MIT acima.
- Referência citada pela rotina original: Park & Schutz (1999), DOI 10.1207/s15327841mpee0304_5. Comparação contra saída publicada do Superpower, capítulo 4, tabela 4.7 (20 unidades, 3 condições, ρ=0,8, σ=1, f=0,25: λ=18,75 e poder 96,91634%). SciPy 1.17.0 e exemplo publicado do Stata para um grupo fornecem comparações adicionais. R e Stata não foram executados neste ambiente; suas saídas publicadas são distinguidas dos cálculos SciPy efetivamente executados.

## Métodos e origem, um a um

| Método do Ensaio | Código reaproveitado | Implementação da regra estatística / referência |
|---|---|---|
| Precisão de média | jStat 1.9.6, MIT | Equação normal de Cochran (1977), implementação do Ensaio |
| Precisão de proporção | jStat 1.9.6, MIT | Cochran (1977), implementação do Ensaio; confrontada também com `SSPropor.js` |
| Duas médias | OpenEpi `SSMean.js`, MIT; jStat, MIT | Bloco aritmético adaptado de `CalcPower`; Rosner, 5ª ed. |
| Pareado | jStat, MIT | Teste t não central e busca inteira do Ensaio; Cohen (1988), cap. 2 |
| Duas proporções | jStat, MIT | Fórmula publicada de Fleiss (1981), implementação própria; confrontada com coluna Fleiss do OpenEpi |
| ANOVA | jStat, MIT | F não central e balanceamento do Ensaio; Cohen (1988), cap. 8 |
| Fatorial sem blocos ou em DBC completo aditivo | jStat, MIT | Decomposição de médias e F do modelo fixo do Ensaio; Montgomery (2012), caps. 4–5 |
| DBC | jStat, MIT | Modelo aditivo e busca de blocos do Ensaio; Montgomery (2012), cap. 4 |
| Correlação | jStat, MIT | Aproximação z de Fisher; não é transcrição de `wp.correlation` ou `pwr.r.test` |
| Regressão | jStat, MIT | Teste F com λ=Nf²; modelo linear fixo e comparação aninhada |
| Dunnett balanceado | Densidade de mistura SciPy, BSD-3-Clause; jStat, MIT | Integração da distribuição t multivariada com correlação 0,5, busca inteira e poder marginal do Ensaio; Dunnett (1955) |
| Tukey balanceado | Núcleo SciPy 1.17.0, BSD-3-Clause; jStat, MIT | Integral de amplitude estudentizada com graus de liberdade finitos; poder de um par por t²/F não central e busca inteira do Ensaio |
| Contraste planejado | jStat, MIT | Equações publicadas de variância do contraste (NIST), poder t²/F não central e busca inteira do Ensaio; nenhum código R de pwrss/Superpower foi portado |
| Parcelas subdivididas em DBC | jStat 1.9.6, MIT; `fPower` e busca inteira do Ensaio, MIT | Equações próprias a partir do modelo e tabela ANOVA de Purdue STAT514/Montgomery; nenhum pacote R portado |
| Várias unidades por tratamento e bloco | jStat 1.9.6, MIT; motor F do Ensaio, MIT | Modelo aditivo e modelo com componente aleatório tratamento × bloco; equações próprias, validadas por ANOVA simulada e SciPy |
| Medidas repetidas, um grupo/tempo | Superpower 0.2.4.1 (MIT), centrar médias/λ/GL; jStat (MIT) e motor F existente | Porte específico; Park & Schutz (1999) e comparação com saída publicada do projeto |
| Medidas repetidas multigrupo ou contraste | jStat (MIT) e motor F existente | Equações do Ensaio, modelo multivariado normal; Muller et al. (1992). CS global; CS/AR1 para um contraste |
| Comparar médias em conjuntos iguais | jStat (MIT) e motor F existente | Variância da média de conjunto sob intercepto aleatório; ANOVA/t das médias, extensão balanceada do Ensaio. Donner & Klar (2000); Rutterford et al. (2015) |
| Conglomerados descritivos | jStat, MIT | DEFF=1+(m−1)ICC de Kish (1965), implementação própria; Cochran (1977) |

Os arquivos de autoria do Ensaio dentro de `sample-size/` são disponibilizados sob MIT em `sample-size/LICENSE.txt`. O arquivo adaptado de SciPy mantém BSD-3-Clause; os avisos dos terceiros permanecem com eles. Isso não relicencia o restante do site nem os livros, artigos ou materiais da professora.

## Candidatas examinadas, não incorporadas

### WebPower 0.9.4

- CRAN: https://cran.r-project.org/package=WebPower
- Fonte: `WebPower_0.9.4.tar.gz`, SHA-256 `c5fe0cfe94e4fc3ec9b83316861e3aa1d3a9eb2cfe3d18fdf7ce69926baaae45`.
- Licença declarada: GPL (≥3), confirmada no CRAN e em DESCRIPTION. Arquivo examinado: `R/webpower.R`, incluindo famílias ANOVA, regressão, correlação, medidas repetidas e multiníveis.
- Decisão: nenhum código copiado, portado ou incluído no site. Sua amplitude é útil como referência para futuras expansões, mas as rotinas R não são JavaScript pronto para GitHub Pages.
- Obrigações relevantes para uma futura incorporação: preservar avisos, fornecer licença e fonte correspondente e cumprir os termos GPL aplicáveis à obra derivada/distribuída. A licença MIT de um invólucro não remove obrigações GPL de dependências. A alternativa escolhida nesta entrega não incorpora esses componentes GPL; não se aplicou uma licença GPL ao site por inferência.
- Não se alega equivalência numérica universal com WebPower: alguns métodos e convenções diferem, em particular correlação, regressão e desenhos complexos. Nenhuma rotina foi simplificada silenciosamente sob o mesmo nome.

### Solis-Lemus Lab — sample-size-shinyapp

- Repositório: https://github.com/solislemuslab/sample-size-shinyapp
- Commit: `f2231aa2b5b14d1d3ce24b482f47bc359100ec6d`.
- Licença MIT, copyright (c) 2021 SolisLemus lab projects, verificada no arquivo LICENSE.
- Arquivos examinados: `app.R`, `scripts/sample-size.r` e documentação. A interface usa Shiny; as rotinas incluem aproximações normais para comparações.
- Decisão: não incorporado. Um serviço R/Shiny não é necessário para os métodos selecionados; preservou-se a hospedagem estática. A licença do aplicativo tampouco deve ser confundida com as licenças individuais de todas as suas dependências.

### Candidatas do terceiro ciclo, não incorporadas

- **BDEsize 1.6:** [CRAN](https://cran.r-project.org/package=BDEsize), GPL (≥2); arquivo examinado `R/Size.Split.R`, função `Size.Split`. A escala interna de parcela usa o fator `sqrt(prodsplit+1)` e não foi tratada como implementação geral para componentes de variância arbitrários. Nenhum trecho foi transcrito, traduzido ou distribuído.
- **pwr4exp 1.0.1:** [CRAN](https://cran.r-project.org/package=pwr4exp), GPL (≥2); consultada a documentação e vinheta, especialmente `designSPD`, variâncias e poder com graus de liberdade aproximados de Satterthwaite. Esse motor R não foi portado nem incluído. Não se afirma equivalência universal entre sua aproximação para modelos mistos e os testes ANOVA balanceados clássicos desta entrega.
- As duas novas rotas reutilizam a distribuição F não central e a busca inteira existentes, com equações de modelos acadêmicos implementadas pelo Ensaio em `sample-size/structured.mjs`. Não acrescentam código de terceiros, dependência R/Python no navegador ou licença GPL ao pacote. O código novo segue `sample-size/LICENSE.txt` (MIT). Componentes MIT/BSD anteriores permanecem inalterados.
- Fontes: [Purdue — parcelas subdivididas](https://www.stat.purdue.edu/~zhanghao/STAT514/Lecture_Notes/LectureNotes20-Split-plot-Designs-.html), [Purdue — blocos completos](https://www.stat.purdue.edu/~zhanghao/STAT514/Lecture_Notes/LectureNotes13-Complete-Block-Design-.html) e [Purdue — RCBD with Replication, pp. 7–8](https://www.stat.purdue.edu/~bacraig/notes1/topic11.pdf). As não centralidades são derivadas dessas estruturas de covariância e somas de quadrados; não são apresentadas como código copiado dessas páginas.
- A verificação independente foi executada com SciPy 1.17.0; `tests/generate-structured-reference.py` e `tests/structured-reference.json` registram parâmetros, versão, tamanhos, poderes e simulações. Detalhes em [CICLO-3-ESTRUTURAS.md](CICLO-3-ESTRUTURAS.md).

### Candidatas do quarto ciclo não incorporadas

- **CRTSize 1.2:** commit `0c7bab585067f7edd6a9edfbe2d8afd359af710a`. Licença GPL (≥2), DESCRIPTION e `R/n4means.R` examinados. Usa equações aproximadas e iteração com quantis t; nenhum trecho foi portado. O cálculo exato da ANOVA/t das médias em conjuntos normais não é apresentado como execução dessa rotina.
- **longpower 1.0.27:** commit `2f626d89aed9028e86c3a2cd796f5547d2b87f3b`, GPL (≥2); DESCRIPTION e famílias de métodos em `R/` examinados. Modelos de inclinação, MMRM e outras estruturas longitudinais não foram substituídos por CS sob seus nomes. Nenhum código incorporado.
- A existência de uma licença permissiva no Superpower foi verificada no pacote efetivamente auditado; não se inferiu a licença apenas do caráter público do repositório. Dependências R importadas pelo pacote não são incluídas pelo porte restrito.

## Reproduzir a verificação

`tests/generate-reference.py` usa SciPy 1.17.0 como implementação numérica independente e equações documentadas para gerar os tamanhos esperados. `tests/record-openepi-reference.mjs` executa os arquivos originais, checa os hashes e registra suas saídas; recebe o diretório do OpenEpi baixado como argumento. Os arquivos completos do OpenEpi e de WebPower não são redistribuídos neste pacote. Não há dependência Python/R em produção.
