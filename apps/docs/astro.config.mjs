// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';
import { globalSeoHead, SITE_DESCRIPTION, SITE_URL } from './src/seo.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [starlight({
    title: 'Grabkit',
    description: SITE_DESCRIPTION,
    logo: {
      src: './src/assets/logo.svg',
      alt: 'Grabkit',
      replacesTitle: false,
    },
    favicon: '/favicon.svg',
    customCss: ['./src/styles/fonts.css', './src/styles/custom.css'],
    defaultLocale: 'root',
    locales: {
      root: {
        label: 'English',
        lang: 'en-GB',
      },
    },
    social: [
      {
        icon: 'github',
        label: 'GitHub',
        href: 'https://github.com/mrlemoos/grabkit',
      },
      {
        icon: 'external',
        label: 'npm',
        href: 'https://www.npmjs.com/package/grabkit',
      },
    ],
    head: [
      ...globalSeoHead,
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: true,
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap',
        },
      },
    ],
    sidebar: [
      {
        label: 'Start',
        items: [
          { label: 'Introduction', slug: 'index' },
          { label: 'Getting started', slug: 'guides/getting-started' },
        ],
      },
      {
        label: 'Guides',
        items: [
          { label: 'JSON:API (default)', slug: 'guides/json-api' },
          { label: 'Plain JSON', slug: 'guides/plain-json' },
          { label: 'Configuration', slug: 'guides/configuration' },
          { label: 'Errors & results', slug: 'guides/errors' },
          {
            label: 'Migrating from react-grabkit',
            slug: 'guides/migrating-from-react-grabkit',
          },
        ],
      },
      {
        label: 'Reference',
        items: [
          { label: 'API', slug: 'reference' },
          { label: 'Changelog', slug: 'changelog' },
        ],
      },
    ],
      components: {
        Hero: './src/components/Hero.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
        Footer: './src/components/Footer.astro',
      },
  }), react()],
});