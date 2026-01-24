import { createFileRoute } from '@tanstack/react-router';
import { LoginDynamicForm } from '@/components/loginForm';


export const Route = createFileRoute('/login')({
  component: RouteComponent,
})


function RouteComponent() {
  return <LoginDynamicForm />;
}
