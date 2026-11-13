/* Funciones compartidas por el worker del navegador y las pruebas de consultas. */
function executeReadOnly(db, sql) {
  if (typeof sql !== "string" || sql.length > 12000)
    throw new Error("La consulta debe tener como máximo 12.000 caracteres.");
  if (!/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*(SELECT|WITH)\b/i.test(sql))
    throw new Error(
      "Escribe una consulta SELECT o WITH. El laboratorio es de solo lectura.",
    );
  const iterator = db.iterateStatements(sql);
  let statement;
  try {
    const first = iterator.next();
    if (first.done) throw new Error("Escribe una consulta.");
    statement = first.value;
    const columns = statement.getColumnNames();
    if (!columns.length) throw new Error("La consulta debe devolver columnas.");
    if (columns.length > 30)
      throw new Error("Devuelve como máximo 30 columnas.");
    const values = [];
    let textSize = 0;
    while (statement.step()) {
      if (values.length === 200)
        throw new Error(
          "El resultado supera las 200 filas. Revisa las uniones y los filtros.",
        );
      const row = statement.get();
      for (const cell of row) {
        if (
          cell !== null &&
          typeof cell !== "string" &&
          typeof cell !== "number"
        )
          throw new Error("Devuelve texto, números o NULL, no datos binarios.");
        if (typeof cell === "number" && !Number.isFinite(cell))
          throw new Error("El resultado contiene un número infinito.");
        if (typeof cell === "string") textSize += cell.length;
      }
      if (textSize > 50000)
        throw new Error(
          "El resultado contiene demasiado texto. Reduce las columnas o las filas.",
        );
      values.push(row);
    }
    // El iterador analiza el SQL real: no confunde un punto y coma dentro de texto con otra sentencia.
    const next = iterator.next();
    if (!next.done) {
      next.value.free();
      throw new Error("Ejecuta una sola consulta cada vez.");
    }
    return { columns, values };
  } finally {
    if (statement) statement.free();
  }
}
function sameResult(actual, expected, ordered = false) {
  if (
    actual.columns.length !== expected.columns.length ||
    actual.values.length !== expected.values.length
  )
    return false;
  const rows = (result) => result.values.map((row) => JSON.stringify(row));
  const left = rows(actual),
    right = rows(expected);
  if (!ordered) {
    left.sort();
    right.sort();
  }
  return left.every((row, index) => row === right[index]);
}
if (typeof module !== "undefined")
  module.exports = { executeReadOnly, sameResult };
