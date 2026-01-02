// import React, { useState, useEffect } from 'react';
// import api from '../../utils/api';
// import { Invoice, BillableHour, BillableHourStatus, InvoiceStatus } from '../../types/index';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const BillingDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [pendingHours, setPendingHours] = useState<BillableHour[]>([]);
//   const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [hoursRes, invoicesRes] = await Promise.all([
//         api.getBillableHours({ status: BillableHourStatus.PENDING, limit: 5 }),
//         api.getInvoices({ limit: 5 })
//       ]);
//       setPendingHours(hoursRes.data?.data || []);
//       setRecentInvoices(invoicesRes.data?.data || []);
//     } catch (error) {
//       console.error("Failed to load billing data", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveHour = async (id: string) => {
//     try {
//       await api.approveTimeEntry(id);
//       toast.success('Time entry approved');
//       setPendingHours(prev => prev.filter(h => h.id !== id));
//     } catch (e) {
//       toast.error('Failed to approve');
//     }
//   };

//   const handleRejectHour = async (id: string) => {
//     if(!window.confirm("Reject this time entry?")) return;
//     try {
//       await api.rejectTimeEntry(id);
//       toast.success('Time entry rejected');
//       setPendingHours(prev => prev.filter(h => h.id !== id));
//     } catch (e) {
//       toast.error('Failed to reject');
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold text-gray-900">Billing Overview</h1>

//       {/* Pending Approvals Section */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
//           <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
//             <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />
//             Pending Time Approvals
//           </h3>
//         </div>
//         <ul className="divide-y divide-gray-200">
//           {pendingHours.length === 0 ? (
//             <li className="px-4 py-4 text-sm text-gray-500 text-center">No pending approvals.</li>
//           ) : pendingHours.map((hour) => (
//             <li key={hour.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
//               <div>
//                 <p className="text-sm font-medium text-indigo-600 truncate">
//                   {hour.user?.firstName} {hour.user?.lastName}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {hour.hours} hrs on <span className="font-medium">{hour.engagement?.client.name}</span>
//                 </p>
//                 <p className="text-xs text-gray-400">{hour.description}</p>
//               </div>
//               <div className="flex space-x-2">
//                 <button 
//                   onClick={() => handleApproveHour(hour.id)}
//                   className="p-1 rounded-full text-green-600 hover:bg-green-100"
//                   title="Approve"
//                 >
//                   <CheckCircleIcon className="h-6 w-6" />
//                 </button>
//                 <button 
//                   onClick={() => handleRejectHour(hour.id)}
//                   className="p-1 rounded-full text-red-600 hover:bg-red-100"
//                   title="Reject"
//                 >
//                   <XCircleIcon className="h-6 w-6" />
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Recent Invoices Section */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
//             <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-500" />
//             Recent Invoices
//           </h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {recentInvoices.length === 0 ? (
//                  <tr><td colSpan={4} className="p-4 text-center text-sm text-gray-500">No recent invoices.</td></tr>
//               ) : recentInvoices.map((invoice) => (
//                 <tr key={invoice.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client?.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${invoice.amount.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
//                       ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 
//                         invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-800' : 
//                         'bg-yellow-100 text-yellow-800'}`}>
//                       {invoice.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingDashboard;



// import React, { useState, useEffect } from 'react';
// import api from '../../utils/api';
// import { Invoice, BillableHour, BillableHourStatus, InvoiceStatus } from '../../types/index';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const BillingDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [pendingHours, setPendingHours] = useState<BillableHour[]>([]);
//   const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       // FIX: Removed 'status' param from API call because backend doesn't support it yet.
//       // We fetch a larger batch (limit: 50) and filter client-side instead.
//       const [hoursRes, invoicesRes] = await Promise.all([
//         api.getBillableHours({ limit: 50 }), 
//         api.getInvoices({ limit: 5 })
//       ]);

//       // Client-side filtering for PENDING status
//       const allHours = hoursRes.data?.data || [];
//       const pendingFiltered = allHours
//         .filter((h) => h.status === BillableHourStatus.PENDING)
//         .slice(0, 5); // Take only the top 5

//       setPendingHours(pendingFiltered);
//       setRecentInvoices(invoicesRes.data?.data || []);
//     } catch (error) {
//       console.error("Failed to load billing data", error);
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveHour = async (id: string) => {
//     try {
//       await api.approveTimeEntry(id);
//       toast.success('Time entry approved');
//       // Remove from UI immediately
//       setPendingHours(prev => prev.filter(h => h.id !== id));
//     } catch (e) {
//       toast.error('Failed to approve');
//     }
//   };

//   const handleRejectHour = async (id: string) => {
//     if(!window.confirm("Reject this time entry?")) return;
//     try {
//       await api.rejectTimeEntry(id);
//       toast.success('Time entry rejected');
//       // Remove from UI immediately
//       setPendingHours(prev => prev.filter(h => h.id !== id));
//     } catch (e) {
//       toast.error('Failed to reject');
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold text-gray-900">Billing Overview</h1>

//       {/* Pending Approvals Section */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
//           <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
//             <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />
//             Pending Time Approvals
//           </h3>
//         </div>
//         <ul className="divide-y divide-gray-200">
//           {pendingHours.length === 0 ? (
//             <li className="px-4 py-4 text-sm text-gray-500 text-center">No pending approvals found in recent entries.</li>
//           ) : pendingHours.map((hour) => (
//             <li key={hour.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
//               <div className="flex-1 min-w-0 pr-4">
//                 <p className="text-sm font-medium text-indigo-600 truncate">
//                   {hour.user?.firstName} {hour.user?.lastName}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   <span className="font-semibold">{hour.hours} hrs</span> on <span className="font-medium">{hour.engagement?.client.name || 'Unknown Client'}</span>
//                 </p>
//                 <p className="text-xs text-gray-400 truncate">{hour.description}</p>
//               </div>
//               <div className="flex space-x-2 shrink-0">
//                 <button 
//                   onClick={() => handleApproveHour(hour.id)}
//                   className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
//                   title="Approve"
//                 >
//                   <CheckCircleIcon className="h-6 w-6" />
//                 </button>
//                 <button 
//                   onClick={() => handleRejectHour(hour.id)}
//                   className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
//                   title="Reject"
//                 >
//                   <XCircleIcon className="h-6 w-6" />
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Recent Invoices Section */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
//             <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-500" />
//             Recent Invoices
//           </h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {recentInvoices.length === 0 ? (
//                  <tr><td colSpan={4} className="p-4 text-center text-sm text-gray-500">No recent invoices.</td></tr>
//               ) : recentInvoices.map((invoice) => (
//                 <tr key={invoice.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client?.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${invoice.amount.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
//                       ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 
//                         invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-800' : 
//                         'bg-yellow-100 text-yellow-800'}`}>
//                       {invoice.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingDashboard;


// import React, { useState, useEffect } from 'react';
// import api from '../../utils/api';
// import { Invoice, BillableHour, BillableHourStatus, InvoiceStatus } from '../../types/index';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { 
//   CheckCircleIcon, 
//   XCircleIcon, 
//   CurrencyDollarIcon, 
//   ClockIcon, 
//   BriefcaseIcon,
//   CheckBadgeIcon
// } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const BillingDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [summary, setSummary] = useState({
//     totalHours: 0,
//     totalBillableAmount: 0,
//     billedAmount: 0,
//     unbilledAmount: 0
//   });
//   const [pendingHours, setPendingHours] = useState<BillableHour[]>([]);
//   const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       // Fetch summary metrics, pending hours, and recent invoices in parallel
//       const [summaryRes, hoursRes, invoicesRes] = await Promise.all([
//         api.getBillingSummary(), // Uses the working /api/billing/summary endpoint
//         api.getBillableHours({ limit: 50 }), 
//         api.getInvoices({ limit: 5 })
//       ]);

//       // Update financial summary stats
//       if (summaryRes.data?.summary) {
//         setSummary(summaryRes.data.summary);
//       }

//       // Filter and limit pending hours for the approval section
//       const allHours = hoursRes.data || [];
//       const pendingFiltered = allHours
//         .filter((h: BillableHour) => h.status === BillableHourStatus.PENDING)
//         .slice(0, 5);

//       setPendingHours(pendingFiltered);
      
//       // Handle nested invoice data structure
//       const invData = invoicesRes.data as any;
//       setRecentInvoices(invData?.invoices || invData?.data?.invoices || []);
//     } catch (error) {
//       console.error("Failed to load billing data", error);
//       toast.error("Error refreshing dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveHour = async (id: string) => {
//     try {
//       // Moves status to APPROVED so it can be billed in the Generate Invoice modal
//       await api.updateBillableHourStatus(id, BillableHourStatus.APPROVED);
//       toast.success('Time entry approved for billing');
//       // Refresh all data to update summary cards and list
//       fetchDashboardData();
//     } catch (e) {
//       toast.error('Failed to approve time entry');
//     }
//   };

//   const handleRejectHour = async (id: string) => {
//     if(!window.confirm("Reject this time entry?")) return;
//     try {
//       await api.updateBillableHourStatus(id, BillableHourStatus.REJECTED);
//       toast.success('Time entry rejected');
//       setPendingHours(prev => prev.filter(h => h.id !== id));
//     } catch (e) {
//       toast.error('Failed to reject');
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   // Stat Card configuration
//   const stats = [
//     { 
//       name: 'Unbilled Amount', 
//       value: `$${Number(summary.unbilledAmount).toLocaleString()}`, 
//       icon: CurrencyDollarIcon, 
//       color: 'text-blue-600', 
//       bgColor: 'bg-blue-100' 
//     },
//     { 
//       name: 'Total Hours', 
//       value: `${summary.totalHours}h`, 
//       icon: ClockIcon, 
//       color: 'text-indigo-600', 
//       bgColor: 'bg-indigo-100' 
//     },
//     { 
//       name: 'Billed Amount', 
//       value: `$${Number(summary.billedAmount).toLocaleString()}`, 
//       icon: CheckBadgeIcon, 
//       color: 'text-green-600', 
//       bgColor: 'bg-green-100' 
//     },
//     { 
//       name: 'Total Billable', 
//       value: `$${Number(summary.totalBillableAmount).toLocaleString()}`, 
//       icon: BriefcaseIcon, 
//       color: 'text-purple-600', 
//       bgColor: 'bg-purple-100' 
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">Billing & Revenue Dashboard</h1>
//         <button 
//           onClick={fetchDashboardData}
//           className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
//         >
//           Refresh Data
//         </button>
//       </div>

//       {/* Summary Stat Cards */}
//       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         {stats.map((item) => (
//           <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className={`flex-shrink-0 p-3 rounded-md ${item.bgColor}`}>
//                   <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
//                     <dd className="text-lg font-bold text-gray-900">{item.value}</dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Pending Approvals Section */}
//         <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
//           <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
//             <h3 className="text-base leading-6 font-bold text-gray-900 flex items-center">
//               <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
//               Pending Time Approvals
//             </h3>
//           </div>
//           <ul className="divide-y divide-gray-200">
//             {pendingHours.length === 0 ? (
//               <li className="px-4 py-8 text-sm text-gray-500 text-center">
//                 All time entries have been processed.
//               </li>
//             ) : pendingHours.map((hour) => (
//               <li key={hour.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
//                 <div className="flex-1 min-w-0 pr-4">
//                   <p className="text-sm font-bold text-indigo-700 truncate">
//                     {hour.user?.firstName} {hour.user?.lastName}
//                   </p>
//                   <p className="text-sm text-gray-700">
//                     <span className="font-semibold">{hour.hours} hrs</span> on <span className="font-medium text-gray-900">{hour.engagement?.client.name || 'General Engagement'}</span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1 italic">"{hour.description}"</p>
//                 </div>
//                 <div className="flex space-x-2 shrink-0">
//                   <button 
//                     onClick={() => handleApproveHour(hour.id)}
//                     className="p-1.5 rounded-full text-green-600 hover:bg-green-100 border border-green-200"
//                     title="Approve for Billing"
//                   >
//                     <CheckCircleIcon className="h-6 w-6" />
//                   </button>
//                   <button 
//                     onClick={() => handleRejectHour(hour.id)}
//                     className="p-1.5 rounded-full text-red-600 hover:bg-red-100 border border-red-200"
//                     title="Reject Entry"
//                   >
//                     <XCircleIcon className="h-6 w-6" />
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Recent Invoices Section */}
//         <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
//           <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50">
//             <h3 className="text-base leading-6 font-bold text-gray-900 flex items-center">
//               <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
//               Recent Invoices
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
//                   <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
//                   <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {recentInvoices.length === 0 ? (
//                    <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">No recent invoices found.</td></tr>
//                 ) : recentInvoices.map((invoice) => (
//                   <tr key={invoice.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.client?.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
//                       ${Number(invoice.total || invoice.amount).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center">
//                       <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full 
//                         ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 
//                           invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-800' : 
//                           'bg-yellow-100 text-yellow-800'}`}>
//                         {invoice.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingDashboard;


import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Invoice, BillableHour, InvoiceStatus } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalHours: 0,
    unbilledAmount: 0,
    billedAmount: 0
  });
  const [pendingHours, setPendingHours] = useState<BillableHour[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, hoursRes, invoicesRes] = await Promise.all([
        api.getBillingSummary(),
        api.getBillableHours({ limit: 50 }), 
        api.getInvoices({ limit: 10 })
      ]);

      // 1. Handle Summary Stats
      if (summaryRes.data?.summary) {
        setSummary(summaryRes.data.summary);
      }

      // 2. Robust Extraction of Billable Hours Array
      const hoursPayload = hoursRes.data as any;
      let allHours: BillableHour[] = [];

      if (Array.isArray(hoursPayload)) {
        allHours = hoursPayload;
      } else if (hoursPayload?.data && Array.isArray(hoursPayload.data)) {
        allHours = hoursPayload.data;
      } else if (hoursPayload?.billableHours && Array.isArray(hoursPayload.billableHours)) {
        allHours = hoursPayload.billableHours;
      }

      const pending = allHours
        .filter((h) => h.status === BillableHourStatus.PENDING)
        .slice(0, 5);
      setPendingHours(pending);

      // 3. Robust Extraction of Invoices Array
      const invPayload = invoicesRes.data as any;
      let invoices: Invoice[] = [];

      if (Array.isArray(invPayload)) {
        invoices = invPayload;
      } else if (invPayload?.invoices && Array.isArray(invPayload.invoices)) {
        invoices = invPayload.invoices;
      } else if (invPayload?.data?.invoices && Array.isArray(invPayload.data.invoices)) {
        invoices = invPayload.data.invoices;
      }
      setRecentInvoices(invoices.slice(0, 5));

    } catch (error) {
      console.error("Failed to load billing data:", error);
      toast.error("Error refreshing dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateBillableHourStatus(id, status);
      toast.success(`Entry ${status.toLowerCase()}`);
      fetchDashboardData(); // Refresh summary and lists
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
        <button onClick={fetchDashboardData} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Unbilled Amount</p>
            <p className="text-2xl font-bold text-gray-900">${summary.unbilledAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-indigo-50 rounded-lg mr-4">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalHours}h</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-green-50 rounded-lg mr-4">
            <BriefcaseIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Billed to Date</p>
            <p className="text-2xl font-bold text-gray-900">${summary.billedAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">Pending Approvals</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {pendingHours.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No pending time entries.</li>
            ) : pendingHours.map((hour) => (
              <li key={hour.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-blue-600">{hour.user?.firstName} {hour.user?.lastName}</p>
                  <p className="text-sm text-gray-900 font-medium">{hour.hours} hours - {hour.engagement?.name || 'General'}</p>
                  <p className="text-xs text-gray-500 italic mt-1">{hour.description}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => handleUpdateStatus(hour.id, 'APPROVED')} className="text-green-600 hover:bg-green-50 p-1 rounded-full border border-green-100">
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                  <button onClick={() => handleUpdateStatus(hour.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1 rounded-full border border-red-100">
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Inv #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.client?.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold">${Number(inv.total || inv.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;