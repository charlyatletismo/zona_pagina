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
    .nullable(),
  longitude: z.number("Debe ser un número")
    .min(-180, 'La longitud debe ser mayor o igual a -180')
    .max(180, 'La longitud debe ser menor o igual a 180')
    .nullable(),
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
  emergency_contact_name: z.string({error: 'Debes indicar el nombre completo del contacto de emergencia'}),
  emergency_contact_phone: z.string({error: 'Debes indicar el celular del contacto de emergencia'}),
  sex: z.string({error: 'Debes indicar tu sexo'})
    .max(1, 'El sexo debe contener solo 1 caracter'),
  date_of_birth: z.coerce.date({error: 'Debes indicar tu fecha de nacimiento'})
    .max(maxDateOfBirth, `Debe tener al menos ${minAgeRequired} años`),
  clothing_shirt_size: z.enum(
    SHIRT_SIZES,
    {error: 'Debes indicar el tamaño de la camiseta'}),
  location: LocationSchema.shape.id
    .min(1, 'Debes ingresar una ubicación')
    .max(256, 'La ubicación no puede exceder los 256 caracteres'),
  location_temp: z.string()
    .max(256, 'La ubicación temporal no puede exceder los 256 caracteres')
    .nullable(),
  location_address: z.string()
    .max(256, 'La dirección no puede exceder los 256 caracteres'),
  special_needs: z.string()
    .max(512, 'Las necesidades especiales no pueden exceder los 512 caracteres')
    .nullable(),
  discount_percentage: z.number("Debe ser un número")
    .max(100, 'El porcentaje de descuento no puede exceder 100%')
    .default(0),
  manual_athlete_category: z.string()
    .max(64, 'La categoría manual no puede exceder los 64 caracteres')
    .nullable(),
  manager_id: z.string()
    .max(USER_ID_MAX_LENGTH, 'El ID del manager no puede exceder los 28 caracteres')
    .nullable(),
  training_team_id: z.number().nullable(),
  training_team_temp: z.string()
    .max(128, 'El nombre del equipo de entrenamiento temporal no puede exceder los 128 caracteres')
    .nullable(),
  profile_image_url: z.string()
    .max(512, 'La URL de la imagen de perfil no puede exceder los 512 caracteres')
    .nullable(),
  profile_image_preview_url: z.string()
    .max(512, 'La URL de la vista previa de la imagen de perfil no puede exceder los 512 caracteres')
    .nullable(),
  language: z.string()
    .max(2, 'El código de idioma no puede exceder los 2 caracteres')
    .default('es'),
  temp_code: z.string()
    .max(6, 'El código temporal no puede exceder los 6 caracteres')
    .nullable(),
  role: z.enum(ALL_ROLES, 'El rol del usuario no es válido'),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});


export const TrainingTeamSchema = z.object({
  id: z.number(),
  name: z.string().max(128),
  location: z.string().max(256).nullable(),
  coach_name: z.string().max(128).nullable(),
  coach_user_id: z.string().max(USER_ID_MAX_LENGTH).nullable(),
  contact_email: z.string().max(64).nullable(),
  contact_phone: z.string().max(32).nullable(),
  created_at: z.iso.datetime().nullable(),
  updated_at: z.iso.datetime().nullable(),
});


export const AthleteCategoryTemplateSchema = z.object({
  id: z.number().nullable(),
  base_name: z.string(),
  male_name: z.string().nullable(),
  female_name: z.string().nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  exclude_auto_qualify: z.boolean().nullable(),
});


export const SportingEventCircuitSchema = z.object({
  id: z.number().nullable(),
  event_id: z.number().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  distance_km: z.number(),
  map_url: z.string().max(512).nullable(),
});


export const SportingEventScheduleSchema = z.object({
  id: z.number().nullable(),
  event_id: z.number().nullable(),
  date: z.date(),
  title: z.string().min(1, 'Debe ingresar un título para el hito'),
  description: z.string().nullable(),
  location: LocationSchema.shape.id.nullable(),
  location_address: z.string().max(128).nullable(),
  location_lat: LocationSchema.shape.latitude.nullable(),
  location_long: LocationSchema.shape.longitude.nullable(),
});


export const SportingEventAthleteCategorySchema = z.object({
  id: z.number().nullable(),
  event_id: z.number().nullable(),
  circuit_id: z.number().nullable(),
  name: z.string(),
  sex: z.string().max(1).nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  exclude_auto_qualify: z.boolean().nullable(),
});


export const SportingEventClothingSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  clothing_type: z.enum(CLOTHING_TYPES, 'Tipo de prenda no válida'),
  size: z.enum(SHIRT_SIZES, 'Talla no válida'),
  purchased_quantity: z.number().default(0),
  demanded_quantity: z.number().default(0),
  reserved_quantity: z.number().default(0),
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
  id: z.number(),
  title: z.string("Debe ingresar un título")
    .min(1, "Debe ingresar un título"),
  description: z.string().nullable(),
  image_url: z.string().max(512).nullable(),
  image_preview_url: z.string().max(512).nullable(),
  date: z.date("Debe ingresar una fecha"),
  registration_start: z.date().nullable(),
  registration_end: z.date().nullable(),
  location: LocationSchema.shape.id.nullable(),
  location_address: z.string().max(256).nullable(),
  location_lat: LocationSchema.shape.latitude.nullable(),
  location_long: LocationSchema.shape.longitude.nullable(),
  event_type: SportingEventTypesEnum,
  rules: z.string().max(2048).nullable(),
  disclaimer_of_liability: z.string().max(4096).nullable(),
  award_prizes: z.string().max(1024).nullable(),
  fee_amount: z.number().nullable(),
  fee_currency: z.string().max(3).nullable(),
  created_by: UserSchema.shape.id.nullable(),
  created_at: z.date().nullable(),
  updated_by: UserSchema.shape.id.nullable(),
  updated_at: z.date().nullable(),
  circuits: z.array(SportingEventCircuitSchema).nullable(),
  schedules: z.array(SportingEventScheduleSchema).nullable(),
  categories: z.array(SportingEventAthleteCategorySchema).nullable(),
  clothing: z.array(SportingEventClothingSchema.partial()).nullable(),
  athletes_registered: z.number().nullable(),
  athletes_confirmed: z.number().nullable(),
  user_registration_status: z.object({
    registration_status: z.enum([
      'not_registered',
      'pending',
      'partially_paid',
      'paid',
      'cancelled',
    ]).nullable(),
    category_name: z.string().nullable(),
    circuit_id: z.number().nullable(),
    pending_to_pay: z.number().nullable(),
  }).nullable(),
});


export const SportingEventBasicInfoSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  description: true,
  date: true,
  registration_start: true,
  registration_end: true,
  location: true,
  location_address: true,
})


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


export interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  sex: string;
  date_of_birth: string;
  country: string;
  city: string;
  full_location: string;
  manager_id: string;
  training_team: string;
  temp_code: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: User["id"];
  name: User["name"];
  surname: User["surname"];
  phone: User["phone"];
  email: User["email"];
  sex: User["sex"];
  date_of_birth: User["date_of_birth"];
  country: User["country"];
  city: User["city"];
  full_location: User["full_location"];
  manager_id: User["manager_id"];
  training_team: User["training_team"];
}


export type SportingEventTypeEnum =
  'marathon'
  | 'half_marathon'
  | 'triathlon'
  | 'duathlon'
  | 'trail'
  | 'cycling'
  | 'swimming'
  | 'other';


export type SportingEvent = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  image_preview_url: string | null;
  date: string;
  registration_start: string | null;
  registration_end: string | null;
  location_hint: string | null;
  location_text: string | null;
  location_lat: number | null;
  location_long: number | null;
  circuit_map_url: string | null;
  event_type: SportingEventTypeEnum;
  rules: string | null;
  disclaimer_of_liability_title: string | null;
  disclaimer_of_liability_content: string | null;
  award_prizes: string | null;
  created_by: User["id"];
  created_at: string;
  updated_by: User["id"];
  updated_at: string;
  user_registered_to_circuit?: number;
  circuits?: SportingEventCircuit[] | null;
  schedules?: SportingEventSchedule[] | null;
}

export interface SportingEventCircuit {
  id?: number;
  event_id?: SportingEvent["id"];
  name: string;
  description?: string;
  distance_km: number;
  map_url?: string;
}

export interface SportingEventSchedule {
  id?: number;
  event_id: SportingEvent["id"];
  date: string;
  title: string;
  description?: string;
  location_hint?: string;
  location_text?: string;
  location_lat?: number;
  location_long?: number;
}

export interface SportingEventBasicInfo {
  id: SportingEvent["id"];
  title: SportingEvent["title"];
  description?: SportingEvent["description"];
  date: SportingEvent["date"];
  registration_start?: SportingEvent["registration_start"];
  registration_end?: SportingEvent["registration_end"];
  location_hint?: SportingEvent["location_hint"];
  location_text?: SportingEvent["location_text"];
}

export type SportingEventApiResponse = {
  open: SportingEventBasicInfo[];
  comingSoon: SportingEventBasicInfo[];
  closed: SportingEventBasicInfo[];
  past: SportingEventBasicInfo[];
}

export type SportingEventRegistration = {
  id: number;
  event_id: SportingEvent["id"];
  user_id: User["id"];
  registration_date: string;
  paid: boolean;
  payment_date: string | null;
}

export interface SportingEventRegistrationApiResponse {
  [eventId: SportingEvent["id"]]: {
    metadata: SportingEventBasicInfo;
    registrations: {
      registrationId: SportingEventRegistration["id"];
      userId: SportingEventRegistration["user_id"];
      userName: User["name"];
      userEmail: User["email"];
      userPhone: User["phone"];
      registrationDate: SportingEventRegistration["registration_date"];
      paid: SportingEventRegistration["paid"];
      paymentDate: SportingEventRegistration["payment_date"];
    }[];
  };
};

export interface FeeCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface AthleteCategory {
  id: number;
  name: string;
  description?: string | null;
  fee_category_id: FeeCategory["id"];
  fee_category_name: FeeCategory["name"];
  sex?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  condition?: string | null;
}
