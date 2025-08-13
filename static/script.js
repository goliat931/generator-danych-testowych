document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Zmienne globalne i selektory DOM
    // ----------------------------------------------------
    const generateBtn = document.getElementById('generateBtn');
    const peselOutput = document.getElementById('peselOutput');
    const genderSelect = document.getElementById('gender');
    const birthDateInput = document.getElementById('birthDate');
    const ageInput = document.getElementById('age');
    const copyMessage = document.getElementById('copy-message');	

    // Selektory dla generatora dowodu osobistego
    const generateIdBtn = document.getElementById('generateIdBtn');
    const idOutput = document.getElementById('idOutput');

    // Selektory dla generatora REGON
    const generateRegon9Btn = document.getElementById('generateRegon9Btn');
    const regon9Output = document.getElementById('regon9Output');
    const generateRegon14Btn = document.getElementById('generateRegon14Btn');
    const regon14Output = document.getElementById('regon14Output');

    // Dane do obliczeń PESEL
    const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const encodedMonths = {
        '1800-1899': 80,
        '1900-1999': 0,
        '2000-2099': 20,
        '2100-2199': 40,
        '2200-2299': 60
    };

    // Dane do obliczeń dowodu osobistego
    const letterToNumber = Object.fromEntries(
        Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i])
    );
    const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];

    // Wagi do obliczeń REGON
    const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
    const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

    // ----------------------------------------------------
    // 2. Funkcje pomocnicze
    // ----------------------------------------------------

    /**
     * Wyświetla komunikat w dymku na określony czas.
     * @param {string} text Tekst do wyświetlenia w dymku.
     */
    function showCopyMessage(text) {
        copyMessage.innerText = text;
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 3000);
    }

    // ----------------------------------------------------
    // 3. Logika generatora PESEL
    // ----------------------------------------------------

    /**
     * Koduje miesiąc urodzenia zgodnie z stuleciem dla PESEL.
     * @param {number} year Rok urodzenia.
     * @param {number} month Miesiąc urodzenia (1-12).
     * @returns {string} Dwucyfrowy, zakodowany miesiąc.
     */
    function getEncodedMonth(year, month) {
        if (year >= 1800 && year <= 1899) return String(month + encodedMonths['1800-1899']).padStart(2, '0');
        if (year >= 1900 && year <= 1999) return String(month + encodedMonths['1900-1999']).padStart(2, '0');
        if (year >= 2000 && year <= 2099) return String(month + encodedMonths['2000-2099']).padStart(2, '0');
        if (year >= 2100 && year <= 2199) return String(month + encodedMonths['2100-2199']).padStart(2, '0');
        if (year >= 2200 && year <= 2299) return String(month + encodedMonths['2200-2299']).padStart(2, '0');
        throw new Error("Unsupported year for PESEL generation.");
    }

    /**
     * Oblicza cyfrę kontrolną dla numeru PESEL.
     * @param {string} peselWithoutK 10-cyfrowy numer PESEL bez cyfry kontrolnej.
     * @returns {number} Obliczona cyfra kontrolna.
     */
    function calculatePeselChecksum(peselWithoutK) {
        let checksumSum = 0;
        for (let i = 0; i < 10; i++) {
            checksumSum += parseInt(peselWithoutK[i]) * weightsPesel[i];
        }
        const lastDigitOfSum = checksumSum % 10;
        return lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
    }

    /**
     * Generuje pełny, poprawny numer PESEL.
     * @param {number} year Rok urodzenia.
     * @param {number} month Miesiąc urodzenia.
     * @param {number} day Dzień urodzenia.
     * @param {string} gender Płeć ('male' lub 'female').
     * @returns {string} 11-cyfrowy numer PESEL.
     */
    function generatePesel(year, month, day, gender) {
        const rr = String(year).slice(-2);
        const mm = getEncodedMonth(year, month);
        const dd = String(day).padStart(2, '0');

        const peselWithoutPpppK = `${rr}${mm}${dd}`;
        let pppp;

        if (gender === 'female') {
            const lastDigitOfPppp = [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];
            pppp = String(Math.floor(Math.random() * 1000)).padStart(3, '0') + lastDigitOfPppp;
        } else if (gender === 'male') {
            const lastDigitOfPppp = [1, 3, 5, 7, 9][Math.floor(Math.random() * 5)];
            pppp = String(Math.floor(Math.random() * 1000)).padStart(3, '0') + lastDigitOfPppp;
        } else {
            throw new Error("Invalid gender. Use 'male' or 'female'.");
        }

        const peselWithoutK = `${peselWithoutPpppK}${pppp}`;
        const k = calculatePeselChecksum(peselWithoutK);

        return `${peselWithoutK}${k}`;
    }

    /**
     * Generuje losowy PESEL na start strony.
     */
    function generateRandomPesel() {
        const year = Math.floor(Math.random() * (2025 - 1900) + 1900);
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1; // Uproszczone: zawsze do 28
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        
        try {
            const newPesel = generatePesel(year, month, day, gender);
            peselOutput.innerText = newPesel;
        } catch (error) {
            console.error("Błąd podczas generowania PESEL:", error);
            peselOutput.innerText = "Błąd: " + error.message;
        }
    }

    // ----------------------------------------------------
    // 4. Logika generatora dowodu osobistego i REGON
    // ----------------------------------------------------

    /**
     * Generuje poprawny numer dowodu osobistego.
     * @returns {string} 9-znakowy numer dowodu.
     */
    function generateIdNumber() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';

        let letterPart = '';
        for (let i = 0; i < 3; i++) {
            letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        let digitsPart = '';
        for (let i = 0; i < 6; i++) {
            digitsPart += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        
        let idArrayChars = [
            letterPart[0], letterPart[1], letterPart[2],
            0, // Tymczasowe miejsce dla cyfry kontrolnej
            ...digitsPart.slice(1) // Pozostałe 5 cyfr
        ];

        const numericArray = idArrayChars.map(char =>
            typeof char === 'string' && /[A-Z]/.test(char)
                ? letterToNumber[char]
                : parseInt(char, 10)
        );

        let sum = 0;
        for (let i = 0; i < weightsId.length; i++) {
            sum += numericArray[i] * weightsId[i];
        }

        const controlDigit = sum % 10;
        
        const finalId =
            letterPart +
            controlDigit +
            digitsPart.slice(1);

        return finalId;
    }

    /**
     * Oblicza cyfrę kontrolną dla 9-cyfrowego numeru REGON.
     * @param {string} regon8 Pierwsze 8 cyfr REGON-u.
     * @returns {number} Obliczona cyfra kontrolna.
     */
    function calculateRegon9Checksum(regon8) {
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += parseInt(regon8[i]) * weightsRegon9[i];
        }
        const checksum = sum % 11;
        return checksum === 10 ? 0 : checksum;
    }

    /**
     * Oblicza cyfrę kontrolną dla 14-cyfrowego numeru REGON.
     * @param {string} regon13 Pierwsze 13 cyfr REGON-u.
     * @returns {number} Obliczona cyfra kontrolna.
     */
    function calculateRegon14Checksum(regon13) {
        let sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(regon13[i]) * weightsRegon14[i];
        }
        const checksum = sum % 11;
        return checksum === 10 ? 0 : checksum;
    }

    /**
     * Generuje poprawny 9-cyfrowy numer REGON.
     * @returns {string} 9-cyfrowy numer REGON.
     */
    function generateRegon9() {
        const digits = '0123456789';
        let regon8 = '';
        // 2 cyfry województwa + 6 cyfr numeru seryjnego
        for (let i = 0; i < 8; i++) {
            regon8 += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        const controlDigit = calculateRegon9Checksum(regon8);
        return `${regon8}${controlDigit}`;
    }

    /**
     * Generuje poprawny 14-cyfrowy numer REGON.
     * @returns {string} 14-cyfrowy numer REGON.
     */
    function generateRegon14() {
        const regon9 = generateRegon9();
        const digits = '0123456789';
        let localDigits = '';
        // 4 cyfry numeru lokalnego
        for (let i = 0; i < 4; i++) {
            localDigits += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        const regon13 = `${regon9}${localDigits}`;
        const controlDigit = calculateRegon14Checksum(regon13);
        return `${regon13}${controlDigit}`;
    }

    // ----------------------------------------------------
    // 5. Obsługa zdarzeń (event listeners)
    // ----------------------------------------------------

    // Generuj losowy PESEL i dowód po załadowaniu strony
    generateRandomPesel();
    idOutput.innerText = generateIdNumber();

    // Obsługa kliknięcia przycisku "Generuj PESEL"
	if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        let year, month, day, gender;

        const selectedGender = genderSelect.value;
        const birthDateValue = birthDateInput.value;
        const ageValue = ageInput.value;

        // Ustalanie płci na podstawie wyboru, jeśli nie wybrano "Losowa"
        if (selectedGender === 'random') {
            gender = Math.random() < 0.5 ? 'male' : 'female';
        } else {
            gender = selectedGender;
        }

        // Ustalanie daty urodzenia
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
            // KLUCZOWA POPRAWKA: Jeśli żadne pola nie są wypełnione,
            // generujemy losową datę, ale używamy wybranej płci.
            year = Math.floor(Math.random() * (2025 - 1900) + 1900);
            month = Math.floor(Math.random() * 12) + 1;
            day = Math.floor(Math.random() * 28) + 1;
            
            // W tym przypadku zmienna 'gender' została już poprawnie ustawiona
            // na podstawie wartości `selectedGender`.
        }

        try {
            const newPesel = generatePesel(year, month, day, gender);
            peselOutput.innerText = newPesel;
        } catch (error) {
            console.error("Błąd podczas generowania PESEL:", error);
            peselOutput.innerText = "Błąd: " + error.message;
        }
    });
}

    // Obsługa kliknięcia na pole PESEL (kopiowanie)
    if (peselOutput) {
        peselOutput.addEventListener('click', () => {
            const peselText = peselOutput.innerText;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(peselText)
                    .then(() => showCopyMessage('Numer PESEL skopiowany!'))
                    .catch(err => console.error('Błąd podczas kopiowania:', err));
            } else {
                const tempInput = document.createElement('textarea');
                tempInput.value = peselText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showCopyMessage('Numer PESEL skopiowany!');
            }
        });
    }

    // Obsługa kliknięcia przycisku "Generuj Dowód Osobisty"
    if (generateIdBtn) {
        generateIdBtn.addEventListener('click', () => {
            idOutput.innerText = generateIdNumber();
        });
    }

    // Obsługa kliknięcia na pole Dowodu Osobistego (kopiowanie)
    if (idOutput) {
        idOutput.addEventListener('click', () => {
            const idText = idOutput.innerText;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(idText)
                    .then(() => showCopyMessage('Numer dowodu skopiowany!'))
                    .catch(err => console.error('Błąd podczas kopiowania:', err));
            } else {
                const tempInput = document.createElement('textarea');
                tempInput.value = idText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showCopyMessage('Numer dowodu skopiowany!');
            }
        });
    }

   // Generuj REGON na starcie strony
    regon9Output.innerText = generateRegon9();
    regon14Output.innerText = generateRegon14();

    // Obsługa kliknięcia przycisku "Generuj REGON 9"
    if (generateRegon9Btn) {
        generateRegon9Btn.addEventListener('click', () => {
            regon9Output.innerText = generateRegon9();
        });
    }

    // Obsługa kliknięcia przycisku "Generuj REGON 14"
    if (generateRegon14Btn) {
        generateRegon14Btn.addEventListener('click', () => {
            regon14Output.innerText = generateRegon14();
        });
    }

    // Obsługa kliknięcia na pole REGON (kopiowanie)
    if (regon9Output) {
        regon9Output.addEventListener('click', () => {
            const regonText = regon9Output.innerText;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(regonText)
                    .then(() => showCopyMessage('REGON (9 cyfr) skopiowany!'))
                    .catch(err => console.error('Błąd podczas kopiowania:', err));
            } else {
                // ... (kod dla starszych przeglądarek) ...
                showCopyMessage('REGON (9 cyfr) skopiowany!');
            }
        });
    }

    if (regon14Output) {
        regon14Output.addEventListener('click', () => {
            const regonText = regon14Output.innerText;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(regonText)
                    .then(() => showCopyMessage('REGON (14 cyfr) skopiowany!'))
                    .catch(err => console.error('Błąd podczas kopiowania:', err));
            } else {
                // ... (kod dla starszych przeglądarek) ...
                showCopyMessage('REGON (14 cyfr) skopiowany!');
            }
        });
    }
});