'use client';

import { TabType } from '@/types/travel';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const tabs = [
    { id: 'ucak' as TabType, label: 'Uçak' },
    { id: 'otel' as TabType, label: 'Otel' },
    { id: 'arac' as TabType, label: 'Araç' },
    { id: 'esim' as TabType, label: 'E-sim' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm sm:p-6 p-2">
      <div className="flex sm:gap-8 gap-1 justify-center overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`sm:px-6 sm:py-2 px-2 py-1 rounded-lg text-sm font-medium ${
              activeTab === tab.id ? 'bg-green-50 text-green-500' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="sm:text-base text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 