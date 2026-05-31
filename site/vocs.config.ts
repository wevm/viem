import * as fs from 'node:fs'
import { defineConfig, McpSource } from 'vocs/config'

import pkg from '../src/package.json' with { type: 'json' }
import { sidebar } from './sidebar.js'

const hasBuiltTypes = fs.existsSync(
  new URL('../src/_types/index.d.ts', import.meta.url),
)

export const sponsors = {
  collaborators: [
    { name: 'Paradigm', url: 'https://paradigm.xyz' },
    { name: 'Tempo', url: 'https://tempo.xyz' },
  ],
  largeEnterprise: [{ name: 'Stripe', url: 'https://www.stripe.com' }],
  smallEnterprise: [
    { name: 'Family', url: 'https://twitter.com/family' },
    { name: 'Context', url: 'https://twitter.com/context' },
    { name: 'PartyDAO', url: 'https://twitter.com/prtyDAO' },
    { name: 'SushiSwap', slug: 'sushi', url: 'https://www.sushi.com' },
    { name: 'Dynamic', url: 'https://www.dynamic.xyz' },
    { name: 'Privy', url: 'https://privy.io' },
    {
      name: 'PancakeSwap',
      slug: 'pancake',
      url: 'https://pancakeswap.finance',
    },
    { name: 'Pimlico', url: 'https://pimlico.io' },
    { name: 'Zora', url: 'https://zora.co' },
    { name: 'Syndicate', url: 'https://syndicate.io' },
    { name: 'Relay', url: 'https://relay.link' },
    { name: 'Polymarket', url: 'https://polymarket.com' },
    { name: 'Sequence', url: 'https://sequence.xyz' },
    { name: 'Web3Auth', url: 'https://web3auth.io' },
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
  // Committed twoslash cache lives at `site/.cache/twoslash` (see .gitignore).
  // Seeding Vercel's first build with a warm cache avoids the SSG OOM that
  // happens when twoslash has to re-resolve every snippet from scratch.
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
  mcp: {
    enabled: true,
    sources: [
      McpSource.github({ name: 'viem', repo: 'wevm/viem' }),
      McpSource.github({ name: 'wagmi', repo: 'wevm/wagmi' }),
      McpSource.github({ name: 'ox', repo: 'wevm/ox' }),
      McpSource.github({ name: 'tempo', repo: 'tempoxyz/tempo' }),
    ],
  },
  redirects: [
    // Strip legacy `.html` suffix from old bookmarked URLs.
    { source: '/:path*.html', destination: '/:path', status: 308 },

    // Renamed functions — keep deprecated paths working.
    {
      source: '/:match/hexToSignature',
      destination: '/:match/parseSignature',
      status: 308,
    },
    {
      source: '/:match/hexToCompactSignature',
      destination: '/:match/parseCompactSignature',
      status: 308,
    },
    {
      source: '/:match/signatureToHex',
      destination: '/:match/serializeSignature',
      status: 308,
    },
    {
      source: '/:match/compactSignatureToHex',
      destination: '/:match/serializeCompactSignature',
      status: 308,
    },
    {
      source: '/:match/getBytecode',
      destination: '/:match/getCode',
      status: 308,
    },
    {
      source: '/:match/accounts/createNonceManager',
      destination: '/:match/accounts/local/createNonceManager',
      status: 308,
    },
    {
      source: '/:match/accounts/custom',
      destination: '/:match/accounts/local/toAccount',
      status: 308,
    },
    {
      source: '/:match/accounts/mnemonic',
      destination: '/:match/accounts/local/mnemonicToAccount',
      status: 308,
    },
    {
      source: '/:match/accounts/privateKey',
      destination: '/:match/accounts/local/privateKeyToAccount',
      status: 308,
    },
    {
      source: '/:match/accounts/hd',
      destination: '/:match/accounts/local/hdKeyToAccount',
      status: 308,
    },
    {
      source: '/:match/accounts/signMessage',
      destination: '/:match/accounts/local/signMessage',
      status: 308,
    },
    {
      source: '/:match/accounts/signTransaction',
      destination: '/:match/accounts/local/signTransaction',
      status: 308,
    },
    {
      source: '/:match/accounts/signTypedData',
      destination: '/:match/accounts/local/signTypedData',
      status: 308,
    },
    {
      source: '/:match/experimental/eip5792/writeContracts',
      destination: '/:match/experimental/eip5792/sendCalls#contract-calls',
      status: 308,
    },
    {
      source: '/:match/simulate',
      destination: '/:match/simulateBlocks',
      status: 308,
    },

    // Section move.
    {
      source: '/experimental/eip5792/:path*',
      destination: '/docs/actions/wallet/:path',
      status: 308,
    },
  ],
  renderStrategy: 'dynamic',
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
  twoslash: {
    throws: false,
    twoslashOptions: {
      vfsRoot: '..',
      compilerOptions: {
        baseUrl: '.',
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        ...(hasBuiltTypes
          ? {}
          : {
              paths: {
                viem: ['../src/index.ts'],
                'viem/*': ['../src/*/index.ts', '../src/*.ts'],
              },
            }),
      },
      handbookOptions: {
        // FIXME: fix all twoslash errors.
        noErrors: true,
      },
    },
  },
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
})

function toPatchVersionRange(version: string) {
  const [major, minor] = version.split('.').slice(0, 2)
  return `${major}.${minor}.x`
}
