// src/utils/rbac.ts
import { UserRole } from '../types';

const ROLE_HIERARCHY: Record<string, number> = {
  STAFF: 1,      // <-- ADD THIS to match your User creation form
  ASSOCIATE: 1,
  SENIOR: 2,
  MANAGER: 3,
  PARTNER: 4,
  EQCR: 4,
  ADMIN: 5
};

export const hasMinimumRole = (userRole: string, minRole: string): boolean => {
  if (!userRole) return false; // Safety catch if role is undefined
  if (userRole === 'ADMIN') return true; 
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
};

export const hasExactRole = (userRole: string, allowedRoles: string[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};