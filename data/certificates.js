export const CERTIFICATES = [
  {
    slug: 'pmi',
    issuer: 'PMI',
    title: 'Project Management Ready™',
    glyph: "  ████  \n ██  ██ \n ██████ \n ██  ██ \n  ████  ",
  },
  {
    slug: 'sap',
    issuer: 'SAP',
    title: 'Certified Project Manager — SAP Activate',
    glyph: " ██████ \n██    ██\n ██████ \n      ██\n ██████ ",
  },
  {
    slug: 'certiport-python',
    issuer: 'Certiport',
    title: 'IT Specialist — Python',
    glyph: "██████  \n██  ██  \n██████  \n██      \n██      ",
  },
  {
    slug: 'anthropic-claude-code',
    issuer: 'Anthropic',
    title: 'Claude Code in Action',
    glyph: "  ███   \n █   █  \n █████  \n █   █  \n █   █  ",
  },
  {
    slug: 'google-gemini',
    issuer: 'Google',
    title: 'Gemini Certified University Student',
    glyph: " ██████ \n██      \n██  ███ \n██   ██ \n ██████ ",
  },
  {
    slug: 'mathworks-onramp',
    issuer: 'MathWorks',
    title: 'MATLAB Onramp',
    glyph: "██   ██ \n███  ██ \n██ █ ██ \n██  ███ \n██   ██ ",
  },
];

/** Drop certificate images in public/certificates/ using these filenames. */
export function certificateImagePath(slug) {
  return `/certificates/${slug}.png`;
}
