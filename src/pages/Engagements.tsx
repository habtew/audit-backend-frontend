import React, { useEffect, useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  CalendarIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  ArrowRightCircleIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import { Engagement, Client } from '../types';
import PreEngagementWizard from '../components/Engagement/PreEngagementWizard'; // Import the new wizard

const Engagements: React.FC = () => {
  const navigate = useNavigate();
  
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [engagementsRes, clientsRes] = await Promise.all([
        apiClient.getEngagements(),
        apiClient.getClients({ limit: 1000 })
      ]);
      setEngagements(engagementsRes.data?.engagements || []);
      setClients(clientsRes.data?.clients || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = (id: string) => {
    navigate(`/engagements/${id}`);
  };

  const handleDeleteEngagement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.deleteEngagement(id);
      toast.success('Deleted');
      setEngagements(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'EXECUTION': return 'bg-blue-100 text-blue-800';
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEngagements = engagements.filter(e => {
    const s = searchTerm.toLowerCase();
    const matchSearch = (e.name?.toLowerCase().includes(s)) || (e.description?.toLowerCase().includes(s));
    const matchStatus = statusFilter ? e.status === statusFilter : true;
    const matchClient = clientFilter ? e.clientId === clientFilter : true;
    return matchSearch && matchStatus && matchClient;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagements</h1>
          <p className="text-sm text-gray-500">Manage audit files and workflows.</p>
        </div>
        
        {/* Updated Button to Open Wizard */}
        <button onClick={() => setIsWizardOpen(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> Start New Engagement
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
         <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input 
              className="input pl-10 w-full" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="EXECUTION">Execution</option>
            <option value="COMPLETED">Completed</option>
         </select>
         <select className="input w-40" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEngagements.map(engagement => (
          <div 
            key={engagement.id}
            className="card group hover:shadow-lg transition-all border border-gray-200 cursor-pointer relative"
            onClick={() => handleOpenWorkspace(engagement.id)}
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {engagement.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1"/>
                    {getClientName(engagement.clientId)}
                  </div>
               </div>
               <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(engagement.status)}`}>
                 {engagement.status}
               </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
               <div className="flex items-center">
                 <CalendarIcon className="h-4 w-4 mr-2 text-gray-400"/>
                 Year End: {engagement.yearEnd ? new Date(engagement.yearEnd).toLocaleDateString() : 'N/A'}
               </div>
               <div className="flex items-center">
                 <ClockIcon className="h-4 w-4 mr-2 text-gray-400"/>
                 Budget: {engagement.budgetHours} Hrs
               </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
               <span className="text-xs font-medium text-primary-600 flex items-center group-hover:translate-x-1 transition-transform">
                 Open Workspace <ArrowRightCircleIcon className="h-4 w-4 ml-1"/>
               </span>
               <div className="flex gap-2">
                 <button 
                   onClick={(e) => handleDeleteEngagement(engagement.id, e)}
                   className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                 >
                   <TrashIcon className="h-4 w-4"/>
                 </button>
               </div>
            </div>
          </div>
        ))}

        {filteredEngagements.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="No engagements found" onAction={() => setIsWizardOpen(true)} />
          </div>
        )}
      </div>

      {/* The New Wizard Component */}
      <PreEngagementWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSuccess={() => {
           fetchData();
           setIsWizardOpen(false);
        }}
        clients={clients}
      />
    </div>
  );
};

export default Engagements;