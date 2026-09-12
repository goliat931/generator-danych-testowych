// ====================================================
// Generatory danych i formaty eksportu (CSV/XML/SQL) żyją teraz we wspólnym
// static/data-generators.js, żeby ta sama logika (m.in. sumy kontrolne
// PESEL/NIP/REGON/NRB) była współdzielona ze stroną API (static/api.js).
// ====================================================
const DataGenerators =
  typeof module !== "undefined" && module.exports
    ? require("./data-generators.js")
    : window.DataGenerators;

const {
  generateCsv,
  generateXml,
  escapeXml,
  generateSql,
  escapeSqlValue,
  escapeSqlIdentifier,
} = DataGenerators;

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateCsv,
    generateXml,
    escapeXml,
    generateSql,
    escapeSqlValue,
    escapeSqlIdentifier,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // ====================================================
  // 1. Inicjalizacja trybu ciemnego
  // ====================================================
  function initTheme() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

    const applyTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      if (themeToggleBtn) {
        const titleText =
          theme === "dark" ? "Włącz motyw jasny" : "Włącz motyw ciemny";
        themeToggleBtn.setAttribute("aria-label", titleText);
        themeToggleBtn.setAttribute("title", titleText);
      }
    };

    applyTheme(currentTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        currentTheme = currentTheme === "light" ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
        applyTheme(currentTheme);
      });
    }
  }
  initTheme();

  // ====================================================
  // 2. Załaduj dane referencyjne (banki, imiona, nazwiska) - potrzebne
  //    przez generateRecord() ze wspólnego modułu data-generators.js
  // ====================================================
  DataGenerators.loadReferenceData().catch((err) =>
    console.error("Błąd załadowania danych:", err),
  );

  // ====================================================
  // 4. Toggle separator section
  // ====================================================
  document.querySelectorAll('input[name="export-format"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const separatorSection = document.getElementById("separatorFieldWrapper");
      separatorSection.style.display = radio.value === "csv" ? "flex" : "none";
      const sqlTableSection = document.getElementById("sqlTableFieldWrapper");
      if (sqlTableSection) {
        sqlTableSection.style.display = radio.value === "sql" ? "flex" : "none";
      }
    });
  });

  // ====================================================
  // 5. Drag & Drop (zmiana kolejności) i Podgląd nazwy
  // ====================================================

  // Pokazywanie oryginalnej nazwy pola, jeśli została zmodyfikowana / Show original field name if it was modified
  document.querySelectorAll(".draggable-item").forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    const input = item.querySelector(".field-name-input");
    if (input) {
      // Setup initial ARIA labels
      if (checkbox) {
        checkbox.setAttribute("aria-label", `Dołącz pole ${input.value}`);
      }
      input.setAttribute("aria-label", "Nazwa pola w wygenerowanym pliku");

      const originalName = input.getAttribute("value");
      const hint = document.createElement("small");
      hint.className = "original-name-hint";
      // Ustawienie tekstu informacyjnego z oryginalną nazwą / Set informational text with original name
      hint.textContent = `(oryginalnie: ${originalName})`;
      hint.style.color = "var(--text-secondary)";
      hint.style.fontSize = "0.75rem";
      hint.style.marginLeft = "8px";
      hint.style.whiteSpace = "nowrap";
      hint.style.display =
        input.value.trim() !== originalName ? "inline" : "none";

      // Nasłuchiwanie zmian na polu tekstowym / Listen to changes on text input
      input.addEventListener("input", () => {
        if (input.value.trim() !== originalName) {
          hint.style.display = "inline";
        } else {
          hint.style.display = "none";
        }

        // Dynamically update checkbox aria-label
        if (checkbox) {
          checkbox.setAttribute(
            "aria-label",
            `Dołącz pole ${input.value || originalName}`,
          );
        }
      });

      item.appendChild(hint);
    }
  });

  let draggedElement = null;

  document.querySelectorAll(".draggable-item").forEach((item) => {
    item.setAttribute("draggable", "true");

    item.addEventListener("dragstart", function () {
      draggedElement = this;
      this.style.opacity = "0.5";
    });

    item.addEventListener("dragend", function () {
      this.style.opacity = "1";
      // Usuń visual feedback ze wszystkich elementów
      document.querySelectorAll(".draggable-item").forEach((el) => {
        el.classList.remove("drag-over");
      });
    });

    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (draggedElement !== this) {
        this.classList.add("drag-over");
      }
    });

    item.addEventListener("dragleave", function () {
      this.classList.remove("drag-over");
    });

    item.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      if (draggedElement !== this) {
        const parent = this.parentElement;
        const allItems = [...parent.querySelectorAll(".draggable-item")];
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);

        if (draggedIndex < targetIndex) {
          this.parentElement.insertBefore(draggedElement, this.nextSibling);
        } else {
          this.parentElement.insertBefore(draggedElement, this);
        }
      }
    });
  });

  // ====================================================
  // 6. Generowanie i export (oddzielnie)
  // ====================================================
  let generatedData = null;
  let generatedFields = null;
  let generatedContent = null;
  let generatedFilename = null;
  let generatedMimeType = null;

  function showDatasetError(message) {
    let errorDiv = document.getElementById("datasetError");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.id = "datasetError";
      errorDiv.className = "validator-result invalid";
      errorDiv.setAttribute("role", "status");
      errorDiv.setAttribute("aria-live", "polite");
      errorDiv.style.marginBottom = "20px";

      const controlPanel = document.querySelector(".control-panel");
      if (controlPanel) {
        controlPanel.parentNode.insertBefore(errorDiv, controlPanel);
      } else {
        document.body.prepend(errorDiv);
      }
    }

    errorDiv.textContent = "❌ " + message;
    errorDiv.style.display = "block";
    // Auto-hide after 5 seconds to clear the message
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }

  document
    .getElementById("generateDatasetBtn")
    .addEventListener("click", function () {
      const generateBtn = this;
      const originalText = generateBtn.textContent;
      generateBtn.textContent = "⏳ Generowanie...";
      generateBtn.disabled = true;
      generateBtn.setAttribute("aria-busy", "true");

      const errorDiv = document.getElementById("datasetError");
      if (errorDiv) {
        errorDiv.style.display = "none";
      }

      setTimeout(() => {
        try {
          const recordCount = Math.min(
            parseInt(document.getElementById("recordCount").value) || 10,
            100000,
          );
          const format = document.querySelector(
            'input[name="export-format"]:checked',
          ).value;
          let separator =
            document.querySelector('input[name="csv-separator"]:checked')
              ?.value || ",";

          // Zamień "tab" na faktyczną tabulację
          if (separator === "tab") {
            separator = "\t";
          }

          // Pobierz zaznaczone pola w kolejności / Get checked fields in order
          const fieldsInfo = [];
          const seenNames = new Set();
          const duplicateNames = [];

          document
            .querySelectorAll('.draggable-item input[type="checkbox"]:checked')
            .forEach((checkbox) => {
              const nameInput = checkbox
                .closest(".draggable-item")
                .querySelector(".field-name-input");
              const customName = nameInput
                ? nameInput.value.trim()
                : checkbox.value;
              const finalName = customName || checkbox.value;
              const normalizedName = finalName.replace(/\s+/g, "_");

              // Sprawdzanie duplikatów / Checking for duplicates
              if (seenNames.has(normalizedName)) {
                if (!duplicateNames.includes(finalName)) {
                  duplicateNames.push(finalName);
                }
              }
              seenNames.add(normalizedName);

              fieldsInfo.push({ key: checkbox.value, name: finalName });
            });

          if (duplicateNames.length > 0) {
            // Alert informujący o zduplikowanych nazwach / Alert informing about duplicate names
            showDatasetError(
              `Nazwy pól muszą być unikalne. Znaleziono zduplikowane nazwy: ${duplicateNames.join(", ")}`,
            );
            return;
          }

          const fields = fieldsInfo.map((f) => f.name.replace(/\s+/g, "_"));

          if (fields.length === 0) {
            showDatasetError("Zaznacz przynajmniej jedno pole!");
            return;
          }

          // Generuj dane (logika generatorów pól żyje we wspólnym module
          // static/data-generators.js, współdzielonym ze stroną API)
          const data = DataGenerators.generateDataset(fieldsInfo, recordCount);

          // Przygotuj export
          let content, filename, mimeType;

          if (format === "csv") {
            content = generateCsv(data, fields, separator);
            filename = "dane_testowe.csv";
            mimeType = "text/csv;charset=utf-8;";
          } else if (format === "json") {
            content = JSON.stringify(data, null, 2);
            filename = "dane_testowe.json";
            mimeType = "application/json;charset=utf-8;";
          } else if (format === "xml") {
            content = generateXml(data, fields);
            filename = "dane_testowe.xml";
            mimeType = "application/xml;charset=utf-8;";
          } else if (format === "sql") {
            const tableName =
              document.getElementById("sqlTableName")?.value || "dane_testowe";
            content = generateSql(data, fields, tableName);
            filename = "dane_testowe.sql";
            mimeType = "application/sql;charset=utf-8;";
          }

          // Przechowaj dane do pobrania
          generatedData = data;
          generatedFields = fields;
          generatedContent = content;
          generatedFilename = filename;
          generatedMimeType = mimeType;

          // Pokaż podgląd
          showPreview(data, fields, format, separator);

          // Aktywuj przycisk pobierania
          document.getElementById("downloadDatasetBtn").disabled = false;
          document
            .getElementById("downloadDatasetBtn")
            .removeAttribute("aria-disabled");
          document
            .getElementById("downloadDatasetBtn")
            .removeAttribute("title");
        } finally {
          generateBtn.textContent = originalText;
          generateBtn.disabled = false;
          generateBtn.removeAttribute("aria-busy");
        }
      }, 50);
    });

  // Przycisk pobierania
  document
    .getElementById("downloadDatasetBtn")
    .addEventListener("click", () => {
      if (generatedContent && generatedFilename && generatedMimeType) {
        downloadFile(generatedContent, generatedFilename, generatedMimeType);
      }
    });

  // ====================================================
  // 7. Podgląd
  // ====================================================
  // generateCsv/generateXml/escapeXml są zdefiniowane na poziomie modułu
  // (na górze pliku) i dostępne tu przez domknięcie.
  function showPreview(data, fields, format, separator) {
    const previewContent = document.getElementById("previewContent");
    const previewData = data.slice(0, 5);

    let preview = "";
    if (format === "csv") {
      preview = generateCsv(previewData, fields, separator);
    } else if (format === "json") {
      preview = JSON.stringify(previewData, null, 2);
    } else if (format === "xml") {
      preview = generateXml(previewData, fields);
    } else if (format === "sql") {
      const tableName =
        document.getElementById("sqlTableName")?.value || "dane_testowe";
      preview = generateSql(previewData, fields, tableName);
    }

    previewContent.textContent = preview;
  }

  // ====================================================
  // 8. Pobieranie pliku
  // ====================================================
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Eksport dla celów testowania
  if (typeof window !== "undefined") {
    window.generateXml = generateXml;
    window.escapeXml = escapeXml;
    window.formatDateYMD = DataGenerators.formatDateYMD;
    window.generateSql = generateSql;
  }
});
