-- ============================================================
-- MojaPolisa – BOOTSTRAP (uruchom PO schema.sql)
-- Tworzy konto admina i ustawia klucz szyfrowania
-- ============================================================

-- KROK 1: Zapisz klucz szyfrowania jako parametr bazy
-- Wartość musi się ZGADZAĆ z ENCRYPTION_KEY w .env.local
ALTER DATABASE postgres SET app.encryption_key = '8HqcDz4MegVhldOzyfMgOwqiqu90jroEwhmvlplYrvk=';

-- ============================================================
-- KROK 2: Utwórz konto admina
-- ============================================================
-- DANE LOGOWANIA (wygenerowane losowo, ZMIEŃ przy pierwszym logowaniu):
--   Email:  admin@mojapolisa.local
--   Hasło:  rYS84ywcDeJUFZjrg5yqI6fW
--
-- UWAGA: w Supabase Auth najlepiej utworzyć usera ręcznie przez:
-- Dashboard → Authentication → Users → Add user (z hasłem) → Email Confirmed = TRUE
-- A potem uruchomić poniższe UPDATE aby nadać rolę admina:

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data ||
  jsonb_build_object('role', 'admin', 'agent_email', 'agent@epro-polska.pl')
WHERE email = 'admin@mojapolisa.local';

-- Weryfikacja:
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'admin@mojapolisa.local';

-- ============================================================
-- KROK 3: Seed bibliotek dokumentów (przykłady – wgraj prawdziwe PDF przez panel)
-- ============================================================

INSERT INTO public.documents_library (product_type, doc_type, name, file_url, version)
VALUES
  ('life_a',  'owu', 'OWU Wariant A – Ochrona życia',         '/placeholder/owu-A.pdf',  '1.0'),
  ('life_a',  'kid', 'KID Wariant A – Karta produktu',        '/placeholder/kid-A.pdf',  '1.0'),
  ('life_b',  'owu', 'OWU Wariant B – Zdrowie i życie',       '/placeholder/owu-B.pdf',  '1.0'),
  ('life_b',  'kid', 'KID Wariant B – Karta produktu',        '/placeholder/kid-B.pdf',  '1.0')
ON CONFLICT DO NOTHING;
