import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ClipboardDocumentCheckIcon, 
  DocumentChartBarIcon, 
  MapIcon,
  ShieldCheckIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PBCRequestsList from '../components/Engagement/PBCRequestsList';
// import PreEngagementTab from '../components/Engagement/PreEngagementTab';
import PreEngagementTab from '../components/Engagement/PreEngagementTab';
import PlanningTab from '../components/Engagement/Planning/PlanningTab';
import toast from 'react-hot-toast';
import { Engagement } from '../types';

const EngagementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs: Overview | Pre-Engagement | Planning | Fieldwork | Completion
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.getEngagementById(id!);
      setEngagement(res.data);
      
      // Auto-select tab based on status if first load
      // if (res.data.status === 'PLANNING') setActiveTab('planning');
      // if (res.data.status === 'EXECUTION') setActiveTab('fieldwork');
    } catch (error) {
      toast.error('Failed to load engagement');
      navigate('/engagements');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDetail();
  };

  if (loading) return <LoadingSpinner />;
  if (!engagement) return <div>Engagement not found</div>;

  const isPlanningActive = engagement.status === 'PLANNING';
  const isExecutionActive = engagement.status === 'EXECUTION' || engagement.status === 'REVIEW' || engagement.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 shadow rounded-lg">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/engagements')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{engagement.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                engagement.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                engagement.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {engagement.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {engagement.client?.name} • {engagement.type} • {engagement.budgetHours} Hrs Budget
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="border-b border-gray-200 bg-white px-4 rounded-t-lg">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('pre-engagement')}
            className={`${activeTab === 'pre-engagement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Pre-Engagement
          </button>

          <button
            onClick={() => setActiveTab('planning')}
            className={`${activeTab === 'planning' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Planning
            {isPlanningActive && <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('fieldwork')}
            disabled={!isExecutionActive && !isPlanningActive} // Allow viewing if planning is active (optional, typically locked until complete)
            className={`${activeTab === 'fieldwork' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} ${!isExecutionActive ? 'opacity-50 cursor-not-allowed' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
            Fieldwork (Execution)
            {isExecutionActive && engagement.status === 'EXECUTION' && <span className="ml-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
             {/* ... Existing overview content ... */}
             <div className="px-4 py-5 sm:px-6">
               <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Summary</h3>
             </div>
             <div className="border-t border-gray-200 px-4 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                   <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(engagement.startDate!).toLocaleDateString()} - {new Date(engagement.endDate!).toLocaleDateString()}</dd>
                   </div>
                   <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Fiscal Year End</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(engagement.yearEnd!).toLocaleDateString()}</dd>
                   </div>
                   <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{engagement.description}</dd>
                   </div>
                </dl>
             </div>
          </div>
        )}

        {activeTab === 'pre-engagement' && (
          <PreEngagementTab data={engagement.preEngagement} />
        )}

        {activeTab === 'planning' && id && (
          <PlanningTab engagementId={id} onComplete={refreshData} />
        )}

        {activeTab === 'fieldwork' && (
          <div className="space-y-6">
            {/* Fieldwork Sub-navigation could go here */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
               <h3 className="text-lg font-bold mb-2">Audit Procedures</h3>
               <p className="text-gray-500">Manage PBC Requests, Trial Balances, and Workpapers.</p>
            </div>
            
            {/* Embed PBC Requests */}
            <div className="bg-white shadow rounded-lg p-4">
              <h4 className="font-semibold mb-4 flex items-center"><ClipboardDocumentCheckIcon className="h-5 w-5 mr-2"/> PBC Requests</h4>
              <PBCRequestsList engagementId={id!} />
            </div>

            {/* Placeholder for TB */}
            <div className="bg-white shadow rounded-lg p-4">
               <h4 className="font-semibold mb-4 flex items-center"><DocumentChartBarIcon className="h-5 w-5 mr-2"/> Trial Balance</h4>
               <div className="bg-gray-50 p-6 text-center text-gray-500 rounded border border-dashed border-gray-300">
                  Trial Balance Module
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementDetail;