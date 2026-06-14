const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('validateNrb', () => {
    let dom;
    let window;
    let document;

    beforeEach((done) => {
        const htmlPath = path.resolve(__dirname, '../validator.html');
        const jsPath = path.resolve(__dirname, '../static/validator.js');

        let html = fs.readFileSync(htmlPath, 'utf8');
        // Remove existing scripts and links to avoid network requests
        html = html.replace(/<script.*?>.*?<\/script>/ig, '');
        html = html.replace(/<link.*?>/ig, '');

        const js = fs.readFileSync(jsPath, 'utf8');

        dom = new JSDOM(html, {
            url: "http://localhost/", // Sets up localStorage
            runScripts: 'dangerously',
        });
        window = dom.window;
        document = window.document;

        window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false }));
        window.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    "10100000": "Narodowy Bank Polski",
                    "1020": "PKO BP"
                })
            })
        );

        const scriptEl = document.createElement('script');
        scriptEl.textContent = js;
        document.body.appendChild(scriptEl);

        setTimeout(() => {
            if (window.validateNrb) {
                // Set bank codes explicitly for testing just in case fetch resolves late
                window.setBankCodesForTest({
                    "10100000": "Narodowy Bank Polski",
                    "1020": "PKO BP",
                    "9681": "Test Bank"
                });
                done();
            } else {
                document.dispatchEvent(new window.Event('DOMContentLoaded'));
                setTimeout(() => {
                    window.setBankCodesForTest({
                        "10100000": "Narodowy Bank Polski",
                        "1020": "PKO BP",
                        "9681": "Test Bank"
                    });
                    done();
                }, 50);
            }
        }, 50);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined on window', () => {
        expect(window.validateNrb).toBeDefined();
    });

    it('should return false and show message for invalid length', () => {
        const nrbResult = document.getElementById('nrbResult');
        const result = window.validateNrb('123'); // Too short

        expect(result).toBe(false);
        expect(nrbResult.className).toContain('invalid');
        expect(nrbResult.innerHTML).toContain('Numer rachunku musi mieć 26 cyfr');
    });

    it('should return false for non-numeric characters', () => {
        const nrbResult = document.getElementById('nrbResult');
        const result = window.validateNrb('PL879681000205520062600824AB'); // 26 chars but contains letters

        expect(result).toBe(false);
        expect(nrbResult.className).toContain('invalid');
        expect(nrbResult.innerHTML).toContain('Numer rachunku może zawierać tylko cyfry');
    });

    it('should return false for invalid checksum', () => {
        const nrbResult = document.getElementById('nrbResult');
        // valid length, but checksum is incorrect
        const result = window.validateNrb('99114020040000300201355387');

        expect(result).toBe(false);
        expect(nrbResult.className).toContain('invalid');
        expect(nrbResult.innerHTML).toContain('niepoprawny (błędna suma kontrolna IBAN)');
    });

    it('should return true for a valid NRB', () => {
        const nrbResult = document.getElementById('nrbResult');
        // Let's use a valid NRB for Test Bank: 87 1140 2004 0000 3002 0135 5387
        const validNrb = '87968100020552006260082412';
        const result = window.validateNrb(validNrb);

        expect(result).toBe(true);
        expect(nrbResult.className).toContain('valid');
        expect(nrbResult.innerHTML).toContain('Numer rachunku bankowego jest poprawny!');
        expect(nrbResult.innerHTML).toContain('Test Bank'); // 9681 is Bank
    });

    it('should correctly strip PL prefix and spaces', () => {
        const nrbResult = document.getElementById('nrbResult');
        // Valid NRB with PL prefix and spaces
        const validNrb = 'PL 87 9681 0002 0552 0062 6008 2412';
        const result = window.validateNrb(validNrb);

        expect(result).toBe(true);
        expect(nrbResult.className).toContain('valid');
        expect(nrbResult.innerHTML).toContain('Numer rachunku bankowego jest poprawny!');
    });
});
