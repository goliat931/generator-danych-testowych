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

  function showMessage(text, element, inputElement, isSuccess = false) {
    element.className = "validator-result " + (isSuccess ? "valid" : "invalid");
    // Secure fix: Using textContent instead of innerHTML to prevent DOM XSS
    element.textContent = text;
    if (inputElement) {
      inputElement.setAttribute("aria-invalid", isSuccess ? "false" : "true");
    }
  }

  function clearValidation(element, inputElement) {
    element.className = "validator-result";
    element.textContent = "";
    if (inputElement) {
      inputElement.removeAttribute("aria-invalid");
    }
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
    nrb = nrb.replace(/\s/g, "").toUpperCase();
    if (nrb.startsWith("PL")) {
      nrb = nrb.substring(2);
    }

    if (nrb.length !== 26) {
      return { isValid: false, message: "❌ Numer rachunku musi mieć 26 cyfr" };
    }

    if (!/^\d{26}$/.test(nrb)) {
      return {
        isValid: false,
        message: "❌ Numer rachunku może zawierać tylko cyfry (poza PL)",
      };
    }

    const countryCode = "2521";
    const bban = nrb.substring(2);
    const numberToCheck = bban + countryCode + "00";

    let remainder = "";
    let block;
    for (let i = 0; i < numberToCheck.length; i += 7) {
      block = remainder + numberToCheck.substring(i, i + 7);
      remainder = (parseInt(block, 10) % 97).toString();
    }

    const controlNumber = 98 - parseInt(remainder, 10);
    const expectedChecksum = String(controlNumber).padStart(2, "0");
    const actualChecksum = nrb.substring(0, 2);

    if (expectedChecksum !== actualChecksum) {
      return {
        isValid: false,
        message:
          "❌ Numer rachunku jest niepoprawny (błędna suma kontrolna IBAN)",
      };
    }

    const bankCode8 = nrb.substring(2, 10);
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

  peselValidateBtn.addEventListener("click", () => {
    const pesel = peselInput.value.trim();
    if (pesel) {
      const result = validatePesel(pesel);
      showMessage(result.message, peselResult, peselInput, result.isValid);
    } else {
      showMessage("❌ Wpisz numer PESEL", peselResult, peselInput, false);
    }
  });

  peselInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") peselValidateBtn.click();
  });

  peselInput.addEventListener("input", () => {
    clearValidation(peselResult, peselInput);
  });

  idValidateBtn.addEventListener("click", () => {
    const id = idInput.value.trim().toUpperCase();
    if (id) {
      const result = validateId(id);
      showMessage(result.message, idResult, idInput, result.isValid);
    } else {
      showMessage("❌ Wpisz numer dowodu", idResult, idInput, false);
    }
  });

  idInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") idValidateBtn.click();
  });

  idInput.addEventListener("input", () => {
    clearValidation(idResult, idInput);
  });

  regonValidateBtn.addEventListener("click", () => {
    const regon = regonInput.value.trim();
    if (regon) {
      const result = validateRegon(regon);
      showMessage(result.message, regonResult, regonInput, result.isValid);
    } else {
      showMessage("❌ Wpisz numer REGON", regonResult, regonInput, false);
    }
  });

  regonInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") regonValidateBtn.click();
  });

  regonInput.addEventListener("input", () => {
    clearValidation(regonResult, regonInput);
  });

  nrbValidateBtn.addEventListener("click", () => {
    const nrb = nrbInput.value.trim();
    if (nrb) {
      const result = validateNrb(nrb);
      showMessage(result.message, nrbResult, nrbInput, result.isValid);
    } else {
      showMessage("❌ Wpisz numer rachunku", nrbResult, nrbInput, false);
    }
  });

  nrbInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") nrbValidateBtn.click();
  });

  nrbInput.addEventListener("input", () => {
    clearValidation(nrbResult, nrbInput);
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
