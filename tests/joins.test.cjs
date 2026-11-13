const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../vendor/sqljs/sql-wasm.js');
const { ACADEMIA_SQL, ACADEMIA_TABLES } = require('../joins/data.js');
const { ROOMS, questionScore } = require('../joins/content.js');
const { executeReadOnly, sameResult } = require('../joins/sql-core.js');
let db;
before(async () => {
  const SQL = await init({ locateFile: name => path.resolve(__dirname, '../vendor/sqljs', name) });
  db = new SQL.Database(); db.run(ACADEMIA_SQL); db.run('PRAGMA query_only=ON');
});
after(() => db?.close());
const queries = ROOMS.flatMap(room => room.questions).filter(q => q.type === 'sql');
const run = sql => executeReadOnly(db, sql);

test('se conservan los 33 registros de academia y las cinco tablas del ejemplo', () => {
  for (const [name, table] of Object.entries(ACADEMIA_TABLES)) assert.deepEqual(run(`SELECT * FROM ${name}`), table);
  assert.deepEqual(Object.values(ACADEMIA_TABLES).map(t => t.values.length), [3,6,7,7,10]);
});
test('hay 20 pruebas, diez de escritura, y las notas mantienen su escala', () => {
  const questions = ROOMS.flatMap(room => room.questions);
  assert.equal(questions.length,20); assert.equal(queries.length,10);
  for (const q of questions) {
    const answer = q.type === 'sql' ? { sql:q.answer,correct:true } : q.answer;
    assert.equal(questionScore(q,answer,false),0.5);
    assert.equal(questionScore(q,answer,true),0.25);
    assert.equal(questionScore(q,undefined,false),0);
    assert.ok(q.hint && q.explanation && q.source);
    if(q.type === 'match') for(const value of q.answer) assert.ok(q.options.includes(value));
    else if(q.type !== 'sql') assert.ok(q.options.includes(q.answer));
  }
});
test('las diez soluciones SQL producen las filas y casos límite previstos', () => {
  const expectedCounts = {j2:6,j5:7,j7:8,j9:1,j11:2,j13:6,j15:7,j17:4,j18:7,j20:15};
  for(const q of queries) {
    const actual=run(q.answer);
    assert.equal(actual.values.length,expectedCounts[q.id],q.id);
  }
  const result = id => run(queries.find(q=>q.id===id).answer).values;
  assert.deepEqual(result('j9'), [[107,'Portugués A1']]);
  assert.deepEqual(result('j11'), [[1,'Málaga Centro'],[2,'Sevilla Triana']]);
  assert.deepEqual(result('j15').map(r=>r[2]),[2,2,2,2,1,1,0]);
  assert.deepEqual(result('j17'),[['Córdoba'],['Granada'],['Málaga'],['Sevilla']]);
  assert.equal(result('j5').filter(r=>r[1]===null).length,1);
  assert.equal(result('j7').filter(r=>r[1]===null).length,3);
  assert.equal(result('j13').filter(r=>r[1]===null).length,2);
});
test('conteos y trampas de los retos teóricos se comprueban con SQL real', () => {
  const count = query => run(query).values.length;
  const relation = 'profesor p INNER JOIN sede s ON p.CodSede=s.CodSede';
  assert.equal(count(`SELECT * FROM ${relation}`),5);
  assert.equal(count(`SELECT * FROM ${relation.replace('INNER','LEFT')}`),6);
  assert.equal(count(`SELECT * FROM ${relation.replace('INNER','RIGHT')}`),6);
  assert.equal(count(`SELECT * FROM ${relation.replace('INNER','FULL OUTER')}`),7);
  assert.equal(count('SELECT * FROM profesor CROSS JOIN sede'),18);
  assert.equal(count('SELECT * FROM alumno NATURAL JOIN sede'),6);
  assert.equal(count('SELECT * FROM alumno a LEFT JOIN matricula m ON a.CodAlu=m.CodAlu AND m.Nota>=8'),8);
  assert.equal(count('SELECT * FROM alumno a LEFT JOIN matricula m ON a.CodAlu=m.CodAlu WHERE m.Nota>=8'),5);
  assert.deepEqual(run('SELECT a.NomAlu FROM alumno a LEFT JOIN matricula m ON a.CodAlu=m.CodAlu WHERE m.Nota IS NULL').values,[['Sergio'],['Hugo'],['Marina']]);
  assert.equal(count('SELECT * FROM profesor WHERE CodProf NOT IN (SELECT CodProf FROM curso)'),0);
  assert.deepEqual(run('SELECT p.NomProf FROM profesor p JOIN profesor mentor ON p.CodMentor=mentor.CodProf WHERE p.CodSede<>mentor.CodSede').values,[['Andrés']]);
});
test('se aceptan alternativas y alias; se conservan NULL, multiplicidades y orden exigido', () => {
  const expected=run(queries.find(q=>q.id==='j11').answer);
  const equivalent=run('SELECT DISTINCT s.CodSede AS codigo,s.NomSede AS nombre FROM sede s JOIN profesor p USING(CodSede) ORDER BY s.CodSede DESC');
  assert.ok(sameResult(equivalent,expected,false));
  assert.ok(!sameResult(equivalent,expected,true));
  assert.ok(!sameResult(run('SELECT 1 UNION ALL SELECT 1'),run('SELECT 1'),false));
  assert.ok(!sameResult(run("SELECT ''"),run('SELECT NULL'),false));
  assert.ok(!sameResult(run('SELECT 1,2'),run('SELECT 2,1'),false));
});
test('el editor solo lee una sentencia y limita los resultados', () => {
  assert.throws(()=>run('DELETE FROM alumno'),/solo lectura/);
  assert.throws(()=>run('WITH x AS (SELECT 1) DELETE FROM alumno RETURNING CodAlu'),/readonly/);
  assert.throws(()=>run('SELECT 1; DELETE FROM alumno;'),/sola consulta/);
  assert.equal(run("-- comentario\nSELECT ';' AS texto;").values[0][0],';');
  assert.throws(()=>run('SELECT'),/incomplete input/);
  assert.throws(()=>run("SELECT X'0102'"),/binarios/);
  assert.throws(()=>run('SELECT 1e999'),/infinito/);
  assert.throws(()=>run('SELECT '+Array(31).fill('1').join(',')),/30 columnas/);
  assert.throws(()=>run("SELECT printf('%60000s', 'texto')"),/demasiado texto/);
  assert.throws(()=>run('WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<201) SELECT x FROM n'),/200 filas/);
  assert.equal(run('SELECT COUNT(*) FROM alumno').values[0][0],7);
});
