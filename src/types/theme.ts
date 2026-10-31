export type ThemeId = 'obsidian' | 'mocha' | 'latte' | 'paper' | 'sonoma' | 'monastic';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  accent: string;
  tagline: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian HUD',
    isDark: true,
    accent: '#FF6363',
    tagline: 'Iconic pitch-black HUD with coral-red glow',
  },
  mocha: {
    id: 'mocha',
    name: 'Catppuccin Mocha',
    isDark: true,
    accent: '#CBA6F7',
    tagline: 'Comforting low-contrast pastel midnight',
  },
  latte: {
    id: 'latte',
    name: 'Catppuccin Latte',
    isDark: false,
    accent: '#8839EF',
    tagline: 'Warm soothing daytime paper with lavender accents',
  },
  paper: {
    id: 'paper',
    name: 'Editorial Paper',
    isDark: false,
    accent: '#E11D48',
    tagline: 'Crisp architectural white with crimson accents',
  },
  sonoma: {
    id: 'sonoma',
    name: 'Spatial Sonoma',
    isDark: true,
    accent: '#38BDF8',
    tagline: 'macOS frosted acrylic glass with specular rims',
  },
  monastic: {
    id: 'monastic',
    name: 'Linear Monastic',
    isDark: true,
    accent: '#10B981',
    tagline: 'Distraction-free high-density slate retreat',
  },
};
