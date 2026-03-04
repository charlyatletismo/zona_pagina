import { SportingEventTransactionForm } from "./sportingEventTransactionForm";


export const SpEvTransactionRegPaymentForm = ({
  eventId,
  regId,
  onSuccess,
}: {
  eventId: number,
  regId: number,
  onSuccess?: () => Promise<void>,
}) => {
  return (
    <SportingEventTransactionForm
      transaction={{
        event_id: eventId,
        registration_id: regId,
        category: 'registration_payment',
        transaction_type: 'inflow',
        status: 'completed',
      }}
      showFields={[
        "transaction_date",
        "category",
        "amount",
        "description",
        "payment_method",
      ]}
      categoriesOptions={[
        'registration_payment',
      ]}
      onSuccess={onSuccess}
    />
  )
}
