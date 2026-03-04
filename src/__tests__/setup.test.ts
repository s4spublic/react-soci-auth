import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Project setup verification', () => {
  it('vitest runs correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('fast-check is available', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(a + b).toBe(b + a);
      }),
      { numRuns: 10 }
    );
  });
});
