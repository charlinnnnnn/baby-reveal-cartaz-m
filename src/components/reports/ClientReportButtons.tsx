
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface ClientReportButtonsProps {
  clients: Array<{ name: string; count: number }>;
  atendimentos: any[];
  variant?: 'home' | 'tarot';
}

const ClientReportButtons: React.FC<ClientReportButtonsProps> = ({ 
  clients, 
  atendimentos,
  variant = 'home'
}) => {
  const downloadDetailedClientReport = (clientName: string) => {
    try {
      const clientConsultations = atendimentos.filter(a => 
        variant === 'tarot' ? a.nomeCliente === clientName : a.nome === clientName
      );
      
      if (clientConsultations.length === 0) {
        toast.error("Nenhum atendimento encontrado para este cliente");
        return;
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(variant === 'tarot' ? 124, 100, 244 : 14, 165, 233);
      const reportTitle = variant === 'tarot' ? 
        `🔮 Relatório Tarot Frequencial: ${clientName}` : 
        `🔹 Relatório Geral do Cliente: ${clientName}`;
      doc.text(reportTitle, 105, 15, { align: 'center' });
      
      let yPos = 30;
      
      // Client basic info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const firstConsultation = clientConsultations[0];
      
      if (variant === 'tarot') {
        if (firstConsultation?.signo) {
          doc.text(`Signo: ${firstConsultation.signo}`, 14, yPos);
          yPos += 6;
        }
        
        if (firstConsultation?.dataInicio) {
          doc.text(`Primeira Análise: ${new Date(firstConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 6;
        }
      } else {
        if (firstConsultation?.dataNascimento) {
          doc.text(`Data de Nascimento: ${new Date(firstConsultation.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
          yPos += 6;
        }
        
        if (firstConsultation?.signo) {
          doc.text(`Signo: ${firstConsultation.signo}`, 14, yPos);
          yPos += 6;
        }
      }
      
      yPos += 5;
      
      // Statistics
      const totalAtendimentos = clientConsultations.length;
      const totalValue = clientConsultations.reduce((acc, curr) => 
        acc + parseFloat(variant === 'tarot' ? (curr.preco || "150") : (curr.valor || "0")), 0
      );
      const mediaValue = totalValue / totalAtendimentos;
      
      doc.text(`Total de ${variant === 'tarot' ? 'Análises' : 'Atendimentos'}: ${totalAtendimentos}`, 14, yPos);
      yPos += 6;
      doc.text(`Valor Total Gasto: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Média por ${variant === 'tarot' ? 'Análise' : 'Atendimento'}: R$ ${mediaValue.toFixed(2)}`, 14, yPos);
      yPos += 10;
      
      // Check for attention flags
      const hasAttentionFlag = clientConsultations.some(a => a.atencaoFlag);
      if (hasAttentionFlag) {
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text('🚩 Observação:', 14, yPos);
        yPos += 6;
        doc.text('⚠️ Este cliente requer atenção especial', 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
      }
      
      // Add more details based on variant
      if (variant === 'tarot') {
        // Tarot-specific content
        const finalizadas = clientConsultations.filter(c => c.finalizado).length;
        const emAndamento = clientConsultations.length - finalizadas;
        
        doc.text(`Análises Finalizadas: ${finalizadas}`, 14, yPos);
        yPos += 6;
        doc.text(`Análises em Andamento: ${emAndamento}`, 14, yPos);
        yPos += 10;
        
        // Treatment summary
        let totalTratamentos = 0;
        clientConsultations.forEach(consulta => {
          if (consulta.lembretes && Array.isArray(consulta.lembretes)) {
            totalTratamentos += consulta.lembretes.filter(l => l.texto && l.texto.trim()).length;
          }
        });
        
        doc.text(`Total de Tratamentos: ${totalTratamentos}`, 14, yPos);
        yPos += 10;
      }
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      const filePrefix = variant === 'tarot' ? 'Relatorio_Tarot' : 'Relatorio_Detalhado';
      doc.save(`${filePrefix}_${clientName.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success(`Relatório detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  if (clients.length === 0) return null;

  const buttonStyle = variant === 'tarot' ? 
    'border-[#7C64F4] text-[#7C64F4] hover:bg-purple-50' : 
    'border-[#2196F3] text-[#2196F3] hover:bg-blue-50';

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Relatórios Detalhados por Cliente:</h3>
      <div className="flex flex-wrap gap-2">
        {clients.map((client) => (
          <Button
            key={client.name}
            onClick={() => downloadDetailedClientReport(client.name)}
            variant="outline"
            size="sm"
            className={`text-xs ${buttonStyle}`}
          >
            <User className="h-3 w-3 mr-1" />
            {client.name} ({client.count})
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ClientReportButtons;
