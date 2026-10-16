# Seleção e contraste dos cards

Removida a faixa superior de navegação contextual (CoDel-Stat / módulo) de todas as páginas. O menu lateral continua identificando a seção ativa.

Planejamento e orientação de análises mantêm seleção na etapa atual. Continuar fica desabilitado enquanto a resposta obrigatória da etapa estiver incompleta; campos de texto/número atualizam a disponibilidade do botão sem exigir outro clique. A validação do manipulador também permanece ativa.

Na calculadora, objetivo e método são etapas separadas. Cada card apenas marca sua opção, com aria-pressed e indicador circular. Avançar confirma explicitamente; Voltar permite rever o objetivo. Revisar o planejamento, confirmar sua importação, aplicar resultado e os links de navegação continuam ações explícitas, não opções de resposta. A aplicação de quantidades continua exigindo prévia e confirmação.

Todos os cards de resposta usam .choice: fundo branco #FFFFFF, borda #D1D5DB, sombra discreta. Selecionados usam fundo #EFF6FF, borda e marcador #2563EB. Fundo geral marfim mantido. Os marcadores são decorativos (aria-hidden); o estado acessível está em aria-pressed.

Validação: 341 testes passaram, incluindo seleção sem avanço, confirmação separada, botão desabilitado e continuidade das 18 rotas. Casos anteriores foram atualizados para realizar as novas confirmações explícitas. Sem revisão visual em navegador nesta entrega.
