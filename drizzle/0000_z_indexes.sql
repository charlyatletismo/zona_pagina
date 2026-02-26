-- ------------- Users ------------- --
-- unique index for phone number, but only for non-null values
CREATE UNIQUE INDEX idx_unique_phone
ON users (phone)
WHERE phone IS NOT NULL;
-- unique index for email, but only for non-null values
CREATE UNIQUE INDEX idx_unique_email
ON users (email)
WHERE email IS NOT NULL;
-- -- unique index for google_id, but only for non-null values
-- CREATE UNIQUE INDEX idx_unique_google_id
-- ON users (google_id)
-- WHERE google_id IS NOT NULL;
-- -- unique index for apple_id, but only for non-null values
-- CREATE UNIQUE INDEX idx_unique_apple_id
-- ON users (apple_id)
-- WHERE apple_id IS NOT NULL;
-- -- unique index for facebook_id, but only for non-null values
-- CREATE UNIQUE INDEX idx_unique_facebook_id
-- ON users (facebook_id)
-- WHERE facebook_id IS NOT NULL;
-- index for id and role
CREATE INDEX idx_users_id_role
ON users (id, role);


-- ------------- Sporting Event Registrations ------------- --
-- unique index for event_id + bib_number + chip_id (that are not null)
CREATE UNIQUE INDEX idx_unique_event_bib_chip
ON sporting_event_registrations (event_id, bib_number, chip_id)
WHERE bib_number IS NOT NULL AND chip_id IS NOT NULL;


-- ------------- Chips ------------- --
-- index for prefix + padding_n
CREATE INDEX idx_chips_prefix_padding
ON chips (prefix, padding_n);
