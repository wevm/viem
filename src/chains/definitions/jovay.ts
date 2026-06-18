import * as Chain from '../../core/Chain.js'

export const jovay = /*#__PURE__*/ Chain.from({
  id: 5_734_951,
  name: 'Jovay Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.jovay.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Jovay Explorer',
      url: 'https://explorer.jovay.io/l2',
    },
  },
  testnet: false,
})
