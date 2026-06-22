// src/pages/Workspace/TrialBalancePhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ArrowUpTrayIcon, DocumentArrowDownIcon, CheckCircleIcon, XCircleIcon,
  TableCellsIcon, DocumentChartBarIcon, BanknotesIcon, TrashIcon,
  ClockIcon, PlusIcon, ListBulletIcon, BoltIcon, ExclamationTriangleIcon
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
  const [tbDetails, setTbDetails] = useState<any>(null); // Holds raw accounts + mapping arrays
  const [mappingStats, setMappingStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Adjustment Modal States
  const [isAjeModalOpen, setIsAjeModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [ajeForm, setAjeForm] = useState({ debit: 0, credit: 0, description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tbRes, histRes, catRes] = await Promise.all([
        apiClient.getTrialBalances(),
        apiClient.getImportHistory(),
        apiClient.getMappingCategories().catch(() => ({ data: [] }))
      ]);
      
      setHistory(histRes.data || []);
      setCategories(catRes.data || []);
      
      const allTbs = tbRes.data?.trialBalances || [];
      const currentTb = allTbs.find((tb: any) => tb.engagementId === engagement.id);

      if (currentTb) {
        setTbId(currentTb.id);
        const [sumRes, reconRes, leadRes, stateRes, detailRes, statsRes] = await Promise.all([
          apiClient.getTrialBalanceSummary(currentTb.id),
          apiClient.getReconciliation(engagement.id),
          apiClient.getLeadSchedules(engagement.id),
          apiClient.getDraftStatements(engagement.id),
          apiClient.getTrialBalanceById(currentTb.id),
          apiClient.getMappingStats(currentTb.id).catch(() => ({ data: null }))
        ]);

        setSummary(sumRes.data?.summary);
        setReconciliation(reconRes.data?.report || []);
        setLeadSchedules(leadRes.data || []);
        setStatements(stateRes.data || null);
        setTbDetails(detailRes.data || null);
        setMappingStats(statsRes.data || null);
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

  // --- 1. Import Handlers ---
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

  // --- 2. Action Handlers ---
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

  // --- 3. Mapping Handlers ---
  const handleAutoMap = async () => {
    if (!tbId) return;
    setMappingLoading(true);
    const toastId = toast.loading('AI Auto-Mapping in progress...');
    try {
      const res: any = await apiClient.autoMapTrialBalance(tbId);
      toast.success(`Auto-mapping complete! ${res.data?.autoMappedCount || 0} accounts mapped.`, { id: toastId });
      fetchData(); // Refresh to get new mappings and updated lead schedules/statements
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to auto-map accounts.', { id: toastId });
    } finally {
      setMappingLoading(false);
    }
  };

  const handleManualMap = async (accountId: string, category: string) => {
    if (!tbId || !category) return;
    try {
      await apiClient.manualMapAccount({ trialBalanceId: tbId, accountId, mappedCategory: category });
      toast.success('Account mapped');
      fetchData(); // Refresh everything so the Draft Statements update instantly
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mapping failed');
    }
  };

  // --- 4. Adjustment Handlers ---
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

      {/* Empty State if No Trial Balance */}
      {!tbId && activeTab === 'wtb' && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
          <TableCellsIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No Trial Balance Found</h3>
          <p className="text-slate-500 mt-2 max-w-md">Import a trial balance CSV or Excel file to automatically generate lead schedules and financial statements.</p>
          <label className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-sm font-bold text-white hover:bg-indigo-700 shadow-sm cursor-pointer">
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            {uploading ? 'Importing...' : 'Upload Trial Balance'}
            <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => handleImport(e, 'TB')} disabled={uploading} />
          </label>
        </div>
      )}

      {/* Main Content Area */}
      {tbId && (
        <div className="flex-1 bg-white overflow-hidden flex flex-col p-6">
          
          {/* ========================================== */}
          {/* TAB 1: WORKING TRIAL BALANCE */}
          {/* ========================================== */}
          {activeTab === 'wtb' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
              {summary && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex space-x-8">
                    <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p><p className="text-sm font-black text-slate-900 mt-1">{summary.totalAccounts}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debits</p><p className="text-sm font-black text-slate-900 mt-1 font-mono">{formatCurrency(summary.totalDebits)}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credits</p><p className="text-sm font-black text-slate-900 mt-1 font-mono">{formatCurrency(summary.totalCredits)}</p></div>
                  </div>
                  <div>
                    {summary.isBalanced ? <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200"><CheckCircleIcon className="w-4 h-4 mr-1.5" /> TB Balanced</span> : <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200"><XCircleIcon className="w-4 h-4 mr-1.5" /> Out of Balance</span>}
                  </div>
                </div>
              )}

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
          {activeTab === 'mapping' && tbDetails && (
            <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
              
              {/* Mapping Stats Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-between items-center">
                <div className="flex space-x-6 items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapping Progress</p>
                    <div className="flex items-center mt-1">
                      <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden mr-3">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${mappingStats?.mappingRate || 0}%` }}></div>
                      </div>
                      <span className="text-sm font-black text-slate-900">{mappingStats?.mappingRate || 0}%</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-300"></div>
                  <div className="flex space-x-6">
                    <div><p className="text-xs font-bold text-slate-500 uppercase">Mapped</p><p className="text-sm font-bold text-green-600">{mappingStats?.mappedAccounts || 0}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase">Unmapped</p><p className="text-sm font-bold text-red-600">{mappingStats?.unmappedAccounts || 0}</p></div>
                    <div><p className="text-xs font-bold text-slate-500 uppercase">Total</p><p className="text-sm font-bold text-slate-900">{mappingStats?.totalAccounts || 0}</p></div>
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
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Assign FSLI Category</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {tbDetails.accounts.map((acc: any) => {
                      const currentMapping = acc.mappings?.[0]; // Assume 1 active mapping per account for UI
                      const isMapped = !!currentMapping;
                      
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-sm font-bold text-slate-700">{acc.accountNumber}</td>
                          <td className="px-6 py-3 text-sm font-medium text-slate-900">{acc.accountName}</td>
                          <td className="px-6 py-3 text-sm text-slate-700 text-right font-mono">{formatCurrency(Number(acc.balance))}</td>
                          <td className="px-6 py-3">
                            <select 
                              className={`w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${!isMapped ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white text-slate-900'}`}
                              value={currentMapping?.mappedCategory || ''}
                              onChange={(e) => handleManualMap(acc.id, e.target.value)}
                            >
                              <option value="" disabled>-- Select Category --</option>
                              {categories.map((cat: any) => (
                                <option key={cat.category} value={cat.category}>{cat.category.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {isMapped ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${currentMapping.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {currentMapping.isManual ? 'Manual' : `Auto (${(currentMapping.confidence * 100).toFixed(0)}%)`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                                <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Unmapped
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: LEAD SCHEDULES */}
          {/* ========================================== */}
          {activeTab === 'lead_schedules' && (
            <div className="flex-1 overflow-y-auto animate-fade-in space-y-6">
              {leadSchedules.length === 0 && (
                <div className="text-center text-slate-500 mt-12">No mapped accounts to generate schedules. Map accounts first.</div>
              )}
              {leadSchedules.map((category, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{category.categoryName.replace(/_/g, ' ')}</h3>
                    <span className="text-sm font-bold text-slate-600 font-mono">Net: {formatCurrency(category.netBalance)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr><th className="px-6 py-2 text-left text-xs font-bold text-slate-500 uppercase">Acc #</th><th className="px-6 py-2 text-left text-xs font-bold text-slate-500 uppercase">Name</th><th className="px-6 py-2 text-right text-xs font-bold text-slate-500 uppercase">Type</th><th className="px-6 py-2 text-right text-xs font-bold text-slate-500 uppercase">Balance</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {category.accounts.map((acc: any) => (
                          <tr key={acc.id} className="hover:bg-slate-50">
                            <td className="px-6 py-2 text-sm text-slate-600 font-medium">{acc.accountNumber}</td><td className="px-6 py-2 text-sm text-slate-900 font-bold">{acc.accountName}</td><td className="px-6 py-2 text-sm text-slate-500 text-right">{acc.accountType}</td><td className="px-6 py-2 text-sm text-slate-900 text-right font-mono">{formatCurrency(Number(acc.balance))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: DRAFT FINANCIAL STATEMENTS */}
          {/* ========================================== */}
          {activeTab === 'statements' && statements && (
            <div className="flex-1 overflow-y-auto animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-black text-slate-900 text-center mb-1">Income Statement</h3>
                <p className="text-xs font-bold text-slate-500 uppercase text-center mb-6">Generated: {new Date(statements.generatedAt).toLocaleString()}</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Revenue</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.incomeStatement.totalRevenue)}</span></div>
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Expenses</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.incomeStatement.totalExpenses)}</span></div>
                  <div className="flex justify-between items-end pt-4"><span className="text-lg font-black text-slate-900 uppercase">Net Income</span><span className={`text-2xl font-mono font-black ${statements.incomeStatement.netIncome > 0 ? 'text-green-600' : 'text-red-600'} double-underline`}>{formatCurrency(statements.incomeStatement.netIncome)}</span></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-black text-slate-900 text-center mb-1">Balance Sheet</h3>
                <div className="flex justify-center mb-6 mt-1">
                  {statements.balanceSheet.isBalanced ? <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Balanced</span> : <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Out of Balance</span>}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Assets</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalAssets)}</span></div>
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Liabilities</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalLiabilities)}</span></div>
                  <div className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-slate-700">Total Equity (inc. current earnings)</span><span className="text-lg font-mono font-bold text-slate-900">{formatCurrency(statements.balanceSheet.totalEquity)}</span></div>
                  <div className="flex justify-between items-end pt-4"><span className="text-lg font-black text-slate-900 uppercase">Liabilities & Equity</span><span className="text-2xl font-mono font-black text-indigo-900 double-underline">{formatCurrency(statements.balanceSheet.totalLiabilities + statements.balanceSheet.totalEquity)}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: LEDGER & HISTORY */}
          {/* ========================================== */}
          {activeTab === 'ledger' && (
            <div className="flex-1 overflow-y-auto animate-fade-in space-y-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">General Ledger Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload detailed transaction data to support substantive testing.</p>
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 hover:bg-indigo-100 shadow-sm cursor-pointer transition-colors">
                  <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                  {uploading ? 'Uploading...' : 'Import Ledger (CSV)'}
                  <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => handleImport(e, 'LEDGER')} disabled={uploading} />
                </label>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                  <ClockIcon className="w-5 h-5 text-slate-500 mr-2" />
                  <h3 className="text-sm font-bold text-slate-800">Data Import History</h3>
                </div>
                {history.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No imports recorded yet.</div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Accounts</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total Debits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.description}</td>
                          <td className="px-6 py-4 text-sm text-center font-bold text-slate-700">{item._count?.accounts || 0}</td>
                          <td className="px-6 py-4 text-sm text-right font-mono text-slate-600">{formatCurrency(Number(item.totalDebits))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================== */}
      {/* ADJUSTMENT MODAL */}
      {/* ========================================== */}
      <Transition appear show={isAjeModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAjeModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">Post Adjusting Entry (AJE)</Dialog.Title>
                  
                  {selectedAccount && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
                      <p className="text-xs font-bold text-slate-500 uppercase">Target Account</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{selectedAccount.accountNumber} - {selectedAccount.accountName}</p>
                    </div>
                  )}

                  <form onSubmit={handlePostAje} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Debit Amount</label><input type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.debit} onChange={e => setAjeForm({...ajeForm, debit: Number(e.target.value)})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Credit Amount</label><input type="number" step="0.01" className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.credit} onChange={e => setAjeForm({...ajeForm, credit: Number(e.target.value)})} /></div>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Description / Memo</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={ajeForm.description} onChange={e => setAjeForm({...ajeForm, description: e.target.value})} placeholder="Reason for adjustment..." /></div>
                    
                    <div className="mt-6 flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={() => setIsAjeModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700">Post Adjustment</button>
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

export default TrialBalancePhase;