import * as Chain from '../../core/Chain.js'

export const karura = /*#__PURE__*/ Chain.from({
  id: 686,
  name: 'Karura',
  nativeCurrency: {
    name: 'Karura',
    symbol: 'KAR',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://eth-rpc-karura.aca-api.network',
    ws: 'wss://eth-rpc-karura.aca-api.network',
  },
  blockExplorers: {
    name: 'Karura Blockscout',
    url: 'https://blockscout.karura.network',
    apiUrl: 'https://blockscout.karura.network/api',
  },
  testnet: false,
})
