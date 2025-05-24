
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
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      
      const hojeString = `${hoje.getDate().toString().padStart(2, '0')}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`;
      const nascimentoString = `${nascimento.getDate().toString().padStart(2, '0')}-${(nascimento.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (hojeString === nascimentoString) {
        const idade = hoje.getFullYear() - nascimento.getFullYear();
        
        toast.success(
          `🎉 Hoje é aniversário de ${nome}! ${idade} anos`,
          {
            duration: 8000,
            icon: <Cake className="h-5 w-5" />,
            description: `Não esqueça de parabenizar!`
          }
        );
      }
    }
  }, [dataNascimento, nome]);

  return null;
};

export default BirthdayChecker;
