
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  User, 
  DollarSign,
  ArrowLeft,
  CheckCircle,
  FileDown,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";
import useUserDataService from "@/services/userDataService";
import { useToast } from "@/hooks/use-toast";
import ReportManager from "@/components/ReportManager";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add the type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    getNumberOfPages: () => number;
  }
}

const RelatorioGeral = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const { getAtendimentos } = useUserDataService();
  const { toast } = useToast();

  useEffect(() => {
    loadAtendimentos();
  }, []);

  const loadAtendimentos = async () => {
    const data = getAtendimentos();
    setAtendimentos(data);
  };

  useEffect(() => {
    const nomes = [...new Set(atendimentos.map(item => item.nome))];
    setClientesUnicos(nomes);
  }, [atendimentos]);

  const filteredClientes = clientesUnicos.filter(cliente =>
    cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAtendimentosByClient = (cliente: string) => {
    return atendimentos.filter(a => a.nome === cliente);
  };

  const downloadClienteReport = (cliente) => {
    try {
      const doc = new jsPDF();
      const atendimentosCliente = atendimentos.filter(a => a.nome === cliente);
      
      // Add header
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`Relatório Consolidado: ${cliente}`, 105, 15, { align: 'center' });
      
      // Client info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      const firstAtendimento = atendimentosCliente[0];
      if (firstAtendimento.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(firstAtendimento.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (firstAtendimento.signo) {
        doc.text(`Signo: ${firstAtendimento.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Total de Atendimentos: ${atendimentosCliente.length}`, 14, yPos);
      yPos += 8;
      
      const valorTotal = atendimentosCliente.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0);
      doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
      yPos += 15;
      
      // Table of appointments
      const tableColumn = ["Data", "Tipo", "Valor", "Status", "Observações"];
      const tableRows = atendimentosCliente.map(a => [
        a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-',
        a.tipoServico ? a.tipoServico.replace('-', ' ') : '-',
        `R$ ${parseFloat(a.valor || "0").toFixed(2)}`,
        a.statusPagamento || 'Pendente',
        a.detalhes ? (a.detalhes.length > 30 ? a.detalhes.substring(0, 30) + '...' : a.detalhes) : '-'
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Additional details section
      doc.setFontSize(14);
      doc.setTextColor(14, 165, 233);
      doc.text('Detalhes dos Atendimentos', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      atendimentosCliente.forEach((a, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Atendimento ${index + 1}: ${a.dataAtendimento ? new Date(a.dataAtendimento).toLocaleDateString('pt-BR') : '-'}`, 14, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        if (a.detalhes) {
          const detalhesLines = doc.splitTextToSize(`Detalhes: ${a.detalhes}`, 180);
          doc.text(detalhesLines, 14, yPos);
          yPos += detalhesLines.length * 5 + 5;
        }
        
        if (a.tratamento) {
          const tratamentoLines = doc.splitTextToSize(`Tratamento: ${a.tratamento}`, 180);
          doc.text(tratamentoLines, 14, yPos);
          yPos += tratamentoLines.length * 5 + 5;
        }
        
        if (a.indicacao) {
          const indicacaoLines = doc.splitTextToSize(`Indicação: ${a.indicacao}`, 180);
          doc.text(indicacaoLines, 14, yPos);
          yPos += indicacaoLines.length * 5 + 5;
        }
        
        if (a.atencaoFlag) {
          doc.setTextColor(220, 38, 38);
          doc.text(`ATENÇÃO: ${a.atencaoNota || 'Este cliente requer atenção especial'}`, 14, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 8;
        }
        
        yPos += 5;
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
      
      // Save PDF
      doc.save(`Relatorio_${cliente.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório consolidado foi baixado com sucesso.",
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
    return atendimentos.reduce((acc, curr) => acc + parseFloat(curr.valor || "0"), 0).toFixed(2);
  };

  const getStatusCounts = () => {
    const pago = atendimentos.filter(a => a.statusPagamento === 'pago').length;
    const pendente = atendimentos.filter(a => a.statusPagamento === 'pendente').length;
    const parcelado = atendimentos.filter(a => a.statusPagamento === 'parcelado').length;
    return { pago, pendente, parcelado };
  };

  const { pago, pendente, parcelado } = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <BirthdayNotifications />
      
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo height={70} width={70} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Libertá - Relatórios Gerais
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

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Recebido</p>
                  <p className="text-2xl font-bold text-[#0EA5E9]">R$ {getTotalValue()}</p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <DollarSign className="h-8 w-8 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pagos</p>
                  <p className="text-2xl font-bold text-green-600">{pago}</p>
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
                  <p className="text-sm font-medium text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold text-[#0EA5E9]">{clientesUnicos.length}</p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <User className="h-8 w-8 text-[#0EA5E9]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Relatórios Gerais */}
        <Card className="border-blue-100 shadow-md mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Relatórios Gerais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ReportManager variant="home" />
          </CardContent>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Lista de Clientes</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="pr-10 border-blue-200 focus:border-[#0EA5E9]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredClientes.map(cliente => {
                const atendimentosCliente = getAtendimentosByClient(cliente);
                const isExpanded = expandedClient === cliente;
                
                return (
                  <div key={cliente} className="border border-blue-100 rounded-lg">
                    {/* Header do cliente */}
                    <div 
                      className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => setExpandedClient(isExpanded ? null : cliente)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-blue-600" />
                        )}
                        <span className="font-medium text-gray-800">{cliente}</span>
                        <span className="text-sm text-gray-500">({atendimentosCliente.length} atendimentos)</span>
                      </div>
                    </div>
                    
                    {/* Lista de atendimentos expandida */}
                    {isExpanded && (
                      <div className="border-t border-blue-100 bg-blue-25">
                        <div className="p-4">
                          <h4 className="font-medium text-gray-700 mb-3">Atendimentos realizados:</h4>
                          <div className="space-y-3">
                            {atendimentosCliente.map((atendimento, index) => (
                              <div key={atendimento.id} className="bg-white border border-blue-100 rounded-md p-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      Atendimento {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Data: {atendimento.dataAtendimento ? new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR') : 'N/A'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Serviço: {atendimento.tipoServico ? atendimento.tipoServico.replace('-', ' ') : 'N/A'}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium">
                                      Valor: R$ {parseFloat(atendimento.valor || "0").toFixed(2)}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                      atendimento.statusPagamento === 'pago'
                                        ? 'bg-green-100 text-green-700' 
                                        : atendimento.statusPagamento === 'parcelado'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {atendimento.statusPagamento ? 
                                        atendimento.statusPagamento.charAt(0).toUpperCase() + atendimento.statusPagamento.slice(1) : 
                                        'Pendente'}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-blue-50"
                                    onClick={() => navigate(`/relatorio-individual/${atendimento.id}`)}
                                  >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredClientes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-blue-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600">Nenhum cliente encontrado</h3>
                  <p className="text-gray-500 mt-2">Registre atendimentos para visualizar os relatórios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelatorioGeral;
