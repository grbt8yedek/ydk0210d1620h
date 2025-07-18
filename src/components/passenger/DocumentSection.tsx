'use client';

import { Plus } from 'lucide-react';
import { DocumentSectionProps } from '@/types/passenger';

export default function DocumentSection({ formData, onFormDataChange }: DocumentSectionProps) {
  const handleChange = (field: keyof typeof formData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Pasaport */}
      <button
        type="button"
        onClick={() => handleChange('hasPassport', !formData.hasPassport)}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>{formData.hasPassport ? 'Pasaport Bilgileri' : 'Pasaport Ekle'}</span>
      </button>
      
      {formData.hasPassport && (
        <div className="pl-7 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pasaport Numarası</label>
            <input
              type="text"
              value={formData.passportNumber || ''}
              onChange={(e) => handleChange('passportNumber', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Son Geçerlilik Tarihi</label>
            <input
              type="date"
              value={formData.passportExpiry || ''}
              onChange={(e) => handleChange('passportExpiry', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>
      )}

      {/* Mil Kart */}
      <button
        type="button"
        onClick={() => handleChange('hasMilCard', !formData.hasMilCard)}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>{formData.hasMilCard ? 'Mil Kart Bilgileri' : 'Mil Kart Ekle'}</span>
      </button>
      
      {formData.hasMilCard && (
        <div className="pl-7">
          <label className="block text-sm text-gray-600 mb-1">Mil Kart Numarası</label>
          <input
            type="text"
            value={formData.milCardNumber || ''}
            onChange={(e) => handleChange('milCardNumber', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      )}
    </div>
  );
} 