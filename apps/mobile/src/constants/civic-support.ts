/**
 * Constantes Oficiais para Apoio Civico e Financiamento Coletivo
 * Plataforma Eleicoes Progressistas v2.2.4
 *
 * FONTE UNICA DA CHAVE PIX (Regra de Ouro 1):
 * - PIX_KEY: formato E.164 (+5521971943298) para o payload EMVCo / BACEN
 * - PIX_KEY_DISPLAY: formato legivel ((21) 97194-3298) para exibicao na UI e copia
 */

export const PIX_KEY_TYPE = 'CELULAR';
export const PIX_KEY = '+5521971943298';        // formato E.164 obrigatorio no payload EMVCo/BACEN
export const PIX_KEY_DISPLAY = '(21) 97194-3298'; // formato humano para UI e botao copiar
export const PIX_AMOUNT = 3.0;

export const PIX_BENEFICIARY_NAME = 'Fernando Goncalves';
export const PIX_CITY = 'Rio de Janeiro';
export const PIX_TXID = '***';

// Aliases para retrocompatibilidade
export const OFFICIAL_PIX_KEY = PIX_KEY_DISPLAY;
export const OFFICIAL_PIX_KEY_PHONE = PIX_KEY;
export const OFFICIAL_BENEFICIARY_NAME = PIX_BENEFICIARY_NAME;
export const OFFICIAL_CITY = PIX_CITY;
