import React from 'react';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default function AdminGirisLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
