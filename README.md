# Ensaio — guia didático de Bioestatística

Projeto de monitoria de Bernardo Goulart Burity, baseado nos materiais da Profa. Ana Paula Madureira e nas referências acadêmicas vinculadas na interface.

## Atualização das explicações — outubro de 2026

Os percursos de planejamento e análise agora apresentam um exemplo curto antes de cada escolha, a opção “Entender melhor esta escolha” e uma explicação do significado das respostas selecionadas. A ajuda se adapta, por exemplo, a blocos, medidas pareadas e grupos já existentes. Não foram acrescentadas perguntas ou análises calculadas no site.

As explicações são originais, com inspiração pedagógica nos trechos pertinentes de Intuitive Biostatistics, de Harvey Motulsky (Oxford University Press, 1995). O livro não está incluído neste pacote. As referências acadêmicas dos métodos continuam acessíveis no site.

## Como atualizar o site que já está publicado

1. Extraia o ZIP em seu computador.
2. Abra https://github.com/goulartburity-debug/ensaio-bioestatistica e selecione a aba Code e a branch main.
3. Clique em Add file > Upload files (Adicionar arquivo > Enviar arquivos).
4. Arraste todos os 10 arquivos de dentro da pasta extraída. Não arraste a pasta inteira nem o ZIP. index.html, app.mjs, teaching.mjs e styles.css devem ficar lado a lado na raiz do repositório.
5. Aguarde os uploads terminarem. Os arquivos com o mesmo nome vão atualizar os existentes. teaching.mjs é um arquivo novo necessário para esta versão.
6. Em Commit changes, escreva “Melhora das explicações de planejamento e análise”. Mantenha a opção de gravar diretamente na branch main e confirme em Commit changes.
7. O GitHub Pages publicará novamente usando a configuração existente. Não é necessário mudar Settings > Pages. Confira o andamento na aba Actions. A publicação pode levar até 10 minutos.
8. Abra https://goulartburity-debug.github.io/ensaio-bioestatistica/ e recarregue com Ctrl+F5. No planejamento, procure “Um exemplo para decidir” e “Entender melhor esta escolha”. Teste também o percurso Escolher uma análise.

O endereço permanece o mesmo. Este pacote preparado não altera o site publicado até você enviar os arquivos e confirmar a alteração.

## Para testar e manter

O site orienta a metodologia; não executa análises nem recebe tabelas de dados. As respostas ficam somente no navegador do visitante. O tamanho amostral não é calculado; o critério didático de significância é 5%.

Os módulos JavaScript precisam ser servidos por HTTP(S). Abrir index.html por duplo clique não substitui a publicação. Não é necessário instalar programas para atualizar pelo GitHub.

As regras estatísticas de guide.mjs e analysis.mjs foram preservadas nesta revisão. Foram verificados os percursos condicionais e a renderização em testes automatizados; a avaliação didática com alunos permanece essencial.

Documentação de envio: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
