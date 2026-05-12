-- ============================================================
-- KROK 3/5 — Helpery RLS + włączenie RLS + widok statystyk
-- ============================================================

-- Funkcja: czy zalogowany user jest adminem?
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

-- Funkcja: pobierz client_id dla zalogowanego usera
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

-- Włącz RLS na wszystkich tabelach
ALTER TABLE public.clients                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_accounts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ank_records                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_library          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tu_config                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptance_intents  ENABLE ROW LEVEL SECURITY;

-- Widok pomocniczy: statystyki dashboardu
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

GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
