import { defineChain } from '../../utils/chain/defineChain.js'

export const karura = /*#__PURE__*/ defineChain({
  id: 686,
  name: 'Karura',
  network: 'karura',
  nativeCurrency: {
    name: 'Karura',
    symbol: 'KAR',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ['https://eth-rpc-karura.aca-api.network'],
      webSocket: ['wss://eth-rpc-karura.aca-api.network'],
    },
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
