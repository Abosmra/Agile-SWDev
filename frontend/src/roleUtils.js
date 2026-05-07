export const STAFF_ROLES = ['staff', 'admin', 'doctor', 'ta', 'teaching assistant', 'advisor'];

export function normalizeRoleName(role) {
  return String(role || 'student').trim().toLowerCase();
}

export function isStaffRole(role) {
  return STAFF_ROLES.includes(normalizeRoleName(role));
}

export function isAdminRole(role) {
  return normalizeRoleName(role) === 'admin';
}

export function getDefaultRouteForRole(role) {
  if (isAdminRole(role)) return '/staff';
  return isStaffRole(role) ? '/staff-dashboard' : '/courses';
}

export function formatRoleLabel(role) {
  const normalized = normalizeRoleName(role);
  if (normalized === 'ta') return 'TA';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
