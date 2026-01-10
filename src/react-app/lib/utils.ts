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
  language?: string;
}

export const setUserInfo = ({token, role, id, name, requireProfileUpdate, language}: UserInfo) => {
  localStorage.setItem('JWT_TOKEN', token);
  localStorage.setItem('USER_ROLE', role);
  localStorage.setItem('USER_ID', id);
  localStorage.setItem('USER_NAME', name || 'Nuevo Usuario');
  localStorage.setItem('USER_LANGUAGE', language || 'es');
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
  localStorage.removeItem('USER_LANGUAGE');
  localStorage.removeItem('REQUIRE_PROFILE_UPDATE');
  localStorage.removeItem('ADMIN_MODE');
}

export const getLang = (): string => {
  return localStorage.getItem('USER_LANGUAGE') || 'es';
}

export const getMessage = (
  message: Record<string, string> | undefined,
  defaultMessage: string = '',
  prefix: string = ''
): string => {
  if (!message) return defaultMessage;
  const lang = getLang();
  return prefix + (message[lang] || message['es'] || defaultMessage);
}


export const capitalizeStr = (s: string) => {
  if (s.length === 0) return s;
  return s.split(" ")
    .map(word =>
      word.charAt(0).toUpperCase()
      + word.slice(1).toLowerCase()
    )
    .join(" ");
}
