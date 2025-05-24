
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { jsPDF } from 'jspdf';
import { toast } from "sonner";

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

interface ReportGeneratorProps {
  atendimento: AtendimentoData;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ atendimento }) => {
  const downloadReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`Relatório de Atendimento: ${atendimento.nome}`, 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      if (atendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(atendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (atendimento.signo) {
        doc.text(`Signo: ${atendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Tipo de Serviço: ${atendimento.tipoServico?.replace('-', ' ') || 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Data do Atendimento: ${atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor: R$ ${parseFloat(atendimento.valor || "0").toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Status de Pagamento: ${atendimento.statusPagamento || 'Não especificado'}`, 14, yPos);
      yPos += 15;
      
      if (atendimento.detalhes) {
        doc.setFontSize(14);
        doc.setTextColor(14, 165, 233);
        doc.text('Detalhes do Atendimento', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const detalhesLines = doc.splitTextToSize(atendimento.detalhes, 180);
        doc.text(detalhesLines, 14, yPos);
        yPos += detalhesLines.length * 5 + 10;
      }
      
      if (atendimento.tratamento) {
        doc.setFontSize(14);
        doc.setTextColor(14, 165, 233);
        doc.text('Tratamento', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const tratamentoLines = doc.splitTextToSize(atendimento.tratamento, 180);
        doc.text(tratamentoLines, 14, yPos);
        yPos += tratamentoLines.length * 5 + 10;
      }
      
      if (atendimento.indicacao) {
        doc.setFontSize(14);
        doc.setTextColor(14, 165, 233);
        doc.text('Indicação', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const indicacaoLines = doc.splitTextToSize(atendimento.indicacao, 180);
        doc.text(indicacaoLines, 14, yPos);
        yPos += indicacaoLines.length * 5 + 10;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.save(`Relatorio_${atendimento.nome.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <Button
      onClick={downloadReport}
      className="bg-[#9b87f5] hover:bg-[#8A71E5] text-white"
    >
      <FileText className="h-4 w-4 mr-2" />
      Baixar Relatório
    </Button>
  );
};
