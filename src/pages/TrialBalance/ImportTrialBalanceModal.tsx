// // import React, { useState } from 'react';
// // import { useForm } from 'react-hook-form';
// // import { Dialog } from '@headlessui/react';
// // import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
// // import { apiClient } from '../../utils/api';
// // import toast from 'react-hot-toast';
// // import LoadingSpinner from '../../components/Common/LoadingSpinner';

// // interface Props {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSuccess: () => void;
// //   engagementId?: string; // Pre-fill if we are inside an engagement context
// // }

// // interface ImportForm {
// //   engagementId: string;
// //   period: string;
// //   description: string;
// //   file: FileList;
// // }

// // const handleDownloadTemplate = async () => {
// //     try {
// //         const blob = await apiClient.getImportTemplate('trial-balance');
// //         const url = window.URL.createObjectURL(blob);
// //         const link = document.createElement('a');
// //         link.href = url;
// //         link.setAttribute('download', 'trial_balance_template.xlsx');
// //         document.body.appendChild(link);
// //         link.click();
// //         link.remove();
// //     } catch(e) {
// //         toast.error("Failed to download template");
// //     }
// // }

// // const ImportTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, engagementId }) => {
// //   const { register, handleSubmit, formState: { errors } } = useForm<ImportForm>({
// //     defaultValues: { engagementId: engagementId || '' }
// //   });
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const onSubmit = async (data: ImportForm) => {
// //     try {
// //       setIsSubmitting(true);
// //       await apiClient.importTrialBalance({
// //         file: data.file[0],
// //         engagementId: data.engagementId, // You might need a selector for this if not provided
// //         period: data.period,
// //         description: data.description
// //       });
// //       toast.success('Trial Balance imported successfully');
// //       onSuccess();
// //       onClose();
// //     } catch (error) {
// //       console.error(error);
// //       toast.error('Failed to import file');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
// //       <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
// //       <div className="fixed inset-0 flex items-center justify-center p-4">
// //         <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
// //           <div className="flex justify-between items-center mb-4">
// //             <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
// //               Import Trial Balance
// //             </Dialog.Title>
// //             <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-500" /></button>
// //           </div>

// //           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// //             {/* Engagement ID (Ideally a Dropdown, keeping simple text for now) */}
// //             {!engagementId && (
// //                 <div>
// //                     <label className="block text-sm font-medium text-gray-700">Engagement ID</label>
// //                     <input {...register('engagementId', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
// //                 </div>
// //             )}

// //             {/* Period Date Picker */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Period (Year End)</label>
// //               <input type="date" {...register('period', { required: 'Period is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
// //               {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period.message}</p>}
// //             </div>

// //             {/* Description */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Description</label>
// //               <textarea {...register('description')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" rows={3} />
// //             </div>

// //             {/* File Upload */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
// //               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
// //                 <div className="space-y-1 text-center">
// //                   <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
// //                   <div className="flex text-sm text-gray-600">
// //                     <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
// //                       <span>Upload a file</span>
// //                       <input type="file" className="sr-only" accept=".xlsx, .csv" {...register('file', { required: 'File is required' })} />
// //                     </label>
// //                   </div>
// //                   <p className="text-xs text-gray-500">XLSX or CSV up to 10MB</p>
// //                 </div>
// //               </div>
// //               {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
// //             </div>

// //             <div className="mt-6">
// //               <button
// //                 type="submit"
// //                 disabled={isSubmitting}
// //                 className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
// //               >
// //                 {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Upload & Import'}
// //               </button>
// //             </div>
// //           </form>
// //         </Dialog.Panel>
// //       </div>
// //     </Dialog>
// //   );
// // };

// // export default ImportTrialBalanceModal;



// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Dialog } from '@headlessui/react';
// import { XMarkIcon, CloudArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
// import { apiClient } from '../../utils/api';
// import toast from 'react-hot-toast';
// import LoadingSpinner from '../../components/Common/LoadingSpinner';

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   engagementId?: string; // Pre-fill if we are inside an engagement context
// }

// interface ImportForm {
//   engagementId: string;
//   period: string;
//   description: string;
//   file: FileList;
// }

// const ImportTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, engagementId }) => {
//   const { register, handleSubmit, formState: { errors }, reset } = useForm<ImportForm>({
//     defaultValues: { engagementId: engagementId || '' }
//   });
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleDownloadTemplate = async () => {
//     try {
//       setIsDownloading(true);
//       const blob = await apiClient.getImportTemplate('trial-balance');
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'trial_balance_template.xlsx');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success("Template downloaded successfully");
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to download template");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const onSubmit = async (data: ImportForm) => {
//     try {
//       setIsSubmitting(true);
//       await apiClient.importTrialBalance({
//         file: data.file[0],
//         engagementId: data.engagementId,
//         period: data.period,
//         description: data.description
//       });
//       toast.success('Trial Balance imported successfully');
//       reset();
//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to import file');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//           <div className="flex justify-between items-center mb-4">
//             <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
//               Import Trial Balance
//             </Dialog.Title>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Engagement ID */}
//             {!engagementId && (
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Engagement ID</label>
//                     <input 
//                       {...register('engagementId', { required: 'Engagement ID is required' })} 
//                       className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
//                     />
//                     {errors.engagementId && <p className="text-red-500 text-xs mt-1">{errors.engagementId.message}</p>}
//                 </div>
//             )}

//             {/* Period Date Picker */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Period (Year End)</label>
//               <input 
//                 type="date" 
//                 {...register('period', { required: 'Period is required' })} 
//                 className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
//               />
//               {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period.message}</p>}
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Description</label>
//               <textarea 
//                 {...register('description')} 
//                 className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
//                 rows={3} 
//               />
//             </div>

//             {/* File Upload with Template Download */}
//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <label className="block text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
//                 <button 
//                   type="button" 
//                   onClick={handleDownloadTemplate} 
//                   disabled={isDownloading}
//                   className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 font-medium"
//                 >
//                   {isDownloading ? <LoadingSpinner size="sm" className="mr-1" /> : <DocumentArrowDownIcon className="w-4 h-4 mr-1" />}
//                   Download Template
//                 </button>
//               </div>
              
//               <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
//                 <div className="space-y-1 text-center">
//                   <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
//                   <div className="flex text-sm text-gray-600 justify-center">
//                     <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
//                       <span>Upload a file</span>
//                       <input 
//                         type="file" 
//                         className="sr-only" 
//                         accept=".xlsx, .csv" 
//                         {...register('file', { required: 'File is required' })} 
//                       />
//                     </label>
//                   </div>
//                   <p className="text-xs text-gray-500">XLSX or CSV up to 10MB</p>
//                 </div>
//               </div>
//               {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
//             </div>

//             <div className="mt-6 flex gap-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
//               >
//                 {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Upload & Import'}
//               </button>
//             </div>
//           </form>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default ImportTrialBalanceModal;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/api';
import { Engagement } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  engagementId?: string; // Pre-fill if we are inside an engagement context
}

interface ImportForm {
  engagementId: string;
  period: string;
  description: string;
  file: FileList;
}

const ImportTrialBalanceModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, engagementId }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ImportForm>({
    defaultValues: { engagementId: engagementId || '' }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // New state for storing engagements list
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);

  // Fetch engagements if ID is not provided via props
  useEffect(() => {
    if (isOpen && !engagementId) {
      const fetchEngagements = async () => {
        try {
          setLoadingEngagements(true);
          // Fetch active engagements (adjust limit as necessary)
          const response = await apiClient.getEngagements({ page: 1, limit: 50 });
          setEngagements(response.data.engagements);
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

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const blob = await apiClient.getImportTemplate('trial-balance');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'trial_balance_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  const onSubmit = async (data: ImportForm) => {
    try {
      setIsSubmitting(true);
      await apiClient.importTrialBalance({
        file: data.file[0],
        engagementId: data.engagementId, // Uses either the prop or the selected value
        period: data.period,
        description: data.description
      });
      toast.success('Trial Balance imported successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to import file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
              Import Trial Balance
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Engagement Selection: Show Select if ID not passed, otherwise hidden input */}
            {!engagementId ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Engagement</label>
                    {loadingEngagements ? (
                        <div className="mt-1 p-2 text-sm text-gray-500 bg-gray-50 rounded border">Loading engagements...</div>
                    ) : (
                        <select 
                          {...register('engagementId', { required: 'Engagement is required' })} 
                          className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                        >
                            <option value="">Select an Engagement...</option>
                            {engagements.map((eng) => (
                                <option key={eng.id} value={eng.id}>
                                    {eng.name} ({eng.client?.name})
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.engagementId && <p className="text-red-500 text-xs mt-1">{errors.engagementId.message}</p>}
                </div>
            ) : (
                <input type="hidden" {...register('engagementId')} value={engagementId} />
            )}

            {/* Period Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Period (Year End)</label>
              <input 
                type="date" 
                {...register('period', { required: 'Period is required' })} 
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
              {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                {...register('description')} 
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                rows={3} 
                placeholder="Optional notes..."
              />
            </div>

            {/* File Upload with Template Download */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
                <button 
                  type="button" 
                  onClick={handleDownloadTemplate} 
                  disabled={isDownloading}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 font-medium"
                >
                  {isDownloading ? <LoadingSpinner size="sm" className="mr-1" /> : <DocumentArrowDownIcon className="w-4 h-4 mr-1" />}
                  Download Template
                </button>
              </div>
              
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept=".xlsx, .csv" 
                        {...register('file', { required: 'File is required' })} 
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">XLSX or CSV up to 10MB</p>
                </div>
              </div>
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
              >
                {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Upload & Import'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportTrialBalanceModal;