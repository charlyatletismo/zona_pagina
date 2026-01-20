import z from "zod";

import { ALL_ROLES } from './roles';


const USER_ID_MIN_LENGTH = 7;
const USER_ID_MAX_LENGTH = 28;
const now = new Date();
const minAgeRequired = 13;
const maxDateOfBirth = new Date(
  now.getFullYear() - minAgeRequired,
  now.getMonth(),
  now.getDate()
);
export const CLOTHING_TYPES = ['tshirt', 'tanktop'] as const;
export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
// FIXME: No sé si hace falta // Update maxDateOfBirth every day
// setInterval(() => {
//   const now = new Date();
//   maxDateOfBirth.setFullYear(now.getFullYear() - minAgeRequired);
//   maxDateOfBirth.setMonth(now.getMonth());
//   maxDateOfBirth.setDate(now.getDate());
// }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds


export const TEMPORARY_LOCATION_ID = 'temporary_location';


export const LocationSchema = z.object({
  id: z.string()
    .min(1, 'El ID de la ubicación no puede estar vacío')
    .max(256, 'El ID de la ubicación no puede exceder los 256 caracteres'),
  locality: z.string()
    .min(1, 'La localidad no puede estar vacía')
    .max(64, 'La localidad no puede exceder los 64 caracteres. Contacte al administrador'),
  province: z.string()
    .min(1, 'La provincia no puede estar vacía')
    .max(64, 'La provincia no puede exceder los 64 caracteres. Contacte al administrador'),
  country: z.string()
    .min(1, 'El país no puede estar vacío')
    .max(64, 'El país no puede exceder los 64 caracteres. Contacte al administrador'),
  latitude: z.number("Debe ser un número")
    .min(-90, 'La latitud debe ser mayor o igual a -90')
    .max(90, 'La latitud debe ser menor o igual a 90')
    .nullable().optional(),
  longitude: z.number("Debe ser un número")
    .min(-180, 'La longitud debe ser mayor o igual a -180')
    .max(180, 'La longitud debe ser menor o igual a 180')
    .nullable().optional(),
});


export const UserSchema = z.object({
  id: z.string({error: 'Debes ingresar tu DNI'})
    .min(USER_ID_MIN_LENGTH, `El ID del usuario debe tener al menos ${USER_ID_MIN_LENGTH} caracteres`)
    .max(USER_ID_MAX_LENGTH, `El ID del usuario no puede exceder los ${USER_ID_MAX_LENGTH} caracteres`),
  name: z.string({error: 'Debes ingresar tu nombre'})
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  surname: z.string({error: 'Debes ingresar tu apellido'})
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string({error: 'Debes ingresar un número de celular válido'})
    .min(15, 'Debe tener al menos 15 dígitos')
    .max(16, 'No puede exceder los 16 dígitos'),
  email: z.email({error: 'Debes ingresar un correo electrónico válido'}),
  emergency_contact_name: z.string({error: 'Debes indicar el nombre completo del contacto de emergencia'})
    .min(1, 'Debes indicar el nombre completo del contacto de emergencia')
    .max(128, 'El nombre del contacto de emergencia no puede exceder los 128 caracteres'),
  emergency_contact_phone: z.string({error: 'Debes ingresar un número de celular válido'})
    .min(15, 'Debe tener al menos 15 dígitos')
    .max(16, 'No puede exceder los 16 dígitos'),
  sex: z.string({error: 'Debes indicar tu sexo'})
    .min(1, 'Debes indicar tu sexo')
    .max(1, 'El sexo debe contener solo 1 caracter'),
  date_of_birth: z.date({error: 'Debes indicar tu fecha de nacimiento'})
    .min(new Date(1900, 0, 1), 'Tu edad es muy avanzada')
    .max(maxDateOfBirth, `Debe tener al menos ${minAgeRequired} años`),
  clothing_shirt_size: z.enum(
    SHIRT_SIZES,
    {error: 'Debes indicar el tamaño de la camiseta'}),
  location: LocationSchema.shape.id
    .min(1, 'Debes ingresar una ubicación')
    .max(256, 'La ubicación no puede exceder los 256 caracteres'),
  location_temp: z.string()
    .max(256, 'La ubicación temporal no puede exceder los 256 caracteres')
    .nullable().optional(),
  location_address: z.string({error: 'Debes ingresar una dirección'})
    .min(1, 'Debes ingresar una dirección')
    .max(256, 'La dirección no puede exceder los 256 caracteres'),
  special_needs: z.string()
    .min(1, 'Si no posee necesidades especiales, por favor dejarlo vacío')
    .max(512, 'Las necesidades especiales no pueden exceder los 512 caracteres')
    .nullable().optional(),
  discount_percentage: z.number({error: "Debe ser un número"})
    .min(0, 'El porcentaje de descuento no puede ser negativo')
    .max(100, 'El porcentaje de descuento no puede exceder 100%')
    .prefault(0),
  manual_athlete_category: z.string()
    .max(64, 'La categoría manual no puede exceder los 64 caracteres')
    .nullable().optional(),
  manager_id: z.string()
    .max(USER_ID_MAX_LENGTH, 'El ID del manager no puede exceder los 28 caracteres')
    .nullable().optional(),
  training_team_id: z.number()
    .nullable().optional(),
  training_team_temp: z.string()
    .max(128, 'El nombre del equipo de entrenamiento temporal no puede exceder los 128 caracteres')
    .nullable().optional(),
  profile_image_url: z.string()
    .max(512, 'La URL de la imagen de perfil no puede exceder los 512 caracteres')
    .nullable().optional(),
  profile_image_preview_url: z.string()
    .max(512, 'La URL de la vista previa de la imagen de perfil no puede exceder los 512 caracteres')
    .nullable().optional(),
  language: z.string()
    .max(2, 'El código de idioma no puede exceder los 2 caracteres')
    .default('es').optional(),
  temp_code: z.string()
    .min(6, 'El código temporal debe tener 6 caracteres')
    .max(6, 'El código temporal debe tener 6 caracteres')
    .nullable().optional(),
  role: z.enum(ALL_ROLES, 'El rol del usuario no es válido').optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});


export const TrainingTeamSchema = z.object({
  id: z.number().optional(),
  name: z.string()
    .min(1, 'Debe ingresar un nombre')
    .max(128, 'El nombre no puede exceder los 128 caracteres'),
  location: z.string().max(256).nullable().optional(),
  coach_name: z.string().max(128).nullable().optional(),
  coach_user_id: z.string().max(USER_ID_MAX_LENGTH).nullable().optional(),
  contact_email: z.string().max(64).nullable().optional(),
  contact_phone: z.string().max(32).nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});


export const SportingEventCircuitSchema = z.object({
  id: z.number().optional(),
  event_id: z.number().optional(),
  name: z.string().min(1, 'Debe ingresar un nombre para el circuito'),
  description: z.string().nullable().optional(),
  distance_km: z.number()
    .min(0.01, 'Debe ingresar una distancia')
    .max(1000, 'La distancia no puede exceder los 1000 km'),
  map_url: z.string().max(512).nullable().optional(),
});


export const SportingEventScheduleSchema = z.object({
  id: z.number().optional(),
  event_id: z.number().optional(),
  date: z.date(),
  title: z.string().min(1, 'Debe ingresar un título para el hito'),
  description: z.string().nullable().optional(),
  location: LocationSchema.shape.id.nullable().optional(),
  location_address: z.string()
    .max(256, 'La dirección no puede exceder los 256 caracteres')
    .nullable().optional(),
  location_lat: LocationSchema.shape.latitude,
  location_long: LocationSchema.shape.longitude,
});


export const SportingEventAthleteCategorySchema = z.object({
  id: z.number().optional(),
  event_id: z.number().optional(),
  circuit_id: z.number(),
  name: z.string().min(1, 'Debe ingresar un nombre para la categoría'),
  sex: z.string().max(1).nullable().optional(),
  min_age: z.number()
    .min(1, 'Debe ingresar una edad mínima')
    .max(200, 'La edad no puede exceder los 200 años'),
  max_age: z.number()
    .min(1, 'Debe ingresar una edad máxima')
    .max(200, 'La edad no puede exceder los 200 años'),
  exclude_auto_qualify: z.boolean().default(false).optional(),
});


export const SportingEventClothingSchema = z.object({
  id: z.number().optional(),
  event_id: z.number().optional(),
  clothing_type: z.enum(CLOTHING_TYPES, 'Tipo de prenda no válida'),
  size: z.enum(SHIRT_SIZES, 'Talla no válida'),
  purchased_quantity: z.number().default(0).optional(),
  demanded_quantity: z.number().default(0).optional(),
  reserved_quantity: z.number().default(0).optional(),
})


export const SportingEventTypesEnum = z.enum([
  'marathon',
  'half_marathon',
  'duathlon',
  'triathlon',
  'trail',
  'cycling',
  'swimming',
  'other'
], {error: "Debe indicar uno"});


export const SportingEventSchema = z.object({
  id: z.number().min(1, "Debe indicar un ID de evento válido").optional(),
  title: z.string("Debe ingresar un título")
    .min(1, "Debe ingresar un título"),
  description: z.string().nullable().optional(),
  image_url: z.string().max(512).nullable().optional(),
  image_preview_url: z.string().max(512).nullable().optional(),
  date: z.date("Debe ingresar una fecha"),
  registration_start: z.date().nullable().optional(),
  registration_end: z.date().nullable().optional(),
  location: LocationSchema.shape.id.nullable().optional(),
  location_address: z.string()
    .max(256, 'La dirección no puede exceder los 256 caracteres')
    .nullable().optional(),
  location_lat: LocationSchema.shape.latitude,
  location_long: LocationSchema.shape.longitude,
  event_type: SportingEventTypesEnum,
  rules: z.string().max(2048).nullable().optional(),
  disclaimer_of_liability: z.string().max(4096).nullable().optional(),
  award_prizes: z.string().max(1024).nullable().optional(),
  fee_amount: z.number().nullable().optional(),
  fee_currency: z.string().max(3).nullable().optional(),
  created_by: UserSchema.shape.id.nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_by: UserSchema.shape.id.nullable().optional(),
  updated_at: z.date().nullable().optional(),
  circuits: z.array(SportingEventCircuitSchema).nullable().optional(),
  schedules: z.array(SportingEventScheduleSchema).nullable().optional(),
  categories: z.array(SportingEventAthleteCategorySchema).nullable().optional(),
  clothing: z.array(SportingEventClothingSchema).nullable().optional(),
  athletes_registered: z.number().nullable().optional(),
  athletes_confirmed: z.number().nullable().optional(),
  user_registration_status: z.object({
    registration_status: z.enum([
      'not_registered',
      'pending',
      'partially_paid',
      'paid',
      'cancelled',
    ]).nullable().optional(),
    category_name: z.string().nullable().optional(),
    circuit_id: z.number().nullable().optional(),
    pending_to_pay: z.number().nullable().optional(),
  }).nullable().optional(),
});


export const SportingEventDbSchema = SportingEventSchema.omit({
  circuits: true,
  schedules: true,
  categories: true,
  clothing: true,
  athletes_registered: true,
  athletes_confirmed: true,
  user_registration_status: true,
});


export const SportingEventRegistrationSchema = z.object({
  id: z.number(),
  event_id: SportingEventSchema.shape.id,
  user_id: UserSchema.shape.id,
  category_id: SportingEventAthleteCategorySchema.shape.id.nullable(),
  training_team_id: TrainingTeamSchema.shape.id.nullable(),
  registration_date: z.date(),
  discount_percentage: z.number(),
  discount_reason: z.string().max(256).nullable(),
  fee_amount_original: z.number(),
  fee_amount_after_discount: z.number(),
  paid_amount: z.number(),
  paid_percentage: z.number(),
  demanded_clothing_id: SportingEventClothingSchema.shape.id.nullable(),
  reserved_clothing_id: SportingEventClothingSchema.shape.id.nullable(),
  special_needs: z.string().max(512).nullable(),
  status: z.enum([
    "pending",
    "partially_paid",
    "paid",
    "cancelled"
  ]),
  full_payment_date: z.date().nullable(),
  created_at: z.date(),
  created_by: UserSchema.shape.id,
  updated_at: z.date(),
  updated_by: UserSchema.shape.id,
});


export const TRANSACTION_PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  // 'mercado_pago_payment',
  'other'
]


export const SportingEventTransactionSchema = z.object({
  id: z.number().optional(),
  event_id: SportingEventSchema.shape.id,
  transaction_type: z.enum([
    'inflow',
    'outflow',
  ], 'Debe seleccionar un tipo de transacción'),
  category: z.enum([
    'registration_payment',
    'registration_refund',
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
  ], 'Debe seleccionar una categoría'),
  amount: z.number().min(0.01, 'El monto debe ser mayor o igual a $0.01'),
  currency: z.string().max(3).default("ARS").optional(),
  description: z.string().max(512).nullable().optional(),
  transaction_date: z.date(),
  user_id: UserSchema.shape.id.nullable().optional(),
  registration_id: SportingEventRegistrationSchema.shape.id.nullable().optional(),
  vendor_supplier: z.string().max(256).nullable().optional(),
  receipt_url: z.string().max(512).nullable().optional(),
  payment_method: z.enum(
    TRANSACTION_PAYMENT_METHODS,
    "Debe seleccionar un método de pago")
    .optional(),
  status: z.enum([
    'pending',
    'completed',
    'failed',
    'cancelled'
  ], 'Debe indicar el estado de la transacción'),
  created_by: UserSchema.shape.id.optional(),
  created_at: z.date().optional(),
  updated_by: UserSchema.shape.id.optional(),
  updated_at: z.date().optional(),
  notes: z.string().max(1024).nullable().optional(),
});


export const TransactionTypeByCategory: Record<string, 'inflow' | 'outflow'> = {
  registration_payment: 'inflow',
  registration_refund: 'outflow',
  infrastructure: 'outflow',
  marketing: 'outflow',
  prizes: 'outflow',
  clothing: 'outflow',
  permits: 'outflow',
  equipment: 'outflow',
  sponsorship: 'inflow',
  partner_services: 'outflow',
  other_inflow: 'inflow',
  other_outflow: 'outflow',
};


export type SportingEventRegistration = {
  id: number;
  event_id: string;
  user_id: string;
  registration_date: string;
  paid: boolean;
  payment_date: string | null;
}

export interface SportingEventRegistrationApiResponse {
  [eventId: string]: {
    metadata: any;
    registrations: {
      registrationId: SportingEventRegistration["id"];
      userId: SportingEventRegistration["user_id"];
      userName: string;
      userEmail: string;
      userPhone: string;
      registrationDate: SportingEventRegistration["registration_date"];
      paid: SportingEventRegistration["paid"];
      paymentDate: SportingEventRegistration["payment_date"];
    }[];
  };
};
