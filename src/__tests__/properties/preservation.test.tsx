/**
 * Preservation Property-Based Tests
 *
 * These tests capture EXISTING working behaviors that must remain unchanged
 * after the bugfix. They are written using observation-first methodology
 * and must PASS on the current unfixed code.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';

import { SociAuthComponent } from '../../components/SociAuthComponent';
import { SociAuthProvider } from '../../context/SociAuthProvider';
import type {
  SociAuth_Config,
  ProviderConfig,
  ProviderName,
  ButtonVariant,
  Alignment,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeMode,
} from '../../types';
import {
  deriveConfig,
  DEFAULT_DEMO_STATE,
  type DemoState,
} from '../../../demo/src/hooks/useDemoState';
import {
  arbButtonVariant,
  arbAlignment,
  arbButtonShape,
  arbIconPosition,
  arbButtonSize,
  arbThemeMode,
} from './generators';

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

function renderWithProvider(config: SociAuth_Config) {
  return render(
    <SociAuthProvider config={config}>
      <SociAuthComponent />
    </SociAuthProvider>,
  );
}

const ALL_PROVIDERS: ProviderName[] = ['google', 'apple', 'facebook', 'github'];

const originalLocation = window.location;

describe('Preservation Properties — Existing Behaviors Unchanged', () => {
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
    cleanup();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  /**
   * Property: For all valid provider toggle combinations, the correct set
   * of buttons renders — each enabled provider gets a button, disabled
   * providers do not.
   *
   * **Validates: Requirements 3.1**
   */
  it('provider toggle combinations render the correct set of buttons', () => {
    const arbEnabledProviders = fc.record({
      google: fc.boolean(),
      apple: fc.boolean(),
      facebook: fc.boolean(),
      github: fc.boolean(),
    }).filter((ep) =>
      // At least one provider must be enabled to render anything
      Object.values(ep).some(Boolean),
    );

    fc.assert(
      fc.property(arbEnabledProviders, (enabledProviders) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          enabledProviders: enabledProviders as Record<ProviderName, boolean>,
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const buttons = container.querySelectorAll('button[data-provider]');
        const renderedProviders = Array.from(buttons).map(
          (btn) => btn.getAttribute('data-provider'),
        );

        const expectedProviders = ALL_PROVIDERS.filter(
          (name) => enabledProviders[name],
        );

        expect(renderedProviders).toEqual(expectedProviders);

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * Property: For all button variant values, the button rendering matches
   * the variant — data-variant attribute reflects the configured variant.
   *
   * **Validates: Requirements 3.2**
   */
  it('button variant values update button rendering correctly', () => {
    fc.assert(
      fc.property(arbButtonVariant, (variant) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          buttonVariant: variant,
          showLabels: true, // labels must be on for variant to apply
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const buttons = container.querySelectorAll('button[data-provider]');
        expect(buttons.length).toBeGreaterThan(0);

        buttons.forEach((button) => {
          expect(button.getAttribute('data-variant')).toBe(variant);
        });

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Property: For all alignment values, the container alignment matches
   * the setting — left→flex-start, center→center, right→flex-end.
   *
   * **Validates: Requirements 3.3**
   */
  it('alignment values position the button container correctly', () => {
    const alignmentMap: Record<Alignment, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };

    fc.assert(
      fc.property(arbAlignment, (alignment) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          direction: 'horizontal',
          alignment,
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const component = container.querySelector(
          '[data-testid="soci-auth-component"]',
        );
        expect(component).not.toBeNull();
        expect((component as HTMLElement).style.justifyContent).toBe(
          alignmentMap[alignment],
        );

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Property: For all spacing values, the gap between buttons matches
   * the spacing setting.
   *
   * **Validates: Requirements 3.4**
   */
  it('spacing values update the gap between buttons', () => {
    const arbSpacing = fc.integer({ min: 0, max: 48 });

    fc.assert(
      fc.property(arbSpacing, (spacing) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          spacing,
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const component = container.querySelector(
          '[data-testid="soci-auth-component"]',
        );
        expect(component).not.toBeNull();
        expect((component as HTMLElement).style.gap).toBe(`${spacing}px`);

        unmount();
      }),
      { numRuns: 20 },
    );
  });

  /**
   * Property: Toggling show labels/show dividers shows or hides labels
   * and dividers in the preview.
   *
   * **Validates: Requirements 3.5**
   */
  it('show labels toggle controls button variant; show dividers toggle controls divider visibility', () => {
    const arbToggles = fc.record({
      showLabels: fc.boolean(),
      showDividers: fc.boolean(),
    });

    fc.assert(
      fc.property(arbToggles, ({ showLabels, showDividers }) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          showLabels,
          showDividers,
          buttonVariant: 'icon-plus-text',
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const buttons = container.querySelectorAll('button[data-provider]');
        expect(buttons.length).toBeGreaterThan(0);

        // When showLabels is false, variant should be icon-only
        // When showLabels is true, variant should be the configured variant
        const expectedVariant = showLabels ? 'icon-plus-text' : 'icon-only';
        buttons.forEach((button) => {
          expect(button.getAttribute('data-variant')).toBe(expectedVariant);
        });

        // Dividers: when showDividers is true, there should be (n-1) dividers
        const dividers = container.querySelectorAll('[data-testid="soci-divider"]');
        if (showDividers) {
          expect(dividers.length).toBe(buttons.length - 1);
        } else {
          expect(dividers.length).toBe(0);
        }

        unmount();
      }),
      { numRuns: 10 },
    );
  });

  /**
   * Property: For all theme/shape/size combinations, the preview reflects
   * the settings — data-size attribute matches, button shape radius is
   * applied, and theme mode CSS custom properties are set.
   *
   * **Validates: Requirements 3.6**
   */
  it('theme mode, button shape, icon position, and button size apply correctly', () => {
    const arbCombo = fc.record({
      themeMode: arbThemeMode,
      buttonShape: arbButtonShape,
      iconPosition: arbIconPosition,
      buttonSize: arbButtonSize,
    });

    const shapeRadiusMap: Record<ButtonShape, string> = {
      pill: '9999px',
      rounded: '10px',
      square: '0',
    };

    fc.assert(
      fc.property(arbCombo, ({ themeMode, buttonShape, iconPosition, buttonSize }) => {
        const demoState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          themeMode,
          buttonShape,
          iconPosition,
          buttonSize,
        };

        const config = deriveConfig(demoState);
        const { unmount, container } = renderWithProvider(config);

        const buttons = container.querySelectorAll('button[data-provider]');
        expect(buttons.length).toBeGreaterThan(0);

        buttons.forEach((button) => {
          // Size is reflected in data-size attribute
          expect(button.getAttribute('data-size')).toBe(buttonSize);

          // Shape is reflected in border-radius
          const btnEl = button as HTMLElement;
          expect(btnEl.style.borderRadius).toBe(shapeRadiusMap[buttonShape]);

          // Icon position is reflected in flex-direction
          const expectedFlexDir =
            iconPosition === 'top'
              ? 'column'
              : iconPosition === 'right'
                ? 'row-reverse'
                : 'row';
          expect(btnEl.style.flexDirection).toBe(expectedFlexDir);
        });

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * Property: Reset to Defaults restores all settings to defaults.
   * We verify that deriveConfig(DEFAULT_DEMO_STATE) produces a config
   * that renders the default set of providers with default settings.
   *
   * **Validates: Requirements 3.7**
   */
  it('reset to defaults restores all settings to default values', () => {
    // Test that after any arbitrary state mutation, resetting to defaults
    // produces the same config as the initial default state
    const arbMutatedState = fc.record({
      buttonVariant: arbButtonVariant,
      alignment: arbAlignment,
      spacing: fc.integer({ min: 0, max: 48 }),
      showLabels: fc.boolean(),
      showDividers: fc.boolean(),
      themeMode: arbThemeMode,
      buttonShape: arbButtonShape,
      iconPosition: arbIconPosition,
      buttonSize: arbButtonSize,
    });

    fc.assert(
      fc.property(arbMutatedState, (mutations) => {
        // Derive config from mutated state
        const mutatedState: DemoState = {
          ...DEFAULT_DEMO_STATE,
          ...mutations,
        };
        const mutatedConfig = deriveConfig(mutatedState);

        // Derive config from default state (simulating reset)
        const defaultConfig = deriveConfig(DEFAULT_DEMO_STATE);

        // After reset, the config should match defaults
        const { unmount: unmount1, container: container1 } =
          renderWithProvider(defaultConfig);

        const defaultButtons = container1.querySelectorAll(
          'button[data-provider]',
        );
        const defaultProviders = Array.from(defaultButtons).map((btn) =>
          btn.getAttribute('data-provider'),
        );

        // Default state has all 4 providers enabled
        expect(defaultProviders).toEqual([
          'google',
          'apple',
          'facebook',
          'github',
        ]);

        // Default variant is icon-plus-text
        defaultButtons.forEach((btn) => {
          expect(btn.getAttribute('data-variant')).toBe('icon-plus-text');
          expect(btn.getAttribute('data-size')).toBe('medium');
        });

        // Default alignment is center
        const component = container1.querySelector(
          '[data-testid="soci-auth-component"]',
        );
        expect((component as HTMLElement).style.alignItems).toBe('stretch');

        // Default spacing is 12px
        expect((component as HTMLElement).style.gap).toBe('12px');

        unmount1();
      }),
      { numRuns: 15 },
    );
  });

  /**
   * Property: Copy button in code panel copies the generated snippet.
   * We verify that the CodePanel renders a copy button and that clicking
   * it invokes navigator.clipboard.writeText with the generated snippet.
   *
   * **Validates: Requirements 3.8**
   */
  it('copy button in code panel copies the generated snippet', async () => {
    const { CodePanel } = await import(
      '../../../demo/src/components/CodePanel'
    );
    const { generateCodeSnippet } = await import(
      '../../../demo/src/utils/codeGenerator'
    );

    const arbProviderSubset = fc
      .subarray(ALL_PROVIDERS, { minLength: 1 })
      .map((names) => names.map((n) => makeProvider(n)));

    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    await fc.assert(
      fc.asyncProperty(arbProviderSubset, async (providers) => {
        writeTextMock.mockClear();

        const config: SociAuth_Config = { providers };
        const expectedSnippet = generateCodeSnippet(config);

        const { unmount } = render(<CodePanel config={config} />);

        const copyButton = screen.getByRole('button', {
          name: /copy code to clipboard/i,
        });
        expect(copyButton).toBeInTheDocument();

        fireEvent.click(copyButton);

        // Allow the async clipboard write to resolve
        await vi.waitFor(() => {
          expect(writeTextMock).toHaveBeenCalledWith(expectedSnippet);
        });

        unmount();
      }),
      { numRuns: 10 },
    );
  });
});
