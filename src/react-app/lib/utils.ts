import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface UserInfo {
  token: string;
  role: string;
  id: string;
  name: string;
  requireProfileUpdate: boolean;
}

export const setUserInfo = ({token, role, id, name, requireProfileUpdate}: UserInfo) => {
  localStorage.setItem('JWT_TOKEN', token);
  localStorage.setItem('USER_ROLE', role);
  localStorage.setItem('USER_ID', id);
  localStorage.setItem('USER_NAME', name || 'Nuevo Usuario');
  localStorage.setItem('REQUIRE_PROFILE_UPDATE', requireProfileUpdate ? 'true' : '');
  if (role === 'admin') {
    localStorage.setItem('ADMIN_MODE', 'active');
  }
}

export const clearUserInfo = () => {
  localStorage.removeItem('JWT_TOKEN');
  localStorage.removeItem('USER_ROLE');
  localStorage.removeItem('USER_ID');
  localStorage.removeItem('USER_NAME');
  localStorage.removeItem('REQUIRE_PROFILE_UPDATE');
  localStorage.removeItem('ADMIN_MODE');
}
