export type Project = {
  name: string;
  description: string;
  link: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    name: 'Personal Website',
    description: 'Minimalist website built with SvelteKit and TailwindCSS.',
    link: 'https://ricardojose.com.br',
    featured: true,
  },
  {
    name: 'Clock-in Helper',
    description: 'Chrome extension that streamlines hour logging on Beefor.',
    link: 'https://github.com/pxzin/clock-in-helper',
    featured: false,
  },
  {
    name: 'Casa Esfera',
    description:
      'Comprehensive personal software platform that integrates various services into a unified interface.',
    link: 'https://github.com/pxzin/casa-esfera',
    featured: true,
  },
  {
    name: 'Real-time Log Sender',
    description:
      'Frontend real-time log sender using native WebSocket, Node+Express, Redis and Elasticsearch.',
    link: 'https://ricardojose.com.br', // replace when repo is public
    featured: false,
  },
  // --- Suggested projects for portfolio ---
  {
    name: 'OTT Demo',
    description:
      'IN DEVELOPMENT – Whitelabel OTT demo app built with Svelte 5, LightningJS, and WebSockets, simulating a Netflix-style interface.',
    link: 'https://ricardojose.com.br',
    featured: true,
  },
  {
    name: 'Nutritionist Suite',
    description:
      'IN DEVELOPMENT – Web platform to help nutritionists manage patients, meal plans, and macros, built with SvelteKit and Node.',
    link: 'https://ricardojose.com.br',
    featured: false,
  },
  {
    name: 'VigiLar',
    description:
      'IN DEVELOPMENT – Home security app with RTSP video streaming, WebSockets, and AES-256 encrypted credentials.',
    link: 'https://ricardojose.com.br',
    featured: false,
  },
];
