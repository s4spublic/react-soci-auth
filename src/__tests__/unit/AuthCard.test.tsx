import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthCard } from '../../components/AuthCard';

describe('AuthCard', () => {
  describe('glassmorphism styles', () => {
    it('applies glassmorphism background with backdrop-filter blur', () => {
      render(<AuthCard>Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.backdropFilter).toContain('blur');
    });

    it('applies gradient background', () => {
      render(<AuthCard>Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.background).toContain('gradient');
    });

    it('applies box-shadow for soft shadows', () => {
      render(<AuthCard>Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.boxShadow).toBeTruthy();
    });

    it('applies border with glass border color', () => {
      render(<AuthCard>Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.border).toContain('solid');
    });
  });

  describe('title and subtitle', () => {
    it('renders title text at top of card', () => {
      render(<AuthCard title="Welcome">Content</AuthCard>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Welcome');
    });

    it('renders subtitle below title', () => {
      render(
        <AuthCard title="Welcome" subtitle="Sign in to continue">
          Content
        </AuthCard>,
      );
      expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    });

    it('does not render header section when no title or subtitle', () => {
      render(<AuthCard>Content</AuthCard>);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders subtitle without title', () => {
      render(<AuthCard subtitle="Just a subtitle">Content</AuthCard>);
      expect(screen.getByText('Just a subtitle')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders title without subtitle', () => {
      render(<AuthCard title="Only Title">Content</AuthCard>);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Only Title');
    });
  });

  describe('custom className and style', () => {
    it('applies custom className to root element', () => {
      render(<AuthCard className="my-card">Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.className).toContain('my-card');
    });

    it('merges custom style with base glassmorphism styles', () => {
      render(
        <AuthCard style={{ maxWidth: '400px', margin: '0 auto' }}>
          Content
        </AuthCard>,
      );
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.maxWidth).toBe('400px');
      expect(card.style.margin).toBe('0px auto');
      // Base styles should still be present
      expect(card.style.backdropFilter).toContain('blur');
    });
  });

  describe('mount animation', () => {
    it('applies mount animation style', () => {
      render(<AuthCard>Content</AuthCard>);
      const card = screen.getByTestId('soci-auth-card');
      expect(card.style.animation).toContain('soci-card-mount');
    });
  });

  describe('children rendering', () => {
    it('renders children content', () => {
      render(
        <AuthCard>
          <button>Sign in with Google</button>
        </AuthCard>,
      );
      expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
    });
  });

  describe('React.memo', () => {
    it('is wrapped with React.memo', () => {
      // React.memo components have a $$typeof of Symbol(react.memo)
      expect(AuthCard).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });
  });
});
