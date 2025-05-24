
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Cake } from 'lucide-react';

interface BirthdayCheckerProps {
  dataNascimento: string;
  nome: string;
}

const BirthdayChecker: React.FC<BirthdayCheckerProps> = ({ dataNascimento, nome }) => {
  useEffect(() => {
    if (dataNascimento && nome) {
      console.log(`Verificando aniversário para ${nome}, data: ${dataNascimento}`);
      
      try {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        
        // Verificar se a data é válida
        if (isNaN(nascimento.getTime())) {
          console.log('Data de nascimento inválida');
          return;
        }
        
        const isSameDay = nascimento.getDate() === hoje.getDate();
        const isSameMonth = nascimento.getMonth() === hoje.getMonth();
        
        console.log(`Data hoje: ${hoje.toLocaleDateString('pt-BR')}, Data nascimento: ${nascimento.toLocaleDateString('pt-BR')}`);
        console.log(`Mesmo dia: ${isSameDay}, Mesmo mês: ${isSameMonth}`);
        
        if (isSameDay && isSameMonth) {
          let idade = hoje.getFullYear() - nascimento.getFullYear();
          
          // Ajustar idade se o aniversário ainda não passou este ano
          const monthDiff = hoje.getMonth() - nascimento.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
          }
          
          console.log(`É aniversário! ${nome} faz ${idade} anos hoje`);
          
          toast.success(
            `🎉 Hoje é aniversário de ${nome}! ${idade} anos`,
            {
              duration: 8000,
              icon: <Cake className="h-5 w-5" />,
              description: `Não esqueça de parabenizar!`
            }
          );
        }
      } catch (error) {
        console.error('Erro ao verificar aniversário:', error);
      }
    }
  }, [dataNascimento, nome]);

  return null;
};

export default BirthdayChecker;
