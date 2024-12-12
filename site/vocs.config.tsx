import * as React from 'react'
import { defineConfig } from 'vocs'
import pkg from '../src/package.json'
import { sidebar } from './sidebar'

export default defineConfig({
  // banner: {
  //   backgroundColor: '#3a393b',
  //   textColor: 'white',
  //   content:
  //     'Viem is participating in Gitcoin Grants round 21. Consider [supporting the project](https://explorer.gitcoin.co/#/round/42161/389/73). Thank you. 🙏',
  // },
  baseUrl:
    process.env.VERCEL_ENV === 'production'
      ? 'https://viem.sh'
      : process.env.VERCEL_URL,
  title: 'Viem',
  titleTemplate: '%s · Viem',
  description:
    'Build reliable Ethereum apps & libraries with lightweight, composable, & type-safe modules from viem.',
  editLink: {
    pattern: 'https://github.com/wevm/viem/edit/main/site/pages/:path',
    text: 'Suggest changes to this page',
  },
  head() {
    return (
      <>
        <script
          src="https://cdn.usefathom.com/script.js"
          data-site="BYCJMNBD"
          defer
        />
      </>
    )
  },
  ogImageUrl: {
    '/': '/og-image.png',
    '/docs':
      'https://vocs.dev/api/og?logo=%logo&title=%title&description=%description',
    '/op-stack':
      'https://vocs.dev/api/og?logo=%logo&title=%title&description=%description',
  },
  iconUrl: { light: '/favicons/light.png', dark: '/favicons/dark.png' },
  logoUrl: { light: '/icon-light.png', dark: '/icon-dark.png' },
  rootDir: '.',
  search: {
    boostDocument(documentId) {
      if (documentId.startsWith('pages/docs')) return 3
      if (documentId.startsWith('pages/account-abstraction')) return 2
      if (documentId.startsWith('pages/experimental')) return 2
      return 1
    },
  },
  sidebar,
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
          {
            name: 'Ithaca',
            link: 'https://ithaca.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/ithaca-light.svg',
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
          {
            name: 'Brave',
            link: 'https://brave.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/brave-light.svg',
          },
        ],
        [
          {
            name: 'Linea',
            link: 'https://linea.build',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/linea-light.svg',
          },
          {
            name: 'Routescan',
            link: 'https://routescan.io',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/routescan-light.svg',
          },
          {
            name: '',
            link: 'https://github.com/sponsors/wevm',
            image: '',
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
            name: 'Biconomy',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/biconomy-light.svg',
            link: 'https://biconomy.io',
          },
          {
            name: 'Thirdweb',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/thirdweb-light.svg',
            link: 'https://thirdweb.com',
          },
          {
            name: 'Uxuy',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/uxuy-light.svg',
            link: 'https://uxuy.com',
          },
        ],
        [
          {
            name: 'Polymarket',
            link: 'https://polymarket.com',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/polymarket-light.svg',
          },
          {
            name: '',
            link: 'https://github.com/sponsors/wevm',
            image: '',
          },
          {
            name: '',
            link: 'https://github.com/sponsors/wevm',
            image: '',
          },
          {
            name: '',
            link: 'https://github.com/sponsors/wevm',
            image: '',
          },
        ],
      ],
    },
  ],
  theme: {
    accentColor: {
      light: '#ff9318',
      dark: '#ffc517',
    },
  },
  topNav: [
    { text: 'Docs', link: '/docs/getting-started', match: '/docs' },
    {
      text: 'Extensions',
      items: [
        {
          text: 'Account Abstraction',
          link: '/account-abstraction',
        },
        {
          text: 'OP Stack',
          link: '/op-stack',
        },
        {
          text: 'ZKsync',
          link: '/zksync',
        },
        {
          text: 'Experimental',
          link: '/experimental',
        },
      ],
    },
    {
      text: 'Examples',
      link: 'https://github.com/wevm/viem/tree/main/examples',
    },
    {
      text: pkg.version,
      items: [
        {
          text: `Migrating to ${toPatchVersionRange(pkg.version)}`,
          link: `/docs/migration-guide#_${toPatchVersionRange(
            pkg.version,
          ).replace(/\./g, '-')}-breaking-changes`,
        },
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

function toPatchVersionRange(version: string) {
  const [major, minor] = version.split('.').slice(0, 2)
  return `${major}.${minor}.x`
}
