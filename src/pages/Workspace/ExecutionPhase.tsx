// // src/pages/Workspace/ExecutionPhase.tsx
// import React, { useState, useEffect, Fragment } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { Dialog, Transition } from '@headlessui/react';
// import { 
//   ChartPieIcon, ClipboardDocumentListIcon, SparklesIcon, 
//   CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, 
//   BeakerIcon, ClipboardDocumentCheckIcon // Fixed Import Here
// } from '@heroicons/react/24/outline';
// import { Engagement } from '../../types';
// import apiClient from '../../utils/api';
// import RoleGuard from '../../components/Auth/RoleGuard';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// const TABS = [
//   { id: 'dashboard', label: 'Execution Dashboard', icon: ChartPieIcon },
//   { id: 'procedures', label: 'Audit Procedures', icon: ClipboardDocumentListIcon }
// ];

// const ExecutionPhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   // Data States
//   const [dashboard, setDashboard] = useState<any>(null);
//   const [procedures, setProcedures] = useState<any[]>([]);

//   // Modal States
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProc, setSelectedProc] = useState<any>(null);
//   const [activeProcTab, setActiveProcTab] = useState<'EXECUTE' | 'EXCEPTIONS' | 'REVIEW'>('EXECUTE');

//   // Form States
//   const [evidenceForm, setEvidenceForm] = useState({ auditorResponse: '', evidenceType: 'INVOICE', file: null as File | null });
//   const [exceptionForm, setExceptionForm] = useState({ description: '', financialImpact: 0 });
//   const [reviewForm, setReviewForm] = useState({ isApproved: true, reviewNote: '' });

//   // Safe Error Handler
// const handleError = (error: any) => {
//   console.error('Caught Error:', error);

//   const responseData = error?.response?.data;

//   let errorMessage = 'Something went wrong';

//   // Case 1: message is string
//   if (typeof responseData?.message === 'string') {
//     errorMessage = responseData.message;
//   }

//   // Case 2: validation errors array
//   else if (Array.isArray(responseData?.message)) {
//     errorMessage = responseData.message.join(', ');
//   }

//   // Case 3: nested object
//   else if (
//     responseData?.message &&
//     typeof responseData.message === 'object'
//   ) {
//     errorMessage =
//       responseData.message.message ||
//       responseData.message.error ||
//       JSON.stringify(responseData.message);
//   }

//   // Fallbacks
//   else if (responseData?.error) {
//     errorMessage = responseData.error;
//   } else if (error?.message) {
//     errorMessage = error.message;
//   }

//   toast.error(errorMessage);
// };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [dashRes, procRes] = await Promise.all([
//         apiClient.getExecutionDashboard(engagement.id),
//         apiClient.getProcedures(engagement.id)
//       ]);
      
//       // Safely unwrap the backend JSON nesting to prevent React crashes
//       const dData = dashRes.data?.data || dashRes.data;
//       const pData = procRes.data?.data || procRes.data;
      
//       setDashboard(dData || null);
//       setProcedures(Array.isArray(pData) ? pData : []);
//     } catch (error) {
//       console.error("Failed to fetch execution data", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, [engagement.id]);

//   // --- 1. Global Handlers ---
//   const handleGenerateProcedures = async () => {
//     setActionLoading(true);
//     const toastId = toast.loading('AI generating tailored audit procedures...');
//     try {
//       const res: any = await apiClient.generateProcedures(engagement.id);
//       const msg = res.data?.message || res.message || 'Procedures generated!';
//       toast.success(msg, { id: toastId });
//       fetchData();
//       setActiveTab('procedures');
//     } catch (e) { handleError(e, 'Failed to generate procedures'); toast.dismiss(toastId); } 
//     finally { setActionLoading(false); }
//   };

//   // --- 2. Procedure Modal Handlers ---
//   const openProcedure = async (procId: string) => {
//     setActionLoading(true);
//     try {
//       const res: any = await apiClient.getProcedureById(procId);
//       const procData = res.data?.data || res.data; // Safe Unwrap
      
//       setSelectedProc(procData);
//       setEvidenceForm({ auditorResponse: procData.auditorResponse || '', evidenceType: 'INVOICE', file: null });
//       setActiveProcTab(procData.status === 'PREPARED' ? 'REVIEW' : 'EXECUTE');
//       setIsModalOpen(true);
//     } catch (e) { handleError(e, 'Failed to load procedure details'); } 
//     finally { setActionLoading(false); }
//   };

//   const handleSubmitEvidence = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedProc) return;
//     if (!evidenceForm.file) return toast.error('Evidence file is required.');

//     setActionLoading(true);
//     const toastId = toast.loading('Uploading evidence and submitting procedure...');
//     try {
//       const formData = new FormData();
//       formData.append('file', evidenceForm.file);
//       formData.append('evidenceType', evidenceForm.evidenceType);
//       formData.append('auditorResponse', evidenceForm.auditorResponse);

//       await apiClient.submitProcedureEvidence(selectedProc.id, formData);
//       toast.success('Procedure submitted for review!', { id: toastId });
//       setIsModalOpen(false);
//       fetchData();
//     } catch (e) { handleError(e, 'Failed to submit evidence'); toast.dismiss(toastId); } 
//     finally { setActionLoading(false); }
//   };

//   const handleLogException = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedProc) return;
//     setActionLoading(true);
//     try {
//       await apiClient.logException(selectedProc.id, { description: exceptionForm.description });
//       toast.success('Exception logged successfully.');
//       setExceptionForm({ description: '', financialImpact: 0 });
//       openProcedure(selectedProc.id); // Refresh modal data
//     } catch (e) { handleError(e, 'Failed to log exception'); } 
//     finally { setActionLoading(false); }
//   };

//   // const handleReviewProcedure = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (!selectedProc) return;
//   //   setActionLoading(true);
//   //   try {
//   //     await apiClient.reviewProcedure(selectedProc.id, {
//   //       isApproved: reviewForm.isApproved,
//   //       reviewNote: reviewForm.reviewNote
//   //     });
//   //     toast.success(reviewForm.isApproved ? 'Procedure Approved!' : 'Procedure Rejected.');
//   //     setIsModalOpen(false);
//   //     fetchData();
//   //   } catch (e) { handleError(e, 'Failed to submit review'); } 
//   //   finally { setActionLoading(false); }
//   // };


//   const handleReviewProcedure = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!selectedProc) return;

//   setActionLoading(true);

//   try {
//     let payload: any;

//     // APPROVE
//     if (reviewForm.isApproved) {
//       payload = {
//         isApproved: true
//       };
//     }

//     // REJECT
//     else {
//       payload = {
//         isApproved: false,
//         reviewNote: reviewForm.reviewNote
//       };
//     }

//     console.log('Review Payload:', payload);

//     await apiClient.reviewProcedure(selectedProc.id, payload);

//     toast.success(
//       reviewForm.isApproved
//         ? 'Procedure Approved!'
//         : 'Procedure Rejected.'
//     );

//     setIsModalOpen(false);

//     fetchData();

//   } catch (e: any) {
//     console.log('Backend Error:', e?.response?.data);

//     handleError(e, 'Failed to submit review');

//   } finally {
//     setActionLoading(false);
//   }
// };

//   // --- UI Helpers ---
//   const getStatusBadge = (status: string) => {
//     switch(status) {
//       case 'REVIEWED': return <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] uppercase font-bold rounded-full">Reviewed</span>;
//       case 'PREPARED': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-full">Pending Review</span>;
//       case 'IN_PROGRESS': return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded-full">In Progress</span>;
//       default: return <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] uppercase font-bold rounded-full">Not Started</span>;
//     }
//   };

//   if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
//       {/* Header & Tabs */}
//       <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
//         <div className="p-6 pb-0">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Execution & Fieldwork</h2>
//               <p className="text-slate-500 mt-1">Perform procedures, upload evidence, and review audit work.</p>
//             </div>
            
//             {/* Action Button */}
//             <button 
//               onClick={handleGenerateProcedures} 
//               disabled={actionLoading}
//               className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70"
//             >
//               <SparklesIcon className="w-5 h-5 mr-2" />
//               Auto-Generate Procedures
//             </button>
//           </div>
          
//           <nav className="flex space-x-2 overflow-x-auto">
//             {TABS.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors ${
//                   activeTab === tab.id 
//                     ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-[0_4px_0_0_#fff]' 
//                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
//                 }`}
//               >
//                 <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
        
//         {/* ========================================== */}
//         {/* TAB 1: DASHBOARD */}
//         {/* ========================================== */}
//         {activeTab === 'dashboard' && dashboard ? (
//           <div className="space-y-6 animate-fade-in">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Overall Progress</p>
//                 <div className="flex items-end mt-2"><span className="text-4xl font-black text-indigo-600">{dashboard.progress?.completionPercentage || 0}%</span></div>
//                 <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
//                   <div className="bg-indigo-600 h-full rounded-full" style={{width: `${dashboard.progress?.completionPercentage || 0}%`}}></div>
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Pipeline</p>
//                 <div className="mt-3 space-y-2">
//                   <p className="text-sm font-bold text-slate-700 flex justify-between"><span>Not Started:</span> <span>{dashboard.progress?.notStarted || 0}</span></p>
//                   <p className="text-sm font-bold text-blue-600 flex justify-between"><span>Pending Review:</span> <span>{dashboard.progress?.prepared || 0}</span></p>
//                   <p className="text-sm font-bold text-green-600 flex justify-between"><span>Reviewed:</span> <span>{dashboard.progress?.reviewed || 0}</span></p>
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
//                 <p className="text-xs font-bold text-red-500 uppercase">Exceptions Found</p>
//                 <p className="text-4xl font-black text-red-600 mt-2">{dashboard.exceptionSummary?.totalExceptionsFound || 0}</p>
//                 <p className="text-xs font-bold text-red-500 mt-2">{dashboard.exceptionSummary?.unresolvedExceptions || 0} Unresolved</p>
//               </div>
//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Financial Impact</p>
//                 <p className="text-3xl font-black text-slate-800 mt-2">${(dashboard.exceptionSummary?.aggregateFinancialImpact || 0).toLocaleString()}</p>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
//               <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Statement Assertion Coverage</h3>
//               {Object.keys(dashboard.assertionMatrix || {}).length === 0 ? (
//                 <p className="text-slate-500 text-sm">No procedures mapped to assertions yet.</p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
//                     <thead className="bg-slate-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Account Area</th>
//                         <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Coverage Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-200">
//                       {Object.entries(dashboard.assertionMatrix || {}).map(([account, assertions]: any) => (
//                         <tr key={account}>
//                           <td className="px-4 py-3 text-sm font-bold text-slate-800">{account}</td>
//                           <td className="px-4 py-3 text-sm flex flex-wrap gap-2">
//                             {Object.entries(assertions).map(([assertion, isCovered]: any) => (
//                               <span key={assertion} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isCovered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                 {assertion}: {isCovered ? 'Covered' : 'Gaps'}
//                               </span>
//                             ))}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : activeTab === 'dashboard' && (
//           <div className="text-center py-12 text-slate-500">Dashboard data is loading or unavailable.</div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 2: PROCEDURES LIST */}
//         {/* ========================================== */}
//         {activeTab === 'procedures' && (
//           <div className="animate-fade-in space-y-4">
//             {procedures.length === 0 ? (
//               <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
//                 <BeakerIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-bold text-slate-700">No procedures exist</h3>
//                 <p className="text-slate-500 text-sm mt-1">Click the "Auto-Generate Procedures" button above to populate the audit program.</p>
//               </div>
//             ) : (
//               procedures.map(proc => (
//                 <div 
//                   key={proc.id} 
//                   onClick={() => openProcedure(proc.id)}
//                   className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 hover:border-l-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-4"
//                 >
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-3 mb-2">
//                       <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">{proc.refNumber}</span>
//                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${proc.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
//                         {proc.priority} Priority
//                       </span>
//                       {proc.exceptionsFound && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center"><ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Exception</span>}
//                     </div>
//                     <p className="text-sm font-bold text-slate-800 line-clamp-2">{proc.procedureText}</p>
//                     <p className="text-xs text-slate-500 mt-2 font-medium">Area: {proc.accountArea} | Assertion: {proc.assertion} | Type: {proc.procedureType.replace(/_/g, ' ')}</p>
//                   </div>
//                   <div className="shrink-0 flex items-center md:flex-col md:items-end gap-2">
//                     {getStatusBadge(proc.status)}
//                     {proc.status === 'PREPARED' && <span className="text-xs text-slate-400 font-medium">Awaiting Review</span>}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* ========================================== */}
//       {/* PROCEDURE EXECUTION MODAL */}
//       {/* ========================================== */}
//       <Transition appear show={isModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-50" onClose={() => {}}>
//           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
//             <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                
//                 <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                  
//                   {/* Modal Header */}
//                   <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start shrink-0">
//                     <div>
//                       <div className="flex items-center space-x-3 mb-2">
//                         <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded">{selectedProc?.refNumber}</span>
//                         {getStatusBadge(selectedProc?.status)}
//                       </div>
//                       <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 leading-tight">
//                         {selectedProc?.procedureText}
//                       </Dialog.Title>
//                     </div>
//                     <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
//                       <XCircleIcon className="w-6 h-6" />
//                     </button>
//                   </div>

//                   {/* Modal Nav */}
//                   <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
//                     {['EXECUTE', 'EXCEPTIONS', 'REVIEW'].map(tab => {
//                       if (tab === 'REVIEW' && selectedProc?.status !== 'PREPARED' && selectedProc?.status !== 'REVIEWED') return null;
//                       return (
//                         <button key={tab} onClick={() => setActiveProcTab(tab as any)} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeProcTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
//                           {tab.charAt(0) + tab.slice(1).toLowerCase()}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   {/* Modal Body (Scrollable) */}
//                   <div className="flex-1 overflow-y-auto p-6 bg-white">
                    
//                     {/* EXECUTE TAB */}
//                     {activeProcTab === 'EXECUTE' && (
//                       <form onSubmit={handleSubmitEvidence} className="space-y-6 animate-fade-in">
//                         <div>
//                           <label className="block text-sm font-bold text-slate-700 mb-2">Auditor Conclusion & Results *</label>
//                           <textarea 
//                             required rows={4} 
//                             disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'}
//                             className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 disabled:bg-slate-50"
//                             placeholder="Document the work performed, items tested, and the conclusion reached..."
//                             value={evidenceForm.auditorResponse}
//                             onChange={e => setEvidenceForm({...evidenceForm, auditorResponse: e.target.value})}
//                           />
//                         </div>

//                         <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
//                           <h4 className="text-sm font-bold text-slate-800 mb-4">Attach Substantive Evidence</h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Evidence Type</label>
//                               <select disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={evidenceForm.evidenceType} onChange={e => setEvidenceForm({...evidenceForm, evidenceType: e.target.value})}>
//                                 <option value="BANK_STATEMENT">Bank Statement</option><option value="INVOICE">Invoice</option><option value="CONTRACT">Contract</option><option value="CALCULATION">Recalculation Spreadsheet</option><option value="OTHER">Other</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Upload File</label>
//                               <input type="file" disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" onChange={e => { if(e.target.files) setEvidenceForm({...evidenceForm, file: e.target.files[0]}) }} />
//                             </div>
//                           </div>
                          
//                           {selectedProc?.evidences?.length > 0 && (
//                             <div className="mt-4 pt-4 border-t border-slate-200">
//                               <p className="text-xs font-bold text-slate-500 uppercase mb-2">Attached Files</p>
//                               <div className="space-y-2">
//                                 {selectedProc.evidences.map((ev: any) => (
//                                   <div key={ev.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded">
//                                     <span className="text-sm font-medium text-slate-700 truncate flex-1">{ev.fileName}</span>
//                                     <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{ev.evidenceType}</span>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         {selectedProc?.status !== 'REVIEWED' && selectedProc?.status !== 'PREPARED' && (
//                           <div className="flex justify-end pt-4 border-t border-slate-100">
//                             <button type="submit" disabled={actionLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Submit for Review</button>
//                           </div>
//                         )}
//                       </form>
//                     )}

//                     {/* EXCEPTIONS TAB */}
//                     {activeProcTab === 'EXCEPTIONS' && (
//                       <div className="space-y-6 animate-fade-in">
//                         {selectedProc?.status !== 'REVIEWED' && (
//                           <form onSubmit={handleLogException} className="bg-red-50 border border-red-200 p-5 rounded-xl">
//                             <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2" /> Log a New Exception</h4>
//                             <div className="space-y-3">
//                               <textarea required rows={2} className="w-full border-red-300 rounded-lg shadow-sm focus:ring-red-500" placeholder="Describe the discrepancy..." value={exceptionForm.description} onChange={e => setExceptionForm({...exceptionForm, description: e.target.value})} />
//                               <div className="flex justify-between items-end">
//                                 <button type="submit" disabled={actionLoading} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-sm text-sm">Log Exception</button>
//                               </div>
//                             </div>
//                           </form>
//                         )}
                        
//                         <div>
//                           <h4 className="font-bold text-slate-800 mb-3">Documented Exceptions</h4>
//                           <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-sm font-medium">
//                             {selectedProc?.exceptionsFound ? "Exceptions exist for this procedure. Exception resolution components will render here." : "No exceptions found."}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* REVIEW TAB */}
//                     {activeProcTab === 'REVIEW' && (
//                       <div className="space-y-6 animate-fade-in">
//                         <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
//                           <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
//                             <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" /> Manager Review
//                           </h4>
//                           {selectedProc?.status === 'REVIEWED' ? (
//                             <div className="bg-white p-4 rounded-lg border border-green-200 text-sm">
//                               <p className="font-bold text-green-800 mb-1"><CheckCircleIcon className="w-5 h-5 inline mr-1"/> Procedure Approved</p>
//                               <p className="text-slate-600 mt-2"><strong>Manager Notes:</strong> {selectedProc.reviewNotes?.[0]?.note || 'No notes provided.'}</p>
//                             </div>
//                           ) : (
//                             <RoleGuard minRole="MANAGER" fallback={<p className="text-sm font-bold text-blue-800">Awaiting Manager Review. You do not have permissions to sign off.</p>}>
//                               <form onSubmit={handleReviewProcedure} className="space-y-4">
//                                 <div>
//                                   <label className="block text-sm font-bold text-blue-900 mb-1">Review Decision</label>
//                                   <select className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 bg-white font-bold text-sm" value={reviewForm.isApproved ? 'approve' : 'reject'} onChange={e => setReviewForm({...reviewForm, isApproved: e.target.value === 'approve'})}>
//                                     <option value="approve">Approve Procedure (Mark as Done)</option>
//                                     <option value="reject">Return with Notes (Needs Work)</option>
//                                   </select>
//                                 </div>
//                                 <div>
//                                   <label className="block text-sm font-bold text-blue-900 mb-1">Review Notes</label>
//                                   <textarea required={!reviewForm.isApproved} rows={3} className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 bg-white" placeholder="Add instructions or sign-off notes..." value={reviewForm.reviewNote} onChange={e => setReviewForm({...reviewForm, reviewNote: e.target.value})} />
//                                 </div>
//                                 <div className="flex justify-end pt-2">
//                                   <button type="submit" disabled={actionLoading} className="bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-800">Submit Review</button>
//                                 </div>
//                               </form>
//                             </RoleGuard>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>

//     </div>
//   );
// };

// export default ExecutionPhase;




// src/pages/Workspace/ExecutionPhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ChartPieIcon, ClipboardDocumentListIcon, SparklesIcon, 
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, 
  BeakerIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TABS = [
  { id: 'dashboard', label: 'Execution Dashboard', icon: ChartPieIcon },
  { id: 'procedures', label: 'Audit Procedures', icon: ClipboardDocumentListIcon }
];

const ExecutionPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [dashboard, setDashboard] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProc, setSelectedProc] = useState<any>(null);
  const [activeProcTab, setActiveProcTab] = useState<'EXECUTE' | 'EXCEPTIONS' | 'REVIEW'>('EXECUTE');

  // Form States
  const [evidenceForm, setEvidenceForm] = useState({ auditorResponse: '', evidenceType: 'INVOICE', file: null as File | null });
  const [exceptionForm, setExceptionForm] = useState({ description: '', financialImpact: 0 });
  const [reviewForm, setReviewForm] = useState({ isApproved: true, reviewNote: '' });

  // Safe Error Handler
  const handleError = (e: any, fallback: string) => {
    const errorObj = e.response?.data;
    let message = fallback;
    if (typeof errorObj === 'string') message = errorObj;
    else if (errorObj?.message) message = Array.isArray(errorObj.message) ? errorObj.message[0] : errorObj.message;
    console.error("Caught Error:", e);
    toast.error(message);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, procRes] = await Promise.all([
        apiClient.getExecutionDashboard(engagement.id),
        apiClient.getProcedures(engagement.id)
      ]);
      
      const dData = dashRes.data?.data || dashRes.data;
      const pData = procRes.data?.data || procRes.data;
      
      setDashboard(dData || null);
      setProcedures(Array.isArray(pData) ? pData : []);
    } catch (error) {
      console.error("Failed to fetch execution data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [engagement.id]);

  // --- 1. Global Handlers ---
  const handleGenerateProcedures = async () => {
    setActionLoading(true);
    const toastId = toast.loading('AI generating tailored audit procedures...');
    try {
      const res: any = await apiClient.generateProcedures(engagement.id);
      const msg = res.data?.message || res.message || 'Procedures generated!';
      toast.success(msg, { id: toastId });
      fetchData();
      setActiveTab('procedures');
    } catch (e) { handleError(e, 'Failed to generate procedures'); toast.dismiss(toastId); } 
    finally { setActionLoading(false); }
  };

  // --- 2. Procedure Modal Handlers ---
  const openProcedure = async (procId: string) => {
    setActionLoading(true);
    try {
      const res: any = await apiClient.getProcedureById(procId);
      const procData = res.data?.data || res.data; // Safe Unwrap
      
      setSelectedProc(procData);
      setEvidenceForm({ auditorResponse: procData.auditorResponse || '', evidenceType: 'INVOICE', file: null });
      setReviewForm({ isApproved: true, reviewNote: '' }); // Reset review form
      setActiveProcTab(procData.status === 'PREPARED' ? 'REVIEW' : 'EXECUTE');
      setIsModalOpen(true);
    } catch (e) { handleError(e, 'Failed to load procedure details'); } 
    finally { setActionLoading(false); }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProc) return;
    if (!evidenceForm.file) return toast.error('Evidence file is required.');

    setActionLoading(true);
    const toastId = toast.loading('Uploading evidence and submitting procedure...');
    try {
      const formData = new FormData();
      formData.append('file', evidenceForm.file);
      formData.append('evidenceType', evidenceForm.evidenceType);
      formData.append('auditorResponse', evidenceForm.auditorResponse);

      await apiClient.submitProcedureEvidence(selectedProc.id, formData);
      toast.success('Procedure submitted for review!', { id: toastId });
      setIsModalOpen(false);
      fetchData();
    } catch (e) { handleError(e, 'Failed to submit evidence'); toast.dismiss(toastId); } 
    finally { setActionLoading(false); }
  };

  const handleLogException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProc) return;
    setActionLoading(true);
    try {
      await apiClient.logException(selectedProc.id, { description: exceptionForm.description });
      toast.success('Exception logged successfully.');
      setExceptionForm({ description: '', financialImpact: 0 });
      openProcedure(selectedProc.id); // Refresh modal data
    } catch (e) { handleError(e, 'Failed to log exception'); } 
    finally { setActionLoading(false); }
  };

  const handleReviewProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProc) return;
    setActionLoading(true);
    try {
      await apiClient.reviewProcedure(selectedProc.id, {
        isApproved: reviewForm.isApproved,
        reviewNote: reviewForm.reviewNote
      });
      toast.success(reviewForm.isApproved ? 'Procedure Approved!' : 'Procedure Rejected.');
      setIsModalOpen(false);
      fetchData();
    } catch (e) { handleError(e, 'Failed to submit review'); } 
    finally { setActionLoading(false); }
  };

  // --- NEW: Resolve Review Note ---
  const handleResolveNote = async (noteId: string) => {
    setActionLoading(true);
    const toastId = toast.loading('Clearing review note...');
    try {
      await apiClient.resolveReviewNote(noteId);
      toast.success('Review note cleared!', { id: toastId });
      openProcedure(selectedProc.id); // Refresh the modal to show it as cleared
    } catch (e) { handleError(e, 'Failed to clear review note'); toast.dismiss(toastId); } 
    finally { setActionLoading(false); }
  };

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'REVIEWED': return <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] uppercase font-bold rounded-full">Reviewed</span>;
      case 'PREPARED': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-full">Pending Review</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded-full">In Progress</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] uppercase font-bold rounded-full">Not Started</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  // Determine if there are any open review notes blocking approval
  const openNotes = selectedProc?.reviewNotes?.filter((n: any) => n.status === 'OPEN') || [];
  const hasOpenNotes = openNotes.length > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Execution & Fieldwork</h2>
              <p className="text-slate-500 mt-1">Perform procedures, upload evidence, and review audit work.</p>
            </div>
            
            <button 
              onClick={handleGenerateProcedures} 
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Auto-Generate Procedures
            </button>
          </div>
          
          <nav className="flex space-x-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-[0_4px_0_0_#fff]' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
        
        {/* ========================================== */}
        {/* TAB 1: DASHBOARD */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && dashboard ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Overall Progress</p>
                <div className="flex items-end mt-2"><span className="text-4xl font-black text-indigo-600">{dashboard.progress?.completionPercentage || 0}%</span></div>
                <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{width: `${dashboard.progress?.completionPercentage || 0}%`}}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Pipeline</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-bold text-slate-700 flex justify-between"><span>Not Started:</span> <span>{dashboard.progress?.notStarted || 0}</span></p>
                  <p className="text-sm font-bold text-blue-600 flex justify-between"><span>Pending Review:</span> <span>{dashboard.progress?.prepared || 0}</span></p>
                  <p className="text-sm font-bold text-green-600 flex justify-between"><span>Reviewed:</span> <span>{dashboard.progress?.reviewed || 0}</span></p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
                <p className="text-xs font-bold text-red-500 uppercase">Exceptions Found</p>
                <p className="text-4xl font-black text-red-600 mt-2">{dashboard.exceptionSummary?.totalExceptionsFound || 0}</p>
                <p className="text-xs font-bold text-red-500 mt-2">{dashboard.exceptionSummary?.unresolvedExceptions || 0} Unresolved</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Financial Impact</p>
                <p className="text-3xl font-black text-slate-800 mt-2">${(dashboard.exceptionSummary?.aggregateFinancialImpact || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Statement Assertion Coverage</h3>
              {Object.keys(dashboard.assertionMatrix || {}).length === 0 ? (
                <p className="text-slate-500 text-sm">No procedures mapped to assertions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Account Area</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Coverage Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(dashboard.assertionMatrix || {}).map(([account, assertions]: any) => (
                        <tr key={account}>
                          <td className="px-4 py-3 text-sm font-bold text-slate-800">{account}</td>
                          <td className="px-4 py-3 text-sm flex flex-wrap gap-2">
                            {Object.entries(assertions).map(([assertion, isCovered]: any) => (
                              <span key={assertion} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isCovered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {assertion}: {isCovered ? 'Covered' : 'Gaps'}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'dashboard' && (
          <div className="text-center py-12 text-slate-500">Dashboard data is loading or unavailable.</div>
        )}

        {/* ========================================== */}
        {/* TAB 2: PROCEDURES LIST */}
        {/* ========================================== */}
        {activeTab === 'procedures' && (
          <div className="animate-fade-in space-y-4">
            {procedures.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                <BeakerIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No procedures exist</h3>
                <p className="text-slate-500 text-sm mt-1">Click the "Auto-Generate Procedures" button above to populate the audit program.</p>
              </div>
            ) : (
              procedures.map(proc => (
                <div 
                  key={proc.id} 
                  onClick={() => openProcedure(proc.id)}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 hover:border-l-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">{proc.refNumber}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${proc.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                        {proc.priority} Priority
                      </span>
                      {proc.exceptionsFound && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center"><ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Exception</span>}
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-2">{proc.procedureText}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Area: {proc.accountArea} | Assertion: {proc.assertion} | Type: {proc.procedureType.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="shrink-0 flex items-center md:flex-col md:items-end gap-2">
                    {getStatusBadge(proc.status)}
                    {proc.status === 'PREPARED' && <span className="text-xs text-slate-400 font-medium">Awaiting Review</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* PROCEDURE EXECUTION MODAL */}
      {/* ========================================== */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start shrink-0">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded">{selectedProc?.refNumber}</span>
                        {getStatusBadge(selectedProc?.status)}
                      </div>
                      <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 leading-tight">
                        {selectedProc?.procedureText}
                      </Dialog.Title>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Nav */}
                  <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
                    {['EXECUTE', 'EXCEPTIONS', 'REVIEW'].map(tab => {
                      if (tab === 'REVIEW' && selectedProc?.status !== 'PREPARED' && selectedProc?.status !== 'REVIEWED') return null;
                      return (
                        <button key={tab} onClick={() => setActiveProcTab(tab as any)} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeProcTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                          {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    
                    {/* EXECUTE TAB */}
                    {activeProcTab === 'EXECUTE' && (
                      <form onSubmit={handleSubmitEvidence} className="space-y-6 animate-fade-in">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Auditor Conclusion & Results *</label>
                          <textarea 
                            required rows={4} 
                            disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'}
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 disabled:bg-slate-50"
                            placeholder="Document the work performed, items tested, and the conclusion reached..."
                            value={evidenceForm.auditorResponse}
                            onChange={e => setEvidenceForm({...evidenceForm, auditorResponse: e.target.value})}
                          />
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                          <h4 className="text-sm font-bold text-slate-800 mb-4">Attach Substantive Evidence</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Evidence Type</label>
                              <select disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={evidenceForm.evidenceType} onChange={e => setEvidenceForm({...evidenceForm, evidenceType: e.target.value})}>
                                <option value="BANK_STATEMENT">Bank Statement</option><option value="INVOICE">Invoice</option><option value="CONTRACT">Contract</option><option value="CALCULATION">Recalculation Spreadsheet</option><option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Upload File</label>
                              <input type="file" disabled={selectedProc?.status === 'REVIEWED' || selectedProc?.status === 'PREPARED'} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" onChange={e => { if(e.target.files) setEvidenceForm({...evidenceForm, file: e.target.files[0]}) }} />
                            </div>
                          </div>
                          
                          {selectedProc?.evidences?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Attached Files</p>
                              <div className="space-y-2">
                                {selectedProc.evidences.map((ev: any) => (
                                  <div key={ev.id} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded">
                                    <span className="text-sm font-medium text-slate-700 truncate flex-1">{ev.fileName}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{ev.evidenceType}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedProc?.status !== 'REVIEWED' && selectedProc?.status !== 'PREPARED' && (
                          <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="submit" disabled={actionLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Submit for Review</button>
                          </div>
                        )}
                      </form>
                    )}

                    {/* EXCEPTIONS TAB */}
                    {activeProcTab === 'EXCEPTIONS' && (
                      <div className="space-y-6 animate-fade-in">
                        {selectedProc?.status !== 'REVIEWED' && (
                          <form onSubmit={handleLogException} className="bg-red-50 border border-red-200 p-5 rounded-xl">
                            <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2" /> Log a New Exception</h4>
                            <div className="space-y-3">
                              <textarea required rows={2} className="w-full border-red-300 rounded-lg shadow-sm focus:ring-red-500" placeholder="Describe the discrepancy..." value={exceptionForm.description} onChange={e => setExceptionForm({...exceptionForm, description: e.target.value})} />
                              <div className="flex justify-between items-end">
                                <button type="submit" disabled={actionLoading} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-sm text-sm">Log Exception</button>
                              </div>
                            </div>
                          </form>
                        )}
                        
                        <div>
                          <h4 className="font-bold text-slate-800 mb-3">Documented Exceptions</h4>
                          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-sm font-medium">
                            {selectedProc?.exceptionsFound ? "Exceptions exist for this procedure. (List view integrated in next phase)." : "No exceptions found."}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REVIEW TAB */}
                    {activeProcTab === 'REVIEW' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Notes History */}
                        {selectedProc?.reviewNotes && selectedProc.reviewNotes.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <h5 className="font-bold text-slate-800 text-sm">Previous Review Notes</h5>
                            {selectedProc.reviewNotes.map((note: any) => (
                              <div key={note.id} className={`p-4 rounded-xl border shadow-sm ${note.status === 'OPEN' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex justify-between items-start">
                                  <p className={`text-sm ${note.status === 'OPEN' ? 'text-amber-900 font-medium' : 'text-slate-600'}`}>{note.note}</p>
                                  {note.status === 'OPEN' ? (
                                    <button 
                                      type="button"
                                      onClick={() => handleResolveNote(note.id)} 
                                      disabled={actionLoading}
                                      className="ml-4 shrink-0 bg-amber-200 text-amber-800 hover:bg-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                      Mark as Resolved
                                    </button>
                                  ) : (
                                    <span className="ml-4 shrink-0 flex items-center text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      <CheckCircleIcon className="w-4 h-4 mr-1" /> Cleared
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Review Form */}
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm">
                          <h4 className="text-base font-bold text-blue-900 mb-4 flex items-center">
                            <ClipboardDocumentCheckIcon className="w-6 h-6 mr-2" /> Manager Sign-Off
                          </h4>
                          
                          {selectedProc?.status === 'REVIEWED' ? (
                            <div className="bg-white p-4 rounded-lg border border-green-200 text-sm">
                              <p className="font-bold text-green-800 mb-1 flex items-center"><CheckCircleIcon className="w-5 h-5 mr-1.5"/> Procedure Successfully Approved</p>
                            </div>
                          ) : (
                            <RoleGuard minRole="MANAGER" fallback={<p className="text-sm font-bold text-blue-800 bg-white p-4 rounded-lg border border-blue-100">Awaiting Manager Review. You do not have permissions to sign off.</p>}>
                              <form onSubmit={handleReviewProcedure} className="space-y-4">
                                <div>
                                  <label className="block text-sm font-bold text-blue-900 mb-1">Review Decision</label>
                                  <select 
                                    className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 bg-white font-bold text-sm" 
                                    value={reviewForm.isApproved ? 'approve' : 'reject'} 
                                    onChange={e => setReviewForm({...reviewForm, isApproved: e.target.value === 'approve'})}
                                  >
                                    <option value="approve">Approve Procedure (Mark as Done)</option>
                                    <option value="reject">Return with Notes (Needs Corrections)</option>
                                  </select>
                                </div>
                                
                                {hasOpenNotes && reviewForm.isApproved && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-center">
                                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 shrink-0"/> 
                                    You must resolve all open review notes before approving this procedure.
                                  </div>
                                )}

                                <div>
                                  <label className="block text-sm font-bold text-blue-900 mb-1">Review Notes (Required if rejecting)</label>
                                  <textarea 
                                    required={!reviewForm.isApproved} 
                                    rows={3} 
                                    className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 bg-white" 
                                    placeholder="Add instructions or sign-off notes..." 
                                    value={reviewForm.reviewNote} 
                                    onChange={e => setReviewForm({...reviewForm, reviewNote: e.target.value})} 
                                  />
                                </div>
                                <div className="flex justify-end pt-2">
                                  <button 
                                    type="submit" 
                                    disabled={actionLoading || (hasOpenNotes && reviewForm.isApproved)} 
                                    className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Submit Review Decision
                                  </button>
                                </div>
                              </form>
                            </RoleGuard>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
};

export default ExecutionPhase;