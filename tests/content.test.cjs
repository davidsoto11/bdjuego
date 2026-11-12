const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ROOMS, questionScore } = require('../content.js');
const questions = ROOMS.flatMap((room) => room.questions);
const fs = require('node:fs');
const path = require('node:path');

test('el recorrido contiene cinco salas, veinte pruebas y un máximo de diez puntos', () => {
  assert.equal(ROOMS.length, 5);
  assert.ok(ROOMS.every((room) => room.questions.length === 4));
  assert.equal(questions.length, 20);
  assert.equal(new Set(questions.map((q) => q.id)).size, 20);
  assert.equal(questions.reduce((total, q) => total + questionScore(q, q.answer, false), 0), 10);
  assert.equal(questions.reduce((total, q) => total + questionScore(q, q.answer, true), 0), 5);
});

test('todas las soluciones son opciones disponibles y tienen pista, explicación y fuente', () => {
  for (const q of questions) {
    for (const answer of [q.answer].flat()) assert.ok(q.options.includes(answer), q.id);
    assert.equal(new Set(q.options).size, q.options.length);
    if (q.type === 'match') assert.equal(q.rows.length, q.answer.length);
    assert.ok(q.hint && q.explanation && q.source);
  }
});

test('fallar o no contestar da cero; la pista reduce solo un acierto', () => {
  for (const q of questions) {
    assert.equal(questionScore(q, undefined, false), 0);
    assert.equal(questionScore(q, '', true), 0);
    const wrong = q.type === 'match' ? q.answer.map(() => 'incorrecta') : q.options.find((option) => option !== q.answer);
    assert.equal(questionScore(q, wrong, false), 0);
    assert.equal(questionScore(q, wrong, true), 0);
  }
});

test('las asociaciones requieren todas las filas correctas y en su lugar', () => {
  const q = questions.find((item) => item.type === 'match');
  assert.equal(questionScore(q, q.answer.slice(1), false), 0);
  assert.equal(questionScore(q, [...q.answer].reverse(), false), 0);
  assert.equal(questionScore(q, [...q.answer, 'extra'], false), 0);
  assert.equal(questionScore(q, q.answer, true), 0.25);
});

test('cada sala aporta contexto y planos SVG locales con descripción accesible', () => {
  for (const room of ROOMS) {
    assert.ok(room.context);
    assert.ok(room.diagrams.length > 0);
    for (const diagram of room.diagrams) {
      assert.ok(diagram.title && diagram.description.length > 100);
      const svg = fs.readFileSync(path.join(__dirname, '..', diagram.src), 'utf8');
      assert.match(svg, /viewBox="0 0 1100 /);
      assert.doesNotMatch(svg, /<script|<foreignObject|https?:\/\/(?!www.w3.org)/);
    }
  }
  assert.equal(ROOMS.flatMap(room => room.diagrams).length, 6);
});
