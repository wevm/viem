import { defineChain } from '../../utils/chain/defineChain.js'

export const scrollTestnet = /*#__PURE__*/ defineChain({
  id: 534_353,
  name: 'Scroll Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://alpha-rpc.scroll.io/l2'],
      webSocket: ['wss://alpha-rpc.scroll.io/l2/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.scroll.io',
      apiUrl: 'https://blockscout.scroll.io/api',
    },
  },
  testnet: true,
})
