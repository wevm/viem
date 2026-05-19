import * as Chain from '../../core/Chain.js'

export const heliosTestnet = /*#__PURE__*/ Chain.define({
  id: 42000n,
  name: 'Helios Testnet',
  network: 'helios-testnet',
  nativeCurrency: {
    symbol: 'HLS',
    name: 'Helios',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet1.helioschainlabs.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Helios Testnet Explorer',
      url: 'https://explorer.helioschainlabs.org/',
    },
  },
  testnet: true,
})
