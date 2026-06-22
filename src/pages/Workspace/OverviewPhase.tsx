// // src/pages/Workspace/OverviewPhase.tsx
// import React, { useEffect, useState } from 'react';
// import { useOutletContext, useNavigate } from 'react-router-dom';
// import { 
//   BriefcaseIcon, 
//   BanknotesIcon, 
//   ChartPieIcon,
//   ArrowRightIcon,
//   ClockIcon,
//   DocumentCheckIcon,
//   CalculatorIcon,
//   DocumentChartBarIcon
// } from '@heroicons/react/24/outline';
// import { Engagement } from '../../types';
// import apiClient from '../../utils/api';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// const OverviewPhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
  
//   // Dashboard Aggregation States
//   const [materiality, setMateriality] = useState<any>(null);
//   const [executionProgress, setExecutionProgress] = useState<any>(null);
//   const [recentActivity, setRecentActivity] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchOverviewData = async () => {
//       setLoading(true);
//       try {
//         // Fetch all relevant engagement data concurrently
//         const [planningRes, executionRes] = await Promise.allSettled([
//           apiClient.getPlanningDashboard(engagement.id),
//           apiClient.getExecutionDashboard(engagement.id)
//         ]);

//         // Safely extract Planning Data (Materiality)
//         if (planningRes.status === 'fulfilled' && planningRes.value?.data) {
//           setMateriality(planningRes.value.data.materiality);
//         } else {
//           // Fallback mock if endpoint isn't wired yet (matching your image)
//           setMateriality({
//             overallMateriality: 250000,
//             performanceMateriality: 187500,
//             trivialThreshold: 12500
//           });
//         }

//         // Safely extract Execution Data (Progress)
//         if (executionRes.status === 'fulfilled' && executionRes.value?.data) {
//           setExecutionProgress(executionRes.value.data.progress);
//         } else {
//           // Fallback mock
//           setExecutionProgress({
//             completionPercentage: 33,
//             reviewed: 5,
//             total: 15
//           });
//         }

//         // Mocking Recent Activity (Usually comes from an AuditTrail endpoint)
//         setRecentActivity([
//           { id: 1, action: 'Signed-off on procedure AR-001', user: 'Jane Smith (Senior)', time: '2 hours ago', icon: DocumentCheckIcon, color: 'text-green-600 bg-green-100' },
//           { id: 2, action: 'Updated Performance Materiality', user: 'John Doe (Manager)', time: '1 day ago', icon: CalculatorIcon, color: 'text-indigo-600 bg-indigo-100' },
//           { id: 3, action: 'Completed Pre-Engagement Acceptance', user: 'Partner A', time: '3 days ago', icon: BriefcaseIcon, color: 'text-amber-600 bg-amber-100' },
//         ]);

//       } catch (error) {
//         console.error('Error fetching overview data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (engagement?.id) {
//       fetchOverviewData();
//     }
//   }, [engagement.id]);

//   const formatCurrency = (val: number | undefined) => {
//     if (val === undefined) return '-';
//     // Format to match the "250.00K" style in your screenshot
//     if (val >= 1000) return `$${(val / 1000).toFixed(2)}K`;
//     return `$${val.toFixed(2)}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[60vh]">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold text-slate-800">Engagement Overview</h2>
//         <p className="text-slate-500 mt-1">High-level summary of your audit engagement.</p>
//       </div>

//       {/* Top 3 Cards Row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
//         {/* Card 1: Engagement Details */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
//               <BriefcaseIcon className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-800">Engagement Details</h3>
//           </div>
//           <div className="space-y-3">
//             <div>
//               <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
//               <div className="mt-1">
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
//                   {engagement.status}
//                 </span>
//               </div>
//             </div>
//             <div>
//               <p className="text-xs font-bold text-slate-500 uppercase">Client Name</p>
//               <p className="text-sm font-medium text-slate-900 mt-0.5">{engagement.client?.name || 'Unknown Client'}</p>
//             </div>
//             <div>
//               <p className="text-xs font-bold text-slate-500 uppercase">Year End</p>
//               <p className="text-sm font-medium text-slate-900 mt-0.5">
//                 {engagement.yearEnd ? new Date(engagement.yearEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Card 2: Materiality Summary */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
//               <BanknotesIcon className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-800">Materiality Summary</h3>
//           </div>
//           <div className="space-y-4">
//             <div>
//               <p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p>
//               <p className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(materiality?.overallMateriality)}</p>
//             </div>
//             <div className="flex justify-between items-center pt-3 border-t border-slate-100">
//               <div>
//                 <p className="text-xs font-bold text-slate-500 uppercase">Performance (75%)</p>
//                 <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(materiality?.performanceMateriality)}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Trivial (5%)</p>
//                 <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(materiality?.trivialThreshold)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Card 3: Execution Progress */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
//               <ChartPieIcon className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-800">Execution Progress</h3>
//           </div>
//           <div className="mt-4">
//             <div className="flex justify-between items-end mb-2">
//               <p className="text-3xl font-black text-slate-800">{executionProgress?.completionPercentage || 0}%</p>
//               <p className="text-xs font-bold text-slate-500 uppercase mb-1">Completed</p>
//             </div>
//             <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
//               <div 
//                 className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" 
//                 style={{ width: `${executionProgress?.completionPercentage || 0}%` }}
//               ></div>
//             </div>
//             <div className="pt-3 border-t border-slate-100">
//               <p className="text-xs font-bold text-slate-500 uppercase">Procedures Reviewed</p>
//               <p className="text-sm font-bold text-slate-800 mt-0.5">
//                 {executionProgress?.reviewed || 0} of {executionProgress?.total || 0} Total
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom 2 Cards Row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* Recent Activity */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
//           <div className="space-y-6">
//             {recentActivity.map((activity, idx) => (
//               <div key={activity.id} className="flex relative">
//                 {idx !== recentActivity.length - 1 && (
//                   <div className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
//                 )}
//                 <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${activity.color} ring-4 ring-white`}>
//                   <activity.icon className="w-4 h-4" />
//                 </div>
//                 <div className="ml-4 flex-1">
//                   <p className="text-sm font-medium text-slate-900">{activity.action}</p>
//                   <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
//                     <span className="font-semibold text-slate-700">{activity.user}</span>
//                     <span>•</span>
//                     <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> {activity.time}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Quick Links */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
//           <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Links</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
//             <button 
//               onClick={() => navigate(`/engagements/${engagement.id}/workspace/pre-engagement`)}
//               className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
//             >
//               <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
//                 <DocumentCheckIcon className="w-5 h-5" />
//               </div>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-bold text-slate-800">Pre-Engagement</p>
//               </div>
//               <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
//             </button>

//             <button 
//               onClick={() => navigate(`/engagements/${engagement.id}/workspace/planning`)}
//               className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
//             >
//               <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
//                 <CalculatorIcon className="w-5 h-5" />
//               </div>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-bold text-slate-800">Materiality Calculator</p>
//               </div>
//               <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
//             </button>

//             <button 
//               onClick={() => navigate(`/engagements/${engagement.id}/workspace/data-acquisition`)}
//               className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
//             >
//               <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
//                 <BanknotesIcon className="w-5 h-5" />
//               </div>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-bold text-slate-800">Working Trial Balance</p>
//               </div>
//               <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
//             </button>

//             <button 
//               onClick={() => navigate(`/engagements/${engagement.id}/workspace/execution`)}
//               className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
//             >
//               <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
//                 <DocumentChartBarIcon className="w-5 h-5" />
//               </div>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-bold text-slate-800">Execution Board</p>
//               </div>
//               <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
//             </button>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default OverviewPhase;


// src/pages/Workspace/OverviewPhase.tsx
import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  BanknotesIcon, 
  ChartPieIcon,
  ArrowRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  BuildingOfficeIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const OverviewPhase: React.FC = () => {
  // engagement is pre-fetched and provided by the parent WorkspaceLayout
  const { engagement } = useOutletContext<{ engagement: Engagement & { preEngagement?: any, entity?: any } }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  
  // Dashboard Aggregation States
  const [executionProgress, setExecutionProgress] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        // We only need to fetch execution progress now, as Materiality and Pre-Engagement 
        // are already bundled in the main `engagement` object from your backend!
        const executionRes = await apiClient.getExecutionDashboard(engagement.id).catch(() => null);

        if (executionRes?.data) {
          setExecutionProgress(executionRes.data.progress);
        } else {
          // Fallback mock if the execution engine endpoint isn't fully wired yet
          setExecutionProgress({
            completionPercentage: engagement.status === 'COMPLETED' ? 100 : 33,
            reviewed: engagement.status === 'COMPLETED' ? 15 : 5,
            total: 15
          });
        }

        // Mocking Recent Activity (To be replaced with AuditTrail API)
        setRecentActivity([
          { id: 1, action: 'Signed-off on procedure AR-001', user: 'Jane Smith (Senior)', time: '2 hours ago', icon: DocumentCheckIcon, color: 'text-green-600 bg-green-100' },
          { id: 2, action: 'Updated Performance Materiality', user: 'John Doe (Manager)', time: '1 day ago', icon: CalculatorIcon, color: 'text-indigo-600 bg-indigo-100' },
          { id: 3, action: 'Completed Pre-Engagement Acceptance', user: `${engagement.creator?.firstName || 'Partner'}`, time: '3 days ago', icon: BriefcaseIcon, color: 'text-amber-600 bg-amber-100' },
        ]);

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (engagement?.id) {
      fetchOverviewData();
    }
  }, [engagement.id, engagement.status, engagement.creator]);

  // Safely format currency, handling Prisma's string-based Decimals
  const formatCurrency = (val: string | number | undefined | null, currencyCode: string = 'USD') => {
    if (val === undefined || val === null) return '-';
    const numericVal = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numericVal)) return '-';
    
    // Format to match the "250.00K" style for large numbers
    if (numericVal >= 1000) return `${currencyCode === 'USD' ? '$' : currencyCode + ' '}${(numericVal / 1000).toFixed(2)}K`;
    return `${currencyCode === 'USD' ? '$' : currencyCode + ' '}${numericVal.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Extract materiality directly from the populated engagement object
  const hasMateriality = engagement.overallMateriality != null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Engagement Overview</h2>
          <p className="text-slate-500 mt-1">High-level summary of your audit engagement.</p>
        </div>
        {engagement.isLocked && (
           <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
             🔒 File Locked
           </span>
        )}
      </div>

      {/* Top 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Client & Entity Context */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Engagement Profile</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Client & Entity</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate" title={engagement.client?.name}>{engagement.client?.name}</p>
              <p className="text-xs font-medium text-slate-500 truncate" title={engagement.entity?.name}>{engagement.entity?.name || 'Main Entity'}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Year End</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {engagement.yearEnd ? new Date(engagement.yearEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="text-right">
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  {engagement.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Terms & Scope (Pre-Engagement) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Terms & Scope</h3>
          </div>
          <div className="space-y-4 flex-1">
            {engagement.preEngagement ? (
              <>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Framework</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{engagement.preEngagement.financialFramework || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase">Agreed Fee</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatCurrency(engagement.preEngagement.agreedFee, engagement.preEngagement.currency || '')}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase">Acceptance Status</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5 flex items-center">
                    <DocumentCheckIcon className="w-4 h-4 mr-1" /> {engagement.preEngagement.status}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm font-medium mb-2">Not Started</p>
                <button onClick={() => navigate(`pre-engagement`)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200 font-bold">
                  Begin Phase 1
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Materiality Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Materiality</h3>
          </div>
          <div className="space-y-4 flex-1">
            {hasMateriality ? (
              <>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(engagement.overallMateriality)}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Perf. (75%)</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(engagement.performanceMateriality)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase">Trivial (5%)</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(engagement.trivialThreshold)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm font-medium mb-2">Not Calculated</p>
                <button onClick={() => navigate(`planning`)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200 font-bold">
                  Set Materiality
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Execution Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ChartPieIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Execution</h3>
          </div>
          <div className="mt-2 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <p className="text-3xl font-black text-slate-800">{executionProgress?.completionPercentage || 0}%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Completed</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-1000 ${engagement.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-600'}`}
                style={{ width: `${executionProgress?.completionPercentage || 0}%` }}
              ></div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Procedures Reviewed</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {executionProgress?.reviewed || 0} of {executionProgress?.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((activity, idx) => (
              <div key={activity.id} className="flex relative">
                {idx !== recentActivity.length - 1 && (
                  <div className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
                )}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${activity.color} ring-4 ring-white`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{activity.user}</span>
                    <span>•</span>
                    <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> {activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button 
              onClick={() => navigate(`/engagements/${engagement.id}/workspace/pre-engagement`)}
              className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <DocumentCheckIcon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-800">Pre-Engagement</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button 
              onClick={() => navigate(`/engagements/${engagement.id}/workspace/planning`)}
              className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <CalculatorIcon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-800">Materiality Calculator</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button 
              onClick={() => navigate(`/engagements/${engagement.id}/workspace/data-acquisition`)}
              className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-800">Working Trial Balance</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button 
              onClick={() => navigate(`/engagements/${engagement.id}/workspace/execution`)}
              className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-300 transition-colors group text-left"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <DocumentChartBarIcon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-800">Execution Board</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewPhase;