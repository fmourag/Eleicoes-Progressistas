import QRCode from 'qrcode';

export const OFFICIAL_PIX_KEY = '(21) 97194-3298';
export const OFFICIAL_PIX_KEY_PHONE = '+5521971943298';
export const OFFICIAL_PIX_KEY_RAW = '21971943298';
export const OFFICIAL_BENEFICIARY_NAME = 'Fernando Goncalves';
export const OFFICIAL_CITY = 'Rio de Janeiro';

export function normalizePixKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.includes('@')) return trimmed;
  // If random key (UUID)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  // If already starts with +55
  if (trimmed.startsWith('+55')) {
    return '+' + digits;
  }
  // If starts with 55 and has 12 or 13 digits (country code included without +)
  if (digits.length >= 12 && digits.startsWith('55')) {
    return '+' + digits;
  }
  // If Brazilian phone (10 or 11 digits, e.g. 21971943298)
  if (digits.length === 10 || digits.length === 11) {
    return '+55' + digits;
  }
  return trimmed;
}

function crc16(data: string): string {
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

function formatField(id: string, value: string): string {
  // UTF-8 length
  const len = encodeURI(value).split(/%..|./).length - 1;
  return `${id}${len.toString().padStart(2, '0')}${value}`;
}

export function generatePixPayload({
  key = OFFICIAL_PIX_KEY,
  name = OFFICIAL_BENEFICIARY_NAME,
  city = OFFICIAL_CITY,
  amount,
  txId = '***',
}: {
  key?: string;
  name?: string;
  city?: string;
  amount?: string;
  txId?: string;
} = {}): string {
  const normalizedKey = normalizePixKey(key);
  const gui = formatField('00', 'br.gov.bcb.pix');
  const pixKeyField = formatField('01', normalizedKey);
  const merchantInfo = formatField('26', `${gui}${pixKeyField}`);

  let raw =
    formatField('00', '01') + // Payload Format Indicator
    merchantInfo +
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986') + // Currency: BRL
    (amount && parseFloat(amount) > 0 ? formatField('54', parseFloat(amount).toFixed(2)) : '') +
    formatField('58', 'BR') + // Country Code
    formatField('59', name.slice(0, 25)) + // Merchant Name
    formatField('60', city.slice(0, 15)) + // Merchant City
    formatField('62', formatField('05', txId)); // Additional Data Field

  raw += '6304';
  const checksum = crc16(raw);
  return raw + checksum;
}

export async function generatePixQrDataUrl(
  payloadOrAmount?: string,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  const payload = payloadOrAmount?.startsWith('000201')
    ? payloadOrAmount
    : generatePixPayload({ amount: payloadOrAmount });

  return QRCode.toDataURL(payload, {
    width: options.width ?? 220,
    margin: options.margin ?? 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}
