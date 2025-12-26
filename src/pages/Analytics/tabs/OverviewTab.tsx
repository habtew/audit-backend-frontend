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

// const OverviewTab: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [period, setPeriod] = useState('this_month');
//   const [engData, setEngData] = useState<EngagementAnalytics | null>(null);
//   const [riskData, setRiskData] = useState<RiskAnalytics | null>(null);
//   const [billData, setBillData] = useState<BillingAnalytics | null>(null);
//   const [userData, setUserData] = useState<UserPerformanceMetric[]>([]);

//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoading(true);
//       try {
//         const [eng, risk, bill, user] = await Promise.all([
//           apiClient.getEngagementAnalytics(period),
//           apiClient.getRiskAnalytics(),
//           apiClient.getBillingAnalytics(period),
//           apiClient.getUserPerformance(period)
//         ]);
//         setEngData(eng.data);
//         setRiskData(risk.data);
//         setBillData(bill.data);
//         setUserData(user.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, [period]);

//   if (loading) return <LoadingSpinner />;

//   // Chart Data Preparation
//   const statusData = engData ? Object.keys(engData.byStatus).map(k => ({ name: k, value: engData.byStatus[k] })) : [];
//   const riskPieData = riskData ? [
//     { name: 'Low', value: riskData.byLevel.LOW, color: '#10B981' },
//     { name: 'Medium', value: riskData.byLevel.MEDIUM, color: '#F59E0B' },
//     { name: 'High', value: riskData.byLevel.HIGH, color: '#EF4444' },
//   ].filter(d => d.value > 0) : [];

//   return (
//     <div className="space-y-6">
//       {/* Controls */}
//       <div className="flex justify-end">
//         <select 
//           value={period} 
//           onChange={(e) => setPeriod(e.target.value)}
//           className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
//         >
//           <option value="this_month">This Month</option>
//           <option value="last_month">Last Month</option>
//           <option value="ytd">Year to Date</option>
//         </select>
//       </div>

//       {/* Cards */}
//       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         <AnalyticsCard title="Active Engagements" value={engData?.active || 0} icon={ChartBarIcon} color="text-indigo-600" />
//         <AnalyticsCard title="Utilization Rate" value={`${billData?.utilizationRate || 0}%`} icon={CurrencyDollarIcon} color="text-green-600" />
//         <AnalyticsCard title="High Risks" value={riskData?.byLevel.HIGH || 0} icon={ShieldCheckIcon} color="text-red-600" />
//         <AnalyticsCard title="Team Active" value={userData.length} icon={UserGroupIcon} color="text-blue-600" />
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Engagement Status</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={statusData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="value" fill="#4F46E5" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Risk Distribution</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
//                   {riskPieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
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
  PieChart, Pie, Cell 
} from 'recharts';
import { ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../utils/api';
import AnalyticsCard from '../components/AnalyticsCard';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { EngagementAnalytics, RiskAnalytics, BillingAnalytics, UserPerformanceMetric } from '../../../types';

// Helper function to calculate date ranges
const getDateRange = (period: string) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (period) {
    case 'this_month':
      startDate.setDate(1); 
      break;
    case 'last_month':
      startDate.setMonth(now.getMonth() - 1);
      startDate.setDate(1); 
      endDate.setDate(0); 
      break;
    case 'this_quarter':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      break;
    case 'ytd':
      startDate.setMonth(0); 
      startDate.setDate(1);  
      break;
    default:
      return {}; 
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const OverviewTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  
  // Initialize with null
  const [engData, setEngData] = useState<EngagementAnalytics | null>(null);
  const [riskData, setRiskData] = useState<RiskAnalytics | null>(null);
  const [billData, setBillData] = useState<BillingAnalytics | null>(null);
  const [userData, setUserData] = useState<UserPerformanceMetric[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const queryParams = getDateRange(period);

        const [eng, risk, bill, user] = await Promise.all([
          apiClient.getEngagementAnalytics(queryParams),
          apiClient.getRiskAnalytics(queryParams),
          apiClient.getBillingAnalytics(queryParams),
          apiClient.getUserPerformance(queryParams)
        ]);

        setEngData(eng.data);
        setRiskData(risk.data);
        setBillData(bill.data);
        setUserData(user.data || []); // Ensure array fallback
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  if (loading) return <LoadingSpinner />;

  // --- Safe Data Preparation ---

  // 1. Engagement Status (Safe Check for byStatus)
  const statusData = (engData && engData.byStatus) 
    ? Object.keys(engData.byStatus).map(k => ({ 
        name: k.replace(/_/g, ' '), 
        value: engData.byStatus[k] 
      })) 
    : [];

  // 2. Risk Distribution (Safe Check for byLevel)
  const riskPieData = (riskData && riskData.byLevel) ? [
    { name: 'Low', value: riskData.byLevel.LOW || 0, color: '#10B981' },
    { name: 'Medium', value: riskData.byLevel.MEDIUM || 0, color: '#F59E0B' },
    { name: 'High', value: riskData.byLevel.HIGH || 0, color: '#EF4444' },
    { name: 'Critical', value: riskData.byLevel.CRITICAL || 0, color: '#7F1D1D' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-end">
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_quarter">This Quarter</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard 
          title="Active Engagements" 
          value={engData?.active || 0} 
          icon={ChartBarIcon} 
          color="text-indigo-600" 
        />
        <AnalyticsCard 
          title="Utilization Rate" 
          value={`${billData?.utilizationRate || 0}%`} 
          icon={CurrencyDollarIcon} 
          color="text-green-600" 
        />
        <AnalyticsCard 
          title="High Risks" 
          value={riskData?.byLevel?.HIGH || 0} 
          icon={ShieldCheckIcon} 
          color="text-red-600" 
        />
        <AnalyticsCard 
          title="Team Active" 
          value={userData.length} 
          icon={UserGroupIcon} 
          color="text-blue-600" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Engagement Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Engagement Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {statusData.length > 0 ? (
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No data available for this period
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {riskPieData.length > 0 ? (
                <PieChart>
                  <Pie 
                    data={riskPieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No risks identified
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;