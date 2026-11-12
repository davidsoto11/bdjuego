/* Contenidos adaptados de los tres PDF del Tema 2 presentes en la carpeta original. */
const ROOMS = [
  {
    id: 'archivo', name: 'El archivo', topic: 'Entidades y diseño conceptual', icon: '▣', color: '#b7a0ff', key: 'D',
    story: 'El apagón ha mezclado los planos del laboratorio. Identifica las piezas del modelo y recupera la primera llave.',
    diagram: 'entities',
    questions: [
      { id: 'q1', type: 'match', title: 'Reconstruye la leyenda', prompt: 'Asocia cada símbolo de Chen con su significado.',
        rows: ['Rectángulo', 'Elipse', 'Rombo'], options: ['Relación', 'Entidad', 'Atributo'], answer: ['Entidad', 'Atributo', 'Relación'],
        hint: 'Una entidad es una «cosa»; una relación conecta cosas y suele ser un verbo.',
        explanation: 'Chen representa las entidades con rectángulos, los atributos con elipses y las relaciones con rombos.', source: 'Apuntes completos, §§ 2–4; presentación, resumen esencial I.' },
      { id: 'q2', title: 'Encuentra la ocurrencia', prompt: 'BICICLETA es una entidad. ¿Cuál es una ocurrencia de esa entidad?',
        options: ['El atributo estado', 'La relación ALQUILAR', 'La bicicleta concreta con código B-017', 'El conjunto de todas las bicicletas'], answer: 'La bicicleta concreta con código B-017',
        hint: 'Una ocurrencia es un ejemplar concreto, no el conjunto ni una propiedad.',
        explanation: 'BICICLETA es el tipo de entidad; B-017 identifica un ejemplar concreto de ese tipo.', source: 'Apuntes completos, § 3.' },
      { id: 'q3', title: 'Recupera el plano correcto', prompt: 'Antes de elegir un SGBD, quieres representar qué datos existen y cómo se relacionan. ¿En qué fase estás?',
        options: ['Diseño físico', 'Diseño conceptual', 'Creación de índices', 'Diseño de pantallas'], answer: 'Diseño conceptual',
        hint: 'Esta fase representa el mundo real sin decidir todavía cómo se almacenarán los datos.',
        explanation: 'El diseño conceptual produce el modelo ER/EER. El lógico lo transforma al modelo elegido y el físico concreta su implementación.', source: 'Apuntes completos, § 1.' },
      { id: 'q4', title: 'La caja dependiente', prompt: 'La línea 1 del pedido A y la línea 1 del pedido B son distintas. Si LINEA_PEDIDO necesita a PEDIDO para identificarse, ¿qué identificador funciona?',
        options: ['Solo numeroLinea', 'Solo precio', 'Solo idPedido', 'idPedido + numeroLinea'], answer: 'idPedido + numeroLinea',
        hint: 'El número de línea se repite entre pedidos. Necesitas saber a qué pedido pertenece.',
        explanation: 'LINEA_PEDIDO es débil en identificación: combina el identificador de PEDIDO con su número de línea.', source: 'Apuntes completos, § 8.' }
    ]
  },
  {
    id: 'identidad', name: 'La cámara de identidad', topic: 'Atributos e identificadores', icon: '◉', color: '#80d9cb', key: 'A',
    story: 'Los registros han perdido sus etiquetas. Repara los atributos para que el sistema vuelva a reconocer cada dato.',
    diagram: 'attributes',
    questions: [
      { id: 'q5', type: 'match', title: 'Cada dato en su cajón', prompt: 'Clasifica estos atributos de una persona.',
        rows: ['edad, calculada desde fechaNacimiento', 'telefonos, con varios números', 'direccion, formada por calle y numero'],
        options: ['Compuesto', 'Derivado', 'Multivaluado'], answer: ['Derivado', 'Multivaluado', 'Compuesto'],
        hint: 'Piensa en calcular, repetir valores o dividir en partes.',
        explanation: 'edad es derivado; telefonos es multivaluado; direccion es compuesto. Son propiedades diferentes.', source: 'Apuntes completos, § 6.' },
      { id: 'q6', title: 'Una identidad sin dudas', prompt: '¿Qué características debe tener un buen identificador principal?',
        options: ['Ser único, no nulo y estable', 'Poder repetirse si el nombre cambia', 'Ser siempre el nombre de la persona', 'Tener varios valores para la misma ocurrencia'], answer: 'Ser único, no nulo y estable',
        hint: 'Debe distinguir una ocurrencia sin ambigüedad, también con el paso del tiempo.',
        explanation: 'El identificador debe distinguir de forma única, tener valor y ser estable. También conviene que sea sencillo y sin redundancias.', source: 'Apuntes completos, § 6.' },
      { id: 'q7', title: 'La credencial de reserva', prompt: 'dni y pasaporte son únicos y no nulos. Elegimos dni como identificador principal. ¿Qué pasa a ser pasaporte?',
        options: ['Un atributo derivado', 'Una relación', 'Un identificador alternativo', 'Un atributo multivaluado'], answer: 'Un identificador alternativo',
        hint: 'Los dos eran candidatos; uno se elige como principal y el otro sigue siendo único.',
        explanation: 'Un identificador alternativo es un candidato que no se ha elegido como principal.', source: 'Apuntes completos, § 6.' },
      { id: 'q8', title: 'Las horas desaparecidas', prompt: 'Un empleado dedica distintas horas a cada proyecto. ¿Dónde pertenece horasSemanales?',
        options: ['Solo en EMPLEADO', 'En la relación DEDICAR entre EMPLEADO y PROYECTO', 'Solo en PROYECTO', 'En una entidad sin relaciones'], answer: 'En la relación DEDICAR entre EMPLEADO y PROYECTO',
        hint: 'El valor cambia si cambia la pareja de empleado y proyecto.',
        explanation: 'horasSemanales describe una asociación concreta EMPLEADO + PROYECTO, por eso es atributo de DEDICAR.', source: 'Apuntes completos, §§ 4 y 13.' }
    ]
  },
  {
    id: 'conexiones', name: 'El panel de conexiones', topic: 'Relaciones, grado y roles', icon: '◇', color: '#ffb587', key: 'T',
    story: 'El núcleo está aislado. Reconecta las entidades y averigua qué papel desempeña cada una en la red.',
    diagram: 'relations',
    questions: [
      { id: 'q9', title: 'El cable entre dos mundos', prompt: 'CLIENTE COMPRA PRODUCTO conecta dos tipos de entidad. ¿Qué grado tiene la relación?',
        options: ['Unaria', 'Ternaria', 'Cuaternaria', 'Binaria'], answer: 'Binaria',
        hint: 'Cuenta los tipos de entidad participantes: CLIENTE y PRODUCTO.',
        explanation: 'Una relación binaria conecta dos entidades. El grado no depende de cuántos clientes o productos haya.', source: 'Apuntes completos, § 4.' },
      { id: 'q10', title: 'Una conexión que vuelve', prompt: 'Un EMPLEADO supervisa a otro EMPLEADO. ¿Cómo se llama esta relación?',
        options: ['Reflexiva, con roles supervisor y supervisado', 'Binaria entre dos entidades diferentes', 'Atributo compuesto', 'Generalización total'], answer: 'Reflexiva, con roles supervisor y supervisado',
        hint: 'El mismo tipo de entidad participa dos veces, asumiendo papeles distintos.',
        explanation: 'Es una relación unaria o reflexiva. Los roles permiten distinguir quién supervisa y quién es supervisado.', source: 'Apuntes completos, § 4.' },
      { id: 'q11', title: 'El circuito de tres terminales', prompt: 'DOCENTE IMPARTE ASIGNATURA A GRUPO participa como una sola asociación de tres entidades. ¿Qué relación es?',
        options: ['Unaria', 'Ternaria', 'Identificador compuesto', 'Especialización'], answer: 'Ternaria',
        hint: 'Aquí hay tres tipos de entidad en la misma asociación.',
        explanation: 'Una relación ternaria involucra tres entidades. Reconocerla no implica que pueda descomponerse siempre sin perder información.', source: 'Apuntes completos, § 4; presentación, relaciones y grado.' },
      { id: 'q12', type: 'match', title: 'Repara las etiquetas del panel', prompt: 'En «Un ALUMNO se MATRICULA en una ASIGNATURA y obtiene una nota», clasifica cada elemento.',
        rows: ['ALUMNO', 'MATRICULAR', 'nota de ese alumno en esa asignatura'], options: ['Atributo de la relación', 'Entidad', 'Relación'], answer: ['Entidad', 'Relación', 'Atributo de la relación'],
        hint: 'La nota pertenece a una matrícula concreta, no al alumno en todas sus asignaturas.',
        explanation: 'ALUMNO es entidad; MATRICULAR es la asociación; nota depende de la pareja ALUMNO + ASIGNATURA.', source: 'Apuntes completos, §§ 2 y 4; presentación, ejercicio Instituto.' }
    ]
  },
  {
    id: 'cardinalidad', name: 'La bóveda de cardinalidad', topic: 'Mínimos, máximos y participación', icon: '⌘', color: '#8ebdff', key: 'O',
    story: 'La bóveda solo acepta conexiones que respetan sus reglas. Lee cada requisito en ambos sentidos para desbloquearla.',
    diagram: 'cardinality',
    questions: [
      { id: 'q13', title: 'La categoría exacta', prompt: 'Cada PRODUCTO pertenece obligatoriamente a una única CATEGORIA. Para un producto concreto, ¿cuántas categorías hay como mínimo y máximo?',
        options: ['(0,N)', '(0,1)', '(1,1)', '(1,N)'], answer: '(1,1)',
        hint: '«Obligatoriamente» fija el mínimo y «única» fija el máximo.',
        explanation: 'Un producto tiene exactamente una categoría: mínimo 1, máximo 1.', source: 'Apuntes completos, § 5; documento original, ejemplo PRODUCTO–CATEGORIA.' },
      { id: 'q14', title: 'El estante vacío', prompt: 'Una CATEGORIA puede no tener productos o tener muchos. Para una categoría concreta, ¿cuántos productos admite?',
        options: ['(0,N)', '(1,N)', '(1,1)', '(0,1)'], answer: '(0,N)',
        hint: 'Que pueda estar vacía significa mínimo cero.',
        explanation: '(0,N) permite cero, uno o muchos productos. La participación es opcional.', source: 'Apuntes completos, § 5; documento original, ejemplo PRODUCTO–CATEGORIA.' },
      { id: 'q15', title: 'La puerta de matrícula', prompt: 'Un alumno puede cursar varias asignaturas y una asignatura puede tener varios alumnos. Según los máximos, ¿qué tipo de relación hay?',
        options: ['1:1', '1:N', 'Unaria', 'N:M'], answer: 'N:M',
        hint: 'Hay «muchos» en los dos sentidos.',
        explanation: 'ALUMNO–ASIGNATURA es muchos a muchos: N:M. Los mínimos se determinan por separado con los requisitos.', source: 'Apuntes completos, § 5.' },
      { id: 'q16', type: 'match', title: 'Los dos últimos cerrojos', prompt: 'Asocia la participación de cada gerente con su cardinalidad.',
        rows: ['Puede dirigir ningún departamento o uno, nunca más', 'Debe supervisar al menos un jefe y puede supervisar varios'], options: ['(1,N)', '(0,1)', '(1,1)', '(0,N)'], answer: ['(0,1)', '(1,N)'],
        hint: 'Separa las dos preguntas: ¿es obligatorio? y ¿cuántos como máximo?',
        explanation: 'Dirigir opcionalmente uno es (0,1). Supervisar obligatoriamente uno o muchos es (1,N).', source: 'Apuntes completos, § 5; presentación, supuesto Tienda.' }
    ]
  },
  {
    id: 'nucleo', name: 'El núcleo', topic: 'Modelo extendido y restricciones', icon: '⬡', color: '#eea1d3', key: 'S',
    story: 'Estás ante el núcleo del laboratorio. Reconstruye la jerarquía y las reglas que faltan para activar el protocolo de salida.',
    diagram: 'hierarchy',
    questions: [
      { id: 'q17', type: 'match', title: 'Reordena la jerarquía', prompt: 'Relaciona cada operación con el concepto del modelo EER.',
        rows: ['Agrupar CAMION y MOTO en VEHICULO', 'Dividir VEHICULO en CAMION y MOTO', 'Recibir en MOTO el identificador de VEHICULO'], options: ['Herencia', 'Generalización', 'Especialización'], answer: ['Generalización', 'Especialización', 'Herencia'],
        hint: 'Agrupar va de lo particular a lo general; dividir recorre el camino inverso.',
        explanation: 'Generalización: de abajo arriba. Especialización: de arriba abajo. Las subclases heredan atributos y relaciones de su superclase.', source: 'Apuntes completos, § 10.' },
      { id: 'q18', title: 'Una sola credencial por persona', prompt: 'Todo TRABAJADOR debe ser GERENTE, JEFE o VENDEDOR, y no puede ser más de uno a la vez. ¿Qué especialización es?',
        options: ['Parcial y solapada', 'Total y solapada', 'Total y disjunta', 'Parcial y disjunta'], answer: 'Total y disjunta',
        hint: '«Todo» habla de cobertura; «solo uno» habla de exclusividad.',
        explanation: 'Total: todos pertenecen a alguna subclase. Disjunta: solo a una. Parcial permite no tener subclase y solapada permite varias.', source: 'Apuntes completos, § 11; presentación, supuesto Tienda.' },
      { id: 'q19', title: 'La incidencia sin contexto', prompt: 'Necesitamos registrar una incidencia de una clase impartida por un docente en un aula. ¿Qué solución conserva la asociación concreta?',
        options: ['Unir INCIDENCIA solo con DOCENTE', 'Tratar DOCENTE–IMPARTIR–AULA como SESION y relacionarla con INCIDENCIA', 'Unir INCIDENCIA solo con AULA', 'Guardar el nombre del aula como identificador del docente'], answer: 'Tratar DOCENTE–IMPARTIR–AULA como SESION y relacionarla con INCIDENCIA',
        hint: 'La incidencia afecta a la sesión: necesitas conservar la combinación, no una de sus partes.',
        explanation: 'La agregación trata la asociación como una unidad de nivel superior. SESION puede relacionarse con INCIDENCIA sin perder ese contexto.', source: 'Apuntes completos, § 12; presentación, agregación.' },
      { id: 'q20', title: 'La regla que no cabe en el plano', prompt: 'Una regla del negocio no puede expresarse con los símbolos básicos del diagrama ER. ¿Qué debes hacer?',
        options: ['Ignorarla', 'Eliminar todas las cardinalidades', 'Inventar un atributo sin explicarlo', 'Documentarla como restricción adicional o pérdida expresiva'], answer: 'Documentarla como restricción adicional o pérdida expresiva',
        hint: 'El diagrama tiene límites; la regla debe seguir formando parte del diseño.',
        explanation: 'La pérdida expresiva se resuelve documentando la regla como nota o restricción adicional para su posterior implementación.', source: 'Apuntes completos, § 9.' }
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
