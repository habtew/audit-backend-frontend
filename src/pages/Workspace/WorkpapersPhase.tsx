// src/pages/Workspace/WorkpapersPhase.tsx

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import {
  CheckBadgeIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import RoleGuard from '../../components/Auth/RoleGuard';

type TestingTableRow = {
  item: string;
  amount: number;
  source?: string;
  type?: string;
};

type WorkpaperContent = {
  results: string;
  conclusion: string;
  testingTable: TestingTableRow[];
};

type WorkpaperDocument = {
  id: string;
  name: string;
  filePath: string;
  description?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt?: string;
};

type Workpaper = {
  id: string;
  engagementId: string;
  reference: string;
  title: string;
  description?: string;
  status: string;
  version?: number;
  content?: WorkpaperContent;
  documents?: WorkpaperDocument[];
  engagement?: {
    id?: string;
    name?: string;
  };
  preparer?: {
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    documents?: number;
  };
};

const DEFAULT_CONTENT: WorkpaperContent = {
  results: '',
  conclusion: '',
  testingTable: [],
};

const extractErrorMessage = (error: any): string => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;

  if (typeof data?.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data?.message)) {
    return data.message.join(', ');
  }

  if (typeof data?.message === 'object' && data?.message !== null) {
    return JSON.stringify(data.message);
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return 'Something went wrong';
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    return envUrl.replace('/api', '');
  }

  return 'http://localhost:3000';
};

const WorkpapersPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeWp, setActiveWp] = useState<Workpaper | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    reference: '',
    description: '',
    templateId: '',
  });

  const [wpContent, setWpContent] =
    useState<WorkpaperContent>(DEFAULT_CONTENT);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDesc, setUploadDesc] = useState('');

  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);

  const activeDocuments = useMemo(() => {
    return activeWp?.documents || [];
  }, [activeWp]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [wpRes, templateRes] = await Promise.all([
        apiClient.getWorkpapers(),
        apiClient.getWorkpaperTemplates(),
      ]);

      const wpData =
        wpRes?.data?.data?.workpapers ||
        wpRes?.data?.workpapers ||
        [];

      const filtered = Array.isArray(wpData)
        ? wpData.filter(
            (wp: Workpaper) =>
              wp.engagementId === engagement.id
          )
        : [];

      setWorkpapers(filtered);

      const templateData =
        templateRes?.data?.data ||
        templateRes?.data ||
        [];

      setTemplates(
        Array.isArray(templateData)
          ? templateData
          : []
      );
    } catch (error) {
      console.error(error);
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadWorkpaperDetails = async (
    wpId: string
  ) => {
    try {
      setActionLoading(true);

      const res =
        await apiClient.getWorkpaperById(wpId);

      const wp =
        res?.data?.data || res?.data;

      setActiveWp(wp);

      setWpContent({
        results:
          wp?.content?.results || '',
        conclusion:
          wp?.content?.conclusion || '',
        testingTable: Array.isArray(
          wp?.content?.testingTable
        )
          ? wp.content.testingTable
          : [],
      });
    } catch (error) {
      console.error(error);
      toast.error(extractErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [engagement.id]);

  const handleCreateWP = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setActionLoading(true);

      await apiClient.createWorkpaper({
        engagementId: engagement.id,
        title: createForm.title,
        reference: createForm.reference,
        description: createForm.description,
      });

      toast.success(
        'Workpaper created successfully'
      );

      setCreateForm({
        title: '',
        reference: '',
        description: '',
        templateId: '',
      });

      setIsCreateModalOpen(false);

      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(extractErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateContent =
    async () => {
      if (!activeWp) return;

      try {
        setActionLoading(true);

        await apiClient.updateWorkpaper(
          activeWp.id,
          {
            status:
              activeWp.status ===
              'DRAFT'
                ? 'IN_PROGRESS'
                : activeWp.status,
            content: {
              results:
                wpContent.results,
              conclusion:
                wpContent.conclusion,
              testingTable:
                wpContent.testingTable,
            },
          }
        );

        toast.success(
          'Workpaper updated successfully'
        );

        await loadWorkpaperDetails(
          activeWp.id
        );

        await fetchData();
      } catch (error) {
        console.error(error);
        toast.error(
          extractErrorMessage(error)
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleDeleteWP = async (
    wpId: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this workpaper?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await apiClient.deleteWorkpaper(
        wpId
      );

      toast.success(
        'Workpaper deleted successfully'
      );

      if (activeWp?.id === wpId) {
        setActiveWp(null);
        setWpContent(DEFAULT_CONTENT);
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        extractErrorMessage(error)
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadDocument = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!activeWp || !uploadFile) {
      toast.error(
        'Please select a file'
      );
      return;
    }

    try {
      setActionLoading(true);

      const formData = new FormData();

      formData.append(
        'file',
        uploadFile
      );

      formData.append(
        'description',
        uploadDesc ||
          uploadFile.name
      );

      await apiClient.uploadWorkpaperDocument(
        activeWp.id,
        formData
      );

      toast.success(
        'Document uploaded successfully'
      );

      setUploadFile(null);
      setUploadDesc('');

      const fileInput =
        document.getElementById(
          'workpaper-file-input'
        ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = '';
      }

      await loadWorkpaperDetails(
        activeWp.id
      );

      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        extractErrorMessage(error)
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewWP =
    async () => {
      if (!activeWp) return;

      try {
        setActionLoading(true);

        await apiClient.reviewWorkpaper(
          activeWp.id
        );

        toast.success(
          'Workpaper reviewed successfully'
        );

        await loadWorkpaperDetails(
          activeWp.id
        );

        await fetchData();
      } catch (error) {
        console.error(error);
        toast.error(
          extractErrorMessage(error)
        );
      } finally {
        setActionLoading(false);
      }
    };

  const addTableRow = () => {
    setWpContent((prev) => ({
      ...prev,
      testingTable: [
        ...prev.testingTable,
        {
          item: '',
          amount: 0,
          source: '',
          type: '',
        },
      ],
    }));
  };

  const removeTableRow = (
    index: number
  ) => {
    setWpContent((prev) => ({
      ...prev,
      testingTable:
        prev.testingTable.filter(
          (_, rowIndex) =>
            rowIndex !== index
        ),
    }));
  };

  const updateTableRow = (
    index: number,
    field: keyof TestingTableRow,
    value: any
  ) => {
    setWpContent((prev) => ({
      ...prev,
      testingTable:
        prev.testingTable.map(
          (row, rowIndex) => {
            if (
              rowIndex !== index
            )
              return row;

            return {
              ...row,
              [field]:
                field ===
                'amount'
                  ? Number(value)
                  : value,
            };
          }
        ),
    }));
  };

  const openPdfViewer = (
    filePath: string
  ) => {
    if (!filePath) {
      toast.error(
        'Invalid document path'
      );
      return;
    }

    const cleanPath =
      filePath.startsWith('/')
        ? filePath.slice(1)
        : filePath;

    const fullUrl = `${getBaseUrl()}/api/${cleanPath}`;

    setPdfViewerUrl(fullUrl);
  };

  const getStatusBadge = (
    status: string
  ) => {
    switch (status) {
      case 'REVIEWED':
        return (
          <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold uppercase text-green-800">
            Reviewed
          </span>
        );

      case 'IN_PROGRESS':
        return (
          <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-800">
            In Progress
          </span>
        );

      default:
        return (
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-700">
            Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
      <div className="flex min-h-[75vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      
      {/* LEFT PANE: List of Workpapers */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Workpapers</h2>
          <RoleGuard minRole="SENIOR">
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors" title="New Workpaper">
              <PlusIcon className="w-5 h-5" />
            </button>
          </RoleGuard>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {workpapers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No workpapers found. Create one to begin documentation.</p>
          ) : (
            workpapers.map(wp => (
              <div 
                key={wp.id} 
                onClick={() => loadWorkpaperDetails(wp.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${activeWp?.id === wp.id ? 'bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{wp.reference}</span>
                  {getStatusBadge(wp.status)}
                </div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{wp.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{wp.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE: Workpaper Details & Editor */}
      <div className="w-2/3 flex flex-col bg-white overflow-hidden relative">
        {!activeWp ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <DocumentTextIcon className="w-20 h-20 mb-4 text-slate-200" />
            <h3 className="text-xl font-bold text-slate-600">Select a Workpaper</h3>
            <p className="text-sm mt-2 max-w-sm">Choose a workpaper from the list to view its details, update the testing tables, and attach evidence.</p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-slate-200 bg-white shrink-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{activeWp.reference}</span>
                    {getStatusBadge(activeWp.status)}
                    <span className="text-xs text-slate-500 font-medium ml-2">Version {activeWp.version || 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{activeWp.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{activeWp.description}</p>
                </div>
                <div className="flex space-x-2">
                  <RoleGuard minRole="MANAGER">
                    {activeWp.status !== 'REVIEWED' && (
                      <button onClick={handleReviewWP} disabled={actionLoading} className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                        <CheckBadgeIcon className="w-4 h-4 mr-1.5" /> Sign Off
                      </button>
                    )}
                  </RoleGuard>
                  <button onClick={() => handleDeleteWP(activeWp.id)} disabled={actionLoading} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
              
              {/* Content Editor */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-800">Documentation & Results</h3>
                  <button onClick={handleUpdateContent} disabled={actionLoading || activeWp.status === 'REVIEWED'} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    Save Progress
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Testing Results & Methodology</label>
                  <textarea 
                    disabled={activeWp.status === 'REVIEWED'}
                    className="w-full border-slate-300 rounded-lg shadow-sm text-sm disabled:bg-slate-50" rows={4}
                    value={wpContent.results} onChange={e => setWpContent({...wpContent, results: e.target.value})}
                    placeholder="Describe how the test was performed..."
                  />
                </div>

                {/* Dynamic Testing Table Builder */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Substantive Testing Table</span>
                    <button onClick={addTableRow} disabled={activeWp.status === 'REVIEWED'} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center disabled:opacity-50">
                      <PlusIcon className="w-3 h-3 mr-1" /> Add Row
                    </button>
                  </div>
                  <table className="min-w-full divide-y divide-slate-200 bg-white">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Description / Item</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Source / Type</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wpContent.testingTable.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-4 text-center text-xs text-slate-400">No data points added.</td></tr>
                      )}
                      {wpContent.testingTable.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2"><input disabled={activeWp.status === 'REVIEWED'} type="text" className="w-full text-sm border-slate-300 rounded" value={row.item} onChange={e => updateTableRow(idx, 'item', e.target.value)} placeholder="e.g. Ledger Balance" /></td>
                          <td className="px-4 py-2"><input disabled={activeWp.status === 'REVIEWED'} type="number" className="w-full text-sm border-slate-300 rounded font-mono" value={row.amount} onChange={e => updateTableRow(idx, 'amount', Number(e.target.value))} /></td>
                          <td className="px-4 py-2"><input disabled={activeWp.status === 'REVIEWED'} type="text" className="w-full text-sm border-slate-300 rounded" value={row.source || row.type} onChange={e => updateTableRow(idx, row.source !== undefined ? 'source' : 'type', e.target.value)} placeholder="e.g. TB or Finding" /></td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => removeTableRow(idx)} disabled={activeWp.status === 'REVIEWED'} className="text-red-400 hover:text-red-600 disabled:opacity-50"><TrashIcon className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Final Conclusion</label>
                  <textarea 
                    disabled={activeWp.status === 'REVIEWED'}
                    className="w-full border-slate-300 rounded-lg shadow-sm text-sm font-medium disabled:bg-slate-50" rows={2}
                    value={wpContent.conclusion} onChange={e => setWpContent({...wpContent, conclusion: e.target.value})}
                    placeholder="e.g. Exceptions Noted..."
                  />
                </div>
              </div>

              {/* Evidence / Documents Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Supporting Evidence</h3>
                
                {activeWp.status !== 'REVIEWED' && (
                  <form onSubmit={handleUploadDocument} className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-900 mb-1">Select File (PDF)</label>
                      <input required type="file" accept=".pdf" className="w-full text-sm text-slate-600 bg-white border border-slate-300 rounded-lg px-3 py-1.5" onChange={e => { if(e.target.files) setUploadFile(e.target.files[0]) }} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-900 mb-1">Description</label>
                      <input required type="text" className="w-full text-sm border-slate-300 rounded-lg shadow-sm py-1.5" value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="e.g. Q4 Bank Statement" />
                    </div>
                    <button type="submit" disabled={actionLoading || !uploadFile} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                      <DocumentArrowUpIcon className="w-4 h-4 mr-2" /> Upload
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {(!activeWp.documents || activeWp.documents.length === 0) ? (
                    <p className="text-sm text-slate-500 italic">No supporting evidence attached to this workpaper yet.</p>
                  ) : (
                    activeWp.documents.map((doc: any) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-6 h-6 text-red-500 mr-3" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{doc.description}</p>
                            <p className="text-xs text-slate-500">{doc.name} • {(doc.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => openPdfViewer(doc.filePath)}
                          className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-1.5" /> View PDF
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* ========================================== */}
      {/* PDF VIEWER MODAL */}
      {/* ========================================== */}
      <Transition appear show={!!pdfViewerUrl} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setPdfViewerUrl(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-5xl h-[85vh] transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col">
                  <div className="bg-slate-800 p-4 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center"><DocumentTextIcon className="w-5 h-5 mr-2"/> Evidence Viewer</h3>
                    <button onClick={() => setPdfViewerUrl(null)} className="text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 p-1.5 rounded-lg transition-colors">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 bg-slate-100 w-full h-full">
                    {pdfViewerUrl && (
                      <iframe src={pdfViewerUrl} className="w-full h-full border-0" title="PDF Viewer" />
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ========================================== */}
      {/* CREATE WORKPAPER MODAL */}
      {/* ========================================== */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">Create New Workpaper</Dialog.Title>
                  <form onSubmit={handleCreateWP} className="space-y-4">
                    
                    {templates.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Start from Template (Optional)</label>
                        <select className="w-full border-slate-300 rounded-lg shadow-sm" value={createForm.templateId} onChange={e => {
                          const tId = e.target.value;
                          const selectedTpl = templates.find(t => t.id === tId);
                          if (selectedTpl) {
                            setCreateForm({ ...createForm, templateId: tId, title: selectedTpl.name, description: selectedTpl.description });
                          } else {
                            setCreateForm({ ...createForm, templateId: '' });
                          }
                        }}>
                          <option value="">-- Blank Workpaper --</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
                        </select>
                      </div>
                    )}

                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Reference Number *</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" placeholder="e.g. WP-A-100" value={createForm.reference} onChange={e => setCreateForm({...createForm, reference: e.target.value})} /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Title *</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Description / Objective</label><textarea required rows={3} className="w-full border-slate-300 rounded-lg shadow-sm" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} /></div>
                    
                    <div className="mt-6 flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                        <DocumentDuplicateIcon className="w-4 h-4 mr-2"/> Create WP
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

export default WorkpapersPhase;