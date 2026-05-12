import { redirect } from 'next/navigation'

// Wariant B został zunifikowany z Wariant A jako jeden kalkulator
// "Ubezpieczenie na życie i zdrowie". Stare linki przekierowują.
export default function WariantBRedirect() {
  redirect('/kalkulator/wariant-a')
}
