import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}

export function useIsTablet(): boolean {
  return useBreakpoint() === 'tablet';
}

export function useIsDesktop(): boolean {
  return useBreakpoint() === 'desktop';
}

export function useResponsivePadding() {
  const bp = useBreakpoint();
  if (bp === 'desktop') return 48;
  if (bp === 'tablet') return 32;
  return 20;
}

export function useMaxContentWidth(): number | undefined {
  const bp = useBreakpoint();
  if (bp === 'mobile') return undefined;
  if (bp === 'tablet') return 600;
  return 720;
}

export function rsp(
  value: { mobile: number; tablet?: number; desktop?: number },
  breakpoint: Breakpoint,
): number {
  if (breakpoint === 'desktop' && value.desktop !== undefined) return value.desktop;
  if ((breakpoint === 'tablet' || breakpoint === 'desktop') && value.tablet !== undefined) return value.tablet;
  return value.mobile;
}
