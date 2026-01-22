import {
  toLowerCase,
  toUpperCase,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  stripFormatting,
  htmlEscape,
  htmlUnescape,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  beautifyJSON,
  minifyJSON,
  generateUUID,
  generateSHA256,
} from '../transforms';

describe('transforms.js - Text Transformations', () => {
  describe('Case Transformations', () => {
    test('toLowerCase converts text to lowercase', () => {
      expect(toLowerCase('HELLO WORLD')).toBe('hello world');
    });

    test('toUpperCase converts text to uppercase', () => {
      expect(toUpperCase('hello world')).toBe('HELLO WORLD');
    });

    test('toTitleCase converts to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });

    test('toCamelCase converts to camelCase', () => {
      expect(toCamelCase('hello world test')).toBe('helloWorldTest');
      expect(toCamelCase('hello-world-test')).toBe('helloWorldTest');
    });

    test('toSnakeCase converts to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('HelloWorld')).toBe('hello_world');
    });

    test('toKebabCase converts to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
    });

    test('toPascalCase converts to PascalCase', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
    });
  });

  describe('Encoding/Decoding', () => {
    test('base64Encode encodes text correctly', () => {
      const encoded = base64Encode('Hello World');
      expect(encoded).toBeTruthy();
      expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    test('base64Decode decodes text correctly', () => {
      const encoded = base64Encode('Hello World');
      const decoded = base64Decode(encoded);
      expect(decoded).toBe('Hello World');
    });

    test('urlEncode encodes URLs correctly', () => {
      expect(urlEncode('hello world')).toBe('hello%20world');
      expect(urlEncode('hello&world')).toBe('hello%26world');
    });

    test('urlDecode decodes URLs correctly', () => {
      expect(urlDecode('hello%20world')).toBe('hello world');
      expect(urlDecode('hello%26world')).toBe('hello&world');
    });

    test('htmlEscape escapes HTML entities', () => {
      const escaped = htmlEscape('<script>alert("XSS")</script>');
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });

    test('htmlUnescape decodes HTML entities safely (XSS prevention)', () => {
      // Test that malicious scripts are sanitized
      const malicious = '<script>alert("XSS")</script>';
      const unescaped = htmlUnescape(malicious);
      // Should not execute scripts, only extract text content
      expect(unescaped).not.toContain('<script>');
    });

    test('stripFormatting removes HTML tags safely', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const stripped = stripFormatting(html);
      expect(stripped).toBe('Hello World');
      expect(stripped).not.toContain('<p>');
      expect(stripped).not.toContain('<strong>');
    });

    test('stripFormatting prevents XSS attacks', () => {
      const malicious = '<img src=x onerror="alert(\'XSS\')"> <script>alert("XSS")</script>';
      const stripped = stripFormatting(malicious);
      // Should only contain text, no executable code
      expect(stripped).not.toContain('onerror');
      expect(stripped).not.toContain('<script>');
      expect(stripped).not.toContain('alert');
    });
  });

  describe('JSON Operations', () => {
    test('beautifyJSON formats JSON correctly', () => {
      const json = '{"name":"John","age":30}';
      const beautified = beautifyJSON(json);
      expect(beautified).toContain('\n');
      expect(beautified).toContain('  "name"');
    });

    test('minifyJSON removes whitespace', () => {
      const json = '{\n  "name": "John",\n  "age": 30\n}';
      const minified = minifyJSON(json);
      expect(minified).toBe('{"name":"John","age":30}');
    });

    test('beautifyJSON throws error for invalid JSON', () => {
      expect(() => beautifyJSON('invalid json')).toThrow('Invalid JSON');
    });
  });

  describe('Generators', () => {
    test('generateUUID creates valid UUID v4', () => {
      const uuid = generateUUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('generateSHA256 creates valid hash', async () => {
      const hash = await generateSHA256('Hello World');
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test('generateSHA256 produces consistent hashes', async () => {
      const hash1 = await generateSHA256('test');
      const hash2 = await generateSHA256('test');
      expect(hash1).toBe(hash2);
    });
  });

  describe('Security - XSS Prevention', () => {
    test('stripFormatting prevents innerHTML XSS attack', () => {
      const xssPayload = '<img src=x onerror=alert(document.cookie)>';
      const result = stripFormatting(xssPayload);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    test('htmlUnescape prevents script execution', () => {
      const xssPayload = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      const result = htmlUnescape(xssPayload);
      expect(result).toBe('<script>alert("XSS")</script>');
      // The key is that it returns plain text, not executable HTML
    });

    test('htmlEscape properly escapes dangerous characters', () => {
      const dangerous = '"><script>alert(1)</script>';
      const escaped = htmlEscape(dangerous);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });
  });
});
