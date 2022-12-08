import { defineConfig } from 'vitepress'

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

  themeConfig: {
    algolia: {
      appId: 'todo',
      apiKey: 'todo',
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

    sidebar: {
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Why viem', link: '/docs/introduction' },
            { text: 'Getting Started', link: '/docs/getting-started' },
          ],
        },
        {
          text: 'Clients & Transports',
          items: [
            { text: 'Introduction', link: '/docs/clients/intro' },
            { text: 'Public Client', link: '/docs/clients/public' },
            { text: 'Wallet Client', link: '/docs/clients/wallet' },
            { text: 'Test Client', link: '/docs/clients/test' },
            {
              text: 'Transports',
              items: [
                {
                  text: 'HTTP',
                  link: '/docs/clients/transports/http',
                },
                {
                  text: 'WebSocket',
                  link: '/docs/clients/transports/websocket',
                },
                {
                  text: 'Ethereum Provider (EIP-1193)',
                  link: '/docs/clients/transports/ethereum-provider',
                },
              ],
            },
          ],
        },
        {
          text: 'Public Actions',
          items: [
            { text: 'Introduction', link: '/docs/actions/public-actions' },
            { text: 'fetchBalance', link: '/docs/actions/fetchBalance' },
            { text: 'fetchBlock', link: '/docs/actions/fetchBlock' },
            {
              text: 'fetchBlockNumber',
              link: '/docs/actions/fetchBlockNumber',
            },
            {
              text: 'fetchTransaction',
              link: '/docs/actions/fetchTransaction',
            },
            {
              text: 'watchBlockNumber',
              link: '/docs/actions/watchBlockNumber',
            },
            { text: 'watchBlocks', link: '/docs/actions/watchBlocks' },
          ],
        },
        {
          text: 'Wallet Actions',
          items: [
            { text: 'Introduction', link: '/docs/actions/wallet-actions' },
            { text: 'requestAccounts', link: '/docs/actions/requestAccounts' },
            { text: 'sendTransaction', link: '/docs/actions/sendTransaction' },
          ],
        },
        {
          text: 'Test Actions',
          items: [
            { text: 'Introduction', link: '/docs/actions/test-actions' },
            { text: 'mine', link: '/docs/actions/mine' },
            { text: 'setBalance', link: '/docs/actions/setBalance' },
          ],
        },
        {
          text: 'Middlewares',
          items: [
            {
              text: 'withConfirmations',
              link: '/docs/middlewares/withConfirmations',
            },
          ],
        },
      ],
    },

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
