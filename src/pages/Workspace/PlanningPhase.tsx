// src/pages/Workspace/PlanningPhase.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  BuildingOfficeIcon, ScaleIcon, CalculatorIcon, 
  ShieldExclamationIcon, CheckCircleIcon, LockClosedIcon, PlusIcon, RocketLaunchIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../utils/api';
import { Engagement } from '../../types';
import RoleGuard from '../../components/Auth/RoleGuard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TABS = [
  { id: 'entity', label: 'Entity & Context (ISA 315)', icon: BuildingOfficeIcon },
  { id: 'materiality', label: 'Materiality (ISA 320)', icon: CalculatorIcon },
  { id: 'strategy', label: 'Strategy & Fraud (ISA 300/240)', icon: ScaleIcon },
  { id: 'risks', label: 'Risk Register', icon: ShieldExclamationIcon }
];

const PlanningPhase: React.FC = () => {
  const { engagement } = useOutletContext<{ engagement: Engagement }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('entity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Read-Only check (if phase is already EXECUTION or beyond)
  const isReadOnly = engagement.status !== 'DRAFT' && engagement.status !== 'PLANNING';

  // --- States for Forms ---
  const [entity, setEntity] = useState<any>({});
  const [special, setSpecial] = useState<any>({});
  
  const [materiality, setMateriality] = useState<any>({
    benchmark: 'Revenue', benchmarkValue: 0, rulePercentage: 1, performanceHaircut: 75, trivialPercentage: 5, rationale: ''
  });
  
  const [strategy, setStrategy] = useState<any>({ scope: '', timing: '', direction: '' });
  const [fraud, setFraud] = useState<any>({ discussionDate: '', participants: '', fraudRisksIdentified: '', revenueFraudPresumption: true, conclusion: '' });
  const [risks, setRisks] = useState<any[]>([]);

  // Form state for New Risk
  const [newRisk, setNewRisk] = useState<any>({
    riskDescription: '', category: 'Revenue', assertion: 'Cut-off', accountArea: '', riskLevelType: 'HIGH', inherentRisk: 'HIGH', controlRisk: 'MEDIUM', isSignificant: false, isFraudRisk: false, mitigationPlan: ''
  });
  const [riskRegisterApproved, setRiskRegisterApproved] =
  useState(false);

  // Check if planning is fully approved (Materiality, Strategy, Fraud all FINAL)
  const isReadyToComplete = materiality?.isFinal && strategy?.status === 'FINAL' && fraud?.isFinal;

  // --- 1. Fetch Dashboard Data ---
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPlanningDashboard(engagement.id);
      const data = res.data;
      
      if (data.entityUnderstanding) setEntity(data.entityUnderstanding);
      if (data.specialConsiderations) setSpecial(data.specialConsiderations);
      if (data.materiality) setMateriality(data.materiality);
      if (data.auditStrategy) setStrategy(data.auditStrategy);
      if (data.fraudBrainstorming) {
        setFraud({
          ...data.fraudBrainstorming,
          discussionDate: data.fraudBrainstorming.discussionDate ? new Date(data.fraudBrainstorming.discussionDate).toISOString().split('T')[0] : ''
        });
      }
      if (data.riskAssessments) setRisks(data.riskAssessments);
    } catch (error) {
      console.error("Failed to fetch planning dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [engagement.id]);

  // --- 2. Save Handlers ---
  const handleSaveEntityAndSpecial = async () => {
    setSaving(true);
    try {
      // FIX: Provide fallbacks so the backend's strict DTO validation doesn't fail
      // if fields are missing from the UI inputs.
      const entityPayload = {
        businessModel: entity.businessModel || 'Not Documented',
        governanceStructure: entity.governanceStructure || 'Not Documented',
        industryConditions: entity.industryConditions || 'Not Documented',
        itSystems: entity.itSystems || 'Not Documented',
        regulatoryFramework: entity.regulatoryFramework || 'Not Documented',
        internalControls: entity.internalControls || 'Not Documented'
      };

      await apiClient.updateEntityUnderstanding(engagement.id, entityPayload);
      
      const specialPayload = {
        lawsAndRegulations: special.lawsAndRegulations || '',
        serviceOrganizations: special.serviceOrganizations || ''
      };
      await apiClient.updateSpecialConsiderations(engagement.id, specialPayload);
      
      toast.success('Entity context saved successfully');
    } catch (e: any) { 
      console.error('ENTITY ERROR:', e.response?.data);
      toast.error('Failed to save entity data. Check console for validation details.'); 
    } finally { 
      setSaving(false); 
    }
  };

const handleSaveMateriality = async () => {
    setSaving(true);

    try {
      // FIX: Use Nullish Coalescing (??) to guarantee a valid number is sent
      // even if the state is currently undefined.
      const payload = {
        engagementId: engagement.id,
        benchmark: materiality.benchmark || 'Revenue',
        benchmarkValue: Number(materiality.benchmarkValue ?? 0),
        rulePercentage: Number(materiality.rulePercentage ?? 1),
        performanceHaircut: Number(materiality.performanceHaircut ?? 75), // Defaults to 75 if undefined
        trivialPercentage: Number(materiality.trivialPercentage ?? 5),    // Defaults to 5 if undefined
        rationale: materiality.rationale || 'Standard rationale applied.'
      };

      console.log('MATERIALITY PAYLOAD:', payload);

      const response = await apiClient.createMateriality(payload);
      console.log('MATERIALITY RESPONSE:', response);

      toast.success('Materiality calculated and saved as draft');
      fetchDashboard();
    } catch (e: any) {
      console.error('MATERIALITY ERROR:', e.response?.data || e);
      let msg = 'Failed to save materiality';
      const backend = e.response?.data?.message;

      if (typeof backend === 'string') {
        msg = backend;
      } else if (Array.isArray(backend)) {
        msg = backend.join(', ');
      } else if (backend?.message && Array.isArray(backend.message)) {
        msg = backend.message.join(', ');
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

const handleApproveMateriality = async () => {
    if (!materiality?.id) {
      toast.error('Materiality record missing');
      return;
    }

    setSaving(true);

    try {
      console.log('APPROVING MATERIALITY FOR ENGAGEMENT:', engagement.id);

      // CRITICAL FIX: Pass engagement.id instead of materiality.id into the API call
      // and ensure engagementId is included in the body payload.
      await apiClient.approveMateriality(
        engagement.id, 
        {
          engagementId: engagement.id,
          comments: 'Thresholds accepted.',
          isApproved: true
        }
      );

      toast.success('Materiality Approved and Locked');
      fetchDashboard();
    } catch (e: any) {
      console.error('APPROVE MATERIALITY ERROR:', e.response?.data || e);
      toast.error('Failed to approve materiality');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStrategy = async () => {
    setSaving(true);
    try {
      await apiClient.createAuditStrategy({ engagementId: engagement.id, ...strategy });
      toast.success('Strategy saved as draft');
      fetchDashboard();
    } catch (e) { toast.error('Failed to save strategy. Ensure Scope, Timing, and Direction are filled.'); } finally { setSaving(false); }
  };

  const handleApproveStrategy = async () => {
    setSaving(true);
    try {
      await apiClient.approveAuditStrategy(engagement.id, { comments: "Strategy approved for execution", isFinalized: true });
      toast.success('Strategy Approved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve strategy'); } finally { setSaving(false); }
  };

  const handleSaveFraud = async () => {
    setSaving(true);
    try {
      await apiClient.submitFraudBrainstorming({ 
        engagementId: engagement.id, 
        ...fraud,
        discussionDate: new Date(fraud.discussionDate).toISOString() 
      });
      toast.success('Fraud brainstorming saved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to save fraud brainstorming'); } finally { setSaving(false); }
  };

  const handleApproveFraud = async () => {
    setSaving(true);
    try {
      await apiClient.approveFraudBrainstorming(engagement.id, { notes: "Presumptions addressed.", signOffDate: new Date().toISOString() });
      toast.success('Fraud Brainstorming Approved');
      fetchDashboard();
    } catch (e) { toast.error('Failed to approve fraud'); } finally { setSaving(false); }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.createPlanningRisk({ engagementId: engagement.id, ...newRisk });
      toast.success('Risk added to register');
      setIsRiskModalOpen(false);
      fetchDashboard();
    } catch (error) { toast.error('Failed to add risk'); } finally { setSaving(false); }
  };

  const handleApproveRiskRegister = async () => {

  if (!engagement?.id) {
    toast.error('Engagement ID missing');
    return;
  }

  setSaving(true);

  try {

    console.log(
      'APPROVING RISK REGISTER:',
      engagement.id
    );

    const response =
      await apiClient.approveRiskRegister(
        engagement.id
      );

    console.log(
      'RISK APPROVAL RESPONSE:',
      response
    );

    toast.success(
      'Risk Register Approved Successfully'
    );

    // IMPORTANT
    setRiskRegisterApproved(true);

    // Refresh dashboard/state
    fetchDashboard();

  } catch (e: any) {

    console.error(
      'RISK APPROVAL ERROR:',
      e.response?.data || e
    );

    let errorMessage =
      'Failed to approve risk register';

    const backend =
      e.response?.data?.message;

    if (typeof backend === 'string') {

      errorMessage = backend;

    } else if (
      Array.isArray(backend)
    ) {

      errorMessage =
        backend.join(', ');

    } else if (
      backend?.message
    ) {

      errorMessage =
        backend.message;
    }

    toast.error(errorMessage);

  } finally {

    setSaving(false);

  }
};

const handleCompletePlanning = async () => {

  setSaving(true);

  try {

    console.log(
      'COMPLETING PLANNING FOR:',
      engagement.id
    );

    const response =
      await apiClient.completePlanning(
        engagement.id
      );

    console.log(
      'COMPLETE PLANNING RESPONSE:',
      response
    );

    toast.success(
      'Planning Phase Completed Successfully'
    );

    fetchDashboard();

  } catch (e: any) {

    console.error(
      'FULL COMPLETE PLANNING ERROR:',
      JSON.stringify(
        e.response?.data,
        null,
        2
      )
    );

    console.log(
      'VALIDATION:',
      e.response?.data?.message
    );

    let errorMessage =
      'Failed to complete planning';

    const backend =
      e.response?.data?.message;

    if (typeof backend === 'string') {
      errorMessage = backend;

    } else if (
      Array.isArray(backend)
    ) {
      errorMessage =
        backend.join(', ');

    } else if (
      backend?.message &&
      Array.isArray(backend.message)
    ) {
      errorMessage =
        backend.message.join(', ');

    } else if (
      backend?.message &&
      typeof backend.message === 'string'
    ) {
      errorMessage =
        backend.message;
    }

    toast.error(errorMessage);

  } finally {

    setSaving(false);

  }
};

  // --- Auto Calculate Materiality Effect ---
  useEffect(() => {
    if (materiality.benchmarkValue && materiality.rulePercentage && !materiality.isFinal) {
      const overall = (Number(materiality.benchmarkValue) * Number(materiality.rulePercentage)) / 100;
      const perf = (overall * Number(materiality.performanceHaircut || 75)) / 100;
      const trivial = (overall * Number(materiality.trivialPercentage || 5)) / 100;
      setMateriality((prev: any) => ({ ...prev, overallMateriality: overall, performanceMateriality: perf, trivialThreshold: trivial }));
    }
  }, [materiality.benchmarkValue, materiality.rulePercentage, materiality.performanceHaircut, materiality.trivialPercentage, materiality.isFinal]);


  if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="lg" /></div>;

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
            
            {/* Complete Planning Action Bar */}
            <div className="flex items-center space-x-4">
              {!isReadOnly ? (
                <button 
                  onClick={handleCompletePlanning}
                  disabled={!isReadyToComplete || saving}
                  className={`flex items-center px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all
                    ${isReadyToComplete 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                >
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  {isReadyToComplete ? 'Complete Planning Phase' : 'Sign-offs Required to Complete'}
                </button>
              ) : (
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold border border-green-200 flex items-center shadow-sm">
                  <CheckCircleIcon className="w-5 h-5 mr-1.5" /> Planning Completed
                </span>
              )}
            </div>
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
      <div className="p-8 flex-1 bg-white overflow-y-auto">
        
        {/* ========================================== */}
        {/* TAB 1: ENTITY & CONTEXT */}
        {/* ========================================== */}
        {activeTab === 'entity' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Entity Understanding (ISA 315)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Business Model</label>
                  <textarea disabled={isReadOnly} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={entity.businessModel || ''} onChange={e => setEntity({...entity, businessModel: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Industry Conditions</label>
                  <textarea disabled={isReadOnly} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={entity.industryConditions || ''} onChange={e => setEntity({...entity, industryConditions: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">IT Systems</label>
                  <textarea disabled={isReadOnly} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={entity.itSystems || ''} onChange={e => setEntity({...entity, itSystems: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Special Considerations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Laws and Regulations (ISA 250)</label>
                  <textarea disabled={isReadOnly} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={special.lawsAndRegulations || ''} onChange={e => setSpecial({...special, lawsAndRegulations: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Service Organizations (ISA 402)</label>
                  <textarea disabled={isReadOnly} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-100" value={special.serviceOrganizations || ''} onChange={e => setSpecial({...special, serviceOrganizations: e.target.value})} />
                </div>
              </div>
            </div>
            
            {!isReadOnly && (
              <div className="flex justify-end pt-4"><button onClick={handleSaveEntityAndSpecial} disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900">Save Context</button></div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MATERIALITY */}
        {/* ========================================== */}
        {activeTab === 'materiality' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Materiality Calculator</h3>
                {materiality.isFinal && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Benchmark Basis</label>
                    <select disabled={isReadOnly || materiality.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={materiality.benchmark} onChange={(e) => setMateriality({...materiality, benchmark: e.target.value})}>
                      <option value="Revenue">Revenue</option><option value="Pre-Tax Income">Pre-Tax Income</option><option value="Total Assets">Total Assets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Benchmark Value ($)</label>
                    <input type="number" disabled={isReadOnly || materiality.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm font-mono disabled:bg-slate-50" value={materiality.benchmarkValue} onChange={(e) => setMateriality({...materiality, benchmarkValue: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Rule (%)</label>
                      <input type="number" step="0.1" disabled={isReadOnly || materiality.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm text-sm disabled:bg-slate-50" value={materiality.rulePercentage} onChange={(e) => setMateriality({...materiality, rulePercentage: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Haircut (%)</label>
                      <input type="number" disabled={isReadOnly || materiality.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm text-sm disabled:bg-slate-50" value={materiality.performanceHaircut || 75} onChange={(e) => setMateriality({...materiality, performanceHaircut: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Trivial (%)</label>
                      <input type="number" disabled={isReadOnly || materiality.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm text-sm disabled:bg-slate-50" value={materiality.trivialPercentage || 5} onChange={(e) => setMateriality({...materiality, trivialPercentage: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Rationale</label>
                    <textarea disabled={isReadOnly || materiality.isFinal} rows={3} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50 text-sm" placeholder="Document why this benchmark and percentage were chosen..." value={materiality.rationale} onChange={(e) => setMateriality({...materiality, rationale: e.target.value})} />
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 border-l-4 border-l-indigo-600">
                    <p className="text-xs font-bold text-slate-500 uppercase">Overall Materiality</p>
                    <p className="text-3xl font-black text-indigo-900 mt-1">${Number(materiality.overallMateriality || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Performance Materiality</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.performanceMateriality || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Trivial Threshold (SAD)</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">${Number(materiality.trivialThreshold || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {!isReadOnly && !materiality.isFinal && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end space-x-4">
                  <button onClick={handleSaveMateriality} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm">Save Draft</button>
                  <RoleGuard minRole="MANAGER">
                    <button onClick={handleApproveMateriality} disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center">
                      <LockClosedIcon className="w-4 h-4 mr-2" /> Approve & Lock
                    </button>
                  </RoleGuard>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: STRATEGY & FRAUD */}
        {/* ========================================== */}
        {activeTab === 'strategy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            
            {/* Audit Strategy */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Audit Strategy (ISA 300)</h3>
                {strategy.status === 'FINAL' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Scope *</label>
                  <textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" placeholder="e.g. Full scope statutory audit..." value={strategy.scope} onChange={(e) => setStrategy({...strategy, scope: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Timing *</label>
                    <textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" placeholder="e.g. Interim in Jan, Final in March..." value={strategy.timing} onChange={(e) => setStrategy({...strategy, timing: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Direction *</label>
                    <textarea disabled={isReadOnly || strategy.status === 'FINAL'} rows={2} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" placeholder="e.g. Focus on Revenue and ITGCs..." value={strategy.direction} onChange={(e) => setStrategy({...strategy, direction: e.target.value})} />
                  </div>
                </div>
              </div>
              {!isReadOnly && strategy.status !== 'FINAL' && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={handleSaveStrategy} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm text-sm">Save Draft</button>
                  <RoleGuard minRole="MANAGER">
                    <button onClick={handleApproveStrategy} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-sm text-sm">Approve Strategy</button>
                  </RoleGuard>
                </div>
              )}
            </div>

            {/* Fraud Brainstorming */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Fraud Brainstorming (ISA 240)</h3>
                {fraud.isFinal && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><LockClosedIcon className="w-4 h-4 mr-1"/> Approved</span>}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Discussion Date</label><input type="date" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.discussionDate} onChange={(e) => setFraud({...fraud, discussionDate: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Participants</label><input type="text" disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.participants} onChange={(e) => setFraud({...fraud, participants: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Identified Fraud Risks (What could go wrong?)</label><textarea rows={2} disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.fraudRisksIdentified} onChange={(e) => setFraud({...fraud, fraudRisksIdentified: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Conclusion & Audit Response</label><textarea rows={2} disabled={isReadOnly || fraud.isFinal} className="w-full border-slate-300 rounded-lg shadow-sm disabled:bg-slate-50" value={fraud.conclusion} onChange={(e) => setFraud({...fraud, conclusion: e.target.value})} /></div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" disabled={isReadOnly || fraud.isFinal} checked={fraud.revenueFraudPresumption} onChange={(e) => setFraud({...fraud, revenueFraudPresumption: e.target.checked})} className="w-5 h-5 text-amber-600 rounded" />
                    <span className="text-sm font-bold text-amber-900">Revenue Recognition Fraud Presumption Addressed</span>
                  </label>
                </div>
              </div>
              {!isReadOnly && !fraud.isFinal && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={handleSaveFraud} disabled={saving} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm text-sm">Save Draft</button>
                  <RoleGuard minRole="MANAGER">
                    <button onClick={handleApproveFraud} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-sm text-sm">Approve Fraud Document</button>
                  </RoleGuard>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
{/* TAB 4: RISK REGISTER */}
{/* ========================================== */}
{activeTab === 'risks' && (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in h-full flex flex-col">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">

      <div>
        <h3 className="text-lg font-bold text-slate-800">
          Risk Register
        </h3>

        <p className="text-sm text-slate-500">
          Document assessed risks of material misstatement.
        </p>

        {/* APPROVAL STATUS */}
        <div className="mt-3">

          {riskRegisterApproved ? (

            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              ✓ Risk Register Approved
            </div>

          ) : (

            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
              Draft Risk Register
            </div>

          )}

        </div>

      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-3">

          {/* APPROVE BUTTON */}
          {!riskRegisterApproved && risks.length > 0 && (
            <button
              onClick={handleApproveRiskRegister}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center shadow-sm disabled:opacity-50"
            >
              ✓ Approve Register
            </button>
          )}

          {/* ADD RISK */}
          <button
            onClick={() => setIsRiskModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center shadow-sm"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Risk
          </button>

        </div>
      )}

    </div>

    {/* EMPTY STATE */}
    {risks.length === 0 ? (

      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">

        <ShieldExclamationIcon className="w-16 h-16 text-slate-300 mb-4" />

        <h4 className="text-lg font-bold text-slate-700">
          No risks documented yet
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          Start by adding significant or fraud risks to the register.
        </p>

      </div>

    ) : (

      <>
        {/* RISK SUMMARY */}
        <div className="grid grid-cols-4 gap-4 mb-6">

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Total Risks
            </div>

            <div className="text-2xl font-bold text-slate-800 mt-1">
              {risks.length}
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-red-400 font-bold">
              Significant Risks
            </div>

            <div className="text-2xl font-bold text-red-700 mt-1">
              {
                risks.filter(
                  (r) => r.isSignificant
                ).length
              }
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-purple-400 font-bold">
              Fraud Risks
            </div>

            <div className="text-2xl font-bold text-purple-700 mt-1">
              {
                risks.filter(
                  (r) => r.isFraudRisk
                ).length
              }
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">
              High Inherent
            </div>

            <div className="text-2xl font-bold text-amber-700 mt-1">
              {
                risks.filter(
                  (r) =>
                    r.inherentRisk === 'HIGH'
                ).length
              }
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">

          <table className="min-w-full divide-y divide-slate-200">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Category
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Description
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Account & Assertion
                </th>

                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                  Inherent
                </th>

                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                  Control
                </th>

                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                  Flags
                </th>

              </tr>

            </thead>

            <tbody className="bg-white divide-y divide-slate-200">

              {risks.map((r, idx) => (

                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors"
                >

                  {/* CATEGORY */}
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">
                    {r.category}
                  </td>

                  {/* DESCRIPTION */}
                  <td
                    className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate"
                    title={r.riskDescription}
                  >
                    {r.riskDescription}
                  </td>

                  {/* ACCOUNT */}
                  <td className="px-4 py-4 text-sm text-slate-600">

                    <div className="font-bold">
                      {r.accountArea}
                    </div>

                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      {r.assertion}
                    </div>

                  </td>

                  {/* INHERENT */}
                  <td className="px-4 py-4 text-center">

                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        r.inherentRisk === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : r.inherentRisk === 'LOW'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.inherentRisk}
                    </span>

                  </td>

                  {/* CONTROL */}
                  <td className="px-4 py-4 text-center">

                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        r.controlRisk === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : r.controlRisk === 'LOW'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.controlRisk}
                    </span>

                  </td>

                  {/* FLAGS */}
                  <td className="px-4 py-4 text-center space-x-1">

                    {r.isSignificant && (
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"
                        title="Significant Risk"
                      />
                    )}

                    {r.isFraudRisk && (
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500"
                        title="Fraud Risk"
                      />
                    )}

                  </td>

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
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-6 border-b border-slate-200 pb-4">Add Audit Risk</Dialog.Title>
                  <form onSubmit={handleAddRisk} className="space-y-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Risk Description</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.riskDescription} onChange={e => setNewRisk({...newRisk, riskDescription: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Category</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" placeholder="e.g. Revenue" value={newRisk.category} onChange={e => setNewRisk({...newRisk, category: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Account Area</label><input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm" placeholder="e.g. 4000 - Licensing" value={newRisk.accountArea} onChange={e => setNewRisk({...newRisk, accountArea: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Assertion</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.assertion} onChange={e => setNewRisk({...newRisk, assertion: e.target.value})}><option>Existence</option><option>Completeness</option><option>Accuracy</option><option>Cut-off</option><option>Valuation</option></select></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Inherent Risk</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.inherentRisk} onChange={e => setNewRisk({...newRisk, inherentRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Control Risk</label><select className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.controlRisk} onChange={e => setNewRisk({...newRisk, controlRisk: e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
                    </div>
                    <div className="flex space-x-6 pt-2">
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isSignificant} onChange={e => setNewRisk({...newRisk, isSignificant: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Significant Risk</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={newRisk.isFraudRisk} onChange={e => setNewRisk({...newRisk, isFraudRisk: e.target.checked})} className="rounded text-indigo-600 w-4 h-4" /> <span className="text-sm font-bold text-slate-700">Fraud Risk (ISA 240)</span></label>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Mitigation Plan / Response</label><textarea required rows={2} className="w-full border-slate-300 rounded-lg shadow-sm" value={newRisk.mitigationPlan} onChange={e => setNewRisk({...newRisk, mitigationPlan: e.target.value})} /></div>
                    
                    <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-slate-200">
                      <button type="button" onClick={() => setIsRiskModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
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