'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminGiris() {
  const [email, setEmail] = useState(''); // Email
  const [password, setPassword] = useState(''); // Şifre
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
    <div className="min-h-screen bg-white relative">
      {/* Sol alt köşede giriş formu */}
      <div className="absolute bottom-8 left-8 w-80 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Admin Giriş
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@grbt8.store"
              required
            />
          </div>

          {/* Şifre alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GRBT8Admin2025!"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Bilgi */}
        <div className="mt-4 text-xs text-gray-500">
          Admin paneli erişimi için giriş yapın
        </div>
      </div>

      {/* Sayfa ortasında içerik */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">
            GRBT-8 Admin Panel
          </h1>
          <p className="text-lg text-gray-400">
            Sistem yönetimi ve izleme
          </p>
          <div className="mt-8 text-sm text-gray-500">
            Güvenlik protokolleri aktif
          </div>
        </div>
      </div>
    </div>
  );
}
