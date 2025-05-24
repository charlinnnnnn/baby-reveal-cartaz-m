
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Cake } from 'lucide-react';
import useUserDataService from '@/services/userDataService';

interface BirthdayNotificationsProps {
  checkOnMount?: boolean;
}

const BirthdayNotifications: React.FC<BirthdayNotificationsProps> = ({ checkOnMount = true }) => {
  const { checkBirthdays } = useUserDataService();

  useEffect(() => {
    if (checkOnMount) {
      console.log('Verificando aniversários...');
      const birthdaysToday = checkBirthdays();
      console.log('Aniversários encontrados:', birthdaysToday);
      
      if (birthdaysToday.length > 0) {
        birthdaysToday.forEach(person => {
          const birthDate = new Date(person.dataNascimento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          
          // Ajustar idade se o aniversário ainda não passou este ano
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          console.log(`Exibindo notificação para ${person.nome}, ${age} anos`);
          
          toast.success(
            `🎉 Hoje é aniversário de ${person.nome}! ${age} anos`,
            {
              duration: 10000,
              icon: <Cake className="h-5 w-5" />,
              description: `Não esqueça de parabenizar!`
            }
          );
        });
      } else {
        console.log('Nenhum aniversário hoje');
      }
    }
  }, [checkOnMount, checkBirthdays]);

  return null;
};

export default BirthdayNotifications;
