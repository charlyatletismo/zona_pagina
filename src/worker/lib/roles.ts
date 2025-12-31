// Copy of src/react-app/lib/roles.ts
export const ADMIN_ROLE = 'admin';
export const ORGANIZER_ROLE = 'organizer';
export const ATHLETE_ROLE = 'athlete';
export const ATHLETES_MANAGER_ROLE = 'athletes_manager';


export const authorizedRoles = (allowedRoles: string[], userRole: string) => {
  return allowedRoles.includes(userRole);
}


export const authorizedOrg = (userRole: string | null) => {
  if (!userRole) return false;
  return authorizedRoles([ORGANIZER_ROLE, ADMIN_ROLE], userRole);
}


export const authorizedAthMan = (userRole: string | null) => {
  if (!userRole) return false;
  return authorizedRoles([ATHLETES_MANAGER_ROLE, ORGANIZER_ROLE, ADMIN_ROLE], userRole);
}
