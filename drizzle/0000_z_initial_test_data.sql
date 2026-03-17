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
    clothing_shirt_size,
    location,
    location_temp,
    location_address,
    special_needs,
    discount_percentage,
    manager_id,
    training_team_id,
    training_team_temp,
    profile_photo_id,
    banned,
    ban_reason,
    role
  )
VALUES
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
    NULL,
    'Libertad 1234',
    NULL,
    100,
    NULL,
    1,
    NULL,
    NULL,
    0,
    NULL,
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
    NULL,
    'Tito Martin 2340',
    NULL,
    100,
    NULL,
    1,
    NULL,
    NULL,
    0,
    NULL,
    'organizer'
  ),
  (
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
    NULL,
    'Belgrano 1313, depto 5F',
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    'admin'
  ),
  (
    "00000001",
    "Ana",
    "Garcia",
    "54_9_3400100000",
    'anagarcia@example.com',
    "Maria Garcia",
    "54_9_3400123450",
    "F",
    "1999-11-11",
    "S",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    "Moreno 1234",
    NULL,
    0,
    '00000004',
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    'athlete'
  ),
  (
    "00000002",
    "Luis",
    "Martinez",
    "54_9_3400200000",
    "luismartinez@example.com",
    "Jose Martinez",
    "54_9_3400123451",
    "M",
    "1995-05-05",
    "XL",
    "San Nicolás de los Arroyos, Buenos Aires, Argentina",
    NULL,
    "Falcón 1234",
    "Síndrome de Down, requiere acompañamiento",
    100,
    '00000004',
    2,
    NULL,
    NULL,
    0,
    NULL,
    'athlete'
  ),
  (
    "00000003",
    "Sofia",
    "Rodriguez",
    "54_9_3400300000",
    "sofiarodriguez@example.com",
    "Laura Rodriguez",
    "54_9_3400300001",
    "F",
    "2000-08-15",
    "S",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    "Moreno 1234",
    NULL,
    0,
    NULL,
    2,
    NULL,
    NULL,
    0,
    NULL,
    'athlete'
  ),
  (
    "00000004",
    "Diego",
    "Fernandez",
    "54_9_3400400000",
    "diegofernandez@example.com",
    "Carlos Fernandez",
    "54_9_3400400001",
    "M",
    "1992-03-22",
    "L",
    "San Nicolás de los Arroyos, Buenos Aires, Argentina",
    NULL,
    "Falcón 1245",
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    'athletes_manager'
  ),
  (
    "00000005",
    "Mariano",
    "Gomez",
    "54_9_3400500000",
    'marianogomez@example.com',
    "Maria Gomez",
    "54_9_3400123452",
    "M",
    "1997-12-12",
    "M",
    "Villa Constitución, Santa Fe, Argentina",
    NULL,
    "Moreno 1234",
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    'Doping',
    'athlete'
  );


INSERT INTO sporting_events (
  id,
  title,
  description,
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
  results_url,
  created_by,
  created_at,
  updated_by,
  updated_at)
VALUES
  (
    1,
    'Duatlón Rural La Vanguardia',
    'Duatlon Rural La Vanguardia Santa Fe Argentina. 3k.22k.3k. Categorías para todas las edades.',
    '2025-07-06T08:00',
    '2025-03-01T08:00',
    '2025-06-20T08:00',
    'La Vanguardia, Santa Fe, Argentina',
    'Plaza principal',
    -33.3577567,
    -60.6590607,
    'duathlon',
    NULL,
    '1er puesto: 100mil pesos\n2do puesto: Bicicleta Mountain Bike\n3er puesto: Casco deportivo',
    30000,
    'ARS',
    NULL,
    '34525736',
    '2025-02-01T11:00:00.374Z',
    '34525736',
    '2025-02-01T11:00:00.374Z'
  ),
  (
    2,
    'Theobald Corre',
    'Tercera Edición "THEOBALD CORRE" - Club Recreativo Theobald. Premiación y sorpresas.',
    '2025-07-20T08:00',
    '2025-05-01T08:00',
    '2025-07-10T08:00',
    'Theobald, Santa Fe, Argentina',
    'Club Atlético Recreativo Theobald',
    -33.3115726,
    -60.3100641,
    'marathon',
    NULL,
    '1er puesto: 70mil pesos\n2do puesto: Remera deportiva Adidas\n3er puesto: Gorro deportivo',
    25000,
    'ARS',
    NULL,
    '34525736',
    '2025-04-01T11:00:00.374Z',
    '34525736',
    '2025-04-01T11:00:00.374Z'
  ),
  (
    3,
    'La Vanguardia Corre',
    'Tercera Edición "La Vanguardia Corre". Ideal para quienes buscan un nuevo desafío físico y paisajístico.',
    '2025-08-31T08:00',
    '2025-07-01T08:00',
    '2025-08-20T08:00',
    'La Vanguardia, Santa Fe, Argentina',
    'Plaza principal',
    -33.3577567,
    -60.6590607,
    'marathon',
    NULL,
    '1er puesto: 50mil pesos\n2do puesto: Remera deportiva Nike\n3er puesto: Botella térmica',
    30000,
    'ARS',
    'https://events.runonrufus.com/event/maraton-la-vanguardia-corre-3-csh1',
    '34525736',
    '2025-06-01T11:00:00.374Z',
    '34525736',
    '2025-06-01T11:00:00.374Z'
  ),
  (
    4,
    'Re-corré Soldini',
    'Jornada por la salud y maratón "re-CORRÉ Soldini". Plaza Domingo Arán - 10k, 5k, caminata y kids.',
    '2025-09-14T08:00',
    '2025-08-01T08:00',
    '2025-09-05T08:00',
    'Soldini, Santa Fe, Argentina',
    'Plaza Domingo Arán',
    -33.02759348102319,
    -60.75664752048362,
    'marathon',
    NULL,
    '1er puesto: 60mil pesos\n2do puesto: Zapatillas deportivas\n3er puesto: Gorro deportivo',
    30000,
    'ARS',
    NULL,
    '34525736',
    '2025-08-01T11:00:00.374Z',
    '34525736',
    '2025-08-01T11:00:00.374Z'
  ),
  (
    5,
    '1º Maratón Inclusiva Familiar',
    '1° Maratón Inclusiva Familiar - Polideportivo de Funes. Distancias: 2k, 4k y 8k. Evento para todas las edades y capacidades.',
    '2025-09-28T08:00',
    '2025-08-15T08:00',
    '2025-09-20T08:00',
    'Funes, Santa Fe, Argentina',
    'Polideportivo de Funes',
    -32.91168210884132,
    -60.80751302197444,
    'marathon',
    NULL,
    '1er puesto: 80mil pesos\n2do puesto: Zapatillas deportivas\n3er puesto: Reloj deportivo',
    30000,
    'ARS',
    NULL,
    '34525736',
    '2025-08-15T11:00:00.374Z',
    '34525736',
    '2025-08-15T11:00:00.374Z'
  ),
  (
    6,
    'Villa Corre',
    'Todo villa corre!!',
    '2026-04-20T03:00:00',
    '2026-02-20T03:00:00',
    '2026-04-01T03:00:00',
    NULL,
    NULL,
    NULL,
    NULL,
    'marathon',
    'Acá van las reglas del evento',
    '1er puesto - $99.000 / 2do puesto - $77.000 / 3er puesto - $33.000',
    33000,
    'ARS',
    NULL,
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
  competitive,
  bib_number_start,
  bib_number_end
)
VALUES
  (
    1,
    3,
    '8K Circuito Principal',
    'Circuito principal de 8 kilómetros que recorre las principales calles de La Vanguardia.',
    8.0,
    1,
    1,
    300
  ),
  (
    2,
    3,
    '4K Circuito Alternativo',
    'Circuito alternativo de 4 kilómetros ideal para corredores principiantes.',
    4.0,
    0,
    301,
    500
  ),
  (
    3,
    6,
    'Principal 8K',
    'Descripción 8K',
    8.0,
    1,
    1,
    300
  ),
  (
    4,
    6,
    'Alternativo 4K',
    'Descripción 4K',
    4.0,
    0,
    301,
    500
  );


INSERT INTO
sporting_event_schedules (
  id,
  event_id,
  date,
  title,
  description,
  location,
  location_address)
VALUES
  (
    1,
    6,
    '2026-02-20T10:00',
    'Inicio de carrera',
    NULL,
    'Villa Constitución, Santa Fe, Argentina',
    'Plaza Principal'
  ),
  (
    2,
    6,
    '2026-02-20T15:00',
    'Entrega de premios',
    'Se hará la entrega de premios a los ganadores',
    'Villa Constitución, Santa Fe, Argentina',
    'Municipalidad'
  ),
  (
    3,
    6,
    '2026-02-19T18:00',
    'Entrega de Kits',
    'Los corredores podrán retirar sus dorsales, chips y remeras para la carrera',
    'Villa Constitución, Santa Fe, Argentina',
    'Plaza Central'
  );


INSERT INTO
sporting_event_clothing (
  id,
  event_id,
  clothing_type,
  size,
  purchased_quantity
)
VALUES
  (1, 6, 'tshirt', 'XS', 10),
  (2, 6, 'tshirt', 'S', 10),
  (3, 6, 'tshirt', 'M', 15),
  (4, 6, 'tshirt', 'L', 20),
  (5, 6, 'tshirt', 'XL', 10),
  (6, 6, 'tshirt', 'XXL', 5);


