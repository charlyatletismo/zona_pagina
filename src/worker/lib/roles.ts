// Copy of src/react-app/lib/roles.ts
export const ADMIN_ROLE = 'admin';
export const ORGANIZER_ROLE = 'organizer';
export const ATHLETE_ROLE = 'athlete';
export const ATHLETES_MANAGER_ROLE = 'athletes_manager';


export const authorizedRoles = (allowedRoles: string[], userRawRoles: string) => {
  for (const role of allowedRoles) {
    if (userRawRoles.includes(role)) {
      return true;
    }
  }
  return false;
}


export const authorizedOrg = (userRawRoles: string | null) => {
  if (!userRawRoles) return false;
  return authorizedRoles([ORGANIZER_ROLE, ADMIN_ROLE], userRawRoles);
}


export const authorizedAthMan = (userRawRoles: string | null) => {
  if (!userRawRoles) return false;
  return authorizedRoles([ATHLETES_MANAGER_ROLE, ORGANIZER_ROLE, ADMIN_ROLE], userRawRoles);
}
