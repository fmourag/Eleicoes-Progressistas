import { generatePixPayload, normalizePixKey, crc16 } from '../src/utils/pix-generator';
import { PIX_KEY, PIX_KEY_DISPLAY, PIX_AMOUNT } from '../src/constants/civic-support';

describe('Pix Generator & EMVCo BR Code Specification', () => {
  it('1. Deve conter Tag 01 com exatamente 14 caracteres: 0114+5521971943298', () => {
    const payload = generatePixPayload({ amount: PIX_AMOUNT });
    expect(payload).toContain('0114+5521971943298');
  });

  it('2. Nao deve conter formato humano (21) no campo da chave do payload EMVCo', () => {
    const payload = generatePixPayload({ amount: PIX_AMOUNT });
    // Tag 26 contem subtag 01 com a chave
    expect(payload).not.toContain('(21)');
    expect(payload).not.toContain('0114(21)');
    expect(payload).not.toContain('+55 21');
    expect(payload).not.toContain('+552197194-3298');
  });

  it('3. Nao deve conter e-mails legados no payload do PIX', () => {
    const payload = generatePixPayload({ amount: PIX_AMOUNT });
    expect(payload).not.toContain('fmourag@gmail.com');
    expect(payload).not.toContain('fmourag@yahoo.com');
    expect(payload).not.toContain('@');
  });

  it('4. Deve validar o calculo do CRC16 oficial (polinomio 0x1021)', () => {
    const payload = generatePixPayload({ amount: 3.0 });
    const rawWithoutCrc = payload.slice(0, -4);
    const checksumInPayload = payload.slice(-4);
    const calculatedChecksum = crc16(rawWithoutCrc);

    expect(checksumInPayload).toBe(calculatedChecksum);
    expect(checksumInPayload.length).toBe(4);
    expect(checksumInPayload).toBe('3F9F');
  });

  it('5. Normalizacao de chave celular para formato E.164 BACEN', () => {
    expect(normalizePixKey(PIX_KEY_DISPLAY)).toBe('+5521971943298');
    expect(normalizePixKey('21971943298')).toBe('+5521971943298');
    expect(normalizePixKey('+5521971943298')).toBe('+5521971943298');
  });

  it('6. Deve incluir valor R$ 3,00 na Tag 54', () => {
    const payload = generatePixPayload({ amount: 3.0 });
    expect(payload).toContain('54043.00');
  });

  it('7. Chave central e tipo estao em conformidade com as regras', () => {
    expect(PIX_KEY).toBe('+5521971943298');
    expect(PIX_KEY_DISPLAY).toBe('(21) 97194-3298');
    expect(PIX_AMOUNT).toBe(3.0);
  });
});
