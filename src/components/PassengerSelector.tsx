"use client";

import { Info } from 'lucide-react';

interface PassengerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  adultCount: number;
  childCount: number;
  infantCount: number;
  onAdultCountChange: (count: number) => void;
  onChildCountChange: (count: number) => void;
  onInfantCountChange: (count: number) => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export default function PassengerSelector({
  isOpen,
  onClose,
  adultCount,
  childCount,
  infantCount,
  onAdultCountChange,
  onChildCountChange,
  onInfantCountChange,
  buttonRef
}: PassengerSelectorProps) {
  if (!isOpen) return null;

  // Mobil için tam ekran modal
  const MobileModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden">
      <div className="w-full bg-white rounded-t-3xl p-6 pb-8 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Yolcu Seçimi</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Yetişkin */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 text-lg">Yetişkin <span className="text-gray-500 text-base">(12 yaş ve üstü)</span></div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onAdultCountChange(Math.max(1, adultCount-1))} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-lg" 
                disabled={adultCount === 1}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800 text-xl">{adultCount}</span>
              <button 
                onClick={() => onAdultCountChange(adultCount+1)} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-green-600 text-lg"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Çocuk */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 text-lg">Çocuk <span className="text-gray-500 text-base">(2-12 yaş)</span></div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onChildCountChange(Math.max(0, childCount-1))} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-lg" 
                disabled={childCount === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800 text-xl">{childCount}</span>
              <button 
                onClick={() => onChildCountChange(childCount+1)} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-green-600 text-lg"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Bebek */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-800 text-lg">Bebek <span className="text-gray-500 text-base">(0-2 yaş)</span></div>
              <Info className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onInfantCountChange(Math.max(0, infantCount-1))} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40 text-lg" 
                disabled={infantCount === 0}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold text-gray-800 text-xl">{infantCount}</span>
              <button 
                onClick={() => onInfantCountChange(infantCount+1)} 
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-green-600 text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-8 w-full py-4 rounded-xl bg-green-500 text-white font-semibold text-lg"
        >
          Tamam
        </button>
      </div>
    </div>
  );

  // Masaüstü için dropdown
  const DesktopDropdown = () => (
    <div className="absolute top-full left-0 z-50 mt-2 w-80 hidden sm:block">
      <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col gap-3">
          {/* Yetişkin */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Yetişkin <span className="text-gray-500 text-sm">(12 yaş ve üstü)</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAdultCountChange(Math.max(1, adultCount-1))} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40" 
                disabled={adultCount === 1}
              >
                -
              </button>
              <span className="w-4 text-center font-semibold text-gray-800">{adultCount}</span>
              <button 
                onClick={() => onAdultCountChange(adultCount+1)} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Çocuk */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Çocuk <span className="text-gray-500 text-sm">(2-12 yaş)</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onChildCountChange(Math.max(0, childCount-1))} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40" 
                disabled={childCount === 0}
              >
                -
              </button>
              <span className="w-4 text-center font-semibold text-gray-800">{childCount}</span>
              <button 
                onClick={() => onChildCountChange(childCount+1)} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Bebek */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="font-medium text-gray-800">Bebek <span className="text-gray-500 text-sm">(0-2 yaş)</span></div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onInfantCountChange(Math.max(0, infantCount-1))} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-40" 
                disabled={infantCount === 0}
              >
                -
              </button>
              <span className="w-4 text-center font-semibold text-gray-800">{infantCount}</span>
              <button 
                onClick={() => onInfantCountChange(infantCount+1)} 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-green-600"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="mt-4 w-full py-2 rounded-xl bg-green-500 text-white font-semibold"
        >
          Tamam
        </button>
      </div>
    </div>
  );

  return (
    <>
      <MobileModal />
      <DesktopDropdown />
    </>
  );
} 