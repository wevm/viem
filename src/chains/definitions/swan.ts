import * as Chain from '../../core/Chain.js'

export const swan = /*#__PURE__*/ Chain.from({
  id: 254,
  name: 'Swan Chain Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://mainnet-rpc.swanchain.org' },
  blockExplorers: {
    name: 'Swan Explorer',
    url: 'https://swanscan.io',
  },
  testnet: false,
})
