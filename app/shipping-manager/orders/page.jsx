"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingManagerAuth } from '@/lib/shippingManagerAuth';
import ShippingManagerDeliveryAPI from '@/lib/shippingManagerDeliveryApi';

export default function ShippingManagerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    resiCode: true,
    customer: true,
    pickupLocation: true,
    dropoffLocation: true,
    type: true,
    status: true,
    price: true,
    action: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    if (!ShippingManagerAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadOrders();
    setCurrentPage(1); // Reset to first page when filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const resiCode = (order.resiCode || `MT-DEL-${String(order.id).padStart(6, '0')}`).toLowerCase();
        const customerName = (order.user?.fullName || order.user?.email || '').toLowerCase();
        const pickupLocation = (order.pickupLocation || '').toLowerCase();
        const dropoffLocation = (order.dropoffLocation || '').toLowerCase();
        const customerPhone = (order.user?.phone || '').toLowerCase();
        
        return resiCode.includes(searchLower) ||
               customerName.includes(searchLower) ||
               pickupLocation.includes(searchLower) ||
               dropoffLocation.includes(searchLower) ||
               customerPhone.includes(searchLower);
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const manager = ShippingManagerAuth.getManagerData();
      
      if (!manager || !manager.zone) {
        throw new Error('Manager data tidak ditemukan');
      }
      
      // Get deliveries by zone
      const data = await ShippingManagerDeliveryAPI.getDeliveriesByZone(
        manager.zone,
        statusFilter || undefined
      );
      
      setOrders(data || []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat pengiriman');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadOrders(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getAllValidStatuses = (currentStatus) => {
    // Shipping manager can change to any status for flexibility in tracking
    // Allow changing even from delivered status (in case of corrections)
    const allStatuses = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];
    
    // Only prevent changing from cancelled status
    if (currentStatus === 'cancelled') {
      return []; // Cannot change from cancelled
    }
    
    // Return all statuses except current status
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Diterima',
      picked_up: 'Diambil',
      in_transit: 'Dalam Perjalanan',
      delivered: 'Terkirim',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = (deliveryId, newStatus) => {
    setConfirmMessage(`Apakah Anda yakin ingin mengubah status menjadi "${getStatusLabel(newStatus)}"?`);
    setConfirmAction(() => async () => {
      try {
        setUpdatingStatus(deliveryId);
        setError('');
        setSuccessMessage('');
        
        // Optimistic update - update UI immediately
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === deliveryId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        // Update in backend
        await ShippingManagerDeliveryAPI.updateStatus(deliveryId, newStatus);
        
        setSuccessMessage('Status berhasil diupdate!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Reload orders to ensure data is in sync
        await loadOrders();
      } catch (err) {
        // Revert optimistic update on error
        await loadOrders();
        setError(err?.message || 'Gagal mengupdate status');
      } finally {
        setUpdatingStatus(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Mask email - hanya tampilkan beberapa karakter awal dan domain
  const maskEmail = (email) => {
    if (!email || email === 'N/A' || email.trim() === '') return 'N/A';
    const emailStr = String(email).trim();
    const [localPart, domain] = emailStr.split('@');
    if (!domain || !localPart) return emailStr;
    
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    } else if (localPart.length <= 4) {
      return `${localPart.substring(0, 2)}***@${domain}`;
    } else {
      return `${localPart.substring(0, 3)}***@${domain}`;
    }
  };

  // Mask phone - hanya tampilkan beberapa angka awal dan akhir
  const maskPhone = (phone) => {
    if (!phone || phone === 'N/A' || phone.trim() === '') return 'N/A';
    // Remove non-digit characters
    const digits = String(phone).replace(/\D/g, '');
    
    if (digits.length === 0) return 'N/A';
    if (digits.length <= 4) {
      return `${digits.substring(0, 2)}***`;
    } else if (digits.length <= 8) {
      return `${digits.substring(0, 3)}****${digits.substring(digits.length - 2)}`;
    } else {
      return `${digits.substring(0, 4)}****${digits.substring(digits.length - 3)}`;
    }
  };

  // Print Resi
  const handlePrintResi = (delivery) => {
    const resiCode = delivery.resiCode || `MT-DEL-${String(delivery.id).padStart(6, '0')}`;
    
    // Handle customer name - if no fullName or name contains @ (email), use masked email
    let customerName = delivery.user?.fullName || '';
    if (!customerName || customerName.trim() === '' || customerName.includes('@')) {
      // If no fullName or name is an email, use masked email as name
      customerName = delivery.user?.email ? maskEmail(delivery.user.email) : 'N/A';
    } else {
      // If fullName exists and not email, use it as is (but limit length)
      customerName = customerName.length > 25 ? customerName.substring(0, 25) + '...' : customerName;
    }
    
    const customerEmail = maskEmail(delivery.user?.email || 'N/A');
    const customerPhone = maskPhone(delivery.user?.phone || 'N/A');
    const pickupLocation = delivery.pickupLocation || 'N/A';
    const dropoffLocation = delivery.dropoffLocation || 'N/A';
    const pickupAddress = delivery.pickupAddress || pickupLocation;
    const dropoffAddress = delivery.dropoffAddress || dropoffLocation;
    const type = delivery.type?.replace('_', ' ') || 'N/A';
    const status = getStatusLabel(delivery.status);
    const price = formatCurrency(delivery.price);
    const createdAt = formatDate(delivery.createdAt);
    const scheduledDate = delivery.scheduledDate 
      ? new Date(delivery.scheduledDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;
    const scheduleTimeSlot = delivery.scheduleTimeSlot || null;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resi Pengiriman - ${resiCode}</title>
          <style>
            @media print {
              @page {
                size: 100mm auto;
                margin: 1mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 2px;
              background: white;
              color: #000;
              font-size: 7px;
            }
            .resi-container {
              max-width: 98mm;
              margin: 0 auto;
              padding: 2px;
              background: white;
              border: 1px solid #000;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #E00000;
              padding-bottom: 2px;
              margin-bottom: 2px;
            }
            .header h1 {
              color: #E00000;
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 0;
              line-height: 1.1;
            }
            .header p {
              font-size: 6px;
              color: #666;
              margin: 0;
            }
            .resi-code {
              text-align: center;
              background: #f5f5f5;
              padding: 2px;
              margin: 2px 0;
              border: 1px dashed #E00000;
            }
            .resi-code h2 {
              color: #E00000;
              font-size: 9px;
              font-weight: bold;
              letter-spacing: 0.5px;
              margin: 0;
              line-height: 1.2;
            }
            .section {
              margin: 1px 0;
              padding: 1px;
            }
            .section-title {
              font-size: 6px;
              font-weight: bold;
              color: #E00000;
              margin-bottom: 1px;
              padding-bottom: 0;
              border-bottom: 1px solid #E00000;
              line-height: 1.1;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 0.5px 0;
              font-size: 6px;
              line-height: 1.1;
            }
            .info-label {
              font-weight: bold;
              color: #333;
              width: 35%;
            }
            .info-value {
              color: #000;
              width: 65%;
              text-align: right;
              word-break: break-word;
            }
            .address-box {
              background: #f9f9f9;
              padding: 2px;
              margin-top: 1px;
              border-left: 1px solid #E00000;
              font-size: 6px;
              line-height: 1.1;
            }
            .footer {
              margin-top: 2px;
              padding-top: 1px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 5px;
              color: #666;
              line-height: 1.1;
            }
            .barcode-placeholder {
              text-align: center;
              margin: 1px 0;
              padding: 2px;
              background: #f5f5f5;
              border: 1px dashed #ccc;
              font-size: 7px;
              font-family: monospace;
              line-height: 1.1;
            }
            .print-button {
              text-align: center;
              margin: 20px 0;
            }
            .print-button button {
              background: #E00000;
              color: white;
              padding: 12px 30px;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            }
            .print-button button:hover {
              background: #B70000;
            }
          </style>
        </head>
        <body>
          <div class="resi-container">
            <div class="header">
              <h1>MT TRANS</h1>
              <p>YOUR BEST DELIVERY</p>
            </div>
            
            <div class="resi-code">
              <h2>${resiCode}</h2>
            </div>
            
            <div class="section" style="margin: 1px 0;">
              <div class="section-title">CUSTOMER</div>
              <div class="info-row">
                <span class="info-label">Nama:</span>
                <span class="info-value">${customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Telp:</span>
                <span class="info-value">${customerPhone}</span>
              </div>
            </div>
            
            <div class="section" style="margin: 1px 0;">
              <div class="section-title">DARI</div>
              <div class="address-box" style="padding: 1px;">
                ${pickupAddress.length > 50 ? pickupAddress.substring(0, 50) + '...' : pickupAddress}
              </div>
            </div>
            
            <div class="section" style="margin: 1px 0;">
              <div class="section-title">KE</div>
              <div class="address-box" style="padding: 1px;">
                ${dropoffAddress.length > 50 ? dropoffAddress.substring(0, 50) + '...' : dropoffAddress}
              </div>
            </div>
            
            ${delivery.barang ? `
            <div class="section" style="margin: 1px 0;">
              <div class="section-title">BARANG</div>
              <div class="info-row">
                <span class="info-label">Item:</span>
                <span class="info-value">${(delivery.barang.itemName || 'N/A').length > 30 ? (delivery.barang.itemName || 'N/A').substring(0, 30) + '...' : (delivery.barang.itemName || 'N/A')}</span>
              </div>
              ${delivery.barang.weight ? `
              <div class="info-row">
                <span class="info-label">Berat:</span>
                <span class="info-value">${delivery.barang.weight} kg</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            ${delivery.packageDetails ? `
            <div class="section" style="margin: 1px 0;">
              <div class="section-title">PAKET</div>
              <div class="info-row">
                <span class="info-label">Berat:</span>
                <span class="info-value">${delivery.packageDetails.weight} kg</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ukuran:</span>
                <span class="info-value">${delivery.packageDetails.length}×${delivery.packageDetails.width}×${delivery.packageDetails.height} cm</span>
              </div>
            </div>
            ` : ''}
            
            ${delivery.notes ? `
            <div class="section">
              <div class="section-title">CATATAN</div>
              <div class="address-box" style="font-size: 5px; padding: 1px;">
                ${delivery.notes}
              </div>
            </div>
            ` : ''}
            
            <div class="barcode-placeholder" style="margin: 1px 0; padding: 1px;">
              <p style="font-size: 7px; color: #000; font-family: monospace; font-weight: bold; margin: 0;">${resiCode}</p>
            </div>
            
            <div class="footer" style="margin-top: 1px; padding-top: 1px;">
              <p style="margin: 0;">MT TRANS - ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div class="print-button no-print">
            <button onclick="window.print()">🖨️ Print Resi</button>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const dataToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    
    if (dataToExport.length === 0) {
      setError('Tidak ada data untuk diekspor');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Prepare CSV headers
    const headers = [
      'Kode Resi',
      'Customer',
      'Email',
      'Phone',
      'Alamat Penjemputan',
      'Alamat Tujuan',
      'Jenis',
      'Status',
      'Total Biaya',
      'Tanggal Dibuat',
      'Tanggal Dijadwalkan',
      'Waktu Dijadwalkan'
    ];

    // Prepare CSV rows
    const rows = dataToExport.map(order => {
      const resiCode = order.resiCode || `MT-DEL-${String(order.id).padStart(6, '0')}`;
      const customerName = order.user?.fullName || order.user?.email || 'N/A';
      const customerEmail = order.user?.email || 'N/A';
      const customerPhone = order.user?.phone || 'N/A';
      const pickupLocation = order.pickupLocation || 'N/A';
      const dropoffLocation = order.dropoffLocation || 'N/A';
      const type = order.type?.replace('_', ' ') || 'N/A';
      const status = getStatusLabel(order.status);
      const price = formatCurrency(order.price);
      const createdAt = formatDate(order.createdAt);
      const scheduledDate = order.scheduledDate 
        ? new Date(order.scheduledDate).toLocaleDateString('id-ID')
        : 'N/A';
      const scheduleTimeSlot = order.scheduleTimeSlot || 'N/A';

      return [
        resiCode,
        customerName,
        customerEmail,
        customerPhone,
        pickupLocation,
        dropoffLocation,
        type,
        status,
        price,
        createdAt,
        scheduledDate,
        scheduleTimeSlot
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.setAttribute('download', `pengiriman_${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage('Data berhasil diekspor!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengiriman</h1>
              <p className="text-gray-600 mt-1">Semua pengiriman di zona Anda</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari kode resi, customer, alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>

              {/* Column Visibility Button */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-semibold"
                  title="Pilih kolom yang ditampilkan"
                >
                  <span className="material-symbols-outlined text-lg">view_column</span>
                  Kolom
                </button>
                
                {showColumnMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowColumnMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Tampilkan Kolom</div>
                      <div className="space-y-2">
                        {Object.entries({
                          resiCode: 'Kode Resi',
                          customer: 'Customer',
                          pickupLocation: 'Alamat Penjemputan',
                          dropoffLocation: 'Alamat Tujuan',
                          type: 'Jenis',
                          status: 'Status',
                          price: 'Total',
                          action: 'Aksi'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={visibleColumns[key]}
                              onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 text-[#E00000] border-gray-300 rounded focus:ring-[#E00000]"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                title="Export ke CSV"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat pengiriman...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">local_shipping</span>
            <p className="text-gray-600">
              {searchTerm || statusFilter 
                ? 'Tidak ada pengiriman yang sesuai dengan filter' 
                : 'Belum ada pengiriman di zona Anda'}
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="mt-4 px-4 py-2 text-sm text-[#E00000] hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Items Per Page Selector */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Tampilkan:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
              <div className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} pengiriman
                {searchTerm && (
                  <span className="ml-2 text-gray-500">
                    (dari {orders.length} total)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {visibleColumns.resiCode && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode Resi</th>
                      )}
                      {visibleColumns.customer && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                      )}
                      {visibleColumns.pickupLocation && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Penjemputan</th>
                      )}
                      {visibleColumns.dropoffLocation && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Tujuan</th>
                      )}
                      {visibleColumns.type && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis</th>
                      )}
                      {visibleColumns.status && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      )}
                      {visibleColumns.price && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      )}
                      {visibleColumns.action && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                      {visibleColumns.resiCode && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-mono font-bold text-gray-900">
                              {delivery.resiCode || `MT-DEL-${String(delivery.id).padStart(6, '0')}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(delivery.createdAt)}</p>
                          </div>
                        </td>
                      )}
                      {visibleColumns.customer && (
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {delivery.user?.fullName || delivery.user?.email || 'N/A'}
                            </p>
                            {delivery.deliveryZone && (
                              <p className="text-xs text-gray-500">Zona {delivery.deliveryZone}</p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.pickupLocation && (
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900 max-w-xs truncate" title={delivery.pickupLocation}>
                            {delivery.pickupLocation}
                          </p>
                        </td>
                      )}
                      {visibleColumns.dropoffLocation && (
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm text-gray-900 max-w-xs truncate" title={delivery.dropoffLocation}>
                              {delivery.dropoffLocation}
                            </p>
                            {delivery.scheduledDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(delivery.scheduledDate).toLocaleDateString('id-ID')} {delivery.scheduleTimeSlot}
                              </p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.type && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-600 capitalize">{delivery.type.replace('_', ' ')}</span>
                          {delivery.barang && (
                            <p className="text-xs text-gray-500 mt-1">{delivery.barang.itemName}</p>
                          )}
                          {delivery.packageDetails && (
                            <p className="text-xs text-gray-500 mt-1">
                              {delivery.packageDetails.weight} kg
                            </p>
                          )}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('_', ' ')}
                          </span>
                        </td>
                      )}
                      {visibleColumns.price && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(delivery.price)}</p>
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {delivery.status !== 'cancelled' ? (
                              <>
                                <select
                                  key={`status-${delivery.id}-${delivery.status}`}
                                  onChange={(e) => {
                                    if (e.target.value && e.target.value !== delivery.status) {
                                      handleUpdateStatus(delivery.id, e.target.value);
                                    }
                                  }}
                                  disabled={updatingStatus === delivery.id}
                                  value={delivery.status}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E00000] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value={delivery.status}>
                                    {getStatusLabel(delivery.status)}
                                  </option>
                                  {getAllValidStatuses(delivery.status).map((status) => (
                                    <option key={status} value={status}>
                                      {getStatusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                                {updatingStatus === delivery.id && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E00000]"></div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                            <button
                              onClick={() => handlePrintResi(delivery)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Print Resi"
                            >
                              <span className="material-symbols-outlined text-lg">print</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (() => {
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
            const getPageNumbers = () => {
              const pages = [];
              const maxVisible = 10; // Show max 10 page numbers
              
              if (totalPages <= maxVisible) {
                // Show all pages if total is less than maxVisible
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                // Calculate start and end of visible range
                let start = Math.max(2, currentPage - 2);
                let end = Math.min(totalPages - 1, currentPage + 2);
                
                // Adjust if we're near the start
                if (currentPage <= 4) {
                  end = Math.min(6, totalPages - 1);
                }
                
                // Adjust if we're near the end
                if (currentPage >= totalPages - 3) {
                  start = Math.max(2, totalPages - 5);
                }
                
                // Add ellipsis before range if needed
                if (start > 2) {
                  pages.push('...');
                }
                
                // Add visible range
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                // Add ellipsis after range if needed
                if (end < totalPages - 1) {
                  pages.push('...');
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages;
            };
            
            const pageNumbers = getPageNumbers();
            
            return (
              <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || totalPages <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[40px] ${
                              currentPage === page
                                ? 'bg-[#E00000] text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {totalPages === 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#E00000] text-white min-w-[40px] cursor-default"
                      >
                        1
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
              </div>
            );
          })()}
        </>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-4xl text-blue-600">help</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Konfirmasi</h2>
              <p className="text-gray-600 text-center mb-6">
                {confirmMessage}
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
