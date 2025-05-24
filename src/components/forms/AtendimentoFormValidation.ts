
export interface AtendimentoFormData {
  id: string;
  nome: string;
  dataAtendimento: string;
  tipoServico: string;
  valor: string;
  statusPagamento: string;
  dataNascimento: string;
  signo: string;
  destino: string;
  ano: string;
  detalhes: string;
  tratamento: string;
  indicacao: string;
  atencaoFlag: boolean;
  atencaoNota: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateAtendimentoForm = (data: AtendimentoFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validações obrigatórias
  if (!data.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
  }

  if (!data.dataAtendimento) {
    errors.dataAtendimento = 'Data do atendimento é obrigatória';
  }

  if (!data.tipoServico) {
    errors.tipoServico = 'Tipo de serviço é obrigatório';
  }

  // Validações de formato
  if (data.valor && isNaN(Number(data.valor))) {
    errors.valor = 'Valor deve ser um número válido';
  }

  if (data.valor && Number(data.valor) < 0) {
    errors.valor = 'Valor não pode ser negativo';
  }

  // Validação de data
  if (data.dataAtendimento) {
    const dataAtendimento = new Date(data.dataAtendimento);
    const hoje = new Date();
    
    if (dataAtendimento > hoje) {
      errors.dataAtendimento = 'Data do atendimento não pode ser no futuro';
    }
  }

  return errors;
};

export const calcularSigno = (dataNascimento: string): string => {
  if (!dataNascimento) return '';
  
  const date = new Date(dataNascimento);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
  else return "Peixes";
};
