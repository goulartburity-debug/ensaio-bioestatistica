# Validação — tamanho amostral 1.0.0

## Resultado executado

153 testes automatizados passaram em 15/10/2026. Incluem regressão dos percursos anteriores, cálculos, campos, armazenamento e integração. A verificação de interface usou renderização e eventos com DOM simulado. Não houve inspeção visual em navegador real nem teste em aparelho celular nesta entrega; o CSS preserva a identidade existente e contém regras responsivas. Recomenda-se testar a publicação no celular antes de divulgar à turma.

## Referências numéricas

1. **SciPy 1.17.0**, distribuições `scipy.stats.ncf`, `nct`, `f`, `t`, `norm` (as não centrais usam implementações numéricas independentes, baseadas em Boost). Não é uma chamada do próprio código JavaScript em outro invólucro.
2. **OpenEpi original**, scripts `SSMean.js`, `SSCohort.js`, `SSPropor.js` da cópia baixada em 15/10/2026, identificados pelos hashes documentados. Executados em ambiente VM com captura das tabelas originais, sem alterar seus cálculos.
3. Equações de planejamento implementadas separadamente em Python, com SciPy nos quantis/distribuições e NumPy na decomposição dos efeitos fatoriais.

Documentação das distribuições: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ncf.html e https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.nct.html.

## Casos e tolerâncias

- **17 probabilidades de poder**: 11 F não centrais e seis t pareados. Tolerância absoluta de poder <2×10⁻⁶. Graus de liberdade de 1 até 999.998; não centralidades F até 1.000; valores de α de 0,0001 a 0,05 nos fixtures. Inclui ambas as caudas do pareado, uma cauda, grande n, pequenos graus de liberdade e poder próximo de 1.
- **32 tamanhos amostrais completos**: exigem igualdade exata dos inteiros por nível, total analisável e total inicial; quando há poder calculado, tolerância <2×10⁻⁶. Cobrem todos os 11 métodos, alocação desigual 0,5/2/2,3, direções negativas, correlação intrapar, efeitos pequenos, população finita, perdas e três termos fatoriais.
- **11 casos do OpenEpi original**: dez com recomendação comparada e um bloqueado pela triagem de baixa contagem esperada. Tolerância permitida de até uma unidade por grupo nos casos comparáveis, por diferenças entre constantes/ANorm originais e quantis jStat. O exemplo Rosner reproduziu 152 unidades em cada grupo.
- Um caso de Fleiss que o OpenEpi calcula, com baixa contagem esperada, é recusado deliberadamente pelo Ensaio; o teste confirma essa recusa, em vez de afirmar equivalência de recomendação.
- Testes de direção: poder e variabilidade maiores aumentam n; diferença ou margem maiores reduzem n, mantendo os outros parâmetros.
- Rejeições: campos vazios, não números, separadores ambíguos, grupos fracionários, efeito nulo, sinal incompatível, interação nula, proporções extremas incompatíveis com aproximação, população insuficiente após perdas e ausência de solução no intervalo de busca.
- A rotina F inicialmente não convergiu em quatro casos de referência com não centralidade elevada. A soma foi corrigida para pesos relativos com controle de cauda geométrica; esses mesmos casos permanecem na suíte e passam.

As tolerâncias descrevem os casos executados, não uma certificação de erro máximo uniforme em todo o espaço de parâmetros. Fora do domínio validado, o módulo deve falhar explicitamente e não extrapolar com uma aproximação escondida.

## Exemplos reproduzidos

| Situação, α=5% e poder=80% quando aplicáveis | Quantidade analisável |
|---|---|
| Média, DP=8, margem=2, confiança=95% | 62 unidades |
| Proporção=50%, margem=5 pontos, confiança=95% | 385 unidades |
| Duas médias, Δ=5, DP1=DP2=8, alocação igual | 41 por grupo (aproximação normal) |
| Pareado, Δ=5, DPdif=8, bilateral | 23 pares; poder 81,7107% |
| ANOVA, médias 10/12/15, DP=8 | 50 por tratamento; total 150 |
| DBC, médias 10/12/15, DP residual=4 | 14 blocos; total 42 |
| Mesmo DBC com 10% de perda de blocos | 16 blocos inicialmente; total 48 |
| Conglomerados, p=50%, margem=5 pontos, m=20, ICC=0,05 | 38 conglomerados; 760 observações vinculadas |

## Integração e interface

- Abertura direta sem planejamento.
- Importação do plano em duas etapas, com prévia e confirmação; nenhuma diferença ou variabilidade presumida.
- Confirmação obrigatória para aplicar; cópia do estado anterior preservada até a aplicação.
- DBC modifica número de blocos e uma unidade por tratamento/bloco; DIC não recebe um número calculado para blocos.
- Fatorial verifica ambos os níveis, cruzamento completo e ausência de blocos.
- Razões desiguais não são convertidas em replicação igual.
- Subamostras, datas, equipamentos e múltiplos níveis não são declarados independentes.
- Plano alterado e versão antiga bloqueiam transferência; editar parâmetros invalida o resultado visível.
- Vírgula decimal, mensagens de erro focadas, resumo copiável e restauração de parâmetros sem reutilizar resultados antigos.
- Regressão: testes existentes de planejamento, análise, exemplos fixos, glossário, escape de texto e ajudas expansíveis continuam passando.

## Como executar

Somente para manutenção do código; o usuário do site não instala nada.

```sh
node --test tests/*.test.mjs
python3 tests/generate-reference.py
node tests/record-openepi-reference.mjs /caminho/OpenEpi/SampleSize
```

Os fixtures de referência ficam no repositório. `generate-reference.py` requer SciPy/NumPy para regerá-los; não é necessário para rodar os testes JavaScript ou publicar o site. Os cálculos do navegador não acessam OpenEpi, SciPy, WebPower ou qualquer serviço remoto.
