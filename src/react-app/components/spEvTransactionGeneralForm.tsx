import { SportingEventTransactionForm } from "./sportingEventTransactionForm";


export const SpEvTransactionGeneralForm = ({
  eventId,
  onSuccess,
}: {
  eventId: number,
  onSuccess?: () => void,
}) => {
  return (
    <SportingEventTransactionForm
      transaction={{
        event_id: eventId,
      }}
      showFields={[
        "amount",
        "category",
        "transaction_date",
        "description",
        "user_id",
        "vendor_supplier",
        "receipt_url",
        "payment_method",
        "status",
        "notes",
      ]}
      categoriesOptions={[
        'infrastructure',
        'marketing',
        'prizes',
        'clothing',
        'permits',
        'equipment',
        'sponsorship',
        'partner_services',
        'other_inflow',
        'other_outflow'
      ]}
      onSuccess={onSuccess}
    />
  )
}