import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, McpSource } from 'vocs/config'

import pkg from '../package.json' with { type: 'json' }
import * as sidebar from './sidebar.generated'

// Repo root, as an absolute path. Used for twoslash module resolution so the
// `viem` → live-source mapping resolves identically in both the rich and
// `checkOnly` twoslashers (whose relative `baseUrl` resolve against different
// directories).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig({
  accentColor: 'light-dark(#ff9318, #ffc517)',
  baseUrl:
    process.env.VERCEL_ENV === 'production'
      ? 'https://viem.sh'
      : process.env.VERCEL_URL,
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

    // Tempo Zones page moved into the Guides section.
    {
      source: '/tempo/zones',
      destination: '/tempo/guides/zones/connect',
      status: 308,
    },

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
  renderStrategy: 'partial-static',
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
  sidebar: {
    '/docs': [
      {
        text: 'Clients & Transports',
        items: [
          {
            text: 'Client',
            items: [
              { text: 'Overview', link: '/docs/clients' },
              { text: 'Creating a Client', link: '/docs/clients/create' },
            ],
          },
          {
            text: 'Transports',
            items: [
              { text: 'Overview', link: '/docs/transports' },
              { text: 'HTTP', link: '/docs/transports/http' },
              { text: 'WebSocket', link: '/docs/transports/websocket' },
              { text: 'IPC', link: '/docs/transports/ipc' },
              { text: 'Custom (EIP-1193)', link: '/docs/transports/custom' },
              { text: 'Fallback', link: '/docs/transports/fallback' },
              { text: 'Load Balance', link: '/docs/transports/load-balance' },
              { text: 'Rate Limit', link: '/docs/transports/rate-limit' },
            ],
          },
        ],
      },
      {
        text: 'Actions',
        items: [
          { text: 'Overview', link: '/docs/actions' },
          {
            text: 'Public',
            items: [
              { text: 'Overview', link: '/docs/actions/public' },
              { text: 'call', link: '/docs/actions/public/call' },
              {
                text: 'estimateFeesPerGas',
                link: '/docs/actions/public/estimateFeesPerGas',
              },
              {
                text: 'estimateMaxPriorityFeePerGas',
                link: '/docs/actions/public/estimateMaxPriorityFeePerGas',
              },
              { text: 'getBalance', link: '/docs/actions/public/getBalance' },
              {
                text: 'getBlobBaseFee',
                link: '/docs/actions/public/getBlobBaseFee',
              },
              { text: 'getBlock', link: '/docs/actions/public/getBlock' },
              {
                text: 'getBlockNumber',
                link: '/docs/actions/public/getBlockNumber',
              },
              {
                text: 'getBlockReceipts',
                link: '/docs/actions/public/getBlockReceipts',
              },
              {
                text: 'getBlockTransactionCount',
                link: '/docs/actions/public/getBlockTransactionCount',
              },
              { text: 'getChainId', link: '/docs/actions/public/getChainId' },
              { text: 'getCode', link: '/docs/actions/public/getCode' },
              {
                text: 'getDelegation',
                link: '/docs/actions/public/getDelegation',
              },
              {
                text: 'getEip712Domain',
                link: '/docs/actions/public/getEip712Domain',
              },
              {
                text: 'getFeeHistory',
                link: '/docs/actions/public/getFeeHistory',
              },
              { text: 'getGasPrice', link: '/docs/actions/public/getGasPrice' },
              { text: 'getLogs', link: '/docs/actions/public/getLogs' },
              { text: 'getProof', link: '/docs/actions/public/getProof' },
              {
                text: 'getStorageAt',
                link: '/docs/actions/public/getStorageAt',
              },
              {
                text: 'getTransaction',
                link: '/docs/actions/public/getTransaction',
              },
              {
                text: 'getTransactionConfirmations',
                link: '/docs/actions/public/getTransactionConfirmations',
              },
              {
                text: 'getTransactionCount',
                link: '/docs/actions/public/getTransactionCount',
              },
              {
                text: 'getTransactionReceipt',
                link: '/docs/actions/public/getTransactionReceipt',
              },
              {
                text: 'readContract',
                link: '/docs/actions/public/readContract',
              },
            ],
          },
          {
            text: 'Test',
            items: [
              { text: 'Overview', link: '/docs/actions/test' },
              {
                text: 'dropTransaction',
                link: '/docs/actions/test/dropTransaction',
              },
              { text: 'dumpState', link: '/docs/actions/test/dumpState' },
              { text: 'getAutomine', link: '/docs/actions/test/getAutomine' },
              {
                text: 'getTxpoolStatus',
                link: '/docs/actions/test/getTxpoolStatus',
              },
              {
                text: 'impersonateAccount',
                link: '/docs/actions/test/impersonateAccount',
              },
              { text: 'increaseTime', link: '/docs/actions/test/increaseTime' },
              {
                text: 'inspectTxpool',
                link: '/docs/actions/test/inspectTxpool',
              },
              { text: 'loadState', link: '/docs/actions/test/loadState' },
              { text: 'mine', link: '/docs/actions/test/mine' },
              {
                text: 'removeBlockTimestampInterval',
                link: '/docs/actions/test/removeBlockTimestampInterval',
              },
              { text: 'reset', link: '/docs/actions/test/reset' },
              { text: 'revert', link: '/docs/actions/test/revert' },
              { text: 'setAutomine', link: '/docs/actions/test/setAutomine' },
              { text: 'setBalance', link: '/docs/actions/test/setBalance' },
              {
                text: 'setBlockGasLimit',
                link: '/docs/actions/test/setBlockGasLimit',
              },
              {
                text: 'setBlockTimestampInterval',
                link: '/docs/actions/test/setBlockTimestampInterval',
              },
              { text: 'setCode', link: '/docs/actions/test/setCode' },
              { text: 'setCoinbase', link: '/docs/actions/test/setCoinbase' },
              {
                text: 'setIntervalMining',
                link: '/docs/actions/test/setIntervalMining',
              },
              {
                text: 'setLoggingEnabled',
                link: '/docs/actions/test/setLoggingEnabled',
              },
              {
                text: 'setMinGasPrice',
                link: '/docs/actions/test/setMinGasPrice',
              },
              {
                text: 'setNextBlockBaseFeePerGas',
                link: '/docs/actions/test/setNextBlockBaseFeePerGas',
              },
              {
                text: 'setNextBlockTimestamp',
                link: '/docs/actions/test/setNextBlockTimestamp',
              },
              { text: 'setNonce', link: '/docs/actions/test/setNonce' },
              { text: 'setRpcUrl', link: '/docs/actions/test/setRpcUrl' },
              {
                text: 'setStorageAt',
                link: '/docs/actions/test/setStorageAt',
              },
              { text: 'snapshot', link: '/docs/actions/test/snapshot' },
              {
                text: 'stopImpersonatingAccount',
                link: '/docs/actions/test/stopImpersonatingAccount',
              },
            ],
          },
        ],
      },
      {
        text: 'Accounts',
        items: [
          { text: 'Overview', link: '/docs/accounts' },
          { text: 'JSON-RPC Accounts', link: '/docs/accounts/json-rpc' },
          {
            text: 'Local Accounts',
            items: [
              {
                text: 'Private Key',
                link: '/docs/accounts/local/private-key',
              },
              { text: 'Mnemonic', link: '/docs/accounts/local/mnemonic' },
              {
                text: 'Hierarchical Deterministic',
                link: '/docs/accounts/local/hd',
              },
              { text: 'Custom', link: '/docs/accounts/local/custom' },
            ],
          },
        ],
      },
      {
        text: 'Chains',
        items: [
          { text: 'Overview', link: '/docs/chains' },
          { text: 'Defining a Chain', link: '/docs/chains/create' },
          { text: 'Extending Chains', link: '/docs/chains/extend' },
          { text: 'Customizing Fees', link: '/docs/chains/fees' },
        ],
      },
      {
        text: 'Errors',
        items: [
          { text: 'Overview', link: '/docs/errors' },
          { text: 'Base Error', link: '/docs/errors/base-error' },
          { text: 'Configuration', link: '/docs/errors/configuration' },
        ],
      },
      sidebar.utilities,
    ],
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
  twoslash: {
    twoslashOptions: {
      vfsRoot: root,
      compilerOptions: {
        baseUrl: root,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        // Resolve `viem` to live source so snippets type-check against the
        // working tree instead of the (potentially stale) built `dist/`.
        paths: {
          viem: [`${root}/src/index.ts`],
          'viem/*': [`${root}/src/*/index.ts`, `${root}/src/*.ts`],
        },
      },
    },
  },
  topNav: [
    { text: 'Docs', link: '/docs' },
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
