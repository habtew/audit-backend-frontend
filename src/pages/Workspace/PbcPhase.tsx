// src/pages/Workspace/PbcPhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  DocumentMagnifyingGlassIcon, PlusIcon, TrashIcon, 
  CheckCircleIcon, ClockIcon, FolderOpenIcon, DocumentDuplicateIcon,
  XCircleIcon, UserIcon, BuildingOfficeIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PbcPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null); // State for the Detail View
  const [createMode, setCreateMode] = useState<'SINGLE' | 'TEMPLATE'>('SINGLE');
  
  // Forms
  const [singleForm, setSingleForm] = useState({ title: '', description: '', category: 'FINANCIALS', priority: 'MEDIUM', dueDate: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, tplRes] = await Promise.all([
        apiClient.getPbcRequests(),
        apiClient.getPbcTemplates().catch(() => ({ data: { data: [] } }))
      ]);

      const allReqs = reqRes.data?.data?.pbcRequests || reqRes.data?.pbcRequests || [];
      const allTpls = tplRes.data?.data || tplRes.data || [];

      const engagementReqs = allReqs.filter((req: any) => req.engagementId === engagement.id);
      
      setRequests(engagementReqs);
      setTemplates(allTpls);
    } catch (error) {
      console.error("Failed to fetch PBC data", error);
      toast.error("Failed to load PBC requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [engagement.id]);

  const handleError = (e: any, fallback: string) => {
    const errorObj = e.response?.data;
    let message = fallback;
    if (typeof errorObj === 'string') message = errorObj;
    else if (errorObj?.message) message = Array.isArray(errorObj.message) ? errorObj.message[0] : errorObj.message;
    toast.error(message);
  };

  // --- Handlers ---
  
  // View Details
  const handleOpenDetail = async (pbcId: string) => {
    setActionLoading(true);
    const toastId = toast.loading('Loading details...');
    try {
      const res: any = await apiClient.getPbcRequestById(pbcId);
      const data = res.data?.data || res.data;
      setSelectedRequest(data);
      toast.dismiss(toastId);
    } catch (e) {
      handleError(e, 'Failed to fetch details');
      toast.dismiss(toastId);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Single
  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.createPbcRequest({
        engagementId: engagement.id,
        ...singleForm,
        dueDate: new Date(singleForm.dueDate).toISOString()
      });
      toast.success('PBC Request created successfully!');
      setIsCreateModalOpen(false);
      setSingleForm({ title: '', description: '', category: 'FINANCIALS', priority: 'MEDIUM', dueDate: '' });
      fetchData();
    } catch (e) { handleError(e, 'Failed to create request'); } 
    finally { setActionLoading(false); }
  };

  // Create from Template
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return toast.error("Please select a template.");
    if (!singleForm.dueDate) return toast.error("Please select a default due date for these items.");
    
    setActionLoading(true);
    const toastId = toast.loading(`Generating ${selectedTemplate.items.length} requests...`);
    try {
      const promises = selectedTemplate.items.map((item: any) => 
        apiClient.createPbcRequest({
          engagementId: engagement.id,
          title: item.title,
          description: item.description,
          category: item.category,
          priority: item.priority,
          dueDate: new Date(singleForm.dueDate).toISOString()
        })
      );
      
      await Promise.all(promises);
      toast.success('Template applied successfully!', { id: toastId });
      setIsCreateModalOpen(false);
      setSelectedTemplate(null);
      fetchData();
    } catch (e) { handleError(e, 'Failed to apply template', toastId); } 
    finally { setActionLoading(false); }
  };

  // Complete
  const handleComplete = async (e: React.MouseEvent, pbcId: string) => {
    e.stopPropagation(); // Prevent opening the detail modal
    setActionLoading(true);
    try {
      await apiClient.completePbcRequest(pbcId);
      toast.success('Request marked as COMPLETED!');
      
      // If the modal for this item is currently open, update it
      if (selectedRequest && selectedRequest.id === pbcId) {
        handleOpenDetail(pbcId);
      }
      fetchData();
    } catch (e) { handleError(e, 'Failed to complete request'); } 
    finally { setActionLoading(false); }
  };

  // Delete
  const handleDelete = async (e: React.MouseEvent, pbcId: string) => {
    e.stopPropagation(); // Prevent opening the detail modal
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    setActionLoading(true);
    try {
      await apiClient.deletePbcRequest(pbcId);
      toast.success('Request deleted.');
      if (selectedRequest && selectedRequest.id === pbcId) setSelectedRequest(null);
      fetchData();
    } catch (e) { handleError(e, 'Failed to delete request'); } 
    finally { setActionLoading(false); }
  };

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="bg-green-100 text-green-800 text-[10px] uppercase px-2 py-1 rounded-full font-bold flex items-center"><CheckCircleIcon className="w-3 h-3 mr-1"/> Completed</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-800 text-[10px] uppercase px-2 py-1 rounded-full font-bold">In Progress</span>;
      default: return <span className="bg-amber-100 text-amber-800 text-[10px] uppercase px-2 py-1 rounded-full font-bold flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> Requested</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  const total = requests.length;
  const completed = requests.filter(r => r.status === 'COMPLETED').length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-6 flex justify-between items-start rounded-t-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Client PBC Requests</h2>
          <p className="text-slate-500 mt-1">Manage, track, and automate document collection from the client.</p>
        </div>
        <RoleGuard minRole="SENIOR">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> New Request
          </button>
        </RoleGuard>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Collection Progress</p>
            <div className="flex items-end mt-2"><span className="text-4xl font-black text-indigo-600">{progress}%</span></div>
            <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{width: `${progress}%`}}></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Pending Items</p>
            <p className="text-4xl font-black text-amber-600 mt-2">{pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Completed</p>
            <p className="text-4xl font-black text-green-600 mt-2">{completed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Requests</p>
            <p className="text-4xl font-black text-slate-800 mt-2">{total}</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center">
            <FolderOpenIcon className="w-5 h-5 text-slate-500 mr-2" />
            <h3 className="text-sm font-bold text-slate-800">Provided By Client (PBC) Tracker</h3>
          </div>
          
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No active requests</h3>
              <p className="text-slate-500 text-sm mt-1">Start by creating a new request or applying a template.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Title & Desc</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {requests.map((req: any) => (
                    <tr 
                      key={req.id} 
                      onClick={() => handleOpenDetail(req.id)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{req.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">{req.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{req.category.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {new Date(req.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {req.status !== 'COMPLETED' && (
                          <button onClick={(e) => handleComplete(e, req.id)} disabled={actionLoading} className="text-green-600 hover:text-green-800 bg-green-50 p-1.5 rounded-lg transition-colors" title="Mark Complete">
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        <RoleGuard minRole="MANAGER">
                          <button onClick={(e) => handleDelete(e, req.id)} disabled={actionLoading} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition-colors" title="Delete">
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
      </div>

      {/* ========================================== */}
      {/* DETAIL MODAL */}
      {/* ========================================== */}
      <Transition appear show={!!selectedRequest} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedRequest(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col">
                  
                  {selectedRequest && (
                    <>
                      {/* Header */}
                      <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start shrink-0">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusBadge(selectedRequest.status)}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(selectedRequest.priority)}`}>
                              {selectedRequest.priority} Priority
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {selectedRequest.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 leading-tight mt-1">
                            {selectedRequest.title}
                          </Dialog.Title>
                        </div>
                        <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                          <XCircleIcon className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-6">
                        
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2">Description & Instructions</h4>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap">
                            {selectedRequest.description}
                          </div>
                        </div>

                        {/* Dates & Timeline */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 flex items-center mb-1"><CalendarIcon className="w-4 h-4 mr-1"/> Target Due Date</p>
                            <p className={`font-bold ${new Date(selectedRequest.dueDate) < new Date() && selectedRequest.status !== 'COMPLETED' ? 'text-red-600' : 'text-slate-900'}`}>
                              {new Date(selectedRequest.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 flex items-center mb-1"><ClockIcon className="w-4 h-4 mr-1"/> Date Requested</p>
                            <p className="font-bold text-slate-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                          </div>
                          {selectedRequest.status === 'COMPLETED' && selectedRequest.completedAt && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                              <p className="text-xs font-bold text-green-700 flex items-center mb-1"><CheckCircleIcon className="w-4 h-4 mr-1"/> Completed On</p>
                              <p className="font-bold text-green-900">{new Date(selectedRequest.completedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Engagement & Client Context */}
                        {selectedRequest.engagement && (
                          <div className="border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-bold text-slate-800 mb-3">Context Information</h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                              <div className="flex items-start">
                                <BuildingOfficeIcon className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-slate-500">Client</p>
                                  <p className="text-sm font-bold text-slate-900">{selectedRequest.engagement.client?.name || 'Unknown'}</p>
                                  <p className="text-xs text-slate-500">{selectedRequest.engagement.client?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <DocumentMagnifyingGlassIcon className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-slate-500">Engagement</p>
                                  <p className="text-sm font-bold text-slate-900">{selectedRequest.engagement.name}</p>
                                  <p className="text-xs text-slate-500">Year End: {selectedRequest.engagement.yearEnd ? new Date(selectedRequest.engagement.yearEnd).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end space-x-3 rounded-b-xl">
                        <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100">
                          Close
                        </button>
                        {selectedRequest.status !== 'COMPLETED' && (
                          <button 
                            onClick={(e) => handleComplete(e, selectedRequest.id)} 
                            disabled={actionLoading} 
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="w-5 h-5 mr-2" /> Mark as Completed
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ========================================== */}
      {/* CREATE MODAL */}
      {/* ========================================== */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">
                    New PBC Request
                  </Dialog.Title>
                  
                  {/* Toggle Modes */}
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button onClick={() => setCreateMode('SINGLE')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${createMode === 'SINGLE' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}>Single Request</button>
                    <button onClick={() => setCreateMode('TEMPLATE')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center ${createMode === 'TEMPLATE' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}><DocumentDuplicateIcon className="w-4 h-4 mr-1"/> Use Template</button>
                  </div>

                  {/* Mode: SINGLE */}
                  {createMode === 'SINGLE' && (
                    <form onSubmit={handleCreateSingle} className="space-y-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Title *</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.title} onChange={e => setSingleForm({...singleForm, title: e.target.value})} placeholder="e.g. Q4 Bank Statements" /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Description *</label><textarea required rows={3} className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.description} onChange={e => setSingleForm({...singleForm, description: e.target.value})} placeholder="Detailed instructions for the client..." /></div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                          <select className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.category} onChange={e => setSingleForm({...singleForm, category: e.target.value})}>
                            <option value="FINANCIALS">Financials & TB</option><option value="CASH">Cash & Bank</option><option value="RECEIVABLES">Receivables</option><option value="PAYABLES">Payables</option><option value="INVENTORY">Inventory</option><option value="PAYROLL">Payroll</option><option value="TAX">Tax</option><option value="LEGAL">Legal & Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                          <select className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.priority} onChange={e => setSingleForm({...singleForm, priority: e.target.value})}>
                            <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                          </select>
                        </div>
                      </div>

                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Due Date *</label><input required type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.dueDate} onChange={e => setSingleForm({...singleForm, dueDate: e.target.value})} /></div>

                      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Send Request</button>
                      </div>
                    </form>
                  )}

                  {/* Mode: TEMPLATE */}
                  {createMode === 'TEMPLATE' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Select Firm Template</label>
                        <select 
                          className="w-full border-slate-300 rounded-lg shadow-sm font-medium text-slate-800"
                          value={selectedTemplate?.id || ''}
                          onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value))}
                        >
                          <option value="" disabled>-- Choose a Template --</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>

                      {selectedTemplate && (
                        <div className="animate-fade-in border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 p-3 border-b border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase">Included Items ({selectedTemplate.items.length})</p>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                            {selectedTemplate.items.map((item: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 border border-slate-200 rounded text-sm flex justify-between">
                                <span className="font-bold text-slate-700">{item.title}</span>
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{item.category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Target Due Date for All Items *</label><input required type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={singleForm.dueDate} onChange={e => setSingleForm({...singleForm, dueDate: e.target.value})} /></div>

                      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button onClick={handleCreateFromTemplate} disabled={actionLoading || !selectedTemplate || !singleForm.dueDate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                          Generate {selectedTemplate ? selectedTemplate.items.length : ''} Requests
                        </button>
                      </div>
                    </div>
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

export default PbcPhase;