// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './hooks/useAuth';
// import Layout from './components/Layout/Layout';
// import LoginForm from './components/Auth/LoginForm';
// import RegisterForm from './components/Auth/RegisterForm';
// import Dashboard from './pages/Dashboard';
// import Users from './pages/Users';
// import Clients from './pages/Client';
// import Engagements from './pages/Engagements';
// import RiskAssessments from './pages/RiskAssessments';
// import Workpapers from './pages/Workpapers';
// import Entities from './pages/Entities';
// import TrialBalanceList from './pages/TrialBalance/TrialBalanceList';
// import TrialBalanceDetail from './pages/TrialBalance/TrialBalanceDetail';
// import InvoicesList from './pages/Billing/InvoicesList';
// import InvoiceDetail from './pages/Billing/InvoiceDetail';


// import LoadingSpinner from './components/Common/LoadingSpinner';
// import ErrorBoundary from './components/Common/ErrorBoundary';

// // Protected Route Component
// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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

// const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
//   <div className="text-center py-12">
//     <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
//     <p className="text-gray-600">This page is coming soon!</p>
//   </div>
// );

// function App() {
//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <Router>
//           <div className="App">
//             <Toaster position="top-right" />
//             <Routes>
//               <Route
//                 path="/login"
//                 element={
//                   <PublicRoute>
//                     <LoginForm />
//                   </PublicRoute>
//                 }
//               />
//               <Route
//                 path="/register"
//                 element={
//                   <PublicRoute>
//                     <RegisterForm />
//                   </PublicRoute>
//                 }
//               />
              
//               {/* Protected Routes */}
//               <Route
//                 path="/*"
//                 element={
//                   <ProtectedRoute>
//                     <Layout />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route index element={<Dashboard />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="users" element={<Users />} />
//                 <Route path="clients" element={<Clients />} />
//                 <Route path="engagements" element={<Engagements />} />
//                 <Route path="risk-assessments" element={<RiskAssessments />} />
//                 <Route path="entities" element={<Entities />} />
//                 <Route path="workpapers" element={<Workpapers />} />
//                 <Route path="trial-balances" element={<TrialBalanceList />} />
//                 <Route path="trial-balances/:id" element={<TrialBalanceDetail />} />
//                 <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
//                 <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
//                 <Route path="reports" element={<PlaceholderPage title="Reports" />} />
//                 <Route path="compliance" element={<PlaceholderPage title="Compliance" />} />
//                 <Route path="billing" element={<PlaceholderPage title="Billing" />} />
//                 <Route path="settings" element={<PlaceholderPage title="Settings" />} />
//               </Route>
//             </Routes>
//           </div>
//         </Router>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Client';
import Engagements from './pages/Engagements';
import RiskAssessments from './pages/RiskAssessments';
import Workpapers from './pages/Workpapers';
import Entities from './pages/Entities';
import TrialBalanceList from './pages/TrialBalance/TrialBalanceList';
import TrialBalanceDetail from './pages/TrialBalance/TrialBalanceDetail';
// Import the Billing pages
import InvoicesList from './pages/Billing/InvoicesList';
import InvoiceDetail from './pages/Billing/InvoiceDetail';

import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600">This page is coming soon!</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterForm />
                  </PublicRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="clients" element={<Clients />} />
                <Route path="engagements" element={<Engagements />} />
                <Route path="risk-assessments" element={<RiskAssessments />} />
                <Route path="entities" element={<Entities />} />
                <Route path="workpapers" element={<Workpapers />} />
                
                {/* Trial Balances */}
                <Route path="trial-balances" element={<TrialBalanceList />} />
                <Route path="trial-balances/:id" element={<TrialBalanceDetail />} />
                
                {/* Billing & Invoices - Simplified Routes */}
                <Route path="invoices" element={<InvoicesList />} />
                <Route path="billing/invoices" element={<Navigate to="/invoices" replace />} /> {/* Redirect old path */}
                <Route path="billing/invoices/:id" element={<InvoiceDetail />} />
                
                {/* Placeholders for remaining modules */}
                <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
                <Route path="reports" element={<PlaceholderPage title="Reports" />} />
                <Route path="compliance" element={<PlaceholderPage title="Compliance" />} />
                <Route path="billing" element={<PlaceholderPage title="Billing Dashboard" />} />
                <Route path="settings" element={<PlaceholderPage title="Settings" />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;