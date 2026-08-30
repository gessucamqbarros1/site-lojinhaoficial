import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from './phoneFormatter';

describe('formatPhoneNumber', () => {
  it('strips non-numeric characters before formatting', () => {
    expect(formatPhoneNumber('abc55def')).toBe('55');
  });

  it('formats a partial country code', () => {
    expect(formatPhoneNumber('5')).toBe('5');
  });

  it('formats a country code + area code prefix', () => {
    expect(formatPhoneNumber('551')).toBe('+55 (1');
  });

  it('formats a full BR mobile number', () => {
    expect(formatPhoneNumber('5511987654321')).toBe('+55 (11) 98765-4321');
  });

  it('ignores extra digits beyond the expected length', () => {
    expect(formatPhoneNumber('55119876543219999')).toBe('+55 (11) 98765-4321');
  });
});
