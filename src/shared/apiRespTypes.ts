import z from "zod"
import {
  UserSchema,
  SportingEventSchema,
  SportingEventScheduleSchema,
  SportingEventRegistrationSchema,
  SportingEventClothingSchema,
  TrainingTeamSchema,
  SportingEventTransactionSchema,
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
}).extend({
  name: UserSchema.shape.name.nullable(),
  surname: UserSchema.shape.surname.nullable(),
  phone: UserSchema.shape.phone.nullable(),
  email: UserSchema.shape.email.nullable(),
  emergency_contact_name: UserSchema.shape.emergency_contact_name.nullable(),
  emergency_contact_phone: UserSchema.shape.emergency_contact_phone.nullable(),
  sex: UserSchema.shape.sex.nullable(),
  date_of_birth: UserSchema.shape.date_of_birth.nullable(),
  clothing_shirt_size: UserSchema.shape.clothing_shirt_size.nullable(),
  location: UserSchema.shape.location.nullable(),
  location_address: UserSchema.shape.location_address.nullable(),
});

export const ARSettingsSchema = SettingsSchema.extend({
  date_of_birth: z.coerce.date().nullable()
});


////////////////////////////////////////////////////////
//                     /api/users                     //
////////////////////////////////////////////////////////


export const ARUserSchema = UserSchema.extend({
  name: UserSchema.shape.name.nullable(),
  surname: UserSchema.shape.surname.nullable(),
  phone: UserSchema.shape.phone.nullable(),
  email: UserSchema.shape.email.nullable(),
  emergency_contact_name: UserSchema.shape.emergency_contact_name.nullable(),
  emergency_contact_phone: UserSchema.shape.emergency_contact_phone.nullable(),
  sex: UserSchema.shape.sex.nullable(),
  date_of_birth: z.coerce.date().nullable(),
  clothing_shirt_size: UserSchema.shape.clothing_shirt_size.nullable(),
  location: UserSchema.shape.location.nullable(),
  location_address: UserSchema.shape.location_address.nullable(),
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
  fee_amount: true,
  fee_currency: true,
  fee_amount_promotional: true,
  promotional_fee_end: true,
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
  promotional_fee_end: z.coerce.date<string>().nullable().optional(),
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
  fee_payment_due_date: z.coerce.date().nullable().optional(),
  promotional_fee_end: z.coerce.date().nullable().optional(),
  promotional_fee_payment_due_date: z.coerce.date().nullable().optional(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
  schedules: z.array(SportingEventScheduleSchema.extend({
    date: z.coerce.date(),
    notify_at: z.coerce.date().nullable(),
  })).nullable().optional(),
});

export const ARSportingEventMinSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  date: true,
}).extend({
  date: z.coerce.date(),
});


//////////////////////////////////////////////////////////////////////////////////
//                     /api/sportingEvents/:id/registration                     //
//////////////////////////////////////////////////////////////////////////////////


export const SpClothingMinSchema = SportingEventClothingSchema.omit({
  event_id: true,
})


export const ARSportingEventRegistrationSchema = z.object({
  registration: SportingEventRegistrationSchema.omit({
    created_by: true,
    created_at: true,
    updated_by: true,
  }).extend({
    updated_at: SportingEventRegistrationSchema.shape.updated_at.nullable(),
  }),
  demanded_clothing: SpClothingMinSchema.nullable(),
  reserved_clothing: SpClothingMinSchema.nullable(),
  // circuit: SportingEventCircuitSchema.pick({
  //   id: true,
  //   name: true,
  //   distance_km: true,
  //   map_url: true,
  // }),
  // sp_event: SportingEventSchema.pick({
  //   id: true,
  //   title: true,
  //   age_ranges: true,
  // }),
  payment: z.object({
    fee_amount: SportingEventSchema.shape.fee_amount,
    fee_currency: SportingEventSchema.shape.fee_currency,
    fee_payment_due_date: SportingEventSchema.shape.fee_payment_due_date,
    fee_amount_promotional: SportingEventSchema.shape.fee_amount_promotional,
    promotional_fee_payment_due_date: SportingEventSchema.shape.promotional_fee_payment_due_date,
    paid_amount: z.number(),
    discount_amount: z.number(),
    pending_to_pay: z.number(),
  }),
  category: z.string().nullable(),
})


export const ARManagedSportingEventRegistrationSchema = ARSportingEventRegistrationSchema.extend({
  user: ARUserMinSchema,
})


////////////////////////////////////////////////////////////////
//                     /api/trainingTeams                     //
////////////////////////////////////////////////////////////////


export const ARTrainingTeamSchema = TrainingTeamSchema.omit({
  created_at: true,
  updated_at: true,
});

export const ARTrainingTeamAllSchema = TrainingTeamSchema.extend({
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const ARTrainingTeamIndexSchema = TrainingTeamSchema.pick({
  id: true,
  name: true,
  location: true,
});


///////////////////////////////////////////////////////////////
//                     /api/transactions                     //
///////////////////////////////////////////////////////////////

export const ARSportEvTransactionSchema = SportingEventTransactionSchema.extend({
  transaction_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export const ARSportEvTransactionMinSchema = SportingEventTransactionSchema.pick({
  id: true,
  category: true,
  transaction_type: true,
  transaction_date: true,
  payment_method: true,
  amount: true,
}).extend({
  transaction_date: z.coerce.date(),
});


////////////////////////////////////////////////////////////
//                     /api/locations                     //
////////////////////////////////////////////////////////////

export const ARTempLocationSchema = z.object({
  id: UserSchema.shape.id,
  temp: UserSchema.shape.location_temp,
}).required({
  temp: true,
})
