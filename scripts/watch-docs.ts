import * as fs from 'node:fs';
import * as path from 'node:path';
import { runDocsSync } from './sync-docs';

const ROOT_DIR = path.resolve(__dirname, '..');

const WATCH_TARGETS = [
  path.join(ROOT_DIR, 'packages', 'shared', 'src'),
  path.join(ROOT_DIR, 'apps', 'api', 'prisma', 'schema.prisma'),
  path.join(ROOT_DIR, 'apps', 'api', 'src', 'modules'),
  path.join(ROOT_DIR, 'services', 'matching', 'app', 'algorithm'),
  path.join(ROOT_DIR, 'services', 'matching', 'app', 'main.py'),
];

let debounceTimer: NodeJS.Timeout | null = null;

function triggerSync(changedPath: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    console.log(`\n[Docs Watcher] 🔍 Alteração detectada em: ${path.relative(ROOT_DIR, changedPath)}`);
    try {
      runDocsSync();
    } catch (err) {
      console.error('[Docs Watcher] ❌ Erro ao sincronizar documentação:', err);
    }
  }, 500);
}

console.log('[Docs Watcher] 👁️  Monitorando código da aplicação para atualização contínua de arquivos .md...');
runDocsSync();

for (const target of WATCH_TARGETS) {
  if (fs.existsSync(target)) {
    const isDir = fs.statSync(target).isDirectory();
    fs.watch(target, { recursive: isDir }, (eventType, filename) => {
      if (filename) {
        triggerSync(path.join(target, filename.toString()));
      }
    });
    console.log(`[Docs Watcher] 📁 Monitorando: ${path.relative(ROOT_DIR, target)}`);
  }
}
