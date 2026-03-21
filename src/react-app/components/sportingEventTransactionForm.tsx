import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import {
  SportingEventTransactionSchema,
  TransactionTypeByCategory,
} from "@shared/types";
import {
  ARSportingEventMinSchema
} from "@shared/apiRespTypes";
import {
  TransactionCategoryDesc,
  TransactionTypeDesc,
  TransactionPaymentMethodDesc,
  // TransactionStatusDesc,
} from "@shared/lang";
import { useAppForm } from '@/lib/genForm';
import { useState } from "react";
import {
  AlertCircle,
  Save,
  ListRestartIcon,
  BanknoteArrowUpIcon,
  BanknoteArrowDownIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { postAuthenticated, getAuthenticatedThrow } from "@/lib/apiCalls";
import { getMessage, getLang } from "@/lib/utils";
import { FormErrorsCard } from "./formErrorsCard";


type Fields = keyof z.infer<typeof SportingEventTransactionSchema>;
type TransactionPartial = Partial<z.infer<typeof SportingEventTransactionSchema>>;
type CategoryValue = z.infer<typeof SportingEventTransactionSchema.shape.category>;
type TransactionTypeValue = z.infer<typeof SportingEventTransactionSchema.shape.transaction_type>;
type PaymentMethodValue = z.infer<typeof SportingEventTransactionSchema.shape.payment_method>;
// type StatusValue = z.infer<typeof SportingEventTransactionSchema.shape.status>;


export const SportingEventTransactionForm = ({
  transaction,
  showFields,
  categoriesOptions,
  onSuccess,
}: {
  transaction: TransactionPartial | null,
  showFields?: Fields[],
  categoriesOptions?: CategoryValue[],
  onSuccess?: () => Promise<void>,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const path = transaction?.id
    ? `/api/sportingEventTransactions/update/${transaction.id}`
    : "/api/sportingEventTransactions/create";

  categoriesOptions = categoriesOptions || SportingEventTransactionSchema.shape.category.options;
  const defaults: TransactionPartial = {
    event_id: 0,
    // transaction_type: '',
    // category: '',
    amount: 0,
    currency: 'ARS',
    description: null,
    transaction_date: new Date(),
    payment_method: "bank_transfer",
    status: "completed",
    ...(transaction || {})
  }

  const form = useAppForm({
    defaultValues: defaults,
    validators: {
      onBlur: SportingEventTransactionSchema,
      onSubmitAsync: async ({ value }) => {
        const res = await getAuthenticatedThrow<
          z.infer<typeof ARSportingEventMinSchema>
          >(`/api/sportingEvents/exists/${value.event_id}`, ARSportingEventMinSchema)
        if (res.status === 404) {
          return {
            errors: {
              event_id: `El ID de evento ${value.event_id} no existe.`,
            }
          }
        }
        return null;
      }
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(path, value, navigate)
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al guardar'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Guardado con éxito'));
      if (onSuccess) {
        await onSuccess();
      } else {
        setTimeout(async () => {
          navigate({ to: '..', reloadDocument: true });
        }, 1000);
      }
    },
  });

  return (
    <form
      className="p-6 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <div>
              {isSubmitting ? (
                <div className="flex gap-4 items-center space-x-2 mb-4 text-sm bg-gray-50 text-gray-600 p-3 rounded-md">
                  <Spinner /><div>Guardando...</div>
                </div>) : null
              }
            </div>
          )}
        />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {(!showFields || showFields.includes('event_id')) && (
          <form.AppField
            name="event_id"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>ID Evento</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  onChange={(e) => field.handleChange(
                    e.target.value
                      ? Number(e.target.value)
                      : 0)}
                  onBlur={field.handleBlur}
                  placeholder="ID del evento deportivo"
                  disabled={!!transaction}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('transaction_date')) && (
          <form.AppField
            name="transaction_date"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Fecha de Transacción</field.Label>
                <field.DateTimePicker
                  name={field.name}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={(d) => {
                    if (!d) return;
                    field.handleChange(d)
                  }}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('category')) && (
          <form.AppField
            name="category"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name} className="flex justify-between">
                  Categoría
                  {field.state.value
                    ? TransactionTypeByCategory[field.state.value] === 'inflow'
                      ? <div className="flex items-center border border-green-600 text-green-600 text-sm px-2 rounded-lg">
                        <BanknoteArrowUpIcon className="w-4 h-4 mr-1" />
                        Ingreso
                      </div>
                      : <div className="flex items-center border border-red-600 text-red-600 text-sm px-2 rounded-lg">
                        <BanknoteArrowDownIcon className="w-4 h-4 mr-1" />
                        Egreso
                      </div>
                    : null
                  }
                </field.Label>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e: CategoryValue) => {
                    field.handleChange(e);
                    field.handleBlur();
                    // Set transaction_type based on category
                    const transaction_type = TransactionTypeByCategory[e];
                    form.setFieldValue('transaction_type', transaction_type);
                  }}
                  onOpenChange={(o) => {
                    if (!o) {
                      field.handleBlur();
                    }
                  }}
                >
                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                    <field.SelectValue placeholder="..." />
                  </field.SelectTrigger>
                  <field.SelectContent>
                    <field.SelectGroup>
                      <field.SelectLabel>Categoría</field.SelectLabel>
                      {categoriesOptions.map((evtype) => (
                        <field.SelectItem key={evtype} value={evtype}>{TransactionCategoryDesc[evtype][getLang()]}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('transaction_type')) && (
          <form.AppField
            name="transaction_type"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Tipo</field.Label>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  disabled={true}
                  onValueChange={(e: TransactionTypeValue) => {
                    field.handleChange(e);
                    field.handleBlur();
                  }}
                  onOpenChange={(o) => {
                    if (!o) {
                      field.handleBlur();
                    }
                  }}
                >
                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                    <field.SelectValue placeholder="..." />
                  </field.SelectTrigger>
                  <field.SelectContent>
                    <field.SelectGroup>
                      <field.SelectLabel>Tipo</field.SelectLabel>
                      {SportingEventTransactionSchema.shape.transaction_type.options.map((evtype) => (
                        <field.SelectItem key={evtype} value={evtype}>{TransactionTypeDesc[evtype][getLang()]}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('amount')) && (
          <form.AppField
            name="amount"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Monto</field.Label>
                <div className='relative'>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => {
                      if ((
                        e.target.value &&
                        isNaN(parseFloat(e.target.value))
                      ) || parseFloat(e.target.value) < 0) {
                        return;
                      }
                      field.handleChange(e.target.value ? parseFloat(e.target.value) : 0);
                    }}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive pl-5' : 'pl-5'}
                  />
                  <div className='absolute left-2 top-1 text-gray-500'>
                    $
                  </div>
                </div>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('payment_method')) && (
          <form.AppField
            name="payment_method"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Método de Pago</field.Label>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e: PaymentMethodValue) => {
                    field.handleChange(e);
                    field.handleBlur();
                  }}
                  onOpenChange={(o) => {
                    if (!o) {
                      field.handleBlur();
                    }
                  }}
                >
                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                    <field.SelectValue placeholder="..." />
                  </field.SelectTrigger>
                  <field.SelectContent>
                    <field.SelectGroup>
                      <field.SelectLabel>Método de pago</field.SelectLabel>
                      {SportingEventTransactionSchema.shape.payment_method.options.map((pm) => (
                        <field.SelectItem key={pm} value={pm}>{TransactionPaymentMethodDesc[pm][getLang()]}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {/* {(!showFields || showFields.includes('status')) && (
          <form.AppField
            name="status"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Estado</field.Label>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e: StatusValue) => {
                    field.handleChange(e);
                    field.handleBlur();
                  }}
                  onOpenChange={(o) => {
                    if (!o) {
                      field.handleBlur();
                    }
                  }}
                >
                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                    <field.SelectValue placeholder="..." />
                  </field.SelectTrigger>
                  <field.SelectContent>
                    <field.SelectGroup>
                      <field.SelectLabel>Estado</field.SelectLabel>
                      {SportingEventTransactionSchema.shape.status.options.map((st) => (
                        <field.SelectItem key={st} value={st}>{TransactionStatusDesc[st][getLang()]}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )} */}

        {(!showFields || showFields.includes('vendor_supplier')) && (
          <form.AppField
            name="vendor_supplier"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Nombre del proveedor/sponsor</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('receipt_url')) && (
          <form.AppField
            name="receipt_url"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>URL del recibo</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {(!showFields || showFields.includes('description')) && (
          <form.AppField
            name="description"
            children={(field) => (
              <div className="space-y-2 col-span-1 md:col-span-2">
                <field.Label htmlFor={field.name}>Descripción</field.Label>
                <field.Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  placeholder="Descripción de la transacción"
                  rows={3}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        )}

        {localStorage.getItem('ADMIN_MODE') === 'active' && (
          <div className="col-span-1 md:col-span-2">
            <hr className="my-6" />
            <form.Subscribe
              selector={(state) => state.errors}
              children={(errors) => (
                <FormErrorsCard errors={errors} />
              )}
            />
          </div>
        )}

      </div>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        children={([canSubmit, isSubmitting, isPristine]) => (
          <form.AppForm>
            <form.Button
              type="submit"
              disabled={!canSubmit || isPristine || isSubmitting}
              className='mr-2 mt-5'
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </form.Button>
            <form.Button
              type="reset"
              variant="outline"
              disabled={isPristine || isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                form.reset();
              }}
            >
              <>
                <ListRestartIcon className="mr-2 h-4 w-4" />
                Reset
              </>
            </form.Button>
          </form.AppForm>
        )}
      />
    </form>
  );
}
