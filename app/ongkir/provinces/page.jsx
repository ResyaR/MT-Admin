"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminAPI from "@/lib/adminApi";

export default function ProvincesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, totalCities, totalKota, totalKabupaten
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const citiesData = await AdminAPI.getCities();
      
    // Group by province and calculate statistics
    const provinceStats = {};
    
    citiesData.forEach(city => {
      if (!provinceStats[city.province]) {
        provinceStats[city.province] = {
          name: city.province,
          totalCities: 0,
          totalKota: 0,
          totalKabupaten: 0,
          zone: city.zone || '-',
          cities: []
        };
      }
      
      provinceStats[city.province].totalCities++;
      if (city.type === 'Kota') {
        provinceStats[city.province].totalKota++;
      } else {
        provinceStats[city.province].totalKabupaten++;
      }
      provinceStats[city.province].cities.push(city);
    });
    
    setProvinces(Object.values(provinceStats));
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort
  const filteredProvinces = provinces
    .filter(province => 
      province.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'id');
        case 'zone':
          return (a.zone || 99) - (b.zone || 99);
        case 'totalCities':
          return b.totalCities - a.totalCities;
        case 'totalKota':
          return b.totalKota - a.totalKota;
        case 'totalKabupaten':
          return b.totalKabupaten - a.totalKabupaten;
        default:
          return 0;
      }
    });

  const handleViewCities = (provinceName) => {
    router.push(`/ongkir/cities?province=${encodeURIComponent(provinceName)}`);
  };

  // Calculate totals
  const totalProvinces = provinces.length; // Use original provinces for total
  const totalAllCities = provinces.reduce((sum, p) => sum + p.totalCities, 0);
  const totalAllKota = provinces.reduce((sum, p) => sum + p.totalKota, 0);
  const totalAllKabupaten = provinces.reduce((sum, p) => sum + p.totalKabupaten, 0);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProvinces = filteredProvinces.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProvinces.length / itemsPerPage);

  const handleAddProvince = () => {
    router.push('/ongkir/cities');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Provinsi</h1>
        <p className="text-gray-600 mt-1">Statistik wilayah per provinsi di Indonesia</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#E00000] to-[#B70000] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Total Provinsi</div>
              <div className="text-3xl font-bold">{totalProvinces}</div>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">public</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#E00000] to-[#B70000] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Total Wilayah</div>
              <div className="text-3xl font-bold">{totalAllCities}</div>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">location_city</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#E00000] to-[#B70000] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Total Kota</div>
              <div className="text-3xl font-bold">{totalAllKota}</div>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">apartment</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#E00000] to-[#B70000] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Total Kabupaten</div>
              <div className="text-3xl font-bold">{totalAllKabupaten}</div>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">domain</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header & Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Provinsi</h2>
            <button
              onClick={handleAddProvince}
              className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Tambah Provinsi
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari provinsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent whitespace-nowrap"
            >
              <option value="name">Urutkan: Nama A-Z</option>
              <option value="zone">Urutkan: Zona</option>
              <option value="totalCities">Urutkan: Total Wilayah</option>
              <option value="totalKota">Urutkan: Total Kota</option>
              <option value="totalKabupaten">Urutkan: Total Kabupaten</option>
            </select>
            
            {/* Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E00000] focus:border-transparent whitespace-nowrap"
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading provinsi...</p>
          </div>
        ) : filteredProvinces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="material-symbols-outlined text-6xl">public</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Hasil</h3>
            <p className="text-gray-600">Coba ubah pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provinsi</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Zona</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Wilayah</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Kota</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Kabupaten</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProvinces.map((province, index) => (
                  <tr key={province.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#E00000] to-[#B70000] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-white text-lg">
                            public
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{province.name}</div>
                          <div className="text-xs text-gray-500">{province.totalCities} wilayah</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                        province.zone === 1 ? 'bg-blue-500' :
                        province.zone === 2 ? 'bg-green-500' :
                        province.zone === 3 ? 'bg-yellow-500' :
                        province.zone === 4 ? 'bg-purple-500' :
                        province.zone === 5 ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}>
                        Zona {province.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">{province.totalCities}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {province.totalKota}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        {province.totalKabupaten}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewCities(province.name)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-[#E00000] text-white rounded-lg text-sm font-medium hover:bg-[#B70000] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        Lihat Kota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredProvinces.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProvinces.length)} dari {filteredProvinces.length} provinsi
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-[#E00000] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

