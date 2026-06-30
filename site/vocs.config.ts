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

const badge = (kind: 'public' | 'test' | 'wallet') =>
  ({
    public: { text: 'Public', variant: 'info' as const },
    test: { text: 'Test', variant: 'warning' as const },
    wallet: { text: 'Wallet', variant: 'tip' as const },
  })[kind]

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

    // Renamed functions; keep deprecated paths working.
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
    {
      source: '/docs/actions/public/contract/deploy',
      destination: '/docs/actions/wallet/contract/deploy',
      status: 308,
    },
    {
      source: '/docs/actions/public/contract/deploySync',
      destination: '/docs/actions/wallet/contract/deploySync',
      status: 308,
    },
    {
      source: '/docs/actions/public/contract/write',
      destination: '/docs/actions/wallet/contract/write',
      status: 308,
    },
    {
      source: '/docs/actions/public/contract/writeSync',
      destination: '/docs/actions/wallet/contract/writeSync',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/send',
      destination: '/docs/actions/wallet/transaction/send',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sendRaw',
      destination: '/docs/actions/wallet/transaction/sendRaw',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sendRawSync',
      destination: '/docs/actions/wallet/transaction/sendRawSync',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sendSync',
      destination: '/docs/actions/wallet/transaction/sendSync',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sign',
      destination: '/docs/actions/wallet/transaction/sign',
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
        collapsed: true,
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
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/actions' },
          {
            text: 'Wallet Actions',
            link: '/docs/actions/wallet',
            badge: badge('wallet'),
          },
          {
            text: 'call',
            link: '/docs/actions/public/call',
            badge: badge('public'),
          },
          {
            text: 'Address',
            collapsed: true,
            items: [
              {
                text: 'getBalance',
                link: '/docs/actions/public/address/getBalance',
                badge: badge('public'),
              },
              {
                text: 'getCode',
                link: '/docs/actions/public/address/getCode',
                badge: badge('public'),
              },
              {
                text: 'getDelegation',
                link: '/docs/actions/public/address/getDelegation',
                badge: badge('public'),
              },
              {
                text: 'getProof',
                link: '/docs/actions/public/address/getProof',
                badge: badge('public'),
              },
              {
                text: 'getStorageAt',
                link: '/docs/actions/public/address/getStorageAt',
                badge: badge('public'),
              },
              {
                text: 'getTransactionCount',
                link: '/docs/actions/public/address/getTransactionCount',
                badge: badge('public'),
              },
              {
                text: 'impersonate',
                link: '/docs/actions/test/address/impersonate',
                badge: badge('test'),
              },
              {
                text: 'setBalance',
                link: '/docs/actions/test/address/setBalance',
                badge: badge('test'),
              },
              {
                text: 'setCode',
                link: '/docs/actions/test/address/setCode',
                badge: badge('test'),
              },
              {
                text: 'setNonce',
                link: '/docs/actions/test/address/setNonce',
                badge: badge('test'),
              },
              {
                text: 'setStorageAt',
                link: '/docs/actions/test/address/setStorageAt',
                badge: badge('test'),
              },
              {
                text: 'stopImpersonating',
                link: '/docs/actions/test/address/stopImpersonating',
                badge: badge('test'),
              },
            ],
          },
          {
            text: 'Block',
            collapsed: true,
            items: [
              {
                text: 'createFilter',
                link: '/docs/actions/public/block/createFilter',
                badge: badge('public'),
              },
              {
                text: 'get',
                link: '/docs/actions/public/block/get',
                badge: badge('public'),
              },
              {
                text: 'getAutomine',
                link: '/docs/actions/test/block/getAutomine',
                badge: badge('test'),
              },
              {
                text: 'getNumber',
                link: '/docs/actions/public/block/getNumber',
                badge: badge('public'),
              },
              {
                text: 'getReceipts',
                link: '/docs/actions/public/block/getReceipts',
                badge: badge('public'),
              },
              {
                text: 'getTransactionCount',
                link: '/docs/actions/public/block/getTransactionCount',
                badge: badge('public'),
              },
              {
                text: 'increaseTime',
                link: '/docs/actions/test/block/increaseTime',
                badge: badge('test'),
              },
              {
                text: 'mine',
                link: '/docs/actions/test/block/mine',
                badge: badge('test'),
              },
              {
                text: 'removeTimestampInterval',
                link: '/docs/actions/test/block/removeTimestampInterval',
                badge: badge('test'),
              },
              {
                text: 'setAutomine',
                link: '/docs/actions/test/block/setAutomine',
                badge: badge('test'),
              },
              {
                text: 'setCoinbase',
                link: '/docs/actions/test/block/setCoinbase',
                badge: badge('test'),
              },
              {
                text: 'setGasLimit',
                link: '/docs/actions/test/block/setGasLimit',
                badge: badge('test'),
              },
              {
                text: 'setIntervalMining',
                link: '/docs/actions/test/block/setIntervalMining',
                badge: badge('test'),
              },
              {
                text: 'setNextBaseFeePerGas',
                link: '/docs/actions/test/block/setNextBaseFeePerGas',
                badge: badge('test'),
              },
              {
                text: 'setNextTimestamp',
                link: '/docs/actions/test/block/setNextTimestamp',
                badge: badge('test'),
              },
              {
                text: 'setTimestampInterval',
                link: '/docs/actions/test/block/setTimestampInterval',
                badge: badge('test'),
              },
              {
                text: 'watch',
                link: '/docs/actions/public/block/watch',
                badge: badge('public'),
              },
              {
                text: 'watchNumber',
                link: '/docs/actions/public/block/watchNumber',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Chains',
            collapsed: true,
            items: [
              {
                text: 'getId',
                link: '/docs/actions/public/chains/getId',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Contract',
            collapsed: true,
            items: [
              {
                text: 'createEventFilter',
                link: '/docs/actions/public/contract/createEventFilter',
                badge: badge('public'),
              },
              {
                text: 'deploy',
                link: '/docs/actions/wallet/contract/deploy',
                badge: badge('wallet'),
              },
              {
                text: 'deploySync',
                link: '/docs/actions/wallet/contract/deploySync',
                badge: badge('wallet'),
              },
              {
                text: 'getEip712Domain',
                link: '/docs/actions/public/contract/getEip712Domain',
                badge: badge('public'),
              },
              {
                text: 'getLogs',
                link: '/docs/actions/public/contract/getLogs',
                badge: badge('public'),
              },
              {
                text: 'read',
                link: '/docs/actions/public/contract/read',
                badge: badge('public'),
              },
              {
                text: 'simulate',
                link: '/docs/actions/public/contract/simulate',
                badge: badge('public'),
              },
              {
                text: 'watchEvent',
                link: '/docs/actions/public/contract/watchEvent',
                badge: badge('public'),
              },
              {
                text: 'write',
                link: '/docs/actions/wallet/contract/write',
                badge: badge('wallet'),
              },
              {
                text: 'writeSync',
                link: '/docs/actions/wallet/contract/writeSync',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'Fee',
            collapsed: true,
            items: [
              {
                text: 'estimateFeesPerGas',
                link: '/docs/actions/public/fee/estimateFeesPerGas',
                badge: badge('public'),
              },
              {
                text: 'estimateMaxPriorityFeePerGas',
                link: '/docs/actions/public/fee/estimateMaxPriorityFeePerGas',
                badge: badge('public'),
              },
              {
                text: 'getBlobBaseFee',
                link: '/docs/actions/public/fee/getBlobBaseFee',
                badge: badge('public'),
              },
              {
                text: 'getGasPrice',
                link: '/docs/actions/public/fee/getGasPrice',
                badge: badge('public'),
              },
              {
                text: 'getHistory',
                link: '/docs/actions/public/fee/getHistory',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Filter',
            collapsed: true,
            items: [
              {
                text: 'getChanges',
                link: '/docs/actions/public/filter/getChanges',
                badge: badge('public'),
              },
              {
                text: 'getLogs',
                link: '/docs/actions/public/filter/getLogs',
                badge: badge('public'),
              },
              {
                text: 'uninstall',
                link: '/docs/actions/public/filter/uninstall',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Event',
            collapsed: true,
            items: [
              {
                text: 'createFilter',
                link: '/docs/actions/public/event/createFilter',
                badge: badge('public'),
              },
              {
                text: 'getLogs',
                link: '/docs/actions/public/event/getLogs',
                badge: badge('public'),
              },
              {
                text: 'watch',
                link: '/docs/actions/public/event/watch',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Node',
            collapsed: true,
            items: [
              {
                text: 'setLoggingEnabled',
                link: '/docs/actions/test/node/setLoggingEnabled',
                badge: badge('test'),
              },
              {
                text: 'setMinGasPrice',
                link: '/docs/actions/test/node/setMinGasPrice',
                badge: badge('test'),
              },
              {
                text: 'setRpcUrl',
                link: '/docs/actions/test/node/setRpcUrl',
                badge: badge('test'),
              },
            ],
          },
          {
            text: 'State',
            collapsed: true,
            items: [
              {
                text: 'dump',
                link: '/docs/actions/test/state/dump',
                badge: badge('test'),
              },
              {
                text: 'load',
                link: '/docs/actions/test/state/load',
                badge: badge('test'),
              },
              {
                text: 'reset',
                link: '/docs/actions/test/state/reset',
                badge: badge('test'),
              },
              {
                text: 'revert',
                link: '/docs/actions/test/state/revert',
                badge: badge('test'),
              },
              {
                text: 'snapshot',
                link: '/docs/actions/test/state/snapshot',
                badge: badge('test'),
              },
            ],
          },
          {
            text: 'Transaction',
            collapsed: true,
            items: [
              {
                text: 'createPendingFilter',
                link: '/docs/actions/public/transaction/createPendingFilter',
                badge: badge('public'),
              },
              {
                text: 'estimateGas',
                link: '/docs/actions/public/transaction/estimateGas',
                badge: badge('public'),
              },
              {
                text: 'fill',
                link: '/docs/actions/public/transaction/fill',
                badge: badge('public'),
              },
              {
                text: 'get',
                link: '/docs/actions/public/transaction/get',
                badge: badge('public'),
              },
              {
                text: 'getConfirmations',
                link: '/docs/actions/public/transaction/getConfirmations',
                badge: badge('public'),
              },
              {
                text: 'getReceipt',
                link: '/docs/actions/public/transaction/getReceipt',
                badge: badge('public'),
              },
              {
                text: 'prepare',
                link: '/docs/actions/public/transaction/prepare',
                badge: badge('public'),
              },
              {
                text: 'send',
                link: '/docs/actions/wallet/transaction/send',
                badge: badge('wallet'),
              },
              {
                text: 'sendRaw',
                link: '/docs/actions/wallet/transaction/sendRaw',
                badge: badge('wallet'),
              },
              {
                text: 'sendRawSync',
                link: '/docs/actions/wallet/transaction/sendRawSync',
                badge: badge('wallet'),
              },
              {
                text: 'sendSync',
                link: '/docs/actions/wallet/transaction/sendSync',
                badge: badge('wallet'),
              },
              {
                text: 'sign',
                link: '/docs/actions/wallet/transaction/sign',
                badge: badge('wallet'),
              },
              {
                text: 'waitForReceipt',
                link: '/docs/actions/public/transaction/waitForReceipt',
                badge: badge('public'),
              },
              {
                text: 'watchPending',
                link: '/docs/actions/public/transaction/watchPending',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Transaction Pool',
            collapsed: true,
            items: [
              {
                text: 'dropTransaction',
                link: '/docs/actions/test/txpool/dropTransaction',
                badge: badge('test'),
              },
              {
                text: 'getStatus',
                link: '/docs/actions/test/txpool/getStatus',
                badge: badge('test'),
              },
              {
                text: 'inspect',
                link: '/docs/actions/test/txpool/inspect',
                badge: badge('test'),
              },
            ],
          },
        ],
      },
      {
        text: 'Accounts',
        collapsed: true,
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
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/chains' },
          { text: 'Defining a Chain', link: '/docs/chains/create' },
          { text: 'Extending Chains', link: '/docs/chains/extend' },
          { text: 'Customizing Fees', link: '/docs/chains/fees' },
        ],
      },
      {
        text: 'Errors',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/errors' },
          { text: 'Base Error', link: '/docs/errors/base-error' },
          { text: 'Configuration', link: '/docs/errors/configuration' },
        ],
      },
      { ...sidebar.utilities, collapsed: true },
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
