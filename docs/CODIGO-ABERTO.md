# Código aberto, proveniência e licenças — tamanho amostral v1.0.0

Auditoria realizada em 15/10/2026. Esta documentação distingue código efetivamente distribuído, bibliotecas numéricas, fórmulas implementadas a partir da literatura e ferramentas apenas consultadas. A licença do módulo não altera automaticamente a titularidade dos materiais didáticos preexistentes.

## Código efetivamente utilizado

### jStat

- Projeto: https://github.com/jstat/jstat
- Versão declarada no `package.json`: 1.9.6.
- Commit fixado: `72f367f6dbd45c2d903053ee3f9981489912cad4`.
- Origem: `dist/jstat.js`; destino: `sample-size/vendor/jstat.mjs`.
- Licença: MIT; copyright (c) 2013 jStat, texto integral em `sample-size/licenses/jstat-MIT.txt` e no próprio módulo.
- Adaptação: somente remoção do invólucro UMD e adição de `export {jStat}`. Algoritmos internos preservados. Biblioteca distribuída localmente, sem dependência de CDN.
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

## Métodos e origem, um a um

| Método do Ensaio | Código reaproveitado | Implementação da regra estatística / referência |
|---|---|---|
| Precisão de média | jStat 1.9.6, MIT | Equação normal de Cochran (1977), implementação do Ensaio |
| Precisão de proporção | jStat 1.9.6, MIT | Cochran (1977), implementação do Ensaio; confrontada também com `SSPropor.js` |
| Duas médias | OpenEpi `SSMean.js`, MIT; jStat, MIT | Bloco aritmético adaptado de `CalcPower`; Rosner, 5ª ed. |
| Pareado | jStat, MIT | Teste t não central e busca inteira do Ensaio; Cohen (1988), cap. 2 |
| Duas proporções | jStat, MIT | Fórmula publicada de Fleiss (1981), implementação própria; confrontada com coluna Fleiss do OpenEpi |
| ANOVA | jStat, MIT | F não central e balanceamento do Ensaio; Cohen (1988), cap. 8 |
| Fatorial | jStat, MIT | Decomposição de médias e F do modelo fixo do Ensaio; Montgomery (2012), cap. 5 |
| DBC | jStat, MIT | Modelo aditivo e busca de blocos do Ensaio; Montgomery (2012), cap. 4 |
| Correlação | jStat, MIT | Aproximação z de Fisher; não é transcrição de `wp.correlation` ou `pwr.r.test` |
| Regressão | jStat, MIT | Teste F com λ=Nf²; modelo linear fixo e comparação aninhada |
| Conglomerados descritivos | jStat, MIT | DEFF=1+(m−1)ICC de Kish (1965), implementação própria; Cochran (1977) |

As adaptações e os arquivos novos dentro de `sample-size/` são disponibilizados sob MIT em `sample-size/LICENSE.txt`. Os avisos dos terceiros permanecem com eles. Isso não relicencia o restante do site nem os livros, artigos ou materiais da professora.

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

## Reproduzir a verificação

`tests/generate-reference.py` usa SciPy 1.17.0 como implementação numérica independente e equações documentadas para gerar os tamanhos esperados. `tests/record-openepi-reference.mjs` executa os arquivos originais, checa os hashes e registra suas saídas; recebe o diretório do OpenEpi baixado como argumento. Os arquivos completos do OpenEpi e de WebPower não são redistribuídos neste pacote. Não há dependência Python/R em produção.
