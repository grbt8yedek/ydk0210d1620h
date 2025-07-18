'use client';

import { DateSelectorProps } from '@/types/passenger';

export default function DateSelector({ value, onChange, label }: DateSelectorProps) {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 100 }, (_, i) => String(2024 - i));

  const handleChange = (field: 'day' | 'month' | 'year', newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex gap-1 min-w-[220px]">
        <select
          value={value.day}
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
          value={value.month}
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
          value={value.year}
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