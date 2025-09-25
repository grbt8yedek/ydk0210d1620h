import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AlertBadge from './AlertBadge';
import LayoutProvider from './layout-provider';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default async function OpsAdminLayout({ children }: { children: React.ReactNode }) {
  const bypass = (process.env.ADMIN_BYPASS || '').toLowerCase() === 'true';
  const session = await getServerSession(authOptions);
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (!bypass && (!session || !session.user?.email || (allow.length && !allow.includes(session.user.email.toLowerCase())))) {
    redirect('/grbt-8/giris');
  }

  return (
    <html lang="tr">
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <LayoutProvider>
          <div className="min-h-screen flex">
            <aside className="w-56 border-r p-4">
              <div className="text-sm text-gray-500 mb-1">GRBT-8</div>
              <AlertBadge />
              <nav className="flex flex-col gap-2">
                <a href="/grbt-8/raporlar" className="hover:underline">Raporlar</a>
                <a href="/grbt-8/kampanyalar" className="hover:underline">Kampanyalar</a>
                <a href="/grbt-8/monitor" className="hover:underline">Monitor</a>
              </nav>
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </LayoutProvider>
      </body>
    </html>
  );
}


