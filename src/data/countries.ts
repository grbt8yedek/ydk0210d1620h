export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', phoneCode: '+90' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'BE', name: 'Belçika', flag: '🇧🇪', phoneCode: '+32' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'DK', name: 'Danimarka', flag: '🇩🇰', phoneCode: '+45' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'SE', name: 'İsveç', flag: '🇸🇪', phoneCode: '+46' },
  { code: 'CH', name: 'İsviçre', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'AT', name: 'Avusturya', flag: '🇦🇹', phoneCode: '+43' },
];

// Türkiye'yi varsayılan olarak ilk sıraya koy
export const defaultCountry = countries.find(country => country.code === 'TR') || countries[0];

// Telefon koduna göre ülke bulma fonksiyonu
export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};

// Ülke koduna göre ülke bulma fonksiyonu
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};
