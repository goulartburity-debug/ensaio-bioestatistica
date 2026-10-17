// Textos fornecidos para o banner Dicas do Guia.
export const guideTips=Object.freeze([
 "Dica: O bom delineamento começa na sua pergunta biológica, e não depois que os dados já foram coletados.",
 "Dica: Cuidado com a pseudorepetição. Medir a mesma parcela ou unidade várias vezes não substitui repetições independentes.",
 "Dica: Se há variação de luz ou temperatura na sua bancada ou estufa, use o delineamento em blocos para isolar esse ruído.",
 "Dica: Aumentar o tamanho amostral melhora a sua precisão, mas não salva um experimento que não tem um grupo controle adequado.",
 "Dica: Olhe para os seus dados antes de rodar os testes. Um bom gráfico de dispersão ou boxplot geralmente revela muito mais que um p-valor.",
 "Dica: A aleatorização é a sua maior defesa contra vieses. Nunca subestime o rigor de sortear a posição de cada tratamento."
]);
export function drawGuideTip(previous=''){
 let last=previous;
 try{last=last||sessionStorage.getItem('codel-stat-last-guide-tip')||'';}catch{}
 const pool=guideTips.filter(t=>t!==last);
 const tip=pool[Math.floor(Math.random()*pool.length)];
 try{sessionStorage.setItem('codel-stat-last-guide-tip',tip);}catch{}
 return tip;
}
