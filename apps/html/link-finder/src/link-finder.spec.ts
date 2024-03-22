import {classifyUrl} from "./link-finder";

describe('link-finder', () => {
  it('should classify data URIs', () => {
    // examples from https://en.wikipedia.org/wiki/Data_URI_scheme
    expect(classifyUrl('data:text/vnd-example+xyz;foo=bar;base64,R0lGODdh')).toBeUndefined();
    expect(classifyUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD')).toBe('image');
    expect(classifyUrl('data:image/svg+xml;utf8,<svg width=\'10\'... </svg>')).toBe('image');
    expect(classifyUrl('data:font/woff2;base64,d09GMgABAAAA')).toBe('font');
    expect(classifyUrl('data:image/png;base64,iVBORw0KGgoAAA\n' +
      'ANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4\n' +
      '//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU\n' +
      '5ErkJggg==')).toBe('image');
  });

  it('should classify URLs', () => {
    expect(classifyUrl('https://example.com')).toBeUndefined();
    expect(classifyUrl('https://example.com/foo.css')).toBe('style');
    expect(classifyUrl('https://example.com/foo.js')).toBe('script');
    expect(classifyUrl('https://example.com/foo.wasm')).toBe('wasm');
    expect(classifyUrl('https://example.com/foo.woff2')).toBe('font');
    expect(classifyUrl('https://example.com/foo.png')).toBe('image');

    expect(classifyUrl('foo.css', 'https://example.com/')).toBe('style');
    expect(classifyUrl('foo.js', 'https://example.com/')).toBe('script');
    expect(classifyUrl('foo.wasm', 'https://example.com/')).toBe('wasm');
    expect(classifyUrl('foo.woff2?v=2', 'https://example.com/')).toBe('font');
    expect(classifyUrl('foo.svg#foo', 'https://example.com/')).toBe('image');
  });
});
