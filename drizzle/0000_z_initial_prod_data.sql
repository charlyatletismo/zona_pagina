INSERT INTO
  locations (
    id,
    locality,
    province,
    country
  )
VALUES (
    'Villa Constitución, Santa Fe, Argentina',
    'Villa Constitución',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Empalme Villa Constitución, Santa Fe, Argentina',
    'Empalme Villa Constitución',
    'Santa Fe',
    'Argentina'
  ),
  (
    'San Nicolás de los Arroyos, Buenos Aires, Argentina',
    'San Nicolás de los Arroyos',
    'Buenos Aires',
    'Argentina'
  ),
  (
    'Rosario, Santa Fe, Argentina',
    'Rosario',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Arroyo Seco, Santa Fe, Argentina',
    'Arroyo Seco',
    'Santa Fe',
    'Argentina'
  ),
  (
    'La Vanguardia, Santa Fe, Argentina',
    'La Vanguardia',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Theobald, Santa Fe, Argentina',
    'Theobald',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Soldini, Santa Fe, Argentina',
    'Soldini',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Funes, Santa Fe, Argentina',
    'Funes',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Pérez, Santa Fe, Argentina',
    'Pérez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Granadero Baigorria, Santa Fe, Argentina',
    'Granadero Baigorria',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Santa Teresa, Santa Fe, Argentina',
    'Santa Teresa',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Uranga, Santa Fe, Argentina',
    'Uranga',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Pergamino, Buenos Aires, Argentina',
    'Pergamino',
    'Buenos Aires',
    'Argentina'
  ),
  (
    'Ramallo, Buenos Aires, Argentina',
    'Ramallo',
    'Buenos Aires',
    'Argentina'
  ),
  (
    'Venado Tuerto, Santa Fe, Argentina',
    'Venado Tuerto',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Pérez, Santa Fe, Argentina',
    'Pérez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Alcorta, Santa Fe, Argentina',
    'Alcorta',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Pavón, Santa Fe, Argentina',
    'Pavón',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Máximo Paz, Santa Fe, Argentina',
    'Máximo Paz',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Villa Gobernador Gálvez, Santa Fe, Argentina',
    'Villa Gobernador Gálvez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Fray Luis Beltrán, Santa Fe, Argentina',
    'Fray Luis Beltrán',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Capitán Bermúdez, Santa Fe, Argentina',
    'Capitán Bermúdez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Ibarlucea, Santa Fe, Argentina',
    'Ibarlucea',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Álvarez, Santa Fe, Argentina',
    'Álvarez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Pueblo Esther, Santa Fe, Argentina',
    'Pueblo Esther',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Firmat, Santa Fe, Argentina',
    'Firmat',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Cañada de Gómez, Santa Fe, Argentina',
    'Cañada de Gómez',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Roldán, Santa Fe, Argentina',
    'Roldán',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Fighiera, Santa Fe, Argentina',
    'Fighiera',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Timbúes, Santa Fe, Argentina',
    'Timbúes',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Puerto General San Martín, Santa Fe, Argentina',
    'Puerto General San Martín',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Carcarañá, Santa Fe, Argentina',
    'Carcarañá',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Armstrong, Santa Fe, Argentina',
    'Armstrong',
    'Santa Fe',
    'Argentina'
  ),
  (
    'Casilda, Santa Fe, Argentina',
    'Casilda',
    'Santa Fe',
    'Argentina'
  ),
  (
    'San Lorenzo, Santa Fe, Argentina',
    'San Lorenzo',
    'Santa Fe',
    'Argentina'
  ),
  (
    'temporary_location',
    'Temporary Location',
    'Temporary Province',
    'Temporary Country'
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
  ), (
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
  );
