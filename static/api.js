// ====================================================
// Strona API (tryb przeglądarki): buduje zestaw danych na podstawie
// parametrów URL (?fields=...&count=...&format=...) i wyświetla go od razu
// po otwarciu, albo po każdej zmianie ustawień w formularzu.
//
// To NIE jest prawdziwy serwer - strona jest hostowana statycznie, więc
// generowanie odbywa się w JavaScripcie w przeglądarce. Działa po otwarciu
// URL w realnej przeglądarce (ręcznie albo np. przez Playwright/Selenium),
// ale nie zadziała z curl/Postmana/backendu - taki klient nie wykonuje JS
// i dostanie tylko surowy HTML.
// ====================================================
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
  // 2. Kopiowanie do schowka
  // ====================================================
  const copyMessage = document.getElementById("copy-message");

  function showCopyMessage(text) {
    if (!copyMessage) return;
    copyMessage.innerText = text;
    copyMessage.classList.add("show");
    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 3000);
  }

  function copyText(text, message) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => showCopyMessage(message))
        .catch((err) => console.error("Błąd podczas kopiowania:", err));
    } else {
      showCopyMessage(message);
    }
  }

  // ====================================================
  // 3. Zbuduj listę checkboxów pól na podstawie wspólnego słownika
  // ====================================================
  const AVAILABLE_FIELDS = DataGenerators.AVAILABLE_FIELDS;
  const FIELD_LABELS = DataGenerators.FIELD_LABELS;
  const DEFAULT_FIELDS = [
    "pesel",
    "imie",
    "nazwa",
    "sex",
    "birthdate",
    "miasto",
    "mail",
    "telk",
  ];
  const MAX_COUNT = 5000;

  const fieldsListEl = document.getElementById("apiFieldsList");
  AVAILABLE_FIELDS.forEach((key) => {
    const label = document.createElement("label");
    label.className = "format-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = key;
    checkbox.dataset.fieldKey = key;
    label.appendChild(checkbox);
    label.appendChild(
      document.createTextNode(` ${FIELD_LABELS[key] || key} (${key})`),
    );
    fieldsListEl.appendChild(label);
  });

  function getFieldCheckboxes() {
    return Array.from(fieldsListEl.querySelectorAll('input[type="checkbox"]'));
  }

  // ====================================================
  // 4. Odczyt/zapis stanu formularza <-> parametry URL
  // ====================================================
  const countInput = document.getElementById("apiCount");
  const tableInput = document.getElementById("apiTableName");
  const separatorWrapper = document.getElementById("apiSeparatorWrapper");
  const tableWrapper = document.getElementById("apiTableWrapper");
  const errorDiv = document.getElementById("apiError");

  function showApiError(message) {
    errorDiv.textContent = "❌ " + message;
    errorDiv.style.display = "block";
  }

  function hideApiError() {
    errorDiv.style.display = "none";
  }

  function getFormat() {
    return document.querySelector('input[name="api-format"]:checked').value;
  }

  function getSeparator() {
    const raw =
      document.querySelector('input[name="api-csv-separator"]:checked')
        ?.value || ",";
    return raw === "tab" ? "\t" : raw;
  }

  function getSeparatorRaw() {
    return (
      document.querySelector('input[name="api-csv-separator"]:checked')
        ?.value || ","
    );
  }

  function applyParamsToForm(params) {
    const fields = params.get("fields");
    const selectedKeys = fields
      ? fields
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : DEFAULT_FIELDS;
    getFieldCheckboxes().forEach((cb) => {
      cb.checked = selectedKeys.includes(cb.value);
    });

    const count = parseInt(params.get("count"), 10);
    countInput.value =
      Number.isFinite(count) && count > 0
        ? Math.min(count, MAX_COUNT)
        : 10;

    const format = params.get("format") || "json";
    const formatRadio = document.querySelector(
      `input[name="api-format"][value="${format}"]`,
    );
    (
      formatRadio ||
      document.querySelector('input[name="api-format"][value="json"]')
    ).checked = true;

    const separator = params.get("separator") || ",";
    const separatorRadio = document.querySelector(
      `input[name="api-csv-separator"][value="${separator}"]`,
    );
    (
      separatorRadio ||
      document.querySelector('input[name="api-csv-separator"][value=","]')
    ).checked = true;

    tableInput.value = params.get("table") || "dane_testowe";

    updateConditionalFields();
  }

  function updateConditionalFields() {
    const format = getFormat();
    separatorWrapper.style.display = format === "csv" ? "flex" : "none";
    tableWrapper.style.display = format === "sql" ? "flex" : "none";
  }

  function buildQueryParams() {
    const selectedKeys = getFieldCheckboxes()
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    const format = getFormat();

    const params = new URLSearchParams();
    params.set("fields", selectedKeys.join(","));
    params.set("count", countInput.value || "10");
    params.set("format", format);
    if (format === "csv") {
      params.set("separator", getSeparatorRaw());
    }
    if (format === "sql") {
      params.set("table", tableInput.value.trim() || "dane_testowe");
    }
    return { params, selectedKeys, format };
  }

  function buildShareableUrl(params) {
    return `${location.origin}${location.pathname}?${params.toString()}`;
  }

  // ====================================================
  // 5. Generowanie i renderowanie wyniku
  // ====================================================
  const outputEl = document.getElementById("apiOutput");
  const urlEl = document.getElementById("apiUrl");
  let currentContent = "";
  let currentFilename = "";
  let currentMimeType = "";

  function generateAndRender() {
    hideApiError();
    const { params, selectedKeys, format } = buildQueryParams();

    urlEl.textContent = buildShareableUrl(params);

    if (selectedKeys.length === 0) {
      showApiError("Zaznacz przynajmniej jedno pole!");
      outputEl.textContent = "";
      currentContent = "";
      return;
    }

    const count = Math.min(
      Math.max(parseInt(countInput.value, 10) || 10, 1),
      MAX_COUNT,
    );

    const fieldsInfo = selectedKeys.map((key) => ({ key, name: key }));
    const data = DataGenerators.generateDataset(fieldsInfo, count);

    let content, filename, mimeType;
    if (format === "csv") {
      content = DataGenerators.generateCsv(data, selectedKeys, getSeparator());
      filename = "dane.csv";
      mimeType = "text/csv;charset=utf-8;";
    } else if (format === "xml") {
      content = DataGenerators.generateXml(data, selectedKeys);
      filename = "dane.xml";
      mimeType = "application/xml;charset=utf-8;";
    } else if (format === "sql") {
      content = DataGenerators.generateSql(
        data,
        selectedKeys,
        tableInput.value.trim() || "dane_testowe",
      );
      filename = "dane.sql";
      mimeType = "application/sql;charset=utf-8;";
    } else {
      content = JSON.stringify(data, null, 2);
      filename = "dane.json";
      mimeType = "application/json;charset=utf-8;";
    }

    currentContent = content;
    currentFilename = filename;
    currentMimeType = mimeType;
    outputEl.textContent = content;
  }

  // ====================================================
  // 6. Przyciski kopiowania / pobierania i przykład w dokumentacji
  // ====================================================
  document.getElementById("apiCopyBtn").addEventListener("click", () => {
    if (currentContent) copyText(currentContent, "Skopiowano dane!");
  });

  urlEl.addEventListener("click", () => {
    copyText(urlEl.textContent, "Skopiowano URL!");
  });

  document.getElementById("apiDownloadBtn").addEventListener("click", () => {
    if (!currentContent) return;
    const blob = new Blob([currentContent], { type: currentMimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  document.getElementById("apiExample").textContent = `${location.origin}${location.pathname}?fields=pesel,imie,nazwa,mail&count=5&format=json`;

  // ====================================================
  // 7. Nasłuchiwanie zmian - generowanie na żywo, bez przycisku
  // ====================================================
  document
    .querySelectorAll(
      'input[name="api-format"], input[name="api-csv-separator"]',
    )
    .forEach((el) => {
      el.addEventListener("change", () => {
        updateConditionalFields();
        generateAndRender();
      });
    });
  countInput.addEventListener("input", generateAndRender);
  tableInput.addEventListener("input", generateAndRender);
  getFieldCheckboxes().forEach((cb) =>
    cb.addEventListener("change", generateAndRender),
  );

  // ====================================================
  // 8. Start: załaduj dane referencyjne, zastosuj parametry z URL i
  //    wygeneruj pierwszy wynik
  // ====================================================
  DataGenerators.loadReferenceData()
    .catch((err) => console.error("Błąd załadowania danych:", err))
    .finally(() => {
      applyParamsToForm(new URLSearchParams(location.search));
      generateAndRender();
    });
});
