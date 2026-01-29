import { defineChain } from '../../utils/chain/defineChain.js'

export const cpchain = /*#__PURE__*/ defineChain({
  id: 86608,
  name: 'CpChain',
  nativeCurrency: {
    decimals: 18,
    name: 'CpChain',
    symbol: 'CP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.cpchain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'CpChain Explorer',
      url: 'https://explorer.cpchain.com',
    },
  },
  testnet: false,
})
