import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('React Testing Library setup', () => {
  it('renders and queries a React component', () => {
    function Hello() {
      return <div>Hello, react-soci-auth!</div>;
    }

    render(<Hello />);
    expect(screen.getByText('Hello, react-soci-auth!')).toBeInTheDocument();
  });
});
