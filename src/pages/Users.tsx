// src/pages/Users.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
  UsersIcon, PlusIcon, PencilSquareIcon, TrashIcon, 
  NoSymbolIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/api';
import RoleGuard from '../components/Auth/RoleGuard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Users: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STAFF'
  });

  // Fetch all users and current profile
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, profileRes] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getUserProfile().catch(() => ({ data: null }))
      ]);
      
      const uData = usersRes.data?.data?.users || usersRes.data?.users || [];
      setUsers(Array.isArray(uData) ? uData : []);
      
      const pData = profileRes.data?.data || profileRes.data;
      setCurrentUserProfile(pData);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Safe Error Handler ---
  const handleError = (e: any, fallback: string) => {
    const errorObj = e.response?.data;
    let message = fallback;
    if (typeof errorObj === 'string') message = errorObj;
    else if (errorObj?.message) message = Array.isArray(errorObj.message) ? errorObj.message[0] : errorObj.message;
    toast.error(message);
  };

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Leave password blank on edit unless they want to change it (depends on backend logic)
      role: user.role || 'STAFF'
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      if (editingId) {
        // When editing, do not send the password field if it is empty
        const payload: any = { 
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role
        };
        if (form.password) payload.password = form.password;

        await apiClient.updateUser(editingId, payload);
        toast.success('User updated successfully');
      } else {
        // When creating, send all fields including password
        await apiClient.createUser(form);
        toast.success('User created successfully');
      }
      setIsFormModalOpen(false);
      fetchData();
    } catch (e: any) {
      handleError(e, 'Failed to save user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, isCurrentlyActive: boolean) => {
    // Prevent locking yourself out
    if (currentUserProfile?.id === userId) {
      return toast.error("You cannot deactivate your own account.");
    }

    setActionLoading(true);
    try {
      await apiClient.toggleUserStatus(userId);
      toast.success(`User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`);
      fetchData();
    } catch (e: any) {
      handleError(e, 'Failed to toggle user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    // Prevent deleting yourself
    if (currentUserProfile?.id === userId) {
      return toast.error("You cannot delete your own account.");
    }

    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    
    setActionLoading(true);
    try {
      await apiClient.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchData();
    } catch (e: any) {
      handleError(e, 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI Helpers ---
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'PARTNER': return <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] uppercase font-bold rounded-md border border-indigo-200">Partner</span>;
      case 'MANAGER': return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-md border border-blue-200">Manager</span>;
      case 'SENIOR': return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded-md border border-emerald-200">Senior</span>;
      default: return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] uppercase font-bold rounded-md border border-slate-200">Staff</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Firm Users</h1>
          <p className="text-slate-500 mt-1">Manage employee access, roles, and account statuses.</p>
        </div>
        <RoleGuard minRole="MANAGER">
          <button 
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add User
          </button>
        </RoleGuard>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UsersIcon className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Users Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">No users are currently registered in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName} {currentUserProfile?.id === user.id && <span className="ml-2 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">(You)</span>}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <RoleGuard minRole="MANAGER">
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.isActive)} 
                          disabled={actionLoading || currentUserProfile?.id === user.id}
                          className={`p-1.5 rounded-lg transition-colors inline-block ${user.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'} disabled:opacity-30`}
                          title={user.isActive ? "Deactivate Account" : "Activate Account"}
                        >
                          {user.isActive ? <NoSymbolIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(user)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          disabled={actionLoading || currentUserProfile?.id === user.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block disabled:opacity-30"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </RoleGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================================== */}
      <Transition appear show={isFormModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsFormModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900 mb-4 border-b border-slate-100 pb-3">
                    {editingId ? 'Edit User' : 'Create New User'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">First Name *</label>
                        <input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="e.g. Jane" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Last Name *</label>
                        <input required type="text" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="e.g. Doe" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Email Address *</label>
                      <input required type="email" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. jane@firm.com" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">System Role *</label>
                      <select required className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        <option value="PARTNER">Partner</option>
                        <option value="MANAGER">Manager</option>
                        <option value="SENIOR">Senior</option>
                        <option value="STAFF">Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        {editingId ? 'Password (leave blank to keep current)' : 'Initial Password *'}
                      </label>
                      <input 
                        required={!editingId} 
                        type="password" 
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                        value={form.password} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                        placeholder={editingId ? '••••••••' : 'Enter strong password'} 
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                      <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                        {editingId ? 'Save Changes' : 'Create User'}
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