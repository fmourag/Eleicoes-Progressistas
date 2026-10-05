// Shim mínimo de expo-file-system para testes Node.
// documentDirectory nulo => AppStorage opera 100% em memória (suficiente p/ testes).
export const documentDirectory: string | null = null;
export async function getInfoAsync(): Promise<{ exists: false }> {
  return { exists: false };
}
export async function readAsStringAsync(): Promise<string> {
  return '';
}
export async function writeAsStringAsync(): Promise<void> {}
export async function deleteAsync(): Promise<void> {}
export default { documentDirectory, getInfoAsync, readAsStringAsync, writeAsStringAsync, deleteAsync };
