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
  ),
  (
    2,
    'TEST GROUP',
    'San Nicolás de los Arroyos, Buenos Aires, Argentina'
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
    clothing_tshirt_size,
    address,
    location,
    location_temp,
    special_needs,
    discount_percentage,
    manager_id,
    training_team_id,
    temp_code,
    role
  )
VALUES (
    "42556386",
    "Goran",
    "Prpic",
    "5493400658856",
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
    'admin'
  ),
  (
    "34525736",
    "Carlos",
    "Lopez",
    "5493400667370",
    'carlos.emlopez@gmail.com',
    "Cecy",
    "5493400123123",
    "M",
    "1989-07-24",
    "L",
    "Libertad 1234",
    "Empalme Villa Constitución, Santa Fe, Argentina",
    NULL,
    NULL,
    0,
    NULL,
    1,
    NULL,
    'organizer'
  ),
  (
    "00000001",
    "Ana",
    "Garcia",
    "5493400123456",
    'anagarcia@example.com',
    "Maria Garcia",
    "5493400123450",
    "F",
    "1999-11-11",
    "S",
    "Moreno 1234",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    NULL,
    0,
    '00000004',
    NULL,
    NULL,
    'athlete'
  ),
  (
    "00000002",
    "Luis",
    "Martinez",
    "5493400123457",
    "luismartinez@example.com",
    "Jose Martinez",
    "5493400123451",
    "M",
    "1995-05-05",
    "XL",
    "Falcón 1234",
    "San Nicolás de los Arroyos, Buenos Aires, Argentina",
    NULL,
    "Síndrome de Down, requiere acompañamiento",
    100,
    '00000004',
    2,
    NULL,
    'athlete'
  ),
  (
    "00000003",
    "Sofia",
    "Rodriguez",
    "5493400123458",
    "sofiarodriguez@example.com",
    "Laura Rodriguez",
    "5493400123452",
    "F",
    "2000-08-15",
    "S",
    "Moreno 1234",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    NULL,
    0,
    NULL,
    2,
    NULL,
    'athlete'
  ),
  (
    "00000004",
    "Diego",
    "Fernandez",
    "5493400123459",
    "diegofernandez@example.com",
    "Carlos Fernandez",
    "5493400123453",
    "M",
    "1992-03-22",
    "L",
    "Falcón 1245",
    "San Nicolás de los Arroyos, Buenos Aires, Argentina",
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    'athletes_manager'
  );


INSERT INTO
sporting_event_types (id, name)
VALUES (1, 'Maratón'), (2, 'Duatlón'), (3, 'Triatlón'), (4, 'Ciclismo');


INSERT INTO sporting_events (
  id,
  title,
  description,
  image_url,
  image_preview_url,
  date,
  registration_start,
  registration_end,
  location,
  location_address,
  location_lat,
  location_long,
  event_type,
  rules,
  award_prizes,
  fee_amount,
  fee_currency,
  created_by,
  created_at,
  last_update_by,
  last_update_at)
VALUES
  (
    1,
    'Duatlón Rural La Vanguardia',
    'Duatlon Rural La Vanguardia Santa Fe Argentina. 3k.22k.3k. Categorías para todas las edades.',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento1_flyer.png?raw=true',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento1_flyer.png?raw=true',
    '2025-07-06T08:00',
    '2025-03-01T08:00',
    '2025-06-20T08:00',
    'La Vanguardia, Santa Fe, Argentina',
    'Plaza principal',
    -33.3577567,
    -60.6590607,
    2,
    NULL,
    '1er puesto: 100mil pesos\n2do puesto: Bicicleta Mountain Bike\n3er puesto: Casco deportivo',
    30000,
    'ARS',
    '34525736',
    '2025-02-01T11:00:00.374Z',
    '34525736',
    '2025-02-01T11:00:00.374Z'
  ),
  (
    2,
    'Theobald Corre',
    'Tercera Edición "THEOBALD CORRE" - Club Recreativo Theobald. Premiación y sorpresas.',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento2_flyer.png?raw=true',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento2_flyer.png?raw=true',
    '2025-07-20T08:00',
    '2025-05-01T08:00',
    '2025-07-10T08:00',
    'Theobald, Santa Fe, Argentina',
    'Club Atlético Recreativo Theobald',
    -33.3115726,
    -60.3100641,
    1,
    NULL,
    '1er puesto: 70mil pesos\n2do puesto: Remera deportiva Adidas\n3er puesto: Gorro deportivo',
    25000,
    'ARS',
    '34525736',
    '2025-04-01T11:00:00.374Z',
    '34525736',
    '2025-04-01T11:00:00.374Z'
  ),
  (
    3,
    'La Vanguardia Corre',
    'Tercera Edición "La Vanguardia Corre". Ideal para quienes buscan un nuevo desafío físico y paisajístico.',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento3_flyer.png?raw=true',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento3_flyer.png?raw=true',
    '2025-08-31T08:00',
    '2025-07-01T08:00',
    '2025-08-20T08:00',
    'La Vanguardia, Santa Fe, Argentina',
    'Plaza principal',
    -33.3577567,
    -60.6590607,
    1,
    NULL,
    '1er puesto: 50mil pesos\n2do puesto: Remera deportiva Nike\n3er puesto: Botella térmica',
    30000,
    'ARS',
    '34525736',
    '2025-06-01T11:00:00.374Z',
    '34525736',
    '2025-06-01T11:00:00.374Z'
  ),
  (
    4,
    'Re-corré Soldini',
    'Jornada por la salud y maratón "re-CORRÉ Soldini". Plaza Domingo Arán - 10k, 5k, caminata y kids.',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento4_flyer.png?raw=true',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento4_flyer.png?raw=true',
    '2025-09-14T08:00',
    '2025-08-01T08:00',
    '2025-09-05T08:00',
    'Soldini, Santa Fe, Argentina',
    'Plaza Domingo Arán',
    -33.02759348102319,
    -60.75664752048362,
    1,
    NULL,
    '1er puesto: 60mil pesos\n2do puesto: Zapatillas deportivas\n3er puesto: Gorro deportivo',
    30000,
    'ARS',
    '34525736',
    '2025-08-01T11:00:00.374Z',
    '34525736',
    '2025-08-01T11:00:00.374Z'
  ),
  (
    5,
    '1º Maratón Inclusiva Familiar',
    '1° Maratón Inclusiva Familiar - Polideportivo de Funes. Distancias: 2k, 4k y 8k. Evento para todas las edades y capacidades.',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento5_flyer.png?raw=true',
    'https://github.com/charlyatletismo/zona_pagina/blob/dev/a/images/evento5_flyer.png?raw=true',
    '2025-09-28T08:00',
    '2025-08-15T08:00',
    '2025-09-20T08:00',
    'Funes, Santa Fe, Argentina',
    'Polideportivo de Funes',
    -32.91168210884132,
    -60.80751302197444,
    1,
    NULL,
    '1er puesto: 80mil pesos\n2do puesto: Zapatillas deportivas\n3er puesto: Reloj deportivo',
    30000,
    'ARS',
    '34525736',
    '2025-08-15T11:00:00.374Z',
    '34525736',
    '2025-08-15T11:00:00.374Z'
  ),
  (
    6,
    'Villa Corre',
    'Todo villa corre!!',
    NULL,
    NULL,
    '2026-02-20T10:00',
    '2025-12-10T10:00',
    '2026-02-10T10:00',
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    'Acá van las reglas del evento',
    '1 - Una banda de plata / 2 - Algo de plata / 3 - Un ferrari',
    0,
    'ARS',
    '42556386',
    '2025-12-25T18:00:38.954Z',
    '42556386',
    '2025-12-26T21:30:38.954Z'
  );


INSERT INTO sporting_event_circuits (
  id,
  event_id,
  name,
  description,
  distance_km,
  map_url)
VALUES
  (
    1,
    3,
    '10K Circuito Principal',
    'Circuito principal de 10 kilómetros que recorre las principales calles de La Vanguardia.',
    10.0,
    NULL
  ),
  (
    2,
    3,
    '5K Circuito Alternativo',
    'Circuito alternativo de 5 kilómetros ideal para corredores principiantes.',
    5.0,
    NULL
  ),
  (
    3,
    6,
    'Principal 10K',
    'Descripción 10K',
    10.0,
    NULL
  ),
  (
    4,
    6,
    'Alternativo 3K',
    'Descripción 3K',
    3.0,
    NULL
  );


INSERT INTO
sporting_event_schedules (
  id,
  event_id,
  date,
  title,
  description,
  location,
  location_address,
  location_lat,
  location_long)
VALUES
  (
    1,
    6,
    '2026-02-20T10:00',
    'Inicio de carrera',
    NULL,
    'Villa Constitución, Santa Fe, Argentina',
    'Plaza Principal',
    NULL,
    NULL
  ),
  (
    2,
    6,
    '2026-02-20T15:00',
    'Entrega de premios',
    'Se hará la entrega de premios a los ganadores',
    'Villa Constitución, Santa Fe, Argentina',
    'Municipalidad',
    NULL,
    NULL
  );


INSERT INTO
athlete_category_templates (
  id,
  base_name,
  male_name,
  female_name,
  unisex_name,
  min_age,
  max_age)
VALUES
  (1, 'Juveniles', 'Masculino', 'Femenino', NULL, NULL, NULL),
  (2, 'Senior', 'Masculino', 'Femenino', NULL, NULL, NULL);


INSERT INTO
sporting_event_athlete_categories (
  id,
  event_id,
  circuit_id,
  name,
  sex,
  min_age,
  max_age
)
VALUES
  (1, 6, 3, '10K Juveniles Masculino', 'M', 16, 19),
  (2, 6, 3, '10K Juveniles Femenino', 'F', 16, 19),
  (3, 6, 3, '10K Senior Masculino', 'M', 20, 39),
  (4, 6, 3, '10K Senior Femenino', 'F', 20, 39),
  (5, 6, 4, '3K Juveniles Masculino', 'M', 16, 19),
  (6, 6, 4, '3K Juveniles Femenino', 'F', 16, 19),
  (7, 6, 4, '3K Senior Masculino', 'M', 20, 39),
  (8, 6, 4, '3K Senior Femenino', 'F', 20, 39);


INSERT INTO
clothing (
  id,
  event_id,
  clothing_type,
  size,
  available_quantity,
  demanded_quantity,
  reserved_quantity
)
VALUES
  (1, 6, 'tshirt', 'XS', 10, 0, 0),
  (2, 6, 'tshirt', 'S', 10, 0, 0),
  (3, 6, 'tshirt', 'M', 15, 0, 0),
  (4, 6, 'tshirt', 'L', 20, 0, 0),
  (5, 6, 'tshirt', 'XL', 10, 0, 0),
  (6, 6, 'tshirt', 'XXL', 5, 0, 0);


INSERT INTO
sporting_event_transactions (
  id,
  event_id,
  transaction_type,
  category,
  amount,
  currency,
  description,
  transaction_date,
  user_id,
  registration_id,
  vendor_supplier,
  receipt_url,
  payment_method,
  status,
  created_by,
  created_at,
  updated_by,
  updated_at,
  notes
)
VALUES
  (
    1,
    6,
    'expense',
    'clothing',
    100000,
    'ARS',
    'Compra de remeras para el evento Villa Corre',
    '2025-12-30T10:00:00.000Z',
    '34525736',
    NULL,
    'Proveedor de Ropa Deportiva S.A.',
    NULL,
    'cash',
    'completed',
    '34525736',
    '2025-12-30T10:00:00.000Z',
    '34525736',
    '2025-12-30T10:00:00.000Z',
    NULL
  );
