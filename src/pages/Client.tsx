// import React, { useEffect, useState } from 'react';
// import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment } from 'react';
// import { useForm } from 'react-hook-form';
// import apiClient from '../utils/api';
// import { Client } from '../types';
// import LoadingSpinner from '../components/Common/LoadingSpinner';
// import EmptyState from '../components/Common/EmptyState';
// import toast from 'react-hot-toast';

// const Clients: React.FC = () => {
//   const [clients, setClients] = useState<Client[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // Filter & Pagination
//   const [searchTerm, setSearchTerm] = useState('');
//   const [industryFilter, setIndustryFilter] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const LIMIT = 10;

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingClient, setEditingClient] = useState<Client | null>(null);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<Partial<Client>>();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchClients();
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm, industryFilter, page]);

//   const fetchClients = async () => {
//     try {
//       setLoading(true);
//       const params: any = { page, limit: LIMIT };
//       if (searchTerm) params.search = searchTerm;
//       if (industryFilter) params.industry = industryFilter;

//       const response: any = await apiClient.getClients(params);
      
//       // Robust Data Extraction
//       let clientData: Client[] = [];
//       if (response?.data?.clients && Array.isArray(response.data.clients)) {
//         clientData = response.data.clients;
//         setTotalPages(response.data.pagination?.totalPages || 1);
//       } else if (Array.isArray(response?.data)) {
//         clientData = response.data;
//       } else if (Array.isArray(response)) {
//         clientData = response;
//       }
      
//       setClients(clientData);
//     } catch (error) {
//       console.error('Failed to fetch clients:', error);
//       setClients([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateClient = async (data: Partial<Client>) => {
//     try {
//       await apiClient.createClient(data);
//       toast.success('Client created successfully');
//       fetchClients();
//       setIsModalOpen(false);
//       reset();
//     } catch (error) {
//       // Toast handled by interceptor
//     }
//   };

//   const handleUpdateClient = async (data: Partial<Client>) => {
//     if (!editingClient) return;
//     try {
//       await apiClient.updateClient(editingClient.id, data);
//       toast.success('Client updated successfully');
//       fetchClients();
//       setIsModalOpen(false);
//       setEditingClient(null);
//       reset();
//     } catch (error) {
//       // Toast handled by interceptor
//     }
//   };

//   const handleDeleteClient = async (clientId: string) => {
//     if (!confirm('Are you sure you want to delete this client?')) return;
//     try {
//       await apiClient.deleteClient(clientId);
//       toast.success('Client deleted successfully');
//       fetchClients();
//     } catch (error) {
//        // Toast handled by interceptor
//     }
//   };

//   const openModal = (client?: Client) => {
//     if (client) {
//       setEditingClient(client);
//       // Use "name" for Company Name as per API
//       reset({
//         name: client.name,
//         email: client.email,
//         phone: client.phone,
//         industry: client.industry,
//         address: client.address,
//         // Add other fields if supported by Client type
//       });
//     } else {
//       setEditingClient(null);
//       reset({
//         name: '',
//         email: '',
//         phone: '',
//         industry: '',
//         address: ''
//       });
//     }
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingClient(null);
//     reset();
//   };

//   const getStatusColor = (status: any) => {
//      if (status === 'active' || status === true) return 'badge-success';
//      return 'badge-gray';
//   };

//   const industries = [
//     'Technology', 'Healthcare', 'Finance', 'Manufacturing',
//     'Retail', 'Real Estate', 'Education', 'Non-profit', 'Other',
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
//           <p className="text-gray-600">Manage your client relationships and information</p>
//         </div>
//         <button onClick={() => openModal()} className="btn-primary w-full sm:w-auto">
//           <PlusIcon className="h-5 w-5 mr-2" />
//           Add Client
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search clients..."
//             value={searchTerm}
//             onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
//             className="input pl-10"
//           />
//         </div>
//         <div className="w-full sm:w-48">
//             <select 
//                 value={industryFilter} 
//                 onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }} 
//                 className="input"
//             >
//                 <option value="">All Industries</option>
//                 {industries.map((ind) => (
//                     <option key={ind} value={ind}>{ind}</option>
//                 ))}
//             </select>
//         </div>
//       </div>

//       {/* Grid */}
//       {loading ? (
//          <div className="flex justify-center items-center h-64">
//            <LoadingSpinner size="lg" />
//          </div>
//       ) : clients.length === 0 ? (
//         <EmptyState
//           title="No clients found"
//           description="No clients match your current filters or none have been added yet."
//           actionLabel="Add Client"
//           onAction={() => openModal()}
//         />
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {clients.map((client) => (
//               <div key={client.id} className="card hover:shadow-md transition-shadow flex flex-col">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
//                       <span className="text-primary-600 font-medium text-lg">
//                         {(client.name || '?').charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-medium text-gray-900 line-clamp-1" title={client.name}>
//                           {client.name}
//                       </h3>
//                       <p className="text-sm text-gray-500">{client.industry || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <span className={`badge ${getStatusColor(client.status)} capitalize shrink-0`}>
//                     {client.status === 'active' || client.status === true as any ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>

//                 <div className="space-y-2 flex-1">
//                   <div className="flex items-center text-sm text-gray-600">
//                     <span className="font-medium w-16">Email:</span>
//                     <span className="truncate" title={client.email}>{client.email}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <span className="font-medium w-16">Phone:</span>
//                     <span>{client.phone || 'N/A'}</span>
//                   </div>
//                 </div>

//                 <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
//                   <span className="text-xs text-gray-500">
//                     Added {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
//                   </span>
//                   <div className="flex space-x-2">
//                     <button onClick={() => openModal(client)} className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-blue-50">
//                       <PencilIcon className="h-4 w-4" />
//                     </button>
//                     <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
//                       <TrashIcon className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4 bg-white rounded-lg shadow-sm">
//                 <div className="flex flex-1 justify-between sm:hidden">
//                     <button
//                         onClick={() => setPage(Math.max(1, page - 1))}
//                         disabled={page === 1}
//                         className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                         Previous
//                     </button>
//                     <button
//                         onClick={() => setPage(Math.min(totalPages, page + 1))}
//                         disabled={page === totalPages}
//                         className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                         Next
//                     </button>
//                 </div>
//                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                     <div>
//                         <p className="text-sm text-gray-700">
//                             Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
//                         </p>
//                     </div>
//                     <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
//                         <button
//                             onClick={() => setPage(Math.max(1, page - 1))}
//                             disabled={page === 1}
//                             className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
//                         >
//                             <span className="sr-only">Previous</span>
//                             <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
//                         </button>
//                         <button
//                             onClick={() => setPage(Math.min(totalPages, page + 1))}
//                             disabled={page === totalPages}
//                             className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
//                         >
//                             <span className="sr-only">Next</span>
//                             <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
//                         </button>
//                     </nav>
//                 </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Modal */}
//       <Transition appear show={isModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeModal}>
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black bg-opacity-25" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
//                     {editingClient ? 'Edit Client' : 'Add New Client'}
//                   </Dialog.Title>

//                   <form onSubmit={handleSubmit(editingClient ? handleUpdateClient : handleCreateClient)} className="space-y-4">
//                     <div>
//                       <label className="label">Company Name</label>
//                       <input
//                         {...register('name', { required: 'Company Name is required' })}
//                         type="text"
//                         className="input"
//                         placeholder="e.g. ABC Ltd"
//                       />
//                       {errors.name && (
//                         <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="label">Email</label>
//                       <input
//                         {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }})}
//                         type="email"
//                         className="input"
//                         placeholder="contact@company.com"
//                       />
//                       {errors.email && (
//                         <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="label">Phone</label>
//                       <input
//                         {...register('phone')}
//                         type="tel"
//                         className="input"
//                         placeholder="+1-555-0000"
//                       />
//                     </div>

//                     <div>
//                         <label className="label">Address</label>
//                         <input
//                             {...register('address')}
//                             type="text"
//                             className="input"
//                             placeholder="123 Main St"
//                         />
//                     </div>

//                     <div>
//                       <label className="label">Industry</label>
//                       <select {...register('industry', { required: 'Industry is required' })} className="input">
//                         <option value="">Select industry</option>
//                         {industries.map((industry) => (
//                           <option key={industry} value={industry}>{industry}</option>
//                         ))}
//                       </select>
//                       {errors.industry && (
//                         <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
//                       )}
//                     </div>

//                     <div className="flex justify-end space-x-3 pt-4">
//                       <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
//                       <button type="submit" className="btn-primary">{editingClient ? 'Update' : 'Create'} Client</button>
//                     </div>
//                   </form>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default Clients;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../utils/api';
import { Client, Engagement } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [clientEngagements, setClientEngagements] = useState<Engagement[]>([]);
  const [engagementsLoading, setEngagementsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Client>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, industryFilter, page]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: LIMIT };
      if (searchTerm) params.search = searchTerm;
      if (industryFilter) params.industry = industryFilter;

      const response: any = await apiClient.getClients(params);
      
      let clientData: Client[] = [];
      if (response?.data?.clients && Array.isArray(response.data.clients)) {
        clientData = response.data.clients;
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (Array.isArray(response?.data)) {
        clientData = response.data;
      } else if (Array.isArray(response)) {
        clientData = response;
      }
      
      setClients(clientData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientEngagements = async (clientId: string) => {
    try {
        setEngagementsLoading(true);
        const response: any = await apiClient.getClientEngagements(clientId);
        
        // Robust extraction
        let engData: Engagement[] = [];
        if (Array.isArray(response)) {
            engData = response;
        } else if (Array.isArray(response?.data)) {
            engData = response.data;
        } else if (Array.isArray(response?.data?.engagements)) {
            engData = response.data.engagements;
        }
        
        setClientEngagements(engData);
    } catch (error) {
        console.error("Error fetching engagements", error);
        setClientEngagements([]);
    } finally {
        setEngagementsLoading(false);
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
      // Handled by interceptor
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
      // Handled by interceptor
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, client: Client) => {
    e.stopPropagation(); // Prevent opening view modal
    try {
      const newStatus = !client.isActive;
      await apiClient.updateClient(client.id, { isActive: newStatus });
      toast.success(`Client ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchClients(); // Refresh list
    } catch (error) {
      // Handled by interceptor
    }
  };

  const handleDeleteClient = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await apiClient.deleteClient(clientId);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
       // Handled by interceptor
    }
  };

  const openEditModal = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    reset({
      name: client.name,
      email: client.email,
      phone: client.phone,
      industry: client.industry,
      address: client.address,
      contactPerson: client.contactPerson,
      taxId: client.taxId,
      isActive: client.isActive
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingClient(null);
    reset({ name: '', email: '', phone: '', industry: '', address: '', isActive: true });
    setIsModalOpen(true);
  };

  const openViewModal = (client: Client) => {
    setViewingClient(client);
    setClientEngagements([]); // clear previous
    setIsViewModalOpen(true);
    fetchClientEngagements(client.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingClient(null);
  };

  const getStatusColor = (isActive: boolean | undefined) => {
     return isActive ? 'badge-success' : 'badge-gray';
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing',
    'Retail', 'Real Estate', 'Education', 'Non-profit', 'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and information</p>
        </div>
        <button onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
            <select 
                value={industryFilter} 
                onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }} 
                className="input"
            >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
         <div className="flex justify-center items-center h-64">
           <LoadingSpinner size="lg" />
         </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="No clients match your current filters or none have been added yet."
          actionLabel="Add Client"
          onAction={openAddModal}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="card hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                onClick={() => openViewModal(client)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <span className="text-primary-600 font-medium text-lg">
                        {(client.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-1" title={client.name}>
                          {client.name}
                      </h3>
                      <p className="text-sm text-gray-500">{client.industry || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(e, client)}
                    className={`badge ${getStatusColor(client.isActive)} capitalize shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                    title="Click to toggle status"
                  >
                    {client.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-16">Email:</span>
                    <span className="truncate" title={client.email}>{client.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-16">Phone:</span>
                    <span>{client.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                        onClick={(e) => openEditModal(e, client)} 
                        className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-blue-50" 
                        title="Edit client"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={(e) => handleDeleteClient(e, client.id)} 
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" 
                        title="Delete client"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - (Keep your existing pagination code here) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
          )}
        </>
      )}

      {/* VIEW DETAILS MODAL */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeViewModal}>
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
                    <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        {viewingClient && (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{viewingClient.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{viewingClient.industry} • {viewingClient.isActive ? 'Active' : 'Inactive'}</p>
                                    </div>
                                    <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-500">
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between"><dt className="text-gray-500">Contact Person:</dt><dd className="font-medium text-gray-900">{viewingClient.contactPerson || 'N/A'}</dd></div>
                                            <div className="flex justify-between"><dt className="text-gray-500">Email:</dt><dd className="font-medium text-gray-900">{viewingClient.email}</dd></div>
                                            <div className="flex justify-between"><dt className="text-gray-500">Phone:</dt><dd className="font-medium text-gray-900">{viewingClient.phone || 'N/A'}</dd></div>
                                        </dl>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Company Details</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between"><dt className="text-gray-500">Address:</dt><dd className="font-medium text-gray-900">{viewingClient.address || 'N/A'}</dd></div>
                                            <div className="flex justify-between"><dt className="text-gray-500">Tax ID:</dt><dd className="font-medium text-gray-900">{viewingClient.taxId || 'N/A'}</dd></div>
                                            <div className="flex justify-between"><dt className="text-gray-500">Registered:</dt><dd className="font-medium text-gray-900">{viewingClient.createdAt ? new Date(viewingClient.createdAt).toLocaleDateString() : 'N/A'}</dd></div>
                                        </dl>
                                    </div>
                                </div>

                                <h4 className="text-lg font-medium text-gray-900 mb-4">Engagements</h4>
                                {engagementsLoading ? (
                                    <LoadingSpinner />
                                ) : clientEngagements.length > 0 ? (
                                    <div className="overflow-hidden bg-white shadow sm:rounded-md border border-gray-200">
                                        <ul role="list" className="divide-y divide-gray-200">
                                            {clientEngagements.map((engagement) => (
                                                <li key={engagement.id}>
                                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                                            <div className="truncate">
                                                                <div className="flex text-sm">
                                                                    <p className="font-medium text-primary-600 truncate">{engagement.title}</p>
                                                                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">in {engagement.type}</p>
                                                                </div>
                                                                <div className="mt-2 flex">
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                        <p>
                                                                            Status: <span className="font-medium text-gray-900 capitalize">{engagement.status}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No engagements found</h3>
                                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new engagement for this client.</p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => navigate('/engagements')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                Go to Engagements
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
             </div>
          </div>
        </Dialog>
      </Transition>

      {/* ADD/EDIT MODAL */}
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingClient ? 'Edit Client' : 'Add New Client'}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(editingClient ? handleUpdateClient : handleCreateClient)} className="space-y-4">
                    <div>
                      <label className="label">Company Name</label>
                      <input
                        {...register('name', { required: 'Company Name is required' })}
                        type="text"
                        className="input"
                        placeholder="e.g. ABC Ltd"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    {/* Other inputs same as previous response */}
                    <div>
                        <label className="label">Contact Person</label>
                        <input {...register('contactPerson')} type="text" className="input" placeholder="John Smith" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }})} type="email" className="input" placeholder="contact@company.com" />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input {...register('phone')} type="tel" className="input" placeholder="+1-555-0000" />
                    </div>
                    <div>
                        <label className="label">Address</label>
                        <input {...register('address')} type="text" className="input" placeholder="123 Main St" />
                    </div>
                     <div>
                        <label className="label">Tax ID</label>
                        <input {...register('taxId')} type="text" className="input" placeholder="TAX-12345" />
                    </div>
                    <div>
                      <label className="label">Industry</label>
                      <select {...register('industry', { required: 'Industry is required' })} className="input">
                        <option value="">Select industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    {/* Add checkbox for isActive in Edit mode if desired */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary">{editingClient ? 'Update' : 'Create'} Client</button>
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