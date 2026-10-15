# Transições de etapas

Removida a rolagem forçada ao topo ao avançar em planejamento e análise. A calculadora também não rola automaticamente ao concluir o cálculo: o resultado recebe foco com preventScroll. Navegação para outra página pode iniciar no topo.

O módulo transitions.mjs preserva a posição de rolagem, foco identificado e seleção do campo no mesmo módulo. O conteúdo interno recebe cross-fade simultâneo de 240 ms ease-in-out. A cópia que sai fica inerte e oculta da árvore de acessibilidade; é removida ao concluir ou iniciar outra transição. O card externo não é animado. Preferência por movimento reduzido desativa a animação.

Altura mínima inicial de 760 px no computador e 640 px no celular. O maior tamanho já medido fica registrado por módulo e faixa de largura durante a sessão. A altura pode crescer diante de conteúdo novo maior, incluindo ajudas abertas: não há altura máxima nem corte de controles. overflow:hidden é aplicado ao card para conter o fade, não para truncar perguntas. Conteúdo maior que a tela continua exigindo rolagem normal; não é possível garantir formulário arbitrariamente longo em uma única tela sem reduzir legibilidade ou ocultar opções.

338 testes automatizados, incluindo quatro testes do controlador de transições. Sem inspeção visual em navegador nesta entrega.
