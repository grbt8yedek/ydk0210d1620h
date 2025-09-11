export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Gurbet.biz",
  "url": "https://gurbet.biz",
  "logo": "https://gurbet.biz/images/logo.png",
  "description": "Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-XXX-XXX-XXXX",
    "contactType": "customer service",
    "availableLanguage": "Turkish"
  },
  "sameAs": [
    "https://www.facebook.com/gurbetbiz",
    "https://www.twitter.com/gurbetbiz",
    "https://www.instagram.com/gurbetbiz"
  ]
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Gurbet.biz",
  "url": "https://gurbet.biz",
  "description": "Yurt dışı seyahatleriniz için en uygun fiyatlı uçak bileti, otel ve araç kiralama hizmetleri.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gurbet.biz/flights/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})
