'use client';

import { Wifi } from 'lucide-react';

interface EmptyStateProps {
  type: 'flight' | 'hotel' | 'car' | 'esim' | 'default';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  type, 
  title, 
  description, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'flight':
        return {
          title: 'Henüz hiç bilet satın almadınız.',
          description: '',
          actionText: ''
        };
      case 'hotel':
        return {
          title: 'Henüz otel rezervasyonu yapmadınız.',
          description: '',
          actionText: ''
        };
      case 'car':
        return {
          title: 'Henüz araç kiralamadınız.',
          description: '',
          actionText: ''
        };
      case 'esim':
        return {
          title: 'Henüz E-sim satın almadınız.',
          description: 'İşlem yaptıkça, satın aldığınız E-sim\'lere buradan ulaşabileceksiniz.',
          actionText: 'E-sim satın al'
        };
      default:
        return {
          title: 'Bu bölüm henüz hazır değil.',
          description: 'Çok yakında hizmetinizde olacak.',
          actionText: ''
        };
    }
  };

  const content = getDefaultContent();
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalActionText = actionText || content.actionText;

  return (
    <div className="bg-white rounded-lg shadow-sm sm:p-12 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        {type === 'esim' && (
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
            <Wifi className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <h2 className="text-xl text-gray-700">{finalTitle}</h2>
        {finalDescription && (
          <p className="text-gray-500">{finalDescription}</p>
        )}
        {finalActionText && onAction && (
          <button 
            onClick={onAction}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            {finalActionText}
          </button>
        )}
      </div>
    </div>
  );
} 