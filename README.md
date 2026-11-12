# Protocolo E·R

Un escape room educativo de modelo Entidad–Relación: cinco salas, veinte pruebas y un informe PDF individual para entregar en Moodle.

## Jugar

Abre **https://davidsoto11.github.io/bdjuego/**. El alumno introduce nombre y grupo, resuelve las salas en orden, descarga su PDF al terminar y lo adjunta a la tarea de Moodle.

Sin cuentas, backend, instalación ni servicios de pago. Los recursos y la generación del PDF se sirven desde el propio sitio. La partida se conserva en el almacenamiento local del navegador cuando está disponible; no se envían nombres ni respuestas a un servidor de la aplicación. No se sincroniza entre dispositivos. En un equipo compartido, empezar una nueva partida elimina el intento anterior del navegador, previa confirmación.

## Contenido y evaluación

Adaptado de los tres materiales del Tema 2 que acompañaban al proyecto: `Tema 2 - Diseño Conceptual_ Modelo Entidad Relación.pdf`, `Tema 2 · Modelo Entidad–Relación.pdf` y `Tema_2_Modelo_Entidad_Relacion_MEJORADO.pdf`. Los PDF originales se conservan localmente y no se publican en el repositorio.

| Sala | Contenido | Máximo |
| --- | --- | --- |
| El archivo | Símbolos, entidad/ocurrencia, diseño conceptual, entidades débiles | 2 |
| La cámara de identidad | Tipos de atributos, identificadores, atributos de relación | 2 |
| El panel de conexiones | Grado, relaciones reflexivas, roles y matrícula | 2 |
| La bóveda de cardinalidad | Mínimos, máximos, participación y N:M | 2 |
| El núcleo | Generalización, especialización, herencia, agregación, pérdida expresiva | 2 |

- Acierto sin pista: **0,5 puntos**. Con pista: **0,25 puntos**. Error: **0 puntos**, sin restar.
- En las asociaciones deben acertarse todas las filas para puntuar; no hay puntuación parcial.
- Cada sala se corrige una sola vez. Las respuestas quedan cerradas y se muestran las explicaciones.
- Se puede continuar incluso con errores para completar el recorrido y recibir un informe con cualquier nota.
- Tiempo orientativo: 25 minutos, sin límite ni penalización. El tiempo transcurrido incluye los periodos con la pestaña cerrada.
- Aprobar requiere 5/10. Completar el recorrido y aprobar son resultados diferentes.

El PDF incluye identidad declarada, grupo, fechas en horario de Madrid, duración, referencia de intento, nota total, desglose por sala y las veinte respuestas con soluciones, pistas, explicaciones y referencias al temario.

**Límite de evaluación:** el juego y la nota se calculan en el navegador. El PDF no está firmado y no verifica la identidad ni impide modificar resultados o consultar las soluciones del código público. Es una actividad didáctica y una evidencia de trabajo, no un sistema de examen inviolable. Para evaluación con garantías harían falta autenticación y corrección en servidor o un cuestionario de Moodle. El informe no se envía automáticamente a Moodle.

## Desarrollo

Se usa HTML, CSS y JavaScript sin compilación. Ejecuta desde esta carpeta:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Abre `http://127.0.0.1:4173`. Edita `content.js` para cambiar retos, opciones, soluciones, pistas y fuentes; `app.js` contiene el recorrido, guardado y PDF; `styles.css` define la apariencia. Si cambias el formato del guardado o los contenidos de evaluación, actualiza su versión y clave en `app.js` para no reutilizar intentos incompatibles.

Pruebas de contenido y calificación, con Node.js:

```sh
node --test tests/content.test.cjs
```

Prueba del recorrido en navegador, con servidor iniciado, Playwright para Python, Chromium y `pdftotext` disponibles:

```sh
python3 tests/browser_test.py
```

Las capturas e informe de prueba se guardan en `/tmp/bdjuego-qa/`, fuera del repositorio. El test cubre respuestas incompletas, nota mixta, pistas, cierre de corrección, recargas, PDF, reinicio, móvil, nota cero, datos corruptos, escape de texto y almacenamiento bloqueado.

## GitHub Pages

Publicación estática desde la raíz de la rama `main`: **Settings → Pages → Deploy from a branch → main / (root)**. No requiere compilación. `.nojekyll` evita el procesamiento de Jekyll. Al subir cambios a `main`, Pages actualiza el juego.

## Recursos

- Ilustración SVG y diseño creados para este proyecto.
- [jsPDF 4.2.1](https://github.com/parallax/jsPDF/tree/v4.2.1), distribuido localmente en `vendor/`, licencia MIT adjunta. El PDF usa Helvetica para textos en español y otros caracteres latinos; otros alfabetos requieren una fuente Unicode incrustada.
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) y [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk), alojadas localmente en `assets/`, con sus licencias SIL Open Font License.
