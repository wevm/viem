import { defineChain } from '../../utils/chain/defineChain.js'

export const abey = /*#__PURE__*/ defineChain({
  id: 179,
  name: 'ABEY Mainnet',
  nativeCurrency: { name: 'ABEY', symbol: 'ABEY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.abeychain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Abey Scan',
      url: 'https://abeyscan.com',
    },
  },
  testnet: false,
})
