import QRCode from 'qrcode';

export const OFFICIAL_PIX_KEY = 'fmourag@yahoo.com';
export const OFFICIAL_BENEFICIARY_NAME = 'Fernando Goncalves';
export const OFFICIAL_CITY = 'Rio de Janeiro';

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
  const gui = formatField('00', 'br.gov.bcb.pix');
  const pixKeyField = formatField('01', key);
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
