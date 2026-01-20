INSERT INTO
  locations (
    id,
    locality,
    province,
    country,
    latitude,
    longitude
  )
VALUES (
    'Villa Constitución, Santa Fe, Argentina',
    'Villa Constitución',
    'Santa Fe',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'Empalme Villa Constitución, Santa Fe, Argentina',
    'Empalme Villa Constitución',
    'Santa Fe',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'San Nicolás de los Arroyos, Buenos Aires, Argentina',
    'San Nicolás de los Arroyos',
    'Buenos Aires',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'La Vanguardia, Santa Fe, Argentina',
    'La Vanguardia',
    'Santa Fe',
    'Argentina',
    -33.3577567,
    -60.6590607
  ),
  (
    'Theobald, Santa Fe, Argentina',
    'Theobald',
    'Santa Fe',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'Soldini, Santa Fe, Argentina',
    'Soldini',
    'Santa Fe',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'Funes, Santa Fe, Argentina',
    'Funes',
    'Santa Fe',
    'Argentina',
    NULL,
    NULL
  ),
  (
    'temporary_location',
    'Temporary Location',
    'Temporary Province',
    'Temporary Country',
    NULL,
    NULL
  );


INSERT INTO
training_teams (
    id,
    name,
    location
  )
VALUES (
    1,
    'SM Atletismo',
    'Empalme Villa Constitución, Santa Fe, Argentina'
  );


INSERT INTO
users (
    id,
    name,
    surname,
    phone,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    sex,
    date_of_birth,
    clothing_shirt_size,
    location_address,
    location,
    location_temp,
    special_needs,
    discount_percentage,
    manual_athlete_category,
    manager_id,
    training_team_id,
    temp_code,
    role
  )
VALUES (
    "42556386",
    "Goran",
    "Prpic",
    "54_9_3400658856",
    'gorandp@outlook.com',
    NULL,
    NULL,
    "M",
    "1998-11-25",
    "L",
    "Belgrano 1313, depto 5F",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    'admin'
  ),
  (
    "34525736",
    "Carlos",
    "Lopez",
    "54_9_3400667370",
    'carlos.emlopez@gmail.com',
    NULL,
    NULL,
    "M",
    "1989-07-24",
    NULL,
    NULL,
    "Empalme Villa Constitución, Santa Fe, Argentina",
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    1,
    NULL,
    'organizer'
  );
