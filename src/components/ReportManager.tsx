
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, User } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useUserDataService from '@/services/userDataService';

interface ReportManagerProps {
  variant?: 'home' | 'tarot';
}

const ReportManager: React.FC<ReportManagerProps> = ({ variant = 'home' }) => {
  const { getAtendimentos, getClientsWithConsultations } = useUserDataService();

  const downloadGeneralReport = () => {
    try {
      const atendimentos = getAtendimentos();
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text('Relatório Geral de Atendimentos', 105, 15, { align: 'center' });
      
      // Summary
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const totalAtendimentos = atendimentos.length;
      const totalValue = atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      const paidConsultations = atendimentos.filter(a => a.statusPagamento === 'pago').length;
      const pendingConsultations = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
      
      doc.text(`Total de Atendimentos: ${totalAtendimentos}`, 14, yPos);
      yPos += 8;
      doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 8;
      doc.text(`Consultas Pagas: ${paidConsultations}`, 14, yPos);
      yPos += 8;
      doc.text(`Consultas Pendentes: ${pendingConsultations}`, 14, yPos);
      yPos += 15;
      
      // Table
      const tableColumn = ["Cliente", "Data", "Serviço", "Valor", "Status"];
      const tableRows = atendimentos.map(a => [
        a.nome || 'N/A',
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A',
        a.tipoServico?.replace('-', ' ') || 'N/A',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
        a.statusPagamento || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headerStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
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
      
      doc.save(`Relatorio_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório geral gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadDetailedClientReport = (clientName: string) => {
    try {
      const atendimentos = getAtendimentos();
      const clientConsultations = atendimentos.filter(a => a.nome === clientName);
      
      if (clientConsultations.length === 0) {
        toast.error("Nenhum atendimento encontrado para este cliente");
        return;
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`🔹 Relatório Geral do Cliente: ${clientName}`, 105, 15, { align: 'center' });
      
      let yPos = 30;
      
      // Client basic info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const firstConsultation = clientConsultations[0];
      if (firstConsultation?.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(firstConsultation.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 6;
      }
      
      if (firstConsultation?.signo) {
        doc.text(`Signo: ${firstConsultation.signo}`, 14, yPos);
        yPos += 6;
      }
      
      yPos += 5;
      
      // Statistics
      const totalAtendimentos = clientConsultations.length;
      const totalValue = clientConsultations.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      const mediaValue = totalValue / totalAtendimentos;
      
      doc.text(`Total de Atendimentos: ${totalAtendimentos}`, 14, yPos);
      yPos += 6;
      doc.text(`Valor Total Gasto: R$ ${totalValue.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Média por Atendimento: R$ ${mediaValue.toFixed(2)}`, 14, yPos);
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
      
      // Detailed appointments section
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('🗂️ Detalhes dos Atendimentos:', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      clientConsultations.forEach((consultation, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Appointment header
        const appointmentNumber = `${index + 1}️⃣`;
        const dataFormatada = consultation.dataAtendimento ? 
          new Date(consultation.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A';
        const servicoFormatado = consultation.tipoServico ? 
          consultation.tipoServico.replace('-', ' ').replace('tarot', 'Tarot').replace('terapia', 'Terapia').replace('mesa radionica', 'Mesa Radiônica') :
          'N/A';
        const statusFormatado = consultation.statusPagamento || 'Não especificado';
        
        doc.setFont(undefined, 'bold');
        doc.text(`${appointmentNumber} Data: ${dataFormatada} — 💼 Serviço: ${servicoFormatado} — 💳 Status: ${statusFormatado}`, 14, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'normal');
        
        // Details
        if (consultation.destino) {
          doc.text(`Destino: ${consultation.destino}`, 14, yPos);
          yPos += 5;
        }
        
        if (consultation.ano) {
          doc.text(`Ano: ${consultation.ano}`, 14, yPos);
          yPos += 5;
        }
        
        if (consultation.detalhes) {
          const detalhesLines = doc.splitTextToSize(`Detalhes da Sessão: ${consultation.detalhes}`, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 5;
        }
        
        if (consultation.tratamento) {
          const tratamentoLines = doc.splitTextToSize(`Tratamento: ${consultation.tratamento}`, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 5;
        }
        
        if (consultation.indicacao) {
          const indicacaoLines = doc.splitTextToSize(`Indicação: ${consultation.indicacao}`, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 5;
        }
        
        yPos += 8; // Space between appointments
      });
      
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
      
      doc.save(`Relatorio_Detalhado_${clientName.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success(`Relatório detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadAllIndividualReports = () => {
    try {
      const clients = getClientsWithConsultations();
      
      clients.forEach((client, index) => {
        setTimeout(() => {
          downloadDetailedClientReport(client.name);
        }, index * 1000);
      });
      
      toast.success(`Gerando ${clients.length} relatórios individuais detalhados...`);
    } catch (error) {
      console.error("Erro ao gerar relatórios:", error);
      toast.error("Erro ao gerar relatórios");
    }
  };

  const clients = getClientsWithConsultations();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={downloadGeneralReport}
          className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Relatório Geral
        </Button>
        
        <Button
          onClick={downloadAllIndividualReports}
          variant="outline"
          className="border-[#2196F3] text-[#2196F3] hover:bg-blue-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Todos Detalhados
        </Button>
      </div>

      {clients.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Relatórios Detalhados por Cliente:</h3>
          <div className="flex flex-wrap gap-2">
            {clients.map((client) => (
              <Button
                key={client.name}
                onClick={() => downloadDetailedClientReport(client.name)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                {client.name} ({client.count})
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManager;
