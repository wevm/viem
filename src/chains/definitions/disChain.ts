import * as Chain from '../../core/Chain.js'

export const disChain = /*#__PURE__*/ Chain.define({
  id: 513100n,
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
