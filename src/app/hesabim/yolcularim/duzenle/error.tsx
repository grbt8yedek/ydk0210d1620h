'use client';

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function YolcuDuzenleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Yolcu düzenleme sayfası hatası', { error });
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href="/hesabim/yolcularim"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl text-gray-700 font-medium">
              Yolcu Düzenle
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Bir Hata Oluştu
            </h2>
            <p className="text-gray-500 mb-6">
              Yolcu bilgileri yüklenirken veya güncellenirken bir sorun oluştu.
            </p>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={reset}
                className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Tekrar Dene
              </button>
              <Link
                href="/hesabim/yolcularim"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Yolcularım Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 