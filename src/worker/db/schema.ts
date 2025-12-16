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
  created_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// Fee Categories (e.g., General, Student, Veteran, Handicapped, Elderly, etc.)
export const feesCategories = sqliteTable("fees_categories", {
  id: text({ length: 28 }).primaryKey(),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
});


// Runner Categories (e.g., Adult, Junior, Senior, Wheelchair, etc.)
export const runnerCategories = sqliteTable("runner_categories", {
  id: text({ length: 28 }).primaryKey(),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
  fee_category_id: text().notNull().references(() => feesCategories.id),
  min_age: int(),
  max_age: int(),
  condition: text({ length: 256 }), // e.g. "must have completed at least 3 events", "wheelchair users only", etc.
});


// Event Types (e.g., Marathon, Half-Marathon, 10K, Trail, etc.)
export const eventTypes = sqliteTable("event_types", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 64 }).notNull(),
  description: text({ length: 256 }),
});


// Main Events Table
export const events = sqliteTable("events", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  date: text().notNull(), // ISO string
  inscription_start: text({ length: 64 }),
  inscription_end: text({ length: 64 }),
  location_hint: text({ length: 256 }),
  location_text: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
  circuit_map_url: text({ length: 512 }),
  event_type: int().notNull().references(() => eventTypes.id),
  rules: text({ length: 2048 }),
  disclaimer_of_liability_title: text({ length: 64 }),
  disclaimer_of_liability_content: text({ length: 2048 }),
  award_prizes: text({ length: 1024 }),
  created_by: text().notNull().references(() => users.id),
  created_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  last_update_by: text().notNull().references(() => users.id),
  last_update_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});


// Milestone or Schedule for Events
// It can be used for start times, award ceremonies, etc.
export const eventSchedules = sqliteTable("event_schedules", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: text().notNull().references(() => events.id),
  date: text().notNull(), // ISO string
  title: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  location_hint: text({ length: 256 }),
  location_text: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
});


// Details about which runner categories can register for an event, along with fees
// and distances
export const eventRunnerCategories = sqliteTable("event_runner_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: text().notNull().references(() => events.id),
  runner_category_id: text().notNull().references(() => runnerCategories.id),
  fee_category_id: text().notNull().references(() => feesCategories.id),
  distance_km: real().notNull(),
  fee_amount: real().notNull(),
  allowed: int().notNull(), // 0 = false, 1 = true
});


// Circuits or Routes within an Event
export const eventCircuits = sqliteTable("event_circuits", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: text().notNull().references(() => events.id),
  name: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  distance_km: real().notNull(),
});


// Inscriptions Table
export const inscriptions = sqliteTable("inscriptions", {
  id: text({ length: 28 }).primaryKey(),
  event_id: text().notNull().references(() => events.id),
  user_id: text().notNull().references(() => users.id),
  inscription_date: text().notNull(),
  paid: int().notNull(), // 0 = false, 1 = true
  payment_date: text(),
});
