import * as Chain from '../../core/Chain.js'

export const hashkeyTestnet = /*#__PURE__*/ Chain.from({
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey EcoPoints',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hsk.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashKey Chain Testnet explorer',
      url: 'https://testnet-explorer.hsk.xyz',
    },
  },
  testnet: true,
})
