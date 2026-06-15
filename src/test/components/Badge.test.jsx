import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../../components/common/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge variant="success">Actif</Badge>);
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  it('applies the correct class', () => {
    const { container } = render(<Badge variant="danger">Inactif</Badge>);
    expect(container.firstChild).toHaveClass('badge-danger');
  });

  it('has role status for accessibility', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
