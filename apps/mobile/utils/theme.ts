import { useThemeStore } from '../stores/theme.store';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  primaryContainer: string;
  onPrimary: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  tertiaryLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textFaintest: string;
  success: string;
  successBg: string;
  successText: string;
  error: string;
  errorBg: string;
  errorText: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  neutral: string;
  neutralBorder: string;
  white: string;
}

export const DarkColors: ColorPalette = {
  primary: '#E11D48',
  primaryLight: '#4C0519',
  primaryBorder: '#BE123C',
  primaryContainer: '#BE123C',
  onPrimary: '#FFFFFF',
  secondary: '#D97706',
  secondaryContainer: '#B45309',
  onSecondaryContainer: '#FEF3C7',
  tertiary: '#10B981',
  tertiaryContainer: '#064E3B',
  tertiaryLight: '#022C22',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  surfaceContainerLow: '#0B1120',
  surfaceContainerHigh: '#1E293B',
  surfaceContainerHighest: '#334155',
  border: '#334155',
  borderLight: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  textFaintest: '#475569',
  success: '#10B981',
  successBg: '#064E3B',
  successText: '#6EE7B7',
  error: '#F87171',
  errorBg: '#7F1D1D',
  errorText: '#FECACA',
  warning: '#F59E0B',
  warningBg: '#78350F',
  warningBorder: '#D97706',
  neutral: '#1E293B',
  neutralBorder: '#334155',
  white: '#FFFFFF',
};

export const LightColors: ColorPalette = {
  primary: '#A2141B',
  primaryLight: '#FFDAD6',
  primaryBorder: '#E2BEBB',
  primaryContainer: '#C53030',
  onPrimary: '#FFFFFF',
  secondary: '#7D5700',
  secondaryContainer: '#FFC250',
  onSecondaryContainer: '#725000',
  tertiary: '#005E3F',
  tertiaryContainer: '#007952',
  tertiaryLight: '#E6F4EA',
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F3FF',
  surfaceContainerLow: '#FAF8FF',
  surfaceContainerHigh: '#E2E7FF',
  surfaceContainerHighest: '#DAE2FD',
  border: '#E2BEBB',
  borderLight: '#EAEDFF',
  text: '#131B2E',
  textSecondary: '#5A403E',
  textMuted: '#8E706D',
  textFaint: '#A89290',
  textFaintest: '#D2D9F4',
  success: '#007952',
  successBg: '#E6F4EA',
  successText: '#005E3F',
  error: '#BA1A1A',
  errorBg: '#FFDAD6',
  errorText: '#93000A',
  warning: '#D69E2E',
  warningBg: '#FFF8E1',
  warningBorder: '#FFC250',
  neutral: '#FFFFFF',
  neutralBorder: '#E2BEBB',
  white: '#FFFFFF',
};

export type ColorTokens = ColorPalette;

// Compatibilidade estática
export const Colors = DarkColors;

export function useThemeColors(): ColorTokens {
  const mode = useThemeStore((state) => state.mode);
  return mode === 'dark' ? DarkColors : LightColors;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  title: 22,
  hero: 24,
  display: 28,
} as const;
