document.addEventListener('DOMContentLoaded', () => {
    // ====================================================

    // ====================================================
    // 0.5 Załadowanie kodów bankowych z JSON
    // ====================================================
    
    // Załaduj bank_codes.json
    let bankCodes = {};
    fetch('static/bank_codes.json')
        .then(response => response.json())
        .then(data => {
            bankCodes = data;
        })
        .catch(error => console.error('Błąd załadowania bank_codes.json:', error));

    // ====================================================
    // 1. Selektory DOM
    // ====================================================

    const peselInput = document.getElementById('peselInput');
    const peselValidateBtn = document.getElementById('peselValidateBtn');
    const peselResult = document.getElementById('peselResult');

    const idInput = document.getElementById('idInput');
    const idValidateBtn = document.getElementById('idValidateBtn');
    const idResult = document.getElementById('idResult');

    const regonInput = document.getElementById('regonInput');
    const regonValidateBtn = document.getElementById('regonValidateBtn');
    const regonResult = document.getElementById('regonResult');

    const nrbInput = document.getElementById('nrbInput');
    const nrbValidateBtn = document.getElementById('nrbValidateBtn');
    const nrbResult = document.getElementById('nrbResult');

    const copyMessage = document.getElementById('copy-message');

    // ====================================================
    // 2. Stałe
    // ====================================================

    const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const letterToNumber = Object.fromEntries(
        Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i])
    );

  // ====================================================
  // 1. Selektory DOM / DOM Selectors
  // ====================================================

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

  // ====================================================
  // 2. Stałe / Constants
  // ====================================================

  const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const letterToNumber = Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i]),
  );
  const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];
  const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
  const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

  const encodedMonths = {
    "1800-1899": 80,
    "1900-1999": 0,
    "2000-2099": 20,
    "2100-2199": 40,
    "2200-2299": 60,
  };

  // ====================================================
  // 3. Funkcje pomocnicze / Helper functions
  // ====================================================

  function showMessage(text, element, isSuccess = false) {
    element.className = "validator-result " + (isSuccess ? "valid" : "invalid");
    element.textContent = text;
  }

  function showCopyMessage(text) {
    copyMessage.innerText = text;
    copyMessage.classList.add("show");
    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 3000);
  }

  // ====================================================
  // 4. Walidacja PESEL / PESEL validation
  // ====================================================

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

  function setPeselSuccessResult(element, gender, birthDateStr, age) {
    element.textContent = "";

    const successLine = document.createTextNode(
      "✅ Numer PESEL jest poprawny!",
    );
    const br1 = document.createElement("br");
    const genderLine = document.createTextNode(`Płeć: ${gender}`);
    const br2 = document.createElement("br");
    const birthDateLine = document.createTextNode(
      `Data urodzenia: ${birthDateStr}`,
    );
    const br3 = document.createElement("br");
    const ageLine = document.createTextNode(`Wiek: ${age} lat`);

    element.appendChild(successLine);
    element.appendChild(br1);
    element.appendChild(genderLine);
    element.appendChild(br2);
    element.appendChild(birthDateLine);
    element.appendChild(br3);
    element.appendChild(ageLine);

    element.className = "validator-result valid";
  }

  /**
   * Waliduje poprawność numeru PESEL / Validates PESEL number correctness
   * @param {string} pesel Numer PESEL do walidacji / PESEL number
   * @returns {boolean} True jeśli PESEL jest poprawny / True if PESEL is correct
   */
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

  // ====================================================
  // 5. Walidacja Dowodu Osobistego / ID Card validation
  // ====================================================

  /**
   * Waliduje poprawność numeru dowodu osobistego / Validates ID card number correctness
   * @param {string} id Numer dowodu do walidacji / ID card number to validate
   * @returns {boolean} True jeśli dowód jest poprawny / True if ID card is correct
   */
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

  // ====================================================
  // 6. Walidacja REGON / REGON validation
  // ====================================================

  /**
   * Waliduje poprawność 9-cyfrowego REGON-u / Validates 9-digit REGON correctness
   * @param {string} regon9 Numer REGON / REGON number
   * @returns {boolean}
   */
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

  /**
   * Waliduje poprawność 14-cyfrowego REGON-u / Validates 14-digit REGON correctness
   * @param {string} regon14 Numer REGON / REGON number
   * @returns {boolean}
   */
  function validateRegon14(regon14) {
    if (regon14.length !== 14) return false;

    // Waliduj pierwszych 9 cyfr / Validate first 9 digits
    if (!validateRegon9(regon14.substring(0, 9))) return false;

    // Waliduj ostatnich 5 cyfr / Validate last 5 digits
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(regon14[i]) * weightsRegon14[i];
    }
    const checksum = sum % 11;
    const expectedChecksum = checksum === 10 ? 0 : checksum;
    const actualChecksum = parseInt(regon14[13]);

    return expectedChecksum === actualChecksum;
  }

  /**
   * Waliduje REGON / Validates REGON
   * @param {string} regon Numer REGON do walidacji / REGON number
   * @returns {boolean}
   */
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

    // ====================================================
    // 7. Walidacja Rachunku Bankowego (NRB)
    // ====================================================

    /**
     * Waliduje poprawność numeru rachunku bankowego
     * @param {string} nrb Numer rachunku do walidacji
     * @returns {Object} Obiekt z wynikiem walidacji { isValid: boolean, error?: string, bankName?: string }
     */
    function validateNrb(nrb) {
        // Usunięcie spacji i prefiksu PL
        nrb = nrb.replace(/\s/g, '').toUpperCase();
        if (nrb.startsWith('PL')) {
            nrb = nrb.substring(2);
        }

        // Sprawdzenie długości
        if (nrb.length !== 26) {
            return { isValid: false, error: '❌ Numer rachunku musi mieć 26 cyfr' };
        }

        // Sprawdzenie czy to tylko cyfry
        if (!/^\d{26}$/.test(nrb)) {
            return { isValid: false, error: '❌ Numer rachunku może zawierać tylko cyfry (poza PL)' };
        }

        // Walidacja IBAN (checksum) - WAŻNE: obliczamy z '00' zamiast rzeczywistego checksuma
        const countryCode = '2521'; // PL w ISO 7064
        const bban = nrb.substring(2); // Opuść pierwsze 2 cyfry (checksum)
        const numberToCheck = bban + countryCode + '00'; // Używamy '00' do obliczenia, tak jak w generatorze

        let remainder = '';
        let block;
        for (let i = 0; i < numberToCheck.length; i += 7) {
            block = remainder + numberToCheck.substring(i, i + 7);
            remainder = (parseInt(block, 10) % 97).toString();
        }

        const controlNumber = 98 - parseInt(remainder, 10);
        const expectedChecksum = String(controlNumber).padStart(2, '0');
        const actualChecksum = nrb.substring(0, 2);

        if (expectedChecksum !== actualChecksum) {
            return { isValid: false, error: '❌ Numer rachunku jest niepoprawny (błędna suma kontrolna IBAN)' };
        }

        // Odczyt nazwy banku (pozycje 3-10 to 8-cyfrowy identyfikator banku)
        const bankCode8 = nrb.substring(2, 10);
        const bankCode4 = bankCode8.substring(0, 4);
        let bankName = 'Nieznany bank';

        // Szukaj najpierw 8-cyfrowego kodu, potem 4-cyfrowego
        if (bankCodes[bankCode8]) {
            bankName = bankCodes[bankCode8];
        } else if (bankCodes[bankCode4]) {
            bankName = bankCodes[bankCode4];
        }

        const message = `✅ Numer rachunku bankowego jest poprawny!\nBank: ${bankName}`;

        nrbResult.textContent = message;
        nrbResult.className = 'validator-result valid';
        return true;
    }

    // ====================================================
    // 8. Event Listeners
    // ====================================================

    peselValidateBtn.addEventListener('click', () => {
        const pesel = peselInput.value.trim();
        if (pesel) {
            validatePesel(pesel);
        } else {
            showMessage('❌ Wpisz numer PESEL', peselResult, false);
        }
    });

    peselInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') peselValidateBtn.click();
    });

    idValidateBtn.addEventListener('click', () => {
        const id = idInput.value.trim().toUpperCase();
        if (id) {
            validateId(id);
        } else {
            showMessage('❌ Wpisz numer dowodu', idResult, false);
        }
    });

    idInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') idValidateBtn.click();
    });

    regonValidateBtn.addEventListener('click', () => {
        const regon = regonInput.value.trim();
        if (regon) {
            validateRegon(regon);
        } else {
            showMessage('❌ Wpisz numer REGON', regonResult, false);
        }
    });

    regonInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') regonValidateBtn.click();
    });

    nrbValidateBtn.addEventListener('click', () => {
        const nrb = nrbInput.value.trim();
        if (nrb) {
            const result = validateNrb(nrb);
            if (result.isValid) {
                nrbResult.className = 'validator-result valid';
                nrbResult.textContent = '';

                const textNode1 = document.createTextNode('✅ Numer rachunku bankowego jest poprawny!');
                const brNode = document.createElement('br');
                const textNode2 = document.createTextNode(`Bank: ${result.bankName}`);

                nrbResult.appendChild(textNode1);
                nrbResult.appendChild(brNode);
                nrbResult.appendChild(textNode2);
            } else {
                showMessage(result.error, nrbResult, false);
            }
        } else {
            showMessage('❌ Wpisz numer rachunku', nrbResult, false);
        }
    });

    const controlNumber = 98 - parseInt(remainder, 10);
    const expectedChecksum = String(controlNumber).padStart(2, "0");
    const actualChecksum = nrb.substring(0, 2);

    if (expectedChecksum !== actualChecksum)
      return {
        isValid: false,
        message:
          "❌ Numer rachunku jest niepoprawny (błędna suma kontrolna IBAN)",
      };

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

  // ====================================================
  // 8. Event Listeners
  // ====================================================

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
    const nrb = nrbInput.value.trim();
    if (nrb) {
      const result = validateNrb(nrb);
      showMessage(result.message, nrbResult, result.isValid);
    } else {
      showMessage("❌ Wpisz numer rachunku", nrbResult, false);
    }
  });

  nrbInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") nrbValidateBtn.click();
  });

  // Expose for testing
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
