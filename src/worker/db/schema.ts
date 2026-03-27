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


export const chips = sqliteTable("chips", {
  id: int().primaryKey({ autoIncrement: true }),
  prefix: text({ length: 8 }).notNull(), // Generally with the format: CH, but can be any string up to 8 characters
  padding_n: int().notNull(), // CH00325
  start: int().notNull(), // 300
  end: int().notNull(), // 500
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
  profile_photo_id: text({ length: 512 }), // cloudflare image id for profile picture
  // Banned users can log in but cannot register for events or be part of training teams, etc.
  // This allows us to keep their data and history in the system without affecting statistics
  // and records, and also allows them to reactivate their account if the ban is temporary.
  banned: int().notNull().default(0),
  ban_reason: text({ length: 512 }),

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
  photo_id: text({ length: 36 }), // cloudflare image id
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
  // due date for payment
  fee_payment_due_date: text({ length: 64 }),
  // discounted fee for early registrations
  fee_amount_promotional: real(),
  // end date for registering with promotional fee
  promotional_fee_end: text({ length: 64 }),
  // due date for payment with promotional fee
  promotional_fee_payment_due_date: text({ length: 64 }),
  age_ranges: text({ length: 64 }), // e.g., "18,30,40,50+" means 18-29, 30-39, 40-49, 50 and above
  results_url: text({ length: 512 }), // URL to published results after the event
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


// export const sportingEventGallery = sqliteTable("sporting_event_gallery", {
//   id: int().primaryKey({ autoIncrement: true }),
//   event_id: int().notNull()
//     .references(() => sportingEvents.id,
//       { onDelete: 'cascade',
//         onUpdate: 'cascade' }
//       ),
//   photo_id: text({ length: 36 }), // cloudflare image id
//   caption: text({ length: 256 }),
//   uploaded_by: text({ length: USER_ID_MAX_LENGTH })
//     .references(() => users.id,
//       { onDelete: 'set null',
//         onUpdate: 'cascade' }
//       ),
//   uploaded_at: text().notNull().default(sql`CURRENT_TIMESTAMP`),
// });


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
  competitive: int().notNull().default(1), // 1 for competitive circuit, 0 for non-competitive (general category)
  bib_number_start: int().notNull(),
  bib_number_end: int().notNull(),
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
  // if set, sends notifications to registered users based on this template when the schedule item is upcoming
  notification_template_id: text({ length: 64 }),
  // ISO string - when to send notifications for this schedule item
  notify_at: text({ length: 64 }),
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
});


// Sporting events registrations
export const sportingEventRegistrations = sqliteTable("sporting_event_registrations", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: text({ length: USER_ID_MAX_LENGTH })
    .notNull()
    .references(() => users.id,
      { onDelete: 'cascade',
        onUpdate: 'cascade' }
      ),
  // after 10 people, they have the possibility of 10% discount
  training_team_id: int()
    .references(() => trainingTeams.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  event_id: int()
    .references(() => sportingEvents.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  // Category = competitive circuit + age range (e.g., "Circuit A - 18-29", "Circuit B - 30-39", etc.)
  // Category = non-competitive circuit + "general" (e.g., "Circuit C - General")
  circuit_id: int()
    .references(() => sportingEventCircuits.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  age_at_event_date: int().notNull(),

  discount_percentage: int().notNull().default(0), // for special discounts
  discount_reason: text({ length: 256 }),
  registration_date: text().notNull().default(sql`CURRENT_TIMESTAMP`),
  // if true, the promotional fee is applied to this registration
  // only when the promotional fee is active for the event and the
  // user registered before the promotional fee end date
  promotional_fee_applied: int().notNull().default(0),
  paid_amount: real().notNull().default(0),
  // "pending", "paid", "expired", "cancelled", etc.
  status: text({ length: 16 }).notNull().default('pending'),
  full_payment_date: text(),

  demanded_clothing_id: int()
    .references(() => sportingEventClothing.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),

  // After being paid, the clothing is reserved,
  // chip id and bib number are assigned
  reserved_clothing_id: int()
    .references(() => sportingEventClothing.id,
      { onDelete: 'set null',
        onUpdate: 'cascade' }
      ),
  chip_id: text({ length: 32 }),
  bib_number: int(),

  // Kit = bib + chip + clothing
  kit_delivered: int().notNull().default(0),

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
});
