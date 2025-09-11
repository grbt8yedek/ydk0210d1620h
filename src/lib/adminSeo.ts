// Admin Panel SEO Ayarları
export const adminSeoSettings = {
  // Admin paneli arama motorlarından gizle
  robots: {
    index: false,
    follow: false,
  },
  
  // Admin sayfaları için özel metadata
  metadata: {
    title: 'Admin Panel - Gurbet.biz',
    description: 'Gurbet.biz yönetim paneli',
    robots: 'noindex, nofollow',
  },
  
  // Admin paneli için özel layout
  layout: {
    noIndex: true,
    noFollow: true,
    noArchive: true,
    noSnippet: true,
  }
}

// Admin paneli için middleware
export const adminMiddleware = {
  // /admin/* rotalarını arama motorlarından gizle
  robots: 'noindex, nofollow',
  
  // Admin paneli için özel headers
  headers: {
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  }
}
