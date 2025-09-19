'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    if (token) {
      checkToken()
    } else {
      setMessage('Geçersiz token.')
      setCheckingToken(false)
    }
  }, [token])

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-token?token=${token}`)
      const data = await response.json()
      
      if (data.valid) {
        setTokenValid(true)
      } else {
        setMessage('Token geçersiz veya süresi dolmuş.')
      }
    } catch (error) {
      setMessage('Token doğrulanırken hata oluştu.')
    } finally {
      setCheckingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor.')
      return
    }
    
    if (password.length < 6) {
      setMessage('Şifre en az 6 karakter olmalıdır.')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.')
        setTimeout(() => {
          window.location.href = '/giris'
        }, 2000)
      } else {
        setMessage(data.error || 'Şifre güncellenirken hata oluştu.')
      }
    } catch (error) {
      setMessage('Şifre güncellenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4">Token doğrulanıyor...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!tokenValid) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold text-red-600">Geçersiz Token</h2>
            <p className="text-gray-600">{message}</p>
            <a href="/sifremi-unuttum" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Yeni Token İste
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center">Yeni Şifre Belirle</h2>
          
          {message && (
            <div className={`p-4 rounded ${message.includes('güncellendi') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  )
}
