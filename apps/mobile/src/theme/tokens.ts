/**
 * Design tokens ported from `Lend Ledger/app/tokens.css`.
 * oklch values converted to hex for React Native StyleSheet use.
 */

export interface ThemeTokens {
  bg: string;
  bgElev: string;
  surface: string;
  surface2: string;
  surfaceSunken: string;
  text: string;
  textSoft: string;
  textFaint: string;
  border: string;
  borderSoft: string;
  blue: string;
  blueStrong: string;
  green: string;
  greenStrong: string;
  amber: string;
  red: string;
  blueTint: string;
  greenTint: string;
  amberTint: string;
  redTint: string;
  barTrack: string;
  onGrad: string;
  scrim: string;
  gradPrimary: readonly [string, string];
  gradBlue: readonly [string, string];
  gradGreen: readonly [string, string];
  headerGrad: readonly [string, string, string];
  radiusCard: number;
  radiusLg: number;
  radiusPill: number;
  radiusInput: number;
}

const sharedRadii = {
  radiusCard: 18,
  radiusLg: 22,
  radiusPill: 999,
  radiusInput: 14,
} as const;

export const lightTokens: ThemeTokens = {
  bg: '#F5F7F9',
  bgElev: '#FAFCFE',
  surface: '#FFFFFF',
  surface2: '#F1F4F7',
  surfaceSunken: '#EAEDF1',
  text: '#192029',
  textSoft: '#515963',
  textFaint: '#80878F',
  border: '#DFE1E5',
  borderSoft: '#E9EBEE',
  blue: '#287CCF',
  blueStrong: '#1A67C2',
  green: '#22A56A',
  greenStrong: '#009157',
  amber: '#E19B34',
  red: '#D74745',
  blueTint: '#E1F0FF',
  greenTint: '#D8F7E6',
  amberTint: '#FFEBCA',
  redTint: '#FFE5E1',
  barTrack: '#AEB6C2',
  onGrad: '#FFFFFF',
  scrim: 'rgba(25,32,41,0.45)',
  gradPrimary: ['#3681D7', '#00A67C'],
  gradBlue: ['#3681D7', '#0075C9'],
  gradGreen: ['#24AB7E', '#009351'],
  headerGrad: ['#3D88DE', '#009799', '#00A57D'],
  ...sharedRadii,
};

export const darkTokens: ThemeTokens = {
  bg: '#0C0D10',
  bgElev: '#121417',
  surface: '#171A1D',
  surface2: '#1F2226',
  surfaceSunken: '#111316',
  text: '#F0F2F4',
  textSoft: '#A7ABB1',
  textFaint: '#767B82',
  border: '#2B2E33',
  borderSoft: '#222428',
  blue: '#5695E0',
  blueStrong: '#5695E0',
  green: '#4CB587',
  greenStrong: '#4CB587',
  amber: '#E4AC59',
  red: '#E3655A',
  blueTint: '#1B2F46',
  greenTint: '#123626',
  amberTint: '#432E08',
  redTint: '#47211D',
  barTrack: '#6B7480',
  onGrad: '#FFFFFF',
  scrim: 'rgba(0,0,0,0.6)',
  gradPrimary: ['#3972BC', '#008A67'],
  gradBlue: ['#3C75BF', '#1666AA'],
  gradGreen: ['#02906A', '#007E48'],
  headerGrad: ['#194781', '#004A50', '#00583D'],
  ...sharedRadii,
};

export function getTokensForTheme(theme: 'light' | 'dark'): ThemeTokens {
  return theme === 'light' ? lightTokens : darkTokens;
}
