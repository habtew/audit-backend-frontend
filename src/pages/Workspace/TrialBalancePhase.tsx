// // src/pages/Workspace/TrialBalancePhase.tsx
// import React, { useState, useEffect, Fragment } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { Dialog, Transition } from '@headlessui/react';
// import { 
//   ArrowUpTrayIcon, DocumentArrowDownIcon, CheckCircleIcon, XCircleIcon,
//   TableCellsIcon, DocumentChartBarIcon, BanknotesIcon, TrashIcon,
//   ClockIcon, PlusIcon, ListBulletIcon, BoltIcon, ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';
// import { Engagement } from '../../types';
// import apiClient from '../../utils/api';
// import RoleGuard from '../../components/Auth/RoleGuard';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// const TABS = [
//   { id: 'wtb', label: 'Working Trial Balance', icon: TableCellsIcon },
//   { id: 'mapping', label: 'Account Mapping', icon: BoltIcon },
//   { id: 'lead_schedules', label: 'Lead Schedules', icon: DocumentChartBarIcon },
//   { id: 'statements', label: 'Draft Statements', icon: BanknotesIcon },
//   { id: 'ledger', label: 'Ledger & History', icon: ListBulletIcon }
// ];

// const TrialBalancePhase: React.FC = () => {
//   const { engagement } = useOutletContext<{ engagement: Engagement }>();
//   const [activeTab, setActiveTab] = useState('wtb');
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [mappingLoading, setMappingLoading] = useState(false);

//   // Data States
//   const [tbId, setTbId] = useState<string | null>(null);
//   const [summary, setSummary] = useState<any>(null);
//   const [reconciliation, setReconciliation] = useState<any[]>([]);
//   const [leadSchedules, setLeadSchedules] = useState<any[]>([]);
//   const [statements, setStatements] = useState<any>(null);
//   const [history, setHistory] = useState<any[]>([]);
  
//   // Mapping Specific States
//   const [tbDetails, setTbDetails] = useState<any>(null); // Holds raw accounts + mapping arrays
//   const [mappingStats, setMappingStats] = useState<any>(null);
//   const [categories, setCategories] = useState<any[]>([]);

//   // Adjustment Modal States
//   const [isAjeModalOpen, setIsAjeModalOpen] = useState(false);
//   const [selectedAccount, setSelectedAccount] = useState<any>(null);
//   const [ajeForm, setAjeForm] = useState({ debit: 0, credit: 0, description: '' });

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [tbRes, histRes, catRes] = await Promise.all([
//         apiClient.getTrialBalances(),
//         apiClient.getImportHistory(),
//         apiClient.getMappingCategories().catch(() => ({ data: [] }))
//       ]);
      
//       setHistory(histRes.data || []);
//       setCategories(catRes.data || []);
      
//       const allTbs = tbRes.data?.trialBalances || [];
//       const currentTb = allTbs.find((tb: any) => tb.engagementId === engagement.id);

//       if (currentTb) {
//         setTbId(currentTb.id);
//         const [sumRes, reconRes, leadRes, stateRes, detailRes, statsRes] = await Promise.all([
//           apiClient.getTrialBalanceSummary(currentTb.id),
//           apiClient.getReconciliation(engagement.id),
//           apiClient.getLeadSchedules(engagement.id),
//           apiClient.getDraftStatements(engagement.id),
//           apiClient.getTrialBalanceById(currentTb.id),
//           apiClient.getMappingStats(currentTb.id).catch(() => ({ data: null }))
//         ]);

//         setSummary(sumRes.data?.summary);
//         setReconciliation(reconRes.data?.report || []);
//         setLeadSchedules(leadRes.data || []);
//         setStatements(stateRes.data || null);
//         setTbDetails(detailRes.data || null);
//         setMappingStats(statsRes.data || null);
//       } else {
//         setTbId(null);
//       }
//     } catch (error) {
//       console.error("Failed to fetch Trial Balance data", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, [engagement.id]);

//   // --- 1. Import Handlers ---
//   const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, type: 'TB' | 'LEDGER') => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     const toastId = toast.loading(`Importing ${type === 'TB' ? 'Trial Balance' : 'General Ledger'}...`);
    
//     try {
//       const formData = new FormData();
//       if (type === 'TB') {
//         formData.append('engagementId', engagement.id);
//         formData.append('period', engagement.yearEnd ? new Date(engagement.yearEnd).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
//         formData.append('file', file);
//         await apiClient.importTrialBalance(formData);
//       } else {
//         formData.append('file', file);
//         await apiClient.importLedger(engagement.id, formData);
//       }
      
//       toast.success(`${type === 'TB' ? 'Trial Balance' : 'Ledger'} Imported Successfully!`, { id: toastId });
//       fetchData();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message?.message || error.response?.data?.message || 'Import failed', { id: toastId });
//     } finally {
//       setUploading(false);
//       event.target.value = '';
//     }
//   };

//   // --- 2. Action Handlers ---
//   const handleExport = async () => {
//     if (!tbId) return;
//     const toastId = toast.loading('Preparing Export...');
//     try {
//       if (activeTab === 'mapping') {
//         await apiClient.exportMappings(tbId);
//         toast.success('Mappings exported successfully!', { id: toastId });
//       } else {
//         await apiClient.exportTrialBalance(tbId);
//         toast.success('TB exported successfully!', { id: toastId });
//       }
//     } catch (error) { toast.error('Export failed.', { id: toastId }); }
//   };

//   const handleDeleteTB = async () => {
//     if (!tbId) return;
//     if (!window.confirm("Are you sure you want to delete this Trial Balance? This will remove all accounts, mappings, and adjustments.")) return;
    
//     try {
//       await apiClient.deleteTrialBalance(tbId);
//       toast.success("Trial Balance deleted.");
//       fetchData(); 
//     } catch (error) { toast.error("Failed to delete Trial Balance."); }
//   };

//   // --- 3. Mapping Handlers ---
//   const handleAutoMap = async () => {
//     if (!tbId) return;
//     setMappingLoading(true);
//     const toastId = toast.loading('AI Auto-Mapping in progress...');
//     try {
//       const res: any = await apiClient.autoMapTrialBalance(tbId);
//       toast.success(`Auto-mapping complete! ${res.data?.autoMappedCount || 0} accounts mapped.`, { id: toastId });
//       fetchData(); // Refresh to get new mappings and updated lead schedules/statements
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to auto-map accounts.', { id: toastId });
//     } finally {
//       setMappingLoading(false);
//     }
//   };

//   const handleManualMap = async (accountId: string, category: string) => {
//     if (!tbId || !category) return;
//     try {
//       await apiClient.manualMapAccount({ trialBalanceId: tbId, accountId, mappedCategory: category });
//       toast.success('Account mapped');
//       fetchData(); // Refresh everything so the Draft Statements update instantly
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Mapping failed');
//     }
//   };

//   // --- 4. Adjustment Handlers ---
//   const openAjeModal = (account: any) => {
//     setSelectedAccount(account);
//     setAjeForm({ debit: 0, credit: 0, description: '' });
//     setIsAjeModalOpen(true);
//   };

//   const handlePostAje = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!tbId || !selectedAccount) return;
//     if (ajeForm.debit === 0 && ajeForm.credit === 0) return toast.error("Must enter a debit or credit amount.");

//     const toastId = toast.loading('Posting Adjustment...');
//     try {
//       await apiClient.addAdjustment(tbId, selectedAccount.accountId, {
//         debit: Number(ajeForm.debit), credit: Number(ajeForm.credit), description: ajeForm.description || 'Manual Adjustment'
//       });
//       toast.success('Adjustment posted!', { id: toastId });
//       setIsAjeModalOpen(false);
//       fetchData(); 
//     } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to post AJE', { id: toastId }); }
//   };

//   const formatCurrency = (val: number | undefined) => {
//     if (val === undefined || val === null) return '-';
//     const isNegative = val < 0;
//     return (isNegative ? `(${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
//   };

//   if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
//       {/* Header & Tabs */}
//       <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
//         <div className="p-6 pb-0">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Acquisition</h2>
//               <p className="text-slate-500 mt-1">Manage the working trial balance, mapping, and general ledger.</p>
//             </div>
            
//             <div className="flex space-x-3">
//               {tbId && (
//                 <>
//                   <button onClick={handleExport} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
//                     <DocumentArrowDownIcon className="w-4 h-4 mr-2" /> Export {activeTab === 'mapping' ? 'Mappings' : 'WTB'}
//                   </button>
//                   <RoleGuard minRole="MANAGER">
//                     <button onClick={handleDeleteTB} className="flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 shadow-sm transition-colors">
//                       <TrashIcon className="w-4 h-4 mr-2" /> Clear TB
//                     </button>
//                   </RoleGuard>
//                 </>
//               )}
//             </div>
//           </div>
          
//           <nav className="flex space-x-2 overflow-x-auto">
//             {TABS.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 disabled={!tbId && tab.id !== 'ledger' && tab.id !== 'wtb'}
//                 className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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

//       {/* Empty State if No Trial Balance */}
//       {!tbId && activeTab === 'wtb' && !loading && (
//         <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
//           <TableCellsIcon className="w-16 h-16 text-slate-300 mb-4" />
//           <h3 className="text-xl font-bold text-slate-800">No Trial Balance Found</h3>
//           <p className="text-slate-500 mt-2 max-w-md">Import a trial balance CSV or Excel file to automatically generate lead schedules and financial statements.</p>
//           <label className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-sm font-bold text-white hover:bg-indigo-700 shadow-sm cursor-pointer">
//             <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
//             {uploading ? 'Importing...' : 'Upload Trial Balance'}
//             <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => handleImport(e, 'TB')} disabled={uploading} />
//           </label>
//         </div>
//       )}

//       {/* Main Content Area */}
//       {tbId && (
//         <div className="flex-1 bg-white overflow-hidden flex flex-col p-6">
          
//           {/* ========================================== */}
//           {/* TAB 1: WORKING TRIAL BALANCE */}
//           {/* ========================================== */}
//           {activeTab === 'wtb' && (
//             <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
//               {summary && (
//                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap justify-between items-center gap-4">
//                   <div className="flex space-x-8">
//                     <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p><p className="text-sm font-black text-slate-900 mt-1">{summary.totalAccounts}</p></div>
//                     <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debits</p><p className="text-sm font-black text-slate-900 mt-1 font-mono">{formatCurrency(summary.totalDebits)}</p></div>
//                     <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credits</p><p className="text-sm font-black text-slate-900 mt-1 font-mono">{formatCurrency(summary.totalCredits)}</p></div>
//                   </div>
//                   <div>
//                     {summary.isBalanced ? <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200"><CheckCircleIcon className="w-4 h-4 mr-1.5" /> TB Balanced</span> : <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200"><XCircleIcon className="w-4 h-4 mr-1.5" /> Out of Balance</span>}
//                   </div>
//                 </div>
//               )}

//               <div className="flex-1 border border-slate-200 rounded-xl shadow-sm overflow-auto">
//                 <table className="min-w-full divide-y divide-slate-200">
//                   <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th>
//                       <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
//                       <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Unadjusted Bal</th>
//                       <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Debit (AJE)</th>
//                       <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Credit (AJE)</th>
//                       <th className="px-6 py-3 text-right text-xs font-bold text-indigo-700 uppercase bg-indigo-50/50">Adjusted Bal</th>
//                       <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-slate-200">
//                     {reconciliation.map(acc => (
//                       <tr key={acc.accountId} className="hover:bg-slate-50 transition-colors">
//                         <td className="px-6 py-3 text-sm font-bold text-slate-700">{acc.accountNumber}</td>
//                         <td className="px-6 py-3 text-sm font-medium text-slate-900">{acc.accountName}</td>
//                         <td className="px-6 py-3 text-sm text-slate-700 text-right font-mono">{formatCurrency(acc.unadjustedBalance)}</td>
//                         <td className="px-6 py-3 text-sm text-center text-slate-500 font-mono">{acc.adjustments.debit > 0 ? formatCurrency(acc.adjustments.debit) : '-'}</td>
//                         <td className="px-6 py-3 text-sm text-center text-slate-500 font-mono">{acc.adjustments.credit > 0 ? formatCurrency(acc.adjustments.credit) : '-'}</td>
//                         <td className={`px-6 py-3 text-sm font-bold text-right font-mono ${acc.isAdjusted ? 'bg-indigo-50/50 text-indigo-700' : 'text-slate-900'}`}>{formatCurrency(acc.adjustedBalance)}</td>
//                         <td className="px-6 py-3 text-center">
//                           <button onClick={() => openAjeModal(acc)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors" title="Post Adjustment"><PlusIcon className="w-4 h-4" /></button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* ========================================== */}
//           {/* TAB 2: ACCOUNT MAPPING */}
//           {/* ========================================== */}
//           {activeTab === 'mapping' && tbDetails && (
//             <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
              
//               {/* Mapping Stats Header */}
//               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-between items-center">
//                 <div className="flex space-x-6 items-center">
//                   <div>
//                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapping Progress</p>
//                     <div className="flex items-center mt-1">
//                       <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden mr-3">
//                         <div className="h-full bg-green-500 rounded-full" style={{ width: `${mappingStats?.mappingRate || 0}%` }}></div>
//                       </div>
//                       <span className="text-sm font-black text-slate-900">{mappingStats?.mappingRate || 0}%</span>
//                     </div>
//                   </div>
//                   <div className="h-8 w-px bg-slate-300"></div>
//                   <div className="flex space-x-6">
//                     <div><p className="text-xs font-bold text-slate-500 uppercase">Mapped</p><p className="text-sm font-bold text-green-600">{mappingStats?.mappedAccounts || 0}</p></div>
//                     <div><p className="text-xs font-bold text-slate-500 uppercase">Unmapped</p><p className="text-sm font-bold text-red-600">{mappingStats?.unmappedAccounts || 0}</p></div>
//                     <div><p className="text-xs font-bold text-slate-500 uppercase">Total</p><p className="text-sm font-bold text-slate-900">{mappingStats?.totalAccounts || 0}</p></div>
//                   </div>
//                 </div>

//                 <RoleGuard minRole="SENIOR">
//                   <button 
//                     onClick={handleAutoMap}
//                     disabled={mappingLoading}
//                     className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70"
//                   >
//                     {mappingLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <BoltIcon className="w-4 h-4 mr-2" />}
//                     Run AI Auto-Map
//                   </button>
//                 </RoleGuard>
//               </div>

//               {/* Mapping Table */}
//               <div className="flex-1 border border-slate-200 rounded-xl shadow-sm overflow-auto">
//                 <table className="min-w-full divide-y divide-slate-200">
//                   <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th>
//                       <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
//                       <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Balance</th>
//                       <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Assign FSLI Category</th>
//                       <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-slate-200">
//                     {tbDetails.accounts.map((acc: any) => {
//                       const currentMapping = acc.mappings?.[0]; // Assume 1 active mapping per account for UI
//                       const isMapped = !!currentMapping;
                      
//                       return (
//                         <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
//                           <td className="px-6 py-3 text-sm font-bold text-slate-700">{acc.accountNumber}</td>
//                           <td className="px-6 py-3 text-sm font-medium text-slate-900">{acc.accountName}</td>
//                           <td className="px-6 py-3 text-sm text-slate-700 text-right font-mono">{formatCurrency(Number(acc.balance))}</td>
//                           <td className="px-6 py-3">
//                             <select 
//                               className={`w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${!isMapped ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white text-slate-900'}`}
//                               value={currentMapping?.mappedCategory || ''}
//                               onChange={(e) => handleManualMap(acc.id, e.target.value)}
//                             >
//                               <option value="" disabled>-- Select Category --</option>
//                               {categories.map((cat: any) => (
//                                 <option key={cat.category} value={cat.category}>{cat.category.replace(/_/g, ' ')}</option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="px-6 py-3 text-center">
//                             {isMapped ? (
//                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${currentMapping.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
//                                 {currentMapping.isManual ? 'Manual' : `Auto (${(currentMapping.confidence * 100).toFixed(0)}%)`}
//                               </span>
//                             ) : (
//                               <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
//                                 <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Unmapped
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//             </div>
//           )}

//           {/* ========================================== */}
//           {/* TAB 3: LEAD SCHEDULES */}
//           {/* ========================================== */}
//           {activeTab === 'lead_schedules' && (
//             <div className="flex-1 overflow-y-auto animate-fade-in space-y-6">
//               {leadSchedules.length === 0 && (
//                 <div className="text-center text-slate-500 mt-12">No mapped accounts to generate schedules. Map accounts first.</div>
//               )}
//               {leadSchedules.map((category, idx) => (
//                 <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
//                   <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
//                     <h3 className="text-lg font-bold text-slate-800">{category.categoryName.replace(/_/g, ' ')}</h3>
//                     <span className="text-sm font-bold text-slate-600 font-mono">Net: {formatCurrency(category.netBalance)}</span>
//                   </div>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-slate-100">
//                       <thead className="bg-slate-50">
//                         <tr><th className="px-6 py-2 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th><th className="px-6 py-2 text-left text-xs font-bold text-slate-500 uppercase">Name</th><th className="px-6 py-2 text-right text-xs font-bold text-slate-500 uppercase">Type</th><th className="px-6 py-2 text-right text-xs font-bold text-slate-500 uppercase">Balance</th></tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100">
//                         {category.accounts.map((acc: any) => (
//                           <tr key={acc.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-2 text-sm text-slate-600 font-medium">{acc.accountNumber}</td><td className="px-6 py-2 text-sm text-slate-900 font-bold">{acc.accountName}</td><td className="px-6 py-2 text-sm text-slate-500 text-right">{acc.accountType}</td><td className="px-6 py-2 text-sm text-slate-900 text-right font-mono">{formatCurrency(Number(acc.balance))}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* ========================================== */}
//           {/* TAB 4: DRAFT FINANCIAL STATEMENTS */}
//           {/* ========================================== */}
//           {activeTab === 'statements' && statements && (
//             <div className="flex-1 overflow-y-auto animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
//                 <h3 className="text-xl font-black text-slate-900 text-center mb-1">Income Statement</h3>
//                 <p className="text-xs font-bold text-slate-500 uppercase text-center mb-6">Generated: {new Date(statements.generatedAt).toLocaleString()}</p>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Revenue</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.incomeStatement.totalRevenue)}</span></div>
//                   <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Expenses</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.incomeStatement.totalExpenses)}</span></div>
//                   <div className="flex justify-between items-end pt-4"><span className="text-lg font-black text-slate-900 uppercase">Net Income</span><span className={`text-2xl font-mono font-black ${statements.incomeStatement.netIncome > 0 ? 'text-green-600' : 'text-red-600'} double-underline`}>{formatCurrency(statements.incomeStatement.netIncome)}</span></div>
//                 </div>
//               </div>
//               <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
//                 <h3 className="text-xl font-black text-slate-900 text-center mb-1">Balance Sheet</h3>
//                 <div className="flex justify-center mb-6 mt-1">
//                   {statements.balanceSheet.isBalanced ? <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Balanced</span> : <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Out of Balance</span>}
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Assets</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalAssets)}</span></div>
//                   <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Liabilities</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalLiabilities)}</span></div>
//                   <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Equity (inc. current earnings)</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalEquity)}</span></div>
//                   <div className="flex justify-between items-end pt-4"><span className="text-lg font-black text-slate-900 uppercase">Liabilities & Equity</span><span className="text-2xl font-mono font-black text-indigo-900 double-underline">{formatCurrency(statements.balanceSheet.totalLiabilities + statements.balanceSheet.totalEquity)}</span></div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ========================================== */}
//           {/* TAB 5: LEDGER & HISTORY */}
//           {/* ========================================== */}
//           {activeTab === 'ledger' && (
//             <div className="flex-1 overflow-y-auto animate-fade-in space-y-8">
//               <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-bold text-slate-800">General Ledger Import</h3>
//                   <p className="text-sm text-slate-500 mt-1">Upload detailed transaction data to support substantive testing.</p>
//                 </div>
//                 <label className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 shadow-sm cursor-pointer transition-colors">
//                   <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
//                   {uploading ? 'Uploading...' : 'Import Ledger (CSV)'}
//                   <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => handleImport(e, 'LEDGER')} disabled={uploading} />
//                 </label>
//               </div>

//               <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
//                 <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
//                   <ClockIcon className="w-5 h-5 text-slate-500 mr-2" />
//                   <h3 className="text-sm font-bold text-slate-800">Data Import History</h3>
//                 </div>
//                 {history.length === 0 ? (
//                   <div className="p-8 text-center text-slate-500 text-sm">No imports recorded yet.</div>
//                 ) : (
//                   <table className="min-w-full divide-y divide-slate-200">
//                     <thead className="bg-white">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
//                         <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Accounts</th>
//                         <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total Debits</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                       {history.map((item: any) => (
//                         <tr key={item.id} className="hover:bg-slate-50">
//                           <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
//                           <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.description}</td>
//                           <td className="px-6 py-4 text-sm text-center font-bold text-slate-700">{item._count?.accounts || 0}</td>
//                           <td className="px-6 py-4 text-sm text-right font-mono text-slate-600">{formatCurrency(Number(item.totalDebits))}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           )}

//         </div>
//       )}

//       {/* ========================================== */}
//       {/* ADJUSTMENT MODAL */}
//       {/* ========================================== */}
//       <Transition appear show={isAjeModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-50" onClose={() => setIsAjeModalOpen(false)}>
//           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
//             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
//           </Transition.Child>
//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">Post Adjusting Entry (AJE)</Dialog.Title>
                  
//                   {selectedAccount && (
//                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
//                       <p className="text-xs font-bold text-slate-500 uppercase">Target Account</p>
//                       <p className="text-sm font-bold text-slate-800 mt-1">{selectedAccount.accountNumber} - {selectedAccount.accountName}</p>
//                     </div>
//                   )}

//                   <form onSubmit={handlePostAje} className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Debit Amount</label><input type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.debit} onChange={e => setAjeForm({...ajeForm, debit: Number(e.target.value)})} /></div>
//                       <div><label className="block text-sm font-bold text-slate-700 mb-1">Credit Amount</label><input type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.credit} onChange={e => setAjeForm({...ajeForm, credit: Number(e.target.value)})} /></div>
//                     </div>
//                     <div><label className="block text-sm font-bold text-slate-700 mb-1">Description / Memo</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.description} onChange={e => setAjeForm({...ajeForm, description: e.target.value})} placeholder="Reason for adjustment..." /></div>
                    
//                     <div className="mt-6 flex justify-end space-x-3 pt-4">
//                       <button type="button" onClick={() => setIsAjeModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
//                       <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Post Adjustment</button>
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

// export default TrialBalancePhase;



// new account mapping modal


// src/pages/Workspace/TrialBalancePhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ArrowUpTrayIcon, DocumentArrowDownIcon, CheckCircleIcon, XCircleIcon,
  TableCellsIcon, DocumentChartBarIcon, BanknotesIcon, TrashIcon,
  ClockIcon, PlusIcon, ListBulletIcon, BoltIcon, ExclamationTriangleIcon,
  CheckBadgeIcon, LightBulbIcon, ShieldExclamationIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { Engagement } from '../../types';
import apiClient from '../../utils/api';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TABS = [
  { id: 'wtb', label: 'Working Trial Balance', icon: TableCellsIcon },
  { id: 'mapping', label: 'Account Mapping', icon: BoltIcon },
  { id: 'lead_schedules', label: 'Lead Schedules', icon: DocumentChartBarIcon },
  { id: 'statements', label: 'Draft Statements', icon: BanknotesIcon },
  { id: 'ledger', label: 'Ledger & History', icon: ListBulletIcon }
];

const TrialBalancePhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const [activeTab, setActiveTab] = useState('wtb');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mappingLoading, setMappingLoading] = useState(false);

  // Data States
  const [tbId, setTbId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any[]>([]);
  const [leadSchedules, setLeadSchedules] = useState<any[]>([]);
  const [statements, setStatements] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // Mapping Specific States
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [mappedAccounts, setMappedAccounts] = useState<any[]>([]);
  const [mappingStats, setMappingStats] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Adjustment Modal States
  const [isAjeModalOpen, setIsAjeModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [ajeForm, setAjeForm] = useState({ debit: 0, credit: 0, description: '' });

  // Mapping Review Modal States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapModalAccount, setMapModalAccount] = useState<any>(null);
  const [mapSuggestions, setMapSuggestions] = useState<any[]>([]);
  const [selectedTaxNodeId, setSelectedTaxNodeId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tbRes, histRes, taxRes] = await Promise.all([
        apiClient.getTrialBalances(),
        apiClient.getImportHistory(),
        apiClient.getTaxonomy().catch(() => ({ data: [] }))
      ]);
      
      setHistory(histRes.data || []);
      setTaxonomy(taxRes.data || []);
      
      const allTbs = tbRes.data?.trialBalances || [];
      const currentTb = allTbs.find((tb: any) => tb.engagementId === engagement.id);

      if (currentTb) {
        setTbId(currentTb.id);
        const [sumRes, reconRes, leadRes, stateRes, mapListRes, statsRes, validRes] = await Promise.all([
          apiClient.getTrialBalanceSummary(currentTb.id),
          apiClient.getReconciliation(engagement.id),
          apiClient.getLeadSchedules(engagement.id),
          apiClient.getDraftStatements(engagement.id),
          apiClient.getMappingsForTrialBalance(currentTb.id).catch(() => ({ data: [] })),
          apiClient.getMappingStats(currentTb.id).catch(() => ({ data: null })),
          apiClient.validateMappings(currentTb.id, engagement.id).catch(() => ({ data: [] }))
        ]);

        setSummary(sumRes.data?.summary);
        setReconciliation(reconRes.data?.report || []);
        setLeadSchedules(leadRes.data || []);
        setStatements(stateRes.data || null);
        setMappedAccounts(mapListRes.data || []);
        setMappingStats(statsRes.data || null);
        setValidationErrors(validRes.data || []);
      } else {
        setTbId(null);
      }
    } catch (error) {
      console.error("Failed to fetch Trial Balance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [engagement.id]);

  const groupedTaxonomy = taxonomy.reduce((acc, node) => {
    if (!acc[node.fsStatement]) acc[node.fsStatement] = [];
    acc[node.fsStatement].push(node);
    return acc;
  }, {} as Record<string, any[]>);

  // --- Import/Export Actions ---
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, type: 'TB' | 'LEDGER') => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading(`Importing ${type === 'TB' ? 'Trial Balance' : 'General Ledger'}...`);
    try {
      const formData = new FormData();
      if (type === 'TB') {
        formData.append('engagementId', engagement.id);
        formData.append('period', engagement.yearEnd ? new Date(engagement.yearEnd).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        formData.append('file', file);
        await apiClient.importTrialBalance(formData);
      } else {
        formData.append('file', file);
        await apiClient.importLedger(engagement.id, formData);
      }
      toast.success(`${type === 'TB' ? 'Trial Balance' : 'Ledger'} Imported Successfully!`, { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message?.message || error.response?.data?.message || 'Import failed', { id: toastId });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleExport = async () => {
    if (!tbId) return;
    const toastId = toast.loading('Preparing Export...');
    try {
      if (activeTab === 'mapping') {
        await apiClient.exportMappings(tbId);
        toast.success('Mappings exported successfully!', { id: toastId });
      } else {
        await apiClient.exportTrialBalance(tbId);
        toast.success('TB exported successfully!', { id: toastId });
      }
    } catch (error) { toast.error('Export failed.', { id: toastId }); }
  };

  const handleDeleteTB = async () => {
    if (!tbId) return;
    if (!window.confirm("Are you sure you want to delete this Trial Balance? This will remove all accounts, mappings, and adjustments.")) return;
    try {
      await apiClient.deleteTrialBalance(tbId);
      toast.success("Trial Balance deleted.");
      fetchData(); 
    } catch (error) { toast.error("Failed to delete Trial Balance."); }
  };

  // --- Mapping Actions ---
  const handleAutoMap = async () => {
    if (!tbId) return;
    setMappingLoading(true);
    const toastId = toast.loading('AI Auto-Mapping in progress...');
    try {
      const res: any = await apiClient.autoMapTrialBalance(tbId);
      toast.success(`Auto-mapping complete! ${res.data?.autoMappedCount || 0} accounts mapped.`, { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to auto-map accounts.', { id: toastId });
    } finally {
      setMappingLoading(false);
    }
  };

  // Review Mapping Modal Handlers
  const openMappingReviewModal = async (account: any) => {
    setMapModalAccount(account);
    setSelectedTaxNodeId(account.taxonomyNode?.id || '');
    setOverrideReason(account.overrideReason || '');
    setIsMapModalOpen(true);
    setSuggestionsLoading(true);
    try {
      const res = await apiClient.getMappingSuggestions(account.accountId);
      setMapSuggestions(res.data?.suggestions || []);
    } catch (error) {
      setMapSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const submitManualMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tbId || !selectedTaxNodeId || !mapModalAccount) return;
    const toastId = toast.loading('Saving mapping review...');
    try {
      await apiClient.manualMapAccount({ 
        accountId: mapModalAccount.accountId, 
        taxonomyNodeId: selectedTaxNodeId, 
        overrideReason 
      });
      toast.success('Mapping Confirmed & Reviewed', { id: toastId });
      setIsMapModalOpen(false);
      fetchData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mapping failed', { id: toastId });
    }
  };

  const handleApproveMapping = async (mappingId: string) => {
    const toastId = toast.loading('Approving mapping...');
    try {
      await apiClient.approveMapping(mappingId);
      toast.success('Approved! Downstream procedures generated.', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error('Approval failed', { id: toastId });
    }
  };

  // --- Adjustment Handlers ---
  const openAjeModal = (account: any) => {
    setSelectedAccount(account);
    setAjeForm({ debit: 0, credit: 0, description: '' });
    setIsAjeModalOpen(true);
  };

  const handlePostAje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tbId || !selectedAccount) return;
    if (ajeForm.debit === 0 && ajeForm.credit === 0) return toast.error("Must enter a debit or credit amount.");
    const toastId = toast.loading('Posting Adjustment...');
    try {
      await apiClient.addAdjustment(tbId, selectedAccount.accountId, {
        debit: Number(ajeForm.debit), credit: Number(ajeForm.credit), description: ajeForm.description || 'Manual Adjustment'
      });
      toast.success('Adjustment posted!', { id: toastId });
      setIsAjeModalOpen(false);
      fetchData(); 
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to post AJE', { id: toastId }); }
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return '-';
    const isNegative = val < 0;
    return (isNegative ? `(${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[75vh]">
      
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Acquisition</h2>
              <p className="text-slate-500 mt-1">Manage the working trial balance, mapping, and general ledger.</p>
            </div>
            
            <div className="flex space-x-3">
              {tbId && (
                <>
                  <button onClick={handleExport} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" /> Export {activeTab === 'mapping' ? 'Mappings' : 'WTB'}
                  </button>
                  <RoleGuard minRole="MANAGER">
                    <button onClick={handleDeleteTB} className="flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 shadow-sm transition-colors">
                      <TrashIcon className="w-4 h-4 mr-2" /> Clear TB
                    </button>
                  </RoleGuard>
                </>
              )}
            </div>
          </div>
          
          <nav className="flex space-x-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!tbId && tab.id !== 'ledger' && tab.id !== 'wtb'}
                className={`flex items-center py-3 px-4 rounded-t-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
      {tbId && (
        <div className="flex-1 bg-white overflow-hidden flex flex-col p-6">
          
          {/* ========================================== */}
          {/* TAB 1: WORKING TRIAL BALANCE */}
          {/* ========================================== */}
          {activeTab === 'wtb' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
               {/* ... (Keep existing WTB content intact) ... */}
               <div className="flex-1 border border-slate-200 rounded-xl shadow-sm overflow-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Unadjusted Bal</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Debit (AJE)</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Credit (AJE)</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-indigo-700 uppercase bg-indigo-50/50">Adjusted Bal</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {reconciliation.map(acc => (
                      <tr key={acc.accountId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-bold text-slate-700">{acc.accountNumber}</td>
                        <td className="px-6 py-3 text-sm font-medium text-slate-900">{acc.accountName}</td>
                        <td className="px-6 py-3 text-sm text-slate-700 text-right font-mono">{formatCurrency(acc.unadjustedBalance)}</td>
                        <td className="px-6 py-3 text-sm text-center text-slate-500 font-mono">{acc.adjustments.debit > 0 ? formatCurrency(acc.adjustments.debit) : '-'}</td>
                        <td className="px-6 py-3 text-sm text-center text-slate-500 font-mono">{acc.adjustments.credit > 0 ? formatCurrency(acc.adjustments.credit) : '-'}</td>
                        <td className={`px-6 py-3 text-sm font-bold text-right font-mono ${acc.isAdjusted ? 'bg-indigo-50/50 text-indigo-700' : 'text-slate-900'}`}>{formatCurrency(acc.adjustedBalance)}</td>
                        <td className="px-6 py-3 text-center">
                          <button onClick={() => openAjeModal(acc)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors" title="Post Adjustment"><PlusIcon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: ACCOUNT MAPPING */}
          {/* ========================================== */}
          {activeTab === 'mapping' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
              
              {/* Validation Exceptions Banner */}
              {validationErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start">
                  <ShieldExclamationIcon className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Cross-Account Intelligence Warnings</h4>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {validationErrors.map((err, idx) => (
                        <li key={idx} className="text-sm text-amber-700">{err.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Mapping Stats Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-between items-center">
                <div className="flex space-x-6 items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapping Progress</p>
                    <div className="flex items-center mt-1">
                      <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden mr-3">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${mappingStats?.mappingRate || 0}%` }}></div>
                      </div>
                      <span className="text-sm font-black text-slate-900">{mappingStats?.mappingRate || 0}%</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-300"></div>
                  <div className="flex space-x-6">
                    <div><p className="text-xs font-bold text-slate-500 uppercase">Approved</p><p className="text-sm font-bold text-green-600">{(mappingStats?.APPROVED || 0) + (mappingStats?.AUTO_APPROVED_TRIVIAL || 0)}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase">To Review</p><p className="text-sm font-bold text-amber-600">{(mappingStats?.SUGGESTED || 0) + (mappingStats?.REVIEWED || 0)}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase">Unmapped</p><p className="text-sm font-bold text-red-600">{mappingStats?.unmappedAccounts || 0}</p></div>
                  </div>
                </div>

                <RoleGuard minRole="SENIOR">
                  <button 
                    onClick={handleAutoMap}
                    disabled={mappingLoading}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-70"
                  >
                    {mappingLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <BoltIcon className="w-4 h-4 mr-2" />}
                    Run AI Auto-Map
                  </button>
                </RoleGuard>
              </div>

              {/* Mapping Table */}
              <div className="flex-1 border border-slate-200 rounded-xl shadow-sm overflow-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">IFRS Taxonomy Node</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {mappedAccounts.map((acc: any) => {
                      const isMapped = !!acc.mappingId;
                      const isApproved = acc.status === 'APPROVED' || acc.status === 'AUTO_APPROVED_TRIVIAL';
                      const needsReview = acc.status === 'SUGGESTED' || acc.status === 'UNMAPPED';
                      
                      return (
                        <tr key={acc.accountId} className={`hover:bg-slate-50 transition-colors ${needsReview ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{acc.accountNumber}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {acc.accountName}
                            {acc.overrideReason && <p className="text-xs text-slate-500 mt-1 italic">Reason: {acc.overrideReason}</p>}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">{formatCurrency(acc.balance)}</td>
                          <td className="px-6 py-4">
                            {acc.taxonomyNode ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{acc.taxonomyNode.code} - {acc.taxonomyNode.name}</span>
                                {acc.confidence && acc.status === 'SUGGESTED' && (
                                  <span className="text-xs font-medium text-indigo-600 mt-0.5">AI Confidence: {(acc.confidence * 100).toFixed(1)}%</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm italic text-slate-400">-- No node assigned --</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {!isMapped ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                                Unmapped
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isApproved ? 'bg-green-100 text-green-800' : 
                                acc.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {acc.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              {!isApproved && (
                                <button 
                                  onClick={() => openMappingReviewModal(acc)}
                                  className="flex items-center text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded shadow-sm transition-colors"
                                >
                                  <EyeIcon className="w-3.5 h-3.5 mr-1" />
                                  {isMapped ? 'Review' : 'Map'}
                                </button>
                              )}
                              {isMapped && !isApproved && acc.status === 'REVIEWED' && (
                                <RoleGuard minRole="MANAGER">
                                  <button 
                                    onClick={() => handleApproveMapping(acc.mappingId)}
                                    className="flex items-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded shadow-sm transition-colors"
                                  >
                                    <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" /> Approve
                                  </button>
                                </RoleGuard>
                              )}
                              {isApproved && <CheckBadgeIcon className="w-6 h-6 text-green-500" title="Approved & Locked" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ... (Keep existing Tabs 3, 4, 5 intact) ... */}

        </div>
      )}

      {/* ========================================== */}
      {/* REVIEW & MAPPING MODAL */}
      {/* ========================================== */}
      <Transition appear show={isMapModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsMapModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  
                  <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3"><LightBulbIcon className="w-6 h-6 text-indigo-700" /></div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold text-slate-900">Review Account Mapping</Dialog.Title>
                      <p className="text-sm text-slate-500">Confirm AI suggestions or assign manually.</p>
                    </div>
                  </div>
                  
                  {mapModalAccount && (
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Account</p>
                        <p className="text-lg font-black text-slate-800">{mapModalAccount.accountNumber}</p>
                        <p className="text-sm font-medium text-slate-600 mt-1">{mapModalAccount.accountName}</p>
                        <p className="text-sm font-mono font-bold text-indigo-700 mt-3 border-t border-slate-200 pt-2">Bal: {formatCurrency(mapModalAccount.balance)}</p>
                      </div>
                      
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">AI Rationale Engine</p>
                        {mapModalAccount.confidenceLog && mapModalAccount.confidenceLog.length > 0 ? (
                          <ul className="space-y-2">
                            {mapModalAccount.confidenceLog.map((log: string, idx: number) => (
                              <li key={idx} className="flex items-start text-sm text-indigo-900 font-medium">
                                <CheckCircleIcon className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                                {log}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No historical or rule-based rationale found. Relying on string similarity.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={submitManualMap}>
                    <div className="space-y-5">
                      
                      {/* AI Suggestions Row */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Top AI Suggestions</label>
                        {suggestionsLoading ? (
                          <div className="py-4 text-center"><LoadingSpinner size="sm" /></div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {mapSuggestions.slice(0, 4).map((sugg) => (
                              <div 
                                key={sugg.taxonomyNodeId} 
                                onClick={() => setSelectedTaxNodeId(sugg.taxonomyNodeId)}
                                className={`cursor-pointer p-3 rounded-lg border text-sm transition-all ${selectedTaxNodeId === sugg.taxonomyNodeId ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                              >
                                <p className="font-bold text-slate-800 line-clamp-1">{sugg.name}</p>
                                <p className="text-xs text-slate-500 mt-1">Sim Score: {(sugg.confidence * 100).toFixed(0)}%</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fallback Dropdown */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Or Select Full Taxonomy Node</label>
                        <select 
                          required
                          className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                          value={selectedTaxNodeId}
                          onChange={(e) => setSelectedTaxNodeId(e.target.value)}
                        >
                          <option value="" disabled>-- Select Taxonomy Node --</option>
                          {Object.entries(groupedTaxonomy).map(([statement, nodes]) => (
                            <optgroup key={statement} label={statement.replace(/_/g, ' ')}>
                              {nodes.map(node => (
                                <option key={node.id} value={node.id}>{node.code} - {node.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Override Reason */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Review Note / Audit Trail Override (Optional)</label>
                        <textarea 
                          rows={2} 
                          className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                          value={overrideReason} 
                          onChange={e => setOverrideReason(e.target.value)} 
                          placeholder="e.g., Client reclassified this account..." 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3 border-t border-slate-100 pt-5">
                      <button type="button" onClick={() => setIsMapModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Confirm & Mark as Reviewed</button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* AJE Modal remains the same */}
    </div>
  );
};

export default TrialBalancePhase;