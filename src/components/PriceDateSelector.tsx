"use client";

import React from 'react';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PlaneTakeoff, Loader2 } from 'lucide-react';

interface PriceDateSelectorProps {
  // Temel veriler
  origin: string;
  destination: string;
  departurePrices: Array<{ date: Date; price: number; currency: string }>;
  selectedDeparture: Date | null;
  onDateSelect: (date: Date) => void;
  
  // Loading ve error durumları
  loadingPrices: boolean;
  errorPrices: string | null;
  
  // Mobil için özel state'ler
  mobilePriceBarStartDate: Date;
  onMobilePriceBarStartDateChange: (date: Date) => void;
  
  // Trip type (round trip için)
  tripType?: string;
  onStepChange?: (step: "departure" | "return") => void;
}

export default function PriceDateSelector({
  origin,
  destination,
  departurePrices,
  selectedDeparture,
  onDateSelect,
  loadingPrices,
  errorPrices,
  mobilePriceBarStartDate,
  onMobilePriceBarStartDateChange,
  tripType = 'oneWay',
  onStepChange
}: PriceDateSelectorProps) {
  
  // Desktop için bar chart content oluşturma
  const createBarChartContent = () => {
    if (departurePrices.length === 0) return null;
    
    const prices = departurePrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const getBarHeight = (price: number) => {
      if (maxPrice === minPrice) return 92;
      const norm = (price - minPrice) / (maxPrice - minPrice);
      return 72 + Math.sqrt(norm) * 40;
    };
    
    return departurePrices.map(({ date, price, currency }) => {
      const isSelected = selectedDeparture ? isSameDay(date, selectedDeparture) : false;
      const barHeight = getBarHeight(price);
      const dayStr = format(date, "dd MMM", { locale: tr });
      const weekDay = format(date, "EEE", { locale: tr });
      
      return (
        <button
          key={date.toISOString()}
          onClick={() => {
            onDateSelect(date);
            if (tripType === "roundTrip" && onStepChange) {
              onStepChange("return");
            }
          }}
          className={`flex flex-col items-center min-w-[56px] w-14 pt-0 pb-0 rounded-b-2xl border-0 bg-transparent transition-all duration-200 cursor-pointer select-none group items-end
            ${isSelected ? "scale-105 border-b-4 border-green-500" : "hover:scale-105"}
          `}
          style={{ outline: 'none' }}
        >
          {/* Fiyat barın üstünde */}
          <span className={`text-lg font-bold mb-2 ${isSelected ? "text-green-700" : "text-gray-700"}`}>{price.toLocaleString()} €</span>
          {/* Bar */}
          <div className={`w-14 flex flex-col items-center justify-end rounded-t-xl transition-all duration-200 mb-1
            ${isSelected ? "bg-green-700 shadow-lg" : "bg-green-400/90 group-hover:bg-green-500"}
          `}
            style={{ height: barHeight }}
          >
          </div>
          {/* Tarih ve gün */}
          <span className={`mt-1 text-sm font-semibold leading-tight ${isSelected ? "text-green-700" : "text-gray-700"}`}>{dayStr}</span>
          <span className={`text-xs ${isSelected ? "text-green-600 font-bold" : "text-gray-400"}`}>{weekDay}</span>
        </button>
      );
    });
  };

  // Mobil için tarih kartları oluşturma
  const createMobileDateCards = () => {
    if (loadingPrices) {
      return (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      );
    }
    
    if (errorPrices) {
      return <div className="text-red-500 text-sm">{errorPrices}</div>;
    }
    
    const today = new Date();
    // 7 gün üret
    const days = Array.from({ length: 7 }, (_, i) => addDays(mobilePriceBarStartDate, i));
    
    return days.map((date, idx) => {
      // departurePrices'da bu güne ait fiyat var mı?
      const found = departurePrices.find(p => isSameDay(p.date, date));
      const price = found ? found.price : null;
      const currency = found ? found.currency : null;
      const isSelected = selectedDeparture ? isSameDay(date, selectedDeparture) : false;
      const isToday = isSameDay(date, today);
      const dayNum = format(date, "d", { locale: tr });
      const weekDay = format(date, "EEE", { locale: tr });
      
      // Fiyat kutusu
      let priceBox = (
        <span className={`w-full px-2.5 py-1 text-center text-[13px] font-normal mb-1 rounded-none whitespace-nowrap flex items-center justify-center ${isSelected ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
          {price !== null ? (<>{price.toLocaleString()} <span className="ml-0.5 text-[13px]">€</span></>) : <span className="opacity-50">-</span>}
        </span>
      );
      
      // Tarih ve gün stilleri
      let dayClass = 'text-[15px] font-semibold leading-tight';
      let weekClass = 'text-xs';
      if (isSelected) {
        dayClass += ' text-green-600 font-bold';
        weekClass += ' text-green-600 font-bold';
      } else if (isToday) {
        dayClass += ' text-blue-600 font-bold';
        weekClass += ' text-blue-600 font-bold';
      } else {
        dayClass += ' text-gray-700';
        weekClass += ' text-gray-400';
      }
      
      return (
        <React.Fragment key={date.toISOString()}>
          <div className="flex flex-col items-center min-w-[48px] px-0 py-0 mx-0 focus:outline-none" style={{scrollSnapAlign: 'center'}} onClick={() => onDateSelect(date)}>
            {priceBox}
            <span className={dayClass}>{dayNum}</span>
            <span className={weekClass}>{weekDay}</span>
          </div>
          {idx !== days.length - 1 && (
            <div className="h-7 w-2 bg-white rounded-sm" />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="mt-1 mb-1 md:mt-6 md:mb-6">
      {/* Mobil özel fiyat-tarih kutuları */}
      <div className="md:hidden flex flex-col items-center w-full">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center w-full justify-center gap-2 relative">
            <button 
              className="absolute left-0 z-10 bg-white rounded-full p-1 shadow-md" 
              style={{top: '50%', transform: 'translateY(-50%)'}}
              onClick={() => {
                onMobilePriceBarStartDateChange(subDays(mobilePriceBarStartDate, 7));
              }}
            >
              <span className="text-green-600 text-2xl">&#60;</span>
            </button>
            
            <div 
              id="mobile-date-scroll" 
              className="flex gap-0 overflow-x-auto no-scrollbar px-8 py-2 w-full" 
              style={{scrollSnapType: 'x mandatory'}}
            >
              {createMobileDateCards()}
            </div>
            
            <button 
              className="absolute right-0 z-10 bg-white rounded-full p-1 shadow-md" 
              style={{top: '50%', transform: 'translateY(-50%)'}}
              onClick={() => {
                onMobilePriceBarStartDateChange(addDays(mobilePriceBarStartDate, 7));
              }}
            >
              <span className="text-green-600 text-2xl">&#62;</span>
            </button>
          </div>
          
          {/* Ay adı ve çizgiler */}
          <div className="flex items-center w-full mt-1 mb-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-3 text-sm text-gray-700 font-semibold" style={{whiteSpace:'nowrap'}}>
              {format(mobilePriceBarStartDate, 'MMMM', { locale: tr })}
            </div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-800">Gidiş Uçuşları</span>
        </div>
        <div className="text-gray-500 text-sm mt-0 mb-1">{origin} → {destination}</div>
      </div>
      
      {/* Desktop eski barChartContent */}
      <div className="hidden md:flex flex-col items-center w-full">
        <div className="flex-grow flex gap-6 mt-0 overflow-x-auto pb-2 items-end justify-center w-full">
          {loadingPrices ? (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : errorPrices ? (
            <div className="text-red-500 text-sm">{errorPrices}</div>
          ) : (
            createBarChartContent()
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <PlaneTakeoff className="w-6 h-6 text-green-600" />
          <span className="text-lg font-bold text-gray-800">Gidiş Tarihi Seçimi</span>
        </div>
        <div className="text-gray-500 text-sm mt-0 mb-1">{origin} → {destination}</div>
      </div>
    </div>
  );
} 