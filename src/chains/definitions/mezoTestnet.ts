import * as Chain from '../../core/Chain.js'

export const mezoTestnet = /*#__PURE__*/ Chain.from({
  id: 31_611,
  name: 'Mezo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: { http: 'https://rpc.test.mezo.org' },
  blockExplorers: {
    name: 'Mezo Testnet Explorer',
    url: 'https://explorer.test.mezo.org',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3_328_573,
    },
  },
  testnet: true,
})
