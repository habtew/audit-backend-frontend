import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { Engagement } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateInvoiceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, watch, setValue } = useForm<{ engagementId: string; issueDate: string; dueDate: string }>();
  
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [summary, setSummary] = useState<{ totalHours: number; totalAmount: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedEngagementId = watch('engagementId');

  // Load Engagements on open
  useEffect(() => {
    if (isOpen) {
        apiClient.getEngagements({ page: 1, limit: 100 }).then(res => {
            setEngagements(res.data.engagements);
        });
        // Set default dates
        setValue('issueDate', new Date().toISOString().split('T')[0]);
        // Set due date + 30 days
        const due = new Date();
        due.setDate(due.getDate() + 30);
        setValue('dueDate', due.toISOString().split('T')[0]);
    }
  }, [isOpen, setValue]);

  // When Engagement changes, fetch unbilled summary
  useEffect(() => {
    if (selectedEngagementId) {
        setLoading(true);
        apiClient.getUnbilledSummary(selectedEngagementId)
            .then(res => setSummary(res.data))
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    } else {
        setSummary(null);
    }
  }, [selectedEngagementId]);

  const onSubmit = async (data: any) => {
    try {
      setGenerating(true);
      await apiClient.generateInvoice(data.engagementId);
      toast.success('Invoice generated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold flex items-center">
                <CalculatorIcon className="w-6 h-6 mr-2 text-blue-600" />
                Generate Invoice
            </Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Engagement</label>
              <select 
                {...register('engagementId', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">-- Choose Engagement --</option>
                {engagements.map(eng => (
                    <option key={eng.id} value={eng.id}>{eng.name} ({eng.client?.name})</option>
                ))}
              </select>
            </div>

            {/* Live Summary Card */}
            {selectedEngagementId && (
                <div className={`p-4 rounded-lg border ${loading ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                    {loading ? <LoadingSpinner size="sm" /> : summary ? (
                        <div className="text-sm">
                            <p className="font-semibold text-blue-900">Unbilled Work Found:</p>
                            <ul className="mt-2 space-y-1 text-blue-800">
                                <li>Entries: {summary.count}</li>
                                <li>Hours: {summary.totalHours.toFixed(2)}</li>
                                <li className="text-lg font-bold mt-2">Total: ${summary.totalAmount.toLocaleString()}</li>
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No unbilled hours found for this engagement.</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <input type="date" {...register('issueDate')} className="mt-1 block w-full rounded-md border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input type="date" {...register('dueDate')} className="mt-1 block w-full rounded-md border p-2" />
                </div>
            </div>

            <button
                type="submit"
                disabled={generating || !summary || summary.count === 0}
                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
                {generating ? <LoadingSpinner size="sm" color="white" /> : 'Generate Invoice'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GenerateInvoiceModal;