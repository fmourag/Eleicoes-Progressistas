import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

interface SyncStats {
  updatedFiles: string[];
  unchangedFiles: string[];
}

function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 1. Extrai constantes e afirmações dos 8 Pilares do código compartilhado
 */
function extractPillarsData() {
  const pillarsCorePath = path.join(ROOT_DIR, 'packages', 'shared', 'src', 'pillars-core.ts');
  const content = fs.readFileSync(pillarsCorePath, 'utf-8');

  // Extrai declarações
  const statements: Array<{ id: string; label: string; text: string }> = [];
  const stmtRegex = /\{\s*id:\s*'([^']+)',\s*pillar:\s*'(p\d+)',\s*text:\s*'([^']+)'/g;
  let match;

  const labelsMap: Record<string, string> = {
    p1: 'Bem-Estar & Assistência Social',
    p2: 'Justiça Social',
    p3: 'Desenvolvimento Sustentável',
    p4: 'Valores Nacionais',
    p5: 'Reindustrialização',
    p6: 'Distribuição Justa de Renda',
    p7: 'Proteção do Vulnerável',
    p8: 'Governo Eficiente',
    p9: 'Saúde Pública',
    p10: 'Segurança Pública',
    p11: 'Educação',
    p12: 'Relações do Trabalho e Emprego',
    p13: 'Empreendedorismo e Desoneração Responsável',
  };

  while ((match = stmtRegex.exec(content)) !== null) {
    const stmtId = match[1];
    const pillarKey = match[2];
    statements.push({
      id: stmtId.toUpperCase(),
      label: labelsMap[pillarKey] || pillarKey,
      text: match[3],
    });
  }

  return statements;
}

/**
 * 2. Extrai Schema do Prisma atualizado
 */
function extractPrismaSchema(): string {
  const prismaPath = path.join(ROOT_DIR, 'apps', 'api', 'prisma', 'schema.prisma');
  if (!fs.existsSync(prismaPath)) return '';
  const content = fs.readFileSync(prismaPath, 'utf-8');

  // Filtra datasource e generator para focar nos models e enums
  const lines = content.split('\n');
  const filtered: string[] = [];
  let skip = false;

  for (const line of lines) {
    if (line.startsWith('datasource db') || line.startsWith('generator client')) {
      skip = true;
      continue;
    }
    if (skip && line.startsWith('}')) {
      skip = false;
      continue;
    }
    if (!skip) {
      filtered.push(line);
    }
  }

  return filtered.join('\n').trim();
}

/**
 * 3. Extrai Parâmetros do Algoritmo Python
 */
function extractAlgorithmParams() {
  const pyCorePath = path.join(ROOT_DIR, 'services', 'matching', 'app', 'algorithm', 'core.py');
  if (!fs.existsSync(pyCorePath)) {
    return { priorityMultiplier: '3.0', fichaLimpaBonus: '5.0' };
  }
  const content = fs.readFileSync(pyCorePath, 'utf-8');

  const multMatch = content.match(/PRIORITY_WEIGHT\s*=\s*([\d.]+)/);
  const bonusMatch = content.match(/FICHA_LIMPA_BONUS\s*=\s*([\d.]+)/);

  return {
    priorityMultiplier: multMatch ? multMatch[1] : '3.0',
    fichaLimpaBonus: bonusMatch ? bonusMatch[1] : '5.0',
  };
}

/**
 * 4. Extrai Endpoints dos Controllers NestJS
 */
function extractEndpoints() {
  const modulesDir = path.join(ROOT_DIR, 'apps', 'api', 'src', 'modules');
  const endpoints: Array<{ method: string; path: string; auth: string; description: string }> = [];

  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.controller.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const prefixMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
        const prefix = prefixMatch ? prefixMatch[1] : '';

        // Procura rotas @Get, @Post, @Put, @Delete
        const routeRegex = /@(Get|Post|Put|Delete|Patch)\((?:['"]([^'"]*)['"])?\)/g;
        let rMatch;
        while ((rMatch = routeRegex.exec(content)) !== null) {
          const method = rMatch[1].toUpperCase();
          const subPath = rMatch[2] || '';
          const fullRoute = `/api/${prefix}${subPath ? `/${subPath}` : ''}`.replace(/\/+/g, '/');
          const hasAuth = content.includes('UseGuards(SupabaseAuthGuard)') || content.includes('Supabase JWT');

          endpoints.push({
            method,
            path: fullRoute,
            auth: hasAuth ? 'Supabase JWT' : 'Não',
            description: `${method} ${fullRoute}`,
          });
        }
      }
    }
  }

  if (fs.existsSync(modulesDir)) {
    scanDir(modulesDir);
  }

  return endpoints;
}

/**
 * Atualiza o arquivo PRD.md
 */
function syncPRD(statements: Array<{ id: string; label: string; text: string }>, date: string): boolean {
  const prdPath = path.join(DOCS_DIR, 'PRD.md');
  if (!fs.existsSync(prdPath)) return false;

  let content = fs.readFileSync(prdPath, 'utf-8');
  const original = content;

  // Atualiza data do cabeçalho
  content = content.replace(
    /> \*\*Versão:\*\* ([\d.]+) \| \*\*Data:\*\* [^\n|]+/g,
    `> **Versão:** $1 | **Data:** ${date}`,
  );

  // Constrói tabela dos pilares
  let table = '| # | Pilar | Afirmação |\n|---|-------|-----------|\n';
  statements.forEach((s) => {
    table += `| ${s.id} | ${s.label} | ${s.text} |\n`;
  });

  const section2Regex = /## 2\. Os \d+ Pilares[\s\S]*?(?=\n---|\n## 3)/;
  if (section2Regex.test(content)) {
    content = content.replace(section2Regex, `## 2. Os 13 Pilares (41 Afirmações Estruturantes)\n\n${table.trim()}\n`);
  }

  if (content !== original) {
    fs.writeFileSync(prdPath, content, 'utf-8');
    return true;
  }
  return false;
}

/**
 * Atualiza DOCUMENTACAO_TECNICA.md
 */
function syncTechnicalDocs(prismaSchema: string, params: { priorityMultiplier: string; fichaLimpaBonus: string }, date: string): boolean {
  const docPath = path.join(DOCS_DIR, 'DOCUMENTACAO_TECNICA.md');
  if (!fs.existsSync(docPath)) return false;

  let content = fs.readFileSync(docPath, 'utf-8');
  const original = content;

  // Atualiza data do cabeçalho
  content = content.replace(
    /> \*\*Versão:\*\* ([\d.]+) \| \*\*Data:\*\* [^\n|]+/g,
    `> **Versão:** $1 | **Data:** ${date}`,
  );

  // Atualiza Schema Prisma
  if (prismaSchema) {
    const schemaRegex = /## 2\. Schema Prisma\n\n```prisma[\s\S]*?```/;
    if (schemaRegex.test(content)) {
      content = content.replace(schemaRegex, `## 2. Schema Prisma\n\n\`\`\`prisma\n${prismaSchema}\n\`\`\``);
    }
  }

  // Atualiza tabela de regras do algoritmo
  const rulesTable = `| Regra | Valor |\n|---|---|\n| Peso pilar prioritário | ${params.priorityMultiplier}x |\n| Peso pilar não-prioritário | 1.0x |\n| Bônus ficha limpa | +${params.fichaLimpaBonus.replace('.0', '')} (cap 100) |\n| pillar_focus ausente | assume 0.5 + \`is_estimated: true\` |\n| Threshold "alto alinhamento" | similarity ≥ 0.7 |`;

  const rulesRegex = /### Regras\n\n\| Regra \| Valor \|[\s\S]*?(?=\n---|\n## 5)/;
  if (rulesRegex.test(content)) {
    content = content.replace(rulesRegex, `### Regras\n\n${rulesTable}\n`);
  }

  if (content !== original) {
    fs.writeFileSync(docPath, content, 'utf-8');
    return true;
  }
  return false;
}

/**
 * Atualiza README.md raiz
 */
function syncReadme(statements: Array<{ id: string; label: string; text: string }>): boolean {
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (!fs.existsSync(readmePath)) return false;

  let content = fs.readFileSync(readmePath, 'utf-8');
  const original = content;

  // Atualiza contagem dos pilares e prioridades
  content = content.replace(
    /Pilares dos Candidatos.*?—.*?\d+ afirmações/i,
    'Pilares dos Candidatos — 41 afirmações estruturantes + até 3 prioridades',
  );

  if (content !== original) {
    fs.writeFileSync(readmePath, content, 'utf-8');
    return true;
  }
  return false;
}

/**
 * Execução Principal do Sync de Documentação
 */
export function runDocsSync(): SyncStats {
  const date = getFormattedDate();
  const statements = extractPillarsData();
  const prismaSchema = extractPrismaSchema();
  const params = extractAlgorithmParams();

  const stats: SyncStats = {
    updatedFiles: [],
    unchangedFiles: [],
  };

  console.log(`[Docs Sync] 🚀 Sincronizando documentação Markdown com o código da aplicação (${date})...`);

  // 1. Sincronizar PRD.md
  if (syncPRD(statements, date)) {
    stats.updatedFiles.push('docs/PRD.md');
  } else {
    stats.unchangedFiles.push('docs/PRD.md');
  }

  // 2. Sincronizar DOCUMENTACAO_TECNICA.md
  if (syncTechnicalDocs(prismaSchema, params, date)) {
    stats.updatedFiles.push('docs/DOCUMENTACAO_TECNICA.md');
  } else {
    stats.unchangedFiles.push('docs/DOCUMENTACAO_TECNICA.md');
  }

  // 3. Sincronizar README.md
  if (syncReadme(statements)) {
    stats.updatedFiles.push('README.md');
  } else {
    stats.unchangedFiles.push('README.md');
  }

  console.log(`[Docs Sync] ✨ Sincronização concluída.`);
  if (stats.updatedFiles.length > 0) {
    console.log(`[Docs Sync] 📝 Arquivos atualizados:`, stats.updatedFiles.join(', '));
  } else {
    console.log(`[Docs Sync] 🟢 Todos os arquivos .md já estavam sincronizados com o código.`);
  }

  return stats;
}

if (require.main === module) {
  runDocsSync();
}
