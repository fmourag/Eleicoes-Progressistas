import { generatePixPayload, normalizePixKey, crc16 } from '../apps/mobile/src/utils/pix-generator';
import { PIX_KEY, PIX_KEY_DISPLAY, PIX_AMOUNT } from '../apps/mobile/src/constants/civic-support';
import assert from 'assert';

console.log('🧪 Iniciando testes de validação do gerador PIX EMVCo...');

// Test 1: Tag 01 com exatamente 14 caracteres: 0114+5521971943298
const payload = generatePixPayload({ amount: PIX_AMOUNT });
assert(payload.includes('0114+5521971943298'), 'Falha: payload deve conter 0114+5521971943298');
console.log('  ✅ 1. Tag 01 com 14 caracteres (+5521971943298) validada.');

// Test 2: Não deve conter formato humano (21) no campo da chave do payload EMVCo
assert(!payload.includes('(21)'), 'Falha: payload não deve conter (21)');
assert(!payload.includes('+55 21'), 'Falha: payload não deve conter espaço no telefone');
assert(!payload.includes('+552197194-3298'), 'Falha: payload não deve conter hífen no telefone');
console.log('  ✅ 2. Ausência de caracteres humanos na chave do payload validada.');

// Test 3: Não deve conter e-mails legados
assert(!payload.includes('fmourag@gmail.com'), 'Falha: payload não deve conter fmourag@gmail.com');
assert(!payload.includes('fmourag@yahoo.com'), 'Falha: payload não deve conter fmourag@yahoo.com');
assert(!payload.includes('@'), 'Falha: payload não deve conter @');
console.log('  ✅ 3. Ausência de e-mails legados no payload validada.');

// Test 4: Validação do CRC16
const rawWithoutCrc = payload.slice(0, -4);
const checksumInPayload = payload.slice(-4);
const calculatedChecksum = crc16(rawWithoutCrc);
assert.strictEqual(checksumInPayload, calculatedChecksum, 'Falha: CRC16 recalculado não confere');
assert.strictEqual(checksumInPayload, '3F9F', 'Falha: CRC16 esperado é 3F9F');
console.log('  ✅ 4. CRC16 recalculado com sucesso (' + calculatedChecksum + ').');

// Test 5: Normalização E.164
assert.strictEqual(normalizePixKey(PIX_KEY_DISPLAY), '+5521971943298');
assert.strictEqual(normalizePixKey('21971943298'), '+5521971943298');
assert.strictEqual(normalizePixKey('+5521971943298'), '+5521971943298');
console.log('  ✅ 5. Normalização de chave celular para E.164 validada.');

// Test 6: Tag 54 com valor 3.00
assert(payload.includes('54043.00'), 'Falha: payload deve conter 54043.00');
console.log('  ✅ 6. Tag 54 com valor R$ 3,00 validada.');

// Test 7: Constantes centrais
assert.strictEqual(PIX_KEY, '+5521971943298');
assert.strictEqual(PIX_KEY_DISPLAY, '(21) 97194-3298');
assert.strictEqual(PIX_AMOUNT, 3.0);
console.log('  ✅ 7. Constantes centrais únicas validadas.');

console.log('\n🎉 TODOS OS 7 TESTES DO PIX GENERATOR FORAM APROVADOS!');
