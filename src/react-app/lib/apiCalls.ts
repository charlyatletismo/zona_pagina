import { redirect } from '@tanstack/react-router';
import { SportingEventApiResponseType } from '@/lib/types';
import { clearUserInfo } from './utils';


export const getSportingEvents: () => Promise<{
  status: number,
  data: SportingEventApiResponseType
}> = async () => {
  return getAuthenticated('/api/sportingEvents')
};


export const getAuthenticatedThrow = async (path: string) => {
  return getAuthenticated(path,
    ({to, reloadDocument}: {to: string, reloadDocument: boolean}) => {
      throw redirect({
        to,
        reloadDocument,
      });
    }
  );
}


export const getAuthenticated = async (path: string, navigate: any = () => {}) => {
  const options: Record<string, any> = {method: "GET"}
  if (localStorage.getItem('JWT_TOKEN')) {
    options['headers'] = {"Authorization": `Bearer ${localStorage.getItem('JWT_TOKEN')}`}
  }
  const res = await fetch(path, options)
  if (res.status === 401) {
    // Unauthorized, clear user info
    clearUserInfo();
    navigate({ to: '/login', reloadDocument: true });
  }
  if (res.status === 403) {
    // Forbidden
    navigate({ to: '/unauthorized' });
  }
  return {status: res.status, data: await res.json()};
}


export const postAuthenticated = async (path: string, body?: object, navigate: any = () => {}) => {
  const options: Record<string, any> = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  }
  if (localStorage.getItem('JWT_TOKEN')) {
    options['headers']['Authorization'] = `Bearer ${localStorage.getItem('JWT_TOKEN')}`
  }
  if (body) {
    options['body'] = JSON.stringify(body);
  }
  const res = await fetch(path, options);
  if (res.status === 401) {
    // Unauthorized, clear user info
    clearUserInfo();
    navigate({ to: '/login', reloadDocument: true });
  }
  if (res.status === 403) {
    // Forbidden
    navigate({ to: '/unauthorized' });
  }
  return {status: res.status, data: await res.json()};
}
