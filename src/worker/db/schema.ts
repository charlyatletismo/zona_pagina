import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';


// Users Table
export const users = sqliteTable("users", {
  id: text({ length: 28 }).primaryKey(),
  phone: text().unique().notNull(),
  name: text(),
  surname: text(),
  sex: text({ length: 1 }),
  date_of_birth: text(),
  country: text({ length: 64 }),
  city: text({ length: 64 }),
  full_location: text({ length: 256 }),
  manager_id: text({ length: 28 }).references((): any => users.id),
  training_team: text({ length: 64 }),
  email: text().unique(),
  temp_code: text({ length: 6 }),
  roles: text(), // comma-separated roles
  hard_category: int().references((): any => athleteCategories.id),
  profile_image_url: text({ length: 512 }),
  profile_image_preview_url: text({ length: 512 }),
  created_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// Fee Categories (e.g., General, Student, Veteran, Handicapped, Elderly, etc.)
export const feesCategories = sqliteTable("fees_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
});


// Athlete Categories (e.g., Adult, Junior, Senior, Wheelchair, etc.)
export const athleteCategories = sqliteTable("athlete_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
  fee_category_id: int().notNull().references(() => feesCategories.id),
  min_age: int(),
  max_age: int(),
  condition: text({ length: 256 }), // e.g. "must have completed at least 3 events", "wheelchair users only", etc.
});


// Event Types (e.g., Marathon, Half-Marathon, 10K, Trail, etc.)
export const sportingEventTypes = sqliteTable("sporting_event_types", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
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
  location_hint: text({ length: 256 }),
  location_text: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
  event_type: int().notNull().references(() => sportingEventTypes.id),
  rules: text({ length: 2048 }),
  disclaimer_of_liability_title: text({ length: 64 }),
  disclaimer_of_liability_content: text({ length: 2048 }),
  award_prizes: text({ length: 1024 }),
  created_by: text().notNull().references(() => users.id),
  created_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  last_update_by: text().notNull().references(() => users.id),
  last_update_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});


// Milestone or Schedule for Events
// It can be used for start times, award ceremonies, etc.
export const sportingEventSchedules = sqliteTable("sporting_event_schedules", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: text().notNull().references(() => sportingEvents.id),
  date: text().notNull(), // ISO string
  title: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  location_hint: text({ length: 256 }),
  location_text: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
});


// Details about which athlete categories can register for an event, along with fees
// and distances
export const sportingEventAthleteCategories = sqliteTable("sporting_event_athlete_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  athlete_category_id: int().notNull().references(() => athleteCategories.id),
  fee_category_id: int().notNull().references(() => feesCategories.id),
  circuit_id: int().notNull().references(() => sportingEventCircuits.id),
  distance_km: real().notNull(),
  fee_amount: real().notNull(),
  allowed: int().notNull(), // 0 = false, 1 = true
});


// Circuits or Routes within an Event
export const sportingEventCircuits = sqliteTable("sporting_event_circuits", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: text().notNull().references(() => sportingEvents.id),
  name: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  distance_km: real().notNull(),
  map_url: text({ length: 512 }),
});


// Sporting events registrations
export const sportingEventRegistrations = sqliteTable("sporting_event_registrations", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  user_id: text().notNull().references(() => users.id),
  category_id: int().notNull().references(() => sportingEventAthleteCategories.id),
  registration_date: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  paid: int().notNull().default(0), // 0 = false, 1 = true
  payment_date: text(),
});


// Financial transactions for sporting events
// Tracks all income and expenses related to events
export const sportingEventTransactions = sqliteTable("sporting_event_transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull().references(() => sportingEvents.id),
  transaction_type: text({ length: 16 }).notNull(), // "income" or "expense"
  category: text({ length: 64 }).notNull(), // "registration", "infrastructure", "prizes", "clothing", "marketing", "permits", "venue", "equipment", etc.
  amount: real().notNull(), // positive value, type determines if income or expense
  currency: text({ length: 3 }).notNull().default('EUR'), // ISO currency code (EUR, USD, etc.)
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
