
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import { updateAtendimento } from "@/utils/dataServices";
import BirthdayChecker from "@/components/BirthdayChecker";
import { AtendimentoForm } from "@/components/forms/AtendimentoForm";
import { ReportGenerator } from "@/components/reports/ReportGenerator";

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

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userDataService = useUserDataService();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<AtendimentoData>({
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
    if (!id) {
      toast.error("ID do atendimento não fornecido");
      navigate("/");
      return;
    }

    console.log("EditarAtendimento: Loading atendimento with ID:", id);
    const atendimentos = userDataService.getAtendimentos();
    console.log("EditarAtendimento: Available atendimentos:", atendimentos);
    
    const atendimento = atendimentos.find(item => item.id === id);
    console.log("EditarAtendimento: Found atendimento:", atendimento);
    
    if (atendimento) {
      setFormData({
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
      });
    } else {
      toast.error("Atendimento não encontrado");
      navigate("/");
    }
    
    setIsLoading(false);
  }, [id, navigate, userDataService]);

  const handleFormChange = (updatedData: Partial<AtendimentoData>) => {
    console.log("EditarAtendimento: Updating form data:", updatedData);
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleSaveAtendimento = () => {
    console.log("EditarAtendimento: Saving atendimento with data:", formData);
    
    if (!formData.nome.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    if (!id) {
      toast.error("ID do atendimento não encontrado");
      return;
    }

    try {
      updateAtendimento(id, formData, userDataService);
      toast.success("Atendimento atualizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao atualizar atendimento:", error);
      toast.error("Erro ao atualizar atendimento");
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
          <ReportGenerator atendimento={formData} />
        </div>

        <AtendimentoForm
          formData={formData}
          onChange={handleFormChange}
          onSave={handleSaveAtendimento}
          onCancel={() => navigate(-1)}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditarAtendimento;
