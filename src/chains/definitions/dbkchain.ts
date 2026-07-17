import * as Chain from '../../core/Chain.js'

export const dbkchain = /*#__PURE__*/ Chain.from({
  id: 20_240_603,
  name: 'DBK chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.mainnet.dbkchain.io',
  },
  blockExplorers: {
    name: 'DBK Chain Explorer',
    url: 'https://scan.dbkchain.io',
  },
  testnet: false,
})
