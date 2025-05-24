
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
  const downloadAllDetailedReports = () => {
    try {
      if (variant === 'tarot') {
        // Para tarot, gera um relatório geral consolidado
        generateTarotGeneralReport();
      } else {
        // Para home, gera relatórios individuais para cada cliente
        clients.forEach((client, index) => {
          setTimeout(() => {
            downloadDetailedClientReport(client.name);
          }, index * 1000);
        });
        
        toast.success(`Gerando ${clients.length} relatórios individuais detalhados...`);
      }
    } catch (error) {
      console.error("Erro ao gerar relatórios:", error);
      toast.error("Erro ao gerar relatórios");
    }
  };

  const generateTarotGeneralReport = () => {
    const doc = new jsPDF();
    
    // Relatório Geral do Cliente – Histórico Consolidado
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Geral do Cliente – Histórico Consolidado', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
    // Agrupa análises por cliente
    const clientsMap = new Map();
    atendimentos.forEach(analise => {
      const clientName = analise.nomeCliente;
      if (!clientsMap.has(clientName)) {
        clientsMap.set(clientName, []);
      }
      clientsMap.get(clientName).push(analise);
    });

    // Para cada cliente, gera o relatório
    Array.from(clientsMap.entries()).forEach(([clientName, consultations], clientIndex) => {
      if (clientIndex > 0) {
        doc.addPage();
        yPos = 20;
      }
      
      const firstConsultation = consultations[0];
      const lastConsultation = consultations[consultations.length - 1];
      const totalValue = consultations.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      const avgValue = totalValue / consultations.length;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
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
        if (yPos > 220) {
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
          doc.text(antesLines, 14, yPos);
          yPos += antesLines.length * 5 + 5;
        }
        
        if (consultation.analiseDepois) {
          doc.text('Depois:', 14, yPos);
          yPos += 6;
          const depoisLines = doc.splitTextToSize(consultation.analiseDepois, 170);
          doc.text(depoisLines, 14, yPos);
          yPos += depoisLines.length * 5 + 5;
        }
        
        if (consultation.lembretes && consultation.lembretes.length > 0) {
          const tratamentos = consultation.lembretes.filter(l => l.texto?.trim());
          if (tratamentos.length > 0) {
            doc.text('Tratamento:', 14, yPos);
            yPos += 6;
            tratamentos.forEach(lembrete => {
              const tratamentoLines = doc.splitTextToSize(lembrete.texto, 170);
              doc.text(tratamentoLines, 14, yPos);
              yPos += tratamentoLines.length * 5;
            });
            yPos += 5;
          }
        }
        
        yPos += 10;
      });
      
      // Observações Gerais
      if (yPos > 200) {
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
      yPos += 15;
    });
    
    addFooter(doc);
    
    const fileName = `Relatorio_Geral_Consolidado_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    toast.success("Relatório geral consolidado gerado com sucesso!");
  };

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
      
      toast.success(`Relatório detalhado de ${clientName} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const generateIndividualTarotReport = (doc, consultation, clientName) => {
    // Relatório Individual – Análise Atual
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Individual – Análise Atual', 105, 15, { align: 'center' });
    
    let yPos = 35;
    
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
    
    // Análise – Antes
    if (consultation.analiseAntes) {
      doc.setFont(undefined, 'bold');
      doc.text('Análise – Antes', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      const antesLines = doc.splitTextToSize(consultation.analiseAntes, 180);
      doc.text(antesLines, 14, yPos);
      yPos += antesLines.length * 6 + 10;
    }
    
    // Análise – Depois
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
          yPos += tratamentoLines.length * 6 + 5;
        }
      });
    }
    
    addFooter(doc);
  };

  const generateGeneralTarotReport = (doc, consultations, clientName) => {
    doc.setFontSize(18);
    doc.setTextColor(124, 100, 244);
    doc.text('🔮 Relatório Geral do Cliente – Histórico Consolidado (Detalhado)', 105, 15, { align: 'center' });
    
    let yPos = 30;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
    yPos += 8;
    
    if (consultations.length === 0) {
      doc.text('Nenhum atendimento encontrado para este cliente', 14, yPos);
      yPos += 8;
    } else {
      doc.text(`Total de ${consultations.length} ${variant === 'tarot' ? 'Análises' : 'Atendimentos'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor Total Gasto: R$ ${consultations.reduce((acc, curr) => 
        acc + parseFloat(variant === 'tarot' ? (curr.preco || "150") : (curr.valor || "0")), 0).toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Média por ${variant === 'tarot' ? 'Análise' : 'Atendimento'}: R$ ${consultations.reduce((acc, curr) => 
        acc + parseFloat(variant === 'tarot' ? (curr.preco || "150") : (curr.valor || "0")), 0) / consultations.length}`, 14, yPos);
      yPos += 10;
      
      doc.setFont(undefined, 'normal');
      
      consultations.forEach((consultation, index) => {
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
    }
    
    addFooter(doc);
  };

  const generateGeneralReport = (doc, clientConsultations, clientName) => {
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233);
    doc.text('🔹 Relatório Geral do Cliente (Detalhado)', 105, 15, { align: 'center' });
    
    let yPos = 30;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Nome do Cliente: ${clientName}`, 14, yPos);
    yPos += 8;
    
    if (clientConsultations.length === 0) {
      doc.text('Nenhum atendimento encontrado para este cliente', 14, yPos);
      yPos += 8;
    } else {
      doc.text(`Total de ${clientConsultations.length} ${variant === 'tarot' ? 'Análises' : 'Atendimentos'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor Total Gasto: R$ ${clientConsultations.reduce((acc, curr) => 
        acc + parseFloat(variant === 'tarot' ? (curr.preco || "150") : (curr.valor || "0")), 0).toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Média por ${variant === 'tarot' ? 'Análise' : 'Atendimento'}: R$ ${clientConsultations.reduce((acc, curr) => 
        acc + parseFloat(variant === 'tarot' ? (curr.preco || "150") : (curr.valor || "0")), 0) / clientConsultations.length}`, 14, yPos);
      yPos += 10;
      
      doc.setFont(undefined, 'normal');
      
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
    }
    
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

  const buttonColor = variant === 'tarot' ? 
    'border-[#7C64F4] text-[#7C64F4] hover:bg-purple-50' : 
    'border-[#2196F3] text-[#2196F3] hover:bg-blue-50';

  return (
    <Button
      onClick={downloadAllDetailedReports}
      variant="outline"
      className={buttonColor}
    >
      <Download className="h-4 w-4 mr-2" />
      Todos Detalhados
    </Button>
  );
};

export default DetailedClientReportGenerator;
