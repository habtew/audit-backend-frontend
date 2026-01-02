import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { Engagement } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  engagementId?: string;
}

interface CreateTBForm {
  engagementId: string;
  period: string;
  description?: string;
}

const CreateTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, engagementId }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateTBForm>();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);

  // Fetch engagements for dropdown
  useEffect(() => {
    if (isOpen && !engagementId) {
      setLoadingEngagements(true);
      apiClient.getEngagements({ page: 1, limit: 1000 })
        .then(res => {
          const sorted = (res.data.engagements || []).sort((a, b) => 
            (a.client?.name || '').localeCompare(b.client?.name || '')
          );
          setEngagements(sorted);
        })
        .catch(() => toast.error("Failed to load engagements"))
        .finally(() => setLoadingEngagements(false));
    }
  }, [isOpen, engagementId]);

  const onSubmit = async (data: CreateTBForm) => {
    try {
      const effectiveEngagementId = engagementId || data.engagementId;
      if (!effectiveEngagementId) {
        toast.error("Engagement is required");
        return;
      }

      await apiClient.createTrialBalance({
        engagementId: effectiveEngagementId,
        period: new Date(data.period).toISOString(),
        description: data.description
      });

      toast.success('Trial Balance created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Failed to create Trial Balance';
      toast.error(typeof msg === 'string' ? msg : 'Creation failed');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Create New Trial Balance</Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Engagement Selection */}
            {!engagementId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Engagement</label>
                {loadingEngagements ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : (
                  <select 
                    {...register('engagementId', { required: !engagementId })}
                    className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Engagement...</option>
                    {engagements.map(eng => (
                      <option key={eng.id} value={eng.id}>
                        {eng.client?.name} - {eng.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.engagementId && <span className="text-red-500 text-xs">Required</span>}
              </div>
            )}

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Period Date</label>
              <input 
                type="date" 
                {...register('period', { required: true })} 
                className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
              />
              {errors.period && <span className="text-red-500 text-xs">Required</span>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                {...register('description')} 
                rows={3}
                className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Trial Balance'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateTrialBalanceModal;