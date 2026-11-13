const ACTIVITY = {
  id: "joins",
  storageKey: "protocolo-joins-v1",
  version: 1,
  title: "Protocolo JOIN",
  edition: "Academia · Laboratorio de SQL",
  minutes: 50,
  heading:
    "Las tablas están<br>separadas.<br><span>Tú creas la conexión.</span>",
  description:
    "Cinco minijuegos para recuperar los datos de la academia. Predice resultados, detecta trampas y escribe consultas SQL que se ejecutan de verdad.",
  art: "../assets/joins-console.svg",
  artAlt:
    "Tablas de cursos, profesores y sedes conectadas por un JOIN, con una fila sin pareja y un resultado SQL",
  learning:
    "Explora los datos de la academia, ejecuta tus SELECT y aprende a conservar las filas correctas. 10 retos de SQL y 10 de interpretación.",
  caseTag: "Academia · JOIN y conjuntos",
  legend:
    "PK identifica la fila; FK referencia otra tabla. NULL representa ausencia o dato desconocido. Los valores y las repeticiones importan.",
  reportSubtitle: "Informe individual - SQL JOIN: academia",
  reportTopic: "INNER, OUTER, SELF, antijoin, agregación y conjuntos",
  filePrefix: "Informe_JOIN",
};
const ACADEMIA_PLAN = {
  src: "../assets/diagrams/academia.svg",
  title: "Mapa de relaciones de academia",
  description:
    "sede: CodSede PK, NomSede, Ciudad. profesor: CodProf PK, NomProf, CodSede FK nullable a sede, CodMentor FK nullable a profesor. curso: CodCurso PK, NomCurso, Nivel, Precio, CodProf FK nullable a profesor. alumno: CodAlu PK, NomAlu, Ciudad. matricula: PK conjunta CodAlu y CodCurso, ambas FK, y Nota nullable. La tabla matricula enlaza alumnos y cursos. Un profesor puede no tener sede o mentor; un curso puede no tener profesor. Los registros exactos pueden consultarse en el explorador de tablas.",
};
const ROOMS = [
  {
    id: "parejas",
    name: "El emparejador",
    topic: "INNER, USING, NATURAL y CROSS",
    icon: "⋈",
    color: "#80d9cb",
    key: "J",
    story:
      "La academia ha separado sus tablas. Reconstruye las primeras parejas y distingue una unión útil de una coincidencia accidental.",
    context:
      "Trabaja con los registros reales del explorador. Hay 6 profesores, 3 sedes y 7 cursos. Irene no tiene sede; Granada no tiene profesores. No confundas contar filas con contar nombres distintos.",
    diagrams: [ACADEMIA_PLAN],
    questions: [
      {
        id: "j1",
        type: "match",
        title: "El contador de parejas",
        prompt:
          "Une profesor p con sede s por p.CodSede = s.CodSede. Predice el número de filas; en LEFT el profesor está a la izquierda y en RIGHT la sede está a la derecha.",
        rows: [
          "INNER JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "FULL OUTER JOIN conceptual",
          "CROSS JOIN sin condición",
        ],
        options: ["5", "6", "7", "12", "18"],
        answer: ["5", "6", "6", "7", "18"],
        hint: "Hay 5 parejas reales. Irene solo se conserva en el lado profesor; la sede vacía solo se conserva en el lado sede. CROSS multiplica tamaños.",
        explanation:
          "INNER produce 5 filas; LEFT añade Irene y da 6; RIGHT añade Granada y da 6; FULL añade ambas y da 7; CROSS produce 6 × 3 = 18.",
        source: "Apuntes JOIN, §§ 4–10; ejemplo academia, bloque B.",
      },
      {
        id: "j2",
        type: "sql",
        title: "Conecta cada curso con su docente",
        prompt:
          "Escribe una consulta que muestre NomCurso y NomProf, en ese orden, solo para cursos que tengan profesor. Ordena por CodCurso ascendente.",
        ordered: true,
        starter:
          "SELECT c.NomCurso, p.NomProf\nFROM curso c\n-- Añade la unión y el orden",
        answer:
          "SELECT c.NomCurso, p.NomProf\nFROM curso c\nINNER JOIN profesor p ON c.CodProf = p.CodProf\nORDER BY c.CodCurso;",
        hint: "La FK curso.CodProf referencia profesor.CodProf. Una unión interna deja fuera al curso sin profesor.",
        explanation:
          "Se obtienen 6 filas. Italiano A1 tiene CodProf NULL y queda fuera. Inglés B1 e Inglés B2 comparten profesora sin que eso elimine ninguna fila.",
        source: "Apuntes JOIN, §§ 4 y 6; academia, bloque A.",
      },
      {
        id: "j3",
        title: "El atajo que no siempre sirve",
        prompt:
          "JOIN profesor USING (CodProf) sirve entre curso y profesor. ¿Por qué USING (CodMentor) no sustituye la condición p.CodMentor = mentor.CodProf?",
        options: [
          "USING exige que ambas columnas sean claves primarias",
          "USING solo funciona en un LEFT JOIN",
          "USING compara columnas homónimas; aquí los papeles se enlazan por nombres de columna distintos",
          "USING elimina todas las filas con datos repetidos",
        ],
        answer:
          "USING compara columnas homónimas; aquí los papeles se enlazan por nombres de columna distintos",
        hint: "USING no permite escribir un nombre diferente para cada lado de la igualdad.",
        explanation:
          "USING (CodProf) abrevia una igualdad entre columnas llamadas CodProf. En la autorrelación se compara CodMentor con CodProf: se necesita ON con alias distintos.",
        source: "Apuntes JOIN, §§ 6 y 13; academia, bloque A.",
      },
      {
        id: "j4",
        title: "Una unión demasiado automática",
        prompt:
          "¿Qué ocurre con SELECT * FROM alumno NATURAL JOIN sede usando el esquema actual?",
        options: [
          "Devuelve las 10 matrículas de la academia",
          "Compara Ciudad y devuelve 6 filas, aunque no representa una matrícula ni una adscripción a sede",
          "Relaciona CodAlu con CodSede y devuelve 3 filas",
          "No se puede unir porque las PK tienen nombres diferentes",
        ],
        answer:
          "Compara Ciudad y devuelve 6 filas, aunque no representa una matrícula ni una adscripción a sede",
        hint: "Busca todas las columnas con el mismo nombre. Sergio vive en una ciudad sin sede.",
        explanation:
          "Solo comparten Ciudad. Coinciden 3 alumnos de Málaga, 2 de Sevilla y Hugo de Granada: 6 filas. Añadir otra columna homónima cambiaría la condición del NATURAL JOIN.",
        source: "Apuntes JOIN, § 7; academia, bloque F.",
      },
    ],
  },
  {
    id: "conservar",
    name: "El rescate de filas",
    topic: "LEFT JOIN y ON frente a WHERE",
    icon: "⊕",
    color: "#8ebdff",
    key: "O",
    story:
      "Algunas filas han desaparecido de los informes. Conserva los cursos y alumnos adecuados sin convertir accidentalmente una unión externa en interna.",
    context:
      "Elena imparte dos cursos; Italiano A1 no tiene profesor. Hugo y Marina no tienen matrícula. Sergio sí tiene matrículas, pero una de sus notas es NULL. Ejecutar una consulta muestra su resultado, sin revelar todavía si cumple el objetivo.",
    diagrams: [],
    questions: [
      {
        id: "j5",
        type: "sql",
        title: "Ningún curso se queda fuera",
        prompt:
          "Muestra NomCurso y NomProf, en ese orden, para todos los cursos, aunque no tengan profesor. Ordena por CodCurso ascendente.",
        ordered: true,
        starter:
          "SELECT c.NomCurso, p.NomProf\nFROM curso c\n-- Conserva también los cursos sin docente",
        answer:
          "SELECT c.NomCurso, p.NomProf\nFROM curso c\nLEFT JOIN profesor p ON c.CodProf = p.CodProf\nORDER BY c.CodCurso;",
        hint: "La tabla que debes conservar es curso. El docente es el lado opcional.",
        explanation:
          "Salen 7 filas, incluida Italiano A1 con NomProf NULL. El LEFT conserva todas las filas de curso, no solo las que no encuentran pareja.",
        source: "Apuntes JOIN, § 8; academia, bloque B.",
      },
      {
        id: "j6",
        title: "El filtro cambia la misión",
        prompt:
          "Compara alumno LEFT JOIN matricula: A añade m.Nota >= 8 al ON; B lo añade al WHERE. ¿Cuántas filas devuelve cada consulta, seleccionando nombre, curso y nota sin DISTINCT?",
        options: [
          "A devuelve 7 y B devuelve 7",
          "A devuelve 5 y B devuelve 8",
          "A devuelve 8 y B devuelve 5",
          "A devuelve 12 y B devuelve 10",
        ],
        answer: "A devuelve 8 y B devuelve 5",
        hint: "Paula tiene dos notas que cumplen. A conserva también a Sergio, Hugo y Marina con columnas de matrícula NULL; B los descarta.",
        explanation:
          "A devuelve 5 matrículas que cumplen más una fila para cada uno de los 3 alumnos sin nota >= 8: 8 filas. B conserva solo las 5 matrículas que superan el filtro.",
        source: "Apuntes JOIN, § 15; academia, bloque E.",
      },
      {
        id: "j7",
        type: "sql",
        title: "Rescata alumnos con y sin nota alta",
        prompt:
          "Muestra NomAlu, NomCurso y Nota, en ese orden, para TODOS los alumnos y solo sus matrículas con Nota >= 8. Quien no tenga una debe aparecer con curso y nota NULL. No uses DISTINCT. No se exige un orden concreto.",
        starter:
          "SELECT a.NomAlu, c.NomCurso, m.Nota\nFROM alumno a\n-- Encadena las uniones sin perder alumnos",
        answer:
          "SELECT a.NomAlu, c.NomCurso, m.Nota\nFROM alumno a\nLEFT JOIN matricula m ON a.CodAlu = m.CodAlu AND m.Nota >= 8\nLEFT JOIN curso c ON m.CodCurso = c.CodCurso;",
        hint: "El filtro de la tabla opcional debe formar parte de ON. La unión posterior con curso también debe conservar las filas sin matrícula seleccionada.",
        explanation:
          "El primer LEFT limita las parejas sin descartar alumnos; el segundo LEFT conserva esas filas al buscar el curso. Aparecen 8 filas, incluidas las dos de Paula.",
        source: "Apuntes JOIN, §§ 14–15; academia, bloques B y E.",
      },
      {
        id: "j8",
        title: "La segunda puerta anula la primera",
        prompt:
          "En alumno a LEFT JOIN matricula m ON a.CodAlu=m.CodAlu INNER JOIN curso c ON m.CodCurso=c.CodCurso, ¿por qué no aparecen Hugo y Marina?",
        options: [
          "Porque NULL coincide con todos los cursos",
          "Porque INNER JOIN elimina las filas cuyo m.CodCurso es NULL; hay que conservar también la segunda unión",
          "Porque LEFT JOIN solo devuelve alumnos matriculados",
          "Porque falta DISTINCT para crear las filas ausentes",
        ],
        answer:
          "Porque INNER JOIN elimina las filas cuyo m.CodCurso es NULL; hay que conservar también la segunda unión",
        hint: "Sigue las filas con columnas de matrícula NULL hasta la segunda unión.",
        explanation:
          "El INNER posterior no encuentra curso para esas filas y las elimina. Una cadena alumno LEFT matricula LEFT curso mantiene a los 7 alumnos y produce 12 filas: 10 matrículas y 2 filas sin matrícula.",
        source: "Apuntes JOIN, § 14; academia, bloque B.",
      },
    ],
  },
  {
    id: "ausencias",
    name: "Los registros fantasma",
    topic: "Antijoin, EXISTS y trampas con NULL",
    icon: "∅",
    color: "#ffb587",
    key: "I",
    story:
      "Busca ausencias reales. Un dato desconocido no significa que la relación no exista, y un JOIN puede repetir una sede varias veces.",
    context:
      "Para detectar una fila sin pareja, comprueba una clave no nullable del lado opcional. Para pedir solo que exista una pareja, EXISTS evita multiplicar filas de la tabla principal.",
    diagrams: [],
    questions: [
      {
        id: "j9",
        type: "sql",
        title: "El curso sin alumnos",
        prompt:
          "Recupera CodCurso y NomCurso, en ese orden, de los cursos sin ninguna matrícula. Puedes usar antijoin o NOT EXISTS. No se exige orden.",
        starter:
          "SELECT c.CodCurso, c.NomCurso\nFROM curso c\n-- Busca la ausencia de matrículas",
        answer:
          "SELECT c.CodCurso, c.NomCurso\nFROM curso c\nLEFT JOIN matricula m ON c.CodCurso = m.CodCurso\nWHERE m.CodAlu IS NULL;",
        hint: "No busques Nota IS NULL: una matrícula existente puede tener nota pendiente. Comprueba una columna de la PK de matricula.",
        explanation:
          "Solo aparece 107, Portugués A1. Italiano A1 no tiene profesor, pero sí una matrícula de Sergio: son ausencias diferentes.",
        source: "Apuntes JOIN, § 11; academia, bloque C.",
      },
      {
        id: "j10",
        title: "La falsa ausencia",
        prompt:
          "¿Qué devuelve SELECT a.NomAlu FROM alumno a LEFT JOIN matricula m ON a.CodAlu=m.CodAlu WHERE m.Nota IS NULL?",
        options: [
          "Solo Hugo y Marina, porque no tienen matrícula",
          "Ningún alumno, porque una nota nunca es NULL",
          "Sergio, Hugo y Marina: mezcla una nota pendiente con dos ausencias de matrícula",
          "Todos los alumnos con alguna nota inferior a 5",
        ],
        answer:
          "Sergio, Hugo y Marina: mezcla una nota pendiente con dos ausencias de matrícula",
        hint: "Sergio tiene una matrícula en Francés A1 cuya nota es NULL. Su fila existe.",
        explanation:
          "Nota es nullable en una coincidencia. Para alumnos sin matrícula se comprueba m.CodAlu IS NULL o se utiliza NOT EXISTS, obteniendo únicamente Hugo y Marina.",
        source: "Apuntes JOIN, §§ 11 y 17; academia, bloque C.",
      },
      {
        id: "j11",
        type: "sql",
        title: "Una sede, una sola vez",
        prompt:
          "Devuelve CodSede y NomSede, en ese orden, de las sedes que tienen al menos un profesor, sin repetir ninguna sede. Se acepta EXISTS o un JOIN correctamente deduplicado. No se exige orden.",
        starter:
          "SELECT s.CodSede, s.NomSede\nFROM sede s\n-- Comprueba si existe al menos un profesor",
        answer:
          "SELECT s.CodSede, s.NomSede\nFROM sede s\nWHERE EXISTS (SELECT 1 FROM profesor p WHERE p.CodSede = s.CodSede);",
        hint: "Necesitas saber si hay alguna pareja, no devolver una fila por cada profesor de esa sede.",
        explanation:
          "Se obtienen Málaga Centro y Sevilla Triana una vez cada una. Un INNER JOIN sin DISTINCT devuelve 5 filas por las distintas parejas profesor–sede.",
        source: "Apuntes JOIN, § 12; academia, bloque C.",
      },
      {
        id: "j12",
        title: "El NULL que contamina NOT IN",
        prompt:
          "Para buscar profesores sin cursos, se usa p.CodProf NOT IN (SELECT CodProf FROM curso). La subconsulta incluye el NULL de Italiano A1. ¿Qué sucede?",
        options: [
          "Sale Andrés, y el NULL no influye",
          "Salen todos los profesores con mentor",
          "Sale únicamente Irene, porque no tiene sede",
          "No sale ningún profesor; NOT EXISTS evita esa trampa y encontraría a Andrés",
        ],
        answer:
          "No sale ningún profesor; NOT EXISTS evita esa trampa y encontraría a Andrés",
        hint: "Si no hay coincidencia con los códigos conocidos, la comparación con NULL sigue siendo desconocida, no verdadera.",
        explanation:
          "Los profesores con cursos quedan descartados; para Andrés la condición resulta desconocida por el NULL. WHERE no conserva UNKNOWN. NOT EXISTS correlacionado devuelve a Andrés.",
        source: "Apuntes JOIN, § 17; academia, bloque C.",
      },
    ],
  },
  {
    id: "mentores",
    name: "El espejo y el contador",
    topic: "SELF JOIN y agregación externa",
    icon: "↔",
    color: "#b7a0ff",
    key: "N",
    story:
      "La misma tabla representa profesores y mentores. Después, contarás matrículas sin convertir los cursos vacíos en un alumno imaginario.",
    context:
      "profesor.CodMentor referencia profesor.CodProf. Dos alias distinguen los papeles. Irene no tiene sede. Para contar matrículas, una PK del lado opcional distingue las coincidencias de las filas rellenadas con NULL.",
    diagrams: [],
    questions: [
      {
        id: "j13",
        type: "sql",
        title: "Encuentra cada mentor",
        prompt:
          "Muestra NomProf y el nombre de su mentor, en ese orden, para todos los profesores. Quien no tenga mentor debe aparecer con NULL en la segunda columna. Ordena por el CodProf del profesor ascendente.",
        ordered: true,
        starter:
          "SELECT p.NomProf, mentor.NomProf AS Mentor\nFROM profesor p\n-- Une profesor otra vez, con un alias diferente",
        answer:
          "SELECT p.NomProf, mentor.NomProf AS Mentor\nFROM profesor p\nLEFT JOIN profesor mentor ON p.CodMentor = mentor.CodProf\nORDER BY p.CodProf;",
        hint: "CodMentor del profesor apunta al CodProf del mentor. Usa LEFT para conservar a Elena y Rocío.",
        explanation:
          "Salen 6 filas. Elena y Rocío tienen mentor NULL; Javier e Irene tienen a Elena; Tomás y Andrés tienen a Rocío. No existe una palabra clave SELF JOIN: es un patrón con alias.",
        source: "Apuntes JOIN, § 13; academia, bloque D.",
      },
      {
        id: "j14",
        title: "Una sede desconocida no es una sede distinta",
        prompt:
          "Tras unir cada profesor con su mentor, se filtra p.CodSede <> mentor.CodSede. ¿Qué profesor cumple y por qué no aparece Irene?",
        options: [
          "Solo Andrés; comparar la sede NULL de Irene produce UNKNOWN",
          "Andrés e Irene, porque NULL es distinto de cualquier número",
          "Solo Tomás, porque su mentor tiene otro código de profesor",
          "Ninguno, porque el mentor debe trabajar en la misma sede",
        ],
        answer: "Solo Andrés; comparar la sede NULL de Irene produce UNKNOWN",
        hint: "Andrés trabaja en la sede 1 y Rocío en la 2. La ausencia de sede de Irene no equivale a un código diferente.",
        explanation:
          "Andrés cumple 1 <> 2. Para Irene, NULL <> 1 no es TRUE. Si el objetivo incluyera sedes desconocidas, habría que expresarlo como otra condición del negocio.",
        source: "Apuntes JOIN, §§ 13 y 17; academia, bloque D.",
      },
      {
        id: "j15",
        type: "sql",
        title: "Cuenta también los ceros",
        prompt:
          "Muestra CodCurso, NomCurso y el número de alumnos matriculados, en ese orden, para cada curso, incluidos los que tienen 0. Ordena por CodCurso ascendente. Cuenta las matrículas existentes, no las filas vacías del LEFT.",
        ordered: true,
        starter:
          "SELECT c.CodCurso, c.NomCurso,\n       -- Añade el conteo\nFROM curso c\n-- Conserva y agrupa todos los cursos",
        answer:
          "SELECT c.CodCurso, c.NomCurso, COUNT(m.CodAlu) AS NumAlumnos\nFROM curso c\nLEFT JOIN matricula m ON c.CodCurso = m.CodCurso\nGROUP BY c.CodCurso, c.NomCurso\nORDER BY c.CodCurso;",
        hint: "COUNT de una columna no nullable en coincidencias ignora el NULL que representa la ausencia de matrícula.",
        explanation:
          "Los conteos por CodCurso son 2, 2, 2, 2, 1, 1 y 0. COUNT(m.CodAlu) distingue las 10 matrículas reales de la fila externa de Portugués A1.",
        source: "Apuntes JOIN, § 18; academia, bloque E.",
      },
      {
        id: "j16",
        title: "El alumno que COUNT(*) inventa",
        prompt:
          "En curso LEFT JOIN matricula, agrupando por curso, ¿qué valores obtiene Portugués A1 con COUNT(*) y COUNT(m.CodAlu)?",
        options: ["0 y 0", "1 y 1", "1 y 0", "0 y 1"],
        answer: "1 y 0",
        hint: "Aunque no hay matrícula, LEFT conserva una fila con todas las columnas de matricula a NULL.",
        explanation:
          "COUNT(*) cuenta esa fila conservada y da 1. COUNT(m.CodAlu) ignora el valor NULL y da 0, que es el número correcto de alumnos.",
        source: "Apuntes JOIN, § 18; academia, bloque E.",
      },
    ],
  },
  {
    id: "conjuntos",
    name: "El combinador final",
    topic: "UNION, FULL y productos cartesianos",
    icon: "∪",
    color: "#eea1d3",
    key: "!",
    story:
      "La academia necesita ciudades únicas, una unión que conserve ambos lados y todas las combinaciones de sede y nivel. Conserva las multiplicidades correctas.",
    context:
      "JOIN empareja filas; UNION combina resultados compatibles. En MariaDB se simula FULL con una unión externa completa y las filas sin pareja del otro lado. Un UNION ALL de dos uniones completas duplica las coincidencias. Nivel tiene 5 valores distintos.",
    diagrams: [],
    questions: [
      {
        id: "j17",
        type: "sql",
        title: "El mapa de ciudades",
        prompt:
          "Devuelve una única columna Ciudad con todas las ciudades de sede o de alumno, sin duplicados. Ordena alfabéticamente por Ciudad ascendente.",
        ordered: true,
        starter:
          "SELECT Ciudad FROM sede\n-- Combina con las ciudades de los alumnos",
        answer:
          "SELECT Ciudad FROM sede\nUNION\nSELECT Ciudad FROM alumno\nORDER BY Ciudad;",
        hint: "Añades filas de consultas compatibles. El operador debe eliminar ciudades repetidas, no emparejarlas.",
        explanation:
          "Salen Córdoba, Granada, Málaga y Sevilla. UNION elimina repeticiones; UNION ALL conservaría las 10 filas de origen.",
        source: "Apuntes JOIN, § 20; academia, bloque F.",
      },
      {
        id: "j18",
        type: "sql",
        title: "Rescata ambos lados sin duplicar parejas",
        prompt:
          "Devuelve CodProf, NomProf, CodSede y NomSede, en ese orden: todas las parejas profesor–sede, los profesores sin sede y las sedes sin profesor. Conserva las repeticiones legítimas. Como en la simulación de FULL para MariaDB de los apuntes, puedes combinar LEFT con un antijoin mediante UNION ALL. No se exige orden.",
        starter:
          "SELECT p.CodProf, p.NomProf, s.CodSede, s.NomSede\nFROM profesor p\n-- Conserva también las filas sin pareja de ambos lados",
        answer:
          "SELECT p.CodProf, p.NomProf, s.CodSede, s.NomSede\nFROM profesor p LEFT JOIN sede s ON p.CodSede = s.CodSede\nUNION ALL\nSELECT p.CodProf, p.NomProf, s.CodSede, s.NomSede\nFROM sede s LEFT JOIN profesor p ON p.CodSede = s.CodSede\nWHERE p.CodProf IS NULL;",
        hint: "Las coincidencias ya están en la primera mitad. La segunda solo debe añadir las ausencias del otro lado.",
        explanation:
          "La primera mitad aporta las 5 parejas e Irene; la segunda añade Granada. Son 7 filas. UNION ALL de LEFT y RIGHT completos daría 12 y duplicaría las 5 parejas.",
        source: "Apuntes JOIN, § 21; academia, bloque F.",
      },
      {
        id: "j19",
        type: "match",
        title: "La máquina de multiplicidades",
        prompt:
          "Predice el número de filas de cada resultado con los datos de academia. Cuenta filas, no nombres diferentes.",
        rows: [
          "profesor LEFT sede UNION ALL profesor RIGHT sede, sin filtro anti",
          "FULL conceptual correcto entre profesor y sede",
          "sede CROSS JOIN con los niveles DISTINCT de curso",
          "sede CROSS JOIN curso, sin eliminar niveles repetidos",
        ],
        options: ["4", "7", "10", "12", "15", "18", "21"],
        answer: ["12", "7", "15", "21"],
        hint: "LEFT y RIGHT producen 6 filas cada uno. Hay 3 sedes, 7 cursos y 5 niveles distintos.",
        explanation:
          "6 + 6 = 12 si se concatenan las uniones completas. FULL correcto da 7. Tres sedes por cinco niveles dan 15; tres sedes por siete cursos dan 21.",
        source: "Apuntes JOIN, §§ 5, 20–21; academia, bloque F.",
      },
      {
        id: "j20",
        type: "sql",
        title: "Planifica toda la oferta",
        prompt:
          "Genera CodSede, NomSede y Nivel, en ese orden, para todas las combinaciones de sede y nivel distinto de curso. No repitas niveles dentro de una sede. Ordena por CodSede y después Nivel, ambos ascendentes.",
        ordered: true,
        starter:
          "SELECT s.CodSede, s.NomSede, n.Nivel\nFROM sede s\n-- Combina con una lista de niveles únicos",
        answer:
          "SELECT s.CodSede, s.NomSede, n.Nivel\nFROM sede s\nCROSS JOIN (SELECT DISTINCT Nivel FROM curso) n\nORDER BY s.CodSede, n.Nivel;",
        hint: "Primero obtén los niveles distintos. Después genera todas las parejas con las sedes, no solo las que ya tienen cursos.",
        explanation:
          "Se obtienen 15 combinaciones: 3 sedes × 5 niveles. Granada aparece aunque no tenga profesores, porque aquí se está planificando una oferta posible.",
        source: "Apuntes JOIN, § 5; academia, bloque F.",
      },
    ],
  },
];
function questionScore(question, answer, hintUsed) {
  const correct =
    question.type === "sql"
      ? answer?.correct === true
      : Array.isArray(question.answer)
        ? Array.isArray(answer) &&
          question.answer.length === answer.length &&
          question.answer.every((value, i) => value === answer[i])
        : answer === question.answer;
  return correct ? (hintUsed ? 0.25 : 0.5) : 0;
}
if (typeof module !== "undefined")
  module.exports = { ACTIVITY, ROOMS, questionScore };
