import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { apiClient } from '../../utils/api';
import { TrialBalance, ComparisonResult } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTb: TrialBalance;
}

const CompareTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, currentTb }) => {
  const [others, setOthers] = useState<TrialBalance[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch other TBs for this engagement to compare against
      apiClient.getTrialBalances({ engagementId: currentTb.engagementId }).then(res => {
        setOthers(res.data.trialBalances.filter(t => t.id !== currentTb.id));
      });
    }
  }, [isOpen, currentTb]);

  const handleCompare = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await apiClient.compareTrialBalances(currentTb.id, selectedId);
      setComparison(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-xl h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Compare Trial Balances</h3>
            <button onClick={onClose} className="text-gray-500">Close</button>
          </div>

          <div className="flex gap-4 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Compare Current ({new Date(currentTb.period).toLocaleDateString()}) vs:</label>
              <select 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select a period...</option>
                {others.map(t => (
                  <option key={t.id} value={t.id}>{new Date(t.period).toLocaleDateString()} - {t.description}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleCompare}
              disabled={!selectedId || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
            >
              Run Comparison
            </button>
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            {loading ? <LoadingSpinner /> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Previous</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparison.map((row) => (
                    <tr key={row.accountId}>
                      <td className="px-4 py-2 text-sm text-gray-900">{row.accountName}</td>
                      <td className="px-4 py-2 text-sm text-right">{row.currentAmount.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-right">{row.previousAmount.toLocaleString()}</td>
                      <td className={`px-4 py-2 text-sm text-right font-bold ${row.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.variance.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">{row.percentageChange.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {comparison.length === 0 && !loading && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Select a period to compare</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompareTrialBalanceModal;