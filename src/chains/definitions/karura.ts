import * as Chain from '../../core/Chain.js'

export const karura = /*#__PURE__*/ Chain.define({
  id: 686n,
  name: 'Karura',
  network: 'karura',
  nativeCurrency: {
    name: 'Karura',
    symbol: 'KAR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-karura.aca-api.network'],
      webSocket: ['wss://eth-rpc-karura.aca-api.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Karura Blockscout',
      url: 'https://blockscout.karura.network',
      apiUrl: 'https://blockscout.karura.network/api',
    },
  },
  testnet: false,
})
