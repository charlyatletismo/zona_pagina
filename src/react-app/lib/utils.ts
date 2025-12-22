import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface UserInfo {
  token: string;
  roles: string;
  id: string;
  name: string;
  requireProfileUpdate: boolean;
}

export const setUserInfo = ({token, roles, id, name, requireProfileUpdate}: UserInfo) => {
  localStorage.setItem('JWT_TOKEN', token);
  localStorage.setItem('USER_ROLES', roles);
  localStorage.setItem('USER_ID', id);
  localStorage.setItem('USER_NAME', name || 'Nuevo Usuario');
  localStorage.setItem('REQUIRE_PROFILE_UPDATE', requireProfileUpdate ? 'true' : '');
  localStorage.setItem('USER_ROLE', roles.split(",")[0] || '');
}

export const clearUserInfo = () => {
  localStorage.removeItem('JWT_TOKEN');
  localStorage.removeItem('USER_ROLES');
  localStorage.removeItem('USER_ID');
  localStorage.removeItem('USER_NAME');
  localStorage.removeItem('REQUIRE_PROFILE_UPDATE');
  localStorage.removeItem('USER_ROLE');
}
