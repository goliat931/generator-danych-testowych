const { escapeXml } = require('../static/dataset-generator.js');

describe('escapeXml', () => {
    it('should return the same string if there are no special characters', () => {
        expect(escapeXml('Hello World')).toBe('Hello World');
        expect(escapeXml('12345')).toBe('12345');
    });

    it('should correctly escape ampersand', () => {
        expect(escapeXml('Mac & Cheese')).toBe('Mac &amp; Cheese');
    });

    it('should correctly escape less than and greater than signs', () => {
        expect(escapeXml('<tag>')).toBe('&lt;tag&gt;');
        expect(escapeXml('5 < 10')).toBe('5 &lt; 10');
        expect(escapeXml('10 > 5')).toBe('10 &gt; 5');
    });

    it('should correctly escape double quotes', () => {
        expect(escapeXml('He said "hello"')).toBe('He said &quot;hello&quot;');
    });

    it('should correctly escape single quotes', () => {
        expect(escapeXml("It's a test")).toBe('It&apos;s a test');
    });

    it('should correctly escape a string with multiple special characters', () => {
        expect(escapeXml('<a href="link&param=1">\'Test\'</a>')).toBe('&lt;a href=&quot;link&amp;param=1&quot;&gt;&apos;Test&apos;&lt;/a&gt;');
    });

    it('should handle empty strings', () => {
        expect(escapeXml('')).toBe('');
    });

    it('should handle strings with only special characters', () => {
        expect(escapeXml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&apos;');
    });

    it('should handle non-string inputs gracefully', () => {
        expect(escapeXml(null)).toBeNull();
        expect(escapeXml(undefined)).toBeUndefined();
        expect(escapeXml(123)).toBe(123);
    });
});
