// ====================================================
// Wspólne generatory danych i formaty eksportu, używane zarówno przez
// generator zbiorów (dataset-generator.js) jak i stronę API (api.js) -
// żeby algorytmy sum kontrolnych (PESEL/NIP/REGON/NRB) istniały w jednym
// miejscu zamiast być duplikowane.
// ====================================================
(function (root) {
  let bankCodes = {};
  let bankCodeKeys = [];
  let maleNames = [];
  let femaleNames = [];
  let surnames = [];

  function loadReferenceData() {
    return Promise.all([
      fetch("static/bank_codes.json").then((r) => r.json()),
      fetch("static/pl_male_names.json").then((r) => r.json()),
      fetch("static/pl_female_names.json").then((r) => r.json()),
      fetch("static/pl_male_surnames.json").then((r) => r.json()),
      fetch("static/pl_female_surnames.json").then((r) => r.json()),
    ]).then(([codes, mNames, fNames, mSurnames, fSurnames]) => {
      bankCodes = codes;
      // Tylko pełne kody banku+oddziału (8 cyfr) nadają się do budowy NRB;
      // plik zawiera też same 3-cyfrowe kody banków.
      bankCodeKeys = Object.keys(codes).filter((key) => key.length === 8);
      maleNames = mNames;
      femaleNames = fNames;
      surnames = [...new Set([...mSurnames, ...fSurnames])];
    });
  }

  function randomDigits(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
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
      .map((char) =>
        /[A-Z]/.test(char) ? char.charCodeAt(0) - 55 : parseInt(char, 10),
      );
    const sum = numericValues.reduce(
      (acc, value, i) => acc + value * weights[i],
      0,
    );
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

  function getRandomMaleName() {
    if (maleNames.length > 0) {
      return maleNames[Math.floor(Math.random() * maleNames.length)];
    }
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
    try {
      return faker.person?.firstName("female") || "Maria";
    } catch {
      return "Maria";
    }
  }

  function getRandomName() {
    return Math.random() > 0.5 ? getRandomMaleName() : getRandomFemaleName();
  }

  function getRandomSurname() {
    if (surnames.length > 0) {
      return surnames[Math.floor(Math.random() * surnames.length)];
    }
    try {
      return faker.person?.lastName() || "Nowak";
    } catch {
      return "Nowak";
    }
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
    if (Math.random() > 0.4) {
      return polishCities[Math.floor(Math.random() * polishCities.length)];
    }
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
    if (Math.random() > 0.4) {
      const name = streetNames[Math.floor(Math.random() * streetNames.length)];
      const prefix = Math.random() > 0.5 ? "ul." : "";
      return `${prefix} ${name}`.trim();
    }
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
    const name = getRandomSurname();
    const suffix =
      COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
    return `${name} ${suffix}`;
  }

  // Lista pól dostępnych do wygenerowania - wspólna dla generatora zbiorów
  // (checkboxy w dataset-generator.html) i strony API (parametr "fields").
  const AVAILABLE_FIELDS = [
    "pesel",
    "id",
    "regon",
    "firstName",
    "surname",
    "imie",
    "nazwa",
    "imie_ojca",
    "imie_matki",
    "sex",
    "citizenship",
    "birthdate",
    "birthCountry",
    "birthcity",
    "document_type",
    "dok_tozs",
    "dok_expirydate",
    "ulica",
    "nr_domu",
    "nr_lokalu",
    "kod_pocztowy",
    "miasto",
    "kraj",
    "telk",
    "teld",
    "mail",
    "bankaccount",
    "comment",
    "season_string",
    "token",
    "alnova_pid",
    "nip",
    "companyname",
  ];

  // Domyślne polskie etykiety pól - używane w UI generatora zbiorów i na
  // stronie API (parametr "fields" API przyjmuje klucze, etykiety są tylko
  // do wyświetlania/dokumentacji).
  const FIELD_LABELS = {
    pesel: "PESEL",
    id: "Dowód Osobisty",
    regon: "REGON",
    firstName: "Imię",
    surname: "Nazwisko",
    imie: "Imię",
    nazwa: "Nazwisko",
    imie_ojca: "Imię ojca",
    imie_matki: "Imię matki",
    sex: "Płeć",
    citizenship: "Obywatelstwo",
    birthdate: "Data urodzenia",
    birthCountry: "Kraj urodzenia",
    birthcity: "Miasto urodzenia",
    document_type: "Typ dokumentu",
    dok_tozs: "Nr dokumentu",
    dok_expirydate: "Data wygaśnięcia dokumentu",
    ulica: "Ulica",
    nr_domu: "Nr domu",
    nr_lokalu: "Nr lokalu",
    kod_pocztowy: "Kod pocztowy",
    miasto: "Miasto",
    kraj: "Kraj",
    telk: "Telefon komórkowy",
    teld: "Telefon domowy",
    mail: "Email",
    bankaccount: "Rachunek bankowy",
    comment: "Komentarz",
    season_string: "Pora roku",
    token: "Token",
    alnova_pid: "ID systemowe",
    nip: "NIP",
    companyname: "Nazwa firmy",
  };

  // Generuje jeden rekord danych testowych dla podanej listy pól.
  // fieldsInfo: [{ key, name }] - key to klucz z AVAILABLE_FIELDS, name to
  // nazwa docelowego pola/kolumny w wyniku (może być zmieniona przez usera).
  function generateRecord(fieldsInfo) {
    const record = {};

    // Podstawowe wartości używane w wielu polach, żeby np. imię i PESEL
    // odpowiadały tej samej "osobie" w ramach jednego rekordu.
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
    const bankAccount = generateNrb();
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
          record[fieldName] = generateRegon(Math.random() > 0.5 ? 9 : 14);
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

    return record;
  }

  function generateDataset(fieldsInfo, count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(generateRecord(fieldsInfo));
    }
    return data;
  }

  // ====================================================
  // Formaty eksportu (CSV/XML/SQL) - używane przez generator zbiorów i API.
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

  function escapeSqlIdentifier(name) {
    const safe = String(name).replace(/[^a-zA-Z0-9_]/g, "_");
    return safe || "field";
  }

  function escapeSqlValue(value) {
    if (value === null || value === undefined || value === "") return "NULL";
    return "'" + String(value).replace(/'/g, "''") + "'";
  }

  // Generuje jedną lub więcej instrukcji INSERT INTO (wsadowo, po
  // SQL_BATCH_SIZE wierszy na instrukcję), żeby duże zbiory danych dały
  // czytelny i bezpieczny do wklejenia plik SQL.
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
            "(" +
            fields.map((field) => escapeSqlValue(record[field])).join(", ") +
            ")",
        )
        .join(",\n  ");
      statements.push(
        `INSERT INTO ${table} (${columns}) VALUES\n  ${valuesList};`,
      );
    }
    return statements.join("\n\n");
  }

  const DataGenerators = {
    AVAILABLE_FIELDS,
    FIELD_LABELS,
    loadReferenceData,
    generateRecord,
    generateDataset,
    generateCsv,
    generateXml,
    escapeXml,
    generateSql,
    escapeSqlValue,
    escapeSqlIdentifier,
    // Wystawione też pojedyncze generatory - przydatne w testach jednostkowych.
    randomDigits,
    randomInt,
    randomHex,
    generateIdNumber,
    regonChecksum,
    generateRegon,
    generateNrb,
    getRandomName,
    getRandomSurname,
    getRandomMaleName,
    getRandomFemaleName,
    formatDateYMD,
    randomDateBetween,
    generatePeselFromDate,
    generatePolishPostalCode,
    getRandomCity,
    getRandomStreetName,
    generatePhoneNumber,
    generateEmail,
    generateToken,
    generateSeasonString,
    generateComment,
    generateNip,
    generateCompanyName,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataGenerators;
  } else {
    root.DataGenerators = DataGenerators;
  }
})(typeof window !== "undefined" ? window : globalThis);
