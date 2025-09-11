'use client';

import { DateSelectorProps } from '@/types/passenger';

export default function DateSelector({ value, onChange, label }: DateSelectorProps) {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 100 }, (_, i) => String(2024 - i));

  const handleChange = (field: 'day' | 'month' | 'year', newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  // Değerleri string'e çevir ve padStart uygula
  const dayValue = value?.day ? String(value.day).padStart(2, '0') : '';
  const monthValue = value?.month ? String(value.month).padStart(2, '0') : '';
  const yearValue = value?.year ? String(value.year) : '';

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex gap-1 min-w-[220px]">
        <select
          value={dayValue}
          onChange={(e) => handleChange('day', e.target.value)}
          className="w-12 h-11 sm:px-3 px-1 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          required
        >
          <option value="">Gün</option>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select
          value={monthValue}
          onChange={(e) => handleChange('month', e.target.value)}
          className="w-20 h-11 sm:px-3 px-1 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          required
        >
          <option value="">Ay</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          value={yearValue}
          onChange={(e) => handleChange('year', e.target.value)}
          className="w-20 h-11 sm:px-3 px-1 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          required
        >
          <option value="">Yıl</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
} 