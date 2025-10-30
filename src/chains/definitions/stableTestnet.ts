import { defineChain } from '../../utils/chain/defineChain.js'

export const stableTestnet = /*#__PURE__*/ defineChain({
  id: 2201,
  name: 'Stable Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDT',
    symbol: 'USDT',
  },
  rpcUrls: {
    default: {
      http: ['https://stable-jsonrpc.testnet.chain0.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout Explorer',
      url: 'https://stable-explorer.testnet.chain0.dev',
      apiUrl: 'https://stable-explorer.testnet.chain0.dev/api/v2',
    },
  },
  testnet: true,
})
