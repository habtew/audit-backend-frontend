import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/api';
import { TrialBalance } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImportTrialBalanceModal from './ImportTrialBalanceModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TrialBalanceList: React.FC = () => {
  const [data, setData] = useState<TrialBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTB = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getTrialBalances();
      setData(res.data.trialBalances);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTB();
  }, []);

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this Trial Balance?')) {
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
        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Import New
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accounts</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((tb) => (
              <tr key={tb.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tb.engagement?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tb.period).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tb.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tb._count?.accounts || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => navigate(`/trial-balances/${tb.id}`)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(tb.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No trial balances imported yet.</td>
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
    </div>
  );
};

export default TrialBalanceList;