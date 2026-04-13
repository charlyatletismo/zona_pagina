import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginDynamicForm } from '@/components/loginForm';


export const Route = createFileRoute('/login')({
  component: RouteComponent,
  beforeLoad: async () => {
    if (localStorage.getItem('JWT_TOKEN')) {
      throw redirect({to: '/'});
    }
  }
})


function RouteComponent() {
  return <LoginDynamicForm />;
}
