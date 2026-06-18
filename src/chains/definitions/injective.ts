import * as Chain from '../../core/Chain.js'

export const injective = /*#__PURE__*/ Chain.from({
  id: 1776,
  name: 'Injective',
  nativeCurrency: {
    decimals: 18,
    name: 'Injective',
    symbol: 'INJ',
  },
  rpcUrls: {
    default: {
      http: ['https://sentry.evm-rpc.injective.network'],
      webSocket: ['wss://sentry.evm-ws.injective.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Injective Explorer',
      url: 'https://blockscout.injective.network',
      apiUrl: 'https://blockscout.injective.network/api',
    },
  },
  testnet: false,
})
