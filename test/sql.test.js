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

const { generateSql, escapeSqlValue, escapeSqlIdentifier } = require('../static/dataset-generator.js');

describe('generateSql', () => {
    test('is defined', () => {
        expect(generateSql).toBeDefined();
    });

    test('generates a basic INSERT statement', () => {
        const data = [{ name: 'Jan', age: '30' }, { name: 'Anna', age: '25' }];
        const fields = ['name', 'age'];
        const result = generateSql(data, fields, 'osoby');
        expect(result).toBe(
            "INSERT INTO osoby (name, age) VALUES\n  ('Jan', '30'),\n  ('Anna', '25');"
        );
    });

    test('escapes single quotes in values', () => {
        const data = [{ name: "O'Brien" }];
        const fields = ['name'];
        const result = generateSql(data, fields, 'osoby');
        expect(result).toBe("INSERT INTO osoby (name) VALUES\n  ('O''Brien');");
    });

    test('renders empty/undefined values as NULL', () => {
        const data = [{ name: 'Jan', nick: '' }, { name: 'Anna', nick: undefined }];
        const fields = ['name', 'nick'];
        const result = generateSql(data, fields, 'osoby');
        expect(result).toBe(
            "INSERT INTO osoby (name, nick) VALUES\n  ('Jan', NULL),\n  ('Anna', NULL);"
        );
    });

    test('sanitizes table and column names to safe SQL identifiers', () => {
        const data = [{ 'first name': 'Jan' }];
        const fields = ['first name'];
        const result = generateSql(data, fields, 'my table; DROP TABLE x');
        expect(result).toBe(
            "INSERT INTO my_table__DROP_TABLE_x (first_name) VALUES\n  ('Jan');"
        );
    });

    test('falls back to dane_testowe when table name is empty', () => {
        const data = [{ id: '1' }];
        const fields = ['id'];
        const result = generateSql(data, fields, '');
        expect(result).toBe("INSERT INTO dane_testowe (id) VALUES\n  ('1');");
    });

    test('handles empty data with a comment instead of invalid SQL', () => {
        const result = generateSql([], ['id'], 'osoby');
        expect(result).toBe('-- Brak danych do wstawienia do tabeli osoby');
    });

    test('splits large datasets into multiple batched INSERT statements', () => {
        const data = Array.from({ length: 501 }, (_, i) => ({ id: String(i) }));
        const result = generateSql(data, ['id'], 'osoby');
        const statements = result.split('\n\n');
        expect(statements).toHaveLength(2);
        expect(statements[0].match(/\(/g).length).toBe(501); // 500 rows + 1 for INSERT INTO(...)
        expect(statements[1]).toBe("INSERT INTO osoby (id) VALUES\n  ('500');");
    });
});

describe('escapeSqlValue', () => {
    test('quotes strings and doubles internal single quotes', () => {
        expect(escapeSqlValue("it's")).toBe("'it''s'");
    });

    test('returns NULL for null, undefined and empty string', () => {
        expect(escapeSqlValue(null)).toBe('NULL');
        expect(escapeSqlValue(undefined)).toBe('NULL');
        expect(escapeSqlValue('')).toBe('NULL');
    });
});

describe('escapeSqlIdentifier', () => {
    test('replaces unsafe characters with underscores', () => {
        expect(escapeSqlIdentifier('nr domu')).toBe('nr_domu');
        expect(escapeSqlIdentifier('a;b')).toBe('a_b');
    });

    test('replaces unsafe characters even when the whole name is unsafe', () => {
        expect(escapeSqlIdentifier(';;;')).toBe('___');
    });

    test('falls back to "field" for an empty name', () => {
        expect(escapeSqlIdentifier('')).toBe('field');
    });
});
