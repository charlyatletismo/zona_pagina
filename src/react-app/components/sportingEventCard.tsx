import z from "zod";
import { SportingEventBasicInfoSchema } from "@shared/apiRespTypes";
import {
  CalendarIcon,
  MapPinIcon,
} from 'lucide-react';


export const SportingEventCard = ({ event }: { event: z.infer<typeof SportingEventBasicInfoSchema> }) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 flex flex-col h-full group-hover:animate-tremor'>
      <div className='flex gap-4 items-start mb-4'>
        <div className="p-2.5 rounded-lg bg-primary/10 text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
          <CalendarIcon className='h-6 w-6' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-900 leading-tight mb-1'>{event.title}</h3>
          <p className="text-sm font-medium text-primary">
            {event.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <p className='text-gray-600 mb-6 grow line-clamp-3'>{event.description}</p>

      <div className="pt-4 border-t border-gray-100 mt-auto">
        {event.location && (
          <div className="flex items-center text-gray-500 text-sm">
            <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">
              {event.location_address
                ? event.location_address + " "
                : ""}{event.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}
