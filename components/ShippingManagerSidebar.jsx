"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShippingManagerAuth } from "@/lib/shippingManagerAuth";

export default function ShippingManagerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const manager = ShippingManagerAuth.getManagerData();

  const menuItems = [
    {
      icon: "dashboard",
      label: "Dashboard",
      href: "/shipping-manager/dashboard",
      active: pathname === "/shipping-manager/dashboard"
    },
    {
      icon: "shopping_bag",
      label: "Orders",
      href: "/shipping-manager/orders",
      active: pathname === "/shipping-manager/orders"
    },
  ];

  const handleLogout = () => {
    ShippingManagerAuth.logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
          <img 
            src="/logo.png" 
            alt="MT Trans Logo" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-black">MT TRANS</h1>
            <span className="text-xs text-[#E00000] font-semibold">SHIPPING MANAGER</span>
          </div>
        </div>

        {/* Manager Info */}
        {manager && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{manager.name}</p>
            <p className="text-xs text-gray-600">Zona {manager.zone}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm font-medium transition-all duration-200
                ${item.active 
                  ? 'bg-[#E00000] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md"
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>
    </>
  );
}

