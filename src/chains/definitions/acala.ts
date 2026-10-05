import * as Chain from '../../core/Chain.js'

export const acala = /*#__PURE__*/ Chain.from({
  id: 787,
  name: 'Acala',
  nativeCurrency: {
    name: 'Acala',
    symbol: 'ACA',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://eth-rpc-acala.aca-api.network',
    ws: 'wss://eth-rpc-acala.aca-api.network',
  },
  blockExplorers: {
    name: 'Acala Blockscout',
    url: 'https://blockscout.acala.network',
    apiUrl: 'https://blockscout.acala.network/api',
  },
  testnet: false,
})
