import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Banner } from '../../components/Banner';

describe('Banner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('success message rendering', () => {
    it('renders a success banner with the provided message', () => {
      render(<Banner type="success" message="Login successful!" />);
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
      expect(screen.getByTestId('soci-banner-success')).toBeInTheDocument();
    });

    it('applies success color styling via CSS custom properties', () => {
      render(<Banner type="success" message="OK" />);
      const banner = screen.getByTestId('soci-banner-success');
      expect(banner.style.border).toContain('var(--soci-color-success');
    });
  });

  describe('error message rendering', () => {
    it('renders an error banner with the provided message', () => {
      render(<Banner type="error" message="Authentication failed" />);
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByTestId('soci-banner-error')).toBeInTheDocument();
    });

    it('applies error color styling via CSS custom properties', () => {
      render(<Banner type="error" message="Oops" />);
      const banner = screen.getByTestId('soci-banner-error');
      expect(banner.style.border).toContain('var(--soci-color-error');
    });
  });

  describe('auto-dismiss', () => {
    it('auto-dismisses after default 5000ms', () => {
      render(<Banner type="success" message="Done" />);
      expect(screen.getByTestId('soci-banner-success')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByTestId('soci-banner-success')).toBeNull();
    });

    it('auto-dismisses after custom duration', () => {
      render(<Banner type="error" message="Err" duration={2000} />);
      expect(screen.getByTestId('soci-banner-error')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(screen.getByTestId('soci-banner-error')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByTestId('soci-banner-error')).toBeNull();
    });
  });

  describe('onDismiss callback', () => {
    it('invokes onDismiss when auto-dismissed', () => {
      const onDismiss = vi.fn();
      render(<Banner type="success" message="OK" onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('invokes onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      render(<Banner type="error" message="Err" onDismiss={onDismiss} />);

      const dismissBtn = screen.getByTestId('soci-banner-dismiss');
      act(() => {
        dismissBtn.click();
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('soci-banner-error')).toBeNull();
    });
  });

  describe('ARIA live region', () => {
    it('has role="alert" for screen reader announcements', () => {
      render(<Banner type="success" message="Announced" />);
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent('Announced');
    });
  });

  describe('custom className and style', () => {
    it('applies custom className to root element', () => {
      render(<Banner type="success" message="OK" className="my-banner" />);
      const banner = screen.getByTestId('soci-banner-success');
      expect(banner.className).toContain('my-banner');
    });

    it('merges custom style with base styles', () => {
      render(<Banner type="error" message="Err" style={{ marginTop: '10px' }} />);
      const banner = screen.getByTestId('soci-banner-error');
      expect(banner.style.marginTop).toBe('10px');
      expect(banner.style.display).toBe('flex');
    });
  });

  describe('React.memo', () => {
    it('is wrapped with React.memo', () => {
      expect(Banner).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });
  });
});
