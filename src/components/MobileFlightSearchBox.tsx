import { useState, useEffect, useRef } from 'react';
import { MapPin, CalendarDays, UserCircle2, ArrowRightLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Airport {
  code: string;
  name: string;
  city: string;
}

const DateInput = dynamic(() => import('@/components/DateInput'), { ssr: false });

interface MobileFlightSearchBoxProps {
  initialTripType?: string;
  initialFromAirports?: Airport[];
  initialToAirports?: Airport[];
  initialDepartureDate?: Date | string;
  initialReturnDate?: Date | string;
  initialAdultCount?: number;
  initialChildCount?: number;
  initialInfantCount?: number;
  onSubmit: (params: {
    fromAirports: Airport[];
    toAirports: Airport[];
    departureDate: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
  }) => void;
}

export default function MobileFlightSearchBox({
  initialTripType = 'oneWay',
  initialFromAirports = [],
  initialToAirports = [],
  initialDepartureDate = undefined,
  initialReturnDate = undefined,
  initialAdultCount = 1,
  initialChildCount = 0,
  initialInfantCount = 0,
  onSubmit,
}: MobileFlightSearchBoxProps) {
  const [tripType, setTripType] = useState(initialTripType);
  const [fromAirports, setFromAirports] = useState<Airport[]>(initialFromAirports);
  const [toAirports, setToAirports] = useState<Airport[]>(initialToAirports);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(initialDepartureDate ? new Date(initialDepartureDate) : undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(initialReturnDate ? new Date(initialReturnDate) : undefined);
  const [adultCount, setAdultCount] = useState(initialAdultCount);
  const [childCount, setChildCount] = useState(initialChildCount);
  const [infantCount, setInfantCount] = useState(initialInfantCount);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<Airport[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Airport[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromInputRef.current && !fromInputRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toInputRef.current && !toInputRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const swapAirports = () => {
    setFromAirports(toAirports);
    setToAirports(fromAirports);
    setFromInput('');
    setToInput('');
  };

  const searchAirports = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<Airport[]>>) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      // Demo havalimanı listesi
      const demoAirports: Airport[] = [
        { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
        { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
        { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya' },
        { code: 'ADB', name: 'Adnan Menderes', city: 'İzmir' },
        { code: 'ESB', name: 'Esenboğa', city: 'Ankara' },
        { code: 'BRU', name: 'Brussels Airport', city: 'Brüksel' },
        { code: 'AMS', name: 'Schiphol', city: 'Amsterdam' },
        { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
        { code: 'LHR', name: 'Heathrow', city: 'Londra' },
        { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
        { code: 'ZRH', name: 'Zürich Airport', city: 'Zürih' },
        { code: 'VIE', name: 'Vienna International', city: 'Viyana' },
      ];
      const q = query.toLowerCase();
      const filtered = demoAirports.filter(airport =>
        airport.code.toLowerCase().startsWith(q) ||
        airport.name.toLowerCase().startsWith(q) ||
        airport.city.toLowerCase().startsWith(q) ||
        airport.name.toLowerCase().includes(q) ||
        airport.city.toLowerCase().includes(q)
      );
      setSuggestions(filtered);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAirports.length || !toAirports.length || !departureDate) return;
    setIsLoading(true);
    onSubmit({
      fromAirports,
      toAirports,
      departureDate,
      returnDate,
      tripType,
      adultCount,
      childCount,
      infantCount,
    });
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="radio" checked={tripType === 'oneWay'} onChange={() => setTripType('oneWay')} aria-label="Tek yön uçuş" /> Tek yön
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="radio" checked={tripType === 'roundTrip'} onChange={() => setTripType('roundTrip')} aria-label="Gidiş-dönüş uçuş" /> Gidiş-dönüş
        </label>
        <button type="button" className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium" onClick={() => setShowPassengerModal(true)}>
          <UserCircle2 className="w-5 h-5" />
          {adultCount} Yetişkin{childCount > 0 ? `, ${childCount} Çocuk` : ''}{infantCount > 0 ? `, ${infantCount} Bebek` : ''}
        </button>
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-green-700 text-sm font-semibold mb-1">Nereden</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                ref={fromInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 flight-search-input"
                placeholder="Nereden"
                value={fromInput}
                onChange={e => {
                  setFromInput(e.target.value);
                  setShowFromSuggestions(true);
                  searchAirports(e.target.value, setFromSuggestions);
                }}
                onFocus={() => setShowFromSuggestions(true)}
                aria-label="Kalkış havalimanı"
                role="combobox"
                aria-expanded={showFromSuggestions}
                aria-controls="from-suggestions"
                aria-autocomplete="list"
              />
              {showFromSuggestions && (
                <ul id="from-suggestions" className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg min-h-[3rem]" role="listbox" aria-label="Kalkış havalimanı önerileri">
                  {fromSuggestions.map(airport => (
                    <li
                      key={airport.code}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                      role="option"
                      aria-selected={fromAirports.some(a => a.code === airport.code)}
                      onMouseDown={() => {
                        setFromAirports([airport]);
                        setFromInput(airport.name + ' (' + airport.code + ')');
                        setShowFromSuggestions(false);
                      }}
                    >
                      {airport.name} ({airport.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            type="button"
            className="self-end mb-2 w-11 h-11 flex items-center justify-center rounded-full"
            onClick={swapAirports}
            aria-label="Havalimanlarını değiştir"
          >
            <ArrowRightLeft className="w-6 h-6 text-green-600" />
          </button>
          <div className="flex-1">
            <label className="block text-green-700 text-sm font-semibold mb-1">Nereye</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                ref={toInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 flight-search-input"
                placeholder="Nereye"
                value={toInput}
                onChange={e => {
                  setToInput(e.target.value);
                  setShowToSuggestions(true);
                  searchAirports(e.target.value, setToSuggestions);
                }}
                onFocus={() => setShowToSuggestions(true)}
                aria-label="Varış havalimanı"
                role="combobox"
                aria-expanded={showToSuggestions}
                aria-controls="to-suggestions"
                aria-autocomplete="list"
              />
              {showToSuggestions && (
                <ul id="to-suggestions" className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg min-h-[3rem]" role="listbox" aria-label="Varış havalimanı önerileri">
                  {toSuggestions.map(airport => (
                    <li
                      key={airport.code}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                      role="option"
                      aria-selected={toAirports.some(a => a.code === airport.code)}
                      onMouseDown={() => {
                        setToAirports([airport]);
                        setToInput(airport.name + ' (' + airport.code + ')');
                        setShowToSuggestions(false);
                      }}
                    >
                      {airport.name} ({airport.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <label className="block text-green-700 text-sm font-semibold mb-1">Gidiş Tarihi</label>
            <div className="relative flex items-center justify-center">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <DateInput
                value={departureDate}
                onChange={setDepartureDate}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-center flight-search-input"
                placeholder="Gidiş Tarihi"
                aria-label="Gidiş tarihi seçimi"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-green-700 text-sm font-semibold mb-1">Dönüş Tarihi</label>
            <div className="relative flex items-center justify-center">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <DateInput
                value={returnDate}
                onChange={setReturnDate}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-center flight-search-input ${tripType === 'oneWay' ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Dönüş Tarihi"
                disabled={tripType === 'oneWay'}
                aria-label="Dönüş tarihi seçimi"
              />
            </div>
          </div>
        </div>
      </div>
      <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-green-600 transition-all mt-4" disabled={isLoading} aria-busy={isLoading} aria-live="polite">
        {isLoading ? 'Aranıyor...' : 'Uçuş Ara'}
      </button>
      {/* Yolcu modalı */}
      {showPassengerModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center will-change-transform">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs mx-2 relative" style={{ contain: 'layout' }}>
            <button
              className="absolute top-2 right-2 text-gray-400 text-2xl w-11 h-11 flex items-center justify-center"
              onClick={()=>setShowPassengerModal(false)}
              aria-label="Pencereyi kapat"
            >
              ×
            </button>
            <div className="flex flex-col gap-4">
              {/* Yetişkin */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Yetişkin <span className="text-gray-500 text-sm">(12+)</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount-1))}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40"
                    disabled={adultCount === 1}
                    aria-label="Yetişkin sayısını azalt"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-semibold text-gray-800">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount+1)}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
                    aria-label="Yetişkin sayısını artır"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Çocuk */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Çocuk <span className="text-gray-500 text-sm">(2-12)</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount-1))}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40"
                    disabled={childCount === 0}
                    aria-label="Çocuk sayısını azalt"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-semibold text-gray-800">{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount+1)}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
                    aria-label="Çocuk sayısını artır"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Bebek */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Bebek <span className="text-gray-500 text-sm">(0-2)</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInfantCount(Math.max(0, infantCount-1))}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40"
                    disabled={infantCount === 0}
                    aria-label="Bebek sayısını azalt"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-semibold text-gray-800">{infantCount}</span>
                  <button
                    onClick={() => setInfantCount(infantCount+1)}
                    className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
                    aria-label="Bebek sayısını artır"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
} 