import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordStrength from '../../components/common/PasswordStrength';

describe('PasswordStrength', () => {
  it('renders nothing when no password', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows weak for short password', () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText(/faible/i)).toBeInTheDocument();
  });

  it('shows strong for complex password', () => {
    render(<PasswordStrength password="Abcdef1!" />);
    expect(screen.getByText(/fort/i)).toBeInTheDocument();
  });
});
