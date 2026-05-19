import * as Chain from '../../core/Chain.js'

export const alienx = /*#__PURE__*/ Chain.define({
  id: 10241024n,
  name: 'AlienX Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.alienxchain.io/http'] },
  },
  blockExplorers: {
    default: {
      name: 'AlienX Explorer',
      url: 'https://explorer.alienxchain.io',
    },
  },
  testnet: false,
})
