# Header azul-gelo e dicas

Cabeçalho #EEF2F6 com links azul-marinho e logo original transparente, sem fundo de apoio CSS. Estados ativo, hover e foco mantêm contraste.

Seis textos fornecidos pelo usuário preservados integralmente em guide-tips.mjs. Sorteio usa Math.random na primeira renderização e ao retornar à home; exclui a última frase para evitar repetição imediata. sessionStorage guarda apenas a última dica, permitindo variar também ao recarregar a mesma aba. Sem acesso a sessionStorage o sorteio continua funcionando. Atualizações internas da home, como abrir confirmação, mantêm a frase.

Texto recebe fade-in de 0,5 s apenas na entrada da home; preferência por movimento reduzido desativa o efeito.

Validação: 346 testes existentes e três testes do sorteio passaram. Transparência alfa original confirmada. Sem revisão visual em navegador nesta entrega.
