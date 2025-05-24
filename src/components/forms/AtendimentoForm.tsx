
import React from "react";
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
import { Save, AlertTriangle } from "lucide-react";

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

interface AtendimentoFormProps {
  formData: AtendimentoData;
  onChange: (data: Partial<AtendimentoData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const AtendimentoForm: React.FC<AtendimentoFormProps> = ({
  formData,
  onChange,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const handleInputChange = (field: keyof AtendimentoData, value: string | boolean) => {
    onChange({ [field]: value });
  };

  const handleDataNascimentoChange = (value: string) => {
    onChange({ dataNascimento: value });
    
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
      
      onChange({ signo: signoCalculado });
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

  return (
    <Card className="border-[#C5A3E0] shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#2196F3]">
          {isEditing ? "Edição de Atendimento" : "Novo Atendimento"}
        </CardTitle>
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
                <AlertTriangle className={`mr-2 h-4 w-4 ${formData.atencaoFlag ? "text-red-500" : "text-gray-400"}`} />
                ATENÇÃO
              </Label>
              <Switch 
                checked={formData.atencaoFlag} 
                onCheckedChange={(checked) => handleInputChange('atencaoFlag', checked)} 
                className="data-[state=checked]:bg-red-500"
              />
            </div>
            <Input 
              id="atencaoNota" 
              placeholder="Pontos de atenção" 
              className={formData.atencaoFlag ? "border-red-500 bg-red-50" : ""}
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
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          className="bg-[#2196F3] hover:bg-[#1976D2]"
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? "Salvar Alterações" : "Salvar Atendimento"}
        </Button>
      </CardFooter>
    </Card>
  );
};
