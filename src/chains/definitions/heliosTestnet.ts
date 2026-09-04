import * as Chain from '../../core/Chain.js'

export const heliosTestnet = /*#__PURE__*/ Chain.from({
  id: 42000,
  name: 'Helios Testnet',
  nativeCurrency: {
    symbol: 'HLS',
    name: 'Helios',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet1.helioschainlabs.org',
  },
  blockExplorers: {
    name: 'Helios Testnet Explorer',
    url: 'https://explorer.helioschainlabs.org/',
  },
  testnet: true,
})
