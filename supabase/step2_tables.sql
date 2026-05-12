-- ============================================================
-- KROK 2/5 — Wszystkie tabele i indeksy
-- ============================================================

-- TABELA: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pesel             TEXT,
  pesel_type        TEXT NOT NULL DEFAULT 'PL'
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
  agent_notes       TEXT
);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_deep_link_token ON public.clients(deep_link_token)
  WHERE deep_link_token IS NOT NULL;

-- TABELA: auth_accounts (powiązanie z Supabase Auth)
CREATE TABLE IF NOT EXISTS public.auth_accounts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  auth_uid   UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_auth_uid ON public.auth_accounts(auth_uid);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_client_id ON public.auth_accounts(client_id);

-- TABELA: policies
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
  documents      JSONB DEFAULT '[]'::JSONB,
  custom_pdfs    JSONB DEFAULT '[]'::JSONB,
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

DROP TRIGGER IF EXISTS policies_updated_at ON public.policies;
CREATE TRIGGER policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- TABELA: applications
CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_type   TEXT NOT NULL
                 CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  form_data      JSONB NOT NULL DEFAULT '{}'::JSONB,
  ank_data       JSONB DEFAULT '{}'::JSONB,
  medical_data   JSONB DEFAULT '{}'::JSONB,
  status         TEXT NOT NULL DEFAULT 'new',
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_applications_client_id ON public.applications(client_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);

-- TABELA: ank_records (archiwizacja 5 lat – wymóg IDD)
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
CREATE INDEX IF NOT EXISTS idx_ank_records_client_id ON public.ank_records(client_id);
CREATE INDEX IF NOT EXISTS idx_ank_records_created_at ON public.ank_records(created_at);

-- TABELA: documents_library (OWU, KID, IPZ)
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

-- TABELA: chat_messages
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

-- TABELA: notifications
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

-- TABELA: tu_config (linki i infolinie TU – konfigurowalne przez admina)
CREATE TABLE IF NOT EXISTS public.tu_config (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL UNIQUE
               CHECK (product_type IN ('life_a','life_b','oc','ac','oc_ac','property','investment')),
  claim_link   TEXT DEFAULT '',
  claim_phone  TEXT DEFAULT '',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tu_config (product_type, claim_link, claim_phone) VALUES
  ('life_a',     'https://viennalife.pl/strefa-klienta/zglos-zdarzenie/', '22 460 22 22'),
  ('life_b',     'https://www.ergohestia.pl/zglos-zdarzenie/',            '58 766 34 44'),
  ('oc',         '', ''),
  ('ac',         '', ''),
  ('oc_ac',      '', ''),
  ('property',   '', ''),
  ('investment', '', '')
ON CONFLICT (product_type) DO NOTHING;

-- TABELA: admin_sessions (log prób logowania)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_created_at ON public.admin_sessions(created_at DESC);

-- TABELA: policy_acceptance_intents (Moduł 3 – akceptacja przez email)
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
