import * as Chain from '../../core/Chain.js'

export const meterTestnet = /*#__PURE__*/ Chain.define({
  id: 83n,
  name: 'Meter Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MTR',
    symbol: 'MTR',
  },
  rpcUrls: {
    default: { http: ['https://rpctest.meter.io'] },
  },
  blockExplorers: {
    default: {
      name: 'MeterTestnetScan',
      url: 'https://scan-warringstakes.meter.io',
    },
  },
  testnet: true,
})
