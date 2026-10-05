import * as Chain from '../../core/Chain.js'

export const filecoinCalibration = /*#__PURE__*/ Chain.from({
  id: 314_159,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'testnet filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: { http: 'https://api.calibration.node.glif.io/rpc/v1' },
  blockExplorers: {
    name: 'Filscan',
    url: 'https://calibration.filscan.io',
  },
  testnet: true,
})
