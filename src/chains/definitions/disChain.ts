import * as Chain from '../../core/Chain.js'

export const disChain = /*#__PURE__*/ Chain.from({
  id: 513100,
  name: 'DisChain',
  nativeCurrency: {
    decimals: 18,
    name: 'DIS',
    symbol: 'DIS',
  },
  rpcUrls: {
    http: 'https://rpc.dischain.xyz',
  },
  blockExplorers: {
    name: 'DisChain Explorer',
    url: 'https://www.oklink.com/dis',
  },
})
