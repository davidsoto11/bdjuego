window.SQLPractice = {
  validAnswer(answer) {
    if (!answer || typeof answer.sql !== "string" || answer.sql.length > 12000)
      return false;
    if (answer.correct !== undefined && typeof answer.correct !== "boolean")
      return false;
    if (
      answer.error !== undefined &&
      (typeof answer.error !== "string" || answer.error.length > 2000)
    )
      return false;
    if (answer.result) {
      const result = answer.result;
      if (
        !Array.isArray(result.columns) ||
        result.columns.length > 30 ||
        !result.columns.every((c) => typeof c === "string") ||
        !Array.isArray(result.values) ||
        result.values.length > 200
      )
        return false;
      if (
        !result.values.every(
          (row) =>
            Array.isArray(row) &&
            row.length === result.columns.length &&
            row.every(
              (cell) =>
                cell === null ||
                typeof cell === "string" ||
                typeof cell === "number",
            ),
        )
      )
        return false;
    }
    return true;
  },
  run(sql, expected, ordered) {
    return new Promise((resolve, reject) => {
      const worker = new Worker("sql-worker.js");
      let limit = setTimeout(
        () =>
          finish(
            new Error(
              "El motor SQL tarda en cargar. Comprueba la conexión y vuelve a ejecutar la consulta.",
            ),
          ),
        20000,
      );
      function finish(error, result) {
        clearTimeout(limit);
        worker.terminate();
        error ? reject(error) : resolve(result);
      }
      worker.onerror = () =>
        finish(
          new Error(
            "No se pudo iniciar el motor SQL. Recarga la página e inténtalo de nuevo.",
          ),
        );
      worker.onmessage = ({ data }) => {
        if (data.ready) {
          clearTimeout(limit);
          limit = setTimeout(
            () =>
              finish(null, {
                error:
                  "Consulta detenida: supera el tiempo de ejecución. Revisa productos cartesianos o recursión.",
              }),
            1500,
          );
          worker.postMessage({ sql, expected, ordered });
        } else if (data.fatal) finish(new Error(data.fatal));
        else finish(null, data);
      };
    });
  },
  table(result, caption) {
    return `<div class="sql-table-scroll" tabindex="0" role="region" aria-label="${escapeHTML(caption)}"><table class="sql-table"><caption>${escapeHTML(caption)}</caption><thead><tr>${result.columns.map((c) => `<th scope="col">${escapeHTML(c)}</th>`).join("")}</tr></thead><tbody>${result.values.map((row) => `<tr>${row.map((cell) => `<td>${cell === null ? '<span class="null-value">NULL</span>' : escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>${result.values.length ? "" : '<p class="sql-empty">La consulta devuelve 0 filas.</p>'}</div>`;
  },
  caseHTML() {
    return `<details class="data-explorer" open><summary>Explorar los datos de academia <span>5 tablas · mismos datos en todos los retos</span></summary><div class="table-tabs" role="group" aria-label="Elegir tabla">${Object.entries(
      ACADEMIA_TABLES,
    )
      .map(
        ([name, table], i) =>
          `<button class="table-tab ${i === 0 ? "selected" : ""}" type="button" data-table="${name}" aria-pressed="${i === 0}">${name}<span>${table.values.length}</span></button>`,
      )
      .join(
        "",
      )}</div><div id="source-table">${this.table(ACADEMIA_TABLES.sede, "Tabla sede · datos de partida")}</div><p class="sql-engine-note">Los editores ejecutan SELECT sobre una copia local de academia con SQLite. Usa la sintaxis común de los apuntes; no escribas CREATE DATABASE, USE ni órdenes de modificación. La simulación de FULL para MariaDB se trabaja en el reto 18.</p><a class="sql-download" href="academia.sql" download>↓ Descargar tablas y datos de ejemplo (.sql)</a></details>`;
  },
  resultHTML(answer) {
    return answer?.error
      ? `<p class="sql-error" role="status">${escapeHTML(answer.error)}</p>`
      : answer?.result
        ? this.table(
            answer.result,
            `Resultado ejecutado · ${answer.result.values.length} filas`,
          )
        : "";
  },
  questionHTML(question, answer, locked) {
    return `<div class="sql-editor"><label for="sql-${question.id}">Tu consulta SQL</label><textarea id="sql-${question.id}" data-sql="${question.id}" rows="8" maxlength="12000" spellcheck="false" autocapitalize="off" ${locked ? "disabled" : ""}>${escapeHTML(answer?.sql ?? question.starter)}</textarea><div class="sql-editor-actions">${locked ? "<span>Consulta cerrada al corregir la sala</span>" : `<button class="button ghost small" type="button" data-run-sql="${question.id}">▷ Ejecutar consulta</button><span>Ejecutar prueba el SQL; comprobar la sala fija la nota.</span>`}</div><div id="sql-output-${question.id}" class="sql-output" aria-live="polite">${this.resultHTML(answer)}</div>${locked ? `<details class="sql-reference"><summary>Ver una consulta de referencia</summary><pre><code>${escapeHTML(question.answer)}</code></pre></details>` : ""}</div>`;
  },
  mountRoom(room, locked) {
    document.querySelectorAll("[data-table]").forEach(
      (button) =>
        (button.onclick = () => {
          document.querySelectorAll("[data-table]").forEach((tab) => {
            tab.classList.toggle("selected", tab === button);
            tab.setAttribute("aria-pressed", tab === button ? "true" : "false");
          });
          const name = button.dataset.table;
          document.querySelector("#source-table").innerHTML = this.table(
            ACADEMIA_TABLES[name],
            `Tabla ${name} · datos de partida`,
          );
        }),
    );
    if (locked) return;
    for (const question of room.questions.filter((q) => q.type === "sql")) {
      const editor = document.querySelector(`#sql-${question.id}`);
      if (!state.answers[question.id])
        state.answers[question.id] = { sql: question.starter };
      editor.addEventListener("input", () => {
        state.answers[question.id] = { sql: editor.value };
        document.querySelector(`#sql-output-${question.id}`).textContent = "";
        save();
      });
      document.querySelector(`[data-run-sql="${question.id}"]`).onclick =
        async (event) => {
          const button = event.currentTarget;
          const output = document.querySelector(`#sql-output-${question.id}`);
          const sql = editor.value;
          button.disabled = true;
          output.textContent = "Ejecutando sobre los datos de academia…";
          try {
            const record = await this.run(sql);
            if (
              state?.answers[question.id]?.sql !== sql ||
              state.submitted.includes(room.id)
            )
              return;
            state.answers[question.id] = { sql, ...record };
            save();
            output.innerHTML = this.resultHTML(record);
          } catch (error) {
            output.textContent = error.message;
          } finally {
            button.disabled = false;
          }
        };
    }
  },
  async gradeRoom(room) {
    for (const question of room.questions.filter((q) => q.type === "sql")) {
      const sql = state.answers[question.id].sql;
      const record = await this.run(sql, question.answer, question.ordered);
      state.answers[question.id] = {
        sql,
        ...record,
        correct: record.correct === true,
      };
    }
  },
  reportResult(answer) {
    if (answer.error) return `Error de ejecución: ${answer.error}`;
    if (!answer.result) return "";
    return `Resultado ejecutado (${answer.result.values.length} filas):\n${answer.result.columns.join(" | ")}\n${answer.result.values.map((row) => row.map((cell) => (cell === null ? "NULL" : cell)).join(" | ")).join("\n")}`;
  },
};
