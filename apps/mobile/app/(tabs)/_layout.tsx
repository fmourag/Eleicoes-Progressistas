import { Tabs } from 'expo-router';
import { View, Text, Platform, TouchableOpacity, Linking } from 'react-native';
import { useBreakpoint, useMaxContentWidth } from '../../utils/responsive';
import { useThemeColors, Spacing } from '../../utils/theme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { API_URL } from '../../services/api';

export default function TabsLayout() {
  const bp = useBreakpoint();
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const isDesktop = bp === 'desktop';

  const containerStyle = maxW ? { maxWidth: maxW, alignSelf: 'center' as const, width: '100%' as const } : {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[{ flex: 1 }, containerStyle]}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border },
            headerTitleStyle: { color: colors.text },
            headerRight: () => (
              <View style={{ marginRight: Spacing.base }}>
                <ThemeToggle />
              </View>
            ),
            tabBarLabelStyle: {
              fontSize: isDesktop ? 14 : 11,
              fontWeight: '700',
              marginTop: 1,
            },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: Platform.OS === 'ios' ? 84 : 60,
              paddingBottom: Platform.OS === 'ios' ? 24 : 6,
              paddingTop: 6,
              ...(isDesktop ? { flexDirection: 'row', justifyContent: 'center', height: 60 } : {}),
            },
          }}
        >
          <Tabs.Screen
            name="candidatos"
            options={{
              title: 'Candidatos',
              headerShown: false,
              tabBarLabel: 'Candidatos',
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏛️</Text>,
            }}
          />
          <Tabs.Screen
            name="matching"
            options={{
              title: 'Prioridades',
              headerShown: false,
              tabBarLabel: 'Prioridades',
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎯</Text>,
            }}
          />
          <Tabs.Screen
            name="cola"
            options={{
              title: 'Minha Cola',
              headerShown: false,
              tabBarLabel: 'Minha Cola',
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>📝</Text>,
            }}
          />
          <Tabs.Screen
            name="raio-x"
            options={{
              title: 'Raio-X',
              headerShown: false,
              tabBarLabel: 'Raio-X',
              tabBarIcon: () => <Text style={{ fontSize: 18 }}>🔍</Text>,
            }}
          />
          <Tabs.Screen name="perfil" options={{ href: null }} />
        </Tabs>

        {/* Botão Flutuante de Feedback dos Testadores (posicionado acima da barra de cola para não obstruir ações) */}
        <TouchableOpacity
          onPress={() => Linking.openURL(`${API_URL}/feedback`).catch(() => {})}
          activeOpacity={0.85}
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 160 : 145,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#1B5E20',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            zIndex: 999,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
          accessibilityLabel="Enviar feedback de teste"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 22, color: '#fff' }}>💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

