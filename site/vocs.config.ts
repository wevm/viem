import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  defineConfig,
  Embedding,
  McpSource,
  Reranker,
  Retriever,
  VectorStore,
} from 'vocs/config'

import pkg from '../package.json' with { type: 'json' }
import * as sidebar from './sidebar.generated'

// Load `site/.env` (e.g. `CLOUDFLARE_*` for AI search). No-op if absent.
try {
  process.loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)))
} catch {}

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

    // Migration guide moved under docs.
    {
      source: '/v2-migration',
      destination: '/docs/v2-migration',
      status: 308,
    },

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
      source: '/docs/actions/public/simulate',
      destination: '/docs/actions/public/block/simulate',
      status: 308,
    },
    {
      source: '/docs/actions/public/simulateBlocks',
      destination: '/docs/actions/public/block/simulate',
      status: 308,
    },
    {
      source: '/docs/contract/multicall',
      destination: '/docs/actions/public/multicall',
      status: 308,
    },
    {
      source: '/docs/actions/public/simulateCalls',
      destination: '/docs/actions/public/multicall',
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
  ai: {
    retriever: Retriever.local({
      embedding: Embedding.cloudflare(),
      reranker: Reranker.cloudflare(),
      sources: [
        { url: 'https://wagmi.sh/llms.txt', label: 'wagmi', weight: 0.8 },
      ],
      // Remote store keeps vectors out of the server bundle entirely.
      vectorStore: VectorStore.cloudflare({ index: 'viem-docs' }),
    }),
  },
  sidebar: {
    '/docs': [
      { text: 'Migrating from v2', link: '/docs/v2-migration' },
      {
        text: 'Clients & Transports',
        collapsed: false,
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
                text: 'simulate',
                link: '/docs/actions/public/block/simulate',
                badge: badge('public'),
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
            text: 'Call',
            collapsed: true,
            items: [
              {
                text: 'call',
                link: '/docs/actions/public/call',
                badge: badge('public'),
              },
              {
                text: 'multicall',
                link: '/docs/actions/public/multicall',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Chains',
            collapsed: true,
            items: [
              {
                text: 'add',
                link: '/docs/actions/wallet/chains/add',
                badge: badge('wallet'),
              },
              {
                text: 'getId',
                link: '/docs/actions/public/chains/getId',
                badge: badge('public'),
              },
              {
                text: 'switch',
                link: '/docs/actions/wallet/chains/switch',
                badge: badge('wallet'),
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
                text: 'estimateGas',
                link: '/docs/actions/public/contract/estimateGas',
                badge: badge('public'),
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
            text: 'ENS',
            collapsed: true,
            items: [
              {
                text: 'getAddress',
                link: '/docs/actions/public/ens/getAddress',
                badge: badge('public'),
              },
              {
                text: 'getAvatar',
                link: '/docs/actions/public/ens/getAvatar',
                badge: badge('public'),
              },
              {
                text: 'getName',
                link: '/docs/actions/public/ens/getName',
                badge: badge('public'),
              },
              {
                text: 'getResolver',
                link: '/docs/actions/public/ens/getResolver',
                badge: badge('public'),
              },
              {
                text: 'getText',
                link: '/docs/actions/public/ens/getText',
                badge: badge('public'),
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
            text: 'Sign & Verify',
            collapsed: true,
            items: [
              {
                text: 'signMessage',
                link: '/docs/actions/wallet/signMessage',
                badge: badge('wallet'),
              },
              {
                text: 'signTransaction',
                link: '/docs/actions/wallet/signTransaction',
                badge: badge('wallet'),
              },
              {
                text: 'signTypedData',
                link: '/docs/actions/wallet/signTypedData',
                badge: badge('wallet'),
              },
              {
                text: 'verifyHash',
                link: '/docs/actions/public/verifyHash',
                badge: badge('public'),
              },
              {
                text: 'verifyMessage',
                link: '/docs/actions/public/verifyMessage',
                badge: badge('public'),
              },
              {
                text: 'verifySiweMessage',
                link: '/docs/actions/public/verifySiweMessage',
                badge: badge('public'),
              },
              {
                text: 'verifyTypedData',
                link: '/docs/actions/public/verifyTypedData',
                badge: badge('public'),
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
            text: 'Token',
            collapsed: true,
            items: [
              {
                text: 'approve',
                link: '/docs/actions/wallet/token/approve',
                badge: badge('wallet'),
              },
              {
                text: 'approveSync',
                link: '/docs/actions/wallet/token/approveSync',
                badge: badge('wallet'),
              },
              {
                text: 'getAllowance',
                link: '/docs/actions/public/token/getAllowance',
                badge: badge('public'),
              },
              {
                text: 'getBalance',
                link: '/docs/actions/public/token/getBalance',
                badge: badge('public'),
              },
              {
                text: 'getMetadata',
                link: '/docs/actions/public/token/getMetadata',
                badge: badge('public'),
              },
              {
                text: 'getTotalSupply',
                link: '/docs/actions/public/token/getTotalSupply',
                badge: badge('public'),
              },
              {
                text: 'transfer',
                link: '/docs/actions/wallet/token/transfer',
                badge: badge('wallet'),
              },
              {
                text: 'transferSync',
                link: '/docs/actions/wallet/token/transferSync',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'Transaction',
            collapsed: true,
            items: [
              {
                text: 'createAccessList',
                link: '/docs/actions/public/transaction/createAccessList',
                badge: badge('public'),
              },
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
                text: 'getRaw',
                link: '/docs/actions/public/transaction/getRaw',
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
          {
            text: 'Wallet',
            collapsed: true,
            items: [
              {
                text: 'connect',
                link: '/docs/actions/wallet/connect',
                badge: badge('wallet'),
              },
              {
                text: 'disconnect',
                link: '/docs/actions/wallet/disconnect',
                badge: badge('wallet'),
              },
              {
                text: 'getAddresses',
                link: '/docs/actions/wallet/getAddresses',
                badge: badge('wallet'),
              },
              {
                text: 'getAssets',
                link: '/docs/actions/wallet/getAssets',
                badge: badge('wallet'),
              },
              {
                text: 'getCallsStatus',
                link: '/docs/actions/wallet/getCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'getCapabilities',
                link: '/docs/actions/wallet/getCapabilities',
                badge: badge('wallet'),
              },
              {
                text: 'getPermissions',
                link: '/docs/actions/wallet/getPermissions',
                badge: badge('wallet'),
              },
              {
                text: 'prepareAuthorization',
                link: '/docs/actions/wallet/prepareAuthorization',
                badge: badge('wallet'),
              },
              {
                text: 'requestAddresses',
                link: '/docs/actions/wallet/requestAddresses',
                badge: badge('wallet'),
              },
              {
                text: 'requestPermissions',
                link: '/docs/actions/wallet/requestPermissions',
                badge: badge('wallet'),
              },
              {
                text: 'sendCalls',
                link: '/docs/actions/wallet/sendCalls',
                badge: badge('wallet'),
              },
              {
                text: 'sendCallsSync',
                link: '/docs/actions/wallet/sendCallsSync',
                badge: badge('wallet'),
              },
              {
                text: 'showCallsStatus',
                link: '/docs/actions/wallet/showCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'signAuthorization',
                link: '/docs/actions/wallet/signAuthorization',
                badge: badge('wallet'),
              },
              {
                text: 'waitForCallsStatus',
                link: '/docs/actions/wallet/waitForCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'watchAsset',
                link: '/docs/actions/wallet/watchAsset',
                badge: badge('wallet'),
              },
            ],
          },
        ],
      },
      {
        text: 'Contract',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/contract' },
          { text: 'Contract Instances', link: '/docs/contract/instances' },
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
          { text: 'Nonce Manager', link: '/docs/accounts/nonce-manager' },
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
        text: 'Tokens',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/tokens' },
          { text: 'Defining a Token', link: '/docs/tokens/create' },
        ],
      },
      {
        text: 'ERCs',
        collapsed: true,
        items: [
          {
            text: 'ERC-7821',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/actions/erc7821' },
              {
                text: 'execute',
                link: '/docs/actions/erc7821/execute',
              },
              {
                text: 'executeBatches',
                link: '/docs/actions/erc7821/executeBatches',
              },
              {
                text: 'supportsExecutionMode',
                link: '/docs/actions/erc7821/supportsExecutionMode',
              },
            ],
          },
        ],
      },
      {
        text: 'Errors',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/errors' },
          { text: 'Base Error', link: '/docs/errors/base-error' },
          { text: 'Configuration', link: '/docs/errors/configuration' },
          { text: 'Contract Errors', link: '/docs/errors/contract' },
          { text: 'RPC Errors', link: '/docs/errors/rpc' },
        ],
      },
      { ...sidebar.utilities, collapsed: true },
    ],
    '/tokens': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/tokens' },
          { text: 'Tokens', link: '/tokens/tokens' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Overview', link: '/tokens/guides' },
          {
            text: 'Importing Tokens',
            link: '/tokens/guides/importing-tokens',
          },
          {
            text: 'Defining Tokens',
            link: '/tokens/guides/defining-tokens',
          },
          { text: 'Get Balances', link: '/tokens/guides/get-balances' },
          {
            text: 'Transfer Tokens',
            link: '/tokens/guides/transfer-tokens',
          },
          {
            text: 'Approve Spending',
            link: '/tokens/guides/approve-spending',
          },
          {
            text: 'TIP-20 (Tempo)',
            collapsed: true,
            items: [
              {
                text: 'Create a TIP-20 Token',
                link: '/tokens/guides/tempo/create-token',
              },
              {
                text: 'Mint & Burn Tokens',
                link: '/tokens/guides/tempo/manage-token-balances',
              },
              {
                text: 'Transfer Tokens',
                link: '/tokens/guides/tempo/transfer-tokens',
              },
              {
                text: 'Manage Token Roles & Supply',
                link: '/tokens/guides/tempo/manage-token-roles',
              },
              {
                text: 'Configure Transfer Policies',
                link: '/tokens/guides/tempo/transfer-policies',
              },
            ],
          },
        ],
      },
      {
        text: 'Actions',
        items: [
          { text: 'Overview', link: '/tokens/actions' },
          {
            text: 'Core',
            items: [
              { text: 'approve', link: '/tokens/actions/approve' },
              {
                text: 'getAllowance',
                link: '/tokens/actions/getAllowance',
              },
              { text: 'getBalance', link: '/tokens/actions/getBalance' },
              { text: 'getMetadata', link: '/tokens/actions/getMetadata' },
              {
                text: 'getTotalSupply',
                link: '/tokens/actions/getTotalSupply',
              },
              { text: 'transfer', link: '/tokens/actions/transfer' },
            ],
          },
          {
            text: 'TIP-20 (Tempo)',
            collapsed: true,
            items: [
              { text: 'burn', link: '/tokens/tempo/burn' },
              {
                text: 'burnBlocked',
                link: '/tokens/tempo/burnBlocked',
              },
              {
                text: 'changeTransferPolicy',
                link: '/tokens/tempo/changeTransferPolicy',
              },
              { text: 'create', link: '/tokens/tempo/create' },
              { text: 'grantRoles', link: '/tokens/tempo/grantRoles' },
              { text: 'hasRole', link: '/tokens/tempo/hasRole' },
              { text: 'mint', link: '/tokens/tempo/mint' },
              { text: 'pause', link: '/tokens/tempo/pause' },
              {
                text: 'renounceRoles',
                link: '/tokens/tempo/renounceRoles',
              },
              {
                text: 'revokeRoles',
                link: '/tokens/tempo/revokeRoles',
              },
              {
                text: 'setRoleAdmin',
                link: '/tokens/tempo/setRoleAdmin',
              },
              {
                text: 'setSupplyCap',
                link: '/tokens/tempo/setSupplyCap',
              },
              { text: 'unpause', link: '/tokens/tempo/unpause' },
            ],
          },
        ],
      },
    ],
    '/account-abstraction': [
      { text: 'Getting Started', link: '/account-abstraction' },
      {
        text: 'EntryPoint Versions',
        link: '/account-abstraction/entry-point-versions',
      },
      {
        text: 'Clients',
        items: [
          {
            text: 'Bundler Client',
            link: '/account-abstraction/clients/bundler',
          },
          {
            text: 'Paymaster Client',
            link: '/account-abstraction/clients/paymaster',
          },
        ],
      },
      {
        text: 'Accounts',
        items: [
          {
            text: 'SmartAccount.from',
            link: '/account-abstraction/accounts/smart',
          },
          {
            text: 'CoinbaseSmartAccount.from',
            link: '/account-abstraction/accounts/coinbase',
          },
          {
            text: 'SoladySmartAccount.from',
            link: '/account-abstraction/accounts/solady',
          },
          {
            text: 'Simple7702SmartAccount.from',
            link: '/account-abstraction/accounts/simple-7702',
          },
          {
            text: 'WebAuthnAccount.from',
            link: '/account-abstraction/accounts/webauthn',
          },
        ],
      },
      {
        text: 'Bundler Actions',
        items: [
          {
            text: 'entryPoint.getSupported',
            link: '/account-abstraction/actions/entryPoint.getSupported',
          },
          {
            text: 'userOperation.prepare',
            link: '/account-abstraction/actions/userOperation.prepare',
          },
          {
            text: 'userOperation.estimateGas',
            link: '/account-abstraction/actions/userOperation.estimateGas',
          },
          {
            text: 'userOperation.send',
            link: '/account-abstraction/actions/userOperation.send',
          },
          {
            text: 'userOperation.get',
            link: '/account-abstraction/actions/userOperation.get',
          },
          {
            text: 'userOperation.getReceipt',
            link: '/account-abstraction/actions/userOperation.getReceipt',
          },
          {
            text: 'userOperation.waitForReceipt',
            link: '/account-abstraction/actions/userOperation.waitForReceipt',
          },
        ],
      },
      {
        text: 'Paymaster Actions',
        items: [
          {
            text: 'paymaster.getData',
            link: '/account-abstraction/actions/paymaster.getData',
          },
          {
            text: 'paymaster.getStubData',
            link: '/account-abstraction/actions/paymaster.getStubData',
          },
        ],
      },
      { text: 'Migrate from v2', link: '/account-abstraction/migration' },
    ],
    '/op-stack': [
      { text: 'Overview', link: '/op-stack' },
      { text: 'Client Decorators', link: '/op-stack/client' },
      { text: 'Deposits', link: '/op-stack/deposits' },
      { text: 'Withdrawals', link: '/op-stack/withdrawals' },
      {
        text: 'Actions',
        items: [
          { text: 'L1 Actions', link: '/op-stack/actions/l1' },
          { text: 'L2 Actions', link: '/op-stack/actions/l2' },
        ],
      },
    ],
    '/tempo': [
      { text: 'Getting Started', link: '/tempo' },
      { text: 'Chains', link: '/tempo/chains' },
      { text: 'Tempo Docs & Guides', link: 'https://docs.tempo.xyz' },
      {
        text: 'Guides',
        items: [
          { text: 'Overview', link: '/tempo/guides' },
          {
            text: 'Accounts',
            collapsed: true,
            items: [
              {
                text: 'Create an Account',
                link: '/tempo/guides/accounts/create',
              },
              {
                text: 'Sign In with a Passkey',
                link: '/tempo/guides/accounts/passkeys',
              },
              {
                text: 'Use the Tempo Accounts SDK',
                link: '/tempo/guides/accounts/accounts-sdk',
              },
            ],
          },
          {
            text: 'Tempo Transactions',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/transactions' },
              { text: 'Batch Calls', link: '/tempo/guides/batch-calls' },
              {
                text: 'Concurrent Transactions',
                link: '/tempo/guides/concurrent-transactions',
              },
              {
                text: 'Scheduled Transactions',
                link: '/tempo/guides/scheduled-transactions',
              },
              {
                text: 'Pay Fees in a Stablecoin',
                link: '/tempo/guides/pay-fees',
              },
              { text: 'Sponsor User Fees', link: '/tempo/guides/sponsor-fees' },
              {
                badge: { text: 'EXP', variant: 'warning' },
                text: 'Multisig Transactions',
                link: '/tempo/guides/multisig-transactions',
              },
            ],
          },
          {
            text: 'Tokens',
            collapsed: true,
            items: [
              {
                text: 'Create a TIP-20 Token',
                link: '/tempo/guides/create-token',
              },
              {
                text: 'Mint & Burn Tokens',
                link: '/tempo/guides/manage-token-balances',
              },
              {
                text: 'Transfer Tokens',
                link: '/tempo/guides/transfer-tokens',
              },
              {
                text: 'Manage Token Roles & Supply',
                link: '/tempo/guides/manage-token-roles',
              },
              {
                text: 'Configure Transfer Policies',
                link: '/tempo/guides/transfer-policies',
              },
            ],
          },
          {
            text: 'Access Keys',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/guides/access-keys' },
              {
                text: 'Authorize Access Keys',
                link: '/tempo/guides/access-keys/authorize',
              },
              {
                text: 'Set Permissions & Limits',
                link: '/tempo/guides/access-keys/permissions',
              },
              {
                text: 'Manage Access Keys',
                link: '/tempo/guides/access-keys/manage',
              },
              {
                text: 'Admin Access Keys',
                link: '/tempo/guides/access-keys/admin',
              },
              {
                text: 'Witnesses',
                link: '/tempo/guides/access-keys/witnesses',
              },
              {
                text: 'Verify Signatures',
                link: '/tempo/guides/access-keys/verify',
              },
            ],
          },
          {
            text: 'Stablecoin Exchange',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/guides/stablecoin-exchange' },
              {
                text: 'Swap Stablecoins',
                link: '/tempo/guides/stablecoin-exchange/swap',
              },
              {
                text: 'Place & Manage Orders',
                link: '/tempo/guides/stablecoin-exchange/orders',
              },
              {
                text: 'Manage Exchange Balances',
                link: '/tempo/guides/stablecoin-exchange/balances',
              },
              {
                text: 'Create a Trading Pair',
                link: '/tempo/guides/stablecoin-exchange/create-pair',
              },
              {
                text: 'Provide Fee AMM Liquidity',
                link: '/tempo/guides/stablecoin-exchange/fee-amm-liquidity',
              },
            ],
          },
          {
            text: 'Virtual Addresses',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/guides/virtual-addresses' },
              {
                text: 'Register a Master Address',
                link: '/tempo/guides/virtual-addresses/register',
              },
              {
                text: 'Resolve & Accept Payments',
                link: '/tempo/guides/virtual-addresses/resolve',
              },
            ],
          },
          {
            text: 'Receive Policies',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/guides/receive-policies' },
              {
                text: 'Set a Receive Policy',
                link: '/tempo/guides/receive-policies/set',
              },
              {
                text: 'Validate Transfers',
                link: '/tempo/guides/receive-policies/validate',
              },
              {
                text: 'Handle Blocked Funds',
                link: '/tempo/guides/receive-policies/blocked',
              },
            ],
          },
          {
            text: 'Payment Channels',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/tempo/guides/payment-channels' },
              {
                text: 'Open & Fund a Channel',
                link: '/tempo/guides/payment-channels/open',
              },
              {
                text: 'Send & Settle Vouchers',
                link: '/tempo/guides/payment-channels/vouchers',
              },
              {
                text: 'Close & Withdraw',
                link: '/tempo/guides/payment-channels/close',
              },
            ],
          },
          {
            text: 'Private Zones',
            collapsed: true,
            items: [
              {
                text: 'Connect to a Zone',
                link: '/tempo/guides/zones/connect',
              },
              {
                text: 'Deposit to a Zone',
                link: '/tempo/guides/zones/deposit',
              },
              {
                text: 'Withdraw from a Zone',
                link: '/tempo/guides/zones/withdraw',
              },
            ],
          },
        ],
      },
      {
        text: 'Accounts',
        items: [
          { text: 'Overview', link: '/tempo/accounts' },
          {
            text: 'Secp256k1 (Standard Account)',
            link: '/tempo/accounts/account.fromSecp256k1',
          },
          { text: 'P256', link: '/tempo/accounts/account.fromP256' },
          {
            text: 'WebAuthnP256 (Passkey)',
            link: '/tempo/accounts/account.fromWebAuthnP256',
          },
          {
            text: 'WebCryptoP256',
            link: '/tempo/accounts/account.fromWebCryptoP256',
          },
          {
            badge: { text: 'EXP', variant: 'warning' },
            text: 'Multisig',
            link: '/tempo/accounts/account.fromMultisig',
          },
        ],
      },
      {
        text: 'Actions',
        items: [
          { text: 'Overview', link: '/tempo/actions' },
          {
            text: 'Access Key',
            collapsed: true,
            items: [
              {
                text: 'authorize',
                link: '/tempo/actions/accessKey.authorize',
              },
              {
                text: 'burnWitness',
                link: '/tempo/actions/accessKey.burnWitness',
              },
              {
                text: 'getMetadata',
                link: '/tempo/actions/accessKey.getMetadata',
              },
              {
                text: 'getRemainingLimit',
                link: '/tempo/actions/accessKey.getRemainingLimit',
              },
              { text: 'isAdmin', link: '/tempo/actions/accessKey.isAdmin' },
              {
                text: 'isWitnessBurned',
                link: '/tempo/actions/accessKey.isWitnessBurned',
              },
              { text: 'revoke', link: '/tempo/actions/accessKey.revoke' },
              {
                text: 'signAuthorization',
                link: '/tempo/actions/accessKey.signAuthorization',
              },
              {
                text: 'updateLimit',
                link: '/tempo/actions/accessKey.updateLimit',
              },
              {
                text: 'verifyHash',
                link: '/tempo/actions/accessKey.verifyHash',
              },
              {
                text: 'watchAdminAuthorized',
                link: '/tempo/actions/accessKey.watchAdminAuthorized',
              },
              {
                text: 'watchWitness',
                link: '/tempo/actions/accessKey.watchWitness',
              },
              {
                text: 'watchWitnessBurned',
                link: '/tempo/actions/accessKey.watchWitnessBurned',
              },
            ],
          },
          {
            text: 'AMM',
            collapsed: true,
            items: [
              { text: 'burn', link: '/tempo/actions/amm.burn' },
              {
                text: 'getLiquidityBalance',
                link: '/tempo/actions/amm.getLiquidityBalance',
              },
              { text: 'getPool', link: '/tempo/actions/amm.getPool' },
              { text: 'mint', link: '/tempo/actions/amm.mint' },
              {
                text: 'rebalanceSwap',
                link: '/tempo/actions/amm.rebalanceSwap',
              },
              { text: 'watchBurn', link: '/tempo/actions/amm.watchBurn' },
              { text: 'watchMint', link: '/tempo/actions/amm.watchMint' },
              {
                text: 'watchRebalanceSwap',
                link: '/tempo/actions/amm.watchRebalanceSwap',
              },
            ],
          },
          {
            text: 'Channel',
            collapsed: true,
            items: [
              { text: 'close', link: '/tempo/actions/channel.close' },
              { text: 'getStates', link: '/tempo/actions/channel.getStates' },
              { text: 'open', link: '/tempo/actions/channel.open' },
              {
                text: 'requestClose',
                link: '/tempo/actions/channel.requestClose',
              },
              { text: 'settle', link: '/tempo/actions/channel.settle' },
              {
                text: 'signVoucher',
                link: '/tempo/actions/channel.signVoucher',
              },
              { text: 'topUp', link: '/tempo/actions/channel.topUp' },
              { text: 'withdraw', link: '/tempo/actions/channel.withdraw' },
            ],
          },
          {
            text: 'DEX',
            collapsed: true,
            items: [
              { text: 'buy', link: '/tempo/actions/dex.buy' },
              { text: 'cancel', link: '/tempo/actions/dex.cancel' },
              { text: 'cancelStale', link: '/tempo/actions/dex.cancelStale' },
              { text: 'createPair', link: '/tempo/actions/dex.createPair' },
              { text: 'getBalance', link: '/tempo/actions/dex.getBalance' },
              { text: 'getBuyQuote', link: '/tempo/actions/dex.getBuyQuote' },
              { text: 'getOrder', link: '/tempo/actions/dex.getOrder' },
              {
                text: 'getOrderbook',
                link: '/tempo/actions/dex.getOrderbook',
              },
              {
                text: 'getSellQuote',
                link: '/tempo/actions/dex.getSellQuote',
              },
              {
                text: 'getTickLevel',
                link: '/tempo/actions/dex.getTickLevel',
              },
              { text: 'place', link: '/tempo/actions/dex.place' },
              { text: 'placeFlip', link: '/tempo/actions/dex.placeFlip' },
              { text: 'sell', link: '/tempo/actions/dex.sell' },
              {
                text: 'watchFlipOrderPlaced',
                link: '/tempo/actions/dex.watchFlipOrderPlaced',
              },
              {
                text: 'watchOrderCancelled',
                link: '/tempo/actions/dex.watchOrderCancelled',
              },
              {
                text: 'watchOrderFilled',
                link: '/tempo/actions/dex.watchOrderFilled',
              },
              {
                text: 'watchOrderPlaced',
                link: '/tempo/actions/dex.watchOrderPlaced',
              },
              { text: 'withdraw', link: '/tempo/actions/dex.withdraw' },
            ],
          },
          {
            text: 'Faucet',
            collapsed: true,
            items: [{ text: 'fund', link: '/tempo/actions/faucet.fund' }],
          },
          {
            text: 'Fee',
            collapsed: true,
            items: [
              { text: 'getUserToken', link: '/tempo/actions/fee.getUserToken' },
              {
                text: 'getValidatorToken',
                link: '/tempo/actions/fee.getValidatorToken',
              },
              { text: 'setUserToken', link: '/tempo/actions/fee.setUserToken' },
              {
                text: 'setValidatorToken',
                link: '/tempo/actions/fee.setValidatorToken',
              },
              {
                text: 'validateToken',
                link: '/tempo/actions/fee.validateToken',
              },
              {
                text: 'watchSetUserToken',
                link: '/tempo/actions/fee.watchSetUserToken',
              },
              {
                text: 'watchSetValidatorToken',
                link: '/tempo/actions/fee.watchSetValidatorToken',
              },
            ],
          },
          {
            text: 'Nonce',
            collapsed: true,
            items: [
              { text: 'get', link: '/tempo/actions/nonce.get' },
              {
                text: 'watchIncremented',
                link: '/tempo/actions/nonce.watchIncremented',
              },
            ],
          },
          {
            text: 'Policy',
            collapsed: true,
            items: [
              { text: 'create', link: '/tempo/actions/policy.create' },
              { text: 'getData', link: '/tempo/actions/policy.getData' },
              {
                text: 'isAuthorized',
                link: '/tempo/actions/policy.isAuthorized',
              },
              {
                text: 'modifyBlacklist',
                link: '/tempo/actions/policy.modifyBlacklist',
              },
              {
                text: 'modifyWhitelist',
                link: '/tempo/actions/policy.modifyWhitelist',
              },
              { text: 'setAdmin', link: '/tempo/actions/policy.setAdmin' },
              {
                text: 'watchAdminUpdated',
                link: '/tempo/actions/policy.watchAdminUpdated',
              },
              {
                text: 'watchBlacklistUpdated',
                link: '/tempo/actions/policy.watchBlacklistUpdated',
              },
              {
                text: 'watchCreate',
                link: '/tempo/actions/policy.watchCreate',
              },
              {
                text: 'watchWhitelistUpdated',
                link: '/tempo/actions/policy.watchWhitelistUpdated',
              },
            ],
          },
          {
            text: 'Receive Policy',
            collapsed: true,
            items: [
              { text: 'burn', link: '/tempo/actions/receivePolicy.burn' },
              { text: 'claim', link: '/tempo/actions/receivePolicy.claim' },
              { text: 'get', link: '/tempo/actions/receivePolicy.get' },
              {
                text: 'getBlockedBalance',
                link: '/tempo/actions/receivePolicy.getBlockedBalance',
              },
              { text: 'set', link: '/tempo/actions/receivePolicy.set' },
              {
                text: 'validate',
                link: '/tempo/actions/receivePolicy.validate',
              },
              {
                text: 'watchBlocked',
                link: '/tempo/actions/receivePolicy.watchBlocked',
              },
              {
                text: 'watchBurned',
                link: '/tempo/actions/receivePolicy.watchBurned',
              },
              {
                text: 'watchClaimed',
                link: '/tempo/actions/receivePolicy.watchClaimed',
              },
              {
                text: 'watchUpdated',
                link: '/tempo/actions/receivePolicy.watchUpdated',
              },
            ],
          },
          {
            text: 'Token',
            collapsed: true,
            items: [
              { text: 'approve', link: '/tempo/actions/token.approve' },
              { text: 'burn', link: '/tempo/actions/token.burn' },
              { text: 'burnBlocked', link: '/tempo/actions/token.burnBlocked' },
              {
                text: 'changeTransferPolicy',
                link: '/tempo/actions/token.changeTransferPolicy',
              },
              { text: 'create', link: '/tempo/actions/token.create' },
              {
                text: 'getAllowance',
                link: '/tempo/actions/token.getAllowance',
              },
              { text: 'getBalance', link: '/tempo/actions/token.getBalance' },
              { text: 'getMetadata', link: '/tempo/actions/token.getMetadata' },
              {
                text: 'getRoleAdmin',
                link: '/tempo/actions/token.getRoleAdmin',
              },
              {
                text: 'getTotalSupply',
                link: '/tempo/actions/token.getTotalSupply',
              },
              { text: 'grantRoles', link: '/tempo/actions/token.grantRoles' },
              { text: 'hasRole', link: '/tempo/actions/token.hasRole' },
              { text: 'mint', link: '/tempo/actions/token.mint' },
              { text: 'pause', link: '/tempo/actions/token.pause' },
              {
                text: 'prepareUpdateQuoteToken',
                link: '/tempo/actions/token.prepareUpdateQuoteToken',
              },
              {
                text: 'renounceRoles',
                link: '/tempo/actions/token.renounceRoles',
              },
              { text: 'revokeRoles', link: '/tempo/actions/token.revokeRoles' },
              {
                text: 'setRoleAdmin',
                link: '/tempo/actions/token.setRoleAdmin',
              },
              {
                text: 'setSupplyCap',
                link: '/tempo/actions/token.setSupplyCap',
              },
              { text: 'transfer', link: '/tempo/actions/token.transfer' },
              { text: 'unpause', link: '/tempo/actions/token.unpause' },
              {
                text: 'updateQuoteToken',
                link: '/tempo/actions/token.updateQuoteToken',
              },
              {
                text: 'watchAdminRole',
                link: '/tempo/actions/token.watchAdminRole',
              },
              {
                text: 'watchApprove',
                link: '/tempo/actions/token.watchApprove',
              },
              { text: 'watchBurn', link: '/tempo/actions/token.watchBurn' },
              { text: 'watchCreate', link: '/tempo/actions/token.watchCreate' },
              { text: 'watchMint', link: '/tempo/actions/token.watchMint' },
              { text: 'watchRole', link: '/tempo/actions/token.watchRole' },
              {
                text: 'watchTransfer',
                link: '/tempo/actions/token.watchTransfer',
              },
              {
                text: 'watchUpdateQuoteToken',
                link: '/tempo/actions/token.watchUpdateQuoteToken',
              },
            ],
          },
          {
            text: 'Validator',
            collapsed: true,
            items: [
              { text: 'add', link: '/tempo/actions/validator.add' },
              {
                text: 'changeOwner',
                link: '/tempo/actions/validator.changeOwner',
              },
              {
                text: 'changeStatus',
                link: '/tempo/actions/validator.changeStatus',
              },
              { text: 'get', link: '/tempo/actions/validator.get' },
              {
                text: 'getByIndex',
                link: '/tempo/actions/validator.getByIndex',
              },
              { text: 'getCount', link: '/tempo/actions/validator.getCount' },
              {
                text: 'getNextFullDkgCeremony',
                link: '/tempo/actions/validator.getNextFullDkgCeremony',
              },
              { text: 'getOwner', link: '/tempo/actions/validator.getOwner' },
              { text: 'list', link: '/tempo/actions/validator.list' },
              {
                text: 'setNextFullDkgCeremony',
                link: '/tempo/actions/validator.setNextFullDkgCeremony',
              },
              { text: 'update', link: '/tempo/actions/validator.update' },
            ],
          },
          {
            text: 'Virtual Address',
            collapsed: true,
            items: [
              {
                text: 'getMasterAddress',
                link: '/tempo/actions/virtualAddress.getMasterAddress',
              },
              {
                text: 'registerMaster',
                link: '/tempo/actions/virtualAddress.registerMaster',
              },
              {
                text: 'resolve',
                link: '/tempo/actions/virtualAddress.resolve',
              },
            ],
          },
          {
            text: 'Wallet',
            collapsed: true,
            items: [
              { text: 'deposit', link: '/tempo/actions/wallet.deposit' },
              { text: 'swap', link: '/tempo/actions/wallet.swap' },
              { text: 'transfer', link: '/tempo/actions/wallet.transfer' },
            ],
          },
          {
            text: 'Zone',
            collapsed: true,
            items: [
              { text: 'deposit', link: '/tempo/actions/zone.deposit' },
              {
                text: 'encryptedDeposit',
                link: '/tempo/actions/zone.encryptedDeposit',
              },
              {
                text: 'getAuthorizationTokenInfo',
                link: '/tempo/actions/zone.getAuthorizationTokenInfo',
              },
              {
                text: 'getDepositStatus',
                link: '/tempo/actions/zone.getDepositStatus',
              },
              {
                text: 'getWithdrawalFee',
                link: '/tempo/actions/zone.getWithdrawalFee',
              },
              {
                text: 'getZoneInfo',
                link: '/tempo/actions/zone.getZoneInfo',
              },
              {
                text: 'requestVerifiableWithdrawal',
                link: '/tempo/actions/zone.requestVerifiableWithdrawal',
              },
              {
                text: 'requestWithdrawal',
                link: '/tempo/actions/zone.requestWithdrawal',
              },
              {
                text: 'signAuthorizationToken',
                link: '/tempo/actions/zone.signAuthorizationToken',
              },
            ],
          },
        ],
      },
      {
        text: 'Transports',
        items: [{ text: 'withRelay', link: '/tempo/transports/withRelay' }],
      },
      {
        text: 'Utilities',
        items: [
          {
            badge: { text: 'EXP', variant: 'warning' },
            text: 'Scopes',
            link: '/tempo/utilities/Scopes',
          },
          {
            badge: { text: 'EXP', variant: 'warning' },
            text: 'Selectors',
            link: '/tempo/utilities/Selectors',
          },
          {
            text: 'Storage',
            collapsed: true,
            items: [
              {
                text: 'defaultStorage',
                link: '/tempo/utilities/Storage.defaultStorage',
              },
              { text: 'from', link: '/tempo/utilities/Storage.from' },
              { text: 'memory', link: '/tempo/utilities/Storage.memory' },
              { text: 'session', link: '/tempo/utilities/Storage.session' },
            ],
          },
        ],
      },
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
    { text: 'Tokens', link: '/tokens', match: '/tokens' },
    {
      text: 'Account Abstraction',
      link: '/account-abstraction',
      match: '/account-abstraction',
    },
    { text: 'Tempo', link: '/tempo', match: '/tempo' },
    {
      text: pkg.version,
      items: [
        {
          text: 'Migrating from v2',
          link: '/docs/v2-migration',
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
