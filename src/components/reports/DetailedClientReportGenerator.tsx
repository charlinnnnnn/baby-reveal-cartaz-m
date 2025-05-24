
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface DetailedClientReportGeneratorProps {
  atendimentos: any[];
  clients: Array<{ name: string; count: number }>;
  variant?: 'home' | 'tarot';
}

const DetailedClientReportGenerator: React.FC<DetailedClientReportGeneratorProps> = ({ 
  atendimentos, 
  clients,
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
      if (variant === 'tarot') {
        doc.setTextColor(124, 100, 244);
      } else {
        doc.setTextColor(14, 165, 233);
      }
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
      
      // Detailed appointments section
      doc.setFontSize(14);
      if (variant === 'tarot') {
        doc.setTextColor(124, 100, 244);
      } else {
        doc.setTextColor(14, 165, 233);
      }
      doc.text(`🗂️ Detalhes ${variant === 'tarot' ? 'das Análises' : 'dos Atendimentos'}:`, 14, yPos);
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
        
        if (variant === 'tarot') {
          const dataFormatada = consultation.dataInicio ? 
            new Date(consultation.dataInicio).toLocaleDateString('pt-BR') : 'N/A';
          const statusFormatado = consultation.finalizado ? 'Finalizado' : 'Em Andamento';
          
          doc.setFont(undefined, 'bold');
          doc.text(`${appointmentNumber} Data: ${dataFormatada} — 💰 Preço: R$ ${parseFloat(consultation.preco || "150").toFixed(2)} — 📊 Status: ${statusFormatado}`, 14, yPos);
          yPos += 6;
          
          doc.setFont(undefined, 'normal');
          
          if (consultation.analiseAntes) {
            const analiseAntesLines = doc.splitTextToSize(`Análise Antes: ${consultation.analiseAntes}`, 180);
            doc.text(analiseAntesLines, 14, yPos);
            yPos += analiseAntesLines.length * 5;
          }
          
          if (consultation.analiseDepois) {
            const analiseDepoisLines = doc.splitTextToSize(`Análise Depois: ${consultation.analiseDepois}`, 180);
            doc.text(analiseDepoisLines, 14, yPos);
            yPos += analiseDepoisLines.length * 5;
          }
          
          if (consultation.lembretes && consultation.lembretes.length > 0) {
            doc.text('Tratamentos/Lembretes:', 14, yPos);
            yPos += 5;
            consultation.lembretes.forEach((lembrete, idx) => {
              if (lembrete.texto && lembrete.texto.trim()) {
                const lembreteText = `${idx + 1}. ${lembrete.texto} (${lembrete.dias} dias)`;
                const lembreteLines = doc.splitTextToSize(lembreteText, 170);
                doc.text(lembreteLines, 20, yPos);
                yPos += lembreteLines.length * 5;
              }
            });
          }
        } else {
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
      
      const filePrefix = variant === 'tarot' ? 'Relatorio_Tarot_Detalhado' : 'Relatorio_Detalhado';
      doc.save(`${filePrefix}_${clientName.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success(`Relatório detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const downloadAllIndividualReports = () => {
    try {
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

  const buttonColor = variant === 'tarot' ? 
    'border-[#7C64F4] text-[#7C64F4] hover:bg-purple-50' : 
    'border-[#2196F3] text-[#2196F3] hover:bg-blue-50';

  return (
    <Button
      onClick={downloadAllIndividualReports}
      variant="outline"
      className={buttonColor}
    >
      <Download className="h-4 w-4 mr-2" />
      Todos Detalhados
    </Button>
  );
};

export default DetailedClientReportGenerator;
