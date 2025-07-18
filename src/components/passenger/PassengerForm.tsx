'use client';

import { useState, useEffect } from 'react';
import { PassengerFormProps, PassengerFormData } from '@/types/passenger';
import PersonalInfoSection from './PersonalInfoSection';
import DocumentSection from './DocumentSection';

export default function PassengerForm({ initialData, onSubmit, isLoading }: PassengerFormProps) {
  const [formData, setFormData] = useState<PassengerFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFormDataChange = (changes: Partial<PassengerFormData>) => {
    setFormData(prev => ({ ...prev, ...changes }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="sm:space-y-8 space-y-4">
      {/* Kişisel Bilgiler */}
      <PersonalInfoSection 
        formData={formData} 
        onFormDataChange={handleFormDataChange} 
      />

      {/* Belge Bilgileri */}
      <DocumentSection 
        formData={formData} 
        onFormDataChange={handleFormDataChange} 
      />

      {/* Bilgilendirme */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
        <div className="w-5 h-5 text-gray-400">ℹ️</div>
        <p>
          gurbetbiz, kendi haricindeki yolcuların bilgilerini kaydeden kullanıcıların bu verileri kaydetmeye yetkili olduğunu, ilgili kişiyi bilgilendirdiğini ve onayını aldığını varsayar.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
} 