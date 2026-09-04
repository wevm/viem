import * as Chain from '../../core/Chain.js'

export const omni = /*#__PURE__*/ Chain.from({
  id: 166,
  name: 'Omni',
  nativeCurrency: { name: 'Omni', symbol: 'OMNI', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.omni.network',
    ws: 'wss://mainnet.omni.network',
  },
  blockExplorers: {
    name: 'OmniScan',
    url: 'https://omniscan.network',
  },
  testnet: false,
})
