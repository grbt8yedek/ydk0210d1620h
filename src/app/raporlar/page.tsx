'use client';

import React from 'react';

export default function RaporlarPage() {
  const adminReportsUrl = 'https://www.grbt8.store/raporlar';

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Raporlar</h1>
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <iframe
          title="Admin Raporlar"
          src={adminReportsUrl}
          className="w-full"
          style={{ minHeight: '80vh', border: '0' }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Bu sayfa yönetim panelindeki raporları gösterir. İçerik güvenlik amacıyla kısıtlı izlerle iframe içinde yüklenir.
      </p>
    </div>
  );
}


