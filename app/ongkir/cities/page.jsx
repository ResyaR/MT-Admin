"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdminAPI from "@/lib/adminApi";

export default function CitiesPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCity, setSelectedCity] = useState(null);
  const [formData, setFormData] = useState({
    province: '',
    name: '',
    type: 'Kota',
    postalCode: '',
    zone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isNewProvince, setIsNewProvince] = useState(false);
  const [customProvince, setCustomProvince] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
    
    // Set filter from URL parameter if exists
    const provinceParam = searchParams.get('province');
    if (provinceParam) {
      setFilterProvince(provinceParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Filter zones based on search and filters
    let filtered = [...zones];

    if (searchTerm) {
      filtered = filtered.filter(zone => 
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.province.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterProvince) {
      filtered = filtered.filter(zone => zone.province === filterProvince);
    }

    if (filterType) {
      filtered = filtered.filter(zone => zone.type === filterType);
    }

    // Sort alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'id'));

    setFilteredZones(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [zones, searchTerm, filterProvince, filterType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const zonesData = await AdminAPI.getDeliveryZones();
      setZones(zonesData);
      setFilteredZones(zonesData);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({
      province: '',
      name: '',
      type: 'Kota',
      postalCode: '',
      zone: ''
    });
    setIsNewProvince(false);
    setCustomProvince('');
    setShowModal(true);
  };

  const handleEditClick = (city) => {
    setModalMode('edit');
    setSelectedCity(city);
    setFormData({
      province: city.province || '',
      name: city.name || '',
      type: city.type || 'Kota',
      postalCode: city.postalCode || '',
      zone: city.zone ? String(city.zone) : ''
    });
    setIsNewProvince(false);
    setCustomProvince('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Use custom province if "new province" is selected
      const dataToSubmit = {
        ...formData,
        province: isNewProvince ? customProvince : formData.province
      };

      if (modalMode === 'add') {
        await AdminAPI.createCity(dataToSubmit);
      } else {
        await AdminAPI.updateCity(selectedCity.id, dataToSubmit);
      }
      
      setShowModal(false);
      loadData();
      setToast({
        show: true,
        message: modalMode === 'add' ? 'Kota berhasil ditambahkan!' : 'Kota berhasil diupdate!',
        type: 'success'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Error saving city:', error);
      setToast({
        show: true,
        message: 'Gagal menyimpan kota: ' + error.message,
        type: 'error'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cityId) => {
    setCityToDelete(cityId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;

    try {
      await AdminAPI.deleteCity(cityToDelete);
      loadData();
      setToast({
        show: true,
        message: 'Kota berhasil dihapus!',
        type: 'success'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Error deleting city:', error);
      setToast({
        show: true,
        message: 'Gagal menghapus kota: ' + error.message,
        type: 'error'
      });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setCityToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get unique provinces for filter
  const provinces = [...new Set(zones.map(z => z.province))].sort();

  // Pagination calculations
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentZones = filteredZones.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kota/Wilayah</h1>
        <p className="text-gray-600 mt-1">Kelola daftar kota dan wilayah layanan</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kota/Wilayah</h2>
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Kota
          </button>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Cari nama kota atau provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
            />
          </div>

          {/* Filter Provinsi */}
          <div>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          {/* Filter Tipe */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="Kota">Kota</option>
              <option value="Kabupaten">Kabupaten</option>
            </select>
          </div>
        </div>

        {/* Results Info & Per Page Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredZones.length)} dari {filteredZones.length} wilayah
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600">per halaman</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kota...</p>
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">location_city</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {zones.length === 0 ? 'Belum Ada Kota' : 'Tidak Ada Hasil'}
            </h3>
            <p className="text-gray-600 mb-4">
              {zones.length === 0 
                ? 'Tambahkan kota untuk mengatur tarif pengiriman.' 
                : 'Coba ubah filter atau pencarian Anda.'
              }
            </p>
            {zones.length === 0 && (
              <button 
                onClick={handleAddClick}
                className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors"
              >
                Tambah Kota Pertama
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Kota/Kabupaten</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provinsi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zona</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kode Pos</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentZones.map((zone, index) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{zone.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{zone.province}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          zone.type === 'Kota' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {zone.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                          zone.zone === 1 ? 'bg-blue-500' :
                          zone.zone === 2 ? 'bg-green-500' :
                          zone.zone === 3 ? 'bg-yellow-500' :
                          zone.zone === 4 ? 'bg-purple-500' :
                          zone.zone === 5 ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}>
                          Zona {zone.zone || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{zone.postalCode || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(zone.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(zone)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(zone.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-[#E00000] text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Tambah Kota Baru' : 'Edit Kota'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi
                </label>
                <select
                  value={isNewProvince ? '__new__' : formData.province}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsNewProvince(true);
                      setFormData({...formData, province: ''});
                    } else {
                      setIsNewProvince(false);
                      setCustomProvince('');
                      setFormData({...formData, province: e.target.value});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required={!isNewProvince}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                  <option value="__new__" className="font-semibold text-[#E00000]">
                    + Provinsi Baru (Ketik Manual)
                  </option>
                </select>
                
                {/* Input Manual untuk Provinsi Baru */}
                {isNewProvince && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customProvince}
                      onChange={(e) => setCustomProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E00000] rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                      placeholder="Ketik nama provinsi baru..."
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ✏️ Masukkan nama provinsi baru
                    </p>
                  </div>
                )}
                
                {!isNewProvince && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih dari dropdown atau pilih "Provinsi Baru" untuk ketik manual
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kota
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required
                  placeholder="e.g., Jakarta Selatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                >
                  <option value="Kota">Kota</option>
                  <option value="Kabupaten">Kabupaten</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  placeholder="e.g., 12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required
                >
                  <option value="">Pilih Zona</option>
                  <option value="1">Zona 1</option>
                  <option value="2">Zona 2</option>
                  <option value="3">Zona 3</option>
                  <option value="4">Zona 4</option>
                  <option value="5">Zona 5</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih zona tarif pengiriman untuk kota ini (1-5)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#E00000] text-white rounded-lg font-medium hover:bg-[#B70000] disabled:bg-gray-400"
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : modalMode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="ml-2 hover:opacity-70"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Hapus</h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus kota ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCityToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
