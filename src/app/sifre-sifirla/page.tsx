'use client'
import { useState } from 'react'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-blue-600">Sistem Yenileniyor</h2>
        <div className="p-4 rounded bg-blue-100 text-blue-700">
          <p>Şifre sıfırlama sistemi yeniden kurulacak.</p>
          <p className="mt-2">Lütfen daha sonra tekrar deneyin.</p>
        </div>
        <a href="/sifremi-unuttum" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Geri Dön
        </a>
      </div>
    </div>
  )
}