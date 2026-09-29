// Shared between server and browser (no database imports here).
export const STAMP_ICONS = ['bean', 'cup', 'leaf', 'star', 'heart', 'scissors', 'paw', 'bolt', 'slice', 'drop'] as const;
export const FONTS = {
  classic: { label: 'Classic serif', head: "'Cormorant Garamond', Georgia, serif", body: "'Inter', system-ui, sans-serif", google: 'Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600' },
  modern: { label: 'Modern', head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600' },
  rounded: { label: 'Friendly', head: "'Fredoka', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", google: 'Fredoka:wght@500;600&family=Nunito:wght@400;600;700' },
  editorial: { label: 'Editorial', head: "'Playfair Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif", google: 'Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;700' },
  bold: { label: 'Bold', head: "'Archivo Black', system-ui, sans-serif", body: "'Archivo', system-ui, sans-serif", google: 'Archivo+Black&family=Archivo:wght@400;500;600' },
} as const;
export const TEXTURES = ['pebble', 'paper', 'grid', 'none'] as const;

