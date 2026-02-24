import { redirect } from '@tanstack/react-router';
import { clearUserInfo } from './utils';
import z from 'zod';


export const getAuthenticatedThrow = async <T = any>(path: string, schema?: z.ZodSchema<T>) => {
  return getAuthenticated<T>(
    path,
    schema,
    ({to, reloadDocument}: {to: string, reloadDocument: boolean}) => {
      throw redirect({
        to,
        reloadDocument,
      });
    },
  );
}


export const getAuthenticated = async <T = unknown>(
  path: string,
  schema?: z.ZodSchema<T>,
  navigate: any = () => {}
): Promise<{
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
  const body = await res.json();
  if (schema) {
    body.data = schema.nullable().optional().parse(body.data);
  }
  return {status: res.status, body};
}


export const postAuthenticated = async <T = unknown>(path: string, body?: object, navigate: any = () => {}): Promise<{
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


export const postAuthenticatedFile = async <T = unknown>(path: string, body: FormData, navigate: any = () => {}): Promise<{
  status: number,
  body: {
    data: T,
    message?: Record<string, string>
  }
}> => {
  if (!localStorage.getItem('JWT_TOKEN')) {
    // Unauthorized, clear user info
    clearUserInfo();
    navigate({ to: '/login', reloadDocument: true });
  }
  const options = {
    method: "POST",
    headers: {
      // "Content-Type": "multipart/form-data", // Let the browser set the correct Content-Type with boundary
      "Authorization": `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
    },
    body,
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
