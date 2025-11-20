"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RestaurantAPI from "@/lib/restaurantApi";
import ImageUploadField from "./ImageUploadField";
import { uploadRestaurantImage } from "@/lib/uploadHelpers";
import { testSupabaseConnection } from "@/lib/supabase";

export default function RestaurantsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    address: "",
    phone: "",
    openingTime: "",
    closingTime: "",
      status: "active",
  });

  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  useEffect(() => {
    loadRestaurants();
    // Test Supabase connection on mount
    testSupabaseConnection();
  }, []);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await RestaurantAPI.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      showNotif('Gagal memuat data restaurant', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      category: "",
      address: "",
      phone: "",
      openingTime: "",
      closingTime: "",
      status: "active",
    });
    setSelectedImageFile(null);
    setIsImageDeleted(false);
    setShowAddModal(true);
  };

  const handleEditClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData({
      name: restaurant.name || "",
      description: restaurant.description || "",
      image: restaurant.image || "",
      category: restaurant.category || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      openingTime: restaurant.openingTime || "",
      closingTime: restaurant.closingTime || "",
      status: restaurant.status || "active",
    });
    setSelectedImageFile(null);
    setIsImageDeleted(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = formData.image;

      // Upload image to Supabase if file is selected
      if (selectedImageFile) {
        const tempId = `temp-${Date.now()}`;
        const uploadResult = await uploadRestaurantImage(selectedImageFile, tempId);
        
        if (!uploadResult.success) {
          showNotif(uploadResult.error || 'Gagal upload gambar', 'error');
          setIsUploading(false);
          return;
        }
        
        imageUrl = uploadResult.url;
      }

      // Save to backend with image URL
      await RestaurantAPI.createRestaurant({
        ...formData,
        image: imageUrl,
      });
      
      showNotif('Restaurant berhasil ditambahkan');
      setShowAddModal(false);
      setSelectedImageFile(null);
      loadRestaurants();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      showNotif('Gagal menambahkan restaurant', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = formData.image;

      // If image was deleted, set to empty string
      if (isImageDeleted) {
        imageUrl = '';
        console.log('🗑️ Image deleted, setting to empty string');
      }
      // Upload new image to Supabase if file is selected
      else if (selectedImageFile) {
        const uploadResult = await uploadRestaurantImage(selectedImageFile, selectedRestaurant.id.toString());
        
        if (!uploadResult.success) {
          showNotif(uploadResult.error || 'Gagal upload gambar', 'error');
          setIsUploading(false);
          return;
        }
        
        imageUrl = uploadResult.url;
      }

      // Update backend with new data
      await RestaurantAPI.updateRestaurant(selectedRestaurant.id, {
        ...formData,
        image: imageUrl,
      });
      
      showNotif('Restaurant berhasil diupdate');
      setShowEditModal(false);
      setSelectedImageFile(null);
      setIsImageDeleted(false);
      loadRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      showNotif('Gagal mengupdate restaurant', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await RestaurantAPI.deleteRestaurant(selectedRestaurant.id);
      showNotif('Restaurant berhasil dihapus');
      setShowDeleteModal(false);
      loadRestaurants();
    } catch (error) {
      showNotif('Gagal menghapus restaurant', 'error');
    }
  };

  const handleManageMenu = (restaurantId) => {
    router.push(`/restaurants/${restaurantId}/menus`);
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Notification Toast */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-down ${
          notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notificationMessage}
        </div>
      )}

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
                placeholder="Cari restaurant..."
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
          </select>
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Restaurant
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
                src={restaurant.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
                onError={(e) => { 
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  e.target.onerror = null; // Prevent infinite loop
                }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                {getStatusBadge(restaurant.status)}
              </div>
              <p className="text-sm text-gray-600 mb-3">{restaurant.category}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                <span className="text-sm font-semibold text-gray-900">{restaurant.rating}</span>
                <span className="text-sm text-gray-500">({restaurant.totalOrders} orders)</span>
              </div>

              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleManageMenu(restaurant.id)}
                    className="flex-1 px-3 py-2 border border-[#E00000] text-[#E00000] rounded-lg text-sm font-medium hover:bg-[#E00000] hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                    Menu
                </button>
                  <button 
                    onClick={() => handleEditClick(restaurant)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(restaurant)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Tambah Restaurant</h2>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Restaurant *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Noodles, Cafe, Indonesian"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
              </div>

              <ImageUploadField
                label="Gambar Restaurant"
                currentImage={formData.image}
                onImageChange={(file) => setSelectedImageFile(file)}
                maxSize={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Mengupload...' : 'Tambah Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Restaurant</h2>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Restaurant *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
              </div>

              <ImageUploadField
                label="Gambar Restaurant"
                currentImage={formData.image}
                onImageChange={(file) => {
                  setSelectedImageFile(file);
                  if (file === null) {
                    // User removed the image
                    setIsImageDeleted(true);
                    setFormData({ ...formData, image: '' });
                    console.log('🗑️ User removed image');
                  } else {
                    // User selected a new image
                    setIsImageDeleted(false);
                  }
                }}
                maxSize={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Mengupload...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hapus Restaurant</h3>
                <p className="text-sm text-gray-600">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus restaurant <strong>{selectedRestaurant.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
