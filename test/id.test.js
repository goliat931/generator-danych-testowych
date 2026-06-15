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
    generateIdNumber,
    calculateIdChecksum
} = require('../static/script.js');

describe('Generator Dowodu Osobistego (ID)', () => {
  describe('generateIdNumber', () => {
    test('powinno zwrócić string 9-znakowy', () => {
      const id = generateIdNumber();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(9);
    });

    test('powinno składać się z 3 wielkich liter i 6 cyfr', () => {
      const id = generateIdNumber();
      expect(id).toMatch(/^[A-Z]{3}\d{6}$/);
    });

    test('powinno posiadać poprawną sumę kontrolną na 4. pozycji (indeks 3)', () => {
      const id = generateIdNumber();
      const idWithoutChecksum = id.substring(0, 3) + '0' + id.substring(4);
      const expectedChecksum = calculateIdChecksum(idWithoutChecksum);
      expect(parseInt(id[3], 10)).toBe(expectedChecksum);
    });
  });
});
