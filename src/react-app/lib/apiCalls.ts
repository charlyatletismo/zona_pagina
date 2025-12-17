import { redirect } from '@tanstack/react-router';
import { SportingEventApiResponse } from '@/lib/types';


export const getSportingEvents: () => Promise<SportingEventApiResponse> = async () => getAuthenticated('/api/sportingEvents');



export const getAuthenticated = async (path: string) => {
  const options: Record<string, any> = {method: "GET"}
  if (localStorage.getItem('JWT_TOKEN')) {
    options['headers'] = {"Authorization": `Bearer ${localStorage.getItem('JWT_TOKEN')}`}
  }
  const res = await fetch(path, options)
  if (res.status === 401) {
    localStorage.removeItem('JWT_TOKEN');
    redirect({ to: '/login' });
  }
  if (res.ok) {
    return res.json();
  }
  console.log("Fetch failed:", res);
  console.log("Response status:", res.status);
  console.log("Response status text:", await res.json());
  alert("Ha ocurrido un error inesperado. Se lo redirigirá al inicio.");
  redirect({ to: '/' });
}


export const postAuthenticated = async (path: string, body?: object) => {
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
    localStorage.removeItem('JWT_TOKEN');
    redirect({ to: '/login' });
  }
  if (res.ok) {
    return res.json();
  }
  console.log("Fetch failed:", res);
  console.log("Response status:", res.status);
  console.log("Response status text:", await res.json());
  alert("Ha ocurrido un error inesperado. Se lo redirigirá al inicio.");
  redirect({ to: '/' });
}
