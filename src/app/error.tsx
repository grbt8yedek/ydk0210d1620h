'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Global error boundary', { error })
  }, [error])

  const handleReset = () => {
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bir şeyler yanlış gitti
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    </div>
  )
} 