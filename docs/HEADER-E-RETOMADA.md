# Cabeçalho superior e retomada

Removido o menu lateral da estrutura HTML, incluindo sua duplicação móvel e controle de recolhimento. Cabeçalho fixo azul-marinho #0F172A com logo à esquerda e sete destinos à direita. Em telas menores, navegação em linha própria com rolagem horizontal interna; o conteúdo reserva a altura correspondente do cabeçalho. O menu não participa das animações de entrada.

Logo enviada IMG-20261017-WA0118_1_-removebg-preview.png copiada sem alterações para assets/codel-stat-logo.png. Transparência original preservada; apresentação sobre apoio marfim discreto para tornar visíveis os traços escuros. A mesma URL serve como favicon.

No resumo ativo, o botão azul Continuar permanece. O botão secundário Esquecer estes dados usa texto cinza e ícone de lixeira. A confirmação explica a exclusão; cancelar não altera os dados. Confirmar zera as respostas do planejamento e remove o registro ensaio-sample-applied-v1. Os valores da calculadora e a orientação de análises não são excluídos. O resumo desaparece quando não há respostas.

Grafismo: caminho da curva, viewBox, tamanho e posicionamento preservados. O eixo horizontal foi separado em SVG de largura total do cabeçalho de boas-vindas. Sua coordenada vertical é alinhada ao y=180 do SVG original, considerando escala e centralização, e recalculada por ResizeObserver. Não amplia nem deforma a curva.

Também removida uma chamada legada de rolagem ao topo no avanço do planejamento.

Validação: 343 testes existentes e três novos testes de cabeçalho/exclusão passaram. Comparação confirma que o caminho da curva e os bytes da logo foram preservados. Sem revisão visual em navegador nesta entrega.
