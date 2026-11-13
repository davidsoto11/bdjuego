importScripts("../vendor/sqljs/sql-wasm.js", "data.js", "sql-core.js");
let database;
initSqlJs({
  locateFile: (file) =>
    new URL("../vendor/sqljs/" + file, self.location.href).href,
})
  .then((SQL) => {
    database = new SQL.Database();
    database.run(ACADEMIA_SQL);
    database.run("PRAGMA query_only = ON;");
    postMessage({ ready: true });
  })
  .catch(() =>
    postMessage({
      fatal:
        "No se pudo cargar el motor SQL. Comprueba la conexión y vuelve a intentarlo.",
    }),
  );
onmessage = ({ data }) => {
  try {
    const result = executeReadOnly(database, data.sql);
    const correct = data.expected
      ? sameResult(
          result,
          executeReadOnly(database, data.expected),
          !!data.ordered,
        )
      : undefined;
    postMessage({ result, correct });
  } catch (error) {
    postMessage({ error: String(error.message).slice(0, 2000) });
  }
};
