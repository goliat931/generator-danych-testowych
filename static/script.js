	document.addEventListener('DOMContentLoaded', () => {
		// ====================================================
		// 1. Zmienne globalne i selektory DOM
		// ====================================================

		// Nowe selektory dla modalu PESEL
		const peselOutput = document.getElementById('peselOutput');
		const openPeselOptionsBtn = document.getElementById('openPeselOptionsBtn');
		const generateBtn = document.getElementById('generateBtn');
		const peselOptionsModal = document.getElementById('peselOptionsModal');
		const closeBtn = peselOptionsModal.querySelector('.close-btn');

		// Selektory dla pól wewnątrz modalu PESEL
		const genderSelect = document.getElementById('gender');
		const birthDateInput = document.getElementById('birthDate');
		const ageInput = document.getElementById('age');

		// Elementy dla generatora dowodu osobistego
		const generateIdBtn = document.getElementById('generateIdBtn');
		const idOutput = document.getElementById('idOutput');

		// Elementy dla generatora REGON
		const generateRegon9Btn = document.getElementById('generateRegon9Btn');
		const regon9Output = document.getElementById('regon9Output');
		const generateRegon14Btn = document.getElementById('generateRegon14Btn');
		const regon14Output = document.getElementById('regon14Output');

		// Elementy dla generatora rachunku bankowego
		const generateNrbBtn = document.getElementById('generateNrbBtn');
		const nrbOutput = document.getElementById('nrbOutput');
		const bankCodeSelect = document.getElementById('bankCode');
		const nrbFormatSelect = document.getElementById('nrbFormat');
		const ibanPrefixSelect = document.getElementById('ibanPrefix');

		// Komunikat o skopiowaniu
		const copyMessage = document.getElementById('copy-message');

		// Stałe do obliczeń PESEL
		const weightsPesel = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
		const encodedMonths = {
			'1800-1899': 80,
			'1900-1999': 0,
			'2000-2099': 20,
			'2100-2199': 40,
			'2200-2299': 60
		};

		// Stałe do obliczeń dowodu osobistego
		const letterToNumber = Object.fromEntries(
			Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 10 + i])
		);
		const weightsId = [7, 3, 1, 9, 7, 3, 1, 7, 3];

		// Stałe do obliczeń REGON
		const weightsRegon9 = [8, 9, 2, 3, 4, 5, 6, 7];
		const weightsRegon14 = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
		
		// Lista kodów banków
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

		// ====================================================
		// 2. Funkcje pomocnicze
		// ====================================================

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

		// ====================================================
		// 3. Logika generatora PESEL
		// ====================================================

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
		 * Generuje numer PESEL
		 * @param {number} year Rok urodzenia
		 * @param {number} month Miesiąc urodzenia
		 * @param {number} day Dzień urodzenia
		 * @param {string} gender Płeć ('male' lub 'female')
		 * @returns {string} Poprawny PESEL
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
		 * Generuje losowy PESEL na starcie strony.
		 */
		function generateRandomPesel() {
			const year = Math.floor(Math.random() * (2025 - 1900) + 1900);
			const month = Math.floor(Math.random() * 12) + 1;
			const day = Math.floor(Math.random() * 28) + 1;
			const gender = Math.random() < 0.5 ? 'male' : 'female';
			
			try {
				const newPesel = generatePesel(year, month, day, gender);
				peselOutput.innerText = newPesel;
			} catch (error) {
				console.error("Błąd podczas generowania PESEL:", error);
				peselOutput.innerText = "Błąd: " + error.message;
			}
		}

		// ====================================================
		// 4. Logika generatora dowodu osobistego
		// ====================================================

		/**
		 * Oblicza cyfrę kontrolną dla dowodu osobistego.
		 * @param {string} fullNumber 8-znakowy numer dowodu (3 litery, 5 cyfr).
		 * @returns {number} Obliczona cyfra kontrolna.
		 */
		function calculateIdChecksum(fullNumber) {
			const numericArray = fullNumber.split('').map(char =>
				typeof char === 'string' && /[A-Z]/.test(char)
					? letterToNumber[char]
					: parseInt(char, 10)
			);

			let sum = 0;
			for (let i = 0; i < weightsId.length; i++) {
				sum += numericArray[i] * weightsId[i];
			}
			return sum % 10;
		}

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
				0,
				...digitsPart.slice(1)
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

		// ====================================================
		// 5. Logika generatora REGON
		// ====================================================

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
			for (let i = 0; i < 4; i++) {
				localDigits += digits.charAt(Math.floor(Math.random() * digits.length));
			}
			const regon13 = `${regon9}${localDigits}`;
			const controlDigit = calculateRegon14Checksum(regon13);
			return `${regon13}${controlDigit}`;
		}

		// ====================================================
		// 6. Logika generatora rachunku bankowego (NRB/IBAN)
		// ====================================================

		// Zastąpienie twardo zakodowanej zmiennej
		// Pobieranie danych banków z pliku plewibnra.txt
		fetch('static/plewibnra.txt')
			.then(response => {
				// Sprawdź, czy odpowiedź jest poprawna
				if (!response.ok) {
					throw new Error('Nie udało się pobrać pliku z danymi banków.');
				}
				return response.text(); // Zwróć zawartość pliku jako tekst
			})
			.then(plewibnraContent => {
				// Tutaj umieść kod, który używa danych plewibnraContent
				// do tworzenia opcji w Twoim selektorze <select id="bankCode">
				console.log("Dane banków zostały pomyślnie pobrane.");
				console.log(plewibnraContent.substring(0, 50) + "..."); // Przykładowe użycie
				
				// Poniżej Twój kod, który przetwarza ten tekst i tworzy z niego opcje <option>
		function parsePlewiNrbCodes(fileContent) {
			const lines = fileContent.split('\n');
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
        // Definicje funkcji i zmiennych zależących od pliku
		const validNrbCodes = parsePlewiNrbCodes(plewibnraContent);

		function calculateNrbChecksum(bban) {
			const countryCode = '2521'; 
			const numberToCheck = bban + countryCode + '00';
			
			let remainder = '';
			let block;
			for (let i = 0; i < numberToCheck.length; i += 7) {
				block = remainder + numberToCheck.substring(i, i + 7);
				remainder = (parseInt(block, 10) % 97).toString();
			}
			const controlNumber = 98 - parseInt(remainder, 10);
			return String(controlNumber).padStart(2, '0');
		}

		function generateNrb(selectedBankCode, format, prefix) {
			let bankAndBranchCode;
			const digits = '0123456789';

			if (selectedBankCode === 'random') {
				if (validNrbCodes.length === 0) {
					return "Brak poprawnych kodów do wygenerowania. Sprawdź plik.";
				}
				bankAndBranchCode = validNrbCodes[Math.floor(Math.random() * validNrbCodes.length)];
			} else {
				const filteredCodes = validNrbCodes.filter(code => code.startsWith(selectedBankCode));
				if (filteredCodes.length === 0) {
					return "Brak poprawnych kodów dla wybranego banku.";
				}
				bankAndBranchCode = filteredCodes[Math.floor(Math.random() * filteredCodes.length)];
			}

			let customerNumber = '';
			for (let i = 0; i < 16; i++) {
				customerNumber += digits.charAt(Math.floor(Math.random() * digits.length));
			}
			
			const fullNumberWithoutChecksum = bankAndBranchCode + customerNumber;
			const checksum = calculateNrbChecksum(fullNumberWithoutChecksum);
			let finalNrb = `${checksum}${fullNumberWithoutChecksum}`;

			if (format === 'spaced') {
				finalNrb = `${finalNrb.substring(0, 2)} ${finalNrb.substring(2, 6)} ${finalNrb.substring(6, 10)} ${finalNrb.substring(10, 14)} ${finalNrb.substring(14, 18)} ${finalNrb.substring(18, 22)} ${finalNrb.substring(22, 26)}`;
			}

			if (prefix === 'with-prefix') {
				if (format === 'spaced') {
					finalNrb = `PL ${finalNrb}`;
				} else {
					finalNrb = `PL${finalNrb}`;
				}
			}
			return finalNrb;
		}




            // Generowanie danych na starcie strony PRZENIESIONE DO TEGO BLOKU
            nrbOutput.innerText = generateNrb(bankCodeSelect.value, nrbFormatSelect.value, ibanPrefixSelect.value);

            // Obsługa kliknięcia przycisku "Generuj Rachunek" PRZENIESIONE DO TEGO BLOKU
            if (generateNrbBtn) {
                generateNrbBtn.addEventListener('click', () => {
                    const selectedBankCode = bankCodeSelect.value;
                    const selectedFormat = nrbFormatSelect.value;
                    const selectedPrefix = ibanPrefixSelect.value;
                    nrbOutput.innerText = generateNrb(selectedBankCode, selectedFormat, selectedPrefix);
                });
            }

		// ====================================================
		// 7. Obsługa zdarzeń (event listeners)
		// ====================================================

		// Generuj dane na starcie strony
		generateRandomPesel();
		idOutput.innerText = generateIdNumber();
		regon9Output.innerText = generateRegon9();
		regon14Output.innerText = generateRegon14();
		nrbOutput.innerText = generateNrb(bankCodeSelect.value, nrbFormatSelect.value, ibanPrefixSelect.value);

		// Obsługa kliknięcia przycisku "Ustawienia" (PESEL)
		if (openPeselOptionsBtn) {
			openPeselOptionsBtn.addEventListener('click', () => {
				peselOptionsModal.style.display = 'block';
			});
		}

		// Obsługa zamykania modalu
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				peselOptionsModal.style.display = 'none';
			});
		}

		window.addEventListener('click', (event) => {
			if (event.target == peselOptionsModal) {
				peselOptionsModal.style.display = 'none';
			}
		});

		// KLUCZOWA ZMIANA: Obsługa przycisku "Generuj PESEL" na kafelku
		// Teraz generuje PESEL z domyślnymi lub ostatnio użytymi ustawieniami
		if (generateBtn) {
			generateBtn.addEventListener('click', () => {
				let year, month, day, gender;

				const selectedGender = genderSelect.value;
				const birthDateValue = birthDateInput.value;
				const ageValue = ageInput.value;

				if (selectedGender === 'random') {
					gender = Math.random() < 0.5 ? 'male' : 'female';
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
					showCopyMessage('Numer dowodu skopiowany!');
				}
			});
		}

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
					showCopyMessage('REGON (14 cyfr) skopiowany!');
				}
			});
		}

		// Obsługa kliknięcia przycisku "Generuj Rachunek"
		if (generateNrbBtn) {
			generateNrbBtn.addEventListener('click', () => {
				const selectedBankCode = bankCodeSelect.value;
				const selectedFormat = nrbFormatSelect.value;
				const selectedPrefix = ibanPrefixSelect.value;
				nrbOutput.innerText = generateNrb(selectedBankCode, selectedFormat, selectedPrefix);
			});
		}

            // Obsługa kliknięcia na pole Rachunku Bankowego (kopiowanie) PRZENIESIONE DO TEGO BLOKU
            if (nrbOutput) {
                nrbOutput.addEventListener('click', () => {
                    const nrbText = nrbOutput.innerText;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(nrbText)
                            .then(() => showCopyMessage('Numer rachunku skopiowany!'))
                            .catch(err => console.error('Błąd podczas kopiowania:', err));
                    } else {
                        showCopyMessage('Numer rachunku skopiowany!');
                    }
                });
            }

        })
        .catch(error => {
            console.error('Wystąpił błąd podczas ładowania danych banków:', error);
            nrbOutput.innerText = 'Błąd ładowania danych banków.';
        });
	});