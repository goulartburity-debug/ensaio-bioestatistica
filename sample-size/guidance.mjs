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

guidance.splitplot={
 question:'Irrigação na bandeja e adubação nos vasos: quantos blocos serão necessários?',
 idea:'Um fator é aplicado ao conjunto inteiro; o outro, às partes dentro dele. Cada bloco terá todas as opções de A, e cada parcela de A terá todas as opções de B.',
 count:'Conte blocos, parcelas principais e subparcelas separadamente. Mais vasos dentro de uma bandeja não viram mais bandejas independentes para testar a irrigação.',
 find:'Defina A como o fator da parcela principal e B como o da subparcela. Busque as médias de cada combinação e os componentes residuais de um modelo de parcelas subdivididas. Para A, informe também a variação compartilhada pela parcela, ou o DP residual das médias das parcelas. Não substitua componentes por um DP geral.',
 example:'Duas irrigações em bandejas × três adubações nos vasos. Alturas esperadas: 10; 12; 14; 11; 16; 21 cm. DP residual das subparcelas de 4 cm e componente de parcela com DP de 3 cm. O exemplo dimensiona a irrigação (A).',
 care:'A e B têm erros experimentais diferentes. Não há garantia de que B terá mais poder em qualquer situação: isso depende do efeito, das variâncias e dos graus de liberdade. Este cálculo exige uma subparcela por nível de B em cada parcela e blocos completos.'
};
guidance.replicatedBlocks={
 question:'Cada faixa terá dois vasos de cada adubação, tratados separadamente. Quantas faixas preciso?',
 idea:'Fixe a quantidade por tratamento dentro do bloco; vamos calcular quantos blocos completos são necessários para o teste global.',
 count:'Conte somente unidades que recebem o tratamento separadamente. Dez plantas em uma parcela pulverizada inteira continuam sendo observações de uma única unidade tratada.',
 find:'Procure as médias esperadas e o DP residual em uma pesquisa com o mesmo modelo. Se o efeito dos tratamentos varia entre blocos, informe também o DP do componente tratamento × bloco. Escolher o modelo aditivo significa assumir que esse componente não existe.',
 example:'Três adubações com alturas esperadas de 10; 12; 15 cm; dois vasos tratados separadamente por adubação em cada faixa e DP residual de 4 cm. O exemplo usa modelo aditivo sem interação tratamento × bloco.',
 care:'O cálculo mantém a mesma quantidade por tratamento em todos os blocos. Datas, subamostras, vasos tratados coletivamente, blocos incompletos e dois fatores nessa estrutura exigem outros modelos. O poder global não garante cada comparação de médias.'
};

guidance.repeated={
 question:'Os tratamentos mudam a trajetória da altura das mesmas plantas em três datas?',
 idea:'Conte as unidades acompanhadas e descreva as médias esperadas em cada data. Escolha a pergunta e uma hipótese sobre a relação entre as avaliações.',
 count:'Uma planta acompanhada em cinco datas fornece uma unidade independente e cinco registros vinculados. Não são cinco repetições experimentais.',
 find:'Busque médias por grupo e data, o desvio-padrão marginal da resposta e correlações entre avaliações de um estudo semelhante ou piloto. Confira se as mesmas unidades são acompanhadas. Plantas diferentes retiradas a cada data não formam uma série repetida da mesma unidade.',
 example:'Dois tratamentos, três datas nas mesmas plantas. Médias de altura de 10; 12; 14 cm no grupo 1 e 10; 14; 18 cm no grupo 2; DP de 4 cm e correlação comum de 0,6. O exemplo dimensiona a interação grupo × tempo.',
 care:'Os testes globais disponíveis pressupõem correlação comum para todos os pares e variâncias iguais. AR(1), com intervalos iguais, está disponível apenas para um contraste definido antes da coleta. Não cobre mortalidade cumulativa ou sobrevivência, dados incompletos ou indivíduos agrupados dentro das unidades acompanhadas.'
};
guidance.clusterTrial={
 question:'Quantas gaiolas tratadas separadamente são necessárias para comparar as médias?',
 idea:'O tratamento vai para o conjunto inteiro. O cálculo considera tanto a quantidade de conjuntos independentes quanto a semelhança dos indivíduos dentro deles.',
 count:'Conte gaiolas, parcelas ou turmas independentes como unidades de atribuição. Dez indivíduos dentro da mesma gaiola tratada não equivalem a dez gaiolas.',
 find:'Defina quantos indivíduos analisáveis haverá por conjunto. Procure o DP marginal da resposta e a ICC em estudo semelhante. A ICC é a proporção da variância associada às diferenças entre conjuntos; não é a correlação entre datas. Não adotamos 0,05 como uma verdade do seu experimento.',
 example:'Duas condições, diferença relevante de 5 unidades, DP marginal de 8, dez indivíduos analisáveis por conjunto e ICC de 0,05. O cálculo dimensiona conjuntos por tratamento e usa as médias dos conjuntos na análise.',
 care:'Esta rota compara médias de respostas contínuas com conjuntos iguais e grupos balanceados. Não calcula porcentagens binomiais, CL50, contagens ou mortalidade ao longo do tempo. Mais indivíduos na mesma gaiola não substituem livremente novas gaiolas. As perdas de conjuntos e de indivíduos são separadas.'
};

export const examples = {
  repeated:{rmGroups:'2',rmOccasions:'3',rmCovariance:'cs',rmEffect:'interaction',means:'10;12;14;10;14;18',sd:'4',rho:'0,6'},
  clusterTrial:{groups:'2',clusterAllocation:'group',delta:'5',sd:'8',clusterSize:'10',icc:'0,05'},
  splitplot:{a:'2',b:'3',effect:'A',means:'10;12;14;11;16;21',sdSub:'4',sdWhole:'3'},
  replicatedBlocks:{groups:'3',unitsPerCell:'2',cellKind:'independent',blockModel:'additive',means:'10;12;15',sd:'4'},
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

// Dimensionamento prospectivo; valores de exemplo não são dados de um ensaio.
guidance.lc50={question:'Quantas unidades por concentração preciso para estimar uma CL50 com precisão definida?',idea:'Você informa concentrações e duas mortalidades esperadas no mesmo tempo de avaliação. A curva prevista serve para calcular quantas unidades são necessárias para uma largura aproximada do intervalo da CL50.',count:'Conte recipientes tratados separadamente como unidades quando a aplicação ocorre ao recipiente inteiro. Dez organismos num pote não são dez potes independentes. Mortes são o resultado de interesse, não perdas a excluir.',find:'Use literatura comparável ou um piloto para prever a mortalidade em duas concentrações, no mesmo tempo. A correlação entre organismos do recipiente exige dados de vários recipientes por concentração; se for desconhecida, compare cenários plausíveis sem tratar um valor arbitrário como conhecido.',example:'Cenário fictício: 20% de mortalidade na concentração 1 e 80% na concentração 4, cinco concentrações positivas (0,5; 1; 2; 4; 8), avaliação em 72 h. Com dez organismos por recipiente, ICC 0,05, confiança de 95% e fator de precisão 1,2, o cálculo informa os recipientes por concentração.',care:'O alvo é um intervalo multiplicativo: CL50 esperada dividida e multiplicada pelo fator escolhido. Isso não é margem em pontos percentuais, poder de ANOVA nem garantia de precisão. Não use esta rota quando a mortalidade de fundo não puder ser considerada nula.'};
examples.lc50={lcAssumption:'zero',lcLink:'logit',lcTime:'72 h',lcUnit:'container',lcM:'10',lcICC:'0,05',lcC1:'1',lcC2:'4',lcP1:'20',lcP2:'80',lcDoses:'0,5;1;2;4;8',lcPrecision:'20',lcControl:'yes'};

guidance.lt50={question:'Quantos indivíduos independentes acompanhar para estimar o tempo até 50% de mortalidade?',idea:'Escolha os horários em que pretende verificar os mesmos indivíduos. O cálculo considera mortes entre avaliações e os indivíduos ainda vivos ao final, sem transformar cada data em uma nova amostra.',count:'Conte indivíduos independentes, acompanhados uma vez como coorte. As datas não multiplicam esse número. Organismos em recipientes tratados conjuntamente exigem outro modelo.',find:'Use um piloto ou literatura comparável para prever a mortalidade acumulada em dois tempos. Defina também o calendário real de visitas e a precisão que interessa. Sem uma curva esperada, o número de datas sozinho não determina a amostra.',example:'Cenário fictício: 20% de mortalidade acumulada em 24 h e 80% em 96 h; avaliações em 24, 48, 72, 96, 120, 144 e 168 h; modelo lognormal, confiança 95% e fator máximo 1,20.',care:'Esta rota estima uma LT50 em uma condição, sem comparar tratamentos. Vivos ao final são censurados, não excluídos nem registrados como mortos. Mortes observadas entre visitas não são tempos exatos.'};
examples.lt50={ltUnit:'individual',ltModel:'lognormal',ltFollow:'cohort',ltT1:'24',ltP1:'20',ltT2:'96',ltP2:'80',ltTimes:'24;48;72;96;120;144;168',ltPrecision:'20',ltTimeUnit:'horas'};

guidance.survival={question:'Quantos indivíduos preciso em dois grupos para detectar uma diferença no tempo até um evento?',idea:'O cálculo considera a chance de cada indivíduo apresentar o evento antes do encerramento. Mais tempo de acompanhamento pode gerar mais eventos com a mesma quantidade de indivíduos.',count:'Conte indivíduos independentes em cada grupo, não visitas nem organismos vinculados dentro de um recipiente tratado. As mortes são os eventos; indivíduos vivos ao final são censurados.',find:'Use literatura ou piloto para prever a mediana do grupo 1 e o efeito do grupo 2. Informe o tempo de inclusão e o acompanhamento após a última inclusão. Medianas são convertidas em HR apenas sob o modelo exponencial desta rota.',example:'Cenário fictício: medianas de 48 e 72 horas; todos começam juntos, acompanhamento de 168 horas; grupos iguais; poder 80% e significância bilateral 5%.',care:'Exige riscos proporcionais. Se as curvas cruzam ou as mortes só são conhecidas entre visitas, esta rota não representa o estudo. Não substitua recipientes por organismos independentes.'};
examples.survival={survApprox:'freedman',survUnit:'individual',survObservation:'exact',survPH:'yes',survEffect:'medians',survMedianCon:'48',survMedianExp:'72',survRatio:'1',survEntry:'0',survFollow:'168',survTimeUnit:'horas'};
