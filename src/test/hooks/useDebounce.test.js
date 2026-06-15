import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDebounce from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should debounce updates', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), { initialProps: { val: 'a' } });
    rerender({ val: 'ab' });
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('ab');
  });

  it('should cancel pending debounce on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('val', 300));
    expect(() => unmount()).not.toThrow();
  });
});
