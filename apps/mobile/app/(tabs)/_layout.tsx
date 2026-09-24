import { Tabs } from 'expo-router';
import { View, Text, Platform, TouchableOpacity, Linking } from 'react-native';
import { useBreakpoint, useMaxContentWidth } from '../../utils/responsive';
import { useThemeColors, Spacing } from '../../utils/theme';
import { ThemeToggle } from '../../components/ThemeToggle';
import { FeedbackFab } from '../../components/FeedbackFab';
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

        <FeedbackFab />
      </View>
    </View>
  );
}

