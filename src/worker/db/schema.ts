import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';


const USER_ID_MAX_LENGTH = 28;


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
  location: text({ length: 256 })
    .references(() => locations.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  coach_name: text({ length: 128 }),
  coach_user_id: text({ length: USER_ID_MAX_LENGTH })
    .references((): any => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
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
  id: text({ length: USER_ID_MAX_LENGTH }).primaryKey(),
  name: text(),
  surname: text(),
  phone: text().unique(),
  email: text().unique(),
  emergency_contact_name: text(),
  emergency_contact_phone: text(),
  sex: text({ length: 1 }),
  date_of_birth: text(),
  clothing_shirt_size: text({ length: 8 }), // e.g., "XS", "S", "M", "L", "XL", "XXL"
  location: text({ length: 256 })
    .references(() => locations.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  location_temp: text({ length: 256 }), // temporary location text when not registered in the system
  location_address: text({ length: 256 }),
  special_needs: text({ length: 512 }), // allergies, accessibility, etc.
  discount_percentage: int().notNull().default(0), // for special discounts
  manual_athlete_category: text({ length: 64 }), // if set, selects athlete category that matches this name or the beggining of it
  manager_id: text({ length: USER_ID_MAX_LENGTH })
    .references((): any => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  training_team_id: int()
    .references(() => trainingTeams.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  training_team_temp: text({ length: 128 }), // temporary training team name when not registered in the system
  profile_image_url: text({ length: 512 }),
  profile_image_preview_url: text({ length: 512 }),
  language: text({ length: 2 }).notNull().default('es'), // 'es', 'en', etc.
  temp_code: text({ length: 6 }),
  role: text().notNull(), // admin, organizer, athletes_manager, athlete
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
  user_id: text({ length: USER_ID_MAX_LENGTH }).notNull().references(() => users.id),
  field_name: text({ length: 64 }).notNull(),
  old_value: text(),
  new_value: text(),
  updated_at: text()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_by: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
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
  location: text({ length: 256 })
    .references(() => locations.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  location_address: text({ length: 256 }),
  location_lat: real(),
  location_long: real(),
  event_type: text({ length: 32 }).notNull(), // marathon, half_marathon, duathlon, trail, cycling, etc.
  rules: text({ length: 2048 }),
  disclaimer_of_liability: text({ length: 4096 }),
  award_prizes: text({ length: 1024 }),
  fee_amount: real(),
  fee_currency: text({ length: 3 }).default('ARS'),
  created_by: text({ length: USER_ID_MAX_LENGTH })
    .notNull()
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  created_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_by: text({ length: USER_ID_MAX_LENGTH })
    .notNull()
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  updated_at: text().notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});


// Circuits or Routes within an Event
export const sportingEventCircuits = sqliteTable("sporting_event_circuits", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull()
    .references(() => sportingEvents.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  name: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  distance_km: real().notNull(),
  map_url: text({ length: 512 }),
});


// Milestone or Schedule for Events
// It can be used for start times, award ceremonies, etc.
export const sportingEventSchedules = sqliteTable("sporting_event_schedules", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull()
    .references(() => sportingEvents.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  date: text().notNull(), // ISO string
  title: text({ length: 128 }).notNull(),
  description: text({ length: 512 }),
  location: text({ length: 256 })
    .references(() => locations.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  location_address: text({ length: 128 }),
  location_lat: real(),
  location_long: real(),
});


// Details about which athlete categories can register for an event, along with fees
// and distances
export const sportingEventAthleteCategories = sqliteTable("sporting_event_athlete_categories", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull()
    .references(() => sportingEvents.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  circuit_id: int().notNull()
    .references(() => sportingEventCircuits.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  name: text({ length: 64 }).notNull(),
  sex: text({ length: 1 }), // 'M', 'F', or null for all
  min_age: int(),
  max_age: int(),
  exclude_auto_qualify: int().notNull().default(0), // if 1, athletes won't be auto-assigned to this category
});


export const sportingEventClothing = sqliteTable("sporting_event_clothing", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int().notNull()
    .references(() => sportingEvents.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  clothing_type: text({ length: 64 }).notNull(), // "tshirt" (remera) or "tanktop" (musculosa)
  size: text({ length: 8 }).notNull(), // e.g., "XS", "S", "M", "L", "XL", "XXL"
  purchased_quantity: int().notNull().default(0),
  demanded_quantity: int().notNull().default(0),
  reserved_quantity: int().notNull().default(0),
});


// Sporting events registrations
export const sportingEventRegistrations = sqliteTable("sporting_event_registrations", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int()
    .references(() => sportingEvents.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  user_id: text({ length: USER_ID_MAX_LENGTH })
    .notNull()
    .references(() => users.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  category_id: int()
    .references(() => sportingEventAthleteCategories.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  training_team_id: int()
    .references(() => trainingTeams.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ), // after 10 people, it have 10% discount
  registration_date: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  discount_percentage: int().notNull().default(0), // for special discounts
  discount_reason: text({ length: 256 }),
  fee_amount_original: real().notNull(), // original amount before discounts
  fee_amount_after_discount: real().notNull(), // final amount after discounts
  paid_amount: real().notNull().default(0),
  paid_percentage: real().notNull().default(0), // 0 to 100 %
  demanded_clothing_id: int()
    .references(() => sportingEventClothing.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  reserved_clothing_id: int()
    .references(() => sportingEventClothing.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  status: text({ length: 16 }).notNull().default('pending'), // "pending", "partially_paid", "paid", "cancelled", etc.
  full_payment_date: text(),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  created_by: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  updated_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_by: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
});


// Financial transactions for sporting events
// Tracks all income and expenses related to events
export const sportingEventTransactions = sqliteTable("sporting_event_transactions", {
  id: int().primaryKey({ autoIncrement: true }),
  event_id: int()
    .references(() => sportingEvents.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),

  // inflow, outflow
  transaction_type: text({ length: 16 }).notNull(),

  // registration_payment, registration_refund,
  // infrastructure, marketing, prizes, clothing,
  // permits, equipment, sponsorship, partner_services, other
  category: text({ length: 64 }).notNull(),

  amount: real().notNull(), // positive value, type determines if income or expense
  currency: text({ length: 3 }).notNull().default('ARS'), // ISO currency code (EUR, USD, etc.)
  description: text({ length: 512 }),
  transaction_date: text().notNull(), // ISO string - when the transaction occurred
  user_id: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ), // if related to a specific user (e.g., registration payment)
  registration_id: int()
    .references(() => sportingEventRegistrations.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ), // if related to a specific registration
  vendor_supplier: text({ length: 256 }), // company or person for expenses
  receipt_url: text({ length: 512 }), // URL to receipt/invoice document
  payment_method: text({ length: 32 }), // "cash", "bank_transfer", "card", "check", etc.
  status: text({ length: 16 }).notNull().default('completed'), // "pending", "completed", "cancelled", "refunded"
  created_by: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  created_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_by: text({ length: USER_ID_MAX_LENGTH })
    .references(() => users.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  updated_at: text().default(sql`CURRENT_TIMESTAMP`),
  notes: text({ length: 1024 }), // additional notes or comments
});
