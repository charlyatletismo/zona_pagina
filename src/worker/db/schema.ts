import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';


export const locations = sqliteTable("locations", {
  id: text({ length: 256 }).primaryKey(), // Locality, Province, Country concatenated
  locality: text({ length: 64 }).notNull(),
  province: text({ length: 64 }).notNull(),
  country: text({ length: 64 }).notNull(),
  latitude: real(),
  longitude: real(),
});


export const trainingTeams = sqliteTable("training_teams", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 128 }).notNull(),
  location: text({ length: 256 }).references(() => locations.id),
  coach_name: text({ length: 128 }),
  coach_user_id: text({ length: 28 }).references((): any => users.id),
  contact_email: text({ length: 64 }),
  contact_phone: text({ length: 32 }),
  created_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// Users Table
export const users = sqliteTable("users", {
  id: text({ length: 28 }).primaryKey(),
  name: text(),
  surname: text(),
  phone: text().unique(),
  email: text().unique(),
  emergency_contact_name: text(),
  emergency_contact_phone: text(),
  sex: text({ length: 1 }),
  date_of_birth: text(),
  clothing_tshirt_size: text({ length: 8 }), // e.g., "XS", "S", "M", "L", "XL", "XXL"
  address: text({ length: 256 }).notNull(),
  location: text({ length: 256 }).references(() => locations.id),
  location_temp: text({ length: 256 }), // temporary location text when not registered in the system
  special_needs: text({ length: 512 }), // allergies, accessibility, etc.
  discount_percentage: int().notNull().default(0), // for special discounts
  manager_id: text({ length: 28 }).references((): any => users.id),
  training_team_id: int().references(() => trainingTeams.id),
  training_team_temp: text({ length: 128 }), // temporary training team name when not registered in the system
  profile_image_url: text({ length: 512 }),
  profile_image_preview_url: text({ length: 512 }),
  temp_code: text({ length: 6 }),
  role: text(), // admin, organizer, athletes_manager, athlete
  created_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// User Updates Log
// (to track changes in user profiles and restore if needed
// for example in account hijacking cases)
// Logs are cleaned up after 30 days but maintained the 3 last logs
// of each field per user indefinitely
// This is done only for sensitive fields: email, phone, address, emergency contacts
export const userUpdates = sqliteTable("user_updates", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text({ length: 28 }).notNull().references(() => users.id),
  field_name: text({ length: 64 }).notNull(),
  old_value: text(),
  new_value: text(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// Event Types (e.g., Marathon, Half-Marathon, 10K, Trail, etc.)
export const sportingEventTypes = sqliteTable("sporting_event_types", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 64 }).notNull(),
});


export const disclaimersOfLiability = sqliteTable("disclaimers_of_liability", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text({ length: 64 }).notNull(),
  content: text({ length: 2048 }).notNull(),
});


// Main Events Table
export const sportingEvents = sqliteTable("sporting_events", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  image_url: text({ length: 512 }),
  image_preview_url: text({ length: 512 }),
  date: text().notNull(), // ISO string
  registration_start: text({ length: 64 }),
  registration_end: text({ length: 64 }),
  location: text({ length: 256 }).references(() => locations.id),
  location_address: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
  event_type: int().notNull().references(() => sportingEventTypes.id),
  rules: text({ length: 2048 }),
  disclaimer_of_liability_id: int().references(() => disclaimersOfLiability.id),
  award_prizes: text({ length: 1024 }),
  fee_amount: real(),
  fee_currency: text({ length: 3 }).default('ARS'),
  created_by: text().notNull().references(() => users.id),
  created_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  last_update_by: text().notNull().references(() => users.id),
  last_update_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});


// Circuits or Routes within an Event
export const sportingEventCircuits = sqliteTable("sporting_event_circuits", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  name: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  distance_km: real().notNull(),
  map_url: text({ length: 512 }),
});


// Milestone or Schedule for Events
// It can be used for start times, award ceremonies, etc.
export const sportingEventSchedules = sqliteTable("sporting_event_schedules", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  date: text().notNull(), // ISO string
  title: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  location: text({ length: 256 }).references(() => locations.id),
  location_address: text({ length: 128 }),
  location_lat: real(),
  location_long: real(),
});


// Templates for Athlete Categories (e.g., Adult, Junior, Senior, Wheelchair, etc.)
export const athleteCategoryTemplates = sqliteTable("athlete_category_templates", {
  id: int().primaryKey({ autoIncrement: true }),
  base_name: text({ length: 64 }).notNull(),
  male_name: text({ length: 64 }).default("Masculino"),
  female_name: text({ length: 64 }).default("Femenino"),
  unisex_name: text({ length: 64 }),
  min_age: int(),
  max_age: int(),
});


// Details about which athlete categories can register for an event, along with fees
// and distances
export const sportingEventAthleteCategories = sqliteTable("sporting_event_athlete_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  circuit_id: int().notNull().references(() => sportingEventCircuits.id),
  name: text({ length: 64 }).notNull(),
  sex: text({ length: 1 }), // 'M', 'F', or null for all
  min_age: int(),
  max_age: int(),
});


export const clothing = sqliteTable("clothing", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  clothing_type: text({ length: 64 }).notNull(), // "tshirt" (remera) or "tank_top" (musculosa)
  size: text({ length: 8 }).notNull(), // e.g., "XS", "S", "M", "L", "XL", "XXL"
  available_quantity: int().notNull().default(0),
  demanded_quantity: int().notNull().default(0),
  reserved_quantity: int().notNull().default(0),
});


// Sporting events registrations
export const sportingEventRegistrations = sqliteTable("sporting_event_registrations", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  user_id: text().notNull().references(() => users.id),
  category_id: int().notNull().references(() => sportingEventAthleteCategories.id),
  training_team_id: int().references(() => trainingTeams.id), // after 10 people, it have 10% discount
  registration_date: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  discount_percentage: int().notNull().default(0), // for special discounts
  discount_reason: text({ length: 256 }),
  fee_amount_after_discount: real().notNull(), // final amount after discounts
  paid_amount: real().notNull().default(0),
  paid_percentage: real().notNull().default(0), // 0 to 100 %
  demanded_clothing_id: int().notNull().references(() => clothing.id),
  reserved_clothing_id: int().references(() => clothing.id),
  special_needs: text({ length: 512 }), // allergies, accessibility, etc.
  status: text({ length: 16 }).notNull().default('pending'), // "pending", "partially_paid", "paid", "cancelled", etc.
  full_payment_date: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_by: text().references(() => users.id),
});


// Financial transactions for sporting events
// Tracks all income and expenses related to events
export const sportingEventTransactions = sqliteTable("sporting_event_transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  transaction_type: text({ length: 16 }).notNull(), // "income" or "expense"
  category: text({ length: 64 }).notNull(), // "registration", "infrastructure", "prizes", "clothing", "marketing", "permits", "venue", "equipment", etc.
  amount: real().notNull(), // positive value, type determines if income or expense
  currency: text({ length: 3 }).notNull().default('ARS'), // ISO currency code (EUR, USD, etc.)
  description: text({ length: 512 }),
  transaction_date: text().notNull(), // ISO string - when the transaction occurred
  user_id: text().references(() => users.id), // if related to a specific user (e.g., registration payment)
  registration_id: int().references(() => sportingEventRegistrations.id), // if related to a specific registration
  vendor_supplier: text({ length: 256 }), // company or person for expenses
  receipt_url: text({ length: 512 }), // URL to receipt/invoice document
  payment_method: text({ length: 32 }), // "cash", "bank_transfer", "card", "check", etc.
  status: text({ length: 16 }).notNull().default('completed'), // "pending", "completed", "cancelled", "refunded"
  created_by: text().notNull().references(() => users.id),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_by: text().references(() => users.id),
  updated_at: text().default(sql`CURRENT_TIMESTAMP`),
  notes: text({ length: 1024 }), // additional notes or comments
});
