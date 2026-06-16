const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
const encodedMonths = {
  "1800-1899": 80,
  "1900-1999": 0,
  "2000-2099": 20,
  "2100-2199": 40,
  "2200-2299": 60,
};

const letterToNumber = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i]),
);
const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];

const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

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
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  let letterPart = "";
  for (let i = 0; i < 3; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  let digitsPart = "";
  for (let i = 0; i < 6; i++) {
    digitsPart += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  let idArrayChars = [
    letterPart[0],
    letterPart[1],
    letterPart[2],
    0,
    ...digitsPart.slice(1),
  ];

  const numericArray = idArrayChars.map((char) =>
    /[A-Z]/.test(char) ? letterToNumber[char] : parseInt(char, 10),
  );

  let sum = 0;
  for (let i = 0; i < weightsId.length; i++) {
    sum += numericArray[i] * weightsId[i];
  }

  const controlDigit = sum % 10;
  return letterPart + controlDigit + digitsPart.slice(1);
}

function getEncodedMonth(year, month) {
  if (year >= 1800 && year <= 1899)
    return String(month + encodedMonths["1800-1899"]).padStart(2, "0");
  if (year >= 1900 && year <= 1999)
    return String(month + encodedMonths["1900-1999"]).padStart(2, "0");
  if (year >= 2000 && year <= 2099)
    return String(month + encodedMonths["2000-2099"]).padStart(2, "0");
  if (year >= 2100 && year <= 2199)
    return String(month + encodedMonths["2100-2199"]).padStart(2, "0");
  if (year >= 2200 && year <= 2299)
    return String(month + encodedMonths["2200-2299"]).padStart(2, "0");
  throw new Error("Unsupported year for PESEL generation.");
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
  const digits = "0123456789";
  let regon8 = "";
  for (let i = 0; i < 8; i++) {
    regon8 += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  const controlDigit = calculateRegon9Checksum(regon8);
  return `${regon8}${controlDigit}`;
}

function generateRegon14() {
  const regon9 = generateRegon9();
  const digits = "0123456789";
  let localDigits = "";
  for (let i = 0; i < 4; i++) {
    localDigits += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  const regon13 = `${regon9}${localDigits}`;
  const controlDigit = calculateRegon14Checksum(regon13);
  return `${regon13}${controlDigit}`;
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
        themeToggleBtn.setAttribute("aria-label", theme);
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

  const peselOutput = document.getElementById("peselOutput");
  const peselInfo = document.getElementById("peselInfo");
  const openPeselOptionsBtn = document.getElementById("openPeselOptionsBtn");
  const generateBtn = document.getElementById("generateBtn");
  const peselOptionsModal = document.getElementById("peselOptionsModal");
  const closeBtn = peselOptionsModal
    ? peselOptionsModal.querySelector(".close-btn")
    : null;

  const genderSelect = document.getElementById("gender");
  const birthDateInput = document.getElementById("birthDate");
  const ageInput = document.getElementById("age");

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

  const copyMessage = document.getElementById("copy-message");

  function showCopyMessage(text) {
    if (!copyMessage) return;
    copyMessage.innerText = text;
    copyMessage.classList.add("show");
    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 3000);
  }

  function displayPeselInfo(pesel) {
    if (!pesel || pesel.length !== 11 || !peselInfo) return;

    const rr = parseInt(pesel.substring(0, 2));
    const mm = parseInt(pesel.substring(2, 4));
    const dd = parseInt(pesel.substring(4, 6));
    const gender = parseInt(pesel[9]) % 2 === 0 ? "Kobieta" : "Mężczyzna";

    let actualMonth = mm;
    let year = rr;
    if (mm > 80) {
      actualMonth = mm - 80;
      year = 1800 + rr;
    } else if (mm > 60) {
      actualMonth = mm - 60;
      year = 2200 + rr;
    } else if (mm > 40) {
      actualMonth = mm - 40;
      year = 2100 + rr;
    } else if (mm > 20) {
      actualMonth = mm - 20;
      year = 2000 + rr;
    } else {
      year = 1900 + rr;
    }

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

  function displayNrbInfo(nrb) {
    if (!nrbInfo) return;
    if (!nrb || nrb.length < 10) {
      nrbInfo.textContent = "";
      return;
    }

    let cleanNrb = nrb.replace(/\s/g, "").replace("PL", "");
    const bankCode8 = cleanNrb.substring(2, 10);
    const bankCode4 = bankCode8.substring(0, 4);

    if (bankCodes[bankCode8]) {
      nrbInfo.textContent = `Bank: ${bankCodes[bankCode8]}`;
    } else if (bankCodes[bankCode4]) {
      nrbInfo.textContent = `Bank: ${bankCodes[bankCode4]}`;
    } else {
      nrbInfo.textContent = `Kod banku: ${bankCode8}`;
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

  function calculateNrbChecksum(bban) {
    const countryCode = "2521";
    const numberToCheck = bban + countryCode + "00";

    let remainder = "";
    let block;
    for (let i = 0; i < numberToCheck.length; i += 7) {
      block = remainder + numberToCheck.substring(i, i + 7);
      remainder = (parseInt(block, 10) % 97).toString();
    }
    const controlNumber = 98 - parseInt(remainder, 10);
    return String(controlNumber).padStart(2, "0");
  }

  function generateNrb(selectedBankCode, format, prefix) {
    let bankAndBranchCode;
    const digits = "0123456789";

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

    let customerNumber = "";
    for (let i = 0; i < 16; i++) {
      customerNumber += digits.charAt(
        Math.floor(Math.random() * digits.length),
      );
    }

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
        nrbOutput.innerText = generateNrb(
          bankCodeSelect ? bankCodeSelect.value : "random",
          nrbFormatSelect ? nrbFormatSelect.value : "continuous",
          ibanPrefixSelect ? ibanPrefixSelect.value : "no-prefix",
        );
        displayNrbInfo(nrbOutput.innerText);
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

  if (openPeselOptionsBtn) {
    openPeselOptionsBtn.addEventListener("click", () => {
      if (peselOptionsModal) peselOptionsModal.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (peselOptionsModal) peselOptionsModal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target == peselOptionsModal) {
      peselOptionsModal.style.display = "none";
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

  if (peselOutput) {
    peselOutput.addEventListener("click", () => {
      const peselText = peselOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(peselText)
          .then(() => showCopyMessage("Numer PESEL skopiowany!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("Numer PESEL skopiowany!");
      }
    });
  }

  if (generateIdBtn) {
    generateIdBtn.addEventListener("click", () => {
      if (idOutput) idOutput.innerText = generateIdNumber();
    });
  }

  if (idOutput) {
    idOutput.addEventListener("click", () => {
      const idText = idOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(idText)
          .then(() => showCopyMessage("Numer dowodu skopiowany!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("Numer dowodu skopiowany!");
      }
    });
  }

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

  if (regonOutput) {
    regonOutput.addEventListener("click", () => {
      const regonText = regonOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(regonText)
          .then(() => showCopyMessage("REGON skopiowany!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("REGON skopiowany!");
      }
    });
  }

  if (generateNrbBtn) {
    generateNrbBtn.addEventListener("click", () => {
      const selectedBankCode = bankCodeSelect ? bankCodeSelect.value : "random";
      const selectedFormat = nrbFormatSelect
        ? nrbFormatSelect.value
        : "continuous";
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
    });
  }

  if (nrbOutput) {
    nrbOutput.addEventListener("click", () => {
      const nrbText = nrbOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(nrbText)
          .then(() => showCopyMessage("Numer rachunku skopiowany!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("Numer rachunku skopiowany!");
      }
    });
  }

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

  if (nameOutput) {
    nameOutput.addEventListener("click", () => {
      const nameText = nameOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(nameText)
          .then(() => showCopyMessage("Imię skopiowane!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("Imię skopiowane!");
      }
    });
  }

  if (surnameOutput) {
    surnameOutput.addEventListener("click", () => {
      const surnameText = surnameOutput.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(surnameText)
          .then(() => showCopyMessage("Nazwisko skopiowane!"))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage("Nazwisko skopiowane!");
      }
    });
  }

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
