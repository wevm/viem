import { defineChain } from '../../utils/chain/defineChain.js'

export const rei = /*#__PURE__*/ defineChain({
  id: 47805,
  name: 'REI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'REI',
    symbol: 'REI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.rei.network'],
      webSocket: ['wss://rpc.rei.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'REI Scan',
      url: 'https://scan.rei.network',
    },
  },
  testnet: false,
})
