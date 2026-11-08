import * as Chain from '../../core/Chain.js'

export const meter = /*#__PURE__*/ Chain.from({
  id: 82,
  name: 'Meter',
  nativeCurrency: {
    decimals: 18,
    name: 'MTR',
    symbol: 'MTR',
  },
  rpcUrls: { http: 'https://rpc.meter.io' },
  blockExplorers: {
    name: 'MeterScan',
    url: 'https://scan.meter.io',
  },
})
