# CoDel-Stat — identidade visual

Atualização visual sobre o motor amostral 1.3.0, em 15/10/2026. Base funcional conferida com os arquivos correspondentes do repositório remoto no commit `048595a03b8d5005ada03d929d55ab4fb239035b`.

## Aplicação

- Nome CoDel-Stat no título, marca, navegação contextual, apresentação do projeto e textos da interface que identificam o software.
- Logotipo fornecido pelo responsável em `assets/codel-stat-logo.png`, usado também como ícone de página. Arquivo preservado byte a byte; SHA-256 `be0dfaedb63624c32590f4b06a6bec45d29a31a7502b9b68d488f3febf7c4c53`. A apresentação circular é feita em CSS, sem modificar o PNG. Não foram acrescentadas referências a animais ao conteúdo ou ao restante do layout.
- Navegação lateral grafite `#0F172A`, área de trabalho `#FFFFFF`, ação principal azul `#1D4ED8`, bordas finas `#DCE3EC`. Cores adicionais limitadas à distinção dos tratamentos e aos estados funcionais de aviso/erro.
- Painéis compactos com cantos de 2–4 px, tipografia sem serifa, controles segmentados e campos numéricos monoespaçados. Sem fontes, ícones ou estilos remotos.
- Navegação, hierarquia das páginas, textos didáticos e esquemas mantidos. Tratamentos, ordem ilustrativa, blocos, subamostras e rótulos não foram recalculados nem alterados.
- Indicadores α e 1−β usam a significância por hipótese e o poder solicitado, identificando este último como alvo. Quantidades n mostram as unidades calculadas e seus rótulos; não há n=41 fixo para fins decorativos. Estimação usa o nível de confiança em vez de exibir um poder inexistente.
- Navegação com texto em celular, em faixa horizontal rolável; formulários em uma coluna nos limites pertinentes e esquemas/tabelas com rolagem interna. Pontos de adaptação em 1200, 980 e 720 px. Movimento reduzido respeitado.

## Preservação funcional

Motor permanece 1.3.0, com os mesmos 18 métodos, equações, limites e regras de confirmação. Mantidas as chaves de armazenamento `ensaio-guide-v2`, `ensaio-analysis-v1`, `ensaio-sample-v1` e `ensaio-sample-applied-v1` para recuperar dados existentes. O nome interno das chaves não implica uma marca antiga visível.

Materiais didáticos, arquivos numéricos, métodos de análise e dados dos exemplos foram preservados. Avisos de autoria/licenças e registros históricos não foram renomeados como se tivessem outra origem. O nome e endereço do repositório não foram alterados.

## Conferências

- **334 testes automatizados aprovados** após a reformulação.
- Comparação de 12 visualizações principais: texto do conteúdo em português, ordem da navegação e sequência de rótulos das unidades experimentais preservados, descontando a substituição do nome do projeto.
- **48 visualizações**: 12 principais e 36 de formulários/resultados dos 18 métodos, com IDs, rótulos, referências ARIA, disclosures, imagens e links locais conferidos.
- Logotipo idêntico ao arquivo recebido. Conferidos exemplos de indicadores: duas médias com 41 unidades por grupo, α=0,05 e poder alvo 0,80, usando parâmetros reais do exemplo.
- Folha de estilos com delimitadores balanceados; essa conferência não é um teste completo de renderização CSS.

Não houve inspeção visual em navegador real nem em celular físico: a ferramenta de navegador exigida neste ambiente não estava disponível. DOM simulado, comparação de conteúdo e verificações de estrutura não são apresentados como validação visual. A publicação não foi modificada diretamente.
