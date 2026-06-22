// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { DashboardOverview, DashboardActivity, DashboardDeadline, DashboardWorkload, DashboardKPIs } from '../types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Dashboard States
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [deadlines, setDeadlines] = useState<DashboardDeadline[]>([]);
  const [workload, setWorkload] = useState<DashboardWorkload[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, activityRes, deadlinesRes, workloadRes, kpisRes, statusRes] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getRecentActivity(),
          apiClient.getUpcomingDeadlines(),
          apiClient.getWorkload(),
          apiClient.getKPIs(),
          apiClient.getEngagementStatus()
        ]);

        // Map responses handling the Axios / API wrapper structure
        setOverview(overviewRes.data);
        setActivity(activityRes.data || []);
        
        // Flatten engagements and PBC deadlines into one timeline array
        const fetchedDeadlines = [
          ...(deadlinesRes.data?.engagements || []),
          ...(deadlinesRes.data?.pbcRequests || [])
        ].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        setDeadlines(fetchedDeadlines);

        setWorkload(workloadRes.data || []);
        setKpis(kpisRes.data);
        setStatusCounts(statusRes.data || {});

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
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // --- Process Data for Charts ---
  const PIE_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899'];
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // --- Stat Cards Configuration ---
  const statCards = [
    {
      name: 'Total Clients',
      value: overview?.clients?.total || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Active Engagements',
      value: overview?.engagements?.active || 0,
      icon: BriefcaseIcon,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
    {
      name: 'Unbilled Revenue',
      value: `$${(overview?.billing?.unbilledAmount || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
    {
      name: 'Action Items (PBC/WP)',
      value: (overview?.workload?.pendingPBCs || 0) + (overview?.workload?.overdueWorkpapers || 0),
      icon: ExclamationCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Firm Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of firm operations, workload, and billing.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">{stat.name}</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Engagement Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Engagement Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">No active statuses.</div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statusChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-slate-600 font-bold uppercase tracking-wider">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Team Workload (Active Engagements)</h3>
          {workload.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workload} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="user.firstName" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="activeEngagements" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No workload data available.</div>
          )}
        </div>
      </div>

      {/* Activity & Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Firm Activity Log</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {activity.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent activity.</p>
            ) : (
              activity.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-bold capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                       {log.description}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-indigo-600 font-bold">{log.user}</span>
                      <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3 flex-1">
            {deadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <ClockIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>No immediate deadlines.</p>
              </div>
            ) : (
              deadlines.slice(0, 6).map((deadline, index) => (
                <div key={deadline.id || index} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">{deadline.name}</p>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5 uppercase tracking-wider">{deadline.client || deadline.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-600">
                      {new Date(deadline.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-amber-800 uppercase bg-amber-200 inline-block px-2 py-0.5 rounded mt-1">
                      {deadline.status}
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