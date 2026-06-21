const { escapeXml } = require('../static/dataset-generator.js');

describe('escapeXml function', () => {
    it('returns the same string when no special characters exist', () => {
        expect(escapeXml('Hello World')).toBe('Hello World');
        expect(escapeXml('12345')).toBe('12345');
        expect(escapeXml('Normal text')).toBe('Normal text');
    });

    it('correctly escapes ampersand (&)', () => {
        expect(escapeXml('Me & You')).toBe('Me &amp; You');
        expect(escapeXml('A & B & C')).toBe('A &amp; B &amp; C');
    });

    it('correctly escapes less than (<) and greater than (>) signs', () => {
        expect(escapeXml('<script>')).toBe('&lt;script&gt;');
        expect(escapeXml('x < y')).toBe('x &lt; y');
        expect(escapeXml('a > b')).toBe('a &gt; b');
        expect(escapeXml('<html><body>')).toBe('&lt;html&gt;&lt;body&gt;');
    });

    it('correctly escapes double quotes (")', () => {
        expect(escapeXml('She said "yes"')).toBe('She said &quot;yes&quot;');
        expect(escapeXml('{"key": "value"}')).toBe('{&quot;key&quot;: &quot;value&quot;}');
    });

    it('correctly escapes single quotes (\')', () => {
        expect(escapeXml("O'Connor")).toBe('O&apos;Connor');
        expect(escapeXml("It's a beautiful day")).toBe('It&apos;s a beautiful day');
    });

    it('handles a combination of multiple special characters', () => {
        expect(escapeXml('<a href="https://example.com?a=1&b=2">Click \'here\'</a>'))
            .toBe('&lt;a href=&quot;https://example.com?a=1&amp;b=2&quot;&gt;Click &apos;here&apos;&lt;/a&gt;');
        expect(escapeXml('<<&&>>""\'\'')).toBe('&lt;&lt;&amp;&amp;&gt;&gt;&quot;&quot;&apos;&apos;');
    });

    it('handles empty strings properly', () => {
        expect(escapeXml('')).toBe('');
    });
});
