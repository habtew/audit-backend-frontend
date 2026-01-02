import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { TrialBalance, TrialBalanceAccount, TrialBalanceSummaryData } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { ArrowDownTrayIcon, ArrowsRightLeftIcon, PencilSquareIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import AdjustmentsModal from './AdjustmentsModal';
import CompareTrialBalanceModal from './CompareTrialBalanceModal';
import EditAccountModal from './EditAccountModal';
import toast from 'react-hot-toast';

const TrialBalanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tb, setTb] = useState<TrialBalance | null>(null);
  const [summary, setSummary] = useState<TrialBalanceSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedAccount, setSelectedAccount] = useState<TrialBalanceAccount | null>(null);
  const [isAdjModalOpen, setAdjModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const tbRes = await apiClient.getTrialBalanceById(id);
      setTb(tbRes.data);
      
      const sumRes = await apiClient.getTrialBalanceSummary(id);
      setSummary(sumRes.data.summary);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    try {
      const res = await apiClient.exportTrialBalance(id);
      const jsonString = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial_balance_${id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export downloaded");
    } catch (e) {
      toast.error('Export failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!tb) return <div className="p-6 text-center text-gray-500">Trial Balance Not Found</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{tb.engagement?.name || 'Engagement'}</h1>
          <div className="text-sm text-gray-600">
            <p>Period: {new Date(tb.period).toLocaleDateString()}</p>
            <p>Version: {tb.version} | Status: {tb.isActive ? 'Active' : 'Inactive'}</p>
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
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500 text-xs uppercase">Total Accounts</div>
            {/* Fallback to summary if accounts count is not directly on tb, though usually summary has it */}
            <div className="text-2xl font-bold">{summary?.totalAccounts || tb._count?.accounts || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500 text-xs uppercase">Total Debits</div>
            {/* Using tb.totalDebits to match the record exactly */}
            <div className="text-2xl font-bold text-gray-900">{Number(tb.totalDebits).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500 text-xs uppercase">Total Credits</div>
            {/* Using tb.totalCredits to match the record exactly */}
            <div className="text-2xl font-bold text-gray-900">{Number(tb.totalCredits).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500 text-xs uppercase">Balanced</div>
            {/* Using tb.isBalanced (the persistent status) instead of calculated summary */}
            <div className={`text-2xl font-bold ${tb.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {tb.isBalanced ? 'Yes' : 'No'}
            </div>
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
            {(!tb.accounts || tb.accounts.length === 0) && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No accounts found in this trial balance.</td></tr>
            )}
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
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                    {/* Edit Account Button */}
                    <button 
                      onClick={() => { setSelectedAccount(acc); setEditModalOpen(true); }}
                      className="text-gray-400 hover:text-indigo-600"
                      title="Edit Account Details"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    {/* Adjustment Button */}
                    <button 
                      onClick={() => { setSelectedAccount(acc); setAdjModalOpen(true); }}
                      className="text-gray-400 hover:text-blue-600"
                      title="Add Adjustment"
                    >
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdjustmentsModal 
        isOpen={isAdjModalOpen} 
        onClose={() => setAdjModalOpen(false)} 
        onSuccess={fetchData} 
        tbId={tb.id} 
        account={selectedAccount} 
      />

      <EditAccountModal 
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchData}
        tbId={tb.id}
        account={selectedAccount}
      />
      
      <CompareTrialBalanceModal 
          isOpen={isCompareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          currentTb={tb} 
      />
    </div>
  );
};

export default TrialBalanceDetail;