// // src/pages/Workspace/CompletionPhase.tsx
// import React, { useState, useEffect } from 'react';
// import { useOutletContext, useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { 
//   ShieldCheckIcon, 
//   DocumentTextIcon, 
//   LockClosedIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';
// import { Engagement, AuditSummary, CompletionChecklist, Opinion } from '../../types';
// import RoleGuard from '../../components/Auth/RoleGuard';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// const TABS = [
//   { id: 'summary', label: 'Misstatements (ISA 450)' },
//   { id: 'checklist', label: 'Final Checklist' },
//   { id: 'opinion', label: 'Audit Opinion (ISA 700)' }
// ];

// const CompletionPhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('summary');
//   const [loading, setLoading] = useState(false);
//   const [isLocking, setIsLocking] = useState(false);

//   // Mock States based on our Types
//   const [summary, setSummary] = useState<AuditSummary | null>(null);
//   const [checklist, setChecklist] = useState<CompletionChecklist | null>(null);
//   const [opinion, setOpinion] = useState<Partial<Opinion>>({
//     opinionType: 'UNMODIFIED',
//     basisType: 'MISSTATEMENT',
//     customBasisText: '',
//     isLocked: false
//   });

//   useEffect(() => {
//     // Mocking the fetched data from Completion/Archive endpoints
//     setSummary({
//       id: 'sum1',
//       engagementId: engagement.id,
//       totalMisstatements: 125000,
//       correctedAmount: 85000,
//       uncorrectedAmount: 40000,
//       materiality: 250000, // From Phase 4
//       performanceMateriality: 187500,
//       isMaterialBreached: false
//     });

//     setChecklist({
//       id: 'chk1',
//       engagementId: engagement.id,
//       assertionsCovered: true,
//       reviewNotesCleared: true,
//       evidenceComplete: true,
//       fsReconciled: true,
//       ajesPosted: true,
//       isReadyForOpinion: true
//     });
//   }, [engagement.id]);

//   const handleGenerateReport = () => {
//     toast.success('Audit Report Draft Generated Successfully!');
//   };

//   const handleArchiveEngagement = async () => {
//     if (!window.confirm("WARNING: This will permanently lock the engagement file. No further changes can be made. Are you sure?")) return;
    
//     setIsLocking(true);
//     try {
//       // await apiClient.archiveEngagement(engagement.id);
//       setTimeout(() => {
//         setOpinion(prev => ({ ...prev, isLocked: true }));
//         toast.success('Engagement Locked and Archived.');
//         setIsLocking(false);
//         navigate('/dashboard'); // Kick them back to dashboard after locking
//       }, 2000);
//     } catch (error) {
//       toast.error('Failed to lock engagement.');
//       setIsLocking(false);
//     }
//   };

//   const formatCurrency = (val: number) => {
//     return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
//   };

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
//       {/* Header & Tabs */}
//       <div className="border-b border-slate-200">
//         <div className="p-6 pb-0">
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-800">Completion & Reporting</h2>
//               <p className="text-slate-500 mt-1">Review misstatements, finalize checklist, and sign the audit report.</p>
//             </div>
//             {opinion.isLocked && (
//               <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-white shadow-sm">
//                 <LockClosedIcon className="w-4 h-4 mr-2" />
//                 FILE LOCKED
//               </span>
//             )}
//           </div>
          
//           <nav className="flex space-x-8 mt-6">
//             {TABS.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
//                   activeTab === tab.id 
//                     ? 'border-indigo-600 text-indigo-600' 
//                     : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 bg-slate-50 overflow-y-auto p-6">
        
//         {/* ========================================== */}
//         {/* TAB 1: SUMMARY OF MISSTATEMENTS */}
//         {/* ========================================== */}
//         {activeTab === 'summary' && summary && (
//           <div className="max-w-4xl mx-auto space-y-6">
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//               <h3 className="text-lg font-bold text-slate-800 mb-6">Evaluation of Misstatements (ISA 450)</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
//                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Found</p>
//                   <p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalMisstatements)}</p>
//                 </div>
//                 <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                   <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Client Corrected</p>
//                   <p className="text-2xl font-bold text-green-800">{formatCurrency(summary.correctedAmount)}</p>
//                 </div>
//                 <div className={`p-4 border rounded-lg ${summary.uncorrectedAmount > summary.materiality ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
//                   <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Uncorrected</p>
//                   <p className="text-2xl font-bold text-amber-800">{formatCurrency(summary.uncorrectedAmount)}</p>
//                 </div>
//               </div>

//               <div className="relative pt-6 border-t border-slate-200">
//                 <h4 className="text-sm font-bold text-slate-800 mb-4">Materiality Assessment</h4>
                
//                 {/* Visual Bar Chart for Materiality Comparison */}
//                 <div className="w-full bg-slate-100 h-8 rounded-full relative overflow-hidden flex shadow-inner">
//                   <div 
//                     className="bg-amber-400 h-full flex items-center justify-center text-xs font-bold text-amber-900"
//                     style={{ width: `${(summary.uncorrectedAmount / summary.materiality) * 100}%` }}
//                   >
//                     Uncorrected
//                   </div>
//                 </div>
                
//                 <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
//                   <span>$0</span>
//                   <span className="flex flex-col items-center">
//                     <span className="h-2 w-px bg-slate-400 mb-1"></span>
//                     PM: {formatCurrency(summary.performanceMateriality)}
//                   </span>
//                   <span className="flex flex-col items-end text-red-600">
//                     <span className="h-2 w-px bg-red-400 mb-1 mr-4"></span>
//                     OM: {formatCurrency(summary.materiality)}
//                   </span>
//                 </div>
//               </div>

//               {summary.uncorrectedAmount < summary.materiality ? (
//                 <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
//                   <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
//                   <p className="text-sm text-green-800 font-medium">
//                     Conclusion: Uncorrected misstatements are immaterial, both individually and in aggregate. An unmodified opinion is supported.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//                   <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
//                   <p className="text-sm text-red-800 font-medium">
//                     Conclusion: Uncorrected misstatements exceed materiality limits. Consider a qualified or adverse opinion if management refuses to adjust.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 2: FINAL CHECKLIST */}
//         {/* ========================================== */}
//         {activeTab === 'checklist' && checklist && (
//           <div className="max-w-2xl mx-auto space-y-6">
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//               <h3 className="text-lg font-bold text-slate-800 mb-6">Pre-Archival Checklist</h3>
              
//               <ul className="space-y-4">
//                 {[
//                   { label: 'All procedures executed and evidence attached', status: checklist.evidenceComplete },
//                   { label: 'All assertions mathematically covered', status: checklist.assertionsCovered },
//                   { label: 'All review notes resolved and closed', status: checklist.reviewNotesCleared },
//                   { label: 'Trial Balance perfectly reconciled to Financial Statements', status: checklist.fsReconciled },
//                   { label: 'All approved AJEs posted to Trial Balance', status: checklist.ajesPosted },
//                 ].map((item, idx) => (
//                   <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
//                     <span className="text-sm font-medium text-slate-700">{item.label}</span>
//                     {item.status ? (
//                       <CheckCircleIcon className="w-6 h-6 text-green-500" />
//                     ) : (
//                       <XCircleIcon className="w-6 h-6 text-red-500" />
//                     )}
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-8 flex justify-end">
//                 <button 
//                   disabled={!checklist.isReadyForOpinion}
//                   className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Proceed to Auditor's Report →
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 3: AUDIT OPINION & LOCKDOWN */}
//         {/* ========================================== */}
//         {activeTab === 'opinion' && (
//           <div className="max-w-4xl mx-auto space-y-6">
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-bold text-slate-800">Auditor's Report Formulation</h3>
//                   <p className="text-sm text-slate-500 mt-1">Determine opinion type and generate final report (ISA 700/705).</p>
//                 </div>
//                 <DocumentTextIcon className="w-10 h-10 text-indigo-100" />
//               </div>

//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-2">Select Opinion Type</label>
//                   <select 
//                     className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//                     value={opinion.opinionType}
//                     onChange={(e) => setOpinion({ ...opinion, opinionType: e.target.value as any })}
//                   >
//                     <option value="UNMODIFIED">Unmodified Opinion (Clean)</option>
//                     <option value="QUALIFIED">Qualified Opinion (Except For)</option>
//                     <option value="ADVERSE">Adverse Opinion (Pervasive Misstatement)</option>
//                     <option value="DISCLAIMER">Disclaimer of Opinion (Inability to obtain evidence)</option>
//                   </select>
//                 </div>

//                 {opinion.opinionType !== 'UNMODIFIED' && (
//                   <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg animate-fade-in">
//                     <label className="block text-sm font-bold text-amber-900 mb-2">Basis for Modification</label>
//                     <textarea 
//                       rows={4} 
//                       className="w-full border-amber-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-white"
//                       placeholder="Describe the nature of the material misstatement or scope limitation..."
//                     ></textarea>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-200">
//                 <button 
//                   onClick={handleGenerateReport}
//                   className="px-6 py-2 bg-white border border-indigo-600 text-indigo-600 text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-50"
//                 >
//                   Generate Draft Report PDF
//                 </button>

//                 {/* ROLE GUARD: Only a Partner can lock the file */}
//                 <RoleGuard 
//                   minRole="PARTNER"
//                   fallback={<span className="text-sm font-semibold text-slate-400">Partner Sign-off Required to Lock File.</span>}
//                 >
//                   <button 
//                     onClick={handleArchiveEngagement}
//                     disabled={isLocking || opinion.isLocked}
//                     className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-black transition-colors flex items-center disabled:opacity-50"
//                   >
//                     {isLocking ? <LoadingSpinner size="sm" className="mr-2" /> : <ShieldCheckIcon className="w-5 h-5 mr-2" />}
//                     Partner Sign-off & Lock File
//                   </button>
//                 </RoleGuard>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default CompletionPhase;


// src/pages/Workspace/CompletionPhase.tsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ClipboardDocumentCheckIcon, ScaleIcon, CalculatorIcon, DocumentTextIcon,
  ArchiveBoxIcon, ArrowDownTrayIcon, PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/react/24/outline';
import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TABS = [
  { id: 'checklist', label: 'Final Review Checklist', icon: ClipboardDocumentCheckIcon },
  { id: 'misstatements', label: 'Uncorrected Misstatements', icon: ScaleIcon },
  { id: 'reconciliation', label: 'FS Reconciliation', icon: CalculatorIcon },
  { id: 'report', label: 'Audit Opinion & Report', icon: DocumentTextIcon }
];

const CompletionPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checklist');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [checklistData, setChecklistData] = useState<any>(null);
  const [misstatements, setMisstatements] = useState<any>(null);

  // FS Reconciliation Form State
  const [reconForm, setReconForm] = useState({ fsLineItem: '', tbAccountArea: '', fsAmount: 0, tbAmount: 0, explanation: '' });

  // Opinion Form State
  const [opinionForm, setOpinionForm] = useState({
    opinionType: 'UNMODIFIED',
    basisType: '',
    customBasisText: '',
    paragraphs: [] as { type: string; content: string }[],
    keyAuditMatters: [] as { title: string; description: string; auditResponse: string; order: number }[]
  });

  const isReadOnly = engagement.status === 'ARCHIVED' || engagement.status === 'COMPLETED';

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [checkRes, missRes] = await Promise.all([
        apiClient.getCompletionChecklist(engagement.id).catch(() => ({ data: null })),
        apiClient.getMisstatements(engagement.id).catch(() => ({ data: null }))
      ]);
      
      // FIXED: Correctly unwrapping the nested backend response
      const cData = checkRes.data?.data || checkRes.data;
      setChecklistData(cData || null);
      
      setMisstatements(missRes.data?.data || missRes.data);
    } catch (error) {
      console.error("Failed to fetch completion data", error);
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
  const handleReconcileFs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reconForm.fsAmount !== reconForm.tbAmount && !reconForm.explanation.trim()) {
      return toast.error("An explanation is strictly required when FS Amount does not match TB Amount.");
    }
    setActionLoading(true);
    try {
      await apiClient.reconcileFs(engagement.id, reconForm);
      toast.success('FS Line Item Reconciled');
      setReconForm({ fsLineItem: '', tbAccountArea: '', fsAmount: 0, tbAmount: 0, explanation: '' });
    } catch (e) { handleError(e, 'Failed to reconcile'); } finally { setActionLoading(false); }
  };

  const handlePostAje = async (ajeId: string) => {
    setActionLoading(true);
    try {
      await apiClient.postAje(ajeId);
      toast.success('AJE Posted to Trial Balance');
      fetchData(); 
    } catch (e) { handleError(e, 'Failed to post AJE'); } finally { setActionLoading(false); }
  };

  const handleIssueOpinion = async () => {
    setActionLoading(true);
    try {
      const payload: any = { opinionType: opinionForm.opinionType };
      if (opinionForm.opinionType !== 'UNMODIFIED') {
        payload.basisType = opinionForm.basisType;
        payload.customBasisText = opinionForm.customBasisText;
      }
      if (opinionForm.opinionType !== 'DISCLAIMER') {
        payload.paragraphs = opinionForm.paragraphs;
        payload.keyAuditMatters = opinionForm.keyAuditMatters.map((kam, i) => ({ ...kam, order: i + 1 }));
      }

      await apiClient.issueOpinion(engagement.id, payload);
      toast.success('Official Audit Opinion Issued & Engagement Locked!');
      window.location.reload(); 
    } catch (error: any) {
  console.error(error);

  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Failed to create opinion';

  toast.error(
    Array.isArray(message)
      ? message.join(', ')
      : String(message)
  );
} finally { setActionLoading(false); }
  };

  // const handleDownloadReport = async () => {
  //   const toastId = toast.loading("Generating PDF Report...");
  //   try {
  //     const response = await apiClient.downloadAuditReport(engagement.id);
  //     const url = window.URL.createObjectURL(new Blob([response.data as any]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', `${engagement.client?.name || 'Audit'}_Final_Report.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.parentNode?.removeChild(link);
  //     toast.success("Download started", { id: toastId });
  //   } catch (e) { handleError(e, 'Failed to download report'); toast.dismiss(toastId); }
  // };
  const handleDownloadReport = async () => {
    const toastId = toast.loading("Generating PDF Report...");
    try {
      // 1. Fetch the raw response
      const response: any = await apiClient.downloadAuditReport(engagement.id);
      
      // 2. Ensure we are passing response.data into the Blob, and forcing the PDF MIME type
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      
      // 3. Create a temporary local URL for the Blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // 4. Trigger the hidden download link
      const link = document.createElement('a');
      link.href = url;
      
      const cleanClientName = (engagement.client?.name || 'Audit').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${cleanClientName}_Final_Report.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      // 5. Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download started successfully", { id: toastId });
    } catch (e) { 
      console.error("PDF Download Error:", e);
      toast.error('Failed to download report. Ensure the backend is sending a raw PDF stream.', { id: toastId }); 
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("WARNING: Archiving will permanently lock this engagement and make it read-only. Proceed?")) return;
    setActionLoading(true);
    try {
      await apiClient.archiveEngagement(engagement.id);
      toast.success('Engagement Archived Successfully!');
      navigate('/engagements');
    } catch (e) { handleError(e, 'Failed to archive engagement. Check readiness checklist.'); } finally { setActionLoading(false); }
  };

  const isModified = opinionForm.opinionType !== 'UNMODIFIED';
  const isDisclaimer = opinionForm.opinionType === 'DISCLAIMER';

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Completion & Reporting</h2>
              <p className="text-slate-500 mt-1">Finalize checklist, resolve misstatements, and issue the audit report.</p>
            </div>
            {isReadOnly && (
              <span className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-sm">
                <ArchiveBoxIcon className="w-5 h-5 mr-2" /> Archived & Locked
              </span>
            )}
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
        {/* TAB 1: CHECKLIST */}
        {/* ========================================== */}
        {activeTab === 'checklist' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Final Review Readiness</h3>
                {checklistData?.isReadyForArchival && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Ready for Archival
                  </span>
                )}
              </div>
              
              {!checklistData?.checklist ? (
                <div className="text-center text-slate-500 py-8">Checklist data unavailable.</div>
              ) : (
                <div className="space-y-4">
                  {/* FIXED: Mapped precisely to the new backend properties */}
                  <div className="flex justify-between items-center p-4 rounded-lg border bg-slate-50 border-slate-200">
                    <span className="font-bold text-slate-700">All Audit Procedures Fully Covered</span>
                    {checklistData.checklist.proceduresFullyCovered ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border bg-slate-50 border-slate-200">
                    <span className="font-bold text-slate-700">No Open Review Notes</span>
                    {checklistData.checklist.noOpenReviewNotes ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border bg-slate-50 border-slate-200">
                    <span className="font-bold text-slate-700">Financial Statements Reconciled</span>
                    {checklistData.checklist.financialStatementsReconciled ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MISSTATEMENTS */}
        {/* ========================================== */}
        {activeTab === 'misstatements' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p>
                <p className="text-3xl font-black text-slate-800 mt-2">${Number(engagement.overallMateriality || 0).toLocaleString()}</p>
              </div>
              <div className={`bg-white p-6 rounded-xl border shadow-sm ${misstatements?.exceedsMateriality ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                <p className="text-xs font-bold text-slate-500 uppercase">Cumulative Uncorrected Impact</p>
                <p className={`text-3xl font-black mt-2 ${misstatements?.exceedsMateriality ? 'text-red-600' : 'text-amber-600'}`}>
                  ${Number(misstatements?.aggregateFinancialImpact || 0).toLocaleString()}
                </p>
                {misstatements?.exceedsMateriality && <p className="text-xs font-bold text-red-600 mt-2">Exceeds overall materiality. Opinion modification may be required.</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Uncorrected Misstatements (SAD) List</h3>
              </div>
              <div className="p-6">
                {(!misstatements?.items || misstatements.items.length === 0) ? (
                  <p className="text-center text-slate-500 py-4">No uncorrected misstatements found.</p>
                ) : (
                  <div className="space-y-4">
                    {misstatements.items.map((item: any) => (
                      <div key={item.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{item.description}</p>
                          <p className="text-sm text-slate-500 mt-1">Impact: ${Number(item.financialImpact).toLocaleString()}</p>
                        </div>
                        <RoleGuard minRole="MANAGER">
                          <button onClick={() => handlePostAje(item.ajeId)} disabled={actionLoading || isReadOnly} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                            Force Post AJE to TB
                          </button>
                        </RoleGuard>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: FS RECONCILIATION */}
        {/* ========================================== */}
        {activeTab === 'reconciliation' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Reconcile FS Line Item</h3>
            <form onSubmit={handleReconcileFs} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Financial Statement Line Item</label><input required disabled={isReadOnly} type="text" className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={reconForm.fsLineItem} onChange={e => setReconForm({...reconForm, fsLineItem: e.target.value})} placeholder="e.g. Cash and Cash Equivalents" /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Mapped TB Account Area</label><input required disabled={isReadOnly} type="text" className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={reconForm.tbAccountArea} onChange={e => setReconForm({...reconForm, tbAccountArea: e.target.value})} placeholder="e.g. 1000-CASH" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Draft FS Amount</label><input required disabled={isReadOnly} type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={reconForm.fsAmount} onChange={e => setReconForm({...reconForm, fsAmount: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">TB Final Adjusted Amount</label><input required disabled={isReadOnly} type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={reconForm.tbAmount} onChange={e => setReconForm({...reconForm, tbAmount: Number(e.target.value)})} /></div>
              </div>
              
              <div className={`p-4 rounded-lg border ${reconForm.fsAmount !== reconForm.tbAmount ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className={`block text-sm font-bold mb-1 ${reconForm.fsAmount !== reconForm.tbAmount ? 'text-amber-900' : 'text-slate-700'}`}>Explanation (Required if amounts vary)</label>
                <textarea 
                  required={reconForm.fsAmount !== reconForm.tbAmount} 
                  disabled={isReadOnly} 
                  rows={2} 
                  className={`w-full rounded-lg shadow-sm disabled:bg-slate-100 ${reconForm.fsAmount !== reconForm.tbAmount ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300'}`} 
                  value={reconForm.explanation} 
                  onChange={e => setReconForm({...reconForm, explanation: e.target.value})} 
                  placeholder="Justify mapping combinations or presentation differences..." 
                />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end pt-4"><button type="submit" disabled={actionLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save Reconciliation</button></div>
              )}
            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: AUDIT REPORT & OPINION */}
        {/* ========================================== */}
        {activeTab === 'report' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-xl p-8 shadow-lg text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold mb-1">Independent Auditor's Report</h3>
                <p className="text-indigo-200 font-medium">Download the fully assembled ISA-compliant PDF document.</p>
              </div>
              <button onClick={handleDownloadReport} className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-black shadow-md hover:bg-indigo-50 flex items-center transition-colors">
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Download Report
              </button>
            </div>

            {!isReadOnly && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-indigo-50/50 border-b border-indigo-100">
                  <h3 className="text-lg font-bold text-indigo-900">Formulate Audit Opinion</h3>
                  <p className="text-sm text-indigo-700 mt-1">Configure the layout and basis for the formal report.</p>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Opinion Type */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Opinion Type</label>
                      <select className="w-full border-slate-300 rounded-lg shadow-sm font-bold text-slate-800" value={opinionForm.opinionType} onChange={e => setOpinionForm({...opinionForm, opinionType: e.target.value})}>
                        <option value="UNMODIFIED">Unmodified Report</option>
                        <option value="QUALIFIED">Except For / Qualified</option>
                        <option value="ADVERSE">Adverse</option>
                        <option value="DISCLAIMER">Disclaimer of Opinion</option>
                      </select>
                    </div>
                    {isModified && (
                      <div className="animate-fade-in">
                        {/* FIXED: Labels updated to match the flowchart logic */}
                        <label className="block text-sm font-bold text-slate-700 mb-2">Basis for Modification</label>
                        <select className="w-full border-slate-300 rounded-lg shadow-sm" value={opinionForm.basisType} onChange={e => setOpinionForm({...opinionForm, basisType: e.target.value})}>
                          <option value="" disabled>Select Reason...</option>
                          {opinionForm.opinionType !== 'DISCLAIMER' && <option value="MISSTATEMENT">Disagreement (Material Misstatement)</option>}
                          {opinionForm.opinionType !== 'ADVERSE' && <option value="SCOPE_LIMITATION">Limitation on Scope</option>}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Basis Text */}
                  {isModified && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Basis for Opinion Paragraph</label>
                      <textarea required rows={4} className="w-full border-slate-300 rounded-lg shadow-sm" placeholder="Provide the mandatory narrative explaining the modification..." value={opinionForm.customBasisText} onChange={e => setOpinionForm({...opinionForm, customBasisText: e.target.value})} />
                    </div>
                  )}

                  {!isDisclaimer && (
                    <>
                      {/* Paragraphs */}
                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-bold text-slate-700">Additional Paragraphs</label>
                          <button onClick={() => setOpinionForm(prev => ({ ...prev, paragraphs: [...prev.paragraphs, { type: 'EMPHASIS_OF_MATTER', content: '' }] }))} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center">
                            <PlusIcon className="w-3 h-3 mr-1" /> Add Paragraph
                          </button>
                        </div>
                        <div className="space-y-3">
                          {opinionForm.paragraphs.map((p, index) => (
                            <div key={index} className="flex gap-3 items-start animate-fade-in">
                              <select className="w-48 border-slate-300 rounded-lg text-sm shadow-sm" value={p.type} onChange={(e) => { const newP = [...opinionForm.paragraphs]; newP[index].type = e.target.value; setOpinionForm({...opinionForm, paragraphs: newP}); }}>
                                <option value="EMPHASIS_OF_MATTER">Emphasis of Matter</option>
                                <option value="OTHER_MATTER">Other Matter</option>
                                <option value="GOING_CONCERN">Going Concern</option>
                              </select>
                              <textarea className="flex-1 border-slate-300 rounded-lg text-sm shadow-sm" rows={2} value={p.content} onChange={(e) => { const newP = [...opinionForm.paragraphs]; newP[index].content = e.target.value; setOpinionForm({...opinionForm, paragraphs: newP}); }} placeholder="Paragraph content..." />
                              <button onClick={() => { const newP = [...opinionForm.paragraphs]; newP.splice(index, 1); setOpinionForm({...opinionForm, paragraphs: newP}); }} className="text-red-400 hover:text-red-600 mt-1"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* KAMs */}
                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-bold text-slate-700">Key Audit Matters (KAMs)</label>
                          <button onClick={() => setOpinionForm(prev => ({ ...prev, keyAuditMatters: [...prev.keyAuditMatters, { title: '', description: '', auditResponse: '', order: 0 }] }))} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center">
                            <PlusIcon className="w-3 h-3 mr-1" /> Add KAM
                          </button>
                        </div>
                        <div className="space-y-4">
                          {opinionForm.keyAuditMatters.map((kam, index) => (
                            <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative animate-fade-in">
                              <button onClick={() => { const newK = [...opinionForm.keyAuditMatters]; newK.splice(index, 1); setOpinionForm({...opinionForm, keyAuditMatters: newK}); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                              <div className="space-y-3 mr-8">
                                <div><label className="text-xs font-bold text-slate-500">Title</label><input type="text" className="w-full border-slate-300 rounded-lg text-sm shadow-sm" value={kam.title} onChange={e => { const newK = [...opinionForm.keyAuditMatters]; newK[index].title = e.target.value; setOpinionForm({...opinionForm, keyAuditMatters: newK}); }} /></div>
                                <div><label className="text-xs font-bold text-slate-500">Matter Description</label><textarea rows={2} className="w-full border-slate-300 rounded-lg text-sm shadow-sm" value={kam.description} onChange={e => { const newK = [...opinionForm.keyAuditMatters]; newK[index].description = e.target.value; setOpinionForm({...opinionForm, keyAuditMatters: newK}); }} /></div>
                                <div><label className="text-xs font-bold text-slate-500">Audit Response</label><textarea rows={2} className="w-full border-slate-300 rounded-lg text-sm shadow-sm" value={kam.auditResponse} onChange={e => { const newK = [...opinionForm.keyAuditMatters]; newK[index].auditResponse = e.target.value; setOpinionForm({...opinionForm, keyAuditMatters: newK}); }} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submission and Archiving */}
                  <div className="pt-8 border-t border-slate-200 flex justify-between items-center">
                    <RoleGuard minRole="PARTNER" fallback={<p className="text-sm font-bold text-red-600">Only the Engagement Partner can perform final sign-off and archiving.</p>}>
                      <button onClick={handleArchive} disabled={actionLoading} className="text-slate-500 font-bold hover:text-red-600 transition-colors text-sm">
                        Lock & Archive Engagement (Read-Only)
                      </button>
                      <button onClick={handleIssueOpinion} disabled={actionLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-md hover:bg-indigo-700 transition-all">
                        Issue Official Opinion
                      </button>
                    </RoleGuard>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompletionPhase;