import * as Chain from '../../core/Chain.js'

export const matchainTestnet = /*#__PURE__*/ Chain.from({
  id: 699,
  name: 'Matchain Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.matchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Matchain Scan',
      url: 'https://testnet.matchscan.io',
    },
  },
  testnet: true,
})
