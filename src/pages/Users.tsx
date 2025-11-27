import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../utils/api';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Role Check
  const userRole = currentUser?.role?.toUpperCase() || 'STAFF';
  const canManageUsers = ['ADMIN', 'MANAGER', 'PARTNER'].includes(userRole);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<User>>();

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.getUsers();
      
      // Robust extraction
      let userData: User[] = [];
      // Case 1: Direct Array
      if (Array.isArray(response)) {
        userData = response;
      } 
      // Case 2: { data: [...] }
      else if (response?.data && Array.isArray(response.data)) {
        userData = response.data;
      } 
      // Case 3: { data: { users: [...] } } - Common for pagination
      else if (response?.data?.users && Array.isArray(response.data.users)) {
        userData = response.data.users;
      }
      
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: Partial<User>) => {
    try {
      await apiClient.createUser(data);
      toast.success('User created successfully');
      fetchUsers();
      closeModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to create user';
      toast.error(typeof msg === 'string' ? msg : 'Error creating user');
    }
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (!editingUser) return;
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: editingUser.isActive // Preserve status or allow update if added to form
      };
      
      await apiClient.updateUser(editingUser.id, payload);
      toast.success('User updated successfully');
      fetchUsers();
      closeModal();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update user';
      toast.error(typeof msg === 'string' ? msg : 'Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiClient.toggleUserStatus(userId);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      // Populate form with correct fields
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      reset({
        role: 'STAFF'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          You do not have permission to view this page. Only Admins and Managers can access User Management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const safeUsers = Array.isArray(users) ? users : [];
  
  const filteredUsers = safeUsers.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''} ${user.name || ''}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-orange-100 text-orange-800';
      case 'PARTNER': return 'bg-purple-100 text-purple-800';
      case 'SENIOR': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to check status (Backend returns boolean isActive)
  const isUserActive = (user: User) => {
    // Check strict boolean first
    if (typeof user.isActive === 'boolean') return user.isActive;
    // Fallback to string check if data is old/different
    return user.status === 'active';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your team members and their permissions</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by adding your first team member."
          actionLabel="Add User"
          onAction={() => openModal()}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-semibold text-sm">
                            {(user.firstName?.[0] || user.name?.[0] || '?').toUpperCase()}
                            {(user.lastName?.[0] || '').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role ?? '')}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          isUserActive(user) 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                       {isUserActive(user) ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </Dialog.Title>
                <form onSubmit={handleSubmit(editingUser ? handleUpdateUser : handleCreateUser)} className="space-y-4">
                  
                  {/* Split Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input 
                        {...register('firstName', { required: 'First Name is required' })} 
                        type="text" 
                        className="input" 
                        placeholder="John" 
                      />
                      {errors.firstName && <p className="text-error">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input 
                        {...register('lastName', { required: 'Last Name is required' })} 
                        type="text" 
                        className="input" 
                        placeholder="Doe" 
                      />
                      {errors.lastName && <p className="text-error">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input 
                      {...register('email', { 
                        required: 'Email is required', 
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } 
                      })} 
                      type="email" 
                      className="input" 
                      placeholder="john@example.com" 
                    />
                    {errors.email && <p className="text-error">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="label">Role</label>
                    <select {...register('role', { required: 'Role is required' })} className="input">
                      <option value="STAFF">Staff</option>
                      <option value="SENIOR">Senior</option>
                      <option value="MANAGER">Manager</option>
                      <option value="PARTNER">Partner</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    {errors.role && <p className="text-error">{errors.role.message}</p>}
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="label">Password</label>
                      <input 
                        {...register('password', { 
                          required: 'Password is required', 
                          minLength: { value: 6, message: 'Min 6 characters' } 
                        })} 
                        type="password" 
                        className="input" 
                        placeholder="••••••" 
                      />
                      {errors.password && <p className="text-error">{errors.password.message}</p>}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">{editingUser ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Users;