"use client";

import { useState, useEffect, useMemo } from 'react';
import { startOfDay } from 'date-fns';

// Demo fiyat verisi fonksiyonu (API'ye hazır)
function getDemoPrices(baseDate: Date, currency: string = "EUR") {
  // baseDate geçerli değilse bugünkü tarihi kullan
  const safeBaseDate = (baseDate instanceof Date && !isNaN(baseDate.getTime())) ? baseDate : new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(safeBaseDate);
    date.setDate(date.getDate() - 3 + i);
    const price = 90 + Math.floor(Math.abs(Math.sin(date.getTime() / 1e9)) * 60);
    return {
      date,
      price,
      currency,
    };
  });
}

// API'den fiyat çekme fonksiyonu (gelecekte kullanılacak)
async function fetchPricesFromAPI(origin: string, destination: string, baseDate: Date, currency: string = "EUR") {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const demo = getDemoPrices(baseDate, currency);
    if (!demo || demo.length === 0) throw new Error('Demo veri boş');
    return demo;
  } catch (error) {
    console.error('Fiyat çekme hatası:', error);
    // Hata durumunda demo veri döndür
    return getDemoPrices(baseDate, currency);
  }
}

interface UsePriceStateProps {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate: Date | null;
  tripType: string;
}

export function usePriceState({
  origin,
  destination,
  departureDate,
  returnDate,
  tripType
}: UsePriceStateProps) {
  // Fiyat state'leri
  const [departurePrices, setDeparturePrices] = useState<any[]>([]);
  const [returnPrices, setReturnPrices] = useState<any[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [errorPrices, setErrorPrices] = useState<string | null>(null);
  const [selectedDeparture, setSelectedDeparture] = useState<Date | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Date | null>(null);
  
  // departureDate'den stable bir değer oluştur
  const departureDateKey = useMemo(() => {
    return departureDate ? departureDate.toISOString().split('T')[0] : '';
  }, [departureDate]);
  
  const returnDateKey = useMemo(() => {
    return returnDate ? returnDate.toISOString().split('T')[0] : '';
  }, [returnDate]);

  // Mobil fiyat-tarih barı pencere başlangıcı için state
  const [mobilePriceBarStartDate, setMobilePriceBarStartDate] = useState(() => 
    startOfDay(departureDate)
  );

  // Fiyat kutuları için API entegrasyonu
  useEffect(() => {
    setLoadingPrices(true);
    setErrorPrices(null);
    (async () => {
      try {
        const prices = await fetchPricesFromAPI(origin, destination, departureDate, "EUR");
        setDeparturePrices(prices && prices.length > 0 ? prices : getDemoPrices(departureDate, "EUR"));
        if (tripType === "roundTrip" && returnDate) {
          const returnPricesData = await fetchPricesFromAPI(destination, origin, returnDate, "EUR");
          setReturnPrices(returnPricesData && returnPricesData.length > 0 ? returnPricesData : getDemoPrices(returnDate, "EUR"));
        } else {
          setReturnPrices([]);
        }
      } catch (error) {
        console.error('Fiyat çekme hatası:', error);
        setErrorPrices('Fiyatlar yüklenirken hata oluştu');
        setDeparturePrices(getDemoPrices(departureDate, "EUR"));
        if (tripType === "roundTrip" && returnDate) {
          setReturnPrices(getDemoPrices(returnDate, "EUR"));
        }
      } finally {
        setLoadingPrices(false);
      }
    })();
  }, [origin, destination, tripType, departureDateKey, returnDateKey]);

  // Otomatik olarak ortadaki günü seçili yap (ilk render'da)
  useEffect(() => {
    if (!selectedDeparture && departurePrices.length > 0) {
      // Ortadaki günü seçili yap
      setSelectedDeparture(departurePrices[3].date);
    }
  }, [departurePrices, selectedDeparture]);

  // Mobil fiyat-tarih barı pencere başlangıcı için state (tarih bazlı)
  useEffect(() => {
    // Seçili tarih değişirse pencereyi ona göre ayarla
    if (departurePrices.length > 0 && selectedDeparture) {
      setMobilePriceBarStartDate(startOfDay(selectedDeparture));
    }
  }, [departurePrices, selectedDeparture]);

  return {
    // State'ler
    departurePrices,
    returnPrices,
    loadingPrices,
    errorPrices,
    selectedDeparture,
    selectedReturn,
    mobilePriceBarStartDate,
    
    // Setter'lar
    setSelectedDeparture,
    setSelectedReturn,
    setMobilePriceBarStartDate,
  };
} 