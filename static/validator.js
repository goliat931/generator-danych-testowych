document.addEventListener('DOMContentLoaded', () => {
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
    const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];
    const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
    const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

    const bankCodes = {
        '1010': 'NBP', '1020': 'PKO BP', '1030': 'Bank Handlowy',
        '1050': 'ING Bank Śląski', '1060': 'Bank BPH', '1090': 'Santander Bank Polska',
        '1130': 'Bank Gospodarstwa Krajowego', '1140': 'mBank', '1160': 'Bank Millennium',
        '1240': 'Pekao SA', '1280': 'HSBC', '1320': 'Bank Pocztowy',
        '1540': 'BOŚ Bank', '1580': 'Mercedes-Benz Bank Polska', '1610': 'SGB - Bank',
        '1680': 'Plus Bank', '1840': 'Societe Generale', '1870': 'Nest Bank',
        '1930': 'Bank Polskiej Spółdzielczości', '1940': 'Credit Agricole',
        '2030': 'BNP Paribas', '2120': 'Santander Consumer Bank', '2160': 'Toyota Bank',
        '2190': 'DNB Bank Polska', '2480': 'VeloBank', '2490': 'Alior Bank',
        '2770': 'Volkswagen Bank', '2790': 'Raiffeisen Digital Bank', '2910': 'Aion Bank'
    };

    const encodedMonths = {
        '1800-1899': 80,
        '1900-1999': 0,
        '2000-2099': 20,
        '2100-2199': 40,
        '2200-2299': 60
    };

    // ====================================================
    // 3. Funkcje pomocnicze
    // ====================================================

    function showMessage(text, element, isSuccess = false) {
        element.className = 'validator-result ' + (isSuccess ? 'valid' : 'invalid');
        element.innerHTML = text;
    }

    function showCopyMessage(text) {
        copyMessage.innerText = text;
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 3000);
    }

    // ====================================================
    // 4. Walidacja PESEL
    // ====================================================

    /**
     * Waliduje poprawność numeru PESEL
     * @param {string} pesel Numer PESEL do walidacji
     * @returns {boolean} True jeśli PESEL jest poprawny
     */
    function validatePesel(pesel) {
        // Sprawdzenie długości
        if (!pesel || pesel.length !== 11) {
            showMessage('❌ Numer PESEL musi mieć 11 cyfr', peselResult, false);
            return false;
        }

        // Sprawdzenie czy to tylko cyfry
        if (!/^\d{11}$/.test(pesel)) {
            showMessage('❌ Numer PESEL może zawierać tylko cyfry', peselResult, false);
            return false;
        }

        // Walidacja sumy kontrolnej
        let checksumSum = 0;
        for (let i = 0; i < 10; i++) {
            checksumSum += parseInt(pesel[i]) * weightsPesel[i];
        }
        const lastDigitOfSum = checksumSum % 10;
        const expectedChecksum = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
        const actualChecksum = parseInt(pesel[10]);

        if (expectedChecksum !== actualChecksum) {
            showMessage('❌ Numer PESEL jest niepoprawny (błędna suma kontrolna)', peselResult, false);
            return false;
        }

        // Dodatkowa walidacja daty urodzenia i odczyt danych
        const rr = parseInt(pesel.substring(0, 2));
        const mm = parseInt(pesel.substring(2, 4));
        const dd = parseInt(pesel.substring(4, 6));
        const gender = parseInt(pesel[9]) % 2 === 0 ? 'Kobieta' : 'Mężczyzna';

        // Dekodowanie miesiąca na podstawie stulecia
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

        if (actualMonth < 1 || actualMonth > 12) {
            showMessage('❌ Numer PESEL jest niepoprawny (miesiąc)', peselResult, false);
            return false;
        }

        if (dd < 1 || dd > 31) {
            showMessage('❌ Numer PESEL jest niepoprawny (dzień)', peselResult, false);
            return false;
        }

        // Oblicz wiek
        const birthDate = new Date(year, actualMonth - 1, dd);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Sformatuj datę urodzenia
        const birthDateStr = `${String(dd).padStart(2, '0')}-${String(actualMonth).padStart(2, '0')}-${year}`;

        const message = `✅ Numer PESEL jest poprawny!<br>
            Płeć: ${gender}<br>
            Data urodzenia: ${birthDateStr}<br>
            Wiek: ${age} lat`;

        peselResult.innerHTML = message;
        peselResult.className = 'validator-result valid';
        return true;
    }

    // ====================================================
    // 5. Walidacja Dowodu Osobistego
    // ====================================================

    /**
     * Waliduje poprawność numeru dowodu osobistego
     * @param {string} id Numer dowodu do walidacji
     * @returns {boolean} True jeśli dowód jest poprawny
     */
    function validateId(id) {
        // Sprawdzenie długości
        if (!id || id.length !== 9) {
            showMessage('❌ Numer dowodu musi mieć 9 znaków', idResult, false);
            return false;
        }

        // Sprawdzenie formatu: 3 litery + cyfra + 5 cyfr
        if (!/^[A-Z]{3}\d{6}$/.test(id)) {
            showMessage('❌ Format dowodu powinien być: 3 litery + 6 cyfr', idResult, false);
            return false;
        }

        // Obliczenie sumy kontrolnej - WAŻNE: obliczamy dla ABC0DEFGH (z zerem na 4 pozycji)
        const idWithoutChecksum = id.substring(0, 3) + '0' + id.substring(4, 9);
        
        const numericArray = idWithoutChecksum.split('').map((char) => {
            if (/[A-Z]/.test(char)) {
                return letterToNumber[char];
            } else {
                return parseInt(char, 10);
            }
        });

        let sum = 0;
        for (let i = 0; i < weightsId.length; i++) {
            sum += numericArray[i] * weightsId[i];
        }

        const expectedChecksum = sum % 10;
        const actualChecksum = parseInt(id[3]);

        if (expectedChecksum !== actualChecksum) {
            showMessage('❌ Numer dowodu jest niepoprawny (błędna suma kontrolna)', idResult, false);
            return false;
        }

        showMessage('✅ Numer dowodu osobistego jest poprawny!', idResult, true);
        return true;
    }

    // ====================================================
    // 6. Walidacja REGON
    // ====================================================

    /**
     * Waliduje poprawność 9-cyfrowego REGON-u
     * @param {string} regon9 Numer REGON
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
     * Waliduje poprawność 14-cyfrowego REGON-u
     * @param {string} regon14 Numer REGON
     * @returns {boolean}
     */
    function validateRegon14(regon14) {
        if (regon14.length !== 14) return false;

        // Waliduj pierwszych 9 cyfr
        if (!validateRegon9(regon14.substring(0, 9))) return false;

        // Waliduj ostatnich 5 cyfr
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
     * Waliduje REGON
     * @param {string} regon Numer REGON do walidacji
     * @returns {boolean}
     */
    function validateRegon(regon) {
        // Usunięcie spacji
        regon = regon.replace(/\s/g, '');

        // Sprawdzenie czy to tylko cyfry
        if (!/^\d+$/.test(regon)) {
            showMessage('❌ Numer REGON może zawierać tylko cyfry', regonResult, false);
            return false;
        }

        // Walidacja długości i sumy kontrolnej
        if (regon.length === 9) {
            if (validateRegon9(regon)) {
                showMessage('✅ Numer REGON (9 cyfr) jest poprawny!', regonResult, true);
                return true;
            } else {
                showMessage('❌ Numer REGON jest niepoprawny (błędna suma kontrolna)', regonResult, false);
                return false;
            }
        } else if (regon.length === 14) {
            if (validateRegon14(regon)) {
                showMessage('✅ Numer REGON (14 cyfr) jest poprawny!', regonResult, true);
                return true;
            } else {
                showMessage('❌ Numer REGON jest niepoprawny (błędna suma kontrolna)', regonResult, false);
                return false;
            }
        } else {
            showMessage('❌ Numer REGON musi mieć 9 lub 14 cyfr', regonResult, false);
            return false;
        }
    }

    // ====================================================
    // 7. Walidacja Rachunku Bankowego (NRB)
    // ====================================================

    /**
     * Waliduje poprawność numeru rachunku bankowego
     * @param {string} nrb Numer rachunku do walidacji
     * @returns {boolean}
     */
    function validateNrb(nrb) {
        // Usunięcie spacji i prefiksu PL
        nrb = nrb.replace(/\s/g, '').toUpperCase();
        if (nrb.startsWith('PL')) {
            nrb = nrb.substring(2);
        }

        // Sprawdzenie długości
        if (nrb.length !== 26) {
            showMessage('❌ Numer rachunku musi mieć 26 cyfr', nrbResult, false);
            return false;
        }

        // Sprawdzenie czy to tylko cyfry
        if (!/^\d{26}$/.test(nrb)) {
            showMessage('❌ Numer rachunku może zawierać tylko cyfry (poza PL)', nrbResult, false);
            return false;
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
            showMessage('❌ Numer rachunku jest niepoprawny (błędna suma kontrolna IBAN)', nrbResult, false);
            return false;
        }

        // Odczyt nazwy banku (pozycje 2-9)
        const bankCode = nrb.substring(2, 10);
        const firstFourDigits = bankCode.substring(0, 4);
        let bankName = 'Nieznany bank';

        // Szukaj kodu banku w tabeli
        if (bankCodes[firstFourDigits]) {
            bankName = bankCodes[firstFourDigits];
        }

        const message = `✅ Numer rachunku bankowego jest poprawny!<br>
            Bank: ${bankName}`;

        nrbResult.innerHTML = message;
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
            validateNrb(nrb);
        } else {
            showMessage('❌ Wpisz numer rachunku', nrbResult, false);
        }
    });

    nrbInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') nrbValidateBtn.click();
    });

});
