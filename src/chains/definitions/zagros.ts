import * as Chain from '../../core/Chain.js'

export const zagros = /*#__PURE__*/ Chain.from({
  id: 21072026,
  name: 'Zagros',
  nativeCurrency: {
    decimals: 18,
    name: 'Zagros',
    symbol: 'ZAGROS',
  },
  rpcUrls: {
    http: ['https://rpc.zagros.network', 'https://rpc.zagrosnetwork.com'],
    ws: ['wss://rpc.zagros.network/ws'],
  },
  blockExplorers: {
    name: 'ZagrosRadar',
    url: 'https://zagrosradar.com',
    apiUrl: 'https://zagrosradar.com/api/v1',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 51,
    },
  },
})
