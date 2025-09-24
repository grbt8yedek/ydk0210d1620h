'use client';

import React, { useEffect, useState } from 'react';

type Campaign = {
  id: string;
  title: string;
  description?: string;
  active?: boolean;
};

export default function OpsAdminKampanyalarPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://www.grbt8.store';
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.data)) setItems(data.data as Campaign[]);
        else setItems([]);
      })
      .catch(() => setError('Kampanyalar yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Kampanyalar yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Kampanyalar</h1>
      {items.length === 0 ? (
        <div>Gösterilecek kampanya yok.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="border rounded p-3">
              <div className="font-medium">{c.title}</div>
              {c.description ? <div className="text-sm text-gray-600">{c.description}</div> : null}
              {typeof c.active === 'boolean' ? (
                <div className="text-xs mt-1">Durum: {c.active ? 'Aktif' : 'Pasif'}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


