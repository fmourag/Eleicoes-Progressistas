import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useBreakpoint, useMaxContentWidth } from '../../utils/responsive';
import { useThemeColors, FontSize, Spacing } from '../../utils/theme';
import { ThemeToggle } from '../../components/ThemeToggle';

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
            tabBarLabelStyle: { fontSize: isDesktop ? FontSize.xl : FontSize.md },
            tabBarIcon: () => null,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              ...(isDesktop ? { flexDirection: 'row', justifyContent: 'center', height: 56 } : {}),
            },
          }}
        >
          <Tabs.Screen
            name="candidatos"
            options={{
              title: 'Candidatos',
              headerShown: false,
              tabBarLabel: '🏛️ Candidatos',
            }}
          />
          <Tabs.Screen
            name="matching"
            options={{
              title: 'Prioridades',
              headerShown: false,
              tabBarLabel: '🎯 Prioridades',
            }}
          />
          <Tabs.Screen
            name="cola"
            options={{
              title: 'Minha Cola',
              headerShown: false,
              tabBarLabel: '📝 Minha Cola',
            }}
          />
          <Tabs.Screen
            name="raio-x"
            options={{
              title: 'Raio-X',
              headerShown: false,
              tabBarLabel: '🔍 Raio-X',
            }}
          />
          <Tabs.Screen name="perfil" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}
