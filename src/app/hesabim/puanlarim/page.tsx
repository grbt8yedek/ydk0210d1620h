'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PuanlarimPage() {
  const router = useRouter();

  useEffect(() => {
    // Bu sayfa geçici olarak gizlendi, hesabım sayfasına yönlendir
    router.push('/hesabim');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h1>
        <p className="text-gray-600">Bu sayfa geçici olarak gizlenmiştir.</p>
      </div>
    </div>
  );
} 