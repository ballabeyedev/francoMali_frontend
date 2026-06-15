import { describe, it, expect } from 'vitest';
import { extractList, extractTotal, extractError } from '../../utils/apiHelpers';

describe('extractList', () => {
  it('extracts from named key', () => {
    expect(extractList({ data: { colis: [1, 2] } }, 'colis')).toEqual([1, 2]);
  });
  it('falls back to direct array', () => {
    expect(extractList({ data: [3, 4] })).toEqual([3, 4]);
  });
  it('returns empty array on null', () => {
    expect(extractList(null)).toEqual([]);
  });
});

describe('extractTotal', () => {
  it('extracts total from response', () => {
    expect(extractTotal({ data: { total: 42 } }, [])).toBe(42);
  });
  it('falls back to list length', () => {
    expect(extractTotal({}, [1, 2, 3])).toBe(3);
  });
});

describe('extractError', () => {
  it('extracts message from axios error', () => {
    const e = { response: { data: { message: 'Non autorisé' } } };
    expect(extractError(e)).toBe('Non autorisé');
  });
  it('falls back to generic message', () => {
    expect(extractError({})).toBe('Une erreur est survenue');
  });
});
