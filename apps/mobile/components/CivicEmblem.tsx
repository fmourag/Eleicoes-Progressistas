import React, { useId } from 'react';
import { Platform, View } from 'react-native';
import * as RNSvg from 'react-native-svg';

interface CivicEmblemProps {
  size?: number;
  showShadow?: boolean;
}

export function CivicEmblem({ size = 48, showShadow = true }: CivicEmblemProps) {
  const reactId = useId();
  const safeId = reactId.replace(/[^a-zA-Z0-9]/g, '_');
  const carmimId = `carmimGrad_${safeId}`;
  const emeraldId = `emeraldGrad_${safeId}`;
  const goldId = `goldGrad_${safeId}`;
  const shadowId = `softShadow_${safeId}`;

  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 210 210"
        style={{
          width: size,
          height: size,
          display: 'block',
          overflow: 'visible',
          flexShrink: 0,
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
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#9B2C2C" floodOpacity="0.22" />
            </filter>
          )}
        </defs>

        {/* Squircle Carmim Principal */}
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
      </svg>
    );
  }

  // Native (iOS/Android) fallback with react-native-svg
  const Svg = (RNSvg.Svg || (RNSvg as any).default || RNSvg) as any;
  const Rect = RNSvg.Rect as any;
  const G = RNSvg.G as any;
  const Path = RNSvg.Path as any;
  const Defs = RNSvg.Defs as any;
  const LinearGradient = RNSvg.LinearGradient as any;
  const Stop = RNSvg.Stop as any;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 210 210">
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

        <Rect x="0" y="0" width="210" height="210" rx="48" fill={`url(#${carmimId})`} />
        <Rect
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

        <G transform="translate(105, 95)">
          <Path d="M-42,28 L-16,-34 L16,-34 L42,28 Z" fill="#FFFFFF" fillOpacity="0.96" />
          <Path d="M-21,28 L0,-22 L21,28 Z" fill={`url(#${carmimId})`} />
          <Path
            d="M0,-48 L4.5,-38 L14.5,-37 L7,-30 L9,-20 L0,-25.5 L-9,-20 L-7,-30 L-14.5,-37 L-4.5,-38 Z"
            fill={`url(#${goldId})`}
          />
          <Path
            d="M-32,42 L-8,64 L38,18"
            fill="none"
            stroke={`url(#${emeraldId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
}
