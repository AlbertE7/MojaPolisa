export const metadata = { title: 'Logowanie' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold text-brand-600 mb-2">Logowanie</h1>
        <p className="text-sm text-gray-500 mb-6">
          Zaloguj się swoim numerem PESEL i hasłem ustawionym przy rejestracji.
        </p>

        <form className="space-y-4" aria-disabled="true">
          <div>
            <label className="label" htmlFor="pesel">
              PESEL
            </label>
            <input
              id="pesel"
              type="text"
              inputMode="numeric"
              maxLength={11}
              className="input-field"
              placeholder="11 cyfr"
              disabled
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              disabled
            />
          </div>
          <button type="button" className="btn-primary w-full" disabled>
            Zaloguj się (wkrótce)
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Pełna implementacja logowania – krok 3 roadmapy.
          <br />
          Nie masz jeszcze polisy?{' '}
          <a href="/kalkulator/wariant-a" className="text-brand-600 hover:underline">
            Zacznij od kalkulatora →
          </a>
        </p>
      </div>
    </div>
  )
}
