// // src/pages/Workspace/PreEngagementPhase.tsx
// import React, { useState, useEffect } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import apiClient from '../../utils/api';
// import { Engagement, PreEngagement } from '../../types';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import RoleGuard from '../../components/Auth/RoleGuard';

// const STEPS = [
//   { id: 'independence', title: '1. Independence', desc: 'Declare team independence' },
//   { id: 'compliance', title: '2. Compliance', desc: 'Integrity & Competence checks' },
//   { id: 'terms', title: '3. Terms & Fees', desc: 'Engagement letter & budget' },
//   { id: 'signoff', title: '4. Sign-Off', desc: 'Partner acceptance' }
// ];

// const PreEngagementPhase: React.FC = () => {
//   // Get engagement context from WorkspaceLayout
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
  
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [preEngagement, setPreEngagement] = useState<PreEngagement | null>(null);

//   // Form States
//   const [independence, setIndependence] = useState({ isIndependent: true, threatsIdentified: '', safeguardsApplied: '' });
//   const [compliance, setCompliance] = useState({ integrityClear: false, competenceClear: false, notes: '' });
//   const [terms, setTerms] = useState({ agreedFee: '', currency: 'USD', engagementLetterUrl: '', auditPeriodStart: '', auditPeriodEnd: '' });

//   // Mock fetch - in reality, you'd fetch the preEngagement data linked to this engagement
//   useEffect(() => {
//     // If preEngagementId exists, fetch it. Otherwise, we start fresh.
//     if (engagement.preEngagementId) {
//        // Assuming backend returns nested data or we fetch it. 
//        // For this UI, we will initialize as ready to fill.
//     }
//   }, [engagement]);

//   const handleSaveIndependence = async () => {
//     setLoading(true);
//     try {
//       // In a real flow, you'd ensure a PreEngagement record exists first
//       // await apiClient.submitIndependence(engagement.preEngagementId, independence);
//       toast.success('Independence declaration saved.');
//       setActiveStep(1);
//     } catch (error) {
//       toast.error('Failed to save independence.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveCompliance = async () => {
//     setLoading(true);
//     try {
//       // await apiClient.updateComplianceCheck(engagement.preEngagementId, compliance);
//       toast.success('Compliance checks saved.');
//       setActiveStep(2);
//     } catch (error) {
//       toast.error('Failed to save compliance.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveTerms = async () => {
//     setLoading(true);
//     try {
//       // await apiClient.updateTerms(engagement.preEngagementId, terms);
//       toast.success('Terms and fees saved.');
//       setActiveStep(3);
//     } catch (error) {
//       toast.error('Failed to save terms.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePartnerSignOff = async () => {
//     setLoading(true);
//     try {
//       // await apiClient.signOffPreEngagement(engagement.preEngagementId, { status: 'APPROVED' });
//       toast.success('Engagement formally accepted and locked for Planning!');
//       // Navigate or update global state to unlock Planning Phase
//     } catch (error) {
//       toast.error('Failed to sign off.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[70vh] flex flex-col">
      
//       {/* Wizard Header */}
//       <div className="border-b border-slate-200 px-8 py-6">
//         <h2 className="text-2xl font-bold text-slate-800">Pre-Engagement & Continuance</h2>
//         <p className="text-slate-500 mt-1">Complete ISA 210 and 220 requirements before commencing planning.</p>
        
//         {/* Stepper UI */}
//         <div className="flex items-center justify-between mt-8">
//           {STEPS.map((step, index) => (
//             <div 
//               key={step.id} 
//               className={`flex-1 flex flex-col relative ${index <= activeStep ? 'text-indigo-600' : 'text-slate-400'}`}
//               onClick={() => setActiveStep(index)}
//             >
//               <div className="flex items-center">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 bg-white
//                   ${index < activeStep ? 'bg-indigo-600 border-indigo-600 text-white' : 
//                     index === activeStep ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-400'}`}
//                 >
//                   {index < activeStep ? '✓' : index + 1}
//                 </div>
//                 {index < STEPS.length - 1 && (
//                   <div className={`h-1 flex-1 mx-2 rounded ${index < activeStep ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
//                 )}
//               </div>
//               <span className="text-sm font-semibold mt-2">{step.title}</span>
//               <span className="text-xs text-slate-500 hidden md:block">{step.desc}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Wizard Content Area */}
//       <div className="p-8 flex-1 bg-slate-50">
        
//         {/* STEP 1: INDEPENDENCE */}
//         {activeStep === 0 && (
//           <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//             <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Independence Declaration</h3>
            
//             <div className="space-y-4">
//               <label className="flex items-center space-x-3 p-4 border rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
//                 <input 
//                   type="checkbox" 
//                   checked={independence.isIndependent}
//                   onChange={(e) => setIndependence({...independence, isIndependent: e.target.checked})}
//                   className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" 
//                 />
//                 <div>
//                   <p className="font-semibold text-slate-800">I declare that the engagement team is independent.</p>
//                   <p className="text-xs text-slate-500">In accordance with relevant ethical requirements (ISA 220).</p>
//                 </div>
//               </label>

//               {!independence.isIndependent && (
//                 <div className="space-y-4 animate-fade-in">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Threats Identified</label>
//                     <textarea 
//                       className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                       rows={3}
//                       value={independence.threatsIdentified}
//                       onChange={(e) => setIndependence({...independence, threatsIdentified: e.target.value})}
//                       placeholder="Detail any financial, business, or personal relationships..."
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Safeguards Applied</label>
//                     <textarea 
//                       className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                       rows={3}
//                       value={independence.safeguardsApplied}
//                       onChange={(e) => setIndependence({...independence, safeguardsApplied: e.target.value})}
//                       placeholder="How have these threats been mitigated?"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-8 flex justify-end">
//               <button 
//                 onClick={handleSaveIndependence}
//                 disabled={loading}
//                 className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center"
//               >
//                 {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
//                 Save & Continue
//               </button>
//             </div>
//           </div>
//         )}

//         {/* STEP 2: COMPLIANCE */}
//         {activeStep === 1 && (
//           <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//             <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Client Integrity & Competence</h3>
            
//             <div className="space-y-4">
//               <label className="flex items-center space-x-3 p-3 border rounded-md hover:bg-slate-50 cursor-pointer">
//                 <input 
//                   type="checkbox" 
//                   checked={compliance.integrityClear}
//                   onChange={(e) => setCompliance({...compliance, integrityClear: e.target.checked})}
//                   className="w-5 h-5 text-indigo-600 rounded" 
//                 />
//                 <span className="text-sm font-medium text-slate-700">Client background and integrity checks are satisfactory.</span>
//               </label>

//               <label className="flex items-center space-x-3 p-3 border rounded-md hover:bg-slate-50 cursor-pointer">
//                 <input 
//                   type="checkbox" 
//                   checked={compliance.competenceClear}
//                   onChange={(e) => setCompliance({...compliance, competenceClear: e.target.checked})}
//                   className="w-5 h-5 text-indigo-600 rounded" 
//                 />
//                 <span className="text-sm font-medium text-slate-700">Firm has the required competence, time, and resources.</span>
//               </label>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Continuance Notes (Optional)</label>
//                 <textarea 
//                   className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                   rows={3}
//                   value={compliance.notes}
//                   onChange={(e) => setCompliance({...compliance, notes: e.target.value})}
//                   placeholder="Notes on communication with predecessor auditor, specific industry risks, etc."
//                 />
//               </div>
//             </div>
            
//             <div className="mt-8 flex justify-between">
//               <button onClick={() => setActiveStep(0)} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md font-medium">Back</button>
//               <button onClick={handleSaveCompliance} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">Save & Continue</button>
//             </div>
//           </div>
//         )}

//         {/* STEP 3: TERMS & FEES */}
//         {activeStep === 2 && (
//           <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
//             <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Terms of Engagement</h3>
            
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Agreed Fee</label>
//                 <div className="flex">
//                   <select 
//                     className="border-slate-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
//                     value={terms.currency}
//                     onChange={(e) => setTerms({...terms, currency: e.target.value})}
//                   >
//                     <option>USD</option>
//                     <option>EUR</option>
//                     <option>GBP</option>
//                   </select>
//                   <input 
//                     type="number" 
//                     className="flex-1 border-slate-300 border-l-0 rounded-r-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
//                     placeholder="0.00"
//                     value={terms.agreedFee}
//                     onChange={(e) => setTerms({...terms, agreedFee: e.target.value})}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Engagement Letter URL</label>
//                 <input 
//                   type="text" 
//                   className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
//                   placeholder="https://sharepoint..."
//                   value={terms.engagementLetterUrl}
//                   onChange={(e) => setTerms({...terms, engagementLetterUrl: e.target.value})}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Audit Period Start</label>
//                 <input 
//                   type="date" 
//                   className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
//                   value={terms.auditPeriodStart}
//                   onChange={(e) => setTerms({...terms, auditPeriodStart: e.target.value})}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Audit Period End</label>
//                 <input 
//                   type="date" 
//                   className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
//                   value={terms.auditPeriodEnd}
//                   onChange={(e) => setTerms({...terms, auditPeriodEnd: e.target.value})}
//                 />
//               </div>
//             </div>
            
//             <div className="mt-8 flex justify-between">
//               <button onClick={() => setActiveStep(1)} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md font-medium">Back</button>
//               <button onClick={handleSaveTerms} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">Save & Continue</button>
//             </div>
//           </div>
//         )}

//         {/* STEP 4: SIGN-OFF */}
//         {activeStep === 3 && (
//         <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
//             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
//             📝
//             </div>
//             <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready for Partner Sign-Off</h3>
            
//             <RoleGuard 
//             exactRoles={['PARTNER']} 
//             fallback={
//                 <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm font-medium mt-6">
//                 🔒 Awaiting Partner review and sign-off. You do not have permission to accept this engagement.
//                 </div>
//             }
//             >
//             <p className="text-slate-500 mb-8">
//                 By signing off, you officially accept this engagement and move it into the Planning Phase.
//             </p>
//             <div className="flex justify-center space-x-4">
//                 <button onClick={handlePartnerSignOff} disabled={loading} className="bg-green-600 text-white px-8 py-2 rounded-md font-bold shadow-md hover:bg-green-700">
//                 Accept Engagement
//                 </button>
//             </div>
//             </RoleGuard>
//         </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default PreEngagementPhase;



// // src/pages/Workspace/PreEngagementPhase.tsx
// import React, { useState, useEffect } from 'react';
// import { useOutletContext, useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { 
//   CheckCircleIcon, 
//   DocumentArrowUpIcon, 
//   DocumentTextIcon, 
//   ArrowDownTrayIcon, 
//   EyeIcon,
//   ShieldCheckIcon
// } from '@heroicons/react/24/outline';
// import apiClient from '../../utils/api';
// import { Engagement } from '../../types';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';
// import RoleGuard from '../../components/Auth/RoleGuard';

// const STEPS = [
//   { id: 'initiate', title: '1. Initiate', desc: 'Setup framework & period' },
//   { id: 'independence', title: '2. Independence', desc: 'Declare team independence' },
//   { id: 'compliance', title: '3. Compliance', desc: 'Integrity & Competence checks' },
//   { id: 'terms', title: '4. Terms & Fees', desc: 'Engagement letter & budget' },
//   { id: 'signoff', title: '5. Sign-Off', desc: 'Partner acceptance' }
// ];

// const PreEngagementPhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [preId, setPreId] = useState<string | null>(engagement.preEngagementId || null);
  
//   // Is this file locked/approved?
//   const [isReadOnly, setIsReadOnly] = useState(engagement.status !== 'DRAFT');
//   const [activeStep, setActiveStep] = useState(0);
  

//   // Form States mapped strictly to the Postman JSON
//   const [initData, setInitData] = useState({
//     financialFramework: 'IFRS',
//     auditPeriodStart: engagement.startDate ? new Date(engagement.startDate).toISOString().split('T')[0] : '',
//     auditPeriodEnd: engagement.endDate ? new Date(engagement.endDate).toISOString().split('T')[0] : ''
//   });

//   const [independence, setIndependence] = useState({
//     isIndependent: true,
//     threatsIdentified: 'None identified.',
//     safeguardsApplied: 'N/A'
//   });

//   const [compliance, setCompliance] = useState({
//     hasFinancialInterest: false, hasConflictOfInterests: false,
//     independenceNotes: 'No financial interests found across the engagement team.', independenceConclusion: 'Independent.',
//     firmHasTechnicalExpertise: true, specialistsAvailable: true, timeConstraintsManageable: true,
//     competenceNotes: 'We have the necessary specialists for this industry.', competenceConclusion: 'Competence requirements met.',
//     backgroundChecksClear: true, noKnownFraudOrDisputes: true, goodEthicalCulture: true,
//     integrityNotes: 'Background check came back clean.', integrityConclusion: 'Management integrity verified.',
//     clientGrantedPermission: true, predecessorCommunicated: true,
//     predecessorNotes: 'No accounting irregularities noted by predecessor.', predecessorConclusion: 'Cleared to proceed.',
//     operationsUnderstood: true, industryRisksAssessed: true, financialStabilityAssessed: true,
//     understandingConclusion: 'Client operations fully documented.'
//   });

//   const [terms, setTerms] = useState({
//     agreedFee: '',
//     currency: 'USD',
//     termsAgreed: true,
//     managementAcknowledged: true,
//     engagementLetterUrl: '',
//     engagementLetterDate: '',
//     file: null as File | null
//   });

//   // Fetch Full Pre-Engagement Detail if ID exists
//   useEffect(() => {
//     const fetchPreEngagement = async () => {
//       if (!engagement.preEngagementId) {
//         setFetching(false);
//         return;
//       }
//       try {
//         const res = await apiClient.getPreEngagementById(engagement.preEngagementId);
//         const data = res.data;
        
//         setIsReadOnly(data.status === 'APPROVED');
//         if (data.status === 'APPROVED') setActiveStep(4); // Jump to end if done

//         // 1. Init Data
//         setInitData({
//           financialFramework: data.financialFramework || 'IFRS',
//           auditPeriodStart: data.auditPeriodStart ? new Date(data.auditPeriodStart).toISOString().split('T')[0] : '',
//           auditPeriodEnd: data.auditPeriodEnd ? new Date(data.auditPeriodEnd).toISOString().split('T')[0] : ''
//         });

//         // 2. Terms
//         setTerms(prev => ({
//           ...prev,
//           agreedFee: data.agreedFee || '',
//           currency: data.currency || 'USD',
//           termsAgreed: data.termsAgreed ?? true,
//           managementAcknowledged: data.managementAcknowledged ?? true,
//           engagementLetterUrl: data.engagementLetterUrl || '',
//           engagementLetterDate: data.engagementLetterDate || ''
//         }));

//         // 3. Compliance
//         if (data.complianceCheck) {
//           setCompliance(data.complianceCheck);
//         }

//         // 4. Independence (Get the first one for simplicity, or specific to user)
//         if (data.independenceDeclarations && data.independenceDeclarations.length > 0) {
//           const ind = data.independenceDeclarations[0];
//           setIndependence({
//             isIndependent: ind.isIndependent,
//             threatsIdentified: ind.threatsIdentified || '',
//             safeguardsApplied: ind.safeguardsApplied || ''
//           });
//         }

//       } catch (error) {
//         console.error("Failed to fetch pre-engagement details", error);
//       } finally {
//         setFetching(false);
//       }
//     };

//     fetchPreEngagement();
//   }, [engagement.preEngagementId]);

//   // Actions
//   const handleInitiate = async () => {
//     setLoading(true);
//     try {
//       if (!preId) {
//         const payload = {
//           clientId: engagement.clientId,
//           financialFramework: initData.financialFramework,
//           auditPeriodStart: new Date(initData.auditPeriodStart).toISOString(),
//           auditPeriodEnd: new Date(initData.auditPeriodEnd).toISOString()
//         };
//         const res: any = await apiClient.initiatePreEngagement(payload);
//         setPreId(res.data?.id || res.id);
//       }
//       toast.success('Pre-Engagement Initiated');
//       setActiveStep(1);
//     } catch (error) { toast.error('Failed to initiate'); } finally { setLoading(false); }
//   };

//   const handleSaveIndependence = async () => {
//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   setLoading(true);

//   try {
//     await apiClient.submitIndependence(preId, independence);

//     toast.success('Independence saved.');
//     setActiveStep(2);

//   } catch (e: any) {
//     console.error(
//       'Independence Error:',
//       e.response?.data || e
//     );

//     const errorMessage = e.response?.data?.message;

//     let errorStr = '';

//     if (Array.isArray(errorMessage)) {
//       errorStr = errorMessage[0];
//     } else if (typeof errorMessage === 'object') {
//       errorStr =
//         errorMessage?.message ||
//         JSON.stringify(errorMessage);
//     } else {
//       errorStr = errorMessage || '';
//     }

//     const lower = errorStr.toLowerCase();

//     // Treat duplicate as success
//     if (
//       lower.includes('already') ||
//       lower.includes('exists') ||
//       lower.includes('submitted')
//     ) {
//       toast.success(
//         'Independence already exists. Proceeding...'
//       );

//       setActiveStep(2);
//       return;
//     }

//     toast.error(errorStr || 'Failed to save independence');

//   } finally {
//     setLoading(false);
//   }
// };

//   const handleSaveCompliance = async () => {
//     if (!preId) return; setLoading(true);
//     try {
//       await apiClient.updateComplianceCheck(preId, compliance);
//       toast.success('Compliance saved.'); setActiveStep(3);
//     } catch (error) { toast.error('Failed to save compliance'); } finally { setLoading(false); }
//   };

// const handleSaveTerms = async () => {
//   if (!preId) {
//     toast.error('Pre-engagement ID missing');
//     return;
//   }

//   if (!terms.file && !terms.engagementLetterUrl) {
//     toast.error(
//       'Please upload the signed engagement letter.'
//     );
//     return;
//   }

//   setLoading(true);

//   try {
//     let finalUrl = terms.engagementLetterUrl;

//     if (terms.file) {
//       const formData = new FormData();

//       formData.append('file', terms.file);

//       toast.loading('Uploading document...', {
//         id: 'upload-toast'
//       });

//       const uploadRes: any =
//         await apiClient.uploadFile(formData);

//       console.log('Upload response:', uploadRes);

//       finalUrl =
//         uploadRes?.data?.fileUrl ||
//         uploadRes?.fileUrl ||
//         uploadRes?.url;

//       toast.success(
//         'Document uploaded successfully!',
//         {
//           id: 'upload-toast'
//         }
//       );
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

//     toast.success(
//       'Terms and document saved successfully.'
//     );

//     setTerms((prev) => ({
//       ...prev,
//       engagementLetterUrl: finalUrl,
//       file: null
//     }));

//     setActiveStep(4);

//   } catch (e: any) {
//     toast.dismiss('upload-toast');

//     console.error(
//       'Terms Validation Error:',
//       e.response?.data || e
//     );

//     const errorMessage = e.response?.data?.message;

//     let displayMessage = 'Failed to save terms';

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
//     setLoading(false);
//   }
// };

//   const handlePartnerSignOff = async () => {
//     if (!preId) return; setLoading(true);
//     try {
//       await apiClient.signOffPreEngagement(preId, {
//         isAccepted: true, continuanceNotes: "All checks cleared."
//       });
//       toast.success('Engagement accepted!');
//       setIsReadOnly(true);
//       setTimeout(() => navigate(`/engagements/${engagement.id}/workspace/planning`), 1500);
//     } catch (error) { toast.error('Failed to sign off'); } finally { setLoading(false); }
//   };

//   if (fetching) {
//     return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[70vh] flex flex-col">
      
//       {/* Wizard Header */}
//       <div className="border-b border-slate-200 px-8 py-6 bg-slate-50/50 rounded-t-xl">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pre-Engagement & Continuance</h2>
//             <p className="text-slate-500 mt-1">Complete ISA 210 and 220 requirements.</p>
//           </div>
//           {isReadOnly && (
//             <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200 flex items-center shadow-sm">
//               <ShieldCheckIcon className="w-5 h-5 mr-1.5" /> Approved & Locked
//             </span>
//           )}
//         </div>
        
//         {/* Stepper UI */}
//         <div className="flex items-center justify-between mt-8">
//           {STEPS.map((step, index) => (
//             <div 
//               key={step.id} 
//               className={`flex-1 flex flex-col relative ${index <= activeStep ? 'text-indigo-600' : 'text-slate-400'}`}
//               onClick={() => { if (isReadOnly || index < activeStep) setActiveStep(index); }}
//             >
//               <div className="flex items-center">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 bg-white shadow-sm transition-colors
//                   ${index < activeStep || (isReadOnly && index === 4) ? 'bg-indigo-600 border-indigo-600 text-white' : 
//                     index === activeStep ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50' : 'border-slate-300 text-slate-400'}
//                   ${(isReadOnly || index < activeStep) ? 'cursor-pointer hover:scale-105 transform transition-transform' : ''}`}
//                 >
//                   {index < activeStep || (isReadOnly && index === 4) ? '✓' : index + 1}
//                 </div>
//                 {index < STEPS.length - 1 && (
//                   <div className={`h-1 flex-1 mx-2 rounded transition-colors ${index < activeStep || isReadOnly ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
//                 )}
//               </div>
//               <span className="text-sm font-bold mt-3">{step.title}</span>
//               <span className="text-[10px] text-slate-500 hidden md:block uppercase tracking-wider font-semibold">{step.desc}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Wizard Content Area */}
//       <div className="p-8 flex-1 bg-white">
        
//         {/* STEP 1: INITIATE */}
//         {activeStep === 0 && (
//           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
//             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Engagement Parameters</h3>
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">Financial Framework</label>
//                 <select disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.financialFramework} onChange={(e) => setInitData({...initData, financialFramework: e.target.value})}>
//                   <option value="IFRS">IFRS</option><option value="US_GAAP">US GAAP</option><option value="LOCAL_GAAP">Local GAAP</option>
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-2">Audit Period Start</label>
//                   <input type="date" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.auditPeriodStart} onChange={(e) => setInitData({...initData, auditPeriodStart: e.target.value})} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-2">Audit Period End</label>
//                   <input type="date" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.auditPeriodEnd} onChange={(e) => setInitData({...initData, auditPeriodEnd: e.target.value})} />
//                 </div>
//               </div>
//             </div>
//             {!isReadOnly && (
//               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
//                 <button onClick={handleInitiate} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* STEP 2: INDEPENDENCE */}
//         {/* ... (Code remains functionally identical, just apply updated styling classes) ... */}
//         {activeStep === 1 && (
//           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
//             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Independence Declaration</h3>
//             <div className="space-y-6">
//               <label className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
//                 <input type="checkbox" disabled={isReadOnly} checked={independence.isIndependent} onChange={(e) => setIndependence({...independence, isIndependent: e.target.checked})} className="mt-1 w-5 h-5 text-indigo-600 rounded disabled:opacity-50" />
//                 <div>
//                   <p className="font-bold text-slate-800">I declare that the engagement team is independent.</p>
//                   <p className="text-xs text-slate-500 mt-1">In accordance with relevant ethical requirements (ISA 220).</p>
//                 </div>
//               </label>
//               {!independence.isIndependent && (
//                 <div className="space-y-4 animate-fade-in p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                   <div>
//                     <label className="block text-sm font-bold text-amber-900 mb-1">Threats Identified</label>
//                     <textarea disabled={isReadOnly} className="w-full border-amber-300 rounded-lg shadow-sm disabled:bg-amber-100/50" rows={3} value={independence.threatsIdentified} onChange={(e) => setIndependence({...independence, threatsIdentified: e.target.value})} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-amber-900 mb-1">Safeguards Applied</label>
//                     <textarea disabled={isReadOnly} className="w-full border-amber-300 rounded-lg shadow-sm disabled:bg-amber-100/50" rows={3} value={independence.safeguardsApplied} onChange={(e) => setIndependence({...independence, safeguardsApplied: e.target.value})} />
//                   </div>
//                 </div>
//               )}
//             </div>
//             {!isReadOnly && (
//               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
//                 <button onClick={() => setActiveStep(0)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
//                 <button onClick={handleSaveIndependence} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* STEP 3: COMPLIANCE */}
//         {activeStep === 2 && (
//           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
//             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Firm & Client Compliance</h3>
//             <div className="space-y-6">
//               <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
//                 <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> Integrity & Competence</h4>
//                 <div className="space-y-3 pl-7">
//                   <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.backgroundChecksClear} onChange={e => setCompliance({...compliance, backgroundChecksClear: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Background checks clear</span></label>
//                   <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.firmHasTechnicalExpertise} onChange={e => setCompliance({...compliance, firmHasTechnicalExpertise: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Firm has technical expertise</span></label>
//                 </div>
//               </div>
//               <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
//                 <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> Predecessor Auditor</h4>
//                 <div className="space-y-3 pl-7">
//                   <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.clientGrantedPermission} onChange={e => setCompliance({...compliance, clientGrantedPermission: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Client granted permission to communicate</span></label>
//                   <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.predecessorCommunicated} onChange={e => setCompliance({...compliance, predecessorCommunicated: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Predecessor communicated no issues</span></label>
//                 </div>
//               </div>
//             </div>
//             {!isReadOnly && (
//               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
//                 <button onClick={() => setActiveStep(1)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
//                 <button onClick={handleSaveCompliance} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* STEP 4: TERMS & FEES */}
//         {activeStep === 3 && (
//           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
//             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Terms & Engagement Letter</h3>
            
//             <div className="space-y-8">
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-2">Agreed Fee</label>
//                   <div className="flex shadow-sm rounded-lg">
//                     <select disabled={isReadOnly} className="border-slate-300 rounded-l-lg disabled:bg-slate-50 disabled:text-slate-500 font-bold" value={terms.currency} onChange={(e) => setTerms({...terms, currency: e.target.value})}>
//                       <option>USD</option><option>ETB</option><option>EUR</option>
//                     </select>
//                     <input disabled={isReadOnly} type="number" className="flex-1 border-slate-300 border-l-0 rounded-r-lg disabled:bg-slate-50 disabled:text-slate-500 font-mono" value={terms.agreedFee} onChange={(e) => setTerms({...terms, agreedFee: e.target.value})} />
//                   </div>
//                 </div>
//               </div>

//               {/* PDF VIEWER UI */}
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">Engagement Letter</label>
                
//                 {terms.engagementLetterUrl ? (
//                   <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
//                     <div className="flex items-center">
//                        <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
//                          <DocumentTextIcon className="w-8 h-8 text-red-500" />
//                        </div>
//                        <div>
//                          <p className="text-sm font-bold text-indigo-900">Signed_Engagement_Letter.pdf</p>
//                          <p className="text-xs font-semibold text-indigo-500 mt-0.5">
//                            Uploaded {terms.engagementLetterDate ? new Date(terms.engagementLetterDate).toLocaleDateString() : 'recently'}
//                          </p>
//                        </div>
//                     </div>
//                     <div className="flex space-x-3">
//                        <a 
//                          href={terms.engagementLetterUrl} 
//                          target="_blank" 
//                          rel="noopener noreferrer" 
//                          className="flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
//                        >
//                          <EyeIcon className="w-4 h-4 mr-1.5" /> View
//                        </a>
//                        <a 
//                          href={terms.engagementLetterUrl} 
//                          download 
//                          className="flex items-center px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
//                        >
//                          <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" /> Download
//                        </a>
//                     </div>
//                   </div>
//                 ) : (
//                   !isReadOnly && (
//                     <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors">
//                       <div className="space-y-1 text-center">
//                         <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
//                         <div className="flex text-sm text-slate-600 justify-center mt-4">
//                           <label className="relative cursor-pointer bg-white px-3 py-1 border border-slate-200 shadow-sm rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
//                             <span>Select PDF File</span>
//                             <input type="file" className="sr-only" accept=".pdf" onChange={(e) => { if (e.target.files) setTerms({...terms, file: e.target.files[0]}) }} />
//                           </label>
//                         </div>
//                         <p className="text-xs text-slate-500 mt-2 font-medium">{terms.file ? terms.file.name : 'PDF up to 10MB'}</p>
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>

//               <div className="space-y-3 pt-6 border-t border-slate-100">
//                 <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
//                   <input disabled={isReadOnly} type="checkbox" checked={terms.managementAcknowledged} onChange={e => setTerms({...terms, managementAcknowledged: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> 
//                   <span className="text-sm font-bold text-slate-700">Management acknowledges their responsibilities</span>
//                 </label>
//                 <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
//                   <input disabled={isReadOnly} type="checkbox" checked={terms.termsAgreed} onChange={e => setTerms({...terms, termsAgreed: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> 
//                   <span className="text-sm font-bold text-slate-700">Terms officially agreed upon</span>
//                 </label>
//               </div>

//             </div>
            
//             {!isReadOnly && (
//               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
//                 <button onClick={() => setActiveStep(2)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
//                 <button onClick={handleSaveTerms} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* STEP 5: SIGN-OFF */}
//         {activeStep === 4 && (
//           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center animate-fade-in">
//             <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 ${isReadOnly ? 'bg-green-100 text-green-600 ring-8 ring-green-50' : 'bg-indigo-100 text-indigo-600 ring-8 ring-indigo-50'}`}>
//               {isReadOnly ? <ShieldCheckIcon className="w-10 h-10" /> : '📝'}
//             </div>
            
//             {isReadOnly ? (
//               <>
//                 <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Pre-Engagement Completed</h3>
//                 <p className="text-slate-500 mb-8 font-medium">This engagement has been formally accepted and is securely locked.</p>
//                 <div className="flex justify-center space-x-4">
//                   <button onClick={() => setActiveStep(0)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Review Data</button>
//                   <button onClick={() => navigate(`/engagements/${engagement.id}/workspace/planning`)} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors">
//                     Go to Planning Phase →
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Ready for Partner Sign-Off</h3>
                
//                 <RoleGuard 
//                   minRole="PARTNER" 
//                   fallback={<div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm font-bold mt-6 border border-amber-200">🔒 Awaiting Partner review and sign-off.</div>}
//                 >
//                   <p className="text-slate-500 mb-8 font-medium">By signing off, you officially accept this engagement and move it into the Planning Phase.</p>
//                   <div className="flex justify-center space-x-4">
//                     <button onClick={() => setActiveStep(3)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back to Review</button>
//                     <button onClick={handlePartnerSignOff} disabled={loading} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 flex items-center">
//                       {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null} Accept Engagement
//                     </button>
//                   </div>
//                 </RoleGuard>
//               </>
//             )}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default PreEngagementPhase;


// src/pages/Workspace/PreEngagementPhase.tsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  DocumentArrowUpIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  ShieldCheckIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../utils/api';
import { Engagement } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import RoleGuard from '../../components/Auth/RoleGuard';

const STEPS = [
  { id: 'initiate', title: '1. Initiate', desc: 'Setup framework & period' },
  { id: 'independence', title: '2. Independence', desc: 'Declare team independence' },
  { id: 'compliance', title: '3. Compliance', desc: 'Integrity & Competence checks' },
  { id: 'terms', title: '4. Terms & Fees', desc: 'Engagement letter & budget' },
  { id: 'signoff', title: '5. Sign-Off', desc: 'Partner acceptance' }
];

interface Procedure {
  id: string;
  section: string;
  procedureText: string;
  response?: string;
  evidenceFileUrl?: string;
  file?: File | null;
  isDirty?: boolean;
}

const PreEngagementPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [preId, setPreId] = useState<string | null>(engagement.preEngagementId || null);
  
  const [isReadOnly, setIsReadOnly] = useState(engagement.status !== 'DRAFT');
  const [activeStep, setActiveStep] = useState(0);
  
  const [initData, setInitData] = useState({
    financialFramework: 'IFRS',
    auditPeriodStart: engagement.startDate ? new Date(engagement.startDate).toISOString().split('T')[0] : '',
    auditPeriodEnd: engagement.endDate ? new Date(engagement.endDate).toISOString().split('T')[0] : ''
  });

  const [independence, setIndependence] = useState({
    threatsIdentified: '',
    safeguardsApplied: ''
  });

  // NEW: Store the procedure questionnaires
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [compliance, setCompliance] = useState({
    hasFinancialInterest: false, hasConflictOfInterests: false,
    independenceNotes: '', independenceConclusion: 'Based on pre-engagement assessment, the firm meets ethical requirements, maintains independence, applies safeguards, and is suitable to accept engagement.',
    firmHasTechnicalExpertise: true, specialistsAvailable: true, timeConstraintsManageable: true,
    competenceNotes: '', competenceConclusion: 'Based on the assessment performed, the firm has adequate resources and appropriate competence to perform the audit engagement.',
    backgroundChecksClear: true, noKnownFraudOrDisputes: true, goodEthicalCulture: true,
    integrityNotes: '', integrityConclusion: 'Based on the assessment performed, management integrity is considered sufficient, and the firm can proceed with the audit engagement.',
    clientGrantedPermission: true, predecessorCommunicated: true,
    predecessorNotes: '', predecessorConclusion: 'Communication with the predecessor auditor has been documented and appropriately considered.',
    operationsUnderstood: true, industryRisksAssessed: true, financialStabilityAssessed: true,
    understandingConclusion: 'Engagement risks are acceptable and manageable.'
  });

  const [terms, setTerms] = useState({
    agreedFee: '',
    currency: 'USD',
    termsAgreed: true,
    managementAcknowledged: true,
    engagementLetterUrl: '',
    engagementLetterDate: '',
    file: null as File | null
  });

  useEffect(() => {
    const fetchPreEngagement = async () => {
      if (!engagement.preEngagementId) {
        setFetching(false);
        return;
      }
      try {
        const res = await apiClient.getPreEngagementById(engagement.preEngagementId);
        const data = res.data;
        
        setIsReadOnly(data.status === 'APPROVED');
        if (data.status === 'APPROVED') setActiveStep(4);

        setInitData({
          financialFramework: data.financialFramework || 'IFRS',
          auditPeriodStart: data.auditPeriodStart ? new Date(data.auditPeriodStart).toISOString().split('T')[0] : '',
          auditPeriodEnd: data.auditPeriodEnd ? new Date(data.auditPeriodEnd).toISOString().split('T')[0] : ''
        });

        setTerms(prev => ({
          ...prev,
          agreedFee: data.agreedFee || '',
          currency: data.currency || 'USD',
          termsAgreed: data.termsAgreed ?? true,
          managementAcknowledged: data.managementAcknowledged ?? true,
          engagementLetterUrl: data.engagementLetterUrl || '',
          engagementLetterDate: data.engagementLetterDate || ''
        }));

        if (data.complianceCheck) setCompliance(data.complianceCheck);

        if (data.independenceDeclarations && data.independenceDeclarations.length > 0) {
          const ind = data.independenceDeclarations[0];
          setIndependence({
            threatsIdentified: ind.threatsIdentified || '',
            safeguardsApplied: ind.safeguardsApplied || ''
          });
        }

        // LOAD PROCEDURES
        if (data.procedureResponses) {
          setProcedures(data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
        }

      } catch (error) {
        console.error("Failed to fetch pre-engagement details", error);
      } finally {
        setFetching(false);
      }
    };

    fetchPreEngagement();
  }, [engagement.preEngagementId]);

  const handleInitiate = async () => {
    setLoading(true);
    try {
      if (!preId) {
        const payload = {
          clientId: engagement.clientId,
          financialFramework: initData.financialFramework,
          auditPeriodStart: new Date(initData.auditPeriodStart).toISOString(),
          auditPeriodEnd: new Date(initData.auditPeriodEnd).toISOString()
        };
        const res: any = await apiClient.initiatePreEngagement(payload);
        setPreId(res.data?.id || res.id);
        
        // Auto-fetch to load the generated procedures immediately
        if (res.data?.id || res.id) {
           const fresh = await apiClient.getPreEngagementById(res.data?.id || res.id);
           if (fresh.data?.procedureResponses) {
              setProcedures(fresh.data.procedureResponses.map((p: any) => ({ ...p, isDirty: false })));
           }
        }
      }
      toast.success('Pre-Engagement Initiated');
      setActiveStep(1);
    } catch (error) { toast.error('Failed to initiate'); } finally { setLoading(false); }
  };

  // UPDATED: Handles both Individual Declaration AND Firm Procedures
  const handleSaveIndependence = async (isIndependentDecision: boolean) => {
    if (!preId) return;
    setLoading(true);

    try {
      // 1. Submit Individual Declaration
      try {
        await apiClient.submitIndependence(preId, {
          isIndependent: isIndependentDecision,
          ...independence
        });
      } catch (e: any) {
        const msg = e.response?.data?.message || '';
        if (!msg.toString().toLowerCase().includes('already')) throw e; // Ignore duplicates
      }

      // 2. Upload and Save Dirty Procedures
      let proceduresSaved = 0;
      for (const proc of procedures) {
        if (proc.isDirty) {
          const formData = new FormData();
          if (proc.response) formData.append('response', proc.response);
          if (proc.file) formData.append('file', proc.file);

          // IMPORTANT: Assuming you added this endpoint to your apiClient.ts
          // If not, you can replace this with a standard axios.patch call
          await apiClient.answerProcedure(preId, proc.id, formData);
          proceduresSaved++;
        }
      }

      if (proceduresSaved > 0) {
        toast.success(`Saved declaration and ${proceduresSaved} procedures.`);
      } else {
        toast.success(isIndependentDecision ? 'Independence Confirmed.' : 'Engagement Declined.');
      }
      
      setActiveStep(2);
    } catch (e: any) {
      toast.error('Failed to save independence and procedures.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompliance = async () => {
    if (!preId) return; setLoading(true);
    try {
      await apiClient.updateComplianceCheck(preId, compliance);
      toast.success('Compliance saved.'); setActiveStep(3);
    } catch (error) { toast.error('Failed to save compliance'); } finally { setLoading(false); }
  };

  const handleSaveTerms = async () => {
    if (!preId) return;
    if (!terms.file && !terms.engagementLetterUrl) {
      toast.error('Please upload the signed engagement letter.');
      return;
    }
    setLoading(true);
    try {
      let finalUrl = terms.engagementLetterUrl;
      if (terms.file) {
        const formData = new FormData();
        formData.append('file', terms.file);
        const uploadRes: any = await apiClient.uploadFile(formData);
        finalUrl = uploadRes?.data?.fileUrl || uploadRes?.fileUrl || uploadRes?.url;
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
      toast.success('Terms and document saved successfully.');
      setTerms(prev => ({ ...prev, engagementLetterUrl: finalUrl, file: null }));
      setActiveStep(4);
    } catch (e: any) {
      toast.error('Failed to save terms');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSignOff = async () => {
    if (!preId) return; setLoading(true);
    try {
      await apiClient.signOffPreEngagement(preId, {
        isAccepted: true, continuanceNotes: "All checks cleared."
      });
      toast.success('Engagement accepted!');
      setIsReadOnly(true);
      setTimeout(() => navigate(`/engagements/${engagement.id}/workspace/planning`), 1500);
    } catch (error) { toast.error('Failed to sign off'); } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[70vh] flex flex-col">
      
      {/* Wizard Header */}
      <div className="border-b border-slate-200 px-8 py-6 bg-slate-50/50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pre-Engagement & Continuance</h2>
            <p className="text-slate-500 mt-1">Complete ISA 210 and 220 requirements.</p>
          </div>
          {isReadOnly && (
            <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200 flex items-center shadow-sm">
              <ShieldCheckIcon className="w-5 h-5 mr-1.5" /> Approved & Locked
            </span>
          )}
        </div>
        
        {/* Stepper UI */}
        <div className="flex items-center justify-between mt-8">
          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex-1 flex flex-col relative ${index <= activeStep ? 'text-indigo-600' : 'text-slate-400'}`}
              onClick={() => { if (isReadOnly || index < activeStep) setActiveStep(index); }}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 bg-white shadow-sm transition-colors
                  ${index < activeStep || (isReadOnly && index === 4) ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    index === activeStep ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50' : 'border-slate-300 text-slate-400'}
                  ${(isReadOnly || index < activeStep) ? 'cursor-pointer hover:scale-105 transform transition-transform' : ''}`}
                >
                  {index < activeStep || (isReadOnly && index === 4) ? '✓' : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-colors ${index < activeStep || isReadOnly ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
              <span className="text-sm font-bold mt-3">{step.title}</span>
              <span className="text-[10px] text-slate-500 hidden md:block uppercase tracking-wider font-semibold">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Content Area */}
      <div className="p-8 flex-1 bg-white">
        
        {/* STEP 1: INITIATE */}
        {activeStep === 0 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Engagement Parameters</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Accounting Framework</label>
                <select disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.financialFramework} onChange={(e) => setInitData({...initData, financialFramework: e.target.value})}>
                  <option value="IFRS">IFRS</option>
                  <option value="IFRS_SME">IFRS for SMEs</option>
                  <option value="IPSAS">IPSAS</option>
                  <option value="INPAS">INPAS</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Audit Period Start</label>
                  <input type="date" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.auditPeriodStart} onChange={(e) => setInitData({...initData, auditPeriodStart: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Audit Period End</label>
                  <input type="date" disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 disabled:text-slate-500 focus:ring-indigo-500" value={initData.auditPeriodEnd} onChange={(e) => setInitData({...initData, auditPeriodEnd: e.target.value})} />
                </div>
              </div>
            </div>
            {!isReadOnly && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleInitiate} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: INDEPENDENCE & PROCEDURES */}
        {activeStep === 1 && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            
            {/* PART A: Firm-Level Procedures (List) */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Firm Independence Procedures (ISA 220)</h3>
              
              {procedures.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No procedures generated for this engagement.</p>
              ) : (
                <div className="space-y-8">
                  {procedures.map((proc, index) => (
                    <div key={proc.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-sm font-bold text-slate-800 mb-4 whitespace-pre-wrap">{proc.procedureText}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Findings & Response</label>
                          <textarea 
                            disabled={isReadOnly}
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 disabled:bg-slate-100 text-sm" 
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
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supporting Evidence</label>
                          {proc.evidenceFileUrl && !proc.file && (
                             <a href={proc.evidenceFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 mb-2">
                               <PaperClipIcon className="w-4 h-4 mr-1.5"/> View Attached Evidence
                             </a>
                          )}
                          
                          {!isReadOnly && (
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
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PART B: Individual Declaration & Decision */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Your Independence Declaration</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Threats Identified (if any)</label>
                  <textarea disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500" rows={2} placeholder="e.g. Familiarity threat..." value={independence.threatsIdentified} onChange={(e) => setIndependence({...independence, threatsIdentified: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Safeguards Applied</label>
                  <textarea disabled={isReadOnly} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500" rows={2} placeholder="e.g. Assigned alternative reviewer..." value={independence.safeguardsApplied} onChange={(e) => setIndependence({...independence, safeguardsApplied: e.target.value})} />
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button onClick={() => setActiveStep(0)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
                  <div className="space-x-4">
                    <button onClick={() => handleSaveIndependence(false)} disabled={loading} className="bg-rose-100 text-rose-700 border border-rose-200 px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-rose-200 transition-colors">
                      Decline
                    </button>
                    <button onClick={() => handleSaveIndependence(true)} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors">
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* STEP 3 & 4 remain essentially the same, just keeping the component whole */}
        {/* STEP 3: COMPLIANCE */}
        {activeStep === 2 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Firm & Client Compliance</h3>
            <div className="space-y-6">
              {/* Similar checkbox UI as before, omitted for brevity but assuming you keep your previous checkboxes here */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><CheckCircleIcon className="w-5 h-5 text-indigo-600 mr-2"/> Integrity & Competence</h4>
                <div className="space-y-3 pl-7">
                  <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.backgroundChecksClear} onChange={e => setCompliance({...compliance, backgroundChecksClear: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Background checks clear</span></label>
                  <label className="flex items-center space-x-3"><input disabled={isReadOnly} type="checkbox" checked={compliance.firmHasTechnicalExpertise} onChange={e => setCompliance({...compliance, firmHasTechnicalExpertise: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-medium text-slate-700">Firm has technical expertise</span></label>
                </div>
              </div>
            </div>
            {!isReadOnly && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                <button onClick={() => setActiveStep(1)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
                <button onClick={handleSaveCompliance} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: TERMS & FEES */}
        {activeStep === 3 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Terms & Engagement Letter</h3>
             {/* Same as your existing Step 4 */}
             <div className="space-y-8">
               {/* ... Keep your existing fee input and file upload logic here ... */}
             </div>
             {!isReadOnly && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                <button onClick={() => setActiveStep(2)} className="text-slate-600 px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bold">Back</button>
                <button onClick={handleSaveTerms} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save & Continue</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SIGN-OFF */}
        {activeStep === 4 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center animate-fade-in">
            {/* Same as your existing Step 5 */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 ${isReadOnly ? 'bg-green-100 text-green-600 ring-8 ring-green-50' : 'bg-indigo-100 text-indigo-600 ring-8 ring-indigo-50'}`}>
              {isReadOnly ? <ShieldCheckIcon className="w-10 h-10" /> : '📝'}
            </div>
            {isReadOnly ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pre-Engagement Completed</h3>
                <p className="text-slate-500 mb-8">This engagement has been formally accepted and is securely locked.</p>
                <button onClick={() => navigate(`/engagements/${engagement.id}/workspace/planning`)} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700">Go to Planning Phase →</button>
              </>
            ) : (
              <RoleGuard minRole="PARTNER">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready for Partner Sign-Off</h3>
                <button onClick={handlePartnerSignOff} disabled={loading} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold mt-6 hover:bg-indigo-700">Accept Engagement</button>
              </RoleGuard>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PreEngagementPhase;