"use client";

import { XCircle } from 'lucide-react';

interface PassengerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  adultCount: number;
  childCount: number;
  infantCount: number;
  onAdultCountChange: (count: number) => void;
  onChildCountChange: (count: number) => void;
  onInfantCountChange: (count: number) => void;
}

export default function PassengerSelector({
  isOpen,
  onClose,
  adultCount,
  childCount,
  infantCount,
  onAdultCountChange,
  onChildCountChange,
  onInfantCountChange
}: PassengerSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end sm:items-center sm:justify-center">
      <div className="w-full sm:w-auto sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 pb-8 shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Yolcu Seçimi</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Yetişkin */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-semibold text-gray-800 text-lg">Yetişkin</div>
              <div className="text-gray-500 text-sm">12 yaş ve üzeri</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onAdultCountChange(Math.max(1, adultCount-1))} 
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-xl font-bold transition-colors" 
                disabled={adultCount === 1}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-gray-800 text-xl">{adultCount}</span>
              <button 
                onClick={() => onAdultCountChange(adultCount+1)} 
                className="w-10 h-10 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center text-white text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Çocuk */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-semibold text-gray-800 text-lg">Çocuk</div>
              <div className="text-gray-500 text-sm">2-12 yaş arası</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onChildCountChange(Math.max(0, childCount-1))} 
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-xl font-bold transition-colors" 
                disabled={childCount === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-gray-800 text-xl">{childCount}</span>
              <button 
                onClick={() => onChildCountChange(childCount+1)} 
                className="w-10 h-10 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center text-white text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Bebek */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-gray-800 text-lg">Bebek</div>
              <div className="text-gray-500 text-sm">0-2 yaş arası</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onInfantCountChange(Math.max(0, infantCount-1))} 
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-xl font-bold transition-colors" 
                disabled={infantCount === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-gray-800 text-xl">{infantCount}</span>
              <button 
                onClick={() => onInfantCountChange(infantCount+1)} 
                className="w-10 h-10 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center text-white text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {/* Toplam Yolcu Sayısı */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Toplam Yolcu</span>
            <span className="font-bold text-green-600 text-lg">{adultCount + childCount + infantCount} Kişi</span>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-6 w-full py-4 rounded-xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600 transition-colors sm:py-3 sm:text-base"
        >
          Tamam
        </button>
      </div>
    </div>
  );
} 