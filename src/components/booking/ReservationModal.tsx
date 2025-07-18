'use client';

interface ReservationInfo {
    pnr: string;
    validUntil: string;
    totalPrice: number;
    currency: string;
}

interface ReservationModalProps {
    isOpen: boolean;
    reservationInfo: ReservationInfo | null;
    onClose: () => void;
}

export default function ReservationModal({ isOpen, reservationInfo, onClose }: ReservationModalProps) {
    if (!isOpen || !reservationInfo) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
                <h3 className="text-2xl font-extrabold mb-6 text-green-700 text-center tracking-tight">Rezervasyon Başarılı!</h3>
                <div className="mb-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">PNR:</span>
                        <span className="font-mono text-lg font-semibold text-gray-900">{reservationInfo.pnr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">Rezervasyon Geçerlilik Süresi:</span>
                        <span className="font-mono text-lg font-semibold text-gray-900">{new Date(reservationInfo.validUntil).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">Rezervasyon Ücreti:</span>
                        <span className="font-mono text-lg font-semibold text-gray-900">{reservationInfo.totalPrice} {reservationInfo.currency}</span>
                    </div>
                </div>
                <button
                    className="mt-8 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition text-lg shadow-sm"
                    onClick={onClose}
                >
                    Tamam
                </button>
            </div>
        </div>
    );
} 