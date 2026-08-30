import { describe, it, expect } from 'vitest';
import { getErrorMessage, cn } from './utils';

describe('getErrorMessage', () => {
  it('extracts the message from an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a plain string as-is', () => {
    expect(getErrorMessage('plain failure')).toBe('plain failure');
  });

  it('falls back to a generic message for unknown shapes', () => {
    expect(getErrorMessage({ weird: true })).toBe('Erro desconhecido');
    expect(getErrorMessage(null)).toBe('Erro desconhecido');
    expect(getErrorMessage(undefined)).toBe('Erro desconhecido');
  });
});

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    const disabled = false;
    expect(cn('a', disabled && 'b', undefined, 'c')).toBe('a c');
  });

  it('lets a later Tailwind class win over a conflicting earlier one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
