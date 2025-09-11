'use client';

import { X, AlertCircle } from 'lucide-react';

interface ValidationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    errors: string[];
}

export default function ValidationPopup({ isOpen, onClose, errors }: ValidationPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-center mb-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                
                <div className="mb-4">
                    <ul className="space-y-2">
                        {errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 text-sm">•</span>
                                <span className="text-sm text-gray-700">{error}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}
