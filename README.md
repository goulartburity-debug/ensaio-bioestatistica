# CoDel-Stat — guia didático de Estatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## O que o CoDel-Stat oferece

Planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários e ajuste para perdas.

Documentação:

- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Sobre o código

Aplicação estática, sem servidor ou CDN. Código estatístico separado da interface e das regras de integração em `sample-size/`. Textos de apoio em `sample-size/guidance.mjs`.

Referências numéricas reprodutíveis e verificações de regressão em `tests/`, sem uso de Python/R em produção. Registros: [Segundo ciclo — comparações](docs/CICLO-2-COMPARACOES.md) e [Terceiro ciclo — estruturas](docs/CICLO-3-ESTRUTURAS.md) e [Quarto ciclo — dependência](docs/CICLO-4-DEPENDENCIA.md).

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat, OpenEpi e Superpower têm licença MIT. O núcleo de integração da amplitude estudentizada utiliza código adaptado do SciPy sob BSD-3-Clause. Os avisos e as adaptações estão documentados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.
