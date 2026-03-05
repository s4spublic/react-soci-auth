import React from 'react';
import type { DemoState } from '../hooks/useDemoState';
import type {
  ProviderName,
  ButtonVariant,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeMode,
  Alignment,
} from 'react-soci-auth';

interface ControlPanelProps {
  state: DemoState;
  setters: Record<string, (...args: any[]) => void>;
  onReset: () => void;
}

const PROVIDERS: ProviderName[] = ['google', 'apple', 'facebook', 'github'];

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px',
  padding: '12px',
  borderBottom: '1px solid #e2e8f0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#64748b',
  marginBottom: '10px',
};

const controlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#334155',
};

const radioGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '8px',
};

function RadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: T[];
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <div style={radioGroupStyle}>
      {options.map((opt) => (
        <label key={opt} style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  displayValue?: string;
}) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={controlRowStyle}>
        <span style={labelStyle}>{label}</span>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function CheckboxControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label style={{ ...controlRowStyle, cursor: 'pointer' }}>
      <span style={labelStyle}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function TextInputControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', ...labelStyle, marginBottom: '4px' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontSize: '14px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, setters, onReset }) => {
  return (
    <div style={{ padding: '16px' }}>
      {/* ─── Providers ─────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Providers</div>
        {PROVIDERS.map((provider) => (
          <CheckboxControl
            key={provider}
            label={provider.charAt(0).toUpperCase() + provider.slice(1)}
            checked={state.enabledProviders[provider]}
            onChange={() => setters.toggleProvider(provider)}
          />
        ))}
      </div>

      {/* ─── Button Style ──────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Button Style</div>
        <RadioGroup<ButtonVariant>
          name="buttonVariant"
          options={['text-only', 'icon-plus-text', 'icon-only']}
          value={state.buttonVariant}
          onChange={(val) => setters.setButtonVariant(val)}
        />
      </div>

      {/* ─── Layout ────────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Layout</div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Direction</span>
          <RadioGroup<'horizontal' | 'vertical'>
            name="direction"
            options={['horizontal', 'vertical']}
            value={state.direction}
            onChange={(val) => setters.setDirection(val)}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Layout Alignment</span>
          <RadioGroup<Alignment>
            name="alignment"
            options={['left', 'center', 'right']}
            value={state.alignment}
            onChange={(val) => setters.setAlignment(val)}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Content Alignment</span>
          <RadioGroup<Alignment>
            name="contentAlignment"
            options={['left', 'center', 'right']}
            value={state.contentAlignment}
            onChange={(val) => setters.setContentAlignment(val)}
          />
        </div>
        <SliderControl
          label="Spacing"
          value={state.spacing}
          min={0}
          max={48}
          step={1}
          onChange={(val) => setters.setSpacing(val)}
          displayValue={`${state.spacing}px`}
        />
        <CheckboxControl
          label="Show Labels"
          checked={state.showLabels}
          onChange={(val) => setters.setShowLabels(val)}
        />
        <CheckboxControl
          label="Show Dividers"
          checked={state.showDividers}
          onChange={(val) => setters.setShowDividers(val)}
        />
        <CheckboxControl
          label="Show Card"
          checked={state.showCard}
          onChange={(val) => setters.setShowCard(val)}
        />
      </div>

      {/* ─── Theme ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Theme</div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Mode</span>
          <RadioGroup<ThemeMode>
            name="themeMode"
            options={['light', 'dark']}
            value={state.themeMode}
            onChange={(val) => setters.setThemeMode(val)}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Button Shape</span>
          <RadioGroup<ButtonShape>
            name="buttonShape"
            options={['pill', 'rounded', 'square']}
            value={state.buttonShape}
            onChange={(val) => setters.setButtonShape(val)}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Icon Position</span>
          <RadioGroup<IconPosition>
            name="iconPosition"
            options={['left', 'right', 'top']}
            value={state.iconPosition}
            onChange={(val) => setters.setIconPosition(val)}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: '4px' }}>Size</span>
          <RadioGroup<ButtonSize>
            name="buttonSize"
            options={['small', 'medium', 'large']}
            value={state.buttonSize}
            onChange={(val) => setters.setButtonSize(val)}
          />
        </div>
      </div>

      {/* ─── Glass Effect ──────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Glass Effect</div>
        <SliderControl
          label="Opacity"
          value={state.glassOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => setters.setGlassOpacity(val)}
          displayValue={state.glassOpacity.toFixed(2)}
        />
      </div>

      {/* ─── Effects ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Effects</div>
        <CheckboxControl
          label="3D Depth"
          checked={state.enable3DDepth}
          onChange={(val) => setters.setEnable3DDepth(val)}
        />
        <CheckboxControl
          label="Hover Fill"
          checked={state.enableHoverFill}
          onChange={(val) => setters.setEnableHoverFill(val)}
        />
        {state.enableHoverFill && (
          <div style={{ marginBottom: '8px' }}>
            <div style={controlRowStyle}>
              <span style={labelStyle}>Fill Color</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={state.hoverFillColor}
                  onChange={(e) => setters.setHoverFillColor(e.target.value)}
                  style={{ width: '32px', height: '24px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{state.hoverFillColor}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Card Content ─────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Card Content</div>
        <TextInputControl
          label="Card Title"
          value={state.cardTitle}
          onChange={(val) => setters.setCardTitle(val)}
        />
        <TextInputControl
          label="Card Subtitle"
          value={state.cardSubtitle}
          onChange={(val) => setters.setCardSubtitle(val)}
        />
        <div style={{ marginBottom: '8px' }}>
          <div style={controlRowStyle}>
            <span style={labelStyle}>Title Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={state.cardTitleColor}
                onChange={(e) => setters.setCardTitleColor(e.target.value)}
                style={{ width: '32px', height: '24px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{state.cardTitleColor}</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div style={controlRowStyle}>
            <span style={labelStyle}>Subtitle Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={state.cardSubtitleColor.startsWith('rgba') ? '#b3b3b3' : state.cardSubtitleColor}
                onChange={(e) => setters.setCardSubtitleColor(e.target.value)}
                style={{ width: '32px', height: '24px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{state.cardSubtitleColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Button Text ──────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Button Text</div>
        <div style={{ marginBottom: '8px' }}>
          <div style={controlRowStyle}>
            <span style={labelStyle}>Text Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={state.buttonTextColor || '#1a1a2e'}
                onChange={(e) => setters.setButtonTextColor(e.target.value)}
                style={{ width: '32px', height: '24px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{state.buttonTextColor || 'default'}</span>
            </div>
          </div>
          {state.buttonTextColor && (
            <button
              onClick={() => setters.setButtonTextColor('')}
              style={{
                fontSize: '12px',
                color: '#6366f1',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              Reset to default
            </button>
          )}
        </div>
      </div>

      {/* ─── Button Labels ──────────────────────────────── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Button Labels</div>
        {PROVIDERS.filter((p) => state.enabledProviders[p]).map((provider) => (
          <TextInputControl
            key={provider}
            label={provider.charAt(0).toUpperCase() + provider.slice(1)}
            value={state.providerLabels[provider]}
            onChange={(val) => setters.setProviderLabel(provider, val)}
          />
        ))}
      </div>

      {/* ─── Reset ─────────────────────────────────────── */}
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ef4444',
          background: 'transparent',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        Reset to Defaults
      </button>
    </div>
  );
};

export default ControlPanel;
