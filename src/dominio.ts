import type { EventoInfo } from "./tipos.ts";

export abstract class ErroDeNegocio extends Error {
  constructor(
    mensagem: string,
    readonly status: number,
  ) {
    super(mensagem);
    this.name = this.constructor.name;
  }
}

export class DadosInvalidosErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 400);
  }
}

export class NaoEncontradoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 404);
  }
}

export class PoltronaOcupadaErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 409);
  }
}

export class PagamentoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 502);
  }
}

export class Evento {
  #ocupadas: number[] = [];

  constructor(
    readonly id: number,
    readonly nome: string,
    readonly preco: number,
    readonly capacidade: number,
  ) {}

  get disponivel(): number {
    return this.capacidade - this.#ocupadas.length;
  }

  reservar(poltronas: readonly number[]): void {
    if (poltronas.length === 0) {
      throw new DadosInvalidosErro("Informe pelo menos uma poltrona");
    }

    for (const [indice, poltrona] of poltronas.entries()) {
      if (
        !Number.isInteger(poltrona) ||
        poltrona < 1 ||
        poltrona > this.capacidade
      ) {
        throw new DadosInvalidosErro(`Poltrona inválida: ${poltrona}`);
      }
      if (poltronas.indexOf(poltrona) !== indice) {
        throw new DadosInvalidosErro(`Poltrona repetida: ${poltrona}`);
      }
    }

    for (const poltrona of poltronas) {
      if (this.#ocupadas.includes(poltrona)) {
        throw new PoltronaOcupadaErro(`Poltrona ocupada: ${poltrona}`);
      }
    }

    this.#ocupadas = [...this.#ocupadas, ...poltronas];
  }

  liberar(poltronas: readonly number[]): void {
    if (poltronas.some((poltrona) => !this.#ocupadas.includes(poltrona))) {
      throw new DadosInvalidosErro("Informe apenas poltronas ocupadas");
    }
    this.#ocupadas = this.#ocupadas.filter(
      (poltrona) => !poltronas.includes(poltrona),
    );
  }

  info(): EventoInfo {
    return {
      id: this.id,
      nome: this.nome,
      preco: this.preco,
      capacidade: this.capacidade,
      disponivel: this.disponivel,
    };
  }
}
