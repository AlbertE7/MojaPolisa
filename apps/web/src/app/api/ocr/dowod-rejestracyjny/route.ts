import { NextResponse, type NextRequest } from 'next/server'

/**
 * Moduł 5.3 update: OCR skanu dowodu rejestracyjnego.
 *
 * Placeholder na integrację z Google Cloud Vision API.
 * GOOGLE_CLOUD_VISION_API_KEY jest już w .env.example.
 *
 * Pełna implementacja:
 * 1. Przyjmij file z FormData
 * 2. Wyślij do GCV: documentTextDetection
 * 3. Sparsuj polski dowód rejestracyjny (regex na pole A/D/E/P)
 * 4. Zwróć ustrukturyzowane dane
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Brak pliku' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Plik za duży (maks. 10MB)' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Nieobsługiwany format pliku' }, { status: 400 })
    }

    // TODO: prawdziwe wywołanie Google Cloud Vision
    // const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
    // ...

    // STUB: zwracamy przykładowe dane, żeby front mógł działać
    await new Promise((r) => setTimeout(r, 1200))

    return NextResponse.json({
      success: true,
      stub: true,
      message: 'OCR jest w trybie demonstracyjnym. Po podłączeniu Google Cloud Vision pola będą wypełniane automatycznie.',
      data: {
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2018,
        engineCapacity: 1598,
        vin: 'WVWZZZ1KZJW000000',
        registrationNumber: 'WA12345',
      },
    })
  } catch (err) {
    console.error('[OCR] error', err)
    return NextResponse.json({ error: 'Błąd OCR' }, { status: 500 })
  }
}
