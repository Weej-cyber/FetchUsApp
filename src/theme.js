// Shared brand theme — kept in sync with the FetchUs marketing site.
// If the site's palette or type system changes, update it here once
// rather than hunting through every component.

export const COLORS = {
  // brand
  indigo: '#182B4A',   // primary navy (was purple #5B4B8A)
  navyDeep: '#0F1F38', // darkest navy, page backgrounds (was #4A3880)
  navyDark: '#12203A', // dark navy for headings on light bg (was #3D2E6E)
  teal: '#2D9B8A',
  tealAlt: '#3DB89A',
  gold: '#D4A843',
  goldAlt: '#E8B84B',
  cream: '#FAF8F3',
  charcoal: '#2D3436',
  light: '#636e72',

  // status colors (unchanged — semantic, not brand-tinted)
  redBg: '#FEE2E2', red: '#991B1B',
  greenBg: '#D1FAE5', green: '#065F46',
  yellowBg: '#FEF9C3', yellow: '#92400E',

  // "purple" badge role, retained key name for compatibility;
  // value is now a navy tint instead of lavender
  purpleBg: '#E3EAF2', purple: '#1F3A5F',
}

export const FONTS = {
  display: "'Baloo 2', sans-serif",
  body: "'Nunito', sans-serif",
}
