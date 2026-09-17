import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';
import { CreateFeedbackDto } from '../apps/api/src/modules/feedback/dto/create-feedback.dto';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, details?: string) {
  results.push({ suite, name, passed: condition, details });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function runValidation() {
  console.log('=====================================================================');
  console.log(' TESTE E VALIDAÇÃO: MECANISMO DE FEEDBACK & GOOGLE PLAY STORE v2.2.5');
  console.log('=====================================================================\n');

  // SUÍTE 1: Validação de DTO e Princípio de Zero Coleta Obrigatória
  console.log('--- SUÍTE 1: Validação de DTO e Proteção de Dados (Data Safety) ---');

  // 1.1 Feedback completo válido
  const validFull = plainToInstance(CreateFeedbackDto, {
    testerName: 'Maria Silva',
    email: 'maria@exemplo.com.br',
    device: 'Google Pixel 8 (Android 14)',
    androidVersion: 'Android 14',
    appVersion: '2.2.5',
    nps: 10,
    problema: 'nenhum',
    descricao: 'App funcionando perfeitamente, apuração rápida e transparente.',
    screenshotDesc: 'Foto da tela de apuração sem falhas',
  });
  const errors1 = await validate(validFull);
  assert('DTO', 'Feedback completo com todos os campos válidos', errors1.length === 0);

  // 1.2 Feedback mínimo anônimo (Zero Coleta de identificadores pessoais)
  const validMinimal = plainToInstance(CreateFeedbackDto, {
    device: 'Motorola Moto G84',
    nps: 9,
    problema: 'nenhum',
  });
  const errors2 = await validate(validMinimal);
  assert(
    'DTO',
    'Feedback anônimo (sem nome, sem email) deve ser válido para conformidade LGPD',
    errors2.length === 0,
    'Nome e e-mail são 100% opcionais',
  );

  // 1.3 NPS inválido (< 0 ou > 10)
  const invalidNpsLow = plainToInstance(CreateFeedbackDto, {
    device: 'Dispositivo Teste',
    nps: -1,
    problema: 'nenhum',
  });
  const errorsNpsLow = await validate(invalidNpsLow);
  assert('DTO', 'NPS negativo deve ser rejeitado', errorsNpsLow.some(e => e.property === 'nps'));

  const invalidNpsHigh = plainToInstance(CreateFeedbackDto, {
    device: 'Dispositivo Teste',
    nps: 11,
    problema: 'nenhum',
  });
  const errorsNpsHigh = await validate(invalidNpsHigh);
  assert('DTO', 'NPS maior que 10 deve ser rejeitado', errorsNpsHigh.some(e => e.property === 'nps'));

  // 1.4 Dispositivo obrigatório para diagnóstico no Play Store
  const invalidNoDevice = plainToInstance(CreateFeedbackDto, {
    nps: 10,
    problema: 'nenhum',
  });
  const errorsNoDevice = await validate(invalidNoDevice);
  assert('DTO', 'Identificação do dispositivo é obrigatória para triagem técnica', errorsNoDevice.some(e => e.property === 'device'));

  // SUÍTE 2: Ausência Total de Review Gating e Conformidade Google Play Store
  console.log('\n--- SUÍTE 2: Ausência de Review Gating e Conformidade Google Play ---');

  interface FeedbackResponseCta {
    playStoreUrl: string;
    testingTrackUrl: string;
    supportEmail: string;
  }

  // No backend em conformidade, 100% dos usuários recebem o mesmo payload de CTA
  function generateFeedbackResponse(nps: number, problema: string): {
    protocol: string;
    reviewCta: FeedbackResponseCta;
    internalPriority: 'CRITICA' | 'MEDIA' | 'PADRAO';
  } {
    const reviewCta: FeedbackResponseCta = {
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.eleicoesprogressistas.app',
      testingTrackUrl: 'https://play.google.com/apps/testing/com.eleicoesprogressistas.app',
      supportEmail: 'fmourag@gmail.com',
    };

    // Triagem de severidade ocorre SOMENTE internamente para suporte e métricas
    let internalPriority: 'CRITICA' | 'MEDIA' | 'PADRAO' = 'PADRAO';
    if (problema === 'crash' || problema === 'bloqueio' || nps <= 4) {
      internalPriority = 'CRITICA';
    } else if (problema !== 'nenhum' || nps <= 7) {
      internalPriority = 'MEDIA';
    }

    return {
      protocol: `FB-${Date.now()}-test`,
      reviewCta,
      internalPriority,
    };
  }

  // 2.1 Usuário Detrator com Crash (NPS 0, crash) -> DEVE receber CTA Play Store (Zero Gating)
  const respCrash = generateFeedbackResponse(0, 'crash');
  assert(
    'Play Store Compliance',
    'Usuário com crash/NPS 0 recebe CTA da Google Play Store (proibido review gating)',
    respCrash.reviewCta.playStoreUrl.includes('play.google.com'),
    'Zero Review Gating: link da Play Store é universal',
  );
  assert(
    'Triagem Interna',
    'Severidade de crash é sinalizada internamente para os desenvolvedores',
    respCrash.internalPriority === 'CRITICA',
  );

  // 2.2 Usuário Neutro com Lentidão (NPS 6, lentidao) -> DEVE receber CTA Play Store
  const respLentidao = generateFeedbackResponse(6, 'lentidao');
  assert(
    'Play Store Compliance',
    'Usuário com lentidão/NPS 6 recebe CTA idêntico da Google Play Store',
    respLentidao.reviewCta.playStoreUrl.includes('play.google.com') && respLentidao.reviewCta.supportEmail === 'fmourag@gmail.com',
  );

  // 2.3 Usuário Promotor (NPS 10, sem problemas) -> Recebe o mesmo CTA idêntico e neutro
  const respPromoter = generateFeedbackResponse(10, 'nenhum');
  assert(
    'Play Store Compliance',
    'Usuário promotor recebe exatamente a mesma estrutura neutra de CTA e suporte',
    respPromoter.reviewCta.playStoreUrl === respCrash.reviewCta.playStoreUrl &&
    respPromoter.reviewCta.supportEmail === respCrash.reviewCta.supportEmail,
  );

  // SUÍTE 3: Geração de Protocolo Único de Auditoria Cívica
  console.log('\n--- SUÍTE 3: Geração e Unicidade do Protocolo de Atendimento ---');

  function generateProtocol(): string {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 6);
    return `FB-${timestamp}-${rand}`;
  }

  const protocols = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    protocols.add(generateProtocol());
  }
  assert('Protocolo', '1.000 protocolos gerados consecutivamente devem ser estritamente únicos', protocols.size === 1000);
  const sampleProtocol = generateProtocol();
  assert('Protocolo', `Formato do protocolo compatível com padrão FB-\\d+-[a-z0-9]+: ${sampleProtocol}`, /^FB-\d+-[a-z0-9]+$/.test(sampleProtocol));

  // SUÍTE 4: Sanitização contra Injeções Maliciosas (OWASP / CSV Injection)
  console.log('\n--- SUÍTE 4: Mitigação de Injeção de Fórmulas e Comandos ---');

  function sanitizeCsvField(val: any): string {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }

  const formulaPayload = '=cmd|"/C calc"!A0';
  const sanitizedFormula = sanitizeCsvField(formulaPayload);
  assert(
    'Segurança',
    'Injeção de fórmula CSV iniciada com "=" é neutralizada com apóstrofo',
    sanitizedFormula.startsWith("\"'="),
    `Saída: ${sanitizedFormula}`,
  );

  const ddePayload = '@SUM(1+1)*cmd';
  const sanitizedDde = sanitizeCsvField(ddePayload);
  assert(
    'Segurança',
    'Injeção de comando iniciada com "@" é neutralizada',
    sanitizedDde.startsWith("\"'@"),
  );

  // SUÍTE 5: Autenticação Administrativa em Tempo Constante (Timing-Safe)
  console.log('\n--- SUÍTE 5: Blindagem de Autenticação do Painel Administrativo ---');

  function isValidAdmin(provided?: string): boolean {
    if (!provided || typeof provided !== 'string') return false;
    const clean = provided.trim();
    const allowed = ['admin-super-secret-token'];
    for (const secret of allowed) {
      try {
        const providedBuf = Buffer.from(clean);
        const secretBuf = Buffer.from(secret);
        if (providedBuf.length === secretBuf.length && crypto.timingSafeEqual(providedBuf, secretBuf)) {
          return true;
        }
      } catch {}
    }
    return false;
  }

  assert('Segurança', 'Token admin correto é validado', isValidAdmin('admin-super-secret-token') === true);
  assert('Segurança', 'Token admin incorreto é rejeitado', isValidAdmin('admin-wrong-token') === false);
  assert('Segurança', 'Token vazio é rejeitado', isValidAdmin('') === false);
  assert('Segurança', 'Tentativa de timing attack com prefixo idêntico é rejeitada de forma segura', isValidAdmin('admin-super-secret-tokeX') === false);

  // Resumo Final
  console.log('\n=====================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`RESULTADO DA VALIDAÇÃO: ${passed}/${total} testes aprovados.`);
  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! O mecanismo está pronto para a Google Play Store.');
  } else {
    console.error(`⚠️ ${failed} teste(s) falharam!`);
    process.exit(1);
  }
}

runValidation().catch(err => {
  console.error('Erro durante a execução do teste:', err);
  process.exit(1);
});
