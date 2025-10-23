"use client";

import React, { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function ServicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimasi: '',
    baseRate: 0,
    multiplier: 1.0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const servicesData = await AdminAPI.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      estimasi: '',
      baseRate: 0,
      multiplier: 1.0
    });
    setShowModal(true);
  };

  const handleEditClick = (service) => {
    setModalMode('edit');
    setSelectedService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      estimasi: service.estimasi || '',
      baseRate: service.baseRate || 0,
      multiplier: service.multiplier || 1.0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (modalMode === 'add') {
        await AdminAPI.createService(formData);
      } else {
        await AdminAPI.updateService(selectedService.id, formData);
      }
      
      setShowModal(false);
      loadData();
      alert(modalMode === 'add' ? 'Layanan berhasil ditambahkan!' : 'Layanan berhasil diupdate!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Gagal menyimpan layanan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      return;
    }

    try {
      await AdminAPI.deleteService(serviceId);
      loadData();
      alert('Layanan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Gagal menghapus layanan: ' + error.message);
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

  const getServiceIcon = (name) => {
    if (name?.toLowerCase().includes('express')) return 'rocket_launch';
    if (name?.toLowerCase().includes('same') || name?.toLowerCase().includes('instant')) return 'bolt';
    return 'local_shipping';
  };
  
  const getServiceStyle = (name) => {
    if (name?.toLowerCase().includes('express')) {
      return { bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
    }
    if (name?.toLowerCase().includes('same') || name?.toLowerCase().includes('instant')) {
      return { bgColor: 'bg-purple-100', textColor: 'text-purple-600' };
    }
    return { bgColor: 'bg-green-100', textColor: 'text-green-600' };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jenis Layanan</h1>
        <p className="text-gray-600 mt-1">Kelola jenis layanan pengiriman</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Jenis Layanan Pengiriman</h2>
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Layanan
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading layanan...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">local_shipping</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Layanan</h3>
            <p className="text-gray-600 mb-4">Tambahkan jenis layanan pengiriman.</p>
            <button 
              onClick={handleAddClick}
              className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors"
            >
              Tambah Layanan Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const style = getServiceStyle(service.name);
              
              return (
                <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${style.bgColor} rounded-lg flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${style.textColor}`}>
                          {getServiceIcon(service.name)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.estimasi || 'Estimasi 2-3 hari'}</p>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">{service.description || ''}</p>
                    <div className="text-sm text-gray-600 mb-1">Base Rate (per kg)</div>
                    <div className="text-2xl font-bold text-[#E00000]">
                      Rp {(service.baseRate || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Multiplier: {service.multiplier}x</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(service)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Tambah Layanan Baru' : 'Edit Layanan'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required
                  placeholder="e.g., Express"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  rows="3"
                  placeholder="e.g., Pengiriman cepat dalam 1 hari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Waktu
                </label>
                <input
                  type="text"
                  value={formData.estimasi}
                  onChange={(e) => setFormData({...formData, estimasi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  placeholder="e.g., 1-2 hari"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Rate (per kg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.baseRate}
                  onChange={(e) => setFormData({...formData, baseRate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required
                  placeholder="e.g., 10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.multiplier}
                  onChange={(e) => setFormData({...formData, multiplier: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Faktor pengali untuk tarif dasar
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
    </div>
  );
}
