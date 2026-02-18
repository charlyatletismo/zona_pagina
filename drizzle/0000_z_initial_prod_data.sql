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
    -33.2275605,
    -60.3302311
  ),
  (
    'Empalme Villa Constitución, Santa Fe, Argentina',
    'Empalme Villa Constitución',
    'Santa Fe',
    'Argentina',
    -33.2610580,
    -60.3796213
  ),
  (
    'San Nicolás de los Arroyos, Buenos Aires, Argentina',
    'San Nicolás de los Arroyos',
    'Buenos Aires',
    'Argentina',
    -33.3302747,
    -60.2088286
  ),
  (
    'Rosario, Santa Fe, Argentina',
    'Rosario',
    'Santa Fe',
    'Argentina',
    -32.9435990,
    -60.6496834
  ),
  (
    'Arroyo Seco, Santa Fe, Argentina',
    'Arroyo Seco',
    'Santa Fe',
    'Argentina',
    -33.1546917,
    -60.5040639
  ),
  (
    'La Vanguardia, Santa Fe, Argentina',
    'La Vanguardia',
    'Santa Fe',
    'Argentina',
    -33.3573867,
    -60.6578199
  ),
  (
    'Theobald, Santa Fe, Argentina',
    'Theobald',
    'Santa Fe',
    'Argentina',
    -33.3076271,
    -60.3118147
  ),
  (
    'Soldini, Santa Fe, Argentina',
    'Soldini',
    'Santa Fe',
    'Argentina',
    -33.0270394, 
    -60.7563872
  ),
  (
    'Funes, Santa Fe, Argentina',
    'Funes',
    'Santa Fe',
    'Argentina',
    -32.9230521,
    -60.7946843
  ),
  (
    'Pérez, Santa Fe, Argentina',
    'Pérez',
    'Santa Fe',
    'Argentina',
    -33.0012165,
    -60.7767905
  ),
  (
    'Granadero Baigorria, Santa Fe, Argentina',
    'Granadero Baigorria',
    'Santa Fe',
    'Argentina',
    -32.8504323,
    -60.7059380
  ),
  (
    'Santa Teresa, Santa Fe, Argentina',
    'Santa Teresa',
    'Santa Fe',
    'Argentina',
    -33.4381370,
    -60.7938350
  ),
  (
    'Uranga, Santa Fe, Argentina',
    'Uranga',
    'Santa Fe',
    'Argentina',
    -33.2657987,
    -60.7046183
  ),
  (
    'Pergamino, Buenos Aires, Argentina',
    'Pergamino',
    'Buenos Aires',
    'Argentina',
    -33.9070770,
    -60.5736386
  ),
  (
    'Ramallo, Buenos Aires, Argentina',
    'Ramallo',
    'Buenos Aires',
    'Argentina',
    -33.4843400,
    -60.0053042
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
    location,
    location_address,
    training_team_id,
    role
  )
VALUES (
    '42556386',
    'Goran',
    'Prpic',
    '54_9_3400658856',
    'gorandp@outlook.com',
    NULL,
    NULL,
    'M',
    '1998-11-25T03:00:00.000Z',
    'L',
    'Villa Constitución, Santa Fe, Argentina',
    'Belgrano 1313, depto 5F',
    NULL,
    'admin'
  ),
  (
    '34525736',
    'Carlos',
    'Lopez',
    '54_9_3400667370',
    'carlos.emlopez@gmail.com',
    'Cecy',
    '54_9_3364350115',
    'M',
    '1989-07-24T03:00:00.000Z',
    'L',
    'Empalme Villa Constitución, Santa Fe, Argentina',
    'Libertad 1234',
    1,
    'organizer'
  ),
  (
    '28880983',
    'Cecilia',
    'Sabarini',
    '54_9_3364350115',
    'sabariniceci@gmail.com',
    'Charly',
    '54_9_3400667370',
    'F',
    '1981-06-05T03:00:00.000Z',
    'S',
    'Villa Constitución, Santa Fe, Argentina',
    'Tito Martin 2340',
    1,
    'organizer'
  );
