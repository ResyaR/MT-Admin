"use client";

export default function RevenueChart({ users = [] }) {
  // Calculate user registrations per day for last 7 days
  const calculateUserRegistrations = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const last7Days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date,
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
        value: 0
      });
    }
    
    // Count users registered on each day
    users.forEach(user => {
      // Support multiple field names: createdAt, created_at, joinDate, join_date
      const dateField = user.createdAt || user.created_at || user.joinDate || user.join_date;
      
      if (dateField) {
        try {
          const userDate = new Date(dateField);
          
          // Check if date is valid
          if (!isNaN(userDate.getTime())) {
            const dayData = last7Days.find(d => 
              d.date.toDateString() === userDate.toDateString()
            );
            if (dayData) {
              dayData.value++;
            }
          }
        } catch (error) {
          console.error('Error parsing date:', dateField, error);
        }
      }
    });
    
    return last7Days;
  };

  const data = calculateUserRegistrations();
  const maxValue = Math.max(...data.map(d => d.value), 1); // Min 1 to prevent division by zero
  const totalUsers = data.reduce((sum, d) => sum + d.value, 0);
  const avgUsers = (totalUsers / 7).toFixed(1);

  // Debug: Log user data to console
  console.log('📊 Chart Debug Info:');
  console.log('Total users received:', users.length);
  console.log('User data sample:', users.slice(0, 3));
  console.log('Chart data:', data);

  return (
    <div className="space-y-4">
      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between h-64 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
              <div 
                className="w-full bg-gradient-to-t from-[#E00000] to-[#FF6B6B] rounded-t-lg relative group hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '8px' : '0px' }}
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.value} {item.value === 1 ? 'user' : 'users'}
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#E00000] rounded-full"></div>
          <span className="text-sm text-gray-600">New Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Total (7 days):</span>
          <span className="text-sm text-gray-600">{totalUsers} users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Average:</span>
          <span className="text-sm text-gray-600">{avgUsers} users/day</span>
        </div>
      </div>
    </div>
  );
}

