-- Datos de ejemplo facilitados por el profesor. Crear en una base vacía.
CREATE TABLE sede (
  CodSede  INT PRIMARY KEY,
  NomSede  VARCHAR(40) NOT NULL,
  Ciudad   VARCHAR(30) NOT NULL
);

CREATE TABLE profesor (
  CodProf   INT PRIMARY KEY,
  NomProf   VARCHAR(40) NOT NULL,
  CodSede   INT NULL,
  CodMentor INT NULL,
  FOREIGN KEY (CodSede)   REFERENCES sede(CodSede),
  FOREIGN KEY (CodMentor) REFERENCES profesor(CodProf)
);

CREATE TABLE curso (
  CodCurso INT PRIMARY KEY,
  NomCurso VARCHAR(40) NOT NULL,
  Nivel    CHAR(2) NOT NULL,
  Precio   DECIMAL(6,2) NOT NULL,
  CodProf  INT NULL,
  FOREIGN KEY (CodProf) REFERENCES profesor(CodProf)
);

CREATE TABLE alumno (
  CodAlu INT PRIMARY KEY,
  NomAlu VARCHAR(40) NOT NULL,
  Ciudad VARCHAR(30) NOT NULL
);

CREATE TABLE matricula (
  CodAlu   INT,
  CodCurso INT,
  Nota     DECIMAL(4,2) NULL,
  PRIMARY KEY (CodAlu, CodCurso),
  FOREIGN KEY (CodAlu)   REFERENCES alumno(CodAlu),
  FOREIGN KEY (CodCurso) REFERENCES curso(CodCurso)
);

INSERT INTO sede VALUES
 (1, 'Málaga Centro', 'Málaga'),
 (2, 'Sevilla Triana', 'Sevilla'),
 (3, 'Granada Albaicín', 'Granada');

INSERT INTO profesor VALUES
 (1, 'Elena',  1,    NULL),
 (3, 'Rocío',  2,    NULL),
 (2, 'Javier', 1,    1),
 (4, 'Tomás',  2,    3),
 (5, 'Irene',  NULL, 1),
 (6, 'Andrés', 1,    3);

INSERT INTO curso VALUES
 (101, 'Inglés B1',    'B1', 120.00, 1),
 (102, 'Inglés B2',    'B2', 150.00, 1),
 (103, 'Francés A1',   'A1',  90.00, 3),
 (104, 'Alemán A2',    'A2', 110.00, 4),
 (105, 'Italiano A1',  'A1',  95.00, NULL),
 (106, 'Inglés C1',    'C1', 180.00, 2),
 (107, 'Portugués A1', 'A1',  85.00, 5);

INSERT INTO alumno VALUES
 (1, 'Lucía',  'Málaga'),
 (2, 'Carlos', 'Sevilla'),
 (3, 'Nuria',  'Málaga'),
 (4, 'Sergio', 'Córdoba'),
 (5, 'Paula',  'Sevilla'),
 (6, 'Hugo',   'Granada'),
 (7, 'Marina', 'Málaga');

INSERT INTO matricula VALUES
 (1, 101, 7.50), (1, 103, 9.00),
 (2, 102, 6.00), (2, 104, 8.50),
 (3, 101, 4.00), (3, 106, 9.50),
 (4, 103, NULL), (4, 105, 5.00),
 (5, 102, 8.00), (5, 104, 9.00);
