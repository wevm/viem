import * as Chain from '../../core/Chain.js'

export const ultronTestnet = /*#__PURE__*/ Chain.from({
  id: 1230,
  name: 'Ultron Testnet',
  nativeCurrency: { name: 'ULX', symbol: 'ULX', decimals: 18 },
  rpcUrls: {
    http: 'https://ultron-dev.io',
  },
  blockExplorers: {
    name: 'Ultron Scan',
    url: 'https://explorer.ultron-dev.io',
  },
  testnet: true,
})
