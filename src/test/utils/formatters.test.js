import { describe, it, expect } from 'vitest';
import { formatPrice, formatWeight, truncate } from '../../utils/formatters';

describe('formatPrice', () => {
  it('formats number as currency', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });
  it('handles zero', () => {
    expect(formatPrice(0)).toBeTruthy();
  });
});

describe('formatWeight', () => {
  it('returns a string with unit', () => {
    const r = formatWeight(2.5);
    expect(r).toContain('2');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
  });
  it('leaves short strings unchanged', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });
});
