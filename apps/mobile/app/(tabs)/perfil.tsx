import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { setAuthToken } from '../../services/api';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { ActionButton } from '../../components/ActionButton';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function PerfilScreen() {
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const isDesktop = bp === 'desktop';

  function handleLogout() {
    setAuthToken(null);
    logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        <View style={[styles.avatar, { backgroundColor: colors.primary }, isDesktop && styles.avatarDesktop]}>
          <Text style={[styles.avatarText, isDesktop && styles.avatarTextDesktop]}>
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>

        <Text style={[styles.email, { color: colors.text }, isDesktop && styles.emailDesktop]}>
          {user?.email ?? 'Usuário Anônimo'}
        </Text>

        {/* Theme Preference Box */}
        <View style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.themeTitle, { color: colors.text }]}>Aparência do Aplicativo</Text>
          <Text style={[styles.themeSubtitle, { color: colors.textMuted }]}>
            Escolha o tema de sua preferência
          </Text>
          
          <View style={styles.themeSelectorRow}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'dark' ? colors.primaryLight : colors.surfaceAlt,
                  borderColor: mode === 'dark' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setMode('dark')}
              activeOpacity={0.7}
            >
              <Text style={styles.themeOptionIcon}>🌙</Text>
              <Text style={[styles.themeOptionText, { color: colors.text }]}>Escuro (Padrão)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'light' ? colors.primaryLight : colors.surfaceAlt,
                  borderColor: mode === 'light' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setMode('light')}
              activeOpacity={0.7}
            >
              <Text style={styles.themeOptionIcon}>☀️</Text>
              <Text style={[styles.themeOptionText, { color: colors.text }]}>Claro</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={isDesktop ? styles.buttonRow : undefined}>
          <ActionButton title="Consultar Candidatos" onPress={() => router.push('/(tabs)/matching')} />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          <ActionButton title="📖 Manual do Usuário" onPress={() => router.push('/manual')} variant="secondary" />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          <ActionButton title="Observatório de Mandatos" onPress={() => router.push('/observatorio')} variant="secondary" />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          <ActionButton title="Nota de Transparência Pública" onPress={() => router.push('/transparencia')} variant="secondary" />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          <ActionButton title="Anúncios Éticos & Media Kit" onPress={() => router.push('/media-kit')} variant="secondary" />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          <ActionButton title="API Pública de Dados (Tiered)" onPress={() => router.push('/api-publico')} variant="secondary" />
          <View style={{ height: isDesktop ? 0 : Spacing.md }} />
          {user && <ActionButton title="Sair" onPress={handleLogout} variant="danger" />}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  inner: { padding: Spacing.xl, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.base,
  },
  avatarDesktop: { width: 120, height: 120, borderRadius: 60 },
  avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' },
  avatarTextDesktop: { fontSize: 48 },
  email: { fontSize: FontSize.xl, marginBottom: Spacing.xl },
  emailDesktop: { fontSize: FontSize.xxl, marginBottom: 30 },
  themeCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xxl,
  },
  themeTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.xs },
  themeSubtitle: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  themeSelectorRow: { flexDirection: 'row', gap: Spacing.md },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  themeOptionIcon: { fontSize: FontSize.lg },
  themeOptionText: { fontSize: FontSize.sm, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: Spacing.base, width: '100%', maxWidth: 400 },
});
