-- ============================================================
-- KROK 5/5 — Bootstrap: nadanie roli admina + seed dokumentów
-- ============================================================

-- UWAGA O SZYFROWANIU:
-- W Supabase nie ma uprawnień superuser, więc nie da się ustawić
-- `app.encryption_key` przez ALTER DATABASE. To OK — w MVP PESEL jest
-- chroniony przez RLS (nikt poza adminem i właścicielem go nie widzi).
-- Pełne szyfrowanie kolumny dodaj przed produkcją przez Supabase Vault:
--   Settings → Vault → Add Secret → name: encryption_key, value: <z .env.local>
-- Potem zamień encrypt_sensitive()/decrypt_sensitive() na wersję
-- czytającą z vault (vault.decrypted_secrets).

-- ---------- Nadaj rolę admina ----------
-- WAŻNE: utwórz najpierw konto w Supabase Dashboard:
--   Authentication → Users → Add user → Create new user
--     Email:           admin@mojapolisa.local
--     Password:        rYS84ywcDeJUFZjrg5yqI6fW
--     Auto Confirm User: ✓ ZAZNACZONE
-- Dopiero PO utworzeniu konta uruchom poniższy UPDATE.

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  jsonb_build_object('role', 'admin', 'agent_email', 'agent@epro-polska.pl')
WHERE email = 'admin@mojapolisa.local';

-- Weryfikacja — powinieneś zobaczyć 1 wiersz z role='admin'
SELECT email, raw_app_meta_data->>'role' AS role, raw_app_meta_data
FROM auth.users
WHERE email = 'admin@mojapolisa.local';

-- ---------- Seed: przykładowe dokumenty w bibliotece ----------
INSERT INTO public.documents_library (product_type, doc_type, name, file_url, version) VALUES
  ('life_a', 'owu', 'OWU Wariant A – Ochrona życia',   '/placeholder/owu-A.pdf', '1.0'),
  ('life_a', 'kid', 'KID Wariant A – Karta produktu',  '/placeholder/kid-A.pdf', '1.0'),
  ('life_b', 'owu', 'OWU Wariant B – Zdrowie i życie', '/placeholder/owu-B.pdf', '1.0'),
  ('life_b', 'kid', 'KID Wariant B – Karta produktu',  '/placeholder/kid-B.pdf', '1.0')
ON CONFLICT DO NOTHING;
