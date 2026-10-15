# Ensaio — guia didático de Bioestatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## O que o Ensaio oferece

Nova entrada **Tamanho amostral**, independente do planejamento e integrada a ele mediante prévia e confirmação. São 11 rotas de cálculo: precisão de média/proporção; duas médias independentes/pareadas; duas proporções; ANOVA; fatorial balanceado; DBC completo; correlação; regressão linear; estimação de proporção em conglomerados iguais. Há métodos exatos sob modelos normais e aproximações, sempre identificados.

Planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários e ajuste para perdas.

Na primeira fase de melhorias, o formulário passou a usar uma coluna, explicações curtas e ajudas que podem ser abertas quando necessário. As opções avançadas ficam recolhidas, com os valores atuais visíveis. O quadro lateral, o link de métodos dentro da calculadora e o texto pronto para metodologia foram retirados. Os 11 métodos e a versão 1.0.0 do motor de cálculo foram preservados.

Documentação:
- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Sobre o código

Aplicação estática, sem servidor ou CDN. Código estatístico separado da interface e das regras de integração em `sample-size/`. Textos de apoio em `sample-size/guidance.mjs`.

Referências numéricas reprodutíveis e verificações de regressão em `tests/`, sem uso de Python/R em produção. O registro da verificação desta revisão está em [Fase 1 — interface](docs/FASE-1-INTERFACE.md).

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat e OpenEpi têm licença MIT e seus avisos foram preservados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.
