document.addEventListener("DOMContentLoaded", () => {
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

  let bankCodes = {};
  fetch("static/bank_codes.json")
    .then((response) => response.json())
    .then((data) => {
      bankCodes = data;
    })
    .catch((error) =>
      console.error("Błąd załadowania bank_codes.json:", error),
    );

  const peselInput = document.getElementById("peselInput");
  const peselValidateBtn = document.getElementById("peselValidateBtn");
  const peselResult = document.getElementById("peselResult");

  const idInput = document.getElementById("idInput");
  const idValidateBtn = document.getElementById("idValidateBtn");
  const idResult = document.getElementById("idResult");

  const regonInput = document.getElementById("regonInput");
  const regonValidateBtn = document.getElementById("regonValidateBtn");
  const regonResult = document.getElementById("regonResult");

  const nrbInput = document.getElementById("nrbInput");
  const nrbValidateBtn = document.getElementById("nrbValidateBtn");
  const nrbResult = document.getElementById("nrbResult");

  const copyMessage = document.getElementById("copy-message");

  const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const letterToNumber = Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i]),
  );
  const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];
  const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

  function showMessage(text, element, isSuccess = false) {
    element.className = "validator-result " + (isSuccess ? "valid" : "invalid");
    // Secure fix: Using textContent instead of innerHTML to prevent DOM XSS
    element.textContent = text;
  }

  function isValidPeselChecksum(pesel) {
    let checksumSum = 0;
    for (let i = 0; i < 10; i++) {
      checksumSum += parseInt(pesel[i]) * weightsPesel[i];
    }
    const lastDigitOfSum = checksumSum % 10;
    const expectedChecksum = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
    const actualChecksum = parseInt(pesel[10]);
    return expectedChecksum === actualChecksum;
  }

  function decodePeselDate(pesel) {
    const rr = parseInt(pesel.substring(0, 2));
    const mm = parseInt(pesel.substring(2, 4));
    const dd = parseInt(pesel.substring(4, 6));

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
    return { year, month: actualMonth, day: dd };
  }

  function calculateAge(year, month, day) {
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function validatePesel(pesel) {
    if (!pesel || pesel.length !== 11)
      return { isValid: false, message: "❌ Numer PESEL musi mieć 11 cyfr" };
    if (!/^\d{11}$/.test(pesel))
      return {
        isValid: false,
        message: "❌ Numer PESEL może zawierać tylko cyfry",
      };
    if (!isValidPeselChecksum(pesel))
      return {
        isValid: false,
        message: "❌ Numer PESEL jest niepoprawny (błędna suma kontrolna)",
      };

    const { year, month: actualMonth, day: dd } = decodePeselDate(pesel);
    if (actualMonth < 1 || actualMonth > 12)
      return {
        isValid: false,
        message: "❌ Numer PESEL jest niepoprawny (miesiąc)",
      };
    if (dd < 1 || dd > 31)
      return {
        isValid: false,
        message: "❌ Numer PESEL jest niepoprawny (dzień)",
      };

    const gender = parseInt(pesel[9]) % 2 === 0 ? "Kobieta" : "Mężczyzna";
    const age = calculateAge(year, actualMonth, dd);
    const birthDateStr = `${String(dd).padStart(2, "0")}-${String(actualMonth).padStart(2, "0")}-${year}`;

    return {
      isValid: true,
      message: `✅ Numer PESEL jest poprawny!\nPłeć: ${gender}\nData urodzenia: ${birthDateStr}\nWiek: ${age} lat`,
    };
  }

  function validateId(id) {
    if (!id || id.length !== 9)
      return { isValid: false, message: "❌ Numer dowodu musi mieć 9 znaków" };
    if (!/^[A-Z]{3}\d{6}$/.test(id))
      return {
        isValid: false,
        message: "❌ Format dowodu powinien być: 3 litery + 6 cyfr",
      };

    const idWithoutChecksum = id.substring(0, 3) + "0" + id.substring(4, 9);
    const numericArray = idWithoutChecksum.split("").map((char) => {
      return /[A-Z]/.test(char) ? letterToNumber[char] : parseInt(char, 10);
    });

    let sum = 0;
    for (let i = 0; i < weightsId.length; i++) {
      sum += numericArray[i] * weightsId[i];
    }

    const expectedChecksum = sum % 10;
    const actualChecksum = parseInt(id[3]);

    if (expectedChecksum !== actualChecksum)
      return {
        isValid: false,
        message: "❌ Numer dowodu jest niepoprawny (błędna suma kontrolna)",
      };

    return {
      isValid: true,
      message: "✅ Numer dowodu osobistego jest poprawny!",
    };
  }

  function validateRegon9(regon9) {
    if (regon9.length !== 9) return false;

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(regon9[i]) * weightsRegon9[i];
    }
    const checksum = sum % 11;
    const expectedChecksum = checksum === 10 ? 0 : checksum;
    const actualChecksum = parseInt(regon9[8]);

    return expectedChecksum === actualChecksum;
  }

  function validateRegon14(regon14) {
    if (regon14.length !== 14) return false;

    if (!validateRegon9(regon14.substring(0, 9))) return false;

    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(regon14[i]) * weightsRegon14[i];
    }
    const checksum = sum % 11;
    const expectedChecksum = checksum === 10 ? 0 : checksum;
    const actualChecksum = parseInt(regon14[13]);

    return expectedChecksum === actualChecksum;
  }

  function validateRegon(regon) {
    regon = regon.replace(/\s/g, "");
    if (!/^\d+$/.test(regon))
      return {
        isValid: false,
        message: "❌ Numer REGON może zawierać tylko cyfry",
      };

    if (regon.length === 9) {
      if (validateRegon9(regon))
        return {
          isValid: true,
          message: "✅ Numer REGON (9 cyfr) jest poprawny!",
        };
      return {
        isValid: false,
        message: "❌ Numer REGON jest niepoprawny (błędna suma kontrolna)",
      };
    } else if (regon.length === 14) {
      if (validateRegon14(regon))
        return {
          isValid: true,
          message: "✅ Numer REGON (14 cyfr) jest poprawny!",
        };
      return {
        isValid: false,
        message: "❌ Numer REGON jest niepoprawny (błędna suma kontrolna)",
      };
    } else {
      return {
        isValid: false,
        message: "❌ Numer REGON musi mieć 9 lub 14 cyfr",
      };
    }
  }

  function validateNrb(nrb) {
    const iban = nrb.replace(/\s/g, "").toUpperCase();

    if (iban.length < 5 || iban.length > 34) {
      return { isValid: false, message: "❌ Nieprawidłowa długość numeru IBAN." };
    }

    const country = iban.substring(0, 2);
    if (!/^[A-Z]{2}$/.test(country)) {
        return { isValid: false, message: "❌ Nieprawidłowy kod kraju w numerze IBAN." };
    }
    
    const checksum = iban.substring(2, 4);
    if (!/^\d{2}$/.test(checksum)) {
        return { isValid: false, message: "❌ Nieprawidłowa suma kontrolna w numerze IBAN (musi składać się z 2 cyfr)." };
    }

    const bban = iban.substring(4);
    const rearranged = bban + country + checksum;

    const numericIban = rearranged.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // A-Z
            return code - 55;
        }
        return char;
    }).join('');

    if (!/^[0-9]+$/.test(numericIban)) {
        return { isValid: false, message: "❌ IBAN zawiera niedozwolone znaki." };
    }

    try {
        const remainder = BigInt(numericIban) % 97n;
        if (remainder !== 1n) {
            return {
                isValid: false,
                message: "❌ Numer rachunku jest niepoprawny (błędna suma kontrolna IBAN)",
            };
        }
    } catch (e) {
        return { isValid: false, message: "❌ Błąd podczas walidacji numeru IBAN." };
    }

    if (country === 'PL') {
      if (iban.length !== 28) {
        return { isValid: false, message: "❌ Polski numer IBAN musi mieć 28 znaków (PL + 26 cyfr)." };
      }
      const bankCode8 = bban.substring(0, 8);
      const bankCode4 = bankCode8.substring(0, 4);
      let bankName = "Nieznany bank";

      if (bankCodes[bankCode8]) {
        bankName = bankCodes[bankCode8];
      } else if (bankCodes[bankCode4]) {
        bankName = bankCodes[bankCode4];
      }

      return {
        isValid: true,
        message: `✅ Numer rachunku bankowego jest poprawny!\nBank: ${bankName}`,
      };
    }

    return {
      isValid: true,
      message: `✅ Numer IBAN (${country}) jest poprawny!`,
    };
  }

  peselValidateBtn.addEventListener("click", () => {
    const pesel = peselInput.value.trim();
    if (pesel) {
      const result = validatePesel(pesel);
      showMessage(result.message, peselResult, result.isValid);
    } else {
      showMessage("❌ Wpisz numer PESEL", peselResult, false);
    }
  });

  peselInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") peselValidateBtn.click();
  });

  idValidateBtn.addEventListener("click", () => {
    const id = idInput.value.trim().toUpperCase();
    if (id) {
      const result = validateId(id);
      showMessage(result.message, idResult, result.isValid);
    } else {
      showMessage("❌ Wpisz numer dowodu", idResult, false);
    }
  });

  idInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") idValidateBtn.click();
  });

  regonValidateBtn.addEventListener("click", () => {
    const regon = regonInput.value.trim();
    if (regon) {
      const result = validateRegon(regon);
      showMessage(result.message, regonResult, result.isValid);
    } else {
      showMessage("❌ Wpisz numer REGON", regonResult, false);
    }
  });

  regonInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") regonValidateBtn.click();
  });

  nrbValidateBtn.addEventListener("click", () => {
    const rawNrb = nrbInput.value || "";
    const { normalizedValue, countryCode, hasCountryCode } = normalizeNrbInput(rawNrb);
    const formattedNrb = hasCountryCode
      ? `${countryCode}${normalizedValue}`
      : normalizedValue;

    nrbInput.value = formattedNrb;

    if (formattedNrb) {
      const result = validateNrb(formattedNrb);
      showMessage(result.message, nrbResult, result.isValid);
    } else {
      showMessage("❌ Wpisz numer rachunku", nrbResult, false);
    }
  });

  nrbInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") nrbValidateBtn.click();
  });

  if (typeof window !== "undefined") {
    window.validateNrb = validateNrb;
    window.__test_validator__ = {
      validatePesel,
      isValidPeselChecksum,
      decodePeselDate,
      calculateAge,
    };
  }
});
