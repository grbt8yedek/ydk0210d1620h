import { useState } from 'react'
import DateInput from '@/components/DateInput'

interface DateSelectorProps {
  tripType: 'oneWay' | 'roundTrip' | 'multiCity'
  departureDate: string
  returnDate: string
  onDepartureDateChange: (date: string) => void
  onReturnDateChange: (date: string) => void
  disabled?: boolean
}

export default function DateSelector({
  tripType,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  disabled = false
}: DateSelectorProps) {
  const isRoundTrip = tripType === 'roundTrip'

  return (
    <div className={`grid grid-cols-1 ${isRoundTrip ? 'md:grid-cols-2' : ''} gap-4`}>
      {/* Departure Date */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Gidiş Tarihi
        </label>
        <DateInput
          value={departureDate ? new Date(departureDate) : undefined}
          onChange={(date: Date | undefined) => {
            onDepartureDateChange(date ? date.toISOString().split('T')[0] : '');
          }}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Return Date - Only for Round Trip */}
      {isRoundTrip && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Dönüş Tarihi
          </label>
          <DateInput
            value={returnDate ? new Date(returnDate) : undefined}
            onChange={(date: Date | undefined) => {
              onReturnDateChange(date ? date.toISOString().split('T')[0] : '');
            }}
            disabled={disabled}
            className="w-full"
          />
        </div>
      )}

      {/* Date Helper Text */}
      <div className={`${isRoundTrip ? 'md:col-span-2' : ''} text-xs text-gray-500`}>
        💡 En uygun fiyatlar için esnek tarih seçeneklerini kullanın
      </div>
    </div>
  )
}
