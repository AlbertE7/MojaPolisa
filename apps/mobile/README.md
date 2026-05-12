# MojaPolisa Mobile (Expo)

Aplikacja mobilna React Native + Expo. Status: **placeholder**.

Pełna implementacja zaczyna się w **kroku 14** roadmapy (po ukończeniu Web MVP).

## Setup (gdy będziesz gotowy budować mobile)

```bash
cd apps/mobile
npm install
npx expo start
```

## Struktura

- `src/app/_layout.tsx` — root layout (Stack)
- `src/app/(tabs)/_layout.tsx` — dolna nawigacja (Polisy | Kalkulator | Wniosek | Czat | Profil)
- `app.json` — konfiguracja Expo (deep linking, push, biometria)

## Funkcje do zaimplementowania

- Biometryczne logowanie (`expo-local-authentication`)
- Push notyfikacje FCM (`expo-notifications`)
- Deep linking: `finvita.pl/mojapolisa?token=XXX`
- Offline mode (cache polis)
- i18n PL/UA
