import HomeScreen from './index';

export default function NotFoundScreen() {
  // Renderiza a tela inicial diretamente em caso de rota desconhecida, sem disparar navegação prematura antes do Root Layout
  return <HomeScreen />;
}

