-- Supabase Auth & RLS Setup — Eleições Progressistas v2.2.0

-- 1. Habilitar RLS em tabelas
ALTER TABLE IF EXISTS candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ad_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aggregate_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_candidates ENABLE ROW LEVEL SECURITY;

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

-- 6. Tabelas de serviço (sem acesso anon; apenas service_role/admin)
-- match_results é legado; matching atual é stateless sem escrita.
DROP POLICY IF EXISTS "match_results_service_only" ON match_results;
CREATE POLICY "match_results_service_only" ON match_results
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "aggregate_counters_public_read" ON aggregate_counters;
CREATE POLICY "aggregate_counters_public_read" ON aggregate_counters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "api_keys_service_only" ON api_keys;
CREATE POLICY "api_keys_service_only" ON api_keys
  FOR ALL USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "saved_candidates_owner" ON saved_candidates;
CREATE POLICY "saved_candidates_owner" ON saved_candidates
  FOR ALL USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "users_self" ON users;
CREATE POLICY "users_self" ON users
  FOR ALL USING (auth.jwt()->>'email' = email OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "feedback_insert_only" ON feedback;
CREATE POLICY "feedback_insert_only" ON feedback
  FOR INSERT WITH CHECK (true);
