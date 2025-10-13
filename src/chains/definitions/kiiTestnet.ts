import { defineChain } from '../../utils/chain/defineChain.js'

export const kiiTestnetOro = /*#__PURE__*/ defineChain({
  id: 1336,
  name: 'Kii Testnet Oro',
  network: 'kii-testnet-oro',
  nativeCurrency: {
    name: 'Kii',
    symbol: 'KII',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KiiExplorer',
      url: 'https://explorer.kiichain.io/testnet',
    },
  },
  testnet: true,
})
