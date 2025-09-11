'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries, Country, defaultCountry } from '@/data/countries';

interface CountryDropdownProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  className?: string;
}

export default function CountryDropdown({ selectedCountry, onCountryChange, className = '' }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Arama terimine göre ülkeleri filtrele
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Seçilen ülke gösterimi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown menü */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Arama kutusu */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kod ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                autoFocus
              />
            </div>
          </div>

          {/* Ülke listesi */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                    selectedCountry.code === country.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-mono text-gray-600">{country.phoneCode}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                Ülke bulunamadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
