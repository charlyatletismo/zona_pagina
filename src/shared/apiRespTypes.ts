import z from "zod"
import {
  UserSchema,
  SportingEventSchema,
  SportingEventScheduleSchema,
  SportingEventRegistrationSchema,
  SportingEventClothingSchema,
  TrainingTeamSchema,
  SportingEventTransactionSchema,
  SportingEventCircuitSchema,
  ChipSchema,
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
  profile_photo_id: true,
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
  created_at: z.coerce.date<string>().optional(),
  updated_at: z.coerce.date<string>().optional(),
})

export const ARUserMinSchema = UserSchema.pick({
  id: true,
  name: true,
  surname: true,
});


////////////////////////////////////////////////////////
//                     /api/chips                     //
////////////////////////////////////////////////////////


export const ARChipSchema = ChipSchema.extend({
  created_at: z.coerce.date<string>(),
  updated_at: z.coerce.date<string>(),
}).partial({
  created_at: true,
  updated_at: true,
})


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
  date: z.coerce.date<string>(),
  registration_start: z.coerce.date<string>().nullable().optional(),
  registration_end: z.coerce.date<string>().nullable().optional(),
  fee_payment_due_date: z.coerce.date<string>().nullable().optional(),
  promotional_fee_end: z.coerce.date<string>().nullable().optional(),
  promotional_fee_payment_due_date: z.coerce.date<string>().nullable().optional(),
  created_at: z.coerce.date<string>().nullable().optional(),
  updated_at: z.coerce.date<string>().nullable().optional(),
  circuits: z.array(SportingEventCircuitSchema.extend({
    competitive: z.coerce.boolean<number>().optional(),
  })).nullable().optional(),
  schedules: z.array(SportingEventScheduleSchema.extend({
    date: z.coerce.date<string>(),
    notify_at: z.coerce.date<string>().nullable().optional(),
  })).nullable().optional(),
});

export const ARSportingEventMinSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  date: true,
}).extend({
  date: z.coerce.date<string>(),
});

export const ARSportingEventGallerySchema = SportingEventSchema.pick({
  id: true,
  title: true,
  photo_id: true
}).extend({
  // TODO: Make a proper schema
  gallery_photos: z.array(z.object({
    id: z.string(), // Cloudflare Images ID
    order_n: z.number(), // Shown order in the gallery
    created_by: z.string(),
    created_at: z.coerce.date<string>(),
  })).nullable().optional(),
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
    registration_date: z.coerce.date<string>(),
    promotional_fee_applied: z.coerce.boolean<number>(),
    full_payment_date: z.coerce.date<string>().nullable(),
    kit_delivered: z.coerce.boolean<number>(),
    updated_at: z.coerce.date<string>(),
  }),
  demanded_clothing: SpClothingMinSchema.extend({
    remaining_quantity: z.number().min(0),
  }).omit({
    purchased_quantity: true,
  }).nullable(),
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
    current_fee_amount: z.number(),
    current_fee_is_promotional: z.boolean(),
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
  created_at: z.coerce.date<string>(),
  updated_at: z.coerce.date<string>(),
})

export const ARTrainingTeamIndexSchema = TrainingTeamSchema.pick({
  id: true,
  name: true,
  location: true,
});

export const ARTempTrainingTeamSchema = z.object({
  id: UserSchema.shape.id,
  temp: UserSchema.shape.training_team_temp,
}).required({
  temp: true,
})


///////////////////////////////////////////////////////////////
//                     /api/transactions                     //
///////////////////////////////////////////////////////////////

export const ARSportEvTransactionSchema = SportingEventTransactionSchema.extend({
  transaction_date: z.coerce.date<string>(),
  created_at: z.coerce.date<string>().optional(),
  updated_at: z.coerce.date<string>().optional(),
})

export const ARSportEvTransactionMinSchema = SportingEventTransactionSchema.pick({
  id: true,
  category: true,
  transaction_type: true,
  transaction_date: true,
  payment_method: true,
  amount: true,
}).extend({
  transaction_date: z.coerce.date<string>(),
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
