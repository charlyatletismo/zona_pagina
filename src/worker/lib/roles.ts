// Copy of src/react-app/lib/roles.ts
export const ADMIN_ROLE = 'admin';
export const ORGANIZER_ROLE = 'organizer';
export const ATHLETE_ROLE = 'athlete';
export const ATHLETES_MANAGER_ROLE = 'athletes_manager';


const authOrg = [ORGANIZER_ROLE, ADMIN_ROLE];
const authAthMan = [ATHLETES_MANAGER_ROLE, ORGANIZER_ROLE, ADMIN_ROLE];


export const authorizedOrg = (userRole: string | null) => {
  if (!userRole) return false;
  return authOrg.includes(userRole);
}



export const authorizedAthMan = (userRole: string | null) => {
  if (!userRole) return false;
  return authAthMan.includes(userRole);
}
