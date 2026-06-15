import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useTitle from '../../hooks/useTitle';

describe('useTitle', () => {
  it('sets document title with suffix', () => {
    renderHook(() => useTitle('Dashboard'));
    expect(document.title).toBe('Dashboard — nanei Admin');
  });

  it('restores previous title on unmount', () => {
    document.title = 'Original';
    const { unmount } = renderHook(() => useTitle('Page'));
    unmount();
    expect(document.title).toBe('Original');
  });

  it('sets default title when no argument', () => {
    renderHook(() => useTitle(null));
    expect(document.title).toBe('nanei Admin');
  });
});
