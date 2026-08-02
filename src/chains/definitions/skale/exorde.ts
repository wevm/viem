import * as Chain from '../../../core/Chain.js'

export const skaleExorde = /*#__PURE__*/ Chain.from({
  id: 2_139_927_552,
  name: 'Exorde Network',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.skalenodes.com/v1/light-vast-diphda',
    ws: 'wss://mainnet.skalenodes.com/v1/ws/light-vast-diphda',
  },
  blockExplorers: {
    name: 'SKALE Explorer',
    url: 'https://light-vast-diphda.explorer.mainnet.skalenodes.com',
  },
  contracts: {},
})
