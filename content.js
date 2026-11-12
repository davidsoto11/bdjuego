/* Edición 2: casos prácticos adaptados de los tres PDF del Tema 2. */
const ROOMS = [
  {
    id: 'archivo', name: 'El archivo', topic: 'Entidades débiles e integridad', icon: '▣', color: '#b7a0ff', key: 'D',
    story: 'El archivo conserva un plano de pedidos. No basta con reconocer los símbolos: debes comprobar qué registros admite y cómo se identifican.',
    context: 'Lee las participaciones junto a la entidad de origen: indican cuántas asociaciones puede tener cada ocurrencia de esa entidad. El subrayado continuo identifica; el discontinuo marca un discriminante. Las líneas dobles señalan la entidad débil y su relación identificadora.',
    diagrams: [{ src: 'assets/diagrams/pedidos.svg', title: 'Archivo de pedidos', description: 'CLIENTE, identificado por dni, participa con (0,N) en REALIZAR; PEDIDO, identificado por idPedido, participa con (1,1). PEDIDO participa con (1,N) en CONTENER, dibujada con rombo doble; LINEA_PEDIDO, dibujada con rectángulo doble, participa con (1,1). LINEA_PEDIDO tiene numeroLinea con subrayado discontinuo y cantidad. En CORRESPONDER, LINEA_PEDIDO participa con (1,1) y PRODUCTO con (0,N). PRODUCTO se identifica por codigo y tiene precio.' }],
    questions: [
      { id: 'q1', type: 'match', title: 'Tres piezas, tres funciones', prompt: 'En el plano de pedidos, clasifica estas piezas por su representación y su función de identificación.',
        rows: ['CLIENTE', 'LINEA_PEDIDO', 'numeroLinea dentro de LINEA_PEDIDO'], options: ['Discriminante (identificador parcial)', 'Entidad fuerte', 'Entidad débil'], answer: ['Entidad fuerte', 'Entidad débil', 'Discriminante (identificador parcial)'],
        hint: 'Observa el rectángulo doble y distingue un identificador completo del número que solo diferencia líneas dentro de un pedido.',
        explanation: 'CLIENTE tiene identificación propia. LINEA_PEDIDO depende de PEDIDO. numeroLinea es un discriminante: por sí solo no distingue líneas de pedidos diferentes.', source: 'Apuntes completos, §§ 3, 6 y 8.' },
      { id: 'q2', title: 'Lee la participación en ambos sentidos', prompt: 'Según REALIZAR en el plano, ¿qué combinación es compatible con el modelo?',
        options: ['Un cliente sin pedidos y un pedido sin cliente', 'Ningún cliente puede quedarse sin pedidos', 'Un cliente puede no tener pedidos; cada pedido debe tener un cliente', 'Un pedido puede ser realizado por varios clientes'], answer: 'Un cliente puede no tener pedidos; cada pedido debe tener un cliente',
        hint: 'El mínimo de CLIENTE es 0 y el mínimo de PEDIDO es 1. No intercambies los dos extremos.',
        explanation: 'CLIENTE (0,N) permite clientes sin pedidos. PEDIDO (1,1) obliga a que cada pedido lo realice exactamente un cliente.', source: 'Apuntes completos, § 5; documento original, lectura de participaciones.' },
      { id: 'q3', title: 'Recupera una identidad completa', prompt: 'Existen la línea 1 del pedido P-18 y la línea 1 del pedido P-42. ¿Qué conjunto mínimo identifica cada línea sin añadir un identificador artificial?',
        options: ['numeroLinea + cantidad', 'idPedido + numeroLinea', 'codigoProducto + cantidad', 'Solo idPedido'], answer: 'idPedido + numeroLinea',
        hint: 'Combina el identificador de la entidad propietaria con el discriminante de la entidad débil.',
        explanation: 'El identificador heredado de PEDIDO más numeroLinea distingue la línea dentro de su pedido y entre pedidos. Ni cantidad ni el código del producto sustituyen esa identificación.', source: 'Apuntes completos, §§ 6 y 8.' },
      { id: 'q4', title: 'Localiza el registro imposible', prompt: 'Sin añadir reglas externas, ¿cuál de estas situaciones contradice una cardinalidad del plano?',
        options: ['Un producto que todavía no aparece en ninguna línea', 'Un cliente con dos pedidos', 'El mismo producto en líneas de pedidos diferentes', 'Un pedido que no contiene ninguna línea'], answer: 'Un pedido que no contiene ninguna línea',
        hint: 'Busca un mínimo obligatorio que se incumpla. No confundas que algo sea posible con que sea obligatorio.',
        explanation: 'PEDIDO participa con (1,N) en CONTENER: necesita al menos una línea. PRODUCTO tiene (0,N), así que puede no aparecer o aparecer en varias líneas.', source: 'Apuntes completos, §§ 5 y 8.' }
    ]
  },
  {
    id: 'identidad', name: 'La cámara de identidad', topic: 'Atributos y restricciones del modelo', icon: '◉', color: '#80d9cb', key: 'A',
    story: 'El plano de la empresa mezcla datos personales, identificadores compuestos y horas de trabajo. Sigue cada conexión para decidir qué significa.',
    context: 'En este plano, los atributos subrayados nombre y numero de PROYECTO forman conjuntamente un identificador. No son dos identificadores alternativos. Los atributos conectados a un rombo pertenecen a esa relación.',
    diagrams: [{ src: 'assets/diagrams/empresa.svg', title: 'Personal y proyectos', description: 'EMPLEADO tiene dni subrayado, fnac, edad con elipse discontinua, telefonos con elipse doble y direccion, que se descompone en calle y localidad. TRABAJAR une EMPLEADO (1,1) con DPTO (0,N). DPTO se identifica por nombre. CONTROLAR une DPTO (0,N) con PROYECTO (1,1). DEDICAR une EMPLEADO (0,N) con PROYECTO (1,N); horasSemanales está conectado al rombo DEDICAR. PROYECTO se identifica por el conjunto nombre y numero, ambos subrayados.' }],
    questions: [
      { id: 'q5', type: 'match', title: 'Lee las marcas de los atributos', prompt: 'Clasifica los atributos usando las elipses y sus conexiones en el plano de empresa.',
        rows: ['direccion', 'telefonos', 'edad'], options: ['Derivado', 'Compuesto', 'Multivaluado'], answer: ['Compuesto', 'Multivaluado', 'Derivado'],
        hint: 'Busca la descomposición en otros atributos, la elipse doble y la elipse discontinua.',
        explanation: 'direccion se descompone en calle y localidad: compuesto. telefonos tiene elipse doble: multivaluado. edad tiene elipse discontinua: derivado de fnac.', source: 'Apuntes completos, § 6; presentación, tipos de atributos.' },
      { id: 'q6', title: 'El dato que depende de una pareja', prompt: 'Una empleada dedica 8 horas al proyecto A y 13 al B; otro empleado dedica 4 al A. ¿Qué justifica la posición de horasSemanales en el plano?',
        options: ['El valor lo determina únicamente el proyecto', 'El valor pertenece a cada pareja EMPLEADO–PROYECTO', 'El valor debe repetirse en todos los empleados del departamento', 'El valor es un identificador alternativo de EMPLEADO'], answer: 'El valor pertenece a cada pareja EMPLEADO–PROYECTO',
        hint: 'Comprueba si cambiar solo uno de los participantes puede cambiar las horas.',
        explanation: 'El rombo DEDICAR representa la asociación concreta. Mover horasSemanales a una de las entidades impediría representar correctamente estos valores.', source: 'Apuntes completos, §§ 4, 6 y 13.' },
      { id: 'q7', title: 'La clave que no es única por partes', prompt: 'El identificador conjunto de PROYECTO es nombre + numero. ¿Qué registros pueden coexistir según ese identificador?',
        options: ['Dos proyectos con nombre Atlas y numero 7', 'Dos proyectos sin numero si tienen distinto nombre', 'Atlas/7 y Atlas/8', 'Solo un proyecto llamado Atlas, independientemente del numero'], answer: 'Atlas/7 y Atlas/8',
        hint: 'La unicidad se exige a la combinación completa, no necesariamente a cada componente por separado.',
        explanation: 'Atlas/7 y Atlas/8 tienen identificadores conjuntos distintos. Repetir Atlas/7 duplicaría la clave, y omitir numero dejaría incompleto el identificador.', source: 'Apuntes completos, § 6.' },
      { id: 'q8', title: 'Encuentra la regla que falta', prompt: 'Una empleada TRABAJA en el departamento A y se DEDICA a un proyecto CONTROLADO por B. La empresa quiere prohibirlo. ¿Lo impide ya el plano?',
        options: ['Sí, porque cada proyecto tiene un departamento', 'Sí, porque TRABAJAR tiene máximo 1 en EMPLEADO', 'No; basta con convertir edad en un atributo obligatorio', 'No; falta documentar una restricción que iguale ambos departamentos'], answer: 'No; falta documentar una restricción que iguale ambos departamentos',
        hint: 'Las cardinalidades de cada relación no comparan por sí solas los departamentos alcanzados por dos caminos distintos.',
        explanation: 'TRABAJAR, DEDICAR y CONTROLAR no obligan a que ambos caminos conduzcan al mismo DPTO. Es una restricción adicional por pérdida expresiva, como en los apuntes.', source: 'Apuntes completos, §§ 9 y 13.' }
    ]
  },
  {
    id: 'conexiones', name: 'El panel de conexiones', topic: 'Roles, ternarios y pérdida de información', icon: '◇', color: '#ffb587', key: 'T',
    story: 'El instituto registra matrículas, docencia y supervisión. Algunas conexiones necesitan conservar más información que una simple pareja de entidades.',
    context: 'MATRICULAR representa una asociación por pareja ALUMNO–ASIGNATURA. IMPARTIR conecta a la vez DOCENTE, ASIGNATURA y GRUPO; sus cardinalidades no se han definido. No supongas que una asignatura tiene un único docente.',
    diagrams: [{ src: 'assets/diagrams/instituto.svg', title: 'Matrículas y docencia', description: 'ALUMNO, identificado por nia, y ASIGNATURA, identificada por codigo, se conectan mediante MATRICULAR; ambos participan con (0,N). nota cuelga del rombo MATRICULAR. IMPARTIR es un rombo conectado a DOCENTE, ASIGNATURA y GRUPO, sin cardinalidades. DOCENTE, identificado por dni, se conecta consigo mismo mediante SUPERVISAR: en el rol supervisor tiene (0,N) y en el rol supervisado (0,1). GRUPO se identifica por idGrupo.' }],
    questions: [
      { id: 'q9', title: 'Una entidad, dos papeles', prompt: 'Observa SUPERVISAR. ¿Qué lectura de su grado y sus roles es correcta?',
        options: ['Es binaria porque se dibujan dos conexiones con DOCENTE', 'Es reflexiva: un docente supervisa de 0 a N docentes y cada docente tiene de 0 a 1 supervisor', 'Es ternaria porque hay dos roles y un rombo', 'Es reflexiva y obliga a que todo docente tenga supervisor'], answer: 'Es reflexiva: un docente supervisa de 0 a N docentes y cada docente tiene de 0 a 1 supervisor',
        hint: 'El grado cuenta tipos de entidad, no segmentos. Lee por separado supervisor y supervisado.',
        explanation: 'DOCENTE participa dos veces en una relación unaria o reflexiva. El mínimo 0 permite docentes sin supervisor y sin supervisados.', source: 'Apuntes completos, §§ 4 y 5.' },
      { id: 'q10', title: 'No pierdas quién enseña a quién', prompt: 'Sustituimos IMPARTIR por DOCENTE–ASIGNATURA y ASIGNATURA–GRUPO. ¿Qué información puede perderse?',
        options: ['El código identificador de la asignatura', 'La identidad de los alumnos matriculados', 'Qué docente imparte esa asignatura a ese grupo concreto', 'El número de atributos de DOCENTE'], answer: 'Qué docente imparte esa asignatura a ese grupo concreto',
        hint: 'Con las dos parejas sabes quién enseña la asignatura y qué grupos la cursan, pero no qué combinaciones de los tres son reales.',
        explanation: 'Las proyecciones binarias pueden admitir combinaciones que no existían en el ternario. Sin restricciones adicionales, no conservan siempre la asociación DOCENTE–ASIGNATURA–GRUPO.', source: 'Apuntes completos, § 4; presentación, relaciones ternarias y agregación.' },
      { id: 'q11', title: 'Una nota en el lugar equivocado', prompt: 'Si movemos nota de MATRICULAR a ALUMNO sin añadir otra estructura, ¿qué caso dejaríamos de representar correctamente?',
        options: ['Un alumno obtiene 6 en Bases de Datos y 9 en Programación', 'Dos alumnos comparten grupo', 'Una asignatura tiene un código único', 'Un docente no tiene supervisor'], answer: 'Un alumno obtiene 6 en Bases de Datos y 9 en Programación',
        hint: 'Un único atributo simple en ALUMNO no distingue a qué asignatura pertenece cada nota.',
        explanation: 'La nota depende de la matrícula concreta, no del alumno aislado. En el rombo se conserva la pareja ALUMNO–ASIGNATURA que determina su valor.', source: 'Apuntes completos, §§ 4 y 6; presentación, ejercicio Instituto.' },
      { id: 'q12', title: 'El historial que el modelo no conserva', prompt: 'Ahora queremos varias matrículas del mismo alumno en la misma asignatura, una por curso académico. ¿Qué cambio conserva ese historial?',
        options: ['Sobrescribir nota al terminar cada curso', 'Añadir cursoAcademico como atributo de ALUMNO', 'Cambiar solo la participación de ALUMNO a (1,N)', 'Crear MATRICULA como entidad asociativa identificada por alumno, asignatura y cursoAcademico'], answer: 'Crear MATRICULA como entidad asociativa identificada por alumno, asignatura y cursoAcademico',
        hint: 'Debes distinguir ocurrencias que repiten la misma pareja. Una propiedad de ALUMNO no identifica cada matrícula.',
        explanation: 'La entidad asociativa da identidad a cada matrícula y permite distinguir sus cursos académicos. Cambiar cardinalidades o sobrescribir la nota no conserva las distintas ocurrencias.', source: 'Apuntes completos, §§ 6 y 12; presentación, entidades asociativas.' }
    ]
  },
  {
    id: 'cardinalidad', name: 'La bóveda de cardinalidad', topic: 'Completar y auditar un modelo', icon: '⌘', color: '#8ebdff', key: 'O',
    story: 'Faltan tres etiquetas del plano de tienda. Reconstrúyelas y utiliza el modelo completo para detectar operaciones imposibles.',
    context: 'Requisitos: cada departamento tiene exactamente un gerente; un gerente puede no dirigir ninguno y nunca dirige más de uno. Puede haber departamentos sin productos o con varios. Cada vendedor puede vender cero o muchos productos. Un gerente supervisa al menos un vendedor y puede supervisar varios; cada vendedor tiene un único gerente supervisor.',
    diagrams: [{ src: 'assets/diagrams/tienda.svg', title: 'Auditoría de tienda · etiquetas A, B y C', description: 'DPTO, identificado por codigo, participa con (1,1) en DIRIGIR; la participación de GERENTE es A. DPTO participa con B en CONTENER; PRODUCTO con (1,1). PRODUCTO participa con (0,N) en VENDER; VENDEDOR con C. descuento está conectado a VENDER. GERENTE participa con (1,N) en SUPERVISAR y VENDEDOR con (1,1). GERENTE y VENDEDOR tienen dni como identificador; PRODUCTO tiene codigo subrayado, nombre y precio. A corresponde a GERENTE en DIRIGIR, B a DPTO en CONTENER y C a VENDEDOR en VENDER.' }],
    questions: [
      { id: 'q13', type: 'match', title: 'Reconstruye los tres cerrojos', prompt: 'Completa A, B y C según los requisitos de la sala. Las etiquetas están junto a su entidad de origen.',
        rows: ['A · GERENTE en DIRIGIR', 'B · DPTO en CONTENER', 'C · VENDEDOR en VENDER'], options: ['(1,1)', '(0,N)', '(1,N)', '(0,1)'], answer: ['(0,1)', '(0,N)', '(0,N)'],
        hint: 'Determina primero si puede haber cero asociaciones. Después comprueba si el máximo es uno o muchos.',
        explanation: 'Un gerente dirige cero o un departamento: A=(0,1). Un departamento contiene cero o muchos productos: B=(0,N). Un vendedor vende cero o muchos productos: C=(0,N).', source: 'Apuntes completos, § 5; presentación, supuesto Tienda.' },
      { id: 'q14', title: 'Una operación que rompe el plano', prompt: 'Tras completar las etiquetas, ¿qué operación incumple DIRIGIR?',
        options: ['Dejar a un gerente sin departamento a su cargo', 'Asignar el mismo gerente como director de dos departamentos', 'Tener dos departamentos con directores diferentes', 'Asignar un gerente a un departamento sin productos'], answer: 'Asignar el mismo gerente como director de dos departamentos',
        hint: 'No confundas dirigir con supervisar vendedores. A limita los departamentos por gerente.',
        explanation: 'A=(0,1) limita a uno el máximo de departamentos que dirige cada gerente. Que un departamento no tenga productos es compatible con B=(0,N).', source: 'Apuntes completos, § 5; presentación, supuesto Tienda.' },
      { id: 'q15', title: 'El descuento que cambia de manos', prompt: 'Ana vende P-10 con un 5 % y Luis vende el mismo producto con un 12 %. ¿Qué modificación perdería información de este caso?',
        options: ['Mantener descuento en VENDER', 'Identificar PRODUCTO por codigo', 'Permitir varios vendedores para un producto', 'Mover descuento a PRODUCTO como atributo simple'], answer: 'Mover descuento a PRODUCTO como atributo simple',
        hint: 'Observa de qué rombo cuelga descuento y si el código de producto basta para determinar su valor.',
        explanation: 'El descuento depende de la pareja VENDEDOR–PRODUCTO. Un único valor en PRODUCTO no distinguiría el aplicado por Ana del aplicado por Luis.', source: 'Apuntes completos, §§ 4 y 6; presentación, supuesto Tienda.' },
      { id: 'q16', title: 'Director sin equipo', prompt: 'Un gerente no dirige ningún departamento y tampoco supervisa vendedores. ¿Qué dice el modelo sobre esa situación?',
        options: ['Es válida porque ambas participaciones son opcionales', 'Es inválida porque todo gerente debe dirigir un departamento', 'No dirigir es válido; no supervisar a nadie incumple el mínimo de SUPERVISAR', 'Es inválida únicamente si el gerente vende productos'], answer: 'No dirigir es válido; no supervisar a nadie incumple el mínimo de SUPERVISAR',
        hint: 'Una misma entidad puede tener mínimos diferentes en relaciones diferentes. Revisa A y el (1,N) de SUPERVISAR.',
        explanation: 'En DIRIGIR, GERENTE tiene (0,1). En SUPERVISAR tiene (1,N), por lo que necesita al menos un vendedor aunque no dirija un departamento.', source: 'Apuntes completos, § 5; presentación, supuesto Tienda.' }
    ]
  },
  {
    id: 'nucleo', name: 'El núcleo', topic: 'Especialización y agregación', icon: '⬡', color: '#eea1d3', key: 'S',
    story: 'Dos planos protegen el núcleo: uno decide qué credenciales son válidas y otro conserva el contexto de las incidencias. Interpreta ambos para salir.',
    context: 'El plano 05A usa una doble línea entre TRABAJADOR y el círculo con d. El plano 05B encierra DOCENTE–IMPARTIR–AULA en la unidad SESION. Cada plano describe un caso independiente.',
    diagrams: [
      { src: 'assets/diagrams/jerarquia.svg', title: '05A · Registro de personal', description: 'TRABAJADOR tiene dni subrayado y nombre. Se conecta mediante dos líneas paralelas a un círculo con la letra d; del círculo salen ramas a GERENTE, JEFE y VENDEDOR. GERENTE añade bonus; JEFE añade cantVendedores con elipse discontinua; VENDEDOR añade sueldoBase. Los subtipos heredan los atributos de TRABAJADOR.' },
      { src: 'assets/diagrams/sesion.svg', title: '05B · Sesiones e incidencias', description: 'Una caja llamada SESION contiene DOCENTE, el rombo IMPARTIR y AULA. DOCENTE se identifica por dni y AULA por codigo. Desde el borde de SESION sale una conexión con participación (0,N) al rombo REGISTRAR; este conecta con INCIDENCIA, que participa con (1,1) y se identifica por idIncidencia.' }
    ],
    questions: [
      { id: 'q17', type: 'match', title: 'Descifra la credencial de personal', prompt: 'Interpreta las restricciones y la herencia del plano 05A.',
        rows: ['Cobertura indicada por la doble línea', 'Exclusividad indicada por d', 'Procedencia de dni en VENDEDOR'], options: ['Parcial', 'Heredado de TRABAJADOR', 'Solapada', 'Total', 'Disjunta'], answer: ['Total', 'Disjunta', 'Heredado de TRABAJADOR'],
        hint: 'Cobertura y exclusividad son dimensiones independientes. Un subtipo mantiene las características comunes de la superclase.',
        explanation: 'La doble línea exige que todo trabajador pertenezca a algún subtipo. d impide pertenecer a varios a la vez. VENDEDOR hereda dni de TRABAJADOR.', source: 'Apuntes completos, §§ 10 y 11; presentación, supuesto Tienda.' },
      { id: 'q18', title: 'Detecta la credencial incompatible', prompt: '¿Qué registro contradice la exclusividad del plano 05A?',
        options: ['Una persona con el mismo dni registrada a la vez como GERENTE y VENDEDOR', 'Una vendedora que tiene dni y sueldoBase', 'Un gerente que hereda nombre de TRABAJADOR', 'Un jefe que tiene un atributo derivado'], answer: 'Una persona con el mismo dni registrada a la vez como GERENTE y VENDEDOR',
        hint: 'Se trata de la misma persona, no de dos trabajadores diferentes. Consulta la letra del círculo.',
        explanation: 'La especialización disjunta prohíbe que la misma ocurrencia de TRABAJADOR pertenezca simultáneamente a GERENTE y VENDEDOR.', source: 'Apuntes completos, §§ 10 y 11.' },
      { id: 'q19', title: 'Conserva el contexto de la incidencia', prompt: 'En el plano 05B, ¿por qué REGISTRAR se conecta con el borde de SESION y no solo con AULA?',
        options: ['Para convertir todas las incidencias en atributos derivados', 'Para obligar a que cada aula tenga una única incidencia', 'Para identificar qué asociación de docente y aula es afectada por la incidencia', 'Para eliminar el identificador de INCIDENCIA'], answer: 'Para identificar qué asociación de docente y aula es afectada por la incidencia',
        hint: 'Una incidencia en un aula no identifica por sí sola la asociación concreta en la que ocurrió.',
        explanation: 'La agregación permite relacionar INCIDENCIA con la unidad DOCENTE–IMPARTIR–AULA. La participación (0,N) también admite sesiones sin incidencias.', source: 'Apuntes completos, § 12; presentación, agregación.' },
      { id: 'q20', title: 'Reprograma la última restricción', prompt: 'La empresa decide que una persona pueda ser GERENTE y VENDEDOR a la vez, pero todo trabajador debe seguir perteneciendo a algún subtipo. ¿Qué cambio mínimo necesita el plano 05A?',
        options: ['Mantener d y sustituir la doble línea por una simple', 'Cambiar d por o y mantener la doble línea', 'Cambiar d por o y quitar también la cobertura total', 'Eliminar dni de TRABAJADOR'], answer: 'Cambiar d por o y mantener la doble línea',
        hint: 'Cambia únicamente la exclusividad. La obligación de pertenecer a algún subtipo sigue vigente.',
        explanation: 'o indica solapamiento: permite varios subtipos. La doble línea conserva la cobertura total. Pasar a una línea simple permitiría trabajadores sin subtipo, que el requisito sigue prohibiendo.', source: 'Apuntes completos, § 11.' }
    ]
  }
];

function questionScore(question, answer, hintUsed) {
  const correct = Array.isArray(question.answer)
    ? Array.isArray(answer) && question.answer.length === answer.length && question.answer.every((value, i) => value === answer[i])
    : answer === question.answer;
  return correct ? (hintUsed ? 0.25 : 0.5) : 0;
}

if (typeof module !== 'undefined') module.exports = { ROOMS, questionScore };
