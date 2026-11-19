import { defineChain } from '../../utils/chain/defineChain.js'

export const zagros = /*#__PURE__*/ defineChain({
  id: 21072026,
  name: 'Zagros',
  nativeCurrency: {
    decimals: 18,
    name: 'Zagros',
    symbol: 'ZAGROS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.zagros.network', 'https://rpc.zagrosnetwork.com'],
      webSocket: ['wss://rpc.zagros.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZagrosRadar',
      url: 'https://zagrosradar.com',
      apiUrl: 'https://zagrosradar.com/api/v1',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 51,
    },
  },
})
