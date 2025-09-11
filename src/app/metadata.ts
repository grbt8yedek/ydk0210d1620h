import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
    template: '%s | Gurbet.biz'
  },
  description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri. Güvenli ödeme, 7/24 destek.',
  keywords: [
    'uçak bileti',
    'yurt dışı seyahat',
    'otel rezervasyonu',
    'araç kiralama',
    'gurbet',
    'seyahat platformu',
    'ucuz uçak bileti',
    'havayolu bileti'
  ],
  authors: [{ name: 'Gurbet.biz' }],
  creator: 'Gurbet.biz',
  publisher: 'Gurbet.biz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gurbet.biz'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://gurbet.biz',
    siteName: 'Gurbet.biz',
    title: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
    description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gurbet.biz - Yurt Dışı Seyahat Platformu',
    description: 'Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code-here',
    yandex: 'yandex-verification-code-here',
  },
}
