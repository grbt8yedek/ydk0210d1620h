'use client';

import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';

export default function GirisPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Giriş Yap</h2>
        <div className="text-center">
          <a href="/sifremi-unuttum" className="text-green-600 hover:text-green-800">
            Şifremi Unuttum
          </a>
        </div>
        <LoginModal isOpen={true} onClose={() => router.push('/')} />
      </div>
    </div>
  );
}