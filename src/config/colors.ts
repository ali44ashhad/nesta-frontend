/**
 * Color Palette for Nesta Toys Platform
 * Extracted from design system
 */

export const colors = {
  // Grays (Left Column)
  limeGreen: '#7CCE1A',
  lightGray: '#dddddd',
  darkGray: '#545454',
  mediumDarkGray: '#3d3d3d',
  darkerGray: '#303030',
  veryDarkGray: '#1d1d1d',
  nearBlack: '#161616',
  veryDarkGrayBlack: '#070707',

  // Accent Colors (Right Column)
  purple: '#9335ed',
  brightBlue: '#3939ff',
  cyan: '#00c3dd',
  oliveGreen: '#9dbf51',
  brightYellow: '#ffd629',
  orange: '#ff9d00',
  redOrange: '#ff7517',
  red: '#e32626',
} as const;

// Export as individual named exports for convenience
export const {
  limeGreen,
  lightGray,
  darkGray,
  mediumDarkGray,
  darkerGray,
  veryDarkGray,
  nearBlack,
  veryDarkGrayBlack,
  purple,
  brightBlue,
  cyan,
  oliveGreen,
  brightYellow,
  orange,
  redOrange,
  red,
} = colors;

// Type for color keys
export type ColorKey = keyof typeof colors;

