# Ensaio — guia didático de Bioestatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## Nova versão: tamanho amostral 1.0.0 — 15/10/2026

Nova entrada **Tamanho amostral**, independente do planejamento e integrada a ele mediante prévia e confirmação. São 11 rotas de cálculo: precisão de média/proporção; duas médias independentes/pareadas; duas proporções; ANOVA; fatorial balanceado; DBC completo; correlação; regressão linear; estimação de proporção em conglomerados iguais. Há métodos exatos sob modelos normais e aproximações, sempre identificados.

Mantidos planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários, perdas e resumo copiável.

Documentação:
- [Métodos e limitações](docs/TAMANHO-AMOSTRAL.md)
- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Manutenção

Publicação estática, sem build, servidor ou CDN. Módulos JavaScript precisam de HTTP(S); abrir `index.html` por duplo clique não substitui a publicação. Código estatístico separado da interface e das regras de integração em `sample-size/`.

Rodar regressão: `node --test tests/*.test.mjs`. Referências numéricas reprodutíveis em `tests/`, sem uso de Python/R em produção. Validação desta entrega: 153 testes aprovados; sem inspeção visual em navegador real.

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat e OpenEpi têm licença MIT e seus avisos foram preservados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.
