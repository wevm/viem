import { defineChain } from '../../utils/chain/defineChain.js'

export const saakuru = /*#__PURE__*/ defineChain({
  id: 7225878,
  name: 'Saakuru Mainnet',
  nativeCurrency: { name: 'OAS', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.saakuru.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saakuru Explorer',
      url: 'https://explorer.saakuru.network',
    },
  },
  testnet: false,
})
