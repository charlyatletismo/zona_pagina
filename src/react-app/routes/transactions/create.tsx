import { createFileRoute } from '@tanstack/react-router';
import { FormBox } from '@/components/formBox';
import { SportingEventTransactionForm } from '@/components/sportingEventTransactionForm';

export const Route = createFileRoute('/transactions/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <FormBox
      title="Crear Transacción"
      description="Crear una nueva transacción."
      returnText="Volver a transacciones"
      returnPath='..'
    >
      <SportingEventTransactionForm
        transaction={null}
      />
    </FormBox>
  )
}
