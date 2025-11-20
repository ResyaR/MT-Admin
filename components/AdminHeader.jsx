"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminAPI from "@/lib/adminApi";

export default function AdminHeader() {
  const user = null; // Admin tidak perlu user context
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    AdminAPI.logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search users, orders, restaurants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">
              notifications
            </span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E00000] rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='}
                alt="User"
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.fullName || "Admin"}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                expand_more
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined text-lg">
                      person
                    </span>
                    Profile
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined text-lg">
                      settings
                    </span>
                    Settings
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

