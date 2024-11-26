import { defineChain } from '../../utils/chain/defineChain.js'

export const disChain = /*#__PURE__*/ defineChain({
  id: 513100,
  name: 'DisChain',
  nativeCurrency: {
    decimals: 18,
    name: 'DIS',
    symbol: 'DIS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.dischain.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DisChain Explorer',
      url: 'https://www.oklink.com/dis',
    },
  },
})
