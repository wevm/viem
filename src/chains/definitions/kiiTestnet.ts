import * as Chain from '../../core/Chain.js'

export const kiiTestnetOro = /*#__PURE__*/ Chain.from({
  id: 1336,
  name: 'Kii Testnet Oro',
  nativeCurrency: {
    name: 'Kii',
    symbol: 'KII',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com',
  },
  blockExplorers: {
    name: 'KiiExplorer',
    url: 'https://testnet.explorer.kiichain.io',
  },
  testnet: true,
})
