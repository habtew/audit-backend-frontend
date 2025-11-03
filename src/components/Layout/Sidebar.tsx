import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Clients', href: '/clients', icon: BuildingOfficeIcon },
  { name: 'Engagements', href: '/engagements', icon: BriefcaseIcon },
  { name: 'Entities', href: '/entities', icon: DocumentTextIcon },
  { name: 'Workpapers', href: '/workpapers', icon: DocumentDuplicateIcon },
  { name: 'Risk Assessment', href: '/risk-assessments', icon: ShieldCheckIcon },
  { name: 'Trial Balance', href: '/trial-balances', icon: CalculatorIcon },
  { name: 'Invoices', href: '/invoices', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: ClipboardDocumentListIcon },
  { name: 'Compliance', href: '/compliance', icon: ExclamationTriangleIcon },
  { name: 'Billing', href: '/billing', icon: ClockIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">BusinessPro</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 BusinessPro
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;