// import React, { useEffect, useState } from 'react';
// import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
// import apiClient from '../../../utils/api';
// import { ReportTemplate, ReportHistory } from '../../../types';
// import toast from 'react-hot-toast';
// import LoadingSpinner from '../../../components/Common/LoadingSpinner';

// const ReportsTab: React.FC = () => {
//   const [templates, setTemplates] = useState<ReportTemplate[]>([]);
//   const [history, setHistory] = useState<ReportHistory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [generating, setGenerating] = useState<string | null>(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [tpl, hist] = await Promise.all([
//         apiClient.getReportTemplates(),
//         apiClient.getReportHistory()
//       ]);
      
//       setTemplates(tpl.data || []);
      
//       // FIX: The backend returns { reports: [], message: ... }
//       // We need to check if data is an array or an object containing the array
//       const historyData = hist.data as any;
//       if (Array.isArray(historyData)) {
//         setHistory(historyData);
//       } else if (historyData && Array.isArray(historyData.reports)) {
//         setHistory(historyData.reports);
//       } else {
//         setHistory([]);
//       }

//     } catch (error) {
//       console.error("Failed to load reports data", error);
//       toast.error("Could not load reports");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerate = async (code: string) => {
//     setGenerating(code);
//     try {
//       await apiClient.generateReport(code, {
//         startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), // Default to last month
//         endDate: new Date().toISOString()
//       });
//       toast.success('Report generation started');
//       loadData(); // Refresh history
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to generate report');
//     } finally {
//       setGenerating(null);
//     }
//   };

//   const handleDownload = async (id: string, name: string) => {
//     try {
//       const blob = await apiClient.downloadReport(id);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${name}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       toast.error('Download failed');
//     }
//   };

//   if (loading && templates.length === 0) return <LoadingSpinner />;

//   return (
//     <div className="space-y-8">
//       {/* Templates Grid */}
//       <div>
//         <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Templates</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {templates.map((t) => (
//             <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="p-2 bg-indigo-50 rounded-lg">
//                   <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
//                   {t.code || 'REPORT'}
//                 </span>
//               </div>
//               <h3 className="mt-4 text-lg font-medium text-gray-900">{t.name}</h3>
//               <p className="mt-1 text-sm text-gray-500 min-h-[40px]">{t.description}</p>
//               <button
//                 onClick={() => handleGenerate(t.code)}
//                 disabled={generating === t.code}
//                 className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//               >
//                 {generating === t.code ? 'Generating...' : 'Generate Report'}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* History List */}
//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
//           <h3 className="text-lg leading-6 font-medium text-gray-900">Report History</h3>
//           <button onClick={loadData} className="text-sm text-indigo-600 hover:text-indigo-900">
//             Refresh
//           </button>
//         </div>
//         <ul className="divide-y divide-gray-200">
//           {!history || history.length === 0 ? (
//             <li className="px-4 py-8 text-center text-gray-500">No reports generated yet.</li>
//           ) : (
//             history.map((item) => (
//               <li key={item.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-900">{item.templateName || 'Unnamed Report'}</span>
//                   <span className="text-xs text-gray-500">
//                     Generated by {item.generatedBy} on {new Date(item.generatedAt).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                     item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
//                     item.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {item.status}
//                   </span>
//                   {item.status === 'COMPLETED' && (
//                     <button 
//                       onClick={() => handleDownload(item.id, item.templateName)}
//                       className="text-gray-400 hover:text-indigo-600 transition-colors"
//                       title="Download PDF"
//                     >
//                       <DocumentArrowDownIcon className="h-5 w-5" />
//                     </button>
//                   )}
//                 </div>
//               </li>
//             ))
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ReportsTab;



import React, { useEffect, useState } from 'react';
import { DocumentArrowDownIcon, DocumentTextIcon, PlayIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../utils/api';
import { ReportTemplate, ReportHistory } from '../../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const ReportsTab: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  // Simple prompt state for Engagement ID
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCode, setPromptCode] = useState('');
  const [engagementIdInput, setEngagementIdInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tpl, hist] = await Promise.all([
        apiClient.getReportTemplates(),
        apiClient.getReportHistory()
      ]);
      
      setTemplates(tpl.data || []);
      
      const historyData = hist.data as any;
      if (Array.isArray(historyData)) {
        setHistory(historyData);
      } else if (historyData && Array.isArray(historyData.reports)) {
        setHistory(historyData.reports);
      } else {
        setHistory([]);
      }

    } catch (error) {
      console.error("Failed to load reports data", error);
      toast.error("Could not load reports");
    } finally {
      setLoading(false);
    }
  };

  const initiateGenerate = (code: string) => {
    // If it's an engagement report, we need an ID
    if (code.toLowerCase().includes('engagement')) {
      setPromptCode(code);
      setShowPrompt(true);
    } else {
      handleGenerate(code);
    }
  };

  const handleGenerate = async (code: string, engagementId?: string) => {
    setGenerating(code);
    try {
      // Build Params
      const params: any = {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        endDate: new Date().toISOString()
      };

      if (engagementId) {
        params.engagementId = engagementId;
      }

      await apiClient.generateReport(code, params);
      
      toast.success('Report generation started');
      setShowPrompt(false);
      setEngagementIdInput('');
      loadData(); 
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Failed to start generation';
      toast.error(msg);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const blob = await apiClient.downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  if (loading && templates.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-8 relative">
      
      {/* --- ID Prompt Modal --- */}
      {showPrompt && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">Enter Engagement ID</h3>
            <input 
              type="text" 
              className="w-full border rounded p-2 mb-4"
              placeholder="UUID..."
              value={engagementIdInput}
              onChange={(e) => setEngagementIdInput(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPrompt(false)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleGenerate(promptCode, engagementIdInput)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {t.code || 'REPORT'}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t.name}</h3>
              <p className="mt-1 text-sm text-gray-500 min-h-[40px]">{t.description}</p>
              <button
                onClick={() => initiateGenerate(t.code)}
                disabled={generating === t.code}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none disabled:opacity-50"
              >
                {generating === t.code ? 'Generating...' : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" /> Generate Report
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Report History</h3>
          <button onClick={loadData} className="text-sm text-indigo-600 hover:text-indigo-900">
            Refresh
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {!history || history.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No reports generated yet.</li>
          ) : (
            history.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{item.templateName || 'Unnamed Report'}</span>
                  <span className="text-xs text-gray-500">
                    Generated by {item.generatedBy} on {new Date(item.generatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    item.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                  {item.status === 'COMPLETED' && (
                    <button 
                      onClick={() => handleDownload(item.id, item.templateName)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Download PDF"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReportsTab;