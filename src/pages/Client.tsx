import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import  apiClient  from '../utils/api';
import { Client } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Client>>();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
  try {
    setLoading(true);
    const clients = await apiClient.getClients();
    setClients(clients || []);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    setClients([]);
  } finally {
    setLoading(false);
  }
};

  const handleCreateClient = async (data: Partial<Client>) => {
    try {
      await apiClient.createClient(data);
      toast.success('Client created successfully');
      fetchClients();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleUpdateClient = async (data: Partial<Client>) => {
    if (!editingClient) return;
    
    try {
      await apiClient.updateClient(editingClient.id, data);
      toast.success('Client updated successfully');
      fetchClients();
      setIsModalOpen(false);
      setEditingClient(null);
      reset();
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await apiClient.deleteClient(clientId);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset(client);
    } else {
      setEditingClient(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'badge-success' : 'badge-gray';
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Education',
    'Non-profit',
    'Other',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and information</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Get started by adding your first client."
          actionLabel="Add Client"
          onAction={() => openModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-lg">
                      {client.company?.charAt(0).toUpperCase() || client.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{client.company || client.name}</h3>
                    <p className="text-sm text-gray-500">{client.industry}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(client.status ?? 'unknown')} capitalize`}>
                  {client.status ?? 'Unknown'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Contact:</span>
                  <span className="ml-2">{client.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{client.phone}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Added {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* View client details */}}
                    className="text-gray-600 hover:text-gray-900"
                    title="View details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(client)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit client"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete client"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingClient ? 'Edit Client' : 'Add New Client'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(editingClient ? handleUpdateClient : handleCreateClient)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="label">Contact Name</label>
                      <input
                        {...register('name', { required: 'Contact name is required' })}
                        type="text"
                        className="input"
                        placeholder="Enter contact name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Company Name</label>
                      <input
                        {...register('company', { required: 'Company name is required' })}
                        type="text"
                        className="input"
                        placeholder="Enter company name"
                      />
                      {errors.company && (
                        <p className="mt-1 text-sm text-red-600">{errors.company?.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        type="email"
                        className="input"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Phone</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="label">Industry</label>
                      <select {...register('industry', { required: 'Industry is required' })} className="input">
                        <option value="">Select industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                      {errors.industry && (
                        <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingClient ? 'Update' : 'Create'} Client
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

export default Clients;