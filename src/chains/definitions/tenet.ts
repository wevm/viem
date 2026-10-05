import * as Chain from '../../core/Chain.js'

export const tenet = /*#__PURE__*/ Chain.from({
  id: 1559,
  name: 'Tenet',
  nativeCurrency: {
    name: 'TENET',
    symbol: 'TENET',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.tenet.org' },
  blockExplorers: {
    name: 'TenetScan Mainnet',
    url: 'https://tenetscan.io',
    apiUrl: 'https://tenetscan.io/api',
  },
  testnet: false,
})
