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

const {
    generatePesel,
    calculatePeselChecksum,
    getEncodedMonth
} = require('../static/script.js');

describe('Generator PESEL', () => {
    describe('generatePesel', () => {
        test('powinno zwrócić string 11-znakowy', () => {
            const pesel = generatePesel(1990, 1, 1, 'male');
            expect(typeof pesel).toBe('string');
            expect(pesel.length).toBe(11);
        });

        test('powinno składać się z samych cyfr', () => {
            const pesel = generatePesel(1995, 12, 31, 'female');
            expect(pesel).toMatch(/^\d{11}$/);
        });

        test('powinno poprawnie kodować płeć żeńską', () => {
            const pesel = generatePesel(1990, 5, 10, 'female');
            const genderDigit = parseInt(pesel[9]);
            expect(genderDigit % 2).toBe(0); // 0, 2, 4, 6, 8
        });

        test('powinno poprawnie kodować płeć męską', () => {
            const pesel = generatePesel(1985, 7, 20, 'male');
            const genderDigit = parseInt(pesel[9]);
            expect(genderDigit % 2).toBe(1); // 1, 3, 5, 7, 9
        });

        test('powinno rzucać błąd dla nieprawidłowej płci', () => {
            expect(() => {
                generatePesel(1990, 1, 1, 'other');
            }).toThrow("Invalid gender. Use 'male' or 'female'.");
        });

        test('powinno poprawnie obliczać cyfrę kontrolną dla wygenerowanego PESELu', () => {
            const pesel = generatePesel(2005, 3, 15, 'male');
            const expectedChecksum = calculatePeselChecksum(pesel.substring(0, 10));
            expect(parseInt(pesel[10])).toBe(expectedChecksum);
        });
    });

    describe('getEncodedMonth', () => {
        test('powinno kodować dla lat 1800-1899 (+80)', () => {
            expect(getEncodedMonth(1850, 1)).toBe('81');
            expect(getEncodedMonth(1899, 12)).toBe('92');
        });

        test('powinno kodować dla lat 1900-1999 (+0)', () => {
            expect(getEncodedMonth(1900, 1)).toBe('01');
            expect(getEncodedMonth(1999, 12)).toBe('12');
        });

        test('powinno kodować dla lat 2000-2099 (+20)', () => {
            expect(getEncodedMonth(2000, 1)).toBe('21');
            expect(getEncodedMonth(2099, 12)).toBe('32');
        });

        test('powinno kodować dla lat 2100-2199 (+40)', () => {
            expect(getEncodedMonth(2100, 1)).toBe('41');
            expect(getEncodedMonth(2199, 12)).toBe('52');
        });

        test('powinno kodować dla lat 2200-2299 (+60)', () => {
            expect(getEncodedMonth(2200, 1)).toBe('61');
            expect(getEncodedMonth(2299, 12)).toBe('72');
        });

        test('powinno rzucać błąd dla nieobsługiwanych lat', () => {
            expect(() => {
                getEncodedMonth(1799, 1);
            }).toThrow("Unsupported year for PESEL generation.");
            expect(() => {
                getEncodedMonth(2300, 1);
            }).toThrow("Unsupported year for PESEL generation.");
        });
    });

    describe('calculatePeselChecksum', () => {
        test('powinno poprawnie obliczać sumę kontrolną dla znanych PESELi', () => {
            // Przykładowe poprawne obliczenia cyfry kontrolnej
            // Waga: 1 3 7 9 1 3 7 9 1 3
            // PESEL: 44051401359 (rok 1944, miesiąc 05, dzień 14, płeć: mężczyzna)
            expect(calculatePeselChecksum('4405140135')).toBe(9);

            // PESEL testowy, wygenerujemy taki by sprawdzić checksum === 0
            expect(calculatePeselChecksum('8102030000')).toBe(2); // [8*1 + 1*3 + 0*7 + 2*9 + 0*1 + 3*3 + 0*7 + 0*9 + 0*1 + 0*3] = 8+3+0+18+0+9+0+0+0+0 = 38 % 10 = 8 -> 10-8 = 2

            // Poszukajmy takiego co da równe 0.
            // Np. suma kontrolna = 20 -> %10 = 0 -> 0.
            // 0*1 + 0*3 + 0*7 + 0*9 + 0*1 + 0*3 + 0*7 + 0*9 + 0*1 + 0*3 = 0 -> mod 10 = 0 -> return 0.
            expect(calculatePeselChecksum('0000000000')).toBe(0);
        });
    });
});
