// Shim mínimo de react-native para testes Node (scripts/test-election-night.ts).
// Apenas o que a cadeia de imports usa em ambiente sem Expo.
export const Platform = {
  OS: 'node' as const,
  select: <T,>(opts: { native?: T; default?: T; [k: string]: T | undefined }): T | undefined =>
    opts.native ?? opts.default,
};
export default { Platform };
