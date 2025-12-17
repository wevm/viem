import { defineChain } from '../../utils/chain/defineChain.js'

export const stableMainnet = /*#__PURE__*/ defineChain({
  id: 988,
  name: 'Stable Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'gUSDT',
    symbol: 'gUSDT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.stable.xyz'],
      webSocket: ['wss://rpc.stable.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Stablescan',
      url: 'https://stablescan.xyz',
      apiUrl: 'https://stablescan.xyz/api',
    },
  },
  testnet: false,
})
