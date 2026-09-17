import QRCode from 'qrcode';
import {
  PIX_KEY,
  PIX_BENEFICIARY_NAME,
  PIX_CITY,
  PIX_TXID,
  PIX_AMOUNT,
} from '../constants/civic-support';

/**
 * Normaliza uma chave PIX para o formato exigido pelo BACEN.
 * Para telefones celulares, o BACEN e a especificacao EMVCo exigem o formato E.164 com sinal de adicao (+55...).
 */
export function normalizePixKey(key: string): string {
  if (!key) return PIX_KEY;
  const trimmed = key.trim();

  // Se ja esta no formato E.164 (+55...)
  if (trimmed.startsWith('+55')) {
    const digits = trimmed.replace(/\D/g, '');
    return '+' + digits;
  }

  // Se contem arroba (e-mail)
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  // Se e UUID / chave aleatoria
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');

  // Se comecar com 55 e tiver 12 ou 13 digitos
  if (digits.length >= 12 && digits.startsWith('55')) {
    return '+' + digits;
  }

  // Telefone celular ou fixo brasileiro (10 ou 11 digitos, ex: 21971943298)
  if (digits.length === 10 || digits.length === 11) {
    return '+55' + digits;
  }

  // Chave CPF / CNPJ (apenas digitos)
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }

  return trimmed;
}

/**
 * Calculo de redundancia ciclica CRC16 (polinomio 0x1021, valor inicial 0xFFFF)
 * conforme a especificacao EMVCo / BACEN para BR Code.
 */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formata um campo no formato TLV (Tag-Length-Value)
 */
export function formatTlv(id: string, value: string): string {
  const len = encodeURI(value).split(/%..|./).length - 1;
  return id + len.toString().padStart(2, '0') + value;
}

export interface PixPayloadOptions {
  key?: string;
  name?: string;
  city?: string;
  amount?: number | string;
  txId?: string;
}

/**
 * Gera a string BR Code / EMVCo estatica oficial para o PIX de apoio civico.
 * Garante que a chave celular seja emitida no formato E.164 com Tag 01 de tamanho 14 ('0114+5521971943298').
 */
export function generatePixPayload(options: PixPayloadOptions = {}): string {
  const {
    key = PIX_KEY,
    name = PIX_BENEFICIARY_NAME,
    city = PIX_CITY,
    amount,
    txId = PIX_TXID,
  } = options;

  const normalizedKey = normalizePixKey(key);
  const gui = formatTlv('00', 'br.gov.bcb.pix');
  const pixKeyField = formatTlv('01', normalizedKey);
  const merchantInfo = formatTlv('26', gui + pixKeyField);

  // Trata formatacao do valor
  let parsedAmount: number | null = null;
  if (typeof amount === 'number' && amount > 0) {
    parsedAmount = amount;
  } else if (typeof amount === 'string' && amount.trim() !== '') {
    const floatVal = parseFloat(amount);
    if (!isNaN(floatVal) && floatVal > 0) {
      parsedAmount = floatVal;
    }
  }

  let raw =
    formatTlv('00', '01') + // Tag 00: Payload Format Indicator
    merchantInfo + // Tag 26: Merchant Account Information (GUI + Chave)
    formatTlv('52', '0000') + // Tag 52: Merchant Category Code
    formatTlv('53', '986') + // Tag 53: Moeda (BRL)
    (parsedAmount !== null ? formatTlv('54', parsedAmount.toFixed(2)) : '') + // Tag 54: Valor
    formatTlv('58', 'BR') + // Tag 58: Codigo do Pais
    formatTlv('59', name.slice(0, 25)) + // Tag 59: Nome do Beneficiario
    formatTlv('60', city.slice(0, 15)) + // Tag 60: Cidade do Beneficiario
    formatTlv('62', formatTlv('05', txId)); // Tag 62: Additional Data Field (txid)

  raw += '6304'; // Tag 63: CRC16 com tamanho 04
  const checksum = crc16(raw);
  return raw + checksum;
}

/**
 * Gera o DataURL em base64 com a imagem do QR Code BR Code
 */
export async function generatePixQrDataUrl(
  payloadOrAmount?: string | number,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  let payload: string;

  if (typeof payloadOrAmount === 'string' && payloadOrAmount.startsWith('000201')) {
    payload = payloadOrAmount;
  } else {
    payload = generatePixPayload({
      amount: payloadOrAmount !== undefined ? payloadOrAmount : PIX_AMOUNT,
    });
  }

  return QRCode.toDataURL(payload, {
    width: options.width ?? 220,
    margin: options.margin ?? 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}
