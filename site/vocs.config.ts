import { defineConfig } from 'vocs/config'

import pkg from '../src/package.json'
import { sidebar } from './sidebar'

export const sponsors = {
  collaborators: [
    { name: 'Paradigm', url: 'https://paradigm.xyz/' },
    { name: 'Tempo', url: 'https://tempo.xyz/' },
  ],
  largeEnterprise: [
    { name: 'Stripe', url: 'https://www.stripe.com/' },
    { name: 'Gemini', url: 'https://gemini.com/' },
  ],
  smallEnterprise: [
    { name: 'Family', url: 'https://twitter.com/family' },
    { name: 'Context', url: 'https://twitter.com/context' },
    { name: 'PartyDAO', url: 'https://twitter.com/prtyDAO' },
    { name: 'SushiSwap', slug: 'sushi', url: 'https://www.sushi.com/' },
    { name: 'Dynamic', url: 'https://www.dynamic.xyz/' },
    { name: 'Privy', url: 'https://privy.io/' },
    {
      name: 'PancakeSwap',
      slug: 'pancake',
      url: 'https://pancakeswap.finance/',
    },
    { name: 'Pimlico', url: 'https://pimlico.io/' },
    { name: 'Zora', url: 'https://zora.co/' },
    { name: 'Syndicate', url: 'https://syndicate.io/' },
    { name: 'Reservoir', url: 'https://reservoir.tools/' },
    { name: 'Uniswap', url: 'https://uniswap.org/' },
    { name: 'Polymarket', url: 'https://polymarket.com/' },
    { name: 'Sequence', url: 'https://sequence.xyz/' },
    { name: 'Routescan', url: 'https://routescan.io/' },
  ],
} as const

export default defineConfig({
  accentColor: 'light-dark(#ff9318, #ffc517)',
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
  cacheDir: '.cache',
  title: 'Viem',
  titleTemplate: '%s · Viem',
  description:
    'Build reliable Ethereum apps & libraries with lightweight, composable, & type-safe modules from viem.',
  editLink: {
    link: 'https://github.com/wevm/viem/edit/main/site/pages/:path',
    text: 'Suggest changes to this page',
  },
  ogImageUrl: (path, { baseUrl }) => {
    if (path === '/') return '/og-image.png'
    return `${baseUrl}/api/og?logo=%logo&title=%title&description=%description`
  },
  iconUrl: { light: '/favicons/light.png', dark: '/favicons/dark.png' },
  logoUrl: { light: '/icon-light.png', dark: '/icon-dark.png' },
  rootDir: '.',
  srcDir: '.',
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
  topNav: [
    { text: 'Docs', link: '/docs/getting-started', match: '/docs' },
    { text: 'Tempo', link: '/tempo', match: '/tempo' },
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
          text: 'USDC (Circle)',
          link: '/circle-usdc',
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
        {
          text: 'Examples',
          link: 'https://github.com/wevm/viem/tree/main/examples',
        },
      ],
    },
  ],
  twoslash: {
    twoslashOptions: {
      compilerOptions: {
        strict: true,
        module: 99,
        moduleResolution: 99,
        baseUrl: '.',
        paths: {
          viem: ['../src/index.ts'],
          'viem/*': ['../src/*'],
        },
      },
    },
  },
})

function toPatchVersionRange(version: string) {
  const [major, minor] = version.split('.').slice(0, 2)
  return `${major}.${minor}.x`
}
