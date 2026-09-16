const {
  generatePesel,
  generateIdNumber,
  generateRegon9,
  flipDigitAt,
  dropRandomChar,
  corruptChecksumValue,
  corruptAccountNumber,
} = require('../static/script.js');

function peselChecksumOk(pesel) {
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  if (!/^\d{11}$/.test(pesel)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(pesel[i], 10) * weights[i];
  const l = sum % 10;
  const expected = l === 0 ? 0 : 10 - l;
  return expected === parseInt(pesel[10], 10);
}

describe('flipDigitAt', () => {
  test('zmienia cyfrę na innej pozycji dodatniej', () => {
    expect(flipDigitAt('12345', 0)).toBe('22345');
  });

  test('obsługuje ujemny indeks (liczony od końca)', () => {
    expect(flipDigitAt('12345', -1)).toBe('12346');
  });

  test('nie zmienia nic, gdy znak na pozycji nie jest cyfrą', () => {
    expect(flipDigitAt('ABC123', 0)).toBe('ABC123');
  });

  test('9 zawija się do 0', () => {
    expect(flipDigitAt('9', 0)).toBe('0');
  });
});

describe('dropRandomChar', () => {
  test('usuwa dokładnie jeden znak', () => {
    const result = dropRandomChar('123456789');
    expect(result).toHaveLength(8);
  });

  test('nie psuje jednoznakowego stringa (brak co usunąć)', () => {
    expect(dropRandomChar('5')).toBe('5');
  });
});

describe('corruptChecksumValue', () => {
  test('zawsze zwraca wartość różną od oryginału (dla wielocyfrowego numeru)', () => {
    for (let i = 0; i < 20; i++) {
      const corrupted = corruptChecksumValue('44051401359', 10);
      expect(corrupted).not.toBe('44051401359');
    }
  });
});

describe('corruptAccountNumber', () => {
  test('psuje kompaktowy numer PL (bez prefiksu, bez spacji)', () => {
    const original = '87968100020552006260082412';
    for (let i = 0; i < 20; i++) {
      const corrupted = corruptAccountNumber(original);
      expect(corrupted).not.toBe(original);
    }
  });

  test('zachowuje formatowanie ze spacjami po zepsuciu', () => {
    const spaced = '87 9681 0002 0552 0062 6008 2412';
    const corrupted = corruptAccountNumber(spaced);
    expect(corrupted).not.toBe(spaced);
    // Grupowanie po 4 znaki powinno zostać zachowane (poza ew. ostatnią,
    // krótszą grupą przy metodzie "zła długość").
    expect(corrupted).toMatch(/^[\dA-Z]{2,4}( [\dA-Z]{1,4})*$/);
  });

  test('psuje IBAN z 2-literowym prefiksem kraju (np. DE), zachowując tylko cyfry/wielkie litery', () => {
    const original = 'DE73700202703044251774';
    let sawDigitFlip = false;
    let sawLengthChange = false;
    for (let i = 0; i < 30; i++) {
      const corrupted = corruptAccountNumber(original);
      expect(corrupted).not.toBe(original);
      expect(corrupted).toMatch(/^[A-Z0-9]+$/);
      if (corrupted.length === original.length) sawDigitFlip = true;
      if (corrupted.length === original.length - 1) sawLengthChange = true;
    }
    expect(sawDigitFlip).toBe(true);
    expect(sawLengthChange).toBe(true);
  });

  test('nie rusza krótkich tekstów, które nie są prawdziwym numerem (np. komunikaty błędów)', () => {
    const errorMessage = 'Brak danych';
    expect(corruptAccountNumber(errorMessage)).toBe(errorMessage);
  });
});

describe('integracja: dane generowane w trybie błędnym nie przechodzą walidacji', () => {
  test('celowo zepsuty PESEL nigdy nie ma poprawnej sumy kontrolnej i poprawnej długości jednocześnie', () => {
    for (let i = 0; i < 30; i++) {
      const pesel = generatePesel(1990, 5, 20, 'male');
      const corrupted = corruptChecksumValue(pesel, 10);
      const stillValid = corrupted.length === 11 && peselChecksumOk(corrupted);
      expect(stillValid).toBe(false);
    }
  });
});
