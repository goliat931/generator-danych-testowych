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
    generateRegon14,
    generateRegon9,
    calculateRegon14Checksum,
    calculateRegon9Checksum
} = require('../static/script.js');

describe('Generator REGON', () => {
  describe('generateRegon14', () => {
    test('powinno zwrócić string 14-znakowy', () => {
      const regon = generateRegon14();
      expect(typeof regon).toBe('string');
      expect(regon.length).toBe(14);
    });

    test('powinno składać się z samych cyfr', () => {
      const regon = generateRegon14();
      expect(regon).toMatch(/^\d{14}$/);
    });

    test('powinno zawierać poprawną sumę kontrolną w 14. znaku', () => {
      const regon = generateRegon14();
      const expectedChecksum = calculateRegon14Checksum(regon.substring(0, 13));
      expect(parseInt(regon[13])).toBe(expectedChecksum);
    });

    test('powinno posiadać poprawny REGON 9-cyfrowy jako przedrostek', () => {
      const regon = generateRegon14();
      const regon9 = regon.substring(0, 9);
      const expectedChecksum9 = calculateRegon9Checksum(regon9.substring(0, 8));
      expect(parseInt(regon9[8])).toBe(expectedChecksum9);
    });
  });
});
