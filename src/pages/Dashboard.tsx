import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import  apiClient  from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { DashboardStats, Activity, Deadline } from '../types';

type PieLabelRenderProps = {
  name?: string;
  percent?: number;
};


const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overview, activity, deadlines, kpis] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getRecentActivity(),
          apiClient.getUpcomingDeadlines(),
          apiClient.getKPIs(),
        ]);

        setStats({
          totalClients: overview.data.totalClients || 0,
          activeEngagements: overview.data.activeEngagements || 0,
          pendingInvoices: overview.data.pendingInvoices || 0,
          totalRevenue: overview.data.totalRevenue || 0,
          recentActivity: activity.data || [],
          upcomingDeadlines: deadlines.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values on error
        setStats({
          totalClients: 0,
          activeEngagements: 0,
          pendingInvoices: 0,
          totalRevenue: 0,
          recentActivity: [],
          upcomingDeadlines: [],
        });
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

  const statCards = [
    {
      name: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Active Engagements',
      value: stats?.activeEngagements || 0,
      icon: BriefcaseIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Pending Invoices',
      value: stats?.pendingInvoices || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: '-3%',
      changeType: 'decrease',
    },
    {
      name: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase',
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const engagementData = [
    { name: 'Audit', value: 35, color: '#3B82F6' },
    { name: 'Tax', value: 25, color: '#10B981' },
    { name: 'Consulting', value: 20, color: '#F59E0B' },
    { name: 'Advisory', value: 20, color: '#EF4444' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <div className="mt-4 flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'increase'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
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

        {/* Engagement Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
               >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats?.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              stats?.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      <p className="text-xs text-gray-500">
                          by {activity.user} • {new Date(activity.timestamp ?? Date.now()).toLocaleDateString()}
                      </p>
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
            {stats?.upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            ) : (
              stats?.upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                <div key={deadline.id || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                      <p className="text-xs text-gray-500">{deadline.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        deadline.priority ?? 'low' // fallback to "low" priority
                       )}`}
                      >
                       {deadline.priority ?? 'low'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {deadline.dueDate
                        ? new Date(deadline.dueDate).toLocaleDateString()
                         : 'No due date'}
                    </span>
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