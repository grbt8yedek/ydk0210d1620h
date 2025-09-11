// Hesabım sayfası için ortak menü itemları
import { User, Plane, Users, Receipt, Search, Bell, Heart } from 'lucide-react';
import { AccountSidebarItem } from '@/components/AccountSidebar';

export const HESABIM_MENU_ITEMS: AccountSidebarItem[] = [
  { icon: User, label: 'Hesabım', href: '/hesabim' },
  { icon: Plane, label: 'Seyahatlerim', href: '/hesabim/seyahatlerim' },
  { icon: Users, label: 'Yolcularım', href: '/hesabim/yolcularim' },
  // { icon: Star, label: 'Puanlarım', href: '/hesabim/puanlarim' }, // Geçici olarak gizlendi
  { icon: Receipt, label: 'Fatura Bilgilerim', href: '/hesabim/fatura' },
  { icon: Search, label: 'Aramalarım', href: '/hesabim/aramalarim' },
  { icon: Bell, label: 'Fiyat Alarmlarım', href: '/hesabim/alarmlar' },
  { icon: Heart, label: 'Favorilerim', href: '/hesabim/favoriler' },
];
