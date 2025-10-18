import { useState, useEffect } from 'react';
import axios from '../services/api';

const DriverAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/drivers/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch driver analytics:', err);
      setError('Failed to load driver analytics');
    } finally {
      setLoading(false);
    }
  };

  // Circular progress component
  const CircularProgress = ({ value, max, label, color = 'blue', size = 120 }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`hsl(${color === 'blue' ? 220 : color === 'green' ? 142 : color === 'yellow' ? 48 : 220}, 70%, 50%)`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>
                {value}
              </div>
              {max > 0 && (
                <div className="text-xs text-gray-500">
                  of {max}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-700 text-center">
          {label}
        </div>
      </div>
    );
  };

  // Driver card component
  const DriverCard = ({ driver }) => {
    const successRate = driver.successRate || 0;

    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {driver.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{driver.name}</h3>
            <p className="text-sm text-gray-600">{driver.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{driver.deliveredDeliveries}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{driver.pendingDeliveries}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Success Rate Circle */}
          <div className="flex items-center justify-center">
            <CircularProgress
              value={successRate}
              max={100}
              label="Success Rate"
              color="green"
              size={80}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Recent Activity (7 days)</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{driver.recentDeliveries}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{driver.recentDelivered}</div>
                <div className="text-gray-600">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Driver Analytics Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{analytics.overall.totalDrivers}</div>
            <div className="text-blue-100">Total Drivers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{analytics.overall.totalDelivered}</div>
            <div className="text-blue-100">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{analytics.overall.totalPending}</div>
            <div className="text-blue-100">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{analytics.overall.averageSuccessRate}%</div>
            <div className="text-blue-100">Avg Success Rate</div>
          </div>
        </div>
      </div>

      {/* Individual Driver Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Individual Driver Performance</h3>
        {analytics.drivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No drivers found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.drivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Deliveries Circle */}
          <div className="flex items-center justify-center">
            <CircularProgress
              value={analytics.overall.totalDeliveries}
              max={analytics.overall.totalDeliveries}
              label="Total Deliveries"
              color="blue"
              size={100}
            />
          </div>

          {/* Success Rate Circle */}
          <div className="flex items-center justify-center">
            <CircularProgress
              value={analytics.overall.averageSuccessRate}
              max={100}
              label="Average Success Rate"
              color="green"
              size={100}
            />
          </div>

          {/* Active Drivers Circle */}
          <div className="flex items-center justify-center">
            <CircularProgress
              value={analytics.overall.activeDrivers}
              max={analytics.overall.totalDrivers}
              label="Active Drivers"
              color="yellow"
              size={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAnalytics;
