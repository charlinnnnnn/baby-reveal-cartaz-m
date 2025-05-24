
import React from 'react';
import useUserDataService from '@/services/userDataService';
import DetailedClientReportGenerator from './reports/DetailedClientReportGenerator';
import ClientReportButtons from './reports/ClientReportButtons';

interface ReportManagerProps {
  variant?: 'home' | 'tarot';
}

const ReportManager: React.FC<ReportManagerProps> = ({ variant = 'home' }) => {
  const { getAtendimentos, getClientsWithConsultations, getAllTarotAnalyses } = useUserDataService();
  
  // Para tarot, usamos dados específicos
  if (variant === 'tarot') {
    const analises = getAllTarotAnalyses();
    const clientsMap = new Map();

    analises.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (clientsMap.has(clientName)) {
        clientsMap.get(clientName).count++;
        clientsMap.get(clientName).consultations.push(analise);
      } else {
        clientsMap.set(clientName, {
          name: clientName,
          count: 1,
          consultations: [analise]
        });
      }
    });

    const tarotClients = Array.from(clientsMap.values());

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <DetailedClientReportGenerator 
            atendimentos={analises} 
            clients={tarotClients}
            variant="tarot"
          />
        </div>

        <ClientReportButtons 
          clients={tarotClients} 
          atendimentos={analises}
          variant="tarot"
        />
      </div>
    );
  }

  // Para home, usamos atendimentos normais
  const atendimentos = getAtendimentos();
  const clients = getClientsWithConsultations();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <DetailedClientReportGenerator 
          atendimentos={atendimentos} 
          clients={clients} 
        />
      </div>

      <ClientReportButtons 
        clients={clients} 
        atendimentos={atendimentos} 
      />
    </div>
  );
};

export default ReportManager;
