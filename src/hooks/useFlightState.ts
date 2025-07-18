"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Flight {
  id: number;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  direct: boolean;
  baggage: string;
}

interface UseFlightStateProps {
  origin: string;
  destination: string;
  tripType: string;
  selectedDeparture: Date | null;
  selectedReturn: Date | null;
}

export function useFlightState({
  origin,
  destination,
  tripType,
  selectedDeparture,
  selectedReturn
}: UseFlightStateProps) {
  // Uçuş state'leri
  const [departureFlights, setDepartureFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loadingDeparture, setLoadingDeparture] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [errorDeparture, setErrorDeparture] = useState<string | null>(null);
  const [errorReturn, setErrorReturn] = useState<string | null>(null);

  // Gidiş uçuşlarını çek
  useEffect(() => {
    if (!selectedDeparture) return;
    
    setLoadingDeparture(true);
    setErrorDeparture(null);
    
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 500));
        const departureDate = format(selectedDeparture, 'yyyy-MM-dd');
        setDepartureFlights([
          {
            id: 1,
            airlineName: 'Turkish Airlines',
            flightNumber: 'TK123',
            origin: origin || 'IST',
            destination: destination || 'SAW',
            departureTime: `${departureDate}T09:00:00`,
            arrivalTime: `${departureDate}T10:20:00`,
            duration: '1s 20d',
            price: 120,
            direct: true,
            baggage: '15 kg',
          },
          {
            id: 2,
            airlineName: 'SunExpress',
            flightNumber: 'XQ456',
            origin: origin || 'IST',
            destination: destination || 'SAW',
            departureTime: `${departureDate}T13:30:00`,
            arrivalTime: `${departureDate}T15:00:00`,
            duration: '1s 30d',
            price: 99,
            direct: false,
            baggage: '20 kg',
          },
          {
            id: 3,
            airlineName: 'Airjet',
            flightNumber: 'AJ789',
            origin: origin || 'IST',
            destination: destination || 'SAW',
            departureTime: `${departureDate}T18:00:00`,
            arrivalTime: `${departureDate}T19:10:00`,
            duration: '1s 10d',
            price: 105,
            direct: true,
            baggage: '10 kg',
          },
        ]);
      } catch (e) {
        setErrorDeparture('Gidiş uçuşları yüklenirken hata oluştu.');
      } finally {
        setLoadingDeparture(false);
      }
    })();
  }, [selectedDeparture, origin, destination]);

  // Dönüş uçuşlarını çek
  useEffect(() => {
    if (tripType !== 'roundTrip' || !selectedReturn || !destination || !origin) return;
    
    setLoadingReturn(true);
    setErrorReturn(null);
    
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 1000));
        const returnDate = format(selectedReturn, 'yyyy-MM-dd');
        setReturnFlights([
          { 
            id: 3, 
            airlineName: 'Pegasus', 
            flightNumber: 'PC789', 
            origin: destination, 
            destination: origin, 
            departureTime: `${returnDate}T10:00:00`, 
            arrivalTime: `${returnDate}T13:00:00`, 
            duration: '3s 0d', 
            price: 110, 
            direct: true,
            baggage: '20 kg',
          },
          { 
            id: 4, 
            airlineName: 'SunExpress', 
            flightNumber: 'XQ101', 
            origin: destination, 
            destination: origin, 
            departureTime: `${returnDate}T18:00:00`, 
            arrivalTime: `${returnDate}T21:00:00`, 
            duration: '3s 0d', 
            price: 95, 
            direct: false,
            baggage: '15 kg',
          },
        ]);
      } catch (e) {
        setErrorReturn('Dönüş uçuşları yüklenirken hata oluştu.');
      } finally {
        setLoadingReturn(false);
      }
    })();
  }, [selectedReturn, destination, origin, tripType]);

  return {
    departureFlights,
    returnFlights,
    loadingDeparture,
    loadingReturn,
    errorDeparture,
    errorReturn,
  };
} 