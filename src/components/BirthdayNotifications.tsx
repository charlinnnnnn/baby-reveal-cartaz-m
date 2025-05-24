
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
      const birthdaysToday = checkBirthdays();
      
      if (birthdaysToday.length > 0) {
        birthdaysToday.forEach(person => {
          const birthDate = new Date(person.dataNascimento);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          
          toast.success(
            `🎉 Hoje é aniversário de ${person.nome}! ${age} anos`,
            {
              duration: 10000,
              icon: <Cake className="h-5 w-5" />,
              description: `Não esqueça de parabenizar!`
            }
          );
        });
      }
    }
  }, [checkOnMount, checkBirthdays]);

  return null;
};

export default BirthdayNotifications;
