import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Vestido Floral')).toBe('vestido-floral');
  });

  it('strips accents', () => {
    expect(slugify('Saída de Praia')).toBe('saida-de-praia');
  });

  it('collapses repeated separators', () => {
    expect(slugify('a   b---c')).toBe('a-b-c');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --hello--  ')).toBe('hello');
  });

  it('returns an empty string for input with no alphanumerics', () => {
    expect(slugify('!!!')).toBe('');
  });
});
