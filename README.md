# Bilheteria concorrente

Projeto de Paradigmas de Linguagens de Programação com TypeScript e Express. Combina orientação a objetos no controle das poltronas, programação funcional no cálculo dos preços e promessas na compra concorrente.

## Executar

Ambiente de execução: Node.js v22.22.0, npm 10.9.4 e Linux x86_64 no WSL2.

```bash
npm ci
npm test
npm run typecheck
npm start
```

O servidor atende em `http://localhost:3000`. Os eventos e as reservas ficam em memória; reiniciar o processo restaura todas as poltronas.

| ID | Evento | Preço da inteira | Capacidade |
| --- | --- | --- | --- |
| 1 | Show de música | R$ 100,00 | 100 |
| 2 | Peça de teatro | R$ 80,00 | 60 |
| 3 | Sessão de cinema | R$ 40,00 | 80 |

A operadora simulada tem latência de 80 ms e probabilidade de falha de 10%. O limite local de espera é de 500 ms.

## Usar a API

Listar os eventos e a disponibilidade atual:

```bash
curl http://localhost:3000/eventos
```

Comprar um ingresso escolhendo a poltrona:

```bash
curl -i http://localhost:3000/reservas \
  -H 'Content-Type: application/json' \
  -d '{"eventoId":1,"ingressos":[{"nome":"Ana","idade":20,"estudante":true,"pcd":false,"poltrona":1}]}'
```

Quando o pagamento é aprovado, o exemplo retorna HTTP 201 e um comprovante neste formato:

```json
{
  "reservaId": 1,
  "eventoId": 1,
  "ingressos": [
    { "nome": "Ana", "poltrona": 1, "tipo": "meia", "valor": 50 }
  ],
  "total": 55
}
```

O identificador é gerado após a aprovação e é único dentro da instância da bilheteria. Estudantes, pessoas com deficiência e pessoas com 60 anos ou mais têm direito à meia-entrada. O total inclui taxa de serviço de 10%, com arredondamento a duas casas decimais.

| Status | Significado |
| --- | --- |
| 200 | Lista de eventos |
| 201 | Compra aprovada |
| 400 | Pedido ou JSON inválido; poltrona inválida ou repetida |
| 404 | Evento inexistente |
| 409 | Uma das poltronas já está ocupada |
| 502 | Recusa, falha ou tempo limite de pagamento |

## Compra e concorrência

1. Validar o pedido e localizar o evento.
2. Montar os ingressos com a regra de meia e calcular o total.
3. Reservar todas as poltronas de forma síncrona, antes de chamar a operadora. O `Evento` valida a lista inteira antes de alterar seu estado.
4. Aguardar `Promise.race` entre o pagamento e o temporizador. Durante essa espera, outros pedidos podem ser atendidos e já encontram essas poltronas ocupadas.
5. Em caso de aprovação, emitir o comprovante. Em caso de recusa ou tempo limite, liberar as poltronas e lançar `PagamentoErro`. Limpar o temporizador no `finally`.

O limite encerra apenas a espera local: a interface da operadora não permite cancelar uma cobrança em andamento. Uma resposta tardia não emite comprovante nem altera as poltronas novamente. A proteção de concorrência vale para a instância em memória deste serviço.

## Validação

`npm test`: **16/16 pontos**. A suíte cobre regras de meia-entrada, preços, controle de poltronas, pedidos simultâneos, recuperação após recusa, tempo limite e integração HTTP.

`npm run typecheck`: verificação de tipos sem erros.

## Medições de concorrência

Resultados no ambiente descrito acima, usando o evento 1. O servidor foi reiniciado antes de cada medição, com 100 poltronas livres.

| Comando | Pedidos | Tempo | Pedidos/s | 201 | 409 | 502 | Poltronas livres ao final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `npm run bench` | 200 | 241 ms | 831 | 93 | 100 | 7 | 7 |
| `npm run bench -- 500 1` | 500 | 469 ms | 1.066 | 100 | 393 | 7 | 0 |
| `npm run bench -- 1000 1` | 1.000 | 589 ms | 1.697 | 100 | 893 | 7 | 0 |

Em todas as execuções, o número de vendas permaneceu dentro da capacidade e correspondeu a `100 - disponivel`. As falhas simuladas liberam poltronas; pedidos que chegam depois dessa liberação podem comprá-las. Os tempos e a quantidade de recusas variam a cada execução, pois a simulação usa `Math.random()` e depende do ambiente.

Para repetir, execute `npm start` em um terminal e o benchmark em outro. Encerre e reinicie o servidor entre as medições.

## Integrantes e contribuições

| Integrante | Usuário GitHub | Contribuição |
| --- | --- | --- |
| Ester Marreiro da Rocha | [EsterMarreiro](https://github.com/EsterMarreiro) | Importação da base; regra de meia-entrada; cálculo dos preços e da taxa de serviço; classes de erros e controle de poltronas. |
| José Nichollas Leandro Ribeiro | [jnicklr](https://github.com/jnicklr) | Compra e emissão de comprovantes; contrato da bilheteria; recuperação após falha no pagamento; tempo limite; configuração dos eventos e do servidor; documentação. |

## Vídeo

Link do vídeo: **a adicionar**.
