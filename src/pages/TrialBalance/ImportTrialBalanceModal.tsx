import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { Engagement } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  engagementId?: string;
}

interface ImportForm {
  file: FileList;
  period: string;
  description?: string;
  engagementId?: string;
}

const ImportTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, engagementId }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ImportForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);

  // Fetch and Sort Engagements
  useEffect(() => {
    if (isOpen && !engagementId) {
      const fetchEngagements = async () => {
        try {
          setLoadingEngagements(true);
          const response = await apiClient.getEngagements({ page: 1, limit: 1000 });
          const fetchedEngagements = response.data.engagements || [];

          const sorted = fetchedEngagements.sort((a, b) => {
            const clientA = a.client?.name?.toLowerCase() || '';
            const clientB = b.client?.name?.toLowerCase() || '';
            if (clientA < clientB) return -1;
            if (clientA > clientB) return 1;
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          });

          setEngagements(sorted);
        } catch (error) {
          console.error("Failed to fetch engagements", error);
          toast.error("Could not load engagements list");
        } finally {
          setLoadingEngagements(false);
        }
      };
      fetchEngagements();
    }
  }, [isOpen, engagementId]);

  const onSubmit = async (data: ImportForm) => {
    const effectiveEngagementId = engagementId || data.engagementId;

    if (!effectiveEngagementId) {
        toast.error("Please select an Engagement.");
        return;
    }

    if (!data.file || data.file.length === 0) {
      toast.error("Please select a file");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Ensure valid ISO string for period
      const isoPeriod = new Date(data.period).toISOString();

      await apiClient.importTrialBalance({
        file: data.file[0], 
        engagementId: effectiveEngagementId,
        period: isoPeriod,
        description: data.description
      });

      toast.success('Trial Balance imported successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Import failed Full Error:", error);
      
      // Enhanced Error Extraction
      let errorMessage = 'Failed to import file';
      const responseData = error?.response?.data;
      
      if (responseData) {
        console.log("Server Response Data:", responseData); // Check console for this if toast is vague
        
        if (responseData.message) {
           if (Array.isArray(responseData.message)) {
             errorMessage = responseData.message.join(', ');
           } else if (typeof responseData.message === 'string') {
             errorMessage = responseData.message;
           } else {
             errorMessage = JSON.stringify(responseData.message);
           }
        } else if (typeof responseData === 'string') {
            errorMessage = responseData;
        }
      } else if (error.message) {
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">Import Trial Balance</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {!engagementId && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Engagement</label>
                    {loadingEngagements ? (
                        <div className="mt-1 p-2 text-sm text-gray-500 bg-gray-50 rounded border">Loading engagements...</div>
                    ) : (
                        <select 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                          {...register('engagementId', { required: !engagementId })}
                          defaultValue=""
                        >
                            <option value="" disabled>Select Company - Engagement</option>
                            {engagements.map((eng) => (
                                <option key={eng.id} value={eng.id}>
                                    {eng.client?.name || 'Unknown Client'} — {eng.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.engagementId && <span className="text-xs text-red-500">Engagement is required</span>}
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv"
                        className="sr-only" 
                        {...register('file', { required: true })}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">XLSX up to 10MB</p>
                </div>
              </div>
              {errors.file && <span className="text-xs text-red-500">File is required</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Period Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                {...register('period', { required: true })}
              />
              {errors.period && <span className="text-xs text-red-500">Date is required</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="mt-5 sm:mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportTrialBalanceModal;