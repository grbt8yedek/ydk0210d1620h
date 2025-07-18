'use client';

import { useState, useEffect, useRef } from 'react';
import { PlaneLanding, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AirportInput from '@/components/AirportInput';
import TripTypeSelector from '@/components/TripTypeSelector';
import PassengerSelector from '@/components/PassengerSelector';
import ServiceButtons from '@/components/ServiceButtons';
import AppBanner from '@/components/AppBanner';
import FlightSearchForm from '@/components/FlightSearchForm';
import HeroSection from '@/components/HeroSection';
import CampaignsSection from '@/components/CampaignsSection';
import dynamic from 'next/dynamic';
import 'react-datepicker/dist/react-datepicker.css';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';

// Type tanımları
interface Airport {
  code: string;
  name: string;
  city: string;
}

const DateInput = dynamic(() => import('@/components/DateInput'), { ssr: false });

export default function Home() {
  // Form state'leri
  const [tripType, setTripType] = useState('oneWay');
  const [directOnly, setDirectOnly] = useState(false);
  const [fromAirports, setFromAirports] = useState<Airport[]>([]);
  const [toAirports, setToAirports] = useState<Airport[]>([]);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Havaalanı önerileri state'leri - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Yeni yolcu state'leri
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Mobil öneri listelerini kapatmak için ref'ler - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Gidiş-dönüş için mobilde otomatik dönüş tarihi açma
  const [autoOpenReturn, setAutoOpenReturn] = useState(false);

  // Gidiş tarihi değişince dönüş input'unu aç
  const handleDepartureChange = (date: Date | undefined) => {
    setDepartureDate(date);
    if (tripType === 'roundTrip' && isMobile()) {
      setAutoOpenReturn(true);
    }
  };

  // Yardımcı fonksiyon
  function isMobile() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  }

  // Mobil öneri listelerini kapatmak için useEffect - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Havaalanı değiştirme fonksiyonu
  const swapAirports = () => {
    const tempFrom = fromAirports;
    const tempTo = toAirports;
    const tempFromInput = fromInput;
    const tempToInput = toInput;
    
    setFromAirports(tempTo);
    setToAirports(tempFrom);
    setFromInput(tempToInput);
    setToInput(tempFromInput);
  };

  // Havaalanı arama fonksiyonu - KALDIRILDI, AirportInput component'inde yönetiliyor

  // Uçuş arama fonksiyonu
  const searchFlights = async () => {
    if (!fromAirports.length || !toAirports.length || !departureDate) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsLoading(true);

    try {
      const searchParams = {
        origin: fromAirports.map(a => a.code).join(','),
        destination: toAirports.map(a => a.code).join(','),
        departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
        returnDate: tripType === 'roundTrip' && returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
        passengers: adultCount + childCount + infantCount,
        tripType: tripType,
        directOnly: directOnly
      };

      console.log('Uçuş arama parametreleri:', searchParams);

      // Şimdilik demo - gerçek API entegrasyonu yapılacak
      // const response = await fetch('/api/flights/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(searchParams)
      // });
      // const data = await response.json();

      // Demo için 2 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // URLSearchParams için null değerleri filtrele
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });

      // Uçuş sonuçları sayfasına yönlendir
      window.location.href = `/flights/search?${params.toString()}`;

    } catch (error) {
      console.error('Uçuş arama hatası:', error);
      alert('Uçuş arama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full">
      <Header />
      <div className="relative overflow-x-hidden max-w-full">
        {/* Hero Section - Yeşil alan ve Service Icons */}
        <HeroSection />
        {/* Beyaz alan ve içerik */}
        <div className="bg-white min-h-screen pt-6">
          {/* Uçuş Arama Formu - Hem Mobil Hem Masaüstü */}
          <FlightSearchForm
            tripType={tripType}
            onTripTypeChange={setTripType}
            directOnly={directOnly}
            onDirectOnlyChange={setDirectOnly}
            fromAirports={fromAirports}
            toAirports={toAirports}
            fromInput={fromInput}
            toInput={toInput}
            onFromInputChange={setFromInput}
            onToInputChange={setToInput}
            onFromAirportSelect={(airport) => setFromAirports([airport])}
            onToAirportSelect={(airport) => setToAirports([airport])}
            departureDate={departureDate}
            returnDate={returnDate}
            onDepartureDateChange={handleDepartureChange}
            onReturnDateChange={setReturnDate}
            adultCount={adultCount}
            childCount={childCount}
            infantCount={infantCount}
            onPassengerModalOpen={() => setShowPassengerModal(true)}
            isLoading={isLoading}
            onSearch={searchFlights}
            onSwapAirports={swapAirports}
          />

          {/* İşlem Butonları */}
          <ServiceButtons />

          {/* Uygulama Banner - Hem Mobil Hem Masaüstü */}
          <AppBanner />

          {/* Kampanyalar Bölümü */}
          <CampaignsSection />

          {/* Yolcu Seçimi Modalı - Hem Mobil Hem Masaüstü */}
          <PassengerSelector
            isOpen={showPassengerModal}
            onClose={() => setShowPassengerModal(false)}
            adultCount={adultCount}
            childCount={childCount}
            infantCount={infantCount}
            onAdultCountChange={setAdultCount}
            onChildCountChange={setChildCount}
            onInfantCountChange={setInfantCount}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
