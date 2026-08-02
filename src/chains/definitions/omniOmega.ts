import * as Chain from '../../core/Chain.js'

export const omniOmega = /*#__PURE__*/ Chain.from({
  id: 164,
  name: 'Omni Omega',
  nativeCurrency: { name: 'Omni', symbol: 'OMNI', decimals: 18 },
  rpcUrls: {
    http: 'https://omega.omni.network',
    ws: 'wss://omega.omni.network',
  },
  blockExplorers: {
    name: 'Omega OmniScan',
    url: 'https://omega.omniscan.network/',
  },
  testnet: true,
})
