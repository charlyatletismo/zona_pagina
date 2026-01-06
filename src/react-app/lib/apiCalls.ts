import { redirect } from '@tanstack/react-router';
import { SportingEventApiResponseType } from '@shared/types';
import { clearUserInfo } from './utils';


export const getSportingEvents = async () => {
  return getAuthenticated<SportingEventApiResponseType>('/api/sportingEvents')
};


export const getAuthenticatedThrow = async <T = any>(path: string) => {
  return getAuthenticated<T>(path,
    ({to, reloadDocument}: {to: string, reloadDocument: boolean}) => {
      throw redirect({
        to,
        reloadDocument,
      });
    }
  );
}


export const getAuthenticated = async <T = any>(path: string, navigate: any = () => {}): Promise<{
  status: number,
  body: {
    data: T,
    message?: Record<string, string>
  }
}> => {
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
  return {status: res.status, body: await res.json()};
}


export const postAuthenticated = async <T = any>(path: string, body?: object, navigate: any = () => {}): Promise<{
  status: number,
  body: {
    data: T,
    message?: Record<string, string>
  }
}> => {
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
  return {status: res.status, body: await res.json()};
}
