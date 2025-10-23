"use client";

export default function AnalyticsDashboard() {
  const topRestaurants = [
    { name: "Coffee Academy", orders: 678, revenue: "Rp 18,560,000", growth: "+15%" },
    { name: "Mie Gacoan", orders: 1234, revenue: "Rp 15,450,000", growth: "+12%" },
    { name: "Geprek Bensu", orders: 1056, revenue: "Rp 12,340,000", growth: "+8%" },
    { name: "Mixue Ice Cream", orders: 892, revenue: "Rp 8,920,000", growth: "+5%" },
    { name: "Kebab Turki", orders: 445, revenue: "Rp 6,230,000", growth: "-2%" }
  ];

  const topDrivers = [
    { name: "Andi Kurniawan", deliveries: 234, rating: 4.9, earnings: "Rp 4,560,000" },
    { name: "Bambang Sutejo", deliveries: 198, rating: 4.8, earnings: "Rp 3,890,000" },
    { name: "Dedi Setiawan", deliveries: 176, rating: 4.7, earnings: "Rp 3,450,000" },
    { name: "Eko Prasetyo", deliveries: 154, rating: 4.8, earnings: "Rp 3,120,000" },
    { name: "Fajar Rahman", deliveries: 142, rating: 4.6, earnings: "Rp 2,890,000" }
  ];

  const hourlyOrders = [
    { hour: "00:00", orders: 12 },
    { hour: "02:00", orders: 5 },
    { hour: "04:00", orders: 3 },
    { hour: "06:00", orders: 8 },
    { hour: "08:00", orders: 45 },
    { hour: "10:00", orders: 78 },
    { hour: "12:00", orders: 156 },
    { hour: "14:00", orders: 134 },
    { hour: "16:00", orders: 98 },
    { hour: "18:00", orders: 187 },
    { hour: "20:00", orders: 165 },
    { hour: "22:00", orders: 89 }
  ];

  const maxOrders = Math.max(...hourlyOrders.map(h => h.orders));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
            <span className="material-symbols-outlined text-blue-500">payments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Rp 87,500</p>
          <p className="text-sm text-green-600 mt-1">+8.3% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Customer Retention</h3>
            <span className="material-symbols-outlined text-purple-500">autorenew</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">78.5%</p>
          <p className="text-sm text-green-600 mt-1">+5.2% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Delivery Time</h3>
            <span className="material-symbols-outlined text-orange-500">schedule</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">28 mins</p>
          <p className="text-sm text-green-600 mt-1">-3.1% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Customer Satisfaction</h3>
            <span className="material-symbols-outlined text-yellow-500">star</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">4.7/5.0</p>
          <p className="text-sm text-green-600 mt-1">+0.2 from last month</p>
        </div>
      </div>

      {/* Hourly Orders Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Orders by Hour</h2>
        <div className="flex items-end justify-between h-64 gap-2">
          {hourlyOrders.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-[#E00000] to-[#FF6B6B] rounded-t-lg relative group hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${(item.orders / maxOrders) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.orders} orders
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Restaurants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Restaurants</h2>
          <div className="space-y-3">
            {topRestaurants.map((restaurant, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-[#E00000] text-white rounded-lg font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{restaurant.name}</h3>
                  <p className="text-xs text-gray-500">{restaurant.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{restaurant.revenue}</p>
                  <p className={`text-xs ${restaurant.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {restaurant.growth}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Drivers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Drivers</h2>
          <div className="space-y-3">
            {topDrivers.map((driver, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{driver.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500 text-xs">star</span>
                    <span className="text-xs text-gray-500">{driver.rating} • {driver.deliveries} deliveries</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{driver.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

