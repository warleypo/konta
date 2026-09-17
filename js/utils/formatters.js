export function formatarDataEN(data) {
  return data.split("/").reverse().join("-");
}

export function formatarDataBR(data) {
  return data.split("-").reverse().join("/");
}

export function formatarMoeda(valor) {
  return valor.toFixed(2);
}

export function formatarDataPtBr(data) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
