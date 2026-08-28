import { useEffect, useState } from 'react'
import styles from './ThemeSwitcher.module.css'

/**
 * Dev-only panel for auditioning site-wide themes. Flips the `data-theme`
 * attribute on <html> (see the presets in src/styles/globals.css) and lets you
 * nudge background / heading color live via inline overrides.
 *
 * Delete this component — and its mount in App.jsx — once a theme is chosen.
 */

const THEMES = [
  { id: 'midnight', label: 'Midnight (current)', swatch: ['#10141f', '#f2ead9'] },
  { id: 'charcoal', label: 'Charcoal', swatch: ['#1a1a1a', '#ffffff'] },
  { id: 'paper', label: 'Paper (light)', swatch: ['#f4f1ea', '#1b1917'] },
  { id: 'forest', label: 'Forest', swatch: ['#12180f', '#dfe9c8'] },
  { id: 'ember', label: 'Ember', swatch: ['#1d1917', '#f0b464'] },
]

// Tokens the sliders override inline on <html>; cleared on reset.
const OVERRIDES = ['--bg-dark', '--bg-darker', '--bg-card', '--heading-color']

// Embedding-viewer canvas: follow the page theme, or force light/dark.
const EMBED_MODES = [
  { id: 'auto', label: 'Auto' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
]

function readToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim() || '#000000'
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('demo-theme') || 'midnight'
  )
  const [open, setOpen] = useState(true)
  const [bg, setBg] = useState('#1a1a1a')
  const [heading, setHeading] = useState('#ffffff')
  const [embed, setEmbed] = useState(
    () => localStorage.getItem('demo-embed') || 'auto'
  )

  // Apply the preset, then re-sync the pickers to whatever it defines.
  useEffect(() => {
    const root = document.documentElement
    OVERRIDES.forEach((t) => root.style.removeProperty(t))
    // Midnight is what :root already carries, so it needs no attribute.
    if (theme === 'midnight') root.removeAttribute('data-theme')
    else root.dataset.theme = theme
    localStorage.setItem('demo-theme', theme)
    setBg(readToken('--bg-dark'))
    setHeading(readToken('--heading-color'))
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (embed === 'auto') root.removeAttribute('data-embed')
    else root.dataset.embed = embed
    localStorage.setItem('demo-embed', embed)
  }, [embed])

  const overrideBg = (value) => {
    setBg(value)
    document.documentElement.style.setProperty('--bg-dark', value)
  }

  const overrideHeading = (value) => {
    setHeading(value)
    document.documentElement.style.setProperty('--heading-color', value)
  }

  if (!open) {
    return (
      <button className={styles.reopen} onClick={() => setOpen(true)}>
        🎨
      </button>
    )
  }

  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <span className={styles.title}>Theme demo</span>
        <button className={styles.close} onClick={() => setOpen(false)}>
          ×
        </button>
      </header>

      <div className={styles.themes}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`${styles.themeButton} ${
              theme === t.id ? styles.themeActive : ''
            }`}
          >
            <span
              className={styles.swatch}
              style={{ background: t.swatch[0], color: t.swatch[1] }}
            >
              Aa
            </span>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <span>Embedding bg</span>
        <div className={styles.segmented}>
          {EMBED_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setEmbed(m.id)}
              className={embed === m.id ? styles.segmentActive : styles.segment}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span>Background</span>
        <input
          type="color"
          value={bg}
          onChange={(e) => overrideBg(e.target.value)}
        />
        <code>{bg}</code>
      </label>

      <label className={styles.field}>
        <span>Heading color</span>
        <input
          type="color"
          value={heading}
          onChange={(e) => overrideHeading(e.target.value)}
        />
        <code>{heading}</code>
      </label>

      <p className={styles.hint}>
        Dev only. Midnight is the baked-in default; the rest are previews.
      </p>
    </aside>
  )
}
