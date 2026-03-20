import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { PlanningRisk } from '../../../types';
import { PlusIcon } from '@heroicons/react/24/outline';

const RiskRegister: React.FC<{ engagementId: string }> = ({ engagementId }) => {
  const [risks, setRisks] = useState<PlanningRisk[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchRisks();
  }, [engagementId]);

  const fetchRisks = async () => {
    try {
      const res = await api.getPlanningRisks(engagementId);
      const data = Array.isArray(res.data) ? res.data : [];
      setRisks(data);
      if (data.length > 0 && data[0].status === 'FINAL') {
        setIsLocked(true);
      }
    } catch (e) { /* ignore */ }
  };

  const onSubmit = async (data: any) => {
    try {
      // FIX: Ensure booleans are sent correctly and remove extra fields
      const payload = {
        engagementId,
        category: data.category,
        riskDescription: data.riskDescription,
        accountArea: data.accountArea,
        riskLevelType: 'ASSERTION_LEVEL',
        assertion: data.assertion,
        inherentRisk: data.inherentRisk,
        controlRisk: data.controlRisk,
        // React Hook Form checkboxes return booleans directly, no need for === 'true'
        isSignificant: Boolean(data.isSignificant), 
        isFraudRisk: Boolean(data.isFraudRisk),
        mitigationPlan: data.mitigationPlan
      };

      await api.addPlanningRisk(payload);
      toast.success('Risk added');
      reset();
      setShowForm(false);
      fetchRisks();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to add risk');
    }
  };

  const handleLock = async () => {
    if (!confirm('Finalize Risk Register? This cannot be undone.')) return;
    try {
      await api.approveRiskRegister(engagementId);
      toast.success('Risk Register Locked');
      fetchRisks();
    } catch (e) {
      toast.error('Failed to lock');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Risk Register (ISA 315)</h3>
        {!isLocked && (
          <div className="flex gap-2">
            <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center text-xs">
              <PlusIcon className="h-4 w-4 mr-1"/> Add Risk
            </button>
            {risks.length > 0 && (
              <button onClick={handleLock} className="btn-primary text-xs">
                Finalize Risks
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Risk Description</label>
              <textarea {...register('riskDescription')} required rows={2} className="input" placeholder="Describe the risk..." />
            </div>
            
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input">
                <option value="Fraud">Fraud</option>
                <option value="Error">Error</option>
                <option value="Significant">Significant</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Account / Cycle</label>
              <input {...register('accountArea')} required className="input" placeholder="e.g. Revenue" />
            </div>
            
            <div>
              <label className="label">Assertion</label>
              <select {...register('assertion')} className="input">
                <option value="OCCURRENCE">Occurrence</option>
                <option value="COMPLETENESS">Completeness</option>
                <option value="ACCURACY">Accuracy</option>
                <option value="CUTOFF">Cutoff</option>
                <option value="VALUATION">Valuation</option>
                <option value="RIGHTS_OBLIGATIONS">Rights & Obligations</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Inherent Risk</label>
                <select {...register('inherentRisk')} className="input">
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="label">Control Risk</label>
                <select {...register('controlRisk')} className="input">
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 col-span-2">
              <label className="flex items-center gap-2">
                 <input type="checkbox" {...register('isSignificant')} />
                 <span className="text-sm font-medium">Significant Risk</span>
              </label>
              <label className="flex items-center gap-2">
                 <input type="checkbox" {...register('isFraudRisk')} />
                 <span className="text-sm font-medium text-red-600">Fraud Risk</span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="label">Mitigation Plan</label>
              <textarea {...register('mitigationPlan')} required rows={2} className="input" placeholder="Planned audit procedures..." />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
             <button type="submit" className="btn-primary text-xs">Save Risk</button>
          </div>
        </form>
      )}

      {/* List Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 pl-4 text-left text-xs font-bold text-gray-500 uppercase">Risk</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Area / Assertion</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Risk Level</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {risks.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No risks identified yet.</td></tr>
            ) : (
              risks.map((risk) => (
                <tr key={risk.id}>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex items-start gap-2">
                      {risk.isFraudRisk && <span className="bg-red-100 text-red-800 text-[10px] px-1 rounded border border-red-200">FRAUD</span>}
                      {risk.isSignificant && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded border border-yellow-200">SIG</span>}
                    </div>
                    <div className="mt-1">{risk.riskDescription}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="font-medium">{risk.accountArea}</div>
                    <div className="text-xs text-gray-400">{risk.assertion}</div>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      risk.inherentRisk === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      IR: {risk.inherentRisk}
                    </span>
                    <div className="text-xs mt-1 text-gray-500">CR: {risk.controlRisk}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">{risk.mitigationPlan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskRegister;