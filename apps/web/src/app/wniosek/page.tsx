import { Suspense } from 'react'
import { ApplicationFlow } from '@/components/forms/ApplicationFlow'

export const metadata = { title: 'Wniosek ubezpieczeniowy' }

export default function WniosekPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Suspense fallback={<div className="card">Ładowanie...</div>}>
          <ApplicationFlow />
        </Suspense>
      </div>
    </div>
  )
}
