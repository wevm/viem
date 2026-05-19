import * as Chain from '../../core/Chain.js'

export const tenet = /*#__PURE__*/ Chain.define({
  id: 1559n,
  name: 'Tenet',
  network: 'tenet-mainnet',
  nativeCurrency: {
    name: 'TENET',
    symbol: 'TENET',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.tenet.org'] },
  },
  blockExplorers: {
    default: {
      name: 'TenetScan Mainnet',
      url: 'https://tenetscan.io',
      apiUrl: 'https://tenetscan.io/api',
    },
  },
  testnet: false,
})
