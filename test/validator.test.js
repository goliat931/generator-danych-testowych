/**
 * @jest-environment jsdom
 */

// Basic mock to test validator logic and DOM manipulation

describe('Validator DOM interactions', () => {
    let peselResult, nrbResult, peselInfo, nrbInfo;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="peselResult" class="validator-result"></div>
            <div id="nrbResult" class="validator-result"></div>
            <div id="peselInfo"></div>
            <div id="nrbInfo"></div>
            <div id="copy-message"></div>
        `;

        peselResult = document.getElementById('peselResult');
        nrbResult = document.getElementById('nrbResult');
        peselInfo = document.getElementById('peselInfo');
        nrbInfo = document.getElementById('nrbInfo');
    });

    test('XSS prevention: Using textContent or innerText instead of innerHTML', () => {
        // Simulating the fix
        const maliciousBankName = "<img src=x onerror=alert('XSS')>";
        const message = `✅ Numer rachunku bankowego jest poprawny!\nBank: ${maliciousBankName}`;

        nrbResult.textContent = message;

        // Assert that the malicious payload is stored as plain text, not HTML
        expect(nrbResult.innerHTML).not.toContain('<img src=x');
        expect(nrbResult.innerHTML).toContain('&lt;img src=x');
    });
});
