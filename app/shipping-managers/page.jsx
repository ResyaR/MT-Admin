"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShippingManagerAPI from '@/lib/shippingManagerApi';

export default function ShippingManagersPage() {
  const router = useRouter();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: 1,
    token: '',
  });
  const [regeneratingToken, setRegeneratingToken] = useState(null);
  const [copiedTokenId, setCopiedTokenId] = useState(null);
  const [showFullToken, setShowFullToken] = useState({});

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ShippingManagerAPI.getAll();
      setManagers(data);
    } catch (err) {
      setError(err?.message || 'Gagal memuat data shipping manager');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'zone' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (editingId) {
        // For update, send token only if it's changed (not empty)
        const updateData = { ...formData };
        if (!updateData.token || !updateData.token.trim()) {
          // If token is empty, don't send it (keep current token)
          delete updateData.token;
        }
        await ShippingManagerAPI.update(editingId, updateData);
      } else {
        // Kirim token hanya jika diisi, jika kosong akan auto-generate di backend
        const createData = { ...formData };
        if (!createData.token || !createData.token.trim()) {
          delete createData.token;
        }
        await ShippingManagerAPI.create(createData);
      }
      await loadManagers();
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', zone: 1, token: '' });
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan shipping manager');
    }
  };

  const handleEdit = (manager) => {
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      zone: manager.zone,
      token: manager.token || '', // Include current token for editing
    });
    setEditingId(manager.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus shipping manager ini?')) {
      return;
    }
    try {
      setError('');
      await ShippingManagerAPI.delete(id);
      await loadManagers();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus shipping manager');
    }
  };

  const handleRegenerateToken = async (id) => {
    if (!confirm('Apakah Anda yakin ingin regenerate token? Token lama tidak akan bisa digunakan lagi.')) {
      return;
    }
    try {
      setRegeneratingToken(id);
      setError('');
      await ShippingManagerAPI.regenerateToken(id);
      await loadManagers();
      alert('Token berhasil di-regenerate!');
    } catch (err) {
      setError(err?.message || 'Gagal regenerate token');
    } finally {
      setRegeneratingToken(null);
    }
  };

  const handleToggleActive = async (manager) => {
    try {
      setError('');
      await ShippingManagerAPI.update(manager.id, { isActive: !manager.isActive });
      await loadManagers();
    } catch (err) {
      setError(err?.message || 'Gagal mengupdate status');
    }
  };

  const handleCopyToken = async (token, id) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = token;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 2000);
    }
  };

  const toggleShowFullToken = (id) => {
    setShowFullToken(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const groupedByZone = managers.reduce((acc, manager) => {
    if (!acc[manager.zone]) {
      acc[manager.zone] = [];
    }
    acc[manager.zone].push(manager);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Managers</h1>
            <p className="text-gray-600 mt-1">Kelola shipping manager berdasarkan zona</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ name: '', email: '', phone: '', zone: 1, token: '' });
            }}
            className="bg-[#E00000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Shipping Manager
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Shipping Manager' : 'Tambah Shipping Manager Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zona (1-5) *
                  </label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  >
                    <option value={1}>Zona 1</option>
                    <option value={2}>Zona 2</option>
                    <option value={3}>Zona 3</option>
                    <option value={4}>Zona 4</option>
                    <option value={5}>Zona 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Token Login {editingId ? '' : '(Opsional)'}
                  </label>
                  <input
                    type="text"
                    name="token"
                    value={formData.token}
                    onChange={handleInputChange}
                    placeholder={editingId ? "Kosongkan untuk tetap menggunakan token saat ini" : "Kosongkan untuk auto-generate"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {editingId 
                      ? "Kosongkan untuk tetap menggunakan token saat ini, atau masukkan token baru. Token harus unik."
                      : "Jika dikosongkan, token akan dibuat otomatis. Token harus unik."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E00000] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ name: '', email: '', phone: '', zone: 1, token: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> {editingId 
                    ? "Anda dapat mengubah token dengan memasukkan token baru, atau mengosongkannya untuk tetap menggunakan token saat ini. Token harus unik."
                    : "Anda dapat memasukkan token custom atau mengosongkannya untuk auto-generate. Token harus unik dan digunakan untuk login di MT Panel."}
                </p>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">local_shipping</span>
            <p className="text-gray-600">Belum ada shipping manager</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((zone) => {
              const zoneManagers = groupedByZone[zone] || [];
              if (zoneManagers.length === 0) return null;

              return (
                <div key={zone} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E00000]">pin_drop</span>
                    Zona {zone}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zoneManagers.map((manager) => (
                      <div
                        key={manager.id}
                        className={`p-4 rounded-lg border-2 ${
                          manager.isActive
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{manager.name}</h3>
                            <p className="text-sm text-gray-600">{manager.email}</p>
                            <p className="text-sm text-gray-600">{manager.phone}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              manager.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {manager.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <div className="mb-3">
                          <label className="text-xs text-gray-500 mb-1 block">Token Login:</label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <code 
                                className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono break-all cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => toggleShowFullToken(manager.id)}
                                title="Klik untuk lihat/sembunyikan token lengkap"
                              >
                                {showFullToken[manager.id] ? manager.token : `${manager.token.substring(0, 30)}...`}
                              </code>
                              <button
                                onClick={() => handleCopyToken(manager.token, manager.id)}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-semibold flex items-center gap-1"
                                title="Copy Token"
                              >
                                {copiedTokenId === manager.id ? (
                                  <>
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                    Copy
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRegenerateToken(manager.id)}
                                disabled={regeneratingToken === manager.id}
                                className="px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
                                title="Regenerate Token"
                              >
                                {regeneratingToken === manager.id ? (
                                  <>
                                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                    ...
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    Regenerate
                                  </>
                                )}
                              </button>
                            </div>
                            {!showFullToken[manager.id] && (
                              <p className="text-xs text-gray-400 italic">Klik token untuk melihat lengkap</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(manager)}
                            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded ${
                              manager.isActive
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-green-200 text-green-700 hover:bg-green-300'
                            }`}
                          >
                            {manager.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => handleEdit(manager)}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(manager.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

