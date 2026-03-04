import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from '../../components/Divider';

describe('Divider', () => {
  describe('horizontal line rendering', () => {
    it('renders a separator element', () => {
      render(<Divider />);
      const divider = screen.getByTestId('soci-divider');
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveAttribute('role', 'separator');
    });

    it('renders a horizontal line when no label is provided', () => {
      render(<Divider />);
      const divider = screen.getByTestId('soci-divider');
      // Should have exactly one line (no label, no second line)
      const lines = divider.querySelectorAll('[aria-hidden="true"]');
      expect(lines).toHaveLength(1);
    });
  });

  describe('label rendering', () => {
    it('renders centered text label between two lines', () => {
      render(<Divider label="or continue with" />);
      expect(screen.getByText('or continue with')).toBeInTheDocument();
      const divider = screen.getByTestId('soci-divider');
      // Two lines flanking the label
      const lines = divider.querySelectorAll('[aria-hidden="true"]');
      expect(lines).toHaveLength(2);
    });

    it('does not render label span when label is not provided', () => {
      render(<Divider />);
      const divider = screen.getByTestId('soci-divider');
      expect(divider.querySelector('span')).toBeNull();
    });
  });

  describe('custom className and style', () => {
    it('applies custom className to root element', () => {
      render(<Divider className="my-divider" />);
      const divider = screen.getByTestId('soci-divider');
      expect(divider.className).toContain('my-divider');
    });

    it('merges custom style with base styles', () => {
      render(<Divider style={{ marginTop: '20px' }} />);
      const divider = screen.getByTestId('soci-divider');
      expect(divider.style.marginTop).toBe('20px');
      // Base styles should still be present
      expect(divider.style.display).toBe('flex');
    });
  });

  describe('theme adaptation', () => {
    it('uses CSS custom properties for border color', () => {
      render(<Divider />);
      const divider = screen.getByTestId('soci-divider');
      const line = divider.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(line.style.backgroundColor).toContain('var(--soci-color-border');
    });

    it('uses CSS custom properties for label text color', () => {
      render(<Divider label="or" />);
      const label = screen.getByText('or');
      expect(label.style.color).toContain('var(--soci-color-text-secondary');
    });
  });

  describe('React.memo', () => {
    it('is wrapped with React.memo', () => {
      expect(Divider).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });
  });
});
