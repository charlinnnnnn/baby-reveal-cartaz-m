
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
      
      if (variant === 'tarot') {
        // Relatório Individual ou Geral baseado no número de análises
        if (clientConsultations.length === 1) {
          generateIndividualTarotReport(doc, clientConsultations[0], clientName);
        } else {
          generateGeneralTarotReport(doc, clientConsultations, clientName);
        }
      } else {
        generateGeneralReport(doc, clientConsultations, clientName);
      }
      
      const filePrefix = variant === 'tarot' ? 
        (clientConsultations.length === 1 ? 'Relatorio_Individual_Tarot' : 'Relatorio_Geral_Tarot') : 
        'Relatorio_Detalhado';
      doc.save(`${filePrefix}_${clientName.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success(`Relatório de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const generateIndividualTarotReport = (doc, consultation, clientName) => {
    // Header
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Individual – Análise Atual', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
    // Client info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
    yPos += 8;
    
    if (consultation.dataNascimento) {
      doc.text(`Data de Nascimento: ${new Date(consultation.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 8;
    }
    
    if (consultation.signo) {
      doc.text(`Signo: ${consultation.signo}`, 14, yPos);
      yPos += 8;
    }
    
    if (consultation.dataInicio) {
      doc.text(`Data da Análise: ${new Date(consultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 8;
    }
    
    doc.text(`Valor da Análise: R$ ${parseFloat(consultation.preco || "150").toFixed(2)}`, 14, yPos);
    yPos += 15;
    
    doc.setFont(undefined, 'normal');
    
    // Análise - Antes
    if (consultation.analiseAntes) {
      doc.setFont(undefined, 'bold');
      doc.text('Análise – Antes', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      const antesLines = doc.splitTextToSize(consultation.analiseAntes, 180);
      doc.text(antesLines, 14, yPos);
      yPos += antesLines.length * 6 + 10;
    }
    
    // Análise - Depois
    if (consultation.analiseDepois) {
      doc.setFont(undefined, 'bold');
      doc.text('Análise – Depois', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      const depoisLines = doc.splitTextToSize(consultation.analiseDepois, 180);
      doc.text(depoisLines, 14, yPos);
      yPos += depoisLines.length * 6 + 10;
    }
    
    // Tratamento Realizado
    if (consultation.lembretes && consultation.lembretes.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Tratamento Realizado', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      
      consultation.lembretes.forEach(lembrete => {
        if (lembrete.texto && lembrete.texto.trim()) {
          const tratamentoLines = doc.splitTextToSize(lembrete.texto, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 6;
          
          // Próximo Aviso
          if (lembrete.dias) {
            yPos += 5;
            doc.setFont(undefined, 'bold');
            doc.text('Próximo Aviso', 14, yPos);
            yPos += 6;
            doc.setFont(undefined, 'normal');
            doc.text(`Recomendar reavaliação em ${lembrete.dias} dias.`, 14, yPos);
            yPos += 10;
          }
        }
      });
    }
    
    addFooter(doc);
  };

  const generateGeneralTarotReport = (doc, consultations, clientName) => {
    // Header
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Geral do Cliente – Histórico Consolidado', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
    // Client info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const firstConsultation = consultations[0];
    const lastConsultation = consultations[consultations.length - 1];
    const totalValue = consultations.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
    const avgValue = totalValue / consultations.length;
    
    doc.setFont(undefined, 'bold');
    doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
    yPos += 8;
    
    if (firstConsultation.dataNascimento) {
      doc.text(`Data de Nascimento: ${new Date(firstConsultation.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 8;
    }
    
    if (firstConsultation.signo) {
      doc.text(`Signo: ${firstConsultation.signo}`, 14, yPos);
      yPos += 8;
    }
    
    if (firstConsultation.dataInicio) {
      doc.text(`Data da Primeira Análise: ${new Date(firstConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 8;
    }
    
    if (lastConsultation.dataInicio) {
      doc.text(`Data da Última Análise: ${new Date(lastConsultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 8;
    }
    
    doc.text(`Total de Análises Realizadas: ${consultations.length}`, 14, yPos);
    yPos += 8;
    
    doc.text(`Valor Total Investido: R$ ${totalValue.toFixed(2)}`, 14, yPos);
    yPos += 8;
    
    doc.text(`Média por Análise: R$ ${avgValue.toFixed(2)}`, 14, yPos);
    yPos += 15;
    
    doc.setFont(undefined, 'normal');
    
    // Resumo das Análises
    doc.setFont(undefined, 'bold');
    doc.text('Resumo das Análises', 14, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    consultations.forEach((consultation, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`Análise ${index + 1}:`, 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      
      if (consultation.dataInicio) {
        doc.text(`Data: ${new Date(consultation.dataInicio).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 6;
      }
      
      if (consultation.analiseAntes) {
        doc.text('Antes:', 14, yPos);
        yPos += 6;
        const antesLines = doc.splitTextToSize(consultation.analiseAntes, 170);
        doc.text(antesLines, 20, yPos);
        yPos += antesLines.length * 5 + 5;
      }
      
      if (consultation.analiseDepois) {
        doc.text('Depois:', 14, yPos);
        yPos += 6;
        const depoisLines = doc.splitTextToSize(consultation.analiseDepois, 170);
        doc.text(depoisLines, 20, yPos);
        yPos += depoisLines.length * 5 + 5;
      }
      
      if (consultation.lembretes && consultation.lembretes.length > 0) {
        consultation.lembretes.forEach(lembrete => {
          if (lembrete.texto && lembrete.texto.trim()) {
            doc.text('Tratamento:', 14, yPos);
            yPos += 6;
            const tratamentoLines = doc.splitTextToSize(lembrete.texto, 170);
            doc.text(tratamentoLines, 20, yPos);
            yPos += tratamentoLines.length * 5 + 5;
          }
        });
      }
      
      yPos += 10;
    });
    
    // Observações Gerais
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Observações Gerais', 14, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    doc.text('• Evolução observada nas análises.', 14, yPos);
    yPos += 6;
    doc.text('• Padrões recorrentes nas descrições de "Antes" e "Depois".', 14, yPos);
    yPos += 6;
    doc.text('• Frequência dos retornos com base no campo "Avisar daqui a [X] dias".', 14, yPos);
    
    addFooter(doc);
  };

  const generateGeneralReport = (doc, clientConsultations, clientName) => {
    // Header
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233);
    doc.text(`🔹 Relatório Geral do Cliente: ${clientName}`, 105, 15, { align: 'center' });
    
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
      acc + parseFloat(curr.valor || "0"), 0
    );
    const mediaValue = totalValue / totalAtendimentos;
    
    doc.text(`Total de Atendimentos: ${totalAtendimentos}`, 14, yPos);
    yPos += 6;
    doc.text(`Valor Total Gasto: R$ ${totalValue.toFixed(2)}`, 14, yPos);
    yPos += 6;
    doc.text(`Média por Atendimento: R$ ${mediaValue.toFixed(2)}`, 14, yPos);
    
    addFooter(doc);
  };

  const addFooter = (doc) => {
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
