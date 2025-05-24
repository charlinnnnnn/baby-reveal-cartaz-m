
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
    const todayString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const birthdaysToday = atendimentos.filter(atendimento => {
      if (atendimento.dataNascimento) {
        const birthDate = new Date(atendimento.dataNascimento);
        const birthString = `${birthDate.getDate().toString().padStart(2, '0')}-${(birthDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return birthString === todayString;
      }
      return false;
    });

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
