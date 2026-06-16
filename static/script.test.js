const { generatePesel, generateIdNumber, generateRegon9 } = require('./script.js');

describe('Generator Danych Testowych - script.js', () => {
  test('Wygenerowany PESEL powinien mieć 11 cyfr', () => {
    const pesel = generatePesel(1990, 5, 20, 'male');
    expect(pesel).toHaveLength(11);
    expect(pesel).toMatch(/^\d{11}$/);
  });

  test('Wygenerowany REGON 9-cyfrowy powinien mieć 9 cyfr', () => {
    const regon = generateRegon9();
    expect(regon).toHaveLength(9);
    expect(regon).toMatch(/^\d{9}$/);
  });
});