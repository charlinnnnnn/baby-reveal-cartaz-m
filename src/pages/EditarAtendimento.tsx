
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import useUserDataService from "@/services/userDataService";

const EditarAtendimento = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getAtendimentos, saveAtendimentos } = useUserDataService();

  const [formData, setFormData] = useState({
    nome: '',
    dataAtendimento: '',
    tipoServico: '',
    valor: '',
    statusPagamento: 'pendente',
    dataNascimento: '',
    signo: '',
    destino: '',
    ano: '',
    detalhes: '',
    tratamento: '',
    indicacao: '',
    atencaoFlag: false,
    atencaoNota: ''
  });

  useEffect(() => {
    // Carregar dados do atendimento a ser editado
    const atendimentos = getAtendimentos();
    const atendimento = atendimentos.find(a => a.id === id);
    
    if (atendimento) {
      setFormData({
        nome: atendimento.nome || '',
        dataAtendimento: atendimento.dataAtendimento || '',
        tipoServico: atendimento.tipoServico || '',
        valor: atendimento.valor || '',
        statusPagamento: atendimento.statusPagamento || 'pendente',
        dataNascimento: atendimento.dataNascimento || '',
        signo: atendimento.signo || '',
        destino: atendimento.destino || '',
        ano: atendimento.ano || '',
        detalhes: atendimento.detalhes || '',
        tratamento: atendimento.tratamento || '',
        indicacao: atendimento.indicacao || '',
        atencaoFlag: atendimento.atencaoFlag || false,
        atencaoNota: atendimento.atencaoNota || ''
      });
    } else {
      toast({
        title: "Atendimento não encontrado",
        description: "O atendimento que você está tentando editar não foi encontrado.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [id, getAtendimentos, navigate, toast]);

  const calcularSigno = (dataNascimento: string) => {
    if (!dataNascimento) return '';
    
    const date = new Date(dataNascimento);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricórnio";
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
    else return "Peixes";
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calcular signo quando data de nascimento mudar
    if (field === 'dataNascimento') {
      const signo = calcularSigno(value);
      setFormData(prev => ({
        ...prev,
        dataNascimento: value,
        signo: signo
      }));
    }
  };

  const handleSalvar = () => {
    // Validação básica
    if (!formData.nome || !formData.dataAtendimento || !formData.tipoServico) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome, data e tipo de serviço.",
        variant: "destructive",
      });
      return;
    }

    // Buscar atendimentos atuais
    const atendimentos = getAtendimentos();
    
    // Atualizar o atendimento específico
    const atendimentosAtualizados = atendimentos.map(atendimento => 
      atendimento.id === id 
        ? { ...atendimento, ...formData }
        : atendimento
    );

    // Salvar atendimentos atualizados
    saveAtendimentos(atendimentosAtualizados);

    toast({
      title: "Atendimento atualizado",
      description: "O atendimento foi atualizado com sucesso.",
      variant: "default",
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 border-b border-blue-100">
        <div className="container mx-auto flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Logo height={40} width={40} />
            <h1 className="text-2xl font-bold text-[#0EA5E9]">
              Editar Atendimento
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <CardTitle className="text-[#0EA5E9]">Editar Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="dataAtendimento">Data do Atendimento *</Label>
                  <Input
                    id="dataAtendimento"
                    type="date"
                    value={formData.dataAtendimento}
                    onChange={(e) => handleInputChange('dataAtendimento', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                  <Select value={formData.tipoServico} onValueChange={(value) => handleInputChange('tipoServico', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta-tarot">Consulta de Tarot</SelectItem>
                      <SelectItem value="consulta-baralho-cigano">Consulta Baralho Cigano</SelectItem>
                      <SelectItem value="consulta-runas">Consulta de Runas</SelectItem>
                      <SelectItem value="mapa-astral">Mapa Astral</SelectItem>
                      <SelectItem value="numerologia">Numerologia</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="statusPagamento">Status do Pagamento</Label>
                  <Select value={formData.statusPagamento} onValueChange={(value) => handleInputChange('statusPagamento', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="signo">Signo</Label>
                  <Input
                    id="signo"
                    value={formData.signo}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Calculado automaticamente"
                  />
                </div>

                <div>
                  <Label htmlFor="destino">Destino</Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => handleInputChange('destino', e.target.value)}
                    placeholder="Número do destino"
                  />
                </div>

                <div>
                  <Label htmlFor="ano">Ano Pessoal</Label>
                  <Input
                    id="ano"
                    value={formData.ano}
                    onChange={(e) => handleInputChange('ano', e.target.value)}
                    placeholder="Ano pessoal"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="atencaoFlag">Marcar com Atenção</Label>
                  <Switch
                    id="atencaoFlag"
                    checked={formData.atencaoFlag}
                    onCheckedChange={(checked) => handleInputChange('atencaoFlag', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Campos de texto grandes */}
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="detalhes">Detalhes da Consulta</Label>
                <Textarea
                  id="detalhes"
                  value={formData.detalhes}
                  onChange={(e) => handleInputChange('detalhes', e.target.value)}
                  placeholder="Descreva os detalhes da consulta..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="tratamento">Tratamento Sugerido</Label>
                <Textarea
                  id="tratamento"
                  value={formData.tratamento}
                  onChange={(e) => handleInputChange('tratamento', e.target.value)}
                  placeholder="Descreva o tratamento sugerido..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="indicacao">Como nos conheceu</Label>
                <Textarea
                  id="indicacao"
                  value={formData.indicacao}
                  onChange={(e) => handleInputChange('indicacao', e.target.value)}
                  placeholder="Como o cliente nos conheceu..."
                />
              </div>

              {formData.atencaoFlag && (
                <div>
                  <Label htmlFor="atencaoNota">Nota de Atenção</Label>
                  <Textarea
                    id="atencaoNota"
                    value={formData.atencaoNota}
                    onChange={(e) => handleInputChange('atencaoNota', e.target.value)}
                    placeholder="Descreva o motivo da atenção especial..."
                  />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvar}
                className="bg-[#0EA5E9] hover:bg-[#0284C7]"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditarAtendimento;
