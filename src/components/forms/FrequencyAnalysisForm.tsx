
import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  clientName: z.string().min(1, "Nome é obrigatório"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  treatmentDays: z.number().int().min(1, "A duração deve ser pelo menos 1 dia"),
  beforeAnalysis: z.string().min(1, "Análise anterior é obrigatória"),
  afterAnalysis: z.string().default(""),
  recommendedTreatment: z.string().min(1, "Tratamento recomendado é obrigatória"),
  price: z.number().min(0, "Valor não pode ser negativo"),
  attention: z.boolean().default(false),
  counters: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Nome do contador é obrigatório"),
      endDate: z.date(),
    })
  ).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Counter {
  id: string;
  name: string;
  endDate: Date;
}

interface FrequencyAnalysisFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingAnalysis?: any;
}

const FrequencyAnalysisForm: React.FC<FrequencyAnalysisFormProps> = ({
  onSubmit,
  onCancel,
  editingAnalysis,
}) => {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  // Ensure we have a properly typed array of counters with all required properties
  const initialCounters: Counter[] = (editingAnalysis?.counters || []).map((counter: any) => ({
    id: counter.id || uuidv4(),
    name: counter.name || '',
    endDate: counter.endDate || new Date(),
  }));
  
  const [counters, setCounters] = useState<Counter[]>(initialCounters);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: editingAnalysis?.client.name || "",
      birthDate: editingAnalysis?.client.birthDate || undefined,
      startDate: editingAnalysis?.startDate || new Date(),
      treatmentDays: editingAnalysis?.treatmentDays || 10,
      beforeAnalysis: editingAnalysis?.beforeAnalysis || "",
      afterAnalysis: editingAnalysis?.afterAnalysis || "",
      recommendedTreatment: editingAnalysis?.recommendedTreatment || "",
      price: editingAnalysis?.price || 0,
      attention: editingAnalysis?.attention || false,
      counters: initialCounters,
    },
  });

  // Auto focus on first field when form opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstFieldRef.current) {
        firstFieldRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddCounter = () => {
    const newCounter: Counter = {
      id: uuidv4(),
      name: `Contador ${counters.length + 1}`,
      endDate: new Date(),
    };
    const updatedCounters = [...counters, newCounter];
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  };

  const handleRemoveCounter = (id: string) => {
    const updatedCounters = counters.filter((counter) => counter.id !== id);
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  };

  const handleUpdateCounter = (id: string, name: string, endDate: Date) => {
    const updatedCounters = counters.map((counter) =>
      counter.id === id ? { ...counter, name, endDate } : counter
    );
    setCounters(updatedCounters);
    form.setValue("counters", updatedCounters);
  };

  const handleSubmit = (data: FormValues) => {
    const newAnalysis = {
      id: editingAnalysis?.id || uuidv4(),
      client: {
        id: uuidv4(),
        name: data.clientName,
        birthDate: data.birthDate,
        zodiacSign: "",
      },
      startDate: data.startDate,
      treatmentDays: data.treatmentDays,
      beforeAnalysis: data.beforeAnalysis,
      afterAnalysis: data.afterAnalysis,
      recommendedTreatment: data.recommendedTreatment,
      price: data.price,
      attention: data.attention,
      counters: data.counters,
      completed: false,
      createdAt: editingAnalysis?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(newAnalysis);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 gap-6">
          {/* Client Name Field */}
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input 
                    ref={firstFieldRef}
                    placeholder="Nome completo" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birth Date Field */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Nascimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date Field */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Treatment Days Field */}
          <FormField
            control={form.control}
            name="treatmentDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração do Tratamento (dias)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Field */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attention Field */}
          <FormField
            control={form.control}
            name="attention"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Atenção</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="beforeAnalysis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Análise - Antes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva a situação antes do tratamento..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="afterAnalysis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Análise - Depois</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os resultados após o tratamento..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Recommended Treatment */}
        <FormField
          control={form.control}
          name="recommendedTreatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tratamento Recomendado</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o tratamento recomendado..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Counters Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Contadores</h3>
            <Button type="button" variant="outline" onClick={handleAddCounter}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contador
            </Button>
          </div>

          {counters.map((counter, index) => (
            <div key={counter.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contador {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCounter(counter.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do Contador</label>
                  <Input
                    value={counter.name}
                    onChange={(e) =>
                      handleUpdateCounter(counter.id, e.target.value, counter.endDate)
                    }
                    placeholder="Nome do contador"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Data Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {counter.endDate ? (
                          format(counter.endDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={counter.endDate}
                        onSelect={(date) =>
                          date && handleUpdateCounter(counter.id, counter.name, date)
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Análise</Button>
        </div>
      </form>
    </Form>
  );
};

export default FrequencyAnalysisForm;
