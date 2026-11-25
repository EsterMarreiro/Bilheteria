import { criarBilheteria } from "./bilheteria.ts";
import { Evento } from "./dominio.ts";
import { criarPagamentoFalso } from "./pagamento.ts";
import { criarServidor } from "./servidor.ts";

const eventos = [
  new Evento(1, "Show de música", 100, 100),
  new Evento(2, "Peça de teatro", 80, 60),
  new Evento(3, "Sessão de cinema", 40, 80),
];

const bilheteria = criarBilheteria({
  eventos,
  pagar: criarPagamentoFalso({ latenciaMs: 80, taxaDeFalha: 0.1 }),
  limitePagamentoMs: 500,
});

criarServidor(bilheteria).listen(3000, () => {
  console.log("Bilheteria disponível em http://localhost:3000");
});
