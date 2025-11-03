import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import  apiClient from '../utils/api';
import { User } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import EmptyState from '../components/Common/EmptyState';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<User>>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(users || []);
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
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      await apiClient.updateUser(editingUser.id, data);
      toast.success('User updated successfully');
      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    } catch (error) {
      toast.error('Failed to update user');
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
      reset(user);
    } else {
      setEditingUser(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'badge-error';
      case 'manager':
        return 'badge-warning';
      case 'user':
        return 'badge-primary';
      default:
        return 'badge-gray';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'badge-success' : 'badge-gray';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your team members and their permissions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by adding your first team member."
          actionLabel="Add User"
          onAction={() => openModal()}
        />
      ) : (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getRoleColor(user.role ?? '')} capitalize`}>
                      {user.role ?? 'N/A'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`badge ${getStatusColor(user.status ?? 'inactive')} capitalize cursor-pointer hover:opacity-80`}
                      >
                       {user.status ?? 'inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt ?? '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(editingUser ? handleUpdateUser : handleCreateUser)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="label">Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className="input"
                        placeholder="Enter user name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                      <label className="label">Role</label>
                      <select {...register('role', { required: 'Role is required' })} className="input">
                        <option value="">Select role</option>
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                      )}
                    </div>

                    {!editingUser && (
                      <div>
                        <label className="label">Password</label>
                        <input
                          {...register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          type="password"
                          className="input"
                          placeholder="Enter password"
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingUser ? 'Update' : 'Create'} User
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

export default Users;