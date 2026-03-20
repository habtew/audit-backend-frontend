import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FraudBrainstorming } from '../../../types';

const FraudForm: React.FC<{ engagementId: string }> = ({ engagementId }) => {
  const [data, setData] = useState<FraudBrainstorming | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      discussionDate: '',
      participants: '',
      fraudRisksIdentified: '',
      managementOverride: '',
      revenueFraudPresumption: true,
      revenueFraudRationale: '',
      conclusion: ''
    }
  });
  
  // Watch presumption to conditionally show rationale field
  const presumption = watch('revenueFraudPresumption');

  useEffect(() => {
    fetchData();
  }, [engagementId]);

  const fetchData = async () => {
    try {
      // Try to fetch existing data
      const res = await api.getFraudBrainstorming(engagementId); // Ensure this method exists in api.ts or use generic get
      if (res.data) {
        setData(res.data);
        
        // Format date for input field (YYYY-MM-DD)
        const dateStr = res.data.discussionDate ? new Date(res.data.discussionDate).toISOString().split('T')[0] : '';
        
        setValue('discussionDate', dateStr);
        setValue('participants', res.data.participants);
        setValue('fraudRisksIdentified', res.data.fraudRisksIdentified);
        setValue('managementOverride', res.data.managementOverride);
        setValue('revenueFraudPresumption', res.data.revenueFraudPresumption);
        setValue('revenueFraudRationale', res.data.revenueFraudRationale || '');
        setValue('conclusion', res.data.conclusion);
      }
    } catch (e) { 
      // It's okay if it fails on 404 (not created yet)
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      // FIX: Format payload to match backend expectations exactly
      const payload = {
        engagementId,
        discussionDate: new Date(formData.discussionDate).toISOString(), // Convert to ISO
        participants: formData.participants,
        fraudRisksIdentified: formData.fraudRisksIdentified,
        managementOverride: formData.managementOverride,
        revenueFraudPresumption: Boolean(formData.revenueFraudPresumption),
        // Send null if presumption is true, otherwise send the text
        revenueFraudRationale: formData.revenueFraudPresumption ? null : formData.revenueFraudRationale, 
        conclusion: formData.conclusion
      };

      const res = await api.saveFraudBrainstorming(payload);
      setData(res.data);
      toast.success('Fraud discussion saved');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to save fraud assessment');
    }
  };

  const handleApprove = async () => {
    try {
      await api.approveFraudBrainstorming(engagementId);
      fetchData(); // Refresh to get locked status
      toast.success('Approved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve');
    }
  };

  const isLocked = data?.isFinal;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <h3 className="font-semibold text-red-900">ISA 240: Fraud Brainstorming</h3>
        <p className="text-sm text-red-700 mt-1">
          Document the team discussion regarding the susceptibility of the entity's financial statements to fraud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Date of Discussion</label>
          <input type="date" {...register('discussionDate')} required disabled={isLocked} className="input" />
        </div>
        <div>
          <label className="label">Participants</label>
          <input {...register('participants')} required disabled={isLocked} className="input" placeholder="Who attended?" />
        </div>

        <div className="col-span-2">
          <label className="label">Fraud Risks Identified</label>
          <textarea {...register('fraudRisksIdentified')} required disabled={isLocked} rows={3} className="input" placeholder="How and where could the financial statements be susceptible to fraud?" />
        </div>

        <div className="col-span-2">
          <label className="label">Response to Management Override</label>
          <textarea {...register('managementOverride')} required disabled={isLocked} rows={2} className="input" placeholder="Procedures to address management override of controls (journal entries, estimates)..." />
        </div>

        <div className="col-span-2 bg-gray-50 p-4 rounded border border-gray-200">
          <label className="flex items-center space-x-2 mb-2">
            <input type="checkbox" {...register('revenueFraudPresumption')} disabled={isLocked} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="font-medium text-gray-900">Presume risk of fraud in revenue recognition?</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">ISA 240 requires this presumption unless rebutted.</p>
          
          {!presumption && (
            <div className="animate-fadeIn">
              <label className="label text-red-600">Rationale for Rebuttal</label>
              <textarea 
                {...register('revenueFraudRationale')} 
                disabled={isLocked} 
                required={!presumption} 
                rows={2} 
                className="input border-red-300 focus:ring-red-500" 
                placeholder="Why is revenue not considered a fraud risk?" 
              />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="label">Conclusion</label>
          <textarea {...register('conclusion')} required disabled={isLocked} rows={2} className="input" placeholder="Team conclusion..." />
        </div>
      </div>

      {!isLocked ? (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="submit" className="btn-secondary">Save Discussion</button>
          {data && <button type="button" onClick={handleApprove} className="btn-primary">Finalize Fraud Assessment</button>}
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-center text-gray-500 rounded border border-gray-200 font-medium">
          ✓ Fraud Assessment Finalized
        </div>
      )}
    </form>
  );
};

export default FraudForm;