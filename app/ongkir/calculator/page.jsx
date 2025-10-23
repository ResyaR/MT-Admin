"use client";

import React, { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function CalculatorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);
  const [calculatorData, setCalculatorData] = useState({
    weight: '',
    originCity: null,
    destinationCity: null,
    serviceId: '',
    result: null
  });

  // Autocomplete states
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-origin')) {
        setShowOriginDropdown(false);
      }
      if (!event.target.closest('.autocomplete-destination')) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [citiesData, servicesData] = await Promise.all([
        AdminAPI.getCities(),
        AdminAPI.getServices()
      ]);
      setCities(citiesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter cities based on search
  const filteredOriginCities = cities.filter(city =>
    city.name.toLowerCase().includes(originSearch.toLowerCase()) ||
    city.province.toLowerCase().includes(originSearch.toLowerCase())
  ).slice(0, 10); // Limit to 10 results

  const filteredDestinationCities = cities.filter(city =>
    city.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    city.province.toLowerCase().includes(destinationSearch.toLowerCase())
  ).slice(0, 10);

  const handleCalculate = async () => {
    if (!calculatorData.originCity) {
      alert('Pilih kota asal');
      return;
    }
    if (!calculatorData.destinationCity) {
      alert('Pilih kota tujuan');
      return;
    }
    if (!calculatorData.weight) {
      alert('Masukkan berat paket');
      return;
    }
    if (!calculatorData.serviceId) {
      alert('Pilih jenis layanan');
      return;
    }

    try {
      // Call API to calculate with zone tariff
      const response = await AdminAPI.calculateOngkirByZone({
        originCityId: calculatorData.originCity.id,
        destCityId: calculatorData.destinationCity.id,
        serviceId: parseInt(calculatorData.serviceId),
        weight: parseFloat(calculatorData.weight),
      });
      
      setCalculatorData(prev => ({
        ...prev,
        result: response
      }));
    } catch (error) {
      console.error('Error calculating price:', error);
      alert('Gagal menghitung ongkir: ' + (error.message || 'Tarif zona belum dikonfigurasi'));
    }
  };

  const handleSelectOrigin = (city) => {
    setCalculatorData(prev => ({ ...prev, originCity: city }));
    setOriginSearch(`${city.name}, ${city.province}`);
    setShowOriginDropdown(false);
  };

  const handleSelectDestination = (city) => {
    setCalculatorData(prev => ({ ...prev, destinationCity: city }));
    setDestinationSearch(`${city.name}, ${city.province}`);
    setShowDestinationDropdown(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cek Ongkir</h1>
        <p className="text-gray-600 mt-1">Simulasi perhitungan biaya pengiriman</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Simulasi Cek Ongkir</h2>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Kota Asal - Autocomplete */}
              <div className="relative autocomplete-origin">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="material-symbols-outlined text-sm align-middle">location_on</span> Kota Asal
                </label>
                <input
                  type="text"
                  value={originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  placeholder="Ketik nama kota asal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
                
                {showOriginDropdown && originSearch && filteredOriginCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOriginCities.map(city => (
                      <div
                        key={city.id}
                        onClick={() => handleSelectOrigin(city)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-xs text-gray-500">{city.province} • {city.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kota Tujuan - Autocomplete */}
              <div className="relative autocomplete-destination">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="material-symbols-outlined text-sm align-middle">my_location</span> Kota Tujuan
                </label>
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value);
                    setShowDestinationDropdown(true);
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  placeholder="Ketik nama kota tujuan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
                
                {showDestinationDropdown && destinationSearch && filteredDestinationCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDestinationCities.map(city => (
                      <div
                        key={city.id}
                        onClick={() => handleSelectDestination(city)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-xs text-gray-500">{city.province} • {city.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="material-symbols-outlined text-sm align-middle">scale</span> Berat (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Contoh: 1.5"
                  value={calculatorData.weight}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="material-symbols-outlined text-sm align-middle">local_shipping</span> Jenis Layanan
                </label>
                <select 
                  value={calculatorData.serviceId}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, serviceId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                >
                  <option value="">Pilih Layanan</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.estimasi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full px-4 py-3 bg-[#E00000] text-white rounded-lg font-semibold hover:bg-[#B70000] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">calculate</span>
              Cek Ongkir
            </button>

            <div className="mt-6 p-6 bg-white rounded-lg border-2 border-[#E00000]">
              <div className="text-sm text-gray-600 mb-2">Estimasi Biaya Pengiriman:</div>
              <div className="text-4xl font-bold text-[#E00000] mb-4">
                Rp {calculatorData.result ? calculatorData.result.total.toLocaleString('id-ID') : '0'}
              </div>
              
              {calculatorData.result && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asal:</span>
                    <span className="font-semibold">
                      {calculatorData.result.originCity.name}, {calculatorData.result.originCity.province}
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        Zona {calculatorData.result.originCity.zone}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tujuan:</span>
                    <span className="font-semibold">
                      {calculatorData.result.destCity.name}, {calculatorData.result.destCity.province}
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                        Zona {calculatorData.result.destCity.zone}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Tarif Zona (per kg):</span>
                    <span className="font-semibold">Rp {calculatorData.result.baseTariff.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Berat:</span>
                    <span className="font-semibold">{calculatorData.result.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">Rp {calculatorData.result.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Faktor Layanan:</span>
                    <span className="font-semibold">{calculatorData.result.serviceMultiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Layanan:</span>
                    <span className="font-semibold">{calculatorData.result.service.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimasi:</span>
                    <span className="font-semibold">{calculatorData.result.service.estimasi}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mt-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Sistem Tarif Zona:</p>
              <p>Total = (Tarif Zona per kg × Berat) × Faktor Layanan</p>
              <p className="mt-2 text-xs">
                <strong>5 Zona:</strong> 1=Jawa&Bali | 2=Sumatera | 3=Kalimantan | 4=Sulawesi&NusaTenggara | 5=Maluku&Papua
              </p>
              <p className="mt-1 text-xs">💡 <strong>Tips:</strong> Ketik nama kota untuk mencari (contoh: "Jakarta", "Bandung")</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

