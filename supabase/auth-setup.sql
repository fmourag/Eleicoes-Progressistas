-- Supabase Auth & RLS Setup — Eleições Progressistas v2.2.0

-- 1. Habilitar RLS em tabelas
ALTER TABLE IF EXISTS candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ad_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS donations ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para Candidates (Leitura Pública, Escrita Admin)
DROP POLICY IF EXISTS "candidates_public_read" ON candidates;
CREATE POLICY "candidates_public_read" ON candidates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "candidates_admin_write" ON candidates;
CREATE POLICY "candidates_admin_write" ON candidates
  FOR ALL USING (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'email' = current_setting('app.admin_email', true));

-- 3. Políticas para Proposals (Leitura Pública, Escrita Admin)
DROP POLICY IF EXISTS "proposals_public_read" ON proposals;
CREATE POLICY "proposals_public_read" ON proposals
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "proposals_admin_write" ON proposals;
CREATE POLICY "proposals_admin_write" ON proposals
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- 4. Políticas para Anúncios Éticos (Leitura Pública de Ativos)
DROP POLICY IF EXISTS "ads_public_read" ON ads;
CREATE POLICY "ads_public_read" ON ads
  FOR SELECT USING ("isActive" = true);

-- 5. Opt-out Anônimo (Inserção Pública sem leitura de outros)
DROP POLICY IF EXISTS "ad_opt_out_insert" ON ad_opt_outs;
CREATE POLICY "ad_opt_out_insert" ON ad_opt_outs
  FOR INSERT WITH CHECK (true);
