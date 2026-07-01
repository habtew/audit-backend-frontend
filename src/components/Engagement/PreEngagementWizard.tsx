// import React, { useState, useEffect } from 'react';
// import { Dialog } from '@headlessui/react';
// import { 
//   CheckCircleIcon, 
//   ShieldCheckIcon, 
//   DocumentTextIcon, 
//   UserGroupIcon, 
//   BanknotesIcon 
// } from '@heroicons/react/24/outline';
// import { useForm } from 'react-hook-form';
// import api from '../../utils/api';
// import toast from 'react-hot-toast';
// import { Client, PreEngagement } from '../../types';

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void; // Called when final engagement is created
//   clients: Client[];
// }

// const steps = [
//   { id: 1, name: 'Client Info', icon: UserGroupIcon },
//   { id: 2, name: 'Independence', icon: ShieldCheckIcon },
//   { id: 3, name: 'Risk Check', icon: DocumentTextIcon },
//   { id: 4, name: 'Terms', icon: BanknotesIcon },
//   { id: 5, name: 'Finalize', icon: CheckCircleIcon },
// ];

// const PreEngagementWizard: React.FC<Props> = ({ isOpen, onClose, onSuccess, clients }) => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [preEngagement, setPreEngagement] = useState<PreEngagement | null>(null);

//   // Forms for each step
//   const step1Form = useForm(); // Basic Info
//   const step2Form = useForm(); // Independence
//   const step3Form = useForm(); // Risk
//   const step4Form = useForm(); // Terms
//   const step5Form = useForm(); // Final Engagement Creation

//   // --- Step 1: Create Draft ---
//   const handleStep1 = async (data: any) => {
//     setLoading(true);
//     try {
//       const res = await api.createPreEngagement({
//         clientId: data.clientId,
//         financialFramework: data.financialFramework || "IFRS",
//         auditPeriodStart: new Date(data.auditPeriodStart).toISOString(),
//         auditPeriodEnd: new Date(data.auditPeriodEnd).toISOString(),
//       });
//       setPreEngagement(res.data);
//       setCurrentStep(2);
//       toast.success("Draft Created");
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Failed to start");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 2: Independence ---
//   const handleStep2 = async (data: any) => {
//     if (!preEngagement) return;
//     setLoading(true);
//     try {
//       await api.declareIndependence(preEngagement.id, {
//         isIndependent: true,
//         safeguardsApplied: data.safeguardsApplied || "No prior relationship."
//       });
//       setCurrentStep(3);
//       toast.success("Independence Declared");
//     } catch (e) {
//       toast.error("Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 3: Risk Assessment ---
//   const handleStep3 = async (data: any) => {
//     if (!preEngagement) return;
//     setLoading(true);
//     try {
//       await api.patchPreEngagementAssessment(preEngagement.id, {
//         integrityCheckResult: data.integrityCheckResult,
//         competenceCheckResult: data.competenceCheckResult,
//         managementAcknowledged: true
//       });
//       setCurrentStep(4);
//       toast.success("Risk Assessment Updated");
//     } catch (e) {
//       toast.error("Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 4: Terms & Approval ---
//   const handleStep4 = async (data: any) => {
//     if (!preEngagement) return;
//     setLoading(true);
//     try {
//       // 1. Save Terms
//       await api.updatePreEngagementTerms(preEngagement.id, {
//         agreedFee: Number(data.agreedFee),
//         currency: data.currency || "USD",
//         termsAgreed: true
//       });
      
//       // 2. Approve (Auto-approve for demo/partner)
//       await api.reviewPreEngagement(preEngagement.id, 'APPROVED');
      
//       setCurrentStep(5);
//       toast.success("Pre-Engagement Approved!");
//     } catch (e) {
//       toast.error("Failed to approve");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 5: Create Actual Engagement ---
//   const handleStep5 = async (data: any) => {
//     if (!preEngagement) return;
//     setLoading(true);
//     try {
//       // Backend automatically links if we provide correct data? 
//       // User prompt shows create engagement takes clientId. 
//       // Ideally backend links via logic or we pass preEngagementId if supported.
//       // Based on prompt, we just call create engagement normally now that pre-reqs are met.
      
//       await api.createEngagement({
//         clientId: preEngagement.clientId,
//         name: data.name,
//         description: data.description,
//         type: data.type || "AUDIT",
//         yearEnd: preEngagement.auditPeriodEnd, // Use same year end
//         startDate: preEngagement.auditPeriodStart,
//         endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
//         budgetHours: Number(data.budgetHours)
//       });
      
//       toast.success("Engagement Created Successfully!");
//       onSuccess();
//       onClose();
//     } catch (e) {
//       toast.error("Failed to create engagement");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <Dialog as="div" className="relative z-50" open={isOpen} onClose={() => {}}>
//       <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-900">New Engagement Workflow</h2>
//             <div className="mt-4 flex items-center justify-between relative">
//               <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
//               {steps.map((step) => {
//                 const isCompleted = step.id < currentStep;
//                 const isCurrent = step.id === currentStep;
//                 return (
//                   <div key={step.id} className={`flex flex-col items-center bg-white px-2 ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
//                     <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-indigo-600 bg-indigo-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
//                       <step.icon className="h-4 w-4" />
//                     </div>
//                     <span className="text-xs mt-1 font-medium">{step.name}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="mt-6">
//             {currentStep === 1 && (
//               <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
//                 <h3 className="text-lg font-medium">Step 1: Client & Period</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2">
//                     <label className="label">Client</label>
//                     <select {...step1Form.register('clientId')} required className="input">
//                       <option value="">Select Client...</option>
//                       {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="label">Start Date</label>
//                     <input type="date" {...step1Form.register('auditPeriodStart')} required className="input" />
//                   </div>
//                   <div>
//                     <label className="label">End Date</label>
//                     <input type="date" {...step1Form.register('auditPeriodEnd')} required className="input" />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="label">Framework</label>
//                     <select {...step1Form.register('financialFramework')} className="input">
//                       <option value="IFRS">IFRS</option>
//                       <option value="GAAP">GAAP</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
//                   <button type="submit" disabled={loading} className="btn-primary">Create Draft</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 2 && (
//               <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
//                 <h3 className="text-lg font-medium">Step 2: Independence Declaration</h3>
//                 <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
//                   Review the firm's independence policy. Confirm there are no conflicts of interest.
//                 </div>
//                 <div>
//                   <label className="label">Safeguards Applied</label>
//                   <textarea 
//                     {...step2Form.register('safeguardsApplied')} 
//                     defaultValue="No prior relationship with client."
//                     className="input" 
//                     rows={3}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                    <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
//                    <span className="text-sm">I declare that I am independent of this client.</span>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button type="submit" disabled={loading} className="btn-primary">Confirm Independence</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 3 && (
//               <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
//                 <h3 className="text-lg font-medium">Step 3: Risk Assessment</h3>
//                 <div>
//                   <label className="label">Integrity Check Result</label>
//                   <input {...step3Form.register('integrityCheckResult')} defaultValue="Background checks clear." className="input" />
//                 </div>
//                 <div>
//                   <label className="label">Competence Check Result</label>
//                   <input {...step3Form.register('competenceCheckResult')} defaultValue="Firm has capacity and expertise." className="input" />
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button type="submit" disabled={loading} className="btn-primary">Submit Assessment</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 4 && (
//               <form onSubmit={step4Form.handleSubmit(handleStep4)} className="space-y-4">
//                 <h3 className="text-lg font-medium">Step 4: Terms & Approval</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="label">Agreed Fee</label>
//                     <input type="number" {...step4Form.register('agreedFee')} required className="input" />
//                   </div>
//                   <div>
//                     <label className="label">Currency</label>
//                     <select {...step4Form.register('currency')} className="input">
//                       <option value="USD">USD</option>
//                       <option value="ETB">ETB</option>
//                       <option value="EUR">EUR</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 mt-4">
//                    <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
//                    <span className="text-sm">Client has agreed to the Engagement Letter terms.</span>
//                 </div>
//                 <div className="flex justify-end gap-2 mt-4">
//                   <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve Pre-Engagement</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 5 && (
//               <form onSubmit={step5Form.handleSubmit(handleStep5)} className="space-y-4">
//                 <h3 className="text-lg font-bold text-green-700">✓ Pre-Engagement Approved</h3>
//                 <p className="text-sm text-gray-500">You can now create the final Engagement file.</p>
                
//                 <div>
//                   <label className="label">Engagement Name</label>
//                   <input {...step5Form.register('name')} required className="input" placeholder="e.g. Audit 2025 - Financials" />
//                 </div>
//                 <div>
//                   <label className="label">Description</label>
//                   <input {...step5Form.register('description')} className="input" placeholder="Statutory Financial Audit" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                      <label className="label">Type</label>
//                      <select {...step5Form.register('type')} className="input">
//                        <option value="AUDIT">Audit</option>
//                        <option value="REVIEW">Review</option>
//                      </select>
//                   </div>
//                   <div>
//                     <label className="label">Budget Hours</label>
//                     <input type="number" {...step5Form.register('budgetHours')} defaultValue={150} className="input" />
//                   </div>
//                    <div>
//                     <label className="label">Planned End Date</label>
//                     <input type="date" {...step5Form.register('endDate')} required className="input" />
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2 mt-4">
//                   <button type="submit" disabled={loading} className="btn-primary w-full">Create Engagement File</button>
//                 </div>
//               </form>
//             )}

//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default PreEngagementWizard;


// import React, { useState } from 'react';
// import { Dialog } from '@headlessui/react';
// import { 
//   CheckCircleIcon, 
//   ShieldCheckIcon, 
//   DocumentTextIcon, 
//   UserGroupIcon, 
//   BanknotesIcon,
//   DocumentArrowUpIcon
// } from '@heroicons/react/24/outline';
// import { useForm } from 'react-hook-form';
// import api from '../../utils/api';
// import toast from 'react-hot-toast';
// import { Client, PreEngagement } from '../../types';

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   clients: Client[];
// }

// const steps = [
//   { id: 1, name: 'Client Info', icon: UserGroupIcon },
//   { id: 2, name: 'Independence', icon: ShieldCheckIcon },
//   { id: 3, name: 'Risk Check', icon: DocumentTextIcon },
//   { id: 4, name: 'Terms', icon: BanknotesIcon },
//   { id: 5, name: 'Finalize', icon: CheckCircleIcon },
// ];

// const PreEngagementWizard: React.FC<Props> = ({ isOpen, onClose, onSuccess, clients }) => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [preId, setPreId] = useState<string | null>(null);
  
//   // State for procedures and file uploads
//   const [procedures, setProcedures] = useState<any[]>([]);
//   const [termsFile, setTermsFile] = useState<File | null>(null);

//   const step1Form = useForm();
//   const step2Form = useForm();
//   const step3Form = useForm();
//   const step4Form = useForm();

//   // --- Step 1: Create Draft & Generate Procedures ---
//   const handleStep1 = async (data: any) => {
//     setLoading(true);
//     try {
//       const res: any = await api.initiatePreEngagement({
//         clientId: data.clientId,
//         financialFramework: data.financialFramework || "IFRS",
//         auditPeriodStart: new Date(data.auditPeriodStart).toISOString(),
//         auditPeriodEnd: new Date(data.auditPeriodEnd).toISOString(),
//       });
      
//       const newPreId = res.data?.id || res.id;
//       setPreId(newPreId);
      
//       // Fetch the newly generated procedures
//       const fresh: any = await api.getPreEngagementById(newPreId);
//       if (fresh.data?.procedureResponses) {
//         setProcedures(fresh.data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
//       }

//       setCurrentStep(2);
//       toast.success("Draft Created");
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Failed to start");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 2: Independence & Procedures ---
//   const handleStep2 = async (isIndependentDecision: boolean) => {
//     if (!preId) return;
//     setLoading(true);
//     try {
//       const formValues = step2Form.getValues();

//       // 1. Submit Individual Independence Declaration
//       try {
//         await api.submitIndependence(preId, {
//           isIndependent: isIndependentDecision,
//           threatsIdentified: formValues.threatsIdentified || '',
//           safeguardsApplied: formValues.safeguardsApplied || ''
//         });
//       } catch (e: any) {
//         const msg = e.response?.data?.message || '';
//         if (!msg.toString().toLowerCase().includes('already')) throw e; // Ignore duplicates
//       }

//       // 2. Upload and Save Dirty Procedures
//       let proceduresSaved = 0;
//       for (const proc of procedures) {
//         if (proc.isDirty) {
//           const formData = new FormData();
//           if (proc.response) formData.append('response', proc.response);
//           if (proc.file) formData.append('file', proc.file);

//           await api.answerProcedure(preId, proc.id, formData);
//           proceduresSaved++;
//         }
//       }

//       toast.success(isIndependentDecision ? "Independence Confirmed" : "Engagement Declined");
//       setCurrentStep(3);
//     } catch (e) {
//       toast.error("Failed to save independence");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 3: Risk Assessment (Compliance) ---
//   const handleStep3 = async (data: any) => {
//     if (!preId) return;
//     setLoading(true);
//     try {
//       await api.updateComplianceCheck(preId, {
//         integrityConclusion: data.integrityConclusion,
//         competenceConclusion: data.competenceConclusion,
//         backgroundChecksClear: true,
//         firmHasTechnicalExpertise: true,
//         clientGrantedPermission: true,
//         predecessorCommunicated: true,
//         operationsUnderstood: true
//       });
//       setCurrentStep(4);
//       toast.success("Risk Assessment Updated");
//     } catch (e) {
//       toast.error("Failed to update risk assessment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 4: Terms & File Upload ---
//   const handleStep4 = async (data: any) => {
//     if (!preId) return;
//     if (!termsFile) {
//       toast.error("Please upload the signed engagement letter.");
//       return;
//     }
//     setLoading(true);
//     try {
//       // 1. Upload File
//       const formData = new FormData();
//       formData.append('file', termsFile);
//       const uploadRes: any = await api.uploadFile(formData);
//       const fileUrl = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.url;

//       // 2. Save Terms
//       await api.updateTerms(preId, {
//         agreedFee: Number(data.agreedFee),
//         currency: data.currency || "USD",
//         termsAgreed: true,
//         managementAcknowledged: true,
//         engagementLetterUrl: fileUrl,
//         engagementLetterDate: new Date().toISOString()
//       });
      
//       setCurrentStep(5);
//       toast.success("Terms & Letter Saved!");
//     } catch (e) {
//       toast.error("Failed to save terms");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 5: Final Partner Sign-Off (Auto-generates workspace) ---
//   const handleStep5 = async () => {
//     if (!preId) return;
//     setLoading(true);
//     try {
//       await api.signOffPreEngagement(preId, {
//         isAccepted: true,
//         continuanceNotes: "All checks cleared via wizard."
//       });
      
//       toast.success("Engagement accepted & workspace generated!");
//       onSuccess();
//       onClose();
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Failed to accept engagement");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <Dialog as="div" className="relative z-50" open={isOpen} onClose={() => {}}>
//       <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
          
//           {/* Header */}
//           <div className="p-6 border-b border-gray-100 shrink-0">
//             <h2 className="text-xl font-bold text-gray-900">New Engagement Setup</h2>
//             <div className="mt-6 flex items-center justify-between relative">
//               <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
//               {steps.map((step) => {
//                 const isCompleted = step.id < currentStep;
//                 const isCurrent = step.id === currentStep;
//                 return (
//                   <div key={step.id} className={`flex flex-col items-center bg-white px-2 ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
//                     <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-indigo-600 bg-indigo-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
//                       {isCompleted ? <CheckCircleIcon className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
//                     </div>
//                     <span className="text-[10px] uppercase font-bold mt-2">{step.name}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Scrollable Body */}
//           <div className="p-6 overflow-y-auto flex-1">
            
//             {currentStep === 1 && (
//               <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
//                 <h3 className="text-lg font-bold">1. Client & Framework</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2">
//                     <label className="block text-sm font-bold text-slate-700 mb-1">Select Client</label>
//                     <select {...step1Form.register('clientId')} required className="w-full border-slate-300 rounded-lg">
//                       <option value="">Select...</option>
//                       {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-slate-700 mb-1">Period Start</label>
//                     <input type="date" {...step1Form.register('auditPeriodStart')} required className="w-full border-slate-300 rounded-lg" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-slate-700 mb-1">Period End</label>
//                     <input type="date" {...step1Form.register('auditPeriodEnd')} required className="w-full border-slate-300 rounded-lg" />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="block text-sm font-bold text-slate-700 mb-1">Accounting Framework</label>
//                     <select {...step1Form.register('financialFramework')} className="w-full border-slate-300 rounded-lg">
//                       <option value="IFRS">IFRS</option>
//                       <option value="IFRS_SME">IFRS for SMEs</option>
//                       <option value="IPSAS">IPSAS</option>
//                       <option value="INPAS">INPAS</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
//                   <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
//                   <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create Draft</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 2 && (
//               <div className="space-y-6">
//                 <h3 className="text-lg font-bold">2. Independence & Procedures</h3>
                
//                 {/* Firm Procedures */}
//                 <div className="space-y-4">
//                   {procedures.map((proc, index) => (
//                     <div key={proc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
//                       <p className="text-sm font-bold text-slate-800 mb-3">{proc.procedureText}</p>
//                       <textarea 
//                         className="w-full border-slate-300 rounded-lg text-sm mb-2" 
//                         rows={2} 
//                         placeholder="Document your findings..."
//                         value={proc.response || ''} 
//                         onChange={(e) => {
//                           const newProcs = [...procedures];
//                           newProcs[index].response = e.target.value;
//                           newProcs[index].isDirty = true;
//                           setProcedures(newProcs);
//                         }} 
//                       />
//                       <input 
//                         type="file" 
//                         className="block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700"
//                         onChange={(e) => {
//                           if (e.target.files) {
//                             const newProcs = [...procedures];
//                             newProcs[index].file = e.target.files[0];
//                             newProcs[index].isDirty = true;
//                             setProcedures(newProcs);
//                           }
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Individual Declaration */}
//                 <div className="border-t border-gray-200 pt-6">
//                   <h4 className="font-bold text-slate-800 mb-3">Your Declaration</h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-slate-700 mb-1">Threats Identified</label>
//                       <textarea {...step2Form.register('threatsIdentified')} className="w-full border-slate-300 rounded-lg text-sm" rows={2} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-700 mb-1">Safeguards Applied</label>
//                       <textarea {...step2Form.register('safeguardsApplied')} className="w-full border-slate-300 rounded-lg text-sm" rows={2} />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center mt-8 pt-4 border-t">
//                   <span className="text-sm font-bold text-slate-500">Confirm your independence to proceed.</span>
//                   <div className="flex gap-3">
//                     <button onClick={() => handleStep2(false)} disabled={loading} className="px-6 py-2 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200">Decline</button>
//                     <button onClick={() => handleStep2(true)} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Continue</button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {currentStep === 3 && (
//               <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-6">
//                 <h3 className="text-lg font-bold">3. Integrity & Competence Assessment</h3>
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-1">Integrity Conclusion</label>
//                   <textarea {...step3Form.register('integrityConclusion')} defaultValue="Based on the assessment performed, management integrity is considered sufficient." className="w-full border-slate-300 rounded-lg" rows={3} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-1">Competence Conclusion</label>
//                   <textarea {...step3Form.register('competenceConclusion')} defaultValue="The firm has adequate resources and appropriate competence to perform the audit." className="w-full border-slate-300 rounded-lg" rows={3} />
//                 </div>
//                 <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
//                   <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Compliance Check</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 4 && (
//               <form onSubmit={step4Form.handleSubmit(handleStep4)} className="space-y-6">
//                 <h3 className="text-lg font-bold">4. Fees & Engagement Letter</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-bold text-slate-700 mb-1">Agreed Fee</label>
//                     <div className="flex shadow-sm rounded-lg">
//                       <select {...step4Form.register('currency')} className="border-slate-300 rounded-l-lg font-bold">
//                         <option value="USD">USD</option><option value="ETB">ETB</option><option value="EUR">EUR</option>
//                       </select>
//                       <input type="number" {...step4Form.register('agreedFee')} required className="flex-1 border-slate-300 border-l-0 rounded-r-lg font-mono" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="block text-sm font-bold text-slate-700 mb-2">Upload Signed Engagement Letter</label>
//                   <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50">
//                     <div className="space-y-1 text-center">
//                       <DocumentArrowUpIcon className="mx-auto h-10 w-10 text-indigo-500" />
//                       <div className="flex text-sm text-slate-600 justify-center mt-2">
//                         <label className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500">
//                           <span>Select PDF File</span>
//                           <input type="file" className="sr-only" accept=".pdf" onChange={(e) => { if (e.target.files) setTermsFile(e.target.files[0]) }} />
//                         </label>
//                       </div>
//                       <p className="text-xs text-slate-500 mt-1 font-medium">{termsFile ? termsFile.name : 'Upload PDF Document'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
//                    <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
//                    <span className="text-sm font-bold text-indigo-900">I confirm the client has agreed to the terms.</span>
//                 </div>
                
//                 <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
//                   <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Terms & Document</button>
//                 </div>
//               </form>
//             )}

//             {currentStep === 5 && (
//               <div className="space-y-6 text-center py-8">
//                 <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
//                   <ShieldCheckIcon className="h-10 w-10 text-green-600" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900">Ready for Partner Sign-Off</h3>
//                 <p className="text-gray-500 max-w-md mx-auto">
//                   By signing off, you officially accept this engagement. The system will automatically generate the final Audit Workspace and transition it to the Planning Phase.
//                 </p>

//                 <div className="flex justify-center gap-3 mt-8">
//                   <button onClick={onClose} className="px-6 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300">Cancel</button>
//                   <button onClick={handleStep5} disabled={loading} className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md">
//                     Accept & Create Workspace
//                   </button>
//                 </div>
//               </div>
//             )}

//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default PreEngagementWizard;


import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Client, PreEngagement } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
}

const steps = [
  { id: 1, name: 'Client Info', icon: UserGroupIcon },
  { id: 2, name: 'Independence', icon: ShieldCheckIcon },
  { id: 3, name: 'Risk Check', icon: DocumentTextIcon },
  { id: 4, name: 'Terms', icon: BanknotesIcon },
  { id: 5, name: 'Finalize', icon: CheckCircleIcon },
];

const PreEngagementWizard: React.FC<Props> = ({ isOpen, onClose, onSuccess, clients }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preId, setPreId] = useState<string | null>(null);
  
  // State for procedures and file uploads
  const [procedures, setProcedures] = useState<any[]>([]);
  const [termsFile, setTermsFile] = useState<File | null>(null);

  // NEW: Comprehensive Compliance State
  const [compliance, setCompliance] = useState({
    hasFinancialInterest: false, hasConflictOfInterests: false, independenceNotes: '', independenceConclusion: 'Based on pre-engagement assessment, the firm meets ethical requirements, maintains independence, applies safeguards, and is suitable to accept engagement.',
    firmHasTechnicalExpertise: true, specialistsAvailable: true, timeConstraintsManageable: true, competenceNotes: '', competenceConclusion: 'Based on the assessment performed, the firm has adequate resources and appropriate competence to perform the audit engagement.',
    backgroundChecksClear: true, noKnownFraudOrDisputes: true, goodEthicalCulture: true, integrityNotes: '', integrityConclusion: 'Based on the assessment performed, management integrity is considered sufficient, and the firm can proceed with the audit engagement.',
    clientGrantedPermission: true, predecessorCommunicated: true, predecessorNotes: '', predecessorConclusion: 'Communication with the predecessor auditor has been documented and appropriately considered.',
    operationsUnderstood: true, industryRisksAssessed: true, financialStabilityAssessed: true, understandingConclusion: 'Engagement risks are acceptable and manageable.'
  });

  const step1Form = useForm();
  const step2Form = useForm();
  const step4Form = useForm();

  // --- Step 1: Create Draft & Generate Procedures ---
  const handleStep1 = async (data: any) => {
    setLoading(true);
    try {
      const res: any = await api.initiatePreEngagement({
        clientId: data.clientId,
        financialFramework: data.financialFramework || "IFRS",
        auditPeriodStart: new Date(data.auditPeriodStart).toISOString(),
        auditPeriodEnd: new Date(data.auditPeriodEnd).toISOString(),
      });
      
      const newPreId = res.data?.id || res.id;
      setPreId(newPreId);
      
      const fresh: any = await api.getPreEngagementById(newPreId);
      if (fresh.data?.procedureResponses) {
        setProcedures(fresh.data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
      }

      setCurrentStep(2);
      toast.success("Draft Created");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Independence & Procedures ---
  const handleStep2 = async (isIndependentDecision: boolean) => {
    if (!preId) return;
    setLoading(true);
    try {
      const formValues = step2Form.getValues();

      try {
        await api.submitIndependence(preId, {
          isIndependent: isIndependentDecision,
          threatsIdentified: formValues.threatsIdentified || '',
          safeguardsApplied: formValues.safeguardsApplied || ''
        });
      } catch (e: any) {
        const msg = e.response?.data?.message || '';
        if (!msg.toString().toLowerCase().includes('already')) throw e; 
      }

      for (const proc of procedures) {
        if (proc.isDirty) {
          const formData = new FormData();
          if (proc.response) formData.append('response', proc.response);
          if (proc.file) formData.append('file', proc.file);
          await api.answerProcedure(preId, proc.id, formData);
        }
      }

      toast.success(isIndependentDecision ? "Independence Confirmed" : "Engagement Declined");
      setCurrentStep(3);
    } catch (e) {
      toast.error("Failed to save independence");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Risk Assessment (Comprehensive Compliance) ---
  const handleStep3 = async () => {
    if (!preId) return;
    
    // Frontend Validation
    if (!compliance.integrityConclusion || !compliance.competenceConclusion || !compliance.independenceConclusion) {
      toast.error('Please provide conclusions for Integrity, Competence, and Independence.');
      return;
    }

    setLoading(true);
    try {
      await api.updateComplianceCheck(preId, compliance);
      setCurrentStep(4);
      toast.success("Risk Assessment Updated");
    } catch (e) {
      toast.error("Failed to update risk assessment");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4: Terms & File Upload ---
  const handleStep4 = async (data: any) => {
    if (!preId) return;
    if (!termsFile) {
      toast.error("Please upload the signed engagement letter.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', termsFile);
      const uploadRes: any = await api.uploadFile(formData);
      const fileUrl = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.url;

      await api.updateTerms(preId, {
        agreedFee: Number(data.agreedFee),
        currency: data.currency || "USD",
        termsAgreed: true,
        managementAcknowledged: true,
        engagementLetterUrl: fileUrl,
        engagementLetterDate: new Date().toISOString()
      });
      
      setCurrentStep(5);
      toast.success("Terms & Letter Saved!");
    } catch (e) {
      toast.error("Failed to save terms");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 5: Final Partner Sign-Off ---
  const handleStep5 = async () => {
    if (!preId) return;
    setLoading(true);
    try {
      await api.signOffPreEngagement(preId, {
        isAccepted: true,
        continuanceNotes: "All checks cleared via wizard."
      });
      
      toast.success("Engagement accepted & workspace generated!");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to accept engagement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={() => {}}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Engagement Setup</h2>
              <p className="text-sm text-gray-500 font-medium">Complete pre-engagement checks to generate the workspace.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                return (
                  <div key={step.id} className={`flex flex-col items-center bg-white px-2 ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'border-indigo-600 bg-indigo-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                      {isCompleted ? <CheckCircleIcon className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold mt-2 hidden sm:block">{step.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
            
            {currentStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1)} className="max-w-2xl mx-auto space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold">1. Client & Framework</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Select Client</label>
                    <select {...step1Form.register('clientId')} required className="w-full border-slate-300 rounded-lg">
                      <option value="">Select...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Period Start</label>
                    <input type="date" {...step1Form.register('auditPeriodStart')} required className="w-full border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Period End</label>
                    <input type="date" {...step1Form.register('auditPeriodEnd')} required className="w-full border-slate-300 rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Accounting Framework</label>
                    <select {...step1Form.register('financialFramework')} className="w-full border-slate-300 rounded-lg">
                      <option value="IFRS">IFRS</option>
                      <option value="IFRS_SME">IFRS for SMEs</option>
                      <option value="IPSAS">IPSAS</option>
                      <option value="INPAS">INPAS</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm">Create Draft</button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold border-b pb-3 mb-4">Firm Independence Procedures (ISA 220)</h3>
                  <div className="space-y-4">
                    {procedures.map((proc, index) => (
                      <div key={proc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm font-bold text-slate-800 mb-3">{proc.procedureText}</p>
                        <textarea 
                          className="w-full border-slate-300 rounded-lg text-sm mb-2" 
                          rows={2} 
                          placeholder="Document your findings..."
                          value={proc.response || ''} 
                          onChange={(e) => {
                            const newProcs = [...procedures];
                            newProcs[index].response = e.target.value;
                            newProcs[index].isDirty = true;
                            setProcedures(newProcs);
                          }} 
                        />
                        <input 
                          type="file" 
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 cursor-pointer hover:file:bg-indigo-100 transition-colors"
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
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Your Declaration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Threats Identified (if any)</label>
                      <textarea {...step2Form.register('threatsIdentified')} className="w-full border-slate-300 rounded-lg text-sm" rows={2} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Safeguards Applied</label>
                      <textarea {...step2Form.register('safeguardsApplied')} className="w-full border-slate-300 rounded-lg text-sm" rows={2} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <span className="text-sm font-bold text-slate-500">Confirm your independence to proceed.</span>
                    <div className="flex gap-3">
                      <button onClick={() => handleStep2(false)} disabled={loading} className="px-6 py-2 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200 shadow-sm">Decline</button>
                      <button onClick={() => handleStep2(true)} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm">Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FULLY REBUILT COMPLIANCE STEP */}
            {currentStep === 3 && (
              <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-100 pb-4">Firm & Client Compliance Assessment</h4>
                <p className="text-sm text-slate-500 mb-6">Complete the following checklists to satisfy ISA requirements.</p>

                <div className="space-y-6">
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
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.firmHasTechnicalExpertise} onChange={e => setCompliance({...compliance, firmHasTechnicalExpertise: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Technical expertise</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.specialistsAvailable} onChange={e => setCompliance({...compliance, specialistsAvailable: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Specialists available</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.timeConstraintsManageable} onChange={e => setCompliance({...compliance, timeConstraintsManageable: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Time manageable</span></label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label><textarea value={compliance.competenceNotes} onChange={e => setCompliance({...compliance, competenceNotes: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conclusion *</label><textarea value={compliance.competenceConclusion} onChange={e => setCompliance({...compliance, competenceConclusion: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg border-l-4 border-l-indigo-500" rows={2} required /></div>
                    </div>
                  </div>

                  {/* 3. Predecessor Auditor */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                    <h5 className="font-bold text-slate-800 mb-4 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> 3. Predecessor Auditor (ISA 210)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pl-7">
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.clientGrantedPermission} onChange={e => setCompliance({...compliance, clientGrantedPermission: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Client granted permission</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={compliance.predecessorCommunicated} onChange={e => setCompliance({...compliance, predecessorCommunicated: e.target.checked})} className="rounded text-indigo-600" /><span className="text-sm font-medium">Predecessor communicated</span></label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label><textarea value={compliance.predecessorNotes} onChange={e => setCompliance({...compliance, predecessorNotes: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conclusion</label><textarea value={compliance.predecessorConclusion} onChange={e => setCompliance({...compliance, predecessorConclusion: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" rows={2} /></div>
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
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={handleStep3} disabled={loading} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save Compliance Check</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <form onSubmit={step4Form.handleSubmit(handleStep4)} className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold">4. Fees & Engagement Letter</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Agreed Fee</label>
                    <div className="flex shadow-sm rounded-lg">
                      <select {...step4Form.register('currency')} className="border-slate-300 rounded-l-lg font-bold">
                        <option value="USD">USD</option><option value="ETB">ETB</option><option value="EUR">EUR</option>
                      </select>
                      <input type="number" {...step4Form.register('agreedFee')} required className="flex-1 border-slate-300 border-l-0 rounded-r-lg font-mono" />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload Signed Engagement Letter</label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentArrowUpIcon className="mx-auto h-10 w-10 text-indigo-500" />
                      <div className="flex text-sm text-slate-600 justify-center mt-2">
                        <label className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500">
                          <span>Select PDF File</span>
                          <input type="file" className="sr-only" accept=".pdf" onChange={(e) => { if (e.target.files) setTermsFile(e.target.files[0]) }} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{termsFile ? termsFile.name : 'Upload PDF Document'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                   <input type="checkbox" required className="h-4 w-4 text-indigo-600 rounded" />
                   <span className="text-sm font-bold text-indigo-900">I confirm the client has agreed to the terms.</span>
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm">Save Terms & Document</button>
                </div>
              </form>
            )}

            {currentStep === 5 && (
              <div className="max-w-2xl mx-auto space-y-6 text-center py-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
                  <ShieldCheckIcon className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ready for Partner Sign-Off</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  By signing off, you officially accept this engagement. The system will automatically generate the final Audit Workspace and transition it to the Planning Phase.
                </p>

                <div className="flex justify-center gap-3 mt-8">
                  <button onClick={onClose} className="px-6 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300">Cancel</button>
                  <button onClick={handleStep5} disabled={loading} className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md">
                    Accept & Create Workspace
                  </button>
                </div>
              </div>
            )}

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PreEngagementWizard;