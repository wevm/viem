import * as fs from 'node:fs'
import {
  type Config,
  defineConfig,
  Embedding,
  McpSource,
  Reranker,
  Retriever,
} from 'vocs/config'

import pkg from '../src/package.json' with { type: 'json' }

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
  ai: {
    retriever: Retriever.local({
      embedding: Embedding.cloudflare(),
      reranker: Reranker.cloudflare(),
      sources: [{ url: 'https://wagmi.sh/llms.txt', label: 'wagmi', weight: 0.8 }],
    }),
  },
  sidebar: {
    '/docs/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Why Viem', link: '/docs/introduction' },
          { text: 'Installation', link: '/docs/installation' },
          { text: 'Getting Started', link: '/docs/getting-started' },
          { text: 'Platform Compatibility', link: '/docs/compatibility' },
          { text: 'FAQ', link: '/docs/faq' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Migration Guide', link: '/docs/migration-guide' },
          { text: 'Ethers v5 → viem', link: '/docs/ethers-migration' },
          { text: 'TypeScript', link: '/docs/typescript' },
          { text: 'Error Handling', link: '/docs/error-handling' },
          {
            text: 'EIP-7702',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/docs/eip7702' },
              {
                text: 'Contract Writes',
                link: '/docs/eip7702/contract-writes',
              },
              {
                text: 'Sending Transactions',
                link: '/docs/eip7702/sending-transactions',
              },
            ],
          },
          { text: 'Blob Transactions', link: '/docs/guides/blob-transactions' },
        ],
      },
      {
        text: 'Clients & Transports',
        items: [
          { text: 'Introduction', link: '/docs/clients/intro' },
          { text: 'Public Client', link: '/docs/clients/public' },
          { text: 'Wallet Client', link: '/docs/clients/wallet' },
          { text: 'Test Client', link: '/docs/clients/test' },
          { text: 'Build your own Client', link: '/docs/clients/custom' },
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
                text: 'Custom (EIP-1193)',
                link: '/docs/clients/transports/custom',
              },
              {
                text: 'IPC',
                link: '/docs/clients/transports/ipc',
              },
              {
                text: 'Fallback',
                link: '/docs/clients/transports/fallback',
              },
            ],
          },
        ],
      },
      {
        text: 'Public Actions',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/docs/actions/public/introduction' },
          {
            text: 'Access List',
            items: [
              {
                text: 'createAccessList',
                link: '/docs/actions/public/createAccessList',
              },
            ],
          },
          {
            text: 'Account',
            items: [
              {
                text: 'getBalance',
                link: '/docs/actions/public/getBalance',
              },
              {
                text: 'getTransactionCount',
                link: '/docs/actions/public/getTransactionCount',
              },
            ],
          },
          {
            text: 'Block',
            items: [
              { text: 'getBlock', link: '/docs/actions/public/getBlock' },
              {
                text: 'getBlockReceipts',
                link: '/docs/actions/public/getBlockReceipts',
              },
              {
                text: 'getBlockNumber',
                link: '/docs/actions/public/getBlockNumber',
              },
              {
                text: 'getBlockTransactionCount',
                link: '/docs/actions/public/getBlockTransactionCount',
              },
              {
                text: 'simulateBlocks',
                link: '/docs/actions/public/simulateBlocks',
              },
              {
                text: 'watchBlockNumber',
                link: '/docs/actions/public/watchBlockNumber',
              },
              {
                text: 'watchBlocks',
                link: '/docs/actions/public/watchBlocks',
              },
            ],
          },
          {
            text: 'Calls',
            items: [
              { text: 'call', link: '/docs/actions/public/call' },
              {
                text: 'simulateCalls',
                link: '/docs/actions/public/simulateCalls',
              },
            ],
          },
          {
            text: 'Chain',
            items: [
              { text: 'getChainId', link: '/docs/actions/public/getChainId' },
            ],
          },
          {
            text: 'EIP-712',
            items: [
              {
                text: 'getEip712Domain',
                link: '/docs/actions/public/getEip712Domain',
              },
            ],
          },
          {
            text: 'Fee',
            items: [
              {
                text: 'estimateFeesPerGas',
                link: '/docs/actions/public/estimateFeesPerGas',
              },
              {
                text: 'estimateGas',
                link: '/docs/actions/public/estimateGas',
              },
              {
                text: 'estimateMaxPriorityFeePerGas',
                link: '/docs/actions/public/estimateMaxPriorityFeePerGas',
              },
              {
                text: 'getBlobBaseFee',
                link: '/docs/actions/public/getBlobBaseFee',
              },
              {
                text: 'getFeeHistory',
                link: '/docs/actions/public/getFeeHistory',
              },
              {
                text: 'getGasPrice',
                link: '/docs/actions/public/getGasPrice',
              },
            ],
          },
          {
            text: 'Filters & Logs',
            items: [
              {
                text: 'createBlockFilter',
                link: '/docs/actions/public/createBlockFilter',
              },
              {
                text: 'createEventFilter',
                link: '/docs/actions/public/createEventFilter',
              },
              {
                text: 'createPendingTransactionFilter',
                link: '/docs/actions/public/createPendingTransactionFilter',
              },
              {
                text: 'getFilterChanges',
                link: '/docs/actions/public/getFilterChanges',
              },
              {
                text: 'getFilterLogs',
                link: '/docs/actions/public/getFilterLogs',
              },
              {
                text: 'getLogs',
                link: '/docs/actions/public/getLogs',
              },
              {
                text: 'watchEvent',
                link: '/docs/actions/public/watchEvent',
              },
              {
                text: 'uninstallFilter',
                link: '/docs/actions/public/uninstallFilter',
              },
            ],
          },
          {
            text: 'Proof',
            items: [
              {
                text: 'getProof',
                link: '/docs/actions/public/getProof',
              },
            ],
          },
          {
            text: 'Signature',
            items: [
              {
                text: 'verifyMessage',
                link: '/docs/actions/public/verifyMessage',
              },
              {
                text: 'verifyTypedData',
                link: '/docs/actions/public/verifyTypedData',
              },
            ],
          },
          {
            text: 'Token',
            items: [
              { text: 'getAllowance', link: '/tokens/actions/getAllowance' },
              { text: 'getBalance', link: '/tokens/actions/getBalance' },
              { text: 'getMetadata', link: '/tokens/actions/getMetadata' },
              {
                text: 'getTotalSupply',
                link: '/tokens/actions/getTotalSupply',
              },
            ],
          },
          {
            text: 'Transaction',
            items: [
              {
                text: 'prepareTransactionRequest',
                link: '/docs/actions/wallet/prepareTransactionRequest',
              },
              {
                text: 'fillTransaction',
                link: '/docs/actions/public/fillTransaction',
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
                text: 'getTransactionReceipt',
                link: '/docs/actions/public/getTransactionReceipt',
              },
              {
                text: 'sendRawTransaction',
                link: '/docs/actions/wallet/sendRawTransaction',
              },
              {
                text: 'waitForTransactionReceipt',
                link: '/docs/actions/public/waitForTransactionReceipt',
              },
              {
                text: 'watchPendingTransactions',
                link: '/docs/actions/public/watchPendingTransactions',
              },
            ],
          },
        ],
      },
      {
        text: 'Wallet Actions',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/docs/actions/wallet/introduction' },
          {
            text: 'Account',
            items: [
              {
                text: 'getAddresses',
                link: '/docs/actions/wallet/getAddresses',
              },
              {
                text: 'requestAddresses',
                link: '/docs/actions/wallet/requestAddresses',
              },
            ],
          },
          {
            text: 'Assets',
            items: [
              {
                text: 'watchAsset',
                link: '/docs/actions/wallet/watchAsset',
              },
            ],
          },
          {
            text: 'Call Bundles (EIP-5792)',
            items: [
              {
                text: 'getCallsStatus',
                link: '/docs/actions/wallet/getCallsStatus',
              },
              {
                text: 'getCapabilities',
                link: '/docs/actions/wallet/getCapabilities',
              },
              {
                text: 'sendCalls',
                link: '/docs/actions/wallet/sendCalls',
              },
              {
                text: 'sendCallsSync',
                link: '/docs/actions/wallet/sendCallsSync',
              },
              {
                text: 'showCallsStatus',
                link: '/docs/actions/wallet/showCallsStatus',
              },
              {
                text: 'waitForCallsStatus',
                link: '/docs/actions/wallet/waitForCallsStatus',
              },
            ],
          },
          {
            text: 'Chain',
            items: [
              {
                text: 'addChain',
                link: '/docs/actions/wallet/addChain',
              },
              {
                text: 'switchChain',
                link: '/docs/actions/wallet/switchChain',
              },
            ],
          },
          {
            text: 'Data',
            items: [
              {
                text: 'signMessage',
                link: '/docs/actions/wallet/signMessage',
              },
              {
                text: 'signTypedData',
                link: '/docs/actions/wallet/signTypedData',
              },
            ],
          },
          {
            text: 'Permissions',
            items: [
              {
                text: 'getPermissions',
                link: '/docs/actions/wallet/getPermissions',
              },
              {
                text: 'requestPermissions',
                link: '/docs/actions/wallet/requestPermissions',
              },
            ],
          },
          {
            text: 'Token',
            items: [
              { text: 'approve', link: '/tokens/actions/approve' },
              { text: 'transfer', link: '/tokens/actions/transfer' },
            ],
          },
          {
            text: 'Transaction',
            items: [
              {
                text: 'prepareTransactionRequest',
                link: '/docs/actions/wallet/prepareTransactionRequest',
              },
              {
                text: 'sendRawTransaction',
                link: '/docs/actions/wallet/sendRawTransaction',
              },
              {
                text: 'sendRawTransactionSync',
                link: '/docs/actions/wallet/sendRawTransactionSync',
              },
              {
                text: 'sendTransaction',
                link: '/docs/actions/wallet/sendTransaction',
              },
              {
                text: 'sendTransactionSync',
                link: '/docs/actions/wallet/sendTransactionSync',
              },
              {
                text: 'signTransaction',
                link: '/docs/actions/wallet/signTransaction',
              },
            ],
          },
        ],
      },
      {
        text: 'Test Actions',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/docs/actions/test/introduction' },
          {
            text: 'Account',
            items: [
              {
                text: 'impersonateAccount',
                link: '/docs/actions/test/impersonateAccount',
              },
              { text: 'setBalance', link: '/docs/actions/test/setBalance' },
              { text: 'setCode', link: '/docs/actions/test/setCode' },
              { text: 'setNonce', link: '/docs/actions/test/setNonce' },
              {
                text: 'setStorageAt',
                link: '/docs/actions/test/setStorageAt',
              },
              {
                text: 'stopImpersonatingAccount',
                link: '/docs/actions/test/stopImpersonatingAccount',
              },
            ],
          },
          {
            text: 'Block',
            items: [
              { text: 'getAutomine', link: '/docs/actions/test/getAutomine' },
              {
                text: 'increaseTime',
                link: '/docs/actions/test/increaseTime',
              },
              { text: 'mine', link: '/docs/actions/test/mine' },
              {
                text: 'removeBlockTimestampInterval',
                link: '/docs/actions/test/removeBlockTimestampInterval',
              },
              { text: 'setAutomine', link: '/docs/actions/test/setAutomine' },
              {
                text: 'setIntervalMining',
                link: '/docs/actions/test/setIntervalMining',
              },
              {
                text: 'setBlockTimestampInterval',
                link: '/docs/actions/test/setBlockTimestampInterval',
              },
              {
                text: 'setBlockGasLimit',
                link: '/docs/actions/test/setBlockGasLimit',
              },
              {
                text: 'setNextBlockBaseFeePerGas',
                link: '/docs/actions/test/setNextBlockBaseFeePerGas',
              },
              {
                text: 'setNextBlockTimestamp',
                link: '/docs/actions/test/setNextBlockTimestamp',
              },
            ],
          },
          {
            text: 'Node',
            items: [
              { text: 'setCoinbase', link: '/docs/actions/test/setCoinbase' },
              {
                text: 'setMinGasPrice',
                link: '/docs/actions/test/setMinGasPrice',
              },
            ],
          },
          {
            text: 'Settings',
            items: [
              { text: 'reset', link: '/docs/actions/test/reset' },
              {
                text: 'setLoggingEnabled',
                link: '/docs/actions/test/setLoggingEnabled',
              },
              { text: 'setRpcUrl', link: '/docs/actions/test/setRpcUrl' },
            ],
          },
          {
            text: 'State',
            items: [
              { text: 'dumpState', link: '/docs/actions/test/dumpState' },
              { text: 'loadState', link: '/docs/actions/test/loadState' },
              { text: 'revert', link: '/docs/actions/test/revert' },
              { text: 'snapshot', link: '/docs/actions/test/snapshot' },
            ],
          },
          {
            text: 'Transaction',
            items: [
              {
                text: 'dropTransaction',
                link: '/docs/actions/test/dropTransaction',
              },
              {
                text: 'getTxpoolContent',
                link: '/docs/actions/test/getTxpoolContent',
              },
              {
                text: 'getTxpoolStatus',
                link: '/docs/actions/test/getTxpoolStatus',
              },
              {
                text: 'inspectTxpool',
                link: '/docs/actions/test/inspectTxpool',
              },
              {
                text: 'sendUnsignedTransaction',
                link: '/docs/actions/test/sendUnsignedTransaction',
              },
            ],
          },
        ],
      },
      {
        text: 'Accounts',
        collapsed: true,
        items: [
          { text: 'JSON-RPC Account', link: '/docs/accounts/jsonRpc' },
          {
            text: 'Local Accounts',
            link: '/docs/accounts/local',
            items: [
              {
                text: 'Private Key',
                link: '/docs/accounts/local/privateKeyToAccount',
              },
              {
                text: 'Mnemonic',
                link: '/docs/accounts/local/mnemonicToAccount',
              },
              {
                text: 'Hierarchical Deterministic (HD)',
                link: '/docs/accounts/local/hdKeyToAccount',
              },
              { text: 'Custom', link: '/docs/accounts/local/toAccount' },
              {
                text: 'Utilities',
                items: [
                  {
                    text: 'createNonceManager',
                    link: '/docs/accounts/local/createNonceManager',
                  },
                  {
                    text: 'signMessage',
                    link: '/docs/accounts/local/signMessage',
                  },
                  {
                    text: 'signTransaction',
                    link: '/docs/accounts/local/signTransaction',
                  },
                  {
                    text: 'signTypedData',
                    link: '/docs/accounts/local/signTypedData',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        text: 'Chains',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/docs/chains/introduction' },
          {
            text: 'Configuration',
            items: [
              {
                text: 'Fees',
                link: '/docs/chains/fees',
              },
              {
                text: 'Formatters',
                link: '/docs/chains/formatters',
              },
              {
                text: 'Serializers',
                link: '/docs/chains/serializers',
              },
            ],
          },
          {
            text: 'Implementations',
            items: [
              {
                text: 'Celo',
                link: '/docs/chains/celo',
              },
              {
                text: 'OP Stack',
                link: '/op-stack',
              },
              {
                text: 'ZKsync',
                link: '/zksync',
              },
            ],
          },
        ],
      },
      {
        text: 'Contract',
        collapsed: true,
        items: [
          {
            text: 'Contract Instances',
            link: '/docs/contract/getContract',
          },
          {
            text: 'Actions',
            items: [
              {
                text: 'createContractEventFilter',
                link: '/docs/contract/createContractEventFilter',
              },
              {
                text: 'deployContract',
                link: '/docs/contract/deployContract',
              },
              {
                text: 'estimateContractGas',
                link: '/docs/contract/estimateContractGas',
              },
              {
                text: 'getCode',
                link: '/docs/contract/getCode',
              },
              {
                text: 'getContractEvents',
                link: '/docs/contract/getContractEvents',
              },
              {
                text: 'getStorageAt',
                link: '/docs/contract/getStorageAt',
              },
              {
                text: 'multicall',
                link: '/docs/contract/multicall',
              },
              {
                text: 'readContract',
                link: '/docs/contract/readContract',
              },
              {
                text: 'simulateContract',
                link: '/docs/contract/simulateContract',
              },
              {
                text: 'writeContract',
                link: '/docs/contract/writeContract',
              },
              {
                text: 'writeContractSync',
                link: '/docs/contract/writeContractSync',
              },
              {
                text: 'watchContractEvent',
                link: '/docs/contract/watchContractEvent',
              },
            ],
          },
          {
            text: 'Utilities',
            items: [
              {
                text: 'decodeDeployData',
                link: '/docs/contract/decodeDeployData',
              },
              {
                text: 'decodeErrorResult',
                link: '/docs/contract/decodeErrorResult',
              },
              {
                text: 'decodeEventLog',
                link: '/docs/contract/decodeEventLog',
              },
              {
                text: 'decodeFunctionData',
                link: '/docs/contract/decodeFunctionData',
              },
              {
                text: 'decodeFunctionResult',
                link: '/docs/contract/decodeFunctionResult',
              },
              {
                text: 'encodeDeployData',
                link: '/docs/contract/encodeDeployData',
              },
              {
                text: 'encodeErrorResult',
                link: '/docs/contract/encodeErrorResult',
              },
              {
                text: 'encodeEventTopics',
                link: '/docs/contract/encodeEventTopics',
              },
              {
                text: 'encodeFunctionData',
                link: '/docs/contract/encodeFunctionData',
              },
              {
                text: 'encodeFunctionResult',
                link: '/docs/contract/encodeFunctionResult',
              },
              {
                text: 'parseEventLogs',
                link: '/docs/contract/parseEventLogs',
              },
            ],
          },
        ],
      },
      {
        text: 'ENS',
        collapsed: true,
        items: [
          {
            text: 'Actions',
            items: [
              {
                text: 'getEnsAddress',
                link: '/docs/ens/actions/getEnsAddress',
              },
              {
                text: 'getEnsAvatar',
                link: '/docs/ens/actions/getEnsAvatar',
              },
              { text: 'getEnsName', link: '/docs/ens/actions/getEnsName' },
              {
                text: 'getEnsResolver',
                link: '/docs/ens/actions/getEnsResolver',
              },
              {
                text: 'getEnsText',
                link: '/docs/ens/actions/getEnsText',
              },
            ],
          },
          {
            text: 'Utilities',
            items: [
              { text: 'labelhash', link: '/docs/ens/utilities/labelhash' },
              { text: 'namehash', link: '/docs/ens/utilities/namehash' },

              { text: 'normalize', link: '/docs/ens/utilities/normalize' },
            ],
          },
        ],
      },
      {
        text: 'SIWE',
        collapsed: true,
        items: [
          {
            text: 'Actions',
            items: [
              {
                text: 'verifySiweMessage',
                link: '/docs/siwe/actions/verifySiweMessage',
              },
            ],
          },
          {
            text: 'Utilities',
            items: [
              {
                text: 'createSiweMessage',
                link: '/docs/siwe/utilities/createSiweMessage',
              },
              {
                text: 'generateSiweNonce',
                link: '/docs/siwe/utilities/generateSiweNonce',
              },
              {
                text: 'parseSiweMessage',
                link: '/docs/siwe/utilities/parseSiweMessage',
              },
              {
                text: 'validateSiweMessage',
                link: '/docs/siwe/utilities/validateSiweMessage',
              },
            ],
          },
        ],
      },
      {
        text: 'ABI',
        collapsed: true,
        items: [
          {
            text: 'decodeAbiParameters',
            link: '/docs/abi/decodeAbiParameters',
          },
          {
            text: 'encodeAbiParameters',
            link: '/docs/abi/encodeAbiParameters',
          },
          {
            text: 'encodePacked',
            link: '/docs/abi/encodePacked',
          },
          {
            text: 'getAbiItem',
            link: '/docs/abi/getAbiItem',
          },
          {
            text: 'parseAbi',
            link: '/docs/abi/parseAbi',
          },
          {
            text: 'parseAbiItem',
            link: '/docs/abi/parseAbiItem',
          },
          {
            text: 'parseAbiParameter',
            link: '/docs/abi/parseAbiParameter',
          },
          {
            text: 'parseAbiParameters',
            link: '/docs/abi/parseAbiParameters',
          },
        ],
      },
      {
        text: 'EIP-7702',
        collapsed: true,
        items: [
          {
            text: 'Overview',
            link: '/docs/eip7702',
          },
          {
            text: 'Guides',
            items: [
              {
                text: 'Contract Writes',
                link: '/docs/eip7702/contract-writes',
              },
              {
                text: 'Sending Transactions',
                link: '/docs/eip7702/sending-transactions',
              },
            ],
          },
          {
            text: 'Actions',
            items: [
              {
                text: 'getDelegation',
                link: '/docs/eip7702/getDelegation',
              },
              {
                text: 'prepareAuthorization',
                link: '/docs/eip7702/prepareAuthorization',
              },
              {
                text: 'signAuthorization',
                link: '/docs/eip7702/signAuthorization',
              },
            ],
          },
          {
            text: 'Utilities',
            items: [
              {
                text: 'hashAuthorization',
                link: '/docs/eip7702/hashAuthorization',
              },
              {
                text: 'recoverAuthorizationAddress',
                link: '/docs/eip7702/recoverAuthorizationAddress',
              },
              {
                text: 'verifyAuthorization',
                link: '/docs/eip7702/verifyAuthorization',
              },
            ],
          },
        ],
      },
      {
        text: 'Utilities',
        collapsed: true,
        items: [
          {
            text: 'Addresses',
            items: [
              {
                text: 'getAddress',
                link: '/docs/utilities/getAddress',
              },
              {
                text: 'getContractAddress',
                link: '/docs/utilities/getContractAddress',
              },
              {
                text: 'isAddress',
                link: '/docs/utilities/isAddress',
              },
              {
                text: 'isAddressEqual',
                link: '/docs/utilities/isAddressEqual',
              },
            ],
          },
          {
            text: 'Blob',
            items: [
              {
                text: 'blobsToProofs',
                link: '/docs/utilities/blobsToProofs',
              },
              {
                text: 'blobsToCommitments',
                link: '/docs/utilities/blobsToCommitments',
              },
              {
                text: 'commitmentsToVersionedHashes',
                link: '/docs/utilities/commitmentsToVersionedHashes',
              },
              {
                text: 'commitmentToVersionedHash',
                link: '/docs/utilities/commitmentToVersionedHash',
              },
              {
                text: 'fromBlobs',
                link: '/docs/utilities/fromBlobs',
              },
              {
                text: 'sidecarsToVersionedHashes',
                link: '/docs/utilities/sidecarsToVersionedHashes',
              },
              {
                text: 'toBlobs',
                link: '/docs/utilities/toBlobs',
              },
              {
                text: 'toBlobSidecars',
                link: '/docs/utilities/toBlobSidecars',
              },
            ],
          },
          {
            text: 'Chain',
            items: [
              {
                text: 'extractChain',
                link: '/docs/utilities/extractChain',
              },
            ],
          },
          {
            text: 'Data',
            items: [
              {
                text: 'concat',
                link: '/docs/utilities/concat',
              },
              {
                text: 'isBytes',
                link: '/docs/utilities/isBytes',
              },
              {
                text: 'isHex',
                link: '/docs/utilities/isHex',
              },
              {
                text: 'pad',
                link: '/docs/utilities/pad',
              },
              {
                text: 'slice',
                link: '/docs/utilities/slice',
              },
              {
                text: 'size',
                link: '/docs/utilities/size',
              },
              {
                text: 'trim',
                link: '/docs/utilities/trim',
              },
            ],
          },
          {
            text: 'Encoding',
            items: [
              {
                text: 'fromBytes',
                link: '/docs/utilities/fromBytes',
              },
              {
                text: 'fromHex',
                link: '/docs/utilities/fromHex',
              },
              {
                text: 'fromRlp',
                link: '/docs/utilities/fromRlp',
              },
              {
                text: 'toBytes',
                link: '/docs/utilities/toBytes',
              },
              {
                text: 'toHex',
                link: '/docs/utilities/toHex',
              },
              {
                text: 'toRlp',
                link: '/docs/utilities/toRlp',
              },
            ],
          },
          {
            text: 'Hash',
            items: [
              {
                text: 'isHash',
                link: '/docs/utilities/isHash',
              },
              {
                text: 'keccak256',
                link: '/docs/utilities/keccak256',
              },
              {
                text: 'ripemd160',
                link: '/docs/utilities/ripemd160',
              },
              {
                text: 'sha256',
                link: '/docs/utilities/sha256',
              },
              {
                text: 'toEventHash',
                link: '/docs/utilities/toEventHash',
              },
              {
                text: 'toEventSelector',
                link: '/docs/utilities/toEventSelector',
              },
              {
                text: 'toEventSignature',
                link: '/docs/utilities/toEventSignature',
              },
              {
                text: 'toFunctionHash',
                link: '/docs/utilities/toFunctionHash',
              },
              {
                text: 'toFunctionSelector',
                link: '/docs/utilities/toFunctionSelector',
              },
              {
                text: 'toFunctionSignature',
                link: '/docs/utilities/toFunctionSignature',
              },
            ],
          },
          {
            text: 'KZG',
            items: [
              {
                text: 'setupKzg',
                link: '/docs/utilities/setupKzg',
              },
            ],
          },
          {
            text: 'Signature',
            items: [
              {
                text: 'compactSignatureToSignature',
                link: '/docs/utilities/compactSignatureToSignature',
              },
              {
                text: 'hashMessage',
                link: '/docs/utilities/hashMessage',
              },
              {
                text: 'hashTypedData',
                link: '/docs/utilities/hashTypedData',
              },
              {
                text: 'isErc6492Signature',
                link: '/docs/utilities/isErc6492Signature',
              },
              {
                text: 'parseCompactSignature',
                link: '/docs/utilities/parseCompactSignature',
              },
              {
                text: 'parseErc6492Signature',
                link: '/docs/utilities/parseErc6492Signature',
              },
              {
                text: 'parseSignature',
                link: '/docs/utilities/parseSignature',
              },
              {
                text: 'recoverAddress',
                link: '/docs/utilities/recoverAddress',
              },
              {
                text: 'recoverMessageAddress',
                link: '/docs/utilities/recoverMessageAddress',
              },
              {
                text: 'recoverPublicKey',
                link: '/docs/utilities/recoverPublicKey',
              },
              {
                text: 'recoverTransactionAddress',
                link: '/docs/utilities/recoverTransactionAddress',
              },
              {
                text: 'recoverTypedDataAddress',
                link: '/docs/utilities/recoverTypedDataAddress',
              },
              {
                text: 'serializeCompactSignature',
                link: '/docs/utilities/serializeCompactSignature',
              },
              {
                text: 'serializeErc6492Signature',
                link: '/docs/utilities/serializeErc6492Signature',
              },
              {
                text: 'serializeSignature',
                link: '/docs/utilities/serializeSignature',
              },
              {
                text: 'signatureToCompactSignature',
                link: '/docs/utilities/signatureToCompactSignature',
              },
              {
                text: 'verifyMessage',
                link: '/docs/utilities/verifyMessage',
              },
              {
                text: 'verifyTypedData',
                link: '/docs/utilities/verifyTypedData',
              },
            ],
          },
          {
            text: 'Transaction',
            items: [
              {
                text: 'parseTransaction',
                link: '/docs/utilities/parseTransaction',
              },
              {
                text: 'serializeTransaction',
                link: '/docs/utilities/serializeTransaction',
              },
            ],
          },
          {
            text: 'Units',
            items: [
              {
                text: 'formatEther',
                link: '/docs/utilities/formatEther',
              },
              {
                text: 'formatGwei',
                link: '/docs/utilities/formatGwei',
              },
              {
                text: 'formatUnits',
                link: '/docs/utilities/formatUnits',
              },
              {
                text: 'parseEther',
                link: '/docs/utilities/parseEther',
              },
              {
                text: 'parseGwei',
                link: '/docs/utilities/parseGwei',
              },
              {
                text: 'parseUnits',
                link: '/docs/utilities/parseUnits',
              },
            ],
          },
        ],
      },
      {
        text: 'Glossary',
        collapsed: true,
        items: [
          { text: 'Terms', link: '/docs/glossary/terms' },
          { text: 'Types', link: '/docs/glossary/types' },
          { text: 'Errors', link: '/docs/glossary/errors' },
        ],
      },
    ],
    '/account-abstraction': {
      backLink: true,
      items: [
        {
          text: 'Account Abstraction',
          items: [
            {
              text: 'Getting Started',
              link: '/account-abstraction',
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
                  link: '/account-abstraction/accounts/smart/toCoinbaseSmartAccount',
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
                  link: '/account-abstraction/accounts/smart/toSoladySmartAccount',
                },
                {
                  text: 'Trust',
                  link: '/account-abstraction/accounts/smart/toTrustSmartAccount',
                },
                {
                  text: 'Custom',
                  link: '/account-abstraction/accounts/smart/toSmartAccount',
                },
                {
                  text: 'Utilities',
                  items: [
                    {
                      text: 'signMessage',
                      link: '/account-abstraction/accounts/smart/signMessage',
                    },
                    {
                      text: 'signTypedData',
                      link: '/account-abstraction/accounts/smart/signTypedData',
                    },
                    {
                      text: 'signUserOperation',
                      link: '/account-abstraction/accounts/smart/signUserOperation',
                    },
                  ],
                },
              ],
            },
            {
              text: 'WebAuthn Account',
              link: '/account-abstraction/accounts/webauthn',
              items: [
                {
                  text: 'toWebAuthnAccount',
                  link: '/account-abstraction/accounts/webauthn/toWebAuthnAccount',
                },
                {
                  text: 'createWebAuthnCredential',
                  link: '/account-abstraction/accounts/webauthn/createWebAuthnCredential',
                },
              ],
            },
          ],
        },
        {
          text: 'Bundler Actions',
          items: [
            {
              text: 'estimateUserOperationGas',
              link: '/account-abstraction/actions/bundler/estimateUserOperationGas',
            },
            {
              text: 'getChainId',
              link: '/account-abstraction/actions/bundler/getChainId',
            },
            {
              text: 'getSupportedEntryPoints',
              link: '/account-abstraction/actions/bundler/getSupportedEntryPoints',
            },
            {
              text: 'getUserOperation',
              link: '/account-abstraction/actions/bundler/getUserOperation',
            },
            {
              text: 'getUserOperationReceipt',
              link: '/account-abstraction/actions/bundler/getUserOperationReceipt',
            },
            {
              text: 'prepareUserOperation',
              link: '/account-abstraction/actions/bundler/prepareUserOperation',
            },
            {
              text: 'sendUserOperation',
              link: '/account-abstraction/actions/bundler/sendUserOperation',
            },
            {
              text: 'waitForUserOperationReceipt',
              link: '/account-abstraction/actions/bundler/waitForUserOperationReceipt',
            },
          ],
        },
        {
          text: 'Paymaster Actions',
          items: [
            {
              text: 'getPaymasterData',
              link: '/account-abstraction/actions/paymaster/getPaymasterData',
            },
            {
              text: 'getPaymasterStubData',
              link: '/account-abstraction/actions/paymaster/getPaymasterStubData',
            },
          ],
        },
      ],
    },
    '/experimental': {
      backLink: true,
      items: [
        {
          text: 'Experimental',
          items: [
            {
              text: 'Getting Started',
              link: '/experimental',
            },
          ],
        },
        {
          text: 'ERC-7715',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7715/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'grantPermissions',
                  link: '/experimental/erc7715/grantPermissions',
                },
              ],
            },
          ],
        },
        {
          text: 'ERC-7739',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7739/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'signMessage',
                  link: '/experimental/erc7739/signMessage',
                },
                {
                  text: 'signTypedData',
                  link: '/experimental/erc7739/signTypedData',
                },
              ],
            },
            {
              text: 'Utilities',
              items: [
                {
                  text: 'hashMessage',
                  link: '/experimental/erc7739/hashMessage',
                },
                {
                  text: 'hashTypedData',
                  link: '/experimental/erc7739/hashTypedData',
                },
                {
                  text: 'wrapTypedDataSignature',
                  link: '/experimental/erc7739/wrapTypedDataSignature',
                },
              ],
            },
          ],
        },
        {
          text: 'ERC-7811',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7811/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'getAssets',
                  link: '/experimental/erc7811/getAssets',
                },
              ],
            },
          ],
        },
        {
          text: 'ERC-7821',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7821/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'execute',
                  link: '/experimental/erc7821/execute',
                },
                {
                  text: 'executeBatches',
                  link: '/experimental/erc7821/executeBatches',
                },
                {
                  text: 'supportsExecutionMode',
                  link: '/experimental/erc7821/supportsExecutionMode',
                },
              ],
            },
          ],
        },
        {
          text: 'ERC-7846',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7846/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'connect',
                  link: '/experimental/erc7846/connect',
                },
                {
                  text: 'disconnect',
                  link: '/experimental/erc7846/disconnect',
                },
              ],
            },
          ],
        },
        {
          text: 'ERC-7895',
          items: [
            {
              text: 'Client',
              link: '/experimental/erc7895/client',
            },
            {
              text: 'Actions',
              items: [
                {
                  text: 'addSubAccount',
                  link: '/experimental/erc7895/addSubAccount',
                },
              ],
            },
          ],
        },
      ],
    },
    '/op-stack': {
      backLink: true,
      items: [
        {
          text: 'OP Stack',
          items: [
            {
              text: 'Getting Started',
              link: '/op-stack',
            },
            { text: 'Client', link: '/op-stack/client' },
            { text: 'Chains', link: '/op-stack/chains' },
          ],
        },
        {
          text: 'Guides',
          items: [
            {
              text: 'Deposits',
              link: '/op-stack/guides/deposits',
            },
            {
              text: 'Withdrawals',
              link: '/op-stack/guides/withdrawals',
            },
          ],
        },
        {
          text: 'L2 Public Actions',
          items: [
            {
              text: 'buildDepositTransaction',
              link: '/op-stack/actions/buildDepositTransaction',
            },
            {
              text: 'buildProveWithdrawal',
              link: '/op-stack/actions/buildProveWithdrawal',
            },
            {
              text: 'estimateContractL1Fee',
              link: '/op-stack/actions/estimateContractL1Fee',
            },
            {
              text: 'estimateContractL1Gas',
              link: '/op-stack/actions/estimateContractL1Gas',
            },
            {
              text: 'estimateContractTotalFee',
              link: '/op-stack/actions/estimateContractTotalFee',
            },
            {
              text: 'estimateContractTotalGas',
              link: '/op-stack/actions/estimateContractTotalGas',
            },
            {
              text: 'estimateInitiateWithdrawalGas',
              link: '/op-stack/actions/estimateInitiateWithdrawalGas',
            },
            {
              text: 'estimateL1Fee',
              link: '/op-stack/actions/estimateL1Fee',
            },
            {
              text: 'estimateL1Gas',
              link: '/op-stack/actions/estimateL1Gas',
            },
            {
              text: 'estimateOperatorFee',
              link: '/op-stack/actions/estimateOperatorFee',
            },
            {
              text: 'estimateTotalFee',
              link: '/op-stack/actions/estimateTotalFee',
            },
            {
              text: 'estimateTotalGas',
              link: '/op-stack/actions/estimateTotalGas',
            },
          ],
        },
        {
          text: 'L2 Wallet Actions',
          items: [
            {
              text: 'initiateWithdrawal',
              link: '/op-stack/actions/initiateWithdrawal',
            },
          ],
        },
        {
          text: 'L1 Public Actions',
          items: [
            {
              text: 'buildInitiateWithdrawal',
              link: '/op-stack/actions/buildInitiateWithdrawal',
            },
            {
              text: 'estimateDepositTransactionGas',
              link: '/op-stack/actions/estimateDepositTransactionGas',
            },
            {
              text: 'estimateFinalizeWithdrawalGas',
              link: '/op-stack/actions/estimateFinalizeWithdrawalGas',
            },
            {
              text: 'estimateProveWithdrawalGas',
              link: '/op-stack/actions/estimateProveWithdrawalGas',
            },
            {
              text: 'getGame',
              link: '/op-stack/actions/getGame',
            },
            {
              text: 'getGames',
              link: '/op-stack/actions/getGames',
            },
            {
              text: 'getL2Output',
              link: '/op-stack/actions/getL2Output',
            },
            {
              text: 'getTimeToFinalize',
              link: '/op-stack/actions/getTimeToFinalize',
            },
            {
              text: 'getTimeToNextGame',
              link: '/op-stack/actions/getTimeToNextGame',
            },
            {
              text: 'getTimeToNextL2Output',
              link: '/op-stack/actions/getTimeToNextL2Output',
            },
            {
              text: 'getTimeToProve',
              link: '/op-stack/actions/getTimeToProve',
            },
            {
              text: 'getWithdrawalStatus',
              link: '/op-stack/actions/getWithdrawalStatus',
            },
            {
              text: 'waitForNextGame',
              link: '/op-stack/actions/waitForNextGame',
            },
            {
              text: 'waitForNextL2Output',
              link: '/op-stack/actions/waitForNextL2Output',
            },
            {
              text: 'waitToFinalize',
              link: '/op-stack/actions/waitToFinalize',
            },
            {
              text: 'waitToProve',
              link: '/op-stack/actions/waitToProve',
            },
          ],
        },
        {
          text: 'L1 Wallet Actions',
          items: [
            {
              text: 'depositTransaction',
              link: '/op-stack/actions/depositTransaction',
            },
            {
              text: 'finalizeWithdrawal',
              link: '/op-stack/actions/finalizeWithdrawal',
            },
            {
              text: 'proveWithdrawal',
              link: '/op-stack/actions/proveWithdrawal',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            {
              text: 'extractTransactionDepositedLogs',
              link: '/op-stack/utilities/extractTransactionDepositedLogs',
            },
            {
              text: 'extractWithdrawalMessageLogs',
              link: '/op-stack/utilities/extractWithdrawalMessageLogs',
            },
            {
              text: 'getL2TransactionHash',
              link: '/op-stack/utilities/getL2TransactionHash',
            },
            {
              text: 'getL2TransactionHashes',
              link: '/op-stack/utilities/getL2TransactionHashes',
            },
            {
              text: 'getWithdrawals',
              link: '/op-stack/utilities/getWithdrawals',
            },
            {
              text: 'getSourceHash',
              link: '/op-stack/utilities/getSourceHash',
            },
            {
              text: 'opaqueDataToDepositData',
              link: '/op-stack/utilities/opaqueDataToDepositData',
            },
            {
              text: 'getWithdrawalHashStorageSlot',
              link: '/op-stack/utilities/getWithdrawalHashStorageSlot',
            },
            {
              text: 'parseTransaction',
              link: '/op-stack/utilities/parseTransaction',
            },
            {
              text: 'serializeTransaction',
              link: '/op-stack/utilities/serializeTransaction',
            },
          ],
        },
      ],
    },
    '/circle-usdc': {
      backLink: true,
      items: [
        {
          text: 'USDC (Circle)',
          items: [
            {
              text: 'Introduction',
              link: '/circle-usdc',
            },
          ],
        },
        {
          text: 'Guides',
          items: [
            {
              text: 'Integrating USDC',
              link: '/circle-usdc/guides/integrating',
            },
            {
              text: 'Cross Chain Transfers',
              items: [
                {
                  text: 'Overview',
                  link: '/circle-usdc/guides/cross-chain',
                },
                {
                  text: 'CCTP Integration with Bridge Kit',
                  link: '/circle-usdc/guides/bridge-kit',
                },
                {
                  text: 'CCTP Integration',
                  link: '/circle-usdc/guides/manual-cctp',
                },
              ],
            },
            {
              text: 'Paying Gas with USDC',
              link: '/circle-usdc/guides/paymaster',
            },
            {
              text: 'Circle Smart Account',
              link: '/circle-usdc/guides/smart-account',
            },
          ],
        },
      ],
    },
    '/tokens': {
      backLink: true,
      items: [
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
    },
    '/tempo': {
      backLink: true,
      items: [
        {
          text: 'Tempo',
          items: [
            {
              text: 'Getting Started',
              link: '/tempo',
            },
            {
              text: 'Chains',
              link: '/tempo/chains',
            },
            {
              text: 'Tempo Docs & Guides',
              link: 'https://docs.tempo.xyz',
            },
          ],
        },
        {
          text: 'Guides',
          items: [
            {
              text: 'Overview',
              link: '/tempo/guides',
            },
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
                {
                  text: 'Overview',
                  link: '/tempo/transactions',
                },
                {
                  text: 'Batch Calls',
                  link: '/tempo/guides/batch-calls',
                },
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
                {
                  text: 'Sponsor User Fees',
                  link: '/tempo/guides/sponsor-fees',
                },
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
                {
                  text: 'Distribute Token Rewards',
                  link: '/tempo/guides/token-rewards',
                },
              ],
            },
            {
              text: 'Access Keys',
              collapsed: true,
              items: [
                {
                  text: 'Overview',
                  link: '/tempo/guides/access-keys',
                },
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
                {
                  text: 'Overview',
                  link: '/tempo/guides/stablecoin-exchange',
                },
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
                {
                  text: 'Overview',
                  link: '/tempo/guides/virtual-addresses',
                },
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
                {
                  text: 'Overview',
                  link: '/tempo/guides/receive-policies',
                },
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
                {
                  text: 'Overview',
                  link: '/tempo/guides/payment-channels',
                },
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
                  text: 'Overview',
                  link: '/tempo/guides/zones',
                },
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
            {
              text: 'Overview',
              link: '/tempo/accounts',
            },
            {
              text: 'Secp256k1 (Standard Account)',
              link: '/tempo/accounts/account.fromSecp256k1',
            },
            {
              text: 'P256',
              link: '/tempo/accounts/account.fromP256',
            },
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
            {
              text: 'Overview',
              link: '/tempo/actions',
            },
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
                {
                  text: 'isAdmin',
                  link: '/tempo/actions/accessKey.isAdmin',
                },
                {
                  text: 'isWitnessBurned',
                  link: '/tempo/actions/accessKey.isWitnessBurned',
                },
                {
                  text: 'revoke',
                  link: '/tempo/actions/accessKey.revoke',
                },
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
                {
                  text: 'burn',
                  link: '/tempo/actions/amm.burn',
                },
                {
                  text: 'getLiquidityBalance',
                  link: '/tempo/actions/amm.getLiquidityBalance',
                },
                {
                  text: 'getPool',
                  link: '/tempo/actions/amm.getPool',
                },
                {
                  text: 'mint',
                  link: '/tempo/actions/amm.mint',
                },
                {
                  text: 'rebalanceSwap',
                  link: '/tempo/actions/amm.rebalanceSwap',
                },
                {
                  text: 'watchBurn',
                  link: '/tempo/actions/amm.watchBurn',
                },
                {
                  text: 'watchMint',
                  link: '/tempo/actions/amm.watchMint',
                },
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
                {
                  text: 'close',
                  link: '/tempo/actions/channel.close',
                },
                {
                  text: 'getStates',
                  link: '/tempo/actions/channel.getStates',
                },
                {
                  text: 'open',
                  link: '/tempo/actions/channel.open',
                },
                {
                  text: 'requestClose',
                  link: '/tempo/actions/channel.requestClose',
                },
                {
                  text: 'settle',
                  link: '/tempo/actions/channel.settle',
                },
                {
                  text: 'signVoucher',
                  link: '/tempo/actions/channel.signVoucher',
                },
                {
                  text: 'topUp',
                  link: '/tempo/actions/channel.topUp',
                },
                {
                  text: 'withdraw',
                  link: '/tempo/actions/channel.withdraw',
                },
              ],
            },
            {
              text: 'Fee',
              collapsed: true,
              items: [
                {
                  text: 'getUserToken',
                  link: '/tempo/actions/fee.getUserToken',
                },
                {
                  text: 'setUserToken',
                  link: '/tempo/actions/fee.setUserToken',
                },
                {
                  text: 'validateToken',
                  link: '/tempo/actions/fee.validateToken',
                },
                {
                  text: 'watchSetUserToken',
                  link: '/tempo/actions/fee.watchSetUserToken',
                },
              ],
            },
            {
              text: 'Nonce',
              collapsed: true,
              items: [
                {
                  text: 'getNonce',
                  link: '/tempo/actions/nonce.getNonce',
                },
                {
                  text: 'watchNonceIncremented',
                  link: '/tempo/actions/nonce.watchNonceIncremented',
                },
              ],
            },
            {
              text: 'Policy',
              collapsed: true,
              items: [
                {
                  text: 'create',
                  link: '/tempo/actions/policy.create',
                },
                {
                  text: 'getData',
                  link: '/tempo/actions/policy.getData',
                },
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
                {
                  text: 'setAdmin',
                  link: '/tempo/actions/policy.setAdmin',
                },
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
                {
                  text: 'burn',
                  link: '/tempo/actions/receivePolicy.burn',
                },
                {
                  text: 'claim',
                  link: '/tempo/actions/receivePolicy.claim',
                },
                {
                  text: 'get',
                  link: '/tempo/actions/receivePolicy.get',
                },
                {
                  text: 'getBlockedBalance',
                  link: '/tempo/actions/receivePolicy.getBlockedBalance',
                },
                {
                  text: 'set',
                  link: '/tempo/actions/receivePolicy.set',
                },
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
              text: 'Faucet',
              collapsed: true,
              items: [
                {
                  text: 'fund',
                  link: '/tempo/actions/faucet.fund',
                },
              ],
            },
            {
              text: 'Reward',
              collapsed: true,
              items: [
                {
                  text: 'claim',
                  link: '/tempo/actions/reward.claim',
                },
                {
                  text: 'distribute',
                  link: '/tempo/actions/reward.distribute',
                },
                {
                  text: 'getGlobalRewardPerToken',
                  link: '/tempo/actions/reward.getGlobalRewardPerToken',
                },
                {
                  text: 'getPendingRewards',
                  link: '/tempo/actions/reward.getPendingRewards',
                },
                {
                  text: 'getUserRewardInfo',
                  link: '/tempo/actions/reward.getUserRewardInfo',
                },
                {
                  text: 'setRecipient',
                  link: '/tempo/actions/reward.setRecipient',
                },
                {
                  text: 'watchRewardDistributed',
                  link: '/tempo/actions/reward.watchRewardDistributed',
                },
                {
                  text: 'watchRewardRecipientSet',
                  link: '/tempo/actions/reward.watchRewardRecipientSet',
                },
              ],
            },
            {
              text: 'Simulate',
              collapsed: true,
              items: [
                {
                  text: 'simulateBlocks',
                  link: '/tempo/actions/simulate.simulateBlocks',
                },
                {
                  text: 'simulateCalls',
                  link: '/tempo/actions/simulate.simulateCalls',
                },
              ],
            },
            {
              text: 'Stablecoin DEX',
              collapsed: true,
              items: [
                {
                  text: 'buy',
                  link: '/tempo/actions/dex.buy',
                },
                {
                  text: 'cancel',
                  link: '/tempo/actions/dex.cancel',
                },
                {
                  text: 'cancelStale',
                  link: '/tempo/actions/dex.cancelStale',
                },
                {
                  text: 'createPair',
                  link: '/tempo/actions/dex.createPair',
                },
                {
                  text: 'getBalance',
                  link: '/tempo/actions/dex.getBalance',
                },
                {
                  text: 'getBuyQuote',
                  link: '/tempo/actions/dex.getBuyQuote',
                },
                {
                  text: 'getOrder',
                  link: '/tempo/actions/dex.getOrder',
                },
                {
                  text: 'getTickLevel',
                  link: '/tempo/actions/dex.getTickLevel',
                },
                {
                  text: 'getSellQuote',
                  link: '/tempo/actions/dex.getSellQuote',
                },
                {
                  text: 'place',
                  link: '/tempo/actions/dex.place',
                },
                {
                  text: 'placeFlip',
                  link: '/tempo/actions/dex.placeFlip',
                },
                {
                  text: 'sell',
                  link: '/tempo/actions/dex.sell',
                },
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
                {
                  text: 'withdraw',
                  link: '/tempo/actions/dex.withdraw',
                },
              ],
            },
            {
              text: 'Token',
              collapsed: true,
              items: [
                {
                  text: 'approve',
                  link: '/tempo/actions/token.approve',
                },
                {
                  text: 'burn',
                  link: '/tempo/actions/token.burn',
                },
                {
                  text: 'burnBlocked',
                  link: '/tempo/actions/token.burnBlocked',
                },
                {
                  text: 'changeTransferPolicy',
                  link: '/tempo/actions/token.changeTransferPolicy',
                },
                {
                  text: 'create',
                  link: '/tempo/actions/token.create',
                },
                {
                  text: 'getAllowance',
                  link: '/tempo/actions/token.getAllowance',
                },
                {
                  text: 'getBalance',
                  link: '/tempo/actions/token.getBalance',
                },
                {
                  text: 'getMetadata',
                  link: '/tempo/actions/token.getMetadata',
                },
                {
                  text: 'getTotalSupply',
                  link: '/tempo/actions/token.getTotalSupply',
                },
                {
                  text: 'grantRoles',
                  link: '/tempo/actions/token.grantRoles',
                },
                {
                  text: 'hasRole',
                  link: '/tempo/actions/token.hasRole',
                },
                {
                  text: 'mint',
                  link: '/tempo/actions/token.mint',
                },
                {
                  text: 'pause',
                  link: '/tempo/actions/token.pause',
                },
                {
                  text: 'renounceRoles',
                  link: '/tempo/actions/token.renounceRoles',
                },
                {
                  text: 'revokeRoles',
                  link: '/tempo/actions/token.revokeRoles',
                },
                {
                  text: 'setRoleAdmin',
                  link: '/tempo/actions/token.setRoleAdmin',
                },
                {
                  text: 'setSupplyCap',
                  link: '/tempo/actions/token.setSupplyCap',
                },
                {
                  text: 'transfer',
                  link: '/tempo/actions/token.transfer',
                },
                {
                  text: 'unpause',
                  link: '/tempo/actions/token.unpause',
                },
                {
                  text: 'watchAdminRole',
                  link: '/tempo/actions/token.watchAdminRole',
                },
                {
                  text: 'watchApprove',
                  link: '/tempo/actions/token.watchApprove',
                },
                {
                  text: 'watchBurn',
                  link: '/tempo/actions/token.watchBurn',
                },
                {
                  text: 'watchCreate',
                  link: '/tempo/actions/token.watchCreate',
                },
                {
                  text: 'watchMint',
                  link: '/tempo/actions/token.watchMint',
                },
                {
                  text: 'watchRole',
                  link: '/tempo/actions/token.watchRole',
                },
                {
                  text: 'watchTransfer',
                  link: '/tempo/actions/token.watchTransfer',
                },
              ],
            },
            {
              text: 'Validator',
              collapsed: true,
              items: [
                {
                  text: 'add',
                  link: '/tempo/actions/validator.add',
                },
                {
                  text: 'changeOwner',
                  link: '/tempo/actions/validator.changeOwner',
                },
                {
                  text: 'changeStatus',
                  link: '/tempo/actions/validator.changeStatus',
                },
                {
                  text: 'get',
                  link: '/tempo/actions/validator.get',
                },
                {
                  text: 'getByIndex',
                  link: '/tempo/actions/validator.getByIndex',
                },
                {
                  text: 'getCount',
                  link: '/tempo/actions/validator.getCount',
                },
                {
                  text: 'getNextFullDkgCeremony',
                  link: '/tempo/actions/validator.getNextFullDkgCeremony',
                },
                {
                  text: 'getOwner',
                  link: '/tempo/actions/validator.getOwner',
                },
                {
                  text: 'list',
                  link: '/tempo/actions/validator.list',
                },
                {
                  text: 'setNextFullDkgCeremony',
                  link: '/tempo/actions/validator.setNextFullDkgCeremony',
                },
                {
                  text: 'update',
                  link: '/tempo/actions/validator.update',
                },
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
                {
                  text: 'deposit',
                  link: '/tempo/actions/wallet.deposit',
                },
                {
                  text: 'transfer',
                  link: '/tempo/actions/wallet.transfer',
                },
                {
                  text: 'swap',
                  link: '/tempo/actions/wallet.swap',
                },
              ],
            },
            {
              text: 'Zone',
              collapsed: true,
              items: [
                {
                  text: 'deposit',
                  link: '/tempo/actions/zone.deposit',
                },
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
          items: [
            {
              text: 'withRelay',
              link: '/tempo/transports/withRelay',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            {
              text: 'TempoAddress',
              collapsed: true,
              items: [
                {
                  text: 'format',
                  link: '/tempo/utilities/TempoAddress.format',
                },
                {
                  text: 'parse',
                  link: '/tempo/utilities/TempoAddress.parse',
                },
                {
                  text: 'validate',
                  link: '/tempo/utilities/TempoAddress.validate',
                },
              ],
            },
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
                {
                  text: 'from',
                  link: '/tempo/utilities/Storage.from',
                },
                {
                  text: 'memory',
                  link: '/tempo/utilities/Storage.memory',
                },
                {
                  text: 'session',
                  link: '/tempo/utilities/Storage.session',
                },
              ],
            },
          ],
        },
      ],
    },
    '/zksync': {
      backLink: true,
      items: [
        {
          text: 'ZKsync',
          items: [
            {
              text: 'Getting Started',
              link: '/zksync',
            },
            { text: 'Client', link: '/zksync/client' },
            { text: 'Chains', link: '/zksync/chains' },
          ],
        },
        {
          text: 'Smart Accounts',
          items: [
            {
              text: 'Singlesig',
              link: '/zksync/accounts/toSinglesigSmartAccount',
            },
            {
              text: 'Multisig',
              link: '/zksync/accounts/toMultisigSmartAccount',
            },
            {
              text: 'Custom',
              link: '/zksync/accounts/toSmartAccount',
            },
          ],
        },
        {
          text: 'EIP-712 Actions',
          items: [
            {
              text: 'deployContract',
              link: '/zksync/actions/deployContract',
            },
            {
              text: 'sendTransaction',
              link: '/zksync/actions/sendTransaction',
            },
            {
              text: 'signTransaction',
              link: '/zksync/actions/signTransaction',
            },
            {
              text: 'writeContract',
              link: '/zksync/actions/writeContract',
            },
          ],
        },
        {
          text: 'L2 Public Actions',
          items: [
            {
              text: 'estimateGasL1ToL2',
              link: '/zksync/actions/estimateGasL1ToL2',
            },
            {
              text: 'getBlockDetails',
              link: '/zksync/actions/getBlockDetails',
            },
            {
              text: 'getBridgehubContractAddress',
              link: '/zksync/actions/getBridgehubContractAddress',
            },
            {
              text: 'getDefaultBridgeAddress',
              link: '/zksync/actions/getDefaultBridgeAddress',
            },
            {
              text: 'getGasPerPubData',
              link: '/zksync/actions/getGasPerPubData',
            },
            {
              text: 'getL1BatchDetails',
              link: '/zksync/actions/getL1BatchDetails',
            },
            {
              text: 'getL1BatchBlockRange',
              link: '/zksync/actions/getL1BatchBlockRange',
            },
            {
              text: 'getL1BatchNumber',
              link: '/zksync/actions/getL1BatchNumber',
            },
            {
              text: 'getL1TokenAddress',
              link: '/zksync/actions/getL1TokenAddress',
            },
            {
              text: 'getL2TokenAddress',
              link: '/zksync/actions/getL2TokenAddress',
            },
            {
              text: 'getLogProof',
              link: '/zksync/actions/getLogProof',
            },
            {
              text: 'getTransactionDetails',
              link: '/zksync/actions/getTransactionDetails',
            },
            {
              text: 'estimateFee (deprecated)',
              link: '/zksync/actions/estimateFee',
            },
            {
              text: 'getAllBalances (deprecated)',
              link: '/zksync/actions/getAllBalances',
            },
            {
              text: 'getBaseTokenL1Address (deprecated)',
              link: '/zksync/actions/getBaseTokenL1Address',
            },
            {
              text: 'getL1ChainId (deprecated)',
              link: '/zksync/actions/getL1ChainId',
            },
            {
              text: 'getMainContractAddress (deprecated)',
              link: '/zksync/actions/getMainContractAddress',
            },
            {
              text: 'getRawBlockTransaction (deprecated)',
              link: '/zksync/actions/getRawBlockTransactions',
            },
            {
              text: 'getTestnetPaymasterAddress (deprecated)',
              link: '/zksync/actions/getTestnetPaymasterAddress',
            },
          ],
        },
        {
          text: 'L1 Public Actions',
          items: [
            {
              text: 'getL1Allowance',
              link: '/zksync/actions/getL1Allowance',
            },
            {
              text: 'getL1Balance',
              link: '/zksync/actions/getL1Balance',
            },
            {
              text: 'getL1TokenBalance',
              link: '/zksync/actions/getL1TokenBalance',
            },
            {
              text: 'isWithdrawalFinalized',
              link: '/zksync/actions/isWithdrawalFinalized',
            },
          ],
        },
        {
          text: 'L2 Wallet Actions',
          items: [
            {
              text: 'withdraw',
              link: '/zksync/actions/withdraw',
            },
          ],
        },
        {
          text: 'L1 Wallet Actions',
          items: [
            {
              text: 'requestExecute',
              link: '/zksync/actions/requestExecute',
            },
            {
              text: 'finalizeWithdrawal',
              link: '/zksync/actions/finalizeWithdrawal',
            },
            {
              text: 'deposit',
              link: '/zksync/actions/deposit',
            },
            {
              text: 'claimFailedDeposit',
              link: '/zksync/actions/claimFailedDeposit',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            {
              text: 'Paymaster',
              items: [
                {
                  text: 'getApprovalBasedPaymasterInput',
                  link: '/zksync/utilities/paymaster/getApprovalBasedPaymasterInput',
                },
                {
                  text: 'getGeneralPaymasterInput',
                  link: '/zksync/utilities/paymaster/getGeneralPaymasterInput',
                },
              ],
            },
            {
              text: 'Bridge',
              items: [
                {
                  text: 'getL2HashFromPriorityOp',
                  link: '/zksync/utilities/bridge/getL2HashFromPriorityOp',
                },
              ],
            },
            {
              text: 'parseEip712Transaction',
              link: '/zksync/utilities/parseEip712Transaction',
            },
          ],
        },
      ],
    },
  } as const satisfies Config['sidebar'],
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
    // Persist twoslash results inline in the markdown source as
    // `// @twoslash-cache: ...` comments so the cache travels with the repo.
    // This lets cold Vercel builds skip twoslash entirely instead of
    // re-resolving every snippet from scratch.
    inlineCache: true,
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
    { text: 'Tokens', link: '/tokens', match: '/tokens' },
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
