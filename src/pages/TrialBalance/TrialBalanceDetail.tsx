// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { apiClient } from '../../utils/api';
// import { TrialBalance, TrialBalanceAccount } from '../../types';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// const TrialBalanceDetail: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [tb, setTb] = useState<TrialBalance | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (id) {
//       apiClient.getTrialBalanceById(id)
//         .then(res => setTb(res.data))
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [id]);

//   if (loading) return <LoadingSpinner />;
//   if (!tb) return <div>Not Found</div>;

//   return (
//     <div className="p-6">
//       <div className="mb-6 bg-white p-6 rounded-lg shadow">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">{tb.engagement?.name} - Trial Balance</h1>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
//             <div><span className="font-semibold">Period:</span> {new Date(tb.period).toLocaleDateString()}</div>
//             <div><span className="font-semibold">Imported:</span> {new Date(tb.createdAt).toLocaleDateString()}</div>
//             <div className="text-green-600"><span className="font-semibold">Total Debit:</span> {tb.totalDebit?.toLocaleString()}</div>
//             <div className="text-green-600"><span className="font-semibold">Total Credit:</span> {tb.totalCredit?.toLocaleString()}</div>
//         </div>
//       </div>

//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account #</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {tb.accounts?.map((acc: TrialBalanceAccount) => (
//               <tr key={acc.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 text-sm text-gray-900">{acc.accountNumber}</td>
//                 <td className="px-6 py-4 text-sm text-gray-900 font-medium">{acc.accountName}</td>
//                 <td className="px-6 py-4 text-sm text-right font-mono">{acc.debitAmount > 0 ? acc.debitAmount.toLocaleString() : '-'}</td>
//                 <td className="px-6 py-4 text-sm text-right font-mono">{acc.creditAmount > 0 ? acc.creditAmount.toLocaleString() : '-'}</td>
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                     {/* Placeholder for Inline Edit or Dropdown */}
//                     <span className={`px-2 py-1 rounded text-xs ${acc.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//                         {acc.category || 'Unmapped'}
//                     </span>
//                 </td>
//                 <td className="px-6 py-4 text-center">
//                     {acc.category ? (
//                         <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" title="Mapped" />
//                     ) : (
//                         <ExclamationCircleIcon className="w-5 h-5 text-yellow-500 mx-auto" title="Pending Mapping" />
//                     )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TrialBalanceDetail;


// src/pages/TrialBalance/TrialBalanceDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { TrialBalance, TrialBalanceAccount } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import AdjustmentsModal from './AdjustmentsModal';
import CompareTrialBalanceModal from './CompareTrialBalanceModal';
import toast from 'react-hot-toast';

const TrialBalanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tb, setTb] = useState<TrialBalance | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedAccount, setSelectedAccount] = useState<TrialBalanceAccount | null>(null);
  const [isAdjModalOpen, setAdjModalOpen] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);

  const fetchTB = () => {
    if (id) {
      setLoading(true);
      apiClient.getTrialBalanceById(id)
        .then(res => setTb(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchTB();
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    try {
      const blob = await apiClient.exportTrialBalance(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial_balance_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error('Export failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tb) return <div>Not Found</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{tb.engagement?.name} - Trial Balance</h1>
          <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
            <p>Period: {new Date(tb.period).toLocaleDateString()}</p>
            <p>Status: <span className="font-semibold text-blue-600">{tb.status}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
          >
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2" />
            Compare
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tb.accounts?.map((acc: TrialBalanceAccount) => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{acc.accountNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{acc.accountName}</td>
                <td className="px-6 py-4 text-sm text-right font-mono">{acc.debitAmount > 0 ? acc.debitAmount.toLocaleString() : '-'}</td>
                <td className="px-6 py-4 text-sm text-right font-mono">{acc.creditAmount > 0 ? acc.creditAmount.toLocaleString() : '-'}</td>
                <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${acc.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                        {acc.category || 'Unmapped'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => { setSelectedAccount(acc); setAdjModalOpen(true); }}
                      className="text-gray-400 hover:text-blue-600 tooltip"
                      title="Add Adjustment"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr>
                <td colSpan={2} className="px-6 py-3 text-right">Totals:</td>
                <td className="px-6 py-3 text-right text-green-700">{tb.totalDebit?.toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-green-700">{tb.totalCredit?.toLocaleString()}</td>
                <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modals */}
      <AdjustmentsModal 
        isOpen={isAdjModalOpen} 
        onClose={() => setAdjModalOpen(false)} 
        onSuccess={fetchTB} 
        tbId={tb.id} 
        account={selectedAccount} 
      />

      {tb && (
        <CompareTrialBalanceModal 
          isOpen={isCompareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          currentTb={tb}
        />
      )}
    </div>
  );
};

export default TrialBalanceDetail;