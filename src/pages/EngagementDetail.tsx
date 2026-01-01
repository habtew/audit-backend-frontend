// src/pages/EngagementDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ClipboardDocumentCheckIcon, 
  DocumentChartBarIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PBCRequestsList from '../components/Engagement/PBCRequestsList';
// import TrialBalanceList from './TrialBalance/TrialBalanceList'; // Future integration
import toast from 'react-hot-toast';

interface EngagementDetail {
  id: string;
  name: string;
  status: string;
  type: string;
  client: { name: string; industry?: string };
  budgetHours: number;
  startDate: string;
  endDate: string;
}

const EngagementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<EngagementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pbc' | 'tb' | 'risk'>('overview');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res: any = await api.getEngagementById(id!);
      setEngagement(res.data || res); // Handle potential response wrapping
    } catch (error) {
      toast.error('Failed to load engagement');
      navigate('/engagements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!engagement) return <div>Engagement not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 shadow rounded-lg">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/engagements')}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{engagement.name}</h1>
            <p className="text-sm text-gray-500">
              {engagement.client?.name} • <span className="uppercase">{engagement.type}</span> • {engagement.status}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pbc')}
            className={`${activeTab === 'pbc' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
            PBC Requests
          </button>
          <button
            onClick={() => setActiveTab('tb')}
            className={`${activeTab === 'tb' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <DocumentChartBarIcon className="h-4 w-4 mr-2" />
            Trial Balance
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`${activeTab === 'risk' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Risk Assessment
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Information</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{engagement.client?.name}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Budget Hours</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{engagement.budgetHours} hrs</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(engagement.startDate).toLocaleDateString()} - {new Date(engagement.endDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* --- INTEGRATION POINT --- */}
        {activeTab === 'pbc' && id && (
          <PBCRequestsList engagementId={id} />
        )}

        {activeTab === 'tb' && (
          <div className="bg-gray-50 p-10 text-center text-gray-500 rounded-lg">
            Trial Balance integration coming next...
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementDetail;