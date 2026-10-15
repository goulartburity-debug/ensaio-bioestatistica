# Ensaio — guia didático de Bioestatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## Nova versão: tamanho amostral 1.0.0 — 15/10/2026

Nova entrada **Tamanho amostral**, independente do planejamento e integrada a ele mediante prévia e confirmação. São 11 rotas de cálculo: precisão de média/proporção; duas médias independentes/pareadas; duas proporções; ANOVA; fatorial balanceado; DBC completo; correlação; regressão linear; estimação de proporção em conglomerados iguais. Há métodos exatos sob modelos normais e aproximações, sempre identificados.

Mantidos planejamento, exemplos, glossário, orientação de análises e explicações junto às escolhas. O site não importa dados nem executa análises de dados coletados. A calculadora usa parâmetros de planejamento, com hipóteses explícitas, cenários, perdas e resumo copiável.

Documentação:
- [Métodos e limitações](docs/TAMANHO-AMOSTRAL.md)
- [Código aberto e licenças](docs/CODIGO-ABERTO.md)
- [Validação e exemplos numéricos](docs/VALIDACAO-AMOSTRAL.md)

## Atualizar o site que já está no GitHub Pages

1. Baixe e extraia o ZIP em uma pasta no computador.
2. Abra https://github.com/goulartburity-debug/ensaio-bioestatistica na aba **Code**, branch **main**.
3. Selecione **Add file → Upload files**.
4. Arraste **todos os arquivos e pastas de dentro da pasta extraída**, mantendo a organização. Não envie o ZIP nem a pasta externa que o envolve. `index.html`, `app.mjs` e `styles.css` ficam na raiz. As pastas novas `sample-size`, `docs` e `tests` ficam nesse mesmo nível. Não retire os arquivos de dentro dessas pastas.
5. Espere o upload concluir. Arquivos de mesmo nome atualizam os existentes. Em **Commit changes**, escreva “Adiciona calculadora de tamanho amostral” e confirme diretamente na **main**.
6. O GitHub Pages publica usando a configuração existente. Não refaça Settings → Pages. Acompanhe a execução na aba **Actions** e aguarde a conclusão.
7. Abra https://goulartburity-debug.github.io/ensaio-bioestatistica/ e recarregue com **Ctrl+F5** (ou teste em uma aba anônima). O menu deverá exibir **Tamanho amostral**.
8. Teste: Calcular diretamente → comparar tratamentos → duas médias independentes → Carregar exemplo fictício → Calcular. O exemplo deve mostrar 41 unidades por grupo. Teste também “Preciso calcular essa quantidade” dentro do planejamento.

O link dos alunos permanece igual. Este pacote não altera o site publicado até o envio e a confirmação no GitHub. Os arquivos de documentação, testes e licenças devem acompanhar a distribuição. Não é necessário instalar programas para publicar.

## Manutenção

Publicação estática, sem build, servidor ou CDN. Módulos JavaScript precisam de HTTP(S); abrir `index.html` por duplo clique não substitui a publicação. Código estatístico separado da interface e das regras de integração em `sample-size/`.

Rodar regressão: `node --test tests/*.test.mjs`. Referências numéricas reprodutíveis em `tests/`, sem uso de Python/R em produção. Validação desta entrega: 153 testes aprovados; sem inspeção visual em navegador real.

Os parâmetros da calculadora são salvos apenas no navegador e os resultados precisam ser recalculados após reabertura. Aplicações confirmadas ao planejamento registram método, parâmetros e versão; mudanças de plano geram aviso para revisão.

As partes reaproveitadas de jStat e OpenEpi têm licença MIT e seus avisos foram preservados. Não foi incorporado código GPL do WebPower. Consulte a documentação de proveniência antes de acrescentar novas dependências.
