import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { TrialBalanceAccount, UpdateAccountPayload } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tbId: string;
  account: TrialBalanceAccount | null;
}

const EditAccountModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, tbId, account }) => {
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<UpdateAccountPayload>();

  useEffect(() => {
    if (account && isOpen) {
      setValue('accountName', account.accountName);
      setValue('category', account.category || '');
      setValue('subCategory', account.subCategory || '');
    }
  }, [account, isOpen, setValue]);

  const onSubmit = async (data: UpdateAccountPayload) => {
    if (!account) return;
    try {
      await apiClient.updateTrialBalanceAccount(tbId, account.id, data);
      toast.success('Account updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update account');
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Edit Account: {account.accountNumber}</Dialog.Title>
            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input 
                {...register('accountName')} 
                className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category (Mapping)</label>
              <select {...register('category')} className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm">
                <option value="">Select Category...</option>
                <option value="Assets">Assets</option>
                <option value="Liabilities">Liabilities</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expenses">Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub Category</label>
              <input 
                {...register('subCategory')} 
                className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
                placeholder="e.g. Current Assets"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Note</label>
              <textarea 
                {...register('note')} 
                rows={2}
                className="mt-1 block w-full rounded border-gray-300 border p-2 shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditAccountModal;