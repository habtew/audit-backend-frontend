import React, { useEffect, useState, Fragment, useRef } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowUpIcon, 
  DocumentCheckIcon, 
  FolderIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import { Engagement, Workpaper, WorkpaperTemplate } from '../types';

const Workpapers: React.FC = () => {
  // --- State ---
  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [templates, setTemplates] = useState<WorkpaperTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [engagementFilter, setEngagementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [editingWorkpaper, setEditingWorkpaper] = useState<Workpaper | null>(null);
  const [selectedWorkpaperId, setSelectedWorkpaperId] = useState<string | null>(null);
  
  // File Upload Ref
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
        apiClient.getEngagements()
      ]);

      // --- ROBUST EXTRACTION LOGIC ---
      // This ensures we always get an array, regardless of API wrapper shape
      const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.workpapers && Array.isArray(res.workpapers)) return res.workpapers;
        // Handle nested data structure like { data: { workpapers: [...] } }
        if (res.data?.workpapers && Array.isArray(res.data.workpapers)) return res.data.workpapers;
        return [];
      };

      setWorkpapers(extractArray(wpResponse));
      setEngagements(extractArray(engResponse));
    } catch (error) {
      console.error('Data fetch error:', error);
      toast.error('Failed to load workpapers');
      setWorkpapers([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res: any = await apiClient.getWorkpaperTemplates();
      // Robust extraction for templates too
      const templatesData = Array.isArray(res) ? res : (res?.data || []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Template fetch error:', error);
    }
  };

  // --- Handlers ---
  const handleSaveWorkpaper = async (data: any) => {
    try {
      if (editingWorkpaper) {
        await apiClient.updateWorkpaper(editingWorkpaper.id, {
          title: data.title,
          description: data.description,
          status: data.status
        });
        toast.success('Workpaper updated');
      } else {
        if (data.useTemplate && data.templateId) {
          await apiClient.createWorkpaperFromTemplate(data.templateId, {
            engagementId: data.engagementId,
            reference: data.reference,
            title: data.title
          });
        } else {
          await apiClient.createWorkpaper({
            engagementId: data.engagementId,
            reference: data.reference,
            title: data.title,
            description: data.description,
            content: {} 
          });
        }
        toast.success('Workpaper created');
      }
      fetchData();
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workpaper?')) return;
    try {
      await apiClient.deleteWorkpaper(id);
      toast.success('Deleted successfully');
      setWorkpapers(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkpaperId || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      const toastId = toast.loading('Uploading document...');
      await apiClient.uploadWorkpaperDocument(selectedWorkpaperId, file);
      toast.dismiss(toastId);
      toast.success('Document uploaded successfully');
      setIsUploadModalOpen(false);
      setSelectedWorkpaperId(null);
    } catch (error) {
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

  // --- Modal Controls ---
  const openCreateModal = () => {
    setEditingWorkpaper(null);
    reset({ status: 'NOT_STARTED', useTemplate: false });
    setIsModalOpen(true);
  };

  const openEditModal = (wp: Workpaper) => {
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

  const openUploadModal = (id: string) => {
    setSelectedWorkpaperId(id);
    setIsUploadModalOpen(true);
  };

  const openReviewModal = (id: string) => {
    setSelectedWorkpaperId(id);
    reset({ reviewNotes: '' });
    setIsReviewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorkpaper(null);
    reset();
  };

  // --- Filters & Rendering Helpers ---
  const getEngagementName = (id: string) => {
    // Ensure engagements is an array before searching
    const safeEngagements = Array.isArray(engagements) ? engagements : [];
    return safeEngagements.find(e => e.id === id)?.title || id;
  };

  // SAFE Filtering: Ensure workpapers is an array
  const safeWorkpapers = Array.isArray(workpapers) ? workpapers : [];

  const filteredWorkpapers = safeWorkpapers.filter(wp => {
    const matchesSearch = 
      (wp.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (wp.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEng = !engagementFilter || wp.engagementId === engagementFilter;
    const matchesStatus = !statusFilter || wp.status === statusFilter;
    return matchesSearch && matchesEng && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'REVIEWED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IN_PROGRESS': return 'badge-primary';
      default: return 'badge-gray';
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workpapers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage audit documentation, lead sheets, and reconciliations.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary mt-4 sm:mt-0">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Workpaper
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search title or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={engagementFilter}
          onChange={(e) => setEngagementFilter(e.target.value)}
          className="input w-full"
        >
          <option value="">All Engagements</option>
          {Array.isArray(engagements) && engagements.map(e => (
            <option key={e.id} value={e.id}>{e.title || e.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full"
        >
          <option value="">All Statuses</option>
          {['NOT_STARTED', 'IN_PROGRESS', 'REVIEWED', 'COMPLETED'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filteredWorkpapers.length === 0 ? (
        <EmptyState
          title="No workpapers found"
          description="Start by creating a new workpaper for an engagement."
          actionLabel="New Workpaper"
          onAction={openCreateModal}
          icon={FolderIcon}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkpapers.map((wp) => (
            <div key={wp.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {wp.reference}
                    </span>
                    <h3 className="font-semibold text-gray-900">{wp.title}</h3>
                    <span className={`badge ${getStatusColor(wp.status)} text-xs`}>
                      {wp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{wp.description || 'No description'}</p>
                  <div className="flex items-center text-xs text-gray-400 gap-4">
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="h-3 w-3" />
                      {getEngagementName(wp.engagementId)}
                    </span>
                    <span>Updated: {wp.updatedAt ? new Date(wp.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button 
                    onClick={() => openUploadModal(wp.id)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                    title="Upload Document"
                  >
                    <DocumentArrowUpIcon className="h-5 w-5" />
                  </button>
                  
                  {wp.status !== 'REVIEWED' && wp.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => openReviewModal(wp.id)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                      title="Mark Reviewed"
                    >
                      <DocumentCheckIcon className="h-5 w-5" />
                    </button>
                  )}

                  <button 
                    onClick={() => openEditModal(wp)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(wp.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  {editingWorkpaper ? 'Edit Workpaper' : 'New Workpaper'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit(handleSaveWorkpaper)} className="space-y-4">
                  {/* Template Toggle (Only on Create) */}
                  {!editingWorkpaper && (
                    <div className="flex items-center gap-2 mb-4">
                      <input 
                        type="checkbox" 
                        id="useTemplate"
                        {...register('useTemplate')} 
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">
                        Start from Template
                      </label>
                    </div>
                  )}

                  {useTemplate && !editingWorkpaper ? (
                    <div>
                      <label className="label">Select Template</label>
                      <select {...register('templateId')} className="input">
                        <option value="">-- Choose --</option>
                        {templates.map(t => (
                          <option key={t.templateId} value={t.templateId}>{t.name} ({t.category})</option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Engagement</label>
                      <select 
                        {...register('engagementId', { required: 'Required' })} 
                        className="input"
                        disabled={!!editingWorkpaper}
                      >
                        <option value="">Select...</option>
                        {Array.isArray(engagements) && engagements.map(e => (
                          <option key={e.id} value={e.id}>{e.title || e.name}</option>
                        ))}
                      </select>
                      {errors.engagementId && <span className="text-xs text-red-500">Required</span>}
                    </div>
                    <div>
                      <label className="label">Reference ID</label>
                      <input 
                        {...register('reference', { required: 'Required' })} 
                        className="input" 
                        placeholder="e.g. MP-100"
                      />
                      {errors.reference && <span className="text-xs text-red-500">Required</span>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Title</label>
                    <input 
                      {...register('title', { required: 'Required' })} 
                      className="input" 
                      placeholder="e.g. Cash Lead Sheet"
                    />
                    {errors.title && <span className="text-xs text-red-500">Required</span>}
                  </div>

                  {!useTemplate && (
                    <div>
                      <label className="label">Description</label>
                      <textarea 
                        {...register('description')} 
                        className="input" 
                        rows={3}
                      />
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
                <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DocumentArrowUpIcon className="h-6 w-6 text-primary-600" />
                  Upload Document
                </Dialog.Title>
                <p className="text-sm text-gray-500 mb-4">
                  Select a PDF file to attach to this workpaper.
                </p>
                
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".pdf"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsUploadModalOpen(false)} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">Upload PDF</button>
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
                <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DocumentCheckIcon className="h-6 w-6 text-green-600" />
                  Review Workpaper
                </Dialog.Title>
                
                <form onSubmit={handleSubmit(handleReview)} className="space-y-4">
                  <div>
                    <label className="label">Review Notes</label>
                    <textarea 
                      {...register('reviewNotes')} 
                      className="input" 
                      rows={3} 
                      placeholder="Add any notes or approval comments..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsReviewModalOpen(false)} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-success">
                      Approve & Mark Reviewed
                    </button>
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