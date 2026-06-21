/**
 * @jest-environment jsdom
 */

// Mock window.matchMedia before requiring the script
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Mock fetch API to return proper mock values for the Promise.all
global.fetch = jest.fn((url) => {
  if (url === "static/bank_codes.json")
    return Promise.resolve({ json: () => Promise.resolve({}) });
  if (url === "static/pl_male_names.json")
    return Promise.resolve({ json: () => Promise.resolve([]) });
  if (url === "static/pl_female_names.json")
    return Promise.resolve({ json: () => Promise.resolve([]) });
  if (url === "static/pl_male_surnames.json")
    return Promise.resolve({ json: () => Promise.resolve([]) });
  if (url === "static/pl_female_surnames.json")
    return Promise.resolve({ json: () => Promise.resolve([]) });
  return Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    text: () => Promise.resolve(""),
  });
});

// Setup mock DOM elements before requiring the script
document.body.innerHTML = `
  <input type="checkbox" id="themeToggle">
  <button id="generateDatasetBtn"></button>
  <button id="downloadDatasetBtn"></button>
  <input id="recordCount" value="10">
  <input name="export-format" value="csv" checked>
  <div id="previewContent"></div>
`;

// We need to require the script and manually dispatch DOMContentLoaded to trigger the initialization
const generator = require("../static/dataset-generator.js");
document.dispatchEvent(new Event("DOMContentLoaded"));

describe("generateXml", () => {
  let generateXml;

  beforeAll(() => {
    generateXml = window.generateXml;
  });

  test("powinno wygenerować prawidłowy plik XML dla poprawnej ścieżki (happy path)", () => {
    const data = [
      { id: "1", name: "Jan" },
      { id: "2", name: "Anna" },
    ];
    const fields = ["id", "name"];
    const expectedXml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      "<records>\n" +
      "  <record>\n" +
      "    <id>1</id>\n" +
      "    <name>Jan</name>\n" +
      "  </record>\n" +
      "  <record>\n" +
      "    <id>2</id>\n" +
      "    <name>Anna</name>\n" +
      "  </record>\n" +
      "</records>";

    const result = generateXml(data, fields);
    expect(result).toBe(expectedXml);
  });

  test("powinno poprawnie użyć escapeXml dla znaków specjalnych (<, >, &, ', \")", () => {
    const data = [{ text: "<tag> & \"quote\" 'apostrophe'" }];
    const fields = ["text"];
    const expectedXml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      "<records>\n" +
      "  <record>\n" +
      "    <text>&lt;tag&gt; &amp; &quot;quote&quot; &apos;apostrophe&apos;</text>\n" +
      "  </record>\n" +
      "</records>";

    const result = generateXml(data, fields);
    expect(result).toBe(expectedXml);
  });

  test("powinno wygenerować poprawny bazowy XML w przypadku pustej tablicy danych", () => {
    const data = [];
    const fields = ["id", "name"];
    const expectedXml =
      '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n</records>';

    const result = generateXml(data, fields);
    expect(result).toBe(expectedXml);
  });
});

describe("formatDateYMD", () => {
  let formatDateYMD;

  beforeAll(() => {
    formatDateYMD = window.formatDateYMD;
  });

  test("powinno sformatować datę prawidłowo do formatu YYYY-MM-DD", () => {
    const date = new Date(2023, 10, 15); // Month is 0-indexed, so 10 is Nov
    expect(formatDateYMD(date)).toBe("2023-11-15");
  });

  test("powinno dodać zera wiodące dla miesięcy i dni jednocyfrowych", () => {
    const date = new Date(2024, 0, 5); // 5 Jan 2024
    expect(formatDateYMD(date)).toBe("2024-01-05");
  });

  test("powinno sformatować daty przed 2000 rokiem prawidłowo", () => {
    const date = new Date(1999, 11, 31); // 31 Dec 1999
    expect(formatDateYMD(date)).toBe("1999-12-31");
  });

  test("powinno obsłużyć daty z przeszłości prawidłowo", () => {
    const date = new Date(1900, 1, 28); // 28 Feb 1900
    expect(formatDateYMD(date)).toBe("1900-02-28");
  });
});
