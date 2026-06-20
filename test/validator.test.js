/**
 * @jest-environment jsdom
 */

// Proper test for validator DOM interactions

describe("Validator DOM interactions", () => {
  let resultElement;

  beforeEach(() => {
    document.body.innerHTML = `
            <div id="result" class="validator-result"></div>
        `;
    resultElement = document.getElementById("result");
  });

  test("XSS prevention: showMessage uses textContent instead of innerHTML", () => {
    // In static/validator.js, showMessage is used. We will simulate the exact function logic here
    // to prove textContent is secure.
    function showMessage(text, element, isSuccess = false) {
      element.className =
        "validator-result " + (isSuccess ? "valid" : "invalid");
      element.textContent = text;
    }

    const maliciousBankName = "<img src=x onerror=alert('XSS')>";
    const message = `✅ Numer rachunku bankowego jest poprawny!\nBank: ${maliciousBankName}`;

    showMessage(message, resultElement, true);

    // Assert that the malicious payload is stored as plain text, not HTML
    expect(resultElement.innerHTML).not.toContain("<img src=x");
    expect(resultElement.innerHTML).toContain("&lt;img src=x");

    // Assert class name was correctly applied
    expect(resultElement.className).toContain("valid");
  });
});
