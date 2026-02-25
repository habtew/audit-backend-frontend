// // import React, { useEffect, useState } from 'react';
// // import { 
// //   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
// //   PieChart, Pie, Cell 
// // } from 'recharts';
// // import { ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
// // import apiClient from '../../../utils/api';
// // import AnalyticsCard from '../components/AnalyticsCard';
// // import LoadingSpinner from '../../../components/Common/LoadingSpinner';
// // import { EngagementAnalytics, RiskAnalytics, BillingAnalytics, UserPerformanceMetric } from '../../../types';

// // const OverviewTab: React.FC = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [period, setPeriod] = useState('this_month');
// //   const [engData, setEngData] = useState<EngagementAnalytics | null>(null);
// //   const [riskData, setRiskData] = useState<RiskAnalytics | null>(null);
// //   const [billData, setBillData] = useState<BillingAnalytics | null>(null);
// //   const [userData, setUserData] = useState<UserPerformanceMetric[]>([]);

// //   useEffect(() => {
// //     const fetchAll = async () => {
// //       setLoading(true);
// //       try {
// //         const [eng, risk, bill, user] = await Promise.all([
// //           apiClient.getEngagementAnalytics(period),
// //           apiClient.getRiskAnalytics(),
// //           apiClient.getBillingAnalytics(period),
// //           apiClient.getUserPerformance(period)
// //         ]);
// //         setEngData(eng.data);
// //         setRiskData(risk.data);
// //         setBillData(bill.data);
// //         setUserData(user.data);
// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchAll();
// //   }, [period]);

// //   if (loading) return <LoadingSpinner />;

// //   // Chart Data Preparation
// //   const statusData = engData ? Object.keys(engData.byStatus).map(k => ({ name: k, value: engData.byStatus[k] })) : [];
// //   const riskPieData = riskData ? [
// //     { name: 'Low', value: riskData.byLevel.LOW, color: '#10B981' },
// //     { name: 'Medium', value: riskData.byLevel.MEDIUM, color: '#F59E0B' },
// //     { name: 'High', value: riskData.byLevel.HIGH, color: '#EF4444' },
// //   ].filter(d => d.value > 0) : [];

// //   return (
// //     <div className="space-y-6">
// //       {/* Controls */}
// //       <div className="flex justify-end">
// //         <select 
// //           value={period} 
// //           onChange={(e) => setPeriod(e.target.value)}
// //           className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
// //         >
// //           <option value="this_month">This Month</option>
// //           <option value="last_month">Last Month</option>
// //           <option value="ytd">Year to Date</option>
// //         </select>
// //       </div>

// //       {/* Cards */}
// //       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
// //         <AnalyticsCard title="Active Engagements" value={engData?.active || 0} icon={ChartBarIcon} color="text-indigo-600" />
// //         <AnalyticsCard title="Utilization Rate" value={`${billData?.utilizationRate || 0}%`} icon={CurrencyDollarIcon} color="text-green-600" />
// //         <AnalyticsCard title="High Risks" value={riskData?.byLevel.HIGH || 0} icon={ShieldCheckIcon} color="text-red-600" />
// //         <AnalyticsCard title="Team Active" value={userData.length} icon={UserGroupIcon} color="text-blue-600" />
// //       </div>

// //       {/* Charts */}
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Engagement Status</h3>
// //           <div className="h-64">
// //             <ResponsiveContainer width="100%" height="100%">
// //               <BarChart data={statusData}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="name" />
// //                 <YAxis />
// //                 <Tooltip />
// //                 <Bar dataKey="value" fill="#4F46E5" />
// //               </BarChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>

// //         <div className="bg-white p-6 rounded-lg shadow">
// //           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Risk Distribution</h3>
// //           <div className="h-64">
// //             <ResponsiveContainer width="100%" height="100%">
// //               <PieChart>
// //                 <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
// //                   {riskPieData.map((entry, index) => (
// //                     <Cell key={`cell-${index}`} fill={entry.color} />
// //                   ))}
// //                 </Pie>
// //                 <Tooltip />
// //                 <Legend />
// //               </PieChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OverviewTab;


// import React, { useEffect, useState } from 'react';
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
//   PieChart, Pie, Cell 
// } from 'recharts';
// import { ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
// import apiClient from '../../../utils/api';
// import AnalyticsCard from '../components/AnalyticsCard';
// import LoadingSpinner from '../../../components/Common/LoadingSpinner';
// import { EngagementAnalytics, RiskAnalytics, BillingAnalytics, UserPerformanceMetric } from '../../../types';

// // Helper function to calculate date ranges
// const getDateRange = (period: string) => {
//   const now = new Date();
//   const startDate = new Date();
//   const endDate = new Date();

//   switch (period) {
//     case 'this_month':
//       startDate.setDate(1); 
//       break;
//     case 'last_month':
//       startDate.setMonth(now.getMonth() - 1);
//       startDate.setDate(1); 
//       endDate.setDate(0); 
//       break;
//     case 'this_quarter':
//       const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
//       startDate.setMonth(quarterStartMonth);
//       startDate.setDate(1);
//       break;
//     case 'ytd':
//       startDate.setMonth(0); 
//       startDate.setDate(1);  
//       break;
//     default:
//       return {}; 
//   }

//   return {
//     startDate: startDate.toISOString(),
//     endDate: endDate.toISOString(),
//   };
// };

// const OverviewTab: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [period, setPeriod] = useState('this_month');
  
//   // Initialize with null
//   const [engData, setEngData] = useState<EngagementAnalytics | null>(null);
//   const [riskData, setRiskData] = useState<RiskAnalytics | null>(null);
//   const [billData, setBillData] = useState<BillingAnalytics | null>(null);
//   const [userData, setUserData] = useState<UserPerformanceMetric[]>([]);

//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoading(true);
//       try {
//         const queryParams = getDateRange(period);

//         const [eng, risk, bill, user] = await Promise.all([
//           apiClient.getEngagementAnalytics(queryParams),
//           apiClient.getRiskAnalytics(queryParams),
//           apiClient.getBillingAnalytics(queryParams),
//           apiClient.getUserPerformance(queryParams)
//         ]);

//         setEngData(eng.data);
//         setRiskData(risk.data);
//         setBillData(bill.data);
//         setUserData(user.data || []); // Ensure array fallback
//       } catch (err) {
//         console.error("Failed to fetch analytics:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, [period]);

//   if (loading) return <LoadingSpinner />;

//   // --- Safe Data Preparation ---

//   // 1. Engagement Status (Safe Check for byStatus)
//   const statusData = (engData && engData.byStatus) 
//     ? Object.keys(engData.byStatus).map(k => ({ 
//         name: k.replace(/_/g, ' '), 
//         value: engData.byStatus[k] 
//       })) 
//     : [];

//   // 2. Risk Distribution (Safe Check for byLevel)
//   const riskPieData = (riskData && riskData.byLevel) ? [
//     { name: 'Low', value: riskData.byLevel.LOW || 0, color: '#10B981' },
//     { name: 'Medium', value: riskData.byLevel.MEDIUM || 0, color: '#F59E0B' },
//     { name: 'High', value: riskData.byLevel.HIGH || 0, color: '#EF4444' },
//     { name: 'Critical', value: riskData.byLevel.CRITICAL || 0, color: '#7F1D1D' },
//   ].filter(d => d.value > 0) : [];

//   return (
//     <div className="space-y-6">
//       {/* Controls */}
//       <div className="flex justify-end">
//         <select 
//           value={period} 
//           onChange={(e) => setPeriod(e.target.value)}
//           className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
//         >
//           <option value="this_month">This Month</option>
//           <option value="last_month">Last Month</option>
//           <option value="this_quarter">This Quarter</option>
//           <option value="ytd">Year to Date</option>
//         </select>
//       </div>

//       {/* Cards */}
//       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         <AnalyticsCard 
//           title="Active Engagements" 
//           value={engData?.active || 0} 
//           icon={ChartBarIcon} 
//           color="text-indigo-600" 
//         />
//         <AnalyticsCard 
//           title="Utilization Rate" 
//           value={`${billData?.utilizationRate || 0}%`} 
//           icon={CurrencyDollarIcon} 
//           color="text-green-600" 
//         />
//         <AnalyticsCard 
//           title="High Risks" 
//           value={riskData?.byLevel?.HIGH || 0} 
//           icon={ShieldCheckIcon} 
//           color="text-red-600" 
//         />
//         <AnalyticsCard 
//           title="Team Active" 
//           value={userData.length} 
//           icon={UserGroupIcon} 
//           color="text-blue-600" 
//         />
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Bar Chart: Engagement Status */}
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Engagement Status</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               {statusData.length > 0 ? (
//                 <BarChart data={statusData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                   <YAxis allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               ) : (
//                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">
//                   No data available for this period
//                 </div>
//               )}
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Pie Chart: Risk Distribution */}
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Risk Distribution</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               {riskPieData.length > 0 ? (
//                 <PieChart>
//                   <Pie 
//                     data={riskPieData} 
//                     cx="50%" 
//                     cy="50%" 
//                     innerRadius={60} 
//                     outerRadius={80} 
//                     paddingAngle={5} 
//                     dataKey="value"
//                   >
//                     {riskPieData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend verticalAlign="bottom" height={36}/>
//                 </PieChart>
//               ) : (
//                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">
//                   No risks identified
//                 </div>
//               )}
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverviewTab;




import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, ShieldCheckIcon, FunnelIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../utils/api';
import AnalyticsCard from '../components/AnalyticsCard';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { 
  EngagementAnalytics, RiskAnalytics, BillingAnalytics, 
  UserPerformanceMetric, Client, Engagement, User, EngagementProgress 
} from '../../../types';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const OverviewTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filters, setFilters] = useState({
    clientId: '',
    engagementId: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  // Dropdown Data
  const [clients, setClients] = useState<Client[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Analytics Data
  const [engData, setEngData] = useState<EngagementAnalytics | null>(null);
  const [riskData, setRiskData] = useState<RiskAnalytics | null>(null);
  const [billData, setBillData] = useState<BillingAnalytics | null>(null);
  const [userData, setUserData] = useState<UserPerformanceMetric[]>([]);
  const [progressData, setProgressData] = useState<EngagementProgress | null>(null);

  // Initial Fetch for Dropdowns
  useEffect(() => {
  const fetchMetadata = async () => {
    try {
      const [cRes, eRes, uRes] = await Promise.all([
        apiClient.getClients(),
        apiClient.getEngagements(),
        apiClient.getUsers()
      ]);

      // FIX: Access the nested arrays inside the .data object
      setClients(cRes.data.clients || []); 
      setEngagements(eRes.data.engagements || []);
      setUsers(uRes.data.users || []); // Assuming users follows the same pattern
    } catch (err) {
      console.error("Metadata fetch failed", err);
      // Fallback to empty arrays to prevent .map errors
      setClients([]);
      setEngagements([]);
      setUsers([]);
    }
  };
  fetchMetadata();
}, []);

  // Fetch Analytics on Filter Change
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = {
          clientId: filters.clientId || undefined,
          engagementId: filters.engagementId || undefined,
          userId: filters.userId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        };

        const [eng, risk, bill, user] = await Promise.all([
          apiClient.getEngagementAnalytics(params),
          apiClient.getRiskAnalytics(params),
          apiClient.getBillingAnalytics(params),
          apiClient.getUserPerformance(params)
        ]);

        setEngData(eng.data);
        setRiskData(risk.data);
        setBillData(bill.data);
        setUserData(user.data || []);

        // If an engagement is selected, fetch progress
        if (filters.engagementId) {
          const prog = await apiClient.getEngagementProgress(filters.engagementId);
          setProgressData(prog.data);
        } else {
          setProgressData(null);
        }
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Prepare Chart Data
  const statusData = engData?.engagementsByStatus 
    ? Object.entries(engData.engagementsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const riskPieData = riskData?.risksByLevel
    ? Object.entries(riskData.risksByLevel).map(([name, value]) => ({ name, value }))
    : [];

  const billingTrendData = billData?.dailyBreakdown
    ? billData.dailyBreakdown.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        hours: item._sum.hours
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
          <select 
            value={filters.clientId}
            onChange={(e) => handleFilterChange('clientId', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Engagement</label>
          <select 
            value={filters.engagementId}
            onChange={(e) => handleFilterChange('engagementId', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Engagements</option>
            {engagements
              .filter(e => !filters.clientId || e.clientId === filters.clientId)
              .map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Team Member</label>
          <select 
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
          </select>
        </div>
        <button 
          onClick={() => setFilters({ clientId: '', engagementId: '', userId: '', startDate: '', endDate: '' })}
          className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
        >
          <FunnelIcon className="h-4 w-4" /> Reset
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard title="Total Engagements" value={engData?.totalEngagements || 0} icon={ChartBarIcon} color="text-indigo-600" />
            <AnalyticsCard title="Total Billable" value={`$${billData?.totalBillableAmount || 0}`} icon={CurrencyDollarIcon} color="text-green-600" />
            <AnalyticsCard title="Avg. Hours" value={engData?.averageHours?.toFixed(1) || 0} icon={UserGroupIcon} color="text-blue-600" />
            <AnalyticsCard title="Active Risks" value={riskData?.totalRisks || 0} icon={ShieldCheckIcon} color="text-red-600" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Engagement Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Levels</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                      {riskPieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Billing Trend (New) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Billable Hours Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={billingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Engagement Progress Section (Visible only if Engagement selected) */}
          {progressData && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Progress: {progressData.engagement.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Workpapers</span><span>{progressData.progress.workpapers.percentage}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressData.progress.workpapers.percentage}%` }}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>PBC Requests</span><span>{progressData.progress.pbc.percentage}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${progressData.progress.pbc.percentage}%` }}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold"><span>Overall Progress</span><span>{progressData.progress.overall.percentage}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progressData.progress.overall.percentage}%` }}></div></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OverviewTab;