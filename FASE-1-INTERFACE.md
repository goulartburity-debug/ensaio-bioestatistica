# Fase 1 — melhorar o que já existe

Base: repositório Ensaio no commit `45a728b993b72626585bcf6a1dc187855e47be0b`. Revisão de interface em 15/10/2026. O motor estatístico permanece na versão 1.0.0; nenhuma nova rota foi implementada nesta fase.

## Alterações

- Formulário central em uma coluna; remoção do quadro lateral mostrado nas imagens enviadas.
- Retirada dos links de métodos/limites dentro da calculadora. Documentação técnica continua nos arquivos do projeto.
- Retirada do quadro de texto pronto para metodologia e do botão de copiar. O resultado apresenta quantidades, parâmetros e referências, sem produzir uma redação para o aluno entregar.
- Campos essenciais primeiro; valores de confiança ou poder/significância, perdas e ajustes não usuais em seção recolhida. A linha de resumo mostra os valores atuais, inclusive opções diferentes do padrão.
- Referências acadêmicas preservadas, junto à origem do resultado, em seção expansível.
- Exemplos opcionais nas 11 rotas e ajuda específica para encontrar os valores pedidos; nenhum efeito, desvio-padrão ou correlação é preenchido automaticamente.
- Botão explícito para adotar o cenário de 50% na estimação de proporção, com explicação de que não é uma estimativa da população.
- No DBC, explicação da diferença entre desvio-padrão bruto e residual. O exemplo com 14 blocos usa DP residual 4; o exemplo de ANOVA com 50 unidades por tratamento usa DP 8. Não se atribui essa redução automaticamente ao uso de blocos.
- No exemplo de conglomerados, 38 conjuntos só são apresentados com todos os parâmetros: p=50%, margem de 5 pontos percentuais, confiança 95%, m=20 e ICC=0,05. Não se sugere adotar essa ICC sem base.
- Explicação de erro-padrão versus desvio-padrão restrita à média simples de unidades independentes; não se aplica automaticamente a erros-padrão ajustados por modelos.
- A identificação de uma ANOVA de um fator não certifica um DIC: a casualização pertence ao planejamento.
- O README não contém instruções de envio/atualização no GitHub Pages.

## Preservado

Equações, bibliotecas, licenças, validações estatísticas, limites de busca, tratamento de perdas e correção finita; cenários; integração em ambos os sentidos com revisão e confirmação; bloqueio de transferência incompatível; registro de parâmetros e versão no navegador. Arquivos do motor e das regras de integração não foram alterados.

## Verificação

171 testes automatizados passaram: os 153 anteriores e 18 novos. Os novos casos verificam as 11 rotas com exemplos calculáveis, ausência de texto pronto e link de métodos na calculadora, opções inicialmente recolhidas, valores atuais visíveis, escolha explícita de 50%, perdas de blocos inteiros, conjuntos versus observações, efeito padronizado, correlação intrapar e população finita. A suíte anterior preserva as verificações numéricas independentes e as regras de integração.

Os arquivos `sample-size/engine.mjs`, `numeric.mjs`, `integration.mjs`, `methods.mjs` e o código de terceiros são idênticos aos da base. Os exemplos de 385 unidades, 41 por grupo, 23 pares, 50 por tratamento, 14 blocos e 38 conglomerados continuam cobertos.

Verificação estrutural dos arquivos HTML gerados, campos/descrições, IDs únicos e CSS responsivo. Sem inspeção visual em navegador real: a ferramenta de navegador exigida para esse ambiente não estava disponível. Nenhum teste em dispositivo físico foi realizado. Portanto, a revisão de CSS não é apresentada como comprovação visual em todos os tamanhos de tela.
