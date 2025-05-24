
import useUserDataService from "@/services/userDataService";

interface AtendimentoData {
  id: string;
  nome: string;
  dataNascimento: string;
  signo: string;
  tipoServico: string;
  statusPagamento: string;
  dataAtendimento: string;
  valor: string;
  destino: string;
  ano: string;
  atencaoNota: string;
  detalhes: string;
  tratamento: string;
  indicacao: string;
  atencaoFlag: boolean;
  data: string;
}

// Function to save a new atendimento
export const saveNewAtendimento = (atendimento: AtendimentoData, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Add the new one
  const updatedAtendimentos = [...currentAtendimentos, atendimento];
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return atendimento;
};

// Function to update an existing atendimento
export const updateAtendimento = (id: string, updatedAtendimento: Partial<AtendimentoData>, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getAtendimentos, saveAtendimentos } = userDataService;
  
  // Get current atendimentos
  const currentAtendimentos = getAtendimentos();
  
  // Find and update the specific one
  const updatedAtendimentos = currentAtendimentos.map(atendimento => 
    atendimento.id === id ? { ...atendimento, ...updatedAtendimento } : atendimento
  );
  
  // Save all
  saveAtendimentos(updatedAtendimentos);
  
  return updatedAtendimento;
};

// Function to save a new tarot analysis
export const saveNewTarotAnalysis = (analysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Add the new one
  const updatedAnalyses = [...currentAnalyses, analysis];
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return analysis;
};

// Function to update an existing tarot analysis
export const updateTarotAnalysis = (id: string, updatedAnalysis: any, userDataService: ReturnType<typeof useUserDataService>) => {
  const { getTarotAnalyses, saveTarotAnalyses } = userDataService;
  
  // Get current analyses
  const currentAnalyses = getTarotAnalyses();
  
  // Find and update the specific one
  const updatedAnalyses = currentAnalyses.map(analysis => 
    analysis.id === id ? { ...analysis, ...updatedAnalysis } : analysis
  );
  
  // Save all
  saveTarotAnalyses(updatedAnalyses);
  
  return updatedAnalysis;
};
