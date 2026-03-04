/**
 * Bug Condition Exploration Property-Based Tests
 *
 * These tests encode the EXPECTED (correct) behavior for seven bugs
 * identified in the demo app. On UNFIXED code, these tests are expected
 * to FAIL — failure confirms the bugs exist.
 *
 * DO NOT fix the code or the tests when they fail.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';

import { SociAuthComponent } from '../../components/SociAuthComponent';
import { SociAuthProvider } from '../../context/SociAuthProvider';
import { SocialButton } from '../../components/SocialButton';
import { AuthCard } from '../../components/AuthCard';
import { SociAuthContext, type SociAuthContextValue } from '../../context/SociAuthContext';
import { DEFAULT_THEME } from '../../defaults';
import type { SociAuth_Config, ProviderConfig, ProviderName } from '../../types';
import { deriveConfig, DEFAULT_DEMO_STATE, type DemoState } from '../../../demo/src/hooks/useDemoState';

// ─── Helpers ─────────────────────────────────────────────────────

function makeProvider(
  name: ProviderName,
  overrides?: Partial<ProviderConfig>,
): ProviderConfig {
  return {
    name,
    clientId: `${name}-client-id`,
    redirectUri: `https://example.com/callback/${name}`,
    ...overrides,
  };
}

function renderWithProvider(
  config: SociAuth_Config,
  props?: { className?: string; style?: React.CSSProperties },
) {
  return render(
    <SociAuthProvider config={config}>
      <SociAuthComponent {...props} />
    </SociAuthProvider>,
  );
}

const originalLocation = window.location;

describe('Bug Condition Exploration — Fault Conditions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        assign: vi.fn(),
        search: '',
        href: 'https://example.com',
        hash: '',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  /**
   * Bug 1: Direction setting is ignored — buttons always render in column.
   * **Validates: Requirements 1.1**
   *
   * Property: For any direction value ('horizontal' | 'vertical'), the button
   * container's flexDirection must match the expected mapping:
   *   'horizontal' → 'row', 'vertical' → 'column'
   */
  it('Bug 1: direction config controls button container flexDirection', () => {
    const arbDirection = fc.constantFrom<'horizontal' | 'vertical'>(
      'horizontal',
      'vertical',
    );

    fc.assert(
      fc.property(arbDirection, (direction) => {
        const config: SociAuth_Config = {
          providers: [makeProvider('google'), makeProvider('github')],
          layout: {
            alignment: 'center',
            spacing: '12px',
            showLabels: true,
            showDividers: false,
            direction,
          } as any, // direction doesn't exist on LayoutConfig yet
        };

        const { unmount, container } = renderWithProvider(config);

        // The inner div inside AuthCard holds the buttons
        const authCard = container.querySelector('[data-testid="soci-auth-card"]');
        const buttonContainer = authCard?.querySelector('div');

        const expectedFlexDirection =
          direction === 'horizontal' ? 'row' : 'column';

        expect(buttonContainer?.style.flexDirection).toBe(
          expectedFlexDirection,
        );

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Bug 2: Glass effect CSS custom properties not applied to button area.
   * **Validates: Requirements 1.2**
   *
   * Property: For any glass blur and opacity values set in config, the
   * SociAuthComponent container (or its button area) must have the
   * corresponding CSS custom properties applied.
   */
  it('Bug 2: glass effect CSS custom properties reach the button area container', () => {
    const arbGlassBlur = fc.integer({ min: 1, max: 30 }).map((n) => `${n}px`);
    const arbGlassOpacity = fc.double({ min: 0.01, max: 1, noNaN: true });

    fc.assert(
      fc.property(arbGlassBlur, arbGlassOpacity, (blur, opacity) => {
        const config: SociAuth_Config = {
          providers: [makeProvider('google')],
          theme: {
            glass: {
              blur,
              opacity,
              gradient: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)'],
              shadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          },
        };

        const { unmount, container } = renderWithProvider(config);

        const component = container.querySelector('[data-testid="soci-auth-component"]');
        expect(component).not.toBeNull();
        // The button area container should have glass CSS custom properties
        // applied either directly or via the style attribute
        const componentStyle = component!.getAttribute('style') || '';
        const hasGlassBlur =
          componentStyle.includes('--soci-glass-blur') ||
          componentStyle.includes('soci-glass-blur');
        const hasGlassOpacity =
          componentStyle.includes('--soci-glass-opacity') ||
          componentStyle.includes('soci-glass-opacity');

        expect(hasGlassBlur).toBe(true);
        expect(hasGlassOpacity).toBe(true);

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Bug 3: 3D depth toggle has no effect on buttons.
   * **Validates: Requirements 1.3**
   *
   * Property: When enable3DDepth is true in config, every SocialButton
   * element must have the 'soci-3d-depth' CSS class.
   */
  it('Bug 3: enable3DDepth applies soci-3d-depth CSS class to buttons', () => {
    const arbProviders = fc
      .subarray(['google', 'apple', 'facebook', 'github'] as ProviderName[], {
        minLength: 1,
      })
      .map((names) => names.map((n) => makeProvider(n)));

    fc.assert(
      fc.property(arbProviders, (providers) => {
        const config: SociAuth_Config = {
          providers,
          theme: {
            // enable3DDepth would need to be in config somewhere
          },
        };

        // Simulate enable3DDepth being true — this would need to flow through config
        // For now, we test via deriveConfig with enable3DDepth: true
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          enable3DDepth: true,
          enabledProviders: providers.reduce(
            (acc, p) => ({ ...acc, [p.name]: true }),
            { google: false, apple: false, facebook: false, github: false },
          ),
        };

        const derivedConfig = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(derivedConfig);

        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
        buttons.forEach((button) => {
          expect(button).toHaveClass('soci-3d-depth');
        });

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Bug 4: Card title/subtitle not passed to AuthCard.
   * **Validates: Requirements 1.4**
   *
   * Property: When cardTitle and cardSubtitle are set in DemoState,
   * deriveConfig includes them and AuthCard renders them.
   */
  it('Bug 4: cardTitle/cardSubtitle are rendered in AuthCard', () => {
    const arbTitle = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
    const arbSubtitle = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(arbTitle, arbSubtitle, (title, subtitle) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          cardTitle: title,
          cardSubtitle: subtitle,
        };

        const derivedConfig = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(derivedConfig);

        // Find the AuthCard element
        const authCard = container.querySelector('[data-testid="soci-auth-card"]');
        expect(authCard).not.toBeNull();

        // AuthCard should render the title as an h2 and subtitle as a p
        const heading = authCard!.querySelector('h2');
        const paragraph = authCard!.querySelector('p');

        expect(heading).not.toBeNull();
        expect(heading?.textContent).toBe(title);
        expect(paragraph).not.toBeNull();
        expect(paragraph?.textContent).toBe(subtitle);

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Bug 5: Buttons have inconsistent widths.
   * **Validates: Requirements 1.5**
   *
   * Property: In vertical layout, the button container uses alignItems: 'stretch'
   * to ensure uniform full-width sizing regardless of label length.
   */
  it('Bug 5: all SocialButton elements have uniform width in vertical layout', () => {
    const arbProviderSubset = fc
      .subarray(['google', 'apple', 'facebook', 'github'] as ProviderName[], {
        minLength: 2,
      })
      .map((names) => names.map((n) => makeProvider(n)));

    fc.assert(
      fc.property(arbProviderSubset, (providers) => {
        const config: SociAuth_Config = {
          providers,
          buttonVariant: 'icon-plus-text',
        };

        const { unmount, container } = renderWithProvider(config);

        // In vertical (default) layout, the container uses alignItems: 'stretch'
        // which makes all buttons full-width without needing explicit width: '100%'
        const component = container.querySelector('[data-testid="soci-auth-component"]');
        expect(component).not.toBeNull();
        expect((component as HTMLElement).style.alignItems).toBe('stretch');

        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Bug 6: CodePanel creates nested scroll with maxHeight + overflowY.
   * **Validates: Requirements 1.6**
   *
   * Property: The CodePanel's code block must NOT have maxHeight and
   * overflowY: 'auto' applied, which would create nested scroll regions.
   *
   * We test this by importing the CodePanel component and checking its
   * rendered output. Since CodePanel is a demo component, we import it
   * directly.
   */
  it('Bug 6: CodePanel does not apply maxHeight + overflowY creating nested scroll', async () => {
    // Import CodePanel dynamically to avoid module resolution issues
    const { CodePanel } = await import(
      '../../../demo/src/components/CodePanel'
    );

    fc.assert(
      fc.property(
        fc.record({
          providers: fc.constant([
            {
              name: 'google' as ProviderName,
              clientId: 'test',
              redirectUri: 'https://example.com',
            },
          ]),
        }),
        (configPart) => {
          const config: SociAuth_Config = {
            providers: configPart.providers,
          };

          const { unmount } = render(<CodePanel config={config} />);

          // Find the <pre> element (code block)
          const preElement = document.querySelector('pre');
          expect(preElement).not.toBeNull();

          // The code block should NOT have maxHeight + overflowY: 'auto'
          const hasMaxHeight = preElement?.style.maxHeight !== '';
          const hasOverflowY =
            preElement?.style.overflowY === 'auto' ||
            preElement?.style.overflowY === 'scroll';

          // If both are set, it creates nested scroll — this is the bug
          const hasNestedScroll = hasMaxHeight && hasOverflowY;
          expect(hasNestedScroll).toBe(false);

          unmount();
        },
      ),
      { numRuns: 5 },
    );
  });

  /**
   * Bug 7: Content section labels are ambiguous ("Title"/"Subtitle").
   * **Validates: Requirements 1.7**
   *
   * Property: The ControlPanel's Content section must use "Card Title"
   * and "Card Subtitle" labels instead of generic "Title" and "Subtitle".
   */
  it('Bug 7: Content section labels read "Card Title"/"Card Subtitle"', async () => {
    const { ControlPanel } = await import(
      '../../../demo/src/components/ControlPanel'
    );

    fc.assert(
      fc.property(
        fc.record({
          cardTitle: fc.string({ minLength: 0, maxLength: 20 }),
          cardSubtitle: fc.string({ minLength: 0, maxLength: 20 }),
        }),
        ({ cardTitle, cardSubtitle }) => {
          const state: DemoState = {
            ...DEFAULT_DEMO_STATE,
            cardTitle,
            cardSubtitle,
          };

          const setters: Record<string, (value: any) => void> = {};
          // Create no-op setters for all required keys
          for (const key of [
            'toggleProvider', 'setButtonVariant', 'setDirection',
            'setAlignment', 'setSpacing', 'setShowLabels', 'setShowDividers',
            'setThemeMode', 'setButtonShape', 'setIconPosition', 'setButtonSize',
            'setGlassBlur', 'setGlassOpacity', 'setEnable3DDepth',
            'setCardTitle', 'setCardSubtitle',
          ]) {
            setters[key] = vi.fn();
          }

          const { unmount } = render(
            <ControlPanel
              state={state}
              setters={setters}
              onReset={vi.fn()}
            />,
          );

          // Find all label elements in the rendered output
          const allLabels = document.querySelectorAll('label');
          const labelTexts = Array.from(allLabels).map(
            (el) => el.textContent?.trim() ?? '',
          );

          // The labels should be "Card Title" and "Card Subtitle",
          // NOT just "Title" and "Subtitle"
          expect(labelTexts).toContain('Card Title');
          expect(labelTexts).toContain('Card Subtitle');

          unmount();
        },
      ),
      { numRuns: 5 },
    );
  });
});
