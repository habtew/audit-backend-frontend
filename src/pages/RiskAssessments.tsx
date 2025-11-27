import React, { useEffect, useState, Fragment } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ListBulletIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import { Engagement, RiskAssessment, RiskMatrix, RiskReport } from '../types';

const RiskAssessments: React.FC = () => {
  // --- State ---
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngagementId, setSelectedEngagementId] = useState<string>('');
  
  // Matrix & Report Data
  const [matrixData, setMatrixData] = useState<RiskMatrix | null>(null);
  const [reportData, setReportData] = useState<RiskReport | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskAssessment | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<RiskAssessment>>();

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedEngagementId) {
      // If user switches engagement filter, we can optionally reload specific data
      // For now, list fetches all, but Matrix/Report need ID
      fetchMatrixAndReport(selectedEngagementId);
    }
  }, [selectedEngagementId]);

  // --- Data Fetching ---
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [risksRes, engRes] = await Promise.all([
        apiClient.getRiskAssessments({ limit: 100 }), // Get initial list
        apiClient.getEngagements({ limit: 1000 })
      ]);

      // Extract Risks
      const rawRisks = risksRes as any;
      let riskList: RiskAssessment[] = [];
      if (rawRisks?.data?.riskAssessments) riskList = rawRisks.data.riskAssessments;
      else if (Array.isArray(rawRisks?.data)) riskList = rawRisks.data;
      
      setRisks(riskList);

      // Extract Engagements
      const rawEng = engRes as any;
      let engList: Engagement[] = [];
      if (rawEng?.data?.engagements) engList = rawEng.data.engagements;
      else if (Array.isArray(rawEng?.data)) engList = rawEng.data;
      else if (Array.isArray(rawEng)) engList = rawEng;
      
      setEngagements(engList);

      // Set default engagement selection if available
      if (engList.length > 0 && !selectedEngagementId) {
        setSelectedEngagementId(engList[0].id);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrixAndReport = async (engagementId: string) => {
    try {
      const [matrixRes, reportRes] = await Promise.all([
        apiClient.getRiskMatrix(engagementId),
        apiClient.getRiskReport(engagementId)
      ]);
      
      setMatrixData((matrixRes as any).data || matrixRes);
      setReportData((reportRes as any).data || reportRes);
    } catch (error) {
      console.error("Failed to load detailed views", error);
      // Don't toast here to avoid spamming if just switching tabs on empty data
    }
  };

  const fetchRisks = async () => {
    try {
      const params: any = { limit: 100 };
      if (selectedEngagementId) params.engagementId = selectedEngagementId;
      
      const res: any = await apiClient.getRiskAssessments(params);
      setRisks(res?.data?.riskAssessments || res?.data || []);
    } catch (error) {
      toast.error("Failed to refresh list");
    }
  };

  // --- Handlers ---
  const handleSaveRisk = async (data: Partial<RiskAssessment>) => {
    try {
      const payload = {
        ...data,
        engagementId: data.engagementId || selectedEngagementId, // Use dropdown selection if not in form
      };

      if (editingRisk) {
        await apiClient.updateRiskAssessment(editingRisk.id, payload);
        toast.success('Risk updated');
      } else {
        await apiClient.createRiskAssessment(payload);
        toast.success('Risk created');
      }
      
      closeModal();
      fetchRisks(); // Refresh list
      if (selectedEngagementId) fetchMatrixAndReport(selectedEngagementId); // Refresh visualizations
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this risk?')) return;
    try {
      await apiClient.deleteRiskAssessment(id);
      toast.success('Risk deleted');
      setRisks(prev => prev.filter(r => r.id !== id));
      if (selectedEngagementId) fetchMatrixAndReport(selectedEngagementId);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // --- Helpers ---
  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-800 text-white';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Modal ---
  const openModal = (risk?: RiskAssessment) => {
    if (risk) {
      setEditingRisk(risk);
      reset(risk);
    } else {
      setEditingRisk(null);
      reset({
        engagementId: selectedEngagementId,
        riskLevel: 'MEDIUM',
        likelihood: 'MEDIUM',
        impact: 'MEDIUM'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRisk(null);
    reset();
  };

  // --- Components ---
  
  // 1. Heatmap Cell
  const MatrixCell = ({ risks, label }: { risks: RiskAssessment[], label?: string }) => (
    <div className={`h-32 border border-gray-200 p-2 rounded-lg relative overflow-y-auto ${risks?.length > 0 ? 'bg-white hover:shadow-md' : 'bg-gray-50/50'}`}>
      {label && <span className="absolute top-1 right-2 text-xs text-gray-400 font-medium uppercase">{label}</span>}
      <div className="flex flex-wrap gap-1 mt-4">
        {risks?.map(r => (
          <div key={r.id} className={`w-3 h-3 rounded-full ${getRiskColor(r.riskLevel).split(' ')[0]}`} title={r.riskDescription} />
        ))}
        {risks?.length > 0 && <span className="text-xs text-gray-500 ml-1">({risks.length})</span>}
      </div>
    </div>
  );

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-7 w-7 text-orange-500" />
            Risk Assessment
          </h1>
          <p className="text-gray-500 text-sm mt-1">Identify, assess, and mitigate engagement risks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={selectedEngagementId} 
              onChange={(e) => setSelectedEngagementId(e.target.value)}
              className="input pl-9 py-2 text-sm w-full"
            >
              <option value="">Select Engagement Context...</option>
              {engagements.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center whitespace-nowrap">
            <PlusIcon className="h-5 w-5 mr-2" /> Add Risk
          </button>
        </div>
      </div>

      {/* TABS */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 max-w-md">
          {['Register', 'Matrix', 'Report'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                 ${selected ? 'bg-white text-primary-700 shadow' : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'}`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4">
          {/* TAB 1: LIST REGISTER */}
          <Tab.Panel>
            {risks.length === 0 ? (
              <EmptyState 
                title="No risks identified" 
                description="Start by adding a risk assessment for this engagement." 
                icon={ExclamationTriangleIcon} 
                actionLabel="Add Risk" 
                onAction={openModal} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {risks.map(risk => (
                  <div key={risk.id} className="card hover:shadow-md transition-shadow border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 text-xs rounded font-medium border ${getRiskColor(risk.riskLevel)}`}>
                        {risk.riskLevel}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{risk.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{risk.riskDescription}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                      <div>Likelihood: <span className="font-medium text-gray-900">{risk.likelihood}</span></div>
                      <div>Impact: <span className="font-medium text-gray-900">{risk.impact}</span></div>
                    </div>

                    {risk.mitigationPlan && (
                      <div className="text-xs text-gray-500 mb-4 border-l-2 border-primary-200 pl-2">
                        <span className="block font-medium text-primary-700 mb-0.5">Mitigation</span>
                        <p className="line-clamp-2">{risk.mitigationPlan}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                      <button onClick={() => openModal(risk)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><PencilIcon className="h-4 w-4"/></button>
                      <button onClick={() => handleDelete(risk.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><TrashIcon className="h-4 w-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tab.Panel>

          {/* TAB 2: MATRIX HEATMAP */}
          <Tab.Panel>
            {!matrixData ? (
              <div className="text-center py-12 text-gray-500">Select an engagement to view the matrix.</div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-[auto_1fr] gap-4">
                  {/* Y-Axis Label */}
                  <div className="flex items-center justify-center font-bold text-gray-400 -rotate-90 w-8">
                    LIKELIHOOD
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* Row 1: High Likelihood */}
                      <MatrixCell risks={matrixData.matrix.HIGH.LOW} label="High / Low" />
                      <MatrixCell risks={matrixData.matrix.HIGH.MEDIUM} label="High / Med" />
                      <MatrixCell risks={matrixData.matrix.HIGH.HIGH} label="High / High" />

                      {/* Row 2: Med Likelihood */}
                      <MatrixCell risks={matrixData.matrix.MEDIUM.LOW} label="Med / Low" />
                      <MatrixCell risks={matrixData.matrix.MEDIUM.MEDIUM} label="Med / Med" />
                      <MatrixCell risks={matrixData.matrix.MEDIUM.HIGH} label="Med / High" />

                      {/* Row 3: Low Likelihood */}
                      <MatrixCell risks={matrixData.matrix.LOW.LOW} label="Low / Low" />
                      <MatrixCell risks={matrixData.matrix.LOW.MEDIUM} label="Low / Med" />
                      <MatrixCell risks={matrixData.matrix.LOW.HIGH} label="Low / High" />
                    </div>
                    
                    {/* X-Axis Label */}
                    <div className="grid grid-cols-3 text-center text-xs font-bold text-gray-400 uppercase">
                      <div>Low Impact</div>
                      <div>Medium Impact</div>
                      <div>High Impact</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Tab.Panel>

          {/* TAB 3: REPORT */}
          <Tab.Panel>
            {!reportData ? (
              <div className="text-center py-12 text-gray-500">Select an engagement to view the report.</div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Report</h2>
                  <p className="text-gray-500 mt-1">Generated for: <span className="font-medium text-gray-900">{reportData.engagement.name}</span></p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Client: {reportData.engagement.client}</span>
                    <span>•</span>
                    <span>Date: {new Date(reportData.generatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-red-700">{reportData.summary.highRisks}</span>
                    <span className="text-xs text-red-600 uppercase font-medium">High Risks</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-gray-900">{reportData.summary.totalRisks}</span>
                    <span className="text-xs text-gray-500 uppercase font-medium">Total Identified</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-gray-900">{reportData.summary.categoriesAssessed}</span>
                    <span className="text-xs text-gray-500 uppercase font-medium">Categories</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Executive Recommendations</h3>
                  <ul className="space-y-3">
                    {reportData.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 bg-blue-50 p-3 rounded-md">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-blue-900">{rec.message}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 pt-4">High Priority Risks</h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {reportData.highPriorityRisks.map(risk => (
                      <div key={risk.id} className="p-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-900">{risk.category}</span>
                          <span className="text-xs font-bold text-red-600">HIGH PRIORITY</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{risk.riskDescription}</p>
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <strong>Mitigation:</strong> {risk.mitigationPlan}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* CREATE/EDIT MODAL */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
                <Dialog.Title className="text-lg font-bold text-gray-900 mb-6">
                  {editingRisk ? 'Edit Risk' : 'Identify New Risk'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit(handleSaveRisk)} className="space-y-4">
                  <div>
                    <label className="label">Engagement</label>
                    <select 
                      {...register('engagementId', { required: 'Required' })} 
                      className="input"
                      disabled={!!editingRisk} // Usually simpler to not move risks between engagements
                    >
                      <option value="">Select...</option>
                      {engagements.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    {errors.engagementId && <span className="text-error">Required</span>}
                  </div>

                  <div>
                    <label className="label">Category</label>
                    <select {...register('category', { required: 'Required' })} className="input">
                      <option value="REVENUE">Revenue</option>
                      <option value="ASSETS">Assets</option>
                      <option value="LIABILITIES">Liabilities</option>
                      <option value="EXPENSES">Expenses</option>
                      <option value="COMPLIANCE">Compliance</option>
                      <option value="FRAUD">Fraud</option>
                      <option value="IT">IT & Systems</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Risk Description</label>
                    <textarea 
                      {...register('riskDescription', { required: 'Required' })} 
                      className="input" 
                      rows={2}
                      placeholder="Describe the risk..."
                    />
                    {errors.riskDescription && <span className="text-error">Required</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Level</label>
                      <select {...register('riskLevel')} className="input">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Likelihood</label>
                      <select {...register('likelihood')} className="input">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Impact</label>
                      <select {...register('impact')} className="input">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Mitigation Plan</label>
                    <textarea 
                      {...register('mitigationPlan')} 
                      className="input" 
                      rows={3}
                      placeholder="Planned audit procedures..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Risk</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RiskAssessments;