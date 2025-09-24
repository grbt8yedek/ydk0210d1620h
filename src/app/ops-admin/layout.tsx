import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default async function OpsAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (!session || !session.user?.email || (allow.length && !allow.includes(session.user.email.toLowerCase()))) {
    redirect('/giris');
  }

  return (
    <html lang="tr">
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>{children}</body>
    </html>
  );
}


