// import React, { useEffect, useState } from 'react';
// import apiClient from '../../../utils/api';
// import { AuditLog, UserAccessLog } from '../../../types';
// import LoadingSpinner from '../../../components/Common/LoadingSpinner';

// const ComplianceTab: React.FC = () => {
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [access, setAccess] = useState<UserAccessLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState<'audit' | 'access'>('audit');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [l, a] = await Promise.all([
//           apiClient.getAuditTrail(),
//           apiClient.getUserAccessLogs()
//         ]);
//         setLogs(l.data);
//         setAccess(a.data);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <LoadingSpinner />;

//   return (
//     <div className="bg-white shadow rounded-lg overflow-hidden">
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex">
//           <button
//             onClick={() => setView('audit')}
//             className={`${view === 'audit' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
//           >
//             Audit Trail
//           </button>
//           <button
//             onClick={() => setView('access')}
//             className={`${view === 'access' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
//           >
//             User Access Logs
//           </button>
//         </nav>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {view === 'audit' ? (
//                 <>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
//                 </>
//               ) : (
//                 <>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 </>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {view === 'audit' ? (
//               logs.map((log) => (
//                 <tr key={log.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userEmail}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{JSON.stringify(log.details)}</td>
//                 </tr>
//               ))
//             ) : (
//               access.map((acc) => (
//                 <tr key={acc.userId}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.userName}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.role}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(acc.lastLogin).toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                       {acc.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ComplianceTab;


import React, { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';
import { AuditLog, UserAccessLog } from '../../../types';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ComplianceTab: React.FC = () => {
  const [view, setView] = useState<'audit' | 'access'>('access');
  const [loading, setLoading] = useState(false);
  
  // Initialize as empty arrays to prevent .map crashes
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accessLogs, setAccessLogs] = useState<UserAccessLog[]>([]);

  // Default dates: Last 30 days
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [auditSearch, setAuditSearch] = useState({
    entityType: 'Engagement',
    entityId: ''
  });

  useEffect(() => {
    if (view === 'access') {
      fetchAccessLogs();
    }
  }, [view]);

  const fetchAccessLogs = async () => {
    setLoading(true);
    try {
      // Ensure ISO strings are fully compliant if backend expects them
      const params = {
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString()
      };

      const response = await apiClient.getUserAccessLogs(params);
      
      // Safety check: ensure response.data is an array
      if (Array.isArray(response.data)) {
        setAccessLogs(response.data);
      } else {
        console.warn("Unexpected response format for access logs:", response.data);
        setAccessLogs([]); 
      }
    } catch (error) {
      console.error("Access logs error", error);
      toast.error("Failed to fetch access logs");
      setAccessLogs([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    if (!auditSearch.entityId) {
      toast.error("Please enter an Entity ID");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.getAuditTrail(auditSearch.entityType, auditSearch.entityId);
      
      if (Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error("Audit trail error", error);
      toast.error("Audit trail not found or error occurred");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden min-h-[500px]">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setView('access')}
            className={`${view === 'access' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
          >
            User Access Logs
          </button>
          <button
            onClick={() => setView('audit')}
            className={`${view === 'audit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`}
          >
            Entity Audit Trail
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* --- View: User Access Logs --- */}
        {view === 'access' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end mb-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button 
                onClick={fetchAccessLogs}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow-sm"
              >
                Filter Logs
              </button>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Safe Check: Ensure accessLogs is an array before mapping */}
                    {!Array.isArray(accessLogs) || accessLogs.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No access logs found for this period.</td></tr>
                    ) : (
                      accessLogs.map((acc, idx) => (
                        <tr key={acc.userId || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.userName || 'Unknown User'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.role || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {acc.lastLogin ? new Date(acc.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${acc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {acc.status || 'UNKNOWN'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- View: Audit Trail --- */}
        {view === 'audit' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-1/4">
                  <label className="block text-xs font-medium text-gray-700">Entity Type</label>
                  <select
                    value={auditSearch.entityType}
                    onChange={(e) => setAuditSearch(prev => ({ ...prev, entityType: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Engagement">Engagement</option>
                    <option value="Client">Client</option>
                    <option value="User">User</option>
                    <option value="Workpaper">Workpaper</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-medium text-gray-700">Entity ID</label>
                  <input
                    type="text"
                    placeholder="e.g. uuid-1234..."
                    value={auditSearch.entityId}
                    onChange={(e) => setAuditSearch(prev => ({ ...prev, entityId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <button 
                  onClick={fetchAuditTrail}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow-sm"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Search Trail
                </button>
              </div>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!Array.isArray(auditLogs) || auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No audit logs found for this entity.</td></tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                                log.action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userEmail}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTab;