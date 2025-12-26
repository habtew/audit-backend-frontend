import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { Engagement } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TimeEntryModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.getEngagements({ status: 'active' }).then(res => setEngagements(res.data.engagements));
      reset({ date: new Date().toISOString().split('T')[0] });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      await apiClient.createTimeEntry({
        engagementId: data.engagementId,
        description: data.description,
        date: new Date(data.date).toISOString(),
        hours: Number(data.hours)
      });
      toast.success('Time logged successfully');
      onSuccess();
      onClose();
    } catch (e) {
      toast.error('Failed to log time');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-indigo-600" /> Log Billable Time
            </Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Engagement</label>
              <select {...register('engagementId', { required: 'Required' })} className="mt-1 block w-full rounded-md border p-2 bg-white shadow-sm">
                <option value="">Select Engagement...</option>
                {engagements.map(e => <option key={e.id} value={e.id}>{e.name} - {e.client?.name}</option>)}
              </select>
              {errors.engagementId && <span className="text-red-500 text-xs">Required</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description', { required: true })} rows={3} className="mt-1 block w-full rounded-md border p-2 shadow-sm" placeholder="What did you work on?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours</label>
                <input type="number" step="0.25" {...register('hours', { required: true, min: 0.1 })} className="mt-1 block w-full rounded-md border p-2 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" {...register('date', { required: true })} className="mt-1 block w-full rounded-md border p-2 shadow-sm" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Submit Entry'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TimeEntryModal;