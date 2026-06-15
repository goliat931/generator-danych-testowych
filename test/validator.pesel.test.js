/**
 * @jest-environment jsdom
 */

// Mock window.matchMedia before requiring the script
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch for bank codes to prevent unhandled exception
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ "10100000": "Narodowy Bank Polski" })
  })
);

// Setup DOM
document.body.innerHTML = `
  <input id="peselInput" />
  <button id="peselValidateBtn"></button>
  <div id="peselResult"></div>

  <input id="idInput" />
  <button id="idValidateBtn"></button>
  <div id="idResult"></div>

  <input id="regonInput" />
  <button id="regonValidateBtn"></button>
  <div id="regonResult"></div>

  <input id="nrbInput" />
  <button id="nrbValidateBtn"></button>
  <div id="nrbResult"></div>
`;

// Require script that sets up event listeners on DOMContentLoaded
require('../static/validator.js');
// Trigger DOMContentLoaded
document.dispatchEvent(new Event('DOMContentLoaded'));

const {
    validatePesel,
    isValidPeselChecksum,
    decodePeselDate,
    calculateAge
} = window.__test_validator__;

describe('Validator PESEL', () => {
    let peselResult;

    beforeEach(() => {
        peselResult = document.getElementById('peselResult');
        peselResult.className = '';
        peselResult.innerHTML = '';

        // Mock current date for age calculation testing
        jest.useFakeTimers().setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('isValidPeselChecksum', () => {
        test('powinno zwrócić true dla prawidłowego PESEL', () => {
            expect(isValidPeselChecksum('44051401359')).toBe(true);
        });

        test('powinno zwrócić false dla nieprawidłowego PESEL', () => {
            expect(isValidPeselChecksum('44051401358')).toBe(false);
        });
    });

    describe('decodePeselDate', () => {
        test('powinno zdekodować datę dla roku 1900-1999', () => {
            expect(decodePeselDate('85022301234')).toEqual({ year: 1985, month: 2, day: 23 });
        });

        test('powinno zdekodować datę dla roku 2000-2099', () => {
            expect(decodePeselDate('05251401234')).toEqual({ year: 2005, month: 5, day: 14 });
        });

        test('powinno zdekodować datę dla roku 2100-2199', () => {
            expect(decodePeselDate('05451401234')).toEqual({ year: 2105, month: 5, day: 14 });
        });

        test('powinno zdekodować datę dla roku 2200-2299', () => {
            expect(decodePeselDate('05651401234')).toEqual({ year: 2205, month: 5, day: 14 });
        });

        test('powinno zdekodować datę dla roku 1800-1899', () => {
            expect(decodePeselDate('05851401234')).toEqual({ year: 1805, month: 5, day: 14 });
        });
    });

    describe('calculateAge', () => {
        test('powinno poprawnie obliczyć wiek przed urodzinami w danym roku', () => {
            expect(calculateAge(1990, 8, 15)).toBe(33); // Today is 2024-06-15
        });

        test('powinno poprawnie obliczyć wiek w dniu urodzin', () => {
            expect(calculateAge(1990, 6, 15)).toBe(34);
        });

        test('powinno poprawnie obliczyć wiek po urodzinach w danym roku', () => {
            expect(calculateAge(1990, 3, 10)).toBe(34);
        });
    });

    describe('validatePesel', () => {
        test('powinno odrzucić PESEL o nieprawidłowej długości', () => {
            expect(validatePesel('123')).toBe(false);
            expect(peselResult.textContent).toBe('❌ Numer PESEL musi mieć 11 cyfr');
            expect(peselResult.className).toContain('invalid');
        });

        test('powinno odrzucić PESEL zawierający znaki nienumeryczne', () => {
            expect(validatePesel('1234567890a')).toBe(false);
            expect(peselResult.textContent).toBe('❌ Numer PESEL może zawierać tylko cyfry');
            expect(peselResult.className).toContain('invalid');
        });

        test('powinno odrzucić PESEL z błędną sumą kontrolną', () => {
            expect(validatePesel('44051401358')).toBe(false);
            expect(peselResult.textContent).toBe('❌ Numer PESEL jest niepoprawny (błędna suma kontrolna)');
            expect(peselResult.className).toContain('invalid');
        });

        test('powinno odrzucić PESEL z nieprawidłowym miesiącem', () => {
            // Month 13 -> 1900s, month 13 -> invalid
            // The checksum must be correct to reach the month validation
            // 0013010123 with weights [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] -> checksum 3
            expect(validatePesel('00130101233')).toBe(false);
            expect(peselResult.textContent).toBe('❌ Numer PESEL jest niepoprawny (miesiąc)');
            expect(peselResult.className).toContain('invalid');
        });

        test('powinno odrzucić PESEL z nieprawidłowym dniem', () => {
            // 0001320123 with weights -> checksum 2
            expect(validatePesel('00013201232')).toBe(false);
            expect(peselResult.textContent).toBe('❌ Numer PESEL jest niepoprawny (dzień)');
            expect(peselResult.className).toContain('invalid');
        });

        test('powinno zaakceptować prawidłowy PESEL i wyświetlić metadane', () => {
            // Male, born 1944-05-14
            const validPesel = '44051401359';
            expect(validatePesel(validPesel)).toBe(true);
            expect(peselResult.textContent).toContain('✅ Numer PESEL jest poprawny!');
            expect(peselResult.textContent).toContain('Płeć: Mężczyzna');
            expect(peselResult.textContent).toContain('Data urodzenia: 14-05-1944');
            expect(peselResult.textContent).toContain('Wiek: 80 lat');
            expect(peselResult.className).toContain('valid');
        });

        test('powinno poprawnie zidentyfikować kobietę', () => {
            // Female, 1985-02-23 (Assuming a valid checksum, calculated dynamically just for testing gender)
            // Example valid female PESEL: 85022301244 (if checksum is 4)
            // Re-use logic: weights [1,3,7,9,1,3,7,9,1,3]
            // 8*1 + 5*3 + 0*7 + 2*9 + 2*1 + 3*3 + 0*7 + 1*9 + 2*1 + 4*3
            // 8 + 15 + 0 + 18 + 2 + 9 + 0 + 9 + 2 + 12 = 75. 10 - 5 = 5.
            const validPeselFemale = '85022301245';
            expect(validatePesel(validPeselFemale)).toBe(true);
            expect(peselResult.textContent).toContain('Płeć: Kobieta');
        });
    });
});
