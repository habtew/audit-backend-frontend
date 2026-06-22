// // src/App.tsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './hooks/useAuth';
// import { UserRole } from './types';
// import { hasExactRole, hasMinimumRole } from './utils/rbac';

// // Layouts
// import GlobalLayout from './components/Layout/GlobalLayout';
// import WorkspaceLayout from './components/Layout/WorkspaceLayout';

// // Global Pages
// import LoginForm from './components/Auth/LoginForm';
// import RegisterForm from './components/Auth/RegisterForm';
// import Dashboard from './pages/Dashboard';
// import Users from './pages/Users';
// import Clients from './pages/Client';
// import Entities from './pages/Entities';
// import Engagements from './pages/Engagements';

// // Workspace Pages
// import PreEngagementPhase from './pages/Workspace/PreEngagementPhase';
// import PlanningPhase from './pages/Workspace/PlanningPhase';
// import TrialBalancePhase from './pages/Workspace/TrialBalancePhase';
// import ExecutionPhase from './pages/Workspace/ExecutionPhase';
// import CompletionPhase from './pages/Workspace/CompletionPhase';
// import OverviewPhase from './pages/Workspace/OverviewPhase';

// // Components
// import LoadingSpinner from './components/Common/LoadingSpinner';
// import ErrorBoundary from './components/Common/ErrorBoundary';

// // Workspace Phase Placeholders (To be replaced as we build them)
// const PlaceholderPhase: React.FC<{ title: string; phase: number }> = ({ title, phase }) => (
//   <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
//     <div className="bg-indigo-50 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
//       {phase}
//     </div>
//     <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
//     <p className="text-gray-500">Phase UI will be implemented in the upcoming steps.</p>
//   </div>
// );

// // Enhanced Protected Route with RBAC capabilities
// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   minRole?: UserRole;
//   exactRoles?: UserRole[];
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, minRole, exactRoles }) => {
//   const { isAuthenticated, loading, user } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/login" />;
//   }

//   // Check strict exact roles if provided
//   if (exactRoles && exactRoles.length > 0 && !hasExactRole(user.role as UserRole, exactRoles)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // Check minimum hierarchical role if provided
//   if (minRole && !hasMinimumRole(user.role as UserRole, minRole)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <>{children}</>;
// };

// // Public Route Component
// const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
// };

// function App() {
//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <Router>
//           <div className="App bg-gray-50 min-h-screen flex flex-col font-sans">
//             <Toaster position="top-right" />
//             <Routes>
              
//               {/* Public Authentication Routes */}
//               <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
//               <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
              
//               {/* FIRM-LEVEL GLOBAL ROUTES */}
//               <Route path="/" element={<ProtectedRoute><GlobalLayout /></ProtectedRoute>}>
//                 <Route index element={<Navigate to="/dashboard" replace />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="engagements" element={<Engagements />} />
//                 <Route path="clients" element={<Clients />} />
//                 <Route path="entities" element={<Entities />} />
                
//                 {/* Role-Protected Route: Only Partners and Admins can manage users */}
//                 <Route 
//                   path="users" 
//                   element={
//                     <ProtectedRoute minRole="PARTNER">
//                       <Users />
//                     </ProtectedRoute>
//                   } 
//                 />
//               </Route>

//               {/* ENGAGEMENT WORKSPACE ROUTES (The 6-Phase Architecture) */}
//               <Route 
//                 path="/engagements/:engagementId/workspace" 
//                 element={
//                   <ProtectedRoute>
//                     <WorkspaceLayout />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route index element={<Navigate to="overview" replace />} />
//                 <Route path="overview" element={<OverviewPhase />} />
                
//                 {/* Phase 1: Pre-Engagement */}
//                 <Route path="pre-engagement" element={<PreEngagementPhase />} />
                
//                 {/* Phase 2: Planning & Risk Assessment */}
//                 <Route path="planning" element={<PlanningPhase />} />
                
//                 {/* Phase 3: Data Acquisition & Trial Balance */}
//                 <Route path="data-acquisition" element={<TrialBalancePhase />} />
                
//                 {/* Phase 4: Fieldwork & Execution */}
//                 <Route path="execution" element={<ExecutionPhase />} />
                
//                 {/* Phase 5: Completion & Reporting */}
//                 <Route path="completion" element={<CompletionPhase />} />
                
//                 {/* Phase 6: Lockdown & Archive */}
//                 <Route path="archive" element={<PlaceholderPhase title="Lockdown & Archive" phase={6} />} />
//               </Route>

//             </Routes>
//           </div>
//         </Router>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// }

// export default App;



// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import { hasExactRole, hasMinimumRole } from './utils/rbac';

// Layouts
import GlobalLayout from './components/Layout/GlobalLayout';
import WorkspaceLayout from './components/Layout/WorkspaceLayout';

// Global Pages
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard'; // <-- NEW: Analytics Import
import Users from './pages/Users';
import Clients from './pages/Client';
import Entities from './pages/Entities';
import Engagements from './pages/Engagements';

// Workspace Pages
import PreEngagementPhase from './pages/Workspace/PreEngagementPhase';
import PlanningPhase from './pages/Workspace/PlanningPhase';
import TrialBalancePhase from './pages/Workspace/TrialBalancePhase';
import ExecutionPhase from './pages/Workspace/ExecutionPhase';
import CompletionPhase from './pages/Workspace/CompletionPhase';
import OverviewPhase from './pages/Workspace/OverviewPhase';
import WorkpapersPhase from './pages/Workspace/WorkpapersPhase';
import PbcPhase from './pages/Workspace/PbcPhase';

// Components
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Workspace Phase Placeholders (To be replaced as we build them)
const PlaceholderPhase: React.FC<{ title: string; phase: number }> = ({ title, phase }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
    <div className="bg-indigo-50 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
      {phase}
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
    <p className="text-gray-500">Phase UI will be implemented in the upcoming steps.</p>
  </div>
);

// Enhanced Protected Route with RBAC capabilities
interface ProtectedRouteProps {
  children: React.ReactNode;
  minRole?: UserRole;
  exactRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, minRole, exactRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Check strict exact roles if provided
  if (exactRoles && exactRoles.length > 0 && !hasExactRole(user.role as UserRole, exactRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check minimum hierarchical role if provided
  if (minRole && !hasMinimumRole(user.role as UserRole, minRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App bg-gray-50 min-h-screen flex flex-col font-sans">
            <Toaster position="top-right" />
            <Routes>
              
              {/* Public Authentication Routes */}
              <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
              
              {/* FIRM-LEVEL GLOBAL ROUTES */}
              <Route path="/" element={<ProtectedRoute><GlobalLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* NEW: Role-Protected Analytics Route (Managers and above) */}
                {/* <Route 
                  path="analytics" 
                  element={
                    <ProtectedRoute minRole="MANAGER">
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } 
                /> */}
                <Route path="analytics" element={<AnalyticsDashboard />} />

                <Route path="engagements" element={<Engagements />} />
                <Route path="clients" element={<Clients />} />
                <Route path="entities" element={<Entities />} />
                
                {/* Role-Protected Route: Only Partners and Admins can manage users */}
                {/* <Route 
                  path="users" 
                  element={
                    <ProtectedRoute minRole="STAFF">
                      <Users />
                    </ProtectedRoute>
                  } 
                /> */}
              <Route path="users" element={<Users />} />
              </Route>

              {/* ENGAGEMENT WORKSPACE ROUTES (The 6-Phase Architecture) */}
              <Route 
                path="/engagements/:engagementId/workspace" 
                element={
                  <ProtectedRoute>
                    <WorkspaceLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<OverviewPhase />} />
                
                {/* Phase 1: Pre-Engagement */}
                <Route path="pre-engagement" element={<PreEngagementPhase />} />
                
                {/* Phase 2: Planning & Risk Assessment */}
                <Route path="planning" element={<PlanningPhase />} />
                
                {/* Phase 3: Data Acquisition & Trial Balance */}
                <Route path="data-acquisition" element={<TrialBalancePhase />} />
                
                {/* Phase 4: Fieldwork & Execution */}
                <Route path="execution" element={<ExecutionPhase />} />
                <Route path="workpapers" element={<WorkpapersPhase />} />
                {/* Phase 5: Completion & Reporting */}
                <Route path="completion" element={<CompletionPhase />} />
                <Route path="pbc-requests" element={<PbcPhase />} />
                
                {/* Phase 6: Lockdown & Archive (Also points to CompletionPhase logic) */}
                <Route path="archive" element={<CompletionPhase />} />
              </Route>

            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;