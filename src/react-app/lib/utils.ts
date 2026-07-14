import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { rankItem } from "@tanstack/match-sorter-utils";


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
  banned?: boolean;
  banReason?: string;
  previewFeatures?: boolean;
}

export const setUserInfo = (data: UserInfo) => {
  localStorage.setItem('JWT_TOKEN', data.token);
  localStorage.setItem('USER_ROLE', data.role);
  localStorage.setItem('USER_ID', data.id);
  localStorage.setItem('USER_NAME', data.name || 'Nuevo Usuario');
  localStorage.setItem('USER_LANGUAGE', data.language || 'es');
  localStorage.setItem('REQUIRE_PROFILE_UPDATE', data.requireProfileUpdate ? 'true' : '');
  if (data.role === 'admin') {
    localStorage.setItem('ADMIN_MODE', 'active');
  }
  localStorage.setItem('BANNED', data.banned ? 'true' : 'false');
  localStorage.setItem('BAN_REASON', data.banReason || '');
  if (data.previewFeatures) {
    localStorage.setItem('PREVIEW_FEATURES', 'active');
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
  localStorage.removeItem('BANNED');
  localStorage.removeItem('BAN_REASON');
  localStorage.removeItem('PREVIEW_FEATURES');
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

export const removeDiacritics = (s: string) => {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export const lowerAndRemoveDiacritics = (s: string) => {
  // Normalize the string to the NFD form, separating base characters from diacritics.
  // The 'g' flag ensures global replacement (all occurrences).
  // The 'u' flag enables Unicode property escapes like \p{Diacritic}.
  return removeDiacritics(s).toLowerCase();
}

export const customFilterFn = (row: any, columnId: string, filterValue: string) => {
  /* **** Fuzzy filter **** */
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), filterValue)
  // Store the ranking info
  // addMeta(itemRank)
  // Return if the item should be filtered in/out
  return itemRank.passed
}

const formatDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = hours % 12 || 12;
  if (minutes === 0) {
    return `${hour12} ${ampm}`;
  } else {
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
};

export const formatPeriod = (start: Date, end?: Date | null | undefined): string => {
  if (!end) {
    const lang = getLang();
    const dateStr = formatDate(start);
    const timeStr = formatTime(start);
    if (lang === 'es') {
      return `${dateStr} a las ${timeStr}`;
    } else {
      return `${dateStr} at ${timeStr}`;
    }
  }
  const lang = getLang();
  const sameDay = start.toDateString() === end.toDateString();
  const dateStr = formatDate(start);
  const time1 = formatTime(start);
  const time2 = formatTime(end);
  if (lang === 'es') {
    if (sameDay) {
      return `${dateStr} desde las ${time1} hasta las ${time2}`;
    } else {
      const date2Str = formatDate(end);
      return `Desde el ${dateStr} a las ${time1} hasta el ${date2Str} a las ${time2}`;
    }
  } else {
    if (sameDay) {
      return `${dateStr} from ${time1} to ${time2}`;
    } else {
      const date2Str = formatDate(end);
      return `From ${dateStr} at ${time1} to ${date2Str} at ${time2}`;
    }
  }
};
