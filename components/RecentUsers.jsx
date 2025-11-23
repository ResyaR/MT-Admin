"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function RecentUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentUsers();
  }, []);

  const loadRecentUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await AdminAPI.getAllUsers();
      
      // Sort by createdAt (latest first) and take top 5
      const recentUsers = allUsers
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Latest first
        })
        .slice(0, 5)
        .map(user => ({
          name: user.fullName || user.username || user.email?.split('@')[0] || "Not set",
          email: user.email,
          avatar: user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
          joinedDate: user.createdAt ? getRelativeTime(new Date(user.createdAt)) : "Unknown",
          orders: 0,
          status: user.lastLogin ? "active" : "new"
        }));
      
      setUsers(recentUsers);
    } catch (error) {
      console.error('Error loading recent users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const oldUsers = [
    {
      name: "Andi Prasetyo",
      email: "andi.prasetyo@email.com",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
      joinedDate: "Today",
      orders: 0,
      status: "new"
    },
    {
      name: "Ratna Sari",
      email: "ratna.sari@email.com",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
      joinedDate: "Yesterday",
      orders: 2,
      status: "active"
    },
    {
      name: "Dimas Anggara",
      email: "dimas.anggara@email.com",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
      joinedDate: "2 days ago",
      orders: 5,
      status: "active"
    },
    {
      name: "Lina Marlina",
      email: "lina.marlina@email.com",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
      joinedDate: "3 days ago",
      orders: 1,
      status: "active"
    },
    {
      name: "Hendra Gunawan",
      email: "hendra.gunawan@email.com",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
      joinedDate: "4 days ago",
      orders: 8,
      status: "vip"
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      vip: "bg-purple-100 text-purple-800"
    };

    const labels = {
      new: "New",
      active: "Active",
      vip: "VIP"
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
        <button 
          onClick={() => router.push('/users')}
          className="text-sm text-[#E00000] font-semibold hover:underline"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E00000] mx-auto"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">people</span>
          <p className="text-gray-600">Belum ada users</p>
        </div>
      ) : (
        <div className="space-y-4">
        {users.map((user, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <img 
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=';
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                {getStatusBadge(user.status)}
              </div>
              <p className="text-xs text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">{user.orders} orders • Joined {user.joinedDate}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

