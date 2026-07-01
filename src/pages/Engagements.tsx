// // src/pages/Engagements.tsx
// import React, { useEffect, useState, Fragment } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   PlusIcon, MagnifyingGlassIcon, TrashIcon, CheckCircleIcon, 
//   ClockIcon, DocumentArrowUpIcon, ShieldCheckIcon, CalendarIcon, BriefcaseIcon,BuildingOfficeIcon,ArrowRightIcon
// } from '@heroicons/react/24/outline';
// import { Dialog, Transition } from '@headlessui/react';
// import apiClient from '../utils/api';
// import { Engagement, Client } from '../types';
// import LoadingSpinner from '../components/Common/LoadingSpinner';
// import RoleGuard from '../components/Auth/RoleGuard';
// import { toast } from 'react-hot-toast';

// const STEPS = ['Initiate', 'Independence', 'Compliance', 'Terms & Fees', 'Partner Sign-Off'];

// const Engagements: React.FC = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DRAFTS'>('ACTIVE');
  
//   // Data States
//   const [engagements, setEngagements] = useState<Engagement[]>([]);
//   const [preEngagements, setPreEngagements] = useState<any[]>([]);
//   const [clients, setClients] = useState<Client[]>([]);
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');

//   // --- Wizard States ---
//   const [isWizardOpen, setIsWizardOpen] = useState(false);
//   const [wizardStep, setWizardStep] = useState(0);
//   const [wizardLoading, setWizardLoading] = useState(false);
//   const [preId, setPreId] = useState<string | null>(null);

//   // Wizard Form Data
//   const [initData, setInitData] = useState({ clientId: '', financialFramework: 'IFRS', auditPeriodStart: '', auditPeriodEnd: '' });
//   const [independence, setIndependence] = useState({ isIndependent: true, threatsIdentified: 'None identified.', safeguardsApplied: 'N/A' });
//   const [compliance, setCompliance] = useState({
//     hasFinancialInterest: false, hasConflictOfInterests: false, independenceNotes: 'No financial interests.', independenceConclusion: 'Independent.',
//     firmHasTechnicalExpertise: true, specialistsAvailable: true, timeConstraintsManageable: true, competenceNotes: 'Specialists available.', competenceConclusion: 'Competence met.',
//     backgroundChecksClear: true, noKnownFraudOrDisputes: true, goodEthicalCulture: true, integrityNotes: 'Background clear.', integrityConclusion: 'Integrity verified.',
//     clientGrantedPermission: true, predecessorCommunicated: true, predecessorNotes: 'No issues.', predecessorConclusion: 'Cleared.',
//     operationsUnderstood: true, industryRisksAssessed: true, financialStabilityAssessed: true, understandingConclusion: 'Understood.'
//   });
//   const [terms, setTerms] = useState({
//   agreedFee: '',
//   currency: 'USD',

//   termsAgreed: false,

//   managementAcknowledged: false,

//   engagementLetterUrl: '',

//   engagementLetterDate:
//     new Date().toISOString(),

//   file: null as File | null
// });
// const [partnerSignOff, setPartnerSignOff] = useState({
//   isAccepted: true,
//   continuanceNotes:
//     'All compliance checks cleared, independence confirmed, and fees agreed. Audit is officially accepted and ready for the Planning Phase.'
// });


//   // --- Data Fetching ---
//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       const [engRes, preRes, clientRes] = await Promise.all([
//         apiClient.getEngagements().catch(() => ({ data: { engagements: [] } })),
//         apiClient.getPreEngagements().catch(() => ({ data: [] })),
//         apiClient.getClients().catch(() => ({ data: { clients: [] } }))
//       ]);
      
//       setEngagements((engRes as any).data?.engagements || (engRes as any).engagements || []);
//       setPreEngagements((preRes as any).data || []);
//       setClients((clientRes as any).data?.clients || (clientRes as any).clients || []);
//     } catch (error) {
//       console.error('Failed to fetch data', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchAllData(); }, []);

//   // --- Wizard Handlers ---
//   const openWizard = async (existingPreId?: string) => {
//     if (existingPreId) {
//       setWizardLoading(true);
//       try {
//         const res = await apiClient.getPreEngagementById(existingPreId);
//         const data = res.data;
//         setPreId(data.id);
//         setInitData({ clientId: data.clientId, financialFramework: data.financialFramework || 'IFRS', auditPeriodStart: data.auditPeriodStart?.split('T')[0] || '', auditPeriodEnd: data.auditPeriodEnd?.split('T')[0] || '' });
//         if (data.complianceCheck) setCompliance(data.complianceCheck);
//         setTerms(prev => ({ ...prev, agreedFee: data.agreedFee || '', currency: data.currency || 'USD', termsAgreed: data.termsAgreed ?? true, managementAcknowledged: data.managementAcknowledged ?? true }));
//         // Jump to last uncompleted step based on missing data (simplified jump to 0 for review)
//         setWizardStep(0);
//       } catch (error) { toast.error('Failed to load draft.'); } finally { setWizardLoading(false); }
//     } else {
//       setPreId(null); setWizardStep(0);
//       setInitData({ clientId: '', financialFramework: 'IFRS', auditPeriodStart: '', auditPeriodEnd: '' });
//     }
//     setIsWizardOpen(true);
//   };

//   const executeStep1 = async () => {
//     setWizardLoading(true);
//     try {
//       if (!preId) {
//         const payload = { ...initData, auditPeriodStart: new Date(initData.auditPeriodStart).toISOString(), auditPeriodEnd: new Date(initData.auditPeriodEnd).toISOString() };
//         const res: any = await apiClient.initiatePreEngagement(payload);
//         setPreId(res.data?.id);
//       }
//       toast.success('Pre-Engagement Initiated');
//       setWizardStep(1);
//     } catch (e) { toast.error('Failed to initiate.'); } finally { setWizardLoading(false); }
//   };

// const executeStep2 = async () => {
//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   setWizardLoading(true);

//   try {
//     const payload = {
//       isIndependent: Boolean(independence.isIndependent),
//       threatsIdentified:
//         independence.threatsIdentified || 'None identified.',
//       safeguardsApplied:
//         independence.safeguardsApplied || 'N/A'
//     };

//     await apiClient.submitIndependence(preId, payload);

//     toast.success('Independence saved');
//     setWizardStep(2);

//   } catch (e: any) {
//     console.error(
//       'Independence Validation Error:',
//       e.response?.data || e
//     );

//     const errorMessage = e.response?.data?.message;

//     let errorStr = '';

//     if (Array.isArray(errorMessage)) {
//       errorStr = errorMessage[0];
//     } else if (typeof errorMessage === 'object') {
//       errorStr = errorMessage?.message || JSON.stringify(errorMessage);
//     } else {
//       errorStr = errorMessage || '';
//     }

//     const lower = errorStr.toLowerCase();

//     // IMPORTANT FIX
//     if (
//       lower.includes('already') ||
//       lower.includes('exists') ||
//       lower.includes('submitted')
//     ) {
//       toast.success(
//         'Independence already exists. Proceeding...'
//       );

//       setWizardStep(2);
//       return;
//     }

//     toast.error(errorStr || 'Failed to save independence');

//   } finally {
//     setWizardLoading(false);
//   }
// };

//   const executeStep3 = async () => {
//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   setWizardLoading(true);

//   try {

//     // ONLY SEND DTO FIELDS
//     const payload = {
//       hasFinancialInterest:
//         Boolean(compliance.hasFinancialInterest),

//       hasConflictOfInterests:
//         Boolean(compliance.hasConflictOfInterests),

//       independenceNotes:
//         compliance.independenceNotes,

//       independenceConclusion:
//         compliance.independenceConclusion,

//       firmHasTechnicalExpertise:
//         Boolean(compliance.firmHasTechnicalExpertise),

//       specialistsAvailable:
//         Boolean(compliance.specialistsAvailable),

//       timeConstraintsManageable:
//         Boolean(compliance.timeConstraintsManageable),

//       competenceNotes:
//         compliance.competenceNotes,

//       competenceConclusion:
//         compliance.competenceConclusion,

//       backgroundChecksClear:
//         Boolean(compliance.backgroundChecksClear),

//       noKnownFraudOrDisputes:
//         Boolean(compliance.noKnownFraudOrDisputes),

//       goodEthicalCulture:
//         Boolean(compliance.goodEthicalCulture),

//       integrityNotes:
//         compliance.integrityNotes,

//       integrityConclusion:
//         compliance.integrityConclusion,

//       clientGrantedPermission:
//         Boolean(compliance.clientGrantedPermission),

//       predecessorCommunicated:
//         Boolean(compliance.predecessorCommunicated),

//       predecessorNotes:
//         compliance.predecessorNotes,

//       predecessorConclusion:
//         compliance.predecessorConclusion,

//       operationsUnderstood:
//         Boolean(compliance.operationsUnderstood),

//       industryRisksAssessed:
//         Boolean(compliance.industryRisksAssessed),

//       financialStabilityAssessed:
//         Boolean(compliance.financialStabilityAssessed),

//       understandingConclusion:
//         compliance.understandingConclusion
//     };

//     console.log(
//       'CLEAN COMPLIANCE PAYLOAD:',
//       payload
//     );

//     await apiClient.updateComplianceCheck(
//       preId,
//       payload
//     );

//     toast.success('Compliance saved');

//     setWizardStep(3);

//   } catch (e: any) {

//     console.error(
//       'COMPLIANCE ERROR:',
//       e.response?.data || e
//     );

//     const backendMsg =
//       e.response?.data?.message;

//     let errorMessage =
//       'Failed to save compliance';

//     if (typeof backendMsg === 'string') {
//       errorMessage = backendMsg;

//     } else if (
//       typeof backendMsg?.message === 'string'
//     ) {
//       errorMessage = backendMsg.message;

//     } else if (
//       Array.isArray(backendMsg?.message)
//     ) {
//       errorMessage =
//         backendMsg.message.join(', ');

//     } else if (
//       Array.isArray(backendMsg)
//     ) {
//       errorMessage = backendMsg.join(', ');
//     }

//     toast.error(errorMessage);

//   } finally {
//     setWizardLoading(false);
//   }
// };

// // src/pages/Engagements.tsx

// const executeStep4 = async () => {
//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   if (!terms.file && !terms.engagementLetterUrl) {
//     toast.error('Please select a file to upload.');
//     return;
//   }

//   setWizardLoading(true);

//   try {
//     let finalUrl = terms.engagementLetterUrl;

//     // Upload file first
//     if (terms.file) {
//       const formData = new FormData();

//       // IMPORTANT:
//       // Must match backend FileInterceptor('file')
//       formData.append('file', terms.file);

//       console.log('Uploading file:', terms.file.name);

//       const uploadRes: any =
//         await apiClient.uploadFile(formData);

//       console.log('Upload Response:', uploadRes);

//       finalUrl =
//         uploadRes?.data?.fileUrl ||
//         uploadRes?.fileUrl ||
//         uploadRes?.url;

//       if (!finalUrl) {
//         throw new Error(
//           'Upload succeeded but no file URL returned'
//         );
//       }

//       toast.success('File uploaded!');
//     }

//     const payload = {
//       agreedFee: Number(terms.agreedFee),
//       currency: terms.currency,
//       termsAgreed: Boolean(terms.termsAgreed),
//       managementAcknowledged: Boolean(
//         terms.managementAcknowledged
//       ),
//       engagementLetterUrl: finalUrl,
//       engagementLetterDate: new Date().toISOString()
//     };

//     await apiClient.updateTerms(preId, payload);

//     toast.success('Terms saved!');

//     setTerms((prev) => ({
//       ...prev,
//       engagementLetterUrl: finalUrl,
//       file: null
//     }));

//     setWizardStep(4);

//   } catch (e: any) {
//     console.error(
//       'Upload/Terms Error:',
//       e.response?.data || e
//     );

//     const errorMessage = e.response?.data?.message;

//     let displayMessage = 'Failed to upload/save';

//     if (Array.isArray(errorMessage)) {
//       displayMessage = errorMessage[0];

//     } else if (typeof errorMessage === 'object') {
//       displayMessage =
//         errorMessage?.message ||
//         JSON.stringify(errorMessage);

//     } else if (typeof errorMessage === 'string') {
//       displayMessage = errorMessage;

//     } else if (e.message) {
//       displayMessage = e.message;
//     }

//     toast.error(displayMessage);

//   } finally {
//     setWizardLoading(false);
//   }
// };

//   const executeStep5 = async () => {

//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   if (!partnerSignOff.continuanceNotes.trim()) {
//     toast.error(
//       'Please enter continuance notes'
//     );
//     return;
//   }

//   setWizardLoading(true);

//   try {

//     const payload = {
//       isAccepted: Boolean(
//         partnerSignOff.isAccepted
//       ),

//       continuanceNotes:
//         partnerSignOff.continuanceNotes
//     };

//     console.log(
//       'SIGN OFF PAYLOAD:',
//       payload
//     );

//     const res: any =
//       await apiClient.signOffPreEngagement(
//         preId,
//         payload
//       );

//     console.log(
//       'SIGN OFF RESPONSE:',
//       res
//     );

//     toast.success(
//       'Engagement Formally Created!'
//     );

//     setIsWizardOpen(false);

//     if (
//       res.data?.generatedEngagement?.id
//     ) {
//       navigate(
//         `/engagements/${res.data.generatedEngagement.id}/workspace/planning`
//       );

//     } else if (
//       res.generatedEngagement?.id
//     ) {
//       navigate(
//         `/engagements/${res.generatedEngagement.id}/workspace/planning`
//       );

//     } else {
//       fetchAllData();
//     }

//   } catch (e: any) {

//     console.error(
//       'SIGN OFF ERROR:',
//       e.response?.data || e
//     );

//     const backendMsg =
//       e.response?.data?.message;

//     let errorMessage =
//       'Sign-off failed';

//     if (typeof backendMsg === 'string') {
//       errorMessage = backendMsg;

//     } else if (
//       typeof backendMsg?.message === 'string'
//     ) {
//       errorMessage =
//         backendMsg.message;

//     } else if (
//       Array.isArray(backendMsg?.message)
//     ) {
//       errorMessage =
//         backendMsg.message.join(', ');

//     } else if (
//       Array.isArray(backendMsg)
//     ) {
//       errorMessage =
//         backendMsg.join(', ');
//     }

//     toast.error(errorMessage);

//   } finally {
//     setWizardLoading(false);
//   }
// };

//   // --- Filtering ---
//   const filteredEngagements = engagements.filter(e => 
//     (e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.client?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
//     (statusFilter ? e.status === statusFilter : true)
//   );

//   const pendingDrafts = preEngagements.filter(p => p.status !== 'APPROVED');

//   const getStatusStyle = (status: string) => {
//     const s = status?.toUpperCase();
//     if (s === 'COMPLETED') return 'bg-green-100 text-green-800';
//     if (s === 'EXECUTION') return 'bg-blue-100 text-blue-800';
//     if (s === 'PLANNING') return 'bg-purple-100 text-purple-800';
//     return 'bg-slate-100 text-slate-800';
//   };

//   return (
//     <div className="space-y-6">
      
//       {/* Header */}
//       <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engagements</h1>
//           <p className="text-slate-500 mt-1">Manage audit files, workflows, and client acceptances.</p>
//         </div>
//         <RoleGuard minRole="MANAGER">
//           <button onClick={() => openWizard()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors">
//             <PlusIcon className="w-5 h-5 mr-2" /> Start New Engagement
//           </button>
//         </RoleGuard>
//       </div>

//       {/* Controls & Tabs */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
//         <div className="flex space-x-6 border-b border-slate-200 w-full md:w-auto">
//           <button onClick={() => setActiveTab('ACTIVE')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ACTIVE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
//             Active Audits ({engagements.length})
//           </button>
//           <button onClick={() => setActiveTab('DRAFTS')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'DRAFTS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
//             Pending Setup ({pendingDrafts.length}) {pendingDrafts.length > 0 && <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500"></span>}
//           </button>
//         </div>

//         {activeTab === 'ACTIVE' && (
//           <div className="flex space-x-3 w-full md:w-auto">
//             <div className="relative flex-1 md:w-64">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500" />
//             </div>
//             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500">
//               <option value="">All Status</option><option value="PLANNING">Planning</option><option value="EXECUTION">Execution</option><option value="COMPLETED">Completed</option>
//             </select>
//           </div>
//         )}
//       </div>

//       {/* Grid Content */}
//       {loading ? (
//         <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
//       ) : activeTab === 'ACTIVE' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {filteredEngagements.length === 0 ? (
//             <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No active engagements found.</div>
//           ) : (
//             filteredEngagements.map(eng => (
//               <div key={eng.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-lg font-bold text-slate-900 truncate pr-4">{eng.name}</h3>
//                   <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(eng.status)}`}>{eng.status}</span>
//                 </div>
//                 <div className="space-y-3 mb-6 flex-1">
//                   <p className="flex items-center text-sm text-slate-600 font-medium"><BuildingOfficeIcon className="w-5 h-5 mr-2 text-slate-400"/> {eng.client?.name}</p>
//                   <p className="flex items-center text-sm text-slate-600 font-medium"><CalendarIcon className="w-5 h-5 mr-2 text-slate-400"/> Year End: {eng.yearEnd ? new Date(eng.yearEnd).toLocaleDateString() : 'N/A'}</p>
//                   <p className="flex items-center text-sm text-slate-600 font-medium"><ClockIcon className="w-5 h-5 mr-2 text-slate-400"/> Budget: {eng.budgetHours || '-'} Hrs</p>
//                 </div>
//                 <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
//                   <button onClick={() => navigate(`/engagements/${eng.id}/workspace`)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
//                     Open Workspace <ArrowRightIcon className="w-4 h-4 ml-1" />
//                   </button>
//                   <RoleGuard minRole="PARTNER">
//                     <button className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"><TrashIcon className="w-5 h-5"/></button>
//                   </RoleGuard>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {pendingDrafts.length === 0 ? (
//             <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No pending setups. Click 'Start New Engagement' to begin.</div>
//           ) : (
//             pendingDrafts.map(draft => (
//               <div key={draft.id} className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 flex flex-col relative overflow-hidden">
//                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-bold text-amber-900">Setup: {draft.client?.name || 'Unknown Client'}</h3>
//                     <p className="text-sm text-amber-700 mt-1">Audit Period: {draft.auditPeriodEnd ? new Date(draft.auditPeriodEnd).getFullYear() : 'N/A'}</p>
//                   </div>
//                   <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-800 uppercase tracking-wider">DRAFT</span>
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-amber-200/50">
//                   <button onClick={() => openWizard(draft.id)} className="w-full text-center bg-white border border-amber-300 text-amber-800 py-2 rounded-lg font-bold hover:bg-amber-100 transition-colors shadow-sm">
//                     Resume Pre-Engagement Wizard
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* ========================================================= */}
//       {/* 🚀 FULL SCREEN PRE-ENGAGEMENT WIZARD MODAL */}
//       {/* ========================================================= */}
//       <Transition appear show={isWizardOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-50" onClose={() => { /* Prevent closing on click outside */ }}>
//           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
//             <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                
//                 <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col h-[85vh]">
                  
//                   {/* Wizard Header */}
//                   <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
//                     <div>
//                       <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 tracking-tight">New Engagement Setup</Dialog.Title>
//                       <p className="text-sm text-slate-500 font-medium">Complete pre-engagement checks to generate the workspace.</p>
//                     </div>
//                     <button onClick={() => { setIsWizardOpen(false); fetchAllData(); }} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
//                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                     </button>
//                   </div>

//                   {/* Stepper Progress */}
//                   <div className="px-8 py-4 border-b border-slate-100 bg-white">
//                     <div className="flex items-center justify-between">
//                       {STEPS.map((step, idx) => (
//                         <div key={idx} className={`flex items-center ${idx !== STEPS.length - 1 ? 'flex-1' : ''}`}>
//                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${idx < wizardStep ? 'bg-indigo-600 border-indigo-600 text-white' : idx === wizardStep ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-400'}`}>
//                             {idx < wizardStep ? '✓' : idx + 1}
//                           </div>
//                           <span className={`ml-2 text-xs font-bold uppercase tracking-wider hidden sm:block ${idx <= wizardStep ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
//                           {idx !== STEPS.length - 1 && <div className={`flex-1 mx-4 h-0.5 ${idx < wizardStep ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Wizard Body Area (Scrollable) */}
//                   <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    
//                     {/* STEP 1 */}
//                     {wizardStep === 0 && (
//                       <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
//                         <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Client & Period</h4>
//                         <div className="space-y-5">
//                           <div>
//                             <label className="block text-sm font-bold text-slate-700 mb-1">Select Client *</label>
//                             <select className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.clientId} onChange={e => setInitData({...initData, clientId: e.target.value})}>
//                               <option value="">-- Choose an existing client --</option>
//                               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                             </select>
//                           </div>
//                           <div><label className="block text-sm font-bold text-slate-700 mb-1">Financial Framework</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.financialFramework} onChange={e => setInitData({...initData, financialFramework: e.target.value})}><option value="IFRS">IFRS</option><option value="US_GAAP">US GAAP</option></select></div>
//                           <div className="grid grid-cols-2 gap-4">
//                             <div><label className="block text-sm font-bold text-slate-700 mb-1">Audit Period Start</label><input type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.auditPeriodStart} onChange={e => setInitData({...initData, auditPeriodStart: e.target.value})} /></div>
//                             <div><label className="block text-sm font-bold text-slate-700 mb-1">Audit Period End</label><input type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.auditPeriodEnd} onChange={e => setInitData({...initData, auditPeriodEnd: e.target.value})} /></div>
//                           </div>
//                         </div>
//                         <div className="mt-8 flex justify-end"><button onClick={executeStep1} disabled={wizardLoading || !initData.clientId || !initData.auditPeriodStart} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save & Continue →</button></div>
//                       </div>
//                     )}

//                     {/* STEP 2 */}
//                     {wizardStep === 1 && (
//                       <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
//                         <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Independence Declaration</h4>
//                         <label className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer">
//                           <input type="checkbox" checked={independence.isIndependent} onChange={(e) => setIndependence({...independence, isIndependent: e.target.checked})} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
//                           <div><p className="font-bold text-slate-800">Engagement team is independent (ISA 220)</p></div>
//                         </label>
//                         {!independence.isIndependent && (
//                           <div className="mt-4 space-y-4"><textarea className="w-full border-amber-300 rounded-lg shadow-sm bg-amber-50" rows={2} placeholder="Threats Identified..." value={independence.threatsIdentified} onChange={e => setIndependence({...independence, threatsIdentified: e.target.value})} /></div>
//                         )}
//                         <div className="mt-8 flex justify-between"><button onClick={() => setWizardStep(0)} className="text-slate-600 font-bold px-4">← Back</button><button onClick={executeStep2} disabled={wizardLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save & Continue →</button></div>
//                       </div>
//                     )}

//                     {/* STEP 3 */}
//                     {wizardStep === 2 && (
//                       <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
//                         <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Integrity & Competence Checks</h4>
//                         <div className="space-y-4">
//                           <label className="flex items-center space-x-3"><input type="checkbox" checked={compliance.backgroundChecksClear} onChange={e => setCompliance({...compliance, backgroundChecksClear: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="font-medium">Client Background checks are clear</span></label>
//                           <label className="flex items-center space-x-3"><input type="checkbox" checked={compliance.firmHasTechnicalExpertise} onChange={e => setCompliance({...compliance, firmHasTechnicalExpertise: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="font-medium">Firm has required technical expertise</span></label>
//                           <label className="flex items-center space-x-3"><input type="checkbox" checked={compliance.predecessorCommunicated} onChange={e => setCompliance({...compliance, predecessorCommunicated: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="font-medium">Predecessor auditor communicated no issues</span></label>
//                         </div>
//                         <div className="mt-8 flex justify-between"><button onClick={() => setWizardStep(1)} className="text-slate-600 font-bold px-4">← Back</button><button onClick={executeStep3} disabled={wizardLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save & Continue →</button></div>
//                       </div>
//                     )}

//                     {/* STEP 4 */}
//                     {wizardStep === 3 && (
//                       <div className="space-y-6">

//   <h2 className="text-2xl font-bold">
//     Terms & Upload Letter
//   </h2>

//   {/* Fee + Currency */}
//   <div className="grid grid-cols-2 gap-6">

//     <div>
//       <label className="block mb-2 font-medium">
//         Agreed Audit Fee
//       </label>

//       <input
//         type="number"
//         value={terms.agreedFee}
//         onChange={(e) =>
//           setTerms((prev) => ({
//             ...prev,
//             agreedFee: e.target.value
//           }))
//         }
//         className="w-full border rounded-lg p-3"
//         placeholder="Enter agreed fee"
//       />
//     </div>

//     <div>
//       <label className="block mb-2 font-medium">
//         Currency
//       </label>

//       <select
//         value={terms.currency}
//         onChange={(e) =>
//           setTerms((prev) => ({
//             ...prev,
//             currency: e.target.value
//           }))
//         }
//         className="w-full border rounded-lg p-3"
//       >
//         <option value="USD">USD</option>
//         <option value="ETB">ETB</option>
//         <option value="EUR">EUR</option>
//       </select>
//     </div>

//   </div>

//   {/* Engagement Letter Date */}
//   <div>
//     <label className="block mb-2 font-medium">
//       Engagement Letter Date
//     </label>

//     <input
//       type="date"
//       value={
//         terms.engagementLetterDate
//           ? new Date(
//               terms.engagementLetterDate
//             )
//               .toISOString()
//               .split('T')[0]
//           : ''
//       }
//       onChange={(e) =>
//         setTerms((prev) => ({
//           ...prev,
//           engagementLetterDate:
//             new Date(
//               e.target.value
//             ).toISOString()
//         }))
//       }
//       className="w-full border rounded-lg p-3"
//     />
//   </div>

//   {/* Upload */}
//   <div>

//     <label className="block mb-2 font-medium">
//       Signed Engagement Letter (PDF)
//     </label>

//     <label className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer">

//       <input
//         type="file"
//         accept=".pdf"
//         className="hidden"
//         onChange={(e) => {
//           const file =
//             e.target.files?.[0];

//           if (file) {
//             setTerms((prev) => ({
//               ...prev,
//               file
//             }));
//           }
//         }}
//       />

//       <div className="text-lg font-semibold text-purple-600">
//         Upload Signed PDF
//       </div>

//       <div className="text-sm text-gray-500">
//         Max size 10MB
//       </div>

//       {terms.file && (
//         <div className="mt-4 text-green-600">
//           Selected:
//           {' '}
//           {terms.file.name}
//         </div>
//       )}

//     </label>

//   </div>

//   {/* Terms Agreed */}
//   <div className="flex items-start gap-3">

//     <input
//       type="checkbox"
//       checked={terms.termsAgreed}
//       onChange={(e) =>
//         setTerms((prev) => ({
//           ...prev,
//           termsAgreed: e.target.checked
//         }))
//       }
//       className="mt-1"
//     />

//     <div>
//       <div className="font-medium">
//         Terms Agreed
//       </div>

//       <div className="text-sm text-gray-500">
//         Management has reviewed and
//         agreed to the engagement
//         terms.
//       </div>
//     </div>

//   </div>

//   {/* Management Acknowledged */}
//   <div className="flex items-start gap-3">

//     <input
//       type="checkbox"
//       checked={
//         terms.managementAcknowledged
//       }
//       onChange={(e) =>
//         setTerms((prev) => ({
//           ...prev,
//           managementAcknowledged:
//             e.target.checked
//         }))
//       }
//       className="mt-1"
//     />

//     <div>
//       <div className="font-medium">
//         Management Acknowledgement
//       </div>

//       <div className="text-sm text-gray-500">
//         Management acknowledges
//         responsibility for the
//         financial statements and
//         internal controls.
//       </div>
//     </div>

//   </div>

//   {/* Buttons */}
//   <div className="flex justify-between pt-6">

//     <button
//       onClick={() =>
//         setWizardStep(2)
//       }
//       className="border rounded-lg px-6 py-3"
//     >
//       ← Back
//     </button>

//     <button
//       onClick={executeStep4}
//       disabled={
//         !terms.termsAgreed ||
//         !terms.managementAcknowledged
//       }
//       className="bg-purple-600 text-white rounded-lg px-6 py-3 disabled:opacity-50"
//     >
//       Save & Continue →
//     </button>

//   </div>

// </div>
//                     )}

//                     {/* STEP 5 */}
//                     {wizardStep === 4 && (
//                       <div className="space-y-6">

//   <div>
//     <label className="block text-sm font-medium mb-2">
//       Partner Continuance Notes
//     </label>

//     <textarea
//       value={partnerSignOff.continuanceNotes}
//       onChange={(e) =>
//         setPartnerSignOff((prev) => ({
//           ...prev,
//           continuanceNotes: e.target.value
//         }))
//       }
//       rows={5}
//       className="w-full rounded-lg border p-3"
//       placeholder="Enter partner approval notes..."
//     />
//   </div>

//   <div className="flex items-center gap-2">
//     <input
//       type="checkbox"
//       checked={partnerSignOff.isAccepted}
//       onChange={(e) =>
//         setPartnerSignOff((prev) => ({
//           ...prev,
//           isAccepted: e.target.checked
//         }))
//       }
//     />

//     <span>
//       I approve and accept this engagement
//     </span>
//   </div>

//   <div className="flex gap-4">
//     <button
//       onClick={() => console.log('Review')}
//       className="border px-4 py-2 rounded-lg"
//     >
//       Review Data
//     </button>

//     <button
//       onClick={executeStep5}
//       disabled={!partnerSignOff.isAccepted}
//       className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
//     >
//       Partner Sign-Off
//     </button>
//   </div>

// </div>
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

// export default Engagements;


// src/pages/Engagements.tsx
import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, MagnifyingGlassIcon, TrashIcon, CheckCircleIcon, 
  ClockIcon, DocumentArrowUpIcon, ShieldCheckIcon, CalendarIcon, BuildingOfficeIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import apiClient from '../utils/api';
import { Engagement, Client } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import RoleGuard from '../components/Auth/RoleGuard';
import { toast } from 'react-hot-toast';

const STEPS = ['Initiate', 'Independence', 'Compliance', 'Terms & Fees', 'Partner Sign-Off'];

const Engagements: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DRAFTS'>('ACTIVE');
  
  // Data States
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [preEngagements, setPreEngagements] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- Wizard States ---
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [preId, setPreId] = useState<string | null>(null);

  // Wizard Form Data
  const [initData, setInitData] = useState({ clientId: '', financialFramework: 'IFRS', auditPeriodStart: '', auditPeriodEnd: '' });
  const [independence, setIndependence] = useState({ isIndependent: true, threatsIdentified: '', safeguardsApplied: '' });
  const [procedures, setProcedures] = useState<any[]>([]); // 👈 NEW: Procedure state

  const [compliance, setCompliance] = useState({
    hasFinancialInterest: false, hasConflictOfInterests: false, independenceNotes: 'No financial interests.', independenceConclusion: 'Independent.',
    firmHasTechnicalExpertise: true, specialistsAvailable: true, timeConstraintsManageable: true, competenceNotes: 'Specialists available.', competenceConclusion: 'Competence met.',
    backgroundChecksClear: true, noKnownFraudOrDisputes: true, goodEthicalCulture: true, integrityNotes: 'Background clear.', integrityConclusion: 'Integrity verified.',
    clientGrantedPermission: true, predecessorCommunicated: true, predecessorNotes: 'No issues.', predecessorConclusion: 'Cleared.',
    operationsUnderstood: true, industryRisksAssessed: true, financialStabilityAssessed: true, understandingConclusion: 'Understood.'
  });
  
  const [terms, setTerms] = useState({
    agreedFee: '',
    currency: 'USD',
    termsAgreed: false,
    managementAcknowledged: false,
    engagementLetterUrl: '',
    engagementLetterDate: new Date().toISOString(),
    file: null as File | null
  });

  const [partnerSignOff, setPartnerSignOff] = useState({
    isAccepted: true,
    continuanceNotes: 'All compliance checks cleared, independence confirmed, and fees agreed. Audit is officially accepted and ready for the Planning Phase.'
  });

  // --- Data Fetching ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [engRes, preRes, clientRes] = await Promise.all([
        apiClient.getEngagements().catch(() => ({ data: { engagements: [] } })),
        apiClient.getPreEngagements().catch(() => ({ data: [] })),
        apiClient.getClients().catch(() => ({ data: { clients: [] } }))
      ]);
      
      setEngagements((engRes as any).data?.engagements || (engRes as any).engagements || []);
      setPreEngagements((preRes as any).data || []);
      setClients((clientRes as any).data?.clients || (clientRes as any).clients || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- Wizard Handlers ---
  const openWizard = async (existingPreId?: string) => {
    if (existingPreId) {
      setWizardLoading(true);
      try {
        const res = await apiClient.getPreEngagementById(existingPreId);
        const data = res.data;
        setPreId(data.id);
        setInitData({ clientId: data.clientId, financialFramework: data.financialFramework || 'IFRS', auditPeriodStart: data.auditPeriodStart?.split('T')[0] || '', auditPeriodEnd: data.auditPeriodEnd?.split('T')[0] || '' });
        if (data.complianceCheck) setCompliance(data.complianceCheck);
        setTerms(prev => ({ ...prev, agreedFee: data.agreedFee || '', currency: data.currency || 'USD', termsAgreed: data.termsAgreed ?? true, managementAcknowledged: data.managementAcknowledged ?? true }));
        
        // Load procedures
        if (data.procedureResponses) {
          setProcedures(data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
        }
        
        setWizardStep(0);
      } catch (error) { toast.error('Failed to load draft.'); } finally { setWizardLoading(false); }
    } else {
      setPreId(null); setWizardStep(0);
      setProcedures([]);
      setInitData({ clientId: '', financialFramework: 'IFRS', auditPeriodStart: '', auditPeriodEnd: '' });
    }
    setIsWizardOpen(true);
  };

  const executeStep1 = async () => {
    setWizardLoading(true);
    try {
      if (!preId) {
        const payload = { ...initData, auditPeriodStart: new Date(initData.auditPeriodStart).toISOString(), auditPeriodEnd: new Date(initData.auditPeriodEnd).toISOString() };
        const res: any = await apiClient.initiatePreEngagement(payload);
        const newPreId = res.data?.id;
        setPreId(newPreId);

        // Fetch the newly generated procedures
        const fresh: any = await apiClient.getPreEngagementById(newPreId);
        if (fresh.data?.procedureResponses) {
          setProcedures(fresh.data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
        }
      }
      toast.success('Pre-Engagement Initiated');
      setWizardStep(1);
    } catch (e) { toast.error('Failed to initiate.'); } finally { setWizardLoading(false); }
  };

  // const executeStep2 = async (isIndependentDecision: boolean) => {
  //   if (!preId) {
  //     toast.error('Pre-engagement ID missing');
  //     return;
  //   }

  //   setWizardLoading(true);

  //   try {
  //     // 1. Submit Individual Declaration
  //     try {
  //       const payload = {
  //         isIndependent: isIndependentDecision,
  //         threatsIdentified: independence.threatsIdentified || '',
  //         safeguardsApplied: independence.safeguardsApplied || ''
  //       };
  //       await apiClient.submitIndependence(preId, payload);
  //     } catch (e: any) {
  //       const lower = (e.response?.data?.message?.toString() || '').toLowerCase();
  //       if (!lower.includes('already') && !lower.includes('exists') && !lower.includes('submitted')) {
  //         throw e;
  //       }
  //     }

  //     // 2. Upload and Save Dirty Procedures
  //     let proceduresSaved = 0;
  //     for (const proc of procedures) {
  //       if (proc.isDirty) {
  //         const formData = new FormData();
  //         if (proc.response) formData.append('response', proc.response);
  //         if (proc.file) formData.append('file', proc.file);

  //         await apiClient.answerProcedure(preId, proc.id, formData);
  //         proceduresSaved++;
  //       }
  //     }

  //     toast.success(isIndependentDecision ? 'Independence Confirmed.' : 'Engagement Declined.');
  //     setWizardStep(2);

  //   } catch (e: any) {
  //     toast.error('Failed to save independence details');
  //   } finally {
  //     setWizardLoading(false);
  //   }
  // };

  const executeStep2 = async (isIndependentDecision: boolean) => {
    if (!preId) {
      toast.error('Pre-engagement ID missing');
      return;
    }

    setWizardLoading(true);

    try {
      // 1. Submit Individual Declaration
      try {
        const payload = {
          isIndependent: isIndependentDecision,
          threatsIdentified: independence.threatsIdentified || '',
          safeguardsApplied: independence.safeguardsApplied || ''
        };
        await apiClient.submitIndependence(preId, payload);
      } catch (e: any) {
        const errorData = e.response?.data;
        
        let errorMsg = '';
        // 👇 FIXED: Deep dive to catch the double-wrapped NestJS exception
        if (typeof errorData?.message?.message === 'string') {
          errorMsg = errorData.message.message;
        } else if (typeof errorData?.message === 'string') {
          errorMsg = errorData.message;
        } else if (Array.isArray(errorData?.message)) {
          errorMsg = errorData.message.join(', ');
        } else {
          errorMsg = e.message || '';
        }

        const lower = errorMsg.toLowerCase();
        
        // If the backend says it already exists, bypass the error and proceed to file uploads!
        if (lower.includes('already') || lower.includes('exists') || lower.includes('submitted')) {
          console.log('✅ Bypassing duplicate independence declaration.');
        } else {
          throw new Error(`Independence Error: ${errorMsg}`);
        }
      }

      // 2. Upload and Save Procedures & Files
      let proceduresSaved = 0;
      for (const proc of procedures) {
        if (proc.isDirty) {
          const formData = new FormData();
          if (proc.response) formData.append('response', proc.response);
          if (proc.file) formData.append('file', proc.file);

          try {
            await apiClient.answerProcedure(preId, proc.id, formData);
            proceduresSaved++;
          } catch (procError: any) {
            console.error(`❌ Failed to save procedure ${proc.id}:`, procError);
            throw new Error('Failed to upload procedure evidence.');
          }
        }
      }

      toast.success(isIndependentDecision ? 'Independence Confirmed.' : 'Engagement Declined.');
      setWizardStep(2); // Move to Step 3

    } catch (e: any) {
      console.error('Final Step 2 Error:', e);
      toast.error(e.message || 'Failed to save independence details');
    } finally {
      setWizardLoading(false);
    }
  };

  // const executeStep3 = async () => {
  //   if (!preId) { toast.error('Pre-engagement ID missing'); return; }
  //   setWizardLoading(true);
  //   try {
  //     const payload = {
  //       hasFinancialInterest: Boolean(compliance.hasFinancialInterest),
  //       hasConflictOfInterests: Boolean(compliance.hasConflictOfInterests),
  //       independenceNotes: compliance.independenceNotes,
  //       independenceConclusion: compliance.independenceConclusion,
  //       firmHasTechnicalExpertise: Boolean(compliance.firmHasTechnicalExpertise),
  //       specialistsAvailable: Boolean(compliance.specialistsAvailable),
  //       timeConstraintsManageable: Boolean(compliance.timeConstraintsManageable),
  //       competenceNotes: compliance.competenceNotes,
  //       competenceConclusion: compliance.competenceConclusion,
  //       backgroundChecksClear: Boolean(compliance.backgroundChecksClear),
  //       noKnownFraudOrDisputes: Boolean(compliance.noKnownFraudOrDisputes),
  //       goodEthicalCulture: Boolean(compliance.goodEthicalCulture),
  //       integrityNotes: compliance.integrityNotes,
  //       integrityConclusion: compliance.integrityConclusion,
  //       clientGrantedPermission: Boolean(compliance.clientGrantedPermission),
  //       predecessorCommunicated: Boolean(compliance.predecessorCommunicated),
  //       predecessorNotes: compliance.predecessorNotes,
  //       predecessorConclusion: compliance.predecessorConclusion,
  //       operationsUnderstood: Boolean(compliance.operationsUnderstood),
  //       industryRisksAssessed: Boolean(compliance.industryRisksAssessed),
  //       financialStabilityAssessed: Boolean(compliance.financialStabilityAssessed),
  //       understandingConclusion: compliance.understandingConclusion
  //     };
  //     await apiClient.updateComplianceCheck(preId, payload);
  //     toast.success('Compliance saved');
  //     setWizardStep(3);
  //   } catch (e: any) {
  //     toast.error('Failed to save compliance');
  //   } finally {
  //     setWizardLoading(false);
  //   }
  // };

  const executeStep3 = async () => {
    if (!preId) { toast.error('Pre-engagement ID missing'); return; }

    // Frontend validation: Ensure conclusions are filled before hitting the backend gate
    if (!compliance.integrityConclusion || !compliance.competenceConclusion || !compliance.independenceConclusion) {
      toast.error('Please provide conclusions for Integrity, Competence, and Independence.');
      return;
    }

    setWizardLoading(true);
    try {
      // Send the actual user-filled state!
      await apiClient.updateComplianceCheck(preId, compliance);
      toast.success('Compliance criteria verified.');
      setWizardStep(3);
    } catch (e: any) {
      console.error('Compliance error:', e.response?.data || e);
      toast.error(e.response?.data?.message || 'Failed to save compliance');
    } finally {
      setWizardLoading(false);
    }
  };

  const executeStep4 = async () => {
    if (!preId) { toast.error('Pre-engagement ID missing'); return; }
    if (!terms.file && !terms.engagementLetterUrl) { toast.error('Please select a file to upload.'); return; }
    
    setWizardLoading(true);
    try {
      let finalUrl = terms.engagementLetterUrl;
      if (terms.file) {
        const formData = new FormData();
        formData.append('file', terms.file);
        const uploadRes: any = await apiClient.uploadFile(formData);
        finalUrl = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.url;
        toast.success('File uploaded!');
      }

      const payload = {
        agreedFee: Number(terms.agreedFee),
        currency: terms.currency,
        termsAgreed: Boolean(terms.termsAgreed),
        managementAcknowledged: Boolean(terms.managementAcknowledged),
        engagementLetterUrl: finalUrl,
        engagementLetterDate: new Date().toISOString()
      };
      await apiClient.updateTerms(preId, payload);
      toast.success('Terms saved!');
      setTerms((prev) => ({ ...prev, engagementLetterUrl: finalUrl, file: null }));
      setWizardStep(4);
    } catch (e: any) {
      toast.error('Failed to upload/save');
    } finally {
      setWizardLoading(false);
    }
  };

  const executeStep5 = async () => {
    if (!preId) { toast.error('Pre-engagement ID missing'); return; }
    if (!partnerSignOff.continuanceNotes.trim()) { toast.error('Please enter continuance notes'); return; }
    
    setWizardLoading(true);
    try {
      const payload = {
        isAccepted: Boolean(partnerSignOff.isAccepted),
        continuanceNotes: partnerSignOff.continuanceNotes
      };
      const res: any = await apiClient.signOffPreEngagement(preId, payload);
      toast.success('Engagement Formally Created!');
      setIsWizardOpen(false);

      if (res.data?.generatedEngagement?.id) {
        navigate(`/engagements/${res.data.generatedEngagement.id}/workspace/planning`);
      } else if (res.generatedEngagement?.id) {
        navigate(`/engagements/${res.generatedEngagement.id}/workspace/planning`);
      } else {
        fetchAllData();
      }
    } catch (e: any) {
      toast.error('Sign-off failed');
    } finally {
      setWizardLoading(false);
    }
  };

  // --- Filtering ---
  const filteredEngagements = engagements.filter(e => 
    (e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.client?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? e.status === statusFilter : true)
  );

  const pendingDrafts = preEngagements.filter(p => p.status !== 'APPROVED');

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return 'bg-green-100 text-green-800';
    if (s === 'EXECUTION') return 'bg-blue-100 text-blue-800';
    if (s === 'PLANNING') return 'bg-purple-100 text-purple-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engagements</h1>
          <p className="text-slate-500 mt-1">Manage audit files, workflows, and client acceptances.</p>
        </div>
        <RoleGuard minRole="MANAGER">
          <button onClick={() => openWizard()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" /> Start New Engagement
          </button>
        </RoleGuard>
      </div>

      {/* Controls & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex space-x-6 border-b border-slate-200 w-full md:w-auto">
          <button onClick={() => setActiveTab('ACTIVE')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ACTIVE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Active Audits ({engagements.length})
          </button>
          <button onClick={() => setActiveTab('DRAFTS')} className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'DRAFTS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Pending Setup ({pendingDrafts.length}) {pendingDrafts.length > 0 && <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500"></span>}
          </button>
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-indigo-500">
              <option value="">All Status</option><option value="PLANNING">Planning</option><option value="EXECUTION">Execution</option><option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
      ) : activeTab === 'ACTIVE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEngagements.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No active engagements found.</div>
          ) : (
            filteredEngagements.map(eng => (
              <div key={eng.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900 truncate pr-4">{eng.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(eng.status)}`}>{eng.status}</span>
                </div>
                <div className="space-y-3 mb-6 flex-1">
                  <p className="flex items-center text-sm text-slate-600 font-medium"><BuildingOfficeIcon className="w-5 h-5 mr-2 text-slate-400"/> {eng.client?.name}</p>
                  <p className="flex items-center text-sm text-slate-600 font-medium"><CalendarIcon className="w-5 h-5 mr-2 text-slate-400"/> Year End: {eng.yearEnd ? new Date(eng.yearEnd).toLocaleDateString() : 'N/A'}</p>
                  <p className="flex items-center text-sm text-slate-600 font-medium"><ClockIcon className="w-5 h-5 mr-2 text-slate-400"/> Budget: {eng.budgetHours || '-'} Hrs</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => navigate(`/engagements/${eng.id}/workspace`)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
                    Open Workspace <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </button>
                  <RoleGuard minRole="PARTNER">
                    <button className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"><TrashIcon className="w-5 h-5"/></button>
                  </RoleGuard>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingDrafts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No pending setups. Click 'Start New Engagement' to begin.</div>
          ) : (
            pendingDrafts.map(draft => (
              <div key={draft.id} className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">Setup: {draft.client?.name || 'Unknown Client'}</h3>
                    <p className="text-sm text-amber-700 mt-1">Audit Period: {draft.auditPeriodEnd ? new Date(draft.auditPeriodEnd).getFullYear() : 'N/A'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-800 uppercase tracking-wider">DRAFT</span>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200/50">
                  <button onClick={() => openWizard(draft.id)} className="w-full text-center bg-white border border-amber-300 text-amber-800 py-2 rounded-lg font-bold hover:bg-amber-100 transition-colors shadow-sm">
                    Resume Pre-Engagement Wizard
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚀 FULL SCREEN PRE-ENGAGEMENT WIZARD MODAL */}
      {/* ========================================================= */}
      <Transition appear show={isWizardOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => { /* Prevent closing on click outside */ }}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col h-[85vh]">
                  
                  {/* Wizard Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 tracking-tight">New Engagement Setup</Dialog.Title>
                      <p className="text-sm text-slate-500 font-medium">Complete pre-engagement checks to generate the workspace.</p>
                    </div>
                    <button onClick={() => { setIsWizardOpen(false); fetchAllData(); }} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Stepper Progress */}
                  <div className="px-8 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                      {STEPS.map((step, idx) => (
                        <div key={idx} className={`flex items-center ${idx !== STEPS.length - 1 ? 'flex-1' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${idx < wizardStep ? 'bg-indigo-600 border-indigo-600 text-white' : idx === wizardStep ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-400'}`}>
                            {idx < wizardStep ? '✓' : idx + 1}
                          </div>
                          <span className={`ml-2 text-xs font-bold uppercase tracking-wider hidden sm:block ${idx <= wizardStep ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                          {idx !== STEPS.length - 1 && <div className={`flex-1 mx-4 h-0.5 ${idx < wizardStep ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Wizard Body Area (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    
                    {/* STEP 1: INITIATE */}
                    {wizardStep === 0 && (
                      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Client & Period</h4>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Select Client *</label>
                            <select className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.clientId} onChange={e => setInitData({...initData, clientId: e.target.value})}>
                              <option value="">-- Choose an existing client --</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div><label className="block text-sm font-bold text-slate-700 mb-1">Financial Framework</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.financialFramework} onChange={e => setInitData({...initData, financialFramework: e.target.value})}><option value="IFRS">IFRS</option><option value="US_GAAP">US GAAP</option></select></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Audit Period Start</label><input type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.auditPeriodStart} onChange={e => setInitData({...initData, auditPeriodStart: e.target.value})} /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Audit Period End</label><input type="date" className="w-full border-slate-300 rounded-lg shadow-sm" value={initData.auditPeriodEnd} onChange={e => setInitData({...initData, auditPeriodEnd: e.target.value})} /></div>
                          </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                          <button onClick={executeStep1} disabled={wizardLoading || !initData.clientId || !initData.auditPeriodStart} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save & Continue →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: INDEPENDENCE & PROCEDURES */}
                    {wizardStep === 1 && (
                      <div className="max-w-4xl mx-auto space-y-6">

                        {/* PART A: Firm-Level Procedures */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Firm Independence Procedures (ISA 220)</h4>
                          
                          {procedures.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No procedures generated for this engagement.</p>
                          ) : (
                            <div className="space-y-6">
                              {procedures.map((proc, index) => (
                                <div key={proc.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                                  <p className="text-sm font-bold text-slate-800 mb-4 whitespace-pre-wrap">{proc.procedureText}</p>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Findings & Response</label>
                                      <textarea 
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 text-sm" 
                                        rows={3} 
                                        placeholder="Document the outcome of this procedure..."
                                        value={proc.response || ''} 
                                        onChange={(e) => {
                                          const newProcs = [...procedures];
                                          newProcs[index].response = e.target.value;
                                          newProcs[index].isDirty = true;
                                          setProcedures(newProcs);
                                        }} 
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supporting Evidence (Optional)</label>
                                      <input 
                                        type="file" 
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                        onChange={(e) => {
                                          if (e.target.files) {
                                            const newProcs = [...procedures];
                                            newProcs[index].file = e.target.files[0];
                                            newProcs[index].isDirty = true;
                                            setProcedures(newProcs);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* PART B: Individual Declaration */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Your Independence Declaration</h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Threats Identified (if any)</label>
                              <textarea className="w-full border-slate-300 rounded-lg text-sm" rows={2} placeholder="e.g. Familiarity threat..." value={independence.threatsIdentified} onChange={(e) => setIndependence({...independence, threatsIdentified: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Safeguards Applied</label>
                              <textarea className="w-full border-slate-300 rounded-lg text-sm" rows={2} placeholder="e.g. Assigned alternative reviewer..." value={independence.safeguardsApplied} onChange={(e) => setIndependence({...independence, safeguardsApplied: e.target.value})} />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <button onClick={() => setWizardStep(0)} className="text-slate-600 font-bold px-4">← Back</button>
                            <div className="flex gap-3">
                              <button onClick={() => executeStep2(false)} disabled={wizardLoading} className="px-6 py-2 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200 transition-colors">
                                Decline Engagement
                              </button>
                              <button onClick={() => executeStep2(true)} disabled={wizardLoading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                Confirm & Continue →
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* STEP 3: COMPLIANCE */}
                    {wizardStep === 2 && (
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-100 pb-4">Firm & Client Compliance Assessment</h4>
                          <p className="text-sm text-slate-500 mb-8">Complete the following checklists to satisfy ISA 210, 220, and 315 requirements.</p>

                          <div className="space-y-8">
                            
                            {/* 1. Client Integrity */}
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                              <h5 className="font-bold text-slate-800 mb-4 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> 1. Client Integrity (ISA 220)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pl-7">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.backgroundChecksClear} onChange={e => setCompliance({...compliance, backgroundChecksClear: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-medium">Background checks clear</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.noKnownFraudOrDisputes} onChange={e => setCompliance({...compliance, noKnownFraudOrDisputes: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-medium">No known fraud/disputes</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.goodEthicalCulture} onChange={e => setCompliance({...compliance, goodEthicalCulture: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-medium">Good ethical culture</span></label>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label><textarea value={compliance.integrityNotes} onChange={e => setCompliance({...compliance, integrityNotes: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conclusion *</label><textarea value={compliance.integrityConclusion} onChange={e => setCompliance({...compliance, integrityConclusion: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg border-l-4 border-l-indigo-500" rows={2} required /></div>
                              </div>
                            </div>

                            {/* 2. Competence & Capabilities */}
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                              <h5 className="font-bold text-slate-800 mb-4 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> 2. Competence & Capabilities (ISA 220)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pl-7">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.firmHasTechnicalExpertise} onChange={e => setCompliance({...compliance, firmHasTechnicalExpertise: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Technical expertise available</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.specialistsAvailable} onChange={e => setCompliance({...compliance, specialistsAvailable: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Specialists available</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.timeConstraintsManageable} onChange={e => setCompliance({...compliance, timeConstraintsManageable: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Time constraints manageable</span></label>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label><textarea value={compliance.competenceNotes} onChange={e => setCompliance({...compliance, competenceNotes: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conclusion *</label><textarea value={compliance.competenceConclusion} onChange={e => setCompliance({...compliance, competenceConclusion: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg border-l-4 border-l-indigo-500" rows={2} required /></div>
                              </div>
                            </div>

                            {/* 3. Predecessor Auditor & Entity */}
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                              <h5 className="font-bold text-slate-800 mb-4 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> 3. Predecessor Auditor & Entity Risk (ISA 210/315)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pl-7">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.clientGrantedPermission} onChange={e => setCompliance({...compliance, clientGrantedPermission: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Client granted permission</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.predecessorCommunicated} onChange={e => setCompliance({...compliance, predecessorCommunicated: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Predecessor communicated</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.industryRisksAssessed} onChange={e => setCompliance({...compliance, industryRisksAssessed: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Industry risks assessed</span></label>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label><textarea value={compliance.predecessorNotes} onChange={e => setCompliance({...compliance, predecessorNotes: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Overall Risk Conclusion</label><textarea value={compliance.understandingConclusion} onChange={e => setCompliance({...compliance, understandingConclusion: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                              </div>
                            </div>

                            {/* 4. Firm Independence Check */}
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl">
                              <h5 className="font-bold text-rose-800 mb-4 flex items-center"><ShieldCheckIcon className="w-5 h-5 text-rose-600 mr-2"/> 4. Firm Independence Conflicts</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pl-7">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.hasFinancialInterest} onChange={e => setCompliance({...compliance, hasFinancialInterest: e.target.checked})} className="rounded text-rose-600" /><span className="text-sm font-bold text-rose-900">Firm has financial interest</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.hasConflictOfInterests} onChange={e => setCompliance({...compliance, hasConflictOfInterests: e.target.checked})} className="rounded text-rose-600" /><span className="text-sm font-bold text-rose-900">Firm has conflict of interest</span></label>
                              </div>
                              <div className="pl-7">
                                <label className="block text-xs font-bold text-rose-700 uppercase mb-1">Independence Conclusion *</label>
                                <textarea value={compliance.independenceConclusion} onChange={e => setCompliance({...compliance, independenceConclusion: e.target.value})} className="w-full text-sm border-rose-300 rounded-lg border-l-4 border-l-rose-500 bg-white" rows={2} required />
                              </div>
                            </div>

                          </div>
                          
                          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                            <button onClick={() => setWizardStep(1)} className="text-slate-600 font-bold px-4 hover:bg-slate-50 rounded-lg py-2">← Back</button>
                            <button onClick={executeStep3} disabled={wizardLoading} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue →</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: TERMS & FEES */}
                    {wizardStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Terms & Upload Letter</h2>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block mb-2 font-medium">Agreed Audit Fee</label>
                            <input type="number" value={terms.agreedFee} onChange={(e) => setTerms((prev) => ({ ...prev, agreedFee: e.target.value }))} className="w-full border rounded-lg p-3" placeholder="Enter agreed fee" />
                          </div>
                          <div>
                            <label className="block mb-2 font-medium">Currency</label>
                            <select value={terms.currency} onChange={(e) => setTerms((prev) => ({ ...prev, currency: e.target.value }))} className="w-full border rounded-lg p-3">
                              <option value="USD">USD</option><option value="ETB">ETB</option><option value="EUR">EUR</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Engagement Letter Date</label>
                          <input type="date" value={terms.engagementLetterDate ? new Date(terms.engagementLetterDate).toISOString().split('T')[0] : ''} onChange={(e) => setTerms((prev) => ({ ...prev, engagementLetterDate: new Date(e.target.value).toISOString() }))} className="w-full border rounded-lg p-3" />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Signed Engagement Letter (PDF)</label>
                          <label className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setTerms((prev) => ({ ...prev, file })); } }} />
                            <div className="text-lg font-semibold text-indigo-600 flex items-center"><DocumentArrowUpIcon className="w-6 h-6 mr-2" /> Upload Signed PDF</div>
                            <div className="text-sm text-gray-500 mt-1">Max size 10MB</div>
                            {terms.file && <div className="mt-4 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full text-sm">Selected: {terms.file.name}</div>}
                          </label>
                        </div>

                        <div className="space-y-4">
                          <label className="flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm">
                            <input type="checkbox" checked={terms.termsAgreed} onChange={(e) => setTerms((prev) => ({ ...prev, termsAgreed: e.target.checked }))} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
                            <div><div className="font-bold text-slate-800">Terms Agreed</div><div className="text-sm text-gray-500">Management has reviewed and agreed to the engagement terms.</div></div>
                          </label>

                          <label className="flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm">
                            <input type="checkbox" checked={terms.managementAcknowledged} onChange={(e) => setTerms((prev) => ({ ...prev, managementAcknowledged: e.target.checked }))} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
                            <div><div className="font-bold text-slate-800">Management Acknowledgement</div><div className="text-sm text-gray-500">Management acknowledges responsibility for the financial statements and internal controls.</div></div>
                          </label>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-slate-200">
                          <button onClick={() => setWizardStep(2)} className="border rounded-lg px-6 py-3 font-bold text-slate-600 hover:bg-slate-50">← Back</button>
                          <button onClick={executeStep4} disabled={!terms.termsAgreed || !terms.managementAcknowledged} className="bg-indigo-600 text-white rounded-lg px-6 py-3 disabled:opacity-50 font-bold">Save & Continue →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: SIGN-OFF */}
                    {wizardStep === 4 && (
                      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        
                        <div className="flex justify-center mb-6">
                           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center ring-8 ring-green-50">
                             <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                           </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Partner Sign-Off</h2>
                        <p className="text-slate-500 text-center mb-8">Review the details and formally accept the engagement to begin planning.</p>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Partner Continuance Notes</label>
                          <textarea value={partnerSignOff.continuanceNotes} onChange={(e) => setPartnerSignOff((prev) => ({ ...prev, continuanceNotes: e.target.value }))} rows={4} className="w-full rounded-lg border-slate-300 shadow-sm focus:ring-indigo-500" placeholder="Enter partner approval notes..." />
                        </div>

                        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                          <input type="checkbox" checked={partnerSignOff.isAccepted} onChange={(e) => setPartnerSignOff((prev) => ({ ...prev, isAccepted: e.target.checked }))} className="w-5 h-5 text-indigo-600 rounded" />
                          <span className="font-bold text-slate-800">I officially approve and accept this engagement.</span>
                        </label>

                        <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                          <button onClick={() => setWizardStep(3)} className="border border-slate-300 text-slate-600 px-6 py-3 rounded-lg font-bold hover:bg-slate-50">← Review Terms</button>
                          <button onClick={executeStep5} disabled={!partnerSignOff.isAccepted || wizardLoading} className="bg-green-600 text-white px-8 py-3 rounded-lg disabled:opacity-50 font-bold hover:bg-green-700 shadow-sm">
                            Accept & Generate Workspace
                          </button>
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

export default Engagements;