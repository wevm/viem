import { defineChain } from '../../utils/chain/defineChain.js'

export const seiDevnet = /*#__PURE__*/ defineChain({
  id: 713_715,
  name: 'Sei Devnet',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-arctic-1.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com',
    },
  },
  testnet: true,
})
