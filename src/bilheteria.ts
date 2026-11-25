import {
  DadosInvalidosErro,
  NaoEncontradoErro,
  PagamentoErro,
} from "./dominio.ts";
import { calcularTotal, montarIngressos } from "./preco.ts";
import { direitoAMeia } from "./regras.ts";
import type { Bilheteria, Comprovante, ConfigBilheteria, EventoInfo, Pedido } from "./tipos.ts";

export type { Bilheteria } from "./tipos.ts";

function validarPedido(pedido: unknown): asserts pedido is Pedido {
  if (
    typeof pedido !== "object" ||
    pedido === null ||
    !("eventoId" in pedido) ||
    typeof pedido.eventoId !== "number" ||
    !Number.isInteger(pedido.eventoId) ||
    pedido.eventoId < 1 ||
    !("ingressos" in pedido) ||
    !Array.isArray(pedido.ingressos) ||
    pedido.ingressos.length === 0
  ) {
    throw new DadosInvalidosErro("Informe o evento e pelo menos um ingresso");
  }

  for (const pessoa of pedido.ingressos) {
    if (
      typeof pessoa !== "object" ||
      pessoa === null ||
      typeof pessoa.nome !== "string" ||
      pessoa.nome.trim().length === 0 ||
      !Number.isInteger(pessoa.idade) ||
      pessoa.idade < 0 ||
      typeof pessoa.estudante !== "boolean" ||
      typeof pessoa.pcd !== "boolean" ||
      !Number.isInteger(pessoa.poltrona) ||
      pessoa.poltrona < 1
    ) {
      throw new DadosInvalidosErro("Dados do ingresso inválidos");
    }
  }
}

export function criarBilheteria({ eventos, pagar }: ConfigBilheteria): Bilheteria {
  let ultimaReservaId = 0;

  return {
    listarEventos(): EventoInfo[] {
      return eventos.map((evento) => evento.info());
    },

    async reservar(pedido: unknown): Promise<Comprovante> {
      validarPedido(pedido);
      const evento = eventos.find((evento) => evento.id === pedido.eventoId);
      if (!evento) {
        throw new NaoEncontradoErro("Evento não encontrado");
      }

      const ingressos = montarIngressos(evento.preco, pedido.ingressos, direitoAMeia);
      const total = calcularTotal(ingressos);
      const poltronas = ingressos.map((ingresso) => ingresso.poltrona);

      // A reserva é síncrona: outro pedido já encontra as poltronas ocupadas.
      evento.reservar(poltronas);

      try {
        await pagar(total);
      } catch {
        evento.liberar(poltronas);
        throw new PagamentoErro("Não foi possível concluir o pagamento");
      }

      return {
        reservaId: ++ultimaReservaId,
        eventoId: evento.id,
        ingressos,
        total,
      };
    },
  };
}
