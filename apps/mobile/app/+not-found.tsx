import { useEffect } from 'react';
import { router } from 'expo-router';
import HomeScreen from './index';

export default function NotFoundScreen() {
  useEffect(() => {
    // Redireciona suavemente para a tela principal caso seja acessada uma rota desconhecida
    router.replace('/');
  }, []);

  return <HomeScreen />;
}
