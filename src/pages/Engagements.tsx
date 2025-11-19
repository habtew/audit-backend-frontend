import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../utils/api';
import { Engagement, Client } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

const Engagements: React.FC = () => {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Engagement>>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [engagementsResponse, clientsResponse] = await Promise.all([
        apiClient.getEngagements(),
        apiClient.getClients(),
      ]);

      // --- ROBUST DATA EXTRACTION START ---
      
      // 1. Extract Engagements safely
      let engagementData: Engagement[] = [];
      const eRes: any = engagementsResponse;
      if (Array.isArray(eRes)) {
        engagementData = eRes;
      } else if (eRes?.data && Array.isArray(eRes.data)) {
        engagementData = eRes.data;
      } else if (eRes?.engagements && Array.isArray(eRes.engagements)) {
        engagementData = eRes.engagements;
      } else if (eRes?.data?.engagements && Array.isArray(eRes.data.engagements)) {
        engagementData = eRes.data.engagements;
      }

      // 2. Extract Clients safely
      let clientData: Client[] = [];
      const cRes: any = clientsResponse;
      if (Array.isArray(cRes)) {
        clientData = cRes;
      } else if (cRes?.data && Array.isArray(cRes.data)) {
        clientData = cRes.data;
      } else if (cRes?.clients && Array.isArray(cRes.clients)) {
        clientData = cRes.clients;
      } else if (cRes?.data?.clients && Array.isArray(cRes.data.clients)) {
        clientData = cRes.data.clients;
      }

      setEngagements(engagementData);
      setClients(clientData);
      // --- ROBUST DATA EXTRACTION END ---

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setEngagements([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEngagement = async (data: Partial<Engagement>) => {
    try {
      await apiClient.createEngagement(data);
      toast.success('Engagement created successfully');
      fetchData();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create engagement');
    }
  };

  const handleUpdateEngagement = async (data: Partial<Engagement>) => {
    if (!editingEngagement) return;
    
    try {
      await apiClient.updateEngagement(editingEngagement.id, data);
      toast.success('Engagement updated successfully');
      fetchData();
      setIsModalOpen(false);
      setEditingEngagement(null);
      reset();
    } catch (error) {
      toast.error('Failed to update engagement');
    }
  };

  const handleDeleteEngagement = async (engagementId: string) => {
    if (!confirm('Are you sure you want to delete this engagement?')) return;
    
    try {
      await apiClient.deleteEngagement(engagementId);
      toast.success('Engagement deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete engagement');
    }
  };

  const openModal = (engagement?: Engagement) => {
    if (engagement) {
      setEditingEngagement(engagement);
      reset(engagement);
    } else {
      setEditingEngagement(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEngagement(null);
    reset();
  };

  // Ensure we are filtering an array
  const safeEngagements = Array.isArray(engagements) ? engagements : [];

  const filteredEngagements = safeEngagements.filter(engagement => {
    const matchesSearch = engagement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engagement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || engagement.status === statusFilter;
    const matchesType = !typeFilter || engagement.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-primary';
      case 'planning': return 'badge-warning';
      case 'review': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      default: return 'badge-gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audit': return 'bg-blue-100 text-blue-800';
      case 'tax': return 'bg-green-100 text-green-800';
      case 'consulting': return 'bg-purple-100 text-purple-800';
      case 'advisory': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (clientId: string) => {
    // Safe check for clients array as well
    const safeClientsList = Array.isArray(clients) ? clients : [];
    const client = safeClientsList.find(c => c.id === clientId);
    return client?.company || client?.name || 'Unknown Client';
  };

  const engagementTypes = ['audit', 'tax', 'consulting', 'advisory'];
  const engagementStatuses = ['planning', 'in-progress', 'review', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagements</h1>
          <p className="text-gray-600">Manage your client engagements and projects</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Engagement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search engagements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          {engagementStatuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status.replace('-', ' ')}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="">All Types</option>
          {engagementTypes.map(type => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Engagements Grid */}
      {filteredEngagements.length === 0 ? (
        <EmptyState
          title="No engagements found"
          description="Get started by creating your first engagement."
          actionLabel="New Engagement"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEngagements.map((engagement) => (
            <div key={engagement.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{engagement.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{getClientName(engagement.clientId)}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{engagement.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`badge ${getStatusColor(engagement.status)} capitalize`}>
                    {engagement.status.replace('-', ' ')}
                  </span>
                  <span className={`badge ${getTypeColor(engagement.type || 'default')} capitalize`}>
                    {engagement.type || 'N/A'}
                  </span>
                 </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                 {new Date(engagement.startDate ?? '').toLocaleDateString()} –{' '}
                  {engagement.endDate ? new Date(engagement.endDate).toLocaleDateString() : 'Present'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  <span>
                    Budget: ${engagement.budget?.toLocaleString() || 0}
                  </span>
                </div>

                {engagement.actualCost && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="ml-6">
                      Actual: ${engagement.actualCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {new Date(engagement.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* View engagement details */}}
                    className="text-gray-600 hover:text-gray-900"
                    title="View details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(engagement)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit engagement"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEngagement(engagement.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete engagement"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingEngagement ? 'Edit Engagement' : 'New Engagement'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(editingEngagement ? handleUpdateEngagement : handleCreateEngagement)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label">Title</label>
                        <input
                          {...register('title', { required: 'Title is required' })}
                          type="text"
                          className="input"
                          placeholder="Enter engagement title"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Client</label>
                        <select {...register('clientId', { required: 'Client is required' })} className="input">
                          <option value="">Select client</option>
                          {Array.isArray(clients) && clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.company || client.name}
                            </option>
                          ))}
                        </select>
                        {errors.clientId && (
                          <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Type</label>
                        <select {...register('type', { required: 'Type is required' })} className="input">
                          <option value="">Select type</option>
                          {engagementTypes.map((type) => (
                            <option key={type} value={type} className="capitalize">
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Status</label>
                        <select {...register('status', { required: 'Status is required' })} className="input">
                          <option value="">Select status</option>
                          {engagementStatuses.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status.replace('-', ' ')}
                            </option>
                          ))}
                        </select>
                        {errors.status && (
                          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Budget</label>
                        <input
                          {...register('budget', { 
                            required: 'Budget is required',
                            min: { value: 0, message: 'Budget must be positive' }
                          })}
                          type="number"
                          className="input"
                          placeholder="Enter budget amount"
                        />
                        {errors.budget && (
                          <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Start Date</label>
                        <input
                          {...register('startDate', { required: 'Start date is required' })}
                          type="date"
                          className="input"
                        />
                        {errors.startDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">End Date</label>
                        <input
                          {...register('endDate', { required: 'End date is required' })}
                          type="date"
                          className="input"
                        />
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="label">Description</label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="input"
                          placeholder="Enter engagement description"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingEngagement ? 'Update' : 'Create'} Engagement
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