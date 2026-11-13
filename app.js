const GAME = Object.assign({
  id: 'er', storageKey: 'protocolo-er-v2', version: 2, title: 'Protocolo E.R',
  edition: 'Edición 2 · Interpreta los planos', minutes: 35,
  heading: 'Los datos están<br>encerrados.<br><span>Tú tienes la llave.</span>',
  description: 'Un laboratorio en silencio. Cinco puertas bloqueadas. Y un único camino de salida: dominar el modelo Entidad–Relación.',
  art: 'assets/laboratory.svg', artAlt: 'Laboratorio isométrico con un diagrama entidad–relación, un ordenador y una puerta de salida bloqueada',
  learning: 'Resuelve diagramas, identifica atributos y descifra cardinalidades. Hay pistas si te atascas y explicaciones en cada sala.',
  caseTag: 'Lectura de diagramas · Nivel intermedio',
  legend: 'Notación: cada (mín,máx) se lee junto a su entidad de origen. Las etiquetas A, B y C son incógnitas, no cardinalidades resueltas.',
  reportSubtitle: 'Informe individual - Edición 2: interpretación de planos', reportTopic: 'Tema 2 - Diseño conceptual: Modelo Entidad-Relación', filePrefix: 'Informe_ER',
}, typeof ACTIVITY === 'undefined' ? {} : ACTIVITY);
const STORAGE_KEY = GAME.storageKey;
const main = document.querySelector('#main');
const helpDialog = document.querySelector('#help-dialog');
let state = null;
let storageAvailable = true;
let damagedSave = false;
let hasLegacySave = false;
let timer;

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = (value) => value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
const questions = ROOMS.flatMap((room) => room.questions);
const pointsFor = (question) => questionScore(question, state.answers[question.id], !!state.hints[question.id]);
const roomScore = (room) => room.questions.reduce((sum, question) => sum + pointsFor(question), 0);
const totalScore = () => ROOMS.filter((room) => state.submitted.includes(room.id)).reduce((sum, room) => sum + roomScore(room), 0);
const hintsCount = () => Object.values(state.hints).filter(Boolean).length;
const elapsed = () => Math.max(0, Math.floor(((state.finishedAt || Date.now()) - state.startedAt) / 1000));
const duration = () => `${Math.floor(elapsed() / 60)} min ${elapsed() % 60} s`;
const dateLabel = (timestamp) => new Date(timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' });

function validAnswer(question, answer) {
  if (question.type === 'sql') return window.SQLPractice.validAnswer(answer);
  return question.type === 'match'
    ? Array.isArray(answer) && answer.length === question.rows.length && answer.every((item) => item === '' || question.options.includes(item))
    : question.options.includes(answer);
}

function validSave(saved) {
  if (!saved || saved.version !== GAME.version || typeof saved.id !== 'string' || !saved.id || saved.id.length > 100 ||
      !saved.student || typeof saved.student.name !== 'string' || !saved.student.name.trim() || saved.student.name.length > 90 ||
      typeof saved.student.group !== 'string' || !saved.student.group.trim() || saved.student.group.length > 60 ||
      !Number.isFinite(saved.startedAt) || saved.startedAt <= 0 || saved.startedAt > Date.now() ||
      !Number.isInteger(saved.room) || saved.room < 0 || saved.room >= ROOMS.length ||
      !saved.answers || typeof saved.answers !== 'object' || !saved.hints || typeof saved.hints !== 'object' ||
      !Array.isArray(saved.submitted) || saved.submitted.length > ROOMS.length) return false;
  if (!saved.submitted.every((id, i) => id === ROOMS[i].id)) return false;
  if (saved.room > saved.submitted.length || saved.room < saved.submitted.length - 1) return false;
  if (!Object.entries(saved.answers).every(([id, answer]) => {
    const question = questions.find((item) => item.id === id);
    return question && validAnswer(question, answer);
  })) return false;
  if (!Object.entries(saved.hints).every(([id, used]) => questions.some((q) => q.id === id) && used === true)) return false;
  if (saved.submitted.some((id) => ROOMS.find((room) => room.id === id).questions.some((q) => !answerComplete(q, saved.answers[q.id])))) return false;
  if (saved.finishedAt !== null && (!Number.isFinite(saved.finishedAt) || saved.finishedAt < saved.startedAt || saved.finishedAt > Date.now() || saved.submitted.length !== ROOMS.length)) return false;
  return true;
}

try {
  hasLegacySave = GAME.id === 'er' && !!localStorage.getItem('protocolo-er-v1');
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    if (validSave(saved)) state = saved;
    else damagedSave = true;
  }
} catch (error) {
  if (error instanceof SyntaxError) damagedSave = true;
  else storageAvailable = false;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
    document.querySelectorAll('[data-storage-warning]').forEach((element) => { element.hidden = false; });
  }
}

function storageNotice() {
  return `<p class="storage-warning" data-storage-warning ${storageAvailable ? 'hidden' : ''}>El navegador no permite guardar la partida. Puedes jugar y descargar tu informe, pero mantén esta pestaña abierta hasta terminar.</p>`;
}

function focusMain() {
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderLanding() {
  clearInterval(timer);
  main.innerHTML = `<div class="landing"><nav class="activity-nav" aria-label="Juegos de bases de datos"><a href="${GAME.id === 'joins' ? '../' : './'}" ${GAME.id === 'er' ? 'aria-current="page"' : ''}><span>◇</span> Modelo Entidad–Relación</a><a href="${GAME.id === 'joins' ? './' : 'joins/'}" ${GAME.id === 'joins' ? 'aria-current="page"' : ''}><span>⋈</span> Laboratorio SQL JOIN <small>Nuevo</small></a></nav>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="mission-label"><span class="status-dot"></span> ${GAME.edition}</div>
        <h1 id="hero-title">${GAME.heading}</h1>
        <p class="hero-description">${GAME.description}</p>
        <div class="hero-actions"><button class="button primary" id="enter-button" type="button">${state ? 'Retomar la misión' : 'Acepto la misión'} <span class="arrow" aria-hidden="true">↗</span></button><span class="muted">Sin registro.<br>Solo tú y tu ingenio.</span></div>
        <div class="hero-meta"><span><b aria-hidden="true">◷</b> ≈ ${GAME.minutes} minutos</span><span><b aria-hidden="true">◇</b> 5 salas · 20 pruebas</span><span><b aria-hidden="true">↓</b> Informe PDF</span></div>
      </div>
      <div class="hero-art"><img src="${GAME.art}" alt="${GAME.artAlt}" width="800" height="660"><div class="floating-label label-a"><span class="tiny-icon" aria-hidden="true">⌘</span><span><strong>Sistema bloqueado</strong>Esperando a un agente…</span></div><div class="floating-label label-b"><span class="tiny-icon" aria-hidden="true">◇</span><span><strong>Protocolo de salida</strong>${GAME.id === 'joins' ? 'Reconecta la academia' : 'Reconstruye el modelo E·R'}</span></div></div>
    </section>
    ${storageNotice()}
    ${hasLegacySave ? '<p class="legacy-notice">Tienes una partida de la edición anterior. <a href="version-1/">Retómala o descarga su informe aquí</a>. Esta edición conserva ese intento sin mezclar las notas.</p>' : ''}
    ${damagedSave ? '<p class="storage-warning" role="status">La partida guardada no se puede recuperar. Inicia una nueva misión para continuar.</p>' : ''}
    ${state ? `<section class="resume-panel" id="resume-panel"><div><strong>Tu misión sigue aquí, ${escapeHTML(state.student.name)}.</strong><p>${state.finishedAt ? 'Has completado el recorrido. Tu informe está disponible.' : `${state.submitted.length} de 5 salas completadas. Puedes continuar donde lo dejaste.`}</p></div><div class="resume-actions"><button class="button mint" id="resume-button">${state.finishedAt ? 'Ver mi informe' : 'Continuar'}</button><button class="button ghost small" id="restart-button">Nueva partida</button></div></section>` : ''}
    <section class="start-panel" id="start-panel" hidden aria-labelledby="start-title"><h2 id="start-title">Identifícate, agente.</h2><p class="muted">Estos datos aparecerán en el informe que entregarás en Moodle.</p><form id="start-form" class="start-form"><div class="field"><label for="student-name">Nombre y apellidos</label><input id="student-name" name="name" autocomplete="name" placeholder="Tu nombre completo" maxlength="90" required></div><div class="field"><label for="student-group">Curso y grupo</label><input id="student-group" name="group" placeholder="Ej. 1.º DAM · Grupo A" maxlength="60" required></div><button class="button primary" type="submit">Entrar al laboratorio <span aria-hidden="true">↗</span></button></form><p class="form-note">20 pruebas × 0,5 puntos. Cada acierto con pista vale 0,25. En las asociaciones deben acertarse todas las filas. Sin límite de tiempo.</p></section>
    <section class="route-section" aria-labelledby="route-title"><div class="section-heading"><h2 id="route-title">Cinco salas. Una salida.</h2><span>Cada puerta te acerca al núcleo.</span></div><div class="room-route">${ROOMS.map((room, i) => `<article class="route-card" style="--room-color:${room.color}"><div class="route-top"><span class="room-icon" aria-hidden="true">${room.icon}</span><span class="route-number">0${i + 1} / 05</span></div><h3>${room.name}</h3><p>${room.topic}</p></article>`).join('')}</div></section>
    <section class="mission-bottom" aria-label="Información de la actividad"><div class="brief-block"><span class="brief-icon" aria-hidden="true">✧</span><div><h3>Aprende mientras encuentras la salida</h3><p>${GAME.learning}</p></div></div><div class="brief-block"><span class="brief-icon" aria-hidden="true">▤</span><div><h3>Tu misión termina con una entrega</h3><p>Al salir, recibirás un PDF con tu nota y el detalle de tus respuestas. Descárgalo y súbelo a la tarea de Moodle.</p></div></div></section>
  </div>`;
  document.querySelector('#enter-button').addEventListener('click', () => state ? resume() : showStart());
  document.querySelector('#resume-button')?.addEventListener('click', resume);
  document.querySelector('#restart-button')?.addEventListener('click', confirmRestart);
  document.querySelector('#start-form').addEventListener('submit', startGame);
}

function showStart() {
  const panel = document.querySelector('#start-panel');
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'instant', block: 'center' });
  document.querySelector('#student-name').focus({ preventScroll: true });
}

function startGame(event) {
  event.preventDefault();
  const form = event.target;
  const nameInput = form.elements.name;
  const groupInput = form.elements.group;
  for (const input of [nameInput, groupInput]) {
    input.setCustomValidity(input.value.trim() ? '' : 'Escribe este dato para identificar tu informe.');
    if (!input.reportValidity()) {
      input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
      return;
    }
  }
  state = { version: GAME.version, id: crypto.randomUUID(), student: { name: nameInput.value.trim(), group: groupInput.value.trim() }, startedAt: Date.now(), finishedAt: null, room: 0, submitted: [], answers: {}, hints: {} };
  damagedSave = false;
  save();
  renderRoom();
  focusMain();
}

function resume() {
  if (state.finishedAt) renderResults();
  else renderRoom();
  focusMain();
}

function confirmRestart() {
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-labelledby', 'restart-title');
  dialog.innerHTML = '<h2 id="restart-title">¿Empezar otra misión?</h2><p class="muted">La partida actual se borrará de este navegador. Si ya has terminado, descarga tu informe antes de empezar otra.</p><div class="dialog-actions"><button class="button ghost" data-cancel>Conservar mi partida</button><button class="button primary" data-confirm>Empezar de nuevo</button></div>';
  document.body.append(dialog);
  dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
  dialog.querySelector('[data-confirm]').onclick = () => {
    state = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch { storageAvailable = false; }
    dialog.close();
    renderLanding();
    showStart();
  };
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.showModal();
}

function diagram(room) {
  return `<section class="case-file" aria-label="Planos y requisitos de la sala"><div class="case-header"><h2>Expediente de la sala</h2><span>${GAME.caseTag}</span></div><p class="case-context">${escapeHTML(room.context)}</p>${room.diagrams.map((plan, index) => `<figure class="plan-figure"><figcaption><strong>${escapeHTML(plan.title)}</strong><button class="button ghost small" data-open-plan="${index}" type="button" aria-label="Ampliar plano ${escapeHTML(plan.title)}">⛶ Ampliar plano</button></figcaption><img class="plan-image" src="${plan.src}" alt="${escapeHTML(plan.description)}" width="1100" loading="eager"><details class="plan-description"><summary>Leer descripción del plano</summary><p>${escapeHTML(plan.description)}</p></details></figure>`).join('')}<p class="plan-legend">${GAME.legend}</p>${window.SQLPractice ? window.SQLPractice.caseHTML(room) : ''}</section>`;
}

function openPlan(room, index) {
  const plan = room.diagrams[index];
  const dialog = document.createElement('dialog');
  dialog.className = 'plan-dialog';
  dialog.setAttribute('aria-labelledby', 'plan-dialog-title');
  dialog.innerHTML = `<div class="plan-dialog-header"><h2 id="plan-dialog-title">${escapeHTML(plan.title)}</h2><button class="button ghost small" data-close-plan type="button">Cerrar plano</button></div><p class="muted">Desplázate por el plano ampliado para leer todos sus detalles.</p><div class="plan-zoom" tabindex="0" role="region" aria-label="Plano ampliado; utiliza las flechas para desplazarte"><img src="${plan.src}" alt="${escapeHTML(plan.description)}" width="1320"></div>`;
  document.body.append(dialog);
  dialog.querySelector('[data-close-plan]').onclick = () => dialog.close();
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.showModal();
}

function questionHTML(question, index, locked = false) {
  const answer = state.answers[question.id];
  const usedHint = !!state.hints[question.id];
  const points = pointsFor(question);
  const correct = questionScore(question, answer, false) > 0;
  const inputHTML = question.type === 'sql' ? window.SQLPractice.questionHTML(question, answer, locked) : question.type === 'match'
    ? `<div class="matching">${question.rows.map((row, i) => `<div class="match-row"><label for="${question.id}-${i}">${escapeHTML(row)}</label><select id="${question.id}-${i}" data-question="${question.id}" data-row="${i}" ${locked ? 'disabled' : ''}><option value="">Selecciona una respuesta</option>${question.options.map((option) => `<option value="${escapeHTML(option)}" ${answer?.[i] === option ? 'selected' : ''}>${escapeHTML(option)}</option>`).join('')}</select></div>`).join('')}</div>`
    : `<fieldset class="choices" ${locked ? 'disabled' : ''}><legend>${escapeHTML(question.title)}</legend>${question.options.map((option) => `<label class="choice ${locked ? (option === question.answer ? 'correct' : 'incorrect') : ''}"><input type="radio" name="${question.id}" data-question="${question.id}" value="${escapeHTML(option)}" ${answer === option ? 'checked' : ''}><span>${escapeHTML(option)}</span></label>`).join('')}</fieldset>`;
  return `<article class="question-card" id="card-${question.id}"><div class="question-title"><span class="question-num">${String(index + 1).padStart(2, '0')}</span><h2>${question.title}</h2><span class="question-value">${locked ? `${number(points)} / 0,5` : '0,5 puntos'}</span></div><p class="question-prompt">${question.prompt}</p>${inputHTML}
    ${!locked ? `<button class="hint-button" type="button" data-hint="${question.id}" ${usedHint ? 'disabled' : ''}>✧ ${usedHint ? 'Pista utilizada · acierto: 0,25 puntos' : 'Necesito una pista · el acierto pasará a valer 0,25'}</button>` : ''}
    <p class="hint-box" id="hint-${question.id}" ${usedHint ? '' : 'hidden'}>${question.hint}</p>
    ${locked ? `<div class="feedback ${correct ? '' : 'wrong'}"><strong>${correct ? (usedHint ? 'Correcto, con pista · 0,25 puntos' : '¡Correcto! · 0,5 puntos') : 'Respuesta incorrecta · 0 puntos'}</strong>${!correct ? `<p>Solución: ${escapeHTML(solutionLabel(question))}.</p>` : ''}<p>${question.explanation}</p>${usedHint ? '<p>Pista utilizada: sí.</p>' : ''}</div>` : ''}
  </article>`;
}

function solutionLabel(question) {
  return question.type === 'match' ? question.rows.map((row, i) => `${row}: ${question.answer[i]}`).join('; ') : question.answer;
}

function renderRoom() {
  clearInterval(timer);
  const room = ROOMS[state.room];
  const locked = state.submitted.includes(room.id);
  main.innerHTML = `<div class="game">${storageNotice()}<div class="mission-bar"><span class="agent-name">Agente <strong>${escapeHTML(state.student.name)}</strong></span><div class="mission-stats"><span>◷ <span id="elapsed">${duration()}</span></span><span>Llaves <strong>${state.submitted.length}/5</strong></span></div></div><div class="game-layout">
    <aside class="sidebar" aria-label="Mapa de la misión"><p class="map-heading">Tu recorrido por el laboratorio</p>${ROOMS.map((item, i) => `<div role="group" aria-label="Sala ${i + 1}: ${item.name}${state.submitted.includes(item.id) ? ", completada" : i === state.room ? ", sala actual" : ", bloqueada"}" class="map-item ${i === state.room ? 'active' : ''} ${i > state.room ? 'locked' : ''}" style="--room-color:${item.color}" ${i === state.room ? 'aria-current="step"' : ''}><span class="room-icon" aria-hidden="true">${state.submitted.includes(item.id) ? '✓' : item.icon}</span><div><h3>${item.name}</h3><p>${i === state.room ? 'Estás aquí' : state.submitted.includes(item.id) ? 'Completada' : 'Puerta bloqueada'}</p></div><span class="map-status" aria-hidden="true">${state.submitted.includes(item.id) ? '✓' : i > state.room ? '·' : ''}</span></div>`).join('')}<div class="sidebar-note">Protocolo de salida<div class="key-slots">${ROOMS.map((item) => `<span class="key-slot ${state.submitted.includes(item.id) ? 'found' : ''}">${state.submitted.includes(item.id) ? item.key : '·'}</span>`).join('')}</div><p>Cada sala completada recupera una letra del protocolo. La nota depende de tus respuestas.</p><button class="button ghost small" id="home-button" type="button">Guardar y salir</button></div></aside>
    <section class="room-content" style="--room-color:${room.color}" aria-labelledby="room-title"><div class="room-heading"><div><span class="eyebrow">Sala 0${state.room + 1} / 05 · ${room.topic}</span><h1 id="room-title">${room.name}</h1><p class="room-story">${room.story}</p></div><span class="room-icon" aria-hidden="true">${room.icon}</span></div>${diagram(room)}
    <form id="room-form" novalidate><div class="questions">${room.questions.map((q, i) => questionHTML(q, i, locked)).join('')}</div>
    ${!locked ? '<div class="submit-panel"><p>Comprueba las cuatro pruebas para abrir la puerta. Al comprobar, las respuestas quedarán cerradas.</p><button class="button primary" type="submit">Comprobar y abrir puerta <span aria-hidden="true">↗</span></button></div><p id="room-error" class="form-error" role="alert"></p>' : ''}</form>
    ${locked ? `<section class="room-unlocked" id="unlocked" tabindex="-1"><div class="unlocked-header"><span class="earned-key">${room.key}</span><div><h2>Puerta abierta. Llave recuperada.</h2><p>Has conseguido ${number(roomScore(room))} de 2 puntos en esta sala. Revisa las explicaciones antes de continuar.</p></div></div><button id="next-button" class="button mint" type="button">${state.room === 4 ? 'Activar la salida y ver mi nota' : 'Entrar en la siguiente sala'} <span aria-hidden="true">↗</span></button></section>` : ''}
    </section></div></div>`;
  document.querySelectorAll('[data-open-plan]').forEach((button) => button.onclick = () => openPlan(room, Number(button.dataset.openPlan)));
  window.SQLPractice?.mountRoom(room, locked);
  document.querySelector('#home-button').onclick = () => { save(); renderLanding(); focusMain(); };
  document.querySelector('#room-form').addEventListener('change', (event) => {
    const input = event.target;
    if (locked || !input.dataset.question) return;
    const question = room.questions.find((q) => q.id === input.dataset.question);
    if (question.type === 'sql') return;
    if (question.type === 'match') {
      if (!Array.isArray(state.answers[question.id])) state.answers[question.id] = question.rows.map(() => '');
      state.answers[question.id][Number(input.dataset.row)] = input.value;
    } else state.answers[question.id] = input.value;
    save();
  });
  document.querySelectorAll('[data-hint]').forEach((button) => button.addEventListener('click', () => {
    state.hints[button.dataset.hint] = true;
    save();
    document.querySelector(`#hint-${button.dataset.hint}`).hidden = false;
    button.textContent = '✧ Pista utilizada · acierto: 0,25 puntos';
    button.disabled = true;
  }));
  document.querySelector('#room-form').addEventListener('submit', submitRoom);
  document.querySelector('#next-button')?.addEventListener('click', nextRoom);
  timer = setInterval(() => {
    const display = document.querySelector('#elapsed');
    if (display) display.textContent = duration();
  }, 1000);
}

function answerComplete(question, answer) {
  if (question.type === 'sql') return validAnswer(question, answer) && !!answer.sql.trim();
  return validAnswer(question, answer) && (question.type !== 'match' || answer.every(Boolean));
}

async function submitRoom(event) {
  event.preventDefault();
  const room = ROOMS[state.room];
  if (state.submitted.includes(room.id)) return;
  const missing = room.questions.find((question) => !answerComplete(question, state.answers[question.id]));
  if (missing) {
    document.querySelector('#room-error').textContent = 'Responde todas las pruebas de la sala. En las asociaciones, elige una respuesta en cada fila.';
    const card = document.querySelector(`#card-${missing.id}`);
    card.scrollIntoView({ behavior: 'instant', block: 'center' });
    card.querySelector('input, select, textarea').focus({ preventScroll: true });
    return;
  }
  if (window.SQLPractice) {
    const form = document.querySelector('#room-form');
    const errorDisplay = document.querySelector('#room-error');
    form.inert = true;
    errorDisplay.textContent = 'Comprobando las consultas con los datos de academia…';
    try { await window.SQLPractice.gradeRoom(room); }
    catch (error) { errorDisplay.textContent = error.message; return; }
    finally { form.inert = false; }
  }
  state.submitted.push(room.id);
  save();
  renderRoom();
  document.querySelector('#unlocked').focus();
}

function nextRoom() {
  if (!state.submitted.includes(ROOMS[state.room].id)) return;
  if (state.room === ROOMS.length - 1) {
    state.finishedAt = Date.now();
    save();
    renderResults();
  } else {
    state.room += 1;
    save();
    renderRoom();
  }
  focusMain();
}

function renderResults() {
  clearInterval(timer);
  const grade = totalScore();
  const correctCount = questions.filter((q) => questionScore(q, state.answers[q.id], false) > 0).length;
  main.innerHTML = `<div class="results"><section class="result-hero"><div class="escape-icon" aria-hidden="true">⌘</div><span class="eyebrow">Protocolo restaurado · Misión completada</span><h1>Has encontrado la salida.</h1><p>El laboratorio vuelve a estar conectado, ${escapeHTML(state.student.name)}. Tu recorrido ya tiene informe: descárgalo para entregar la actividad.</p><div class="result-keys" aria-label="Protocolo de salida">${ROOMS.map((room) => `<span class="key-slot found">${room.key}</span>`).join('')}</div></section>
    ${storageNotice()}<div class="result-grid"><section class="grade-card" aria-labelledby="grade-title"><span class="grade-label" id="grade-title">Tu nota final</span><div class="grade-number">${number(grade)}<span> / 10</span></div><p class="grade-message">${grade >= 9 ? 'Gran trabajo, agente. Misión dominada.' : grade >= 5 ? 'Misión superada. Sigue conectando ideas.' : 'Recorrido completado. Revisa las explicaciones.'}</p><div class="grade-details"><div><span>Agente</span><strong>${escapeHTML(state.student.name)}</strong></div><div><span>Curso y grupo</span><strong>${escapeHTML(state.student.group)}</strong></div><div><span>Aciertos</span><strong>${correctCount} de 20</strong></div><div><span>Pistas utilizadas</span><strong>${hintsCount()}</strong></div><div><span>Tiempo de misión</span><strong>${duration()}</strong></div></div></section>
    <section class="breakdown"><h2>Así has conectado las piezas</h2>${ROOMS.map((room) => `<div class="breakdown-row" style="--room-color:${room.color}"><div class="breakdown-label"><span>${room.name}</span><strong>${number(roomScore(room))} / 2</strong></div><div class="progress-track" role="meter" aria-label="Puntos en ${room.name}" aria-valuemin="0" aria-valuemax="2" aria-valuenow="${roomScore(room)}"><span style="width:${roomScore(room) * 50}%"></span></div></div>`).join('')}<p class="form-note">Acierto: 0,5 puntos. Acierto con pista: 0,25. Error: 0. Las asociaciones puntúan si todas sus filas son correctas.</p></section></div>
    <section class="download-panel"><div><h2>Tu última puerta está en Moodle.</h2><p>Descarga el PDF con tu nombre, nota, respuestas y correcciones. Después, adjúntalo en la tarea que te indique tu profesor y confirma la entrega.</p></div><button class="button primary" id="download-button" type="button">↓ Descargar informe PDF</button></section><p id="download-status" class="live-status" role="status" aria-live="polite"></p>
    <p class="result-footnote">Finalizada el ${dateLabel(state.finishedAt)} (hora de Madrid). Referencia de intento: ${escapeHTML(state.id)}. Conserva tu PDF antes de iniciar otra partida.</p>
    <details class="review-details"><summary>Revisar todas mis respuestas y explicaciones</summary>${ROOMS.map((room) => `<section class="review-room"><h3>${room.name} · ${number(roomScore(room))} / 2</h3>${room.questions.map((q, i) => questionHTML(q, i, true)).join('')}</section>`).join('')}</details>
    <div class="result-actions"><button class="button ghost small" id="results-home" type="button">Volver al inicio</button><button class="button ghost small" id="restart-button" type="button">Empezar otra misión</button></div></div>`;
  document.querySelector('#download-button').onclick = downloadReport;
  document.querySelector('#restart-button').onclick = confirmRestart;
  document.querySelector('#results-home').onclick = () => { renderLanding(); focusMain(); };
}

async function downloadReport() {
  const button = document.querySelector('#download-button');
  const status = document.querySelector('#download-status');
  button.disabled = true;
  status.textContent = 'Preparando tu informe…';
  try {
    if (!window.jspdf?.jsPDF) throw new Error('PDF library unavailable');
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    doc.setProperties({ title: `Informe ${GAME.title} - ${state.student.name}`, subject: GAME.reportTopic, author: state.student.name });
    const pageWidth = 174;
    let y = 20;
    // shortcut: el informe usa Helvetica y caracteres latinos; incrustar una fuente Unicode si se necesitan otros alfabetos.
    const pdfText = (value) => String(value).replace(/[–—−]/g, '-').replace(/[«»“”]/g, '"').replace(/[‘’]/g, "'").replace(/→/g, ' -> ').replace(/·/g, ' - ').replace(/[₀-₉]/g, '').replace(/≈/g, '~');
    const write = (value, size = 10, bold = false, color = [48, 48, 68]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(pdfText(value), pageWidth);
      const lineHeight = size * 0.48;
      for (const line of lines) {
        if (y + lineHeight > 277) { doc.addPage(); y = 20; }
        doc.text(line, 18, y);
        y += lineHeight;
      }
      y += 2;
    };
    doc.setFillColor(29, 28, 53);
    doc.rect(0, 0, 210, 49, 'F');
    write(GAME.title.toUpperCase(), 24, true, [211, 193, 255]);
    write(GAME.reportSubtitle, 12, false, [239, 235, 255]);
    write(GAME.reportTopic, 10, false, [207, 202, 227]);
    y = 60;
    write(`Alumno/a: ${state.student.name}`, 12, true);
    write(`Curso y grupo: ${state.student.group}`);
    write(`Inicio: ${dateLabel(state.startedAt)} | Fin: ${dateLabel(state.finishedAt)} (Europe/Madrid)`);
    write(`Tiempo transcurrido: ${duration()} | Intento: ${state.id}`, 9);
    y += 4;
    const grade = totalScore();
    write(`NOTA FINAL: ${number(grade)} / 10`, 22, true, [97, 66, 155]);
    write(`Resultado: ${grade >= 5 ? 'APROBADO' : 'NO APROBADO'} | Salas completadas: 5 / 5`);
    write(`Aciertos: ${questions.filter((q) => questionScore(q, state.answers[q.id], false) > 0).length} / 20 | Pistas usadas: ${hintsCount()}`);
    y += 3;
    write('Criterios de calificación', 12, true);
    write('20 pruebas, 0,5 puntos por acierto. Con pista, el acierto vale 0,25. Un error vale 0 y no resta. Cada asociación puntúa solo si todas sus filas son correctas. No hay penalización por tiempo. La primera corrección de cada sala cierra sus respuestas.', 9);
    y += 3;
    write('Desglose por sala', 12, true);
    ROOMS.forEach((room, i) => write(`${i + 1}. ${room.name}: ${number(roomScore(room))} / 2 puntos`, 10));
    y += 4;
    write('Entrega: sube este PDF a la tarea de Moodle y confirma la entrega.', 10, true);
    write('Informe generado en el navegador. La referencia identifica el intento; no es una firma ni una certificación de identidad o de integridad de la nota.', 8, false, [100, 100, 115]);
    for (const room of ROOMS) {
      doc.addPage();
      y = 20;
      write(`${room.name} - ${number(roomScore(room))} / 2`, 16, true, [97, 66, 155]);
      write(room.context, 9);
      for (const plan of room.diagrams) {
        const image = new Image();
        image.src = plan.src;
        await image.decode();
        const height = pageWidth * image.naturalHeight / image.naturalWidth;
        if (y + height + 12 > 277) { doc.addPage(); y = 20; }
        write(plan.title, 11, true);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth * 2;
        canvas.height = image.naturalHeight * 2;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        doc.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 18, y, pageWidth, height);
        y += height + 5;
        write(`Descripción del plano: ${plan.description}`, 8);
      }
      for (const question of room.questions) {
        if (y > 228) { doc.addPage(); y = 20; }
        y += 3;
        write(`${question.id.slice(1)}. ${question.title}`, 11, true);
        write(question.prompt, 9);
        const answer = state.answers[question.id];
        write(`Respuesta del alumno: ${Array.isArray(answer) ? question.rows.map((row, i) => `${row}: ${answer[i]}`).join('; ') : question.type === 'sql' ? answer.sql : answer}`, 9);
        if (question.type === 'sql') write(window.SQLPractice.reportResult(answer), 8);
        write(`Respuesta correcta: ${solutionLabel(question)}`, 9);
        write(`Puntuación: ${number(pointsFor(question))} / 0,5 | Pista utilizada: ${state.hints[question.id] ? 'Sí' : 'No'}`, 9, true);
        if (state.hints[question.id]) write(`Pista: ${question.hint}`, 9);
        write(`Explicación: ${question.explanation}`, 9);
        write(`Contenido: ${question.source}`, 8, false, [100, 100, 115]);
      }
    }
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);
      doc.setDrawColor(220, 215, 232);
      doc.line(18, 283, 192, 283);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(115, 110, 130);
      doc.text(`${GAME.title} | ${state.id}`, 18, 289);
      doc.text(`${page} / ${pages}`, 192, 289, { align: 'right' });
    }
    const filename = `${GAME.filePrefix}_${state.student.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 75)}_${state.id.slice(0, 8)}.pdf`;
    await doc.save(filename, { returnPromise: true });
    status.textContent = 'Informe generado. Comprueba la carpeta de descargas y adjunta el PDF en Moodle.';
  } catch (error) {
    console.error('No se pudo generar el informe PDF.', error);
    status.textContent = 'No se pudo generar el PDF. Tu resultado sigue aquí: vuelve a pulsar Descargar informe PDF. Si continúa fallando, recarga la página y retoma tu misión.';
  } finally {
    button.disabled = false;
  }
}

document.querySelector('#help-button').addEventListener('click', () => helpDialog.showModal());
helpDialog.querySelectorAll('.dialog-close, .dialog-close-action').forEach((button) => button.onclick = () => helpDialog.close());
renderLanding();
