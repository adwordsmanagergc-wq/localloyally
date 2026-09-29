import { FONTS, type Settings } from './business';

export function themeVars(s: Settings): React.CSSProperties {
  const f = FONTS[s.font] ?? FONTS.classic;
  return {
    '--bg': s.colors.bg, '--surface': s.colors.surface, '--ink': s.colors.ink, '--muted': s.colors.muted,
    '--accent': s.colors.accent, '--accent-ink': s.colors.accentInk, '--font-head': f.head, '--font-body': f.body,
  } as React.CSSProperties;
}

export function fontHref(s: Settings) {
  const f = FONTS[s.font] ?? FONTS.classic;
  return `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
}
