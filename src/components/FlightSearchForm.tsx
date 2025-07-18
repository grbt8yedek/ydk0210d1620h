'use client';

import { CalendarDays, UserCircle2, ArrowRightLeft } from 'lucide-react';
import TripTypeSelector from './TripTypeSelector';
import AirportInput from './AirportInput';
import DateInput from './DateInput';

interface Airport {
  code: string;
  name: string;
  city: string;
}

interface FlightSearchFormProps {
  // Trip type props
  tripType: string;
  onTripTypeChange: (type: string) => void;
  directOnly: boolean;
  onDirectOnlyChange: (direct: boolean) => void;
  
  // Airport props
  fromAirports: Airport[];
  toAirports: Airport[];
  fromInput: string;
  toInput: string;
  onFromInputChange: (value: string) => void;
  onToInputChange: (value: string) => void;
  onFromAirportSelect: (airport: Airport) => void;
  onToAirportSelect: (airport: Airport) => void;
  
  // Date props
  departureDate: Date | undefined;
  returnDate: Date | undefined;
  onDepartureDateChange: (date: Date | undefined) => void;
  onReturnDateChange: (date: Date | undefined) => void;
  
  // Passenger props
  adultCount: number;
  childCount: number;
  infantCount: number;
  onPassengerModalOpen: () => void;
  
  // Search props
  isLoading: boolean;
  onSearch: () => void;
  onSwapAirports: () => void;
}

export default function FlightSearchForm({
  tripType,
  onTripTypeChange,
  directOnly,
  onDirectOnlyChange,
  fromAirports,
  toAirports,
  fromInput,
  toInput,
  onFromInputChange,
  onToInputChange,
  onFromAirportSelect,
  onToAirportSelect,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  adultCount,
  childCount,
  infantCount,
  onPassengerModalOpen,
  isLoading,
  onSearch,
  onSwapAirports
}: FlightSearchFormProps) {
  return (
    <>
      {/* Masaüstü için uçuş arama formu */}
      <div className="hidden sm:block w-full sm:container sm:mx-auto px-0 sm:px-4 mt-24">
        <div className="bg-white rounded-[32px] shadow-lg p-8 border border-gray-200">
          {/* Uçuş tipi ve aktarmasız seçenekleri */}
          <TripTypeSelector
            tripType={tripType}
            onTripTypeChange={onTripTypeChange}
            directOnly={directOnly}
            onDirectOnlyChange={onDirectOnlyChange}
            isMobile={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            {/* Nereden */}
            <AirportInput
              label="Nereden"
              placeholder="Şehir veya havali"
              value={fromInput}
              onChange={onFromInputChange}
              onAirportSelect={onFromAirportSelect}
              selectedAirports={fromAirports}
              isMobile={false}
            />
            {/* Nereye */}
            <AirportInput
              label="Nereye"
              placeholder="Şehir veya havali"
              value={toInput}
              onChange={onToInputChange}
              onAirportSelect={onToAirportSelect}
              selectedAirports={toAirports}
              isMobile={false}
            />
            {/* Gidiş Tarihi */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Gidiş Tarihi</label>
              <div className="relative w-full flex items-center">
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <DateInput
                  value={departureDate}
                  onChange={onDepartureDateChange}
                  className="w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-base text-gray-700 placeholder-gray-400 focus:outline-none bg-white border border-gray-300 rounded-xl"
                  placeholder="gg.aa.yyyy"
                />
              </div>
            </div>
            {/* Dönüş Tarihi */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Dönüş Tarihi</label>
              <div className="relative w-full flex items-center">
                <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <DateInput
                  value={returnDate}
                  onChange={onReturnDateChange}
                  className={`w-full pl-10 pr-4 h-12 leading-[44px] py-0 text-base text-gray-700 placeholder-gray-400 focus:outline-none bg-white border border-gray-300 rounded-xl ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                  placeholder="gg.aa.yyyy"
                  disabled={tripType === 'oneWay'}
                />
              </div>
            </div>
            {/* Yolcu */}
            <div className="flex flex-col relative">
              <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">Yolcu</label>
              <div className="relative w-full flex items-center">
                <UserCircle2 className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={onPassengerModalOpen}
                  className="w-full pl-10 pr-4 h-12 text-base text-gray-700 text-left focus:outline-none bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer hover:border-green-500 transition-colors"
                >
                  {adultCount} Yetişkin{childCount > 0 ? `, ${childCount} Çocuk` : ''}{infantCount > 0 ? `, ${infantCount} Bebek` : ''}
                </button>
              </div>
            </div>
            {/* Uçuş Ara Butonu */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all"
                onClick={onSearch}
                disabled={isLoading}
              >
                {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil için özel uçuş arama kutusu */}
      <div className="block sm:hidden w-full px-4 mt-16">
        <div className="bg-gray-50 rounded-2xl shadow-lg p-4 flex flex-col gap-2">
          {/* Tek yön / Gidiş-dönüş / Yolcu satırı */}
          <div className="flex items-center w-full gap-1 mb-0 mt-0">
            <TripTypeSelector
              tripType={tripType}
              onTripTypeChange={onTripTypeChange}
              directOnly={directOnly}
              onDirectOnlyChange={onDirectOnlyChange}
              isMobile={true}
            />
            <button
              type="button"
              onClick={onPassengerModalOpen}
              className="flex items-center gap-1 text-[#23272F] rounded-xl px-3 py-1.5 bg-white ml-auto text-[14px] font-normal min-w-[90px] justify-center border border-gray-200 hover:border-green-500 transition-colors"
              style={{lineHeight: '1.1'}}
            >
              <UserCircle2 className="w-4 h-4" />
              <span className="truncate">{adultCount} Yetişkin{childCount > 0 ? `, ${childCount} Çocuk` : ''}{infantCount > 0 ? `, ${infantCount} Bebek` : ''}</span>
              <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          {/* Nereden-Nereye kutuları ve swap */}
          <div className="relative flex flex-col gap-3 w-full mt-2">
            <AirportInput
              label=""
              placeholder="Kalkış"
              value={fromInput}
              onChange={onFromInputChange}
              onAirportSelect={onFromAirportSelect}
              selectedAirports={fromAirports}
              isMobile={true}
            />
            <button
              type="button"
              onClick={onSwapAirports}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#0a2342] bg-white shadow"
              aria-label="Kalkış/Varış değiştir"
            >
              <ArrowRightLeft className="w-6 h-6 text-[#0a2342]" strokeWidth={1.2} />
            </button>
            <AirportInput
              label=""
              placeholder="Varış"
              value={toInput}
              onChange={onToInputChange}
              onAirportSelect={onToAirportSelect}
              selectedAirports={toAirports}
              isMobile={true}
            />
          </div>
          {/* Tarih kutuları */}
          <div className="flex gap-2 w-full mt-2">
            <div className="flex-1">
              <div className="flex items-center bg-white border border-black rounded-lg h-11 px-3 text-[15px] font-semibold focus:outline-none min-w-0">
                <CalendarDays className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <DateInput
                  value={departureDate}
                  onChange={onDepartureDateChange}
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-semibold placeholder-[#6b7280] p-0"
                  placeholder="Gidis Tarihi"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center bg-white border border-black rounded-lg h-11 px-3 text-[15px] font-semibold focus:outline-none min-w-0">
                <CalendarDays className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <DateInput
                  value={returnDate}
                  onChange={onReturnDateChange}
                  className={`flex-1 bg-transparent border-none outline-none text-[14px] font-semibold placeholder-[#6b7280] p-0 ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Donus Tarihi"
                  disabled={tripType === 'oneWay'}
                />
              </div>
            </div>
          </div>
          {/* Uçuş Ara Butonu */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all mt-2"
            onClick={onSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
          </button>
        </div>
      </div>
    </>
  );
} 