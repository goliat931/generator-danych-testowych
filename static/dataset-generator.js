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
	// 3. Funkcje generujące (reuse z script.js)
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
		const allNames = [...maleNames, ...femaleNames];
		return allNames[Math.floor(Math.random() * allNames.length)];
	}

	function getRandomSurname() {
		return surnames[Math.floor(Math.random() * surnames.length)];
	}

	// ====================================================
	// 4. Toggle separator section
	// ====================================================
	document.querySelectorAll('input[name="export-format"]').forEach(radio => {
		radio.addEventListener('change', () => {
			const separatorSection = document.getElementById('separatorSection');
			separatorSection.style.display = radio.value === 'csv' ? 'block' : 'none';
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
			fields.forEach(field => {
				switch(field) {
					case 'pesel':
						record.pesel = generateRandomPesel();
						break;
					case 'id':
						record.id = generateIdNumber();
						break;
					case 'regon':
						record.regon = generateRegon(Math.random() > 0.5 ? 9 : 14);
						break;
					case 'nrb':
						record.nrb = generateNrb();
						break;
					case 'firstName':
						record.firstName = getRandomName();
						break;
					case 'surname':
						record.surname = getRandomSurname();
						break;
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
