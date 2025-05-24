
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
import { ArrowLeft, Save, AlertTriangle, Cake } from "lucide-react";
import { toast } from "sonner";
import useUserDataService from "@/services/userDataService";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import Logo from "@/components/Logo";

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAtendimentos, saveAtendimentos, checkBirthdays } = useUserDataService();
  const [dataNascimento, setDataNascimento] = useState("");
  const [signo, setSigno] = useState("");
  const [atencao, setAtencao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
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
  });

  useEffect(() => {
    const carregarAtendimento = () => {
      if (!id) {
        toast.error("ID do atendimento não fornecido");
        navigate('/');
        return;
      }

      try {
        const atendimentos = getAtendimentos();
        const atendimento = atendimentos.find(a => a.id === id);
        
        if (atendimento) {
          setFormData({
            nome: atendimento.nome || "",
            dataNascimento: atendimento.dataNascimento || "",
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
          });
          
          setDataNascimento(atendimento.dataNascimento || "");
          setSigno(atendimento.signo || "");
          setAtencao(Boolean(atendimento.atencaoFlag));
        } else {
          toast.error("Atendimento não encontrado");
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao carregar atendimento:', error);
        toast.error("Erro ao carregar o atendimento");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    carregarAtendimento();
  }, [id, navigate, getAtendimentos]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const checkIfBirthday = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth()) {
      const age = today.getFullYear() - birth.getFullYear();
      toast.success(
        `🎉 Hoje é aniversário desta pessoa! ${age} anos`,
        {
          duration: 8000,
          icon: <Cake className="h-5 w-5" />,
          description: "Não esqueça de parabenizar!"
        }
      );
    }
  };

  const handleDataNascimentoChange = (e) => {
    const value = e.target.value;
    setDataNascimento(value);
    setFormData({
      ...formData,
      dataNascimento: value,
    });
    
    // Check if it's birthday
    if (value) {
      checkIfBirthday(value);
    }
    
    // Lógica simples para determinar o signo baseado na data de nascimento
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
      
      setSigno(signoCalculado);
    } else {
      setSigno("");
    }
  };

  const handleSalvarAtendimento = () => {
    // Validações básicas
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.dataAtendimento) {
      toast.error("Data do atendimento é obrigatória");
      return;
    }

    try {
      // Get existing atendimentos from user data service
      const existingAtendimentos = getAtendimentos();
      
      const atendimentoAtualizado = {
        id: id,
        ...formData,
        signo,
        atencaoFlag: atencao,
        dataUltimaEdicao: new Date().toISOString(),
      };
      
      // Update the specific atendimento
      const atendimentosAtualizados = existingAtendimentos.map(atendimento => 
        atendimento.id === id ? atendimentoAtualizado : atendimento
      );
      
      // Save back using user data service
      saveAtendimentos(atendimentosAtualizados);
      
      // Show success message
      toast.success("Atendimento atualizado com sucesso!");
      
      // Navigate back to home page
      navigate("/");
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast.error("Erro ao salvar o atendimento");
    }
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo height={60} width={60} />
          <p className="mt-4 text-gray-600">Carregando atendimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <BirthdayNotifications checkOnMount={false} />
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#2196F3]">
              Editar Atendimento
            </h1>
          </div>
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
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={dataNascimento}
                  onChange={handleDataNascimentoChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signo">Signo</Label>
                <Input id="signo" value={signo} readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                <Select value={formData.tipoServico} onValueChange={(value) => handleSelectChange("tipoServico", value)}>
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
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor Cobrado (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.valor}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPagamento">Status de Pagamento</Label>
                <Select value={formData.statusPagamento} onValueChange={(value) => handleSelectChange("statusPagamento", value)}>
                  <SelectTrigger className={formData.statusPagamento ? `border-2 ${getStatusColor(formData.statusPagamento)}` : ""}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago" className="bg-green-100 text-green-800 hover:bg-green-200">Pago</SelectItem>
                    <SelectItem value="pendente" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</SelectItem>
                    <SelectItem value="parcelado" className="bg-red-100 text-red-800 hover:bg-red-200">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.statusPagamento && (
                  <div className={`mt-2 px-3 py-1 rounded-md text-sm flex items-center ${getStatusColor(formData.statusPagamento)}`}>
                    <span className={`h-3 w-3 rounded-full mr-2 ${
                      formData.statusPagamento === 'pago' ? 'bg-white' : 
                      formData.statusPagamento === 'pendente' ? 'bg-white' : 'bg-white'
                    }`}></span>
                    <span className="capitalize">{formData.statusPagamento}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input 
                  id="destino" 
                  placeholder="Destino do cliente" 
                  value={formData.destino}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input 
                  id="ano" 
                  placeholder="Ano específico" 
                  value={formData.ano}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicacao">Indicação</Label>
                <Textarea 
                  id="indicacao" 
                  placeholder="Informações adicionais e indicações..." 
                  className="min-h-[100px]"
                  value={formData.indicacao}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#2196F3] hover:bg-[#1976D2]"
              onClick={handleSalvarAtendimento}
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
