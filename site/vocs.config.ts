import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  defineConfig,
  Embedding,
  McpSource,
  Reranker,
  Retriever,
  Twoslash,
  VectorStore,
} from 'vocs/config'

import pkg from '../package.json' with { type: 'json' }
import * as sidebar from './sidebar.generated'
import { shikiDark, shikiLight } from './shiki-themes'

// Load `site/.env` (e.g. `CLOUDFLARE_*` for AI search). No-op if absent.
try {
  process.loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)))
} catch {}

// Repo root, as an absolute path. Used for twoslash module resolution so the
// `viem` → live-source mapping resolves identically in both the rich and
// `checkOnly` twoslashers (whose relative `baseUrl` resolve against different
// directories).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const oxDist = resolve(root, 'node_modules/ox/dist')
const oxDocsOrigin = 'https://oxlib.sh'
const vercelEnvironment = process.env.VERCEL_ENV
const vercelRef = process.env.VERCEL_GIT_COMMIT_REF
// TODO(v3): Remove the v3 deployment and source overrides when Viem v3 is stable.
const isV3 =
  vercelRef === 'v3' || process.env.VERCEL_GIT_REPO_SLUG === 'viem-v3'
// Remote sync prunes stale vectors, so v3 must not share production's index.
const aiIndex = isV3
  ? 'viem-docs-v3'
  : vercelEnvironment === 'preview'
    ? undefined
    : 'viem-docs'

const badge = (kind: 'public' | 'test' | 'wallet') =>
  ({
    public: { text: 'Public', variant: 'info' as const },
    test: { text: 'Test', variant: 'warning' as const },
    wallet: { text: 'Wallet', variant: 'tip' as const },
  })[kind]

// Ox TSDoc uses site-relative links. Make inherited hover links absolute before Vocs checks them against Viem routes.
const twoslashRenderer = Twoslash.Renderer.rich()
const renderer = {
  ...twoslashRenderer,
  nodeStaticInfo(info, node) {
    const value =
      info.docs === undefined
        ? info
        : {
            ...info,
            docs: info.docs.replaceAll('](/api/', `](${oxDocsOrigin}/api/`),
          }
    return twoslashRenderer.nodeStaticInfo.call(this, value, node)
  },
  nodeQuery(info, node) {
    const value =
      info.docs === undefined
        ? info
        : {
            ...info,
            docs: info.docs.replaceAll('](/api/', `](${oxDocsOrigin}/api/`),
          }
    return twoslashRenderer.nodeQuery?.call(this, value, node) ?? node
  },
} satisfies typeof twoslashRenderer

export default defineConfig({
  accentColor: 'light-dark(#51741f, #bfd655)',
  baseUrl: isV3
    ? 'https://v3.viem.sh'
    : vercelEnvironment === 'production'
      ? 'https://viem.sh'
      : process.env.VERCEL_URL,
  title: 'Viem',
  titleTemplate: '%s · Viem',
  description:
    'Build reliable Ethereum apps & libraries with lightweight, composable, & type-safe modules from viem.',
  head: {
    style: [{ textContent: 'strong[data-v] { font-weight: 500; }' }],
  },
  editLink: {
    link: 'https://github.com/wevm/viem/edit/main/site/pages/:path',
    text: 'Suggest changes to this page',
  },
  ogImageUrl: (path, { baseUrl }) => {
    if (path === '/') return '/og-image.png'
    return `${baseUrl}/api/og?title=%title&description=%description`
  },
  iconUrl: { light: '/favicons/light.png', dark: '/favicons/dark.png' },
  logoUrl: { light: '/icon-light.png', dark: '/icon-dark.png' },
  codeHighlight: {
    // Vocs includes the unsupported `sol` alias in its defaults.
    langs: ['bash', 'html', 'json', 'sh', 'ts'],
    themes: {
      light: shikiLight,
      dark: shikiDark,
    },
  },
  mcp: {
    enabled: true,
    sources: [
      McpSource.github({
        branch: isV3 ? 'v3' : 'main',
        name: 'viem',
        repo: 'wevm/viem',
      }),
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

    // Introduction pages moved.
    {
      source: '/docs/introduction',
      destination: '/docs/why-viem',
      status: 308,
    },
    {
      source: '/docs/getting-started',
      destination: '/docs',
      status: 308,
    },

    // Signing and verification actions moved into domain namespaces.
    {
      source: '/docs/actions/wallet/signTypedData',
      destination: '/docs/actions/wallet/typedData/sign',
      status: 308,
    },
    {
      source: '/docs/actions/public/verifyTypedData',
      destination: '/docs/actions/public/typedData/verify',
      status: 308,
    },
    {
      source: '/docs/actions/public/verifySiweMessage',
      destination: '/docs/actions/public/siwe/verify',
      status: 308,
    },

    // Account Abstraction v2 routes moved to v3 module namespaces.
    {
      source: '/account-abstraction/accounts/smart/toCoinbaseSmartAccount',
      destination: '/account-abstraction/accounts/coinbase',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/smart/toSoladySmartAccount',
      destination: '/account-abstraction/accounts/solady',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/smart/toSmartAccount',
      destination: '/account-abstraction/accounts/custom',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/smart/signMessage',
      destination: '/account-abstraction/accounts/custom#signmessage',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/smart/signTypedData',
      destination: '/account-abstraction/accounts/custom#signtypeddata',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/smart/signUserOperation',
      destination: '/account-abstraction/accounts/custom#signuseroperation',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/webauthn/toWebAuthnAccount',
      destination: '/account-abstraction/accounts/webauthn/fromCredential',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/webauthn/from',
      destination: '/account-abstraction/accounts/webauthn/fromCredential',
      status: 308,
    },
    {
      source: '/account-abstraction/accounts/webauthn/createWebAuthnCredential',
      destination: '/account-abstraction/accounts/webauthn/createCredential',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/estimateUserOperationGas',
      destination: '/account-abstraction/actions/userOperation.estimateGas',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/introduction',
      destination: '/account-abstraction',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/getChainId',
      destination: '/docs/actions/public/chains/getId',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/getSupportedEntryPoints',
      destination: '/account-abstraction/actions/entryPoint.getSupported',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/getUserOperation',
      destination: '/account-abstraction/actions/userOperation.get',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/getUserOperationReceipt',
      destination: '/account-abstraction/actions/userOperation.getReceipt',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/prepareUserOperation',
      destination: '/account-abstraction/actions/userOperation.prepare',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/bundler/sendUserOperation',
      destination: '/account-abstraction/actions/userOperation.send',
      status: 308,
    },
    {
      source:
        '/account-abstraction/actions/bundler/waitForUserOperationReceipt',
      destination: '/account-abstraction/actions/userOperation.waitForReceipt',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/paymaster/getPaymasterData',
      destination: '/account-abstraction/actions/paymaster.getData',
      status: 308,
    },
    {
      source: '/account-abstraction/actions/paymaster/getPaymasterStubData',
      destination: '/account-abstraction/actions/paymaster.getStubData',
      status: 308,
    },

    // OP Stack actions moved under L1 and L2 namespaces.
    {
      source: '/op-stack/actions/buildInitiateWithdrawal',
      destination: '/op-stack/actions/l1/buildInitiateWithdrawal',
      status: 308,
    },
    {
      source: '/op-stack/actions/depositTransaction',
      destination: '/op-stack/actions/l1/depositTransaction',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateDepositTransactionGas',
      destination: '/op-stack/actions/l1/estimateDepositTransactionGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateFinalizeWithdrawalGas',
      destination: '/op-stack/actions/l1/estimateFinalizeWithdrawalGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateProveWithdrawalGas',
      destination: '/op-stack/actions/l1/estimateProveWithdrawalGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/finalizeWithdrawal',
      destination: '/op-stack/actions/l1/finalizeWithdrawal',
      status: 308,
    },
    {
      source: '/op-stack/actions/getGame',
      destination: '/op-stack/actions/l1/getGame',
      status: 308,
    },
    {
      source: '/op-stack/actions/getGames',
      destination: '/op-stack/actions/l1/getGames',
      status: 308,
    },
    {
      source: '/op-stack/actions/getL2Output',
      destination: '/op-stack/actions/l1/getL2Output',
      status: 308,
    },
    {
      source: '/op-stack/actions/getPortalVersion',
      destination: '/op-stack/actions/l1/getPortalVersion',
      status: 308,
    },
    {
      source: '/op-stack/actions/getTimeToFinalize',
      destination: '/op-stack/actions/l1/getTimeToFinalize',
      status: 308,
    },
    {
      source: '/op-stack/actions/getTimeToNextGame',
      destination: '/op-stack/actions/l1/getTimeToNextGame',
      status: 308,
    },
    {
      source: '/op-stack/actions/getTimeToNextL2Output',
      destination: '/op-stack/actions/l1/getTimeToNextL2Output',
      status: 308,
    },
    {
      source: '/op-stack/actions/getTimeToProve',
      destination: '/op-stack/actions/l1/getTimeToProve',
      status: 308,
    },
    {
      source: '/op-stack/actions/getWithdrawalStatus',
      destination: '/op-stack/actions/l1/getWithdrawalStatus',
      status: 308,
    },
    {
      source: '/op-stack/actions/proveWithdrawal',
      destination: '/op-stack/actions/l1/proveWithdrawal',
      status: 308,
    },
    {
      source: '/op-stack/actions/waitForNextGame',
      destination: '/op-stack/actions/l1/waitForNextGame',
      status: 308,
    },
    {
      source: '/op-stack/actions/waitForNextL2Output',
      destination: '/op-stack/actions/l1/waitForNextL2Output',
      status: 308,
    },
    {
      source: '/op-stack/actions/waitToFinalize',
      destination: '/op-stack/actions/l1/waitToFinalize',
      status: 308,
    },
    {
      source: '/op-stack/actions/waitToProve',
      destination: '/op-stack/actions/l1/waitToProve',
      status: 308,
    },
    {
      source: '/op-stack/actions/buildDepositTransaction',
      destination: '/op-stack/actions/l2/buildDepositTransaction',
      status: 308,
    },
    {
      source: '/op-stack/actions/buildProveWithdrawal',
      destination: '/op-stack/actions/l2/buildProveWithdrawal',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateContractL1Fee',
      destination: '/op-stack/actions/l2/estimateContractL1Fee',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateContractL1Gas',
      destination: '/op-stack/actions/l2/estimateContractL1Gas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateContractTotalFee',
      destination: '/op-stack/actions/l2/estimateContractTotalFee',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateContractTotalGas',
      destination: '/op-stack/actions/l2/estimateContractTotalGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateInitiateWithdrawalGas',
      destination: '/op-stack/actions/l2/estimateInitiateWithdrawalGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateL1Fee',
      destination: '/op-stack/actions/l2/estimateL1Fee',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateL1Gas',
      destination: '/op-stack/actions/l2/estimateL1Gas',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateOperatorFee',
      destination: '/op-stack/actions/l2/estimateOperatorFee',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateTotalFee',
      destination: '/op-stack/actions/l2/estimateTotalFee',
      status: 308,
    },
    {
      source: '/op-stack/actions/estimateTotalGas',
      destination: '/op-stack/actions/l2/estimateTotalGas',
      status: 308,
    },
    {
      source: '/op-stack/actions/getL1BaseFee',
      destination: '/op-stack/actions/l2/getL1BaseFee',
      status: 308,
    },
    {
      source: '/op-stack/actions/initiateWithdrawal',
      destination: '/op-stack/actions/l2/initiateWithdrawal',
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
      destination: '/docs/actions/wallet/contract/deploy',
      status: 308,
    },
    {
      source: '/docs/actions/public/contract/write',
      destination: '/docs/actions/wallet/contract/write',
      status: 308,
    },
    {
      source: '/docs/actions/public/contract/writeSync',
      destination: '/docs/actions/wallet/contract/write',
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
      destination: '/docs/actions/wallet/transaction/sendRaw',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sendSync',
      destination: '/docs/actions/wallet/transaction/send',
      status: 308,
    },
    {
      source: '/docs/actions/public/transaction/sign',
      destination: '/docs/actions/wallet/transaction/sign',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/contract/deploySync',
      destination: '/docs/actions/wallet/contract/deploy',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/contract/writeSync',
      destination: '/docs/actions/wallet/contract/write',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/sendCallsSync',
      destination: '/docs/actions/wallet/sendCalls',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/token/approveSync',
      destination: '/docs/actions/wallet/token/approve',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/token/transferSync',
      destination: '/docs/actions/wallet/token/transfer',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/transaction/sendRawSync',
      destination: '/docs/actions/wallet/transaction/sendRaw',
      status: 308,
    },
    {
      source: '/docs/actions/wallet/transaction/sendSync',
      destination: '/docs/actions/wallet/transaction/send',
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
  ai:
    aiIndex &&
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN
      ? {
          retriever: Retriever.local({
            embedding: Embedding.cloudflare(),
            reranker: Reranker.cloudflare(),
            sources: [
              { url: 'https://wagmi.sh/llms.txt', label: 'wagmi', weight: 0.8 },
            ],
            // Remote store keeps vectors out of the server bundle entirely.
            vectorStore: VectorStore.cloudflare({ index: aiIndex }),
          }),
        }
      : undefined,
  sidebar: {
    '/docs': [
      {
        text: 'Introduction',
        items: [
          { text: 'Why Viem', link: '/docs/why-viem' },
          { text: 'Getting Started', link: '/docs' },
          { text: 'Installation', link: '/docs/installation' },
          { text: 'Platform Compatibility', link: '/docs/compatibility' },
          { text: 'AI Agents', link: '/docs/agents' },
          { text: 'FAQ', link: '/docs/faq' },
          { text: 'Benchmarks', link: '/docs/benchmarks' },
          { text: 'Migrating from v2', link: '/docs/v2-migration' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Overview', link: '/docs/guides' },
          {
            text: 'Blocks & Events',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/blocks-events' },
              {
                text: 'Read & Inspect Blocks',
                link: '/docs/guides/blocks-events/read',
              },
              {
                text: 'Watch & Simulate Blocks',
                link: '/docs/guides/blocks-events/watch-simulate',
              },
              {
                text: 'Query Logs',
                link: '/docs/guides/blocks-events/logs',
              },
              {
                text: 'Use Filters',
                link: '/docs/guides/blocks-events/filters',
              },
            ],
          },
          {
            text: 'Chain Data',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/chain-data' },
              {
                text: 'Address & Contract State',
                link: '/docs/guides/chain-data/state',
              },
              {
                text: 'State Proofs',
                link: '/docs/guides/chain-data/proofs',
              },
              { text: 'ENS', link: '/docs/guides/chain-data/ens' },
            ],
          },
          {
            text: 'Clients & Transports',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/clients' },
              {
                text: 'Set Up a Client',
                link: '/docs/guides/clients/setup',
              },
              {
                text: 'Multichain Clients',
                link: '/docs/guides/clients/multichain',
              },
              {
                text: 'Resilient Transports',
                link: '/docs/guides/clients/resilient-transports',
              },
              {
                text: 'Rate Limit & Load Balance',
                link: '/docs/guides/clients/rate-limit-load-balance',
              },
              {
                text: 'WebSocket Subscriptions',
                link: '/docs/guides/clients/websockets',
              },
              {
                text: 'Custom RPC & Errors',
                link: '/docs/guides/clients/custom-rpc-errors',
              },
            ],
          },
          {
            text: 'Contract Interactions',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/contracts' },
              {
                text: 'Read Contracts',
                link: '/docs/guides/contracts/read',
              },
              {
                text: 'Write & Simulate Contracts',
                link: '/docs/guides/contracts/write-simulate',
              },
              {
                text: 'Deploy Contracts',
                link: '/docs/guides/contracts/deploy',
              },
              {
                text: 'Batch Contract Reads',
                link: '/docs/guides/contracts/batch-reads',
              },
              {
                text: 'Contract Instances',
                link: '/docs/guides/contracts/instances',
              },
              {
                text: 'Contract Events',
                link: '/docs/guides/contracts/events',
              },
              {
                text: 'Low-Level Calls',
                link: '/docs/guides/contracts/calls',
              },
            ],
          },
          {
            text: 'EIP-7702 Authorizations',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/authorizations' },
              {
                text: 'Prepare & Sign',
                link: '/docs/guides/authorizations/prepare-sign',
              },
              {
                text: 'Send & Write',
                link: '/docs/guides/authorizations/send-write',
              },
              {
                text: 'Inspect Delegations',
                link: '/docs/guides/authorizations/delegations',
              },
              {
                text: 'ERC-7821 Execution',
                link: '/docs/guides/authorizations/erc7821',
              },
            ],
          },
          {
            text: 'Error Handling',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/errors' },
              { text: 'Typed Errors', link: '/docs/errors/typed-errors' },
              { text: 'Contract Errors', link: '/docs/errors/contract' },
              { text: 'RPC Errors', link: '/docs/errors/rpc' },
              { text: 'Base Error', link: '/docs/errors/base-error' },
              { text: 'Configuration', link: '/docs/errors/configuration' },
            ],
          },
          {
            text: 'Extending Viem',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/extending' },
              {
                text: 'Tree-Shakable Actions',
                link: '/docs/guides/extending/tree-shakable-actions',
              },
              {
                text: 'Type Composition',
                link: '/docs/guides/extending/type-composition',
              },
              {
                text: 'Extend a Client',
                link: '/docs/guides/extending/client',
              },
              {
                text: 'Build Actions & Decorators',
                link: '/docs/guides/extending/actions-decorators',
              },
              {
                text: 'Custom Chains & Transports',
                link: '/docs/guides/extending/chains-transports',
              },
              {
                text: 'Distribute a Viem Library',
                link: '/docs/guides/extending/libraries',
              },
            ],
          },
          {
            text: 'Testing',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/testing' },
              {
                text: 'Set Up Anvil & Fork',
                link: '/docs/guides/testing/anvil',
              },
              {
                text: 'Manipulate Account State',
                link: '/docs/guides/testing/accounts',
              },
              {
                text: 'Control Mining & Time',
                link: '/docs/guides/testing/mining-time',
              },
              {
                text: 'Snapshot & Restore',
                link: '/docs/guides/testing/snapshots',
              },
              {
                text: 'Inspect the Transaction Pool',
                link: '/docs/guides/testing/txpool',
              },
              {
                text: 'Test Contract Interactions',
                link: '/docs/guides/testing/contracts',
              },
            ],
          },
          {
            text: 'Tokens',
            collapsed: true,
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
            ],
          },
          {
            text: 'Transactions',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/transactions' },
              {
                text: 'Send Transactions',
                link: '/docs/guides/transactions/send',
              },
              {
                text: 'Prepare & Sign Transactions',
                link: '/docs/guides/transactions/prepare-sign',
              },
              {
                text: 'Estimate Gas & Fees',
                link: '/docs/guides/transactions/gas-fees',
              },
              {
                text: 'Track Transactions & Nonces',
                link: '/docs/guides/transactions/track',
              },
              {
                text: 'Blob Transactions',
                link: '/docs/guides/transactions/blobs',
              },
            ],
          },
          {
            text: 'Wallets & Accounts',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/guides/wallets' },
              {
                text: 'Connect a Wallet',
                link: '/docs/guides/wallets/connect',
              },
              {
                text: 'JSON-RPC Accounts',
                link: '/docs/guides/wallets/json-rpc-accounts',
              },
              {
                text: 'Local Accounts',
                link: '/docs/guides/wallets/local-accounts',
              },
              {
                text: 'Manage Chains',
                link: '/docs/guides/wallets/permissions-chains',
              },
              {
                text: 'Signatures & SIWE',
                link: '/docs/guides/wallets/signatures',
              },
              {
                text: 'Capabilities & Calls',
                link: '/docs/guides/wallets/capabilities',
              },
              {
                text: 'Batch Calls',
                link: '/docs/guides/wallets/batch-calls',
              },
              {
                text: 'Wallet Assets',
                link: '/docs/guides/wallets/assets',
              },
            ],
          },
          {
            text: 'WASM & Engines',
            link: '/docs/guides/engine',
          },
        ],
      },
      {
        text: 'Clients & Transports',
        collapsed: false,
        items: [
          {
            text: 'Client',
            items: [
              { text: 'Overview', link: '/docs/clients' },
              { text: 'Create a Client', link: '/docs/clients/create' },
              { text: 'Resolve Clients', link: '/docs/clients/resolve' },
              {
                text: 'Adapting v2 Clients',
                link: '/docs/clients/v2-adapters',
              },
              { text: 'Override Actions', link: '/docs/clients/override' },
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
          { text: 'Capabilities', link: '/docs/actions/capabilities' },
          {
            text: 'Address',
            collapsed: true,
            items: [
              {
                text: 'Get Balance',
                link: '/docs/actions/public/address/getBalance',
                badge: badge('public'),
              },
              {
                text: 'Get Bytecode',
                link: '/docs/actions/public/address/getCode',
                badge: badge('public'),
              },
              {
                text: 'Get Delegation',
                link: '/docs/actions/public/address/getDelegation',
                badge: badge('public'),
              },
              {
                text: 'Get State Proof',
                link: '/docs/actions/public/address/getProof',
                badge: badge('public'),
              },
              {
                text: 'Get Storage Value',
                link: '/docs/actions/public/address/getStorageAt',
                badge: badge('public'),
              },
              {
                text: 'Get Transaction Count',
                link: '/docs/actions/public/address/getTransactionCount',
                badge: badge('public'),
              },
              {
                text: 'Impersonate Account',
                link: '/docs/actions/test/address/impersonate',
                badge: badge('test'),
              },
              {
                text: 'Set Balance',
                link: '/docs/actions/test/address/setBalance',
                badge: badge('test'),
              },
              {
                text: 'Set Bytecode',
                link: '/docs/actions/test/address/setCode',
                badge: badge('test'),
              },
              {
                text: 'Set Nonce',
                link: '/docs/actions/test/address/setNonce',
                badge: badge('test'),
              },
              {
                text: 'Set Storage',
                link: '/docs/actions/test/address/setStorageAt',
                badge: badge('test'),
              },
              {
                text: 'Stop Impersonation',
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
                text: 'Create Block Filter',
                link: '/docs/actions/public/block/createFilter',
                badge: badge('public'),
              },
              {
                text: 'Get Block',
                link: '/docs/actions/public/block/get',
                badge: badge('public'),
              },
              {
                text: 'Get Block Number',
                link: '/docs/actions/public/block/getNumber',
                badge: badge('public'),
              },
              {
                text: 'Get Block Receipts',
                link: '/docs/actions/public/block/getReceipts',
                badge: badge('public'),
              },
              {
                text: 'Get Transaction Count',
                link: '/docs/actions/public/block/getTransactionCount',
                badge: badge('public'),
              },
              {
                text: 'Simulate Block',
                link: '/docs/actions/public/block/simulate',
                badge: badge('public'),
              },
              {
                text: 'Watch Block Number',
                link: '/docs/actions/public/block/watchNumber',
                badge: badge('public'),
              },
              {
                text: 'Watch Blocks',
                link: '/docs/actions/public/block/watch',
                badge: badge('public'),
              },
              {
                text: 'Configure Automine',
                link: '/docs/actions/test/block/setAutomine',
                badge: badge('test'),
              },
              {
                text: 'Configure Interval Mining',
                link: '/docs/actions/test/block/setIntervalMining',
                badge: badge('test'),
              },
              {
                text: 'Get Automine Status',
                link: '/docs/actions/test/block/getAutomine',
                badge: badge('test'),
              },
              {
                text: 'Increase Time',
                link: '/docs/actions/test/block/increaseTime',
                badge: badge('test'),
              },
              {
                text: 'Mine Blocks',
                link: '/docs/actions/test/block/mine',
                badge: badge('test'),
              },
              {
                text: 'Remove Timestamp Interval',
                link: '/docs/actions/test/block/removeTimestampInterval',
                badge: badge('test'),
              },
              {
                text: 'Set Coinbase',
                link: '/docs/actions/test/block/setCoinbase',
                badge: badge('test'),
              },
              {
                text: 'Set Gas Limit',
                link: '/docs/actions/test/block/setGasLimit',
                badge: badge('test'),
              },
              {
                text: 'Set Next Base Fee',
                link: '/docs/actions/test/block/setNextBaseFeePerGas',
                badge: badge('test'),
              },
              {
                text: 'Set Next Timestamp',
                link: '/docs/actions/test/block/setNextTimestamp',
                badge: badge('test'),
              },
              {
                text: 'Set Timestamp Interval',
                link: '/docs/actions/test/block/setTimestampInterval',
                badge: badge('test'),
              },
            ],
          },
          {
            text: 'Call',
            collapsed: true,
            items: [
              {
                text: 'Batch Calls',
                link: '/docs/actions/public/multicall',
                badge: badge('public'),
              },
              {
                text: 'Execute Call',
                link: '/docs/actions/public/call',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Chains',
            collapsed: true,
            items: [
              {
                text: 'Get Chain ID',
                link: '/docs/actions/public/chains/getId',
                badge: badge('public'),
              },
              {
                text: 'Add Chain',
                link: '/docs/actions/wallet/chains/add',
                badge: badge('wallet'),
              },
              {
                text: 'Switch Chain',
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
                text: 'Create Event Filter',
                link: '/docs/actions/public/contract/createEventFilter',
                badge: badge('public'),
              },
              {
                text: 'Estimate Gas',
                link: '/docs/actions/public/contract/estimateGas',
                badge: badge('public'),
              },
              {
                text: 'Get EIP-712 Domain',
                link: '/docs/actions/public/contract/getEip712Domain',
                badge: badge('public'),
              },
              {
                text: 'Get Event Logs',
                link: '/docs/actions/public/contract/getLogs',
                badge: badge('public'),
              },
              {
                text: 'Read Contract',
                link: '/docs/actions/public/contract/read',
                badge: badge('public'),
              },
              {
                text: 'Simulate Contract',
                link: '/docs/actions/public/contract/simulate',
                badge: badge('public'),
              },
              {
                text: 'Watch Events',
                link: '/docs/actions/public/contract/watchEvent',
                badge: badge('public'),
              },
              {
                text: 'Deploy Contract',
                link: '/docs/actions/wallet/contract/deploy',
                badge: badge('wallet'),
              },
              {
                text: 'Write Contract',
                link: '/docs/actions/wallet/contract/write',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'ENS',
            collapsed: true,
            items: [
              {
                text: 'Get Address',
                link: '/docs/actions/public/ens/getAddress',
                badge: badge('public'),
              },
              {
                text: 'Get Avatar',
                link: '/docs/actions/public/ens/getAvatar',
                badge: badge('public'),
              },
              {
                text: 'Get Primary Name',
                link: '/docs/actions/public/ens/getName',
                badge: badge('public'),
              },
              {
                text: 'Get Resolver Address',
                link: '/docs/actions/public/ens/getResolver',
                badge: badge('public'),
              },
              {
                text: 'Get Text Record',
                link: '/docs/actions/public/ens/getText',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Event',
            collapsed: true,
            items: [
              {
                text: 'Create Event Filter',
                link: '/docs/actions/public/event/createFilter',
                badge: badge('public'),
              },
              {
                text: 'Get Event Logs',
                link: '/docs/actions/public/event/getLogs',
                badge: badge('public'),
              },
              {
                text: 'Watch Events',
                link: '/docs/actions/public/event/watch',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Fee',
            collapsed: true,
            items: [
              {
                text: 'Estimate Fees',
                link: '/docs/actions/public/fee/estimateFeesPerGas',
                badge: badge('public'),
              },
              {
                text: 'Estimate Priority Fee',
                link: '/docs/actions/public/fee/estimateMaxPriorityFeePerGas',
                badge: badge('public'),
              },
              {
                text: 'Get Blob Base Fee',
                link: '/docs/actions/public/fee/getBlobBaseFee',
                badge: badge('public'),
              },
              {
                text: 'Get Fee History',
                link: '/docs/actions/public/fee/getHistory',
                badge: badge('public'),
              },
              {
                text: 'Get Gas Price',
                link: '/docs/actions/public/fee/getGasPrice',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Filter',
            collapsed: true,
            items: [
              {
                text: 'Get Filter Changes',
                link: '/docs/actions/public/filter/getChanges',
                badge: badge('public'),
              },
              {
                text: 'Get Filter Logs',
                link: '/docs/actions/public/filter/getLogs',
                badge: badge('public'),
              },
              {
                text: 'Uninstall Filter',
                link: '/docs/actions/public/filter/uninstall',
                badge: badge('public'),
              },
            ],
          },
          {
            text: 'Node',
            collapsed: true,
            items: [
              {
                text: 'Configure Logging',
                link: '/docs/actions/test/node/setLoggingEnabled',
                badge: badge('test'),
              },
              {
                text: 'Set Minimum Gas Price',
                link: '/docs/actions/test/node/setMinGasPrice',
                badge: badge('test'),
              },
              {
                text: 'Set RPC URL',
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
                text: 'Verify Hash',
                link: '/docs/actions/public/verifyHash',
                badge: badge('public'),
              },
              {
                text: 'Verify Message',
                link: '/docs/actions/public/verifyMessage',
                badge: badge('public'),
              },
              {
                text: 'Verify SIWE Message',
                link: '/docs/actions/public/siwe/verify',
                badge: badge('public'),
              },
              {
                text: 'Verify Typed Data',
                link: '/docs/actions/public/typedData/verify',
                badge: badge('public'),
              },
              {
                text: 'Sign Message',
                link: '/docs/actions/wallet/signMessage',
                badge: badge('wallet'),
              },
              {
                text: 'Sign Transaction',
                link: '/docs/actions/wallet/signTransaction',
                badge: badge('wallet'),
              },
              {
                text: 'Sign Typed Data',
                link: '/docs/actions/wallet/typedData/sign',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'State',
            collapsed: true,
            items: [
              {
                text: 'Dump State',
                link: '/docs/actions/test/state/dump',
                badge: badge('test'),
              },
              {
                text: 'Load State',
                link: '/docs/actions/test/state/load',
                badge: badge('test'),
              },
              {
                text: 'Reset State',
                link: '/docs/actions/test/state/reset',
                badge: badge('test'),
              },
              {
                text: 'Revert State',
                link: '/docs/actions/test/state/revert',
                badge: badge('test'),
              },
              {
                text: 'Snapshot State',
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
                text: 'Get Allowance',
                link: '/docs/actions/public/token/getAllowance',
                badge: badge('public'),
              },
              {
                text: 'Get Balance',
                link: '/docs/actions/public/token/getBalance',
                badge: badge('public'),
              },
              {
                text: 'Get Metadata',
                link: '/docs/actions/public/token/getMetadata',
                badge: badge('public'),
              },
              {
                text: 'Get Total Supply',
                link: '/docs/actions/public/token/getTotalSupply',
                badge: badge('public'),
              },
              {
                text: 'Approve Spending',
                link: '/docs/actions/wallet/token/approve',
                badge: badge('wallet'),
              },
              {
                text: 'Transfer Tokens',
                link: '/docs/actions/wallet/token/transfer',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'Transaction',
            collapsed: true,
            items: [
              {
                text: 'Create Access List',
                link: '/docs/actions/public/transaction/createAccessList',
                badge: badge('public'),
              },
              {
                text: 'Create Pending Filter',
                link: '/docs/actions/public/transaction/createPendingFilter',
                badge: badge('public'),
              },
              {
                text: 'Estimate Gas',
                link: '/docs/actions/public/transaction/estimateGas',
                badge: badge('public'),
              },
              {
                text: 'Fill Request',
                link: '/docs/actions/public/transaction/fill',
                badge: badge('public'),
              },
              {
                text: 'Get Confirmations',
                link: '/docs/actions/public/transaction/getConfirmations',
                badge: badge('public'),
              },
              {
                text: 'Get Raw Transaction',
                link: '/docs/actions/public/transaction/getRaw',
                badge: badge('public'),
              },
              {
                text: 'Get Receipt',
                link: '/docs/actions/public/transaction/getReceipt',
                badge: badge('public'),
              },
              {
                text: 'Get Transaction',
                link: '/docs/actions/public/transaction/get',
                badge: badge('public'),
              },
              {
                text: 'Prepare Transaction',
                link: '/docs/actions/public/transaction/prepare',
                badge: badge('public'),
              },
              {
                text: 'Wait for Receipt',
                link: '/docs/actions/public/transaction/waitForReceipt',
                badge: badge('public'),
              },
              {
                text: 'Watch Pending Transactions',
                link: '/docs/actions/public/transaction/watchPending',
                badge: badge('public'),
              },
              {
                text: 'Send Raw Transaction',
                link: '/docs/actions/wallet/transaction/sendRaw',
                badge: badge('wallet'),
              },
              {
                text: 'Send Transaction',
                link: '/docs/actions/wallet/transaction/send',
                badge: badge('wallet'),
              },
              {
                text: 'Sign Transaction',
                link: '/docs/actions/wallet/transaction/sign',
                badge: badge('wallet'),
              },
            ],
          },
          {
            text: 'Transaction Pool',
            collapsed: true,
            items: [
              {
                text: 'Drop Transaction',
                link: '/docs/actions/test/txpool/dropTransaction',
                badge: badge('test'),
              },
              {
                text: 'Get Pool Status',
                link: '/docs/actions/test/txpool/getStatus',
                badge: badge('test'),
              },
              {
                text: 'Inspect Pool',
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
                text: 'Connect Wallet',
                link: '/docs/actions/wallet/connect',
                badge: badge('wallet'),
              },
              {
                text: 'Disconnect Wallet',
                link: '/docs/actions/wallet/disconnect',
                badge: badge('wallet'),
              },
              {
                text: 'Get Addresses',
                link: '/docs/actions/wallet/getAddresses',
                badge: badge('wallet'),
              },
              {
                text: 'Get Assets',
                link: '/docs/actions/wallet/getAssets',
                badge: badge('wallet'),
              },
              {
                text: 'Get Call Status',
                link: '/docs/actions/wallet/getCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'Get Capabilities',
                link: '/docs/actions/wallet/getCapabilities',
                badge: badge('wallet'),
              },
              {
                text: 'Get Permissions',
                link: '/docs/actions/wallet/getPermissions',
                badge: badge('wallet'),
              },
              {
                text: 'Prepare Authorization',
                link: '/docs/actions/wallet/prepareAuthorization',
                badge: badge('wallet'),
              },
              {
                text: 'Request Addresses',
                link: '/docs/actions/wallet/requestAddresses',
                badge: badge('wallet'),
              },
              {
                text: 'Request Permissions',
                link: '/docs/actions/wallet/requestPermissions',
                badge: badge('wallet'),
              },
              {
                text: 'Send Calls',
                link: '/docs/actions/wallet/sendCalls',
                badge: badge('wallet'),
              },
              {
                text: 'Show Call Status',
                link: '/docs/actions/wallet/showCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'Sign Authorization',
                link: '/docs/actions/wallet/signAuthorization',
                badge: badge('wallet'),
              },
              {
                text: 'Wait for Call Status',
                link: '/docs/actions/wallet/waitForCallsStatus',
                badge: badge('wallet'),
              },
              {
                text: 'Watch Asset',
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
          {
            text: 'Create an Instance',
            link: '/docs/contract/instances/create',
          },
          { text: 'Read Functions', link: '/docs/contract/instances/read' },
          { text: 'Write Functions', link: '/docs/contract/instances/write' },
          {
            text: 'Simulate Functions',
            link: '/docs/contract/instances/simulate',
          },
          {
            text: 'Estimate Gas',
            link: '/docs/contract/instances/estimateGas',
          },
          {
            text: 'Create Event Filters',
            link: '/docs/contract/instances/createEventFilter',
          },
          {
            text: 'Query Event Logs',
            link: '/docs/contract/instances/getLogs',
          },
          {
            text: 'Watch Events',
            link: '/docs/contract/instances/watchEvent',
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
                text: 'Private Key Accounts',
                link: '/docs/accounts/local/private-key',
              },
              {
                text: 'Passkey Accounts',
                link: '/docs/accounts/local/passkey',
              },
              {
                text: 'Mnemonic Accounts',
                link: '/docs/accounts/local/mnemonic',
              },
              {
                text: 'HD Accounts',
                link: '/docs/accounts/local/hd',
              },
              {
                text: 'Custom Accounts',
                link: '/docs/accounts/local/custom',
              },
            ],
          },
          { text: 'Nonce Manager', link: '/docs/accounts/nonce-manager' },
        ],
      },
      {
        text: 'Addresses',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/docs/addresses' },
          { text: 'CREATE2 Deployer', link: '/docs/addresses/create2' },
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
                text: 'Execute Calls',
                link: '/docs/actions/erc7821/execute',
              },
              {
                text: 'Execute Batches',
                link: '/docs/actions/erc7821/executeBatches',
              },
              {
                text: 'Check Execution Mode',
                link: '/docs/actions/erc7821/supportsExecutionMode',
              },
            ],
          },
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
              {
                text: 'getRoleAdmin',
                link: '/tokens/tempo/getRoleAdmin',
              },
              { text: 'grantRoles', link: '/tokens/tempo/grantRoles' },
              { text: 'hasRole', link: '/tokens/tempo/hasRole' },
              { text: 'mint', link: '/tokens/tempo/mint' },
              { text: 'pause', link: '/tokens/tempo/pause' },
              {
                text: 'prepareUpdateQuoteToken',
                link: '/tokens/tempo/prepareUpdateQuoteToken',
              },
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
              {
                text: 'updateQuoteToken',
                link: '/tokens/tempo/updateQuoteToken',
              },
              {
                text: 'watchAdminRole',
                link: '/tokens/tempo/watchAdminRole',
              },
              {
                text: 'watchApprove',
                link: '/tokens/tempo/watchApprove',
              },
              { text: 'watchBurn', link: '/tokens/tempo/watchBurn' },
              { text: 'watchCreate', link: '/tokens/tempo/watchCreate' },
              { text: 'watchMint', link: '/tokens/tempo/watchMint' },
              { text: 'watchRole', link: '/tokens/tempo/watchRole' },
              {
                text: 'watchTransfer',
                link: '/tokens/tempo/watchTransfer',
              },
              {
                text: 'watchUpdateQuoteToken',
                link: '/tokens/tempo/watchUpdateQuoteToken',
              },
            ],
          },
        ],
      },
    ],
    '/account-abstraction': [
      {
        text: 'Account Abstraction',
        items: [
          { text: 'Getting Started', link: '/account-abstraction' },
          {
            text: 'EntryPoint Versions',
            link: '/account-abstraction/entry-point-versions',
          },
          {
            text: 'Migrate from v2',
            link: '/account-abstraction/migration',
          },
        ],
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'Sending User Operations',
            link: '/account-abstraction/guides/sending-user-operations',
          },
        ],
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
            text: 'Smart Accounts',
            link: '/account-abstraction/accounts/smart',
            items: [
              {
                text: 'Coinbase',
                link: '/account-abstraction/accounts/coinbase',
              },
              {
                text: 'MetaMask',
                link: '/account-abstraction/accounts/smart/toMetaMaskSmartAccount',
              },
              {
                text: 'Thirdweb',
                link: '/account-abstraction/accounts/smart/toThirdwebSmartAccount',
              },
              {
                text: 'Biconomy',
                link: '/account-abstraction/accounts/smart/toNexusSmartAccount',
              },
              {
                text: 'Alchemy',
                link: '/account-abstraction/accounts/smart/toLightSmartAccount',
              },
              {
                text: 'Kernel (ZeroDev)',
                link: '/account-abstraction/accounts/smart/toEcdsaKernelSmartAccount',
              },
              {
                text: 'Safe',
                link: '/account-abstraction/accounts/smart/toSafeSmartAccount',
              },
              {
                text: 'Simple',
                link: '/account-abstraction/accounts/smart/toSimpleSmartAccount',
              },
              {
                text: 'Solady',
                link: '/account-abstraction/accounts/solady',
              },
              {
                text: 'Simple7702',
                link: '/account-abstraction/accounts/simple-7702',
              },
              {
                text: 'Trust',
                link: '/account-abstraction/accounts/smart/toTrustSmartAccount',
              },
              {
                text: 'Custom',
                link: '/account-abstraction/accounts/custom',
              },
            ],
          },
          {
            text: 'WebAuthn Account',
            link: '/account-abstraction/accounts/webauthn',
            items: [
              {
                text: 'fromCredential',
                link: '/account-abstraction/accounts/webauthn/fromCredential',
              },
              {
                text: 'createCredential',
                link: '/account-abstraction/accounts/webauthn/createCredential',
              },
            ],
          },
        ],
      },
      {
        text: 'Actions',
        items: [
          {
            text: 'EntryPoint',
            items: [
              {
                text: 'getSupported',
                link: '/account-abstraction/actions/entryPoint.getSupported',
              },
            ],
          },
          {
            text: 'Paymaster',
            items: [
              {
                text: 'getData',
                link: '/account-abstraction/actions/paymaster.getData',
              },
              {
                text: 'getStubData',
                link: '/account-abstraction/actions/paymaster.getStubData',
              },
            ],
          },
          {
            text: 'UserOperation',
            items: [
              {
                text: 'prepare',
                link: '/account-abstraction/actions/userOperation.prepare',
              },
              {
                text: 'estimateGas',
                link: '/account-abstraction/actions/userOperation.estimateGas',
              },
              {
                text: 'send',
                link: '/account-abstraction/actions/userOperation.send',
              },
              {
                text: 'get',
                link: '/account-abstraction/actions/userOperation.get',
              },
              {
                text: 'getReceipt',
                link: '/account-abstraction/actions/userOperation.getReceipt',
              },
              {
                text: 'waitForReceipt',
                link: '/account-abstraction/actions/userOperation.waitForReceipt',
              },
            ],
          },
        ],
      },
    ],
    '/op-stack': [
      { text: 'Overview', link: '/op-stack' },
      { text: 'Client Decorators', link: '/op-stack/client' },
      { text: 'Deposits', link: '/op-stack/deposits' },
      { text: 'Withdrawals', link: '/op-stack/withdrawals' },
      {
        text: 'L1 Actions',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/op-stack/actions/l1' },
          {
            text: 'Deposits',
            items: [
              {
                text: 'depositTransaction',
                link: '/op-stack/actions/l1/depositTransaction',
              },
              {
                text: 'estimateDepositTransactionGas',
                link: '/op-stack/actions/l1/estimateDepositTransactionGas',
              },
            ],
          },
          {
            text: 'Withdrawals',
            items: [
              {
                text: 'buildInitiateWithdrawal',
                link: '/op-stack/actions/l1/buildInitiateWithdrawal',
              },
              {
                text: 'estimateFinalizeWithdrawalGas',
                link: '/op-stack/actions/l1/estimateFinalizeWithdrawalGas',
              },
              {
                text: 'estimateProveWithdrawalGas',
                link: '/op-stack/actions/l1/estimateProveWithdrawalGas',
              },
              {
                text: 'finalizeWithdrawal',
                link: '/op-stack/actions/l1/finalizeWithdrawal',
              },
              {
                text: 'getTimeToFinalize',
                link: '/op-stack/actions/l1/getTimeToFinalize',
              },
              {
                text: 'getTimeToProve',
                link: '/op-stack/actions/l1/getTimeToProve',
              },
              {
                text: 'getWithdrawalStatus',
                link: '/op-stack/actions/l1/getWithdrawalStatus',
              },
              {
                text: 'proveWithdrawal',
                link: '/op-stack/actions/l1/proveWithdrawal',
              },
              {
                text: 'waitToFinalize',
                link: '/op-stack/actions/l1/waitToFinalize',
              },
              {
                text: 'waitToProve',
                link: '/op-stack/actions/l1/waitToProve',
              },
            ],
          },
          {
            text: 'Outputs & Dispute Games',
            items: [
              {
                text: 'getGame',
                link: '/op-stack/actions/l1/getGame',
              },
              {
                text: 'getGames',
                link: '/op-stack/actions/l1/getGames',
              },
              {
                text: 'getL2Output',
                link: '/op-stack/actions/l1/getL2Output',
              },
              {
                text: 'getTimeToNextGame',
                link: '/op-stack/actions/l1/getTimeToNextGame',
              },
              {
                text: 'getTimeToNextL2Output',
                link: '/op-stack/actions/l1/getTimeToNextL2Output',
              },
              {
                text: 'waitForNextGame',
                link: '/op-stack/actions/l1/waitForNextGame',
              },
              {
                text: 'waitForNextL2Output',
                link: '/op-stack/actions/l1/waitForNextL2Output',
              },
            ],
          },
          {
            text: 'Portal',
            items: [
              {
                text: 'getPortalVersion',
                link: '/op-stack/actions/l1/getPortalVersion',
              },
            ],
          },
        ],
      },
      {
        text: 'L2 Actions',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/op-stack/actions/l2' },
          {
            text: 'Deposits & Withdrawals',
            items: [
              {
                text: 'buildDepositTransaction',
                link: '/op-stack/actions/l2/buildDepositTransaction',
              },
              {
                text: 'buildProveWithdrawal',
                link: '/op-stack/actions/l2/buildProveWithdrawal',
              },
              {
                text: 'estimateInitiateWithdrawalGas',
                link: '/op-stack/actions/l2/estimateInitiateWithdrawalGas',
              },
              {
                text: 'initiateWithdrawal',
                link: '/op-stack/actions/l2/initiateWithdrawal',
              },
            ],
          },
          {
            text: 'Transaction Fees',
            items: [
              {
                text: 'estimateL1Fee',
                link: '/op-stack/actions/l2/estimateL1Fee',
              },
              {
                text: 'estimateL1Gas',
                link: '/op-stack/actions/l2/estimateL1Gas',
              },
              {
                text: 'estimateOperatorFee',
                link: '/op-stack/actions/l2/estimateOperatorFee',
              },
              {
                text: 'estimateTotalFee',
                link: '/op-stack/actions/l2/estimateTotalFee',
              },
              {
                text: 'estimateTotalGas',
                link: '/op-stack/actions/l2/estimateTotalGas',
              },
              {
                text: 'getL1BaseFee',
                link: '/op-stack/actions/l2/getL1BaseFee',
              },
            ],
          },
          {
            text: 'Contract Fees',
            items: [
              {
                text: 'estimateContractL1Fee',
                link: '/op-stack/actions/l2/estimateContractL1Fee',
              },
              {
                text: 'estimateContractL1Gas',
                link: '/op-stack/actions/l2/estimateContractL1Gas',
              },
              {
                text: 'estimateContractTotalFee',
                link: '/op-stack/actions/l2/estimateContractTotalFee',
              },
              {
                text: 'estimateContractTotalGas',
                link: '/op-stack/actions/l2/estimateContractTotalGas',
              },
            ],
          },
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
            text: 'Earn',
            collapsed: true,
            items: [
              {
                badge: { text: 'EXP', variant: 'warning' },
                text: 'Overview',
                link: '/tempo/guides/earn',
              },
              {
                badge: { text: 'EXP', variant: 'warning' },
                text: 'Deposit & Withdraw',
                link: '/tempo/guides/earn/deposit-withdraw',
              },
              {
                badge: { text: 'EXP', variant: 'warning' },
                text: 'Protected Vaults',
                link: '/tempo/guides/earn/protected-vaults',
              },
              {
                badge: { text: 'EXP', variant: 'warning' },
                text: 'Earn with Private Zones',
                link: '/tempo/guides/earn/zones',
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
                badge: badge('public'),
                text: 'Check Admin',
                link: '/tempo/actions/accessKey.isAdmin',
              },
              {
                badge: badge('public'),
                text: 'Check Burned Witness',
                link: '/tempo/actions/accessKey.isWitnessBurned',
              },
              {
                badge: badge('public'),
                text: 'Get Metadata',
                link: '/tempo/actions/accessKey.getMetadata',
              },
              {
                badge: badge('public'),
                text: 'Get Remaining Limit',
                link: '/tempo/actions/accessKey.getRemainingLimit',
              },
              {
                badge: badge('public'),
                text: 'Verify Hash',
                link: '/tempo/actions/accessKey.verifyHash',
              },
              {
                badge: badge('public'),
                text: 'Watch Admin Authorizations',
                link: '/tempo/actions/accessKey.watchAdminAuthorized',
              },
              {
                badge: badge('public'),
                text: 'Watch Burned Witnesses',
                link: '/tempo/actions/accessKey.watchWitnessBurned',
              },
              {
                badge: badge('public'),
                text: 'Watch Witnesses',
                link: '/tempo/actions/accessKey.watchWitness',
              },
              {
                badge: badge('wallet'),
                text: 'Authorize',
                link: '/tempo/actions/accessKey.authorize',
              },
              {
                badge: badge('wallet'),
                text: 'Burn Witness',
                link: '/tempo/actions/accessKey.burnWitness',
              },
              {
                badge: badge('wallet'),
                text: 'Revoke',
                link: '/tempo/actions/accessKey.revoke',
              },
              {
                badge: badge('wallet'),
                text: 'Sign Authorization',
                link: '/tempo/actions/accessKey.signAuthorization',
              },
              {
                badge: badge('wallet'),
                text: 'Update Limit',
                link: '/tempo/actions/accessKey.updateLimit',
              },
            ],
          },
          {
            text: 'AMM',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Liquidity Balance',
                link: '/tempo/actions/amm.getLiquidityBalance',
              },
              {
                badge: badge('public'),
                text: 'Get Pool',
                link: '/tempo/actions/amm.getPool',
              },
              {
                badge: badge('public'),
                text: 'Watch Liquidity Burns',
                link: '/tempo/actions/amm.watchBurn',
              },
              {
                badge: badge('public'),
                text: 'Watch Liquidity Mints',
                link: '/tempo/actions/amm.watchMint',
              },
              {
                badge: badge('public'),
                text: 'Watch Rebalance Swaps',
                link: '/tempo/actions/amm.watchRebalanceSwap',
              },
              {
                badge: badge('wallet'),
                text: 'Burn Liquidity',
                link: '/tempo/actions/amm.burn',
              },
              {
                badge: badge('wallet'),
                text: 'Mint Liquidity',
                link: '/tempo/actions/amm.mint',
              },
              {
                badge: badge('wallet'),
                text: 'Rebalance Swap',
                link: '/tempo/actions/amm.rebalanceSwap',
              },
            ],
          },
          {
            text: 'Channel',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Channel States',
                link: '/tempo/actions/channel.getStates',
              },
              {
                badge: badge('wallet'),
                text: 'Close Channel',
                link: '/tempo/actions/channel.close',
              },
              {
                badge: badge('wallet'),
                text: 'Open Channel',
                link: '/tempo/actions/channel.open',
              },
              {
                badge: badge('wallet'),
                text: 'Request Channel Close',
                link: '/tempo/actions/channel.requestClose',
              },
              {
                badge: badge('wallet'),
                text: 'Settle Channel Voucher',
                link: '/tempo/actions/channel.settle',
              },
              {
                badge: badge('wallet'),
                text: 'Sign Channel Voucher',
                link: '/tempo/actions/channel.signVoucher',
              },
              {
                badge: badge('wallet'),
                text: 'Top Up Channel',
                link: '/tempo/actions/channel.topUp',
              },
              {
                badge: badge('wallet'),
                text: 'Withdraw Channel Funds',
                link: '/tempo/actions/channel.withdraw',
              },
            ],
          },
          {
            text: 'DEX',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Balance',
                link: '/tempo/actions/dex.getBalance',
              },
              {
                badge: badge('public'),
                text: 'Get Buy Quote',
                link: '/tempo/actions/dex.getBuyQuote',
              },
              {
                badge: badge('public'),
                text: 'Get Order',
                link: '/tempo/actions/dex.getOrder',
              },
              {
                badge: badge('public'),
                text: 'Get Orderbook',
                link: '/tempo/actions/dex.getOrderbook',
              },
              {
                badge: badge('public'),
                text: 'Get Sell Quote',
                link: '/tempo/actions/dex.getSellQuote',
              },
              {
                badge: badge('public'),
                text: 'Get Tick Level',
                link: '/tempo/actions/dex.getTickLevel',
              },
              {
                badge: badge('public'),
                text: 'Watch Flip Orders',
                link: '/tempo/actions/dex.watchFlipOrderPlaced',
              },
              {
                badge: badge('public'),
                text: 'Watch Order Cancellations',
                link: '/tempo/actions/dex.watchOrderCancelled',
              },
              {
                badge: badge('public'),
                text: 'Watch Order Fills',
                link: '/tempo/actions/dex.watchOrderFilled',
              },
              {
                badge: badge('public'),
                text: 'Watch Orders',
                link: '/tempo/actions/dex.watchOrderPlaced',
              },
              {
                badge: badge('wallet'),
                text: 'Buy Tokens',
                link: '/tempo/actions/dex.buy',
              },
              {
                badge: badge('wallet'),
                text: 'Cancel Order',
                link: '/tempo/actions/dex.cancel',
              },
              {
                badge: badge('wallet'),
                text: 'Cancel Stale Order',
                link: '/tempo/actions/dex.cancelStale',
              },
              {
                badge: badge('wallet'),
                text: 'Create Pair',
                link: '/tempo/actions/dex.createPair',
              },
              {
                badge: badge('wallet'),
                text: 'Place Flip Order',
                link: '/tempo/actions/dex.placeFlip',
              },
              {
                badge: badge('wallet'),
                text: 'Place Order',
                link: '/tempo/actions/dex.place',
              },
              {
                badge: badge('wallet'),
                text: 'Sell Tokens',
                link: '/tempo/actions/dex.sell',
              },
              {
                badge: badge('wallet'),
                text: 'Withdraw Balance',
                link: '/tempo/actions/dex.withdraw',
              },
            ],
          },
          {
            badge: { text: 'EXP', variant: 'warning' },
            text: 'Earn',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Fee State',
                link: '/tempo/actions/earn.getFeeState',
              },
              {
                badge: badge('public'),
                text: 'Get Position',
                link: '/tempo/actions/earn.getPosition',
              },
              {
                badge: badge('public'),
                text: 'Get Private Deposit',
                link: '/tempo/actions/earn.privateDeposit',
              },
              {
                badge: badge('public'),
                text: 'Get Private Redeem',
                link: '/tempo/actions/earn.privateRedeem',
              },
              {
                badge: badge('public'),
                text: 'Get Redeem Quote',
                link: '/tempo/actions/earn.getRedeemQuote',
              },
              {
                badge: badge('public'),
                text: 'Get Vault',
                link: '/tempo/actions/earn.getVault',
              },
              {
                badge: badge('public'),
                text: 'Get Withdraw Quote',
                link: '/tempo/actions/earn.getWithdrawQuote',
              },
              {
                badge: badge('public'),
                text: 'Validate Exit-Safe Policy',
                link: '/tempo/actions/earn.validateExitSafePolicy',
              },
              {
                badge: badge('public'),
                text: 'Wait for Private Deposit',
                link: '/tempo/actions/earn.waitForPrivateDeposit',
              },
              {
                badge: badge('public'),
                text: 'Wait for Private Redeem',
                link: '/tempo/actions/earn.waitForPrivateRedeem',
              },
              {
                badge: badge('wallet'),
                text: 'Configure Exit-Safe Policy',
                link: '/tempo/actions/earn.configureExitSafePolicy',
              },
              {
                badge: badge('wallet'),
                text: 'Deposit into Vault',
                link: '/tempo/actions/earn.deposit',
              },
              {
                badge: badge('wallet'),
                text: 'Deposit Shares into Vault',
                link: '/tempo/actions/earn.depositShares',
              },
              {
                badge: badge('wallet'),
                text: 'Redeem Shares',
                link: '/tempo/actions/earn.redeem',
              },
              {
                badge: badge('wallet'),
                text: 'Withdraw Exact Assets',
                link: '/tempo/actions/earn.withdrawExact',
              },
            ],
          },
          {
            text: 'Faucet',
            collapsed: true,
            items: [
              {
                badge: badge('test'),
                text: 'Fund Account',
                link: '/tempo/actions/faucet.fund',
              },
            ],
          },
          {
            text: 'Fee',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get User Fee Token',
                link: '/tempo/actions/fee.getUserToken',
              },
              {
                badge: badge('public'),
                text: 'Get Validator Fee Token',
                link: '/tempo/actions/fee.getValidatorToken',
              },
              {
                badge: badge('public'),
                text: 'Validate Fee Token',
                link: '/tempo/actions/fee.validateToken',
              },
              {
                badge: badge('public'),
                text: 'Watch User Fee Token',
                link: '/tempo/actions/fee.watchSetUserToken',
              },
              {
                badge: badge('public'),
                text: 'Watch Validator Fee Token',
                link: '/tempo/actions/fee.watchSetValidatorToken',
              },
              {
                badge: badge('wallet'),
                text: 'Set User Fee Token',
                link: '/tempo/actions/fee.setUserToken',
              },
              {
                badge: badge('wallet'),
                text: 'Set Validator Fee Token',
                link: '/tempo/actions/fee.setValidatorToken',
              },
            ],
          },
          {
            text: 'Nonce',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Nonce',
                link: '/tempo/actions/nonce.get',
              },
              {
                badge: badge('public'),
                text: 'Watch Nonce Increments',
                link: '/tempo/actions/nonce.watchIncremented',
              },
            ],
          },
          {
            text: 'Policy',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Check Transfer Policy Authorization',
                link: '/tempo/actions/policy.isAuthorized',
              },
              {
                badge: badge('public'),
                text: 'Get Transfer Policy Data',
                link: '/tempo/actions/policy.getData',
              },
              {
                badge: badge('public'),
                text: 'Watch Transfer Policy Admin',
                link: '/tempo/actions/policy.watchAdminUpdated',
              },
              {
                badge: badge('public'),
                text: 'Watch Transfer Policy Blacklist',
                link: '/tempo/actions/policy.watchBlacklistUpdated',
              },
              {
                badge: badge('public'),
                text: 'Watch Transfer Policy Creation',
                link: '/tempo/actions/policy.watchCreate',
              },
              {
                badge: badge('public'),
                text: 'Watch Transfer Policy Whitelist',
                link: '/tempo/actions/policy.watchWhitelistUpdated',
              },
              {
                badge: badge('wallet'),
                text: 'Create Transfer Policy',
                link: '/tempo/actions/policy.create',
              },
              {
                badge: badge('wallet'),
                text: 'Modify Transfer Policy Blacklist',
                link: '/tempo/actions/policy.modifyBlacklist',
              },
              {
                badge: badge('wallet'),
                text: 'Modify Transfer Policy Whitelist',
                link: '/tempo/actions/policy.modifyWhitelist',
              },
              {
                badge: badge('wallet'),
                text: 'Set Transfer Policy Admin',
                link: '/tempo/actions/policy.setAdmin',
              },
            ],
          },
          {
            text: 'Receive Policy',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Blocked Balance',
                link: '/tempo/actions/receivePolicy.getBlockedBalance',
              },
              {
                badge: badge('public'),
                text: 'Get Receive Policy',
                link: '/tempo/actions/receivePolicy.get',
              },
              {
                badge: badge('public'),
                text: 'Validate Receive Policy',
                link: '/tempo/actions/receivePolicy.validate',
              },
              {
                badge: badge('public'),
                text: 'Watch Blocked Transfers',
                link: '/tempo/actions/receivePolicy.watchBlocked',
              },
              {
                badge: badge('public'),
                text: 'Watch Burned Receipts',
                link: '/tempo/actions/receivePolicy.watchBurned',
              },
              {
                badge: badge('public'),
                text: 'Watch Claimed Receipts',
                link: '/tempo/actions/receivePolicy.watchClaimed',
              },
              {
                badge: badge('public'),
                text: 'Watch Receive Policy Updates',
                link: '/tempo/actions/receivePolicy.watchUpdated',
              },
              {
                badge: badge('wallet'),
                text: 'Burn Blocked Funds',
                link: '/tempo/actions/receivePolicy.burn',
              },
              {
                badge: badge('wallet'),
                text: 'Claim Blocked Funds',
                link: '/tempo/actions/receivePolicy.claim',
              },
              {
                badge: badge('wallet'),
                text: 'Set Receive Policy',
                link: '/tempo/actions/receivePolicy.set',
              },
            ],
          },
          {
            text: 'Token',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Check Role',
                link: '/tempo/actions/token.hasRole',
              },
              {
                badge: badge('public'),
                text: 'Get Allowance',
                link: '/tempo/actions/token.getAllowance',
              },
              {
                badge: badge('public'),
                text: 'Get Balance',
                link: '/tempo/actions/token.getBalance',
              },
              {
                badge: badge('public'),
                text: 'Get Metadata',
                link: '/tempo/actions/token.getMetadata',
              },
              {
                badge: badge('public'),
                text: 'Get Role Admin',
                link: '/tempo/actions/token.getRoleAdmin',
              },
              {
                badge: badge('public'),
                text: 'Get Total Supply',
                link: '/tempo/actions/token.getTotalSupply',
              },
              {
                badge: badge('public'),
                text: 'Watch Approvals',
                link: '/tempo/actions/token.watchApprove',
              },
              {
                badge: badge('public'),
                text: 'Watch Burns',
                link: '/tempo/actions/token.watchBurn',
              },
              {
                badge: badge('public'),
                text: 'Watch Creation',
                link: '/tempo/actions/token.watchCreate',
              },
              {
                badge: badge('public'),
                text: 'Watch Mints',
                link: '/tempo/actions/token.watchMint',
              },
              {
                badge: badge('public'),
                text: 'Watch Quote Updates',
                link: '/tempo/actions/token.watchUpdateQuoteToken',
              },
              {
                badge: badge('public'),
                text: 'Watch Role Admin',
                link: '/tempo/actions/token.watchAdminRole',
              },
              {
                badge: badge('public'),
                text: 'Watch Roles',
                link: '/tempo/actions/token.watchRole',
              },
              {
                badge: badge('public'),
                text: 'Watch Transfers',
                link: '/tempo/actions/token.watchTransfer',
              },
              {
                badge: badge('wallet'),
                text: 'Approve Spending',
                link: '/tempo/actions/token.approve',
              },
              {
                badge: badge('wallet'),
                text: 'Burn',
                link: '/tempo/actions/token.burn',
              },
              {
                badge: badge('wallet'),
                text: 'Burn from Blocked Address',
                link: '/tempo/actions/token.burnBlocked',
              },
              {
                badge: badge('wallet'),
                text: 'Change Transfer Policy',
                link: '/tempo/actions/token.changeTransferPolicy',
              },
              {
                badge: badge('wallet'),
                text: 'Create',
                link: '/tempo/actions/token.create',
              },
              {
                badge: badge('wallet'),
                text: 'Grant Roles',
                link: '/tempo/actions/token.grantRoles',
              },
              {
                badge: badge('wallet'),
                text: 'Mint',
                link: '/tempo/actions/token.mint',
              },
              {
                badge: badge('wallet'),
                text: 'Pause',
                link: '/tempo/actions/token.pause',
              },
              {
                badge: badge('wallet'),
                text: 'Prepare Quote Update',
                link: '/tempo/actions/token.prepareUpdateQuoteToken',
              },
              {
                badge: badge('wallet'),
                text: 'Renounce Roles',
                link: '/tempo/actions/token.renounceRoles',
              },
              {
                badge: badge('wallet'),
                text: 'Revoke Roles',
                link: '/tempo/actions/token.revokeRoles',
              },
              {
                badge: badge('wallet'),
                text: 'Set Role Admin',
                link: '/tempo/actions/token.setRoleAdmin',
              },
              {
                badge: badge('wallet'),
                text: 'Set Supply Cap',
                link: '/tempo/actions/token.setSupplyCap',
              },
              {
                badge: badge('wallet'),
                text: 'Transfer',
                link: '/tempo/actions/token.transfer',
              },
              {
                badge: badge('wallet'),
                text: 'Unpause',
                link: '/tempo/actions/token.unpause',
              },
              {
                badge: badge('wallet'),
                text: 'Update Quote',
                link: '/tempo/actions/token.updateQuoteToken',
              },
            ],
          },
          {
            text: 'Validator',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Next Full DKG Ceremony',
                link: '/tempo/actions/validator.getNextFullDkgCeremony',
              },
              {
                badge: badge('public'),
                text: 'Get Validator',
                link: '/tempo/actions/validator.get',
              },
              {
                badge: badge('public'),
                text: 'Get Validator by Index',
                link: '/tempo/actions/validator.getByIndex',
              },
              {
                badge: badge('public'),
                text: 'Get Validator Count',
                link: '/tempo/actions/validator.getCount',
              },
              {
                badge: badge('public'),
                text: 'Get Validator Owner',
                link: '/tempo/actions/validator.getOwner',
              },
              {
                badge: badge('public'),
                text: 'List Validators',
                link: '/tempo/actions/validator.list',
              },
              {
                badge: badge('wallet'),
                text: 'Add Validator',
                link: '/tempo/actions/validator.add',
              },
              {
                badge: badge('wallet'),
                text: 'Change Validator Owner',
                link: '/tempo/actions/validator.changeOwner',
              },
              {
                badge: badge('wallet'),
                text: 'Change Validator Status',
                link: '/tempo/actions/validator.changeStatus',
              },
              {
                badge: badge('wallet'),
                text: 'Set Next Full DKG Ceremony',
                link: '/tempo/actions/validator.setNextFullDkgCeremony',
              },
              {
                badge: badge('wallet'),
                text: 'Update Validator',
                link: '/tempo/actions/validator.update',
              },
            ],
          },
          {
            text: 'Virtual Address',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Virtual Master Address',
                link: '/tempo/actions/virtualAddress.getMasterAddress',
              },
              {
                badge: badge('public'),
                text: 'Resolve Virtual Address',
                link: '/tempo/actions/virtualAddress.resolve',
              },
              {
                badge: badge('wallet'),
                text: 'Register Virtual Master Address',
                link: '/tempo/actions/virtualAddress.registerMaster',
              },
            ],
          },
          {
            text: 'Wallet',
            collapsed: true,
            items: [
              {
                badge: badge('wallet'),
                text: 'Deposit',
                link: '/tempo/actions/wallet.deposit',
              },
              {
                badge: badge('wallet'),
                text: 'Swap',
                link: '/tempo/actions/wallet.swap',
              },
              {
                badge: badge('wallet'),
                text: 'Transfer',
                link: '/tempo/actions/wallet.transfer',
              },
            ],
          },
          {
            text: 'Zone',
            collapsed: true,
            items: [
              {
                badge: badge('public'),
                text: 'Get Authorization Token Info',
                link: '/tempo/actions/zone.getAuthorizationTokenInfo',
              },
              {
                badge: badge('public'),
                text: 'Get Encryption Key',
                link: '/tempo/actions/zone.getEncryptionKey',
              },
              {
                badge: badge('public'),
                text: 'Get Info',
                link: '/tempo/actions/zone.getZoneInfo',
              },
              {
                badge: badge('public'),
                text: 'Get Withdrawal Fee',
                link: '/tempo/actions/zone.getWithdrawalFee',
              },
              {
                badge: badge('public'),
                text: 'Wait for Tempo Block',
                link: '/tempo/actions/zone.waitForTempoBlock',
              },
              {
                badge: badge('wallet'),
                text: 'Deposit',
                link: '/tempo/actions/zone.deposit',
              },
              {
                badge: badge('wallet'),
                text: 'Make Encrypted Deposit',
                link: '/tempo/actions/zone.encryptedDeposit',
              },
              {
                badge: badge('wallet'),
                text: 'Request Verifiable Withdrawal',
                link: '/tempo/actions/zone.requestVerifiableWithdrawal',
              },
              {
                badge: badge('wallet'),
                text: 'Request Withdrawal',
                link: '/tempo/actions/zone.requestWithdrawal',
              },
              {
                badge: badge('wallet'),
                text: 'Sign Authorization Token',
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
    renderer,
    twoslashOptions: {
      vfsRoot: root,
      compilerOptions: {
        baseUrl: root,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        paths: {
          // Pin Ox to the root workspace installation used by Viem source.
          ox: [`${oxDist}/index.d.ts`],
          'ox/*': [
            `${oxDist}/core/*.d.ts`,
            `${oxDist}/*/index.d.ts`,
            `${oxDist}/*.d.ts`,
          ],
          // Resolve `viem` to live source instead of the built `dist/`.
          viem: [`${root}/src/index.ts`],
          'viem/*': [`${root}/src/*/index.ts`, `${root}/src/*.ts`],
        },
      },
    },
  },
  topNav: [
    { text: 'Docs', link: '/docs' },
    { text: 'Tokens', link: '/tokens', match: '/tokens' },
    { text: 'Tempo', link: '/tempo', match: '/tempo' },
    {
      text: 'Extensions',
      items: [
        { text: 'Account Abstraction', link: '/account-abstraction' },
        { text: 'OP Stack', link: '/op-stack' },
      ],
    },
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
