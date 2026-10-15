// Textos de apoio à versão 1: não preenchem parâmetros nem alteram o cálculo.
export const guidance = {
  mean: {
    question: 'Qual é a altura média das plantas, com uma margem de até 2 cm?',
    idea: 'Aqui você escolhe a precisão da média que pretende estimar.',
    count: 'Conte cada unidade sorteada para a amostra. Se medir folhas da mesma planta, elas podem ser subamostras.',
    find: 'Procure o desvio-padrão da mesma medida em um estudo semelhante ou em um piloto. Se a altura está em centímetros, o desvio-padrão e a margem também devem estar em centímetros.',
    example: 'Altura com desvio-padrão de 8 cm e margem de 2 cm. Com confiança de 95%, o exemplo pede 62 unidades.',
    care: 'A margem de erro descreve a precisão da média; não é uma diferença entre tratamentos.'
  },
  proportion: {
    question: 'Qual porcentagem de sementes germina?',
    idea: 'Escolha quanto a estimativa pode variar para mais ou para menos.',
    count: 'Conte unidades sorteadas de forma independente. Sementes no mesmo recipiente tratado podem estar vinculadas.',
    find: 'Use uma porcentagem de um estudo semelhante ou de um piloto. Se não houver informação, você pode escolher 50%: nessa aproximação, é o cenário que exige a maior amostra, mantendo margem e confiança iguais.',
    example: 'Porcentagem esperada de 50%, margem de 5 pontos e confiança de 95%: 385 unidades, sem correção para população finita.',
    care: 'Margem de 5 pontos em uma estimativa de 50% corresponde a aproximadamente 45%–55%.'
  },
  means: {
    question: 'Uma adubação aumenta a altura em pelo menos 5 cm?',
    idea: 'Cada grupo tem suas próprias plantas. Nenhuma planta pertence aos dois grupos.',
    count: 'Conte as unidades que recebem o tratamento de forma independente, como vasos tratados separadamente.',
    find: 'A diferença deve ser a menor mudança que teria importância para sua pesquisa. Para o desvio-padrão, procure a variação da altura entre unidades do mesmo tratamento em estudo semelhante ou piloto.',
    example: 'Diferença de 5 cm e desvio-padrão de 8 cm nos dois grupos. Com poder de 80% e significância de 5%, o exemplo pede 41 unidades por grupo.',
    care: 'Este cálculo usa uma aproximação normal. Ele não é um dimensionamento exato para o teste t de Welch.'
  },
  paired: {
    question: 'A mesma pessoa muda, em média, pelo menos 5 unidades entre antes e depois?',
    idea: 'As duas medidas estão ligadas: vêm da mesma unidade ou de um par formado antes do estudo.',
    count: 'Conte pares completos. Uma pessoa avaliada antes e depois fornece um par, com duas medidas.',
    find: 'Em um piloto, calcule a mudança dentro de cada par e depois o desvio-padrão dessas mudanças. O desvio-padrão do antes, sozinho, não substitui esse valor. Outra opção é usar os dois desvios-padrão e a correlação entre as medidas.',
    example: 'Diferença de 5 e desvio-padrão das diferenças de 8. Com poder de 80%, significância de 5% e hipótese bilateral: 23 pares completos.',
    care: 'Esta opção cobre duas condições. Vários grupos acompanhados em várias datas precisam de outro método.'
  },
  proportions: {
    question: 'A germinação pode passar de 60% para 75% com outro tratamento?',
    idea: 'Informe as duas porcentagens que seriam relevantes para a comparação.',
    count: 'Conte unidades independentes em cada grupo. Várias sementes no mesmo recipiente tratado não se tornam repetições independentes.',
    find: 'Procure uma porcentagem de referência para o primeiro grupo. Para o segundo, escolha a mudança que teria importância prática. As duas porcentagens devem se referir ao mesmo evento e ao mesmo momento de avaliação.',
    example: 'Germinação de 60% no primeiro grupo e 75% no segundo, com grupos de mesmo tamanho.',
    care: 'Se a conta envolver poucos sucessos ou insucessos esperados, esta aproximação será recusada. Isso pede outro cálculo; não significa que o estudo seja impossível.'
  },
  anova: {
    question: 'Três adubações produzem alturas médias diferentes?',
    idea: 'Informe uma média esperada por tratamento e a variação entre unidades do mesmo tratamento.',
    count: 'O resultado será dado por tratamento e no total, com a mesma quantidade em todos os tratamentos.',
    find: 'Use médias plausíveis de estudos semelhantes e um desvio-padrão residual comum. Esse desvio descreve a variação que sobra dentro dos tratamentos; não é o espalhamento das médias dos tratamentos.',
    example: 'Três médias esperadas: 10, 12 e 15 cm. Com desvio-padrão residual de 8 cm, poder de 80% e significância de 5%: 50 unidades por tratamento, 150 no total.',
    care: 'O cálculo busca detectar alguma diferença entre médias. Não assegura poder para cada comparação posterior, como Tukey. Uma ANOVA de um fator, sozinha, não comprova que houve DIC.'
  },
  blocks: {
    question: 'Quantas faixas do terreno preciso, com todos os tratamentos em cada faixa?',
    idea: 'Cada bloco recebe uma unidade de cada tratamento. A quantidade calculada será o número de blocos.',
    count: 'Um bloco completo contém todos os tratamentos. Com três tratamentos e 14 blocos, são 42 unidades experimentais.',
    find: 'Procure o desvio-padrão residual de um estudo que já tenha considerado os blocos. Não use o desvio-padrão bruto que mistura diferenças entre blocos. Se houver quadrado médio do erro, o desvio-padrão residual é sua raiz quadrada.',
    example: 'Médias de 10, 12 e 15 cm; desvio-padrão residual de 4 cm; poder de 80%; significância de 5%: 14 blocos. Com 10% de perda de blocos inteiros: iniciar com 16.',
    care: 'O exemplo de ANOVA usa desvio-padrão 8 e este usa 4. A redução da amostra depende dessa diferença de variabilidade; escolher blocos não reduz a amostra automaticamente.'
  },
  factorial: {
    question: 'Uma adubação funciona de forma diferente em duas variedades?',
    idea: 'Todas as opções do primeiro fator serão combinadas com todas as opções do segundo.',
    count: 'O resultado será por combinação. Duas variedades e três adubações formam seis combinações.',
    find: 'Informe uma média para cada combinação, em ordem, e o desvio-padrão residual. Primeiro escolha o efeito principal: variedade, adubação ou interação. Para detectar interação, o padrão de resposta precisa mudar entre os níveis do outro fator.',
    example: 'Duas variedades × três adubações. Médias na ordem A1B1, A1B2, A1B3, A2B1, A2B2, A2B3: 10; 12; 14; 10; 14; 18. Desvio-padrão residual: 4.',
    care: 'Os fatores precisam ser aplicados no mesmo nível. Se usar blocos, todos devem ter uma unidade de cada combinação e o modelo é aditivo em blocos. Parcelas subdivididas precisam de outro cálculo.'
  },
  correlation: {
    question: 'Altura e massa das plantas apresentam uma associação?',
    idea: 'Cada unidade terá as duas medidas. Você escolhe a correlação que seria importante detectar.',
    count: 'Conte unidades independentes com as duas variáveis medidas, como altura e massa em cada planta.',
    find: 'Procure uma correlação de Pearson em estudos comparáveis. O sinal indica a direção e o valor absoluto indica a intensidade. Na ausência de uma boa estimativa, compare cenários plausíveis em vez de adotar automaticamente um valor chamado pequeno ou médio.',
    example: 'Correlação esperada de 0,3, comparada com correlação zero, usando hipótese bilateral, poder de 80% e significância de 5%.',
    care: 'Uma correlação não demonstra causa e efeito. Este cálculo é para Pearson, comparado com correlação zero.'
  },
  regression: {
    question: 'Quanto um conjunto de variáveis ajuda a explicar uma resposta, como a altura?',
    idea: 'Compare a contribuição esperada de todas as variáveis ou de um conjunto delas no modelo.',
    count: 'Conte unidades independentes com todas as variáveis necessárias, como cada planta com altura e características explicativas.',
    find: 'Procure um estudo com a mesma resposta e variáveis semelhantes. R² indica a parcela da variação explicada: 0,25 corresponde a 25%. O modelo completo inclui tudo; o reduzido retira apenas os coeficientes que você quer testar. Se testar todos, o R² reduzido será zero.',
    example: 'Modelo com três coeficientes, dos quais dois são testados. R² esperado de 0,25 no modelo completo e de 0,10 no reduzido.',
    care: 'Este cálculo é para regressão linear com resposta contínua e erros independentes. Não dimensiona CL50, regressão logística ou contagens.'
  },
  dunnett: {
    question: 'Cada adubação melhora a altura em relação à testemunha?',
    idea: 'Compare cada tratamento com uma única referência, usando o ajuste de Dunnett. A testemunha entra na contagem de tratamentos.',
    count: 'Conte unidades tratadas independentemente. Em blocos, cada bloco completo recebe todos os tratamentos, incluindo a testemunha.',
    find: 'Informe a menor diferença entre um tratamento e a testemunha que teria importância prática. Busque o desvio-padrão residual em um estudo comparável. Se usar blocos, o desvio-padrão deve ser o que sobra após considerar esses blocos.',
    example: 'Quatro tratamentos no total: uma testemunha e três adubações. Diferença relevante de 5 cm e desvio-padrão residual de 8 cm; poder de 80%, significância familiar de 5% e grupos iguais.',
    care: 'O poder é de uma comparação com o efeito informado, usando o ajuste para a família inteira. Não significa 80% de chance de detectar todos os tratamentos eficazes. Este método é para médias de respostas contínuas, não para mortalidade binomial.'
  },
  tukey: {
    question: 'Quero comparar cada adubação com todas as outras.',
    idea: 'O ajuste de Tukey considera todos os pares. O cálculo busca poder para uma diferença do tamanho que você informar.',
    count: 'O resultado conta todas as unidades do experimento, com a mesma quantidade em cada tratamento. Em DBC, conta blocos completos.',
    find: 'Escolha a menor diferença entre duas médias que importa detectar e procure o desvio-padrão residual de um estudo semelhante. Uma diferença de 5 cm tem significado diferente conforme a variação entre unidades.',
    example: 'Quatro adubações, diferença relevante de 5 cm e desvio-padrão residual de 8 cm. O ajuste cobre os seis pares, com poder de 80% por comparação e significância familiar de 5%.',
    care: 'O valor crítico de Tukey, sozinho, não calcula poder. Aqui também usamos a distribuição do efeito esperado. O poder por comparação não é a probabilidade de detectar todos os pares nem pelo menos um. Tamanhos desiguais ainda não são dimensionados nesta rota.'
  },
  contrast: {
    question: 'A média das adubações difere da testemunha?',
    idea: 'Defina antes da coleta uma comparação que responde à sua pergunta, sem precisar comparar todos os tratamentos entre si.',
    count: 'Todos os tratamentos informados entram no total, mesmo quando algum tem peso zero no contraste. Eles compartilham a estimativa da variância residual neste modelo.',
    find: 'Você pode comparar dois tratamentos, a testemunha com a média dos demais ou definir pesos. Ex.: −1; 0,5; 0,5 compara a média de T2 e T3 com T1. A diferença relevante deve estar na escala desse contraste: mudar todos os pesos muda essa escala.',
    example: 'Três tratamentos: testemunha, adubação A e adubação B. Comparação: média de A e B menos a testemunha. Diferença relevante de 5 cm e desvio-padrão residual de 8 cm.',
    care: 'O contraste precisa ser escolhido antes da coleta. Este cálculo trata um contraste bilateral em desenho balanceado. Para outras hipóteses na mesma família, o ajuste de Bonferroni precisa ser informado nas opções; o poder conjunto não é calculado.'
  },
  cluster: {
    question: 'Qual porcentagem apresenta uma característica, avaliando indivíduos dentro de conjuntos?',
    idea: 'Indivíduos do mesmo conjunto podem ser parecidos. O cálculo leva essa semelhança em conta.',
    count: 'Conte os conjuntos independentes e, separadamente, os indivíduos dentro deles. Observações vinculadas não são todas repetições independentes.',
    find: 'Além da porcentagem e da margem, informe quantos indivíduos haverá em cada conjunto e a correlação intraclasse, ou ICC. Procure uma ICC estimada para a mesma resposta em condições semelhantes. Não adote 0,05 apenas porque aparece no exemplo.',
    example: 'Porcentagem de 50%, margem de 5 pontos, confiança de 95%, 20 indivíduos por conjunto e ICC de 0,05: 38 conjuntos, com 760 observações vinculadas.',
    care: 'Este cálculo estima uma porcentagem. Ele não compara tratamentos aplicados a conjuntos e pressupõe o mesmo tamanho em todos eles.'
  }
};

export const examples = {
  mean: {sd:'8',margin:'2'}, proportion: {p:'50',margin:'5'},
  means: {delta:'5',sd1:'8',sd2:'8'}, paired: {delta:'5',sd:'8'},
  proportions: {p1:'60',p2:'75'}, anova: {groups:'3',means:'10; 12; 15',sd:'8'},
  factorial: {a:'2',b:'3',effect:'AB',means:'10; 12; 14; 10; 14; 18',sd:'4'},
  blocks: {groups:'3',means:'10; 12; 15',sd:'4'}, correlation: {r:'0,3'},
  regression: {predictors:'3',tested:'2',r2full:'0,25',r2reduced:'0,10'},
  cluster: {p:'50',margin:'5',clusterSize:'20',icc:'0,05'},
  dunnett: {groups:'4',delta:'5',sd:'8'},
  tukey: {groups:'4',delta:'5',sd:'8'},
  contrast: {groups:'3',delta:'5',sd:'8',contrastType:'control-average'}
};
