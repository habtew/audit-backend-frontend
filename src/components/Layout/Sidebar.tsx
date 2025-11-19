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
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

// Define roles constants to match your Backend PDF/Response
const ROLES = {
  ADMIN: 'ADMIN',
  PARTNER: 'PARTNER',
  MANAGER: 'MANAGER',
  SENIOR: 'SENIOR',
  STAFF: 'STAFF', // Maps to "User" in your register form typically
};

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  allowedRoles?: string[]; // Optional: if undefined, allowed for all
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon 
    // Allowed for ALL
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: UsersIcon, 
    allowedRoles: [ROLES.ADMIN, ROLES.PARTNER, ROLES.MANAGER] 
  },
  { 
    name: 'Clients', 
    href: '/clients', 
    icon: BuildingOfficeIcon 
    // Allowed for ALL (STAFF has GET /api/clients)
  },
  { 
    name: 'Engagements', 
    href: '/engagements', 
    icon: BriefcaseIcon 
    // Allowed for ALL
  },
  { 
    name: 'Entities', 
    href: '/entities', 
    icon: DocumentTextIcon 
    // Allowed for ALL
  },
  { 
    name: 'Workpapers', 
    href: '/workpapers', 
    icon: DocumentDuplicateIcon 
    // Allowed for ALL
  },
  { 
    name: 'Risk Assessment', 
    href: '/risk-assessments', 
    icon: ShieldCheckIcon 
    // Allowed for ALL
  },
  { 
    name: 'Trial Balance', 
    href: '/trial-balances', 
    icon: CalculatorIcon 
    // Allowed for ALL
  },
  { 
    name: 'Invoices', 
    href: '/invoices', 
    icon: CurrencyDollarIcon,
    allowedRoles: [ROLES.ADMIN, ROLES.PARTNER, ROLES.MANAGER]
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon 
    // Allowed for ALL (STAFF has specific analytics endpoints)
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: ClipboardDocumentListIcon,
    allowedRoles: [ROLES.ADMIN, ROLES.PARTNER, ROLES.MANAGER]
  },
  { 
    name: 'Compliance', 
    href: '/compliance', 
    icon: ExclamationTriangleIcon,
    allowedRoles: [ROLES.ADMIN, ROLES.PARTNER, ROLES.MANAGER]
  },
  { 
    name: 'Billing', 
    href: '/billing', 
    icon: ClockIcon 
    // Allowed for ALL (STAFF needs time entries)
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon 
    // Allowed for ALL
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Normalize role to uppercase to match constants (e.g. "Staff" -> "STAFF")
  const userRole = user?.role?.toUpperCase() || ROLES.STAFF;

  const filteredNavigation = navigation.filter((item) => {
    if (!item.allowedRoles) return true; // If no specific roles defined, allow everyone
    return item.allowedRoles.includes(userRole);
  });

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
            {filteredNavigation.map((item) => {
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

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-200">
             <div className="mb-4 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase">Logged in as</p>
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name || user?.email}</p>
                <p className="text-xs text-primary-600 font-medium">{userRole}</p>
             </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;