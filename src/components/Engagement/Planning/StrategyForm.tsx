import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { AuditStrategy } from '../../../types';

const StrategyForm: React.FC<{ engagementId: string }> = ({ engagementId }) => {
  const [data, setData] = useState<AuditStrategy | null>(null);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    fetchData();
  }, [engagementId]);

  const fetchData = async () => {
    try {
      const res = await api.getStrategy(engagementId);
      if (res.data) {
        setData(res.data);
        const fields = ['scope', 'timing', 'direction', 'resources', 'significantChanges', 'financialStatementLevelRisks', 'significantRiskSummary'];
        fields.forEach(f => setValue(f, res.data[f as keyof AuditStrategy]));
        setValue('useOfExperts', res.data.useOfExperts);
        setValue('relianceOnControls', res.data.relianceOnControls);
        setValue('itEnvironmentConsidered', res.data.itEnvironmentConsidered);
      }
    } catch (e) { /* ignore */ }
  };

  const onSubmit = async (formData: any) => {
    try {
      const res = await api.saveStrategy({ ...formData, engagementId });
      setData(res.data);
      toast.success('Strategy saved');
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  const handleApprove = async () => {
    try {
      await api.approveStrategy(engagementId);
      fetchData();
      toast.success('Strategy Approved');
    } catch (e) {
      toast.error('Failed to approve');
    }
  };

  const isLocked = data?.status === 'FINAL';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="font-semibold text-purple-900">ISA 300: Overall Audit Strategy</h3>
        <p className="text-sm text-purple-700 mt-1">
          Set the scope, timing, and direction of the audit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="label">Scope of the Audit</label>
          <textarea {...register('scope')} disabled={isLocked} rows={2} className="input" placeholder="e.g. Statutory audit prepared under IFRS..." />
        </div>

        <div>
          <label className="label">Reporting Objectives & Timing</label>
          <textarea {...register('timing')} disabled={isLocked} rows={2} className="input" placeholder="Key dates for interim, inventory count, final reporting..." />
        </div>

        <div>
          <label className="label">Direction of the Audit</label>
          <textarea {...register('direction')} disabled={isLocked} rows={2} className="input" placeholder="Significant areas to focus on..." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('useOfExperts')} disabled={isLocked} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">Use of Experts?</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('relianceOnControls')} disabled={isLocked} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">Relies on Internal Controls?</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('itEnvironmentConsidered')} disabled={isLocked} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">Complex IT Environment?</span>
          </label>
        </div>

        <div>
          <label className="label">Resources</label>
          <input {...register('resources')} disabled={isLocked} className="input" placeholder="e.g. 1 Partner, 1 Manager, 2 Seniors" />
        </div>
      </div>

      {!isLocked ? (
        <div className="flex justify-end gap-3 pt-4">
          <button type="submit" className="btn-secondary">Save Draft</button>
          {data && <button type="button" onClick={handleApprove} className="btn-primary">Approve Strategy</button>}
        </div>
      ) : (
        <div className="p-4 bg-green-50 text-green-700 text-center rounded border border-green-200">
          Strategy Approved and Locked
        </div>
      )}
    </form>
  );
};

export default StrategyForm;