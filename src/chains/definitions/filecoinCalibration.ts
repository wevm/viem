import * as Chain from '../../core/Chain.js'

export const filecoinCalibration = /*#__PURE__*/ Chain.define({
  id: 314_159n,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'testnet filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: { http: ['https://api.calibration.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: {
      name: 'Filscan',
      url: 'https://calibration.filscan.io',
    },
  },
  testnet: true,
})
