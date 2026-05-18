-- ============================================================
-- WC26 · 72 partidos de fase de grupos — horario oficial
-- ============================================================
-- Fuente: FIFA / Al Jazeera (mayo 2026)
-- Todos los horarios en UTC (ET + 4h para EDT)
-- MD3 de cada grupo se juega de forma simultánea
-- ============================================================

insert into public.matches
  (home_team_id, away_team_id, home_team, away_team, group_id, stage, scheduled_at, venue)
values

-- ════════════════════════════════════════════════════════════
-- GRUPO A  MEX · KOR · RSA · CZE
-- ════════════════════════════════════════════════════════════

-- MD1 · 11-12 jun
(
  (select id from public.teams where code = 'MEX'),
  (select id from public.teams where code = 'RSA'),
  'México', 'Sudáfrica', 'A', 'group',
  '2026-06-11T19:00:00Z', 'Estadio Azteca, Ciudad de México'
),
(
  (select id from public.teams where code = 'KOR'),
  (select id from public.teams where code = 'CZE'),
  'Corea del Sur', 'Chequia', 'A', 'group',
  '2026-06-12T02:00:00Z', 'Estadio Akron, Guadalajara'
),

-- MD2 · 18-19 jun
(
  (select id from public.teams where code = 'CZE'),
  (select id from public.teams where code = 'RSA'),
  'Chequia', 'Sudáfrica', 'A', 'group',
  '2026-06-18T16:00:00Z', 'Mercedes-Benz Stadium, Atlanta'
),
(
  (select id from public.teams where code = 'MEX'),
  (select id from public.teams where code = 'KOR'),
  'México', 'Corea del Sur', 'A', 'group',
  '2026-06-19T01:00:00Z', 'Estadio Akron, Guadalajara'
),

-- MD3 · 24-25 jun (simultáneos)
(
  (select id from public.teams where code = 'CZE'),
  (select id from public.teams where code = 'MEX'),
  'Chequia', 'México', 'A', 'group',
  '2026-06-25T01:00:00Z', 'Estadio Azteca, Ciudad de México'
),
(
  (select id from public.teams where code = 'RSA'),
  (select id from public.teams where code = 'KOR'),
  'Sudáfrica', 'Corea del Sur', 'A', 'group',
  '2026-06-25T01:00:00Z', 'Estadio BBVA, Monterrey'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO B  CAN · BIH · QAT · SUI
-- ════════════════════════════════════════════════════════════

-- MD1 · 12-13 jun
(
  (select id from public.teams where code = 'CAN'),
  (select id from public.teams where code = 'BIH'),
  'Canadá', 'Bosnia y Herz.', 'B', 'group',
  '2026-06-12T19:00:00Z', 'BMO Field, Toronto'
),
(
  (select id from public.teams where code = 'QAT'),
  (select id from public.teams where code = 'SUI'),
  'Qatar', 'Suiza', 'B', 'group',
  '2026-06-13T19:00:00Z', 'Levi''s Stadium, Santa Clara'
),

-- MD2 · 18 jun
(
  (select id from public.teams where code = 'SUI'),
  (select id from public.teams where code = 'BIH'),
  'Suiza', 'Bosnia y Herz.', 'B', 'group',
  '2026-06-18T19:00:00Z', 'SoFi Stadium, Los Ángeles'
),
(
  (select id from public.teams where code = 'CAN'),
  (select id from public.teams where code = 'QAT'),
  'Canadá', 'Qatar', 'B', 'group',
  '2026-06-18T22:00:00Z', 'BC Place, Vancouver'
),

-- MD3 · 24 jun (simultáneos)
(
  (select id from public.teams where code = 'SUI'),
  (select id from public.teams where code = 'CAN'),
  'Suiza', 'Canadá', 'B', 'group',
  '2026-06-24T19:00:00Z', 'BC Place, Vancouver'
),
(
  (select id from public.teams where code = 'BIH'),
  (select id from public.teams where code = 'QAT'),
  'Bosnia y Herz.', 'Qatar', 'B', 'group',
  '2026-06-24T19:00:00Z', 'Lumen Field, Seattle'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO C  BRA · MAR · HAI · SCO
-- ════════════════════════════════════════════════════════════

-- MD1 · 13-14 jun
(
  (select id from public.teams where code = 'BRA'),
  (select id from public.teams where code = 'MAR'),
  'Brasil', 'Marruecos', 'C', 'group',
  '2026-06-13T22:00:00Z', 'MetLife Stadium, Nueva Jersey'
),
(
  (select id from public.teams where code = 'HAI'),
  (select id from public.teams where code = 'SCO'),
  'Haití', 'Escocia', 'C', 'group',
  '2026-06-14T01:00:00Z', 'Gillette Stadium, Boston'
),

-- MD2 · 19-20 jun
(
  (select id from public.teams where code = 'SCO'),
  (select id from public.teams where code = 'MAR'),
  'Escocia', 'Marruecos', 'C', 'group',
  '2026-06-19T22:00:00Z', 'Gillette Stadium, Boston'
),
(
  (select id from public.teams where code = 'BRA'),
  (select id from public.teams where code = 'HAI'),
  'Brasil', 'Haití', 'C', 'group',
  '2026-06-20T01:00:00Z', 'Lincoln Financial Field, Filadelfia'
),

-- MD3 · 24 jun (simultáneos)
(
  (select id from public.teams where code = 'SCO'),
  (select id from public.teams where code = 'BRA'),
  'Escocia', 'Brasil', 'C', 'group',
  '2026-06-24T22:00:00Z', 'Hard Rock Stadium, Miami'
),
(
  (select id from public.teams where code = 'MAR'),
  (select id from public.teams where code = 'HAI'),
  'Marruecos', 'Haití', 'C', 'group',
  '2026-06-24T22:00:00Z', 'Mercedes-Benz Stadium, Atlanta'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO D  USA · PAR · AUS · TUR
-- ════════════════════════════════════════════════════════════

-- MD1 · 12-14 jun
(
  (select id from public.teams where code = 'USA'),
  (select id from public.teams where code = 'PAR'),
  'Estados Unidos', 'Paraguay', 'D', 'group',
  '2026-06-13T01:00:00Z', 'SoFi Stadium, Los Ángeles'
),
(
  (select id from public.teams where code = 'AUS'),
  (select id from public.teams where code = 'TUR'),
  'Australia', 'Turquía', 'D', 'group',
  '2026-06-14T01:00:00Z', 'BC Place, Vancouver'
),

-- MD2 · 19 jun
(
  (select id from public.teams where code = 'TUR'),
  (select id from public.teams where code = 'PAR'),
  'Turquía', 'Paraguay', 'D', 'group',
  '2026-06-19T04:00:00Z', 'Levi''s Stadium, Santa Clara'
),
(
  (select id from public.teams where code = 'USA'),
  (select id from public.teams where code = 'AUS'),
  'Estados Unidos', 'Australia', 'D', 'group',
  '2026-06-19T19:00:00Z', 'Lumen Field, Seattle'
),

-- MD3 · 25-26 jun (simultáneos)
(
  (select id from public.teams where code = 'TUR'),
  (select id from public.teams where code = 'USA'),
  'Turquía', 'Estados Unidos', 'D', 'group',
  '2026-06-26T02:00:00Z', 'SoFi Stadium, Los Ángeles'
),
(
  (select id from public.teams where code = 'PAR'),
  (select id from public.teams where code = 'AUS'),
  'Paraguay', 'Australia', 'D', 'group',
  '2026-06-26T02:00:00Z', 'Levi''s Stadium, Santa Clara'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO E  GER · CUW · CIV · ECU
-- ════════════════════════════════════════════════════════════

-- MD1 · 14 jun
(
  (select id from public.teams where code = 'GER'),
  (select id from public.teams where code = 'CUW'),
  'Alemania', 'Curazao', 'E', 'group',
  '2026-06-14T17:00:00Z', 'NRG Stadium, Houston'
),
(
  (select id from public.teams where code = 'CIV'),
  (select id from public.teams where code = 'ECU'),
  'Costa de Marfil', 'Ecuador', 'E', 'group',
  '2026-06-14T23:00:00Z', 'Lincoln Financial Field, Filadelfia'
),

-- MD2 · 20-21 jun
(
  (select id from public.teams where code = 'GER'),
  (select id from public.teams where code = 'CIV'),
  'Alemania', 'Costa de Marfil', 'E', 'group',
  '2026-06-20T20:00:00Z', 'BMO Field, Toronto'
),
(
  (select id from public.teams where code = 'ECU'),
  (select id from public.teams where code = 'CUW'),
  'Ecuador', 'Curazao', 'E', 'group',
  '2026-06-21T00:00:00Z', 'Arrowhead Stadium, Kansas City'
),

-- MD3 · 25 jun (simultáneos)
(
  (select id from public.teams where code = 'ECU'),
  (select id from public.teams where code = 'GER'),
  'Ecuador', 'Alemania', 'E', 'group',
  '2026-06-25T20:00:00Z', 'MetLife Stadium, Nueva Jersey'
),
(
  (select id from public.teams where code = 'CUW'),
  (select id from public.teams where code = 'CIV'),
  'Curazao', 'Costa de Marfil', 'E', 'group',
  '2026-06-25T20:00:00Z', 'Lincoln Financial Field, Filadelfia'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO F  NED · JPN · SWE · TUN
-- ════════════════════════════════════════════════════════════

-- MD1 · 14-15 jun
(
  (select id from public.teams where code = 'NED'),
  (select id from public.teams where code = 'JPN'),
  'Países Bajos', 'Japón', 'F', 'group',
  '2026-06-14T20:00:00Z', 'AT&T Stadium, Dallas'
),
(
  (select id from public.teams where code = 'SWE'),
  (select id from public.teams where code = 'TUN'),
  'Suecia', 'Túnez', 'F', 'group',
  '2026-06-15T02:00:00Z', 'Estadio BBVA, Monterrey'
),

-- MD2 · 20 jun
(
  (select id from public.teams where code = 'TUN'),
  (select id from public.teams where code = 'JPN'),
  'Túnez', 'Japón', 'F', 'group',
  '2026-06-20T04:00:00Z', 'Estadio BBVA, Monterrey'
),
(
  (select id from public.teams where code = 'NED'),
  (select id from public.teams where code = 'SWE'),
  'Países Bajos', 'Suecia', 'F', 'group',
  '2026-06-20T17:00:00Z', 'NRG Stadium, Houston'
),

-- MD3 · 25 jun (simultáneos)
(
  (select id from public.teams where code = 'JPN'),
  (select id from public.teams where code = 'SWE'),
  'Japón', 'Suecia', 'F', 'group',
  '2026-06-25T23:00:00Z', 'AT&T Stadium, Dallas'
),
(
  (select id from public.teams where code = 'TUN'),
  (select id from public.teams where code = 'NED'),
  'Túnez', 'Países Bajos', 'F', 'group',
  '2026-06-25T23:00:00Z', 'Arrowhead Stadium, Kansas City'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO G  BEL · EGY · IRN · NZL
-- ════════════════════════════════════════════════════════════

-- MD1 · 15-16 jun
(
  (select id from public.teams where code = 'BEL'),
  (select id from public.teams where code = 'EGY'),
  'Bélgica', 'Egipto', 'G', 'group',
  '2026-06-15T19:00:00Z', 'BC Place, Vancouver'
),
(
  (select id from public.teams where code = 'IRN'),
  (select id from public.teams where code = 'NZL'),
  'Irán', 'Nueva Zelanda', 'G', 'group',
  '2026-06-16T01:00:00Z', 'SoFi Stadium, Los Ángeles'
),

-- MD2 · 21-22 jun
(
  (select id from public.teams where code = 'BEL'),
  (select id from public.teams where code = 'IRN'),
  'Bélgica', 'Irán', 'G', 'group',
  '2026-06-21T19:00:00Z', 'SoFi Stadium, Los Ángeles'
),
(
  (select id from public.teams where code = 'NZL'),
  (select id from public.teams where code = 'EGY'),
  'Nueva Zelanda', 'Egipto', 'G', 'group',
  '2026-06-22T01:00:00Z', 'BC Place, Vancouver'
),

-- MD3 · 26-27 jun (simultáneos)
(
  (select id from public.teams where code = 'EGY'),
  (select id from public.teams where code = 'IRN'),
  'Egipto', 'Irán', 'G', 'group',
  '2026-06-27T03:00:00Z', 'Lumen Field, Seattle'
),
(
  (select id from public.teams where code = 'NZL'),
  (select id from public.teams where code = 'BEL'),
  'Nueva Zelanda', 'Bélgica', 'G', 'group',
  '2026-06-27T03:00:00Z', 'BC Place, Vancouver'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO H  ESP · CPV · KSA · URU
-- ════════════════════════════════════════════════════════════

-- MD1 · 15 jun
(
  (select id from public.teams where code = 'ESP'),
  (select id from public.teams where code = 'CPV'),
  'España', 'Cabo Verde', 'H', 'group',
  '2026-06-15T16:00:00Z', 'Mercedes-Benz Stadium, Atlanta'
),
(
  (select id from public.teams where code = 'KSA'),
  (select id from public.teams where code = 'URU'),
  'Arabia Saudita', 'Uruguay', 'H', 'group',
  '2026-06-15T22:00:00Z', 'Hard Rock Stadium, Miami'
),

-- MD2 · 21 jun
(
  (select id from public.teams where code = 'ESP'),
  (select id from public.teams where code = 'KSA'),
  'España', 'Arabia Saudita', 'H', 'group',
  '2026-06-21T16:00:00Z', 'Mercedes-Benz Stadium, Atlanta'
),
(
  (select id from public.teams where code = 'URU'),
  (select id from public.teams where code = 'CPV'),
  'Uruguay', 'Cabo Verde', 'H', 'group',
  '2026-06-21T22:00:00Z', 'Hard Rock Stadium, Miami'
),

-- MD3 · 26-27 jun (simultáneos)
(
  (select id from public.teams where code = 'CPV'),
  (select id from public.teams where code = 'KSA'),
  'Cabo Verde', 'Arabia Saudita', 'H', 'group',
  '2026-06-27T00:00:00Z', 'NRG Stadium, Houston'
),
(
  (select id from public.teams where code = 'URU'),
  (select id from public.teams where code = 'ESP'),
  'Uruguay', 'España', 'H', 'group',
  '2026-06-27T00:00:00Z', 'Estadio Akron, Guadalajara'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO I  FRA · SEN · IRQ · NOR
-- ════════════════════════════════════════════════════════════

-- MD1 · 16 jun
(
  (select id from public.teams where code = 'FRA'),
  (select id from public.teams where code = 'SEN'),
  'Francia', 'Senegal', 'I', 'group',
  '2026-06-16T19:00:00Z', 'MetLife Stadium, Nueva Jersey'
),
(
  (select id from public.teams where code = 'IRQ'),
  (select id from public.teams where code = 'NOR'),
  'Iraq', 'Noruega', 'I', 'group',
  '2026-06-16T22:00:00Z', 'Gillette Stadium, Boston'
),

-- MD2 · 22-23 jun
(
  (select id from public.teams where code = 'FRA'),
  (select id from public.teams where code = 'IRQ'),
  'Francia', 'Iraq', 'I', 'group',
  '2026-06-22T21:00:00Z', 'Lincoln Financial Field, Filadelfia'
),
(
  (select id from public.teams where code = 'NOR'),
  (select id from public.teams where code = 'SEN'),
  'Noruega', 'Senegal', 'I', 'group',
  '2026-06-23T00:00:00Z', 'MetLife Stadium, Nueva Jersey'
),

-- MD3 · 26 jun (simultáneos)
(
  (select id from public.teams where code = 'NOR'),
  (select id from public.teams where code = 'FRA'),
  'Noruega', 'Francia', 'I', 'group',
  '2026-06-26T19:00:00Z', 'Gillette Stadium, Boston'
),
(
  (select id from public.teams where code = 'SEN'),
  (select id from public.teams where code = 'IRQ'),
  'Senegal', 'Iraq', 'I', 'group',
  '2026-06-26T19:00:00Z', 'BMO Field, Toronto'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO J  ARG · ALG · AUT · JOR
-- ════════════════════════════════════════════════════════════

-- MD1 · 16-17 jun
(
  (select id from public.teams where code = 'ARG'),
  (select id from public.teams where code = 'ALG'),
  'Argentina', 'Argelia', 'J', 'group',
  '2026-06-17T01:00:00Z', 'Arrowhead Stadium, Kansas City'
),
(
  (select id from public.teams where code = 'AUT'),
  (select id from public.teams where code = 'JOR'),
  'Austria', 'Jordania', 'J', 'group',
  '2026-06-17T04:00:00Z', 'Levi''s Stadium, Santa Clara'
),

-- MD2 · 22-23 jun
(
  (select id from public.teams where code = 'ARG'),
  (select id from public.teams where code = 'AUT'),
  'Argentina', 'Austria', 'J', 'group',
  '2026-06-22T17:00:00Z', 'AT&T Stadium, Dallas'
),
(
  (select id from public.teams where code = 'JOR'),
  (select id from public.teams where code = 'ALG'),
  'Jordania', 'Argelia', 'J', 'group',
  '2026-06-23T03:00:00Z', 'Levi''s Stadium, Santa Clara'
),

-- MD3 · 27-28 jun (simultáneos)
(
  (select id from public.teams where code = 'ALG'),
  (select id from public.teams where code = 'AUT'),
  'Argelia', 'Austria', 'J', 'group',
  '2026-06-28T02:00:00Z', 'Arrowhead Stadium, Kansas City'
),
(
  (select id from public.teams where code = 'JOR'),
  (select id from public.teams where code = 'ARG'),
  'Jordania', 'Argentina', 'J', 'group',
  '2026-06-28T02:00:00Z', 'AT&T Stadium, Dallas'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO K  POR · COD · UZB · COL
-- ════════════════════════════════════════════════════════════

-- MD1 · 17-18 jun
(
  (select id from public.teams where code = 'POR'),
  (select id from public.teams where code = 'COD'),
  'Portugal', 'Congo (RD)', 'K', 'group',
  '2026-06-17T17:00:00Z', 'NRG Stadium, Houston'
),
(
  (select id from public.teams where code = 'UZB'),
  (select id from public.teams where code = 'COL'),
  'Uzbekistán', 'Colombia', 'K', 'group',
  '2026-06-18T02:00:00Z', 'Estadio Azteca, Ciudad de México'
),

-- MD2 · 23-24 jun
(
  (select id from public.teams where code = 'POR'),
  (select id from public.teams where code = 'UZB'),
  'Portugal', 'Uzbekistán', 'K', 'group',
  '2026-06-23T17:00:00Z', 'NRG Stadium, Houston'
),
(
  (select id from public.teams where code = 'COL'),
  (select id from public.teams where code = 'COD'),
  'Colombia', 'Congo (RD)', 'K', 'group',
  '2026-06-24T02:00:00Z', 'Estadio Akron, Guadalajara'
),

-- MD3 · 27 jun (simultáneos)
(
  (select id from public.teams where code = 'COL'),
  (select id from public.teams where code = 'POR'),
  'Colombia', 'Portugal', 'K', 'group',
  '2026-06-27T23:30:00Z', 'Hard Rock Stadium, Miami'
),
(
  (select id from public.teams where code = 'COD'),
  (select id from public.teams where code = 'UZB'),
  'Congo (RD)', 'Uzbekistán', 'K', 'group',
  '2026-06-27T23:30:00Z', 'Mercedes-Benz Stadium, Atlanta'
),

-- ════════════════════════════════════════════════════════════
-- GRUPO L  ENG · CRO · GHA · PAN
-- ════════════════════════════════════════════════════════════

-- MD1 · 17 jun
(
  (select id from public.teams where code = 'ENG'),
  (select id from public.teams where code = 'CRO'),
  'Inglaterra', 'Croacia', 'L', 'group',
  '2026-06-17T20:00:00Z', 'AT&T Stadium, Dallas'
),
(
  (select id from public.teams where code = 'GHA'),
  (select id from public.teams where code = 'PAN'),
  'Ghana', 'Panamá', 'L', 'group',
  '2026-06-17T23:00:00Z', 'BMO Field, Toronto'
),

-- MD2 · 23 jun
(
  (select id from public.teams where code = 'ENG'),
  (select id from public.teams where code = 'GHA'),
  'Inglaterra', 'Ghana', 'L', 'group',
  '2026-06-23T20:00:00Z', 'Gillette Stadium, Boston'
),
(
  (select id from public.teams where code = 'PAN'),
  (select id from public.teams where code = 'CRO'),
  'Panamá', 'Croacia', 'L', 'group',
  '2026-06-23T23:00:00Z', 'BMO Field, Toronto'
),

-- MD3 · 27 jun (simultáneos)
(
  (select id from public.teams where code = 'PAN'),
  (select id from public.teams where code = 'ENG'),
  'Panamá', 'Inglaterra', 'L', 'group',
  '2026-06-27T21:00:00Z', 'MetLife Stadium, Nueva Jersey'
),
(
  (select id from public.teams where code = 'CRO'),
  (select id from public.teams where code = 'GHA'),
  'Croacia', 'Ghana', 'L', 'group',
  '2026-06-27T21:00:00Z', 'Lincoln Financial Field, Filadelfia'
);
