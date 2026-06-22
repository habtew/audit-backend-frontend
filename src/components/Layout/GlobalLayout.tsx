// src/components/Layout/GlobalLayout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header'; // Your existing Header

const GLOBAL_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Engagements', path: '/engagements', icon: '📁' },
  { name: 'Clients', path: '/clients', icon: '🏢' },
  { name: 'Entities', path: '/entities', icon: '🏛️' },
  { name: 'Team / Users', path: '/users', icon: '👥' },
];

const GlobalLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Global Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit<span className="text-indigo-400">Pro</span></h1>
          <p className="text-xs text-slate-400 mt-1">Firm Management Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {GLOBAL_NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default GlobalLayout;