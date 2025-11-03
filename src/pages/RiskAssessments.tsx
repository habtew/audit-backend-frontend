import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../utils/api';
import { RiskAssessment, Engagement } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

interface RiskFormInputs {
  title: string;
  engagementId: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  mitigation?: string;
}

const RiskAssessments: React.FC = () => {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskAssessment | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RiskFormInputs>({
    defaultValues: {
      title: '',
      engagementId: '',
      description: '',
      riskLevel: 'low',
      likelihood: 'low',
      impact: 'low',
      status: 'identified',
      mitigation: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [risksResponse, engagementsResponse] = await Promise.all([
        apiClient.getRiskAssessments(),
        apiClient.getEngagements(),
      ]);
      setRiskAssessments(risksResponse);
      setEngagements(engagementsResponse);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRiskAssessments([]);
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async (data: RiskFormInputs) => {
    try {
      await apiClient.createRiskAssessment(data);
      toast.success('Risk assessment created successfully');
      fetchData();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create risk assessment');
    }
  };

  const handleUpdateRisk = async (data: RiskFormInputs) => {
    if (!editingRisk?.id) return;
    try {
      await apiClient.updateRiskAssessment(editingRisk.id, data);
      toast.success('Risk assessment updated successfully');
      fetchData();
      setIsModalOpen(false);
      setEditingRisk(null);
      reset();
    } catch (error) {
      toast.error('Failed to update risk assessment');
    }
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk assessment?')) return;
    try {
      await apiClient.deleteRiskAssessment(riskId);
      toast.success('Risk assessment deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete risk assessment');
    }
  };

  const openModal = (risk?: RiskAssessment) => {
    if (risk) {
      setEditingRisk(risk);
      reset({
        title: risk.title,
        engagementId: risk.engagementId,
        description: risk.description,
        riskLevel: risk.riskLevel,
        likelihood: risk.likelihood,
        impact: risk.impact,
        status: risk.status,
        mitigation: risk.mitigation || '',
      });
    } else {
      setEditingRisk(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRisk(null);
    reset();
  };

  const filteredRisks = riskAssessments.filter(risk => {
    const matchesSearch = risk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRiskLevel = !riskLevelFilter || risk.riskLevel === riskLevelFilter;
    const matchesStatus = !statusFilter || risk.status === statusFilter;
    return matchesSearch && matchesRiskLevel && matchesStatus;
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'badge-success';
      case 'mitigated': return 'badge-primary';
      case 'assessed': return 'badge-warning';
      case 'identified': return 'badge-error';
      default: return 'badge-gray';
    }
  };

  const getRiskIcon = (level: string) => {
    const iconClass = "h-5 w-5";
    switch (level) {
      case 'critical':
      case 'high': return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
      case 'medium': return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'low': return <ExclamationTriangleIcon className={`${iconClass} text-green-500`} />;
      default: return <ExclamationTriangleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getEngagementName = (engagementId: string) => {
    const engagement = engagements.find(e => e.id === engagementId);
    return engagement?.title || 'Unknown Engagement';
  };

  const riskLevels = ['low', 'medium', 'high', 'critical'];
  const riskStatuses = ['identified', 'assessed', 'mitigated', 'closed'];
  const likelihoodLevels = ['low', 'medium', 'high'];
  const impactLevels = ['low', 'medium', 'high'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessments</h1>
          <p className="text-gray-600">Identify, assess, and manage risks across your engagements</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Risk Assessment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search risk assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={riskLevelFilter}
          onChange={(e) => setRiskLevelFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="">All Risk Levels</option>
          {riskLevels.map(level => (
            <option key={level} value={level} className="capitalize">
              {level}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          {riskStatuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      {filteredRisks.length === 0 ? (
        <EmptyState
          title="No risk assessments found"
          description="Get started by creating your first risk assessment."
          actionLabel="New Risk Assessment"
          onAction={() => openModal()}
          icon={ExclamationTriangleIcon}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRisks.map((risk) => (
            <div key={risk.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  {getRiskIcon(risk.riskLevel || "")}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{risk.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{getEngagementName(risk.engagementId)}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{risk.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`badge ${getRiskLevelColor(risk.riskLevel || "")} capitalize border`}>
                    {risk.riskLevel}
                  </span>
                  <span className={`badge ${getStatusColor(risk.status)} capitalize`}>
                    {risk.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Likelihood:</span>
                    <span className={`ml-2 capitalize ${
                      risk.likelihood === 'high' ? 'text-red-600' :
                      risk.likelihood === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {risk.likelihood}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Impact:</span>
                    <span className={`ml-2 capitalize ${
                      risk.impact === 'high' ? 'text-red-600' :
                      risk.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {risk.impact}
                    </span>
                  </div>
                </div>

                {risk.mitigation && (
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Mitigation:</span>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{risk.mitigation}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {risk.createdAt ? new Date(risk.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(risk)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit risk assessment"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRisk(risk.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete risk assessment"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingRisk ? 'Edit Risk Assessment' : 'New Risk Assessment'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(editingRisk ? handleUpdateRisk : handleCreateRisk)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label">Title</label>
                        <input
                          {...register('title', { required: 'Title is required' })}
                          type="text"
                          className="input"
                          placeholder="Enter risk title"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Engagement</label>
                        <select {...register('engagementId', { required: 'Engagement is required' })} className="input">
                          <option value="">Select engagement</option>
                          {engagements.map((engagement) => (
                            <option key={engagement.id} value={engagement.id}>
                              {engagement.title}
                            </option>
                          ))}
                        </select>
                        {errors.engagementId && (
                          <p className="mt-1 text-sm text-red-600">{errors.engagementId.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Risk Level</label>
                        <select {...register('riskLevel', { required: 'Risk level is required' })} className="input">
                          <option value="">Select risk level</option>
                          {riskLevels.map((level) => (
                            <option key={level} value={level} className="capitalize">
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.riskLevel && (
                          <p className="mt-1 text-sm text-red-600">{errors.riskLevel.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Likelihood</label>
                        <select {...register('likelihood', { required: 'Likelihood is required' })} className="input">
                          <option value="">Select likelihood</option>
                          {likelihoodLevels.map((level) => (
                            <option key={level} value={level} className="capitalize">
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.likelihood && (
                          <p className="mt-1 text-sm text-red-600">{errors.likelihood.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Impact</label>
                        <select {...register('impact', { required: 'Impact is required' })} className="input">
                          <option value="">Select impact</option>
                          {impactLevels.map((level) => (
                            <option key={level} value={level} className="capitalize">
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.impact && (
                          <p className="mt-1 text-sm text-red-600">{errors.impact.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Status</label>
                        <select {...register('status', { required: 'Status is required' })} className="input">
                          <option value="">Select status</option>
                          {riskStatuses.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                        {errors.status && (
                          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="label">Description</label>
                        <textarea
                          {...register('description', { required: 'Description is required' })}
                          rows={3}
                          className="input"
                          placeholder="Describe the risk"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="label">Mitigation Strategy</label>
                        <textarea
                          {...register('mitigation')}
                          rows={3}
                          className="input"
                          placeholder="Describe mitigation strategies"
                        />
                        {errors.mitigation && (
                          <p className="mt-1 text-sm text-red-600">{errors.mitigation.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={closeModal} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingRisk ? 'Update' : 'Create'} Risk Assessment
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RiskAssessments;