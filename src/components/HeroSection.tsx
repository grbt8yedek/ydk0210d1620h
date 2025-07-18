import { PlaneTakeoff, Building, Car, Wifi } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-green-500 text-center text-white pb-5 sm:pb-32 pt-[1.2rem] sm:pt-8 relative z-10 rounded-b-[16px] sm:rounded-b-[32px]">
      <div className="container mx-auto px-4">
        <h1 className="hidden sm:block sm:relative text-2xl sm:text-5xl font-bold mb-1 sm:mb-2 z-30">
          <span className="text-white">gurbet</span>
          <span className="text-black">biz</span>
        </h1>
        <h2 className="hidden sm:block text-xs sm:text-xl font-light">Gurbetten Memlekete, Yol Arkadaşınız!</h2>
      </div>
      {/* Service Icons - overlap border */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[60%] sm:translate-y-[70%] z-20 flex justify-center w-full pointer-events-none">
        <div className="flex gap-8 bg-transparent scale-75 sm:scale-100">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg mb-2 border-4 border-white">
              <PlaneTakeoff className="w-7 h-7 text-gray-600" strokeWidth={1.5} />
            </div>
            <span className="text-gray-600 text-xs sm:text-sm pointer-events-auto">UÇAK</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg mb-2 border-4 border-white">
              <Building className="w-7 h-7 text-gray-600" strokeWidth={1.5} />
            </div>
            <span className="text-gray-600 text-xs sm:text-sm pointer-events-auto">OTEL</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg mb-2 border-4 border-white">
              <Car className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
            </div>
            <span className="text-gray-600 text-xs sm:text-sm pointer-events-auto">ARAÇ</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg mb-2 border-4 border-white">
              <Wifi className="w-7 h-7 text-gray-600" strokeWidth={1.5} />
            </div>
            <span className="text-gray-600 text-xs sm:text-sm pointer-events-auto">E SIM</span>
          </div>
        </div>
      </div>
    </div>
  );
} 