import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { Materiality } from '../../../types';

const MaterialityForm: React.FC<{ engagementId: string }> = ({ engagementId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Materiality | null>(null);
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      benchmark: 'Profit Before Tax',
      benchmarkValue: 0,
      rulePercentage: 5,
      performanceHaircut: 75,
      trivialPercentage: 5,
      rationale: ''
    }
  });
  
  // Watch inputs for local preview calculation
  const benchmarkValue = watch('benchmarkValue');
  const rulePercentage = watch('rulePercentage');
  const performanceHaircut = watch('performanceHaircut');
  const trivialPercentage = watch('trivialPercentage');

  // Local calculation for preview purposes
  const overall = (Number(benchmarkValue) * Number(rulePercentage)) / 100;
  const performance = (overall * Number(performanceHaircut)) / 100;
  const trivial = (overall * Number(trivialPercentage)) / 100;

  useEffect(() => {
    fetchData();
  }, [engagementId]);

  const fetchData = async () => {
    try {
      const res = await api.getMateriality(engagementId);
      if (res.data) {
        setData(res.data);
        setValue('benchmark', res.data.benchmark);
        setValue('benchmarkValue', Number(res.data.benchmarkValue));
        setValue('rulePercentage', Number(res.data.rulePercentage));
        // Use defaults if backend doesn't return these yet
        setValue('performanceHaircut', 75); 
        setValue('trivialPercentage', 5);
        setValue('rationale', res.data.rationale);
      }
    } catch (error) {
      // Ignore 404
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);
      // Ensure we send numbers
      const payload = {
        engagementId,
        benchmark: formData.benchmark,
        benchmarkValue: Number(formData.benchmarkValue),
        rulePercentage: Number(formData.rulePercentage),
        performanceHaircut: Number(formData.performanceHaircut),
        trivialPercentage: Number(formData.trivialPercentage),
        rationale: formData.rationale
      };

      const res = await api.saveMateriality(payload);
      setData(res.data);
      toast.success('Materiality saved successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to save materiality');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.approveMateriality(engagementId);
      toast.success('Materiality Approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const isLocked = data?.isFinal;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900">ISA 320: Materiality</h3>
        <p className="text-sm text-blue-700 mt-1">
          Define the benchmark and percentages. The system calculates thresholds based on your inputs.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Inputs Section */}
          <div className="space-y-4">
            <div>
              <label className="label">Benchmark Basis</label>
              <select {...register('benchmark')} disabled={isLocked} className="input">
                <option value="Profit Before Tax">Profit Before Tax</option>
                <option value="Total Assets">Total Assets</option>
                <option value="Total Revenue">Total Revenue</option>
                <option value="Net Assets">Net Assets</option>
              </select>
            </div>

            <div>
              <label className="label">Benchmark Value</label>
              <input type="number" step="0.01" {...register('benchmarkValue')} disabled={isLocked} className="input" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label text-xs">Rule %</label>
                <input type="number" step="0.1" {...register('rulePercentage')} disabled={isLocked} className="input" />
              </div>
              <div>
                <label className="label text-xs">Perf. Haircut %</label>
                <input type="number" step="0.1" {...register('performanceHaircut')} disabled={isLocked} className="input" />
              </div>
              <div>
                <label className="label text-xs">Trivial %</label>
                <input type="number" step="0.1" {...register('trivialPercentage')} disabled={isLocked} className="input" />
              </div>
            </div>
          </div>

          {/* Results Preview Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Calculated Thresholds</h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase">Overall Materiality</span>
                <div className="text-2xl font-bold text-gray-900">{overall.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase">Performance</span>
                  <div className="text-lg font-medium text-gray-700">{performance.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Trivial Limit</span>
                  <div className="text-lg font-medium text-gray-700">{trivial.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="label">Rationale</label>
            <textarea 
              {...register('rationale')} 
              disabled={isLocked}
              rows={3} 
              className="input" 
              placeholder="Justify the selected benchmark and percentages..."
            />
          </div>
        </div>

        {!isLocked ? (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-secondary"
            >
              Save Calculations
            </button>
            {data && (
              <button 
                type="button" 
                onClick={handleApprove}
                className="btn-primary"
              >
                Approve & Lock
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 bg-green-50 text-green-800 text-center rounded border border-green-200 font-medium">
            ✓ Materiality Approved
          </div>
        )}
      </form>
    </div>
  );
};

export default MaterialityForm;