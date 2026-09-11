// ====================================================
// Generatory (CSV, XML) przeniesione dla celów testowych
// ====================================================
function generateCsv(data, fields, separator) {
  const header = fields.join(separator);
  const rows = data.map((record) =>
    fields
      .map((field) => {
        const value = record[field];
        if (
          typeof value === "string" &&
          (value.includes(separator) ||
            value.includes('"') ||
            value.includes("\n"))
        ) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      })
      .join(separator),
  );
  return [header, ...rows].join("\n");
}

function generateXml(data, fields) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
  data.forEach((record) => {
    xml += "  <record>\n";
    fields.forEach((field) => {
      const value = record[field];
      xml += `    <${field}>${escapeXml(value)}</${field}>\n`;
    });
    xml += "  </record>\n";
  });
  xml += "</records>";
  return xml;
}

function escapeXml(str) {
  if (typeof str !== "string") return str;
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

function escapeSqlIdentifier(name) {
  const safe = String(name).replace(/[^a-zA-Z0-9_]/g, "_");
  return safe || "field";
}

function escapeSqlValue(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Generuje jedną lub więcej instrukcji INSERT INTO (wsadowo, po SQL_BATCH_SIZE
// wierszy na instrukcję), żeby duże zbiory danych dały czytelny i bezpieczny
// do wklejenia plik SQL.
const SQL_BATCH_SIZE = 500;

function generateSql(data, fields, tableName) {
  const table = escapeSqlIdentifier(tableName || "dane_testowe");
  const columns = fields.map(escapeSqlIdentifier).join(", ");

  if (data.length === 0) {
    return `-- Brak danych do wstawienia do tabeli ${table}`;
  }

  const statements = [];
  for (let i = 0; i < data.length; i += SQL_BATCH_SIZE) {
    const batch = data.slice(i, i + SQL_BATCH_SIZE);
    const valuesList = batch
      .map(
        (record) =>
          "(" + fields.map((field) => escapeSqlValue(record[field])).join(", ") + ")",
      )
      .join(",\n  ");
    statements.push(`INSERT INTO ${table} (${columns}) VALUES\n  ${valuesList};`);
  }
  return statements.join("\n\n");
}

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
  // 2. Zmienne globalne
  // ====================================================
  let bankCodes = {};
  let bankCodeKeys = [];
  let maleNames = [];
  let femaleNames = [];
  let surnames = [];

  // Załaduj dane
  Promise.all([
    fetch("static/bank_codes.json").then((r) => r.json()),
    fetch("static/pl_male_names.json").then((r) => r.json()),
    fetch("static/pl_female_names.json").then((r) => r.json()),
    fetch("static/pl_male_surnames.json").then((r) => r.json()),
    fetch("static/pl_female_surnames.json").then((r) => r.json()),
  ])
    .then(([codes, mNames, fNames, mSurnames, fSurnames]) => {
      bankCodes = codes;
      // Tylko pełne kody banku+oddziału (8 cyfr) nadają się do budowy NRB;
      // plik zawiera też same 3-cyfrowe kody banków.
      bankCodeKeys = Object.keys(codes).filter((key) => key.length === 8);
      maleNames = mNames;
      femaleNames = fNames;
      surnames = [...new Set([...mSurnames, ...fSurnames])];
    })
    .catch((err) => console.error("Błąd załadowania danych:", err));

  // ====================================================
  // 4. Funkcje generujące
  // ====================================================

  function randomDigits(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  }

  const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

  // Waga i sposób liczenia sumy kontrolnej zgodne z oficjalnym numerem
  // dowodu osobistego: 3 litery + cyfra kontrolna + 5 cyfr numeru.
  function generateIdNumber() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const weights = [7, 3, 1, 9, 7, 3, 1, 7, 3];

    const letterPart = Array.from(
      { length: 3 },
      () => letters[Math.floor(Math.random() * letters.length)],
    ).join("");
    const digitsPart = randomDigits(5);

    const numericValues = (letterPart + "0" + digitsPart)
      .split("")
      .map((char) => (/[A-Z]/.test(char) ? char.charCodeAt(0) - 55 : parseInt(char, 10)));
    const sum = numericValues.reduce((acc, value, i) => acc + value * weights[i], 0);
    const checksum = sum % 10;

    return letterPart + checksum + digitsPart;
  }

  // Suma kontrolna REGON: mod 11 wg oficjalnych wag; wynik 10 oznacza 0.
  function regonChecksum(digits, weights) {
    const sum = digits
      .split("")
      .reduce((acc, digit, i) => acc + parseInt(digit, 10) * weights[i], 0);
    const mod = sum % 11;
    return mod === 10 ? 0 : mod;
  }

  function generateRegon(type) {
    const regon9Digits = randomDigits(8);
    const regon9 = regon9Digits + regonChecksum(regon9Digits, weightsRegon9);
    if (type === 9) return regon9;

    const localDigits = randomDigits(4);
    const regon13 = regon9 + localDigits;
    return regon13 + regonChecksum(regon13, weightsRegon14);
  }

  function generateNrb() {
    const bankCode =
      bankCodeKeys[Math.floor(Math.random() * bankCodeKeys.length)];
    const accountNumber = randomDigits(16);
    const bban = bankCode + accountNumber;

    // "2521" to litery kraju PL (P=25, L=21) zakodowane wg standardu IBAN.
    const numberToCheck = bban + "2521" + "00";
    const checksum = (98n - (BigInt(numberToCheck) % 97n))
      .toString()
      .padStart(2, "0");

    return checksum + bban;
  }

  function getRandomName() {
    return Math.random() > 0.5 ? getRandomMaleName() : getRandomFemaleName();
  }

  function getRandomSurname() {
    if (surnames.length > 0) {
      return surnames[Math.floor(Math.random() * surnames.length)];
    }
    // Fallback na Faker jeśli nazwiska JSON się nie załadowały
    try {
      return faker.person?.lastName() || "Nowak";
    } catch {
      return "Nowak";
    }
  }

  function getRandomMaleName() {
    if (maleNames.length > 0) {
      return maleNames[Math.floor(Math.random() * maleNames.length)];
    }
    // Fallback na Faker jeśli nazwy JSON się nie załadowały
    try {
      return faker.person?.firstName("male") || "Jan";
    } catch {
      return "Jan";
    }
  }

  function getRandomFemaleName() {
    if (femaleNames.length > 0) {
      return femaleNames[Math.floor(Math.random() * femaleNames.length)];
    }
    // Fallback na Faker jeśli nazwy JSON się nie załadowały
    try {
      return faker.person?.firstName("female") || "Maria";
    } catch {
      return "Maria";
    }
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomHex(length) {
    const chars = "0123456789abcdef";
    return Array.from(
      { length },
      () => chars[randomInt(0, chars.length - 1)],
    ).join("");
  }

  function formatDateYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function randomDateBetween(start, end) {
    const startMs = start.getTime();
    const endMs = end.getTime();
    return new Date(randomInt(startMs, endMs));
  }

  function generatePeselFromDate(date, sex) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();

    // Zakoduj miesiąc w zależności od stulecia
    if (year >= 1800 && year <= 1899) month += 80;
    else if (year >= 2000 && year <= 2099) month += 20;
    else if (year >= 2100 && year <= 2199) month += 40;
    else if (year >= 2200 && year <= 2299) month += 60;

    const yearTwoDigits = String(year % 100).padStart(2, "0");
    const monthTwoDigits = String(month).padStart(2, "0");
    const dayTwoDigits = String(day).padStart(2, "0");

    // PESEL koduje płeć w ostatniej z 4 cyfr numeru seryjnego: cyfra
    // nieparzysta = mężczyzna, parzysta = kobieta.
    const serial = String(randomInt(0, 999)).padStart(3, "0");
    const genderDigit =
      sex === "M" ? randomInt(0, 4) * 2 + 1 : randomInt(0, 4) * 2;
    const base = `${yearTwoDigits}${monthTwoDigits}${dayTwoDigits}${serial}${genderDigit}`;

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(base[i], 10) * weights[i];
    const checksum = (10 - (sum % 10)) % 10;

    return base + checksum;
  }

  function generatePolishPostalCode() {
    const part1 = String(randomInt(0, 99)).padStart(2, "0");
    const part2 = String(randomInt(0, 999)).padStart(3, "0");
    return `${part1}-${part2}`;
  }

  const polishCities = [
    "Warszawa",
    "Kraków",
    "Łódź",
    "Wrocław",
    "Poznań",
    "Gdańsk",
    "Szczecin",
    "Bydgoszcz",
    "Lublin",
    "Białystok",
    "Katowice",
    "Gdynia",
    "Częstochowa",
    "Radom",
    "Toruń",
    "Kielce",
    "Rzeszów",
    "Olsztyn",
    "Zielona Góra",
    "Opole",
    "Bielsko-Biała",
  ];

  function getRandomCity() {
    // Kombinuj z polskimi miastami dla większej realistyczności
    if (Math.random() > 0.4) {
      return polishCities[Math.floor(Math.random() * polishCities.length)];
    }
    // Fallback na polskie miasta jeśli Faker nie będzie dostępny
    try {
      return faker.location.city
        ? faker.location.city()
        : polishCities[Math.floor(Math.random() * polishCities.length)];
    } catch {
      return polishCities[Math.floor(Math.random() * polishCities.length)];
    }
  }

  const streetNames = [
    "Kwiatowa",
    "Słoneczna",
    "Wiosenna",
    "Szkolna",
    "Leśna",
    "Polna",
    "Słoneczna",
    "Lipowa",
    "Grunwaldzka",
    "Kościuszki",
    "Słowackiego",
    "Pionierów",
    "Rozwoju",
    "Mickiewicza",
    "Krótka",
  ];

  function getRandomStreetName() {
    // Kombinuj z polskimi ulicami dla realistyczności
    if (Math.random() > 0.4) {
      const name = streetNames[Math.floor(Math.random() * streetNames.length)];
      const prefix = Math.random() > 0.5 ? "ul." : "";
      return `${prefix} ${name}`.trim();
    }
    // Fallback na polskie ulice jeśli Faker nie będzie dostępny
    try {
      const fakerStreet = faker.location.streetName
        ? faker.location.streetName()
        : streetNames[Math.floor(Math.random() * streetNames.length)];
      const prefix = Math.random() > 0.5 ? "ul." : "";
      return `${prefix} ${fakerStreet}`.trim();
    } catch {
      const name = streetNames[Math.floor(Math.random() * streetNames.length)];
      const prefix = Math.random() > 0.5 ? "ul." : "";
      return `${prefix} ${name}`.trim();
    }
  }

  function generatePhoneNumber() {
    // Generuj numer telefoniczny w formacie polskim
    const prefix = randomInt(500, 899);
    const rest = String(randomInt(0, 999999)).padStart(6, "0");
    return `${prefix}${rest}`;
  }

  const mailDomains = [
    "wp.pl",
    "onet.pl",
    "o2.pl",
    "interia.pl",
    "gazeta.pl",
    "tlen.pl",
  ];

  function generateEmail(first, last) {
    // Użyj Faker do generowania emaila, ale z polskimi domenami
    const localPart = `${first}.${last}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const domain = mailDomains[randomInt(0, mailDomains.length - 1)];
    const randomSuffix = randomInt(0, 999);
    return `${localPart}${randomSuffix}@${domain}`;
  }

  function generateToken() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return `token${datePart}${randomHex(8)}`;
  }

  function generateSeasonString() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "Wiosna";
    if (month >= 6 && month <= 8) return "Lato";
    if (month >= 9 && month <= 11) return "Jesień";
    return "Zima";
  }

  function generateComment() {
    const polishSentences = [
      "Dane testowe wygenerowane automatycznie.",
      "Proszę nie używać w produkcji.",
      "Służy wyłącznie do celów testowania.",
      "Przykładowy komentarz systemowy.",
      "Wygenerowano dnia " + new Date().toLocaleDateString("pl-PL") + ".",
    ];
    return polishSentences[Math.floor(Math.random() * polishSentences.length)];
  }

  function generateNip() {
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    while (true) {
      const digits = Array.from({ length: 9 }, () => randomInt(0, 9));
      const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
      const check = sum % 11;
      if (check < 10) {
        return digits.join("") + check;
      }
    }
  }

  const COMPANY_SUFFIXES = [
    "Sp. z o.o.",
    "S.A.",
    "Sp. k.",
    "Sp. j.",
    "Fundacja",
    "Stowarzyszenie",
  ];

  function generateCompanyName() {
    // Generuj nazwę firmy z polskiego słownika + sufiksy
    const name = getRandomSurname();
    const suffix =
      COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
    return `${name} ${suffix}`;
  }

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

          // Generuj dane
          const data = [];
          for (let i = 0; i < recordCount; i++) {
            const record = {};

            // Podstawowe wartości używane w wielu polach
            const sex = "M";
            const birthdate = randomDateBetween(
              new Date(1950, 0, 1),
              new Date(2002, 11, 31),
            );
            const pesel = generatePeselFromDate(birthdate, sex);
            const firstNameMale = getRandomMaleName();
            const firstNameFemale = getRandomFemaleName();
            const surname = getRandomSurname();
            const idNumber = generateIdNumber();
            const nrb = generateNrb();
            const bankAccount = nrb;
            const companyName = generateCompanyName();
            const nip = generateNip();

            fieldsInfo.forEach((fieldObj) => {
              const field = fieldObj.key;
              const fieldName = fieldObj.name.replace(/\s+/g, "_");
              switch (field) {
                case "pesel":
                  record[fieldName] = pesel;
                  break;
                case "id":
                  record[fieldName] = idNumber;
                  break;
                case "regon":
                  record[fieldName] = generateRegon(
                    Math.random() > 0.5 ? 9 : 14,
                  );
                  break;
                case "firstName":
                  record[fieldName] = firstNameMale;
                  break;
                case "surname":
                  record[fieldName] = surname;
                  break;
                case "imie":
                  record[fieldName] = firstNameMale;
                  break;
                case "nazwa":
                  record[fieldName] = surname;
                  break;
                case "imie_ojca":
                  record[fieldName] = firstNameMale;
                  break;
                case "imie_matki":
                  record[fieldName] = firstNameFemale;
                  break;
                case "sex":
                  record[fieldName] = sex;
                  break;
                case "citizenship":
                  record[fieldName] = "POL";
                  break;
                case "birthdate":
                  record[fieldName] = formatDateYMD(birthdate);
                  break;
                case "birthCountry":
                  record[fieldName] = "POL";
                  break;
                case "birthcity":
                  record[fieldName] = getRandomCity();
                  break;
                case "document_type":
                  record[fieldName] = "DOWOD_OSOBISTY";
                  break;
                case "dok_tozs":
                  record[fieldName] = idNumber;
                  break;
                case "dok_expirydate": {
                  const expiry = randomDateBetween(
                    new Date(),
                    new Date(new Date().getFullYear() + 10, 11, 31),
                  );
                  record[fieldName] = formatDateYMD(expiry);
                  break;
                }
                case "ulica":
                  record[fieldName] = getRandomStreetName();
                  break;
                case "nr_domu":
                  record[fieldName] = String(randomInt(1, 999));
                  break;
                case "nr_lokalu":
                  record[fieldName] = String(randomInt(1, 999));
                  break;
                case "kod_pocztowy":
                  record[fieldName] = generatePolishPostalCode();
                  break;
                case "miasto":
                  record[fieldName] = getRandomCity();
                  break;
                case "kraj":
                  record[fieldName] = "POL";
                  break;
                case "telk":
                  record[fieldName] = generatePhoneNumber();
                  break;
                case "teld":
                  record[fieldName] = generatePhoneNumber();
                  break;
                case "mail":
                  record[fieldName] = generateEmail(firstNameMale, surname);
                  break;
                case "bankaccount":
                  record[fieldName] = bankAccount;
                  break;
                case "comment":
                  record[fieldName] = generateComment();
                  break;
                case "season_string":
                  record[fieldName] = generateSeasonString();
                  break;
                case "token":
                  record[fieldName] = generateToken();
                  break;
                case "alnova_pid":
                  record[fieldName] = String(randomInt(10000000, 99999999));
                  break;
                case "nip":
                  record[fieldName] = nip;
                  break;
                case "companyname":
                  record[fieldName] = companyName;
                  break;
                default:
                  record[fieldName] = "";
              }
            });
            data.push(record);
          }

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
    window.formatDateYMD = formatDateYMD;
    window.generateSql = generateSql;
  }
});
