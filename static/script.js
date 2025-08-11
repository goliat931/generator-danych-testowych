document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const peselOutput = document.getElementById('peselOutput');
    const genderSelect = document.getElementById('gender');
    const birthDateInput = document.getElementById('birthDate');
    const ageInput = document.getElementById('age');

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const encodedMonths = {
        '1800-1899': 80,
        '1900-1999': 0,
        '2000-2099': 20,
        '2100-2199': 40,
        '2200-2299': 60
    };

    function getEncodedMonth(year, month) {
        if (year >= 1800 && year <= 1899) return String(month + encodedMonths['1800-1899']).padStart(2, '0');
        if (year >= 1900 && year <= 1999) return String(month + encodedMonths['1900-1999']).padStart(2, '0');
        if (year >= 2000 && year <= 2099) return String(month + encodedMonths['2000-2099']).padStart(2, '0');
        if (year >= 2100 && year <= 2199) return String(month + encodedMonths['2100-2199']).padStart(2, '0');
        if (year >= 2200 && year <= 2299) return String(month + encodedMonths['2200-2299']).padStart(2, '0');
        throw new Error("Unsupported year for PESEL generation.");
    }

    function calculateChecksum(peselWithoutK) {
        let checksumSum = 0;
        for (let i = 0; i < 10; i++) {
            checksumSum += parseInt(peselWithoutK[i]) * weights[i];
        }
        const lastDigitOfSum = checksumSum % 10;
        return lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
    }

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
        const k = calculateChecksum(peselWithoutK);

        return `${peselWithoutK}${k}`;
    }

    if (generateBtn && peselOutput) {
        generateBtn.addEventListener('click', () => {
            let year, month, day, gender;

            const selectedGender = genderSelect.value;
            const birthDateValue = birthDateInput.value;
            const ageValue = ageInput.value;

            // Ustalanie płci
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
                // Generowanie losowej daty
                year = Math.floor(Math.random() * (2025 - 1900) + 1900);
                month = Math.floor(Math.random() * 12) + 1;
                day = Math.floor(Math.random() * 28) + 1;
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
});