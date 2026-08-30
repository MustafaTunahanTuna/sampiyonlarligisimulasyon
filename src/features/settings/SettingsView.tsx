import { LocaleSwitch } from '../../components/LocaleSwitch'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { useTranslation } from '../../i18n/useTranslation'
import { useSettings } from '../../state/useSettings'
import type { ReactNode } from 'react'

interface VolumeRowProps {
  label: string
  valueText: string
  value: number
  onChange: (next: number) => void
}

function VolumeRow({ label, valueText, value, onChange }: VolumeRowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-fg">{label}</span>
        <span className="font-display text-xs font-bold tabular-nums text-muted">{valueText}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="mt-2 w-full accent-accent"
      />
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel p-5">
      <h3 className="eyebrow text-accent">{title}</h3>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

export function SettingsView() {
  const t = useTranslation()
  const { settings, updateSettings } = useSettings()

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <header>
        <h2 className="font-display text-2xl font-extrabold text-fg">{t.settings.title}</h2>
        <p className="mt-1.5 text-sm text-muted">{t.settings.intro}</p>
      </header>

      <div className="mt-7 space-y-4">
        <SettingsSection title={t.settings.languageTitle}>
          <div className="flex items-center justify-between gap-4">
            <p className="max-w-sm text-sm text-muted">{t.settings.languageHint}</p>
            <LocaleSwitch />
          </div>
        </SettingsSection>

        <SettingsSection title={t.settings.matchTitle}>
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-sm">
              <p className="text-sm text-fg">{t.settings.replaysLabel}</p>
              <p className="mt-0.5 text-sm text-muted">{t.settings.replaysHint}</p>
            </div>
            <ToggleSwitch
              checked={settings.showReplays}
              label={t.settings.replaysLabel}
              stateText={settings.showReplays ? t.settings.switchOn : t.settings.switchOff}
              onChange={(next) => updateSettings({ showReplays: next })}
            />
          </div>
        </SettingsSection>

        <SettingsSection title={t.settings.audioTitle}>
          <p className="text-sm text-muted">{t.settings.audioHint}</p>
          <VolumeRow
            label={t.settings.ambienceLabel}
            valueText={t.settings.volumeValue(Math.round(settings.ambienceVolume * 100))}
            value={settings.ambienceVolume}
            onChange={(next) => updateSettings({ ambienceVolume: next })}
          />
          <VolumeRow
            label={t.settings.effectsLabel}
            valueText={t.settings.volumeValue(Math.round(settings.effectsVolume * 100))}
            value={settings.effectsVolume}
            onChange={(next) => updateSettings({ effectsVolume: next })}
          />
        </SettingsSection>
      </div>
    </div>
  )
}
