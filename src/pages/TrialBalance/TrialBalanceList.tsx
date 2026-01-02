import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/api';
import { TrialBalance } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { PlusIcon, EyeIcon, TrashIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import ImportTrialBalanceModal from './ImportTrialBalanceModal';
import CreateTrialBalanceModal from './CreateTrialBalanceModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TrialBalanceList: React.FC = () => {
  const [data, setData] = useState<TrialBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTB = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getTrialBalances();
      setData(res.data.trialBalances || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load trial balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTB();
  }, []);

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this Trial Balance?')) {
        try {
            await apiClient.deleteTrialBalance(id);
            toast.success('Deleted successfully');
            fetchTB();
        } catch(e) {
            toast.error('Failed to delete');
        }
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trial Balances</h1>
        <div className="flex gap-2">
          {/* Manual Create Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentPlusIcon className="w-5 h-5 mr-2" />
            Create Manual
          </button>
          
          {/* Import Button */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Import New
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debits</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((tb) => (
                <tr key={tb.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tb.engagement?.name || 'N/A'}
                    <div className="text-gray-500 text-xs">{tb.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tb.period).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">v{tb.version}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono">{Number(tb.totalDebits).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono">{Number(tb.totalCredits).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => navigate(`/trial-balances/${tb.id}`)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(tb.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No trial balances found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <ImportTrialBalanceModal 
        isOpen={isImportModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onSuccess={fetchTB} 
      />

      <CreateTrialBalanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchTB}
      />
    </div>
  );
};

export default TrialBalanceList;