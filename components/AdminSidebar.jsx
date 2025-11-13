"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminAPI from "@/lib/adminApi";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [ongkirOpen, setOngkirOpen] = useState(pathname.startsWith('/ongkir'));

  const menuItems = [
    {
      icon: "dashboard",
      label: "Dashboard",
      href: "/",
      active: pathname === "/"
    },
    {
      icon: "people",
      label: "Users",
      href: "/users",
      active: pathname === "/users"
    },
    {
      icon: "shopping_bag",
      label: "Orders",
      href: "/orders",
      active: pathname === "/orders"
    },
    {
      icon: "restaurant",
      label: "Restaurants",
      href: "/restaurants",
      active: pathname === "/restaurants"
    },
    {
      icon: "delivery_dining",
      label: "Deliveries",
      href: "/deliveries",
      active: pathname === "/deliveries"
    },
    {
      icon: "local_shipping",
      label: "Shipping Managers",
      href: "/shipping-managers",
      active: pathname === "/shipping-managers"
    },
    {
      icon: "analytics",
      label: "Analytics",
      href: "/analytics",
      active: pathname === "/analytics"
    },
    {
      icon: "settings",
      label: "Settings",
      href: "/settings",
      active: pathname === "/settings"
    }
  ];

  const ongkirSubmenu = [
    {
      icon: "public",
      label: "Provinsi",
      href: "/ongkir/provinces",
      active: pathname === "/ongkir/provinces"
    },
    {
      icon: "location_city",
      label: "Kota/Wilayah",
      href: "/ongkir/cities",
      active: pathname === "/ongkir/cities"
    },
    {
      icon: "local_shipping",
      label: "Jenis Layanan",
      href: "/ongkir/services",
      active: pathname === "/ongkir/services"
    },
    {
      icon: "calculate",
      label: "Cek Ongkir",
      href: "/ongkir/calculator",
      active: pathname === "/ongkir/calculator"
    }
  ];

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
            <span className="text-xs text-[#E00000] font-semibold">ADMIN PANEL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.slice(0, 5).map((item) => (
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

          {/* Ongkir Dropdown Menu */}
          <div className="space-y-1">
            <button
              onClick={() => setOngkirOpen(!ongkirOpen)}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                text-sm font-medium transition-all duration-200
                ${pathname.startsWith('/ongkir')
                  ? 'bg-[#E00000] text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">
                  local_shipping
                </span>
                <span>Ongkir</span>
              </div>
              <span className={`material-symbols-outlined text-lg transition-transform ${ongkirOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Submenu */}
            {ongkirOpen && (
              <div className="ml-4 space-y-1 pl-4 border-l-2 border-gray-200">
                {ongkirSubmenu.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${item.active
                        ? 'bg-[#E00000]/10 text-[#E00000]'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {menuItems.slice(5).map((item) => (
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
            onClick={() => {
              AdminAPI.logout();
              router.push('/login');
            }}
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

