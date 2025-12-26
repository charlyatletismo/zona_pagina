// Copy of src/react-app/lib/roles.ts
export const ADMIN_ROLE = 'admin';
export const ORGANIZER_ROLE = 'organizer';
export const ATHLETE_ROLE = 'athlete';
export const ATHLETES_MANAGER_ROLE = 'athletes_manager';


export const authorizedRoles = (allowedRoles: string[], userRoles: string[]) => {
  for (const role of allowedRoles) {
    if (userRoles.includes(role)) {
      return true;
    }
  }
  return false;
}
