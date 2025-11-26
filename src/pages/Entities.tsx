import React, { useEffect, useState, Fragment } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingLibraryIcon, 
  CalendarIcon, 
  IdentificationIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import { Client, Engagement } from '../types';

// Define Entity Interface locally based on API docs
interface Entity {
  id: string;
  name: string;
  type: string;
  taxId?: string;
  yearEnd?: string;
  clientId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  client?: { name: string }; // Added nested client object from API response
}

const entityTypes = [
  'Corporation',
  'S Corporation', 
  'LLC', 
  'Partnership', 
  'Sole Proprietorship', 
  'Non-profit',
  'Trust',
  'Other'
];

const Entities: React.FC = () => {
  // --- State ---
  const [entities, setEntities] = useState<Entity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  // const [typeFilter, setTypeFilter] = useState(''); // API doesn't seem to support type filter yet based on screenshot
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [viewingEntity, setViewingEntity] = useState<Entity | null>(null);
  const [entityEngagements, setEntityEngagements] = useState<Engagement[]>([]);
  const [engagementsLoading, setEngagementsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Entity>>();

  // --- Effects ---
  // Debounce search and fetch data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, clientFilter, page]);

  // --- Helper: Robust Error Message Extraction ---
  const getErrorMessage = (error: any) => {
    const responseData = error?.response?.data;
    if (!responseData) return error?.message || 'An unexpected error occurred';
    const msg = responseData.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object' && msg !== null) return Object.values(msg).join(', ');
    return responseData.error || error.message || 'Operation failed';
  };

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Entities with filters
      const entityParams: any = { page, limit: LIMIT };
      if (searchTerm) entityParams.search = searchTerm;
      if (clientFilter) entityParams.clientId = clientFilter;

      const [entitiesRes, clientsRes] = await Promise.all([
        apiClient.getEntities(entityParams),
        apiClient.getClients({ limit: 1000 }) // Ensure we get all clients for dropdown
      ]);

      // 2. Extract Entities Correctly
      // API Response: { data: { entities: [...], pagination: {...} } }
      const eRes: any = entitiesRes;
      let entityList: Entity[] = [];
      
      if (eRes?.data?.entities && Array.isArray(eRes.data.entities)) {
        entityList = eRes.data.entities;
        setTotalPages(eRes.data.pagination?.totalPages || 1);
      } else if (Array.isArray(eRes?.data)) {
        // Fallback if structure changes
        entityList = eRes.data;
      } else if (Array.isArray(eRes)) {
        entityList = eRes;
      }
      
      setEntities(entityList);

      // 3. Extract Clients Correctly
      const cRes: any = clientsRes;
      let clientList: Client[] = [];
      if (cRes?.data?.clients && Array.isArray(cRes.data.clients)) {
        clientList = cRes.data.clients;
      } else if (Array.isArray(cRes?.data)) {
        clientList = cRes.data;
      } else if (Array.isArray(cRes)) {
        clientList = cRes;
      }
      setClients(clientList);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityEngagements = async (entityId: string) => {
    try {
      setEngagementsLoading(true);
      const response: any = await apiClient.getEntityEngagements(entityId);
      
      let data: Engagement[] = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;
      
      setEntityEngagements(data);
    } catch (error) {
      console.error('Failed to fetch entity engagements', error);
      setEntityEngagements([]);
    } finally {
      setEngagementsLoading(false);
    }
  };

  // --- Handlers ---
  const handleCreateEntity = async (data: Partial<Entity>) => {
    try {
      const { isActive, ...cleanData } = data;
      const payload = {
        ...cleanData,
        taxId: cleanData.taxId || undefined,
        yearEnd: cleanData.yearEnd ? new Date(cleanData.yearEnd).toISOString() : undefined
      };
      
      await apiClient.createEntity(payload);
      toast.success('Entity created successfully');
      fetchData();
      closeModal();
    } catch (error: any) {
      console.error("Create Entity Error:", error?.response?.data || error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateEntity = async (data: Partial<Entity>) => {
    if (!editingEntity) return;
    try {
      const payload = {
        ...data,
        taxId: data.taxId || undefined,
        yearEnd: data.yearEnd ? new Date(data.yearEnd).toISOString() : undefined
      };

      await apiClient.updateEntity(editingEntity.id, payload);
      toast.success('Entity updated successfully');
      fetchData();
      closeModal();
    } catch (error: any) {
      console.error("Update Entity Error:", error?.response?.data || error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteEntity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this entity?')) return;
    
    try {
      await apiClient.deleteEntity(id);
      toast.success('Entity deleted successfully');
      fetchData(); // Refresh list
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // --- Modal Management ---
  const openModal = (e?: React.MouseEvent, entity?: Entity) => {
    e?.stopPropagation();
    if (entity) {
      setEditingEntity(entity);
      reset({
        ...entity,
        yearEnd: entity.yearEnd ? entity.yearEnd.split('T')[0] : ''
      });
    } else {
      setEditingEntity(null);
      reset({ 
        isActive: true, 
        type: entityTypes[0],
        clientId: ''
      });
    }
    setIsModalOpen(true);
  };

  const openViewModal = (entity: Entity) => {
    setViewingEntity(entity);
    setEntityEngagements([]);
    setIsViewModalOpen(true);
    fetchEntityEngagements(entity.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
    reset();
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingEntity(null);
  };

  // --- Helpers ---
  const getClientName = (entity: Entity) => {
    // 1. Try to get name from nested client object (from API)
    if (entity.client?.name) return entity.client.name;
    // 2. Fallback to finding in clients list
    const client = clients.find(c => c.id === entity.clientId);
    return client?.company || client?.name || 'Unknown Client';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Entities</h1>
          <p className="text-gray-600">Manage client subsidiaries and legal structures</p>
        </div>
        <button onClick={(e) => openModal(e)} className="btn-primary w-full sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Entity
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
        
        <div className="w-full sm:w-64">
          <select
            value={clientFilter}
            onChange={(e) => { setClientFilter(e.target.value); setPage(1); }}
            className="input"
          >
            <option value="">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.company || c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : entities.length === 0 ? (
        <EmptyState
          title="No entities found"
          description="Add legal entities to associate them with your clients."
          actionLabel="New Entity"
          onAction={(e) => openModal(e)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <div 
                key={entity.id} 
                className="card hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                onClick={() => openViewModal(entity)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BuildingLibraryIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1" title={entity.name}>
                        {entity.name}
                      </h3>
                      <p className="text-xs text-gray-500">{entity.type}</p>
                    </div>
                  </div>
                  <span className={`badge ${entity.isActive ? 'badge-success' : 'badge-gray'}`}>
                    {entity.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 flex-1 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500 w-16">Client:</span>
                    <span className="truncate flex-1" title={getClientName(entity)}>
                      {getClientName(entity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdentificationIcon className="h-4 w-4 text-gray-400" />
                    <span>ID: {entity.taxId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>YE: {entity.yearEnd ? new Date(entity.yearEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={(e) => openModal(e, entity)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteEntity(entity.id, e)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4 bg-white rounded-lg shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary text-sm px-3 py-1 ml-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT MODAL */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingEntity ? 'Edit Entity' : 'New Legal Entity'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(editingEntity ? handleUpdateEntity : handleCreateEntity)} className="space-y-4">
                    <div>
                      <label className="label">Entity Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="input"
                        placeholder="e.g. Acme Holdings LLC"
                      />
                      {errors.name && <p className="text-error">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="label">Client Owner</label>
                      <select 
                        {...register('clientId', { required: 'Client is required' })} 
                        className="input"
                        disabled={!!editingEntity} // Usually safer not to change owner
                      >
                        <option value="">Select Client</option>
                        {Array.isArray(clients) && clients.map(c => (
                          <option key={c.id} value={c.id}>{c.company || c.name}</option>
                        ))}
                      </select>
                      {errors.clientId && <p className="text-error">{errors.clientId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Type</label>
                        <select {...register('type', { required: 'Type is required' })} className="input">
                          <option value="">Select Type</option>
                          {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.type && <p className="text-error">{errors.type.message}</p>}
                      </div>
                      
                      <div>
                        <label className="label">Tax ID</label>
                        <input {...register('taxId')} className="input" placeholder="XX-XXXXXXX" />
                      </div>
                    </div>

                    <div>
                      <label className="label">Fiscal Year End</label>
                      <input {...register('yearEnd')} type="date" className="input" />
                    </div>

                    {/* Only show Active checkbox when editing */}
                    {editingEntity && (
                      <div className="flex items-center gap-2 mt-4">
                          <input 
                              type="checkbox" 
                              id="isActive"
                              {...register('isActive')} 
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label htmlFor="isActive" className="text-sm text-gray-700">Active Entity</label>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={closeModal} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingEntity ? 'Update' : 'Create'} Entity
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* VIEW DETAILS MODAL */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeViewModal}>
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
                  {viewingEntity && (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{viewingEntity.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {viewingEntity.type} • {getClientName(viewingEntity)}
                          </p>
                        </div>
                        <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-500">
                          <span className="sr-only">Close</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="block text-gray-500">Tax ID</span>
                           <span className="font-medium text-gray-900">{viewingEntity.taxId || 'N/A'}</span>
                        </div>
                        <div>
                           <span className="block text-gray-500">Fiscal Year End</span>
                           <span className="font-medium text-gray-900">
                             {viewingEntity.yearEnd ? new Date(viewingEntity.yearEnd).toLocaleDateString() : 'N/A'}
                           </span>
                        </div>
                        <div>
                           <span className="block text-gray-500">Status</span>
                           <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${viewingEntity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                             {viewingEntity.isActive ? 'Active' : 'Inactive'}
                           </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                        Related Engagements
                      </h4>
                      
                      {engagementsLoading ? (
                        <div className="flex justify-center py-4"><LoadingSpinner /></div>
                      ) : entityEngagements.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                          <ul className="divide-y divide-gray-200">
                            {entityEngagements.map((eng) => (
                              <li key={eng.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{eng.name}</p>
                                    <p className="text-xs text-gray-500">{eng.type}</p>
                                  </div>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {eng.status}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          No engagements linked to this entity.
                        </div>
                      )}
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Entities;