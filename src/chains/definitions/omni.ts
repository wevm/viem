import * as Chain from '../../core/Chain.js'

export const omni = /*#__PURE__*/ Chain.from({
  id: 166,
  name: 'Omni',
  nativeCurrency: { name: 'Omni', symbol: 'OMNI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.omni.network'],
      webSocket: ['wss://mainnet.omni.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OmniScan',
      url: 'https://omniscan.network',
    },
  },
  testnet: false,
})
