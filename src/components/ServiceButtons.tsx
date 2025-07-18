import Link from 'next/link';
import { PlaneTakeoff, XCircle, HelpCircle } from 'lucide-react';

export default function ServiceButtons() {
  return (
    <div className="w-full sm:container sm:mx-auto px-0 sm:px-4 mt-4">
      {/* Masaüstü için yatay düzen */}
      <div className="bg-white rounded-[32px] shadow-lg p-6 border border-gray-200 hidden sm:block">
        <div className="flex justify-between items-center gap-8">
          <Link 
            href="/check-in" 
            className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 hover:shadow rounded-xl px-3 py-2"
          >
            <PlaneTakeoff className="w-5 h-5" />
            <span>Online Check - In</span>
          </Link>
          <Link 
            href="/pnr-sorgula" 
            className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 hover:shadow rounded-xl px-3 py-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>PNR Sorgula</span>
          </Link>
          <Link 
            href="/bilet-iptal" 
            className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 hover:shadow rounded-xl px-3 py-2"
          >
            <XCircle className="w-5 h-5" />
            <span>Biletimi İptal Et</span>
          </Link>
          <Link 
            href="/yardim" 
            className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 hover:shadow rounded-xl px-3 py-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Yardım</span>
          </Link>
        </div>
      </div>
      
      {/* Mobil için 2x2 grid düzen */}
      <div className="bg-gray-50 rounded-2xl shadow-lg p-3 border border-gray-100 grid grid-cols-2 gap-3 mt-2 mx-2 block sm:hidden">
        <Link 
          href="/check-in" 
          className="flex flex-col items-center justify-center bg-white rounded-xl py-4 shadow border border-gray-100 hover:shadow-md transition-shadow"
        >
          <PlaneTakeoff className="w-6 h-6 text-green-500 mb-1" />
          <span className="text-xs font-semibold text-gray-700 text-center">Online Check-in</span>
        </Link>
        <Link 
          href="/pnr-sorgula" 
          className="flex flex-col items-center justify-center bg-white rounded-xl py-4 shadow border border-gray-100 hover:shadow-md transition-shadow"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500 mb-1">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-semibold text-gray-700 text-center">PNR Sorgula</span>
        </Link>
        <Link 
          href="/bilet-iptal" 
          className="flex flex-col items-center justify-center bg-white rounded-xl py-4 shadow border border-gray-100 hover:shadow-md transition-shadow"
        >
          <XCircle className="w-6 h-6 text-green-500 mb-1" />
          <span className="text-xs font-semibold text-gray-700 text-center">Biletimi İptal Et</span>
        </Link>
        <Link 
          href="/yardim" 
          className="flex flex-col items-center justify-center bg-white rounded-xl py-4 shadow border border-gray-100 hover:shadow-md transition-shadow"
        >
          <HelpCircle className="w-6 h-6 text-green-500 mb-1" />
          <span className="text-xs font-semibold text-gray-700 text-center">Yardım</span>
        </Link>
      </div>
    </div>
  );
} 