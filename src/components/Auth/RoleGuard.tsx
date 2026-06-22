// src/components/Auth/RoleGuard.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
// import { UserRole } from '../../types';
import { hasMinimumRole, hasExactRole } from '../../utils/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  
  // Use this for strict checks (e.g., ONLY a Partner or EQCR can see this)
  exactRoles?: UserRole[];
  
  // Use this for hierarchical checks (e.g., Manager AND ABOVE can see this)
  minRole?: UserRole;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  fallback = null, 
  exactRoles, 
  minRole 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (exactRoles && exactRoles.length > 0) {
    hasAccess = hasExactRole(user.role as UserRole, exactRoles);
  } else if (minRole) {
    hasAccess = hasMinimumRole(user.role as UserRole, minRole);
  } else {
    // If no roles specified, default to allowing access (just checking auth)
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;