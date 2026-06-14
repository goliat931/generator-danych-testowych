/**
 * @jest-environment jsdom
 */

// Mock matchMedia
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

// Setup DOM
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ "10100000": "Narodowy Bank Polski" })
  })
);

// Load the validator script
require('../static/validator.js');
document.dispatchEvent(new Event('DOMContentLoaded'));

describe('Walidacja PESEL', () => {
    let peselInput;
    let peselValidateBtn;
    let peselResult;

    beforeEach(() => {
        peselInput = document.getElementById('peselInput');
        peselValidateBtn = document.getElementById('peselValidateBtn');
        peselResult = document.getElementById('peselResult');
        // Clear input and result
        peselInput.value = '';
        peselResult.textContent = '';
        peselResult.className = '';
    });

    test('powinno odrzucić PESEL o nieprawidłowej długości', () => {
        peselInput.value = '123';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('musi mieć 11 cyfr');
        expect(peselResult.className).toContain('invalid');
    });

    test('powinno odrzucić pusty PESEL', () => {
        peselInput.value = '';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('Wpisz numer PESEL');
    });

    test('powinno odrzucić PESEL zawierający znaki inne niż cyfry', () => {
        peselInput.value = '4405140135a';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('tylko cyfry');
        expect(peselResult.className).toContain('invalid');
    });

    test('powinno odrzucić PESEL z błędną sumą kontrolną', () => {
        peselInput.value = '44051401358'; // Prawidłowa to 9
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('błędna suma kontrolna');
        expect(peselResult.className).toContain('invalid');
    });

    test('powinno odrzucić PESEL z nieprawidłowym miesiącem', () => {
        peselInput.value = '44131401350';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('niepoprawny (miesiąc)');
        expect(peselResult.className).toContain('invalid');
    });

    test('powinno odrzucić PESEL z nieprawidłowym dniem', () => {
        peselInput.value = '44053201353';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('niepoprawny (dzień)');
        expect(peselResult.className).toContain('invalid');
    });

    test('powinno zaakceptować poprawny PESEL (XIX wiek)', () => {
        peselInput.value = '99851401353';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('poprawny');
        expect(peselResult.className).toContain('valid');
        expect(peselResult.innerHTML).toContain('Data urodzenia: 14-05-1899');
    });

    test('powinno zaakceptować poprawny PESEL (XX wiek)', () => {
        peselInput.value = '44051401359';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('poprawny');
        expect(peselResult.className).toContain('valid');
        expect(peselResult.innerHTML).toContain('Płeć: Mężczyzna');
        expect(peselResult.innerHTML).toContain('Data urodzenia: 14-05-1944');
    });

    test('powinno zaakceptować poprawny PESEL (XXI wiek)', () => {
        peselInput.value = '00210101234';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('poprawny');
        expect(peselResult.className).toContain('valid');
        expect(peselResult.innerHTML).toContain('Płeć: Mężczyzna');
        expect(peselResult.innerHTML).toContain('Data urodzenia: 01-01-2000');
    });

    test('powinno zaakceptować poprawny PESEL (XXII wiek)', () => {
        peselInput.value = '01410101237';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('poprawny');
        expect(peselResult.innerHTML).toContain('Data urodzenia: 01-01-2101');
    });

    test('powinno zaakceptować poprawny PESEL (XXIII wiek)', () => {
        peselInput.value = '01610101233';
        peselValidateBtn.click();
        expect(peselResult.textContent).toContain('poprawny');
        expect(peselResult.innerHTML).toContain('Data urodzenia: 01-01-2201');
    });
});
