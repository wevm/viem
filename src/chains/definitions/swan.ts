import * as Chain from '../../core/Chain.js'

export const swan = /*#__PURE__*/ Chain.define({
  id: 254n,
  name: 'Swan Chain Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet-rpc.swanchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Swan Explorer',
      url: 'https://swanscan.io',
    },
  },
  testnet: false,
})
