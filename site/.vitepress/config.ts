import { defineConfig } from 'vitepress'

import { sidebar } from './sidebar'

export default defineConfig({
  lang: 'en-US',

  title: 'viem',
  description: 'TypeScript Interface for Ethereum',

  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicons/light.png' }],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicons/dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  ],

  markdown: {
    theme: 'github-dark',
  },

  themeConfig: {
    algolia: {
      appId: 'B2GGTJJMD3',
      apiKey: '42f4bd06fd3343c9a742128af056bdf5',
      indexName: 'viem',
    },

    editLink: {
      pattern: 'https://github.com/wagmi-dev/viem/edit/main/site/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022 wagmi',
    },

    logo: { light: '/icon-light.png', dark: '/icon-dark.png' },

    nav: [
      { text: 'Docs', link: '/docs/getting-started', activeMatch: '/docs' },
      { text: 'Examples', link: '/examples' },
    ],

    outline: [2, 3],

    sidebar,

    siteTitle: false,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wagmi-dev/viem' },
    ],
  },

  vite: {
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  },
})
