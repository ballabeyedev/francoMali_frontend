import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/nanei/login', assign: vi.fn() },
  writable: true,
});

// Silence act() warnings
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
