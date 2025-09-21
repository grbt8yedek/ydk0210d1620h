'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const [tokenValid, setTokenValid] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    if (token) {
      checkToken()
    } else {
      setMessage('Geçersiz şifre sıfırlama linki.')
      setMessageType('error')
      setCheckingToken(false)
    }
  }, [token])

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-token?token=${token}`)
      const data = await response.json()
      
      if (data.valid) {
        setTokenValid(true)
        setMessage('')
      } else {
        setMessage(data.error || 'Token geçersiz veya süresi dolmuş.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      setMessage('Token doğrulanırken hata oluştu.')
      setMessageType('error')
    } finally {
      setCheckingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor.')
      setMessageType('error')
      return
    }
    
    // Güçlü şifre kontrolü
    if (password.length < 8) {
      setMessage('Şifre en az 8 karakter olmalıdır.')
      setMessageType('error')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setMessage('Şifre en az bir büyük harf içermelidir.')
      setMessageType('error')
      return
    }
    if (!/[a-z]/.test(password)) {
      setMessage('Şifre en az bir küçük harf içermelidir.')
      setMessageType('error')
      return
    }
    if (!/\d/.test(password)) {
      setMessage('Şifre en az bir rakam içermelidir.')
      setMessageType('error')
      return
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setMessage('Şifre en az bir özel karakter içermelidir.')
      setMessageType('error')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...')
        setMessageType('success')
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/giris'
        }, 3000)
      } else {
        setMessage(data.error || 'Şifre güncellenirken hata oluştu.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setMessage('Bağlantı hatası. Lütfen daha sonra tekrar deneyin.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Token kontrol ediliyor
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Token doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  // Token geçersiz
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600">Geçersiz Token</h2>
          <p className="text-gray-600">{message}</p>
          <div className="space-y-3">
            <a 
              href="/sifremi-unuttum" 
              className="inline-block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            >
              Yeni Token İste
            </a>
            <a 
              href="/giris" 
              className="inline-block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium"
            >
              Giriş Sayfasına Dön
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Şifre sıfırlama formu
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Yeni Şifre Belirle</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lütfen yeni şifrenizi girin
          </p>
        </div>
        
        {message && (
          <div className={`p-4 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="En az 6 karakter"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Şifrenizi tekrar girin"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Güncelleniyor...
              </div>
            ) : (
              'Şifreyi Güncelle'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}