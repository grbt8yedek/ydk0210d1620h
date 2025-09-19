'use client'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifre sıfırlama sistemi yeniden kurulacak.')
      } else {
        setMessage(data.error || 'Bir hata oluştu.')
      }
    } catch (error) {
      setMessage('Şifre sıfırlama sistemi yeniden kurulacak.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Şifremi Unuttum</h2>
        
        <div className="p-4 rounded bg-blue-100 text-blue-700">
          Şifre sıfırlama sistemi yeniden kurulacak. Lütfen bekleyiniz.
        </div>
        
        {message && (
          <div className={`p-4 rounded ${message.includes('kurulacak') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed"
          >
            {loading ? 'Gönderiliyor...' : 'Sistem Yeniden Kurulacak'}
          </button>
        </form>
        
        <div className="text-center">
          <a href="/giris" className="text-green-600 hover:text-green-800">
            Giriş sayfasına dön
          </a>
        </div>
      </div>
    </div>
  )
}