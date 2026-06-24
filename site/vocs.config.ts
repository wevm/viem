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
            text: 'Public',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/actions/public' },
              { text: 'call', link: '/docs/actions/public/call' },
              {
                text: 'Address',
                items: [
                  {
                    text: 'getBalance',
                    link: '/docs/actions/public/address/getBalance',
                  },
                  {
                    text: 'getCode',
                    link: '/docs/actions/public/address/getCode',
                  },
                  {
                    text: 'getDelegation',
                    link: '/docs/actions/public/address/getDelegation',
                  },
                  {
                    text: 'getProof',
                    link: '/docs/actions/public/address/getProof',
                  },
                  {
                    text: 'getStorageAt',
                    link: '/docs/actions/public/address/getStorageAt',
                  },
                  {
                    text: 'getTransactionCount',
                    link: '/docs/actions/public/address/getTransactionCount',
                  },
                ],
              },
              {
                text: 'Block',
                items: [
                  { text: 'get', link: '/docs/actions/public/block/get' },
                  {
                    text: 'getNumber',
                    link: '/docs/actions/public/block/getNumber',
                  },
                  {
                    text: 'getReceipts',
                    link: '/docs/actions/public/block/getReceipts',
                  },
                  {
                    text: 'getTransactionCount',
                    link: '/docs/actions/public/block/getTransactionCount',
                  },
                ],
              },
              {
                text: 'Chains',
                items: [
                  { text: 'getId', link: '/docs/actions/public/chains/getId' },
                ],
              },
              {
                text: 'Contract',
                items: [
                  {
                    text: 'getEip712Domain',
                    link: '/docs/actions/public/contract/getEip712Domain',
                  },
                  {
                    text: 'getLogs',
                    link: '/docs/actions/public/contract/getLogs',
                  },
                  { text: 'read', link: '/docs/actions/public/contract/read' },
                ],
              },
              {
                text: 'Logs',
                items: [
                  {
                    text: 'get',
                    link: '/docs/actions/public/logs/get',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'estimateFeesPerGas',
                    link: '/docs/actions/public/fee/estimateFeesPerGas',
                  },
                  {
                    text: 'estimateMaxPriorityFeePerGas',
                    link: '/docs/actions/public/fee/estimateMaxPriorityFeePerGas',
                  },
                  {
                    text: 'getBlobBaseFee',
                    link: '/docs/actions/public/fee/getBlobBaseFee',
                  },
                  {
                    text: 'getGasPrice',
                    link: '/docs/actions/public/fee/getGasPrice',
                  },
                  {
                    text: 'getHistory',
                    link: '/docs/actions/public/fee/getHistory',
                  },
                ],
              },
              {
                text: 'Transaction',
                items: [
                  {
                    text: 'estimateGas',
                    link: '/docs/actions/public/transaction/estimateGas',
                  },
                  {
                    text: 'fill',
                    link: '/docs/actions/public/transaction/fill',
                  },
                  {
                    text: 'get',
                    link: '/docs/actions/public/transaction/get',
                  },
                  {
                    text: 'getConfirmations',
                    link: '/docs/actions/public/transaction/getConfirmations',
                  },
                  {
                    text: 'getReceipt',
                    link: '/docs/actions/public/transaction/getReceipt',
                  },
                  {
                    text: 'prepare',
                    link: '/docs/actions/public/transaction/prepare',
                  },
                  {
                    text: 'send',
                    link: '/docs/actions/public/transaction/send',
                  },
                  {
                    text: 'sendRaw',
                    link: '/docs/actions/public/transaction/sendRaw',
                  },
                  {
                    text: 'sign',
                    link: '/docs/actions/public/transaction/sign',
                  },
                ],
              },
            ],
          },
          {
            text: 'Test',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/actions/test' },
              {
                text: 'Address',
                items: [
                  {
                    text: 'impersonate',
                    link: '/docs/actions/test/address/impersonate',
                  },
                  {
                    text: 'setBalance',
                    link: '/docs/actions/test/address/setBalance',
                  },
                  {
                    text: 'setCode',
                    link: '/docs/actions/test/address/setCode',
                  },
                  {
                    text: 'setNonce',
                    link: '/docs/actions/test/address/setNonce',
                  },
                  {
                    text: 'setStorageAt',
                    link: '/docs/actions/test/address/setStorageAt',
                  },
                  {
                    text: 'stopImpersonating',
                    link: '/docs/actions/test/address/stopImpersonating',
                  },
                ],
              },
              {
                text: 'Block',
                items: [
                  {
                    text: 'getAutomine',
                    link: '/docs/actions/test/block/getAutomine',
                  },
                  {
                    text: 'increaseTime',
                    link: '/docs/actions/test/block/increaseTime',
                  },
                  { text: 'mine', link: '/docs/actions/test/block/mine' },
                  {
                    text: 'removeTimestampInterval',
                    link: '/docs/actions/test/block/removeTimestampInterval',
                  },
                  {
                    text: 'setAutomine',
                    link: '/docs/actions/test/block/setAutomine',
                  },
                  {
                    text: 'setCoinbase',
                    link: '/docs/actions/test/block/setCoinbase',
                  },
                  {
                    text: 'setGasLimit',
                    link: '/docs/actions/test/block/setGasLimit',
                  },
                  {
                    text: 'setIntervalMining',
                    link: '/docs/actions/test/block/setIntervalMining',
                  },
                  {
                    text: 'setNextBaseFeePerGas',
                    link: '/docs/actions/test/block/setNextBaseFeePerGas',
                  },
                  {
                    text: 'setNextTimestamp',
                    link: '/docs/actions/test/block/setNextTimestamp',
                  },
                  {
                    text: 'setTimestampInterval',
                    link: '/docs/actions/test/block/setTimestampInterval',
                  },
                ],
              },
              {
                text: 'Node',
                items: [
                  {
                    text: 'setLoggingEnabled',
                    link: '/docs/actions/test/node/setLoggingEnabled',
                  },
                  {
                    text: 'setMinGasPrice',
                    link: '/docs/actions/test/node/setMinGasPrice',
                  },
                  {
                    text: 'setRpcUrl',
                    link: '/docs/actions/test/node/setRpcUrl',
                  },
                ],
              },
              {
                text: 'State',
                items: [
                  { text: 'dump', link: '/docs/actions/test/state/dump' },
                  { text: 'load', link: '/docs/actions/test/state/load' },
                  { text: 'reset', link: '/docs/actions/test/state/reset' },
                  { text: 'revert', link: '/docs/actions/test/state/revert' },
                  {
                    text: 'snapshot',
                    link: '/docs/actions/test/state/snapshot',
                  },
                ],
              },
              {
                text: 'Transaction Pool',
                items: [
                  {
                    text: 'dropTransaction',
                    link: '/docs/actions/test/txpool/dropTransaction',
                  },
                  {
                    text: 'getStatus',
                    link: '/docs/actions/test/txpool/getStatus',
                  },
                  {
                    text: 'inspect',
                    link: '/docs/actions/test/txpool/inspect',
                  },
                ],
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
