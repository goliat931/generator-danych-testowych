/**
 * @jest-environment jsdom
 */

// Mockowanie dla JSDOM, żeby require się powiodło bez errorów
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

const { generateCsv } = require('../static/dataset-generator.js');

describe('generateCsv', () => {
    test('is defined', () => {
        expect(generateCsv).toBeDefined();
    });

    test('generates basic csv', () => {
        const data = [{name: 'John', age: 30}, {name: 'Jane', age: 25}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age\nJohn,30\nJane,25');
    });

    test('escapes fields with separators', () => {
        const data = [{name: 'John, Doe', age: 30}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age\n"John, Doe",30');
    });

    test('escapes fields with quotes', () => {
        const data = [{name: 'John "The Boss" Doe', age: 30}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age\n"John ""The Boss"" Doe",30');
    });

    test('escapes fields with newlines', () => {
        const data = [{name: 'John\nDoe', age: 30}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age\n"John\nDoe",30');
    });

    test('works with different separators', () => {
        const data = [{name: 'John', age: 30}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ';');
        expect(result).toBe('name;age\nJohn;30');
    });

    test('handles empty data', () => {
        const data = [];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age');
    });

    test('handles missing fields in records gracefully', () => {
        const data = [{name: 'John'}];
        const fields = ['name', 'age'];
        const result = generateCsv(data, fields, ',');
        expect(result).toBe('name,age\nJohn,');
    });
});
