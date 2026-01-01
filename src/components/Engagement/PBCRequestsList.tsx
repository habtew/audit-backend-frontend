import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { PBCRequest, PBCStatus } from '../../types/index';
import LoadingSpinner from '../Common/LoadingSpinner';
import CreatePBCModal from './CreatePBCModal';
import { 
  PlusIcon, 
  PaperClipIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Props {
  engagementId: string;
}

const PBCRequestsList: React.FC<Props> = ({ engagementId }) => {
  const [requests, setRequests] = useState<PBCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await api.getPBCRequests(engagementId);
      if (response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      toast.error('Failed to load PBC requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [engagementId]);

  const handleFileUpload = async (requestId: string, file: File) => {
    setUploadingId(requestId);
    try {
      await api.uploadPBCFile(engagementId, requestId, file);
      toast.success('File uploaded successfully');
      fetchRequests(); // Refresh to show new file/status
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusColor = (status: PBCStatus) => {
    switch (status) {
      case PBCStatus.SUBMITTED: return 'bg-blue-100 text-blue-800';
      case PBCStatus.REVIEWED: return 'bg-green-100 text-green-800';
      case PBCStatus.RETURNED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Client Requests (PBC)</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No requests found. Create one to get started.
            </li>
          ) : requests.map((request) => (
            <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-indigo-600 truncate">{request.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 mr-6">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                        </p>
                        {request.files && request.files.length > 0 && (
                            <p className="flex items-center text-sm text-gray-500">
                                <PaperClipIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {request.files.length} file(s)
                            </p>
                        )}
                    </div>
                  </div>
                  {request.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{request.description}</p>
                  )}
                </div>
                
                {/* Actions / Upload Area */}
                <div className="ml-6 flex items-center">
                    {uploadingId === request.id ? (
                        <span className="text-xs text-indigo-500">Uploading...</span>
                    ) : (
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <PaperClipIcon className="h-4 w-4 mr-1 text-gray-500" />
                            Upload
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                    if(e.target.files?.[0]) handleFileUpload(request.id, e.target.files[0]);
                                }}
                            />
                        </label>
                    )}
                </div>
              </div>
              
              {/* File List */}
              {request.files && request.files.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-100">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Attached Files</h4>
                      <ul className="space-y-1">
                          {request.files.map((file, idx) => (
                              <li key={idx} className="text-sm text-indigo-600 hover:underline">
                                  <a href={file.url} target="_blank" rel="noreferrer">{file.originalName}</a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <CreatePBCModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRequests}
        engagementId={engagementId}
      />
    </div>
  );
};

export default PBCRequestsList;