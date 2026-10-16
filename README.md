# CoDel-Stat — guia didático de Estatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## O que o CoDel-Stat oferece

Nova entrada **Tamanho amostral**, independente do planejamento e integrada a ele mediante prévia e confirmação. São 18 rotas de cálculo: precisão de média/proporção; duas médias independentes/pareadas; duas proporções; ANOVA; fatorial balanceado com ou sem blocos; DBC completo; Dunnett; Tukey; contrastes planejados; correlação; regressão linear; estimação de proporção em conglomerados iguais; parcelas subdivididas em blocos completos; várias unidades tratadas separadamente por tratamento e bloco; medidas repetidas; comparação de médias com tratamentos aplicados a conjuntos. Há métodos exatos sob modelos normais e aproximações, sempre identificados.

Planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários e ajuste para perdas.

Na primeira fase de melhorias, o formulário passou a usar uma coluna, explicações curtas e ajudas que podem ser abertas quando necessário. As opções avançadas ficam recolhidas, com os valores atuais visíveis. O quadro lateral, o link de métodos dentro da calculadora e o texto pronto para metodologia foram retirados. O segundo ciclo amplia o motor para a versão 1.1.0: acrescenta comparações dimensionadas pelo poder, com explicações do que esse poder significa. O fatorial em DBC é restrito a blocos completos, uma unidade por combinação e modelo aditivo. As comparações novas usam resposta contínua, variância residual comum e alocação igual; não substituem cálculos de CL50, sobrevivência ou modelos binomiais.

O terceiro ciclo (motor 1.2.0) separa os níveis de parcelas e subparcelas e dimensiona blocos com várias unidades por tratamento, sob modelo aditivo ou com componente aleatório tratamento × bloco. As duas rotas dimensionam testes globais, com parâmetros de planejamento em unidades reais. A transferência de parcelas subdivididas permanece bloqueada: o planejamento atual ainda não registra os dois níveis de aplicação.

O quarto ciclo (motor 1.3.0) acrescenta medidas repetidas: testes globais sob simetria composta e um contraste planejado sob simetria composta ou AR(1). A comparação entre conjuntos dimensiona as médias de respostas contínuas em conjuntos iguais, com ICC explícita. Resultados distinguem unidades, registros e observações vinculadas; perdas internas e de conjuntos inteiros são separadas.

Documentação:

- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Identidade visual

Interface em preto/azul, navegação grafite e área de trabalho branca. O logotipo fornecido pelo responsável está em `assets/codel-stat-logo.png`, preservado sem alterações. Os esquemas mantêm rótulos e cores por tratamento. Dados previamente salvos e a versão 1.3.0 dos cálculos foram preservados.

## Sobre o código

Aplicação estática, sem servidor ou CDN. Código estatístico separado da interface e das regras de integração em `sample-size/`. Textos de apoio em `sample-size/guidance.mjs`.

Referências numéricas reprodutíveis e verificações de regressão em `tests/`, sem uso de Python/R em produção. Registros: [Segundo ciclo — comparações](docs/CICLO-2-COMPARACOES.md) e [Terceiro ciclo — estruturas](docs/CICLO-3-ESTRUTURAS.md) e [Quarto ciclo — dependência](docs/CICLO-4-DEPENDENCIA.md).

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat, OpenEpi e Superpower têm licença MIT. O núcleo de integração da amplitude estudentizada utiliza código adaptado do SciPy sob BSD-3-Clause. Os avisos e as adaptações estão documentados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.

## Interface e abrangência

Navegação lateral com recolhimento automático nos módulos em computadores, expansão manual e nomes acessíveis para os ícones. Identificação gráfica e créditos foram removidos da coluna lateral; autoria e fontes permanecem em Sobre e referências. A home apresenta o nome e a frase principal. Exemplos de educação, produção, materiais e saúde ampliam a aplicação didática para diferentes áreas, preservando os métodos e suas limitações.

## Tipografia e apresentação

Títulos usam Impact quando instalada no dispositivo, com fontes de reserva. Anonymous Pro regular e negrito estão incluídas localmente sob SIL Open Font License 1.1 (assets/fonts/OFL.txt), sem requisições a fontes externas. Removidos slogans e subtítulos introdutórios das páginas, preservadas as explicações das escolhas. Cards da home recebem cantos assimétricos; botões e tags usam cápsulas, com gradientes leves nos painéis. Arquivo de verificação do Google preservado na raiz.

## Transições de etapas

Conteúdo das perguntas com cross-fade de 240 ms, altura mínima e preservação da rolagem no mesmo módulo. Movimento reduzido respeitado. Conteúdo longo permanece acessível por rolagem normal. Detalhes em docs/TRANSICOES.md.

## Paleta de leitura

Fundo geral marfim #FBF9F5, superfícies claras e painéis de apoio em tons pastel dessaturados. Tipografia, navegação e transições preservadas.

## Seleção e contraste

Cards de resposta selecionam sem avançar. Planejamento, análises e escolha do cálculo usam confirmação em botão separado; campos obrigatórios controlam sua disponibilidade. Opções brancas com borda cinza e indicador circular; seleção azul clara. Faixa superior contextual removida.
