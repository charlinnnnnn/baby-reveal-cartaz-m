import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import BirthdayChecker from "@/components/BirthdayChecker";

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAtendimentos, saveAtendimentos } = useUserDataService();
  const [atencao, setAtencao] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    dataNascimento: "",
    signo: "",
    tipoServico: "",
    statusPagamento: "",
    dataAtendimento: "",
    valor: "",
    destino: "",
    ano: "",
    atencaoNota: "",
    detalhes: "",
    tratamento: "",
    indicacao: "",
    atencaoFlag: false,
    data: ""
  });

  useEffect(() => {
    console.log("EditarAtendimento: Loading atendimento with ID:", id);
    const atendimentos = getAtendimentos();
    console.log("EditarAtendimento: Available atendimentos:", atendimentos);
    
    const atendimento = atendimentos.find(item => item.id === id);
    console.log("EditarAtendimento: Found atendimento:", atendimento);
    
    if (atendimento) {
      const newFormData = {
        id: atendimento.id || "",
        nome: atendimento.nome || "",
        dataNascimento: atendimento.dataNascimento || "",
        signo: atendimento.signo || "",
        tipoServico: atendimento.tipoServico || "",
        statusPagamento: atendimento.statusPagamento || "",
        dataAtendimento: atendimento.dataAtendimento || "",
        valor: atendimento.valor || "",
        destino: atendimento.destino || "",
        ano: atendimento.ano || "",
        atencaoNota: atendimento.atencaoNota || "",
        detalhes: atendimento.detalhes || "",
        tratamento: atendimento.tratamento || "",
        indicacao: atendimento.indicacao || "",
        atencaoFlag: atendimento.atencaoFlag || false,
        data: atendimento.data || ""
      };
      
      console.log("EditarAtendimento: Setting form data:", newFormData);
      setFormData(newFormData);
      setAtencao(atendimento.atencaoFlag || false);
    } else {
      toast.error("Atendimento não encontrado");
      navigate("/");
    }
    
    setIsLoading(false);
  }, [id, navigate, getAtendimentos]);

  const handleInputChange = (field: string, value: string) => {
    console.log("EditarAtendimento: Updating field", field, "with value", value);
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log("EditarAtendimento: Updated form data:", updated);
      return updated;
    });
  };

  const handleDataNascimentoChange = (value: string) => {
    console.log("EditarAtendimento: Updating birth date with value", value);
    setFormData(prev => ({
      ...prev,
      dataNascimento: value
    }));
    
    if (value) {
      const date = new Date(value);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      let signoCalculado = "";
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signoCalculado = "Áries";
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signoCalculado = "Touro";
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signoCalculado = "Gêmeos";
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signoCalculado = "Câncer";
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signoCalculado = "Leão";
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signoCalculado = "Virgem";
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signoCalculado = "Libra";
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signoCalculado = "Escorpião";
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) signoCalculado = "Sagitário";
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) signoCalculado = "Capricórnio";
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signoCalculado = "Aquário";
      else signoCalculado = "Peixes";
      
      setFormData(prev => ({
        ...prev,
        signo: signoCalculado
      }));
    }
  };

  const handleSaveAtendimento = () => {
    console.log("EditarAtendimento: Saving atendimento with data:", formData);
    
    if (!formData.nome.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    const atendimentos = getAtendimentos();
    const index = atendimentos.findIndex(item => item.id === id);
    
    console.log("EditarAtendimento: Found index:", index);
    
    if (index !== -1) {
      const updatedAtendimento = {
        ...formData,
        atencaoFlag: atencao,
      };
      
      console.log("EditarAtendimento: Updated atendimento:", updatedAtendimento);
      
      atendimentos[index] = updatedAtendimento;
      saveAtendimentos(atendimentos);
      
      toast.success("Atendimento atualizado com sucesso!");
      navigate("/");
    } else {
      toast.error("Erro ao atualizar atendimento");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500 text-white border-green-600";
      case "pendente":
        return "bg-yellow-500 text-white border-yellow-600";
      case "parcelado":
        return "bg-red-500 text-white border-red-600";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  const downloadReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text(`Relatório de Atendimento: ${formData.nome}`, 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 30;
      
      if (formData.dataNascimento) {
        doc.text(`Data de Nascimento: ${new Date(formData.dataNascimento).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 8;
      }
      
      if (formData.signo) {
        doc.text(`Signo: ${formData.signo}`, 14, yPos);
        yPos += 8;
      }
      
      doc.text(`Tipo de Serviço: ${formData.tipoServico?.replace('-', ' ') || 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Data do Atendimento: ${formData.dataAtendimento ? new Date(formData.dataAtendimento).toLocaleDateString('pt-BR') : 'Não especificado'}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Valor: R$ ${parseFloat(formData.valor || "0").toFixed(2)}`, 14, yPos);
      yPos += 8;
      
      doc.text(`Status de Pagamento: ${formData.statusPagamento || 'Não especificado'}`, 14, yPos);
      yPos += 15;
      
      if (formData.detalhes) {
        doc.setFontSize(14);
        doc.setTextColor(14, 165, 233);
        doc.text('Detalhes do Atendimento', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const detalhesLines = doc.splitTextToSize(formData.detalhes, 180);
        doc.text(detalhesLines, 14, yPos);
        yPos += detalhesLines.length * 5 + 10;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Libertá - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.save(`Relatorio_${formData.nome.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <BirthdayChecker dataNascimento={formData.dataNascimento} nome={formData.nome} />
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-[#2196F3]">
              Editar Atendimento
            </h1>
          </div>
          <Button
            onClick={downloadReport}
            className="bg-[#9b87f5] hover:bg-[#8A71E5] text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>

        <Card className="border-[#C5A3E0] shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2196F3]">Edição de Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cliente</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={formData.dataNascimento}
                  onChange={(e) => handleDataNascimentoChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo">Signo</Label>
                <Input 
                  id="signo" 
                  value={formData.signo} 
                  onChange={(e) => handleInputChange('signo', e.target.value)}
                  className="bg-white" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                <Select 
                  value={formData.tipoServico} 
                  onValueChange={(value) => handleInputChange('tipoServico', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarot">Tarot</SelectItem>
                    <SelectItem value="terapia">Terapia</SelectItem>
                    <SelectItem value="mesa-radionica">Mesa Radiônica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataAtendimento">Data do Atendimento</Label>
                <Input 
                  id="dataAtendimento" 
                  type="date" 
                  value={formData.dataAtendimento}
                  onChange={(e) => handleInputChange('dataAtendimento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor Cobrado (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPagamento">Status de Pagamento</Label>
                <Select 
                  value={formData.statusPagamento} 
                  onValueChange={(value) => handleInputChange('statusPagamento', value)}
                >
                  <SelectTrigger className={formData.statusPagamento ? `border-2 ${getStatusColor(formData.statusPagamento)}` : ""}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago" className="bg-green-100 text-green-800 hover:bg-green-200">Pago</SelectItem>
                    <SelectItem value="pendente" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</SelectItem>
                    <SelectItem value="parcelado" className="bg-red-100 text-red-800 hover:bg-red-200">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input 
                  id="destino" 
                  placeholder="Destino do cliente" 
                  value={formData.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input 
                  id="ano" 
                  placeholder="Ano específico" 
                  value={formData.ano}
                  onChange={(e) => handleInputChange('ano', e.target.value)}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="atencao" className="text-base flex items-center">
                    <AlertTriangle className={`mr-2 h-4 w-4 ${atencao ? "text-red-500" : "text-gray-400"}`} />
                    ATENÇÃO
                  </Label>
                  <Switch 
                    checked={atencao} 
                    onCheckedChange={setAtencao} 
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
                <Input 
                  id="atencaoNota" 
                  placeholder="Pontos de atenção" 
                  className={atencao ? "border-red-500 bg-red-50" : ""}
                  value={formData.atencaoNota}
                  onChange={(e) => handleInputChange('atencaoNota', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="detalhes">Detalhes da Sessão</Label>
              <Textarea 
                id="detalhes" 
                placeholder="Revelações, conselhos e orientações..." 
                className="min-h-[120px]"
                value={formData.detalhes}
                onChange={(e) => handleInputChange('detalhes', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="tratamento">Tratamento</Label>
                <Textarea 
                  id="tratamento" 
                  placeholder="Observações sobre o tratamento..." 
                  className="min-h-[100px]"
                  value={formData.tratamento}
                  onChange={(e) => handleInputChange('tratamento', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicacao">Indicação</Label>
                <Textarea 
                  id="indicacao" 
                  placeholder="Informações adicionais e indicações..." 
                  className="min-h-[100px]"
                  value={formData.indicacao}
                  onChange={(e) => handleInputChange('indicacao', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#2196F3] hover:bg-[#1976D2]"
              onClick={handleSaveAtendimento}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EditarAtendimento;
