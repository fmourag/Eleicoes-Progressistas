import React, { useId } from 'react';
import { Platform, View, useColorScheme } from 'react-native';
import * as RNSvg from 'react-native-svg';

interface CivicLogoProps {
  width?: number | string;
  height?: number;
  theme?: 'light' | 'dark' | 'auto';
  showShadow?: boolean;
}

/**
 * CivicLogo - Logotipo Oficial Completo de "Eleições Progressistas"
 * Proporção original: 960 x 260
 */
export function CivicLogo({
  width = '100%',
  height,
  theme = 'auto',
  showShadow = true,
}: CivicLogoProps) {
  const systemScheme = useColorScheme();
  const isDark = theme === 'auto' ? systemScheme === 'dark' : theme === 'dark';

  const reactId = useId();
  const safeId = reactId.replace(/[^a-zA-Z0-9]/g, '_');
  const carmimId = `logoCarmim_${safeId}`;
  const emeraldId = `logoEmerald_${safeId}`;
  const goldId = `logoGold_${safeId}`;
  const shadowId = `logoShadow_${safeId}`;

  // Theme-aware colors for text and dividers
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const sloganDark = isDark ? '#F1F5F9' : '#0F172A';
  const sloganMuted = isDark ? '#94A3B8' : '#475569';
  const dividerColor = isDark ? '#334155' : '#E2E8F0';
  const subtextColor = isDark ? '#64748B' : '#94A3B8';
  const badgeRedBg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2';
  const badgeRedBorder = isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5';
  const badgeRedText = isDark ? '#FCA5A5' : '#991B1B';
  const badgeGreenBg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5';
  const badgeGreenBorder = isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0';
  const badgeGreenText = isDark ? '#6EE7B7' : '#065F46';

  if (Platform.OS === 'web') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 960 260"
        width={typeof width === 'number' ? `${width}px` : width}
        height={height ? `${height}px` : undefined}
        style={{
          maxWidth: '100%',
          height: height || 'auto',
          display: 'block',
          aspectRatio: '960 / 260',
        }}
      >
        <defs>
          <linearGradient id={carmimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E53E3E" />
            <stop offset="100%" stopColor="#9B2C2C" />
          </linearGradient>
          <linearGradient id={emeraldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          {showShadow && (
            <filter id={shadowId} x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#9B2C2C" floodOpacity="0.22" />
            </filter>
          )}
        </defs>

        {/* Fundo transparente */}
        <rect width="960" height="260" fill="none" />

        {/* === BLOCO DO ÍCONE / EMBLEMA CÍVICO (Esquerda) === */}
        <g transform="translate(24, 25)">
          {/* Squircle Carmim */}
          <rect
            x="0"
            y="0"
            width="210"
            height="210"
            rx="48"
            fill={`url(#${carmimId})`}
            filter={showShadow ? `url(#${shadowId})` : undefined}
          />
          {/* Borda sutil de realce interno */}
          <rect
            x="0"
            y="0"
            width="210"
            height="210"
            rx="48"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.2"
            strokeWidth="2.5"
          />

          {/* Símbolo Urna / Cédula / Estrela / Checagem */}
          <g transform="translate(105, 95)">
            {/* Cédula / Urna em Perspectiva Dinâmica */}
            <path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fillOpacity="0.96" />
            {/* Fenda central / Raio Carmim */}
            <path d="M-21,28 L0,-22 L21,28 Z" fill={`url(#${carmimId})`} />
            {/* Estrela Guia / Farol Democrático */}
            <path
              d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z"
              fill={`url(#${goldId})`}
            />
            {/* Checkmark / Ficha Limpa Esmeralda */}
            <path
              d="M-32,42 L-8,64 L38,18"
              fill="none"
              stroke={`url(#${emeraldId})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Divisória Elegante Sutil */}
        <line x1="270" y1="48" x2="270" y2="212" stroke={dividerColor} strokeWidth="2" strokeLinecap="round" />

        {/* === BLOCO TIPOGRÁFICO HORIZONTAL (Direita) === */}
        <g transform="translate(305, 0)">
          {/* Badge Cívico 2026 / Ficha Limpa */}
          <g transform="translate(0, 48)">
            <rect x="0" y="0" width="168" height="28" rx="14" fill={badgeRedBg} stroke={badgeRedBorder} strokeWidth="1" />
            <circle cx="14" cy="14" r="4.5" fill="#DC2626" />
            <text
              x="26"
              y="18.5"
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              fontWeight="700"
              fontSize="11.5"
              fill={badgeRedText}
              letterSpacing="1"
            >
              ELEIÇÕES 2026
            </text>

            <rect x="178" y="0" width="138" height="28" rx="14" fill={badgeGreenBg} stroke={badgeGreenBorder} strokeWidth="1" />
            <circle cx="192" cy="14" r="4.5" fill="#059669" />
            <text
              x="204"
              y="18.5"
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              fontWeight="700"
              fontSize="11.5"
              fill={badgeGreenText}
              letterSpacing="0.5"
            >
              FICHA LIMPA
            </text>
          </g>

          {/* Nome da Marca: ELEIÇÕES PROGRESSISTAS */}
          <text
            x="0"
            y="132"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            fontWeight="900"
            fontSize="44"
            fill={textColor}
            letterSpacing="-0.5"
          >
            Eleições <tspan fill="#C53030">Progressistas</tspan>
          </text>

          {/* Slogan Oficial */}
          <g transform="translate(0, 172)">
            <circle cx="8" cy="-6" r="4" fill="#059669" />
            <text
              x="24"
              y="0"
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              fontWeight="600"
              fontSize="21"
              fill={sloganMuted}
              letterSpacing="0.2"
            >
              Cheque o passado.{' '}
              <tspan fontWeight="700" fill={sloganDark}>
                Escolha o futuro.
              </tspan>
            </text>
          </g>

          {/* Linha de credibilidade: Código Aberto e Independente */}
          <text
            x="0"
            y="208"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            fontWeight="500"
            fontSize="12"
            fill={subtextColor}
            letterSpacing="1.2"
          >
            TECNOLOGIA CÍVICA AUDITÁVEL • 100% INDEPENDENTE
          </text>
        </g>
      </svg>
    );
  }

  // Native Svg
  const Svg = (RNSvg.Svg || (RNSvg as any).default || RNSvg) as any;
  const Rect = RNSvg.Rect as any;
  const G = RNSvg.G as any;
  const Path = RNSvg.Path as any;
  const Defs = RNSvg.Defs as any;
  const Line = RNSvg.Line as any;
  const Circle = RNSvg.Circle as any;
  const SvgText = RNSvg.Text as any;
  const TSpan = RNSvg.TSpan as any;
  const LinearGradient = RNSvg.LinearGradient as any;
  const Stop = RNSvg.Stop as any;

  return (
    <View style={{ width: width as any, height: height || 120 }}>
      <Svg width="100%" height="100%" viewBox="0 0 960 260">
        <Defs>
          <LinearGradient id={carmimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E53E3E" />
            <Stop offset="100%" stopColor="#9B2C2C" />
          </LinearGradient>
          <LinearGradient id={emeraldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
          <LinearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FCD34D" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
        </Defs>

        <G transform="translate(24, 25)">
          <Rect x="0" y="0" width="210" height="210" rx="48" fill={`url(#${carmimId})`} />
          <Rect x="0" y="0" width="210" height="210" rx="48" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2.5" />
          <G transform="translate(105, 95)">
            <Path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fillOpacity="0.96" />
            <Path d="M-21,28 L0,-22 L21,28 Z" fill={`url(#${carmimId})`} />
            <Path d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z" fill={`url(#${goldId})`} />
            <Path d="M-32,42 L-8,64 L38,18" fill="none" stroke={`url(#${emeraldId})`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </G>
        </G>

        <Line x1="270" y1="48" x2="270" y2="212" stroke={dividerColor} strokeWidth="2" strokeLinecap="round" />

        <G transform="translate(305, 0)">
          <G transform="translate(0, 48)">
            <Rect x="0" y="0" width="168" height="28" rx="14" fill={badgeRedBg} stroke={badgeRedBorder} strokeWidth="1" />
            <Circle cx="14" cy="14" r="4.5" fill="#DC2626" />
            <SvgText x="26" y="18.5" fontWeight="700" fontSize="11.5" fill={badgeRedText} letterSpacing="1">
              ELEIÇÕES 2026
            </SvgText>

            <Rect x="178" y="0" width="138" height="28" rx="14" fill={badgeGreenBg} stroke={badgeGreenBorder} strokeWidth="1" />
            <Circle cx="192" cy="14" r="4.5" fill="#059669" />
            <SvgText x="204" y="18.5" fontWeight="700" fontSize="11.5" fill={badgeGreenText} letterSpacing="0.5">
              FICHA LIMPA
            </SvgText>
          </G>

          <SvgText x="0" y="132" fontWeight="900" fontSize="44" fill={textColor} letterSpacing="-0.5">
            Eleições <TSpan fill="#C53030">Progressistas</TSpan>
          </SvgText>

          <G transform="translate(0, 172)">
            <Circle cx="8" cy="-6" r="4" fill="#059669" />
            <SvgText x="24" y="0" fontWeight="600" fontSize="21" fill={sloganMuted} letterSpacing="0.2">
              Cheque o passado.{' '}
              <TSpan fontWeight="700" fill={sloganDark}>
                Escolha o futuro.
              </TSpan>
            </SvgText>
          </G>

          <SvgText x="0" y="208" fontWeight="500" fontSize="12" fill={subtextColor} letterSpacing="1.2">
            TECNOLOGIA CÍVICA AUDITÁVEL • 100% INDEPENDENTE
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
