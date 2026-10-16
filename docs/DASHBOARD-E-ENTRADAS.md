# Dashboard e animações de entrada

A home apresenta primeiro o resumo do planejamento salvo, quando houver respostas. O resumo exibe o número de etapas válidas, a resposta medida e o total de unidades apenas quando calculável. O botão de retomada abre a primeira etapa incompleta; caso todas estejam completas, abre a última para revisão. Nome do estudo é escapado antes da apresentação. Sem planejamento salvo, a home apresenta diretamente a identificação e as quatro ferramentas.

Os quatro cards e seus textos explicativos foram mantidos, na ordem: exemplos, planejamento, tamanho amostral, análises. Numeração 01–04 em destaque. A sequência é uma orientação de uso, não uma restrição de acesso: todos continuam independentes. Cards com fundo #FFFFFF, borda #D1D5DB e sombra discreta sobre #FBF9F5.

A classe route-enter é aplicada somente na primeira renderização ou troca de rota. fadeInUp usa opacidade 0–1 e translateY(15px)–0 em 0,4 s ease-out. Pergunta com atraso 0,1 s e painel lateral 0,2 s; cards da home recebem atrasos progressivos. Navegação não recebe animação. Escolhas, preenchimento de campos e avanço entre perguntas na mesma rota não reiniciam a entrada: preservam o cross-fade de 240 ms já existente. Preferência por movimento reduzido desativa as animações.

Verificação: 341 testes existentes e dois testes novos de resumo/retomada/entrada de rota passaram. Sem inspeção visual em navegador nesta entrega. Métodos estatísticos, parâmetros, chaves de armazenamento, confirmação de aplicação e verificação Google preservados.
