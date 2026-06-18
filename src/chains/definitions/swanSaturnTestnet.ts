import * as Chain from '../../core/Chain.js'

export const swanSaturnTestnet = /*#__PURE__*/ Chain.from({
  id: 2024,
  name: 'Swan Saturn Testnet',
  nativeCurrency: { name: 'Swan Ether', symbol: 'sETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://saturn-rpc.swanchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Swan Explorer',
      url: 'https://saturn-explorer.swanchain.io',
    },
  },
  testnet: true,
})
