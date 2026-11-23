import type { Ingresso, Pessoa, TipoIngresso } from "./tipos.ts";

export function valorDoIngresso(
  precoBase: number,
): (tipo: TipoIngresso) => number {
  return (tipo) => {
    if (tipo === "meia") {
      return Math.round((precoBase / 2) * 100) / 100;
    }
    return precoBase;
  };
}

export function aplicarTaxa(percentual: number): (valor: number) => number {
  return (valor) => {
    const valorComTaxa = valor * (1 + percentual);
    return Math.round(valorComTaxa * 100) / 100;
  };
}

export function montarIngressos(
  precoBase: number,
  pessoas: readonly Pessoa[],
  temDireitoAMeia: (pessoa: Pessoa) => boolean,
): Ingresso[] {
  const calcularValor = valorDoIngresso(precoBase);
  return pessoas.map((pessoa) => {
    const tipo = temDireitoAMeia(pessoa) ? "meia" : "inteira";
    return {
      nome: pessoa.nome,
      poltrona: pessoa.poltrona,
      tipo,
      valor: calcularValor(tipo),
    };
  });
}

export function calcularTotal(ingressos: readonly Ingresso[]): number {
  const subtotal = ingressos.reduce(
    (totalAteAqui, ingresso) => totalAteAqui + ingresso.valor,
    0,
  );
  const aplicarTaxaDeServico = aplicarTaxa(0.1);
  return aplicarTaxaDeServico(subtotal);
}
