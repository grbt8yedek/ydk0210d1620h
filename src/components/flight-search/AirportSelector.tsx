import { useState, useEffect } from 'react'
import AirportInput from '@/components/AirportInput'

interface AirportSelectorProps {
  fromAirport: string
  toAirport: string
  onFromChange: (airport: string) => void
  onToChange: (airport: string) => void
  onSwap: () => void
  disabled?: boolean
}

export default function AirportSelector({
  fromAirport,
  toAirport,
  onFromChange,
  onToChange,
  onSwap,
  disabled = false
}: AirportSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
      {/* From Airport */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Nereden
        </label>
        <AirportInput
          label=""
          value={fromAirport}
          onChange={onFromChange}
          onAirportSelect={() => {}}
          selectedAirports={[]}
          placeholder="Kalkış havalimanı"
          disabled={disabled}
        />
      </div>

      {/* Swap Button */}
      <div className="hidden md:flex absolute left-1/2 top-8 transform -translate-x-1/2 z-10">
        <button
          type="button"
          onClick={onSwap}
          disabled={disabled}
          className="bg-white border-2 border-gray-200 rounded-full p-2 hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50"
          aria-label="Havalimanlarını değiştir"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
      </div>

      {/* To Airport */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Nereye
        </label>
        <AirportInput
          label=""
          value={toAirport}
          onChange={onToChange}
          onAirportSelect={() => {}}
          selectedAirports={[]}
          placeholder="Varış havalimanı"
          disabled={disabled}
        />
      </div>

      {/* Mobile Swap Button */}
      <div className="md:hidden flex justify-center">
        <button
          type="button"
          onClick={onSwap}
          disabled={disabled}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          Değiştir ↕️
        </button>
      </div>
    </div>
  )
}
