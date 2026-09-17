export function validarLancamento(lancamento) {
  const { descricao, valor, data, categoria, tipo } = lancamento;

  if (!descricao || !valor || !data || !categoria || !tipo) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  if (isNaN(valor) || valor <= 0) {
    throw new Error("Valor deve ser um número positivo.");
  }

  return true; // Validação passou
}

export function validaIntervaloDatas(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  if (isNaN(inicio) || isNaN(fim)) {
    return false; // Data inválida
  }

  return inicio <= fim; // Retorna true se a data de início for menor ou igual à data de fim
}
