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
  cream: '#AEE0F5', // page background — matches marketing site's body gradient top stop
  charcoal: '#2D3436',

  // accessible text colors: every text color must be at least 4.5:1 on white
  // and on the light blue page background. Use these instead of the bright
  // teal/gold or light grays for any text.
  muted: '#374151',    // secondary text (10.3:1 white, 7.3:1 light blue)
  tealDark: '#0F5C4E', // teal text, and teal buttons with white text (7.9:1)
  goldDark: '#6B4E08', // gold text (7.7:1 white, 5.4:1 light blue)
  ink: '#1F2937',      // text on gold backgrounds (6.6:1)

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
