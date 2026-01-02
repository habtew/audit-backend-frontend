import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { TrialBalance, ComparisonResult } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTb: TrialBalance | null;
}

const CompareTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, currentTb }) => {
  const [others, setOthers] = useState<TrialBalance[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch other TBs for this engagement
  useEffect(() => {
    if (isOpen && currentTb?.engagementId) {
      apiClient.getTrialBalances({ engagementId: currentTb.engagementId })
        .then(res => {
          // Filter out current TB
          setOthers((res.data.trialBalances || []).filter(tb => tb.id !== currentTb.id));
        })
        .catch(() => toast.error('Failed to load other versions'));
    }
  }, [isOpen, currentTb]);

  const handleCompare = async () => {
    if (!currentTb || !selectedId) return;
    try {
      setLoading(true);
      const res = await apiClient.compareTrialBalances(currentTb.id, selectedId);
      setResults(res.data);
    } catch (e) {
      toast.error('Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Compare Trial Balances</Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
          </div>

          <div className="flex gap-4 mb-6 items-end">
             <div className="flex-1">
               <label className="block text-sm font-medium mb-1">Compare against:</label>
               <select 
                 className="w-full border p-2 rounded" 
                 value={selectedId} 
                 onChange={(e) => setSelectedId(e.target.value)}
               >
                 <option value="">Select a version...</option>
                 {others.map(tb => (
                    <option key={tb.id} value={tb.id}>
                        v{tb.version} - {new Date(tb.period).toLocaleDateString()}
                    </option>
                 ))}
               </select>
             </div>
             <button 
               onClick={handleCompare} 
               disabled={!selectedId || loading}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
             >
               {loading ? 'Comparing...' : 'Run Comparison'}
             </button>
          </div>

          {results && (
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-4 py-2 text-left text-xs uppercase">Account</th>
                   <th className="px-4 py-2 text-right text-xs uppercase">Current</th>
                   <th className="px-4 py-2 text-right text-xs uppercase">Previous</th>
                   <th className="px-4 py-2 text-right text-xs uppercase">Variance</th>
                   <th className="px-4 py-2 text-right text-xs uppercase">%</th>
                 </tr>
               </thead>
               <tbody>
                 {results.map((r) => (
                   <tr key={r.accountNumber} className="border-b">
                     <td className="px-4 py-2 text-sm">{r.accountName}</td>
                     <td className="px-4 py-2 text-sm text-right">{r.currentBalance.toLocaleString()}</td>
                     <td className="px-4 py-2 text-sm text-right">{r.previousBalance.toLocaleString()}</td>
                     <td className={`px-4 py-2 text-sm text-right ${r.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {r.variance.toLocaleString()}
                     </td>
                     <td className="px-4 py-2 text-sm text-right">{r.variancePercentage.toFixed(1)}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompareTrialBalanceModal;