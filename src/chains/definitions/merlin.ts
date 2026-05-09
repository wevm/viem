import { defineChain } from '../../utils/chain/defineChain.js'

export const merlin = /*#__PURE__*/ defineChain({
  id: 4200,
  name: 'Merlin',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.merlinchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://scan.merlinchain.io',
      apiUrl: 'https://scan.merlinchain.io/api',
    },
  },
})
