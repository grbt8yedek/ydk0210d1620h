/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Sadece gerçekten kullanılan dosyalar
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    // Diğer dosyaları kaldırdık - sadece component'lerde kullanılan CSS'ler kalacak
  ],
  // Agresif purging için
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    options: {
      // Daha agresif temizlik
      keyframes: true,
      fontFace: true,
      variables: true,
      // String birleştirmeleri için
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }
  },
  // Minimal safelist - sadece kritik dinamik class'lar
  safelist: [
    // Sadece gerçekten kullanılan dinamik class'lar
    'bg-green-500', 'bg-red-500', 'bg-blue-500', // Ana renkler
    'text-green-500', 'text-red-500', 'text-blue-500',
    'border-green-500', 'border-red-500', 'border-blue-500',
    // Grid - sadece kullanılanlar
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    // Size - sadece kullanılanlar  
    'w-full', 'h-full', 'w-1/2', 'h-1/2',
    // Flight search specific
    'flight-search-input',
    // Modal specific
    'modal-backdrop', 'modal-content',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

