
import { useAuth } from "@/contexts/AuthContext";

// Service to handle user-specific data
const useUserDataService = () => {
  const { currentUser } = useAuth();
  
  const getUserId = () => {
    return currentUser?.id || 'guest';
  };
  
  // Save atendimentos with user ID
  const saveAtendimentos = (atendimentos: any[]) => {
    const userId = getUserId();
    
    // Get all user data
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update this user's data
    allUserData[userId] = {
      ...allUserData[userId],
      atendimentos,
    };
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(allUserData));
  };
  
  // Get atendimentos for current user
  const getAtendimentos = () => {
    const userId = getUserId();
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (allUserData[userId]?.atendimentos || []);
  };
  
  // Save tarot analyses with user ID
  const saveTarotAnalyses = (analyses: any[]) => {
    const userId = getUserId();
    
    // Get all user data
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update this user's data
    allUserData[userId] = {
      ...allUserData[userId],
      tarotAnalyses: analyses,
    };
    
    // Save back to localStorage
    localStorage.setItem('userData', JSON.stringify(allUserData));
  };
  
  // Get tarot analyses for current user
  const getTarotAnalyses = () => {
    const userId = getUserId();
    const allUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (allUserData[userId]?.tarotAnalyses || []);
  };

  // Get all analyses from localStorage (for reports)
  const getAllTarotAnalyses = () => {
    return JSON.parse(localStorage.getItem('analises') || '[]');
  };
  
  // Save all analyses to localStorage (for reports)
  const saveAllTarotAnalyses = (analyses: any[]) => {
    localStorage.setItem('analises', JSON.stringify(analyses));
  };

  // Check for birthdays today
  const checkBirthdays = () => {
    const atendimentos = getAtendimentos();
    const today = new Date();
    console.log('Verificando aniversários para data:', today.toLocaleDateString('pt-BR'));
    console.log('Total de atendimentos:', atendimentos.length);
    
    const birthdaysToday = atendimentos.filter(atendimento => {
      if (atendimento.dataNascimento) {
        try {
          const birthDate = new Date(atendimento.dataNascimento);
          
          // Verificar se a data é válida
          if (isNaN(birthDate.getTime())) {
            console.log(`Data inválida para ${atendimento.nome}: ${atendimento.dataNascimento}`);
            return false;
          }
          
          const isSameDay = birthDate.getDate() === today.getDate();
          const isSameMonth = birthDate.getMonth() === today.getMonth();
          
          console.log(`Cliente: ${atendimento.nome}, Nascimento: ${birthDate.toLocaleDateString('pt-BR')}, Hoje: ${today.toLocaleDateString('pt-BR')}, Mesmo dia e mês: ${isSameDay && isSameMonth}`);
          
          return isSameDay && isSameMonth;
        } catch (error) {
          console.error(`Erro ao processar data de nascimento de ${atendimento.nome}:`, error);
          return false;
        }
      }
      return false;
    });

    console.log('Aniversários encontrados:', birthdaysToday.map(b => b.nome));
    return birthdaysToday;
  };

  // Get clients with their consultation count
  const getClientsWithConsultations = () => {
    const atendimentos = getAtendimentos();
    const clientsMap = new Map();

    atendimentos.forEach(atendimento => {
      const clientName = atendimento.nome;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).count++;
        clientsMap.get(clientName).consultations.push(atendimento);
      } else {
        clientsMap.set(clientName, {
          name: clientName,
          count: 1,
          consultations: [atendimento]
        });
      }
    });

    return Array.from(clientsMap.values());
  };
  
  return {
    saveAtendimentos,
    getAtendimentos,
    saveTarotAnalyses,
    getTarotAnalyses,
    getAllTarotAnalyses,
    saveAllTarotAnalyses,
    checkBirthdays,
    getClientsWithConsultations
  };
};

export default useUserDataService;
