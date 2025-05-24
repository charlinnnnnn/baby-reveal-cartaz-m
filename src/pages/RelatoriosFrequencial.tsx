import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  DollarSign,
  ArrowLeft,
  Clock,
  CheckCircle,
  FileDown,
  Pencil
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

interface AnaliseFrequencial {
  id: string;
  nomeCliente: string;
  dataInicio: string;
  preco: string;
  finalizado: boolean;
  signo?: string;
  analiseAntes?: string;
  analiseDepois?: string;
  lembretes?: Array<{
    texto: string;
    dias: number;
  }>;
  atencaoFlag?: boolean;
}

const RelatoriosFrequencial = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [analises, setAnalises] = useState<AnaliseFrequencial[]>([]);
  const [clientesUnicos, setClientesUnicos] = useState<string[]>([]);
  const { getAllTarotAnalyses } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalises();
  }, []);

  const loadAnalises = () => {
    const data = getAllTarotAnalyses();
    setAnalises(data);
  };

  useEffect(() => {
    const nomes = [...new Set(analises.map(item => item.nomeCliente))];
    setClientesUnicos(nomes);
  }, [analises]);

  const filteredClientes = clientesUnicos.filter(cliente =>
    cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadClienteReport = (cliente: string) => {
    try {
      const doc = new jsPDF();
      const analisesCliente = analises.filter(a => a.nomeCliente === cliente);
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`Relatório Frequencial: ${cliente}`, 105, 15, { align: 'center' });
      
      // Informações do cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const firstAnalise = analisesCliente[0];
      if (firstAnalise?.signo) {
        doc.text(`Signo: ${firstAnalise.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Análises: ${analisesCliente.length}`, 14, yPos);
      yPos += 8;
      
      const valorTotal = analisesCliente.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0);
      doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      // Tabela de análises
      const tableColumn = ["Data", "Preço", "Tratamentos", "Status"];
      const tableRows = analisesCliente.map(a => {
        const numTratamentos = a.lembretes ? a.lembretes.filter(l => l.texto?.trim()).length : 0;
        
        return [
          a.dataInicio ? new Date(a.dataInicio).toLocaleDateString('pt-BR') : '-',
          `R$ ${parseFloat(a.preco || "150").toFixed(2)}`,
          numTratamentos.toString(),
          a.finalizado ? 'Finalizado' : 'Em Andamento'
        ];
      });
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headerStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
      // Rodapé
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
      
      // Forçar o download
      doc.save(`Relatorio_Frequencial_${cliente.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao baixar relatório",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
      });
    }
  };

  const getTotalValue = () => {
    return analises.reduce((acc, curr) => acc + parseFloat(curr.preco || "150"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const finalizados = analises.filter(a => a.finalizado).length;
    const emAndamento = analises.filter(a => !a.finalizado).length;
    return { finalizados, emAndamento };
  };

  const { finalizados, emAndamento } = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatórios Frequenciais
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Recebido</p>
                  <p className="text-2xl font-bold">R$ {getTotalValue()}</p>
                </div>
                <div className="rounded-full p-3 bg-purple-100">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Finalizados</p>
                  <p className="text-2xl font-bold">{finalizados}</p>
                </div>
                <div className="rounded-full p-3 bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold">{emAndamento}</p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Lista de Clientes</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        <Card className="border-purple-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <CardTitle className="text-[#9b87f5]">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-[#9b87f5]">Cliente</th>
                    <th className="text-left py-2 px-4 text-[#9b87f5]">Análises</th>
                    <th className="text-left py-2 px-4 text-[#9b87f5]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map(cliente => {
                    const analisesCliente = analises.filter(a => a.nomeCliente === cliente);
                    
                    return (
                      <tr key={cliente} className="hover:bg-purple-50">
                        <td className="py-3 px-4">{cliente}</td>
                        <td className="py-3 px-4">{analisesCliente.length}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#9b87f5] text-[#9b87f5] hover:bg-purple-50"
                            onClick={() => downloadClienteReport(cliente)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Baixar Relatório
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredClientes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600">Nenhum cliente encontrado</h3>
                  <p className="text-gray-500 mt-2">Realize análises para visualizar os relatórios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatoriosFrequencial;