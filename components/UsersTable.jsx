"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const users = await AdminAPI.getAllUsers();
      
      // Transform API data to match our table format
      const transformedUsers = users.map((user, index) => ({
        id: user.id,
        name: user.fullName || user.username || user.email.split('@')[0],
        email: user.email,
        phone: user.phone || "-",
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : "N/A",
        totalOrders: 0, // API doesn't provide this yet
        totalSpent: "Rp 0",
        status: user.lastLogin ? "Active" : "New",
        avatar: user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4=',
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        username: user.username
      }));
      
      setAllUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadUsers(true);
  };

  // View user detail
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.name && user.name !== "-" ? user.name : '',
      phone: user.phone && user.phone !== "-" ? user.phone : '',
      avatar: user.avatar && !user.avatar.startsWith('data:image/svg+xml') ? user.avatar : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      // Call API to update user
      await AdminAPI.updateUser(selectedUser.id, editFormData);
      
      // Reload users
      await loadUsers();
      
      setShowEditModal(false);
      showSuccessNotification('User berhasil diupdate!');
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorNotification('Gagal update user: ' + error.message);
    }
  };

  // Delete user - show confirmation modal
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteUser = async () => {
    try {
      await AdminAPI.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      await loadUsers();
      showSuccessNotification('User berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting user:', error);
      setShowDeleteModal(false);
      showErrorNotification('Gagal hapus user: ' + error.message);
    }
  };

  // Notification helpers
  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const showErrorNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType('error');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Old hardcoded data removed
  const oldUsers = [
    {
      id: 1,
      name: "Budi Santoso",
      email: "budi.santoso@email.com",
      phone: "+62812-3456-7890",
      joinDate: "2025-01-15",
      totalOrders: 24,
      totalSpent: "Rp 2,450,000",
      status: "active",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti.nur@email.com",
      phone: "+62813-4567-8901",
      joinDate: "2025-02-20",
      totalOrders: 15,
      totalSpent: "Rp 1,890,000",
      status: "active",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 3,
      name: "Ahmad Wijaya",
      email: "ahmad.wijaya@email.com",
      phone: "+62814-5678-9012",
      joinDate: "2025-03-10",
      totalOrders: 8,
      totalSpent: "Rp 750,000",
      status: "active",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 4,
      name: "Dewi Lestari",
      email: "dewi.lestari@email.com",
      phone: "+62815-6789-0123",
      joinDate: "2025-04-05",
      totalOrders: 32,
      totalSpent: "Rp 4,200,000",
      status: "vip",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 5,
      name: "Rudi Hartono",
      email: "rudi.hartono@email.com",
      phone: "+62816-7890-1234",
      joinDate: "2025-05-12",
      totalOrders: 2,
      totalSpent: "Rp 180,000",
      status: "inactive",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 6,
      name: "Rina Kusuma",
      email: "rina.kusuma@email.com",
      phone: "+62817-8901-2345",
      joinDate: "2025-06-18",
      totalOrders: 19,
      totalSpent: "Rp 2,100,000",
      status: "active",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 7,
      name: "Fajar Nugroho",
      email: "fajar.nugroho@email.com",
      phone: "+62818-9012-3456",
      joinDate: "2025-07-25",
      totalOrders: 45,
      totalSpent: "Rp 5,800,000",
      status: "vip",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    },
    {
      id: 8,
      name: "Linda Wijayanti",
      email: "linda.w@email.com",
      phone: "+62819-0123-4567",
      joinDate: "2025-08-30",
      totalOrders: 0,
      totalSpent: "Rp 0",
      status: "new",
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTVlN2U5Ii8+PHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Y2EzYWYiPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz48L3N2Zz4='
    }
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'new';
    
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      vip: "bg-purple-100 text-purple-800",
      new: "bg-blue-100 text-blue-800"
    };

    const labels = {
      active: "Active",
      inactive: "Inactive",
      vip: "VIP",
      new: "New"
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[statusLower]}`}>
        {labels[statusLower] || status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
            <option value="new">New</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">{user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.joinDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{user.totalOrders}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{user.totalSpent}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewUser(user)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? 'bg-[#E00000] text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">ID: {selectedUser.id}</p>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Join Date</p>
                  <p className="font-semibold text-gray-900">{selectedUser.joinDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Login</p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.lastLogin 
                      ? new Date(selectedUser.lastLogin).toLocaleString('id-ID')
                      : 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="font-semibold text-gray-900">{selectedUser.totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="font-semibold text-gray-900">{selectedUser.totalSpent}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <span className="material-symbols-outlined text-4xl text-red-600">warning</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Hapus User</h2>
              <p className="text-gray-600 text-center mb-6">
                Apakah Anda yakin ingin menghapus user <strong>{selectedUser.name}</strong> ({selectedUser.email})?
                <br />
                <span className="text-red-600 text-sm font-medium">Tindakan ini tidak dapat dibatalkan!</span>
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={editFormData.avatar}
                  onChange={(e) => setEditFormData({...editFormData, avatar: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  placeholder="Enter avatar URL"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg
            ${notificationType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'}
          `}>
            <span className="material-symbols-outlined text-2xl">
              {notificationType === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-medium">{notificationMessage}</span>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

