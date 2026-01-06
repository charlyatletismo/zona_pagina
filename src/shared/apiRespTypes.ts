import z from "zod"
import {
  SportingEventBasicInfoSchema,
  SportingEventRegistrationSchema,
  SportingEventClothingSchema,
  SportingEventAthleteCategorySchema,
  TrainingTeamSchema,
} from './types'



/////////////////////////////////////////////////////////////////
//                     /api/sportingEvents                     //
/////////////////////////////////////////////////////////////////


export const SportingEventApiResponseSchema = z.object({
  open: z.array(SportingEventBasicInfoSchema),
  comingSoon: z.array(SportingEventBasicInfoSchema),
  closed: z.array(SportingEventBasicInfoSchema),
  past: z.array(SportingEventBasicInfoSchema),
});


//////////////////////////////////////////////////////////////////////////////////
//                     /api/sportingEvents/:id/registration                     //
//////////////////////////////////////////////////////////////////////////////////


const shortClothingSchema = SportingEventClothingSchema.pick({
  id: true,
  clothing_type: true,
  size: true,
  purchased_quantity: true,
  demanded_quantity: true,
  reserved_quantity: true,
})


export const SportingEventRegistrationApiResponseSchema = z.object({
  registration: SportingEventRegistrationSchema.pick({
    id: true,
    registration_date: true,
    discount_percentage: true,
    discount_reason: true,
    fee_amount_original: true,
    fee_amount_after_discount: true,
    paid_amount: true,
    demanded_clothing_id: true,
    reserved_clothing_id: true,
    special_needs: true,
    status: true,
    full_payment_date: true,
    updated_at: true,
    demanded_clothing: true,
    reserved_clothing: true,
  }).extend({
    demanded_clothing: shortClothingSchema.nullable(),
    reserved_clothing: shortClothingSchema.nullable(),
    updated_at: SportingEventRegistrationSchema.shape.updated_at.nullable(),
  }),
  category: SportingEventAthleteCategorySchema.pick({
    name: true,
    circuit_id: true,
  }).nullable(),
  training_team: TrainingTeamSchema.pick({
    name: true,
    location: true,
  }).nullable(),
  clothing: z.array(shortClothingSchema).nullable(),
})
