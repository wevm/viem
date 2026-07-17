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
    http: 'https://sentry.evm-rpc.injective.network',
    ws: 'wss://sentry.evm-ws.injective.network',
  },
  blockExplorers: {
    name: 'Injective Explorer',
    url: 'https://blockscout.injective.network',
    apiUrl: 'https://blockscout.injective.network/api',
  },
  testnet: false,
})
