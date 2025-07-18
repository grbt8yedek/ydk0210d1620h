"use client";

import React from 'react';
import { Airline } from '@/types/airline';
import CustomSlider from './CustomSlider';

interface FlightFiltersProps {
  // Havayolu filtresi
  airlinesList: Airline[];
  airlines: string[];
  selectedAirlines: string[];
  onAirlineChange: (airline: string) => void;
  
  // Fiyat filtresi
  allFlights: any[];
  priceRange: [number, number];
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  
  // Saat filtreleri
  departureHourRange: [number, number];
  onDepartureHourRangeChange: (range: [number, number]) => void;
  arrivalHourRange: [number, number];
  onArrivalHourRangeChange: (range: [number, number]) => void;
  
  // Uçuş süresi filtresi
  flightDurationRange: [number, number];
  onFlightDurationRangeChange: (range: [number, number]) => void;
  
  // Aktarma filtresi
  maxStops: number;
  onMaxStopsChange: (stops: number) => void;
  
  // Kabin sınıfı filtresi
  selectedCabinClass: string;
  onCabinClassChange: (cabinClass: string) => void;
}

export default function FlightFilters({
  airlinesList,
  airlines,
  selectedAirlines,
  onAirlineChange,
  allFlights,
  priceRange,
  maxPrice,
  onMaxPriceChange,
  departureHourRange,
  onDepartureHourRangeChange,
  arrivalHourRange,
  onArrivalHourRangeChange,
  flightDurationRange,
  onFlightDurationRangeChange,
  maxStops,
  onMaxStopsChange,
  selectedCabinClass,
  onCabinClassChange
}: FlightFiltersProps) {

  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* Havayolu filtresi */}
      {airlinesList.length > 0 && airlines.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Havayolu</h4>
          <div className="space-y-1">
            {airlines.map(airlineName => {
              const airlineObj = airlinesList.find(a => a.name.toLowerCase() === airlineName.toLowerCase());
              return (
                <label key={airlineName} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedAirlines.includes(airlineName)}
                    onChange={() => onAirlineChange(airlineName)}
                  />
                  {airlineObj?.logoUrl && (
                    <img src={airlineObj.logoUrl} alt={airlineObj.name} className="h-5 w-5 object-contain" />
                  )}
                  <span>{airlineObj?.name || airlineName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Bilet Fiyatı Filtresi */}
      {allFlights.length > 0 && (
        <CustomSlider
          label="Maksimum Fiyat"
          min={priceRange[0]}
          max={priceRange[1]}
          value={maxPrice}
          onChange={(value) => onMaxPriceChange(value as number)}
          step={1}
          leftLabel={`${priceRange[0]} EUR`}
          rightLabel={`${maxPrice} EUR`}
        />
      )}

      {/* Kalkış Saati Filtresi */}
      {allFlights.length > 0 && (
        <CustomSlider
          label="Kalkış Saati"
          range
          min={0}
          max={24}
          value={departureHourRange}
          onChange={(value) => onDepartureHourRangeChange(value as [number, number])}
          allowCross={false}
          step={1}
          leftLabel={`${departureHourRange[0]}:00`}
          rightLabel={`${departureHourRange[1]}:00`}
        />
      )}

      {/* Varış Saati Filtresi */}
      {allFlights.length > 0 && (
        <CustomSlider
          label="Varış Saati"
          range
          min={0}
          max={24}
          value={arrivalHourRange}
          onChange={(value) => onArrivalHourRangeChange(value as [number, number])}
          allowCross={false}
          step={1}
          leftLabel={`${arrivalHourRange[0]}:00`}
          rightLabel={`${arrivalHourRange[1]}:00`}
        />
      )}

      {/* Uçuş Süresi Filtresi */}
      {allFlights.length > 0 && (
        <CustomSlider
          label="Uçuş Süresi (Saat)"
          range
          min={0}
          max={24}
          value={flightDurationRange}
          onChange={(value) => onFlightDurationRangeChange(value as [number, number])}
          allowCross={false}
          step={1}
          leftLabel={`${flightDurationRange[0]}s`}
          rightLabel={`${flightDurationRange[1]}s`}
        />
      )}

      {/* Aktarma Sayısı Filtresi */}
      <div>
        <h4 className="font-semibold mb-2">Maksimum Aktarma</h4>
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="maxStops"
              value="0"
              checked={maxStops === 0}
              onChange={(e) => onMaxStopsChange(Number(e.target.value))}
              className="rounded"
            />
            Direkt uçuşlar (0 aktarma)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="maxStops"
              value="1"
              checked={maxStops === 1}
              onChange={(e) => onMaxStopsChange(Number(e.target.value))}
              className="rounded"
            />
            En fazla 1 aktarma
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="maxStops"
              value="2"
              checked={maxStops === 2}
              onChange={(e) => onMaxStopsChange(Number(e.target.value))}
              className="rounded"
            />
            En fazla 2 aktarma
          </label>
        </div>
      </div>

      {/* Kabin Sınıfı Filtresi */}
      <div>
        <h4 className="font-semibold mb-2">Kabin Sınıfı</h4>
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="cabinClass"
              value="economy"
              checked={selectedCabinClass === 'economy'}
              onChange={(e) => onCabinClassChange(e.target.value)}
              className="rounded"
            />
            Ekonomi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="cabinClass"
              value="business"
              checked={selectedCabinClass === 'business'}
              onChange={(e) => onCabinClassChange(e.target.value)}
              className="rounded"
            />
            Business
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="cabinClass"
              value="first"
              checked={selectedCabinClass === 'first'}
              onChange={(e) => onCabinClassChange(e.target.value)}
              className="rounded"
            />
            First Class
          </label>
        </div>
      </div>
    </div>
  );
} 