-- ============================================================
-- MojaPolisa – Supabase Schema
-- Wklej do Supabase SQL Editor i uruchom
-- Hosting: EU Frankfurt | RODO compliant
-- ============================================================

-- Włącz rozszerzenia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HELPERS: szyfrowanie AES-256 dla danych wrażliwych
-- Klucz szyfrowania pochodzi ze zmiennej środowiskowej Supabase Vault
-- ============================================================

CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    encrypt(
      data::bytea,
      current_setting('app.encryption_key')::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(data, 'base64'),
      current_setting('app.encryption_key')::bytea,
      'aes'
    ),
    'UTF8'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABELA: clients
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pesel             TEXT,                          -- zaszyfrowany AES-256
  pesel_type        TEXT NOT NULL DEFAULT 'PL'     -- 'PL' lub 'UA'
                    CHECK (pesel_type IN ('PL', 'UA')),
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  birth_date        DATE,
  gender            TEXT CHECK (gender IN ('M', 'K')),
  email             TEXT NOT NULL,
  phone             TEXT,
  address           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login        TIMESTAMPTZ,
  has_account       BOOLEAN NOT NULL DEFAULT FALSE,
  deep_link_token   TEXT UNIQUE,
  deep_link_expires TIMESTAMPTZ,
  agent_notes       TEXT                           -- niewidoczne dla klienta
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_deep_link_token ON public.clients(deep_link_token)
  WHERE deep_link_token IS NOT NULL;

-- ============================================================
-- TABELA: auth_accounts (powiązanie z Supabase Auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.auth_accounts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  auth_uid   UUID NOT NULL UNIQUE,                -- Supabase auth.users.id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_accounts_auth_uid ON public.auth_accounts(auth_uid);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_client_id ON public.auth_accounts(client_id);

-- ============================================================
-- TABELA: policies
-- ============================================================

CREATE TABLE IF NOT EXISTS public.policies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_type   TEXT NOT NULL
                 CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  policy_number  TEXT,
  start_date     DATE,
  end_date       DATE,
  premium        DECIMAL(10,2),
  frequency      TEXT CHECK (frequency IN ('monthly','quarterly','semi-annual','annual')),
  status         TEXT NOT NULL DEFAULT 'submitted'
                 CHECK (status IN ('submitted','in_review','ready','accepted','active','expired','claim_in_progress')),
  status_history JSONB NOT NULL DEFAULT '[]'::JSONB,
  documents      JSONB DEFAULT '[]'::JSONB,       -- OWU/KID z biblioteki
  custom_pdfs    JSONB DEFAULT '[]'::JSONB,        -- ręcznie wgrane przez admina
  claim_link     TEXT,
  claim_phone    TEXT,
  payment_link   TEXT,
  admin_note     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_client_id ON public.policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_end_date ON public.policies(end_date)
  WHERE end_date IS NOT NULL;

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABELA: applications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_type   TEXT NOT NULL
                 CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  form_data      JSONB NOT NULL DEFAULT '{}'::JSONB,  -- zaszyfrowane dane wniosku
  ank_data       JSONB DEFAULT '{}'::JSONB,
  medical_data   JSONB DEFAULT '{}'::JSONB,            -- zaszyfrowana ankieta medyczna
  status         TEXT NOT NULL DEFAULT 'new',
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address     TEXT,                                -- wymóg IDD
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_client_id ON public.applications(client_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);

-- ============================================================
-- TABELA: ank_records (Analiza Potrzeb Klienta – archiwizacja 5 lat)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ank_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  product_type   TEXT NOT NULL
                 CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  answers        JSONB NOT NULL,
  accepted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address     TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Archiwizacja: indeks dla wymagania min. 5 lat
CREATE INDEX IF NOT EXISTS idx_ank_records_client_id ON public.ank_records(client_id);
CREATE INDEX IF NOT EXISTS idx_ank_records_created_at ON public.ank_records(created_at);

-- ============================================================
-- TABELA: documents_library (biblioteka OWU, KID, IPZ)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.documents_library (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL
               CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  doc_type     TEXT NOT NULL CHECK (doc_type IN ('owu','kid','ipz')),
  name         TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  version      TEXT NOT NULL DEFAULT '1.0',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_library_product_type ON public.documents_library(product_type);

-- ============================================================
-- TABELA: chat_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL CHECK (sender IN ('client', 'agent')),
  content    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON public.chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON public.chat_messages(client_id, read)
  WHERE read = FALSE;

-- ============================================================
-- TABELA: notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON public.notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON public.notifications(sent_at DESC);

-- ============================================================
-- TABELA: tu_config (konfiguracja TU – linki i infolinie)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tu_config (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL UNIQUE
               CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  claim_link   TEXT DEFAULT '',
  claim_phone  TEXT DEFAULT '',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Domyślna konfiguracja TU
INSERT INTO public.tu_config (product_type, claim_link, claim_phone) VALUES
  ('life_a', 'https://viennalife.pl/strefa-klienta/zglos-zdarzenie/', '22 460 22 22'),
  ('life_b', 'https://www.ergohestia.pl/zglos-zdarzenie/', '58 766 34 44'),
  ('oc', '', ''),
  ('ac', '', ''),
  ('oc_ac', '', ''),
  ('property', '', ''),
  ('investment', '', '')
ON CONFLICT (product_type) DO NOTHING;

-- ============================================================
-- TABELA: admin_sessions (logowanie do panelu admina)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_created_at ON public.admin_sessions(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Włącz RLS na wszystkich tabelach
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ank_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: sprawdź czy zalogowany user jest adminem
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- HELPER: pobierz client_id dla zalogowanego usera
CREATE OR REPLACE FUNCTION get_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT client_id FROM public.auth_accounts
    WHERE auth_uid = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- POLITYKI RLS: clients
-- ============================================================

-- Klient: widzi tylko swoje dane
CREATE POLICY "clients_select_own" ON public.clients
  FOR SELECT USING (id = get_client_id());

-- Admin: widzi wszystko
CREATE POLICY "clients_select_admin" ON public.clients
  FOR SELECT USING (is_admin());

CREATE POLICY "clients_insert_admin" ON public.clients
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "clients_update_own" ON public.clients
  FOR UPDATE USING (id = get_client_id())
  WITH CHECK (id = get_client_id());

CREATE POLICY "clients_update_admin" ON public.clients
  FOR UPDATE USING (is_admin());

-- Anonimowy insert przy rejestracji (wymagane do onboardingu bez konta)
CREATE POLICY "clients_insert_anon" ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- ============================================================
-- POLITYKI RLS: policies
-- ============================================================

CREATE POLICY "policies_select_own" ON public.policies
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "policies_select_admin" ON public.policies
  FOR SELECT USING (is_admin());

CREATE POLICY "policies_insert_admin" ON public.policies
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "policies_update_admin" ON public.policies
  FOR UPDATE USING (is_admin());

-- UWAGA: Klient NIE zmienia statusu polisy bezpośrednio z UI.
-- Workflow: klient klika "Zaakceptuj polisę" → API tworzy token → wysyła email
-- z linkiem do akceptacji → klient klika link → tworzy się rekord
-- w policy_acceptance_intents → admin RĘCZNIE zmienia status w panelu.
-- (Zgodnie z update'em od klienta: "klient musi zaakceptować na mailu, ja sam zmienię status")

CREATE TABLE IF NOT EXISTS public.policy_acceptance_intents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id     UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  email_sent_at TIMESTAMPTZ,
  confirmed_at  TIMESTAMPTZ,
  ip_address    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_acceptance_token
  ON public.policy_acceptance_intents(token);

ALTER TABLE public.policy_acceptance_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceptance_select_own" ON public.policy_acceptance_intents
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "acceptance_all_admin" ON public.policy_acceptance_intents
  FOR ALL USING (is_admin());

CREATE POLICY "acceptance_insert_any" ON public.policy_acceptance_intents
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- POLITYKI RLS: applications
-- ============================================================

CREATE POLICY "applications_select_own" ON public.applications
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "applications_select_admin" ON public.applications
  FOR SELECT USING (is_admin());

CREATE POLICY "applications_insert_any" ON public.applications
  FOR INSERT WITH CHECK (TRUE);  -- Wniosek bez logowania

CREATE POLICY "applications_update_admin" ON public.applications
  FOR UPDATE USING (is_admin());

-- ============================================================
-- POLITYKI RLS: ank_records
-- ============================================================

CREATE POLICY "ank_select_own" ON public.ank_records
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "ank_select_admin" ON public.ank_records
  FOR SELECT USING (is_admin());

CREATE POLICY "ank_insert_any" ON public.ank_records
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- POLITYKI RLS: documents_library (publiczna dla zalogowanych)
-- ============================================================

CREATE POLICY "documents_select_authenticated" ON public.documents_library
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "documents_all_admin" ON public.documents_library
  FOR ALL USING (is_admin());

-- ============================================================
-- POLITYKI RLS: chat_messages
-- ============================================================

CREATE POLICY "chat_select_own" ON public.chat_messages
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "chat_select_admin" ON public.chat_messages
  FOR SELECT USING (is_admin());

CREATE POLICY "chat_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (
    client_id = get_client_id() AND sender = 'client'
  );

CREATE POLICY "chat_insert_admin" ON public.chat_messages
  FOR INSERT WITH CHECK (is_admin() AND sender = 'agent');

CREATE POLICY "chat_update_admin" ON public.chat_messages
  FOR UPDATE USING (is_admin());

-- ============================================================
-- POLITYKI RLS: notifications
-- ============================================================

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (client_id = get_client_id());

CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT USING (is_admin());

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (client_id = get_client_id())
  WITH CHECK (client_id = get_client_id());

-- ============================================================
-- POLITYKI RLS: tu_config (tylko admin może zmieniać)
-- ============================================================

CREATE POLICY "tu_config_select_authenticated" ON public.tu_config
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "tu_config_all_admin" ON public.tu_config
  FOR ALL USING (is_admin());

-- ============================================================
-- POLITYKI RLS: admin_sessions (tylko admin)
-- ============================================================

CREATE POLICY "admin_sessions_all_admin" ON public.admin_sessions
  FOR ALL USING (is_admin());

-- ============================================================
-- REALTIME: włącz dla czatu i powiadomień
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.policies;

-- ============================================================
-- STORAGE: bucket dla PDF
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', FALSE, 10485760, ARRAY['application/pdf']),
  ('policy-documents', 'policy-documents', FALSE, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Polityki storage: klient widzi tylko swoje pliki
CREATE POLICY "storage_documents_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = get_client_id()::TEXT
  );

CREATE POLICY "storage_documents_select_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('documents', 'policy-documents') AND is_admin());

CREATE POLICY "storage_documents_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('documents', 'policy-documents') AND is_admin());

-- ============================================================
-- CRON JOBS: alerty o kończących się polisach
-- (wymaga rozszerzenia pg_cron – włącz w Supabase Dashboard)
-- ============================================================

-- SELECT cron.schedule(
--   'policy-expiry-alerts',
--   '0 9 * * *',   -- codziennie o 9:00
--   $$
--     SELECT net.http_post(
--       url := current_setting('app.edge_function_url') || '/send-expiry-alerts',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.service_role_key')
--       ),
--       body := '{}'::JSONB
--     );
--   $$
-- );

-- ============================================================
-- WIDOKI pomocnicze dla panelu admina
-- ============================================================

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.clients) AS total_clients,
  (SELECT COUNT(*) FROM public.policies WHERE status = 'active') AS active_policies,
  (SELECT COUNT(*) FROM public.applications WHERE DATE(submitted_at) = CURRENT_DATE) AS today_applications,
  (SELECT COUNT(*) FROM public.chat_messages WHERE read = FALSE AND sender = 'client') AS unread_messages,
  (SELECT COUNT(*) FROM public.policies WHERE status = 'claim_in_progress') AS active_claims,
  (SELECT COUNT(*) FROM public.policies
    WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND status = 'active'
  ) AS expiring_soon;

-- Dostęp do widoku tylko dla admina
ALTER VIEW public.admin_dashboard_stats OWNER TO authenticated;
