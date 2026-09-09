const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];

// Zakresy stuleci PESEL: miesiąc urodzenia jest kodowany przesunięciem
// zależnym od wieku stulecia (patrz też decodeCentury - operacja odwrotna).
const centuryMonthOffsets = [
  { minYear: 1800, maxYear: 1899, offset: 80 },
  { minYear: 1900, maxYear: 1999, offset: 0 },
  { minYear: 2000, maxYear: 2099, offset: 20 },
  { minYear: 2100, maxYear: 2199, offset: 40 },
  { minYear: 2200, maxYear: 2299, offset: 60 },
];

const letterToNumber = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i]),
);
const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];

const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

const DIGIT_CHARS = "0123456789";
const LETTER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChars(source, length) {
  return Array.from({ length }, () =>
    source.charAt(Math.floor(Math.random() * source.length)),
  ).join("");
}

function randomDigits(length) {
  return randomChars(DIGIT_CHARS, length);
}

// Znaki alfanumeryczne z niewielką szansą na literę - używane w BBAN-ach
// kilku krajów (np. FR, CH), które dopuszczają litery w numerze konta.
function randomAlnum(length, letterProbability = 0.1) {
  return Array.from({ length }, () =>
    Math.random() > letterProbability
      ? DIGIT_CHARS.charAt(Math.floor(Math.random() * DIGIT_CHARS.length))
      : LETTER_CHARS.charAt(Math.floor(Math.random() * LETTER_CHARS.length)),
  ).join("");
}

function getEncodedMonth(year, month) {
  const range = centuryMonthOffsets.find(
    (r) => year >= r.minYear && year <= r.maxYear,
  );
  if (!range) throw new Error("Unsupported year for PESEL generation.");
  return String(month + range.offset).padStart(2, "0");
}

// Odwrotność getEncodedMonth: na podstawie zakodowanego miesiąca z PESEL
// odtwarza rzeczywisty miesiąc i pełny rok urodzenia.
function decodeCentury(twoDigitYear, encodedMonth) {
  const range = [...centuryMonthOffsets]
    .sort((a, b) => b.offset - a.offset)
    .find((r) => encodedMonth > r.offset);
  return {
    year: range.minYear + twoDigitYear,
    month: encodedMonth - range.offset,
  };
}

function calculatePeselChecksum(peselWithoutK) {
  let checksumSum = 0;
  for (let i = 0; i < 10; i++) {
    checksumSum += parseInt(peselWithoutK[i]) * weightsPesel[i];
  }
  const lastDigitOfSum = checksumSum % 10;
  return lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
}

function generatePesel(year, month, day, gender) {
  const rr = String(year).slice(-2);
  const mm = getEncodedMonth(year, month);
  const dd = String(day).padStart(2, "0");

  const peselWithoutPpppK = `${rr}${mm}${dd}`;
  let pppp;

  if (gender === "female") {
    const lastDigitOfPppp = [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];
    pppp =
      String(Math.floor(Math.random() * 1000)).padStart(3, "0") +
      lastDigitOfPppp;
  } else if (gender === "male") {
    const lastDigitOfPppp = [1, 3, 5, 7, 9][Math.floor(Math.random() * 5)];
    pppp =
      String(Math.floor(Math.random() * 1000)).padStart(3, "0") +
      lastDigitOfPppp;
  } else {
    throw new Error("Invalid gender. Use 'male' or 'female'.");
  }

  const peselWithoutK = `${peselWithoutPpppK}${pppp}`;
  const k = calculatePeselChecksum(peselWithoutK);

  return `${peselWithoutK}${k}`;
}

function calculateRegon9Checksum(regon8) {
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(regon8[i]) * weightsRegon9[i];
  }
  const checksum = sum % 11;
  return checksum === 10 ? 0 : checksum;
}

function calculateRegon14Checksum(regon13) {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(regon13[i]) * weightsRegon14[i];
  }
  const checksum = sum % 11;
  return checksum === 10 ? 0 : checksum;
}

function generateRegon9() {
  const regon8 = randomDigits(8);
  const controlDigit = calculateRegon9Checksum(regon8);
  return `${regon8}${controlDigit}`;
}

function generateRegon14() {
  const regon9 = generateRegon9();
  const localDigits = randomDigits(4);
  const regon13 = `${regon9}${localDigits}`;
  const controlDigit = calculateRegon14Checksum(regon13);
  return `${regon13}${controlDigit}`;
}

function calculateIdChecksum(fullNumber) {
  const numericArray = fullNumber
    .split("")
    .map((char) =>
      /[A-Z]/.test(char) ? letterToNumber[char] : parseInt(char, 10),
    );

  let sum = 0;
  for (let i = 0; i < weightsId.length; i++) {
    sum += numericArray[i] * weightsId[i];
  }
  return sum % 10;
}

function generateIdNumber() {
  const letterPart = randomChars(LETTER_CHARS, 3);
  const digitsPart = randomDigits(5);

  const firstDigit = calculateIdChecksum(letterPart + "0" + digitsPart);

  return letterPart + firstDigit + digitsPart;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateRegon9,
    generateRegon14,
    calculateRegon9Checksum,
    calculateRegon14Checksum,
    weightsRegon9,
    weightsRegon14,
    generateIdNumber,
    calculateIdChecksum,
    letterToNumber,
    weightsId,
    generatePesel,
    getEncodedMonth,
    calculatePeselChecksum,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  let bankCodes = {};
  let validNrbCodes = [];
  let foreignBanksData = {};

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

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            currentTheme = e.matches ? "dark" : "light";
            applyTheme(currentTheme);
          }
        });
    }
  }

  initTheme();

  fetch("static/bank_codes.json")
    .then((response) => response.json())
    .then((data) => {
      bankCodes = data;
    })
    .catch((error) =>
      console.error("Błąd załadowania bank_codes.json:", error),
    );

  fetch("static/banks_data.json")
    .then((response) => response.json())
    .then((data) => {
      foreignBanksData = data;
    })
    .catch((error) =>
      console.error("Błąd załadowania banks_data.json:", error),
    );
  const peselOutput = document.getElementById("peselOutput");
  const peselInfo = document.getElementById("peselInfo");
  const openPeselOptionsBtn = document.getElementById("openPeselOptionsBtn");
  const generateBtn = document.getElementById("generateBtn");
  const peselOptionsModal = document.getElementById("peselOptionsModal");
  const closeBtn = peselOptionsModal
    ? peselOptionsModal.querySelector(".close-btn")
    : null;
  const peselOkBtn = document.getElementById("peselOkBtn");

  const openNrbOptionsBtn = document.getElementById("openNrbOptionsBtn");
  const nrbOptionsModal = document.getElementById("nrbOptionsModal");
  const closeNrbBtn = nrbOptionsModal
    ? nrbOptionsModal.querySelector(".close-btn")
    : null;
  const nrbOkBtn = document.getElementById("nrbOkBtn");

  const genderSelect = document.getElementById("gender");
  const birthDateInput = document.getElementById("birthDate");
  const ageInput = document.getElementById("age");

  // Wyczyść drugie pole, gdy jedno z nich jest edytowane / Clear the other field when one is edited
  if (birthDateInput && ageInput) {
    birthDateInput.addEventListener("input", () => {
      if (birthDateInput.value) {
        ageInput.value = "";
      }
    });

    ageInput.addEventListener("input", () => {
      if (ageInput.value) {
        birthDateInput.value = "";
      }
    });
  }

  const generateIdBtn = document.getElementById("generateIdBtn");
  const idOutput = document.getElementById("idOutput");

  const generateRegonBtn = document.getElementById("generateRegonBtn");
  const regonOutput = document.getElementById("regonOutput");
  const regonTypeSelect = document.getElementById("regonType");

  const generateNrbBtn = document.getElementById("generateNrbBtn");
  const nrbInfo = document.getElementById("nrbInfo");
  const nrbOutput = document.getElementById("nrbOutput");
  const bankCodeSelect = document.getElementById("bankCode");
  const nrbFormatSelect = document.getElementById("nrbFormat");
  const ibanPrefixSelect = document.getElementById("ibanPrefix");
  const nrbCountrySelect = document.getElementById("nrbCountry");
  const plBankCodeGroup = document.getElementById("plBankCodeGroup");
  const plIbanPrefixGroup = document.getElementById("plIbanPrefixGroup");

  if (nrbCountrySelect) {
    nrbCountrySelect.addEventListener("change", (e) => {
      const isPl = e.target.value === "PL";
      if (plBankCodeGroup)
        plBankCodeGroup.style.display = isPl ? "flex" : "none";
      if (plIbanPrefixGroup)
        plIbanPrefixGroup.style.display = isPl ? "flex" : "none";
    });
  }

  const copyMessage = document.getElementById("copy-message");

  function showCopyMessage(text) {
    if (!copyMessage) return;
    copyMessage.innerText = text;
    copyMessage.classList.add("show");
    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 3000);
  }

  // Kopiuje innerText elementu do schowka po kliknięciu i pokazuje komunikat.
  function setupCopyOnClick(element, message) {
    if (!element) return;
    element.addEventListener("click", () => {
      const text = element.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => showCopyMessage(message))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage(message);
      }
    });
  }

  function displayPeselInfo(pesel) {
    if (!pesel || pesel.length !== 11 || !peselInfo) return;

    const rr = parseInt(pesel.substring(0, 2));
    const mm = parseInt(pesel.substring(2, 4));
    const dd = parseInt(pesel.substring(4, 6));
    const gender = parseInt(pesel[9]) % 2 === 0 ? "Kobieta" : "Mężczyzna";

    const { year, month: actualMonth } = decodeCentury(rr, mm);

    const birthDate = new Date(year, actualMonth - 1, dd);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    const birthDateStr = `${String(dd).padStart(2, "0")}-${String(actualMonth).padStart(2, "0")}-${year}`;

    peselInfo.textContent = `Płeć: ${gender} | Data urodzenia: ${birthDateStr} | Wiek: ${age} lat`;
  }

  function createCopyableSwift(swiftCode) {
    const span = document.createElement("span");
    span.textContent = swiftCode;
    span.setAttribute("role", "button");
    span.setAttribute("tabindex", "0");
    span.setAttribute(
      "aria-label",
      "Skopiuj SWIFT do schowka / Copy SWIFT to clipboard",
    );
    span.setAttribute("title", "Skopiuj SWIFT / Copy SWIFT");
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline";
    span.style.fontWeight = "bold";

    setupCopyOnClick(span, "SWIFT skopiowany!");

    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        span.click();
      }
    });

    return span;
  }

  function displayNrbInfo(nrb, foreignInfo = null) {
    if (!nrbInfo) return;

    nrbInfo.textContent = "";

    if (!nrb || nrb.length < 10) {
      return;
    }

    if (foreignInfo) {
      const part1 = document.createTextNode(
        `Kraj: ${foreignInfo.country_code} | Bank: ${foreignInfo.bank_name} | Waluta: ${foreignInfo.currency} | SWIFT: `,
      );
      nrbInfo.appendChild(part1);
      nrbInfo.appendChild(createCopyableSwift(foreignInfo.swift));
      return;
    }

    let cleanNrb = nrb.replace(/\s/g, "").replace("PL", "");
    const bankCode8 = cleanNrb.substring(2, 10);
    const bankCode4 = bankCode8.substring(0, 4);

    let infoText = "";
    if (bankCodes[bankCode8]) {
      infoText = `Bank: ${bankCodes[bankCode8]}`;
    } else if (bankCodes[bankCode4]) {
      infoText = `Bank: ${bankCodes[bankCode4]}`;
    } else {
      infoText = `Kod banku: ${bankCode8}`;
    }

    // Add dummy SWIFT mapping for some popular Polish banks for feature parity
    const plSwiftMapping = {
      1010: "NBPLPLPW", // NBP
      1020: "BPKOPLPW", // PKO BP
      1140: "BREXPLPW", // mBank
      1240: "PKOPPLPW", // Pekao
      1090: "WBK PPLPP", // Santander
    };

    if (plSwiftMapping[bankCode4]) {
      nrbInfo.appendChild(document.createTextNode(infoText + ` | SWIFT: `));
      nrbInfo.appendChild(createCopyableSwift(plSwiftMapping[bankCode4]));
      nrbInfo.appendChild(document.createTextNode(` | Waluta: PLN`));
    } else {
      nrbInfo.appendChild(document.createTextNode(infoText + ` | Waluta: PLN`));
    }
  }

  function generateRandomPesel() {
    const year = Math.floor(Math.random() * (2025 - 1900) + 1900);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const gender = Math.random() < 0.5 ? "male" : "female";

    try {
      const newPesel = generatePesel(year, month, day, gender);
      if (peselOutput) peselOutput.innerText = newPesel;
      displayPeselInfo(newPesel);
    } catch (error) {
      console.error("Błąd podczas generowania PESEL:", error);
      if (peselOutput) peselOutput.innerText = "Błąd: " + error.message;
      if (peselInfo) peselInfo.textContent = "";
    }
  }

  function parsePlewiNrbCodes(fileContent) {
    const lines = fileContent.split("\n");
    const codes = new Set();
    const regex = /\t(\d{8})\t/;
    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        codes.add(match[1]);
      }
    }
    return Array.from(codes);
  }

  function calculateGenericIbanChecksum(countryCodeStr, bban) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let countryDigits = "";
    for (let i = 0; i < 2; i++) {
      countryDigits += String(
        letters.indexOf(countryCodeStr[i].toUpperCase()) + 10,
      );
    }

    // Replace letters in BBAN with digits for calculation
    let bbanDigits = "";
    for (let i = 0; i < bban.length; i++) {
      const char = bban[i].toUpperCase();
      if (/[A-Z]/.test(char)) {
        bbanDigits += String(letters.indexOf(char) + 10);
      } else {
        bbanDigits += char;
      }
    }

    const numberToCheck = bbanDigits + countryDigits + "00";

    let remainder = "";
    let block;
    for (let i = 0; i < numberToCheck.length; i += 7) {
      block = remainder + numberToCheck.substring(i, i + 7);
      remainder = (parseInt(block, 10) % 97).toString();
    }
    const controlNumber = 98 - parseInt(remainder, 10);
    return String(controlNumber).padStart(2, "0");
  }

  function generateInternationalAccount(country, format) {
    const countryBanks = foreignBanksData[country];
    if (!countryBanks || countryBanks.length === 0) {
      return {
        iban: `Brak danych dla kraju: ${country}`,
        swift: "",
        currency: "",
        bank_name: "",
        country_code: country,
      };
    }

    const bankInfo =
      countryBanks[Math.floor(Math.random() * countryBanks.length)];

    let bban = "";
    let accountNumber = "";

    switch (country) {
      case "DE": // BBAN: 18 (8 bank code, 10 account)
        accountNumber = randomDigits(10);
        bban = bankInfo.bank_code + accountNumber;
        break;
      case "GB": // BBAN: 18 (4 bank ID, 6 sort code, 8 account)
        accountNumber = randomDigits(8);
        bban =
          bankInfo.swift.substring(0, 4) + bankInfo.bank_code + accountNumber;
        break;
      case "FR": { // BBAN: 23 (5 bank, 5 branch, 11 account, 2 key)
        const branchCode = randomDigits(5);
        accountNumber = randomAlnum(11);
        const ribKey = randomDigits(2);
        bban = bankInfo.bank_code + branchCode + accountNumber + ribKey;
        break;
      }
      case "CZ": // BBAN: 20 (4 bank, 6 branch, 10 account)
      case "SK": { // BBAN: 20 (4 bank, 6 branch, 10 account)
        const branch = randomDigits(6);
        accountNumber = randomDigits(10);
        bban = bankInfo.bank_code + branch + accountNumber;
        break;
      }
      case "CH": // BBAN: 17 (5 bank, 12 account)
        accountNumber = randomAlnum(12);
        bban = bankInfo.bank_code + accountNumber;
        break;
      case "US": // Mock IBAN for US
        accountNumber = randomDigits(12);
        bban = bankInfo.bank_code + accountNumber; // 9-digit routing + 12-digit account
        break;
      default:
        return {
          iban: `Logika dla kraju ${country} niezaimplementowana.`,
          swift: "",
          currency: "",
          bank_name: "",
          country_code: country,
        };
    }

    const checksum = calculateGenericIbanChecksum(country, bban);
    let finalIban = `${country}${checksum}${bban}`;

    if (format === "spaced") {
      finalIban = finalIban.replace(/(.{4})/g, "$1 ").trim();
    }

    return {
      iban: finalIban,
      swift: bankInfo.swift,
      currency: bankInfo.currency,
      bank_name: bankInfo.bank_name,
      country_code: country,
    };
  }

  function calculateNrbChecksum(bban) {
    return calculateGenericIbanChecksum("PL", bban);
  }

  function generateNrb(selectedBankCode, format, prefix) {
    let bankAndBranchCode;

    if (selectedBankCode === "random") {
      if (validNrbCodes.length === 0) {
        return "Brak poprawnych kodów do wygenerowania. Sprawdź plik.";
      }
      bankAndBranchCode =
        validNrbCodes[Math.floor(Math.random() * validNrbCodes.length)];
    } else {
      const filteredCodes = validNrbCodes.filter((code) =>
        code.startsWith(selectedBankCode),
      );
      if (filteredCodes.length === 0) {
        return "Brak poprawnych kodów dla wybranego banku.";
      }
      bankAndBranchCode =
        filteredCodes[Math.floor(Math.random() * filteredCodes.length)];
    }

    const customerNumber = randomDigits(16);

    const fullNumberWithoutChecksum = bankAndBranchCode + customerNumber;
    const checksum = calculateNrbChecksum(fullNumberWithoutChecksum);
    let finalNrb = `${checksum}${fullNumberWithoutChecksum}`;

    if (format === "spaced") {
      finalNrb = `${finalNrb.substring(0, 2)} ${finalNrb.substring(2, 6)} ${finalNrb.substring(6, 10)} ${finalNrb.substring(10, 14)} ${finalNrb.substring(14, 18)} ${finalNrb.substring(18, 22)} ${finalNrb.substring(22, 26)}`;
    }

    if (prefix === "with-prefix") {
      if (format === "spaced") {
        finalNrb = `PL ${finalNrb}`;
      } else {
        finalNrb = `PL${finalNrb}`;
      }
    }
    return finalNrb;
  }

  fetch("static/plewibnra_utf8.txt")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Nie udało się pobrać pliku z danymi banków.");
      }
      return response.text();
    })
    .then((plewibnraContent) => {
      validNrbCodes = parsePlewiNrbCodes(plewibnraContent);
      if (nrbOutput) {
        const selectedCountry = nrbCountrySelect
          ? nrbCountrySelect.value
          : "PL";
        if (selectedCountry === "PL") {
          nrbOutput.innerText = generateNrb(
            bankCodeSelect ? bankCodeSelect.value : "random",
            nrbFormatSelect ? nrbFormatSelect.value : "continuous",
            ibanPrefixSelect ? ibanPrefixSelect.value : "no-prefix",
          );
          displayNrbInfo(nrbOutput.innerText);
        } else {
          const result = generateInternationalAccount(
            selectedCountry,
            nrbFormatSelect ? nrbFormatSelect.value : "continuous",
          );
          nrbOutput.innerText = result.iban;
          displayNrbInfo(result.iban, result);
        }
      }
    })
    .catch((error) => {
      console.error("Wystąpił błąd podczas ładowania danych banków:", error);
      if (nrbOutput) nrbOutput.innerText = "Błąd ładowania danych banków.";
    });

  generateRandomPesel();
  if (idOutput) idOutput.innerText = generateIdNumber();
  if (regonOutput) regonOutput.innerText = generateRegon9();
  if (nrbOutput && nrbOutput.innerText === "Trwa ładowanie...") {
    nrbOutput.innerText = "Trwa ładowanie...";
    displayNrbInfo("");
  }

  // Podpina otwieranie/zamykanie modala opcji (przycisk otwierający, "X",
  // przycisk OK) i zwraca funkcję zamykającą do użycia poza modalem
  // (klik w tło, klawisz Escape).
  function setupModal({ openBtn, modal, closeBtn, okBtn }) {
    const close = () => {
      if (!modal) return;
      modal.style.display = "none";
      if (openBtn) openBtn.focus();
    };

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (!modal) return;
        modal.style.display = "block";
        if (closeBtn) closeBtn.focus();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", close);
      closeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          close();
        }
      });
    }

    if (okBtn) okBtn.addEventListener("click", close);

    return close;
  }

  const closePeselModal = setupModal({
    openBtn: openPeselOptionsBtn,
    modal: peselOptionsModal,
    closeBtn,
    okBtn: peselOkBtn,
  });

  const closeNrbModal = setupModal({
    openBtn: openNrbOptionsBtn,
    modal: nrbOptionsModal,
    closeBtn: closeNrbBtn,
    okBtn: nrbOkBtn,
  });

  window.addEventListener("click", (event) => {
    if (event.target == peselOptionsModal) {
      closePeselModal();
    } else if (event.target == nrbOptionsModal) {
      closeNrbModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (peselOptionsModal && peselOptionsModal.style.display === "block") {
        closePeselModal();
      } else if (nrbOptionsModal && nrbOptionsModal.style.display === "block") {
        closeNrbModal();
      }
    }
  });

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      let year, month, day, gender;

      const selectedGender = genderSelect ? genderSelect.value : "random";
      const birthDateValue = birthDateInput ? birthDateInput.value : "";
      const ageValue = ageInput ? ageInput.value : "";

      if (selectedGender === "random") {
        gender = Math.random() < 0.5 ? "male" : "female";
      } else {
        gender = selectedGender;
      }

      if (birthDateValue) {
        const date = new Date(birthDateValue);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
      } else if (ageValue) {
        const currentYear = new Date().getFullYear();
        year = currentYear - parseInt(ageValue);
        month = Math.floor(Math.random() * 12) + 1;
        day = Math.floor(Math.random() * 28) + 1;
      } else {
        year = Math.floor(Math.random() * (2025 - 1900) + 1900);
        month = Math.floor(Math.random() * 12) + 1;
        day = Math.floor(Math.random() * 28) + 1;
      }

      try {
        const newPesel = generatePesel(year, month, day, gender);
        if (peselOutput) peselOutput.innerText = newPesel;
        displayPeselInfo(newPesel);
      } catch (error) {
        console.error("Błąd podczas generowania PESEL:", error);
        if (peselOutput) peselOutput.innerText = "Błąd: " + error.message;
        if (peselInfo) peselInfo.textContent = "";
      }
    });
  }

  setupCopyOnClick(peselOutput, "Numer PESEL skopiowany!");

  if (generateIdBtn) {
    generateIdBtn.addEventListener("click", () => {
      if (idOutput) idOutput.innerText = generateIdNumber();
    });
  }

  setupCopyOnClick(idOutput, "Numer dowodu skopiowany!");

  if (generateRegonBtn) {
    generateRegonBtn.addEventListener("click", () => {
      const regonType = regonTypeSelect ? regonTypeSelect.value : "9";
      if (regonType === "9") {
        if (regonOutput) regonOutput.innerText = generateRegon9();
      } else {
        if (regonOutput) regonOutput.innerText = generateRegon14();
      }
    });
  }

  if (regonTypeSelect) {
    regonTypeSelect.addEventListener("change", () => {
      const regonType = regonTypeSelect.value;
      if (regonType === "9") {
        if (regonOutput) regonOutput.innerText = generateRegon9();
      } else {
        if (regonOutput) regonOutput.innerText = generateRegon14();
      }
    });
  }

  setupCopyOnClick(regonOutput, "REGON skopiowany!");

  if (generateNrbBtn) {
    generateNrbBtn.addEventListener("click", () => {
      const selectedCountry = nrbCountrySelect ? nrbCountrySelect.value : "PL";
      const selectedFormat = nrbFormatSelect
        ? nrbFormatSelect.value
        : "continuous";

      if (selectedCountry === "PL") {
        const selectedBankCode = bankCodeSelect
          ? bankCodeSelect.value
          : "random";
        const selectedPrefix = ibanPrefixSelect
          ? ibanPrefixSelect.value
          : "no-prefix";
        const newNrb = generateNrb(
          selectedBankCode,
          selectedFormat,
          selectedPrefix,
        );
        if (nrbOutput) nrbOutput.innerText = newNrb;
        displayNrbInfo(newNrb);
      } else {
        const result = generateInternationalAccount(
          selectedCountry,
          selectedFormat,
        );
        if (nrbOutput) nrbOutput.innerText = result.iban;
        displayNrbInfo(result.iban, result);
      }
    });
  }

  setupCopyOnClick(nrbOutput, "Numer rachunku skopiowany!");

  const nameOutput = document.getElementById("nameOutput");
  const surnameOutput = document.getElementById("surnameOutput");
  const genderSelectName = document.getElementById("genderSelect");
  const generateNameBtn = document.getElementById("generateNameBtn");

  let maleNames = [];
  let maleSurnames = [];
  let femaleNames = [];
  let femaleSurnames = [];

  async function loadNameData() {
    try {
      const maleNamesResponse = await fetch("static/pl_male_names.json");
      maleNames = await maleNamesResponse.json();

      const maleSurnamesResponse = await fetch("static/pl_male_surnames.json");
      maleSurnames = await maleSurnamesResponse.json();

      const femaleNamesResponse = await fetch("static/pl_female_names.json");
      femaleNames = await femaleNamesResponse.json();

      const femaleSurnamesResponse = await fetch(
        "static/pl_female_surnames.json",
      );
      femaleSurnames = await femaleSurnamesResponse.json();

      generateRandomName();
    } catch (error) {
      console.error("Błąd podczas ładowania danych imion:", error);
      if (nameOutput) nameOutput.innerText = "Błąd ładowania";
      if (surnameOutput) surnameOutput.innerText = "Błąd ładowania";
    }
  }

  function generateRandomName() {
    let selectedGender = genderSelectName ? genderSelectName.value : "random";

    if (selectedGender === "random") {
      selectedGender = Math.random() < 0.5 ? "male" : "female";
    }

    let names, surnames;
    if (selectedGender === "male") {
      names = maleNames;
      surnames = maleSurnames;
    } else {
      names = femaleNames;
      surnames = femaleSurnames;
    }

    if (names.length === 0 || surnames.length === 0) {
      if (nameOutput) nameOutput.innerText = "Brak danych";
      if (surnameOutput) surnameOutput.innerText = "Brak danych";
      return;
    }

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];

    if (nameOutput) nameOutput.innerText = randomName;
    if (surnameOutput) surnameOutput.innerText = randomSurname;
  }

  if (generateNameBtn) {
    generateNameBtn.addEventListener("click", generateRandomName);
  }

  setupCopyOnClick(nameOutput, "Imię skopiowane!");
  setupCopyOnClick(surnameOutput, "Nazwisko skopiowane!");

  loadNameData();

  const outputElements = [
    peselOutput,
    idOutput,
    regonOutput,
    nrbOutput,
    nameOutput,
    surnameOutput,
  ];
  outputElements.forEach((el) => {
    if (el) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    }
  });
});
