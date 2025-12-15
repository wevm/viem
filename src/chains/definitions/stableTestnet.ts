import { defineChain } from '../../utils/chain/defineChain.js'

export const stableTestnet = /*#__PURE__*/ defineChain({
  id: 2201,
  name: 'Stable Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'gUSDT',
    symbol: 'gUSDT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.stable.xyz'],
      webSocket: ['wss://rpc.testnet.stable.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Stablescan',
      url: 'https://testnet.stablescan.xyz',
      apiUrl: 'https://testnet.stablescan.xyz/api',
    },
  },
  testnet: true,
})
