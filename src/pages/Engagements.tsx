import React, { useEffect, useState, Fragment } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  XMarkIcon,
  UserCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
// We import types but will extend/override them locally to match the new API fields
import { Client } from '../types';

// Updated Interfaces matching the new API Docs
interface Entity {
  id: string;
  name: string;
  clientId: string;
  type: string;
}

interface Engagement {
  id: string;
  name: string;
  type: 'AUDIT' | 'REVIEW' | 'COMPILATION' | 'TAX' | 'ADVISORY';
  status: 'PLANNING' | 'FIELDWORK' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';
  description?: string;
  startDate?: string;
  endDate?: string;
  yearEnd?: string;
  clientId: string;
  entityId: string;
  budgetHours: number;
  actualHours?: number;
  createdAt?: string;
  updatedAt?: string;
  // Nested objects from Detail API
  client?: { id: string; name: string; industry?: string; email?: string; };
  entity?: { id: string; name: string; taxId?: string; };
  creator?: { firstName: string; lastName: string; email: string; };
  users?: any[];
}

const Engagements: React.FC = () => {
  // State
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewEngagement, setViewEngagement] = useState<Engagement | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<Partial<Engagement>>();

  // Watch clientId to filter entities in the form
  const selectedClientId = useWatch({ control, name: 'clientId' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Engagements, Clients, and Entities in parallel
      // We pass limit: 1000 to get full lists for dropdowns
      const [engagementsRes, clientsRes, entitiesRes] = await Promise.all([
        apiClient.getEngagements(),
        apiClient.getClients({ limit: 1000 }),
        apiClient.getEntities({ limit: 1000 })
      ]);

      // Robust extraction helper
      const extractArray = (res: any, key?: string) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        
        // Check res.data (standard)
        if (Array.isArray(res.data)) return res.data;
        
        // Check nested keys (e.g. res.data.clients)
        if (key && res.data && Array.isArray(res.data[key])) return res.data[key];
        if (key && res[key] && Array.isArray(res[key])) return res[key];
        
        return [];
      };

      setEngagements(extractArray(engagementsRes, 'engagements'));
      setClients(extractArray(clientsRes, 'clients'));
      setEntities(extractArray(entitiesRes, 'entities'));

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEngagement = async (data: Partial<Engagement>) => {
    try {
      // FIX: Remove 'status' from creation payload as API sets it automatically
      const { status, ...cleanData } = data;

      const payload = {
        ...cleanData,
        budgetHours: Number(cleanData.budgetHours),
        // Send undefined for entityId if it's an empty string (e.g. "Select Entity" option)
        entityId: cleanData.entityId || undefined,
        startDate: cleanData.startDate ? new Date(cleanData.startDate).toISOString() : undefined,
        endDate: cleanData.endDate ? new Date(cleanData.endDate).toISOString() : undefined,
        yearEnd: cleanData.yearEnd ? new Date(cleanData.yearEnd).toISOString() : undefined,
      };

      await apiClient.createEngagement(payload);
      toast.success('Engagement created successfully');
      fetchData();
      closeModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to create engagement';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleUpdateEngagement = async (data: Partial<Engagement>) => {
    if (!editingEngagement) return;
    try {
      const payload = {
        ...data,
        budgetHours: Number(data.budgetHours),
        entityId: data.entityId || undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        yearEnd: data.yearEnd ? new Date(data.yearEnd).toISOString() : undefined,
      };

      await apiClient.updateEngagement(editingEngagement.id, payload);
      toast.success('Engagement updated successfully');
      fetchData();
      closeModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to update engagement';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDeleteEngagement = async (engagementId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (!confirm('Are you sure you want to delete this engagement?')) return;
    try {
      await apiClient.deleteEngagement(engagementId);
      toast.success('Engagement deleted successfully');
      setEngagements(prev => prev.filter(e => e.id !== engagementId));
    } catch (error) {
      toast.error('Failed to delete engagement');
    }
  };

  // --- View Detail Logic ---
  const handleViewEngagement = async (id: string) => {
    try {
      setIsDetailModalOpen(true);
      setDetailLoading(true);
      const res: any = await apiClient.getEngagementById(id);
      // Extract data safely
      const data = res.data || res;
      setViewEngagement(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load engagement details');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openModal = (engagement?: Engagement, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent detail click
    if (engagement) {
      setEditingEngagement(engagement);
      // Format dates for input fields (YYYY-MM-DD)
      const formatDate = (d?: string) => d ? new Date(d).toISOString().split('T')[0] : '';
      const formattedData = {
        ...engagement,
        startDate: formatDate(engagement.startDate),
        endDate: formatDate(engagement.endDate),
        yearEnd: formatDate(engagement.yearEnd),
      };
      reset(formattedData);
    } else {
      setEditingEngagement(null);
      reset({
        status: 'PLANNING', 
        type: 'AUDIT',
        budgetHours: 0,
        clientId: '',
        entityId: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEngagement(null);
    reset();
  };

  // --- Filtering Logic ---
  const safeEngagements = Array.isArray(engagements) ? engagements : [];
  
  const filteredEngagements = safeEngagements.filter(engagement => {
    const matchesSearch = 
      (engagement.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (engagement.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || engagement.status === statusFilter;
    const matchesType = !typeFilter || engagement.type === typeFilter;
    const matchesClient = !clientFilter || engagement.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  // --- Helpers ---
  const getClientName = (clientId: string) => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const client = safeClients.find(c => c.id === clientId);
    return client?.company || client?.name || 'Unknown Client';
  };

  const getEntityName = (entityId: string) => {
    const safeEntities = Array.isArray(entities) ? entities : [];
    const entity = safeEntities.find(e => e.id === entityId);
    return entity?.name || 'N/A';
  };

  // Filter entities for the dropdown based on selected Client
  const availableEntities = selectedClientId 
    ? (Array.isArray(entities) ? entities : []).filter(e => e.clientId === selectedClientId)
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FIELDWORK': return 'bg-blue-100 text-blue-800';
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-purple-100 text-purple-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AUDIT': return 'text-indigo-600 bg-indigo-50 ring-indigo-500/10';
      case 'TAX': return 'text-emerald-600 bg-emerald-50 ring-emerald-500/10';
      case 'ADVISORY': return 'text-orange-600 bg-orange-50 ring-orange-500/10';
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagements</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your audit, tax, and advisory engagements.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Engagement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search engagements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="input w-full"
        >
          <option value="">All Clients</option>
          {Array.isArray(clients) && clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.company || client.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full"
        >
          <option value="">All Statuses</option>
          {['PLANNING', 'FIELDWORK', 'REVIEW', 'COMPLETED', 'ARCHIVED'].map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full"
        >
          <option value="">All Types</option>
          {['AUDIT', 'REVIEW', 'COMPILATION', 'TAX', 'ADVISORY'].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {filteredEngagements.length === 0 ? (
        <EmptyState
          title="No engagements found"
          description="Try adjusting your filters or create a new engagement."
          actionLabel="New Engagement"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredEngagements.map((engagement) => (
            <div 
              key={engagement.id} 
              onClick={() => handleViewEngagement(engagement.id)}
              className="card hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] group-hover:text-primary-600 transition-colors" title={engagement.name}>
                      {engagement.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getTypeColor(engagement.type)}`}>
                      {engagement.type}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    <span className="truncate max-w-[180px]">
                      {getClientName(engagement.clientId)}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(engagement.status)}`}>
                  {engagement.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {engagement.description || 'No description provided.'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      {engagement.endDate ? new Date(engagement.endDate).toLocaleDateString() : 'No Deadline'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{engagement.budgetHours} Hrs</span>
                  </div>
                </div>
                
                {engagement.entityId && (
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
                    Entity: {getEntityName(engagement.entityId)}
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={(e) => openModal(engagement, e)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors z-10"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteEngagement(engagement.id, e)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {detailLoading ? (
                  <div className="p-12 flex justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : viewEngagement ? (
                  <div className="flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">{viewEngagement.name}</h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(viewEngagement.status)}`}>
                            {viewEngagement.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${getTypeColor(viewEngagement.type)}`}>
                            {viewEngagement.type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <span className="flex items-center gap-1.5">
                            <BuildingOfficeIcon className="h-4 w-4"/> 
                            {viewEngagement.client?.name || getClientName(viewEngagement.clientId)}
                          </span>
                          {viewEngagement.entity && (
                            <span className="flex items-center gap-1.5">
                              <InformationCircleIcon className="h-4 w-4"/>
                              {viewEngagement.entity.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsDetailModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-200"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto space-y-8">
                      {/* Description */}
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">Scope & Description</h4>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {viewEngagement.description || 'No detailed description provided.'}
                        </p>
                      </div>

                      {/* Key Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Timeline</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 block mb-1">Start Date</span>
                              <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                                <CalendarIcon className="h-4 w-4 text-gray-400"/>
                                {viewEngagement.startDate ? new Date(viewEngagement.startDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 block mb-1">End Date</span>
                              <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                                <CalendarIcon className="h-4 w-4 text-gray-400"/>
                                {viewEngagement.endDate ? new Date(viewEngagement.endDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 block mb-1">Fiscal Year End</span>
                              <div className="font-medium text-gray-900 text-sm">
                                {viewEngagement.yearEnd ? new Date(viewEngagement.yearEnd).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Resources</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 block mb-1">Budget</span>
                              <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                                <ClockIcon className="h-4 w-4 text-gray-400"/>
                                {viewEngagement.budgetHours} Hours
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 block mb-1">Actual</span>
                              <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                                <ClockIcon className="h-4 w-4 text-gray-400"/>
                                {viewEngagement.actualHours || 0} Hours
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-xs text-gray-500 block mb-1">Created By</span>
                            <div className="flex items-center gap-2 font-medium text-gray-900 text-sm">
                              <UserCircleIcon className="h-4 w-4 text-gray-400"/>
                              {viewEngagement.creator ? `${viewEngagement.creator.firstName} ${viewEngagement.creator.lastName}` : 'System'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Team Section (if needed/available) */}
                      {viewEngagement.users && viewEngagement.users.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-3">Assigned Team</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewEngagement.users.map((u: any, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {u.user?.firstName} {u.user?.lastName} ({u.role})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                      <button 
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          openModal(viewEngagement);
                        }} 
                        className="btn-secondary text-sm"
                      >
                        Edit Engagement
                      </button>
                      <button 
                        onClick={() => setIsDetailModalOpen(false)} 
                        className="btn-primary text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    Failed to load details.
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                    {editingEngagement ? 'Edit Engagement' : 'New Engagement'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(editingEngagement ? handleUpdateEngagement : handleCreateEngagement)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                      {/* Name */}
                      <div className="sm:col-span-2">
                        <label className="label">Engagement Name</label>
                        <input
                          {...register('name', { required: 'Name is required' })}
                          type="text"
                          className="input"
                          placeholder="e.g., 2024 Annual Audit"
                        />
                        {errors.name && <p className="text-error">{errors.name.message}</p>}
                      </div>

                      {/* Client */}
                      <div>
                        <label className="label">Client</label>
                        <select 
                          {...register('clientId', { required: 'Client is required' })} 
                          className="input"
                          onChange={(e) => {
                            setValue('clientId', e.target.value);
                            setValue('entityId', ''); // Reset entity when client changes
                          }}
                        >
                          <option value="">Select Client</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.company || c.name}</option>
                          ))}
                        </select>
                        {errors.clientId && <p className="text-error">{errors.clientId.message}</p>}
                      </div>

                      {/* Entity - Dependent on Client */}
                      <div>
                        <label className="label">Entity</label>
                        <select 
                          {...register('entityId', { required: 'Entity is required' })} 
                          className="input"
                          disabled={!selectedClientId}
                        >
                          <option value="">Select Entity</option>
                          {availableEntities.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                        {!selectedClientId && <p className="text-xs text-gray-500 mt-1">Select a client first</p>}
                        {errors.entityId && <p className="text-error">{errors.entityId.message}</p>}
                      </div>

                      {/* Type */}
                      <div>
                        <label className="label">Type</label>
                        <select {...register('type', { required: 'Type is required' })} className="input">
                          <option value="">Select Type</option>
                          {['AUDIT', 'REVIEW', 'COMPILATION', 'TAX', 'ADVISORY'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {errors.type && <p className="text-error">{errors.type.message}</p>}
                      </div>

                      {/* Status - Only visible for Editing */}
                      {editingEngagement && (
                        <div>
                          <label className="label">Status</label>
                          <select {...register('status', { required: 'Status is required' })} className="input">
                            <option value="">Select Status</option>
                            {['PLANNING', 'FIELDWORK', 'REVIEW', 'COMPLETED', 'ARCHIVED'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {errors.status && <p className="text-error">{errors.status.message}</p>}
                        </div>
                      )}

                      {/* Start Date */}
                      <div>
                        <label className="label">Start Date</label>
                        <input
                          {...register('startDate', { required: 'Start date is required' })}
                          type="date"
                          className="input"
                        />
                        {errors.startDate && <p className="text-error">{errors.startDate.message}</p>}
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="label">End Date</label>
                        <input
                          {...register('endDate', { required: 'End date is required' })}
                          type="date"
                          className="input"
                        />
                        {errors.endDate && <p className="text-error">{errors.endDate.message}</p>}
                      </div>

                      {/* Year End (NEW) */}
                      <div>
                        <label className="label">Year End</label>
                        <input
                          {...register('yearEnd', { required: 'Year End is required' })}
                          type="date"
                          className="input"
                        />
                        {errors.yearEnd && <p className="text-error">{errors.yearEnd.message}</p>}
                      </div>

                      {/* Budget Hours */}
                      <div>
                        <label className="label">Budget Hours</label>
                        <input
                          {...register('budgetHours', { 
                            required: 'Budget hours are required',
                            min: { value: 0, message: 'Must be positive' },
                            valueAsNumber: true
                          })}
                          type="number"
                          className="input"
                          placeholder="e.g., 200"
                        />
                        {errors.budgetHours && <p className="text-error">{errors.budgetHours.message}</p>}
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <label className="label">Description</label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="input"
                          placeholder="Scope of the engagement..."
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        {editingEngagement ? 'Update Engagement' : 'Create Engagement'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Engagements;