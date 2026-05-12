# MojaPolisa – Ubezpieczenia Online

Platforma ubezpieczeniowa osadzona pod **finvita.pl/mojapolisa**. Monorepo Turborepo
z aplikacją Next.js 14 (web + panel admina), aplikacją mobilną React Native (Expo),
backendem Supabase (RODO, EU Frankfurt) oraz powiadomieniami FCM i emailami Resend.

> **Zasada nadrzędna**: nigdzie po stronie klienckiej nie używamy nazw towarzystw
> ubezpieczeniowych ani ich znaków towarowych. Produkty nazywamy „Wariant A – Ochrona
> życia" i „Wariant B – Zdrowie i życie". Wszystkie kalkulatory są opisane jako
> **poglądowe** (nie stanowią oferty handlowej w rozumieniu KNF).

## Architektura

```
mojapolisa/
├── apps/
│   ├── web/          → Next.js 14 (App Router, TypeScript, Tailwind)
│   │                   • finvita.pl/mojapolisa
│   │                   • panel admina finvita.pl/mojapolisa/admin
│   └── mobile/       → React Native + Expo (placeholder – kod w kroku 14)
├── packages/
│   ├── shared/       → typy TypeScript, helpery (PESEL, kalkulator), stałe
│   └── ui/           → wspólne komponenty (StatusBadge, Disclaimer)
├── supabase/
│   └── schema.sql    → pełny schemat z RLS, gotowy do wklejenia
├── .env.example      → wszystkie wymagane zmienne środowiskowe
├── netlify.toml      → konfiguracja deploymentu Next.js
├── turbo.json        → Turborepo
└── package.json      → workspace root
```

## Stack

| Warstwa            | Technologia                                |
| ------------------ | ------------------------------------------ |
| Frontend web/admin | Next.js 14, Tailwind, TypeScript           |
| Mobile             | React Native + Expo (router + secure-store)|
| Backend            | Supabase (Postgres + Auth + Storage + RLS) |
| Push               | Firebase Cloud Messaging                   |
| Email              | Resend                                     |
| OCR (przyszłość)   | Google Cloud Vision                        |
| i18n               | react-i18next (PL / UA)                    |
| Hosting            | Netlify (web) + Expo EAS (mobile)          |

## Setup – pierwsze uruchomienie

### 1. Wymagania

- Node.js 20+
- npm 10+
- Konto Supabase (https://app.supabase.com) – projekt w regionie **Frankfurt (eu-central-1)**
- Konto Resend (https://resend.com) z domeną `finvita.pl` zweryfikowaną przez DNS
- Konto Firebase (https://console.firebase.google.com) – projekt z FCM

### 2. Klonuj i zainstaluj zależności

```bash
git clone <repo-url>
cd mojapolisa
npm install
```

### 3. Zmienne środowiskowe

```bash
cp .env.example apps/web/.env.local
# Uzupełnij wartości – instrukcje w komentarzach .env.example
```

### 4. Supabase

1. Otwórz **Supabase Dashboard → Project → SQL Editor**.
2. Wklej całą zawartość `supabase/schema.sql` i uruchom.
3. W **Settings → Vault** dodaj sekret `app.encryption_key`
   (wygeneruj: `openssl rand -base64 32`).
4. W **Authentication → Providers** włącz `email` (z hasłem).
5. (Opcjonalnie) Włącz `pg_cron` w **Database → Extensions** i odkomentuj
   blok CRON w `schema.sql` aby aktywować alerty o kończących się polisach.

### 5. Konto admina

W Supabase Auth utwórz pierwszego usera admina (np. `admin@epro-polska.pl`)
i w **Authentication → Users → Edit** ustaw `raw_app_meta_data`:

```json
{ "role": "admin" }
```

To odblokuje dostęp do `/mojapolisa/admin`.

### 6. Uruchomienie lokalne

```bash
# Web (port 3000): http://localhost:3000/mojapolisa
npm run dev:web

# Wszystko (web + mobile, gdy aktywne)
npm run dev
```

### 7. Deployment na Netlify

Repo jest podpięte pod GitHub. Push do `main` triggeruje build.
Netlify używa `netlify.toml` w katalogu głównym monorepo.

W **Netlify → Site settings → Environment variables** dodaj wszystkie zmienne z `.env.example`
(bez `EXPO_*` – te zostają w EAS Build dla mobile).

> **Uwaga**: aplikacja serwuje się pod `/mojapolisa` dzięki `basePath` w
> `next.config.js`. Możesz osadzić ją obok statycznego `finvita.pl` jako
> osobny Netlify site z domeną zaaliasowaną na ścieżkę lub jako jedyny
> site domeny `finvita.pl` (zależy od konfiguracji DNS).

## Roadmapa (kolejność budowania)

1. ✅ **Setup monorepo + Supabase schema + .env.example + layout** (TY JESTEŚ TUTAJ)
2. ⏳ Layout `/mojapolisa` z nawigacją i footerem
3. Panel admina: logowanie + dashboard
4. Kalkulator Wariant A (web)
5. ANK (formularz z walidacją)
6. Flow wniosku Wariant A + ankieta medyczna
7. Integracja Resend
8. Panel admina: lista klientów + dodawanie polisy
9. Push FCM (web first)
10. Czat real-time (Supabase Realtime)
11. Kalkulator Wariant B + flow wniosku
12. Kalkulatory OC/AC i majątek + wnioski
13. Moduł szkodowy
14. React Native Expo – portowanie na mobile
15. Moduł inwestycyjny
16. Deep link system
17. Testy + App Store/Google Play

## Compliance

- **RODO**: hosting w UE (Frankfurt), AES-256 dla danych wrażliwych, prawo do bycia
  zapomnianym, eksport danych
- **IDD**: ANK archiwizowana 5 lat z timestampem i IP
- **KNF**: kalkulatory oznaczone jako poglądowe, bez gwarantowania wyniku
- **App Store / Google Play**: privacy manifest, deklaracja zbieranych danych

## Wsparcie

Pytania produktowe i decyzje biznesowe – kierować do agenta prowadzącego projekt.
Sprawy techniczne – issues w GitHub.

---

© Finvita / EPRO Sp. z o.o.
