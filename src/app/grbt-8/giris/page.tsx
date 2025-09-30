'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminGiris() {
  const [email, setEmail] = useState(''); // Email
  const [password, setPassword] = useState(''); // Şifre
  const [pin, setPin] = useState(''); // PIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // PIN kontrolü - SERVER-SIDE (güvenli)
      const pinResponse = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const pinData = await pinResponse.json();

      if (!pinData.success) {
        setError(pinData.message || 'Geçersiz PIN');
        setLoading(false);
        return;
      }

      // NextAuth ile giriş yap
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Giriş başarısız. Bilgileri kontrol edin.');
      } else {
        // Başarılı giriş - raporlar sayfasına yönlendir
        router.push('/grbt-8/raporlar');
      }
    } catch (error) {
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-80 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN alanı */}
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="PIN"
              maxLength={6}
              required
            />
          </div>

          {/* Email alanı */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Şifre alanı */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 border border-gray-300"
          >
            {loading ? '...' : ''}
          </button>
        </form>
      </div>
    </div>
  );
}
