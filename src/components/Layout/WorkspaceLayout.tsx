// src/components/Layout/WorkspaceLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { Engagement } from '../../types';
import LoadingSpinner from '../Common/LoadingSpinner';

const WORKSPACE_PHASES = [
  { id: 'overview', name: 'Overview', path: 'overview', icon: '🏠' },
  { id: 'phase1', name: '1. Pre-Engagement', path: 'pre-engagement', icon: '📝' },
  { id: 'phase2', name: '2. Planning & Risk', path: 'planning', icon: '🎯' },
  { id: 'phase3', name: '3. Data Acquisition', path: 'data-acquisition', icon: '📊' },
  { id: 'phase4', name: '4. Execution', path: 'execution', icon: '⚙️' },
  { id: 'pbc', name: 'Client PBC Requests', path: 'pbc-requests', icon: '📥' },
  { id: 'workpapers', name: '4b. Workpapers', path: 'workpapers', icon: '📁' },
  { id: 'phase5', name: '5. Completion', path: 'completion', icon: '🏁' },
  { id: 'phase6', name: '6. Archive', path: 'archive', icon: '🔒' },
];

const WorkspaceLayout: React.FC = () => {
  const { engagementId } = useParams<{ engagementId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        if (!engagementId) return;
        const res = await apiClient.getEngagementById(engagementId);
        setEngagement(res.data);
      } catch (error) {
        console.error("Failed to fetch engagement details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEngagement();
  }, [engagementId]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!engagement) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Engagement Not Found</h2>
        <button onClick={() => navigate('/engagements')} className="text-indigo-600 hover:underline">
          Return to Engagements
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Workspace Sidebar */}
      <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shadow-sm z-10">
        
        {/* Workspace Header / Context */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <button 
            onClick={() => navigate('/engagements')}
            className="flex items-center text-xs text-slate-500 hover:text-indigo-600 mb-4 transition-colors font-semibold uppercase tracking-wider"
          >
            ← Back to Firm
          </button>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-3">
            {engagement.status}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {engagement.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {engagement.client?.name} • FYE {new Date(engagement.yearEnd).getFullYear()}
          </p>
        </div>

        {/* Phase Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Audit Phases
          </div>
          <ul className="space-y-1 px-3">
            {WORKSPACE_PHASES.map((phase) => {
              const isActive = location.pathname.includes(`/workspace/${phase.path}`);
              return (
                <li key={phase.id}>
                  <Link
                    to={`/engagements/${engagementId}/workspace/${phase.path}`}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={`mr-3 text-lg ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                      {phase.icon}
                    </span>
                    {phase.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Workspace Main Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Optional Workspace Topbar could go here (e.g. for quick actions, user profile) */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
           <h3 className="text-sm font-medium text-slate-800">
             Active Phase: <span className="text-indigo-600 ml-1">
               {WORKSPACE_PHASES.find(p => location.pathname.includes(p.path))?.name}
             </span>
           </h3>
        </div>
        
        {/* Dynamic Phase Component Injection */}
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet context={{ engagement }} />
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;