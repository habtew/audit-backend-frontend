// src/pages/Analytics/AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, ShieldExclamationIcon, CurrencyDollarIcon, 
  ExclamationTriangleIcon, CheckCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import apiClient from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import RoleGuard from '../../components/Auth/RoleGuard';
import { AnalyticsPartnerDashboard, AnalyticsEngagements, AnalyticsRisk, AnalyticsBillingHours } from '../../types';

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PARTNER' | 'RISK' | 'BILLING'>('PARTNER');

  // States
  const [partnerData, setPartnerData] = useState<AnalyticsPartnerDashboard | null>(null);
  const [engData, setEngData] = useState<AnalyticsEngagements | null>(null);
  const [riskData, setRiskData] = useState<AnalyticsRisk | null>(null);
  const [billingData, setBillingData] = useState<AnalyticsBillingHours | null>(null);
  const [userPerf, setUserPerf] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [pRes, eRes, rRes, bRes, uRes] = await Promise.all([
          apiClient.getAnalyticsPartnerDashboard(),
          apiClient.getAnalyticsEngagements(),
          apiClient.getAnalyticsRisk(),
          apiClient.getAnalyticsBillingHours(),
          apiClient.getAnalyticsUserPerformance()
        ]);

        setPartnerData(pRes.data);
        setEngData(eRes.data);
        setRiskData(rRes.data);
        setBillingData(bRes.data);
        setUserPerf(uRes.data || []);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  // --- Chart Processing ---
  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  const riskLevelData = Object.entries(riskData?.risksByLevel || {}).map(([name, value]) => ({ name, value }));
  const riskCategoryData = Object.entries(riskData?.risksByCategory || {}).map(([name, value]) => ({ name, value }));
  const engTypeData = Object.entries(engData?.engagementsByType || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Firm Analytics</h1>
        <p className="text-slate-500 mt-1">Deep-dive insights into engagement health, risks, and firm performance.</p>
        
        <div className="flex space-x-6 mt-6">
          <button 
            onClick={() => setActiveTab('PARTNER')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'PARTNER' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ChartBarIcon className="w-4 h-4 mr-2" /> Partner Overview
          </button>
          <button 
            onClick={() => setActiveTab('RISK')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'RISK' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldExclamationIcon className="w-4 h-4 mr-2" /> Risk Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('BILLING')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'BILLING' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CurrencyDollarIcon className="w-4 h-4 mr-2" /> Billing & Hours
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PARTNER OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'PARTNER' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Partner KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Active Engagements</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{partnerData?.overview.totalActiveEngagements || 0}</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><ChartBarIcon className="w-6 h-6" /></div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Avg Hours per Audit</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{engData?.averageHours || 0} <span className="text-sm text-slate-500 font-medium">hrs</span></p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><ClockIcon className="w-6 h-6" /></div>
            </div>

            <div className={`bg-white p-6 rounded-xl border ${partnerData?.overview.firmWideUncorrectedMisstatements ? 'border-red-300 shadow-red-100' : 'border-slate-200'} shadow-sm flex justify-between items-center`}>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Uncorrected Misstatements</p>
                <p className={`text-3xl font-black mt-1 ${partnerData?.overview.firmWideUncorrectedMisstatements ? 'text-red-600' : 'text-green-600'}`}>
                  {partnerData?.overview.firmWideUncorrectedMisstatements || 0}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${partnerData?.overview.firmWideUncorrectedMisstatements ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {partnerData?.overview.firmWideUncorrectedMisstatements ? <ExclamationTriangleIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attention Required List (Quality Control) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Requires Partner Attention</h3>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">High Priority</span>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {partnerData?.attentionRequired.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <CheckCircleIcon className="w-12 h-12 mb-2 text-green-400" />
                    <p className="text-sm font-medium">All engagements are healthy. No partner intervention required.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {partnerData?.attentionRequired.map(item => (
                      <div key={item.engagementId} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/engagements/${item.engagementId}/workspace`)}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{item.clientName}</h4>
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">{item.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.isOverdue && <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-center"><ClockIcon className="w-3 h-3 mr-1"/> Overdue</span>}
                          {item.hasMaterialExceptions && <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-center"><ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Material Exception</span>}
                          {item.unadjustedMisstatements > 0 && <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center">Unadjusted Errors: {item.unadjustedMisstatements}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Engagements by Type */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Service Distribution</h3>
              <div className="flex-1 flex flex-col justify-center">
                {engTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={engTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {engTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 text-sm">No data available</div>
                )}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {engTypeData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center text-xs text-slate-600 font-bold uppercase tracking-wider">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RISK INTELLIGENCE */}
      {/* ========================================================= */}
      {activeTab === 'RISK' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Firm-Wide Documented Risks</p>
              <p className="text-4xl font-black text-slate-800 mt-1">{riskData?.totalRisks || 0}</p>
            </div>
            <ShieldExclamationIcon className="w-12 h-12 text-amber-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Risks by Severity Level</h3>
              {riskLevelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskLevelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">No risk data</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Risks by Account Category</h3>
              {riskCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={riskCategoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {riskCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">No category data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BILLING & HOURS */}
      {/* ========================================================= */}
      {activeTab === 'BILLING' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Billable Amount</p>
                <p className="text-4xl font-black text-green-600 mt-1">${(billingData?.totalBillableAmount || 0).toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-green-100" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Hours Logged</p>
                <p className="text-4xl font-black text-indigo-600 mt-1">{billingData?.totalHours || 0}</p>
              </div>
              <ClockIcon className="w-12 h-12 text-indigo-100" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">User Performance & Efficiency</h3>
            {userPerf.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <ChartBarIcon className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-sm font-medium">No performance data generated yet for this period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Render Table if data exists */}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsDashboard;