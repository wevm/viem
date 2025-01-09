import React from 'react'
import { defineConfig } from 'vocs'
import pkg from '../src/package.json'
import { sidebar, topNav } from './config-generated'

export default defineConfig({
  baseUrl:
    process.env.VERCEL_ENV === 'production'
      ? 'https://viem.sh'
      : process.env.VERCEL_URL,
  title: 'Viem',
  titleTemplate: '%s · Viem',
  description: 'TypeScript Library for Ethereum',
  head() {
    return (
      <script
        src="https://cdn.usefathom.com/script.js"
        data-site="BYCJMNBD"
        defer
      />
    )
  },
  ogImageUrl: {
    '/': '/og-image.png',
  },
  iconUrl: { light: '/icon-light.png', dark: '/icon-dark.png' },
  logoUrl: { light: '/icon-light.png', dark: '/icon-dark.png' },
  markdown: {
    code: {
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    },
  },
  rootDir: '.',
  sidebar: {
    '/': [
      { text: 'Introduction', link: '/' },
      {
        text: 'API Reference',
        items: [
          {
            text: 'Core',
            link: '/api',
          },
        ],
      },
    ],
    ...sidebar,
  },
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/wevm/viem',
    },
    {
      icon: 'discord',
      link: 'https://discord.gg/xCUz9FRcXD',
    },
    {
      icon: 'x',
      link: 'https://x.com/wevm_dev',
    },
  ],
  sponsors: [
    {
      name: 'Collaborator',
      height: 120,
      items: [
        [
          {
            name: 'Paradigm',
            link: 'https://paradigm.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/paradigm-light.svg',
          },
        ],
      ],
    },
    {
      name: 'Large Enterprise',
      height: 60,
      items: [
        [
          {
            name: 'Stripe',
            link: 'https://www.stripe.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/stripe-light.svg',
          },
          {
            name: 'ZKsync',
            link: 'https://zksync.io',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zksync-light.svg',
          },
        ],
        [
          {
            name: 'Brave',
            link: 'https://brave.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/brave-light.svg',
          },
          {
            name: 'Linea',
            link: 'https://linea.build',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/linea-light.svg',
          },
        ],
      ],
    },
    {
      name: 'Small Enterprise',
      height: 40,
      items: [
        [
          {
            name: 'Family',
            link: 'https://twitter.com/family',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/family-light.svg',
          },
          {
            name: 'Context',
            link: 'https://twitter.com/context',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/context-light.svg',
          },
          {
            name: 'WalletConnect',
            link: 'https://walletconnect.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/walletconnect-light.svg',
          },
          {
            name: 'PartyDAO',
            link: 'https://twitter.com/prtyDAO',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/partydao-light.svg',
          },
        ],
        [
          {
            name: 'SushiSwap',
            link: 'https://www.sushi.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/sushi-light.svg',
          },
          {
            name: 'Dynamic',
            link: 'https://www.dynamic.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/dynamic-light.svg',
          },
          {
            name: 'Privy',
            link: 'https://privy.io',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/privy-light.svg',
          },
          {
            name: 'PancakeSwap',
            link: 'https://pancakeswap.finance/',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pancake-light.svg',
          },
        ],
        [
          {
            name: 'Celo',
            link: 'https://celo.org',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/celo-light.svg',
          },
          {
            name: 'Rainbow',
            link: 'https://rainbow.me',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/rainbow-light.svg',
          },
          {
            name: 'Pimlico',
            link: 'https://pimlico.io',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pimlico-light.svg',
          },
          {
            name: 'Zora',
            link: 'https://zora.co',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zora-light.svg',
          },
        ],
        [
          {
            name: 'Lattice',
            link: 'https://lattice.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/lattice-light.svg',
          },
          {
            name: 'Supa',
            link: 'https://twitter.com/supafinance',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/supa-light.svg',
          },
          {
            name: 'Syndicate',
            link: 'https://syndicate.io',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/syndicate-light.svg',
          },
          {
            name: 'Reservoir',
            link: 'https://reservoir.tools',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/reservoir-light.svg',
          },
        ],
        [
          {
            name: 'Uniswap',
            link: 'https://uniswap.org',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/uniswap-light.svg',
          },
          {
            name: '',
            image: '',
            link: 'https://github.com/sponsors/wevm',
          },
          {
            name: '',
            image: '',
            link: 'https://github.com/sponsors/wevm',
          },
          {
            name: '',
            image: '',
            link: 'https://github.com/sponsors/wevm',
          },
        ],
      ],
    },
  ],
  theme: {
    accentColor: {
      light: '#4b7b2b',
      dark: '#bd976a',
    },
  },
  topNav: [
    ...topNav,
    {
      text: pkg.version,
      items: [
        {
          text: 'Changelog',
          link: 'https://github.com/wevm/viem/blob/main/src/CHANGELOG.md',
        },
        {
          text: 'Contributing',
          link: 'https://github.com/wevm/viem/blob/main/.github/CONTRIBUTING.md',
        },
      ],
    },
  ],
})
