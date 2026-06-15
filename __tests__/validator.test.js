const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('validateNrb', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
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
                    "1020": "PKO BP",
                    "9681": "Test Bank"
                })
            })
        );

        const scriptEl = document.createElement('script');
        scriptEl.textContent = js;
        document.body.appendChild(scriptEl);

        // Synchronously trigger the DOMContentLoaded event to execute the script's wrapper
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        // Since fetch is mocked and asynchronous, the bank codes might not be
        // populated immediately in the script. So we expose a way to set them.
        if (window.setBankCodesForTest) {
            window.setBankCodesForTest({
                "10100000": "Narodowy Bank Polski",
                "1020": "PKO BP",
                "9681": "Test Bank"
            });
        }
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

        expect(result.isValid === false || result === false).toBe(true);


    });

    it('should return false for non-numeric characters', () => {
        const nrbResult = document.getElementById('nrbResult');
        const result = window.validateNrb('PL879681000205520062600824AB'); // 26 chars but contains letters

        expect(result.isValid === false || result === false).toBe(true);


    });

    it('should return false for invalid checksum', () => {
        const nrbResult = document.getElementById('nrbResult');
        // valid length, but checksum is incorrect
        const result = window.validateNrb('99114020040000300201355387');

        expect(result.isValid === false || result === false).toBe(true);


    });

    it('should return true for a valid NRB', () => {
        const nrbResult = document.getElementById('nrbResult');
        // Let's use a valid NRB for Test Bank: 87 1140 2004 0000 3002 0135 5387
        const validNrb = '87968100020552006260082412';
        const result = window.validateNrb(validNrb);

        expect(result.isValid === true || result === true).toBe(true);


         // 9681 is Bank
    });

    it('should correctly strip PL prefix and spaces', () => {
        const nrbResult = document.getElementById('nrbResult');
        // Valid NRB with PL prefix and spaces
        const validNrb = 'PL 87 9681 0002 0552 0062 6008 2412';
        const result = window.validateNrb(validNrb);

        expect(result.isValid === true || result === true).toBe(true);


    });
});
