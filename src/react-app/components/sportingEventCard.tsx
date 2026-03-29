import z from "zod";
import { SportingEventBasicInfoSchema } from "@shared/apiRespTypes";
import {
  CalendarIcon,
  MapPinIcon,
} from 'lucide-react';


export const SportingEventCard = ({ event }: { event: z.infer<typeof SportingEventBasicInfoSchema> }) => {
  const promo_end = event.promotional_fee_end ? new Date(event.promotional_fee_end) : null;
  const now = new Date();
  const isPromotional = promo_end && now <= promo_end;

  return (
    <div className='rounded-lg shadow-md border border-muted transition-all duration-300 flex flex-col h-full group-hover:animate-tremor'>
      {event.photo_id && (
        <div className="aspect-video rounded-t-lg overflow-hidden border">
          <img
            src={`https://imagedelivery.net/x1piYdlDlmNQ_iTYafCcEQ/${event.photo_id}/public`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className='flex gap-4 items-start mb-4'>
          <div className="p-2.5 rounded-lg bg-primary/10 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-200">
            <CalendarIcon className='h-6 w-6' />
          </div>
          <div>
            <h3 className='text-xl font-bold leading-tight mb-1'>{event.title}</h3>
            <p className="text-sm font-medium text-primary">
              {event.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {event.description && (
          <p className='text-muted-foreground mb-6 grow line-clamp-3'>{event.description}</p>
        )}

        {(event.fee_amount !== null || event.fee_amount_promotional !== null) && (
          <div className="mb-6">
            {(event.fee_amount_promotional && isPromotional) ? (
              <div className="text-lg font-semibold text-primary">
                {event.fee_amount_promotional.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })}
                {event.fee_amount && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    {event.fee_amount.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-lg font-semibold text-primary">
                {event.fee_amount?.toLocaleString('es-ES', { style: 'currency', currency: 'ARS' })}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-muted mt-auto">
          {event.location && (
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">
                {event.location_address
                  ? event.location_address + ", "
                  : ""}{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
