'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminGiris() {
  const [password, setPassword] = useState(''); // Aslında ID
  const [id, setId] = useState(''); // Aslında şifre
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sasirtmaca: password aslında ID, id aslında şifre
      const result = await signIn('credentials', {
        email: password, // Gerçek ID
        password: id,    // Gerçek şifre
        redirect: false,
      });

      if (result?.error) {
        setError('Giriş başarısız. Bilgileri kontrol edin.');
      } else {
        router.push('/grbt-8/monitor');
      }
    } catch (error) {
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sol alt köşede sahte giriş formu */}
      <div className="absolute bottom-8 left-8 w-80 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Admin Giriş
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Üstteki kutu: "Şifre" (aslında ID) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Şifrenizi girin"
              required
            />
          </div>

          {/* Alttaki kutu: "ID" (aslında şifre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="password"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ID'nizi girin"
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

        {/* Sahte bilgi */}
        <div className="mt-4 text-xs text-gray-500">
          Güvenlik için iki faktörlü doğrulama gerekebilir
        </div>
      </div>

      {/* Sayfa ortasında sahte içerik */}
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
