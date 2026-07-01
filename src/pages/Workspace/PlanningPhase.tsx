// // working planningphase without dashboard
// // src/pages/Workspace/PlanningPhase.tsx
// import React, { useState, useEffect, Fragment } from 'react';
// import { useOutletContext, useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { Dialog, Transition } from '@headlessui/react';
// import { 
//   BuildingOfficeIcon, ScaleIcon, CalculatorIcon, 
//   ShieldExclamationIcon, CheckCircleIcon, LockClosedIcon, PlusIcon, RocketLaunchIcon, PaperClipIcon, ShieldCheckIcon
// } from '@heroicons/react/24/outline';
// import apiClient from '../../utils/api';
// import { Engagement } from '../../types';
// import RoleGuard from '../../components/Auth/RoleGuard';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// // --- NEW TAB ORDER ---
// const TABS = [
//   { id: 'strategy', label: '1. Audit Strategy (ISA 300)', icon: ScaleIcon },
//   { id: 'entity', label: '2. Entity & Context (ISA 315)', icon: BuildingOfficeIcon },
//   { id: 'materiality', label: '3. Materiality (ISA 320)', icon: CalculatorIcon },
//   { id: 'fraud_special', label: '4. Fraud & Special', icon: ShieldCheckIcon },
//   { id: 'risks', label: '5. Risk Register', icon: ShieldExclamationIcon }
// ];

// // --- REUSABLE PROCEDURE COMPONENT ---
// const ProcedureBlock = ({ title, objective, textValue, onTextChange, fileValue, onFileUpload, isReadOnly }: any) => {
//   return (
//     <div className="mb-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm transition-all hover:shadow-md">
//       <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
//       <p className="text-sm text-slate-500 mb-5 leading-relaxed">{objective}</p>
//       <div className="mb-5">
//         <label className="block text-sm font-bold text-slate-700 mb-2">Response / Narrative</label>
//         <textarea 
//           disabled={isReadOnly}
//           className="w-full border-slate-300 rounded-lg p-3 min-h-[100px] shadow-sm disabled:bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//           value={textValue || ''}
//           onChange={(e) => onTextChange(e.target.value)}
//           placeholder="Document your understanding here..."
//         />
//       </div>
//       <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
//         <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
//           <PaperClipIcon className="w-4 h-4 mr-2 text-slate-500" /> Attach Evidence (Optional)
//         </label>
//         {isReadOnly ? (
//           <div className="text-sm text-slate-500 italic">{fileValue ? 'Attachment saved: ' + fileValue : 'No attachment provided'}</div>
//         ) : (
//           <div className="flex items-center justify-between">
//             <input 
//               type="file" 
//               onChange={(e) => { if (e.target.files && e.target.files[0]) onFileUpload(e.target.files[0]); }}
//               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
//             />
//             {fileValue && typeof fileValue === 'string' && <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap ml-4">File Attached ✓</span>}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const PlanningPhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const navigate = useNavigate();
  
//   const [activeTab, setActiveTab] = useState('strategy');
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

//   // Global Read-Only check
//   const isReadOnly = engagement.status !== 'DRAFT' && engagement.status !== 'PLANNING';

//   // --- States ---
//   const [strategy, setStrategy] = useState<any>({});
//   const [entity, setEntity] = useState<any>({});
//   const [materiality, setMateriality] = useState<any>({ benchmark: 'Revenue', benchmarkValue: 0, rulePercentage: 1, performanceHaircut: 75, trivialPercentage: 5 });
//   const [fraud, setFraud] = useState<any>({ revenueFraudPresumption: true });
//   const [special, setSpecial] = useState<any>({});
//   const [risks, setRisks] = useState<any[]>([]);
//   const [newRisk, setNewRisk] = useState<any>({ 
//   riskDescription: '', 
//   category: 'Revenue', 
//   assertion: 'Cut-off', 
//   accountArea: '', 
//   riskLevelType: 'HIGH', // <-- THIS WAS MISSING
//   inherentRisk: 'HIGH', 
//   controlRisk: 'MEDIUM', 
//   isSignificant: false, 
//   isFraudRisk: false, 
//   mitigationPlan: '' 
// });
//   const [riskRegisterApproved, setRiskRegisterApproved] = useState(false);

//   const isReadyToComplete = materiality?.approvedById && strategy?.status === 'FINAL' && fraud?.isFinal && riskRegisterApproved;

//   // --- 1. Fetch Dashboard Data ---
//   const fetchDashboard = async () => {
//     setLoading(true);
//     try {
//       const res = await apiClient.getPlanningDashboard(engagement.id);
//       const data = res.data;
//       if (data.auditStrategy) setStrategy(data.auditStrategy);
//       if (data.entityUnderstanding) setEntity(data.entityUnderstanding);
//       if (data.materiality) setMateriality(data.materiality);
//       if (data.fraudBrainstorming) setFraud({ ...data.fraudBrainstorming, discussionDate: data.fraudBrainstorming.discussionDate ? new Date(data.fraudBrainstorming.discussionDate).toISOString().split('T')[0] : '' });
//       if (data.specialConsiderations) setSpecial(data.specialConsiderations);
//       if (data.riskAssessments) {
//         setRisks(data.riskAssessments);
//         setRiskRegisterApproved(data.riskAssessments.some((r: any) => r.status === 'FINAL'));
//       }
//     } catch (error) { toast.error("Failed to fetch planning dashboard"); } 
//     finally { setLoading(false); }
//   };
//   useEffect(() => { fetchDashboard(); }, [engagement.id]);

//   // --- Error Logging Helper ---
//   const extractError = (e: any) => {
//     const backendMsg = e.response?.data?.message;
//     if (Array.isArray(backendMsg)) return backendMsg.join(', ');
//     if (typeof backendMsg === 'string') return backendMsg;
//     return e.message || 'An unknown error occurred';
//   };

//   // --- Generic File Uploader ---
//   // --- Generic Local File Uploader ---
// const handleFileUpload = (setter: any, fieldName: string) => async (file: File) => {
//   const toastId = toast.loading(`Uploading ${file.name}...`);
//   try {
//     // 1. Wrap the file in a FormData object
//     const formData = new FormData();
//     // 'file' must exactly match the string in FileInterceptor('file') on your backend
//     formData.append('file', file); 
    
//     // 2. Send FormData to the API client (no engagementId needed)
//     const res = await apiClient.uploadPlanningEvidence(formData);
    
//     // 3. Extract the path based on your planning.controller.ts return structure
//     // We use fallback accessors in case your Axios wrapper nests the response differently
//     const savedPath = res.data?.path || res.path; 
    
//     // 4. Update local state
//     setter((prev: any) => ({ 
//       ...prev, 
//       [`${fieldName}Attachment`]: savedPath 
//     }));
    
//     toast.success(`Attached ${file.name} successfully`, { id: toastId });
//   } catch (error) {
//     console.error("Upload failed:", error);
//     toast.error(`Failed to upload ${file.name}`, { id: toastId });
//   }
// };
//   // --- 2. Save Handlers ---
//   const handleSaveStrategy = async () => {
//     setSaving(true);
//     try {
//       // Strip DB fields that NestJS will reject
//       const { 
//         id, createdAt, updatedAt, approvedAt, approvedById, status,
//         ...safeStrategy 
//       } = strategy;

//       await apiClient.createAuditStrategy({ 
//         engagementId: engagement.id, 
//         ...safeStrategy 
//       });
      
//       toast.success('Strategy saved as draft');
//       fetchDashboard();
//     } catch (e: any) { 
//       const errorMsg = extractError(e);
//       console.error("STRATEGY VALIDATION ERROR:", e.response?.data || e);
//       toast.error(`Strategy Error: ${errorMsg}`, { duration: 6000 }); 
//     } finally { 
//       setSaving(false); 
//     }
//   };

//   const handleApproveStrategy = async () => {
//     setSaving(true);
//     try {
//       await apiClient.approveAuditStrategy(engagement.id, { isFinalized: true });
//       toast.success('Strategy Approved');
//       fetchDashboard();
//     } catch (e) { toast.error('Failed to approve strategy'); } finally { setSaving(false); }
//   };

//   const handleSaveEntity = async () => {
//     setSaving(true);
//     try {
//       // 1. Destructure to remove database-controlled fields
//       const { 
//         id, createdAt, updatedAt, engagementId, 
//         ...safePayload 
//       } = entity;

//       // 2. Send only the safe fields
//       await apiClient.updateEntityUnderstanding(engagement.id, safePayload);
//       toast.success('Entity context saved');
//     } catch (e: any) { 
//       const errorMsg = extractError(e);
//       console.error("ENTITY VALIDATION ERROR:", e.response?.data || e);
//       toast.error(`Entity Error: ${errorMsg}`, { duration: 6000 }); 
//     } finally { 
//       setSaving(false); 
//     }
//   };

// const handleSaveMateriality = async () => {
//     setSaving(true);
//     try {
//       // Explicitly map only the allowed fields to avoid passing 'id' or 'createdAt'
//       const payload = {
//         engagementId: engagement.id,
//         benchmark: materiality.benchmark || 'Revenue',
//         benchmarkValue: Number(materiality.benchmarkValue ?? 0),
//         rulePercentage: Number(materiality.rulePercentage ?? 1),
//         performanceHaircut: Number(materiality.performanceHaircut ?? 75), 
//         trivialPercentage: Number(materiality.trivialPercentage ?? 5),
        
//         // Narrative Fields
//         overallMaterialityAssessment: materiality.overallMaterialityAssessment,
//         componentMateriality: materiality.componentMateriality,
//         benchmarkBasis: materiality.benchmarkBasis,
//         supplementaryDocumentation: materiality.supplementaryDocumentation,
//         revisionsAndCommunications: materiality.revisionsAndCommunications,
        
//         // Attachment Fields
//         overallAttachment: materiality.overallAttachment,
//         componentAttachment: materiality.componentAttachment,
//         benchmarkBasisAttachment: materiality.benchmarkBasisAttachment,
//         supplementaryAttachment: materiality.supplementaryAttachment,
//         revisionsAttachment: materiality.revisionsAttachment
//       };

//       await apiClient.createMateriality(payload);
//       toast.success('Materiality saved successfully');
//       fetchDashboard();
//     } catch (e: any) { 
//       const errorMsg = extractError(e);
//       console.error("MATERIALITY ERROR:", e.response?.data || e);
//       toast.error(`Materiality Error: ${errorMsg}`, { duration: 6000 })
//     } finally { 
//       setSaving(false); 
//     }
//   };

//   const handleApproveMateriality = async () => {
//     setSaving(true);
//     try {
//       await apiClient.approveMateriality(engagement.id, { engagementId: engagement.id, isApproved: true });
//       toast.success('Materiality Approved');
//       fetchDashboard();
//     } catch (e) { toast.error('Failed to approve materiality'); } finally { setSaving(false); }
//   };

// const handleSaveFraudAndSpecial = async () => {
//     setSaving(true);
//     try {
//       if (fraud.discussionDate) {
//         const fraudPayload = {
//           engagementId: engagement.id,
//           discussionDate: new Date(fraud.discussionDate).toISOString(),
//           participants: fraud.participants,
//           teamDiscussion: fraud.teamDiscussion,
//           teamDiscussionAttachment: fraud.teamDiscussionAttachment,
//           fraudLensAssessment: fraud.fraudLensAssessment,
//           fraudLensAttachment: fraud.fraudLensAttachment,
//           managementOverride: fraud.managementOverride,
//           managementOverrideAttachment: fraud.managementOverrideAttachment,
//           plannedFraudProcedures: fraud.plannedFraudProcedures,
//           plannedFraudProceduresAttachment: fraud.plannedFraudProceduresAttachment,
//           revenueFraudPresumption: fraud.revenueFraudPresumption
//         };
//         await apiClient.submitFraudBrainstorming(fraudPayload);
//       }

//       const specialPayload = {
//         lawsAndRegulations: special.lawsAndRegulations,
//         lawsAndRegulationsAttachment: special.lawsAndRegulationsAttachment,
//         noclarIdentified: special.noclarIdentified || false,
//         relatedParties: special.relatedParties,
//         relatedPartiesAttachment: special.relatedPartiesAttachment,
//         unusualTransactions: special.unusualTransactions || false,
//         goingConcernAssessment: special.goingConcernAssessment,
//         goingConcernAttachment: special.goingConcernAttachment,
//         goingConcernDoubt: special.goingConcernDoubt || false,
//         serviceOrganizations: special.serviceOrganizations,
//         serviceOrganizationsAttachment: special.serviceOrganizationsAttachment,
//         type2ReportAvailable: special.type2ReportAvailable || false,
//       };

//       await apiClient.updateSpecialConsiderations(engagement.id, specialPayload);
      
//       toast.success('Fraud & Special Considerations saved');
//       fetchDashboard();
//     } catch (e: any) { 
//       const errorMsg = extractError(e);
//       console.error("FRAUD/SPECIAL ERROR:", e.response?.data || e);
//       toast.error(`Save Error: ${errorMsg}`, { duration: 6000 });
//     } finally { 
//       setSaving(false); 
//     }
//   };

//   const handleApproveFraud = async () => {
//     setSaving(true);
//     try {
//       await apiClient.approveFraudBrainstorming(engagement.id, { signOffDate: new Date().toISOString() });
//       toast.success('Fraud Brainstorming Approved');
//       fetchDashboard();
//     } catch (e) { toast.error('Failed to approve fraud'); } finally { setSaving(false); }
//   };

//   const handleAddRisk = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await apiClient.createPlanningRisk({ engagementId: engagement.id, ...newRisk });
//       toast.success('Risk added');
//       setIsRiskModalOpen(false);
//       fetchDashboard();
//     } catch (e: any) { 
//       const errorMsg = extractError(e);
//       console.error("RISK ERROR:", e.response?.data || e);
//       toast.error(`Risk Error: ${errorMsg}`, { duration: 6000 }); }
//   };

//   const handleApproveRiskRegister = async () => {
//     setSaving(true);
//     try {
//       await apiClient.approveRiskRegister(engagement.id);
//       toast.success('Risk Register Approved');
//       setRiskRegisterApproved(true);
//       fetchDashboard();
//     } catch (e) { toast.error('Failed to approve risks'); } finally { setSaving(false); }
//   };

//   const handleCompletePlanning = async () => {
//     setSaving(true);
//     try {
//       await apiClient.completePlanning(engagement.id);
//       toast.success('Planning Phase Completed Successfully');
//       fetchDashboard();
//     } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to complete planning'); } finally { setSaving(false); }
//   };

//   // --- Auto Calculate Materiality Effect ---
//   useEffect(() => {
//     if (materiality.benchmarkValue && materiality.rulePercentage) {
//       const overall = (Number(materiality.benchmarkValue) * Number(materiality.rulePercentage)) / 100;
//       const perf = (overall * Number(materiality.performanceHaircut || 75)) / 100;
//       const trivial = (overall * Number(materiality.trivialPercentage || 5)) / 100;
//       setMateriality((prev: any) => ({ ...prev, overallMateriality: overall, performanceMateriality: perf, trivialThreshold: trivial }));
//     }
//   }, [materiality.benchmarkValue, materiality.rulePercentage, materiality.performanceHaircut, materiality.trivialPercentage]);

//   if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
//       {/* Header & Tabs */}
//       <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
//         <div className="p-6 pb-0">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Planning & Risk Assessment</h2>
//               <p className="text-slate-500 mt-1">Develop the audit strategy, set materiality, and identify risks.</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               {!isReadOnly ? (
//                 <button onClick={handleCompletePlanning} disabled={!isReadyToComplete || saving} className={`flex items-center px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${isReadyToComplete ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
//                   <RocketLaunchIcon className="w-5 h-5 mr-2" /> {isReadyToComplete ? 'Complete Planning Phase' : 'Sign-offs Required to Complete'}
//                 </button>
//               ) : (
//                 <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold border border-green-200 flex items-center shadow-sm"><CheckCircleIcon className="w-5 h-5 mr-1.5" /> Planning Completed</span>
//               )}
//             </div>
//           </div>
//           <nav className="flex space-x-2 overflow-x-auto">
//             {TABS.map(tab => (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors ${activeTab === tab.id ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-[0_4px_0_0_#fff]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
//                 <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       <div className="p-8 flex-1 bg-white overflow-y-auto">
        
//         {/* ========================================== */}
//         {/* TAB 1: STRATEGY (ISA 300) */}
//         {/* ========================================== */}
//         {activeTab === 'strategy' && (
//           <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
//             <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
//               <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
//                 <div><h3 className="text-xl font-bold text-slate-800">Establish the Overall Audit Strategy</h3><p className="text-sm text-slate-500 mt-1">Set the scope, timing, and direction of the audit.</p></div>
//                 {strategy.status === 'FINAL' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
//               </div>

//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-4">
//                 <h4 className="text-md font-bold text-slate-800 mb-2">Executive Summary</h4>
//                 <div><label className="block text-sm font-bold text-slate-700 mb-1">Scope of the Audit</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.scope || ''} onChange={(e) => setStrategy({...strategy, scope: e.target.value})} /></div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div><label className="block text-sm font-bold text-slate-700 mb-1">Reporting Objectives & Timing</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.timing || ''} onChange={(e) => setStrategy({...strategy, timing: e.target.value})} /></div>
//                   <div><label className="block text-sm font-bold text-slate-700 mb-1">Direction of the Audit</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.direction || ''} onChange={(e) => setStrategy({...strategy, direction: e.target.value})} /></div>
//                 </div>
//               </div>

//               <h4 className="text-md font-bold text-slate-800 mb-4">Detailed Procedures</h4>
//               <ProcedureBlock title="1. Define Engagement Reporting Objectives" objective="Confirm reporting deadlines, deliverables, and governance reporting needs." textValue={strategy.reportingObjectives} onTextChange={(v: string) => setStrategy({...strategy, reportingObjectives: v})} fileValue={strategy.reportingObjectivesAttachment} onFileUpload={handleFileUpload(setStrategy, 'reportingObjectives')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
//               <ProcedureBlock title="2. Determine Audit Scope" objective="Identify financial statements, disclosures, and components in scope." textValue={strategy.auditScope} onTextChange={(v: string) => setStrategy({...strategy, auditScope: v})} fileValue={strategy.auditScopeAttachment} onFileUpload={handleFileUpload(setStrategy, 'auditScope')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
              
//               <div className="relative">
//                 <ProcedureBlock title="3. Determine Planned Approach" objective="High-level decision on controls-reliant vs substantive-heavy." textValue={strategy.plannedApproach} onTextChange={(v: string) => setStrategy({...strategy, plannedApproach: v})} fileValue={strategy.plannedApproachAttachment} onFileUpload={handleFileUpload(setStrategy, 'plannedApproach')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
//                 <div className="absolute top-16 right-6 flex space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
//                   <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.relianceOnControls} onChange={(e) => setStrategy({...strategy, relianceOnControls: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Relies on Controls?</span></label>
//                   <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.itEnvironmentConsidered} onChange={(e) => setStrategy({...strategy, itEnvironmentConsidered: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Complex IT Env?</span></label>
//                 </div>
//               </div>

//               <div className="relative">
//                 <ProcedureBlock title="4. Resource Planning" objective="Plan staffing levels, timing, and specialist needs." textValue={strategy.resourcePlanning} onTextChange={(v: string) => setStrategy({...strategy, resourcePlanning: v})} fileValue={strategy.resourcePlanningAttachment} onFileUpload={handleFileUpload(setStrategy, 'resourcePlanning')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
//                 <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-slate-200">
//                   <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.useOfExperts} onChange={(e) => setStrategy({...strategy, useOfExperts: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Use of Experts?</span></label>
//                 </div>
//               </div>

//               {!isReadOnly && strategy.status !== 'FINAL' && (
//                 <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
//                   <button onClick={handleSaveStrategy} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Strategy</button>
//                   <RoleGuard minRole="MANAGER"><button onClick={handleApproveStrategy} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center"><LockClosedIcon className="w-4 h-4 mr-2" /> Approve Strategy</button></RoleGuard>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 2: ENTITY UNDERSTANDING (ISA 315) */}
//         {/* ========================================== */}
//         {activeTab === 'entity' && (
//           <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
//             <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
//               <div className="mb-6 border-b border-slate-200 pb-4">
//                 <h3 className="text-xl font-bold text-slate-800">Obtain an Understanding of the Entity and Its Environment</h3>
//                 <p className="text-slate-500 text-sm mt-1">Respond to each procedure and attach relevant evidence.</p>
//               </div>

//               <ProcedureBlock title="1. Business Model and Operations" objective="Obtain an overview of how the entity creates value, sources of revenue, and key processes." textValue={entity.businessModel} onTextChange={(v: string) => setEntity({...entity, businessModel: v})} fileValue={entity.businessModelAttachment} onFileUpload={handleFileUpload(setEntity, 'businessModel')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="2. Ownership and Governance Structure" objective="Identify ownership structure and oversight of financial reporting." textValue={entity.governanceStructure} onTextChange={(v: string) => setEntity({...entity, governanceStructure: v})} fileValue={entity.governanceAttachment} onFileUpload={handleFileUpload(setEntity, 'governance')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="3. Industry Conditions and Environment" objective="Identify industry trends, competitive pressures, and constraints." textValue={entity.industryConditions} onTextChange={(v: string) => setEntity({...entity, industryConditions: v})} fileValue={entity.industryConditionsAttachment} onFileUpload={handleFileUpload(setEntity, 'industryConditions')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="4. Applicable Financial Reporting Framework" objective="Identify the framework and significant accounting policies." textValue={entity.financialReportingFramework} onTextChange={(v: string) => setEntity({...entity, financialReportingFramework: v})} fileValue={entity.financialReportingAttachment} onFileUpload={handleFileUpload(setEntity, 'financialReporting')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="5. Regulatory Environment" objective="Identify laws, regulations, and oversight bodies affecting financials." textValue={entity.regulatoryFramework} onTextChange={(v: string) => setEntity({...entity, regulatoryFramework: v})} fileValue={entity.regulatoryFrameworkAttachment} onFileUpload={handleFileUpload(setEntity, 'regulatoryFramework')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="6. IT Systems Relevant to Financial Reporting" objective="Understand systems used to process and report transactions." textValue={entity.itSystems} onTextChange={(v: string) => setEntity({...entity, itSystems: v})} fileValue={entity.itSystemsAttachment} onFileUpload={handleFileUpload(setEntity, 'itSystems')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="7. High-Level Internal Controls" objective="Identify relevant entity-level controls addressing risks." textValue={entity.internalControls} onTextChange={(v: string) => setEntity({...entity, internalControls: v})} fileValue={entity.internalControlsAttachment} onFileUpload={handleFileUpload(setEntity, 'internalControls')} isReadOnly={isReadOnly} />

//               {!isReadOnly && (
//                 <div className="flex justify-end pt-4 border-t border-slate-200">
//                   <button onClick={handleSaveEntity} disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md">Save Entity Context</button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 3: MATERIALITY (ISA 320) */}
//         {/* ========================================== */}
//         {activeTab === 'materiality' && (
//           <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
//             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
//               <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
//                 <div><h3 className="text-xl font-bold text-slate-800">Determine Materiality (ISA 320)</h3><p className="text-sm text-slate-500 mt-1">Establish thresholds and document the basis.</p></div>
//                 {materiality.approvedById && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1"/> Approved</span>}
//               </div>

//               {/* Calculator - Living Document, Not Disabled by Approval */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
//                 <div className="space-y-5">
//                   <div><label className="block text-sm font-bold text-slate-700 mb-1">Benchmark</label><select disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm" value={materiality.benchmark || 'Revenue'} onChange={(e) => setMateriality({...materiality, benchmark: e.target.value})}><option>Revenue</option><option>Pre-Tax Income</option><option>Total Assets</option></select></div>
//                   <div><label className="block text-sm font-bold text-slate-700 mb-1">Benchmark Value ($)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm font-mono" value={materiality.benchmarkValue || 0} onChange={(e) => setMateriality({...materiality, benchmarkValue: e.target.value})} /></div>
//                   <div className="grid grid-cols-3 gap-3">
//                     <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Rule (%)</label><input type="number" step="0.1" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.rulePercentage || 1} onChange={(e) => setMateriality({...materiality, rulePercentage: e.target.value})} /></div>
//                     <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Haircut (%)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.performanceHaircut || 75} onChange={(e) => setMateriality({...materiality, performanceHaircut: e.target.value})} /></div>
//                     <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Trivial (%)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.trivialPercentage || 5} onChange={(e) => setMateriality({...materiality, trivialPercentage: e.target.value})} /></div>
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center space-y-6">
//                   <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 border-l-4 border-l-indigo-600"><p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p><p className="text-3xl font-black text-indigo-900 mt-1">${Number(materiality.overallMateriality || 0).toLocaleString()}</p></div>
//                   <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"><p className="text-xs font-bold text-slate-500 uppercase">Performance Materiality</p><p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.performanceMateriality || 0).toLocaleString()}</p></div>
//                   <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"><p className="text-xs font-bold text-slate-500 uppercase">Trivial Threshold</p><p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.trivialThreshold || 0).toLocaleString()}</p></div>
//                 </div>
//               </div>

//               {/* Procedures */}
//               <h4 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Materiality Narratives</h4>
//               <ProcedureBlock title="1. Overall & Group Materiality Assessment" objective="Document overall materiality for the statements as a whole." textValue={materiality.overallMaterialityAssessment} onTextChange={(v: string) => setMateriality({...materiality, overallMaterialityAssessment: v})} fileValue={materiality.overallAttachment} onFileUpload={handleFileUpload(setMateriality, 'overall')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="2. Component Materiality" objective="Ensure component materiality is appropriately derived." textValue={materiality.componentMateriality} onTextChange={(v: string) => setMateriality({...materiality, componentMateriality: v})} fileValue={materiality.componentAttachment} onFileUpload={handleFileUpload(setMateriality, 'component')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="3. Benchmark Basis & Justification" objective="Document basis for selected benchmark and judgments made." textValue={materiality.benchmarkBasis} onTextChange={(v: string) => setMateriality({...materiality, benchmarkBasis: v})} fileValue={materiality.benchmarkBasisAttachment} onFileUpload={handleFileUpload(setMateriality, 'benchmarkBasis')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="4. Supplementary Documentation" objective="Retain alternative benchmarks considered and internal discussions." textValue={materiality.supplementaryDocumentation} onTextChange={(v: string) => setMateriality({...materiality, supplementaryDocumentation: v})} fileValue={materiality.supplementaryAttachment} onFileUpload={handleFileUpload(setMateriality, 'supplementary')} isReadOnly={isReadOnly} />
//               <ProcedureBlock title="5. Revisions & Communications" objective="Document revisions throughout the audit and communications." textValue={materiality.revisionsAndCommunications} onTextChange={(v: string) => setMateriality({...materiality, revisionsAndCommunications: v})} fileValue={materiality.revisionsAttachment} onFileUpload={handleFileUpload(setMateriality, 'revisions')} isReadOnly={isReadOnly} />

//               {!isReadOnly && (
//                 <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-4">
//                   <button onClick={handleSaveMateriality} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Materiality</button>
//                   {!materiality.approvedById && (
//                     <RoleGuard minRole="MANAGER"><button onClick={handleApproveMateriality} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-sm">Approve Materiality</button></RoleGuard>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 4: FRAUD & SPECIAL CONSIDERATIONS */}
//         {/* ========================================== */}
//         {activeTab === 'fraud_special' && (
//           <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            
//             {/* Section A: FRAUD (ISA 240) */}
//             <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
//               <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
//                 <h3 className="text-xl font-bold text-slate-800">1. Fraud Risks (ISA 240)</h3>
//                 {fraud.isFinal && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div><label className="block text-sm font-bold text-slate-700 mb-1">Discussion Date</label><input type="date" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.discussionDate || ''} onChange={(e) => setFraud({...fraud, discussionDate: e.target.value})} /></div>
//                 <div><label className="block text-sm font-bold text-slate-700 mb-1">Participants</label><input type="text" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.participants || ''} onChange={(e) => setFraud({...fraud, participants: e.target.value})} /></div>
//               </div>

//               <ProcedureBlock title="1.1 Team Brainstorming Discussion" objective="Identify where statements may be susceptible to fraud." textValue={fraud.teamDiscussion} onTextChange={(v: string) => setFraud({...fraud, teamDiscussion: v})} fileValue={fraud.teamDiscussionAttachment} onFileUpload={handleFileUpload(setFraud, 'teamDiscussion')} isReadOnly={isReadOnly || fraud.isFinal} />
//               <ProcedureBlock title="1.2 Fraud Lens Assessment" objective="Apply fraud lens when assessing risks at statement/assertion levels." textValue={fraud.fraudLensAssessment} onTextChange={(v: string) => setFraud({...fraud, fraudLensAssessment: v})} fileValue={fraud.fraudLensAttachment} onFileUpload={handleFileUpload(setFraud, 'fraudLens')} isReadOnly={isReadOnly || fraud.isFinal} />
//               <ProcedureBlock title="1.3 Management Override of Controls" objective="Identify risks related to journal entries, estimates, and unusual transactions." textValue={fraud.managementOverride} onTextChange={(v: string) => setFraud({...fraud, managementOverride: v})} fileValue={fraud.managementOverrideAttachment} onFileUpload={handleFileUpload(setFraud, 'managementOverride')} isReadOnly={isReadOnly || fraud.isFinal} />
//               <ProcedureBlock title="1.4 Planned Audit Responses" objective="Plan procedures like journal entry testing and unpredictability." textValue={fraud.plannedFraudProcedures} onTextChange={(v: string) => setFraud({...fraud, plannedFraudProcedures: v})} fileValue={fraud.plannedFraudProceduresAttachment} onFileUpload={handleFileUpload(setFraud, 'plannedFraudProcedures')} isReadOnly={isReadOnly || fraud.isFinal} />
              
//               <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
//                 <label className="flex items-center space-x-3 cursor-pointer">
//                   <input type="checkbox" disabled={isReadOnly || fraud.isFinal} checked={fraud.revenueFraudPresumption} onChange={(e) => setFraud({...fraud, revenueFraudPresumption: e.target.checked})} className="w-5 h-5 text-amber-600 rounded" />
//                   <span className="text-sm font-bold text-amber-900">Revenue Recognition Fraud Presumption Addressed</span>
//                 </label>
//               </div>
//             </div>

//             {/* Section B: SPECIAL CONSIDERATIONS */}
//             <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
//               <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">2. Special Audit Considerations</h3>

//               {/* ISA 250 */}
//               <div className="relative">
//                 <ProcedureBlock title="2.1 Laws and Regulations (ISA 250)" objective="Identify laws affecting financials and plan procedures for noncompliance." textValue={special.lawsAndRegulations} onTextChange={(v: string) => setSpecial({...special, lawsAndRegulations: v})} fileValue={special.lawsAndRegulationsAttachment} onFileUpload={handleFileUpload(setSpecial, 'lawsAndRegulations')} isReadOnly={isReadOnly} />
//                 <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-red-200"><label className="flex items-center space-x-2 text-sm font-bold text-red-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.noclarIdentified} onChange={(e) => setSpecial({...special, noclarIdentified: e.target.checked})} className="rounded text-red-600 w-4 h-4" /><span>NOCLAR Identified?</span></label></div>
//               </div>

//               {/* ISA 550 */}
//               <div className="relative">
//                 <ProcedureBlock title="2.2 Related Parties (ISA 550)" objective="Identify related party transactions and ensure proper disclosure." textValue={special.relatedParties} onTextChange={(v: string) => setSpecial({...special, relatedParties: v})} fileValue={special.relatedPartiesAttachment} onFileUpload={handleFileUpload(setSpecial, 'relatedParties')} isReadOnly={isReadOnly} />
//                 <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-amber-200"><label className="flex items-center space-x-2 text-sm font-bold text-amber-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.unusualTransactions} onChange={(e) => setSpecial({...special, unusualTransactions: e.target.checked})} className="rounded text-amber-600 w-4 h-4" /><span>Unusual Transactions?</span></label></div>
//               </div>

//               {/* ISA 570 */}
//               <div className="relative">
//                 <ProcedureBlock title="2.3 Going Concern (ISA 570)" objective="Evaluate management's assessment of entity's ability to continue." textValue={special.goingConcernAssessment} onTextChange={(v: string) => setSpecial({...special, goingConcernAssessment: v})} fileValue={special.goingConcernAttachment} onFileUpload={handleFileUpload(setSpecial, 'goingConcern')} isReadOnly={isReadOnly} />
//                 <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-red-200"><label className="flex items-center space-x-2 text-sm font-bold text-red-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.goingConcernDoubt} onChange={(e) => setSpecial({...special, goingConcernDoubt: e.target.checked})} className="rounded text-red-600 w-4 h-4" /><span>Material Uncertainty?</span></label></div>
//               </div>

//               {/* ISA 402 */}
//               <div className="relative">
//                 <ProcedureBlock title="2.4 Service Organizations (ISA 402)" objective="Identify services relevant to reporting and controls (e.g., payroll)." textValue={special.serviceOrganizations} onTextChange={(v: string) => setSpecial({...special, serviceOrganizations: v})} fileValue={special.serviceOrganizationsAttachment} onFileUpload={handleFileUpload(setSpecial, 'serviceOrganizations')} isReadOnly={isReadOnly} />
//                 <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-green-200"><label className="flex items-center space-x-2 text-sm font-bold text-green-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.type2ReportAvailable} onChange={(e) => setSpecial({...special, type2ReportAvailable: e.target.checked})} className="rounded text-green-600 w-4 h-4" /><span>Type 2 Report Available?</span></label></div>
//               </div>

//             </div>

//             {!isReadOnly && (
//               <div className="flex justify-end space-x-4 border-t border-slate-200 pt-6">
//                 <button onClick={handleSaveFraudAndSpecial} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Draft</button>
//                 {!fraud.isFinal && <RoleGuard minRole="MANAGER"><button onClick={handleApproveFraud} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md">Approve Fraud Document</button></RoleGuard>}
//               </div>
//             )}
//           </div>
//         )}

//         {/* ========================================== */}
//         {/* TAB 5: RISK REGISTER */}
//         {/* ========================================== */}
//         {activeTab === 'risks' && (
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in h-full flex flex-col">
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h3 className="text-lg font-bold text-slate-800">Risk Register</h3>
//                 <p className="text-sm text-slate-500">Document assessed risks of material misstatement.</p>
//                 <div className="mt-3">
//                   {riskRegisterApproved ? <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✓ Risk Register Approved</div> : <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Draft Risk Register</div>}
//                 </div>
//               </div>
//               {!isReadOnly && (
//                 <div className="flex items-center gap-3">
//                   {!riskRegisterApproved && risks.length > 0 && <button onClick={handleApproveRiskRegister} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center shadow-sm">✓ Approve Register</button>}
//                   <button onClick={() => setIsRiskModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center shadow-sm"><PlusIcon className="w-4 h-4 mr-1" />Add Risk</button>
//                 </div>
//               )}
//             </div>

//             {risks.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
//                 <ShieldExclamationIcon className="w-16 h-16 text-slate-300 mb-4" />
//                 <h4 className="text-lg font-bold text-slate-700">No risks documented yet</h4>
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-4 gap-4 mb-6">
//                   <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Risks</div><div className="text-2xl font-bold text-slate-800 mt-1">{risks.length}</div></div>
//                   <div className="bg-red-50 border border-red-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-red-400 font-bold">Significant Risks</div><div className="text-2xl font-bold text-red-700 mt-1">{risks.filter((r) => r.isSignificant).length}</div></div>
//                   <div className="bg-purple-50 border border-purple-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-purple-400 font-bold">Fraud Risks</div><div className="text-2xl font-bold text-purple-700 mt-1">{risks.filter((r) => r.isFraudRisk).length}</div></div>
//                   <div className="bg-amber-50 border border-amber-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-amber-400 font-bold">High Inherent</div><div className="text-2xl font-bold text-amber-700 mt-1">{risks.filter((r) => r.inherentRisk === 'HIGH').length}</div></div>
//                 </div>

//                 <div className="overflow-x-auto border border-slate-200 rounded-lg">
//                   <table className="min-w-full divide-y divide-slate-200">
//                     <thead className="bg-slate-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
//                         <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
//                         <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Account & Assertion</th>
//                         <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Inherent</th>
//                         <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Control</th>
//                         <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Flags</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-slate-200">
//                       {risks.map((r, idx) => (
//                         <tr key={idx} className="hover:bg-slate-50 transition-colors">
//                           <td className="px-4 py-4 text-sm font-bold text-slate-700">{r.category}</td>
//                           <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">{r.riskDescription}</td>
//                           <td className="px-4 py-4 text-sm text-slate-600"><div className="font-bold">{r.accountArea}</div><div className="text-xs text-slate-400 uppercase tracking-wider">{r.assertion}</div></td>
//                           <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${r.inherentRisk === 'HIGH' ? 'bg-red-100 text-red-700' : r.inherentRisk === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.inherentRisk}</span></td>
//                           <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${r.controlRisk === 'HIGH' ? 'bg-red-100 text-red-700' : r.controlRisk === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.controlRisk}</span></td>
//                           <td className="px-4 py-4 text-center space-x-1">{r.isSignificant && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />}{r.isFraudRisk && <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500" />}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//       </div>

//       {/* Add Risk Modal */}
//       <Transition appear show={isRiskModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={() => setIsRiskModalOpen(false)}>
//           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm" /></Transition.Child>
//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
//                 <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-6 border-b border-slate-200 pb-4">Add Audit Risk</Dialog.Title>
//                   <form onSubmit={handleAddRisk} className="space-y-4">
//                     <div><label className="block text-sm font-bold text-slate-700 mb-1">Risk Description</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.riskDescription} onChange={e => setNewRisk({...newRisk, riskDescription: e.target.value})} /></div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.category} onChange={e => setNewRisk({...newRisk, category: e.target.value})} /></div>
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Account Area</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.accountArea} onChange={e => setNewRisk({...newRisk, accountArea: e.target.value})} /></div>
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Assertion</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.assertion} onChange={e => setNewRisk({...newRisk, assertion: e.target.value})}><option>Existence</option><option>Completeness</option><option>Accuracy</option><option>Cut-off</option><option>Valuation</option></select></div>
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Inherent</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.inherentRisk} onChange={e => setNewRisk({...newRisk, inherentRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Control</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.controlRisk} onChange={e => setNewRisk({...newRisk, controlRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
//                     </div>
//                     <div className="flex space-x-6 pt-2">
//                       <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isSignificant} onChange={e => setNewRisk({...newRisk, isSignificant: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Significant Risk</span></label>
//                       <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isFraudRisk} onChange={e => setNewRisk({...newRisk, isFraudRisk: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Fraud Risk (ISA 240)</span></label>
//                     </div>
//                     <div><label className="block text-sm font-bold text-slate-700 mb-1">Mitigation Plan</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.mitigationPlan} onChange={e => setNewRisk({...newRisk, mitigationPlan: e.target.value})} /></div>
                    
//                     <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-slate-200">
//                       <button type="button" onClick={() => setIsRiskModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold hover:bg-slate-50">Cancel</button>
//                       <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save Risk</button>
//                     </div>
//                   </form>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default PlanningPhase;




// with dashboard

// src/pages/Workspace/PlanningPhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  BuildingOfficeIcon, ScaleIcon, CalculatorIcon, 
  ShieldExclamationIcon, CheckCircleIcon, LockClosedIcon, PlusIcon, RocketLaunchIcon, PaperClipIcon, ShieldCheckIcon, ChartPieIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../utils/api';
import { Engagement } from '../../types';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

// --- NEW TAB ORDER WITH DASHBOARD ---
const TABS = [
  { id: 'dashboard', label: 'Overview', icon: ChartPieIcon },
  { id: 'strategy', label: '1. Audit Strategy (ISA 300)', icon: ScaleIcon },
  { id: 'entity', label: '2. Entity & Context (ISA 315)', icon: BuildingOfficeIcon },
  { id: 'materiality', label: '3. Materiality (ISA 320)', icon: CalculatorIcon },
  { id: 'fraud_special', label: '4. Fraud & Special', icon: ShieldCheckIcon },
  { id: 'risks', label: '5. Risk Register', icon: ShieldExclamationIcon }
];

// --- REUSABLE PROCEDURE COMPONENT ---
const ProcedureBlock = ({ title, objective, textValue, onTextChange, fileValue, onFileUpload, isReadOnly }: any) => {
  return (
    <div className="mb-6 border border-slate-200 rounded-xl p-6 bg-white shadow-sm transition-all hover:shadow-md">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{objective}</p>
      <div className="mb-5">
        <label className="block text-sm font-bold text-slate-700 mb-2">Response / Narrative</label>
        <textarea 
          disabled={isReadOnly}
          className="w-full border-slate-300 rounded-lg p-3 min-h-[100px] shadow-sm disabled:bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={textValue || ''}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Document your understanding here..."
        />
      </div>
      <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
        <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
          <PaperClipIcon className="w-4 h-4 mr-2 text-slate-500" /> Attach Evidence (Optional)
        </label>
        {isReadOnly ? (
          <div className="text-sm text-slate-500 italic">{fileValue ? 'Attachment saved: ' + fileValue : 'No attachment provided'}</div>
        ) : (
          <div className="flex items-center justify-between">
            <input 
              type="file" 
              onChange={(e) => { if (e.target.files && e.target.files[0]) onFileUpload(e.target.files[0]); }}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
            />
            {fileValue && typeof fileValue === 'string' && <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap ml-4">File Attached ✓</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const PlanningPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  
  // Start on the dashboard tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Global Read-Only check
  const isReadOnly = engagement.status !== 'DRAFT' && engagement.status !== 'PLANNING';

  // --- States ---
  const [strategy, setStrategy] = useState<any>({});
  const [entity, setEntity] = useState<any>({});
  const [materiality, setMateriality] = useState<any>({ benchmark: 'Revenue', benchmarkValue: 0, rulePercentage: 1, performanceHaircut: 75, trivialPercentage: 5 });
  const [fraud, setFraud] = useState<any>({ revenueFraudPresumption: true });
  const [special, setSpecial] = useState<any>({});
  const [risks, setRisks] = useState<any[]>([]);
  const [newRisk, setNewRisk] = useState<any>({ 
    riskDescription: '', 
    category: 'Revenue', 
    assertion: 'Cut-off', 
    accountArea: '', 
    riskLevelType: 'HIGH', 
    inherentRisk: 'HIGH', 
    controlRisk: 'MEDIUM', 
    isSignificant: false, 
    isFraudRisk: false, 
    mitigationPlan: '' 
  });
  const [riskRegisterApproved, setRiskRegisterApproved] = useState(false);

  const isReadyToComplete = materiality?.approvedById && strategy?.status === 'FINAL' && fraud?.isFinal && riskRegisterApproved;

  // --- 1. Fetch Dashboard Data ---
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPlanningDashboard(engagement.id);
      const data = res.data;
      if (data.auditStrategy) setStrategy(data.auditStrategy);
      if (data.entityUnderstanding) setEntity(data.entityUnderstanding);
      if (data.materiality) setMateriality(data.materiality);
      if (data.fraudBrainstorming) setFraud({ ...data.fraudBrainstorming, discussionDate: data.fraudBrainstorming.discussionDate ? new Date(data.fraudBrainstorming.discussionDate).toISOString().split('T')[0] : '' });
      if (data.specialConsiderations) setSpecial(data.specialConsiderations);
      if (data.riskAssessments) {
        setRisks(data.riskAssessments);
        setRiskRegisterApproved(data.riskAssessments.some((r: any) => r.status === 'FINAL'));
      }
    } catch (error) { toast.error("Failed to fetch planning dashboard"); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchDashboard(); }, [engagement.id]);

  // --- Error Logging Helper ---
  const extractError = (e: any) => {
    const backendMsg = e.response?.data?.message;
    if (Array.isArray(backendMsg)) return backendMsg.join(', ');
    if (typeof backendMsg === 'string') return backendMsg;
    return e.message || 'An unknown error occurred';
  };

  // --- Generic File Uploader ---
  const handleFileUpload = (setter: any, fieldName: string) => async (file: File) => {
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file); 
      const res = await apiClient.uploadPlanningEvidence(formData);
      const savedPath = res.data?.path || res.path; 
      
      setter((prev: any) => ({ 
        ...prev, 
        [`${fieldName}Attachment`]: savedPath 
      }));
      
      toast.success(`Attached ${file.name} successfully`, { id: toastId });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Failed to upload ${file.name}`, { id: toastId });
    }
  };

  // --- 2. Save Handlers ---
  const handleSaveStrategy = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, approvedAt, approvedById, status, ...safeStrategy } = strategy;
      await apiClient.createAuditStrategy({ engagementId: engagement.id, ...safeStrategy });
      toast.success('Strategy saved as draft');
      fetchDashboard();
    } catch (e: any) { 
      const errorMsg = extractError(e);
      console.error("STRATEGY VALIDATION ERROR:", e.response?.data || e);
      toast.error(`Strategy Error: ${errorMsg}`, { duration: 6000 }); 
    } finally { setSaving(false); }
  };

  const handleApproveStrategy = async () => {
    setSaving(true);
    try {
      await apiClient.approveAuditStrategy(engagement.id, { isFinalized: true });
      toast.success('Strategy Approved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve strategy'); } finally { setSaving(false); }
  };

  const handleSaveEntity = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, engagementId, ...safePayload } = entity;
      await apiClient.updateEntityUnderstanding(engagement.id, safePayload);
      toast.success('Entity context saved');
    } catch (e: any) { 
      const errorMsg = extractError(e);
      console.error("ENTITY VALIDATION ERROR:", e.response?.data || e);
      toast.error(`Entity Error: ${errorMsg}`, { duration: 6000 }); 
    } finally { setSaving(false); }
  };

  const handleSaveMateriality = async () => {
    setSaving(true);
    try {
      const payload = {
        engagementId: engagement.id,
        benchmark: materiality.benchmark || 'Revenue',
        benchmarkValue: Number(materiality.benchmarkValue ?? 0),
        rulePercentage: Number(materiality.rulePercentage ?? 1),
        performanceHaircut: Number(materiality.performanceHaircut ?? 75), 
        trivialPercentage: Number(materiality.trivialPercentage ?? 5),
        overallMaterialityAssessment: materiality.overallMaterialityAssessment,
        componentMateriality: materiality.componentMateriality,
        benchmarkBasis: materiality.benchmarkBasis,
        supplementaryDocumentation: materiality.supplementaryDocumentation,
        revisionsAndCommunications: materiality.revisionsAndCommunications,
        overallAttachment: materiality.overallAttachment,
        componentAttachment: materiality.componentAttachment,
        benchmarkBasisAttachment: materiality.benchmarkBasisAttachment,
        supplementaryAttachment: materiality.supplementaryAttachment,
        revisionsAttachment: materiality.revisionsAttachment
      };

      await apiClient.createMateriality(payload);
      toast.success('Materiality saved successfully');
      fetchDashboard();
    } catch (e: any) { 
      const errorMsg = extractError(e);
      console.error("MATERIALITY ERROR:", e.response?.data || e);
      toast.error(`Materiality Error: ${errorMsg}`, { duration: 6000 })
    } finally { setSaving(false); }
  };

  const handleApproveMateriality = async () => {
    setSaving(true);
    try {
      await apiClient.approveMateriality(engagement.id, { engagementId: engagement.id, isApproved: true });
      toast.success('Materiality Approved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve materiality'); } finally { setSaving(false); }
  };

  const handleSaveFraudAndSpecial = async () => {
    setSaving(true);
    try {
      if (fraud.discussionDate) {
        const fraudPayload = {
          engagementId: engagement.id,
          discussionDate: new Date(fraud.discussionDate).toISOString(),
          participants: fraud.participants,
          teamDiscussion: fraud.teamDiscussion,
          teamDiscussionAttachment: fraud.teamDiscussionAttachment,
          fraudLensAssessment: fraud.fraudLensAssessment,
          fraudLensAttachment: fraud.fraudLensAttachment,
          managementOverride: fraud.managementOverride,
          managementOverrideAttachment: fraud.managementOverrideAttachment,
          plannedFraudProcedures: fraud.plannedFraudProcedures,
          plannedFraudProceduresAttachment: fraud.plannedFraudProceduresAttachment,
          revenueFraudPresumption: fraud.revenueFraudPresumption
        };
        await apiClient.submitFraudBrainstorming(fraudPayload);
      }

      const specialPayload = {
        lawsAndRegulations: special.lawsAndRegulations,
        lawsAndRegulationsAttachment: special.lawsAndRegulationsAttachment,
        noclarIdentified: special.noclarIdentified || false,
        relatedParties: special.relatedParties,
        relatedPartiesAttachment: special.relatedPartiesAttachment,
        unusualTransactions: special.unusualTransactions || false,
        goingConcernAssessment: special.goingConcernAssessment,
        goingConcernAttachment: special.goingConcernAttachment,
        goingConcernDoubt: special.goingConcernDoubt || false,
        serviceOrganizations: special.serviceOrganizations,
        serviceOrganizationsAttachment: special.serviceOrganizationsAttachment,
        type2ReportAvailable: special.type2ReportAvailable || false,
      };

      await apiClient.updateSpecialConsiderations(engagement.id, specialPayload);
      
      toast.success('Fraud & Special Considerations saved');
      fetchDashboard();
    } catch (e: any) { 
      const errorMsg = extractError(e);
      console.error("FRAUD/SPECIAL ERROR:", e.response?.data || e);
      toast.error(`Save Error: ${errorMsg}`, { duration: 6000 });
    } finally { setSaving(false); }
  };

  const handleApproveFraud = async () => {
    setSaving(true);
    try {
      await apiClient.approveFraudBrainstorming(engagement.id, { signOffDate: new Date().toISOString() });
      toast.success('Fraud Brainstorming Approved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve fraud'); } finally { setSaving(false); }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.createPlanningRisk({ engagementId: engagement.id, ...newRisk });
      toast.success('Risk added');
      setIsRiskModalOpen(false);
      fetchDashboard();
    } catch (e: any) { 
      const errorMsg = extractError(e);
      console.error("RISK ERROR:", e.response?.data || e);
      toast.error(`Risk Error: ${errorMsg}`, { duration: 6000 }); 
    }
  };

  const handleApproveRiskRegister = async () => {
    setSaving(true);
    try {
      await apiClient.approveRiskRegister(engagement.id);
      toast.success('Risk Register Approved');
      setRiskRegisterApproved(true);
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve risks'); } finally { setSaving(false); }
  };

  const handleCompletePlanning = async () => {
    setSaving(true);
    try {
      await apiClient.completePlanning(engagement.id);
      toast.success('Planning Phase Completed Successfully');
      fetchDashboard();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to complete planning'); } finally { setSaving(false); }
  };

  // --- Auto Calculate Materiality Effect ---
  useEffect(() => {
    if (materiality.benchmarkValue && materiality.rulePercentage) {
      const overall = (Number(materiality.benchmarkValue) * Number(materiality.rulePercentage)) / 100;
      const perf = (overall * Number(materiality.performanceHaircut || 75)) / 100;
      const trivial = (overall * Number(materiality.trivialPercentage || 5)) / 100;
      setMateriality((prev: any) => ({ ...prev, overallMateriality: overall, performanceMateriality: perf, trivialThreshold: trivial }));
    }
  }, [materiality.benchmarkValue, materiality.rulePercentage, materiality.performanceHaircut, materiality.trivialPercentage]);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  // Calculate Readiness for Dashboard View
  const progressMetrics = [
    { label: 'Strategy', done: strategy?.status === 'FINAL' },
    { label: 'Entity Context', done: !!entity?.id }, // Checked if created in DB
    { label: 'Materiality', done: !!materiality?.approvedById },
    { label: 'Fraud & Special', done: !!fraud?.isFinal },
    { label: 'Risk Register', done: riskRegisterApproved }
  ];
  const completedCount = progressMetrics.filter(p => p.done).length;
  const progressPercent = Math.round((completedCount / progressMetrics.length) * 100);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Planning & Risk Assessment</h2>
              <p className="text-slate-500 mt-1">Develop the audit strategy, set materiality, and identify risks.</p>
            </div>
            <div className="flex items-center space-x-4">
              {!isReadOnly ? (
                <button onClick={handleCompletePlanning} disabled={!isReadyToComplete || saving} className={`flex items-center px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${isReadyToComplete ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
                  <RocketLaunchIcon className="w-5 h-5 mr-2" /> {isReadyToComplete ? 'Complete Planning Phase' : 'Sign-offs Required to Complete'}
                </button>
              ) : (
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold border border-green-200 flex items-center shadow-sm"><CheckCircleIcon className="w-5 h-5 mr-1.5" /> Planning Completed</span>
              )}
            </div>
          </div>
          <nav className="flex space-x-2 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors ${activeTab === tab.id ? 'bg-white text-indigo-700 border-t border-x border-slate-200 shadow-[0_4px_0_0_#fff]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-8 flex-1 bg-white overflow-y-auto">
        
        {/* ========================================== */}
        {/* TAB 0: OVERVIEW DASHBOARD */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            
            {/* Progress Tracker Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Planning Readiness</h3>
                  <p className="text-sm text-slate-500">Complete all sections to unlock the Execution Phase.</p>
                </div>
                <div className="text-2xl font-black text-indigo-700">{progressPercent}%</div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden border border-slate-200">
                <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                {progressMetrics.map((metric, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm ${metric.done ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                      {metric.done ? <CheckCircleIcon className="w-5 h-5" /> : <LockClosedIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-bold ${metric.done ? 'text-slate-800' : 'text-slate-400'}`}>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Materiality Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-slate-600 mb-4"><CalculatorIcon className="w-5 h-5 mr-2" /><h4 className="font-bold">Materiality Snapshot</h4></div>
                  {materiality?.overallMateriality ? (
                    <div className="space-y-4">
                      <div><p className="text-xs font-bold text-slate-500 uppercase">Overall</p><p className="text-2xl font-black text-indigo-900">${Number(materiality.overallMateriality).toLocaleString()}</p></div>
                      <div><p className="text-xs font-bold text-slate-500 uppercase">Performance</p><p className="text-lg font-bold text-slate-700">${Number(materiality.performanceMateriality).toLocaleString()}</p></div>
                      <div><p className="text-xs font-bold text-slate-500 uppercase">Trivial</p><p className="text-lg font-bold text-slate-700">${Number(materiality.trivialThreshold).toLocaleString()}</p></div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm italic">Values not calculated yet. Please complete the Materiality tab.</div>
                  )}
                </div>
                <button onClick={() => setActiveTab('materiality')} className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 text-left">Go to Materiality &rarr;</button>
              </div>

              {/* Risk Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-slate-600 mb-4"><ShieldExclamationIcon className="w-5 h-5 mr-2" /><h4 className="font-bold">Risk Profile</h4></div>
                  {risks.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm font-bold text-slate-600">Total Risks</span><span className="text-sm font-black text-slate-800">{risks.length}</span></div>
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm font-bold text-red-600">Significant Risks</span><span className="text-sm font-black text-red-700">{risks.filter(r => r.isSignificant).length}</span></div>
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm font-bold text-purple-600">Fraud Risks</span><span className="text-sm font-black text-purple-700">{risks.filter(r => r.isFraudRisk).length}</span></div>
                      <div className="flex justify-between"><span className="text-sm font-bold text-amber-600">High Inherent</span><span className="text-sm font-black text-amber-700">{risks.filter(r => r.inherentRisk === 'HIGH').length}</span></div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm italic">No risks added to the register yet.</div>
                  )}
                </div>
                <button onClick={() => setActiveTab('risks')} className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 text-left">View Risk Register &rarr;</button>
              </div>

              {/* Fraud & Special Highlights */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-slate-600 mb-4"><ShieldCheckIcon className="w-5 h-5 mr-2" /><h4 className="font-bold">Key Focus Areas</h4></div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${strategy?.relianceOnControls ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                      <div><p className="text-sm font-bold text-slate-700">Controls Reliance</p><p className="text-xs text-slate-500">{strategy?.relianceOnControls ? 'Planned' : 'Substantive approach'}</p></div>
                    </div>
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${fraud?.revenueFraudPresumption ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                      <div><p className="text-sm font-bold text-slate-700">Revenue Fraud Presumption</p><p className="text-xs text-slate-500">{fraud?.revenueFraudPresumption ? 'Addressed' : 'Not yet addressed'}</p></div>
                    </div>
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${special?.goingConcernDoubt ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                      <div><p className="text-sm font-bold text-slate-700">Going Concern Doubt</p><p className="text-xs text-slate-500">{special?.goingConcernDoubt ? 'Material Uncertainty Identified' : 'None identified'}</p></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveTab('fraud_special')} className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 text-left">Review Special Areas &rarr;</button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 1: STRATEGY (ISA 300) */}
        {/* ========================================== */}
        {activeTab === 'strategy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <div><h3 className="text-xl font-bold text-slate-800">Establish the Overall Audit Strategy</h3><p className="text-sm text-slate-500 mt-1">Set the scope, timing, and direction of the audit.</p></div>
                {strategy.status === 'FINAL' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-4">
                <h4 className="text-md font-bold text-slate-800 mb-2">Executive Summary</h4>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Scope of the Audit</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.scope || ''} onChange={(e) => setStrategy({...strategy, scope: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Reporting Objectives & Timing</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.timing || ''} onChange={(e) => setStrategy({...strategy, timing: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Direction of the Audit</label><textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={strategy.direction || ''} onChange={(e) => setStrategy({...strategy, direction: e.target.value})} /></div>
                </div>
              </div>

              <h4 className="text-md font-bold text-slate-800 mb-4">Detailed Procedures</h4>
              <ProcedureBlock title="1. Define Engagement Reporting Objectives" objective="Confirm reporting deadlines, deliverables, and governance reporting needs." textValue={strategy.reportingObjectives} onTextChange={(v: string) => setStrategy({...strategy, reportingObjectives: v})} fileValue={strategy.reportingObjectivesAttachment} onFileUpload={handleFileUpload(setStrategy, 'reportingObjectives')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
              <ProcedureBlock title="2. Determine Audit Scope" objective="Identify financial statements, disclosures, and components in scope." textValue={strategy.auditScope} onTextChange={(v: string) => setStrategy({...strategy, auditScope: v})} fileValue={strategy.auditScopeAttachment} onFileUpload={handleFileUpload(setStrategy, 'auditScope')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
              
              <div className="relative">
                <ProcedureBlock title="3. Determine Planned Approach" objective="High-level decision on controls-reliant vs substantive-heavy." textValue={strategy.plannedApproach} onTextChange={(v: string) => setStrategy({...strategy, plannedApproach: v})} fileValue={strategy.plannedApproachAttachment} onFileUpload={handleFileUpload(setStrategy, 'plannedApproach')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
                <div className="absolute top-16 right-6 flex space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.relianceOnControls} onChange={(e) => setStrategy({...strategy, relianceOnControls: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Relies on Controls?</span></label>
                  <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.itEnvironmentConsidered} onChange={(e) => setStrategy({...strategy, itEnvironmentConsidered: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Complex IT Env?</span></label>
                </div>
              </div>

              <div className="relative">
                <ProcedureBlock title="4. Resource Planning" objective="Plan staffing levels, timing, and specialist needs." textValue={strategy.resourcePlanning} onTextChange={(v: string) => setStrategy({...strategy, resourcePlanning: v})} fileValue={strategy.resourcePlanningAttachment} onFileUpload={handleFileUpload(setStrategy, 'resourcePlanning')} isReadOnly={isReadOnly || strategy.status === 'FINAL'} />
                <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly || strategy.status === 'FINAL'} checked={strategy.useOfExperts} onChange={(e) => setStrategy({...strategy, useOfExperts: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /><span>Use of Experts?</span></label>
                </div>
              </div>

              {!isReadOnly && strategy.status !== 'FINAL' && (
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button onClick={handleSaveStrategy} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Strategy</button>
                  <RoleGuard minRole="MANAGER"><button onClick={handleApproveStrategy} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center"><LockClosedIcon className="w-4 h-4 mr-2" /> Approve Strategy</button></RoleGuard>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: ENTITY UNDERSTANDING (ISA 315) */}
        {/* ========================================== */}
        {activeTab === 'entity' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6 border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Obtain an Understanding of the Entity and Its Environment</h3>
                <p className="text-slate-500 text-sm mt-1">Respond to each procedure and attach relevant evidence.</p>
              </div>

              <ProcedureBlock title="1. Business Model and Operations" objective="Obtain an overview of how the entity creates value, sources of revenue, and key processes." textValue={entity.businessModel} onTextChange={(v: string) => setEntity({...entity, businessModel: v})} fileValue={entity.businessModelAttachment} onFileUpload={handleFileUpload(setEntity, 'businessModel')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="2. Ownership and Governance Structure" objective="Identify ownership structure and oversight of financial reporting." textValue={entity.governanceStructure} onTextChange={(v: string) => setEntity({...entity, governanceStructure: v})} fileValue={entity.governanceAttachment} onFileUpload={handleFileUpload(setEntity, 'governance')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="3. Industry Conditions and Environment" objective="Identify industry trends, competitive pressures, and constraints." textValue={entity.industryConditions} onTextChange={(v: string) => setEntity({...entity, industryConditions: v})} fileValue={entity.industryConditionsAttachment} onFileUpload={handleFileUpload(setEntity, 'industryConditions')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="4. Applicable Financial Reporting Framework" objective="Identify the framework and significant accounting policies." textValue={entity.financialReportingFramework} onTextChange={(v: string) => setEntity({...entity, financialReportingFramework: v})} fileValue={entity.financialReportingAttachment} onFileUpload={handleFileUpload(setEntity, 'financialReporting')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="5. Regulatory Environment" objective="Identify laws, regulations, and oversight bodies affecting financials." textValue={entity.regulatoryFramework} onTextChange={(v: string) => setEntity({...entity, regulatoryFramework: v})} fileValue={entity.regulatoryFrameworkAttachment} onFileUpload={handleFileUpload(setEntity, 'regulatoryFramework')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="6. IT Systems Relevant to Financial Reporting" objective="Understand systems used to process and report transactions." textValue={entity.itSystems} onTextChange={(v: string) => setEntity({...entity, itSystems: v})} fileValue={entity.itSystemsAttachment} onFileUpload={handleFileUpload(setEntity, 'itSystems')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="7. High-Level Internal Controls" objective="Identify relevant entity-level controls addressing risks." textValue={entity.internalControls} onTextChange={(v: string) => setEntity({...entity, internalControls: v})} fileValue={entity.internalControlsAttachment} onFileUpload={handleFileUpload(setEntity, 'internalControls')} isReadOnly={isReadOnly} />

              {!isReadOnly && (
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button onClick={handleSaveEntity} disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md">Save Entity Context</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: MATERIALITY (ISA 320) */}
        {/* ========================================== */}
        {activeTab === 'materiality' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div><h3 className="text-xl font-bold text-slate-800">Determine Materiality (ISA 320)</h3><p className="text-sm text-slate-500 mt-1">Establish thresholds and document the basis.</p></div>
                {materiality.approvedById && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>

              {/* Calculator - Living Document, Not Disabled by Approval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-5">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Benchmark</label><select disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm" value={materiality.benchmark || 'Revenue'} onChange={(e) => setMateriality({...materiality, benchmark: e.target.value})}><option>Revenue</option><option>Pre-Tax Income</option><option>Total Assets</option></select></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Benchmark Value ($)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm font-mono" value={materiality.benchmarkValue || 0} onChange={(e) => setMateriality({...materiality, benchmarkValue: e.target.value})} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Rule (%)</label><input type="number" step="0.1" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.rulePercentage || 1} onChange={(e) => setMateriality({...materiality, rulePercentage: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Haircut (%)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.performanceHaircut || 75} onChange={(e) => setMateriality({...materiality, performanceHaircut: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Trivial (%)</label><input type="number" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm text-sm" value={materiality.trivialPercentage || 5} onChange={(e) => setMateriality({...materiality, trivialPercentage: e.target.value})} /></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 border-l-4 border-l-indigo-600"><p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p><p className="text-3xl font-black text-indigo-900 mt-1">${Number(materiality.overallMateriality || 0).toLocaleString()}</p></div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"><p className="text-xs font-bold text-slate-500 uppercase">Performance Materiality</p><p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.performanceMateriality || 0).toLocaleString()}</p></div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"><p className="text-xs font-bold text-slate-500 uppercase">Trivial Threshold</p><p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.trivialThreshold || 0).toLocaleString()}</p></div>
                </div>
              </div>

              {/* Procedures */}
              <h4 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Materiality Narratives</h4>
              <ProcedureBlock title="1. Overall & Group Materiality Assessment" objective="Document overall materiality for the statements as a whole." textValue={materiality.overallMaterialityAssessment} onTextChange={(v: string) => setMateriality({...materiality, overallMaterialityAssessment: v})} fileValue={materiality.overallAttachment} onFileUpload={handleFileUpload(setMateriality, 'overall')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="2. Component Materiality" objective="Ensure component materiality is appropriately derived." textValue={materiality.componentMateriality} onTextChange={(v: string) => setMateriality({...materiality, componentMateriality: v})} fileValue={materiality.componentAttachment} onFileUpload={handleFileUpload(setMateriality, 'component')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="3. Benchmark Basis & Justification" objective="Document basis for selected benchmark and judgments made." textValue={materiality.benchmarkBasis} onTextChange={(v: string) => setMateriality({...materiality, benchmarkBasis: v})} fileValue={materiality.benchmarkBasisAttachment} onFileUpload={handleFileUpload(setMateriality, 'benchmarkBasis')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="4. Supplementary Documentation" objective="Retain alternative benchmarks considered and internal discussions." textValue={materiality.supplementaryDocumentation} onTextChange={(v: string) => setMateriality({...materiality, supplementaryDocumentation: v})} fileValue={materiality.supplementaryAttachment} onFileUpload={handleFileUpload(setMateriality, 'supplementary')} isReadOnly={isReadOnly} />
              <ProcedureBlock title="5. Revisions & Communications" objective="Document revisions throughout the audit and communications." textValue={materiality.revisionsAndCommunications} onTextChange={(v: string) => setMateriality({...materiality, revisionsAndCommunications: v})} fileValue={materiality.revisionsAttachment} onFileUpload={handleFileUpload(setMateriality, 'revisions')} isReadOnly={isReadOnly} />

              {!isReadOnly && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-4">
                  <button onClick={handleSaveMateriality} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Materiality</button>
                  {!materiality.approvedById && (
                    <RoleGuard minRole="MANAGER"><button onClick={handleApproveMateriality} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-sm">Approve Materiality</button></RoleGuard>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: FRAUD & SPECIAL CONSIDERATIONS */}
        {/* ========================================== */}
        {activeTab === 'fraud_special' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            
            {/* Section A: FRAUD (ISA 240) */}
            <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-800">1. Fraud Risks (ISA 240)</h3>
                {fraud.isFinal && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Discussion Date</label><input type="date" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.discussionDate || ''} onChange={(e) => setFraud({...fraud, discussionDate: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Participants</label><input type="text" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.participants || ''} onChange={(e) => setFraud({...fraud, participants: e.target.value})} /></div>
              </div>

              <ProcedureBlock title="1.1 Team Brainstorming Discussion" objective="Identify where statements may be susceptible to fraud." textValue={fraud.teamDiscussion} onTextChange={(v: string) => setFraud({...fraud, teamDiscussion: v})} fileValue={fraud.teamDiscussionAttachment} onFileUpload={handleFileUpload(setFraud, 'teamDiscussion')} isReadOnly={isReadOnly || fraud.isFinal} />
              <ProcedureBlock title="1.2 Fraud Lens Assessment" objective="Apply fraud lens when assessing risks at statement/assertion levels." textValue={fraud.fraudLensAssessment} onTextChange={(v: string) => setFraud({...fraud, fraudLensAssessment: v})} fileValue={fraud.fraudLensAttachment} onFileUpload={handleFileUpload(setFraud, 'fraudLens')} isReadOnly={isReadOnly || fraud.isFinal} />
              <ProcedureBlock title="1.3 Management Override of Controls" objective="Identify risks related to journal entries, estimates, and unusual transactions." textValue={fraud.managementOverride} onTextChange={(v: string) => setFraud({...fraud, managementOverride: v})} fileValue={fraud.managementOverrideAttachment} onFileUpload={handleFileUpload(setFraud, 'managementOverride')} isReadOnly={isReadOnly || fraud.isFinal} />
              <ProcedureBlock title="1.4 Planned Audit Responses" objective="Plan procedures like journal entry testing and unpredictability." textValue={fraud.plannedFraudProcedures} onTextChange={(v: string) => setFraud({...fraud, plannedFraudProcedures: v})} fileValue={fraud.plannedFraudProceduresAttachment} onFileUpload={handleFileUpload(setFraud, 'plannedFraudProcedures')} isReadOnly={isReadOnly || fraud.isFinal} />
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" disabled={isReadOnly || fraud.isFinal} checked={fraud.revenueFraudPresumption} onChange={(e) => setFraud({...fraud, revenueFraudPresumption: e.target.checked})} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-sm font-bold text-amber-900">Revenue Recognition Fraud Presumption Addressed</span>
                </label>
              </div>
            </div>

            {/* Section B: SPECIAL CONSIDERATIONS */}
            <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">2. Special Audit Considerations</h3>

              {/* ISA 250 */}
              <div className="relative">
                <ProcedureBlock title="2.1 Laws and Regulations (ISA 250)" objective="Identify laws affecting financials and plan procedures for noncompliance." textValue={special.lawsAndRegulations} onTextChange={(v: string) => setSpecial({...special, lawsAndRegulations: v})} fileValue={special.lawsAndRegulationsAttachment} onFileUpload={handleFileUpload(setSpecial, 'lawsAndRegulations')} isReadOnly={isReadOnly} />
                <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-red-200"><label className="flex items-center space-x-2 text-sm font-bold text-red-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.noclarIdentified} onChange={(e) => setSpecial({...special, noclarIdentified: e.target.checked})} className="rounded text-red-600 w-4 h-4" /><span>NOCLAR Identified?</span></label></div>
              </div>

              {/* ISA 550 */}
              <div className="relative">
                <ProcedureBlock title="2.2 Related Parties (ISA 550)" objective="Identify related party transactions and ensure proper disclosure." textValue={special.relatedParties} onTextChange={(v: string) => setSpecial({...special, relatedParties: v})} fileValue={special.relatedPartiesAttachment} onFileUpload={handleFileUpload(setSpecial, 'relatedParties')} isReadOnly={isReadOnly} />
                <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-amber-200"><label className="flex items-center space-x-2 text-sm font-bold text-amber-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.unusualTransactions} onChange={(e) => setSpecial({...special, unusualTransactions: e.target.checked})} className="rounded text-amber-600 w-4 h-4" /><span>Unusual Transactions?</span></label></div>
              </div>

              {/* ISA 570 */}
              <div className="relative">
                <ProcedureBlock title="2.3 Going Concern (ISA 570)" objective="Evaluate management's assessment of entity's ability to continue." textValue={special.goingConcernAssessment} onTextChange={(v: string) => setSpecial({...special, goingConcernAssessment: v})} fileValue={special.goingConcernAttachment} onFileUpload={handleFileUpload(setSpecial, 'goingConcern')} isReadOnly={isReadOnly} />
                <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-red-200"><label className="flex items-center space-x-2 text-sm font-bold text-red-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.goingConcernDoubt} onChange={(e) => setSpecial({...special, goingConcernDoubt: e.target.checked})} className="rounded text-red-600 w-4 h-4" /><span>Material Uncertainty?</span></label></div>
              </div>

              {/* ISA 402 */}
              <div className="relative">
                <ProcedureBlock title="2.4 Service Organizations (ISA 402)" objective="Identify services relevant to reporting and controls (e.g., payroll)." textValue={special.serviceOrganizations} onTextChange={(v: string) => setSpecial({...special, serviceOrganizations: v})} fileValue={special.serviceOrganizationsAttachment} onFileUpload={handleFileUpload(setSpecial, 'serviceOrganizations')} isReadOnly={isReadOnly} />
                <div className="absolute top-16 right-6 bg-slate-50 p-2 rounded-lg border border-green-200"><label className="flex items-center space-x-2 text-sm font-bold text-green-700 cursor-pointer"><input type="checkbox" disabled={isReadOnly} checked={special.type2ReportAvailable} onChange={(e) => setSpecial({...special, type2ReportAvailable: e.target.checked})} className="rounded text-green-600 w-4 h-4" /><span>Type 2 Report Available?</span></label></div>
              </div>

            </div>

            {!isReadOnly && (
              <div className="flex justify-end space-x-4 border-t border-slate-200 pt-6">
                <button onClick={handleSaveFraudAndSpecial} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Draft</button>
                {!fraud.isFinal && <RoleGuard minRole="MANAGER"><button onClick={handleApproveFraud} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md">Approve Fraud Document</button></RoleGuard>}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: RISK REGISTER */}
        {/* ========================================== */}
        {activeTab === 'risks' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Risk Register</h3>
                <p className="text-sm text-slate-500">Document assessed risks of material misstatement.</p>
                <div className="mt-3">
                  {riskRegisterApproved ? <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✓ Risk Register Approved</div> : <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Draft Risk Register</div>}
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-3">
                  {!riskRegisterApproved && risks.length > 0 && <button onClick={handleApproveRiskRegister} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center shadow-sm">✓ Approve Register</button>}
                  <button onClick={() => setIsRiskModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center shadow-sm"><PlusIcon className="w-4 h-4 mr-1" />Add Risk</button>
                </div>
              )}
            </div>

            {risks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <ShieldExclamationIcon className="w-16 h-16 text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-700">No risks documented yet</h4>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Risks</div><div className="text-2xl font-bold text-slate-800 mt-1">{risks.length}</div></div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-red-400 font-bold">Significant Risks</div><div className="text-2xl font-bold text-red-700 mt-1">{risks.filter((r) => r.isSignificant).length}</div></div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-purple-400 font-bold">Fraud Risks</div><div className="text-2xl font-bold text-purple-700 mt-1">{risks.filter((r) => r.isFraudRisk).length}</div></div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4"><div className="text-xs uppercase tracking-wider text-amber-400 font-bold">High Inherent</div><div className="text-2xl font-bold text-amber-700 mt-1">{risks.filter((r) => r.inherentRisk === 'HIGH').length}</div></div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Account & Assertion</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Inherent</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Control</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Flags</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {risks.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 text-sm font-bold text-slate-700">{r.category}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">{r.riskDescription}</td>
                          <td className="px-4 py-4 text-sm text-slate-600"><div className="font-bold">{r.accountArea}</div><div className="text-xs text-slate-400 uppercase tracking-wider">{r.assertion}</div></td>
                          <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${r.inherentRisk === 'HIGH' ? 'bg-red-100 text-red-700' : r.inherentRisk === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.inherentRisk}</span></td>
                          <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${r.controlRisk === 'HIGH' ? 'bg-red-100 text-red-700' : r.controlRisk === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.controlRisk}</span></td>
                          <td className="px-4 py-4 text-center space-x-1">{r.isSignificant && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />}{r.isFraudRisk && <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Add Risk Modal */}
      <Transition appear show={isRiskModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsRiskModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm" /></Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-6 border-b border-slate-200 pb-4">Add Audit Risk</Dialog.Title>
                  <form onSubmit={handleAddRisk} className="space-y-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Risk Description</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.riskDescription} onChange={e => setNewRisk({...newRisk, riskDescription: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.category} onChange={e => setNewRisk({...newRisk, category: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Account Area</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.accountArea} onChange={e => setNewRisk({...newRisk, accountArea: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Assertion</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.assertion} onChange={e => setNewRisk({...newRisk, assertion: e.target.value})}><option>Existence</option><option>Completeness</option><option>Accuracy</option><option>Cut-off</option><option>Valuation</option></select></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Inherent</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.inherentRisk} onChange={e => setNewRisk({...newRisk, inherentRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Control</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.controlRisk} onChange={e => setNewRisk({...newRisk, controlRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
                    </div>
                    <div className="flex space-x-6 pt-2">
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isSignificant} onChange={e => setNewRisk({...newRisk, isSignificant: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Significant Risk</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isFraudRisk} onChange={e => setNewRisk({...newRisk, isFraudRisk: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Fraud Risk (ISA 240)</span></label>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Mitigation Plan</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.mitigationPlan} onChange={e => setNewRisk({...newRisk, mitigationPlan: e.target.value})} /></div>
                    
                    <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-slate-200">
                      <button type="button" onClick={() => setIsRiskModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save Risk</button>
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

export default PlanningPhase;