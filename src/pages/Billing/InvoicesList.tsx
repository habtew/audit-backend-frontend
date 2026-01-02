// // import React, { useEffect, useState } from 'react';
// // import { apiClient } from '../../utils/api';
// // import { Invoice } from '../../types';
// // import LoadingSpinner from '../../components/Common/LoadingSpinner';
// // import { PlusIcon, CurrencyDollarIcon, PaperAirplaneIcon, EyeIcon } from '@heroicons/react/24/outline';
// // import GenerateInvoiceModal from './GenerateInvoiceModal';
// // import { useNavigate } from 'react-router-dom';
// // import toast from 'react-hot-toast';

// // const InvoicesList: React.FC = () => {
// //   const [invoices, setInvoices] = useState<Invoice[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
// //   const navigate = useNavigate();

// //   const fetchInvoices = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await apiClient.getInvoices();
// //       setInvoices(res.data || []);
// //     } catch (error) {
// //       console.error(error);
// //       toast.error('Failed to load invoices');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchInvoices();
// //   }, []);

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case 'PAID': return 'bg-green-100 text-green-800';
// //       case 'SENT': return 'bg-blue-100 text-blue-800';
// //       case 'OVERDUE': return 'bg-red-100 text-red-800';
// //       default: return 'bg-gray-100 text-gray-800';
// //     }
// //   };

// //   if (loading) return <LoadingSpinner />;

// //   return (
// //     <div className="p-6">
// //       <div className="flex justify-between items-center mb-6">
// //         <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
// //         <div className="flex gap-2">
// //           {/* <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Log Time</button> */}
// //           <button
// //             onClick={() => setGenerateModalOpen(true)}
// //             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //           >
// //             <PlusIcon className="w-5 h-5 mr-2" />
// //             Generate Invoice
// //           </button>
// //         </div>
// //       </div>

// //       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
// //               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {invoices.map((inv) => (
// //               <tr key={inv.id} className="hover:bg-gray-50">
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.client?.name}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inv.issueDate).toLocaleDateString()}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${inv.totalAmount?.toLocaleString()}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inv.status)}`}>
// //                     {inv.status}
// //                   </span>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
// //                   <button 
// //                     onClick={() => navigate(`/billing/invoices/${inv.id}`)}
// //                     className="text-gray-400 hover:text-blue-600 mx-2"
// //                     title="View Details"
// //                   >
// //                     <EyeIcon className="w-5 h-5" />
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //             {invoices.length === 0 && (
// //                 <tr>
// //                     <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No invoices found. Generate one to get started.</td>
// //                 </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       <GenerateInvoiceModal 
// //         isOpen={isGenerateModalOpen} 
// //         onClose={() => setGenerateModalOpen(false)}
// //         onSuccess={fetchInvoices}
// //       />
// //     </div>
// //   );
// // };

// // export default InvoicesList;



// import React, { useEffect, useState } from 'react';
// import { apiClient } from '../../utils/api';
// import { Invoice } from '../../types';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { PlusIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
// import GenerateInvoiceModal from './GenerateInvoiceModal';
// import TimeEntryModal from './TimeEntryModal';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// const InvoicesList: React.FC = () => {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // Modal States
//   const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
//   const [isTimeModalOpen, setTimeModalOpen] = useState(false);
  
//   const navigate = useNavigate();

//   const fetchInvoices = async () => {
//     try {
//       setLoading(true);
//       const res = await apiClient.getInvoices();
      
//       // --- FIX: Handle Nested Data Structure ---
//       // Your backend returns: { data: { invoices: [], pagination: {} }, message: "..." }
      
//       const payload = res.data as any; 
      
//       // Check 1: Is it deeply nested? (res.data.data.invoices)
//       if (payload?.data?.invoices && Array.isArray(payload.data.invoices)) {
//         setInvoices(payload.data.invoices);
//       } 
//       // Check 2: Is it directly in data? (res.data.invoices)
//       else if (payload?.invoices && Array.isArray(payload.invoices)) {
//         setInvoices(payload.invoices);
//       }
//       // Check 3: Is the response itself the array?
//       else if (Array.isArray(payload)) {
//         setInvoices(payload);
//       }
//       // Fallback: Empty array to prevent .map() crash
//       else {
//         console.warn("Unexpected API response format:", payload);
//         setInvoices([]);
//       }

//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error('Failed to load invoices');
//       setInvoices([]); 
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'PAID': return 'bg-green-100 text-green-800';
//       case 'SENT': return 'bg-blue-100 text-blue-800';
//       case 'OVERDUE': return 'bg-red-100 text-red-800';
//       case 'CANCELLED': return 'bg-gray-100 text-gray-500';
//       default: return 'bg-yellow-100 text-yellow-800'; // DRAFT
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="p-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
//           <p className="text-sm text-gray-500 mt-1">Manage client billing and track time entries.</p>
//         </div>
//         <div className="flex gap-3">
//           <button 
//             onClick={() => setTimeModalOpen(true)}
//             className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
//           >
//             <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
//             Log Time
//           </button>
          
//           <button
//             onClick={() => setGenerateModalOpen(true)}
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
//           >
//             <PlusIcon className="w-5 h-5 mr-2" />
//             Generate Invoice
//           </button>
//         </div>
//       </div>

//       {/* Invoices Table */}
//       <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {invoices && invoices.length > 0 ? invoices.map((inv) => (
//               <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                   {inv.invoiceNumber}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                   <div className="font-medium text-gray-900">{inv.client?.name}</div>
//                   <div className="text-xs text-gray-500">{inv.engagement?.name || 'General'}</div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(inv.issueDate).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(inv.dueDate).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
//                   ${inv.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-center">
//                   <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inv.status)}`}>
//                     {inv.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <button 
//                     onClick={() => navigate(`/billing/invoices/${inv.id}`)}
//                     className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
//                     title="View Invoice"
//                   >
//                     <EyeIcon className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             )) : (
//                 <tr>
//                     <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
//                       <div className="flex flex-col items-center justify-center">
//                         <PlusIcon className="h-10 w-10 text-gray-300 mb-2" />
//                         <p className="text-lg font-medium text-gray-900">No invoices yet</p>
//                         <p className="text-sm text-gray-500">Log some time or generate your first invoice to get started.</p>
//                       </div>
//                     </td>
//                 </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modals */}
//       <GenerateInvoiceModal 
//         isOpen={isGenerateModalOpen} 
//         onClose={() => setGenerateModalOpen(false)}
//         onSuccess={fetchInvoices}
//       />
      
//       <TimeEntryModal
//         isOpen={isTimeModalOpen}
//         onClose={() => setTimeModalOpen(false)}
//         onSuccess={() => toast.success('Time logged successfully')}
//       />
//     </div>
//   );
// };

// export default InvoicesList;



import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/api';
import { Invoice } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { PlusIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import GenerateInvoiceModal from './GenerateInvoiceModal';
import TimeEntryModal from './TimeEntryModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InvoicesList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const [isTimeModalOpen, setTimeModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getInvoices();
      // API returns: { data: { invoices: [], pagination: {} } }
      if (res.data && Array.isArray(res.data.invoices)) {
        setInvoices(res.data.invoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error('Failed to load invoices');
      setInvoices([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client billing and track time entries.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setTimeModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
          >
            <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
            Log Time
          </button>
          
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length > 0 ? invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inv.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{inv.client?.name}</div>
                  <div className="text-xs text-gray-500">{inv.engagement?.name || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(inv.issueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                  {/* Handle string or number for total */}
                  ${Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/billing/invoices/${inv.id}`)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                    title="View Invoice"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <PlusIcon className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-lg font-medium text-gray-900">No invoices yet</p>
                      </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <GenerateInvoiceModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setGenerateModalOpen(false)}
        onSuccess={fetchInvoices}
      />
      
      <TimeEntryModal
        isOpen={isTimeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        onSuccess={() => toast.success('Time logged successfully')}
      />
    </div>
  );
};

export default InvoicesList;