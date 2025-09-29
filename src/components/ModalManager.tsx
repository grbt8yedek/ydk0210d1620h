"use client";

import React from 'react';
import { Bell, Heart, Filter } from 'lucide-react';

interface ModalManagerProps {
  // Modal state'leri
  showPriceAlert: boolean;
  showFavorite: boolean;
  showMobileFilter: boolean;
  showSort: boolean;
  showEditModal: boolean;
  baggageModalOpen: boolean;
  
  // Modal setter'ları
  onPriceAlertClose: () => void;
  onFavoriteClose: () => void;
  onMobileFilterClose: () => void;
  onSortClose: () => void;
  onEditModalClose: () => void;
  onBaggageModalClose: () => void;
  
  // Modal trigger'ları
  onPriceAlertOpen: () => void;
  onFavoriteOpen: () => void;
  onMobileFilterOpen: () => void;
  onSortOpen: () => void;
  onEditModalOpen: () => void;
  
  // Modal içerikleri
  priceAlertContent: React.ReactNode;
  searchFavoriteContent: React.ReactNode;
  mobileFilterContent: React.ReactNode;
  sortContent: React.ReactNode;
  editModalContent: React.ReactNode;
  baggageModalContent: React.ReactNode;
  
  // Mobil durumu
  isMobile: boolean;
}

export default function ModalManager({
  showPriceAlert,
  showFavorite,
  showMobileFilter,
  showSort,
  showEditModal,
  baggageModalOpen,
  onPriceAlertClose,
  onFavoriteClose,
  onMobileFilterClose,
  onSortClose,
  onEditModalClose,
  onBaggageModalClose,
  onPriceAlertOpen,
  onFavoriteOpen,
  onMobileFilterOpen,
  onSortOpen,
  onEditModalOpen,
  priceAlertContent,
  searchFavoriteContent,
  mobileFilterContent,
  sortContent,
  editModalContent,
  baggageModalContent,
  isMobile
}: ModalManagerProps) {
  
  // Mobil ikon barı
  const renderMobileIconBar = () => (
    <div className="block md:hidden sticky top-[56px] z-20 bg-white border-b border-gray-100 hidden">
      <div className="flex items-center justify-between px-1 py-1 gap-2">
        {/* Fiyat Alarmı */}
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 hover:bg-green-50 active:bg-green-100 transition-all" 
          onClick={onPriceAlertOpen}
        >
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="text-[15px] font-semibold text-gray-800 whitespace-nowrap">Alarm</span>
        </button>
        
        {/* Favori Arama */}
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 hover:bg-green-50 active:bg-green-100 transition-all" 
          onClick={onFavoriteOpen}
        >
          <Heart className="w-5 h-5 text-gray-700" />
          <span className="text-[15px] font-semibold text-gray-800 whitespace-nowrap">Favori</span>
        </button>
        
        {/* Filtreler */}
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 hover:bg-green-50 active:bg-green-100 transition-all" 
          onClick={onMobileFilterOpen}
        >
          <Filter className="w-5 h-5 text-gray-700" />
          <span className="text-[15px] font-semibold text-gray-800 whitespace-nowrap">Filtreler</span>
        </button>
        
        {/* Sırala */}
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm flex-1 min-w-0 hover:bg-green-50 active:bg-green-100 transition-all" 
          onClick={onSortOpen}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          <span className="text-[15px] font-semibold text-gray-800 whitespace-nowrap">Sırala</span>
        </button>
      </div>
    </div>
  );

  // Mobil modallar
  const renderMobileModals = () => (
    <>
      {/* Fiyat Alarmı Modalı */}
      {showPriceAlert && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-sm">
            {priceAlertContent}
            <button className="w-full mt-2 py-2 rounded bg-gray-100 text-gray-700" onClick={onPriceAlertClose}>
              Kapat
            </button>
          </div>
        </div>
      )}
      
      {/* Favori Arama Modalı */}
      {showFavorite && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-sm">
            {searchFavoriteContent}
            <button className="w-full mt-2 py-2 rounded bg-gray-100 text-gray-700" onClick={onFavoriteClose}>
              Kapat
            </button>
          </div>
        </div>
      )}
      
      {/* Mobil Filtre Modalı */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-end">
          <div className="bg-white rounded-l-xl shadow-lg p-4 w-4/5 max-w-xs h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Filtreler</span>
              <button onClick={onMobileFilterClose} className="text-gray-500 text-xl">×</button>
            </div>
            {mobileFilterContent}
          </div>
        </div>
      )}
      
      {/* Mobil Sıralama Modalı */}
      {showSort && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Sırala</span>
              <button onClick={onSortClose} className="text-gray-500 text-xl">×</button>
            </div>
            {sortContent}
          </div>
        </div>
      )}
      
      {/* Düzenle Modalı */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${showEditModal ? 'translate-y-0' : '-translate-y-full'}`} style={{maxWidth: '100vw'}}>
            <div className="bg-white rounded-b-2xl shadow-xl p-4 w-full max-w-md mx-auto relative">
              <button className="absolute top-2 right-2 text-gray-400 text-2xl" onClick={onEditModalClose}>×</button>
              {editModalContent}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Bagaj seçimi modalı (hem mobil hem desktop)
  const renderBaggageModal = () => (
    baggageModalOpen && baggageModalContent
  );

  return (
    <>
      {/* Mobil ikon barı */}
      {isMobile && renderMobileIconBar()}
      
      {/* Mobil modallar */}
      {isMobile && renderMobileModals()}
      
      {/* Bagaj seçimi modalı (her zaman) */}
      {renderBaggageModal()}
    </>
  );
} 