import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { AdjustmentPayload, TrialBalanceAccount } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tbId: string;
  account: TrialBalanceAccount | null;
}

const AdjustmentsModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, tbId, account }) => {
  const { register, handleSubmit, reset } = useForm<AdjustmentPayload>();

  const onSubmit = async (data: AdjustmentPayload) => {
    if (!account) return;
    try {
      // Backend expects type to be number, ensure conversion if needed
      await apiClient.addAdjustment(tbId, account.id, {
        ...data,
        amount: Number(data.amount)
      });
      toast.success('Adjustment posted successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to post adjustment');
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Add Adjustment: {account.accountName}</Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input {...register('description', { required: true })} className="border p-2 w-full rounded mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Amount</label>
                <input type="number" step="0.01" {...register('amount', { required: true })} className="border p-2 w-full rounded mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Entry Type</label>
                <select {...register('type')} className="border p-2 w-full rounded mt-1">
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Classification</label>
              <select {...register('adjustmentType')} className="border p-2 w-full rounded mt-1">
                <option value="CORRECTION">Correction</option>
                <option value="RECLASSIFICATION">Reclassification</option>
                <option value="PROPOSED">Proposed</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Post Entry</button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AdjustmentsModal;