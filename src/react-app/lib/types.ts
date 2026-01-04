import z from "zod";

import { ALL_ROLES } from "./roles";
import { getLang } from "./utils";

const USER_ID_MAX_LENGTH = 28;


export const UserSchema = z.object({
  id: z.string().max(USER_ID_MAX_LENGTH),
  name: z.string().nullable(),
  surname: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  sex: z.string().max(1).nullable(),
  date_of_birth: z.date().nullable(),
  clothing_shirt_size: z.string().max(8).nullable(),
  location: z.string().max(256).nullable(),
  location_temp: z.string().max(256).nullable(),
  location_address: z.string().max(256).nullable(),
  special_needs: z.string().max(512).nullable(),
  discount_percentage: z.number().nullable().default(0),
  manual_athlete_category: z.string().max(64).nullable(),
  manager_id: z.string().max(USER_ID_MAX_LENGTH).nullable(),
  training_team_id: z.number().nullable(),
  training_team_temp: z.string().max(128).nullable(),
  profile_image_url: z.string().max(512).nullable(),
  profile_image_preview_url: z.string().max(512).nullable(),
  language: z.string().max(2).nullable(),
  temp_code: z.string().nullable(),
  role: z.enum(ALL_ROLES).nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
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

const RegistrationStatusDescriptions: {[key: string]: {[key: string]: string}} = {
  not_registered: {
    es: "No inscripto",
    en: "Not registered",
  },
  pending: {
    es: "Pendiente de pago",
    en: "Pending payment",
  },
  partially_paid: {
    es: "Parcialmente pagado",
    en: "Partially paid",
  },
  paid: {
    es: "Pagado",
    en: "Paid",
  },
  cancelled: {
    es: "Cancelado",
    en: "Cancelled",
  },
};

export const getRegistrationStatusDescription = (status: string | null) => {
  if (!status) return "Desconocido";
  return RegistrationStatusDescriptions[status][getLang()]
    || "Desconocido";
}


export const AthleteCategoryTemplateSchema = z.object({
  id: z.number().nullable(),
  base_name: z.string(),
  male_name: z.string().nullable(),
  female_name: z.string().nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  exclude_auto_qualify: z.coerce.boolean().nullable(),
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
  date: z.coerce.date(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().max(256).nullable(),
  location_address: z.string().max(128).nullable(),
  location_lat: z.number().nullable(),
  location_long: z.number().nullable(),
});


export const SportingEventAthleteCategorySchema = z.object({
  id: z.number().nullable(),
  event_id: z.number().nullable(),
  circuit_id: z.number().nullable(),
  name: z.string(),
  sex: z.string().max(1).nullable(),
  min_age: z.number().nullable(),
  max_age: z.number().nullable(),
  exclude_auto_qualify: z.coerce.boolean().nullable(),
});


export const SportingEventTypesEnumDescriptions: {[key: string]: {[key: string]: string}} = {
  marathon: {
    es: "Maratón",
    en: "Marathon",
  },
  half_marathon: {
    es: "Media Maratón",
    en: "Half Marathon",
  },
  duathlon: {
    es: "Duatlón",
    en: "Duathlon",
  },
  triathlon: {
    es: "Triatlón",
    en: "Triathlon",
  },
  trail: {
    es: "Trail",
    en: "Trail",
  },
  cycling: {
    es: "Ciclismo",
    en: "Cycling",
  },
  swimming: {
    es: "Natación",
    en: "Swimming",
  },
  other: {
    es: "Otro",
    en: "Other",
  },
};


export const SportingEventTypesEnum = z.enum([
  'marathon',
  'half_marathon',
  'duathlon',
  'triathlon',
  'trail',
  'cycling',
  'swimming',
  'other'
]);


export const SportingEventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().max(512).nullable(),
  image_preview_url: z.string().max(512).nullable(),
  date: z.coerce.date(),
  registration_start: z.coerce.date().nullable(),
  registration_end: z.coerce.date().nullable(),
  location: z.string().max(256).nullable(),
  location_address: z.string().max(256).nullable(),
  location_lat: z.number().nullable(),
  location_long: z.number().nullable(),
  event_type: SportingEventTypesEnum,
  rules: z.string().max(2048).nullable(),
  disclaimer_of_liability: z.string().max(4096).nullable(),
  award_prizes: z.string().max(1024).nullable(),
  fee_amount: z.number().nullable(),
  fee_currency: z.string().max(3).nullable(),
  created_by: z.string().max(USER_ID_MAX_LENGTH).nullable(),
  created_at: z.coerce.date().nullable(),
  updated_by: z.string().max(USER_ID_MAX_LENGTH).nullable(),
  updated_at: z.coerce.date().nullable(),
  circuits: z.array(SportingEventCircuitSchema).nullable(),
  schedules: z.array(SportingEventScheduleSchema).nullable(),
  categories: z.array(SportingEventAthleteCategorySchema).nullable(),
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
  }).nullable(),
});


export const SportingEventBasicInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.date(),
  registration_start: z.date().nullable(),
  registration_end: z.date().nullable(),
  location: z.string().max(256).nullable(),
  location_address: z.string().max(256).nullable(),
});


export const SportingEventApiResponseSchema = z.object({
  open: z.array(SportingEventBasicInfoSchema),
  comingSoon: z.array(SportingEventBasicInfoSchema),
  closed: z.array(SportingEventBasicInfoSchema),
  past: z.array(SportingEventBasicInfoSchema),
});


export type UserType = z.infer<typeof UserSchema>;

export type SportingEventType = z.infer<typeof SportingEventSchema>;
export type SportingEventBasicInfoType = z.infer<typeof SportingEventBasicInfoSchema>;
export type SportingEventAthleteCategoryType = z.infer<typeof SportingEventAthleteCategorySchema>;
export type SportingEventScheduleType = z.infer<typeof SportingEventScheduleSchema>;
export type SportingEventCircuitType = z.infer<typeof SportingEventCircuitSchema>;

export type AthleteCategoryTemplateType = z.infer<typeof AthleteCategoryTemplateSchema>;

export type SportingEventApiResponseType = z.infer<typeof SportingEventApiResponseSchema>;


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
