/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve([]) }),
);

const {
  generateCsv,
  generateXml,
  escapeCsvHeader,
  escapeXmlTagName,
} = require('../static/data-generators.js');

describe('escapeCsvHeader - ochrona przed CSV injection w nazwach kolumn', () => {
  test('zwykła nazwa zostaje bez zmian', () => {
    expect(escapeCsvHeader('PESEL', ',')).toBe('PESEL');
  });

  test.each(['=1+1', '+cmd', '-x', '@SUM(A1)', '\tcos', '\rcos'])(
    'nazwa zaczynająca się od %j dostaje apostrof na początku',
    (name) => {
      expect(escapeCsvHeader(name, ',')).toBe("'" + name);
    },
  );

  test('nazwa z separatorem lub cudzysłowem jest cytowana', () => {
    expect(escapeCsvHeader('a,b', ',')).toBe('"a,b"');
    expect(escapeCsvHeader('say "hi"', ',')).toBe('"say ""hi"""');
  });

  test('generateCsv stosuje ochronę do nagłówka', () => {
    const csv = generateCsv([{ '=HYPERLINK("x")': '1' }], ['=HYPERLINK("x")'], ',');
    expect(csv.split('\n')[0]).toBe('"\'=HYPERLINK(""x"")"');
  });
});

describe('escapeXmlTagName - poprawne nazwy znaczników', () => {
  test('polskie litery i podkreślenia zostają', () => {
    expect(escapeXmlTagName('Dowód_Osobisty')).toBe('Dowód_Osobisty');
  });

  test('znaki specjalne zamieniane są na podkreślenie', () => {
    expect(escapeXmlTagName('a<b>&c')).toBe('a_b__c');
  });

  test('nazwa nie może zaczynać się od cyfry', () => {
    expect(escapeXmlTagName('1abc')).toBe('_1abc');
  });

  test('generateXml nie pozwala wstrzyknąć znacznika przez nazwę pola', () => {
    const xml = generateXml([{ '><script>': 'v' }], ['><script>']);
    expect(xml).not.toContain('<script');
    expect(xml).toContain('<__script_>v</__script_>');
  });
});
