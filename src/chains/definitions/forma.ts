import * as Chain from '../../core/Chain.js'

export const forma = /*#__PURE__*/ Chain.from({
  id: 984122,
  name: 'Forma',
  nativeCurrency: {
    symbol: 'TIA',
    name: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.forma.art'],
      webSocket: ['wss://ws.forma.art'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Forma Explorer',
      url: 'https://explorer.forma.art',
    },
  },
  contracts: {
    multicall3: {
      address: '0xd53C6FFB123F7349A32980F87faeD8FfDc9ef079',
      blockCreated: 252705,
    },
  },
})
