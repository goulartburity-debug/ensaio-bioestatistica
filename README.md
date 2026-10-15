# Ensaio — guia didático de Bioestatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## O que o Ensaio oferece

Nova entrada **Tamanho amostral**, independente do planejamento e integrada a ele mediante prévia e confirmação. São 14 rotas de cálculo: precisão de média/proporção; duas médias independentes/pareadas; duas proporções; ANOVA; fatorial balanceado com ou sem blocos; DBC completo; Dunnett; Tukey; contrastes planejados; correlação; regressão linear; estimação de proporção em conglomerados iguais. Há métodos exatos sob modelos normais e aproximações, sempre identificados.

Planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários e ajuste para perdas.

Na primeira fase de melhorias, o formulário passou a usar uma coluna, explicações curtas e ajudas que podem ser abertas quando necessário. As opções avançadas ficam recolhidas, com os valores atuais visíveis. O quadro lateral, o link de métodos dentro da calculadora e o texto pronto para metodologia foram retirados. O segundo ciclo amplia o motor para a versão 1.1.0: acrescenta comparações dimensionadas pelo poder, com explicações do que esse poder significa. O fatorial em DBC é restrito a blocos completos, uma unidade por combinação e modelo aditivo. As comparações novas usam resposta contínua, variância residual comum e alocação igual; não substituem cálculos de CL50, sobrevivência ou modelos binomiais.

Documentação:

- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Sobre o código

Aplicação estática, sem servidor ou CDN. Código estatístico separado da interface e das regras de integração em `sample-size/`. Textos de apoio em `sample-size/guidance.mjs`.

Referências numéricas reprodutíveis e verificações de regressão em `tests/`, sem uso de Python/R em produção. O registro desta ampliação está em [Segundo ciclo — comparações](docs/CICLO-2-COMPARACOES.md).

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat e OpenEpi têm licença MIT. O núcleo de integração da amplitude estudentizada utiliza código adaptado do SciPy sob BSD-3-Clause. Os avisos e as adaptações estão documentados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.
