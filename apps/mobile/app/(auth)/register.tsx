import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { authApi, geoApi, setAuthToken } from '../../services/api';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { ActionButton } from '../../components/ActionButton';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cep, setCep] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  async function handleCepBlur() {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const result = await geoApi.resolveCep(cleanCep);
      setMunicipality(result.municipality);
      setState(result.state);
    } catch {
      Alert.alert('Erro', 'CEP não encontrado');
    }
  }

  async function handleRegister() {
    if (!email || !password || !cep || !municipality) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.register({ email, password, cep, municipality, state });
      setToken(result.access_token);
      setUser(result.user);
      setAuthToken(result.access_token);
      router.replace('/(tabs)/matching');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>

      <Text style={[styles.title, { color: colors.primary }, bp === 'desktop' && styles.titleDesktop]}>Eleições Progressistas</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Crie sua conta</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Email"
        placeholderTextColor={colors.textFaint}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Senha (mín. 8 caracteres)"
        placeholderTextColor={colors.textFaint}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="CEP"
        placeholderTextColor={colors.textFaint}
        value={cep}
        onChangeText={setCep}
        keyboardType="numeric"
        maxLength={9}
        onBlur={handleCepBlur}
      />

      {municipality ? <Text style={[styles.location, { color: colors.primary }]}>{municipality} — {state}</Text> : null}

      <ActionButton title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleRegister} loading={loading} />

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, { color: colors.primary }]}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'web') {
    return <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.center}>{content}</ScrollView>;
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flexGrow: 1, justifyContent: 'center' },
  inner: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  topBar: { alignItems: 'flex-end', marginBottom: Spacing.md },
  title: { fontSize: FontSize.display, fontWeight: 'bold', textAlign: 'center', marginBottom: Spacing.xs },
  titleDesktop: { fontSize: 36 },
  subtitle: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing.xxl },
  input: {
    borderWidth: 1, borderRadius: Radius.md,
    padding: 14, fontSize: FontSize.xl, marginBottom: Spacing.md,
  },
  location: { textAlign: 'center', fontWeight: '600', marginBottom: Spacing.md },
  link: { textAlign: 'center', marginTop: Spacing.lg, fontSize: FontSize.xl },
});
