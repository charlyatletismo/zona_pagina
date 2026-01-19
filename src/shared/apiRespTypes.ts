import z from "zod"
import {
  UserSchema,
  SportingEventSchema,
  SportingEventScheduleSchema,
  SportingEventRegistrationSchema,
  SportingEventClothingSchema,
  SportingEventAthleteCategorySchema,
  TrainingTeamSchema,
} from './types';


// Edge schemas
// =================
// Prefix AR: API Response


///////////////////////////////////////////////////////////
//                     /api/settings                     //
///////////////////////////////////////////////////////////


export const SettingsSchema = UserSchema.pick({
  id: true,
  name: true,
  surname: true,
  phone: true,
  email: true,
  emergency_contact_name: true,
  emergency_contact_phone: true,
  sex: true,
  date_of_birth: true,
  clothing_shirt_size: true,
  location: true,
  location_temp: true,
  location_address: true,
  special_needs: true,
  discount_percentage: true,
  manager_id: true,
  training_team_id: true,
  training_team_temp: true,
  profile_image_url: true,
  language: true,
});

export const ARSettingsSchema = SettingsSchema.extend({
  date_of_birth: z.coerce.date()
});


////////////////////////////////////////////////////////
//                     /api/users                     //
////////////////////////////////////////////////////////


export const ARUserSchema = UserSchema.extend({
  date_of_birth: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export const ARUserMinSchema = UserSchema.pick({
  id: true,
  name: true,
  surname: true,
});


/////////////////////////////////////////////////////////////////
//                     /api/sportingEvents                     //
/////////////////////////////////////////////////////////////////


export const SportingEventBasicInfoSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  description: true,
  date: true,
  registration_start: true,
  registration_end: true,
  location: true,
  location_address: true,
}).required({
  id: true,
}).extend({
  date: z.coerce.date<string>(),
  registration_start: z.coerce.date<string>().nullable().optional(),
  registration_end: z.coerce.date<string>().nullable().optional(),
})

export const ARAllSportingEventSchema = z.object({
  open: z.array(SportingEventBasicInfoSchema),
  comingSoon: z.array(SportingEventBasicInfoSchema),
  closed: z.array(SportingEventBasicInfoSchema),
  past: z.array(SportingEventBasicInfoSchema),
});

export const ARSportingEventSchema = SportingEventSchema.extend({
  date: z.coerce.date(),
  registration_start: z.coerce.date().nullable().optional(),
  registration_end: z.coerce.date().nullable().optional(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
  schedules: z.array(SportingEventScheduleSchema.extend({
    date: z.coerce.date(),
  })).nullable().optional(),
  categories: z.array(SportingEventAthleteCategorySchema.extend({
    exclude_auto_qualify: z.coerce.boolean().default(false).optional(),
  })).nullable().optional(),
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



////////////////////////////////////////////////////////////////
//                     /api/trainingTeams                     //
////////////////////////////////////////////////////////////////


export const ARTrainingTeamSchema = TrainingTeamSchema.omit({
  created_at: true,
  updated_at: true,
});

export const TrainingTeamsApiResponseSchemaElement = TrainingTeamSchema.pick({
  id: true,
  name: true,
  location: true,
});

export const TrainingTeamsApiResponseSchema = z.array(
  TrainingTeamsApiResponseSchemaElement
);
