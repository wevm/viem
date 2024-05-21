import { defineChain } from '../../utils/chain/defineChain.js'

export const l3xTestnet = /*#__PURE__*/ defineChain({
  id: 12325,
  name: 'L3X Protocol Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.l3x.com'],
      webSocket: ['wss://rpc-testnet.l3x.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'L3X Testnet Explorer',
      url: 'https://explorer-testnet.l3x.com',
      apiUrl: 'https://explorer-testnet.l3x.com/api/v2',
    },
  },
  testnet: true,
})
