/**
 * @jest-environment jsdom
 */

// Setup DOM elements before loading script
document.body.innerHTML = `
    <input id="themeToggle" />
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
    <div id="copy-message"></div>
`;

// Mock window.matchMedia
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Require script which sets event listener and window.validateId
require('../static/validator.js');
document.dispatchEvent(new Event('DOMContentLoaded'));

const validateId = window.validateId;

describe('Walidacja Dowodu Osobistego (validateId)', () => {
    let idResult;

    beforeEach(() => {
        idResult = document.getElementById('idResult');
        if (idResult) {
            idResult.className = '';
            idResult.textContent = '';
        }
    });

    test('powinno zwrócić false jeśli dowód jest pusty', () => {
        expect(validateId('')).toBe(false);
        expect(idResult.textContent).toBe('❌ Numer dowodu musi mieć 9 znaków');
    });

    test('powinno zwrócić false jeśli dowód ma za mało znaków', () => {
        expect(validateId('ABA300')).toBe(false);
        expect(idResult.textContent).toBe('❌ Numer dowodu musi mieć 9 znaków');
    });

    test('powinno zwrócić false jeśli dowód ma za dużo znaków', () => {
        expect(validateId('ABA3000000')).toBe(false);
        expect(idResult.textContent).toBe('❌ Numer dowodu musi mieć 9 znaków');
    });

    test('powinno zwrócić false dla niepoprawnego formatu (cyfry zamiast liter)', () => {
        expect(validateId('123456789')).toBe(false);
        expect(idResult.textContent).toBe('❌ Format dowodu powinien być: 3 litery + 6 cyfr');
    });

    test('powinno zwrócić false dla niepoprawnego formatu (litery zamiast cyfr)', () => {
        expect(validateId('AAAAAAAAA')).toBe(false);
        expect(idResult.textContent).toBe('❌ Format dowodu powinien być: 3 litery + 6 cyfr');
    });

    test('powinno zwrócić false jeśli suma kontrolna jest błędna', () => {
        expect(validateId('ABA300001')).toBe(false);
        expect(idResult.textContent).toBe('❌ Numer dowodu jest niepoprawny (błędna suma kontrolna)');
    });

    test('powinno zwrócić true jeśli dowód jest poprawny', () => {
        expect(validateId('ABA300000')).toBe(true);
        expect(idResult.textContent).toBe('✅ Numer dowodu osobistego jest poprawny!');
    });
});
