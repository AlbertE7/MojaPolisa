-- ============================================================
-- KROK 4/5 — Wszystkie polityki RLS
-- ============================================================

-- ---------- clients ----------
DROP POLICY IF EXISTS "clients_select_own"   ON public.clients;
DROP POLICY IF EXISTS "clients_select_admin" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_admin" ON public.clients;
DROP POLICY IF EXISTS "clients_update_own"   ON public.clients;
DROP POLICY IF EXISTS "clients_update_admin" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_anon"  ON public.clients;

CREATE POLICY "clients_select_own"   ON public.clients FOR SELECT USING (id = get_client_id());
CREATE POLICY "clients_select_admin" ON public.clients FOR SELECT USING (is_admin());
CREATE POLICY "clients_insert_admin" ON public.clients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "clients_update_own"   ON public.clients FOR UPDATE USING (id = get_client_id()) WITH CHECK (id = get_client_id());
CREATE POLICY "clients_update_admin" ON public.clients FOR UPDATE USING (is_admin());
CREATE POLICY "clients_insert_anon"  ON public.clients FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- ---------- policies ----------
DROP POLICY IF EXISTS "policies_select_own"   ON public.policies;
DROP POLICY IF EXISTS "policies_select_admin" ON public.policies;
DROP POLICY IF EXISTS "policies_insert_admin" ON public.policies;
DROP POLICY IF EXISTS "policies_update_admin" ON public.policies;

CREATE POLICY "policies_select_own"   ON public.policies FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "policies_select_admin" ON public.policies FOR SELECT USING (is_admin());
CREATE POLICY "policies_insert_admin" ON public.policies FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "policies_update_admin" ON public.policies FOR UPDATE USING (is_admin());

-- ---------- applications ----------
DROP POLICY IF EXISTS "applications_select_own"   ON public.applications;
DROP POLICY IF EXISTS "applications_select_admin" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_any"   ON public.applications;
DROP POLICY IF EXISTS "applications_update_admin" ON public.applications;

CREATE POLICY "applications_select_own"   ON public.applications FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "applications_select_admin" ON public.applications FOR SELECT USING (is_admin());
CREATE POLICY "applications_insert_any"   ON public.applications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "applications_update_admin" ON public.applications FOR UPDATE USING (is_admin());

-- ---------- ank_records ----------
DROP POLICY IF EXISTS "ank_select_own"   ON public.ank_records;
DROP POLICY IF EXISTS "ank_select_admin" ON public.ank_records;
DROP POLICY IF EXISTS "ank_insert_any"   ON public.ank_records;

CREATE POLICY "ank_select_own"   ON public.ank_records FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "ank_select_admin" ON public.ank_records FOR SELECT USING (is_admin());
CREATE POLICY "ank_insert_any"   ON public.ank_records FOR INSERT WITH CHECK (TRUE);

-- ---------- documents_library ----------
DROP POLICY IF EXISTS "documents_select_authenticated" ON public.documents_library;
DROP POLICY IF EXISTS "documents_all_admin"            ON public.documents_library;

CREATE POLICY "documents_select_authenticated" ON public.documents_library FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "documents_all_admin"            ON public.documents_library FOR ALL    USING (is_admin());

-- ---------- chat_messages ----------
DROP POLICY IF EXISTS "chat_select_own"   ON public.chat_messages;
DROP POLICY IF EXISTS "chat_select_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert_own"   ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_update_admin" ON public.chat_messages;

CREATE POLICY "chat_select_own"   ON public.chat_messages FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "chat_select_admin" ON public.chat_messages FOR SELECT USING (is_admin());
CREATE POLICY "chat_insert_own"   ON public.chat_messages FOR INSERT WITH CHECK (client_id = get_client_id() AND sender = 'client');
CREATE POLICY "chat_insert_admin" ON public.chat_messages FOR INSERT WITH CHECK (is_admin() AND sender = 'agent');
CREATE POLICY "chat_update_admin" ON public.chat_messages FOR UPDATE USING (is_admin());

-- ---------- notifications ----------
DROP POLICY IF EXISTS "notifications_select_own"   ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own"   ON public.notifications;

CREATE POLICY "notifications_select_own"   ON public.notifications FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "notifications_select_admin" ON public.notifications FOR SELECT USING (is_admin());
CREATE POLICY "notifications_insert_admin" ON public.notifications FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "notifications_update_own"   ON public.notifications FOR UPDATE USING (client_id = get_client_id()) WITH CHECK (client_id = get_client_id());

-- ---------- tu_config ----------
DROP POLICY IF EXISTS "tu_config_select_authenticated" ON public.tu_config;
DROP POLICY IF EXISTS "tu_config_all_admin"            ON public.tu_config;

CREATE POLICY "tu_config_select_authenticated" ON public.tu_config FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));
CREATE POLICY "tu_config_all_admin"            ON public.tu_config FOR ALL    USING (is_admin());

-- ---------- admin_sessions ----------
DROP POLICY IF EXISTS "admin_sessions_all_admin" ON public.admin_sessions;
CREATE POLICY "admin_sessions_all_admin" ON public.admin_sessions FOR ALL USING (is_admin());

-- ---------- policy_acceptance_intents ----------
DROP POLICY IF EXISTS "acceptance_select_own"  ON public.policy_acceptance_intents;
DROP POLICY IF EXISTS "acceptance_all_admin"   ON public.policy_acceptance_intents;
DROP POLICY IF EXISTS "acceptance_insert_any"  ON public.policy_acceptance_intents;

CREATE POLICY "acceptance_select_own" ON public.policy_acceptance_intents FOR SELECT USING (client_id = get_client_id());
CREATE POLICY "acceptance_all_admin"  ON public.policy_acceptance_intents FOR ALL    USING (is_admin());
CREATE POLICY "acceptance_insert_any" ON public.policy_acceptance_intents FOR INSERT WITH CHECK (TRUE);
