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



import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Invoice, BillableHour, BillableHourStatus, InvoiceStatus } from '../../types/index';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingHours, setPendingHours] = useState<BillableHour[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // FIX: Removed 'status' param from API call because backend doesn't support it yet.
      // We fetch a larger batch (limit: 50) and filter client-side instead.
      const [hoursRes, invoicesRes] = await Promise.all([
        api.getBillableHours({ limit: 50 }), 
        api.getInvoices({ limit: 5 })
      ]);

      // Client-side filtering for PENDING status
      const allHours = hoursRes.data?.data || [];
      const pendingFiltered = allHours
        .filter((h) => h.status === BillableHourStatus.PENDING)
        .slice(0, 5); // Take only the top 5

      setPendingHours(pendingFiltered);
      setRecentInvoices(invoicesRes.data?.data || []);
    } catch (error) {
      console.error("Failed to load billing data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHour = async (id: string) => {
    try {
      await api.approveTimeEntry(id);
      toast.success('Time entry approved');
      // Remove from UI immediately
      setPendingHours(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      toast.error('Failed to approve');
    }
  };

  const handleRejectHour = async (id: string) => {
    if(!window.confirm("Reject this time entry?")) return;
    try {
      await api.rejectTimeEntry(id);
      toast.success('Time entry rejected');
      // Remove from UI immediately
      setPendingHours(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Billing Overview</h1>

      {/* Pending Approvals Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Pending Time Approvals
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {pendingHours.length === 0 ? (
            <li className="px-4 py-4 text-sm text-gray-500 text-center">No pending approvals found in recent entries.</li>
          ) : pendingHours.map((hour) => (
            <li key={hour.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {hour.user?.firstName} {hour.user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">{hour.hours} hrs</span> on <span className="font-medium">{hour.engagement?.client.name || 'Unknown Client'}</span>
                </p>
                <p className="text-xs text-gray-400 truncate">{hour.description}</p>
              </div>
              <div className="flex space-x-2 shrink-0">
                <button 
                  onClick={() => handleApproveHour(hour.id)}
                  className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                  title="Approve"
                >
                  <CheckCircleIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => handleRejectHour(hour.id)}
                  className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                  title="Reject"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-500" />
            Recent Invoices
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInvoices.length === 0 ? (
                 <tr><td colSpan={4} className="p-4 text-center text-sm text-gray-500">No recent invoices.</td></tr>
              ) : recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${invoice.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' : 
                        invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;