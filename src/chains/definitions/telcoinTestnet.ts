import * as Chain from '../../core/Chain.js'

export const telcoinTestnet = /*#__PURE__*/ Chain.define({
  id: 2017n,
  name: 'Telcoin Adiri Testnet',
  nativeCurrency: { name: 'Telcoin', symbol: 'TEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.telcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'telscan',
      url: 'https://telscan.io',
    },
  },
  testnet: true,
})
