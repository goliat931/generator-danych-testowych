document.addEventListener('DOMContentLoaded', () => {
	// ====================================================
	// 1. Inicjalizacja trybu ciemnego
	// ====================================================
	function initTheme() {
		const themeToggle = document.getElementById('themeToggle');
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

		if (currentTheme === 'dark') {
			document.documentElement.setAttribute('data-theme', 'dark');
			if (themeToggle) themeToggle.checked = true;
		} else {
			document.documentElement.setAttribute('data-theme', 'light');
			if (themeToggle) themeToggle.checked = false;
		}

		if (themeToggle) {
			themeToggle.addEventListener('change', () => {
				const newTheme = themeToggle.checked ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme', newTheme);
				localStorage.setItem('theme', newTheme);
			});
		}
	}

	initTheme();

	// ====================================================
	// 2. Zmienne globalne
	// ====================================================
	let bankCodes = {};
	let maleNames = [];
	let femaleNames = [];
	let surnames = [];

	// Załaduj dane
	Promise.all([
		fetch('static/bank_codes.json').then(r => r.json()),
		fetch('static/pl_male_names.json').then(r => r.json()),
		fetch('static/pl_female_names.json').then(r => r.json()),
		fetch('static/pl_male_surnames.json').then(r => r.json()),
		fetch('static/pl_female_surnames.json').then(r => r.json())
	]).then(([codes, mNames, fNames, mSurnames, fSurnames]) => {
		bankCodes = codes;
		maleNames = mNames;
		femaleNames = fNames;
		surnames = [...new Set([...mSurnames, ...fSurnames])];
		console.log('Załadowano wszystkie dane');
	}).catch(err => console.error('Błąd załadowania danych:', err));

	// ====================================================
	// 4. Funkcje generujące
	// ====================================================

	function generatePesel(year, month, day, gender) {
		const peselMonth = gender === 'F' ? month + 20 : month;
		const peselDate = [
			String(year).slice(-2).padStart(2, '0'),
			String(peselMonth).padStart(2, '0'),
			String(day).padStart(2, '0'),
			String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
			String(Math.floor(Math.random() * 10)).padStart(1, '0')
		].join('');

		const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
		let sum = 0;
		for (let i = 0; i < 10; i++) sum += parseInt(peselDate[i]) * weights[i];
		const checksum = (10 - (sum % 10)) % 10;

		return peselDate + checksum;
	}

	function generateRandomPesel() {
		const year = Math.floor(Math.random() * 100);
		const month = Math.floor(Math.random() * 12) + 1;
		const maxDay = new Date(year === 0 ? 2000 : 1900 + year, month, 0).getDate();
		const day = Math.floor(Math.random() * maxDay) + 1;
		const gender = Math.random() > 0.5 ? 'M' : 'F';
		return generatePesel(year, month, day, gender);
	}

	function generateIdNumber() {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const idPrefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
		const idNumber = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

		const fullId = idPrefix + idNumber;
		const weights = [7, 3, 1, 7, 3, 1, 7, 3];
		let sum = 0;

		for (let i = 0; i < 8; i++) {
			const value = fullId.charCodeAt(i) - 55;
			sum += value * weights[i];
		}

		const checksum = sum % 10;
		return fullId + checksum;
	}

	function generateRegon(type) {
		if (type === 9) {
			const regon = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
			const weights = [8, 9, 2, 3, 4, 5, 6, 7];
			let sum = 0;
			for (let i = 0; i < 8; i++) sum += parseInt(regon[i]) * weights[i];
			const checksum = (11 - (sum % 11)) % 10;
			return regon + checksum;
		} else {
			const regon = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
			const weights = [8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4];
			let sum = 0;
			for (let i = 0; i < 13; i++) sum += parseInt(regon[i]) * weights[i];
			const checksum = (11 - (sum % 11)) % 10;
			return regon + checksum;
		}
	}

	function generateNrb() {
		const bankCode = Object.keys(bankCodes)[Math.floor(Math.random() * Object.keys(bankCodes).length)];
		const accountNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');

		let iban = '21' + bankCode + accountNumber;
		const rearranged = iban.slice(4) + iban.slice(0, 4);
		const digits = rearranged.split('').map(char => {
			const code = char.charCodeAt(0);
			return code >= 65 ? (code - 55).toString() : char;
		}).join('');

		const checksum = (98n - (BigInt(digits) % 97n)).toString().padStart(2, '0');
		return checksum + bankCode + accountNumber;
	}

	function getRandomName() {
		return Math.random() > 0.5 ? getRandomMaleName() : getRandomFemaleName();
	}

	function getRandomSurname() {
		if (surnames.length > 0) {
			return surnames[Math.floor(Math.random() * surnames.length)];
		}
		// Fallback na Faker jeśli nazwiska JSON się nie załadowały
		try {
			return faker.person?.lastName() || 'Nowak';
		} catch {
			return 'Nowak';
		}
	}

	function getRandomMaleName() {
		if (maleNames.length > 0) {
			return maleNames[Math.floor(Math.random() * maleNames.length)];
		}
		// Fallback na Faker jeśli nazwy JSON się nie załadowały
		try {
			return faker.person?.firstName('male') || 'Jan';
		} catch {
			return 'Jan';
		}
	}

	function getRandomFemaleName() {
		if (femaleNames.length > 0) {
			return femaleNames[Math.floor(Math.random() * femaleNames.length)];
		}
		// Fallback na Faker jeśli nazwy JSON się nie załadowały
		try {
			return faker.person?.firstName('female') || 'Maria';
		} catch {
			return 'Maria';
		}
	}

	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function randomHex(length) {
		const chars = '0123456789abcdef';
		return Array.from({ length }, () => chars[randomInt(0, chars.length - 1)]).join('');
	}

	function formatDateYMD(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
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

		const yearTwoDigits = String(year % 100).padStart(2, '0');
		const monthTwoDigits = String(month).padStart(2, '0');
		const dayTwoDigits = String(day).padStart(2, '0');

		const serial = String(randomInt(0, 9999)).padStart(4, '0');
		const genderDigit = sex === 'M' ? (randomInt(0, 4) * 2 + 1) : (randomInt(0, 4) * 2);
		const base = `${yearTwoDigits}${monthTwoDigits}${dayTwoDigits}${serial}${genderDigit}`;

		const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
		let sum = 0;
		for (let i = 0; i < 10; i++) sum += parseInt(base[i], 10) * weights[i];
		const checksum = (10 - (sum % 10)) % 10;

		return base + checksum;
	}

	function generatePolishPostalCode() {
		const part1 = String(randomInt(0, 99)).padStart(2, '0');
		const part2 = String(randomInt(0, 999)).padStart(3, '0');
		return `${part1}-${part2}`;
	}

	const polishCities = [
		'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
		'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Toruń', 'Kielce',
		'Rzeszów', 'Olsztyn', 'Zielona Góra', 'Opole', 'Bielsko-Biała'
	];

	function getRandomCity() {
		// Kombinuj z polskimi miastami dla większej realistyczności
		if (Math.random() > 0.4) {
			return polishCities[Math.floor(Math.random() * polishCities.length)];
		}
		// Fallback na polskie miasta jeśli Faker nie będzie dostępny
		try {
			return faker.location.city ? faker.location.city() : polishCities[Math.floor(Math.random() * polishCities.length)];
		} catch {
			return polishCities[Math.floor(Math.random() * polishCities.length)];
		}
	}

	const streetNames = [
		'Kwiatowa', 'Słoneczna', 'Wiosenna', 'Szkolna', 'Leśna', 'Polna', 'Słoneczna', 'Lipowa',
		'Grunwaldzka', 'Kościuszki', 'Słowackiego', 'Pionierów', 'Rozwoju', 'Mickiewicza', 'Krótka'
	];

	function getRandomStreetName() {
		// Kombinuj z polskimi ulicami dla realistyczności
		if (Math.random() > 0.4) {
			const name = streetNames[Math.floor(Math.random() * streetNames.length)];
			const prefix = Math.random() > 0.5 ? 'ul.' : '';
			return `${prefix} ${name}`.trim();
		}
		// Fallback na polskie ulice jeśli Faker nie będzie dostępny
		try {
			const fakerStreet = faker.location.streetName ? faker.location.streetName() : streetNames[Math.floor(Math.random() * streetNames.length)];
			const prefix = Math.random() > 0.5 ? 'ul.' : '';
			return `${prefix} ${fakerStreet}`.trim();
		} catch {
			const name = streetNames[Math.floor(Math.random() * streetNames.length)];
			const prefix = Math.random() > 0.5 ? 'ul.' : '';
			return `${prefix} ${name}`.trim();
		}
	}

	function generatePhoneNumber() {
		// Generuj numer telefoniczny w formacie polskim
		const prefix = randomInt(500, 899);
		const rest = String(randomInt(0, 999999)).padStart(6, '0');
		return `${prefix}${rest}`;
	}

	const mailDomains = ['wp.pl', 'onet.pl', 'o2.pl', 'interia.pl', 'gazeta.pl', 'tlen.pl'];

	function generateEmail(first, last) {
		// Użyj Faker do generowania emaila, ale z polskimi domenami
		const localPart = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		const domain = mailDomains[randomInt(0, mailDomains.length - 1)];
		const randomSuffix = randomInt(0, 999);
		return `${localPart}${randomSuffix}@${domain}`;
	}

	function generateToken() {
		const now = new Date();
		const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
		return `token${datePart}${randomHex(8)}`;
	}

	function generateSeasonString() {
		const month = new Date().getMonth() + 1;
		if (month >= 3 && month <= 5) return 'Wiosna';
		if (month >= 6 && month <= 8) return 'Lato';
		if (month >= 9 && month <= 11) return 'Jesień';
		return 'Zima';
	}

	function generateComment() {
		const polishSentences = [
			'Dane testowe wygenerowane automatycznie.',
			'Proszę nie używać w produkcji.',
			'Służy wyłącznie do celów testowania.',
			'Przykładowy komentarz systemowy.',
			'Wygenerowano dnia ' + new Date().toLocaleDateString('pl-PL') + '.'
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
				return digits.join('') + check;
			}
		}
	}

	function generateCompanyName() {
		// Generuj nazwę firmy z polskiego słownika + sufiksy
		const name = getRandomSurname();
		const suffixes = ['Sp. z o.o.', 'S.A.', 'Sp. k.', 'Sp. j.', 'Fundacja', 'Stowarzyszenie'];
		const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
		return `${name} ${suffix}`;
	}

	// ====================================================
	// 4. Toggle separator section
	// ====================================================
	document.querySelectorAll('input[name="export-format"]').forEach(radio => {
		radio.addEventListener('change', () => {
			const separatorSection = document.getElementById('separatorFieldWrapper');
			separatorSection.style.display = radio.value === 'csv' ? 'flex' : 'none';
		});
	});

	// ====================================================
	// 5. Drag & Drop (zmiana kolejności)
	// ====================================================
	let draggedElement = null;

	document.querySelectorAll('.draggable-item').forEach(item => {
		item.setAttribute('draggable', 'true');
		
		item.addEventListener('dragstart', function() {
			draggedElement = this;
			this.style.opacity = '0.5';
		});

		item.addEventListener('dragend', function() {
			this.style.opacity = '1';
			// Usuń visual feedback ze wszystkich elementów
			document.querySelectorAll('.draggable-item').forEach(el => {
				el.classList.remove('drag-over');
			});
		});

		item.addEventListener('dragover', function(e) {
			e.preventDefault();
			if (draggedElement !== this) {
				this.classList.add('drag-over');
			}
		});

		item.addEventListener('dragleave', function() {
			this.classList.remove('drag-over');
		});

		item.addEventListener('drop', function(e) {
			e.preventDefault();
			this.classList.remove('drag-over');
			if (draggedElement !== this) {
				const parent = this.parentElement;
				const allItems = [...parent.querySelectorAll('.draggable-item')];
				const draggedIndex = allItems.indexOf(draggedElement);
				const targetIndex = allItems.indexOf(this);

				if (draggedIndex < targetIndex) {
					this.parentElement.insertBefore(draggedElement, this.nextSibling);
				} else {
					this.parentElement.insertBefore(draggedElement, this);
				}
			}
		});
	});

	// ====================================================
	// 6. Generowanie i export (oddzielnie)
	// ====================================================
	let generatedData = null;
	let generatedFields = null;
	let generatedContent = null;
	let generatedFilename = null;
	let generatedMimeType = null;

	document.getElementById('generateDatasetBtn').addEventListener('click', () => {
		const recordCount = Math.min(parseInt(document.getElementById('recordCount').value) || 10, 100000);
		const format = document.querySelector('input[name="export-format"]:checked').value;
		let separator = document.querySelector('input[name="csv-separator"]:checked')?.value || ',';
		
		// Zamień "tab" na faktyczną tabulację
		if (separator === 'tab') {
			separator = '\t';
		}

		// Pobierz zaznaczone pola w kolejności
		const fields = [];
		document.querySelectorAll('.draggable-item input[type="checkbox"]:checked').forEach(checkbox => {
			fields.push(checkbox.value);
		});

		if (fields.length === 0) {
			alert('Zaznacz przynajmniej jedno pole!');
			return;
		}

		// Generuj dane
		const data = [];
		for (let i = 0; i < recordCount; i++) {
			const record = {};

			// Podstawowe wartości używane w wielu polach
			const sex = 'M';
			const birthdate = randomDateBetween(new Date(1950, 0, 1), new Date(2002, 11, 31));
			const pesel = generatePeselFromDate(birthdate, sex);
			const firstNameMale = getRandomMaleName();
			const firstNameFemale = getRandomFemaleName();
			const surname = getRandomSurname();
			const idNumber = generateIdNumber();
			const nrb = generateNrb();
			const bankAccount = nrb;
			const companyName = generateCompanyName();
			const nip = generateNip();

			fields.forEach(field => {
				switch(field) {
					case 'pesel':
						record.pesel = pesel;
						break;
					case 'id':
						record.id = idNumber;
						break;
					case 'regon':
						record.regon = generateRegon(Math.random() > 0.5 ? 9 : 14);
						break;
					case 'firstName':
						record.firstName = firstNameMale;
						break;
					case 'surname':
						record.surname = surname;
						break;
					case 'imie':
						record.imie = firstNameMale;
						break;
					case 'nazwa':
						record.nazwa = surname;
						break;
					case 'imie_ojca':
						record.imie_ojca = firstNameMale;
						break;
					case 'imie_matki':
						record.imie_matki = firstNameFemale;
						break;
					case 'sex':
						record.sex = sex;
						break;
					case 'citizenship':
						record.citizenship = 'POL';
						break;
					case 'birthdate':
						record.birthdate = formatDateYMD(birthdate);
						break;
					case 'birthCountry':
						record.birthCountry = 'POL';
						break;
					case 'birthcity':
						record.birthcity = getRandomCity();
						break;
					case 'document_type':
						record.document_type = 'DOWOD_OSOBISTY';
						break;
					case 'dok_tozs':
						record.dok_tozs = idNumber;
						break;
					case 'dok_expirydate': {
						const expiry = randomDateBetween(new Date(), new Date(new Date().getFullYear() + 10, 11, 31));
						record.dok_expirydate = formatDateYMD(expiry);
						break;
					}
					case 'ulica':
						record.ulica = getRandomStreetName();
						break;
					case 'nr_domu':
						record.nr_domu = String(randomInt(1, 999));
						break;
					case 'nr_lokalu':
						record.nr_lokalu = String(randomInt(1, 999));
						break;
					case 'kod_pocztowy':
						record.kod_pocztowy = generatePolishPostalCode();
						break;
					case 'miasto':
						record.miasto = getRandomCity();
						break;
					case 'kraj':
						record.kraj = 'POL';
						break;
					case 'telk':
						record.telk = generatePhoneNumber();
						break;
					case 'teld':
						record.teld = generatePhoneNumber();
						break;
					case 'mail':
						record.mail = generateEmail(firstNameMale, surname);
						break;
					case 'bankaccount':
						record.bankaccount = bankAccount;
						break;
					case 'comment':
						record.comment = generateComment();
						break;
					case 'season_string':
						record.season_string = generateSeasonString();
						break;
					case 'token':
						record.token = generateToken();
						break;
					case 'alnova_pid':
						record.alnova_pid = String(randomInt(10000000, 99999999));
						break;
					case 'nip':
						record.nip = nip;
						break;
					case 'companyname':
						record.companyname = companyName;
						break;
					default:
						record[field] = '';
				}
			});
			data.push(record);
		}

		// Przygotuj export
		let content, filename, mimeType;

		if (format === 'csv') {
			content = generateCsv(data, fields, separator);
			filename = 'dane_testowe.csv';
			mimeType = 'text/csv;charset=utf-8;';
		} else if (format === 'json') {
			content = JSON.stringify(data, null, 2);
			filename = 'dane_testowe.json';
			mimeType = 'application/json;charset=utf-8;';
		} else if (format === 'xml') {
			content = generateXml(data, fields);
			filename = 'dane_testowe.xml';
			mimeType = 'application/xml;charset=utf-8;';
		}

		// Przechowaj dane do pobrania
		generatedData = data;
		generatedFields = fields;
		generatedContent = content;
		generatedFilename = filename;
		generatedMimeType = mimeType;

		// Pokaż podgląd
		showPreview(data, fields, format, separator);

		// Aktywuj przycisk pobierania
		document.getElementById('downloadDatasetBtn').disabled = false;
	});

	// Przycisk pobierania
	document.getElementById('downloadDatasetBtn').addEventListener('click', () => {
		if (generatedContent && generatedFilename && generatedMimeType) {
			downloadFile(generatedContent, generatedFilename, generatedMimeType);
		}
	});

	// ====================================================
	// 7. Generowanie CSV
	// ====================================================
	function generateCsv(data, fields, separator) {
		const header = fields.join(separator);
		const rows = data.map(record => 
			fields.map(field => {
				const value = record[field];
				// Escape wartości zawierające separator, cudzysłowy lub nowe linie
				if (typeof value === 'string' && (value.includes(separator) || value.includes('"') || value.includes('\n'))) {
					return '"' + value.replace(/"/g, '""') + '"';
				}
				return value;
			}).join(separator)
		);
		return [header, ...rows].join('\n');
	}

	// ====================================================
	// 8. Generowanie XML
	// ====================================================
	function generateXml(data, fields) {
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
		data.forEach(record => {
			xml += '  <record>\n';
			fields.forEach(field => {
				const value = record[field];
				xml += `    <${field}>${escapeXml(value)}</${field}>\n`;
			});
			xml += '  </record>\n';
		});
		xml += '</records>';
		return xml;
	}

	function escapeXml(str) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&apos;'
		};
		return str.replace(/[&<>"']/g, char => map[char]);
	}

	// ====================================================
	// 9. Podgląd
	// ====================================================
	function showPreview(data, fields, format, separator) {
		const previewContent = document.getElementById('previewContent');
		const previewData = data.slice(0, 5);

		let preview = '';
		if (format === 'csv') {
			preview = fields.join(separator) + '\n';
			previewData.forEach(record => {
				preview += fields.map(f => record[f]).join(separator) + '\n';
			});
		} else if (format === 'json') {
			preview = JSON.stringify(previewData, null, 2);
		} else if (format === 'xml') {
			preview = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
			previewData.forEach(record => {
				preview += '  <record>\n';
				fields.forEach(field => {
					preview += `    <${field}>${escapeXml(record[field])}</${field}>\n`;
				});
				preview += '  </record>\n';
			});
			preview += '</records>';
		}

		previewContent.textContent = preview;
	}

	// ====================================================
	// 10. Pobieranie pliku
	// ====================================================
	function downloadFile(content, filename, mimeType) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
});
