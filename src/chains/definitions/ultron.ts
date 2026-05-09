import { defineChain } from '../../utils/chain/defineChain.js'

export const ultron = /*#__PURE__*/ defineChain({
  id: 1231,
  name: 'Ultron Mainnet',
  nativeCurrency: { name: 'ULX', symbol: 'ULX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ultron-rpc.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ultron Scan',
      url: 'https://ulxscan.com',
    },
  },
  testnet: false,
})
