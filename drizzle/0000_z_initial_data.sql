INSERT INTO
    users (
        id,
        phone,
        name,
        surname,
        email,
        temp_code,
        roles
    )
VALUES (
        "42556386",
        "5493400658856",
        "Goran",
        "Prpic",
        'gorandp@outlook.com',
        NULL,
        'admin,organizer,athlete,athletes_manager'
      ),
      (
        "34525736",
        "5493400667370",
        "Carlos",
        "Lopez",
        'carlos.emlopez@gmail.com',
        NULL,
        'organizer'
      ),
      (
        "00000001",
        "5493400123456",
        "Ana",
        "Garcia",
        'anagarcia@example.com',
        NULL,
        'athlete'
      );

INSERT INTO sporting_event_types (id, name) VALUES (1, 'Running');

INSERT INTO sporting_events (
  id,
  title,
  description,
  date,
  inscription_start,
  inscription_end,
  location_hint,
  location_text,
  location_lat,
  location_long,
  circuit_map_url,
  event_type,
  rules,
  disclaimer_of_liability_title,
  disclaimer_of_liability_content,
  award_prizes,
  created_by,
  created_at,
  last_update_by,
  last_update_at)
VALUES
  (
    1,
    'La Vanguardia Corre',
    'Tercera Edición "La Vanguardia Corre". Ideal para quienes buscan un nuevo desafío físico y paisajístico.',
    '2025-08-31T08:00:00-03:00',
    '2025-07-01T08:00:00-03:00',
    '2025-08-20T08:00:00-03:00',
    'Plaza principal',
    'La Vanguardia, Santa Fe, Argentina',
    -33.3577567,
    -60.6590607,
    NULL,
    1,
    NULL,
    NULL,
    NULL,
    '1er puesto: 50mil pesos\n2do puesto: Remera deportiva Nike\n3er puesto: Botella térmica',
    '42556386',
    '2025-06-01T08:00:00-03:00',
    '42556386',
    '2025-06-01T08:00:00-03:00'
    )

