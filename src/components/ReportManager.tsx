
import React from 'react';
import useUserDataService from '@/services/userDataService';
import GeneralReportGenerator from './reports/GeneralReportGenerator';
import DetailedClientReportGenerator from './reports/DetailedClientReportGenerator';
import ClientReportButtons from './reports/ClientReportButtons';

interface ReportManagerProps {
  variant?: 'home' | 'tarot';
}

const ReportManager: React.FC<ReportManagerProps> = ({ variant = 'home' }) => {
  const { getAtendimentos, getClientsWithConsultations } = useUserDataService();
  const atendimentos = getAtendimentos();
  const clients = getClientsWithConsultations();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <GeneralReportGenerator atendimentos={atendimentos} />
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
