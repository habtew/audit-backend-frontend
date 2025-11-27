import React, { useEffect, useState, Fragment, useRef } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowUpIcon, 
  DocumentCheckIcon, 
  FolderIcon,
  BriefcaseIcon,
  XMarkIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import { Engagement, Workpaper, WorkpaperTemplate, Document } from '../types';

const Workpapers: React.FC = () => {
  // --- State ---
  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [templates, setTemplates] = useState<WorkpaperTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [engagementFilter, setEngagementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // New Detail Modal
  
  const [editingWorkpaper, setEditingWorkpaper] = useState<Workpaper | null>(null);
  const [selectedWorkpaperId, setSelectedWorkpaperId] = useState<string | null>(null);
  const [viewWorkpaper, setViewWorkpaper] = useState<Workpaper | null>(null); // For Detail View
  
  // File Upload Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>();

  const useTemplate = watch('useTemplate');

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (useTemplate) {
      fetchTemplates();
    }
  }, [useTemplate]);

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [wpResponse, engResponse] = await Promise.all([
        apiClient.getWorkpapers(),
        apiClient.getEngagements({ limit: 100 })
      ]);

      // Extraction logic
      let wpList: Workpaper[] = [];
      const rawWp = wpResponse as any;
      if (rawWp?.data?.workpapers) wpList = rawWp.data.workpapers;
      else if (Array.isArray(rawWp?.data)) wpList = rawWp.data;
      else if (Array.isArray(rawWp)) wpList = rawWp;

      let engList: Engagement[] = [];
      const rawEng = engResponse as any;
      if (rawEng?.data?.engagements) engList = rawEng.data.engagements;
      else if (Array.isArray(rawEng?.data)) engList = rawEng.data;
      else if (Array.isArray(rawEng)) engList = rawEng;

      setWorkpapers(wpList);
      setEngagements(engList);
    } catch (error) {
      console.error('Data fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res: any = await apiClient.getWorkpaperTemplates();
      const templatesData = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Template fetch error:', error);
    }
  };

  const fetchWorkpaperDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true); // Open immediately to show loading state
      const res = await apiClient.getWorkpaperById(id);
      // @ts-ignore - Handle potentially different response wrapper
      const data = res.data || res; 
      setViewWorkpaper(data);
    } catch (error) {
      toast.error("Failed to load workpaper details");
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // --- Handlers ---
  const handleSaveWorkpaper = async (data: any) => {
    try {
      if (editingWorkpaper) {
        await apiClient.updateWorkpaper(editingWorkpaper.id, {
          title: data.title,
          description: data.description,
          status: data.status,
          reference: data.reference 
        });
        toast.success('Workpaper updated');
      } else {
        let newWorkpaper: Workpaper;
        if (data.useTemplate && data.templateId) {
          const res = await apiClient.createWorkpaperFromTemplate(data.templateId, {
            engagementId: data.engagementId,
            reference: data.reference,
            title: data.title
          });
          newWorkpaper = res.data;
        } else {
          const res = await apiClient.createWorkpaper({
            engagementId: data.engagementId,
            reference: data.reference,
            title: data.title,
            description: data.description,
            content: {} 
          });
          newWorkpaper = res.data;
        }

        if (data.file && data.file.length > 0) {
          const file = data.file[0];
          const toastId = toast.loading('Uploading attachment...');
          try {
            await apiClient.uploadWorkpaperDocument(newWorkpaper.id, file);
            toast.success('Workpaper created & file uploaded', { id: toastId });
          } catch (uploadError) {
            toast.error('Workpaper created, but file upload failed', { id: toastId });
          }
        } else {
          toast.success('Workpaper created successfully');
        }
      }
      fetchData();
      closeModal();
    } catch (error: any) {
      let msg = error?.response?.data?.message;
      if (typeof msg === 'object' && msg?.message) msg = msg.message;
      if (Array.isArray(msg)) msg = msg.join(', ');
      toast.error(typeof msg === 'string' ? msg : 'Operation failed');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (!confirm('Delete this workpaper?')) return;
    try {
      await apiClient.deleteWorkpaper(id);
      toast.success('Deleted successfully');
      setWorkpapers(prev => prev.filter(w => w.id !== id));
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkpaperId || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    try {
      const toastId = toast.loading('Uploading document...');
      await apiClient.uploadWorkpaperDocument(selectedWorkpaperId, file);
      toast.dismiss(toastId);
      toast.success('Document uploaded successfully');
      setIsUploadModalOpen(false);
      
      // Refresh list or details depending on view
      fetchData();
      if (isDetailModalOpen && selectedWorkpaperId === viewWorkpaper?.id) {
        fetchWorkpaperDetails(selectedWorkpaperId);
      }
      setSelectedWorkpaperId(null);
    } catch (error) {
      toast.dismiss();
      toast.error('Upload failed');
    }
  };

  const handleReview = async (data: any) => {
    if (!selectedWorkpaperId) return;
    try {
      await apiClient.reviewWorkpaper(selectedWorkpaperId, {
        status: 'REVIEWED',
        notes: data.reviewNotes
      });
      toast.success('Workpaper marked as Reviewed');
      fetchData();
      setIsReviewModalOpen(false);
      setSelectedWorkpaperId(null);
    } catch (error) {
      toast.error('Review failed');
    }
  };

  // --- Helpers ---
  const getEngagementName = (id: string) => {
    const eng = engagements.find(e => e.id === id);
    return eng?.name || 'Unknown Engagement';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- Modal Controls ---
  const openCreateModal = () => {
    setEditingWorkpaper(null);
    reset({ useTemplate: false, file: null });
    setIsModalOpen(true);
  };

  const openEditModal = (wp: Workpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkpaper(wp);
    reset({
      title: wp.title,
      reference: wp.reference,
      description: wp.description,
      engagementId: wp.engagementId,
      status: wp.status,
      useTemplate: false
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorkpaper(null);
    reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REVIEWED': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Filtered List ---
  const filteredWorkpapers = workpapers.filter(wp => {
    const matchesSearch = 
      (wp.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (wp.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEng = !engagementFilter || wp.engagementId === engagementFilter;
    const matchesStatus = !statusFilter || wp.status === statusFilter;
    return matchesSearch && matchesEng && matchesStatus;
  });

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workpapers</h1>
          <p className="mt-2 text-sm text-gray-700">Manage audit documentation.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary mt-4 sm:mt-0 flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> New Workpaper
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 w-full" />
        </div>
        <select value={engagementFilter} onChange={(e) => setEngagementFilter(e.target.value)} className="input w-full">
          <option value="">All Engagements</option>
          {engagements.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full">
          <option value="">All Statuses</option>
          {['DRAFT', 'IN_PROGRESS', 'REVIEWED', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Workpaper List */}
      {filteredWorkpapers.length === 0 ? (
        <EmptyState title="No workpapers found" description="Create a new one to get started." actionLabel="New Workpaper" onAction={openCreateModal} icon={FolderIcon} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkpapers.map((wp) => (
            <div 
              key={wp.id} 
              onClick={() => fetchWorkpaperDetails(wp.id)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-gray-200">{wp.reference}</span>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{wp.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(wp.status)}`}>{wp.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">{wp.description || 'No description'}</p>
                  <div className="flex items-center text-xs text-gray-400 gap-4">
                    <span className="flex items-center gap-1"><BriefcaseIcon className="h-3 w-3" /> {getEngagementName(wp.engagementId)}</span>
                    {/* Show Attachment Count if available */}
                    {wp._count && wp._count.documents > 0 && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <PaperClipIcon className="h-3 w-3" /> {wp._count.documents}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions (Stop Propagation to prevent opening detail modal) */}
                <div className="flex items-center gap-2 self-start sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedWorkpaperId(wp.id); setIsUploadModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary-600 bg-gray-50 rounded-full" title="Upload">
                    <DocumentArrowUpIcon className="h-5 w-5" />
                  </button>
                  <button onClick={(e) => openEditModal(wp, e)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-full" title="Edit">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={(e) => handleDelete(wp.id, e)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded-full" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL (New) */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                  {detailLoading ? (
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-medium text-gray-500">{viewWorkpaper?.reference}</span>
                        <h2 className="text-xl font-bold text-gray-900">{viewWorkpaper?.title}</h2>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(viewWorkpaper?.status || '')}`}>
                          {viewWorkpaper?.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4"/> 
                          {viewWorkpaper?.engagement?.name || getEngagementName(viewWorkpaper?.engagementId || '')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4"/> 
                          Last Updated: {new Date(viewWorkpaper?.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {detailLoading ? (
                    <div className="flex justify-center py-12"><LoadingSpinner /></div>
                  ) : viewWorkpaper ? (
                    <>
                      {/* Description */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {viewWorkpaper.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Documents Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FolderIcon className="h-5 w-5 text-gray-400" />
                            Attachments
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                              {viewWorkpaper.documents?.length || 0}
                            </span>
                          </h3>
                          <button 
                            onClick={() => { setSelectedWorkpaperId(viewWorkpaper.id); setIsUploadModalOpen(true); }}
                            className="btn-secondary text-xs py-1.5"
                          >
                            <PlusIcon className="h-4 w-4 mr-1.5" /> Add File
                          </button>
                        </div>

                        {!viewWorkpaper.documents || viewWorkpaper.documents.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <DocumentArrowUpIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No documents attached yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {viewWorkpaper.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="bg-red-50 p-2 rounded-lg">
                                    <DocumentArrowUpIcon className="h-5 w-5 text-red-500" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                      <span>{formatFileSize(doc.fileSize)}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <UserCircleIcon className="h-3 w-3" /> 
                                        {doc.uploader?.firstName}
                                      </span>
                                      <span>•</span>
                                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => toast.error("Backend download endpoint not implemented.")}
                                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-full transition-colors"
                                  title="Download"
                                >
                                  <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">Workpaper not found</div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
                  {viewWorkpaper?.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => { setSelectedWorkpaperId(viewWorkpaper!.id); setIsReviewModalOpen(true); }}
                      className="btn-secondary text-sm"
                    >
                      Review
                    </button>
                  )}
                  <button onClick={() => setIsDetailModalOpen(false)} className="btn-primary text-sm">
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ... existing Create, Upload, Review Modals ... */}
      {/* Copy existing modals from previous implementation here (Create, Upload, Review) */}
      {/* Create/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                   <Dialog.Title className="text-lg font-semibold">{editingWorkpaper ? 'Edit Workpaper' : 'New Workpaper'}</Dialog.Title>
                   <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit(handleSaveWorkpaper)} className="space-y-4">
                  {!editingWorkpaper && (
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="useTemplate" {...register('useTemplate')} className="rounded text-primary-600" />
                      <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">Start from Template</label>
                    </div>
                  )}
                  {useTemplate && !editingWorkpaper ? (
                    <div>
                      <label className="label">Select Template</label>
                      <select {...register('templateId')} className="input">
                        <option value="">-- Choose --</option>
                        {templates.map(t => <option key={t.templateId} value={t.templateId}>{t.name} ({t.category})</option>)}
                      </select>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Engagement</label>
                      <select {...register('engagementId', { required: 'Required' })} className="input" disabled={!!editingWorkpaper}>
                        <option value="">Select...</option>
                        {engagements.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                      {errors.engagementId && <span className="text-xs text-red-500">Required</span>}
                    </div>
                    <div>
                      <label className="label">Reference ID</label>
                      <input {...register('reference', { required: 'Required' })} className="input" placeholder="e.g. WP-100" />
                      {errors.reference && <span className="text-xs text-red-500">Required</span>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Title</label>
                    <input {...register('title', { required: 'Required' })} className="input" placeholder="e.g. Cash Lead Sheet" />
                    {errors.title && <span className="text-xs text-red-500">Required</span>}
                  </div>
                  {editingWorkpaper && (
                    <div>
                      <label className="label">Status</label>
                      <select {...register('status')} className="input">
                          {['DRAFT', 'IN_PROGRESS', 'REVIEWED', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  {!useTemplate && (
                    <div>
                      <label className="label">Description</label>
                      <textarea {...register('description')} className="input" rows={3} />
                    </div>
                  )}
                  {!editingWorkpaper && (
                    <div>
                       <label className="label flex items-center gap-2"><PaperClipIcon className="h-4 w-4" /> Attach Document (Optional)</label>
                       <input type="file" {...register('file')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Upload Modal */}
      <Transition appear show={isUploadModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsUploadModalOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2"><DocumentArrowUpIcon className="h-6 w-6 text-primary-600" /> Upload Document</Dialog.Title>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <input type="file" ref={fileInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Upload</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Review Modal */}
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsReviewModalOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2"><DocumentCheckIcon className="h-6 w-6 text-green-600" /> Review Workpaper</Dialog.Title>
                <form onSubmit={handleSubmit(handleReview)} className="space-y-4">
                  <div>
                    <label className="label">Review Notes</label>
                    <textarea {...register('reviewNotes')} className="input" rows={3} placeholder="Add notes..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-success">Approve</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Workpapers;