import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { 
  DashboardOverview, 
  DashboardActivity, 
  DashboardKPIs 
} from '../types';

// Internal state type to hold all dashboard data
interface DashboardData {
  overview: DashboardOverview | null;
  activity: DashboardActivity[];
  kpis: DashboardKPIs | null;
  deadlines: any[]; // Combined list
  engagementStatus: Record<string, number>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    overview: null,
    activity: [],
    kpis: null,
    deadlines: [],
    engagementStatus: {},
  });
  const [loading, setLoading] = useState(true);

  // Helper to safely extract data property
  const safeExtract = (res: any, isArray = false) => {
    const val = res?.data !== undefined ? res.data : res;
    if (isArray) return Array.isArray(val) ? val : [];
    return val || (isArray ? [] : {});
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, activityRes, deadlinesRes, kpisRes, statusRes] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getRecentActivity(),
          apiClient.getUpcomingDeadlines(),
          apiClient.getKPIs(),
          apiClient.getEngagementStatus()
        ]);

        const overview = safeExtract(overviewRes);
        const activity = safeExtract(activityRes, true);
        const kpis = safeExtract(kpisRes);
        const status = safeExtract(statusRes);
        
        // Process deadlines: combine engagements and pbcRequests
        const rawDeadlines = safeExtract(deadlinesRes);
        const combinedDeadlines = [
          ...(rawDeadlines.engagements || []).map((d: any) => ({ ...d, type: 'Engagement' })),
          ...(rawDeadlines.pbcRequests || []).map((d: any) => ({ ...d, type: 'PBC Request' }))
        ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        setData({
          overview,
          activity,
          kpis,
          deadlines: combinedDeadlines,
          engagementStatus: status
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // --- Prepare Data for UI ---

  // 1. Stat Cards
  const statCards = [
    {
      name: 'Total Clients',
      value: data.overview?.clients?.total || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Engagements',
      value: data.overview?.engagements?.active || 0,
      icon: BriefcaseIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Actions',
      // Sum of pending PBCs and overdue workpapers from overview.workload
      value: (data.overview?.workload?.pendingPBCs || 0) + (data.overview?.workload?.overdueWorkpapers || 0),
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Revenue Generated',
      value: `$${(data.kpis?.kpis?.revenueGenerated || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
  ];

  // 2. Charts Data
  // Note: The API doesn't provide monthly revenue trends yet, using mock for visual
  // If you have a specific endpoint for trends, we can swap this.
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 3000 },
    { month: 'Apr', revenue: 5000 },
    { month: 'May', revenue: 2000 },
    { month: 'Jun', revenue: 3000 },
  ];

  // Engagement Status for Pie Chart
  // If API returns empty object {}, we show a default empty state
  const statusData = Object.keys(data.engagementStatus).length > 0 
    ? Object.entries(data.engagementStatus).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Active', value: data.overview?.engagements?.active || 0 },
        { name: 'Completed', value: data.overview?.engagements?.completed || 0 }
      ].filter(d => d.value > 0);
  
  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend (YTD)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Status</h3>
          {statusData.length > 0 && statusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-400">
               No engagement data available
             </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Activity & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {data.activity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              data.activity.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.action.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                       {activity.description} • {activity.user}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {data.deadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            ) : (
              data.deadlines.slice(0, 5).map((deadline, index) => (
                <div key={deadline.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deadline.title || deadline.name || 'Untitled'}</p>
                      <p className="text-xs text-gray-500">{deadline.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;