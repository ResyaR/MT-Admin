"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RestaurantAPI from "@/lib/restaurantApi";
import ImageUploadField from "./ImageUploadField";
import { uploadMenuImage } from "@/lib/uploadHelpers";

export default function MenuTable({ restaurantId }) {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    availability: true,
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
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [restaurantData, menusData] = await Promise.all([
        RestaurantAPI.getRestaurant(restaurantId),
        RestaurantAPI.getMenusByRestaurant(restaurantId),
      ]);
      setRestaurant(restaurantData);
      setMenus(menusData);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotif('Gagal memuat data', 'error');
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
      price: "",
      image: "",
      category: "",
      availability: true,
    });
    setSelectedImageFile(null);
    setIsImageDeleted(false);
    setShowAddModal(true);
  };

  const handleEditClick = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      name: menu.name || "",
      description: menu.description || "",
      price: menu.price || "",
      image: menu.image || "",
      category: menu.category || "",
      availability: menu.availability !== undefined ? menu.availability : true,
    });
    setSelectedImageFile(null);
    setIsImageDeleted(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = formData.image;

      // Upload image to Supabase if file is selected
      if (selectedImageFile) {
        const uploadResult = await uploadMenuImage(selectedImageFile, `temp-${Date.now()}`);
        
        if (!uploadResult.success) {
          showNotif(uploadResult.error || 'Gagal upload gambar', 'error');
          setIsUploading(false);
          return;
        }
        
        imageUrl = uploadResult.url;
      }

      await RestaurantAPI.createMenu({
        restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        availability: formData.availability,
      });
      showNotif('Menu berhasil ditambahkan');
      setShowAddModal(false);
      setSelectedImageFile(null);
      loadData();
    } catch (error) {
      console.error('Error adding menu:', error);
      showNotif('Gagal menambahkan menu', 'error');
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
        const uploadResult = await uploadMenuImage(selectedImageFile, selectedMenu.id.toString());
        
        if (!uploadResult.success) {
          showNotif(uploadResult.error || 'Gagal upload gambar', 'error');
          setIsUploading(false);
          return;
        }
        
        imageUrl = uploadResult.url;
      }

      await RestaurantAPI.updateMenu(selectedMenu.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        availability: formData.availability,
      });
      showNotif('Menu berhasil diupdate');
      setShowEditModal(false);
      setSelectedImageFile(null);
      setIsImageDeleted(false);
      loadData();
    } catch (error) {
      console.error('Error updating menu:', error);
      showNotif('Gagal mengupdate menu', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await RestaurantAPI.deleteMenu(selectedMenu.id);
      showNotif('Menu berhasil dihapus');
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      showNotif('Gagal menghapus menu', 'error');
    }
  };

  const handleToggleAvailability = async (menuId, currentAvailability) => {
    try {
      await RestaurantAPI.updateMenuAvailability(menuId, !currentAvailability);
      showNotif('Status availability diupdate');
      loadData();
    } catch (error) {
      showNotif('Gagal mengupdate availability', 'error');
    }
  };

  const filteredMenus = menus.filter(menu => 
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/restaurants')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {restaurant ? `Menu ${restaurant.name}` : 'Menu Management'}
            </h1>
            <p className="text-gray-600 mt-1">Kelola menu items untuk restaurant ini</p>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
              />
            </div>
          </div>
          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Menu
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      )}

      {/* Menu Table */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Menu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Harga</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenus.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={menu.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                        alt={menu.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { 
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          e.target.onerror = null; // Prevent infinite loop
                        }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{menu.name}</div>
                        <div className="text-xs text-gray-500">{menu.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {menu.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Rp {parseInt(menu.price).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleAvailability(menu.id, menu.availability)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        menu.availability 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {menu.availability ? 'Tersedia' : 'Habis'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEditClick(menu)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(menu)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {filteredMenus.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300">restaurant_menu</span>
              <p className="text-gray-500 mt-4">Belum ada menu</p>
            </div>
          )}
        </div>
      )}

      {/* Add Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Tambah Menu</h2>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu *</label>
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
                    placeholder="e.g. Main Course, Beverages"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
              </div>

              <ImageUploadField
                label="Gambar Menu"
                currentImage={formData.image}
                onImageChange={(file) => setSelectedImageFile(file)}
                maxSize={5}
              />

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#E00000] rounded focus:ring-[#E00000]"
                  />
                  <span className="text-sm font-medium text-gray-700">Menu tersedia</span>
                </label>
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
                  {isUploading ? 'Mengupload...' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Menu</h2>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
              </div>

              <ImageUploadField
                label="Gambar Menu"
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

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#E00000] rounded focus:ring-[#E00000]"
                  />
                  <span className="text-sm font-medium text-gray-700">Menu tersedia</span>
                </label>
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
      {showDeleteModal && selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hapus Menu</h3>
                <p className="text-sm text-gray-600">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus menu <strong>{selectedMenu.name}</strong>?
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

