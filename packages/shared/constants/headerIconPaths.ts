/**
 * SVG path data for header icon animations.
 * Source of truth: packages/shared/assets/icons/*.svg
 */
export const HEADER_ICON_PATHS = {
  globe: {
    body: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20 M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20 M2 12h20',
  },
  bell: {
    dome: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
    clapper: 'M10.3 21a1.94 1.94 0 0 0 3.4 0',
  },
  moon: {
    crescent: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z',
    stars: [
      'M10 1.5L10.6 2.8L12 3.2L10.6 3.6L10 5L9.4 3.6L8 3.2L9.4 2.8Z',
      'M19 4.5L19.5 5.6L20.6 6L19.5 6.4L19 7.5L18.5 6.4L17.4 6L18.5 5.6Z',
      'M7.5 14.5L8 15.5L9 15.9L8 16.3L7.5 17.5L7 16.3L6 15.9L7 15.5Z',
      'M20.5 12.5L21 13.4L21.9 13.8L21 14.2L20.5 15.2L20 14.2L19.1 13.8L20 13.4Z',
    ],
  },
  sun: {
    center: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    rays: 'M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41',
    raysHover:
      'M12 1v3 M12 21v2 M3.5 3.5l2 2 M18.5 18.5l2 2 M1 12h3 M21 12h2 M5 19l-2 2 M20 3.5l-2 2',
  },
  logout: {
    door: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
    doorOpen: 'M7 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2',
    chevron: 'M16 17L21 12L16 7',
    shaft: 'M21 12H9',
  },
} as const;

export type HeaderIconVariant = keyof typeof HEADER_ICON_PATHS;

/** @deprecated Use HeaderIconVariant */
export type HeaderIconName = HeaderIconVariant;
