'use client';

import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/grbt-8', label: 'Dashboard', icon: '🏠' },
    { href: '/grbt-8/raporlar', label: 'Raporlar', icon: '📊' },
    { href: '/grbt-8/kampanyalar', label: 'Kampanyalar', icon: '🎯' },
    { href: '/grbt-8/monitor', label: 'Monitor', icon: '🔍' },
  ];

  return (
    <aside className="w-56 border-r p-4 bg-gray-50 min-h-screen">
      <div className="text-sm text-gray-500 mb-4 font-semibold">GRBT-8 Admin</div>
      
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          Sistem Durumu: ✅ Aktif
        </div>
      </div>
    </aside>
  );
}
