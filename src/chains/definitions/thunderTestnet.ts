import { defineChain } from '../../utils/chain/defineChain.js'

export const thunderTestnet = /*#__PURE__*/ defineChain({
  id: 997,
  name: '5ireChain Thunder Testnet',
  nativeCurrency: { name: '5ire Token', symbol: '5IRE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.5ire.network'],
    },
  },
  blockExplorers: {
    default: {
      name: '5ireChain Explorer',
      url: 'https://explorer.5ire.network',
    },
  },
  testnet: true,
})
