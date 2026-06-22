// src/pages/Entities.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  BuildingOffice2Icon, PlusIcon, PencilSquareIcon, TrashIcon, 
  XMarkIcon, EyeIcon, BriefcaseIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/api';
import RoleGuard from '../components/Auth/RoleGuard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Entities: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [entities, setEntities] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Selection States
  const [selectedEntity, setSelectedEntity] = useState<any>(null); // For detail view
  const [entityEngagements, setEntityEngagements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    clientId: '',
    name: '',
    type: 'CORPORATION',
    taxId: '',
    yearEnd: ''
  });

  // Fetch all entities and clients on mount
  const fetchData = async () => {
    setLoading(true);
    try {
      const [entityRes, clientRes] = await Promise.all([
        apiClient.getEntities(),
        apiClient.getClients().catch(() => ({ data: { clients: [] } }))
      ]);
      
      const eData = entityRes.data?.data?.entities || entityRes.data?.entities || [];
      const cData = clientRes.data?.data?.clients || clientRes.data?.clients || [];
      
      setEntities(Array.isArray(eData) ? eData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (error) {
      console.error("Failed to fetch entities", error);
      toast.error("Failed to load entities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ clientId: '', name: '', type: 'CORPORATION', taxId: '', yearEnd: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (entity: any) => {
    setEditingId(entity.id);
    setForm({
      clientId: entity.clientId || '',
      name: entity.name || '',
      type: entity.type || 'CORPORATION',
      taxId: entity.taxId || '',
      yearEnd: entity.yearEnd ? new Date(entity.yearEnd).toISOString().split('T')[0] : ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = async (entityId: string) => {
    setActionLoading(true);
    const toastId = toast.loading('Loading details...');
    try {
      const [entityRes, engagementsRes] = await Promise.all([
        apiClient.getEntityById(entityId),
        apiClient.getEntityEngagements(entityId).catch(() => ({ data: { data: [] } }))
      ]);
      
      setSelectedEntity(entityRes.data?.data || entityRes.data);
      setEntityEngagements(engagementsRes.data?.data || engagementsRes.data || []);
      
      setIsDetailModalOpen(true);
      toast.dismiss(toastId);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load details', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    // Ensure date is properly formatted to ISO string for backend
    const payload = {
      ...form,
      yearEnd: form.yearEnd ? new Date(form.yearEnd).toISOString() : null
    };

    try {
      if (editingId) {
        await apiClient.updateEntity(editingId, payload);
        toast.success('Entity updated successfully');
      } else {
        await apiClient.createEntity(payload);
        toast.success('Entity created successfully');
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to save entity'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entity? This action cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      await apiClient.deleteEntity(id);
      toast.success('Entity deleted successfully');
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete entity');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entities</h1>
          <p className="text-slate-500 mt-1">Manage corporate entities, subsidiaries, and branches.</p>
        </div>
        <RoleGuard minRole="MANAGER">
          <button 
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add Entity
          </button>
        </RoleGuard>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {entities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BuildingOffice2Icon className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Entities Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">There are currently no entities registered in the system. Add an entity to begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Entity Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tax ID</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Engagements</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {entities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{entity.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">FYE: {entity.yearEnd ? new Date(entity.yearEnd).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {entity.client?.name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {entity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                      {entity.taxId || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                      {entity._count?.engagements || 0}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenDetails(entity.id)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <RoleGuard minRole="MANAGER">
                        <button 
                          onClick={() => handleOpenEdit(entity)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entity.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </RoleGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================================== */}
      <Transition appear show={isFormModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsFormModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">
                    {editingId ? 'Edit Entity' : 'Create New Entity'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Parent Client *</label>
                      <select required className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}>
                        <option value="" disabled>-- Select a Client --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Entity Name *</label>
                      <input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Acme Corp UK" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Entity Type</label>
                        <select className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                          <option value="CORPORATION">Corporation</option>
                          <option value="LLC">LLC</option>
                          <option value="PARTNERSHIP">Partnership</option>
                          <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                          <option value="NON_PROFIT">Non-Profit</option>
                          <option value="TRUST">Trust</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Financial Year End *</label>
                        <input required type="date" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.yearEnd} onChange={e => setForm({...form, yearEnd: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tax ID / TIN</label>
                      <input type="text" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono" value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} placeholder="e.g. TIN-12345678" />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                      <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                        {editingId ? 'Save Changes' : 'Create Entity'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ========================================== */}
      {/* DETAILED VIEW MODAL */}
      {/* ========================================== */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col">
                  
                  {selectedEntity && (
                    <>
                      {/* Modal Header */}
                      <div className="bg-slate-800 p-6 flex justify-between items-start shrink-0 text-white">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {selectedEntity.type}
                            </span>
                            <span className="text-slate-400 text-sm flex items-center">
                              <BuildingOffice2Icon className="w-4 h-4 mr-1"/> Parent: {selectedEntity.client?.name}
                            </span>
                          </div>
                          <Dialog.Title as="h2" className="text-2xl font-bold leading-tight">
                            {selectedEntity.name}
                          </Dialog.Title>
                        </div>
                        <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 p-2 rounded-full transition-colors">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 bg-slate-50 space-y-6">
                        
                        {/* Entity Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
                            <div className="bg-blue-50 p-3 rounded-lg mr-4"><CalendarIcon className="w-6 h-6 text-blue-600"/></div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Financial Year End</p>
                              <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedEntity.yearEnd ? new Date(selectedEntity.yearEnd).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
                            <div className="bg-emerald-50 p-3 rounded-lg mr-4"><BriefcaseIcon className="w-6 h-6 text-emerald-600"/></div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Tax ID / TIN</p>
                              <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{selectedEntity.taxId || 'Not Provided'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Associated Engagements Table */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-800">Associated Engagements</h3>
                          </div>
                          
                          {entityEngagements.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 text-sm">
                              No engagements currently associated with this entity.
                            </div>
                          ) : (
                            <table className="min-w-full divide-y divide-slate-100">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Engagement Name</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {entityEngagements.map((eng: any) => (
                                  <tr key={eng.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 text-sm font-bold text-indigo-600">{eng.name}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{eng.type}</td>
                                    <td className="px-6 py-3 text-center">
                                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                        {eng.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                      </div>
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